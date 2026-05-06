import { Group, Box, Text, Skeleton } from '@mantine/core';
import { useExpressionStore } from '@/store/useExpressionStore';

interface ExpressionCellProps {
  ensemblId: string;
  tissueId: string;
  color?: string;
  isLoading?: boolean;
}

export const ExpressionCell = ({ ensemblId, tissueId, color, isLoading }: ExpressionCellProps) => {
  const val = useExpressionStore((state) => state.expressionDataMap[tissueId]?.[ensemblId]);

  if (isLoading) {
    return <Skeleton height={18} width="100%" radius="xs" />;
  }

  if (val === undefined || val === null) {
    return <Text size="xs" c="dimmed">-</Text>;
  }

  return (
    <Group gap="xs" wrap="nowrap">
      <Box 
        style={{ 
          flex: 1, 
          height: '18px', 
          backgroundColor: 'var(--mantine-color-gray-1)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
          minWidth: '60px'
        }}
      >
        <Box 
          style={{ 
            width: `${Math.min(val, 100)}%`, 
            height: '100%', 
            backgroundColor: `#${color || '228be6'}33`,
            borderRight: `2px solid #${color || '228be6'}`
          }}
        />
        <Text 
          size="xs" 
          fw={600} 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: '4px', 
            lineHeight: '18px' 
          }}
        >
          {val.toLocaleString()}
        </Text>
      </Box>
    </Group>
  );
};
