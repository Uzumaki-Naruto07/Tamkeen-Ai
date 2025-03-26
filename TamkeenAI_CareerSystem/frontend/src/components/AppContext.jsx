import React, { createContext, useContext, useState, useEffect, useCallback, useReducer } from 'react';
import axios from 'axios';

// Create contexts
const AuthContext = createContext();
const UserContext = createContext();
const ResumeContext = createContext();
const JobContext = createContext();
const AnalysisContext = createContext();
const UIContext = createContext();
const NotificationContext = createContext();

// Initial states
const initialAuthState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true,
  error: null
};

const initialUserState = {
  profile: null,
  skills: [],
  preferences: {},
  achievements: [],
  loading: false,
  error: null
};

const initialResumeState = {
  files: [],
  currentResume: null,
  versions: [],
  scores: [],
  loading: false,
  error: null
};

const initialJobState = {
  savedJobs: [],
  appliedJobs: [],
  currentJobDescription: null,
  jobSearchCriteria: {},
  loading: false,
  error: null
};

const initialAnalysisState = {
  atsResults: null,
  skillGapAnalysis: null,
  interviewResults: [],
  careerPathRecommendations: [],
  sentimentAnalysis: null,
  marketInsights: null,
  loading: false,
  error: null
};

const initialUIState = {
  theme: localStorage.getItem('theme') || 'light',
  language: localStorage.getItem('language') || 'en',
  sidebarOpen: false,
  currentView: 'dashboard',
  modalState: { open: false, type: null, data: null }
};

const initialNotificationState = {
  notifications: [],
  unreadCount: 0
};

// Reducers
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    case 'AUTH_CHECK_START':
      return { ...state, loading: true };
    case 'AUTH_CHECK_COMPLETE':
      return { ...state, loading: false };
    default:
      return state;
  }
};

const userReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_PROFILE_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_PROFILE_SUCCESS':
      return {
        ...state,
        profile: action.payload,
        loading: false,
        error: null
      };
    case 'FETCH_PROFILE_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_PROFILE_START':
      return { ...state, loading: true, error: null };
    case 'UPDATE_PROFILE_SUCCESS':
      return {
        ...state,
        profile: action.payload,
        loading: false,
        error: null
      };
    case 'UPDATE_PROFILE_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_SKILLS':
      return { ...state, skills: action.payload };
    case 'UPDATE_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'ADD_ACHIEVEMENT':
      return { ...state, achievements: [...state.achievements, action.payload] };
    default:
      return state;
  }
};

const resumeReducer = (state, action) => {
  switch (action.type) {
    case 'UPLOAD_RESUME_START':
      return { ...state, loading: true, error: null };
    case 'UPLOAD_RESUME_SUCCESS':
      return {
        ...state,
        files: [...state.files, action.payload],
        currentResume: action.payload,
        versions: [...state.versions, { id: action.payload.id, date: new Date(), version: state.versions.length + 1 }],
        loading: false,
        error: null
      };
    case 'UPLOAD_RESUME_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'SET_CURRENT_RESUME':
      return { ...state, currentResume: action.payload };
    case 'UPDATE_RESUME_SCORE':
      return {
        ...state,
        scores: [...state.scores, action.payload]
      };
    case 'DELETE_RESUME':
      return {
        ...state,
        files: state.files.filter(file => file.id !== action.payload),
        currentResume: state.currentResume && state.currentResume.id === action.payload ? null : state.currentResume,
        versions: state.versions.filter(v => v.id !== action.payload)
      };
    default:
      return state;
  }
};

