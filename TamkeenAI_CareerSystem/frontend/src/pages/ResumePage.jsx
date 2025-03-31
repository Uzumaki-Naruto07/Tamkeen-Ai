import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Tabs, Tab,
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton,
  Grid, List, ListItem, ListItemText,
  ListItemSecondaryAction, Alert, Divider, CircularProgress,
  Card, CardContent, Chip, Avatar, Tooltip, Badge,
  Fade, useTheme, useMediaQuery, LinearProgress,
  ListItemIcon
} from '@mui/material';
import {
  Description, Add, Delete, Edit,
  Download, Share, Analytics, Compare, CloudQueue,
  Timeline, Refresh, Assessment, CheckCircle, Speed,
  ArrowUpward, ArrowForward, Star, StarBorder, History,
  FileCopy, Visibility, GetApp, Send, BarChart,
  TrendingUp, School, Work, Code, Tune, FilterList,
  Info, Label
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useResume } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import ResumeBuilder from '../components/ResumeBuilder';
import ResumeAnalyzer from '../components/ResumeAnalyzer';
import JobMatchCalculator from '../components/JobMatchCalculator';
import WordCloudVisualizer from '../components/WordCloudVisualizer';
import LoadingSpinner from '../components/LoadingSpinner';
import ATSResultsCard from '../components/ATSResultsCard';
import SkillGapAnalysis from '../components/Dashboard/SkillGapAnalysis';
import ResumeOptimizer from '../components/ResumeOptimizer';
import ResumeUploader from '../components/ResumeUploader';
import SkillVisualization3D from '../components/SkillVisualization3D';
import FeaturedJobsCarousel from '../components/FeaturedJobsCarousel';
import ResumeScoreChart from '../components/ResumeScoreChart';
import AiFeedbackSystem from '../components/AiFeedbackSystem';
import ResumeVersionControl from '../components/ResumeVersionControl';
import JobSpecificCustomization from '../components/JobSpecificCustomization';
import EnhancedExportOptions from '../components/EnhancedExportOptions';
import KeywordsExtractor from '../components/KeywordsExtractor';

// Add custom styling for animations
const fadeTransition = {
  in: { opacity: 1, transform: 'translateY(0)' },
  out: { opacity: 0, transform: 'translateY(-20px)' },
};

