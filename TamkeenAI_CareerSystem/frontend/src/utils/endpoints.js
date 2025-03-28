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
};

// User endpoints
export const USER_ENDPOINTS = {
  UPDATE_PROFILE: `${API_BASE_URL}/user/profile`,
  GET_PROFILE: `${API_BASE_URL}/user/profile`,
  CHANGE_PASSWORD: `${API_BASE_URL}/user/change-password`,
};

// Health check
export const HEALTH_CHECK = `${API_BASE_URL}/health-check`;

// Dashboard endpoints
export const DASHBOARD_ENDPOINTS = {
  GET_DATA: (userId) => `${API_BASE_URL}/dashboard/${userId}`,
  UPDATE_SKILLS: (userId) => `${API_BASE_URL}/dashboard/${userId}/skills`,
  TRACK_ACTIVITY: (userId) => `${API_BASE_URL}/dashboard/${userId}/activity`,
  UPDATE_STATS: (userId) => `${API_BASE_URL}/dashboard/${userId}/stats`,
};

// Admin endpoints
export const ADMIN_ENDPOINTS = {
  ANALYTICS_DASHBOARD: `${API_BASE_URL}/analytics/dashboard`,
};