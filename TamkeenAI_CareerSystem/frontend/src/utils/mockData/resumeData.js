/**
 * Mock data for resume builder functionality
 */

const mockResumeData = {
  // User's current resume data
  userResume: {
    personalInfo: {
      firstName: "Mohammed",
      lastName: "Al-Mansouri",
      email: "mohammed.almansouri@example.com",
      phone: "+971 50 123 4567",
      location: "Dubai, United Arab Emirates",
      linkedIn: "linkedin.com/in/mohammedalmansouri",
      website: "mohammedalmansouri.com",
      summary: "Results-driven Frontend Developer with 4+ years of experience specializing in React.js and modern JavaScript frameworks. Demonstrated history of building responsive, user-friendly web applications with a focus on performance optimization and accessibility. Strong problem-solving skills and passion for clean, maintainable code. Seeking to leverage my technical expertise and creative problem-solving skills in a challenging frontend development role."
    },
    
    // Professional experience
    experience: [
      {
        id: 1,
        title: "Senior Frontend Developer",
        company: "TechInnovate Solutions",
        location: "Dubai, UAE",
        startDate: "2021-06",
        endDate: "Present",
        current: true,
        description: "Leading frontend development for enterprise web applications using React.js and TypeScript.",
        achievements: [
          "Redesigned the main dashboard, improving load time by 40% and user engagement by 25%",
          "Led a team of 3 developers to rebuild the company's flagship product using React and Redux",
          "Implemented automated testing using Jest and React Testing Library, increasing code coverage to 85%",
          "Mentored junior developers and conducted code reviews to ensure best practices"
        ],
        keySkills: ["React.js", "TypeScript", "Redux", "Jest", "Webpack", "Team Leadership"]
      },
      {
        id: 2,
        title: "Frontend Developer",
        company: "Digital Pioneers",
        location: "Abu Dhabi, UAE",
        startDate: "2019-03",
        endDate: "2021-05",
        current: false,
        description: "Developed responsive web applications for various clients in the finance and retail sectors.",
        achievements: [
          "Built an e-commerce platform that increased client's online sales by 35%",
          "Implemented responsive design principles, ensuring seamless user experience across all devices",
          "Collaborated with UX/UI designers to translate mockups into functional interfaces",
          "Optimized web performance, achieving a Google PageSpeed score of 92/100"
        ],
        keySkills: ["JavaScript", "React.js", "HTML5/CSS3", "SASS", "RESTful APIs", "Git"]
      },
      {
        id: 3,
        title: "Web Developer Intern",
        company: "Future Tech",
        location: "Dubai, UAE",
        startDate: "2018-09",
        endDate: "2019-02",
        current: false,
        description: "Assisted in developing and maintaining company websites and web applications.",
        achievements: [
          "Contributed to the development of 5 client websites using HTML, CSS, and JavaScript",
          "Assisted senior developers with bug fixes and feature implementations",
          "Created responsive email templates that improved marketing campaign click-through rates by 15%",
          "Participated in daily stand-ups and sprint planning meetings"
        ],
        keySkills: ["HTML", "CSS", "JavaScript", "jQuery", "WordPress"]
      }
    ],
    
    // Education background
    education: [
      {
        id: 1,
        degree: "Bachelor of Science in Computer Science",
        institution: "United Arab Emirates University",
        location: "Al Ain, UAE",
        startDate: "2014-09",
        endDate: "2018-06",
        gpa: "3.8/4.0",
        highlights: [
          "Graduated with Honors",
          "Senior Project: Developed a mobile application for campus navigation",
          "Dean's List for 6 consecutive semesters",
          "Member of the Computer Science Student Association"
        ],
        relevantCourses: [
          "Web Development",
          "Data Structures and Algorithms",
          "Database Systems",
          "Mobile Application Development",
          "Software Engineering"
        ]
      },
      {
        id: 2,
        degree: "Web Development Bootcamp",
        institution: "Code Academy Dubai",
        location: "Dubai, UAE",
        startDate: "2018-06",
        endDate: "2018-08",
        gpa: null,
        highlights: [
          "Intensive 10-week program focusing on modern web technologies",
          "Developed 3 full-stack web applications using MERN stack",
          "Received award for Best Final Project"
        ],
        relevantCourses: [
          "Modern JavaScript",
          "React.js",
          "Node.js",
          "MongoDB",
          "RESTful API Design"
        ]
      }
    ],
    
    // Technical and other skills
    skills: {
      technical: [
        { name: "JavaScript", level: "Expert" },
        { name: "React.js", level: "Expert" },
        { name: "HTML5/CSS3", level: "Expert" },
        { name: "TypeScript", level: "Advanced" },
        { name: "Redux", level: "Advanced" },
        { name: "Node.js", level: "Intermediate" },
        { name: "Webpack", level: "Intermediate" },
        { name: "GraphQL", level: "Intermediate" },
        { name: "Jest", level: "Advanced" },
        { name: "Git", level: "Advanced" },
        { name: "SASS/SCSS", level: "Advanced" },
        { name: "RESTful APIs", level: "Advanced" },
        { name: "Responsive Design", level: "Expert" },
        { name: "Performance Optimization", level: "Advanced" },
        { name: "Accessibility (WCAG)", level: "Intermediate" }
      ],
      soft: [
        "Problem Solving",
        "Team Leadership",
        "Communication",
        "Time Management",
        "Project Management",
        "Mentoring",
        "Adaptability",
        "Attention to Detail"
      ],
      languages: [
        { language: "Arabic", proficiency: "Native" },
        { language: "English", proficiency: "Fluent" },
        { language: "French", proficiency: "Basic" }
      ]
    },
    
    // Projects portfolio
    projects: [
      {
        id: 1,
        title: "E-commerce Platform",
        description: "A fully responsive e-commerce platform with product catalog, shopping cart, and payment integration.",
        role: "Lead Frontend Developer",
        startDate: "2020-09",
        endDate: "2021-02",
        url: "https://example-ecommerce.com",
        githubUrl: "https://github.com/mohammedalmansouri/ecommerce-platform",
        technologies: ["React.js", "Redux", "Node.js", "Express", "MongoDB", "Stripe API"],
        highlights: [
          "Implemented responsive design with Material-UI",
          "Built shopping cart functionality with Redux",
          "Integrated Stripe payment gateway",
          "Added product filtering and search functionality"
        ],
        images: ["https://placehold.co/600x400?text=E-commerce+Screenshot"]
      },
      {
        id: 2,
        title: "Task Management Dashboard",
        description: "A collaborative task management tool with real-time updates and team collaboration features.",
        role: "Frontend Developer",
        startDate: "2019-11",
        endDate: "2020-03",
        url: "https://example-tasks.com",
        githubUrl: "https://github.com/mohammedalmansouri/task-dashboard",
        technologies: ["React.js", "Firebase", "Material-UI", "Chart.js"],
        highlights: [
          "Created drag-and-drop interface for task management",
          "Implemented real-time updates using Firebase",
          "Built dashboard analytics with Chart.js",
          "Added user authentication and role-based permissions"
        ],
        images: ["https://placehold.co/600x400?text=Dashboard+Screenshot"]
      },
      {
        id: 3,
        title: "Weather Forecast App",
        description: "A mobile-responsive weather application providing 7-day forecasts for any location.",
        role: "Solo Developer",
        startDate: "2019-06",
        endDate: "2019-08",
        url: "https://weather-forecast-app.example.com",
        githubUrl: "https://github.com/mohammedalmansouri/weather-app",
        technologies: ["JavaScript", "HTML5", "CSS3", "OpenWeatherMap API", "Geolocation API"],
        highlights: [
          "Used Geolocation API for current location detection",
          "Integrated OpenWeatherMap API for weather data",
          "Implemented responsive design for all device sizes",
          "Added search functionality for worldwide locations"
        ],
        images: ["https://placehold.co/600x400?text=Weather+App+Screenshot"]
      }
    ],
    
    // Certifications and additional training
    certifications: [
      {
        id: 1,
        name: "AWS Certified Developer - Associate",
        issuer: "Amazon Web Services",
        date: "2022-01",
        expirationDate: "2025-01",
        credentialID: "AWS-DEV-12345",
        url: "https://example.com/aws-cert"
      },
      {
        id: 2,
        name: "React.js Advanced Concepts",
        issuer: "Frontend Masters",
        date: "2021-06",
        expirationDate: null,
        credentialID: "FM-REACT-67890",
        url: "https://example.com/react-cert"
      },
      {
        id: 3,
        name: "Professional Scrum Master I (PSM I)",
        issuer: "Scrum.org",
        date: "2020-11",
        expirationDate: null,
        credentialID: "PSM-123456",
        url: "https://example.com/psm-cert"
      }
    ],
    
    // Volunteer work
    volunteer: [
      {
        id: 1,
        role: "Web Development Mentor",
        organization: "Youth Coding Club",
        location: "Dubai, UAE",
        startDate: "2020-01",
        endDate: "Present",
        current: true,
        description: "Mentor high school students in web development fundamentals, teaching HTML, CSS, and basic JavaScript.",
        achievements: [
          "Mentored over 30 students, with several pursuing computer science in university",
          "Developed curriculum for introductory web development",
          "Organized and led a web development hackathon for 50+ students"
        ]
      },
      {
        id: 2,
        role: "Technical Volunteer",
        organization: "Tech for Good Dubai",
        location: "Dubai, UAE",
        startDate: "2019-05",
        endDate: "2020-12",
        current: false,
        description: "Contributed technical expertise to non-profit organizations in need of digital solutions.",
        achievements: [
          "Built websites for 3 local non-profit organizations",
          "Conducted workshops on maintaining and updating websites",
          "Provided ongoing technical support and troubleshooting"
        ]
      }
    ],
    
    // Additional sections
    awards: [
      {
        id: 1,
        title: "Employee of the Year",
        issuer: "TechInnovate Solutions",
        date: "2022",
        description: "Recognized for outstanding contributions to product development and team leadership."
      },
      {
        id: 2,
        title: "Hackathon Winner",
        issuer: "Dubai Future Foundation",
        date: "2020",
        description: "First place in a 48-hour hackathon, developing a solution for smart city transportation."
      }
    ],
    
    publications: [
      {
        id: 1,
        title: "Optimizing React Applications for Performance",
        publisher: "Medium - JavaScript in Plain English",
        date: "2021-09",
        url: "https://example.com/react-optimization-article",
        description: "Article detailing advanced techniques for improving React application performance."
      },
      {
        id: 2,
        title: "The Future of Web Development in the Middle East",
        publisher: "UAE Tech Magazine",
        date: "2020-11",
        url: "https://example.com/future-web-dev",
        description: "Feature article discussing the growth and future of web development in the MENA region."
      }
    ]
  },
  
  // Resume templates available to users
  templates: [
    {
      id: 1,
      name: "Professional",
      description: "A clean, professional template with a traditional layout suitable for most industries.",
      thumbnail: "https://placehold.co/300x400?text=Professional+Template",
      color_schemes: [
        { name: "Blue Professional", primary: "#1a5276", secondary: "#eaf2f8" },
        { name: "Gray Professional", primary: "#424949", secondary: "#f2f4f4" },
        { name: "Maroon Professional", primary: "#7b241c", secondary: "#f9ebea" }
      ],
      premium: false
    },
    {
      id: 2,
      name: "Modern",
      description: "A contemporary template with creative layout and formatting, ideal for creative fields.",
      thumbnail: "https://placehold.co/300x400?text=Modern+Template",
      color_schemes: [
        { name: "Teal Modern", primary: "#148f77", secondary: "#e8f8f5" },
        { name: "Purple Modern", primary: "#6c3483", secondary: "#f4ecf7" },
        { name: "Orange Modern", primary: "#d35400", secondary: "#fdf2e9" }
      ],
      premium: false
    },
    {
      id: 3,
      name: "Executive",
      description: "An elegant, sophisticated template designed for senior professionals and executives.",
      thumbnail: "https://placehold.co/300x400?text=Executive+Template",
      color_schemes: [
        { name: "Navy Executive", primary: "#1f3a63", secondary: "#e5e8f0" },
        { name: "Charcoal Executive", primary: "#2c3e50", secondary: "#ebedef" },
        { name: "Burgundy Executive", primary: "#6e2c32", secondary: "#f5eaea" }
      ],
      premium: true
    },
    {
      id: 4,
      name: "Tech",
      description: "A modern template specifically designed for IT and technology professionals.",
      thumbnail: "https://placehold.co/300x400?text=Tech+Template",
      color_schemes: [
        { name: "Cyber Tech", primary: "#2980b9", secondary: "#eaf2f8" },
        { name: "Matrix Tech", primary: "#27ae60", secondary: "#e9f7ef" },
        { name: "Dark Tech", primary: "#17202a", secondary: "#eaecee" }
      ],
      premium: true
    },
    {
      id: 5,
      name: "Minimalist",
      description: "A simple, clean template that focuses on content with minimal design elements.",
      thumbnail: "https://placehold.co/300x400?text=Minimalist+Template",
      color_schemes: [
        { name: "Classic Minimalist", primary: "#2c3e50", secondary: "#ecf0f1" },
        { name: "Soft Minimalist", primary: "#7f8c8d", secondary: "#f8f9f9" },
        { name: "Accent Minimalist", primary: "#16a085", secondary: "#e8f6f3" }
      ],
      premium: false
    }
  ],
  
  // ATS analysis and feedback
  atsAnalysis: {
    overallScore: 82,
    passedInitialScreening: true,
    feedback: {
      keywords: {
        score: 85,
        feedback: "Good keyword match for frontend developer positions. Consider adding more specific React ecosystem terms like 'Next.js' or 'Context API'.",
        detectedKeywords: ["React.js", "JavaScript", "TypeScript", "Frontend", "HTML5", "CSS3", "Redux", "Responsive Design", "Git", "REST API"],
        recommendedKeywords: ["Next.js", "Context API", "Agile", "CI/CD", "Cross-browser Compatibility"]
      },
      formatting: {
        score: 90,
        feedback: "Clean formatting that is ATS-friendly. Good use of standard section headings and consistent bullet points.",
        issues: []
      },
      content: {
        score: 80,
        feedback: "Strong achievement statements with quantifiable results. Experience section is well detailed.",
        strengths: ["Quantified achievements", "Specific technologies mentioned", "Chronological order", "Clear role descriptions"],
        improvements: ["Consider adding more specific project outcomes", "Make sure all acronyms are spelled out at least once"]
      },
      sections: {
        score: 75,
        feedback: "All essential sections included. Consider adding a Skills Summary section at the top for immediate keyword scanning.",
        missingRecommendedSections: ["Skills Summary/Highlights section at the top"]
      },
      jobMatch: {
        title: "Senior Frontend Developer",
        company: "TechCorp Inc.",
        matchScore: 87,
        feedback: "Your resume is well-matched to this job. The job requires React.js experience with performance optimization, which you've highlighted well."
      }
    },
    improvementSuggestions: [
      "Add a Skills Summary section at the top of your resume",
      "Include more specific React ecosystem technologies",
      "Mention experience with specific testing methodologies in more detail",
      "Add metrics to your project achievements where possible",
      "Consider tailoring your summary more specifically to each job application"
    ]
  },
  
  // Resume versions (for A/B testing different versions)
  versions: [
    {
      id: 1,
      name: "General Technical",
      createdDate: "2023-10-15",
      template: "Professional",
      colorScheme: "Blue Professional",
      targetRole: "Frontend Developer",
      lastUsed: "2023-11-20",
      applications: 5,
      interviews: 2,
      feedbackScore: 85
    },
    {
      id: 2,
      name: "React Specialist",
      createdDate: "2023-11-05",
      template: "Tech",
      colorScheme: "Cyber Tech",
      targetRole: "React Developer",
      lastUsed: "2023-12-01",
      applications: 3,
      interviews: 1,
      feedbackScore: 88
    },
    {
      id: 3,
      name: "Leadership Focused",
      createdDate: "2023-11-25",
      template: "Executive",
      colorScheme: "Navy Executive",
      targetRole: "Frontend Team Lead",
      lastUsed: "2023-12-08",
      applications: 2,
      interviews: 1,
      feedbackScore: 82
    }
  ],
  
  // Resume progress and completion tracking
  progressTracker: {
    overallCompletion: 85,
    sections: {
      personalInfo: { completed: true, score: 100 },
      summary: { completed: true, score: 90 },
      experience: { completed: true, score: 95 },
      education: { completed: true, score: 100 },
      skills: { completed: true, score: 85 },
      projects: { completed: true, score: 80 },
      certifications: { completed: true, score: 100 },
      volunteer: { completed: true, score: 75 },
      awards: { completed: true, score: 70 },
      publications: { completed: true, score: 65 }
    },
    improvementAreas: [
      { section: "skills", suggestion: "Add more specific technical skills relevant to your target roles" },
      { section: "projects", suggestion: "Include more quantifiable outcomes for each project" },
      { section: "publications", suggestion: "Add more details about your writing contributions" },
      { section: "volunteer", suggestion: "Connect volunteer experience more clearly to professional skills" }
    ],
    lastUpdated: "2023-12-08"
  },
  
  // Industry-specific resume tips
  industryTips: {
    technology: [
      "Focus on specific programming languages and technical skills",
      "Include relevant certifications and technical training",
      "Highlight specific achievements with metrics (e.g., improved performance by X%)",
      "Include links to portfolio, GitHub, or technical projects",
      "List specific methodologies you're familiar with (Agile, Scrum, etc.)"
    ],
    design: [
      "Include a link to your portfolio",
      "Highlight specific design tools and software proficiency",
      "Showcase a range of projects across different mediums",
      "Mention specific design methodologies (e.g., Design Thinking, User-Centered Design)",
      "Include metrics on how your designs improved user engagement or conversion"
    ],
    marketing: [
      "Highlight campaigns with specific metrics (ROI, conversion rates, etc.)",
      "Showcase familiarity with marketing tools and platforms",
      "Demonstrate understanding of analytics and data-driven decision making",
      "Include examples of content creation and copywriting",
      "Highlight experience with different marketing channels (social, email, SEO, etc.)"
    ],
    finance: [
      "Emphasize relevant certifications (CPA, CFA, etc.)",
      "Use industry-specific terminology correctly",
      "Highlight experience with specific financial software or systems",
      "Include quantifiable achievements (portfolio performance, cost savings, etc.)",
      "Demonstrate regulatory knowledge and compliance experience"
    ]
  }
};

export default mockResumeData; 