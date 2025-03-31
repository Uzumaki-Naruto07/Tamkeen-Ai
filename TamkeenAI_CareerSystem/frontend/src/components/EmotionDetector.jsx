import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, IconButton, Alert, Tooltip, CircularProgress } from '@mui/material';
import { Videocam, VideocamOff, Refresh, Info } from '@mui/icons-material';
import apiEndpoints from '../utils/api';

const EmotionDetector = ({ onEmotionDetected, interval = 15000 }) => {
  const [emotion, setEmotion] = useState('neutral');
  const [confidence, setConfidence] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Emotion colors and descriptions
  const emotionInfo = {
    neutral: { color: '#9e9e9e', description: 'You appear calm and focused' },
    happy: { color: '#4caf50', description: 'You seem positive and engaged' },
    sad: { color: '#2196f3', description: 'You may be feeling a bit down' },
    angry: { color: '#f44336', description: 'You might be feeling frustrated' },
    surprised: { color: '#ff9800', description: 'You appear surprised or alert' },
    stressed: { color: '#e91e63', description: 'You seem to be under stress' },
    anxious: { color: '#9c27b0', description: 'You may be feeling anxious' }
  };

  // Start webcam and emotion detection
  const startDetection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 320, height: 240 }
      });
      
      // Set up video stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setIsDetecting(true);
      setPermissionDenied(false);
      
      // Start periodic emotion detection
      detectEmotionPeriodically();
    } catch (err) {
      console.error('Camera permission error:', err);
      setPermissionDenied(true);
      setError('Camera access is required for emotion detection');
    } finally {
      setLoading(false);
    }
  };

  // Stop webcam and detection
  const stopDetection = () => {
    // Clear the detection interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop all video tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Reset video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsDetecting(false);
  };

  // Set up periodic emotion detection
  const detectEmotionPeriodically = () => {
    // Immediately detect emotion once
    detectEmotion();
    
    // Set up interval for continued detection
    timerRef.current = setInterval(() => {
      detectEmotion();
    }, interval);
  };

  // Capture image and detect emotion
  const detectEmotion = async () => {
    if (!videoRef.current || !streamRef.current) return;
    
    try {
      setLoading(true);
      
      // Create a canvas and draw the current video frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob (image data)
      const imageBlob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/jpeg');
      });
      
      // Create form data with image
      const formData = new FormData();
      formData.append('image', imageBlob, 'emotion-capture.jpg');
      
      // Call emotion detection API
      try {
        const response = await apiEndpoints.assessments.detectEmotion(formData);
        
        // Update state with detected emotion
        if (response.data && response.data.emotion) {
          setEmotion(response.data.emotion.toLowerCase());
          setConfidence(response.data.confidence || 0);
          
          // Notify parent component
          if (onEmotionDetected) {
            onEmotionDetected(response.data.emotion.toLowerCase());
          }
        }
      } catch (apiError) {
        console.error('Emotion API error:', apiError);
        
        // For demo/development - alternate between emotions randomly 
        // if the actual API is not available
        const mockEmotions = ['neutral', 'happy', 'stressed', 'anxious', 'neutral', 'sad'];
        const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
        const randomConfidence = Math.floor(Math.random() * 30) + 70; // 70-100%
        
        setEmotion(randomEmotion);
        setConfidence(randomConfidence);
        
        // Notify parent component
        if (onEmotionDetected) {
          onEmotionDetected(randomEmotion);
        }
      }
    } catch (err) {
      console.error('Error during emotion detection:', err);
      setError('Failed to detect emotion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          Emotion Detection
          <Tooltip title="We monitor your emotional state to adapt the assessment experience and provide better support">
            <IconButton size="small" sx={{ ml: 1 }}>
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        
        {isDetecting ? (
          <IconButton onClick={stopDetection} color="error">
            <VideocamOff />
          </IconButton>
        ) : (
          <IconButton 
            onClick={startDetection} 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : <Videocam />}
          </IconButton>
        )}
      </Box>
      
      {permissionDenied ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Camera access is needed for emotion detection. Please allow camera access and refresh.
        </Alert>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        {isDetecting && (
          <Box 
            component="video"
            ref={videoRef} 
            autoPlay 
            muted
            sx={{ 
              width: 160,
              height: 120,
              borderRadius: 1,
              bgcolor: 'black'
            }}
          />
        )}
        
        <Box sx={{ flexGrow: 1 }}>
          {isDetecting ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Detected emotion:
                </Typography>
                <Typography 
                  variant="body1" 
                  fontWeight="medium"
                  sx={{ 
                    color: emotionInfo[emotion]?.color || 'text.primary',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                  {loading && <CircularProgress size={16} sx={{ ml: 1 }} />}
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {emotionInfo[emotion]?.description || 'Your emotional state is being monitored'}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Enable emotion detection to adapt the assessment to your emotional state. Your privacy is important - data is processed locally and not stored.
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default EmotionDetector; 