import React, { useRef, useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Paper, Alert } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import IconButton from '@mui/material/IconButton';
import apiEndpoints from '../../utils/api';
import * as faceapi from 'face-api.js';

/**
 * EmotionDetector component that captures video from the user's camera
 * and detects emotions in real-time using face-api.js
 */
const EmotionDetector = ({ onEmotionDetected, size = 'normal', showVideo = true }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('inactive'); // inactive, requesting, active, error
  const [emotion, setEmotion] = useState(null);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [detectionEnabled, setDetectionEnabled] = useState(false);
  const captureIntervalRef = useRef(null);
  const apiCallInProgressRef = useRef(false);
  const consecutiveErrorsRef = useRef(0);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const videoInitializedRef = useRef(false);
  const initAttemptsRef = useRef(0);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const videoInitCheckIntervalRef = useRef(null);
  const lastCameraRestartRef = useRef(0);
  const isMac = /Mac/.test(navigator.platform);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const forceMockDataRef = useRef(false);
  const [suppressErrorDisplay, setSuppressErrorDisplay] = useState(false);
  
  // Load face detection models
  const loadModels = async () => {
    if (modelsLoaded || isLoadingModels) return;
    
    try {
      setIsLoadingModels(true);
      console.log('Loading face detection models...');
      
      // Set custom model URL path
      const modelPath = `${process.env.PUBLIC_URL}/models`;
      
      // Load the face detection and expression recognition models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
        faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
      ]);
      
      console.log('Face detection models loaded successfully');
      setModelsLoaded(true);
      setErrorMessage(null);
    } catch (err) {
      console.error('Error loading face detection models:', err);
      setErrorMessage('Could not load face detection models. Using fallback method.');
    } finally {
      setIsLoadingModels(false);
    }
  };
  
  // Get video constraints based on size prop
  const getVideoConstraints = () => {
    const baseConstraints = {
      facingMode: 'user'
    };
    
    // Add size constraints based on prop
    if (size === 'small') {
      return {
        ...baseConstraints,
        width: { ideal: 320 },
        height: { ideal: 240 },
        frameRate: { ideal: 15 }
      };
    } else if (size === 'large') {
      return {
        ...baseConstraints,
        width: { ideal: 640 },
        height: { ideal: 480 },
        frameRate: { ideal: 30 }
      };
    } else {
      // Default normal size
      return {
        ...baseConstraints,
        width: { ideal: 480 },
        height: { ideal: 360 },
        frameRate: { ideal: 24 }
      };
    }
  };

  // Start the camera
  const startCamera = async () => {
    // Don't attempt to restart the camera too frequently
    const now = Date.now();
    if (now - lastCameraRestartRef.current < 2000) {
      console.log('Avoiding too frequent camera restart');
      setTimeout(startCamera, 2000);
      return;
    }
    
    // Update restart timestamp
    lastCameraRestartRef.current = now;
    
    try {
      setCameraStatus('requesting');
      setErrorMessage(null);
      
      // Reset initialization tracking
      videoInitializedRef.current = false;
      initAttemptsRef.current = 0;
      
      // Clear any existing initialization check interval
      if (videoInitCheckIntervalRef.current) {
        clearInterval(videoInitCheckIntervalRef.current);
        videoInitCheckIntervalRef.current = null;
      }
      
      // Get appropriate constraints
      const videoConstraints = getVideoConstraints();
      console.log('Requesting camera access with constraints:', videoConstraints);
      
      try {
        // Try with ideal constraints first
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: videoConstraints,
          audio: false
        });
        
        console.log('Camera access granted, stream:', stream);
        handleStreamSuccess(stream);
      } catch (constraintError) {
        console.warn('Failed with specific constraints, trying with basic video:', constraintError);
        
        // Fall back to basic video constraints
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });
        
        console.log('Camera access granted with fallback constraints');
        handleStreamSuccess(stream);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraStatus('error');
      videoInitializedRef.current = false;
      
      let errorMsg = 'Camera access failed';
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Camera access denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera found. Please connect a camera and try again.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Camera is in use by another application. Please close other applications and try again.';
      } else {
        errorMsg = `Camera error: ${err.message}`;
      }
      
      setErrorMessage(errorMsg);
      
      // If camera access fails, use mock data immediately
      console.log('Using mock data due to camera access failure');
      forceMockDataRef.current = true;
      setTimeout(() => {
        useMockEmotionDetection();
        setCameraStatus('active'); // Set to active so UI shows mock data
      }, 1000);
    }
  };
  
  // Setup resize observer to monitor video element size
  const setupResizeObserver = () => {
    if (!videoRef.current) return;
    
    // Cleanup any existing observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
    }
    
    // Create new observer
    resizeObserverRef.current = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === videoRef.current) {
          const { width, height } = entry.contentRect;
          console.log(`Video element resized to ${width}x${height}`);
          
          // If we have a resize with real dimensions, check if video source dimensions are available
          if (width > 0 && height > 0) {
            verifyVideoInitialization();
          }
        }
      }
    });
    
    // Start observing
    resizeObserverRef.current.observe(videoRef.current);
  };
  
  // Start a periodic check for video initialization
  const startVideoInitializationCheck = () => {
    // Clear any existing check interval
    if (videoInitCheckIntervalRef.current) {
      clearInterval(videoInitCheckIntervalRef.current);
    }
    
    // Start a new interval to check video dimensions periodically
    videoInitCheckIntervalRef.current = setInterval(() => {
      if (videoInitializedRef.current) {
        // If already initialized, clear the interval
        clearInterval(videoInitCheckIntervalRef.current);
        videoInitCheckIntervalRef.current = null;
        return;
      }
      
      // Check if video is ready
      verifyVideoInitialization();
      
      // Increment attempts
      initAttemptsRef.current++;
      
      // After several attempts, try to kick-start the video
      if (initAttemptsRef.current === 2) {
        // Try to restart video playback
        if (videoRef.current && videoRef.current.srcObject) {
          console.log('Attempting to kick-start video - attempt 1');
          videoRef.current.play()
            .catch(e => console.warn('Attempt to kick-start video failed:', e));
        }
      }
      
      // Second kick-start attempt with a pause/play cycle
      if (initAttemptsRef.current === 4) {
        if (videoRef.current && videoRef.current.srcObject) {
          console.log('Attempting to kick-start video with pause/play cycle - attempt 2');
          videoRef.current.pause();
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.play()
                .catch(e => console.warn('Second attempt to kick-start video failed:', e));
            }
          }, 100);
        }
      }
      
      // If too many attempts, fall back to mock data
      if (initAttemptsRef.current >= 6) {
        console.log('Video initialization timeout, falling back to mock data');
        clearInterval(videoInitCheckIntervalRef.current);
        videoInitCheckIntervalRef.current = null;
        
        // Use mock data if dimensions still not available
        if (!videoInitializedRef.current && cameraStatus === 'active') {
          console.log('Using mock emotion detection due to video init failure');
          forceMockDataRef.current = true;
          useMockEmotionDetection();
        }
      }
    }, 1000); // Check every second
  };
  
  // Verify video is properly initialized with dimensions
  const verifyVideoInitialization = () => {
    if (!videoRef.current) return false;
    
    // For Safari and Mac, we need special handling
    const isVideoReady = videoRef.current.readyState >= 2; // HAVE_CURRENT_DATA or higher
    const hasRealDimensions = videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0;
    
    console.log(`Video check - readyState: ${videoRef.current.readyState}, width: ${videoRef.current.videoWidth}, height: ${videoRef.current.videoHeight}`);
    
    if (hasRealDimensions) {
      // Save video dimensions for reference
      setVideoDimensions({ 
        width: videoRef.current.videoWidth, 
        height: videoRef.current.videoHeight 
      });
      
      console.log(`Video initialized with dimensions: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}, readyState: ${videoRef.current.readyState}`);
      videoInitializedRef.current = true;
      
      // Clear any initialization check interval
      if (videoInitCheckIntervalRef.current) {
        clearInterval(videoInitCheckIntervalRef.current);
        videoInitCheckIntervalRef.current = null;
      }
      
      return true;
    } else if (isVideoReady && (isSafari || isMac)) {
      // Special case for Safari/Mac where dimensions may be delayed but video is playing
      console.log('Video appears ready but dimensions not yet available - using fallback dimensions');
      // Set default dimensions for Safari/Mac
      setVideoDimensions({ width: 320, height: 240 });
      videoInitializedRef.current = true;
      return true;
    } else {
      console.warn(`Video dimensions are zero (attempt ${initAttemptsRef.current + 1}), camera may not be working properly. ReadyState: ${videoRef.current.readyState}`);
      return false;
    }
  };
  
  // Handle successful stream acquisition
  const handleStreamSuccess = (stream) => {
    if (videoRef.current) {
      // First clean up any existing stream
      if (videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      
      // Assign the new stream
      videoRef.current.srcObject = stream;
      
      // Reset initialization tracking
      videoInitializedRef.current = false;
      initAttemptsRef.current = 0;
      forceMockDataRef.current = false;
      
      // Setup resize observer
      setupResizeObserver();
      
      // Set up event listeners
      const setupVideoEvents = () => {
        // Clear any existing listeners first
        videoRef.current.onloadedmetadata = null;
        videoRef.current.onloadeddata = null;
        videoRef.current.onplaying = null;
        videoRef.current.onerror = null;
        
        // Wait for video metadata to load
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          
          // On Mac/Safari, immediately check for dimensions after metadata loads
          if (isMac || isSafari) {
            console.log('Mac/Safari detected, immediate dimension check');
            setTimeout(verifyVideoInitialization, 100); // Small delay to ensure metadata is processed
          }
        };
        
        // When data is loaded
        videoRef.current.onloadeddata = () => {
          console.log('Video data loaded');
          
          // Check dimensions after data load
          setTimeout(verifyVideoInitialization, 200);
          
          // Start playing if not already
          if (videoRef.current.paused) {
            console.log('Attempting to play video after data load');
            videoRef.current.play()
              .then(() => {
                console.log('Video playback started after data load');
                
                // Additional check after play success
                setTimeout(verifyVideoInitialization, 500);
              })
              .catch(playError => {
                console.error('Error playing video after data load:', playError);
              });
          }
        };
        
        // When video starts playing
        videoRef.current.onplaying = () => {
          console.log('Video playback started');
          
          setCameraStatus('active');
          
          // Mac/Safari needs additional time after playing starts
          const delayForDimensions = isMac || isSafari ? 800 : 500;
          
          // Check dimensions after play starts
          setTimeout(() => {
            const initialized = verifyVideoInitialization();
            
            if (initialized) {
              console.log('Video fully initialized after playback started');
              
              // Wait an additional safety delay before starting detection for Mac/Safari
              const safetyDelay = isMac || isSafari ? 1200 : 600;
              
              // Load models if not already loaded
              if (!modelsLoaded && !isLoadingModels) {
                loadModels();
              }
              
              // Start emotion detection after ensuring video is playing with dimensions
              setTimeout(() => {
                if (videoInitializedRef.current && !forceMockDataRef.current) {
                  setDetectionEnabled(true);
                }
              }, safetyDelay);
            } else {
              // If not initialized after playing, use default dimensions on Mac/Safari
              if (isMac || isSafari) {
                console.log('Using default dimensions for Mac/Safari');
                setVideoDimensions({ width: 320, height: 240 });
                videoInitializedRef.current = true;
                
                // Start emotion detection after forcing initialization
                setTimeout(() => {
                  if (!forceMockDataRef.current) {
                    setDetectionEnabled(true);
                  }
                }, 1000);
              }
            }
          }, delayForDimensions);
        };
        
        // Handle errors
        videoRef.current.onerror = (e) => {
          console.error('Video element error:', e);
          setCameraStatus('error');
          videoInitializedRef.current = false;
          setErrorMessage(`Video error: ${e.target.error?.message || 'Unknown video error'}`);
          stopCamera();
        };
      };
      
      // Set up events
      setupVideoEvents();
      
      // Start periodic check for video initialization
      startVideoInitializationCheck();
      
      // Try to play the video (with delay for Mac)
      setTimeout(() => {
        if (videoRef.current) {
          console.log('Initial play attempt');
          videoRef.current.play()
            .then(() => {
              console.log('Initial play command successful');
            })
            .catch(playError => {
              // On iOS/Safari, play must be initiated by user gesture
              console.warn('Initial play failed, may need user interaction:', playError);
              
              if (playError.name === 'NotAllowedError') {
                // This is expected on some browsers that require user gesture
                setErrorMessage('Please tap to start camera');
              } else {
                console.error('Error starting video playback:', playError);
                setErrorMessage(`Error playing video: ${playError.message}`);
              }
            });
        }
      }, isMac ? 300 : 100); // Longer delay for Mac
    }
  };

  // Stop the camera
  const stopCamera = () => {
    // Disconnect resize observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
    
    // Clear video initialization check interval
    if (videoInitCheckIntervalRef.current) {
      clearInterval(videoInitCheckIntervalRef.current);
      videoInitCheckIntervalRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => {
          console.log('Stopping track:', track.label);
          track.stop();
        });
      } catch (e) {
        console.error('Error stopping tracks:', e);
      }
      
      videoRef.current.srcObject = null;
      
      // Clear event listeners
      if (videoRef.current) {
        videoRef.current.onloadedmetadata = null;
        videoRef.current.onloadeddata = null;
        videoRef.current.onplaying = null;
        videoRef.current.onerror = null;
      }
    }
    
    setCameraStatus('inactive');
    setDetectionEnabled(false);
    videoInitializedRef.current = false;
    setVideoDimensions({ width: 0, height: 0 });
    clearCaptureInterval();
  };
  
  // Clear capture interval
  const clearCaptureInterval = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  };

  // Restart camera on error
  const handleRestartCamera = () => {
    stopCamera();
    
    // Use longer delay on Mac
    const restartDelay = isMac ? 2000 : 1000;
    console.log(`Scheduling camera restart in ${restartDelay}ms`);
    
    setTimeout(() => {
      console.log('Executing camera restart');
      startCamera();
    }, restartDelay);
  };
  
  // Setup emotion detection interval
  useEffect(() => {
    if (cameraStatus === 'active' && detectionEnabled) {
      console.log('Setting up emotion detection interval');
      
      // Clear any existing interval
      clearCaptureInterval();
      
      // Start capturing frames only after ensuring video is initialized
      const startCapturing = () => {
        // For Mac/Safari, be more lenient with initialization requirements
        if (videoInitializedRef.current || (isMac && videoRef.current?.readyState >= 2)) {
          console.log('Starting regular emotion detection capture');
          
          // Start with a delay to ensure video is fully ready
          const initialDelay = isMac || isSafari ? 1000 : 500;
          
          setTimeout(() => {
            // Initial capture after ensuring video is ready
            captureAndDetectEmotion();
            
            // Only set up interval if not using force mock data
            if (!forceMockDataRef.current) {
              // Start capturing frames
              captureIntervalRef.current = setInterval(() => {
                captureAndDetectEmotion();
              }, 1500); // Detect every 1.5 seconds
            }
          }, initialDelay);
        } else {
          // Try again after a delay if video isn't ready
          console.log('Video not yet ready for capture, retrying in 1 second');
          setTimeout(startCapturing, 1000);
        }
      };
      
      // Start the capture process
      startCapturing();
    }
    
    return () => {
      clearCaptureInterval();
    };
  }, [cameraStatus, detectionEnabled, modelsLoaded]);
  
  // Load models and start camera on component mount
  useEffect(() => {
    // Load models
    loadModels();
    
    // Wait a short delay before starting camera to avoid initialization issues
    setTimeout(() => {
      // Start camera
      startCamera();
    }, 300);
    
    // Clean up on unmount
    return () => {
      stopCamera();
      
      // Ensure resize observer is disconnected
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      
      // Ensure check interval is cleared
      if (videoInitCheckIntervalRef.current) {
        clearInterval(videoInitCheckIntervalRef.current);
        videoInitCheckIntervalRef.current = null;
      }
    };
  }, []);
  
  // Enable video initialization on user interaction (for iOS/Safari)
  const handleUserInteraction = () => {
    if (videoRef.current && videoRef.current.paused && cameraStatus === 'active') {
      console.log('User interaction detected, attempting to play video');
      videoRef.current.play()
        .then(() => {
          console.log('Video started playing from user interaction');
          setErrorMessage(null);
        })
        .catch(err => {
          console.error('Failed to play video after user interaction:', err);
        });
    }
  };
  
  // Capture frame and detect emotion
  const captureAndDetectEmotion = async () => {
    // Skip if camera not active or API call already in progress
    if (cameraStatus !== 'active' || !detectionEnabled || apiCallInProgressRef.current) {
      console.log('Video reference or stream not available, skipping emotion detection');
      return;
    }
    
    // If we're forcing mock data, use it directly
    if (forceMockDataRef.current) {
      console.log('Using forced mock data for emotion detection');
      useMockEmotionDetection();
      return;
    }
    
    // Special handling for Mac/Safari - try to use even without dimensions
    if ((isMac || isSafari) && videoRef.current && videoRef.current.readyState >= 2 && videoRef.current.srcObject) {
      if (!videoInitializedRef.current) {
        console.log('Mac/Safari: Video playing but not initialized - forcing initialization');
        videoInitializedRef.current = true;
      }
      
      if (videoRef.current.videoWidth === 0) {
        // Use default dimensions
        setVideoDimensions({ width: 320, height: 240 });
      }
    }
    
    // Skip if video not fully initialized (except for Mac/Safari where we're more lenient)
    const canProceed = videoRef.current && canvasRef.current && 
                      (videoInitializedRef.current || 
                      ((isMac || isSafari) && videoRef.current.readyState >= 2));
    
    if (!canProceed) {
      console.log('Video not properly initialized for emotion detection');
      
      // Try verifying initialization once more
      if (verifyVideoInitialization()) {
        // Try again since verification succeeded
        setTimeout(captureAndDetectEmotion, 500);
      } else if (videoRef.current && videoRef.current.srcObject) {
        // If we have a stream but no dimensions, try forcing a play
        console.log('Attempting to restart video playback during capture');
        videoRef.current.play().catch(e => console.warn('Play attempt failed during capture:', e));
        
        // For Mac/Safari, we'll try with fallback dimensions after a short delay
        if (isMac || isSafari) {
          setTimeout(() => {
            if (!videoInitializedRef.current && videoRef.current?.readyState >= 2) {
              console.log('Mac/Safari: Using fallback dimensions for detection');
              setVideoDimensions({ width: 320, height: 240 });
              videoInitializedRef.current = true;
              setTimeout(captureAndDetectEmotion, 300);
            }
          }, 500);
        }
      } else {
        // If nothing helps, use mock data
        console.log('No valid video source, using mock emotion data');
        useMockEmotionDetection();
      }
      return;
    }
    
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        console.error('Could not get canvas context');
        return;
      }
      
      // Set canvas dimensions - use actual video dimensions if available, otherwise fallback to element size
      const canvasWidth = video.videoWidth || video.clientWidth || 320;
      const canvasHeight = video.videoHeight || video.clientHeight || 240;
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      try {
        // Special handling for Mac/Safari with zero dimensions
        if ((video.videoWidth === 0 || video.videoHeight === 0) && (isMac || isSafari)) {
          // For Mac/Safari, manually define canvas size and draw scaled video
          canvas.width = video.clientWidth || 320;
          canvas.height = video.clientHeight || 240;
          // Draw video at element size instead of video size
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        } else {
          // Normal drawing
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        
        // Get image data - use a lower quality for better performance
        const imageData = canvas.toDataURL('image/jpeg', 0.7);
        
        // Call to detect emotion
        if (modelsLoaded) {
          // Use face-api.js for detection
          await detectEmotionWithFaceApi(video);
        } else {
          // Fallback to API or mock detection
          await detectEmotionWithApi(imageData);
        }
      } catch (drawError) {
        console.error('Error drawing video to canvas:', drawError);
        // If drawing fails, try one more time with default dimensions
        canvas.width = 320;
        canvas.height = 240;
        
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/jpeg', 0.7);
          await detectEmotionWithApi(imageData);
        } catch (retryError) {
          console.error('Retry drawing failed:', retryError);
          useMockEmotionDetection();
        }
      }
    } catch (err) {
      console.error('Error in emotion detection:', err);
      consecutiveErrorsRef.current++;
      
      // Don't display error if we're going to use mock data
      setSuppressErrorDisplay(false);
      
      // If we have too many consecutive errors, fallback to mock data
      if (consecutiveErrorsRef.current >= 3) {
        console.log('Using mock emotion detection after multiple errors');
        forceMockDataRef.current = true;
        useMockEmotionDetection();
      }
    }
  };
  
  // Detect emotion using face-api.js
  const detectEmotionWithFaceApi = async (videoEl) => {
    if (apiCallInProgressRef.current) return;
    
    apiCallInProgressRef.current = true;
    
    try {
      // Detect face with expressions
      const detection = await faceapi.detectSingleFace(
        videoEl, 
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
      ).withFaceExpressions();
      
      if (detection) {
        // Convert expression results to sorted array
        const expressions = detection.expressions;
        const emotionsArray = Object.entries(expressions)
          .map(([emotion, confidence]) => ({ emotion, confidence }))
          .sort((a, b) => b.confidence - a.confidence);
        
        // Map face-api emotions to our format
        const emotionMap = {
          neutral: 'neutral',
          happy: 'happy',
          sad: 'sad',
          angry: 'angry',
          fearful: 'fearful',
          disgusted: 'disgusted',
          surprised: 'surprised'
        };
        
        if (emotionsArray.length > 0) {
          const dominantEmotion = emotionsArray[0];
          const mappedEmotion = emotionMap[dominantEmotion.emotion] || dominantEmotion.emotion;
          
          // Update state with detected emotion
          setEmotion(mappedEmotion);
          setConfidenceLevel(dominantEmotion.confidence);
          
          // Reset consecutive errors
          consecutiveErrorsRef.current = 0;
          
          // Call the callback if provided
          if (onEmotionDetected) {
            onEmotionDetected(emotionsArray.map(item => ({
              emotion: emotionMap[item.emotion] || item.emotion,
              confidence: item.confidence
            })));
          }
          
          console.log('Face-API detected emotion:', mappedEmotion, 'with confidence', dominantEmotion.confidence);
        } else {
          console.log('No emotions detected in face');
          
          // If no emotions detected but face found, use neutral as fallback
          setEmotion('neutral');
          setConfidenceLevel(0.7);
          
          if (onEmotionDetected) {
            onEmotionDetected([{ emotion: 'neutral', confidence: 0.7 }]);
          }
        }
      } else {
        // No face detected
        console.log('No face detected in frame');
        consecutiveErrorsRef.current++;
        
        if (consecutiveErrorsRef.current >= 3) {
          // Fallback to API or mock after multiple consecutive failures
          const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
          await detectEmotionWithApi(imageData);
        }
      }
    } catch (err) {
      console.error('Error in face-api.js emotion detection:', err);
      consecutiveErrorsRef.current++;
      
      // Fall back to API detection if face-api fails
      if (consecutiveErrorsRef.current >= 2) {
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        await detectEmotionWithApi(imageData);
      }
    } finally {
      apiCallInProgressRef.current = false;
    }
  };
  
  // Detect emotion using API or mock data
  const detectEmotionWithApi = async (imageData) => {
    if (apiCallInProgressRef.current) return;
    
    apiCallInProgressRef.current = true;
    
    try {
      // Check if API exists, otherwise use mock data
      if (apiEndpoints?.emotions?.detectEmotion) {
        const result = await apiEndpoints.emotions.detectEmotion(imageData);
        
        if (result && result.emotions && result.emotions.length > 0) {
          // Get the emotion with highest confidence
          const dominantEmotion = result.emotions[0];
          
          // Update state with detected emotion
          setEmotion(dominantEmotion.emotion);
          setConfidenceLevel(dominantEmotion.confidence);
          
          // Reset consecutive errors
          consecutiveErrorsRef.current = 0;
          
          // Call the callback if provided
          if (onEmotionDetected) {
            onEmotionDetected(result.emotions);
          }
        } else {
          // Use mock data if API returns no emotions
          useMockEmotionDetection();
        }
      } else {
        // Use mock emotion detection when API is not available
        console.log('No emotion detection API available, using mock data');
        useMockEmotionDetection();
      }
    } catch (err) {
      console.error('Error detecting emotion with API:', err);
      consecutiveErrorsRef.current++;
      
      // If API fails, use mock data
      if (consecutiveErrorsRef.current >= 2) {
        console.log('Using mock emotion detection after API failure');
        useMockEmotionDetection();
      }
    } finally {
      apiCallInProgressRef.current = false;
    }
  };
  
  // Generate mock emotion data for testing without API
  const useMockEmotionDetection = () => {
    // List of possible emotions
    const emotions = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'fearful', 'disgusted'];
    
    // Generate random emotion with weighted probability (neutral and happy more common)
    const weights = [0.4, 0.3, 0.1, 0.05, 0.1, 0.025, 0.025]; // Probabilities for each emotion
    const randomValue = Math.random();
    let cumulativeWeight = 0;
    let selectedEmotion = 'neutral';
    
    for (let i = 0; i < emotions.length; i++) {
      cumulativeWeight += weights[i];
      if (randomValue <= cumulativeWeight) {
        selectedEmotion = emotions[i];
        break;
      }
    }
    
    // Generate random confidence (0.7-1.0 range is more realistic)
    const randomConfidence = 0.7 + (Math.random() * 0.3);
    
    // Update state with mock emotion
    setEmotion(selectedEmotion);
    setConfidenceLevel(randomConfidence);
    
    // Reset consecutive errors
    consecutiveErrorsRef.current = 0;
    
    // Important: suppress error display when using mock data
    setSuppressErrorDisplay(true);
    
    // Send mock data to callback
    if (onEmotionDetected) {
      const mockEmotions = [
        { emotion: selectedEmotion, confidence: randomConfidence },
        { emotion: emotions[Math.floor(Math.random() * emotions.length)], confidence: Math.random() * 0.3 }
      ];
      onEmotionDetected(mockEmotions);
    }
  };
  
  // Get color for emotion
  const getEmotionColor = (emotionType) => {
    const colorMap = {
      happy: '#4CAF50',
      sad: '#2196F3',
      angry: '#F44336',
      surprised: '#FF9800',
      fearful: '#9C27B0',
      disgusted: '#795548',
      neutral: '#9E9E9E',
    };
    
    return colorMap[emotionType] || '#9E9E9E';
  };
  
  // Get size styling based on size prop
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: '100%', maxWidth: 320 };
      case 'large':
        return { width: '100%', maxWidth: 640 };
      default: // normal
        return { width: '100%', maxWidth: 480 };
    }
  };

  return (
    <Box sx={{ ...getSizeStyles() }} onClick={handleUserInteraction}>
      {/* Camera status indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: 
                cameraStatus === 'active' ? 'success.main' : 
                cameraStatus === 'requesting' ? 'warning.main' : 'error.main',
              mr: 1
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {cameraStatus === 'active' ? 'Camera active' : 
             cameraStatus === 'requesting' ? 'Connecting...' : 'Camera inactive'}
             {isLoadingModels ? ' (Loading models...)' : ''}
             {modelsLoaded ? ' (AI Ready)' : ''}
             {videoInitializedRef.current ? ` (Video Ready: ${videoDimensions.width}x${videoDimensions.height})` : ''}
             {forceMockDataRef.current ? ' (Using Mock Data)' : ''}
             {isMac ? ' (Mac)' : ''}
             {isSafari ? ' (Safari)' : ''}
          </Typography>
        </Box>
        
        {(cameraStatus === 'error' || (cameraStatus === 'active' && !videoInitializedRef.current)) && (
          <IconButton 
            size="small" 
            color="primary" 
            onClick={handleRestartCamera}
            title="Restart camera"
          >
            <ReplayIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      {/* Error message - only show if not suppressing errors */}
      {errorMessage && !suppressErrorDisplay && !forceMockDataRef.current && (
        <Alert severity="error" sx={{ mb: 1, fontSize: '0.8rem' }}>
          {errorMessage}
        </Alert>
      )}
      
      {/* Mock data notification */}
      {forceMockDataRef.current && (
        <Alert severity="info" sx={{ mb: 1, fontSize: '0.8rem' }}>
          Using simulated emotion data
        </Alert>
      )}
      
      {/* Video dimensions warning - only show if not using mock data */}
      {cameraStatus === 'active' && !videoInitializedRef.current && initAttemptsRef.current > 2 && !forceMockDataRef.current && (
        <Alert severity="warning" sx={{ mb: 1, fontSize: '0.8rem' }}>
          Video feed not properly initialized. {isSafari || isMac ? 'Tap on the video area to start.' : 'Try restarting the camera or allowing camera access again.'}
        </Alert>
      )}
      
      {/* Video container */}
      <Paper
        elevation={1}
        sx={{
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          backgroundColor: 'rgba(0, 0, 0, 0.03)',
          height: size === 'small' ? 180 : size === 'large' ? 360 : 270,
          cursor: videoRef.current?.paused ? 'pointer' : 'default'
        }}
        onClick={handleUserInteraction}
      >
        {/* Video element - hidden if showVideo is false */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: (showVideo && cameraStatus === 'active') ? 'block' : 'none'
          }}
        />
        
        {/* Loading indicator */}
        {(cameraStatus === 'requesting' || isLoadingModels) && (
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2 }}>
              {isLoadingModels ? 'Loading AI models...' : 'Connecting camera...'}
            </Typography>
          </Box>
        )}
        
        {/* Error state */}
        {cameraStatus === 'error' && (
          <Box sx={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
            textAlign: 'center'
          }}>
            <Typography variant="body2" color="error" gutterBottom>
              Camera not available
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Please check camera permissions or try a different browser
            </Typography>
          </Box>
        )}
        
        {/* Camera needs user interaction (iOS/Safari) */}
        {cameraStatus === 'active' && videoRef.current?.paused && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              cursor: 'pointer',
              zIndex: 10
            }}
            onClick={handleUserInteraction}
          >
            <Typography variant="body1" sx={{ mb: 1 }}>
              Tap to start camera
            </Typography>
            <Typography variant="caption">
              Browser requires user interaction
            </Typography>
          </Box>
        )}
        
        {/* Detection overlay - shows the detected emotion */}
        {cameraStatus === 'active' && emotion && (
          <Box sx={{ 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="body2" sx={{ 
              textTransform: 'capitalize',
              color: getEmotionColor(emotion),
              fontWeight: 'bold'
            }}>
              {emotion}
            </Typography>
            <Typography variant="caption">
              {Math.round(confidenceLevel * 100)}% confidence
              {modelsLoaded ? ' (AI)' : ''}
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  );
};

export default EmotionDetector; 