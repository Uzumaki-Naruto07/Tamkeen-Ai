import { api } from './apiClient';
import axios from 'axios';
import { getProxyUrl } from './apiClient';

/**
 * ChatGPT API integration for the TamkeenAI Career System
 * This module handles interactions with the ChatGPT service for natural language Q&A,
 * resume assistance, cover letter generation, and mock interviews.
 */

// Base endpoint for ChatGPT requests - don't include /api as apiClient already adds it
const CHATGPT_ENDPOINT = '/chatgpt';
const AI_ENDPOINT = '/chat/ai';

// Development environment detection
const isDevelopment = import.meta.env.DEV;

// Get the base URL for API requests depending on environment
const getBaseUrl = () => {
  if (isDevelopment) {
    // For development, use the proxy on port 8000
    return 'http://localhost:8000';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
};

// Track API connection status
let apiConnectionStatus = {
  lastConnected: null,
  isConnected: false,
  connectionAttempts: 0,
  errorMessage: null
};

/**
 * Get the current API connection status
 * @returns {Object} - The current connection status
 */
export const getConnectionStatus = () => {
  return { ...apiConnectionStatus };
};

/**
 * Send a message to a specific AI provider for more flexible model selection
 * @param {string} message - User message
 * @param {string} context - Additional context for the conversation (optional)
 * @param {string} type - Type of service (general, career, resume, recommendation)
 * @param {string} provider - AI provider to use (openai, deepseek, llama3, groq, local)
 * @param {string} model - Specific model to use (optional, provider-dependent)
 * @param {string} language - Language code (en, ar)
 * @returns {Promise} - Promise resolving to the AI response
 */
export const sendMessageWithProvider = async (
  message, 
  context = '', 
  type = 'general', 
  provider = 'openai', 
  model = null,
  language = 'en'
) => {
  apiConnectionStatus.connectionAttempts++;
  
  try {
    console.log(`Sending request to AI provider ${provider}:`, { 
      messageLength: message.length,
      contextLength: context.length,
      type,
      provider,
      model: model || 'default' 
    });
    
    // Use the proxy URL
    const baseUrl = getBaseUrl();
    
    // Use direct axios call without authorization headers to avoid CORS preflight issues
    const response = await axios({
      method: 'post',
      url: `${baseUrl}${AI_ENDPOINT}/recommendation`,
      data: {
        message,
        context,
        type,
        provider,
        model,
        language
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        // Explicitly NOT including Authorization header to avoid CORS preflight
      },
      withCredentials: false
    });
    
    // Update connection status
    apiConnectionStatus.isConnected = true;
    apiConnectionStatus.lastConnected = new Date();
    apiConnectionStatus.errorMessage = null;
    
    console.log(`AI provider ${provider} response received:`, response);
    
    // Check if response has the expected structure, otherwise handle it gracefully
    if (response && response.data) {
      return {
        response: response.data.response || "Response received but in unexpected format",
        provider: response.data.provider || provider,
        model: response.data.model || model,
        timestamp: response.data.timestamp || new Date().toISOString(),
        success: true
      };
    } else {
      console.warn('AI provider response missing data structure:', response);
      // Return standardized response with the raw response content if available
      return {
        response: "Response received but in unexpected format",
        provider: provider,
        model: model,
        timestamp: new Date().toISOString(),
        fromPartialData: true
      };
    }
  } catch (error) {
    console.error(`AI provider ${provider} error:`, error);
    
    // Update connection status
    apiConnectionStatus.isConnected = false;
    apiConnectionStatus.errorMessage = error.message || 'Connection failed';
    
    // Provide fallback response if API fails
    return {
      response: "I'm sorry, I couldn't connect to the AI service. Here's a helpful general response: Make sure your resume highlights your achievements and skills specifically relevant to the job you're applying for.",
      provider: provider,
      model: model,
      timestamp: new Date().toISOString(),
      fromFallback: true
    };
  }
};

/**
 * Send a message to ChatGPT and get a response
 * @param {string} message - User message
 * @param {string} context - Additional context for the conversation (optional)
 * @param {string} serviceType - Type of service (general, resume, cover_letter, interview)
 * @param {string} language - Language code (en, ar)
 * @returns {Promise} - Promise resolving to the ChatGPT response
 */
export const sendMessage = async (message, context = '', serviceType = 'general', language = 'en') => {
  // Try to use the new multi-provider endpoint if it's available
  try {
    // Map serviceType to type for the new endpoint
    const typeMap = {
      'general': 'general',
      'resume': 'resume',
      'cover_letter': 'resume',
      'interview': 'career',
      'career': 'career'
    };
    
    const type = typeMap[serviceType] || 'general';
    
    // Default to OpenAI GPT-3.5 but this can be configured elsewhere
    const response = await sendMessageWithProvider(message, context, type, 'openai', null, language);
    
    // If successful, return in the expected format
    if (response && response.success) {
      return {
        response: response.response,
        timestamp: response.timestamp
      };
    }
  } catch (newApiError) {
    console.warn('Failed to use new AI endpoint, falling back to legacy endpoint:', newApiError);
    // Continue to legacy implementation
  }
  
  // Legacy implementation as fallback
  apiConnectionStatus.connectionAttempts++;
  
  try {
    console.log(`Sending request to ChatGPT API (${serviceType}):`, { 
      messageLength: message.length,
      contextLength: context.length,
      language 
    });
    
    // Use the proxy URL
    const baseUrl = getBaseUrl();
    
    // Use direct axios call without authorization headers to avoid CORS preflight issues
    const response = await axios({
      method: 'post',
      url: `${baseUrl}${CHATGPT_ENDPOINT}/message`,
      data: {
        message,
        context,
        service_type: serviceType,
        language
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        // Explicitly NOT including Authorization header to avoid CORS preflight
      },
      withCredentials: false
    });
    
    // Update connection status
    apiConnectionStatus.isConnected = true;
    apiConnectionStatus.lastConnected = new Date();
    apiConnectionStatus.errorMessage = null;
    
    console.log(`ChatGPT API response received (${serviceType})`, response);
    
    // Check if response has the expected structure, otherwise handle it gracefully
    if (response && response.data && response.data.data) {
      return response.data.data;
    } else {
      console.warn('ChatGPT API response missing data structure:', response);
      // Return standardized response with the raw response content if available
      return {
        response: response?.data?.response || "Response received but in unexpected format",
        timestamp: new Date().toISOString(),
        fromPartialData: true
      };
    }
  } catch (error) {
    console.error('ChatGPT API error:', error);
    
    // Update connection status
    apiConnectionStatus.isConnected = false;
    apiConnectionStatus.errorMessage = error.message || 'Connection failed';
    
    // Provide fallback response if API fails
    return {
      response: "I'm sorry, I couldn't connect to the AI service. Here's a helpful general response: Make sure your resume highlights your achievements and skills specifically relevant to the job you're applying for.",
      timestamp: new Date().toISOString(),
      fromFallback: true
    };
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
    // Use direct axios call without authorization headers to avoid CORS preflight issues
    const response = await axios({
      method: 'post',
      url: `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}${CHATGPT_ENDPOINT}/resume/improve`,
      data: {
        resume_content: resumeContent,
        job_description: jobDescription,
        language
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        // Explicitly NOT including Authorization header to avoid CORS preflight
      },
      withCredentials: false
    });
    return response.data.data;
  } catch (error) {
    console.error('Resume improvement API error:', error);
    // Return fallback mock data
    return {
      suggestions: {
        general: [
          "Tailor your resume to the specific job description",
          "Quantify your achievements with numbers when possible",
          "Use strong action verbs to start your bullet points"
        ],
        structure: [
          "Use a clean, professional layout",
          "Keep your resume to 1-2 pages maximum",
          "Use consistent formatting throughout"
        ],
        skills: [
          "Highlight both technical and soft skills",
          "Match your skills to those mentioned in the job description",
          "Include skill proficiency levels where appropriate"
        ]
      },
      raw_suggestions: "Make sure your resume is tailored to the specific job. Use quantifiable achievements and strong action verbs. Keep a clean, professional layout with consistent formatting.",
      timestamp: new Date().toISOString()
    };
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
    // Return fallback mock cover letter
    return {
      cover_letter: `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobDescription.includes('position') ? jobDescription : 'position at your company'}. With my background in ${userProfile?.skills?.slice(0, 3).join(', ') || 'relevant fields'}, I believe I would be a valuable addition to ${companyName || 'your organization'}.\n\nThank you for considering my application.\n\nSincerely,\n${userProfile?.name || 'Applicant'}`,
      sections: {
        introduction: `I am writing to express my interest in the ${jobDescription.includes('position') ? jobDescription : 'position at your company'}.`,
        body: `With my background in ${userProfile?.skills?.slice(0, 3).join(', ') || 'relevant fields'}, I believe I would be a valuable addition to ${companyName || 'your organization'}.`,
        conclusion: "Thank you for considering my application."
      },
      timestamp: new Date().toISOString()
    };
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
    // Generate fallback mock interview questions
    const mockQuestions = [
      {
        id: 1,
        question: `Can you describe your experience with ${skills[0] || 'your primary technical skill'}?`,
        type: "technical",
        difficulty: difficulty
      },
      {
        id: 2,
        question: `How do you handle challenging situations or conflicts at work?`,
        type: "behavioral",
        difficulty: difficulty
      },
      {
        id: 3,
        question: `Tell me about a project you worked on that you're particularly proud of.`,
        type: "behavioral",
        difficulty: difficulty
      },
      {
        id: 4,
        question: `What are your strengths and weaknesses as a ${jobTitle || 'professional'}?`,
        type: "general",
        difficulty: difficulty
      },
      {
        id: 5,
        question: `Where do you see yourself in five years?`,
        type: "general",
        difficulty: difficulty
      }
    ];
    
    return {
      questions: mockQuestions.slice(0, count),
      job_title: jobTitle,
      timestamp: new Date().toISOString()
    };
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
    // Return fallback mock feedback
    return {
      overall_rating: 3.5,
      strengths: [
        "You provided a clear answer to the question",
        "You included specific examples which is good"
      ],
      areas_for_improvement: [
        "Consider structuring your answer using the STAR method (Situation, Task, Action, Result)",
        "Be more concise and focused in your response"
      ],
      alternative_answer: `A more structured answer might be: "In my previous role at [Company], I encountered a similar situation where [brief description]. I was responsible for [your task]. I approached this by [your actions]. As a result, [positive outcome]."`,
      timestamp: new Date().toISOString()
    };
  }
};

export default {
  sendMessage,
  getResumeImprovements,
  generateCoverLetter,
  getMockInterviewQuestions,
  getAnswerFeedback
}; 