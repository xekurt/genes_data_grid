import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import debounce from 'lodash/debounce';
import type {
  MRT_SortingState,
  MRT_ColumnFiltersState,
  MRT_VisibilityState,
  MRT_PaginationState,
} from 'mantine-react-table';

const getInitialURLState = () => new URLSearchParams(window.location.search);

export const useTableURLState = () => {
  const parseJSON = (val: string | null) => {
    if (!val) return null;
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  };

  const [sorting, setSorting] = useState<MRT_SortingState>(
    () => parseJSON(getInitialURLState().get('sorting')) || [],
  );

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    () => parseJSON(getInitialURLState().get('filters')) || [],
  );

  const [globalFilter, setGlobalFilter] = useState<string>(
    () => getInitialURLState().get('search') || '',
  );

  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    () => parseJSON(getInitialURLState().get('visibility')) || {},
  );

  const [pagination, setPagination] = useState<MRT_PaginationState>(
    () =>
      parseJSON(getInitialURLState().get('pagination')) || {
        pageIndex: 0,
        pageSize: 10,
      },
  );
 

  const updateURL = useCallback(() => {
    const params = new URLSearchParams(window.location.search);

    if (sorting.length > 0) {
      params.set('sorting', JSON.stringify(sorting));
    } else {
      params.delete('sorting');
    }

    if (columnFilters.length > 0) {
      params.set('filters', JSON.stringify(columnFilters));
    } else {
      params.delete('filters');
    }

    if (globalFilter) {
      params.set('search', globalFilter);
    } else {
      params.delete('search');
    }

    if (Object.keys(columnVisibility).length > 0) {
      params.set('visibility', JSON.stringify(columnVisibility));
    } else {
      params.delete('visibility');
    }

    if (pagination.pageIndex !== 0 || pagination.pageSize !== 10) {
      params.set('pagination', JSON.stringify(pagination));
    } else {
      params.delete('pagination');
    }

    const newSearch = params.toString();
    const currentSearch = window.location.search.replace('?', '');

    if (newSearch !== currentSearch) {
      const newUrl = `${window.location.pathname}${
        newSearch ? '?' + newSearch : ''
      }`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [sorting, columnFilters, globalFilter, columnVisibility, pagination]);

  const updateURLRef = useRef(updateURL);
  useEffect(() => {
    updateURLRef.current = updateURL;
  }, [updateURL]);

  const debouncedExecutor = useMemo(
    () => debounce((fn: () => void) => fn(), 500),
    [],
  );

  useEffect(() => {
    debouncedExecutor(updateURL);
    return () => debouncedExecutor.cancel();
  }, [debouncedExecutor, updateURL]);

  useEffect(() => {
    const handlePopState = () => {
      debouncedExecutor.cancel();
      const params = new URLSearchParams(window.location.search);

      const s = parseJSON(params.get('sorting'));
      setSorting(s || []);

      const f = parseJSON(params.get('filters'));
      setColumnFilters(f || []);

      const g = params.get('search');
      setGlobalFilter(g || '');

      const v = parseJSON(params.get('visibility'));
      setColumnVisibility(v || {});

      const p = parseJSON(params.get('pagination'));
      setPagination(p || { pageIndex: 0, pageSize: 10 });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      debouncedExecutor.cancel();
    };
  }, [debouncedExecutor]);

  return {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    columnVisibility,
    setColumnVisibility,
    pagination,
    setPagination,
  };
};
