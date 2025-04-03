import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Button, Typography, Paper, Stepper, Step, StepLabel, 
  TextField, CircularProgress, Card, CardContent, Divider,
  Alert, List, ListItem, ListItemText
} from '@mui/material';
import CameraFeed from '../EmotionDetection/CameraFeed';
import { useAuth } from '../../context/AppContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import apiEndpoints from '../../api/apiEndpoints';
import EmotionDetector from '../EmotionDetection/EmotionDetector';
import useAuth from '../../hooks/useAuth';

const EmotionInterviewSession = ({ mode = 'practice' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [session, setSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('Software Engineer');
  const [numQuestions, setNumQuestions] = useState(5);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentResults, setCurrentResults] = useState(null);
  const [interviewActive, setInterviewActive] = useState(false);
  const [emotionData, setEmotionData] = useState([]);
  const wsRef = useRef(null);
  const clientId = useRef(`interview-${Math.random().toString(36).substring(2, 9)}`);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsReconnectAttempts, setWsReconnectAttempts] = useState(0);
  const sessionIdRef = useRef(null);
  const [dominantEmotion, setDominantEmotion] = useState(null);
  
  // Fetch interview questions on mount
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching interview session...');
        // Use appropriate endpoint based on mode
        let response;
        try {
          if (mode === 'practice') {
            response = await apiEndpoints.interviews.getPracticeInterview();
          } else if (mode === 'assessment') {
            response = await apiEndpoints.interviews.getAssessmentInterview();
          } else {
            throw new Error('Invalid interview mode');
          }
        } catch (apiError) {
          console.warn('API error, using mock data:', apiError.message);
          response = null;
        }
        
        if (!response || !response.questions || response.questions.length === 0) {
          // Use mock data if response is empty
          console.log('Using mock interview data as fallback');
          const mockSession = {
            id: `mock-session-${Date.now()}`,
            title: 'Mock Interview Session',
            description: 'This is a mock interview session with generated questions.',
            questions: [
              {
                id: 'q1',
                text: 'Tell me about yourself and your background.',
                type: 'open_ended',
              },
              {
                id: 'q2',
                text: 'What are your strengths and weaknesses?',
                type: 'open_ended',
              },
              {
                id: 'q3',
                text: 'Describe a difficult work situation and how you overcame it.',
                type: 'open_ended',
              },
              {
                id: 'q4',
                text: 'Where do you see yourself in 5 years?',
                type: 'open_ended',
              }
            ]
          };
          setSession(mockSession);
          sessionIdRef.current = mockSession.id;
        } else {
          setSession(response);
          sessionIdRef.current = response.id;
        }
      } catch (err) {
        console.error('Error fetching interview:', err);
        setError(`Failed to load interview session: ${err.message}`);
        
        // Use mock data as fallback
        const mockSession = {
          id: `mock-session-${Date.now()}`,
          title: 'Mock Interview Session',
          description: 'This is a mock interview session with generated questions.',
          questions: [
            {
              id: 'q1',
              text: 'Tell me about yourself and your background.',
              type: 'open_ended',
            },
            {
              id: 'q2',
              text: 'What are your strengths and weaknesses?',
              type: 'open_ended',
            },
            {
              id: 'q3',
              text: 'Describe a difficult work situation and how you overcame it.',
              type: 'open_ended',
            }
          ]
        };
        setSession(mockSession);
        sessionIdRef.current = mockSession.id;
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
    
    // Cleanup on unmount
    return () => {
      disconnectWebSocket();
    };
  }, [mode]);

  // Connect to WebSocket for emotion analysis
  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }
    
    // Get WebSocket URL
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsHost = process.env.REACT_APP_WS_HOST || window.location.hostname;
    const wsPort = process.env.REACT_APP_WS_PORT || (window.location.hostname === 'localhost' ? '8000' : window.location.port);
    const wsPath = 'interviews/ws';
    const sessionId = sessionIdRef.current || 'mock-session';
    
    const wsUrl = `${wsProtocol}${wsHost}${wsPort ? `:${wsPort}` : ''}/${wsPath}/${sessionId}`;
    
    console.log('Connecting to interview WebSocket:', wsUrl);
    
    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('Interview WebSocket connected');
        setWsConnected(true);
        setWsReconnectAttempts(0);
        
        // Send session start event
        if (interviewActive) {
          sendWebSocketEvent('session_start', {
            session_id: sessionIdRef.current,
            question_id: getCurrentQuestion()?.id,
            question_index: activeStep
          });
        }
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'emotion_update') {
            setEmotionData(prevEmotions => {
              // Keep only the last 10 emotion readings
              const updatedEmotions = [
                ...prevEmotions, 
                { timestamp: new Date().toISOString(), ...data.emotions }
              ].slice(-10);
              return updatedEmotions;
            });
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setWsConnected(false);
        
        // Attempt to reconnect on unexpected close
        if (interviewActive && event.code !== 1000 && event.code !== 1001) {
          const maxReconnectAttempts = 5;
          if (wsReconnectAttempts < maxReconnectAttempts) {
            const timeout = Math.min(1000 * Math.pow(2, wsReconnectAttempts), 10000);
            console.log(`Attempting to reconnect WebSocket in ${timeout}ms (attempt ${wsReconnectAttempts + 1}/${maxReconnectAttempts})`);
            
            setTimeout(() => {
              setWsReconnectAttempts(prev => prev + 1);
              connectWebSocket();
            }, timeout);
          }
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };
    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setWsConnected(false);
    }
  };
  
  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setWsConnected(false);
    }
  };
  
  // Send event to WebSocket
  const sendWebSocketEvent = (eventType, data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: eventType,
        ...data
      });
      wsRef.current.send(message);
    } else {
      console.warn('WebSocket not connected, cannot send event:', eventType);
      
      // Try to reconnect
      if (interviewActive && !wsConnected) {
        connectWebSocket();
      }
    }
  };

  // Start the interview session
  const startInterview = () => {
    setInterviewActive(true);
    setActiveStep(0);
    connectWebSocket();
    
    // Notify backend of session start
    sendWebSocketEvent('session_start', {
      session_id: sessionIdRef.current,
      question_id: getCurrentQuestion()?.id,
      question_index: 0
    });
  };

  // Get current question
  const getCurrentQuestion = () => {
    if (!session || !session.questions || session.questions.length === 0) {
      return null;
    }
    return session.questions[activeStep];
  };

  // Submit answer and emotion data
  const submitAnswer = () => {
    setLoading(true);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Submit via WebSocket
      wsRef.current.send(JSON.stringify({
        type: 'end_question',
        answer_text: currentAnswer
      }));
    } else {
      // Fallback to REST API
      axios.post('/api/emotion/interview/answer', {
        session_id: sessionId,
        question_index: activeStep - 1,
        answer_text: currentAnswer,
        emotion_data: emotionData
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(response => {
        setCurrentResults(response.data.emotion_analysis);
        setActiveStep(activeStep + 1);
      })
      .catch(err => {
        setError(`Error submitting answer: ${err.response?.data?.detail || err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
    }
    
    // Reset for next question
    setCurrentAnswer('');
    setEmotionData([]);
  };
  
  // End interview
  const endInterview = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'end_interview'
      }));
    }
    
    setInterviewActive(false);
    setActiveStep(0);
  };
  
  // Handle emotion detection from camera
  const handleEmotionDetected = (results) => {
    if (interviewActive && activeStep > 0 && activeStep <= (session?.questions?.length || 0)) {
      // Store emotion data for the current answer
      setEmotionData(prev => [...prev, {
        timestamp: Date.now(),
        emotions: results
      }]);
    }
  };
  
  // Render interview setup
  const renderSetup = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>Interview Setup</Typography>
      <TextField
        fullWidth
        label="Job Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Number of Questions"
        type="number"
        value={numQuestions}
        onChange={(e) => setNumQuestions(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
        inputProps={{ min: 1, max: 10 }}
        margin="normal"
      />
      <Button 
        variant="contained" 
        color="primary" 
        onClick={startInterview}
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Start Interview'}
      </Button>
    </Paper>
  );
  
  // Render current question
  const renderQuestion = () => {
    if (!session || !session.questions) return null;
    
    const currentQuestionIndex = activeStep - 1;
    const question = session.questions[currentQuestionIndex];
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            Question {currentQuestionIndex + 1} of {session.questions.length}
          </Typography>
          <Typography variant="h5" gutterBottom>
            {question}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Answer"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            margin="normal"
          />
          <Button 
            variant="contained" 
            color="primary" 
            onClick={submitAnswer}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit Answer'}
          </Button>
        </CardContent>
      </Card>
    );
  };
  
  // Render analysis results
  const renderResults = () => {
    if (!currentResults) return null;
    
    const { confidence_score, engagement_score, dominant_emotion, insights } = currentResults;
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            Analysis Results
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">Confidence</Typography>
              <Typography variant="h5">{(confidence_score * 100).toFixed(0)}%</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">Engagement</Typography>
              <Typography variant="h5">{(engagement_score * 100).toFixed(0)}%</Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">Main Emotion</Typography>
              <Typography variant="h5">{dominant_emotion}</Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Insights:
          </Typography>
          
          <List dense>
            {insights.map((insight, index) => (
              <ListItem key={index}>
                <ListItemText primary={insight} />
              </ListItem>
            ))}
          </List>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setActiveStep(activeStep + 1)}
            sx={{ mt: 2 }}
          >
            {activeStep < session?.questions?.length ? 'Next Question' : 'Finish Interview'}
          </Button>
        </CardContent>
      </Card>
    );
  };
  
  // Determine what to render based on active step
  const renderStepContent = () => {
    if (activeStep === 0) {
      return renderSetup();
    }
    
    const questionIndex = Math.floor((activeStep - 1) / 2);
    const isQuestionStep = (activeStep - 1) % 2 === 0;
    
    if (questionIndex >= (session?.questions?.length || 0)) {
      return (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Interview Complete</Typography>
          <Typography paragraph>
            Your interview session has been completed and analyzed. You can view detailed results 
            in your interview history.
          </Typography>
          <Button variant="contained" color="primary" onClick={() => setActiveStep(0)}>
            Start New Interview
          </Button>
        </Paper>
      );
    }
    
    return isQuestionStep ? renderQuestion() : renderResults();
  };
  
  // Get emotion color based on the emotion type
  const getEmotionColor = (emotion) => {
    const colorMap = {
      happy: '#4CAF50',
      sad: '#2196F3',
      angry: '#F44336',
      surprised: '#FF9800',
      fearful: '#9C27B0',
      disgusted: '#795548',
      neutral: '#9E9E9E',
    };
    
    return colorMap[emotion] || '#9E9E9E';
  };

  // Display loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading interview session...
        </Typography>
      </Box>
    );
  }

  // Display error state
  if (error && !session) {
    return (
      <Box sx={{ my: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  // Session setup screen
  if (!interviewActive) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', my: 4, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {session?.title || 'Interview Session'}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {session?.description || 'You are about to start an interview session with emotion analysis. Your camera will be used to detect your facial expressions during the interview.'}
        </Typography>
        
        <Typography variant="body1" paragraph>
          This session contains {session?.questions?.length || 0} questions. You can take your time to answer each question thoughtfully.
        </Typography>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" gutterBottom>
            Camera Test
          </Typography>
          
          <Paper sx={{ p: 2, mb: 3 }}>
            <EmotionDetector 
              onEmotionDetected={handleEmotionDetected} 
              size="large"
              showVideo={true}
            />
          </Paper>
          
          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              onClick={startInterview}
            >
              Start Interview
            </Button>
            
            <Button 
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // Active interview session
  const currentQuestion = getCurrentQuestion();
  
  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', my: 4, p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          {session?.title || 'Interview Session'}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {dominantEmotion && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: `${getEmotionColor(dominantEmotion.emotion)}20`,
              color: getEmotionColor(dominantEmotion.emotion),
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              mr: 2
            }}>
              <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}>
                {dominantEmotion.emotion}
              </Typography>
            </Box>
          )}
          
          <Button 
            variant="outlined" 
            color="error"
            size="small"
            onClick={endInterview}
          >
            End Interview
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Main content area */}
        <Box sx={{ flexGrow: 1 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Question {activeStep} of {session?.questions?.length}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              {currentQuestion?.text || 'No question available'}
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              placeholder="Type your answer here..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              sx={{ mt: 2 }}
              disabled={loading}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                disabled={loading || !currentAnswer.trim()}
                onClick={submitAnswer}
                sx={{ minWidth: 120 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Answer'}
              </Button>
              
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                {activeStep < session?.questions?.length - 1 
                  ? 'Press Submit to continue to the next question' 
                  : 'This is the final question'}
              </Typography>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Box>
        
        {/* Camera feed */}
        <Box sx={{ width: { xs: '100%', md: 320 } }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Emotion Analysis
            </Typography>
            
            <EmotionDetector 
              onEmotionDetected={handleEmotionDetected} 
              size="normal"
              showVideo={true}
            />
            
            {emotionData.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recent Emotions
                </Typography>
                
                <Box sx={{ maxHeight: 120, overflowY: 'auto' }}>
                  {emotionData.slice(-5).map((emotionData, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        mb: 0.5,
                        p: 0.5,
                        borderRadius: 1,
                        bgcolor: index === 0 ? `${getEmotionColor(emotionData.emotions[0].emotion)}10` : 'transparent'
                      }}
                    >
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {emotionData.emotions[0].emotion}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {(emotionData.emotions[0].confidence * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
            
            <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Our AI is analyzing your facial expressions in real-time to provide feedback on your interview performance.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default EmotionInterviewSession; 