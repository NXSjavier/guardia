import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import fs from 'fs';

async function pickBackend() {
  const candidates = ['http://localhost:3001', 'http://localhost:3002'];
  for (const base of candidates) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 800);
      const res = await fetch(`${base}/api/health`, { signal: controller.signal });
      clearTimeout(id);
      if (res.ok) return base;
    } catch {
      // ignore
    }
  }
  return candidates[0];
}

function httpsConfig() {
  const keyPath = path.resolve(__dirname, './certs/dev-key.pem');
  const certPath = path.resolve(__dirname, './certs/dev-cert.pem');
  try {
    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);
    return { key, cert };
  } catch {
    return true;
  }
}

export default defineConfig(async () => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true, type: 'module' },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifestFilename: 'manifest.json',
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.firebaseapp\.com\/.*$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Guardia Management',
        short_name: 'GuardiaApp',
        description: 'Gestion de empresas de seguridad privada',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        display_override: ['fullscreen', 'standalone'],
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
          {
            name: 'Iniciar sesión',
            short_name: 'Login',
            description: 'Ir a la pantalla de inicio de sesión',
            url: '/login',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Instalar app',
            short_name: 'Instalar',
            description: 'Ver instrucciones de instalación',
            url: '/install',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': await pickBackend()
    }
  }
}));
