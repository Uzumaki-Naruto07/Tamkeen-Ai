import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Grid,
  TextField,
  Divider,
  Alert,
  AlertTitle,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Chip,
  useTheme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  LinkedIn as LinkedInIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
  Person as PersonIcon,
  LockPerson as LockPersonIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser, useResume } from '../context/AppContext';
import { JOB_ENDPOINTS } from '../utils/endpoints';

const LinkedInAutomation = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { profile } = useUser();
  const { currentResume } = useResume();
  
  // States
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [location, setLocation] = useState('');
  const [preferences, setPreferences] = useState({
    remoteOnly: false,
    easyApply: true,
    includeResume: true,
    includeCustomMessage: true
  });
  const [customMessage, setCustomMessage] = useState('');
  const [applicationResults, setApplicationResults] = useState(null);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [automationProgress, setAutomationProgress] = useState({
    status: 'idle',
    jobsFound: 0,
    jobsApplied: 0,
    currentJob: null,
    logs: []
  });
  const [showCompetitionDisclaimer, setShowCompetitionDisclaimer] = useState(true);

  // Pre-fill job title from profile if available
  useEffect(() => {
    if (profile?.currentTitle) {
      setJobTitle(profile.currentTitle);
    }
  }, [profile]);

  // Handle next step
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Handle preference change
  const handlePreferenceChange = (event) => {
    setPreferences({
      ...preferences,
      [event.target.name]: event.target.checked
    });
  };

  // Handle credentials change
  const handleCredentialsChange = (event) => {
    setCredentials({
      ...credentials,
      [event.target.name]: event.target.value
    });
  };

  // Log automation progress
  const logAutomationProgress = (message, type = 'info') => {
    setAutomationProgress(prev => ({
      ...prev,
      logs: [...prev.logs, { message, type, timestamp: new Date().toISOString() }]
    }));
  };

  // Simulated browser automation (for competition demo only)
  const simulateAutomation = async () => {
    try {
      setLoading(true);
      setError(null);
      setAutomationProgress({
        status: 'running',
        jobsFound: 0,
        jobsApplied: 0,
        currentJob: null,
        logs: []
      });

      // Log startup
      logAutomationProgress('Starting LinkedIn automation process...', 'info');
      logAutomationProgress('Initializing automation environment...', 'info');
      await delay(1500);
      
      // Log login attempt
      logAutomationProgress('Attempting to log in to LinkedIn...', 'info');
      await delay(2000);
      logAutomationProgress('Successfully logged in to LinkedIn', 'success');
      
      // Log search
      logAutomationProgress(`Searching for "${jobTitle}" jobs in "${location || 'Any Location'}"...`, 'info');
      await delay(2500);
      
      // Simulate finding jobs
      const jobsFound = Math.floor(Math.random() * 20) + 10; // 10-30 jobs
      setAutomationProgress(prev => ({ ...prev, jobsFound }));
      logAutomationProgress(`Found ${jobsFound} matching jobs`, 'success');
      
      // Simulate applying to jobs
      const jobsToApply = Math.min(jobsFound, Math.floor(Math.random() * 10) + 3); // 3-12 jobs to apply to
      
      for (let i = 0; i < jobsToApply; i++) {
        const jobTitle = generateJobTitle();
        const company = generateCompanyName();
        
        setAutomationProgress(prev => ({ 
          ...prev, 
          currentJob: { title: jobTitle, company, index: i + 1 } 
        }));
        
        logAutomationProgress(`Processing job ${i + 1}/${jobsToApply}: ${jobTitle} at ${company}`, 'info');
        await delay(1000);
        
        if (Math.random() > 0.2) { // 80% success rate
          logAutomationProgress(`Successfully applied to ${jobTitle} at ${company}`, 'success');
          setAutomationProgress(prev => ({ ...prev, jobsApplied: prev.jobsApplied + 1 }));
        } else {
          logAutomationProgress(`Could not apply to ${jobTitle} at ${company}: Complex application form detected`, 'warning');
        }
        
        await delay(1500);
      }
      
      // Complete process
      setAutomationProgress(prev => ({ ...prev, status: 'completed' }));
      logAutomationProgress('LinkedIn automation process completed', 'success');
      
      // Prepare results for display
      const results = {
        success: true,
        message: `Successfully applied to ${automationProgress.jobsApplied} jobs on LinkedIn.`,
        totalJobs: automationProgress.jobsFound,
        matchingJobs: Math.floor(automationProgress.jobsFound * 0.8),
        readyToApply: jobsToApply,
        alreadyApplied: Math.floor(Math.random() * 5),
        jobs: generateSampleJobs(jobsToApply, jobTitle, location)
      };
      
      setApplicationResults(results);
      handleNext();
    } catch (err) {
      console.error('Error in LinkedIn automation:', err);
      setError(err.message || 'Failed to automate LinkedIn applications');
      logAutomationProgress(`Error: ${err.message || 'Unknown error'}`, 'error');
      setAutomationProgress(prev => ({ ...prev, status: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // Simulate delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Generate sample job title
  const generateJobTitle = () => {
    const prefixes = ['Senior', 'Lead', 'Principal', 'Staff', ''];
    const roles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UX Designer'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const role = roles[Math.floor(Math.random() * roles.length)];
    return prefix ? `${prefix} ${role}` : role;
  };
  
  // Generate sample company name
  const generateCompanyName = () => {
    const companies = ['TechCorp', 'InnovateSoft', 'DigiSolutions', 'FutureTech', 'CloudWare', 'DataMinds', 'CodeNation', 'DevSphere', 'ByteWorks', 'AlgoLogic'];
    return companies[Math.floor(Math.random() * companies.length)];
  };
  
  // Generate sample jobs
  const generateSampleJobs = (count, jobTitle, location) => {
    const jobs = [];
    for (let i = 0; i < count; i++) {
      jobs.push({
        id: `job-${i + 1}`,
        title: i % 3 === 0 ? jobTitle : generateJobTitle(),
        company: generateCompanyName(),
        location: location || 'Remote',
        description: 'This job matches your search criteria and profile.',
        matchScore: Math.floor(Math.random() * 30) + 70, // 70-99 match score
        datePosted: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        applicationUrl: 'https://linkedin.com/jobs/view/example' + (i + 1),
        easyApply: Math.random() > 0.3 // 70% are Easy Apply
      });
    }
    return jobs;
  };

  // Handle form submit
  const handleSubmit = async () => {
    if (credentials.email && credentials.password) {
      await simulateAutomation();
    } else {
      setShowCredentialsDialog(true);
    }
  };

  // Handle API submission (used as fallback)
  const handleApiSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare API request
      const requestData = {
        jobTitle,
        jobDescription,
        location,
        preferences,
        customMessage,
        resumeId: currentResume?.id || null
      };

      // Call API endpoint
      const response = await fetch(JOB_ENDPOINTS.AUTOMATE_LINKEDIN_APPLICATION, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      setApplicationResults(data);
      handleNext();
    } catch (err) {
      console.error('Error automating LinkedIn applications:', err);
      setError(err.message || 'Failed to automate LinkedIn applications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Competition Disclaimer Dialog */}
      <Dialog
        open={showCompetitionDisclaimer}
        onClose={() => setShowCompetitionDisclaimer(false)}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            Competition Demonstration Only
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This LinkedIn automation feature is for <strong>competition demonstration purposes only</strong>. 
            It simulates the functionality of job automation tools without actually performing automated 
            actions on LinkedIn, which would violate their terms of service in a real-world application.
            <br /><br />
            No real automation or scraping of LinkedIn will occur - this is a visual demonstration 
            only for the competition judges.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCompetitionDisclaimer(false)} color="primary">
            I Understand
          </Button>
        </DialogActions>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog
        open={showCredentialsDialog}
        onClose={() => setShowCredentialsDialog(false)}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <LockPersonIcon sx={{ mr: 1 }} />
            LinkedIn Credentials
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter your LinkedIn credentials to automate the job application process.
            <br />
            <strong>Note:</strong> This is for demonstration purposes only. Credentials are not stored or used for actual authentication.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="email"
            label="LinkedIn Email"
            type="email"
            fullWidth
            variant="outlined"
            value={credentials.email}
            onChange={handleCredentialsChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="password"
            label="LinkedIn Password"
            type="password"
            fullWidth
            variant="outlined"
            value={credentials.password}
            onChange={handleCredentialsChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCredentialsDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            setShowCredentialsDialog(false);
            simulateAutomation();
          }} variant="contained" color="primary">
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 4,
            mb: 4,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LinkedInIcon
              sx={{ fontSize: 40, color: '#0A66C2', mr: 2 }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              LinkedIn Job Application Automation
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 4 }}>
            <AlertTitle>Competition Demo Feature</AlertTitle>
            This tool demonstrates automated LinkedIn job applications for the competition.
            It shows how automation could work without actually performing real actions on LinkedIn.
          </Alert>

          <Stepper activeStep={activeStep} orientation="vertical">
            {/* Step 1: Job Search Criteria */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Define Job Search Criteria</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Enter your job search criteria to find relevant positions on LinkedIn.
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Job Title"
                        variant="outlined"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        required
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Location"
                        variant="outlined"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Dubai, UAE"
                        margin="normal"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Job Description Keywords (optional)"
                        variant="outlined"
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        multiline
                        rows={3}
                        placeholder="Enter keywords to match in job descriptions"
                        margin="normal"
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                      disabled={!jobTitle}
                    >
                      Continue
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>

            {/* Step 2: Application Preferences */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Set Application Preferences</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Customize how you want to apply for jobs on LinkedIn.
                  </Typography>
                  
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={preferences.remoteOnly}
                          onChange={handlePreferenceChange}
                          name="remoteOnly"
                        />
                      }
                      label="Remote jobs only"
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={preferences.easyApply}
                          onChange={handlePreferenceChange}
                          name="easyApply"
                        />
                      }
                      label="LinkedIn Easy Apply jobs only"
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={preferences.includeResume}
                          onChange={handlePreferenceChange}
                          name="includeResume"
                        />
                      }
                      label="Include resume with applications"
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={preferences.includeCustomMessage}
                          onChange={handlePreferenceChange}
                          name="includeCustomMessage"
                        />
                      }
                      label="Include custom message with applications"
                    />
                  </Paper>
                  
                  {preferences.includeCustomMessage && (
                    <TextField
                      fullWidth
                      label="Custom Application Message"
                      variant="outlined"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      multiline
                      rows={4}
                      placeholder="Enter a personalized message to include with your applications"
                      margin="normal"
                    />
                  )}

                  <Box sx={{ mt: 3 }}>
                    <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Continue
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>

            {/* Step 3: Review & Submit */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Review & Start Automation</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Review your settings and start the LinkedIn automation process.
                  </Typography>
                  
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardHeader title="Job Search Criteria" />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Job Title:</Typography>
                          <Typography variant="body1">{jobTitle}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="subtitle2">Location:</Typography>
                          <Typography variant="body1">{location || 'Any'}</Typography>
                        </Grid>
                        {jobDescription && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2">Keywords:</Typography>
                            <Typography variant="body1">{jobDescription}</Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardHeader title="Application Preferences" />
                    <CardContent>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {preferences.remoteOnly && (
                          <Chip label="Remote Only" color="primary" size="small" />
                        )}
                        {preferences.easyApply && (
                          <Chip label="Easy Apply" color="primary" size="small" />
                        )}
                        {preferences.includeResume && (
                          <Chip label="Include Resume" color="primary" size="small" />
                        )}
                        {preferences.includeCustomMessage && (
                          <Chip label="Custom Message" color="primary" size="small" />
                        )}
                      </Box>
                      
                      {preferences.includeCustomMessage && customMessage && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2">Custom Message:</Typography>
                          <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                            <Typography variant="body2">{customMessage}</Typography>
                          </Paper>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <AlertTitle>Competition Demo Feature</AlertTitle>
                    This will demonstrate LinkedIn automation by simulating the process of logging in, 
                    searching for jobs, and applying. No actual LinkedIn actions will be performed.
                  </Alert>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Box sx={{ mt: 3 }}>
                    <Button onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      sx={{ mt: 1, mr: 1 }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={24} sx={{ mr: 1 }} />
                          Processing
                        </>
                      ) : (
                        'Start LinkedIn Automation'
                      )}
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>

            {/* Step 4: Automation Process (if step 3 is active, show this) */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Automation in Progress</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    LinkedIn automation is in progress. Please do not close this window.
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Progress Summary
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Status:</Typography>
                      <Chip 
                        label={
                          automationProgress.status === 'running' ? 'Running' :
                          automationProgress.status === 'completed' ? 'Completed' :
                          automationProgress.status === 'error' ? 'Error' : 'Idle'
                        }
                        color={
                          automationProgress.status === 'running' ? 'primary' :
                          automationProgress.status === 'completed' ? 'success' :
                          automationProgress.status === 'error' ? 'error' : 'default'
                        }
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Jobs Found:</Typography>
                      <Typography>{automationProgress.jobsFound}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Jobs Applied:</Typography>
                      <Typography>{automationProgress.jobsApplied}</Typography>
                    </Box>
                    {automationProgress.currentJob && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography>Current Job:</Typography>
                        <Typography>{automationProgress.currentJob.title} at {automationProgress.currentJob.company}</Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Automation Log
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                      {automationProgress.logs.map((log, index) => (
                        <Typography 
                          key={index} 
                          variant="body2" 
                          sx={{ 
                            color: 
                              log.type === 'success' ? 'success.main' :
                              log.type === 'error' ? 'error.main' :
                              log.type === 'warning' ? 'warning.main' : 'text.primary',
                            mb: 1
                          }}
                        >
                          [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                        </Typography>
                      ))}
                    </Paper>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                      disabled={automationProgress.status !== 'completed' && automationProgress.status !== 'error'}
                    >
                      {automationProgress.status === 'error' ? 'View Error Summary' : 'View Results'}
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>

            {/* Step 5: Results */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Automation Results</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    LinkedIn automation process has been completed.
                  </Typography>
                  
                  {applicationResults && (
                    <>
                      <Alert 
                        severity={applicationResults.success ? "success" : "warning"}
                        sx={{ mb: 3 }}
                      >
                        <AlertTitle>
                          {applicationResults.success 
                            ? "LinkedIn Automation Completed Successfully" 
                            : "Automation Completed with Some Issues"
                          }
                        </AlertTitle>
                        {applicationResults.message}
                      </Alert>
                      
                      <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardHeader title="Summary" />
                        <CardContent>
                          <Grid container spacing={2}>
                            <Grid item xs={6} md={3}>
                              <Typography variant="subtitle2">Jobs Found:</Typography>
                              <Typography variant="h6">{applicationResults.totalJobs || 0}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Typography variant="subtitle2">Matching Criteria:</Typography>
                              <Typography variant="h6">{applicationResults.matchingJobs || 0}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Typography variant="subtitle2">Applications Sent:</Typography>
                              <Typography variant="h6">{automationProgress.jobsApplied || 0}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                              <Typography variant="subtitle2">Already Applied:</Typography>
                              <Typography variant="h6">{applicationResults.alreadyApplied || 0}</Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>

                      <Typography variant="h6" gutterBottom>Applied Jobs</Typography>
                      
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>View All Applied Jobs ({automationProgress.jobsApplied})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List sx={{ width: '100%' }}>
                            {applicationResults.jobs?.slice(0, automationProgress.jobsApplied).map((job) => (
                              <ListItem key={job.id} sx={{ border: '1px solid', borderColor: 'divider', mb: 1, borderRadius: 1 }}>
                                <ListItemIcon>
                                  <WorkIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={job.title} 
                                  secondary={
                                    <>
                                      <Box component="span" sx={{ display: 'block' }}>
                                        <BusinessIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                        {job.company}
                                      </Box>
                                      <Box component="span" sx={{ display: 'block' }}>
                                        <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                        {job.location}
                                      </Box>
                                    </>
                                  } 
                                />
                                <Chip 
                                  label={`${job.matchScore}% Match`} 
                                  color={
                                    job.matchScore > 90 ? 'success' :
                                    job.matchScore > 80 ? 'primary' :
                                    job.matchScore > 70 ? 'info' : 'default'
                                  }
                                  sx={{ ml: 1 }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setActiveStep(0);
                            setApplicationResults(null);
                            setAutomationProgress({
                              status: 'idle',
                              jobsFound: 0,
                              jobsApplied: 0,
                              currentJob: null,
                              logs: []
                            });
                          }}
                        >
                          Start New Automation
                        </Button>
                        
                        <Button
                          variant="contained"
                          onClick={() => navigate('/job-search')}
                        >
                          Back to Job Search
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default LinkedInAutomation;