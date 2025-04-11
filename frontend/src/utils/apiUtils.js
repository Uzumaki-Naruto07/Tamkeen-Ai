import axios from 'axios';

// API configuration with environment variables
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'https://tamkeen-main-api.onrender.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable credentials for cross-domain requests
};

// Create axios instance with default config
const api = axios.create(API_CONFIG);

// Set up additional API instances for different services
const interviewApi = axios.create({
  baseURL: import.meta.env.VITE_INTERVIEW_API_URL || 'https://tamkeen-interview-api.onrender.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

const predictApi = axios.create({
  baseURL: import.meta.env.VITE_PREDICT_API_URL || 'https://tamkeen-predict-api.onrender.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

const uploadApi = axios.create({
  baseURL: import.meta.env.VITE_UPLOAD_SERVER_URL || 'https://tamkeen-upload-server.onrender.com',
  timeout: 60000, // Longer timeout for uploads
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to all API instances
const addAuthInterceptor = (apiInstance) => {
  apiInstance.interceptors.request.use(
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
};

// Add response interceptor to all API instances
const addResponseInterceptor = (apiInstance) => {
  apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error);
      
      // Handle specific errors
      if (error.response) {
        // Server responded with an error status
        if (error.response.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          // Only redirect if not already on the login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
      }
      
      return Promise.reject(error);
    }
  );
};

// Apply interceptors to all API instances
addAuthInterceptor(api);
addAuthInterceptor(interviewApi);
addAuthInterceptor(predictApi);
addAuthInterceptor(uploadApi);

addResponseInterceptor(api);
addResponseInterceptor(interviewApi);
addResponseInterceptor(predictApi);
addResponseInterceptor(uploadApi);

// API methods for the main API
export const apiUtils = {
  // GET request
  get: async (url, params = {}, config = {}) => {
    try {
      return await api.get(url, { params, ...config });
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      return await api.patch(url, data, config);
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      throw error;
    }
  },

  // Upload file
  upload: async (url, file, onProgress = null, config = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      return await uploadApi.post(url, formData, {
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
      throw error;
    }
  },
  
  // Health check for each service
  health: {
    main: () => api.get('/api/health-check'),
    interview: () => interviewApi.get('/api/interviews/health-check'),
    predict: () => predictApi.get('/api/predict/health-check'),
    upload: () => uploadApi.get('/api/upload/health-check'),
  },
  
  // Interview API specific methods
  interview: {
    get: (url, params = {}, config = {}) => interviewApi.get(url, { params, ...config }),
    post: (url, data = {}, config = {}) => interviewApi.post(url, data, config),
    put: (url, data = {}, config = {}) => interviewApi.put(url, data, config),
    delete: (url, config = {}) => interviewApi.delete(url, config),
  },
  
  // Predict API specific methods
  predict: {
    get: (url, params = {}, config = {}) => predictApi.get(url, { params, ...config }),
    post: (url, data = {}, config = {}) => predictApi.post(url, data, config),
  },
};

export default apiUtils; 