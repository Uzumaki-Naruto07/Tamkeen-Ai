/**
 * API Integration for TamkeenAI Career System
 * Provides functions to interact with the backend API
 */
import axios from 'axios';
import withMockFallback, { isBackendUnavailable } from '../utils/mockFallback';
import * as endpoints from './endpoints';
import { JOB_ENDPOINTS } from './endpoints';
import { jobEndpoints } from '../utils/endpoints';

// Environment detection
const isDevelopment = import.meta.env.DEV;
const useMockData = isDevelopment || import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Track pending login requests to prevent duplicates
let pendingLoginRequest = null;

// Configuration
const MOCK_ENABLED = process.env.NODE_ENV === 'development';

// Direct backend URLs
const MAIN_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const INTERVIEW_API_URL = import.meta.env.VITE_INTERVIEW_API_URL || 'http://localhost:5002';
const UPLOAD_API_URL = import.meta.env.VITE_UPLOAD_SERVER_URL || 'http://localhost:5004';

// CORS proxy configuration
// Use a more reliable CORS proxy - Netlify function if available, or fallback to allorigins
const NETLIFY_FUNCTION_URL = '/.netlify/functions/cors-proxy';
const CORS_PROXY_URL = isDevelopment 
  ? 'https://api.allorigins.win/raw?url=' 
  : NETLIFY_FUNCTION_URL;

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: isDevelopment 
    ? '/api' // This will use the Vite proxy defined in vite.config.js
    : `${MAIN_API_URL}`, // Use direct API URL from .env.production
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable withCredentials for cross-domain cookie support
});

// Mock data for development mode
const mockUsers = [
  {
    id: '1',
    email: 'admin@tamkeen.ai',
    password: 'password',
    name: 'Admin User',
    roles: ['admin', 'user'],
    preferences: { language: 'en', theme: 'light' }
  },
  {
    id: '2',
    email: 'user@tamkeen.ai',
    password: 'password',
    name: 'Regular User',
    roles: ['user'],
    preferences: { language: 'en', theme: 'light' }
  }
];

// Mock authentication function for development
const mockLogin = (credentials) => {
  // If there's already a pending login request, return it
  if (pendingLoginRequest) {
    return pendingLoginRequest;
  }
  
  pendingLoginRequest = new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === credentials.email);
      
      if (user && (credentials.password === user.password || credentials.password === 'password')) {
        const token = `mock-token-${user.id}-${Date.now()}`;
        
        const response = {
          data: {
            data: {
              token,
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: user.roles,
                preferences: user.preferences
              }
            },
            message: 'Login successful',
            success: true
          }
        };
        
        // Clear the pending request
        pendingLoginRequest = null;
        resolve(response);
      } else {
        // Clear the pending request
        pendingLoginRequest = null;
        reject({
          response: {
            data: {
              message: 'Invalid email or password',
              success: false
            }
          },
          message: 'Invalid email or password'
        });
      }
    }, 500); // Simulate network delay
  });
  
  return pendingLoginRequest;
};

