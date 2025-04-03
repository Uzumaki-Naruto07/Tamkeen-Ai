/**
 * Application constants for TamkeenAI Career System
 */

// Application constants
export const APP_NAME = 'TamkeenAI Career System';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'AI-powered career development platform';

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },

  // User endpoints
  USER: {
    PROFILE: '/user/profile',
    PREFERENCES: '/user/preferences',
    SETTINGS: '/user/settings',
    NOTIFICATIONS: '/user/notifications',
    ACHIEVEMENTS: '/user/achievements',
    PROGRESS: '/user/progress',
  },

  // Job endpoints
  JOB: {
    LIST: '/jobs',
    DETAIL: (id) => `/jobs/${id}`,
    APPLY: (id) => `/jobs/${id}/apply`,
    SAVE: (id) => `/jobs/${id}/save`,
    SHARE: (id) => `/jobs/${id}/share`,
    SEARCH: '/jobs/search',
    RECOMMENDATIONS: '/jobs/recommendations',
    APPLICATIONS: '/jobs/applications',
  },

  // AI Coach endpoints
  AI_COACH: {
    CHAT: '/ai-coach/chat',
    FEEDBACK: '/ai-coach/feedback',
    RECOMMENDATIONS: '/ai-coach/recommendations',
    INTERVIEW_PREP: '/ai-coach/interview-prep',
    CAREER_GUIDANCE: '/ai-coach/career-guidance',
  },

  // Resume endpoints
  RESUME: {
    LIST: '/resumes',
    DETAIL: (id) => `/resumes/${id}`,
    CREATE: '/resumes/create',
    UPDATE: (id) => `/resumes/${id}/update`,
    DELETE: (id) => `/resumes/${id}/delete`,
    DOWNLOAD: (id) => `/resumes/${id}/download`,
    SHARE: (id) => `/resumes/${id}/share`,
    ATS_SCORE: (id) => `/resumes/${id}/ats-score`,
  },

  // Skill endpoints
  SKILL: {
    LIST: '/skills',
    DETAIL: (id) => `/skills/${id}`,
    ASSESSMENTS: '/skills/assessments',
    COURSES: '/skills/courses',
    PROGRESS: '/skills/progress',
    RECOMMENDATIONS: '/skills/recommendations',
  },

  // Interview endpoints
  INTERVIEW: {
    LIST: '/interviews',
    DETAIL: (id) => `/interviews/${id}`,
    START: '/interviews/start',
    COMPLETE: (id) => `/interviews/${id}/complete`,
    FEEDBACK: (id) => `/interviews/${id}/feedback`,
    RECORDING: (id) => `/interviews/${id}/recording`,
  },

  // Analytics endpoints
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    USER_PROGRESS: '/analytics/user-progress',
    JOB_METRICS: '/analytics/job-metrics',
    SKILL_METRICS: '/analytics/skill-metrics',
    INTERVIEW_METRICS: '/analytics/interview-metrics',
  },
};

// Route paths
export const ROUTES = {
  // Auth routes
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
  },

  // Main routes
  MAIN: {
    DASHBOARD: '/dashboard',
    JOBS: '/jobs',
    AI_COACH: '/ai-coach',
    RESUME_BUILDER: '/resumePage',
    SKILL_BUILDER: '/skill-builder',
    ACHIEVEMENTS: '/achievements',
    SETTINGS: '/settings',
  },

  // Job routes
  JOB: {
    LIST: '/jobs',
    DETAIL: (id) => `/jobs/${id}`,
    APPLY: (id) => `/jobs/${id}/apply`,
    SAVED: '/jobs/saved',
    APPLICATIONS: '/jobs/applications',
  },

  // AI Coach routes
  AI_COACH: {
    CHAT: '/ai-coach/chat',
    FEEDBACK: '/ai-coach/feedback',
    RECOMMENDATIONS: '/ai-coach/recommendations',
    INTERVIEW_PREP: '/ai-coach/interview-prep',
    CAREER_GUIDANCE: '/ai-coach/career-guidance',
  },

  // Resume routes
  RESUME: {
    LIST: '/resumes',
    DETAIL: (id) => `/resumes/${id}`,
    CREATE: '/resumes/create',
    EDIT: (id) => `/resumes/${id}/edit`,
  },

  // Skill routes
  SKILL: {
    LIST: '/skills',
    DETAIL: (id) => `/skills/${id}`,
    ASSESSMENTS: '/skills/assessments',
    COURSES: '/skills/courses',
    PROGRESS: '/skills/progress',
  },

  // Interview routes
  INTERVIEW: {
    LIST: '/interviews',
    DETAIL: (id) => `/interviews/${id}`,
    START: '/interviews/start',
    FEEDBACK: (id) => `/interviews/${id}/feedback`,
  },

  // Profile routes
  PROFILE: {
    VIEW: '/profile',
    EDIT: '/profile/edit',
    SETTINGS: '/profile/settings',
    NOTIFICATIONS: '/profile/notifications',
    ACHIEVEMENTS: '/profile/achievements',
  },
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS: 'notifications',
  PREFERENCES: 'preferences',
};

// Theme constants
export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Language constants
export const LANGUAGE = {
  ENGLISH: 'en',
  ARABIC: 'ar',
};

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  EMPLOYER: 'employer',
  COACH: 'coach',
};

// Job types
export const JOB_TYPES = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
  FREELANCE: 'freelance',
};

// Job status
export const JOB_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
};

// Application status
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  SHORTLISTED: 'shortlisted',
  INTERVIEWING: 'interviewing',
  OFFERED: 'offered',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

