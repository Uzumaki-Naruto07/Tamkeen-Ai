import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { api } from '../api/apiClient';
import { AUTH, USER } from '../api/endpoints';
import i18n from '../i18n';
import { initializeTheme, setTheme, toggleTheme as toggleThemeUtil } from '../utils/themeToggle';

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
  
  const { 
    user, 
    profile, 
    updateUserProfile, 
    loading, 
    login, 
    logout, 
    register, 
    error,
    userRoles 
  } = context;
  
  // Add isAuthenticated computed property
  const isAuthenticated = !!user;
  
  return { 
    user, 
    profile, 
    updateUserProfile, 
    loading, 
    login, 
    logout, 
    register, 
    error,
    userRoles,
    isAuthenticated
  };
};

// UI hook for theme and language settings
export const useUI = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useUI must be used within an AppContextProvider');
  }
  
  const { 
    theme, 
    language, 
    toggleTheme, 
    changeLanguage,
    toggleLanguage
  } = context;
  
  // Function to set language for backward compatibility
  const setLanguage = (lang) => changeLanguage(lang);
  
  return { 
    theme, 
    language, 
    toggleTheme, 
    setLanguage,
    changeLanguage,
    toggleLanguage
  };
};

// Provider component
export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [theme, setThemeState] = useState(initializeTheme());
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRoles, setUserRoles] = useState([]);
  const [error, setError] = useState(null);
  
  // Apply language changes
  useEffect(() => {
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
    // Set the dir attribute on the html tag
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);
  
  // Check authentication status on mount and token change
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          setLoading(true);
          
          // In development, we can just set a mock user if we have a token
          if (import.meta.env.DEV && token.startsWith('mock-token')) {
            const mockUserId = token.split('-')[2];
            const mockUser = {
              id: mockUserId,
              email: mockUserId === '1' ? 'admin@tamkeen.ai' : 'user@tamkeen.ai',
              name: mockUserId === '1' ? 'Admin User' : 'Regular User',
              roles: mockUserId === '1' ? ['admin', 'user'] : ['user'],
            };
            
            setUser(mockUser);
            setUserRoles(mockUser.roles);
            setProfile({
              fullName: mockUser.name,
              bio: 'This is a mock profile for development purposes',
              skills: ['React', 'JavaScript', 'UI/UX'],
              experience: '5 years'
            });
            setLoading(false);
            return;
          }
          
          // Normal API call in production
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
  
  // Login function - fixed to use AUTH endpoint and prevent duplicate calls
  const login = async (email, password) => {
    if (isLoggingIn) return { success: false, error: 'Login already in progress' };
    
    try {
      setIsLoggingIn(true);
      setLoading(true);
      setError(null);
      
      // Always use AUTH.LOGIN instead of USER.LOGIN to prevent multiple calls
      const response = await api.post(AUTH.LOGIN, { email, password });
      
      // Check if response has the expected structure
      if (!response || !response.data || !response.data.data) {
        console.error('Invalid response format:', response);
        return { 
          success: false, 
          error: 'Invalid response from server' 
        };
      }
      
      const { token, user } = response.data.data;
      
      if (!token || !user) {
        console.error('Missing token or user in response:', response.data);
        return { 
          success: false, 
          error: 'Authentication failed: missing token or user data' 
        };
      }
      
      // Store token
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      console.error('Login failed:', err);
      
      // Safely convert any error to a string
      let errorMessage = 'Login failed. Please check your credentials.';
      
      try {
        if (err?.response?.data?.message) {
          errorMessage = String(err.response.data.message);
        } else if (err?.message && typeof err.message === 'string') {
          errorMessage = err.message;
        } else if (err && typeof err.toString === 'function') {
          errorMessage = `Login failed: ${err.toString()}`;
        }
      } catch (stringifyError) {
        console.error('Error while processing login error:', stringifyError);
        errorMessage = 'An unexpected error occurred during login';
      }
      
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage
      };
    } finally {
      setLoading(false);
      setIsLoggingIn(false);
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(AUTH.REGISTER, userData);
      const { token, user } = response.data.data;
      
      // Store token
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
      return { 
        success: false, 
        error: err?.response?.data?.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setUserRoles([]);
  };
  
  // Toggle theme
  const toggleTheme = () => {
    const newTheme = toggleThemeUtil();
    setThemeState(newTheme);
    return newTheme;
  };
  
  // Language toggle
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };
  
  // Change language directly
  const changeLanguage = (lang) => {
    setLanguage(lang);
  };
  
  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get(USER.GET_NOTIFICATIONS);
      const notifications = response.data.data.notifications || [];
      setNotifications(notifications);
      setUnreadCount(notifications.filter(n => !n.read).length);
      return notifications;
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
      return [];
    }
  };
  
  // Mark notification as read
  const markNotificationAsRead = async (id) => {
    try {
      await api.put(USER.MARK_NOTIFICATION_READ(id));
      
      // Update notifications state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError('Failed to update notification');
      return false;
    }
  };
  
  const contextValue = {
    user,
    profile,
    loading,
    isLoggingIn,
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
    toggleLanguage,
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