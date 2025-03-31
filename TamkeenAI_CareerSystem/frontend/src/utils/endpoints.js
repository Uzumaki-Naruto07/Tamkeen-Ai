// frontend/src/utils/endpoints.js

// Base API URL - read from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh-token`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  USER_INFO: `${API_BASE_URL}/auth/user-info`,
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
  SCORE: `${API_BASE_URL}/resume/score`,
  OPTIMIZE: `${API_BASE_URL}/resume/optimize`,
  EXTRACT_KEYWORDS: `${API_BASE_URL}/resume/extract-keywords`,
  GENERATE_PDF: `${API_BASE_URL}/resume/generate-pdf`,
  TRACK_SCORE: `${API_BASE_URL}/resume/track-score`,
};

// Interview endpoints
export const INTERVIEW_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/interview/create`,
  GET_ALL: `${API_BASE_URL}/interview/all`,
  GET_BY_ID: (id) => `${API_BASE_URL}/interview/${id}`,
  UPDATE: (id) => `${API_BASE_URL}/interview/${id}`,
  DELETE: (id) => `${API_BASE_URL}/interview/${id}`,
  GENERATE_QUESTIONS: `${API_BASE_URL}/interview/generate-questions`,
  MOCK_INTERVIEW: `${API_BASE_URL}/interview/mock`,
  ANALYZE_ANSWERS: `${API_BASE_URL}/interview/analyze-answers`,
  PROVIDE_FEEDBACK: `${API_BASE_URL}/interview/feedback`,
  GET_COACHES: `${API_BASE_URL}/interview/coaches`,
  GET_COACH_BY_ID: (id) => `${API_BASE_URL}/interview/coaches/${id}`,
  BOOK_SESSION: `${API_BASE_URL}/interview/book-session`,
  GET_BOOKINGS: `${API_BASE_URL}/interview/bookings`,
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
  GET_INDUSTRIES: `${API_BASE_URL}/job/industries`,
  GET_SKILLS: `${API_BASE_URL}/job/skills`,
  GET_RECENT: `${API_BASE_URL}/job/recent`,
  GET_SAVED_SEARCHES: `${API_BASE_URL}/job/saved-searches`,
  GET_SEARCH_HISTORY: `${API_BASE_URL}/job/search-history`,
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
  GENERATE_COVER_LETTER: `${API_BASE_URL}/job-application/generate-cover-letter`,
  AUTOMATE_LINKEDIN_APPLICATION: `${API_BASE_URL}/job-application/linkedin-automation`,
};

// User endpoints
export const USER_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}/user/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/user/profile`,
  UPLOAD_AVATAR: `${API_BASE_URL}/user/avatar`,
  GET_NOTIFICATIONS: `${API_BASE_URL}/user/notifications`,
  UPDATE_SETTINGS: `${API_BASE_URL}/user/settings`,
  DELETE_ACCOUNT: `${API_BASE_URL}/user/account`,
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
  ASSESS: `${API_BASE_URL}/skill/assess`,
  GAP_ANALYSIS: `${API_BASE_URL}/skill/gap-analysis`,
  RECOMMENDATIONS: `${API_BASE_URL}/skill/recommendations`,
  TRACK_PROGRESS: `${API_BASE_URL}/skill/track-progress`,
};

