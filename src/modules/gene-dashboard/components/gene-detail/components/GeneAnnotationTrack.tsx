import { Box } from '@mantine/core';
import { GoslingComponent } from 'gosling.js';
import type { GeneRecord } from '@/types/csv';
import { useGoslingSpec } from '../hooks/useGoslingSpec';

interface GeneAnnotationTrackProps {
  gene: GeneRecord;
}

export const GeneAnnotationTrack = ({ gene }: GeneAnnotationTrackProps) => {
  const goslingSpec = useGoslingSpec(gene);

  return (
    <Box style={{ flex: 1, minHeight: 200, width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      {goslingSpec && <GoslingComponent spec={goslingSpec} />}
    </Box>
  );
};
