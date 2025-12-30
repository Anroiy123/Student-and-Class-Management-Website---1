import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5205,
  },
  optimizeDeps: {
    exclude: ['@tanstack/react-table', '@tanstack/table-core'],
    force: true,
  },
});