// Add mock data for UAE jobs
const getUAEMockJobs = () => [
  {
    id: 'job-1',
    title: 'Software Engineer',
    company: 'Emirates Technology Solutions',
    location: 'Dubai, UAE',
    emirate: 'Dubai',
    jobType: 'Full-time',
    salaryRange: '15,000 - 25,000 AED/month',
    salaryMin: 15000,
    salaryMax: 25000,
    salaryType: 'monthly',
    description: 'Join our team to develop innovative solutions for the UAE market...',
    requirements: ['3+ years of experience', 'Bachelor\'s degree', 'JavaScript/React expertise'],
    benefits: ['Housing allowance', 'Health insurance', 'Annual flight tickets'],
    visaStatus: 'Employment Visa Provided',
    sectorType: 'private',
    companyLocation: 'Dubai Internet City (Free Zone)',
    postedDate: '2023-05-15',
    deadline: '2023-06-15',
    matchScore: 85,
    nationality: 'All Nationalities'
  },
  {
    id: 'job-2',
    title: 'Financial Analyst',
    company: 'Abu Dhabi Investment Authority',
    location: 'Abu Dhabi, UAE',
    emirate: 'Abu Dhabi',
    jobType: 'Full-time',
    salaryRange: '18,000 - 30,000 AED/month',
    salaryMin: 18000,
    salaryMax: 30000,
    salaryType: 'monthly',
    description: 'Analyze investment opportunities across the MENA region...',
    requirements: ['5+ years of experience', 'CFA designation', 'Arabic & English fluency'],
    benefits: ['Housing allowance', 'Education allowance for children', 'Annual flight tickets'],
    visaStatus: 'Employment Visa Provided',
    sectorType: 'government',
    companyLocation: 'Mainland',
    postedDate: '2023-05-12',
    deadline: '2023-06-12',
    matchScore: 78,
    nationality: 'All Nationalities'
  },
  {
    id: 'job-3',
    title: 'Marketing Manager',
    company: 'Etisalat',
    location: 'Dubai, UAE',
    emirate: 'Dubai',
    jobType: 'Full-time',
    salaryRange: '25,000 - 35,000 AED/month',
    salaryMin: 25000,
    salaryMax: 35000,
    salaryType: 'monthly',
    description: 'Lead marketing strategies for telecommunications products in the UAE market...',
    requirements: ['7+ years of marketing experience', 'Master\'s degree preferred', 'Digital marketing expertise'],
    benefits: ['Housing allowance', 'Health insurance', 'Annual flight tickets', 'Performance bonus'],
    visaStatus: 'Employment Visa Provided',
    sectorType: 'semi-government',
    companyLocation: 'Mainland',
    postedDate: '2023-05-10',
    deadline: '2023-06-10',
    matchScore: 92,
    nationality: 'All Nationalities'
  },
  // Add more jobs...
  {
    id: 'job-15',
    title: 'Petroleum Engineer',
    company: 'ADNOC',
    location: 'Abu Dhabi, UAE',
    emirate: 'Abu Dhabi',
    jobType: 'Full-time',
    salaryRange: '30,000 - 45,000 AED/month',
    salaryMin: 30000,
    salaryMax: 45000,
    salaryType: 'monthly',
    description: 'Work on oil and gas extraction projects across the UAE...',
    requirements: ['Petroleum Engineering degree', '5+ years experience', 'Knowledge of extraction methods'],
    benefits: ['Housing allowance', 'Education allowance', 'Annual tickets', 'Transportation allowance', 'Health insurance for family'],
    visaStatus: 'Employment Visa Provided',
    sectorType: 'government',
    companyLocation: 'Mainland',
    postedDate: '2023-05-12',
    deadline: '2023-06-12',
    matchScore: 90,
    nationality: 'All Nationalities'
  },
  {
    id: 'job-16',
    title: 'UI/UX Designer',
    company: 'Digital Oasis',
    location: 'Sharjah, UAE',
    emirate: 'Sharjah',
    jobType: 'Full-time',
    salaryRange: '12,000 - 18,000 AED/month',
    salaryMin: 12000,
    salaryMax: 18000,
    salaryType: 'monthly',
    description: 'Design user interfaces for mobile and web applications...',
    requirements: ['Portfolio of UI/UX work', 'Figma proficiency', 'User testing experience'],
    benefits: ['Flexible hours', 'Health insurance', 'Transportation allowance'],
    visaStatus: 'Employment Visa Provided',
    sectorType: 'private',
    companyLocation: 'Sharjah Media City (Free Zone)',
    postedDate: '2023-05-10',
    deadline: '2023-06-10',
    matchScore: 82,
    nationality: 'All Nationalities'
  }
];

