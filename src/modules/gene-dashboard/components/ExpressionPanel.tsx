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
  const geneDataLength = useDomainStore((state) => state.geneData.length);
  const [availableTissues, setAvailableTissues] = useState<TissueInfo[]>([]);
  const [selectedTissue, setSelectedTissue] = useState<string | null>(null);

  useEffect(() => {
    getAvailableTissues().then(setAvailableTissues);
  }, []);

  const handleAddExpression = useCallback(async () => {
    if (!selectedTissue || geneDataLength === 0) return;
    const tissue = availableTissues.find((t) => t.tissueSiteDetailId === selectedTissue);
    if (!tissue || addedTissues.some((t) => t.tissueSiteDetailId === selectedTissue)) return;
    useExpressionStore.getState().addTissue(tissue);
    setSelectedTissue(null);
  }, [selectedTissue, geneDataLength, availableTissues, addedTissues]);

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
              rightSection={
                <IconX
                  size={12}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleRemoveTissue(t.tissueSiteDetailId)}
                />
              }
              styles={{ section: { marginLeft: '6px' } }}
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
