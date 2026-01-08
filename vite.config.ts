import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon-192x192.png', 'icon-512x512.png'],
        manifest: {
          name: 'Óptica Visión',
          short_name: 'ÓpticaVisión',
          description: 'Tu visión, nuestra prioridad. Encuentra los mejores lentes y servicios ópticos.',
          theme_color: '#137fec',
          background_color: '#f6f7f8',
          display: 'standalone',
          icons: [
            {
              src: 'icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.APPSCRIPT_KEY': JSON.stringify(env.APPSCRIPT_KEY)
    },



    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});