// Add helper function to filter jobs
const filterJobsByParams = (job, params) => {
  // Title or keyword search
  if (params.search && !job.title.toLowerCase().includes(params.search.toLowerCase()) && 
      !job.company.toLowerCase().includes(params.search.toLowerCase())) {
    return false;
  }
  
  // Location search - more specific handling for UAE locations
  if (params.location) {
    const emirates = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'];
    const searchedEmirate = emirates.find(emirate => 
      params.location.toLowerCase().includes(emirate.toLowerCase())
    );
    
    if (searchedEmirate && job.emirate !== searchedEmirate) {
      return false;
    } else if (!searchedEmirate && !job.location.toLowerCase().includes(params.location.toLowerCase())) {
      return false;
    }
  }
  
  // Emirates filter
  if (params.emirates && params.emirates.length > 0 && !params.emirates.includes(job.emirate)) {
    return false;
  }
  
  // Job Type filter
  if (params.jobTypes && params.jobTypes.length > 0 && !params.jobTypes.includes(job.jobType)) {
    return false;
  }
  
  // Visa Status filter
  if (params.visaStatus && params.visaStatus.length > 0 && !params.visaStatus.includes(job.visaStatus)) {
    return false;
  }
  
  // Experience Level filter
  if (params.experience && params.experience.length > 0) {
    const jobLevel = getExperienceLevelFromRequirements(job.requirements);
    if (!params.experience.includes(jobLevel)) {
      return false;
    }
  }
  
  // Salary Range filter
  if (params.salary && params.salary.length === 2) {
    const [minSalary, maxSalary] = params.salary;
    
    // Convert job salary to comparable format based on salary type
    let jobMinSalary = job.salaryMin;
    let jobMaxSalary = job.salaryMax;
    
    if (params.salaryType === 'annual' && job.salaryType === 'monthly') {
      jobMinSalary = job.salaryMin * 12;
      jobMaxSalary = job.salaryMax * 12;
    } else if (params.salaryType === 'monthly' && job.salaryType === 'annual') {
      jobMinSalary = job.salaryMin / 12;
      jobMaxSalary = job.salaryMax / 12;
    }
    
    if (jobMaxSalary < minSalary || jobMinSalary > maxSalary) {
      return false;
    }
  }
  
  // Benefits filter
  if (params.benefits && params.benefits.length > 0) {
    if (!job.benefits || !params.benefits.every(benefit => 
      job.benefits.some(jobBenefit => 
        jobBenefit.toLowerCase().includes(benefit.toLowerCase())
      )
    )) {
      return false;
    }
  }
  
  // Remote work filter
  if (params.remote === true && !job.location.toLowerCase().includes('remote')) {
    return false;
  }
  
  // Date Posted filter
  if (params.datePosted && params.datePosted !== 'any') {
    const jobPostedDate = new Date(job.postedDate);
    const currentDate = new Date();
    
    switch (params.datePosted) {
      case 'today':
        if (jobPostedDate.toDateString() !== currentDate.toDateString()) {
          return false;
        }
        break;
      case 'week':
        const weekAgo = new Date(currentDate);
        weekAgo.setDate(currentDate.getDate() - 7);
        if (jobPostedDate < weekAgo) {
          return false;
        }
        break;
      case 'month':
        const monthAgo = new Date(currentDate);
        monthAgo.setDate(currentDate.getDate() - 30);
        if (jobPostedDate < monthAgo) {
          return false;
        }
        break;
    }
  }
  
  // Sector Type filter
  if (params.sectorType && params.sectorType !== 'all' && job.sectorType !== params.sectorType) {
    return false;
  }
  
  // Company Location filter (mainland/freezone)
  if (params.companyLocation && params.companyLocation !== 'all') {
    if (params.companyLocation === 'freezone' && !job.companyLocation.toLowerCase().includes('free zone')) {
      return false;
    }
    if (params.companyLocation === 'mainland' && !job.companyLocation.toLowerCase().includes('mainland')) {
      return false;
    }
  }
  
  // Skills filter
  if (params.skills && params.skills.length > 0) {
    const jobRequirementsText = job.requirements ? job.requirements.join(' ').toLowerCase() : '';
    const hasMatchingSkill = params.skills.some(skill => 
      jobRequirementsText.includes(skill.toLowerCase())
    );
    
    if (!hasMatchingSkill) {
      return false;
    }
  }
  
  // Industry filter
  if (params.industries && params.industries.length > 0) {
    const jobText = `${job.company} ${job.title} ${job.description}`.toLowerCase();
    const hasMatchingIndustry = params.industries.some(industry => 
      jobText.includes(industry.toLowerCase())
    );
    
    if (!hasMatchingIndustry) {
      return false;
    }
  }
  
  return true;
};

// Helper function to determine experience level from requirements
function getExperienceLevelFromRequirements(requirements) {
  if (!requirements || !Array.isArray(requirements)) {
    return 'Entry level';
  }
  
  const reqString = requirements.join(' ').toLowerCase();
  
  if (reqString.includes('executive') || reqString.includes('c-level') || reqString.includes('ceo') || 
      reqString.includes('cto') || reqString.includes('cfo') || reqString.includes('10+ years')) {
    return 'Executive';
  }
  
  if (reqString.includes('manager') || reqString.includes('head of') || reqString.includes('director') || 
      reqString.includes('8+ years') || reqString.includes('7+ years')) {
    return 'Manager';
  }
  
  if (reqString.includes('senior') || reqString.includes('lead') || reqString.includes('5+ years') || 
      reqString.includes('6+ years')) {
    return 'Senior level';
  }
  
  if (reqString.includes('3+ years') || reqString.includes('4+ years') || reqString.includes('mid')) {
    return 'Mid level';
  }
  
  return 'Entry level';
}

