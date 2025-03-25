import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Divider,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import QuizIcon from '@mui/icons-material/Quiz';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';

// Personality type definitions
const PERSONALITY_TYPES = {
  realistic: {
    title: "Realistic",
    description: "Practical, physical, hands-on, tool-oriented",
    icon: <WorkIcon />,
    color: "#FF6B6B"
  },
  investigative: {
    title: "Investigative",
    description: "Analytical, intellectual, scientific, explorative",
    icon: <PsychologyIcon />,
    color: "#4ECDC4"
  },
  artistic: {
    title: "Artistic",
    description: "Creative, original, independent, chaotic",
    icon: <LightbulbIcon />,
    color: "#FFD166"
  },
  social: {
    title: "Social",
    description: "Cooperative, supporting, helping, healing/nurturing",
    icon: <PersonIcon />,
    color: "#6A8EAE"
  },
  enterprising: {
    title: "Enterprising",
    description: "Competitive environments, leadership, persuading",
    icon: <EmojiEventsIcon />,
    color: "#F86624"
  },
  conventional: {
    title: "Conventional",
    description: "Detail-oriented, organizing, clerical",
    icon: <SchoolIcon />,
    color: "#5BBC7A"
  }
};

// Mock questions for the assessment
const MOCK_QUESTIONS = [
  {
    id: 1,
    text: "I enjoy working with my hands and building things",
    category: "realistic"
  },
  {
    id: 2,
    text: "I like to analyze problems and find solutions",
    category: "investigative"
  },
  {
    id: 3,
    text: "I enjoy expressing myself through art, music, or writing",
    category: "artistic"
  },
  {
    id: 4,
    text: "I like helping and teaching others",
    category: "social"
  },
  {
    id: 5,
    text: "I enjoy persuading others and selling things or ideas",
    category: "enterprising"
  },
  {
    id: 6,
    text: "I like following a set of procedures and routines",
    category: "conventional"
  },
  {
    id: 7,
    text: "I enjoy working outdoors and being physically active",
    category: "realistic"
  },
  {
    id: 8,
    text: "I like to solve complex problems and puzzles",
    category: "investigative"
  },
  {
    id: 9,
    text: "I enjoy creative activities that allow for self-expression",
    category: "artistic"
  },
  {
    id: 10,
    text: "I like to work in groups and collaborate with others",
    category: "social"
  },
  {
    id: 11,
    text: "I enjoy leadership roles and making decisions",
    category: "enterprising"
  },
  {
    id: 12,
    text: "I like organizing information and keeping records",
    category: "conventional"
  },
  {
    id: 13,
    text: "I enjoy operating machines and using tools",
    category: "realistic"
  },
  {
    id: 14,
    text: "I like to conduct research and experiments",
    category: "investigative"
  },
  {
    id: 15,
    text: "I enjoy designing and creating things",
    category: "artistic"
  },
  {
    id: 16,
    text: "I like helping people with their problems",
    category: "social"
  },
  {
    id: 17,
    text: "I enjoy starting projects and influencing others",
    category: "enterprising"
  },
  {
    id: 18,
    text: "I like working with numbers and data",
    category: "conventional"
  }
];

