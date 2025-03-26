import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, CircularProgress, useTheme } from '@mui/material';
import { Radar } from 'react-chartjs-2';
import { useResume, useJob } from './AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const SkillMatchRadar = ({ resumeId, jobId, width = '100%', height = 400 }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const { currentResume } = useResume();
  const { currentJobDescription } = useJob();
  
  // Get resume and job IDs from context if not provided
  const effectiveResumeId = resumeId || (currentResume?.id);
  const effectiveJobId = jobId || (currentJobDescription?.id);
  
  useEffect(() => {
    const fetchSkillMatch = async () => {
      if (!effectiveResumeId || !effectiveJobId) {
        setError('Both resume and job are required for skill matching');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiEndpoints.jobs.match(effectiveResumeId, {
          jobId: effectiveJobId,
          includeSkillBreakdown: true
        });
        
        // Format data for radar chart
        const skills = response.data.skillBreakdown || [];
        
        const chartData = {
          labels: skills.map(skill => skill.name),
          datasets: [
            {
              label: 'Your Skills',
              data: skills.map(skill => skill.resumeScore),
              backgroundColor: theme.palette.primary.main + '40',
              borderColor: theme.palette.primary.main,
              borderWidth: 2,
            },
            {
              label: 'Job Requirements',
              data: skills.map(skill => skill.jobScore),
              backgroundColor: theme.palette.secondary.main + '40',
              borderColor: theme.palette.secondary.main,
              borderWidth: 2,
            }
          ]
        };
        
        setData(chartData);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch skill match data');
        console.error('Skill match error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSkillMatch();
  }, [effectiveResumeId, effectiveJobId, theme]);
  
  if (loading) {
    return (
      <Box sx={{ width, height, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner message="Analyzing skill match..." />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ width, height, p: 2 }}>
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      </Box>
    );
  }
  
  if (!data) {
    return (
      <Box sx={{ width, height, p: 2 }}>
        <Typography color="text.secondary" variant="body2">
          No skill match data available
        </Typography>
      </Box>
    );
  }
  
  return (
    <Paper sx={{ width, height, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Skill Match Analysis
      </Typography>
      <Box sx={{ height: height - 70 }}>
        <Radar 
          data={data}
          options={{
            scales: {
              r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  stepSize: 20
                }
              }
            },
            responsive: true,
            maintainAspectRatio: false
          }}
        />
      </Box>
    </Paper>
  );
};

export default SkillMatchRadar; 