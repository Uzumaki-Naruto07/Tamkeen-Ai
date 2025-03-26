import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Divider,
  Chip, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon,
  TextField, InputAdornment, CircularProgress,
  Alert, Dialog, DialogTitle, DialogContent,
  DialogActions, Tab, Tabs, Badge, Pagination,
  Tooltip, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Search, LocationOn, Work, Star, StarBorder,
  BusinessCenter, FilterList, Sort, Bookmark,
  BookmarkBorder, Share, CheckCircle, Send,
  CalendarToday, Add, DoNotDisturb, BusinessCenter as Job,
  Description, FindInPage
} from '@mui/icons-material';
import { useUser, useResume, useJob } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import ApplicationTracker from '../components/ApplicationTracker';
import JobMatchCalculator from '../components/JobMatchCalculator';
import LoadingSpinner from '../components/LoadingSpinner';

const JobSearchDashboard = () => {
  const [searchParams, setSearchParams] = useState({
    query: '',
    location: '',
    jobType: 'all',
    experienceLevel: 'all',
    remoteOnly: false,
    postedWithin: 'any'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetailsOpen, setJobDetailsOpen] = useState(false);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState(null);
  const [applying, setApplying] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  
  const { profile } = useUser();
  const { resumes, currentResume } = useResume();
  const { setSavedJobs: updateGlobalSavedJobs } = useJob();
  
  // Fetch saved jobs
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!profile?.id) return;
      
      try {
        const response = await apiEndpoints.career.getSavedJobs(profile.id);
        setSavedJobs(response.data);
        updateGlobalSavedJobs(response.data);
      } catch (err) {
        console.error('Error fetching saved jobs:', err);
      }
    };
    
    fetchSavedJobs();
  }, [profile, updateGlobalSavedJobs]);
  
  // Fetch applied jobs
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!profile?.id) return;
      
      try {
        const response = await apiEndpoints.career.getApplications(profile.id);
        setAppliedJobs(response.data);
      } catch (err) {
        console.error('Error fetching applied jobs:', err);
      }
    };
    
    fetchAppliedJobs();
  }, [profile]);
  
  // Handle search form change
  const handleSearchChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle search submission
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setError(null);
    setPage(1);
    
    try {
      const response = await apiEndpoints.jobs.searchJobs({
        ...searchParams,
        page: 1,
        limit: resultsPerPage
      });
      
      setSearchResults(response.data.jobs || []);
      setTotalResults(response.data.total || 0);
    } catch (err) {
      setError('Failed to fetch job listings. Please try again.');
      console.error('Job search error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle pagination change
  const handlePageChange = async (event, newPage) => {
    setPage(newPage);
    setLoading(true);
    
    try {
      const response = await apiEndpoints.jobs.searchJobs({
        ...searchParams,
        page: newPage,
        limit: resultsPerPage
      });
      
      setSearchResults(response.data.jobs || []);
    } catch (err) {
      setError('Failed to fetch job listings. Please try again.');
      console.error('Job search error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle save job
  const handleToggleSaveJob = async (job) => {
    if (!profile?.id) return;
    
    const isAlreadySaved = savedJobs.some(savedJob => savedJob.id === job.id);
    
    try {
      if (isAlreadySaved) {
        await apiEndpoints.career.unsaveJob(profile.id, job.id);
        
        // Update saved jobs list
        const updatedSavedJobs = savedJobs.filter(savedJob => savedJob.id !== job.id);
        setSavedJobs(updatedSavedJobs);
        updateGlobalSavedJobs(updatedSavedJobs);
      } else {
        await apiEndpoints.career.saveJob(profile.id, job);
        
        // Update saved jobs list
        const updatedSavedJobs = [...savedJobs, job];
        setSavedJobs(updatedSavedJobs);
        updateGlobalSavedJobs(updatedSavedJobs);
      }
    } catch (err) {
      console.error('Error saving/unsaving job:', err);
    }
  };
  
  // Apply to job
  const handleApplyToJob = async () => {
    if (!selectedJob || !profile?.id) return;
    
    setApplying(true);
    setApplyError(null);
    
    try {
      const selectedResumeId = currentResume?.id || '';
      
      // Submit application
      await apiEndpoints.career.applyToJob({
        userId: profile.id,
        jobId: selectedJob.id,
        resumeId: selectedResumeId,
        coverLetterId: '',
        applicationDate: new Date().toISOString(),
        status: 'applied'
      });
      
      // Update applied jobs list
      setAppliedJobs(prev => [...prev, { 
        ...selectedJob, 
        applicationDate: new Date().toISOString(),
        status: 'applied'
      }]);
      
      setApplySuccess(true);
      setTimeout(() => {
        setApplicationDialogOpen(false);
        setApplySuccess(false);
      }, 1500);
    } catch (err) {
      setApplyError('Failed to submit application. Please try again.');
      console.error('Job application error:', err);
    } finally {
      setApplying(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Format date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Calculate days ago
  const getDaysAgo = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };
  
  // Check if job is saved
  const isJobSaved = (jobId) => {
    return savedJobs.some(job => job.id === jobId);
  };
  
  // Check if job is applied to
  const isJobApplied = (jobId) => {
    return appliedJobs.some(job => job.jobId === jobId || job.id === jobId);
  };
  
  // Render search form
  const renderSearchForm = () => (
    <Paper component="form" onSubmit={handleSearch} sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="query"
            label="Job Title, Skills, or Keywords"
            value={searchParams.query}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            name="location"
            label="Location"
            value={searchParams.location}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Job Type</InputLabel>
            <Select
              name="jobType"
              value={searchParams.jobType}
              onChange={handleSearchChange}
              label="Job Type"
            >
              <MenuItem value="all">All Job Types</MenuItem>
              <MenuItem value="full-time">Full-time</MenuItem>
              <MenuItem value="part-time">Part-time</MenuItem>
              <MenuItem value="contract">Contract</MenuItem>
              <MenuItem value="internship">Internship</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Experience Level</InputLabel>
            <Select
              name="experienceLevel"
              value={searchParams.experienceLevel}
              onChange={handleSearchChange}
              label="Experience Level"
            >
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="entry">Entry Level</MenuItem>
              <MenuItem value="mid">Mid Level</MenuItem>
              <MenuItem value="senior">Senior Level</MenuItem>
              <MenuItem value="executive">Executive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Posted Within</InputLabel>
            <Select
              name="postedWithin"
              value={searchParams.postedWithin}
              onChange={handleSearchChange}
              label="Posted Within"
            >
              <MenuItem value="any">Any Time</MenuItem>
              <MenuItem value="day">Past 24 Hours</MenuItem>
              <MenuItem value="week">Past Week</MenuItem>
              <MenuItem value="month">Past Month</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={24} /> : <Search />}
            sx={{ height: '100%' }}
          >
            {loading ? 'Searching...' : 'Search Jobs'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
  
  // Render job listings
  const renderJobListings = () => {
    const jobsToDisplay = activeTab === 0 
      ? searchResults 
      : activeTab === 1 
        ? savedJobs 
        : appliedJobs;
    
    if (jobsToDisplay.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BusinessCenter sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {activeTab === 0
              ? 'No jobs found. Try adjusting your search criteria.'
              : activeTab === 1
                ? 'No saved jobs. Start saving jobs you\'re interested in!'
                : 'No applied jobs. Start applying to jobs!'}
          </Typography>
          
          {activeTab === 0 && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchParams({
                  query: '',
                  location: '',
                  jobType: 'all',
                  experienceLevel: 'all',
                  remoteOnly: false,
                  postedWithin: 'any'
                });
                handleSearch();
              }}
            >
              Clear Search
            </Button>
          )}
        </Paper>
      );
    }
    
    return (
      <>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">
            {activeTab === 0
              ? `${totalResults} jobs found` 
              : activeTab === 1
                ? `${savedJobs.length} saved jobs`
                : `${appliedJobs.length} job applications`}
          </Typography>
        </Box>
        
        {jobsToDisplay.map(job => (
          <Card key={job.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {job.title}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    {job.company}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn color="action" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {job.location}
                    </Typography>
                    
                    {job.remote && (
                      <Chip 
                        label="Remote" 
                        size="small" 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {job.jobType || 'Full-time'} • Posted {getDaysAgo(job.postDate)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {job.skills && job.skills.slice(0, 5).map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    
                    {job.skills && job.skills.length > 5 && (
                      <Chip
                        label={`+${job.skills.length - 5} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
                
                <Box>
                  <Tooltip title={isJobSaved(job.id) ? 'Remove from saved jobs' : 'Save job'}>
                    <IconButton onClick={() => handleToggleSaveJob(job)}>
                      {isJobSaved(job.id) ? <Bookmark color="primary" /> : <BookmarkBorder />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {job.salary && (
                <Typography variant="body2" gutterBottom>
                  Salary: {job.salary}
                </Typography>
              )}
              
              {activeTab === 2 && (
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={job.status || 'Applied'}
                    color={
                      (job.status === 'rejected' ? 'error' :
                      job.status === 'interview' ? 'info' :
                      job.status === 'offer' ? 'success' : 'default')
                    }
                    size="small"
                  />
                  
                  {job.applicationDate && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Applied on: {formatDate(job.applicationDate)}
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
            
            <CardActions>
              <Button
                size="small"
                onClick={() => {
                  setSelectedJob(job);
                  setJobDetailsOpen(true);
                }}
              >
                View Details
              </Button>
              
              {!isJobApplied(job.id) && activeTab !== 2 && (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setSelectedJob(job);
                    setApplicationDialogOpen(true);
                  }}
                >
                  Apply Now
                </Button>
              )}
              
              {isJobApplied(job.id) && activeTab !== 2 && (
                <Chip 
                  label="Applied" 
                  color="success"
                  size="small"
                />
              )}
            </CardActions>
          </Card>
        ))}
        
        {activeTab === 0 && totalResults > resultsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={Math.ceil(totalResults / resultsPerPage)} 
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </>
    );
  };
  
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Job Search
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Search Form */}
      {renderSearchForm()}
      
      {/* Job Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <Tab 
            label="Search Results" 
            icon={<Search />} 
          />
          <Tab 
            label="Saved Jobs" 
            icon={
              <Badge badgeContent={savedJobs.length} color="primary">
                <Bookmark />
              </Badge>
            } 
          />
          <Tab 
            label="Applications" 
            icon={
              <Badge badgeContent={appliedJobs.length} color="primary">
                <Description />
              </Badge>
            } 
          />
        </Tabs>
      </Paper>
      
      {/* Job Listings */}
      <Box>
        {loading && <LoadingSpinner message="Loading jobs..." />}
        {!loading && renderJobListings()}
      </Box>
      
      {/* Job Details Dialog */}
      <Dialog
        open={jobDetailsOpen}
        onClose={() => setJobDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedJob && (
          <>
            <DialogTitle>
              <Typography variant="h6">{selectedJob.title}</Typography>
              <Typography variant="subtitle1">{selectedJob.company}</Typography>
            </DialogTitle>
            
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" gutterBottom>
                    Job Description
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    {selectedJob.description || 'No description available.'}
                  </Typography>
                  
                  {selectedJob.requirements && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Requirements
                      </Typography>
                      
                      <List>
                        {selectedJob.requirements.map((requirement, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>•</ListItemIcon>
                            <ListItemText primary={requirement} />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                  
                  {selectedJob.responsibilities && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Responsibilities
                      </Typography>
                      
                      <List>
                        {selectedJob.responsibilities.map((responsibility, index) => (
                          <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemIcon sx={{ minWidth: 28 }}>•</ListItemIcon>
                            <ListItemText primary={responsibility} />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Job Details
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <LocationOn />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Location"
                          secondary={selectedJob.location}
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <Work />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Job Type"
                          secondary={selectedJob.jobType || 'Full-time'}
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <CalendarToday />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Posted Date"
                          secondary={formatDate(selectedJob.postDate)}
                        />
                      </ListItem>
                      
                      {selectedJob.salary && (
                        <ListItem>
                          <ListItemIcon>
                            <AttachMoney />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Salary"
                            secondary={selectedJob.salary}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                  
                  {selectedJob.skills && selectedJob.skills.length > 0 && (
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Skills
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedJob.skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Paper>
                  )}
                  
                  {currentResume && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Resume Match
                      </Typography>
                      
                      <JobMatchCalculator
                        resumeId={currentResume.id}
                        jobData={selectedJob}
                        compact={true}
                      />
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions>
              <Button 
                onClick={() => handleToggleSaveJob(selectedJob)}
                startIcon={isJobSaved(selectedJob.id) ? <Bookmark /> : <BookmarkBorder />}
              >
                {isJobSaved(selectedJob.id) ? 'Saved' : 'Save'}
              </Button>
              
              <Button 
                onClick={() => setJobDetailsOpen(false)}
              >
                Close
              </Button>
              
              {!isJobApplied(selectedJob.id) && (
                <Button 
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setJobDetailsOpen(false);
                    setApplicationDialogOpen(true);
                  }}
                >
                  Apply Now
                </Button>
              )}
              
              {isJobApplied(selectedJob.id) && (
                <Button 
                  variant="contained"
                  color="success"
                  disabled
                  startIcon={<CheckCircle />}
                >
                  Applied
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Apply Job Dialog */}
      <Dialog
        open={applicationDialogOpen}
        onClose={() => !applying && setApplicationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedJob && (
          <>
            <DialogTitle>
              Apply to {selectedJob.title} at {selectedJob.company}
            </DialogTitle>
            
            <DialogContent dividers>
              {applySuccess ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Application Submitted!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your application has been successfully submitted.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography variant="body2" paragraph>
                    You are about to apply for the following position:
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {selectedJob.title}
                    </Typography>
                    <Typography variant="body2">
                      {selectedJob.company} • {selectedJob.location}
                    </Typography>
                  </Box>
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Resume</InputLabel>
                    <Select
                      value={currentResume?.id || ''}
                      label="Select Resume"
                      onChange={(e) => {
                        // Find and set the selected resume
                        const resume = resumes.find(r => r.id === e.target.value);
                        if (resume) {
                          // You'd need to implement this in the context
                          // setCurrentResume(resume);
                        }
                      }}
                    >
                      {resumes.map(resume => (
                        <MenuItem key={resume.id} value={resume.id}>
                          {resume.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {applyError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {applyError}
                    </Alert>
                  )}
                </>
              )}
            </DialogContent>
            
            {!applySuccess && (
              <DialogActions>
                <Button 
                  onClick={() => setApplicationDialogOpen(false)}
                  disabled={applying}
                >
                  Cancel
                </Button>
                
                <Button 
                  variant="contained"
                  color="primary"
                  onClick={handleApplyToJob}
                  disabled={applying || !currentResume}
                  startIcon={applying ? <CircularProgress size={24} /> : <Send />}
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </Button>
              </DialogActions>
            )}
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default JobSearchDashboard; 