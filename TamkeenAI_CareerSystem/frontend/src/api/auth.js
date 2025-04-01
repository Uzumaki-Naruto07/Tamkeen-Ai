import apiClient from './apiClient';
import { AUTH_ENDPOINTS } from './endpoints';

/**
 * API methods for authentication functionality
 */
const authService = {
  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Login response with user data and tokens
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
        email,
        password
      });
      return response;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
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