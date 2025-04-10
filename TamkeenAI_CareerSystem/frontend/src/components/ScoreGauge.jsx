import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const ScoreGauge = ({ score, maxScore = 100, size = 120, thickness = 4 }) => {
  // Calculate the percentage for the circular progress
  const percentage = (score / maxScore) * 100;
  
  // Determine color based on score
  const getColor = (score) => {
    if (score >= 80) return '#4caf50'; // Green
    if (score >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: size,
        height: size,
      }}
    >
      <CircularProgress
        variant="determinate"
        value={percentage}
        size={size}
        thickness={thickness}
        sx={{
          color: getColor(score),
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h4" component="div" color="text.secondary">
          {score}
        </Typography>
        <Typography variant="caption" component="div" color="text.secondary">
          /{maxScore}
        </Typography>
      </Box>
    </Box>
  );
};

export default ScoreGauge; 