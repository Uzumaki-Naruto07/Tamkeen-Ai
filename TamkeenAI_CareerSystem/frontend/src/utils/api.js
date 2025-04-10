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

// Use CORS proxy in development mode
const useCorsProxy = import.meta.env.MODE === 'development';
const corsProxyUrl = 'http://localhost:8080/';

// Helper to get base URL with optional CORS proxy
const getBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  return useCorsProxy ? `${corsProxyUrl}${baseUrl}` : baseUrl;
};

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
    // Determine if we're in production mode
    const isProduction = import.meta.env.PROD;
    
    // Set up URL for the health check - make sure to use /api/health-check
    let healthCheckUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/health-check`;
    
    // In production, use the AllOrigins CORS proxy
    if (isProduction) {
      healthCheckUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(healthCheckUrl)}`;
    }
    
    // Try to hit the health check endpoint, with minimal headers to avoid CORS
    const response = await axios({
      method: 'get',
      url: healthCheckUrl,
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
    // Skip adding auth token for resume and ATS endpoints to avoid CORS issues
    const skipAuthForEndpoints = [
      '/resume/upload',
      '/ats/analyze',
      '/ats/analyze-with-deepseek',
      '/ats/analyze-with-openai',
      '/career/analyze-prediction',
      '/career/recommendations'
    ];
    
    const shouldSkipAuth = skipAuthForEndpoints.some(endpoint => 
      config.url.includes(endpoint)
    );
    
    if (!shouldSkipAuth) {
      // Add token to auth header - use X-Auth-Token
      config.headers['X-Auth-Token'] = token;
    } else {
      console.log('Skipping auth token for endpoint:', config.url);
    }
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
  
  // Add career recommendations endpoints
  career: {
    getCareerRecommendations: (data) => api.post('/career/recommendations', data),
    
    // New endpoint for combined Pymetrics-style and LLM career prediction
    analyzePrediction: async (assessmentData) => {
      try {
        console.log("Sending assessment data to DeepSeek for analysis", assessmentData);
        
        // Format the prompt for DeepSeek
        const prompt = `
          Based on the user's answers to a career assessment, predict the 3 most suitable career paths. Here are the user's details:
          - Personality: ${JSON.stringify(assessmentData.personality)}
          - Interests: ${JSON.stringify(assessmentData.interests)}
          - Work Values: ${JSON.stringify(assessmentData.values)}
          - Skills: ${JSON.stringify(assessmentData.skills)}
          
          Return a valid JSON object with the following structure:
          {
            "recommendedCareers": [
              {"title": "Career Name", "match": 98, "description": "Why it fits the user's profile"}
            ],
            "personalityType": "Personality label that describes the user",
            "explanation": "Brief analysis of the user's traits and why certain careers fit",
            "skillGaps": [
              {"skill": "Skill Name", "importance": "High/Medium/Low", "resources": ["Learning resource 1", "Learning resource 2"]}
            ]
          }
        `;
        
        const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || 'sk-or-v1-your-api-key';
        
        // Call DeepSeek through OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Tamkeen AI Career Assessment'
          },
          body: JSON.stringify({
            model: 'deepseek-chat', // Use DeepSeek model
            messages: [
              { role: 'system', content: 'You are a career advisor AI helping users find their ideal career path based on their assessment results.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.3, // Lower temperature for more focused responses
            max_tokens: 1500
          })
        });
        
        const data = await response.json();
        console.log("DeepSeek response:", data);
        
        // Parse the completion from DeepSeek
        let result;
        try {
          // Extract the generated text from the response
          const generatedText = data.choices[0].message.content;
          
          // Try to locate and parse JSON in the response
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No valid JSON found in response");
          }
        } catch (parseError) {
          console.error("Error parsing DeepSeek response:", parseError);
          
          // Fallback with mock data if parsing fails
          result = {
            recommendedCareers: [
              { 
                title: 'Data Scientist', 
                titleAr: 'عالم بيانات',
                match: 95, 
                description: 'Your analytical abilities and interest in patterns suggest data science would be an excellent fit.',
                descriptionAr: 'تشير قدراتك التحليلية واهتمامك بالأنماط إلى أن علم البيانات سيكون مناسبًا بشكل ممتاز.',
                skills: [
                  { name: 'Data Analysis', nameAr: 'تحليل البيانات' },
                  { name: 'Python', nameAr: 'بايثون' },
                  { name: 'Machine Learning', nameAr: 'تعلم الآلة' },
                  { name: 'Statistics', nameAr: 'الإحصاء' }
                ],
                growthTrack: 'High growth field',
                growthTrackAr: 'مجال نمو مرتفع',
                education: 'Bachelor\'s in Computer Science or related field',
                educationAr: 'بكالوريوس في علوم الحاسوب أو مجال ذي صلة',
                demand: 'Very High',
                demandAr: 'مرتفع جدًا'
              },
              { 
                title: 'AI Engineer', 
                titleAr: 'مهندس ذكاء اصطناعي',
                match: 92, 
                description: 'Your technical aptitude and problem-solving align well with AI engineering.',
                descriptionAr: 'تتوافق قدراتك التقنية ومهارات حل المشكلات بشكل جيد مع هندسة الذكاء الاصطناعي.',
                skills: [
                  { name: 'Deep Learning', nameAr: 'التعلم العميق' },
                  { name: 'TensorFlow', nameAr: 'تنسرفلو' },
                  { name: 'Python', nameAr: 'بايثون' },
                  { name: 'Neural Networks', nameAr: 'الشبكات العصبية' }
                ],
                growthTrack: 'Emerging field',
                growthTrackAr: 'مجال ناشئ',
                education: 'Master\'s degree preferred',
                educationAr: 'يفضل درجة الماجستير',
                demand: 'High',
                demandAr: 'مرتفع'
              },
              { 
                title: 'UX Researcher', 
                titleAr: 'باحث تجربة المستخدم',
                match: 88, 
                description: 'Your combination of analytical skills and social understanding would make you excellent at researching user needs.',
                descriptionAr: 'سيجعلك مزيج مهاراتك التحليلية والفهم الاجتماعي ممتازًا في البحث عن احتياجات المستخدم.',
                skills: [
                  { name: 'User Testing', nameAr: 'اختبار المستخدم' },
                  { name: 'Interviews', nameAr: 'المقابلات' },
                  { name: 'Data Analysis', nameAr: 'تحليل البيانات' },
                  { name: 'Prototyping', nameAr: 'النمذجة' }
                ],
                growthTrack: 'Steady growth',
                growthTrackAr: 'نمو ثابت',
                education: 'Bachelor\'s in Psychology, HCI, or related field',
                educationAr: 'بكالوريوس في علم النفس، تفاعل الإنسان والحاسوب، أو مجال ذي صلة',
                demand: 'Medium',
                demandAr: 'متوسط'
              }
            ],
            personalityType: "Analytical Problem-Solver",
            explanation: "Your assessment reveals strong analytical abilities paired with openness to new ideas. You enjoy solving complex problems and have excellent technical aptitude.",
            skillGaps: [
              { skill: "Machine Learning", importance: "High", resources: ["Deep Learning Specialization", "TensorFlow Certification"] },
              { skill: "Data Visualization", importance: "Medium", resources: ["Tableau Fundamentals", "D3.js Course"] }
            ]
          };
        }
        
        // Save to all separate localStorage fields for easy access
        localStorage.setItem("tamkeenCareerAssessment", JSON.stringify({
          assessment: assessmentData,
          results: result
        }));
        localStorage.setItem("tamkeenPersonality", JSON.stringify({
          type: result.personalityType,
          explanation: result.explanation
        }));
        localStorage.setItem("tamkeenSkills", JSON.stringify({
          current: assessmentData.skills,
          gaps: result.skillGaps
        }));
        localStorage.setItem("tamkeenCareerMatch", JSON.stringify(result.recommendedCareers));
        
        return { data: result };
      } catch (error) {
        console.error("Error calling DeepSeek API:", error);
        throw error;
      }
    },
  },
  
  // Add user endpoint methods
  user: {
    ...profileApi,
    getSavedLearningPaths: async (userId) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/user/${userId}/learning-paths`);
        return response;
      } catch (error) {
        console.log('Using mock data for saved learning paths', error);
        return Promise.resolve({
          data: []
        });
      }
    }
  },
  
  // Add documents endpoint methods
  documents: {
    getResume: async (resumeId) => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/resume/${resumeId}`);
        return response;
      } catch (error) {
        console.log('Using mock data for resume', error);
        return Promise.resolve({
          data: {
            id: resumeId,
            skills: ["JavaScript", "React", "Node.js", "CSS", "HTML"]
          }
        });
      }
    }
  },
  
  // Add interview coach endpoints
  interviews: {
    createOrLoadConversation: async (userId) => {
      console.log('Attempting to load conversation for user', userId);
      try {
        // Try direct connection first
        const response = await axios.post(
          `${getBaseUrl()}/api/interviews/conversation`, 
          { userId },
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          }
        );
        return response;
      } catch (error) {
        console.error('Error creating conversation:', error);
        
        // If CORS error or connection error, try DeepSeek direct
        if (error.message.includes('Network Error') || error.message.includes('CORS')) {
          console.log('Using fallback for conversation creation');
          // Return fallback conversation data
          return {
            data: {
              conversationId: `local-${Date.now()}`,
              messages: []
            }
          };
        }
        throw error;
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
      console.log('API sendMessage received:', JSON.stringify(message));
      
      // If in offline or development mode, use fallback
      if (!conversationId || conversationId.startsWith('local-') || import.meta.env.MODE === 'development') {
        console.log('Sending message to API:', JSON.stringify(message));
        
        try {
          // First attempt to call the backend API
          const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/interviews/message`, {
            conversationId,
            message,
            useOpenAI: true
          });
          return response;
        } catch (apiError) {
          // If DeepSeek is requested, use a fallback response
          if (message.useDeepSeek || message.model === 'deepseek') {
            console.log('OpenAI request failed, falling back to DeepSeek', apiError);
            
            // Create a mock DeepSeek response
            return {
              data: {
                message: handleDeepSeekFallback(message.message, message.mode),
                source: 'fallback',
                model: 'DeepSeek-AI (Offline)'
              },
              status: 200,
              statusText: 'OK (Fallback)',
              headers: {}
            };
          } else {
            // Standard fallback for other models
            console.log('Error sending message, using fallback', apiError);
            
            return {
              data: {
                message: getCoachFallbackResponse(message.message, message.mode),
                source: 'fallback',
                model: message.model === 'llama3' ? 'LLaMA-3 (Offline)' : 'AI Assistant (Offline)'
              },
              status: 200,
              statusText: 'OK (Fallback)',
              headers: {}
            };
          }
        }
      } else {
        // Regular API call for production with real conversation ID
        console.log('Sending message to API:', JSON.stringify(message));
        return axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/interviews/message`, {
          conversationId,
          message,
          useOpenAI: true
        });
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
        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/interviews/conversation/new`, { userId });
        return response;
      } catch (error) {
        console.error('Error creating new conversation, using fallback', error);
        // Return a fallback conversation
        return {
          data: {
            conversationId: `local-${Date.now()}`,
            userId: userId || '0',
            createdAt: new Date().toISOString(),
            messages: []
          },
          status: 200,
          statusText: 'OK (Fallback)',
          headers: {}
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
    },
    forceDeepSeekCall: async (message, systemInstruction, isInterviewMode) => {
      console.log('Making direct DeepSeek call via backend');
      try {
        // Create request data object
        const requestData = {
          message,
          systemInstruction,
          mode: isInterviewMode ? 'interview_coach' : 'ai_assistant',
          force_real_api: true  // This signals to use actual DeepSeek API
        };
        
        console.log('DeepSeek request data:', JSON.stringify(requestData));
        
        // Call the backend's deepseek direct endpoint
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/interviews/deepseek-direct`, 
          requestData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000  // Longer timeout for DeepSeek calls (30 seconds)
          }
        );
        
        return response;
      } catch (error) {
        console.error('Error making direct DeepSeek call via backend:', error);
        throw error;
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

// Add this new function to handle DeepSeek API calls with proper error handling
const withErrorHandling = async (apiCall, fallbackData) => {
  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    console.error('API call failed:', error.message || 'Unknown error');
    // Return fallback data with proper structure
    return { 
      data: typeof fallbackData === 'function' ? fallbackData() : fallbackData,
      status: 200,
      statusText: 'OK (Fallback)',
      error: error.message || 'API connection error'
    };
  }
};

