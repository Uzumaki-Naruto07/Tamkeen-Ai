/**
 * Authentication utilities for TamkeenAI Career System
 */
import apiEndpoints from './api';
import jwtDecode from 'jwt-decode';

/**
 * Check if the user is authenticated
 * @returns {boolean} Authentication status
 */
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }
  
  try {
    // Decode and check token expiration
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decodedToken.exp < currentTime) {
      // Token has expired
      return false;
    }
    
    return true;
  } catch (error) {
    // Invalid token
    return false;
  }
};

/**
 * Handle user login
 * @param {string} email User email
 * @param {string} password User password
 * @returns {Promise} Login result
 */
const login = async (email, password) => {
  try {
    const response = await fetch(apiEndpoints.auth.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Store tokens
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Handle user registration
 * @param {Object} userData User registration data
 * @returns {Promise} Registration result
 */
const register = async (userData) => {
  try {
    const response = await fetch(apiEndpoints.auth.register, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Some systems automatically log in after registration
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    
    return data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

/**
 * Handle user logout
 * @returns {Promise} Logout result
 */
const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Call logout endpoint if token exists
    if (token) {
      await fetch(apiEndpoints.auth.logout, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    
    // Clear local storage regardless of API response
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still clear local storage on error
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    return false;
  }
};

/**
 * Get the current user's information from the token
 * @returns {Object|null} User info or null if not authenticated
 */
const getCurrentUser = () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return null;
    }
    
    const decodedToken = jwtDecode(token);
    return decodedToken;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

/**
 * Request a password reset
 * @param {string} email User email
 * @returns {Promise} Request result
 */
const requestPasswordReset = async (email) => {
  try {
    const response = await fetch(apiEndpoints.auth.resetPassword, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Password reset request failed');
    }
    
    return data;
  } catch (error) {
    console.error('Password reset request failed:', error);
    throw error;
  }
};

/**
 * Reset password with token
 * @param {string} token Reset token
 * @param {string} newPassword New password
 * @returns {Promise} Reset result
 */
const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${apiEndpoints.auth.resetPassword}/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: newPassword }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Password reset failed');
    }
    
    return data;
  } catch (error) {
    console.error('Password reset failed:', error);
    throw error;
  }
};

/**
 * Verify email with token
 * @param {string} token Verification token
 * @returns {Promise} Verification result
 */
const verifyEmail = async (token) => {
  try {
    const response = await fetch(`${apiEndpoints.auth.verifyEmail}/${token}`, {
      method: 'GET',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Email verification failed');
    }
    
    return data;
  } catch (error) {
    console.error('Email verification failed:', error);
    throw error;
  }
};

/**
 * Check if user has specific role
 * @param {string} role Role to check
 * @returns {boolean} Has role
 */
const hasRole = (role) => {
  try {
    const user = getCurrentUser();
    
    if (!user || !user.roles) {
      return false;
    }
    
    return user.roles.includes(role);
  } catch (error) {
    console.error('Role check failed:', error);
    return false;
  }
};

export default {
  isAuthenticated,
  login,
  register,
  logout,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  hasRole,
}; 