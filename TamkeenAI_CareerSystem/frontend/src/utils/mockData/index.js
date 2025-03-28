// User data
export const mockUser = {
  id: 1,
  name: 'Ahmed Al Mansoori',
  email: 'ahmed@example.com',
  phone: '+971501234567',
  avatar: 'https://via.placeholder.com/150',
  level: 5,
  xp: 750,
  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
  experience: 3,
  education: [
    {
      id: 1,
      institution: 'UAE University',
      degree: 'Bachelor of Computer Science',
      year: 2020,
    },
  ],
  preferences: {
    language: 'en',
    theme: 'light',
    notifications: true,
  },
};

// Jobs data
export const mockJobs = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'Tech Solutions UAE',
    location: 'Dubai, UAE',
    type: 'Full-time',
    description: 'We are looking for an experienced Frontend Developer...',
    requirements: ['React', 'TypeScript', '5+ years experience'],
    salary: '15,000 - 20,000 AED',
    postedAt: '2024-03-15',
    deadline: '2024-04-15',
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
    matchScore: 85,
  },
  {
    id: 2,
    title: 'Backend Developer',
    company: 'Innovation Labs',
    location: 'Abu Dhabi, UAE',
    type: 'Full-time',
    description: 'Join our team as a Backend Developer...',
    requirements: ['Node.js', 'Python', '3+ years experience'],
    salary: '12,000 - 18,000 AED',
    postedAt: '2024-03-14',
    deadline: '2024-04-14',
    skills: ['Node.js', 'Python', 'SQL', 'AWS'],
    matchScore: 75,
  },
];

// AI Coach data
export const mockAICoach = {
  chatHistory: [
    {
      id: 1,
      role: 'user',
      content: 'What skills should I focus on for a frontend developer role?',
      timestamp: '2024-03-15T10:30:00Z',
    },
    {
      id: 2,
      role: 'assistant',
      content: 'For a frontend developer role, I recommend focusing on...',
      timestamp: '2024-03-15T10:31:00Z',
    },
  ],
  recommendations: [
    {
      id: 1,
      type: 'skill',
      title: 'Learn TypeScript',
      description: 'TypeScript is becoming increasingly important...',
      priority: 'high',
      progress: 60,
    },
    {
      id: 2,
      type: 'course',
      title: 'Advanced React Patterns',
      description: 'Take this course to improve your React skills...',
      priority: 'medium',
      progress: 0,
    },
  ],
};

// Resume data
export const mockResumes = [
  {
    id: 1,
    title: 'Software Developer Resume',
    template: 'modern',
    content: {
      personalInfo: {
        name: 'Ahmed Al Mansoori',
        email: 'ahmed@example.com',
        phone: '+971501234567',
        location: 'Dubai, UAE',
      },
      summary: 'Experienced software developer with expertise in...',
      experience: [
        {
          company: 'Tech Solutions UAE',
          position: 'Frontend Developer',
          period: '2020 - Present',
          description: 'Led the development of multiple web applications...',
        },
      ],
      education: [
        {
          institution: 'UAE University',
          degree: 'Bachelor of Computer Science',
          year: 2020,
        },
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    },
    atsScore: 85,
    lastUpdated: '2024-03-15',
  },
];

// Skills data
export const mockSkills = {
  assessment: {
    currentSkills: [
      { name: 'JavaScript', level: 85 },
      { name: 'React', level: 80 },
      { name: 'Node.js', level: 75 },
      { name: 'Python', level: 70 },
      { name: 'SQL', level: 65 },
    ],
    targetSkills: [
      { name: 'TypeScript', target: 90 },
      { name: 'Next.js', target: 85 },
      { name: 'AWS', target: 80 },
    ],
  },
  learningPath: [
    {
      id: 1,
      title: 'Frontend Development',
      description: 'Master modern frontend development...',
      courses: [
        {
          id: 1,
          title: 'Advanced React Patterns',
          provider: 'Udemy',
          duration: '8 hours',
          progress: 0,
        },
      ],
    },
  ],
};

// Achievements data
export const mockAchievements = [
  {
    id: 1,
    title: 'First Job Application',
    description: 'Applied for your first job',
    icon: '🎯',
    xp: 100,
    unlocked: true,
    unlockedAt: '2024-03-10',
  },
  {
    id: 2,
    title: 'Skill Master',
    description: 'Reached level 5 in any skill',
    icon: '⭐',
    xp: 500,
    unlocked: true,
    unlockedAt: '2024-03-15',
  },
  {
    id: 3,
    title: 'Perfect Resume',
    description: 'Achieved 90% ATS score',
    icon: '📄',
    xp: 300,
    unlocked: false,
    progress: 85,
  },
];

// Analytics data
export const mockAnalytics = {
  dashboard: {
    totalApplications: 15,
    interviewInvites: 3,
    jobOffers: 1,
    averageMatchScore: 78,
    skillProgress: [
      { skill: 'JavaScript', progress: 85 },
      { skill: 'React', progress: 80 },
      { skill: 'Node.js', progress: 75 },
    ],
  },
  jobMarket: {
    trendingSkills: ['TypeScript', 'Next.js', 'AWS'],
    averageSalary: '15,000 AED',
    jobGrowth: '+12%',
    topCompanies: ['Tech Solutions UAE', 'Innovation Labs', 'Digital Future'],
  },
  skillTrends: {
    inDemand: ['TypeScript', 'Next.js', 'AWS'],
    emerging: ['WebAssembly', 'GraphQL', 'Docker'],
    declining: ['jQuery', 'AngularJS', 'PHP'],
  },
}; 