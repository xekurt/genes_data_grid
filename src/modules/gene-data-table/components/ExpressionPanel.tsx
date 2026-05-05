import { useState, useEffect, useCallback } from 'react';
import { Group, Select, Tooltip, ActionIcon, Badge, Box, Divider } from '@mantine/core';
import { IconFlask, IconPlus, IconX } from '@tabler/icons-react';
import { getAvailableTissues } from '../../../services/expressionApi';
import { useExpressionStore } from '../../../store/useExpressionStore';
import { useDomainStore } from '../../../store/useDomainStore';
import type { TissueInfo } from '../../../types/tissue';

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
    <>
      <Group gap="xs">
        <Select
          placeholder="Add Tissue Expression (GTEx)"
          data={availableTissues.map((t) => ({
            value: t.tissueSiteDetailId,
            label: t.tissueSiteDetail,
            disabled: addedTissues.some((at) => at.tissueSiteDetailId === t.tissueSiteDetailId),
          }))}
          searchable
          size="sm"
          radius="md"
          w={250}
          value={selectedTissue}
          onChange={setSelectedTissue}
          leftSection={<IconFlask size={16} />}
          disabled={isExpLoading}
        />
        <Tooltip label="Add as dynamic column">
          <ActionIcon
            variant="filled"
            color="indigo"
            size="lg"
            radius="md"
            onClick={handleAddExpression}
            loading={isExpLoading}
            disabled={!selectedTissue}
          >
            <IconPlus size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {addedTissues.length > 0 && (
        <>
          <Divider my="lg" label="Dynamic Columns" labelPosition="center" />
          <Group gap="xs">
            {addedTissues.map((t) => (
              <Badge
                key={t.tissueSiteDetailId}
                variant="outline"
                color="gray"
                size="lg"
                radius="md"
                rightSection={
                  <IconX
                    size={14}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleRemoveTissue(t.tissueSiteDetailId)}
                  />
                }
                styles={{ section: { marginLeft: '8px' } }}
                leftSection={
                  <Box
                    w={8}
                    h={8}
                    bg={`#${t.colorHex}`}
                    style={{ borderRadius: '50%' }}
                  />
                }
              >
                {t.tissueSiteDetail}
              </Badge>
            ))}
          </Group>
        </>
      )}
    </>
  );
};
