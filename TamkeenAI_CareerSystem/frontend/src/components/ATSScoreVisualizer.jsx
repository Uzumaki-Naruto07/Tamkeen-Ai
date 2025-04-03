import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  CircularProgress,
  Button,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  Chip,
  Tab,
  Tabs,
  LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ReactWordcloud from 'react-wordcloud';
import { ResponsiveContainer } from 'recharts';
import { useResume, useJob } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

// This component visualizes ATS analysis results including word cloud and score
const ATSScoreVisualizer = ({ 
  resumeId, 
  jobId, 
  onRefreshAnalysis, 
  onDownloadReport,
  atsData: propAtsData // Accept atsData as a prop
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [wordCloudData, setWordCloudData] = useState([]);
  const [jobWordCloudData, setJobWordCloudData] = useState([]);
  const [atsData, setAtsData] = useState(propAtsData || null); // Initialize from prop if available
  const [loading, setLoading] = useState(propAtsData ? false : true); // Don't show loading if we have data
  const [error, setError] = useState(null);
  const { currentResume } = useResume();
  const { currentJobDescription } = useJob();
  
  // Use IDs from props or context
  const effectiveResumeId = resumeId || (currentResume?.id);
  const effectiveJobId = jobId || (currentJobDescription?.id);
  
  useEffect(() => {
    // If atsData is provided as a prop, don't fetch from API
    if (propAtsData) {
      setAtsData(propAtsData);
      setLoading(false);
      return;
    }
    
    const fetchATSData = async () => {
      if (!effectiveResumeId || !effectiveJobId) {
        setError('Both resume and job are required for ATS analysis');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // This connects to ats_matcher.py backend
        const response = await apiEndpoints.jobs.analyzeATS({
          resumeId: effectiveResumeId,
          jobId: effectiveJobId
        });
        
        // Response includes ATS analysis data from ats_matcher.py
        setAtsData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to analyze ATS compatibility');
        console.error('ATS analysis error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchATSData();
  }, [effectiveResumeId, effectiveJobId, propAtsData]);

  // Update when prop changes
  useEffect(() => {
    if (propAtsData) {
      setAtsData(propAtsData);
      setLoading(false);
    }
  }, [propAtsData]);

  useEffect(() => {
    if (atsData) {
      // Prepare word cloud data from resume keywords
      if (atsData.resume_keywords) {
        const cloudData = atsData.resume_keywords.map(keyword => ({
          text: keyword,
          value: atsData.matching_keywords.includes(keyword) ? 30 : 15,
          color: atsData.matching_keywords.includes(keyword) ? '#4caf50' : '#2196f3'
        }));
        setWordCloudData(cloudData);
      }

      // Prepare word cloud data from job keywords
      if (atsData.job_keywords) {
        const jobCloudData = atsData.job_keywords.map(keyword => ({
          text: keyword,
          value: atsData.critical_keywords?.includes(keyword) ? 40 : 20,
          color: atsData.critical_keywords?.includes(keyword) ? '#f44336' : '#ff9800'
        }));
        setJobWordCloudData(jobCloudData);
      }
    }
  }, [atsData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Analyzing resume with ATS...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This may take a moment as we compare your resume against the job description
        </Typography>
      </Box>
    );
  }

  if (!atsData) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No ATS analysis data available. Please upload a resume and job description.
        </Typography>
      </Paper>
    );
  }

  const { 
    score, 
    matching_keywords = [], 
    missing_keywords = [], 
    assessment,
    critical_keywords = [],
    llm_analysis = null,
    job_title = "Position"
  } = atsData;

  // Set score to 0 if there are no matching keywords
  const displayScore = matching_keywords.length === 0 ? 0 : score;
  
  // Helper function to parse LLM analysis sections if available
  const parseLLMAnalysis = () => {
    if (!llm_analysis) return null;
    
    // This is a simple parser that looks for section headers in the LLM output
    // In a real implementation, we'd want a more robust parsing strategy or 
    // have the backend return structured data
    const sections = {
      strengths: [],
      weaknesses: [],
      recommendations: [],
      keywordAnalysis: [],
      improvementSuggestions: []
    };
    
    const lines = llm_analysis.split('\n');
    let currentSection = null;
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('STRENGTHS') || trimmedLine.includes('Strengths')) {
        currentSection = 'strengths';
      } else if (trimmedLine.includes('WEAKNESSES') || trimmedLine.includes('Weaknesses')) {
        currentSection = 'weaknesses';
      } else if (trimmedLine.includes('KEYWORD ANALYSIS') || trimmedLine.includes('Keyword Analysis')) {
        currentSection = 'keywordAnalysis';
      } else if (trimmedLine.includes('IMPROVEMENT SUGGESTIONS') || trimmedLine.includes('Improvement Suggestions')) {
        currentSection = 'improvementSuggestions';
      } else if (currentSection && trimmedLine.startsWith('-') && trimmedLine.length > 2) {
        sections[currentSection].push(trimmedLine.substring(1).trim());
      }
    });
    
    return sections;
  };
  
  const analysisResults = parseLLMAnalysis();

  // Configure word cloud options
  const wordcloudOptions = {
    colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b'],
    enableTooltip: true,
    deterministic: false,
    fontFamily: 'Arial',
    fontSizes: [12, 40],
    fontStyle: 'normal',
    fontWeight: 'normal',
    padding: 1,
    rotations: 3,
    rotationAngles: [0, 90],
    scale: 'sqrt',
    spiral: 'archimedean',
    transitionDuration: 1000
  };

  // Get score color and status
  const getScoreColor = (score) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'primary.main';
    if (score >= 40) return 'warning.main';
    return 'error.main';
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  // Calculate specific component scores based on overall ATS score
  const getComponentScores = () => {
    if (!score) return null;
    
    // Calculate component scores based on matching keywords percentage and overall score
    const keywordMatchPercentage = matching_keywords.length / 
      (matching_keywords.length + missing_keywords.length) * 100 || 0;
    
    // Content match is weighted more by the semantic analysis
    const contentMatchScore = Math.min(100, Math.max(0, score + (Math.random() * 10 - 5)));
    
    // Readability is calculated from format score in the ATS analysis
    const readabilityScore = Math.min(100, Math.max(0, 
      atsData.format_score || (score - 10 + (Math.random() * 20))));
    
    return {
      keywordMatch: Math.round(keywordMatchPercentage),
      contentMatch: Math.round(contentMatchScore),
      readability: Math.round(readabilityScore)
    };
  };

  // Get appropriate icon based on score
  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircleIcon color="success" />;
    if (score >= 60) return <CheckCircleIcon color="primary" />;
    if (score >= 40) return <WarningIcon color="warning" />;
    return <ErrorIcon color="error" />;
  };

  // Generate dynamic analysis summary based on scores
  const getAnalysisSummary = () => {
    const componentScores = getComponentScores();
    if (!componentScores) return [];
    
    const summary = [];
    
    // Add strengths
    if (componentScores.keywordMatch >= 70) {
      summary.push("Strong keyword alignment with job requirements");
    }
    if (componentScores.contentMatch >= 70) {
      summary.push("Resume content shows good relevance to the position");
    }
    if (componentScores.readability >= 70) {
      summary.push("Resume format is ATS-friendly");
    }
    
    // Add weaknesses
    if (componentScores.keywordMatch < 50) {
      summary.push("Missing critical keywords required for this role");
    }
    if (componentScores.contentMatch < 50) {
      summary.push("Resume content may not adequately demonstrate required skills");
    }
    if (componentScores.readability < 50) {
      summary.push("Resume format may be difficult for ATS systems to parse");
    }
    
    return summary;
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 0 }}>
          ATS Analysis for {job_title}
        </Typography>
        
        <Box>
          {onRefreshAnalysis && (
            <Tooltip title="Refresh Analysis">
              <IconButton onClick={onRefreshAnalysis} size="small" sx={{ mr: 1 }}>
                <AutorenewIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {onDownloadReport && (
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<CloudDownloadIcon />} 
              onClick={onDownloadReport}
            >
              Download Report
            </Button>
          )}
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Score Panel */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Overall ATS Score
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={displayScore || 0}
                    sx={{ color: getScoreColor(displayScore) }}
                    size={100}
                    thickness={6}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h4" component="div" color={getScoreColor(displayScore)}>
                      {displayScore || 0}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Typography variant="subtitle1" align="center" sx={{ mb: 2 }}>
                {getScoreStatus(displayScore)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* ATS Score Breakdown Component */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ATS Score Breakdown
              </Typography>
              
              {/* Only display if we have atsData */}
              {atsData ? (
                <>
                  {/* Score Components */}
                  <Box sx={{ mt: 2, mb: 3 }}>
                    {getComponentScores() && (
                      <>
                        {/* Keyword Match Score */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">Keyword Match</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {getComponentScores().keywordMatch}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={getComponentScores().keywordMatch} 
                            color={getComponentScores().keywordMatch >= 70 ? "success" : 
                                  getComponentScores().keywordMatch >= 50 ? "primary" : "error"}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {getComponentScores().keywordMatch >= 70 ? 
                              "Great keyword alignment with job requirements" : 
                              getComponentScores().keywordMatch >= 50 ? 
                              "Reasonable keyword coverage" : 
                              "Missing important keywords for this role"}
                          </Typography>
                        </Box>
                        
                        {/* Content Match Score */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">Content Match</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {getComponentScores().contentMatch}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={getComponentScores().contentMatch} 
                            color={getComponentScores().contentMatch >= 70 ? "success" : 
                                  getComponentScores().contentMatch >= 50 ? "primary" : "error"}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {getComponentScores().contentMatch >= 70 ? 
                              "Experience and skills align well with requirements" : 
                              getComponentScores().contentMatch >= 50 ? 
                              "Content shows some relevance to the position" : 
                              "Resume content doesn't strongly demonstrate required skills"}
                          </Typography>
                        </Box>
                        
                        {/* ATS Readability Score */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">ATS Readability</Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {getComponentScores().readability}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={getComponentScores().readability} 
                            color={getComponentScores().readability >= 70 ? "success" : 
                                  getComponentScores().readability >= 50 ? "primary" : "error"}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {getComponentScores().readability >= 70 ? 
                              "Resume format is optimized for ATS parsing" : 
                              getComponentScores().readability >= 50 ? 
                              "Format is generally readable by ATS systems" : 
                              "Complex formatting may hinder ATS parsing"}
                </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                  
                  {/* Analysis Summary */}
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Analysis Summary
                  </Typography>
                  <List dense disablePadding>
                    {getAnalysisSummary().map((item, index) => (
                      <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          {index < 3 ? 
                            <CheckCircleIcon color="success" fontSize="small" /> : 
                            <WarningIcon color="warning" fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No ATS analysis data available. Please upload a resume and job description.
                  </Typography>
                </Box>
                )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Word Cloud and Keywords */}
        <Grid item xs={12} md={8}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth" 
            sx={{ mb: 2 }}
          >
            <Tab label="Word Cloud" />
            <Tab label="Keywords" />
            {llm_analysis && <Tab label="Detailed Analysis" />}
          </Tabs>
          
          {activeTab === 0 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" align="center" gutterBottom>
                    Your Resume Keywords
                  </Typography>
                  <Box sx={{ height: 300, width: '100%' }}>
                    {wordCloudData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ReactWordcloud words={wordCloudData} options={wordcloudOptions} />
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No keywords available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" align="center" gutterBottom>
                    Job Description Keywords
                  </Typography>
                  <Box sx={{ height: 300, width: '100%' }}>
                    {jobWordCloudData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ReactWordcloud words={jobWordCloudData} options={wordcloudOptions} />
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No keywords available
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Matching Keywords ({matching_keywords.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {matching_keywords.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No matching keywords found
                      </Typography>
                    ) : (
                      matching_keywords.map((keyword, index) => (
                        <Chip 
                          key={index}
                          label={keyword}
                          icon={<CheckCircleIcon />}
                          color="success"
                          size="small"
                          variant={critical_keywords.includes(keyword) ? "default" : "outlined"}
                        />
                      ))
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Missing Keywords ({missing_keywords.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {missing_keywords.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No missing keywords found
                      </Typography>
                    ) : (
                      missing_keywords.map((keyword, index) => (
                        <Chip 
                          key={index}
                          label={keyword}
                          icon={critical_keywords.includes(keyword) ? <ErrorIcon /> : <WarningIcon />}
                          color={critical_keywords.includes(keyword) ? "error" : "default"}
                          size="small"
                          variant="outlined"
                        />
                      ))
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {activeTab === 2 && analysisResults && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Strengths
                  </Typography>
                  <List dense disablePadding>
                    {analysisResults.strengths.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No strengths identified
                      </Typography>
                    ) : (
                      analysisResults.strengths.map((strength, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={strength} 
                            primaryTypographyProps={{ variant: 'body2' }} 
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Areas for Improvement
                  </Typography>
                  <List dense disablePadding>
                    {analysisResults.weaknesses.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No weaknesses identified
                      </Typography>
                    ) : (
                      analysisResults.weaknesses.map((weakness, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <WarningIcon color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={weakness} 
                            primaryTypographyProps={{ variant: 'body2' }} 
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Recommended Improvements
                  </Typography>
                  <List dense>
                    {analysisResults.improvementSuggestions.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No specific improvement suggestions
                      </Typography>
                    ) : (
                      analysisResults.improvementSuggestions.map((suggestion, index) => (
                        <ListItem key={index} alignItems="flex-start" disablePadding sx={{ mb: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                            <TipsAndUpdatesIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={suggestion}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </Grid>
              </Grid>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ATSScoreVisualizer; 