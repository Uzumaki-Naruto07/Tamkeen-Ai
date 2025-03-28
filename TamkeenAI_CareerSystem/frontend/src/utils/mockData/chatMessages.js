/**
 * Mock data for AI coach chat messages
 */

const mockChatMessages = {
  // Default welcome messages when starting a new chat
  welcomeMessages: [
    {
      id: "welcome-1",
      content: "Hello! I'm your AI Career Coach. How can I help you today with your career journey?",
      sender: "ai",
      timestamp: new Date().toISOString(),
    },
    {
      id: "welcome-2",
      content: "I can assist with resume feedback, interview preparation, job search strategy, skill development recommendations, and more.",
      sender: "ai",
      timestamp: new Date().toISOString(),
    }
  ],
  
  // Sample chat history for development and testing
  sampleConversations: {
    "resume-feedback": [
      {
        id: "user-1",
        content: "Can you review my resume and give me some feedback?",
        sender: "user",
        timestamp: "2023-12-08T14:30:00"
      },
      {
        id: "ai-1",
        content: "I'd be happy to review your resume. To provide meaningful feedback, I'll need to see your current resume. You can upload it here, or tell me more about its current structure and content.",
        sender: "ai",
        timestamp: "2023-12-08T14:30:15"
      },
      {
        id: "user-2",
        content: "I'm a software developer with 3 years of experience. My resume focuses on my React and Node.js projects. I'm concerned that it's not getting through ATS systems.",
        sender: "user",
        timestamp: "2023-12-08T14:31:30"
      },
      {
        id: "ai-2",
        content: "Thanks for sharing that. For ATS optimization, here are some suggestions:\n\n1. Include specific keywords from job descriptions you're targeting\n2. Use a clean, simple format without complex tables or graphics\n3. Match your job titles to industry-standard ones\n4. Quantify achievements where possible\n5. Include a skills section with relevant technical skills\n\nWould you like more specific advice on any of these areas?",
        sender: "ai",
        timestamp: "2023-12-08T14:32:00"
      }
    ],
    
    "interview-prep": [
      {
        id: "user-1",
        content: "I have a frontend developer interview next week. Can you help me prepare?",
        sender: "user",
        timestamp: "2023-12-09T10:15:00"
      },
      {
        id: "ai-1",
        content: "Definitely! I can help you prepare for your frontend developer interview. What specific areas would you like to focus on? Technical questions, behavioral questions, or something else?",
        sender: "ai",
        timestamp: "2023-12-09T10:15:20"
      },
      {
        id: "user-2",
        content: "I'm most worried about the technical questions related to React.",
        sender: "user",
        timestamp: "2023-12-09T10:16:10"
      },
      {
        id: "ai-2",
        content: "Great, let's focus on React technical questions. Here are some common topics you should be prepared for:\n\n1. Component lifecycle methods\n2. Hooks (useState, useEffect, useContext, etc.)\n3. State management (Redux, Context API)\n4. Performance optimization\n5. Virtual DOM and reconciliation\n\nWould you like me to provide sample questions for any of these topics?",
        sender: "ai",
        timestamp: "2023-12-09T10:17:00"
      },
      {
        id: "user-3",
        content: "Yes, please give me some questions about hooks and performance optimization.",
        sender: "user",
        timestamp: "2023-12-09T10:18:30"
      },
      {
        id: "ai-3",
        content: "Here are some React hooks and performance optimization questions:\n\n**React Hooks:**\n1. Explain the purpose of useState and useEffect hooks.\n2. What's the difference between useEffect with an empty dependency array, no dependency array, and a populated dependency array?\n3. How would you create a custom hook and what are good use cases for it?\n4. How does useContext work and when would you use it?\n\n**Performance Optimization:**\n1. How does React.memo work and when would you use it?\n2. Explain the purpose of useMemo and useCallback hooks.\n3. What are common causes of performance issues in React applications?\n4. How would you optimize a component that renders a large list?\n\nWould you like me to provide sample answers for any of these?",
        sender: "ai",
        timestamp: "2023-12-09T10:19:45"
      }
    ],
    
    "career-change": [
      {
        id: "user-1",
        content: "I'm considering switching from backend to frontend development. What skills should I focus on?",
        sender: "user",
        timestamp: "2023-12-10T16:20:00"
      },
      {
        id: "ai-1",
        content: "Transitioning from backend to frontend development is a common path! Here are the key skills you should focus on:\n\n**Essential Skills:**\n1. HTML/CSS - Master the fundamentals of structure and styling\n2. JavaScript - Deepen your knowledge beyond backend JS\n3. React, Vue, or Angular - At least one modern framework (React is most in-demand)\n4. Responsive design principles\n5. Browser DevTools\n\n**Additional Valuable Skills:**\n1. TypeScript\n2. State management (Redux, Context API, etc.)\n3. CSS preprocessors (SASS/SCSS)\n4. CSS frameworks (Tailwind, Bootstrap)\n5. Testing frameworks (Jest, React Testing Library)\n\nWhat's your current level of experience with these technologies?",
        sender: "ai",
        timestamp: "2023-12-10T16:21:30"
      },
      {
        id: "user-2",
        content: "I know basic HTML/CSS and JavaScript from my backend work, but I haven't used any frontend frameworks. Where should I start?",
        sender: "user",
        timestamp: "2023-12-10T16:23:00"
      },
      {
        id: "ai-2",
        content: "That's a great starting point! Here's a structured learning path I recommend:\n\n1. **First month:** Strengthen your HTML/CSS foundations\n   - Complete a comprehensive HTML/CSS course\n   - Build at least 3-5 responsive static websites\n   - Learn Flexbox and CSS Grid thoroughly\n\n2. **Second month:** Modern JavaScript\n   - Focus on ES6+ features\n   - Learn DOM manipulation without frameworks\n   - Study asynchronous JavaScript (Promises, async/await)\n\n3. **Third month and beyond:** React (recommended framework for beginners)\n   - Start with React fundamentals\n   - Build progressively complex projects\n   - Add state management as you advance\n\nShould I recommend specific courses or resources for any of these areas?",
        sender: "ai",
        timestamp: "2023-12-10T16:25:00"
      }
    ]
  },
  
  // Suggested questions/prompts to help users
  suggestedPrompts: {
    general: [
      "How can I improve my resume?",
      "What skills are in demand for my field?",
      "How should I prepare for my upcoming interview?",
      "Can you help me with salary negotiation?",
      "What career path should I consider with my background?"
    ],
    resumeBuilder: [
      "How can I highlight my achievements better?",
      "What keywords should I include for ATS optimization?",
      "How should I explain this gap in my employment?",
      "What's the ideal resume length for my experience level?",
      "How can I tailor my resume for a specific job posting?"
    ],
    interview: [
      "What are common behavioral questions for my role?",
      "How should I answer 'What's your greatest weakness?'",
      "What questions should I ask the interviewer?",
      "How can I prepare for a technical interview?",
      "What should I wear to my interview?"
    ],
    jobSearch: [
      "How can I find unadvertised job opportunities?",
      "What should I include in my cover letter?",
      "How can I leverage LinkedIn for my job search?",
      "What's the best follow-up strategy after an interview?",
      "How can I stand out among other applicants?"
    ],
    skillDevelopment: [
      "What skills should I develop for career advancement?",
      "How can I demonstrate my new skills to employers?",
      "What certifications are valuable in my field?",
      "How can I find time to learn new skills while working?",
      "What learning resources do you recommend for this skill?"
    ]
  },
  
  // Responses for recommendation context
  recommendationResponses: {
    job: {
      initial: "I've recommended this job because it closely matches your skills and career goals. Would you like me to explain why this is a good fit for you?",
      detailed: "This job aligns with your experience in [relevant skill] and your interest in [industry/field]. The company culture also seems to match your preferences for [work environment factor]. The role offers growth opportunities in [career direction] which you mentioned as important to you."
    },
    course: {
      initial: "This course would help you develop skills in [subject], which is valuable for your career path. Would you like to know more about how this could benefit you?",
      detailed: "Learning [subject] through this course would enhance your profile for roles like [job title]. The skills taught are in demand, with [X]% of relevant job postings mentioning them. This would complement your existing expertise in [related skill]."
    },
    skill: {
      initial: "Developing this skill would significantly increase your marketability. Would you like to understand why this skill is particularly valuable for your career path?",
      detailed: "This skill appears in [X]% of job descriptions for [role] positions. Your background in [related experience] provides a good foundation to build upon. Mastering this would address the gap between your current profile and your target roles."
    }
  }
};

export default mockChatMessages; 