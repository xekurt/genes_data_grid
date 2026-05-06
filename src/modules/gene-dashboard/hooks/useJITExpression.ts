import { useState, useEffect, useRef } from 'react';
import { notifications } from '@mantine/notifications';
import { fetchGencodeMappings, fetchMedianExpressions } from '@/services/expressionApi';
import { useExpressionStore } from '@/store/useExpressionStore';
import { useMappingStore } from '@/store/useMappingStore';
import type { TissueInfo } from '@/types/tissue';

export const useJITExpression = (visibleIds: string[], addedTissues: TissueInfo[]) => {
  const [loadingTissueIds, setLoadingTissueIds] = useState<Set<string>>(new Set());
  
  // Get store actions and state
  const setExpressionData = useExpressionStore(state => state.setExpressionData);
  const expressionDataMap = useExpressionStore(state => state.expressionDataMap);
  const ensemblToGencode = useMappingStore(state => state.ensemblToGencode);
  const setVersionMapping = useMappingStore(state => state.setVersionMapping);

  const fetchingRef = useRef<Record<string, Set<string>>>({});
  const isExpLoading = loadingTissueIds.size > 0;

  useEffect(() => {
    if (addedTissues.length === 0 || visibleIds.length === 0) return;

    const controller = new AbortController();

    const fetchMissingData = async () => {
      const tasks: { tissueId: string; missingEnsemblIds: string[] }[] = [];

      addedTissues.forEach(tissue => {
        const tissueId = tissue.tissueSiteDetailId;
        const currentMap = expressionDataMap[tissueId] || {};
        const inFlight = fetchingRef.current[tissueId] || new Set();
        
        const missing = visibleIds.filter(id => 
          currentMap[id] === undefined && !inFlight.has(id)
        );

        if (missing.length > 0) {
          tasks.push({ tissueId, missingEnsemblIds: missing });
        }
      });

      if (tasks.length === 0) return;

      const taskTissueIds = tasks.map(t => t.tissueId);
      setLoadingTissueIds(prev => {
        const next = new Set(prev);
        taskTissueIds.forEach(id => next.add(id));
        return next;
      });

      tasks.forEach(({ tissueId, missingEnsemblIds }) => {
        if (!fetchingRef.current[tissueId]) fetchingRef.current[tissueId] = new Set();
        missingEnsemblIds.forEach(id => fetchingRef.current[tissueId].add(id));
      });

      try {
        // Create a local map of all current mappings to avoid getState calls
        const currentMappings = new Map(ensemblToGencode);

        // 1. Resolve any unknown Ensembl -> Gencode mappings
        const allMissingEnsemblIds = Array.from(new Set(tasks.flatMap(t => t.missingEnsemblIds)));
        const unknownEnsemblIds = allMissingEnsemblIds.filter(id => !currentMappings.has(id));
        
        if (unknownEnsemblIds.length > 0) {
          const newMappings = await fetchGencodeMappings(unknownEnsemblIds, controller.signal);
          Object.entries(newMappings).forEach(([unversioned, versioned]) => {
            setVersionMapping(unversioned, versioned);
            currentMappings.set(unversioned, versioned);
          });
          
          // Mark IDs that couldn't be resolved to avoid re-fetching
          unknownEnsemblIds.forEach(id => {
            if (!currentMappings.has(id)) {
              setVersionMapping(id, '');
              currentMappings.set(id, '');
            }
          });
        }

        // 2. Fetch expression data for each task
        await Promise.all(
          tasks.map(async ({ tissueId, missingEnsemblIds }) => {
            const gencodeIdsToFetch: string[] = [];
            const ensemblToGencodeForTask = new Map<string, string>();

            missingEnsemblIds.forEach(id => {
              const gencodeId = currentMappings.get(id);
              if (gencodeId) {
                ensemblToGencodeForTask.set(id, gencodeId);
                gencodeIdsToFetch.push(gencodeId);
              }
            });

            if (gencodeIdsToFetch.length === 0) {
              // All missing IDs were unmappable
              const updateMap: Record<string, number | null> = {};
              missingEnsemblIds.forEach(id => { updateMap[id] = null; });
              setExpressionData(tissueId, updateMap);
              return;
            }

            const newData = await fetchMedianExpressions(tissueId, gencodeIdsToFetch, controller.signal);
            
            const updateMap: Record<string, number | null> = {};
            missingEnsemblIds.forEach(id => {
              const gencodeId = ensemblToGencodeForTask.get(id);
              if (gencodeId && newData[gencodeId] !== undefined) {
                updateMap[id] = newData[gencodeId];
              } else {
                updateMap[id] = null;
              }
            });
            
            setExpressionData(tissueId, updateMap);
          })
        );
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('JIT Fetch failed:', err);
          notifications.show({
            title: 'Expression Fetch Failed',
            message: 'Could not fetch data from GTEx API. Please try again later.',
            color: 'red'
          });
        }
      } finally {
        setLoadingTissueIds(prev => {
          const next = new Set(prev);
          taskTissueIds.forEach(id => next.delete(id));
          return next;
        });
        tasks.forEach(({ tissueId, missingEnsemblIds }) => {
          missingEnsemblIds.forEach(id => fetchingRef.current[tissueId]?.delete(id));
        });
      }
    };

    fetchMissingData();

    return () => {
      controller.abort();
    };
  }, [visibleIds, addedTissues, expressionDataMap, ensemblToGencode, setExpressionData, setVersionMapping]);

  return { isExpLoading, loadingTissueIds };
};
