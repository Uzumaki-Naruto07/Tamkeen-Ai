import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Grid, Card, CardContent, Chip, Alert,
  CircularProgress, IconButton, Tooltip, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl,
  InputLabel, FormHelperText, Breadcrumbs,
  Link, Tabs, Tab, List, ListItem, ListItemText,
  ListItemIcon, Collapse, Snackbar, LinearProgress,
  Rating, Badge, Menu, Avatar
} from '@mui/material';
import {
  Work, LocationOn, AttachMoney, Timer,
  Bookmark, BookmarkBorder, Share, ArrowBack,
  Send, Business, Description, LocalOffer,
  Domain, Group, Visibility, CheckCircle,
  RadioButtonUnchecked, KeyboardArrowDown, KeyboardArrowUp,
  Timeline, Psychology, Assignment, BarChart,
  ThumbUp, ThumbDown, Star, PersonAdd, Save,
  Favorite, FavoriteBorder, CloudUpload, Warning,
  Info, NavigateBefore, NavigateNext, MoreVert,
  SupervisorAccount, Language, Public, MenuBook,
  OpenInNew, Mail, AccessTime, Schedule, Flag,
  ReportProblem, QuestionAnswer, Event, Check,
  Print, School
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useUser, useResume, useJob } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import SkillChip from '../components/common/SkillChip';

