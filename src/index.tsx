
import ReactDOM from 'react-dom/client';



import App from './App';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
import './App.css';
import { MantineProvider } from '@mantine/core';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <MantineProvider defaultColorScheme="auto">
      <App />
    </MantineProvider>
  );
}