// Skill levels
export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
};

// Assessment types
export const ASSESSMENT_TYPES = {
  QUIZ: 'quiz',
  PROJECT: 'project',
  INTERVIEW: 'interview',
  CODING: 'coding',
};

// Course types
export const COURSE_TYPES = {
  VIDEO: 'video',
  TEXT: 'text',
  INTERACTIVE: 'interactive',
  LIVE: 'live',
};

// Achievement types
export const ACHIEVEMENT_TYPES = {
  SKILL: 'skill',
  COURSE: 'course',
  JOB: 'job',
  INTERVIEW: 'interview',
  PROFILE: 'profile',
};

// Interview types
export const INTERVIEW_TYPES = {
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  SYSTEM: 'system',
  CASE: 'case',
};

// Resume sections
export const RESUME_SECTIONS = {
  PERSONAL_INFO: 'personal-info',
  SUMMARY: 'summary',
  EXPERIENCE: 'experience',
  EDUCATION: 'education',
  SKILLS: 'skills',
  CERTIFICATIONS: 'certifications',
  PROJECTS: 'projects',
  LANGUAGES: 'languages',
  REFERENCES: 'references',
};

// Error messages
export const ERROR_MESSAGES = {
  // Auth errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_NOT_VERIFIED: 'Please verify your email address',
    ACCOUNT_LOCKED: 'Your account has been locked',
    SESSION_EXPIRED: 'Your session has expired',
    UNAUTHORIZED: 'You are not authorized to perform this action',
  },

  // Validation errors
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PASSWORD: 'Password must be at least 8 characters long',
    PASSWORD_MISMATCH: 'Passwords do not match',
    INVALID_PHONE: 'Please enter a valid phone number',
    INVALID_DATE: 'Please enter a valid date',
  },

  // Network errors
  NETWORK: {
    CONNECTION_ERROR: 'Unable to connect to the server',
    TIMEOUT: 'Request timed out',
    SERVER_ERROR: 'An error occurred on the server',
  },

  // File errors
  FILE: {
    UPLOAD_ERROR: 'Failed to upload file',
    INVALID_TYPE: 'Invalid file type',
    TOO_LARGE: 'File is too large',
  },

  // General errors
  GENERAL: {
    UNKNOWN_ERROR: 'An unexpected error occurred',
    NOT_FOUND: 'The requested resource was not found',
    FORBIDDEN: 'You do not have permission to perform this action',
    CONFLICT: 'A conflict occurred while processing your request',
  },
};

// Success messages
export const SUCCESS_MESSAGES = {
  // Auth success
  AUTH: {
    LOGIN_SUCCESS: 'Successfully logged in',
    REGISTER_SUCCESS: 'Successfully registered',
    LOGOUT_SUCCESS: 'Successfully logged out',
    PASSWORD_RESET: 'Password has been reset',
    EMAIL_VERIFIED: 'Email has been verified',
  },

  // Profile success
  PROFILE: {
    UPDATE_SUCCESS: 'Profile updated successfully',
    PREFERENCES_UPDATED: 'Preferences updated successfully',
    SETTINGS_UPDATED: 'Settings updated successfully',
  },

  // Job success
  JOB: {
    APPLICATION_SUBMITTED: 'Application submitted successfully',
    JOB_SAVED: 'Job saved successfully',
    JOB_SHARED: 'Job shared successfully',
  },

  // Resume success
  RESUME: {
    CREATED: 'Resume created successfully',
    UPDATED: 'Resume updated successfully',
    DELETED: 'Resume deleted successfully',
    DOWNLOADED: 'Resume downloaded successfully',
    SHARED: 'Resume shared successfully',
  },

  // Skill success
  SKILL: {
    ASSESSMENT_COMPLETED: 'Assessment completed successfully',
    COURSE_COMPLETED: 'Course completed successfully',
    PROGRESS_UPDATED: 'Progress updated successfully',
  },

  // Interview success
  INTERVIEW: {
    COMPLETED: 'Interview completed successfully',
    FEEDBACK_SUBMITTED: 'Feedback submitted successfully',
    RECORDING_SAVED: 'Recording saved successfully',
  },
};

// Loading messages
export const LOADING_MESSAGES = {
  FETCHING: 'Fetching data...',
  SAVING: 'Saving changes...',
  UPLOADING: 'Uploading file...',
  PROCESSING: 'Processing request...',
  GENERATING: 'Generating response...',
  ANALYZING: 'Analyzing data...',
  MATCHING: 'Finding matches...',
  CALCULATING: 'Calculating results...',
};

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
};

// Breakpoints
export const BREAKPOINTS = {
  XS: 0,
  SM: 600,
  MD: 960,
  LG: 1280,
  XL: 1920,
};

// Z-index values
export const Z_INDEX = {
  DRAWER: 1200,
  MODAL: 1300,
  SNACKBAR: 1400,
  TOOLTIP: 1500,
};

// Export all constants
export default {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  API_ENDPOINTS,
  ROUTES,
  STORAGE_KEYS,
  THEME,
  LANGUAGE,
  NOTIFICATION_TYPES,
  USER_ROLES,
  JOB_TYPES,
  JOB_STATUS,
  APPLICATION_STATUS,
  SKILL_LEVELS,
  ASSESSMENT_TYPES,
  COURSE_TYPES,
  ACHIEVEMENT_TYPES,
  INTERVIEW_TYPES,
  RESUME_SECTIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  ANIMATION_DURATIONS,
  BREAKPOINTS,
  Z_INDEX,
};
