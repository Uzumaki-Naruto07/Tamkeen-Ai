/**
 * Mock Data Index
 * This file centralizes all mock data for the application,
 * making it easier to import and use mock data throughout the app.
 */

// Import all mock data
import jobApplicationsMock, { 
  getJobApplicationsByUserId, 
  getJobApplicationById,
  getJobApplicationsByStatus 
} from './jobApplicationMock';

// Import mock job data - use named imports from jobsData.js
import mockJobsData, { 
  mockJobs,
  mockJobCategories,
  mockIndustries,
  mockSkills
} from '../mockData/jobsData';

// User-related mocks
const mockUsers = [
  {
    id: 'user-1',
    name: 'Zayed Al Nahyan',
    email: 'zayed@tamkeen.ai',
    role: 'user',
    avatar: null,
    joined: '2023-01-15T08:00:00Z'
  },
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@tamkeen.ai',
    role: 'admin',
    avatar: null,
    joined: '2022-12-01T08:00:00Z'
  }
];

// Resume mocks
const mockResumes = [
  {
    id: 'resume-1',
    userId: 'user-1',
    name: 'Tech Resume 2023',
    createdAt: '2023-01-20T10:15:00Z',
    updatedAt: '2023-03-10T14:30:00Z',
    score: 85,
    skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'HTML/CSS'],
    experience: [
      {
        title: 'Senior Frontend Developer',
        company: 'TechCorp UAE',
        location: 'Dubai, UAE',
        startDate: '2021-06-01T00:00:00Z',
        endDate: null,
        current: true,
        description: 'Leading frontend development team and architecting React applications'
      },
      {
        title: 'Frontend Developer',
        company: 'Digital Solutions LLC',
        location: 'Abu Dhabi, UAE',
        startDate: '2019-03-01T00:00:00Z',
        endDate: '2021-05-31T00:00:00Z',
        current: false,
        description: 'Developed responsive web applications using React and Redux'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'UAE University',
        location: 'Al Ain, UAE',
        graduationDate: '2019-05-15T00:00:00Z'
      }
    ]
  },
  {
    id: 'resume-2',
    userId: 'user-1',
    name: 'Design Resume 2023',
    createdAt: '2023-02-05T09:20:00Z',
    updatedAt: '2023-02-05T09:20:00Z',
    score: 78,
    skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'User Research', 'Wireframing'],
    experience: [
      {
        title: 'UX/UI Designer',
        company: 'Creative Agency Dubai',
        location: 'Dubai, UAE',
        startDate: '2020-08-01T00:00:00Z',
        endDate: null,
        current: true,
        description: 'Designing user interfaces for web and mobile applications'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Fine Arts in Design',
        institution: 'American University of Sharjah',
        location: 'Sharjah, UAE',
        graduationDate: '2020-06-10T00:00:00Z'
      }
    ]
  }
];

// Companies mock data
const mockCompanies = [
  {
    id: 'company-1',
    name: 'TechCorp UAE',
    logo: 'https://via.placeholder.com/150?text=TechCorp',
    location: 'Dubai, UAE',
    industry: 'Technology',
    size: '500-1000',
    website: 'https://techcorp-uae.example.com',
    description: 'Leading technology company in the UAE focusing on digital transformation',
    founded: 2010,
    benefits: ['Health Insurance', 'Flexible Hours', 'Remote Work Options', 'Career Growth']
  },
  {
    id: 'company-2',
    name: 'Financial Solutions DMCC',
    logo: 'https://via.placeholder.com/150?text=FinSol',
    location: 'Dubai, UAE',
    industry: 'Finance',
    size: '100-500',
    website: 'https://financial-solutions.example.com',
    description: 'Financial technology solutions provider serving the MENA region',
    founded: 2015,
    benefits: ['Competitive Salary', 'Annual Bonus', 'Education Assistance', 'Health Insurance']
  },
  {
    id: 'company-3',
    name: 'Global Healthcare Dubai',
    logo: 'https://via.placeholder.com/150?text=GHD',
    location: 'Dubai, UAE',
    industry: 'Healthcare',
    size: '1000+',
    website: 'https://global-healthcare.example.com',
    description: 'International healthcare provider with cutting-edge medical technology',
    founded: 2005,
    benefits: ['Health Insurance', 'Life Insurance', 'Retirement Plan', 'Wellness Programs']
  },
  {
    id: 'company-4',
    name: 'Emirates Digital Solutions',
    logo: 'https://via.placeholder.com/150?text=EDS',
    location: 'Dubai, UAE',
    industry: 'Technology',
    size: '100-500',
    website: 'https://emirates-digital.example.com',
    description: 'Digital transformation consultancy for government and private sectors',
    founded: 2014,
    benefits: ['Competitive Salary', 'Flexible Hours', 'Training Programs', 'Health Insurance']
  },
  {
    id: 'company-5',
    name: 'Abu Dhabi Smart City',
    logo: 'https://via.placeholder.com/150?text=ADSC',
    location: 'Abu Dhabi, UAE',
    industry: 'Government',
    size: '500-1000',
    website: 'https://abudhabi-smartcity.example.com',
    description: 'Smart city initiative driving innovation in urban development',
    founded: 2018,
    benefits: ['Government Benefits', 'Housing Allowance', 'Transportation Allowance', 'Educational Support']
  }
];

