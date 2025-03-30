import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Chip, Card, CardContent, IconButton, Avatar,
  List, ListItem, ListItemText, ListItemButton,
  CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, Tooltip, Grid,
  Accordion, AccordionSummary, AccordionDetails,
  Menu, MenuItem, InputAdornment, Tabs, Tab,
  Snackbar, Badge, LinearProgress, Fab, Container
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
  Face, AccessTime, EmojiEmotions, FilterList
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

// Mock data for interview coach simulation
const mockInterviewData = {
  conversations: [
    {
      id: "conv1",
      title: "Interview Preparation - Software Engineer",
      date: "2024-03-20T15:30:00Z",
      messages: [
        {
          role: "assistant",
          content: "Hello! I'm your AI Interview Coach. I can help you prepare for interviews by providing advice, answering questions, and simulating interview scenarios. How can I assist you today?",
          timestamp: "2024-03-20T15:30:00Z"
        }
      ]
    }
  ],
  topics: [
    { id: "t1", name: "Behavioral Questions", count: 28 },
    { id: "t2", name: "Technical Skills", count: 42 },
    { id: "t3", name: "Situational Scenarios", count: 15 },
    { id: "t4", name: "Communication", count: 19 },
    { id: "t5", name: "Leadership & Teamwork", count: 23 }
  ],
  suggestedQuestions: [
    "What are the most common interview questions for software engineers?",
    "How should I prepare for behavioral interviews?",
    "What's the best way to answer 'Tell me about yourself'?",
    "How can I improve my communication during interviews?",
    "What should I do if I don't know an answer?"
  ]
};

// Add mock endpoints
if (!apiEndpoints.interviews) {
  apiEndpoints.interviews = {
    createOrLoadConversation: async (userId) => {
      return {
        data: {
          conversationId: "conv1",
          messages: mockInterviewData.conversations[0].messages
        }
      };
    },
    getPreviousConversations: async (userId) => {
      return {
        data: mockInterviewData.conversations
      };
    },
    getInterviewTopics: async () => {
      return {
        data: mockInterviewData.topics
      };
    },
    getSuggestedQuestions: async (userId) => {
      return {
        data: mockInterviewData.suggestedQuestions
      };
    },
    sendMessage: async (conversationId, message) => {
      // Simulate AI response
      const aiResponses = {
        default: {
          role: "assistant",
          content: "I understand your question. To provide the best advice for interview preparation, I would recommend focusing on understanding the job description thoroughly, preparing specific examples from your experience, and practicing common interview questions relevant to your field.",
          timestamp: new Date().toISOString()
        }
      };
      
      return {
        data: aiResponses.default
      };
    },
    loadConversation: async (convoId) => {
      return {
        data: {
          messages: mockInterviewData.conversations[0].messages
        }
      };
    },
    createConversation: async (userId) => {
      return {
        data: {
          conversationId: "new_conv",
        }
      };
    },
    getCategoryQuestions: async (categoryId) => {
      const mockQuestions = [
        "Tell me about a time you had to resolve a conflict in your team.",
        "How do you handle tight deadlines and pressure?",
        "Describe a situation where you failed and how you handled it.",
        "What's your approach to working with difficult team members?"
      ];
      
      return {
        data: mockQuestions
      };
    },
    createMockInterview: async (setupData) => {
      return {
        data: {
          mockInterviewId: "mock1",
          questions: [
            "Tell me about yourself and your background.",
            "Why are you interested in this role?",
            "What are your greatest strengths and weaknesses?",
            "Tell me about a challenging situation you faced at work.",
            "Where do you see yourself in 5 years?"
          ]
        }
      };
    },
    createMockInterviewSetup: async (mockInterviewId, setupData) => {
      return {
        data: {
          success: true
        }
      };
    }
  };
}

