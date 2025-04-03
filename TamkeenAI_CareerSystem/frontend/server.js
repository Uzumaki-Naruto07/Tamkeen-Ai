// Simple Express server with CORS middleware for local development
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add proxy middleware for API routes
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api' // Keep the /api prefix
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log the proxied request
    console.log(`Proxying ${req.method} request to: ${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
  }
}));

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'CORS proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`CORS proxy server running on port ${PORT}`);
  console.log(`Use it by sending requests to http://localhost:${PORT}/api/...`);
}); 