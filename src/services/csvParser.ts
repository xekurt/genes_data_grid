import Papa from 'papaparse';
import { sanitizeHeader } from '../utils/sanitize';
import type { GeneRecord, CSVParseCallbacks } from '../types/csv';

export type { GeneRecord, CSVParseCallbacks };


export const parseCSVService = <T = GeneRecord>(
  url: string,
  callbacks: CSVParseCallbacks<T>,
  delimiter: string = ';'
) => {
  Papa.parse<any>(url, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    delimiter: delimiter,
    worker: true,
    chunk: (results, parser) => {
      const sanitizedData = results.data.map((row: any) => {
        const sanitizedRow: any = {};
        for (const key in row) {
          sanitizedRow[sanitizeHeader(key)] = row[key];
        }
        return sanitizedRow as T;
      });

      if (callbacks.onChunk) {
        callbacks.onChunk(sanitizedData, parser);
      }
    },
    complete: (results) => {
      if (callbacks.onComplete) {
        callbacks.onComplete(results);
      }
    },
    error: (error) => {
      if (callbacks.onError) {
        callbacks.onError(new Error(error.message));
      }
    },
  });
};


