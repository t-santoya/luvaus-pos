import {
  defineConfig
} from 'vite'
import react from '@vitejs/plugin-react'
import {
  VitePWA
} from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'LUVAUS',
        short_name: 'LUVAUS',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b3f63',
        theme_color: '#0b3f63',
        orientation: 'portrait',
        icons: [{
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})