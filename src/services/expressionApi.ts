import { chunkArray } from '@/utils/array';
import type { 
  TissueInfo, 
  GTExTissueResponse, 
  GTExMedianExpressionResponse, 
  GTExGeneResponse 
} from '@/types/tissue';

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

export const fetchGencodeMappings = async (
  ensemblIds: string[],
  signal?: AbortSignal
): Promise<Record<string, string>> => {
  const mappings: Record<string, string> = {};
  const chunks = chunkArray(ensemblIds, 100);

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
          mappings[unversioned] = gene.gencodeId;
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Mapping fetch failed:', err);
        }
      }
    })
  );

  return mappings;
};

export const fetchMedianExpressions = async (
  tissueId: string,
  gencodeIds: string[],
  signal?: AbortSignal
): Promise<Record<string, number>> => {
  const results: Record<string, number> = {};
  const chunks = chunkArray(gencodeIds, 100);

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
          results[item.gencodeId] = item.median;
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Expression fetch failed:', err);
          throw err;
        }
      }
    })
  );

  return results;
};