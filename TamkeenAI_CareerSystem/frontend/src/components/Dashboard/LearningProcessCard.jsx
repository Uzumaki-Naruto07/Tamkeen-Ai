import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

const LearningProcessCard = ({ data }) => {
  // Default data if none provided
  const learningData = data?.learningData || {
    videosCompleted: 12,
    totalVideos: 30,
    completionPercentage: 40,
    lastWatched: "Introduction to AI"
  };

  return (
    <Box sx={{ 
      height: '100%', 
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
        Learning process like how many video you finished?
      </Typography>
      
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">Progress</Typography>
          <Typography variant="body2">{learningData.completionPercentage}%</Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={learningData.completionPercentage} 
          sx={{ 
            height: 8, 
            borderRadius: 5,
            bgcolor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              bgcolor: '#fff'
            }
          }}
        />
      </Box>
      
      <Typography variant="body1" sx={{ mb: 1 }}>
        {learningData.videosCompleted} of {learningData.totalVideos} videos completed
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        Last watched: {learningData.lastWatched}
      </Typography>
    </Box>
  );
};

export default LearningProcessCard; 