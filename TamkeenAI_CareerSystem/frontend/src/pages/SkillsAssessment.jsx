import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  Stepper, Step, StepLabel, StepContent, 
  CircularProgress, Alert, TextField, Rating,
  Chip, List, ListItem, ListItemText, ListItemIcon,
  RadioGroup, Radio, FormControlLabel, FormControl,
  FormLabel, Tooltip, LinearProgress, Dialog, 
  DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, InputLabel, Snackbar, 
  Backdrop, Tabs, Tab, Accordion, AccordionSummary,
  AccordionDetails, Badge, Autocomplete
} from '@mui/material';
import {
  Psychology, Assignment, AssessmentOutlined, School,
  ChevronRight, Check, AddCircleOutline, RemoveCircleOutline,
  Star, StarBorder, Refresh, Save, TrendingUp, InfoOutlined,
  Work, BusinessCenter, CompareArrows, BarChart, Timeline,
  RateReview, Close, Add, Done, Search, Code, Engineering,
  Language, Analytics, Extension, People, CheckCircle,
  ArrowForward, ArrowBack, ExpandMore, QuestionAnswer,
  CheckCircleOutline, RadioButtonUnchecked, LightbulbOutlined
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import RadarChart from '../components/charts/RadarChart';
import SkillChip from '../components/SkillChip';
import LoadingSpinner from '../components/LoadingSpinner';

const SkillsAssessment = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [skillCategories, setSkillCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [assessmentQuestions, setAssessmentQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [results, setResults] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [skillGap, setSkillGap] = useState([]);
  const [targetJobs, setTargetJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobTitles, setJobTitles] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [addSkillDialogOpen, setAddSkillDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 3 });
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [assessments, setAssessments] = useState([]);
  
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch skill categories, user skills, and completed assessments
        const [
          categoriesResponse, 
          userSkillsResponse, 
          completedResponse,
          jobTitlesResponse
        ] = await Promise.all([
          apiEndpoints.skills.getCategories(),
          apiEndpoints.skills.getUserSkills(profile.id),
          apiEndpoints.skills.getCompletedAssessments(profile.id),
          apiEndpoints.jobs.getJobTitles()
        ]);
        
        setSkillCategories(categoriesResponse.data || []);
        setUserSkills(userSkillsResponse.data || []);
        setCompletedAssessments(completedResponse.data || []);
        setJobTitles(jobTitlesResponse.data || []);
        
        // If user has target jobs set, fetch skill gap
        if (profile.targetJobs && profile.targetJobs.length > 0) {
          setTargetJobs(profile.targetJobs);
          
          if (profile.targetJobs.length > 0) {
            const skillGapResponse = await apiEndpoints.skills.getSkillGap(
              profile.id, 
              profile.targetJobs[0].id
            );
            
            setSkillGap(skillGapResponse.data || []);
            setSelectedJob(profile.targetJobs[0]);
          }
        }
      } catch (err) {
        console.error('Error loading skills assessment data:', err);
        setError('Failed to load skills assessment data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [profile]);
  
  // Handle category selection
  const handleCategorySelect = async (categoryId) => {
    try {
      setLoading(true);
      const category = skillCategories.find(c => c.id === categoryId);
      setSelectedCategory(category);
      
      // Fetch assessment questions for the selected category
      const questionsResponse = await apiEndpoints.skills.getAssessmentQuestions(categoryId);
      setAssessmentQuestions(questionsResponse.data || []);
      
      // Reset responses
      setResponses({});
      
      // Move to next step
      setActiveStep(1);
    } catch (err) {
      console.error('Error loading assessment questions:', err);
      setError('Failed to load assessment questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle response change
  const handleResponseChange = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
  };
  
  // Check if all questions are answered
  const areAllQuestionsAnswered = () => {
    return assessmentQuestions.every(question => 
      responses[question.id] !== undefined
    );
  };
  
  // Render job match analysis
  const renderJobMatchAnalysis = () => {
    if (!selectedJob) {
      return (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1">
            Please select a job title to see your skill match analysis
          </Typography>
          
          <Autocomplete
            options={jobTitles}
            value={searchValue}
            onChange={(e, newValue) => handleJobSelect(newValue)}
            onInputChange={(e, newValue) => setSearchValue(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Job Titles"
                margin="normal"
                fullWidth
              />
            )}
            sx={{ mt: 2, maxWidth: 500, mx: 'auto' }}
          />
        </Box>
      );
    }
    
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Skills Match Analysis: {selectedJob.title}
          </Typography>
          
          <Button
            startIcon={<Refresh />}
            onClick={() => handleJobSelect(selectedJob)}
            size="small"
          >
            Refresh Analysis
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Overall Match Score
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={selectedJob.matchScore || 0}
                    size={80}
                    thickness={4}
                    color={
                      selectedJob.matchScore > 80 ? 'success' :
                      selectedJob.matchScore > 60 ? 'primary' :
                      selectedJob.matchScore > 40 ? 'warning' : 'error'
                    }
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
                    <Typography variant="h6" component="div" color="text.secondary">
                      {`${Math.round(selectedJob.matchScore || 0)}%`}
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="body1">
                    {selectedJob.matchScore > 80 ? 'Excellent match' :
                     selectedJob.matchScore > 60 ? 'Good match' :
                     selectedJob.matchScore > 40 ? 'Fair match' : 'Needs improvement'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Based on your current skill profile
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Your Strengths
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                {skillGap.filter(skill => skill.hasSkill).length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {skillGap
                      .filter(skill => skill.hasSkill)
                      .slice(0, 5)
                      .map(skill => (
                        <SkillChip
                          key={skill.id}
                          name={skill.name}
                          level={skill.userLevel}
                          size="medium"
                        />
                      ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No matching skills found
                  </Typography>
                )}
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Skills to Develop
              </Typography>
              
              <Box>
                {skillGap.filter(skill => !skill.hasSkill).length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {skillGap
                      .filter(skill => !skill.hasSkill)
                      .slice(0, 5)
                      .map(skill => (
                        <Chip
                          key={skill.id}
                          label={skill.name}
                          variant="outlined"
                          color="primary"
                          icon={<AddCircleOutline />}
                        />
                      ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    You have all the required skills for this job!
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Skill Category Breakdown
              </Typography>
              
              <Box sx={{ height: 300, mt: 2 }}>
                <RadarChart
                  data={[
                    {
                      name: 'Your Skills',
                      ...Object.fromEntries(
                        selectedJob.categoryBreakdown?.map(cat => [
                          cat.name,
                          cat.userScore
                        ]) || []
                      )
                    },
                    {
                      name: 'Required Skills',
                      ...Object.fromEntries(
                        selectedJob.categoryBreakdown?.map(cat => [
                          cat.name,
                          cat.requiredScore
                        ]) || []
                      )
                    }
                  ]}
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/learning-plan')}
                fullWidth
              >
                Create Learning Plan
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Detailed Skill Gap Analysis
              </Typography>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>
                    Missing Skills ({skillGap.filter(skill => !skill.hasSkill).length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {skillGap
                      .filter(skill => !skill.hasSkill)
                      .map(skill => (
                        <ListItem key={skill.id}>
                          <ListItemIcon>
                            <RadioButtonUnchecked color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary={skill.name}
                            secondary={`Required level: ${skill.requiredLevel}/5`}
                          />
                          <Button
                            size="small"
                            startIcon={<School />}
                            onClick={() => navigate(`/courses?skill=${skill.name}`)}
                          >
                            Find Courses
                          </Button>
                        </ListItem>
                      ))}
                  </List>
                </AccordionDetails>
              </Accordion>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>
                    Matching Skills ({skillGap.filter(skill => skill.hasSkill).length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {skillGap
                      .filter(skill => skill.hasSkill)
                      .map(skill => (
                        <ListItem key={skill.id}>
                          <ListItemIcon>
                            <CheckCircleOutline color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary={skill.name}
                            secondary={`Your level: ${skill.userLevel}/5 (Required: ${skill.requiredLevel}/5)`}
                          />
                          {skill.userLevel < skill.requiredLevel && (
                            <Chip
                              size="small"
                              label="Needs improvement"
                              color="warning"
                            />
                          )}
                        </ListItem>
                      ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Render main content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderAssessmentList();
      case 1:
        return renderYourSkillsProfile();
      case 2:
        return renderJobMatchAnalysis();
      default:
        return null;
    }
  };
  
  // Add skill dialog
  const renderAddSkillDialog = () => {
    return (
      <Dialog 
        open={addSkillDialogOpen} 
        onClose={() => setAddSkillDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Skill</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={skillSuggestions}
            value={newSkill.name}
            onInputChange={(e, value) => {
              setNewSkill({ ...newSkill, name: value });
              // In a real app, this would fetch suggestions from the API
              if (value.length > 1) {
                // Mock suggestion filtering
                const suggestions = ["JavaScript", "Python", "React", "Node.js", "SQL", "Data Analysis", 
                  "Project Management", "Communication", "Leadership", "Marketing", "Sales",
                  "Customer Service", "UX Design", "Product Management", "Machine Learning"].filter(
                  s => s.toLowerCase().includes(value.toLowerCase())
                );
                setSkillSuggestions(suggestions);
              }
            }}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label="Skill Name"
                margin="normal"
                fullWidth
                required
              />
            )}
          />
          
          <Box sx={{ mt: 2 }}>
            <Typography component="legend">Proficiency Level</Typography>
            <Rating
              name="proficiency"
              value={newSkill.proficiency}
              onChange={(event, newValue) => {
                setNewSkill({ ...newSkill, proficiency: newValue });
              }}
            />
            <Typography variant="caption" color="text.secondary">
              1 = Beginner, 5 = Expert
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSkillDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddSkill}
            variant="contained"
            disabled={!newSkill.name}
          >
            Add Skill
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Skills Assessment & Development
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Assessments" 
            icon={<AssessmentOutlined />} 
            iconPosition="start"
          />
          <Tab 
            label="Your Skills" 
            icon={<Psychology />} 
            iconPosition="start"
          />
          <Tab 
            label="Job Match" 
            icon={<CompareArrows />} 
            iconPosition="start"
          />
        </Tabs>
        
        <Box sx={{ py: 2 }}>
          {loading ? (
            <LoadingSpinner message="Loading skills data..." />
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          ) : (
            renderTabContent()
          )}
        </Box>
      </Paper>
      
      {renderAddSkillDialog()}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
      
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSubmitting}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>Processing your assessment...</Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default SkillsAssessment;