// Analytics mock data
const mockAnalytics = {
  jobMarket: {
    totalJobs: 2500,
    newJobsLastWeek: 320,
    growthRate: 15,
    topIndustries: [
      { name: 'Technology', percentage: 35 },
      { name: 'Finance', percentage: 22 },
      { name: 'Healthcare', percentage: 18 },
      { name: 'Retail', percentage: 12 },
      { name: 'Education', percentage: 8 }
    ],
    demandSkills: [
      { name: 'React', growth: 45 },
      { name: 'TypeScript', growth: 38 },
      { name: 'Node.js', growth: 32 },
      { name: 'Data Science', growth: 28 },
      { name: 'Cloud Computing', growth: 25 }
    ],
    salaryRanges: {
      technology: { min: 12000, max: 35000, average: 22000, currency: 'AED' },
      finance: { min: 15000, max: 40000, average: 25000, currency: 'AED' },
      healthcare: { min: 10000, max: 30000, average: 18000, currency: 'AED' }
    }
  },
  userProgress: {
    profileCompletion: 85,
    applicationSuccess: 65,
    interviewRate: 42,
    skillGrowth: [
      { skill: 'React', growth: 15 },
      { skill: 'TypeScript', growth: 20 },
      { skill: 'Leadership', growth: 8 }
    ],
    activeDays: [
      { date: '2023-03-01', activity: 10 },
      { date: '2023-03-02', activity: 5 },
      { date: '2023-03-03', activity: 8 },
      { date: '2023-03-04', activity: 12 },
      { date: '2023-03-05', activity: 7 }
    ]
  }
};

