import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [react()],
  base: '/passport-score-checker/',
  server: {
    port: 5174,
    host: true,
    allowedHosts: true
  }
});
