import { useState, useCallback, useRef, useEffect } from 'react';
import { useDomainStore } from '@/store/useDomainStore';
import { db } from '@/services/db';

interface UseCSVParserReturn {
  error: Error | null;
  parse: () => void;
  reset: () => void;
}

export const useCSVParser = (url: string): UseCSVParserReturn => {
  const [error, setError] = useState<Error | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const isParsing = useRef(false);

  const reset = useCallback(() => {
    useDomainStore.getState().setViewData([]);
    useDomainStore.getState().setTotalCount(0);
    useDomainStore.getState().setIsDataLoading(false);
    setError(null);
    isParsing.current = false;
  }, []);

  const parse = useCallback(() => {
    if (isParsing.current) return;

    reset();
    useDomainStore.getState().setIsDataLoading(true);
    isParsing.current = true;

    // Initialize worker
    const worker = new Worker(new URL('../workers/parser.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { type, count, totalCount, error: workerError } = e.data;
      if (type === 'progress') {
        useDomainStore.getState().setTotalCount(count);
      } else if (type === 'complete') {
        useDomainStore.getState().setTotalCount(totalCount);
        useDomainStore.getState().setIsDataLoading(false);
        isParsing.current = false;
        worker.terminate();
      } else if (type === 'error') {
        console.log(workerError);
        setError(new Error(workerError));
        useDomainStore.getState().setIsDataLoading(false);
        isParsing.current = false;
        worker.terminate();
      }
    };

    worker.postMessage({ url });
  }, [url, reset]);

  useEffect(() => {
    const init = async () => {
      const dbCount = await db.genes.count();
      if (dbCount > 0) {
        useDomainStore.getState().setTotalCount(dbCount);
      } else {
        parse();
      }
    };
    init();

    return () => {
      workerRef.current?.terminate();
    };
  }, [parse]);

  return {
    error,
    parse,
    reset,
  };
};
