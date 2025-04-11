import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      src: path.resolve(__dirname, './src'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react-dom/client': path.resolve(__dirname, 'node_modules/react-dom/client.js')
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  // Let PostCSS handle Tailwind through the separate config file
  css: {
    postcss: './postcss.config.js'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom'
    ],
    force: true
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://tamkeen-main-api.onrender.com'),
    'process.env.VITE_INTERVIEW_API_URL': JSON.stringify(process.env.VITE_INTERVIEW_API_URL || 'https://tamkeen-interview-api.onrender.com'),
    'process.env.VITE_USE_MOCK_DATA': JSON.stringify(process.env.VITE_USE_MOCK_DATA || 'false'),
    'process.env.VITE_ENABLE_MOCK_DATA': JSON.stringify(process.env.VITE_ENABLE_MOCK_DATA || 'false'),
    'process.env.VITE_ENABLE_BACKEND_CHECK': JSON.stringify(process.env.VITE_ENABLE_BACKEND_CHECK || 'true')
  },
}) 