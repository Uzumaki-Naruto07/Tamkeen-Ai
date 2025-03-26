/**
 * Application constants for TamkeenAI Career System
 */

// Application metadata
export const APP_INFO = {
  NAME: 'TamkeenAI Career System',
  VERSION: '1.0.0',
  COMPANY: 'TamkeenAI',
  CONTACT_EMAIL: 'support@tamkeen.ai',
  WEBSITE: 'https://tamkeen.ai',
  COPYRIGHT: `© ${new Date().getFullYear()} TamkeenAI. All rights reserved.`,
  PLATFORM_LAUNCH_DATE: '2023-09-01',
};

// Feature flags
export const FEATURES = {
  INTERVIEW_AI: true,
  SKILL_ANALYSIS: true,
  NETWORKING_TOOLS: true,
  CAREER_INSIGHTS: true,
  RESUME_AI_OPTIMIZATION: true,
  MULTILINGUAL_SUPPORT: true,
  LEARNING_PATHS: true,
  JOB_MATCHING: true,
  MENTORSHIP: process.env.NODE_ENV === 'production',
  COMPANY_PROFILES: true,
  SALARY_INSIGHTS: true,
  PREMIUM_FEATURES: true,
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  ENTERPRISE: 'enterprise',
  CAREER_COACH: 'career_coach',
  RECRUITER: 'recruiter',
  EDUCATOR: 'educator',
};

// User subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
};

// Job seeker types
export const SEEKER_TYPES = {
  STUDENT: 'student',
  GRADUATE: 'graduate',
  PROFESSIONAL: 'professional',
  CAREER_CHANGER: 'career_changer',
  RETURNEE: 'returnee',
};

// Employment types
export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  TEMPORARY: 'temporary',
  INTERNSHIP: 'internship',
  FREELANCE: 'freelance',
  REMOTE: 'remote',
  HYBRID: 'hybrid',
};

// Job status
export const JOB_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  DRAFT: 'draft',
  FILLED: 'filled',
  ARCHIVED: 'archived',
};

// Application status
export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  REVIEWING: 'reviewing',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted',
  WITHDRAWN: 'withdrawn',
};

// Interview types
export const INTERVIEW_TYPES = {
  SCREENING: 'screening',
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  CASE_STUDY: 'case_study',
  PANEL: 'panel',
  FINAL: 'final',
};

// Resume formats
export const RESUME_FORMATS = {
  PDF: 'pdf',
  DOCX: 'docx',
  TXT: 'txt',
  JSON: 'json',
};

// Resume templates
export const RESUME_TEMPLATES = {
  PROFESSIONAL: 'professional',
  CREATIVE: 'creative',
  ACADEMIC: 'academic',
  EXECUTIVE: 'executive',
  MODERN: 'modern',
  MINIMAL: 'minimal',
  TECHNICAL: 'technical',
};

// Skill levels
export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
};

// Education levels
export const EDUCATION_LEVELS = {
  HIGH_SCHOOL: 'high_school',
  ASSOCIATE: 'associate',
  BACHELORS: 'bachelors',
  MASTERS: 'masters',
  DOCTORATE: 'doctorate',
  PROFESSIONAL: 'professional',
  CERTIFICATION: 'certification',
};

// Industry categories
export const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Media',
  'Government',
  'Nonprofit',
  'Construction',
  'Energy',
  'Transportation',
  'Hospitality',
  'Agriculture',
  'Telecommunications',
  'Pharmaceuticals',
  'Real Estate',
  'Legal Services',
  'Consulting',
  'Entertainment',
];

// Experience levels
export const EXPERIENCE_LEVELS = {
  ENTRY: 'entry_level',
  JUNIOR: 'junior',
  MID: 'mid_level',
  SENIOR: 'senior',
  MANAGER: 'manager',
  EXECUTIVE: 'executive',
};

// Skills categories
export const SKILL_CATEGORIES = {
  TECHNICAL: 'technical',
  SOFT: 'soft',
  LANGUAGE: 'language',
  INDUSTRY: 'industry',
  SOFTWARE: 'software',
  CERTIFICATION: 'certification',
};

