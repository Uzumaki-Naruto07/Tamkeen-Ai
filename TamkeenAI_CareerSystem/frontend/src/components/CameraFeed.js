import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';

const CameraFeed = ({ onEmotionDetected, sessionActive = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedEmotions, setDetectedEmotions] = useState([]);
  const [error, setError] = useState(null);
  const clientId = useRef(`client-${Math.random().toString(36).substring(2, 9)}`);
  
  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user' 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError(`Camera access error: ${err.message}`);
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };
  
  // Connect to WebSocket - Original implementation
  /*
  const connectWebSocket = () => {
    const token = localStorage.getItem('authToken'); // Get auth token
    const wsUrl = `ws://${window.location.hostname}:8000/emotion/ws/camera/${clientId.current}`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
      
      // If we're in an active session, start sending frames
      if (sessionActive) {
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
          console.error('WebSocket error:', data.message);
          setError(`Server error: ${data.message}`);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
      setIsConnected(false);
    };
  };
  */
  
  // Connect to WebSocket - Improved implementation with configurable URL
  const connectWebSocket = () => {
    const token = localStorage.getItem('authToken'); // Get auth token
    
    // Use environment variable or derive from window.location
    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsHost = process.env.REACT_APP_WS_HOST || window.location.host;
    const wsPort = process.env.REACT_APP_WS_PORT || '8000';
    const wsPath = process.env.REACT_APP_WS_PATH || 'emotion/ws/camera';
    
    // Construct the WebSocket URL with appropriate protocol and host
    const wsUrl = `${wsProtocol}${wsHost}${wsHost.includes(':') ? '' : `:${wsPort}`}/${wsPath}/${clientId.current}`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
      
      // If we're in an active session, start sending frames
      if (sessionActive) {
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
          console.error('WebSocket error:', data.message);
          setError(`Server error: ${data.message}`);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
      setIsConnected(false);
    };
  };
  
  // Start sending frames
  const startSendingFrames = () => {
    if (!isCameraActive || !isConnected) return;
    
    const sendFrame = () => {
      if (videoRef.current && canvasRef.current && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Get base64 image data
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        
        // Send to server
        wsRef.current.send(JSON.stringify({
          type: 'frame',
          image_data: imageData
        }));
      }
    };
    
    // Send frames at a reasonable rate (e.g., 5 fps)
    const intervalId = setInterval(sendFrame, 200);
    
    return () => clearInterval(intervalId);
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
    };
  }, []);
  
  // Start/stop sending frames when session becomes active/inactive
  useEffect(() => {
    let frameInterval;
    
    if (sessionActive && isCameraActive && isConnected) {
      frameInterval = startSendingFrames();
    }
    
    return () => {
      if (frameInterval) {
        clearInterval(frameInterval);
      }
    };
  }, [sessionActive, isCameraActive, isConnected]);
  
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
  
  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 640 }}>
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}
      
      <Box sx={{ position: 'relative' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', borderRadius: '8px' }}
        />
        {renderEmotionLabels()}
        {!isCameraActive && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <Button variant="contained" color="primary" onClick={startCamera}>
              Enable Camera
            </Button>
          </Box>
        )}
      </Box>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} width={640} height={480} />
      
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button 
          variant="outlined" 
          color={isCameraActive ? "error" : "primary"}
          onClick={isCameraActive ? stopCamera : startCamera}
        >
          {isCameraActive ? "Disable Camera" : "Enable Camera"}
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <Box sx={{ 
            width: 12, 
            height: 12, 
            borderRadius: '50%', 
            backgroundColor: isConnected ? 'green' : 'red',
            mr: 1
          }} />
          <Typography variant="caption">
            {isConnected ? "Connected" : "Disconnected"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default CameraFeed; 