// Helper function to generate realistic DeepSeek fallback responses
const handleDeepSeekFallback = (userMessage, mode) => {
  // Simple keyword matching for more realistic responses
  const message = userMessage.toLowerCase();
  
  // Check if this is a greeting
  if (message.match(/hi|hello|hey|greetings|good morning|good afternoon|good evening|salam|salaam|assalam/i)) {
    return "Hello! I'm your AI Assistant powered by DeepSeek. I'm currently operating in offline mode, but I'll do my best to help you. What can I assist you with today?";
  }
  
  // Check if asking about capabilities
  if (message.match(/what can you do|your capabilities|help me with|assist me|your features/i)) {
    return "As an AI assistant, I can help with information, answer questions, provide explanations, assist with creative tasks, and much more. However, in offline mode my capabilities are somewhat limited. What specific area would you like assistance with?";
  }
  
  // Check if question is about careers/jobs
  if (message.match(/job|career|resume|interview|cv|cover letter|application/i)) {
    return "Career development is an important topic. I'd typically offer advice on resume building, interview preparation, and career planning based on your specific situation. However, I'm currently in offline mode with limited access to my knowledge base. Could you try again when online connectivity is restored?";
  }
  
  // Default response for AI mode
  return "I apologize, but I'm currently having trouble connecting to my full knowledge base. I'm operating in offline mode with limited capabilities. Please try again later when connection is restored, or ask me a different question I might be able to help with.";
};

