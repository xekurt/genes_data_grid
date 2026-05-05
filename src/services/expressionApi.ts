import { chunkArray } from '../utils/array';
import type { TissueInfo, ExpressionData, GTExTissueResponse, GTExMedianExpressionResponse, GTExGeneResponse } from '../types/tissue';

const GTEX_API_BASE = 'https://gtexportal.org/api/v2';

let cachedTissues: TissueInfo[] | null = null;

export const getAvailableTissues = async (): Promise<TissueInfo[]> => {
  if (cachedTissues) return cachedTissues;
  try {
    const response = await fetch(
      `${GTEX_API_BASE}/dataset/tissueSiteDetail?datasetId=gtex_v8`,
    );
    if (!response.ok) throw new Error('Failed to fetch tissues');
    const json: GTExTissueResponse = await response.json();
    cachedTissues = json.data.map((t) => ({
      tissueSiteDetailId: t.tissueSiteDetailId,
      tissueSiteDetail: t.tissueSiteDetail,
      colorHex: t.colorHex,
    }));
    return cachedTissues;
  } catch (error) {
    console.error('Error fetching tissues:', error);
    return [];
  }
};

const ensemblToGencode = new Map<string, string>();
const gencodeToEnsembl = new Map<string, string>();

const resolveVersionedIds = async (ensemblIds: string[]): Promise<void> => {
  const unresolved = ensemblIds.filter((id) => !ensemblToGencode.has(id));
  if (unresolved.length === 0) return;

  const chunks = chunkArray(unresolved, 100);

  await Promise.all(
    chunks.map(async (chunk) => {
      const params = new URLSearchParams({ datasetId: 'gtex_v8' });
      chunk.forEach((id) => params.append('geneId', id));

      try {
        const response = await fetch(`${GTEX_API_BASE}/reference/gene?${params.toString()}`);
        if (!response.ok) return;
        const json: GTExGeneResponse = await response.json();
        json.data.forEach((gene) => {
          const unversioned = gene.gencodeId.split('.')[0];
          ensemblToGencode.set(unversioned, gene.gencodeId);
          gencodeToEnsembl.set(gene.gencodeId, unversioned);
        });

        
        chunk.forEach((id) => {
          if (!ensemblToGencode.has(id)) {
            ensemblToGencode.set(id, '');
          }
        });
      } catch (err) {
        console.error('Resolution failed:', err);
      }
    }),
  );
};

const expressionCache = new Map<string, number | null>();

export const getExpressionByTissue = async (
  tissueId: string,
  ensemblIds: string[],
): Promise<ExpressionData> => {
  const missingIds = ensemblIds.filter(id => !expressionCache.has(`${tissueId}:${id}`));

  if (missingIds.length > 0) {
    await resolveVersionedIds(missingIds);

    const versionedIds = missingIds
      .map((id) => {
        const gencodeId = ensemblToGencode.get(id);
        if (!gencodeId) {
           expressionCache.set(`${tissueId}:${id}`, null);
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
            const response = await fetch(`${GTEX_API_BASE}/expression/medianGeneExpression?${params.toString()}`);
            if (!response.ok) throw new Error('Fetch failed');
            
            const json: GTExMedianExpressionResponse = await response.json();
            json.data.forEach((item) => {
              const baseId = gencodeToEnsembl.get(item.gencodeId) || item.gencodeId.split('.')[0];
              expressionCache.set(`${tissueId}:${baseId}`, item.median);
            });
            
            
            chunk.forEach((gencodeId) => {
              const baseId = gencodeToEnsembl.get(gencodeId) || gencodeId.split('.')[0];
              if (!expressionCache.has(`${tissueId}:${baseId}`)) {
                expressionCache.set(`${tissueId}:${baseId}`, null);
              }
            });
          } catch (err) {
            console.error('Fetch failed:', err);
          }
        }),
      );
    }
  }

  const result: ExpressionData = {};
  ensemblIds.forEach(id => {
    const val = expressionCache.get(`${tissueId}:${id}`);
    if (val !== undefined && val !== null) {
      result[id] = val;
    }
  });

  return result;
};