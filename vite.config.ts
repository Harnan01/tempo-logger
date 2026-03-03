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
        target: 'https://placeholder.atlassian.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jira-api/, ''),
        router: (req) => {
          const domain = req.headers['x-jira-domain'] as string | undefined;
          return domain ? `https://${domain}` : 'https://placeholder.atlassian.net';
        },
      },
    },
  },
});
