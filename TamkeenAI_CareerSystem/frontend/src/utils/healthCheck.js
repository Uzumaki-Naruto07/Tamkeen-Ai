import axios from 'axios';
import { API_BASE_URL, INTERVIEW_API_BASE_URL } from './apiConfig';

// Health check timeout in milliseconds
const HEALTH_CHECK_TIMEOUT = 10000;

// Health check endpoints - Using the correct endpoints that exist in the backend
const MAIN_HEALTH_ENDPOINT = `${API_BASE_URL}/api/health-check`;
const INTERVIEW_HEALTH_ENDPOINT = `${INTERVIEW_API_BASE_URL}/api/health-check`;

/**
 * Check if the main backend is available
 * @returns {Promise<boolean>} True if available, false otherwise
 */
export const checkMainBackendHealth = async () => {
  try {
    const response = await axios.get(MAIN_HEALTH_ENDPOINT, {
      timeout: HEALTH_CHECK_TIMEOUT,
      // Add these headers to help with CORS issues
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.status === 200;
  } catch (error) {
    console.error('Main backend health check failed:', error.message);
    return false;
  }
};

/**
 * Check if the interview backend is available
 * @returns {Promise<boolean>} True if available, false otherwise
 */
export const checkInterviewBackendHealth = async () => {
  try {
    const response = await axios.get(INTERVIEW_HEALTH_ENDPOINT, {
      timeout: HEALTH_CHECK_TIMEOUT,
      // Add these headers to help with CORS issues
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.status === 200;
  } catch (error) {
    console.error('Interview backend health check failed:', error.message);
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