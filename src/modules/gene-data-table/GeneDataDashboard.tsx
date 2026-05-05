import { useState, useEffect, useCallback } from 'react';
import { GeneDetailView } from '../gene-detail/GeneDetailView';
import { StatusPanel } from './components/StatusPanel';
import { ExpressionPanel } from './components/ExpressionPanel';
import { GeneTable } from './components/GeneTable';
import { Grid, Paper, Stack } from '@mantine/core';
import { useDomainStore } from '../../store/useDomainStore';
import { useExpressionStore } from '../../store/useExpressionStore';
import { useCSVParser } from '../../hooks/useCSVParser';
import { useJITExpression } from './hooks/useJITExpression';
import { ASSET_URLS } from '../../utils/url';

export const GeneDataDashboard = () => {
  const geneData = useDomainStore((state) => state.geneData);
  const isDataLoading = useDomainStore((state) => state.isDataLoading);
  const addedTissues = useExpressionStore((state) => state.addedTissues);

  const { error, totalRows, parse } = useCSVParser(ASSET_URLS.GENES_HUMAN);
  
  const [visibleIds, setVisibleIds] = useState<string[]>([]);

  const { isExpLoading } = useJITExpression(visibleIds, addedTissues);
  
  useEffect(() => {
    parse();
  }, [parse]);

  const handleVisibleIdsChange = useCallback((ids: string[]) => {
    setVisibleIds(ids);
  }, []);

  return (
    <Stack gap="xl">
      <StatusPanel 
        totalRows={totalRows} 
        isCSVLoading={isDataLoading} 
        error={error} 
        hasData={geneData.length > 0} 
      />

      {geneData.length > 0 && (
        <Paper withBorder p="xl" radius="lg" shadow="sm">
          <ExpressionPanel isExpLoading={isExpLoading} />
        </Paper>
      )}

      {geneData.length > 0 && (
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <GeneTable 
              isExpLoading={isExpLoading} 
              onVisibleIdsChange={handleVisibleIdsChange} 
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <GeneDetailView addedTissues={addedTissues} />
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
};
