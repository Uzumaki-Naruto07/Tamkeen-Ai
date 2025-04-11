/**
 * TamkeenAI Career System - API Endpoints
 * Maps to backend /api/utils/endpoints.py
 */

// Base API URL - always use relative paths to go through the proxy
const BASE_URL = '/api';

/**
 * Centralized API endpoint definitions
 * 
 * Important: Do not include '/api' prefix in these constants
 * as the apiClient automatically prepends it
 */

export const API_BASE = '';

/**
 * Authentication Endpoints
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  VERIFY: '/auth/verify',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',
  REFRESH_TOKEN: '/auth/refresh-token',
  ME: '/auth/me'
};

/**
 * User Management Endpoints
 */
export const USER_ENDPOINTS = {
  PROFILE: '/user/profile',
  SETTINGS: '/user/settings',
  NOTIFICATIONS: '/user/notifications',
  ACTIVITY: '/user/activity',
  PREFERENCES: '/user/preferences',
  UPDATE_PROFILE: '/user/profile/update',
  GET_NOTIFICATIONS: '/user/notifications',
  MARK_NOTIFICATION_READ: (id) => `/user/notifications/${id}/read`
};

/**
 * User Profile Endpoints
 */
export const USER_PROFILE = {
  GET_PROFILE: `${BASE_URL}/user/profile`,
  UPLOAD_PHOTO: `${BASE_URL}/user/profile/photo`,
  GET_PREFERENCES: `${BASE_URL}/user/preferences`,
  UPDATE_PREFERENCES: `${BASE_URL}/user/preferences`,
  GET_DASHBOARD: `${BASE_URL}/user/dashboard`,
  NOTIFICATION_SETTINGS: `${BASE_URL}/user/notifications/settings`,
  GET_NOTIFICATIONS: `${BASE_URL}/user/notifications`,
  MARK_NOTIFICATION_READ: (id) => `${BASE_URL}/user/notifications/${id}/read`,
  DELETE_ACCOUNT: `${BASE_URL}/user/account/delete`,
};

/**
 * Resume Management Endpoints
 */
export const RESUME_ENDPOINTS = {
  BASE: '/resume',
  LIST: '/resume/list',
  DETAILS: '/resume/details',
  CREATE: '/resume/create',
  UPDATE: '/resume/update',
  DELETE: '/resume/delete',
  SHARE: '/resume/share',
  TEMPLATE: '/resume/template',
  ANALYZE: '/resume/analyze',
  HISTORY: '/resume/history'
};

/**
 * Job search endpoints
 */
export const JOB_ENDPOINTS = {
  BASE: '/job',
  SEARCH: '/job/search',
  DETAILS: '/job/details',
  RECOMMENDED: '/job/recommended',
  SAVED: '/job/saved',
  SAVE: '/job/save',
  UNSAVE: '/job/unsave',
  APPLY: '/job/apply',
  APPLICATIONS: '/job/applications',
  POPULAR_INDUSTRIES: '/job/popular-industries',
  TRENDING_SKILLS: '/job/trending-skills',
  SALARY_INSIGHTS: '/job/salary-insights',
  SAVED_SEARCH: '/job/saved-search',
  SEARCH_HISTORY: '/job/search-history'
};

/**
 * Skills assessment endpoints
 */
export const ASSESSMENT_ENDPOINTS = {
  BASE: '/assessment',
  AVAILABLE: '/assessment/available',
  START: '/assessment/start',
  QUESTIONS: '/assessment/questions',
  SUBMIT: '/assessment/submit',
  COMPLETE: '/assessment/complete',
  RESULTS: '/assessment/results',
  HISTORY: '/assessment/history',
  RECOMMENDATIONS: '/assessment/recommendations',
  CERTIFICATE: '/assessment/certificate'
};

/**
 * Learning resources endpoints
 */
export const LEARNING_ENDPOINTS = {
  BASE: '/learning',
  RESOURCES: '/learning/resources',
  COURSES: '/learning/courses',
  RECOMMENDATIONS: '/learning/recommendations',
  PROGRESS: '/learning/progress',
  BOOKMARK: '/learning/bookmark',
  REVIEWS: '/learning/reviews',
  CATEGORIES: '/learning/categories',
  SKILLS: '/learning/skills',
  SEARCH: '/learning/search',
  POPULAR: '/learning/popular',
  TRENDING: '/learning/trending'
};

/**
 * Dashboard endpoints
 */
export const DASHBOARD_ENDPOINTS = {
  SUMMARY: '/dashboard/summary',
  STATS: '/dashboard/stats',
  ACTIVITY: '/dashboard/activity',
  RECOMMENDATIONS: '/dashboard/recommendations'
};

// Export a default object with all endpoints
export default {
  API_BASE,
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  USER_PROFILE,
  RESUME_ENDPOINTS,
  JOB_ENDPOINTS,
  ASSESSMENT_ENDPOINTS,
  LEARNING_ENDPOINTS,
  DASHBOARD_ENDPOINTS,
  BASE_URL
};