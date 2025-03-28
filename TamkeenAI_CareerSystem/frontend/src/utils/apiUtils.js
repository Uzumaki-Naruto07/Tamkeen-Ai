import axios from 'axios';
import {
  handleError,
  createNetworkError,
  createAuthenticationError,
  createNotFoundError,
  createValidationError,
  createConflictError,
  createAuthorizationError,
} from './errorUtils';

// API configuration
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Create axios instance with default config
const api = axios.create(API_CONFIG);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(createNetworkError('Failed to send request', { originalError: error }));
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 400:
          return Promise.reject(createValidationError(data.message || 'Invalid request', data));
        case 401:
          return Promise.reject(createAuthenticationError(data.message || 'Authentication failed', data));
        case 403:
          return Promise.reject(createAuthorizationError(data.message || 'Authorization failed', data));
        case 404:
          return Promise.reject(createNotFoundError(data.message || 'Resource not found', data));
        case 409:
          return Promise.reject(createConflictError(data.message || 'Resource conflict', data));
        default:
          return Promise.reject(handleError(error));
      }
    }
    return Promise.reject(createNetworkError('Network error', { originalError: error }));
  }
);

// API methods
export const apiUtils = {
  // GET request
  get: async (url, params = {}, config = {}) => {
    try {
      return await api.get(url, { params, ...config });
    } catch (error) {
      throw handleError(error);
    }
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      throw handleError(error);
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      throw handleError(error);
    }
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      return await api.patch(url, data, config);
    } catch (error) {
      throw handleError(error);
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Upload file
  upload: async (url, file, onProgress = null, config = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      return await api.post(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            onProgress(progress);
          }
        },
      });
    } catch (error) {
      throw handleError(error);
    }
  },

  // Download file
  download: async (url, filename, config = {}) => {
    try {
      const response = await api.get(url, {
        ...config,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw handleError(error);
    }
  },

  // Cancel request
  cancel: (source) => {
    if (source) {
      source.cancel('Request cancelled');
    }
  },

  // Create cancel token
  createCancelToken: () => {
    return axios.CancelToken.source();
  },

  // Set auth token
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common.Authorization;
    }
  },

  // Clear auth token
  clearAuthToken: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
  },

  // Check if token exists
  hasAuthToken: () => {
    return !!localStorage.getItem('token');
  },

  // Get auth token
  getAuthToken: () => {
    return localStorage.getItem('token');
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw createAuthenticationError('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      const { token, refreshToken: newRefreshToken } = response;

      apiUtils.setAuthToken(token);
      localStorage.setItem('refreshToken', newRefreshToken);

      return token;
    } catch (error) {
      apiUtils.clearAuthToken();
      throw handleError(error);
    }
  },

  // Handle token expiration
  handleTokenExpiration: async (error) => {
    if (error.response?.status === 401) {
      try {
        await apiUtils.refreshToken();
        return true;
      } catch (refreshError) {
        apiUtils.clearAuthToken();
        window.location.href = '/login';
        return false;
      }
    }
    return false;
  },
};

// Export API utilities
export default apiUtils;