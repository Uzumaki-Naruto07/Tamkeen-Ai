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
  console.log('Frontend health check endpoint called');
  res.json({
    status: 'ok',
    message: 'Frontend server is running',
    timestamp: new Date().toISOString(),
    server: 'frontend'
  });
});

// Add interview health check endpoint
app.get('/api/interviews/health-check', (req, res) => {
  console.log('Interview health check endpoint called');
  res.json({
    status: 'ok',
    message: 'Interview proxy is available',
    timestamp: new Date().toISOString(),
    server: 'interview-proxy'
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

// Add a proxy specifically for backend health checks with verbose logging
app.use('/api/backend-health', (req, res) => {
  console.log('Proxy health check request received');
  
  const healthProxy = createProxyMiddleware({
    target: MAIN_API_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/backend-health': '/api/health-check'
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log('Forwarding health check to backend:', MAIN_API_URL);
      proxyReq.setHeader('Origin', MAIN_API_URL);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('Backend health check response:', proxyRes.statusCode);
      // Add CORS headers to proxy response
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Auth-Token, Accept';
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    },
    onError: (err, req, res) => {
      console.error('Health check proxy error:', err);
      res.status(500).json({
        status: 'error',
        message: 'Health check proxy error',
        error: err.message
      });
    },
    logLevel: 'debug'
  });
  
  healthProxy(req, res);
});

// Main API catches all other /api routes
app.use('/api', createProxyWithCors('/api', MAIN_API_URL));

// Direct pass-through for auth endpoints for better CORS handling
app.all('/api/auth/*', (req, res, next) => {
  console.log('Auth API request detected:', req.url);
  
  const authProxy = createProxyMiddleware({
    target: MAIN_API_URL,
    changeOrigin: true,
    pathRewrite: path => path, // Keep the path as is
    onProxyReq: (proxyReq, req, res) => {
      console.log('Forwarding auth request to:', MAIN_API_URL);
      // Add origin to proxy request
      proxyReq.setHeader('Origin', MAIN_API_URL);
      
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
      console.log('Auth API response received with status:', proxyRes.statusCode);
      // Add CORS headers to proxy response
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Auth-Token, Accept';
      proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    },
    onError: (err, req, res) => {
      console.error('Auth proxy error:', err);
      res.status(500).json({
        status: 'error',
        message: 'Auth proxy error',
        error: err.message
      });
    }
  });
  
  authProxy(req, res, next);
});

// Create a CORS-fix JS file that can be included in any HTML page
app.get('/cors-fix.js', (req, res) => {
  const script = `
    // Tamkeen API CORS Fix Script
    // This script automatically intercepts direct API calls to backend services
    // and routes them through the proxy to avoid CORS issues
    (function() {
      console.log('Initializing Tamkeen API CORS Fix');
      
      // List of backend hostnames that should be proxied
      const BACKEND_HOSTNAMES = [
        'tamkeen-main-api.onrender.com',
        'tamkeen-interview-api.onrender.com',
        'tamkeen-predict-api.onrender.com',
        'tamkeen-upload-server.onrender.com'
      ];
      
      // Patch the XMLHttpRequest to intercept direct backend API calls
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        let newUrl = url;
        
        try {
          // Skip transformation for relative URLs
          if (url.startsWith('http')) {
            const urlObj = new URL(url);
            const isBackendUrl = BACKEND_HOSTNAMES.some(hostname => 
              urlObj.hostname.includes(hostname)
            );
            
            if (isBackendUrl) {
              const pathWithSearch = urlObj.pathname + urlObj.search;
              // If the path already starts with /api, use it as is
              // Otherwise prefix it with /api
              const apiPath = pathWithSearch.startsWith('/api') 
                ? pathWithSearch 
                : '/api' + pathWithSearch;
              
              console.log('API CORS Fix: Redirecting ' + url + ' → ' + apiPath);
              newUrl = apiPath;
            }
          }
        } catch (e) {
          console.error('Error transforming URL:', e);
        }
        
        return originalOpen.call(this, method, newUrl, async, user, password);
      };
      
      // Patch the fetch API to intercept direct backend API calls
      const originalFetch = window.fetch;
      window.fetch = function(resource, init) {
        // If the resource is a string URL, transform it
        if (typeof resource === 'string') {
          try {
            // Skip transformation for relative URLs
            if (resource.startsWith('http')) {
              const urlObj = new URL(resource);
              const isBackendUrl = BACKEND_HOSTNAMES.some(hostname => 
                urlObj.hostname.includes(hostname)
              );
              
              if (isBackendUrl) {
                const pathWithSearch = urlObj.pathname + urlObj.search;
                // If the path already starts with /api, use it as is
                // Otherwise prefix it with /api
                const apiPath = pathWithSearch.startsWith('/api') 
                  ? pathWithSearch 
                  : '/api' + pathWithSearch;
                
                console.log('API CORS Fix: Redirecting ' + resource + ' → ' + apiPath);
                resource = apiPath;
              }
            }
          } catch (e) {
            console.error('Error transforming URL in fetch:', e);
          }
        } 
        // If it's a Request object, we need to create a new one with the transformed URL
        else if (resource instanceof Request && resource.url.startsWith('http')) {
          try {
            const urlObj = new URL(resource.url);
            const isBackendUrl = BACKEND_HOSTNAMES.some(hostname => 
              urlObj.hostname.includes(hostname)
            );
            
            if (isBackendUrl) {
              const pathWithSearch = urlObj.pathname + urlObj.search;
              const apiPath = pathWithSearch.startsWith('/api') 
                ? pathWithSearch 
                : '/api' + pathWithSearch;
              
              console.log('API CORS Fix: Redirecting Request ' + resource.url + ' → ' + apiPath);
              
              // Create a new request with the transformed URL
              const newRequest = new Request(apiPath, {
                method: resource.method,
                headers: resource.headers,
                body: resource.body,
                mode: resource.mode,
                credentials: resource.credentials,
                cache: resource.cache,
                redirect: resource.redirect,
                referrer: resource.referrer,
                referrerPolicy: resource.referrerPolicy,
                integrity: resource.integrity,
                keepalive: resource.keepalive,
                signal: resource.signal
              });
              
              resource = newRequest;
            }
          } catch (e) {
            console.error('Error transforming Request:', e);
          }
        }
        
        return originalFetch.call(window, resource, init);
      };
      
      console.log('Tamkeen API CORS Fix initialized successfully');
    })();
  `;
  
  res.set('Content-Type', 'application/javascript');
  res.send(script);
});

// Add a diagnostic page for API connectivity issues
app.get('/api-diagnostics', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'cors-fix.html'));
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