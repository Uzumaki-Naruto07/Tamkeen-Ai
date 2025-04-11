import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, CircularProgress,
  Chip, Divider, Grid, IconButton, Button,
  List, ListItem, ListItemText, Alert,
  LinearProgress
} from '@mui/material';
import {
  Mic, MicOff, GraphicEq, VolumeUp,
  Speed, Psychology, Timer, Check
} from '@mui/icons-material';
import { Radar, Line } from 'react-chartjs-2';
import SpeechControl from './SpeechControl.jsx';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const VoiceEmotionResult = ({ onUpdate = () => {}, sessionId = null }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  
  // Handle recording start
  const startRecording = () => {
    setIsRecording(true);
    setAudioData(null);
    setError(null);
  };
  
  // Handle recording stop and analysis
  const stopRecording = async (blob) => {
    setIsRecording(false);
    
    if (!blob) {
      setError('No audio data recorded');
      return;
    }
    
    setAudioData(blob);
    await analyzeVoice(blob);
  };
  
  // Analyze voice recording
  const analyzeVoice = async (audioBlob) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      if (sessionId) {
        formData.append('sessionId', sessionId);
      }
      
      // This connects to voice_emotion.py backend
      const response = await apiEndpoints.interview.analyzeVoice(formData);
      
      // Response includes tone, hesitation, voice emotion from voice_emotion.py
      const newResults = response.data;
      setAnalysisResults(newResults);
      
      // Add to history for tracking over time
      setAnalysisHistory(prev => [...prev, {
        timestamp: new Date().toISOString(),
        ...newResults
      }]);
      
      // Call update callback
      onUpdate(newResults);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze voice');
      console.error('Voice analysis error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <VolumeUp sx={{ mr: 1 }} />
        Voice Analysis
      </Typography>
      
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <SpeechControl 
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          isRecording={isRecording}
          maxDuration={60} // 1 minute max
        />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading && (
        <Box sx={{ my: 2, textAlign: 'center' }}>
          <LoadingSpinner message="Analyzing voice patterns..." />
        </Box>
      )}
      
      {analysisResults && !loading && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Voice Emotion Profile
            </Typography>
            <Box sx={{ height: 250 }}>
              <Radar 
                data={{
                  labels: ['Confidence', 'Anxiety', 'Enthusiasm', 'Assertiveness', 'Clarity', 'Engagement'],
                  datasets: [{
                    label: 'Your Voice Profile',
                    data: [
                      analysisResults.confidence,
                      analysisResults.anxiety,
                      analysisResults.enthusiasm,
                      analysisResults.assertiveness,
                      analysisResults.clarity,
                      analysisResults.engagement
                    ],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2
                  }]
                }}
                options={{
                  scales: {
                    r: {
                      angleLines: {
                        display: true
                      },
                      suggestedMin: 0,
                      suggestedMax: 100
                    }
                  },
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Speech Metrics
            </Typography>
            <List>
              <ListItem divider>
                <ListItemText 
                  primary="Speaking Pace" 
                  secondary={`${analysisResults.speakingPace} words per minute`}
                />
                <Speed color={analysisResults.paceFeedback === 'good' ? 'success' : 'warning'} />
              </ListItem>
              
              <ListItem divider>
                <ListItemText 
                  primary="Hesitation Count" 
                  secondary={`${analysisResults.hesitationCount} hesitations detected`}
                />
                <Timer color={analysisResults.hesitationCount < 5 ? 'success' : 'warning'} />
              </ListItem>
              
              <ListItem divider>
                <ListItemText 
                  primary="Dominant Tone" 
                  secondary={analysisResults.dominantTone}
                />
                <Psychology color="primary" />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Clarity Score" 
                  secondary={`${analysisResults.clarityScore}/100`}
                />
                <Box sx={{ width: 100 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={analysisResults.clarityScore} 
                    color={analysisResults.clarityScore > 70 ? 'success' : 'warning'}
                  />
                </Box>
              </ListItem>
            </List>
          </Grid>
          
          {analysisResults.suggestions && analysisResults.suggestions.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Voice Improvement Suggestions
              </Typography>
              <List>
                {analysisResults.suggestions.map((suggestion, index) => (
                  <ListItem key={index} divider={index < analysisResults.suggestions.length - 1}>
                    <Check sx={{ mr: 1, color: 'success.main' }} />
                    <ListItemText primary={suggestion} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}
        </Grid>
      )}
    </Paper>
  );
};

export default VoiceEmotionResult; 