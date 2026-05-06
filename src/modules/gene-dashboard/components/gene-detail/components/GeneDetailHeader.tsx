import { Title, Text, Group, Badge, Divider, Grid, ActionIcon, Tooltip } from '@mantine/core';
import { IconMaximize, IconMinimize } from '@tabler/icons-react';
import type { GeneRecord } from '@/types/csv';

interface GeneDetailHeaderProps {
  gene: GeneRecord;
  isFullscreen?: boolean;
  toggleFullscreen?: () => void;
}

export const GeneDetailHeader = ({ gene, isFullscreen, toggleFullscreen }: GeneDetailHeaderProps) => {
  const formatPos = (val: number | undefined | null) => {
    if (val === undefined || val === null) return '-';
    return typeof val === 'number' ? val.toLocaleString() : val;
  };

  return (
    <>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text component="h3" size="lg" fw={700} truncate="end" style={{ margin: 0 }}>
            {gene.gene_symbol || gene.ensembl}
          </Text>
          <Text c="dimmed" size="sm" maw="100%" truncate="end">{gene.name}</Text>
        </div>
        <Group gap="xs" wrap="nowrap">
          <Badge color="indigo" variant="light" size="lg">{gene.biotype}</Badge>
          <Tooltip label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <ActionIcon variant="light" color="gray" onClick={toggleFullscreen} size="lg">
              {isFullscreen ? <IconMinimize size={18} /> : <IconMaximize size={18} />}
            </ActionIcon>
          </Tooltip>
        </Group>
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
          <Text fw={500}>{formatPos(gene.seq_region_start)}</Text>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text size="sm" c="dimmed">End Position</Text>
          <Text fw={500}>{formatPos(gene.seq_region_end)}</Text>
        </Grid.Col>
      </Grid>
    </>
  );
};
