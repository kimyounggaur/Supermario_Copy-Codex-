import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Supermario_Copy-Codex-/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts']
  }
});