// Add job endpoints with functions
export const jobEndpoints = {
  jobs: {
    searchJobs: async (params) => {
      const filteredJobs = getUAEMockJobs().filter(job => filterJobsByParams(job, params));
      return {
        success: true,
        data: {
          jobs: filteredJobs,
          total: filteredJobs.length
        }
      };
    },
    
    getRecentJobs: async () => ({
      success: true,
      data: {
        jobs: getUAEMockJobs(),
        total: getUAEMockJobs().length
      }
    }),
    
    getIndustries: async () => ({
      success: true,
      data: {
        industries: [
          'Oil & Gas',
          'Banking & Finance',
          'Real Estate',
          'Construction',
          'Technology',
          'Healthcare',
          'Education',
          'Tourism & Hospitality',
          'Retail',
          'Media',
          'Logistics',
          'Government',
          'Telecommunications'
        ]
      }
    }),
    
    getSkillsList: async () => ({
      success: true,
      data: {
        skills: [
          'JavaScript',
          'Python',
          'React',
          'Node.js',
          'SQL',
          'Machine Learning',
          'Data Analysis',
          'Project Management',
          'Communication',
          'Leadership',
          'Arabic',
          'English'
        ]
      }
    }),

    getSavedJobs: async (userId) => ({
      success: true,
      data: []
    }),

    unsaveJob: async (jobId) => ({
      success: true,
      data: { message: 'Job unsaved successfully' }
    }),

    saveJob: async (jobId) => ({
      success: true,
      data: { message: 'Job saved successfully' }
    }),

    getJobById: async (jobId) => {
      const job = getUAEMockJobs().find(j => j.id === jobId);
      return {
        success: true,
        data: job || null
      };
    }
  }
};

// Export all endpoints
export const apiEndpoints = {
  auth: AUTH_ENDPOINTS,
  user: USER_ENDPOINTS,
  dashboard: DASHBOARD_ENDPOINTS,
  jobs: {
    search: (params) => ({
      url: JOB_ENDPOINTS.SEARCH,
      method: 'post',
      data: params
    }),
    getById: (id) => ({
      url: JOB_ENDPOINTS.GET_BY_ID(id),
      method: 'get'
    }),
    saveJob: (id) => ({
      url: JOB_ENDPOINTS.SAVE(id),
      method: 'post'
    }),
    unsaveJob: (id) => ({
      url: JOB_ENDPOINTS.UNSAVE(id),
      method: 'post'
    }),
    getSavedJobs: () => ({
      url: JOB_ENDPOINTS.GET_SAVED,
      method: 'get'
    }),
    getIndustries: () => ({
      url: JOB_ENDPOINTS.GET_INDUSTRIES,
      method: 'get',
      data: { mock: true }
    }),
    getSkillsList: () => ({
      url: JOB_ENDPOINTS.GET_SKILLS,
      method: 'get',
      data: { mock: true }
    }),
    getRecentJobs: (page, pageSize) => ({
      url: JOB_ENDPOINTS.GET_RECENT,
      method: 'get',
      params: { page, pageSize },
      data: { mock: true }
    }),
    getSavedSearches: (userId) => ({
      url: JOB_ENDPOINTS.GET_SAVED_SEARCHES,
      method: 'get',
      params: { userId },
      data: { mock: true }
    }),
    getSearchHistory: (userId) => ({
      url: JOB_ENDPOINTS.GET_SEARCH_HISTORY,
      method: 'get',
      params: { userId },
      data: { mock: true }
    }),
    getRecommendedJobs: (userId) => ({
      url: JOB_ENDPOINTS.RECOMMEND,
      method: 'get',
      params: { userId },
      data: { mock: true }
    })
  },
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
    }),
    score: (resumeId) => ({
      url: RESUME_ENDPOINTS.SCORE(resumeId),
      method: 'post'
    }),
    optimize: (resumeId) => ({
      url: RESUME_ENDPOINTS.OPTIMIZE(resumeId),
      method: 'post'
    }),
    extractKeywords: (resumeId) => ({
      url: RESUME_ENDPOINTS.EXTRACT_KEYWORDS(resumeId),
      method: 'post'
    }),
    generatePdf: (resumeId) => ({
      url: RESUME_ENDPOINTS.GENERATE_PDF(resumeId),
      method: 'post'
    }),
    trackScore: (resumeId) => ({
      url: RESUME_ENDPOINTS.TRACK_SCORE(resumeId),
      method: 'get'
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
    }),
    assess: (userId, jobId) => ({
      url: SKILLS_ENDPOINTS.ASSESS(userId, jobId),
      method: 'post'
    }),
    gapAnalysis: (userId, jobId) => ({
      url: SKILLS_ENDPOINTS.GAP_ANALYSIS(userId, jobId),
      method: 'post'
    }),
    recommendations: (userId) => ({
      url: SKILLS_ENDPOINTS.RECOMMENDATIONS(userId),
      method: 'get'
    }),
    trackProgress: (userId) => ({
      url: SKILLS_ENDPOINTS.TRACK_PROGRESS(userId),
      method: 'get'
    })
  },
  interview: INTERVIEW_ENDPOINTS
};

export default apiEndpoints;