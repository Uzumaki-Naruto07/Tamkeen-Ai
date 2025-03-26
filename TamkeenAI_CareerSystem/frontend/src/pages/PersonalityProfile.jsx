import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Grid, Card, CardContent, CardActions, CardHeader,
  List, ListItem, ListItemText, ListItemIcon,
  CircularProgress, Alert, Tabs, Tab, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Radio, RadioGroup, FormControlLabel, FormControl,
  FormLabel, LinearProgress, Tooltip, Rating
} from '@mui/material';
import {
  Psychology, Person, Work, School, EmojiObjects,
  CheckCircle, Info, Launch, Description, Groups,
  RecordVoiceOver, Build, LightbulbOutline, AutoGraph,
  Favorite, VerifiedUser, Fingerprint, QuestionAnswer,
  Refresh, StarOutline, BarChart, AccountBalance,
  StarRate, LocalLibrary, Equalizer, EventNote,
  Lightbulb, BusinessCenter, People, Assessment,
  LocationOn
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PersonalityChart from '../components/PersonalityChart';

const PersonalityProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [personalityType, setPersonalityType] = useState(null);
  const [personalityTraits, setPersonalityTraits] = useState({});
  const [personalityJobs, setPersonalityJobs] = useState([]);
  const [careerInsights, setCareerInsights] = useState([]);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testInProgress, setTestInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [testType, setTestType] = useState('mbti'); // 'mbti' or 'big5'
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testSelectionOpen, setTestSelectionOpen] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [personalityHistory, setPersonalityHistory] = useState([]);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [compatibilityScores, setCompatibilityScores] = useState([]);
  
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Fetch personality data
  useEffect(() => {
    const fetchPersonalityData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Check if user has completed personality test
        const statusResponse = await apiEndpoints.personality.getStatus(profile.id);
        setTestCompleted(statusResponse.data.completed || false);
        
        if (statusResponse.data.completed) {
          // Fetch personality type and traits
          const personalityResponse = await apiEndpoints.personality.getPersonalityProfile(profile.id);
          setPersonalityType(personalityResponse.data.type);
          setPersonalityTraits(personalityResponse.data.traits || {});
          setTestType(personalityResponse.data.testType || 'mbti');
          
          // Fetch career matches based on personality
          const careerResponse = await apiEndpoints.personality.getCareerMatches(profile.id);
          setPersonalityJobs(careerResponse.data.jobs || []);
          setCareerInsights(careerResponse.data.insights || []);
          
          // Fetch previous test results history
          const historyResponse = await apiEndpoints.personality.getTestHistory(profile.id);
          setPersonalityHistory(historyResponse.data || []);
          
          // Fetch compatibility scores with different job types
          const compatibilityResponse = await apiEndpoints.personality.getCompatibilityScores(profile.id);
          setCompatibilityScores(compatibilityResponse.data || []);
        }
      } catch (err) {
        setError('Failed to load personality data');
        console.error('Error fetching personality data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPersonalityData();
  }, [profile]);
  
  // Calculate progress percentage when current question changes
  useEffect(() => {
    if (questions.length > 0) {
      setProgressPercent((currentQuestion / questions.length) * 100);
    }
  }, [currentQuestion, questions.length]);
  
  // Start personality test
  const startPersonalityTest = async (type) => {
    setTestType(type);
    setTestSelectionOpen(false);
    setTestInProgress(true);
    setCurrentQuestion(0);
    setAnswers({});
    
    try {
      const questionsResponse = await apiEndpoints.personality.getQuestions(type);
      setQuestions(questionsResponse.data || []);
      setTestDialogOpen(true);
    } catch (err) {
      setError('Failed to load personality test questions');
      console.error('Error loading test questions:', err);
      setTestInProgress(false);
    }
  };
  
  // Handle answer selection
  const handleAnswerSelect = (value) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: value
    });
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Last question answered, submit the test
      submitTest();
    }
  };
  
  // Submit completed test
  const submitTest = async () => {
    setLoading(true);
    
    try {
      const submitResponse = await apiEndpoints.personality.submitTest(profile.id, {
        testType,
        answers
      });
      
      // Update state with new personality data
      setPersonalityType(submitResponse.data.type);
      setPersonalityTraits(submitResponse.data.traits || {});
      
      // Fetch career matches based on new personality
      const careerResponse = await apiEndpoints.personality.getCareerMatches(profile.id);
      setPersonalityJobs(careerResponse.data.jobs || []);
      setCareerInsights(careerResponse.data.insights || []);
      
      // Fetch compatibility scores with different job types
      const compatibilityResponse = await apiEndpoints.personality.getCompatibilityScores(profile.id);
      setCompatibilityScores(compatibilityResponse.data || []);
      
      setTestCompleted(true);
      setTestInProgress(false);
      setTestDialogOpen(false);
      
      // Fetch updated test history
      const historyResponse = await apiEndpoints.personality.getTestHistory(profile.id);
      setPersonalityHistory(historyResponse.data || []);
    } catch (err) {
      setError('Failed to submit personality test');
      console.error('Error submitting test:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Render personality traits tab
  const renderPersonalityTraits = () => {
    return (
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader
                title="Personality Type"
                subheader={personalityType}
              />
              <CardContent>
                <Typography paragraph>
                  {personalityTraits.description || 'No description available'}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Key Traits
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {personalityTraits.keyTraits?.map((trait, index) => (
                    <Chip key={index} label={trait} />
                  ))}
                </Box>
                
                <Typography variant="subtitle1" gutterBottom>
                  Work Style
                </Typography>
                
                <Typography paragraph>
                  {personalityTraits.workStyle || 'No work style information available'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  startIcon={<Refresh />}
                  onClick={() => setTestSelectionOpen(true)}
                >
                  Retake Test
                </Button>
                
                <Button
                  size="small"
                  startIcon={<Description />}
                  onClick={() => setHistoryDialogOpen(true)}
                >
                  View History
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Trait Analysis" />
              <CardContent>
                <Box sx={{ height: 300, mb: 2 }}>
                  <PersonalityChart data={personalityTraits.traitScores || {}} type={testType} />
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Based on {testType === 'mbti' ? 'Myers-Briggs Type Indicator' : 'Big Five Personality Traits'} assessment
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Strengths & Weaknesses */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Strengths" />
              <CardContent>
                <List dense>
                  {personalityTraits.strengths?.map((strength, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText primary={strength} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardHeader title="Potential Challenges" />
              <CardContent>
                <List dense>
                  {personalityTraits.challenges?.map((challenge, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Info color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={challenge} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  // Render career matches tab
  const renderCareerMatches = () => {
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Career Compatibility
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {compatibilityScores.slice(0, 5).map((field, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {field.field}
                </Typography>
                
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={field.score}
                    size={80}
                    color={field.score > 75 ? 'success' : field.score > 50 ? 'primary' : 'warning'}
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
                      {field.score}%
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
        
        <Typography variant="subtitle1" gutterBottom>
          Recommended Careers
        </Typography>
        
        <Grid container spacing={2}>
          {personalityJobs.map((job, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {job.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating 
                      value={job.matchScore / 20} 
                      readOnly 
                      size="small"
                      precision={0.5}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {job.matchScore}% Match
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      size="small" 
                      icon={<BusinessCenter fontSize="small" />} 
                      label={job.industry} 
                      sx={{ mr: 1, mb: 1 }}
                    />
                    {job.education && (
                      <Chip 
                        size="small" 
                        icon={<School fontSize="small" />} 
                        label={job.education} 
                        sx={{ mr: 1, mb: 1 }}
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {job.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Key Personality Traits
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {job.traits.map((trait, idx) => (
                      <Chip key={idx} label={trait} size="small" variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small"
                    startIcon={<LocationOn />}
                    onClick={() => navigate('/job-search-dashboard', { state: { searchTerm: job.title } })}
                  >
                    Find Jobs
                  </Button>
                  
                  <Button
                    size="small"
                    startIcon={<Info />}
                    onClick={() => window.open(job.infoUrl, '_blank')}
                  >
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  // Render career insights tab
  const renderCareerInsights = () => {
    return (
      <Box>
        <Grid container spacing={3}>
          {careerInsights.map((insight, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined">
                <CardHeader
                  title={insight.title}
                  subheader={insight.category}
                  avatar={
                    <Avatar sx={{ bgcolor: insight.color || 'primary.main' }}>
                      <Lightbulb />
                    </Avatar>
                  }
                />
                <CardContent>
                  <Typography paragraph>
                    {insight.content}
                  </Typography>
                  
                  {insight.tips && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Tips for Your Personality Type
                      </Typography>
                      
                      <List dense>
                        {insight.tips.map((tip, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon>
                              <EmojiObjects color="primary" />
                            </ListItemIcon>
                            <ListItemText primary={tip} />
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  // Render test selection dialog
  const renderTestSelectionDialog = () => (
    <Dialog
      open={testSelectionOpen}
      onClose={() => setTestSelectionOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Choose Personality Assessment
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card 
              onClick={() => startPersonalityTest('mbti')}
              sx={{ 
                cursor: 'pointer', 
                height: '100%',
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'scale(1.02)' } 
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  MBTI Assessment
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Based on Myers-Briggs Type Indicator, categorizing your personality into 16 distinct types based on four pairs of psychological preferences.
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Chip label="16 unique types" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="~15 minutes" size="small" sx={{ mb: 1 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card 
              onClick={() => startPersonalityTest('big5')}
              sx={{ 
                cursor: 'pointer', 
                height: '100%',
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'scale(1.02)' } 
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Big Five Assessment
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  Measures five dimensions of personality: Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism.
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Chip label="5 dimensions" size="small" sx={{ mr: 1, mb: 1 }} />
                  <Chip label="~10 minutes" size="small" sx={{ mb: 1 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => setTestSelectionOpen(false)}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  // Render test dialog
  const renderTestDialog = () => (
    <Dialog
      open={testDialogOpen}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      disableBackdropClick
    >
      <DialogTitle>
        {testType === 'mbti' ? 'Myers-Briggs Personality Assessment' : 'Big Five Personality Assessment'}
      </DialogTitle>
      
      <LinearProgress 
        variant="determinate" 
        value={progressPercent} 
        sx={{ height: 8 }}
      />
      
      <DialogContent>
        {questions.length > 0 && currentQuestion < questions.length && (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" gutterBottom>
              Question {currentQuestion + 1} of {questions.length}
            </Typography>
            
            <Typography variant="body1" paragraph>
              {questions[currentQuestion].text}
            </Typography>
            
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup
                value={answers[questions[currentQuestion].id] || ''}
                onChange={(e) => handleAnswerSelect(e.target.value)}
              >
                {questions[currentQuestion].options.map((option, idx) => (
                  <FormControlLabel
                    key={idx}
                    value={option.value}
                    control={<Radio />}
                    label={option.text}
                    sx={{ 
                      py: 1, 
                      px: 2, 
                      mb: 1, 
                      border: '1px solid', 
                      borderColor: 'divider',
                      borderRadius: 1,
                      width: '100%'
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto' }}>
          Answer to proceed to the next question
        </Typography>
        
        <Button 
          onClick={() => {
            setTestDialogOpen(false);
            setTestInProgress(false);
          }}
          color="inherit"
        >
          Cancel Test
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  // Render test history dialog
  const renderHistoryDialog = () => (
    <Dialog
      open={historyDialogOpen}
      onClose={() => setHistoryDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Personality Test History
      </DialogTitle>
      
      <DialogContent dividers>
        {personalityHistory.length === 0 ? (
          <Alert severity="info">
            No previous test history found.
          </Alert>
        ) : (
          <List>
            {personalityHistory.map((test, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    {test.testType === 'mbti' ? <Psychology /> : <Fingerprint />}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        {test.testType === 'mbti' ? 'MBTI Test' : 'Big Five Assessment'} - {test.result}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Taken on: {new Date(test.date).toLocaleDateString()} at {new Date(test.date).toLocaleTimeString()}
                        </Typography>
                        
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            size="small" 
                            label={`Primary Trait: ${test.primaryTrait}`} 
                            sx={{ mr: 1, mb: 1 }} 
                          />
                          <Chip 
                            size="small" 
                            label={`Career Matches: ${test.careerMatchCount}`} 
                            sx={{ mr: 1, mb: 1 }} 
                          />
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                
                {index < personalityHistory.length - 1 && <Divider variant="inset" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={() => setHistoryDialogOpen(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <Box sx={{ py: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Personality Profile
          </Typography>
          
          {testCompleted && (
            <Chip 
              icon={<Fingerprint />} 
              label={personalityType} 
              color="primary" 
              sx={{ mr: 1 }}
            />
          )}
          
          {!testCompleted && !testInProgress && (
            <Button
              variant="contained"
              onClick={() => setTestSelectionOpen(true)}
              startIcon={<Assessment />}
            >
              Take Personality Test
            </Button>
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {loading ? (
          <LoadingSpinner message="Loading personality profile..." />
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : !testCompleted ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Discover Your Career Personality
            </Typography>
            
            <Typography variant="body1" paragraph>
              Take our personality assessment to gain insights into your work style,
              strengths, and ideal career paths based on your unique traits.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => setTestSelectionOpen(true)}
              startIcon={<Assessment />}
              sx={{ mt: 2 }}
            >
              Start Personality Test
            </Button>
          </Box>
        ) : (
          <>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<Person />} label="Personality Traits" />
              <Tab icon={<Work />} label="Career Matches" />
              <Tab icon={<Lightbulb />} label="Insights" />
            </Tabs>
            
            {activeTab === 0 && renderPersonalityTraits()}
            {activeTab === 1 && renderCareerMatches()}
            {activeTab === 2 && renderCareerInsights()}
          </>
        )}
      </Paper>
      
      {renderTestSelectionDialog()}
      {renderTestDialog()}
      {renderHistoryDialog()}
    </Box>
  );
};

export default PersonalityProfile; 