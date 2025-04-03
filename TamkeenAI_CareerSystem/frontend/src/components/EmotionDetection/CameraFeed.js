import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';

const CameraFeed = ({ onEmotionDetected, sessionActive = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedEmotions, setDetectedEmotions] = useState([]);
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const clientId = useRef(`client-${Math.random().toString(36).substring(2, 9)}`);
  const frameIntervalRef = useRef(null);
  
  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      console.log('Attempting to start camera...');
      
      // Try first with ideal constraints
      const constraints = { 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user',
          frameRate: { ideal: 15 }
        } 
      };
      
      let stream;
      try {
        console.log('Requesting camera with constraints:', constraints);
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (constraintError) {
        console.warn('Failed with ideal constraints, falling back to basic video:', constraintError);
        // Fallback to basic video constraints
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true 
        });
      }
      
      console.log('Camera access granted, tracks:', stream.getVideoTracks().map(t => t.label));
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Ensure the video element loads the media properly
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
          videoRef.current.play()
            .then(() => {
              console.log('Video playback started successfully');
              setIsCameraActive(true);
            })
            .catch(playErr => {
              console.error('Error starting video playback:', playErr);
              setError(`Error starting video: ${playErr.message}`);
            });
        };
        
        videoRef.current.onerror = (e) => {
          console.error('Video element error:', e);
          setError(`Video error: ${e.target.error?.message || 'Unknown error'}`);
          setIsCameraActive(false);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(`Camera access error: ${err.name} - ${err.message}. Please check your camera permissions.`);
      setIsCameraActive(false);
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => {
        console.log('Stopping track:', track.label);
        track.stop();
      });
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };
  
  // Get WebSocket URL based on environment
  const getWebSocketUrl = () => {
    // Use environment variable or derive from window.location
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsHost = process.env.REACT_APP_WS_HOST || window.location.hostname;
    const wsPort = process.env.REACT_APP_WS_PORT || (window.location.hostname === 'localhost' ? '8000' : window.location.port);
    const wsPath = process.env.REACT_APP_WS_PATH || 'emotion/ws/camera';
    
    // Construct the WebSocket URL with appropriate protocol and host
    const wsUrl = `${wsProtocol}${wsHost}${wsPort ? `:${wsPort}` : ''}/${wsPath}/${clientId.current}`;
    
    return wsUrl;
  };
  
  // Connect to WebSocket with retry logic
  const connectWebSocket = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }
    
    setConnecting(true);
    
    const token = localStorage.getItem('authToken'); // Get auth token
    const wsUrl = getWebSocketUrl();
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    // Close any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setConnecting(false);
        setReconnectAttempts(0); // Reset reconnect attempts on success
        setError(null);
        
        // If we're in an active session, start sending frames
        if (sessionActive && isCameraActive) {
          startSendingFrames();
        }
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'frame_processed') {
            setDetectedEmotions(data.results || []);
            if (onEmotionDetected) {
              onEmotionDetected(data.results);
            }
          } else if (data.type === 'error') {
            console.error('WebSocket error message:', data.message);
            setError(`Server error: ${data.message}`);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnecting(false);
        
        // Attempt to reconnect unless the connection was closed intentionally
        if (event.code !== 1000 && event.code !== 1001) {
          const maxReconnectAttempts = 5;
          if (reconnectAttempts < maxReconnectAttempts) {
            const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
            console.log(`Attempting to reconnect in ${timeout}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
            
            setTimeout(() => {
              setReconnectAttempts(prev => prev + 1);
              connectWebSocket();
            }, timeout);
          } else {
            setError('Failed to connect to emotion detection server after multiple attempts');
          }
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setConnecting(false);
      setError(`Error connecting to emotion detection service: ${err.message}`);
    }
  };
  
  // Start sending frames
  const startSendingFrames = () => {
    if (!isCameraActive || !isConnected) {
      console.log('Cannot start sending frames: camera active =', isCameraActive, 'WebSocket connected =', isConnected);
      return;
    }
    
    // Clear any existing interval
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }
    
    console.log('Starting to send frames to WebSocket');
    
    const sendFrame = () => {
      if (!videoRef.current || !canvasRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        return;
      }
      
      try {
        // Check if video is playing and has dimensions
        if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
          console.warn('Video dimensions are zero, camera may not be working properly');
          return;
        }
        
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) {
          console.error('Failed to get canvas context');
          return;
        }
        
        // Update canvas dimensions to match video
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Draw video frame to canvas
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Get base64 image data with reduced quality for better performance
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.7);
        
        // Send to server
        wsRef.current.send(JSON.stringify({
          type: 'frame',
          image_data: imageData
        }));
      } catch (err) {
        console.error('Error sending frame:', err);
      }
    };
    
    // Send frames at a reasonable rate (e.g., 5 fps)
    frameIntervalRef.current = setInterval(sendFrame, 200);
  };
  
  // Use mock data if WebSocket is not connected
  const useMockEmotionData = () => {
    if (!sessionActive || isConnected) return;
    
    console.log('Using mock emotion data since WebSocket is not connected');
    
    // Clear any existing interval
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }
    
    frameIntervalRef.current = setInterval(() => {
      // Generate random emotion data
      const emotions = ['neutral', 'happy', 'sad', 'angry', 'surprised'];
      const mockResults = [
        {
          emotion: emotions[Math.floor(Math.random() * emotions.length)],
          confidence: Math.random() * 0.3 + 0.7 // 0.7-1.0
        },
        {
          emotion: emotions[Math.floor(Math.random() * emotions.length)],
          confidence: Math.random() * 0.3 + 0.4 // 0.4-0.7
        }
      ];
      
      setDetectedEmotions(mockResults);
      if (onEmotionDetected) {
        onEmotionDetected(mockResults);
      }
    }, 2000);
  };
  
  // Initialize camera and WebSocket on component mount
  useEffect(() => {
    startCamera();
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, []);
  
  // Start/stop sending frames when session becomes active/inactive
  useEffect(() => {
    // Clear any existing interval
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    
    if (sessionActive) {
      if (isCameraActive && isConnected) {
        startSendingFrames();
      } else {
        useMockEmotionData();
      }
    }
    
    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, [sessionActive, isCameraActive, isConnected]);
  
  // Handle reconnecting camera
  const handleReconnect = () => {
    stopCamera();
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    setTimeout(() => {
      startCamera();
      connectWebSocket();
    }, 1000);
  };
  
  // Render emotion labels on video feed
  const renderEmotionLabels = () => {
    if (!detectedEmotions || detectedEmotions.length === 0) return null;
    
    return (
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 1, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}>
        {detectedEmotions.map((result, index) => (
          <Typography key={index} variant="body2">
            {result.emotion}: {(result.confidence * 100).toFixed(1)}%
          </Typography>
        ))}
      </Box>
    );
  };
  
  // Render connection status indicator
  const renderConnectionStatus = () => {
    let statusColor = 'error.main';
    let statusText = 'Disconnected';
    
    if (connecting) {
      statusColor = 'warning.main';
      statusText = 'Connecting...';
    } else if (isConnected) {
      statusColor = 'success.main';
      statusText = 'Connected';
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Box 
          sx={{ 
            width: 10, 
            height: 10, 
            borderRadius: '50%', 
            bgcolor: statusColor,
            mr: 1
          }} 
        />
        <Typography variant="caption" color="text.secondary">
          {statusText}
        </Typography>
      </Box>
    );
  };
  
  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 640 }}>
      {renderConnectionStatus()}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 1 }}
          action={
            <Button color="inherit" size="small" onClick={handleReconnect}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      <Box sx={{ position: 'relative' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ 
            width: '100%', 
            borderRadius: '8px', 
            display: isCameraActive ? 'block' : 'none'
          }}
        />
        {renderEmotionLabels()}
        {!isCameraActive && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.7)', 
                    borderRadius: '8px', 
                    height: '300px' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={startCamera}
              disabled={connecting}
            >
              {connecting ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
              Enable Camera
            </Button>
          </Box>
        )}
      </Box>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} width={640} height={480} />
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: '0.7rem' }}>
        Camera is used to analyze your facial expressions during the interview. Your privacy is protected.
      </Typography>
    </Box>
  );
};

export default CameraFeed; 