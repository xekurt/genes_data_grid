import { useMemo } from 'react';
import type { GoslingSpec } from 'gosling.js';
import type { GeneRecord } from '@/types/csv';
import { generateGeneAnnotationSpec } from '@/services/goslingService';

export const useGoslingSpec = (gene: GeneRecord | null): GoslingSpec | null => {
  return useMemo(() => generateGeneAnnotationSpec(gene), [gene]);
};
