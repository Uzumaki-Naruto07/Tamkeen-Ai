/**
 * API Integration for TamkeenAI Career System
 * Provides functions to interact with the backend API
 */
import axios from 'axios';
import * as endpoints from './endpoints';
import withMockFallback, { isBackendUnavailable } from './mockFallback';
import { JOB_ENDPOINTS } from '../api/endpoints';

// Import all our API modules
import authService from '../api/auth';
import chatgptApi from '../api/chatgpt';
import learningApi from '../api/learning';
import resumeApi from '../api/resume';
import jobsApi from '../api/jobs';
import profileApi from '../api/profile';
import assessmentApi from '../api/assessment';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 5000, // Reduced timeout for faster fallback to mock data
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: false // Keep as false to avoid CORS issues with wildcard origin responses
});

// Create a separate instance for interview API
const interviewApi = axios.create({
  baseURL: import.meta.env.VITE_INTERVIEW_API_URL ? `${import.meta.env.VITE_INTERVIEW_API_URL}/api` : 'http://localhost:5001/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: false // Keep as false to avoid CORS issues with wildcard origin responses
});

// Set up global variable to track if backend is available
let isBackendAvailable = false;
let backendCheckInProgress = false;

// Helper function to get consistent avatar numbers from user IDs
export const getConsistentAvatarUrl = (userId) => {
  // Helper function to hash a string to a number
  const hashString = (str) => {
    let hash = 0;
    if (!str || str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  const userIdStr = String(userId || 'default-user');
  const hash = hashString(userIdStr);
  const avatarNumber = hash % 70; // Randomuser.me has about 70 different avatars
  const isMale = hash % 2 === 0;
  const gender = isMale ? 'men' : 'women';
  
  return `https://randomuser.me/api/portraits/${gender}/${avatarNumber}.jpg`;
};

// Check backend availability with health check endpoint
const checkBackendAvailability = async () => {
  if (backendCheckInProgress) return isBackendAvailable;
  
  backendCheckInProgress = true;
  try {
    // Try to hit the health check endpoint, with minimal headers to avoid CORS
    const response = await axios({
      method: 'get',
      url: `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/health-check`,
      timeout: 2000,
      headers: {
        'Accept': 'application/json'
        // Explicitly NOT including Authorization header to avoid CORS preflight
      },
      withCredentials: false
    });
    
    isBackendAvailable = response.status === 200;
    console.log('Backend availability check:', isBackendAvailable ? 'CONNECTED' : 'DISCONNECTED');
  } catch (err) {
    isBackendAvailable = false;
    console.log('Backend availability check: DISCONNECTED');
  } finally {
    backendCheckInProgress = false;
  }
  return isBackendAvailable;
};

// Initial check
checkBackendAvailability();

// Add a request interceptor to check if we should skip real API calls
api.interceptors.request.use(async (config) => {
  // If URL starts with /api, remove it (baseURL already includes it)
  if (config.url && config.url.startsWith('/api')) {
    config.url = config.url.substring(4);
  }
  
  // Check if backend is available
  if (!isBackendAvailable && !backendCheckInProgress) {
    // Try to check if backend is available now
    const isAvailable = await checkBackendAvailability();
    if (!isAvailable) {
      console.log(`Backend appears to be unavailable, request may fail: ${config.url}`);
    }
  }

  // Handle authentication tokens without causing CORS preflight issues
  const token = localStorage.getItem('token');
  if (token) {
    // Add token to auth header - use X-Auth-Token which doesn't trigger CORS preflight
    // This is safer than using Authorization: Bearer which requires preflight for CORS
    config.headers['X-Auth-Token'] = token;
  }
  
  // Always log the request URL for debugging
  console.log('Request URL:', config.url);
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Diagnostic response interceptor to log request/response details
api.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data ? 'Data received' : 'No data'
    });
    return response;
  },
  (error) => {
    const requestDetails = error.config ? {
      url: error.config.url,
      method: error.config.method,
      baseURL: error.config.baseURL,
      fullURL: error.config.baseURL + error.config.url
    } : 'No request config available';
    
    console.error('API Response Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      requestDetails: requestDetails
    });
    
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      console.warn('Request timeout occurred - falling back to mock data');
      // Return a resolved promise with null to allow fallback to mock data
      return Promise.resolve({ data: null, status: 408, statusText: 'Request Timeout' });
    }
    
    // Handle 401 Unauthorized errors - DON'T redirect, just clear token
    if (error.response && error.response.status === 401) {
      // Clear token but don't redirect - let React context handle this 
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't use window.location.href to avoid breaking React context
      console.warn('Authentication token expired or invalid');
    }
    
    // Handle METHOD NOT ALLOWED errors (405)
    if (error.response && error.response.status === 405) {
      console.warn('Method not allowed - falling back to mock data');
      // This is a server config issue where the API method configuration is incorrect
      return Promise.resolve({ data: null, status: 405, statusText: 'Method Not Allowed' });
    }
    
    // Handle CORS or network errors gracefully
    if (error.code === 'ERR_NETWORK' || (error.response && error.response.status === 0)) {
      console.warn('Network or CORS error detected, using mock fallbacks');
      // Mark backend as unavailable to skip future real API calls
      isBackendAvailable = false;
      // Set a temporary flag to avoid repeated failed requests
      if (typeof window !== 'undefined') {
        localStorage.setItem('backend-unavailable', 'true');
        // Clear after 30 seconds
        setTimeout(() => {
          localStorage.removeItem('backend-unavailable');
        }, 30000);
      }
      // Return a resolved promise with null to allow fallback to mock data
      return Promise.resolve({ data: null, status: 0, statusText: 'Network Error' });
    }
    
    return Promise.reject(error);
  }
);