const JobDetails = () => {
  const { jobId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('initial'); // initial, submitting, success, error
  const [applicationError, setApplicationError] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    resumeId: '',
    coverLetter: '',
    phone: '',
    availability: '',
    referral: '',
    questions: {}
  });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [applyProgress, setApplyProgress] = useState(0);
  const [skillsMatch, setSkillsMatch] = useState({
    score: 0,
    matching: [],
    missing: [],
    total: 0
  });
  const [companyDetails, setCompanyDetails] = useState(null);
  const [optionsMenuAnchorEl, setOptionsMenuAnchorEl] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isCompanyFollowed, setIsCompanyFollowed] = useState(false);
  
  const navigate = useNavigate();
  const { profile } = useUser();
  const { resumes } = useResume();
  const { savedJobs, toggleSaveJob, isSavedJob } = useJob();
  
  // Force LTR direction for JobDetails page
  useEffect(() => {
    // Store the original direction
    const originalDir = document.documentElement.dir;
    
    // Force LTR for this page
    document.documentElement.dir = 'ltr';
    
    // Restore original direction on component unmount
    return () => {
      document.documentElement.dir = originalDir;
    };
  }, []);
  
  // Load job details
  useEffect(() => {
    const loadJobDetails = async () => {
      if (!jobId) {
        setError('No job ID provided');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Create mock functions if they don't exist
        // Check if the API functions exist, otherwise use mock implementations
        const getJobData = async (id) => {
          try {
            if (apiEndpoints.jobs.getJobById) {
              return await apiEndpoints.jobs.getJobById(id);
            } else {
              console.log("Using mock getJobById implementation");
              // Use pre-existing jobs search function if available
              if (apiEndpoints.jobs.searchJobs) {
                const allJobs = await apiEndpoints.jobs.searchJobs({});
                const foundJob = allJobs.data?.jobs?.find(job => job.id === id);
                if (foundJob) {
                  return { data: foundJob };
                }
              }
              
              // Fallback mock data
              return {
                data: {
                  id,
                  title: "Software Developer",
                  company: { name: "TamkeenAI", id: "1" },
                  location: "Dubai, UAE",
                  remote: true,
                  salary: { min: 80000, max: 120000, currency: "AED" },
                  description: "This is a mock job description. The real API endpoint for getJobById is not available.",
                  skills: ["React", "JavaScript", "Node.js"],
                  postedDate: new Date().toISOString(),
                  employmentType: "Full-time"
                }
              };
            }
          } catch (err) {
            console.error("Error in getJobData:", err);
            throw err;
          }
        };
        
        const getSavedJobs = async (userId) => {
          try {
            if (apiEndpoints.jobs.getSavedJobs) {
              return await apiEndpoints.jobs.getSavedJobs(userId);
            } else {
              console.log("Using mock getSavedJobs implementation");
              return { data: [] };
            }
          } catch (err) {
            console.error("Error in getSavedJobs:", err);
            throw err;
          }
        };
        
        const getSimilarJobs = async (jobId) => {
          try {
            if (apiEndpoints.jobs.getSimilarJobs) {
              return await apiEndpoints.jobs.getSimilarJobs(jobId);
            } else {
              console.log("Using mock getSimilarJobs implementation");
              return { data: [] };
            }
          } catch (err) {
            console.error("Error in getSimilarJobs:", err);
            throw err;
          }
        };
        
        const calculateSkillsMatch = async (jobId, userId) => {
          try {
            if (apiEndpoints.jobs.calculateSkillsMatch) {
              return await apiEndpoints.jobs.calculateSkillsMatch(jobId, userId);
            } else {
              console.log("Using mock calculateSkillsMatch implementation");
              return { 
                data: {
                  score: 75,
                  matching: ["React", "JavaScript"],
                  missing: ["Python", "AWS"],
                  total: 4
                } 
              };
            }
          } catch (err) {
            console.error("Error in calculateSkillsMatch:", err);
            throw err;
          }
        };
        
        // Mock company API if needed
        const getCompanyById = async (companyId) => {
          try {
            if (apiEndpoints.companies && apiEndpoints.companies.getCompanyById) {
              return await apiEndpoints.companies.getCompanyById(companyId);
            } else {
              console.log("Using mock getCompanyById implementation");
              return { 
                data: {
                  id: companyId,
                  name: "TamkeenAI", 
                  industry: "Technology",
                  description: "Mock company description",
                  size: "51-200 employees",
                  logo: "https://via.placeholder.com/150",
                  website: "https://example.com",
                  jobs: []
                } 
              };
            }
          } catch (err) {
            console.error("Error in getCompanyById:", err);
            throw err;
          }
        };
        
        const isCompanyFollowed = async (companyId, userId) => {
          try {
            if (apiEndpoints.companies && apiEndpoints.companies.isFollowed) {
              return await apiEndpoints.companies.isFollowed(companyId, userId);
            } else {
              console.log("Using mock isCompanyFollowed implementation");
              return { data: { following: false } };
            }
          } catch (err) {
            console.error("Error in isCompanyFollowed:", err);
            throw err;
          }
        };
        
        // Fetch job details using the mock or real function
        const jobResponse = await getJobData(jobId);
        setJob(jobResponse.data);
        
        // Load similar jobs
        const similarJobsResponse = await getSimilarJobs(jobId);
        setSimilarJobs(similarJobsResponse.data || []);
        
        // Calculate skills match if user is logged in
        if (profile?.id) {
          const skillsMatchResponse = await calculateSkillsMatch(jobId, profile.id);
          setSkillsMatch(skillsMatchResponse.data || {
            score: 0,
            matching: [],
            missing: [],
            total: 0
          });
        }
        
        // Load company details
        if (jobResponse.data.company?.id) {
          const companyResponse = await getCompanyById(jobResponse.data.company.id);
          setCompanyDetails(companyResponse.data);
          
          // Check if company is followed
          if (profile?.id) {
            const isFollowed = await isCompanyFollowed(jobResponse.data.company.id, profile.id);
            setIsCompanyFollowed(isFollowed.data.following);
          }
        }
        
        // Initialize application form
        if (resumes && resumes.length > 0) {
          setApplicationForm(prev => ({
            ...prev,
            resumeId: resumes[0].id,
            phone: profile?.phone || ''
          }));
        }
      } catch (err) {
        console.error('Error loading job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadJobDetails();
  }, [jobId, profile, resumes]);
  
  // Toggle save job
  const handleToggleSaveJob = async () => {
    if (!profile?.id) {
      navigate('/login', { state: { from: `/jobs/${jobId}` } });
      return;
    }
    
    try {
      // Use the global toggleSaveJob function from context
      await toggleSaveJob(job);
      
      // Show success message
      if (isSavedJob(job.id)) {
        setSnackbarMessage('Job removed from saved jobs');
      } else {
        setSnackbarMessage('Job saved successfully');
      }
      
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error toggling job save:', err);
      setSnackbarMessage('Failed to update saved jobs');
      setSnackbarOpen(true);
    }
  };
  
  // Toggle company follow
  const handleToggleFollowCompany = async () => {
    if (!profile?.id || !job?.company?.id) {
      navigate('/login', { state: { from: `/jobs/${jobId}` } });
      return;
    }
    
    try {
      // Create mock functions if they don't exist
      const followCompany = async (companyId, userId) => {
        if (apiEndpoints.companies && apiEndpoints.companies.followCompany) {
          return await apiEndpoints.companies.followCompany(companyId, userId);
        } else {
          console.log("Using mock followCompany implementation");
          return { success: true };
        }
      };
      
      const unfollowCompany = async (companyId, userId) => {
        if (apiEndpoints.companies && apiEndpoints.companies.unfollowCompany) {
          return await apiEndpoints.companies.unfollowCompany(companyId, userId);
        } else {
          console.log("Using mock unfollowCompany implementation");
          return { success: true };
        }
      };
      
      if (isCompanyFollowed) {
        await unfollowCompany(job.company.id, profile.id);
        setSnackbarMessage(`Unfollowed ${job.company.name}`);
      } else {
        await followCompany(job.company.id, profile.id);
        setSnackbarMessage(`Now following ${job.company.name}`);
      }
      
      setIsCompanyFollowed(!isCompanyFollowed);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error toggling company follow:', err);
      setSnackbarMessage('Failed to update follow status');
      setSnackbarOpen(true);
    }
  };
  
  // Handle application form changes
  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle question answer changes
  const handleQuestionChange = (questionId, value) => {
    setApplicationForm(prev => ({
      ...prev,
      questions: {
        ...prev.questions,
        [questionId]: value
      }
    }));
  };
  
  // Submit job application
  const handleSubmitApplication = async () => {
    if (!profile?.id) {
      navigate('/login', { state: { from: `/jobs/${jobId}` } });
      return;
    }
    
    setApplicationStatus('submitting');
    setApplicationError(null);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setApplyProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);
    
    try {
      // Create mock function if it doesn't exist
      const applyToJob = async (applicationData) => {
        if (apiEndpoints.applications && apiEndpoints.applications.apply) {
          return await apiEndpoints.applications.apply(applicationData);
        } else {
          console.log("Using mock job application implementation");
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          return { success: true };
        }
      };
      
      // Submit application
      await applyToJob({
        jobId,
        userId: profile.id,
        ...applicationForm
      });
      
      setApplicationStatus('success');
      clearInterval(progressInterval);
      setApplyProgress(100);
      
      // Close dialog after delay
      setTimeout(() => {
        setApplicationDialogOpen(false);
        setSnackbarMessage('Application submitted successfully');
        setSnackbarOpen(true);
      }, 2000);
    } catch (err) {
      console.error('Error submitting application:', err);
      setApplicationStatus('error');
      setApplicationError('Failed to submit application. Please try again.');
      clearInterval(progressInterval);
      setApplyProgress(0);
    }
  };
  
  // Share job via email
  const handleShareJob = async () => {
    if (!shareEmail) {
      return;
    }
    
    try {
      // Create mock function if it doesn't exist
      const shareJobViaEmail = async (shareData) => {
        if (apiEndpoints.jobs.shareJob) {
          return await apiEndpoints.jobs.shareJob(shareData);
        } else {
          console.log("Using mock shareJob implementation");
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          return { success: true };
        }
      };
      
      await shareJobViaEmail({
        jobId,
        email: shareEmail,
        message: shareMessage,
        senderName: profile?.fullName || 'A friend'
      });
      
      setShareDialogOpen(false);
      setSnackbarMessage('Job shared successfully');
      setSnackbarOpen(true);
      
      // Reset fields
      setShareEmail('');
      setShareMessage('');
    } catch (err) {
      console.error('Error sharing job:', err);
      setSnackbarMessage('Failed to share job');
      setSnackbarOpen(true);
    }
  };
  
  // Report job listing
  const handleReportJob = async () => {
    if (!reportReason) {
      return;
    }
    
    try {
      // Create mock function if it doesn't exist
      const reportJobListing = async (reportData) => {
        if (apiEndpoints.jobs.reportJob) {
          return await apiEndpoints.jobs.reportJob(reportData);
        } else {
          console.log("Using mock reportJob implementation");
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          return { success: true };
        }
      };
      
      await reportJobListing({
        jobId,
        userId: profile?.id,
        reason: reportReason,
        details: reportDetails
      });
      
      setReportDialogOpen(false);
      setSnackbarMessage('Job listing reported. Thank you for your feedback.');
      setSnackbarOpen(true);
      
      // Reset fields
      setReportReason('');
      setReportDetails('');
    } catch (err) {
      console.error('Error reporting job:', err);
      setSnackbarMessage('Failed to submit report');
      setSnackbarOpen(true);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }
  
  if (!job) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Job not found</Alert>
        <Button 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/jobs')}
          sx={{ mt: 2 }}
        >
          Back to Job Search
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/dashboard" underline="hover">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/jobs" underline="hover">
          Jobs
        </Link>
        <Typography color="text.primary">
          {job.title}
        </Typography>
      </Breadcrumbs>
      
      <Grid container spacing={3}>
        {/* Main content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {job.title}
                </Typography>
                
                <Typography variant="h6" component="h2" color="primary" gutterBottom>
                  {job.company?.name}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {job.location}
                      {job.remote && ' • Remote'}
                    </Typography>
                  </Box>
                  
                  {job.salary && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">
                        {typeof job.salary === 'object' 
                          ? `${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} AED`
                          : job.salary}
                        {job.salaryPeriod && ` ${job.salaryPeriod}`}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Timer color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {job.employmentType || job.jobType || 'Not specified'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Timer color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      Posted {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Job Skills */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Skills
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {job.skills?.slice(0, 5).map(skill => (
                      <Chip 
                        key={skill} 
                        label={skill} 
                        variant="outlined"
                        color="primary"
                        size="small"
                      />
                    ))}
                    
                    {job.skills?.length > 5 && (
                      <Chip
                        label={`+${job.skills.length - 5}`}
                        variant="outlined"
                        color="default"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={handleToggleSaveJob} color={isSavedJob(job?.id) ? 'primary' : 'default'}>
                  {isSavedJob(job?.id) ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
                
                <IconButton onClick={() => setShareDialogOpen(true)}>
                  <Share />
                </IconButton>
                
                <IconButton onClick={(e) => setOptionsMenuAnchorEl(e.currentTarget)}>
                  <MoreVert />
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Send />}
                onClick={() => setApplicationDialogOpen(true)}
                fullWidth
                sx={{ mb: 2 }}
              >
                Apply Now
              </Button>
              
              <Typography variant="body2" color="text.secondary">
                Easy apply with your TamkeenAI Resume
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Button 
                startIcon={<ArrowBack />}
                onClick={() => navigate('/jobs')}
              >
                Back to Job Search
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab label="Job Description" />
              <Tab label="Company" />
              <Tab label="Fit Analysis" />
            </Tabs>
            
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Job Description
                </Typography>
                
                <Box sx={{ position: 'relative' }}>
                  <Box 
                    sx={{ 
                      maxHeight: showFullDescription ? 'none' : '300px', 
                      overflow: showFullDescription ? 'visible' : 'hidden',
                      mb: 2 
                    }}
                  >
                    <ReactMarkdown>
                      {job.description || 'No description available'}
                    </ReactMarkdown>
                  </Box>
                  
                  {!showFullDescription && job.description?.length > 500 && (
                    <Box 
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '80px',
                        background: 'linear-gradient(transparent, white)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-start',
                        pb: 1,
                        pl: 1
                      }}
                    >
                      <Button 
                        onClick={() => setShowFullDescription(true)}
                        endIcon={<KeyboardArrowDown />}
                      >
                        Show More
                      </Button>
                    </Box>
                  )}
                  
                  {showFullDescription && (
                    <Box sx={{ textAlign: 'left', mt: 2 }}>
                      <Button 
                        onClick={() => setShowFullDescription(false)}
                        endIcon={<KeyboardArrowUp />}
                      >
                        Show Less
                      </Button>
                    </Box>
                  )}
                </Box>
                
                {job.responsibilities && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Responsibilities
                    </Typography>
                    
                    <List>
                      {job.responsibilities.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircle color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {job.requirements && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Requirements
                    </Typography>
                    
                    <List>
                      {job.requirements.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircle color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {job.benefits && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Benefits
                    </Typography>
                    
                    <List>
                      {job.benefits.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircle color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box>
                {companyDetails ? (
                  <>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 3
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={companyDetails.logo} 
                          alt={companyDetails.name}
                          sx={{ width: 60, height: 60, mr: 2 }}
                        />
                        
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {companyDetails.name}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              <Business sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                              {companyDetails.industry}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary">
                              <Group sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                              {companyDetails.size || 'Unknown size'}
                            </Typography>
                            
                            {companyDetails.founded && (
                              <Typography variant="body2" color="text.secondary">
                                <Event sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                Founded {companyDetails.founded}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                      
                      <Button
                        variant={isCompanyFollowed ? 'outlined' : 'contained'}
                        startIcon={isCompanyFollowed ? <Check /> : <PersonAdd />}
                        onClick={handleToggleFollowCompany}
                        size="small"
                      >
                        {isCompanyFollowed ? 'Following' : 'Follow'}
                      </Button>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      {companyDetails.description}
                    </Typography>
                    
                    {companyDetails.website && (
                      <Button
                        variant="outlined"
                        startIcon={<Public />}
                        href={companyDetails.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ mt: 1 }}
                      >
                        Visit Website
                      </Button>
                    )}
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        More Jobs at {companyDetails.name}
                      </Typography>
                      
                      {companyDetails.jobs && companyDetails.jobs.length > 0 ? (
                        <List>
                          {companyDetails.jobs.slice(0, 3).map(job => (
                            <ListItem 
                              key={job.id}
                              component={RouterLink}
                              to={`/jobs/${job.id}`}
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' }
                              }}
                            >
                              <ListItemText 
                                primary={job.title}
                                secondary={
                                  <>
                                    <LocationOn sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                    {job.location}
                                    {job.remote && ' • Remote'}
                                    {' • '}
                                    Posted {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No other job listings available
                        </Typography>
                      )}
                      
                      {companyDetails.jobs?.length > 3 && (
                        <Button
                          component={RouterLink}
                          to={`/companies/${companyDetails.id}/jobs`}
                          sx={{ mt: 1 }}
                        >
                          View All Jobs
                        </Button>
                      )}
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No company information available
                  </Typography>
                )}
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Skills Match Analysis
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                      Overall Match
                    </Typography>
                    
                    <LinearProgress
                      variant="determinate"
                      value={skillsMatch.score}
                      color={
                        skillsMatch.score > 80 ? 'success' :
                        skillsMatch.score > 60 ? 'primary' :
                        skillsMatch.score > 40 ? 'warning' : 'error'
                      }
                      sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                    />
                    
                    <Typography variant="body1" sx={{ ml: 2, fontWeight: 'bold' }}>
                      {skillsMatch.score}%
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {skillsMatch.score > 80 
                      ? 'Excellent match! You have most of the required skills.'
                      : skillsMatch.score > 60
                      ? 'Good match. Consider developing a few more skills to be an ideal candidate.'
                      : skillsMatch.score > 40
                      ? 'Moderate match. You may need to develop several key skills for this role.'
                      : 'Limited match. This job requires skills that differ from your current profile.'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Matching Skills ({skillsMatch?.matching?.length || 0})
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {skillsMatch?.matching?.length > 0 ? (
                      skillsMatch.matching.map(skill => (
                        <Chip
                          key={skill}
                          label={skill}
                          color="success"
                          icon={<CheckCircle />}
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                        No matching skills found. Update your profile to reflect your abilities.
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Missing Skills ({skillsMatch?.missing?.length || 0})
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {skillsMatch?.missing?.length > 0 ? (
                      skillsMatch.missing.map(skill => (
                        <Chip
                          key={skill}
                          label={skill}
                          color="default"
                          icon={<RadioButtonUnchecked />}
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                        Congratulations! You have all the required skills for this job.
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Recommendations
                  </Typography>
                  
                  <List>
                    {skillsMatch?.missing?.length > 0 ? (
                      <>
                        <ListItem>
                          <ListItemIcon>
                            <MenuBook color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Develop Missing Skills" 
                            secondary={`Focus on learning ${skillsMatch.missing.slice(0, 3).join(', ')}${skillsMatch.missing?.length > 3 ? ' and others' : ''}`}
                            sx={{ textAlign: 'left' }}
                          />
                        </ListItem>
                        
                        <ListItem component={RouterLink} to="/learning">
                          <ListItemIcon>
                            <School color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Explore Courses" 
                            secondary="Find learning resources for these skills on our platform"
                            sx={{ textAlign: 'left' }}
                          />
                        </ListItem>
                      </>
                    ) : null}
                    
                    <ListItem>
                      <ListItemIcon>
                        <Assignment color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Update Your Resume" 
                        secondary="Highlight your matching skills and relevant experience"
                        sx={{ textAlign: 'left' }}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Psychology color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Prepare for Interview" 
                        secondary="Practice answering questions about your experience with these skills"
                        sx={{ textAlign: 'left' }}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Similar Jobs */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Similar Jobs
            </Typography>
            
            {similarJobs?.length > 0 ? (
              <List disablePadding>
                {similarJobs.slice(0, 5).map(job => (
                  <React.Fragment key={job.id}>
                    <ListItem
                      component={RouterLink}
                      to={`/jobs/${job.id}`}
                      sx={{ 
                        cursor: 'pointer',
                        px: 0,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemText
                        primary={job.title}
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              {job.company?.name}
                            </Typography>
                            <br />
                            <LocationOn sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                            {job.location}
                            {job.remote && ' • Remote'}
                          </>
                        }
                        sx={{ textAlign: 'left' }}
                      />
                    </ListItem>
                    {similarJobs.indexOf(job) < similarJobs.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No similar jobs found
              </Typography>
            )}
            
            {similarJobs?.length > 5 && (
              <Button 
                fullWidth
                sx={{ mt: 2, justifyContent: 'flex-start' }}
                component={RouterLink}
                to={`/jobs?similar=${jobId}`}
              >
                View All Similar Jobs
              </Button>
            )}
          </Paper>
          
          {/* Application Tips */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Application Tips
            </Typography>
            
            <List disablePadding>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <Assignment color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Customize Your Resume" 
                  secondary="Tailor your resume to highlight relevant skills and experience"
                  sx={{ textAlign: 'left' }}
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <Description color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Write a Compelling Cover Letter" 
                  secondary="Explain why you're a good fit for this specific role"
                  sx={{ textAlign: 'left' }}
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <Psychology color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Practice Interview Questions" 
                  secondary="Research common questions for this role and industry"
                  sx={{ textAlign: 'left' }}
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <Business color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Research the Company" 
                  secondary="Learn about their mission, values, and recent projects"
                  sx={{ textAlign: 'left' }}
                />
              </ListItem>
            </List>
            
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2, justifyContent: 'flex-start', textAlign: 'left', pl: 2 }}
              component={RouterLink}
              to="/resources/application-tips"
            >
              More Application Tips
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Application Dialog */}
      <Dialog
        open={applicationDialogOpen}
        onClose={() => applicationStatus !== 'submitting' && setApplicationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Apply for {job.title} at {job.company?.name}
        </DialogTitle>
        
        {applicationStatus === 'submitting' && (
          <LinearProgress 
            variant="determinate" 
            value={applyProgress} 
            sx={{ mb: applicationStatus === 'submitting' ? 0 : 2 }}
          />
        )}
        
        <DialogContent>
          {applicationStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {applicationError}
            </Alert>
          )}
          
          {applicationStatus === 'success' ? (
            <Box sx={{ textAlign: 'left', py: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2, display: 'block' }} />
              
              <Typography variant="h6" gutterBottom>
                Application Submitted Successfully!
              </Typography>
              
              <Typography variant="body1" paragraph>
                Your application for {job.title} at {job.company?.name} has been received.
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                You can check the status of your application in your dashboard.
              </Typography>
            </Box>
          ) : (
            <Box component="form">
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Resume</InputLabel>
                <Select
                  name="resumeId"
                  value={applicationForm.resumeId}
                  onChange={handleApplicationChange}
                  disabled={applicationStatus === 'submitting'}
                >
                  {resumes && resumes.length > 0 ? (
                    resumes.map(resume => (
                      <MenuItem key={resume.id} value={resume.id}>
                        {resume.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No resumes available</MenuItem>
                  )}
                </Select>
                
                {(!resumes || resumes.length === 0) && (
                  <FormHelperText error>
                    Please create a resume first
                    <Button 
                      component={RouterLink} 
                      to="/resume/new"
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      Create Resume
                    </Button>
                  </FormHelperText>
                )}
              </FormControl>
              
              <TextField
                label="Cover Letter"
                name="coverLetter"
                value={applicationForm.coverLetter}
                onChange={handleApplicationChange}
                multiline
                rows={6}
                fullWidth
                margin="normal"
                disabled={applicationStatus === 'submitting'}
                placeholder="Explain why you're a good fit for this position..."
              />
              
              <TextField
                label="Phone Number"
                name="phone"
                value={applicationForm.phone}
                onChange={handleApplicationChange}
                fullWidth
                margin="normal"
                disabled={applicationStatus === 'submitting'}
              />
              
              <TextField
                label="Availability"
                name="availability"
                value={applicationForm.availability}
                onChange={handleApplicationChange}
                fullWidth
                margin="normal"
                disabled={applicationStatus === 'submitting'}
                placeholder="When can you start? Are you available for interviews?"
              />
              
              <TextField
                label="How did you hear about this position?"
                name="referral"
                value={applicationForm.referral}
                onChange={handleApplicationChange}
                fullWidth
                margin="normal"
                disabled={applicationStatus === 'submitting'}
              />
              
              {job?.applicationQuestions?.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                    Additional Questions
                  </Typography>
                  
                  {job.applicationQuestions.map((question, index) => (
                    <TextField
                      key={index}
                      label={question.text}
                      name={`questions.${question.id}`}
                      value={applicationForm.questions[question.id] || ''}
                      onChange={handleApplicationChange}
                      fullWidth
                      margin="normal"
                      multiline={question.type === 'paragraph'}
                      rows={question.type === 'paragraph' ? 4 : 1}
                      required={question.required}
                      disabled={applicationStatus === 'submitting'}
                    />
                  ))}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'flex-start' }}>
          {applicationStatus === 'success' ? (
            <>
              <Button onClick={() => setApplicationDialogOpen(false)}>
                Close
              </Button>
              
              <Button 
                variant="contained" 
                onClick={() => navigate('/applications')}
              >
                View All Applications
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => applicationStatus !== 'submitting' && setApplicationDialogOpen(false)}
                disabled={applicationStatus === 'submitting'}
              >
                Cancel
              </Button>
              
              <Button 
                variant="contained"
                onClick={handleSubmitApplication}
                disabled={applicationStatus === 'submitting' || !applicationForm.resumeId || !resumes || resumes.length === 0}
                startIcon={applicationStatus === 'submitting' ? <CircularProgress size={20} /> : <Send />}
              >
                {applicationStatus === 'submitting' ? 'Submitting...' : 'Submit Application'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Share Job Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Share this Job
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Send this job opportunity to someone who might be interested
          </Typography>
          
          <TextField
            label="Recipient Email"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            fullWidth
            margin="normal"
            type="email"
          />
          
          <TextField
            label="Message (Optional)"
            value={shareMessage}
            onChange={(e) => setShareMessage(e.target.value)}
            multiline
            rows={4}
            fullWidth
            margin="normal"
            placeholder="Add a personal message..."
          />
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'flex-start' }}>
          <Button onClick={() => setShareDialogOpen(false)}>
            Cancel
          </Button>
          
          <Button 
            variant="contained"
            onClick={handleShareJob}
            disabled={!shareEmail}
            startIcon={<Send />}
          >
            Share
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Report Job Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Report this Job
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Please let us know why you're reporting this job listing
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Reason for reporting</InputLabel>
            <Select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <MenuItem value="spam">This is spam</MenuItem>
              <MenuItem value="scam">This seems like a scam</MenuItem>
              <MenuItem value="inappropriate">Inappropriate content</MenuItem>
              <MenuItem value="misleading">Misleading information</MenuItem>
              <MenuItem value="duplicate">Duplicate listing</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Additional Details"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            multiline
            rows={4}
            fullWidth
            margin="normal"
            placeholder="Please provide any additional information..."
          />
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'flex-start' }}>
          <Button onClick={() => setReportDialogOpen(false)}>
            Cancel
          </Button>
          
          <Button 
            variant="contained"
            color="error"
            onClick={handleReportJob}
            disabled={!reportReason}
            startIcon={<Flag />}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Options menu */}
      <Menu
        open={Boolean(optionsMenuAnchorEl)}
        anchorEl={optionsMenuAnchorEl}
        onClose={() => setOptionsMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setOptionsMenuAnchorEl(null);
          setShareDialogOpen(true);
        }}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Share Job" />
        </MenuItem>
        
        <MenuItem onClick={() => window.print()}>
          <ListItemIcon>
            <Print fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Print Job" />
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => {
            setOptionsMenuAnchorEl(null);
            setReportDialogOpen(true);
          }}
        >
          <ListItemIcon>
            <Flag fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Report Job" />
        </MenuItem>
      </Menu>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default JobDetails;