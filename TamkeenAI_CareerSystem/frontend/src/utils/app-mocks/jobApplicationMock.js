/**
 * Mock data for job applications
 */

export const jobApplicationsMock = {
  recentApplications: [
    {
      id: "app1",
      jobTitle: "Frontend Team Lead",
      company: "Emirates Group",
      location: "Dubai, UAE",
      appliedDate: "2023-05-15",
      status: "Applied",
      matchScore: 85,
      platform: "LinkedIn",
      responseRate: "High (78%)",
      estimatedResponse: "5-7 days"
    },
    {
      id: "app2",
      jobTitle: "Senior Frontend Developer",
      company: "Noon",
      location: "Dubai, UAE",
      appliedDate: "2023-05-12",
      status: "Under Review",
      matchScore: 92,
      platform: "Company Website",
      responseRate: "Medium (45%)",
      estimatedResponse: "10-14 days"
    },
    {
      id: "app3",
      jobTitle: "React Team Lead",
      company: "Careem",
      location: "Dubai, UAE",
      appliedDate: "2023-05-08",
      status: "Interview Scheduled",
      matchScore: 88,
      platform: "LinkedIn",
      responseRate: "High (82%)",
      estimatedResponse: "Already responded"
    },
    {
      id: "app4",
      jobTitle: "Frontend Developer",
      company: "Dubai Holdings",
      location: "Dubai, UAE",
      appliedDate: "2023-05-05",
      status: "Rejected",
      matchScore: 75,
      platform: "Indeed",
      responseRate: "Low (30%)",
      estimatedResponse: "Already responded"
    },
    {
      id: "app5",
      jobTitle: "React Developer",
      company: "Etisalat",
      location: "Abu Dhabi, UAE",
      appliedDate: "2023-05-01",
      status: "Second Interview",
      matchScore: 90,
      platform: "Company Website",
      responseRate: "High (85%)",
      estimatedResponse: "Already responded"
    }
  ],
  
  applicationStats: {
    total: 24,
    active: 15,
    interviews: 5,
    offers: 1,
    rejected: 3,
    byPlatform: [
      { platform: "LinkedIn", count: 12, successRate: "42%" },
      { platform: "Company Websites", count: 8, successRate: "38%" },
      { platform: "Indeed", count: 3, successRate: "33%" },
      { platform: "Bayt", count: 1, successRate: "0%" }
    ],
    byJobType: [
      { type: "Frontend Developer", count: 10, successRate: "40%" },
      { type: "React Developer", count: 8, successRate: "50%" },
      { type: "Team Lead", count: 6, successRate: "33%" }
    ],
    responseRate: {
      overallRate: "45%",
      averageResponseTime: "12 days",
      fastestResponse: "2 days",
      byCompanySize: [
        { size: "Large (1000+)", rate: "38%", avgTime: "15 days" },
        { size: "Medium (100-999)", rate: "52%", avgTime: "8 days" },
        { size: "Small (<100)", rate: "45%", avgTime: "10 days" }
      ]
    }
  },
  
  recommendedActions: [
    {
      type: "follow-up",
      jobId: "app2",
      company: "Noon",
      action: "Send follow-up email",
      reason: "Application under review for 10+ days",
      template: "I hope this email finds you well. I'm writing to follow up on my application for the Senior Frontend Developer position submitted on May 12th. I'm still very interested in the role and would appreciate any updates on my application status."
    },
    {
      type: "interview-prep",
      jobId: "app3",
      company: "Careem",
      action: "Prepare for technical interview",
      reason: "Interview scheduled in 3 days",
      resources: [
        { title: "React Interview Questions", type: "document", link: "/resources/react-interview" },
        { title: "Leadership Scenarios", type: "practice test", link: "/resources/leadership-scenarios" },
        { title: "Company Research", type: "company profile", link: "/companies/careem-profile" }
      ]
    },
    {
      type: "application-improvement",
      action: "Update resume with recent leadership experience",
      reason: "Improve match score for team lead positions",
      affectedApplications: ["app1", "app3"]
    }
  ],
  
  automationHistory: [
    {
      id: "auto1",
      date: "2023-05-10",
      jobsApplied: 8,
      platforms: ["LinkedIn", "Indeed"],
      successRate: "100%",
      time: "15 minutes",
      matches: [
        { jobTitle: "Frontend Team Lead", company: "Emirates Group", matchScore: 85 },
        { jobTitle: "Senior Frontend Developer", company: "Noon", matchScore: 92 },
        { jobTitle: "React Team Lead", company: "Careem", matchScore: 88 }
      ]
    },
    {
      id: "auto2",
      date: "2023-04-25",
      jobsApplied: 6,
      platforms: ["LinkedIn", "Company Websites"],
      successRate: "83%",
      time: "12 minutes",
      matches: [
        { jobTitle: "React Developer", company: "Etisalat", matchScore: 90 },
        { jobTitle: "Frontend Developer", company: "Dubai Holdings", matchScore: 75 }
      ]
    },
    {
      id: "auto3",
      date: "2023-04-12",
      jobsApplied: 10,
      platforms: ["LinkedIn", "Indeed", "Bayt"],
      successRate: "90%",
      time: "18 minutes",
      matches: [
        { jobTitle: "Senior React Developer", company: "ADNOC", matchScore: 82 },
        { jobTitle: "Frontend Tech Lead", company: "Souq", matchScore: 78 }
      ]
    }
  ],
  
  jobMarketInsights: {
    activeListings: 245,
    newLastWeek: 32,
    averageSalary: "AED 25,000",
    demandTrend: "+15% from last month",
    topSkillsRequested: [
      { skill: "React", frequency: "92%" },
      { skill: "TypeScript", frequency: "78%" },
      { skill: "Team Leadership", frequency: "45%" },
      { skill: "System Design", frequency: "38%" },
      { skill: "Performance Optimization", frequency: "35%" }
    ],
    competitionLevel: "Medium-High",
    averageCandidates: 65,
    userCompetitiveRank: "Top 25%"
  },
  
  applicationFeedback: [
    {
      jobId: "app4",
      company: "Dubai Holdings",
      feedback: "Strong technical skills but limited leadership experience",
      improvementAreas: ["Highlight team coordination experience", "Add more examples of technical decision-making"],
      aiAnalysis: "The rejection may be due to the leadership experience gap. Consider highlighting project leadership or mentoring experience even if you weren't in an official leadership role."
    },
    {
      jobId: "app5",
      company: "Etisalat",
      feedback: "Excellent technical match and good communication during interview",
      strengths: ["React knowledge", "System architecture understanding", "Problem-solving approach"],
      nextSteps: "Technical assessment and team fit interview"
    }
  ],
  
  applicationTemplates: [
    {
      id: "template1",
      name: "Frontend Leadership",
      coverletter: "As a Senior Frontend Developer with 5+ years of experience building modern web applications, I'm excited about the {{position}} role at {{company}}. I have successfully led teams in delivering complex features on tight deadlines and mentored junior developers. My expertise in React, TypeScript and system design aligns perfectly with your requirements...",
      highlightedSkills: ["React", "TypeScript", "Team Leadership", "System Design"],
      targetRoles: ["Team Lead", "Senior Developer"]
    },
    {
      id: "template2",
      name: "Technical Specialist",
      coverletter: "I'm writing to express my interest in the {{position}} position at {{company}}. With deep expertise in frontend technologies including React, Redux, and performance optimization, I've delivered solutions that improved application load times by 40% and user engagement by 25%. My technical background and problem-solving abilities make me well-suited for...",
      highlightedSkills: ["React", "Performance Optimization", "Redux", "Problem Solving"],
      targetRoles: ["Senior Developer", "Performance Specialist"]
    }
  ]
}; 