import { api } from './apiClient';

/**
 * ChatGPT API integration for the TamkeenAI Career System
 * This module handles interactions with the ChatGPT service for natural language Q&A,
 * resume assistance, cover letter generation, and mock interviews.
 */

// Base endpoint for ChatGPT requests
const CHATGPT_ENDPOINT = '/chatgpt';

/**
 * Send a message to ChatGPT and get a response
 * @param {string} message - User message
 * @param {string} context - Additional context for the conversation (optional)
 * @param {string} serviceType - Type of service (general, resume, cover_letter, interview)
 * @param {string} language - Language code (en, ar)
 * @returns {Promise} - Promise resolving to the ChatGPT response
 */
export const sendMessage = async (message, context = '', serviceType = 'general', language = 'en') => {
  try {
    const response = await api.post(`${CHATGPT_ENDPOINT}/message`, {
      message,
      context,
      service_type: serviceType,
      language
    });
    return response.data.data;
  } catch (error) {
    console.error('ChatGPT API error:', error);
    throw error;
  }
};

/**
 * Get resume improvement suggestions from ChatGPT
 * @param {string} resumeContent - Content of the resume
 * @param {string} jobDescription - Job description to match against (optional)
 * @param {string} language - Language code (en, ar)
 * @returns {Promise} - Promise resolving to improvement suggestions
 */
export const getResumeImprovements = async (resumeContent, jobDescription = '', language = 'en') => {
  try {
    const response = await api.post(`${CHATGPT_ENDPOINT}/resume/improve`, {
      resume_content: resumeContent,
      job_description: jobDescription,
      language
    });
    return response.data.data;
  } catch (error) {
    console.error('Resume improvement API error:', error);
    throw error;
  }
};

/**
 * Generate a cover letter using ChatGPT
 * @param {Object} userProfile - User profile information
 * @param {string} jobDescription - Job description
 * @param {string} companyName - Company name
 * @param {string} language - Language code (en, ar)
 * @returns {Promise} - Promise resolving to the generated cover letter
 */
export const generateCoverLetter = async (userProfile, jobDescription, companyName, language = 'en') => {
  try {
    const response = await api.post(`${CHATGPT_ENDPOINT}/cover-letter/generate`, {
      user_profile: userProfile,
      job_description: jobDescription,
      company_name: companyName,
      language
    });
    return response.data.data;
  } catch (error) {
    console.error('Cover letter generation API error:', error);
    throw error;
  }
};

/**
 * Get mock interview questions from ChatGPT
 * @param {string} jobTitle - Job title
 * @param {Array} skills - List of skills
 * @param {string} difficulty - Interview difficulty (easy, medium, hard)
 * @param {number} count - Number of questions to generate
 * @param {string} language - Language code (en, ar)
 * @returns {Promise} - Promise resolving to interview questions
 */
export const getMockInterviewQuestions = async (jobTitle, skills = [], difficulty = 'medium', count = 5, language = 'en') => {
  try {
    const response = await api.post(`${CHATGPT_ENDPOINT}/interview/questions`, {
      job_title: jobTitle,
      skills,
      difficulty,
      count,
      language
    });
    return response.data.data;
  } catch (error) {
    console.error('Interview questions API error:', error);
    throw error;
  }
};

/**
 * Get feedback on interview answers from ChatGPT
 * @param {string} question - Interview question
 * @param {string} answer - User's answer
 * @param {string} jobTitle - Job title
 * @param {string} language - Language code (en, ar)
 * @returns {Promise} - Promise resolving to feedback on the answer
 */
export const getAnswerFeedback = async (question, answer, jobTitle, language = 'en') => {
  try {
    const response = await api.post(`${CHATGPT_ENDPOINT}/interview/feedback`, {
      question,
      answer,
      job_title: jobTitle,
      language
    });
    return response.data.data;
  } catch (error) {
    console.error('Answer feedback API error:', error);
    throw error;
  }
};

export default {
  sendMessage,
  getResumeImprovements,
  generateCoverLetter,
  getMockInterviewQuestions,
  getAnswerFeedback
}; 