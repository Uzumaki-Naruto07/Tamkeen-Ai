const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if it exists
if (fs.existsSync(path.join(__dirname, 'frontend/.env'))) {
  dotenv.config({ path: path.join(__dirname, 'frontend/.env') });
}

// API services to test
const API_SERVICES = [
  {
    name: 'Main API',
    url: process.env.VITE_API_URL || 'https://tamkeen-main-api.onrender.com',
    healthPath: '/api/health-check',
  },
  {
    name: 'Interview API',
    url: process.env.VITE_INTERVIEW_API_URL || 'https://tamkeen-interview-api.onrender.com',
    healthPath: '/api/interviews/health-check',
  },
  {
    name: 'Predict API',
    url: process.env.VITE_PREDICT_API_URL || 'https://tamkeen-predict-api.onrender.com',
    healthPath: '/api/predict/health-check',
  },
  {
    name: 'Upload Server',
    url: process.env.VITE_UPLOAD_SERVER_URL || 'https://tamkeen-upload-server.onrender.com',
    healthPath: '/api/upload/health-check',
  }
];

// Test the connection to each service
async function testApiConnectivity() {
  console.log('Testing API connectivity...');
  console.log('-------------------------');
  
  for (const service of API_SERVICES) {
    try {
      console.log(`Testing ${service.name}...`);
      const fullUrl = `${service.url}${service.healthPath}`;
      console.log(`URL: ${fullUrl}`);
      
      const response = await axios.get(fullUrl, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'Origin': 'https://tamkeen-frontend.onrender.com'
        }
      });
      
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
      console.log(`CORS Headers:`);
      console.log(`  Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'Not set'}`);
      console.log(`  Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods'] || 'Not set'}`);
      console.log(`  Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers'] || 'Not set'}`);
      console.log(`  Access-Control-Allow-Credentials: ${response.headers['access-control-allow-credentials'] || 'Not set'}`);
      console.log('-------------------------');
    } catch (error) {
      console.error(`Error testing ${service.name}:`);
      
      if (error.response) {
        // The server responded with a status code outside of 2xx
        console.error(`Status: ${error.response.status}`);
        console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
        console.error(`Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from server');
        console.error(`Request: ${error.request._currentUrl}`);
      } else {
        // Something else happened when setting up the request
        console.error(`Error: ${error.message}`);
      }
      
      console.log('-------------------------');
    }
  }
}

// Test login API
async function testLoginApi() {
  try {
    console.log('Testing login API...');
    const loginUrl = `${API_SERVICES[0].url}/api/auth/login`;
    console.log(`URL: ${loginUrl}`);
    
    // Sample credentials - replace with actual test credentials if needed
    const credentials = {
      email: 'user@tamkeen.ai',
      password: 'user123'
    };
    
    const response = await axios.post(loginUrl, credentials, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://tamkeen-frontend.onrender.com'
      }
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
    console.log(`CORS Headers:`);
    console.log(`  Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'Not set'}`);
    console.log(`  Access-Control-Allow-Methods: ${response.headers['access-control-allow-methods'] || 'Not set'}`);
    console.log(`  Access-Control-Allow-Headers: ${response.headers['access-control-allow-headers'] || 'Not set'}`);
    console.log(`  Access-Control-Allow-Credentials: ${response.headers['access-control-allow-credentials'] || 'Not set'}`);
  } catch (error) {
    console.error('Error testing login API:');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
      console.error(`Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error(`Error: ${error.message}`);
    }
  }
  
  console.log('-------------------------');
}

// Run the tests
async function runTests() {
  await testApiConnectivity();
  await testLoginApi();
  
  console.log('All tests completed.');
}

runTests();