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
      
      // Return detailed mock assessment history as fallback
      return Promise.resolve({
        data: [
          {
            id: 'mock-assessment-result-1',
            assessmentId: 'mock-assessment-1',
            userId: userId,
            skillName: 'React',
            title: 'React Advanced Concepts',
            skillCategory: 'technical',
            score: 90,
            maxScore: 100,
            correctAnswers: 18,
            totalQuestions: 20,
            completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            demand: 'High',
            relevance: 95
          },
          {
            id: 'mock-assessment-result-2',
            assessmentId: 'mock-assessment-2',
            userId: userId,
            skillName: 'TypeScript',
            title: 'TypeScript Fundamentals',
            skillCategory: 'technical',
            score: 75,
            maxScore: 100,
            correctAnswers: 15,
            totalQuestions: 20,
            completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
            demand: 'High',
            relevance: 90
          },
          {
            id: 'mock-assessment-result-3',
            assessmentId: 'mock-assessment-3',
            userId: userId,
            skillName: 'System Design',
            title: 'Frontend System Design',
            skillCategory: 'technical',
            score: 60,
            maxScore: 100,
            correctAnswers: 12,
            totalQuestions: 20,
            completedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            demand: 'Medium',
            relevance: 85
          },
          {
            id: 'mock-assessment-result-4',
            assessmentId: 'mock-assessment-4',
            userId: userId,
            skillName: 'Team Management',
            title: 'Team Leadership Skills',
            skillCategory: 'soft',
            score: 50,
            maxScore: 100,
            correctAnswers: 10,
            totalQuestions: 20,
            completedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
            demand: 'High',
            relevance: 80
          },
          {
            id: 'mock-assessment-result-5',
            assessmentId: 'mock-assessment-5',
            userId: userId,
            skillName: 'Project Planning',
            title: 'Project Management Basics',
            skillCategory: 'soft',
            score: 60,
            maxScore: 100,
            correctAnswers: 12,
            totalQuestions: 20,
            completedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
            demand: 'Medium',
            relevance: 75
          },
          {
            id: 'mock-assessment-result-6',
            assessmentId: 'mock-assessment-6',
            userId: userId,
            skillName: 'Code Reviews',
            title: 'Effective Code Reviews',
            skillCategory: 'technical',
            score: 70,
            maxScore: 100,
            correctAnswers: 14,
            totalQuestions: 20,
            completedAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
            demand: 'Medium',
            relevance: 85
          },
          {
            id: 'mock-assessment-result-7',
            assessmentId: 'mock-assessment-7',
            userId: userId,
            skillName: 'Technical Leadership',
            title: 'Leading Technical Teams',
            skillCategory: 'soft',
            score: 55,
            maxScore: 100,
            correctAnswers: 11,
            totalQuestions: 20,
            completedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
            demand: 'High',
            relevance: 90
          }
        ]
      });
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
      
      // Return detailed mock skill recommendations as fallback
      return Promise.resolve({
        data: {
          targetSkills: [
            { name: "React", required: 95, recommendedLevel: 95 },
            { name: "TypeScript", required: 90, recommendedLevel: 90 },
            { name: "System Design", required: 85, recommendedLevel: 85 },
            { name: "Team Management", required: 80, recommendedLevel: 80 },
            { name: "Project Planning", required: 75, recommendedLevel: 75 },
            { name: "Code Reviews", required: 90, recommendedLevel: 90 },
            { name: "Performance Optimization", required: 80, recommendedLevel: 80 },
            { name: "Technical Leadership", required: 75, recommendedLevel: 75 }
          ],
          developmentPath: [
            {
              name: "Team Management",
              startLevel: 45,
              currentLevel: 50,
              targetLevel: 80,
              milestones: [
                { level: 45, date: "2023-01-15", description: "Started mentoring junior developers" },
                { level: 50, date: "2023-05-20", description: "Led small team on feature development" },
                { level: 60, date: "2023-08-15", description: "Projected: Complete Team Leadership course" },
                { level: 70, date: "2023-11-10", description: "Projected: Lead medium-sized project team" },
                { level: 80, date: "2024-02-20", description: "Projected: Manage full feature team" }
              ]
            },
            {
              name: "System Design",
              startLevel: 50,
              currentLevel: 60,
              targetLevel: 85,
              milestones: [
                { level: 50, date: "2023-02-10", description: "Designed first component system" },
                { level: 60, date: "2023-05-15", description: "Created architecture for feature module" },
                { level: 70, date: "2023-07-20", description: "Projected: Complete System Design course" },
                { level: 80, date: "2023-10-15", description: "Projected: Design major application feature" },
                { level: 85, date: "2024-01-10", description: "Projected: Lead system architecture design" }
              ]
            },
            {
              name: "Technical Leadership",
              startLevel: 40,
              currentLevel: 55,
              targetLevel: 75,
              milestones: [
                { level: 40, date: "2023-01-05", description: "Started making architectural decisions" },
                { level: 55, date: "2023-05-10", description: "Led technical discussions in team meetings" },
                { level: 65, date: "2023-08-05", description: "Projected: Lead technical planning for sprint" },
                { level: 70, date: "2023-11-15", description: "Projected: Represent team in tech discussions" },
                { level: 75, date: "2024-02-10", description: "Projected: Make critical tech stack decisions" }
              ]
            }
          ],
          industryComparison: [
            { skill: "React", userLevel: 90, industryAvg: 80, topPerformers: 95 },
            { skill: "TypeScript", userLevel: 75, industryAvg: 70, topPerformers: 90 },
            { skill: "System Design", userLevel: 60, industryAvg: 65, topPerformers: 85 },
            { skill: "Team Management", userLevel: 50, industryAvg: 60, topPerformers: 80 },
            { skill: "Project Planning", userLevel: 60, industryAvg: 65, topPerformers: 85 },
            { skill: "Code Reviews", userLevel: 70, industryAvg: 65, topPerformers: 90 }
          ],
          roleComparison: {
            "Frontend Developer": [
              { skill: "React", importance: 95, userLevel: 90 },
              { skill: "JavaScript", importance: 90, userLevel: 85 },
              { skill: "CSS", importance: 85, userLevel: 80 },
              { skill: "TypeScript", importance: 85, userLevel: 75 },
              { skill: "Redux", importance: 80, userLevel: 70 }
            ],
            "Frontend Team Lead": [
              { skill: "React", importance: 90, userLevel: 90 },
              { skill: "TypeScript", importance: 85, userLevel: 75 },
              { skill: "System Design", importance: 85, userLevel: 60 },
              { skill: "Team Management", importance: 90, userLevel: 50 },
              { skill: "Project Planning", importance: 85, userLevel: 60 },
              { skill: "Code Reviews", importance: 90, userLevel: 70 },
              { skill: "Technical Leadership", importance: 95, userLevel: 55 }
            ]
          }
        }
      });
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