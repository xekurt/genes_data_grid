import { memo } from 'react';
import { Flex, Tooltip, Box } from '@mantine/core';
import { getCategoryColor } from '@/utils/color';

export const CategoryHistogram = memo(({
  counts,
}: {
  counts: Record<string, number>;
}) => {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const categories = Object.keys(counts).sort();

  return (
    <Flex gap={1} align="flex-end" h={20} mt={4} title="Distribution">
      {categories.map((cat) => {
        const percentage = (counts[cat] / total) * 100;
        return (
          <Tooltip
            key={cat}
            label={`${cat}: ${counts[cat]}`}
            withArrow
            withinPortal
          >
            <Box
              h={`${Math.max(percentage, 15)}%`}
              w={4}
              bg={getCategoryColor(cat)}
              style={{ borderRadius: '1px' }}
            />
          </Tooltip>
        );
      })}
    </Flex>
  );
});
