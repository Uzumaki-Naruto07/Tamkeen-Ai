import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { api } from '../api/apiClient';
import { AUTH_ENDPOINTS, USER_ENDPOINTS, JOB_ENDPOINTS } from '../api/endpoints';
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

// Add hooks for all the other contexts users might expect
export const useAuth = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAuth must be used within an AppContextProvider');
  }
  
  const { 
    user, 
    login, 
    logout, 
    register, 
    error, 
    loading, 
    isAuthenticated 
  } = context;
  
  return { 
    user, 
    login, 
    logout, 
    register, 
    error, 
    loading, 
    isAuthenticated 
  };
};

export const useResume = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useResume must be used within an AppContextProvider');
  }
  
  // This is a simplified version of the useResume hook for compatibility
  return { 
    resume: context.profile?.resume || null,
    resumeScore: context.profile?.resumeScore || null,
    currentResume: context.currentResume || null,
    setCurrentResume: context.setCurrentResume || (() => {})
  };
};

export const useJob = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useJob must be used within an AppContextProvider');
  }
  
  const { 
    savedJobs,
    setSavedJobs,
    toggleSaveJob,
    fetchSavedJobs,
    isSavedJob,
    removeSavedJob
  } = context;
  
  return {
    savedJobs,
    setSavedJobs,
    toggleSaveJob,
    fetchSavedJobs,
    isSavedJob,
    removeSavedJob,
    // Compute derived data
    jobCount: savedJobs?.length || 0,
    hasSavedJobs: (savedJobs?.length || 0) > 0,
    // Helper functions
    getSavedJobsCount: () => savedJobs?.length || 0,
    getSavedJobById: (jobId) => savedJobs?.find(job => job.id === jobId) || null,
    getRecentlySavedJobs: (limit = 5) => savedJobs?.slice(0, limit) || []
  };
};

export const useDoc = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useDoc must be used within an AppContextProvider');
  }
  
  // This is a simplified version of the useDoc hook for compatibility
  return {
    documents: [],
    currentDocument: null
  };
};

export const useAnalysis = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AppContextProvider');
  }
  
  // This is a simplified version of the useAnalysis hook for compatibility
  return {
    atsResults: null,
    skillGapAnalysis: null,
    marketInsights: null
  };
};

