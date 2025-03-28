import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { api } from '../api/apiClient';
import { USER } from '../api/endpoints';

// Create context
export const AppContext = createContext();

// Custom hook to use the AppContext
export const useAppContext = () => useContext(AppContext);

// User hook for user profile management
export const useUser = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useUser must be used within an AppContextProvider');
  }
  
  const { user, profile, updateUserProfile, loading } = context;
  return { user, profile, updateUserProfile, loading };
};

// Provider component
export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRoles, setUserRoles] = useState([]);
  const [error, setError] = useState(null);
  
  // Check authentication status on mount and token change
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          setLoading(true);
          const response = await api.get(USER.GET_CURRENT);
          setUser(response.data.data);
          setUserRoles(response.data.data.roles || []);
          
          // Fetch user profile
          fetchUserProfile();
        } catch (err) {
          console.error('Auth check failed:', err);
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [token]);
  
  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await api.get(USER.GET_PROFILE);
      setProfile(response.data.data.profile || {});
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError('Failed to load user profile');
    }
  };
  
  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await api.put(USER.UPDATE_PROFILE, profileData);
      setProfile(response.data.data.profile);
      return response.data.data;
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await api.post(USER.LOGIN, credentials);
      const { token, user } = response.data.data;
      
      // Store token
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      return user;
    } catch (err) {
      console.error('Login failed:', err);
      setError('Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post(USER.REGISTER, userData);
      return response.data;
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfile(null);
  }, []);
  
  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };
  
  // Change language
  const changeLanguage = (lang) => {
    localStorage.setItem('language', lang);
    setLanguage(lang);
  };
  
  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get(USER.GET_NOTIFICATIONS);
      setNotifications(response.data.data.notifications || []);
      setUnreadCount(response.data.data.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };
  
  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.put(USER.MARK_NOTIFICATION_READ(notificationId));
      setNotifications(
        notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };
  
  // Context value
  const contextValue = {
    user,
    profile,
    loading,
    theme,
    language,
    notifications,
    unreadCount,
    isAuthenticated: !!user,
    userRoles,
    error,
    login,
    register,
    logout,
    toggleTheme,
    changeLanguage,
    fetchNotifications,
    markNotificationAsRead,
    updateUserProfile,
    setError,
    clearError: () => setError(null)
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}; 