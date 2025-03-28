import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { api } from '../api/apiClient';
import { USER } from '../api/endpoints';
import i18n from '../i18n';

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
  
  // Initialize theme on component mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);
  
  // Apply theme changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
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
  
  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(USER.LOGIN, { email, password });
      const { token, user } = response.data.data;
      
      // Store token
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      console.error('Login failed:', err);
      setError(err?.response?.data?.message || 'Login failed. Please check your credentials.');
      return { 
        success: false, 
        error: err?.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(USER.REGISTER, userData);
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
  
  // Theme toggle
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
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