import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCase', // или другой вариант
      generateScopedName: '[local]_[hash:base64:5]'
    }
  },
  esbuild: {
    jsx: 'automatic',
    legalComments: 'none',
  },
  define: {
    'process.env': {},
  }
})
