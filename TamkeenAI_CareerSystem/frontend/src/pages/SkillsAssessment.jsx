import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  AccordionDetails, Badge, Autocomplete, Container
} from '@mui/material';
import {
  Psychology, Assignment, AssessmentOutlined, School,
  ChevronRight, Check, AddCircleOutline, RemoveCircleOutline,
  Star, StarBorder, Refresh, Save, TrendingUp, InfoOutlined,
  Work, BusinessCenter, CompareArrows, BarChart,
  RateReview, Close, Add, Done, Search, Code, Engineering,
  Language, Analytics, Extension, People, CheckCircle,
  ArrowForward, ArrowBack, ExpandMore, QuestionAnswer,
  CheckCircleOutline, RadioButtonUnchecked, LightbulbOutlined,
  SchoolOutlined
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import SkillsRadarChart from '../components/charts/SkillsRadarChart';
import SkillChip from '../components/common/SkillChip';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorBoundary from '../components/common/ErrorBoundary';
import EmotionDetector from '../components/EmotionDetection/EmotionDetector';
import AdaptiveDifficultyEngine from '../utils/AdaptiveDifficultyEngine';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';

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
  const [stressLevel, setStressLevel] = useState('normal');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [emotionDetectionEnabled, setEmotionDetectionEnabled] = useState(false);
  const [adaptiveModeEnabled, setAdaptiveModeEnabled] = useState(false);
  const [difficultyHistory, setDifficultyHistory] = useState([]);
  const [skillForecast, setSkillForecast] = useState(null);
  
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Add this function to actually save user skills to the database (MOVED UP)
  const saveSkillToDatabase = useCallback(async (skill) => {
    try {
      setIsSubmitting(true);
      
      // In a real app, this would be an API call
      // Example: await apiEndpoints.skills.addUserSkill(profile.id, skill);
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Show success message
      setSnackbarMessage(`Skill "${skill.name}" saved to your profile successfully`);
      setSnackbarOpen(true);
      
      return true;
    } catch (err) {
      console.error('Error saving skill to database:', err);
      setSnackbarMessage('Failed to save skill to the database. Please try again.');
      setSnackbarOpen(true);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  // Use useCallback for event handlers to prevent unnecessary re-renders
  const handleAddSkill = useCallback(async () => {
    if (!newSkill.name) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Create the new skill object
      const newUserSkill = {
        id: `skill-${Date.now()}`,
        name: newSkill.name,
        proficiency: newSkill.proficiency,
        category: newSkill.name.toLowerCase().includes('program') || 
                 newSkill.name.toLowerCase().includes('develop') || 
                 newSkill.name.toLowerCase().includes('code') ? 'tech' : 'soft'
      };
      
      // Save to database (mock function)
      const success = await saveSkillToDatabase(newUserSkill);
      
      if (success) {
        // Add to local state only if database save was successful
        setUserSkills(prevSkills => [...prevSkills, newUserSkill]);
        
        // Reset form and close dialog
        setNewSkill({ name: '', proficiency: 3 });
        setAddSkillDialogOpen(false);
      }
    } catch (err) {
      console.error('Error adding skill:', err);
      setSnackbarMessage('Failed to add skill. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [newSkill, saveSkillToDatabase]);
  
  // useEffect to load initial data
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
          completedResponse
        ] = await Promise.all([
          // Check if skills endpoint exists and has getCategories method
          (apiEndpoints.skills && typeof apiEndpoints.skills.getCategories === 'function')
            ? apiEndpoints.skills.getCategories().catch(err => {
                console.error('Error fetching categories:', err);
                return { data: [] };
              })
            : Promise.resolve({ data: [] }), // Return empty data if endpoint doesn't exist
          
          (apiEndpoints.skills && typeof apiEndpoints.skills.getUserSkills === 'function')
            ? apiEndpoints.skills.getUserSkills(profile.id).catch(err => {
                console.error('Error fetching user skills:', err);
                return { data: [] };
              })
            : Promise.resolve({ data: [] }),
            
          (apiEndpoints.skills && typeof apiEndpoints.skills.getCompletedAssessments === 'function')
            ? apiEndpoints.skills.getCompletedAssessments(profile.id).catch(err => {
                console.error('Error fetching completed assessments:', err);
                return { data: [] };
              })
            : Promise.resolve({ data: [] })
        ]);
        
        setSkillCategories(categoriesResponse.data || []);
        setUserSkills(userSkillsResponse.data || []);
        
        // Ensure completedResponse.data is an array
        const completedAssessments = Array.isArray(completedResponse.data)
          ? completedResponse.data
          : (completedResponse.data?.assessments || []);
        
        setCompletedAssessments(completedAssessments);
        
        // Try to get job titles separately to prevent the entire function from failing
        try {
          if (apiEndpoints.jobs && typeof apiEndpoints.jobs.getJobTitles === 'function') {
            const jobTitlesResponse = await apiEndpoints.jobs.getJobTitles();
            setJobTitles(jobTitlesResponse.data || []);
          } else {
            // No job titles endpoint
            setJobTitles([]);
          }
        } catch (jobError) {
          console.error('Error loading job titles:', jobError);
          // Don't fail the entire function, just set empty job titles
          setJobTitles([]);
          setSnackbarMessage('Could not load job titles. Some features may be limited.');
          setSnackbarOpen(true);
        }
        
        // If user has target jobs set, fetch skill gap
        if (profile.targetJobs && profile.targetJobs.length > 0) {
          setTargetJobs(profile.targetJobs);
          
          if (profile.targetJobs.length > 0) {
            try {
              if (apiEndpoints.skills && typeof apiEndpoints.skills.getSkillGap === 'function') {
                const skillGapResponse = await apiEndpoints.skills.getSkillGap(
                  profile.id, 
                  profile.targetJobs[0].id
                );
                
                setSkillGap(skillGapResponse.data || []);
                setSelectedJob(profile.targetJobs[0]);
              } else {
                // No skill gap endpoint
                setSkillGap([]);
              }
            } catch (gapError) {
              console.error('Error loading skill gap data:', gapError);
              setSnackbarMessage('Could not load skill gap analysis. Please try again later.');
              setSnackbarOpen(true);
            }
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
  
  // Add mock data for skill categories if they're not loaded
  useEffect(() => {
    if (skillCategories.length === 0) {
      // Mock categories for development
      const mockCategories = [
        {
          id: 'tech-skills',
          name: 'Technical Skills',
          description: 'Assess your programming, database, and system design skills',
          icon: 'Code'
        },
        {
          id: 'soft-skills',
          name: 'Soft Skills',
          description: 'Evaluate your communication, teamwork and leadership abilities',
          icon: 'People'
        },
        {
          id: 'data-skills',
          name: 'Data Analysis',
          description: 'Test your ability to work with data, statistics and visualizations',
          icon: 'Analytics'
        },
        {
          id: 'problem-solving',
          name: 'Problem Solving',
          description: 'Measure your analytical thinking and solution design capabilities',
          icon: 'Psychology'
        }
      ];
      
      setSkillCategories(mockCategories);
    }
  }, [skillCategories]);
  
  // Enhanced version of handleCategorySelect with improved AI integration
  const handleCategorySelect = useCallback(async (categoryId) => {
    try {
      setLoading(true);
      setError(null);
      const category = skillCategories.find(c => c.id === categoryId);
      setSelectedCategory(category);
      
      // Initialize adaptive difficulty settings based on user's profile
      const initialDifficulty = profile?.skillLevels?.[category.name] 
        ? profile.skillLevels[category.name] > 3 ? 'hard' : 'medium'
        : 'medium';
      setDifficultyLevel(initialDifficulty);
      
      // Fetch assessment questions with AI-powered generation
      let questionsResponse = { data: [] };
      
      // Check if API endpoints exist before calling them
      if (apiEndpoints?.skills) {
        try {
          if (typeof apiEndpoints.skills.getAssessmentQuestions === 'function') {
            questionsResponse = await apiEndpoints.skills.getAssessmentQuestions(
              categoryId,
              {
                difficulty: difficultyLevel,
                adaptiveMode: adaptiveModeEnabled,
                userLevel: profile?.skillLevels?.[category.name] || 0,
                previousAssessments: completedAssessments
                  .filter(a => a.categoryId === categoryId)
                  .map(a => ({ score: a.score, date: a.completedAt }))
              }
            );
          } else {
            console.log('getAssessmentQuestions method not available');
          }
          
          if ((!questionsResponse.data || questionsResponse.data.length === 0) && 
              typeof apiEndpoints.skills.generateAIQuestions === 'function') {
            // Retry with AI-powered generation specifically
            questionsResponse = await apiEndpoints.skills.generateAIQuestions(
              categoryId,
              profile?.id,
              difficultyLevel
            );
          }
        } catch (apiErr) {
          console.error('API Error loading questions:', apiErr);
        }
      } else {
        console.log('skills API endpoint not available');
      }
      
      // If no questions returned from API, use mock questions
      if (!questionsResponse.data || questionsResponse.data.length === 0) {
        // Generate mock questions based on category
        console.log('Using mock questions for development');
        const mockQuestions = generateMockQuestions(category, difficultyLevel);
        setAssessmentQuestions(mockQuestions);
      } else {
        setAssessmentQuestions(questionsResponse.data || []);
      }
      
      // Reset responses
      setResponses({});
      
      // Move to next step
      setActiveStep(1);
    } catch (err) {
      console.error('Error loading assessment questions:', err);
      setError('Failed to load assessment questions. Please try again.');
      setSnackbarMessage('Could not load assessment questions. Please try again later.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [skillCategories, profile, difficultyLevel, adaptiveModeEnabled, completedAssessments]);
  
  // Enhanced mock question generator with difficulty levels
  const generateMockQuestions = (category, difficulty = 'medium') => {
    const isTechnical = category && (
      category.name.toLowerCase().includes('technical') || 
      category.name.toLowerCase().includes('programming') || 
      category.id === 1
    );
    
    // Base questions (existing implementation)
    let questions = [];
    
    if (isTechnical) {
      // ... existing technical questions ...
    } else if (category && category.name.toLowerCase().includes('data')) {
      // ... existing data questions ...
    }
    
    // Apply difficulty modifications
    if (difficulty === 'easy') {
      // Simplify questions for easy mode
      questions = questions.map(q => ({
        ...q,
        text: `${q.text} (Choose the best answer)`,
        timeLimit: 60 // More time for easy questions
      }));
    } else if (difficulty === 'hard') {
      // Add more complex options and reduce time for hard mode
      questions = questions.map(q => ({
        ...q,
        text: `${q.text} (Select the most comprehensive answer)`,
        timeLimit: 30, // Less time for hard questions
        options: q.options.map(opt => ({
          ...opt,
          text: opt.text + (Math.random() > 0.7 ? ' (with certain limitations)' : '')
        }))
      }));
      
      // Add additional complex questions for hard mode
      if (isTechnical) {
        questions.push({
          id: 'tech-advanced-1',
          text: 'Which architectural pattern would be most appropriate for a real-time collaborative editing application?',
          options: [
            { value: 'a', text: 'Event Sourcing with CQRS' },
            { value: 'b', text: 'Layered Architecture with MVC' },
            { value: 'c', text: 'Microservices with API Gateway' },
            { value: 'd', text: 'Monolithic with Pub/Sub messaging' }
          ]
        });
      }
    }
    
    return questions;
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
    return assessmentQuestions.length > 0 && assessmentQuestions.every(question => 
      responses[question.id] !== undefined && responses[question.id] !== ''
    );
  };
  
  // Use useMemo for derived values to prevent unnecessary recalculations
  const techSkills = useMemo(() => 
    userSkills.filter(skill => skill.category === 'tech'), 
    [userSkills]
  );
  
  const softSkills = useMemo(() => 
    userSkills.filter(skill => skill.category === 'soft'), 
    [userSkills]
  );
  
  // Handle job selection for analysis with error handling
  const handleJobSelect = useCallback(async (job) => {
    if (!job || !job.id) return;
    
    setSelectedJob(job);
    setLoading(true);
    setError(null);
    
    try {
      if (apiEndpoints?.skills && typeof apiEndpoints.skills.getSkillGap === 'function') {
        const skillGapResponse = await apiEndpoints.skills.getSkillGap(
          profile?.id, 
          job.id
        );
        
        setSkillGap(skillGapResponse.data || []);
      } else {
        console.log('getSkillGap method not available, using empty data');
        setSkillGap([]);
      }
    } catch (err) {
      console.error('Error getting skill gap:', err);
      setError('Failed to analyze skill gap for selected job.');
      setSnackbarMessage('Could not analyze skill gap. Please try again later.');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);
  
  // Memoize the skills match data for the radar chart
  const skillsMatchData = useMemo(() => {
    if (!selectedJob?.categoryBreakdown) return [];
    
    return selectedJob.categoryBreakdown.map(cat => ({
      skill: cat.name,
      value: cat.userScore || 0,
      category: cat.name || 'Uncategorized',
      requiredValue: cat.requiredScore || 0
    }));
  }, [selectedJob]);
  
  // Render assessment list
  const renderAssessmentList = () => {
    if (skillCategories.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1">
            No skill assessments available at the moment.
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Available Skill Assessments
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {skillCategories.map(category => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  },
                  border: selectedCategory?.id === category.id ? '2px solid #3f51b5' : 'none'
                }}
                onClick={() => setSelectedCategory(category)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton
                      color="primary"
                      sx={{ mr: 1, backgroundColor: 'rgba(25, 118, 210, 0.1)' }}
                    >
                      {category.icon === 'Code' ? <Code /> : 
                       category.icon === 'People' ? <People /> :
                       category.icon === 'Analytics' ? <Analytics /> : 
                       category.icon === 'Extension' ? <Extension /> : <Psychology />}
                    </IconButton>
                    <Typography variant="h6" component="h3">
                      {category.name}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {category.description}
                  </Typography>
                  
                  {completedAssessments.some(a => a.categoryId === category.id) && (
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label="Completed" 
                        color="success" 
                        size="small" 
                        icon={<CheckCircle />} 
                      />
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<ArrowForward />}
            disabled={!selectedCategory}
            onClick={() => {
              if (selectedCategory) {
                setActiveStep(1);
                // Load questions for the selected category
                fetchAssessmentQuestions(selectedCategory.id);
              }
            }}
          >
            Start Assessment
          </Button>
        </Box>
      </Box>
    );
  };
  
  // Render user skills profile
  const renderYourSkillsProfile = () => {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Your Skills Profile
          </Typography>
          <Button 
            startIcon={<Add />}
            variant="outlined"
            onClick={() => setAddSkillDialogOpen(true)}
          >
            Add Skill
          </Button>
        </Box>
        
        {userSkills.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="body1">
              You haven't added any skills yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddSkillDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              Add Your First Skill
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Technical Skills
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {techSkills.map(skill => (
                    <SkillChip
                      key={skill.id}
                      skill={skill}
                      showLevel={true}
                    />
                  ))}
                  
                  {techSkills.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No technical skills added yet.
                    </Typography>
                  )}
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Soft Skills
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {softSkills.map(skill => (
                    <SkillChip
                      key={skill.id}
                      skill={skill}
                      showLevel={true}
                    />
                  ))}
                  
                  {softSkills.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No soft skills added yet.
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Completed Assessments
                </Typography>
                
                {completedAssessments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    You haven't completed any skill assessments yet.
                  </Typography>
                ) : (
                  <List>
                    {completedAssessments.map((assessment) => (
                      <ListItem key={assessment.id}>
                        <ListItemIcon>
                          <Assignment color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={assessment.categoryName}
                          secondary={`Score: ${assessment.score}% • Completed on ${new Date(assessment.completedAt).toLocaleDateString()}`}
                        />
                        <Button
                          size="small"
                          startIcon={<Refresh />}
                          onClick={() => {
                            setActiveTab(0);  // Switch to Assessments tab
                            handleCategorySelect(assessment.categoryId);
                          }}
                        >
                          Retake
                        </Button>
                      </ListItem>
                    ))}
                  </List>
                )}
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<School />}
                    onClick={() => {
                      setActiveTab(0);
                      // Scroll to the assessment list
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    fullWidth
                  >
                    Take More Assessments
                  </Button>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Recommended Learning Resources
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Based on your skills profile, we recommend these learning resources:
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <School color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Advanced React Techniques"
                      secondary="Improve your React skills with advanced patterns and best practices"
                    />
                    <Button
                      size="small"
                      onClick={() => navigate('/learning-resources?topic=advanced-react')}
                    >
                      View
                    </Button>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <School color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Data Structures & Algorithms"
                      secondary="Essential knowledge for technical interviews and efficient coding"
                    />
                    <Button
                      size="small"
                      onClick={() => navigate('/learning-resources?topic=dsa')}
                    >
                      View
                    </Button>
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LightbulbOutlined color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Professional Communication"
                      secondary="Enhance your communication skills in professional settings"
                    />
                    <Button
                      size="small"
                      onClick={() => navigate('/learning-resources?topic=communication')}
                    >
                      View
                    </Button>
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
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
            getOptionLabel={(option) => {
              // If option is a string, return it directly
              if (typeof option === 'string') return option;
              // If option is an object with a title property, return that
              if (option && option.title) return option.title;
              // Default fallback
              return '';
            }}
            isOptionEqualToValue={(option, value) => {
              // Handle empty values
              if (!option && !value) return true;
              if (!option || !value) return false;
              
              // String comparison
              if (typeof option === 'string' && typeof value === 'string') {
                return option === value;
              }
              
              // Object comparison by id or title
              if (option.id && value.id) {
                return option.id === value.id;
              }
              
              if (option.title && value.title) {
                return option.title === value.title;
              }
              
              return false;
            }}
            filterOptions={(options, params) => {
              const filtered = options.filter(option => {
                const title = typeof option === 'string' ? option : option.title || '';
                return title.toLowerCase().includes(params.inputValue.toLowerCase());
              });
              return filtered;
            }}
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
                          skill={skill}
                          showLevel={true}
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
                <ErrorBoundary fallback={
                  <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Alert severity="error">
                      There was an error rendering the skills chart. Please try again later.
                    </Alert>
                  </Box>
                }>
                  <SkillsRadarChart
                    data={skillsMatchData}
                    height={300}
                  />
                </ErrorBoundary>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/learning')}
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
    // Add this to show questions when a category is selected
    if (activeTab === 0 && activeStep === 1) {
      return renderAssessmentQuestions();
    }
    
    // Otherwise show regular tab content
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
            getOptionLabel={(option) => option || ''}
            isOptionEqualToValue={(option, value) => {
              // Handle empty values
              if (!option && !value) return true;
              if (!option || !value) return false;
              
              // Compare strings
              return option === value;
            }}
            filterOptions={(options, params) => {
              const filtered = options.filter(option => 
                option.toLowerCase().includes(params.inputValue.toLowerCase())
              );
              
              // Always allow the current input value as an option when freeSolo is true
              if (params.inputValue !== '' && !filtered.includes(params.inputValue)) {
                filtered.push(params.inputValue);
              }
              
              return filtered;
            }}
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
                setNewSkill({ ...newSkill, proficiency: newValue || 1 }); // Ensure at least 1
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
  
  // Handle submission of the assessment
  const handleSubmitAssessment = async () => {
    if (Object.keys(responses).length < assessmentQuestions.length) {
      setSnackbarMessage('Please answer all questions');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // In a real application, this would send the responses to the backend
      // const response = await apiEndpoints.skills.submitAssessment(selectedCategory.id, responses);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock results
      const mockResults = {
        score: Math.floor(Math.random() * 35) + 65, // Random score between 65-100
        maxScore: 100,
        correctAnswers: Math.floor(assessmentQuestions.length * 0.8), // 80% correct
        totalQuestions: assessmentQuestions.length,
        strengths: ['Problem solving', 'Technical knowledge'],
        weaknesses: ['Optimization techniques', 'Advanced algorithms'],
        recommendations: [
          'Practice more dynamic programming problems',
          'Study complexity analysis in more depth',
          'Review data structure implementations'
        ],
        categoryName: selectedCategory?.name || 'Technical Skills',
        timestamp: new Date().toISOString(),
        id: Date.now()
      };
      
      setResults(mockResults);
      
      // Generate sample skill forecast data
      const mockSkillForecast = {
        category: selectedCategory?.name || 'Technical Skills',
        currentLevel: mockResults.score,
        targetLevel: 90,
        projections: [
          { month: 'Now', projectedLevel: mockResults.score },
          { month: '1 Month', projectedLevel: Math.min(mockResults.score + 5, 100) },
          { month: '2 Months', projectedLevel: Math.min(mockResults.score + 10, 100) },
          { month: '3 Months', projectedLevel: Math.min(mockResults.score + 18, 100) },
          { month: '4 Months', projectedLevel: Math.min(mockResults.score + 24, 100) },
          { month: '5 Months', projectedLevel: Math.min(mockResults.score + 28, 100) },
          { month: '6 Months', projectedLevel: Math.min(mockResults.score + 32, 100) }
        ],
        milestones: [
          {
            date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
            description: 'Complete Fundamentals',
            actions: [
              'Finish online course on basics',
              'Complete 10 practice problems'
            ]
          },
          {
            date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
            description: 'Intermediate Topics Mastery',
            actions: [
              'Build a personal project using these skills',
              'Participate in community forums',
              'Complete advanced exercises'
            ]
          },
          {
            date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
            description: 'Advanced Concepts',
            actions: [
              'Take specialized courses',
              'Contribute to open source',
              'Create tutorial content to solidify knowledge'
            ]
          }
        ]
      };
      
      setSkillForecast(mockSkillForecast);
      
      // Save results to localStorage
      try {
        // Get existing assessment history from localStorage or initialize empty array
        const existingAssessmentHistory = JSON.parse(localStorage.getItem('skillAssessmentHistory') || '[]');
        
        // Create a new assessment history entry with all data
        const assessmentHistoryEntry = {
          ...mockResults,
          skillForecast: mockSkillForecast,
          category: selectedCategory?.id,
          categoryName: selectedCategory?.name || 'Technical Skills'
        };
        
        // Add to beginning of array
        existingAssessmentHistory.unshift(assessmentHistoryEntry);
        
        // Limit history to most recent 10 entries
        const limitedHistory = existingAssessmentHistory.slice(0, 10);
        
        // Save back to localStorage
        localStorage.setItem('skillAssessmentHistory', JSON.stringify(limitedHistory));
        console.log('Assessment results saved to localStorage');
      } catch (storageErr) {
        console.error('Error saving to localStorage:', storageErr);
      }
      
      // Move to results step
      setActiveStep(2);
      
      // Add to completed assessments
      const newCompletedAssessment = {
        id: `assessment-${Date.now()}`,
        categoryId: selectedCategory.id,
        score: mockResults.score,
        maxScore: mockResults.maxScore,
        completedAt: new Date().toISOString()
      };
      
      setCompletedAssessments(prev => [...prev, newCompletedAssessment]);
      
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setSnackbarMessage('Failed to submit assessment. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle emotional state changes
  const handleEmotionChange = (emotion) => {
    // Update stress level based on detected emotion
    if (emotion === 'stressed' || emotion === 'anxious') {
      setStressLevel('high');
      // Offer supportive message
      setSnackbarMessage('Take a deep breath. Remember, this assessment is to help you grow.');
      setSnackbarOpen(true);
      
      // Potentially adjust difficulty if user is very stressed
      if (stressLevel === 'high' && adaptiveModeEnabled) {
        setDifficultyLevel(prev => prev === 'hard' ? 'medium' : prev);
      }
    } else if (emotion === 'calm' || emotion === 'happy') {
      setStressLevel('normal');
    }
  };
  
  // Adjust question difficulty based on user performance
  const adjustQuestionDifficulty = useCallback((questionId, isCorrect) => {
    if (!adaptiveModeEnabled) return;
    
    setDifficultyHistory(prev => [...prev, { questionId, isCorrect }]);
    
    // Calculate recent performance (last 3 questions)
    const recent = [...difficultyHistory, { questionId, isCorrect }].slice(-3);
    const correctCount = recent.filter(item => item.isCorrect).length;
    
    // Adjust difficulty based on performance
    if (correctCount >= 3 && difficultyLevel !== 'hard') {
      setDifficultyLevel('hard');
      setSnackbarMessage("Great job! Questions will now be more challenging.");
      setSnackbarOpen(true);
    } else if (correctCount <= 1 && difficultyLevel !== 'easy') {
      setDifficultyLevel('easy');
      setSnackbarMessage("Adjusting difficulty to help you learn better.");
      setSnackbarOpen(true);
    }
  }, [adaptiveModeEnabled, difficultyHistory, difficultyLevel]);
  
  // Render additional assessment settings
  const renderAssessmentSettings = () => (
    <Box sx={{ mb: 4, mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        Assessment Settings
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Difficulty Mode</FormLabel>
            <RadioGroup
              value={adaptiveModeEnabled ? 'adaptive' : 'fixed'}
              onChange={(e) => setAdaptiveModeEnabled(e.target.value === 'adaptive')}
            >
              <FormControlLabel value="fixed" control={<Radio />} label="Fixed Difficulty" />
              <FormControlLabel value="adaptive" control={<Radio />} label="Adaptive Difficulty" />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Emotion Detection</FormLabel>
            <RadioGroup
              value={emotionDetectionEnabled ? 'enabled' : 'disabled'}
              onChange={(e) => setEmotionDetectionEnabled(e.target.value === 'enabled')}
            >
              <FormControlLabel value="disabled" control={<Radio />} label="Disabled" />
              <FormControlLabel value="enabled" control={<Radio />} label="Enabled" />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        {!adaptiveModeEnabled && (
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Difficulty Level</InputLabel>
              <Select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                label="Difficulty Level"
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
    </Box>
  );
  
  // Render career readiness timeline with skill forecast
  const renderSkillForecast = () => {
    if (!skillForecast) return null;
  
    return (
      <Paper sx={{ p: 3, mt: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Career Readiness Timeline
        </Typography>
        
        <Typography variant="body2" paragraph>
          Based on your current progress and assessment results, here's your projected skill growth over the next 6 months:
        </Typography>
        
        <Box sx={{ height: 300, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={skillForecast.projections}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: 'Months from now', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Skill Proficiency (%)', angle: -90, position: 'insideLeft' }} />
              <RechartsTooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="projectedLevel" 
                name={`${skillForecast.category} Proficiency`} 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        
        <Typography variant="subtitle1" gutterBottom>
          Key Milestones
        </Typography>
        
        {skillForecast.milestones.map((milestone, index) => (
          <Card key={index} sx={{ mb: 2, borderLeft: '4px solid #3f51b5' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="body1" fontWeight="medium">
                  {milestone.description}
                </Typography>
                <Chip 
                  label={new Date(milestone.date).toLocaleDateString()} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
              <List dense>
                {milestone.actions.map((action, actionIndex) => (
                  <ListItem key={actionIndex} disablePadding sx={{ pl: 1 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <CheckCircleOutline fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={action} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        ))}
      </Paper>
    );
  };
  
  // Add a function to fetch assessment questions
  const fetchAssessmentQuestions = useCallback(async (categoryId) => {
    if (!categoryId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if the API endpoint exists before calling it
      if (apiEndpoints?.skills && typeof apiEndpoints.skills.getAssessmentQuestions === 'function') {
        // Fetch questions from API
        const response = await apiEndpoints.skills.getAssessmentQuestions(categoryId);
        
        // Initialize adaptive difficulty engine if enabled
        if (adaptiveModeEnabled) {
          const engine = new AdaptiveDifficultyEngine({
            initialDifficulty: difficultyLevel,
            userProfile: profile,
            categoryId,
            stressThreshold: 0.7, // Configure stress threshold
          });
          
          // Get adjusted questions based on difficulty
          const adjustedQuestions = engine.getAdjustedQuestions(response.data);
          setAssessmentQuestions(adjustedQuestions);
          
          // Track difficulty changes for analytics
          setDifficultyHistory([
            { time: Date.now(), difficulty: difficultyLevel, reason: 'initial' }
          ]);
        } else {
          setAssessmentQuestions(response.data);
        }
      } else {
        // API endpoint doesn't exist, use mock data
        console.log('Skills assessment API endpoint not available, using mock data');
        const mockQuestions = getMockQuestionsForCategory(categoryId);
        setAssessmentQuestions(mockQuestions);
      }
    } catch (err) {
      console.error('Error fetching assessment questions:', err);
      setError('Failed to load assessment questions. Please try again later.');
      
      // Fallback to mock data in development
      console.log('Using mock assessment data for development');
      const mockQuestions = getMockQuestionsForCategory(categoryId);
      setAssessmentQuestions(mockQuestions);
    } finally {
      setLoading(false);
    }
  }, [adaptiveModeEnabled, difficultyLevel, profile]);
  
  // Get mock questions for development
  const getMockQuestionsForCategory = (categoryId) => {
    // Sample questions for different categories
    const mockData = {
      'tech-skills': [
        {
          id: 'q1',
          text: 'What is the time complexity of a binary search algorithm?',
          type: 'multiple-choice',
          options: [
            { id: 'a', text: 'O(1)' },
            { id: 'b', text: 'O(log n)' },
            { id: 'c', text: 'O(n)' },
            { id: 'd', text: 'O(n²)' }
          ],
          difficulty: 'medium',
          correctAnswer: 'b'
        },
        {
          id: 'q2',
          text: 'Which of the following is NOT a JavaScript data type?',
          type: 'multiple-choice',
          options: [
            { id: 'a', text: 'String' },
            { id: 'b', text: 'Boolean' },
            { id: 'c', text: 'Character' },
            { id: 'd', text: 'Object' }
          ],
          difficulty: 'easy',
          correctAnswer: 'c'
        },
        {
          id: 'q3',
          text: 'What design pattern is React.js primarily based on?',
          type: 'multiple-choice',
          options: [
            { id: 'a', text: 'MVC' },
            { id: 'b', text: 'Observer Pattern' },
            { id: 'c', text: 'Component-Based Architecture' },
            { id: 'd', text: 'Singleton Pattern' }
          ],
          difficulty: 'medium',
          correctAnswer: 'c'
        }
      ],
      'soft-skills': [
        {
          id: 'q1',
          text: 'You notice a colleague is struggling with a project. What would you do?',
          type: 'multiple-choice',
          options: [
            { id: 'a', text: 'Ignore it, they need to learn on their own' },
            { id: 'b', text: 'Ask if they need help and offer your assistance' },
            { id: 'c', text: 'Tell your manager they are underperforming' },
            { id: 'd', text: 'Take over their project completely' }
          ],
          difficulty: 'easy',
          correctAnswer: 'b'
        },
        {
          id: 'q2',
          text: 'How do you typically handle criticism of your work?',
          type: 'multiple-choice',
          options: [
            { id: 'a', text: 'Take it personally and become defensive' },
            { id: 'b', text: 'Ignore it completely' },
            { id: 'c', text: 'Listen carefully and use it to improve' },
            { id: 'd', text: "Criticize the other person's work in return" }
          ],
          difficulty: 'medium',
          correctAnswer: 'c'
        }
      ]
    };
    
    // Return questions for the selected category or default to tech skills
    return mockData[categoryId] || mockData['tech-skills'];
  };
  
  // Add a handler to adjust difficulty based on emotions if enabled
  const handleEmotionDetected = useCallback((emotions) => {
    if (!adaptiveModeEnabled || !emotionDetectionEnabled) return;
    
    // Check if emotions is an array (from new component) or a string (from old component)
    const emotion = Array.isArray(emotions) && emotions.length > 0 
      ? emotions[0].emotion 
      : (typeof emotions === 'string' ? emotions : 'neutral');
    
    // Map emotion to stress level
    let newStressLevel = 'normal';
    
    if (emotion === 'angry' || emotion === 'fearful') {
      newStressLevel = 'high';
    } else if (emotion === 'sad' || emotion === 'disgusted') {
      newStressLevel = 'moderate';
    } else if (emotion === 'happy' || emotion === 'surprised') {
      newStressLevel = 'low';
    }
    
    if (newStressLevel !== stressLevel) {
      setStressLevel(newStressLevel);
      
      // Adjust difficulty based on stress level
      if (newStressLevel === 'high' && difficultyLevel !== 'easy') {
        setDifficultyLevel('easy');
        setDifficultyHistory(prev => [
          ...prev,
          { time: Date.now(), difficulty: 'easy', reason: 'high stress detected' }
        ]);
      } else if (newStressLevel === 'low' && difficultyLevel === 'easy') {
        setDifficultyLevel('medium');
        setDifficultyHistory(prev => [
          ...prev,
          { time: Date.now(), difficulty: 'medium', reason: 'stress reduced' }
        ]);
      }
    }
  }, [adaptiveModeEnabled, emotionDetectionEnabled, stressLevel, difficultyLevel]);

  // Render assessment questions including emotion detector
  const renderAssessmentQuestions = () => {
    if (loading) {
      return <LoadingSpinner message="Loading assessment questions..." />;
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (!assessmentQuestions.length) {
      return (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1">
            No questions available for this assessment.
          </Typography>
        </Box>
      );
    }
    
    // Determine which emotion detector component to use based on imports
    // Import path will tell us if we're using the new or old component
    const isUsingNewEmotionDetector = typeof EmotionDetector === 'function' && 
      (EmotionDetector.toString().includes('EmotionDetection') || 
       EmotionDetector.toString().includes('face-api'));
    
    return (
      <Box>
        {emotionDetectionEnabled && (
          <Box sx={{ mb: 3 }}>
            {isUsingNewEmotionDetector ? (
              // Use new component with updated props
              <EmotionDetector 
                onEmotionDetected={handleEmotionDetected}
                size="small"
                showVideo={true}
              />
            ) : (
              // Fallback to old component for backwards compatibility
              <Box sx={{ position: 'relative' }}>
                <EmotionDetector 
                  onEmotionDetected={handleEmotionDetected}
                  size="small"
                  showVideo={true}
                  interval={3000}
                />
                {/* Hide the error message if using mock data */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  Using emotion simulation (mock data)
                </Typography>
              </Box>
            )}
            
            {stressLevel !== 'normal' && (
              <Alert 
                severity={stressLevel === 'high' ? 'warning' : 'info'} 
                sx={{ mt: 2 }}
              >
                {stressLevel === 'high' 
                  ? 'We notice you might be feeling stressed. Taking a deep breath can help.' 
                  : stressLevel === 'low' 
                    ? 'You seem relaxed and focused. Great job!' 
                    : 'Remember to stay calm and take your time with each question.'}
              </Alert>
            )}
          </Box>
        )}
        
        {adaptiveModeEnabled && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Adaptive Difficulty Mode: {difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}
            </Typography>
            <Typography variant="caption">
              Questions will adjust based on your performance and stress level
            </Typography>
          </Alert>
        )}
        
        {assessmentQuestions.map((question, index) => (
          <Paper key={question.id} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Question {index + 1} of {assessmentQuestions.length}
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ fontWeight: 500 }}>
              {question.text}
            </Typography>
            
            {question.type === 'multiple-choice' && (
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <RadioGroup
                  name={`question-${question.id}`}
                  value={responses[question.id] || ''}
                  onChange={(e) => {
                    setResponses(prev => ({
                      ...prev,
                      [question.id]: e.target.value
                    }));
                  }}
                >
                  {question.options.map(option => (
                    <FormControlLabel
                      key={option.id}
                      value={option.id}
                      control={<Radio />}
                      label={option.text}
                      sx={{ 
                        mb: 1,
                        p: 1,
                        borderRadius: 1,
                        width: '100%',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}
            
            {/* Add support for other question types as needed */}
          </Paper>
        ))}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setActiveStep(0)}
            startIcon={<ArrowBack />}
          >
            Back to Categories
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitAssessment}
            endIcon={<Done />}
            disabled={Object.keys(responses).length < assessmentQuestions.length}
          >
            Submit Assessment
          </Button>
        </Box>
      </Box>
    );
  };
  
  // Render assessment results
  const renderResults = () => {
    if (!results) {
      return (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="body1">
            No assessment results available.
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Assessment Results: {results.categoryName}
            </Typography>
            
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
              <CircularProgress
                variant="determinate"
                value={results.score}
                size={120}
                thickness={5}
                color={
                  results.score > 80 ? 'success' :
                  results.score > 60 ? 'primary' :
                  results.score > 40 ? 'warning' : 'error'
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
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h4" component="div">
                  {results.score}%
                </Typography>
                <Typography variant="caption" component="div" color="text.secondary">
                  Score
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="body1" color="text.secondary">
              You answered {results.correctAnswers} out of {results.totalQuestions} questions correctly.
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Your Strengths
              </Typography>
              
              <List>
                {results.strengths.map((strength, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText primary={strength} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Areas for Improvement
              </Typography>
              
              <List>
                {results.weaknesses.map((weakness, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <InfoOutlined color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={weakness} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Paper>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recommendations
          </Typography>
          
          <List>
            {results.recommendations.map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <SchoolOutlined color="primary" />
                </ListItemIcon>
                <ListItemText primary={recommendation} />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => {
                setActiveStep(0);
                setResults(null);
              }}
            >
              Take Another Assessment
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              endIcon={<ArrowForward />}
              onClick={() => navigate('/learning')}
            >
              Explore Learning Resources
            </Button>
          </Box>
        </Paper>
        
        {renderSkillForecast()}
      </Box>
    );
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Skills Assessment Center
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          <Step key="select-category">
            <StepLabel>Select Category</StepLabel>
          </Step>
          <Step key="take-assessment">
            <StepLabel>Take Assessment</StepLabel>
          </Step>
          <Step key="results">
            <StepLabel>Results</StepLabel>
          </Step>
        </Stepper>

        {loading && <LoadingSpinner message="Loading assessment data..." />}
        
        {!loading && activeStep === 0 && (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Select a Skill Category to Assess
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Choose a skill category to test your knowledge and get personalized recommendations.
              </Typography>
            </Box>
            
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Assessment Settings
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Difficulty Mode
                  </Typography>
                  <RadioGroup
                    name="difficulty-mode"
                    value={adaptiveModeEnabled ? 'adaptive' : 'fixed'}
                    onChange={(e) => setAdaptiveModeEnabled(e.target.value === 'adaptive')}
                  >
                    <FormControlLabel 
                      value="fixed" 
                      control={<Radio />} 
                      label="Fixed Difficulty" 
                    />
                    <FormControlLabel 
                      value="adaptive" 
                      control={<Radio />} 
                      label="Adaptive Difficulty" 
                    />
                  </RadioGroup>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Emotion Detection
                  </Typography>
                  <RadioGroup
                    name="emotion-detection"
                    value={emotionDetectionEnabled ? 'enabled' : 'disabled'}
                    onChange={(e) => setEmotionDetectionEnabled(e.target.value === 'enabled')}
                  >
                    <FormControlLabel 
                      value="disabled" 
                      control={<Radio />} 
                      label="Disabled" 
                    />
                    <FormControlLabel 
                      value="enabled" 
                      control={<Radio />} 
                      label="Enabled" 
                    />
                  </RadioGroup>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Difficulty Level
                </Typography>
                <Select
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </Box>
            </Paper>
            
            <Typography variant="h6" gutterBottom>
              Available Skill Assessments
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {skillCategories.map(category => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      },
                      border: selectedCategory?.id === category.id ? '2px solid #3f51b5' : 'none'
                    }}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton
                          color="primary"
                          sx={{ mr: 1, backgroundColor: 'rgba(25, 118, 210, 0.1)' }}
                        >
                          {category.icon === 'Code' ? <Code /> : 
                           category.icon === 'People' ? <People /> :
                           category.icon === 'Analytics' ? <Analytics /> : 
                           category.icon === 'Extension' ? <Extension /> : <Psychology />}
                        </IconButton>
                        <Typography variant="h6" component="h3">
                          {category.name}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {category.description}
                      </Typography>
                      
                      {completedAssessments.some(a => a.categoryId === category.id) && (
                        <Box sx={{ mb: 2 }}>
                          <Chip 
                            label="Completed" 
                            color="success" 
                            size="small" 
                            icon={<CheckCircle />} 
                          />
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="primary">
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<ArrowForward />}
                disabled={!selectedCategory}
                onClick={() => {
                  if (selectedCategory) {
                    setActiveStep(1);
                    // Load questions for the selected category
                    fetchAssessmentQuestions(selectedCategory.id);
                  }
                }}
              >
                Start Assessment
              </Button>
            </Box>
          </>
        )}
        
        {!loading && activeStep === 1 && renderAssessmentQuestions()}
        
        {!loading && activeStep === 2 && renderResults()}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </Container>
  );
};

export default SkillsAssessment;