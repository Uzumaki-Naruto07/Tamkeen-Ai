import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Tooltip,
  TextField, InputAdornment, Badge, Tab, Tabs, Collapse
} from '@mui/material';
import {
  Timeline as TimelineIcon, BarChart, Assessment, TrendingUp, TrendingDown,
  History, CompareArrows, Download, Visibility, VisibilityOff, Print,
  FilterList, DateRange, Share, CloudDownload, Info, Star, StarBorder,
  CheckCircle, MoreVert, ArrowUpward, ArrowDownward, Error as ErrorIcon,
  Warning, WbIncandescent, Assignment, Compare, Delete, Refresh, OpenInNew,
  Lightbulb
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser, useResume } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, subDays, parseISO } from 'date-fns';
import ResumeScoreCard from '../components/ResumeScoreCard';
import ResumeUpload from '../components/ResumeUpload';

// Charts
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart as RechartsBarChart, Bar, ReferenceLine, Area,
  AreaChart, Scatter, ScatterChart, ZAxis, Cell, Radar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Custom Components
import SkillChip from '../components/common/SkillChip';
import ScoreGauge from '../components/ScoreGauge';
import TimelineComponent from '../components/TimelineComponent';

/**
 * Page to track and compare resume scores
 */
const ResumeScoreTracker = () => {
  const [resumes, setResumes] = useState([]);
  const [resumeScores, setResumeScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Fetch user's resumes
  useEffect(() => {
    const fetchResumes = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiEndpoints.resumes.getUserResumes(profile.id);
        setResumes(response.data);
        
        // If we have resumes, analyze the first one
        if (response.data.length > 0) {
          setSelectedResume(response.data[0]);
        }
      } catch (err) {
        setError('Failed to load your resumes');
        console.error('Error fetching resumes:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResumes();
  }, [profile]);
  
  // Analyze selected resume
  useEffect(() => {
    const analyzeResume = async () => {
      if (!selectedResume) return;
      
      setAnalyzing(true);
      
      try {
        // Get any saved job target
        const userResponse = await apiEndpoints.user.getProfile();
        const targetJobs = userResponse.data.targetJobs || [];
        
        // Use the first target job, or fetch popular jobs if none set
        let jobId = null;
        if (targetJobs.length > 0) {
          jobId = targetJobs[0].id;
        } else {
          const jobsResponse = await apiEndpoints.jobs.getPopular();
          if (jobsResponse.data.length > 0) {
            jobId = jobsResponse.data[0].id;
          }
        }
        
        if (jobId) {
          // Fetch ATS analysis
          const analysisResponse = await apiEndpoints.analytics.analyzeResume(selectedResume.id, jobId);
      
          // Save to state
          setResumeScores(prev => ({
            ...prev,
            [selectedResume.id]: {
              atsResults: analysisResponse.data,
              jobId,
              timestamp: new Date().toISOString()
            }
          }));
        }
      } catch (err) {
        console.error('Error analyzing resume:', err);
      } finally {
        setAnalyzing(false);
    }
  };
  
    if (selectedResume && !resumeScores[selectedResume.id]) {
      analyzeResume();
    }
  }, [selectedResume, resumeScores]);
  
  // Handle analyzing additional resumes
  const handleAnalyzeResume = async (resumeId) => {
    const resumeToAnalyze = resumes.find(r => r.id === resumeId);
    if (!resumeToAnalyze) return;
    
    setAnalyzing(true);
    
    try {
      // Similar logic to the useEffect above
      const userResponse = await apiEndpoints.user.getProfile();
      const targetJobs = userResponse.data.targetJobs || [];
      
      let jobId = null;
      if (targetJobs.length > 0) {
        jobId = targetJobs[0].id;
      } else {
        const jobsResponse = await apiEndpoints.jobs.getPopular();
        if (jobsResponse.data.length > 0) {
          jobId = jobsResponse.data[0].id;
        }
      }
      
      if (jobId) {
        const analysisResponse = await apiEndpoints.analytics.analyzeResume(resumeId, jobId);
        
        setResumeScores(prev => ({
          ...prev,
          [resumeId]: {
            atsResults: analysisResponse.data,
            jobId,
            timestamp: new Date().toISOString()
          }
        }));
      }
    } catch (err) {
      console.error('Error analyzing resume:', err);
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Handle resume upload success
  const handleResumeUploaded = (newResume) => {
    setResumes(prev => [...prev, newResume]);
    setSelectedResume(newResume);
  };
  
  // Handle viewing a resume
  const handleViewResume = (resumeId) => {
    navigate(`/resume/${resumeId}`);
  };
  
  // Handle deleting a resume
  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }
    
    try {
      await apiEndpoints.resumes.deleteResume(resumeId);
      
      // Remove from state
      setResumes(prev => prev.filter(r => r.id !== resumeId));
      
      // If the deleted resume was selected, select another one
      if (selectedResume?.id === resumeId) {
        const remaining = resumes.filter(r => r.id !== resumeId);
        setSelectedResume(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error('Error deleting resume:', err);
      alert('Failed to delete resume. Please try again.');
    }
  };
  
  // Get score for a resume
  const getResumeScore = (resumeId) => {
    const scoreData = resumeScores[resumeId];
    if (!scoreData) return null;
    
    return scoreData.atsResults.score || 0;
  };
  
  // Get score color based on value
  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };
  
  if (loading) {
    return <LoadingSpinner message="Loading your resume data..." />;
  }
  
  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
            Resume Score Tracker
          </Typography>
          
        <ResumeUpload onComplete={handleResumeUploaded} />
        </Box>
        
      {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
      )}
      
      {resumes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Resumes Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload your first resume to start tracking your scores and optimizing for job applications.
          </Typography>
        </Paper>
        ) : (
        <Grid container spacing={3}>
          {/* Selected Resume Score Card */}
          {selectedResume && (
            <Grid item xs={12}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Current Selected Resume: {selectedResume.title}
                    </Typography>
                    
                {analyzing ? (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      Analyzing resume...
                    </Typography>
                  </Paper>
                ) : resumeScores[selectedResume.id] ? (
                  <>
                    <ResumeScoreCard 
                      resumeData={selectedResume} 
                      atsResults={resumeScores[selectedResume.id].atsResults}
                      onViewDetails={() => handleViewResume(selectedResume.id)}
                    />
                    
                    {/* AI Suggestions Panel */}
                    {resumeScores[selectedResume.id].atsResults.optimizations?.length > 0 && (
                      <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">
                            AI-Powered Resume Suggestions
                          </Typography>
                          
                          <Button 
                            variant="contained" 
                            color="primary"
                            size="small"
                            onClick={() => handleViewResume(selectedResume.id)}
                          >
                            Apply Suggestions
                          </Button>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Our AI has analyzed your resume and found these opportunities for improvement:
                          </Typography>
                        
                        <List>
                          {resumeScores[selectedResume.id].atsResults.optimizations.map((suggestion, index) => (
                            <ListItem 
                              key={index} 
                              sx={{ 
                                bgcolor: 'background.default', 
                                mb: 1, 
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            >
                              <ListItemIcon>
                                <Lightbulb color="warning" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={
                                  <Typography variant="subtitle2">
                                    {suggestion.title || `Suggestion ${index + 1}`}
                            </Typography>
                                }
                                secondary={suggestion.description}
                              />
                            </ListItem>
                          ))}
                        </List>
                        
                        {!resumeScores[selectedResume.id].atsResults.optimizations?.length && (
                          <Box sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                              No suggestions available for this resume.
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    )}
                  </>
                ) : (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Button 
                      variant="contained"
                      startIcon={<Assessment />}
                      onClick={() => handleAnalyzeResume(selectedResume.id)}
                    >
                      Analyze This Resume
                    </Button>
                  </Paper>
                )}
                        </Box>
            </Grid>
          )}
          
          {/* Resume Table */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              All Resumes
                      </Typography>
                      
            <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                    <TableCell>Resume Name</TableCell>
                    <TableCell align="center">Last Updated</TableCell>
                    <TableCell align="center">ATS Score</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                  {resumes.map((resume) => {
                    const score = getResumeScore(resume.id);
                    const scoreColor = score !== null ? getScoreColor(score) : null;
                    
                    return (
                          <TableRow 
                        key={resume.id}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          bgcolor: selectedResume?.id === resume.id ? 'action.selected' : 'inherit'
                        }}
                        onClick={() => setSelectedResume(resume)}
                      >
                            <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {resume.title}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {new Date(resume.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          {score !== null ? (
                            <Chip 
                              label={`${score}%`} 
                              color={scoreColor}
                              size="small"
                            />
                          ) : (
                            <Chip 
                              label="Not analyzed" 
                              variant="outlined"
                              size="small"
                            />
                          )}
                            </TableCell>
                        <TableCell align="center">
                          {score !== null ? (
                            score >= 70 ? (
                              <Chip icon={<TrendingUp />} label="Strong" color="success" size="small" />
                            ) : score >= 50 ? (
                              <Chip icon={<BarChart />} label="Average" color="warning" size="small" />
                                  ) : (
                              <Chip icon={<TrendingDown />} label="Needs Work" color="error" size="small" />
                            )
                              ) : (
                            <Chip label="Unknown" variant="outlined" size="small" />
                              )}
                            </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Resume">
                                  <IconButton 
                                    size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewResume(resume.id);
                              }}
                                  >
                              <OpenInNew fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                          {!resumeScores[resume.id] && (
                            <Tooltip title="Analyze Resume">
                                  <IconButton 
                                    size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnalyzeResume(resume.id);
                                }}
                                  >
                                <Assessment fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Delete Resume">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteResume(resume.id);
                              }}
                            >
                              <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                            </TableCell>
                          </TableRow>
                    );
                  })}
                      </TableBody>
                    </Table>
                  </TableContainer>
              </Grid>
            </Grid>
          )}
    </Box>
  );
};

export default ResumeScoreTracker;