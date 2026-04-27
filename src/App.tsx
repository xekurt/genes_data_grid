import { useCSVParser } from './hooks/useCSVParser';
import { ASSET_URLS } from './assets/url';
import { 
  Container, 
  Title, 
  Button, 
  Group, 
  Text, 
  Table, 
  Paper, 
  Stack, 
  Badge, 
  Loader,
  ThemeIcon,
  Box
} from '@mantine/core';
import { 
  IconDatabaseImport, 
  IconTrash, 
  IconCheck, 
  IconAlertCircle, 
  IconDna 
} from '@tabler/icons-react';

const App = () => {
  const { data, isLoading, error, totalRows, parse, reset } = useCSVParser(ASSET_URLS.GENES_HUMAN);

  return (
    <Box bg="gray.0" style={{ minHeight: '100vh' }}>
      <Container size="md" py="xl">
        <Stack gap="xl">
          <Group>
            <ThemeIcon size="xl" radius="md" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
              <IconDna size={28} />
            </ThemeIcon>
            <Title order={1} fw={900} style={{ letterSpacing: '-1px' }}>
              GeneStream Parser
            </Title>
          </Group>

          <Paper withBorder p="xl" radius="lg" shadow="sm">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Text size="lg" fw={700}>System Status</Text>
                <Text size="sm" c="dimmed">
                  Asynchronous CSV parsing using Web Workers & Chunking.
                </Text>
              </Stack>
              <Group>
                <Button 
                  onClick={parse} 
                  loading={isLoading}
                  leftSection={<IconDatabaseImport size={18} />}
                  variant="gradient"
                  gradient={{ from: 'blue', to: 'indigo' }}
                  radius="md"
                >
                  {data.length > 0 ? 'Reparse Data' : 'Initialize Stream'}
                </Button>
                <Button 
                  onClick={reset} 
                  variant="subtle" 
                  color="red"
                  leftSection={<IconTrash size={18} />}
                  disabled={isLoading || data.length === 0}
                  radius="md"
                >
                  Clear
                </Button>
              </Group>
            </Group>

            <Box mt="xl">
              {error ? (
                <Badge color="red" variant="filled" leftSection={<IconAlertCircle size={14} />} p="md" radius="sm">
                  Parsing Error: {error.message}
                </Badge>
              ) : (
                <Group gap="md">
                  <Badge 
                    size="lg"
                    color={data.length > 0 ? 'green' : 'gray'} 
                    variant="light"
                    leftSection={data.length > 0 ? <IconCheck size={16} /> : null}
                    radius="md"
                    px="md"
                  >
                    {totalRows.toLocaleString()} Records Streamed
                  </Badge>
                  {isLoading && (
                    <Group gap="xs">
                      <Loader size="sm" type="dots" />
                      <Text size="xs" c="blue" fw={500} style={{ textTransform: 'uppercase' }}>
                        Processing Worker Thread...
                      </Text>
                    </Group>
                  )}
                </Group>
              )}
            </Box>
          </Paper>

          {data.length > 0 && (
            <Paper withBorder radius="lg" shadow="xs" style={{ overflow: 'hidden' }}>
              <Box p="md" bg="gray.1" style={{ borderBottom: '1px solid #e9ecef' }}>
                <Text size="sm" fw={700} c="gray.7">Stream Preview (First 10 records)</Text>
              </Box>
              <Table.ScrollContainer minWidth={500}>
                <Table verticalSpacing="sm" horizontalSpacing="md">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Ensembl ID</Table.Th>
                      <Table.Th>Symbol</Table.Th>
                      <Table.Th>Chromosome</Table.Th>
                      <Table.Th>Biotype</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {data.slice(0, 10).map((gene) => (
                      <Table.Tr key={gene.ensembl}>
                        <Table.Td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          <Text c="blue.7" span>{gene.ensembl}</Text>
                        </Table.Td>
                        <Table.Td fw={700}>{gene.gene_symbol || '-'}</Table.Td>
                        <Table.Td>
                          <Badge size="xs" color="gray" variant="outline">{gene.chromosome}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">{gene.biotype}</Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
              <Box p="sm" ta="center" bg="gray.0">
                <Text size="xs" c="dimmed">
                  Data optimized for high-frequency updates.
                </Text>
              </Box>
            </Paper>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default App;

