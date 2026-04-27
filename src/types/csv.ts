import Papa from 'papaparse';

export interface GeneRecord {
  ensembl: string;
  gene_symbol: string;
  name: string;
  biotype: string;
  chromosome: string;
  seq_region_start: number;
  seq_region_end: number;
}

export interface CSVParseCallbacks<T> {
  onChunk?: (chunk: T[], parser: Papa.Parser) => void;
  onComplete?: (results: Papa.ParseResult<T>) => void;
  onError?: (error: Error) => void;
}
