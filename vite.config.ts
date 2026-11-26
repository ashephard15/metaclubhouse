import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// HTTPS=1 npm run dev  → self-signed HTTPS on your LAN so the Quest browser allows WebXR.
const https = process.env.HTTPS === '1';

export default defineConfig({
  base: './', // works from any sub-path (e.g. GitHub Pages /metaclubhouse/)
  plugins: [react(), ...(https ? [basicSsl()] : [])],
  server: { host: true, port: 5173 },
  build: {
    rollupOptions: { output: { manualChunks: { three: ['three'] } } },
    chunkSizeWarningLimit: 900,
  },
});
