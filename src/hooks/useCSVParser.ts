import { useState, useCallback, useRef, useEffect } from 'react';
import { parseCSVService } from '@/services/csvParser';
import type { GeneRecord, CSVParseCallbacks } from '@/types/csv';
import { useDomainStore } from '@/store/useDomainStore';
import { validateGeneRecords } from '@/utils/validation';

interface UseCSVParserReturn {
  error: Error | null;
  parse: () => void;
  reset: () => void;
}

export const useCSVParser = <T extends Record<string, unknown> = GeneRecord>(
  url: string,
  options?: Partial<CSVParseCallbacks<T>>,
): UseCSVParserReturn => {
  const [error, setError] = useState<Error | null>(null);

  const isParsing = useRef(false);
  const optionsRef = useRef(options);
  
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const reset = useCallback(() => {
    useDomainStore.getState().setGeneData([]);
    useDomainStore.getState().setIsDataLoading(false);
    setError(null);
    isParsing.current = false;
  }, []);

  const parse = useCallback(() => {
    if (isParsing.current) return;

    
    reset();
    useDomainStore.getState().setIsDataLoading(true);
    isParsing.current = true;

    const accumulatedData: T[] = [];

    parseCSVService<T>(url, {
      onChunk: (chunk, parser) => {
        accumulatedData.push(...chunk);
        
        if (optionsRef.current?.onChunk) {
          
          optionsRef.current.onChunk(chunk, parser);
        }
      },
      onComplete: (results) => {
         
        if (!validateGeneRecords(accumulatedData)) {
          const err = new Error('Invalid CSV format: Missing required columns (ensembl, chromosome)');
          console.info("error is here")
          setError(err);
          useDomainStore.getState().setIsDataLoading(false);
          isParsing.current = false;
          optionsRef.current?.onError?.(err);
          return;
        }

        useDomainStore.getState().setGeneData(accumulatedData as GeneRecord[]);
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
    parse,
    reset,
  };
};
