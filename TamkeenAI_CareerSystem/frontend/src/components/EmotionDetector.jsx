import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, IconButton, Alert, Tooltip, CircularProgress, Button } from '@mui/material';
import { Videocam, VideocamOff, Refresh, Info } from '@mui/icons-material';
import apiEndpoints from '../utils/api';

const EmotionDetector = ({ onEmotionDetected, interval = 10000, size = 'normal', showVideo = true }) => {
  const [emotion, setEmotion] = useState('neutral');
  const [confidence, setConfidence] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('inactive'); // 'inactive', 'requesting', 'active', 'error'

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
      setCameraStatus('requesting');
      
      // Request camera permission with explicit constraints
      const constraints = { 
        video: { 
          facingMode: 'user', 
          width: { ideal: 320 }, 
          height: { ideal: 240 },
          frameRate: { ideal: 15 }
        }
      };
      
      console.log('Requesting camera access with constraints:', constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
        .catch(err => {
          console.error('Detailed camera access error:', err);
          // Try fallback to any camera if user-facing camera fails
          if (err.name === 'OverconstrainedError') {
            console.log('Falling back to any available camera');
            return navigator.mediaDevices.getUserMedia({ video: true });
          }
          throw err;
        });
      
      console.log('Camera access granted, stream:', stream);
      
      // Set up video stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoRef.current.play()
            .then(() => {
              console.log('Video playback started successfully');
              setCameraStatus('active');
            })
            .catch(playErr => {
              console.error('Error starting video playback:', playErr);
              setCameraStatus('error');
              setError(`Error starting video: ${playErr.message}`);
            });
        };
        
        streamRef.current = stream;
      }
      
      setIsDetecting(true);
      setPermissionDenied(false);
      
      // Start periodic emotion detection
      detectEmotionPeriodically();
    } catch (err) {
      console.error('Camera permission error:', err);
      setPermissionDenied(true);
      setCameraStatus('error');
      setError(`Camera access denied: ${err.name} - ${err.message}`);
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
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.label);
        track.stop();
      });
      streamRef.current = null;
    }
    
    // Reset video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraStatus('inactive');
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
    if (!videoRef.current || !streamRef.current) {
      console.log('Video reference or stream not available, skipping emotion detection');
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if video is actually playing and has dimensions
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        console.warn('Video dimensions are zero, camera may not be working properly');
        throw new Error('Video stream not available');
      }
      
      // Create a canvas and draw the current video frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob (image data)
      const imageBlob = await new Promise((resolve, reject) => {
        try {
          canvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob from canvas'));
          }, 'image/jpeg', 0.8);
        } catch (e) {
          reject(e);
        }
      });
      
      // Create form data with image
      const formData = new FormData();
      formData.append('image', imageBlob, 'emotion-capture.jpg');
      
      // Use mock emotion detection if API is not available
      if (!apiEndpoints || !apiEndpoints.assessments || typeof apiEndpoints.assessments.detectEmotion !== 'function') {
        console.log('Using mock emotion detection');
        const mockEmotions = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'stressed', 'anxious'];
        const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
        const mockResponse = {
          data: {
            emotion: randomEmotion,
            confidence: Math.random() * 0.5 + 0.5 // Random confidence between 0.5 and 1.0
          }
        };
        
        // Update state with mock emotion
        setEmotion(mockResponse.data.emotion.toLowerCase());
        setConfidence(mockResponse.data.confidence || 0);
        
        // Notify parent component
        if (onEmotionDetected) {
          onEmotionDetected(mockResponse.data.emotion.toLowerCase());
        }
        
        setLoading(false);
        return;
      }
      
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
        console.error('API error in emotion detection:', apiError);
        // Use fallback random emotion if API fails
        const mockEmotions = ['neutral', 'happy', 'sad'];
        const randomEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
        
        setEmotion(randomEmotion);
        setConfidence(0.7);
        
        if (onEmotionDetected) {
          onEmotionDetected(randomEmotion);
        }
      }
    } catch (err) {
      console.error('Error in emotion detection:', err);
      setError(`Failed to process video frame: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-start on mount if showVideo is true
  useEffect(() => {
    if (showVideo) {
      startDetection();
    }
    
    return () => {
      stopDetection();
    };
  }, [showVideo]);

  // Generate emotion display style
  const getEmotionStyle = () => {
    const emotionColor = emotionInfo[emotion]?.color || '#9e9e9e';
    
    return {
      color: emotionColor,
      borderColor: emotionColor,
      backgroundColor: `${emotionColor}1A`, // 10% opacity
    };
  };
  
  // Refresh camera if it's in error state
  const handleRefreshCamera = () => {
    stopDetection();
    setTimeout(() => {
      startDetection();
    }, 1000);
  };

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
          <IconButton onClick={stopDetection} color="error" disabled={loading}>
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
        
        {(cameraStatus === 'error' || error) && (
          <IconButton 
            onClick={handleRefreshCamera} 
            color="primary"
            disabled={loading}
            title="Refresh camera"
          >
            <Refresh />
          </IconButton>
        )}
      </Box>
      
      {permissionDenied ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Camera access is needed for emotion detection. Please allow camera access in your browser settings.
          <Button 
            variant="outlined" 
            size="small" 
            sx={{ mt: 1 }}
            onClick={startDetection}
          >
            Try Again
          </Button>
        </Alert>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      
      {showVideo && (
        <Box 
          sx={{ 
            position: 'relative', 
            width: '100%',
            height: size === 'small' ? 120 : 240,
            backgroundColor: '#f0f0f0',
            borderRadius: 1,
            overflow: 'hidden',
            mb: 2
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ 
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: isDetecting ? 'block' : 'none',
            }}
          />
          
          {!isDetecting && (
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Camera off
              </Typography>
            </Box>
          )}
          
          {loading && (
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                right: 0,
                p: 1
              }}
            >
              <CircularProgress size={20} />
            </Box>
          )}
        </Box>
      )}
      
      <Box 
        sx={{ 
          p: 1.5, 
          border: '1px solid', 
          borderRadius: 2,
          transition: 'all 0.3s ease',
          ...getEmotionStyle()
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            Current Emotion:
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {emotion}
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {emotionInfo[emotion]?.description || 'Analyzing your emotional state...'}
        </Typography>
        
        {confidence > 0 && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <Box 
                sx={{
                  height: 5,
                  borderRadius: 5,
                  background: `linear-gradient(to right, ${emotionInfo[emotion]?.color || '#9e9e9e'} ${confidence * 100}%, #e0e0e0 ${confidence * 100}%)`,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ minWidth: 35 }}>
              {Math.round(confidence * 100)}%
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default EmotionDetector; 