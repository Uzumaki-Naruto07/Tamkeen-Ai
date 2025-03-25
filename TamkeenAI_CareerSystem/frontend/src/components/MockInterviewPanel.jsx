import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Tooltip,
  LinearProgress,
  Select,
  MenuItem
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import ReplayIcon from '@mui/icons-material/Replay';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import TimerIcon from '@mui/icons-material/Timer';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SaveIcon from '@mui/icons-material/Save';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';

const MockInterviewPanel = ({
  jobTitle = "",
  questions = [],
  onComplete,
  onSaveFeedback,
  onSettings,
  settings = {
    recordVideo: true,
    recordAudio: true,
    emotionTracking: true,
    questionCount: 5,
    timePerQuestion: 60,
    difficultyLevel: "medium"
  }
}) => {
  // State variables
  const [activeStep, setActiveStep] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, preparing, recording, reviewing, completed
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(settings.recordVideo);
  const [isAudioEnabled, setIsAudioEnabled] = useState(settings.recordAudio);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(settings.timePerQuestion);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [emotionData, setEmotionData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Refs
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const recordedChunksRef = useRef([]);
  
  // Filter questions based on settings
  const interviewQuestions = questions.slice(0, settings.questionCount);
  
  // Initialize interview
  useEffect(() => {
    // Cleanup function to stop all media streams when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Setup media devices and start recording
  const startInterview = async () => {
    try {
      setStatus('preparing');
      setErrorMessage("");
      
      const constraints = {
        audio: isAudioEnabled,
        video: isVideoEnabled ? { width: 640, height: 480 } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (isVideoEnabled && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Create blob from recorded chunks
        const blob = new Blob(recordedChunksRef.current, {
          type: isVideoEnabled ? 'video/webm' : 'audio/webm'
        });
        
        // Create URL for the recording
        const url = URL.createObjectURL(blob);
        
        // Store the answer
        const newAnswer = {
          questionIndex: currentQuestionIndex,
          question: interviewQuestions[currentQuestionIndex],
          answerText: currentAnswer,
          recordingUrl: url,
          recordingBlob: blob,
          duration: settings.timePerQuestion - timeRemaining
        };
        
        setAnswers(prev => [...prev, newAnswer]);
        recordedChunksRef.current = [];
        
        // Move to review or next question
        if (settings.autoAdvance) {
          nextQuestion();
        } else {
          setStatus('reviewing');
        }
      };
      
      setStatus('recording');
      startRecording();
      
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setErrorMessage(`Unable to access camera/microphone: ${err.message}`);
      setStatus('idle');
    }
  };
  
  const startRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      setIsRecording(true);
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
      
      // Start countdown timer
      setTimeRemaining(settings.timePerQuestion);
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stopRecording();
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Start emotion tracking if enabled
      if (settings.emotionTracking) {
        startEmotionTracking();
      }
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      setIsRecording(false);
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      
      // Stop emotion tracking
      if (settings.emotionTracking) {
        stopEmotionTracking();
      }
    }
  };
  
  const nextQuestion = () => {
    // Check if we've completed all questions
    if (currentQuestionIndex >= interviewQuestions.length - 1) {
      completeInterview();
      return;
    }
    
    // Stop current recording and media streams
    if (isRecording) {
      stopRecording();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Move to next question
    setCurrentQuestionIndex(prev => prev + 1);
    setStatus('idle');
    setCurrentAnswer("");
    setEmotionData(null);
  };
  
  const completeInterview = () => {
    // Stop all media
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Analyze all answers and generate feedback
    generateFeedback();
    
    setStatus('completed');
    if (onComplete) {
      onComplete({
        answers,
        feedback,
        duration: interviewQuestions.length * settings.timePerQuestion - timeRemaining,
        emotionData
      });
    }
  };
  
  const generateFeedback = async () => {
    setLoadingFeedback(true);
    
    try {
      // In a real implementation, this would call your API to analyze the answers
      // For now, we'll simulate a delay and generate placeholder feedback
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockFeedback = answers.map((answer, index) => ({
        questionIndex: answer.questionIndex,
        question: answer.question,
        strengths: [
          "Good eye contact maintained throughout",
          "Clear articulation of main points",
          "Structured response with examples"
        ],
        improvements: [
          "Could provide more specific examples",
          "Consider reducing filler words",
          "Expand on technical details more"
        ],
        score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
        keywords: ["communication", "teamwork", "problem solving"],
        emotionAnalysis: {
          confidence: Math.random() * 30 + 70,
          nervousness: Math.random() * 40,
          enthusiasm: Math.random() * 40 + 60
        }
      }));
      
      setFeedback(mockFeedback);
      setAnalysisResults({
        overallScore: mockFeedback.reduce((sum, item) => sum + item.score, 0) / mockFeedback.length,
        strengths: ["Clear communication", "Good examples", "Structured responses"],
        weaknesses: ["Occasional nervousness", "Could be more concise", "More specific examples needed"],
        improvements: [
          "Practice speaking more slowly and deliberately",
          "Prepare 2-3 strong examples for common questions",
          "Use the STAR method (Situation, Task, Action, Result) for behavioral questions"
        ]
      });
      
    } catch (error) {
      console.error("Error generating feedback:", error);
      setErrorMessage("Failed to generate feedback. Please try again.");
    } finally {
      setLoadingFeedback(false);
    }
  };
  
  // Emotion tracking functions (would connect to actual API in production)
  const startEmotionTracking = () => {
    // In a real implementation, this would start periodic captures and analysis
    console.log("Starting emotion tracking");
  };
  
  const stopEmotionTracking = () => {
    // Generate some mock emotion data for demonstration
    setEmotionData({
      dominantEmotion: ["Neutral", "Confident", "Thoughtful"][Math.floor(Math.random() * 3)],
      emotionScores: {
        neutral: 0.6,
        happy: 0.2,
        confident: 0.15,
        nervous: 0.05
      },
      facialFeatures: ["Good eye contact", "Natural expressions", "Occasional smile"],
      suggestions: [
        "Maintain your natural expressions and eye contact",
        "Consider smiling a bit more to appear more approachable",
        "Your confidence comes through well in your expressions"
      ]
    });
  };
  
  // Render functions
  const renderPrepScreen = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Mock Interview: {jobTitle}
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 3 }}>
        You'll be asked {interviewQuestions.length} questions. 
        You'll have {settings.timePerQuestion} seconds to answer each question.
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        maxWidth: 600, 
        mx: 'auto', 
        mb: 4,
        p: 2,
        borderRadius: 1,
        bgcolor: 'background.paper',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <Typography variant="subtitle1">
          Tips for a successful interview:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText primary="Speak clearly and maintain good eye contact" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText primary="Use the STAR method for behavioral questions" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText primary="Prepare examples from your experience" />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText primary="Find a quiet place with good lighting" />
          </ListItem>
        </List>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <Button
          variant={isVideoEnabled ? "contained" : "outlined"}
          startIcon={isVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
          onClick={() => setIsVideoEnabled(!isVideoEnabled)}
        >
          {isVideoEnabled ? "Camera ON" : "Camera OFF"}
        </Button>
        
        <Button
          variant={isAudioEnabled ? "contained" : "outlined"}
          startIcon={isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          color="primary"
        >
          {isAudioEnabled ? "Microphone ON" : "Microphone OFF"}
        </Button>
        
        <Tooltip title="Interview Settings">
          <IconButton onClick={() => setShowSettings(true)}>
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Button
        variant="contained"
        size="large"
        startIcon={<PlayArrowIcon />}
        onClick={startInterview}
        disabled={!isVideoEnabled && !isAudioEnabled}
      >
        Start Interview
      </Button>
      
      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
          {errorMessage}
        </Alert>
      )}
    </Box>
  );
  
  const renderInterviewScreen = () => (
    <Box>
      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={3}>
          {/* Video feed */}
          <Grid item xs={12} md={isVideoEnabled ? 6 : 12}>
            <Box sx={{ 
              position: 'relative',
              borderRadius: 1, 
              overflow: 'hidden',
              bgcolor: 'black',
              height: isVideoEnabled ? 320 : 'auto'
            }}>
              {isVideoEnabled ? (
                <video
                  ref={videoRef}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                  muted
                />
              ) : (
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 4,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                }}>
                  <Typography variant="body1" color="text.secondary">
                    <MicIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Audio Only Mode
                  </Typography>
                </Box>
              )}
              
              {/* Timer overlay */}
              <Box sx={{ 
                position: 'absolute',
                top: 10,
                right: 10,
                bgcolor: 'rgba(0,0,0,0.6)',
                color: 'white',
                borderRadius: 4,
                px: 1.5,
                py: 0.5,
                display: 'flex',
                alignItems: 'center'
              }}>
                <TimerIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="body2">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </Typography>
              </Box>
              
              {/* Recording indicator */}
              {isRecording && (
                <Box sx={{ 
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'rgba(204, 0, 0, 0.8)',
                  color: 'white',
                  borderRadius: 4,
                  px: 1.5,
                  py: 0.5
                }}>
                  <Box sx={{ 
                    width: 10, 
                    height: 10, 
                    borderRadius: '50%', 
                    bgcolor: 'error.main',
                    mr: 1,
                    animation: 'pulse 1.5s infinite'
                  }} />
                  <Typography variant="body2">
                    REC
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Question display */}
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Chip 
                  label={`Question ${currentQuestionIndex + 1}/${interviewQuestions.length}`} 
                  size="small" 
                  color="primary"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {interviewQuestions[currentQuestionIndex]?.difficulty || 'Medium'} difficulty
                </Typography>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                {interviewQuestions[currentQuestionIndex]?.text || "Loading question..."}
              </Typography>
              
              {interviewQuestions[currentQuestionIndex]?.hint && (
                <Alert severity="info" icon={<TipsAndUpdatesIcon />} sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Hint:</strong> {interviewQuestions[currentQuestionIndex].hint}
                  </Typography>
                </Alert>
              )}
            </Box>
          </Grid>
          
          {/* Notes section (only shown if video is enabled) */}
          {isVideoEnabled && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Your Notes (optional)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                placeholder="You can type notes or key points for your answer here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={!isRecording}
              />
              
              {emotionData && (
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      <SentimentSatisfiedAltIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Expression Analysis
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Dominant Expression:
                      </Typography>
                      <Chip 
                        label={emotionData.dominantEmotion} 
                        size="small" 
                        color="primary"
                      />
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>
          )}
        </Grid>
        
        {/* Control buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
          {isRecording ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={stopRecording}
            >
              Stop Recording
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<ReplayIcon />}
                onClick={startInterview}
              >
                Retry Question
              </Button>
              <Button
                variant="contained"
                color="primary"
                endIcon={<SkipNextIcon />}
                onClick={nextQuestion}
              >
                Next Question
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
  
  const renderCompletedScreen = () => (
    <Box>
      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Interview Completed!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Great job! Here's your feedback and analysis.
          </Typography>
        </Box>
        
        {loadingFeedback ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Analyzing your interview responses...
            </Typography>
          </Box>
        ) : (
          <>
            {analysisResults && (
              <>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3
                }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={analysisResults.overallScore}
                      size={80}
                      thickness={4}
                      sx={{ color: analysisResults.overallScore >= 80 ? 'success.main' : 'primary.main' }}
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
                      <Typography variant="h6" component="div" color="text.secondary">
                        {Math.round(analysisResults.overallScore)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="h6">
                      Overall Interview Score
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Based on content, delivery, and completeness of answers
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Strengths
                    </Typography>
                    <List dense>
                      {analysisResults.strengths.map((strength, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={strength} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Areas for Improvement
                    </Typography>
                    <List dense>
                      {analysisResults.weaknesses.map((weakness, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <WarningIcon color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={weakness} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                  Recommended Improvements
                </Typography>
                <List>
                  {analysisResults.improvements.map((improvement, index) => (
                    <ListItem key={index} sx={{ pl: 0 }}>
                      <ListItemIcon>
                        <TipsAndUpdatesIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={improvement} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Question-by-Question Feedback
            </Typography>
            
            {feedback.length > 0 ? (
              <Box>
                {feedback.map((item, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Question {item.questionIndex + 1}: {item.question.text}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Chip 
                          label={`Score: ${item.score}%`} 
                          color={item.score >= 80 ? "success" : "primary"}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          Keywords: {item.keywords.join(", ")}
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                            Strengths:
                          </Typography>
                          <List dense disablePadding>
                            {item.strengths.map((strength, idx) => (
                              <ListItem key={idx} dense disablePadding sx={{ mb: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <CheckCircleIcon color="success" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={strength} 
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                            Improvements:
                          </Typography>
                          <List dense disablePadding>
                            {item.improvements.map((improvement, idx) => (
                              <ListItem key={idx} dense disablePadding sx={{ mb: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 24 }}>
                                  <InfoIcon color="info" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={improvement}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No detailed feedback available
              </Typography>
            )}
          </>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<VisibilityIcon />}
            onClick={() => {/* Functionality to review recordings */}}
          >
            Review Recordings
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => {/* Functionality to download report */}}
          >
            Download Report
          </Button>
          <Button
            variant="contained"
            startIcon={<ReplayIcon />}
            onClick={() => {
              setStatus('idle');
              setCurrentQuestionIndex(0);
              setAnswers([]);
              setFeedback([]);
              setEmotionData(null);
              setAnalysisResults(null);
            }}
          >
            New Interview
          </Button>
        </Box>
      </Paper>
    </Box>
  );
  
  // Settings dialog
  const renderSettingsDialog = () => (
    <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Interview Settings</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Number of Questions
            </Typography>
            <Select
              fullWidth
              value={settings.questionCount}
              onChange={(e) => onSettings && onSettings({...settings, questionCount: e.target.value})}
            >
              <MenuItem value={3}>3 Questions</MenuItem>
              <MenuItem value={5}>5 Questions</MenuItem>
              <MenuItem value={7}>7 Questions</MenuItem>
              <MenuItem value={10}>10 Questions</MenuItem>
            </Select>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Time per Question
            </Typography>
            <Select
              fullWidth
              value={settings.timePerQuestion}
              onChange={(e) => onSettings && onSettings({...settings, timePerQuestion: e.target.value})}
            >
              <MenuItem value={30}>30 seconds</MenuItem>
              <MenuItem value={60}>1 minute</MenuItem>
              <MenuItem value={120}>2 minutes</MenuItem>
              <MenuItem value={180}>3 minutes</MenuItem>
            </Select>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Difficulty Level
            </Typography>
            <Select
              fullWidth
              value={settings.difficultyLevel}
              onChange={(e) => onSettings && onSettings({...settings, difficultyLevel: e.target.value})}
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
              <MenuItem value="mixed">Mixed</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowSettings(false)}>Cancel</Button>
        <Button 
          onClick={() => {
            setShowSettings(false);
            // Additional settings save logic here if needed
          }} 
          variant="contained"
        >
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  // Main render
  return (
    <Box>
      {status === 'idle' && renderPrepScreen()}
      {(status === 'preparing' || status === 'recording' || status === 'reviewing') && renderInterviewScreen()}
      {status === 'completed' && renderCompletedScreen()}
      {renderSettingsDialog()}
    </Box>
  );
};

export default MockInterviewPanel; 