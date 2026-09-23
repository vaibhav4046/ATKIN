import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1', // strictly bind to loopback for privacy
    proxy: {
      '/api/local-model': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/local-model/, '/api'),
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            if (!res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: 'Local Ollama service unreachable on 127.0.0.1:11434',
                offlineMode: true,
                message: err.message
              }));
            }
          });
        }
      }
    }
  }
});
