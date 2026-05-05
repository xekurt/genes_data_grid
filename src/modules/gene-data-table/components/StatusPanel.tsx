
import { Group, Stack, Text, Badge, Loader, Paper } from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';

interface StatusPanelProps {
  totalRows: number;
  isCSVLoading: boolean;
  error: Error | null;
  hasData: boolean;
}

export const StatusPanel = ({ totalRows, isCSVLoading, error, hasData }: StatusPanelProps) => {
  return (
    <Paper withBorder p="xl" radius="lg" shadow="sm">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Text size="lg" fw={700}>
            Live GTEx Expression Data
          </Text>
          <Text size="sm" c="dimmed">
            Showing live expression data for visible genes in the table.
          </Text>
        </Stack>
      </Group>

      <Group mt="xl" justify="space-between">
        {error ? (
          <Badge
            color="red"
            variant="filled"
            leftSection={<IconAlertCircle size={14} />}
            p="md"
            radius="sm"
          >
            Parsing Error: {error.message}
          </Badge>
        ) : (
          <Group gap="md">
            <Badge
              size="lg"
              color={hasData ? 'green' : 'gray'}
              variant="light"
              leftSection={hasData ? <IconCheck size={16} /> : null}
              radius="md"
              px="md"
            >
              {totalRows.toLocaleString()} Records Streamed
            </Badge>
            {isCSVLoading && (
              <Group gap="xs">
                <Loader size="sm" type="dots" />
                <Text size="xs" c="blue" fw={500}>
                  Processing Worker Thread...
                </Text>
              </Group>
            )}
          </Group>
        )}
      </Group>
    </Paper>
  );
};
