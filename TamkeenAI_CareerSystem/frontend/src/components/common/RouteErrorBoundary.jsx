import React from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { Error as ErrorIcon, Refresh, ArrowBack } from '@mui/icons-material';

const RouteErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  
  // Extract error details
  let errorMessage = "An unexpected error occurred";
  let errorDetails = "";
  
  if (isRouteErrorResponse(error)) {
    // Router-specific errors (404, etc)
    errorMessage = `${error.status} ${error.statusText}`;
    errorDetails = error.data?.message || "";
  } else if (error instanceof Error) {
    // JavaScript errors
    errorMessage = error.message;
    errorDetails = error.stack;
    
    // Special handling for module loading errors
    if (errorMessage.includes("Failed to fetch dynamically imported module")) {
      errorMessage = "Failed to load page component";
      errorDetails = "The page you're trying to access couldn't be loaded. This may be due to network issues or a temporary problem.";
    }
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          textAlign: 'center',
          border: '1px solid',
          borderColor: 'error.light',
          backgroundColor: 'error.lighter'
        }}
      >
        <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
        
        <Typography variant="h4" color="error" gutterBottom>
          Oops! Something went wrong
        </Typography>
        
        <Typography variant="h6" sx={{ mb: 3 }}>
          {errorMessage}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {errorDetails}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RouteErrorBoundary; 