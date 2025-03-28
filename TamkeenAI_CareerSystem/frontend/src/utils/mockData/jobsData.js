/**
 * Mock data for jobs listings and recommendations
 */

const mockJobsData = {
  // Jobs listing with complete details
  jobs: [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      companyLogo: "https://placehold.co/200x100?text=TechCorp",
      location: "San Francisco, CA",
      locationType: "Hybrid",
      salary: "$120,000 - $150,000",
      jobType: "Full-time",
      description: "TechCorp is seeking an experienced Frontend Developer to join our growing team. You will be responsible for implementing visual elements and user interactions that users see and interact with in a web application.",
      responsibilities: [
        "Develop new user-facing features using React.js",
        "Build reusable components and libraries for future use",
        "Ensure the technical feasibility of UI/UX designs",
        "Optimize applications for maximum speed and scalability",
        "Collaborate with other team members and stakeholders"
      ],
      requirements: [
        "3+ years of experience with React.js",
        "Thorough understanding of React.js and its core principles",
        "Experience with popular React.js workflows like Redux",
        "Strong proficiency in JavaScript, including ES6+ features",
        "Experience with HTML5, CSS3, and responsive design",
        "Familiarity with RESTful APIs and GraphQL",
        "Knowledge of browser testing and debugging"
      ],
      preferredSkills: [
        "Experience with TypeScript",
        "Knowledge of modern front-end build pipelines and tools",
        "Experience with server-side rendering",
        "Familiarity with code versioning tools such as Git",
        "Experience with Agile development"
      ],
      benefits: [
        "Competitive salary",
        "Health, dental, and vision insurance",
        "401(k) matching",
        "Flexible working hours",
        "Remote work options",
        "Professional development budget",
        "Generous PTO policy"
      ],
      datePosted: "2023-12-01",
      applicationDeadline: "2023-12-31",
      applicationUrl: "https://example.com/careers/senior-frontend-developer",
      matchPercentage: 87,
      matchFactors: {
        skills: 90,
        experience: 85,
        education: 80,
        location: 70
      },
      companySizeRange: "201-500",
      companyIndustry: "Technology",
      companyDescription: "TechCorp Inc. is a leading software company specializing in cloud-based solutions for enterprise clients."
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "InnovateSoft",
      companyLogo: "https://placehold.co/200x100?text=InnovateSoft",
      location: "Remote",
      locationType: "Remote",
      salary: "$110,000 - $140,000",
      jobType: "Full-time",
      description: "InnovateSoft is looking for a talented Full Stack Developer to help us build and maintain our flagship product. This role involves working on both front-end and back-end development.",
      responsibilities: [
        "Design and develop web applications using modern JavaScript frameworks",
        "Build efficient, testable, and reusable code",
        "Integrate with RESTful APIs and external services",
        "Design and implement database schemas",
        "Collaborate with designers and other developers"
      ],
      requirements: [
        "3+ years of full-stack development experience",
        "Proficiency in JavaScript/TypeScript, HTML, and CSS",
        "Experience with React.js or similar frontend frameworks",
        "Experience with Node.js and Express",
        "Familiarity with database systems like MongoDB or PostgreSQL",
        "Understanding of CI/CD pipelines",
        "Good problem-solving skills"
      ],
      preferredSkills: [
        "Experience with AWS or other cloud providers",
        "Knowledge of Docker and containerization",
        "Experience with microservices architecture",
        "Understanding of security best practices",
        "Experience with test-driven development"
      ],
      benefits: [
        "Competitive salary",
        "Health insurance",
        "Remote-first culture",
        "Flexible working hours",
        "Learning and development budget",
        "Home office stipend",
        "Stock options"
      ],
      datePosted: "2023-12-03",
      applicationDeadline: "2024-01-15",
      applicationUrl: "https://example.com/careers/full-stack-developer",
      matchPercentage: 82,
      matchFactors: {
        skills: 85,
        experience: 80,
        education: 85,
        location: 100
      },
      companySizeRange: "51-200",
      companyIndustry: "Software Development",
      companyDescription: "InnovateSoft builds cutting-edge software solutions for businesses of all sizes, with a focus on user experience and scalability."
    },
    {
      id: 3,
      title: "UI Developer",
      company: "DataViz Systems",
      companyLogo: "https://placehold.co/200x100?text=DataViz",
      location: "New York, NY",
      locationType: "On-site",
      salary: "$100,000 - $125,000",
      jobType: "Contract",
      description: "DataViz Systems is seeking a UI Developer to create engaging and intuitive user interfaces for our data visualization platform. Your work will directly impact how users interact with complex data sets.",
      responsibilities: [
        "Implement responsive designs using HTML, CSS, and JavaScript",
        "Collaborate with designers to translate mockups into functional interfaces",
        "Optimize applications for maximum performance and user experience",
        "Create data visualization components using D3.js or similar libraries",
        "Participate in code reviews and contribute to documentation"
      ],
      requirements: [
        "2+ years of experience in UI development",
        "Strong proficiency in HTML5, CSS3, and JavaScript",
        "Experience with at least one modern JavaScript framework (React preferred)",
        "Knowledge of responsive design principles",
        "Understanding of cross-browser compatibility issues",
        "Basic knowledge of data visualization techniques",
        "Good communication skills"
      ],
      preferredSkills: [
        "Experience with D3.js or other data visualization libraries",
        "Knowledge of SASS/LESS",
        "Experience with design tools like Figma or Adobe XD",
        "Understanding of accessibility standards",
        "Experience with animations and interactive UI elements"
      ],
      benefits: [
        "Competitive hourly rate",
        "Flexible working hours",
        "Opportunity for contract-to-hire",
        "Professional development opportunities",
        "Modern office in central location",
        "Team events and activities"
      ],
      datePosted: "2023-12-05",
      applicationDeadline: "2024-01-05",
      applicationUrl: "https://example.com/careers/ui-developer",
      matchPercentage: 75,
      matchFactors: {
        skills: 80,
        experience: 70,
        education: 75,
        location: 60
      },
      companySizeRange: "11-50",
      companyIndustry: "Data Analytics",
      companyDescription: "DataViz Systems specializes in creating powerful data visualization tools that help businesses make data-driven decisions."
    },
    {
      id: 4,
      title: "React Native Developer",
      company: "MobileFirst Apps",
      companyLogo: "https://placehold.co/200x100?text=MobileFirst",
      location: "Austin, TX",
      locationType: "Hybrid",
      salary: "$115,000 - $135,000",
      jobType: "Full-time",
      description: "MobileFirst Apps is looking for a React Native Developer to help us build cross-platform mobile applications. You will work on creating smooth, responsive user experiences for our clients' mobile products.",
      responsibilities: [
        "Develop cross-platform mobile applications using React Native",
        "Collaborate with the design team to implement user interfaces",
        "Integrate with backend services and APIs",
        "Optimize applications for performance on different devices",
        "Troubleshoot and fix bugs across iOS and Android platforms"
      ],
      requirements: [
        "2+ years of experience with React Native",
        "Strong knowledge of JavaScript/TypeScript",
        "Experience with state management in React applications",
        "Understanding of mobile development considerations",
        "Experience with native module integration",
        "Familiarity with code versioning tools like Git",
        "Problem-solving mindset"
      ],
      preferredSkills: [
        "Experience with native iOS or Android development",
        "Knowledge of offline storage and caching strategies",
        "Experience with CI/CD pipelines for mobile apps",
        "Familiarity with app store submission processes",
        "Understanding of app performance optimization"
      ],
      benefits: [
        "Competitive salary",
        "Health, dental, and vision insurance",
        "401(k) with company match",
        "Flexible working arrangements",
        "Professional development budget",
        "Wellness program",
        "Regular team events"
      ],
      datePosted: "2023-12-07",
      applicationDeadline: "2024-01-07",
      applicationUrl: "https://example.com/careers/react-native-developer",
      matchPercentage: 70,
      matchFactors: {
        skills: 75,
        experience: 65,
        education: 80,
        location: 50
      },
      companySizeRange: "11-50",
      companyIndustry: "Mobile Development",
      companyDescription: "MobileFirst Apps creates cutting-edge mobile applications for businesses across various industries, focusing on user experience and performance."
    },
    {
      id: 5,
      title: "Frontend Engineer",
      company: "EcomX",
      companyLogo: "https://placehold.co/200x100?text=EcomX",
      location: "Seattle, WA",
      locationType: "On-site",
      salary: "$125,000 - $155,000",
      jobType: "Full-time",
      description: "EcomX is seeking a Frontend Engineer to join our growing team. You will be responsible for building and optimizing the user interfaces for our e-commerce platform, focusing on performance and scalability.",
      responsibilities: [
        "Develop and maintain features for our e-commerce platform",
        "Work with designers to implement responsive, user-friendly interfaces",
        "Optimize web applications for maximum speed and scalability",
        "Collaborate with backend developers to integrate frontend with APIs",
        "Participate in code reviews and implement best practices"
      ],
      requirements: [
        "4+ years of frontend development experience",
        "Expert knowledge of JavaScript, HTML, and CSS",
        "Experience with React.js and modern state management",
        "Understanding of browser rendering and performance",
        "Experience with testing methodologies and tools",
        "Knowledge of web security and common vulnerabilities",
        "Strong communication skills"
      ],
      preferredSkills: [
        "Experience with e-commerce platforms",
        "Knowledge of payment gateway integrations",
        "Experience with performance monitoring tools",
        "Understanding of SEO best practices",
        "Experience with internationalization and localization"
      ],
      benefits: [
        "Competitive salary",
        "Comprehensive health benefits",
        "401(k) with generous match",
        "Stock options",
        "Flexible PTO policy",
        "Learning and development budget",
        "On-site gym and meals"
      ],
      datePosted: "2023-12-08",
      applicationDeadline: "2024-01-10",
      applicationUrl: "https://example.com/careers/frontend-engineer",
      matchPercentage: 65,
      matchFactors: {
        skills: 70,
        experience: 60,
        education: 75,
        location: 55
      },
      companySizeRange: "501-1000",
      companyIndustry: "E-commerce",
      companyDescription: "EcomX is a leading e-commerce platform that helps businesses of all sizes sell their products online with powerful tools and analytics."
    }
  ],
  
  // Job application statuses for user-applied jobs
  applications: [
    {
      id: 101,
      jobId: 1,
      company: "TechCorp Inc.",
      position: "Senior Frontend Developer",
      status: "Applied",
      appliedDate: "2023-12-09T14:30:00",
      lastUpdated: "2023-12-09T14:30:00",
      nextSteps: "Wait for employer response",
      notes: "Applied through company website. Used tailored resume version 2.",
      interviews: []
    },
    {
      id: 102,
      jobId: 2,
      company: "InnovateSoft",
      position: "Full Stack Developer",
      status: "Interview Scheduled",
      appliedDate: "2023-12-05T09:15:00",
      lastUpdated: "2023-12-08T16:20:00",
      nextSteps: "Prepare for technical interview",
      notes: "Had initial screening call. Received positive feedback on portfolio.",
      interviews: [
        {
          type: "Initial Screening",
          date: "2023-12-07T11:00:00",
          duration: 30,
          interviewer: "Sarah Johnson, HR Manager",
          notes: "Basic questions about experience and background. Went well.",
          completed: true
        },
        {
          type: "Technical Interview",
          date: "2023-12-18T10:30:00",
          duration: 60,
          interviewer: "David Chen, Senior Developer",
          notes: "Will focus on JavaScript, React, and system design.",
          completed: false,
          preparationMaterials: [
            "Review React hooks and context API",
            "Prepare for coding challenges",
            "Review portfolio projects for discussion"
          ]
        }
      ]
    },
    {
      id: 103,
      jobId: 3,
      company: "DataViz Systems",
      position: "UI Developer",
      status: "Rejected",
      appliedDate: "2023-11-25T13:45:00",
      lastUpdated: "2023-12-06T09:30:00",
      nextSteps: "Consider applying for other positions",
      notes: "Received rejection email. They were looking for someone with more D3.js experience.",
      interviews: [
        {
          type: "Phone Screening",
          date: "2023-12-01T14:00:00",
          duration: 20,
          interviewer: "Mark Wilson, Talent Acquisition",
          notes: "Basic fit assessment. Questions about data visualization experience.",
          completed: true
        }
      ],
      feedback: "Need more experience with data visualization libraries. Consider taking a D3.js course."
    },
    {
      id: 104,
      jobId: null,
      company: "CloudTech Solutions",
      position: "Frontend Developer",
      status: "Offer Received",
      appliedDate: "2023-11-10T10:00:00",
      lastUpdated: "2023-12-07T15:45:00",
      nextSteps: "Review offer details by Dec 15",
      notes: "Offer: $115k base, 10% bonus, standard benefits. Need to respond by Dec 15.",
      interviews: [
        {
          type: "Initial Phone Screen",
          date: "2023-11-15T11:30:00",
          duration: 30,
          interviewer: "HR Representative",
          notes: "Standard screening questions about experience and background.",
          completed: true
        },
        {
          type: "Technical Assessment",
          date: "2023-11-20T00:00:00",
          duration: null,
          interviewer: null,
          notes: "Take-home coding challenge. Built a small React application with state management.",
          completed: true
        },
        {
          type: "Technical Interview",
          date: "2023-11-27T14:00:00",
          duration: 90,
          interviewer: "Senior Developer Panel",
          notes: "Deep dive into technical skills. Code review of take-home assessment.",
          completed: true
        },
        {
          type: "Final Interview",
          date: "2023-12-05T15:30:00",
          duration: 60,
          interviewer: "CTO and Team Lead",
          notes: "Cultural fit and discussion about role expectations.",
          completed: true
        }
      ],
      offerDetails: {
        salary: "$115,000 per year",
        bonus: "10% annual performance bonus",
        benefits: "Health, dental, vision insurance",
        equity: "Stock options vesting over 4 years",
        startDate: "2024-01-15",
        deadline: "2023-12-15"
      }
    },
    {
      id: 105,
      jobId: 5,
      company: "EcomX",
      position: "Frontend Engineer",
      status: "Application Viewed",
      appliedDate: "2023-12-08T16:30:00",
      lastUpdated: "2023-12-09T10:10:00",
      nextSteps: "Wait for employer response",
      notes: "Application viewed by employer according to tracking system.",
      interviews: []
    }
  ],
  
  // Jobs recommended by AI based on user profile
  recommendations: [
    {
      id: 201,
      jobId: 1,
      matchScore: 87,
      reasonForRecommendation: "Your skills in React and JavaScript closely align with this role. The company culture also seems to match your preferences.",
      skillsMatch: ["React.js", "JavaScript", "Frontend Development", "UI/UX"],
      locationMatch: "This job is in your preferred location",
      salaryMatch: "This salary range meets your expectations",
      growthPotential: "High potential for career advancement in a growing company"
    },
    {
      id: 202,
      jobId: 2,
      matchScore: 82,
      reasonForRecommendation: "This role leverages your full-stack experience and offers remote work, which you indicated as a preference.",
      skillsMatch: ["React.js", "Node.js", "JavaScript", "API Integration"],
      locationMatch: "Remote work allows you to work from anywhere",
      salaryMatch: "This salary range meets your expectations",
      growthPotential: "Opportunity to work with modern technologies and expand your skill set"
    },
    {
      id: 203,
      jobId: 4,
      matchScore: 70,
      reasonForRecommendation: "While your React Native experience is limited, this role would allow you to leverage your React skills while expanding into mobile development.",
      skillsMatch: ["JavaScript", "React", "UI Development"],
      locationMatch: "This location is within your secondary preferences",
      salaryMatch: "This salary range meets your expectations",
      growthPotential: "Good opportunity to expand your skills into mobile development"
    }
  ],
  
  // Job search history
  searchHistory: [
    {
      id: 1,
      query: "frontend developer",
      location: "San Francisco, CA",
      date: "2023-12-08T09:30:00",
      filters: {
        jobType: ["Full-time"],
        experience: ["Mid-level", "Senior"],
        remote: true
      },
      results: 28
    },
    {
      id: 2,
      query: "React developer",
      location: "Remote",
      date: "2023-12-07T14:45:00",
      filters: {
        jobType: ["Full-time", "Contract"],
        experience: ["Mid-level"],
        remote: true
      },
      results: 42
    },
    {
      id: 3,
      query: "UI developer",
      location: "New York, NY",
      date: "2023-12-05T11:15:00",
      filters: {
        jobType: ["Full-time", "Contract"],
        experience: ["Entry-level", "Mid-level"],
        remote: false
      },
      results: 15
    }
  ],
  
  // Saved jobs (bookmarked by user)
  savedJobs: [
    { id: 1, savedDate: "2023-12-09T15:20:00" },
    { id: 4, savedDate: "2023-12-08T17:30:00" }
  ],
  
  // Job market insights
  marketInsights: {
    averageSalary: {
      "Frontend Developer": {
        entry: "$75,000 - $90,000",
        mid: "$95,000 - $120,000",
        senior: "$125,000 - $160,000"
      },
      "Full Stack Developer": {
        entry: "$80,000 - $100,000",
        mid: "$105,000 - $130,000",
        senior: "$135,000 - $170,000"
      },
      "React Developer": {
        entry: "$80,000 - $95,000",
        mid: "$100,000 - $125,000",
        senior: "$130,000 - $165,000"
      }
    },
    inDemandSkills: [
      { skill: "React.js", demandLevel: "Very High", growthRate: "+15% year over year" },
      { skill: "TypeScript", demandLevel: "High", growthRate: "+25% year over year" },
      { skill: "Node.js", demandLevel: "High", growthRate: "+10% year over year" },
      { skill: "AWS", demandLevel: "Very High", growthRate: "+20% year over year" },
      { skill: "Docker", demandLevel: "Medium", growthRate: "+12% year over year" }
    ],
    hiringTrends: [
      { trend: "Remote work continues to grow in popularity", impact: "More opportunities regardless of location" },
      { trend: "Increasing demand for full-stack developers", impact: "Higher salary potential for versatile skills" },
      { trend: "Growing emphasis on soft skills", impact: "Communication skills becoming as important as technical abilities" },
      { trend: "AI and automation in recruitment", impact: "Optimizing resumes for ATS systems is critical" }
    ],
    locationInsights: [
      { location: "San Francisco, CA", jobGrowth: "+8%", avgSalary: "$145,000", costOfLiving: "Very High" },
      { location: "New York, NY", jobGrowth: "+7%", avgSalary: "$135,000", costOfLiving: "Very High" },
      { location: "Austin, TX", jobGrowth: "+12%", avgSalary: "$115,000", costOfLiving: "Medium" },
      { location: "Seattle, WA", jobGrowth: "+10%", avgSalary: "$140,000", costOfLiving: "High" },
      { location: "Remote", jobGrowth: "+25%", avgSalary: "Varies by company", costOfLiving: "N/A" }
    ]
  }
};

export default mockJobsData; 