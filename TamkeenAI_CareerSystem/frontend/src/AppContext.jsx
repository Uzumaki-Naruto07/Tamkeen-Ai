import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { jwtDecode } from 'jwt-decode';

// Create the context
export const AppContext = createContext(null);

// AppContext Provider Component
export const AppContextProvider = ({ children }) => {
  // User and authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Application data
  const [resumeData, setResumeData] = useState({});
  const [jobData, setJobData] = useState({});
  const [interviewData, setInterviewData] = useState({});
  const [assessmentResults, setAssessmentResults] = useState({});
  const [careerPath, setCareerPath] = useState([]);
  
  // UI preferences
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  
  // System state
  const [systemAnnouncements, setSystemAnnouncements] = useState([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [errors, setErrors] = useState([]);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Verify token is still valid
          try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            
            if (decoded.exp > currentTime) {
              // Set auth headers for all future requests
              api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
              
              // Fetch current user data
              const userData = await api.authApi.getCurrentUser();
              
              setUser(userData);
              setAuthToken(token);
              setUserRoles(userData.roles || []);
              setIsAuthenticated(true);
              
              // Initialize user's preferences
              if (userData.preferences) {
                if (userData.preferences.language) {
                  setLanguage(userData.preferences.language);
                }
                if (userData.preferences.theme) {
                  setTheme(userData.preferences.theme);
                }
              }
            } else {
              // Token expired
              await handleLogout();
            }
          } catch (error) {
            // Invalid token
            await handleLogout();
          }
        }
      } catch (error) {
        console.error('Authentication initialization error:', error);
        setErrors(prev => [...prev, { 
          id: Date.now(),
          message: 'Failed to initialize authentication',
          details: error.message
        }]);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Persist language and theme preferences to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  // Authentication methods
  const handleLogin = async (credentials) => {
    setLoading(true);
    try {
      const response = await api.authApi.login(credentials);
      
      const { token, user: userData } = response;
      
      // Save token in localStorage
      localStorage.setItem('token', token);
      
      // Set auth headers for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      setAuthToken(token);
      setUserRoles(userData.roles || []);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setErrors(prev => [...prev, { 
        id: Date.now(),
        message: 'Failed to login',
        details: error.response?.data?.message || error.message
      }]);
      return { 
        success: false, 
        error: error.response?.data?.message || 'An error occurred during login' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      // Call logout API endpoint if needed
      try {
        await api.authApi.logout();
      } catch (e) {
        // Continue logout process even if API call fails
        console.warn('Logout API call failed, continuing local logout');
      }
      
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Remove auth header
      delete api.defaults.headers.common['Authorization'];
      
      // Reset state
      setUser(null);
      setAuthToken(null);
      setUserRoles([]);
      setIsAuthenticated(false);
      setResumeData({});
      setJobData({});
      setInterviewData({});
      setAssessmentResults({});
      setCareerPath([]);
      setNotifications([]);
      setUnreadNotificationCount(0);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'An error occurred during logout' };
    }
  };
  
  const handleRegister = async (userData) => {
    setLoading(true);
    try {
      const response = await api.authApi.register(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);
      setErrors(prev => [...prev, { 
        id: Date.now(),
        message: 'Failed to register',
        details: error.response?.data?.message || error.message
      }]);
      return { 
        success: false, 
        error: error.response?.data?.message || 'An error occurred during registration' 
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Notifications methods
  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadNotificationCount(prev => prev + 1);
  };
  
  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.userApi.markNotificationRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      
      return { success: true };
    } catch (error) {
      console.error('Mark notification error:', error);
      return { success: false, error: 'Failed to mark notification as read' };
    }
  };
  
  const deleteNotification = async (notificationId) => {
    try {
      await api.userApi.deleteNotification(notificationId);
      
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      const wasUnread = notificationToDelete && !notificationToDelete.read;
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (wasUnread) {
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Delete notification error:', error);
      return { success: false, error: 'Failed to delete notification' };
    }
  };
  
  // Theme toggling
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  // Language switching
  const toggleLanguage = () => {
    setLanguage(prevLanguage => prevLanguage === 'en' ? 'ar' : 'en');
  };
  
  // Error handling
  const addError = (error) => {
    setErrors(prev => [...prev, { id: Date.now(), ...error }]);
  };
  
  const clearError = (errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  };
  
  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return userRoles.includes(role);
  }, [userRoles]);
  
  // Define the context value with all state and functions
  const contextValue = {
    // User and Authentication
    user,
    setUser,
    isAuthenticated,
    userRoles,
    loading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    hasRole,
    
    // Application Data
    resumeData,
    setResumeData,
    jobData,
    setJobData,
    interviewData,
    setInterviewData,
    assessmentResults,
    setAssessmentResults,
    careerPath,
    setCareerPath,
    
    // UI Preferences
    language,
    setLanguage,
    toggleLanguage,
    theme,
    setTheme,
    toggleTheme,
    sidebarOpen,
    setSidebarOpen,
    
    // Notifications
    notifications,
    unreadNotificationCount,
    addNotification,
    markNotificationAsRead,
    deleteNotification,
    
    // System
    systemAnnouncements,
    maintenanceMode,
    errors,
    addError,
    clearError
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext);

export default AppContextProvider;