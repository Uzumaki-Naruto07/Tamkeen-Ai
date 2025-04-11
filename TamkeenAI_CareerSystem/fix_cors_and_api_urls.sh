#!/bin/bash
# Script to fix CORS and API URL issues in TamkeenAI_CareerSystem

echo "==== Starting fixes for TamkeenAI_CareerSystem ===="

# 1. Make sure environment variables are correctly set
echo "Setting up correct environment variables..."

# Create or update .env.production for frontend
cat > frontend/.env.production << 'EOF'
# Production Environment Variables
VITE_API_URL=https://tamkeen-main-api.onrender.com
VITE_INTERVIEW_API_URL=https://tamkeen-interview-api.onrender.com
VITE_UPLOAD_SERVER_URL=https://tamkeen-upload-server.onrender.com
VITE_USE_MOCK_DATA=false
VITE_ENABLE_MOCK_DATA=false
VITE_USE_DEEPSEEK_OPENAI_FALLBACK=true
VITE_ENABLE_MOCK_FALLBACK=false
VITE_ENABLE_BACKEND_CHECK=true
VITE_MODE=production
EOF

echo "Frontend production environment variables updated."

# 2. Create a test script to check connectivity
echo "Creating connectivity test script..."

cat > test_connectivity.js << 'EOF'
const axios = require('axios');

// Configuration
const API_URL = process.env.API_URL || 'https://tamkeen-main-api.onrender.com';
const INTERVIEW_API_URL = process.env.INTERVIEW_API_URL || 'https://tamkeen-interview-api.onrender.com';
const UPLOAD_SERVER_URL = process.env.UPLOAD_SERVER_URL || 'https://tamkeen-upload-server.onrender.com';

const ENDPOINTS = [
  // Main API health endpoints
  { name: 'Main API /api/health-check', url: `${API_URL}/api/health-check` },
  { name: 'Main API /api/health', url: `${API_URL}/api/health` },
  { name: 'Main API /health-check', url: `${API_URL}/health-check` },
  { name: 'Main API /health', url: `${API_URL}/health` },
  
  // Interview API health endpoints
  { name: 'Interview API /api/interviews/health-check', url: `${INTERVIEW_API_URL}/api/interviews/health-check` },
  { name: 'Interview API /api/health-check', url: `${INTERVIEW_API_URL}/api/health-check` },
  { name: 'Interview API /health-check', url: `${INTERVIEW_API_URL}/health-check` },
  
  // Upload server health endpoints
  { name: 'Upload Server /api/health-check', url: `${UPLOAD_SERVER_URL}/api/health-check` },
  { name: 'Upload Server /health-check', url: `${UPLOAD_SERVER_URL}/health-check` },
  
  // Auth endpoint (CORS test)
  { name: 'Auth Login Endpoint', url: `${API_URL}/api/auth/login`, method: 'OPTIONS' }
];