// Helper function to get coach fallback responses
const getCoachFallbackResponse = (userMessage, mode) => {
  // Only for interview coach mode
  if (mode !== 'interview_coach') {
    return "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";
  }
  
  const message = userMessage.toLowerCase();
  
  // Interview related fallbacks
  const interviewResponses = [
    "When preparing for an interview, it's essential to research the company thoroughly. Understanding their values, products, and culture will help you tailor your responses.",
    "For behavioral questions, I recommend using the STAR method: Situation, Task, Action, and Result. This structure helps you provide complete, concise answers.",
    "Confidence is key in interviews. Practice your responses aloud, maintain good posture, and remember to speak clearly and at a moderate pace.",
    "Prepare thoughtful questions to ask the interviewer. This demonstrates your interest and helps you determine if the role is a good fit for you.",
    "When discussing weaknesses, show self-awareness and focus on what you're doing to improve. This demonstrates growth mindset and professionalism."
  ];
  
  // If asking about technical interviews
  if (message.match(/technical|coding|programming|software|developer|engineer/i)) {
    return "In technical interviews, focus on demonstrating your problem-solving process rather than rushing to a solution. Think aloud, ask clarifying questions, and explain your approach step by step.";
  }
  
  // If asking about salary negotiation
  if (message.match(/salary|compensation|negotiate|offer|package|benefits/i)) {
    return "When negotiating salary, research industry standards for your role and location. Emphasize your value with specific achievements, and consider the entire compensation package including benefits and growth opportunities.";
  }
  
  // Default response for interview coach mode
  return interviewResponses[Math.floor(Math.random() * interviewResponses.length)];
};

export default apiEndpoints;