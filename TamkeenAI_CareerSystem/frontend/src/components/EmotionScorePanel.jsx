import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Tooltip,
  Slider,
  LinearProgress,
  Alert
} from '@mui/material';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import InfoIcon from '@mui/icons-material/Info';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { Sentiment, SentimentSatisfied, SentimentVeryDissatisfied, SentimentNeutral, Videocam, VideocamOff } from '@mui/icons-material';
import { Doughnut } from 'react-chartjs-2';
import CameraFeed from './CameraFeed';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

// Define emotion colors and their corresponding icons
const emotionConfig = {
  happy: { 
    color: '#4caf50',
    icon: <SentimentVerySatisfiedIcon />,
    label: 'Happy',
    description: 'You appear to be engaged and enjoying the assessment'
  },
  neutral: { 
    color: '#9e9e9e',
    icon: <SentimentNeutral />,
    label: 'Neutral',
    description: 'You seem focused and attentive'
  },
  sad: { 
    color: '#2196f3',
    icon: <SentimentDissatisfiedIcon />,
    label: 'Sad',
    description: 'You may be feeling a bit uncertain or disappointed'
  },
  angry: { 
    color: '#f44336',
    icon: <SentimentVeryDissatisfiedIcon />,
    label: 'Angry',
    description: 'You appear frustrated or upset with the assessment'
  },
  surprised: { 
    color: '#ff9800',
    icon: <SentimentSatisfiedAltIcon />,
    label: 'Surprised',
    description: 'You seem surprised by the content or difficulty'
  },
  fearful: { 
    color: '#9c27b0',
    icon: <SentimentVeryDissatisfiedIcon />,
    label: 'Anxious',
    description: 'You may be feeling stressed or nervous'
  },
  disgusted: { 
    color: '#795548',
    icon: <SentimentVeryDissatisfiedIcon />,
    label: 'Disgusted',
    description: 'You appear to be having a negative reaction'
  }
};

