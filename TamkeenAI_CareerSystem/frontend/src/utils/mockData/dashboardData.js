/**
 * Mock data for the Dashboard component
 * This data simulates API responses for development and testing
 */

const mockDashboardData = {
  // User progress data
  userProgress: {
    level: 3,
    xp: 750,
    nextLevelXp: 1000,
    rank: "Career Explorer",
    completedTasks: 24,
    totalTasks: 36,
    skills: {
      main: [
        { name: "JavaScript", level: 75 },
        { name: "React", level: 68 },
        { name: "Node.js", level: 55 }
      ],
      secondary: [
        { name: "UI/UX Design", level: 45 },
        { name: "Project Management", level: 62 }
      ]
    },
    badges: [
      { id: 1, name: "First Resume", icon: "description", earned: true },
      { id: 2, name: "Interview Ready", icon: "record_voice_over", earned: true },
      { id: 3, name: "Network Builder", icon: "people", earned: false }
    ]
  },
  
  // Resume scores
  resumeScores: {
    scores: [
      { category: "Formatting", score: 85 },
      { category: "Content", score: 78 },
      { category: "Keywords", score: 92 },
      { category: "Impact", score: 68 },
      { category: "Overall", score: 82 }
    ],
    history: [
      { date: "2023-01-15", score: 65 },
      { date: "2023-02-10", score: 72 },
      { date: "2023-03-05", score: 78 },
      { date: "2023-04-20", score: 82 }
    ]
  },
  
  // Career journey
  careerJourney: [
    { id: 1, date: "2021-06", title: "Graduated", status: "completed" },
    { id: 2, date: "2021-08", title: "First Job", status: "completed" },
    { id: 3, date: "2022-05", title: "Promotion", status: "completed" },
    { id: 4, date: "2023-01", title: "New Skills", status: "in_progress" },
    { id: 5, date: "2023-06", title: "Career Change", status: "planned" }
  ],
  
  // AI recommendations
  recommendations: [
    {
      id: 1,
      type: "job",
      title: "Frontend Developer Position at TechCorp",
      description: "This position matches 85% of your skills and experience.",
      priority: "high"
    },
    {
      id: 2,
      type: "skill",
      title: "Learn TypeScript",
      description: "Adding TypeScript to your skillset could increase your job matches by 20%.",
      priority: "medium"
    },
    {
      id: 3,
      type: "resume",
      title: "Update Resume Skills Section",
      description: "Your resume skills section needs updating with your latest projects.",
      priority: "low"
    }
  ],
  
  // Badges/achievements
  badges: [
    { id: 1, name: "Resume Master", status: "earned", date: "2023-02-10", icon: "description" },
    { id: 2, name: "Interview Ace", status: "earned", date: "2023-03-15", icon: "record_voice_over" },
    { id: 3, name: "Networking Star", status: "progress", progress: 70, icon: "people" },
    { id: 4, name: "Skill Developer", status: "progress", progress: 45, icon: "trending_up" },
    { id: 5, name: "Job Seeker Pro", status: "locked", icon: "work" }
  ],
  
  // Market insights
  marketInsights: {
    salary_data: {
      average: 85000,
      range: { min: 70000, max: 110000 }
    },
    job_demand: "high",
    competition_level: "medium",
    growth_rate: 12,
    top_skills: [
      { name: "JavaScript", demand: "high" },
      { name: "React", demand: "high" },
      { name: "Node.js", demand: "medium" },
      { name: "TypeScript", demand: "high" },
      { name: "UI/UX", demand: "medium" }
    ]
  },
  
  // Job opportunities
  opportunities: {
    saved: [
      { id: 1, title: "Frontend Developer", company: "TechCorp", status: "Applied" },
      { id: 2, title: "React Developer", company: "WebSolutions", status: "Saved" }
    ],
    recommended: [
      { id: 3, title: "UI Developer", company: "DesignHub", matchRate: 92 },
      { id: 4, title: "JavaScript Engineer", company: "CodeWorks", matchRate: 88 },
      { id: 5, title: "Full Stack Developer", company: "InnovateTech", matchRate: 76 }
    ]
  },
  
  // Application stats
  applications: {
    total: 12,
    active: 5,
    interviews: 3,
    offers: 1,
    rejected: 3
  },
  
  // Activity log
  activities: [
    { id: 1, type: "resume", action: "updated", date: "2023-04-28T14:22:10Z", details: "Updated skills section" },
    { id: 2, type: "job", action: "applied", date: "2023-04-25T09:15:45Z", details: "Applied to Frontend Developer at TechCorp" },
    { id: 3, type: "skill", action: "completed", date: "2023-04-20T16:30:00Z", details: "Completed React Advanced course" },
    { id: 4, type: "interview", action: "scheduled", date: "2023-04-18T11:45:22Z", details: "Interview scheduled with WebSolutions" }
  ],
  
  // Learning paths
  learningPaths: [
    {
      id: 1,
      title: "Frontend Master Path",
      progress: 65,
      courses: [
        { id: 101, title: "Advanced React", completed: true, isToday: false },
        { id: 102, title: "Redux State Management", completed: true, isToday: false },
        { id: 103, title: "React Performance Optimization", completed: false, isToday: true },
        { id: 104, title: "Advanced TypeScript", completed: false, isToday: false }
      ]
    },
    {
      id: 2,
      title: "UX Design Fundamentals",
      progress: 30,
      courses: [
        { id: 201, title: "UI Design Principles", completed: true, isToday: false },
        { id: 202, title: "User Research Methods", completed: false, isToday: false },
        { id: 203, title: "Wireframing and Prototyping", completed: false, isToday: false }
      ]
    }
  ],
  
  // Schedule data
  todaysSchedule: [
    { id: 1, time: "09:30", title: "Interview Prep", type: "practice" },
    { id: 2, time: "11:00", title: "React Course", type: "learning" },
    { id: 3, time: "14:00", title: "Phone Interview with TechCorp", type: "interview" }
  ],
  
  // Weekly goals
  weeklyGoals: [
    { id: 1, title: "Apply to 5 jobs", completed: 3, total: 5 },
    { id: 2, title: "Complete React course", completed: 4, total: 5 },
    { id: 3, title: "Update LinkedIn profile", completed: 1, total: 1 }
  ],
  
  // Last updated timestamp
  last_updated: new Date().toISOString()
};

export default mockDashboardData;

 