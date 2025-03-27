import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, 
  Select, MenuItem, FormControl, InputLabel,
  IconButton, CircularProgress, Alert, Tooltip, Divider
} from '@mui/material';
import { 
  Mic, MicOff, Stop, PlayArrow, Refresh,
  VolumeUp, VolumeOff, SentimentVerySatisfied
} from '@mui/icons-material';
import apiEndpoints from '../../utils/api';

const SpeechControl = ({ 
  onRecordingComplete, 
  onTranscriptionComplete,
  onEmotionDetected,
  maxDuration = 60, // in seconds
  autoTranscribe = true,
  analyzeEmotion = true,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [emotions, setEmotions] = useState(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isAnalyzingEmotion, setIsAnalyzingEmotion] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio());
  
  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      audioRef.current.pause();
    };
  }, []);
  
  // Set up audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    
    audio.addEventListener('error', (e) => {
      setError('Audio playback error: ' + e.message);
      setIsPlaying(false);
    });
    
    return () => {
      audio.removeEventListener('ended', () => {});
      audio.removeEventListener('error', () => {});
    };
  }, []);
  
  // Update audio source when audioUrl changes
  useEffect(() => {
    if (audioUrl) {
      audioRef.current.src = audioUrl;
    }
  }, [audioUrl]);
  
  // Start recording
  const startRecording = async () => {
    try {
      setError(null);
      audioChunksRef.current = [];
      setElapsedTime(0);
      setAudioBlob(null);
      setAudioUrl(null);
      setTranscription('');
      setEmotions(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.addEventListener('dataavailable', event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });
      
      mediaRecorderRef.current.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        // Stop all tracks on the stream
        stream.getTracks().forEach(track => track.stop());
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
        
        if (autoTranscribe) {
          transcribeAudio(audioBlob);
        }
      });
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Start timer to track recording duration
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      setError('Error accessing microphone: ' + error.message);
      console.error('Error starting recording:', error);
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Toggle pause recording
  const togglePause = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };
  
  // Transcribe audio
  const transcribeAudio = async (blob) => {
    if (!blob) return;
    
    setIsTranscribing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.wav');
      
      // This connects to the backend speech-to-text API
      const response = await apiEndpoints.speech.transcribe(formData);
      
      setTranscription(response.data.transcription);
      
      if (onTranscriptionComplete) {
        onTranscriptionComplete(response.data.transcription);
      }
      
      // Analyze emotion if enabled
      if (analyzeEmotion) {
        analyzeEmotion(blob);
      }
    } catch (error) {
      setError('Transcription error: ' + error.message);
      console.error('Error transcribing audio:', error);
    } finally {
      setIsTranscribing(false);
    }
  };
  
  // Analyze emotion in speech
  const analyzeEmotion = async (blob) => {
    if (!blob) return;
    
    setIsAnalyzingEmotion(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.wav');
      
      // This connects to voice_emotion.py backend
      const response = await apiEndpoints.speech.analyzeEmotion(formData);
      
      setEmotions(response.data);
      
      if (onEmotionDetected) {
        onEmotionDetected(response.data);
      }
    } catch (error) {
      setError('Emotion analysis error: ' + error.message);
      console.error('Error analyzing emotion:', error);
    } finally {
      setIsAnalyzingEmotion(false);
    }
  };
  
  // Toggle audio playback
  const togglePlayback = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Box>
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ mr: 2 }}>
          {!isRecording ? (
            <Tooltip title="Start Recording">
              <IconButton 
                color="primary" 
                onClick={startRecording}
                disabled={disabled}
                sx={{ 
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  '&:hover': { 
                    backgroundColor: 'rgba(25, 118, 210, 0.2)'
                  }
                }}
              >
                <Mic fontSize="large" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Stop Recording">
              <IconButton 
                color="error" 
                onClick={stopRecording}
                disabled={disabled}
                sx={{ 
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  '&:hover': { 
                    backgroundColor: 'rgba(211, 47, 47, 0.2)'
                  }
                }}
              >
                <Stop fontSize="large" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {isRecording 
              ? `Recording... ${formatTime(elapsedTime)} / ${formatTime(maxDuration)}`
              : audioUrl 
                ? "Recording complete"
                : "Ready to record"
            }
          </Typography>
          
          {(isTranscribing || isAnalyzingEmotion) && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="caption" color="text.secondary">
                {isTranscribing && "Transcribing..."}
                {!isTranscribing && isAnalyzingEmotion && "Analyzing emotions..."}
              </Typography>
            </Box>
          )}
        </Box>
        
        {audioUrl && (
          <Tooltip title={isPlaying ? "Pause" : "Play"}>
            <IconButton onClick={togglePlayback}>
              {isPlaying ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {transcription && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Transcription:
          </Typography>
          <Typography variant="body2">
            {transcription}
          </Typography>
        </Paper>
      )}
      
      {emotions && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <SentimentVerySatisfied sx={{ mr: 1, fontSize: 20 }} />
            Voice Emotion Analysis:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(emotions.emotions).map(([emotion, score]) => (
              <Tooltip key={emotion} title={`${(score * 100).toFixed(1)}%`}>
                <Box>
                  <Typography 
                    component="span" 
                    variant="body2"
                    sx={{ 
                      px: 1.5, 
                      py: 0.5, 
                      borderRadius: 1,
                      fontWeight: emotion === emotions.dominant ? 'bold' : 'normal',
                      backgroundColor: emotion === emotions.dominant 
                        ? 'primary.light' 
                        : 'action.hover',
                      color: emotion === emotions.dominant 
                        ? 'primary.contrastText' 
                        : 'text.primary'
                    }}
                  >
                    {emotion}
                  </Typography>
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SpeechControl;