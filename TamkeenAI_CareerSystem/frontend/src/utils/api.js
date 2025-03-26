/**
 * API Integration for TamkeenAI Career System
 * Provides functions to interact with the backend API
 */
import axios from 'axios';
import endpoints from './endpoints';

// Create axios instance with default config
const api = axios.create({
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(endpoints.AUTH.REFRESH_TOKEN, {
            refresh_token: refreshToken
          });
          
          const { token, refresh_token } = response.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refresh_token);
          
          // Retry the original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

//==============================================================================
// AUTH API
//==============================================================================
export const authApi = {
  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Registration result
   */
  register: async (userData) => {
    const response = await api.post(endpoints.AUTH.REGISTER, userData);
    return response.data;
  },
  
  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @returns {Promise} - Login result with token
   */
  login: async (credentials) => {
    const response = await api.post(endpoints.AUTH.LOGIN, credentials);
    
    // Store token in localStorage if received
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    
    return response.data;
  },
  
  /**
   * Logout user
   * @returns {void}
   */
  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  },
  
  /**
   * Check if user is authenticated
   * @returns {boolean} - Authentication status
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  /**
   * Request password reset
   * @param {Object} emailData - User email
   * @returns {Promise} - Reset request result
   */
  requestPasswordReset: async (emailData) => {
    const response = await api.post(endpoints.AUTH.REQUEST_PASSWORD_RESET, emailData);
    return response.data;
  },
  
  /**
   * Reset password
   * @param {Object} resetData - Password reset data
   * @returns {Promise} - Reset result
   */
  resetPassword: async (resetData) => {
    const response = await api.post(endpoints.AUTH.RESET_PASSWORD, resetData);
    return response.data;
  },
  
  /**
   * Verify email
   * @param {string} token - Verification token
   * @returns {Promise} - Verification result
   */
  verifyEmail: async (token) => {
    const response = await api.post(endpoints.AUTH.VERIFY_EMAIL, { token });
    return response.data;
  },

  /**
   * Refresh authentication token
   * @returns {Promise} - New token
   */
  refreshToken: async () => {
    const response = await api.post(endpoints.AUTH.REFRESH_TOKEN);
    
    // Update token in localStorage if received
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    
    return response.data;
  },
  
  /**
   * Get current authentication status
   * @returns {Promise} - Auth status
   */
  getAuthStatus: async () => {
    const response = await api.get(endpoints.AUTH.STATUS);
    return response.data;
  },
  
  /**
   * Login with OAuth provider
   * @param {string} provider - OAuth provider (google, facebook, linkedin)
   * @returns {Promise} - OAuth login result
   */
  oauthLogin: async (provider) => {
    const response = await api.get(endpoints.AUTH.OAUTH_LOGIN(provider));
    return response.data;
  },
  
  /**
   * Handle OAuth callback
   * @param {Object} callbackData - OAuth callback data
   * @returns {Promise} - OAuth processing result
   */
  oauthCallback: async (callbackData) => {
    const response = await api.post(endpoints.AUTH.OAUTH_CALLBACK, callbackData);
    
    // Store token in localStorage if received
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    
    return response.data;
  },

  /**
   * Change password
   * @param {Object} passwordData - Password change data
   * @returns {Promise} - Change result
   */
  changePassword: async (passwordData) => {
    const response = await api.post(endpoints.AUTH.CHANGE_PASSWORD, passwordData);
    return response.data;
  }
};

