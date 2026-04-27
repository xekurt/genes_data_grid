import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  tools: {
    rspack(config, { addRules }) {
      addRules([{ test: /\.csv$/, type: 'asset/resource' }]);
    },
  },
  plugins: [pluginReact()],
  html: {
    title: 'Rsbuild + Mantine + MRT',
  },
  // Optional but recommended: Path aliases make importing components cleaner
});
