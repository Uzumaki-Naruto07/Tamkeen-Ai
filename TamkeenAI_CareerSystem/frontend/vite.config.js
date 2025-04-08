import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Get WS port from environment or use server port
const getPort = () => {
  return process.env.VITE_WS_PORT ? parseInt(process.env.VITE_WS_PORT) : 3000;
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: getPort(),
    host: true, // Listen on all addresses
    strictPort: false, // Try another port if preferred port is taken
    open: true,
    cors: true, // Enable CORS for all requests
    proxy: {
      '/api/interviews': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    },
    hmr: {
      clientPort: 3000, // Explicitly set client port for WebSocket connection
      host: 'localhost', // Ensure WebSocket connects to localhost
      protocol: 'ws', // Use WebSocket protocol
      overlay: true, // Show errors as overlay
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      src: path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [], // Temporarily remove all PostCSS plugins
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'date-fns',
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-date-pickers',
      '@mui/x-date-pickers/AdapterDateFns'
    ],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
}) 