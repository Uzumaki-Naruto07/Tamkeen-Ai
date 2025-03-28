import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Listen on all addresses
    strictPort: true, // Don't try another port if 3000 is taken
    open: true,
    cors: true, // Enable CORS for all requests
    hmr: {
      clientPort: 3000, // Force the client to use port 3000
      overlay: true, // Show errors as overlay
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      src: path.resolve(__dirname, './src'),
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