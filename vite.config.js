import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

const basePath = process.env.GITHUB_PAGES ? '/todo-app/' : '/';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base: basePath,
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png'],
      manifest: {
        name: 'Todo App',
        short_name: 'Todo',
        start_url: basePath,
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3E7784',
        icons: [
          { src: `${basePath}icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
          { src: `${basePath}icons/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 }
            }
          }
        ]
      }
    })
  ],
  build: {
    target: 'es2020',
    outDir: '../dist',
    minify: 'terser',
    terserOptions: {
      compress: { drop_console: true }
    }
  },
  resolve: {
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    }
  }
});
