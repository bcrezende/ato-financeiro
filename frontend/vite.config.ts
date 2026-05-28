import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // We maintain our own /public/manifest.json (linked in index.html)
      manifest: false,
      includeAssets: [
        'logo-mark.png',
        'logo-wide.png',
        'favicon-16.png',
        'favicon-32.png',
        'apple-touch-icon.png',
      ],
      workbox: {
        // Precache the app shell (JS/CSS/HTML/icons)
        globPatterns: ['**/*.{js,css,html,png,svg,woff,woff2}'],
        // og-image is only for social crawlers — no need to ship it in the SW cache
        globIgnores: ['**/og-image.png'],
        // SPA: serve index.html for client-side routes when offline
        navigateFallback: 'index.html',
        // Never let the SW intercept API calls — financial data must stay fresh
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // Google Fonts stylesheets — cache-first
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Google Fonts files — cache-first
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query': ['@tanstack/react-query'],
          'charts': ['recharts'],
          'forms': ['react-hook-form'],
          'utils': ['date-fns', 'axios', 'zustand'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
  },
});
