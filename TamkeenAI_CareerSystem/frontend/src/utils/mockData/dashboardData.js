/**
 * Mock data for the Dashboard component
 * This data simulates API responses for development and testing
 */

const mockDashboardData = {
  // User progress data
  progress: {
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
  
  // Resume score data
  resumeScore: {
    scores: [
      { version: 1, score: 65, date: "2023-01-15" },
      { version: 2, score: 72, date: "2023-02-10" },
      { version: 3, score: 78, date: "2023-03-05" },
      { version: 4, score: 82, date: "2023-04-20" }
    ],
    average_improvement: 5.6,
    latest_score: 82,
    total_versions: 4,
    keywordMatches: [
      { text: "JavaScript", matchScore: 9 },
      { text: "React", matchScore: 8 },
      { text: "Frontend", matchScore: 7 },
      { text: "UI/UX", matchScore: 6 },
      { text: "Responsive", matchScore: 8 },
      { text: "Development", matchScore: 7 },
      { text: "Components", matchScore: 5 },
      { text: "Web", matchScore: 6 }
    ],
    missingKeywords: [
      { text: "TypeScript", importance: "High", suggestedSection: "Skills" },
      { text: "Redux", importance: "Medium", suggestedSection: "Experience" },
      { text: "Testing", importance: "Medium", suggestedSection: "Skills" }
    ]
  },
  
  // Career journey timeline
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
  
  // Skill gap analysis
  skillGap: [
    { skill: "JavaScript", current: 75, required: 80, gap: 5 },
    { skill: "React", current: 68, required: 75, gap: 7 },
    { skill: "TypeScript", current: 40, required: 70, gap: 30 },
    { skill: "Node.js", current: 55, required: 60, gap: 5 },
    { skill: "UI/UX Design", current: 45, required: 50, gap: 5 }
  ],
  
  // Career predictions
  careerPredictions: [
    { 
      role: "Senior Frontend Developer", 
      match: 92, 
      timeline: "1-2 years",
      skills: ["JavaScript", "React", "TypeScript", "Redux", "Testing"],
      companies: ["TechCorp", "WebSolutions", "DigitalWave"] 
    },
    { 
      role: "UI/UX Developer", 
      match: 85, 
      timeline: "1-3 years",
      skills: ["UI Design", "React", "User Research", "Prototyping"],
      companies: ["DesignHub", "Creative Solutions", "UXStudio"] 
    },
    { 
      role: "Full Stack Developer", 
      match: 78, 
      timeline: "2-3 years",
      skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
      companies: ["InnovateTech", "FullStack Inc", "DevShop"] 
    }
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
  
  // Leaderboard data
  leaderboard: {
    user_position: 4,
    total_users: 156,
    top_percentile: 15,
    points: 1250,
    next_milestone: 1500,
    rank_history: [12, 9, 8, 6, 5, 4], // Historical rank data for sparkline
    leaderboard: [
      { id: 1, name: "Zayed Al Nahyan", avatar: "https://randomuser.me/api/portraits/men/32.jpg", points: 2450 },
      { id: 2, name: "Maryam Al Maktoum", avatar: "https://randomuser.me/api/portraits/women/44.jpg", points: 2120 },
      { id: 3, name: "Rashid Al Falasi", avatar: "https://randomuser.me/api/portraits/men/22.jpg", points: 1890 },
      { id: 4, name: "Current User", avatar: null, points: 1250, isCurrentUser: true },
      { id: 5, name: "Hind Al Qasimi", avatar: "https://randomuser.me/api/portraits/women/67.jpg", points: 1180 }
    ],
    friends: [
      { id: 101, name: "Mohammed Al Shamsi", avatar: "https://randomuser.me/api/portraits/men/42.jpg", points: 1650, isFriend: true },
      { id: 4, name: "Current User", avatar: null, points: 1250, isCurrentUser: true },
      { id: 102, name: "Fatma Al Mazrouei", avatar: "https://randomuser.me/api/portraits/women/33.jpg", points: 1100, isFriend: true },
      { id: 103, name: "Ahmed Al Dhaheri", avatar: "https://randomuser.me/api/portraits/men/15.jpg", points: 980, isFriend: true },
      { id: 104, name: "Noura Al Kaabi", avatar: "https://randomuser.me/api/portraits/women/57.jpg", points: 850, isFriend: true }
    ]
  },
  
  // Learning paths
  learningPaths: [
    {
      id: 1,
      title: "Frontend Master Path",
      progress: 65,
      completed: true,
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
      completed: false,
      courses: [
        { id: 201, title: "UI Design Principles", completed: true, isToday: false },
        { id: 202, title: "User Research Methods", completed: false, isToday: false },
        { id: 203, title: "Wireframing and Prototyping", completed: false, isToday: false }
      ]
    }
  ],
  
  // Opportunity alerts
  opportunityAlerts: [
    {
      id: 1,
      type: "job",
      title: "Frontend Developer at TechCorp",
      deadline: "2023-05-15",
      priority: "high",
      location: "Dubai, UAE",
      description: "Exciting opportunity matching 85% of your profile"
    },
    {
      id: 2,
      type: "event",
      title: "Tech Career Fair",
      deadline: "2023-05-20",
      priority: "medium",
      location: "Abu Dhabi Convention Center",
      description: "Network with top employers in UAE tech industry"
    },
    {
      id: 3,
      type: "learning",
      title: "TypeScript Certification",
      deadline: "2023-06-01",
      priority: "medium",
      location: "Online",
      description: "Boost your resume with this in-demand skill"
    }
  ],
  
  // Recent activities
  recentActivities: [
    { id: 1, type: "resume", action: "updated", date: "2023-04-28T14:22:10Z", details: "Updated skills section" },
    { id: 2, type: "job", action: "applied", date: "2023-04-25T09:15:45Z", details: "Applied to Frontend Developer at TechCorp" },
    { id: 3, type: "skill", action: "completed", date: "2023-04-20T16:30:00Z", details: "Completed React Advanced course" },
    { id: 4, type: "interview", action: "scheduled", date: "2023-04-18T11:45:22Z", details: "Interview scheduled with WebSolutions" }
  ],
  
  // Learning roadmap
  learningRoadmap: {
    current_focus: "Frontend Development",
    progress: 65,
    milestones: [
      { id: 1, title: "HTML/CSS Mastery", completed: true, skills: ["HTML5", "CSS3", "Responsive Design"] },
      { id: 2, title: "JavaScript Fundamentals", completed: true, skills: ["Core JS", "ES6+", "DOM Manipulation"] },
      { id: 3, title: "React Development", completed: true, skills: ["Components", "State", "Props", "Hooks"] },
      { id: 4, title: "Advanced Frontend", in_progress: true, skills: ["TypeScript", "Redux", "Testing", "Performance"] },
      { id: 5, title: "Full Stack Skills", locked: true, skills: ["Node.js", "Express", "Databases", "API Design"] }
    ],
    recommended_resources: [
      { id: 101, title: "TypeScript Handbook", type: "documentation", url: "#" },
      { id: 102, title: "React Testing Course", type: "course", url: "#" },
      { id: 103, title: "Performance Optimization Blog", type: "article", url: "#" }
    ]
  },
  
  // Last updated timestamp
  last_updated: new Date().toISOString()
};

export default mockDashboardData;

 