import { Box, Text } from '@mantine/core';
import ReactECharts from 'echarts-for-react';
import type { EnrichedGeneRecord } from '../../../types/csv';
import type { TissueInfo } from '../../../types/tissue';

interface GeneExpressionChartProps {
  gene: EnrichedGeneRecord;
  addedTissues: TissueInfo[];
  expressionDataMap: Record<string, Record<string, number>>;
}

export const GeneExpressionChart = ({ gene, addedTissues, expressionDataMap }: GeneExpressionChartProps) => {
  const chartData = addedTissues.map(meta => {
    const tissueId = meta.tissueSiteDetailId;
    const value = expressionDataMap[tissueId]?.[gene.ensembl];
    
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

  if (!chartOptions) {
    return (
      <Box style={{ flex: 1, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <Text c="dimmed" size="sm">No expression data available. Add a tissue to view chart.</Text>
      </Box>
    );
  }

  return (
    <Box style={{ flex: 1, minHeight: 200, width: '100%' }}>
      <ReactECharts option={chartOptions} style={{ height: '100%', width: '100%' }} />
    </Box>
  );
};