// Request interceptor for adding the auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Debug logging
    console.log(`Making API request to: ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject({
      message: 'Network error. Please check your connection.',
      originalError: error
    });
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Create a standardized error object
    let errorObj = {
      message: 'An unexpected error occurred',
      status: error?.response?.status || 0,
      originalError: error
    };

    if (error.response) {
      // The request was made and the server responded with an error status
      errorObj.message = error.response.data?.message || `Server error: ${error.response.status}`;
      errorObj.data = error.response.data;
      
      // Handle authentication errors
      if (error.response.status === 401) {
        // Clear pendingLoginRequest to allow new login attempts
        pendingLoginRequest = null;
        // Clear token if unauthorized
        localStorage.removeItem('token');
        errorObj.message = 'Authentication failed. Please log in again.';
      }
      
      // Handle server errors with mock data in development
      if (error.response.status >= 500 && isDevelopment) {
        console.warn('Development mode - Server error detected, using mock fallbacks');
        return Promise.resolve({ 
          data: { 
            success: true, 
            data: {}, 
            message: 'Mock data response (server error fallback)' 
          } 
        });
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorObj.message = 'No response from server. Please try again later.';
      
      // In development mode, handle CORS errors more gracefully
      if (isDevelopment && error.message && (
        error.message.includes('Network Error') || 
        error.message.includes('ECONNREFUSED')
      )) {
        console.warn('Development mode - Network error detected, using mock fallbacks');
        // Let the function handle mock fallbacks
        if (useMockData) {
          return Promise.resolve({ 
            data: { 
              success: true, 
              data: {}, 
              message: 'Mock data response (dev mode)' 
            } 
          });
        }
      }
    }

    console.error('API Error:', errorObj.message, error);
    return Promise.reject(errorObj);
  }
);

// General API request functions with mock support for development
export const api = {
  get: async (url, params = {}) => {
    if (process.env.NODE_ENV === 'development' || MOCK_ENABLED) {
      console.log(`Using API Client GET: ${url}`);
      
      try {
        // Handle dashboard data endpoint
        if (url.includes('dashboard/data') || url.includes('dashboard/')) {
          console.log('Using mock data for dashboard endpoint:', url);
          await simulateNetworkDelay();
          // Import dashboard data dynamically to avoid circular imports
          const mockDashboardData = await import('../utils/mockData/dashboardData').then(
            module => module.default
          ).catch(err => {
            console.error('Error importing mock dashboard data:', err);
            return {};
          });
          
          return {
            data: {
              success: true,
              data: mockDashboardData,
              message: 'Mock dashboard data loaded'
            }
          };
        }
        
        // Check if this is a resume-related endpoint
        if (url.includes('/resume/')) {
          console.log('Using mock data for resume endpoint:', url);
          await simulateNetworkDelay();
          return getMockResumeData(url, params);
        }
        
        // Handle CHATGPT endpoints
        if (url.includes('/chatgpt/')) {
          console.log('Using mock data for ChatGPT endpoint:', url);
          await simulateNetworkDelay();
          return getMockAIResponse(url, params);
        }
        
        // Handle learning endpoints
        if (url.includes('/learning/')) {
          console.log('Using mock data for learning endpoint:', url);
          await simulateNetworkDelay();
          return getMockLearningData(url);
        }
        
        // Handle job endpoints
        if (url.includes('/job/')) {
          console.log('Using mock data for job endpoint:', url);
          await simulateNetworkDelay();
          return getMockJobData(url, params);
        }
        
        // Handle jobs endpoints (plural form)
        if (url.includes('/jobs/')) {
          console.log('Using mock data for jobs endpoint:', url);
          await simulateNetworkDelay();
          return getMockJobData(url, params);
        }
        
        // Handle profile endpoint
        if (url.includes('/profile/')) {
          console.log('Using mock data for profile endpoint');
          await simulateNetworkDelay();
          return getMockProfileData(url);
        }
        
        // Handle assessment endpoint
        if (url.includes('/assessment/')) {
          console.log('Using mock data for assessment endpoint');
          await simulateNetworkDelay();
          return getMockAssessmentData(url);
        }
        
        // Handle user endpoints
        if (url.includes('/user/')) {
          console.log('Using mock data for user endpoint:', url);
          await simulateNetworkDelay();
          return getMockUserData(url);
        }
        
        // If we get here, try the real API
        const response = await apiClient.get(url, { params });
        return response.data;
    } catch (error) {
        console.error(`API GET error for ${url}:`, error);
        
        // Handle dashboard/data endpoint fallback
        if (url.includes('dashboard/data') || url.includes('dashboard/')) {
          console.log('Falling back to mock data for dashboard endpoint after failure:', url);
          await simulateNetworkDelay();
          // Import dashboard data dynamically to avoid circular imports
          const mockDashboardData = await import('../utils/mockData/dashboardData').then(
            module => module.default
          ).catch(err => {
            console.error('Error importing mock dashboard data:', err);
            return {};
          });
          
          return {
            data: {
              success: true,
              data: mockDashboardData,
              message: 'Mock dashboard data loaded (fallback)'
            }
          };
        }
        
        // If API fails, fall back to mock data based on the endpoint
        if (url.includes('/resume/')) {
          console.log('Falling back to mock data for resume endpoint after failure:', url);
          await simulateNetworkDelay();
          return getMockResumeData(url, params);
        }
        
        if (url.includes('/chatgpt/')) {
          console.log('Falling back to mock data for ChatGPT endpoint after failure:', url);
          await simulateNetworkDelay();
          return getMockAIResponse(url, params);
        }
        
        if (url.includes('/learning/')) {
          console.log('Falling back to mock data for learning endpoint after failure:', url);
          await simulateNetworkDelay();
          return getMockLearningData(url);
        }
        
        if (url.includes('/job/')) {
          console.log('Falling back to mock data for job endpoint after failure:', url);
          await simulateNetworkDelay();
          return getMockJobData(url, params);
        }
        
        if (url.includes('/jobs/')) {
          console.log('Falling back to mock data for jobs endpoint after failure:', url);
          await simulateNetworkDelay();
          return getMockJobData(url, params);
        }
        
        if (url.includes('/user/')) {
          console.log('Falling back to mock data for user endpoint after failure:', url);
          await simulateNetworkDelay();
          return getMockUserData(url);
        }
        
        if (url.includes('/profile/')) {
          console.log('Falling back to mock data for profile endpoint after failure:', url);
          await simulateNetworkDelay();
          return getMockProfileData(url);
        }
        
      throw error;
      }
    } else {
      const response = await apiClient.get(url, { params });
      return response.data;
    }
  },
  
  post: async (url, data = {}) => {
    if (process.env.NODE_ENV === 'development' || MOCK_ENABLED) {
      console.log(`Using API Client POST: ${url}`);
      
      try {
        // Handle authentication in dev mode
        if (url.includes('/auth/login')) {
          console.log('Using mock authentication');
          await simulateNetworkDelay();
      return mockLogin(data);
    }
        
        // Handle resume-related endpoints
        if (url.includes('/resume/')) {
          console.log('Using mock data for resume endpoint:', url);
          await simulateNetworkDelay();
          
          // For resume creation, return a new mock resume with the provided data
          if (url.includes('/resume/create')) {
            return {
              ...getMockResumeData('/resume/user/mock-user', {})[0],
              id: 'mock-resume-' + Math.floor(Math.random() * 1000),
              title: data.title || 'New Resume',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              sections: {
                ...getMockResumeData('/resume/user/mock-user', {})[0].sections,
                ...data.sections
              }
            };
          }
          
          // For resume analysis
          if (url.includes('/resume/analyze')) {
            return getMockResumeData(url, data);
          }
          
          return getMockResumeData(url, data);
        }
        
        // Handle ChatGPT endpoints
        if (url.includes('/chatgpt/')) {
          console.log('Using mock data for ChatGPT endpoint:', url);
          await simulateNetworkDelay();
          return getMockAIResponse(url, data);
        }
        
        // Handle learning endpoints
        if (url.includes('/learning/')) {
          console.log('Using mock data for learning endpoint:', url);
          await simulateNetworkDelay();
          return getMockLearningData(url, data);
        }
        
        // Handle job endpoints
        if (url.includes('/job/')) {
          console.log('Using mock data for job endpoint:', url);
          await simulateNetworkDelay();
          return getMockJobData(url, data);
        }
        
        // Handle profile endpoint
        if (url.includes('/profile/')) {
          console.log('Using mock data for profile endpoint');
          await simulateNetworkDelay();
          return getMockProfileData(url, data);
        }
        
        // Handle assessment endpoint
        if (url.includes('/assessment/')) {
          console.log('Using mock data for assessment endpoint');
          await simulateNetworkDelay();
          return getMockAssessmentData(url, data);
        }
        
        // If we get here, try the real API
        const response = await apiClient.post(url, data);
        return response.data;
      } catch (error) {
        console.error(`API POST error for ${url}:`, error);
        
        // If API fails, fall back to mock data based on the endpoint
        if (url.includes('/resume/')) {
          console.log('Falling back to mock data for resume endpoint after failure:', url);
          await simulateNetworkDelay();
          return getMockResumeData(url, data);
        }
        
        if (url.includes('/chatgpt/')) {
          console.log('Falling back to mock data for ChatGPT endpoint after failure:', url);
          await simulateNetworkDelay();
          return getMockAIResponse(url, data);
        }
        
        if (url.includes('/learning/')) {
          console.log('Falling back to mock data for learning endpoint after failure:', url);
          await simulateNetworkDelay();
          return getMockLearningData(url, data);
        }
        
        if (url.includes('/job/')) {
          console.log('Falling back to mock data for job endpoint after failure:', url);
          await simulateNetworkDelay();
          return getMockJobData(url, data);
        }
        
        throw error;
      }
    } else {
      const response = await apiClient.post(url, data);
      return response.data;
    }
  },
  
  put: async (url, data = {}) => {
    if (process.env.NODE_ENV === 'development' || MOCK_ENABLED) {
      console.log(`Using API Client PUT: ${url}`);
      
      try {
        // Handle resume-related endpoints
        if (url.includes('/resume/')) {
          console.log('Using mock data for resume endpoint:', url);
          await simulateNetworkDelay();
          
          // For resume updates, return a modified version of the mock resume
          if (url.includes('/resume/') && url.match(/\/\d+$/)) {
            const resumeId = url.split('/').pop();
            return {
              ...getMockResumeData(`/resume/${resumeId}`, {}),
              ...data,
              updatedAt: new Date().toISOString()
            };
          }
          
          return getMockResumeData(url, data);
        }
        
        // Handle profile endpoint
        if (url.includes('/profile/')) {
          console.log('Using mock data for profile endpoint');
          await simulateNetworkDelay();
          return getMockProfileData(url, data);
        }
        
        // If we get here, try the real API
        const response = await apiClient.put(url, data);
        return response.data;
      } catch (error) {
        console.error(`API PUT error for ${url}:`, error);
        
        // If API fails, fall back to mock data based on the endpoint
        if (url.includes('/resume/')) {
          console.log('Falling back to mock data for resume endpoint after failure:', url);
          await simulateNetworkDelay();
          return getMockResumeData(url, data);
        }
        
        throw error;
      }
    } else {
      const response = await apiClient.put(url, data);
      return response.data;
    }
  },
  
  delete: async (url) => {
    if (process.env.NODE_ENV === 'development' || MOCK_ENABLED) {
      console.log(`Using API Client DELETE: ${url}`);
      
      try {
        // Handle resume-related endpoints
        if (url.includes('/resume/')) {
          console.log('Using mock data for resume endpoint:', url);
          await simulateNetworkDelay();
          
          // For resume deletion, return a success response
          return {
            success: true,
            message: 'Resume deleted successfully'
          };
        }
        
        // If we get here, try the real API
        const response = await apiClient.delete(url);
        return response.data;
      } catch (error) {
        console.error(`API DELETE error for ${url}:`, error);
        
        // If API fails, fall back to mock success response
        if (url.includes('/resume/')) {
          console.log('Falling back to mock data for resume endpoint after failure:', url);
          await simulateNetworkDelay();
          return {
            success: true,
            message: 'Resume deleted successfully (mock data)'
          };
        }
        
        throw error;
      }
    } else {
      const response = await apiClient.delete(url);
      return response.data;
    }
  },
  
  upload: (url, formData) => apiClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  
  // Helper method to clear any pending login requests (for testing/debugging)
  clearPendingLogin: () => {
    pendingLoginRequest = null;
  }
};

/**
 * Generates mock AI responses for various chatgpt endpoints
 */
const getMockAIResponse = (url, data) => {
  // ChatGPT general message endpoint
  if (url.includes('/chatgpt/message')) {
    const message = data.message || data.query || "How can I improve my resume?";
    return {
      data: {
        data: {
          response: `Here's a helpful response to: "${message.substring(0, 30)}..." 
            
Make sure your resume is tailored to each job application. Highlight relevant skills and quantify your achievements with numbers when possible. Use action verbs and keep the format clean and professional.`,
          timestamp: new Date().toISOString()
        }
      }
    };
  }
  
  // Resume improvement endpoint
  if (url.includes('/resume/improve')) {
    return {
      data: {
        data: {
          suggestions: {
            general: [
              "Tailor your resume to the specific job description",
              "Quantify your achievements with numbers when possible",
              "Use strong action verbs to start your bullet points"
            ],
            structure: [
              "Use a clean, professional layout",
              "Keep your resume to 1-2 pages maximum",
              "Use consistent formatting throughout"
            ],
            skills: [
              "Highlight both technical and soft skills",
              "Match your skills to those mentioned in the job description",
              "Include skill proficiency levels where appropriate"
            ]
          },
          raw_suggestions: "Make sure your resume is tailored to the specific job. Use quantifiable achievements and strong action verbs. Keep a clean, professional layout with consistent formatting.",
          timestamp: new Date().toISOString()
        }
      }
    };
  }
  
  // Cover letter generation endpoint
  if (url.includes('/cover-letter/generate')) {
    const jobTitle = data.job_description || "the position";
    const company = data.company_name || "your company";
    
    return {
      data: {
        data: {
          cover_letter: `Dear Hiring Manager,\n\nI am writing to express my interest in ${jobTitle} at ${company}. With my background in relevant fields, I believe I would be a valuable addition to your team.\n\nThank you for considering my application.\n\nSincerely,\nApplicant`,
          sections: {
            introduction: `I am writing to express my interest in ${jobTitle} at ${company}.`,
            body: "With my background in relevant fields, I believe I would be a valuable addition to your team.",
            conclusion: "Thank you for considering my application."
          },
          timestamp: new Date().toISOString()
        }
      }
    };
  }
  
  // Interview questions endpoint
  if (url.includes('/interview/questions')) {
    const jobTitle = data.job_title || "the position";
    const difficulty = data.difficulty || "medium";
    const count = data.count || 5;
    
    const mockQuestions = [
      {
        id: 1,
        question: "Can you describe your experience with your primary technical skill?",
        type: "technical",
        difficulty: difficulty
      },
      {
        id: 2,
        question: "How do you handle challenging situations or conflicts at work?",
        type: "behavioral",
        difficulty: difficulty
      },
      {
        id: 3,
        question: "Tell me about a project you worked on that you're particularly proud of.",
        type: "behavioral",
        difficulty: difficulty
      },
      {
        id: 4,
        question: `What are your strengths and weaknesses as a ${jobTitle}?`,
        type: "general",
        difficulty: difficulty
      },
      {
        id: 5,
        question: "Where do you see yourself in five years?",
        type: "general",
        difficulty: difficulty
      }
    ];
    
    return {
      data: {
        data: {
          questions: mockQuestions.slice(0, count),
          job_title: jobTitle,
          timestamp: new Date().toISOString()
        }
      }
    };
  }
  
  // Interview feedback endpoint
  if (url.includes('/interview/feedback')) {
    return {
      data: {
        data: {
          overall_rating: 3.5,
          strengths: [
            "You provided a clear answer to the question",
            "You included specific examples which is good"
          ],
          areas_for_improvement: [
            "Consider structuring your answer using the STAR method (Situation, Task, Action, Result)",
            "Be more concise and focused in your response"
          ],
          alternative_answer: "A more structured answer might be: \"In my previous role at [Company], I encountered a similar situation where [brief description]. I was responsible for [your task]. I approached this by [your actions]. As a result, [positive outcome].\"",
          timestamp: new Date().toISOString()
        }
      }
    };
  }
  
  // Default fallback for any other chatgpt endpoint
  return {
    data: {
      data: {
        response: "This is a mock response for AI/ChatGPT endpoint. The backend API might be unavailable.",
        timestamp: new Date().toISOString()
      }
    }
  };
};

/**
 * Generate mock resume analysis data
 */
const getMockResumeAnalysis = (data) => {
  return {
    score: 75,
    feedback: {
      strengths: [
        "Good educational background",
        "Relevant work experience",
        "Technical skills section is comprehensive"
      ],
      weaknesses: [
        "Missing quantifiable achievements",
        "Some vague statements could be more specific",
        "Could improve formatting consistency"
      ]
    },
    suggested_improvements: [
      "Add metrics to demonstrate impact (e.g., increased revenue by 15%)",
      "Tailor skills section to match job requirements",
      "Use consistent bullet point format throughout"
    ],
    keyword_analysis: {
      missing_keywords: ["project management", "team leadership", "agile methodology"],
      matching_keywords: ["software development", "JavaScript", "React"]
    },
    timestamp: new Date().toISOString()
  };
};

// Mock skills assessment data
const mockSkillsAssessment = {
  overall_score: 82,
  skill_breakdown: [
    { name: "JavaScript", score: 85, level: "Advanced" },
    { name: "React", score: 80, level: "Intermediate" },
    { name: "Node.js", score: 75, level: "Intermediate" },
    { name: "Python", score: 90, level: "Advanced" },
    { name: "SQL", score: 65, level: "Basic" }
  ],
  recommendations: [
    "Consider strengthening your SQL skills through additional projects",
    "Your JavaScript knowledge is strong - consider exploring TypeScript",
    "Look into advanced React patterns and performance optimization"
  ],
  learning_resources: [
    { name: "Advanced SQL Course", url: "https://example.com/sql-course", type: "course" },
    { name: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/", type: "documentation" },
    { name: "React Performance Optimization", url: "https://example.com/react-performance", type: "article" }
  ],
  timestamp: new Date().toISOString()
};

// Add mock dashboard data
const mockDashboardData = {
  progress: {
    overall: 65,
    resume: 80,
    skills: 70,
    applications: 50,
    interviews: 60,
    networking: 55,
    goals: [
      { id: 1, name: 'Complete profile', progress: 100, completed: "true", unlocked: "true" },
      { id: 2, name: 'Apply to 5 jobs', progress: 60, completed: "false", unlocked: "true" },
      { id: 3, name: 'Update resume', progress: 80, completed: "false", unlocked: "true" }
    ],
    nextSteps: ['Update LinkedIn profile', 'Practice interview skills']
  },
  // Add other required mock data for components
  resumeScore: {
    overall: 75,
    sections: {
      content: 80,
      format: 75,
      keywords: 70,
      impact: 65
    },
    scores: [
      { name: 'Content', value: 80 },
      { name: 'Format', value: 75 },
      { name: 'Keywords', value: 70 },
      { name: 'Impact', value: 65 }
    ]
  },
  // ... add more mock data as needed ...
};

// Add new API functions for skills assessment
const skills = {
  // ... existing functions ...
  
  // Generate AI-powered assessment questions
  generateAIQuestions: async (categoryId, userId, difficulty = 'medium') => {
    console.log(`[API] Generating AI questions for category ${categoryId}`);
    
    try {
      const response = await axios.post(apiEndpoints.ASSESSMENT.GENERATE_AI_QUESTIONS, {
        categoryId,
        userId,
        difficulty,
        timestamp: new Date().toISOString()
      });
      
      return response;
    } catch (error) {
      console.error('Error generating AI questions:', error);
      
      // Fallback to mock questions if API fails
      return {
        data: generateMockQuestionsForCategory(categoryId, difficulty)
      };
    }
  },
  
  // Get assessment questions with adaptive difficulty support
  getAssessmentQuestions: async (categoryId, options = {}) => {
    console.log(`[API] Getting assessment questions for category ${categoryId}`);
    const { difficulty, adaptiveMode, userLevel, previousAssessments } = options;
    
    try {
      const response = await axios.get(
        `${apiEndpoints.ASSESSMENT.GET_QUESTIONS}/${categoryId}`,
        {
          params: {
            difficulty,
            adaptiveMode: adaptiveMode ? 'true' : 'false',
            userLevel,
            previousAssessments: JSON.stringify(previousAssessments || [])
          }
        }
      );
      
      return response;
    } catch (error) {
      console.error('Error fetching assessment questions:', error);
      
      // Fallback to mock questions
      return {
        data: generateMockQuestionsForCategory(categoryId, difficulty)
      };
    }
  },
  
  // Submit assessment with support for adaptive difficulty
  submitAssessment: async (assessmentData) => {
    console.log(`[API] Submitting assessment for category ${assessmentData.categoryId}`);
    
    try {
      const response = await axios.post(
        apiEndpoints.ASSESSMENT.SUBMIT_ANSWERS(assessmentData.categoryId),
        assessmentData
      );
      
      return response;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      
      // Generate mock results if API fails
      return {
        data: generateMockAssessmentResults(assessmentData)
      };
    }
  },
  
  // Get skill insights based on assessment results
  getSkillInsights: async (insightRequest) => {
    console.log(`[API] Getting skill insights for user ${insightRequest.userId}`);
    
    try {
      const response = await axios.post(
        apiEndpoints.ASSESSMENT.GET_SKILL_INSIGHTS,
        insightRequest
      );
      
      return response;
    } catch (error) {
      console.error('Error fetching skill insights:', error);
      
      // Generate mock insights
      return {
        data: generateMockSkillInsights(insightRequest)
      };
    }
  },
  
  // Get skill growth forecast
  getSkillForecast: async (userId, skillCategory) => {
    console.log(`[API] Getting skill forecast for ${skillCategory}`);
    
    try {
      const response = await axios.get(
        apiEndpoints.ASSESSMENT.GET_SKILL_FORECAST,
        {
          params: {
            userId,
            skillCategory
          }
        }
      );
      
      return response;
    } catch (error) {
      console.error('Error fetching skill forecast:', error);
      
      // Generate mock forecast
      return {
        data: generateMockSkillForecast(skillCategory)
      };
    }
  }
};

// Add AI-related functions to assessments
const assessments = {
  // ... existing functions ...
  
  // Detect emotion from image
  detectEmotion: async (imageData) => {
    console.log('[API] Detecting emotion');
    
    try {
      const response = await axios.post(
        apiEndpoints.ASSESSMENT.DETECT_EMOTION,
        imageData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response;
    } catch (error) {
      console.error('Error detecting emotion:', error);
      
      // Generate mock emotion detection
      const emotions = ['neutral', 'happy', 'sad', 'stressed', 'anxious'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      
      return {
        data: {
          emotion: randomEmotion,
          confidence: Math.floor(Math.random() * 30) + 70 // 70-100%
        }
      };
    }
  },
  
  // Update adaptive difficulty settings
  updateAdaptiveDifficulty: async (userId, difficultyData) => {
    console.log(`[API] Updating adaptive difficulty for user ${userId}`);
    
    try {
      const response = await axios.post(
        apiEndpoints.ASSESSMENT.ADAPTIVE_DIFFICULTY,
        {
          userId,
          ...difficultyData
        }
      );
      
      return response;
    } catch (error) {
      console.error('Error updating adaptive difficulty:', error);
      
      // Mock response
      return {
        data: {
          success: true,
          updatedDifficulty: difficultyData.newDifficulty || 'medium'
        }
      };
    }
  }
};

// Helper function to generate mock questions for a category
const generateMockQuestionsForCategory = (categoryId, difficulty = 'medium') => {
  const questions = [];
  const categories = {
    1: 'technical',
    2: 'data',
    3: 'soft_skills',
    4: 'leadership',
    5: 'design'
  };
  
  const categoryType = categories[categoryId] || 'general';
  
  // Generate 5-10 questions based on category and difficulty
  const questionCount = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 7 : 10;
  
  for (let i = 1; i <= questionCount; i++) {
    let question = {
      id: `${categoryType}-q${i}`,
      text: `Sample ${categoryType} question ${i} (${difficulty} difficulty)`,
      category: categoryType,
      difficulty,
      options: [
        { value: 'a', text: `Option A for question ${i}` },
        { value: 'b', text: `Option B for question ${i}` },
        { value: 'c', text: `Option C for question ${i}` },
        { value: 'd', text: `Option D for question ${i}` }
      ],
      correctAnswer: ['a', 'b', 'c', 'd'][Math.floor(Math.random() * 4)]
    };
    
    // Add more options for hard questions
    if (difficulty === 'hard') {
      question.options.push({ value: 'e', text: `Advanced option E for question ${i}` });
    }
    
    questions.push(question);
  }
  
  return questions;
};

// Helper function to generate mock assessment results
const generateMockAssessmentResults = (assessmentData) => {
  const { categoryId, responses } = assessmentData;
  
  // Calculate a mock score (70-100%)
  const score = Math.floor(Math.random() * 31) + 70;
  
  // Generate detailed feedback
  const strengths = [
    'Strong understanding of core concepts',
    'Good problem-solving approach',
    'Effective application of knowledge'
  ];
  
  const weaknesses = [
    'Could improve in advanced topics',
    'Some gaps in technical terminology',
    'Limited understanding of edge cases'
  ];
  
  // Select 1-2 random strengths and weaknesses
  const randomStrengths = strengths.sort(() => 0.5 - Math.random()).slice(0, Math.ceil(Math.random() * 2));
  const randomWeaknesses = weaknesses.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1);
  
  // Generate skill forecast
  const skillForecast = generateMockSkillForecast(`Category ${categoryId}`);
  
  return {
    id: `assessment-${Date.now()}`,
    categoryId,
    score,
    maxScore: 100,
    completedAt: new Date().toISOString(),
    feedbackDetails: {
      strengths: randomStrengths,
      weaknesses: randomWeaknesses,
      recommendations: [
        'Practice with more advanced examples',
        'Review the core terminology',
        'Apply concepts in real-world scenarios'
      ]
    },
    skillForecast
  };
};

// Helper function to generate mock skill insights
const generateMockSkillInsights = (insightRequest) => {
  const { skillCategory } = insightRequest;
  
  return {
    category: skillCategory,
    strengths: [
      'Good conceptual understanding',
      'Strong problem-solving ability'
    ],
    weaknesses: [
      'Limited practical application',
      'Gaps in advanced topics'
    ],
    recommendations: [
      {
        type: 'course',
        title: `Advanced ${skillCategory} Course`,
        provider: 'Udemy',
        url: 'https://www.udemy.com',
        duration: '20 hours'
      },
      {
        type: 'project',
        title: `${skillCategory} Practice Project`,
        description: 'Build a real-world application to apply your knowledge',
        difficulty: 'Intermediate',
        duration: '2 weeks'
      },
      {
        type: 'resource',
        title: `${skillCategory} Best Practices Guide`,
        url: 'https://example.com/guide',
        format: 'eBook'
      }
    ],
    projectedImprovement: {
      timeframe: '3 months',
      expectedGrowth: Math.floor(Math.random() * 20) + 20 // 20-40% improvement
    }
  };
};

// Helper function to generate mock skill forecast
const generateMockSkillForecast = (categoryName) => {
  const today = new Date();
  const forecast = {
    category: categoryName,
    currentLevel: Math.floor(Math.random() * 30) + 40, // 40-70%
    projections: [],
    milestones: []
  };
  
  // Generate 6-month forecast with monthly projections
  for (let i = 1; i <= 6; i++) {
    const futureDate = new Date(today);
    futureDate.setMonth(today.getMonth() + i);
    
    // Projected growth based on learning curve
    const projectedGrowth = Math.min(100, forecast.currentLevel + (15 * (1 - Math.exp(-0.3 * i))));
    
    forecast.projections.push({
      month: i,
      date: futureDate.toISOString().split('T')[0],
      projectedLevel: Math.round(projectedGrowth)
    });
    
    // Add milestone if significant improvement expected
    if (i % 2 === 0) { // Every other month
      forecast.milestones.push({
        date: futureDate.toISOString().split('T')[0],
        description: `Expected to reach ${Math.round(projectedGrowth)}% proficiency in ${categoryName}`,
        actions: [
          `Complete advanced ${categoryName} training`,
          `Apply skills in practical projects`
        ]
      });
    }
  }
  
  return forecast;
};

// Add the new API functions to the apiClient
Object.assign(apiClient, {
  skills,
  assessments
});

/**
 * Generate mock learning resources data for development and testing
 * @param {string} url - The API endpoint URL
 * @param {Object} data - Request data (for POST/PUT requests)
 * @returns {Object} - Mock learning resources data
 */
function getMockLearningData(url, data = null) {
  const timestamp = new Date().toISOString();
  
  // Mock learning resources
  const mockResources = [
    {
      id: 'resource-1',
      title: 'JavaScript Fundamentals',
      type: 'course',
      provider: 'Udemy',
      providerLogo: 'https://example.com/udemy-logo.png',
      url: 'https://www.udemy.com/course/javascript-fundamentals/',
      thumbnail: 'https://example.com/thumbnails/js-fundamentals.jpg',
      description: 'Master the basics of JavaScript programming with this comprehensive course. Learn variables, functions, objects, and more.',
      skillLevel: 'beginner',
      duration: '10 hours',
      cost: 'Paid',
      priceUSD: 19.99,
      rating: 4.7,
      reviewCount: 2345,
      enrollmentCount: 12500,
      createdAt: '2023-01-15T12:00:00.000Z',
      updatedAt: '2023-05-20T15:30:00.000Z',
      skills: ['JavaScript', 'Web Development', 'Frontend'],
      languages: ['English'],
      certificate: true,
      tags: ['programming', 'web development', 'javascript']
    },
    {
      id: 'resource-2',
      title: 'React.js for Beginners',
      type: 'video',
      provider: 'YouTube',
      providerLogo: 'https://example.com/youtube-logo.png',
      url: 'https://www.youtube.com/watch?v=example123',
      thumbnail: 'https://example.com/thumbnails/react-beginners.jpg',
      description: 'Start your journey with React.js in this beginner-friendly tutorial. Learn component-based architecture and state management.',
      skillLevel: 'beginner',
      duration: '2 hours',
      cost: 'Free',
      priceUSD: 0,
      rating: 4.8,
      reviewCount: 1756,
      viewCount: 250000,
      createdAt: '2023-03-10T09:00:00.000Z',
      updatedAt: '2023-03-10T09:00:00.000Z',
      skills: ['React', 'JavaScript', 'Frontend'],
      languages: ['English', 'Spanish'],
      certificate: false,
      tags: ['react', 'javascript', 'tutorial']
    },
    {
      id: 'resource-3',
      title: 'Advanced Python Programming',
      type: 'course',
      provider: 'Coursera',
      providerLogo: 'https://example.com/coursera-logo.png',
      url: 'https://www.coursera.org/learn/advanced-python',
      thumbnail: 'https://example.com/thumbnails/advanced-python.jpg',
      description: 'Take your Python skills to the next level with this advanced course. Learn decorators, generators, context managers, and more.',
      skillLevel: 'advanced',
      duration: '25 hours',
      cost: 'Paid',
      priceUSD: 49.99,
      rating: 4.6,
      reviewCount: 1890,
      enrollmentCount: 8750,
      createdAt: '2022-11-05T14:00:00.000Z',
      updatedAt: '2023-04-12T11:45:00.000Z',
      skills: ['Python', 'Programming', 'Backend'],
      languages: ['English'],
      certificate: true,
      tags: ['python', 'advanced', 'programming']
    },
    {
      id: 'resource-4',
      title: 'Data Science with Python',
      type: 'book',
      provider: 'O\'Reilly',
      providerLogo: 'https://example.com/oreilly-logo.png',
      url: 'https://www.oreilly.com/library/data-science-python',
      thumbnail: 'https://example.com/thumbnails/data-science-python.jpg',
      description: 'Comprehensive guide to data science using Python. Covers pandas, numpy, matplotlib, scikit-learn and more.',
      skillLevel: 'intermediate',
      duration: '15 hours',
      cost: 'Paid',
      priceUSD: 35.99,
      rating: 4.5,
      reviewCount: 1245,
      pageCount: 450,
      createdAt: '2022-09-20T10:00:00.000Z',
      updatedAt: '2023-02-15T16:20:00.000Z',
      skills: ['Python', 'Data Science', 'Machine Learning'],
      languages: ['English'],
      certificate: false,
      tags: ['data science', 'python', 'machine learning']
    },
    {
      id: 'resource-5',
      title: 'DevOps Essentials',
      type: 'course',
      provider: 'Pluralsight',
      providerLogo: 'https://example.com/pluralsight-logo.png',
      url: 'https://www.pluralsight.com/courses/devops-essentials',
      thumbnail: 'https://example.com/thumbnails/devops-essentials.jpg',
      description: 'Learn the fundamentals of DevOps methodologies, tools, and practices. Includes CI/CD, Docker, and Kubernetes.',
      skillLevel: 'intermediate',
      duration: '12 hours',
      cost: 'Paid',
      priceUSD: 29.99,
      rating: 4.4,
      reviewCount: 1020,
      enrollmentCount: 7500,
      createdAt: '2023-02-28T08:00:00.000Z',
      updatedAt: '2023-05-10T13:15:00.000Z',
      skills: ['DevOps', 'Docker', 'Kubernetes', 'CI/CD'],
      languages: ['English'],
      certificate: true,
      tags: ['devops', 'docker', 'kubernetes']
    }
  ];
  
  // Mock reviews for resources
  const mockReviews = [
    {
      id: 'review-1',
      resourceId: 'resource-1',
      userId: 'user-123',
      userName: 'Ahmed Ali',
      userAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      rating: 5,
      comment: 'Excellent course! Very clear explanations and practical examples.',
      createdAt: '2023-06-15T14:30:00.000Z',
      helpful: 24,
      totalVotes: 26
    },
    {
      id: 'review-2',
      resourceId: 'resource-1',
      userId: 'user-456',
      userName: 'Fatima Hassan',
      userAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
      rating: 4,
      comment: 'Good content, but some sections could be more detailed.',
      createdAt: '2023-05-22T09:45:00.000Z',
      helpful: 15,
      totalVotes: 18
    },
    {
      id: 'review-3',
      resourceId: 'resource-2',
      userId: 'user-789',
      userName: 'Omar Khan',
      userAvatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      rating: 5,
      comment: 'This video tutorial helped me understand React basics quickly!',
      createdAt: '2023-04-10T16:20:00.000Z',
      helpful: 42,
      totalVotes: 45
    }
  ];
  
  // Mock user progress data
  const mockProgress = {
    userId: 'user-123',
    resources: [
      {
        resourceId: 'resource-1',
        progressPercentage: 75,
        status: 'in-progress',
        startedAt: '2023-05-10T08:00:00.000Z',
        lastAccessedAt: '2023-06-18T10:30:00.000Z',
        completedSections: [1, 2, 3, 4, 5],
        totalSections: 8,
        notes: 'Remember to review closures in section 4'
      },
      {
        resourceId: 'resource-2',
        progressPercentage: 100,
        status: 'completed',
        startedAt: '2023-04-05T14:00:00.000Z',
        completedAt: '2023-04-06T11:30:00.000Z',
        completedSections: [1, 2],
        totalSections: 2,
        notes: 'Great introduction to React components'
      },
      {
        resourceId: 'resource-5',
        progressPercentage: 25,
        status: 'in-progress',
        startedAt: '2023-06-01T09:00:00.000Z',
        lastAccessedAt: '2023-06-10T16:45:00.000Z',
        completedSections: [1, 2],
        totalSections: 8,
        notes: 'Need to spend more time on Docker section'
      }
    ]
  };
  
  // Mock bookmarked resources
  const mockBookmarks = {
    userId: 'user-123',
    resources: [
      {
        resourceId: 'resource-1',
        addedAt: '2023-05-05T08:30:00.000Z'
      },
      {
        resourceId: 'resource-3',
        addedAt: '2023-06-10T14:15:00.000Z'
      },
      {
        resourceId: 'resource-4',
        addedAt: '2023-06-12T09:45:00.000Z'
      }
    ]
  };
  
  // Mock learning path
  const mockLearningPath = {
    id: 'path-1',
    userId: 'user-123',
    skillId: 'skill-javascript',
    title: 'JavaScript Mastery Path',
    description: 'A comprehensive learning path to master JavaScript from basics to advanced topics',
    difficulty: 'intermediate',
    estimatedHours: 60,
    milestones: [
      {
        id: 'milestone-1',
        title: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript',
        order: 1,
        resources: [
          {
            resourceId: 'resource-1',
            order: 1,
            type: 'primary'
          }
        ]
      },
      {
        id: 'milestone-2',
        title: 'Advanced JavaScript Concepts',
        description: 'Master closures, prototypes, and async programming',
        order: 2,
        resources: [
          {
            resourceId: 'resource-advanced-js',
            order: 1,
            type: 'primary'
          }
        ]
      },
      {
        id: 'milestone-3',
        title: 'Frontend Frameworks',
        description: 'Apply JavaScript knowledge in modern frameworks',
        order: 3,
        resources: [
          {
            resourceId: 'resource-2',
            order: 1,
            type: 'primary'
          }
        ]
      }
    ],
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  // Handle different learning endpoints
  if (url.includes('/learning/')) {
    // Get all learning resources with filters
    if (url.includes('/resources')) {
      // Handle resource details lookup by ID
      if (url.match(/\/resources\/[\w-]+$/)) {
        const resourceId = url.split('/').pop();
        const resource = mockResources.find(r => r.id === resourceId) || mockResources[0];
        return { data: resource, timestamp };
      }
      
      // Handle search
      if (url.includes('/search')) {
        const searchParam = new URL(`http://example.com${url}`).searchParams.get('q');
        // Perform simple search
        const results = searchParam ? 
          mockResources.filter(r => 
            r.title.toLowerCase().includes(searchParam.toLowerCase()) || 
            r.description.toLowerCase().includes(searchParam.toLowerCase()) ||
            r.skills.some(s => s.toLowerCase().includes(searchParam.toLowerCase()))
          ) : 
          mockResources;
        
        return { 
          data: results, 
          pagination: {
            total: results.length,
            page: 1,
            limit: results.length,
            totalPages: 1
          },
          timestamp 
        };
      }
      
      // Handle general resources listing (with pagination mock)
      return { 
        data: mockResources,
        pagination: {
          total: mockResources.length,
          page: 1,
          limit: mockResources.length,
          totalPages: 1
        },
        timestamp 
      };
    }
    
    // Get recommended resources for user
    if (url.includes('/recommendations/')) {
      // Sort resources by some recommendation logic (here just randomizing)
      const shuffledResources = [...mockResources].sort(() => 0.5 - Math.random());
      return { 
        data: shuffledResources.slice(0, 3),
        timestamp 
      };
    }
    
    // Get course categories
    if (url.includes('/courses')) {
      const categoryParam = new URL(`http://example.com${url}`).searchParams.get('category');
      let filteredCourses = mockResources.filter(r => r.type === 'course');
      
      if (categoryParam) {
        filteredCourses = filteredCourses.filter(c => 
          c.tags.some(t => t.toLowerCase() === categoryParam.toLowerCase())
        );
      }
      
      return { 
        data: filteredCourses,
        pagination: {
          total: filteredCourses.length,
          page: 1,
          limit: filteredCourses.length,
          totalPages: 1
        },
        timestamp 
      };
    }
    
    // Get user progress
    if (url.includes('/progress/')) {
      return { data: mockProgress, timestamp };
    }
    
    // Update progress
    if (url.includes('/progress/') && data) {
      return { 
        success: true, 
        message: 'Progress updated successfully',
        data: {
          userId: data.userId || 'user-123',
          resourceId: data.resourceId,
          progressPercentage: data.progressPercentage,
          status: data.status,
          lastAccessedAt: timestamp
        },
        timestamp
      };
    }
    
    // Get/manage bookmarks
    if (url.includes('/bookmark/')) {
      // Get bookmarks
      if (url.match(/\/bookmark\/[\w-]+$/) && !data) {
        return { data: mockBookmarks.resources, timestamp };
      }
      
      // Add bookmark
      if (data && data.resourceId) {
        return { 
          success: true, 
          message: 'Resource bookmarked successfully',
          data: {
            userId: data.userId || 'user-123',
            resourceId: data.resourceId,
            addedAt: timestamp
          },
          timestamp
        };
      }
      
      // Remove bookmark
      if (url.includes('/bookmark/') && url.split('/').length > 3) {
        return { 
          success: true, 
          message: 'Bookmark removed successfully',
          timestamp
        };
      }
    }
    
    // Handle reviews
    if (url.includes('/reviews')) {
      // Get reviews for a resource
      if (url.match(/\/reviews\/[\w-]+$/)) {
        const resourceId = url.split('/').pop();
        const resourceReviews = mockReviews.filter(r => r.resourceId === resourceId);
        
        return { 
          data: resourceReviews,
          pagination: {
            total: resourceReviews.length,
            page: 1,
            limit: resourceReviews.length,
            totalPages: 1
          },
          timestamp 
        };
      }
      
      // Submit a review
      if (data && data.resourceId && data.rating) {
        return { 
          success: true, 
          message: 'Review submitted successfully',
          data: {
            id: `review-${Date.now()}`,
            resourceId: data.resourceId,
            userId: data.userId || 'user-123',
            userName: 'Ahmed Ali',
            userAvatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            rating: data.rating,
            comment: data.comment || '',
            createdAt: timestamp,
            helpful: 0,
            totalVotes: 0
          },
          timestamp
        };
      }
    }
    
    // Generate learning path
    if (url.includes('/learning-path') && data) {
      return {
        success: true,
        message: 'Learning path generated successfully',
        data: {
          ...mockLearningPath,
          skillId: data.skillId,
          difficulty: data.difficulty,
          createdAt: timestamp,
          updatedAt: timestamp
        },
        timestamp
      };
    }
  }
  
  // Default fallback for learning
  return {
    message: 'Mock learning data for endpoint not specifically handled',
    endpoint: url,
    timestamp
  };
}

