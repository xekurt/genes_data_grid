import { useEffect, useState } from 'react';
import { db } from '@/services/db';
import { useDomainStore } from '@/store/useDomainStore';
import type { MRT_PaginationState, MRT_SortingState, MRT_ColumnFiltersState } from 'mantine-react-table';

interface UseGeneQueryProps {
  pagination: MRT_PaginationState;
  sorting: MRT_SortingState;
  columnFilters: MRT_ColumnFiltersState;
  globalFilter: string;
}

export const useGeneQuery = ({
  pagination,
  sorting,
  columnFilters,
  globalFilter,
}: UseGeneQueryProps) => {
  const setViewData = useDomainStore((state) => state.setViewData);
  const setTotalCount = useDomainStore((state) => state.setTotalCount);
  const setIsDataLoading = useDomainStore((state) => state.setIsDataLoading);
  const totalCount = useDomainStore((state) => state.totalCount);

  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        let collection = db.genes.toCollection();

        if (globalFilter) {
          collection = db.genes.where('gene_symbol').startsWithIgnoreCase(globalFilter)
            .or('ensembl').startsWithIgnoreCase(globalFilter);
        }


        if (sorting.length > 0) {
          const { id, desc } = sorting[0];

          const sortedCollection = db.genes.orderBy(id);
          if (desc) {
             collection = sortedCollection.reverse();
          } else {
             collection = sortedCollection;
          }
        }


        const count = await collection.count();
        setTotalCount(count);


        const { pageIndex, pageSize } = pagination;
        const results = await collection
          .offset(pageIndex * pageSize)
          .limit(pageSize)
          .toArray();

        setViewData(results);
      } catch (error) {
        console.error('Failed to query Dexie:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, [pagination, sorting, columnFilters, globalFilter, setViewData, setTotalCount, setIsDataLoading]);

  return { totalCount };
};
