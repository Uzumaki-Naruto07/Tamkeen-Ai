import { useState, useEffect } from 'react';
import axios from 'axios';

const API_SERVICES = [
  {
    name: 'Main API',
    healthUrl: '/api/health-check',
    baseUrl: import.meta.env.VITE_API_URL || 'https://tamkeen-main-api.onrender.com'
  },
  {
    name: 'Interview API',
    healthUrl: '/api/interviews/health-check',
    baseUrl: import.meta.env.VITE_INTERVIEW_API_URL || 'https://tamkeen-interview-api.onrender.com'
  },
  {
    name: 'Predict API',
    healthUrl: '/api/predict/health-check',
    baseUrl: import.meta.env.VITE_PREDICT_API_URL || 'https://tamkeen-predict-api.onrender.com'
  },
  {
    name: 'Upload API',
    healthUrl: '/api/upload/health-check',
    baseUrl: import.meta.env.VITE_UPLOAD_SERVER_URL || 'https://tamkeen-upload-server.onrender.com'
  }
];

const BackendConnectionChecker = () => {
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const checkBackendServices = async () => {
    setLoading(true);
    setError(null);
    
    const newStatuses = {};
    
    for (const service of API_SERVICES) {
      try {
        // First try through proxy (relative URL)
        let response = null;
        let success = false;
        
        try {
          response = await axios.get(service.healthUrl, {
            timeout: 5000,
            headers: { 'Accept': 'application/json' }
          });
          success = response.status === 200;
        } catch (proxyError) {
          console.log(`Proxy error for ${service.name}:`, proxyError);
          
          // If proxy fails, try direct URL
          try {
            const directUrl = `${service.baseUrl}${service.healthUrl}`;
            console.log(`Trying direct URL: ${directUrl}`);
            
            response = await axios.get(directUrl, {
              timeout: 5000,
              headers: { 'Accept': 'application/json' }
            });
            success = response.status === 200;
          } catch (directError) {
            console.log(`Direct request error for ${service.name}:`, directError);
            success = false;
          }
        }
        
        newStatuses[service.name] = {
          status: success ? 'online' : 'offline',
          message: success ? 'Connected' : 'Failed to connect',
          timestamp: new Date().toISOString()
        };
      } catch (err) {
        console.error(`Error checking ${service.name}:`, err);
        newStatuses[service.name] = {
          status: 'error',
          message: err.message || 'Unknown error',
          timestamp: new Date().toISOString()
        };
      }
    }
    
    setStatuses(newStatuses);
    setLoading(false);
  };

  useEffect(() => {
    checkBackendServices();
    
    // Check every 60 seconds
    const interval = setInterval(checkBackendServices, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && Object.keys(statuses).length === 0) {
    return (
      <div className="backend-checker backend-checker-loading">
        Checking backend connections...
      </div>
    );
  }

  const allOnline = Object.values(statuses).every(s => s.status === 'online');

  return (
    <div className={`backend-checker ${allOnline ? 'backend-checker-success' : 'backend-checker-error'}`}>
      <div 
        className="backend-checker-header"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="status-indicator">
          {allOnline ? '✅' : '❌'}
        </span>
        <span>
          Backend services: {allOnline ? 'All connected' : 'Connection issues'}
        </span>
        <button 
          className="refresh-button"
          onClick={(e) => {
            e.stopPropagation();
            checkBackendServices();
          }}
        >
          🔄
        </button>
      </div>
      
      {expanded && (
        <div className="backend-checker-details">
          {API_SERVICES.map(service => (
            <div 
              key={service.name}
              className={`service-status service-${statuses[service.name]?.status || 'unknown'}`}
            >
              <span className="service-name">{service.name}:</span>
              <span className="service-indicator">
                {statuses[service.name]?.status === 'online' ? '✅' : '❌'}
              </span>
              <span className="service-message">
                {statuses[service.name]?.message || 'Checking...'}
              </span>
            </div>
          ))}
          
          <div className="backend-urls">
            <h4>API URLs</h4>
            <ul>
              {API_SERVICES.map(service => (
                <li key={service.name}>
                  {service.name}: {service.baseUrl}
                </li>
              ))}
            </ul>
          </div>
          
          <style jsx>{`
            .backend-checker {
              position: fixed;
              bottom: 20px;
              right: 20px;
              z-index: 1000;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
              overflow: hidden;
              max-width: 400px;
              border: 1px solid #ddd;
            }
            
            .backend-checker-header {
              display: flex;
              align-items: center;
              padding: 8px 12px;
              cursor: pointer;
              background: #f8f8f8;
              border-bottom: 1px solid #eee;
            }
            
            .backend-checker-success .backend-checker-header {
              background: #e7f7e7;
            }
            
            .backend-checker-error .backend-checker-header {
              background: #ffebee;
            }
            
            .status-indicator {
              margin-right: 8px;
            }
            
            .refresh-button {
              margin-left: auto;
              background: none;
              border: none;
              cursor: pointer;
              font-size: 16px;
            }
            
            .backend-checker-details {
              padding: 12px;
            }
            
            .service-status {
              margin-bottom: 8px;
              padding: 6px;
              border-radius: 4px;
            }
            
            .service-online {
              background: #e7f7e7;
            }
            
            .service-offline, .service-error {
              background: #ffebee;
            }
            
            .service-unknown {
              background: #f5f5f5;
            }
            
            .service-name {
              font-weight: 500;
              margin-right: 8px;
            }
            
            .service-indicator {
              margin-right: 8px;
            }
            
            .backend-urls {
              margin-top: 12px;
              font-size: 12px;
              color: #666;
            }
            
            .backend-urls h4 {
              margin: 0 0 8px 0;
              font-size: 14px;
            }
            
            .backend-urls ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }
            
            .backend-urls li {
              margin-bottom: 4px;
              word-break: break-all;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default BackendConnectionChecker; 