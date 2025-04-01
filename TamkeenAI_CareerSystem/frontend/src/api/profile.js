import apiClient from './apiClient';
import { USER_ENDPOINTS } from './endpoints';

/**
 * API methods for user profile functionality
 */
const profileApi = {
  /**
   * Get a user's profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - User profile
   */
  getUserProfile: async (userId) => {
    try {
      const response = await apiClient.get(`${USER_ENDPOINTS.PROFILE}/${userId}`);
      return response;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  /**
   * Update a user's profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} - Updated profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put(`${USER_ENDPOINTS.PROFILE}/${profileData.id}`, profileData);
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Get a user's achievements
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - User achievements
   */
  getAchievements: async (userId) => {
    try {
      const response = await apiClient.get(`${USER_ENDPOINTS.PROFILE}/achievements/${userId}`);
      return response;
    } catch (error) {
      console.error('Error getting achievements:', error);
      throw error;
    }
  },

  /**
   * Get a user's skills
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - User skills
   */
  getSkills: async (userId) => {
    try {
      const response = await apiClient.get(`${USER_ENDPOINTS.PROFILE}/skills/${userId}`);
      return response;
    } catch (error) {
      console.error('Error getting skills:', error);
      throw error;
    }
  },

  /**
   * Get a user's certifications
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - User certifications
   */
  getCertifications: async (userId) => {
    try {
      const response = await apiClient.get(`${USER_ENDPOINTS.PROFILE}/certifications/${userId}`);
      return response;
    } catch (error) {
      console.error('Error getting certifications:', error);
      throw error;
    }
  },

  /**
   * Add a certification to a user's profile
   * @param {string} userId - User ID
   * @param {Object} data - Certification data
   * @returns {Promise<Object>} - Added certification
   */
  addCertification: async (userId, data) => {
    try {
      const response = await apiClient.post(`${USER_ENDPOINTS.PROFILE}/certifications/${userId}`, data);
      return response;
    } catch (error) {
      console.error('Error adding certification:', error);
      throw error;
    }
  },

  /**
   * Get a user's education history
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Education history
   */
  getEducation: async (userId) => {
    try {
      const response = await apiClient.get(`${USER_ENDPOINTS.PROFILE}/education/${userId}`);
      return response;
    } catch (error) {
      console.error('Error getting education history:', error);
      throw error;
    }
  },

  /**
   * Add education to a user's profile
   * @param {string} userId - User ID
   * @param {Object} data - Education data
   * @returns {Promise<Object>} - Added education
   */
  addEducation: async (userId, data) => {
    try {
      const response = await apiClient.post(`${USER_ENDPOINTS.PROFILE}/education/${userId}`, data);
      return response;
    } catch (error) {
      console.error('Error adding education:', error);
      throw error;
    }
  },

  /**
   * Update an education entry
   * @param {string} userId - User ID
   * @param {string} eduId - Education ID
   * @param {Object} data - Updated education data
   * @returns {Promise<Object>} - Updated education
   */
  updateEducation: async (userId, eduId, data) => {
    try {
      const response = await apiClient.put(`${USER_ENDPOINTS.PROFILE}/education/${userId}/${eduId}`, data);
      return response;
    } catch (error) {
      console.error('Error updating education:', error);
      throw error;
    }
  },

  /**
   * Delete an education entry
   * @param {string} userId - User ID
   * @param {string} eduId - Education ID
   * @returns {Promise<Object>} - Success status
   */
  deleteEducation: async (userId, eduId) => {
    try {
      const response = await apiClient.delete(`${USER_ENDPOINTS.PROFILE}/education/${userId}/${eduId}`);
      return response;
    } catch (error) {
      console.error('Error deleting education:', error);
      throw error;
    }
  },

  /**
   * Get a user's work experience
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Work experience
   */
  getExperience: async (userId) => {
    try {
      const response = await apiClient.get(`${USER_ENDPOINTS.PROFILE}/experience/${userId}`);
      return response;
    } catch (error) {
      console.error('Error getting work experience:', error);
      throw error;
    }
  },

  /**
   * Add work experience to a user's profile
   * @param {string} userId - User ID
   * @param {Object} data - Experience data
   * @returns {Promise<Object>} - Added experience
   */
  addExperience: async (userId, data) => {
    try {
      const response = await apiClient.post(`${USER_ENDPOINTS.PROFILE}/experience/${userId}`, data);
      return response;
    } catch (error) {
      console.error('Error adding experience:', error);
      throw error;
    }
  },

  /**
   * Update a work experience entry
   * @param {string} userId - User ID
   * @param {string} expId - Experience ID
   * @param {Object} data - Updated experience data
   * @returns {Promise<Object>} - Updated experience
   */
  updateExperience: async (userId, expId, data) => {
    try {
      const response = await apiClient.put(`${USER_ENDPOINTS.PROFILE}/experience/${userId}/${expId}`, data);
      return response;
    } catch (error) {
      console.error('Error updating experience:', error);
      throw error;
    }
  },

  /**
   * Delete a work experience entry
   * @param {string} userId - User ID
   * @param {string} expId - Experience ID
   * @returns {Promise<Object>} - Success status
   */
  deleteExperience: async (userId, expId) => {
    try {
      const response = await apiClient.delete(`${USER_ENDPOINTS.PROFILE}/experience/${userId}/${expId}`);
      return response;
    } catch (error) {
      console.error('Error deleting experience:', error);
      throw error;
    }
  },

  /**
   * Add a skill to a user's profile
   * @param {string} userId - User ID
   * @param {Object} data - Skill data
   * @returns {Promise<Object>} - Added skill
   */
  addSkill: async (userId, data) => {
    try {
      const response = await apiClient.post(`${USER_ENDPOINTS.PROFILE}/skills/${userId}`, data);
      return response;
    } catch (error) {
      console.error('Error adding skill:', error);
      throw error;
    }
  },

  /**
   * Update a skill
   * @param {string} userId - User ID
   * @param {string} skillId - Skill ID
   * @param {Object} data - Updated skill data
   * @returns {Promise<Object>} - Updated skill
   */
  updateSkill: async (userId, skillId, data) => {
    try {
      const response = await apiClient.put(`${USER_ENDPOINTS.PROFILE}/skills/${userId}/${skillId}`, data);
      return response;
    } catch (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
  },

  /**
   * Delete a skill
   * @param {string} userId - User ID
   * @param {string} skillId - Skill ID
   * @returns {Promise<Object>} - Success status
   */
  deleteSkill: async (userId, skillId) => {
    try {
      const response = await apiClient.delete(`${USER_ENDPOINTS.PROFILE}/skills/${userId}/${skillId}`);
      return response;
    } catch (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
  },

  /**
   * Upload a profile picture
   * @param {string} userId - User ID
   * @param {FormData} formData - Form data with the image file
   * @returns {Promise<Object>} - Upload response
   */
  uploadProfilePicture: async (userId, formData) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };
      const response = await apiClient.post(`${USER_ENDPOINTS.PROFILE}/picture/${userId}`, formData, config);
      return response;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }
};

export default profileApi; 