import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Chip, Card, CardContent, IconButton, Avatar,
  List, ListItem, ListItemText, ListItemButton,
  CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, Tooltip, Grid,
  Accordion, AccordionSummary, AccordionDetails,
  Menu, MenuItem, InputAdornment, Tabs, Tab,
  Snackbar, Badge, LinearProgress, Fab, Container,
  Select, FormControl, InputLabel, FormHelperText,
  Rating, Stack, Stepper, Step, StepLabel, Autocomplete,
  FormControlLabel, Switch, Collapse
} from '@mui/material';
import {
  Send, Psychology, QuestionAnswer, Save,
  ContentCopy, Download, Mic, MicOff, 
  RecordVoiceOver, QuestionMark, ArrowForward,
  FormatQuote, CheckCircle, Cancel, Error,
  Refresh, ExpandMore, Info, Star, StarBorder,
  PlayArrow, Pause, Stop, NavigateNext, NavigateBefore,
  MoreVert, Sort, FormatListBulleted, Category,
  Search, ThumbUp, ThumbDown, BusinessCenter,
  VideoLibrary, School, Assignment, Lightbulb,
  AccessTime, EmojiEmotions, FilterList,
  Brush, TipsAndUpdates, SportsScore, LocalLibrary,
  Shield, Explore, EmojiEvents, FlagCircle, Timer,
  BarChart, AddTask, TaskAlt, ExpandLess, VolumeUp,
  PeopleAlt, Code, Public, Face, Business, Chat
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AIRecommendationCard from '../components/ai/AIRecommendationCard';

// Add mock endpoints
if (!apiEndpoints.interviews) {
  apiEndpoints.interviews = {
    createOrLoadConversation: async (userId) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/interviews/conversation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
        return await response.json();
      } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }
    },
    getPreviousConversations: async (userId) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/interviews/conversations/${userId}`);
        return await response.json();
      } catch (error) {
        console.error('Error fetching previous conversations:', error);
        throw error;
      }
    },
    getInterviewTopics: async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/interviews/topics`);
        return await response.json();
      } catch (error) {
        console.error('Error fetching interview topics:', error);
        throw error;
      }
    },
    getSuggestedQuestions: async (userId) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/interviews/suggested-questions/${userId}`);
        return await response.json();
      } catch (error) {
        console.error('Error fetching suggested questions:', error);
        throw error;
      }
    },
    sendMessage: async (conversationId, message) => {
      try {
        // Determine if this is an AI Assistant mode request
        const isAIAssistant = message.mode === 'ai_assistant';
        
        // If in AI assistant mode, use a more capable endpoint
        const endpoint = isAIAssistant 
          ? `${process.env.REACT_APP_API_URL}/api/ai/chat` 
          : `${process.env.REACT_APP_API_URL}/api/interviews/message`;
        
        // Prepare request body based on mode
        const requestBody = isAIAssistant 
          ? {
              message: message.message,
              userId: message.userId,
              model: 'deepseek', // Always use deepseek for AI assistant
              systemPrompt: "You are a helpful AI assistant that can answer any question on any topic. Provide detailed, accurate information.",
            }
          : { 
              conversationId, 
              message 
            };
            
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        return await response.json();
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    loadConversation: async (convoId) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/interviews/conversation/${convoId}`);
        return await response.json();
      } catch (error) {
        console.error('Error loading conversation:', error);
        throw error;
      }
    },
    createConversation: async (userId) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/interviews/conversation/new`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
        return await response.json();
      } catch (error) {
        console.error('Error creating new conversation:', error);
        throw error;
      }
    },
    getCategoryQuestions: async (categoryId) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/interviews/category-questions/${categoryId}`);
        return await response.json();
      } catch (error) {
        console.error('Error fetching category questions:', error);
        throw error;
      }
    },
    createMockInterview: async (setupData) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/interviews/mock-interview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(setupData),
        });
        return await response.json();
      } catch (error) {
        console.error('Error creating mock interview:', error);
        throw error;
      }
    },
    createMockInterviewSetup: async (mockInterviewId, setupData) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/interviews/mock-interview-setup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mockInterviewId, ...setupData }),
        });
        return await response.json();
      } catch (error) {
        console.error('Error setting up mock interview:', error);
        throw error;
      }
    },
    getPremiumFeedback: async (data) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/interviews/premium-feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        return await response.json();
      } catch (error) {
        console.error('Error getting premium feedback:', error);
        throw error;
      }
    },
    saveFeedbackToDashboard: async (data) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/interviews/save-feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        return await response.json();
      } catch (error) {
        console.error('Error saving feedback:', error);
        throw error;
      }
    },
    getRoleFitAnalysis: async (data) => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/interviews/role-fit-analysis`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        return await response.json();
      } catch (error) {
        console.error('Error getting role fit analysis:', error);
        throw error;
      }
    }
  };
}

// Add coach personas data
const coachPersonas = [
  {
    id: 'noora',
    name: 'NooraGPT',
    title: 'Government Sector Interview Specialist 🇦🇪',
    avatar: '/avatars/noora-professional.png',
    description: 'Specializes in UAE government hiring practices and Emiratization policies.',
    experience: [
      '10+ years in UAE public sector recruitment',
      'Former HR Director at Ministry of Human Resources',
      'Expert in Emiratization policy implementation'
    ],
    greeting: 'Al salam alaikum! I\'m Noora, your UAE government sector interview specialist. With 10+ years of experience in public sector recruitment, I\'m here to help you prepare for your government career journey. How can I assist you today?',
    tips: [
      'Government roles in the UAE often value cultural understanding and bilingual skills.',
      'Emiratization policies give UAE nationals priority in certain positions.',
      'UAE government interviews may focus on your alignment with national vision and values.'
    ]
  },
  {
    id: 'ahmed',
    name: 'AhmedGPT',
    title: 'Tech Industry Senior Manager',
    avatar: '/avatars/ahmed-tech.png',
    description: 'Tech-focused interview coach with expertise in programming and system design.',
    experience: [
      'Former CTO at Dubai Technology Partners',
      '15+ years leading tech teams across MENA region',
      'AI and machine learning implementation specialist'
    ],
    greeting: 'Marhaba! I\'m Ahmed, your tech industry interview guide. With over 15 years of leadership experience in tech companies across the MENA region, I\'m here to prepare you for technical and managerial interviews. How can I help you showcase your technical skills today?',
    tips: [
      'UAE tech roles often require both technical excellence and cultural adaptability.',
      'Be prepared to discuss your experience with regional tech challenges.',
      'Knowledge of Arabic can be advantageous in tech roles with client-facing components.'
    ]
  },
  {
    id: 'fatima',
    name: 'FatimaGPT',
    title: 'Female Empowerment & Career Strategist',
    avatar: '/avatars/fatima.png',
    description: 'Specializes in helping women navigate career opportunities in the UAE.',
    experience: [
      'Founder of Women in UAE Leadership program',
      'Professional career coach for executive women',
      'Former Director of Diversity & Inclusion at multinational firm'
    ],
    greeting: 'Ahlan wa sahlan! I\'m Fatima, dedicated to empowering women in their UAE career journeys. As the founder of Women in UAE Leadership program, I specialize in helping you navigate interview processes with confidence. How can I support your preparation today?',
    tips: [
      'The UAE has strong initiatives supporting women in leadership roles.',
      'Consider highlighting your adaptability to multicultural work environments.',
      'Achievements that show independence and leadership are particularly valuable.'
    ]
  },
  {
    id: 'zayd',
    name: 'ZaydGPT',
    title: 'AI-driven Logic and Brainy Questions Bot',
    avatar: '/avatars/zayd.png',
    description: 'Analytical and thorough interviewer focused on problem-solving skills.',
    experience: [
      'Advanced AI system trained on 10,000+ technical interviews',
      'Logic and problem-solving assessment specialist',
      'Expert in quantitative and qualitative candidate evaluation'
    ],
    greeting: 'As-salamu alaykum. I am Zayd, designed to challenge your analytical thinking and problem-solving abilities. My database contains questions from thousands of technical interviews across multiple industries. How would you like to test your interview skills today?',
    tips: [
      'Logical thinking and analytical skills are highly valued across UAE industries.',
      'Be prepared for scenario-based questions that test your decision-making.',
      'Quantify your achievements with data when possible.'
    ]
  }
];

// UAE-specific cultural context and tips by sector
const uaeCulturalContext = {
  general: [
    'In the UAE market, showcasing adaptability and multilingual communication can make a difference.',
    'Understanding of UAE Vision 2030 can demonstrate your alignment with national goals.',
    'Highlighting experience with diverse teams shows cultural adaptability valued in the UAE.'
  ],
  government: [
    'Knowledge of UAE government structures and Emiratization policies is valuable.',
    'Highlighting Arabic language skills can be advantageous for government positions.',
    'Understanding of UAE Vision 2030 and national priorities is important.'
  ],
  tech: [
    'The UAE is investing heavily in AI, blockchain, and smart city technologies.',
    'Experience with regional tech implementations can set you apart.',
    'Familiarity with UAE tech regulations and compliance may be relevant.'
  ],
  education: [
    'UAE education sector values international experience and multilingual abilities.',
    'Knowledge of UAE educational frameworks and cultural sensitivities is important.',
    'Experience with diverse student populations is highly regarded.'
  ]
};

// Gamified coaching missions data
const coachingMissions = [
  {
    id: 'confidence',
    title: 'Speak with Confidence',
    icon: <Shield />,
    description: 'Complete 3 answers without using filler words like "um," "like," "I think," etc.',
    progress: 0,
    maxProgress: 3,
    reward: 'Confidence Badge',
    completed: false
  },
  {
    id: 'star',
    title: 'Lead the Narrative',
    icon: <Explore />,
    description: 'Tell a full STAR story (Situation, Task, Action, Result) in under 90 seconds',
    progress: 0,
    maxProgress: 1,
    reward: 'Storyteller Badge',
    completed: false
  },
  {
    id: 'quantify',
    title: 'Data-Driven Communicator',
    icon: <BarChart />,
    description: 'Include at least 3 quantifiable achievements in your answers',
    progress: 0,
    maxProgress: 3,
    reward: 'Data Expert Badge',
    completed: false
  }
];

// Behavioral patterns to detect
const behavioralPatterns = [
  {
    id: 'filler',
    pattern: /\b(um|uh|like|you know|sort of|kind of|basically|actually|literally|i think|i guess)\b/gi,
    feedback: "You tend to use filler words like 'um' or 'I think' – consider using more assertive language."
  },
  {
    id: 'negative',
    pattern: /\b(can't|won't|couldn't|wouldn't|never|fail|bad|terrible|horrible|awful|problem|issue|difficult)\b/gi,
    feedback: "Your language includes several negative terms. Try focusing on positive outcomes and solutions instead."
  },
  {
    id: 'passive',
    pattern: /\b(was done|were made|been|is being|are being|was being|were being)\b/gi,
    feedback: "You're using passive voice. Try using active voice to sound more confident and take ownership."
  },
  {
    id: 'vague',
    pattern: /\b(things|stuff|something|good|nice|great|lot|many|several|few)\b/gi,
    feedback: "Try using more specific language instead of vague terms like 'things' or 'stuff'."
  }
];

// Role-play company data
const roleplayCompanies = [
  {
    id: 'adnoc',
    name: 'ADNOC',
    industry: 'Energy',
    logo: '/companies/adnoc.png',
    description: 'Abu Dhabi National Oil Company - major energy producer',
    expectations: [
      'Technical proficiency in petroleum engineering or related fields',
      'Understanding of UAE energy sector and transition goals',
      'Strong safety-first mindset and adherence to protocols'
    ]
  },
  {
    id: 'etisalat',
    name: 'Etisalat (e&)',
    industry: 'Telecommunications',
    logo: '/companies/etisalat.png',
    description: 'Leading telecom provider in UAE and beyond',
    expectations: [
      'Innovation mindset and digital transformation experience',
      'Customer-centric approach to telecom solutions',
      'Adaptability to rapidly changing tech landscape'
    ]
  },
  {
    id: 'emirates',
    name: 'Emirates Group',
    industry: 'Aviation/Hospitality',
    logo: '/companies/emirates.png',
    description: 'Global aviation leader and luxury travel provider',
    expectations: [
      'Excellence in customer service and attention to detail',
      'Cultural adaptability and global mindset',
      'Operational efficiency and problem-solving skills'
    ]
  },
  {
    id: 'dubaiholding',
    name: 'Dubai Holding',
    industry: 'Investment',
    logo: '/companies/dubaiholding.png',
    description: 'Global investment company with diverse portfolio',
    expectations: [
      'Strategic thinking and investment analysis expertise',
      'Vision alignment with UAE economic diversification goals',
      'Project management and execution capabilities'
    ]
  }
];

// Job role data
const jobRoles = [
  { title: 'Data Scientist', field: 'Analytics' },
  { title: 'Software Engineer', field: 'Technology' },
  { title: 'Project Manager', field: 'Management' },
  { title: 'HR Manager', field: 'Human Resources' },
  { title: 'Financial Analyst', field: 'Finance' },
  { title: 'Marketing Specialist', field: 'Marketing' },
  { title: 'Operations Manager', field: 'Operations' },
  { title: 'AI Engineer', field: 'Technology' },
  { title: 'UX/UI Designer', field: 'Design' },
  { title: 'Business Analyst', field: 'Business Analytics' }
];

// Power words for vocabulary enhancement
const powerVocabulary = {
  action: [
    'achieved', 'administered', 'advanced', 'analyzed', 'built', 'championed',
    'collaborated', 'coordinated', 'created', 'delivered', 'developed', 'directed',
    'drove', 'established', 'executed', 'facilitated', 'fostered', 'generated',
    'implemented', 'improved', 'increased', 'initiated', 'innovated', 'integrated',
    'led', 'managed', 'orchestrated', 'pioneered', 'reduced', 'revitalized',
    'spearheaded', 'streamlined', 'strengthened', 'transformed', 'unified', 'leveraged'
  ],
  result: [
    'accelerated', 'achieved', 'amplified', 'boosted', 'capitalized', 'delivered',
    'enhanced', 'exceeded', 'expanded', 'generated', 'improved', 'increased',
    'maximized', 'outperformed', 'reduced', 'revitalized', 'saved', 'stimulated',
    'strengthened', 'surpassed', 'transformed', 'upgraded', 'valued', 'yielded'
  ],
  attribute: [
    'adaptable', 'analytical', 'collaborative', 'committed', 'detail-oriented',
    'diligent', 'dynamic', 'efficient', 'entrepreneurial', 'experienced', 'expert',
    'innovative', 'knowledgeable', 'methodical', 'motivated', 'multilingual',
    'organized', 'proactive', 'professional', 'resourceful', 'results-driven',
    'skilled', 'strategic', 'tactical', 'team-oriented', 'versatile'
  ]
};

// Create SmartTipCard component
const SmartTipCard = ({ icon, title, text, severity = 'info' }) => {
  const severityColors = {
    success: { bg: 'success.50', border: 'success.200', text: 'success.dark' },
    warning: { bg: 'warning.50', border: 'warning.200', text: 'warning.dark' },
    error: { bg: 'error.50', border: 'error.200', text: 'error.dark' },
    info: { bg: 'info.50', border: 'info.200', text: 'info.dark' }
  };
  
  const colors = severityColors[severity] || severityColors.info;
  
  return (
    <Box 
      sx={{ 
        p: 2, 
        mb: 2,
        bgcolor: colors.bg, 
        borderRadius: 1, 
        border: '1px solid', 
        borderColor: colors.border,
        display: 'flex',
        alignItems: 'flex-start'
      }}
    >
      <Box sx={{ mr: 1.5, mt: 0.25, color: colors.text }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: colors.text, mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.text }}>
          {text}
        </Typography>
      </Box>
    </Box>
  );
};

// Define categorized question data structure
const categorizedQuestions = [
  {
    category: "Behavioral",
    icon: <Psychology />,
    questions: [
      { text: "Tell me about a time you resolved a conflict.", difficulty: "intermediate", tags: ["soft-skills", "teamwork"] },
      { text: "Describe a situation where you had to work under pressure.", difficulty: "beginner", tags: ["stress-management", "time-management"] },
      { text: "How do you handle feedback?", difficulty: "beginner", tags: ["growth-mindset", "soft-skills"] },
      { text: "Tell me about a failure and what you learned from it.", difficulty: "intermediate", tags: ["learning", "resilience"] }
    ]
  },
  {
    category: "Leadership",
    icon: <PeopleAlt />,
    questions: [
      { text: "How do you motivate a team?", difficulty: "intermediate", tags: ["team-management", "motivation"] },
      { text: "Describe a time you influenced decision-making.", difficulty: "advanced", tags: ["leadership", "communication"] },
      { text: "How do you delegate tasks?", difficulty: "intermediate", tags: ["management", "trust"] },
      { text: "Tell me about a challenging leadership situation.", difficulty: "advanced", tags: ["leadership", "problem-solving"] }
    ]
  },
  {
    category: "Technical",
    icon: <Code />,
    questions: [
      { text: "Explain a complex project you've worked on.", difficulty: "intermediate", tags: ["projects", "technical"] },
      { text: "How do you approach debugging?", difficulty: "intermediate", tags: ["problem-solving", "technical"] },
      { text: "Tell me about your experience with [technology].", difficulty: "beginner", tags: ["technical", "skills"] },
      { text: "How do you stay updated with industry trends?", difficulty: "beginner", tags: ["learning", "industry-knowledge"] }
    ]
  },
  {
    category: "UAE-Specific",
    icon: <Public />,
    questions: [
      { text: "How would you contribute to UAE Vision 2030?", difficulty: "intermediate", tags: ["uae", "vision-2030"] },
      { text: "What does Emiratization mean to you in a workplace?", difficulty: "intermediate", tags: ["emiratization", "culture"] },
      { text: "How do you adapt to multicultural work environments?", difficulty: "beginner", tags: ["diversity", "culture"] },
      { text: "What attracts you to working in the UAE?", difficulty: "beginner", tags: ["motivation", "culture"] }
    ]
  }
];

// Job role specific questions
const jobRoleQuestions = {
  "Data Scientist": [
    { text: "Explain a data cleaning process you've implemented.", difficulty: "intermediate", tags: ["data-science", "technical"] },
    { text: "How do you approach feature selection?", difficulty: "advanced", tags: ["machine-learning", "technical"] }
  ],
  "Software Engineer": [
    { text: "Describe your experience with CI/CD pipelines.", difficulty: "intermediate", tags: ["devops", "technical"] },
    { text: "How do you ensure code quality?", difficulty: "intermediate", tags: ["quality", "technical"] }
  ],
  "Project Manager": [
    { text: "How do you handle scope creep?", difficulty: "intermediate", tags: ["project-management", "problem-solving"] },
    { text: "Describe your approach to risk management.", difficulty: "advanced", tags: ["risk", "planning"] }
  ],
  "UX/UI Designer": [
    { text: "How do you incorporate user feedback into your designs?", difficulty: "intermediate", tags: ["design", "user-feedback"] },
    { text: "Describe your design process from concept to implementation.", difficulty: "intermediate", tags: ["process", "design"] }
  ]
};

const AIInterviewCoach = () => {
  // Initialize state variables
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [topicCategories, setTopicCategories] = useState([]);
  const [categoryQuestions, setCategoryQuestions] = useState([]);
  const [previousConversations, setPreviousConversations] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [topicMenuAnchorEl, setTopicMenuAnchorEl] = useState(null);
  const [questionMenuAnchorEl, setQuestionMenuAnchorEl] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [feedbackDetails, setFeedbackDetails] = useState(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [mockInterviewDialogOpen, setMockInterviewDialogOpen] = useState(false);
  const [mockInterviewMode, setMockInterviewMode] = useState(false);
  const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]);
  const [currentMockQuestionIndex, setCurrentMockQuestionIndex] = useState(0);
  const [mockInterviewSetupData, setMockInterviewSetupData] = useState({
    jobRole: '',
    difficulty: 'intermediate',
    duration: 20,
    questionsCount: 7
  });
  const [selectedCoachPersona, setSelectedCoachPersona] = useState('noora');
  const [sectorContext, setSectorContext] = useState('general');
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "Tell me about your experience with teamwork in previous roles.",
    "What are your key strengths as a professional?",
    "How do you handle tight deadlines and pressure?",
    "Describe a challenging situation you faced at work and how you resolved it.",
    "What are your career goals for the next 3-5 years?",
    "Tell me about a project you're particularly proud of."
  ]);
  
  // Add AI Assistant Mode
  const [isAIMode, setIsAIMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showCulturalTips, setShowCulturalTips] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    responseLength: 0,
    verboseScore: 'moderate',
    starCompliance: 0,
    confidenceScore: 0,
    keywordMatchPercentage: 0
  });
  const [showKnowledgeBooster, setShowKnowledgeBooster] = useState(false);
  const [boosterType, setBoosterType] = useState(null);
  const [boosterContent, setBoosterContent] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [detectedPatterns, setDetectedPatterns] = useState([]);
  const [activeMissions, setActiveMissions] = useState(coachingMissions);
  const [missionDialogOpen, setMissionDialogOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [missionCompleted, setMissionCompleted] = useState(false);
  const [userMessageHistory, setUserMessageHistory] = useState([]);
  const [roleplayMode, setRoleplayMode] = useState(false);
  const [roleplaySetupOpen, setRoleplaySetupOpen] = useState(false);
  const [roleplayConfig, setRoleplayConfig] = useState({
    company: null,
    jobRole: '',
    difficulty: 'medium',
    pressure: 'medium',
    time: 30 // seconds per answer
  });
  const [activeRoleplay, setActiveRoleplay] = useState(null);
  const [roleplayQuestion, setRoleplayQuestion] = useState('');
  const [roleplayTimer, setRoleplayTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [suggestedVocabulary, setSuggestedVocabulary] = useState([]);
  const [vocabularyCategory, setVocabularyCategory] = useState('action');
  const [vocabularyDialogOpen, setVocabularyDialogOpen] = useState(false);
  
  // Add new state for AI analysis feature
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Add state for role fit analysis feature
  const [roleFitAnalysis, setRoleFitAnalysis] = useState(null);
  const [useDeepSeekForAnalysis, setUseDeepSeekForAnalysis] = useState(true);
  
  // Add new state for premium feedback toggle
  const [usePremiumFeedback, setUsePremiumFeedback] = useState(false);
  const [feedbackSource, setFeedbackSource] = useState('basic');
  const [savedFeedbacks, setSavedFeedbacks] = useState([]);
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const [premiumFeedbackResponse, setPremiumFeedbackResponse] = useState(null);
  const [premiumAnalysisLoading, setPremiumAnalysisLoading] = useState(false);
  
  // Add new state variables for question filtering and categorization
  const [questionFilter, setQuestionFilter] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [roleSpecificQuestions, setRoleSpecificQuestions] = useState([]);
  const [showVoicePrompt, setShowVoicePrompt] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasLoadedMessages, setHasLoadedMessages] = useState(false);
  
  // Add missing state variables
  const [showCoachSelection, setShowCoachSelection] = useState(false);
  const [contextSelectorOpen, setContextSelectorOpen] = useState(false);
  
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Initialize the page and load conversation data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Initialize or fetch existing conversation
        const conversationResponse = await apiEndpoints.interviews.createOrLoadConversation(profile.id);
        
        // Handle response data
        if (!conversationResponse || !conversationResponse.data) {
          console.error("Error loading conversation data from API");
          setError('Failed to load conversation data');
          return;
        }
        
        // Process API response
        const responseData = conversationResponse.data;
        
        // Get conversation ID
        const sessionId = responseData.conversationId || responseData.id || responseData.session_id;
        setConversationId(sessionId);
        
        const initialMessages = responseData.messages || [];
        
        // Set messages if we got some or if the array is empty
        if (initialMessages.length > 0) {
          setMessages(initialMessages);
          setHasLoadedMessages(true);
        } else {
          // Add initial greeting if no messages exist
          const selectedCoach = coachPersonas.find(coach => coach.id === selectedCoachPersona) || coachPersonas[0];
          const greeting = {
            role: 'assistant',
            content: selectedCoach.greeting,
            timestamp: new Date().toISOString(),
            model: selectedCoach.id === 'ahmed' ? 'DeepSeek-AI' : 'LLaMA-3'
          };
          
          setMessages([greeting]);
          setHasLoadedMessages(true);
          
          // Save the greeting to the database
          if (sessionId) {
            await apiEndpoints.interviews.sendMessage(sessionId, {
              message: greeting.content,
              role: 'assistant',
              userId: profile.id
            });
          }
        }
        
        // Fetch previous conversations
        try {
          const previousConversationsResponse = await apiEndpoints.interviews.getPreviousConversations(profile.id);
          if (previousConversationsResponse?.data) {
            setPreviousConversations(previousConversationsResponse.data);
          }
        } catch (err) {
          console.warn('Error fetching previous conversations:', err);
        }
        
        // Fetch topic categories
        try {
          const topicCategoriesResponse = await apiEndpoints.interviews.getInterviewTopics();
          if (topicCategoriesResponse?.data) {
            setTopicCategories(topicCategoriesResponse.data);
          }
        } catch (err) {
          console.warn('Error fetching interview topics:', err);
        }
        
        // Fetch suggested questions
        try {
          const suggestedQuestionsResponse = await apiEndpoints.interviews.getSuggestedQuestions(profile.id);
          if (suggestedQuestionsResponse?.data && Array.isArray(suggestedQuestionsResponse.data)) {
            setSuggestedQuestions(suggestedQuestionsResponse.data);
          } else {
            // Default questions if API doesn't return an array
            setSuggestedQuestions([
              "Tell me about your experience with teamwork in previous roles.",
              "What are your key strengths as a professional?",
              "How do you handle tight deadlines and pressure?",
              "Describe a challenging situation you faced at work and how you resolved it.",
              "What are your career goals for the next 3-5 years?",
              "Tell me about a project you're particularly proud of."
            ]);
          }
        } catch (err) {
          console.warn('Error fetching suggested questions:', err);
          // Set default questions on error
          setSuggestedQuestions([
            "Tell me about your experience with teamwork in previous roles.",
            "What are your key strengths as a professional?",
            "How do you handle tight deadlines and pressure?",
            "Describe a challenging situation you faced at work and how you resolved it.",
            "What are your career goals for the next 3-5 years?",
            "Tell me about a project you're particularly proud of."
          ]);
        }
        
        // Initialize Speech Recognition if available
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          setSpeechRecognition(new SpeechRecognition());
        }
      } catch (err) {
        console.error('Error initializing interview coach:', err);
        setError('Failed to initialize interview coach. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
    
    // Clean up speech recognition on component unmount
    return () => {
      if (speechRecognition) {
        speechRecognition.stop();
      }
    };
  }, [profile, selectedCoachPersona, messages.length]);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Configure speech recognition
  useEffect(() => {
    if (speechRecognition) {
      speechRecognition.continuous = true;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'en-US';
      
      speechRecognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setInputMessage((prev) => prev + ' ' + transcript);
      };
      
      speechRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      speechRecognition.onend = () => {
        setIsListening(false);
      };
    }
  }, [speechRecognition]);
  
  // Toggle speech recognition
  const toggleListening = () => {
    if (!speechRecognition) {
      setSnackbarMessage('Speech recognition is not supported in your browser');
      setSnackbarOpen(true);
      return;
    }
    
    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
    } else {
      speechRecognition.start();
      setIsListening(true);
    }
  };
  
  // Add a new function to request premium feedback from OpenAI
  const requestPremiumFeedback = async (userInput) => {
    if (!userInput || userInput.trim().length < 10) {
      setSnackbarMessage('Please provide a longer response for detailed analysis');
      setSnackbarOpen(true);
      return;
    }

    setPremiumAnalysisLoading(true);
    
    try {
      // This would call our API endpoint that forwards to OpenAI
      const response = await apiEndpoints.interviews.getPremiumFeedback({
        userId: profile.id,
        userInput,
        feedbackTypes: ['softSkills', 'starPattern', 'confidencePhrasing'],
        model: 'gpt-4'  // Using GPT-4 via openrouter.ai
      });
      
      if (response.data) {
        setPremiumFeedbackResponse(response.data);
        
        // Update our feedback data with the premium insights
        setFeedbackData(prevData => ({
          ...prevData,
          premiumInsights: response.data,
          starCompliance: response.data.starRating || prevData.starCompliance,
          confidenceScore: response.data.confidenceScore || prevData.confidenceScore
        }));
      }
    } catch (err) {
      console.error('Error getting premium feedback:', err);
      setSnackbarMessage('Failed to get premium feedback. Using basic analysis instead.');
      setSnackbarOpen(true);
      // Fallback to basic feedback
      setFeedbackSource('basic');
      setUsePremiumFeedback(false);
    } finally {
      setPremiumAnalysisLoading(false);
    }
  };

  // Add function to save feedback to dashboard
  const saveFeedbackToDashboard = async () => {
    if (!profile?.id) return;
    
    setIsSavingFeedback(true);
    
    try {
      const feedbackToSave = {
        userId: profile.id,
        timestamp: new Date().toISOString(),
        userInput: userMessageHistory[userMessageHistory.length - 1] || '',
        feedbackData: {
          ...feedbackData,
          source: feedbackSource,
          premiumInsights: premiumFeedbackResponse
        },
        conversationId
      };
      
      const response = await apiEndpoints.interviews.saveFeedbackToDashboard(feedbackToSave);
      
      if (response.data?.success) {
        setSnackbarMessage('Feedback saved to your dashboard');
        setSnackbarOpen(true);
        
        // Add to local state to avoid another API call
        setSavedFeedbacks(prev => [...prev, feedbackToSave]);
      }
    } catch (err) {
      console.error('Error saving feedback to dashboard:', err);
      setSnackbarMessage('Failed to save feedback to dashboard');
      setSnackbarOpen(true);
    } finally {
      setIsSavingFeedback(false);
    }
  };
  
  // Send a message
  const sendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;
    
    // Debug logging
    console.log('Attempting to send message:', inputMessage.trim());
    console.log('Current state - isTyping:', isTyping, 'isAIMode:', isAIMode);
    
    setIsTyping(true);
    
    // Create new message
    const userMsg = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };
    
    // Debug log message object
    console.log('User message object:', userMsg);
    
    // Add the message to the local state immediately for better UX
    setMessages(prevMessages => [...prevMessages, userMsg]);
    
    // Add message to user history for analysis
    setUserMessageHistory(prev => [...prev, inputMessage.trim()]);
    
    // Clear the input
    setInputMessage('');
    
    // Scroll to bottom
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    try {
      setIsThinking(true);
      
      // Decide which mode to use
      const messageMode = isAIMode ? 'ai_assistant' : 'interview_coach';
      
      // Analyze message patterns in interview coach mode
      if (!isAIMode) {
        analyzeMessagePatterns(userMsg.content, userMessageHistory);
      }
      
      // Different instructions based on mode
      const systemInstruction = isAIMode 
        ? "You are a helpful AI assistant that can answer any question on any topic."
        : "You are an AI interview coach helping prepare for job interviews.";
      
      // Pick model based on coach persona or AI mode
      const selectedModel = isAIMode 
        ? 'deepseek' // Always use DeepSeek for general AI mode
        : (selectedCoachPersona === 'ahmed' ? 'deepseek' : 'llama3');
      
      console.log(`Sending message in ${messageMode} mode using ${selectedModel} model`);
      
      // Debug API request parameters
      const requestParams = {
        message: userMsg.content,
        role: 'user',
        userId: profile?.id || 0,
        mode: messageMode,
        model: selectedModel,
        useDeepSeek: isAIMode || selectedCoachPersona === 'ahmed',
        systemInstruction: systemInstruction
      };
      console.log('API request parameters:', requestParams);
      
      // Send message to backend
      const response = await apiEndpoints.interviews.sendMessage(conversationId, requestParams);
      
      // Analyze input for vocabulary suggestions
      if (!isAIMode && userMsg.content.length > 15) {
        // Generate vocabulary suggestions for longer messages
        const weakWords = ['did', 'made', 'worked', 'good', 'helped', 'tried', 'thought', 'got', 'handled'];
        let needsSuggestions = false;
        
        weakWords.forEach(word => {
          if (userMsg.content.toLowerCase().includes(` ${word} `)) {
            needsSuggestions = true;
          }
        });
        
        if (needsSuggestions) {
          const actionVerbs = [
            'achieved', 'implemented', 'led', 'developed', 'coordinated',
            'launched', 'optimized', 'spearheaded', 'transformed', 'resolved'
          ];
          
          // Show 3 random suggestions
          const suggestions = [];
          while (suggestions.length < 3 && actionVerbs.length > 0) {
            const idx = Math.floor(Math.random() * actionVerbs.length);
            suggestions.push(actionVerbs.splice(idx, 1)[0]);
          }
          
          setSuggestedVocabulary(suggestions);
        }
      }
      
      if (response && response.data) {
        const aiResponse = {
          role: 'assistant',
          content: response.data.message || response.data.content || "I'm not sure how to respond to that.",
          timestamp: new Date().toISOString(),
          model: isAIMode ? 'DeepSeek-AI' : (selectedCoachPersona === 'ahmed' ? 'DeepSeek-AI' : 'LLaMA-3')
        };
        
        setMessages(prevMessages => [...prevMessages, aiResponse]);
        
        // Only do analysis in interview coach mode
        if (!isAIMode) {
          // Analyze AI response for feedback metrics
          const responseText = aiResponse.content;
          
          // Simple metrics for real-time feedback
          const words = responseText.split(/\s+/).length;
          const sentences = responseText.split(/[.!?]+/).length - 1;
          const avgWordLength = responseText.length / words;
          
          // Star pattern compliance check (look for keywords)
          const starKeywords = ['situation', 'task', 'action', 'result'];
          const starMatches = starKeywords.filter(keyword => 
            responseText.toLowerCase().includes(keyword)
          ).length;
          
          const starScore = Math.round((starMatches / starKeywords.length) * 100);
          
          // Confidence language check
          const uncertainPhrases = ['i think', 'perhaps', 'maybe', 'possibly', 'i believe', 'might'];
          const confidentPhrases = ['definitely', 'certainly', 'absolutely', 'clearly', 'without doubt'];
          
          const uncertainCount = uncertainPhrases.filter(phrase => 
            responseText.toLowerCase().includes(phrase)
          ).length;
          
          const confidentCount = confidentPhrases.filter(phrase => 
            responseText.toLowerCase().includes(phrase)
          ).length;
          
          const confidenceScore = Math.max(0, Math.min(100, 
            50 + (confidentCount * 10) - (uncertainCount * 10)
          ));
          
          // Update feedback data
          setFeedbackData({
            responseLength: words,
            verboseScore: avgWordLength > 5 ? 'high' : 'moderate',
            starCompliance: starScore,
            confidenceScore: confidenceScore,
            keywordMatchPercentage: 75 // Default value when not calculated
          });
          
          // Check for mission completion
          updateMissionProgress(userMsg.content);
        }
        
        // If premium feedback is enabled, automatically request it
        if (usePremiumFeedback && !isAIMode) {
          await requestPremiumFeedback(userMsg.content);
          setFeedbackSource('premium');
        } else {
          setFeedbackSource('basic');
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Add fallback response in case of error
      const fallbackMessage = {
        role: 'assistant',
        content: isAIMode 
          ? "I'm your AI Assistant powered by DeepSeek. I apologize for the connection issue. Please try again with your question." 
          : "I'm your Interview Coach. I apologize for the connection issue. Please try again with your question.",
        timestamp: new Date().toISOString(),
        model: isAIMode ? 'DeepSeek-AI (Fallback)' : 'Coach AI (Fallback)'
      };
      
      setMessages((prevMessages) => [...prevMessages, fallbackMessage]);
    } finally {
      setIsTyping(false);
      setIsThinking(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Load a previous conversation
  const loadConversation = async (convoId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiEndpoints.interviews.loadConversation(convoId);
      
      setConversationId(convoId);
      setMessages(response.data.messages || []);
    } catch (err) {
      setError('Failed to load conversation');
      console.error('Error loading conversation:', err);
    } finally {
      setLoading(false);
      setMenuAnchorEl(null);
    }
  };
  
  // Start a new conversation
  const startNewConversation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiEndpoints.interviews.createConversation(profile.id);
      
      setConversationId(response.data.conversationId);
      
      // Add initial greeting based on current mode
      if (isAIMode) {
        // AI assistant greeting
        const greeting = {
          role: 'assistant',
          content: "Hello! I'm your AI Assistant powered by DeepSeek. I can answer questions on any topic. How can I help you today?",
          timestamp: new Date().toISOString(),
          model: 'DeepSeek-AI'
        };
        
        setMessages([greeting]);
        setHasLoadedMessages(true);
        
        // Save the greeting to the backend using AI mode
        await apiEndpoints.interviews.sendMessage(response.data.conversationId, {
          message: greeting.content,
          role: 'assistant',
          userId: profile.id,
          mode: 'ai_assistant',
          model: 'deepseek',
          systemInstruction: "You are a helpful AI assistant that can answer any question on any topic."
        });
      } else {
        // Coach greeting
        const selectedCoach = coachPersonas.find(coach => coach.id === selectedCoachPersona) || coachPersonas[0];
        const greeting = {
          role: 'assistant',
          content: selectedCoach.greeting,
          timestamp: new Date().toISOString(),
          model: selectedCoach.id === 'ahmed' ? 'DeepSeek-AI' : 'LLaMA-3'
        };
        
        setMessages([greeting]);
        setHasLoadedMessages(true);
        
        // Save the greeting to the backend using interview coach mode
        await apiEndpoints.interviews.sendMessage(response.data.conversationId, {
          message: greeting.content,
          role: 'assistant',
          userId: profile.id,
          mode: 'interview_coach',
          model: selectedCoach.id === 'ahmed' ? 'deepseek' : 'llama3',
          systemInstruction: "You are an AI interview coach helping prepare for job interviews."
        });
      }
    } catch (err) {
      setError('Failed to start new conversation');
      console.error('Error starting new conversation:', err);
    } finally {
      setLoading(false);
      setMenuAnchorEl(null);
    }
  };
  
  // Load questions for a category
  const loadCategoryQuestions = async (category) => {
    setSelectedCategory(category);
    setTopicMenuAnchorEl(null);
    
    try {
      const response = await apiEndpoints.interviews.getCategoryQuestions(category.id);
      setCategoryQuestions(response.data || []);
    } catch (err) {
      console.error('Error loading category questions:', err);
      setCategoryQuestions([]);
    }
  };
  
  // Send a predefined question
  const sendPredefinedQuestion = (question) => {
    setInputMessage(question);
    setQuestionMenuAnchorEl(null);
  };
  
  // Setup and start a mock interview
  const setupMockInterview = async () => {
    setMockInterviewDialogOpen(false);
    setLoading(true);
    
    try {
      const response = await apiEndpoints.interviews.createMockInterview({
        userId: profile.id,
        ...mockInterviewSetupData
      });
      
      setMockInterviewQuestions(response.data.questions || []);
      setCurrentMockQuestionIndex(0);
      setMockInterviewMode(true);
      
      // Clear existing messages
      setMessages([]);
      
      // Add initial greeting from the coach
      const greeting = {
        role: 'assistant',
        content: "Hello! I'm your AI Interview Coach. I'm starting your mock interview. Let's get started.",
        timestamp: new Date().toISOString()
      };
      
      setMessages([greeting]);
      
      // Save the mock interview setup data to the backend
      await apiEndpoints.interviews.createMockInterviewSetup(response.data.mockInterviewId, mockInterviewSetupData);
    } catch (err) {
      setError('Failed to setup mock interview');
      console.error('Error setting up mock interview:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle mock interview navigation
  const handleMockInterviewNavigation = (direction) => {
    if (direction === 'previous') {
      setCurrentMockQuestionIndex(prevIndex => prevIndex - 1);
    } else if (direction === 'next') {
      setCurrentMockQuestionIndex(prevIndex => prevIndex + 1);
    }
  };
  
  // Change coach persona
  const changeCoachPersona = async (personaId) => {
    setSelectedCoachPersona(personaId);
    setLoading(true);
    
    // Find the new coach
    const newCoach = coachPersonas.find(coach => coach.id === personaId);
    if (!newCoach) {
      setLoading(false);
      return;
    }
    
    try {
      // Create a new conversation
      const response = await apiEndpoints.interviews.createConversation(profile.id);
      setConversationId(response.data.conversationId);
      
      // Use our new handleCoachSelect function to properly set up the coach
      const coachObj = {
        name: newCoach.name,
        field: newCoach.title
      };
      handleCoachSelect(coachObj);
      
      // Save the greeting to the backend
      await apiEndpoints.interviews.sendMessage(response.data.conversationId, {
        role: 'assistant',
        content: `Hi! I'm ${newCoach.name}, your ${newCoach.title} interview coach. How can I help you prepare for your interview today?`,
        userId: profile.id
      });
      
      // Reset other conversation state
      setUserMessageHistory([]);
      setDetectedPatterns([]);
      setSuggestedVocabulary([]);
      setFeedbackData({
        responseLength: 0,
        verboseScore: 0,
        starCompliance: 0,
        confidenceScore: 0,
        keywordMatchPercentage: 0
      });
      
    } catch (err) {
      console.error('Error changing coach persona:', err);
      setSnackbarMessage('Failed to change coach. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  // Change sector context
  const changeSectorContext = (sector) => {
    setSectorContext(sector);
    setShowCulturalTips(true);
    
    setTimeout(() => {
      setShowCulturalTips(false);
    }, 8000);
  };
  
  // Analyze message for behavioral patterns
  const analyzeMessagePatterns = (message, messageHistory) => {
    // Reset detected patterns
    const newDetectedPatterns = [];
    
    // Check for patterns in current message
    behavioralPatterns.forEach(pattern => {
      const matches = (message.match(pattern.pattern) || []).length;
      if (matches > 0) {
        newDetectedPatterns.push(pattern);
      }
    });
    
    // Only show patterns if we have enough user messages (at least 3)
    if (messageHistory.length >= 3) {
      // Check for repeated patterns across message history
      const allText = messageHistory.join(' ');
      
      behavioralPatterns.forEach(pattern => {
        const totalMatches = (allText.match(pattern.pattern) || []).length;
        // Only add repeated patterns that weren't caught in the current message
        if (totalMatches >= 3 && !newDetectedPatterns.some(p => p.id === pattern.id)) {
          newDetectedPatterns.push(pattern);
        }
      });
      
      // Add multi-input prediction using both text and tags
      const extractedTags = extractTags(allText);
      const textAndTagsAnalysis = analyzeTextAndTags(allText, extractedTags);
      
      if (textAndTagsAnalysis.detectedPatterns.length > 0) {
        // Add unique patterns from the text+tags analysis
        textAndTagsAnalysis.detectedPatterns.forEach(pattern => {
          if (!newDetectedPatterns.some(p => p.id === pattern.id)) {
            newDetectedPatterns.push(pattern);
          }
        });
      }
    }
    
    // Limit to 2 pattern feedbacks to avoid overwhelming the user
    setDetectedPatterns(newDetectedPatterns.slice(0, 2));
  };
  
  // Extract tags from text for multi-input prediction
  const extractTags = (text) => {
    const commonSkillTags = [
      'leadership', 'communication', 'teamwork', 'problem-solving',
      'project-management', 'technical', 'analytical', 'research',
      'creative', 'attention-to-detail', 'time-management', 'adaptability'
    ];
    
    const foundTags = [];
    commonSkillTags.forEach(tag => {
      if (text.toLowerCase().includes(tag.toLowerCase())) {
        foundTags.push(tag);
      }
    });
    
    return foundTags;
  };
  
  // Analyze text and tags together for multi-input prediction
  const analyzeTextAndTags = (text, tags) => {
    // This function would be connected to DeepSeek or LLaMA-3 in production
    const result = {
      detectedPatterns: [],
      reasons: []
    };
    
    // Example logic for pattern detection based on combinations of text and tags
    if (tags.includes('leadership') && text.includes('team')) {
      result.detectedPatterns.push({
        id: 'leadership-focus',
        feedback: "Your responses focus on leadership skills. Try highlighting specific team achievements and how you guided others."
      });
      result.reasons.push("Your text mentions teams while your skills indicate leadership focus");
    }
    
    if (tags.includes('technical') && (text.includes('problem') || text.includes('solution'))) {
      result.detectedPatterns.push({
        id: 'technical-problem-solver',
        feedback: "You emphasize technical problem-solving. Consider quantifying your impact with metrics."
      });
      result.reasons.push("Your response combines technical skills with problem-solution narratives");
    }
    
    return result;
  };
  
  // Generate role fit analysis with explainable results
  const generateRoleFitAnalysis = async (selectedRole) => {
    // Show loading state
    setIsThinking(true);
    
    const role = selectedRole || (roleFitAnalysis ? roleFitAnalysis.role : jobRoles[0].title);
    
    try {
      // Combine all user messages for analysis
      const userText = userMessageHistory.join(' ');
      
      // Call the actual backend API with the selected model
      const response = await apiEndpoints.interviews.getRoleFitAnalysis({
        userId: profile.id,
        userInput: userText,
        jobRole: role,
        provider: useDeepSeekForAnalysis ? 'deepseek' : 'llama3',
        language: 'en', // For multilingual support
        sectorContext: sectorContext || 'general'
      });
      
      if (response.data) {
        setRoleFitAnalysis({
          ...response.data,
          analysisSource: useDeepSeekForAnalysis ? 'DeepSeek AI' : 'LLAMA-3'
        });
      } else {
        throw new Error("Invalid response from the API");
      }
    } catch (error) {
      console.error("Error generating role fit analysis:", error);
      
      // Fallback to local simulation if API fails
      const extractedTags = extractTags(userText);
      
      // Calculate simulated fit score based on message content and tags
      let fitScore = 60; // Default baseline
      
      // Adjust score based on skills match
      extractedTags.forEach(tag => {
        if (['leadership', 'management'].includes(tag) && role.includes('Manager')) {
          fitScore += 5;
        }
        if (['technical', 'analytical'].includes(tag) && 
            (role.includes('Engineer') || role.includes('Developer') || role.includes('Scientist'))) {
          fitScore += 5;
        }
        if (['communication', 'teamwork'].includes(tag)) {
          fitScore += 3; // These are good for any role
        }
      });
      
      // Sample reasons for fit, customized to role
      const reasons = [];
      const improvementAreas = [];
      
      // Generate tailored reasons based on role and extracted data
      if (role.includes('Data Scientist')) {
        if (extractedTags.includes('analytical')) {
          reasons.push("Your strong analytical skills align well with the data analysis requirements of this role.");
        } else {
          improvementAreas.push("Emphasize your analytical skills and experience with data analysis techniques.");
        }
        
        if (userText.toLowerCase().includes('python') || userText.toLowerCase().includes('sql')) {
          reasons.push("Your technical expertise in Python and/or SQL is directly applicable to data science workflows.");
        } else {
          improvementAreas.push("Highlight your proficiency with data science tools like Python, R, or SQL.");
        }
      } 
      else if (role.includes('Software Engineer')) {
        if (extractedTags.includes('problem-solving')) {
          reasons.push("Your problem-solving approach demonstrates the critical thinking needed for software engineering challenges.");
        } else {
          improvementAreas.push("Focus more on your problem-solving methodology when discussing technical challenges.");
        }
        
        if (userText.toLowerCase().includes('code') || userText.toLowerCase().includes('develop')) {
          reasons.push("Your coding experience and development background meet the technical requirements of this position.");
        } else {
          improvementAreas.push("Provide more concrete examples of your coding projects and development experience.");
        }
      }
      else if (role.includes('Project Manager')) {
        if (extractedTags.includes('leadership')) {
          reasons.push("Your leadership experience aligns with the team management requirements of this project manager role.");
        } else {
          improvementAreas.push("Emphasize your experience leading teams and managing project workflows.");
        }
        
        if (userText.toLowerCase().includes('deadline') || userText.toLowerCase().includes('budget')) {
          reasons.push("Your experience managing deadlines and budgets demonstrates key project management capabilities.");
        } else {
          improvementAreas.push("Highlight specific examples of delivering projects on time and within budget constraints.");
        }
      }
      else {
        // Generic reasons for other roles
        if (extractedTags.length > 2) {
          reasons.push(`Your diverse skill set including ${extractedTags.slice(0, 3).join(', ')} provides a strong foundation for this role.`);
        }
        
        if (userText.length > 300) {
          reasons.push("Your detailed responses show thoughtfulness and communication skills valuable in this position.");
        } else {
          improvementAreas.push("Provide more comprehensive responses to showcase your expertise depth.");
        }
      }
      
      // Add UAE-specific context if available
      if (sectorContext && sectorContext !== 'general') {
        reasons.push(`Your understanding of the ${sectorContext} sector in the UAE context adds valuable regional perspective.`);
      } else {
        improvementAreas.push("Include UAE-specific knowledge or cultural awareness to stand out in the local job market.");
      }
      
      // Ensure we have at least 2 reasons and improvement areas
      if (reasons.length < 2) {
        reasons.push("Your communication style demonstrates professionalism suitable for this position.");
      }
      
      if (improvementAreas.length < 2) {
        improvementAreas.push("Quantify your achievements with specific metrics to strengthen your candidacy.");
      }
      
      // Set the analysis result with fallback data
      setRoleFitAnalysis({
        role,
        field: jobRoles.find(r => r.title === role)?.field || "",
        fitScore: Math.min(98, fitScore), // Cap at 98 to be realistic
        reasons,
        improvementAreas,
        tags: extractedTags,
        analysisSource: useDeepSeekForAnalysis ? 'DeepSeek AI (Fallback)' : 'LLAMA-3 (Fallback)'
      });
      
      setSnackbarMessage("Using offline analysis mode due to API issues");
      setSnackbarOpen(true);
    } finally {
      setIsThinking(false);
    }
  };
  
  // Update mission progress based on user message
  const updateMissionProgress = (message) => {
    const newMissions = [...activeMissions];
    let missionJustCompleted = false;
    let completedMission = null;
    
    // Check confidence mission (no filler words)
    const confidenceMission = newMissions.find(m => m.id === 'confidence');
    if (confidenceMission && !confidenceMission.completed) {
      const fillerPattern = behavioralPatterns.find(p => p.id === 'filler');
      const hasFillerWords = fillerPattern.pattern.test(message);
      
      if (!hasFillerWords) {
        confidenceMission.progress += 1;
        
        if (confidenceMission.progress >= confidenceMission.maxProgress) {
          confidenceMission.completed = true;
          missionJustCompleted = true;
          completedMission = confidenceMission;
        }
      }
    }
    
    // Check STAR narrative mission
    const starMission = newMissions.find(m => m.id === 'star');
    if (starMission && !starMission.completed) {
      // Check if message contains elements of the STAR method
      const hasSituation = /\b(situation|context|background|scenario)\b/i.test(message);
      const hasTask = /\b(task|objective|goal|assignment|responsibility)\b/i.test(message);
      const hasAction = /\b(action|approach|steps|implemented|executed|performed)\b/i.test(message);
      const hasResult = /\b(result|outcome|impact|achievement|accomplishment)\b/i.test(message);
      
      // If message has all STAR components and is reasonably concise (under ~90 seconds of talking)
      if (hasSituation && hasTask && hasAction && hasResult && message.length < 1500) {
        starMission.progress = 1;
        starMission.completed = true;
        missionJustCompleted = true;
        completedMission = starMission;
      }
    }
    
    // Check quantify mission
    const quantifyMission = newMissions.find(m => m.id === 'quantify');
    if (quantifyMission && !quantifyMission.completed) {
      // Look for numbers and percentages as evidence of quantification
      const numberPattern = /\b(\d+%|\d+\s*percent|\$\s*\d+|\d+\s*dollars|\d+\s*people|\d+\s*users|\d+\s*customers|\d+\s*hours|\d+\s*days|\d+\s*months|\d+\s*years)\b/gi;
      const matches = message.match(numberPattern) || [];
      
      if (matches.length > 0) {
        quantifyMission.progress += 1;
        
        if (quantifyMission.progress >= quantifyMission.maxProgress) {
          quantifyMission.completed = true;
          missionJustCompleted = true;
          completedMission = quantifyMission;
        }
      }
    }
    
    setActiveMissions(newMissions);
    
    // Show mission completion dialog
    if (missionJustCompleted && completedMission) {
      setSelectedMission(completedMission);
      setMissionCompleted(true);
      setMissionDialogOpen(true);
    }
  };
  
  // Timer effect for roleplay mode
  useEffect(() => {
    if (timerRunning && roleplayTimer > 0) {
      timerRef.current = setTimeout(() => {
        setRoleplayTimer(prev => prev - 1);
      }, 1000);
    } else if (timerRunning && roleplayTimer === 0) {
      // Time's up
      setTimerRunning(false);
      setSnackbarMessage("Time's up! Try to provide a concise answer.");
      setSnackbarOpen(true);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timerRunning, roleplayTimer]);
  
  // Generate suggested vocabulary based on input
  useEffect(() => {
    if (inputMessage && inputMessage.length > 10) {
      // Check if input contains certain trigger words
      const weakWords = ['did', 'made', 'worked', 'good', 'helped', 'tried', 'thought', 'got', 'handled'];
      const shouldSuggest = weakWords.some(word => inputMessage.toLowerCase().includes(` ${word} `));
      
      if (shouldSuggest) {
        // Select random words from the vocabulary bank
        const category = Math.random() > 0.5 ? 'action' : 'result';
        setVocabularyCategory(category);
        
        const suggestions = [];
        const availableWords = [...powerVocabulary[category]];
        
        // Get 3-5 random words
        const numSuggestions = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < numSuggestions; i++) {
          if (availableWords.length === 0) break;
          
          const randomIndex = Math.floor(Math.random() * availableWords.length);
          suggestions.push(availableWords[randomIndex]);
          availableWords.splice(randomIndex, 1);
        }
        
        setSuggestedVocabulary(suggestions);
      } else {
        setSuggestedVocabulary([]);
      }
    } else {
      setSuggestedVocabulary([]);
    }
  }, [inputMessage]);
  
  // Setup roleplay interview
  const setupRoleplay = () => {
    if (!roleplayConfig.company || !roleplayConfig.jobRole) {
      setSnackbarMessage('Please select both company and job role');
      setSnackbarOpen(true);
      return;
    }
    
    const company = typeof roleplayConfig.company === 'string' 
      ? roleplayCompanies.find(c => c.id === roleplayConfig.company) 
      : roleplayConfig.company;
    
    // Create active roleplay
    const newRoleplay = {
      company: company,
      jobRole: roleplayConfig.jobRole,
      difficulty: roleplayConfig.difficulty,
      pressure: roleplayConfig.pressure,
      timePerQuestion: roleplayConfig.time,
      questions: [
        `Tell me about your experience that's relevant to the ${roleplayConfig.jobRole} position at ${company.name}.`,
        `Why are you interested in joining ${company.name} specifically?`,
        `How would you contribute to our ${company.industry} industry goals?`,
        `Describe a challenge in your previous role and how you overcame it.`,
        `How do your skills align with our expectation of ${company.expectations[0]}?`
      ],
      currentQuestion: 0
    };
    
    setActiveRoleplay(newRoleplay);
    setRoleplayQuestion(newRoleplay.questions[0]);
    setRoleplayTimer(newRoleplay.timePerQuestion);
    setTimerRunning(true);
    setRoleplayMode(true);
    setRoleplaySetupOpen(false);
    
    // Add system message indicating the roleplay start
    const roleplayStartMessage = {
      role: 'system',
      content: `Starting interview roleplay for ${roleplayConfig.jobRole} position at ${company.name}. Difficulty: ${roleplayConfig.difficulty}, Pressure: ${roleplayConfig.pressure}`,
      timestamp: new Date().toISOString()
    };
    
    // Add interviewer message
    const interviewerMessage = {
      role: 'assistant',
      content: `I'll be interviewing you as a hiring manager from ${company.name}. ${
        roleplayConfig.pressure === 'high' 
          ? "Your time is limited, and I'll be evaluating your clarity, impact, and alignment with our company values." 
          : "Let's have a conversation about your experience and fit for the role."
      }\n\nFirst question: ${newRoleplay.questions[0]}`,
      timestamp: new Date().toISOString()
    };
    
    setMessages((prevMessages) => [...prevMessages, roleplayStartMessage, interviewerMessage]);
  };
  
  // Next roleplay question
  const nextRoleplayQuestion = () => {
    if (!activeRoleplay) return;
    
    const nextQuestionIndex = activeRoleplay.currentQuestion + 1;
    
    if (nextQuestionIndex < activeRoleplay.questions.length) {
      const updatedRoleplay = {
        ...activeRoleplay,
        currentQuestion: nextQuestionIndex
      };
      
      setActiveRoleplay(updatedRoleplay);
      setRoleplayQuestion(updatedRoleplay.questions[nextQuestionIndex]);
      setRoleplayTimer(updatedRoleplay.timePerQuestion);
      setTimerRunning(true);
      
      // Add interviewer message with next question
      const interviewerMessage = {
        role: 'assistant',
        content: updatedRoleplay.questions[nextQuestionIndex],
        timestamp: new Date().toISOString()
      };
      
      setMessages((prevMessages) => [...prevMessages, interviewerMessage]);
    } else {
      // End of roleplay
      endRoleplay();
    }
  };
  
  // End roleplay
  const endRoleplay = () => {
    setRoleplayMode(false);
    setActiveRoleplay(null);
    setTimerRunning(false);
    
    // Add system message indicating the roleplay end
    const roleplayEndMessage = {
      role: 'system',
      content: 'Interview roleplay completed.',
      timestamp: new Date().toISOString()
    };
    
    // Add feedback message
    const feedbackMessage = {
      role: 'assistant',
      content: "Thank you for completing the interview roleplay. Here's a summary of your performance:\n\n" +
        "Strengths:\n" +
        "• You provided detailed answers with specific examples\n" +
        "• Your responses were well-structured\n" +
        "• You demonstrated good knowledge of the role\n\n" +
        "Areas for improvement:\n" +
        "• Try to be more concise in some answers\n" +
        "• Emphasize more on relevant achievements\n" +
        "• Demonstrate more company-specific knowledge\n\n" +
        "Would you like to try another roleplay or focus on specific questions?",
      timestamp: new Date().toISOString()
    };
    
    setMessages((prevMessages) => [...prevMessages, roleplayEndMessage, feedbackMessage]);
  };
  
  // Handle vocabulary suggestion click
  const handleVocabSuggestionClick = (word) => {
    setInputMessage(prev => {
      // Find a weak word to replace, or just append
      const weakWords = ['did', 'made', 'worked', 'good', 'helped', 'tried', 'thought', 'got', 'handled'];
      for (const weakWord of weakWords) {
        if (prev.toLowerCase().includes(` ${weakWord} `)) {
          return prev.replace(new RegExp(`\\b${weakWord}\\b`, 'i'), word);
        }
      }
      return `${prev} ${word}`;
    });
    
    // Reset suggestions
    setSuggestedVocabulary([]);
  };
  
  // Render coach selection component
  const renderCoachSelection = () => {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, background: 'rgba(246, 248, 255, 0.8)' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
          Choose Your Interview Coach
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {coachPersonas.map((coach) => (
            <Grid item xs={12} sm={6} md={3} key={coach.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  borderRadius: '16px',
                  borderColor: selectedCoachPersona === coach.id ? 'primary.main' : 'transparent',
                  borderWidth: 3,
                  borderStyle: 'solid',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedCoachPersona === coach.id ? '0 8px 20px rgba(25, 118, 210, 0.2)' : '0 4px 12px rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                  },
                  overflow: 'hidden'
                }}
                onClick={() => changeCoachPersona(coach.id)}
              >
                <Box sx={{ bgcolor: 'grey.200', height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Typography variant="h1" sx={{ color: 'grey.400', fontSize: '5rem' }}>
                    {coach.name.charAt(0)}
                  </Typography>
                </Box>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {coach.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {coach.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };
  
  // Render cultural context selector
  const renderCulturalContextSelector = () => {
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          UAE Job Sector Context 🇦🇪
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <InputLabel id="sector-context-label">Select Job Sector</InputLabel>
          <Select
            labelId="sector-context-label"
            id="sector-context"
            value={sectorContext}
            label="Select Job Sector"
            onChange={(e) => changeSectorContext(e.target.value)}
          >
            <MenuItem value="general">General UAE Context</MenuItem>
            <MenuItem value="government">Government Sector</MenuItem>
            <MenuItem value="tech">Technology Industry</MenuItem>
            <MenuItem value="education">Education Sector</MenuItem>
          </Select>
          <FormHelperText>
            Get culturally-relevant interview tips for your sector
          </FormHelperText>
        </FormControl>
        
        {showCulturalTips && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.50', borderRadius: 1, border: '1px solid', borderColor: 'info.200' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'info.dark', fontWeight: 'bold' }}>
              UAE Cultural Tips for {sectorContext.charAt(0).toUpperCase() + sectorContext.slice(1)} Sector:
            </Typography>
            <List dense disablePadding>
              {uaeCulturalContext[sectorContext].map((tip, index) => (
                <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemText 
                    primary={tip} 
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      color: 'info.dark' 
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    );
  };
  
  // Render feedback component - modified to include premium feedback
  const renderFeedback = () => {
    if (!feedbackData.responseLength) return null;
    
    return (
      <Accordion sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{ bgcolor: feedbackSource === 'premium' ? 'secondary.50' : 'primary.50' }}
        >
          <Typography sx={{ display: 'flex', alignItems: 'center' }}>
            <SportsScore sx={{ mr: 1 }} /> 
            {feedbackSource === 'premium' ? 'Premium AI Analysis' : 'Performance Analysis'} 
            {premiumAnalysisLoading && <CircularProgress size={16} sx={{ ml: 1 }} />}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={usePremiumFeedback}
                  onChange={(e) => setUsePremiumFeedback(e.target.checked)}
                  color="secondary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>Premium AI Feedback</Typography>
                  {usePremiumFeedback && (
                    <Chip 
                      label="GPT-4 Powered" 
                      size="small" 
                      color="secondary" 
                      variant="outlined" 
                    />
                  )}
                </Box>
              }
            />
            
            <Button
              size="small"
              variant="outlined"
              startIcon={<Save />}
              onClick={saveFeedbackToDashboard}
              disabled={isSavingFeedback}
            >
              {isSavingFeedback ? 'Saving...' : 'Save to Dashboard'}
            </Button>
          </Box>
          
          {feedbackSource === 'premium' && feedbackData.premiumInsights && (
            <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'secondary.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Premium GPT-4 Analysis
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Soft Skills Assessment:
                </Typography>
                <Typography variant="body2">
                  {feedbackData.premiumInsights.softSkills || 'Your communication style is clear and professional. Consider using more confident language to convey authority.'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  STAR Pattern Analysis:
                </Typography>
                <Typography variant="body2">
                  {feedbackData.premiumInsights.starPattern || 'Your answer includes some STAR elements but could be strengthened by clearly separating Situation, Task, Action, and Result sections.'}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Suggested Improvements:
                </Typography>
                <Typography variant="body2">
                  {feedbackData.premiumInsights.suggestions || 'Be more specific about measurable results. Replace phrases like "I think" with more confident statements like "I demonstrated" or "I achieved".'}
                </Typography>
              </Box>
            </Paper>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Response Length
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '70%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, (feedbackData.responseLength / 150) * 100)} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2">
                    {feedbackData.responseLength} words
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  STAR Compliance
                </Typography>
                <Rating 
                  value={feedbackData.starCompliance} 
                  readOnly 
                  max={5}
                  emptyIcon={<StarBorder fontSize="inherit" />}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  AI Confidence Analysis
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '70%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={feedbackData.confidenceScore * 10} 
                      color={feedbackData.confidenceScore > 7 ? "success" : feedbackData.confidenceScore > 4 ? "warning" : "error"} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2">
                    {feedbackData.confidenceScore}/10
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Job Keyword Match
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '70%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={feedbackData.keywordMatchPercentage} 
                      color={feedbackData.keywordMatchPercentage > 80 ? "success" : feedbackData.keywordMatchPercentage > 60 ? "warning" : "error"} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2">
                    {feedbackData.keywordMatchPercentage}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          {feedbackData.starCompliance < 3 && (
            <SmartTipCard 
              icon={<Psychology />}
              title="Pro Tip: Improve Your STAR Format"
              text="Try reframing your answer using the STAR method: Situation, Task, Action, Result to provide more structure and clarity."
              severity="warning"
            />
          )}
          
          {feedbackData.confidenceScore < 5 && (
            <SmartTipCard 
              icon={<Psychology />}
              title="Confidence Booster"
              text="Your language includes tentative phrases like 'I think' or 'maybe.' Try using more assertive language like 'I implemented' or 'I achieved.'"
              severity="warning"
            />
          )}
        </AccordionDetails>
      </Accordion>
    );
  };
  
  // Render AI Knowledge Booster component
  const renderKnowledgeBooster = () => {
    if (!showKnowledgeBooster) return null;
    
    let title, icon;
    
    switch (boosterType) {
      case 'examples':
        title = "Sample Answers";
        icon = <FormatQuote />;
        break;
      case 'strategy':
        title = "Answer Strategy";
        icon = <LocalLibrary />;
        break;
      case 'vocabulary':
        title = "Power Words";
        icon = <Brush />;
        break;
      default:
        title = "AI Tips";
        icon = <TipsAndUpdates />;
    }
    
    return (
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
            {icon} <Box sx={{ ml: 1 }}>{title}</Box>
          </Typography>
          <IconButton size="small" onClick={() => setShowKnowledgeBooster(false)}>
            <Cancel fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {boosterType === 'vocabulary' ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {boosterContent.map((word, index) => (
              <Chip 
                key={index} 
                label={word} 
                color="primary" 
                variant="outlined" 
                onClick={() => setInputMessage(prev => prev + ' ' + word)} 
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        ) : (
          <List dense disablePadding>
            {boosterContent.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                <ListItemText 
                  primary={`${index + 1}. ${item}`} 
                  primaryTypographyProps={{ variant: 'body2' }} 
                />
              </ListItem>
            ))}
          </List>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            size="small" 
            startIcon={<ContentCopy />}
            onClick={() => {
              if (boosterType === 'vocabulary') {
                navigator.clipboard.writeText(boosterContent.join(', '));
              } else {
                navigator.clipboard.writeText(boosterContent.map((item, i) => `${i + 1}. ${item}`).join('\n'));
              }
              setSnackbarMessage('Copied to clipboard!');
              setSnackbarOpen(true);
            }}
          >
            Copy to Clipboard
          </Button>
        </Box>
      </Paper>
    );
  };
  
  // Render behavioral pattern feedback
  const renderBehavioralPatternFeedback = () => {
    if (detectedPatterns.length === 0) return null;
    
    return (
      <Box sx={{ mb: 3 }}>
        {detectedPatterns.map((pattern, index) => (
          <SmartTipCard 
            key={index}
            icon={<Face />}
            title="Communication Pattern Detected"
            text={pattern.feedback}
            severity="info"
          />
        ))}
      </Box>
    );
  };
  
  // Render vocabulary suggestions
  const renderVocabularySuggestions = () => {
    if (suggestedVocabulary.length === 0) return null;
    
    return (
      <Box sx={{ mb: 2 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            borderRadius: 1,
            borderColor: 'primary.light',
            bgcolor: 'primary.50'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Brush fontSize="small" color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="primary">
              Suggested {vocabularyCategory === 'action' ? 'Action Verbs' : 'Result Words'}:
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {suggestedVocabulary.map((word, index) => (
              <Chip
                key={index}
                label={word}
                size="small"
                color="primary"
                variant="outlined"
                onClick={() => handleVocabSuggestionClick(word)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
            <Chip
              icon={<MoreVert fontSize="small" />}
              label="More"
              size="small"
              variant="outlined"
              onClick={() => setVocabularyDialogOpen(true)}
            />
          </Box>
        </Paper>
      </Box>
    );
  };
  
  // Render roleplay timer
  const renderRoleplayTimer = () => {
    if (!roleplayMode || !timerRunning) return null;
    
    const timerColor = roleplayTimer > 10 ? 'success.main' : roleplayTimer > 5 ? 'warning.main' : 'error.main';
    
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2,
        p: 1,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1
      }}>
        <Timer sx={{ color: timerColor, mr: 1 }} />
        <Typography variant="h6" sx={{ color: timerColor, fontWeight: 'bold' }}>
          {roleplayTimer}
        </Typography>
        <Typography variant="subtitle2" sx={{ ml: 1, color: 'text.secondary' }}>
          seconds remaining
        </Typography>
      </Box>
    );
  };
  
  // Render roleplay setup dialog
  const renderRoleplaySetupDialog = () => {
    return (
      <Dialog
        open={roleplaySetupOpen}
        onClose={() => setRoleplaySetupOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BusinessCenter sx={{ mr: 1 }} />
            AI Interview Roleplay Simulator
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pb: 4 }}>
          <Typography variant="subtitle1" color="text.secondary" paragraph sx={{ mt: 1 }}>
            Customize your interview simulation to practice with specific companies and roles.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Company Selection
              </Typography>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <Autocomplete
                  options={roleplayCompanies}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                  value={roleplayConfig.company}
                  onChange={(e, newValue) => setRoleplayConfig(prev => ({ ...prev, company: newValue }))}
                  renderInput={(params) => <TextField {...params} label="Select Company" />}
                  isOptionEqualToValue={(option, value) => 
                    option.id === value.id || option.name === value.name
                  }
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={option.logo}
                        alt={option.name}
                        sx={{ width: 24, height: 24, mr: 1 }}
                      />
                      {option.name} - {option.industry}
                    </Box>
                  )}
                />
              </FormControl>
              
              {roleplayConfig.company && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Company Expectations:
                  </Typography>
                  <List dense disablePadding>
                    {typeof roleplayConfig.company === 'object' && roleplayConfig.company.expectations.map((exp, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={exp}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Job Role Details
              </Typography>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <Autocomplete
                  options={jobRoles}
                  getOptionLabel={(option) => typeof option === 'string' ? option : option.title}
                  onChange={(e, newValue) => setRoleplayConfig(prev => ({ 
                    ...prev, 
                    jobRole: typeof newValue === 'string' ? newValue : newValue?.title || '' 
                  }))}
                  isOptionEqualToValue={(option, value) => 
                    option.title === value.title || option.title === value
                  }
                  renderInput={(params) => <TextField {...params} label="Job Title" />}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      {option.title} - {option.field}
                    </Box>
                  )}
                />
              </FormControl>
              
              <Typography variant="subtitle1" gutterBottom>
                Interview Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={roleplayConfig.difficulty}
                      label="Difficulty"
                      onChange={(e) => setRoleplayConfig(prev => ({ ...prev, difficulty: e.target.value }))}
                    >
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Pressure</InputLabel>
                    <Select
                      value={roleplayConfig.pressure}
                      label="Pressure"
                      onChange={(e) => setRoleplayConfig(prev => ({ ...prev, pressure: e.target.value }))}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Timer (sec)</InputLabel>
                    <Select
                      value={roleplayConfig.time}
                      label="Timer (sec)"
                      onChange={(e) => setRoleplayConfig(prev => ({ ...prev, time: e.target.value }))}
                    >
                      <MenuItem value={20}>20 sec</MenuItem>
                      <MenuItem value={30}>30 sec</MenuItem>
                      <MenuItem value={45}>45 sec</MenuItem>
                      <MenuItem value={60}>60 sec</MenuItem>
                      <MenuItem value={90}>90 sec</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRoleplaySetupOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={setupRoleplay}
            startIcon={<PlayArrow />}
            disabled={!roleplayConfig.company || !roleplayConfig.jobRole}
          >
            Start Roleplay
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render vocabulary dialog
  const renderVocabularyDialog = () => {
    return (
      <Dialog
        open={vocabularyDialogOpen}
        onClose={() => setVocabularyDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Brush sx={{ mr: 1 }} />
            Interview Power Vocabulary
          </Box>
        </DialogTitle>
        <DialogContent>
          <Tabs
            value={vocabularyCategory}
            onChange={(e, newValue) => setVocabularyCategory(newValue)}
            sx={{ mb: 2 }}
          >
            <Tab label="Action Verbs" value="action" />
            <Tab label="Result Words" value="result" />
            <Tab label="Attributes" value="attribute" />
          </Tabs>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {powerVocabulary[vocabularyCategory].map((word, index) => (
              <Chip
                key={index}
                label={word}
                color="primary"
                variant="outlined"
                onClick={() => {
                  handleVocabSuggestionClick(word);
                  setVocabularyDialogOpen(false);
                }}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVocabularyDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render missions component
  const renderMissions = () => {
    // This function is now empty because we're removing the Coaching Missions
    return null;
  };
  
  // Render AI Analysis Card - updated to use Hugging Face and DeepSeek
  const renderAIAnalysis = () => {
    return (
      <Box sx={{ mt: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">AI-Powered Multi-Model Interview Analysis</Typography>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={showAnalysis ? <ExpandMore /> : <BarChart />}
            onClick={() => setShowAnalysis(!showAnalysis)}
          >
            {showAnalysis ? 'Hide Analysis' : 'Get Multi-Model Analysis'}
          </Button>
        </Box>
        
        {showAnalysis && (
          <Box sx={{ mt: 2 }}>
            <AIRecommendationCard 
              title="Multi-Provider Interview Analysis" 
              description="Get a comprehensive analysis using OpenAI, Hugging Face, and DeepSeek models for different perspectives"
              placeholder="Paste your interview transcript or summarize your interview answers here..."
              type="interview"
              modelOptions={[
                { id: 'openai', name: 'OpenAI GPT-4', description: 'Comprehensive interview feedback with detailed suggestions' },
                { id: 'huggingface', name: 'Hugging Face LLAMA-3', description: 'Strong reasoning about interview improvements' },
                { id: 'deepseek', name: 'DeepSeek Coder', description: 'Specialized for technical interview responses' }
              ]}
              context="Analyze this interview content and provide detailed feedback on communication skills, answer structure, key strengths, and improvement areas. Include specific tips to help the candidate improve."
              saveToDashboard={true}
            />
            
            {/* Add new Role Fit Analysis */}
            <Paper elevation={3} sx={{ mt: 3, p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                "Why You Fit This Role" Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Analyze your responses against specific job requirements to see why you're a good match for various roles.
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Select Job Role"
                    value={roleFitAnalysis ? roleFitAnalysis.role : ''}
                    onChange={(e) => generateRoleFitAnalysis(e.target.value)}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          style: {
                            maxHeight: 300
                          }
                        }
                      }
                    }}
                  >
                    {jobRoles.map((role) => (
                      <MenuItem key={role.title} value={role.title}>
                        {role.title} - {role.field}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      startIcon={<Business />}
                      disabled={!userMessageHistory.length}
                      onClick={() => generateRoleFitAnalysis()}
                      sx={{ mr: 1 }}
                    >
                      Analyze Fit
                    </Button>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={useDeepSeekForAnalysis} 
                          onChange={() => setUseDeepSeekForAnalysis(!useDeepSeekForAnalysis)}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2">Use DeepSeek</Typography>
                          {useDeepSeekForAnalysis && <Chip size="small" label="AI" color="secondary" sx={{ ml: 1 }} />}
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
              
              {roleFitAnalysis && (
                <Box sx={{ mt: 2 }}>
                  <Paper 
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      borderLeft: '4px solid',
                      borderColor: 'primary.main'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <CheckCircle />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {roleFitAnalysis.role}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Fit Score: <strong>{roleFitAnalysis.fitScore}%</strong> match for this role
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Why You Fit This Role:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {roleFitAnalysis.reasons.map((reason, index) => (
                        <Typography component="li" key={index} variant="body2" paragraph sx={{ mb: 1 }}>
                          {reason}
                        </Typography>
                      ))}
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mt: 2 }}>
                      Areas to Emphasize:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {roleFitAnalysis.improvementAreas.map((area, index) => (
                        <Typography component="li" key={index} variant="body2" paragraph sx={{ mb: 1 }}>
                          {area}
                        </Typography>
                      ))}
                    </Box>
                  </Paper>
                </Box>
              )}
            </Paper>
          </Box>
        )}
      </Box>
    );
  };
  
  // Get job role specific questions when job role changes
  useEffect(() => {
    if (mockInterviewSetupData.jobRole) {
      const roleQuestions = jobRoleQuestions[mockInterviewSetupData.jobRole] || [];
      setRoleSpecificQuestions(roleQuestions);
    }
  }, [mockInterviewSetupData.jobRole]);
  
  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Filter questions based on search, tags, and difficulty
  const getFilteredQuestions = (questions) => {
    return questions.filter(q => {
      // Filter by search text
      const matchesSearch = questionFilter === "" || 
        q.text.toLowerCase().includes(questionFilter.toLowerCase());
      
      // Filter by tags
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => q.tags.includes(tag));
      
      // Filter by difficulty
      const matchesDifficulty = difficultyFilter === "all" || 
        q.difficulty === difficultyFilter;
      
      return matchesSearch && matchesTags && matchesDifficulty;
    });
  };
  
  // Speak a question using text-to-speech
  const speakQuestion = (question) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(question);
      
      // Determine the language for the utterance
      // Check if the question has Arabic characters
      const hasArabic = /[\u0600-\u06FF]/.test(question);
      utterance.lang = hasArabic ? 'ar-SA' : 'en-US';
      
      // Set voice (attempt to find appropriate voice based on language)
      const voices = window.speechSynthesis.getVoices();
      
      if (hasArabic) {
        // Try to find Arabic voice
        const arabicVoice = voices.find(voice => 
          voice.lang.includes('ar') || 
          voice.name.includes('Arabic')
        );
        if (arabicVoice) {
          utterance.voice = arabicVoice;
        }
      } else {
        // For English, prefer female voice as default
        const preferredVoice = voices.find(voice => 
          (voice.name.includes('Female') || voice.name.includes('Samantha')) && 
          voice.lang.includes('en')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }
      
      // Adjust speech properties for better experience
      utterance.rate = 0.95; // Slightly slower for better comprehension
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('TTS Error:', event);
        setIsSpeaking(false);
        setSnackbarMessage('Text-to-speech error occurred. Please try again.');
        setSnackbarOpen(true);
      };
      
      window.speechSynthesis.speak(utterance);
      
    } else {
      setSnackbarMessage('Text-to-speech is not supported in your browser');
      setSnackbarOpen(true);
    }
  };
  
  // Add a new function to speak AI responses with TTS
  const speakAIResponse = (text) => {
    if (!text) return;
    
    speakQuestion(text); // Reuse the TTS function
  };
  
  // Get all unique tags from questions
  const getAllTags = () => {
    const tags = new Set();
    
    categorizedQuestions.forEach(category => {
      category.questions.forEach(question => {
        question.tags.forEach(tag => tags.add(tag));
      });
    });
    
    Object.values(jobRoleQuestions).flat().forEach(question => {
      question.tags.forEach(tag => tags.add(tag));
    });
    
    return Array.from(tags);
  };
  
  // Render difficulty badge
  const renderDifficultyBadge = (difficulty) => {
    const difficultyMap = {
      beginner: { icon: "🟢", label: "Beginner" },
      intermediate: { icon: "🟡", label: "Intermediate" },
      advanced: { icon: "🔴", label: "Advanced" }
    };
    
    return (
      <Tooltip title={difficultyMap[difficulty]?.label || ""}>
        <Box component="span" sx={{ mr: 1 }} key={`difficulty-icon-${difficulty}`}>
          {difficultyMap[difficulty]?.icon || ""}
        </Box>
      </Tooltip>
    );
  };
  
  // Render suggested questions section - Updated with 3D effects
  const renderSuggestedQuestions = () => {
    // Ensure suggestedQuestions is an array before filtering
    const questionsList = Array.isArray(suggestedQuestions) ? suggestedQuestions : [];
    
    // Filter questions based on search and difficulty
    const filteredSuggestions = questionsList.filter(question => 
      typeof question === 'string' && question.toLowerCase().includes(questionFilter.toLowerCase())
    );
    
    return (
      <Paper 
        elevation={6} 
        sx={{ 
          p: 3, 
          borderRadius: 4, 
          position: 'sticky',
          top: 20,
          transition: 'all 0.3s ease',
          background: 'linear-gradient(to bottom, #ffffff, #f7faff)',
          backdropFilter: 'blur(20px)',
          '&:hover': {
            boxShadow: '0 15px 35px rgba(50,50,93,0.1), 0 5px 15px rgba(0,0,0,0.07)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <QuestionAnswer color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2" sx={{ 
            fontWeight: 600,
            backgroundImage: 'linear-gradient(90deg, #2575fc, #6a11cb)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Suggested Questions
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        {/* Search bar */}
        <TextField
          fullWidth
          placeholder="Search questions..."
          size="small"
          value={questionFilter}
          onChange={(e) => setQuestionFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="primary" />
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover, &.Mui-focused': {
                boxShadow: '0 4px 10px rgba(0,0,0,0.07)'
              }
            }
          }}
        />
        
        {/* Filter buttons */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip 
            label="All"
            clickable
            color={difficultyFilter === 'all' ? 'primary' : 'default'}
            onClick={() => setDifficultyFilter('all')}
            sx={{ 
              transition: 'all 0.2s ease',
              transform: difficultyFilter === 'all' ? 'scale(1.05)' : 'scale(1)',
              fontWeight: difficultyFilter === 'all' ? 600 : 400,
              boxShadow: difficultyFilter === 'all' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
            }}
          />
          <Chip 
            label="Beginner"
            clickable
            color={difficultyFilter === 'beginner' ? 'success' : 'default'}
            onClick={() => setDifficultyFilter('beginner')}
            sx={{ 
              transition: 'all 0.2s ease',
              transform: difficultyFilter === 'beginner' ? 'scale(1.05)' : 'scale(1)',
              fontWeight: difficultyFilter === 'beginner' ? 600 : 400,
              boxShadow: difficultyFilter === 'beginner' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
            }}
          />
          <Chip 
            label="Intermediate"
            clickable
            color={difficultyFilter === 'intermediate' ? 'warning' : 'default'}
            onClick={() => setDifficultyFilter('intermediate')}
            sx={{ 
              transition: 'all 0.2s ease',
              transform: difficultyFilter === 'intermediate' ? 'scale(1.05)' : 'scale(1)',
              fontWeight: difficultyFilter === 'intermediate' ? 600 : 400,
              boxShadow: difficultyFilter === 'intermediate' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
            }}
          />
          <Chip 
            label="Advanced"
            clickable
            color={difficultyFilter === 'advanced' ? 'error' : 'default'}
            onClick={() => setDifficultyFilter('advanced')}
            sx={{ 
              transition: 'all 0.2s ease',
              transform: difficultyFilter === 'advanced' ? 'scale(1.05)' : 'scale(1)',
              fontWeight: difficultyFilter === 'advanced' ? 600 : 400,
              boxShadow: difficultyFilter === 'advanced' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
            }}
          />
        </Box>
        
        {/* Questions list */}
        <List 
          sx={{ 
            maxHeight: '55vh', 
            overflowY: 'auto',
            p: 0,
            '&::-webkit-scrollbar': { width: 8 },
            '&::-webkit-scrollbar-track': { bgcolor: 'rgba(0,0,0,0.05)' }, 
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 4 }
          }}
        >
          {filteredSuggestions.length > 0 ? (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Recommended for you
              </Typography>
              {filteredSuggestions.map((question, index) => (
                <Paper 
                  key={index} 
                  elevation={1} 
                  sx={{ 
                    mb: 2, 
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px) scale(1.01)',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <ListItemButton 
                    onClick={() => sendPredefinedQuestion(question)}
                    sx={{ 
                      borderLeft: '3px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <ListItemText 
                      primary={question} 
                      primaryTypographyProps={{ 
                        variant: 'body2',
                        fontWeight: 500,
                        sx: { lineHeight: 1.4 }
                      }}
                    />
                  </ListItemButton>
                </Paper>
              ))}
            </Box>
          ) : (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'center', 
                bgcolor: 'rgba(25, 118, 210, 0.05)',
                borderRadius: 2
              }}
            >
              <Info color="primary" sx={{ fontSize: 40, opacity: 0.6, mb: 1 }} />
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                Try a different search term
              </Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setQuestionFilter('')}
                startIcon={<Refresh />}
              >
                Reset Search
              </Button>
            </Paper>
          )}
        </List>
      </Paper>
    );
  };

  // Use useEffect to prevent scrolling on focus
  useEffect(() => {
    const preventScroll = (e) => {
      const target = e.target;
      // Check if the target is a text input or similar control that needs keyboard focus
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Prevent the automatic scrolling behavior
        setTimeout(() => {
          window.scrollTo({
            top: window.scrollY,
            behavior: 'auto'
          });
        }, 0);
      }
    };

    // Add the event listener for focus events
    document.addEventListener('focus', preventScroll, true);
    
    // Clean up
    return () => {
      document.removeEventListener('focus', preventScroll, true);
    };
  }, []);
  
  const handleCoachSelect = (coach) => {
    setSelectedCoach(coach);
    setCoachName(coach.name);
    setCurrentPage(2);

    // Reset conversation when changing coaches
    setMessages([]);
    setFeedbackData(null);
    setBehavioralPatterns([]);
    setVocabularySuggestions([]);
    setKnowledgeGaps([]);
    setMessageContainerHeight(window.innerHeight - 280);

    // Add welcome message from coach
    const welcomeMessage = {
      role: 'assistant',
      content: `Hi! I'm ${coach.name}, your ${coach.field} interview coach. How can I help you prepare for your interview today?`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
    setMessageHistory([welcomeMessage]);
  };
  
  // Toggle AI mode
  const toggleAIMode = async () => {
    const newMode = !isAIMode;
    setIsAIMode(newMode);
    
    // Create a new conversation when switching modes
    try {
      setLoading(true);
      
      // Create a new conversation
      const response = await apiEndpoints.interviews.createConversation(profile.id);
      setConversationId(response.data.conversationId);
      
      // Reset conversation state
      setUserMessageHistory([]);
      setDetectedPatterns([]);
      setSuggestedVocabulary([]);
      
      // Add appropriate greeting based on mode
      const greeting = {
        role: 'assistant',
        content: newMode 
          ? "Hello! I'm your AI Assistant powered by DeepSeek. I can answer questions on any topic. How can I help you today?" 
          : coachPersonas.find(coach => coach.id === selectedCoachPersona)?.greeting || "Hello! I'm your AI Interview Coach. How can I help you prepare for your interview today?",
        timestamp: new Date().toISOString(),
        model: newMode ? 'DeepSeek-AI' : (selectedCoachPersona === 'ahmed' ? 'DeepSeek-AI' : 'LLaMA-3')
      };
      
      // Reset messages to only show the greeting
      setMessages([greeting]);
      setHasLoadedMessages(true);
      
      // Save the greeting to the backend with explicit mode parameters
      await apiEndpoints.interviews.sendMessage(response.data.conversationId, {
        message: greeting.content,
        role: 'assistant',
        userId: profile.id,
        mode: newMode ? 'ai_assistant' : 'interview_coach',
        model: newMode ? 'deepseek' : (selectedCoachPersona === 'ahmed' ? 'deepseek' : 'llama3'),
        systemInstruction: newMode 
          ? "You are a helpful AI assistant that can answer any question on any topic." 
          : "You are an AI interview coach helping prepare for job interviews."
      });
      
    } catch (err) {
      console.error('Error creating new conversation for AI mode:', err);
      // Fall back to local state changes only if the API call fails
      const fallbackConversationId = 'local-' + Date.now();
      setConversationId(fallbackConversationId);
      
      const greeting = {
        role: 'assistant',
        content: newMode 
          ? "Hello! I'm your AI Assistant powered by DeepSeek. I can answer questions on any topic. How can I help you today?" 
          : "Hello! I'm your AI Interview Coach. How can I help you prepare for your interview today?",
        timestamp: new Date().toISOString(),
        model: newMode ? 'DeepSeek-AI' : 'LLaMA-3'
      };
      
      setMessages([greeting]);
      setHasLoadedMessages(true);
      
      setSnackbarMessage('Connected in offline mode. Some features may be limited.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Title */}
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          mb: 3, 
          fontWeight: 700,
          backgroundImage: 'linear-gradient(90deg, #2575fc, #6a11cb)',
          backgroundClip: 'text',
          textFillColor: 'transparent',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}
      >
        AI Interview Coach
      </Typography>

      {/* Coach Profile Card - New section above the chat */}
      <Paper 
        elevation={6} 
        sx={{ 
          mb: 3, 
          borderRadius: 4, 
          backgroundImage: 'linear-gradient(to right, #f6f9ff, #f0f7ff)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)'
        }}
      >
        <Grid container>
          {/* Coach Avatar and Info */}
          <Grid item xs={12} md={3} 
            sx={{ 
              background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
              display: 'flex',
              flexDirection: { xs: 'row', md: 'column' },
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', md: 'center' },
              p: 3
            }}
          >
            <Box 
              sx={{ 
                width: 120,
                height: 120,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '3.5rem',
                fontWeight: 'bold',
                mb: { xs: 0, md: 2 },
                mr: { xs: 2, md: 0 },
                border: '4px solid rgba(255,255,255,0.4)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
              }}
            >
              {coachPersonas.find(coach => coach.id === selectedCoachPersona)?.name.charAt(0)}
            </Box>
            <Box sx={{ color: 'white', textAlign: { xs: 'left', md: 'center' } }}>
              <Typography variant="h5" fontWeight="bold">
                {coachPersonas.find(coach => coach.id === selectedCoachPersona)?.name}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 1 }}>
                {coachPersonas.find(coach => coach.id === selectedCoachPersona)?.title}
              </Typography>
              <Chip 
                label={selectedCoachPersona === 'ahmed' ? 'DeepSeek-AI' : 'LLaMA-3'} 
                size="small"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold'
                }} 
              />
            </Box>
          </Grid>
          
          {/* Coach Details and Controls */}
          <Grid item xs={12} md={9} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" color="primary.main" fontWeight="bold">Coach Profile</Typography>
              <Box>
                <Tooltip title="Change Coach">
                  <IconButton 
                    color="primary" 
                    onClick={() => setShowCoachSelection(!showCoachSelection)}
                    sx={{ mr: 1 }}
                  >
                    <Psychology />
                  </IconButton>
                </Tooltip>
                <Tooltip title="New Conversation">
                  <IconButton 
                    color="primary" 
                    onClick={startNewConversation}
                    sx={{ mr: 1 }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cultural Context">
                  <IconButton 
                    color="primary" 
                    onClick={() => setContextSelectorOpen(!contextSelectorOpen)}
                  >
                    <Business />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Typography variant="body1" paragraph>
              {coachPersonas.find(coach => coach.id === selectedCoachPersona)?.description}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="primary.main" fontWeight="bold" gutterBottom>
                Experience:
              </Typography>
              <Grid container spacing={1}>
                {coachPersonas.find(coach => coach.id === selectedCoachPersona)?.experience.map((exp, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Paper 
                      sx={{ 
                        p: 1.5, 
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'rgba(37, 117, 252, 0.05)',
                        borderRadius: 2
                      }}
                    >
                      <CheckCircle color="primary" fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">{exp}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            <Box>
              <Typography variant="subtitle1" color="primary.main" fontWeight="bold" gutterBottom>
                Coaching Tips:
              </Typography>
              <Grid container spacing={1}>
                {coachPersonas.find(coach => coach.id === selectedCoachPersona)?.tips.map((tip, index) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
                      <TipsAndUpdates color="warning" fontSize="small" sx={{ mr: 1, mt: 0.3 }} />
                      <Typography variant="body2">{tip}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Coach selection panel */}
      <Collapse in={showCoachSelection}>
        {renderCoachSelection()}
      </Collapse>

      {/* Cultural context selector */}
      <Collapse in={contextSelectorOpen}>
        {renderCulturalContextSelector()}
      </Collapse>
      
      {/* Main layout */}
      <Grid container spacing={3}>
        {/* Chat area */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={6} 
            sx={{ 
              borderRadius: 4, 
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.3s ease-in-out',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(245,250,255,0.95))',
              boxShadow: '0 10px 30px rgba(0,0,0,0.12), 0 6px 12px rgba(0,0,0,0.06), 0 4px 6px rgba(50,50,93,0.12)',
              '&:hover': {
                boxShadow: '0 15px 35px rgba(50,50,93,0.15), 0 5px 15px rgba(0,0,0,0.1)'
              }
            }}
          >
            {/* Chat header */}
            <Box sx={{ 
              p: 2, 
              background: isAIMode 
                ? 'linear-gradient(135deg, #11cb64 0%, #25a0fc 100%)'
                : 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                {isAIMode ? <Code sx={{ mr: 1 }} /> : <Chat sx={{ mr: 1 }} />} 
                {isAIMode ? "AI Assistant" : "Interview Conversation"}
                {isAIMode && (
                  <Chip 
                    label="DeepSeek" 
                    size="small" 
                    sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem' }}
                  />
                )}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {/* AI Mode Toggle */}
                <Tooltip title={isAIMode ? "Switch to Interview Coach Mode" : "Switch to AI Assistant Mode"}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isAIMode}
                        onChange={toggleAIMode}
                        color="default"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: 'white',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                        {isAIMode ? <Code sx={{ ml: 0.5, fontSize: 16 }} /> : <School sx={{ ml: 0.5, fontSize: 16 }} />}
                      </Typography>
                    }
                    sx={{ mr: 1 }}
                  />
                </Tooltip>
                
                {roleplayMode && !isAIMode ? (
                  <Chip 
                    label="Roleplay Mode" 
                    color="secondary" 
                    size="small"
                    icon={<RecordVoiceOver />} 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                ) : !isAIMode ? (
                  <Chip 
                    label="Practice Mode" 
                    color="primary" 
                    size="small"
                    icon={<School />} 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                ) : (
                  <Chip 
                    label="AI Assistant" 
                    color="default" 
                    size="small"
                    icon={<Code />} 
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                )}
              </Box>
            </Box>

            {/* Chat messages */}
            <Box 
              sx={{ 
                height: '60vh', 
                overflowY: 'auto', 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column',
                backgroundImage: isAIMode 
                  ? 'radial-gradient(circle at center, rgba(240,255,245,0.4) 0%, rgba(255,255,255,0) 70%)'
                  : 'radial-gradient(circle at center, rgba(240,245,255,0.4) 0%, rgba(255,255,255,0) 70%)',
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                '&::-webkit-scrollbar': {
                  width: '8px',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0,0,0,0.03)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'rgba(0,0,0,0.15)',
                  },
                },
              }} 
              ref={chatContainerRef}
            >
              {loading && !hasLoadedMessages ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <LoadingSpinner text="Loading conversation..." />
                </Box>
              ) : (
                <Box sx={{ flexGrow: 1 }}>
                  {messages.map((msg, index) => {
                    // Filter out system messages
                    if (msg.role === 'system') return null;
                    if (msg.content && msg.content.includes('Coach persona changed to')) return null;
                    
                    const isUser = msg.role === 'user';
                    const showAvatar = !isUser; // Only show coach avatar
                    
                    return (
                      <Box 
                        key={index} 
                        sx={{
                          display: 'flex',
                          flexDirection: isUser ? 'row-reverse' : 'row',
                          mb: 2
                        }}
                      >
                        {showAvatar && (
                          <Avatar
                            src={coachPersonas.find(coach => coach.id === selectedCoachPersona)?.avatar}
                            alt="Coach"
                            sx={{ mr: 1.5, width: 40, height: 40 }}
                          />
                        )}
                        
                        <Paper
                          elevation={1}
                          sx={{
                            p: 2,
                            maxWidth: '80%',
                            bgcolor: isUser ? 'primary.main' : 'background.paper',
                            color: isUser ? 'white' : 'text.primary',
                            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            boxShadow: isUser 
                              ? '0 3px 10px rgba(0,0,0,0.12)' 
                              : '0 3px 10px rgba(0,0,0,0.06)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: isUser 
                                ? '0 5px 15px rgba(0,0,0,0.15)' 
                                : '0 5px 15px rgba(0,0,0,0.1)'
                            },
                            border: isUser ? 'none' : '1px solid rgba(0,0,0,0.05)'
                          }}
                        >
                          <Typography variant="body1">
                            {msg.content}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 1
                          }}>
                            <Typography 
                              variant="caption" 
                              color={isUser ? 'primary.contrastText' : 'text.secondary'} 
                              sx={{ opacity: 0.8 }}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString()}
                              {!isUser && msg.model && ` • ${msg.model}`}
                            </Typography>
                            
                            {/* Add TTS button for AI messages */}
                            {!isUser && (
                              <IconButton 
                                size="small" 
                                onClick={() => speakAIResponse(msg.content)}
                                disabled={isSpeaking}
                                sx={{ 
                                  ml: 1,
                                  color: 'primary.main',
                                  opacity: isSpeaking ? 1 : 0.6,
                                  '&:hover': {opacity: 1}
                                }}
                              >
                                <VolumeUp fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Paper>
                        {isUser && (
                          <Avatar sx={{ ml: 1, bgcolor: 'secondary.main' }}>
                            {profile?.name?.charAt(0) || 'U'}
                          </Avatar>
                        )}
                      </Box>
                    );
                  })}
                  {isThinking && (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 6, mt: 1 }}>
                      <CircularProgress size={20} sx={{ mr: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Thinking...
                      </Typography>
                    </Box>
                  )}
                  <div ref={chatEndRef} />
                </Box>
              )}
            </Box>

            {/* Show feedback data, knowledge booster, behavioral pattern feedback, and vocabulary suggestions */}
            <Box sx={{ p: 2 }}>
              {!isAIMode && (
                <>
                  {renderVocabularySuggestions()}
                  {renderBehavioralPatternFeedback()}
                  {renderFeedback()}
                  {renderKnowledgeBooster()}
                  {renderAIAnalysis()}
                </>
              )}
            </Box>

            {/* Input area */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', background: 'linear-gradient(180deg, rgba(245,245,245,0.1) 0%, rgba(245,245,255,0.6) 100%)' }}>
              <TextField
                fullWidth
                placeholder="Type your message here..."
                value={inputMessage}
                onChange={(e) => {
                  console.log('Input changed:', e.target.value);
                  setInputMessage(e.target.value);
                }}
                onKeyPress={(e) => {
                  console.log('Key pressed:', e.key);
                  handleKeyPress(e);
                }}
                onClick={(e) => {
                  console.log('Input field clicked');
                }}
                onFocus={(e) => {
                  console.log('Input field focused');
                }}
                disabled={isTyping || loading}
                multiline
                minRows={2}
                maxRows={4}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {roleplayMode && (
                        <Tooltip title="Next Question">
                          <IconButton
                            onClick={nextRoleplayQuestion}
                            color="primary"
                            sx={{ 
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', 
                              '&:hover': { 
                                transform: 'scale(1.1)',
                                backgroundColor: 'rgba(25, 118, 210, 0.08)'
                              } 
                            }}
                          >
                            <NavigateNext />
                          </IconButton>
                        </Tooltip>
                      )}
                      <IconButton
                        onClick={toggleListening}
                        color={isListening ? 'secondary' : 'default'}
                        disabled={isTyping || loading || !speechRecognition}
                        sx={{ 
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', 
                          animation: isListening ? 'pulse 1.5s infinite' : 'none',
                          '@keyframes pulse': {
                            '0%': { boxShadow: '0 0 0 0 rgba(156, 39, 176, 0.4)' },
                            '70%': { boxShadow: '0 0 0 10px rgba(156, 39, 176, 0)' },
                            '100%': { boxShadow: '0 0 0 0 rgba(156, 39, 176, 0)' }
                          },
                          '&:hover': { 
                            transform: 'scale(1.1)',
                            backgroundColor: isListening ? 'rgba(156, 39, 176, 0.08)' : 'rgba(0, 0, 0, 0.08)'
                          } 
                        }}
                      >
                        {isListening ? <MicOff /> : <Mic />}
                      </IconButton>
                      <IconButton
                        onClick={sendMessage}
                        color="primary"
                        disabled={!inputMessage.trim() || isTyping || loading}
                        sx={{ 
                          ml: 1, 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': { 
                            transform: 'scale(1.1)',
                            bgcolor: 'primary.dark',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                          },
                          '&.Mui-disabled': {
                            bgcolor: 'action.disabledBackground',
                            color: 'text.disabled'
                          }
                        }}
                      >
                        <Send />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                sx={{ 
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(0,0,0,0.08)',
                    '&:hover, &.Mui-focused': {
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={isAIMode ? 0 : 4} sx={{ display: isAIMode ? 'none' : 'block' }}>
          {/* Replace original renderMissions() call with the missions component */}
          {renderMissions()}
          
          {/* Replace original Suggested Questions section with our enhanced version */}
          {renderSuggestedQuestions()}
        </Grid>
      </Grid>
      
      {/* Mission completed dialog */}
      <Dialog
        open={missionDialogOpen}
        onClose={() => setMissionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'success.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EmojiEvents sx={{ mr: 1 }} />
            Mission Accomplished!
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {selectedMission && (
            <Box sx={{ textAlign: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  mx: 'auto', 
                  mb: 2, 
                  bgcolor: 'success.main' 
                }}
              >
                {selectedMission.icon}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {selectedMission.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {selectedMission.description}
              </Typography>
              <Chip 
                label={`Reward: ${selectedMission.reward}`} 
                color="success" 
                icon={<EmojiEvents />} 
                sx={{ mb: 3 }}
              />
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Skills improved:
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Chip label="Interview Confidence" size="small" />
                <Chip label="Communication" size="small" />
                <Chip label="Self-Presentation" size="small" />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMissionDialogOpen(false)} color="primary">
            Continue Training
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Render dialogs */}
      {renderRoleplaySetupDialog()}
      {renderVocabularyDialog()}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default AIInterviewCoach; 