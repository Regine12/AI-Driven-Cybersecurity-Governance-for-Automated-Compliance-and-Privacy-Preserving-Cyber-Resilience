import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.',
  base: '/AI-Driven-Cybersecurity-Governance-for-Automated-Compliance-and-Privacy-Preserving-Cyber-Resilience/',
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