// Utility function to check if the backend is unavailable
export const isBackendDown = () => !isBackendAvailable;

// Export API for direct use
export { api, checkBackendAvailability };

/**
 * Reset backend availability flags and try to reconnect
 * Call this function when you want to force a retry of real API calls
 */
export const resetBackendAvailability = async () => {
  // Clear local storage flags
  if (typeof window !== 'undefined') {
    localStorage.removeItem('backend-unavailable');
    // Clear all mock warnings too
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('mock-warning-')) {
        localStorage.removeItem(key);
      }
    });
  }
  
  // Reset in-memory flag
  isBackendAvailable = false;
  
  // Try to check backend availability
  const available = await checkBackendAvailability();
  
  console.log(`Backend availability reset: ${available ? 'CONNECTED' : 'DISCONNECTED'}`);
  return available;
};

// Set up a periodic check to see if backend comes back online
if (typeof window !== 'undefined') {
  // Check every 2 minutes
  setInterval(async () => {
    if (!isBackendAvailable) {
      const available = await checkBackendAvailability();
      if (available) {
        console.log('Backend is now available, resetting state');
        resetBackendAvailability();
      }
    }
  }, 120000); // 2 minutes
}

// Centralized API endpoints
const apiEndpoints = {
  auth: authService,
  chatgpt: chatgptApi,
  learning: learningApi,
  resume: resumeApi,
  jobs: jobsApi,
  profile: profileApi,
  assessment: assessmentApi,
  
  // Add interview coach endpoints
  interviews: {
    createOrLoadConversation: async (userId) => {
      try {
        // Use axios directly to avoid authorization headers and CORS issues
        const response = await axios({
          method: 'post',
          url: `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/interviews/conversation`, 
          data: { userId },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            // Explicitly NOT including Authorization header to avoid CORS preflight
          },
          withCredentials: false
        });
        return response.data;
      } catch (error) {
        console.error('Error creating conversation:', error);
        // Use mock data as fallback
        return {
          conversationId: 'mock-convo-' + Date.now(),
          messages: []
        };
      }
    },
    getPreviousConversations: (userId) => interviewApi.get(`/interviews/conversations/${userId}`).catch(error => {
      console.log('Using mock data due to API failure', error);
      // Mock previous sessions
      return Promise.resolve({
        data: [
          {
            id: 'mock-session-1',
            title: 'Software Engineer Interview Prep',
            date: new Date(Date.now() - 86400000).toISOString(),
            messages: [{
              role: 'assistant',
              content: 'Hello! How can I help you with your interview preparation?',
              timestamp: new Date(Date.now() - 86400000).toISOString()
            }]
          },
          {
            id: 'mock-session-2',
            title: 'Product Manager Mock Interview',
            date: new Date(Date.now() - 172800000).toISOString(),
            messages: [{
              role: 'assistant',
              content: 'Hi there! Ready to prepare for your product manager interview?',
              timestamp: new Date(Date.now() - 172800000).toISOString()
            }]
          }
        ]
      });
    }),
    getInterviewTopics: () => interviewApi.get('/interviews/topics').catch(error => {
      console.log('Using mock data due to API failure', error);
      return Promise.resolve({
        data: [
          { id: "t1", name: "Behavioral Questions", count: 28 },
          { id: "t2", name: "Technical Skills", count: 42 },
          { id: "t3", name: "Situational Scenarios", count: 15 },
          { id: "t4", name: "Communication", count: 19 },
          { id: "t5", name: "Leadership & Teamwork", count: 23 }
        ]
      });
    }),
    getSuggestedQuestions: (userId) => interviewApi.get(`/interviews/suggested-questions/${userId}`).catch(error => {
      console.log('Using mock data due to API failure', error);
      return Promise.resolve({
        data: [
          "What are the most common interview questions for software engineers?",
          "How should I prepare for behavioral interviews?",
          "What's the best way to answer 'Tell me about yourself'?",
          "How can I improve my communication during interviews?",
          "What should I do if I don't know an answer?"
        ]
      });
    }),
    sendMessage: async (conversationId, message) => {
      try {
        console.log('API sendMessage received:', JSON.stringify(message));
        
        // Ensure message is not empty
        if (!message) {
          console.warn('Empty message detected, adding default content');
          message = 'Please provide advice about this interview question.';
        } else if (typeof message === 'object') {
          // Make sure we have either message.message or message.content
          if (!message.message && !message.content) {
            console.warn('Empty message object detected, adding default content');
            message.message = 'Please provide advice about this interview question.';
          }
        }
        
        // First try with OpenAI
        let response;
        try {
          console.log('Sending message to API:', JSON.stringify(message));
          response = await interviewApi.post('/interviews/message', {
            conversationId,
            message,
            useOpenAI: true
          });
        } catch (openaiError) {
          console.log('OpenAI request failed, falling back to DeepSeek', openaiError);
          // If OpenAI fails, try DeepSeek
          response = await interviewApi.post('/interviews/message', {
            conversationId,
            message,
            useOpenAI: false,
            useDeepSeek: message.useDeepSeek || true
          });
        }
        return response;
      } catch (error) {
        console.log('Error sending message, using fallback', error);
        // Fallback when API fails
        return {
          data: {
            role: 'assistant',
            content: "I understand your question about interview preparation. To provide the best advice, I'd recommend focusing on understanding the job description thoroughly, preparing specific examples from your experience, and practicing answers to common questions in your field.",
            timestamp: new Date().toISOString()
          }
        };
      }
    },
    loadConversation: async (convoId) => {
      try {
        const response = await interviewApi.get(`/interviews/conversation/${convoId}`);
        return response;
      } catch (error) {
        console.log('Error loading conversation, using fallback', error);
        return {
          data: {
            messages: [{
              role: 'assistant',
              content: 'Hello! I am your AI interview coach. How can I help you prepare for your interview today?',
              timestamp: new Date().toISOString()
            }]
          }
        };
      }
    },
    createConversation: async (userId) => {
      try {
        const response = await interviewApi.post('/interviews/conversation/new', { userId });
        return response;
      } catch (error) {
        console.log('Error creating new conversation, using fallback', error);
        return {
          data: {
            conversationId: 'mock-new-session-' + Date.now()
          }
        };
      }
    },
    getCategoryQuestions: async (categoryId) => {
      try {
        const response = await interviewApi.get(`/interviews/category-questions/${categoryId}`);
        return response;
      } catch (error) {
        console.log('Error getting category questions, using fallback', error);
        return {
          data: [
            "Tell me about a time you had to resolve a conflict in your team.",
            "How do you handle tight deadlines and pressure?",
            "Describe a situation where you failed and how you handled it.",
            "What's your approach to working with difficult team members?"
          ]
        };
      }
    },
    createMockInterview: async (setupData) => {
      try {
        const response = await interviewApi.post('/interviews/mock-interview', setupData);
        return response;
      } catch (error) {
        console.log('Error creating mock interview, using fallback', error);
        return {
          data: {
            mockInterviewId: 'mock-interview-' + Date.now(),
            questions: [
              "Tell me about yourself and your background.",
              "Why are you interested in this role?",
              "What are your greatest strengths and weaknesses?",
              "Tell me about a challenging situation you faced at work.",
              "Where do you see yourself in 5 years?"
            ]
          }
        };
      }
    },
    createMockInterviewSetup: async (mockInterviewId, setupData) => {
      try {
        const response = await interviewApi.post('/interviews/mock-interview-setup', { 
          mockInterviewId,
          setupData
        });
        return response;
      } catch (error) {
        console.log('Error setting up mock interview, using fallback', error);
        return {
          data: {
            success: true
          }
        };
      }
    },
    getPremiumFeedback: async (data) => {
      try {
        const response = await interviewApi.post('/interviews/premium-feedback', data);
        return response;
      } catch (error) {
        console.log('Error getting premium feedback, using fallback', error);
        // Fallback premium feedback
        return {
          data: {
            starRating: Math.floor(Math.random() * 5) + 1,
            confidenceScore: Math.floor(Math.random() * 10) + 1,
            softSkills: "Your communication style is clear and professional. Consider using more confident language to convey authority.",
            starPattern: "Your answer includes some STAR elements but could be strengthened by clearly separating Situation, Task, Action, and Result sections.",
            suggestions: "Be more specific about measurable results. Replace phrases like 'I think' with more confident statements like 'I demonstrated' or 'I achieved'."
          }
        };
      }
    },
    saveFeedbackToDashboard: async (data) => {
      try {
        const response = await interviewApi.post('/interviews/save-feedback', data);
        return response;
      } catch (error) {
        console.log('Error saving feedback, using fallback', error);
        return {
          data: {
            success: true
          }
        };
      }
    }
  },

  // Add AI recommendation endpoint
  chat: {
    getRecommendation: async (prompt) => {
      try {
        // Try to use the real API first, with a specially configured request to avoid CORS issues
        const response = await axios({
          method: 'post',
          url: `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/chat/ai/recommendation`, 
          data: { prompt },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
            // Explicitly NOT including Authorization header to avoid CORS preflight
          },
          withCredentials: false
        });
        return response;
      } catch (error) {
        console.log('Using mock data for AI recommendation', error);
        // Fall back to mock data
        return Promise.resolve({
          data: {
            recommendation: "Based on my analysis, I recommend highlighting your achievements with specific metrics. For example, instead of saying 'Improved team productivity', say 'Increased team productivity by 27% over 6 months by implementing agile methodologies and automating routine tasks'.",
            improvement_areas: ["Be more specific", "Use metrics", "Focus on outcomes"],
            model_used: "Mock AI Model"
          }
        });
      }
    }
  }
};

// Helper function for default mock questions
const defaultMockQuestions = (jobTitle, count = 5) => {
  const questions = [
    `Tell me about yourself and your background in ${jobTitle}.`,
    `Why are you interested in this role?`,
    `What are your greatest strengths and weaknesses?`,
    `Tell me about a challenging situation you faced at work.`,
    `Where do you see yourself in 5 years?`,
    `Describe a situation where you had to work under pressure.`,
    `How do you handle feedback?`,
    `What's your approach to working in a team?`
  ];
  
  return questions.slice(0, count);
};

export default apiEndpoints;