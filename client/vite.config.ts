import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function devRedirectPlugin(): Plugin {
  return {
    name: 'dev-recnavigator-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && (req.url === '/RECNavigator' || req.url === '/RECNavigator/')) {
          res.writeHead(302, { Location: '/' });
          res.end();
          return;
        }
        if (req.url && req.url.startsWith('/RECNavigator/')) {
          req.url = req.url.replace(/^\/RECNavigator/, '');
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss(), devRedirectPlugin()],
  base: command === 'build' ? '/RECNavigator/' : '/',
}));

