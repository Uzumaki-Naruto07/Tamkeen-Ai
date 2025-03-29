// frontend/src/components/common/LoadingSpinner.jsx
import React from "react";
import { CircularProgress, Box, Typography } from "@mui/material";

const LoadingSpinner = ({ size = 40, color = "primary", fullScreen = false, message }) => {
  const spinnerContent = (
    <>
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mt: 2, textAlign: 'center' }}
        >
          {message}
        </Typography>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
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
        {spinnerContent}
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2 }}>
      {spinnerContent}
    </Box>
  );
};

export default LoadingSpinner;