import { Flex, Tooltip, Box } from '@mantine/core';


export const getCategoryColor = (category: string) => {
  const colors = [
    '#228be6', // blue
    '#40c057', // green
    '#fab005', // yellow
    '#fd7e14', // orange
    '#e64980', // pink
    '#7950f2', // violet
    '#15aabf', // cyan
    '#82c91e', // lime
    '#f03e3e', // red
    '#be4bdb', // grape
  ];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const CategoryHistogram = ({
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
};
