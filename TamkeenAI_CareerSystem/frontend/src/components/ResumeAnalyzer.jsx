import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Button,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  CardHeader,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  useTheme
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon, 
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  ContentPaste as ContentPasteIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  AutoAwesome as AutoAwesomeIcon,
  Description as DescriptionIcon,
  Work as WorkIcon,
  CheckCircleOutline,
  ErrorOutline,
  Star as StarIcon,
  ArrowUpward as ArrowUpwardIcon,
  Psychology as PsychologyIcon,
  Engineering as EngineeringIcon,
  Lightbulb,
  TrendingUp,
  Assignment,
  CheckCircle,
  StarBorder,
  Help,
  Schedule
} from '@mui/icons-material';
import apiEndpoints from '../utils/api';
import ATSResultsCard from './ATSResultsCard';
import ATSScoreVisualizer from './ATSScoreVisualizer';
import WordCloudVisualizer from './WordCloudVisualizer';
import ResumeScoreChart from './ResumeScoreChart';

const ResumeAnalyzer = ({ resume, loading: externalLoading, onAnalysisComplete }) => {
  const theme = useTheme();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [sampleJobs, setSampleJobs] = useState([]);
  const [jobLoading, setJobLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState({});

  // Fetch sample job descriptions when component mounts
  useEffect(() => {
    const fetchSampleJobs = async () => {
      try {
        const response = await apiEndpoints.jobs.getSampleJobDescriptions();
        setSampleJobs(response.data || []);
      } catch (err) {
        console.error('Error fetching sample jobs:', err);
      }
    };
    fetchSampleJobs();
  }, []);

  // Analyze resume when component mounts or resume changes
  useEffect(() => {
    if (resume?.id) {
      analyzeResume(resume.id);
    }
  }, [resume]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Function to analyze resume
  const analyzeResume = async (resumeId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiEndpoints.resumes.analyzeResume(resumeId);
      setAnalysis(response.data);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(response.data);
      }
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setError('Failed to analyze resume. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to analyze resume against job description
  const analyzeAgainstJob = async () => {
    if (!resume?.id || !jobDescription.trim()) return;
    
    setJobLoading(true);
    setError(null);
    
    try {
      const response = await apiEndpoints.resumes.analyzeResumeForJob(resume.id, {
        jobTitle: jobTitle.trim() || 'Unspecified Job',
        jobDescription: jobDescription.trim(),
        includeLLM: true
      });
      setAnalysis(response.data);
      
      // Generate AI suggestions
      generateAiSuggestions(response.data);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(response.data);
      }
    } catch (err) {
      console.error('Error analyzing resume against job:', err);
      setError('Failed to analyze resume against job. Please try again later.');
    } finally {
      setJobLoading(false);
    }
  };

  // Generate AI-powered suggestions based on analysis
  const generateAiSuggestions = async (analysisData) => {
    if (!analysisData) return;
    
    setSuggestionsLoading(true);
    
    try {
      const response = await apiEndpoints.ai.getResumeSuggestions({
        resumeId: resume.id,
        analysisData: analysisData,
        jobTitle: jobTitle.trim() || 'Unspecified Job',
        jobDescription: jobDescription.trim()
      });
      
      setAiSuggestions(response.data);
    } catch (err) {
      console.error('Error generating AI suggestions:', err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Select a sample job
  const handleSelectSampleJob = (event) => {
    const selectedJob = sampleJobs.find(job => job.id === event.target.value);
    if (selectedJob) {
      setJobTitle(selectedJob.title);
      setJobDescription(selectedJob.description);
    }
  };

  // Apply AI suggestion to resume
  const applyAiSuggestion = async (suggestion) => {
    try {
      const response = await apiEndpoints.resumes.applySuggestion(resume.id, suggestion);
      
      // Refresh resume analysis
      analyzeResume(resume.id);
      
      setAppliedSuggestions(prev => ({
        ...prev,
        [suggestion.id]: true
      }));
      
      return true;
    } catch (err) {
      console.error('Error applying suggestion:', err);
      return false;
    }
  };

  // Render loading state
  if (loading || externalLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 5 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Analyzing Your Resume
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center', maxWidth: 500 }}>
          Our AI is carefully reviewing your resume for optimization opportunities, 
          keyword matches, and formatting issues.
        </Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ my: 2 }}
        action={
          <Button color="inherit" size="small" onClick={() => analyzeResume(resume?.id)}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  // Render empty state
  if (!resume) {
    return (
      <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
        <DescriptionIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Resume Selected
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
          Select a resume from your library or upload a new one to analyze and optimize it for job applications.
        </Typography>
      </Paper>
    );
  }

  // Render no analysis state
  if (!analysis) {
    return (
      <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
        <Box sx={{ mb: 3 }}>
          <AutoAwesomeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.8 }} />
          <Typography variant="h5" gutterBottom>
            Resume Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Get a comprehensive analysis of your resume to identify strengths, areas for improvement, 
            and compatibility with Applicant Tracking Systems (ATS).
          </Typography>
        </Box>
        
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DescriptionIcon color="primary" sx={{ mr: 1.5 }} />
                  <Typography variant="h6">
                    Basic Analysis
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Analyze your resume to get insights on:
                </Typography>
                <List dense sx={{ mb: 2 }}>
                  <ListItem>
                    <ListItemIcon><CheckCircleOutline color="success" /></ListItemIcon>
                    <ListItemText primary="General ATS compatibility" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleOutline color="success" /></ListItemIcon>
                    <ListItemText primary="Resume structure and formatting" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><CheckCircleOutline color="success" /></ListItemIcon>
                    <ListItemText primary="Content quality and completeness" />
                  </ListItem>
                </List>
          <Button 
            variant="contained" 
                  fullWidth
            onClick={() => analyzeResume(resume.id)}
            disabled={loading}
                  sx={{ mt: 2 }}
          >
            Analyze Resume
          </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WorkIcon color="primary" sx={{ mr: 1.5 }} />
                  <Typography variant="h6">
                    Job Match Analysis
                  </Typography>
        </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Test your resume against a specific job description:
                </Typography>
                
                <FormControl fullWidth variant="outlined" size="small" sx={{ mb: 2 }}>
                  <InputLabel>Select a sample job (optional)</InputLabel>
                  <Select
                    value=""
                    onChange={handleSelectSampleJob}
                    label="Select a sample job (optional)"
                  >
                    <MenuItem value="">
                      <em>Select a sample job</em>
                    </MenuItem>
                    {sampleJobs.map(job => (
                      <MenuItem key={job.id} value={job.id}>
                        {job.title}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Or enter job details manually below</FormHelperText>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Job Title"
                  variant="outlined"
                  size="small"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Job Description"
                  variant="outlined"
                  size="small"
                  multiline
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  sx={{ mb: 2 }}
                />
                
                <Button 
                  variant="contained" 
                  color="primary"
                  fullWidth
                  onClick={analyzeAgainstJob}
                  disabled={jobLoading || !jobDescription.trim()}
                >
                  Analyze for This Job
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  // Render analysis results
  return (
    <Box>
      <Paper 
        sx={{ 
          mb: 3, 
          borderRadius: 2, 
          overflow: 'hidden',
          boxShadow: theme.shadows[3]
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            bgcolor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Tab 
            label="ATS Score" 
            icon={<Assignment />} 
            iconPosition="start"
          />
          <Tab 
            label="Keywords" 
            icon={<CheckCircleOutline />} 
            iconPosition="start"
          />
          <Tab 
            label="AI Suggestions" 
            icon={<Lightbulb />} 
            iconPosition="start"
          />
          <Tab 
            label="Skill Analysis" 
            icon={<TrendingUp />} 
            iconPosition="start"
          />
          <Tab 
            label="Section Breakdown" 
            icon={<Schedule />} 
            iconPosition="start"
          />
        </Tabs>
        
        <Box sx={{ p: 3, bgcolor: theme.palette.background.default }}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ATSResultsCard 
                  results={analysis} 
                  onReAnalyze={() => analyzeResume(resume.id)}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <CardHeader 
                    title="ATS Score Breakdown" 
                    titleTypographyProps={{ variant: 'h6' }}
                    sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5 }}
                  />
                  <CardContent>
                    <ATSScoreVisualizer data={analysis.section_scores || {}} />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
                  <CardHeader 
                    title="Resume Health" 
                    titleTypographyProps={{ variant: 'h6' }}
                    sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5 }}
                  />
                  <CardContent>
                    <List>
                      {analysis.health_checks?.map((check, index) => (
                        <ListItem key={index} alignItems="flex-start">
                          <ListItemIcon>
                            {check.status === 'pass' ? (
                              <CheckCircleIcon color="success" />
                            ) : check.status === 'warning' ? (
                              <WarningIcon color="warning" />
                            ) : (
                              <ErrorIcon color="error" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={check.title}
                            secondary={check.message}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Card sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
                  <CardHeader 
                    title="Keyword Analysis" 
                    titleTypographyProps={{ variant: 'h6' }}
                    sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5 }}
                  />
                  <CardContent sx={{ p: 0 }}>
                    <WordCloudVisualizer 
                      words={[
                        ...(analysis.matched_keywords || []).map(word => ({ 
                          text: word, 
                          value: 100, 
                          category: 'matched',
                          color: '#4caf50'
                        })),
                        ...(analysis.missing_keywords || []).map(word => ({ 
                          text: word, 
                          value: 70,
                          category: 'missing',
                          color: '#f44336'
                        }))
                      ]}
                      height={350}
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
                  <CardHeader 
                    title="Keyword Matching" 
                    titleTypographyProps={{ variant: 'h6' }}
                    sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5 }}
                  />
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Found Keywords ({analysis.matched_keywords?.length || 0})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                      {(analysis.matched_keywords || []).map((keyword, index) => (
                        <Chip 
                          key={index} 
                          label={keyword} 
                          color="success" 
                          size="small"
                        />
                      ))}
                      {analysis.matched_keywords?.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          No matching keywords found.
                        </Typography>
                      )}
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Missing Keywords ({analysis.missing_keywords?.length || 0})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(analysis.missing_keywords || []).map((keyword, index) => (
                        <Chip 
                          key={index} 
                          label={keyword} 
                          color="error" 
                          variant="outlined"
                          size="small"
                        />
                      ))}
                      {analysis.missing_keywords?.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Great! No missing keywords.
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <CardHeader 
                    title="AI-Powered Improvement Suggestions" 
                    titleTypographyProps={{ variant: 'h6' }}
                    sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5 }}
                    action={
                      <Button 
                        variant="contained" 
                        size="small"
                        color="secondary"
                        disabled={suggestionsLoading}
                        onClick={() => generateAiSuggestions(analysis)}
                        sx={{ mr: 1, color: 'white' }}
                      >
                        Refresh Suggestions
                      </Button>
                    }
                  />
                  
                  <CardContent sx={{ p: suggestionsLoading ? 0 : undefined }}>
                    {suggestionsLoading ? (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <CircularProgress size={40} />
                        <Typography variant="body2" sx={{ mt: 2 }}>
                          Generating personalized suggestions...
                        </Typography>
                      </Box>
                    ) : aiSuggestions ? (
                      <Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {aiSuggestions.summary}
      </Typography>
      
      <Box sx={{ mb: 3 }}>
                          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                            <PsychologyIcon color="primary" sx={{ mr: 1 }} />
                            AI Suggestions
                          </Typography>
                          
                          {aiSuggestions.suggestions.map((suggestion, index) => (
                            <Accordion key={index} sx={{ mb: 1 }}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography 
                                  sx={{ fontWeight: 500 }}
                                  color={suggestion.priority === 'high' ? 'error.main' : 
                                        suggestion.priority === 'medium' ? 'warning.main' : 'success.main'}
                                >
                                  {suggestion.title}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography variant="body2" gutterBottom>
                                  {suggestion.description}
                                </Typography>
                                
                                {suggestion.examples && (
                                  <Box sx={{ mt: 1, mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
                                      Examples:
        </Typography>
                                    <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default' }}>
                                      <Typography variant="body2" component="pre" sx={{ m: 0, fontSize: '0.8125rem' }}>
                                        {suggestion.examples}
        </Typography>
                                    </Paper>
                                  </Box>
                                )}
                                
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={() => applyAiSuggestion(suggestion)}
                                    disabled={appliedSuggestions[suggestion.id]}
                                    startIcon={appliedSuggestions[suggestion.id] ? <CheckCircle /> : null}
                                  >
                                    {appliedSuggestions[suggestion.id] ? 'Applied' : 'Apply Suggestion'}
                                  </Button>
                                </Box>
                              </AccordionDetails>
                            </Accordion>
                          ))}
      </Box>
      
                        <Divider sx={{ my: 3 }} />
                        
                        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                          <ArrowUpwardIcon color="primary" sx={{ mr: 1 }} />
                          Next Steps to Improve Your Score
                        </Typography>
                        
                        <List>
                          {aiSuggestions.nextSteps?.map((step, index) => (
                            <ListItem key={index} alignItems="flex-start">
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Chip 
                                  label={index + 1} 
                                  size="small" 
                                  color="primary" 
                                  sx={{ height: 24, width: 24, fontSize: '0.75rem' }} 
                                />
                              </ListItemIcon>
                              <ListItemText primary={step} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    ) : (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <AutoAwesomeIcon sx={{ fontSize: 40, color: 'action.disabled', mb: 1 }} />
                        <Typography variant="subtitle1" gutterBottom>
                          AI Suggestions
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Generate AI-powered suggestions to improve your resume and increase your ATS score.
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => generateAiSuggestions(analysis)}
                        >
                          Generate Suggestions
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 3 && (
      <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <CardHeader 
                    title="Skills Analysis" 
                    titleTypographyProps={{ variant: 'h6' }}
                    sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5 }}
                  />
                  <CardContent>
                    {analysis.skills_analysis ? (
                      <Box>
                        <Typography variant="body2" paragraph>
                          {analysis.skills_analysis.summary || 'Analysis of skills detected in your resume.'}
                        </Typography>
                        
                        <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
                                <Typography variant="subtitle2" gutterBottom>
                                  Detected Skills ({analysis.skills_analysis.detected_skills?.length || 0})
              </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {analysis.skills_analysis.detected_skills?.map((skill, index) => (
                                    <Chip 
                                      key={index} 
                                      label={skill.name} 
                                      size="small"
                                      color={skill.relevance > 0.7 ? "primary" : "default"}
                                      variant={skill.relevance > 0.7 ? "filled" : "outlined"}
                                    />
                                  ))}
                                </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
                                <Typography variant="subtitle2" gutterBottom>
                                  Recommended Skills ({analysis.skills_analysis.recommended_skills?.length || 0})
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {analysis.skills_analysis.recommended_skills?.map((skill, index) => (
                                    <Chip 
                                      key={index} 
                                      label={skill.name} 
                                      size="small"
                                      color="error"
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" align="center">
                        No skills analysis data available.
              </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {activeTab === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <CardHeader 
                    title="Resume Section Analysis" 
                    titleTypographyProps={{ variant: 'h6' }}
                    sx={{ bgcolor: 'primary.main', color: 'white', py: 1.5 }}
                  />
                  <CardContent>
                    {analysis.sections_analysis ? (
                      <Box>
                        {Object.entries(analysis.sections_analysis).map(([section, data], index) => (
                          <Box key={section} sx={{ mb: 3 }}>
                            <Typography 
                              variant="subtitle1" 
                              sx={{ 
                                mb: 1, 
                                display: 'flex', 
                                alignItems: 'center',
                                color: data.score >= 7 ? 'success.main' : data.score >= 5 ? 'warning.main' : 'error.main'
                              }}
                            >
                              {section}
                              <Chip 
                                label={`${data.score}/10`} 
                                size="small" 
                                color={data.score >= 7 ? "success" : data.score >= 5 ? "warning" : "error"}
                                sx={{ ml: 1 }}
                              />
                            </Typography>
                            
                            <Box sx={{ 
                              width: '100%', 
                              bgcolor: theme.palette.divider,
                              borderRadius: 4,
                              height: 8,
                              position: 'relative'
                            }}>
                              <Box 
                                sx={{ 
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  borderRadius: 4,
                                  width: `${data.score}%`,
                                  bgcolor: (() => {
                                    if (data.score >= 80) return theme.palette.success.main;
                                    if (data.score >= 60) return theme.palette.warning.main;
                                    return theme.palette.error.main;
                                  })()
                                }}
                              />
                            </Box>
                            
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {data.feedback}
                            </Typography>
                            
                            {data.suggestions && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  Suggestions:
                                </Typography>
                                <List dense disablePadding>
                                  {data.suggestions.map((suggestion, idx) => (
                                    <ListItem key={idx} disablePadding sx={{ py: 0.25 }}>
                                      <ListItemIcon sx={{ minWidth: 28 }}>
                                        <InfoIcon color="info" fontSize="small" />
                                      </ListItemIcon>
                  <ListItemText 
                                        primary={suggestion} 
                                        primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
                                  ))}
              </List>
                              </Box>
                            )}
                            
                            {index < Object.entries(analysis.sections_analysis).length - 1 && (
                              <Divider sx={{ mt: 2 }} />
                            )}
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" align="center">
                        No section analysis data available.
                      </Typography>
                    )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
          )}
          
          {activeTab <= 1 && (
            <Box mt={4}>
              <ResumeScoreChart />
            </Box>
          )}
      </Box>
    </Paper>
    </Box>
  );
};

export default ResumeAnalyzer; 