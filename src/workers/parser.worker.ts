import Papa from 'papaparse';
import { db } from '../services/db';
import type { GeneRecord } from '../types/csv';
import { sanitizeHeader } from '../utils/sanitize';

self.onmessage = async (e: MessageEvent<{ url: string }>) => {
  const { url } = e.data;
  
  try {
    // Clear existing data before starting new parse
    await db.genes.clear();

    let processedCount = 0;

    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header) => sanitizeHeader(header),
      chunkSize: 1024 * 1024 * 2, // 2MB chunks
      chunk: async (results, parser) => {
        parser.pause();
        const chunk = results.data as GeneRecord[];
        
        // Basic validation: skip rows without ensembl ID
        const validRows = chunk.filter(row => row.ensembl);
        
        if (validRows.length > 0) {
          await db.genes.bulkAdd(validRows);
          processedCount += validRows.length;
        }

        self.postMessage({ type: 'progress', count: processedCount });
        parser.resume();
      },
      complete: async () => {
        self.postMessage({ type: 'complete', totalCount: processedCount });
      },
      error: (error) => {
        self.postMessage({ type: 'error', error: error.message });
      },
    });
  } catch (error) {
    self.postMessage({ type: 'error', error: (error as Error).message });
  }
};
