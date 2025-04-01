import axios from 'axios';
import { handleError, createNetworkError, createAuthenticationError } from './errorUtils';

// API configuration with fallback options
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => status >= 200 && status < 500, // Don't reject if status is less than 500
};

// Create axios instance with default config
const apiClient = axios.create(API_CONFIG);

// Request interceptor with retry logic
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Prevent double '/api' prefixes in URLs
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.substring(4); // Remove '/api'
    } else if (config.url && config.url.startsWith('api/')) {
      config.url = config.url.substring(4); // Remove 'api/'
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(createNetworkError('Failed to send request', { originalError: error }));
  }
);

// Response interceptor with improved error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      return Promise.reject(createNetworkError('Network error. Please check your connection.', { originalError: error }));
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized errors with token refresh
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await apiClient.post('/auth/refresh-token', { refreshToken });
          const { token } = response.data;
          localStorage.setItem('token', token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(createAuthenticationError('Session expired. Please login again.'));
      }
    }

    // Handle other error statuses
    switch (status) {
      case 403:
        return Promise.reject(createAuthenticationError('Access forbidden', data));
      case 404:
        return Promise.reject(createNetworkError('Resource not found', data));
      case 500:
        return Promise.reject(createNetworkError('Server error. Please try again later.', data));
      default:
        return Promise.reject(handleError(error));
    }
  }
);

// API endpoints
export const api = {
  // Auth endpoints
  auth: {
    login: (data) => apiClient.post('/auth/login', data),
    register: (data) => apiClient.post('/auth/register', data),
    logout: () => apiClient.post('/auth/logout'),
    refreshToken: () => apiClient.post('/auth/refresh-token'),
  },

  // User endpoints
  user: {
    getProfile: () => apiClient.get('/user/profile'),
    updateProfile: (data) => apiClient.put('/user/profile', data),
    updatePreferences: (data) => apiClient.put('/user/preferences', data),
    getNotifications: () => apiClient.get('/user/notifications'),
    markNotificationRead: (id) => apiClient.put(`/user/notifications/${id}/read`),
  },

  // Jobs endpoints
  jobs: {
    getAll: (params) => apiClient.get('/jobs', { params }),
    getById: (id) => apiClient.get(`/jobs/${id}`),
    apply: (id) => apiClient.post(`/jobs/${id}/apply`),
    save: (id) => apiClient.post(`/jobs/${id}/save`),
    getApplications: () => apiClient.get('/jobs/applications'),
  },

  // AI Coach endpoints
  aiCoach: {
    getChatHistory: () => apiClient.get('/ai-coach/chat'),
    sendMessage: (data) => apiClient.post('/ai-coach/chat', data),
    getRecommendations: () => apiClient.get('/ai-coach/recommendations'),
    getFeedback: (data) => apiClient.post('/ai-coach/feedback', data),
  },

  // Resume endpoints
  resume: {
    create: (data) => apiClient.post('/resume', data),
    update: (id, data) => apiClient.put(`/resume/${id}`, data),
    getById: (id) => apiClient.get(`/resume/${id}`),
    getAll: () => apiClient.get('/resume'),
    delete: (id) => apiClient.delete(`/resume/${id}`),
    getTemplates: () => apiClient.get('/resume/templates'),
  },

  // Skills endpoints
  skills: {
    getAssessment: () => apiClient.get('/skills/assessment'),
    submitAssessment: (data) => apiClient.post('/skills/assessment', data),
    getLearningPath: () => apiClient.get('/skills/learning-path'),
    getCourses: () => apiClient.get('/skills/courses'),
    getProgress: () => apiClient.get('/skills/progress'),
  },

  // Achievements endpoints
  achievements: {
    getAll: () => apiClient.get('/achievements'),
    getById: (id) => apiClient.get(`/achievements/${id}`),
    unlock: (id) => apiClient.post(`/achievements/${id}/unlock`),
  },

  // Analytics endpoints
  analytics: {
    getDashboardData: () => apiClient.get('/analytics/dashboard'),
    getJobMarketInsights: () => apiClient.get('/analytics/job-market'),
    getSkillTrends: () => apiClient.get('/analytics/skill-trends'),
  },
};

export default apiClient; 