import { Badge, Text, Group, Box, Stack, Loader } from '@mantine/core';
import type { MRT_ColumnDef } from 'mantine-react-table';
import type { GeneRecord } from '@/types/csv';
import { getCategoryColor } from '@/utils/color';
import { CategoryHistogram } from './GeneTableUtils';
import { ExpressionCell } from './ExpressionCell';

export const getGeneColumns = (
  distribution: {
    biotypeCounts: Record<string, number>;
    chromCounts: Record<string, number>;
  },
  dynamicColumns: { id: string; label: string; color?: string }[] = [],
  loadingTissueIds: Set<string> = new Set()
): MRT_ColumnDef<GeneRecord>[] => [
  {
    accessorKey: 'ensembl',
    header: 'Ensembl ID',
    size: 180,
    Cell: ({ cell }) => (
      <Text size="xs" fw={500} style={{ fontFamily: 'monospace' }} c="blue.7">
        {cell.getValue<string>()}
      </Text>
    ),
  },
  {
    accessorKey: 'gene_symbol',
    header: 'Symbol',
    size: 120,
    Cell: ({ cell }) => (
      <Text fw={700} size="sm">
        {cell.getValue<string>() || '-'}
      </Text>
    ),
  },
  {
    accessorKey: 'chromosome',
    header: 'Chromosome',
    size: 140,
    minSize: 120,
    Header: () => (
      <Stack gap={0}>
        <Text size="xs" fw={700}>
          Chromosome
        </Text>
        <CategoryHistogram counts={distribution.chromCounts} />
      </Stack>
    ),
    Cell: ({ cell }) => {
      const val = cell.getValue<string>();
      return (
        <Group gap="xs" wrap="nowrap">
          <Box
            w={8}
            h={8}
            bg={getCategoryColor(val)}
            style={{ borderRadius: '2px' }}
          />
          <Badge size="xs" color="gray" variant="outline">
            {val}
          </Badge>
        </Group>
      );
    },
  },
  {
    accessorKey: 'biotype',
    header: 'Biotype',
    size: 200,
    Header: () => (
      <Stack gap={0}>
        <Text size="xs" fw={700}>
          Biotype
        </Text>
        <CategoryHistogram counts={distribution.biotypeCounts} />
      </Stack>
    ),
    Cell: ({ cell }) => {
      const val = cell.getValue<string>();
      return (
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <Box
            w={8}
            h={8}
            bg={getCategoryColor(val)}
            style={{ borderRadius: '2px', marginTop: '6px' }}
          />
          <Text size="xs" c="dimmed" style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.2 }}>
            {val}
          </Text>
        </Group>
      );
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    size: 350,
    minSize: 200,
    Cell: ({ cell }) => (
      <Text size="sm" style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.3 }}>
        {cell.getValue<string>()}
      </Text>
    ),
  },
  ...dynamicColumns.map((col) => ({
    id: `expr_${col.id}`,
    header: col.label,
    size: 150,
    Header: () => (
      <Group gap="xs" wrap="nowrap">
        {loadingTissueIds.has(col.id) ? (
          <Loader size={10} color="blue" />
        ) : (
          <Box
            w={10}
            h={10}
            bg={`#${col.color || 'blue'}`}
            style={{ borderRadius: '50%' }}
          />
        )}
        <Text size="xs" fw={700}>
          {col.label}
        </Text>
      </Group>
    ),
    Cell: ({ row }) => (
      <ExpressionCell 
        ensemblId={row.original.ensembl} 
        tissueId={col.id} 
        color={col.color} 
        isLoading={loadingTissueIds.has(col.id)} 
      />
    ),
  } as MRT_ColumnDef<GeneRecord>)),
];