const jobReducer = (state, action) => {
  switch (action.type) {
    case 'SET_JOB_DESCRIPTION':
      return { ...state, currentJobDescription: action.payload };
    case 'SAVE_JOB':
      if (state.savedJobs.some(job => job.id === action.payload.id)) {
        return state;
      }
      return { ...state, savedJobs: [...state.savedJobs, action.payload] };
    case 'REMOVE_SAVED_JOB':
      return { ...state, savedJobs: state.savedJobs.filter(job => job.id !== action.payload) };
    case 'APPLY_TO_JOB':
      if (state.appliedJobs.some(job => job.id === action.payload.id)) {
        return state;
      }
      return { ...state, appliedJobs: [...state.appliedJobs, { ...action.payload, appliedDate: new Date() }] };
    case 'UPDATE_JOB_SEARCH_CRITERIA':
      return { ...state, jobSearchCriteria: { ...state.jobSearchCriteria, ...action.payload } };
    case 'FETCH_JOBS_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_JOBS_SUCCESS':
      return { ...state, loading: false, error: null };
    case 'FETCH_JOBS_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const analysisReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ATS_RESULTS':
      return { ...state, atsResults: action.payload };
    case 'SET_SKILL_GAP_ANALYSIS':
      return { ...state, skillGapAnalysis: action.payload };
    case 'ADD_INTERVIEW_RESULT':
      return { ...state, interviewResults: [...state.interviewResults, action.payload] };
    case 'SET_CAREER_PATH_RECOMMENDATIONS':
      return { ...state, careerPathRecommendations: action.payload };
    case 'SET_SENTIMENT_ANALYSIS':
      return { ...state, sentimentAnalysis: action.payload };
    case 'SET_MARKET_INSIGHTS':
      return { ...state, marketInsights: action.payload };
    case 'ANALYSIS_LOADING_START':
      return { ...state, loading: true, error: null };
    case 'ANALYSIS_LOADING_END':
      return { ...state, loading: false };
    case 'ANALYSIS_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const uiReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return { ...state, theme: newTheme };
    case 'SET_LANGUAGE':
      localStorage.setItem('language', action.payload);
      return { ...state, language: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    case 'OPEN_MODAL':
      return { ...state, modalState: { open: true, type: action.payload.type, data: action.payload.data } };
    case 'CLOSE_MODAL':
      return { ...state, modalState: { ...state.modalState, open: false } };
    default:
      return state;
  }
};

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload ? { ...notification, read: true } : notification
        ),
        unreadCount: state.unreadCount > 0 ? state.unreadCount - 1 : 0
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadCount: 0
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
        unreadCount: state.notifications.find(n => n.id === action.payload && !n.read)
          ? state.unreadCount - 1
          : state.unreadCount
      };
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };
    default:
      return state;
  }
};

