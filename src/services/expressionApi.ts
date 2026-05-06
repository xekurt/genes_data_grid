import { chunkArray } from '@/utils/array';
import type { TissueInfo, ExpressionData, GTExTissueResponse, GTExMedianExpressionResponse, GTExGeneResponse } from '@/types/tissue';
import { useCacheStore } from '@/store/useCacheStore';

const GTEX_API_BASE = 'https://gtexportal.org/api/v2';

export const getAvailableTissues = async (signal?: AbortSignal): Promise<TissueInfo[]> => {
  try {
    const response = await fetch(
      `${GTEX_API_BASE}/dataset/tissueSiteDetail?datasetId=gtex_v8`,
      { signal }
    );
    if (!response.ok) throw new Error(`Failed to fetch tissues: ${response.statusText}`);
    const json: GTExTissueResponse = await response.json();
    return json.data.map((t) => ({
      tissueSiteDetailId: t.tissueSiteDetailId,
      tissueSiteDetail: t.tissueSiteDetail,
      colorHex: t.colorHex,
    }));
  } catch (error) {
    if ((error as Error).name === 'AbortError') return [];
    console.error('Error fetching tissues:', error);
    throw error;
  }
};

const resolveVersionedIds = async (ensemblIds: string[], signal?: AbortSignal): Promise<void> => {
  const { ensemblToGencode, setVersionMapping } = useCacheStore.getState();
  const unresolved = ensemblIds.filter((id) => !ensemblToGencode.has(id));
  if (unresolved.length === 0) return;

  const chunks = chunkArray(unresolved, 100);

  await Promise.all(
    chunks.map(async (chunk) => {
      const params = new URLSearchParams({ datasetId: 'gtex_v8' });
      chunk.forEach((id) => params.append('geneId', id));

      try {
        const response = await fetch(`${GTEX_API_BASE}/reference/gene?${params.toString()}`, { signal });
        if (!response.ok) return;
        const json: GTExGeneResponse = await response.json();
        json.data.forEach((gene) => {
          const unversioned = gene.gencodeId.split('.')[0];
          setVersionMapping(unversioned, gene.gencodeId);
        });

        // Mark as resolved even if not found to avoid re-fetching
        chunk.forEach((id) => {
          if (!useCacheStore.getState().ensemblToGencode.has(id)) {
            setVersionMapping(id, '');
          }
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Resolution failed:', err);
        }
      }
    }),
  );
};

export const getExpressionByTissue = async (
  tissueId: string,
  ensemblIds: string[],
  signal?: AbortSignal,
): Promise<ExpressionData> => {
  const { expressionCache, setExpressionCache } = useCacheStore.getState();
  
  const missingIds = ensemblIds.filter(id => !expressionCache.has(`${tissueId}:${id}`));

  if (missingIds.length > 0) {
    await resolveVersionedIds(missingIds, signal);

    const versionedIds = missingIds
      .map((id) => {
        const gencodeId = useCacheStore.getState().ensemblToGencode.get(id);
        if (!gencodeId) {
           setExpressionCache(`${tissueId}:${id}`, null);
        }
        return gencodeId;
      })
      .filter((id): id is string => !!id);

    if (versionedIds.length > 0) {
      const chunks = chunkArray(versionedIds, 100);

      await Promise.all(
        chunks.map(async (chunk) => {
          const params = new URLSearchParams({ 
            datasetId: 'gtex_v8',
            tissueSiteDetailId: tissueId 
          });
          chunk.forEach((id) => params.append('gencodeId', id));

          try {
            const response = await fetch(
              `${GTEX_API_BASE}/expression/medianGeneExpression?${params.toString()}`,
              { signal }
            );
            if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
            
            const json: GTExMedianExpressionResponse = await response.json();
            json.data.forEach((item) => {
              const baseId = useCacheStore.getState().gencodeToEnsembl.get(item.gencodeId) || item.gencodeId.split('.')[0];
              setExpressionCache(`${tissueId}:${baseId}`, item.median);
            });
            
            // Fill in blanks for IDs that were requested but not returned
            chunk.forEach((gencodeId) => {
              const baseId = useCacheStore.getState().gencodeToEnsembl.get(gencodeId) || gencodeId.split('.')[0];
              if (!useCacheStore.getState().expressionCache.has(`${tissueId}:${baseId}`)) {
                setExpressionCache(`${tissueId}:${baseId}`, null);
              }
            });
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              console.error('Fetch failed:', err);
              throw err;
            }
          }
        }),
      );
    }
  }

  const result: ExpressionData = {};
  const currentCache = useCacheStore.getState().expressionCache;
  ensemblIds.forEach(id => {
    const val = currentCache.get(`${tissueId}:${id}`);
    if (val !== undefined && val !== null) {
      result[id] = val;
    }
  });

  return result;
};