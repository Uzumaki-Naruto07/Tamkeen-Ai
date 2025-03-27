/**
 * API Integration for TamkeenAI Career System
 * Provides functions to interact with the backend API
 */
import axios from 'axios';
import * as endpoints from './endpoints';

// Create axios instance with default config
const api = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post(endpoints.AUTH_ENDPOINTS.LOGIN, credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post(endpoints.AUTH_ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  logout: async () => {
    try {
      await api.post(endpoints.AUTH_ENDPOINTS.LOGOUT);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear token even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get(endpoints.AUTH_ENDPOINTS.ME);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Resume API calls
export const resumeAPI = {
  uploadResume: async (file, additionalData = {}) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      // Add any additional data
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
      
      const response = await api.post(endpoints.RESUME_ENDPOINTS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  analyzeResume: async (resumeId) => {
    try {
      const response = await api.post(endpoints.RESUME_ENDPOINTS.ANALYZE, { resumeId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getAllResumes: async () => {
    try {
      const response = await api.get(endpoints.RESUME_ENDPOINTS.GET_ALL);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getResumeById: async (id) => {
    try {
      const response = await api.get(endpoints.RESUME_ENDPOINTS.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  deleteResume: async (id) => {
    try {
      const response = await api.delete(endpoints.RESUME_ENDPOINTS.DELETE(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Interview API calls
export const interviewAPI = {
  createInterview: async (interviewData) => {
    try {
      const response = await api.post(endpoints.INTERVIEW_ENDPOINTS.CREATE, interviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getAllInterviews: async () => {
    try {
      const response = await api.get(endpoints.INTERVIEW_ENDPOINTS.GET_ALL);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getInterviewById: async (id) => {
    try {
      const response = await api.get(endpoints.INTERVIEW_ENDPOINTS.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  updateInterview: async (id, data) => {
    try {
      const response = await api.put(endpoints.INTERVIEW_ENDPOINTS.UPDATE(id), data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  deleteInterview: async (id) => {
    try {
      const response = await api.delete(endpoints.INTERVIEW_ENDPOINTS.DELETE(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Job API calls
export const jobAPI = {
  searchJobs: async (query) => {
    try {
      const response = await api.get(`${endpoints.JOB_ENDPOINTS.SEARCH}?q=${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getRecommendedJobs: async () => {
    try {
      const response = await api.get(endpoints.JOB_ENDPOINTS.RECOMMEND);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getJobById: async (id) => {
    try {
      const response = await api.get(endpoints.JOB_ENDPOINTS.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  saveJob: async (id) => {
    try {
      const response = await api.post(endpoints.JOB_ENDPOINTS.SAVE(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  unsaveJob: async (id) => {
    try {
      const response = await api.delete(endpoints.JOB_ENDPOINTS.UNSAVE(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getSavedJobs: async () => {
    try {
      const response = await api.get(endpoints.JOB_ENDPOINTS.GET_SAVED);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// User profile API calls
export const userAPI = {
  updateProfile: async (profileData) => {
    try {
      const response = await api.put(endpoints.USER_ENDPOINTS.UPDATE_PROFILE, profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get(endpoints.USER_ENDPOINTS.GET_PROFILE);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  changePassword: async (passwordData) => {
    try {
      const response = await api.post(endpoints.USER_ENDPOINTS.CHANGE_PASSWORD, passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Health check
export const checkHealth = async () => {
  try {
    const response = await api.get(endpoints.HEALTH_CHECK);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default api;