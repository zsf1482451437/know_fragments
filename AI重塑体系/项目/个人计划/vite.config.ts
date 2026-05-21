import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { promises as fs } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin, PreviewServer, ViteDevServer } from 'vite';
import { defineConfig } from 'vitest/config';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(projectRoot, 'data', 'plan.json');

function readRequestBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload, null, 2));
}

function createPlanApiPlugin(): Plugin {
  const attachMiddleware = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use('/api/plan', async (req, res) => {
      try {
        if (req.method === 'GET') {
          const content = await fs.readFile(dataFile, 'utf8');
          sendJson(res, 200, JSON.parse(content));
          return;
        }

        if (req.method === 'PUT') {
          const body = await readRequestBody(req);
          const incoming = JSON.parse(body);
          const nextPlan = { ...incoming, updatedAt: new Date().toISOString() };
          await fs.mkdir(path.dirname(dataFile), { recursive: true });
          await fs.writeFile(dataFile, JSON.stringify(nextPlan, null, 2), 'utf8');
          sendJson(res, 200, nextPlan);
          return;
        }

        sendJson(res, 405, { message: 'Method Not Allowed' });
      } catch (error) {
        sendJson(res, 500, {
          message: error instanceof Error ? error.message : 'Unknown server error'
        });
      }
    });
  };

  return {
    name: 'local-plan-json-api',
    configureServer: attachMiddleware,
    configurePreviewServer: attachMiddleware
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), createPlanApiPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts'
  }
});
