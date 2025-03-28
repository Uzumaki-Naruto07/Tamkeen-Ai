import axios from 'axios';
import { handleError, createNetworkError, createAuthenticationError } from './errorUtils';

// API configuration with fallback options
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
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
          const response = await apiClient.post('/api/auth/refresh-token', { refreshToken });
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
    login: (data) => apiClient.post('/api/auth/login', data),
    register: (data) => apiClient.post('/api/auth/register', data),
    logout: () => apiClient.post('/api/auth/logout'),
    refreshToken: () => apiClient.post('/api/auth/refresh-token'),
  },

  // User endpoints
  user: {
    getProfile: () => apiClient.get('/api/user/profile'),
    updateProfile: (data) => apiClient.put('/api/user/profile', data),
    updatePreferences: (data) => apiClient.put('/api/user/preferences', data),
    getNotifications: () => apiClient.get('/api/user/notifications'),
    markNotificationRead: (id) => apiClient.put(`/api/user/notifications/${id}/read`),
  },

  // Jobs endpoints
  jobs: {
    getAll: (params) => apiClient.get('/api/jobs', { params }),
    getById: (id) => apiClient.get(`/api/jobs/${id}`),
    apply: (id) => apiClient.post(`/api/jobs/${id}/apply`),
    save: (id) => apiClient.post(`/api/jobs/${id}/save`),
    getApplications: () => apiClient.get('/api/jobs/applications'),
  },

  // AI Coach endpoints
  aiCoach: {
    getChatHistory: () => apiClient.get('/api/ai-coach/chat'),
    sendMessage: (data) => apiClient.post('/api/ai-coach/chat', data),
    getRecommendations: () => apiClient.get('/api/ai-coach/recommendations'),
    getFeedback: (data) => apiClient.post('/api/ai-coach/feedback', data),
  },

  // Resume endpoints
  resume: {
    create: (data) => apiClient.post('/api/resume', data),
    update: (id, data) => apiClient.put(`/api/resume/${id}`, data),
    getById: (id) => apiClient.get(`/api/resume/${id}`),
    getAll: () => apiClient.get('/api/resume'),
    delete: (id) => apiClient.delete(`/api/resume/${id}`),
    getTemplates: () => apiClient.get('/api/resume/templates'),
  },

  // Skills endpoints
  skills: {
    getAssessment: () => apiClient.get('/api/skills/assessment'),
    submitAssessment: (data) => apiClient.post('/api/skills/assessment', data),
    getLearningPath: () => apiClient.get('/api/skills/learning-path'),
    getCourses: () => apiClient.get('/api/skills/courses'),
    getProgress: () => apiClient.get('/api/skills/progress'),
  },

  // Achievements endpoints
  achievements: {
    getAll: () => apiClient.get('/api/achievements'),
    getById: (id) => apiClient.get(`/api/achievements/${id}`),
    unlock: (id) => apiClient.post(`/api/achievements/${id}/unlock`),
  },

  // Analytics endpoints
  analytics: {
    getDashboardData: () => apiClient.get('/api/analytics/dashboard'),
    getJobMarketInsights: () => apiClient.get('/api/analytics/job-market'),
    getSkillTrends: () => apiClient.get('/api/analytics/skill-trends'),
  },
};

export default apiClient; 