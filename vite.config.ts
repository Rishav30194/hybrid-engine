import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Project pages serve under /<repo>/; keep base + PWA scope in sync.
const base = '/hybrid-engine/'

// https://vite.dev/config/
export default defineConfig({
  base,
  // Allow previewing through an HTTPS tunnel (e.g. cloudflared) for device testing.
  preview: {
    allowedHosts: ['.trycloudflare.com'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Hybrid Engine',
        short_name: 'Hybrid Engine',
        description: '5-day hybrid strength + endurance training',
        theme_color: '#0C0D0F',
        background_color: '#0C0D0F',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
