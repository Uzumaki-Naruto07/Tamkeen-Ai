import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  Chip,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert
} from '@mui/material';
import { Radar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend 
} from 'chart.js';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useResume, useJob } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

// Register required Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const SkillGapRadar = ({ resumeId, jobId, width = '100%', height = 400, showLegend = true }) => {
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const { currentResume } = useResume();
  const { currentJobDescription } = useJob();
  
  // Get resume and job IDs from context if not provided
  const effectiveResumeId = resumeId || (currentResume?.id);
  const effectiveJobId = jobId || (currentJobDescription?.id);
  
  useEffect(() => {
    const fetchSkillGapData = async () => {
      if (!effectiveResumeId || !effectiveJobId) {
        setError('Both resume and job are required for skill gap analysis');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // This connects to skill_gap_predictor.py backend
        const response = await apiEndpoints.career.analyzeSkillGap({
          resumeId: effectiveResumeId,
          jobId: effectiveJobId,
          includeRecommendations: true
        });
        
        // Response includes skill comparison data from skill_gap_predictor.py
        setGapData(response.data.skillComparison);
        setRecommendations(response.data.recommendations || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to analyze skill gaps');
        console.error('Skill gap analysis error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSkillGapData();
  }, [effectiveResumeId, effectiveJobId]);
  
  if (loading) {
    return (
      <Box sx={{ width, height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner message="Analyzing skill gaps..." />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!gapData) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No skill gap data available
      </Alert>
    );
  }
  
  // Format data for radar chart
  const chartData = {
    labels: gapData.map(skill => skill.name),
    datasets: [
      {
        label: 'Your Skills',
        data: gapData.map(skill => skill.yourLevel),
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        borderColor: 'rgba(53, 162, 235, 1)',
        borderWidth: 2,
      },
      {
        label: 'Required Skills',
        data: gapData.map(skill => skill.requiredLevel),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
      }
    ]
  };
  
  return (
    <Paper sx={{ p: 3, width, height: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Skill Gap Analysis
      </Typography>
      
      <Box sx={{ height: 300, mb: 3 }}>
        <Radar 
          data={chartData}
          options={{
            scales: {
              r: {
                min: 0,
                max: 10,
                ticks: {
                  stepSize: 2
                }
              }
            },
            plugins: {
              legend: {
                display: showLegend
              }
            },
            responsive: true,
            maintainAspectRatio: false
          }}
        />
      </Box>
      
      {recommendations.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Skill Development Recommendations
          </Typography>
          <Grid container spacing={2}>
            {recommendations.map((rec, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  mb: 1 
                }}>
                  <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {rec.skill}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rec.suggestion}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default SkillGapRadar;
