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
