#!/bin/bash

# Exit on error
set -e

echo "Starting Render build process..."

# Clean up node_modules to ensure fresh installation
echo "Cleaning previous installations..."
rm -rf node_modules

# Install React 18 core packages first
echo "Installing React 18 core dependencies..."
npm install --no-save react@18.2.0 react-dom@18.2.0

# Install Tailwind CSS and PostCSS plugins explicitly with exact versions
echo "Installing Tailwind CSS and PostCSS plugins..."
npm install --no-save tailwindcss@3.3.3 postcss@8.4.31 autoprefixer@10.4.15 @tailwindcss/postcss@4.0.17

# Install all dependencies with legacy peer deps
echo "Installing remaining dependencies..."
npm install --legacy-peer-deps

# Copy simplified configuration for Render
echo "Configuring for Render deployment..."
cp vite.render.config.js vite.config.js.template

# Create a modified version of the config
cat > vite.config.js << 'EOF'
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
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
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
  esbuild: {
    loader: 'jsx',
    include: [/\.jsx$/, /\.js$/],
    exclude: [],
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
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    }
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://tamkeen-main-api.onrender.com'),
    'process.env.VITE_INTERVIEW_API_URL': JSON.stringify(process.env.VITE_INTERVIEW_API_URL || 'https://tamkeen-interview-api.onrender.com'),
    'process.env.VITE_PREDICT_API_URL': JSON.stringify(process.env.VITE_PREDICT_API_URL || 'https://tamkeen-predict-api.onrender.com'),
    'process.env.VITE_UPLOAD_SERVER_URL': JSON.stringify(process.env.VITE_UPLOAD_SERVER_URL || 'https://tamkeen-upload-server.onrender.com'),
    'process.env.VITE_USE_MOCK_DATA': JSON.stringify(process.env.VITE_USE_MOCK_DATA || 'false'),
    'process.env.VITE_ENABLE_MOCK_DATA': JSON.stringify(process.env.VITE_ENABLE_MOCK_DATA || 'false'),
    'process.env.VITE_ENABLE_BACKEND_CHECK': JSON.stringify(process.env.VITE_ENABLE_BACKEND_CHECK || 'true')
  },
}) 
EOF

# Create Express server for proxying API requests
echo "Creating server.js for API proxying..."
cat > server.js << 'EOF'
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token', 'Accept']
}));

// Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API backends
const MAIN_API_URL = process.env.VITE_API_URL || 'https://tamkeen-main-api.onrender.com';
const INTERVIEW_API_URL = process.env.VITE_INTERVIEW_API_URL || 'https://tamkeen-interview-api.onrender.com';
const PREDICT_API_URL = process.env.VITE_PREDICT_API_URL || 'https://tamkeen-predict-api.onrender.com';
const UPLOAD_SERVER_URL = process.env.VITE_UPLOAD_SERVER_URL || 'https://tamkeen-upload-server.onrender.com';

// Configure proxy middleware with CORS handling
const createProxyWithCors = (path, target) => {
  return createProxyMiddleware(path, {
    target: target,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      // Add origin to proxy request
      proxyReq.setHeader('Origin', target);
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add CORS headers to proxy response
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Auth-Token, Accept';
    },
    pathRewrite: {
      // Don't rewrite paths as the backend already has the /api prefix
      //'^/api': '/api'
    },
    logLevel: 'debug'
  });
};

// Set up health check endpoint - make sure this is defined BEFORE proxy routes
app.get('/api/health-check', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Frontend server is running',
    timestamp: new Date().toISOString()
  });
});

// For debugging - log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Use the proxy creation function with appropriate path/target pairs
const mainApiProxy = createProxyWithCors('/api', MAIN_API_URL);
const interviewApiProxy = createProxyWithCors('/api/interviews', INTERVIEW_API_URL);
const predictApiProxy = createProxyWithCors('/api/predict', PREDICT_API_URL);
const uploadApiProxy = createProxyWithCors('/api/upload', UPLOAD_SERVER_URL);

// Direct pass-through for auth endpoints for better CORS handling
app.all('/auth/*', (req, res) => {
  const targetUrl = `${MAIN_API_URL}/auth${req.url.substring(5)}`;
  console.log(`Direct auth proxy to: ${targetUrl}`);
  
  // Create a direct proxy to the auth endpoint
  const authProxy = createProxyMiddleware({
    target: MAIN_API_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/auth': '/auth'
    },
    onProxyRes: (proxyRes, req, res) => {
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Auth-Token, Accept';
    },
    logLevel: 'debug'
  });
  
  authProxy(req, res);
});

