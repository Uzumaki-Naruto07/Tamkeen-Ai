import apiClient from './apiClient';
import { ASSESSMENT_ENDPOINTS } from './endpoints';

/**
 * API methods for skills assessment functionality
 */
const assessmentApi = {
  /**
   * Get available skill assessments for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Available assessments
   */
  getAvailableAssessments: async (userId) => {
    try {
      const response = await apiClient.get(`${ASSESSMENT_ENDPOINTS.BASE}/available/${userId}`);
      return response;
    } catch (error) {
      console.error('Error getting available assessments:', error);
      throw error;
    }
  },

  /**
   * Get a specific assessment by ID
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise<Object>} - Assessment details
   */
  getAssessment: async (assessmentId) => {
    try {
      const response = await apiClient.get(`${ASSESSMENT_ENDPOINTS.BASE}/${assessmentId}`);
      return response;
    } catch (error) {
      console.error('Error getting assessment:', error);
      throw error;
    }
  },

  /**
   * Get assessment questions for a specific assessment
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise<Array>} - Assessment questions
   */
  getAssessmentQuestions: async (assessmentId) => {
    try {
      const response = await apiClient.get(`${ASSESSMENT_ENDPOINTS.BASE}/${assessmentId}/questions`);
      return response;
    } catch (error) {
      console.error('Error getting assessment questions:', error);
      throw error;
    }
  },

  /**
   * Start an assessment for a user
   * @param {string} userId - User ID
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise<Object>} - Started assessment session
   */
  startAssessment: async (userId, assessmentId) => {
    try {
      const response = await apiClient.post(`${ASSESSMENT_ENDPOINTS.BASE}/start`, {
        userId,
        assessmentId
      });
      return response;
    } catch (error) {
      console.error('Error starting assessment:', error);
      throw error;
    }
  },

  /**
   * Submit a response to an assessment question
   * @param {string} sessionId - Assessment session ID
   * @param {string} questionId - Question ID
   * @param {Object} answer - User's answer
   * @returns {Promise<Object>} - Response feedback
   */
  submitAnswer: async (sessionId, questionId, answer) => {
    try {
      const response = await apiClient.post(`${ASSESSMENT_ENDPOINTS.BASE}/answer`, {
        sessionId,
        questionId,
        answer
      });
      return response;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  },

  /**
   * Complete an assessment session
   * @param {string} sessionId - Assessment session ID
   * @returns {Promise<Object>} - Assessment results
   */
  completeAssessment: async (sessionId) => {
    try {
      const response = await apiClient.post(`${ASSESSMENT_ENDPOINTS.BASE}/complete`, {
        sessionId
      });
      return response;
    } catch (error) {
      console.error('Error completing assessment:', error);
      throw error;
    }
  },

  /**
   * Get a user's assessment history
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Assessment history
   */
  getAssessmentHistory: async (userId) => {
    try {
      const response = await apiClient.get(`${ASSESSMENT_ENDPOINTS.BASE}/history/${userId}`);
      return response;
    } catch (error) {
      console.error('Error getting assessment history:', error);
      throw error;
    }
  },

  /**
   * Get a specific assessment result
   * @param {string} resultId - Result ID
   * @returns {Promise<Object>} - Assessment result details
   */
  getAssessmentResult: async (resultId) => {
    try {
      const response = await apiClient.get(`${ASSESSMENT_ENDPOINTS.BASE}/result/${resultId}`);
      return response;
    } catch (error) {
      console.error('Error getting assessment result:', error);
      throw error;
    }
  },

  /**
   * Get skill recommendations based on assessment results
   * @param {string} userId - User ID
   * @param {string} assessmentId - Assessment ID (optional)
   * @returns {Promise<Object>} - Skill recommendations
   */
  getSkillRecommendations: async (userId, assessmentId = null) => {
    try {
      const url = assessmentId 
        ? `${ASSESSMENT_ENDPOINTS.BASE}/recommendations/${userId}/${assessmentId}`
        : `${ASSESSMENT_ENDPOINTS.BASE}/recommendations/${userId}`;
      
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error('Error getting skill recommendations:', error);
      throw error;
    }
  },

  /**
   * Get related job opportunities based on assessment results
   * @param {string} userId - User ID
   * @param {string} assessmentId - Assessment ID (optional)
   * @returns {Promise<Array>} - Related job opportunities
   */
  getRelatedJobs: async (userId, assessmentId = null) => {
    try {
      const url = assessmentId 
        ? `${ASSESSMENT_ENDPOINTS.BASE}/jobs/${userId}/${assessmentId}`
        : `${ASSESSMENT_ENDPOINTS.BASE}/jobs/${userId}`;
      
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error('Error getting related jobs:', error);
      throw error;
    }
  },

  /**
   * Get assessment certifications for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - User's assessment certifications
   */
  getCertifications: async (userId) => {
    try {
      const response = await apiClient.get(`${ASSESSMENT_ENDPOINTS.BASE}/certifications/${userId}`);
      return response;
    } catch (error) {
      console.error('Error getting assessment certifications:', error);
      throw error;
    }
  },

  /**
   * Generate a skill certificate for a completed assessment
   * @param {string} userId - User ID
   * @param {string} assessmentId - Assessment ID
   * @returns {Promise<Object>} - Generated certificate
   */
  generateCertificate: async (userId, assessmentId) => {
    try {
      const response = await apiClient.post(`${ASSESSMENT_ENDPOINTS.BASE}/certificate`, {
        userId,
        assessmentId
      });
      return response;
    } catch (error) {
      console.error('Error generating certificate:', error);
      throw error;
    }
  }
};

export default assessmentApi; 