const ResumePage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [skillGapData, setSkillGapData] = useState(null);
  const [resumeVersions, setResumeVersions] = useState([]);
  const [resumeScore, setResumeScore] = useState(null);
  const [quickApplyJobs, setQuickApplyJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [resumeHistory, setResumeHistory] = useState([]);
  const [versionControlVisible, setVersionControlVisible] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { profile } = useUser();
  const { setCurrentResume } = useResume();
  
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
        
        // If resumeId is provided in URL, select that resume
        if (resumeId) {
          const resume = response.data.find(r => r.id === resumeId);
          if (resume) {
            setSelectedResume(resume);
            setCurrentResume(resume);
          } else {
            setError(`Resume with ID ${resumeId} not found`);
          }
        } else if (response.data.length > 0) {
          // Otherwise select the first resume
          setSelectedResume(response.data[0]);
          setCurrentResume(response.data[0]);
        }
      } catch (err) {
        setError('Failed to load your resumes');
        console.error('Error fetching resumes:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResumes();
  }, [profile, resumeId, setCurrentResume]);
  
  // Fetch saved jobs
  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const response = await apiEndpoints.jobs.getSavedJobs();
        if (response.data) {
          setSavedJobs(response.data.map(job => job.id));
        }
      } catch (err) {
        console.error('Error fetching saved jobs:', err);
      }
    };
    
    fetchSavedJobs();
  }, []);
  
  // Fetch resume history data for the chart
  useEffect(() => {
    if (!selectedResume) return;
    
    const fetchResumeHistory = async () => {
      try {
        const response = await apiEndpoints.resumes.getHistory(selectedResume.id);
        if (response.data) {
          // Format data for the chart
          const historyData = response.data.map(item => ({
            date: item.date,
            score: item.score,
            changes: item.changes || `Version ${item.version}`
          }));
          
          setResumeHistory(historyData);
        }
      } catch (err) {
        console.error('Error fetching resume history:', err);
      }
    };
    
    fetchResumeHistory();
  }, [selectedResume]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle creating a new resume
  const handleCreateResume = async () => {
    if (!newResumeTitle.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await apiEndpoints.resumes.createResume({
        title: newResumeTitle,
        userId: profile.id
      });
      
      // Add new resume to list and select it
      setResumes(prev => [...prev, response.data]);
      setSelectedResume(response.data);
      setCurrentResume(response.data);
      setDialogOpen(false);
      setNewResumeTitle('');
      
      // Navigate to the edit tab
      setTabValue(0);
    } catch (err) {
      setError('Failed to create new resume');
      console.error('Error creating resume:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle saving resume
  const handleSaveResume = async (resumeData) => {
    setLoading(true);
    
    try {
      const response = await apiEndpoints.resumes.updateResume(selectedResume.id, {
        ...resumeData,
        userId: profile.id
      });
      
      // Update resume in list
      setResumes(prev => prev.map(resume => 
        resume.id === selectedResume.id ? response.data : resume
      ));
      
      setSelectedResume(response.data);
      setCurrentResume(response.data);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save resume');
      console.error('Error saving resume:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deleting resume
  const handleDeleteResume = async () => {
    if (!resumeToDelete) return;
    
    setLoading(true);
    
    try {
      await apiEndpoints.resumes.deleteResume(resumeToDelete.id);
      
      // Remove deleted resume from list
      setResumes(prev => prev.filter(resume => resume.id !== resumeToDelete.id));
      
      // If the deleted resume was selected, select another one
      if (selectedResume?.id === resumeToDelete.id) {
        const newSelectedResume = resumes.find(resume => resume.id !== resumeToDelete.id);
        setSelectedResume(newSelectedResume || null);
        setCurrentResume(newSelectedResume || null);
      }
      
      setDeleteDialog(false);
      setResumeToDelete(null);
    } catch (err) {
      setError('Failed to delete resume');
      console.error('Error deleting resume:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Add function to request resume analysis
  const handleAnalyzeResume = async () => {
    if (!selectedResume) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // First, get any saved job target
      const userResponse = await apiEndpoints.user.getProfile();
      const targetJobs = userResponse.data.targetJobs || [];
      
      // Use the first target job, or fetch popular jobs if none set
      let jobId = null;
      let jobDetails = null;
      
      if (targetJobs.length > 0) {
        jobDetails = targetJobs[0];
        setJobData(jobDetails);
        jobId = jobDetails.id;
      } else {
        const jobsResponse = await apiEndpoints.jobs.getPopular();
        if (jobsResponse.data.length > 0) {
          jobDetails = jobsResponse.data[0];
          setJobData(jobDetails);
          jobId = jobDetails.id;
        }
      }
      
      if (jobId) {
        // Fetch ATS analysis
        const analysisResponse = await apiEndpoints.analytics.analyzeResume(
          selectedResume.id, 
          jobId, 
          { includeLLM: true }
        );
        setAnalysisData(analysisResponse.data);
        
        // Fetch skill gap data
        const skillGapResponse = await apiEndpoints.skills.getSkillGap(profile.id, jobId);
        setSkillGapData(skillGapResponse.data);
        
        // Generate AI suggestions based on analysis
        generateAiSuggestions(selectedResume.id, analysisResponse.data, jobDetails);
      } else {
        setError("No job target found. Please set a target job in your profile.");
      }
    } catch (err) {
      setError('Failed to analyze resume. Please try again.');
      console.error('Error analyzing resume:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Generate AI-powered suggestions
  const generateAiSuggestions = async (resumeId, analysisData, jobData) => {
    try {
      const response = await apiEndpoints.ai.getResumeSuggestions({
        resumeId: resumeId,
        analysisData: analysisData,
        jobTitle: jobData?.title || 'Unspecified Job',
        jobDescription: jobData?.description || ''
      });
      
      // Update state with AI suggestions
      setAnalysisData(prev => ({
        ...prev,
        aiSuggestions: response.data
      }));
    } catch (err) {
      console.error('Error generating AI suggestions:', err);
      // Don't set error state as this is a supplementary feature
    }
  };
  
  // Add function to apply AI suggestions to resume
  const handleApplySuggestion = async (suggestionId, content) => {
    if (!selectedResume || !content) return false;
    
    try {
      // Apply the suggestion
      const updatedResume = { ...selectedResume };
      const suggestion = analysisData?.aiSuggestions?.suggestions?.find(s => s.id === suggestionId);
      
      if (!suggestion) return false;
      
      // Apply based on suggestion category
      switch (suggestion.category) {
        case 'summary':
          if (!updatedResume.personal) updatedResume.personal = {};
          updatedResume.personal.summary = content;
          break;
        case 'skills':
          // Extract skills from content
          const skillsToAdd = content.split(/[,\n]/).map(skill => skill.trim()).filter(Boolean);
          if (!updatedResume.skills) updatedResume.skills = [];
          // Add new skills
          skillsToAdd.forEach(skill => {
            if (!updatedResume.skills.some(s => s.name === skill)) {
              updatedResume.skills.push({ name: skill });
            }
          });
          break;
        case 'experience':
          // For experience, we would need more context to know which experience entry to modify
          // This is a simplified approach - in a real implementation, you would have more context
          if (updatedResume.experience && updatedResume.experience.length > 0) {
            updatedResume.experience[0].description = content;
          }
          break;
        default:
          // For other suggestions, we might need different handling
          console.warn('Unsupported suggestion category:', suggestion.category);
          return false;
      }
      
      // Save the updated resume
      await handleSaveResume(updatedResume);
      
      // Call the API to mark the suggestion as applied
      await apiEndpoints.ai.applySuggestion(selectedResume.id, suggestionId);
      
      return true;
    } catch (err) {
      console.error('Error applying suggestion:', err);
      return false;
    }
  };
  
  // Add function to apply optimizer suggestions
  const handleApplyOptimizations = (section, improved, index) => {
    if (!selectedResume) return;
    
    const updatedResume = { ...selectedResume };
    
    // Apply changes based on section
    if (section === 'summary' && improved) {
      if (!updatedResume.personal) updatedResume.personal = {};
      updatedResume.personal.summary = improved;
    }
    else if (section === 'experience' && improved && index !== undefined) {
      if (!updatedResume.experience) updatedResume.experience = [];
      if (updatedResume.experience[index]) {
        updatedResume.experience[index].description = improved;
      }
    }
    else if (section === 'skills' && Array.isArray(improved)) {
      if (!updatedResume.skills) updatedResume.skills = [];
      // Add new skills
      improved.forEach(skill => {
        if (!updatedResume.skills.some(s => s.name === skill)) {
          updatedResume.skills.push({ name: skill });
        }
      });
    }
    else if (section === 'all' && improved?.sections) {
      // Apply all suggestions
      const suggestions = improved.sections;
      
      // Update summary
      if (suggestions.summary?.improved) {
        if (!updatedResume.personal) updatedResume.personal = {};
        updatedResume.personal.summary = suggestions.summary.improved;
      }
      
      // Update experience items
      if (suggestions.experience?.items) {
        if (!updatedResume.experience) updatedResume.experience = [];
        suggestions.experience.items.forEach((item, idx) => {
          if (updatedResume.experience[idx]) {
            updatedResume.experience[idx].description = item.improved;
          }
        });
      }
    }
    
    // Save the updated resume
    handleSaveResume(updatedResume);
    return true;
  };
  
  // New function to fetch resume versions and history
  const fetchResumeVersions = async (id) => {
    if (!id) return;
    
    try {
      const response = await apiEndpoints.resumes.getVersions(id);
      setResumeVersions(response.data || []);
    } catch (err) {
      console.error('Error fetching resume versions:', err);
    }
  };
  
  // New function to calculate resume score
  const calculateResumeScore = () => {
    if (!selectedResume) return null;
    
    // Base score starts at 40
    let score = 40;
    
    // Add points for different resume sections
    if (selectedResume.personal?.summary) score += 10;
    
    // Experience sections (up to 20 points)
    if (selectedResume.experience?.length) {
      score += Math.min(selectedResume.experience.length * 5, 20);
    }
    
    // Skills (up to 15 points)
    if (selectedResume.skills?.length) {
      score += Math.min(selectedResume.skills.length, 15);
    }
    
    // Education (up to 10 points)
    if (selectedResume.education?.length) {
      score += Math.min(selectedResume.education.length * 5, 10);
    }
    
    // Projects (up to 5 points)
    if (selectedResume.projects?.length) {
      score += Math.min(selectedResume.projects.length * 2, 5);
    }
    
    // Ensure we don't exceed 100
    return Math.min(score, 100);
  };
  
  // New function to fetch recommended jobs for quick apply
  const fetchQuickApplyJobs = async () => {
    if (!selectedResume) return;
    
    try {
      const response = await apiEndpoints.jobs.getRecommended(selectedResume.id);
      setQuickApplyJobs(response.data || []);
    } catch (err) {
      console.error('Error fetching quick apply jobs:', err);
    }
  };
  
  // Effect to update resume score when selected resume changes
  useEffect(() => {
    if (selectedResume) {
      setResumeScore(calculateResumeScore());
      fetchResumeVersions(selectedResume.id);
      fetchQuickApplyJobs();
    }
  }, [selectedResume]);
  
  // Handle job application
  const handleQuickApply = async (jobId) => {
    if (!selectedResume) return;
    
    try {
      await apiEndpoints.jobs.applyToJob(jobId, selectedResume.id);
      // Show success message
      alert('Successfully applied to job!');
    } catch (err) {
      setError('Failed to apply for job');
      console.error('Error applying for job:', err);
    }
  };
  
  // Add handler for restoring a previous version
  const handleRestoreVersion = async (versionId) => {
    if (!selectedResume) return;
    
    setLoading(true);
    
    try {
      const response = await apiEndpoints.resumes.restoreVersion(selectedResume.id, versionId);
      
      // Update resume in list
      setResumes(prev => prev.map(resume => 
        resume.id === selectedResume.id ? response.data : resume
      ));
      
      setSelectedResume(response.data);
      setCurrentResume(response.data);
      
      // Show success message
      alert('Resume version restored successfully');
    } catch (err) {
      setError('Failed to restore resume version');
      console.error('Error restoring resume version:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Add handler for saving a new version
  const handleSaveVersion = async (name) => {
    if (!selectedResume) return;
    
    setLoading(true);
    
    try {
      const response = await apiEndpoints.resumes.saveVersion(selectedResume.id, { name });
      
      // Fetch versions again to include the new one
      fetchResumeVersions(selectedResume.id);
      
      return true;
    } catch (err) {
      setError('Failed to save resume version');
      console.error('Error saving resume version:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Add handler for saving customized resume
  const handleSaveCustomization = async (customizedResume, metadata) => {
    if (!customizedResume) return;
    
    setLoading(true);
    
    try {
      const response = await apiEndpoints.resumes.saveCustomization(customizedResume, metadata);
      
      // Add new resume to list and select it
      setResumes(prev => [...prev, response.data]);
      setSelectedResume(response.data);
      setCurrentResume(response.data);
      
      // Show success message
      alert('Customized resume saved successfully');
      
      return true;
    } catch (err) {
      setError('Failed to save customized resume');
      console.error('Error saving customized resume:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Render the resume sidebar (now with a modern card-based design)
  const renderResumeSidebar = () => (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 2, 
      boxShadow: theme.shadows[3],
      position: 'relative', 
      overflow: 'visible'
    }}>
      <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          p: 2, 
          borderTopLeftRadius: 8, 
          borderTopRightRadius: 8,
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          color: 'white',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <Typography variant="h6" component="div">
            My Resumes
          </Typography>
          
          <Tooltip title="Create New Resume">
            <IconButton 
          onClick={() => setDialogOpen(true)}
          size="small"
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
        >
              <Add />
            </IconButton>
          </Tooltip>
      </Box>
      
        <Divider />
        
        <Box sx={{ mb: 2, p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Upload Resume
          </Typography>
          <ResumeUploader onUploadSuccess={(newResume) => {
            setResumes(prev => [...prev, newResume]);
            setSelectedResume(newResume);
            setCurrentResume(newResume);
            navigate(`/resume/${newResume.id}`);
          }} />
        </Box>
        
        <Divider />
        
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 0 }}>
      {resumes.length > 0 ? (
            <List disablePadding>
          {resumes.map(resume => (
            <ListItem
              key={resume.id}
              button
              selected={selectedResume?.id === resume.id}
              onClick={() => {
                setSelectedResume(resume);
                setCurrentResume(resume);
                navigate(`/resume/${resume.id}`);
              }}
                  sx={{ 
                    transition: 'all 0.2s',
                    borderLeft: selectedResume?.id === resume.id ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                    bgcolor: selectedResume?.id === resume.id ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    '&:hover': {
                      bgcolor: selectedResume?.id === resume.id ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)'
                    }
              }}
            >
              <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Description 
                          fontSize="small" 
                          color={selectedResume?.id === resume.id ? "primary" : "action"} 
                          sx={{ mr: 1 }} 
                        />
                        <Typography variant="body1" noWrap>
                          {resume.title}
                        </Typography>
                      </Box>
                    }
                secondary={`Last updated: ${new Date(resume.updatedAt).toLocaleDateString()}`}
              />
              
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                    setResumeToDelete(resume);
                    setDeleteDialog(true);
                  }}
                      sx={{ color: theme.palette.error.main }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary" variant="body2">
            No resumes yet. Create your first resume!
          </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => setDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                Create Resume
              </Button>
        </Box>
      )}
        </Box>
        
        {selectedResume && (
          <Box sx={{ p: 2, bgcolor: 'background.default' }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Resume Strength
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{ flexGrow: 1, mr: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={resumeScore || 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 5,
                      bgcolor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        bgcolor: resumeScore > 80 ? 'success.main' : 
                                resumeScore > 60 ? 'primary.main' : 
                                resumeScore > 40 ? 'warning.main' : 'error.main',
                      }
                    }}
                  />
                </Box>
                <Typography 
                  variant="h6" 
                  color={
                    resumeScore > 80 ? 'success.main' : 
                    resumeScore > 60 ? 'primary.main' : 
                    resumeScore > 40 ? 'warning.main' : 'error.main'
                  }
                >
                  {resumeScore}%
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {resumeScore > 80 ? 'Excellent' : 
                 resumeScore > 60 ? 'Good' : 
                 resumeScore > 40 ? 'Average' : 'Needs Work'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<GetApp />}
                onClick={() => {
                  // Download resume as PDF
                  apiEndpoints.resumes.downloadPdf(selectedResume.id);
                }}
              >
                Download
              </Button>
              
              <Button
                size="small"
                variant="outlined"
                startIcon={<Share />}
                onClick={() => {
                  // Share resume functionality
                  const shareUrl = `${window.location.origin}/shared-resume/${selectedResume.id}`;
                  navigator.clipboard.writeText(shareUrl);
                  alert('Share link copied to clipboard!');
                }}
              >
                Share
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
  
  // Enhanced tabs with better styling
  const renderTabHeader = () => (
    <Paper sx={{ 
      borderRadius: 2, 
      mb: 3, 
      boxShadow: theme.shadows[3],
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        bgcolor: 'background.paper',
        position: 'relative'
      }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          sx={{ minHeight: 64 }}
        >
          <Tab 
            icon={<Edit />} 
            label={isMobile ? null : "Edit"} 
            iconPosition={isMobile ? 'start' : 'top'}
          />
          <Tab 
            icon={<Analytics />} 
            label={isMobile ? null : "Analyze"} 
            iconPosition={isMobile ? 'start' : 'top'}
          />
          <Tab 
            icon={<Compare />} 
            label={isMobile ? null : "Match"} 
            iconPosition={isMobile ? 'start' : 'top'}
          />
          <Tab 
            icon={<Label />} 
            label={isMobile ? null : "Keywords"} 
            iconPosition={isMobile ? 'start' : 'top'}
          />
          <Tab 
            icon={<Work />} 
            label={isMobile ? null : "Jobs"} 
            iconPosition={isMobile ? 'start' : 'top'}
          />
          <Tab 
            icon={<Tune />} 
            label={isMobile ? null : "Features"} 
            iconPosition={isMobile ? 'start' : 'top'}
          />
        </Tabs>
        
        {/* Optional quick actions */}
        <Box sx={{ 
          position: 'absolute', 
          right: 16, 
          top: '50%', 
          transform: 'translateY(-50%)', 
          display: { xs: 'none', md: 'flex' },
          gap: 1
        }}>
          {selectedResume && tabValue === 0 && (
            <>
              <Tooltip title="Export Options">
                <IconButton size="small" color="primary">
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Resume Versions">
                <IconButton 
                  size="small" 
                  color="primary"
                  onClick={() => setVersionControlVisible(!versionControlVisible)}
                >
                  <History />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
  
  // Add Quick Apply section 
  const renderQuickApplySection = () => {
    if (!quickApplyJobs || quickApplyJobs.length === 0) return null;
    
    return (
      <Card sx={{ 
        my: 3, 
        borderRadius: 2, 
        boxShadow: theme.shadows[3]
      }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2
          }}>
            <Typography variant="h6">
              Quick Apply Based on Your Resume
            </Typography>
            
            <EnhancedExportOptions 
              resumeId={selectedResume?.id}
              resumeData={selectedResume}
            />
          </Box>
          
          <Grid container spacing={2}>
            {quickApplyJobs.slice(0, 3).map(job => (
              <Grid item xs={12} md={4} key={job.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                      <Avatar 
                        src={job.companyLogo} 
                        alt={job.company}
                        variant="rounded"
                        sx={{ mr: 1.5, width: 40, height: 40 }}
                      >
                        {job.company?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" noWrap>
                          {job.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {job.company}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', mb: 1.5 }}>
                      <Chip 
                        size="small" 
                        label={`${job.matchPercentage || 75}% Match`}
                        color="primary"
                        sx={{ mr: 1 }}
                      />
                      <Chip size="small" label={job.location} />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        View
                      </Button>
                      
                      <Button
                        size="small"
                        variant="contained"
                        color={job.applied ? "success" : "primary"}
                        startIcon={job.applied ? <CheckCircle /> : <Send />}
                        onClick={() => !job.applied && handleQuickApply(job.id)}
                        disabled={job.applied}
                      >
                        {job.applied ? "Applied" : "Quick Apply"}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {quickApplyJobs.length > 3 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button 
                endIcon={<ArrowForward />}
                onClick={() => navigate('/jobs')}
              >
                View All {quickApplyJobs.length} Matching Jobs
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // Add Resume Timeline component
  const renderResumeTimeline = () => {
    if (!resumeVersions || resumeVersions.length <= 1) return null;
    
    return (
      <Card 
        sx={{ 
          mt: 3, 
          borderRadius: 2, 
          boxShadow: theme.shadows[3],
          overflow: 'hidden'
        }}
      >
        <Box sx={{ 
          p: 2, 
          bgcolor: 'grey.100', 
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <History />
          <Typography variant="h6">
            Resume Timeline
          </Typography>
        </Box>
        
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            {resumeVersions.map((version, index) => (
              <Box 
                key={index}
                sx={{ 
                  position: 'relative',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  '&:not(:last-child)::after': {
                    content: '""',
                    position: 'absolute',
                    top: 16,
                    right: 0,
                    width: '100%',
                    height: 2,
                    bgcolor: 'divider',
                    zIndex: 0,
                  }
                }}
              >
                <Tooltip title={`Version ${version.versionNumber} - ${new Date(version.date).toLocaleDateString()}`}>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: index === 0 ? 'primary.main' : 'grey.400',
                      zIndex: 1,
                      cursor: 'pointer',
                      border: '2px solid white',
                      boxShadow: theme.shadows[2]
                    }}
                    onClick={() => {
                      // View specific version
                    }}
                  >
                    {version.versionNumber}
                  </Avatar>
                </Tooltip>
                <Typography variant="caption" mt={1} textAlign="center">
                  {new Date(version.date).toLocaleDateString()}
                </Typography>
              </Box>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<Timeline />}
              onClick={() => navigate('/resume-score-tracker')}
            >
              View Full Timeline
            </Button>
          </Box>
        </Box>
      </Card>
    );
  };
  
  // Add renderKeywordsTab implementation
  const renderKeywordsTab = () => (
    <Box sx={{ ...fadeTransition.in }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <KeywordsExtractor 
            resumeId={selectedResume.id} 
            resumeData={selectedResume}
            jobData={jobData}
          />
        </Grid>
      </Grid>
    </Box>
  );
  
  // Add renderAnalyticsTab implementation
  const renderAnalyticsTab = () => (
    <Box sx={{ ...fadeTransition.in }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ResumeScoreChart 
            data={resumeHistory}
            loading={loading}
            height={350}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              boxShadow: theme.shadows[3],
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              p: 2, 
              bgcolor: 'success.main', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Assessment />
              <Typography variant="h6">
                Resume Insights
              </Typography>
            </Box>
            
            <CardContent sx={{ flexGrow: 1 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Resume Strength" 
                    secondary={`Your resume is ${resumeScore > 80 ? 'strong' : resumeScore > 60 ? 'good' : 'needs improvement'}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <School color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Education Details" 
                    secondary={selectedResume?.education?.length ? `${selectedResume.education.length} entries` : 'Missing education information'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Work color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Experience" 
                    secondary={selectedResume?.experience?.length ? `${selectedResume.experience.length} roles, ${calculateYearsOfExperience(selectedResume.experience)} years` : 'Missing experience details'}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Code color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Skills" 
                    secondary={selectedResume?.skills?.length ? `${selectedResume.skills.length} skills documented` : 'Missing skills details'}
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Improvement Opportunities
                </Typography>
                
                <List dense>
                  {resumeScore < 70 && (
                    <ListItem>
                      <ListItemIcon>
                        <ArrowUpward fontSize="small" color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Boost Resume Score" 
                        secondary="Add more details to key sections"
                      />
                    </ListItem>
                  )}
                  
                  {!selectedResume?.personal?.summary && (
                    <ListItem>
                      <ListItemIcon>
                        <ArrowUpward fontSize="small" color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Add Personal Summary" 
                        secondary="A strong summary increases engagement"
                      />
                    </ListItem>
                  )}
                  
                  {!selectedResume?.projects?.length && (
                    <ListItem>
                      <ListItemIcon>
                        <ArrowUpward fontSize="small" color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Add Projects" 
                        secondary="Showcase your hands-on experience"
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <FeaturedJobsCarousel 
            resumeId={selectedResume.id}
            customText="Based on your resume's skills and qualifications, we've identified relevant job opportunities that match your profile."
          />
        </Grid>
      </Grid>
    </Box>
  );
  
  // Add render function for new features tab
  const renderFeaturesTab = () => (
    <Box sx={{ ...fadeTransition.in }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[3] }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Info sx={{ mr: 1, color: theme.palette.primary.main }} />
              Enhanced Resume Features
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Take advantage of our advanced tools to optimize your resume and track changes.
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <AiFeedbackSystem 
                  resumeId={selectedResume?.id}
                  resumeData={selectedResume}
                  jobData={jobData}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <ResumeVersionControl 
                  resumeId={selectedResume?.id}
                  onRestoreVersion={handleRestoreVersion}
                  onSaveVersion={handleSaveVersion}
                  loading={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <JobSpecificCustomization 
                  resumeData={selectedResume}
                  onSaveCustomizations={handleSaveCustomization}
                  loading={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <EnhancedExportOptions 
                  resumeId={selectedResume?.id}
                  resumeData={selectedResume}
                  loading={loading}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
  
  // Helper function to calculate years of experience
  const calculateYearsOfExperience = (experience) => {
    if (!experience || !experience.length) return 0;
    
    const totalDays = experience.reduce((total, job) => {
      const startDate = new Date(job.startDate);
      const endDate = job.endDate ? new Date(job.endDate) : new Date();
      const days = (endDate - startDate) / (1000 * 60 * 60 * 24);
      return total + (days > 0 ? days : 0);
    }, 0);
    
    return Math.round(totalDays / 365 * 10) / 10;
  };
  
  // Update the resume content render function to include the new sections
  const renderResumeContent = () => {
    if (!selectedResume) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Description sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Resume Selected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please select a resume from the sidebar or create a new one.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Create New Resume
          </Button>
        </Paper>
      );
    }
    
    return (
      <Box sx={{ width: '100%' }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2, boxShadow: theme.shadows[2] }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        
        {renderTabHeader()}
        
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: 400
          }}>
            <LoadingSpinner message="Loading resume data..." />
          </Box>
        ) : selectedResume ? (
          <>
            {/* Main content based on selected tab */}
            <Box>
        {tabValue === 0 && (
                <Card 
                  elevation={3}
                  sx={{ 
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    ...fadeTransition.in
                  }}
                >
          <ResumeBuilder
                    resumeData={selectedResume} 
            onSave={handleSaveResume}
          />
                </Card>
        )}
        
        {tabValue === 1 && (
                <Box sx={{ ...fadeTransition.in }}>
                  {isAnalyzing ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <CircularProgress size={60} thickness={5} />
                      <Typography variant="h6" sx={{ mt: 2 }}>
                        Analyzing your resume...
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This may take a moment as we process your resume against job requirements.
                      </Typography>
                    </Box>
                  ) : analysisData ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <ResumeAnalyzer 
                          analysisData={analysisData}
                          isAnalyzing={isAnalyzing} 
                          error={error}
                          onApplySuggestion={handleApplySuggestion}
                          skillGapData={skillGapData}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Card sx={{ p: 3, mt: 3, borderRadius: 2, boxShadow: theme.shadows[3] }}>
                          <Typography variant="h6" gutterBottom>
                            Optimization Suggestions
                          </Typography>
                          <ResumeOptimizer 
                            resumeId={selectedResume?.id}
                            analysisData={analysisData}
                            onApplySuggestion={handleApplyOptimizations}
                            aiSuggestions={analysisData?.aiSuggestions}
                          />
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <AiFeedbackSystem 
                          resumeId={selectedResume?.id}
                          resumeData={selectedResume}
                          jobData={jobData}
                        />
                      </Grid>
                    </Grid>
                  ) : (
                    <Box sx={{ 
                      p: 4, 
                      textAlign: 'center',
                      border: '1px dashed',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}>
                      <Analytics sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        No Analysis Data Available
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                        Analyze your resume against job requirements to get ATS compatibility score,
                        keyword analysis, and AI-powered optimization suggestions.
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Assessment />}
                        onClick={handleAnalyzeResume}
                        size="large"
                      >
                        Analyze Resume
                      </Button>
                    </Box>
                  )}
                </Box>
        )}
        
        {tabValue === 2 && (
                <Box sx={{ ...fadeTransition.in }}>
                  <JobMatchCalculator 
                    resume={selectedResume}
                    job={jobData}
                  />
                </Box>
        )}
        
        {tabValue === 3 && renderKeywordsTab()}
        
        {tabValue === 4 && (
                <Box sx={{ ...fadeTransition.in }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Card sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[3] }}>
                        <Typography variant="h6" gutterBottom>
                          Recommended Jobs Based on Your Resume
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Based on your skills and experience, these jobs might be a good match:
                        </Typography>
                        <FeaturedJobsCarousel 
                          resumeId={selectedResume?.id}
                          customText="Explore job opportunities that match your skills and experience."
                        />
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <JobSpecificCustomization 
                        resumeData={selectedResume}
                        onSaveCustomizations={handleSaveCustomization}
                        loading={loading}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              {tabValue === 5 && renderFeaturesTab()}
            </Box>
            
            {/* Add Quick Apply section with export options */}
            {tabValue === 0 && renderQuickApplySection()}
            
            {/* Add Resume Timeline */}
            {tabValue === 0 && renderResumeTimeline()}
          </>
        ) : (
          <Box sx={{ 
            p: 6, 
            textAlign: 'center',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2
          }}>
            <Description sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Resume Selected
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Please select an existing resume or create a new one to get started.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Create New Resume
            </Button>
          </Box>
        )}
      </Box>
    );
  };
  
  if (loading && !selectedResume && resumes.length === 0) {
    return <LoadingSpinner message="Loading your resumes..." />;
  }
  
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Resume Builder
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3} lg={2.5} sx={{ display: { xs: selectedResume ? 'none' : 'block', md: 'block' } }}>
          {renderResumeSidebar()}
        </Grid>
        
        <Grid item xs={12} md={9} lg={9.5}>
          {renderResumeContent()}
        </Grid>
      </Grid>
      
      {/* Dialog for creating new resume */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 2,
            boxShadow: theme.shadows[10]
          } 
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Add sx={{ mr: 1 }} />
            <Typography variant="h6">Create New Resume</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Resume Title"
            fullWidth
            value={newResumeTitle}
            onChange={e => setNewResumeTitle(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={handleCreateResume}
            disabled={!newResumeTitle.trim() || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Add />}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog for deleting resume */}
      <Dialog 
        open={deleteDialog} 
        onClose={() => setDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            <Typography variant="h6">Delete Resume</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{resumeToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button 
            variant="contained"
            color="error"
            onClick={handleDeleteResume}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumePage; 