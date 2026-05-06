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
    title: 'GeneStream Parser',
    favicon: './public/favicon.png',
  },
  output: {
    assetPrefix: process.env.NODE_ENV === 'production' ? '/genes_data_grid/' : '/',
  },
  
  resolve: {
    alias: {
      '@': './src',
      '@hooks': './src/hooks',
      '@services': './src/services',
      '@components': './src/components',
      '@store': './src/store',
      '@types': './src/types',
      '@utils': './src/utils',
      '@modules': './src/modules',
      '@constants': './src/constants',
    },
  },
});
