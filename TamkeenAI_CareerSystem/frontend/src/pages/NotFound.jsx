import React from 'react';
import { Box, Typography, Button, Paper, Container, Grid } from '@mui/material';
import { Error, Home, ArrowBack, Search } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 5, 
          mt: 5, 
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: 'background.paper' 
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Error sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            404
          </Typography>
          
          <Typography variant="h5" color="textSecondary" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="textSecondary" paragraph sx={{ maxWidth: '80%', mx: 'auto', mt: 2 }}>
            Sorry, we couldn't find the page you're looking for. The page at <strong>{location.pathname}</strong> may have been moved, deleted, or never existed.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Home />}
            onClick={() => navigate('/')}
            size="large"
          >
            Home Page
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            size="large"
          >
            Go Back
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<Search />}
            onClick={() => navigate('/search')}
            size="large"
          >
            Search
          </Button>
        </Box>

        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" gutterBottom>
            You might be looking for:
          </Typography>
          
          <Grid container spacing={2} justifyContent="center" sx={{ mt: 1 }}>
            <Grid item>
              <Button onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={() => navigate('/job-search')}>
                Job Search
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={() => navigate('/resume-builder')}>
                Resume Builder
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={() => navigate('/analytics')}>
                Analytics
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={() => navigate('/calendar')}>
                Calendar
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="body2" color="textSecondary">
          If you believe this is an error, please contact support
        </Typography>
        <Button 
          variant="text" 
          color="primary" 
          size="small"
          onClick={() => navigate('/contact')}
          sx={{ mt: 1 }}
        >
          Contact Support
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 