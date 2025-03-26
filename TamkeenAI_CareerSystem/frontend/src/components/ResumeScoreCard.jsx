import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  LinearProgress,
  Divider,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  Assessment,
  Refresh,
  Info,
  Download
} from '@mui/icons-material';
import { useResume } from './AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const ResumeScoreCard = ({ resumeId, compact = false }) => {
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentResume, resumeScores, addResumeScore } = useResume();
  
  // Get resume ID from context if not provided
  const effectiveResumeId = resumeId || (currentResume?.id);
  
  useEffect(() => {
    const fetchResumeScore = async () => {
      if (!effectiveResumeId) {
        setError('Resume ID is required for scoring');
        setLoading(false);
        return;
      }
      
      // Check if we already have the score in context
      if (resumeScores && resumeScores[effectiveResumeId]) {
        setScoreData(resumeScores[effectiveResumeId]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiEndpoints.resume.analyze(effectiveResumeId);
        
        // Store score in context
        addResumeScore(effectiveResumeId, response.data);
        
        // Update local state
        setScoreData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to analyze resume');
        console.error('Resume analysis error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResumeScore();
  }, [effectiveResumeId, resumeScores, addResumeScore]);
  
  const handleRefreshScore = () => {
    // Force a refresh of the score
    setLoading(true);
    setError(null);
    
    apiEndpoints.resume.analyze(effectiveResumeId, { force: true })
      .then(response => {
        addResumeScore(effectiveResumeId, response.data);
        setScoreData(response.data);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to refresh score');
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  if (loading) {
    return (
      <Paper sx={{ p: compact ? 2 : 3 }}>
        <LoadingSpinner message="Analyzing resume..." />
      </Paper>
    );
  }
  
  if (error) {
    return (
      <Paper sx={{ p: compact ? 2 : 3 }}>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={handleRefreshScore}
          sx={{ mt: 1 }}
        >
          Try Again
        </Button>
      </Paper>
    );
  }
  
  if (!scoreData) {
    return (
      <Paper sx={{ p: compact ? 2 : 3 }}>
        <Typography color="text.secondary" variant="body2">
          No score data available
        </Typography>
      </Paper>
    );
  }
  
  // Compact view for embedding in other components
  if (compact) {
    return (
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ position: 'relative', mr: 2 }}>
            <CircularProgress
              variant="determinate"
              value={scoreData.overallScore}
              size={60}
              thickness={5}
              sx={{
                color: scoreData.overallScore > 70 ? 'success.main' : 
                      scoreData.overallScore > 50 ? 'warning.main' : 'error.main',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" component="div" color="text.primary">
                {Math.round(scoreData.overallScore)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Resume Score
            </Typography>
            <Typography variant="subtitle2">
              {scoreData.overallScore > 70 ? 'Excellent' : 
               scoreData.overallScore > 50 ? 'Good' : 'Needs Work'}
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  }
  
  // Full detailed view
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Resume Analysis Score
      </Typography>
      
      {/* Score visualization and breakdown would go here */}
      {/* Would include overall score, section scores, recommendations, etc. */}
    </Paper>
  );
};

export default ResumeScoreCard; 