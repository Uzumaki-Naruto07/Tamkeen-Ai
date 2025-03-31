/**
 * API Integration for TamkeenAI Career System
 * Provides functions to interact with the backend API
 */
import axios from 'axios';
import * as endpoints from './endpoints';
import withMockFallback, { isBackendUnavailable } from './mockFallback';
import mockData from './app-mocks/mockDataIndex';
import { jobEndpoints } from './endpoints';

// Create axios instance with default config
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api',
  timeout: 5000, // Reduced timeout for faster fallback to mock data
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set up global variable to track if backend is available
let isBackendAvailable = false;
let backendCheckInProgress = false;

// Function to check if backend is available
const checkBackendAvailability = async () => {
  if (backendCheckInProgress) return isBackendAvailable;
  
  backendCheckInProgress = true;
  try {
    // First try the proper health-check endpoint
    try {
      const response = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/health-check', { 
        timeout: 2000 
      });
      isBackendAvailable = response.status === 200;
    } catch (firstError) {
      // If that fails, try with /api/ prefix in case there's a misconfiguration
      console.log('First health check attempt failed, trying alternative endpoint');
      const response = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api/health-check', { 
        timeout: 2000 
      });
      isBackendAvailable = response.status === 200;
    }
    console.log('Backend availability check:', isBackendAvailable ? 'CONNECTED' : 'DISCONNECTED');
  } catch (error) {
    isBackendAvailable = false;
    console.log('Backend availability check: DISCONNECTED (Error: ' + (error.message || 'Unknown error') + ')');
  }
  backendCheckInProgress = false;
  return isBackendAvailable;
};

// Call once on startup
checkBackendAvailability();

// Helper function to get consistent avatar numbers from user IDs
export const getConsistentAvatarUrl = (userId) => {
  // Helper function to hash a string to a number
  const hashString = (str) => {
    let hash = 0;
    if (!str || str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  const userIdStr = String(userId || 'default-user');
  const hash = hashString(userIdStr);
  const avatarNumber = hash % 70; // Randomuser.me has about 70 different avatars
  const isMale = hash % 2 === 0;
  const gender = isMale ? 'men' : 'women';
  
  return `https://randomuser.me/api/portraits/${gender}/${avatarNumber}.jpg`;
};

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timeout occurred - falling back to mock data');
      // Return a resolved promise with null to allow fallback to mock data
      return Promise.resolve({ data: null, status: 408, statusText: 'Request Timeout' });
    }
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle CORS or network errors gracefully
    if (error.code === 'ERR_NETWORK' || (error.response && error.response.status === 0)) {
      console.warn('Network or CORS error occurred - falling back to mock data');
      // Mark backend as unavailable to skip future real API calls
      isBackendAvailable = false;
      // Return a resolved promise with null to allow fallback to mock data
      return Promise.resolve({ data: null, status: 0, statusText: 'Network Error' });
    }
    
    // Handle method not allowed errors
    if (error.response && error.response.status === 405) {
      console.warn('Method Not Allowed error occurred - falling back to mock data');
      return Promise.resolve({ data: null, status: 405, statusText: 'Method Not Allowed' });
    }
    
    return Promise.reject(error);
  }
);

// Add a request interceptor to check backend availability before making requests
api.interceptors.request.use(
  async (config) => {
    // If we already know backend is not available, don't even try real API
    if (!isBackendAvailable && !config.url.includes('health-check')) {
      // Cancel the request 
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      source.cancel('Backend is not available, using mock data');
    }
    
    // Always include auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export all necessary functions and objects
export {
  api,
  checkBackendAvailability,
  jobEndpoints
};

// Add default export for backward compatibility
export default {
  ...endpoints,
  resumes: {
    getUserResumes: (userId) => api.get(endpoints.RESUME_ENDPOINTS.GET_USER_RESUMES(userId)),
    getHistory: (resumeId) => api.get(`${endpoints.RESUME_ENDPOINTS.GET_BY_ID(resumeId)}/history`),
    createResume: (data) => api.post(endpoints.RESUME_ENDPOINTS.CREATE_RESUME, data),
    updateResume: (id, data) => api.put(endpoints.RESUME_ENDPOINTS.UPDATE_RESUME(id), data),
    deleteResume: (id) => api.delete(endpoints.RESUME_ENDPOINTS.DELETE(id))
  },
  jobs: {
    getSavedJobs: () => api.get(endpoints.JOB_ENDPOINTS.GET_SAVED),
    saveJob: (id) => api.post(endpoints.JOB_ENDPOINTS.SAVE(id)),
    unsaveJob: (id) => api.delete(endpoints.JOB_ENDPOINTS.UNSAVE(id))
  }
};