export const useNotifications = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useNotifications must be used within an AppContextProvider');
  }
  
  const { 
    notifications, 
    unreadCount,
    fetchNotifications,
    markNotificationAsRead 
  } = context;
  
  return { 
    notifications, 
    unreadCount,
    fetchNotifications,
    markNotificationAsRead 
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
  const [savedJobs, setSavedJobs] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  
  // Initialize saved jobs from localStorage if available
  useEffect(() => {
    const storedSavedJobs = localStorage.getItem('savedJobs');
    if (storedSavedJobs) {
      try {
        setSavedJobs(JSON.parse(storedSavedJobs));
      } catch (e) {
        console.error('Failed to parse saved jobs from localStorage:', e);
        // Initialize with empty array if parsing fails
        setSavedJobs([]);
      }
    }
  }, []);

  // Persist saved jobs to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
  }, [savedJobs]);
  
  // Job management functions
  const toggleSaveJob = useCallback((job) => {
    setSavedJobs(prevSavedJobs => {
      const jobIndex = prevSavedJobs.findIndex(savedJob => savedJob.id === job.id);
      
      if (jobIndex !== -1) {
        // If job is already saved, remove it
        return prevSavedJobs.filter(savedJob => savedJob.id !== job.id);
      } else {
        // Otherwise add it to saved jobs
        return [...prevSavedJobs, { 
          ...job,
          savedAt: new Date().toISOString() 
        }];
      }
    });
  }, []);
  
  const isSavedJob = useCallback((jobId) => {
    return savedJobs.some(job => job.id === jobId);
  }, [savedJobs]);
  
  const fetchSavedJobs = useCallback(async () => {
    try {
      // Try to fetch from API if user is authenticated
      if (user && user.id) {
        try {
          const response = await JOB_ENDPOINTS.jobs.getSavedJobs(user.id);
          if (response && response.success && response.data) {
            setSavedJobs(response.data);
            return response.data;
          }
        } catch (error) {
          console.log('Error fetching saved jobs from API, using local storage instead:', error);
          // If API fails, we'll use what we have in local state
        }
      }
      
      // If no user or API failed, return local state
      return savedJobs;
    } catch (error) {
      console.error('Error in fetchSavedJobs:', error);
      return savedJobs;
    }
  }, [user, savedJobs]);
  
  const removeSavedJob = useCallback(async (jobId) => {
    try {
      // Try to remove from API if user is authenticated
      if (user && user.id) {
        try {
          await JOB_ENDPOINTS.jobs.unsaveJob(jobId);
        } catch (error) {
          console.log('Error removing job from API:', error);
          // Continue with local removal even if API fails
        }
      }
      
      // Always update local state
      setSavedJobs(prevSavedJobs => 
        prevSavedJobs.filter(job => job.id !== jobId)
      );
      
      return true;
    } catch (error) {
      console.error('Error in removeSavedJob:', error);
      return false;
    }
  }, [user]);
  
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
      // Add support for UAE PASS login
      const uaePassUserData = localStorage.getItem('user_data');
      
      if (token) {
        try {
          setLoading(true);
          
          // UAE PASS authentication
          if (token === 'mock_uae_pass_token' && uaePassUserData) {
            try {
              // Parse the user data
              const userData = JSON.parse(uaePassUserData);
              
              if (!userData || !userData.id || !userData.email) {
                throw new Error('Invalid UAE PASS user data');
              }
              
              // Set the user in the context
              setUser(userData);
              setUserRoles(['user']);
              
              // Look for user-specific profile data
              const userId = userData.id;
              const profileKey = `profile_${userId}`;
              
              // Try to load profile from localStorage
              const profileData = localStorage.getItem(profileKey);
              
              if (profileData) {
                try {
                  // Parse and use the stored profile
                  const userProfile = JSON.parse(profileData);
                  console.log(`Loaded profile for UAE PASS user ${userData.name} (${userId})`);
                  setProfile(userProfile);
                } catch (parseErr) {
                  console.error('Failed to parse stored profile:', parseErr);
                  
                  // Initialize with a basic profile if parse fails
                  const nameParts = userData.name ? userData.name.split(' ') : ['User', ''];
                  const basicProfile = {
                    id: userId,
                    userId: userId,
                    fullName: userData.name || 'User',
                    firstName: nameParts[0] || '',
                    lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '',
                    email: userData.email,
                    bio: 'UAE PASS authenticated user',
                    skills: [],
                    experience: '',
                    avatar: userData.avatar
                  };
                  
                  setProfile(basicProfile);
                  
                  // Save the basic profile
                  localStorage.setItem(profileKey, JSON.stringify(basicProfile));
                }
              } else {
                // No profile found, create a new one
                console.log(`No profile found for UAE PASS user ${userData.name}, creating new profile`);
                const nameParts = userData.name ? userData.name.split(' ') : ['User', ''];
                const newProfile = {
                  id: userId,
                  userId: userId,
                  fullName: userData.name || 'User',
                  firstName: nameParts[0] || '',
                  lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : '',
                  email: userData.email,
                  bio: 'UAE PASS authenticated user',
                  skills: [],
                  experience: '',
                  avatar: userData.avatar
                };
                
                setProfile(newProfile);
                
                // Save the new profile
                localStorage.setItem(profileKey, JSON.stringify(newProfile));
              }
              
              setLoading(false);
              return;
            } catch (err) {
              console.error('Failed to process UAE PASS user data:', err);
              // Continue to normal authentication flow or logout
              logout();
              setLoading(false);
              return;
            }
          }
          
          // In development, we can just set a mock user if we have a token
          if (import.meta.env.DEV && token.startsWith('mock-token')) {
            const mockUserId = token.split('-')[2];
            const mockUser = {
              id: mockUserId,
              email: mockUserId === '1' ? 'admin@tamkeen.ai' : 'user@tamkeen.ai',
              name: mockUserId === '1' ? 'Admin User' : 'Hessa',
              firstName: mockUserId === '1' ? 'Admin' : 'Hessa',
              lastName: mockUserId === '1' ? 'User' : '',
              roles: mockUserId === '1' ? ['admin', 'user'] : ['user'],
            };
            
            setUser(mockUser);
            setUserRoles(mockUser.roles);
            setProfile({
              id: mockUserId,
              userId: mockUserId,
              fullName: mockUser.name,
              firstName: mockUser.firstName,
              lastName: mockUser.lastName,
              bio: 'This is a mock profile for development purposes',
              skills: ['React', 'JavaScript', 'UI/UX'],
              experience: '5 years',
              avatar: null // Don't auto-generate an avatar
            });
            setLoading(false);
            return;
          }
          
          // Normal API call in production
          const response = await api.get(AUTH_ENDPOINTS.ME);
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
      const response = await api.get(USER_ENDPOINTS.PROFILE);
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
      
      // In development mode, just simulate a successful update
      if (import.meta.env.DEV) {
        console.log('DEV MODE: Simulating profile update', profileData);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Make sure we have a consistent format for name properties
        let updatedProfile = { ...profileData };
        
        // Handle fullName, firstName, lastName consistency
        if (profileData.firstName && profileData.lastName) {
          updatedProfile.fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
        } else if (profileData.fullName && !profileData.firstName) {
          // Extract firstName and lastName from fullName if provided
          const nameParts = profileData.fullName.split(' ');
          updatedProfile.firstName = nameParts[0] || '';
          updatedProfile.lastName = nameParts.slice(1).join(' ') || '';
        }
        
        // Handle avatar URL validation
        if (updatedProfile.hasOwnProperty('avatar')) {
          // Log the avatar update to help with debugging
          console.log('DEV MODE: Updating avatar in profile:', updatedProfile.avatar);
          
          // Synchronize avatar across all profile storage locations
          const userId = updatedProfile.id || updatedProfile.userId || user?.id || 'unknown-user';
          const avatarValue = updatedProfile.avatar;
          
          // Update all profile-related localStorage entries
          try {
            // Update main profile storage
            const mainProfileKey = `profile_${userId}`;
            const mainProfile = JSON.parse(localStorage.getItem(mainProfileKey) || '{}');
            mainProfile.avatar = avatarValue;
            localStorage.setItem(mainProfileKey, JSON.stringify(mainProfile));
            
            // Update userProfile if it exists
            const userProfileData = JSON.parse(localStorage.getItem('userProfile') || '{}');
            userProfileData.profileImage = avatarValue;
            userProfileData.avatar = avatarValue;
            localStorage.setItem('userProfile', JSON.stringify(userProfileData));
            
            // Update user_data if it exists (for UAE PASS)
            const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
            if (userData && userData.id) {
              userData.avatar = avatarValue;
              localStorage.setItem('user_data', JSON.stringify(userData));
            }
            
            console.log('Synchronized avatar across all profile storage locations');
          } catch (storageErr) {
            console.warn('Failed to fully synchronize avatar in localStorage:', storageErr);
          }
        }
        
        // Ensure we have a valid userId
        const userId = updatedProfile.id || updatedProfile.userId || user?.id || 'mock-user-1';
        updatedProfile.id = userId;
        updatedProfile.userId = userId;
        
        // Save to localStorage for persistence
        try {
          // Get existing profile data to merge
          const savedProfileJSON = localStorage.getItem(`profile_${userId}`);
          let combinedProfile = updatedProfile;
          
          if (savedProfileJSON) {
            try {
              const savedProfile = JSON.parse(savedProfileJSON);
              combinedProfile = {
                ...savedProfile,
                ...updatedProfile
              };
              
              // Ensure avatar is correctly propagated
              if (updatedProfile.hasOwnProperty('avatar')) {
                combinedProfile.avatar = updatedProfile.avatar;
              }
              
            } catch (e) {
              console.warn('Failed to parse saved profile:', e);
            }
          }
          
          localStorage.setItem(`profile_${userId}`, JSON.stringify(combinedProfile));
          console.log('DEV MODE: Saved updated profile to localStorage:', combinedProfile);
        } catch (err) {
          console.warn('Failed to save profile to localStorage:', err);
        }
        
        // If we don't have a profile yet, initialize a mock one
        if (!profile) {
          const mockProfile = {
            id: userId,
            userId: userId,
            firstName: updatedProfile.firstName || 'Hessa',
            lastName: updatedProfile.lastName || '',
            fullName: updatedProfile.fullName || 'Hessa',
            bio: updatedProfile.bio || 'This is a mock profile for development purposes',
            skills: updatedProfile.skills || ['React', 'JavaScript', 'UI/UX'],
            experience: updatedProfile.experience || '5 years',
            avatar: updatedProfile.hasOwnProperty('avatar') ? updatedProfile.avatar : null
          };
          setProfile(mockProfile);
          
          // Also update user state with the name and avatar
          setUser(prev => ({
            ...prev,
            name: mockProfile.fullName,
            firstName: mockProfile.firstName,
            lastName: mockProfile.lastName,
            avatar: mockProfile.avatar // Ensure avatar is updated in user object too
          }));
          
          return { success: true, data: { profile: mockProfile } };
        }
        
        // Update the profile state with the new data
        const mergedProfile = {
          ...profile,
          ...updatedProfile
        };
        
        // Ensure avatar is explicitly set if it was provided in the update
        if (updatedProfile.hasOwnProperty('avatar')) {
          mergedProfile.avatar = updatedProfile.avatar;
        }
        
        setProfile(mergedProfile);
        
        // Also update user state with the name and avatar
        setUser(prev => {
          const updatedUser = {
            ...prev,
            name: mergedProfile.fullName,
            firstName: mergedProfile.firstName,
            lastName: mergedProfile.lastName
          };
          
          // Only update the avatar if it was explicitly included in the update
          if (updatedProfile.hasOwnProperty('avatar')) {
            updatedUser.avatar = mergedProfile.avatar;
          }
          
          return updatedUser;
        });
        
        return { 
          success: true, 
          data: { 
            profile: mergedProfile
          }
        };
      }
      
      // Real API call for production
      const response = await api.put(USER_ENDPOINTS.UPDATE_PROFILE, profileData);
      const updatedProfile = response.data.data.profile;
      setProfile(updatedProfile);
      
      // Also update user name and avatar in user object
      setUser(prev => {
        const updatedUser = {
          ...prev,
          name: updatedProfile.fullName,
          firstName: updatedProfile.firstName,
          lastName: updatedProfile.lastName
        };
        
        // Only update avatar if it was part of the profile update
        if (profileData.hasOwnProperty('avatar')) {
          updatedUser.avatar = updatedProfile.avatar;
        }
        
        return updatedUser;
      });
      
      return response.data.data;
    } catch (err) {
      console.error('Failed to update profile:', err);
      
      // In development mode, still simulate success despite error
      if (import.meta.env.DEV) {
        console.log('DEV MODE: Returning successful response despite error');
        
        // Update the profile state with the new data anyway
        setProfile(prevProfile => {
          const updatedProfile = {
            ...prevProfile,
            ...profileData
          };
          
          return updatedProfile;
        });
        
        // Also update the user object for consistency
        if (profileData.hasOwnProperty('avatar')) {
          setUser(prevUser => ({
            ...prevUser,
            avatar: profileData.avatar
          }));
        }
        
        return { 
          success: true, 
          data: { 
            profile: {
              ...(profile || {}),
              ...profileData
            }
          }
        };
      }
      
      setError('Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Login function - fixed to use AUTH_ENDPOINTS endpoint and prevent duplicate calls
  const login = async (email, password) => {
    if (isLoggingIn) return { success: false, error: 'Login already in progress' };
    
    try {
      setIsLoggingIn(true);
      setLoading(true);
      setError(null);
      
      // Always use AUTH_ENDPOINTS.LOGIN instead of USER.LOGIN to prevent multiple calls
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, { email, password });
      
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
      
      const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
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
    // Clear all user data from context
    setToken(null);
    setUser(null);
    setProfile(null);
    setUserRoles([]);
    setSavedJobs([]);
    
    // Clear specific tokens
    localStorage.removeItem('token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('uaepass_user');
    
    // Clear user-specific data while preserving app settings
    const keysToKeep = ['language', 'theme', 'darkMode', 'rtl', 'highContrast'];
    
    // Get all keys from localStorage
    const keys = Object.keys(localStorage);
    
    // Filter out the keys we want to keep
    const keysToRemove = keys.filter(key => {
      // Keep specific app settings
      if (keysToKeep.includes(key)) return false;
      
      // Remove all profile data
      if (key.startsWith('profile_')) return true;
      
      // Remove all user-related data
      if (['userProfile', 'savedJobs', 'resumeAnalysisHistory', 
           'skillAssessmentHistory', 'userBookings', 'notifications',
           'dashboardLayout', 'hiddenWidgets', 'tourProgress'].includes(key)) {
        return true;
      }
      
      return false;
    });
    
    // Remove all filtered keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('User logged out. All user data cleared.');
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
      const response = await api.get(USER_ENDPOINTS.GET_NOTIFICATIONS);
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
      await api.put(USER_ENDPOINTS.MARK_NOTIFICATION_READ(id));
      
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
    // User state
    user,
    profile,
    loading,
    error,
    isLoggingIn,
    
    // User actions
    login,
    logout,
    register,
    updateUserProfile,
    
    // State setters (for direct manipulation)
    setUser,
    setToken,
    setProfile,
    
    // UI state
    theme,
    language,
    toggleTheme,
    changeLanguage,
    toggleLanguage,
    
    // Notifications
    notifications,
    unreadCount,
    fetchNotifications,
    markNotificationAsRead,
    
    // Role management
    userRoles,
    hasRole: (role) => userRoles.includes(role),
    
    // Job management
    savedJobs,
    setSavedJobs,
    toggleSaveJob,
    fetchSavedJobs,
    isSavedJob,
    removeSavedJob,
    
    // Resume management
    currentResume,
    setCurrentResume,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}; 