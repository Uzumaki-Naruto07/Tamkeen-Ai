/**
 * ATS Direct Connection Utility
 * 
 * This utility directly connects to the backend for ATS analysis,
 * completely bypassing the mock data system.
 */

// Base API URL - adjust if your backend is on a different port/host
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const DISABLE_ATS_MOCK_DATA = import.meta.env.VITE_DISABLE_ATS_MOCK_DATA === 'true';

/**
 * Analyze resume with DeepSeek API - direct connection
 * @param {File} file - Resume file to analyze
 * @param {string} jobTitle - Job title
 * @param {string} jobDescription - Job description
 * @returns {Promise} Analysis results
 */
export const analyzeResumeWithDeepSeek = async (file, jobTitle, jobDescription) => {
  if (!file) {
    throw new Error('No file provided');
  }
  
  if (!jobDescription) {
    throw new Error('Job description is required');
  }
  
  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('job_title', jobTitle || 'Unspecified Job');
  formData.append('job_description', jobDescription);
  formData.append('force_real_api', 'true');
  
  try {
    console.log('Sending direct request to DeepSeek API...');
    
    // Direct API call - no mock fallback
    const response = await fetch(`${API_BASE_URL}/ats/analyze-with-deepseek`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type with FormData - browser will set it with boundary
        'X-Force-Real-API': 'true',
        'X-Skip-Mock': DISABLE_ATS_MOCK_DATA ? 'true' : 'false'
      },
      // Longer timeout for AI processing
      timeout: 30000
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze resume');
    }
    
    const data = await response.json();
    
    // Check if using mock data
    if (data.using_mock_data) {
      console.warn('⚠️ Still using mock data despite direct connection attempt. This is likely because your backend does not have an API key configured.');
      alert('Warning: Using mock data because the backend does not have a DeepSeek API key configured. To use real data, configure the DEEPSEEK_API_KEY in your backend.');
    } else {
      console.log('✅ Successfully connected to DeepSeek API - Using REAL data');
    }
    
    return data;
  } catch (error) {
    console.error('Error in direct ATS analysis:', error);
    throw error;
  }
};

/**
 * Test the DeepSeek API connection
 * @returns {Promise} Connection test results
 */
export const testDeepSeekConnection = async () => {
  try {
    console.log('Testing DeepSeek API connection...');
    
    const response = await fetch(`${API_BASE_URL}/ats/test-deepseek-connection`, {
      method: 'GET',
      headers: {
        'X-Force-Real-API': 'true',
        'X-Skip-Mock': DISABLE_ATS_MOCK_DATA ? 'true' : 'false'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to test DeepSeek connection');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error testing DeepSeek connection:', error);
    throw error;
  }
};

// Export the utility functions
export default {
  analyzeResumeWithDeepSeek,
  testDeepSeekConnection
}; 