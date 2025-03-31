/**
 * API Integration for TamkeenAI Career System
 * Provides functions to interact with the backend API
 */
import axios from 'axios';
import * as endpoints from './endpoints';

// Create axios instance with default config
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock API implementation (for development)
const mockApi = {
  get: async (url) => {
    console.log(`[MOCK API] GET ${url}`);
    
    // Mock resume data
    if (url.includes('/resume/user/')) {
      return {
        data: [
          {
            id: '1',
            name: 'My Professional Resume',
            userId: '1',
            isDefault: true,
            template: 'modern',
            primaryColor: '#1976d2',
            createdAt: '2023-08-15T10:00:00Z',
            lastUpdated: '2023-08-20T15:30:00Z'
          },
          {
            id: '2',
            name: 'Creative Portfolio',
            userId: '1',
            isDefault: false,
            template: 'creative',
            primaryColor: '#9c27b0',
            createdAt: '2023-07-10T14:20:00Z',
            lastUpdated: '2023-08-18T09:15:00Z'
          }
        ]
      };
    }
    
    // Mock resume details
    if (url.includes('/resume/') && url.includes('/details')) {
      const resumeId = url.split('/')[2];
      return {
        data: {
          id: resumeId,
          name: resumeId === '1' ? 'My Professional Resume' : 'Creative Portfolio',
          userId: '1',
          template: resumeId === '1' ? 'modern' : 'creative',
          primaryColor: resumeId === '1' ? '#1976d2' : '#9c27b0',
          createdAt: '2023-08-15T10:00:00Z',
          lastUpdated: '2023-08-20T15:30:00Z',
          sections: [
            {
              id: 'header',
              type: 'header',
              title: 'Header',
              content: {
                name: 'John Doe',
                title: 'Full Stack Developer',
                contact: {
                  email: 'john.doe@example.com',
                  phone: '+1 (555) 123-4567'
                }
              },
              visible: true,
              order: 0
            },
            {
              id: 'summary',
              type: 'summary',
              title: 'Professional Summary',
              content: {
                text: 'Experienced Full Stack Developer with a passion for creating clean, efficient, and scalable applications. Skilled in JavaScript, React, Node.js, and cloud technologies.'
              },
              visible: true,
              order: 1
            },
            {
              id: 'skills',
              type: 'skills',
              title: 'Skills',
              content: {
                skills: [
                  { name: 'JavaScript', level: 90 },
                  { name: 'React', level: 85 },
                  { name: 'Node.js', level: 80 },
                  { name: 'TypeScript', level: 75 },
                  { name: 'AWS', level: 70 }
                ]
              },
              visible: true,
              order: 2
            },
            {
              id: 'experience',
              type: 'experience',
              title: 'Work Experience',
              content: {
                jobs: [
                  {
                    title: 'Senior Frontend Developer',
                    company: 'Tech Innovations Inc.',
                    location: 'San Francisco, CA',
                    startDate: '2021-03-01',
                    endDate: null,
                    current: true,
                    description: 'Lead the development of the company\'s main SaaS product using React and TypeScript. Implemented state management with Redux and Redux Toolkit.'
                  },
                  {
                    title: 'Full Stack Developer',
                    company: 'Web Solutions LLC',
                    location: 'Seattle, WA',
                    startDate: '2018-06-01',
                    endDate: '2021-02-28',
                    current: false,
                    description: 'Developed and maintained multiple client web applications using React, Node.js, and MongoDB. Designed and implemented RESTful APIs.'
                  }
                ]
              },
              visible: true,
              order: 3
            },
            {
              id: 'education',
              type: 'education',
              title: 'Education',
              content: {
                education: [
                  {
                    degree: 'Bachelor of Science in Computer Science',
                    institution: 'University of Washington',
                    location: 'Seattle, WA',
                    startDate: '2014-09-01',
                    endDate: '2018-05-30',
                    description: 'Graduated with honors. Specialized in software engineering and web development.'
                  }
                ]
              },
              visible: true,
              order: 4
            }
          ]
        }
      };
    }
    
    // Mock resume templates
    if (url.includes('/resume/templates')) {
      return {
        data: [
          {
            id: 'modern',
            name: 'Modern',
            description: 'Clean and professional design with a sidebar',
            previewUrl: '/templates/modern.png'
          },
          {
            id: 'classic',
            name: 'Classic',
            description: 'Traditional single-column layout',
            previewUrl: '/templates/classic.png'
          },
          {
            id: 'creative',
            name: 'Creative',
            description: 'Bold design for creative professionals',
            previewUrl: '/templates/creative.png'
          },
          {
            id: 'minimal',
            name: 'Minimal',
            description: 'Simple and elegant with plenty of white space',
            previewUrl: '/templates/minimal.png'
          }
        ]
      };
    }
    
    // Mock skill categories
    if (url.includes('/skills/categories')) {
      return {
        data: [
          {
            id: 'tech',
            name: 'Technical Skills',
            description: 'Programming languages, frameworks, and tools',
            icon: 'Code'
          },
          {
            id: 'soft',
            name: 'Soft Skills',
            description: 'Communication, teamwork, and interpersonal skills',
            icon: 'People'
          },
          {
            id: 'data',
            name: 'Data Analysis',
            description: 'Data processing, analysis, and visualization',
            icon: 'Analytics'
          },
          {
            id: 'design',
            name: 'Design',
            description: 'UI/UX design, graphic design, and creativity',
            icon: 'Brush'
          },
          {
            id: 'mgmt',
            name: 'Management',
            description: 'Project management, leadership, and organization',
            icon: 'Business'
          }
        ]
      };
    }
    
    // Mock user skills
    if (url.includes('/skills/user/')) {
      return {
        data: [
          { id: '1', name: 'JavaScript', category: 'tech', proficiency: 4 },
          { id: '2', name: 'React', category: 'tech', proficiency: 4 },
          { id: '3', name: 'Node.js', category: 'tech', proficiency: 3 },
          { id: '4', name: 'Python', category: 'tech', proficiency: 3 },
          { id: '5', name: 'Communication', category: 'soft', proficiency: 4 },
          { id: '6', name: 'Teamwork', category: 'soft', proficiency: 4 },
          { id: '7', name: 'Data Analysis', category: 'data', proficiency: 3 },
          { id: '8', name: 'SQL', category: 'tech', proficiency: 3 },
          { id: '9', name: 'Project Management', category: 'mgmt', proficiency: 3 }
        ]
      };
    }
    
    // Mock completed assessments
    if (url.includes('/skills/assessments/')) {
      return {
        data: [
          {
            id: '1',
            categoryId: 'tech',
            categoryName: 'Technical Skills',
            completedAt: '2023-07-15T14:30:00Z',
            score: 85,
            skills: [
              { name: 'JavaScript', score: 90 },
              { name: 'React', score: 85 },
              { name: 'Node.js', score: 80 }
            ]
          },
          {
            id: '2',
            categoryId: 'soft',
            categoryName: 'Soft Skills',
            completedAt: '2023-08-02T10:15:00Z',
            score: 90,
            skills: [
              { name: 'Communication', score: 95 },
              { name: 'Teamwork', score: 90 },
              { name: 'Problem Solving', score: 85 }
            ]
          }
        ]
      };
    }
    
    // Mock assessment questions
    if (url.includes('/skills/assessment/') && url.includes('/questions')) {
      const categoryId = url.split('/')[3];
      if (categoryId === 'tech') {
        return {
          data: [
            {
              id: '1',
              question: 'Which of the following is not a JavaScript data type?',
              type: 'multiple-choice',
              options: ['String', 'Number', 'Boolean', 'Float'],
              correctAnswer: 'Float'
            },
            {
              id: '2',
              question: 'What is the correct way to create a function in JavaScript?',
              type: 'multiple-choice',
              options: [
                'function = myFunction() {}',
                'function myFunction() {}',
                'function:myFunction() {}',
                'create function myFunction() {}'
              ],
              correctAnswer: 'function myFunction() {}'
            },
            {
              id: '3',
              question: 'Rate your proficiency with React.js',
              type: 'rating',
              minLabel: 'Beginner',
              maxLabel: 'Expert'
            },
            {
              id: '4',
              question: 'How confident are you in developing RESTful APIs?',
              type: 'rating',
              minLabel: 'Not Confident',
              maxLabel: 'Very Confident'
            }
          ]
        };
      } else {
        return {
          data: [
            {
              id: '5',
              question: 'How would you handle a conflict with a team member?',
              type: 'multiple-choice',
              options: [
                'Ignore the conflict and hope it resolves itself',
                'Escalate to management immediately',
                'Discuss the issue privately with the team member',
                'Criticize the team member publicly'
              ],
              correctAnswer: 'Discuss the issue privately with the team member'
            },
            {
              id: '6',
              question: 'Rate your public speaking skills',
              type: 'rating',
              minLabel: 'Beginner',
              maxLabel: 'Expert'
            }
          ]
        };
      }
    }
    
    // Mock skill gap
    if (url.includes('/skills/gap/')) {
      return {
        data: [
          { id: '1', name: 'JavaScript', hasSkill: true, userLevel: 4, requiredLevel: 4 },
          { id: '2', name: 'React', hasSkill: true, userLevel: 4, requiredLevel: 4 },
          { id: '3', name: 'Node.js', hasSkill: true, userLevel: 3, requiredLevel: 4 },
          { id: '4', name: 'TypeScript', hasSkill: false, userLevel: 0, requiredLevel: 3 },
          { id: '5', name: 'GraphQL', hasSkill: false, userLevel: 0, requiredLevel: 3 },
          { id: '6', name: 'AWS', hasSkill: true, userLevel: 2, requiredLevel: 3 }
        ]
      };
    }
    
    // Mock job titles
    if (url.includes('/jobs/titles')) {
      return {
        data: [
          { id: '1', title: 'Frontend Developer', matchScore: 85 },
          { id: '2', title: 'Full Stack Developer', matchScore: 75 },
          { id: '3', title: 'React Developer', matchScore: 90 },
          { id: '4', title: 'Software Engineer', matchScore: 70 },
          { id: '5', title: 'UI Developer', matchScore: 80 },
          { id: '6', title: 'JavaScript Developer', matchScore: 85 }
        ]
      };
    }
    
    return { data: [] };
  },
  
  post: async (url, data) => {
    console.log(`[MOCK API] POST ${url}`, data);
    
    // Mock resume creation
    if (url.includes('/resume/create')) {
      return {
        data: {
          ...data,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      };
    }
    
    return { data: { success: true } };
  },
  
  put: async (url, data) => {
    console.log(`[MOCK API] PUT ${url}`, data);
    return { data: { ...data, lastUpdated: new Date().toISOString() } };
  },
  
  delete: async (url) => {
    console.log(`[MOCK API] DELETE ${url}`);
    return { data: { success: true } };
  }
};

// Resume API methods
const resumesAPI = {
  getUserResumes: async (userId) => {
    try {
      // Check if we're using mock data
      const endpoint = endpoints.apiEndpoints.resumes.getUserResumes(userId);
      if (endpoint.data?.mock) {
        return await mockApi.get(endpoint.url);
      }
      
      // Real API call
      const response = await api.get(endpoint.url);
      return response;
    } catch (error) {
      console.error('Error getting user resumes:', error);
      throw error;
    }
  },
  
  getResumeDetails: async (resumeId) => {
    try {
      // Check if we're using mock data
      const endpoint = endpoints.apiEndpoints.resumes.getResumeDetails(resumeId);
      if (endpoint.data?.mock) {
        return await mockApi.get(endpoint.url);
      }
      
      // Real API call
      const response = await api.get(endpoint.url);
      return response;
    } catch (error) {
      console.error('Error getting resume details:', error);
      throw error;
    }
  },
  
  getResumeTemplates: async () => {
    try {
      // Check if we're using mock data
      const endpoint = endpoints.apiEndpoints.resumes.getResumeTemplates();
      if (endpoint.data?.mock) {
        return await mockApi.get(endpoint.url);
      }
      
      // Real API call
      const response = await api.get(endpoint.url);
      return response;
    } catch (error) {
      console.error('Error getting resume templates:', error);
      throw error;
    }
  },
  
  createResume: async (data) => {
    try {
      // Check if we're using mock data
      const endpoint = endpoints.apiEndpoints.resumes.createResume(data);
      if (endpoint.data?.mock) {
        return await mockApi.post(endpoint.url, data);
      }
      
      // Real API call
      const response = await api.post(endpoint.url, data);
      return response;
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  },
  
  updateResume: async (resumeId, data) => {
    try {
      // Check if we're using mock data
      const endpoint = endpoints.apiEndpoints.resumes.updateResume(resumeId, data);
      if (endpoint.data?.mock) {
        return await mockApi.put(endpoint.url, data);
      }
      
      // Real API call
      const response = await api.put(endpoint.url, data);
      return response;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  }
};

// Skills API methods
const skillsAPI = {
  getCategories: async () => {
    try {
      // Check if we're using mock data
      const endpoint = endpoints.apiEndpoints.skills.getCategories();
      if (endpoint.data?.mock) {
        return await mockApi.get(endpoint.url);
      }
      
      // Real API call
      const response = await api.get(endpoint.url);
      return response;
    } catch (error) {
      console.error('Error getting skill categories:', error);
      throw error;
    }
  },
  
  getUserSkills: async (userId) => {
    try {
      // Check if we're using mock data
      const endpoint = endpoints.apiEndpoints.skills.getUserSkills(userId);
      if (endpoint.data?.mock) {
        return await mockApi.get(endpoint.url);
      }
      
      // Real API call
      const response = await api.get(endpoint.url);
      return response;
    } catch (error) {
      console.error('Error getting user skills:', error);
      throw error;
    }
  },
  
  getCompletedAssessments: async (userId) => {
    try {
      // Check if we're using mock data
      const endpoint = endpoints.apiEndpoints.skills.getCompletedAssessments(userId);
      if (endpoint.data?.mock) {
        return await mockApi.get(endpoint.url);
      }
      
      // Real API call
      const response = await api.get(endpoint.url);
      return response;
    } catch (error) {
      console.error('Error getting completed assessments:', error);
      throw error;
    }
  },
  
  getAssessmentQuestions: async (categoryId) => {
    try {
      // Check if we're using mock data
      const endpoint = endpoints.apiEndpoints.skills.getAssessmentQuestions(categoryId);
      if (endpoint.data?.mock) {
        return await mockApi.get(endpoint.url);
      }
      
      // Real API call
      const response = await api.get(endpoint.url);
      return response;
    } catch (error) {
      console.error('Error getting assessment questions:', error);
      throw error;
    }
  },
  
  getSkillGap: async (userId, jobId) => {
    try {
      // Check if we're using mock data
      const endpoint = endpoints.apiEndpoints.skills.getSkillGap(userId, jobId);
      if (endpoint.data?.mock) {
        return await mockApi.get(endpoint.url);
      }
      
      // Real API call
      const response = await api.get(endpoint.url);
      return response;
    } catch (error) {
      console.error('Error getting skill gap:', error);
      throw error;
    }
  },
  
  getJobTitles: async () => {
    try {
      // Check if we're using mock data
      const endpoint = endpoints.apiEndpoints.skills.getJobTitles();
      if (endpoint.data?.mock) {
        return await mockApi.get(endpoint.url);
      }
      
      // Real API call
      const response = await api.get(endpoint.url);
      return response;
    } catch (error) {
      console.error('Error getting job titles:', error);
      throw error;
    }
  }
};

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post(endpoints.AUTH_ENDPOINTS.LOGIN, credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post(endpoints.AUTH_ENDPOINTS.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  logout: async () => {
    try {
      await api.post(endpoints.AUTH_ENDPOINTS.LOGOUT);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear token even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get(endpoints.AUTH_ENDPOINTS.ME);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Resume API calls
export const resumeAPI = {
  uploadResume: async (file, additionalData = {}) => {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      
      // Add any additional data
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
      
      const response = await api.post(endpoints.RESUME_ENDPOINTS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  analyzeResume: async (resumeId) => {
    try {
      const response = await api.post(endpoints.RESUME_ENDPOINTS.ANALYZE, { resumeId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getAllResumes: async () => {
    try {
      const response = await api.get(endpoints.RESUME_ENDPOINTS.GET_ALL);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getResumeById: async (id) => {
    try {
      const response = await api.get(endpoints.RESUME_ENDPOINTS.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  deleteResume: async (id) => {
    try {
      const response = await api.delete(endpoints.RESUME_ENDPOINTS.DELETE(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Interview API calls
export const interviewAPI = {
  createInterview: async (interviewData) => {
    try {
      const response = await api.post(endpoints.INTERVIEW_ENDPOINTS.CREATE, interviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getAllInterviews: async () => {
    try {
      const response = await api.get(endpoints.INTERVIEW_ENDPOINTS.GET_ALL);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getInterviewById: async (id) => {
    try {
      const response = await api.get(endpoints.INTERVIEW_ENDPOINTS.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  updateInterview: async (id, data) => {
    try {
      const response = await api.put(endpoints.INTERVIEW_ENDPOINTS.UPDATE(id), data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  deleteInterview: async (id) => {
    try {
      const response = await api.delete(endpoints.INTERVIEW_ENDPOINTS.DELETE(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Job API calls
export const jobAPI = {
  searchJobs: async (query) => {
    try {
      const response = await api.get(`${endpoints.JOB_ENDPOINTS.SEARCH}?q=${query}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getRecommendedJobs: async () => {
    try {
      const response = await api.get(endpoints.JOB_ENDPOINTS.RECOMMEND);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getJobById: async (id) => {
    try {
      const response = await api.get(endpoints.JOB_ENDPOINTS.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  saveJob: async (id) => {
    try {
      const response = await api.post(endpoints.JOB_ENDPOINTS.SAVE(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  unsaveJob: async (id) => {
    try {
      const response = await api.delete(endpoints.JOB_ENDPOINTS.UNSAVE(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getSavedJobs: async () => {
    try {
      const response = await api.get(endpoints.JOB_ENDPOINTS.GET_SAVED);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// User profile API calls
export const userAPI = {
  updateProfile: async (profileData) => {
    try {
      // Log the update attempt
      console.log('Updating profile for user:', profileData);
      
      // In development mode, just return success with mock data
      if (import.meta.env.DEV) {
        console.log('DEV MODE: Using mock profile update');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Ensure we have a consistent profile structure
        const userId = profileData.userId || profileData.id || 'mock-user-1';
        const updatedProfile = {
          ...profileData,
          id: userId
        };
        
        // Keep the avatar if one exists, otherwise use a placeholder
        if (!updatedProfile.avatar || updatedProfile.avatar.includes('undefined') || 
            updatedProfile.avatar === '/' || updatedProfile.avatar.startsWith('http://localhost:5001/api/undefined')) {
          // Helper function to get a consistent avatar URL based on user ID
          const getConsistentAvatarUrl = (id) => {
            const num = id ? 
              String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 70 : 32;
            const isMale = num % 2 === 0;
            const gender = isMale ? 'men' : 'women';
            return `https://randomuser.me/api/portraits/${gender}/${num}.jpg`;
          };
          
          updatedProfile.avatar = getConsistentAvatarUrl(userId);
        }
        
        return {
          success: true,
          data: updatedProfile
        };
      }
      
      // Real API call for production
      const response = await api.put('/api/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  getProfile: async () => {
    try {
      const response = await api.get(endpoints.USER_ENDPOINTS.GET_PROFILE);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  changePassword: async (passwordData) => {
    try {
      const response = await api.post(endpoints.USER_ENDPOINTS.CHANGE_PASSWORD, passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Settings API calls
export const settingsAPI = {
  getNotificationSettings: async (userId) => {
    try {
      // Use mock data since API endpoints are not available
      return {
        data: {
          emailNotifications: true,
          pushNotifications: true,
          notificationTypes: {
            applications: true,
            interviews: true,
            messages: true,
            jobs: true,
            learning: true,
            system: true
          },
          emailFrequency: 'immediate'
        }
      };
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw error;
    }
  },
  
  getAppearanceSettings: async (userId) => {
    try {
      // Use mock data since API endpoints are not available
      return {
        data: {
          theme: 'system',
          primaryColor: '#1976d2',
          fontSize: 'medium',
          compactMode: false,
          language: 'en'
        }
      };
    } catch (error) {
      console.error('Error fetching appearance settings:', error);
      throw error;
    }
  },
  
  getPrivacySettings: async (userId) => {
    try {
      // Use mock data since API endpoints are not available
      return {
        data: {
          profileVisibility: 'public',
          activityVisibility: 'connections',
          searchable: true,
          allowDataCollection: true,
          allowThirdPartySharing: false
        }
      };
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      throw error;
    }
  },
  
  getDataSettings: async (userId) => {
    try {
      // Use mock data since API endpoints are not available
      return {
        data: {
          autoBackup: false,
          backupFrequency: 'weekly'
        }
      };
    } catch (error) {
      console.error('Error fetching data settings:', error);
      throw error;
    }
  },
  
  updateProfile: async (userId, profileData) => {
    try {
      // Log the update attempt
      console.log('Updating profile for user:', userId, profileData);
      // Return success with the same data but don't override existing avatar with placeholder
      return {
        success: true,
        data: {
          ...profileData,
          id: userId
        }
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  changePassword: async (userId, passwordData) => {
    try {
      // Log the change attempt for debugging
      console.log('Changing password for user:', userId);
      // Return success response
      return { success: true };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },
  
  updateNotificationSettings: async (userId, notificationSettings) => {
    try {
      // Log the update attempt for debugging
      console.log('Updating notification settings for user:', userId, notificationSettings);
      // Return success response
      return { success: true };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  },
  
  updateAppearanceSettings: async (userId, appearanceSettings) => {
    try {
      // Log the update attempt for debugging
      console.log('Updating appearance settings for user:', userId, appearanceSettings);
      // Return success response
      return { success: true };
    } catch (error) {
      console.error('Error updating appearance settings:', error);
      throw error;
    }
  },
  
  updatePrivacySettings: async (userId, privacySettings) => {
    try {
      // Log the update attempt for debugging
      console.log('Updating privacy settings for user:', userId, privacySettings);
      // Return success response
      return { success: true };
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  },
  
  updateDataSettings: async (userId, dataSettings) => {
    try {
      // Log the update attempt for debugging
      console.log('Updating data settings for user:', userId, dataSettings);
      // Return success response
      return { success: true };
    } catch (error) {
      console.error('Error updating data settings:', error);
      throw error;
    }
  },
  
  deleteAccount: async (userId) => {
    try {
      // Log the delete attempt for debugging
      console.log('Deleting account for user:', userId);
      // Return success response
      return { success: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },
  
  exportUserData: async (userId, options) => {
    try {
      // Log the export attempt for debugging
      console.log('Exporting data for user:', userId, options);
      // Return success response with mock data URL
      return {
        success: true,
        downloadUrl: `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ userId }))}`
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  },
  
  uploadProfileImage: async (userId, formData) => {
    try {
      // Log the upload attempt for debugging
      console.log('Uploading profile image for user:', userId);
      // Return success response with mock image URL
      return {
        success: true,
        imageUrl: 'https://via.placeholder.com/150'
      };
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },
  
  uploadAvatar: async (userId, formData) => {
    try {
      // Log the upload attempt
      console.log('Uploading avatar for user:', userId);
      
      // In development mode, just return success with mock avatar URL
      if (import.meta.env.DEV) {
        console.log('DEV MODE: Using mock avatar upload');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get consistent avatar URL - always use randomuser.me to avoid ERR_NAME_NOT_RESOLVED
        const getConsistentAvatarUrl = (id) => {
          const num = id ? 
            String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 70 : 32;
          const isMale = num % 2 === 0;
          const gender = isMale ? 'men' : 'women';
          return `https://randomuser.me/api/portraits/${gender}/${num}.jpg`;
        };
        
        const avatarUrl = getConsistentAvatarUrl(userId);
        console.log(`DEV MODE: Generated mock avatar: ${avatarUrl}`);
        
        return {
          success: true,
          data: {
            avatarUrl: avatarUrl
          }
        };
      }
      
      // Real API call for production - never append 'api' to beginning of route 
      // since that's handled by the axios instance
      const response = await api.post(`/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      
      // If in development mode, return mock data even if there's an error
      if (import.meta.env.DEV) {
        console.log('DEV MODE: Returning mock avatar URL despite error');
        const avatarUrl = getConsistentAvatarUrl(userId);
        return {
          success: true,
          data: {
            avatarUrl: avatarUrl
          }
        };
      }
      
      throw error;
    }
  }
};

// Profiles API calls
export const profilesAPI = {
  getUserProfile: async (userId) => {
    try {
      // Use mock data since API endpoints are not available
      if (import.meta.env.DEV) {
        // Try to get profile from localStorage first for persistence
        const savedProfile = localStorage.getItem(`profile_${userId}`);
        if (savedProfile) {
          try {
            const parsedProfile = JSON.parse(savedProfile);
            console.log('DEV MODE: Retrieved profile from localStorage:', parsedProfile);
            return { data: parsedProfile };
          } catch (e) {
            console.warn('Failed to parse saved profile:', e);
          }
        }
      }
      
      // Default mock data if no saved profile exists
      return {
        data: {
          id: userId,
          firstName: 'Zayed',
          lastName: '',
          username: 'zayed',
          title: 'Frontend Developer',
          bio: 'Passionate developer with experience in React and modern frontend technologies.',
          location: 'Abu Dhabi, UAE',
          phone: '+971 50-123-4567',
          email: 'zayed@example.com',
          avatar: null, // Don't use placeholder images
          visibility: {
            isPublic: true,
            showEmail: false,
            showPhone: false,
            showEducation: true,
            showExperience: true,
            showSkills: true
          },
          socialLinks: {
            linkedin: 'https://linkedin.com/in/zayed',
            github: 'https://github.com/zayed',
            twitter: 'https://twitter.com/zayed',
            portfolio: 'https://zayed.dev'
          }
        }
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  
  getAchievements: async (userId) => {
    try {
      // Use mock data
      return {
        data: [
          {
            id: 1,
            title: 'Resume Master',
            description: 'Created a perfect resume',
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            icon: 'EmojiEvents',
            points: 50
          },
          {
            id: 2,
            title: 'Interview Pro',
            description: 'Completed 5 mock interviews',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            icon: 'Psychology',
            points: 75
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  },
  
  getSkills: async (userId) => {
    try {
      // Use mock data
      return {
        data: [
          { id: 1, name: 'JavaScript', rating: 4, verified: true },
          { id: 2, name: 'React', rating: 4, verified: true },
          { id: 3, name: 'HTML/CSS', rating: 5, verified: true },
          { id: 4, name: 'Node.js', rating: 3, verified: false },
          { id: 5, name: 'Python', rating: 3, verified: false },
          { id: 6, name: 'UI/UX Design', rating: 4, verified: false }
        ]
      };
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw error;
    }
  },
  
  getEducation: async (userId) => {
    try {
      // Use mock data
      return {
        data: [
          {
            id: 1,
            institution: 'Khalifa University',
            degree: 'Bachelor of Computer Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2016-09-01',
            endDate: '2020-06-30',
            grade: '3.7 GPA',
            description: 'Focused on web development and artificial intelligence.'
          },
          {
            id: 2,
            institution: 'Udacity',
            degree: 'Nanodegree',
            fieldOfStudy: 'Frontend Web Development',
            startDate: '2020-01-15',
            endDate: '2020-04-30',
            grade: 'Pass with Distinction',
            description: 'Intensive program on modern JavaScript frameworks and UI/UX design.'
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching education:', error);
      throw error;
    }
  },
  
  getExperience: async (userId) => {
    try {
      // Use mock data
      return {
        data: [
          {
            id: 1,
            company: 'Abu Dhabi Digital Authority',
            title: 'Frontend Developer',
            location: 'Abu Dhabi, UAE',
            startDate: '2020-08-01',
            endDate: null, // Current job
            description: 'Developing and maintaining web applications using React, Redux, and TypeScript for government digital services.'
          },
          {
            id: 2,
            company: 'Tamkeen Technologies',
            title: 'Junior Web Developer',
            location: 'Dubai, UAE',
            startDate: '2019-05-15',
            endDate: '2020-07-31',
            description: 'Worked on client websites using HTML, CSS, and JavaScript frameworks.'
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching experience:', error);
      throw error;
    }
  },
  
  updateProfile: async (profileData) => {
    try {
      // Log the update attempt
      const userId = profileData.userId || profileData.id;
      console.log('Updating profile for user:', userId, profileData);
      
      // In development mode, save to localStorage for persistence
      if (import.meta.env.DEV && userId) {
        const updatedProfile = {
          ...profileData,
          id: userId
        };
        
        // Save to localStorage for persistence
        localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
        console.log('DEV MODE: Saved profile to localStorage:', updatedProfile);
      }
      
      // Return success with the same data
      return {
        success: true,
        data: {
          ...profileData,
          id: userId
        }
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  
  uploadAvatar: async (userId, formData) => {
    try {
      // Log the upload attempt
      console.log('Uploading avatar for user:', userId);
      
      // In development mode, just return success with mock avatar URL
      if (import.meta.env.DEV) {
        console.log('DEV MODE: Using mock avatar upload');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get consistent avatar URL - always use randomuser.me to avoid ERR_NAME_NOT_RESOLVED
        const getConsistentAvatarUrl = (id) => {
          const num = id ? 
            String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 70 : 32;
          const isMale = num % 2 === 0;
          const gender = isMale ? 'men' : 'women';
          return `https://randomuser.me/api/portraits/${gender}/${num}.jpg`;
        };
        
        const avatarUrl = getConsistentAvatarUrl(userId);
        console.log(`DEV MODE: Generated mock avatar: ${avatarUrl}`);
        
        return {
          success: true,
          data: {
            avatarUrl: avatarUrl
          }
        };
      }
      
      // Real API call for production - never append 'api' to beginning of route 
      // since that's handled by the axios instance
      const response = await api.post(`/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      
      // If in development mode, return mock data even if there's an error
      if (import.meta.env.DEV) {
        console.log('DEV MODE: Returning mock avatar URL despite error');
        const avatarUrl = getConsistentAvatarUrl(userId);
        return {
          success: true,
          data: {
            avatarUrl: avatarUrl
          }
        };
      }
      
      throw error;
    }
  }
};

// Jobs API calls
export const jobsAPI = {
  getIndustries: async () => {
    try {
      // Return mock industries data
      return {
        data: [
          { id: 1, name: 'Technology' },
          { id: 2, name: 'Healthcare' },
          { id: 3, name: 'Finance' },
          { id: 4, name: 'Education' },
          { id: 5, name: 'Retail' },
          { id: 6, name: 'Manufacturing' },
          { id: 7, name: 'Media' },
          { id: 8, name: 'Entertainment' }
        ]
      };
    } catch (error) {
      console.error('Error fetching industries:', error);
      throw error;
    }
  },
  
  getSkillsList: async () => {
    try {
      // Return mock skills data
      return {
        data: [
          { id: 1, name: 'JavaScript' },
          { id: 2, name: 'React' },
          { id: 3, name: 'Node.js' },
          { id: 4, name: 'Python' },
          { id: 5, name: 'Java' },
          { id: 6, name: 'C++' },
          { id: 7, name: 'UI/UX Design' },
          { id: 8, name: 'Project Management' },
          { id: 9, name: 'SQL' },
          { id: 10, name: 'NoSQL' },
          { id: 11, name: 'AWS' },
          { id: 12, name: 'Azure' }
        ]
      };
    } catch (error) {
      console.error('Error fetching skills list:', error);
      throw error;
    }
  },
  
  getSavedJobs: async (userId) => {
    try {
      // Return mock saved jobs
      return {
        data: [
          {
            id: 'job1',
            title: 'Senior Frontend Developer',
            company: 'Tech Innovations Inc.',
            location: 'San Francisco, CA',
            jobType: 'Full-time',
            salary: '$120,000 - $150,000',
            datePosted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            dateApplied: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'Applied'
          },
          {
            id: 'job2',
            title: 'UX Designer',
            company: 'Creative Solutions',
            location: 'Remote',
            jobType: 'Contract',
            salary: '$85,000 - $110,000',
            datePosted: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            dateApplied: null,
            status: 'Saved'
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      throw error;
    }
  },
  
  getSavedSearches: async (userId) => {
    try {
      // Return mock saved searches
      return {
        data: [
          {
            id: 1,
            name: 'Frontend Developer Jobs',
            query: 'frontend developer',
            filters: {
              location: 'Remote',
              jobType: ['Full-time', 'Contract']
            },
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            name: 'UX Jobs in San Francisco',
            query: 'ux designer',
            filters: {
              location: 'San Francisco, CA',
              jobType: ['Full-time']
            },
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      throw error;
    }
  },
  
  getSearchHistory: async (userId) => {
    // Mock implementation for search history
    return {
      success: true,
      data: []
    };
  },
  
  addSearchHistory: async (userId, searchData) => {
    // Mock implementation for adding to search history
    console.log('Adding to search history:', userId, searchData);
    return {
      success: true,
      data: {}
    };
  },
  
  getRecentJobs: async (page = 1, pageSize = 10) => {
    try {
      // Generate job listings with random data
      const jobs = Array.from({ length: pageSize }, (_, i) => ({
        id: `job${(page - 1) * pageSize + i + 1}`,
        title: ['Frontend Developer', 'Backend Engineer', 'UI/UX Designer', 'Full Stack Developer', 'DevOps Engineer'][Math.floor(Math.random() * 5)],
        company: ['Tech Solutions', 'Digital Innovations', 'Web Masters', 'CodeCraft', 'Software Inc.'][Math.floor(Math.random() * 5)],
        location: ['Remote', 'New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA'][Math.floor(Math.random() * 5)],
        jobType: ['Full-time', 'Part-time', 'Contract', 'Freelance'][Math.floor(Math.random() * 4)],
        salary: ['$80,000 - $100,000', '$100,000 - $120,000', '$120,000 - $150,000'][Math.floor(Math.random() * 3)],
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue.',
        requirements: ['JavaScript', 'React', 'Node.js', 'HTML/CSS'],
        datePosted: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        companyLogo: 'https://via.placeholder.com/50'
      }));
      
      return {
        data: {
          jobs,
          total: 250, // Total number of jobs
          page,
          pageSize,
          totalPages: Math.ceil(250 / pageSize)
        }
      };
    } catch (error) {
      console.error('Error fetching recent jobs:', error);
      throw error;
    }
  },
  
  searchJobs: async (searchParams) => {
    try {
      console.log('Searching jobs with params:', searchParams);
      
      // Generate job listings based on search params
      const jobCount = Math.floor(Math.random() * 20) + 5; // Random number between 5 and 25
      const jobs = Array.from({ length: jobCount }, (_, i) => ({
        id: `search-job-${i + 1}`,
        title: searchParams.query ? `${searchParams.query.charAt(0).toUpperCase() + searchParams.query.slice(1)} Developer` : 'Developer',
        company: ['Tech Solutions', 'Digital Innovations', 'Web Masters', 'CodeCraft', 'Software Inc.'][Math.floor(Math.random() * 5)],
        location: searchParams.location || ['Remote', 'New York, NY', 'San Francisco, CA'][Math.floor(Math.random() * 3)],
        jobType: searchParams.jobType || ['Full-time', 'Contract'][Math.floor(Math.random() * 2)],
        salary: ['$80,000 - $100,000', '$100,000 - $120,000', '$120,000 - $150,000'][Math.floor(Math.random() * 3)],
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue.',
        requirements: searchParams.skills || ['JavaScript', 'React', 'Node.js', 'HTML/CSS'],
        datePosted: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        companyLogo: 'https://via.placeholder.com/50'
      }));
      
      return {
        data: {
          jobs,
          total: jobCount,
          page: searchParams.page || 1,
          pageSize: searchParams.pageSize || 10,
          totalPages: Math.ceil(jobCount / (searchParams.pageSize || 10))
        }
      };
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  },
  
  saveJob: async (userId, jobId) => {
    try {
      console.log('Saving job for user:', userId, 'Job ID:', jobId);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  },
  
  unsaveJob: async (userId, jobId) => {
    try {
      console.log('Unsaving job for user:', userId, 'Job ID:', jobId);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error unsaving job:', error);
      throw error;
    }
  }
};

// Health check
export const checkHealth = async () => {
  try {
    const response = await api.get(endpoints.HEALTH_CHECK);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Dashboard API calls
export const dashboardAPI = {
  getData: async (userId) => {
    try {
      const response = await api.get(endpoints.DASHBOARD_ENDPOINTS.GET_DATA(userId));
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  updateSkills: async (userId, skillData) => {
    try {
      const response = await api.post(endpoints.DASHBOARD_ENDPOINTS.UPDATE_SKILLS(userId), skillData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  trackActivity: async (userId, activityData) => {
    try {
      const response = await api.post(endpoints.DASHBOARD_ENDPOINTS.TRACK_ACTIVITY(userId), activityData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  updateStats: async (userId, statsData) => {
    try {
      const response = await api.post(endpoints.DASHBOARD_ENDPOINTS.UPDATE_STATS(userId), statsData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Notifications API calls
export const notificationsAPI = {
  getAllNotifications: async (userId, options = {}) => {
    try {
      console.log('Getting all notifications for user:', userId, options);
      // Return mock notifications data
      return {
        data: [
          {
            id: 1,
            title: 'New job match',
            message: 'We found a new job that matches your profile',
            type: 'job',
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            title: 'Application status update',
            message: 'Your application for Frontend Developer at TechCorp has been viewed',
            type: 'application',
            read: true,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            title: 'Resume score',
            message: 'Your resume score has improved by 15%',
            type: 'resume',
            read: false,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        pagination: {
          total: 3,
          page: options.page || 1,
          pageSize: options.pageSize || 10,
          totalPages: 1
        }
      };
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      throw error;
    }
  },
  
  getUnreadNotifications: async (userId, options = {}) => {
    try {
      console.log('Getting unread notifications for user:', userId, options);
      // Return mock unread notifications
      return {
        data: [
          {
            id: 1,
            title: 'New job match',
            message: 'We found a new job that matches your profile',
            type: 'job',
            read: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            title: 'Resume score',
            message: 'Your resume score has improved by 15%',
            type: 'resume',
            read: false,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        pagination: {
          total: 2,
          page: options.page || 1,
          pageSize: options.pageSize || 10,
          totalPages: 1
        }
      };
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },
  
  getReadNotifications: async (userId, options = {}) => {
    try {
      console.log('Getting read notifications for user:', userId, options);
      // Return mock read notifications
      return {
        data: [
          {
            id: 2,
            title: 'Application status update',
            message: 'Your application for Frontend Developer at TechCorp has been viewed',
            type: 'application',
            read: true,
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        pagination: {
          total: 1,
          page: options.page || 1,
          pageSize: options.pageSize || 10,
          totalPages: 1
        }
      };
    } catch (error) {
      console.error('Error fetching read notifications:', error);
      throw error;
    }
  },
  
  getNotificationSettings: async (userId) => {
    try {
      console.log('Getting notification settings for user:', userId);
      // Return mock notification settings
      return {
        data: {
          email: true,
          push: true,
          jobAlerts: true,
          applicationUpdates: true,
          messages: true,
          networkingEvents: false,
          marketingEmails: false,
          frequency: 'immediate' // immediate, daily, weekly
        }
      };
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      throw error;
    }
  },
  
  markAsRead: async (userId, notificationId) => {
    try {
      console.log('Marking notification as read:', userId, notificationId);
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  markAsUnread: async (userId, notificationId) => {
    try {
      console.log('Marking notification as unread:', userId, notificationId);
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      throw error;
    }
  },
  
  deleteNotification: async (userId, notificationId) => {
    try {
      console.log('Deleting notification:', userId, notificationId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
  
  markAllAsRead: async (userId) => {
    try {
      console.log('Marking all notifications as read for user:', userId);
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  
  clearAllNotifications: async (userId) => {
    try {
      console.log('Clearing all notifications for user:', userId);
      return { success: true };
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  },
  
  updateNotificationSettings: async (userId, settings) => {
    try {
      console.log('Updating notification settings for user:', userId, settings);
      return { success: true };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }
};

// Goals API calls
export const goalsAPI = {
  getUserGoals: async (userId) => {
    try {
      console.log('Getting goals for user:', userId);
      // Return mock goals data
      return {
        data: [
          {
            id: 1,
            title: 'Apply to 5 jobs this week',
            description: 'Send applications to 5 relevant job postings',
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'job-search',
            priority: 'high',
            completed: false,
            progress: 2 // Applied to 2 out of 5 jobs
          },
          {
            id: 2,
            title: 'Update LinkedIn profile',
            description: 'Add recent experience and update skills',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'networking',
            priority: 'medium',
            completed: false,
            progress: 0
          },
          {
            id: 3,
            title: 'Complete JavaScript course',
            description: 'Finish the advanced JavaScript course',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'learning',
            priority: 'medium',
            completed: false,
            progress: 75 // 75% completed
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching user goals:', error);
      throw error;
    }
  },
  
  createGoal: async (userId, goalData) => {
    try {
      console.log('Creating goal for user:', userId, goalData);
      // Return success with the new goal data
      return {
        success: true,
        data: {
          id: Math.floor(Math.random() * 1000),
          ...goalData,
          createdAt: new Date().toISOString(),
          completed: false,
          progress: 0
        }
      };
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },
  
  updateGoal: async (goalId, goalData) => {
    try {
      console.log('Updating goal:', goalId, goalData);
      // Return success with the updated goal data
      return {
        success: true,
        data: {
          id: goalId,
          ...goalData,
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },
  
  deleteGoal: async (goalId) => {
    try {
      console.log('Deleting goal:', goalId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },
  
  completeGoal: async (goalId) => {
    try {
      console.log('Marking goal as completed:', goalId);
      return {
        success: true,
        data: {
          id: goalId,
          completed: true,
          completedAt: new Date().toISOString(),
          progress: 100
        }
      };
    } catch (error) {
      console.error('Error completing goal:', error);
      throw error;
    }
  },
  
  updateGoalProgress: async (goalId, progress) => {
    try {
      console.log('Updating goal progress:', goalId, progress);
      return {
        success: true,
        data: {
          id: goalId,
          progress: progress,
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }
};

// Analytics API calls
export const analyticsAPI = {
  getApplicationStats: async (userId, options = {}) => {
    try {
      console.log('Getting application stats for user:', userId, options);
      // Return mock application statistics
      return {
        data: {
          total: 25,
          active: 12,
          rejected: 8,
          offers: 3,
          interviews: 7,
          byMonth: [
            { month: 'Jan', applications: 3, interviews: 1, offers: 0 },
            { month: 'Feb', applications: 5, interviews: 2, offers: 1 },
            { month: 'Mar', applications: 8, interviews: 3, offers: 1 },
            { month: 'Apr', applications: 9, interviews: 1, offers: 1 }
          ],
          responseRate: 68, // percentage
          interviewRate: 28, // percentage
          offerRate: 12 // percentage
        }
      };
    } catch (error) {
      console.error('Error fetching application stats:', error);
      throw error;
    }
  },
  
  getActivityTimeline: async (userId, options = {}) => {
    try {
      console.log('Getting activity timeline for user:', userId, options);
      // Return mock activity timeline
      return {
        data: {
          activities: [
            {
              id: 1,
              type: 'application',
              title: 'Applied to Frontend Developer at TechCorp',
              date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 2,
              type: 'resume',
              title: 'Updated resume',
              date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 3,
              type: 'interview',
              title: 'Completed interview with DataSys Solutions',
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 4,
              type: 'learning',
              title: 'Completed React Course',
              date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 5,
              type: 'networking',
              title: 'Connected with 3 industry professionals',
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          activityByType: {
            application: 10,
            resume: 5,
            interview: 7,
            learning: 12,
            networking: 8
          }
        }
      };
    } catch (error) {
      console.error('Error fetching activity timeline:', error);
      throw error;
    }
  },
  
  getSkillsAnalytics: async (userId, options = {}) => {
    try {
      console.log('Getting skills analytics for user:', userId, options);
      // Return mock skills analytics
      return {
        data: {
          topSkills: [
            { name: 'JavaScript', level: 4, demand: 85 },
            { name: 'React', level: 4, demand: 92 },
            { name: 'Node.js', level: 3, demand: 78 },
            { name: 'HTML/CSS', level: 5, demand: 75 },
            { name: 'Python', level: 2, demand: 80 }
          ],
          skillGaps: [
            { name: 'TypeScript', level: 1, demand: 88 },
            { name: 'AWS', level: 0, demand: 85 },
            { name: 'Docker', level: 0, demand: 75 }
          ],
          skillGrowth: [
            { skill: 'JavaScript', progress: [3, 3, 4, 4], dates: ['Jan', 'Feb', 'Mar', 'Apr'] },
            { skill: 'React', progress: [2, 3, 3, 4], dates: ['Jan', 'Feb', 'Mar', 'Apr'] },
            { skill: 'Node.js', progress: [1, 2, 2, 3], dates: ['Jan', 'Feb', 'Mar', 'Apr'] }
          ]
        }
      };
    } catch (error) {
      console.error('Error fetching skills analytics:', error);
      throw error;
    }
  },
  
  getLearningStats: async (userId, options = {}) => {
    try {
      console.log('Getting learning stats for user:', userId, options);
      // Return mock learning statistics
      return {
        data: {
          coursesCompleted: 8,
          totalHours: 45,
          certificates: 3,
          byCategory: [
            { category: 'Programming', count: 4, hours: 22 },
            { category: 'Design', count: 2, hours: 12 },
            { category: 'Soft Skills', count: 1, hours: 5 },
            { category: 'Project Management', count: 1, hours: 6 }
          ],
          recentCourses: [
            { id: 1, title: 'Advanced React', progress: 100, completed: true },
            { id: 2, title: 'Node.js Masterclass', progress: 75, completed: false },
            { id: 3, title: 'UI/UX Design Principles', progress: 100, completed: true }
          ]
        }
      };
    } catch (error) {
      console.error('Error fetching learning stats:', error);
      throw error;
    }
  },
  
  getJobMarketInsights: async (options = {}) => {
    try {
      console.log('Getting job market insights:', options);
      // Return mock job market insights
      return {
        data: {
          topRoles: [
            { title: 'Frontend Developer', openings: 120, avgSalary: 95000 },
            { title: 'Full Stack Developer', openings: 85, avgSalary: 105000 },
            { title: 'DevOps Engineer', openings: 65, avgSalary: 110000 },
            { title: 'UX Designer', openings: 55, avgSalary: 90000 },
            { title: 'Data Scientist', openings: 45, avgSalary: 115000 }
          ],
          topSkills: [
            { name: 'JavaScript', demand: 92, growth: 5 },
            { name: 'React', demand: 88, growth: 8 },
            { name: 'Python', demand: 85, growth: 12 },
            { name: 'AWS', demand: 82, growth: 15 },
            { name: 'TypeScript', demand: 75, growth: 20 }
          ],
          locations: [
            { name: 'San Francisco', jobs: 450 },
            { name: 'New York', jobs: 380 },
            { name: 'Seattle', jobs: 320 },
            { name: 'Austin', jobs: 280 },
            { name: 'Boston', jobs: 230 }
          ],
          salaryTrends: [
            { role: 'Frontend Developer', trend: [85000, 88000, 92000, 95000], years: ['2020', '2021', '2022', '2023'] },
            { role: 'Full Stack Developer', trend: [90000, 95000, 100000, 105000], years: ['2020', '2021', '2022', '2023'] },
            { role: 'DevOps Engineer', trend: [95000, 100000, 105000, 110000], years: ['2020', '2021', '2022', '2023'] }
          ]
        }
      };
    } catch (error) {
      console.error('Error fetching job market insights:', error);
      throw error;
    }
  },
  
  getCareerGoals: async (userId) => {
    try {
      console.log('Getting career goals for user:', userId);
      // Return mock career goals
      return {
        data: {
          shortTerm: [
            { id: 1, title: 'Get certified in AWS', completed: false, dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 2, title: 'Build a portfolio project', completed: true, completedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() }
          ],
          midTerm: [
            { id: 3, title: 'Transition to Senior Developer role', completed: false, targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() }
          ],
          longTerm: [
            { id: 4, title: 'Move into a technical leadership position', completed: false, targetDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString() }
          ]
        }
      };
    } catch (error) {
      console.error('Error fetching career goals:', error);
      throw error;
    }
  }
};

// Calendar API calls
export const calendarAPI = {
  getEvents: async (userId, options = {}) => {
    try {
      console.log('Getting events for user:', userId, options);
      
      // Create some random events for the next 30 days
      const startDate = options.startDate ? new Date(options.startDate) : new Date();
      const events = [];
      
      for (let i = 0; i < 10; i++) {
        const eventDate = new Date(startDate);
        eventDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
        
        const startHour = 9 + Math.floor(Math.random() * 8); // Events between 9 AM and 5 PM
        const duration = 1 + Math.floor(Math.random() * 3); // 1-3 hour events
        
        const types = ['meeting', 'interview', 'deadline', 'networking', 'learning'];
        const eventType = types[Math.floor(Math.random() * types.length)];
        
        events.push({
          id: i + 1,
          title: `Sample ${eventType.charAt(0).toUpperCase() + eventType.slice(1)}`,
          description: `This is a sample ${eventType} event`,
          type: eventType,
          start: new Date(eventDate.setHours(startHour, 0, 0, 0)).toISOString(),
          end: new Date(eventDate.setHours(startHour + duration, 0, 0, 0)).toISOString(),
          allDay: false,
          location: eventType === 'interview' ? 'Zoom Call' : (eventType === 'meeting' ? 'Office' : null),
          color: getEventColor(eventType)
        });
      }
      
      return { data: events };
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },
  
  createEvent: async (eventData) => {
    try {
      console.log('Creating event:', eventData);
      return {
        success: true,
        data: {
          id: Math.floor(Math.random() * 1000),
          ...eventData,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },
  
  updateEvent: async (eventId, eventData) => {
    try {
      console.log('Updating event:', eventId, eventData);
      return {
        success: true,
        data: {
          id: eventId,
          ...eventData,
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },
  
  deleteEvent: async (eventId) => {
    try {
      console.log('Deleting event:', eventId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
};

// Helper function for calendar events
function getEventColor(type) {
  switch (type) {
    case 'interview':
      return '#1976d2'; // blue
    case 'meeting':
      return '#388e3c'; // green
    case 'deadline':
      return '#d32f2f'; // red
    case 'networking':
      return '#7b1fa2'; // purple
    case 'learning':
      return '#f57c00'; // orange
    default:
      return '#757575'; // gray
  }
}

// Store the last search params and timestamp to prevent duplicate calls
let lastSearchParams = null;
let lastSearchTime = 0;

const jobEndpoints = {
  searchJobs: async (params) => {
    // Prevent duplicate searches in quick succession (within 1 second)
    const currentTime = Date.now();
    const paramString = JSON.stringify(params);
    
    if (lastSearchParams === paramString && currentTime - lastSearchTime < 1000) {
      console.log('Preventing duplicate search');
      // Return the same data without logging
      return {
        success: true,
        data: {
          jobs: getUAEMockJobs().filter(job => filterJobsByParams(job, params)),
          total: getUAEMockJobs().filter(job => filterJobsByParams(job, params)).length
        }
      };
    }
    
    // Update last search params and time
    lastSearchParams = paramString;
    lastSearchTime = currentTime;
    
    // Log only once with better formatting
    console.log('Job search with UAE specific filters:', JSON.stringify(params, null, 2));
    
    // Filter the mock jobs based on the parameters
    const filteredJobs = getUAEMockJobs().filter(job => filterJobsByParams(job, params));
    
    return {
      success: true,
      data: {
        jobs: filteredJobs,
        total: filteredJobs.length
      }
    };
  },
  getRecentJobs: async (page, pageSize) => {
    // Mock implementation for recent jobs
    return {
      success: true,
      data: {
        jobs: getUAEMockJobs(),
        total: 10
      }
    };
  },
  getIndustries: async () => {
    // Mock implementation for industries
    return {
      success: true,
      data: [
        'Technology',
        'Healthcare',
        'Finance',
        'Education',
        'Manufacturing',
        'Retail',
        'Media',
        'Consulting'
      ]
    };
  },
  getSkillsList: async () => {
    // Mock implementation for skills list
    return {
      success: true,
      data: [
        'JavaScript',
        'Python',
        'React',
        'Node.js',
        'SQL',
        'Machine Learning',
        'Data Analysis',
        'Project Management',
        'Communication',
        'Leadership'
      ]
    };
  },
  getSavedJobs: async (userId) => {
    // Mock implementation for saved jobs
    return {
      success: true,
      data: []
    };
  },
  getSavedSearches: async (userId) => {
    // Mock implementation for saved searches
    return {
      success: true,
      data: []
    };
  },
  getSearchHistory: async (userId) => {
    // Mock implementation for search history
    return {
      success: true,
      data: []
    };
  },
  addSearchHistory: async (userId, searchData) => {
    // Mock implementation for adding to search history
    console.log('Adding to search history:', userId, searchData);
    return {
      success: true,
      data: {}
    };
  }
};

// Create API endpoints object that exposes all API functions
const apiEndpoints = {
  auth: authAPI,
  resume: resumeAPI,
  interview: interviewAPI,
  job: jobAPI,
  resumes: resumesAPI,
  skills: skillsAPI,
  checkHealth,
  admin: {
    getAnalyticsDashboard: (params = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      return api.get(`${endpoints.ADMIN_ENDPOINTS.ANALYTICS_DASHBOARD}${queryParams ? `?${queryParams}` : ''}`);
    }
  },
  jobs: {
    // Expose existing functions
    search: jobAPI.searchJobs,
    getRecommended: jobAPI.getRecommendedJobs,
    getById: jobAPI.getJobById,
    getJobTitles: async () => {
      try {
        // Check if we're using mock data (we are in this case)
        if (true) {
          return await mockApi.get(`${endpoints.apiEndpoints.skills.getJobTitles().url}`);
        }
        
        // Real API call would go here
        const response = await api.get(`${endpoints.JOB_ENDPOINTS.JOB_TITLES}`);
        return response;
      } catch (error) {
        console.error('Error getting job titles:', error);
        throw error;
      }
    }
  },
  settings: settingsAPI,
  ai: {
    getResumeSuggestions: async (data) => {
      try {
        // Try to call the actual API if available
        try {
          const response = await api.post('/api/ai/resume-suggestions', data);
          return response.data;
        } catch (apiError) {
          console.warn('Could not reach AI API, falling back to mock data:', apiError);
          
          // Generate mock data for development/testing
          const resumeId = data.resumeId;
          const analysisData = data.analysisData || {};
          const jobTitle = data.jobTitle || 'Unspecified Job';
          const jobDescription = data.jobDescription || '';
          
          // Extract data to use for suggestions
          const missingKeywords = analysisData.missing_keywords || [];
          const matchedKeywords = analysisData.matched_keywords || [];
          const score = analysisData.score || 0;
          
          // Generate mock response
          const mockResponse = {
            data: {
              summary: `Based on my analysis of your resume against the ${jobTitle} position, your resume shows a ${score}% match with the job requirements. Here are some targeted improvements to increase your chances of passing the ATS systems and impressing hiring managers.`,
              suggestions: [
                {
                  id: 'summary-1',
                  title: 'Enhance your professional summary',
                  category: 'summary',
                  priority: 'high',
                  description: `Your current summary could be enhanced with specific keywords that ATS systems look for. Consider incorporating terms like ${missingKeywords.slice(0, 3).join(', ')}.`,
                  examples: `Results-driven professional with expertise in ${matchedKeywords.slice(0, 3).join(', ')}. Demonstrated success in delivering high-quality solutions while leveraging ${missingKeywords.slice(0, 2).join(' and ')} knowledge.`,
                  actionable: true
                },
                {
                  id: 'exp-1',
                  title: 'Add measurable achievements to experience',
                  category: 'experience',
                  priority: 'medium',
                  description: 'Your experience section would be stronger with specific quantifiable achievements. Include metrics that demonstrate your impact.',
                  examples: `• Improved system performance by 40% through implementation of optimized algorithms\n• Reduced operational costs by $150,000 annually by automating manual processes\n• Led a team of 5 engineers to deliver project 2 weeks ahead of schedule`,
                  actionable: true
                },
                {
                  id: 'skills-1',
                  title: 'Add missing technical skills',
                  category: 'skills',
                  priority: 'high',
                  description: `Your resume is missing several key skills that employers are looking for. Consider adding: ${missingKeywords.slice(0, 5).join(', ')}`,
                  examples: null,
                  actionable: true
                },
                {
                  id: 'format-1',
                  title: 'Improve resume formatting',
                  category: 'format',
                  priority: 'low',
                  description: 'Ensure your resume has a clean, consistent format that is ATS-friendly. Use standard headings and avoid complex layouts or graphics.',
                  examples: 'Use section headers like "Experience," "Education," and "Skills" that ATS systems can easily recognize. Avoid tables, columns, headers/footers, and graphics that may confuse ATS parsers.',
                  actionable: false
                }
              ],
              nextSteps: [
                "Update your professional summary to include more relevant keywords",
                "Add measurable achievements to your experience section",
                "Include the missing technical skills in your skills section",
                "Use more action verbs at the beginning of bullet points",
                "Ensure your resume format is ATS-friendly"
              ]
            }
          };
          
          return mockResponse;
        }
      } catch (error) {
        console.error('Error getting resume suggestions:', error);
        throw error;
      }
    },
    
    applySuggestion: async (resumeId, suggestion) => {
      try {
        // Try the actual API call if possible
        try {
          const response = await api.post(`/api/ai/apply-suggestion/${resumeId}`, { suggestion });
          return response.data;
        } catch (apiError) {
          console.warn('Could not apply suggestion via API, simulating success for development:', apiError);
          
          // Simulate success for development
          return {
            success: true,
            message: 'Suggestion applied successfully'
          };
        }
      } catch (error) {
        console.error('Error applying suggestion:', error);
        throw error;
      }
    }
  }
};

export default apiEndpoints;

// Helper function to get UAE-specific mock jobs
function getUAEMockJobs() {
  return [
    {
      id: 'job-1',
      title: 'Software Engineer',
      company: 'Emirates Technology Solutions',
      location: 'Dubai, UAE',
      emirate: 'Dubai',
      jobType: 'Full-time',
      salaryRange: '15,000 - 25,000 AED/month',
      salaryMin: 15000,
      salaryMax: 25000,
      salaryType: 'monthly',
      description: 'Join our team to develop innovative solutions for the UAE market...',
      requirements: ['3+ years of experience', 'Bachelor\'s degree', 'JavaScript/React expertise'],
      benefits: ['Housing allowance', 'Health insurance', 'Annual flight tickets'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'private',
      companyLocation: 'Dubai Internet City (Free Zone)',
      postedDate: '2023-05-15',
      deadline: '2023-06-15',
      matchScore: 85,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-2',
      title: 'Financial Analyst',
      company: 'Abu Dhabi Investment Authority',
      location: 'Abu Dhabi, UAE',
      emirate: 'Abu Dhabi',
      jobType: 'Full-time',
      salaryRange: '18,000 - 30,000 AED/month',
      salaryMin: 18000,
      salaryMax: 30000,
      salaryType: 'monthly',
      description: 'Analyze investment opportunities across the MENA region...',
      requirements: ['5+ years of experience', 'CFA designation', 'Arabic & English fluency'],
      benefits: ['Housing allowance', 'Education allowance for children', 'Annual flight tickets'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'government',
      companyLocation: 'Mainland',
      postedDate: '2023-05-12',
      deadline: '2023-06-12',
      matchScore: 78,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-3',
      title: 'Marketing Manager',
      company: 'Etisalat',
      location: 'Dubai, UAE',
      emirate: 'Dubai',
      jobType: 'Full-time',
      salaryRange: '25,000 - 35,000 AED/month',
      salaryMin: 25000,
      salaryMax: 35000,
      salaryType: 'monthly',
      description: 'Lead marketing strategies for telecommunications products in the UAE market...',
      requirements: ['7+ years of marketing experience', 'Master\'s degree preferred', 'Digital marketing expertise'],
      benefits: ['Housing allowance', 'Health insurance', 'Annual flight tickets', 'Performance bonus'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'semi-government',
      companyLocation: 'Mainland',
      postedDate: '2023-05-10',
      deadline: '2023-06-10',
      matchScore: 92,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-4',
      title: 'Civil Engineer',
      company: 'EMAAR Properties',
      location: 'Dubai, UAE',
      emirate: 'Dubai',
      jobType: 'Full-time',
      salaryRange: '12,000 - 18,000 AED/month',
      salaryMin: 12000,
      salaryMax: 18000,
      salaryType: 'monthly',
      description: 'Work on prestigious construction projects across Dubai...',
      requirements: ['3+ years of experience', 'Bachelor\'s in Civil Engineering', 'AutoCAD proficiency'],
      benefits: ['Transportation allowance', 'Health insurance', 'Annual flight tickets'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'private',
      companyLocation: 'Mainland',
      postedDate: '2023-05-08',
      deadline: '2023-06-08',
      matchScore: 75,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-5',
      title: 'HR Manager',
      company: 'Emirates NBD',
      location: 'Dubai, UAE',
      emirate: 'Dubai',
      jobType: 'Full-time',
      salaryRange: '22,000 - 30,000 AED/month',
      salaryMin: 22000,
      salaryMax: 30000,
      salaryType: 'monthly',
      description: 'Oversee HR operations for one of the largest banking groups in the Middle East...',
      requirements: ['8+ years of HR experience', 'CIPD qualification', 'Banking sector experience preferred'],
      benefits: ['Housing allowance', 'Education allowance', 'Health insurance for family'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'private',
      companyLocation: 'Mainland',
      postedDate: '2023-05-05',
      deadline: '2023-06-05',
      matchScore: 82,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-6',
      title: 'ESL Teacher',
      company: 'GEMS Education',
      location: 'Sharjah, UAE',
      emirate: 'Sharjah',
      jobType: 'Full-time',
      salaryRange: '10,000 - 15,000 AED/month',
      salaryMin: 10000,
      salaryMax: 15000,
      salaryType: 'monthly',
      description: 'Teach English as a Second Language to primary school students...',
      requirements: ['2+ years teaching experience', 'TEFL/TESOL certification', 'Bachelor\'s degree in Education'],
      benefits: ['Shared accommodation', 'Health insurance', 'Annual flight tickets'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'private',
      companyLocation: 'Mainland',
      postedDate: '2023-05-03',
      deadline: '2023-06-03',
      matchScore: 70,
      nationality: 'UK, US, Canada, Australia, New Zealand, Ireland, South Africa'
    },
    {
      id: 'job-7',
      title: 'Restaurant Manager',
      company: 'Jumeirah Group',
      location: 'Abu Dhabi, UAE',
      emirate: 'Abu Dhabi',
      jobType: 'Full-time',
      salaryRange: '8,000 - 12,000 AED/month',
      salaryMin: 8000,
      salaryMax: 12000,
      salaryType: 'monthly',
      description: 'Manage operations of a luxury hotel restaurant...',
      requirements: ['5+ years in hospitality', 'F&B management experience', 'Excellent customer service skills'],
      benefits: ['Accommodation', 'Transportation', 'Meals on duty', 'Health insurance'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'private',
      companyLocation: 'Mainland',
      postedDate: '2023-04-30',
      deadline: '2023-05-30',
      matchScore: 68,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-8',
      title: 'Legal Counsel',
      company: 'Department of Economic Development',
      location: 'Dubai, UAE',
      emirate: 'Dubai',
      jobType: 'Full-time',
      salaryRange: '35,000 - 45,000 AED/month',
      salaryMin: 35000,
      salaryMax: 45000,
      salaryType: 'monthly',
      description: 'Provide legal advice on economic regulations and business licensing...',
      requirements: ['8+ years legal experience', 'UAE legal knowledge', 'Arabic & English fluency', 'LLM preferred'],
      benefits: ['Housing allowance', 'Education allowance', 'Government pension scheme'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'government',
      companyLocation: 'Mainland',
      postedDate: '2023-04-28',
      deadline: '2023-05-28',
      matchScore: 88,
      nationality: 'UAE Nationals Only'
    },
    {
      id: 'job-9',
      title: 'E-commerce Specialist',
      company: 'noon.com',
      location: 'Dubai, UAE',
      emirate: 'Dubai',
      jobType: 'Full-time',
      salaryRange: '10,000 - 15,000 AED/month',
      salaryMin: 10000,
      salaryMax: 15000,
      salaryType: 'monthly',
      description: 'Manage product listings and optimize sales for the region\'s leading e-commerce platform...',
      requirements: ['2+ years e-commerce experience', 'Digital marketing skills', 'Data analytics knowledge'],
      benefits: ['Health insurance', 'Transportation allowance', 'Performance bonus'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'private',
      companyLocation: 'Dubai Media City (Free Zone)',
      postedDate: '2023-04-25',
      deadline: '2023-05-25',
      matchScore: 76,
      nationality: 'All Nationalities'
    },
    // New additional UAE-specific jobs with various filters
    {
      id: 'job-10',
      title: 'Remote Web Developer',
      company: 'Desert Tech Solutions',
      location: 'Remote, UAE',
      emirate: 'Any',
      jobType: 'Full-time',
      salaryRange: '15,000 - 22,000 AED/month',
      salaryMin: 15000,
      salaryMax: 22000,
      salaryType: 'monthly',
      description: 'Work remotely on web development projects for UAE-based clients...',
      requirements: ['3+ years web development', 'React.js', 'Node.js', 'Arabic & English communication'],
      benefits: ['Flexible hours', 'Health insurance', 'Annual bonus'],
      visaStatus: 'Visit Visa Accepted',
      sectorType: 'private',
      companyLocation: 'Dubai Internet City (Free Zone)',
      postedDate: '2023-05-20',
      deadline: '2023-06-20',
      matchScore: 83,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-11',
      title: 'Part-time Graphic Designer',
      company: 'Sharjah Media City',
      location: 'Sharjah, UAE',
      emirate: 'Sharjah',
      jobType: 'Part-time',
      salaryRange: '5,000 - 8,000 AED/month',
      salaryMin: 5000,
      salaryMax: 8000,
      salaryType: 'monthly',
      description: 'Create visual concepts for UAE brands and marketing campaigns...',
      requirements: ['Adobe Creative Suite', 'Portfolio of work', 'Branding experience'],
      benefits: ['Flexible schedule', 'Transportation allowance'],
      visaStatus: 'Residence Visa Required',
      sectorType: 'semi-government',
      companyLocation: 'Sharjah Media City (Free Zone)',
      postedDate: '2023-05-18',
      deadline: '2023-06-18',
      matchScore: 72,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-12',
      title: 'Project Manager - Construction',
      company: 'Aldar Properties',
      location: 'Abu Dhabi, UAE',
      emirate: 'Abu Dhabi',
      jobType: 'Contract',
      salaryRange: '25,000 - 35,000 AED/month',
      salaryMin: 25000,
      salaryMax: 35000,
      salaryType: 'monthly',
      description: 'Oversee construction projects in Abu Dhabi...',
      requirements: ['PMP Certification', '7+ years experience', 'Civil Engineering degree'],
      benefits: ['Project completion bonus', 'Housing allowance', 'Transportation allowance'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'private',
      companyLocation: 'Mainland',
      postedDate: '2023-05-16',
      deadline: '2023-06-16',
      matchScore: 80,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-13',
      title: 'Sales Representative',
      company: 'Al-Futtaim Group',
      location: 'Ajman, UAE',
      emirate: 'Ajman',
      jobType: 'Full-time',
      salaryRange: '8,000 - 15,000 AED/month',
      salaryMin: 8000,
      salaryMax: 15000,
      salaryType: 'monthly',
      description: 'Represent our retail brands across Ajman...',
      requirements: ['Sales experience', 'Customer service skills', 'Arabic & English fluency'],
      benefits: ['Commission structure', 'Health insurance', 'Transportation allowance'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'private',
      companyLocation: 'Mainland',
      postedDate: '2023-05-14',
      deadline: '2023-06-14',
      matchScore: 65,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-14',
      title: 'Remote Customer Support Specialist',
      company: 'Careem',
      location: 'Remote, UAE',
      emirate: 'Any',
      jobType: 'Full-time',
      salaryRange: '7,000 - 12,000 AED/month',
      salaryMin: 7000,
      salaryMax: 12000,
      salaryType: 'monthly',
      description: 'Provide customer support for our ride-hailing platform...',
      requirements: ['Customer service experience', 'Problem-solving skills', 'Arabic & English fluency'],
      benefits: ['Flexible hours', 'Health insurance', 'Careem credits'],
      visaStatus: 'Any Visa Status',
      sectorType: 'private',
      companyLocation: 'Dubai Internet City (Free Zone)',
      postedDate: '2023-05-13',
      deadline: '2023-06-13',
      matchScore: 70,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-15',
      title: 'Petroleum Engineer',
      company: 'ADNOC',
      location: 'Abu Dhabi, UAE',
      emirate: 'Abu Dhabi',
      jobType: 'Full-time',
      salaryRange: '30,000 - 45,000 AED/month',
      salaryMin: 30000,
      salaryMax: 45000,
      salaryType: 'monthly',
      description: 'Work on oil and gas extraction projects across the UAE...',
      requirements: ['Petroleum Engineering degree', '5+ years experience', 'Knowledge of extraction methods'],
      benefits: ['Housing allowance', 'Education allowance', 'Annual tickets', 'Transportation allowance', 'Health insurance for family'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'government',
      companyLocation: 'Mainland',
      postedDate: '2023-05-12',
      deadline: '2023-06-12',
      matchScore: 90,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-16',
      title: 'Nurse Practitioner',
      company: 'Cleveland Clinic Abu Dhabi',
      location: 'Abu Dhabi, UAE',
      emirate: 'Abu Dhabi',
      jobType: 'Full-time',
      salaryRange: '15,000 - 25,000 AED/month',
      salaryMin: 15000,
      salaryMax: 25000,
      salaryType: 'monthly',
      description: 'Provide nursing care in a world-class healthcare facility...',
      requirements: ['Nursing degree', 'License to practice', '3+ years experience', 'English fluency'],
      benefits: ['Housing allowance', 'Education allowance', 'Annual tickets', 'Health insurance for family'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'private',
      companyLocation: 'Mainland',
      postedDate: '2023-05-11',
      deadline: '2023-06-11',
      matchScore: 75,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-17',
      title: 'UI/UX Designer',
      company: 'Digital Oasis',
      location: 'Sharjah, UAE',
      emirate: 'Sharjah',
      jobType: 'Full-time',
      salaryRange: '12,000 - 18,000 AED/month',
      salaryMin: 12000,
      salaryMax: 18000,
      salaryType: 'monthly',
      description: 'Design user interfaces for mobile and web applications...',
      requirements: ['Portfolio of UI/UX work', 'Figma proficiency', 'User testing experience'],
      benefits: ['Flexible hours', 'Health insurance', 'Transportation allowance'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'private',
      companyLocation: 'Sharjah Media City (Free Zone)',
      postedDate: '2023-05-10',
      deadline: '2023-06-10',
      matchScore: 82,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-18',
      title: 'Tour Guide',
      company: 'Ras Al Khaimah Tourism',
      location: 'Ras Al Khaimah, UAE',
      emirate: 'Ras Al Khaimah',
      jobType: 'Part-time',
      salaryRange: '5,000 - 8,000 AED/month',
      salaryMin: 5000,
      salaryMax: 8000,
      salaryType: 'monthly',
      description: 'Lead tourists through popular attractions in Ras Al Khaimah...',
      requirements: ['Tourism experience', 'Knowledge of UAE history', 'Multiple languages (English required)'],
      benefits: ['Commission on bookings', 'Flexible schedule'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'government',
      companyLocation: 'Mainland',
      postedDate: '2023-05-09',
      deadline: '2023-06-09',
      matchScore: 68,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-19',
      title: 'Data Scientist',
      company: 'Fujairah Data Analytics',
      location: 'Fujairah, UAE',
      emirate: 'Fujairah',
      jobType: 'Full-time',
      salaryRange: '20,000 - 30,000 AED/month',
      salaryMin: 20000,
      salaryMax: 30000,
      salaryType: 'monthly',
      description: 'Analyze large datasets to derive insights for business decisions...',
      requirements: ['Python', 'Machine Learning', 'Statistics background', 'Data visualization skills'],
      benefits: ['Housing allowance', 'Health insurance', 'Annual flight tickets'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'private',
      companyLocation: 'Mainland',
      postedDate: '2023-05-08',
      deadline: '2023-06-08',
      matchScore: 85,
      nationality: 'All Nationalities'
    },
    {
      id: 'job-20',
      title: 'Social Media Manager',
      company: 'UAQ Marketing',
      location: 'Umm Al Quwain, UAE',
      emirate: 'Umm Al Quwain',
      jobType: 'Full-time',
      salaryRange: '10,000 - 15,000 AED/month',
      salaryMin: 10000,
      salaryMax: 15000,
      salaryType: 'monthly',
      description: 'Manage social media accounts for local and international brands...',
      requirements: ['Social media experience', 'Content creation skills', 'Digital marketing knowledge'],
      benefits: ['Health insurance', 'Transportation allowance'],
      visaStatus: 'Employment Visa Provided',
      sectorType: 'private',
      companyLocation: 'Mainland',
      postedDate: '2023-05-07',
      deadline: '2023-06-07',
      matchScore: 73,
      nationality: 'All Nationalities'
    }
  ];
}

// Helper function to filter jobs based on search parameters
function filterJobsByParams(job, params) {
  // Title or keyword search
  if (params.search && !job.title.toLowerCase().includes(params.search.toLowerCase()) && 
      !job.company.toLowerCase().includes(params.search.toLowerCase())) {
    return false;
  }
  
  // Location search - more specific handling for UAE locations
  if (params.location) {
    // If searching for a specific emirate in location field
    const emirates = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];
    const searchedEmirate = emirates.find(emirate => 
      params.location.toLowerCase().includes(emirate.toLowerCase())
    );
    
    if (searchedEmirate && job.emirate !== searchedEmirate) {
      return false;
    } else if (!searchedEmirate && !job.location.toLowerCase().includes(params.location.toLowerCase())) {
      return false;
    }
  }
  
  // Emirates filter
  if (params.emirates && params.emirates.length > 0 && !params.emirates.includes(job.emirate)) {
    return false;
  }
  
  // Job Type filter - more precise matching
  if (params.jobTypes && params.jobTypes.length > 0 && !params.jobTypes.includes(job.jobType)) {
    return false;
  }
  
  // Visa Status filter
  if (params.visaStatus && params.visaStatus.length > 0 && !params.visaStatus.includes(job.visaStatus)) {
    return false;
  }
  
  // Experience Level filter
  if (params.experience && params.experience.length > 0) {
    const jobLevel = getExperienceLevelFromRequirements(job.requirements);
    if (!params.experience.includes(jobLevel)) {
      return false;
    }
  }
  
  // Salary Range filter
  if (params.salary && params.salary.length === 2) {
    const [minSalary, maxSalary] = params.salary;
    
    // Convert job salary to comparable format based on salary type
    let jobMinSalary = job.salaryMin;
    let jobMaxSalary = job.salaryMax;
    
    if (params.salaryType === 'annual' && job.salaryType === 'monthly') {
      // Convert monthly to annual
      jobMinSalary = job.salaryMin * 12;
      jobMaxSalary = job.salaryMax * 12;
    } else if (params.salaryType === 'monthly' && job.salaryType === 'annual') {
      // Convert annual to monthly
      jobMinSalary = job.salaryMin / 12;
      jobMaxSalary = job.salaryMax / 12;
    }
    
    // Check if the job's salary range overlaps with the filter range
    if (jobMaxSalary < minSalary || jobMinSalary > maxSalary) {
      return false;
    }
  }
  
  // Benefits filter - exact match for selected benefits
  if (params.benefits && params.benefits.length > 0) {
    // The job must have ALL selected benefits to match
    if (!job.benefits || !params.benefits.every(benefit => 
      job.benefits.some(jobBenefit => 
        jobBenefit.toLowerCase().includes(benefit.toLowerCase())
      )
    )) {
      return false;
    }
  }
  
  // Remote work filter
  if (params.remote === true) {
    if (!job.location.toLowerCase().includes('remote')) {
      return false;
    }
  }
  
  // Date Posted filter
  if (params.datePosted && params.datePosted !== 'any') {
    const jobPostedDate = new Date(job.postedDate);
    const currentDate = new Date();
    
    switch (params.datePosted) {
      case 'today':
        // Check if job was posted today
        if (jobPostedDate.toDateString() !== currentDate.toDateString()) {
          return false;
        }
        break;
      case 'week':
        // Check if job was posted within the last 7 days
        const weekAgo = new Date(currentDate);
        weekAgo.setDate(currentDate.getDate() - 7);
        if (jobPostedDate < weekAgo) {
          return false;
        }
        break;
      case 'month':
        // Check if job was posted within the last 30 days
        const monthAgo = new Date(currentDate);
        monthAgo.setDate(currentDate.getDate() - 30);
        if (jobPostedDate < monthAgo) {
          return false;
        }
        break;
    }
  }
  
  // Sector Type filter
  if (params.sectorType && params.sectorType !== 'all' && job.sectorType !== params.sectorType) {
    return false;
  }
  
  // Company Location filter (mainland/freezone)
  if (params.companyLocation && params.companyLocation !== 'all') {
    if (params.companyLocation === 'freezone' && !job.companyLocation.toLowerCase().includes('free zone')) {
      return false;
    }
    if (params.companyLocation === 'mainland' && !job.companyLocation.toLowerCase().includes('mainland')) {
      return false;
    }
  }
  
  // Skills filter - improved matching
  if (params.skills && params.skills.length > 0) {
    // Check for any of the selected skills in job requirements
    const jobRequirementsText = job.requirements ? job.requirements.join(' ').toLowerCase() : '';
    const hasMatchingSkill = params.skills.some(skill => 
      jobRequirementsText.includes(skill.toLowerCase())
    );
    
    if (!hasMatchingSkill) {
      return false;
    }
  }
  
  // Industry filter - improved matching
  if (params.industries && params.industries.length > 0) {
    // In a real app, we'd have an industry field for each job
    // For our mock data, check company name, title and description
    const jobText = `${job.company} ${job.title} ${job.description}`.toLowerCase();
    const hasMatchingIndustry = params.industries.some(industry => 
      jobText.includes(industry.toLowerCase())
    );
    
    if (!hasMatchingIndustry) {
      return false;
    }
  }
  
  // Job passed all filters
  return true;
}

// Helper function to determine experience level from requirements
function getExperienceLevelFromRequirements(requirements) {
  if (!requirements || !Array.isArray(requirements)) {
    return 'Entry level';
  }
  
  // Join requirements into a string for easier searching
  const reqString = requirements.join(' ').toLowerCase();
  
  if (reqString.includes('executive') || reqString.includes('c-level') || reqString.includes('ceo') || 
      reqString.includes('cto') || reqString.includes('cfo') || reqString.includes('10+ years')) {
    return 'Executive';
  }
  
  if (reqString.includes('manager') || reqString.includes('head of') || reqString.includes('director') || 
      reqString.includes('8+ years') || reqString.includes('7+ years')) {
    return 'Manager';
  }
  
  if (reqString.includes('senior') || reqString.includes('lead') || reqString.includes('5+ years') || 
      reqString.includes('6+ years')) {
    return 'Senior level';
  }
  
  if (reqString.includes('3+ years') || reqString.includes('4+ years') || reqString.includes('mid')) {
    return 'Mid level';
  }
  
  return 'Entry level';
}