// AppProvider component
const AppProvider = ({ children }) => {
  // Set up reducers
  const [authState, authDispatch] = useReducer(authReducer, initialAuthState);
  const [userState, userDispatch] = useReducer(userReducer, initialUserState);
  const [resumeState, resumeDispatch] = useReducer(resumeReducer, initialResumeState);
  const [jobState, jobDispatch] = useReducer(jobReducer, initialJobState);
  const [analysisState, analysisDispatch] = useReducer(analysisReducer, initialAnalysisState);
  const [uiState, uiDispatch] = useReducer(uiReducer, initialUIState);
  const [notificationState, notificationDispatch] = useReducer(notificationReducer, initialNotificationState);

  // Set up API axios instance
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Add auth token to requests
  useEffect(() => {
    if (authState.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${authState.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [authState.token]);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!authState.token) {
        authDispatch({ type: 'AUTH_CHECK_COMPLETE' });
        return;
      }

      try {
        authDispatch({ type: 'AUTH_CHECK_START' });
        const response = await api.get('/auth/me');
        authDispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: response.data, token: authState.token }
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        authDispatch({ type: 'LOGOUT' });
      } finally {
        authDispatch({ type: 'AUTH_CHECK_COMPLETE' });
      }
    };

    checkAuth();
  }, []);

  // Auth actions
  const login = async (credentials) => {
    try {
      authDispatch({ type: 'LOGIN_START' });
      const response = await api.post('/auth/login', credentials);
      authDispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data
      });
      
      // Fetch user profile after login
      fetchUserProfile();
      
      return response.data;
    } catch (error) {
      authDispatch({ type: 'LOGIN_FAILURE', payload: error.response?.data?.message || 'Login failed' });
      throw error;
    }
  };

  const logout = () => {
    authDispatch({ type: 'LOGOUT' });
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // User profile actions
  const fetchUserProfile = async () => {
    if (!authState.isAuthenticated) return;
    
    try {
      userDispatch({ type: 'FETCH_PROFILE_START' });
      const response = await api.get('/users/profile');
      userDispatch({ type: 'FETCH_PROFILE_SUCCESS', payload: response.data });
      return response.data;
    } catch (error) {
      userDispatch({ type: 'FETCH_PROFILE_FAILURE', payload: error.response?.data?.message || 'Failed to fetch profile' });
      throw error;
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      userDispatch({ type: 'UPDATE_PROFILE_START' });
      const response = await api.put('/users/profile', profileData);
      userDispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: response.data });
      return response.data;
    } catch (error) {
      userDispatch({ type: 'UPDATE_PROFILE_FAILURE', payload: error.response?.data?.message || 'Failed to update profile' });
      throw error;
    }
  };

  const updateUserSkills = (skills) => {
    userDispatch({ type: 'UPDATE_SKILLS', payload: skills });
  };

  const updateUserPreferences = (preferences) => {
    userDispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
  };

  const addUserAchievement = (achievement) => {
    userDispatch({ type: 'ADD_ACHIEVEMENT', payload: achievement });
  };

  // Resume actions
  const uploadResume = async (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    try {
      resumeDispatch({ type: 'UPLOAD_RESUME_START' });
      const response = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      resumeDispatch({ type: 'UPLOAD_RESUME_SUCCESS', payload: response.data });
      return response.data;
    } catch (error) {
      resumeDispatch({ type: 'UPLOAD_RESUME_FAILURE', payload: error.response?.data?.message || 'Failed to upload resume' });
      throw error;
    }
  };

  const setCurrentResume = (resume) => {
    resumeDispatch({ type: 'SET_CURRENT_RESUME', payload: resume });
  };

  const updateResumeScore = (score) => {
    resumeDispatch({ type: 'UPDATE_RESUME_SCORE', payload: score });
  };

  const deleteResume = async (resumeId) => {
    try {
      await api.delete(`/resumes/${resumeId}`);
      resumeDispatch({ type: 'DELETE_RESUME', payload: resumeId });
    } catch (error) {
      throw error;
    }
  };

  // Job actions
  const setJobDescription = (description) => {
    jobDispatch({ type: 'SET_JOB_DESCRIPTION', payload: description });
  };

  const saveJob = (job) => {
    jobDispatch({ type: 'SAVE_JOB', payload: job });
  };

  const removeSavedJob = (jobId) => {
    jobDispatch({ type: 'REMOVE_SAVED_JOB', payload: jobId });
  };

  const applyToJob = (job) => {
    jobDispatch({ type: 'APPLY_TO_JOB', payload: job });
  };

  const updateJobSearchCriteria = (criteria) => {
    jobDispatch({ type: 'UPDATE_JOB_SEARCH_CRITERIA', payload: criteria });
  };

  // Analysis actions
  const analyzeResumeATS = async (resumeId, jobDescriptionId) => {
    try {
      analysisDispatch({ type: 'ANALYSIS_LOADING_START' });
      const response = await api.post('/analysis/ats', { resumeId, jobDescriptionId });
      analysisDispatch({ type: 'SET_ATS_RESULTS', payload: response.data });
      return response.data;
    } catch (error) {
      analysisDispatch({ type: 'ANALYSIS_ERROR', payload: error.response?.data?.message || 'Analysis failed' });
      throw error;
    } finally {
      analysisDispatch({ type: 'ANALYSIS_LOADING_END' });
    }
  };

  const analyzeSkillGap = async (resumeId, jobDescriptionId) => {
    try {
      analysisDispatch({ type: 'ANALYSIS_LOADING_START' });
      const response = await api.post('/analysis/skill-gap', { resumeId, jobDescriptionId });
      analysisDispatch({ type: 'SET_SKILL_GAP_ANALYSIS', payload: response.data });
      return response.data;
    } catch (error) {
      analysisDispatch({ type: 'ANALYSIS_ERROR', payload: error.response?.data?.message || 'Analysis failed' });
      throw error;
    } finally {
      analysisDispatch({ type: 'ANALYSIS_LOADING_END' });
    }
  };

  const addInterviewResult = (result) => {
    analysisDispatch({ type: 'ADD_INTERVIEW_RESULT', payload: result });
  };

  const generateCareerPathRecommendations = async (userId) => {
    try {
      analysisDispatch({ type: 'ANALYSIS_LOADING_START' });
      const response = await api.get(`/analysis/career-path/${userId}`);
      analysisDispatch({ type: 'SET_CAREER_PATH_RECOMMENDATIONS', payload: response.data });
      return response.data;
    } catch (error) {
      analysisDispatch({ type: 'ANALYSIS_ERROR', payload: error.response?.data?.message || 'Analysis failed' });
      throw error;
    } finally {
      analysisDispatch({ type: 'ANALYSIS_LOADING_END' });
    }
  };

  const analyzeSentiment = async (text) => {
    try {
      analysisDispatch({ type: 'ANALYSIS_LOADING_START' });
      const response = await api.post('/analysis/sentiment', { text });
      analysisDispatch({ type: 'SET_SENTIMENT_ANALYSIS', payload: response.data });
      return response.data;
    } catch (error) {
      analysisDispatch({ type: 'ANALYSIS_ERROR', payload: error.response?.data?.message || 'Analysis failed' });
      throw error;
    } finally {
      analysisDispatch({ type: 'ANALYSIS_LOADING_END' });
    }
  };

  const fetchMarketInsights = async (criteria) => {
    try {
      analysisDispatch({ type: 'ANALYSIS_LOADING_START' });
      const response = await api.post('/analysis/market-insights', criteria);
      analysisDispatch({ type: 'SET_MARKET_INSIGHTS', payload: response.data });
      return response.data;
    } catch (error) {
      analysisDispatch({ type: 'ANALYSIS_ERROR', payload: error.response?.data?.message || 'Failed to fetch insights' });
      throw error;
    } finally {
      analysisDispatch({ type: 'ANALYSIS_LOADING_END' });
    }
  };

  // UI actions
  const toggleTheme = () => {
    uiDispatch({ type: 'TOGGLE_THEME' });
  };

  const setLanguage = (language) => {
    uiDispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  const toggleSidebar = () => {
    uiDispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const setCurrentView = (view) => {
    uiDispatch({ type: 'SET_CURRENT_VIEW', payload: view });
  };

  const openModal = (modalType, modalData = null) => {
    uiDispatch({ type: 'OPEN_MODAL', payload: { type: modalType, data: modalData } });
  };

  const closeModal = () => {
    uiDispatch({ type: 'CLOSE_MODAL' });
  };

  // Notification actions
  const addNotification = (notification) => {
    notificationDispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: Date.now().toString(),
        timestamp: new Date(),
        read: false,
        ...notification
      }
    });
  };

  const markNotificationAsRead = (notificationId) => {
    notificationDispatch({ type: 'MARK_AS_READ', payload: notificationId });
  };

  const markAllNotificationsAsRead = () => {
    notificationDispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const removeNotification = (notificationId) => {
    notificationDispatch({ type: 'REMOVE_NOTIFICATION', payload: notificationId });
  };

  const clearAllNotifications = () => {
    notificationDispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  };

  // Combine all context values
  const authContextValue = {
    ...authState,
    login,
    logout,
    register
  };

  const userContextValue = {
    ...userState,
    fetchUserProfile,
    updateUserProfile,
    updateUserSkills,
    updateUserPreferences,
    addUserAchievement
  };

  const resumeContextValue = {
    ...resumeState,
    uploadResume,
    setCurrentResume,
    updateResumeScore,
    deleteResume
  };

  const jobContextValue = {
    ...jobState,
    setJobDescription,
    saveJob,
    removeSavedJob,
    applyToJob,
    updateJobSearchCriteria
  };

  const analysisContextValue = {
    ...analysisState,
    analyzeResumeATS,
    analyzeSkillGap,
    addInterviewResult,
    generateCareerPathRecommendations,
    analyzeSentiment,
    fetchMarketInsights
  };

  const uiContextValue = {
    ...uiState,
    toggleTheme,
    setLanguage,
    toggleSidebar,
    setCurrentView,
    openModal,
    closeModal
  };

  const notificationContextValue = {
    ...notificationState,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <UserContext.Provider value={userContextValue}>
        <ResumeContext.Provider value={resumeContextValue}>
          <JobContext.Provider value={jobContextValue}>
            <AnalysisContext.Provider value={analysisContextValue}>
              <UIContext.Provider value={uiContextValue}>
                <NotificationContext.Provider value={notificationContextValue}>
                  {children}
                </NotificationContext.Provider>
              </UIContext.Provider>
            </AnalysisContext.Provider>
          </JobContext.Provider>
        </ResumeContext.Provider>
      </UserContext.Provider>
    </AuthContext.Provider>
  );
};

// Custom hooks for using the contexts
export const useAuth = () => useContext(AuthContext);
export const useUser = () => useContext(UserContext);
export const useResume = () => useContext(ResumeContext);
export const useJob = () => useContext(JobContext);
export const useAnalysis = () => useContext(AnalysisContext);
export const useUI = () => useContext(UIContext);
export const useNotifications = () => useContext(NotificationContext);

// App-wide hook that provides access to all contexts
export const useAppContext = () => {
  return {
    auth: useAuth(),
    user: useUser(),
    resume: useResume(),
    job: useJob(),
    analysis: useAnalysis(),
    ui: useUI(),
    notifications: useNotifications()
  };
};

export default AppProvider; 