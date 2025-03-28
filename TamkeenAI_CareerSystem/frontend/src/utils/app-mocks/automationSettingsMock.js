/**
 * Mock data for job automation settings
 */

export const automationSettingsMock = {
  platforms: [
    {
      id: "linkedin",
      name: "LinkedIn",
      icon: "linkedin",
      enabled: true,
      status: "connected",
      credentials: {
        username: "user@example.com",
        passwordSaved: true
      },
      settings: {
        autoApply: true,
        coverLetterTemplate: "template1",
        skipComplex: true,
        maxApplicationsPerDay: 15,
        preferredJobTypes: ["Full-time", "Contract"],
        locationPreferences: ["Dubai", "Abu Dhabi", "Remote"],
        ignoreKeywords: ["Senior Management", "Executive"]
      },
      stats: {
        totalApplications: 35,
        successRate: "92%",
        averageTime: "45 seconds"
      }
    },
    {
      id: "indeed",
      name: "Indeed",
      icon: "indeed",
      enabled: true,
      status: "connected",
      credentials: {
        username: "user@example.com",
        passwordSaved: true
      },
      settings: {
        autoApply: true,
        coverLetterTemplate: "template2",
        skipComplex: true,
        maxApplicationsPerDay: 10,
        preferredJobTypes: ["Full-time", "Part-time"],
        locationPreferences: ["Dubai", "Sharjah", "Remote"],
        ignoreKeywords: ["Manager", "Director"]
      },
      stats: {
        totalApplications: 22,
        successRate: "86%",
        averageTime: "60 seconds"
      }
    },
    {
      id: "bayt",
      name: "Bayt",
      icon: "bayt",
      enabled: false,
      status: "disconnected",
      credentials: {
        username: "",
        passwordSaved: false
      },
      settings: {
        autoApply: false,
        coverLetterTemplate: "template1",
        skipComplex: true,
        maxApplicationsPerDay: 20,
        preferredJobTypes: ["Full-time"],
        locationPreferences: ["Dubai", "Abu Dhabi", "Sharjah"],
        ignoreKeywords: []
      },
      stats: {
        totalApplications: 0,
        successRate: "0%",
        averageTime: "N/A"
      }
    },
    {
      id: "gulfjobs",
      name: "Gulf Jobs",
      icon: "gulfjobs",
      enabled: true,
      status: "connected",
      credentials: {
        username: "user123",
        passwordSaved: true
      },
      settings: {
        autoApply: true,
        coverLetterTemplate: "template1",
        skipComplex: true,
        maxApplicationsPerDay: 12,
        preferredJobTypes: ["Full-time", "Contract"],
        locationPreferences: ["Dubai", "UAE"],
        ignoreKeywords: ["Chief", "VP"]
      },
      stats: {
        totalApplications: 18,
        successRate: "94%",
        averageTime: "55 seconds"
      }
    }
  ],
  
  generalSettings: {
    automationEnabled: true,
    matchThreshold: 75,
    autoUpdateResume: true,
    scheduleActive: true,
    schedule: {
      days: ["Monday", "Wednesday", "Friday"],
      timeWindow: {
        start: "10:00",
        end: "14:00"
      },
      timezone: "Gulf Standard Time"
    },
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
      dailySummary: true,
      instantAlerts: true
    },
    failsafeSettings: {
      pauseAfterRejections: 3,
      dailyLimit: 25,
      weeklyLimit: 100
    }
  },
  
  templates: [
    {
      id: "template1",
      name: "Standard Professional",
      content: "Dear {{hiringManager}},\n\nI am writing to express my interest in the {{jobTitle}} position at {{company}}. With {{experience}} years of experience in {{industry}}, I believe my skills in {{skills}} make me a strong candidate for this role.\n\n{{customParagraph}}\n\nI look forward to discussing how my background, skills, and achievements align with your requirements.\n\nSincerely,\n{{fullName}}",
      variables: [
        "hiringManager",
        "jobTitle",
        "company",
        "experience",
        "industry",
        "skills",
        "customParagraph",
        "fullName"
      ],
      usage: 42,
      successRate: "68%"
    },
    {
      id: "template2",
      name: "Technical Specialist",
      content: "Dear {{hiringManager}},\n\nI am reaching out regarding the {{jobTitle}} position at {{company}}. As a technical professional with expertise in {{skills}}, I have a proven track record of delivering {{achievements}}.\n\n{{projectsHighlight}}\n\nI am excited about the opportunity to bring my technical skills and innovative approach to {{company}}.\n\nBest regards,\n{{fullName}}",
      variables: [
        "hiringManager",
        "jobTitle",
        "company",
        "skills",
        "achievements",
        "projectsHighlight",
        "fullName"
      ],
      usage: 28,
      successRate: "72%"
    },
    {
      id: "template3",
      name: "Leadership Focus",
      content: "Dear {{hiringManager}},\n\nI am applying for the {{jobTitle}} position at {{company}}. With {{experience}} years of leadership experience, I have successfully {{leadershipAccomplishments}} while maintaining a focus on {{values}}.\n\n{{teamManagementHighlight}}\n\nI am eager to discuss how my leadership philosophy and approach can contribute to {{company}}'s continued success.\n\nSincerely,\n{{fullName}}",
      variables: [
        "hiringManager",
        "jobTitle",
        "company",
        "experience",
        "leadershipAccomplishments",
        "values",
        "teamManagementHighlight",
        "fullName"
      ],
      usage: 15,
      successRate: "65%"
    }
  ],
  
  searchFilters: {
    titleKeywords: ["Frontend", "React", "JavaScript", "Developer", "Engineer", "Lead"],
    excludeTitleKeywords: ["Manager", "Director", "VP", "C-Level"],
    companies: ["Emirates Group", "Etisalat", "Careem", "Noon", "Dubai Holdings"],
    excludeCompanies: [],
    locations: ["Dubai", "Abu Dhabi", "Sharjah", "Remote"],
    salary: {
      min: 20000,
      max: 45000,
      currency: "AED"
    },
    jobTypes: ["Full-time", "Contract"],
    experienceLevel: ["Mid-level", "Senior", "Lead"],
    datePosted: "past-week",
    remoteOptions: ["Remote", "Hybrid"],
    industries: ["Technology", "Telecommunications", "E-commerce", "Financial Services"]
  },
  
  automationLogs: [
    {
      id: "log1",
      timestamp: "2023-05-15T08:30:45",
      platform: "LinkedIn",
      action: "Login",
      status: "Success",
      details: "Successfully logged in to LinkedIn"
    },
    {
      id: "log2",
      timestamp: "2023-05-15T08:32:12",
      platform: "LinkedIn",
      action: "Search",
      status: "Success",
      details: "Found 28 matching jobs with search filters"
    },
    {
      id: "log3",
      timestamp: "2023-05-15T08:35:30",
      platform: "LinkedIn",
      action: "Application",
      status: "Success",
      details: "Applied to 'Frontend Developer' at Emirates Group"
    },
    {
      id: "log4",
      timestamp: "2023-05-15T08:38:45",
      platform: "LinkedIn",
      action: "Application",
      status: "Success",
      details: "Applied to 'React Engineer' at Noon"
    },
    {
      id: "log5",
      timestamp: "2023-05-15T08:42:10",
      platform: "LinkedIn",
      action: "Application",
      status: "Error",
      details: "Failed to apply to 'Senior Developer' at Careem - Complex application form detected"
    },
    {
      id: "log6",
      timestamp: "2023-05-15T09:15:22",
      platform: "Indeed",
      action: "Login",
      status: "Success",
      details: "Successfully logged in to Indeed"
    },
    {
      id: "log7",
      timestamp: "2023-05-15T09:17:45",
      platform: "Indeed",
      action: "Search",
      status: "Success",
      details: "Found 16 matching jobs with search filters"
    },
    {
      id: "log8",
      timestamp: "2023-05-15T09:20:30",
      platform: "Indeed",
      action: "Application",
      status: "Success",
      details: "Applied to 'Frontend Developer' at Dubai Holdings"
    }
  ],
  
  automationSchedule: {
    lastRun: "2023-05-15T08:30:45",
    nextScheduled: "2023-05-17T10:00:00",
    status: "active",
    pausedUntil: null,
    weeklySchedule: [
      { day: "Monday", startTime: "10:00", endTime: "14:00", active: true },
      { day: "Tuesday", startTime: "10:00", endTime: "14:00", active: false },
      { day: "Wednesday", startTime: "10:00", endTime: "14:00", active: true },
      { day: "Thursday", startTime: "10:00", endTime: "14:00", active: false },
      { day: "Friday", startTime: "10:00", endTime: "14:00", active: true },
      { day: "Saturday", startTime: "10:00", endTime: "14:00", active: false },
      { day: "Sunday", startTime: "10:00", endTime: "14:00", active: false }
    ]
  },
  
  optimizationSuggestions: [
    {
      id: "opt1",
      type: "search_filters",
      title: "Expand Job Title Keywords",
      description: "Adding 'Frontend Developer' and 'UI Developer' could increase matches by 35%",
      impact: "high",
      implemented: false
    },
    {
      id: "opt2",
      type: "cover_letter",
      title: "Emphasize Technical Skills",
      description: "Adding more specific technical achievements could improve application success rate",
      impact: "medium",
      implemented: true
    },
    {
      id: "opt3",
      type: "platforms",
      title: "Add Bayt Platform",
      description: "Connecting Bayt could give access to 120+ additional matching positions",
      impact: "high",
      implemented: false
    },
    {
      id: "opt4",
      type: "schedule",
      title: "Optimize Application Timing",
      description: "Scheduling applications between 8-10am could increase visibility by recruiters",
      impact: "medium",
      implemented: false
    }
  ]
}; 