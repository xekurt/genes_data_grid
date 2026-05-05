import { Box } from '@mantine/core';
import { GoslingComponent } from 'gosling.js';
import { useGoslingSpec } from '../hooks/useGoslingSpec';
import type { EnrichedGeneRecord } from '../../../types/csv';

interface GeneAnnotationTrackProps {
  gene: EnrichedGeneRecord;
}

export const GeneAnnotationTrack = ({ gene }: GeneAnnotationTrackProps) => {
  const goslingSpec = useGoslingSpec(gene);

  return (
    <Box style={{ flex: 1, minHeight: 200, width: '100%', display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
      {goslingSpec && <GoslingComponent spec={goslingSpec} />}
    </Box>
  );
};
