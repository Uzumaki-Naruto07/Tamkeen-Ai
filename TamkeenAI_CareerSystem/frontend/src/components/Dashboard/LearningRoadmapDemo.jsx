import React from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import LearningRoadmap from './LearningRoadmap';

// Create a theme instance
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const LearningRoadmapDemo = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 4, maxWidth: '1200px', margin: '0 auto' }}>
        <LearningRoadmap />
      </Box>
    </ThemeProvider>
  );
};

export default LearningRoadmapDemo; 