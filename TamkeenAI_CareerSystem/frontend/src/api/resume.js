/**
 * Resume API Service
 * Handles all API calls related to resume functionalities
 */
import apiClient from './apiClient';
import { RESUME_ENDPOINTS } from '../api/endpoints';

// Get all resumes for a user
const getUserResumes = async (userId) => {
  try {
    const response = await apiClient.get(`${RESUME_ENDPOINTS.GET_USER_RESUMES(userId)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user resumes:', error);
    throw error;
  }
};

// Get a single resume by ID
const getResumeById = async (resumeId) => {
  try {
    const response = await apiClient.get(`${RESUME_ENDPOINTS.GET_BY_ID(resumeId)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resume:', error);
    throw error;
  }
};

// Create a new resume
const createResume = async (resumeData) => {
  try {
    const response = await apiClient.post(RESUME_ENDPOINTS.CREATE, resumeData);
    return response.data;
  } catch (error) {
    console.error('Error creating resume:', error);
    throw error;
  }
};

// Update an existing resume
const updateResume = async (resumeId, resumeData) => {
  try {
    const response = await apiClient.put(`${RESUME_ENDPOINTS.UPDATE_RESUME(resumeId)}`, resumeData);
    return response.data;
  } catch (error) {
    console.error('Error updating resume:', error);
    throw error;
  }
};

// Delete a resume
const deleteResume = async (resumeId) => {
  try {
    const response = await apiClient.delete(`${RESUME_ENDPOINTS.DELETE(resumeId)}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
};

// Analyze a resume
const analyzeResume = async (resumeId) => {
  try {
    const response = await apiClient.post(`${RESUME_ENDPOINTS.ANALYZE}/${resumeId}`);
    return response.data;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
};

// Get resume templates
const getResumeTemplates = async () => {
  try {
    const response = await apiClient.get(RESUME_ENDPOINTS.GET_RESUME_TEMPLATES);
    return response.data;
  } catch (error) {
    console.error('Error fetching resume templates:', error);
    throw error;
  }
};

// Analyze resume with ATS analyzer
const analyzeResumeWithATS = async (file, jobTitle = '', jobDescription = '') => {
  try {
    // Create a FormData object to handle file upload
    const formData = new FormData();
    formData.append('file', file);
    
    if (jobTitle) {
      formData.append('job_title', jobTitle);
    }
    
    if (jobDescription) {
      formData.append('job_description', jobDescription);
    }
    
    const response = await apiClient.post('/ats/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000 // Increase timeout for PDF extraction
    });
    
    return response;
  } catch (error) {
    console.error('Error analyzing resume with ATS:', error);
    
    // Enhanced error reporting
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 400 && error.response.data.error) {
        throw new Error(`PDF extraction failed: ${error.response.data.error}`);
      }
    }
    
    throw error;
  }
};

// Analyze resume with ATS and DeepSeek AI
const analyzeResumeWithDeepSeek = async (file, jobTitle, jobDescription) => {
  try {
    // Create a FormData object to handle file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_title', jobTitle || 'Unspecified Job');
    formData.append('job_description', jobDescription);
    
    // Explicitly get API key from environment if available
    const apiKey = window.ENV_VARS?.DEEPSEEK_API_KEY || process.env.REACT_APP_DEEPSEEK_API_KEY || '';
    if (apiKey) {
      formData.append('api_key', apiKey);
    }
    
    const response = await apiClient.post('/ats/analyze-with-deepseek', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000 // Increase timeout for DeepSeek analysis
    });
    
    return response;
  } catch (error) {
    console.error('Error analyzing resume with DeepSeek:', error);
    
    // Enhanced error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 400 && error.response.data.error) {
        if (error.response.data.error.includes('PDF') || error.response.data.error.includes('extract')) {
          throw new Error(`PDF extraction failed: ${error.response.data.error}`);
        } else if (error.response.data.error.includes('API key') || error.response.data.error.includes('DeepSeek')) {
          throw new Error(`DeepSeek AI issue: ${error.response.data.error}`);
        }
      }
    }
    
    throw error;
  }
};

// Extract keywords from resume and job description
const extractKeywords = async (resumeText, jobDescription) => {
  try {
    const response = await apiClient.post('/ats/keywords', {
      resume_text: resumeText,
      job_description: jobDescription
    });
    
    return response;
  } catch (error) {
    console.error('Error extracting keywords:', error);
    throw error;
  }
};

// Get optimization suggestions for resume
const getOptimizationSuggestions = async (resumeText, jobTitle, jobDescription) => {
  try {
    const formData = new FormData();
    formData.append('resume_text', resumeText);
    formData.append('job_title', jobTitle);
    formData.append('job_description', jobDescription);
    
    const response = await apiClient.post('/ats/optimize', formData);
    return response;
  } catch (error) {
    console.error('Error getting optimization suggestions:', error);
    throw error;
  }
};

// Export all functions
const resumeApi = {
  getUserResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  analyzeResume,
  getResumeTemplates,
  analyzeResumeWithATS,
  analyzeResumeWithDeepSeek,
  extractKeywords,
  getOptimizationSuggestions
};

export default resumeApi; 