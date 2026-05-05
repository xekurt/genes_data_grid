import { useState, useCallback, useRef } from 'react';
import { parseCSVService } from '../services/csvParser';
import type { GeneRecord, CSVParseCallbacks } from '../types/csv';
import { useDomainStore } from '../store/useDomainStore';

interface UseCSVParserReturn<T> {
  error: Error | null;
  totalRows: number;
  parse: () => void;
  reset: () => void;
}

export const useCSVParser = <T extends Record<string, unknown> = GeneRecord>(
  url: string,
  options?: Partial<CSVParseCallbacks<T>>,
): UseCSVParserReturn<T> => {
  const [error, setError] = useState<Error | null>(null);
  const [totalRows, setTotalRows] = useState(0);

  const isParsing = useRef(false);
  const optionsRef = useRef(options);
  
  // Keep optionsRef up to date without triggering re-renders
  optionsRef.current = options;

  const reset = useCallback(() => {
    useDomainStore.getState().setGeneData([]);
    useDomainStore.getState().setIsDataLoading(false);
    setError(null);
    setTotalRows(0);
    isParsing.current = false;
  }, []);

  const parse = useCallback(() => {
    if (isParsing.current) return;

    reset();
    useDomainStore.getState().setIsDataLoading(true);
    isParsing.current = true;

    let accumulatedData: T[] = [];

    parseCSVService<T>(url, {
      onChunk: (chunk, parser) => {
        accumulatedData = [...accumulatedData, ...chunk];
        setTotalRows((prevCount) => prevCount + chunk.length);

        if (optionsRef.current?.onChunk) {
          optionsRef.current.onChunk(chunk, parser);
        }
      },
      onComplete: (results) => {
        useDomainStore.getState().setGeneData(accumulatedData as unknown as GeneRecord[]);
        useDomainStore.getState().setIsDataLoading(false);
        isParsing.current = false;

        if (optionsRef.current?.onComplete) {
          optionsRef.current.onComplete(results);
        }
      },
      onError: (err) => {
        setError(err);
        useDomainStore.getState().setIsDataLoading(false);
        isParsing.current = false;

        if (optionsRef.current?.onError) {
          optionsRef.current.onError(err);
        }
      },
    });
  }, [url, reset]);

  return {
    error,
    totalRows,
    parse,
    reset,
  };
};
