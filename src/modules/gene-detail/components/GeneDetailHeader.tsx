import { Title, Text, Group, Badge, Divider, Grid } from '@mantine/core';
import type { EnrichedGeneRecord } from '../../../types/csv';

interface GeneDetailHeaderProps {
  gene: EnrichedGeneRecord;
}

export const GeneDetailHeader = ({ gene }: GeneDetailHeaderProps) => {
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
          <Text fw={500}>{gene.seq_region_start.toLocaleString()}</Text>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text size="sm" c="dimmed">End Position</Text>
          <Text fw={500}>{gene.seq_region_end.toLocaleString()}</Text>
        </Grid.Col>
      </Grid>
    </>
  );
};