const PersonalityAssessment = ({
  questions = MOCK_QUESTIONS,
  onComplete,
  onSave,
  loading = false,
  initialAnswers = null
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers || {});
  const [results, setResults] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showCareerSuggestions, setShowCareerSuggestions] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Calculate completion percentage
  const completionPercentage = Math.round((Object.keys(answers).length / questions.length) * 100);

  // Group questions by category for step-by-step navigation
  const questionsByCategory = questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {});

  const categories = Object.keys(questionsByCategory);

  // Handle answering a question
  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value)
    }));
  };

  // Move to the next question
  const handleNextQuestion = () => {
    if (activeQuestion < questionsByCategory[categories[currentStep]].length - 1) {
      setActiveQuestion(activeQuestion + 1);
    } else {
      handleNextStep();
    }
  };

  // Move to the previous question
  const handlePrevQuestion = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(activeQuestion - 1);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setActiveQuestion(questionsByCategory[categories[currentStep - 1]].length - 1);
    }
  };

  // Move to the next step (category)
  const handleNextStep = () => {
    if (currentStep < categories.length - 1) {
      setCurrentStep(currentStep + 1);
      setActiveQuestion(0);
    } else {
      calculateResults();
    }
  };

  // Move to the previous step (category)
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setActiveQuestion(0);
    }
  };

  // Calculate the assessment results
  const calculateResults = () => {
    const scores = {
      realistic: 0,
      investigative: 0,
      artistic: 0,
      social: 0,
      enterprising: 0,
      conventional: 0
    };

    // Calculate scores for each category
    questions.forEach(question => {
      const answer = answers[question.id] || 0;
      scores[question.category] += answer;
    });

    // Normalize scores to percentages
    const maxPossibleScore = {};
    Object.keys(questionsByCategory).forEach(category => {
      maxPossibleScore[category] = questionsByCategory[category].length * 5; // Assuming 5 is max score per question
    });

    const normalizedScores = {};
    Object.keys(scores).forEach(category => {
      normalizedScores[category] = Math.round((scores[category] / maxPossibleScore[category]) * 100);
    });

    // Find top 3 personality types
    const sortedTypes = Object.entries(normalizedScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, score]) => ({
        type,
        score,
        title: PERSONALITY_TYPES[type].title,
        description: PERSONALITY_TYPES[type].description,
        color: PERSONALITY_TYPES[type].color
      }));

    // Generate career suggestions based on top personality types
    const careerSuggestions = generateCareerSuggestions(sortedTypes.map(t => t.type));

    // Format results for radar chart
    const radarData = Object.entries(normalizedScores).map(([key, value]) => ({
      subject: PERSONALITY_TYPES[key].title,
      score: value,
      fullMark: 100
    }));

    setResults({
      scores: normalizedScores,
      topTypes: sortedTypes,
      radarData,
      careerSuggestions
    });

    setIsCompleted(true);

    // Call onComplete callback if provided
    if (onComplete) {
      onComplete({
        scores: normalizedScores,
        topTypes: sortedTypes,
        answers
      });
    }
  };

  // Generate career suggestions based on personality types
  const generateCareerSuggestions = (topTypes) => {
    const careerMap = {
      realistic: [
        "Mechanic",
        "Engineer",
        "Carpenter",
        "Electrician",
        "Chef",
        "Athlete",
        "Firefighter",
        "Construction Manager",
        "Pilot",
        "Farmer"
      ],
      investigative: [
        "Scientist",
        "Doctor",
        "Computer Programmer",
        "Researcher",
        "Mathematician",
        "Data Analyst",
        "Pharmacist",
        "Veterinarian",
        "Economist",
        "Environmental Scientist"
      ],
      artistic: [
        "Graphic Designer",
        "Writer",
        "Musician",
        "Actor",
        "Photographer",
        "Interior Designer",
        "Fashion Designer",
        "Architect",
        "Art Director",
        "Dance Instructor"
      ],
      social: [
        "Teacher",
        "Counselor",
        "Social Worker",
        "Nurse",
        "Physical Therapist",
        "Human Resources Specialist",
        "Speech Pathologist",
        "Psychologist",
        "Community Service Manager",
        "Career Advisor"
      ],
      enterprising: [
        "Sales Manager",
        "Entrepreneur",
        "Lawyer",
        "Real Estate Agent",
        "Marketing Manager",
        "Public Relations Specialist",
        "Executive",
        "Insurance Agent",
        "Financial Advisor",
        "Restaurant Manager"
      ],
      conventional: [
        "Accountant",
        "Administrative Assistant",
        "Financial Analyst",
        "Auditor",
        "Bank Teller",
        "Paralegal",
        "Bookkeeper",
        "Office Manager",
        "Insurance Underwriter",
        "Tax Preparer"
      ]
    };

    // Get career suggestions based on top personality types
    const suggestions = topTypes.flatMap(type => 
      careerMap[type].slice(0, 5).map(career => ({
        career,
        type
      }))
    );

    return suggestions;
  };

  // Reset the assessment
  const handleReset = () => {
    setAnswers({});
    setResults(null);
    setCurrentStep(0);
    setActiveQuestion(0);
    setIsCompleted(false);
  };

  // Check if current question has been answered
  const isCurrentQuestionAnswered = () => {
    const currentQuestion = questionsByCategory[categories[currentStep]][activeQuestion];
    return answers[currentQuestion.id] !== undefined;
  };

  // Render the assessment questions
  const renderQuestions = () => {
    const currentCategory = categories[currentStep];
    const currentQuestion = questionsByCategory[currentCategory][activeQuestion];
    
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <LinearProgress 
            variant="determinate" 
            value={completionPercentage} 
            sx={{ height: 10, borderRadius: 5 }} 
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Question {activeQuestion + 1} of {questionsByCategory[currentCategory].length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {completionPercentage}% Complete
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {PERSONALITY_TYPES[currentCategory].icon}
          <Typography variant="subtitle1" sx={{ ml: 1 }}>
            {PERSONALITY_TYPES[currentCategory].title} Traits
          </Typography>
        </Box>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {currentQuestion.text}
            </Typography>
            
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">How much do you agree with this statement?</FormLabel>
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
              >
                <FormControlLabel value="1" control={<Radio />} label="Strongly Disagree" />
                <FormControlLabel value="2" control={<Radio />} label="Disagree" />
                <FormControlLabel value="3" control={<Radio />} label="Neutral" />
                <FormControlLabel value="4" control={<Radio />} label="Agree" />
                <FormControlLabel value="5" control={<Radio />} label="Strongly Agree" />
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            onClick={handlePrevQuestion}
            startIcon={<ArrowBackIcon />}
            disabled={currentStep === 0 && activeQuestion === 0}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={handleNextQuestion}
            endIcon={<ArrowForwardIcon />}
            disabled={!isCurrentQuestionAnswered()}
          >
            {activeQuestion === questionsByCategory[currentCategory].length - 1 && currentStep === categories.length - 1
              ? "See Results"
              : "Next"}
          </Button>
        </Box>
      </Box>
    );
  };

  // Render the assessment results
  const renderResults = () => {
    if (!results) return null;
    
    const { topTypes, radarData, careerSuggestions } = results;
    
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Your Personality Profile
        </Typography>
        
        {/* Radar Chart for all personality types */}
        <Box sx={{ height: 350, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={130} data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <RechartsTooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
        
        <Typography variant="h6" gutterBottom>
          Your Top Personality Types
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {topTypes.map((type, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <Card 
                variant="outlined" 
                sx={{ 
                  borderColor: type.color,
                  borderWidth: 2
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ mr: 1, color: type.color }}>
                      {PERSONALITY_TYPES[type.type].icon}
                    </Box>
                    <Typography variant="h6">
                      {type.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {type.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={type.score} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 5,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: type.color
                          }
                        }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {type.score}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            onClick={() => setShowCareerSuggestions(!showCareerSuggestions)}
            startIcon={<WorkIcon />}
            sx={{ mb: 2 }}
          >
            {showCareerSuggestions ? "Hide Career Suggestions" : "View Career Suggestions"}
          </Button>
          
          {showCareerSuggestions && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recommended Careers
                </Typography>
                
                <Grid container spacing={1}>
                  {careerSuggestions.map((suggestion, index) => (
                    <Grid item key={index}>
                      <Chip
                        label={suggestion.career}
                        icon={PERSONALITY_TYPES[suggestion.type].icon}
                        sx={{ 
                          borderColor: PERSONALITY_TYPES[suggestion.type].color,
                          color: PERSONALITY_TYPES[suggestion.type].color,
                          mb: 1
                        }}
                        variant="outlined"
                      />
                    </Grid>
                  ))}
                </Grid>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  These career suggestions are based on your top personality traits. Consider exploring these options further to find your ideal career path.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            startIcon={<RestartAltIcon />}
            onClick={handleReset}
          >
            Retake Assessment
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => onSave && onSave(results)}
          >
            Save Results
          </Button>
        </Box>
      </Box>
    );
  };

  // Information dialog about personality types
  const renderInfoDialog = () => (
    <Dialog open={showInfo} onClose={() => setShowInfo(false)} maxWidth="md">
      <DialogTitle>
        Understanding Personality Types
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle1" gutterBottom>
          Holland's Theory of Career Choice (RIASEC Model)
        </Typography>
        <Typography variant="body2" paragraph>
          This assessment is based on John Holland's RIASEC model, which identifies six personality types that influence career preferences. Most people are a combination of multiple types.
        </Typography>
        
        <Grid container spacing={3}>
          {Object.entries(PERSONALITY_TYPES).map(([key, type]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ mr: 1, color: type.color }}>
                      {type.icon}
                    </Box>
                    <Typography variant="subtitle1">
                      {type.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {type.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowInfo(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  // Main component render
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Career Personality Assessment
        </Typography>
        <Tooltip title="Learn about personality types">
          <IconButton onClick={() => setShowInfo(true)}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Processing your results...
          </Typography>
        </Box>
      ) : (
        <Box>
          {isCompleted ? renderResults() : renderQuestions()}
        </Box>
      )}
      
      {renderInfoDialog()}
    </Paper>
  );
};

export default PersonalityAssessment; 