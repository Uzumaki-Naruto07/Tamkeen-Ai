/**
 * API endpoints for the Tamkeen AI Career System
 */

import axios from 'axios';

// Base API URL - uses environment variable or defaults to local development URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with common configuration
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a separate axios instance for career endpoints to handle CORS better
const careerApi = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  // Disable credentials to avoid CORS preflight issues
  withCredentials: false
});

// Add request interceptor to include auth token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add error handling for CORS issues
careerApi.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_NETWORK' || (error.response && error.response.status === 0)) {
      console.warn('CORS or network error with career API - using fallback data');
      // Return a resolved promise with null to trigger fallback mechanism
      return Promise.resolve({ data: null });
    }
    return Promise.reject(error);
  }
);

// API endpoints organized by feature
const apiEndpoints = {
  // Authentication endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    resetPassword: (email) => api.post('/auth/reset-password', { email }),
    verifyEmail: (token) => api.post(`/auth/verify-email/${token}`),
  },
  
  // User profile endpoints
  profile: {
    getProfile: () => api.get('/profile'),
    updateProfile: (profileData) => api.put('/profile', profileData),
    uploadResume: (formData) => api.post('/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    uploadProfilePicture: (formData) => api.post('/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  },
  
  // Jobs endpoints
  jobs: {
    getJobs: (filters) => api.get('/jobs', { params: filters }),
    getJobById: (jobId) => api.get(`/jobs/${jobId}`),
    applyForJob: (jobId, applicationData) => api.post(`/jobs/${jobId}/apply`, applicationData),
    saveJob: (jobId) => api.post(`/jobs/${jobId}/save`),
    unsaveJob: (jobId) => api.delete(`/jobs/${jobId}/save`),
    getSavedJobs: () => api.get('/jobs/saved'),
    getApplications: () => api.get('/applications'),
  },
  
  // Skills assessment endpoints
  assessments: {
    getAssessments: () => api.get('/assessments'),
    startAssessment: (assessmentId) => api.post(`/assessments/${assessmentId}/start`),
    submitAssessment: (assessmentId, answers) => api.post(`/assessments/${assessmentId}/submit`, { answers }),
    getResults: (assessmentId) => api.get(`/assessments/${assessmentId}/results`),
    detectEmotion: (formData) => api.post('/assessments/emotion-detection', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  },
  
  // Learning resources endpoints
  learning: {
    getResources: (filters) => api.get('/learning/resources', { params: filters }),
    getResourceById: (resourceId) => api.get(`/learning/resources/${resourceId}`),
    bookmarkResource: (resourceId) => api.post(`/learning/bookmark/${resourceId}`),
    removeBookmark: (resourceId) => api.delete(`/learning/bookmark/${resourceId}`),
    getBookmarkedResources: () => api.get('/learning/bookmarks'),
    markCompleted: (resourceId) => api.post(`/learning/completed/${resourceId}`),
    getCompletedResources: () => api.get('/learning/completed'),
    getUserProgress: () => api.get('/learning/progress'),
  },
  
  // Interview practice endpoints
  interviews: {
    getPracticeInterview: () => api.get('/interviews/practice'),
    getAssessmentInterview: () => api.get('/interviews/assessment'),
    submitPracticeAnswer: (sessionId, questionId, answerData) => 
      api.post(`/interviews/practice/${sessionId}/questions/${questionId}`, answerData),
    submitAssessmentAnswer: (sessionId, questionId, answerData) => 
      api.post(`/interviews/assessment/${sessionId}/questions/${questionId}`, answerData),
    getInterviewResults: (sessionId) => api.get(`/interviews/results/${sessionId}`),
  },
  
  // Skills endpoints
  skills: {
    getAllSkills: () => api.get('/skills'),
    getSkillById: (skillId) => api.get(`/skills/${skillId}`),
    getUserSkills: () => api.get('/skills/user'),
    addUserSkill: (skillData) => api.post('/skills/user', skillData),
    updateUserSkill: (skillId, skillData) => api.put(`/skills/user/${skillId}`, skillData),
    removeUserSkill: (skillId) => api.delete(`/skills/user/${skillId}`),
    getUserSkillStats: (userId) => api.get(`/skills/user/${userId}/stats`),
  },
  
  // Gamification endpoints
  gamification: {
    getUserProgress: (userId) => api.get(`/gamification/progress/${userId}`),
    getUserBadges: (userId) => api.get(`/gamification/badges/${userId}`),
    getUserAchievements: (userId) => api.get(`/gamification/achievements/${userId}`),
    getChallenges: (userId) => api.get(`/gamification/challenges/${userId}`),
    acceptChallenge: (userId, challengeId) => api.post(`/gamification/challenges/${userId}/accept/${challengeId}`),
    completeChallenge: (userId, challengeId) => api.post(`/gamification/challenges/${userId}/complete/${challengeId}`),
    getActivityHistory: (userId) => api.get(`/gamification/activities/${userId}`),
    awardXP: (userId, amount, reason) => api.post(`/gamification/xp/${userId}`, { amount, reason }),
    awardBadge: (userId, badgeId) => api.post(`/gamification/badges/${userId}/award/${badgeId}`),
  },
  
  // Career endpoints with special CORS handling
  career: {
    analyzePrediction: (assessmentData) => {
      console.log("Sending data to career prediction API...");
      try {
        return careerApi.post('/career/analyze-prediction', assessmentData);
      } catch (error) {
        console.error("Error in career prediction API:", error);
        // Return a failed promise that will be caught by the caller
        return Promise.reject(error);
      }
    },
    getRecommendations: (userId) => {
      try {
        return careerApi.get(`/career/recommendations?userId=${userId}`);
      } catch (error) {
        console.error("Error in career recommendations API:", error);
        return Promise.reject(error);
      }
    }
  },
  
  // Emotion detection endpoints
  emotions: {
    detectEmotion: async (imageData) => {
      try {
        // If the imageData is a base64 string, convert it to a blob for sending
        let formData;
        if (typeof imageData === 'string' && imageData.startsWith('data:image')) {
          const byteString = atob(imageData.split(',')[1]);
          const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          
          const blob = new Blob([ab], { type: mimeString });
          formData = new FormData();
          formData.append('image', blob, 'emotion-capture.jpg');
        } else if (imageData instanceof FormData) {
          formData = imageData;
        } else {
          throw new Error('Invalid image data format');
        }
        
        const response = await api.post('/emotions/detect', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        return response.data;
      } catch (error) {
        console.error('Error in emotion detection API call:', error);
        throw error;
      }
    },
    
    // WebSocket connection for real-time emotion detection
    getWebSocketUrl: (sessionId) => {
      const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
      const host = import.meta.env.VITE_WS_HOST || window.location.host;
      return `${protocol}${host}/ws/emotions/${sessionId}`;
    },
  },
};

export default apiEndpoints; 