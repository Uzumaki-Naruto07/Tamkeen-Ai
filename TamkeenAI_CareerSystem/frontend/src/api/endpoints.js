/**
 * TamkeenAI Career System - API Endpoints
 * Maps to backend /api/utils/endpoints.py
 */

// Base API URL - support mock API in development mode
const BASE_URL = import.meta.env.DEV 
  ? '/api'  // This will be mocked 
  : (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api';

/**
 * Authentication Endpoints
 */
export const AUTH = {
  REGISTER: `${BASE_URL}/auth/register`,
  LOGIN: `${BASE_URL}/auth/login`,
  REQUEST_PASSWORD_RESET: `${BASE_URL}/auth/password-reset/request`,
  RESET_PASSWORD: `${BASE_URL}/auth/password-reset/confirm`,
  VERIFY_EMAIL: `${BASE_URL}/auth/verify-email`,
  REFRESH_TOKEN: `${BASE_URL}/auth/refresh-token`,
  STATUS: `${BASE_URL}/auth/status`,
  OAUTH_LOGIN: (provider) => `${BASE_URL}/auth/oauth/${provider}`,
  OAUTH_CALLBACK: `${BASE_URL}/auth/oauth/callback`,
  CHANGE_PASSWORD: `${BASE_URL}/auth/change-password`,
};

/**
 * User Management Endpoints
 */
export const USER = {
  GET_CURRENT: `${BASE_URL}/user/me`,
  GET_PROFILE: `${BASE_URL}/user/profile`,
  UPDATE_PROFILE: `${BASE_URL}/user/profile`,
  UPLOAD_PICTURE: `${BASE_URL}/user/profile/picture`,
  GET_SETTINGS: `${BASE_URL}/user/settings`,
  UPDATE_SETTINGS: `${BASE_URL}/user/settings`,
  GET_ACTIVITY: `${BASE_URL}/user/activity`,
  GET_NOTIFICATIONS: `${BASE_URL}/user/notifications`,
  MARK_NOTIFICATION_READ: (id) => `${BASE_URL}/user/notifications/${id}/read`,
  DELETE_NOTIFICATION: (id) => `${BASE_URL}/user/notifications/${id}`,
  GENERATE_PROFILE: `${BASE_URL}/user/generate-profile`,
  GET_EXPERTISE_LEVEL: `${BASE_URL}/user/expertise-level`,
  GET_CAREER_GOALS: `${BASE_URL}/user/career-goals`,
  UPDATE_CAREER_GOALS: `${BASE_URL}/user/career-goals`,
  GET_SKILLS: `${BASE_URL}/user/skills`,
  UPDATE_SKILLS: `${BASE_URL}/user/skills`,
  GENERATE_INSIGHTS: `${BASE_URL}/user/insights`,
  LINK_SOCIAL_ACCOUNT: `${BASE_URL}/user/social-accounts`,
  UNLINK_SOCIAL_ACCOUNT: (provider) => `${BASE_URL}/user/social-accounts/${provider}`,
  GET_SECURITY_INFO: `${BASE_URL}/user/security`,
  ENABLE_TWO_FACTOR: `${BASE_URL}/user/security/two-factor`,
  VERIFY_TWO_FACTOR: `${BASE_URL}/user/security/two-factor/verify`,
  DISABLE_TWO_FACTOR: `${BASE_URL}/user/security/two-factor/disable`,
  GET_STRENGTHS_WEAKNESSES: `${BASE_URL}/user/strengths-weaknesses`,
  DELETE_ACCOUNT: `${BASE_URL}/user/delete-account`,
  
  // Custom mappings for API client mocking
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
  LOGOUT: `${BASE_URL}/auth/logout`,
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
export const RESUME = {
  GET_ALL: `${BASE_URL}/resume`,
  GET_BY_ID: (id) => `${BASE_URL}/resume/${id}`,
  CREATE: `${BASE_URL}/resume`,
  UPDATE: (id) => `${BASE_URL}/resume/${id}`,
  DELETE: (id) => `${BASE_URL}/resume/${id}`,
  GENERATE: `${BASE_URL}/resume/generate`,
  ANALYZE: (id) => `${BASE_URL}/resume/${id}/analyze`,
  COMPARE: `${BASE_URL}/resume/compare`,
  GET_TEMPLATES: `${BASE_URL}/resume/templates`,
  DOWNLOAD: (id, format) => `${BASE_URL}/resume/${id}/download?format=${format}`,
  PARSE: `${BASE_URL}/resume/parse`,
  EXTRACT_SKILLS: (id) => `${BASE_URL}/resume/${id}/skills`,
  IMPROVE: (id) => `${BASE_URL}/resume/${id}/improve`,
  SHARE: (id) => `${BASE_URL}/resume/${id}/share`,
};

/**
 * Assessment Endpoints
 */
export const ASSESSMENT = {
  GET_ALL: `${BASE_URL}/assessment/all`,
  GET_BY_ID: (id) => `${BASE_URL}/assessment/${id}`,
  START: (type) => `${BASE_URL}/assessment/start/${type}`,
  SUBMIT_ANSWERS: (id) => `${BASE_URL}/assessment/${id}/submit`,
  GET_RESULTS: (id) => `${BASE_URL}/assessment/${id}/results`,
  GET_QUESTIONS: (type) => `${BASE_URL}/assessment/questions/${type}`,
  GET_PERSONALITY: `${BASE_URL}/assessment/personality`,
  GET_SKILLS: `${BASE_URL}/assessment/skills`,
  GET_CAREER_FIT: `${BASE_URL}/assessment/career-fit`,
  GET_PROGRESS: `${BASE_URL}/assessment/progress`,
  GENERATE_REPORT: (id) => `${BASE_URL}/assessment/${id}/report`,
  GENERATE_AI_QUESTIONS: `${BASE_URL}/assessment/ai/generate-questions`,
  DETECT_EMOTION: `${BASE_URL}/assessment/emotion/detect`,
  GET_SKILL_INSIGHTS: `${BASE_URL}/assessment/skills/insights`,
  GET_SKILL_FORECAST: `${BASE_URL}/assessment/skills/forecast`,
  ADAPTIVE_DIFFICULTY: `${BASE_URL}/assessment/adaptive-difficulty`,
};

/**
 * Career Path Endpoints
 */
export const CAREER = {
  GET_PATHS: `${BASE_URL}/career/paths`,
  GET_PATH_DETAILS: (id) => `${BASE_URL}/career/paths/${id}`,
  GET_RECOMMENDATIONS: `${BASE_URL}/career/recommendations`,
  GET_SKILL_GAP: (roleId) => `${BASE_URL}/career/skill-gap/${roleId}`,
  GET_ROLE_REQUIREMENTS: (roleId) => `${BASE_URL}/career/role-requirements/${roleId}`,
  GET_GROWTH_TRAJECTORY: (roleId) => `${BASE_URL}/career/growth-trajectory/${roleId}`,
  GET_INDUSTRY_INSIGHTS: (industry) => `${BASE_URL}/career/industry-insights/${industry}`,
  VISUALIZE_PATH: (pathId) => `${BASE_URL}/career/visualize/${pathId}`,
  GET_SALARY_DATA: (roleId) => `${BASE_URL}/career/salary-data/${roleId}`,
  GET_RELATED_ROLES: (roleId) => `${BASE_URL}/career/related-roles/${roleId}`,
  GET_PERSONALIZED_GUIDANCE: `${BASE_URL}/career/personalized-guidance`,
  GENERATE_PLAN: `${BASE_URL}/career/generate-plan`,
  GET_TRANSITIONS: (role) => `${BASE_URL}/career/transitions/${role}`,
  GET_MARKET_DEMAND: (skill) => `${BASE_URL}/career/market-demand/${skill}`,
  GET_INTELLIGENCE_INSIGHTS: `${BASE_URL}/career/intelligence-insights`,
  COMPARE_PATHS: `${BASE_URL}/career/compare-paths`,
  GET_MILESTONES: (pathId) => `${BASE_URL}/career/paths/${pathId}/milestones`,
  GENERATE_DEVELOPMENT_PLAN: `${BASE_URL}/career/development-plan`,
};

/**
 * Jobs and Applications Endpoints
 */
export const JOB = {
  GET_ALL: `${BASE_URL}/jobs`,
  GET_BY_ID: (id) => `${BASE_URL}/jobs/${id}`,
  SEARCH: `${BASE_URL}/jobs/search`,
  RECOMMEND: `${BASE_URL}/jobs/recommend`,
  APPLY: (id) => `${BASE_URL}/jobs/${id}/apply`,
  TRACK_APPLICATION: (id) => `${BASE_URL}/jobs/applications/${id}`,
  GET_APPLICATIONS: `${BASE_URL}/jobs/applications`,
  SAVE: (id) => `${BASE_URL}/jobs/${id}/save`,
  GET_SAVED: `${BASE_URL}/jobs/saved`,
  MATCH_SCORE: (id) => `${BASE_URL}/jobs/${id}/match`,
  GET_TRENDS: `${BASE_URL}/jobs/trends`,
  GET_STATS: `${BASE_URL}/jobs/stats`,
  GET_MARKET_DATA: `${BASE_URL}/jobs/market-data`,
  GET_SALARY_INSIGHTS: (title) => `${BASE_URL}/jobs/salary/${encodeURIComponent(title)}`,
};

/**
 * Interview Preparation Endpoints
 */
export const INTERVIEW = {
  GET_ALL: `${BASE_URL}/interviews`,
  GET_BY_ID: (id) => `${BASE_URL}/interviews/${id}`,
  CREATE: `${BASE_URL}/interviews`,
  UPDATE: (id) => `${BASE_URL}/interviews/${id}`,
  DELETE: (id) => `${BASE_URL}/interviews/${id}`,
  START: (id) => `${BASE_URL}/interviews/${id}/start`,
  END: (id) => `${BASE_URL}/interviews/${id}/end`,
  SUBMIT_ANSWER: (id, questionId) => `${BASE_URL}/interviews/${id}/questions/${questionId}/answer`,
  GET_FEEDBACK: (id) => `${BASE_URL}/interviews/${id}/feedback`,
  GET_RECORDING: (id) => `${BASE_URL}/interviews/${id}/recording`,
  GET_TRANSCRIPT: (id) => `${BASE_URL}/interviews/${id}/transcript`,
  GET_INSIGHTS: (id) => `${BASE_URL}/interviews/${id}/insights`,
  GET_COMMON_QUESTIONS: (jobTitle) => `${BASE_URL}/interviews/common-questions?job=${encodeURIComponent(jobTitle)}`,
};

/**
 * Learning & Skills Development Endpoints
 */
export const LEARNING = {
  GET_COURSES: `${BASE_URL}/learning/courses`,
  GET_COURSE: (id) => `${BASE_URL}/learning/courses/${id}`,
  ENROLL: (id) => `${BASE_URL}/learning/courses/${id}/enroll`,
  GET_ENROLLED_COURSES: `${BASE_URL}/learning/enrolled`,
  GET_PROGRESS: (id) => `${BASE_URL}/learning/courses/${id}/progress`,
  MARK_COMPLETE: (courseId, moduleId) => `${BASE_URL}/learning/courses/${courseId}/modules/${moduleId}/complete`,
  GET_RECOMMENDATIONS: `${BASE_URL}/learning/recommendations`,
  GET_CERTIFICATES: `${BASE_URL}/learning/certificates`,
  DOWNLOAD_CERTIFICATE: (id) => `${BASE_URL}/learning/certificates/${id}/download`,
  GET_SKILL_COURSES: (skillId) => `${BASE_URL}/learning/skills/${skillId}/courses`,
  GET_LEARNING_PATHS: `${BASE_URL}/learning/paths`,
  GET_LEARNING_PATH: (id) => `${BASE_URL}/learning/paths/${id}`,
};

/**
 * Networking Endpoints
 */
export const NETWORKING = {
  GET_CONNECTIONS: `${BASE_URL}/networking/connections`,
  SEND_CONNECTION_REQUEST: `${BASE_URL}/networking/request`,
  GET_CONNECTION_REQUESTS: `${BASE_URL}/networking/requests`,
  RESPOND_TO_REQUEST: (id) => `${BASE_URL}/networking/requests/${id}/respond`,
  GET_SUGGESTED_CONNECTIONS: `${BASE_URL}/networking/suggested`,
  GET_EVENTS: `${BASE_URL}/networking/events`,
  GET_EVENT: (id) => `${BASE_URL}/networking/events/${id}`,
  REGISTER_FOR_EVENT: (id) => `${BASE_URL}/networking/events/${id}/register`,
  GET_MENTORS: `${BASE_URL}/networking/mentors`,
  REQUEST_MENTORSHIP: (id) => `${BASE_URL}/networking/mentors/${id}/request`,
  GET_COMMUNITIES: `${BASE_URL}/networking/communities`,
  JOIN_COMMUNITY: (id) => `${BASE_URL}/networking/communities/${id}/join`,
};

/**
 * Analytics & Insights Endpoints
 */
export const ANALYTICS = {
  GET_DASHBOARD: `${BASE_URL}/analytics/dashboard`,
  GET_RESUME_VIEWS: `${BASE_URL}/analytics/resume-views`,
  GET_APPLICATION_METRICS: `${BASE_URL}/analytics/applications`,
  GET_SKILL_PROGRESS: `${BASE_URL}/analytics/skills/progress`,
  GET_CAREER_PROGRESS: `${BASE_URL}/analytics/career/progress`,
  GET_LEARNING_STATS: `${BASE_URL}/analytics/learning`,
  GET_INTERVIEW_PERFORMANCE: `${BASE_URL}/analytics/interviews`,
  GENERATE_REPORT: (type) => `${BASE_URL}/analytics/reports/${type}`,
  EXPORT_DATA: (type) => `${BASE_URL}/analytics/export/${type}`,
  GET_BENCHMARKS: `${BASE_URL}/analytics/benchmarks`,
  GET_PREDICTIONS: `${BASE_URL}/analytics/predictions`,
  CAREER_PROGRESS: `${BASE_URL}/analytics/career-progress`,
  SKILL_DEVELOPMENT: `${BASE_URL}/analytics/skill-development`,
  JOB_MARKET_TRENDS: `${BASE_URL}/analytics/job-market-trends`,
  APPLICATION_PERFORMANCE: `${BASE_URL}/analytics/application-performance`,
  INTERVIEW_PERFORMANCE: `${BASE_URL}/analytics/interview-performance`,
  SALARY_INSIGHTS: `${BASE_URL}/analytics/salary-insights`,
  INDUSTRY_COMPARISON: `${BASE_URL}/analytics/industry-comparison`,
  CAREER_PATH: `${BASE_URL}/analytics/career-path`,
  GENERATE_FORECAST: `${BASE_URL}/analytics/generate-forecast`,
  LEARNING: `${BASE_URL}/analytics/learning`,
  SKILL_GAP: `${BASE_URL}/analytics/skill-gap`,
  CUSTOM_REPORT: `${BASE_URL}/analytics/custom-report`,
};

/**
 * AI Tools Endpoints
 */
export const AI_TOOLS = {
  GENERATE_COVER_LETTER: `${BASE_URL}/ai/generate-cover-letter`,
  CUSTOMIZE_RESUME: `${BASE_URL}/ai/customize-resume`,
  OPTIMIZE_LINKEDIN: `${BASE_URL}/ai/optimize-linkedin`,
  JOB_DESCRIPTION_ANALYSIS: `${BASE_URL}/ai/analyze-job-description`,
  PREPARE_INTERVIEW_ANSWERS: `${BASE_URL}/ai/prepare-interview-answers`,
  GENERATE_PROFESSIONAL_BIO: `${BASE_URL}/ai/generate-bio`,
  EMAIL_TEMPLATES: `${BASE_URL}/ai/email-templates`,
  SKILLS_SUGGESTIONS: `${BASE_URL}/ai/skills-suggestions`,
  FEEDBACK_ANALYSIS: `${BASE_URL}/ai/analyze-feedback`,
  SALARY_NEGOTIATION: `${BASE_URL}/ai/salary-negotiation`,
  PERSONAL_BRAND: `${BASE_URL}/ai/personal-brand`,
};

/**
 * Documents Generation Endpoints
 */
export const DOCUMENTS = {
  GENERATE_RESUME_PDF: (id) => `${BASE_URL}/documents/resume/${id}/pdf`,
  GENERATE_COVER_LETTER: `${BASE_URL}/documents/cover-letter/generate`,
  DOWNLOAD_ASSESSMENT_REPORT: (id) => `${BASE_URL}/documents/assessment/${id}/report`,
  GENERATE_CAREER_REPORT: `${BASE_URL}/documents/career-report/generate`,
  DOWNLOAD_INTERVIEW_FEEDBACK: (id) => `${BASE_URL}/documents/interview/${id}/feedback`,
  EXPORT_PORTFOLIO: `${BASE_URL}/documents/portfolio/export`,
  GENERATE_ACHIEVEMENT_CERTIFICATE: (id) => `${BASE_URL}/documents/certificates/${id}/generate`,
  EXPORT_APPLICATION_HISTORY: `${BASE_URL}/documents/applications/export`,
};

/**
 * Reports Endpoints
 */
export const REPORTS = {
  GENERATE_CAREER_REPORT: `${BASE_URL}/reports/career`,
  GENERATE_SKILLS_REPORT: (id) => `${BASE_URL}/reports/skills/${id}`,
  GENERATE_INTERVIEW_REPORT: (id) => `${BASE_URL}/reports/interview/${id}`,
  GENERATE_APPLICATION_PROGRESS: `${BASE_URL}/reports/application-progress`,
  GENERATE_CAREER_GROWTH: `${BASE_URL}/reports/career-growth`,
  GENERATE_IMPROVEMENT: `${BASE_URL}/reports/improvement`,
  DOWNLOAD_PDF: (id) => `${BASE_URL}/reports/${id}/pdf`,
  GET_ALL: `${BASE_URL}/reports`,
};

// Enhanced FEEDBACK endpoints
export const FEEDBACK = {
  SUBMIT: `${BASE_URL}/feedback`,
  GET_USER_FEEDBACK: `${BASE_URL}/feedback/user`,
  SUBMIT_BUG_REPORT: `${BASE_URL}/feedback/bug`,
  FEATURE_REQUEST: `${BASE_URL}/feedback/feature`,
  RATE_FEATURE: (feature) => `${BASE_URL}/feedback/rate/${feature}`,
  GET_SATISFACTION_SURVEY: `${BASE_URL}/feedback/survey`,
  SUBMIT_SURVEY: `${BASE_URL}/feedback/survey`,
  GENERATE_PERFORMANCE: `${BASE_URL}/feedback/generate/performance`,
  GENERATE_RESUME_FEEDBACK: (id) => `${BASE_URL}/feedback/generate/resume/${id}`,
  GENERATE_ANSWER_FEEDBACK: `${BASE_URL}/feedback/generate/answer`,
  GET_ANALYTICS: `${BASE_URL}/feedback/analytics`,
  GET_RECOMMENDATIONS: `${BASE_URL}/feedback/recommendations`,
};

/**
 * Emotion Detection Endpoints
 */
export const EMOTION = {
  ANALYZE_FACIAL: `${BASE_URL}/emotion/analyze-facial`,
  ANALYZE_VOICE: `${BASE_URL}/emotion/analyze-voice`,
  START_REALTIME: `${BASE_URL}/emotion/realtime/start`,
  SEND_FRAME: (token) => `${BASE_URL}/emotion/realtime/${token}/frame`,
  END_REALTIME: (token) => `${BASE_URL}/emotion/realtime/${token}/end`,
  ANALYZE_COMBINED: `${BASE_URL}/emotion/analyze-combined`,
  GET_HISTORY: `${BASE_URL}/emotion/history`,
  GET_ANALYSIS: (id) => `${BASE_URL}/emotion/${id}`,
  GET_INTERVIEW_INSIGHTS: (interviewId) => `${BASE_URL}/emotion/interview/${interviewId}/insights`,
};

/**
 * Speech Analysis Endpoints
 */
export const SPEECH = {
  TRANSCRIBE: `${BASE_URL}/speech/transcribe`,
  ANALYZE_QUALITY: `${BASE_URL}/speech/analyze-quality`,
  DETECT_PROBLEMS: `${BASE_URL}/speech/detect-problems`,
  ANALYZE_PACE: `${BASE_URL}/speech/analyze-pace`,
  START_LIVE_RECOGNITION: `${BASE_URL}/speech/live/start`,
  SEND_AUDIO_CHUNK: (token) => `${BASE_URL}/speech/live/${token}/chunk`,
  END_LIVE_RECOGNITION: (token) => `${BASE_URL}/speech/live/${token}/end`,
  ANALYZE_CLARITY: `${BASE_URL}/speech/analyze-clarity`,
  GENERATE_REPORT: (sessionId) => `${BASE_URL}/speech/${sessionId}/report`,
};

/**
 * Gamification Endpoints
 */
export const GAMIFICATION = {
  GET_ACHIEVEMENTS: `${BASE_URL}/gamification/achievements`,
  GET_BADGES: `${BASE_URL}/gamification/badges`,
  GET_POINTS: `${BASE_URL}/gamification/points`,
  GET_CHALLENGES: `${BASE_URL}/gamification/challenges`,
  START_CHALLENGE: (id) => `${BASE_URL}/gamification/challenges/${id}/start`,
  COMPLETE_CHALLENGE: (id) => `${BASE_URL}/gamification/challenges/${id}/complete`,
  GET_LEADERBOARD_POSITION: `${BASE_URL}/gamification/leaderboard/me`,
  GET_LEADERBOARD: `${BASE_URL}/gamification/leaderboard`,
  GET_STREAK: `${BASE_URL}/gamification/streak`,
  GET_REWARDS: `${BASE_URL}/gamification/rewards`,
  REDEEM_REWARD: (id) => `${BASE_URL}/gamification/rewards/${id}/redeem`,
  GET_MILESTONE_PROGRESS: `${BASE_URL}/gamification/milestones`,
  GET_NEXT_ACHIEVEMENTS: `${BASE_URL}/gamification/next-achievements`,
};

/**
 * Dashboard Endpoints
 */
export const DASHBOARD = {
  GET_SUMMARY: `${BASE_URL}/dashboard/summary`,
  GET_ACTIVITY_TIMELINE: `${BASE_URL}/dashboard/activity-timeline`,
  GET_CAREER_PROGRESS: `${BASE_URL}/dashboard/career-progress`,
  GET_SKILL_IMPROVEMENT: `${BASE_URL}/dashboard/skill-improvement`,
  GET_JOB_APPLICATION_METRICS: `${BASE_URL}/dashboard/job-applications`,
  GET_RECOMMENDED_ACTIONS: `${BASE_URL}/dashboard/recommended-actions`,
  GET_WIDGETS: `${BASE_URL}/dashboard/widgets`,
  SAVE_LAYOUT: `${BASE_URL}/dashboard/layout`,
  GET_WIDGET_DATA: (id) => `${BASE_URL}/dashboard/widgets/${id}/data`,
  GET_CAREER_HEALTH: `${BASE_URL}/dashboard/career-health`,
  GET_GOALS_PROGRESS: `${BASE_URL}/dashboard/goals-progress`,
  GET_PEER_COMPARISON: `${BASE_URL}/dashboard/peer-comparison`,
  GET_EMPLOYMENT_OUTLOOK: `${BASE_URL}/dashboard/employment-outlook`,
  GET_PERSONALIZED_INSIGHTS: `${BASE_URL}/dashboard/insights`,
};

/**
 * Visualization Endpoints
 */
export const VISUALIZATION = {
  CAREER_PATH: `${BASE_URL}/visualization/career-path`,
  SKILL_RADAR: `${BASE_URL}/visualization/skill-radar`,
  JOB_MARKET_HEATMAP: `${BASE_URL}/visualization/job-market-heatmap`,
  SALARY_COMPARISON: `${BASE_URL}/visualization/salary-comparison`,
  APPLICATION_FUNNEL: `${BASE_URL}/visualization/application-funnel`,
  TIMELINE: `${BASE_URL}/visualization/timeline`,
  NETWORK_GRAPH: `${BASE_URL}/visualization/network-graph`,
  SKILL_TREE: `${BASE_URL}/visualization/skill-tree`,
  PROGRESS_DASHBOARD: `${BASE_URL}/visualization/progress-dashboard`,
  CUSTOM_CHART: `${BASE_URL}/visualization/custom-chart`,
  EXPORT_IMAGE: `${BASE_URL}/visualization/export-image`,
};

/**
 * Language Models Endpoints
 */
export const LANGUAGE_MODELS = {
  GENERATE_TEXT: `${BASE_URL}/language-models/generate`,
  GENERATE_CAREER_ADVICE: `${BASE_URL}/language-models/career-advice`,
  ANALYZE_TEXT: `${BASE_URL}/language-models/analyze`,
  GET_EMBEDDINGS: `${BASE_URL}/language-models/embeddings`,
  SUMMARIZE_TEXT: `${BASE_URL}/language-models/summarize`,
  ENHANCE_JOB_CONTENT: `${BASE_URL}/language-models/enhance-job-content`,
  GET_AVAILABLE_MODELS: `${BASE_URL}/language-models/available-models`,
  HUGGINGFACE_INFERENCE: `${BASE_URL}/language-models/huggingface/inference`,
  GENERATE_PERSONALIZED_RESPONSE: `${BASE_URL}/language-models/personalized-response`,
  PROCESS_DOCUMENT: `${BASE_URL}/language-models/process-document`,
  ANALYZE_SENTIMENT: `${BASE_URL}/language-models/sentiment`,
  GET_MODEL_INFO: (id) => `${BASE_URL}/language-models/models/${id}`,
  FINE_TUNE_MODEL: `${BASE_URL}/language-models/fine-tune`,
  GET_FINE_TUNING_STATUS: (id) => `${BASE_URL}/language-models/fine-tune/${id}`,
  GENERATE_INTERVIEW_QUESTIONS: `${BASE_URL}/language-models/interview-questions`,
};

/**
 * Text-to-Speech Endpoints
 */
export const TTS = {
  CONVERT: `${BASE_URL}/tts/convert`,
  GET_VOICES: `${BASE_URL}/tts/voices`,
  GET_VOICE_DETAILS: (id) => `${BASE_URL}/tts/voices/${id}`,
  SAVE_TO_LIBRARY: `${BASE_URL}/tts/library`,
  GET_LIBRARY: `${BASE_URL}/tts/library`,
  DELETE_FROM_LIBRARY: (id) => `${BASE_URL}/tts/library/${id}`,
  GET_CONFIGURATIONS: `${BASE_URL}/tts/configurations`,
  UPDATE_CONFIGURATION: `${BASE_URL}/tts/configurations`,
  GET_SUPPORTED_FORMATS: `${BASE_URL}/tts/supported-formats`,
  CONVERT_SSML: `${BASE_URL}/tts/convert-ssml`,
};

/**
 * Admin Endpoints
 */
export const ADMIN = {
  SYSTEM_STATS: `${BASE_URL}/admin/system/stats`,
  GET_USERS: `${BASE_URL}/admin/users`,
  GET_USER_DETAILS: (id) => `${BASE_URL}/admin/users/${id}`,
  UPDATE_USER_ROLES: (id) => `${BASE_URL}/admin/users/${id}/roles`,
  DISABLE_USER: (id) => `${BASE_URL}/admin/users/${id}/disable`,
  ENABLE_USER: (id) => `${BASE_URL}/admin/users/${id}/enable`,
  SYSTEM_LOGS: `${BASE_URL}/admin/system/logs`,
  API_USAGE: `${BASE_URL}/admin/system/api-usage`,
  SYSTEM_CONFIG: `${BASE_URL}/admin/system/config`,
  ERROR_REPORTS: `${BASE_URL}/admin/system/errors`,
  RUN_MAINTENANCE: `${BASE_URL}/admin/system/maintenance`,
};

/**
 * Dataset Endpoints
 */
export const DATASET = {
  GET_AVAILABLE: `${BASE_URL}/datasets`,
  GET_DETAILS: (id) => `${BASE_URL}/datasets/${id}`,
  GENERATE: `${BASE_URL}/datasets/generate`,
  UPLOAD: `${BASE_URL}/datasets/upload`,
  DELETE: (id) => `${BASE_URL}/datasets/${id}`,
  UPDATE_METADATA: (id) => `${BASE_URL}/datasets/${id}/metadata`,
  GENERATE_SYNTHETIC: `${BASE_URL}/datasets/generate-synthetic`,
  QUERY: (id) => `${BASE_URL}/datasets/${id}/query`,
  EXPORT: (id, format) => `${BASE_URL}/datasets/${id}/export?format=${format}`,
  GET_STATS: (id) => `${BASE_URL}/datasets/${id}/stats`,
  GENERATE_CAREER: `${BASE_URL}/datasets/generate-career`,
};

/**
 * Model Training Endpoints
 */
export const MODEL_TRAINING = {
  GET_AVAILABLE: `${BASE_URL}/models`,
  GET_DETAILS: (id) => `${BASE_URL}/models/${id}`,
  START_TRAINING: `${BASE_URL}/models/train`,
  GET_JOB_STATUS: (id) => `${BASE_URL}/models/jobs/${id}`,
  CANCEL_JOB: (id) => `${BASE_URL}/models/jobs/${id}/cancel`,
  EVALUATE_MODEL: (id) => `${BASE_URL}/models/${id}/evaluate`,
  DEPLOY_MODEL: (id) => `${BASE_URL}/models/${id}/deploy`,
  GET_PERFORMANCE: (id) => `${BASE_URL}/models/${id}/performance`,
  GET_HISTORY: `${BASE_URL}/models/history`,
  DELETE_MODEL: (id) => `${BASE_URL}/models/${id}`,
};

export default {
  AUTH,
  USER,
  USER_PROFILE,
  RESUME,
  ASSESSMENT,
  CAREER,
  JOB,
  INTERVIEW,
  LEARNING,
  NETWORKING,
  ANALYTICS,
  AI_TOOLS,
  DOCUMENTS,
  FEEDBACK,
  EMOTION,
  SPEECH,
  REPORTS,
  GAMIFICATION,
  DASHBOARD,
  VISUALIZATION,
  LANGUAGE_MODELS,
  TTS,
  ADMIN,
  DATASET,
  MODEL_TRAINING,
  BASE_URL
};