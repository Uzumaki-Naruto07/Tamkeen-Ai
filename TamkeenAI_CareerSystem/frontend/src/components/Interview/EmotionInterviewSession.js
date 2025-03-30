import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Button, Typography, Paper, Stepper, Step, StepLabel, 
  TextField, CircularProgress, Card, CardContent, Divider,
  Alert, List, ListItem, ListItemText
} from '@mui/material';
import CameraFeed from '../EmotionDetection/CameraFeed';
import { useAuth } from '../../context/AppContext';
import axios from 'axios';

const EmotionInterviewSession = () => {
  const { token } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [session, setSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState('Software Engineer');
  const [numQuestions, setNumQuestions] = useState(5);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentResults, setCurrentResults] = useState(null);
  const [interviewActive, setInterviewActive] = useState(false);
  const [emotionData, setEmotionData] = useState([]);
  const wsRef = useRef(null);
  const clientId = useRef(`interview-${Math.random().toString(36).substring(2, 9)}`);
  
  // Connect to WebSocket for interview session
  const connectWebSocket = () => {
    const wsUrl = `ws://${window.location.hostname}:8000/emotion/ws/camera/${clientId.current}`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('Interview WebSocket connected');
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'session_started':
            setSession({
              sessionId: data.session_id,
              questions: data.questions,
              currentQuestion: data.current_question,
              totalQuestions: data.total_questions
            });
            setSessionId(data.session_id);
            setActiveStep(1); // Move to first question
            break;
            
          case 'question_completed':
            setCurrentResults(data.emotion_analysis);
            setActiveStep(activeStep + 1);
            break;
            
          case 'interview_completed':
            setInterviewActive(false);
            // Handle interview completion and show results
            break;
            
          case 'error':
            setError(data.message);
            break;
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('Interview WebSocket disconnected');
    };
    
    wsRef.current.onerror = (error) => {
      console.error('Interview WebSocket error:', error);
      setError('WebSocket connection error');
    };
  };
  
  // Start interview session
  const startInterview = () => {
    setLoading(true);
    setError(null);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Start via WebSocket
      wsRef.current.send(JSON.stringify({
        type: 'start_interview',
        token,
        role,
        num_questions: numQuestions
      }));
      setInterviewActive(true);
      setLoading(false);
    } else {
      // Fallback to REST API
      axios.post('/api/emotion/interview/start', {
        role,
        num_questions: numQuestions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setSession(response.data);
        setSessionId(response.data.session_id);
        setActiveStep(1); // Move to first question
        setInterviewActive(true);
      })
      .catch(err => {
        setError(`Error starting interview: ${err.response?.data?.detail || err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
    }
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
        headers: { Authorization: `Bearer ${token}` }
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
  
  // Connect WebSocket on mount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);
  
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
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Interview with Emotion Analysis
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {session && activeStep > 0 && (
        <Stepper activeStep={activeStep - 1} alternativeLabel sx={{ mb: 4 }}>
          {session.questions.map((question, index) => (
            <Step key={index}>
              <StepLabel>Question {index + 1}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          {renderStepContent()}
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: 300 } }}>
          <Typography variant="h6" gutterBottom>
            Camera Feed
          </Typography>
          <CameraFeed 
            onEmotionDetected={handleEmotionDetected}
            sessionActive={interviewActive && activeStep > 0 && activeStep <= (session?.questions?.length || 0) * 2}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default EmotionInterviewSession; 