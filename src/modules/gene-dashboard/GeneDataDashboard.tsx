import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Grid, Group, Stack, Skeleton, Paper } from '@mantine/core';
import { useJITExpression } from './hooks/useJITExpression';
import { ExpressionPanel } from './components/ExpressionPanel';
import { GeneTable } from './components/GeneTable';

const GeneDetailView = lazy(() => 
  import('./components/gene-detail/GeneDetailView').then(module => ({ default: module.GeneDetailView }))
);
import { useDomainStore } from '@/store/useDomainStore';
import { useExpressionStore } from '@/store/useExpressionStore';
import { useCSVParser } from '@/hooks/useCSVParser';
import { ASSET_URLS } from '@/utils/url';

export const GeneDataDashboard = () => {
  const totalCount = useDomainStore((state) => state.totalCount);
  const addedTissues = useExpressionStore((state) => state.addedTissues);

  const { parse } = useCSVParser(ASSET_URLS.GENES_HUMAN);
  
  const [visibleIds, setVisibleIds] = useState<string[]>([]);

  const { isExpLoading, loadingTissueIds } = useJITExpression(visibleIds, addedTissues);

  const handleVisibleIdsChange = useCallback((ids: string[]) => {
    setVisibleIds(ids);
  }, []);

  

  return (
    <Stack pb="lg" style={{ overflow: 'hidden', backgroundColor: 'var(--mantine-color-gray-0)'}}>
      {totalCount > 0 && (
        <Group>
          <ExpressionPanel isExpLoading={isExpLoading} />
        </Group>
      )}

      {totalCount > 0 && (
        <Grid style={{ flex: 1, minHeight: 0, overflow: 'hidden' }} gutter={8} columns={12}>
          <Grid.Col span={{ base: 12, md: 8 }} style={{ display: 'flex', flexDirection: 'column' }}>
            <GeneTable 
              loadingTissueIds={loadingTissueIds}
              onVisibleIdsChange={handleVisibleIdsChange} 
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }} style={{ display: 'flex', flexDirection: 'column' }}>
            <Suspense fallback={
              <Paper withBorder p="xl" radius="sm" shadow="sm" h="100%">
                <Stack>
                  <Skeleton height={40} />
                  <Skeleton height={200} />
                  <Skeleton height={200} />
                </Stack>
              </Paper>
            }>
              <GeneDetailView />
            </Suspense>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
};
