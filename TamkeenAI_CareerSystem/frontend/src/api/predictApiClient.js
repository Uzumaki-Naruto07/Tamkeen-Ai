/**
 * PredictAPI Client
 * 
 * This module provides a client for the PredictAPI server for AI predictions,
 * including resume analysis, job matching, and career advice.
 */

import axios from 'axios';

// Configuration
const PREDICT_API_BASE_URL = import.meta.env.VITE_PREDICT_API_URL || 'http://localhost:5003';

// Create axios instance
const predictApiClient = axios.create({
  baseURL: PREDICT_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor for handling form data
predictApiClient.interceptors.request.use(config => {
  // If the request has FormData, make sure Content-Type is not set
  if (config.data instanceof FormData) {
    config.headers['Content-Type'] = 'multipart/form-data';
  }
  return config;
});

/**
 * Check if the PredictAPI server is running
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await predictApiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking PredictAPI health:', error);
    return {
      status: 'error',
      message: 'Could not connect to PredictAPI server',
      using_mock: true
    };
  }
};

/**
 * Analyze a resume against a job description
 * @param {File} file - Resume file
 * @param {string} jobTitle - Job title
 * @param {string} jobDescription - Job description
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeResume = async (file, jobTitle, jobDescription) => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_title', jobTitle);
    formData.append('job_description', jobDescription);
    
    // Send request
    const response = await predictApiClient.post('/analyze-resume', formData);
    return response.data;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    if (error.response) {
      // Server responded with error
      return error.response.data;
    } else {
      // Network or client error
      return {
        error: error.message,
        status: 'client_error',
        success: false
      };
    }
  }
};

/**
 * Match a resume against job listings
 * @param {string} resumeText - Resume text content
 * @param {Array} jobListings - Array of job listing objects
 * @param {boolean} detailed - Whether to provide detailed analysis
 * @returns {Promise<Object>} Matching results
 */
export const matchJobs = async (resumeText, jobListings, detailed = false) => {
  try {
    const response = await predictApiClient.post('/match-jobs', {
      resume_text: resumeText,
      job_listings: jobListings,
      detailed: detailed
    });
    return response.data;
  } catch (error) {
    console.error('Error matching jobs:', error);
    if (error.response) {
      return error.response.data;
    } else {
      return {
        error: error.message,
        status: 'client_error',
        success: false
      };
    }
  }
};

/**
 * Generate career advice
 * @param {string} question - Career question
 * @param {Object} background - User background information
 * @param {string} language - Language code (default: en)
 * @returns {Promise<Object>} Career advice
 */
export const getCareerAdvice = async (question, background = {}, language = 'en') => {
  try {
    const response = await predictApiClient.post('/career-advice', {
      question,
      background,
      language
    });
    return response.data;
  } catch (error) {
    console.error('Error getting career advice:', error);
    if (error.response) {
      return error.response.data;
    } else {
      return {
        error: error.message,
        status: 'client_error',
        success: false
      };
    }
  }
};

/**
 * Test connection to DeepSeek API
 * @returns {Promise<Object>} Connection status
 */
export const testConnection = async () => {
  try {
    const response = await predictApiClient.get('/test-connection');
    return response.data;
  } catch (error) {
    console.error('Error testing connection:', error);
    return {
      connected: false,
      error: error.message,
      message: 'Failed to connect to PredictAPI server',
      status: 'client_error'
    };
  }
};

// Export as an object
const predictApi = {
  checkHealth,
  analyzeResume,
  matchJobs,
  getCareerAdvice,
  testConnection
};

export default predictApi; 