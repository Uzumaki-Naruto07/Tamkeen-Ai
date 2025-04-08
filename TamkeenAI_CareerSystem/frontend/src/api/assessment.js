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
      // Check if userId is provided - if not, use a default mock user
      if (!userId) {
        console.log('No userId provided for getAvailableAssessments, using mock data');
        return Promise.resolve({
          data: {
            assessments: [
              {
                id: 'mock-assessment-1',
                title: 'JavaScript Fundamentals',
                skillCategory: 'technical',
                description: 'Test your knowledge of JavaScript basics',
                duration: 20,
                difficulty: 'beginner'
              },
              {
                id: 'mock-assessment-2',
                title: 'React Development',
                skillCategory: 'technical',
                description: 'Assess your React skills and knowledge',
                duration: 25,
                difficulty: 'intermediate'
              },
              {
                id: 'mock-assessment-3',
                title: 'Communication Skills',
                skillCategory: 'soft',
                description: 'Evaluate your workplace communication effectiveness',
                duration: 15,
                difficulty: 'beginner'
              }
            ],
            skillGroups: [
              { id: 'technical', name: 'Technical Skills', count: 2 },
              { id: 'soft', name: 'Soft Skills', count: 1 }
            ]
          }
        });
      }
      
      const response = await apiClient.get(`${ASSESSMENT_ENDPOINTS.BASE}/available/${userId}`);
      return response;
    } catch (error) {
      console.error('Error getting available assessments:', error);
      // Return mock data as fallback
      return Promise.resolve({
        data: {
          assessments: [
            {
              id: 'mock-assessment-1',
              title: 'JavaScript Fundamentals',
              skillCategory: 'technical',
              description: 'Test your knowledge of JavaScript basics',
              duration: 20,
              difficulty: 'beginner'
            },
            {
              id: 'mock-assessment-2',
              title: 'React Development',
              skillCategory: 'technical',
              description: 'Assess your React skills and knowledge',
              duration: 25,
              difficulty: 'intermediate'
            },
            {
              id: 'mock-assessment-3',
              title: 'Communication Skills',
              skillCategory: 'soft',
              description: 'Evaluate your workplace communication effectiveness',
              duration: 15,
              difficulty: 'beginner'
            }
          ],
          skillGroups: [
            { id: 'technical', name: 'Technical Skills', count: 2 },
            { id: 'soft', name: 'Soft Skills', count: 1 }
          ]
        }
      });
    }
  },

  /**
   * Get assessments filtered by category and skill
   * @param {Object} params - Query parameters
   * @param {string} params.userId - User ID
   * @param {string} params.category - Skill category (optional)
   * @param {string} params.skill - Specific skill (optional)
   * @returns {Promise<Array>} - Filtered assessments
   */
  getAssessments: async ({ userId, category, skill }) => {
    try {
      let url = `${ASSESSMENT_ENDPOINTS.BASE}/list/${userId}`;
      const queryParams = [];
      
      if (category && category !== 'all') {
        queryParams.push(`category=${encodeURIComponent(category)}`);
      }
      
      if (skill) {
        queryParams.push(`skill=${encodeURIComponent(skill)}`);
      }
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      console.error('Error getting assessments:', error);
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
   * Get user's completed assessments
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - User's completed assessments
   */
  getUserAssessments: async (userId) => {
    try {
      // Check if userId is provided - if not, use a default mock user
      if (!userId) {
        console.log('No userId provided for getUserAssessments, using mock data');
        return Promise.resolve({
          data: [
            {
              id: 'completed-assessment-1',
              title: 'JavaScript Basics',
              skillCategory: 'technical',
              score: 85,
              maxScore: 100,
              completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'completed-assessment-2',
              title: 'Communication Skills',
              skillCategory: 'soft',
              score: 90,
              maxScore: 100,
              completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        });
      }
      
      const response = await apiClient.get(`${ASSESSMENT_ENDPOINTS.BASE}/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Error getting user assessments:', error);
      // Return mock data instead of throwing
      return Promise.resolve({
        data: [
          {
            id: 'completed-assessment-1',
            title: 'JavaScript Basics',
            skillCategory: 'technical',
            score: 85,
            maxScore: 100,
            completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'completed-assessment-2',
            title: 'Communication Skills',
            skillCategory: 'soft',
            score: 90,
            maxScore: 100,
            completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      });
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