import { Paper, Title, Text, Stack, Group, Badge, Divider, Grid, Box } from '@mantine/core';
import ReactECharts from 'echarts-for-react';


import { useUIStore } from '../../store/useUIStore';
import { useDomainStore } from '../../store/useDomainStore';
import { useExpressionStore } from '../../store/useExpressionStore';
import type { TissueInfo } from '../../types/tissue';

interface GeneDetailViewProps {
  addedTissues: TissueInfo[];
}

export const GeneDetailView = ({ addedTissues }: GeneDetailViewProps) => {
  const selectedGeneId = useUIStore((state) => state.selectedGeneId);
  const geneData = useDomainStore((state) => state.geneData);
  const expressionDataMap = useExpressionStore((state) => state.expressionDataMap);

  const gene = geneData.find((g) => g.ensembl === selectedGeneId) || null;

  if (!gene) {
    return (
      <Paper withBorder p="xl" radius="lg" shadow="sm" h="100%" display="flex" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text c="dimmed">Select a gene from the table to view details</Text>
      </Paper>
    );
  }

  // Map added tissues to their corresponding expression values for the chart
  const chartData = addedTissues.map(meta => {
    const tissueId = meta.tissueSiteDetailId;
    const value = expressionDataMap[tissueId]?.[gene.ensembl];
    
    // Only include valid expression values
    if (value === undefined || value === -1) return null;
    
    return {
      label: meta.tissueSiteDetail || tissueId,
      value: value,
      color: meta.colorHex ? `#${meta.colorHex}` : '#4dabf7'
    };
  }).filter((d): d is NonNullable<typeof d> => d !== null);

  const chartOptions = chartData.length > 0 ? {
    title: {
      text: 'Median Expression (TPM)',
      textStyle: { fontSize: 14, fontWeight: 'normal', color: '#868e96' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.label),
      axisLabel: { rotate: 45, interval: 0 }
    },
    yAxis: { type: 'value', name: 'TPM' },
    series: [
      {
        data: chartData.map(d => ({
          value: d.value,
          itemStyle: { color: d.color }
        })),
        type: 'bar',
        barMaxWidth: 40,
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      }
    ]
  } : null;

  return (
    <Paper withBorder p="xl" radius="lg" shadow="sm" h="100%">
      <Stack gap="md" h="100%">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={3}>{gene.gene_symbol || gene.ensembl}</Title>
            <Text c="dimmed" size="sm" maw={300} truncate="end">{gene.name}</Text>
          </div>
          <Badge color="indigo" variant="light" size="lg">{gene.biotype}</Badge>
        </Group>

        <Divider />

        <Grid>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Ensembl ID</Text>
            <Text fw={500}>{gene.ensembl}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Chromosome</Text>
            <Text fw={500}>{gene.chromosome}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">Start Position</Text>
            <Text fw={500}>{gene.seq_region_start.toLocaleString()}</Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">End Position</Text>
            <Text fw={500}>{gene.seq_region_end.toLocaleString()}</Text>
          </Grid.Col>
        </Grid>

        {chartOptions ? (
          <Box mt="md" style={{ flex: 1, minHeight: 300 }}>
            <ReactECharts option={chartOptions} style={{ height: '100%', width: '100%' }} />
          </Box>
        ) : (
          <Box mt="md" style={{ flex: 1, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <Text c="dimmed" size="sm">No expression data available. Add a tissue to view chart.</Text>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};