const AIInterviewCoach = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [previousConversations, setPreviousConversations] = useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [topicCategories, setTopicCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryQuestions, setCategoryQuestions] = useState([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [questionMenuAnchorEl, setQuestionMenuAnchorEl] = useState(null);
  const [topicMenuAnchorEl, setTopicMenuAnchorEl] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [feedbackDetails, setFeedbackDetails] = useState(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [mockInterviewMode, setMockInterviewMode] = useState(false);
  const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]);
  const [currentMockQuestionIndex, setCurrentMockQuestionIndex] = useState(0);
  const [mockInterviewDialogOpen, setMockInterviewDialogOpen] = useState(false);
  const [mockInterviewSetupData, setMockInterviewSetupData] = useState({
    jobTitle: '',
    questionCount: 5,
    difficultyLevel: 'medium',
    includesBehavioral: true,
    includesTechnical: true
  });
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const chatEndRef = useRef(null);
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
        const { conversationId, messages: conversationMessages } = conversationResponse.data;
        
        setConversationId(conversationId);
        setMessages(conversationMessages || []);
        
        // Fetch previous conversations
        const previousConversationsResponse = await apiEndpoints.interviews.getPreviousConversations(profile.id);
        setPreviousConversations(previousConversationsResponse.data || []);
        
        // Fetch topic categories
        const topicCategoriesResponse = await apiEndpoints.interviews.getInterviewTopics();
        setTopicCategories(topicCategoriesResponse.data || []);
        
        // Fetch suggested questions
        const suggestedQuestionsResponse = await apiEndpoints.interviews.getSuggestedQuestions(profile.id);
        setSuggestedQuestions(suggestedQuestionsResponse.data || []);
        
        // Initialize Speech Recognition if available
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          setSpeechRecognition(new SpeechRecognition());
        }
        
        // Add initial greeting from the coach if there are no messages
        if (!conversationMessages || conversationMessages.length === 0) {
          const greeting = {
            role: 'assistant',
            content: "Hello! I'm your AI Interview Coach. I can help you prepare for interviews by providing advice, answering questions, and simulating interview scenarios. How can I assist you today?",
            timestamp: new Date().toISOString()
          };
          
          setMessages([greeting]);
          
          // Save the greeting to the backend
          await apiEndpoints.interviews.sendMessage(conversationId, greeting);
        }
      } catch (err) {
        setError('Failed to initialize interview coach');
        console.error('Error initializing interview coach:', err);
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
  }, [profile]);
  
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
  
  // Send a message to the AI coach
  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return;
    
    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };
    
    // Add user message to the chat
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    
    try {
      // Send message to backend
      const response = await apiEndpoints.interviews.sendMessage(conversationId, userMessage);
      
      // Add AI response to the chat
      const aiMessage = response.data;
      setMessages(prev => [...prev, aiMessage]);
      
      // Update suggested questions if available
      if (response.data.suggestedQuestions) {
        setSuggestedQuestions(response.data.suggestedQuestions);
      }
      
      // Check if feedback is available
      if (aiMessage.feedback) {
        setFeedbackDetails(aiMessage.feedback);
      }
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Sorry, there was an error processing your message. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
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
      
      // Add initial greeting from the coach
      const greeting = {
        role: 'assistant',
        content: "Hello! I'm your AI Interview Coach. I can help you prepare for interviews by providing advice, answering questions, and simulating interview scenarios. How can I assist you today?",
        timestamp: new Date().toISOString()
      };
      
      setMessages([greeting]);
      
      // Save the greeting to the backend
      await apiEndpoints.interviews.sendMessage(response.data.conversationId, greeting);
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
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              AI Interview Coach
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" align="center" sx={{ mb: 4 }}>
              Practice interviews and get personalized feedback
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3, height: '60vh', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                {messages.map((message, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                      mb: 2 
                    }}
                  >
                    <Paper 
                      sx={{ 
                        p: 2, 
                        maxWidth: '80%',
                        bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                        color: message.role === 'user' ? 'primary.contrastText' : 'text.primary'
                      }}
                    >
                      <Typography variant="body1">{message.content}</Typography>
                    </Paper>
                  </Box>
                ))}
                <div ref={chatEndRef} />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  fullWidth
                  placeholder="Type your message here..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isTyping}
                  multiline
                  maxRows={3}
                  variant="outlined"
                  sx={{ mr: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  startIcon={<Send />}
                >
                  Send
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Suggested Questions
              </Typography>
              <List>
                {suggestedQuestions.map((question, index) => (
                  <ListItem 
                    key={index}
                    button
                    onClick={() => sendPredefinedQuestion(question)}
                  >
                    <ListItemText primary={question} />
                  </ListItem>
                ))}
              </List>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Topics
              </Typography>
              <List>
                {topicCategories.map((topic) => (
                  <ListItem 
                    key={topic.id}
                    button
                    onClick={() => loadCategoryQuestions(topic)}
                  >
                    <ListItemText 
                      primary={topic.name} 
                      secondary={`${topic.count} questions`} 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AIInterviewCoach; 