// Top technical skills
export const TOP_TECHNICAL_SKILLS = [
  'JavaScript',
  'Python',
  'Java',
  'C#',
  'C++',
  'PHP',
  'Ruby',
  'Swift',
  'Kotlin',
  'TypeScript',
  'React',
  'Angular',
  'Vue.js',
  'Node.js',
  'Django',
  'Flask',
  'Ruby on Rails',
  'Spring Boot',
  'ASP.NET',
  'HTML',
  'CSS',
  'SQL',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'Oracle',
  'AWS',
  'Azure',
  'GCP',
  'Docker',
  'Kubernetes',
  'Git',
  'Linux',
  'Machine Learning',
  'Data Analysis',
  'Power BI',
  'Tableau',
  'Excel',
  'R',
  'TensorFlow',
];

// Top soft skills
export const TOP_SOFT_SKILLS = [
  'Communication',
  'Leadership',
  'Teamwork',
  'Problem Solving',
  'Critical Thinking',
  'Time Management',
  'Adaptability',
  'Creativity',
  'Emotional Intelligence',
  'Negotiation',
  'Conflict Resolution',
  'Decision Making',
  'Project Management',
  'Customer Service',
  'Presentation',
  'Collaboration',
  'Work Ethic',
  'Attention to Detail',
  'Organization',
  'Strategic Planning',
];

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  JOBS_PER_PAGE: 20,
  APPLICATIONS_PER_PAGE: 15,
  RESUMES_PER_PAGE: 12,
  SETTINGS_OPTIONS_PER_PAGE: 15,
};

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO: 'yyyy-MM-dd',
  API: 'yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'',
};

// Timeouts
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 seconds
  SESSION: 3600000, // 1 hour
  DEBOUNCE_SEARCH: 500, // 0.5 seconds
  NOTIFICATION_DISPLAY: 5000, // 5 seconds
  IDLE_WARNING: 540000, // 9 minutes
  IDLE_LOGOUT: 600000, // 10 minutes
};

// Maximum file sizes
export const MAX_FILE_SIZES = {
  RESUME_UPLOAD: 5 * 1024 * 1024, // 5MB
  PROFILE_PICTURE: 2 * 1024 * 1024, // 2MB
  PORTFOLIO_ITEM: 10 * 1024 * 1024, // 10MB
  COVER_LETTER: 2 * 1024 * 1024, // 2MB
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  RESUME: ['.pdf', '.docx', '.doc', '.txt', '.rtf'],
  IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  DOCUMENT: ['.pdf', '.docx', '.doc', '.txt', '.rtf', '.ppt', '.pptx'],
  VIDEO: ['.mp4', '.mov', '.avi', '.webm'],
};

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[0-9]{10,15}$/,
  URL: /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  USERNAME: /^[a-zA-Z0-9._-]{3,30}$/,
  NAME: /^[a-zA-Z\s'-]{2,50}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
};

// Application themes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Languages supported
export const LANGUAGES = {
  ENGLISH: 'en',
  ARABIC: 'ar',
};

// AI model types
export const AI_MODELS = {
  RESUME_ANALYZER: 'resume_analyzer',
  JOB_MATCHER: 'job_matcher',
  INTERVIEW_COACH: 'interview_coach',
  CAREER_PATHFINDER: 'career_pathfinder',
  SKILL_RECOMMENDER: 'skill_recommender',
  SALARY_ESTIMATOR: 'salary_estimator',
};

// Notification types
export const NOTIFICATION_TYPES = {
  JOB_ALERT: 'job_alert',
  APPLICATION_UPDATE: 'application_update',
  INTERVIEW_REMINDER: 'interview_reminder',
  PROFILE_VIEW: 'profile_view',
  SKILL_RECOMMENDATION: 'skill_recommendation',
  SYSTEM_ALERT: 'system_alert',
  MESSAGE: 'message',
};

