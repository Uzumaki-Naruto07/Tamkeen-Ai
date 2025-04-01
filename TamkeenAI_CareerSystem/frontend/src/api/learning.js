import apiClient from './apiClient';
import { LEARNING_ENDPOINTS } from './endpoints';

/**
 * API methods for learning resources functionality
 */
const learningApi = {
  /**
   * Get learning resources based on optional filters
   * @param {Object} filters - Filters like skill, category, difficulty
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of items per page
   * @returns {Promise<Object>} - Learning resources with pagination info
   */
  getResources: async (filters = {}, page = 1, limit = 10) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...filters
      }).toString();
      
      const response = await apiClient.get(`${LEARNING_ENDPOINTS.RESOURCES}?${queryParams}`);
      return response;
    } catch (error) {
      console.error('Error getting learning resources:', error);
      throw error;
    }
  },

  /**
   * Get recommended learning resources for a user
   * @param {string} userId - User ID
   * @param {string} skillId - Optional skill ID to filter recommendations
   * @returns {Promise<Array>} - Recommended learning resources
   */
  getRecommendations: async (userId, skillId = null) => {
    try {
      const url = skillId 
        ? `${LEARNING_ENDPOINTS.RECOMMENDATIONS}/${userId}?skillId=${skillId}`
        : `${LEARNING_ENDPOINTS.RECOMMENDATIONS}/${userId}`;
      
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error('Error getting learning recommendations:', error);
      throw error;
    }
  },

  /**
   * Get a specific learning resource by ID
   * @param {string} resourceId - Resource ID
   * @returns {Promise<Object>} - Learning resource details
   */
  getResourceById: async (resourceId) => {
    try {
      const response = await apiClient.get(`${LEARNING_ENDPOINTS.RESOURCES}/${resourceId}`);
      return response;
    } catch (error) {
      console.error('Error getting learning resource:', error);
      throw error;
    }
  },

  /**
   * Get courses by category
   * @param {string} category - Course category
   * @param {number} page - Page number
   * @param {number} limit - Courses per page
   * @returns {Promise<Object>} - Courses with pagination info
   */
  getCoursesByCategory: async (category, page = 1, limit = 10) => {
    try {
      const queryParams = new URLSearchParams({
        category,
        page,
        limit
      }).toString();
      
      const response = await apiClient.get(`${LEARNING_ENDPOINTS.COURSES}?${queryParams}`);
      return response;
    } catch (error) {
      console.error('Error getting courses by category:', error);
      throw error;
    }
  },

  /**
   * Search for learning resources
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} - Search results
   */
  searchResources: async (query, filters = {}) => {
    try {
      const queryParams = new URLSearchParams({
        q: query,
        ...filters
      }).toString();
      
      const response = await apiClient.get(`${LEARNING_ENDPOINTS.RESOURCES}/search?${queryParams}`);
      return response;
    } catch (error) {
      console.error('Error searching learning resources:', error);
      throw error;
    }
  },

  /**
   * Get a user's learning progress
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User's learning progress
   */
  getUserProgress: async (userId) => {
    try {
      const response = await apiClient.get(`${LEARNING_ENDPOINTS.PROGRESS}/${userId}`);
      return response;
    } catch (error) {
      console.error('Error getting user learning progress:', error);
      throw error;
    }
  },

  /**
   * Update progress for a resource
   * @param {string} userId - User ID
   * @param {string} resourceId - Resource ID
   * @param {number} progressPercentage - Progress percentage (0-100)
   * @param {string} status - Status (not-started, in-progress, completed)
   * @returns {Promise<Object>} - Updated progress
   */
  updateProgress: async (userId, resourceId, progressPercentage, status) => {
    try {
      const response = await apiClient.post(`${LEARNING_ENDPOINTS.PROGRESS}/${userId}`, {
        resourceId,
        progressPercentage,
        status
      });
      return response;
    } catch (error) {
      console.error('Error updating learning progress:', error);
      throw error;
    }
  },

  /**
   * Bookmark a learning resource
   * @param {string} userId - User ID
   * @param {string} resourceId - Resource ID
   * @returns {Promise<Object>} - Bookmark status
   */
  bookmarkResource: async (userId, resourceId) => {
    try {
      const response = await apiClient.post(`${LEARNING_ENDPOINTS.BOOKMARK}/${userId}`, {
        resourceId
      });
      return response;
    } catch (error) {
      console.error('Error bookmarking resource:', error);
      throw error;
    }
  },

  /**
   * Remove a bookmark
   * @param {string} userId - User ID
   * @param {string} resourceId - Resource ID
   * @returns {Promise<Object>} - Success status
   */
  removeBookmark: async (userId, resourceId) => {
    try {
      const response = await apiClient.delete(`${LEARNING_ENDPOINTS.BOOKMARK}/${userId}/${resourceId}`);
      return response;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  },

  /**
   * Get a user's bookmarked resources
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Bookmarked resources
   */
  getBookmarkedResources: async (userId) => {
    try {
      const response = await apiClient.get(`${LEARNING_ENDPOINTS.BOOKMARK}/${userId}`);
      return response;
    } catch (error) {
      console.error('Error getting bookmarked resources:', error);
      throw error;
    }
  },

  /**
   * Submit a review for a learning resource
   * @param {string} userId - User ID
   * @param {string} resourceId - Resource ID
   * @param {number} rating - Rating (1-5)
   * @param {string} comment - Review comment
   * @returns {Promise<Object>} - Submitted review
   */
  submitReview: async (userId, resourceId, rating, comment) => {
    try {
      const response = await apiClient.post(`${LEARNING_ENDPOINTS.REVIEWS}`, {
        userId,
        resourceId,
        rating,
        comment
      });
      return response;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  },

  /**
   * Get reviews for a learning resource
   * @param {string} resourceId - Resource ID
   * @param {number} page - Page number
   * @param {number} limit - Reviews per page
   * @returns {Promise<Object>} - Reviews with pagination info
   */
  getResourceReviews: async (resourceId, page = 1, limit = 10) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit
      }).toString();
      
      const response = await apiClient.get(`${LEARNING_ENDPOINTS.REVIEWS}/${resourceId}?${queryParams}`);
      return response;
    } catch (error) {
      console.error('Error getting resource reviews:', error);
      throw error;
    }
  },

  /**
   * Generate a learning path for a skill
   * @param {string} userId - User ID
   * @param {string} skillId - Skill ID
   * @param {string} difficulty - Difficulty level (beginner, intermediate, advanced)
   * @returns {Promise<Object>} - Generated learning path
   */
  generateLearningPath: async (userId, skillId, difficulty = 'intermediate') => {
    try {
      const response = await apiClient.post(`${LEARNING_ENDPOINTS.BASE}/learning-path`, {
        userId,
        skillId,
        difficulty
      });
      return response;
    } catch (error) {
      console.error('Error generating learning path:', error);
      throw error;
    }
  }
};

export default learningApi; 