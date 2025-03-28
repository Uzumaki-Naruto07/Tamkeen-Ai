import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Grid,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControlLabel,
  Checkbox,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Divider,
  LinearProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Tooltip,
  Snackbar,
  FormHelperText,
  ListItem,
  ListItemText,
  List,
  useTheme,
  Container,
  FormGroup
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Check as CheckIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  AutoAwesome as AutoAwesomeIcon,
  History as HistoryIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  NotificationsActive as NotificationsActiveIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useUser, useResume } from './AppContext';
import apiEndpoints from '../utils/endpoints';

// Import mock data
import { jobApplicationsMock, automationSettingsMock } from '../utils/app-mocks';

// UAE Emirates for selection
const EMIRATES = [
  'Abu Dhabi',
  'Dubai',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah'
];

// UAE job platforms
const JOB_PLATFORMS = [
  { name: 'Bayt.com', logo: '🌐', enabled: true, color: '#0d47a1' },
  { name: 'GulfTalent', logo: '🌐', enabled: true, color: '#00838f' },
  { name: 'Indeed UAE', logo: '🌐', enabled: true, color: '#2e7d32' },
  { name: 'Naukrigulf', logo: '🌐', enabled: true, color: '#c62828' },
  { name: 'Monster Gulf', logo: '🌐', enabled: true, color: '#6a1b9a' },
  // LinkedIn is mentioned here but not automated due to policy restrictions
  { name: 'LinkedIn', logo: '🌐', enabled: false, color: '#0277bd', disclaimer: true }
];

// Styled components
const PlatformCard = styled(Card)(({ theme, active, platformColor }) => ({
  cursor: 'pointer',
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  border: active ? `2px solid ${platformColor || theme.palette.primary.main}` : '1px solid transparent',
  boxShadow: active ? theme.shadows[4] : theme.shadows[1],
  opacity: active ? 1 : 0.7,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-5px)',
    opacity: 1
  }
}));

const ActiveBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -10,
  right: -10,
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
  borderRadius: '50%',
  padding: theme.spacing(0.5),
  zIndex: 1,
  boxShadow: theme.shadows[2]
}));

