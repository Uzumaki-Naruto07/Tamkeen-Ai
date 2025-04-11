import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Dialog,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Grid,
  FormControl,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  Stack,
  Card,
  CardContent,
  Drawer,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  Send,
  Save,
  RestartAlt,
  Assessment,
  ExpandMore,
  Help,
  QuestionAnswer,
  Timer,
  Done,
  ArrowForward,
  Cancel,
  Psychology,
  SentimentSatisfied,
  Score,
  Close
} from '@mui/icons-material';
import { useJob, useUser } from './AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import SpeechControl from './Speech/SpeechControl.jsx';
import CameraFeed from './CameraFeed';

const InterviewContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  height: 'calc(100vh - 80px)',
  display: 'flex',
  flexDirection: 'column',
}));

const InterviewHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const VideoContainer = styled(Paper)(({ theme, active }) => ({
  width: '100%',
  height: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: active ? theme.palette.grey[900] : theme.palette.grey[200],
  color: active ? theme.palette.common.white : theme.palette.text.secondary,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  position: 'relative',
}));

const ChatContainer = styled(Paper)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: theme.shadows[2],
  marginBottom: theme.spacing(2),
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const InputArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const UserMessage = styled(Box)(({ theme }) => ({
  alignSelf: 'flex-end',
  maxWidth: '75%',
  padding: theme.spacing(1.5, 2),
  borderRadius: '18px 18px 4px 18px',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  wordBreak: 'break-word',
}));

const AIMessage = styled(Box)(({ theme }) => ({
  alignSelf: 'flex-start',
  maxWidth: '75%',
  padding: theme.spacing(1.5, 2),
  borderRadius: '18px 18px 18px 4px',
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.primary,
  wordBreak: 'break-word',
}));

const ControlsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const FeedbackDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '40%',
    minWidth: 300,
    maxWidth: 500,
    padding: theme.spacing(3),
  },
}));

const TimerBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 16,
  backgroundColor: theme.palette.grey[200],
  color: theme.palette.text.primary,
  fontWeight: 'bold',
}));

const FeedbackItem = styled(Box)(({ theme, score }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: 
    score >= 8 ? theme.palette.success.light :
    score >= 5 ? theme.palette.warning.light :
    theme.palette.error.light,
}));

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const slideIn = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  exit: { x: -20, opacity: 0, transition: { duration: 0.2 } }
};

