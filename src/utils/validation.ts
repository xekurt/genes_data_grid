import type { GeneRecord } from '../types/csv';

export const validateGeneRecord = (record: unknown): record is GeneRecord => {
  if (typeof record !== 'object' || record === null) return false;
  
  const r = record as Record<string, unknown>;
  return (
    typeof r.ensembl === 'string' &&
    r.ensembl.length > 0 &&
    typeof r.chromosome === 'number'
  );
};

export const validateGeneRecords = (records: unknown[]): records is GeneRecord[] => {
  if (records.length === 0) return true;
  return validateGeneRecord(records[0]);
};
