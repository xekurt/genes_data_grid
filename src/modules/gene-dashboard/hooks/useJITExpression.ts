import { useState, useEffect, useRef } from 'react';
import { notifications } from '@mantine/notifications';
import { getExpressionByTissue } from '@/services/expressionApi';
import { useExpressionStore } from '@/store/useExpressionStore';
import type { TissueInfo } from '@/types/tissue';
import { NO_EXPRESSION_DATA } from '@/constants/expression';

export const useJITExpression = (visibleIds: string[], addedTissues: TissueInfo[]) => {
  const [activeRequests, setActiveRequests] = useState(0);
  const fetchingRef = useRef<Record<string, Set<string>>>({});
  const isExpLoading = activeRequests > 0;

  useEffect(() => {
    if (addedTissues.length === 0 || visibleIds.length === 0) return;

    const controller = new AbortController();

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

      setActiveRequests(prev => prev + 1);
      try {
        const results = await Promise.all(
          tasks.map(async ({ tissueId, missingIds }) => {
            const newData = await getExpressionByTissue(tissueId, missingIds, controller.signal);
            return { tissueId, missingIds, newData };
          })
        );

        results.forEach(({ tissueId, missingIds, newData }) => {
          const updateMap: Record<string, number> = {};
          missingIds.forEach(id => {
            updateMap[id] = newData[id] !== undefined ? newData[id] : NO_EXPRESSION_DATA;
          });
          
          useExpressionStore.getState().setExpressionData(tissueId, updateMap);
        });
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
        setActiveRequests(prev => Math.max(0, prev - 1));
        tasks.forEach(({ tissueId, missingIds }) => {
          missingIds.forEach(id => fetchingRef.current[tissueId]?.delete(id));
        });
      }
    };

    fetchMissingData();

    return () => {
      controller.abort();
    };
  }, [visibleIds, addedTissues]);

  return { isExpLoading };
};
