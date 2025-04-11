import apiClient from './apiClient';

export const authService = {
  async login(username, password) {
    try {
      const response = await apiClient.post('/api/auth/login', { username, password });
      // Store the token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  async logout() {
    try {
      await apiClient.post('/api/auth/logout');
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear the token even if the API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Helper method to check if user is logged in
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  // Helper to get the current user from localStorage
  getUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
};

export default authService; 