// Career paths
export const CAREER_PATHS = {
  SOFTWARE_ENGINEERING: 'software_engineering',
  DATA_SCIENCE: 'data_science',
  DESIGN: 'design',
  MARKETING: 'marketing',
  SALES: 'sales',
  FINANCE: 'finance',
  HEALTHCARE: 'healthcare',
  EDUCATION: 'education',
  LEGAL: 'legal',
  HUMAN_RESOURCES: 'human_resources',
};

// Salary ranges (USD)
export const SALARY_RANGES = {
  ENTRY: { min: 30000, max: 60000 },
  JUNIOR: { min: 60000, max: 85000 },
  MID_LEVEL: { min: 85000, max: 115000 },
  SENIOR: { min: 115000, max: 150000 },
  MANAGER: { min: 125000, max: 180000 },
  EXECUTIVE: { min: 150000, max: 250000 },
};

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'An error occurred. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Our team has been notified.',
  NETWORK: 'Network error. Please check your connection.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  FILE_SIZE: 'File size exceeds the maximum limit.',
  FILE_TYPE: 'File type not supported.',
  DUPLICATE: 'This record already exists.',
  NOT_AVAILABLE: 'This feature is not available on your current plan.',
  RATE_LIMIT: 'You have reached the maximum number of requests. Please try again later.',
};

// Resume action verbs by category
export const RESUME_ACTION_VERBS = {
  ACHIEVEMENT: [
    'Achieved', 'Attained', 'Completed', 'Established', 'Exceeded', 
    'Improved', 'Pioneered', 'Reduced', 'Resolved', 'Restored', 
    'Surpassed', 'Transformed', 'Won', 'Eliminated', 'Increased'
  ],
  COMMUNICATION: [
    'Addressed', 'Arbitrated', 'Arranged', 'Authored', 'Collaborated', 
    'Convinced', 'Corresponded', 'Defined', 'Documented', 'Edited', 
    'Interpreted', 'Lobbied', 'Mediated', 'Negotiated', 'Persuaded'
  ],
  CREATIVITY: [
    'Conceptualized', 'Created', 'Customized', 'Designed', 'Developed', 
    'Founded', 'Illustrated', 'Initiated', 'Instituted', 'Integrated', 
    'Introduced', 'Invented', 'Originated', 'Revitalized', 'Shaped'
  ],
  LEADERSHIP: [
    'Administered', 'Assigned', 'Chaired', 'Consolidated', 'Delegated', 
    'Directed', 'Enforced', 'Enhanced', 'Established', 'Executed', 
    'Headed', 'Managed', 'Oversaw', 'Prioritized', 'Supervised'
  ],
  TECHNICAL: [
    'Assembled', 'Built', 'Calculated', 'Computed', 'Designed', 
    'Engineered', 'Fabricated', 'Maintained', 'Operated', 'Programmed', 
    'Remodeled', 'Repaired', 'Solved', 'Upgraded', 'Utilized'
  ],
  ANALYTICAL: [
    'Analyzed', 'Assessed', 'Clarified', 'Compared', 'Evaluated', 
    'Examined', 'Formulated', 'Investigated', 'Measured', 'Organized', 
    'Researched', 'Reviewed', 'Solved', 'Surveyed', 'Systematized'
  ],
};

