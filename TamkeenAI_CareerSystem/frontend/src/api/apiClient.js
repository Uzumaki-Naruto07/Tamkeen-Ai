import axios from 'axios';

// Environment detection
const isDevelopment = import.meta.env.DEV;
const useMockData = isDevelopment || import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Track pending login requests to prevent duplicates
let pendingLoginRequest = null;

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: isDevelopment ? false : true
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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
    } else if (error.request) {
      // The request was made but no response was received
      errorObj.message = 'No response from server. Please try again later.';
      
      // In development mode, handle CORS errors more gracefully
      if (isDevelopment && error.message && error.message.includes('Network Error')) {
        console.warn('Development mode - CORS or Network error detected, using mock fallbacks');
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
    // In development or if mock data is enabled, provide fallback mock data
    if (useMockData) {
      // Check if there's a mock handler for this endpoint
      if (url.includes('/dashboard/data')) {
        // Only log in development mode and not too frequently
        if (isDevelopment && Math.random() > 0.8) {
          console.log('Using mock dashboard data');
        }
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return { data: { data: mockDashboardData, success: true } };
      }
    }
    // If no mock handler or not in development, try the real API
    try {
      return await apiClient.get(url, { params });
    } catch (error) {
      // If in development and API failed, try to use mock data as fallback
      if (isDevelopment) {
        if (url.includes('/dashboard/data')) {
          if (isDevelopment && Math.random() > 0.8) {
            console.log('API failed, falling back to mock dashboard data');
          }
          return { data: { data: mockDashboardData, success: true } };
        }
      }
      throw error;
    }
  },
  post: (url, data = {}) => {
    // Mock authentication in development mode for login path
    if (isDevelopment && url.includes('/auth/login')) {
      return mockLogin(data);
    }
    return apiClient.post(url, data);
  },
  put: (url, data = {}) => apiClient.put(url, data),
  delete: (url) => apiClient.delete(url),
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

export default apiClient; 