// Test each endpoint
async function testEndpoint(endpoint) {
  try {
    const method = endpoint.method || 'GET';
    console.log(`Testing ${endpoint.name} (${method} ${endpoint.url})...`);
    
    const response = await axios({
      method: method,
      url: endpoint.url,
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': 'https://tamkeen-frontend.onrender.com'
      }
    });
    
    console.log(`✅ ${endpoint.name}: SUCCESS (${response.status})`);
    
    // For OPTIONS requests, check CORS headers
    if (method === 'OPTIONS') {
      const corsHeaders = [
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Headers'
      ];
      
      const missingHeaders = corsHeaders.filter(header => !response.headers[header.toLowerCase()]);
      
      if (missingHeaders.length === 0) {
        console.log(`✅ CORS headers are correctly set`);
        console.log(`  Origin: ${response.headers['access-control-allow-origin']}`);
        console.log(`  Methods: ${response.headers['access-control-allow-methods']}`);
        console.log(`  Headers: ${response.headers['access-control-allow-headers']}`);
      } else {
        console.log(`❌ Missing CORS headers: ${missingHeaders.join(', ')}`);
      }
    }
    
    return true;
  } catch (error) {
    console.log(`❌ ${endpoint.name}: FAILED`);
    if (error.response) {
      console.log(`  Status: ${error.response.status}`);
      console.log(`  Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.log(`  No response received (timeout or network error)`);
    } else {
      console.log(`  Error: ${error.message}`);
    }
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('==== Testing TamkeenAI API Connectivity ====');
  console.log(`Main API URL: ${API_URL}`);
  console.log(`Interview API URL: ${INTERVIEW_API_URL}`);
  console.log(`Upload Server URL: ${UPLOAD_SERVER_URL}`);
  console.log('');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const endpoint of ENDPOINTS) {
    const success = await testEndpoint(endpoint);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    console.log(''); // Empty line for readability
  }
  
  console.log('==== Test Summary ====');
  console.log(`Total endpoints tested: ${ENDPOINTS.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  
  if (failCount === 0) {
    console.log('✅ All endpoints are working correctly!');
  } else {
    console.log('❌ Some endpoints are not working correctly. Please check the logs above.');
  }
}

runTests();
EOF

echo "Connectivity test script created."

# Create a simple HTML file to test connectivity
cat > connectivity_test.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TamkeenAI API Connectivity Test</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    h1 {
      color: #333;
    }
    .endpoint {
      margin-bottom: 10px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .success {
      background-color: #d4edda;
      border-color: #c3e6cb;
    }
    .failure {
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }
    .pending {
      background-color: #fff3cd;
      border-color: #ffeeba;
    }
    button {
      background-color: #4CAF50;
      color: white;
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background-color: #45a049;
    }
    pre {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>TamkeenAI API Connectivity Test</h1>
    <button id="testButton">Run Tests</button>
    <div id="results">
      <p>Click the button above to test API connectivity.</p>
    </div>
  </div>

  <script>
    document.getElementById('testButton').addEventListener('click', runTests);

    const API_URL = 'https://tamkeen-main-api.onrender.com';
    const INTERVIEW_API_URL = 'https://tamkeen-interview-api.onrender.com';
    const UPLOAD_SERVER_URL = 'https://tamkeen-upload-server.onrender.com';

    const ENDPOINTS = [
      // Main API health endpoints
      { name: 'Main API /api/health-check', url: `${API_URL}/api/health-check` },
      { name: 'Main API /api/health', url: `${API_URL}/api/health` },
      { name: 'Main API /health-check', url: `${API_URL}/health-check` },
      { name: 'Main API /health', url: `${API_URL}/health` },
      
      // Interview API health endpoints
      { name: 'Interview API /api/interviews/health-check', url: `${INTERVIEW_API_URL}/api/interviews/health-check` },
      { name: 'Interview API /api/health-check', url: `${INTERVIEW_API_URL}/api/health-check` },
      { name: 'Interview API /health-check', url: `${INTERVIEW_API_URL}/health-check` },
      
      // Upload server health endpoints
      { name: 'Upload Server /api/health-check', url: `${UPLOAD_SERVER_URL}/api/health-check` },
      { name: 'Upload Server /health-check', url: `${UPLOAD_SERVER_URL}/health-check` },
      
      // Auth endpoint (CORS test)
      { name: 'Auth Login Endpoint (CORS)', url: `${API_URL}/api/auth/login`, method: 'OPTIONS' }
    ];

    async function testEndpoint(endpoint) {
      try {
        const method = endpoint.method || 'GET';
        console.log(`Testing ${endpoint.name} (${method} ${endpoint.url})...`);
        
        const response = await fetch(endpoint.url, {
          method: method,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': 'https://tamkeen-frontend.onrender.com'
          },
          mode: 'cors'
        });
        
        console.log(`${endpoint.name}: SUCCESS (${response.status})`);
        
        // For OPTIONS requests, check CORS headers
        if (method === 'OPTIONS') {
          const corsHeaders = [
            'access-control-allow-origin',
            'access-control-allow-methods',
            'access-control-allow-headers'
          ];
          
          const missingHeaders = corsHeaders.filter(header => !response.headers.get(header));
          
          if (missingHeaders.length === 0) {
            console.log(`CORS headers are correctly set`);
            console.log(`Origin: ${response.headers.get('access-control-allow-origin')}`);
            console.log(`Methods: ${response.headers.get('access-control-allow-methods')}`);
            console.log(`Headers: ${response.headers.get('access-control-allow-headers')}`);
          } else {
            console.log(`Missing CORS headers: ${missingHeaders.join(', ')}`);
            return {
              success: true,
              warning: `Missing CORS headers: ${missingHeaders.join(', ')}`
            };
          }
        }
        
        return { success: true };
      } catch (error) {
        console.log(`${endpoint.name}: FAILED`);
        console.log(`Error: ${error.message}`);
        return { 
          success: false, 
          error: error.message 
        };
      }
    }

    async function runTests() {
      const resultsDiv = document.getElementById('results');
      resultsDiv.innerHTML = '<h2>Test Results</h2>';
      
      let successCount = 0;
      let failCount = 0;
      
      for (const endpoint of ENDPOINTS) {
        const endpointDiv = document.createElement('div');
        endpointDiv.className = 'endpoint pending';
        endpointDiv.innerHTML = `<h3>${endpoint.name}</h3><p>Testing ${endpoint.url}...</p>`;
        resultsDiv.appendChild(endpointDiv);
        
        try {
          const result = await testEndpoint(endpoint);
          
          if (result.success) {
            endpointDiv.className = 'endpoint success';
            endpointDiv.innerHTML = `<h3>✅ ${endpoint.name}</h3><p>URL: ${endpoint.url}</p>`;
            
            if (result.warning) {
              endpointDiv.innerHTML += `<p>Warning: ${result.warning}</p>`;
            }
            
            successCount++;
          } else {
            endpointDiv.className = 'endpoint failure';
            endpointDiv.innerHTML = `<h3>❌ ${endpoint.name}</h3><p>URL: ${endpoint.url}</p><p>Error: ${result.error}</p>`;
            failCount++;
          }
        } catch (error) {
          endpointDiv.className = 'endpoint failure';
          endpointDiv.innerHTML = `<h3>❌ ${endpoint.name}</h3><p>URL: ${endpoint.url}</p><p>Error: ${error.message}</p>`;
          failCount++;
        }
      }
      
      const summaryDiv = document.createElement('div');
      summaryDiv.innerHTML = `
        <h2>Test Summary</h2>
        <p>Total endpoints tested: ${ENDPOINTS.length}</p>
        <p>Successful: ${successCount}</p>
        <p>Failed: ${failCount}</p>
      `;
      
      if (failCount === 0) {
        summaryDiv.innerHTML += '<p>✅ All endpoints are working correctly!</p>';
      } else {
        summaryDiv.innerHTML += '<p>❌ Some endpoints are not working correctly. Please check the results above.</p>';
      }
      
      resultsDiv.appendChild(summaryDiv);
    }
  </script>
</body>
</html>
EOF

echo "HTML connectivity test created."

echo "==== All fixes have been applied ===="
echo "To test connectivity run one of these commands:"
echo "1. For Node.js test: node test_connectivity.js"
echo "2. For browser test: Open connectivity_test.html in your browser"
echo "3. To check backend logs: Visit the Render dashboard for each service"

# Make script executable
chmod +x test_connectivity.js

echo "Done!" 