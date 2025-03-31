import React, { useState, useEffect } from 'react';
import {
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Chip, 
  IconButton, 
  Button, 
  Divider,
  CircularProgress,
  Alert,
  CardActionArea,
  Stack,
  Snackbar
} from '@mui/material';
import {
  Delete,
  BookmarkRemove,
  Work,
  LocationOn,
  Business,
  Timer,
  FilterList,
  Sort,
  SearchOff
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useJob } from '../context/AppContext';
import { format } from 'date-fns';

const SavedJobs = () => {
  const { savedJobs, isSavedJob, removeSavedJob, fetchSavedJobs } = useJob();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Load saved jobs when component mounts
  useEffect(() => {
    const loadSavedJobs = async () => {
      setLoading(true);
      try {
        await fetchSavedJobs();
        setError(null);
      } catch (err) {
        console.error('Error loading saved jobs:', err);
        setError('Failed to load saved jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedJobs();
  }, [fetchSavedJobs]);
  
  // Handle removing a job from saved jobs
  const handleRemoveJob = async (jobId, event) => {
    // Prevent click from propagating to parent (card) element
    event?.stopPropagation();
    event?.preventDefault();
    
    try {
      await removeSavedJob(jobId);
      setSnackbarMessage('Job removed from saved jobs');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error removing saved job:', err);
      setSnackbarMessage('Failed to remove job. Please try again.');
      setSnackbarOpen(true);
    }
  };
  
  // Render a saved job card
  const renderJobCard = (job) => {
    return (
      <Card 
        key={job.id} 
        component={RouterLink}
        to={`/jobs/${job.id}`}
        sx={{ 
          mb: 2, 
          position: 'relative',
          textDecoration: 'none',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" component="div" gutterBottom>
                {job.title}
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                {job.company && (
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <Business fontSize="small" sx={{ mr: 0.5 }} />
                    {typeof job.company === 'string' ? job.company : job.company.name}
                  </Typography>
                )}
                {job.location && (
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
                    {job.location}
                  </Typography>
                )}
              </Stack>
              {job.jobType && (
                <Chip 
                  size="small" 
                  label={job.jobType} 
                  color="primary" 
                  variant="outlined" 
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
              {job.salaryRange && (
                <Chip 
                  size="small" 
                  label={job.salaryRange} 
                  color="secondary" 
                  variant="outlined" 
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
              {job.remote && (
                <Chip 
                  size="small" 
                  label="Remote" 
                  color="success" 
                  variant="outlined" 
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
            </Box>
            <IconButton 
              onClick={(e) => handleRemoveJob(job.id, e)}
              aria-label="remove from saved jobs"
              sx={{ color: 'error.main' }}
            >
              <BookmarkRemove />
            </IconButton>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              {job.postedDate && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Timer fontSize="small" sx={{ mr: 0.5 }} />
                  Posted {format(new Date(job.postedDate), 'MMM d, yyyy')}
                </Typography>
              )}
              {job.savedAt && (
                <Typography variant="caption" color="text.secondary">
                  Saved {format(new Date(job.savedAt), 'MMM d, yyyy')}
                </Typography>
              )}
            </Stack>
            
            {job.matchScore && (
              <Chip 
                size="small" 
                label={`${job.matchScore}% Match`} 
                color={job.matchScore > 80 ? "success" : job.matchScore > 60 ? "primary" : "default"} 
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Saved Jobs
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your saved job opportunities
        </Typography>
      </Box>
      
      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Error state */}
      {error && !loading && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {/* No saved jobs */}
      {!loading && !error && (!savedJobs || savedJobs.length === 0) && (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 4 }}>
          <SearchOff sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No saved jobs found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            You haven't saved any jobs yet. When you find interesting opportunities, click the bookmark icon to save them for later.
          </Typography>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/job-search"
            sx={{ mt: 2 }}
          >
            Browse Jobs
          </Button>
        </Paper>
      )}
      
      {/* Job list */}
      {!loading && !error && savedJobs && savedJobs.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle1">
                {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}
              </Typography>
              
              {/* These buttons are for future functionality */}
              <Box>
                <Button 
                  size="small" 
                  startIcon={<FilterList />}
                  sx={{ mr: 1 }}
                  disabled
                >
                  Filter
                </Button>
                <Button 
                  size="small"
                  startIcon={<Sort />}
                  disabled
                >
                  Sort
                </Button>
              </Box>
            </Box>
            
            {savedJobs.map(job => renderJobCard(job))}
          </Grid>
        </Grid>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default SavedJobs; 