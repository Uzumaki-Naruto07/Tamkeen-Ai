// frontend/src/components/common/LoadingSpinner.jsx
import React from "react";
import { CircularProgress, Box } from "@mui/material";

const LoadingSpinner = ({ size = 40, color = "primary", fullScreen = false }) => {
  if (fullScreen) {
    return (
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 9999
        }}
      >
        <CircularProgress size={size} color={color} />
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
      <CircularProgress size={size} color={color} />
    </Box>
  );
};

export default LoadingSpinner;