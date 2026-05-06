import { useState, useMemo } from 'react';
import { Box, Group, SegmentedControl, Text, Stack } from '@mantine/core';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import { useUIStore } from '@/store/useUIStore';
import { useExpressionStore } from '@/store/useExpressionStore';
import { generateMockSamples } from '@/utils/mock';

import type { Data, BoxPlotData, ViolinData } from 'plotly.js';
import { NO_EXPRESSION_DATA } from '@/constants/expression';

const Plot = createPlotlyComponent(Plotly);

export const ExpressionDistributionPlot = () => {
  const selectedGeneId = useUIStore((state) => state.selectedGeneId);
  const addedTissues = useExpressionStore((state) => state.addedTissues);
  const expressionDataMap = useExpressionStore((state) => state.expressionDataMap);

  const [plotType, setPlotType] = useState<'violin' | 'box'>('violin');
  const [scaleType, setScaleType] = useState<'linear' | 'log'>('linear');

  const plotData = useMemo<Data[]>(() => {
    if (!selectedGeneId) return [];

    return addedTissues.map((tissue): Data => {
      const medianTPM = expressionDataMap[tissue.tissueSiteDetailId]?.[selectedGeneId];
      
      // Handle NO_EXPRESSION_DATA or undefined
      if (medianTPM === undefined || medianTPM === NO_EXPRESSION_DATA) {
        return {
          type: plotType,
          y: [],
          name: `${tissue.tissueSiteDetail} (No Data)`,
          marker: { color: '#ccc' },
        } as Data;
      }

      const samples = generateMockSamples(medianTPM);
      
      const finalSamples = scaleType === 'log' 
        ? samples.map(v => Math.log10(v + 1))
        : samples;

      return {
        type: plotType,
        y: finalSamples,
        name: tissue.tissueSiteDetail,
        marker: {
          color: tissue.colorHex ? `#${tissue.colorHex}` : undefined,
        },
        boxpoints: 'suspectedoutliers',
        meanline: { visible: true },
        points: 'all',
        jitter: 0.5,
        bandwidth: 0.5, // for violin
      } as Data;
    });
  }, [selectedGeneId, addedTissues, expressionDataMap, plotType, scaleType]);

  const hasData = useMemo(() => {
    return plotData.some(d => {
      const yData = (d as BoxPlotData | ViolinData).y;
      return Array.isArray(yData) && yData.length > 0;
    });
  }, [plotData]);

  if (!selectedGeneId || addedTissues.length === 0) {
    return (
      <Box 
        style={{ 
          flex: 1, 
          minHeight: 300, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: 'var(--mantine-color-gray-0)', 
          borderRadius: 'var(--mantine-radius-sm)',
          border: '1px dashed var(--mantine-color-gray-3)'
        }}
      >
        <Text c="dimmed" size="sm">
          No tissues added. Add a tissue to view distribution.
        </Text>
      </Box>
    );
  }

  if (!hasData) {
    return (
      <Box 
        style={{ 
          flex: 1, 
          minHeight: 300, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: 'var(--mantine-color-gray-0)', 
          borderRadius: 'var(--mantine-radius-sm)',
          border: '1px dashed var(--mantine-color-gray-3)'
        }}
      >
        <Text c="dimmed" size="sm">
          No expression detected for this gene in selected tissues.
        </Text>
      </Box>
    );
  }

  return (
    <Stack gap="xs" style={{ flex: 1, minHeight: 0 }}>
      <Group justify="space-between">
        <Group gap="xs">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">Plot Type</Text>
          <SegmentedControl
            size="xs"
            value={plotType}
            onChange={(val) => setPlotType(val as 'violin' | 'box')}
            data={[
              { label: 'Violin', value: 'violin' },
              { label: 'Box', value: 'box' },
            ]}
          />
        </Group>
        <Group gap="xs">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">Scale</Text>
          <SegmentedControl
            size="xs"
            value={scaleType}
            onChange={(val) => setScaleType(val as 'linear' | 'log')}
            data={[
              { label: 'Linear', value: 'linear' },
              { label: 'Log10(TPM+1)', value: 'log' },
            ]}
          />
        </Group>
      </Group>

      <Box style={{ flex: 1, minHeight: 0, width: '100%' }}>
        <Plot
          data={plotData}
          layout={{
            autosize: true,
            margin: { l: 50, r: 20, t: 10, b: 80 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            showlegend: false,
            yaxis: {
              title: { text: scaleType === 'log' ? 'Log10(TPM + 1)' : 'TPM' },
              gridcolor: 'var(--mantine-color-gray-2)',
              zerolinecolor: 'var(--mantine-color-gray-3)',
              tickfont: { size: 10 },
            },
            xaxis: {
              tickangle: 45,
              tickfont: { size: 10 },
            },
            hovermode: 'closest',
          }}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{ displayModeBar: false }}
        />
      </Box>
    </Stack>
  );
};
