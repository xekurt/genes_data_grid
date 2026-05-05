import { Paper, Text, Stack, Tabs } from '@mantine/core';
import { IconChartBar, IconDna } from '@tabler/icons-react';

import { useUIStore } from '../../store/useUIStore';
import { useDomainStore } from '../../store/useDomainStore';

import { GeneDetailHeader } from './components/GeneDetailHeader';
import { ExpressionDistributionPlot } from './components/ExpressionDistributionPlot';
import { GeneAnnotationTrack } from './components/GeneAnnotationTrack';

export const GeneDetailView = () => {
  const selectedGeneId = useUIStore((state) => state.selectedGeneId);
  const geneData = useDomainStore((state) => state.geneData);

  const gene = geneData.find((g) => g.ensembl === selectedGeneId) || null;

  if (!gene) {
    return (
      <Paper withBorder p="xl" radius="sm" shadow="sm" h="100%" display="flex" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text c="dimmed">Select a gene from the table to view details</Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="sm" p="xs" shadow="xs" h="100%" style={{ display: 'flex', flexDirection: 'column', borderRadius: 'none' }}>
      <Stack gap="xs" style={{ flex: 1, minHeight: 0 }}>
        
        <GeneDetailHeader gene={gene as any} />

        <Tabs defaultValue="expression" keepMounted={false} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }} mt="0">
          <Tabs.List>
            <Tabs.Tab value="expression" leftSection={<IconChartBar size={14} />}>
              Expression
            </Tabs.Tab>
            <Tabs.Tab value="annotation" leftSection={<IconDna size={14} />}>
              Annotation
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="expression" pt="xs" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ExpressionDistributionPlot />
          </Tabs.Panel>

          <Tabs.Panel value="annotation" pt="xs" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <GeneAnnotationTrack gene={gene as any} />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Paper>
  );
};