/**
 * Generate mock resume data for various endpoints
 */
const getMockResumeData = (url, params) => {
  // For get user resumes endpoint
  if (url.includes('/resume/user/')) {
    return [
      {
        id: 'mock-resume-1',
        title: 'Software Developer Resume',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        score: 85,
        sections: {
          profile: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '(123) 456-7890',
            location: 'San Francisco, CA',
            title: 'Senior Software Engineer'
          },
          summary: 'Experienced software engineer with 7+ years of experience in full-stack development, specializing in React, Node.js, and cloud architecture.',
          experience: [
            {
              id: 'exp-1',
              company: 'Tech Solutions Inc.',
              position: 'Senior Software Engineer',
              startDate: '2020-03',
              endDate: null,
              current: true,
              description: 'Leading development of microservices architecture for enterprise applications.',
              achievements: [
                'Reduced API response time by 40% through optimization',
                'Implemented CI/CD pipeline reducing deployment time by 60%'
              ]
            },
            {
              id: 'exp-2',
              company: 'WebApp Co.',
              position: 'Software Developer',
              startDate: '2017-06',
              endDate: '2020-02',
              current: false,
              description: 'Developed responsive web applications using React and Node.js.',
              achievements: [
                'Developed key features that increased user retention by 25%',
                'Mentored junior developers on React best practices'
              ]
            }
          ],
          education: [
            {
              id: 'edu-1',
              institution: 'University of Technology',
              degree: 'Bachelor of Science in Computer Science',
              startDate: '2013-09',
              endDate: '2017-05',
              gpa: '3.8/4.0'
            }
          ],
          skills: [
            'JavaScript', 'React', 'Node.js', 'TypeScript',
            'Python', 'AWS', 'Docker', 'Kubernetes',
            'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL'
          ],
          projects: [
            {
              id: 'proj-1',
              title: 'E-commerce Platform',
              description: 'Built a full-stack e-commerce platform with React, Node.js, and MongoDB',
              url: 'https://github.com/johndoe/ecommerce'
            }
          ],
          certifications: [
            {
              id: 'cert-1',
              name: 'AWS Certified Solutions Architect',
              issuer: 'Amazon Web Services',
              date: '2021-04'
            }
          ]
        },
        format: 'modern',
        isPublic: false
      },
      {
        id: 'mock-resume-2',
        title: 'Data Scientist Resume',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        score: 78,
        sections: {
          profile: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '(123) 456-7890',
            location: 'San Francisco, CA',
            title: 'Data Scientist'
          },
          summary: 'Data Scientist with expertise in machine learning, statistical analysis, and big data technologies.',
          experience: [
            {
              id: 'exp-1',
              company: 'Data Analytics Corp',
              position: 'Data Scientist',
              startDate: '2019-07',
              endDate: null,
              current: true,
              description: 'Developing machine learning models for predictive analytics',
              achievements: [
                'Improved prediction accuracy by 35% using advanced ML techniques',
                'Reduced data processing time by 50% through optimization'
              ]
            }
          ],
          education: [
            {
              id: 'edu-1',
              institution: 'Tech University',
              degree: 'Master of Science in Data Science',
              startDate: '2017-09',
              endDate: '2019-05',
              gpa: '3.9/4.0'
            }
          ],
          skills: [
            'Python', 'R', 'SQL', 'Machine Learning',
            'TensorFlow', 'PyTorch', 'Data Visualization',
            'Statistics', 'Pandas', 'NumPy', 'Scikit-learn'
          ],
          projects: [
            {
              id: 'proj-1',
              title: 'Customer Churn Prediction',
              description: 'Developed ML model to predict customer churn with 92% accuracy',
              url: 'https://github.com/johndoe/churn-prediction'
            }
          ],
          certifications: [
            {
              id: 'cert-1',
              name: 'TensorFlow Developer Certificate',
              issuer: 'Google',
              date: '2020-03'
            }
          ]
        },
        format: 'minimal',
        isPublic: false
      }
    ];
  }
  
  // For get resume by ID endpoint
  if (url.includes('/resume/') && url.includes('/mock-resume-')) {
    const resumeId = url.split('/').pop();
    if (resumeId === 'mock-resume-1') {
      return {
        id: 'mock-resume-1',
        title: 'Software Developer Resume',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        score: 85,
        sections: {
          profile: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '(123) 456-7890',
            location: 'San Francisco, CA',
            title: 'Senior Software Engineer'
          },
          summary: 'Experienced software engineer with 7+ years of experience in full-stack development, specializing in React, Node.js, and cloud architecture.',
          experience: [
            {
              id: 'exp-1',
              company: 'Tech Solutions Inc.',
              position: 'Senior Software Engineer',
              startDate: '2020-03',
              endDate: null,
              current: true,
              description: 'Leading development of microservices architecture for enterprise applications.',
              achievements: [
                'Reduced API response time by 40% through optimization',
                'Implemented CI/CD pipeline reducing deployment time by 60%'
              ]
            },
            {
              id: 'exp-2',
              company: 'WebApp Co.',
              position: 'Software Developer',
              startDate: '2017-06',
              endDate: '2020-02',
              current: false,
              description: 'Developed responsive web applications using React and Node.js.',
              achievements: [
                'Developed key features that increased user retention by 25%',
                'Mentored junior developers on React best practices'
              ]
            }
          ],
          education: [
            {
              id: 'edu-1',
              institution: 'University of Technology',
              degree: 'Bachelor of Science in Computer Science',
              startDate: '2013-09',
              endDate: '2017-05',
              gpa: '3.8/4.0'
            }
          ],
          skills: [
            'JavaScript', 'React', 'Node.js', 'TypeScript',
            'Python', 'AWS', 'Docker', 'Kubernetes',
            'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL'
          ],
          projects: [
            {
              id: 'proj-1',
              title: 'E-commerce Platform',
              description: 'Built a full-stack e-commerce platform with React, Node.js, and MongoDB',
              url: 'https://github.com/johndoe/ecommerce'
            }
          ],
          certifications: [
            {
              id: 'cert-1',
              name: 'AWS Certified Solutions Architect',
              issuer: 'Amazon Web Services',
              date: '2021-04'
            }
          ]
        },
        format: 'modern',
        isPublic: false
      };
    }
  }
  
  // For resume analysis endpoint
  if (url.includes('/resume/analyze')) {
    return {
      score: 75,
      feedback: {
        strengths: [
          'Strong technical skills section',
          'Clear work experience with quantifiable achievements',
          'Well-formatted and organized structure'
        ],
        weaknesses: [
          'Summary could be more tailored to specific job targets',
          'Some action verbs are repeated too frequently',
          'Skills section could be better categorized'
        ],
        suggestions: [
          'Add more quantifiable achievements to highlight impact',
          'Tailor summary to target job description',
          'Organize skills into categories (technical, soft, etc.)'
        ]
      },
      jobMatch: {
        score: 68,
        missingKeywords: ['Agile', 'Scrum', 'CI/CD', 'Jest'],
        recommendedAdditions: [
          'Add Agile/Scrum methodology experience',
          'Highlight CI/CD experience more prominently',
          'Include testing experience (Jest, Mocha, etc.)'
        ]
      },
      atsCompatibility: {
        score: 82,
        issues: [
          'Some formatting may not parse correctly in ATS systems',
          'Consider simplifying header sections'
        ]
      },
      timestamp: new Date().toISOString()
    };
  }
  
  // For resume history endpoint
  if (url.includes('/history')) {
    return [
      {
        id: 'hist-1',
        timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        changes: [
          'Updated job description for Tech Solutions Inc.',
          'Added AWS certification'
        ],
        score: 80
      },
      {
        id: 'hist-2',
        timestamp: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        changes: [
          'Added new skills: Docker, Kubernetes',
          'Updated summary section'
        ],
        score: 75
      },
      {
        id: 'hist-3',
        timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        changes: [
          'Initial resume creation'
        ],
        score: 70
      }
    ];
  }
  
  // Default fallback for any other resume endpoint
  return {
    success: true,
    message: 'This is a mock response for resume endpoint. The backend API might be unavailable.'
  };
};

