import { useMemo } from 'react';
import type { GoslingSpec } from 'gosling.js';
import type { EnrichedGeneRecord } from '../../../types/csv';
import { generateGeneAnnotationSpec } from '../../../services/goslingService';

export const useGoslingSpec = (gene: EnrichedGeneRecord | null): GoslingSpec | null => {
  return useMemo(() => generateGeneAnnotationSpec(gene), [gene]);
};
