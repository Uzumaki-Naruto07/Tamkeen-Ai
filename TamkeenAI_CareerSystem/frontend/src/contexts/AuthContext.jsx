import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import { handleError, createAuthenticationError } from '../utils/errorUtils';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token) {
        try {
          const response = await apiClient.get('/api/user/profile');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (err) {
          // If profile fetch fails, try to refresh token
          if (refreshToken) {
            try {
              const refreshResponse = await apiClient.post('/api/auth/refresh-token', { refreshToken });
              const { token: newToken } = refreshResponse.data;
              localStorage.setItem('token', newToken);
              const profileResponse = await apiClient.get('/api/user/profile');
              setUser(profileResponse.data);
              setIsAuthenticated(true);
            } catch (refreshErr) {
              // If refresh fails, clear everything and redirect to login
              clearAuth();
              navigate('/login');
            }
          } else {
            clearAuth();
            navigate('/login');
          }
        }
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      clearAuth();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setError(null);
    setIsAuthenticated(false);
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await apiClient.post('/api/auth/login', { email, password });
      const { token, refreshToken, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      const error = handleError(err);
      setError(error.message || 'Login failed');
      throw createAuthenticationError(error.message || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await apiClient.post('/api/auth/register', userData);
      const { token, refreshToken, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      const error = handleError(err);
      setError(error.message || 'Registration failed');
      throw createAuthenticationError(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await apiClient.put('/api/user/profile', profileData);
      setUser(response.data);
    } catch (err) {
      const error = handleError(err);
      setError(error.message || 'Profile update failed');
      throw createAuthenticationError(error.message || 'Profile update failed');
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 