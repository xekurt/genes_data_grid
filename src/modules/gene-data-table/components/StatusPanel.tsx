import { Group, Text, Badge, Loader } from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';

interface StatusPanelProps {
  totalRows: number;
  isCSVLoading: boolean;
  error: Error | null;
  hasData: boolean;
}

export const StatusPanel = ({ totalRows, isCSVLoading, error, hasData }: StatusPanelProps) => {
  return (
    <Group justify="space-between" align="center" px="md" py="sm" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
      <Group gap="md" align="center">
        <Text size="md" fw={700} tt="uppercase" lts={1}>
          Live GTEx Expression Data
        </Text>
        <Text size="sm" c="dimmed">
          Showing live expression data for visible genes in the table.
        </Text>
      </Group>

      {error ? (
        <Badge
          color="red"
          variant="filled"
          leftSection={<IconAlertCircle size={14} />}
          radius="sm"
        >
          Parsing Error: {error.message}
        </Badge>
      ) : (
        <Group gap="xs" align="center">
          {isCSVLoading && (
            <Group gap="xs">
              <Loader size="xs" type="dots" />
              <Text size="xs" c="blue" fw={500}>
                Processing Worker Thread...
              </Text>
            </Group>
          )}
          <Badge
            size="md"
            color={hasData ? 'green' : 'gray'}
            variant="light"
            leftSection={hasData ? <IconCheck size={14} /> : null}
            radius="sm"
          >
            {totalRows.toLocaleString()} Records Streamed
          </Badge>
        </Group>
      )}
    </Group>
  );
};
