import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Tooltip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Slider,
  Rating,
  Badge,
  Avatar,
  Autocomplete
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import CodeIcon from '@mui/icons-material/Code';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import VisibilityIcon from '@mui/icons-material/Visibility';
import QuizIcon from '@mui/icons-material/Quiz';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FlagIcon from '@mui/icons-material/Flag';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import TimerIcon from '@mui/icons-material/Timer';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { Chart } from 'react-chartjs-2';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import SpeechControl from './Speech/SpeechControl';

const SkillAssessment = ({
  userData = {},
  skillCategories = [],
  assessments = [],
  onCompleteAssessment,
  onAddSkill,
  onUpdateSkill,
  onGenerateReport,
  loading = false
}) => {
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [userSkills, setUserSkills] = useState(userData.skills || []);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState(1);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentResponses, setAssessmentResponses] = useState({});
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    level: 'all',
    category: 'all',
    status: 'all'
  });
  const [comparisonMode, setComparisonMode] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [assessments, setAssessments] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [freeTextAnswer, setFreeTextAnswer] = useState('');
  const [codeAnswer, setCodeAnswer] = useState('');
  const [assessmentInProgress, setAssessmentInProgress] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState(null);
  const [skillInsights, setSkillInsights] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const timerRef = useRef(null);
  const { profile } = useUser();
  
  // Fetch available assessments
  useEffect(() => {
    const fetchAssessments = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // This connects to either skill_assessment.py or an external LMS API
        const response = await apiEndpoints.skills.getAssessments({
          userId: profile.id,
          category: selectedCategory,
          skill: selectedSkill
        });
        
        setAssessments(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch skill assessments');
        console.error('Error fetching assessments:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessments();
  }, [profile, selectedCategory, selectedSkill]);
  
  // Functions
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    
    const newSkill = {
      id: `skill-${Date.now()}`,
      name: newSkillName,
      level: newSkillLevel,
      category: selectedCategory,
      lastUpdated: new Date().toISOString(),
      assessments: []
    };
    
    setUserSkills([...userSkills, newSkill]);
    
    if (onAddSkill) {
      onAddSkill(newSkill);
    }
    
    setNewSkillName('');
    setNewSkillLevel(1);
    setSkillDialogOpen(false);
  };
  
  const handleUpdateSkillLevel = (skillId, newLevel) => {
    const updatedSkills = userSkills.map(skill => 
      skill.id === skillId ? { ...skill, level: newLevel, lastUpdated: new Date().toISOString() } : skill
    );
    
    setUserSkills(updatedSkills);
    
    if (onUpdateSkill) {
      const updatedSkill = updatedSkills.find(skill => skill.id === skillId);
      onUpdateSkill(updatedSkill);
    }
  };
  
  const handleStartAssessment = (assessment) => {
    setCurrentAssessment(assessment);
    setCurrentQuestion(0);
    setAssessmentResponses({});
    setAssessmentDialogOpen(true);
  };
  
  const handleAnswerQuestion = (questionId, answerId) => {
    setAssessmentResponses({
      ...assessmentResponses,
      [questionId]: answerId
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < currentAssessment.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleCompleteAssessment();
    }
  };
  
  const handleCompleteAssessment = () => {
    const correctAnswers = currentAssessment.questions.filter(
      q => assessmentResponses[q.id] === q.correctAnswer
    ).length;
    
    const score = Math.round((correctAnswers / currentAssessment.questions.length) * 100);
    
    // Determine skill level based on score
    let skillLevel = 1;
    if (score >= 90) skillLevel = 5;
    else if (score >= 75) skillLevel = 4;
    else if (score >= 60) skillLevel = 3;
    else if (score >= 40) skillLevel = 2;
    
    const result = {
      assessmentId: currentAssessment.id,
      skillName: currentAssessment.skillName,
      score,
      skillLevel,
      completedAt: new Date().toISOString(),
      correctAnswers,
      totalQuestions: currentAssessment.questions.length
    };
    
    setAssessmentResults(result);
    
    // Update skill level
    handleUpdateSkillLevel(
      userSkills.find(s => s.name === currentAssessment.skillName)?.id,
      skillLevel
    );
    
    if (onCompleteAssessment) {
      onCompleteAssessment(result);
    }
  };
  
  const handleCompare = () => {
    setComparisonMode(!comparisonMode);
    
    // In a real app, you would fetch benchmark data from the server
    if (!benchmarkData) {
      // Use role from user data, defaulting to Software Engineer
      const role = userData.role || 'Software Engineer';
      setBenchmarkData(industryBenchmarks[role] || industryBenchmarks['Software Engineer']);
    }
  };
  
  const getFilteredSkills = () => {
    return userSkills.filter(skill => {
      // Filter by search query
      if (searchQuery && !skill.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by category
      if (filterCriteria.category !== 'all' && skill.category !== filterCriteria.category) {
        return false;
      }
      
      // Filter by level
      if (filterCriteria.level !== 'all') {
        const levelNum = parseInt(filterCriteria.level);
        if (skill.level !== levelNum) {
          return false;
        }
      }
      
      return true;
    });
  };
  
  const getRecommendedSkills = () => {
    // Use role from user data, defaulting to Software Engineer
    const role = userData.role || 'Software Engineer';
    const roleRecommendations = recommendedSkillsByRole[role] || recommendedSkillsByRole['Software Engineer'];
    
    // Filter out skills that the user already has
    const userSkillNames = userSkills.map(s => s.name.toLowerCase());
    return roleRecommendations.filter(
      rec => !userSkillNames.includes(rec.name.toLowerCase())
    );
  };
  
  // Start assessment
  const startAssessment = async (assessmentId) => {
    setLoading(true);
    setError(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setAssessmentComplete(false);
    setResults(null);
    
    try {
      // This connects to the backend to start a new assessment session
      const response = await apiEndpoints.skills.startAssessment(assessmentId);
      
      setCurrentAssessment(response.data);
      setTimeLeft(response.data.timeLimit * 60); // Convert minutes to seconds
      setAssessmentInProgress(true);
      
      // Start timer
      if (response.data.timeLimit > 0) {
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              submitAssessment();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start assessment');
      console.error('Error starting assessment:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle answer selection for multiple choice
  const handleAnswerSelect = (event) => {
    setSelectedAnswer(event.target.value);
  };
  
  // Save answer and move to next question
  const saveAnswer = () => {
    if (!currentAssessment) return;
    
    const currentQuestion = currentAssessment.questions[currentQuestionIndex];
    let answerValue;
    
    switch (currentQuestion.type) {
      case 'multiple_choice':
        answerValue = selectedAnswer;
        break;
      case 'free_text':
        answerValue = freeTextAnswer;
        break;
      case 'coding':
        answerValue = codeAnswer;
        break;
      default:
        answerValue = selectedAnswer;
    }
    
    // Save the answer
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        answer: answerValue,
        questionType: currentQuestion.type
      }
    }));
    
    // Clear current answer
    setSelectedAnswer('');
    setFreeTextAnswer('');
    setCodeAnswer('');
    
    // Move to next question or submit if last question
    if (currentQuestionIndex < currentAssessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAssessment();
    }
  };
  
  // Submit assessment for grading
  const submitAssessment = async () => {
    if (!currentAssessment) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      // This connects to the backend quiz engine
      const response = await apiEndpoints.skills.submitAssessment({
        assessmentId: currentAssessment.id,
        userId: profile.id,
        answers: answers,
        completedAt: new Date().toISOString()
      });
      
      setResults(response.data);
      setAssessmentComplete(true);
      setAssessmentInProgress(false);
      
      // Get skill insights based on results
      if (response.data.score !== undefined) {
        try {
          const insightsResponse = await apiEndpoints.skills.getSkillInsights({
            userId: profile.id,
            assessmentId: currentAssessment.id,
            score: response.data.score,
            skillCategory: currentAssessment.skillCategory
          });
          
          setSkillInsights(insightsResponse.data);
        } catch (err) {
          console.error('Error fetching skill insights:', err);
        }
      }
      
      // Update user profile with completed assessment
      try {
        await apiEndpoints.user.updateProfile(profile.id, {
          completedAssessments: [
            ...(profile.completedAssessments || []),
            {
              assessmentId: currentAssessment.id,
              score: results.score,
              maxScore: results.maxScore,
              completedAt: new Date().toISOString()
            }
          ]
        });
      } catch (err) {
        console.error('Error updating profile with assessment:', err);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit assessment');
      console.error('Error submitting assessment:', err);
    } finally {
      setSubmitting(false);
      // Clear any timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render functions
  const renderSkillItem = (skill) => {
    return (
      <Grid item xs={12} sm={viewMode === 'grid' ? 6 : 12} md={viewMode === 'grid' ? 4 : 12} key={skill.id}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6">
                  {skill.name}
                  {skill.trending && (
                    <Tooltip title="In-demand skill">
                      <TrendingUpIcon 
                        color="primary" 
                        fontSize="small" 
                        sx={{ ml: 1, verticalAlign: 'middle' }} 
                      />
                    </Tooltip>
                  )}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {sampleSkillCategories.find(c => c.id === skill.category)?.name || skill.category}
                </Typography>
              </Box>
              
              <Chip 
                label={`Level ${skill.level}`}
                color={
                  skill.level >= 4 ? 'success' :
                  skill.level >= 3 ? 'info' :
                  skill.level >= 2 ? 'warning' : 'default'
                }
                size="small"
              />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>
                Proficiency:
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Rating
                  value={skill.level}
                  max={5}
                  onChange={(e, newValue) => handleUpdateSkillLevel(skill.id, newValue)}
                  icon={<StarIcon fontSize="inherit" />}
                  emptyIcon={<StarBorderIcon fontSize="inherit" />}
                />
                
                {comparisonMode && benchmarkData && benchmarkData[skill.category] && benchmarkData[skill.category][skill.name] && (
                  <Tooltip title="Industry benchmark">
                    <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
                      <CompareArrowsIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Benchmark: {benchmarkData[skill.category][skill.name]}
                      </Typography>
                    </Box>
                  </Tooltip>
                )}
              </Box>
            </Box>
            
            {skill.lastAssessment && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" display="block" color="text.secondary">
                  Last assessed: {new Date(skill.lastAssessment).toLocaleDateString()}
                </Typography>
                
                <Typography variant="caption" display="block" color="text.secondary">
                  Score: {skill.lastScore}%
                </Typography>
              </Box>
            )}
          </CardContent>
          <CardActions>
            <Button 
              size="small"
              startIcon={<AssessmentIcon />}
              onClick={() => {
                const assessment = sampleAssessments.find(a => a.skillName === skill.name);
                if (assessment) {
                  handleStartAssessment(assessment);
                }
              }}
            >
              Assess
            </Button>
            
            <Button 
              size="small"
              startIcon={<SchoolIcon />}
            >
              Learning Path
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };
  
  const renderSkillsTab = () => {
    const filteredSkills = getFilteredSkills();
    
    return (
      <Box>
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search skills..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCriteria.category}
              label="Category"
              onChange={(e) => setFilterCriteria({ ...filterCriteria, category: e.target.value })}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {sampleSkillCategories.map(category => (
                <MenuItem value={category.id} key={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Level</InputLabel>
            <Select
              value={filterCriteria.level}
              label="Level"
              onChange={(e) => setFilterCriteria({ ...filterCriteria, level: e.target.value })}
            >
              <MenuItem value="all">All Levels</MenuItem>
              <MenuItem value="1">Level 1</MenuItem>
              <MenuItem value="2">Level 2</MenuItem>
              <MenuItem value="3">Level 3</MenuItem>
              <MenuItem value="4">Level 4</MenuItem>
              <MenuItem value="5">Level 5</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Tooltip title={comparisonMode ? "Hide benchmark comparison" : "Compare with industry benchmarks"}>
            <Button
              startIcon={<CompareArrowsIcon />}
              variant={comparisonMode ? "contained" : "outlined"}
              size="small"
              onClick={handleCompare}
            >
              Benchmark
            </Button>
          </Tooltip>
          
          <Tooltip title="Add new skill">
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => setSkillDialogOpen(true)}
            >
              Add Skill
            </Button>
          </Tooltip>
        </Box>
        
        {filteredSkills.length === 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            No skills match your current filters. Try adjusting your search or add a new skill.
          </Alert>
        )}
        
        <Grid container spacing={2}>
          {filteredSkills.map(renderSkillItem)}
        </Grid>
      </Box>
    );
  };
  
  const renderAssessmentsTab = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Available Skill Assessments
        </Typography>
        
        <Grid container spacing={2}>
          {assessments.map(assessment => (
            <Grid item xs={12} md={6} key={assessment.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <QuizIcon color="primary" sx={{ mr: 1.5 }} />
                    <Typography variant="h6">
                      {assessment.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" gutterBottom>
                    {assessment.description}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      label={sampleSkillCategories.find(c => c.id === assessment.skillCategory)?.name || assessment.skillCategory}
                      size="small"
                      variant="outlined"
                    />
                    
                    <Chip 
                      icon={<TimerIcon fontSize="small" />}
                      label={`${assessment.duration} min`}
                      size="small"
                      variant="outlined"
                    />
                    
                    <Chip 
                      label={`${assessment.questions.length} questions`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    startIcon={<PlayArrowIcon />}
                    onClick={() => handleStartAssessment(assessment)}
                    variant="contained"
                    size="small"
                  >
                    Start Assessment
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  const renderRecommendationsTab = () => {
    const recommendations = getRecommendedSkills();
    
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 3 }}>
          Based on your current skills and career goals, we recommend developing the following skills.
        </Alert>
        
        <Grid container spacing={2}>
          {recommendations.map(skill => (
            <Grid item xs={12} sm={6} md={4} key={skill.name}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">
                    {skill.name}
                    {skill.trending && (
                      <Tooltip title="In-demand skill">
                        <TrendingUpIcon 
                          color="primary" 
                          fontSize="small" 
                          sx={{ ml: 1, verticalAlign: 'middle' }} 
                        />
                      </Tooltip>
                    )}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {sampleSkillCategories.find(c => c.id === skill.category)?.name}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      {skill.trending 
                        ? "This is a highly in-demand skill in the current job market." 
                        : "This skill will strengthen your professional profile."}
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setNewSkillName(skill.name);
                      setSelectedCategory(skill.category);
                      setSkillDialogOpen(true);
                    }}
                  >
                    Add to My Skills
                  </Button>
                  
                  <Button
                    size="small"
                    startIcon={<SchoolIcon />}
                  >
                    Learning Resources
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  const renderAssessmentQuestion = () => {
    if (!currentAssessment || !currentAssessment.questions) return null;
    
    const question = currentAssessment.questions[currentQuestion];
    
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Question {currentQuestion + 1} of {currentAssessment.questions.length}
        </Typography>
        
        <LinearProgress 
          variant="determinate" 
          value={(currentQuestion / currentAssessment.questions.length) * 100} 
          sx={{ mb: 3 }}
        />
        
        <Typography variant="h6" gutterBottom>
          {question.text}
        </Typography>
        
        <RadioGroup
          value={assessmentResponses[question.id] || ''}
          onChange={(e) => handleAnswerQuestion(question.id, e.target.value)}
        >
          {question.options.map(option => (
            <FormControlLabel
              key={option.id}
              value={option.id}
              control={<Radio />}
              label={option.text}
              sx={{ mb: 1 }}
            />
          ))}
        </RadioGroup>
      </Box>
    );
  };
  
  const renderAssessmentResults = () => {
    if (!results) return null;
    
    return (
      <Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <CircularProgress 
            variant="determinate" 
            value={results.score} 
            size={80}
            thickness={5}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="h4" color="primary">
            {results.score}/{results.maxScore}
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>
            {results.correctAnswers} of {results.totalQuestions} questions correct
          </Typography>
          
          <Chip 
            icon={<StarIcon />}
            label={`Skill Level: ${results.skillLevel}`}
            color={
              results.skillLevel >= 4 ? 'success' :
              results.skillLevel >= 3 ? 'primary' :
              results.skillLevel >= 2 ? 'warning' : 'default'
            }
            sx={{ mt: 1 }}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          What's Next?
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon><SchoolIcon color="primary" /></ListItemIcon>
            <ListItemText 
              primary="Recommended Learning Resources" 
              secondary="We've updated your learning path with resources to improve this skill."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon><TimelineIcon color="primary" /></ListItemIcon>
            <ListItemText 
              primary="Track Your Progress" 
              secondary="Reassess regularly to track your skill development over time."
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon><WorkIcon color="primary" /></ListItemIcon>
            <ListItemText 
              primary="Apply Your Skills" 
              secondary="Look for opportunities to apply this skill in real-world projects."
            />
          </ListItem>
        </List>
      </Box>
    );
  };
  
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Skill Assessment & Development
        </Typography>
        
        <Chip 
          icon={<VerifiedUserIcon />}
          label="AI-Powered Assessment" 
          color="primary" 
          variant="outlined" 
        />
      </Box>
      
      <Tabs 
        value={activeTab} 
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab icon={<AssessmentIcon />} label="My Skills" />
        <Tab icon={<QuizIcon />} label="Assessments" />
        <Tab icon={<LightbulbIcon />} label="Recommendations" />
      </Tabs>
      
      {activeTab === 0 && renderSkillsTab()}
      {activeTab === 1 && renderAssessmentsTab()}
      {activeTab === 2 && renderRecommendationsTab()}
      
      {/* Add Skill Dialog */}
      <Dialog
        open={skillDialogOpen}
        onClose={() => setSkillDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Add New Skill
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Skill Name"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              margin="normal"
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {sampleSkillCategories.map(category => (
                  <MenuItem value={category.id} key={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 3, mb: 1 }}>
              <Typography id="skill-level-slider" gutterBottom>
                Proficiency Level: {newSkillLevel}
              </Typography>
              <Slider
                value={newSkillLevel}
                onChange={(e, newValue) => setNewSkillLevel(newValue)}
                aria-labelledby="skill-level-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={5}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Beginner</Typography>
                <Typography variant="caption" color="text.secondary">Expert</Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setSkillDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddSkill}
            disabled={!newSkillName.trim()}
          >
            Add Skill
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Assessment Dialog */}
      <Dialog
        open={assessmentDialogOpen}
        onClose={() => setAssessmentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentAssessment?.title}
        </DialogTitle>
        
        <DialogContent>
          {assessmentResults ? (
            renderAssessmentResults()
          ) : (
            renderAssessmentQuestion()
          )}
        </DialogContent>
        
        <DialogActions>
          {assessmentResults ? (
            <Button 
              variant="contained" 
              onClick={() => {
                setAssessmentDialogOpen(false);
                setAssessmentResults(null);
              }}
            >
              Close
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => setAssessmentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                onClick={handleNextQuestion}
                disabled={!assessmentResponses[currentAssessment?.questions[currentQuestion]?.id]}
              >
                {currentQuestion < (currentAssessment?.questions.length || 0) - 1 ? 'Next' : 'Complete'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SkillAssessment; 