import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCase', // или другой вариант
      generateScopedName: '[local]_[hash:base64:5]',
    },
  },
  esbuild: {
    jsx: 'automatic',
    legalComments: 'none',
  },
  define: {
    'process.env': {},
  },
});
