
import {
  Container,
  Title,
  Group,
  ThemeIcon,
  Box,
  Stack,
} from '@mantine/core';
import { IconDna } from '@tabler/icons-react';
import { GeneDataDashboard } from './modules/gene-data-table/GeneDataDashboard';

const App = () => {
  return (
    <Box bg="gray.0" style={{ minHeight: '100vh' }}>
      <Container size="xxl" py="xl">
        <Stack>
          <Group>

            <ThemeIcon
              size="xl"
              radius="md"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
            >
              <IconDna size={28} />
            </ThemeIcon>
            <Title order={1} fw={900} style={{ letterSpacing: '-1px' }}>
              Bio
            </Title>
             
          </Group> 
          <GeneDataDashboard />
        </Stack>
      </Container>
    </Box>
  );
};

export default App;
