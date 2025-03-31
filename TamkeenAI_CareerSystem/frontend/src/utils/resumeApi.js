import axios from 'axios';
import { RESUME_ENDPOINTS, JOB_ENDPOINTS } from './endpoints';
import { api } from './api';
import mockData from './app-mocks/mockDataIndex';

// Helper function for mock data fallback
const withMockFallback = (apiCall, mockResponse) => {
  return async (...args) => {
    try {
      const response = await apiCall(...args);
      // If response exists but data is null (from interceptor), use mock data
      if (response && (!response.data || response.status >= 400)) {
        console.log(`API call failed with status ${response.status}, using mock data`);
        return { data: mockResponse instanceof Function ? mockResponse(...args) : mockResponse };
      }
      return response;
    } catch (error) {
      console.error('API call error:', error);
      return { data: mockResponse instanceof Function ? mockResponse(...args) : mockResponse };
    }
  };
};

const resumeApi = {
  // Resume management
  getResumes: withMockFallback(
    () => api.get(RESUME_ENDPOINTS.GET_ALL),
    mockData.resumes
  ),

  getUserResumes: withMockFallback(
    (userId) => api.get(RESUME_ENDPOINTS.GET_USER_RESUMES(userId)),
    mockData.userResumes
  ),

  getResumeById: withMockFallback(
    (resumeId) => api.get(RESUME_ENDPOINTS.GET_BY_ID(resumeId)),
    (resumeId) => mockData.resumes.find(r => r.id === resumeId) || mockData.resumes[0]
  ),

  uploadResume: withMockFallback(
    (formData) => api.post(RESUME_ENDPOINTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
    { success: true, id: 'mock-resume-id', message: 'Resume uploaded (mock)' }
  ),

  createResume: withMockFallback(
    (resumeData) => api.post(RESUME_ENDPOINTS.CREATE_RESUME, resumeData),
    { success: true, id: 'mock-resume-id', message: 'Resume created (mock)' }
  ),

  updateResume: withMockFallback(
    (resumeId, resumeData) => api.put(RESUME_ENDPOINTS.UPDATE_RESUME(resumeId), resumeData),
    { success: true, message: 'Resume updated (mock)' }
  ),

  deleteResume: withMockFallback(
    (resumeId) => api.delete(RESUME_ENDPOINTS.DELETE(resumeId)),
    { success: true, message: 'Resume deleted (mock)' }
  ),

  // ATS analysis and optimization
  analyzeResume: withMockFallback(
    (resumeId, jobData) => {
      const formData = new FormData();
      formData.append('file', jobData.file);
      formData.append('job_title', jobData.title);
      formData.append('job_description', jobData.description);
      
      return api.post('/ats/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    mockData.atsAnalysis
  ),

  analyzeResumeWithVisuals: withMockFallback(
    (resumeId, jobData) => {
      const formData = new FormData();
      formData.append('file', jobData.file); 
      formData.append('job_title', jobData.title);
      formData.append('job_description', jobData.description);
      
      return api.post('/ats/analyze-with-visuals', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    mockData.atsAnalysisWithVisuals
  ),

  getAtsScore: withMockFallback(
    (resumeText, jobDescription) => {
      const formData = new FormData();
      formData.append('resume_text', resumeText);
      formData.append('job_description', jobDescription);
      
      return api.post('/ats/score', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    { score: 78, matched_keywords: ['javascript', 'react'], missing_keywords: ['typescript'] }
  ),

  optimizeResume: withMockFallback(
    (resumeText, jobTitle, jobDescription) => {
      const formData = new FormData();
      formData.append('resume_text', resumeText);
      formData.append('job_title', jobTitle);
      formData.append('job_description', jobDescription);
      
      return api.post('/ats/optimize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    { 
      optimization: [
        { title: "Add missing keywords", description: "Include relevant skills like TypeScript and GraphQL" },
        { title: "Quantify achievements", description: "Add metrics to your work experience" }
      ],
      atsScore: 78 
    }
  ),

  // Resume parsing and conversion
  parseResume: withMockFallback(
    (resumeId) => api.get(`${RESUME_ENDPOINTS.GET_BY_ID(resumeId)}/parse`),
    mockData.resumeParseResult
  ),

  exportResume: withMockFallback(
    async (resumeId, format) => {
      const response = await api.get(`${RESUME_ENDPOINTS.GET_BY_ID(resumeId)}/export?format=${format}`, {
        responseType: 'blob'
      });
      
      // Create download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    },
    { success: true, message: 'Mock export completed' }
  ),

  // ATS history
  getAtsHistory: withMockFallback(
    () => api.get('/ats/history'),
    mockData.atsHistory || []
  ),

  getAtsAnalysisById: withMockFallback(
    (analysisId) => api.get(`/ats/history/${analysisId}`),
    (analysisId) => mockData.atsHistory?.find(a => a.id === analysisId) || mockData.atsAnalysis
  )
};

export default resumeApi; 