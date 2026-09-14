import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    // Increase the warning threshold — our vendor chunks are intentionally large
    chunkSizeWarningLimit: 1000,
    outDir: 'dist',
    sourcemap: false, // disable sourcemaps in production for security
  }
});
