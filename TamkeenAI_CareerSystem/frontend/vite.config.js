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
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    },
    hmr: {
      // Don't specify clientPort to let it automatically match whatever port the server uses
      // clientPort: getPort(),
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
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
}) 