/**
 * Helper function to simulate network delay for mock responses
 * @param {number} ms - Milliseconds to delay (default: random between 300-800ms)
 * @returns {Promise} - Promise that resolves after the delay
 */
const simulateNetworkDelay = async (ms) => {
  const delay = ms || Math.floor(Math.random() * 500) + 300; // Random delay between 300-800ms
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Generate mock job data for various endpoints
 */
const getMockJobData = (url, params) => {
  // Mock job data
  const mockJobs = [
    {
      id: 'job-001',
      title: 'Senior Software Engineer',
      company: 'Tech Innovations Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$130,000 - $160,000',
      description: 'We are looking for a Senior Software Engineer to join our team and help us build cutting-edge web applications. The ideal candidate will have 5+ years of experience with modern JavaScript frameworks, cloud architecture, and API design.',
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '5+ years of experience with JavaScript and front-end frameworks (React, Vue, or Angular)',
        '3+ years of experience with Node.js and RESTful API design',
        'Experience with cloud platforms (AWS, Azure, or GCP)',
        'Strong problem-solving skills and attention to detail'
      ],
      responsibilities: [
        'Design and implement scalable, high-performance web applications',
        'Collaborate with cross-functional teams to define and implement new features',
        'Optimize applications for maximum speed and scalability',
        'Write clean, maintainable, and well-documented code',
        'Mentor junior developers and perform code reviews'
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'TypeScript', 'GraphQL'],
      datePosted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      companyInfo: {
        name: 'Tech Innovations Inc.',
        logo: 'https://placehold.co/100x100/0077b6/white?text=TI',
        description: 'Tech Innovations Inc. is a leading technology company specializing in cloud-based solutions and web applications for enterprise clients.',
        size: '200-500 employees',
        industry: 'Information Technology & Services',
        website: 'https://techinnovations.example.com'
      }
    },
    {
      id: 'job-002',
      title: 'Data Scientist',
      company: 'Analytics Solutions Corp.',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$110,000 - $140,000',
      description: 'Analytics Solutions Corp. is seeking a talented Data Scientist to join our growing team. You will work on challenging projects, analyzing large datasets and building predictive models to help our clients make data-driven decisions.',
      requirements: [
        'Master\'s or PhD in Statistics, Mathematics, Computer Science, or related field',
        '3+ years of experience in data science or related role',
        'Proficiency in Python, R, or similar data analysis languages',
        'Experience with machine learning frameworks (TensorFlow, PyTorch, or scikit-learn)',
        'Strong statistical knowledge and experience with data visualization'
      ],
      responsibilities: [
        'Develop and implement advanced machine learning models',
        'Analyze large datasets to identify patterns and trends',
        'Collaborate with data engineers to implement data processing pipelines',
        'Present findings to stakeholders and clients',
        'Stay current with the latest developments in machine learning and AI'
      ],
      skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Data Visualization', 'Statistics'],
      datePosted: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      companyInfo: {
        name: 'Analytics Solutions Corp.',
        logo: 'https://placehold.co/100x100/9c27b0/white?text=AS',
        description: 'Analytics Solutions Corp. specializes in data analytics and machine learning solutions for businesses across various industries.',
        size: '50-200 employees',
        industry: 'Data Analytics',
        website: 'https://analyticssolutions.example.com'
      }
    },
    {
      id: 'job-003',
      title: 'UX/UI Designer',
      company: 'Creative Digital Agency',
      location: 'Remote',
      type: 'Full-time',
      salary: '$90,000 - $120,000',
      description: 'Creative Digital Agency is looking for a UX/UI Designer to create engaging and intuitive user experiences for our clients\' digital products. The ideal candidate should have a strong portfolio demonstrating their design skills and user-centered approach.',
      requirements: [
        'Bachelor\'s degree in Design, HCI, or related field',
        '3+ years of experience in UX/UI design',
        'Proficiency in design tools (Figma, Sketch, Adobe XD)',
        'Knowledge of HTML/CSS and responsive design principles',
        'Strong portfolio showcasing your design process and solutions'
      ],
      responsibilities: [
        'Create wireframes, prototypes, and high-fidelity designs',
        'Conduct user research and usability testing',
        'Collaborate with developers to implement designs',
        'Create and maintain design systems',
        'Stay current with design trends and best practices'
      ],
      skills: ['UI Design', 'UX Design', 'Figma', 'Sketch', 'Prototyping', 'User Research'],
      datePosted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      applicationDeadline: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(),
      companyInfo: {
        name: 'Creative Digital Agency',
        logo: 'https://placehold.co/100x100/ff9800/white?text=CDA',
        description: 'Creative Digital Agency is a full-service digital agency specializing in web design, branding, and digital marketing.',
        size: '10-50 employees',
        industry: 'Design & Creative',
        website: 'https://creativedigital.example.com'
      }
    }
  ];
  
  // For job search endpoint
  if (url.includes('/job/search')) {
    // If params.query is provided, filter the mock jobs
    let filteredJobs = [...mockJobs];
    
    if (params && params.query) {
      const searchTerm = params.query.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply pagination if params.page and params.pageSize are provided
    let paginatedJobs = filteredJobs;
    if (params && params.page && params.pageSize) {
      const startIndex = (params.page - 1) * params.pageSize;
      paginatedJobs = filteredJobs.slice(startIndex, startIndex + params.pageSize);
    }
    
    return {
      jobs: paginatedJobs,
      total: filteredJobs.length,
      page: params && params.page ? params.page : 1,
      pageSize: params && params.pageSize ? params.pageSize : 10
    };
  }
  
  // For job details endpoint
  if (url.includes('/job/') && url.match(/\/job-\d+$/)) {
    const jobId = url.split('/').pop();
    const job = mockJobs.find(job => job.id === jobId);
    
    if (job) {
      return job;
    }
    
    // If job not found, return the first job (for demo purposes)
    return mockJobs[0];
  }
  
  // For recommended jobs endpoint
  if (url.includes('/job/recommend')) {
    // Return 2 random jobs from the mock jobs array
    const shuffled = [...mockJobs].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }
  
  // For saved jobs endpoint
  if (url.includes('/job/saved')) {
    // Return 1 random job from the mock jobs array
    const randomIndex = Math.floor(Math.random() * mockJobs.length);
    return [mockJobs[randomIndex]];
  }
  
  // For popular industries endpoint
  if (url.includes('/job/industries')) {
    return [
      { name: 'Information Technology', count: 1245 },
      { name: 'Healthcare', count: 862 },
      { name: 'Finance', count: 743 },
      { name: 'Education', count: 651 },
      { name: 'Marketing', count: 520 }
    ];
  }
  
  // For trending skills endpoint
  if (url.includes('/job/skills')) {
    return [
      { name: 'JavaScript', count: 876 },
      { name: 'Python', count: 765 },
      { name: 'React', count: 654 },
      { name: 'SQL', count: 543 },
      { name: 'Machine Learning', count: 432 }
    ];
  }
  
  // For saved searches endpoint
  if (url.includes('/job/saved-searches')) {
    return [
      {
        id: 'search-001',
        name: 'Software Developer Jobs in San Francisco',
        query: 'software developer',
        location: 'San Francisco, CA',
        dateCreated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'search-002',
        name: 'Remote Data Science Jobs',
        query: 'data science',
        location: 'Remote',
        dateCreated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
  
  // For search history endpoint
  if (url.includes('/job/search-history')) {
    return [
      {
        id: 'history-001',
        query: 'frontend developer',
        location: 'New York, NY',
        dateSearched: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'history-002',
        query: 'data analyst',
        location: 'Boston, MA',
        dateSearched: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
  
  // For application history endpoint
  if (url.includes('/job/application-history')) {
    return [
      {
        id: 'app-001',
        jobId: 'job-001',
        jobTitle: 'Senior Software Engineer',
        company: 'Tech Innovations Inc.',
        status: 'Applied',
        dateApplied: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'app-002',
        jobId: 'job-002',
        jobTitle: 'Data Scientist',
        company: 'Analytics Solutions Corp.',
        status: 'Interview Scheduled',
        dateApplied: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }
  
  // Default fallback for any other job endpoint
  return {
    success: true,
    message: 'This is a mock response for job endpoint. The backend API might be unavailable.'
  };
};

/**
 * Generate mock profile data for development and testing
 * @param {string} url - The API endpoint URL
 * @param {Object} data - Request data (for POST/PUT requests)
 * @returns {Object} - Mock profile data
 */
function getMockProfileData(url, data = null) {
  const timestamp = new Date().toISOString();
  
  // Mock user profile data
  const mockUser = {
    id: 'user-123',
    name: 'Ahmed Ali',
    email: 'ahmed.ali@example.com',
    phone: '+966 50 123 4567',
    location: 'Riyadh, Saudi Arabia',
    about: 'Experienced software engineer with a passion for building innovative solutions.',
    title: 'Senior Software Engineer',
    profilePicture: 'https://randomuser.me/api/portraits/men/45.jpg',
    joinDate: '2023-01-15T08:30:00.000Z',
    lastActive: timestamp,
    completionPercentage: 85
  };
  
  // Mock education data
  const mockEducation = [
    {
      id: 'edu-1',
      institution: 'King Saud University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2015-09-01T00:00:00.000Z',
      endDate: '2019-06-30T00:00:00.000Z',
      gpa: '3.8/4.0',
      description: 'Graduated with honors, participated in multiple hackathons and research projects.'
    },
    {
      id: 'edu-2',
      institution: 'KAUST',
      degree: 'Master of Science',
      field: 'Artificial Intelligence',
      startDate: '2019-09-01T00:00:00.000Z',
      endDate: '2021-06-30T00:00:00.000Z',
      gpa: '3.9/4.0',
      description: 'Research focus on machine learning applications in healthcare.'
    }
  ];
  
  // Mock experience data
  const mockExperience = [
    {
      id: 'exp-1',
      company: 'Tech Solutions LLC',
      title: 'Software Engineer',
      location: 'Riyadh, Saudi Arabia',
      startDate: '2019-07-15T00:00:00.000Z',
      endDate: '2021-08-30T00:00:00.000Z',
      current: false,
      description: 'Developed and maintained enterprise web applications using React and Node.js.'
    },
    {
      id: 'exp-2',
      company: 'Innovation Systems',
      title: 'Senior Software Engineer',
      location: 'Jeddah, Saudi Arabia',
      startDate: '2021-09-15T00:00:00.000Z',
      endDate: null,
      current: true,
      description: 'Leading a team of developers to build cutting-edge AI-powered products.'
    }
  ];
  
  // Mock skills data
  const mockSkills = [
    { id: 'skill-1', name: 'JavaScript', level: 'Advanced', endorsements: 24 },
    { id: 'skill-2', name: 'React', level: 'Advanced', endorsements: 19 },
    { id: 'skill-3', name: 'Node.js', level: 'Intermediate', endorsements: 15 },
    { id: 'skill-4', name: 'Python', level: 'Advanced', endorsements: 22 },
    { id: 'skill-5', name: 'Machine Learning', level: 'Intermediate', endorsements: 12 },
    { id: 'skill-6', name: 'AWS', level: 'Intermediate', endorsements: 8 }
  ];
  
  // Mock certifications data
  const mockCertifications = [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect',
      organization: 'Amazon Web Services',
      issueDate: '2022-03-15T00:00:00.000Z',
      expiryDate: '2025-03-15T00:00:00.000Z',
      credentialId: 'AWS-123456',
      credentialURL: 'https://aws.amazon.com/certification/verify'
    },
    {
      id: 'cert-2',
      name: 'Professional Scrum Master I',
      organization: 'Scrum.org',
      issueDate: '2021-11-10T00:00:00.000Z',
      expiryDate: null,
      credentialId: 'PSM-123456',
      credentialURL: 'https://www.scrum.org/certification-list'
    }
  ];
  
  // Mock achievements data
  const mockAchievements = [
    {
      id: 'ach-1',
      title: 'Hackathon Winner',
      date: '2022-05-20T00:00:00.000Z',
      description: 'First place at the National AI Hackathon 2022'
    },
    {
      id: 'ach-2',
      title: 'Publication',
      date: '2021-09-10T00:00:00.000Z',
      description: 'Co-authored research paper on AI applications in healthcare'
    }
  ];
  
  // Handle different profile endpoints
  if (url.includes('/profile/')) {
    // Basic profile
    if (url.match(/\/profile\/[\w-]+$/)) {
      return { ...mockUser, timestamp };
    }
    
    // Education endpoints
    if (url.includes('/education/')) {
      if (url.match(/\/education\/[\w-]+$/)) {
        return { data: mockEducation, timestamp };
      }
      
      // Handle add/update/delete education based on method and data
      if (data) {
        return { 
          success: true, 
          message: 'Education updated successfully', 
          data: { ...data, id: data.id || `edu-${Date.now()}` },
          timestamp
        };
      }
    }
    
    // Experience endpoints
    if (url.includes('/experience/')) {
      if (url.match(/\/experience\/[\w-]+$/)) {
        return { data: mockExperience, timestamp };
      }
      
      // Handle add/update/delete experience based on method and data
      if (data) {
        return { 
          success: true, 
          message: 'Experience updated successfully', 
          data: { ...data, id: data.id || `exp-${Date.now()}` },
          timestamp
        };
      }
    }
    
    // Skills endpoints
    if (url.includes('/skills/')) {
      if (url.match(/\/skills\/[\w-]+$/)) {
        return { data: mockSkills, timestamp };
      }
      
      // Handle add/update/delete skill based on method and data
      if (data) {
        return { 
          success: true, 
          message: 'Skill updated successfully', 
          data: { ...data, id: data.id || `skill-${Date.now()}` },
          timestamp
        };
      }
    }
    
    // Certifications endpoints
    if (url.includes('/certifications/')) {
      if (url.match(/\/certifications\/[\w-]+$/)) {
        return { data: mockCertifications, timestamp };
      }
      
      // Handle add/update/delete certification based on method and data
      if (data) {
        return { 
          success: true, 
          message: 'Certification updated successfully', 
          data: { ...data, id: data.id || `cert-${Date.now()}` },
          timestamp
        };
      }
    }
    
    // Achievements endpoints
    if (url.includes('/achievements/')) {
      return { data: mockAchievements, timestamp };
    }
    
    // Profile picture endpoint
    if (url.includes('/picture/')) {
      return { 
        success: true, 
        message: 'Profile picture uploaded successfully', 
        data: { url: 'https://randomuser.me/api/portraits/men/45.jpg' },
        timestamp
      };
    }
  }
  
  // Default fallback for profile
  return {
    message: 'Mock profile data for endpoint not specifically handled',
    endpoint: url,
    timestamp
  };
}

/**
 * Generate mock assessment data for development and testing
 * @param {string} url - The API endpoint URL
 * @param {Object} data - Request data (for POST/PUT requests)
 * @returns {Object} - Mock assessment data
 */
function getMockAssessmentData(url, data = null) {
  const timestamp = new Date().toISOString();
  
  // Mock assessments
  const mockAssessments = [
    {
      id: 'assessment-1',
      title: 'JavaScript Proficiency',
      description: 'Test your JavaScript skills and knowledge with this comprehensive assessment.',
      skillCategory: 'Programming',
      skillName: 'JavaScript',
      difficulty: 'Intermediate',
      duration: 30, // minutes
      questionCount: 20,
      passingScore: 70,
      thumbnail: 'https://example.com/images/javascript.jpg',
      popularity: 95,
      completions: 1250
    },
    {
      id: 'assessment-2',
      title: 'React Framework Mastery',
      description: 'Assess your understanding of React components, hooks, and state management.',
      skillCategory: 'Web Development',
      skillName: 'React',
      difficulty: 'Advanced',
      duration: 45, // minutes
      questionCount: 25,
      passingScore: 75,
      thumbnail: 'https://example.com/images/react.jpg',
      popularity: 92,
      completions: 980
    },
    {
      id: 'assessment-3',
      title: 'Data Science Fundamentals',
      description: 'Test your knowledge of statistical methods, data visualization, and machine learning basics.',
      skillCategory: 'Data Science',
      skillName: 'Statistics & Machine Learning',
      difficulty: 'Beginner',
      duration: 40, // minutes
      questionCount: 30,
      passingScore: 65,
      thumbnail: 'https://example.com/images/data-science.jpg',
      popularity: 88,
      completions: 760
    }
  ];
  
  // Mock questions
  const mockQuestions = [
    {
      id: 'question-1',
      assessmentId: 'assessment-1',
      questionType: 'multiple-choice',
      questionText: 'Which of the following is NOT a primitive data type in JavaScript?',
      options: [
        { id: 'option-1-1', text: 'String' },
        { id: 'option-1-2', text: 'Boolean' },
        { id: 'option-1-3', text: 'Object' },
        { id: 'option-1-4', text: 'Number' }
      ],
      correctAnswer: 'option-1-3',
      difficulty: 'Easy',
      points: 5
    },
    {
      id: 'question-2',
      assessmentId: 'assessment-1',
      questionType: 'multiple-choice',
      questionText: 'Which method is used to add an element to the end of an array in JavaScript?',
      options: [
        { id: 'option-2-1', text: 'push()' },
        { id: 'option-2-2', text: 'append()' },
        { id: 'option-2-3', text: 'addToEnd()' },
        { id: 'option-2-4', text: 'concat()' }
      ],
      correctAnswer: 'option-2-1',
      difficulty: 'Easy',
      points: 5
    },
    {
      id: 'question-3',
      assessmentId: 'assessment-1',
      questionType: 'code',
      questionText: 'Write a function that returns the factorial of a given number.',
      starterCode: 'function factorial(n) {\n  // Your code here\n}',
      testCases: [
        { input: 5, expectedOutput: 120 },
        { input: 0, expectedOutput: 1 },
        { input: 1, expectedOutput: 1 }
      ],
      difficulty: 'Medium',
      points: 10
    }
  ];
  
  // Mock assessment history
  const mockAssessmentHistory = [
    {
      id: 'history-1',
      userId: 'user-123',
      assessmentId: 'assessment-1',
      assessmentTitle: 'JavaScript Proficiency',
      startTime: '2023-10-15T14:30:00.000Z',
      endTime: '2023-10-15T15:00:00.000Z',
      score: 85,
      maxScore: 100,
      status: 'completed',
      passed: true,
      certificateId: 'cert-js-001'
    },
    {
      id: 'history-2',
      userId: 'user-123',
      assessmentId: 'assessment-2',
      assessmentTitle: 'React Framework Mastery',
      startTime: '2023-11-05T10:15:00.000Z',
      endTime: '2023-11-05T11:00:00.000Z',
      score: 78,
      maxScore: 100,
      status: 'completed',
      passed: true,
      certificateId: 'cert-react-001'
    },
    {
      id: 'history-3',
      userId: 'user-123',
      assessmentId: 'assessment-3',
      assessmentTitle: 'Data Science Fundamentals',
      startTime: '2023-11-20T16:00:00.000Z',
      endTime: null,
      score: null,
      maxScore: 100,
      status: 'in-progress',
      passed: null,
      certificateId: null
    }
  ];
  
  // Mock skill recommendations
  const mockSkillRecommendations = {
    userId: 'user-123',
    recommendations: [
      {
        skillName: 'Node.js',
        relevance: 95,
        description: 'Based on your JavaScript skills, learning Node.js would enhance your backend development capabilities.',
        learningResources: [
          { title: 'Node.js Fundamentals', type: 'course', url: 'https://example.com/courses/nodejs' },
          { title: 'Building RESTful APIs with Express', type: 'tutorial', url: 'https://example.com/tutorials/express-apis' }
        ]
      },
      {
        skillName: 'TypeScript',
        relevance: 90,
        description: 'TypeScript would help you write more maintainable JavaScript code with static typing.',
        learningResources: [
          { title: 'TypeScript Essentials', type: 'course', url: 'https://example.com/courses/typescript' },
          { title: 'Migrating from JS to TS', type: 'guide', url: 'https://example.com/guides/js-to-ts' }
        ]
      },
      {
        skillName: 'GraphQL',
        relevance: 85,
        description: 'Learning GraphQL would complement your React skills for more efficient API interactions.',
        learningResources: [
          { title: 'GraphQL with React', type: 'workshop', url: 'https://example.com/workshops/graphql-react' },
          { title: 'Building a GraphQL API', type: 'tutorial', url: 'https://example.com/tutorials/graphql-api' }
        ]
      }
    ],
    timestamp
  };
  
  // Mock certificates
  const mockCertificates = [
    {
      id: 'cert-js-001',
      userId: 'user-123',
      assessmentId: 'assessment-1',
      title: 'JavaScript Proficiency',
      issueDate: '2023-10-15T15:00:00.000Z',
      score: 85,
      validUntil: '2025-10-15T15:00:00.000Z',
      verificationUrl: 'https://example.com/verify/cert-js-001',
      badge: 'https://example.com/badges/javascript-proficient.png'
    },
    {
      id: 'cert-react-001',
      userId: 'user-123',
      assessmentId: 'assessment-2',
      title: 'React Framework Mastery',
      issueDate: '2023-11-05T11:00:00.000Z',
      score: 78,
      validUntil: '2025-11-05T11:00:00.000Z',
      verificationUrl: 'https://example.com/verify/cert-react-001',
      badge: 'https://example.com/badges/react-master.png'
    }
  ];
  
  // Mock assessment session
  const mockSession = {
    id: 'session-123',
    userId: 'user-123',
    assessmentId: 'assessment-1',
    startTime: timestamp,
    currentQuestionIndex: 0,
    timeRemaining: 1800, // seconds
    answers: []
  };
  
  // Handle different assessment endpoints
  if (url.includes('/assessment/')) {
    // Available assessments
    if (url.includes('/available/')) {
      return { data: mockAssessments, timestamp };
    }
    
    // Assessment details
    if (url.match(/\/assessment\/assessment-[\w-]+$/)) {
      const assessmentId = url.split('/').pop();
      const assessment = mockAssessments.find(a => a.id === assessmentId) || mockAssessments[0];
      return { data: assessment, timestamp };
    }
    
    // Assessment questions
    if (url.includes('/questions')) {
      return { data: mockQuestions, timestamp };
    }
    
    // Assessment history
    if (url.includes('/history/')) {
      return { data: mockAssessmentHistory, timestamp };
    }
    
    // Assessment result
    if (url.includes('/result/')) {
      const resultId = url.split('/').pop();
      const result = mockAssessmentHistory.find(h => h.id === resultId) || mockAssessmentHistory[0];
      return { data: result, timestamp };
    }
    
    // Skill recommendations
    if (url.includes('/recommendations/')) {
      return mockSkillRecommendations;
    }
    
    // Related jobs
    if (url.includes('/jobs/')) {
      return {
        data: [
          {
            id: 'job-1',
            title: 'Frontend Developer',
            company: 'Tech Solutions Inc.',
            relevance: 95,
            location: 'Riyadh, Saudi Arabia',
            skills: ['JavaScript', 'React', 'HTML/CSS']
          },
          {
            id: 'job-2',
            title: 'Full Stack Developer',
            company: 'Digital Innovations',
            relevance: 90,
            location: 'Remote',
            skills: ['JavaScript', 'Node.js', 'React', 'MongoDB']
          }
        ],
        timestamp
      };
    }
    
    // Certificates
    if (url.includes('/certifications/')) {
      return { data: mockCertificates, timestamp };
    }
    
    // Start assessment
    if (url.includes('/start') && data) {
      return { ...mockSession, userId: data.userId, assessmentId: data.assessmentId, timestamp };
    }
    
    // Submit answer
    if (url.includes('/answer') && data) {
      return {
        success: true,
        message: 'Answer submitted successfully',
        feedback: {
          isCorrect: Math.random() > 0.3, // 70% chance of correct
          points: Math.floor(Math.random() * 10) + 1,
          explanation: 'This is feedback for your answer.'
        },
        timestamp
      };
    }
    
    // Complete assessment
    if (url.includes('/complete') && data) {
      return {
        success: true,
        message: 'Assessment completed successfully',
        result: {
          sessionId: data.sessionId || 'session-123',
          score: Math.floor(Math.random() * 30) + 70, // 70-100
          maxScore: 100,
          passed: true,
          timeTaken: '25:30', // 25 minutes, 30 seconds
          strengths: ['JavaScript syntax', 'Array methods'],
          weaknesses: ['Closures', 'Asynchronous programming'],
          certificateId: 'cert-new-001'
        },
        timestamp
      };
    }
    
    // Generate certificate
    if (url.includes('/certificate') && data) {
      return {
        success: true,
        message: 'Certificate generated successfully',
        certificate: {
          id: `cert-${Date.now()}`,
          userId: data.userId,
          assessmentId: data.assessmentId,
          title: 'JavaScript Proficiency',
          issueDate: timestamp,
          score: 85,
          validUntil: new Date(Date.now() + 63072000000).toISOString(), // 2 years
          verificationUrl: `https://example.com/verify/cert-${Date.now()}`,
          badge: 'https://example.com/badges/javascript-proficient.png'
        },
        timestamp
      };
    }
  }
  
  // Default fallback for assessment
  return {
    message: 'Mock assessment data for endpoint not specifically handled',
    endpoint: url,
    timestamp
  };
}

// Utility function to get URL with optional proxy prefix
export const getProxyUrl = (url) => {
  // Check if the proxy fallback should be used
  const useProxyFallback = isDevelopment && isBackendUnavailable();
  
  if (useProxyFallback) {
    // Use CORS proxy if backend is unavailable
    return `http://localhost:8080/http://localhost:5001/api${url.startsWith('/') ? url : '/' + url}`;
  }
  
  return url;
};

/**
 * Generates mock user data for various user endpoints
 */
const getMockUserData = (url) => {
  // User activities endpoint
  if (url.includes('/user/activities')) {
    return {
      data: {
        success: true,
        data: [
          {
            id: 1,
            type: 'resume',
            action: 'created',
            details: 'Created a new resume',
            timestamp: new Date(Date.now() - 86400000).toISOString() // Yesterday
          },
          {
            id: 2,
            type: 'job',
            action: 'applied',
            details: 'Applied for Software Engineer position at Google',
            timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
          },
          {
            id: 3,
            type: 'interview',
            action: 'completed',
            details: 'Completed mock interview practice',
            timestamp: new Date(Date.now() - 259200000).toISOString() // 3 days ago
          },
          {
            id: 4,
            type: 'assessment',
            action: 'completed',
            details: 'Completed skills assessment',
            timestamp: new Date(Date.now() - 345600000).toISOString() // 4 days ago
          },
          {
            id: 5,
            type: 'learning',
            action: 'completed',
            details: 'Completed JavaScript course',
            timestamp: new Date(Date.now() - 432000000).toISOString() // 5 days ago
          }
        ]
      }
    };
  }
  
  // User profile endpoint
  if (url.includes('/user/profile')) {
    return {
      data: {
        success: true,
        data: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          title: 'Software Engineer',
          bio: 'Experienced software engineer with 5+ years in web development',
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
          location: 'San Francisco, CA',
          phone: '555-123-4567',
          website: 'https://johndoe.dev',
          social: {
            linkedin: 'https://linkedin.com/in/johndoe',
            github: 'https://github.com/johndoe',
            twitter: 'https://twitter.com/johndoe'
          }
        }
      }
    };
  }
  
  // Default fallback for any other user endpoint
  return {
    data: {
      success: true,
      data: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      }
    }
  };
};

// Add this in the appropriate section of apiClient.js, around line 1800-2000 where similar mock data functions are defined

/**
 * Get mock gamification data for different endpoints
 * @param {string} url - The API endpoint URL
 * @param {Object} params - Request parameters
 * @returns {Object} Mock data response
 */
const getMockGamificationData = (url, params) => {
  // Simulate network delay
  return simulateNetworkDelay(300).then(() => {
    // Extract user ID from params or URL
    const userId = params?.userId || url.split('/').pop();
    
    // Handle different gamification endpoints
    if (url.includes('/progress/')) {
      console.log('Using mock data for gamification endpoint: /progress');
      return {
        data: {
          success: true,
          data: {
            level: 4,
            currentXP: 350,
            xpToNextLevel: 500,
            totalXP: 1350,
            streak: 5,
            activeDays: 21
          }
        }
      };
    }
    
    if (url.includes('/badges/')) {
      console.log('Using mock data for gamification endpoint: /badges');
      return {
        data: {
          success: true,
          data: [
            {
              id: 'badge-1',
              name: 'Profile Master',
              description: 'Completed your profile with all details',
              category: 'profile',
              color: '#4CAF50',
              unlocked: true,
              dateAchieved: '2023-02-15T10:30:00Z',
              criteria: ['Complete personal info', 'Add profile picture', 'Add a resume']
            },
            {
              id: 'badge-2',
              name: 'Job Seeker',
              description: 'Applied to 10 jobs',
              category: 'jobs',
              color: '#2196F3',
              unlocked: true,
              dateAchieved: '2023-03-10T14:15:00Z',
              criteria: ['Apply to 10 jobs']
            },
            {
              id: 'badge-3',
              name: 'Skill Builder',
              description: 'Added 15 skills to your profile',
              category: 'skills',
              color: '#9C27B0',
              unlocked: true,
              dateAchieved: '2023-03-05T09:45:00Z',
              criteria: ['Add 15 skills to your profile']
            },
            {
              id: 'badge-4',
              name: 'Interview Ace',
              description: 'Complete 5 mock interviews',
              category: 'interview',
              color: '#F44336',
              unlocked: false,
              criteria: ['Complete 5 mock interviews with a score of 80% or higher']
            },
            {
              id: 'badge-5',
              name: 'Networking Pro',
              description: 'Connected with 10 professionals',
              category: 'networking',
              color: '#FF9800',
              unlocked: false,
              criteria: ['Connect with 10 professionals in your industry']
            }
          ]
        }
      };
    }
    
    if (url.includes('/achievements/')) {
      console.log('Using mock data for gamification endpoint: /achievements');
      return {
        data: {
          success: true,
          data: [
            {
              id: 'achieve-1',
              name: 'First Job Application',
              description: 'Applied to your first job',
              category: 'jobs',
              points: 50,
              achieved: true,
              dateAchieved: '2023-01-20T11:30:00Z'
            },
            {
              id: 'achieve-2',
              name: 'Resume Uploaded',
              description: 'Uploaded your first resume',
              category: 'profile',
              points: 30,
              achieved: true,
              dateAchieved: '2023-01-15T09:20:00Z'
            },
            {
              id: 'achieve-3',
              name: 'Skill Assessment Completed',
              description: 'Completed your first skill assessment',
              category: 'skills',
              points: 75,
              achieved: true,
              dateAchieved: '2023-01-25T14:45:00Z'
            },
            {
              id: 'achieve-4',
              name: 'Interview Feedback',
              description: 'Received feedback from 3 mock interviews',
              category: 'interview',
              points: 60,
              achieved: true,
              dateAchieved: '2023-02-10T16:30:00Z'
            },
            {
              id: 'achieve-5',
              name: 'Learning Streak',
              description: 'Learned for 7 consecutive days',
              category: 'learning',
              points: 100,
              achieved: false
            }
          ]
        }
      };
    }
    
    if (url.includes('/challenges/')) {
      // If it's an accept challenge request
      if (url.includes('/accept/')) {
        console.log('Using mock data for gamification endpoint: /accept-challenge');
        return {
          data: {
            success: true,
            message: 'Challenge accepted successfully'
          }
        };
      }
      
      console.log('Using mock data for gamification endpoint: /challenges');
      return {
        data: {
          success: true,
          data: [
            {
              id: 'challenge-1',
              name: 'Resume Optimizer',
              description: 'Improve your resume score by 15%',
              category: 'resume',
              difficulty: 'medium',
              xpReward: 150,
              deadline: '2023-04-15T23:59:59Z',
              status: 'in-progress',
              progress: 60,
              accepted: true
            },
            {
              id: 'challenge-2',
              name: 'Interview Preparation',
              description: 'Complete 3 mock interviews this week',
              category: 'interview',
              difficulty: 'hard',
              xpReward: 200,
              deadline: '2023-04-10T23:59:59Z',
              status: 'not-started',
              progress: 0,
              accepted: false
            },
            {
              id: 'challenge-3',
              name: 'Skill Development',
              description: 'Complete 2 skill courses',
              category: 'learning',
              difficulty: 'easy',
              xpReward: 100,
              deadline: '2023-04-20T23:59:59Z',
              status: 'completed',
              progress: 100,
              accepted: true
            }
          ]
        }
      };
    }
    
    if (url.includes('/activities/')) {
      console.log('Using mock data for gamification endpoint: /activities');
      return {
        data: {
          success: true,
          data: [
            {
              id: 'activity-1',
              type: 'job_application',
              description: 'Applied for Frontend Developer at TechCorp UAE',
              timestamp: '2023-03-15T10:30:00Z',
              xpEarned: 20
            },
            {
              id: 'activity-2',
              type: 'skill_assessment',
              description: 'Completed React assessment with 85% score',
              timestamp: '2023-03-12T14:15:00Z',
              xpEarned: 50
            },
            {
              id: 'activity-3',
              type: 'learning',
              description: 'Completed course: Advanced TypeScript',
              timestamp: '2023-03-10T09:45:00Z',
              xpEarned: 30
            },
            {
              id: 'activity-4',
              type: 'achievement',
              description: 'Earned badge: Skill Builder',
              timestamp: '2023-03-05T09:45:00Z',
              xpEarned: 75
            },
            {
              id: 'activity-5',
              type: 'interview',
              description: 'Completed mock interview for Software Engineer position',
              timestamp: '2023-03-02T11:30:00Z',
              xpEarned: 40
            }
          ]
        }
      };
    }
    
    // Default handler for other gamification endpoints
    return {
      data: {
        success: false,
        message: 'Unknown gamification endpoint',
        data: null
      }
    };
  });
};

// Add mock data for user skills
const getMockUserSkills = (url, params) => {
  return simulateNetworkDelay(300).then(() => {
    if (url.includes('/stats')) {
      console.log('Using mock data for skill stats endpoint');
      return {
        data: {
          success: true,
          data: {
            "React": 90,
            "JavaScript": 85,
            "Node.js": 70,
            "TypeScript": 75,
            "UI/UX Design": 60,
            "GraphQL": 65
          }
        }
      };
    }
    
    // Default response for other skills endpoints
    return {
      data: {
        success: true,
        data: []
      }
    };
  });
};

export default apiClient; 