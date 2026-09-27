import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The workbench tabs are lazily loaded, so the entry chunk is no longer one
    // 1.1 MB blob. These limits make a regression visible instead of silent.
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Split the stable, rarely-changing dependencies out of the app chunk so
        // a code change does not invalidate them in a returning user's cache.
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
          storage: ['dexie', 'dexie-react-hooks'],
          icons: ['lucide-react'],
        },
      },
    },
  },
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