const InterviewSimulator = ({ 
  interviewType = 'technical', 
  jobRole = '', 
  jobId = null,
  resumeId = null
}) => {
  const theme = useTheme();
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  
  // Interview state
  const [activeStep, setActiveStep] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [typedResponse, setTypedResponse] = useState('');
  const [responseMode, setResponseMode] = useState('voice'); // 'voice' or 'text'
  
  // Analysis state
  const [evaluating, setEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [finalReport, setFinalReport] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile } = useUser();
  const { currentJobDescription } = useJob();
  
  // Use job description from props or context
  const effectiveJobDescription = jobDescription || currentJobDescription?.description || "";
  
  // State
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [settings, setSettings] = useState({
    role: 'frontend-developer',
    difficulty: 'moderate',
    mode: 'technical',
    language: 'english',
    videoFeedback: true,
    realTimeAnalysis: true,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    } else if (!timerActive && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);
  
  // Scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Format timer
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Initialize interview session
  useEffect(() => {
    const initializeInterview = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // This connects to enhanced_interview.py backend
        const response = await apiEndpoints.interview.initialize({
          type: interviewType,
          jobRole: jobRole || undefined,
          jobId: jobId || undefined,
          resumeId: resumeId || undefined,
          userId: profile?.id || undefined
        });
        
        setQuestions(response.data.questions || []);
        setSessionId(response.data.sessionId);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize interview');
        console.error('Interview initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initializeInterview();
  }, [interviewType, jobRole, jobId, resumeId, profile]);
  
  // Start interview
  const startInterview = async () => {
    if (!sessionId) return;
    
    try {
      await apiEndpoints.interview.start(sessionId);
      setInterviewStarted(true);
    } catch (err) {
      setError('Failed to start interview session');
      console.error('Interview start error:', err);
    }
  };
  
  // Handle recording start
  const handleRecordingStart = () => {
    setIsRecording(true);
    setTranscription('');
  };
  
  // Handle recording stop
  const handleRecordingStop = async (audioBlob) => {
    setIsRecording(false);
    setRecordedAudio(audioBlob);
    
    if (!audioBlob) return;
    
    // Transcribe audio
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'response.wav');
      formData.append('sessionId', sessionId);
      formData.append('questionId', questions[currentQuestionIndex].id);
      
      const response = await apiEndpoints.interview.transcribe(formData);
      setTranscription(response.data.text);
    } catch (err) {
      console.error('Transcription error:', err);
      setError('Failed to transcribe audio');
    }
  };
  
  // Handle emotion detection from camera
  const handleEmotionDetected = (emotionData) => {
    if (!sessionId || !interviewStarted || interviewComplete) return;
    
    // Send emotion data to backend
    try {
      apiEndpoints.interview.recordEmotion({
        sessionId,
        questionId: questions[currentQuestionIndex]?.id,
        emotionData
      });
    } catch (err) {
      console.error('Emotion recording error:', err);
    }
  };
  
  // Submit response
  const submitResponse = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion || !sessionId) return;
    
    setEvaluating(true);
    
    try {
      // This connects to enhanced_interview.py evaluation backend
      const response = await apiEndpoints.interview.evaluateResponse({
        sessionId,
        questionId: currentQuestion.id,
        response: responseMode === 'voice' ? transcription : typedResponse,
        responseMode,
        audioUrl: responseMode === 'voice' ? URL.createObjectURL(recordedAudio) : null
      });
      
      // Update responses with evaluation
      const evaluatedResponse = {
        question: currentQuestion,
        response: responseMode === 'voice' ? transcription : typedResponse,
        evaluation: response.data
      };
      
      setResponses(prev => [...prev, evaluatedResponse]);
      setCurrentEvaluation(response.data);
      
      // Clear response state
      setTypedResponse('');
      setTranscription('');
      setRecordedAudio(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to evaluate response');
      console.error('Response evaluation error:', err);
    } finally {
      setEvaluating(false);
    }
  };
  
  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentEvaluation(null);
    } else {
      // Complete interview
      finishInterview();
    }
  };
  
  // Finish interview
  const finishInterview = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    
    try {
      // This connects to enhanced_interview.py final evaluation
      const response = await apiEndpoints.interview.complete(sessionId);
      
      setFinalReport(response.data);
      setInterviewComplete(true);
      setActiveStep(2); // Move to final step
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete interview');
      console.error('Interview completion error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Change response mode
  const toggleResponseMode = () => {
    setResponseMode(prev => prev === 'voice' ? 'text' : 'voice');
    setTranscription('');
    setTypedResponse('');
  };
  
  // Get current question
  const currentQuestion = questions[currentQuestionIndex];
  
  // Get questions based on settings
  const getQuestions = () => {
    return interviewQuestions[settings.role] || interviewQuestions['general'];
  };
  
  // Show feedback
  const handleShowFeedback = () => {
    setTimerActive(false);
    setFeedback(interviewFeedback);
    setShowFeedback(true);
  };
  
  // Reset interview
  const resetInterview = () => {
    setMessages([]);
    setCurrentQuestionIndex(0);
    setTimer(0);
    setTimerActive(false);
    setInterviewStarted(false);
    setInterviewComplete(false);
    setFeedback(null);
    setShowFeedback(false);
  };
  
  // Handle settings change
  const handleSettingsChange = (event) => {
    const { name, value, checked } = event.target;
    setSettings(prev => ({
      ...prev,
      [name]: event.target.type === 'checkbox' ? checked : value
    }));
  };
  
  // Toggle settings drawer
  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen);
  };
  
  if (loading && !interviewStarted) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LoadingSpinner message="Setting up interview simulation..." />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }
  
  return (
    <InterviewContainer>
      <InterviewHeader>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Interview Simulator
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Practice your interview skills with our AI interviewer
          </Typography>
        </Box>
        <Box>
          {interviewStarted && (
            <TimerBox>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Time:
              </Typography>
              {formatTime(timer)}
            </TimerBox>
          )}
        </Box>
      </InterviewHeader>
      
      <Collapse in={showAlert}>
        <Alert 
          severity="error" 
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setShowAlert(false)}
            >
              <Close />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          Camera access denied. Please check your permissions.
        </Alert>
      </Collapse>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {videoEnabled && (
              <VideoContainer active={videoEnabled} sx={{ mb: 2 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 8, 
                    right: 8, 
                    display: 'flex',
                    gap: 1
                  }}
                >
                  <Chip 
                    icon={<FaceIcon />} 
                    label="Face detected" 
                    color="success" 
                    size="small" 
                    variant="filled"
                  />
                </Box>
              </VideoContainer>
            )}
            
            <ChatContainer sx={{ flex: 1 }}>
              <ChatHeader>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 1, bgcolor: theme.palette.secondary.main }}>
                    AI
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      AI Interviewer
                    </Typography>
                    <Typography variant="caption">
                      Role: {settings.role} | Level: {settings.difficulty}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Tooltip title="Toggle video">
                    <IconButton 
                      color="inherit"
                      onClick={() => {
                        handleVideoToggle();
                        setVideoEnabled(!videoEnabled);
                      }}
                    >
                      {videoEnabled ? <Videocam /> : <VideocamOff />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Settings">
                    <IconButton 
                      color="inherit"
                      onClick={toggleSettings}
                    >
                      <SettingsIcon />
                    </IconButton>
                  </Tooltip>
                  {interviewStarted && (
                    <Tooltip title="Restart interview">
                      <IconButton 
                        color="inherit"
                        onClick={resetInterview}
                      >
                        <RestartAltIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </ChatHeader>
              
              <MessagesContainer>
                {!interviewStarted && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                  >
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        borderRadius: 2,
                        mb: 2
                      }}
                    >
                      <Typography variant="h5" gutterBottom>
                        Ready to start your interview?
                      </Typography>
                      <Typography variant="body1" paragraph>
                        This simulator will help you practice for your next job interview with AI-powered questions and feedback.
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="secondary"
                        size="large"
                        onClick={startInterview}
                        sx={{ mt: 1 }}
                      >
                        Start Interview
                      </Button>
                    </Paper>
                    
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <MicIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h6" gutterBottom>
                              Voice Support
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Respond to questions with your voice for a more realistic experience
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <VideocamIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h6" gutterBottom>
                              Video Analysis
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Get feedback on your body language and presentation skills
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, height: '100%' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <InsightsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                            <Typography variant="h6" gutterBottom>
                              Detailed Feedback
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Get personalized feedback on your responses and performance
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </motion.div>
                )}
                
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={slideIn}
                    >
                      {message.sender === 'user' ? (
                        <UserMessage>
                          <Typography variant="body1">
                            {message.content}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, opacity: 0.7 }}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </UserMessage>
                      ) : (
                        <AIMessage>
                          <Typography variant="body1">
                            {message.content}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </AIMessage>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {loading && (
                  <AIMessage sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">
                        AI is responding...
                      </Typography>
                    </Box>
                  </AIMessage>
                )}
                
                {interviewComplete && !showFeedback && (
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleShowFeedback}
                      startIcon={<InsightsIcon />}
                    >
                      View Feedback
                    </Button>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </MessagesContainer>
              
              {interviewStarted && !interviewComplete && (
                <InputArea>
                  {micActive ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <LinearProgress color="primary" />
                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                          Listening: {transcript || "Speak now..."}
                        </Typography>
                      </Box>
                      <IconButton 
                        color="error"
                        onClick={() => {
                          handleMicToggle();
                          setMicActive(false);
                        }}
                      >
                        <StopIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <>
                      <IconButton 
                        color="primary"
                        onClick={() => {
                          handleMicToggle();
                          setMicActive(true);
                        }}
                      >
                        <MicIcon />
                      </IconButton>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type your response..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        size="small"
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        endIcon={<SendIcon />}
                        onClick={handleSendMessage}
                        disabled={!currentMessage.trim()}
                      >
                        Send
                      </Button>
                    </>
                  )}
                </InputArea>
              )}
            </ChatContainer>
          </Box>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Interview Tips
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Stack spacing={2}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TipsAndUpdatesIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      Prepare STAR Examples
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Use the STAR method (Situation, Task, Action, Result) to structure your answers to behavioral questions.
                  </Typography>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TipsAndUpdatesIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      Research the Company
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Show your interest by researching the company's products, values, and recent news.
                  </Typography>
                </CardContent>
              </Card>
              
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TipsAndUpdatesIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      Ask Thoughtful Questions
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Prepare 3-5 thoughtful questions about the role, team, or company culture to ask at the end.
                  </Typography>
                </CardContent>
              </Card>
              
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Common Questions for {settings.role}:
              </Typography>
              
              <Box sx={{ mt: 1 }}>
                {getQuestions().slice(0, 3).map((q, i) => (
                  <Chip 
                    key={i}
                    label={q.question}
                    sx={{ mt: 1, mr: 1 }}
                    color="primary"
                    variant="outlined"
                  />
                ))}
                <Chip 
                  label="See More"
                  sx={{ mt: 1 }}
                  color="secondary"
                  icon={<HelpOutlineIcon />}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={settingsOpen}
        onClose={toggleSettings}
      >
        <Box sx={{ width: 320, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Interview Settings
            </Typography>
            <IconButton onClick={toggleSettings}>
              <Close />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={settings.role}
              onChange={handleSettingsChange}
              label="Role"
            >
              <MenuItem value="frontend-developer">Frontend Developer</MenuItem>
              <MenuItem value="backend-developer">Backend Developer</MenuItem>
              <MenuItem value="fullstack-developer">Fullstack Developer</MenuItem>
              <MenuItem value="data-scientist">Data Scientist</MenuItem>
              <MenuItem value="product-manager">Product Manager</MenuItem>
              <MenuItem value="designer">UX/UI Designer</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              name="difficulty"
              value={settings.difficulty}
              onChange={handleSettingsChange}
              label="Difficulty"
            >
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="moderate">Moderate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
              <MenuItem value="expert">Expert</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Interview Mode</InputLabel>
            <Select
              name="mode"
              value={settings.mode}
              onChange={handleSettingsChange}
              label="Interview Mode"
            >
              <MenuItem value="technical">Technical Interview</MenuItem>
              <MenuItem value="behavioral">Behavioral Interview</MenuItem>
              <MenuItem value="mixed">Mixed Interview</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Language</InputLabel>
            <Select
              name="language"
              value={settings.language}
              onChange={handleSettingsChange}
              label="Language"
            >
              <MenuItem value="english">English</MenuItem>
              <MenuItem value="arabic">Arabic</MenuItem>
              <MenuItem value="bilingual">Bilingual (English & Arabic)</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.videoFeedback}
                onChange={handleSettingsChange}
                name="videoFeedback"
              />
            }
            label="Enable Video Feedback"
            sx={{ mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={settings.realTimeAnalysis}
                onChange={handleSettingsChange}
                name="realTimeAnalysis"
              />
            }
            label="Real-time Response Analysis"
          />
          
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            onClick={toggleSettings}
          >
            Save Settings
          </Button>
        </Box>
      </Drawer>
      
      {/* Feedback Drawer */}
      <FeedbackDrawer
        anchor="right"
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
      >
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Interview Feedback
            </Typography>
            <IconButton onClick={() => setShowFeedback(false)}>
              <Close />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {feedback && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
                  {feedback.overallScore}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    Overall Score
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feedback.overallScore >= 8 ? 'Excellent' : 
                     feedback.overallScore >= 6 ? 'Good' : 
                     feedback.overallScore >= 4 ? 'Fair' : 'Needs Improvement'}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Key Strengths
              </Typography>
              <Box sx={{ mb: 3 }}>
                {feedback.strengths.map((strength, idx) => (
                  <Chip 
                    key={idx}
                    label={strength}
                    color="success"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Areas for Improvement
              </Typography>
              <Box sx={{ mb: 3 }}>
                {feedback.improvements.map((improvement, idx) => (
                  <Chip 
                    key={idx}
                    label={improvement}
                    color="warning"
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Detailed Feedback
              </Typography>
              
              {feedback.categories.map((category, idx) => (
                <FeedbackItem key={idx} score={category.score}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1">
                      {category.name}
                    </Typography>
                    <Chip 
                      label={`${category.score}/10`} 
                      color={
                        category.score >= 8 ? "success" : 
                        category.score >= 5 ? "warning" : 
                        "error"
                      }
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2">
                    {category.feedback}
                  </Typography>
                </FeedbackItem>
              ))}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowFeedback(false)}
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RestartAltIcon />}
                  onClick={() => {
                    resetInterview();
                    setShowFeedback(false);
                  }}
                >
                  New Interview
                </Button>
              </Box>
            </>
          )}
        </Box>
      </FeedbackDrawer>
    </InterviewContainer>
  );
};

export default InterviewSimulator; 