const EmotionScorePanel = ({ 
  emotionData, 
  isAssessmentActive = false,
  difficultyLevel = 'medium',
  onEmotionUpdate,
  showVideo = true,
  compact = false
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [captureInterval, setCaptureInterval] = useState(null);
  const [stressLevel, setStressLevel] = useState('normal');
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [currentConfidence, setCurrentConfidence] = useState(0);
  
  // Update current emotion when emotionData changes
  useEffect(() => {
    if (emotionData) {
      // Find the emotion with highest confidence
      let highestEmotion = 'neutral';
      let highestConfidence = 0;
      
      Object.entries(emotionData.emotions || {}).forEach(([emotion, confidence]) => {
        if (confidence > highestConfidence) {
          highestEmotion = emotion;
          highestConfidence = confidence;
        }
      });
      
      setCurrentEmotion(highestEmotion);
      setCurrentConfidence(highestConfidence);
      
      // Add to history
      setEmotionHistory(prev => [
        ...prev, 
        { 
          emotion: highestEmotion, 
          confidence: highestConfidence, 
          timestamp: new Date().toISOString() 
        }
      ].slice(-10)); // Keep last 10 entries
      
      // Update stress level
      updateStressLevel(highestEmotion);
    }
  }, [emotionData]);
  
  // Start camera and analysis when assessment becomes active
  useEffect(() => {
    if (isAssessmentActive && !cameraActive) {
      setCameraActive(true);
      startAnalysis();
    } else if (!isAssessmentActive && cameraActive) {
      stopAnalysis();
    }
    
    return () => {
      if (captureInterval) {
        clearInterval(captureInterval);
      }
    };
  }, [isAssessmentActive]);
  
  // Start/stop camera
  const toggleCamera = () => {
    if (cameraActive) {
      stopAnalysis();
    } else {
      setCameraActive(true);
      if (isAssessmentActive) {
        startAnalysis();
      }
    }
  };

  // Start emotion analysis
  const startAnalysis = () => {
    setAnalyzing(true);
    setError(null);
    
    // Set up interval to analyze emotions periodically
    const interval = setInterval(captureAndAnalyze, 5000); // Every 5 seconds
    setCaptureInterval(interval);
  };

  // Stop emotion analysis
  const stopAnalysis = () => {
    if (captureInterval) {
      clearInterval(captureInterval);
      setCaptureInterval(null);
    }
    setAnalyzing(false);
    if (cameraActive) {
      setCameraActive(false);
    }
  };
  
  // Update stress level based on detected emotion
  const updateStressLevel = (emotion) => {
    if (['angry', 'fearful', 'disgusted'].includes(emotion)) {
      setStressLevel('high');
    } else if (['sad'].includes(emotion)) {
      setStressLevel('moderate');
    } else if (['happy', 'surprised'].includes(emotion)) {
      setStressLevel('low');
    } else {
      setStressLevel('normal');
    }
  };

  // Capture image and send for analysis
  const captureAndAnalyze = async () => {
    try {
      // In a real application, this would call the camera API
      // and send the frame for emotion analysis
      
      // For this demo, we'll use mock data
      const mockEmotions = ['neutral', 'happy', 'neutral', 'surprised', 'neutral', 'sad'];
      const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
      const mockData = {
        emotions: {
          happy: randomEmotion === 'happy' ? 0.7 : 0.1,
          sad: randomEmotion === 'sad' ? 0.6 : 0.05,
          angry: randomEmotion === 'angry' ? 0.8 : 0.03,
          surprised: randomEmotion === 'surprised' ? 0.65 : 0.07,
          fearful: randomEmotion === 'fearful' ? 0.75 : 0.02,
          disgusted: randomEmotion === 'disgusted' ? 0.55 : 0.01,
          neutral: randomEmotion === 'neutral' ? 0.85 : 0.2
        },
        primaryEmotion: randomEmotion,
        insights: [
          {
            title: 'Assessment Confidence',
            description: randomEmotion === 'happy' || randomEmotion === 'neutral' 
              ? 'You appear confident about this assessment'
              : 'You may be experiencing some uncertainty'
          },
          {
            title: 'Stress Management',
            description: stressLevel === 'high'
              ? 'Try taking a deep breath to manage stress'
              : 'You seem to be handling the assessment well'
          }
        ]
      };
      
      // In a real app, this would come from the API
      // const response = await apiEndpoints.assessments.detectEmotion(formData);
      // const newEmotionData = response.data;
      
      if (onEmotionUpdate) {
        onEmotionUpdate(mockData);
      }
    } catch (err) {
      setError('Failed to analyze emotions');
      console.error('Emotion analysis error:', err);
    }
  };

  // Render compact version
  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Tooltip title={emotionConfig[currentEmotion]?.description || 'Emotion status'}>
          <Box sx={{ 
            color: emotionConfig[currentEmotion]?.color || 'text.secondary',
            display: 'flex',
            alignItems: 'center',
            mr: 1
          }}>
            {emotionConfig[currentEmotion]?.icon || <SentimentNeutral />}
          </Box>
        </Tooltip>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {emotionConfig[currentEmotion]?.label || 'Neutral'}
          </Typography>
          {stressLevel !== 'normal' && (
            <Chip 
              size="small" 
              label={`${stressLevel.charAt(0).toUpperCase() + stressLevel.slice(1)} stress`}
              color={stressLevel === 'high' ? 'error' : stressLevel === 'moderate' ? 'warning' : 'success'}
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          )}
        </Box>
        
        <IconButton 
          size="small" 
          onClick={toggleCamera}
          color={cameraActive ? 'primary' : 'default'}
        >
          {cameraActive ? <Videocam fontSize="small" /> : <VideocamOff fontSize="small" />}
        </IconButton>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Sentiment sx={{ mr: 1 }} />
        Emotion Assessment
      </Typography>
      
      {showVideo && (
        <Box sx={{ position: 'relative', mb: 2 }}>
          {cameraActive ? (
            <Box sx={{ 
              width: '100%', 
              height: 200, 
              bgcolor: 'grey.900', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: 1,
              overflow: 'hidden'
            }}>
              <Typography color="white">Camera feed placeholder</Typography>
              {/* In a real app, this would be: */}
              {/* <CameraFeed width={400} height={300} /> */}
            </Box>
          ) : (
            <Box 
              sx={{ 
                width: '100%', 
                height: 200, 
                bgcolor: 'grey.200', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: 1
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Camera is disabled
              </Typography>
            </Box>
          )}
          
          {analyzing && (
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 10, 
                right: 10, 
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <CircularProgress size={14} sx={{ color: 'white', mr: 1 }} />
              <Typography variant="caption">Analyzing</Typography>
            </Box>
          )}
        </Box>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ 
          bgcolor: emotionConfig[currentEmotion]?.color || 'grey.500', 
          color: 'white', 
          width: 40, 
          height: 40, 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mr: 2
        }}>
          {emotionConfig[currentEmotion]?.icon || <SentimentNeutral />}
        </Box>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1">
            {emotionConfig[currentEmotion]?.label || 'Neutral'} 
            <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
              ({Math.round(currentConfidence * 100)}% confidence)
            </Typography>
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            {emotionConfig[currentEmotion]?.description || 'Your emotional state appears neutral'}
          </Typography>
        </Box>
        
        <Button
          variant={cameraActive ? "outlined" : "contained"}
          startIcon={cameraActive ? <VideocamOff /> : <Videocam />}
          size="small"
          onClick={toggleCamera}
        >
          {cameraActive ? 'Disable' : 'Enable'}
        </Button>
      </Box>
      
      {stressLevel !== 'normal' && (
        <Alert 
          severity={stressLevel === 'high' ? 'warning' : stressLevel === 'moderate' ? 'info' : 'success'} 
          sx={{ mb: 2 }}
        >
          {stressLevel === 'high' 
            ? 'High stress detected. Take a deep breath and try to relax.' 
            : stressLevel === 'moderate' 
              ? 'Moderate stress detected. Remember to stay calm and focused.'
              : 'Low stress detected. You seem to be handling this well!'}
        </Alert>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Difficulty Adjustment
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Current difficulty: {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <InfoIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={stressLevel === 'high' 
                ? 'Difficulty reduced due to high stress'
                : 'Difficulty adjusted based on emotion and performance'}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <TipsAndUpdatesIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary="Recommendation"
              secondary={stressLevel === 'high'
                ? 'Take a short break if needed'
                : 'Continue at current pace'}
            />
          </ListItem>
        </List>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
};

export default EmotionScorePanel;
