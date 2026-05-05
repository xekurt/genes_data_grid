import { chunkArray } from '../utils/array';
import type { TissueInfo, ExpressionData, GTExTissueResponse, GTExMedianExpressionResponse, GTExGeneResponse } from '../types/tissue';

const GTEX_API_BASE = 'https://gtexportal.org/api/v2';

export const getAvailableTissues = async (): Promise<TissueInfo[]> => {
  try {
    const response = await fetch(
      `${GTEX_API_BASE}/dataset/tissueSiteDetail?datasetId=gtex_v8`,
    );
    if (!response.ok) throw new Error('Failed to fetch tissues');
    const json: GTExTissueResponse = await response.json();
    return json.data.map((t) => ({
      tissueSiteDetailId: t.tissueSiteDetailId,
      tissueSiteDetail: t.tissueSiteDetail,
      colorHex: t.colorHex,
    }));
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
      } catch (err) {
        console.error('Resolution failed:', err);
      }
    }),
  );
};

export const getExpressionByTissue = async (
  tissueId: string,
  ensemblIds: string[],
): Promise<ExpressionData> => {
  await resolveVersionedIds(ensemblIds);

  const versionedIds = ensemblIds
    .map((id) => ensemblToGencode.get(id))
    .filter((id): id is string => !!id);

  if (versionedIds.length === 0) return {};

  const chunks = chunkArray(versionedIds, 100);

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const params = new URLSearchParams({ 
        datasetId: 'gtex_v8',
        tissueSiteDetailId: tissueId 
      });
      chunk.forEach((id) => params.append('gencodeId', id));

      try {
        const response = await fetch(`${GTEX_API_BASE}/expression/medianGeneExpression?${params.toString()}`);
        if (!response.ok) return {};
        
        const json: GTExMedianExpressionResponse = await response.json();
        const partial: ExpressionData = {};
        json.data.forEach((item) => {
          const baseId = gencodeToEnsembl.get(item.gencodeId) || item.gencodeId.split('.')[0];
          partial[baseId] = item.median;
        });
        return partial;
      } catch (err) {
        console.error('Fetch failed:', err);
        return {};
      }
    }),
  );

  return Object.assign({}, ...results);
};