import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'favicon.svg'],
      devOptions: {
        enabled: true,
        type: 'module'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'ATM',
        short_name: 'ATM',
        description: 'ATM Management System',
        theme_color: '#185FA5',
        icons: [
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
