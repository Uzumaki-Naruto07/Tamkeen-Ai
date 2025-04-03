// Simple Express server with CORS middleware for local development
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

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

// Handle direct access to chatgpt endpoints
app.use('/chatgpt', createProxyMiddleware({
  target: 'http://localhost:5001/api',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ChatGPT request to: ${proxyReq.path}`);
  }
}));

// Handle direct access to chat/ai endpoints
app.use('/chat/ai', createProxyMiddleware({
  target: 'http://localhost:5001/api',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying Chat AI request to: ${proxyReq.path}`);
  }
}));

// Ollama proxy for local AI
app.use('/ollama', createProxyMiddleware({
  target: 'http://localhost:11434',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying Ollama request to: ${proxyReq.path}`);
  }
}));

// Alternatively handle chat endpoints with custom logic for mock responses when backend is down
app.post('/local/ai', (req, res) => {
  console.log('Using local AI fallback');
  setTimeout(() => {
    res.json({
      response: "This is a fallback response from the local proxy server. The AI backend might be unavailable, but I can still provide some helpful information based on your query.",
      provider: "local-fallback",
      model: "proxy-fallback-model",
      timestamp: new Date().toISOString()
    });
  }, 500);
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'CORS proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`CORS proxy server running on port ${PORT}`);
  console.log(`Use it by sending requests to http://localhost:${PORT}/api/...`);
  console.log(`ChatGPT endpoint: http://localhost:${PORT}/chatgpt/message`);
  console.log(`Chat AI endpoint: http://localhost:${PORT}/chat/ai/recommendation`);
}); 