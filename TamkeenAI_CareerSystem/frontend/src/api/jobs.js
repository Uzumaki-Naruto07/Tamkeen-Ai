import apiClient from './apiClient';
import { JOB_ENDPOINTS } from './endpoints';

/**
 * API methods for job search and related functionality
 */
const jobsApi = {
  /**
   * Search for jobs based on criteria
   * @param {Object} params - Search parameters
   * @param {string} params.query - Search keywords
   * @param {string} params.location - Job location
   * @param {Array} params.industries - Industries to filter by
   * @param {Array} params.jobTypes - Job types (full-time, part-time, etc.)
   * @param {Array} params.experienceLevels - Experience levels
   * @param {string} params.sortBy - Field to sort by
   * @param {string} params.sortDirection - Sort direction (asc or desc)
   * @param {number} params.page - Page number
   * @param {number} params.pageSize - Page size
   * @returns {Promise<Object>} - Search results
   */
  searchJobs: async (params) => {
    try {
      const response = await apiClient.post(JOB_ENDPOINTS.SEARCH, params);
      return response;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  },

  /**
   * Get job details by ID
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} - Job details
   */
  getJobDetails: async (jobId) => {
    try {
      const response = await apiClient.get(JOB_ENDPOINTS.GET_BY_ID(jobId));
      return response;
    } catch (error) {
      console.error('Error getting job details:', error);
      throw error;
    }
  },

  /**
   * Get recommended jobs based on user profile
   * @param {string} userId - User ID
   * @param {number} limit - Number of recommendations to return
   * @returns {Promise<Array>} - Recommended jobs
   */
  getRecommendedJobs: async (userId, limit = 10) => {
    try {
      const response = await apiClient.get(JOB_ENDPOINTS.RECOMMEND, { userId, limit });
      return response;
    } catch (error) {
      console.error('Error getting recommended jobs:', error);
      throw error;
    }
  },

  /**
   * Get saved jobs for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Saved jobs
   */
  getSavedJobs: async (userId) => {
    try {
      const response = await apiClient.get(JOB_ENDPOINTS.GET_SAVED, { userId });
      return response;
    } catch (error) {
      console.error('Error getting saved jobs:', error);
      throw error;
    }
  },

  /**
   * Save a job for a user
   * @param {string} jobId - Job ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Success status
   */
  saveJob: async (jobId, userId) => {
    try {
      const response = await apiClient.post(JOB_ENDPOINTS.SAVE(jobId), { userId });
      return response;
    } catch (error) {
      console.error('Error saving job:', error);
      throw error;
    }
  },

  /**
   * Unsave/remove a saved job for a user
   * @param {string} jobId - Job ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Success status
   */
  unsaveJob: async (jobId, userId) => {
    try {
      const response = await apiClient.delete(JOB_ENDPOINTS.UNSAVE(jobId), { userId });
      return response;
    } catch (error) {
      console.error('Error unsaving job:', error);
      throw error;
    }
  },

  /**
   * Apply for a job
   * @param {string} jobId - Job ID
   * @param {Object} applicationData - Application data
   * @param {string} applicationData.userId - User ID
   * @param {string} applicationData.resumeId - Resume ID
   * @param {string} applicationData.coverLetterId - Cover letter ID (optional)
   * @returns {Promise<Object>} - Application status
   */
  applyForJob: async (jobId, applicationData) => {
    try {
      const response = await apiClient.post(JOB_ENDPOINTS.APPLY(jobId), applicationData);
      return response;
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
  },

  /**
   * Get a user's job application history
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Job application history
   */
  getApplicationHistory: async (userId) => {
    try {
      const response = await apiClient.get(JOB_ENDPOINTS.APPLICATION_HISTORY, { userId });
      return response;
    } catch (error) {
      console.error('Error getting application history:', error);
      throw error;
    }
  },

  /**
   * Get popular job industries
   * @param {number} limit - Number of industries to return
   * @returns {Promise<Array>} - Popular industries
   */
  getPopularIndustries: async (limit = 10) => {
    try {
      const response = await apiClient.get(JOB_ENDPOINTS.INDUSTRIES, { limit });
      return response;
    } catch (error) {
      console.error('Error getting popular industries:', error);
      throw error;
    }
  },

  /**
   * Get trending skills for jobs
   * @param {string} industry - Industry to filter by (optional)
   * @param {number} limit - Number of skills to return
   * @returns {Promise<Array>} - Trending skills
   */
  getTrendingSkills: async (industry, limit = 10) => {
    try {
      const response = await apiClient.get(JOB_ENDPOINTS.SKILLS, { industry, limit });
      return response;
    } catch (error) {
      console.error('Error getting trending skills:', error);
      throw error;
    }
  },

  /**
   * Get salary insights for a job title
   * @param {string} jobTitle - Job title
   * @param {string} location - Location (optional)
   * @returns {Promise<Object>} - Salary insights
   */
  getSalaryInsights: async (jobTitle, location) => {
    try {
      const response = await apiClient.get(JOB_ENDPOINTS.SALARY_INSIGHTS, { jobTitle, location });
      return response;
    } catch (error) {
      console.error('Error getting salary insights:', error);
      throw error;
    }
  },

  /**
   * Save a job search for a user
   * @param {string} userId - User ID
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Object>} - Saved search
   */
  saveSearch: async (userId, searchParams) => {
    try {
      const response = await apiClient.post(JOB_ENDPOINTS.SAVE_SEARCH, { userId, searchParams });
      return response;
    } catch (error) {
      console.error('Error saving search:', error);
      throw error;
    }
  },

  /**
   * Get saved searches for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Saved searches
   */
  getSavedSearches: async (userId) => {
    try {
      const response = await apiClient.get(JOB_ENDPOINTS.GET_SAVED_SEARCHES, { userId });
      return response;
    } catch (error) {
      console.error('Error getting saved searches:', error);
      throw error;
    }
  }
};

export default jobsApi; 