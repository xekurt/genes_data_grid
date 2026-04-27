import { useState, useCallback, useRef } from 'react';
import { parseCSVService } from '../services/csvParser';
import type { GeneRecord, CSVParseCallbacks } from '../types/csv';


interface UseCSVParserReturn<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  totalRows: number;
  parse: () => void;
  reset: () => void;
}

export const useCSVParser = <T = GeneRecord>(
  url: string,
  options?: Partial<CSVParseCallbacks<T>>
): UseCSVParserReturn<T> => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalRows, setTotalRows] = useState(0);
  
  const isParsing = useRef(false);

  const reset = useCallback(() => {
    setData([]);
    setIsLoading(false);
    setError(null);
    setTotalRows(0);
    isParsing.current = false;
  }, []);

  const parse = useCallback(() => {
    if (isParsing.current) return;
    
    reset();
    setIsLoading(true);
    isParsing.current = true;

    parseCSVService<T>(url, {
      onChunk: (chunk, parser) => {
        setData((prevData) => [...prevData, ...chunk]);
        setTotalRows((prevCount) => prevCount + chunk.length);
        
        if (options?.onChunk) {
          options.onChunk(chunk, parser);
        }
      },
      onComplete: (results) => {
        setIsLoading(false);
        isParsing.current = false;
        
        if (options?.onComplete) {
          options.onComplete(results);
        }
      },
      onError: (err) => {
        setError(err);
        setIsLoading(false);
        isParsing.current = false;
        
        if (options?.onError) {
          options.onError(err);
        }
      },
    });
  }, [url, options, reset]);

  return {
    data,
    isLoading,
    error,
    totalRows,
    parse,
    reset,
  };
};
