import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    open: true,
    fs: {
      // Allow serving files from the parent directory (data/, case_study/, rules/)
      allow: [
        path.resolve(__dirname, '..'),
      ],
    },
  },
});
