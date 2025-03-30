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
const getConsistentAvatarUrl = (userId) => {
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
        if (!updatedProfile.avatar) {
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
      // Log the update attempt for debugging
      console.log('Updating profile for user:', userId, profileData);
      // Return success response
      return { success: true };
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
        
        // Get consistent avatar URL
        const avatarUrl = getConsistentAvatarUrl(userId);
        console.log(`DEV MODE: Generated mock avatar: ${avatarUrl}`);
        
        return {
          success: true,
          data: {
            avatarUrl: avatarUrl
          }
        };
      }
      
      // Real API call for production
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
      return {
        data: {
          id: userId,
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          title: 'Frontend Developer',
          bio: 'Passionate developer with experience in React and modern frontend technologies.',
          location: 'New York, NY',
          phone: '+1 123-456-7890',
          email: 'john.doe@example.com',
          avatar: 'https://via.placeholder.com/150',
          visibility: {
            isPublic: true,
            showEmail: false,
            showPhone: false,
            showEducation: true,
            showExperience: true,
            showSkills: true
          },
          socialLinks: {
            linkedin: 'https://linkedin.com/in/johndoe',
            github: 'https://github.com/johndoe',
            twitter: 'https://twitter.com/johndoe',
            portfolio: 'https://johndoe.com'
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
            institution: 'University of Technology',
            degree: 'Bachelor of Computer Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2015-09-01',
            endDate: '2019-06-30',
            grade: '3.8 GPA',
            description: 'Focused on web development and algorithms.'
          },
          {
            id: 2,
            institution: 'Online Academy',
            degree: 'Certification',
            fieldOfStudy: 'Frontend Development',
            startDate: '2020-01-15',
            endDate: '2020-04-30',
            grade: 'Pass with Distinction',
            description: 'Intensive program on modern JavaScript frameworks.'
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
            company: 'Tech Solutions Inc.',
            title: 'Frontend Developer',
            location: 'New York, NY',
            startDate: '2019-08-01',
            endDate: null, // Current job
            description: 'Developing and maintaining web applications using React, Redux, and TypeScript.'
          },
          {
            id: 2,
            company: 'Digital Agency',
            title: 'Junior Web Developer',
            location: 'Boston, MA',
            startDate: '2018-05-15',
            endDate: '2019-07-31',
            description: 'Worked on client websites using HTML, CSS, and JavaScript.'
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching experience:', error);
      throw error;
    }
  },
  
  updateProfile: async (userId, profileData) => {
    try {
      // Log the update attempt
      console.log('Updating profile for user:', userId, profileData);
      // Return success with the same data
      return {
        success: true,
        data: {
          ...profileData,
          id: userId,
          avatar: 'https://via.placeholder.com/150' // Keep the same avatar
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
        
        // Get consistent avatar URL
        const avatarUrl = getConsistentAvatarUrl(userId);
        console.log(`DEV MODE: Generated mock avatar: ${avatarUrl}`);
        
        return {
          success: true,
          data: {
            avatarUrl: avatarUrl
          }
        };
      }
      
      // Real API call for production
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
    try {
      // Return mock search history
      return {
        data: [
          {
            id: 1,
            query: 'frontend developer',
            filters: {
              location: 'Remote',
              jobType: ['Full-time']
            },
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            query: 'react developer',
            filters: {
              location: 'New York, NY',
              jobType: ['Full-time', 'Contract']
            },
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching search history:', error);
      throw error;
    }
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
  
  addSearchHistory: async (userId, searchData) => {
    try {
      console.log('Adding search to history for user:', userId, searchData);
      return {
        success: true,
        data: {
          id: Math.floor(Math.random() * 1000),
          ...searchData,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error adding search to history:', error);
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

// Create API endpoints object that exposes all API functions
const apiEndpoints = {
  auth: authAPI,
  resume: resumeAPI,
  interview: interviewAPI,
  job: jobAPI,
  user: userAPI,
  settings: settingsAPI,
  profiles: profilesAPI,
  jobs: jobsAPI,
  dashboard: dashboardAPI,
  notifications: notificationsAPI,
  goals: goalsAPI,
  analytics: analyticsAPI,
  calendar: calendarAPI,
  checkHealth,
  admin: {
    getAnalyticsDashboard: (params = {}) => {
      const queryParams = new URLSearchParams(params).toString();
      return api.get(`${endpoints.ADMIN_ENDPOINTS.ANALYTICS_DASHBOARD}${queryParams ? `?${queryParams}` : ''}`);
    }
  }
};

export default apiEndpoints;