import Papa from 'papaparse';

export type GeneRecord = {
  ensembl: string;
  gene_symbol: string;
  name: string;
  biotype: string;
  chromosome: number;
  seq_region_start: number;
  seq_region_end: number;
};

export type EnrichedGeneRecord = GeneRecord & Record<`expr_${string}`, number | undefined>;

export interface CSVParseCallbacks<T> {
  onChunk?: (chunk: T[], parser: Papa.Parser) => void;
  onComplete?: (results: Papa.ParseResult<T>) => void;
  onError?: (error: Error) => void;
}
