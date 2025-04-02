/**
 * Mock Fallback Utility
 * 
 * This module provides functions to handle API failures gracefully
 * by falling back to mock data when the backend is unavailable.
 */

import mockData from './app-mocks/mockDataIndex';
// Use try-catch to make toast optional in case react-toastify is not installed
let toast;
try {
  const toastModule = require('react-toastify');
  toast = toastModule.toast;
} catch (error) {
  // Create a mock toast function if react-toastify is not available
  toast = {
    warn: (message) => console.warn('[MOCK TOAST]', message),
    error: (message) => console.error('[MOCK TOAST]', message),
    info: (message) => console.info('[MOCK TOAST]', message),
    success: (message) => console.log('[MOCK TOAST]', message)
  };
}

// Error messages that indicate backend unavailability
const BACKEND_UNAVAILABLE_ERRORS = [
  'Failed to fetch',
  'Network Error',
  'Connection refused',
  'timeout',
  'ECONNREFUSED',
  'socket hang up',
  'No available backends',
  'METHOD NOT ALLOWED'
];

/**
 * Check if error suggests the backend is down/unavailable
 */
export const isBackendUnavailable = (error) => {
  // If no error, backend is available
  if (!error) return false;
  
  // Convert error to string if it's an object
  const errorStr = error.message || error.toString();
  
  // Check if the error message indicates backend unavailability
  return BACKEND_UNAVAILABLE_ERRORS.some(msg => 
    errorStr.toLowerCase().includes(msg.toLowerCase())
  );
};

/**
 * Process mock data based on request parameters
 * This function helps simulate API filtering, sorting, etc.
 */
const processMockData = (data, params) => {
  if (!data || !Array.isArray(data)) return { data: [], pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 } };
  
  let result = [...data];
  
  // Handle search filtering
  if (params && params.search && typeof params.search === 'string') {
    const searchTerm = params.search.toLowerCase();
    result = result.filter(item => 
      (item.title && item.title.toLowerCase().includes(searchTerm)) ||
      (item.description && item.description.toLowerCase().includes(searchTerm)) ||
      (item.company && 
        (typeof item.company === 'string' ? 
          item.company.toLowerCase().includes(searchTerm) : 
          item.company.name && item.company.name.toLowerCase().includes(searchTerm)
        )
      )
    );
  }
  
  // Handle location filtering
  if (params && params.location && typeof params.location === 'string') {
    const locationTerm = params.location.toLowerCase();
    result = result.filter(item => 
      item.location && item.location.toLowerCase().includes(locationTerm)
    );
  }
  
  // Handle pagination
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const paginatedResult = result.slice(startIndex, startIndex + pageSize);
  
  return {
    data: paginatedResult,
    pagination: {
      total: result.length,
      page: page,
      pageSize: pageSize,
      totalPages: Math.ceil(result.length / pageSize)
    }
  };
};

/**
 * Execute an API call with mock data fallback
 * @param {Function} apiCall - The API function to call
 * @param {string} mockDataKey - The key in mockData to use as fallback
 * @param {Object} params - Parameters for the API call
 * @param {boolean} showWarning - Whether to show a toast warning when using mock data
 * @returns {Promise} - Resolves with API response or mock data
 */
export const withMockFallback = async (apiCall, mockDataKey, params = {}, showWarning = true) => {
  try {
    // Check if we already know the backend is unavailable
    const isUnavailable = typeof window !== 'undefined' && 
      localStorage.getItem('backend-unavailable') === 'true';
    
    // If backend is unavailable, skip API call and use mock data immediately
    if (isUnavailable) {
      console.log(`Backend is marked unavailable, skipping API call for ${mockDataKey}`);
      throw new Error("Backend known to be unavailable");
    }
    
    // Attempt the actual API call
    const response = await apiCall(params);
    
    // If response exists but has null data, fall back to mock
    if (!response || !response.data) {
      throw new Error("Empty API response");
    }
    
    return response;
  } catch (error) {
    console.error(`API call failed, falling back to mock data for: ${mockDataKey}`, error);
    
    // Check for CORS or network errors specifically
    const isNetworkError = error.message && (
      error.message.includes('CORS') || 
      error.message.includes('NetworkError') ||
      error.message.includes('Network Error')
    );
    
    const isMethodNotAllowed = error.response && error.response.status === 405;
    
    if (isNetworkError || isMethodNotAllowed) {
      console.warn('Development mode - CORS or Network error detected, using mock fallbacks');
      // Mark backend as unavailable for future requests (but only temporarily)
      if (typeof window !== 'undefined' && !localStorage.getItem('backend-unavailable')) {
        localStorage.setItem('backend-unavailable', 'true');
        // Clear this flag after 30 seconds to try again later
        setTimeout(() => {
          localStorage.removeItem('backend-unavailable');
        }, 30000);
      }
    }
    
    // Show warning toast only once per session for this type of data
    if (showWarning && typeof window !== 'undefined' && !localStorage.getItem(`mock-warning-${mockDataKey}`)) {
      toast.warn(`Using mock data for ${mockDataKey} because the backend is unavailable.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Mark that we've shown this warning
      localStorage.setItem(`mock-warning-${mockDataKey}`, 'true');
    }
    
    // Get the right mock data based on the key
    let mockResponse;
    
    if (typeof mockDataKey === 'function') {
      // If mockDataKey is a function, call it with params
      mockResponse = mockDataKey(params);
    } else if (mockDataKey && mockDataKey.includes('.')) {
      // Handle nested keys like 'jobs.search'
      const keys = mockDataKey.split('.');
      let data = mockData;
      for (const key of keys) {
        data = data[key];
      }
      mockResponse = data;
    } else if (mockDataKey) {
      // Simple key lookup
      mockResponse = mockData[mockDataKey];
      
      // Special handling for jobs data
      if (mockDataKey === 'jobs') {
        const processedData = processMockData(mockData.jobs, params);
        return {
          success: true,
          ...processedData  // Spread the processed data (contains data and pagination)
        };
      }
    } else {
      // No mock data key provided, return empty data
      mockResponse = {};
    }
    
    // Format the response like a real API response
    return {
      success: true,
      data: mockResponse,
      meta: {
        isMockData: true,
        timestamp: new Date().toISOString(),
        error: error.message
      }
    };
  }
};

/**
 * Clear all mock warning flags from localStorage
 */
export const clearMockWarnings = () => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('mock-warning-')) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Get all available mock data types
 */
export const getAvailableMockData = () => {
  return Object.keys(mockData);
};

export default withMockFallback; 