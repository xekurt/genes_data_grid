import { useState, useEffect, useRef } from 'react';
import { notifications } from '@mantine/notifications';
import { fetchGencodeMappings, fetchMedianExpressions } from '@/services/expressionApi';
import { useExpressionStore } from '@/store/useExpressionStore';
import { useMappingStore } from '@/store/useMappingStore';
import type { TissueInfo } from '@/types/tissue';

export const useJITExpression = (visibleIds: string[], addedTissues: TissueInfo[]) => {
  const [loadingTissueIds, setLoadingTissueIds] = useState<Set<string>>(new Set());
  
  // Actions are stable and won't trigger re-runs
  const setExpressionData = useExpressionStore(state => state.setExpressionData);
  const setVersionMappings = useMappingStore(state => state.setVersionMappings);

  const fetchingRef = useRef<Record<string, Set<string>>>({});
  const isExpLoading = loadingTissueIds.size > 0;

  useEffect(() => {
    if (addedTissues.length === 0 || visibleIds.length === 0) return;

    const controller = new AbortController();

    const fetchMissingData = async () => {
      const currentExpressionMap = useExpressionStore.getState().expressionDataMap;
      const currentMappings = new Map(useMappingStore.getState().ensemblToGencode);

      const tasks: { tissueId: string; missingEnsemblIds: string[] }[] = [];

      addedTissues.forEach(tissue => {
        const tissueId = tissue.tissueSiteDetailId;
        const currentMap = currentExpressionMap[tissueId] || {};
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
        
        const allMissingEnsemblIds = Array.from(new Set(tasks.flatMap(t => t.missingEnsemblIds)));
        const unknownEnsemblIds = allMissingEnsemblIds.filter(id => !currentMappings.has(id));
        
        if (unknownEnsemblIds.length > 0) {
          const newMappings = await fetchGencodeMappings(unknownEnsemblIds, controller.signal);
          
          
          const mappingsToStore: Record<string, string> = {};
          unknownEnsemblIds.forEach(id => {
            const versioned = newMappings[id] || '';
            mappingsToStore[id] = versioned;
            currentMappings.set(id, versioned);
          });

          setVersionMappings(mappingsToStore);
        }

        
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
  }, [visibleIds, addedTissues, setExpressionData, setVersionMappings]);

  return { isExpLoading, loadingTissueIds };
};