// Special handler for login route
app.all('/api/auth/login', (req, res) => {
  console.log('Special handling for login request');
  
  // Create a direct proxy specifically for login
  const loginProxy = createProxyMiddleware({
    target: MAIN_API_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      // Log headers for debugging
      console.log('Login request headers:', req.headers);
      
      // Make sure content-type is set properly for POST requests
      if (req.method === 'POST' && req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('Login response status:', proxyRes.statusCode);
      
      // Add CORS headers to proxy response
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Auth-Token, Accept';
      
      // Log response headers for debugging
      console.log('Login response headers:', proxyRes.headers);
    },
    logLevel: 'debug'
  });
  
  loginProxy(req, res);
});

// Set up proxy routes - order matters! More specific routes first
app.use('/api/interviews', interviewApiProxy);
app.use('/api/predict', predictApiProxy);
app.use('/api/upload', uploadApiProxy);
app.use('/api', mainApiProxy); // Main API is the catch-all

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('API proxy configuration:');
  console.log(`- Main API: ${MAIN_API_URL}`);
  console.log(`- Interview API: ${INTERVIEW_API_URL}`);
  console.log(`- Predict API: ${PREDICT_API_URL}`);
  console.log(`- Upload Server: ${UPLOAD_SERVER_URL}`);
});
EOF

# Add start script to package.json
echo "Adding server start script to package.json..."
cat > package.json.patch << 'EOF'
{
  "browserslist": [
    ">0.2%",
    "not dead",
    "not op_mini all"
  ],
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "start": "node server.js"
  }
}
EOF

cp package.render.json package.build.json

# Set up PostCSS configuration
echo "Setting up PostCSS configuration..."
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {}
  }
}
EOF

# Set up Tailwind configuration
echo "Setting up Tailwind configuration..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7ff',
          100: '#bae3ff',
          200: '#7cc4fa',
          300: '#47a3f3',
          400: '#2186eb',
          500: '#0967d2',
          600: '#0552b5',
          700: '#03449e',
          800: '#01337d',
          900: '#002159',
        },
        secondary: {
          50: '#fff8f1',
          100: '#feecdc',
          200: '#fcd9bd',
          300: '#fdba8c',
          400: '#ff8a4c',
          500: '#ff5a1f',
          600: '#d03801',
          700: '#b43403',
          800: '#8a2c0d',
          900: '#771d1d',
        },
      },
    },
  },
  plugins: [],
}
EOF

# Replace the index.css file completely to remove any problematic code
echo "Creating simplified CSS file without @layer components that are causing issues..."
cat > src/index.css << 'EOF'
/* Tailwind CSS directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles below */
:root {
  --primary: #0ea5e9;
  --secondary: #f97316;
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

html, body {
  height: 100%;
  min-height: 100vh;
}

body {
  min-width: 320px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}

/* RTL Support */
html[dir="rtl"] body {
  font-family: 'Cairo', sans-serif;
}

html[dir="rtl"] * {
  letter-spacing: 0;
}

#root {
  height: 100%;
  min-height: 100vh;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Replace @apply with direct CSS for components */
.btn-primary {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background-color: #0552b5;
  color: white;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background-color: #d03801;
  color: white;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

a {
  text-decoration: inherit;
}
EOF

# Create public directory and redirects file if they don't exist
echo "Setting up SPA routing..."
mkdir -p public
echo "/* /index.html 200" > public/_redirects

# Ensure browser support in package.json
echo "Updating package.json browser list..."
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const patch = JSON.parse(fs.readFileSync('package.json.patch', 'utf8'));
  Object.assign(pkg, patch);
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

# Install express and proxy middleware for the server
echo "Installing server dependencies..."
npm install --save express http-proxy-middleware

# Build the application
echo "Building application..."
VITE_API_URL=https://tamkeen-main-api.onrender.com \
VITE_INTERVIEW_API_URL=https://tamkeen-interview-api.onrender.com \
VITE_PREDICT_API_URL=https://tamkeen-predict-api.onrender.com \
VITE_UPLOAD_SERVER_URL=https://tamkeen-upload-server.onrender.com \
VITE_USE_MOCK_DATA=false \
VITE_ENABLE_MOCK_DATA=false \
VITE_ENABLE_MOCK_FALLBACK=false \
VITE_ENABLE_BACKEND_CHECK=true \
npm run build

echo "Build completed successfully!" 