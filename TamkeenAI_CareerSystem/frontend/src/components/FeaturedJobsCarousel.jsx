import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button,
  Paper,
  useTheme
} from '@mui/material';
import { 
  Search,
  ArrowForward,
  Work
} from '@mui/icons-material';

/**
 * FeaturedJobsCarousel component replaced with a button to redirect to job search
 */
const FeaturedJobsCarousel = ({ 
  resumeId,
  customText
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const handleNavigateToJobs = () => {
    navigate('/jobs');
  };
  
  return (
    <Paper 
      elevation={0} 
      variant="outlined"
      sx={{ 
        p: 4, 
        borderRadius: 2, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        background: `linear-gradient(45deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.light}15 100%)`,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Work 
        sx={{ 
          fontSize: 60, 
          color: theme.palette.primary.main,
          opacity: 0.8,
          mb: 2
        }} 
      />
      
      <Typography variant="h5" gutterBottom>
        Find Your Perfect Job Match
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600 }}>
        {customText || "Based on your resume's skills and qualifications, we've identified relevant job opportunities that match your profile. Explore our job search to find your next career opportunity."}
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<Search />}
        endIcon={<ArrowForward />}
        onClick={handleNavigateToJobs}
        sx={{ mt: 2, px: 3, py: 1 }}
      >
        Explore Job Opportunities
      </Button>
    </Paper>
  );
};

FeaturedJobsCarousel.propTypes = {
  resumeId: PropTypes.string,
  customText: PropTypes.string
};

export default FeaturedJobsCarousel; 