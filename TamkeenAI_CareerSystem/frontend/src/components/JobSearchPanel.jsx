import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Collapse,
  Tooltip,
  Autocomplete,
  Switch,
  FormControlLabel,
  Drawer,
  Slider,
  Badge,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  Menu,
  SvgIcon
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import FilterListIcon from '@mui/icons-material/FilterList';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TuneIcon from '@mui/icons-material/Tune';
import SendIcon from '@mui/icons-material/Send';
import ShareIcon from '@mui/icons-material/Share';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedIcon from '@mui/icons-material/Verified';
import PublicIcon from '@mui/icons-material/Public';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CloseIcon from '@mui/icons-material/Close';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { useUser, useResume } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const AEDIcon = (props) => (
  <SvgIcon {...props}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="12" fontWeight="bold">AED</text>
  </SvgIcon>
);

const JobSearchPanel = ({
  initialJobs = [],
  savedJobs = [],
  appliedJobs = [],
  onSearch,
  onSaveJob,
  onApplyJob,
  onViewJob,
  loading = false,
  error = null
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('all');
  const [experienceLevel, setExperienceLevel] = useState('all');
  const [salaryRange, setSalaryRange] = useState([0, 200000]);
  const [datePosted, setDatePosted] = useState('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Job listing state
  const [jobs, setJobs] = useState(initialJobs);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Records per page
  const itemsPerPage = 10;
  
  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [
    jobs,
    searchTerm,
    location,
    jobType,
    experienceLevel,
    salaryRange,
    datePosted,
    remoteOnly,
    activeTab
  ]);
  
  // Update jobs when initialJobs changes
  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);
  
  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({
        keywords: searchTerm,
        location,
        jobType,
        experienceLevel,
        salaryMin: salaryRange[0],
        salaryMax: salaryRange[1],
        datePosted,
        remoteOnly
      });
    } else {
      applyFilters();
    }
  };
  
  // Apply filters to the jobs
  const applyFilters = () => {
    let filtered = [...jobs];
    
    // Filter based on active tab
    if (activeTab === 1) { // Saved jobs
      filtered = filtered.filter(job => savedJobs.includes(job.id));
    } else if (activeTab === 2) { // Applied jobs
      filtered = filtered.filter(job => appliedJobs.includes(job.id));
    }
    
    // Apply search filters
    if (searchTerm) {
      const terms = searchTerm.toLowerCase().split(' ');
      filtered = filtered.filter(job => {
        const searchableText = `${job.title} ${job.company} ${job.description}`.toLowerCase();
        return terms.every(term => searchableText.includes(term));
      });
    }
    
    if (location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (jobType !== 'all') {
      filtered = filtered.filter(job => job.jobType === jobType);
    }
    
    if (experienceLevel !== 'all') {
      filtered = filtered.filter(job => job.experienceLevel === experienceLevel);
    }
    
    if (salaryRange[0] > 0 || salaryRange[1] < 200000) {
      filtered = filtered.filter(job => {
        // Handle cases where salary might be a range or a single value
        const jobMin = job.salaryMin || job.salary || 0;
        const jobMax = job.salaryMax || job.salary || 0;
        
        return (
          (jobMin >= salaryRange[0] && jobMin <= salaryRange[1]) ||
          (jobMax >= salaryRange[0] && jobMax <= salaryRange[1]) ||
          (jobMin <= salaryRange[0] && jobMax >= salaryRange[1])
        );
      });
    }
    
    if (datePosted !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (datePosted) {
        case 'today':
          cutoffDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.datePosted);
        return jobDate >= cutoffDate;
      });
    }
    
    if (remoteOnly) {
      filtered = filtered.filter(job => 
        job.remote === true || 
        job.workplaceType === 'remote' ||
        job.location.toLowerCase().includes('remote')
      );
    }
    
    setFilteredJobs(filtered);
    setPage(1);
  };
  
  // Handle job selection
  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setIsJobDetailOpen(true);
    if (onViewJob) {
      onViewJob(job.id);
    }
  };
  
  // Handle saving a job
  const handleSaveJob = (jobId) => {
    if (onSaveJob) {
      onSaveJob(jobId);
    }
  };
  
  // Handle applying for a job
  const handleApplyJob = (jobId) => {
    if (onApplyJob) {
      onApplyJob(jobId);
    }
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  // Format salary for display
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Not specified';
    
    const formatNumber = (num) => {
      if (num >= 1000) {
        return `$${(num/1000).toFixed(0)}k`;
      }
      return `$${num}`;
    };
    
    if (min && max) {
      return `${formatNumber(min)} - ${formatNumber(max)}`;
    } else if (min) {
      return `From ${formatNumber(min)}`;
    } else if (max) {
      return `Up to ${formatNumber(max)}`;
    }
  };
  
  // Calculate time since job posted
  const getTimeSincePosted = (dateString) => {
    const now = new Date();
    const postedDate = new Date(dateString);
    const diffTime = Math.abs(now - postedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
  };
  
  // Check if a job is saved
  const isJobSaved = (jobId) => {
    return savedJobs.includes(jobId);
  };
  
  // Check if a job is applied to
  const isJobApplied = (jobId) => {
    return appliedJobs.includes(jobId);
  };
  
  // Render job listings
  const renderJobListings = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (filteredJobs.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No jobs found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your search criteria or filters
          </Typography>
        </Box>
      );
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);
    
    return (
      <>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Showing {Math.min(startIndex + 1, filteredJobs.length)} to {Math.min(endIndex, filteredJobs.length)} of {filteredJobs.length} jobs
        </Typography>
        
        {paginatedJobs.map((job) => (
          <Card 
            key={job.id} 
            variant="outlined" 
            sx={{ 
              mb: 2,
              '&:hover': {
                boxShadow: 2
              },
              borderLeft: isJobSaved(job.id) ? `4px solid ${theme.palette.primary.main}` : 'none'
            }}
          >
            <CardContent sx={{ pb: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={8}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    {job.companyLogo ? (
                      <Box 
                        component="img" 
                        src={job.companyLogo} 
                        alt={job.company}
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          mr: 2,
                          objectFit: 'contain',
                          borderRadius: 1
                        }}
                      />
                    ) : (
                      <BusinessIcon sx={{ fontSize: 40, mr: 2, color: 'text.secondary' }} />
                    )}
                    <Box>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          cursor: 'pointer',
                          fontWeight: 500,
                          '&:hover': { 
                            color: 'primary.main' 
                          }
                        }}
                        onClick={() => handleJobSelect(job)}
                      >
                        {job.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.company}
                        {job.companyVerified && (
                          <Tooltip title="Verified Employer">
                            <VerifiedIcon color="primary" sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'middle' }} />
                          </Tooltip>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                    <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                    {getTimeSincePosted(job.datePosted)}
                  </Typography>
                  {job.urgent && (
                    <Chip 
                      size="small" 
                      color="error" 
                      label="Urgent" 
                      sx={{ mt: 0.5 }} 
                    />
                  )}
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {job.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WorkOutlineIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {job.jobType}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AEDIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {job.salaryRange}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" noWrap={!job.expanded}>
                  {job.description}
                </Typography>
              </Box>
              
              {job.skills && job.skills.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {job.skills.slice(0, 3).map((skill, index) => (
                    <Chip 
                      key={index}
                      label={skill}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                  {job.skills.length > 3 && (
                    <Chip 
                      label={`+${job.skills.length - 3}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                </Box>
              )}
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', px: 2, py: 1 }}>
              <Box>
                {isJobApplied(job.id) ? (
                  <Chip 
                    size="small" 
                    color="success" 
                    icon={<CheckCircleIcon />} 
                    label="Applied" 
                  />
                ) : (
                  <Button 
                    size="small" 
                    variant="contained"
                    onClick={() => handleApplyJob(job.id)}
                    startIcon={<SendIcon />}
                  >
                    Apply
                  </Button>
                )}
              </Box>
              <Box>
                <Tooltip title={isJobSaved(job.id) ? "Remove from saved" : "Save job"}>
                  <IconButton 
                    size="small"
                    onClick={() => handleSaveJob(job.id)}
                    color={isJobSaved(job.id) ? "primary" : "default"}
                  >
                    {isJobSaved(job.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="View details">
                  <IconButton 
                    size="small"
                    onClick={() => handleJobSelect(job)}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardActions>
          </Card>
        ))}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={Math.ceil(filteredJobs.length / itemsPerPage)} 
            page={page} 
            onChange={handlePageChange} 
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      </>
    );
  };
  
  // Render job details dialog
  const renderJobDetails = () => {
    if (!selectedJob) return null;
    
    return (
      <Dialog
        open={isJobDetailOpen}
        onClose={() => setIsJobDetailOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          pr: 1
        }}>
          <Typography variant="h6">{selectedJob.title}</Typography>
          <IconButton onClick={() => setIsJobDetailOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                {selectedJob.companyLogo ? (
                  <Box 
                    component="img" 
                    src={selectedJob.companyLogo} 
                    alt={selectedJob.company}
                    sx={{ 
                      width: 60, 
                      height: 60, 
                      mr: 2,
                      objectFit: 'contain',
                      borderRadius: 1
                    }}
                  />
                ) : (
                  <BusinessIcon sx={{ fontSize: 60, mr: 2, color: 'text.secondary' }} />
                )}
                <Box>
                  <Typography variant="h6">{selectedJob.company}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedJob.industry}
                    {selectedJob.companyVerified && (
                      <Tooltip title="Verified Employer">
                        <VerifiedIcon color="primary" sx={{ fontSize: 14, ml: 0.5, verticalAlign: 'middle' }} />
                      </Tooltip>
                    )}
                  </Typography>
                </Box>
              </Box>
            
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Job Description</Typography>
                <Typography variant="body1" paragraph>
                  {selectedJob.description}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Requirements</Typography>
                <List disablePadding>
                  {selectedJob.requirements && selectedJob.requirements.map((req, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircleIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={req} />
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              {selectedJob.responsibilities && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Responsibilities</Typography>
                  <List disablePadding>
                    {selectedJob.responsibilities.map((resp, index) => (
                      <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <CheckCircleIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={resp} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {selectedJob.benefits && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Benefits</Typography>
                  <Grid container spacing={1}>
                    {selectedJob.benefits.map((benefit, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <ListItem disablePadding>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={benefit} />
                        </ListItem>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Job Details</Typography>
                  
                  <List disablePadding>
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <LocationOnIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Location" 
                        secondary={selectedJob.location} 
                      />
                    </ListItem>
                    
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <WorkOutlineIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Job Type" 
                        secondary={selectedJob.jobType} 
                      />
                    </ListItem>
                    
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <AEDIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Salary" 
                        secondary={formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)} 
                      />
                    </ListItem>
                    
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <CalendarTodayIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Date Posted" 
                        secondary={new Date(selectedJob.datePosted).toLocaleDateString()} 
                      />
                    </ListItem>
                    
                    <ListItem disablePadding sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        <BusinessIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Company Size" 
                        secondary={selectedJob.companySize || 'Not specified'} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
              
              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Required Skills</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedJob.skills.map((skill, index) => (
                        <Chip 
                          key={index}
                          label={skill}
                          size="small"
                          sx={{ my: 0.5 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button 
                  variant="outlined"
                  startIcon={isJobSaved(selectedJob.id) ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  onClick={() => handleSaveJob(selectedJob.id)}
                  color={isJobSaved(selectedJob.id) ? "primary" : "inherit"}
                >
                  {isJobSaved(selectedJob.id) ? "Saved" : "Save"}
                </Button>
                
                <Button 
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={() => handleApplyJob(selectedJob.id)}
                  disabled={isJobApplied(selectedJob.id)}
                >
                  {isJobApplied(selectedJob.id) ? "Applied" : "Apply Now"}
                </Button>
              </Box>
              
              {selectedJob.matchScore !== undefined && (
                <Alert 
                  severity="info" 
                  icon={<TipsAndUpdatesIcon />}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="body2">
                    <strong>{selectedJob.matchScore}% match</strong> with your profile
                  </Typography>
                </Alert>
              )}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <Box>
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Job Search
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find your dream job from thousands of opportunities
          </Typography>
        </Box>
        
        <form onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                placeholder="Job title, keywords, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="medium"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                placeholder="City, state, or remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon />
                    </InputAdornment>
                  ),
                }}
                size="medium"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                disabled={loading}
              >
                Search
              </Button>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              startIcon={showFilters ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="small"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            
            <FormControlLabel
              control={
                <Switch
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  size="small"
                />
              }
              label="Remote Only"
            />
          </Box>
          
          <Collapse in={showFilters}>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Job Type</InputLabel>
                    <Select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      label="Job Type"
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="full-time">Full-time</MenuItem>
                      <MenuItem value="part-time">Part-time</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="temporary">Temporary</MenuItem>
                      <MenuItem value="internship">Internship</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Experience Level</InputLabel>
                    <Select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
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
                
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Date Posted</InputLabel>
                    <Select
                      value={datePosted}
                      onChange={(e) => setDatePosted(e.target.value)}
                      label="Date Posted"
                    >
                      <MenuItem value="all">Anytime</MenuItem>
                      <MenuItem value="today">Today</MenuItem>
                      <MenuItem value="week">Past Week</MenuItem>
                      <MenuItem value="month">Past Month</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" gutterBottom>
                    Salary Range
                  </Typography>
                  <Slider
                    value={salaryRange}
                    onChange={(e, newValue) => setSalaryRange(newValue)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `$${value.toLocaleString()}`}
                    min={0}
                    max={200000}
                    step={10000}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      ${salaryRange[0].toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ${salaryRange[1].toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </form>
      </Paper>
      
      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SearchIcon sx={{ mr: 1 }} />
                <Typography>Search Results</Typography>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge badgeContent={savedJobs.length} color="primary">
                  <BookmarkIcon sx={{ mr: 1 }} />
                </Badge>
                <Typography>Saved Jobs</Typography>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge badgeContent={appliedJobs.length} color="primary">
                  <SendIcon sx={{ mr: 1 }} />
                </Badge>
                <Typography>Applied Jobs</Typography>
              </Box>
            } 
          />
        </Tabs>
      </Box>
      
      <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
        {renderJobListings()}
      </Paper>
      
      {renderJobDetails()}
    </Box>
  );
};

export default JobSearchPanel; 