// Common job titles by industry
export const JOB_TITLES = {
  TECHNOLOGY: [
    'Software Engineer', 'Front-End Developer', 'Back-End Developer',
    'Full Stack Developer', 'DevOps Engineer', 'Data Scientist',
    'UX Designer', 'Product Manager', 'QA Engineer', 'Cloud Architect',
    'Machine Learning Engineer', 'Systems Administrator', 'IT Manager',
    'Security Engineer', 'Network Administrator'
  ],
  BUSINESS: [
    'Business Analyst', 'Marketing Manager', 'Sales Representative',
    'Account Executive', 'Financial Analyst', 'Project Manager',
    'Operations Manager', 'Human Resources Specialist', 'Recruiter',
    'Customer Success Manager', 'Business Development Representative',
    'Social Media Manager', 'Content Strategist', 'SEO Specialist',
    'Public Relations Specialist'
  ],
  HEALTHCARE: [
    'Registered Nurse', 'Physician', 'Medical Assistant',
    'Physical Therapist', 'Pharmacist', 'Dental Hygienist',
    'Occupational Therapist', 'Healthcare Administrator',
    'Medical Laboratory Technician', 'Radiologic Technologist',
    'Nurse Practitioner', 'Physician Assistant', 'Speech Therapist',
    'Dietitian', 'Medical Coder'
  ],
  EDUCATION: [
    'Teacher', 'Professor', 'School Counselor', 'Principal',
    'Educational Consultant', 'Instructional Designer',
    'Curriculum Developer', 'Special Education Teacher',
    'Teaching Assistant', 'School Psychologist', 'Academic Advisor',
    'Dean', 'Education Administrator', 'Librarian', 'Tutor'
  ],
  CREATIVE: [
    'Graphic Designer', 'Copywriter', 'Art Director', 'Video Editor',
    'Photographer', 'Illustrator', 'Content Creator', 'Fashion Designer',
    'Interior Designer', 'Animator', 'Game Designer', 'Music Producer',
    'Film Director', 'Creative Director', 'Brand Manager'
  ],
};

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Your profile has been successfully updated.',
  RESUME_CREATED: 'Your resume has been successfully created.',
  RESUME_UPDATED: 'Your resume has been successfully updated.',
  APPLICATION_SUBMITTED: 'Your application has been successfully submitted.',
  PASSWORD_CHANGED: 'Your password has been successfully changed.',
  ACCOUNT_CREATED: 'Your account has been successfully created.',
  SETTINGS_SAVED: 'Your settings have been successfully saved.',
  DATA_IMPORTED: 'Your data has been successfully imported.',
  FILE_UPLOADED: 'File has been successfully uploaded.',
  FEEDBACK_SUBMITTED: 'Your feedback has been submitted. Thank you!',
  INTERVIEW_SCHEDULED: 'Your interview has been successfully scheduled.',
  SKILL_ADDED: 'Skill has been successfully added to your profile.',
  PASSWORD_RESET_SENT: 'Password reset instructions have been sent to your email.',
};

// Analytics events
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  SIGNUP: 'signup',
  LOGIN: 'login',
  RESUME_CREATE: 'resume_create',
  RESUME_DOWNLOAD: 'resume_download',
  JOB_SEARCH: 'job_search',
  JOB_SAVE: 'job_save',
  APPLICATION_START: 'application_start',
  APPLICATION_SUBMIT: 'application_submit',
  INTERVIEW_PRACTICE: 'interview_practice',
  FEEDBACK_SUBMIT: 'feedback_submit',
  SUBSCRIPTION_CHANGE: 'subscription_change',
  FEATURE_USE: 'feature_use',
  ERROR_ENCOUNTER: 'error_encounter',
  SEARCH_PERFORM: 'search_perform',
};

// Export all constants as a default object
export default {
  APP_INFO,
  FEATURES,
  USER_ROLES,
  SUBSCRIPTION_TIERS,
  SEEKER_TYPES,
  EMPLOYMENT_TYPES,
  JOB_STATUS,
  APPLICATION_STATUS,
  INTERVIEW_TYPES,
  RESUME_FORMATS,
  RESUME_TEMPLATES,
  SKILL_LEVELS,
  EDUCATION_LEVELS,
  INDUSTRIES,
  EXPERIENCE_LEVELS,
  SKILL_CATEGORIES,
  TOP_TECHNICAL_SKILLS,
  TOP_SOFT_SKILLS,
  PAGINATION,
  DATE_FORMATS,
  TIMEOUTS,
  MAX_FILE_SIZES,
  ALLOWED_FILE_TYPES,
  VALIDATION_PATTERNS,
  THEMES,
  LANGUAGES,
  AI_MODELS,
  NOTIFICATION_TYPES,
  CAREER_PATHS,
  SALARY_RANGES,
  ERROR_MESSAGES,
  RESUME_ACTION_VERBS,
  JOB_TITLES,
  SUCCESS_MESSAGES,
  ANALYTICS_EVENTS,
};
