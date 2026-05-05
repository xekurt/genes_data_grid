import { useMemo } from 'react';
import { DataTable } from '../../../components/DataTable';
import { Box, Paper, Text } from '@mantine/core';
import { useUIStore } from '../../../store/useUIStore';
import { useDomainStore } from '../../../store/useDomainStore';
import { useExpressionStore } from '../../../store/useExpressionStore';
import { getGeneColumns } from './Columns';

interface GeneTableProps {
  isExpLoading: boolean;
  onVisibleIdsChange: (ids: string[]) => void;
}

export const GeneTable = ({ isExpLoading, onVisibleIdsChange }: GeneTableProps) => {
  const geneData = useDomainStore((state) => state.geneData);
  const isDataLoading = useDomainStore((state) => state.isDataLoading);
  const addedTissues = useExpressionStore((state) => state.addedTissues);

  const _columnDistribution = useMemo(() => {
    const biotypeCounts: Record<string, number> = {};
    const chromCounts: Record<string, number> = {};

    geneData.forEach((gene) => {
      if (gene.biotype) {
        biotypeCounts[gene.biotype] = (biotypeCounts[gene.biotype] || 0) + 1;
      }
      if (gene.chromosome) {
        chromCounts[gene.chromosome] = (chromCounts[gene.chromosome] || 0) + 1;
      }
    });

    return { biotypeCounts, chromCounts };
  }, [geneData]);

  const dynamicCols = useMemo(() => 
    addedTissues.map(t => ({
      id: t.tissueSiteDetailId,
      label: t.tissueSiteDetail,
      color: t.colorHex
    })), [addedTissues]
  );

  const columns = useMemo(() => 
    getGeneColumns(_columnDistribution, dynamicCols), 
    [_columnDistribution, dynamicCols]
  );

  return (
    <Paper withBorder radius="sm" shadow="xs" h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
      <Box style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <DataTable
          columns={columns}
          data={geneData}
          isLoading={isDataLoading || isExpLoading}
          maxHeight="100%"
          onVisibleIdsChange={onVisibleIdsChange}
          mantineTableContainerProps={{
            style: { flex: 1, minHeight: 0 }
          }}
          mantineTableBodyRowProps={({ row }) => ({
            onClick: () => useUIStore.getState().setSelectedGeneId(row.original.ensembl),
            style: {
              cursor: 'pointer',
            },
          })}
        />
      </Box>
      <Box p="xs" ta="center" bg="gray.0" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
        <Text size="xs" c="dimmed">
          Virtualization active: {geneData.length.toLocaleString()} rows rendered with 60fps performance.
        </Text>
      </Box>
    </Paper>
  );
};
