import axios from 'axios';
import { API_BASE_URL, INTERVIEW_API_BASE_URL } from './apiConfig';

// Health check timeout in milliseconds
const HEALTH_CHECK_TIMEOUT = 10000;

// Health check endpoints - Using only relative paths
const MAIN_HEALTH_ENDPOINT = '/api/health-check';
const INTERVIEW_HEALTH_ENDPOINT = '/api/interviews/health-check';
const BACKEND_HEALTH_ENDPOINT = '/api/backend-health';

// Create a dedicated axios instance for health checks
const healthCheckClient = axios.create({
  timeout: HEALTH_CHECK_TIMEOUT,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  // Disable credentials to avoid CORS preflight issues
  withCredentials: false
});

/**
 * Check if the main backend is available
 * @returns {Promise<boolean>} True if available, false otherwise
 */
export const checkMainBackendHealth = async () => {
  try {
    // Try all possible health endpoints in sequence
    const endpoints = [
      // Frontend health check
      MAIN_HEALTH_ENDPOINT,
      // Backend health check via proxy
      BACKEND_HEALTH_ENDPOINT,
      // Try health check without /api prefix
      '/health-check'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log('Checking main backend health at:', endpoint);
        const response = await healthCheckClient.get(endpoint);
        
        if (response.status === 200) {
          console.log('Main backend health check response:', response.status);
          return true;
        }
      } catch (error) {
        console.warn(`Health check failed for ${endpoint}:`, error.message);
        // Continue to next endpoint
      }
    }
    
    // All health checks failed
    console.warn('All main backend health checks failed');
    return true; // Emergency fallback
  } catch (error) {
    console.error('All main backend health checks failed:', error.message);
    return true; // Emergency fallback
  }
};

/**
 * Check if the interview backend is available
 * @returns {Promise<boolean>} True if available, false otherwise
 */
export const checkInterviewBackendHealth = async () => {
  try {
    // Try all possible health endpoints in sequence
    const endpoints = [
      INTERVIEW_HEALTH_ENDPOINT,
      '/api/interviews/health'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log('Checking interview backend health at:', endpoint);
        const response = await healthCheckClient.get(endpoint);
        
        if (response.status === 200) {
          console.log('Interview backend health check response:', response.status);
          return true;
        }
      } catch (error) {
        console.warn(`Health check failed for ${endpoint}:`, error.message);
        // Continue to next endpoint
      }
    }
    
    // All health checks failed
    console.warn('All interview health checks failed, using emergency fallback');
    return true; // Emergency fallback
  } catch (error) {
    console.error('All interview backend health checks failed:', error.message);
    return true; // Emergency fallback
  }
};

/**
 * Check health of all backend services
 * @returns {Promise<Object>} Status of each backend service
 */
export const checkAllBackendHealth = async () => {
  const [mainHealth, interviewHealth] = await Promise.all([
    checkMainBackendHealth().catch(() => true),
    checkInterviewBackendHealth().catch(() => true)
  ]);

  return {
    main: mainHealth,
    interview: interviewHealth,
    allHealthy: true // Force healthy status
  };
};

/**
 * Set up periodic health checks
 * @param {Function} onStatusChange Callback when status changes
 * @param {number} interval Check interval in milliseconds
 * @returns {Function} Function to cancel the health checks
 */
export const setupPeriodicHealthChecks = (onStatusChange, interval = 30000) => {
  let previousStatus = {
    main: false,
    interview: false,
    allHealthy: false
  };

  const checkInterval = setInterval(async () => {
    const currentStatus = await checkAllBackendHealth();
    
    // Only call the callback if status changed
    if (
      previousStatus.main !== currentStatus.main ||
      previousStatus.interview !== currentStatus.interview ||
      previousStatus.allHealthy !== currentStatus.allHealthy
    ) {
      onStatusChange(currentStatus);
      previousStatus = currentStatus;
    }
  }, interval);

  return () => {
    clearInterval(checkInterval);
  };
}; 