// Gamification mock data
const mockGamification = {
  progress: {
    level: 4,
    currentXP: 350,
    xpToNextLevel: 500,
    totalXP: 1350,
    streak: 5,
    activeDays: 21
  },
  badges: [
    {
      id: 'badge-1',
      name: 'Profile Master',
      nameAr: 'محترف الملف الشخصي',
      description: 'Completed your profile with all details',
      descriptionAr: 'أكملت ملفك الشخصي بجميع التفاصيل',
      category: 'profile',
      color: '#4CAF50',
      unlocked: true,
      dateAchieved: '2023-02-15T10:30:00Z',
      criteria: ['Complete personal info', 'Add profile picture', 'Add a resume'],
      criteriaAr: ['إكمال المعلومات الشخصية', 'إضافة صورة الملف الشخصي', 'إضافة السيرة الذاتية']
    },
    {
      id: 'badge-2',
      name: 'Job Seeker',
      nameAr: 'باحث عن عمل',
      description: 'Applied to 10 jobs',
      descriptionAr: 'تقدمت لـ 10 وظائف',
      category: 'jobs',
      color: '#2196F3',
      unlocked: true,
      dateAchieved: '2023-03-10T14:15:00Z',
      criteria: ['Apply to 10 jobs'],
      criteriaAr: ['التقدم لـ 10 وظائف']
    },
    {
      id: 'badge-3',
      name: 'Skill Builder',
      nameAr: 'بناء المهارات',
      description: 'Added 15 skills to your profile',
      descriptionAr: 'أضفت 15 مهارة إلى ملفك الشخصي',
      category: 'skills',
      color: '#9C27B0',
      unlocked: true,
      dateAchieved: '2023-03-05T09:45:00Z',
      criteria: ['Add 15 skills to your profile'],
      criteriaAr: ['إضافة 15 مهارة إلى ملفك الشخصي']
    },
    {
      id: 'badge-4',
      name: 'Interview Ace',
      nameAr: 'متميز في المقابلات',
      description: 'Complete 5 mock interviews',
      descriptionAr: 'أكمل 5 مقابلات تجريبية',
      category: 'interview',
      color: '#F44336',
      unlocked: false,
      criteria: ['Complete 5 mock interviews with a score of 80% or higher'],
      criteriaAr: ['إكمال 5 مقابلات تجريبية بنتيجة 80٪ أو أعلى']
    },
    {
      id: 'badge-5',
      name: 'Networking Pro',
      nameAr: 'محترف التواصل',
      description: 'Connected with 10 professionals',
      descriptionAr: 'تواصلت مع 10 محترفين',
      category: 'networking',
      color: '#FF9800',
      unlocked: false,
      criteria: ['Connect with 10 professionals in your industry'],
      criteriaAr: ['التواصل مع 10 محترفين في مجال عملك']
    }
  ],
  achievements: [
    {
      id: 'achieve-1',
      name: 'First Job Application',
      nameAr: 'أول تقديم للوظيفة',
      description: 'Applied to your first job',
      descriptionAr: 'تقدمت لأول وظيفة لك',
      category: 'jobs',
      points: 50,
      achieved: true,
      dateAchieved: '2023-01-20T11:30:00Z'
    },
    {
      id: 'achieve-2',
      name: 'Resume Uploaded',
      nameAr: 'تم رفع السيرة الذاتية',
      description: 'Uploaded your first resume',
      descriptionAr: 'رفعت سيرتك الذاتية الأولى',
      category: 'profile',
      points: 30,
      achieved: true,
      dateAchieved: '2023-01-15T09:20:00Z'
    },
    {
      id: 'achieve-3',
      name: 'Skill Assessment Completed',
      nameAr: 'اكتمال تقييم المهارات',
      description: 'Completed your first skill assessment',
      descriptionAr: 'أكملت أول تقييم للمهارات الخاصة بك',
      category: 'skills',
      points: 75,
      achieved: true,
      dateAchieved: '2023-01-25T14:45:00Z'
    },
    {
      id: 'achieve-4',
      name: 'Interview Feedback',
      nameAr: 'تقييم المقابلة',
      description: 'Received feedback from 3 mock interviews',
      descriptionAr: 'تلقيت تقييمات من 3 مقابلات تجريبية',
      category: 'interview',
      points: 60,
      achieved: true,
      dateAchieved: '2023-02-10T16:30:00Z'
    },
    {
      id: 'achieve-5',
      name: 'Learning Streak',
      nameAr: 'تتابع التعلم',
      description: 'Learned for 7 consecutive days',
      descriptionAr: 'تعلمت لمدة 7 أيام متتالية',
      category: 'learning',
      points: 100,
      achieved: false
    }
  ],
  challenges: [
    {
      id: 'challenge-1',
      name: 'Resume Optimizer',
      nameAr: 'محسن السيرة الذاتية',
      description: 'Improve your resume score by 15%',
      descriptionAr: 'حسّن نتيجة سيرتك الذاتية بنسبة 15٪',
      category: 'resume',
      difficulty: 'medium',
      difficultyAr: 'متوسط',
      xpReward: 150,
      deadline: '2023-04-15T23:59:59Z',
      status: 'in-progress',
      statusAr: 'قيد التقدم',
      progress: 60,
      accepted: true
    },
    {
      id: 'challenge-2',
      name: 'Interview Preparation',
      nameAr: 'التحضير للمقابلة',
      description: 'Complete 3 mock interviews this week',
      descriptionAr: 'أكمل 3 مقابلات تجريبية هذا الأسبوع',
      category: 'interview',
      difficulty: 'hard',
      difficultyAr: 'صعب',
      xpReward: 200,
      deadline: '2023-04-10T23:59:59Z',
      status: 'not-started',
      statusAr: 'لم يبدأ',
      progress: 0,
      accepted: false
    },
    {
      id: 'challenge-3',
      name: 'Skill Development',
      nameAr: 'تطوير المهارات',
      description: 'Complete 2 skill courses',
      descriptionAr: 'أكمل دورتين تدريبيتين للمهارات',
      category: 'learning',
      difficulty: 'easy',
      difficultyAr: 'سهل',
      xpReward: 100,
      deadline: '2023-04-20T23:59:59Z',
      status: 'completed',
      statusAr: 'مكتمل',
      progress: 100,
      accepted: true
    }
  ],
  activityHistory: [
    {
      id: 'activity-1',
      type: 'job_application',
      description: 'Applied for Frontend Developer at TechCorp UAE',
      timestamp: '2023-03-15T10:30:00Z',
      xpEarned: 20
    },
    {
      id: 'activity-2',
      type: 'skill_assessment',
      description: 'Completed React assessment with 85% score',
      timestamp: '2023-03-12T14:15:00Z',
      xpEarned: 50
    },
    {
      id: 'activity-3',
      type: 'learning',
      description: 'Completed course: Advanced TypeScript',
      timestamp: '2023-03-10T09:45:00Z',
      xpEarned: 30
    },
    {
      id: 'activity-4',
      type: 'achievement',
      description: 'Earned badge: Skill Builder',
      timestamp: '2023-03-05T09:45:00Z',
      xpEarned: 75
    },
    {
      id: 'activity-5',
      type: 'interview',
      description: 'Completed mock interview for Software Engineer position',
      timestamp: '2023-03-02T11:30:00Z',
      xpEarned: 40
    }
  ]
};

