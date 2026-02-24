import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],

  server: {
    host: true,
    port: 5173,
    strictPort: true,
    
    // ✅ Ngrok domains
    allowedHosts: [
      'trite-monnie-fulsome.ngrok-free.dev',
      '.ngrok-free.dev'
    ],
    
    // ✅ CRITICAL: Same origin for localStorage across localhost/ngrok
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    
    // ✅ Enable CORS for storage APIs
    cors: true,
  },

  // ✅ Preview server (for production builds) also gets same settings
  preview: {
    host: true,
    port: 4173,
    allowedHosts: ['.ngrok-free.dev'],
    cors: true
  }
})
