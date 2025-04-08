import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Grid, 
  TextField, 
  CircularProgress,
  Alert,
  AlertTitle,
  Divider,
  Chip,
  Container
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// Import the PredictAPI client
import predictApi from '../../api/predictApiClient';

// Sample job description for demo
const SAMPLE_JOB_DESCRIPTION = `
Job Title: Full Stack Developer

About Us:
We are a dynamic tech company building innovative solutions for enterprise clients. Our team is passionate about creating high-quality, scalable applications that solve real-world problems.

Responsibilities:
- Design and develop web applications using React.js, Node.js, and related technologies
- Work with databases including MongoDB and PostgreSQL
- Collaborate with cross-functional teams to define, design, and ship new features
- Ensure the technical feasibility of UI/UX designs
- Optimize applications for maximum speed and scalability
- Build reusable code and libraries for future use

Requirements:
- 3+ years of experience in full stack development
- Strong proficiency in JavaScript, and React.js
- Experience with Node.js and Express.js
- Familiarity with RESTful APIs
- Knowledge of MongoDB and PostgreSQL
- Understanding of fundamental design principles
- Experience with version control systems (Git)
- Excellent problem-solving skills
- BSc in Computer Science or equivalent practical experience

Nice to Have:
- Experience with TypeScript
- Knowledge of AWS services
- Experience with CI/CD pipelines
- Familiarity with agile methodologies
`;

const PredictApiDemo = () => {
  // State for health check
  const [healthStatus, setHealthStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for resume upload
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('Full Stack Developer');
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB_DESCRIPTION);
  
  // State for analysis results
  const [analysisResults, setAnalysisResults] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  
  // Check health on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      setIsLoading(true);
      try {
        const status = await predictApi.checkHealth();
        setHealthStatus(status);
      } catch (error) {
        console.error('Error checking API health:', error);
        setHealthStatus({ status: 'error', message: 'Failed to connect to API' });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkApiHealth();
  }, []);
  
  // Handle file upload
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!file) {
      setAnalysisError('Please select a resume file');
      return;
    }
    
    setIsLoading(true);
    setAnalysisError(null);
    setAnalysisResults(null);
    
    try {
      const results = await predictApi.analyzeResume(file, jobTitle, jobDescription);
      
      if (results.error) {
        setAnalysisError(results.error);
      } else {
        setAnalysisResults(results);
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      setAnalysisError('Failed to analyze resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Connection status display
  const renderConnectionStatus = () => {
    if (!healthStatus) {
      return null;
    }
    
    const isConnected = healthStatus.status === 'ok';
    const isMockData = healthStatus.using_mock;
    
    return (
      <Alert 
        severity={isConnected ? 'success' : 'error'}
        icon={isConnected ? <CheckCircleIcon /> : <ErrorIcon />}
        sx={{ mb: 3 }}
      >
        <AlertTitle>
          {isConnected ? 'PredictAPI Connected' : 'PredictAPI Connection Failed'}
        </AlertTitle>
        {isConnected ? (
          <>
            Server is running and {isMockData ? 'using mock data' : 'connected to DeepSeek API'}
          </>
        ) : (
          <>
            Could not connect to PredictAPI server. Please make sure it's running.
          </>
        )}
      </Alert>
    );
  };
  
  // Analysis results display
  const renderAnalysisResults = () => {
    if (!analysisResults) {
      return null;
    }
    
    return (
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Analysis Results
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Using mock data:</strong> {analysisResults.using_mock_data ? 'Yes' : 'No'}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            <strong>Resume-job match score:</strong> {analysisResults.score}/100
          </Typography>
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Analysis:
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {analysisResults.analysis}
          </Typography>
        </Box>
        
        {analysisResults.using_mock_data && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <AlertTitle>Using mock data</AlertTitle>
            <Typography variant="body2">
              This analysis is using mock data because either:
              <ul>
                <li>No DeepSeek API key is configured</li>
                <li>Mock data mode is explicitly enabled</li>
                <li>There was an error connecting to the DeepSeek API</li>
              </ul>
              To use real analysis, please configure a DeepSeek API key in the backend.
            </Typography>
          </Alert>
        )}
      </Paper>
    );
  };
  
  return (
    <Container>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            PredictAPI Demo
          </Typography>
          <Typography variant="body1" color="text.secondary">
            This demo shows how the PredictAPI service can be used to analyze resumes,
            using DeepSeek AI with automatic fallback to mock data.
          </Typography>
        </Box>
        
        {renderConnectionStatus()}
        
        {analysisError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {analysisError}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ p: 2, border: '2px dashed', borderRadius: 2 }}
              >
                {file ? file.name : 'Select Resume File (PDF, DOC, DOCX)'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Job Title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Job Description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                fullWidth
                required
                multiline
                rows={10}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading || !file}
                startIcon={isLoading ? <CircularProgress size={20} /> : <AnalyticsIcon />}
                fullWidth
                size="large"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Resume'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      
      {renderAnalysisResults()}
    </Container>
  );
};

export default PredictApiDemo; 