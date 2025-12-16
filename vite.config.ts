import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa'; // Importa o plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Configuração do PWA
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], 
      manifest: {
        name: 'Forensic Track App', // Nome completo do app
        short_name: 'Forensic',     // Nome na tela inicial
        description: 'Seu aplicativo de rastreamento forense.',
        theme_color: '#ffffff',     
        background_color: '#ffffff', 
        display: 'standalone',       // MODO CRUCIAL: Abre como um app nativo (tela cheia)
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          }
        ]
      }
    })
  ],
});