// ATS analysis mock data
const atsAnalysis = {
  overall_score: 75,
  matched_keywords: ["react", "javascript", "frontend", "ui", "css"],
  missing_keywords: ["typescript", "graphql", "aws", "testing"],
  sections: {
    summary: {
      score: 7,
      feedback: "Good summary highlighting your experience"
    },
    experience: {
      score: 8,
      feedback: "Strong experience section with relevant roles"
    },
    education: {
      score: 6,
      feedback: "Education section meets requirements"
    },
    skills: {
      score: 7,
      feedback: "Good skills match, add more relevant technologies"
    }
  },
  strengths: [
    "Strong emphasis on frontend development skills",
    "Clear demonstration of project experience",
    "Well-structured resume format"
  ],
  weaknesses: [
    "Missing some key technologies mentioned in job description",
    "Limited quantification of achievements"
  ],
  suggestions: [
    {
      title: "Add missing keywords",
      description: "Include TypeScript, GraphQL and AWS in your skills section",
      type: "keywords"
    },
    {
      title: "Quantify your achievements",
      description: "Add metrics and specific outcomes to your work experiences",
      type: "section"
    },
    {
      title: "Enhance your summary",
      description: "Tailor your summary to better match this specific role",
      type: "section"
    }
  ],
  ai_suggestions: [
    {
      title: "Add testing experience",
      description: "Include your experience with Jest, React Testing Library or other testing frameworks the job requires"
    },
    {
      title: "Highlight collaborative work",
      description: "Emphasize your experience working in agile teams and your collaboration skills"
    },
    {
      title: "Show problem-solving skills",
      description: "Add specific examples of how you've solved complex front-end challenges"
    }
  ]
};

// ATS analysis with visuals mock data
const atsAnalysisWithVisuals = {
  ...atsAnalysis,
  visualizations: {
    keyword_cloud: {
      type: "wordCloud",
      data: [
        { text: "React", value: 25 },
        { text: "JavaScript", value: 20 },
        { text: "CSS", value: 15 },
        { text: "HTML", value: 15 },
        { text: "UI/UX", value: 10 },
        { text: "Frontend", value: 18 },
        { text: "Responsive", value: 8 }
      ]
    },
    score_breakdown: {
      type: "radar",
      data: {
        labels: ["Keywords", "Experience", "Education", "Skills", "Format"],
        datasets: [
          {
            label: "Your Resume",
            data: [75, 80, 60, 70, 85]
          },
          {
            label: "Target Score",
            data: [90, 80, 70, 90, 85]
          }
        ]
      }
    }
  }
};

