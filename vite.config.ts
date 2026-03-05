import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite plugin that proxies /jira-api/* requests to the Jira domain
 * specified in the X-Jira-Domain header. Vite's built-in proxy does not
 * support http-proxy-middleware's `router` option, so we handle it manually.
 */
function jiraDynamicProxy(): Plugin {
  return {
    name: 'jira-dynamic-proxy',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url?.startsWith('/jira-api')) {
          return next();
        }

        const domain = req.headers['x-jira-domain'] as string | undefined;
        if (!domain) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Missing X-Jira-Domain header' }));
          return;
        }

        const targetPath = req.url.replace(/^\/jira-api/, '');
        const targetUrl = `https://${domain}${targetPath}`;

        // Build forwarded headers (strip hop-by-hop and custom routing headers)
        const forwardHeaders: Record<string, string> = {};
        for (const [key, value] of Object.entries(req.headers)) {
          if (
            value &&
            key !== 'host' &&
            key !== 'x-jira-domain' &&
            key !== 'connection'
          ) {
            forwardHeaders[key] = Array.isArray(value) ? value.join(', ') : value;
          }
        }

        // Collect request body for POST/PUT methods
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

          const fetchInit: { method: string; headers: Record<string, string>; body?: Buffer } = {
            method: req.method || 'GET',
            headers: forwardHeaders,
          };
          if (body && req.method !== 'GET' && req.method !== 'HEAD') {
            fetchInit.body = body;
          }

          globalThis
            .fetch(targetUrl, fetchInit)
            .then(async (proxyRes: Response) => {
              res.statusCode = proxyRes.status;
              proxyRes.headers.forEach((value: string, key: string) => {
                if (key !== 'transfer-encoding' && key !== 'content-encoding') {
                  res.setHeader(key, value);
                }
              });
              const responseBody = await proxyRes.arrayBuffer();
              res.end(Buffer.from(responseBody));
            })
            .catch((err: Error) => {
              res.statusCode = 502;
              res.end(JSON.stringify({ error: `Jira proxy error: ${err.message}` }));
            });
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), jiraDynamicProxy()],
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
        rewrite: (p) => p.replace(/^\/tempo-api/, ''),
      },
    },
  },
});
