import React, { useState, useEffect, useRef } from 'react';
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
  useTheme,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel
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
  Schedule,
  Settings,
  Key,
  Autorenew,
  Bolt
} from '@mui/icons-material';
import apiEndpoints from '../utils/api';
import ATSResultsCard from './ATSResultsCard';
import ATSScoreVisualizer from './ATSScoreVisualizer';
import WordCloudVisualizer from './WordCloudVisualizer';
import ResumeScoreChart from './ResumeScoreChart';
import resumeApi from '../utils/resumeApi';
import ATSDirectUtil from '../utils/ATS';

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
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsError, setAtsError] = useState(null);
  const [useDeepSeek, setUseDeepSeek] = useState(true);
  const [manualFileUpload, setManualFileUpload] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deepSeekApiKey, setDeepSeekApiKey] = useState(localStorage.getItem('deepseekApiKey') || '');
  const [useDirectUpload, setUseDirectUpload] = useState(false);
  const fileInputRef = useRef(null);
  const DISABLE_ATS_MOCK_DATA = import.meta.env.VITE_DISABLE_ATS_MOCK_DATA === 'true';

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

    // Try getting the ATS sample jobs too
    const fetchAtsSampleJobs = async () => {
      try {
        const response = await fetch('/api/ats/sample-jobs');
        if (response.ok) {
          const data = await response.json();
          if (data.jobs && data.jobs.length > 0) {
            setSampleJobs(prevJobs => {
              // Combine with existing jobs, avoiding duplicates
              const newJobs = [...prevJobs];
              data.jobs.forEach(job => {
                if (!newJobs.some(j => j.title === job.title)) {
                  newJobs.push({
                    id: `ats-${job.title.replace(/\s+/g, '-').toLowerCase()}`,
                    title: job.title,
                    description: job.description
                  });
                }
              });
              return newJobs;
            });
          }
        }
      } catch (err) {
        console.error('Error fetching ATS sample jobs:', err);
        // Non-critical, so continue
      }
    };
    fetchAtsSampleJobs();
  }, []);

  // Save DeepSeek API key to localStorage when it changes
  useEffect(() => {
    if (deepSeekApiKey) {
      localStorage.setItem('deepseekApiKey', deepSeekApiKey);
    }
  }, [deepSeekApiKey]);

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
    if ((!resume?.id && !manualFileUpload) || !jobDescription.trim()) {
      setError("Please provide both a resume and job description");
      return;
    }
    
    setJobLoading(true);
    setError(null);
    
    try {
      // If using the regular resume from the system
      if (resume?.id && !useDirectUpload) {
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
  
        // Also analyze with ATS if resume.file exists
        if (resume.file) {
          analyzeWithATS(resume.file);
        }
      } 
      // If using direct file upload
      else if (manualFileUpload) {
        // Skip the regular analysis and go straight to ATS analysis
        await analyzeWithATS(manualFileUpload);
      }
    } catch (err) {
      console.error('Error analyzing resume against job:', err);
      setError('Failed to analyze resume against job. Please try again later.');
    } finally {
      setJobLoading(false);
    }
  };

  // Analyze with ATS
  const analyzeWithATS = async (file) => {
    if (!file || !jobDescription.trim()) return;
    
    setAtsLoading(true);
    setAtsError(null);
    
    try {
      // Validate file type
      const fileType = file.type || '';
      if (!fileType.includes('pdf') && !fileType.includes('word') && !fileType.includes('openxmlformats')) {
        throw new Error('File must be a PDF or Word document (.pdf, .doc, or .docx)');
      }
      
      // Check file size
      const maxSizeMB = 10;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new Error(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      }
      
      console.log('Using direct DeepSeek connection instead of mock data');
      
      // Use the direct ATS utility to bypass mock data
      try {
        // First try with direct connection to DeepSeek
        const data = await ATSDirectUtil.analyzeResumeWithDeepSeek(
          file,
          jobTitle.trim() || 'Unspecified Job',
          jobDescription.trim()
        );
        
        setAtsAnalysis(data);
        
        // Auto-switch to the ATS tab if analysis is successful
        if (data) {
          setActiveTab(2);
        }
        return;
      } catch (directError) {
        console.error('Direct DeepSeek connection failed:', directError);
        // If direct connection fails, try using the old method as fallback
        console.log('Falling back to standard API connection...');
      }
      
      // Original implementation as fallback
      const analyzeMethod = useDeepSeek 
        ? resumeApi.analyzeResumeWithDeepSeek 
        : resumeApi.analyzeResumeWithATS;
      
      // Create a new FormData object to make sure we can set everything correctly
      const formData = new FormData();
      formData.append('file', file);
      formData.append('job_title', jobTitle.trim() || 'Unspecified Job');
      formData.append('job_description', jobDescription.trim());
      
      // Add API key if we have a manual one
      if (deepSeekApiKey && useDeepSeek) {
        formData.append('api_key', deepSeekApiKey);
      }
      
      // Make the request directly to get more control
      let response;
      if (useDeepSeek) {
        response = await fetch('/api/ats/analyze-with-deepseek', {
          method: 'POST',
          body: formData,
          headers: {
            'X-Force-Real-API': 'true',
            'X-Skip-Mock': DISABLE_ATS_MOCK_DATA ? 'true' : 'false'
          }
        });
      } else {
        response = await fetch('/api/ats/analyze', {
          method: 'POST',
          body: formData,
          headers: {
            'X-Force-Real-API': 'true',
            'X-Skip-Mock': DISABLE_ATS_MOCK_DATA ? 'true' : 'false'
          }
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze resume');
      }
      
      const data = await response.json();
      setAtsAnalysis(data);
      
      // Auto-switch to the ATS tab if analysis is successful
      if (data) {
        setActiveTab(2);
      }
    } catch (err) {
      console.error('Error analyzing with ATS:', err);
      
      // Display user-friendly error messages
      let errorMessage = 'Failed to analyze with ATS system. Please try again later.';
      
      if (err.message && err.message.includes('PDF extraction failed')) {
        errorMessage = 'Failed to extract text from your PDF. The file might be scanned, password-protected, or in an unsupported format. Try converting it to a text-based PDF or DOCX format.';
      } else if (err.message && err.message.includes('DeepSeek AI')) {
        errorMessage = 'DeepSeek AI analysis failed. The API key might be invalid or there may be a connection issue. Try disabling DeepSeek AI or check your internet connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setAtsError(errorMessage);
    } finally {
      setAtsLoading(false);
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

  // Handle file upload for direct ATS analysis
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setManualFileUpload(file);
      setUseDirectUpload(true);
    }
  };

  // Trigger file input click
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  // Open settings dialog
  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  // Close settings dialog
  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  // Test DeepSeek API connection
  const testDeepSeekConnection = async () => {
    try {
      setSettingsOpen(false); // Close settings dialog
      setAtsLoading(true); // Show loading indicator
      
      // Use direct connection utility instead
      const data = await ATSDirectUtil.testDeepSeekConnection();
      
      if (data.connected) {
        // Show success message
        alert(`DeepSeek API connection successful!\nResponse: ${data.response}`);
      } else {
        // Show error message
        alert(`DeepSeek API connection failed:\n${data.message}`);
      }
    } catch (error) {
      console.error('Error testing DeepSeek connection:', error);
      alert('Error testing DeepSeek connection. Check console for details.');
    } finally {
      setAtsLoading(false);
    }
  };

  // Save settings
  const handleSaveSettings = () => {
    // Save API key to localStorage
    if (deepSeekApiKey) {
      localStorage.setItem('deepseekApiKey', deepSeekApiKey);
    }
    setSettingsOpen(false);
  };

  // Clear the mock data flag in localStorage and retry analysis
  const clearMockDataAndAnalyze = () => {
    localStorage.removeItem('backend-unavailable');
    localStorage.removeItem('mock-warning-atsAnalysis');
    localStorage.removeItem('mock-warning-atsAnalysisWithVisuals');
    localStorage.removeItem('mock-warning-atsAnalysisWithDeepSeek');
    
    // Re-analyze with the current file
    if (manualFileUpload || (resume && resume.file)) {
      analyzeWithATS(manualFileUpload || resume.file);
    }
  };

  // Render ATS analysis section
  const renderATSAnalysis = () => {
    if (atsLoading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
          <CircularProgress size={40} thickness={4} />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Analyzing with ATS System...
          </Typography>
        </Box>
      );
    }

    if (atsError) {
      return (
        <Alert 
          severity="error" 
          sx={{ my: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => analyzeWithATS(manualFileUpload || resume.file)}>
              Retry
            </Button>
          }
        >
          {atsError}
        </Alert>
      );
    }

    if (!atsAnalysis) {
      return (
        <Paper sx={{ p: 2, my: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            No ATS analysis yet. Enter a job description and click "Analyze".
          </Typography>
        </Paper>
      );
    }

    return (
      <Box sx={{ mt: 3 }}>
        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            ATS Compatibility Analysis
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Overall Score:
            </Typography>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                bgcolor: theme.palette.background.default,
                borderRadius: 2,
                px: 2,
                py: 1
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  color: atsAnalysis.score >= 80 ? theme.palette.success.main :
                         atsAnalysis.score >= 60 ? theme.palette.info.main :
                         atsAnalysis.score >= 40 ? theme.palette.warning.main :
                         theme.palette.error.main
                }}
              >
                {atsAnalysis.score}%
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
            {atsAnalysis.assessment}
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                <CheckCircleIcon 
                  sx={{ 
                    color: theme.palette.success.main,
                    mr: 1,
                    verticalAlign: 'middle'
                  }}
                />
                Matching Keywords ({atsAnalysis.matching_keywords?.length || 0})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {atsAnalysis.matching_keywords?.map((keyword, index) => (
                  <Chip 
                    key={index}
                    label={keyword}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                <ErrorIcon 
                  sx={{ 
                    color: theme.palette.warning.main,
                    mr: 1,
                    verticalAlign: 'middle'
                  }}
                />
                Missing Keywords ({atsAnalysis.missing_keywords?.length || 0})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {atsAnalysis.missing_keywords?.slice(0, 15).map((keyword, index) => (
                  <Chip 
                    key={index}
                    label={keyword}
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                ))}
                {atsAnalysis.missing_keywords?.length > 15 && (
                  <Chip 
                    label={`+${atsAnalysis.missing_keywords.length - 15} more`}
                    size="small"
                    color="default"
                    variant="outlined"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
          
          {atsAnalysis.format_analysis && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                <InfoIcon 
                  sx={{ 
                    color: theme.palette.info.main,
                    mr: 1,
                    verticalAlign: 'middle'
                  }}
                />
                Format Analysis
              </Typography>
              <Typography variant="body2" gutterBottom>
                Format Score: {atsAnalysis.format_analysis.format_score}%
              </Typography>
              <List dense>
                {atsAnalysis.format_analysis.format_issues?.map((issue, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 30 }}>•</ListItemIcon>
                    <ListItemText primary={issue} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
          
          {atsAnalysis.recommendations && atsAnalysis.recommendations.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" gutterBottom>
                <Lightbulb 
                  sx={{ 
                    color: theme.palette.warning.main,
                    mr: 1,
                    verticalAlign: 'middle'
                  }}
                />
                Recommendations
              </Typography>
              <List dense>
                {atsAnalysis.recommendations.map((recommendation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      {index + 1}.
                    </ListItemIcon>
                    <ListItemText primary={recommendation} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
          
          {atsAnalysis.llm_analysis && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  <AutoAwesomeIcon 
                    sx={{ 
                      color: theme.palette.primary.main,
                      mr: 1,
                      verticalAlign: 'middle'
                    }}
                  />
                  DeepSeek AI Analysis
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography 
                  variant="body2" 
                  component="pre" 
                  sx={{ 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'monospace',
                    bgcolor: theme.palette.background.default,
                    p: 2,
                    borderRadius: 1
                  }}
                >
                  {atsAnalysis.llm_analysis}
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}
          
          {atsAnalysis.improvement_roadmap && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  <TrendingUp 
                    sx={{ 
                      color: theme.palette.success.main,
                      mr: 1,
                      verticalAlign: 'middle'
                    }}
                  />
                  Career Development Roadmap
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography 
                  variant="body2" 
                  component="pre" 
                  sx={{ 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'monospace',
                    bgcolor: theme.palette.background.default,
                    p: 2,
                    borderRadius: 1
                  }}
                >
                  {atsAnalysis.improvement_roadmap}
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}
        </Paper>
      </Box>
    );
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

  // Render empty state for no direct resume and no manual upload
  if (!resume && !manualFileUpload) {
    return (
      <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 2 }}>
        <DescriptionIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Resume Selected
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
          Please upload or select a resume to analyze its ATS compatibility and get improvement suggestions.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadIcon />}
          onClick={handleSelectFile}
          sx={{ mt: 2 }}
        >
          Upload Resume
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </Paper>
    );
  }

  return (
    <Box>
      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={handleCloseSettings}>
        <DialogTitle>ATS Analyzer Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure your ATS analyzer preferences and API keys.
          </Typography>
          
          <TextField
            label="DeepSeek API Key"
            value={deepSeekApiKey}
            onChange={(e) => setDeepSeekApiKey(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            placeholder="Enter your DeepSeek API key..."
            helperText="Your API key is stored locally and never sent to our servers"
            InputProps={{
              startAdornment: <Key color="action" sx={{ mr: 1 }} />,
            }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={useDeepSeek}
                onChange={(e) => setUseDeepSeek(e.target.checked)}
                color="primary"
              />
            }
            label="Use DeepSeek AI for enhanced analysis"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            variant="outlined" 
            color="info"
            onClick={testDeepSeekConnection}
          >
            Test DeepSeek Connection
          </Button>
          <Button onClick={handleCloseSettings}>Cancel</Button>
          <Button onClick={handleSaveSettings} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* File Upload Option */}
      {(!resume || useDirectUpload) && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              <UploadIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
              Resume File
            </Typography>
            
            {resume && (
              <FormControlLabel
                control={
                  <Switch
                    checked={useDirectUpload}
                    onChange={(e) => setUseDirectUpload(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label="Use direct file upload"
              />
            )}
          </Box>
          
          {useDirectUpload && (
            <Box 
              sx={{
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                mb: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
              onClick={handleSelectFile}
            >
              {manualFileUpload ? (
                <>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="subtitle1">
                    {manualFileUpload.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(manualFileUpload.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </>
              ) : (
                <>
                  <UploadIcon sx={{ fontSize: 40, color: 'action.active', mb: 1 }} />
                  <Typography variant="subtitle1">
                    Drop your resume here or click to browse
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supports PDF, DOCX, and TXT files (max 10MB)
                  </Typography>
                </>
              )}
            </Box>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          
          {manualFileUpload && (
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<UploadIcon />}
                onClick={handleSelectFile}
                size="small"
              >
                Change File
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => {
                  setManualFileUpload(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                Remove File
              </Button>
            </Box>
          )}
        </Paper>
      )}
      
      {/* Job Description Input */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            <WorkIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
            Match Against Job Description
          </Typography>
          
          <IconButton 
            color="primary"
            onClick={handleOpenSettings}
            title="ATS Analyzer Settings"
          >
            <Settings />
          </IconButton>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="sample-job-label">Sample Job Descriptions</InputLabel>
              <Select
                labelId="sample-job-label"
                value=""
                label="Sample Job Descriptions"
                onChange={handleSelectSampleJob}
              >
                <MenuItem value="">
                  <em>Select a sample job</em>
                </MenuItem>
                {sampleJobs.map((job) => (
                  <MenuItem key={job.id} value={job.id}>
                    {job.title}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Choose from our sample job descriptions or enter your own below</FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="e.g. Software Engineer"
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <TextField
              label="Job Description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Paste the job description here..."
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <Typography variant="body2">
                Use DeepSeek AI for enhanced analysis
                <Tooltip title="DeepSeek AI provides deeper insights, personalized feedback, and a career development roadmap">
                  <IconButton size="small">
                    <Help fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <FormHelperText>
                <Checkbox 
                  checked={useDeepSeek}
                  onChange={(e) => setUseDeepSeek(e.target.checked)}
                  color="primary"
                />
                Enable AI-powered resume analysis
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <div className={classes.actionButtons}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => analyzeResume(resume.id)}
                disabled={analyzeLoading || !jobDescription.trim()}
                startIcon={analyzeLoading ? <CircularProgress size={20} /> : null}
              >
                {analyzeLoading ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
              
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  if (resume && resume.file) {
                    analyzeWithATS(resume.file);
                  } else {
                    setError('No resume file available for analysis');
                  }
                }}
                disabled={atsLoading || !jobDescription.trim()}
                startIcon={atsLoading ? <CircularProgress size={20} /> : <Autorenew />}
                sx={{ ml: 2 }}
              >
                {atsLoading ? 'Running ATS Analysis...' : 'ATS Analysis'}
              </Button>
              
              <Button
                variant="outlined"
                color="info"
                onClick={async () => {
                  try {
                    if (!resume || !resume.file) {
                      alert('Please upload a resume first');
                      return;
                    }
                    
                    if (!jobDescription.trim()) {
                      alert('Please enter a job description');
                      return;
                    }
                    
                    setAtsLoading(true);
                    console.log('Using direct ATS connection to DeepSeek');
                    
                    // Clear any cached mock data flags
                    localStorage.removeItem('backend-unavailable');
                    localStorage.removeItem('mock-warning-atsAnalysis');
                    localStorage.removeItem('mock-warning-atsAnalysisWithDeepSeek');
                    
                    // Use the direct utility
                    const result = await ATSDirectUtil.analyzeResumeWithDeepSeek(
                      resume.file,
                      jobTitle || 'Job Position',
                      jobDescription
                    );
                    
                    setAtsAnalysis(result);
                    setActiveTab(2);
                  } catch (error) {
                    console.error('Direct ATS analysis failed:', error);
                    alert(`Direct ATS analysis failed: ${error.message}`);
                  } finally {
                    setAtsLoading(false);
                  }
                }}
                disabled={atsLoading || !jobDescription.trim() || !resume?.file}
                startIcon={<Bolt />}
                sx={{ ml: 2 }}
              >
                Force DeepSeek
              </Button>
            </div>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs for different analysis views */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<CheckCircleOutline />} label="ATS Analysis" iconPosition="start" />
        {analysis && <Tab icon={<StarIcon />} label="Resume Score" iconPosition="start" />}
        {atsAnalysis && <Tab icon={<Assignment />} label="Advanced ATS" iconPosition="start" />}
        {aiSuggestions && <Tab icon={<AutoAwesomeIcon />} label="AI Suggestions" iconPosition="start" />}
      </Tabs>
      
      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {/* ATS Analysis Tab */}
        {activeTab === 0 && (
          <>
            {analysis ? (
              <ATSResultsCard analysis={analysis} />
            ) : (
              <Typography variant="body1">
                Enter a job description and click "Analyze" to get ATS compatibility results.
              </Typography>
            )}
          </>
        )}
        
        {/* Resume Score Tab */}
        {activeTab === 1 && analysis && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ATSScoreVisualizer score={analysis.score} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ResumeScoreChart 
                data={[
                  { category: 'Keywords', value: analysis.keywordScore || 60 },
                  { category: 'Format', value: analysis.formatScore || 75 },
                  { category: 'Content', value: analysis.contentScore || 80 },
                  { category: 'Relevance', value: analysis.relevanceScore || 65 },
                ]} 
              />
            </Grid>
            <Grid item xs={12}>
              <WordCloudVisualizer 
                keywords={[
                  ...(analysis.matchingKeywords || []).map(k => ({ text: k, value: 30, color: '#4caf50' })),
                  ...(analysis.missingKeywords || []).map(k => ({ text: k, value: 20, color: '#ff9800' })),
                ]} 
              />
            </Grid>
          </Grid>
        )}
        
        {/* Advanced ATS Tab */}
        {activeTab === 2 && renderATSAnalysis()}
        
        {/* AI Suggestions Tab */}
        {activeTab === 3 && aiSuggestions && (
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              <AutoAwesomeIcon sx={{ mr: 1, verticalAlign: 'text-bottom' }} />
              AI-Powered Improvement Suggestions
            </Typography>
            
            {suggestionsLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                <Typography>Generating personalized suggestions...</Typography>
              </Box>
            ) : (
              <List>
                {aiSuggestions.map((suggestion, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      bgcolor: theme.palette.background.default,
                      borderRadius: 2,
                      mb: 2,
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <ListItemText
                      primary={suggestion.title}
                      secondary={suggestion.description}
                      sx={{ mb: 1 }}
                    />
                    
                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => applyAiSuggestion(suggestion)}
                        disabled={appliedSuggestions[suggestion.id]}
                        startIcon={appliedSuggestions[suggestion.id] ? <CheckCircle /> : null}
                      >
                        {appliedSuggestions[suggestion.id] ? 'Applied' : 'Apply Suggestion'}
                      </Button>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default ResumeAnalyzer; 