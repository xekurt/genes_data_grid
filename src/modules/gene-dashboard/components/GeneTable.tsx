import { useCallback, useMemo } from 'react';
import { DataTable } from '@/components/DataTable';
import { Box, Paper, Text } from '@mantine/core';
import { useUIStore } from '@/store/useUIStore';
import { useDomainStore } from '@/store/useDomainStore';
import { useExpressionStore } from '@/store/useExpressionStore';
import { getGeneColumns } from './Columns';
import type { GeneRecord } from '@/types/csv';
import { useTableURLState } from '@/components/useTableURLState';
import { useGeneQuery } from '../hooks/useGeneQuery';

interface GeneTableProps {
  loadingTissueIds: Set<string>;
  onVisibleIdsChange: (ids: string[]) => void;
}

export const GeneTable = ({ loadingTissueIds, onVisibleIdsChange }: GeneTableProps) => {
  const urlState = useTableURLState();
  const viewData = useDomainStore((state) => state.viewData);
  const totalCount = useDomainStore((state) => state.totalCount);
  const isDataLoading = useDomainStore((state) => state.isDataLoading);
  const addedTissues = useExpressionStore((state) => state.addedTissues);
  const selectedGeneId = useUIStore((state) => state.selectedGeneId);

  // Hook into the database
  useGeneQuery({
    pagination: urlState.pagination,
    sorting: urlState.sorting,
    columnFilters: urlState.columnFilters,
    globalFilter: urlState.globalFilter,
  });

  const _columnDistribution = useMemo(() => {
    const biotypeCounts: Record<string, number> = {};
    const chromCounts: Record<string, number> = {};

    viewData.forEach((gene) => {
      if (gene.biotype) {
        biotypeCounts[gene.biotype] = (biotypeCounts[gene.biotype] || 0) + 1;
      }
      if (gene.chromosome) {
        chromCounts[gene.chromosome] = (chromCounts[gene.chromosome] || 0) + 1;
      }
    });

    return { biotypeCounts, chromCounts };
  }, [viewData]);

  const dynamicCols = useMemo(() => 
    addedTissues.map(t => ({
      id: t.tissueSiteDetailId,
      label: t.tissueSiteDetail,
      color: t.colorHex
    })), [addedTissues]
  );

  const columns = useMemo(() => 
    getGeneColumns(_columnDistribution, dynamicCols, loadingTissueIds), 
    [_columnDistribution, dynamicCols, loadingTissueIds]
  );
  const handleRowClick = useCallback((ensemblId: string) => {
    useUIStore.getState().setSelectedGeneId(ensemblId);
  }, []);

  const getRowProps = useCallback(({ row }: { row: { original: GeneRecord } }) => ({
    onClick: () => handleRowClick(row.original.ensembl),
    style: {
      cursor: 'pointer',
      ...(row.original.ensembl === selectedGeneId ? {
        boxShadow: 'inset 0 0 0 2px var(--mantine-color-blue-filled)',
        backgroundColor: 'var(--mantine-color-blue-light)'
      } : {})
    },
  }), [handleRowClick, selectedGeneId]);

  return (
    <Paper withBorder radius="sm" shadow="xs" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <Box style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <DataTable
          columns={columns}
          data={viewData}
          idAccessor="ensembl"
          isLoading={isDataLoading}
          rowCount={totalCount}
          urlState={urlState}
          onVisibleIdsChange={onVisibleIdsChange}
          mantinePaperProps={{
            style: { display: 'flex', flexDirection: 'column', height: '100%' }
          }}
          mantineTableContainerProps={{
            style: { flex: 1, minHeight: 0 }
          }}
          mantineTableBodyRowProps={getRowProps}
        />
      </Box>
      <Box p="xs" ta="center" bg="gray.0" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
        <Text size="xs" c="dimmed">
          Virtualization active: {totalCount.toLocaleString()} total rows in database.
        </Text>
      </Box>
    </Paper>
  );
};
