import Papa from 'papaparse';
import { sanitizeHeader } from '../utils/sanitize';
import type { GeneRecord, CSVParseCallbacks } from '../types/csv';

export type { GeneRecord, CSVParseCallbacks };

export const parseCSVService = <T extends Record<string, unknown>>(
  url: string,
  callbacks: CSVParseCallbacks<T>,
  delimiter: string = ';',
) => {
  Papa.parse<T>(url, {
    download: true,
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    delimiter: delimiter,
    worker: true,
    chunkSize: 500 * 1024, // 500KB
    chunk: (results, parser) => {
      const sanitizedData = results.data.map((row) => {
        const sanitizedRow = {} as Record<string, unknown>;
        for (const key in row as Record<string, unknown>) {
          sanitizedRow[sanitizeHeader(key)] = (row as Record<string, unknown>)[
            key
          ];
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
