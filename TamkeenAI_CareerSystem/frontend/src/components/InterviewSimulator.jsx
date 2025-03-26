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
  Grid
} from '@mui/material';
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
  Score
} from '@mui/icons-material';
import { useJob, useUser } from './AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import SpeechControl from './Speech/SpeechControl';
import CameraFeed from './CameraFeed';

const InterviewSimulator = ({ 
  interviewType = 'technical', 
  jobRole = '', 
  jobId = null,
  resumeId = null
}) => {
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
    <Box>
      <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 4 }}>
        <Step>
          <StepLabel>Setup</StepLabel>
        </Step>
        <Step>
          <StepLabel>Interview</StepLabel>
        </Step>
        <Step>
          <StepLabel>Results</StepLabel>
        </Step>
      </Stepper>
      
      {/* Interview Setup Step */}
      {activeStep === 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Interview Setup
          </Typography>
          
          <Typography variant="body1" paragraph>
            You're about to start a {interviewType} interview 
            {jobRole ? ` for the position of ${jobRole}` : ''}.
          </Typography>
          
          <Typography variant="body1" paragraph>
            This simulation will evaluate your responses using AI and provide feedback on:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <QuestionAnswer color="primary" />
              </ListItemIcon>
              <ListItemText primary="Answer quality and relevance" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Psychology color="primary" />
              </ListItemIcon>
              <ListItemText primary="Technical knowledge and problem-solving skills" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SentimentSatisfied color="primary" />
              </ListItemIcon>
              <ListItemText primary="Confidence and emotional cues" />
            </ListItem>
          </List>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={() => {
                startInterview();
                setActiveStep(1);
              }}
              disabled={!questions.length}
            >
              Start Interview
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Interview Questions Step */}
      {activeStep === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5">
                  Question {currentQuestionIndex + 1}/{questions.length}
                </Typography>
                <Chip 
                  label={`Difficulty: ${currentQuestion?.difficulty || 'Medium'}`}
                  color={
                    currentQuestion?.difficulty === 'Hard' ? 'error' :
                    currentQuestion?.difficulty === 'Medium' ? 'warning' : 'success'
                  }
                  size="small"
                />
              </Box>
              
              <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
                {currentQuestion?.text || 'Loading question...'}
              </Typography>
              
              {currentQuestion?.details && (
                <Typography variant="body2" color="text.secondary" paragraph>
                  {currentQuestion.details}
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={toggleResponseMode}
                  startIcon={responseMode === 'voice' ? <Mic /> : <MicOff />}
                >
                  {responseMode === 'voice' ? 'Using Voice' : 'Using Text'}
                </Button>
              </Box>
              
              {responseMode === 'voice' ? (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <SpeechControl
                      onStartRecording={handleRecordingStart}
                      onStopRecording={handleRecordingStop}
                      isRecording={isRecording}
                      maxDuration={120}
                    />
                  </Box>
                  
                  {transcription && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Transcription:
                      </Typography>
                      <Paper 
                        variant="outlined" 
                        sx={{ p: 2, maxHeight: 200, overflow: 'auto' }}
                      >
                        <Typography variant="body2">
                          {transcription}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Box>
              ) : (
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  placeholder="Type your response here..."
                  value={typedResponse}
                  onChange={(e) => setTypedResponse(e.target.value)}
                  variant="outlined"
                />
              )}
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={submitResponse}
                  disabled={evaluating || 
                    (responseMode === 'voice' && !transcription) || 
                    (responseMode === 'text' && !typedResponse.trim())}
                  startIcon={evaluating ? <CircularProgress size={20} /> : <Send />}
                >
                  {evaluating ? 'Evaluating...' : 'Submit Response'}
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <CameraFeed
              onEmotionDetected={handleEmotionDetected}
              sessionActive={interviewStarted && !interviewComplete}
            />
            
            {currentEvaluation && (
              <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Evaluation
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body1" sx={{ mr: 1 }}>
                    Score:
                  </Typography>
                  <Chip
                    label={`${currentEvaluation.score}/100`}
                    color={currentEvaluation.score >= 70 ? 'success' : 
                           currentEvaluation.score >= 50 ? 'warning' : 'error'}
                  />
                </Box>
                
                <Typography variant="body2" paragraph>
                  {currentEvaluation.feedback}
                </Typography>
                
                {currentEvaluation.strengths && currentEvaluation.strengths.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Strengths:
                    </Typography>
                    <List dense>
                      {currentEvaluation.strengths.map((strength, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Done color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={strength} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {currentEvaluation.improvements && currentEvaluation.improvements.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Areas for Improvement:
                    </Typography>
                    <List dense>
                      {currentEvaluation.improvements.map((improvement, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <ArrowForward color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={improvement} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={handleNextQuestion}
                    endIcon={<ArrowForward />}
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
                  </Button>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
      
      {/* Final Results Step */}
      {activeStep === 2 && finalReport && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Interview Results
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ mr: 2 }}>
              Overall Score:
            </Typography>
            <Chip
              label={`${finalReport.overallScore}/100`}
              color={finalReport.overallScore >= 70 ? 'success' : 
                     finalReport.overallScore >= 50 ? 'warning' : 'error'}
              sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}
            />
          </Box>
          
          <Typography variant="body1" paragraph>
            {finalReport.summary}
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Key Strengths
              </Typography>
              <List>
                {finalReport.keyStrengths.map((strength, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Done color="success" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={strength.title}
                      secondary={strength.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Areas to Improve
              </Typography>
              <List>
                {finalReport.areasToImprove.map((area, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ArrowForward color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={area.title}
                      secondary={area.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
          
          {finalReport.skillBreakdown && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Skill Breakdown
              </Typography>
              
              <Grid container spacing={2}>
                {finalReport.skillBreakdown.map((skill, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">
                          {skill.name}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {skill.score}/100
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={skill.score}
                        color={
                          skill.score >= 70 ? 'success' :
                          skill.score >= 50 ? 'warning' : 'error'
                        }
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setInterviewStarted(false);
                setInterviewComplete(false);
                setActiveStep(0);
                setCurrentQuestionIndex(0);
                setResponses([]);
                setFinalReport(null);
                setCurrentEvaluation(null);
              }}
            >
              Start New Interview
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                // Generate downloadable report
                apiEndpoints.reports.generate({
                  reportType: 'interview',
                  sessionId,
                  format: 'pdf'
                }).then(response => {
                  // Create download link
                  const link = document.createElement('a');
                  link.href = response.data.reportUrl;
                  link.download = response.data.fileName || 'interview-report.pdf';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }).catch(err => {
                  console.error('Report generation error:', err);
                });
              }}
            >
              Download Report
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default InterviewSimulator; 