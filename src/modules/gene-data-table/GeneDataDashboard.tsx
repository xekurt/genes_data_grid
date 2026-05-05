import { useState, useEffect, useCallback } from 'react';
import { GeneDetailView } from '../gene-detail/GeneDetailView';
import { ExpressionPanel } from './components/ExpressionPanel';
import { GeneTable } from './components/GeneTable';
import { Grid, Group, Paper, Stack } from '@mantine/core';
import { useDomainStore } from '../../store/useDomainStore';
import { useExpressionStore } from '../../store/useExpressionStore';
import { useCSVParser } from '../../hooks/useCSVParser';
import { useJITExpression } from './hooks/useJITExpression';
import { ASSET_URLS } from '../../utils/url';

export const GeneDataDashboard = () => {
  const geneData = useDomainStore((state) => state.geneData);
  const addedTissues = useExpressionStore((state) => state.addedTissues);

  const { parse } = useCSVParser(ASSET_URLS.GENES_HUMAN);
  
  const [visibleIds, setVisibleIds] = useState<string[]>([]);

  const { isExpLoading } = useJITExpression(visibleIds, addedTissues);
  
  useEffect(() => {
    parse();
  }, [parse]);

  const handleVisibleIdsChange = useCallback((ids: string[]) => {
    setVisibleIds(ids);
  }, []);

  return (
    <Stack pb="lg" style={{ overflow: 'hidden', backgroundColor: 'var(--mantine-color-gray-0)'}}>
      {geneData.length > 0 && (
        <Group>
          <ExpressionPanel isExpLoading={isExpLoading} />
        </Group>
      )}

      {geneData.length > 0 && (
        <Grid style={{ flex: 1, minHeight: 0, overflow: 'hidden' }} gutter={8} columns={12}>
          <Grid.Col span={{ base: 12, md: 8 }} style={{ display: 'flex', flexDirection: 'column' }}>
            <GeneTable 
              isExpLoading={isExpLoading} 
              onVisibleIdsChange={handleVisibleIdsChange} 
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }} style={{ display: 'flex', flexDirection: 'column' }}>
            <GeneDetailView addedTissues={addedTissues} />
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
};
