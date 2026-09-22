import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

function campusDataStoragePlugin(): Plugin {
  return {
    name: 'campus-data-storage-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url || '';
        const isGetApi = rawUrl.includes('/api/campus-data') && req.method === 'GET';
        const isPostApi = (rawUrl.includes('/api/campus-data') || rawUrl.includes('/api/save-campus-data')) && req.method === 'POST';

        if (isGetApi) {
          try {
            const filePath = path.resolve(__dirname, 'public/data/campusData.json');
            if (fs.existsSync(filePath)) {
              const data = fs.readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
              res.statusCode = 200;
              res.end(data);
              return;
            }
          } catch (err: any) {
            console.error('[Vite] Error reading campusData.json:', err);
          }
        }

        if (isPostApi) {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              const publicDataDir = path.resolve(__dirname, 'public/data');
              const srcDataDir = path.resolve(__dirname, 'src/data');
              if (!fs.existsSync(publicDataDir)) fs.mkdirSync(publicDataDir, { recursive: true });
              if (!fs.existsSync(srcDataDir)) fs.mkdirSync(srcDataDir, { recursive: true });

              const payload = {
                version: 1,
                updatedAt: new Date().toISOString(),
                locations: parsed.locations || [],
                nodes: parsed.nodes || [],
                roads: parsed.roads || [],
                categories: parsed.categories || [],
              };

              const jsonStr = JSON.stringify(payload, null, 2);
              fs.writeFileSync(path.join(publicDataDir, 'campusData.json'), jsonStr, 'utf-8');
              fs.writeFileSync(path.join(srcDataDir, 'campusData.json'), jsonStr, 'utf-8');

              // Also sync to server directory if it exists
              const serverDataDir = path.resolve(__dirname, '../server/src/data');
              if (fs.existsSync(serverDataDir)) {
                fs.writeFileSync(path.join(serverDataDir, 'campusData.json'), jsonStr, 'utf-8');
              }

              console.log(
                `[Vite Persistent Storage] Saved to disk: ${payload.locations.length} buildings, ${payload.nodes.length} junctions, ${payload.roads.length} roads (${payload.updatedAt})`
              );

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  message: 'Campus data saved to disk successfully',
                  updatedAt: payload.updatedAt,
                  counts: {
                    locations: payload.locations.length,
                    nodes: payload.nodes.length,
                    roads: payload.roads.length,
                  },
                })
              );
            } catch (err: any) {
              console.error('[Vite Persistent Storage] Error saving campus data:', err);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), campusDataStoragePlugin()],
  base: '/RECNavigator/',
});
