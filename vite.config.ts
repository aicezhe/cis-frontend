import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Метка сборки для кэш-бастинга сидов (?v=...): после каждого деплоя URL
  // /data/*.json меняется, и Cloudflare/браузер не отдают устаревший кэш.
  define: {
    __BUILD_ID__: JSON.stringify(Date.now().toString(36)),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
});