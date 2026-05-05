import { useState, useEffect, useRef } from 'react';
import { getExpressionByTissue } from '../../../services/expressionApi';
import { useExpressionStore } from '../../../store/useExpressionStore';
import type { TissueInfo } from '../../../types/tissue';

export const useJITExpression = (visibleIds: string[], addedTissues: TissueInfo[]) => {
  const [isExpLoading, setIsExpLoading] = useState(false);
  const fetchingRef = useRef<Record<string, Set<string>>>({});

  useEffect(() => {
    if (addedTissues.length === 0 || visibleIds.length === 0) return;

    const fetchMissingData = async () => {
      const tasks: { tissueId: string; missingIds: string[] }[] = [];
      
      const currentExpressionMap = useExpressionStore.getState().expressionDataMap;

      addedTissues.forEach(tissue => {
        const tissueId = tissue.tissueSiteDetailId;
        const currentMap = currentExpressionMap[tissueId] || {};
        const inFlight = fetchingRef.current[tissueId] || new Set();
        
        const missing = visibleIds.filter(id => 
          currentMap[id] === undefined && !inFlight.has(id)
        );

        if (missing.length > 0) {
          tasks.push({ tissueId, missingIds: missing });
        }
      });

      if (tasks.length === 0) return;

      tasks.forEach(({ tissueId, missingIds }) => {
        if (!fetchingRef.current[tissueId]) fetchingRef.current[tissueId] = new Set();
        missingIds.forEach(id => fetchingRef.current[tissueId].add(id));
      });

      setIsExpLoading(true);
      try {
        const results = await Promise.all(
          tasks.map(async ({ tissueId, missingIds }) => {
            const newData = await getExpressionByTissue(tissueId, missingIds);
            return { tissueId, missingIds, newData };
          })
        );

        results.forEach(({ tissueId, missingIds, newData }) => {
          const updateMap: Record<string, number> = {};
          missingIds.forEach(id => {
            updateMap[id] = newData[id] !== undefined ? newData[id] : -1;
          });
          
          useExpressionStore.getState().setExpressionData(tissueId, updateMap);
        });
      } catch (err) {
        console.error('JIT Fetch failed:', err);
      } finally {
        setIsExpLoading(false);
        tasks.forEach(({ tissueId, missingIds }) => {
          missingIds.forEach(id => fetchingRef.current[tissueId]?.delete(id));
        });
      }
    };

    fetchMissingData();
  }, [visibleIds, addedTissues]);

  return { isExpLoading };
};
