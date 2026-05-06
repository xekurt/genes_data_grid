import { useState, useEffect, useCallback } from 'react';
import { Group, Select, Tooltip, ActionIcon, Badge, Box } from '@mantine/core';
import { IconFlask, IconPlus, IconX } from '@tabler/icons-react';
import { getAvailableTissues } from '@/services/expressionApi';
import { useExpressionStore } from '@/store/useExpressionStore';
import { useDomainStore } from '@/store/useDomainStore';
import type { TissueInfo } from '@/types/tissue';

interface ExpressionPanelProps {
  isExpLoading: boolean;
}

export const ExpressionPanel = ({ isExpLoading }: ExpressionPanelProps) => {
  const addedTissues = useExpressionStore((state) => state.addedTissues);
  const totalCount = useDomainStore((state) => state.totalCount);
  const [availableTissues, setAvailableTissues] = useState<TissueInfo[]>([]);
  const [selectedTissue, setSelectedTissue] = useState<string | null>(null);

  useEffect(() => {
    getAvailableTissues().then(setAvailableTissues);
  }, []);

  const handleAddExpression = useCallback(async () => {
    if (!selectedTissue || totalCount === 0) return;
    const tissue = availableTissues.find((t) => t.tissueSiteDetailId === selectedTissue);
    if (!tissue || addedTissues.some((t) => t.tissueSiteDetailId === selectedTissue)) return;
    useExpressionStore.getState().addTissue(tissue);
    setSelectedTissue(null);
  }, [selectedTissue, totalCount, availableTissues, addedTissues]);

  const handleRemoveTissue = useCallback((tissueId: string) => {
    useExpressionStore.getState().removeTissue(tissueId);
  }, []);

  return (
    <Group gap="md" align="center">
      <Group gap="xs">
        <Select
          placeholder="Add Tissue Expression (GTEx)"
          data={availableTissues.map((t) => ({
            value: t.tissueSiteDetailId,
            label: t.tissueSiteDetail,
            disabled: addedTissues.some((at) => at.tissueSiteDetailId === t.tissueSiteDetailId),
          }))}
          searchable
          size="xs"
          radius="sm"
          w={220}
          value={selectedTissue}
          onChange={setSelectedTissue}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && selectedTissue) {
              handleAddExpression();
            }
          }}
          leftSection={<IconFlask size={14} />}
          disabled={isExpLoading}
        />
        <Tooltip label="Add as dynamic column">
          <ActionIcon
            variant="filled"
            color="indigo"
            size="md"
            radius="sm"
            onClick={handleAddExpression}
            loading={isExpLoading}
            disabled={!selectedTissue}
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {addedTissues.length > 0 && (
        <Group gap="xs">
          {addedTissues.map((t) => (
            <Badge
              key={t.tissueSiteDetailId}
              variant="outline"
              color="gray"
              size="md"
              radius="sm"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  handleRemoveTissue(t.tissueSiteDetailId);
                }
              }}
              style={{ cursor: 'default' }}
              styles={{
                root: {
                  '&:focus': {
                    outline: '2px solid var(--mantine-color-indigo-filled)',
                    outlineOffset: '2px',
                  },
                },
                section: { marginLeft: '6px' }
              }}
              rightSection={
                <IconX
                  size={12}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveTissue(t.tissueSiteDetailId)}
                />
              }
              leftSection={
                <Box
                  w={6}
                  h={6}
                  bg={`#${t.colorHex}`}
                  style={{ borderRadius: '50%' }}
                />
              }
            >
              {t.tissueSiteDetail}
            </Badge>
          ))}
        </Group>
      )}
    </Group>
  );
};
