/**
 * API Integration for TamkeenAI Career System
 * Provides functions to interact with the backend API
 */
import axios from 'axios';
import withMockFallback, { isBackendUnavailable } from '../utils/mockFallback';
import * as endpoints from './endpoints';
import { JOB_ENDPOINTS } from './endpoints';
import { jobEndpoints } from '../utils/endpoints';

// Environment detection
const isDevelopment = import.meta.env.DEV;
const useMockData = isDevelopment || import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Get API URLs from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const INTERVIEW_API_URL = import.meta.env.VITE_INTERVIEW_API_URL || 'http://localhost:5002';
const UPLOAD_SERVER_URL = import.meta.env.VITE_UPLOAD_SERVER_URL || 'http://localhost:5004';

// Track pending login requests to prevent duplicates
let pendingLoginRequest = null;

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL, // Use the actual API URL from environment variables
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: false // Set to false to avoid CORS issues
});

// Create axios instances for different APIs
const interviewApiClient = axios.create({
  baseURL: INTERVIEW_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: false
});

const uploadApiClient = axios.create({
  baseURL: UPLOAD_SERVER_URL,
  timeout: 60000, // Longer timeout for uploads
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: false
});

// Request interceptor for adding the auth token and fixing URL paths
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Fix URL paths
    // Make sure URLs have the /api prefix if they don't start with / or http
    if (config.url && !config.url.startsWith('/') && !config.url.startsWith('http')) {
      if (!config.url.startsWith('api/')) {
        config.url = `/api/${config.url}`;
      }
    }
    
    // Log the request for debugging
    console.log(`Making API request to: ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Apply the same interceptor to the other API clients
interviewApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Fix URL paths
    if (config.url && !config.url.startsWith('/') && !config.url.startsWith('http')) {
      if (!config.url.startsWith('api/')) {
        config.url = `/api/${config.url}`;
      }
    }
    
    console.log(`Making interview API request to: ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Interview API request error:', error);
    return Promise.reject(error);
  }
);

uploadApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Fix URL paths
    if (config.url && !config.url.startsWith('/') && !config.url.startsWith('http')) {
      if (!config.url.startsWith('api/')) {
        config.url = `/api/${config.url}`;
      }
    }
    
    console.log(`Making upload API request to: ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Upload API request error:', error);
    return Promise.reject(error);
  }
);

export { apiClient, interviewApiClient, uploadApiClient }; 