//==============================================================================
// USER PROFILE API
//==============================================================================
export const userApi = {
  /**
   * Get current user profile
   * @returns {Promise} - Response with user profile data
   */
  getProfile: async () => {
    const response = await api.get(endpoints.USER.PROFILE);
    return response.data;
  },
  
  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} - Response with updated profile
   */
  updateProfile: async (profileData) => {
    const response = await api.put(endpoints.USER.UPDATE_PROFILE, profileData);
    return response.data;
  },
  
  /**
   * Upload profile avatar
   * @param {File} file - Image file to upload
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} - Response with avatar URL
   */
  uploadAvatar: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post(endpoints.USER.UPLOAD_AVATAR, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    
    return response.data;
  },
  
  /**
   * Get user settings
   * @returns {Promise} - Response with user settings
   */
  getSettings: async () => {
    const response = await api.get(endpoints.USER.GET_SETTINGS);
    return response.data;
  },
  
  /**
   * Update user settings
   * @param {Object} settings - Settings data to update
   * @returns {Promise} - Response with updated settings
   */
  updateSettings: async (settings) => {
    const response = await api.put(endpoints.USER.UPDATE_SETTINGS, settings);
    return response.data;
  },
  
  /**
   * Get user activity log
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} - Response with activity log data
   */
  getActivityLog: async (page = 1, limit = 20) => {
    const response = await api.get(`${endpoints.USER.ACTIVITY_LOG}?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  /**
   * Get user notifications
   * @param {boolean} unreadOnly - Get only unread notifications
   * @returns {Promise} - Response with notifications
   */
  getNotifications: async (unreadOnly = false) => {
    const response = await api.get(`${endpoints.USER.NOTIFICATIONS}?unread_only=${unreadOnly}`);
    return response.data;
  },
  
  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} - Response with status
   */
  markNotificationAsRead: async (notificationId) => {
    const response = await api.post(endpoints.USER.READ_NOTIFICATION(notificationId));
    return response.data;
  }
};

//==============================================================================
// RESUME API
//==============================================================================
export const resumeApi = {
  /**
   * Get all user resumes
   * @returns {Promise} - Response with user resumes
   */
  getAll: async () => {
    const response = await api.get(endpoints.RESUME.GET_ALL);
    return response.data;
  },
  
  /**
   * Get single resume by ID
   * @param {string} resumeId - Resume ID
   * @returns {Promise} - Response with resume data
   */
  getById: async (resumeId) => {
    const response = await api.get(endpoints.RESUME.GET_BY_ID(resumeId));
    return response.data;
  },
  
  /**
   * Create new resume
   * @param {Object} resumeData - Resume data
   * @returns {Promise} - Response with created resume
   */
  create: async (resumeData) => {
    const response = await api.post(endpoints.RESUME.CREATE, resumeData);
    return response.data;
  },
  
  /**
   * Update existing resume
   * @param {string} resumeId - Resume ID
   * @param {Object} resumeData - Updated resume data
   * @returns {Promise} - Response with updated resume
   */
  update: async (resumeId, resumeData) => {
    const response = await api.put(endpoints.RESUME.UPDATE(resumeId), resumeData);
    return response.data;
  },
  
  /**
   * Delete a resume
   * @param {string} resumeId - Resume ID
   * @returns {Promise} - Response with deletion status
   */
  delete: async (resumeId) => {
    const response = await api.delete(endpoints.RESUME.DELETE(resumeId));
    return response.data;
  },
  
  /**
   * Upload resume file for parsing
   * @param {File} file - Resume file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} - Response with parsed resume data
   */
  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post(endpoints.RESUME.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    
    return response.data;
  },
  
  /**
   * Parse resume text
   * @param {string} resumeText - Resume text content
   * @returns {Promise} - Response with parsed resume data
   */
  parse: async (resumeText) => {
    const response = await api.post(endpoints.RESUME.PARSE, { resume_text: resumeText });
    return response.data;
  },
  
  /**
   * Analyze resume and get feedback
   * @param {string} resumeId - Resume ID
   * @returns {Promise} - Response with analysis results
   */
  analyze: async (resumeId) => {
    const response = await api.get(endpoints.RESUME.ANALYZE(resumeId));
    return response.data;
  },
  
  /**
   * Get AI suggestions to optimize resume
   * @param {string} resumeId - Resume ID
   * @returns {Promise} - Response with optimization suggestions
   */
  optimize: async (resumeId) => {
    const response = await api.get(endpoints.RESUME.OPTIMIZE(resumeId));
    return response.data;
  },
  
  /**
   * Generate tailored resume suggestions for a job
   * @param {string} resumeId - Resume ID
   * @param {string} jobId - Job ID
   * @returns {Promise} - Response with job-specific suggestions
   */
  generateSuggestions: async (resumeId, jobId) => {
    const response = await api.get(`${endpoints.RESUME.GENERATE_SUGGESTIONS(resumeId)}?job_id=${jobId}`);
    return response.data;
  },
  
  /**
   * Export resume to specified format
   * @param {string} resumeId - Resume ID
   * @param {string} format - Export format (pdf, docx, etc.)
   * @returns {Promise} - Response with download URL
   */
  export: async (resumeId, format) => {
    const response = await api.get(endpoints.RESUME.EXPORT(resumeId, format), {
      responseType: 'blob',
    });
    return response.data;
  },
  
  /**
   * Get available resume templates
   * @returns {Promise} - Response with templates
   */
  getTemplates: async () => {
    const response = await api.get(endpoints.RESUME.GET_TEMPLATES);
    return response.data;
  },
  
  /**
   * Extract skills from text
   * @param {string} text - Text to analyze
   * @returns {Promise} - Response with extracted skills
   */
  extractSkills: async (text) => {
    const response = await api.post(endpoints.RESUME.SKILL_EXTRACTION, { text });
    return response.data;
  },
  
  /**
   * Get resume keyword recommendations
   * @param {string} resumeId - Resume ID
   * @param {string} jobId - Job ID to match against (optional)
   * @returns {Promise} - Keyword recommendations
   */
  getKeywordRecommendations: async (resumeId, jobId = null) => {
    const url = jobId 
      ? `${endpoints.RESUME.GET_KEYWORD_RECOMMENDATIONS(resumeId)}?jobId=${jobId}`
      : endpoints.RESUME.GET_KEYWORD_RECOMMENDATIONS(resumeId);
    
    const response = await api.get(url);
    return response.data;
  },
  
  /**
   * Analyze skill gaps
   * @param {string} resumeId - Resume ID
   * @param {string} jobId - Job ID
   * @returns {Promise} - Skill gap analysis
   */
  analyzeSkillGap: async (resumeId, jobId) => {
    const response = await api.get(endpoints.RESUME.ANALYZE_SKILL_GAP(resumeId, jobId));
    return response.data;
  },
  
  /**
   * Get ATS score history
   * @param {string} resumeId - Resume ID
   * @returns {Promise} - ATS score history
   */
  getATSHistory: async (resumeId) => {
    const response = await api.get(endpoints.RESUME.GET_ATS_HISTORY(resumeId));
    return response.data;
  },
  
  /**
   * Get ATS score
   * @param {string} resumeId - Resume ID
   * @param {string} jobId - Job ID (optional)
   * @returns {Promise} - ATS score
   */
  getATSScore: async (resumeId, jobId = null) => {
    const url = jobId 
      ? `${endpoints.RESUME.GET_ATS_SCORE(resumeId)}?jobId=${jobId}`
      : endpoints.RESUME.GET_ATS_SCORE(resumeId);
    
    const response = await api.get(url);
    return response.data;
  },
  
  /**
   * Extract keywords from text
   * @param {Object} data - Text data
   * @param {string} data.text - Text to analyze
   * @param {string} data.type - Text type (resume, job, etc.)
   * @returns {Promise} - Extracted keywords
   */
  extractKeywords: async (data) => {
    const response = await api.post(endpoints.RESUME.EXTRACT_KEYWORDS, data);
    return response.data;
  },
  
  /**
   * Optimize resume for ATS
   * @param {string} resumeId - Resume ID
   * @param {string} jobId - Job ID (optional)
   * @returns {Promise} - Optimized resume content
   */
  optimizeForATS: async (resumeId, jobId = null) => {
    const data = { resumeId };
    if (jobId) data.jobId = jobId;
    
    const response = await api.post(endpoints.RESUME.OPTIMIZE_FOR_ATS, data);
    return response.data;
  },
  
  /**
   * Build resume from template
   * @param {Object} builderData - Resume builder data
   * @param {string} builderData.templateId - Template ID
   * @param {Object} builderData.content - Resume content
   * @returns {Promise} - Built resume data
   */
  buildResumeFromTemplate: async (builderData) => {
    const response = await api.post(endpoints.RESUME.BUILD_FROM_TEMPLATE, builderData);
    return response.data;
  },
  
  /**
   * Extract professional profile
   * @param {string} resumeId - Resume ID
   * @returns {Promise} - Extracted professional profile
   */
  extractProfile: async (resumeId) => {
    const response = await api.get(endpoints.RESUME.EXTRACT_PROFILE(resumeId));
    return response.data;
  },
  
  /**
   * Generate section content
   * @param {Object} sectionData - Section data
   * @param {string} sectionData.type - Section type (summary, experience, etc.)
   * @param {Object} sectionData.content - Section content hints
   * @returns {Promise} - Generated section content
   */
  generateSectionContent: async (sectionData) => {
    const response = await api.post(endpoints.RESUME.GENERATE_SECTION, sectionData);
    return response.data;
  },
  
  /**
   * Get resume sections
   * @param {string} resumeId - Resume ID
   * @returns {Promise} - Resume sections
   */
  getResumeSections: async (resumeId) => {
    const response = await api.get(endpoints.RESUME.GET_SECTIONS(resumeId));
    return response.data;
  },
  
  /**
   * Update resume section
   * @param {string} resumeId - Resume ID
   * @param {string} sectionId - Section ID
   * @param {Object} sectionData - Section data
   * @returns {Promise} - Updated section
   */
  updateResumeSection: async (resumeId, sectionId, sectionData) => {
    const response = await api.put(endpoints.RESUME.UPDATE_SECTION(resumeId, sectionId), sectionData);
    return response.data;
  },
  
  /**
   * Get NLP-based resume suggestions
   * @param {string} resumeId - Resume ID
   * @returns {Promise} - NLP suggestions
   */
  getNLPSuggestions: async (resumeId) => {
    const response = await api.get(endpoints.RESUME.GET_NLP_SUGGESTIONS(resumeId));
    return response.data;
  },
  
  /**
   * Import profile from LinkedIn
   * @param {Object} linkedInData - LinkedIn profile data
   * @returns {Promise} - Imported resume data
   */
  importFromLinkedIn: async (linkedInData) => {
    const response = await api.post(endpoints.RESUME.IMPORT_FROM_LINKEDIN, linkedInData);
    return response.data;
  },
  
  /**
   * Check resume quality score
   * @param {string} resumeId - Resume ID
   * @returns {Promise} - Quality score and recommendations
   */
  checkResumeQuality: async (resumeId) => {
    const response = await api.get(endpoints.RESUME.CHECK_QUALITY(resumeId));
    return response.data;
  }
};

//==============================================================================
// ASSESSMENT API
//==============================================================================
export const assessmentApi = {
  /**
   * Get all user assessments
   * @returns {Promise} - List of assessments
   */
  getAllAssessments: async () => {
    const response = await api.get(endpoints.ASSESSMENT.GET_ALL);
    return response.data;
  },
  
  /**
   * Get assessment by ID
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise} - Assessment details
   */
  getAssessmentById: async (assessmentId) => {
    const response = await api.get(endpoints.ASSESSMENT.GET_BY_ID(assessmentId));
    return response.data;
  },
  
  /**
   * Start new assessment
   * @param {string} assessmentType - Assessment type (personality, skills, career-fit, etc.)
   * @returns {Promise} - New assessment session
   */
  startAssessment: async (assessmentType) => {
    const response = await api.post(endpoints.ASSESSMENT.START(assessmentType));
    return response.data;
  },
  
  /**
   * Submit assessment answers
   * @param {string} assessmentId - Assessment ID
   * @param {Object} answers - Assessment answers
   * @returns {Promise} - Submission result
   */
  submitAnswers: async (assessmentId, answers) => {
    const response = await api.post(endpoints.ASSESSMENT.SUBMIT_ANSWERS(assessmentId), { answers });
    return response.data;
  },
  
  /**
   * Get assessment results
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise} - Assessment results
   */
  getResults: async (assessmentId) => {
    const response = await api.get(endpoints.ASSESSMENT.GET_RESULTS(assessmentId));
    return response.data;
  },
  
  /**
   * Get assessment questions
   * @param {string} assessmentType - Assessment type
   * @returns {Promise} - Assessment questions
   */
  getQuestions: async (assessmentType) => {
    const response = await api.get(endpoints.ASSESSMENT.GET_QUESTIONS(assessmentType));
    return response.data;
  },
  
  /**
   * Get personality assessment
   * @returns {Promise} - Personality assessment data
   */
  getPersonalityAssessment: async () => {
    const response = await api.get(endpoints.ASSESSMENT.GET_PERSONALITY);
    return response.data;
  },
  
  /**
   * Get skills assessment
   * @returns {Promise} - Skills assessment data
   */
  getSkillsAssessment: async () => {
    const response = await api.get(endpoints.ASSESSMENT.GET_SKILLS);
    return response.data;
  },
  
  /**
   * Get career fit assessment
   * @returns {Promise} - Career fit assessment data
   */
  getCareerFitAssessment: async () => {
    const response = await api.get(endpoints.ASSESSMENT.GET_CAREER_FIT);
    return response.data;
  },
  
  /**
   * Get assessment progress
   * @returns {Promise} - Assessment progress data
   */
  getProgress: async () => {
    const response = await api.get(endpoints.ASSESSMENT.GET_PROGRESS);
    return response.data;
  },
  
  /**
   * Generate assessment report
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise} - Assessment report
   */
  generateReport: async (assessmentId) => {
    const response = await api.get(endpoints.ASSESSMENT.GENERATE_REPORT(assessmentId));
    return response.data;
  }
};

//==============================================================================
// CAREER PATH API
//==============================================================================
export const careerApi = {
  /**
   * Get available career paths
   * @param {Object} filters - Optional filters
   * @returns {Promise} - Response with career paths
   */
  getPaths: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `${endpoints.CAREER.GET_PATHS}?${queryParams}` : endpoints.CAREER.GET_PATHS;
    const response = await api.get(url);
    return response.data;
  },
  
  /**
   * Get career path details
   * @param {string} pathId - Career path ID
   * @returns {Promise} - Response with path details
   */
  getPathDetails: async (pathId) => {
    const response = await api.get(endpoints.CAREER.PATH_DETAILS(pathId));
    return response.data;
  },
  
  /**
   * Get similar roles to a specific role
   * @param {string} role - Job role
   * @returns {Promise} - Response with similar roles
   */
  getSimilarRoles: async (role) => {
    const response = await api.get(endpoints.CAREER.SIMILAR_ROLES(role));
    return response.data;
  },
  
  /**
   * Analyze skill gaps for a target role
   * @param {string} targetRole - Target job role
   * @param {string} resumeId - Optional resume ID for comparison
   * @returns {Promise} - Response with skill gap analysis
   */
  analyzeSkillGap: async (targetRole, resumeId = null) => {
    const url = resumeId 
      ? `${endpoints.CAREER.SKILL_GAP_ANALYSIS}?target_role=${targetRole}&resume_id=${resumeId}`
      : `${endpoints.CAREER.SKILL_GAP_ANALYSIS}?target_role=${targetRole}`;
    
    const response = await api.get(url);
    return response.data;
  },
  
  /**
   * Get career growth trajectory
   * @param {string} role - Job role
   * @returns {Promise} - Response with growth trajectory
   */
  getGrowthTrajectory: async (role) => {
    const response = await api.get(endpoints.CAREER.GROWTH_TRAJECTORY(role));
    return response.data;
  },
  
  /**
   * Get recommended career paths based on user profile
   * @returns {Promise} - Response with recommended paths
   */
  getRecommendedPaths: async () => {
    const response = await api.get(endpoints.CAREER.RECOMMENDED_PATHS);
    return response.data;
  },
  
  /**
   * Get education requirements for a role
   * @param {string} role - Job role
   * @returns {Promise} - Response with education requirements
   */
  getEducationRequirements: async (role) => {
    const response = await api.get(endpoints.CAREER.EDUCATION_REQUIREMENTS(role));
    return response.data;
  },
  
  /**
   * Get industry trends
   * @param {string} industry - Industry name
   * @returns {Promise} - Response with industry trends
   */
  getIndustryTrends: async (industry) => {
    const response = await api.get(endpoints.CAREER.INDUSTRY_TRENDS(industry));
    return response.data;
  },
  
  /**
   * Get salary insights for a role
   * @param {string} role - Job role
   * @param {string} location - Optional location
   * @returns {Promise} - Response with salary insights
   */
  getSalaryInsights: async (role, location = null) => {
    const url = location 
      ? `${endpoints.CAREER.SALARY_INSIGHTS(role)}&location=${location}`
      : endpoints.CAREER.SALARY_INSIGHTS(role);
    
    const response = await api.get(url);
    return response.data;
  },
  
  /**
   * Get personalized career guidance
   * @param {Object} userData - User profile data or ID
   * @returns {Promise} - Personalized guidance recommendations
   */
  getPersonalizedGuidance: async (userData) => {
    const response = await api.post(endpoints.CAREER.GET_PERSONALIZED_GUIDANCE, userData);
    return response.data;
  },
  
  /**
   * Visualize career path
   * @param {string} pathId - Career path ID
   * @param {Object} options - Visualization options
   * @returns {Promise} - Path visualization data
   */
  visualizeCareerPath: async (pathId, options = {}) => {
    const response = await api.get(endpoints.CAREER.VISUALIZE_PATH(pathId), { params: options });
    return response.data;
  },
  
  /**
   * Generate career plan
   * @param {Object} planningData - Career planning parameters
   * @returns {Promise} - Career plan
   */
  generateCareerPlan: async (planningData) => {
    const response = await api.post(endpoints.CAREER.GENERATE_PLAN, planningData);
    return response.data;
  },
  
  /**
   * Get industry insights
   * @param {string} industry - Industry name
   * @returns {Promise} - Industry insights
   */
  getIndustryInsights: async (industry) => {
    const response = await api.get(endpoints.CAREER.GET_INDUSTRY_INSIGHTS(industry));
    return response.data;
  },
  
  /**
   * Get career transitions
   * @param {string} currentRole - Current role
   * @returns {Promise} - Possible career transitions
   */
  getCareerTransitions: async (currentRole) => {
    const response = await api.get(endpoints.CAREER.GET_TRANSITIONS(currentRole));
    return response.data;
  },
  
  /**
   * Get role requirements
   * @param {string} roleId - Role ID
   * @returns {Promise} - Role requirements
   */
  getRoleRequirements: async (roleId) => {
    const response = await api.get(endpoints.CAREER.GET_ROLE_REQUIREMENTS(roleId));
    return response.data;
  },
  
  /**
   * Get growth trajectory
   * @param {string} roleId - Role ID
   * @param {Object} options - Trajectory options
   * @returns {Promise} - Growth trajectory data
   */
  getGrowthTrajectory: async (roleId, options = {}) => {
    const response = await api.get(endpoints.CAREER.GET_GROWTH_TRAJECTORY(roleId), { params: options });
    return response.data;
  },
  
  /**
   * Get market demand forecast
   * @param {string} skill - Skill name or ID
   * @param {Object} options - Forecast options
   * @returns {Promise} - Market demand forecast
   */
  getMarketDemandForecast: async (skill, options = {}) => {
    const response = await api.get(endpoints.CAREER.GET_MARKET_DEMAND(skill), { params: options });
    return response.data;
  },
  
  /**
   * Get career intelligence insights
   * @param {Object} parameters - Analysis parameters
   * @returns {Promise} - Career intelligence insights
   */
  getCareerIntelligence: async (parameters = {}) => {
    const response = await api.post(endpoints.CAREER.GET_INTELLIGENCE_INSIGHTS, parameters);
    return response.data;
  },
  
  /**
   * Compare career paths
   * @param {Array} pathIds - Array of path IDs to compare
   * @returns {Promise} - Comparison results
   */
  compareCareerPaths: async (pathIds) => {
    const response = await api.post(endpoints.CAREER.COMPARE_PATHS, { pathIds });
    return response.data;
  },
  
  /**
   * Get career milestones
   * @param {string} pathId - Career path ID
   * @returns {Promise} - Career milestones
   */
  getCareerMilestones: async (pathId) => {
    const response = await api.get(endpoints.CAREER.GET_MILESTONES(pathId));
    return response.data;
  },
  
  /**
   * Generate development plan
   * @param {Object} planData - Development plan data
   * @returns {Promise} - Development plan
   */
  generateDevelopmentPlan: async (planData) => {
    const response = await api.post(endpoints.CAREER.GENERATE_DEVELOPMENT_PLAN, planData);
    return response.data;
  }
};

//==============================================================================
// JOB API
//==============================================================================
export const jobApi = {
  /**
   * Search for jobs
   * @param {Object} params - Search parameters
   * @returns {Promise} - Response with search results
   */
  search: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const url = queryParams ? `${endpoints.JOB.SEARCH}?${queryParams}` : endpoints.JOB.SEARCH;
    
    const response = await api.get(url);
    return response.data;
  },
  
  /**
   * Get job details by ID
   * @param {string} jobId - Job ID
   * @returns {Promise} - Response with job details
   */
  getById: async (jobId) => {
    const response = await api.get(endpoints.JOB.GET_BY_ID(jobId));
    return response.data;
  },
  
  /**
   * Get job recommendations for user
   * @returns {Promise} - Response with recommended jobs
   */
  getRecommendations: async () => {
    const response = await api.get(endpoints.JOB.GET_RECOMMENDATIONS);
    return response.data;
  },
  
  /**
   * Save a job to favorites
   * @param {string} jobId - Job ID
   * @returns {Promise} - Response with save status
   */
  saveJob: async (jobId) => {
    const response = await api.post(endpoints.JOB.SAVE_JOB(jobId));
    return response.data;
  },
  
  /**
   * Unsave a job from favorites
   * @param {string} jobId - Job ID
   * @returns {Promise} - Response with unsave status
   */
  unsaveJob: async (jobId) => {
    const response = await api.delete(endpoints.JOB.UNSAVE_JOB(jobId));
    return response.data;
  },
  
  /**
   * Get user's saved jobs
   * @returns {Promise} - Response with saved jobs
   */
  getSavedJobs: async () => {
    const response = await api.get(endpoints.JOB.GET_SAVED_JOBS);
    return response.data;
  },
  
  /**
   * Match resume to job
   * @param {string} resumeId - Resume ID
   * @param {string} jobId - Job ID
   * @returns {Promise} - Response with match score and details
   */
  matchResume: async (resumeId, jobId) => {
    const response = await api.get(endpoints.JOB.MATCH_RESUME(resumeId, jobId));
    return response.data;
  },
  
  /**
   * Apply to a job
   * @param {string} jobId - Job ID
   * @param {Object} applicationData - Application data
   * @returns {Promise} - Response with application status
   */
  applyToJob: async (jobId, applicationData) => {
    const response = await api.post(endpoints.JOB.APPLY(jobId), applicationData);
    return response.data;
  },
  
  /**
   * Get user's job applications
   * @param {Object} filters - Optional filters
   * @returns {Promise} - Response with applications
   */
  getApplications: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `${endpoints.JOB.GET_APPLICATIONS}?${queryParams}` : endpoints.JOB.GET_APPLICATIONS;
    
    const response = await api.get(url);
    return response.data;
  },
  
  /**
   * Get application details
   * @param {string} applicationId - Application ID
   * @returns {Promise} - Response with application details
   */
  getApplication: async (applicationId) => {
    const response = await api.get(endpoints.JOB.GET_APPLICATION(applicationId));
    return response.data;
  },
  
  /**
   * Update application
   * @param {string} applicationId - Application ID
   * @param {Object} data - Updated application data
   * @returns {Promise} - Response with updated application
   */
  updateApplication: async (applicationId, data) => {
    const response = await api.put(endpoints.JOB.UPDATE_APPLICATION(applicationId), data);
    return response.data;
  },
  
  /**
   * Withdraw application
   * @param {string} applicationId - Application ID
   * @returns {Promise} - Withdrawal result
   */
  withdrawApplication: async (applicationId) => {
    const response = await api.post(endpoints.JOB.WITHDRAW_APPLICATION(applicationId));
    return response.data;
  },
  
  /**
   * Get application status
   * @param {string} applicationId - Application ID
   * @returns {Promise} - Application status
   */
  getApplicationStatus: async (applicationId) => {
    const response = await api.get(endpoints.JOB.GET_APPLICATION_STATUS(applicationId));
    return response.data;
  },
  
  /**
   * Analyze job description
   * @param {string} description - Job description text
   * @returns {Promise} - Analysis results
   */
  analyzeJobDescription: async (description) => {
    const response = await api.post(endpoints.JOB.ANALYZE_JOB_DESCRIPTION, { description });
    return response.data;
  },
  
  /**
   * Get company details
   * @param {string} companyId - Company ID
   * @returns {Promise} - Company details
   */
  getCompanyDetails: async (companyId) => {
    const response = await api.get(endpoints.JOB.GET_COMPANY_DETAILS(companyId));
    return response.data;
  },
  
  /**
   * Get similar jobs
   * @param {string} jobId - Job ID
   * @returns {Promise} - Similar jobs
   */
  getSimilarJobs: async (jobId) => {
    const response = await api.get(endpoints.JOB.GET_SIMILAR_JOBS(jobId));
    return response.data;
  },
  
  /**
   * Automate job application
   * @param {Object} automationData - Automation data
   * @param {string} automationData.resumeId - Resume ID to use
   * @param {string} automationData.jobId - Job ID to apply for
   * @param {Object} automationData.customizations - Application customizations
   * @returns {Promise} - Automation result
   */
  automateApplication: async (automationData) => {
    const response = await api.post(endpoints.JOB.AUTOMATE_APPLICATION, automationData);
    return response.data;
  },
  
  /**
   * Get job market insights
   * @param {Object} filters - Market filters
   * @returns {Promise} - Job market insights
   */
  getMarketInsights: async (filters = {}) => {
    const response = await api.get(endpoints.JOB.GET_MARKET_INSIGHTS, { params: filters });
    return response.data;
  },
  
  /**
   * Get personalized job recommendations
   * @param {Object} preferences - Job preferences
   * @returns {Promise} - Job recommendations
   */
  getPersonalizedRecommendations: async (preferences = {}) => {
    const response = await api.post(endpoints.JOB.GET_PERSONALIZED_RECOMMENDATIONS, preferences);
    return response.data;
  },
  
  /**
   * Set up job alerts
   * @param {Object} alertData - Job alert settings
   * @returns {Promise} - Job alert configuration
   */
  setupJobAlerts: async (alertData) => {
    const response = await api.post(endpoints.JOB.SETUP_ALERTS, alertData);
    return response.data;
  },
  
  /**
   * Get job alerts
   * @returns {Promise} - User's job alerts
   */
  getJobAlerts: async () => {
    const response = await api.get(endpoints.JOB.GET_ALERTS);
    return response.data;
  },
  
  /**
   * Update job alert
   * @param {string} alertId - Alert ID
   * @param {Object} alertData - Updated alert data
   * @returns {Promise} - Updated job alert
   */
  updateJobAlert: async (alertId, alertData) => {
    const response = await api.put(endpoints.JOB.UPDATE_ALERT(alertId), alertData);
    return response.data;
  },
  
  /**
   * Delete job alert
   * @param {string} alertId - Alert ID
   * @returns {Promise} - Deletion result
   */
  deleteJobAlert: async (alertId) => {
    const response = await api.delete(endpoints.JOB.DELETE_ALERT(alertId));
    return response.data;
  },
  
  /**
   * Get application workflow
   * @param {string} applicationId - Application ID
   * @returns {Promise} - Application workflow
   */
  getApplicationWorkflow: async (applicationId) => {
    const response = await api.get(endpoints.JOB.GET_APPLICATION_WORKFLOW(applicationId));
    return response.data;
  },
  
  /**
   * Update application stage
   * @param {string} applicationId - Application ID
   * @param {Object} stageData - Stage update data
   * @returns {Promise} - Updated application
   */
  updateApplicationStage: async (applicationId, stageData) => {
    const response = await api.put(endpoints.JOB.UPDATE_APPLICATION_STAGE(applicationId), stageData);
    return response.data;
  },
  
  /**
   * Batch apply to jobs
   * @param {Object} batchData - Batch application data
   * @returns {Promise} - Batch application results
   */
  batchApplyToJobs: async (batchData) => {
    const response = await api.post(endpoints.JOB.BATCH_APPLY, batchData);
    return response.data;
  },
  
  /**
   * Get job matching score
   * @param {string} jobId - Job ID
   * @param {string} resumeId - Resume ID
   * @returns {Promise} - Matching score and details
   */
  getJobMatchingScore: async (jobId, resumeId) => {
    const response = await api.get(endpoints.JOB.GET_MATCHING_SCORE(jobId, resumeId));
    return response.data;
  },
  
  /**
   * Get trending jobs
   * @param {Object} filters - Trend filters
   * @returns {Promise} - Trending jobs
   */
  getTrendingJobs: async (filters = {}) => {
    const response = await api.get(endpoints.JOB.GET_TRENDING, { params: filters });
    return response.data;
  },
  
  /**
   * Get application insights
   * @returns {Promise} - User's application insights
   */
  getApplicationInsights: async () => {
    const response = await api.get(endpoints.JOB.GET_APPLICATION_INSIGHTS);
    return response.data;
  }
};

//==============================================================================
// INTERVIEW API
//==============================================================================
export const interviewApi = {
  /**
   * Get interview questions
   * @param {Object} filters - Question filters
   * @returns {Promise} - Interview questions
   */
  getQuestions: async (filters = {}) => {
    const response = await api.get(endpoints.INTERVIEW.GET_QUESTIONS, { params: filters });
    return response.data;
  },
  
  /**
   * Get job-specific interview questions
   * @param {string} jobId - Job ID
   * @returns {Promise} - Job-specific questions
   */
  getQuestionsByJob: async (jobId) => {
    const response = await api.get(endpoints.INTERVIEW.GET_BY_JOB(jobId));
    return response.data;
  },
  
  /**
   * Submit interview answer
   * @param {Object} answerData - Answer data
   * @returns {Promise} - Submission result
   */
  submitAnswer: async (answerData) => {
    const response = await api.post(endpoints.INTERVIEW.SUBMIT_ANSWER, answerData);
    return response.data;
  },
  
  /**
   * Get interview feedback
   * @param {string} interviewId - Interview ID
   * @returns {Promise} - Interview feedback
   */
  getFeedback: async (interviewId) => {
    const response = await api.get(endpoints.INTERVIEW.GET_FEEDBACK(interviewId));
    return response.data;
  },
  
  /**
   * Start mock interview
   * @param {Object} mockData - Mock interview setup data
   * @returns {Promise} - Mock interview session
   */
  startMockInterview: async (mockData) => {
    const response = await api.post(endpoints.INTERVIEW.START_MOCK, mockData);
    return response.data;
  },
  
  /**
   * Get mock interview sessions
   * @returns {Promise} - Mock interview sessions
   */
  getMockSessions: async () => {
    const response = await api.get(endpoints.INTERVIEW.GET_MOCK_SESSIONS);
    return response.data;
  },
  
  /**
   * Get mock interview session details
   * @param {string} sessionId - Session ID
   * @returns {Promise} - Session details
   */
  getMockSession: async (sessionId) => {
    const response = await api.get(endpoints.INTERVIEW.GET_MOCK_SESSION(sessionId));
    return response.data;
  },
  
  /**
   * Get interview assessment
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise} - Interview assessment
   */
  getInterviewAssessment: async (assessmentId) => {
    const response = await api.get(endpoints.INTERVIEW.GET_ASSESSMENT(assessmentId));
    return response.data;
  },
  
  /**
   * Generate interview answers
   * @param {Object} questionData - Question data
   * @returns {Promise} - Generated answers
   */
  generateAnswers: async (questionData) => {
    const response = await api.post(endpoints.INTERVIEW.GENERATE_ANSWERS, questionData);
    return response.data;
  },
  
  /**
   * Analyze interview response
   * @param {Object} responseData - Response data
   * @returns {Promise} - Analysis results
   */
  analyzeResponse: async (responseData) => {
    const response = await api.post(endpoints.INTERVIEW.ANALYZE_RESPONSE, responseData);
    return response.data;
  },
  
  /**
   * Get common interview questions by category
   * @param {string} category - Question category
   * @returns {Promise} - Common questions
   */
  getCommonQuestions: async (category) => {
    const response = await api.get(endpoints.INTERVIEW.GET_COMMON_QUESTIONS(category));
    return response.data;
  },
  
  /**
   * Get interview tips
   * @returns {Promise} - Interview tips
   */
  getTips: async () => {
    const response = await api.get(endpoints.INTERVIEW.GET_TIPS);
    return response.data;
  },
  
  /**
   * Start a mock interview session
   * @param {Object} sessionConfig - Interview session configuration
   * @param {string} sessionConfig.type - Interview type (behavioral, technical, etc.)
   * @param {string} sessionConfig.role - Target job role
   * @param {Object} sessionConfig.settings - Interview settings
   * @returns {Promise} - Started interview session
   */
  startMockInterview: async (sessionConfig) => {
    const response = await api.post(endpoints.INTERVIEW.START_MOCK_SESSION, sessionConfig);
    return response.data;
  },

  /**
   * Get next interview question
   * @param {string} sessionId - Interview session ID
   * @returns {Promise} - Next question data
   */
  getNextQuestion: async (sessionId) => {
    const response = await api.get(endpoints.INTERVIEW.GET_NEXT_QUESTION(sessionId));
    return response.data;
  },

  /**
   * Submit answer to interview question
   * @param {string} sessionId - Interview session ID
   * @param {Object} answerData - Answer data
   * @returns {Promise} - Feedback on answer
   */
  submitAnswer: async (sessionId, answerData) => {
    const response = await api.post(endpoints.INTERVIEW.SUBMIT_ANSWER(sessionId), answerData);
    return response.data;
  },

  /**
   * End interview session
   * @param {string} sessionId - Interview session ID
   * @returns {Promise} - Session summary
   */
  endInterview: async (sessionId) => {
    const response = await api.post(endpoints.INTERVIEW.END_SESSION(sessionId));
    return response.data;
  },

  /**
   * Get interview feedback
   * @param {string} sessionId - Interview session ID
   * @returns {Promise} - Detailed interview feedback
   */
  getInterviewFeedback: async (sessionId) => {
    const response = await api.get(endpoints.INTERVIEW.GET_FEEDBACK(sessionId));
    return response.data;
  },

  /**
   * Get interview history
   * @returns {Promise} - User's interview history
   */
  getInterviewHistory: async () => {
    const response = await api.get(endpoints.INTERVIEW.GET_HISTORY);
    return response.data;
  },

  /**
   * Schedule mock interview with AI
   * @param {Object} scheduleData - Interview scheduling data
   * @returns {Promise} - Scheduled interview details
   */
  scheduleAIMockInterview: async (scheduleData) => {
    const response = await api.post(endpoints.INTERVIEW.SCHEDULE_AI_INTERVIEW, scheduleData);
    return response.data;
  },

  /**
   * Get interview performance metrics
   * @param {string} sessionId - Interview session ID (optional)
   * @returns {Promise} - Performance metrics
   */
  getPerformanceMetrics: async (sessionId = null) => {
    const url = sessionId 
      ? `${endpoints.INTERVIEW.GET_PERFORMANCE_METRICS}?sessionId=${sessionId}`
      : endpoints.INTERVIEW.GET_PERFORMANCE_METRICS;
      
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get suggested improvements
   * @param {string} sessionId - Interview session ID
   * @returns {Promise} - Suggested improvements
   */
  getSuggestedImprovements: async (sessionId) => {
    const response = await api.get(endpoints.INTERVIEW.GET_IMPROVEMENTS(sessionId));
    return response.data;
  },

  /**
   * Get interview with specialized panel
   * @param {Object} panelConfig - Panel configuration
   * @returns {Promise} - Panel interview session
   */
  getSpecializedPanel: async (panelConfig) => {
    const response = await api.post(endpoints.INTERVIEW.GET_SPECIALIZED_PANEL, panelConfig);
    return response.data;
  },

  /**
   * Get interview transcription
   * @param {string} sessionId - Interview session ID
   * @returns {Promise} - Interview transcription
   */
  getTranscription: async (sessionId) => {
    const response = await api.get(endpoints.INTERVIEW.GET_TRANSCRIPTION(sessionId));
    return response.data;
  },

  /**
   * Get company-specific interview questions
   * @param {string} companyName - Company name
   * @returns {Promise} - Company-specific questions
   */
  getCompanySpecificQuestions: async (companyName) => {
    const response = await api.get(endpoints.INTERVIEW.GET_COMPANY_QUESTIONS(companyName));
    return response.data;
  },

  /**
   * Generate interview report
   * @param {string} sessionId - Interview session ID
   * @param {Object} options - Report options
   * @returns {Promise} - Interview report
   */
  generateInterviewReport: async (sessionId, options = {}) => {
    const response = await api.post(endpoints.INTERVIEW.GENERATE_REPORT(sessionId), options);
    return response.data;
  },

  /**
   * Get enhanced interview session
   * @param {Object} enhancedConfig - Enhanced interview configuration
   * @returns {Promise} - Enhanced interview session
   */
  getEnhancedInterview: async (enhancedConfig) => {
    const response = await api.post(endpoints.INTERVIEW.GET_ENHANCED_SESSION, enhancedConfig);
    return response.data;
  }
};

//==============================================================================
// LEARNING API
//==============================================================================
export const learningApi = {
  /**
   * Get courses
   * @param {Object} filters - Course filters
   * @returns {Promise} - Courses list
   */
  getCourses: async (filters = {}) => {
    const response = await api.get(endpoints.LEARNING.GET_COURSES, { params: filters });
    return response.data;
  },
  
  /**
   * Get course details
   * @param {string} courseId - Course ID
   * @returns {Promise} - Course details
   */
  getCourse: async (courseId) => {
    const response = await api.get(endpoints.LEARNING.GET_COURSE(courseId));
    return response.data;
  },
  
  /**
   * Enroll in course
   * @param {string} courseId - Course ID
   * @returns {Promise} - Enrollment result
   */
  enrollCourse: async (courseId) => {
    const response = await api.post(endpoints.LEARNING.ENROLL(courseId));
    return response.data;
  },
  
  /**
   * Get enrolled courses
   * @returns {Promise} - Enrolled courses
   */
  getEnrolledCourses: async () => {
    const response = await api.get(endpoints.LEARNING.GET_ENROLLED_COURSES);
    return response.data;
  },
  
  /**
   * Get course progress
   * @param {string} courseId - Course ID
   * @returns {Promise} - Course progress
   */
  getCourseProgress: async (courseId) => {
    const response = await api.get(endpoints.LEARNING.GET_PROGRESS(courseId));
    return response.data;
  },
  
  /**
   * Mark module as complete
   * @param {string} courseId - Course ID
   * @param {string} moduleId - Module ID
   * @returns {Promise} - Completion result
   */
  markModuleComplete: async (courseId, moduleId) => {
    const response = await api.post(endpoints.LEARNING.MARK_COMPLETE(courseId, moduleId));
    return response.data;
  },
  
  /**
   * Get course recommendations
   * @returns {Promise} - Course recommendations
   */
  getCourseRecommendations: async () => {
    const response = await api.get(endpoints.LEARNING.GET_RECOMMENDATIONS);
    return response.data;
  },
  
  /**
   * Get certificates
   * @returns {Promise} - User certificates
   */
  getCertificates: async () => {
    const response = await api.get(endpoints.LEARNING.GET_CERTIFICATES);
    return response.data;
  },
  
  /**
   * Download certificate
   * @param {string} certificateId - Certificate ID
   * @returns {Promise} - Certificate file
   */
  downloadCertificate: async (certificateId) => {
    const response = await api.get(endpoints.LEARNING.DOWNLOAD_CERTIFICATE(certificateId), {
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Get courses by skill
   * @param {string} skillId - Skill ID
   * @returns {Promise} - Skill-specific courses
   */
  getSkillCourses: async (skillId) => {
    const response = await api.get(endpoints.LEARNING.GET_SKILL_COURSES(skillId));
    return response.data;
  },
  
  /**
   * Get learning paths
   * @returns {Promise} - Learning paths
   */
  getLearningPaths: async () => {
    const response = await api.get(endpoints.LEARNING.GET_LEARNING_PATHS);
    return response.data;
  },
  
  /**
   * Get learning path details
   * @param {string} pathId - Learning path ID
   * @returns {Promise} - Learning path details
   */
  getLearningPath: async (pathId) => {
    const response = await api.get(endpoints.LEARNING.GET_LEARNING_PATH(pathId));
    return response.data;
  }
};

//==============================================================================
// NETWORKING API
//==============================================================================
export const networkingApi = {
  /**
   * Get connections
   * @returns {Promise} - User connections
   */
  getConnections: async () => {
    const response = await api.get(endpoints.NETWORKING.GET_CONNECTIONS);
    return response.data;
  },
  
  /**
   * Send connection request
   * @param {Object} requestData - Connection request data
   * @returns {Promise} - Request result
   */
  sendConnectionRequest: async (requestData) => {
    const response = await api.post(endpoints.NETWORKING.SEND_CONNECTION_REQUEST, requestData);
    return response.data;
  },
  
  /**
   * Get connection requests
   * @returns {Promise} - Connection requests
   */
  getConnectionRequests: async () => {
    const response = await api.get(endpoints.NETWORKING.GET_CONNECTION_REQUESTS);
    return response.data;
  },
  
  /**
   * Respond to connection request
   * @param {string} requestId - Request ID
   * @param {Object} responseData - Response data
   * @returns {Promise} - Response result
   */
  respondToRequest: async (requestId, responseData) => {
    const response = await api.post(endpoints.NETWORKING.RESPOND_TO_REQUEST(requestId), responseData);
    return response.data;
  },
  
  /**
   * Get suggested connections
   * @returns {Promise} - Suggested connections
   */
  getSuggestedConnections: async () => {
    const response = await api.get(endpoints.NETWORKING.GET_SUGGESTED_CONNECTIONS);
    return response.data;
  },
  
  /**
   * Get networking events
   * @returns {Promise} - Networking events
   */
  getEvents: async () => {
    const response = await api.get(endpoints.NETWORKING.GET_EVENTS);
    return response.data;
  },
  
  /**
   * Get event details
   * @param {string} eventId - Event ID
   * @returns {Promise} - Event details
   */
  getEvent: async (eventId) => {
    const response = await api.get(endpoints.NETWORKING.GET_EVENT(eventId));
    return response.data;
  },
  
  /**
   * Register for event
   * @param {string} eventId - Event ID
   * @returns {Promise} - Registration result
   */
  registerForEvent: async (eventId) => {
    const response = await api.post(endpoints.NETWORKING.REGISTER_FOR_EVENT(eventId));
    return response.data;
  },
  
  /**
   * Get mentors
   * @returns {Promise} - Available mentors
   */
  getMentors: async () => {
    const response = await api.get(endpoints.NETWORKING.GET_MENTORS);
    return response.data;
  },
  
  /**
   * Request mentorship
   * @param {string} mentorId - Mentor ID
   * @param {Object} requestData - Mentorship request data
   * @returns {Promise} - Request result
   */
  requestMentorship: async (mentorId, requestData) => {
    const response = await api.post(endpoints.NETWORKING.REQUEST_MENTORSHIP(mentorId), requestData);
    return response.data;
  },
  
  /**
   * Get communities
   * @returns {Promise} - Professional communities
   */
  getCommunities: async () => {
    const response = await api.get(endpoints.NETWORKING.GET_COMMUNITIES);
    return response.data;
  },
  
  /**
   * Join community
   * @param {string} communityId - Community ID
   * @returns {Promise} - Join result
   */
  joinCommunity: async (communityId) => {
    const response = await api.post(endpoints.NETWORKING.JOIN_COMMUNITY(communityId));
    return response.data;
  }
};

//==============================================================================
// ANALYTICS API
//==============================================================================
export const analyticsApi = {
  /**
   * Get dashboard analytics
   * @returns {Promise} - Dashboard data
   */
  getDashboardAnalytics: async () => {
    const response = await api.get(endpoints.ANALYTICS.GET_DASHBOARD);
    return response.data;
  },
  
  /**
   * Get resume view analytics
   * @returns {Promise} - Resume view data
   */
  getResumeViewAnalytics: async () => {
    const response = await api.get(endpoints.ANALYTICS.GET_RESUME_VIEWS);
    return response.data;
  },
  
  /**
   * Get application metrics
   * @returns {Promise} - Application metrics
   */
  getApplicationMetrics: async () => {
    const response = await api.get(endpoints.ANALYTICS.GET_APPLICATION_METRICS);
    return response.data;
  },
  
  /**
   * Get skill progress analytics
   * @returns {Promise} - Skill progress data
   */
  getSkillProgressAnalytics: async () => {
    const response = await api.get(endpoints.ANALYTICS.GET_SKILL_PROGRESS);
    return response.data;
  },
  
  /**
   * Get career progress analytics
   * @returns {Promise} - Career progress data
   */
  getCareerProgressAnalytics: async () => {
    const response = await api.get(endpoints.ANALYTICS.GET_CAREER_PROGRESS);
    return response.data;
  },
  
  /**
   * Get learning analytics
   * @returns {Promise} - Learning stats
   */
  getLearningAnalytics: async () => {
    const response = await api.get(endpoints.ANALYTICS.GET_LEARNING_STATS);
    return response.data;
  },
  
  /**
   * Get interview performance analytics
   * @returns {Promise} - Interview performance data
   */
  getInterviewPerformanceAnalytics: async () => {
    const response = await api.get(endpoints.ANALYTICS.GET_INTERVIEW_PERFORMANCE);
    return response.data;
  },
  
  /**
   * Generate analytics report
   * @param {string} reportType - Report type
   * @param {Object} options - Report options
   * @returns {Promise} - Generated report
   */
  generateReport: async (reportType, options = {}) => {
    const response = await api.post(endpoints.ANALYTICS.GENERATE_REPORT(reportType), options);
    return response.data;
  },
  
  /**
   * Export analytics data
   * @param {string} dataType - Data type to export
   * @param {Object} options - Export options
   * @returns {Promise} - Exported data
   */
  exportData: async (dataType, options = {}) => {
    const response = await api.post(endpoints.ANALYTICS.EXPORT_DATA(dataType), options, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Get industry benchmarks
   * @returns {Promise} - Benchmark data
   */
  getBenchmarks: async () => {
    const response = await api.get(endpoints.ANALYTICS.GET_BENCHMARKS);
    return response.data;
  },
  
  /**
   * Get career predictions
   * @returns {Promise} - Prediction data
   */
  getPredictions: async () => {
    const response = await api.get(endpoints.ANALYTICS.GET_PREDICTIONS);
    return response.data;
  },
  
  /**
   * Get career progress analytics
   * @param {Object} timeframe - Analysis timeframe
   * @returns {Promise} - Career progress analytics
   */
  getCareerProgressAnalytics: async (timeframe = {}) => {
    const response = await api.get(endpoints.ANALYTICS.CAREER_PROGRESS, { params: timeframe });
    return response.data;
  },
  
  /**
   * Get skill development analytics
   * @param {Object} filters - Analysis filters
   * @returns {Promise} - Skill development analytics
   */
  getSkillDevelopmentAnalytics: async (filters = {}) => {
    const response = await api.get(endpoints.ANALYTICS.SKILL_DEVELOPMENT, { params: filters });
    return response.data;
  },
  
  /**
   * Get job market trends
   * @param {Object} parameters - Trend parameters
   * @returns {Promise} - Job market trends
   */
  getJobMarketTrends: async (parameters = {}) => {
    const response = await api.get(endpoints.ANALYTICS.JOB_MARKET_TRENDS, { params: parameters });
    return response.data;
  },
  
  /**
   * Get application performance analytics
   * @returns {Promise} - Application performance analytics
   */
  getApplicationPerformance: async () => {
    const response = await api.get(endpoints.ANALYTICS.APPLICATION_PERFORMANCE);
    return response.data;
  },
  
  /**
   * Get interview performance analytics
   * @returns {Promise} - Interview performance analytics
   */
  getInterviewPerformance: async () => {
    const response = await api.get(endpoints.ANALYTICS.INTERVIEW_PERFORMANCE);
    return response.data;
  },
  
  /**
   * Get salary insights
   * @param {Object} parameters - Salary parameters
   * @returns {Promise} - Salary insights
   */
  getSalaryInsights: async (parameters = {}) => {
    const response = await api.get(endpoints.ANALYTICS.SALARY_INSIGHTS, { params: parameters });
    return response.data;
  },
  
  /**
   * Get industry comparison
   * @param {Object} industries - Industries to compare
   * @returns {Promise} - Industry comparison
   */
  getIndustryComparison: async (industries = {}) => {
    const response = await api.post(endpoints.ANALYTICS.INDUSTRY_COMPARISON, industries);
    return response.data;
  },
  
  /**
   * Get career path analysis
   * @param {Object} parameters - Analysis parameters
   * @returns {Promise} - Career path analysis
   */
  getCareerPathAnalysis: async (parameters = {}) => {
    const response = await api.get(endpoints.ANALYTICS.CAREER_PATH, { params: parameters });
    return response.data;
  },
  
  /**
   * Generate predictive career forecast
   * @param {Object} parameters - Forecast parameters
   * @returns {Promise} - Career forecast
   */
  generateCareerForecast: async (parameters = {}) => {
    const response = await api.post(endpoints.ANALYTICS.GENERATE_FORECAST, parameters);
    return response.data;
  },
  
  /**
   * Get learning analytics
   * @returns {Promise} - Learning analytics
   */
  getLearningAnalytics: async () => {
    const response = await api.get(endpoints.ANALYTICS.LEARNING);
    return response.data;
  },
  
  /**
   * Get skill gap analysis
   * @param {Object} targetRole - Target role parameters
   * @returns {Promise} - Skill gap analysis
   */
  getSkillGapAnalysis: async (targetRole = {}) => {
    const response = await api.post(endpoints.ANALYTICS.SKILL_GAP, targetRole);
    return response.data;
  },
  
  /**
   * Get custom analytics report
   * @param {Object} reportConfig - Report configuration
   * @returns {Promise} - Custom analytics report
   */
  getCustomAnalyticsReport: async (reportConfig) => {
    const response = await api.post(endpoints.ANALYTICS.CUSTOM_REPORT, reportConfig);
    return response.data;
  }
};

//==============================================================================
// AI TOOLS API
//==============================================================================
export const aiToolsApi = {
  /**
   * Generate cover letter
   * @param {Object} data - Cover letter generation data
   * @returns {Promise} - Generated cover letter
   */
  generateCoverLetter: async (data) => {
    const response = await api.post(endpoints.AI_TOOLS.GENERATE_COVER_LETTER, data);
    return response.data;
  },
  
  /**
   * Customize resume for specific job
   * @param {string} resumeId - Resume ID
   * @param {string} jobId - Job ID
   * @returns {Promise} - Customized resume
   */
  customizeResume: async (resumeId, jobId) => {
    const response = await api.post(endpoints.AI_TOOLS.CUSTOMIZE_RESUME, { resumeId, jobId });
    return response.data;
  },
  
  /**
   * Optimize LinkedIn profile
   * @param {Object} profileData - LinkedIn profile data
   * @returns {Promise} - Optimization suggestions
   */
  optimizeLinkedIn: async (profileData) => {
    const response = await api.post(endpoints.AI_TOOLS.OPTIMIZE_LINKEDIN, profileData);
    return response.data;
  },
  
  /**
   * Analyze job description
   * @param {string} jobDescription - Job description text
   * @returns {Promise} - Analysis results
   */
  analyzeJobDescription: async (jobDescription) => {
    const response = await api.post(endpoints.AI_TOOLS.JOB_DESCRIPTION_ANALYSIS, { jobDescription });
    return response.data;
  },
  
  /**
   * Prepare interview answers
   * @param {Object} preparationData - Interview preparation data
   * @returns {Promise} - Prepared answers
   */
  prepareInterviewAnswers: async (preparationData) => {
    const response = await api.post(endpoints.AI_TOOLS.PREPARE_INTERVIEW_ANSWERS, preparationData);
    return response.data;
  },
  
  /**
   * Generate professional bio
   * @param {Object} bioData - Bio generation data
   * @returns {Promise} - Generated bio
   */
  generateProfessionalBio: async (bioData) => {
    const response = await api.post(endpoints.AI_TOOLS.GENERATE_PROFESSIONAL_BIO, bioData);
    return response.data;
  },
  
  /**
   * Get email templates
   * @param {string} category - Template category
   * @returns {Promise} - Email templates
   */
  getEmailTemplates: async (category) => {
    const response = await api.get(`${endpoints.AI_TOOLS.EMAIL_TEMPLATES}?category=${category}`);
    return response.data;
  },
  
  /**
   * Get skill suggestions
   * @param {Object} userData - User data for suggestions
   * @returns {Promise} - Skill suggestions
   */
  getSkillSuggestions: async (userData) => {
    const response = await api.post(endpoints.AI_TOOLS.SKILLS_SUGGESTIONS, userData);
    return response.data;
  },
  
  /**
   * Analyze feedback
   * @param {string} feedback - Feedback text to analyze
   * @returns {Promise} - Feedback analysis
   */
  analyzeFeedback: async (feedback) => {
    const response = await api.post(endpoints.AI_TOOLS.FEEDBACK_ANALYSIS, { feedback });
    return response.data;
  },
  
  /**
   * Get salary negotiation tips
   * @param {Object} negotiationData - Negotiation context
   * @returns {Promise} - Negotiation tips
   */
  getSalaryNegotiationTips: async (negotiationData) => {
    const response = await api.post(endpoints.AI_TOOLS.SALARY_NEGOTIATION, negotiationData);
    return response.data;
  },
  
  /**
   * Improve personal brand
   * @param {Object} brandData - Personal brand data
   * @returns {Promise} - Brand improvement tips
   */
  improvePersonalBrand: async (brandData) => {
    const response = await api.post(endpoints.AI_TOOLS.PERSONAL_BRAND, brandData);
    return response.data;
  }
};

//==============================================================================
// DOCUMENTS API
//==============================================================================
export const documentsApi = {
  /**
   * Generate resume PDF
   * @param {string} resumeId - Resume ID
   * @returns {Promise} - PDF document
   */
  generateResumePDF: async (resumeId) => {
    const response = await api.get(endpoints.DOCUMENTS.GENERATE_RESUME_PDF(resumeId), {
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Generate cover letter
   * @param {Object} coverLetterData - Cover letter data
   * @returns {Promise} - Generated cover letter
   */
  generateCoverLetter: async (coverLetterData) => {
    const response = await api.post(endpoints.DOCUMENTS.GENERATE_COVER_LETTER, coverLetterData, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Download assessment report
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise} - Assessment report
   */
  downloadAssessmentReport: async (assessmentId) => {
    const response = await api.get(endpoints.DOCUMENTS.DOWNLOAD_ASSESSMENT_REPORT(assessmentId), {
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Generate career report
   * @param {Object} reportOptions - Report options
   * @returns {Promise} - Career report
   */
  generateCareerReport: async (reportOptions) => {
    const response = await api.post(endpoints.DOCUMENTS.GENERATE_CAREER_REPORT, reportOptions, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Download interview feedback
   * @param {string} interviewId - Interview ID
   * @returns {Promise} - Feedback document
   */
  downloadInterviewFeedback: async (interviewId) => {
    const response = await api.get(endpoints.DOCUMENTS.DOWNLOAD_INTERVIEW_FEEDBACK(interviewId), {
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Export portfolio
   * @param {Object} portfolioOptions - Portfolio export options
   * @returns {Promise} - Portfolio document
   */
  exportPortfolio: async (portfolioOptions) => {
    const response = await api.post(endpoints.DOCUMENTS.EXPORT_PORTFOLIO, portfolioOptions, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Generate achievement certificate
   * @param {string} achievementId - Achievement ID
   * @returns {Promise} - Certificate document
   */
  generateAchievementCertificate: async (achievementId) => {
    const response = await api.get(endpoints.DOCUMENTS.GENERATE_ACHIEVEMENT_CERTIFICATE(achievementId), {
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Export application history
   * @param {Object} exportOptions - Export options
   * @returns {Promise} - Application history document
   */
  exportApplicationHistory: async (exportOptions = {}) => {
    const response = await api.post(endpoints.DOCUMENTS.EXPORT_APPLICATION_HISTORY, exportOptions, {
      responseType: 'blob'
    });
    return response.data;
  }
};

//==============================================================================
// FEEDBACK API
//==============================================================================
export const feedbackApi = {
  /**
   * Submit user feedback
   * @param {Object} feedbackData - Feedback data
   * @returns {Promise} - Submission status
   */
  submitFeedback: async (feedbackData) => {
    const response = await api.post(endpoints.FEEDBACK.SUBMIT, feedbackData);
    return response.data;
  },
  
  /**
   * Get user feedback history
   * @returns {Promise} - Feedback history
   */
  getUserFeedback: async () => {
    const response = await api.get(endpoints.FEEDBACK.GET_USER_FEEDBACK);
    return response.data;
  },
  
  /**
   * Submit bug report
   * @param {Object} bugData - Bug report data
   * @returns {Promise} - Submission status
   */
  submitBugReport: async (bugData) => {
    const response = await api.post(endpoints.FEEDBACK.SUBMIT_BUG_REPORT, bugData);
    return response.data;
  },
  
  /**
   * Submit feature request
   * @param {Object} featureData - Feature request data
   * @returns {Promise} - Submission status
   */
  submitFeatureRequest: async (featureData) => {
    const response = await api.post(endpoints.FEEDBACK.FEATURE_REQUEST, featureData);
    return response.data;
  },
  
  /**
   * Rate a feature
   * @param {string} feature - Feature name
   * @param {Object} ratingData - Rating data
   * @returns {Promise} - Rating status
   */
  rateFeature: async (feature, ratingData) => {
    const response = await api.post(endpoints.FEEDBACK.RATE_FEATURE(feature), ratingData);
    return response.data;
  },
  
  /**
   * Get satisfaction survey
   * @returns {Promise} - Satisfaction survey
   */
  getSatisfactionSurvey: async () => {
    const response = await api.get(endpoints.FEEDBACK.GET_SATISFACTION_SURVEY);
    return response.data;
  },
  
  /**
   * Submit survey response
   * @param {Object} surveyData - Survey response data
   * @returns {Promise} - Submission status
   */
  submitSurvey: async (surveyData) => {
    const response = await api.post(endpoints.FEEDBACK.SUBMIT_SURVEY, surveyData);
    return response.data;
  },
  
  /**
   * Generate performance feedback
   * @param {Object} performanceData - Performance data
   * @returns {Promise} - Generated feedback
   */
  generatePerformanceFeedback: async (performanceData) => {
    const response = await api.post(endpoints.FEEDBACK.GENERATE_PERFORMANCE, performanceData);
    return response.data;
  },
  
  /**
   * Generate resume feedback
   * @param {string} resumeId - Resume ID
   * @returns {Promise} - Resume feedback
   */
  generateResumeFeedback: async (resumeId) => {
    const response = await api.get(endpoints.FEEDBACK.GENERATE_RESUME_FEEDBACK(resumeId));
    return response.data;
  },
  
  /**
   * Generate interview answer feedback
   * @param {Object} answerData - Answer data
   * @returns {Promise} - Answer feedback
   */
  generateAnswerFeedback: async (answerData) => {
    const response = await api.post(endpoints.FEEDBACK.GENERATE_ANSWER_FEEDBACK, answerData);
    return response.data;
  },
  
  /**
   * Get feedback analytics
   * @returns {Promise} - Feedback analytics
   */
  getFeedbackAnalytics: async () => {
    const response = await api.get(endpoints.FEEDBACK.GET_ANALYTICS);
    return response.data;
  },
  
  /**
   * Get improvement recommendations
   * @returns {Promise} - Improvement recommendations
   */
  getImprovementRecommendations: async () => {
    const response = await api.get(endpoints.FEEDBACK.GET_RECOMMENDATIONS);
    return response.data;
  }
};

//==============================================================================
// EMOTION ANALYSIS API - Facial and Voice Emotion Detection
//==============================================================================
export const emotionAnalysisApi = {
  /**
   * Analyze facial expressions from image
   * @param {File|Blob} imageData - Image file or blob
   * @returns {Promise} - Facial emotion analysis
   */
  analyzeFacialEmotions: async (imageData) => {
    const formData = new FormData();
    formData.append('image', imageData);
    
    const response = await api.post(endpoints.EMOTION.ANALYZE_FACIAL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  /**
   * Analyze emotions from voice recording
   * @param {File|Blob} audioData - Audio file or blob
   * @returns {Promise} - Voice emotion analysis
   */
  analyzeVoiceEmotions: async (audioData) => {
    const formData = new FormData();
    formData.append('audio', audioData);
    
    const response = await api.post(endpoints.EMOTION.ANALYZE_VOICE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  /**
   * Start real-time emotion detection session
   * @param {Object} sessionConfig - Session configuration
   * @returns {Promise} - Session token and configuration
   */
  startRealtimeDetection: async (sessionConfig) => {
    const response = await api.post(endpoints.EMOTION.START_REALTIME, sessionConfig);
    return response.data;
  },
  
  /**
   * Send frame for real-time emotion analysis
   * @param {string} sessionToken - Session token
   * @param {File|Blob} frameData - Video frame as image
   * @returns {Promise} - Frame analysis
   */
  sendFrame: async (sessionToken, frameData) => {
    const formData = new FormData();
    formData.append('frame', frameData);
    
    const response = await api.post(endpoints.EMOTION.SEND_FRAME(sessionToken), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  /**
   * End real-time emotion detection session
   * @param {string} sessionToken - Session token
   * @returns {Promise} - Session summary
   */
  endRealtimeDetection: async (sessionToken) => {
    const response = await api.post(endpoints.EMOTION.END_REALTIME(sessionToken));
    return response.data;
  },
  
  /**
   * Analyze both facial and voice emotions
   * @param {Object} data - Analysis data
   * @param {File|Blob} data.video - Video file or blob
   * @param {File|Blob} data.audio - Audio file or blob (optional if in video)
   * @returns {Promise} - Combined emotion analysis
   */
  analyzeCombinedEmotions: async (data) => {
    const formData = new FormData();
    formData.append('video', data.video);
    if (data.audio) {
      formData.append('audio', data.audio);
    }
    
    const response = await api.post(endpoints.EMOTION.ANALYZE_COMBINED, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  /**
   * Get emotion analysis history
   * @returns {Promise} - Emotion analysis history
   */
  getEmotionHistory: async () => {
    const response = await api.get(endpoints.EMOTION.GET_HISTORY);
    return response.data;
  },
  
  /**
   * Get emotion analysis by ID
   * @param {string} analysisId - Analysis ID
   * @returns {Promise} - Emotion analysis details
   */
  getEmotionAnalysis: async (analysisId) => {
    const response = await api.get(endpoints.EMOTION.GET_ANALYSIS(analysisId));
    return response.data;
  },
  
  /**
   * Get interview emotion insights
   * @param {string} interviewId - Interview ID
   * @returns {Promise} - Emotion insights for interview
   */
  getInterviewEmotionInsights: async (interviewId) => {
    const response = await api.get(endpoints.EMOTION.GET_INTERVIEW_INSIGHTS(interviewId));
    return response.data;
  }
};

/**
 * =========================================================================
 * SPEECH API - Speech Recognition and Analysis
 * =========================================================================
 */
export const speechApi = {
  /**
   * Transcribe speech from audio file
   * @param {File|Blob} audioData - Audio file or blob
   * @returns {Promise} - Transcription result
   */
  transcribeSpeech: async (audioData) => {
    const formData = new FormData();
    formData.append('audio', audioData);
    
    const response = await api.post(endpoints.SPEECH.TRANSCRIBE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  /**
   * Analyze speech quality
   * @param {File|Blob} audioData - Audio file or blob
   * @returns {Promise} - Speech quality analysis
   */
  analyzeSpeechQuality: async (audioData) => {
    const formData = new FormData();
    formData.append('audio', audioData);
    
    const response = await api.post(endpoints.SPEECH.ANALYZE_QUALITY, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  /**
   * Detect speech problems
   * @param {File|Blob} audioData - Audio file or blob
   * @returns {Promise} - Speech problems detection
   */
  detectSpeechProblems: async (audioData) => {
    const formData = new FormData();
    formData.append('audio', audioData);
    
    const response = await api.post(endpoints.SPEECH.DETECT_PROBLEMS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  /**
   * Analyze speaking pace
   * @param {File|Blob} audioData - Audio file or blob
   * @returns {Promise} - Speaking pace analysis
   */
  analyzeSpeakingPace: async (audioData) => {
    const formData = new FormData();
    formData.append('audio', audioData);
    
    const response = await api.post(endpoints.SPEECH.ANALYZE_PACE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  /**
   * Start live speech recognition
   * @param {Object} config - Recognition configuration
   * @returns {Promise} - Session token
   */
  startLiveSpeechRecognition: async (config = {}) => {
    const response = await api.post(endpoints.SPEECH.START_LIVE_RECOGNITION, config);
    return response.data;
  },
  
  /**
   * Send audio chunk for live recognition
   * @param {string} sessionToken - Session token
   * @param {Blob} audioChunk - Audio chunk
   * @returns {Promise} - Recognition update
   */
  sendAudioChunk: async (sessionToken, audioChunk) => {
    const formData = new FormData();
    formData.append('audio', audioChunk);
    
    const response = await api.post(endpoints.SPEECH.SEND_AUDIO_CHUNK(sessionToken), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  /**
   * End live speech recognition
   * @param {string} sessionToken - Session token
   * @returns {Promise} - Final recognition result
   */
  endLiveSpeechRecognition: async (sessionToken) => {
    const response = await api.post(endpoints.SPEECH.END_LIVE_RECOGNITION(sessionToken));
    return response.data;
  },
  
  /**
   * Analyze speech clarity and articulation
   * @param {File|Blob} audioData - Audio file or blob
   * @returns {Promise} - Clarity analysis
   */
  analyzeSpeechClarity: async (audioData) => {
    const formData = new FormData();
    formData.append('audio', audioData);
    
    const response = await api.post(endpoints.SPEECH.ANALYZE_CLARITY, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  /**
   * Generate speech report
   * @param {string} sessionId - Speech analysis session ID
   * @returns {Promise} - Comprehensive speech report
   */
  generateSpeechReport: async (sessionId) => {
    const response = await api.get(endpoints.SPEECH.GENERATE_REPORT(sessionId));
    return response.data;
  }
};

//==============================================================================
// REPORTS API - Report Generation and Management
//==============================================================================
export const reportsApi = {
  /**
   * Generate comprehensive career report
   * @param {Object} reportOptions - Report configuration
   * @returns {Promise} - Generated report
   */
  generateCareerReport: async (reportOptions) => {
    const response = await api.post(endpoints.REPORTS.GENERATE_CAREER_REPORT, reportOptions);
    return response.data;
  },
  
  /**
   * Generate skills assessment report
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise} - Skills assessment report
   */
  generateSkillsReport: async (assessmentId) => {
    const response = await api.get(endpoints.REPORTS.GENERATE_SKILLS_REPORT(assessmentId));
    return response.data;
  },
  
  /**
   * Generate interview performance report
   * @param {string} interviewId - Interview ID
   * @returns {Promise} - Interview performance report
   */
  generateInterviewReport: async (interviewId) => {
    const response = await api.get(endpoints.REPORTS.GENERATE_INTERVIEW_REPORT(interviewId));
    return response.data;
  },
  
  /**
   * Generate job application progress report
   * @param {Object} filters - Report filters
   * @returns {Promise} - Job application progress report
   */
  generateApplicationProgressReport: async (filters = {}) => {
    const response = await api.post(endpoints.REPORTS.GENERATE_APPLICATION_PROGRESS, filters);
    return response.data;
  },
  
  /**
   * Generate career growth report
   * @param {Object} timeframe - Report timeframe
   * @returns {Promise} - Career growth report
   */
  generateCareerGrowthReport: async (timeframe = {}) => {
    const response = await api.post(endpoints.REPORTS.GENERATE_CAREER_GROWTH, timeframe);
    return response.data;
  },
  
  /**
   * Generate personalized improvement report
   * @param {Object} areas - Areas to focus on
   * @returns {Promise} - Personalized improvement report
   */
  generateImprovementReport: async (areas = {}) => {
    const response = await api.post(endpoints.REPORTS.GENERATE_IMPROVEMENT, areas);
    return response.data;
  },
  
  /**
   * Download report as PDF
   * @param {string} reportId - Report ID
   * @returns {Promise} - PDF report
   */
  downloadReportPDF: async (reportId) => {
    const response = await api.get(endpoints.REPORTS.DOWNLOAD_PDF(reportId), {
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Get all user reports
   * @returns {Promise} - User reports
   */
  getAllReports: async () => {
    const response = await api.get(endpoints.REPORTS.GET_ALL);
    return response.data;
  }
};

/**
 * =========================================================================
 * GAMIFICATION API - Badges, Points, Challenges
 * =========================================================================
 */
export const gamificationApi = {
  /**
   * Get user's achievements
   * @returns {Promise} - User achievements
   */
  getUserAchievements: async () => {
    const response = await api.get(endpoints.GAMIFICATION.GET_ACHIEVEMENTS);
    return response.data;
  },
  
  /**
   * Get user's badges
   * @returns {Promise} - User badges
   */
  getUserBadges: async () => {
    const response = await api.get(endpoints.GAMIFICATION.GET_BADGES);
    return response.data;
  },
  
  /**
   * Get user's points and level
   * @returns {Promise} - Points and level info
   */
  getUserPoints: async () => {
    const response = await api.get(endpoints.GAMIFICATION.GET_POINTS);
    return response.data;
  },
  
  /**
   * Get available challenges
   * @returns {Promise} - Available challenges
   */
  getAvailableChallenges: async () => {
    const response = await api.get(endpoints.GAMIFICATION.GET_CHALLENGES);
    return response.data;
  },
  
  /**
   * Start a challenge
   * @param {string} challengeId - Challenge ID
   * @returns {Promise} - Started challenge
   */
  startChallenge: async (challengeId) => {
    const response = await api.post(endpoints.GAMIFICATION.START_CHALLENGE(challengeId));
    return response.data;
  },
  
  /**
   * Complete a challenge
   * @param {string} challengeId - Challenge ID
   * @param {Object} completionData - Challenge completion data
   * @returns {Promise} - Completion result with rewards
   */
  completeChallenge: async (challengeId, completionData = {}) => {
    const response = await api.post(endpoints.GAMIFICATION.COMPLETE_CHALLENGE(challengeId), completionData);
    return response.data;
  },
  
  /**
   * Get user's leaderboard position
   * @returns {Promise} - Leaderboard info
   */
  getLeaderboardPosition: async () => {
    const response = await api.get(endpoints.GAMIFICATION.GET_LEADERBOARD_POSITION);
    return response.data;
  },
  
  /**
   * Get global leaderboard
   * @param {Object} options - Leaderboard options
   * @returns {Promise} - Leaderboard data
   */
  getLeaderboard: async (options = {}) => {
    const response = await api.get(endpoints.GAMIFICATION.GET_LEADERBOARD, { params: options });
    return response.data;
  },
  
  /**
   * Get user's streak information
   * @returns {Promise} - User streak info
   */
  getUserStreak: async () => {
    const response = await api.get(endpoints.GAMIFICATION.GET_STREAK);
    return response.data;
  },
  
  /**
   * Get available rewards
   * @returns {Promise} - Available rewards
   */
  getAvailableRewards: async () => {
    const response = await api.get(endpoints.GAMIFICATION.GET_REWARDS);
    return response.data;
  },
  
  /**
   * Redeem a reward
   * @param {string} rewardId - Reward ID
   * @returns {Promise} - Redemption result
   */
  redeemReward: async (rewardId) => {
    const response = await api.post(endpoints.GAMIFICATION.REDEEM_REWARD(rewardId));
    return response.data;
  },
  
  /**
   * Get user's milestone progress
   * @returns {Promise} - Milestone progress
   */
  getMilestoneProgress: async () => {
    const response = await api.get(endpoints.GAMIFICATION.GET_MILESTONE_PROGRESS);
    return response.data;
  },
  
  /**
   * Get next achievement targets
   * @returns {Promise} - Next achievement info
   */
  getNextAchievements: async () => {
    const response = await api.get(endpoints.GAMIFICATION.GET_NEXT_ACHIEVEMENTS);
    return response.data;
  }
};

/**
 * =========================================================================
 * DASHBOARD API - User Dashboard and Analytics
 * =========================================================================
 */
export const dashboardApi = {
  /**
   * Get dashboard summary
   * @returns {Promise} - Dashboard summary
   */
  getDashboardSummary: async () => {
    const response = await api.get(endpoints.DASHBOARD.GET_SUMMARY);
    return response.data;
  },
  
  /**
   * Get activity timeline
   * @param {Object} timeframe - Timeline timeframe
   * @returns {Promise} - Activity timeline
   */
  getActivityTimeline: async (timeframe = {}) => {
    const response = await api.get(endpoints.DASHBOARD.GET_ACTIVITY_TIMELINE, { params: timeframe });
    return response.data;
  },
  
  /**
   * Get career progress metrics
   * @returns {Promise} - Career progress metrics
   */
  getCareerProgressMetrics: async () => {
    const response = await api.get(endpoints.DASHBOARD.GET_CAREER_PROGRESS);
    return response.data;
  },
  
  /**
   * Get skill improvement metrics
   * @returns {Promise} - Skill improvement metrics
   */
  getSkillImprovementMetrics: async () => {
    const response = await api.get(endpoints.DASHBOARD.GET_SKILL_IMPROVEMENT);
    return response.data;
  },
  
  /**
   * Get job application metrics
   * @returns {Promise} - Job application metrics
   */
  getJobApplicationMetrics: async () => {
    const response = await api.get(endpoints.DASHBOARD.GET_JOB_APPLICATION_METRICS);
    return response.data;
  },
  
  /**
   * Get recommended actions
   * @returns {Promise} - Recommended actions
   */
  getRecommendedActions: async () => {
    const response = await api.get(endpoints.DASHBOARD.GET_RECOMMENDED_ACTIONS);
    return response.data;
  },
  
  /**
   * Get dashboard widgets
   * @returns {Promise} - Dashboard widgets
   */
  getDashboardWidgets: async () => {
    const response = await api.get(endpoints.DASHBOARD.GET_WIDGETS);
    return response.data;
  },
  
  /**
   * Save dashboard layout
   * @param {Object} layoutData - Dashboard layout
   * @returns {Promise} - Layout update result
   */
  saveDashboardLayout: async (layoutData) => {
    const response = await api.post(endpoints.DASHBOARD.SAVE_LAYOUT, layoutData);
    return response.data;
  },
  
  /**
   * Get custom dashboard data
   * @param {string} widgetId - Widget ID
   * @param {Object} parameters - Query parameters
   * @returns {Promise} - Custom widget data
   */
  getCustomWidgetData: async (widgetId, parameters = {}) => {
    const response = await api.get(endpoints.DASHBOARD.GET_WIDGET_DATA(widgetId), { params: parameters });
    return response.data;
  },
  
  /**
   * Get career health score
   * @returns {Promise} - Career health score
   */
  getCareerHealthScore: async () => {
    const response = await api.get(endpoints.DASHBOARD.GET_CAREER_HEALTH);
    return response.data;
  },
  
  /**
   * Get progress towards goals
   * @returns {Promise} - Goals progress
   */
  getGoalsProgress: async () => {
    const response = await api.get(endpoints.DASHBOARD.GET_GOALS_PROGRESS);
    return response.data;
  },
  
  /**
   * Get performance compared to peers
   * @returns {Promise} - Peer comparison data
   */
  getPeerComparison: async () => {
    const response = await api.get(endpoints.DASHBOARD.GET_PEER_COMPARISON);
    return response.data;
  },
  
  /**
   * Get employment outlook
   * @returns {Promise} - Employment outlook data
   */
  getEmploymentOutlook: async () => {
    const response = await api.get(endpoints.DASHBOARD.GET_EMPLOYMENT_OUTLOOK);
    return response.data;
  },
  
  /**
   * Get personalized insights
   * @returns {Promise} - Personalized insights
   */
  getPersonalizedInsights: async () => {
    const response = await api.get(endpoints.DASHBOARD.GET_PERSONALIZED_INSIGHTS);
    return response.data;
  }
};

/**
 * =========================================================================
 * VISUALIZATION API - Charts, Graphs, and Visual Representations
 * =========================================================================
 */
export const visualizationApi = {
  /**
   * Generate career path visualization
   * @param {Object} parameters - Visualization parameters
   * @returns {Promise} - Career path visualization
   */
  generateCareerPathVisualization: async (parameters = {}) => {
    const response = await api.post(endpoints.VISUALIZATION.CAREER_PATH, parameters);
    return response.data;
  },
  
  /**
   * Generate skill radar chart
   * @param {Object} skills - Skills to visualize
   * @returns {Promise} - Skill radar chart data
   */
  generateSkillRadarChart: async (skills = {}) => {
    const response = await api.post(endpoints.VISUALIZATION.SKILL_RADAR, skills);
    return response.data;
  },
  
  /**
   * Generate job market heatmap
   * @param {Object} parameters - Heatmap parameters
   * @returns {Promise} - Job market heatmap data
   */
  generateJobMarketHeatmap: async (parameters = {}) => {
    const response = await api.post(endpoints.VISUALIZATION.JOB_MARKET_HEATMAP, parameters);
    return response.data;
  },
  
  /**
   * Generate salary comparison chart
   * @param {Object} parameters - Comparison parameters
   * @returns {Promise} - Salary comparison chart data
   */
  generateSalaryComparisonChart: async (parameters = {}) => {
    const response = await api.post(endpoints.VISUALIZATION.SALARY_COMPARISON, parameters);
    return response.data;
  },
  
  /**
   * Generate application funnel visualization
   * @returns {Promise} - Application funnel data
   */
  generateApplicationFunnel: async () => {
    const response = await api.get(endpoints.VISUALIZATION.APPLICATION_FUNNEL);
    return response.data;
  },
  
  /**
   * Generate timeline visualization
   * @param {Object} parameters - Timeline parameters
   * @returns {Promise} - Timeline visualization data
   */
  generateTimelineVisualization: async (parameters = {}) => {
    const response = await api.post(endpoints.VISUALIZATION.TIMELINE, parameters);
    return response.data;
  },
  
  /**
   * Generate network graph
   * @param {Object} parameters - Network parameters
   * @returns {Promise} - Network graph data
   */
  generateNetworkGraph: async (parameters = {}) => {
    const response = await api.post(endpoints.VISUALIZATION.NETWORK_GRAPH, parameters);
    return response.data;
  },
  
  /**
   * Generate skill tree visualization
   * @returns {Promise} - Skill tree data
   */
  generateSkillTree: async () => {
    const response = await api.get(endpoints.VISUALIZATION.SKILL_TREE);
    return response.data;
  },
  
  /**
   * Generate progress dashboard visualization
   * @returns {Promise} - Dashboard visualization data
   */
  generateProgressDashboard: async () => {
    const response = await api.get(endpoints.VISUALIZATION.PROGRESS_DASHBOARD);
    return response.data;
  },
  
  /**
   * Generate custom chart
   * @param {Object} chartConfig - Chart configuration
   * @returns {Promise} - Custom chart data
   */
  generateCustomChart: async (chartConfig) => {
    const response = await api.post(endpoints.VISUALIZATION.CUSTOM_CHART, chartConfig);
    return response.data;
  },
  
  /**
   * Export visualization as image
   * @param {Object} vizData - Visualization data
   * @returns {Promise} - Image blob
   */
  exportVisualizationAsImage: async (vizData) => {
    const response = await api.post(endpoints.VISUALIZATION.EXPORT_IMAGE, vizData, {
      responseType: 'blob'
    });
    return response.data;
  }
};

//==============================================================================
// LANGUAGE MODELS API - LLMs and HuggingFace Integration
//==============================================================================
export const languageModelsApi = {
  /**
   * Generate text with a language model
   * @param {Object} generateParams - Generation parameters
   * @param {string} generateParams.prompt - Input prompt
   * @param {string} generateParams.model - Model name (optional)
   * @param {Object} generateParams.options - Generation options
   * @returns {Promise} - Generated text
   */
  generateText: async (generateParams) => {
    const response = await api.post(endpoints.LANGUAGE_MODELS.GENERATE_TEXT, generateParams);
    return response.data;
  },
  
  /**
   * Generate career advice with AI
   * @param {Object} adviceParams - Advice parameters
   * @returns {Promise} - Career advice
   */
  generateCareerAdvice: async (adviceParams) => {
    const response = await api.post(endpoints.LANGUAGE_MODELS.GENERATE_CAREER_ADVICE, adviceParams);
    return response.data;
  },
  
  /**
   * Analyze text with a language model
   * @param {Object} analysisParams - Analysis parameters
   * @returns {Promise} - Text analysis
   */
  analyzeText: async (analysisParams) => {
    const response = await api.post(endpoints.LANGUAGE_MODELS.ANALYZE_TEXT, analysisParams);
    return response.data;
  },
  
  /**
   * Get text embeddings
   * @param {Object} embeddingParams - Embedding parameters
   * @returns {Promise} - Text embeddings
   */
  getEmbeddings: async (embeddingParams) => {
    const response = await api.post(endpoints.LANGUAGE_MODELS.GET_EMBEDDINGS, embeddingParams);
    return response.data;
  },
  
  /**
   * Summarize text
   * @param {Object} summarizeParams - Summarization parameters
   * @returns {Promise} - Summarized text
   */
  summarizeText: async (summarizeParams) => {
    const response = await api.post(endpoints.LANGUAGE_MODELS.SUMMARIZE_TEXT, summarizeParams);
    return response.data;
  },
  
  /**
   * Enhance job application content
   * @param {Object} enhanceParams - Enhancement parameters
   * @returns {Promise} - Enhanced content
   */
  enhanceJobContent: async (enhanceParams) => {
    const response = await api.post(endpoints.LANGUAGE_MODELS.ENHANCE_JOB_CONTENT, enhanceParams);
    return response.data;
  },
  
  /**
   * Get available language models
   * @returns {Promise} - Available models
   */
  getAvailableModels: async () => {
    const response = await api.get(endpoints.LANGUAGE_MODELS.GET_AVAILABLE_MODELS);
    return response.data;
  },
  
  /**
   * Custom inference with HuggingFace model
   * @param {Object} inferenceParams - Inference parameters
   * @returns {Promise} - Inference results
   */
  customHuggingFaceInference: async (inferenceParams) => {
    const response = await api.post(endpoints.LANGUAGE_MODELS.HUGGINGFACE_INFERENCE, inferenceParams);
    return response.data;
  },
  
  /**
   * Generate personalized response
   * @param {Object} personalizationParams - Personalization parameters
   * @returns {Promise} - Personalized response
   */
  generatePersonalizedResponse: async (personalizationParams) => {
    const response = await api.post(endpoints.LANGUAGE_MODELS.GENERATE_PERSONALIZED_RESPONSE, personalizationParams);
    return response.data;
  },
  
  /**
   * Process document with language model
   * @param {Object} documentParams - Document parameters
   * @returns {Promise} - Processed document
   */
  processDocument: async (documentParams) => {
    const response = await api.post(endpoints.LANGUAGE_MODELS.PROCESS_DOCUMENT, documentParams);
    return response.data;
  },
  
  /**
   * Analyze sentiment
   * @param {Object} sentimentParams - Sentiment parameters
   * @returns {Promise} - Sentiment analysis
   */
  analyzeSentiment: async (sentimentParams) => {
    const response = await api.post(endpoints.LANGUAGE_MODELS.ANALYZE_SENTIMENT, sentimentParams);
    return response.data;
  },
  
  /**
   * Get model information
   * @param {string} modelId - Model ID
   * @returns {Promise} - Model information
   */
  getModelInfo: async (modelId) => {
    const response = await api.get(endpoints.LANGUAGE_MODELS.GET_MODEL_INFO(modelId));
    return response.data;
  },
  
  /**
   * Fine-tune model for specific use case
   * @param {Object} tuningParams - Fine-tuning parameters
   * @returns {Promise} - Fine-tuning job information
   */
  fineTuneModel: async (tuningParams) => {
    const response = await api.post(endpoints.LANGUAGE_MODELS.FINE_TUNE_MODEL, tuningParams);
    return response.data;
  },
  
  /**
   * Get fine-tuning job status
   * @param {string} jobId - Fine-tuning job ID
   * @returns {Promise} - Job status
   */
  getFineTuningStatus: async (jobId) => {
    const response = await api.get(endpoints.LANGUAGE_MODELS.GET_FINE_TUNING_STATUS(jobId));
    return response.data;
  },
  
  /**
   * Generate interview questions based on job description
   * @param {Object} jobParams - Job parameters
   * @returns {Promise} - Generated interview questions
   */
  generateInterviewQuestions: async (jobParams) => {
    const response = await api.post(endpoints.LANGUAGE_MODELS.GENERATE_INTERVIEW_QUESTIONS, jobParams);
    return response.data;
  }
};

/**
 * =========================================================================
 * TEXT-TO-SPEECH API - TTS Engine and Speech Configuration
 * =========================================================================
 */
export const ttsApi = {
  /**
   * Convert text to speech
   * @param {Object} ttsParams - TTS parameters
   * @param {string} ttsParams.text - Text to convert
   * @param {string} ttsParams.voice - Voice ID (optional)
   * @param {Object} ttsParams.options - TTS options
   * @returns {Promise} - Audio blob
   */
  convertTextToSpeech: async (ttsParams) => {
    const response = await api.post(endpoints.TTS.CONVERT, ttsParams, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Get available voices
   * @param {Object} filters - Voice filters
   * @returns {Promise} - Available voices
   */
  getAvailableVoices: async (filters = {}) => {
    const response = await api.get(endpoints.TTS.GET_VOICES, { params: filters });
    return response.data;
  },
  
  /**
   * Get voice details
   * @param {string} voiceId - Voice ID
   * @returns {Promise} - Voice details
   */
  getVoiceDetails: async (voiceId) => {
    const response = await api.get(endpoints.TTS.GET_VOICE_DETAILS(voiceId));
    return response.data;
  },
  
  /**
   * Save audio to user's library
   * @param {Object} saveParams - Save parameters
   * @param {Blob} saveParams.audio - Audio blob
   * @param {string} saveParams.name - Audio name
   * @returns {Promise} - Save result
   */
  saveAudioToLibrary: async (saveParams) => {
    const formData = new FormData();
    formData.append('audio', saveParams.audio);
    formData.append('name', saveParams.name);
    
    const response = await api.post(endpoints.TTS.SAVE_TO_LIBRARY, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  /**
   * Get user's audio library
   * @returns {Promise} - Audio library
   */
  getAudioLibrary: async () => {
    const response = await api.get(endpoints.TTS.GET_LIBRARY);
    return response.data;
  },
  
  /**
   * Delete audio from library
   * @param {string} audioId - Audio ID
   * @returns {Promise} - Delete result
   */
  deleteAudioFromLibrary: async (audioId) => {
    const response = await api.delete(endpoints.TTS.DELETE_FROM_LIBRARY(audioId));
    return response.data;
  },
  
  /**
   * Get TTS configurations
   * @returns {Promise} - TTS configurations
   */
  getTtsConfigurations: async () => {
    const response = await api.get(endpoints.TTS.GET_CONFIGURATIONS);
    return response.data;
  },
  
  /**
   * Update TTS configuration
   * @param {Object} config - Updated configuration
   * @returns {Promise} - Update result
   */
  updateTtsConfiguration: async (config) => {
    const response = await api.put(endpoints.TTS.UPDATE_CONFIGURATION, config);
    return response.data;
  },
  
  /**
   * Get supported audio formats
   * @returns {Promise} - Supported formats
   */
  getSupportedFormats: async () => {
    const response = await api.get(endpoints.TTS.GET_SUPPORTED_FORMATS);
    return response.data;
  },
  
  /**
   * Convert text to speech with SSML
   * @param {Object} ssmlParams - SSML parameters
   * @returns {Promise} - Audio blob
   */
  convertSSMLToSpeech: async (ssmlParams) => {
    const response = await api.post(endpoints.TTS.CONVERT_SSML, ssmlParams, {
      responseType: 'blob'
    });
    return response.data;
  }
};

/**
 * =========================================================================
 * ADMIN API - System Administration and Management
 * =========================================================================
 */
export const adminApi = {
  /**
   * Get system statistics
   * @returns {Promise} - System statistics
   */
  getSystemStats: async () => {
    const response = await api.get(endpoints.ADMIN.SYSTEM_STATS);
    return response.data;
  },
  
  /**
   * Get all users (paginated)
   * @param {Object} params - Pagination parameters
   * @returns {Promise} - Paginated users list
   */
  getAllUsers: async (params = { page: 1, limit: 50 }) => {
    const response = await api.get(endpoints.ADMIN.GET_USERS, { params });
    return response.data;
  },
  
  /**
   * Get user details by ID
   * @param {string} userId - User ID
   * @returns {Promise} - User details
   */
  getUserDetails: async (userId) => {
    const response = await api.get(endpoints.ADMIN.GET_USER_DETAILS(userId));
    return response.data;
  },
  
  /**
   * Update user roles
   * @param {string} userId - User ID
   * @param {Object} roleData - Updated roles
   * @returns {Promise} - Update result
   */
  updateUserRoles: async (userId, roleData) => {
    const response = await api.put(endpoints.ADMIN.UPDATE_USER_ROLES(userId), roleData);
    return response.data;
  },
  
  /**
   * Disable user account
   * @param {string} userId - User ID
   * @returns {Promise} - Disable result
   */
  disableUser: async (userId) => {
    const response = await api.post(endpoints.ADMIN.DISABLE_USER(userId));
    return response.data;
  },
  
  /**
   * Enable user account
   * @param {string} userId - User ID
   * @returns {Promise} - Enable result
   */
  enableUser: async (userId) => {
    const response = await api.post(endpoints.ADMIN.ENABLE_USER(userId));
    return response.data;
  },
  
  /**
   * Get system logs
   * @param {Object} filters - Log filters
   * @returns {Promise} - System logs
   */
  getSystemLogs: async (filters = {}) => {
    const response = await api.get(endpoints.ADMIN.SYSTEM_LOGS, { params: filters });
    return response.data;
  },
  
  /**
   * Get API usage statistics
   * @param {Object} timeframe - Timeframe parameters
   * @returns {Promise} - API usage stats
   */
  getApiUsageStats: async (timeframe = {}) => {
    const response = await api.get(endpoints.ADMIN.API_USAGE, { params: timeframe });
    return response.data;
  },
  
  /**
   * Get system configuration
   * @returns {Promise} - System configuration
   */
  getSystemConfig: async () => {
    const response = await api.get(endpoints.ADMIN.SYSTEM_CONFIG);
    return response.data;
  },
  
  /**
   * Update system configuration
   * @param {Object} configData - Updated configuration
   * @returns {Promise} - Update result
   */
  updateSystemConfig: async (configData) => {
    const response = await api.put(endpoints.ADMIN.SYSTEM_CONFIG, configData);
    return response.data;
  },
  
  /**
   * Get error reports
   * @returns {Promise} - Error reports
   */
  getErrorReports: async () => {
    const response = await api.get(endpoints.ADMIN.ERROR_REPORTS);
    return response.data;
  },
  
  /**
   * Run system maintenance
   * @param {Object} options - Maintenance options
   * @returns {Promise} - Maintenance result
   */
  runSystemMaintenance: async (options = {}) => {
    const response = await api.post(endpoints.ADMIN.RUN_MAINTENANCE, options);
    return response.data;
  }
};

/**
 * =========================================================================
 * DATASET API - Dataset Management and Generation
 * =========================================================================
 */
export const datasetApi = {
  /**
   * Get available datasets
   * @returns {Promise} - Available datasets
   */
  getAvailableDatasets: async () => {
    const response = await api.get(endpoints.DATASET.GET_AVAILABLE);
    return response.data;
  },
  
  /**
   * Get dataset details
   * @param {string} datasetId - Dataset ID
   * @returns {Promise} - Dataset details
   */
  getDatasetDetails: async (datasetId) => {
    const response = await api.get(endpoints.DATASET.GET_DETAILS(datasetId));
    return response.data;
  },
  
  /**
   * Generate new dataset
   * @param {Object} generationParams - Generation parameters
   * @returns {Promise} - Generation result
   */
  generateDataset: async (generationParams) => {
    const response = await api.post(endpoints.DATASET.GENERATE, generationParams);
    return response.data;
  },
  
  /**
   * Upload custom dataset
   * @param {File} datasetFile - Dataset file
   * @param {Object} metadata - Dataset metadata
   * @returns {Promise} - Upload result
   */
  uploadDataset: async (datasetFile, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', datasetFile);
    
    // Add metadata as JSON
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await api.post(endpoints.DATASET.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  /**
   * Delete dataset
   * @param {string} datasetId - Dataset ID
   * @returns {Promise} - Delete result
   */
  deleteDataset: async (datasetId) => {
    const response = await api.delete(endpoints.DATASET.DELETE(datasetId));
    return response.data;
  },
  
  /**
   * Update dataset metadata
   * @param {string} datasetId - Dataset ID
   * @param {Object} metadata - Updated metadata
   * @returns {Promise} - Update result
   */
  updateDatasetMetadata: async (datasetId, metadata) => {
    const response = await api.put(endpoints.DATASET.UPDATE_METADATA(datasetId), metadata);
    return response.data;
  },
  
  /**
   * Generate synthetic data
   * @param {Object} parameters - Generation parameters
   * @returns {Promise} - Generated data
   */
  generateSyntheticData: async (parameters) => {
    const response = await api.post(endpoints.DATASET.GENERATE_SYNTHETIC, parameters);
    return response.data;
  },
  
  /**
   * Query dataset
   * @param {string} datasetId - Dataset ID
   * @param {Object} query - Query parameters
   * @returns {Promise} - Query results
   */
  queryDataset: async (datasetId, query) => {
    const response = await api.post(endpoints.DATASET.QUERY(datasetId), query);
    return response.data;
  },
  
  /**
   * Export dataset
   * @param {string} datasetId - Dataset ID
   * @param {string} format - Export format
   * @returns {Promise} - Exported dataset
   */
  exportDataset: async (datasetId, format = 'json') => {
    const response = await api.get(endpoints.DATASET.EXPORT(datasetId, format), {
      responseType: 'blob'
    });
    return response.data;
  },
  
  /**
   * Get dataset statistics
   * @param {string} datasetId - Dataset ID
   * @returns {Promise} - Dataset statistics
   */
  getDatasetStats: async (datasetId) => {
    const response = await api.get(endpoints.DATASET.GET_STATS(datasetId));
    return response.data;
  },
  
  /**
   * Generate career dataset
   * @param {Object} parameters - Generation parameters
   * @returns {Promise} - Generation result
   */
  generateCareerDataset: async (parameters) => {
    const response = await api.post(endpoints.DATASET.GENERATE_CAREER, parameters);
    return response.data;
  }
};

/**
 * =========================================================================
 * MODEL TRAINING API - ML Model Training and Management
 * =========================================================================
 */
export const modelTrainingApi = {
  /**
   * Get available models
   * @returns {Promise} - Available ML models
   */
  getAvailableModels: async () => {
    const response = await api.get(endpoints.MODEL_TRAINING.GET_AVAILABLE);
    return response.data;
  },
  
  /**
   * Get model details
   * @param {string} modelId - Model ID
   * @returns {Promise} - Model details
   */
  getModelDetails: async (modelId) => {
    const response = await api.get(endpoints.MODEL_TRAINING.GET_DETAILS(modelId));
    return response.data;
  },
  
  /**
   * Start model training job
   * @param {Object} trainingParams - Training parameters
   * @returns {Promise} - Training job info
   */
  startTrainingJob: async (trainingParams) => {
    const response = await api.post(endpoints.MODEL_TRAINING.START_TRAINING, trainingParams);
    return response.data;
  },
  
  /**
   * Get training job status
   * @param {string} jobId - Training job ID
   * @returns {Promise} - Job status
   */
  getTrainingJobStatus: async (jobId) => {
    const response = await api.get(endpoints.MODEL_TRAINING.GET_JOB_STATUS(jobId));
    return response.data;
  },
  
  /**
   * Cancel training job
   * @param {string} jobId - Training job ID
   * @returns {Promise} - Cancellation result
   */
  cancelTrainingJob: async (jobId) => {
    const response = await api.post(endpoints.MODEL_TRAINING.CANCEL_JOB(jobId));
    return response.data;
  },
  
  /**
   * Evaluate trained model
   * @param {string} modelId - Model ID
   * @param {Object} evaluationParams - Evaluation parameters
   * @returns {Promise} - Evaluation results
   */
  evaluateModel: async (modelId, evaluationParams = {}) => {
    const response = await api.post(endpoints.MODEL_TRAINING.EVALUATE_MODEL(modelId), evaluationParams);
    return response.data;
  },
  
  /**
   * Deploy trained model
   * @param {string} modelId - Model ID
   * @param {Object} deploymentParams - Deployment parameters
   * @returns {Promise} - Deployment result
   */
  deployModel: async (modelId, deploymentParams = {}) => {
    const response = await api.post(endpoints.MODEL_TRAINING.DEPLOY_MODEL(modelId), deploymentParams);
    return response.data;
  },
  
  /**
   * Get model performance metrics
   * @param {string} modelId - Model ID
   * @returns {Promise} - Performance metrics
   */
  getModelPerformance: async (modelId) => {
    const response = await api.get(endpoints.MODEL_TRAINING.GET_PERFORMANCE(modelId));
    return response.data;
  },
  
  /**
   * Get model training history
   * @returns {Promise} - Training history
   */
  getTrainingHistory: async () => {
    const response = await api.get(endpoints.MODEL_TRAINING.GET_HISTORY);
    return response.data;
  },
  
  /**
   * Delete trained model
   * @param {string} modelId - Model ID
   * @returns {Promise} - Deletion result
   */
  deleteModel: async (modelId) => {
    const response = await api.delete(endpoints.MODEL_TRAINING.DELETE_MODEL(modelId));
    return response.data;
  }
};

// Export all API modules as a single object
export default {
  authApi,
  userApi,
  resumeApi,
  assessmentApi,
  careerApi,
  jobApi,
  interviewApi,
  learningApi,
  networkingApi,
  analyticsApi,
  aiToolsApi,
  documentsApi,
  feedbackApi,
  emotionAnalysisApi,
  speechApi,
  reportsApi,
  gamificationApi,
  dashboardApi,
  visualizationApi,
  languageModelsApi,
  ttsApi,
  adminApi,
  datasetApi,
  modelTrainingApi,
  api  // Export the base axios instance for custom calls
};