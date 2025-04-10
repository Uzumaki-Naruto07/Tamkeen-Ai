import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, Stepper,
  Step, StepLabel, Divider, CircularProgress,
  Grid, Card, CardContent, Alert, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, LinearProgress,
  Container, TextField, List, ListItem, ListItemText,
  ListItemIcon, Chip, Rating
} from '@mui/material';
import {
  Videocam, VideocamOff, Mic, MicOff,
  Settings, Close, PlayArrow, Pause,
  SkipNext, AssignmentTurnedIn, Save,
  Share, StarOutline, Star, Timer,
  Assessment, Psychology, Lightbulb,
  QuestionAnswer, Work, School, CheckCircle,
  VolumeUp, CheckCircleOutline, ErrorOutline, LightbulbOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

// Add mock API implementation for interview functionality
// This is a temporary solution until the real API is implemented
const mockInterviewApi = {
  getTemplates: async () => {
    console.log('Using mock interview templates');
    return {
      data: [
        { id: 'template1', name: 'General Interview' },
        { id: 'template2', name: 'Software Engineering' },
        { id: 'template3', name: 'Product Management' },
        { id: 'template4', name: 'Data Science' },
        { id: 'template5', name: 'UI/UX Design' },
      ]
    };
  },
  generateQuestions: async (params) => {
    console.log('Generating mock interview questions', params);
    return {
      data: {
        interviewId: 'mock-interview-' + Date.now(),
        questions: [
          {
            text: "Tell me about yourself and your professional background.",
            hint: "Focus on relevant experience and skills for this role."
          },
          {
            text: "Why are you interested in this position?",
            hint: "Connect your goals with the company's mission."
          },
          {
            text: "Describe a challenging situation you faced at work and how you resolved it.",
            hint: "Use the STAR method: Situation, Task, Action, Result."
          },
          {
            text: "What are your greatest strengths and how do they align with this role?",
            hint: "Provide specific examples that demonstrate these strengths."
          },
          {
            text: "Where do you see yourself professionally in 5 years?",
            hint: "Show ambition while being realistic about career progression."
          }
        ]
      }
    };
  },
  analyzeAnswer: async (formData) => {
    console.log('Analyzing mock answer', formData.get('questionIndex'));
    
    // Get transcription text
    const transcriptionText = formData.get('transcription') || '';
    
    try {
      // Analyze text for features and scores
      const analysis = await analyzeResponseText(transcriptionText);
      console.log('Detailed analysis results:', analysis);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Ensure all required fields are present with fallbacks
      return {
        data: {
          clarity: analysis.communication || 0,
          relevance: analysis.relevance || 0, 
          confidence: analysis.confidence || 0,
          technical: analysis.technical || 0,
          communication: analysis.communication || 0,
          problemSolving: analysis.technical || 0, // Use technical as fallback
          culturalFit: analysis.relevance || 0, // Use relevance as fallback
          overall: analysis.overallScore || 0,
          category: analysis.category || "Average",
          tip: analysis.improvementTips?.[0] || "Continue practicing your interview skills.",
          strengths: analysis.strengths || [],
          weaknesses: analysis.weaknesses || []
        }
      };
    } catch (error) {
      console.error('Error in mock interview analysis:', error);
      
      // Check if we have any text to analyze
      if (transcriptionText && transcriptionText.trim().length > 0) {
        // Basic word count analysis as fallback
        const words = transcriptionText.split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        
        console.log(`Fallback analysis with word count: ${wordCount}`);
        
        // Determine score based on word count
        let score = 0;
        let category = "No Answer";
        
        if (wordCount >= 60) {
          score = 85;
          category = "Excellent";
        } else if (wordCount >= 30) {
          score = 70; 
          category = "Good";
        } else if (wordCount >= 15) {
          score = 50;
          category = "Average";
        } else if (wordCount >= 5) {
          score = 30;
          category = "Needs Improvement";
        } else {
          score = 10;
          category = "Poor";
        }
        
        return {
          data: {
            clarity: score,
            relevance: score,
            confidence: score,
            technical: score,
            communication: score,
            problemSolving: score,
            culturalFit: score,
            overall: score,
            category: category,
            tip: "Continue practicing your interview skills.",
            strengths: wordCount > 10 ? ["Provided a response"] : [],
            weaknesses: wordCount < 30 ? ["Response could be more detailed"] : []
          }
        };
      }
      
      // Last resort: No valid response detected
      return {
        data: {
          clarity: 0,
          relevance: 0,
          confidence: 0,
          technical: 0,
          communication: 0,
          problemSolving: 0,
          culturalFit: 0,
          overall: 0,
          category: "No Answer",
          tip: "Make sure to speak clearly and provide a complete answer.",
          strengths: [],
          weaknesses: ["No valid response detected"]
        }
      };
    }
  },
  submitInterview: async (formData) => {
    console.log('Submitting mock interview data');
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      data: {
        success: true,
        message: "Interview completed successfully"
      }
    };
  }
};

