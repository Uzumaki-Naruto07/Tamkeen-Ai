/**
 * API Configuration
 * Centralizes all API URLs and settings
 */

// Use relative URLs for all API endpoints to go through proxy
export const API_BASE_URL = '/api';
export const INTERVIEW_API_BASE_URL = '/api/interviews';
export const UPLOAD_SERVER_URL = '/api/upload';
export const PREDICT_API_URL = '/api/predict';

// Feature flags from environment
export const ENABLE_BACKEND_CHECK = process.env.VITE_ENABLE_BACKEND_CHECK === 'true';
export const USE_MOCK_DATA = process.env.VITE_USE_MOCK_DATA === 'true';
export const ENABLE_MOCK_DATA = process.env.VITE_ENABLE_MOCK_DATA === 'true';
export const ENABLE_MOCK_FALLBACK = process.env.VITE_ENABLE_MOCK_FALLBACK === 'true';

// Default request timeout in milliseconds
export const DEFAULT_TIMEOUT = 30000;

// Error response messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again later.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access to this resource is forbidden.',
  BAD_REQUEST: 'Invalid request. Please check your input.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again later.'
};

// Define retry settings
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504]
};

// Define the default headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}; 