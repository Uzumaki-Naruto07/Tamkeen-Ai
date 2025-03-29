import axios from 'axios';

// Environment detection
const isDevelopment = import.meta.env.DEV;
const useMockData = isDevelopment || import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Track pending login requests to prevent duplicates
let pendingLoginRequest = null;

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api',
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
      
      // In development mode, handle CORS errors more gracefully
      if (isDevelopment && error.message && error.message.includes('Network Error')) {
        console.warn('Development mode - CORS or Network error detected, using mock fallbacks');
        // Let the function handle mock fallbacks
        if (useMockData) {
          return Promise.resolve({ 
            data: { 
              success: true, 
              data: {}, 
              message: 'Mock data response (dev mode)' 
            } 
          });
        }
      }
    }

    console.error('API Error:', errorObj.message, error);
    return Promise.reject(errorObj);
  }
);

// General API request functions with mock support for development
export const api = {
  get: async (url, params = {}) => {
    // In development or if mock data is enabled, provide fallback mock data
    if (useMockData) {
      // Check if there's a mock handler for this endpoint
      if (url.includes('/dashboard/data')) {
        // Only log in development mode and not too frequently
        if (isDevelopment && Math.random() > 0.8) {
          console.log('Using mock dashboard data');
        }
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return { data: { data: mockDashboardData, success: true } };
      }
    }
    // If no mock handler or not in development, try the real API
    try {
      return await apiClient.get(url, { params });
    } catch (error) {
      // If in development and API failed, try to use mock data as fallback
      if (isDevelopment) {
        if (url.includes('/dashboard/data')) {
          if (isDevelopment && Math.random() > 0.8) {
            console.log('API failed, falling back to mock dashboard data');
          }
          return { data: { data: mockDashboardData, success: true } };
        }
      }
      throw error;
    }
  },
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

// Add mock dashboard data
const mockDashboardData = {
  progress: {
    overall: 65,
    resume: 80,
    skills: 70,
    applications: 50,
    interviews: 60,
    networking: 55,
    goals: [
      { id: 1, name: 'Complete profile', progress: 100, completed: "true", unlocked: "true" },
      { id: 2, name: 'Apply to 5 jobs', progress: 60, completed: "false", unlocked: "true" },
      { id: 3, name: 'Update resume', progress: 80, completed: "false", unlocked: "true" }
    ],
    nextSteps: ['Update LinkedIn profile', 'Practice interview skills']
  },
  // Add other required mock data for components
  resumeScore: {
    overall: 75,
    sections: {
      content: 80,
      format: 75,
      keywords: 70,
      impact: 65
    },
    scores: [
      { name: 'Content', value: 80 },
      { name: 'Format', value: 75 },
      { name: 'Keywords', value: 70 },
      { name: 'Impact', value: 65 }
    ]
  },
  // ... add more mock data as needed ...
};

export default apiClient; 