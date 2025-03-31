// frontend/src/utils/endpoints.js

// Base API URL - read from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
};

// Resume endpoints
export const RESUME_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/resume/upload`,
  ANALYZE: `${API_BASE_URL}/resume/analyze`,
  GET_ALL: `${API_BASE_URL}/resume/all`,
  GET_BY_ID: (id) => `${API_BASE_URL}/resume/${id}`,
  DELETE: (id) => `${API_BASE_URL}/resume/${id}`,
  GET_USER_RESUMES: (userId) => `${API_BASE_URL}/resume/user/${userId}`,
  GET_RESUME_DETAILS: (resumeId) => `${API_BASE_URL}/resume/${resumeId}/details`,
  GET_RESUME_TEMPLATES: `${API_BASE_URL}/resume/templates`,
  CREATE_RESUME: `${API_BASE_URL}/resume/create`,
  UPDATE_RESUME: (resumeId) => `${API_BASE_URL}/resume/${resumeId}/update`,
};

// Interview endpoints
export const INTERVIEW_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/interview/create`,
  GET_ALL: `${API_BASE_URL}/interview/all`,
  GET_BY_ID: (id) => `${API_BASE_URL}/interview/${id}`,
  UPDATE: (id) => `${API_BASE_URL}/interview/${id}`,
  DELETE: (id) => `${API_BASE_URL}/interview/${id}`,
};

// Job endpoints
export const JOB_ENDPOINTS = {
  SEARCH: `${API_BASE_URL}/job/search`,
  RECOMMEND: `${API_BASE_URL}/job/recommend`,
  GET_BY_ID: (id) => `${API_BASE_URL}/job/${id}`,
  SAVE: (id) => `${API_BASE_URL}/job/${id}/save`,
  UNSAVE: (id) => `${API_BASE_URL}/job/${id}/unsave`,
  GET_SAVED: `${API_BASE_URL}/job/saved`,
  JOB_TITLES: `${API_BASE_URL}/jobs/titles`,
  // Job application endpoints
  GET_APPLICATIONS: `${API_BASE_URL}/job-application/history`,
  APPLY: `${API_BASE_URL}/job-application/apply`,
  AUTOMATE_APPLICATION: `${API_BASE_URL}/job-application/automate-application`,
  BATCH_APPLY: `${API_BASE_URL}/job-application/batch-apply`,
  GET_APPLICATION_SETTINGS: `${API_BASE_URL}/job-application/settings`,
  UPDATE_APPLICATION_SETTINGS: `${API_BASE_URL}/job-application/settings/update`,
  GET_APPLICATION_TEMPLATES: `${API_BASE_URL}/job-application/templates`,
  CREATE_APPLICATION_TEMPLATE: `${API_BASE_URL}/job-application/templates/create`,
  UPDATE_APPLICATION_TEMPLATE: (id) => `${API_BASE_URL}/job-application/templates/${id}`,
  DELETE_APPLICATION_TEMPLATE: (id) => `${API_BASE_URL}/job-application/templates/${id}`,
};

// User endpoints
export const USER_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}/user/profile`,
};

// Health check
export const SYSTEM_ENDPOINTS = {
  HEALTH_CHECK: `${API_BASE_URL}/health-check`,
};

// Dashboard endpoints
export const DASHBOARD_ENDPOINTS = {
  GET_DATA: (userId) => `${API_BASE_URL}/dashboard/${userId}`,
};

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  ANALYTICS_DASHBOARD: `${API_BASE_URL}/analytics/dashboard`,
};

// Skills endpoints
export const SKILLS_ENDPOINTS = {
  GET_CATEGORIES: `${API_BASE_URL}/skills/categories`,
  GET_USER_SKILLS: (userId) => `${API_BASE_URL}/skills/user/${userId}`,
  GET_COMPLETED_ASSESSMENTS: (userId) => `${API_BASE_URL}/skills/assessments/${userId}`,
  GET_ASSESSMENT_QUESTIONS: (categoryId) => `${API_BASE_URL}/skills/assessment/${categoryId}/questions`,
  GET_SKILL_GAP: (userId, jobId) => `${API_BASE_URL}/skills/gap/${userId}/${jobId}`,
  GET_JOB_TITLES: `${API_BASE_URL}/jobs/titles`,
};

// Export all endpoints
export const apiEndpoints = {
  auth: AUTH_ENDPOINTS,
  user: USER_ENDPOINTS,
  dashboard: DASHBOARD_ENDPOINTS,
  jobs: JOB_ENDPOINTS,
  system: SYSTEM_ENDPOINTS,
  resumes: {
    getUserResumes: (userId) => ({
      url: RESUME_ENDPOINTS.GET_USER_RESUMES(userId),
      method: 'get',
      data: { mock: true }
    }),
    getResumeDetails: (resumeId) => ({
      url: RESUME_ENDPOINTS.GET_RESUME_DETAILS(resumeId),
      method: 'get',
      data: { mock: true }
    }),
    getResumeTemplates: () => ({
      url: RESUME_ENDPOINTS.GET_RESUME_TEMPLATES,
      method: 'get',
      data: { mock: true }
    }),
    createResume: (data) => ({
      url: RESUME_ENDPOINTS.CREATE_RESUME,
      method: 'post',
      data
    }),
    updateResume: (resumeId, data) => ({
      url: RESUME_ENDPOINTS.UPDATE_RESUME(resumeId),
      method: 'put',
      data
    }),
    deleteResume: (resumeId) => ({
      url: RESUME_ENDPOINTS.DELETE(resumeId),
      method: 'delete'
    })
  },
  skills: {
    getCategories: () => ({
      url: SKILLS_ENDPOINTS.GET_CATEGORIES,
      method: 'get',
      data: { mock: true }
    }),
    getUserSkills: (userId) => ({
      url: SKILLS_ENDPOINTS.GET_USER_SKILLS(userId),
      method: 'get',
      data: { mock: true }
    }),
    getCompletedAssessments: (userId) => ({
      url: SKILLS_ENDPOINTS.GET_COMPLETED_ASSESSMENTS(userId),
      method: 'get',
      data: { mock: true }
    }),
    getAssessmentQuestions: (categoryId) => ({
      url: SKILLS_ENDPOINTS.GET_ASSESSMENT_QUESTIONS(categoryId),
      method: 'get',
      data: { mock: true }
    }),
    getSkillGap: (userId, jobId) => ({
      url: SKILLS_ENDPOINTS.GET_SKILL_GAP(userId, jobId),
      method: 'get',
      data: { mock: true }
    }),
    getJobTitles: () => ({
      url: SKILLS_ENDPOINTS.GET_JOB_TITLES,
      method: 'get',
      data: { mock: true }
    })
  }
};

export default apiEndpoints;