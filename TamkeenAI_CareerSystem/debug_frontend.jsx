import { useState, useEffect } from 'react';

function DebugFrontend() {
  const [systemInfo, setSystemInfo] = useState({});
  const [apiStatus, setApiStatus] = useState('Not tested');
  const [testUrl, setTestUrl] = useState('http://localhost:5050/debug');
  const [errorDetails, setErrorDetails] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // Add a log message with timestamp
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };
  
  // System information
  useEffect(() => {
    addLog('Getting system information');
    setSystemInfo({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      localStorage: typeof localStorage !== 'undefined',
      cookies: navigator.cookieEnabled
    });
  }, []);
  
  // Test API connection
  const testApiConnection = async () => {
    addLog(`Testing API connection to ${testUrl}`);
    setApiStatus('Testing...');
    setErrorDetails(null);
    
    try {
      // Add timestamp to URL to prevent caching
      const urlWithTimestamp = `${testUrl}?t=${Date.now()}`;
      
      // Log request details
      addLog(`Making request to: ${urlWithTimestamp}`, 'info');
      
      // Set up timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // Make request with detailed error handling
      const response = await fetch(urlWithTimestamp, {
        signal: controller.signal,
        mode: 'cors', // Explicitly request CORS
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Process response
      addLog(`Received response with status: ${response.status}`, 'info');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      addLog('Successfully parsed JSON response', 'success');
      setApiStatus('Connected');
      setErrorDetails({ 
        message: 'API connection successful',
        data: JSON.stringify(data, null, 2)
      });
      
    } catch (error) {
      addLog(`API connection error: ${error.message}`, 'error');
      setApiStatus('Failed');
      
      // Detailed error information
      let detailedError = {
        message: error.message,
        name: error.name,
        stack: error.stack
      };
      
      // Check for network errors
      if (error.name === 'TypeError' && error.message.includes('Network')) {
        detailedError.suggestion = 'This looks like a CORS or network error. Make sure the server is running and has CORS enabled.';
      }
      
      // Check for abort errors
      if (error.name === 'AbortError') {
        detailedError.suggestion = 'Request timed out after 10 seconds. Check if the server is responsive.';
      }
      
      setErrorDetails(detailedError);
    }
  };
  
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Frontend Diagnostic Tool</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>System Information</h2>
        <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px' }}>
          {JSON.stringify(systemInfo, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>API Connection Test</h2>
        <div>
          <input 
            type="text" 
            value={testUrl} 
            onChange={(e) => setTestUrl(e.target.value)} 
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          />
          <button 
            onClick={testApiConnection}
            style={{ 
              padding: '8px 16px', 
              background: '#4a90e2', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test Connection
          </button>
        </div>
        
        <div style={{ marginTop: '15px' }}>
          <p><strong>Status:</strong> 
            <span style={{ 
              color: apiStatus === 'Connected' ? 'green' : 
                     apiStatus === 'Failed' ? 'red' : 'orange'
            }}>
              {apiStatus}
            </span>
          </p>
          
          {errorDetails && (
            <div style={{ 
              background: apiStatus === 'Connected' ? '#e6ffe6' : '#ffe6e6', 
              padding: '10px', 
              borderRadius: '4px',
              marginTop: '10px'
            }}>
              <h3>Details:</h3>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {apiStatus === 'Connected' 
                  ? errorDetails.data
                  : JSON.stringify(errorDetails, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h2>Logs</h2>
        <div style={{ 
          background: '#f4f4f4', 
          padding: '10px', 
          borderRadius: '4px',
          height: '200px',
          overflowY: 'scroll'
        }}>
          {logs.map((log, index) => (
            <div key={index} style={{ 
              marginBottom: '5px',
              color: log.type === 'error' ? 'red' : 
                     log.type === 'success' ? 'green' : 'black'
            }}>
              <span style={{ color: '#666', fontSize: '0.8em' }}>
                {log.timestamp.split('T')[1].split('.')[0]}
              </span>
              {' '}{log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DebugFrontend; 