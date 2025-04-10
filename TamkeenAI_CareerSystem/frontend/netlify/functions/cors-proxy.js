const axios = require('axios');

exports.handler = async function(event, context) {
  // Handle OPTIONS method for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': event.headers.origin || '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 
        'Allow': 'POST',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': event.headers.origin || '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      }
    };
  }

  try {
    const { url, method = 'GET', data, headers = {} } = JSON.parse(event.body);

    if (!url) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'URL is required' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': event.headers.origin || '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Credentials': 'true'
        }
      };
    }

    console.log(`Proxying request to: ${url} with method: ${method}`);

    // Forward the request to the target URL
    const response = await axios({
      method: method.toLowerCase(),
      url,
      data: data || {},
      headers: {
        ...headers,
        // Ensure Content-Type is set for the request
        'Content-Type': headers['Content-Type'] || 'application/json',
        // Forward any cookies that came with the request
        'Cookie': event.headers.cookie || '',
      },
      withCredentials: true,
    });

    // Capture any cookies from the response to pass back
    const cookies = response.headers['set-cookie'] || [];
    const responseHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': event.headers.origin || '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Credentials': 'true',
    };
    
    // Add cookies to response if present
    if (cookies.length > 0) {
      responseHeaders['Set-Cookie'] = cookies;
    }

    // Return the response
    return {
      statusCode: response.status,
      body: JSON.stringify(response.data),
      headers: responseHeaders
    };
  } catch (error) {
    console.log('Error:', error);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({
        error: error.message,
        data: error.response?.data
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': event.headers.origin || '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
      }
    };
  }
}; 