// ATS history mock data
const atsHistory = [
  {
    id: 1,
    job_title: "Senior Frontend Developer",
    score: 75,
    assessment: "Good match with some improvements needed",
    created_at: "2023-05-15T10:30:00Z",
    resume_filename: "tech_resume_2023.pdf"
  },
  {
    id: 2,
    job_title: "React Developer",
    score: 82,
    assessment: "Strong match with the job requirements",
    created_at: "2023-04-20T14:15:00Z",
    resume_filename: "tech_resume_2023.pdf"
  },
  {
    id: 3,
    job_title: "UI/UX Developer",
    score: 68,
    assessment: "Moderate match, missing key design skills",
    created_at: "2023-03-10T09:45:00Z",
    resume_filename: "design_resume_2023.pdf"
  }
];

// Resume parsing result mock
const resumeParseResult = {
  name: "Zayed Al Nahyan",
  email: "zayed@tamkeen.ai",
  phone: "+971 50 123 4567",
  location: "Dubai, UAE",
  summary: "Experienced frontend developer with expertise in React, JavaScript, and modern web technologies.",
  skills: ["React", "JavaScript", "TypeScript", "Node.js", "HTML/CSS", "UI/UX", "Responsive Design"],
  experience: [
    {
      title: "Senior Frontend Developer",
      company: "TechCorp UAE",
      location: "Dubai, UAE",
      startDate: "2021-06",
      endDate: "Present",
      description: "Leading frontend development team and architecting React applications for enterprise clients."
    },
    {
      title: "Frontend Developer",
      company: "Digital Solutions LLC",
      location: "Abu Dhabi, UAE",
      startDate: "2019-03",
      endDate: "2021-05",
      description: "Developed responsive web applications using React and Redux for government and private sector clients."
    }
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "UAE University",
      location: "Al Ain, UAE",
      graduationDate: "2019-05"
    }
  ]
};

// Resume versions mock data
const resumeVersions = [
  {
    id: "v1",
    name: "Initial Version",
    date: "2023-01-20T10:15:00Z"
  },
  {
    id: "v2",
    name: "Updated Skills",
    date: "2023-02-15T14:30:00Z"
  },
  {
    id: "v3",
    name: "After ATS Optimization",
    date: "2023-03-10T09:20:00Z"
  }
];

// User resume versions mock data
const userResumes = [
  {
    id: "resume-1",
    userId: "user-1",
    name: "Tech Resume 2023",
    createdAt: "2023-01-20T10:15:00Z",
    updatedAt: "2023-03-10T14:30:00Z",
    preview: "https://via.placeholder.com/250x350?text=Resume+Preview",
    versions: resumeVersions
  },
  {
    id: "resume-2",
    userId: "user-1",
    name: "Design Resume 2023",
    createdAt: "2023-02-05T09:20:00Z",
    updatedAt: "2023-02-05T09:20:00Z",
    preview: "https://via.placeholder.com/250x350?text=Design+Resume",
    versions: resumeVersions.slice(0, 1)
  }
];

// Export individual mock data
export {
  jobApplicationsMock,
  getJobApplicationsByUserId,
  getJobApplicationById,
  getJobApplicationsByStatus,
  mockJobs,
  mockJobCategories,
  mockIndustries,
  mockSkills,
  mockUsers,
  mockResumes,
  mockCompanies,
  mockAnalytics,
  atsAnalysis,
  atsAnalysisWithVisuals,
  atsHistory,
  resumeParseResult,
  userResumes,
  resumeVersions
};

// Export all mock data as a single object
const mockData = {
  applications: jobApplicationsMock,
  jobs: mockJobs,
  jobCategories: mockJobCategories,
  industries: mockIndustries,
  skills: mockSkills,
  users: mockUsers,
  resumes: mockResumes,
  companies: mockCompanies,
  analytics: mockAnalytics,
  atsAnalysis,
  atsAnalysisWithVisuals,
  atsHistory,
  resumeParseResult,
  userResumes,
  resumeVersions,
  // Helper functions
  getJobApplicationsByUserId,
  getJobApplicationById,
  getJobApplicationsByStatus,
  // Career progression & gamification
  gamification: mockGamification,
};

export default mockData; 