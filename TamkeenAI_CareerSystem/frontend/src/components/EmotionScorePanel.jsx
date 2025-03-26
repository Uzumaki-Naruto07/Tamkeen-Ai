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

const EmotionScorePanel = ({ onEmotionUpdate = () => {} }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [emotionData, setEmotionData] = useState(null);
  const [error, setError] = useState(null);
  const [captureInterval, setCaptureInterval] = useState(null);

  // Start/stop camera
  const toggleCamera = () => {
    if (cameraActive) {
      stopAnalysis();
    } else {
      setCameraActive(true);
    }
  };

  // Start emotion analysis
  const startAnalysis = () => {
    setAnalyzing(true);
    setError(null);
    
    // Set up interval to analyze emotions periodically
    const interval = setInterval(captureAndAnalyze, 3000); // Every 3 seconds
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (captureInterval) {
        clearInterval(captureInterval);
      }
    };
  }, [captureInterval]);

  // Capture image and send for analysis
  const captureAndAnalyze = async () => {
    try {
      // Get canvas from CameraFeed component
      const canvas = document.getElementById('camera-canvas');
      if (!canvas) return;
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });
      
      if (!blob) return;
      
      // Prepare form data
      const formData = new FormData();
      formData.append('image', blob, 'emotion-capture.jpg');
      
      // This connects to emotion_detector.py backend
      const response = await apiEndpoints.interview.analyzeEmotions(formData);
      
      // Response includes facial expression scoring from emotion_detector.py
      const newEmotionData = response.data;
      setEmotionData(newEmotionData);
      onEmotionUpdate(newEmotionData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze emotions');
      console.error('Emotion analysis error:', err);
      stopAnalysis();
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Sentiment sx={{ mr: 1 }} />
        Facial Expression Analysis
      </Typography>
      
      <Box sx={{ position: 'relative', mb: 2 }}>
        {cameraActive ? (
          <CameraFeed 
            width={400} 
            height={300} 
            canvasId="camera-canvas" 
          />
        ) : (
          <Box 
            sx={{ 
              width: '100%', 
              height: 300, 
              bgcolor: 'grey.200', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
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
            <Typography variant="caption">Analyzing...</Typography>
          </Box>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant={cameraActive ? "outlined" : "contained"}
          startIcon={cameraActive ? <VideocamOff /> : <Videocam />}
          onClick={toggleCamera}
        >
          {cameraActive ? 'Disable Camera' : 'Enable Camera'}
        </Button>
        
        {cameraActive && (
          <Button
            variant={analyzing ? "outlined" : "contained"}
            color={analyzing ? "error" : "primary"}
            onClick={analyzing ? stopAnalysis : startAnalysis}
          >
            {analyzing ? 'Stop Analysis' : 'Start Analysis'}
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {emotionData && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Emotion Distribution
            </Typography>
            <Box sx={{ height: 200 }}>
              <Doughnut 
                data={{
                  labels: Object.keys(emotionData.emotions),
                  datasets: [{
                    data: Object.values(emotionData.emotions),
                    backgroundColor: [
                      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'
                    ]
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    }
                  }
                }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Interview Performance Insights
            </Typography>
            <List>
              {emotionData.insights.map((insight, index) => (
                <ListItem key={index} divider={index < emotionData.insights.length - 1}>
                  <ListItemText
                    primary={insight.title}
                    secondary={insight.description}
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      )}
    </Paper>
  );
};

export default EmotionScorePanel;
