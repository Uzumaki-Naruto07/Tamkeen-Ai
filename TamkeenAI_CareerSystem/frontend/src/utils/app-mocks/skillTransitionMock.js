/**
 * Mock data for skill transition visualization
 */

export const skillTransitionData = {
  currentSkills: [
    { name: "React", proficiency: 90, demand: "High", relevance: 95 },
    { name: "JavaScript", proficiency: 85, demand: "High", relevance: 90 },
    { name: "CSS", proficiency: 80, demand: "Medium", relevance: 75 },
    { name: "TypeScript", proficiency: 75, demand: "High", relevance: 85 },
    { name: "Redux", proficiency: 70, demand: "Medium", relevance: 80 },
    { name: "HTML", proficiency: 95, demand: "Medium", relevance: 70 },
    { name: "Git", proficiency: 80, demand: "High", relevance: 85 },
    { name: "REST APIs", proficiency: 85, demand: "High", relevance: 90 }
  ],
  
  targetSkills: [
    { name: "React", required: 95, currentProficiency: 90, gap: 5 },
    { name: "TypeScript", required: 90, currentProficiency: 75, gap: 15 },
    { name: "System Design", required: 85, currentProficiency: 60, gap: 25 },
    { name: "Team Management", required: 80, currentProficiency: 50, gap: 30 },
    { name: "Project Planning", required: 75, currentProficiency: 60, gap: 15 },
    { name: "Code Reviews", required: 90, currentProficiency: 70, gap: 20 },
    { name: "Performance Optimization", required: 80, currentProficiency: 65, gap: 15 },
    { name: "Technical Leadership", required: 75, currentProficiency: 55, gap: 20 }
  ],
  
  skillsDevelopment: [
    {
      skill: "Team Management",
      startLevel: 45,
      currentLevel: 50,
      targetLevel: 80,
      milestones: [
        { level: 45, date: "2023-01-15", event: "Started mentoring junior developers" },
        { level: 50, date: "2023-05-20", event: "Led small team on feature development" },
        { level: 60, date: "2023-08-15", event: "Projected: Complete Team Leadership course" },
        { level: 70, date: "2023-11-10", event: "Projected: Lead medium-sized project team" },
        { level: 80, date: "2024-02-20", event: "Projected: Manage full feature team" }
      ]
    },
    {
      skill: "System Design",
      startLevel: 50,
      currentLevel: 60,
      targetLevel: 85,
      milestones: [
        { level: 50, date: "2023-02-10", event: "Designed first component system" },
        { level: 60, date: "2023-05-15", event: "Created architecture for feature module" },
        { level: 70, date: "2023-07-20", event: "Projected: Complete System Design course" },
        { level: 80, date: "2023-10-15", event: "Projected: Design major application feature" },
        { level: 85, date: "2024-01-10", event: "Projected: Lead system architecture design" }
      ]
    },
    {
      skill: "Technical Leadership",
      startLevel: 40,
      currentLevel: 55,
      targetLevel: 75,
      milestones: [
        { level: 40, date: "2023-01-05", event: "Started making architectural decisions" },
        { level: 55, date: "2023-05-10", event: "Led technical discussions in team meetings" },
        { level: 65, date: "2023-08-05", event: "Projected: Lead technical planning for sprint" },
        { level: 70, date: "2023-11-15", event: "Projected: Represent team in tech discussions" },
        { level: 75, date: "2024-02-10", event: "Projected: Make critical tech stack decisions" }
      ]
    }
  ],
  
  transitionPath: {
    currentRole: "Senior Frontend Developer",
    targetRole: "Frontend Team Lead",
    steps: [
      {
        order: 1,
        title: "Skill Enhancement",
        description: "Focus on developing key leadership and architectural skills",
        tasks: [
          { name: "Complete Team Leadership course", status: "in-progress", deadline: "2023-08-15" },
          { name: "Complete System Design course", status: "planned", deadline: "2023-07-20" },
          { name: "Attend technical leadership workshop", status: "planned", deadline: "2023-06-30" }
        ]
      },
      {
        order: 2,
        title: "Experience Building",
        description: "Gain practical experience in leadership roles",
        tasks: [
          { name: "Lead a feature team of 3-5 developers", status: "not-started", deadline: "2023-10-15" },
          { name: "Manage code review process for team", status: "in-progress", deadline: "2023-09-01" },
          { name: "Lead technical planning for 2 sprints", status: "not-started", deadline: "2023-11-15" }
        ]
      },
      {
        order: 3,
        title: "Visibility & Recognition",
        description: "Build reputation as a technical leader",
        tasks: [
          { name: "Present technical topic at team meeting", status: "not-started", deadline: "2023-08-30" },
          { name: "Document best practices for team", status: "not-started", deadline: "2023-10-30" },
          { name: "Mentor 2 junior developers", status: "in-progress", deadline: "2023-12-15" }
        ]
      },
      {
        order: 4,
        title: "Role Transition",
        description: "Apply for team lead positions",
        tasks: [
          { name: "Update resume with leadership experience", status: "not-started", deadline: "2024-01-15" },
          { name: "Interview preparation for leadership questions", status: "not-started", deadline: "2024-01-30" },
          { name: "Apply for team lead positions", status: "not-started", deadline: "2024-02-28" }
        ]
      }
    ]
  },
  
  marketAnalysis: {
    roleGrowth: [
      { role: "Frontend Developer", growth: 15, demandScore: 85 },
      { role: "Frontend Team Lead", growth: 22, demandScore: 80 },
      { role: "Frontend Architect", growth: 18, demandScore: 75 },
      { role: "Full Stack Developer", growth: 25, demandScore: 90 },
      { role: "UI/UX Developer", growth: 20, demandScore: 78 }
    ],
    
    salaryTrends: [
      { role: "Junior Frontend Developer", avgSalary: "AED 10,000 - 15,000", trend: "+8%" },
      { role: "Mid-level Frontend Developer", avgSalary: "AED 15,000 - 22,000", trend: "+10%" },
      { role: "Senior Frontend Developer", avgSalary: "AED 22,000 - 28,000", trend: "+12%" },
      { role: "Frontend Team Lead", avgSalary: "AED 28,000 - 35,000", trend: "+15%" },
      { role: "Frontend Architect", avgSalary: "AED 35,000 - 45,000", trend: "+18%" }
    ],
    
    topEmployers: [
      { name: "Emirates Group", openPositions: 12, avgRating: 4.2 },
      { name: "Etisalat", openPositions: 8, avgRating: 4.0 },
      { name: "Dubai Holdings", openPositions: 5, avgRating: 4.3 },
      { name: "Careem", openPositions: 10, avgRating: 4.5 },
      { name: "Noon", openPositions: 7, avgRating: 4.1 }
    ]
  },
  
  skillsComparison: {
    industry: [
      { skill: "React", userLevel: 90, industryAvg: 80, topPerformers: 95 },
      { skill: "TypeScript", userLevel: 75, industryAvg: 70, topPerformers: 90 },
      { skill: "System Design", userLevel: 60, industryAvg: 65, topPerformers: 85 },
      { skill: "Team Management", userLevel: 50, industryAvg: 60, topPerformers: 80 },
      { skill: "Project Planning", userLevel: 60, industryAvg: 65, topPerformers: 85 },
      { skill: "Code Reviews", userLevel: 70, industryAvg: 65, topPerformers: 90 }
    ],
    
    roleSpecific: {
      "Frontend Developer": [
        { skill: "React", importance: 95, userLevel: 90 },
        { skill: "JavaScript", importance: 90, userLevel: 85 },
        { skill: "CSS", importance: 85, userLevel: 80 },
        { skill: "TypeScript", importance: 85, userLevel: 75 },
        { skill: "Redux", importance: 80, userLevel: 70 }
      ],
      "Frontend Team Lead": [
        { skill: "React", importance: 90, userLevel: 90 },
        { skill: "TypeScript", importance: 85, userLevel: 75 },
        { skill: "System Design", importance: 85, userLevel: 60 },
        { skill: "Team Management", importance: 90, userLevel: 50 },
        { skill: "Project Planning", importance: 85, userLevel: 60 },
        { skill: "Code Reviews", importance: 90, userLevel: 70 },
        { skill: "Technical Leadership", importance: 95, userLevel: 55 }
      ]
    }
  }
}; 