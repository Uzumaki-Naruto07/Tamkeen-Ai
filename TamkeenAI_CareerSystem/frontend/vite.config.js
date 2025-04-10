import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env files
  const env = loadEnv(mode, process.cwd(), '')
  
  // Get API URLs from environment variables or use default local URLs
  const apiUrl = env.VITE_API_URL || 'http://localhost:5001'
  const interviewApiUrl = env.VITE_INTERVIEW_API_URL || 'http://localhost:5002' 
  const uploadServerUrl = env.VITE_UPLOAD_SERVER_URL || 'http://localhost:5004'
  
  // Get WS port from environment or use server port
  const getPort = () => {
    return env.VITE_WS_PORT ? parseInt(env.VITE_WS_PORT) : 3000;
  };
  
  return {
    plugins: [react()],
    define: {
      // Define environment variables for use in the frontend code
      'process.env.VITE_API_URL': JSON.stringify(apiUrl),
      'process.env.VITE_INTERVIEW_API_URL': JSON.stringify(interviewApiUrl),
      'process.env.VITE_UPLOAD_SERVER_URL': JSON.stringify(uploadServerUrl),
    },
    server: {
      port: getPort(),
      host: true, // Listen on all addresses
      strictPort: false, // Try another port if preferred port is taken
      open: true,
      cors: true, // Enable CORS for all requests
      proxy: {
        '/api/interviews': {
          target: interviewApiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        },
        '/api': {
          target: apiUrl,
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
        'uuid': path.resolve(__dirname, 'node_modules/uuid')
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
          },
        },
        external: [
          'react-wordcloud'
        ]
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
        '@mui/x-date-pickers/AdapterDateFns',
        'uuid',
        'jspdf',
        'react-wordcloud'
      ],
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
  }
}) 