// Text analysis utilities
const analyzeResponseText = async (text, question, jobRole) => {
  console.log("Analyzing response with text:", text);
  
  if (!text || text.trim() === "" || text.includes("I didn't catch what you said") || text.includes("No speech detected")) {
    console.log("No text to analyze");
    return {
      overallScore: 0,
      technical: 0,
      communication: 0,
      relevance: 0,
      confidence: 0,
      strengths: [],
      weaknesses: ["No answer provided"],
      improvementTips: ["Please provide an answer to the question"],
      category: "No Answer"
    };
  }
  
  // First try to use DeepSeek API for advanced analysis
  try {
    console.log("Attempting to use DeepSeek API for response analysis");
    // Use the correct server port (simple_upload_server.py on port 5004)
    const apiUrl = 'http://localhost:5004/api/interview/analyze-with-deepseek';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: text,
        question: question || "Tell me about yourself",
        jobRole: jobRole || "Software Developer"
      })
    });
    
    if (response.ok) {
      const analysisResult = await response.json();
      console.log("DeepSeek analysis result:", analysisResult);
      
      // Ensure the result has all the fields we need
      return {
        overallScore: analysisResult.overallScore || 0,
        technical: analysisResult.technicalAccuracy || analysisResult.technical || 0,
        communication: analysisResult.communicationClarity || analysisResult.communication || 0, 
        relevance: analysisResult.relevance || 0,
        confidence: analysisResult.confidence || 0,
        strengths: analysisResult.strengths || [],
        weaknesses: analysisResult.weaknesses || [],
        improvementTips: analysisResult.improvementTips || [],
        category: analysisResult.category || "Average"
      };
    } else {
      console.warn(`Failed to get analysis from DeepSeek API (${response.status}: ${response.statusText}), falling back to local analysis`);
      throw new Error(`DeepSeek API failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error using DeepSeek API:", error);
    
    // Fall back to local analysis
    console.log("Word count:", text.split(/\s+/).length);
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    // Determine scores and category based on word count
    let overallScore = 0;
    let category = "No Answer";
    
    if (wordCount >= 60) {
      overallScore = 85;
      category = "Excellent";
    } else if (wordCount >= 30) {
      overallScore = 70;
      category = "Good";
    } else if (wordCount >= 15) {
      overallScore = 50;
      category = "Average";
    } else if (wordCount >= 5) {
      overallScore = 30;
      category = "Needs Improvement";
    } else {
      overallScore = 10;
      category = "Poor";
    }
    
    return {
      overallScore: overallScore,
      technical: overallScore,
      communication: overallScore,
      relevance: overallScore,
      confidence: overallScore,
      strengths: wordCount > 20 ? ["Provided a response"] : [],
      weaknesses: wordCount < 30 ? ["Response could be more detailed"] : [],
      improvementTips: ["Practice giving more comprehensive answers"],
      category: category
    };
  }
};

// Define interview categories
const interviewCategories = [
  {
    id: 'tech',
    name: 'Technical',
    icon: <Work />,
    description: 'Technical interviews for software engineers, data scientists, and other tech roles',
    subcategories: ['Software Engineering', 'Data Science', 'DevOps', 'IT Support']
  },
  {
    id: 'behavioral',
    name: 'Behavioral',
    icon: <Psychology />,
    description: 'Behavioral interviews focusing on soft skills and past experiences',
    subcategories: ['Leadership', 'Team Collaboration', 'Problem Solving', 'Conflict Resolution']
  },
  {
    id: 'case',
    name: 'Case Study',
    icon: <Assessment />,
    description: 'Case interviews for consulting, business analysis, and product management roles',
    subcategories: ['Management Consulting', 'Business Analysis', 'Product Management', 'Marketing Strategy']
  },
  {
    id: 'academic',
    name: 'Academic',
    icon: <School />,
    description: 'Academic interviews for research, teaching, and higher education positions',
    subcategories: ['Research', 'Teaching', 'Administration', 'Scholarship']
  }
];

const MockInterview = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [interviewSettings, setInterviewSettings] = useState({
    duration: 20,
    questionCount: 5,
    difficulty: 'medium',
    includeVideoAnalysis: true,
    includeVoiceAnalysis: true,
    jobTitle: '',
    industry: ''
  });
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [interviewId, setInterviewId] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [answerTime, setAnswerTime] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [quickFeedback, setQuickFeedback] = useState(null);
  const [interviewTemplates, setInterviewTemplates] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState({
    camera: false,
    microphone: false
  });
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [isReadingQuestion, setIsReadingQuestion] = useState(false);
  const [answerVideoUrl, setAnswerVideoUrl] = useState(null);
  const [isReviewingAnswer, setIsReviewingAnswer] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(navigator.language || 'en-US');
  const englishDialects = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'en-AU', name: 'English (Australia)' },
    { code: 'en-CA', name: 'English (Canada)' },
    { code: 'en-IN', name: 'English (India)' },
    { code: 'en-NZ', name: 'English (New Zealand)' },
    { code: 'en-ZA', name: 'English (South Africa)' }
  ];
  
  // Initialize refs
  const videoRef = useRef(null);
  const answerVideoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoChunksRef = useRef([]);
  const timerRef = useRef(null);
  const questionTimerRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRecorderRef = useRef(null);
  
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Fetch interview templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // Use mock API instead of missing real API endpoint
        const response = await mockInterviewApi.getTemplates();
        setInterviewTemplates(response.data);
      } catch (err) {
        console.error('Error fetching interview templates:', err);
        setError('Failed to load interview templates');
      }
    };
    
    fetchTemplates();
    
    // Cleanup function
    return () => {
      stopMediaTracks();
      clearTimers();
    };
  }, []);
  
  // Clear timers when component unmounts
  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
  };
  
  // Stop all media tracks
  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };
  
  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);
  
  // Initialize camera when the component mounts
  useEffect(() => {
    // Initialize camera when reaching the active interview step
    if (activeStep === 2) {
      initializeCamera();
    }
    
    // Cleanup function to stop media tracks when unmounting
    return () => {
      stopMediaTracks();
      clearTimers();
    };
  }, [activeStep]);
  
  // Initialize camera
  const initializeCamera = async () => {
    try {
      await requestMediaPermissions();
    } catch (err) {
      console.error('Error initializing camera:', err);
      setError('Failed to initialize camera. Please check your camera permissions.');
    }
  };
  
  // Request camera and microphone permissions
  const requestMediaPermissions = async () => {
    try {
      // Stop any existing streams first
      stopMediaTracks();
      
      console.log('Requesting media permissions...');
      
      // Request with video and audio
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      });
      
      // Save stream to ref
      streamRef.current = mediaStream;
      
      console.log('Media permissions granted, stream obtained:', streamRef.current);
      
      // Connect stream to video element if available
      if (videoRef.current) {
        console.log('Setting video source to stream');
        videoRef.current.srcObject = mediaStream;
        
        // Play the video when metadata is loaded
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, playing...');
          videoRef.current.play()
            .then(() => console.log('Video playback started successfully'))
            .catch(e => console.error('Error playing video:', e));
        };
      } else {
        console.error('Video reference is not available - will initialize later');
        // Don't fail here - we'll try to attach the stream when the ref is available
      }
      
      setPermissionsGranted({
        camera: true,
        microphone: true
      });
      
      setCameraActive(true);
      setMicActive(true);
      
      return true;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Please allow access to camera and microphone to proceed. Error: ' + err.message);
      setPermissionsGranted({
        camera: false,
        microphone: false
      });
      return false;
    }
  };
  
  // Toggle camera
  const toggleCamera = async () => {
    if (cameraActive) {
      // Turn off camera
      if (streamRef.current) {
        const videoTracks = streamRef.current.getVideoTracks();
        videoTracks.forEach(track => track.enabled = false);
      }
      setCameraActive(false);
    } else {
      // Turn on camera
      if (streamRef.current) {
        const videoTracks = streamRef.current.getVideoTracks();
        videoTracks.forEach(track => track.enabled = true);
      } else {
        // Request permissions again if stream doesn't exist
        await requestMediaPermissions();
      }
      setCameraActive(true);
    }
  };
  
  // Toggle microphone
  const toggleMicrophone = async () => {
    if (micActive) {
      // Turn off microphone
      if (streamRef.current) {
        const audioTracks = streamRef.current.getAudioTracks();
        audioTracks.forEach(track => track.enabled = false);
      }
      setMicActive(false);
    } else {
      // Turn on microphone
      if (streamRef.current) {
        const audioTracks = streamRef.current.getAudioTracks();
        audioTracks.forEach(track => track.enabled = true);
      } else {
        // Request permissions again if stream doesn't exist
        await requestMediaPermissions();
      }
      setMicActive(true);
    }
  };
  
  // Handle interview settings change
  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInterviewSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Start the interview setup
  const handleStartSetup = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Generate interview questions based on selected template
      // Use mock API instead of missing real API endpoint
      const response = await mockInterviewApi.generateQuestions({
        templateId: selectedTemplate,
        settings: interviewSettings
      });
      
      setInterviewQuestions(response.data.questions || []);
      setInterviewId(response.data.interviewId);
      
      // Request camera and microphone permissions
      const permissionsGranted = await requestMediaPermissions();
      
      if (permissionsGranted) {
        setSetupComplete(true);
        setActiveStep(1); // Move to preparation step
      }
    } catch (err) {
      setError('Failed to generate interview questions');
      console.error('Interview setup error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Start the interview
  const startInterview = () => {
    if (!selectedCategory) {
      setError('Please select a category to start the interview');
      return;
    }
    
    // Create mock questions upfront
    const mockQuestions = [
      {
        text: "Tell me about yourself and your professional background.",
        hint: "Focus on relevant experience and skills for this role."
      },
      {
        text: "Why are you interested in this position?",
        hint: "Connect your goals with the company's mission."
      },
      {
        text: "Describe a challenging situation you faced at work and how you resolved it.",
        hint: "Use the STAR method: Situation, Task, Action, Result."
      },
      {
        text: "What are your greatest strengths and how do they align with this role?",
        hint: "Provide specific examples that demonstrate these strengths."
      },
      {
        text: "Where do you see yourself professionally in 5 years?",
        hint: "Show ambition while being realistic about career progression."
      }
    ];
    
    // Always set these questions to ensure we have them
    setInterviewQuestions(mockQuestions);
    setInterviewId('mock-interview-' + Date.now());
    
    console.log('Starting interview with questions:', mockQuestions);
    
    // Make sure the interview will show the active interview screen
    setInterviewComplete(false);
    setActiveStep(2); // Move to interview step
    
    // Set initial remaining time - convert minutes to seconds
    const totalSeconds = interviewSettings.duration * 60;
    setRemainingTime(totalSeconds);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Start overall interview timer with more precise tracking
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 0) {
          // Time's up - end interview
          clearInterval(timerRef.current);
          handleInterviewComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Initialize answers array
    setAnswers([]);
    
    // Need to wait for state updates before asking the first question
    setTimeout(() => {
      console.log('Questions ready, asking first question', mockQuestions);
      askQuestion(0, mockQuestions);
    }, 300);
  };
  
  // Ask a specific question with explicit questions array
  const askQuestion = (index, questionsArray) => {
    // Use provided questions array or fall back to state
    const questions = questionsArray || interviewQuestions;
    
    if (!questions || questions.length === 0) {
      console.error('No interview questions available');
      return;
    }
    
    console.log('Asking question', index, 'of', questions.length, questions[index]);
    
    if (index >= questions.length) {
      // No more questions - end interview
      handleInterviewComplete();
      return;
    }
    
    // Clean up previous question state
    setAnswerVideoUrl(null);
    setTranscription('');
    setShowFeedback(false);
    setQuickFeedback(null);
    setIsReviewingAnswer(false);
    
    // Clear any video chunks that might be leftover
    videoChunksRef.current = [];
    audioChunksRef.current = [];
    
    // Set current question index
    setCurrentQuestionIndex(index);
    
    // Reset answer time
    setAnswerTime(0);
    
    // Clear any existing question timer
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }
    
    // Start question timer
    questionTimerRef.current = setInterval(() => {
      setAnswerTime(prev => prev + 1);
    }, 1000);
    
    // Only start recording if we have permissions
    if (permissionsGranted.camera && permissionsGranted.microphone) {
      startRecording();
    } else {
      console.log('Skipping recording - no camera/mic permissions');
    }
  };
  
  // Read question aloud using text-to-speech
  const readQuestionAloud = () => {
    if (!speechSynthesis || !interviewQuestions[currentQuestionIndex]?.text) return;
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const question = interviewQuestions[currentQuestionIndex].text;
    const utterance = new SpeechSynthesisUtterance(question);
    
    // Set speaking properties
    utterance.rate = 0.9; // Slightly slower than normal
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Use a preferred voice if available
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') || 
      voice.name.includes('Samantha')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    // Add event handlers
    utterance.onstart = () => setIsReadingQuestion(true);
    utterance.onend = () => setIsReadingQuestion(false);
    utterance.onerror = () => setIsReadingQuestion(false);
    
    // Speak the question
    speechSynthesis.speak(utterance);
  };
  
  // Initialize speech recognition
  useEffect(() => {
    // Only initialize when recording is starting
    if (!recording) {
      return;
    }
    
    // Create and initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      try {
        // Stop any existing recognition instance first
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
            recognitionRef.current = null;
          } catch (e) {
            console.error('Error cleaning up previous recognition:', e);
          }
        }
        
        // Create fresh recognition instance
        const recognition = new SpeechRecognition();
        
        // Configure recognition
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage;
        console.log('Speech recognition language set to:', recognition.lang);
        
        // Track recognition state
        setIsTranscribing(true);
        
        // Set up event handlers
        recognition.onstart = () => {
          console.log('Speech recognition started successfully');
          setIsTranscribing(true);
        };
        
        recognition.onresult = (event) => {
          console.log('Speech recognition result received', event.results);
          // Get combined transcript from all results
          let finalTranscript = '';
          
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;
            
            // Log detailed info about each result
            console.log(`Result ${i}: "${transcript}" - Confidence: ${confidence}`);
            
            // Accept more results by lowering the confidence threshold
            if (confidence > 0.1) { // Reduced threshold from 0.3 to 0.1
              finalTranscript += transcript + ' ';
            }
          }
          
          if (finalTranscript) {
            // Set complete transcript
            setTranscription(finalTranscript.trim());
            console.log('Transcription updated:', finalTranscript);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error, event);
          if (event.error === 'no-speech') {
            console.log('No speech detected, continuing to listen...');
            // Don't stop listening, just keep going
          } else if (event.error === 'audio-capture') {
            setError('Microphone not working or not allowed. Please check your settings.');
          } else if (event.error === 'not-allowed') {
            setError('Microphone permission denied. Please allow microphone access.');
          } else {
            // Other errors - try to restart
            try {
              recognition.abort();
              setTimeout(() => {
                if (recording) {
                  try {
                    recognition.start();
                  } catch (e) {
                    console.error('Failed to restart recognition after error:', e);
                  }
                }
              }, 500);
            } catch (e) {
              console.error('Failed to restart after error:', e);
            }
          }
        };
        
        recognition.onend = () => {
          console.log('Speech recognition ended');
          
          // If still recording, restart immediately
          if (recording) {
            try {
              console.log('Attempting to restart speech recognition');
              
              // Add a slight delay before restarting
              setTimeout(() => {
                try {
                  recognition.start();
                  console.log('Restarted speech recognition');
                } catch (restartError) {
                  console.error('Error in delayed restart:', restartError);
                  
                  // Create a new instance if restart fails
                  try {
                    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                    if (SpeechRecognition) {
                      const newRecognition = new SpeechRecognition();
                      newRecognition.continuous = true;
                      newRecognition.interimResults = true;
                      newRecognition.lang = selectedLanguage;
                      console.log('Speech recognition language set to:', newRecognition.lang);
                      
                      // Transfer event handlers to new instance
                      newRecognition.onstart = recognition.onstart;
                      newRecognition.onresult = recognition.onresult;
                      newRecognition.onerror = recognition.onerror;
                      newRecognition.onend = recognition.onend;
                      
                      try {
                        newRecognition.start();
                        recognitionRef.current = newRecognition;
                        console.log('Created and started new recognition instance');
                      } catch (newStartError) {
                        console.error('Failed to start new recognition instance:', newStartError);
                        setIsTranscribing(false);
                      }
                    }
                  } catch (newInstanceError) {
                    console.error('Failed to create new recognition instance:', newInstanceError);
                    setIsTranscribing(false);
                  }
                }
              }, 300); // 300ms delay to allow internal state to reset
            } catch (outerError) {
              console.error('Outer error in recognition restart:', outerError);
              setIsTranscribing(false);
            }
          } else {
            setIsTranscribing(false);
          }
        };
        
        // Store the recognition instance
        recognitionRef.current = recognition;
        setSpeechRecognition(recognition);
        
        // Start the recognition
        try {
          recognition.start();
          console.log('Speech recognition initialized successfully');
        } catch (startError) {
          console.error('Error starting initial speech recognition:', startError);
        }
      } catch (e) {
        console.error('Error initializing speech recognition:', e);
        setError('Failed to initialize speech recognition. Please try a different browser.');
      }
    } else {
      console.warn('Speech recognition not supported in this browser');
      setError('Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.');
    }
    
    // Clean up on unmount or when dependencies change
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          recognitionRef.current = null;
        } catch (e) {
          console.error('Error cleaning up speech recognition:', e);
        }
      }
    };
  }, [recording, selectedLanguage]); // Also re-initialize when language changes
  
  // Start speech recognition with improved error handling
  const startTranscription = () => {
    // Clear previous transcription when starting a new recording
    setTranscription('');
    
    if (!recognitionRef.current) {
      // Try to create a new instance if not available
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = selectedLanguage;
        console.log('Speech recognition language set to:', recognitionRef.current.lang);
        
        // Setup event handlers
        recognitionRef.current.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          // Process results
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
              console.log('Final transcript segment:', transcript);
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update transcription state if we have final results
          if (finalTranscript) {
            setTranscription(prev => {
              const updatedTranscription = (prev || '') + finalTranscript;
              return updatedTranscription;
            });
          }
        };
        
        // Handle end event to restart continuous recognition
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsTranscribing(false);
          
          // Restart if we're still recording
          if (recording) {
            try {
              console.log('Restarting speech recognition');
              recognitionRef.current.start();
              setIsTranscribing(true);
            } catch (err) {
              console.error('Error restarting speech recognition:', err);
            }
          }
        };
        
        // Handle errors
        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsTranscribing(false);
          
          if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please allow microphone access and try again.');
          }
        };
      }
    }
    
    if (recognitionRef.current) {
      try {
        // Check if recognition is already running
        if (recognitionRef.current.state === 'running') {
          console.log('Speech recognition is already running, not starting again');
          return;
        }
        
        recognitionRef.current.start();
        console.log('Started speech recognition');
        setIsTranscribing(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        
        // If error is "already started", don't recreate
        if (error.message && error.message.includes('already started')) {
          console.log('Recognition already started, continuing with existing instance');
          return;
        }
              
        // Try to create a new instance if start fails
        try {
          console.log('Creating new speech recognition instance');
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (SpeechRecognition) {
            const newRecognition = new SpeechRecognition();
            newRecognition.continuous = true;
            newRecognition.interimResults = true;
            newRecognition.lang = selectedLanguage;
            
            // Setup event handlers on new instance
            newRecognition.onresult = recognitionRef.current.onresult;
            newRecognition.onend = recognitionRef.current.onend;
            newRecognition.onerror = recognitionRef.current.onerror;
            
            console.log('Speech recognition language set to:', newRecognition.lang);
            newRecognition.start();
            recognitionRef.current = newRecognition;
          }
        } catch (secondError) {
          console.error('Failed to create and start new recognition instance:', secondError);
          setIsTranscribing(false);
          setError('Speech recognition failed to start. Please try using a different browser.');
        }
      }
    }
  };
  
  // Stop speech recognition
  const stopTranscription = () => {
    if (recognitionRef.current) {
      try {
        console.log('Stopping speech recognition and finalizing transcription');
        
        // Make sure we get any pending final results
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended after stop');
          setIsTranscribing(false);
        };
        
        recognitionRef.current.stop();
        console.log('Stopped speech recognition');
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        // Try to abort if stop fails
        try {
          recognitionRef.current.abort();
          recognitionRef.current = null;
        } catch (e) {
          console.error('Failed to abort recognition:', e);
        }
      }
      setIsTranscribing(false);
    }
  };
  
  // Start recording answer with transcription
  const startRecording = () => {
    // Ensure we have a valid stream
    if (!streamRef.current) {
      console.error('No media stream available');
      
      // Try to reinitialize camera
      requestMediaPermissions().then(success => {
        if (success) {
          console.log('Camera reinitialized, retrying recording');
          // Wait a bit and try recording again
          setTimeout(() => startRecording(), 1000);
        } else {
          setError('Cannot start recording without camera and microphone access. Please grant permissions.');
        }
      });
      return;
    }
    
    // Reset chunks at the start of each recording
    videoChunksRef.current = [];
    audioChunksRef.current = [];
    
    // Clear previous transcription
    setTranscription('');
    
    // Start recording UI state
    setRecording(true);
    setShowFeedback(false);
    setQuickFeedback(null);
    
    try {
      // Check if we have both video and audio tracks
      const hasVideoTrack = streamRef.current.getVideoTracks().length > 0;
      const hasAudioTrack = streamRef.current.getAudioTracks().length > 0;
      
      if (hasVideoTrack && hasAudioTrack) {
        console.log('Stream has video and audio tracks, starting recording');
      } else {
        console.warn(`Stream missing tracks: video=${hasVideoTrack}, audio=${hasAudioTrack}`);
      }
      
      // Try to create a MediaRecorder with various codecs/formats
      let options = {}; // Default options
      
      try {
        const types = [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
          'video/mp4',
          { mimeType: 'video/webm;codecs=vp9,opus' },
          { mimeType: 'video/webm;codecs=vp8,opus' },
          { mimeType: 'video/webm' },
          { mimeType: 'video/mp4' },
          { mimeType: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"' },
          {}  // Empty options as last resort
        ];
        
        let mediaRecorderCreated = false;
        for (const option of types) {
          try {
            console.log('Trying MediaRecorder with options:', option);
            mediaRecorderRef.current = new MediaRecorder(streamRef.current, option);
            options = option;
            mediaRecorderCreated = true;
            console.log('Successfully created MediaRecorder with options:', option);
            break;
          } catch (codecError) {
            console.warn(`MediaRecorder format not supported: ${option.mimeType || 'default'}`, codecError);
          }
        }
        
        if (!mediaRecorderCreated) {
          throw new Error('None of the codec options are supported');
        }
      } catch (finalError) {
        console.error('Could not create MediaRecorder with any options', finalError);
        setError('Your browser does not support recording. Please try a different browser like Chrome or Edge.');
        return;
      }
      
      console.log('MediaRecorder created with options:', options);
      
      // Setup event handlers BEFORE starting recording

      // Handle data available event
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('Recording data available, size:', event.data.size);
        if (event.data && event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        } else {
          console.warn('Received empty or invalid data chunk');
        }
      };
      
      // Add the onstop handler BEFORE starting recording
      mediaRecorderRef.current.onstop = () => {
        console.log('MediaRecorder onstop triggered, creating video blob');
        
        // Check if we have video data
        if (videoChunksRef.current.length === 0) {
          console.error('No video chunks recorded');
          
          // Try to use audio-only if available
          if (audioChunksRef.current && audioChunksRef.current.length > 0) {
            console.log('Using audio-only recording as fallback');
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            // Create a simple video with just audio
            const videoUrl = URL.createObjectURL(audioBlob);
            setAnswerVideoUrl(videoUrl);
          } else {
            setError('No video or audio was recorded. Please check your camera and microphone permissions.');
            return;
          }
        } else {
          // Create video blob with all chunks
          const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(videoBlob);
          setAnswerVideoUrl(videoUrl);
          console.log('Video URL created:', videoUrl);
        }
        
        // Store the original transcription before any modifications
        const originalTranscription = transcription;
        console.log('Original transcription before processing:', originalTranscription);
        
        // Ensure transcription has a default value if unavailable
        const finalTranscription = originalTranscription || "I didn't catch what you said. Please speak more clearly next time.";
        
        // Analyze the transcription
        console.log('Analyzing transcription:', finalTranscription);
        const analysis = analyzeResponseText(finalTranscription);
        
        // Check if this is a valid response or a no-speech situation
        // Modified criteria to be less strict - only treat as no speech if truly empty or default message
        const noSpeechDetected = 
          finalTranscription.includes("I didn't catch what you said") || 
          finalTranscription.includes("No speech detected") ||
          finalTranscription.trim().length === 0;
        
        // For no speech detected, enforce scores of 0
        const finalAnalysis = noSpeechDetected ? {
          technical: 0,
          communication: 0,
          problemSolving: 0,
          culturalFit: 0,
          overall: 0,
          confidence: 0,
          relevance: 0,
          category: 'No Answer',
          isNoSpeechDetected: true,
          wordCount: 0,
          strengths: ["No speech detected"],
          weaknesses: [
            "No valid speech detected", 
            "Make sure your microphone is working properly"
          ],
          improvementTip: "Please ensure your microphone is properly connected and speak clearly."
        } : analysis;
        
        try {
          // Save answer with transcription and analysis
          const newAnswer = {
            questionIndex: currentQuestionIndex,
            question: interviewQuestions[currentQuestionIndex],
            videoBlob: videoChunksRef.current.length > 0 
              ? new Blob(videoChunksRef.current, { type: 'video/webm' })
              : new Blob(audioChunksRef.current, { type: 'audio/webm' }),
            videoUrl: answerVideoUrl,
            duration: answerTime,
            transcription: originalTranscription || finalTranscription,
            analysis: finalAnalysis
          };
          
          // Save to answers array
          setAnswers(prev => {
            const updatedAnswers = Array.isArray(prev) ? [...prev] : [];
            updatedAnswers[currentQuestionIndex] = newAnswer;
            return updatedAnswers;
          });
          
          // If no transcription was captured, set a clear message
          if (!originalTranscription || originalTranscription.trim() === '') {
            console.log('No speech detected or transcription empty, setting explicit message');
            setTranscription('No speech detected. Please check your microphone and try speaking more clearly.');
          }
          
          // Get quick feedback
          generateQuickFeedback(newAnswer.videoBlob, originalTranscription || 'No speech detected');
        } catch (saveError) {
          console.error('Error saving answer:', saveError);
          setError('An error occurred while saving your answer. Please try again.');
        }
      };
      
      // Now start recording (AFTER setting up all handlers)
      mediaRecorderRef.current.start(2000); // Collect data every 2 seconds
      console.log('MediaRecorder started');
    
      // Set up separate audio recording as a backup
      try {
        const audioStream = new MediaStream(streamRef.current.getAudioTracks());
        const audioOptions = { mimeType: 'audio/webm' };
        audioRecorderRef.current = new MediaRecorder(audioStream, audioOptions);
        
        audioRecorderRef.current.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        audioRecorderRef.current.start(2000); // Match the same interval as video recorder
        console.log('Separate audio recording started');
      } catch (audioError) {
        console.warn('Could not create separate audio recorder:', audioError);
        // Continue with just video recording, don't fail
      }
      
      // Start speech recognition
      startTranscription();
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording: ' + err.message);
    }
  };
  
  // Generate quick feedback with transcription
  const generateQuickFeedback = async (videoBlob, text) => {
    try {
      // Create form data with video blob and/or text
      const formData = new FormData();
      if (videoBlob) {
        formData.append('video', videoBlob);
      }
      formData.append('questionIndex', currentQuestionIndex);
      formData.append('interviewId', interviewId);
      formData.append('transcription', text || ''); // Include transcribed text
      
      // If we don't have video but have text, analyze text only
      if (!videoBlob && text && text.trim().length > 0) {
        console.log('No video blob available, analyzing text only:', text.substring(0, 50) + '...');
        
        // Create a basic analysis for text-only response
        const textAnalysis = analyzeResponseText(text);
        setQuickFeedback(textAnalysis);
        setShowFeedback(true);
        return;
      }
      
      // Send to backend for analysis
      // Use mock API instead of missing real API endpoint
      const response = await mockInterviewApi.analyzeAnswer(formData);
      
      // Set the feedback data
      setQuickFeedback(response.data);
      setShowFeedback(true);
    } catch (err) {
      console.error('Error generating feedback:', err);
      
      // Fallback to local analysis if API fails
      if (text && text.trim().length > 0) {
        const textAnalysis = analyzeResponseText(text);
        setQuickFeedback(textAnalysis);
        setShowFeedback(true);
      }
    }
  };
  
  // Handle next question
  const handleNextQuestion = () => {
    console.log('Moving to next question, current state:', {
      currentQuestionIndex,
      totalQuestions: interviewQuestions.length,
      answerVideoUrl: !!answerVideoUrl,
      transcription: transcription?.substring(0, 30) + '...'
    });
    
    // Clean up state and UI
    setShowFeedback(false);
    setQuickFeedback(null);
    setTranscription('');
    setAnswerVideoUrl(null);
    setIsReviewingAnswer(false);
    
    // Make sure any ongoing recording is properly stopped
    if (recording) {
      stopRecording();
    }
    
    // Clear any residual data
    videoChunksRef.current = [];
    audioChunksRef.current = [];
    
    // Make sure recording is fully stopped
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Error stopping media recorder during next question:', err);
      }
      // Reset the reference
      mediaRecorderRef.current = null;
    }
    
    // Stop any audio recording
    if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
      try {
        audioRecorderRef.current.stop();
      } catch (err) {
        console.error('Error stopping audio recorder during next question:', err);
      }
      // Reset the reference
      audioRecorderRef.current = null;
    }
    
    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < interviewQuestions.length) {
      // Allow a brief delay for cleanup
      setTimeout(() => {
        askQuestion(nextIndex);
      }, 300);
    } else {
      handleInterviewComplete();
    }
  };
  
  // Handle interview completion
  const handleInterviewComplete = () => {
    console.log('Interview complete. Questions:', interviewQuestions.length, 'Answers:', answers.length);
    
    // Stop recording if still active
    stopRecording();
    
    // Clear all timers
    clearTimers();
    
    setInterviewComplete(true);
    setActiveStep(3); // Move to completion step
    
    // Don't auto-upload right away, let user see the completion screen first
  };
  
  // Upload interview data for results page
  const uploadInterviewData = () => {
    if (!interviewId || !answers || answers.length === 0) {
      console.error('Missing interview data for upload');
      return;
    }

    try {
      console.log('Preparing interview data for upload...');
      
      // Create a unique interview ID if needed
      const uniqueInterviewId = interviewId || 'mock-interview-' + Date.now();
      
      // Create a structured interview object
      const interviewData = {
        id: uniqueInterviewId,
        title: selectedCategory ? `${selectedCategory} Interview` : 'Mock Interview',
        date: new Date().toISOString(),
        duration: Math.round(interviewSettings.duration * 60 - remainingTime) / 60 || 15,
        questions: interviewQuestions.map((question, index) => {
          const answer = answers[index] || null;
          
          // Process answer data and handle no-speech scenarios
          let processedAnalysis = {
            technical: 50,
            communication: 50,
            problemSolving: 50,
            culturalFit: 50,
            overall: 50,
            category: 'Average'
          };
          
          if (answer) {
            const wasNoSpeech = answer.analysis?.category === 'No Answer' || 
                               answer.transcription?.includes("I didn't catch what you said") ||
                               answer.transcription?.includes("No speech detected");
            
            if (wasNoSpeech) {
              processedAnalysis = {
                technical: 0,
                communication: 0,
                problemSolving: 0,
                culturalFit: 0,
                overall: 0,
                category: 'No Answer'
              };
            } else if (answer.analysis) {
              processedAnalysis = answer.analysis;
            }
          }
          
          return {
            id: `q${index + 1}`,
            text: question.text,
            hint: question.hint,
            answer: answer ? {
              transcription: answer.transcription || '',
              videoUrl: answer.videoUrl || null,
              analysis: processedAnalysis
            } : null
          };
        })
      };

      console.log('Interview data prepared:', interviewData);
      
      // Store in localStorage for persistence across page loads
      try {
        localStorage.setItem(`interview-${uniqueInterviewId}`, JSON.stringify(interviewData));
        console.log('Interview data saved to localStorage');
        
        // Set the ID we'll use for navigation
        if (interviewId !== uniqueInterviewId) {
          setInterviewId(uniqueInterviewId);
        }
      } catch (e) {
        console.error('Failed to save interview to localStorage:', e);
      }
      
      // Also try to send to server
      try {
        const formData = new FormData();
        formData.append('interviewData', JSON.stringify(interviewData));
        formData.append('interviewId', uniqueInterviewId);
        
        mockInterviewApi.submitInterview(formData)
          .then(response => {
            console.log('Interview data uploaded to server:', response);
          })
          .catch(error => {
            console.error('Failed to upload interview data to server:', error);
          });
      } catch (e) {
        console.error('Error preparing interview data for server upload:', e);
      }
      
      return uniqueInterviewId;
    } catch (error) {
      console.error('Error in uploadInterviewData:', error);
      return null;
    }
  };
  
  // Format time (seconds to mm:ss)
  const formatTime = (seconds) => {
    if (seconds < 0) seconds = 0;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Review recorded answer
  const reviewAnswer = () => {
    if (!answerVideoUrl) {
      setError('No recording available to review');
      return;
    }
    
    console.log('Reviewing answer video at URL:', answerVideoUrl);
    setIsReviewingAnswer(true);
    
    // Play the video when it's loaded
    setTimeout(() => {
      if (answerVideoRef.current) {
        console.log('Setting answer video source');
        answerVideoRef.current.src = answerVideoUrl;
        
        // Add event listeners for debugging
        answerVideoRef.current.onloadedmetadata = () => {
          console.log('Answer video metadata loaded, attempting to play');
          answerVideoRef.current.play()
            .then(() => console.log('Answer video playback started'))
            .catch(e => console.error('Error playing answer video:', e));
        };
        
        answerVideoRef.current.onerror = (e) => {
          console.error('Answer video error:', e);
          setError('Error playing back your recorded answer. Please try again.');
        };
      } else {
        console.error('Answer video reference not available');
      }
    }, 100);
  };
  
  // Stop recording
  const stopRecording = () => {
    console.log('Stopping recording - current state:', { recording, mediaRecorderState: mediaRecorderRef.current?.state });
    
    // Stop transcription first to ensure we have the final text
    stopTranscription();
    
    // Capture the current transcription immediately
    const currentTranscription = transcription || '';
    console.log('Captured transcription on stop:', currentTranscription);
    
    // Stop recording if it's active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('Stopping video recording');
      try {
        mediaRecorderRef.current.stop();
        
        // Force the processing of transcription if mediaRecorder doesn't trigger onstop event
        setTimeout(() => {
          // If answerVideoUrl is still null, the onstop handler hasn't been called
          if (!answerVideoUrl && videoChunksRef.current.length > 0) {
            console.log('Processing transcription manually after timeout');
            // Create video blob with all chunks
            const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
            const videoUrl = URL.createObjectURL(videoBlob);
            setAnswerVideoUrl(videoUrl);
            
            // Process transcription
            const finalTranscription = currentTranscription || "I didn't catch what you said. Please speak more clearly next time.";
            const analysis = analyzeResponseText(finalTranscription);
            
            // Save answer with transcription and analysis
            const newAnswer = {
              questionIndex: currentQuestionIndex,
              question: interviewQuestions[currentQuestionIndex],
              videoBlob: videoChunksRef.current.length > 0 
                ? new Blob(videoChunksRef.current, { type: 'video/webm' })
                : new Blob(audioChunksRef.current || [], { type: 'audio/webm' }),
              videoUrl: videoUrl,
              duration: answerTime,
              transcription: currentTranscription || finalTranscription,
              analysis: analysis
            };
            
            // Save to answers array
            setAnswers(prev => {
              const updatedAnswers = Array.isArray(prev) ? [...prev] : [];
              updatedAnswers[currentQuestionIndex] = newAnswer;
              return updatedAnswers;
            });
            
            // Generate quick feedback
            generateQuickFeedback(newAnswer.videoBlob, currentTranscription || 'No speech detected');
          }
        }, 1000); // Wait 1 second to see if normal onstop handler gets called
        
      } catch (e) {
        console.error('Error stopping media recorder:', e);
        
        // Force state cleanup even if stopping fails
        setRecording(false);
        
        // Create empty answer with transcription if one was captured
        if (currentTranscription && currentTranscription.trim().length > 0) {
          const analysis = analyzeResponseText(currentTranscription);
          // Save to answers array
          setAnswers(prev => {
            const updatedAnswers = Array.isArray(prev) ? [...prev] : [];
            updatedAnswers[currentQuestionIndex] = {
              questionIndex: currentQuestionIndex,
              question: interviewQuestions[currentQuestionIndex],
              transcription: currentTranscription,
              analysis: analysis
            };
            return updatedAnswers;
          });
          
          // Generate feedback even if recording failed
          generateQuickFeedback(null, currentTranscription);
        }
      }
    } else {
      console.warn('MediaRecorder not active or unavailable');
      setRecording(false);
      
      // Still try to process any transcription we have
      if (currentTranscription && currentTranscription.trim().length > 0) {
        const analysis = analyzeResponseText(currentTranscription);
        setAnswers(prev => {
          const updatedAnswers = Array.isArray(prev) ? [...prev] : [];
          updatedAnswers[currentQuestionIndex] = {
            questionIndex: currentQuestionIndex,
            question: interviewQuestions[currentQuestionIndex],
            transcription: currentTranscription,
            analysis: analysis
          };
          return updatedAnswers;
        });
        
        // Generate feedback based on transcription only
        generateQuickFeedback(null, currentTranscription);
      }
    }
    
    // Stop audio recording if available
    if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
      console.log('Stopping audio recording');
      try {
        audioRecorderRef.current.stop();
      } catch (e) {
        console.error('Error stopping audio recorder:', e);
      }
    }
    
    // Clear question timer
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }
    
    // Always update the recording state
    setRecording(false);
  };
  
  // Effect to ensure video ref is properly connected when component mounts or refs change
  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      console.log('Setting video source to stream (from ref effect)');
      videoRef.current.srcObject = streamRef.current;
      
      const playVideo = async () => {
        try {
          await videoRef.current.play();
          console.log('Video playback started from ref effect');
        } catch (err) {
          console.error('Error playing video in ref effect:', err);
        }
      };
      
      if (videoRef.current.readyState >= 2) {
        playVideo();
      } else {
        videoRef.current.onloadedmetadata = playVideo;
      }
    }
  }, [videoRef.current, streamRef.current, cameraActive]);
  
  // Find the feedback display section and update it to use the new analysis structure
  const renderFeedback = () => {
    if (!currentQuestionFeedback) return null;
    
    return (
      <Box sx={{ mt: 2, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Feedback for your answer
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mr: 1 }}>
            Overall Score:
          </Typography>
          <Rating 
            value={currentQuestionFeedback.overallScore / 20} 
            precision={0.5} 
            readOnly 
          />
          <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
            ({currentQuestionFeedback.overallScore}/100)
          </Typography>
        </Box>
        
        {currentQuestionFeedback.technicalAccuracy && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">
              Technical Accuracy: {currentQuestionFeedback.technicalAccuracy}/100
            </Typography>
          </Box>
        )}
        
        {currentQuestionFeedback.communicationClarity && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">
              Communication Clarity: {currentQuestionFeedback.communicationClarity}/100
            </Typography>
          </Box>
        )}
        
        {currentQuestionFeedback.relevance && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">
              Relevance: {currentQuestionFeedback.relevance}/100
            </Typography>
          </Box>
        )}
        
        <Divider sx={{ my: 1.5 }} />
        
        <Typography variant="subtitle1" sx={{ mt: 1, mb: 0.5 }}>
          Strengths:
        </Typography>
        <List dense disablePadding>
          {currentQuestionFeedback.strengths && currentQuestionFeedback.strengths.map((strength, index) => (
            <ListItem key={index} disablePadding>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <CheckCircleOutline fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary={strength} />
            </ListItem>
          ))}
        </List>
        
        <Typography variant="subtitle1" sx={{ mt: 1.5, mb: 0.5 }}>
          Areas for Improvement:
        </Typography>
        <List dense disablePadding>
          {currentQuestionFeedback.weaknesses && currentQuestionFeedback.weaknesses.map((weakness, index) => (
            <ListItem key={index} disablePadding>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <ErrorOutline fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText primary={weakness} />
            </ListItem>
          ))}
        </List>
        
        <Typography variant="subtitle1" sx={{ mt: 1.5, mb: 0.5 }}>
          Improvement Tips:
        </Typography>
        <List dense disablePadding>
          {currentQuestionFeedback.improvementTips ? (
            Array.isArray(currentQuestionFeedback.improvementTips) ? 
              currentQuestionFeedback.improvementTips.map((tip, index) => (
                <ListItem key={index} disablePadding>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <LightbulbOutlined fontSize="small" color="info" />
                  </ListItemIcon>
                  <ListItemText primary={tip} />
                </ListItem>
              )) : (
                <ListItem disablePadding>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <LightbulbOutlined fontSize="small" color="info" />
                  </ListItemIcon>
                  <ListItemText primary={currentQuestionFeedback.improvementTips} />
                </ListItem>
              )
          ) : (
            currentQuestionFeedback.improvementTip && (
              <ListItem disablePadding>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <LightbulbOutlined fontSize="small" color="info" />
                </ListItemIcon>
                <ListItemText primary={currentQuestionFeedback.improvementTip} />
              </ListItem>
            )
          )}
        </List>
      </Box>
    );
  };
  
    return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
        Mock Interview Practice
        </Typography>
        
      {activeStep === 2 ? (
        // Display the active interview questions
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {selectedCategory} {selectedSubcategory && `- ${selectedSubcategory}`} Interview
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Timer sx={{ color: 'text.secondary', mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Time Remaining: {formatTime(remainingTime)}
              </Typography>
            </Box>
          </Box>
          
          {/* Speech recognition tips - only show when starting a new question */}
          {!recording && !isReviewingAnswer && !showFeedback && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Speech Recognition Tips:</strong> For best results:
              </Typography>
              <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                <li>Speak clearly at a normal pace</li>
                <li>Use Chrome or Edge browser</li>
                <li>Ensure your microphone is working properly</li>
                <li>Minimize background noise</li>
              </ul>
            </Alert>
          )}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 2,
                height: 320,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'black',
                  position: 'relative',
                  overflow: 'hidden' // Ensure video doesn't overflow
                }}
              >
                {isReviewingAnswer ? (
                  // Show recorded answer video
                  <video
                    ref={answerVideoRef}
                    controls
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain',
                      background: '#000'
                    }}
                  />
                ) : cameraActive ? (
                  // Show live camera feed with mirror effect
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                    muted
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transform: 'scaleX(-1)', // Mirror effect
                      background: '#000'
                    }}
                />
              ) : (
                  // Camera disabled message
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <VideocamOff sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2">
                    Camera is disabled
                  </Typography>
                </Box>
              )}
              
              {recording && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'error.main',
                      mr: 1
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'white' }}>
                    REC {formatTime(answerTime)}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
                  <Button
                    variant="contained"
                    color={cameraActive ? "primary" : "error"}
                  onClick={toggleCamera}
                    startIcon={cameraActive ? <Videocam /> : <VideocamOff />}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    {cameraActive ? 'Camera On' : 'Camera Off'}
                  </Button>
                  
                  <Button
                    variant="contained"
                    color={micActive ? "primary" : "error"}
                  onClick={toggleMicrophone}
                    startIcon={micActive ? <Mic /> : <MicOff />}
                    size="small"
                  >
                    {micActive ? 'Mic On' : 'Mic Off'}
                  </Button>
              </Box>
            </Paper>
            
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
                {isReviewingAnswer ? (
                  // Review mode buttons
                  <Button
                    variant="outlined"
                    onClick={() => setIsReviewingAnswer(false)}
                  >
                    Back to Camera
                  </Button>
                ) : recording ? (
                  // Recording mode button
                <Button
                  variant="contained"
                  color="error"
                  onClick={stopRecording}
                  startIcon={<Pause />}
                >
                  Stop Answer
                </Button>
                ) : answerVideoUrl ? (
                  // Post-recording buttons
                  <>
                    <Button
                      variant="outlined"
                      onClick={reviewAnswer}
                      startIcon={<PlayArrow />}
                    >
                      Review Answer
                    </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNextQuestion}
                  startIcon={<SkipNext />}
                >
                  Next Question
                    </Button>
                  </>
                ) : (
                  // Start recording button
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={startRecording}
                    startIcon={<Videocam />}
                    disabled={!cameraActive || !micActive}
                  >
                    Start Recording
                </Button>
              )}
            </Box>
              
              {/* Display transcription during recording */}
              {(recording || transcription) && (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    maxHeight: 150, 
                    overflow: 'auto',
                    bgcolor: recording ? 'rgba(255, 235, 235, 0.2)' : 'transparent',
                    border: recording ? '1px solid #ffcccc' : '1px solid #e0e0e0',
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {recording ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Mic color="error" sx={{ mr: 1, animation: 'pulse 1.5s infinite ease-in-out' }} />
                        Speech-to-Text {isTranscribing ? '(Listening...)' : '(Initializing...)'}
                      </Box>
                    ) : 'Your Transcribed Answer:'}
                  </Typography>
                  <Typography variant="body2">
                    {transcription || (recording ? 'Waiting for speech...' : 'No speech detected')}
                  </Typography>
                  
                  {/* Word count indicator */}
                  {transcription && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {transcription.split(/\s+/).filter(w => w.length > 0).length} words
                      </Typography>
                    </Box>
                  )}
                </Paper>
              )}
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Question {currentQuestionIndex + 1} of {interviewQuestions.length}
                </Typography>
                
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ my: 1 }}>
                      {interviewQuestions[currentQuestionIndex]?.text || 
                       "Tell me about yourself and your professional background."}
                </Typography>
                
                    <IconButton 
                      onClick={readQuestionAloud}
                      disabled={isReadingQuestion || !speechSynthesis}
                      color="primary"
                      sx={{ ml: 1 }}
                    >
                      {isReadingQuestion ? <VolumeUp /> : <VolumeUp />}
                    </IconButton>
                  </Box>
                  
                  {(interviewQuestions[currentQuestionIndex]?.hint || 
                    "Focus on relevant experience and skills for this role.") && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        <strong>Hint:</strong> {interviewQuestions[currentQuestionIndex]?.hint || 
                         "Focus on relevant experience and skills for this role."}
                    </Typography>
                  </Alert>
                )}
              </Box>
              
              {showFeedback && quickFeedback && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                      Overall Score:
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Clarity:</strong> {quickFeedback.clarity}/10
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={quickFeedback.clarity * 10} 
                      color={quickFeedback.clarity >= 7 ? "success" : quickFeedback.clarity >= 4 ? "warning" : "error"}
                      sx={{ mb: 1 }}
                    />
                    
                    <Typography variant="body2" gutterBottom>
                      <strong>Relevance:</strong> {quickFeedback.relevance}/10
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={quickFeedback.relevance * 10} 
                      color={quickFeedback.relevance >= 7 ? "success" : quickFeedback.relevance >= 4 ? "warning" : "error"}
                      sx={{ mb: 1 }}
                    />
                    
                    <Typography variant="body2" gutterBottom>
                      <strong>Confidence:</strong> {quickFeedback.confidence}/10
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={quickFeedback.confidence * 10} 
                      color={quickFeedback.confidence >= 7 ? "success" : quickFeedback.confidence >= 4 ? "warning" : "error"}
                    />
                  </Box>
                  
                    <Typography variant="subtitle2" gutterBottom>
                      <strong>Category:</strong> {quickFeedback.category}
                      </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
        </Paper>
      ) : (!interviewComplete ? (
        // Display the selection screen
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Select Interview Type
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  {interviewCategories.map((category) => (
                    <MenuItem key={category.id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedCategory && (
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Subcategory</InputLabel>
                  <Select
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    label="Subcategory"
                  >
                    {interviewCategories
                      .find(cat => cat.name === selectedCategory)
                      ?.subcategories.map((subcat) => (
                        <MenuItem key={subcat} value={subcat}>
                          {subcat}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Speech Recognition Language</InputLabel>
                <Select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                >
                  {englishDialects.map(dialect => (
                    <MenuItem key={dialect.code} value={dialect.code}>
                      {dialect.name}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="textSecondary">
                  Select the closest dialect for better speech recognition
                </Typography>
              </FormControl>
              
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={startInterview}
                disabled={!selectedCategory || loading}
              >
                {loading ? 'Preparing Interview...' : 'Start Mock Interview'}
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Available Interview Categories:
              </Typography>
              
              <List>
                {interviewCategories.map((category) => (
                  <ListItem key={category.id} alignItems="flex-start">
                    <ListItemIcon>
                      {category.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={category.name}
                      secondary={category.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        // Display completion message
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <LoadingSpinner />
            </Box>
          ) : null}
        </Paper>
      ))}
      
      {/* Feedback Dialog */}
      <Dialog
        open={showFeedback}
        onClose={() => {
          setShowFeedback(false);
          // Don't reset everything, just close the dialog
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Question Feedback
        </DialogTitle>
        <DialogContent>
          {quickFeedback && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ mr: 2 }}>
                  Overall Score:
                </Typography>
                {quickFeedback.overall > 0 ? (
                  <Chip 
                    label={`${quickFeedback.overall}/100`} 
                    color={quickFeedback.overall >= 75 ? "success" : 
                          quickFeedback.overall >= 40 ? "primary" : "warning"} 
                    sx={{ fontWeight: 'bold', fontSize: '1.1rem', py: 2, px: 1 }}
                  />
                ) : (
                  <Chip 
                    label="No Answer" 
                    color="error" 
                    sx={{ fontWeight: 'bold', fontSize: '1.1rem', py: 2, px: 1 }}
                  />
                )}
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    {quickFeedback.overall > 0 ? (
                      quickFeedback.category === "Strong" ? "⭐ Strong Performance" : 
                      quickFeedback.category === "Average" ? "✓ Solid Performance" : 
                      "△ Needs Improvement"
                    ) : (
                      "❌ No answer detected"
                    )}
                  </Typography>
                </Box>
              </Box>
              
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Question: {interviewQuestions[currentQuestionIndex]?.text || "Interview question"}
                  </Typography>
              
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Your Transcribed Answer:
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ p: 2, mb: 2, bgcolor: quickFeedback.overall === 0 ? '#fff5f5' : '#f9f9f9', maxHeight: 150, overflow: 'auto' }}
                  >
                    <Typography variant="body2" color={quickFeedback.overall === 0 ? "error.main" : "textPrimary"}>
                      {quickFeedback.overall === 0 ? 
                        "No speech detected. Please check your microphone and try speaking more clearly." : 
                        (transcription || "No transcription available")}
                    </Typography>
                  </Paper>
                  
                  {quickFeedback.overall > 0 ? (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                        Performance Analysis:
                      </Typography>
                    
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6} md={3}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="body2" gutterBottom color="text.secondary">
                              Technical
                            </Typography>
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                              <CircularProgress 
                                variant="determinate" 
                                value={quickFeedback.technical} 
                                size={60}
                                thickness={5}
                                color={quickFeedback.technical >= 75 ? "success" : 
                                       quickFeedback.technical >= 50 ? "primary" : 
                                       quickFeedback.technical >= 30 ? "warning" : "error"}
                              />
                              <Box
                                sx={{
                                  top: 0,
                                  left: 0,
                                  bottom: 0,
                                  right: 0,
                                  position: 'absolute',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography variant="caption" component="div" fontWeight="bold">
                                  {quickFeedback.technical}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} md={3}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="body2" gutterBottom color="text.secondary">
                              Communication
                            </Typography>
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                              <CircularProgress 
                                variant="determinate" 
                                value={quickFeedback.communication} 
                                size={60}
                                thickness={5}
                                color={quickFeedback.communication >= 75 ? "success" : 
                                       quickFeedback.communication >= 50 ? "primary" : 
                                       quickFeedback.communication >= 30 ? "warning" : "error"}
                              />
                              <Box
                                sx={{
                                  top: 0,
                                  left: 0,
                                  bottom: 0,
                                  right: 0,
                                  position: 'absolute',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography variant="caption" component="div" fontWeight="bold">
                                  {quickFeedback.communication}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} md={3}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="body2" gutterBottom color="text.secondary">
                              Problem Solving
                            </Typography>
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                              <CircularProgress 
                                variant="determinate" 
                                value={quickFeedback.problemSolving} 
                                size={60}
                                thickness={5}
                                color={quickFeedback.problemSolving >= 75 ? "success" : 
                                       quickFeedback.problemSolving >= 50 ? "primary" : 
                                       quickFeedback.problemSolving >= 30 ? "warning" : "error"}
                              />
                              <Box
                                sx={{
                                  top: 0,
                                  left: 0,
                                  bottom: 0,
                                  right: 0,
                                  position: 'absolute',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography variant="caption" component="div" fontWeight="bold">
                                  {quickFeedback.problemSolving}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6} md={3}>
                          <Box sx={{ textAlign: 'center', p: 1 }}>
                            <Typography variant="body2" gutterBottom color="text.secondary">
                              Cultural Fit
                            </Typography>
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                              <CircularProgress 
                                variant="determinate" 
                                value={quickFeedback.culturalFit} 
                                size={60}
                                thickness={5}
                                color={quickFeedback.culturalFit >= 75 ? "success" : 
                                       quickFeedback.culturalFit >= 50 ? "primary" : 
                                       quickFeedback.culturalFit >= 30 ? "warning" : "error"}
                              />
                              <Box
                                sx={{
                                  top: 0,
                                  left: 0,
                                  bottom: 0,
                                  right: 0,
                                  position: 'absolute',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography variant="caption" component="div" fontWeight="bold">
                                  {quickFeedback.culturalFit}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    
                      <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Strengths:
                          </Typography>
                          <List dense>
                            {(quickFeedback.strengths || []).map((strength, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <CheckCircle color="success" />
                                </ListItemIcon>
                                <ListItemText primary={strength} />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                    
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            Areas for Improvement:
                          </Typography>
                          <List dense>
                            {(quickFeedback.weaknesses || []).map((weakness, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <Lightbulb color="warning" />
                                </ListItemIcon>
                                <ListItemText primary={weakness} />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                      </Grid>
                      
                      {quickFeedback.tip && (
                        <Alert 
                          severity={quickFeedback.overall > 0 ? "info" : "warning"}
                          icon={<Lightbulb />}
                          sx={{ mt: 2 }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            <strong>Pro tip:</strong> {quickFeedback.tip}
                          </Typography>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        What to do:
                      </Typography>
                      <List dense>
                        {(quickFeedback.weaknesses || []).map((weakness, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <Lightbulb color="error" />
                            </ListItemIcon>
                            <ListItemText primary={weakness} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFeedback(false)} color="primary">
            Continue
          </Button>
          <Button
            onClick={handleNextQuestion} 
            color="primary"
            variant="contained"
          >
            Next Question
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Final Results Dialog */}
      <Dialog
        open={interviewComplete}
        onClose={() => {
          setInterviewComplete(false);
          setCurrentQuestionIndex(0);
          setAnswers([]);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Interview Complete
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <AssignmentTurnedIn sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Interview Completed!
            </Typography>
            <Typography variant="body1">
              You've successfully finished the mock interview. Here's your comprehensive analysis.
            </Typography>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Interview Summary
            </Typography>
            
            {/* Summary cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>
                      Questions
                    </Typography>
                    <Typography variant="h4">
                      {Array.isArray(answers) ? answers.length : 0}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>
                      Duration
                    </Typography>
                    <Typography variant="h4">
                      {formatTime(interviewSettings.duration * 60 - remainingTime)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>
                      Avg. Rating
                    </Typography>
                    <Typography variant="h4">
                      {Array.isArray(answers) && answers.length > 0 ? 
                        Math.round(answers.reduce((sum, answer) => 
                          sum + (answer?.analysis?.overall || 0), 0) / answers.length) + '%' 
                        : 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>
                      Performance
                    </Typography>
                    <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {Array.isArray(answers) && answers.length > 0 ? 
                        (answers.reduce((sum, answer) => 
                          sum + (answer?.analysis?.overall || 0), 0) / answers.length) >= 75 ? 
                        <span>⭐⭐⭐</span> : 
                        (answers.reduce((sum, answer) => 
                          sum + (answer?.analysis?.overall || 0), 0) / answers.length) >= 50 ? 
                        <span>⭐⭐</span> : 
                        <span>⭐</span>
                      : 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Skill breakdown */}
            {Array.isArray(answers) && answers.length > 0 && (
              <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Skill Performance Breakdown
                    </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" gutterBottom>
                    Technical Proficiency
                </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.round(answers.reduce((sum, answer) => 
                      sum + (answer?.analysis?.technical || 0), 0) / answers.length)} 
                    color="primary"
                    sx={{ height: 10, borderRadius: 5, mb: 2 }}
                  />
                  
                  <Typography variant="body2" gutterBottom>
                    Communication Skills
                </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.round(answers.reduce((sum, answer) => 
                      sum + (answer?.analysis?.communication || 0), 0) / answers.length)} 
                    color="secondary"
                    sx={{ height: 10, borderRadius: 5, mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" gutterBottom>
                    Problem Solving
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.round(answers.reduce((sum, answer) => 
                      sum + (answer?.analysis?.problemSolving || 0), 0) / answers.length)} 
                    color="success"
                    sx={{ height: 10, borderRadius: 5, mb: 2 }}
                  />
                  
                  <Typography variant="body2" gutterBottom>
                    Cultural Fit
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.round(answers.reduce((sum, answer) => 
                      sum + (answer?.analysis?.culturalFit || 0), 0) / answers.length)} 
                    color="warning"
                    sx={{ height: 10, borderRadius: 5, mb: 2 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          )}
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Your Answers:
          </Typography>
          {Array.isArray(answers) && answers.map((answer, index) => {
            // Apply analysis to each answer if available
            const analysis = answer.analysis || { 
              overall: 50,
              technical: 50,
              communication: 50,
              problemSolving: 50,
              culturalFit: 50,
              category: 'Average'
            };
            
            // Force scores to 0 for no-speech scenarios
            const wasNoSpeech = analysis.category === 'No Answer' || 
                                answer?.transcription?.includes("I didn't catch what you said") ||
                                answer?.transcription?.includes("No speech detected");

            const displayAnalysis = wasNoSpeech ? {
              ...analysis,
              overall: 0,
              technical: 0,
              communication: 0,
              problemSolving: 0,
              culturalFit: 0,
              category: 'No Answer'
            } : analysis;
            
            return (
              <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Question {index + 1}:
                    </Typography>
                    <Chip 
                      label={`${displayAnalysis.overall || 0}/100`} 
                      color={wasNoSpeech ? "error" : 
                             displayAnalysis.overall >= 75 ? "success" : 
                             displayAnalysis.overall >= 50 ? "primary" : "warning"} 
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body1" gutterBottom>
                    {answer?.question?.text || "Interview question"}
                  </Typography>
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Your Answer:
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ p: 2, my: 1, bgcolor: '#f9f9f9', maxHeight: 100, overflow: 'auto' }}
                  >
                    <Typography variant="body2">
                      {answer?.transcription || "No transcription available"}
                    </Typography>
                  </Paper>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Box>
                      {answer.videoUrl && (
                        <Button
                          variant="outlined"
                          startIcon={<PlayArrow />}
                          size="small"
                          onClick={() => {
                            setAnswerVideoUrl(answer.videoUrl);
                            setIsReviewingAnswer(true);
                          }}
                        >
                          Play Recording
                        </Button>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex' }}>
                      <Chip 
                        label={`Tech: ${displayAnalysis.technical || 0}`} 
                        size="small" 
                        sx={{ mr: 0.5 }} 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`Comm: ${displayAnalysis.communication || 0}`} 
                        size="small" 
                        sx={{ mr: 0.5 }} 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`PS: ${displayAnalysis.problemSolving || 0}`} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
        
        {/* Recommendations section */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Interview Recommendations
            </Typography>
            
            <List>
              {Array.isArray(answers) && answers.length > 0 ? (
                <>
                  <ListItem>
                    <ListItemIcon><StarOutline /></ListItemIcon>
                    <ListItemText 
                      primary="Focus on your strongest areas" 
                      secondary={`Your best skill is ${getHighestSkill(answers)}. Make sure to highlight this in your real interviews.`} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon><StarOutline /></ListItemIcon>
                    <ListItemText 
                      primary="Address your improvement areas" 
                      secondary={`Work on improving your ${getLowestSkill(answers)} before your next interview.`} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon><StarOutline /></ListItemIcon>
                    <ListItemText 
                      primary="Practice structured responses" 
                      secondary="Use the STAR method (Situation, Task, Action, Result) to make your answers more compelling." 
                    />
                  </ListItem>
                </>
              ) : (
                <ListItem>
                  <ListItemIcon><StarOutline /></ListItemIcon>
                  <ListItemText 
                    primary="Complete more practice interviews" 
                    secondary="Try multiple categories to improve your versatility across different interview types." 
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => {
          setInterviewComplete(false);
            setActiveStep(0);
            setInterviewQuestions([]);
            setAnswers([]);
          setCurrentQuestionIndex(0);
            setInterviewId(null);
          }} 
          color="primary"
        >
          Start New Interview
        </Button>
        <Button 
          onClick={() => {
            // Upload data and go to results
            const generatedId = uploadInterviewData();
            if (generatedId) {
              console.log('Successfully prepared interview data, navigating to results');
              // Force a brief delay to ensure data is saved before navigation
              setTimeout(() => {
                navigate(`/interview-results/${generatedId}`);
              }, 300);
            } else {
              console.error('Failed to prepare interview data');
              setError('Failed to prepare interview data for results view');
            }
          }} 
          color="primary"
          variant="contained"
        >
          View Detailed Results
        </Button>
      </DialogActions>
    </Dialog>
  </Container>
);
};

// Helper function to get highest skill from answers
const getHighestSkill = (answers) => {
  const avgTechnical = answers.reduce((sum, a) => sum + (a?.analysis?.technical || 0), 0) / answers.length;
  const avgComm = answers.reduce((sum, a) => sum + (a?.analysis?.communication || 0), 0) / answers.length;
  const avgPS = answers.reduce((sum, a) => sum + (a?.analysis?.problemSolving || 0), 0) / answers.length;
  const avgCultural = answers.reduce((sum, a) => sum + (a?.analysis?.culturalFit || 0), 0) / answers.length;
  
  const skills = [
    { name: 'technical knowledge', value: avgTechnical },
    { name: 'communication skills', value: avgComm },
    { name: 'problem-solving approach', value: avgPS },
    { name: 'team and cultural fit', value: avgCultural }
  ];
  
  return skills.sort((a, b) => b.value - a.value)[0].name;
};

// Helper function to get lowest skill from answers
const getLowestSkill = (answers) => {
  const avgTechnical = answers.reduce((sum, a) => sum + (a?.analysis?.technical || 0), 0) / answers.length;
  const avgComm = answers.reduce((sum, a) => sum + (a?.analysis?.communication || 0), 0) / answers.length;
  const avgPS = answers.reduce((sum, a) => sum + (a?.analysis?.problemSolving || 0), 0) / answers.length;
  const avgCultural = answers.reduce((sum, a) => sum + (a?.analysis?.culturalFit || 0), 0) / answers.length;
  
  const skills = [
    { name: 'technical knowledge', value: avgTechnical },
    { name: 'communication skills', value: avgComm },
    { name: 'problem-solving approach', value: avgPS },
    { name: 'team and cultural fit', value: avgCultural }
  ];
  
  return skills.sort((a, b) => a.value - b.value)[0].name;
};

export default MockInterview; 