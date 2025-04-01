/**
 * Resume API Service
 * Handles all API calls related to resume functionalities
 */
import apiClient from './apiClient';
import { RESUME_ENDPOINTS } from '../api/endpoints';

// Get all resumes for a user
const getUserResumes = async (userId) => {
  try {
    const response = await apiClient.get(`${RESUME_ENDPOINTS.GET_USER_RESUMES(userId)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user resumes:', error);
    throw error;
  }
};

// Get a single resume by ID
const getResumeById = async (resumeId) => {
  try {
    const response = await apiClient.get(`${RESUME_ENDPOINTS.GET_BY_ID(resumeId)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resume:', error);
    throw error;
  }
};

// Create a new resume
const createResume = async (resumeData) => {
  try {
    const response = await apiClient.post(RESUME_ENDPOINTS.CREATE, resumeData);
    return response.data;
  } catch (error) {
    console.error('Error creating resume:', error);
    throw error;
  }
};

// Update an existing resume
const updateResume = async (resumeId, resumeData) => {
  try {
    const response = await apiClient.put(`${RESUME_ENDPOINTS.UPDATE_RESUME(resumeId)}`, resumeData);
    return response.data;
  } catch (error) {
    console.error('Error updating resume:', error);
    throw error;
  }
};

// Delete a resume
const deleteResume = async (resumeId) => {
  try {
    const response = await apiClient.delete(`${RESUME_ENDPOINTS.DELETE(resumeId)}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
};

// Analyze a resume
const analyzeResume = async (resumeId) => {
  try {
    const response = await apiClient.post(`${RESUME_ENDPOINTS.ANALYZE}/${resumeId}`);
    return response.data;
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
};

// Get resume templates
const getResumeTemplates = async () => {
  try {
    const response = await apiClient.get(RESUME_ENDPOINTS.GET_RESUME_TEMPLATES);
    return response.data;
  } catch (error) {
    console.error('Error fetching resume templates:', error);
    throw error;
  }
};

// Export all functions
const resumeApi = {
  getUserResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  analyzeResume,
  getResumeTemplates
};

export default resumeApi; 