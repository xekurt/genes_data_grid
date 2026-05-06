import { Title, Text, Group, Badge, Divider, Grid } from '@mantine/core';
import type { GeneRecord } from '@/types/csv';

interface GeneDetailHeaderProps {
  gene: GeneRecord;
}

export const GeneDetailHeader = ({ gene }: GeneDetailHeaderProps) => {
  const formatPos = (val: number | undefined | null) => {
    if (val === undefined || val === null) return '-';
    return typeof val === 'number' ? val.toLocaleString() : val;
  };

  return (
    <>
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