const JobApplicationAutomation = () => {
  const theme = useTheme();
  const { profile } = useUser();
  const { currentResume } = useResume();
  
  // State variables
  const [activeStep, setActiveStep] = useState(0);
  const [selectedEmirateIndex, setSelectedEmirateIndex] = useState(1); // Default to Dubai
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [platforms, setPlatforms] = useState(JOB_PLATFORMS);
  const [workPreferences, setWorkPreferences] = useState({
    remoteWork: true,
    inPersonWork: true,
    relocation: false,
    assessments: true,
    backgroundChecks: true,
    drugTests: false
  });
  const [credentials, setCredentials] = useState({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [applicationHistory, setApplicationHistory] = useState([]);
  const [automationSettings, setAutomationSettings] = useState(null);
  
  // Fetch application history
  useEffect(() => {
    const fetchApplicationHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiEndpoints.jobs.GET_APPLICATIONS);
        if (!response.ok) {
          throw new Error(`Error fetching application history: ${response.statusText}`);
        }
        const data = await response.json();
        setApplicationHistory(data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching application history:', err);
        setLoading(false);
      }
    };
    
    fetchApplicationHistory();
  }, []);

  // Fetch automation settings
  useEffect(() => {
    // Simulate API call with mock data
    const fetchAutomationSettings = async () => {
      try {
        // Simulate network delay
        setTimeout(() => {
          setAutomationSettings(automationSettingsMock);
        }, 500);
      } catch (err) {
        console.error('Error fetching automation settings:', err);
      }
    };
    
    fetchAutomationSettings();
  }, []);
  
  // Pre-fill job title from profile if available
  useEffect(() => {
    if (profile?.currentTitle) {
      setJobTitle(profile.currentTitle);
    }
  }, [profile]);
  
  // Toggle platform selection
  const togglePlatform = (index) => {
    const updatedPlatforms = [...platforms];
    // Don't allow toggling LinkedIn (as per GitHub disclaimer)
    if (updatedPlatforms[index].name === 'LinkedIn') {
      setSnackbarMessage('LinkedIn automation is not available due to platform policy restrictions');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }
    updatedPlatforms[index] = {
      ...updatedPlatforms[index],
      enabled: !updatedPlatforms[index].enabled
    };
    setPlatforms(updatedPlatforms);
  };
  
  // Handle credential changes
  const handleCredentialChange = (platform, field, value) => {
    setCredentials({
      ...credentials,
      [platform]: {
        ...credentials[platform],
        [field]: value
      }
    });
  };
  
  // Handle work preference changes
  const handleWorkPreferenceChange = (preference) => {
    setWorkPreferences({
      ...workPreferences,
      [preference]: !workPreferences[preference]
    });
  };
  
  // Go to next step
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  // Go to previous step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Reset the form
  const handleReset = () => {
    setActiveStep(0);
    setSelectedEmirateIndex(1);
    setJobTitle('');
    setJobDescription('');
    setPlatforms(JOB_PLATFORMS);
    setWorkPreferences({
      remoteWork: true,
      inPersonWork: true,
      relocation: false,
      assessments: true,
      backgroundChecks: true,
      drugTests: false
    });
    setCredentials({});
    setResults(null);
    setError(null);
  };
  
  // Start the automation process
  const handleStartAutomation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Make sure we have a resume
      if (!currentResume) {
        throw new Error('Please upload a resume first');
      }
      
      // Get enabled platforms
      const enabledPlatforms = platforms.filter(p => p.enabled);
      if (enabledPlatforms.length === 0) {
        throw new Error('Please select at least one job platform');
      }
      
      // Validate credentials for enabled platforms
      const missingCredentials = enabledPlatforms.filter(
        p => !credentials[p.name] || !credentials[p.name].username || !credentials[p.name].password
      );
      
      if (missingCredentials.length > 0) {
        throw new Error(`Missing credentials for: ${missingCredentials.map(p => p.name).join(', ')}`);
      }
      
      // Prepare API request data
      const requestData = {
        cv_text: currentResume.text,
        user_profile: {
          name: profile?.name || '',
          email: profile?.email || '',
          phone: profile?.phone || '',
          job_title: jobTitle,
          location: EMIRATES[selectedEmirateIndex],
          preferences: workPreferences
        },
        settings: {
          job_description: jobDescription,
          auto_apply: true,
          skip_complex_applications: true,
          platforms: enabledPlatforms.map(p => p.name)
        },
        platform_credentials: credentials
      };
      
      // Make API call to automate job applications
      const response = await fetch(apiEndpoints.jobs.AUTOMATE_APPLICATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      setResults(responseData.data);
      setLoading(false);
      
      // Update application history with the new results (if needed)
      if (responseData.data.job_matches) {
        const newApplications = responseData.data.job_matches.map((match, index) => ({
          id: `new-app-${index}`,
          jobTitle: match.jobTitle,
          company: match.company,
          location: "Dubai, UAE",
          appliedDate: new Date().toISOString().split('T')[0],
          status: "Applied",
          matchScore: match.matchScore,
          platform: enabledPlatforms[0].name,
          responseRate: "Pending",
          estimatedResponse: "7-10 days"
        }));
        
        setApplicationHistory([...newApplications, ...applicationHistory]);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Close snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };
  
  // Toggle settings dialog
  const handleToggleSettingsDialog = () => {
    setOpenSettingsDialog(!openSettingsDialog);
  };
  
  // Toggle history dialog
  const handleToggleHistoryDialog = () => {
    setOpenHistoryDialog(!openHistoryDialog);
  };
  
  // Steps for the stepper
  const steps = [
    {
      label: 'Select Job Details',
      description: 'Enter your preferred job title and location',
      content: (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer, Marketing Manager"
                required
                helperText="Enter the job title you want to search for"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="emirate-select-label">Emirate</InputLabel>
                <Select
                  labelId="emirate-select-label"
                  value={selectedEmirateIndex}
                  label="Emirate"
                  onChange={(e) => setSelectedEmirateIndex(e.target.value)}
                >
                  {EMIRATES.map((emirate, index) => (
                    <MenuItem key={index} value={index}>{emirate}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select the emirate where you want to work</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Job Description Keywords (Optional)"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="e.g. React, Node.js, 3 years experience"
                helperText="Enter keywords to better match job descriptions (optional)"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: 'Select Platforms & Preferences',
      description: 'Choose job platforms and specify your work preferences',
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Select Job Platforms
          </Typography>
          <Grid container spacing={2}>
            {platforms.map((platform, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <PlatformCard 
                  active={platform.enabled} 
                  platformColor={platform.color}
                  onClick={() => togglePlatform(index)}
                >
                  {platform.enabled && (
                    <ActiveBadge>
                      <CheckIcon fontSize="small" />
                    </ActiveBadge>
                  )}
                  <CardHeader
                    avatar={
                      <Typography variant="h5" component="span">
                        {platform.logo}
                      </Typography>
                    }
                    title={platform.name}
                    titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
                  />
                  <CardContent>
                    {platform.disclaimer ? (
                      <Alert severity="info" sx={{ mb: 1 }}>
                        Automation not available due to platform policies
                      </Alert>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {platform.enabled ? 'Selected for automation' : 'Click to select'}
                      </Typography>
                    )}
                  </CardContent>
                </PlatformCard>
              </Grid>
            ))}
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Work Preferences
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={workPreferences.remoteWork}
                    onChange={() => handleWorkPreferenceChange('remoteWork')}
                    color="primary"
                  />
                }
                label="Remote Work"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={workPreferences.inPersonWork}
                    onChange={() => handleWorkPreferenceChange('inPersonWork')}
                    color="primary"
                  />
                }
                label="In-Person Work"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={workPreferences.relocation}
                    onChange={() => handleWorkPreferenceChange('relocation')}
                    color="primary"
                  />
                }
                label="Open to Relocation"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={workPreferences.assessments}
                    onChange={() => handleWorkPreferenceChange('assessments')}
                    color="primary"
                  />
                }
                label="Willing to Complete Assessments"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={workPreferences.backgroundChecks}
                    onChange={() => handleWorkPreferenceChange('backgroundChecks')}
                    color="primary"
                  />
                }
                label="Willing to Undergo Background Checks"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={workPreferences.drugTests}
                    onChange={() => handleWorkPreferenceChange('drugTests')}
                    color="primary"
                  />
                }
                label="Willing to Undergo Drug Tests"
              />
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: 'Platform Credentials',
      description: 'Provide login credentials for selected platforms (optional)',
      content: (
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Providing platform credentials allows for complete automation. If not provided, the system will still search
              for jobs but you'll need to complete the application process manually.
            </Typography>
          </Alert>
          
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Your credentials are only used during the automation process and are not stored permanently.
            </Typography>
          </Alert>
          
          {platforms.filter(p => p.enabled && !p.disclaimer).map((platform, index) => (
            <Accordion key={index} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<KeyboardArrowDownIcon />}>
                <Typography>{platform.name} Credentials</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Username/Email"
                      value={credentials[platform.name]?.username || ''}
                      onChange={(e) => handleCredentialChange(platform.name, 'username', e.target.value)}
                      placeholder={`Your ${platform.name} username or email`}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="password"
                      label="Password"
                      value={credentials[platform.name]?.password || ''}
                      onChange={(e) => handleCredentialChange(platform.name, 'password', e.target.value)}
                      placeholder={`Your ${platform.name} password`}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Note: Even without providing login credentials, the system will create a detailed plan for your job search on these platforms.
          </Typography>
        </Box>
      )
    },
    {
      label: 'Results & Summary',
      description: 'View the results of your automated job applications',
      content: (
        <Box sx={{ mt: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Processing your applications...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This may take a few minutes as we search and apply to jobs on your behalf.
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : results ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h6" gutterBottom>
                Application Summary
              </Typography>
              
              <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Job Title:</strong> {jobTitle}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body1">
                      <strong>Location:</strong> {EMIRATES[selectedEmirateIndex]}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      <strong>Platforms:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {platforms.filter(p => p.enabled).map((platform, index) => (
                        <Chip key={index} label={platform.name} color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
              
              <Typography variant="h6" gutterBottom>
                Applications Results
              </Typography>
              
              {results.applications?.length > 0 ? (
                <List>
                  {results.applications.map((application, index) => (
                    <Paper key={index} sx={{ mb: 2, overflow: 'hidden' }}>
                      <ListItem
                        secondaryAction={
                          <Chip 
                            label={application.status} 
                            color={application.status === "Applied" ? "success" : "error"}
                          />
                        }
                      >
                        <ListItemText
                          primary={`${application.job_title} at ${application.company}`}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="text.primary">
                                {application.platform}
                              </Typography>
                              {" — "}{application.notes}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    </Paper>
                  ))}
                </List>
              ) : (
                <Alert severity="info">
                  No applications were submitted. This could be due to login failures or no matching jobs found.
                </Alert>
              )}
              
              {results.application_strategy && (
                <React.Fragment>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Personalized Application Strategy
                  </Typography>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" component="div">
                      <div dangerouslySetInnerHTML={{ __html: results.application_strategy.replace(/\n/g, '<br />') }} />
                    </Typography>
                  </Paper>
                </React.Fragment>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleReset}
                  startIcon={<RefreshIcon />}
                  sx={{ mr: 2 }}
                >
                  Start New Search
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setOpenHistoryDialog(true)}
                  startIcon={<HistoryIcon />}
                >
                  View Application History
                </Button>
              </Box>
            </motion.div>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AutoAwesomeIcon />}
                onClick={handleStartAutomation}
              >
                Start Automation
              </Button>
            </Box>
          )}
        </Box>
      )
    }
  ];
  
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Job Application Automation
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Automate your job applications across multiple platforms. 
          Please provide your credentials for each platform you want to use.
        </Typography>
        
        {/* Demo Mode Disclaimer */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: 'warning.light' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            COMPETITION DEMONSTRATION MODE
          </Typography>
          <Typography variant="body2">
            LinkedIn automation is included for demonstration purposes only as part of this competition entry.
            The actual production version would respect LinkedIn's policies and not include automation for their platform.
          </Typography>
        </Paper>

        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <form onSubmit={handleStartAutomation}>
                <Typography variant="h6" gutterBottom>Job Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Job Title/Keywords"
                      name="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      required
                      margin="normal"
                      helperText="Position or skills you're looking for"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <Select
                        value={selectedEmirateIndex}
                        onChange={(e) => setSelectedEmirateIndex(e.target.value)}
                        name="selectedEmirateIndex"
                        displayEmpty
                        required
                      >
                        <MenuItem value="" disabled>
                          <em>Select Location</em>
                        </MenuItem>
                        {EMIRATES.map((emirate) => (
                          <MenuItem key={emirate} value={EMIRATES.indexOf(emirate)}>
                            {emirate}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>Select Platforms</Typography>
                <FormGroup>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={platforms.find(p => p.name === 'Bayt.com')?.enabled} 
                            onChange={() => togglePlatform(platforms.findIndex(p => p.name === 'Bayt.com'))} 
                          />
                        }
                        label="Bayt.com"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={platforms.find(p => p.name === 'GulfTalent')?.enabled} 
                            onChange={() => togglePlatform(platforms.findIndex(p => p.name === 'GulfTalent'))} 
                          />
                        }
                        label="GulfTalent"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={platforms.find(p => p.name === 'Indeed UAE')?.enabled} 
                            onChange={() => togglePlatform(platforms.findIndex(p => p.name === 'Indeed UAE'))} 
                          />
                        }
                        label="Indeed UAE"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={platforms.find(p => p.name === 'Naukrigulf')?.enabled} 
                            onChange={() => togglePlatform(platforms.findIndex(p => p.name === 'Naukrigulf'))} 
                          />
                        }
                        label="Naukrigulf"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={platforms.find(p => p.name === 'Monster Gulf')?.enabled} 
                            onChange={() => togglePlatform(platforms.findIndex(p => p.name === 'Monster Gulf'))} 
                          />
                        }
                        label="Monster Gulf"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={platforms.find(p => p.name === 'LinkedIn')?.enabled} 
                            onChange={() => togglePlatform(platforms.findIndex(p => p.name === 'LinkedIn'))} 
                          />
                        }
                        label="LinkedIn (Demo Only)"
                      />
                      <Typography variant="caption" color="error">
                        For competition demo
                      </Typography>
                    </Grid>
                  </Grid>
                </FormGroup>

                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>Platform Credentials</Typography>
                
                {platforms.filter(p => p.enabled && !p.disclaimer).map((platform, index) => 
                  p.name === 'LinkedIn' ? (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ textTransform: 'capitalize' }}>
                        {platform.name} {platform.name === 'LinkedIn' && '(Demo Only)'}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Username/Email"
                            value={credentials[platform.name]?.username || ''}
                            onChange={(e) => handleCredentialChange(platform.name, 'username', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={credentials[platform.name]?.password || ''}
                            onChange={(e) => handleCredentialChange(platform.name, 'password', e.target.value)}
                            required
                            helperText="Credentials are not stored permanently"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ textTransform: 'capitalize' }}>
                        {platform.name} {platform.name === 'LinkedIn' && '(Demo Only)'}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Username/Email"
                            value={credentials[platform.name]?.username || ''}
                            onChange={(e) => handleCredentialChange(platform.name, 'username', e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={credentials[platform.name]?.password || ''}
                            onChange={(e) => handleCredentialChange(platform.name, 'password', e.target.value)}
                            required
                            helperText="Credentials are not stored permanently"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )
                )}

                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" gutterBottom>Work Preferences</Typography>
                <FormGroup>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={workPreferences.remoteWork}
                            onChange={() => handleWorkPreferenceChange('remoteWork')}
                          />
                        }
                        label="Remote Work"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={workPreferences.inPersonWork}
                            onChange={() => handleWorkPreferenceChange('inPersonWork')}
                          />
                        }
                        label="In-Person Work"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={workPreferences.relocation}
                            onChange={() => handleWorkPreferenceChange('relocation')}
                          />
                        }
                        label="Open to Relocation"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={workPreferences.assessments}
                            onChange={() => handleWorkPreferenceChange('assessments')}
                          />
                        }
                        label="Will Complete Assessments"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={workPreferences.backgroundChecks}
                            onChange={() => handleWorkPreferenceChange('backgroundChecks')}
                          />
                        }
                        label="Will Undergo Background Checks"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={workPreferences.drugTests}
                            onChange={() => handleWorkPreferenceChange('drugTests')}
                          />
                        }
                        label="Will Undergo Drug Tests"
                      />
                    </Grid>
                  </Grid>
                </FormGroup>

                <Box mt={4} display="flex" justifyContent="center">
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    size="large"
                    disabled={loading || !platforms.some(p => p.enabled)}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Start Automated Applications'}
                  </Button>
                </Box>
              </form>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Application Results
              </Typography>
              
              {loading && (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                  <CircularProgress />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    Applying to jobs. This may take a few minutes...
                  </Typography>
                </Box>
              )}
              
              {error && (
                <Box display="flex" alignItems="center" sx={{ color: 'error.main', mb: 2 }}>
                  <ErrorIcon sx={{ mr: 1 }} />
                  <Typography variant="body1">{error}</Typography>
                </Box>
              )}
              
              {results && (
                <Box>
                  <Box display="flex" alignItems="center" sx={{ color: 'success.main', mb: 2 }}>
                    <CheckCircleIcon sx={{ mr: 1 }} />
                    <Typography variant="body1">
                      Successfully applied to {results.total_applications} jobs
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom>Platforms:</Typography>
                  <Typography variant="body2" paragraph>
                    {results.platforms_accessed.join(', ')}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>Application Strategy:</Typography>
                  {Object.entries(results.application_strategy).map(([platform, strategy]) => (
                    <Box key={platform} sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                        {platform}:
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {strategy}
                      </Typography>
                    </Box>
                  ))}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>Applications:</Typography>
                  {results.applications.map((app, index) => (
                    <Box key={index} sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {app.job_title}
                      </Typography>
                      <Typography variant="body2">{app.company}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {app.platform} • {app.status} • {app.location}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              
              {!loading && !results && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Application History:</Typography>
                  {applicationHistory.length > 0 ? (
                    applicationHistory.map((app, index) => (
                      <Box key={index} sx={{ mb: 2, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {app.job_title}
                        </Typography>
                        <Typography variant="body2">{app.company}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {app.platform} • {app.status} • {app.location}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Applied: {new Date(app.date_applied).toLocaleDateString()}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No previous applications found.
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

 export default JobApplicationAutomation;
