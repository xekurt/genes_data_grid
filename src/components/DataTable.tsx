import {  memo, useState, useEffect, useMemo } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_RowData,
  type MRT_TableOptions,
} from 'mantine-react-table';

import { useTableURLState } from './useTableURLState';

interface DataTableProps<T extends MRT_RowData> extends Partial<
  MRT_TableOptions<T>
> {
  
  columns: MRT_ColumnDef<T>[];
  
  data: T[];
  
  isLoading?: boolean;
  
  maxHeight?: string | number;
  
  enableURLState?: boolean;
  
  onVisibleIdsChange?: (ids: string[]) => void;
}
function resolveProps<T, P>(prop: T | ((props: P) => T) | undefined, context: P): T | undefined {
  return typeof prop === 'function' ? (prop as (c: P) => T)(context) : prop;
}

const DataTableComponent = <T extends MRT_RowData>({
  columns,
  data,
  isLoading,
  maxHeight = 'calc(100vh - 250px)',
  onVisibleIdsChange,
  enableURLState = true,
  ...rest
}: DataTableProps<T>) => {

  const urlState = useTableURLState();


  const [searchValue, setSearchValue] = useState(urlState.globalFilter || '');
  const [debouncedSearchValue] = useDebouncedValue(searchValue, 300);


  useEffect(() => {
    if (enableURLState) {
      urlState.setGlobalFilter(debouncedSearchValue);
    }
  }, [debouncedSearchValue, enableURLState]);


  useEffect(() => {
    if (urlState.globalFilter !== searchValue) {
      setSearchValue(urlState.globalFilter || '');
    }
  }, [urlState.globalFilter, searchValue]);

  const table = useMantineReactTable({
    // Default optimized settings
    columns,
    data,

    // Virtualization (Best for large datasets)
    enableRowVirtualization: true,
    enableColumnVirtualization: columns.length > 20,
    rowVirtualizerOptions: { overscan: 10 },
    columnVirtualizerOptions: { overscan: 5 },

    // Layout & UI
    enableStickyHeader: true,
    enablePagination: true,
    enableColumnResizing: true,
    enableColumnFilters: false,
    enableGlobalFilter: true,
    
    enableSorting: true,
    enableDensityToggle: true,
    mantineSearchTextInputProps: {
    placeholder: 'Enter Ensembl ID...'},

    initialState: {
      density: 'xs',
      showGlobalFilter: true,
      
      ...rest.initialState,
    },

    mantinePaginationProps: {
      rowsPerPageOptions: ['10', '25', '50', '100'],
      ...rest.mantinePaginationProps,
    },

    // --- State Syncing ---
    onSortingChange: enableURLState
      ? urlState.setSorting
      : rest.onSortingChange,
    onColumnFiltersChange: enableURLState
      ? urlState.setColumnFilters
      : rest.onColumnFiltersChange,
    onGlobalFilterChange: enableURLState
      ? urlState.setGlobalFilter
      : rest.onGlobalFilterChange,
    onPaginationChange: enableURLState
      ? urlState.setPagination
      : rest.onPaginationChange,
    onColumnVisibilityChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(urlState.columnVisibility) : updater;

      // Prevent hiding all columns (Safety check for virtualization and UX)
      const allColumnIds = columns
        .map((c) => c.id || c.accessorKey)
        .filter(Boolean) as string[];

      const visibleColumns = allColumnIds.filter((id) => next[id] !== false);

      if (visibleColumns.length > 0) {
        if (enableURLState) {
          urlState.setColumnVisibility(next);
        } else {
          rest.onColumnVisibilityChange?.(updater);
        }
      }
    },

   

    // Styling
    mantineTableContainerProps: (tableProps) => {
      const passedProps = resolveProps(rest.mantineTableContainerProps, tableProps);

      return {
        ...passedProps,
        style: {
          maxHeight: maxHeight,
          overflow: 'auto',
          position: 'relative',
          ...passedProps?.style,
        },
      };
    },

    mantineTableHeadCellProps: (tableProps) => {
      const passedProps = resolveProps(rest.mantineTableHeadCellProps, tableProps);

      return {
        ...passedProps,
        style: {
          backgroundColor: 'var(--mantine-color-white)',
          zIndex: 1,
          paddingTop: '10px',
          paddingBottom: '10px',
          ...passedProps?.style,
        },
      };
    },

    // Performance
    autoResetPageIndex: false,

    // State
    state: {
      isLoading,
      showProgressBars: isLoading,
      showGlobalFilter: true,
      ...(enableURLState
        ? {
            sorting: urlState.sorting,
            columnFilters: urlState.columnFilters,
            globalFilter: urlState.globalFilter,
            columnVisibility: urlState.columnVisibility,
            pagination: urlState.pagination,
          }
        : {}),
      ...rest.state,
    },

    // Merge any other passed props
    ...rest,
  });

  const visibleRows = table.getRowModel().rows;
  const visibleIds = useMemo(() => 
    visibleRows.map((row) => (row.original as any).ensembl || row.id), 
    [visibleRows]
  );
  
  const [debouncedVisibleIds] = useDebouncedValue(visibleIds, 200);

  useEffect(() => {
    onVisibleIdsChange?.(debouncedVisibleIds);
  }, [debouncedVisibleIds, onVisibleIdsChange]);

  return <MantineReactTable table={table} />;
};

export const DataTable = memo(DataTableComponent) as typeof DataTableComponent;
