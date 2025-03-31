import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Autocomplete,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Collapse,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Work,
  LocationOn,
  Business,
  Language,
  Add,
  RemoveCircleOutline,
  FindReplace,
  Tune,
  AssignmentTurnedIn,
  Sync,
  CheckCircle,
  Error as ErrorIcon,
  CompareArrows,
  LibraryAdd,
  TrendingUp,
  ArrowUpward,
  InsertChart,
  Lightbulb
} from '@mui/icons-material';
import apiEndpoints from '../utils/api';

/**
 * JobSpecificCustomization component helps users customize their resume for specific job applications
 */
const JobSpecificCustomization = ({
  resumeData,
  onSaveCustomizations,
  loading = false
}) => {
  const theme = useTheme();
  const [jobPostings, setJobPostings] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [customizedResume, setCustomizedResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [loadingCustomization, setLoadingCustomization] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [customizationOptions, setCustomizationOptions] = useState({
    replaceKeywords: true,
    reorderSections: true,
    enhanceRelevantExperience: true,
    adjustSkills: true,
    customizeSummary: true
  });
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [saveJobInHistory, setSaveJobInHistory] = useState(true);
  
  // Fetch saved job postings when component mounts
  useEffect(() => {
    if (!loading) {
      fetchSavedJobs();
    }
  }, [loading]);
  
  // Update customized resume when job selection changes
  useEffect(() => {
    if (selectedJob && resumeData) {
      customizeResumeForJob();
    }
  }, [selectedJob, customizationOptions]);
  
  const fetchSavedJobs = async () => {
    setLoadingJobs(true);
    
    try {
      const response = await apiEndpoints.jobs.getSavedJobs();
      setJobPostings(response.data || []);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      
      // Mock data for development
      const mockJobs = generateMockJobs();
      setJobPostings(mockJobs);
    } finally {
      setLoadingJobs(false);
    }
  };
  
  const searchJobs = async () => {
    if (!jobSearchQuery.trim()) return;
    
    setLoadingJobs(true);
    
    try {
      const response = await apiEndpoints.jobs.search(jobSearchQuery);
      setJobPostings(response.data || []);
    } catch (err) {
      console.error('Error searching jobs:', err);
      setError('Failed to search for jobs. Please try again.');
      
      // Mock data for development
      const mockJobs = generateMockJobs().filter(
        job => job.title.toLowerCase().includes(jobSearchQuery.toLowerCase())
      );
      setJobPostings(mockJobs);
    } finally {
      setLoadingJobs(false);
    }
  };
  
  const customizeResumeForJob = async () => {
    if (!selectedJob || !resumeData) return;
    
    setLoadingCustomization(true);
    setError(null);
    
    try {
      // Use the job description textarea if filled, otherwise use the selected job description
      const jobDesc = jobDescription.trim() 
        ? jobDescription.trim() 
        : selectedJob.description || '';
      
      const response = await apiEndpoints.resumes.customizeForJob({
        resumeId: resumeData.id,
        jobId: selectedJob.id,
        jobDescription: jobDesc,
        options: customizationOptions
      });
      
      setCustomizedResume(response.data.customizedResume);
      setAnalysisData(response.data.analysis);
    } catch (err) {
      console.error('Error customizing resume:', err);
      setError('Failed to customize resume. Please try again.');
      
      // Generate mock customized resume for development
      const mockCustomized = generateMockCustomizedResume(resumeData, selectedJob);
      setCustomizedResume(mockCustomized.customizedResume);
      setAnalysisData(mockCustomized.analysis);
    } finally {
      setLoadingCustomization(false);
    }
  };
  
  const handleJobInputChange = (event, value) => {
    setSelectedJob(value);
    
    if (value?.description) {
      setJobDescription(value.description);
    } else {
      setJobDescription('');
    }
    
    if (value?.url) {
      setJobUrl(value.url);
    } else {
      setJobUrl('');
    }
  };
  
  const handleJobSearchQueryChange = (event) => {
    setJobSearchQuery(event.target.value);
  };
  
  const handleManualJobDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };
  
  const handleToggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };
  
  const handleOptionChange = (option) => {
    setCustomizationOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  const handleSaveCustomizations = async () => {
    if (!customizedResume) return;
    
    try {
      await onSaveCustomizations(customizedResume, {
        jobId: selectedJob?.id,
        saveJob: saveJobInHistory
      });
    } catch (err) {
      console.error('Error saving customized resume:', err);
      setError('Failed to save customized resume. Please try again.');
    }
  };
  
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJobDescription(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      setError('Failed to access clipboard. Please paste the job description manually.');
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading job customization tools...
        </Typography>
      </Box>
    );
  }
  
  if (!resumeData) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Please select a resume to customize for specific jobs.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <Work sx={{ mr: 1, color: theme.palette.primary.main }} />
          Job-Specific Resume Customization
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select or Enter Job Information
            </Typography>
            
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-end' }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                label="Search Jobs"
                value={jobSearchQuery}
                onChange={handleJobSearchQueryChange}
                sx={{ mr: 1 }}
              />
              <Button 
                variant="contained"
                onClick={searchJobs}
                disabled={loadingJobs}
              >
                Search
              </Button>
            </Box>
            
            <Autocomplete
              options={jobPostings}
              loading={loadingJobs}
              getOptionLabel={(option) => option.title}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box>
                    <Typography variant="body1">{option.title}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {option.company} • {option.location}
                    </Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Select a Job Posting" 
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingJobs ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
              onChange={handleJobInputChange}
              value={selectedJob}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="subtitle2" gutterBottom>
              Job Description
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Button 
                size="small"
                startIcon={<LibraryAdd />}
                onClick={handlePasteFromClipboard}
              >
                Paste from Clipboard
              </Button>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={8}
              variant="outlined"
              placeholder="Paste the job description here"
              value={jobDescription}
              onChange={handleManualJobDescriptionChange}
              sx={{ mb: 2 }}
            />
            
            {jobUrl && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Language sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                <Typography 
                  variant="body2" 
                  component="a" 
                  href={jobUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ wordBreak: 'break-all' }}
                >
                  {jobUrl}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mb: 2 }}>
              <Button 
                variant="outlined"
                startIcon={showAdvancedOptions ? <Tune /> : <Tune />}
                onClick={handleToggleAdvancedOptions}
                fullWidth
                sx={{ justifyContent: 'flex-start' }}
              >
                {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
              </Button>
            </Box>
            
            <Collapse in={showAdvancedOptions}>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Customization Options
                </Typography>
                <List dense disablePadding>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <FindReplace fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Replace Keywords" 
                      secondary="Use job description keywords in your resume"
                    />
                    <Switch
                      edge="end"
                      checked={customizationOptions.replaceKeywords}
                      onChange={() => handleOptionChange('replaceKeywords')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <CompareArrows fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Reorder Sections" 
                      secondary="Prioritize sections based on job requirements"
                    />
                    <Switch
                      edge="end"
                      checked={customizationOptions.reorderSections}
                      onChange={() => handleOptionChange('reorderSections')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <TrendingUp fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Enhance Relevant Experience" 
                      secondary="Highlight experience relevant to the job"
                    />
                    <Switch
                      edge="end"
                      checked={customizationOptions.enhanceRelevantExperience}
                      onChange={() => handleOptionChange('enhanceRelevantExperience')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Tune fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Adjust Skills" 
                      secondary="Reorganize skills based on job requirements"
                    />
                    <Switch
                      edge="end"
                      checked={customizationOptions.adjustSkills}
                      onChange={() => handleOptionChange('adjustSkills')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Lightbulb fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Customize Summary" 
                      secondary="Tailor summary to match job requirements"
                    />
                    <Switch
                      edge="end"
                      checked={customizationOptions.customizeSummary}
                      onChange={() => handleOptionChange('customizeSummary')}
                    />
                  </ListItem>
                </List>
              </Paper>
              
              <FormControlLabel
                control={
                  <Switch 
                    checked={saveJobInHistory} 
                    onChange={(e) => setSaveJobInHistory(e.target.checked)}
                  />
                }
                label="Save job in history"
              />
            </Collapse>
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                startIcon={<Sync />}
                onClick={customizeResumeForJob}
                disabled={!selectedJob && !jobDescription.trim() || loadingCustomization}
              >
                {loadingCustomization ? 'Customizing...' : 'Customize Resume for This Job'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={7}>
          {loadingCustomization ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={50} thickness={4} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Customizing your resume...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Our AI is tailoring your resume to match the job requirements.
              </Typography>
            </Box>
          ) : customizedResume ? (
            <Box>
              <Card 
                variant="outlined" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.background.paper} 0%, ${theme.palette.success.light}25 100%)`
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <CheckCircle sx={{ color: 'success.main', mr: 1.5, mt: 0.5 }} />
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Resume Customization Complete
                      </Typography>
                      <Typography variant="body2">
                        Your resume has been tailored for: <strong>{selectedJob?.title || 'Specified Job'}</strong>
                      </Typography>
                      {selectedJob && (
                        <Typography variant="body2" color="text.secondary">
                          {selectedJob.company} • {selectedJob.location}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {analysisData?.matchScore || 85}%
                        </Typography>
                        <Typography variant="body2">Match Score</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {analysisData?.changesCount || 12}
                        </Typography>
                        <Typography variant="body2">Improvements</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary">
                          {analysisData?.keywordScore || 92}%
                        </Typography>
                        <Typography variant="body2">Keyword Match</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button 
                      variant="outlined"
                      startIcon={<CompareArrows />}
                    >
                      View Changes
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AssignmentTurnedIn />}
                      onClick={handleSaveCustomizations}
                    >
                      Save This Version
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              
              {analysisData && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Enhancements Made
                  </Typography>
                  
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    {analysisData.keywordsAdded?.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Keywords Added
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {analysisData.keywordsAdded.map((keyword, idx) => (
                            <Chip 
                              key={idx}
                              label={keyword}
                              size="small"
                              color="primary"
                              icon={<Add />}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {analysisData.sectionsReordered && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Sections Reordered
                        </Typography>
                        <List dense disablePadding>
                          {analysisData.sectionsReordered.map((section, idx) => (
                            <ListItem key={idx} dense disableGutters>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <ArrowUpward 
                                  fontSize="small"
                                  color={section.promoted ? "success" : "action"}
                                />
                              </ListItemIcon>
                              <ListItemText 
                                primary={section.name} 
                                secondary={section.promoted ? 'Moved up for visibility' : 'Reordered'}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    {analysisData.enhancedSections?.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Enhanced Sections
                        </Typography>
                        <List dense disablePadding>
                          {analysisData.enhancedSections.map((section, idx) => (
                            <ListItem key={idx} dense disableGutters>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <TrendingUp fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={section.name} 
                                secondary={section.changes}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    {analysisData.beforeAfterMetrics && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Before vs. After Metrics
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Paper variant="outlined" sx={{ p: 1, bgcolor: theme.palette.background.default }}>
                              <Typography variant="caption" display="block" color="text.secondary">
                                Before
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2">
                                  Keyword Match:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {analysisData.beforeAfterMetrics.keywordMatchBefore}%
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2">
                                  ATS Score:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {analysisData.beforeAfterMetrics.atsScoreBefore}%
                                </Typography>
                              </Box>
                            </Paper>
                          </Grid>
                          <Grid item xs={6}>
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 1, 
                                bgcolor: theme.palette.success.light,
                                color: theme.palette.success.contrastText
                              }}
                            >
                              <Typography variant="caption" display="block" color="inherit" sx={{ opacity: 0.7 }}>
                                After
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2">
                                  Keyword Match:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {analysisData.beforeAfterMetrics.keywordMatchAfter}%
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2">
                                  ATS Score:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {analysisData.beforeAfterMetrics.atsScoreAfter}%
                                </Typography>
                              </Box>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                  </Paper>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'center',
              p: 4,
              textAlign: 'center'
            }}>
              <InsertChart sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Customized Resume Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
                Select a job posting or paste a job description, then click "Customize Resume" to tailor your resume for a specific job application.
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

// Helper function to generate mock jobs for development
const generateMockJobs = () => {
  return [
    {
      id: 'job1',
      title: 'Senior Frontend Developer',
      company: 'Tech Innovations Inc.',
      location: 'San Francisco, CA',
      description: 'We are looking for a Senior Frontend Developer with experience in React, TypeScript, and modern CSS frameworks. The ideal candidate will have 5+ years of experience building responsive and accessible web applications.',
      url: 'https://example.com/jobs/senior-frontend-developer'
    },
    {
      id: 'job2',
      title: 'Full Stack JavaScript Engineer',
      company: 'Digital Solutions',
      location: 'Remote',
      description: 'Digital Solutions is hiring a Full Stack JavaScript Engineer to join our growing team. Experience with Node.js, Express, React, and MongoDB is required. The ideal candidate will have experience with GraphQL and TypeScript.',
      url: 'https://example.com/jobs/full-stack-javascript-engineer'
    },
    {
      id: 'job3',
      title: 'UX/UI Developer',
      company: 'Creative Tech',
      location: 'New York, NY',
      description: 'Creative Tech is looking for a UX/UI Developer to join our team. The ideal candidate will have experience with frontend development (HTML, CSS, JavaScript) and design tools like Figma or Sketch. Knowledge of React and modern CSS frameworks is a plus.',
      url: 'https://example.com/jobs/ux-ui-developer'
    }
  ];
};

// Helper function to generate mock customized resume for development
const generateMockCustomizedResume = (originalResume, job) => {
  // Deep clone the resume
  const customized = JSON.parse(JSON.stringify(originalResume));
  
  // Customize summary based on job
  if (customized.personal && job) {
    customized.personal.summary = `Experienced ${job.title.toLowerCase()} with ${
      customized.experience?.length || 0
    }+ years of experience in ${job.company.toLowerCase()}-like environments, specializing in building responsive and accessible web applications. Passionate about creating intuitive user experiences and optimizing application performance.`;
  }
  
  // Add relevant skills
  if (job?.title.includes('Frontend')) {
    const newSkills = ['React', 'TypeScript', 'CSS3', 'Responsive Design'].filter(
      skill => !customized.skills?.some(s => s.name === skill)
    );
    
    newSkills.forEach(skill => {
      if (!customized.skills) customized.skills = [];
      customized.skills.push({ name: skill });
    });
  }
  
  // Mock analysis data
  const analysis = {
    matchScore: 85,
    changesCount: 12,
    keywordScore: 92,
    keywordsAdded: ['React', 'TypeScript', 'Responsive Design', 'Accessibility'],
    sectionsReordered: [
      { name: 'Technical Skills', promoted: true },
      { name: 'Work Experience', promoted: true },
      { name: 'Education', promoted: false }
    ],
    enhancedSections: [
      { name: 'Summary', changes: 'Tailored to match job requirements' },
      { name: 'Skills', changes: 'Added relevant technical skills from job description' },
      { name: 'Work Experience', changes: 'Enhanced descriptions with relevant keywords' }
    ],
    beforeAfterMetrics: {
      keywordMatchBefore: 65,
      keywordMatchAfter: 92,
      atsScoreBefore: 70,
      atsScoreAfter: 85
    }
  };
  
  return { customizedResume: customized, analysis };
};

export default JobSpecificCustomization; 