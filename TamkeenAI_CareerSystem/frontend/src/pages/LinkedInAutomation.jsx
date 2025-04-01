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
  LockPerson as LockPersonIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser, useResume } from '../context/AppContext';
import { JOB_ENDPOINTS } from '../utils/endpoints';
import axios from 'axios';
import { alpha } from '@mui/material/styles';

function LinkedinAutomation() {
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
    
    // Pre-fill location from profile if available
    if (profile?.location) {
      setLocation(profile.location);
    }
    
    // Pre-fill custom message from resume summary if available
    if (currentResume?.summary) {
      setCustomMessage(`Dear Hiring Manager,\n\nI'm excited to apply for the {position} role at {company}. ${currentResume.summary}\n\nI believe my background in ${profile?.currentTitle || 'this field'} makes me a strong candidate for this position.\n\nThank you for your consideration,\n${profile?.fullName || 'Your Name'}`);
    }
  }, [profile, currentResume]);

  // Extract skills from resume for matching
  const extractSkillsFromResume = () => {
    const skills = [];
    
    // Get skills from resume if available
    if (currentResume?.skills && currentResume.skills.length > 0) {
      skills.push(...currentResume.skills.map(skill => skill.name || skill));
    }
    
    // Get skills from profile if available
    if (profile?.skills && profile.skills.length > 0) {
      skills.push(...profile.skills.filter(skill => !skills.includes(skill)));
    }
    
    return skills;
  };

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
      logAutomationProgress('Starting LinkedIn automation SIMULATION...', 'info');
      logAutomationProgress('⚠️ This is a DEMONSTRATION ONLY - no actual LinkedIn actions will be performed', 'warning');
      logAutomationProgress('Initializing simulation environment...', 'info');
      await delay(1500);
      
      // Log login attempt
      logAutomationProgress('SIMULATING login to LinkedIn (no actual login occurs)...', 'info');
      await delay(2000);
      logAutomationProgress('✓ Simulated login successful (demonstration only)', 'success');
      
      // Log search
      logAutomationProgress(`SIMULATING search for "${jobTitle}" jobs in "${location || 'Any Location'}" (no actual search occurs)...`, 'info');
      await delay(2500);
      
      // Simulate finding jobs
      const jobsFound = Math.floor(Math.random() * 20) + 10; // 10-30 jobs
      setAutomationProgress(prev => ({ ...prev, jobsFound }));
      logAutomationProgress(`✓ Simulation found ${jobsFound} matching jobs (demonstration only)`, 'success');
      
      // Simulate filtering for Easy Apply jobs
      logAutomationProgress('SIMULATING filter for "Easy Apply" jobs only...', 'info');
      await delay(1200);
      const easyApplyJobs = Math.floor(jobsFound * 0.6); // About 60% of jobs are Easy Apply
      logAutomationProgress(`✓ Simulation found ${easyApplyJobs} Easy Apply jobs (demonstration only)`, 'success');
      
      // Simulate checking for blacklisted companies
      logAutomationProgress('SIMULATING check for blacklisted companies in job listings...', 'info');
      await delay(1000);
      const blacklistedCount = Math.floor(Math.random() * 3);
      if (blacklistedCount > 0) {
        logAutomationProgress(`⚠️ Simulation found ${blacklistedCount} jobs from blacklisted companies - these will be skipped`, 'warning');
      } else {
        logAutomationProgress('✓ No jobs from blacklisted companies found', 'success');
      }
      
      // Simulate checking for keyword matches
      logAutomationProgress('SIMULATING check for required skills in job descriptions...', 'info');
      await delay(1500);
      logAutomationProgress('✓ Processing complete - ready to begin applications', 'success');
      
      // Simulate applying to jobs
      const jobsToApply = Math.min(easyApplyJobs, Math.floor(Math.random() * 10) + 3); // 3-12 jobs to apply to
      
      logAutomationProgress('⚠️ SIMULATING job applications (no actual applications will be submitted)', 'warning');
      
      for (let i = 0; i < jobsToApply; i++) {
        const jobTitle = generateJobTitle();
        const company = generateCompanyName();
        
        setAutomationProgress(prev => ({ 
          ...prev, 
          currentJob: { title: jobTitle, company, index: i + 1 } 
        }));
        
        logAutomationProgress(`SIMULATING application ${i + 1}/${jobsToApply}: ${jobTitle} at ${company} (demonstration only)`, 'info');
        await delay(500);
        
        // Simulate opening job listing
        logAutomationProgress(`→ Opening job listing for ${jobTitle}...`, 'info');
        await delay(800);
        
        // Simulate analyzing job description
        logAutomationProgress('→ Analyzing job description for key skills and requirements...', 'info');
        await delay(1000);
        
        // Use skills from user's resume and profile for matching
        const userSkills = extractSkillsFromResume();
        const jobSkills = userSkills.length > 0 
          ? userSkills.slice(0, Math.min(5, userSkills.length))  // Use up to 5 actual skills
          : ['React', 'JavaScript', 'TypeScript', 'Node.js', 'AWS']; // Fallback to default skills
        
        const matchingSkills = jobSkills.filter(() => Math.random() > 0.3);
        if (matchingSkills.length > 0) {
          logAutomationProgress(`✓ Found matching skills: ${matchingSkills.join(', ')}`, 'success');
        }
        
        // Simulate clicking Easy Apply button
        logAutomationProgress('→ Clicking "Easy Apply" button...', 'info');
        await delay(600);
        
        // Simulate form filling
        logAutomationProgress('→ Filling application form fields...', 'info');
        await delay(1200);
        
        // Simulate different form types
        const questionTypes = [
          'Experience questions',
          'Dropdown selections',
          'Radio button choices',
          'Checkbox confirmations',
          'Text field entries',
          'Cover letter upload',
          'Resume customization'
        ];
        
        // Randomly select 2-4 question types
        const selectedTypes = [];
        while (selectedTypes.length < Math.floor(Math.random() * 3) + 2) {
          const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
          if (!selectedTypes.includes(randomType)) {
            selectedTypes.push(randomType);
          }
        }
        
        // Simulate answering each question type
        for (const type of selectedTypes) {
          logAutomationProgress(`→ Processing ${type}...`, 'info');
          await delay(800);
          logAutomationProgress(`✓ Completed ${type}`, 'success');
        }
        
        // Simulate resume customization
        if (Math.random() > 0.6) {
          logAutomationProgress('→ Customizing resume based on job requirements...', 'info');
          await delay(1500);
          logAutomationProgress('✓ Resume customized to highlight relevant skills', 'success');
        }
        
        // Simulate application result
        if (Math.random() > 0.2) { // 80% success rate
          logAutomationProgress(`✓ Simulated application to ${jobTitle} at ${company} SUCCESSFUL (NO REAL APPLICATION SUBMITTED)`, 'success');
          setAutomationProgress(prev => ({ ...prev, jobsApplied: prev.jobsApplied + 1 }));
        } else {
          // Simulate different failure reasons
          const failureReasons = [
            'Complex form detected requiring manual input',
            'Additional assessment required',
            'Multiple-step application process detected',
            'Company website redirect detected'
          ];
          const reason = failureReasons[Math.floor(Math.random() * failureReasons.length)];
          logAutomationProgress(`⚠️ Simulated application to ${jobTitle} at ${company} failed: ${reason} (demonstration only)`, 'warning');
        }
        
        await delay(1000);
      }
      
      // Complete process
      setAutomationProgress(prev => ({ ...prev, status: 'completed' }));
      logAutomationProgress('LinkedIn automation SIMULATION completed', 'success');
      logAutomationProgress('⚠️ IMPORTANT: No actual LinkedIn applications were submitted - this was only a demonstration', 'warning');
      logAutomationProgress(`Summary: Successfully simulated ${automationProgress.jobsApplied} applications out of ${jobsToApply} attempted`, 'info');
      
      // Prepare results for display
      const results = {
        success: true,
        message: `Demonstration simulated applying to ${automationProgress.jobsApplied} jobs on LinkedIn (no actual applications were submitted).`,
        totalJobs: automationProgress.jobsFound,
        matchingJobs: Math.floor(automationProgress.jobsFound * 0.8),
        readyToApply: jobsToApply,
        alreadyApplied: Math.floor(Math.random() * 5),
        jobs: generateSampleJobs(jobsToApply, jobTitle, location)
      };
      
      setApplicationResults(results);
      handleNext();
    } catch (err) {
      console.error('Error in LinkedIn automation simulation:', err);
      setError(err.message || 'Failed to simulate LinkedIn applications');
      logAutomationProgress(`Error in simulation: ${err.message || 'Unknown error'}`, 'error');
      setAutomationProgress(prev => ({ ...prev, status: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate random delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Generate realistic job titles based on the search term
  const generateJobTitle = () => {
    const prefixes = ['Senior', 'Lead', 'Principal', 'Staff', 'Junior', 'Associate', ''];
    const suffixes = ['Engineer', 'Developer', 'Specialist', 'Consultant', 'Manager', 'Architect'];
    const technologies = ['Frontend', 'Backend', 'Full Stack', 'UI/UX', 'Web', 'Mobile', 'Cloud', 'DevOps'];
    
    // Use the search term if available, otherwise generate random job title
    if (jobTitle) {
      // 70% chance to use the exact search term
      if (Math.random() < 0.7) {
        return jobTitle;
      }
      
      // 30% chance to add a prefix or suffix
      const randomPrefix = Math.random() < 0.5 ? prefixes[Math.floor(Math.random() * prefixes.length)] : '';
      const randomSuffix = Math.random() < 0.5 ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
      
      if (randomPrefix && randomSuffix) {
        return `${randomPrefix} ${jobTitle} ${randomSuffix}`;
      } else if (randomPrefix) {
        return `${randomPrefix} ${jobTitle}`;
      } else if (randomSuffix) {
        return `${jobTitle} ${randomSuffix}`;
      } else {
        return jobTitle;
      }
    }
    
    // Generate completely random job title if no search term
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const technology = technologies[Math.floor(Math.random() * technologies.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix} ${technology} ${suffix}`.trim();
  };
  
  // Generate realistic company names
  const generateCompanyName = () => {
    const prefixes = ['Tech', 'Global', 'Digital', 'Cyber', 'Smart', 'Next', 'Future', 'Meta', 'Quantum', 'Cloud'];
    const roots = ['Sys', 'Soft', 'Tech', 'Code', 'Data', 'Web', 'Net', 'Logic', 'Ware', 'Byte'];
    const suffixes = ['Corp', 'Inc', 'Systems', 'Solutions', 'Technologies', 'Group', 'Labs', 'Works', 'AI', 'IO'];
    
    // Generate two-part names (e.g., "TechSys")
    if (Math.random() < 0.4) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const root = roots[Math.floor(Math.random() * roots.length)];
      return `${prefix}${root}`;
    }
    
    // Generate three-part names (e.g., "Global Tech Solutions")
    if (Math.random() < 0.7) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const root = roots[Math.floor(Math.random() * roots.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
      return `${prefix} ${root} ${suffix}`;
    }
    
    // Generate well-known tech company-like names
    const wellKnownPrefixes = ['Blue', 'Red', 'Green', 'Black', 'Silver', 'Gold', 'Bright', 'Clear'];
    const wellKnownSuffixes = ['Wave', 'Scale', 'Shift', 'Spark', 'Stream', 'Space', 'Path', 'Link', 'Forge'];
    
    const prefix = wellKnownPrefixes[Math.floor(Math.random() * wellKnownPrefixes.length)];
    const suffix = wellKnownSuffixes[Math.floor(Math.random() * wellKnownSuffixes.length)];
    
    return `${prefix}${suffix}`;
  };
  
  // Generate sample jobs
  const generateSampleJobs = (count, jobTitle, location) => {
    const jobs = [];
    const userSkills = extractSkillsFromResume();
    
    for (let i = 0; i < count; i++) {
      // Generate a random subset of the user's skills for each job
      const jobRequiredSkills = userSkills.length > 0 
        ? userSkills.filter(() => Math.random() > 0.4) // Randomly select ~60% of skills
        : ['JavaScript', 'React', 'Communication']; // Default fallback
        
      // Calculate a realistic match score based on the user's profile
      let matchScore = 70; // Base score
      
      // Better match if job title matches user's current title
      if (profile?.currentTitle && jobTitle && 
          profile.currentTitle.toLowerCase().includes(jobTitle.toLowerCase())) {
        matchScore += 10;
      }
      
      // Better match if location matches
      if (profile?.location && location && 
          profile.location.toLowerCase().includes(location.toLowerCase())) {
        matchScore += 5;
      }
      
      // Add some randomness (±10 points)
      matchScore += Math.floor(Math.random() * 20) - 10;
      
      // Ensure score is between 70-99
      matchScore = Math.min(99, Math.max(70, matchScore));
      
      jobs.push({
        id: `job-${i + 1}`,
        title: i % 3 === 0 ? jobTitle : generateJobTitle(),
        company: generateCompanyName(),
        location: location || profile?.location || 'Remote',
        description: `This position requires skills in: ${jobRequiredSkills.join(', ')}`,
        requiredSkills: jobRequiredSkills,
        matchScore: matchScore,
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
      {/* Add a prominent demo banner */}
      <Box 
        sx={{ 
          backgroundColor: 'warning.main', 
          color: 'warning.contrastText', 
          p: 2, 
          mb: 2,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <WarningIcon sx={{ mr: 1 }} />
        <Typography variant="h6" align="center">
          DEMONSTRATION MODE ONLY - NO ACTUAL LINKEDIN AUTOMATION WILL OCCUR
        </Typography>
      </Box>

      {/* Competition Disclaimer Dialog */}
      <Dialog
        open={showCompetitionDisclaimer}
        onClose={() => setShowCompetitionDisclaimer(false)}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            Important Notice: Demonstration Mode Only
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography paragraph>
              This LinkedIn automation feature is for <strong>competition demonstration purposes only</strong>. 
              It visually simulates how automation tools might work but <strong>does not</strong> perform any actual 
              automation on LinkedIn.
            </Typography>
            <Typography paragraph>
              <strong>Important:</strong> Automating LinkedIn actions would violate their terms of service. 
              This demonstration is intentionally designed to <strong>prevent any real applications</strong> from being submitted.
            </Typography>
            <Typography paragraph>
              No LinkedIn data will be accessed, no automation will be performed, and no job applications 
              will be submitted. This is purely a visual simulation for educational purposes.
            </Typography>
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
            Simulated Credentials (Demonstration Only)
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ 
            backgroundColor: 'info.light', 
            p: 2, 
            mb: 2, 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'info.main'
          }}>
            <Typography variant="subtitle2" gutterBottom>
              ⚠️ DEMONSTRATION MODE - NOT REAL AUTHENTICATION
            </Typography>
            <Typography variant="body2">
              These credentials are only used for simulation purposes. 
              No actual LinkedIn authentication will occur. You can enter any text.
            </Typography>
          </Box>
        
          <DialogContentText sx={{ mb: 2 }}>
            Enter demonstration credentials below. These will only be used in the simulation
            and are not sent to LinkedIn or stored anywhere.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            name="email"
            label="Simulated LinkedIn Email (any text)"
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
            label="Simulated Password (any text)"
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
            Continue Simulation
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
                <Typography variant="h6">
                  <SettingsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Configure Automation Settings
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Customize how the automation simulation will run:
                  </Typography>
                  
                  <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: alpha(theme.palette.background.paper, 0.7) }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Application Filters
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={preferences.easyApply}
                              onChange={handlePreferenceChange}
                              name="easyApply"
                              color="primary"
                            />
                          }
                          label="Easy Apply jobs only"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={preferences.remoteOnly}
                              onChange={handlePreferenceChange}
                              name="remoteOnly"
                              color="primary"
                            />
                          }
                          label="Remote jobs only"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 1 }}>
                          Job Description Filters
                        </Typography>
                        
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Required Keywords (comma separated)"
                          placeholder="react, javascript, frontend"
                          margin="normal"
                        />
                        
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Blacklisted Keywords (comma separated)"
                          placeholder="php, wordpress, salesforce"
                          margin="normal"
                        />
                        
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Blacklisted Companies (comma separated)"
                          placeholder="company1, company2"
                          margin="normal"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                  
                  <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: alpha(theme.palette.background.paper, 0.7) }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Application Settings
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={preferences.includeResume}
                              onChange={handlePreferenceChange}
                              name="includeResume"
                              color="primary"
                            />
                          }
                          label="Attach resume"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={preferences.includeCustomMessage}
                              onChange={handlePreferenceChange}
                              name="includeCustomMessage"
                              color="primary"
                            />
                          }
                          label="Include cover letter"
                        />
                      </Grid>
                      
                      {preferences.includeCustomMessage && (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            label="Default Cover Letter Template"
                            placeholder="Enter your default cover letter text. Use {company} and {position} as placeholders."
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            The simulation will use AI to customize this template for each job application.
                          </Typography>
                        </Grid>
                      )}
                      
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              color="primary"
                            />
                          }
                          label="Follow companies after applying"
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              color="primary"
                            />
                          }
                          label="Auto-customize resume based on job description"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                  
                  <Paper elevation={2} sx={{ p: 2, backgroundColor: alpha(theme.palette.background.paper, 0.7) }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      Common Application Questions
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Years of Experience"
                          placeholder={profile?.yearsOfExperience?.toString() || "5"}
                          defaultValue={profile?.yearsOfExperience?.toString() || ""}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Expected Salary"
                          placeholder={profile?.expectedSalary?.toString() || "80000"}
                          defaultValue={profile?.expectedSalary?.toString() || ""}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Notice Period (days)"
                          placeholder={profile?.noticePeriod?.toString() || "14"}
                          defaultValue={profile?.noticePeriod?.toString() || ""}
                          margin="normal"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          label="Current City"
                          placeholder={profile?.location || "New York"}
                          defaultValue={profile?.location || ""}
                          margin="normal"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                  
                  <Box sx={{ 
                    backgroundColor: 'info.light', 
                    p: 2, 
                    mt: 3, 
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'info.main'
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      ⚠️ SIMULATION DISCLAIMER
                    </Typography>
                    <Typography variant="body2">
                      This is a simulation only. These settings will be used to demonstrate what automation could look like, 
                      but no actual LinkedIn automation will occur.
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Continue
                    </Button>
                    <Button
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  </div>
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
                  
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardHeader 
                      title="Skills From Your Resume" 
                      subheader="These skills will be used to match you with relevant jobs"
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {extractSkillsFromResume().map((skill, index) => (
                          <Chip 
                            key={index}
                            label={skill} 
                            color={index % 3 === 0 ? 'primary' : index % 3 === 1 ? 'secondary' : 'default'} 
                            size="small" 
                          />
                        ))}
                        {extractSkillsFromResume().length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            No skills found in your resume. Default skills will be used for matching.
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <AlertTitle>Competition Demo Feature</AlertTitle>
                    This will demonstrate LinkedIn automation by simulating the process of logging in, 
                    searching for jobs, and applying. No actual LinkedIn actions will be performed.
                  </Alert>

                  <Alert severity="error" sx={{ mb: 3 }}>
                    <AlertTitle>Terms of Service Compliance</AlertTitle>
                    <Typography paragraph>
                      <strong>Important:</strong> This demonstration intentionally prevents any real applications to 
                      LinkedIn to comply with their terms of service which prohibit automated actions.
                    </Typography>
                    <Typography paragraph>
                      In a real application, any automation of LinkedIn would require explicit permission 
                      and compliance with their API terms.
                    </Typography>
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
                      startIcon={loading ? <CircularProgress size={24} /> : <PlayArrowIcon />}
                    >
                      {loading ? 'Processing' : 'Start LinkedIn Automation Simulation'}
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>

            {/* Step 4: Simulation in Progress */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Simulation in Progress</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Demonstration of LinkedIn automation is in progress. This is a visual simulation only.
                  </Typography>
                  
                  {/* Add simulation badge */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 3,
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: 'warning.light',
                    border: '1px dashed',
                    borderColor: 'warning.main'
                  }}>
                    <Typography variant="body1" fontWeight="bold">
                      🎬 SIMULATION MODE - No Real LinkedIn Actions Are Being Performed
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Simulation Progress
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
                      Simulation Log
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
                      {automationProgress.status === 'error' ? 'View Error Summary' : 'View Simulation Results'}
                    </Button>
                  </Box>
                </Box>
              </StepContent>
            </Step>

            {/* Step 5: Results */}
            <Step>
              <StepLabel>
                <Typography variant="h6">Simulation Results</Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    LinkedIn automation simulation has been completed.
                  </Typography>
                  
                  {/* Add demo badge */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mb: 3,
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: 'info.light',
                    border: '1px dashed',
                    borderColor: 'info.main'
                  }}>
                    <Typography variant="body1" fontWeight="bold">
                      🔍 DEMONSTRATION RESULTS - No Real LinkedIn Applications Were Submitted
                    </Typography>
                  </Box>
                  
                  {applicationResults && (
                    <>
                      <Alert 
                        severity={applicationResults.success ? "success" : "warning"}
                        sx={{ mb: 3 }}
                      >
                        <AlertTitle>
                          {applicationResults.success 
                            ? "Demonstration Completed Successfully" 
                            : "Demonstration Completed with Issues"
                          }
                        </AlertTitle>
                        <Typography paragraph>
                          <strong>SIMULATION ONLY:</strong> {applicationResults.message}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Note: No real LinkedIn applications were submitted during this demonstration.
                        </Typography>
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
                                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                                        <Box component="span" sx={{ display: 'block', mt: 1 }}>
                                          <CodeIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                          <Typography variant="caption" component="span">
                                            Skills: {job.requiredSkills.slice(0, 3).join(', ')}
                                            {job.requiredSkills.length > 3 && ` +${job.requiredSkills.length - 3} more`}
                                          </Typography>
                                        </Box>
                                      )}
                                    </>
                                  } 
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                  <Chip 
                                    label={`${job.matchScore}% Match`} 
                                    color={
                                      job.matchScore > 90 ? 'success' :
                                      job.matchScore > 80 ? 'primary' :
                                      job.matchScore > 70 ? 'info' : 'default'
                                    }
                                    sx={{ mb: 1 }}
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    Applied {new Date().toLocaleDateString()}
                                  </Typography>
                                </Box>
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
                          Start New Simulation
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
                  
                  {/* Add final disclaimer */}
                  <Box sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Competition Demonstration Disclaimer
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      This demonstration shows what automation could look like, but intentionally prevents real 
                      LinkedIn automation to comply with their Terms of Service. In a real application, any interaction 
                      with LinkedIn would require manual user actions or proper API authorization. This simulation is for 
                      educational purposes only.
                    </Typography>
                  </Box>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </Paper>
      </motion.div>
    </Container>
  );
}

export default LinkedinAutomation;