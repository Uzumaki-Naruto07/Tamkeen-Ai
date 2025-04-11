import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      src: path.resolve(__dirname, './src'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'react': path.resolve(__dirname, 'node_modules/react')
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
    }
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://tamkeen-main-api.onrender.com'),
    'process.env.VITE_INTERVIEW_API_URL': JSON.stringify(process.env.VITE_INTERVIEW_API_URL || 'https://tamkeen-interview-api.onrender.com'),
    'process.env.VITE_USE_MOCK_DATA': JSON.stringify(process.env.VITE_USE_MOCK_DATA || 'false'),
    'process.env.VITE_ENABLE_MOCK_DATA': JSON.stringify(process.env.VITE_ENABLE_MOCK_DATA || 'false'),
    'process.env.VITE_ENABLE_BACKEND_CHECK': JSON.stringify(process.env.VITE_ENABLE_BACKEND_CHECK || 'true')
  },
}) 