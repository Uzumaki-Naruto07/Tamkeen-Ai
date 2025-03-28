import { apiUtils } from './apiUtils';
import { STORAGE_KEYS } from './constants';
import { ERROR_MESSAGES } from './constants';

// Authentication class
class Auth {
  constructor() {
    this.token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    this.refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    this.user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.user?.roles?.includes(role) || false;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles) {
    return roles.some(role => this.hasRole(role));
  }

  // Check if user has all of the specified roles
  hasAllRoles(roles) {
    return roles.every(role => this.hasRole(role));
  }

  // Check if user has specific permission
  hasPermission(permission) {
    return this.user?.permissions?.includes(permission) || false;
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(permissions) {
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Check if user has all of the specified permissions
  hasAllPermissions(permissions) {
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Login user
  async login(email, password) {
    try {
      const response = await apiUtils.post('/auth/login', { email, password });
      this.setAuthData(response);
      return response;
    } catch (error) {
      throw new Error(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await apiUtils.post('/auth/register', userData);
      this.setAuthData(response);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Logout user
  async logout() {
    try {
      await apiUtils.post('/auth/logout');
      this.clearAuthData();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      const response = await apiUtils.post('/auth/refresh', {
        refreshToken: this.refreshToken,
      });
      this.setAuthData(response);
      return response;
    } catch (error) {
      this.clearAuthData();
      throw new Error(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      await apiUtils.post('/auth/forgot-password', { email });
    } catch (error) {
      throw new Error(error.message || 'Failed to send reset password email');
    }
  }

  // Reset password
  async resetPassword(token, password) {
    try {
      await apiUtils.post('/auth/reset-password', { token, password });
    } catch (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      await apiUtils.post('/auth/verify-email', { token });
    } catch (error) {
      throw new Error(error.message || 'Failed to verify email');
    }
  }

  // Resend verification email
  async resendVerification() {
    try {
      await apiUtils.post('/auth/resend-verification');
    } catch (error) {
      throw new Error(error.message || 'Failed to resend verification email');
    }
  }

  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await apiUtils.put('/user/profile', profileData);
      this.updateUserData(response);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  // Update password
  async updatePassword(currentPassword, newPassword) {
    try {
      await apiUtils.put('/user/password', {
        currentPassword,
        newPassword,
      });
    } catch (error) {
      throw new Error(error.message || 'Failed to update password');
    }
  }

  // Update preferences
  async updatePreferences(preferences) {
    try {
      const response = await apiUtils.put('/user/preferences', preferences);
      this.updateUserData(response);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to update preferences');
    }
  }

  // Get user data
  async getUserData() {
    try {
      const response = await apiUtils.get('/user/profile');
      this.updateUserData(response);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to get user data');
    }
  }

  // Set auth data
  setAuthData(data) {
    const { token, refreshToken, user } = data;
    this.token = token;
    this.refreshToken = refreshToken;
    this.user = user;

    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    apiUtils.setAuthToken(token);
  }

  // Update user data
  updateUserData(data) {
    this.user = { ...this.user, ...data };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user));
  }

  // Clear auth data
  clearAuthData() {
    this.token = null;
    this.refreshToken = null;
    this.user = null;

    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);

    apiUtils.clearAuthToken();
  }

  // Get token
  getToken() {
    return this.token;
  }

  // Get refresh token
  getRefreshToken() {
    return this.refreshToken;
  }

  // Get user
  getUser() {
    return this.user;
  }

  // Get user ID
  getUserId() {
    return this.user?.id;
  }

  // Get user email
  getUserEmail() {
    return this.user?.email;
  }

  // Get user name
  getUserName() {
    return this.user?.name;
  }

  // Get user roles
  getUserRoles() {
    return this.user?.roles || [];
  }

  // Get user permissions
  getUserPermissions() {
    return this.user?.permissions || [];
  }

  // Check if token is expired
  isTokenExpired() {
    if (!this.token) return true;

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }

  // Check if refresh token is expired
  isRefreshTokenExpired() {
    if (!this.refreshToken) return true;

    try {
      const payload = JSON.parse(atob(this.refreshToken.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  }

  // Get token expiration time
  getTokenExpirationTime() {
    if (!this.token) return null;

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.exp * 1000;
    } catch (error) {
      return null;
    }
  }

  // Get refresh token expiration time
  getRefreshTokenExpirationTime() {
    if (!this.refreshToken) return null;

    try {
      const payload = JSON.parse(atob(this.refreshToken.split('.')[1]));
      return payload.exp * 1000;
    } catch (error) {
      return null;
    }
  }

  // Get token payload
  getTokenPayload() {
    if (!this.token) return null;

    try {
      return JSON.parse(atob(this.token.split('.')[1]));
    } catch (error) {
      return null;
    }
  }

  // Get refresh token payload
  getRefreshTokenPayload() {
    if (!this.refreshToken) return null;

    try {
      return JSON.parse(atob(this.refreshToken.split('.')[1]));
    } catch (error) {
      return null;
    }
  }
}

// Create auth instance
const auth = new Auth();

// Export auth utilities
export default {
  auth,
};