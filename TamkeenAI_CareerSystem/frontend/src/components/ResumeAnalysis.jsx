import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  CircularProgress,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  IconButton,
  Tooltip,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
  Work as WorkIcon,
  Check as CheckIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Upload as UploadIcon,
  Autorenew as AutorenewIcon,
  CloudDownload as CloudDownloadIcon,
  Share as ShareIcon,
  FileCopy as FileCopyIcon
} from '@mui/icons-material';
import ResumeScoreboard from './ResumeScoreboard';
import WordCloudVisualizer from './WordCloudVisualizer';
import ATSResultsCard from './ATSResultsCard';
import apiEndpoints from '../utils/api';

// Tab panel component
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ResumeAnalysis = ({ 
  resumeId, 
  resumeData, 
  onAnalysisComplete = null,
  jobData = null,
  loading = false,
  error = null
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [jobListOpen, setJobListOpen] = useState(false);
  const [sampleJobs, setSampleJobs] = useState([]);
  
  // Use job data if provided
  useEffect(() => {
    if (jobData) {
      setJobTitle(jobData.title || '');
      setJobDescription(jobData.description || '');
    }
  }, [jobData]);
  
  // Fetch sample jobs for demo purposes
  useEffect(() => {
    const fetchSampleJobs = async () => {
      try {
        const response = await apiEndpoints.jobs.getSampleJobs();
        setSampleJobs(response.data || []);
      } catch (err) {
        console.error('Error fetching sample jobs:', err);
        // Fallback to mock data
        setSampleJobs([
          { id: 'job1', title: 'Frontend Developer', description: 'Looking for a skilled frontend developer...' },
          { id: 'job2', title: 'Data Scientist', description: 'Data scientist with experience in machine learning...' },
          { id: 'job3', title: 'UX Designer', description: 'UX designer with portfolio of user-centered design...' }
        ]);
      }
    };
    
    fetchSampleJobs();
  }, []);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle analysis submission
  const handleAnalyzeResume = async () => {
    if (!resumeId) {
      setAnalysisError('No resume selected for analysis');
      return;
    }
    
    if (!jobDescription.trim()) {
      setAnalysisError('Please enter a job description for analysis');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      const response = await apiEndpoints.resumes.analyzeResumeForJob(resumeId, {
        jobTitle: jobTitle.trim() || 'Unspecified Job',
        jobDescription: jobDescription.trim(),
        includeLLM: true
      });
      
      setAnalysisData(response.data);
      
      // Callback to parent component if provided
      if (onAnalysisComplete) {
        onAnalysisComplete(response.data);
      }
      
      // Switch to the results tab
      setActiveTab(1);
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setAnalysisError('Failed to analyze resume. Please try again later.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Select a sample job
  const handleSelectSampleJob = (jobIndex) => {
    if (sampleJobs[jobIndex]) {
      setJobTitle(sampleJobs[jobIndex].title);
      setJobDescription(sampleJobs[jobIndex].description);
    }
    setJobListOpen(false);
  };
  
  // Reset analysis data
  const handleReset = () => {
    setAnalysisData(null);
    setJobTitle('');
    setJobDescription('');
    setActiveTab(0);
  };
  
  // Render the analysis setup form
  const renderSetupForm = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Resume Analysis Setup
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>ATS Analysis</AlertTitle>
          To analyze your resume against an Applicant Tracking System (ATS), please enter a job description. 
          This will help evaluate how well your resume matches the requirements.
        </Alert>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Job Title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              fullWidth
              placeholder="e.g., Senior Software Engineer"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Select from sample jobs">
                      <IconButton 
                        edge="end" 
                        onClick={() => setJobListOpen(!jobListOpen)}
                      >
                        <SearchIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            
            {jobListOpen && (
              <Paper sx={{ mt: 1, p: 1, maxHeight: 200, overflow: 'auto' }}>
                {sampleJobs.map((job, index) => (
                  <Box 
                    key={job.id || index}
                    sx={{ 
                      py: 1, 
                      px: 2, 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => handleSelectSampleJob(index)}
                  >
                    <Typography variant="body2">{job.title}</Typography>
                  </Box>
                ))}
              </Paper>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Job Description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              fullWidth
              multiline
              rows={6}
              placeholder="Paste the job description here..."
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleAnalyzeResume}
                disabled={isAnalyzing || !jobDescription.trim()}
                startIcon={isAnalyzing ? <CircularProgress size={20} /> : <AutorenewIcon />}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {analysisError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {analysisError}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
  
  // Render analysis results
  const renderResults = () => {
    if (!analysisData) {
      return (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <DescriptionIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Analysis Data
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please enter a job description and analyze your resume to see results.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => setActiveTab(0)}
            >
              Start Analysis
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Analysis Results for {jobTitle || 'Job Description'}
          </Typography>
          
          <Box>
            <Tooltip title="Download Report">
              <IconButton size="small" sx={{ mr: 1 }}>
                <CloudDownloadIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Share Results">
              <IconButton size="small" sx={{ mr: 1 }}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Copy to Clipboard">
              <IconButton size="small" sx={{ mr: 1 }}>
                <FileCopyIcon />
              </IconButton>
            </Tooltip>
            
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<AutorenewIcon />}
              onClick={handleReset}
            >
              New Analysis
            </Button>
          </Box>
        </Box>
        
        <ResumeScoreboard 
          analysisData={analysisData} 
          resumeData={resumeData}
        />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ATSResultsCard 
              results={analysisData} 
              onReAnalyze={() => setActiveTab(0)}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Keyword Visualization
                </Typography>
                <Box sx={{ height: 400 }}>
                  <WordCloudVisualizer 
                    resumeId={resumeId}
                    resumeData={resumeData}
                    jobData={{
                      title: jobTitle,
                      description: jobDescription
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {analysisData.ai_suggestions && analysisData.ai_suggestions.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    AI-Powered Improvement Suggestions
                  </Typography>
                  
                  {analysisData.ai_suggestions.map((suggestion, index) => (
                    <Accordion key={index} elevation={0} sx={{ mt: 1 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1">{suggestion.title}</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2">
                          {suggestion.description}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };
  
  return (
    <Box>
      {(error || analysisError) && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setAnalysisError(null)}
        >
          {error || analysisError}
        </Alert>
      )}
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Set Up Analysis" icon={<UploadIcon />} iconPosition="start" />
        <Tab 
          label="View Results" 
          icon={<DescriptionIcon />} 
          iconPosition="start"
          disabled={!analysisData && !loading}
        />
      </Tabs>
      
      {loading || isAnalyzing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {isAnalyzing ? 'Analyzing Your Resume...' : 'Loading...'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isAnalyzing ? 'This may take a moment as we compare your resume to the job description.' : 'Please wait while we load your data.'}
          </Typography>
        </Box>
      ) : (
        <>
          <TabPanel value={activeTab} index={0}>
            {renderSetupForm()}
          </TabPanel>
          
          <TabPanel value={activeTab} index={1}>
            {renderResults()}
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default ResumeAnalysis; 