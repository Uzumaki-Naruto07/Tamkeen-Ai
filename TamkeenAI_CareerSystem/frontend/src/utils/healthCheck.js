import axios from 'axios';
import { API_BASE_URL, INTERVIEW_API_BASE_URL } from './apiConfig';

// Health check timeout in milliseconds
const HEALTH_CHECK_TIMEOUT = 10000;

// Health check endpoints - Using the correct endpoints that exist in the backend
const MAIN_HEALTH_ENDPOINT = `${API_BASE_URL}/api/health-check`;
const INTERVIEW_HEALTH_ENDPOINT = `${INTERVIEW_API_BASE_URL}/api/health-check`;

// Alternative health endpoints to try if the primary ones fail
const ALTERNATIVE_MAIN_HEALTH_ENDPOINT = `${API_BASE_URL}/health`;
const ALTERNATIVE_INTERVIEW_HEALTH_ENDPOINT = `${INTERVIEW_API_BASE_URL}/health`;

/**
 * Check if the main backend is available
 * @returns {Promise<boolean>} True if available, false otherwise
 */
export const checkMainBackendHealth = async () => {
  try {
    // Try the main health endpoint first
    try {
      console.log('Checking main backend health at:', MAIN_HEALTH_ENDPOINT);
      const response = await axios.get(MAIN_HEALTH_ENDPOINT, {
        timeout: HEALTH_CHECK_TIMEOUT,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // Disable credentials to avoid CORS preflight
        withCredentials: false
      });
      
      console.log('Main backend health check response:', response.status);
      return response.status === 200;
    } catch (primaryError) {
      console.warn('Primary health check failed, trying alternative endpoint:', primaryError.message);
      
      // If primary endpoint fails, try the alternative
      const altResponse = await axios.get(ALTERNATIVE_MAIN_HEALTH_ENDPOINT, {
        timeout: HEALTH_CHECK_TIMEOUT,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        withCredentials: false
      });
      
      console.log('Alternative main backend health check response:', altResponse.status);
      return altResponse.status === 200;
    }
  } catch (error) {
    console.error('All main backend health checks failed:', error.message);
    return false;
  }
};

/**
 * Check if the interview backend is available
 * @returns {Promise<boolean>} True if available, false otherwise
 */
export const checkInterviewBackendHealth = async () => {
  try {
    // Try the main interview health endpoint first
    try {
      console.log('Checking interview backend health at:', INTERVIEW_HEALTH_ENDPOINT);
      const response = await axios.get(INTERVIEW_HEALTH_ENDPOINT, {
        timeout: HEALTH_CHECK_TIMEOUT,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        withCredentials: false
      });
      
      console.log('Interview backend health check response:', response.status);
      return response.status === 200;
    } catch (primaryError) {
      console.warn('Primary interview health check failed, trying alternative endpoint:', primaryError.message);
      
      // If primary endpoint fails, try the alternative
      const altResponse = await axios.get(ALTERNATIVE_INTERVIEW_HEALTH_ENDPOINT, {
        timeout: HEALTH_CHECK_TIMEOUT,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        withCredentials: false
      });
      
      console.log('Alternative interview backend health check response:', altResponse.status);
      return altResponse.status === 200;
    }
  } catch (error) {
    console.error('All interview backend health checks failed:', error.message);
    return false;
  }
};

/**
 * Check health of all backend services
 * @returns {Promise<Object>} Status of each backend service
 */
export const checkAllBackendHealth = async () => {
  const [mainHealth, interviewHealth] = await Promise.all([
    checkMainBackendHealth().catch(() => false),
    checkInterviewBackendHealth().catch(() => false)
  ]);

  return {
    main: mainHealth,
    interview: interviewHealth,
    allHealthy: mainHealth && interviewHealth
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