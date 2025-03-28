/**
 * Mock data for skills assessment and recommendations
 */

const mockSkillsData = {
  // User's current assessed skills
  userSkills: [
    {
      name: "JavaScript",
      level: 85,
      dateAssessed: "2023-11-10",
      verified: true,
      badges: ["Advanced", "Test Passed"],
      endorsements: 8,
      relatedProjects: ["E-commerce Website", "Dashboard UI"],
      assessmentScore: 87
    },
    {
      name: "React.js",
      level: 80,
      dateAssessed: "2023-11-12",
      verified: true,
      badges: ["Advanced", "Test Passed"],
      endorsements: 6,
      relatedProjects: ["E-commerce Website", "Task Management App"],
      assessmentScore: 82
    },
    {
      name: "HTML/CSS",
      level: 90,
      dateAssessed: "2023-11-05",
      verified: true,
      badges: ["Expert", "Test Passed"],
      endorsements: 12,
      relatedProjects: ["Corporate Website", "Portfolio Site"],
      assessmentScore: 92
    },
    {
      name: "Node.js",
      level: 65,
      dateAssessed: "2023-11-15",
      verified: false,
      badges: ["Intermediate"],
      endorsements: 3,
      relatedProjects: ["RESTful API", "Authentication System"],
      assessmentScore: 68
    },
    {
      name: "Python",
      level: 60,
      dateAssessed: "2023-11-20",
      verified: false,
      badges: ["Intermediate"],
      endorsements: 2,
      relatedProjects: ["Data Analysis Tool", "Web Scraper"],
      assessmentScore: 62
    },
    {
      name: "SQL",
      level: 75,
      dateAssessed: "2023-11-18",
      verified: false,
      badges: ["Advanced"],
      endorsements: 4,
      relatedProjects: ["Database Design", "Reporting System"],
      assessmentScore: 78
    },
    {
      name: "Git",
      level: 85,
      dateAssessed: "2023-11-08",
      verified: true,
      badges: ["Advanced", "Test Passed"],
      endorsements: 7,
      relatedProjects: ["Open Source Contributions", "Version Control Workshop"],
      assessmentScore: 88
    },
    {
      name: "Redux",
      level: 70,
      dateAssessed: "2023-11-14",
      verified: false,
      badges: ["Intermediate"],
      endorsements: 3,
      relatedProjects: ["E-commerce Website", "Dashboard UI"],
      assessmentScore: 72
    },
    {
      name: "Docker",
      level: 40,
      dateAssessed: "2023-11-25",
      verified: false,
      badges: ["Beginner"],
      endorsements: 1,
      relatedProjects: ["Containerized App"],
      assessmentScore: 45
    }
  ],
  
  // Skills recommended for development
  recommendedSkills: [
    {
      name: "TypeScript",
      reason: "Complements your JavaScript skills and improves code quality",
      priority: "high",
      timeToLearn: "1-2 months",
      demandLevel: "Very High",
      jobRelevance: 87,
      resources: [
        { type: "course", title: "TypeScript Fundamentals", provider: "Udemy", url: "https://example.com/typescript-course" },
        { type: "documentation", title: "TypeScript Handbook", provider: "TypeScript", url: "https://example.com/typescript-docs" },
        { type: "project", title: "Convert JavaScript Project to TypeScript", description: "Practice by converting one of your existing projects" }
      ]
    },
    {
      name: "AWS",
      reason: "High demand in your target roles",
      priority: "medium",
      timeToLearn: "2-3 months",
      demandLevel: "Very High",
      jobRelevance: 82,
      resources: [
        { type: "certification", title: "AWS Certified Cloud Practitioner", provider: "AWS", url: "https://example.com/aws-certification" },
        { type: "course", title: "AWS for Frontend Developers", provider: "Pluralsight", url: "https://example.com/aws-frontend" },
        { type: "project", title: "Deploy React App to AWS", description: "Practice deploying a React application to AWS S3 and CloudFront" }
      ]
    },
    {
      name: "GraphQL",
      reason: "Trending in web development and complements your React skills",
      priority: "medium",
      timeToLearn: "1-2 months",
      demandLevel: "High",
      jobRelevance: 75,
      resources: [
        { type: "course", title: "GraphQL for React Developers", provider: "Frontend Masters", url: "https://example.com/graphql-course" },
        { type: "documentation", title: "Apollo Client Documentation", provider: "Apollo", url: "https://example.com/apollo-docs" },
        { type: "project", title: "Convert RESTful API to GraphQL", description: "Convert an existing REST API project to use GraphQL" }
      ]
    },
    {
      name: "Kubernetes",
      reason: "Builds on your Docker knowledge and highly demanded for DevOps roles",
      priority: "low",
      timeToLearn: "3-4 months",
      demandLevel: "High",
      jobRelevance: 65,
      resources: [
        { type: "course", title: "Kubernetes for Developers", provider: "LinkedIn Learning", url: "https://example.com/kubernetes-course" },
        { type: "documentation", title: "Kubernetes Documentation", provider: "Kubernetes", url: "https://example.com/kubernetes-docs" },
        { type: "project", title: "Deploy Containerized App with Kubernetes", description: "Practice deploying your Docker containers with Kubernetes" }
      ]
    },
    {
      name: "Testing (Jest/React Testing Library)",
      reason: "Enhance your React development skills with proper testing knowledge",
      priority: "high",
      timeToLearn: "1 month",
      demandLevel: "High",
      jobRelevance: 85,
      resources: [
        { type: "course", title: "Testing React Applications", provider: "TestingJavaScript", url: "https://example.com/testing-react" },
        { type: "documentation", title: "Jest Documentation", provider: "Jest", url: "https://example.com/jest-docs" },
        { type: "project", title: "Add Tests to Existing React App", description: "Add comprehensive tests to one of your existing React projects" }
      ]
    }
  ],
  
  // Available skill assessments
  assessments: [
    {
      id: 1,
      skillName: "JavaScript",
      levelTested: "Intermediate to Advanced",
      questions: 25,
      timeLimit: 45, // minutes
      passingScore: 70,
      description: "Tests knowledge of ES6+ features, closures, promises, async/await, and functional programming concepts."
    },
    {
      id: 2,
      skillName: "React.js",
      levelTested: "Intermediate to Advanced",
      questions: 20,
      timeLimit: 40, // minutes
      passingScore: 70,
      description: "Tests knowledge of React hooks, context API, performance optimization, and component patterns."
    },
    {
      id: 3,
      skillName: "HTML/CSS",
      levelTested: "Beginner to Advanced",
      questions: 30,
      timeLimit: 45, // minutes
      passingScore: 75,
      description: "Tests knowledge of semantic HTML, CSS layouts, Flexbox, Grid, responsive design, and animations."
    },
    {
      id: 4,
      skillName: "Node.js",
      levelTested: "Intermediate",
      questions: 25,
      timeLimit: 40, // minutes
      passingScore: 70,
      description: "Tests knowledge of Node.js architecture, Express.js, middleware, routing, and error handling."
    },
    {
      id: 5,
      skillName: "Python",
      levelTested: "Beginner to Intermediate",
      questions: 30,
      timeLimit: 45, // minutes
      passingScore: 65,
      description: "Tests knowledge of Python syntax, data structures, functions, OOP concepts, and basic libraries."
    },
    {
      id: 6,
      skillName: "SQL",
      levelTested: "Intermediate",
      questions: 25,
      timeLimit: 40, // minutes
      passingScore: 70,
      description: "Tests knowledge of SQL queries, joins, indexes, transactions, and database design principles."
    },
    {
      id: 7,
      skillName: "TypeScript",
      levelTested: "Intermediate",
      questions: 20,
      timeLimit: 35, // minutes
      passingScore: 70,
      description: "Tests knowledge of TypeScript types, interfaces, generics, and advanced type concepts."
    },
    {
      id: 8,
      skillName: "AWS",
      levelTested: "Beginner to Intermediate",
      questions: 30,
      timeLimit: 45, // minutes
      passingScore: 65,
      description: "Tests knowledge of AWS services like S3, EC2, Lambda, and basic cloud architecture concepts."
    },
    {
      id: 9,
      skillName: "Docker",
      levelTested: "Beginner to Intermediate",
      questions: 20,
      timeLimit: 30, // minutes
      passingScore: 65,
      description: "Tests knowledge of Docker concepts, Dockerfile creation, container management, and basic orchestration."
    },
    {
      id: 10,
      skillName: "GraphQL",
      levelTested: "Intermediate",
      questions: 20,
      timeLimit: 35, // minutes
      passingScore: 70,
      description: "Tests knowledge of GraphQL schemas, queries, mutations, and integration with frontend frameworks."
    }
  ],
  
  // Sample practical code challenge for skill assessment
  codeChallenge: {
    id: 101,
    title: "React Component Challenge",
    difficulty: "Intermediate",
    timeLimit: 90, // minutes
    requirements: [
      "Create a React component for a todo list",
      "Implement adding, editing, and removing todos",
      "Use local state management with hooks",
      "Style the component appropriately",
      "Implement filtering (All, Active, Completed)"
    ],
    starterCode: `
import React from 'react';
import './TodoList.css';

const TodoList = () => {
  // Implement your solution here
  
  return (
    <div className="todo-container">
      <h1>Todo List</h1>
      {/* Implement your UI here */}
    </div>
  );
};

export default TodoList;
    `,
    testCases: [
      "Should render the component without errors",
      "Should add a new todo when submitted",
      "Should toggle todo completion status when clicked",
      "Should remove a todo when delete button is clicked",
      "Should edit a todo when edit is confirmed",
      "Should filter todos based on filter selection"
    ],
    resources: [
      { title: "React Hooks Documentation", url: "https://example.com/react-hooks" },
      { title: "Todo List Pattern Examples", url: "https://example.com/todo-patterns" }
    ]
  },
  
  // Learning paths for skill development
  learningPaths: [
    {
      id: 1,
      title: "Frontend Developer Path",
      description: "Comprehensive path to become a proficient frontend developer",
      timeEstimate: "3-6 months",
      targetLevel: "Intermediate to Advanced",
      skills: [
        {
          name: "HTML/CSS",
          modules: [
            { title: "HTML5 Fundamentals", duration: "1 week" },
            { title: "CSS3 and Responsive Design", duration: "2 weeks" },
            { title: "CSS Frameworks (Tailwind/Bootstrap)", duration: "1 week" },
            { title: "CSS Animations and Transitions", duration: "1 week" }
          ]
        },
        {
          name: "JavaScript",
          modules: [
            { title: "JavaScript Fundamentals", duration: "2 weeks" },
            { title: "DOM Manipulation", duration: "1 week" },
            { title: "ES6+ Features", duration: "1 week" },
            { title: "Asynchronous JavaScript", duration: "1 week" }
          ]
        },
        {
          name: "React.js",
          modules: [
            { title: "React Fundamentals", duration: "2 weeks" },
            { title: "React Hooks", duration: "1 week" },
            { title: "State Management", duration: "2 weeks" },
            { title: "React Performance Optimization", duration: "1 week" }
          ]
        },
        {
          name: "Additional Skills",
          modules: [
            { title: "TypeScript Basics", duration: "2 weeks" },
            { title: "Testing in React", duration: "2 weeks" },
            { title: "Frontend Build Tools", duration: "1 week" },
            { title: "Web Accessibility", duration: "1 week" }
          ]
        }
      ],
      projects: [
        { title: "Personal Portfolio Website", duration: "2 weeks", difficulty: "Beginner" },
        { title: "Interactive Dashboard", duration: "3 weeks", difficulty: "Intermediate" },
        { title: "E-commerce Website", duration: "4 weeks", difficulty: "Advanced" }
      ],
      resources: [
        { type: "course", title: "Frontend Development Bootcamp", provider: "Udemy", url: "https://example.com/frontend-bootcamp" },
        { type: "book", title: "Frontend Developer Handbook", author: "Frontend Masters", url: "https://example.com/frontend-book" },
        { type: "community", title: "Frontend Developers Community", url: "https://example.com/frontend-community" }
      ]
    },
    {
      id: 2,
      title: "Full Stack Developer Path",
      description: "Comprehensive path to become a proficient full stack developer",
      timeEstimate: "6-9 months",
      targetLevel: "Intermediate to Advanced",
      skills: [
        {
          name: "Frontend Skills",
          modules: [
            { title: "HTML/CSS Fundamentals", duration: "2 weeks" },
            { title: "JavaScript Essentials", duration: "2 weeks" },
            { title: "React.js Development", duration: "4 weeks" }
          ]
        },
        {
          name: "Backend Skills",
          modules: [
            { title: "Node.js Fundamentals", duration: "2 weeks" },
            { title: "Express.js Framework", duration: "2 weeks" },
            { title: "RESTful API Design", duration: "2 weeks" },
            { title: "Authentication & Authorization", duration: "1 week" }
          ]
        },
        {
          name: "Database Skills",
          modules: [
            { title: "SQL Fundamentals", duration: "2 weeks" },
            { title: "MongoDB Basics", duration: "2 weeks" },
            { title: "Database Design", duration: "1 week" },
            { title: "ORM/ODM Tools", duration: "1 week" }
          ]
        },
        {
          name: "DevOps Basics",
          modules: [
            { title: "Git & GitHub", duration: "1 week" },
            { title: "Docker Basics", duration: "2 weeks" },
            { title: "Deployment Strategies", duration: "1 week" },
            { title: "CI/CD Introduction", duration: "1 week" }
          ]
        }
      ],
      projects: [
        { title: "Full Stack Blog Platform", duration: "3 weeks", difficulty: "Intermediate" },
        { title: "Social Media Application", duration: "4 weeks", difficulty: "Intermediate" },
        { title: "E-commerce Platform", duration: "6 weeks", difficulty: "Advanced" }
      ],
      resources: [
        { type: "course", title: "The Complete Full Stack Web Developer Course", provider: "Coursera", url: "https://example.com/fullstack-course" },
        { type: "book", title: "Full Stack Development: The Complete Guide", author: "Tech Publishing", url: "https://example.com/fullstack-book" },
        { type: "community", title: "Full Stack Developers Hub", url: "https://example.com/fullstack-community" }
      ]
    }
  ],
  
  // Skill badges and achievements
  badges: [
    {
      id: 1,
      name: "JavaScript Master",
      description: "Awarded for achieving advanced proficiency in JavaScript",
      requirements: "Score 85% or higher on the JavaScript assessment",
      image: "https://placehold.co/100x100?text=JS+Master",
      earnedDate: "2023-11-10",
      xpAwarded: 300
    },
    {
      id: 2,
      name: "React Developer",
      description: "Awarded for demonstrating strong React.js skills",
      requirements: "Score 80% or higher on the React.js assessment",
      image: "https://placehold.co/100x100?text=React+Dev",
      earnedDate: "2023-11-12",
      xpAwarded: 250
    },
    {
      id: 3,
      name: "CSS Wizard",
      description: "Awarded for exceptional CSS and design skills",
      requirements: "Score 90% or higher on the HTML/CSS assessment",
      image: "https://placehold.co/100x100?text=CSS+Wizard",
      earnedDate: "2023-11-05",
      xpAwarded: 200
    },
    {
      id: 4,
      name: "Git Contributor",
      description: "Awarded for demonstrating proficiency with Git",
      requirements: "Score 85% or higher on the Git assessment",
      image: "https://placehold.co/100x100?text=Git+Pro",
      earnedDate: "2023-11-08",
      xpAwarded: 150
    },
    {
      id: 5,
      name: "Project Completer",
      description: "Awarded for completing your first project assessment",
      requirements: "Successfully complete a practical project assessment",
      image: "https://placehold.co/100x100?text=Project",
      earnedDate: "2023-10-20",
      xpAwarded: 200
    },
    {
      id: 6,
      name: "Learning Enthusiast",
      description: "Awarded for consistent learning activities",
      requirements: "Complete at least 10 learning modules",
      image: "https://placehold.co/100x100?text=Learner",
      earnedDate: "2023-10-15",
      xpAwarded: 100
    }
  ],
  
  // Skill market insights
  marketInsights: {
    topPayingSkills: [
      { skill: "AWS", avgSalaryIncrease: "+15%", demandTrend: "Increasing" },
      { skill: "React Native", avgSalaryIncrease: "+12%", demandTrend: "Stable" },
      { skill: "GraphQL", avgSalaryIncrease: "+10%", demandTrend: "Increasing" },
      { skill: "TypeScript", avgSalaryIncrease: "+8%", demandTrend: "Rapidly Increasing" },
      { skill: "Kubernetes", avgSalaryIncrease: "+18%", demandTrend: "Increasing" }
    ],
    risingSkills: [
      { skill: "Next.js", growthRate: "+45% year over year", adoption: "Medium" },
      { skill: "Svelte", growthRate: "+60% year over year", adoption: "Low-Medium" },
      { skill: "WebAssembly", growthRate: "+35% year over year", adoption: "Low" },
      { skill: "Tailwind CSS", growthRate: "+90% year over year", adoption: "Medium-High" },
      { skill: "Blockchain Development", growthRate: "+25% year over year", adoption: "Low" }
    ],
    skillGaps: {
      frontend: ["TypeScript", "Testing", "Accessibility", "Performance Optimization"],
      backend: ["Kubernetes", "GraphQL", "Microservices Architecture", "Security"],
      fullstack: ["CI/CD", "Cloud Services", "System Design", "Performance Monitoring"]
    },
    industryTrends: [
      { trend: "Increased focus on performance and core web vitals", impact: "Greater emphasis on optimization skills" },
      { trend: "Rise of JAMstack architecture", impact: "Growing demand for static site generators and headless CMS knowledge" },
      { trend: "AI integration in development workflows", impact: "Need for AI/ML integration skills" },
      { trend: "Stronger emphasis on accessibility", impact: "WCAG knowledge becoming essential" }
    ]
  }
};

export default mockSkillsData; 