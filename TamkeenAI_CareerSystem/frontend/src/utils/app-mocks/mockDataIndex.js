/**
 * Mock data to simulate API responses during development
 */

export const mockDashboardData = {
  userProgress: {
    careerLevel: "Senior Developer",
    levelProgress: 75,
    nextMilestone: "Team Lead",
    achievementsEarned: 42,
    totalSkills: 87,
    masteredSkills: 52
  },
  resumeScore: {
    currentScore: 78,
    previousScore: 65,
    industryAverage: 70,
    sections: [
      { name: "Professional Summary", score: 85 },
      { name: "Work Experience", score: 90 },
      { name: "Skills", score: 75 },
      { name: "Education", score: 95 },
      { name: "Projects", score: 65 }
    ],
    history: [
      { date: "2023-01-15", score: 60 },
      { date: "2023-02-15", score: 65 },
      { date: "2023-03-15", score: 68 },
      { date: "2023-04-15", score: 72 },
      { date: "2023-05-15", score: 78 }
    ]
  },
  skillGap: {
    currentRole: "Senior Frontend Developer",
    targetRole: "Frontend Team Lead",
    skills: [
      { name: "React", current: 90, required: 85 },
      { name: "TypeScript", current: 80, required: 85 },
      { name: "System Design", current: 65, required: 85 },
      { name: "Team Management", current: 60, required: 80 },
      { name: "Code Reviews", current: 75, required: 90 },
      { name: "Testing", current: 70, required: 75 }
    ]
  },
  aiRecommendation: [
    {
      type: "skill",
      title: "Improve System Design Skills",
      description: "Your system design skills need improvement for your target role.",
      action: "Take our advanced system design course",
      priority: "high"
    },
    {
      type: "resume",
      title: "Highlight Leadership Experience",
      description: "Team Lead roles require more emphasis on leadership.",
      action: "Update your resume's work experience section",
      priority: "medium"
    },
    {
      type: "networking",
      title: "Connect with Team Leads",
      description: "Build your network with people in your target role.",
      action: "Attend our upcoming networking event",
      priority: "medium"
    }
  ],
  careerJourney: {
    milestones: [
      {
        title: "Junior Developer",
        date: "2018-06",
        description: "Started career as a Junior Developer at XYZ Corp",
        achievements: ["Learned React basics", "Built first production feature"]
      },
      {
        title: "Mid-level Developer",
        date: "2020-03",
        description: "Promoted to Mid-level Developer",
        achievements: ["Led small feature team", "Implemented CI/CD pipeline"]
      },
      {
        title: "Senior Developer",
        date: "2022-01",
        description: "Promoted to Senior Developer",
        achievements: ["Architecture design", "Mentored junior developers"]
      }
    ],
    nextMilestones: [
      {
        title: "Team Lead",
        estimatedDate: "2024-01",
        requirements: ["Team management experience", "Advanced system design", "Project planning"],
        readiness: 68
      }
    ]
  },
  jobRecommendations: [
    {
      id: "job1",
      title: "Frontend Team Lead",
      company: "ABC Tech",
      location: "Dubai, UAE",
      salary: "AED 25,000 - 30,000",
      matchScore: 85,
      postedDate: "2023-05-10"
    },
    {
      id: "job2",
      title: "Senior React Developer",
      company: "Global Systems",
      location: "Abu Dhabi, UAE",
      salary: "AED 22,000 - 28,000",
      matchScore: 92,
      postedDate: "2023-05-12"
    },
    {
      id: "job3",
      title: "Frontend Architect",
      company: "Future Technologies",
      location: "Dubai, UAE",
      salary: "AED 28,000 - 35,000",
      matchScore: 78,
      postedDate: "2023-05-08"
    }
  ],
  learningPaths: [
    {
      id: "path1",
      title: "Team Leadership Mastery",
      description: "Essential skills for technical team leads",
      duration: "8 weeks",
      progress: 25,
      skills: ["Team Management", "Project Planning", "Performance Reviews"]
    },
    {
      id: "path2",
      title: "Advanced System Design",
      description: "Learn to design scalable systems",
      duration: "6 weeks",
      progress: 10,
      skills: ["System Architecture", "Scalability", "Performance Optimization"]
    }
  ],
  insights: {
    marketTrends: [
      {
        skill: "React",
        demand: "High",
        growth: 15,
        averageSalary: "AED 20,000"
      },
      {
        skill: "TypeScript",
        demand: "High",
        growth: 28,
        averageSalary: "AED 22,000"
      },
      {
        skill: "Next.js",
        demand: "Growing",
        growth: 45,
        averageSalary: "AED 23,000"
      }
    ],
    careerInsights: [
      {
        role: "Frontend Team Lead",
        openings: 24,
        competition: "Medium",
        growthRate: 18
      },
      {
        role: "Frontend Architect",
        openings: 15,
        competition: "High",
        growthRate: 12
      }
    ]
  },
  careerProgress: {
    level: 8,
    title: "Senior Developer",
    xp: 7850,
    nextLevelXp: 10000,
    badges: [
      {
        name: "React Master",
        icon: "react",
        dateEarned: "2023-01-15",
        description: "Achieved mastery in React development"
      },
      {
        name: "Git Guru",
        icon: "git",
        dateEarned: "2022-11-10",
        description: "Demonstrated advanced Git skills"
      },
      {
        name: "Mentor",
        icon: "mentor",
        dateEarned: "2023-03-22",
        description: "Mentored 5 junior developers"
      }
    ],
    achievements: [
      {
        name: "Project Lead",
        points: 500,
        dateEarned: "2023-02-10",
        description: "Successfully led a project team"
      },
      {
        name: "Problem Solver",
        points: 350,
        dateEarned: "2023-04-05",
        description: "Resolved 50 critical bugs"
      }
    ]
  },
  recentActivities: [
    {
      type: "Resume Update",
      description: "Updated your resume skills section",
      timestamp: "2023-05-15T14:30:00",
      impact: "+5 resume score"
    },
    {
      type: "Course Completion",
      description: "Completed 'Advanced TypeScript' course",
      timestamp: "2023-05-14T10:15:00",
      impact: "+1 Skill, +100 XP"
    },
    {
      type: "Job Application",
      description: "Applied to 'Senior Frontend Developer' at XYZ Corp",
      timestamp: "2023-05-12T09:45:00",
      impact: "+1 Application"
    },
    {
      type: "Assessment",
      description: "Completed the React proficiency assessment",
      timestamp: "2023-05-10T16:20:00",
      impact: "+200 XP, 'React Master' badge"
    }
  ],
  careerPrediction: {
    currentRole: "Senior Developer",
    potentialPaths: [
      {
        title: "Team Lead",
        probability: 0.85,
        timeframe: "1-2 years",
        keyRequirements: ["Team Management", "Project Planning", "Technical Leadership"]
      },
      {
        title: "Frontend Architect",
        probability: 0.65,
        timeframe: "2-3 years",
        keyRequirements: ["System Design", "Performance Optimization", "Cross-platform Expertise"]
      },
      {
        title: "Engineering Manager",
        probability: 0.40,
        timeframe: "3-5 years",
        keyRequirements: ["People Management", "Process Improvement", "Strategic Planning"]
      }
    ],
    recommendations: [
      "Focus on team leadership opportunities",
      "Take on more system design responsibilities",
      "Develop mentorship experience"
    ]
  },
  leaderboardPosition: {
    rank: 12,
    totalUsers: 156,
    percentile: 92,
    category: "Frontend Development",
    topUsers: [
      {
        name: "Ahmed K.",
        points: 9850,
        badges: 48,
        level: 12
      },
      {
        name: "Fatima S.",
        points: 9650,
        badges: 45,
        level: 11
      },
      {
        name: "Mohammed A.",
        points: 9400,
        badges: 42,
        level: 11
      }
    ]
  }
}; 