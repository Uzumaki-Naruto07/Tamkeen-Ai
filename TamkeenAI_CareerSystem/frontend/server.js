// Simple Express server with CORS middleware for local development
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';

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

// Make sure OPTIONS requests are handled properly for CORS
app.options('*', cors());

// Health check should be available at the root level too
app.get('/health-check', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Frontend server is running',
    timestamp: new Date().toISOString()
  });
});

// Configure proxy middleware with CORS handling
const createProxyWithCors = (path, target) => {
  return createProxyMiddleware(path, {
    target: target,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      // Add origin to proxy request
      proxyReq.setHeader('Origin', target);
      
      // For POST requests, ensure the body is properly forwarded
      if (req.method === 'POST' && req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        // Write body to request
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add CORS headers to proxy response
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Auth-Token, Accept';
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    },
    pathRewrite: {
      // Don't rewrite paths as the backend already has the /api prefix
      //'^/api': '/api'
    },
    logLevel: 'debug'
  });
};

// Set up proxy routes - order matters! More specific routes first
app.use('/api/interviews', createProxyWithCors('/api/interviews', INTERVIEW_API_URL));
app.use('/api/predict', createProxyWithCors('/api/predict', PREDICT_API_URL));
app.use('/api/upload', createProxyWithCors('/api/upload', UPLOAD_SERVER_URL));

// Main API catches all other /api routes
app.use('/api', createProxyWithCors('/api', MAIN_API_URL));

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
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    },
    logLevel: 'debug'
  });
  
  authProxy(req, res);
});

// Special handler for login route
app.all('/api/auth/login', (req, res, next) => {
  console.log('Special handling for login request');
  
  // Create a direct proxy specifically for login
  const loginProxy = createProxyMiddleware({
    target: MAIN_API_URL,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      // Make sure content-type is set properly for POST requests
      if (req.method === 'POST' && req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add CORS headers to proxy response
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Auth-Token, Accept';
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    },
    logLevel: 'debug'
  });
  
  loginProxy(req, res, next);
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for all other routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Main API URL: ${MAIN_API_URL}`);
  console.log(`Interview API URL: ${INTERVIEW_API_URL}`);
}); 