import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, Stepper,
  Step, StepLabel, Divider, CircularProgress,
  Grid, Card, CardContent, Alert, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, LinearProgress,
  Container, TextField, List, ListItem, ListItemText,
  ListItemIcon, Chip
} from '@mui/material';
import {
  Videocam, VideocamOff, Mic, MicOff,
  Settings, Close, PlayArrow, Pause,
  SkipNext, AssignmentTurnedIn, Save,
  Share, StarOutline, Star, Timer,
  Assessment, Psychology, Lightbulb,
  QuestionAnswerIcon, WorkIcon, SchoolIcon, CheckCircleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

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
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const videoChunksRef = useRef([]);
  const timerRef = useRef(null);
  const questionTimerRef = useRef(null);
  
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Fetch interview templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await apiEndpoints.interviews.getTemplates();
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
  
  // Request camera and microphone permissions
  const requestMediaPermissions = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
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
      setError('Please allow access to camera and microphone to proceed');
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
      const response = await apiEndpoints.interviews.generateQuestions({
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
    setActiveStep(2); // Move to interview step
    
    // Set initial remaining time
    setRemainingTime(interviewSettings.duration * 60);
    
    // Start overall interview timer
    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          // Time's up - end interview
          clearInterval(timerRef.current);
          handleInterviewComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Ask first question
    askQuestion(0);
  };
  
  // Ask a specific question
  const askQuestion = (index) => {
    if (index >= interviewQuestions.length) {
      // No more questions - end interview
      handleInterviewComplete();
      return;
    }
    
    setCurrentQuestionIndex(index);
    
    // Reset answer time
    setAnswerTime(0);
    
    // Start question timer
    questionTimerRef.current = setInterval(() => {
      setAnswerTime(prev => prev + 1);
    }, 1000);
    
    // Start recording answer
    startRecording();
  };
  
  // Start recording answer
  const startRecording = () => {
    if (!streamRef.current) return;
    
    try {
      // Clear previous recording chunks
      audioChunksRef.current = [];
      videoChunksRef.current = [];
      
      // Create media recorder
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);
      
      // Handle data available event
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };
      
      // Handle recording stop event
      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        
        // Save answer
        const newAnswer = {
          questionIndex: currentQuestionIndex,
          question: interviewQuestions[currentQuestionIndex],
          videoBlob,
          videoUrl,
          duration: answerTime
        };
        
        setAnswers(prev => [...prev, newAnswer]);
        
        // Get quick feedback
        generateQuickFeedback(videoBlob);
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
    
    // Clear question timer
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
      questionTimerRef.current = null;
    }
  };
  
  // Generate quick feedback for answer
  const generateQuickFeedback = async (videoBlob) => {
    try {
      // Create form data with video blob
      const formData = new FormData();
      formData.append('video', videoBlob);
      formData.append('questionIndex', currentQuestionIndex);
      formData.append('interviewId', interviewId);
      
      // Send to backend for analysis
      const response = await apiEndpoints.interviews.analyzeAnswer(formData);
      
      setQuickFeedback(response.data);
      setShowFeedback(true);
    } catch (err) {
      console.error('Error generating feedback:', err);
    }
  };
  
  // Handle next question
  const handleNextQuestion = () => {
    setShowFeedback(false);
    setQuickFeedback(null);
    
    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < interviewQuestions.length) {
      askQuestion(nextIndex);
    } else {
      handleInterviewComplete();
    }
  };
  
  // Handle interview completion
  const handleInterviewComplete = () => {
    // Stop recording if still active
    stopRecording();
    
    // Clear all timers
    clearTimers();
    
    setInterviewComplete(true);
    setActiveStep(3); // Move to completion step
    
    // Upload all recordings and get final results
    uploadInterviewData();
  };
  
  // Upload all interview data to backend
  const uploadInterviewData = async () => {
    setLoading(true);
    
    try {
      // Create form data with all video recordings
      const formData = new FormData();
      
      // Add interview ID
      formData.append('interviewId', interviewId);
      
      // Add each answer video
      answers.forEach((answer, index) => {
        formData.append(`answer_${index}`, answer.videoBlob);
        formData.append(`question_${index}`, answer.question.text);
        formData.append(`duration_${index}`, answer.duration);
      });
      
      // Send to backend for processing
      await apiEndpoints.interviews.submitInterview(formData);
      
    } catch (err) {
      console.error('Error uploading interview data:', err);
      setError('Failed to save interview recordings');
    } finally {
      setLoading(false);
    }
  };
  
  // Format time (seconds to mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render setup step content
  const renderSetupStep = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Interview Setup
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Interview Template</InputLabel>
              <Select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                label="Interview Template"
              >
                <MenuItem value="">Select a template</MenuItem>
                {interviewTemplates.map(template => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Job Title</InputLabel>
              <Select
                name="jobTitle"
                value={interviewSettings.jobTitle}
                onChange={handleSettingsChange}
                label="Job Title"
              >
                <MenuItem value="">Select job title</MenuItem>
                <MenuItem value="software_engineer">Software Engineer</MenuItem>
                <MenuItem value="data_scientist">Data Scientist</MenuItem>
                <MenuItem value="product_manager">Product Manager</MenuItem>
                <MenuItem value="ui_ux_designer">UI/UX Designer</MenuItem>
                <MenuItem value="marketing_specialist">Marketing Specialist</MenuItem>
                <MenuItem value="sales_representative">Sales Representative</MenuItem>
                <MenuItem value="business_analyst">Business Analyst</MenuItem>
                <MenuItem value="project_manager">Project Manager</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Industry</InputLabel>
              <Select
                name="industry"
                value={interviewSettings.industry}
                onChange={handleSettingsChange}
                label="Industry"
              >
                <MenuItem value="">Select industry</MenuItem>
                <MenuItem value="technology">Technology</MenuItem>
                <MenuItem value="healthcare">Healthcare</MenuItem>
                <MenuItem value="finance">Finance</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="retail">Retail</MenuItem>
                <MenuItem value="manufacturing">Manufacturing</MenuItem>
                <MenuItem value="media">Media & Entertainment</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Advanced Settings
                </Typography>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Difficulty Level</InputLabel>
                  <Select
                    name="difficulty"
                    value={interviewSettings.difficulty}
                    onChange={handleSettingsChange}
                    label="Difficulty Level"
                  >
                    <MenuItem value="easy">Entry Level</MenuItem>
                    <MenuItem value="medium">Mid-Level</MenuItem>
                    <MenuItem value="hard">Senior Level</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Number of Questions</InputLabel>
                  <Select
                    name="questionCount"
                    value={interviewSettings.questionCount}
                    onChange={handleSettingsChange}
                    label="Number of Questions"
                  >
                    <MenuItem value={3}>3 Questions (Short)</MenuItem>
                    <MenuItem value={5}>5 Questions (Medium)</MenuItem>
                    <MenuItem value={7}>7 Questions (Long)</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Interview Duration (minutes)</InputLabel>
                  <Select
                    name="duration"
                    value={interviewSettings.duration}
                    onChange={handleSettingsChange}
                    label="Interview Duration (minutes)"
                  >
                    <MenuItem value={10}>10 minutes</MenuItem>
                    <MenuItem value={20}>20 minutes</MenuItem>
                    <MenuItem value={30}>30 minutes</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="includeVideoAnalysis"
                        checked={interviewSettings.includeVideoAnalysis}
                        onChange={handleSettingsChange}
                        color="primary"
                      />
                    }
                    label="Include Video Analysis"
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        name="includeVoiceAnalysis"
                        checked={interviewSettings.includeVoiceAnalysis}
                        onChange={handleSettingsChange}
                        color="primary"
                      />
                    }
                    label="Include Voice Analysis"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleStartSetup}
            disabled={!selectedTemplate || loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              'Generate Interview Questions'
            )}
          </Button>
        </Box>
      </Box>
    );
  };
  
  // Render preparation step content
  const renderPreparationStep = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Interview Preparation
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Your interview is ready! Please check your camera and microphone before starting.
        </Alert>
        
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
                position: 'relative'
              }}
            >
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <VideocamOff sx={{ fontSize: 48, mb: 1 }} />
                  <Typography variant="body2">
                    Camera is disabled
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
                <IconButton
                  onClick={toggleCamera}
                  sx={{
                    color: 'white',
                    bgcolor: cameraActive ? 'primary.main' : 'error.main',
                    '&:hover': {
                      bgcolor: cameraActive ? 'primary.dark' : 'error.dark',
                    },
                    mr: 1
                  }}
                >
                  {cameraActive ? <Videocam /> : <VideocamOff />}
                </IconButton>
                
                <IconButton
                  onClick={toggleMicrophone}
                  sx={{
                    color: 'white',
                    bgcolor: micActive ? 'primary.main' : 'error.main',
                    '&:hover': {
                      bgcolor: micActive ? 'primary.dark' : 'error.dark',
                    }
                  }}
                >
                  {micActive ? <Mic /> : <MicOff />}
                </IconButton>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Interview Overview
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Questions: {interviewQuestions.length}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Duration: {interviewSettings.duration} minutes
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Difficulty: {interviewSettings.difficulty === 'easy' ? 'Entry Level' : 
                               interviewSettings.difficulty === 'medium' ? 'Mid-Level' : 'Senior Level'}
                </Typography>
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Tips:
              </Typography>
              
              <ul>
                <li>Make sure you're in a quiet environment</li>
                <li>Position yourself centered in the camera frame</li>
                <li>Speak clearly and maintain eye contact with the camera</li>
                <li>Take a moment to think before answering questions</li>
                <li>You can use the Skip button if you need to move on</li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={() => setActiveStep(0)}
          >
            Back to Setup
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={startInterview}
            disabled={!permissionsGranted.camera || !permissionsGranted.microphone}
          >
            Start Interview
          </Button>
        </Box>
      </Box>
    );
  };
  
  // Render interview step content
  const renderInterviewStep = () => {
    const currentQuestion = interviewQuestions[currentQuestionIndex];
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Mock Interview
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Timer sx={{ color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Time Remaining: {formatTime(remainingTime)}
            </Typography>
          </Box>
        </Box>
        
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
                position: 'relative'
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              
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
                <IconButton
                  onClick={toggleCamera}
                  sx={{
                    color: 'white',
                    bgcolor: cameraActive ? 'primary.main' : 'error.main',
                    '&:hover': {
                      bgcolor: cameraActive ? 'primary.dark' : 'error.dark',
                    },
                    mr: 1
                  }}
                >
                  {cameraActive ? <Videocam /> : <VideocamOff />}
                </IconButton>
                
                <IconButton
                  onClick={toggleMicrophone}
                  sx={{
                    color: 'white',
                    bgcolor: micActive ? 'primary.main' : 'error.main',
                    '&:hover': {
                      bgcolor: micActive ? 'primary.dark' : 'error.dark',
                    }
                  }}
                >
                  {micActive ? <Mic /> : <MicOff />}
                </IconButton>
              </Box>
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              {recording ? (
                <Button
                  variant="contained"
                  color="error"
                  onClick={stopRecording}
                  startIcon={<Pause />}
                >
                  Stop Answer
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNextQuestion}
                  startIcon={<SkipNext />}
                >
                  Next Question
                </Button>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Question {currentQuestionIndex + 1} of {interviewQuestions.length}
                </Typography>
                
                <Typography variant="h6" gutterBottom sx={{ my: 1 }}>
                  {currentQuestion?.text}
                </Typography>
                
                {currentQuestion?.hint && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Hint:</strong> {currentQuestion.hint}
                    </Typography>
                  </Alert>
                )}
              </Box>
              
              {showFeedback && quickFeedback && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Quick Feedback
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
                  
                  {quickFeedback.tip && (
                    <Alert 
                      severity="info"
                      icon={<Lightbulb />}
                      sx={{ mt: 2 }}
                    >
                      <Typography variant="body2">
                        {quickFeedback.tip}
                      </Typography>
                    </Alert>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Render interview completion step
  const renderCompletionStep = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Interview Complete
        </Typography>
        
        <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <AssignmentTurnedIn sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          
          <Typography variant="h5" gutterBottom>
            Great job!
          </Typography>
          
          <Typography variant="body1" paragraph>
            Your mock interview has been completed successfully.
            {loading ? ' We are processing your responses...' : ' Your results are ready to view.'}
          </Typography>
          
          {loading ? (
            <CircularProgress />
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/interview-results/${interviewId}`)}
              startIcon={<Assessment />}
            >
              View Detailed Results
            </Button>
          )}
        </Paper>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Interview Summary
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Questions Answered: {answers.length}/{interviewQuestions.length}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Duration: {formatTime(interviewSettings.duration * 60 - remainingTime)}
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Save />}
                sx={{ mt: 1 }}
                onClick={() => navigate('/resume-builder')}
              >
                Update Resume Based on Feedback
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Next Steps
              </Typography>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Psychology />}
                sx={{ mb: 1 }}
                onClick={() => navigate('/interview-coach')}
              >
                Practice with AI Interview Coach
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<PlayArrow />}
                onClick={() => {
                  // Reset and create a new interview
                  setInterviewComplete(false);
                  setActiveStep(0);
                  setInterviewQuestions([]);
                  setAnswers([]);
                  setCurrentQuestionIndex(0);
                  setInterviewId(null);
                }}
              >
                Start New Mock Interview
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4 }}>
        Mock Interview Practice
      </Typography>
      
      {!interviewComplete ? (
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
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <LoadingSpinner />
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  {selectedCategory} {selectedSubcategory && `- ${selectedSubcategory}`} Interview
                </Typography>
                <Chip 
                  label={`Question ${currentQuestionIndex + 1} of ${interviewQuestions.length}`} 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <Typography variant="h6" gutterBottom>
                Question:
              </Typography>
              
              <Typography variant="body1" paragraph sx={{ mb: 4, fontWeight: 'medium' }}>
                {interviewQuestions[currentQuestionIndex]}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Your Answer:
              </Typography>
              
              <TextField
                fullWidth
                multiline
                rows={6}
                value={answers[currentQuestionIndex]?.answer || ''}
                onChange={(e) => {
                  const updatedAnswers = {
                    ...answers,
                    [currentQuestionIndex]: {
                      ...answers[currentQuestionIndex],
                      answer: e.target.value
                    }
                  };
                  setAnswers(updatedAnswers);
                }}
                placeholder="Type your answer here..."
                variant="outlined"
                sx={{ mb: 3 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setInterviewComplete(false);
                    setCurrentQuestionIndex(0);
                    setAnswers({});
                  }}
                >
                  Cancel Interview
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setInterviewComplete(true);
                    setCurrentQuestionIndex(interviewQuestions.length - 1);
                  }}
                  disabled={answers[currentQuestionIndex]?.answer.trim() === ''}
                >
                  {currentQuestionIndex < interviewQuestions.length - 1 ? 'Next Question' : 'Finish Interview'}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      )}
      
      {/* Feedback Dialog */}
      <Dialog
        open={interviewComplete}
        onClose={() => {
          setInterviewComplete(false);
          setCurrentQuestionIndex(0);
          setAnswers({});
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Interview Feedback
        </DialogTitle>
        <DialogContent>
          {quickFeedback && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ mr: 2 }}>
                  Overall Score:
                </Typography>
                <Chip 
                  label={`${quickFeedback.overallScore}%`} 
                  color={quickFeedback.overallScore >= 80 ? 'success' : 'primary'} 
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Strengths:
              </Typography>
              <List dense>
                {quickFeedback.strengths.map((strength, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={strength} />
                  </ListItem>
                ))}
              </List>
              
              <Typography variant="h6" gutterBottom>
                Areas for Improvement:
              </Typography>
              <List dense>
                {quickFeedback.areasForImprovement.map((area, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={area} />
                  </ListItem>
                ))}
              </List>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Question-by-Question Feedback:
              </Typography>
              {quickFeedback.questionFeedback.map((qf, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Question {index + 1}: {qf.question}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Your Answer:
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {qf.answer}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Score:
                      </Typography>
                      <Chip 
                        label={`${qf.score}%`} 
                        size="small"
                        color={qf.score >= 80 ? 'success' : 'primary'} 
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Feedback: {qf.feedback}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setInterviewComplete(false);
            setCurrentQuestionIndex(0);
            setAnswers({});
          }} color="primary">
            Start New Interview
          </Button>
          <Button onClick={() => {
            setInterviewComplete(false);
            setCurrentQuestionIndex(interviewQuestions.length - 1);
          }} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MockInterview; 