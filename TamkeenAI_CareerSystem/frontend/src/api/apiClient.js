import axios from 'axios';

// Environment detection
const isDevelopment = import.meta.env.DEV;

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: isDevelopment ? false : true
});

// Mock data for development mode
const mockUsers = [
  {
    id: '1',
    email: 'admin@tamkeen.ai',
    password: 'password',
    name: 'Admin User',
    roles: ['admin', 'user'],
    preferences: { language: 'en', theme: 'light' }
  },
  {
    id: '2',
    email: 'user@tamkeen.ai',
    password: 'password',
    name: 'Regular User',
    roles: ['user'],
    preferences: { language: 'en', theme: 'light' }
  }
];

// Mock authentication function for development
const mockLogin = (credentials) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === credentials.email);
      
      if (user && (credentials.password === user.password || credentials.password === 'password')) {
        const token = `mock-token-${user.id}-${Date.now()}`;
        
        resolve({
          data: {
            data: {
              token,
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
                preferences: user.preferences
              }
            },
            message: 'Login successful',
            success: true
          }
        });
      } else {
        reject({
          response: {
            data: {
              message: 'Invalid email or password',
              success: false
            }
          }
        });
      }
    }, 500); // Simulate network delay
  });
};

// Request interceptor for adding the auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Authentication required. Please log in again.'));
    }
    
    // Handle server errors (500)
    if (error.response && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
      return Promise.reject(new Error('Server error. Please try again later.'));
    }
    
    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('Network error:', error);
      return Promise.reject(new Error('Network error. Please check your internet connection.'));
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
      return Promise.reject(new Error('Request timeout. Please try again later.'));
    }
    
    return Promise.reject(error);
  }
);

// General API request functions with mock support for development
export const api = {
  get: (url, params = {}) => apiClient.get(url, { params }),
  post: (url, data = {}) => {
    // Mock authentication in development mode
    if (isDevelopment && url.includes('/auth/login')) {
      return mockLogin(data);
    }
    return apiClient.post(url, data);
  },
  put: (url, data = {}) => apiClient.put(url, data),
  delete: (url) => apiClient.delete(url),
  upload: (url, formData) => apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
};

export default apiClient; 