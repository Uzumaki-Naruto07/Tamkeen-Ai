// CORS Proxy Server for Development
import corsAnywhere from 'cors-anywhere';

// Create a CORS Anywhere server
const host = '0.0.0.0';
const port = 8080;

// Set up server options
const options = {
  originWhitelist: [], // Allow all origins
  requireHeader: [], // Do not require any specific headers
  removeHeaders: ['cookie', 'cookie2'], // Remove cookies for security
  handleInitialRequest: (req, res) => {
    // Add CORS headers for preflight requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle OPTIONS method for preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return true;
    }
    
    return false; // Continue with normal cors-anywhere handling
  }
};

// Create and start the server
corsAnywhere.createServer(options).listen(port, host, () => {
  console.log(`CORS Anywhere proxy running on ${host}:${port}`);
  console.log(`Use it by prepending http://localhost:${port}/ to your API calls`);
  console.log('Example: http://localhost:8080/http://localhost:5001/api/interviews/conversation');
  console.log('Or use the proxy configured in vite.config.js');
}); 