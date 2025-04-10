import apiClient from './apiClient';
import { AUTH_ENDPOINTS } from './endpoints';

/**
 * API methods for authentication functionality
 */
const authService = {
  /**
   * Attempt to login a user with the provided credentials
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise} - Promise resolving to the user data or error
   */
  login: async (email, password) => {
    try {
      console.log('Login attempt with:', { email });
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, { email, password });
      
      console.log('Login response:', response);
      
      if (response.data && response.data.token) {
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // If user data is included in response, store it as well
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return { 
          success: true, 
          data: response.data,
          message: 'Login successful'
        };
      } else {
        console.error('Invalid login response format:', response);
        return { 
          success: false, 
          message: 'Invalid response format from server'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const statusCode = error.response.status;
        const errorData = error.response.data || {};
        
        if (statusCode === 401) {
          return { 
            success: false, 
            message: errorData.message || 'Invalid email or password'
          };
        } else if (statusCode === 404) {
          return { 
            success: false, 
            message: 'Authentication service not found. Please try again later.'
          };
        } else {
          return { 
            success: false, 
            message: errorData.message || 'Login failed. Please try again.'
          };
        }
      } else if (error.request) {
        // The request was made but no response was received
        return { 
          success: false, 
          message: 'No response from server. Please check your internet connection and try again.'
        };
      } else {
        // Something happened in setting up the request that triggered an Error
        return { 
          success: false, 
          message: error.message || 'Login error. Please try again.'
        };
      }
    }
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registration response
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, userData);
      return response;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  },

  /**
   * Logout the current user
   * @returns {Promise<Object>} - Logout response
   */
  logout: async () => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
      return response;
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  },

  /**
   * Verify a user's email
   * @param {string} token - Verification token
   * @returns {Promise<Object>} - Verification response
   */
  verifyEmail: async (token) => {
    try {
      const response = await apiClient.get(`${AUTH_ENDPOINTS.VERIFY}?token=${token}`);
      return response;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  },

  /**
   * Request a password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} - Password reset request response
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, { email });
      return response;
    } catch (error) {
      console.error('Error requesting password reset:', error);
      throw error;
    }
  },

  /**
   * Reset a user's password
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Password reset response
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post(`${AUTH_ENDPOINTS.RESET_PASSWORD}/confirm`, {
        token,
        newPassword
      });
      return response;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  /**
   * Change a user's password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Password change response
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  /**
   * Refresh the access token
   * @returns {Promise<Object>} - Token refresh response
   */
  refreshToken: async () => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN);
      return response;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  },

  /**
   * Check if the user is authenticated
   * @returns {Promise<Object>} - Auth status response
   */
  checkAuthStatus: async () => {
    try {
      const response = await apiClient.get('/auth/status');
      return response;
    } catch (error) {
      console.error('Error checking auth status:', error);
      throw error;
    }
  }
};

export default authService; 