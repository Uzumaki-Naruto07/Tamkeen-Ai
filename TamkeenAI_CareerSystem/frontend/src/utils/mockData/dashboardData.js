/**
 * Mock data for the Dashboard component
 * This data simulates API responses for development and testing
 */

const mockDashboardData = {
  // User progress data
  userProgress: {
    overall_completion: 65,
    progress_items: [
      { name: "Resume Builder", type: "resume", progress: 80 },
      { name: "Interview Preparation", type: "interview", progress: 45 },
      { name: "Job Applications", type: "application", progress: 70 },
      { name: "Networking", type: "networking", progress: 30 }
    ],
    next_steps: [
      { 
        name: "Complete your profile", 
        type: "resume", 
        description: "Add your work experience and skills", 
        link: "/profile" 
      },
      { 
        name: "Practice interview questions", 
        type: "interview", 
        description: "Try our AI mock interview", 
        link: "/mock-interview" 
      },
      { 
        name: "Update your resume", 
        type: "resume", 
        description: "Optimize your resume for ATS scanning", 
        link: "/resume-builder" 
      },
      { 
        name: "Apply to matching jobs", 
        type: "application", 
        description: "3 new job matches available", 
        link: "/jobs" 
      }
    ]
  },

  // Resume score data
  resumeScore: {
    score: 78,
    history: [
      { date: "2023-10-01", score: 65 },
      { date: "2023-10-15", score: 68 },
      { date: "2023-11-01", score: 72 },
      { date: "2023-11-15", score: 74 },
      { date: "2023-12-01", score: 78 }
    ],
    improvement_areas: [
      { name: "Keywords", score: 60, recommendation: "Add more industry-specific keywords" },
      { name: "Experience", score: 85, recommendation: "Make achievements more quantifiable" },
      { name: "Skills", score: 90, recommendation: "Your skills section is well-optimized" },
      { name: "Format", score: 75, recommendation: "Improve readability with better formatting" }
    ]
  },

  // Skill gap analysis
  skillGap: {
    current_skills: [
      { name: "JavaScript", level: 85, demand: "high" },
      { name: "React", level: 80, demand: "high" },
      { name: "Node.js", level: 65, demand: "high" },
      { name: "Python", level: 60, demand: "high" },
      { name: "Docker", level: 40, demand: "high" }
    ],
    recommended_skills: [
      { name: "TypeScript", reason: "Complements your JavaScript skills", priority: "high" },
      { name: "AWS", reason: "High demand in your target roles", priority: "medium" },
      { name: "Kubernetes", reason: "Builds on your Docker knowledge", priority: "medium" },
      { name: "GraphQL", reason: "Trending in web development", priority: "low" }
    ],
    gap_score: 68
  },

  // AI recommendations
  aiRecommendation: {
    type: "job",
    title: "Senior Frontend Developer",
    provider: "TechCorp Inc.",
    description: "A role focusing on React-based applications with an emphasis on performance optimization and accessibility.",
    match_percentage: 87,
    time_commitment: "Full-time",
    relevance_factors: ["skills", "experience", "career goals"],
    resources: [
      { type: "article", title: "Optimizing React Performance", provider: "Medium", url: "https://example.com/article" },
      { type: "course", title: "Advanced React Patterns", provider: "Coursera", url: "https://example.com/course" },
      { type: "youtube", title: "React Best Practices 2023", provider: "YouTube", url: "https://example.com/video" }
    ],
    url: "https://example.com/job-details",
    aiExplanation: "This job aligns well with your current skills in React and JavaScript. Your experience with performance optimization also makes you a strong candidate. The company culture emphasizes work-life balance, which matches your preferences."
  },

  // Career journey timeline
  careerJourney: {
    milestones: [
      { date: "2023-09-15", event: "Joined TamkeenAI", type: "platform", description: "Started your career journey with us" },
      { date: "2023-10-05", event: "Resume Optimized", type: "resume", description: "Improved resume score by 20%" },
      { date: "2023-10-20", event: "First Job Application", type: "application", description: "Applied to Software Developer role" },
      { date: "2023-11-10", event: "Mock Interview", type: "interview", description: "Completed first mock interview" },
      { date: "2023-12-02", event: "Interview Invitation", type: "interview", description: "Received interview invitation from TechCorp" }
    ],
    upcoming_events: [
      { date: "2023-12-15", event: "Technical Interview", type: "interview", description: "TechCorp - 2:00 PM" }
    ]
  },

  // Application statistics
  applications: {
    total: 12,
    active: 5,
    interviews: 2,
    offers: 1,
    rejected: 4
  },

  // Upcoming interviews
  upcomingInterviews: [
    { company: "TechCorp Inc.", position: "Senior Frontend Developer", date: "2023-12-15T14:00:00", type: "Technical" },
    { company: "InnovateSoft", position: "Full Stack Developer", date: "2023-12-18T10:30:00", type: "Initial" },
    { company: "DataViz Systems", position: "UI Developer", date: "2023-12-22T15:00:00", type: "Remote" }
  ],

  // Today's schedule
  todaysSchedule: [
    { title: "Resume Review Session", type: "Learning", startTime: "2023-12-10T10:00:00", endTime: "2023-12-10T11:00:00" },
    { title: "Networking Event - Tech Meetup", type: "Networking", startTime: "2023-12-10T14:00:00", endTime: "2023-12-10T16:00:00" },
    { title: "Job Application Deadline - InnovateSoft", type: "Deadline", startTime: "2023-12-10T23:59:00", endTime: "2023-12-10T23:59:00" }
  ],

  // Weekly goals
  weeklyGoals: [
    { id: 1, title: "Apply to 3 jobs", completed: true, dueDate: "2023-12-08" },
    { id: 2, title: "Update LinkedIn profile", completed: false, dueDate: "2023-12-12" },
    { id: 3, title: "Complete React assessment", completed: false, dueDate: "2023-12-15" },
    { id: 4, title: "Attend networking event", completed: false, dueDate: "2023-12-10" }
  ],

  // Job recommendations
  jobRecommendations: [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      companyLogo: "",
      location: "San Francisco, CA",
      jobType: "Full-time",
      datePosted: "2023-12-01",
      matchPercentage: 87
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "InnovateSoft",
      companyLogo: "",
      location: "Remote",
      jobType: "Full-time",
      datePosted: "2023-12-03",
      matchPercentage: 82
    },
    {
      id: 3,
      title: "UI Developer",
      company: "DataViz Systems",
      companyLogo: "",
      location: "New York, NY",
      jobType: "Contract",
      datePosted: "2023-12-05",
      matchPercentage: 75
    }
  ],

  // Recent activities
  recentActivities: [
    { type: "application", description: "Applied to Senior Frontend Developer at TechCorp Inc.", timestamp: "2023-12-09T14:30:00" },
    { type: "resume", description: "Updated resume with new project experience", timestamp: "2023-12-08T10:15:00" },
    { type: "interview", description: "Completed mock interview for JavaScript", timestamp: "2023-12-07T16:00:00" },
    { type: "achievement", description: "Earned 'Resume Master' badge", timestamp: "2023-12-05T09:45:00" },
    { type: "learning", description: "Completed React Best Practices course", timestamp: "2023-12-04T19:20:00" }
  ],

  // Career progress
  careerProgress: {
    level: 5,
    xp: 1250,
    nextLevelXp: 1500,
    recentAchievements: [
      { title: "Resume Master", xpGained: 50, date: "2023-12-05T09:45:00" },
      { title: "Course Completer", xpGained: 75, date: "2023-12-04T19:20:00" },
      { title: "Job Hunter", xpGained: 30, date: "2023-12-02T11:10:00" }
    ]
  },

  // Career insights
  insights: [
    { title: "Your React skills are in high demand", description: "85% of jobs in your field require React experience." },
    { title: "Consider adding TypeScript", description: "TypeScript appears in 65% of jobs matching your profile." },
    { title: "Interview performance improving", description: "Your mock interview scores increased by 20% in the last month." }
  ],

  // Skills data
  skills: {
    top: [
      { name: "JavaScript", verified: true },
      { name: "React", verified: true },
      { name: "HTML/CSS", verified: true },
      { name: "Node.js", verified: false },
      { name: "Python", verified: false }
    ],
    inDemand: [
      { name: "TypeScript" },
      { name: "AWS" },
      { name: "Docker" }
    ]
  }
};

export default mockDashboardData;

 