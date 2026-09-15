import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'My Attendance App',
        short_name: 'Attendance',
        description: 'Attendance App PWA',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon/icon.jpg',
            sizes: '192x192',
            type: 'image/jpg'
          },
          {
            src: '/icon/icon.jpg',
            sizes: '512x512',
            type: 'image/jpg'
          }
        ]
      }
    })
  ]
});




