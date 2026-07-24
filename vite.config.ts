import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'diagrams/*.png'],
      workbox: {
        // Cache everything the app needs so it works fully offline once installed.
        globPatterns: ['**/*.{js,css,html,png,svg,json,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      manifest: {
        name: 'NZART Ham Radio Study',
        short_name: 'Ham Study',
        description:
          "Study for the NZART General Amateur Operator's Certificate — 600-question bank, mock exams, spaced repetition.",
        theme_color: '#0f766e',
        background_color: '#0b1120',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  // GitHub Pages serves a project site at /<repo>/. The deploy workflow sets
  // BASE_PATH accordingly; locally it defaults to '/'.
  base: process.env.BASE_PATH ?? '/',
})
