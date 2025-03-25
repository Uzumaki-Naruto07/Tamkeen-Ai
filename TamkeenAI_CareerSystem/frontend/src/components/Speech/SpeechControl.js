import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, 
  Select, MenuItem, FormControl, InputLabel,
  IconButton, CircularProgress, Alert
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

const SpeechControl = () => {
  const [text, setText] = useState('');
  const [recognizedText, setRecognizedText] = useState('');
  const [language, setLanguage] = useState('en');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  const wsRef = useRef(null);
  const audioRef = useRef(new Audio());
  const mediaRecorderRef = useRef(null);
  const clientId = useRef(`speech-${Math.random().toString(36).substring(2, 9)}`);
  
  // Connect to WebSocket on component mount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  
  // Audio playback handler
  useEffect(() => {
    const handleAudioEnd = () => {
      setIsPlaying(false);
    };
    
    audioRef.current.addEventListener('ended', handleAudioEnd);
    
    return () => {
      audioRef.current.removeEventListener('ended', handleAudioEnd);
      audioRef.current.pause();
    };
  }, []);
  
  // Connect to WebSocket
  const connectWebSocket = () => {
    wsRef.current = new WebSocket(`ws://${window.location.hostname}:8000/speech/ws/microphone/${clientId.current}`);
    
    wsRef.current.onopen = () => {
      console.log('Speech WebSocket connected');
      setError(null);
    };
    
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'recognition_result') {
          setIsProcessing(false);
          if (data.error) {
            setError(data.error);
          } else {
            setRecognizedText(data.text);
            setError(null);
          }
        } 
        else if (data.type === 'audio_data') {
          // Play received audio
          const audioUrl = `data:audio/mp3;base64,${data.data}`;
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          setIsPlaying(true);
          setIsProcessing(false);
        }
        else if (data.type === 'error') {
          setError(data.message);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
        setError('Error processing server response');
        setIsProcessing(false);
      }
    };
    
    wsRef.current.onclose = () => {
      console.log('Speech WebSocket disconnected');
    };
    
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
      setIsProcessing(false);
    };
  };
  
  // Start recording from microphone
  const startRecording = async () => {
    try {
      setError(null);
      setIsRecording(true);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up data handling
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          // Convert audio chunk to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result.split(',')[1];
            wsRef.current.send(JSON.stringify({
              type: 'audio_data',
              data: base64data
            }));
          };
          reader.readAsDataURL(event.data);
        }
      };
      
      // Start recording
      mediaRecorder.start(100);  // Collect data in 100ms chunks
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(`Microphone access error: ${err.message}`);
      setIsRecording(false);
    }
  };
  
  // Stop recording and process speech
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Send finish recording message
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'finish_recording',
          language: language
        }));
      }
    }
  };
  
  // Read text aloud
  const readAloud = () => {
    if (!text.trim()) {
      setError('Please enter some text to read aloud');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'read_aloud',
        text: text,
        language: language
      }));
    } else {
      setError('WebSocket connection not available');
      setIsProcessing(false);
    }
  };
  
  // Handle file upload for speech recognition
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };
  
  // Process uploaded audio file
  const processAudioFile = async () => {
    if (!uploadedFile) {
      setError('Please upload an audio file first');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('audio_file', uploadedFile);
    formData.append('language', language);
    
    try {
      const response = await fetch('/speech/speech-to-text', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setRecognizedText(data.text);
      }
    } catch (err) {
      console.error('Error processing audio file:', err);
      setError(`Error processing audio file: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Speech Recognition & Text-to-Speech
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Text-to-Speech
        </Typography>
        
        <Box sx={{ display: 'flex', mb: 2 }}>
          <FormControl sx={{ width: 120, mr: 2 }}>
            <InputLabel id="tts-language-label">Language</InputLabel>
            <Select
              labelId="tts-language-label"
              value={language}
              label="Language"
              onChange={(e) => setLanguage(e.target.value)}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ar">Arabic</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Text to read"
            multiline
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<VolumeUpIcon />}
            onClick={readAloud}
            disabled={isProcessing || isPlaying || !text.trim()}
          >
            {isPlaying ? 'Playing...' : 'Read Aloud'}
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Speech Recognition - Microphone
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControl sx={{ width: 120, mr: 2 }}>
            <InputLabel id="mic-language-label">Language</InputLabel>
            <Select
              labelId="mic-language-label"
              value={language}
              label="Language"
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isRecording}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ar">Arabic</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color={isRecording ? "error" : "primary"}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              sx={{ width: 60, height: 60 }}
            >
              {isRecording ? <StopIcon /> : <MicIcon />}
            </IconButton>
            
            <Typography variant="body2" sx={{ ml: 1 }}>
              {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
            </Typography>
            
            {isProcessing && (
              <CircularProgress size={24} sx={{ ml: 2 }} />
            )}
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Speech Recognition - File Upload
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControl sx={{ width: 120, mr: 2 }}>
            <InputLabel id="file-language-label">Language</InputLabel>
            <Select
              labelId="file-language-label"
              value={language}
              label="Language"
              onChange={(e) => setLanguage(e.target.value)}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ar">Arabic</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            component="label"
            sx={{ mr: 2 }}
          >
            Upload Audio
            <input
              type="file"
              hidden
              accept="audio/*"
              onChange={handleFileUpload}
            />
          </Button>
          
          {uploadedFile && (
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {uploadedFile.name}
            </Typography>
          )}
          
          <Button
            variant="contained"
            onClick={processAudioFile}
            disabled={!uploadedFile || isProcessing}
          >
            Process
          </Button>
          
          {isProcessing && (
            <CircularProgress size={24} sx={{ ml: 2 }} />
          )}
        </Box>
      </Box>
      
      {recognizedText && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recognized Text
          </Typography>
          
          <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography>{recognizedText}</Typography>
          </Paper>
          
          <Button
            variant="text"
            color="primary"
            onClick={() => setText(recognizedText)}
            sx={{ mt: 1 }}
          >
            Use this text
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default SpeechControl; 