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

// Simple health check endpoint
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

// Configure enhanced proxy middleware with detailed logging and CORS handling
const createEnhancedProxy = (path, target) => {
  console.log(`Creating proxy for ${path} -> ${target}`);
  
  return createProxyMiddleware({
    target: target,
    changeOrigin: true,
    pathRewrite: (pathToRewrite, req) => {
      // Don't rewrite paths that already have the right prefix
      // This keeps the /api prefix intact when forwarding to the backend
      const newPath = pathToRewrite;
      console.log(`Proxy path rewrite: ${pathToRewrite} -> ${newPath}`);
      return newPath;
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add origin to proxy request
      proxyReq.setHeader('Origin', target);
      
      // Set proper content type for POST/PUT requests with JSON body
      if (['POST', 'PUT'].includes(req.method) && req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        
        // Log request details
        console.log(`Proxying ${req.method} request to: ${req.url}`);
        console.log('Request headers:', proxyReq.getHeaders());
        
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Force CORS headers on all responses
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Auth-Token, Accept';
      
      // Log response code
      console.log(`Proxy response from ${req.url}: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for ${req.url}:`, err);
      res.status(500).json({
        status: 'error',
        message: 'Proxy error occurred',
        error: err.message
      });
    },
    logLevel: 'debug'
  });
};

// Set up proxy routes - order matters! More specific routes first
app.use('/api/interviews', createEnhancedProxy('/api/interviews', INTERVIEW_API_URL));
app.use('/api/predict', createEnhancedProxy('/api/predict', PREDICT_API_URL));
app.use('/api/upload', createEnhancedProxy('/api/upload', UPLOAD_SERVER_URL));

// Main API catches all other /api routes
app.use('/api', createEnhancedProxy('/api', MAIN_API_URL));

// Special handling for auth endpoints
app.use('/api/auth', createEnhancedProxy('/api/auth', MAIN_API_URL));

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