import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/tempo-api': {
        target: 'https://api.tempo.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tempo-api/, ''),
      },
      '/jira-api': {
        target: 'https://jiraisa.atlassian.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jira-api/, ''),
      },
    },
  },
});
