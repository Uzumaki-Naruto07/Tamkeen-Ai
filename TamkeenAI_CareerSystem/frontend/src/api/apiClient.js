import axios from 'axios';

// Environment detection
const isDevelopment = import.meta.env.DEV;

// Track pending login requests to prevent duplicates
let pendingLoginRequest = null;

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
  // If there's already a pending login request, return it
  if (pendingLoginRequest) {
    return pendingLoginRequest;
  }
  
  pendingLoginRequest = new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === credentials.email);
      
      if (user && (credentials.password === user.password || credentials.password === 'password')) {
        const token = `mock-token-${user.id}-${Date.now()}`;
        
        const response = {
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
        };
        
        // Clear the pending request
        pendingLoginRequest = null;
        resolve(response);
      } else {
        // Clear the pending request
        pendingLoginRequest = null;
        reject({
          response: {
            data: {
              message: 'Invalid email or password',
              success: false
            }
          },
          message: 'Invalid email or password'
        });
      }
    }, 500); // Simulate network delay
  });
  
  return pendingLoginRequest;
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
    return Promise.reject({
      message: 'Network error. Please check your connection.',
      originalError: error
    });
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Create a standardized error object
    let errorObj = {
      message: 'An unexpected error occurred',
      status: error?.response?.status || 0,
      originalError: error
    };

    if (error.response) {
      // The request was made and the server responded with an error status
      errorObj.message = error.response.data?.message || `Server error: ${error.response.status}`;
      errorObj.data = error.response.data;
      
      // Handle authentication errors
      if (error.response.status === 401) {
        // Clear pendingLoginRequest to allow new login attempts
        pendingLoginRequest = null;
        // Clear token if unauthorized
        localStorage.removeItem('token');
        errorObj.message = 'Authentication failed. Please log in again.';
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorObj.message = 'No response from server. Please try again later.';
    }

    console.error('API Error:', errorObj.message, error);
    return Promise.reject(errorObj);
  }
);

// General API request functions with mock support for development
export const api = {
  get: (url, params = {}) => apiClient.get(url, { params }),
  post: (url, data = {}) => {
    // Mock authentication in development mode for login path
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
  }),
  // Helper method to clear any pending login requests (for testing/debugging)
  clearPendingLogin: () => {
    pendingLoginRequest = null;
  }
};

export default apiClient; 