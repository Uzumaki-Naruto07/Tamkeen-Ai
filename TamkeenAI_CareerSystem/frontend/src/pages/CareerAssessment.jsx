import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Tabs, Tab, Button,
  Grid, Card, CardContent, CardActions,
  Divider, Chip, Avatar, List, ListItem,
  ListItemText, ListItemIcon, LinearProgress,
  Alert, CircularProgress, Accordion, AccordionSummary,
  AccordionDetails, Badge, Dialog, DialogTitle,
  DialogContent, DialogActions, Rating, CardHeader
} from '@mui/material';
import {
  School, Work, Psychology, TrendingUp, Assessment,
  Timeline, CheckCircle, Schedule, ExpandMore,
  BarChart, Star, Insights, Favorite, WorkspacePremium,
  Code, Business, SportsEsports, Language, Info,
  Close, PieChart, InsertChart, CheckBox, Error,
  Assignment, FitnessCenter, Flag
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import SkillAssessment from '../components/SkillAssessment';
import LearningPathGenerator from '../components/LearningPathGenerator';
import LoadingSpinner from '../components/LoadingSpinner';
import AssessmentResults from '../components/AssessmentResults';
import CareerPrediction from '../components/CareerPrediction';
import CareerRecommendations from '../components/CareerRecommendations';
import { Stepper, Step, StepLabel, StepContent } from '@mui/material';

// For any icon that might not exist, import alternatives
import FlightIcon from '@mui/icons-material/FlightTakeoff';

export default function CareerAssessment() {
  try {
    return <CareerAssessmentPage />;
  } catch (error) {
    console.error("Error rendering Career Assessment:", error);
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" paragraph>
            We're sorry, but an error occurred while rendering this component.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Please try refreshing the page or contact support if the issue persists.
          </Typography>
        </Paper>
      </Box>
    );
  }
}

const CareerAssessmentPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [assessmentsList, setAssessmentsList] = useState([]);
  const [availableSkillGroups, setAvailableSkillGroups] = useState([]);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [skillScores, setSkillScores] = useState({});
  const [careerRecommendations, setCareerRecommendations] = useState([]);
  const [assessmentActive, setAssessmentActive] = useState(false);
  const [activeSkillCategory, setActiveSkillCategory] = useState(null);
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  
  // New state for showing assessment answers and performance
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [questionResponses, setQuestionResponses] = useState([]);
  
  // New state for enhanced assessment data
  const [personalityType, setPersonalityType] = useState(null);
  const [interests, setInterests] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [values, setValues] = useState([]);
  const [careerTimeline, setCareerTimeline] = useState([]);
  const [gapAnalysis, setGapAnalysis] = useState({});
  
  // Add state for career prediction
  const [careerPredictionResults, setCareerPredictionResults] = useState(null);
  const [showCareerPrediction, setShowCareerPrediction] = useState(false);
  
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Fetch available assessments and user's completed assessments
  useEffect(() => {
    const fetchAssessmentData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Handle case where profile is not yet loaded
        const userId = profile?.id || 'guest-user';
        console.log('Fetching assessment data for user:', userId);
        
        // Fetch available assessments
        const assessmentsResponse = await apiEndpoints.assessment.getAvailableAssessments(userId);
        console.log('Received assessment data:', assessmentsResponse.data);
        setAssessmentsList(assessmentsResponse.data.assessments || []);
        setAvailableSkillGroups(assessmentsResponse.data.skillGroups || []);
        
        // Fetch user's completed assessments
        const completedResponse = await apiEndpoints.assessment.getUserAssessments(userId);
        console.log('Received completed assessments:', completedResponse.data);
        setCompletedAssessments(completedResponse.data || []);
        
        // Calculate skill scores based on completed assessments
        const scores = {};
        (completedResponse.data || []).forEach(assessment => {
          const category = assessment.skillCategory;
          
          if (!scores[category]) {
            scores[category] = {
              total: 0,
              count: 0,
              assessments: []
            };
          }
          
          scores[category].total += (assessment.score / assessment.maxScore) * 100;
          scores[category].count += 1;
          scores[category].assessments.push(assessment);
        });
        
        // Calculate averages
        Object.keys(scores).forEach(category => {
          scores[category].average = scores[category].total / scores[category].count;
        });
        
        setSkillScores(scores);
        
        // If there's an assessmentId in the URL, load that assessment
        if (assessmentId) {
          const assessment = assessmentsResponse.data.assessments?.find(a => a.id === assessmentId);
          if (assessment) {
            setCurrentAssessment(assessment);
            setActiveSkillCategory(assessment.skillCategory);
            setAssessmentActive(true);
            setTabValue(0); // Switch to assessment tab
          }
        }
        
        // Fetch career recommendations based on assessments
        if ((completedResponse.data || []).length > 0) {
          try {
            const recommendationsResponse = await apiEndpoints.career.getCareerRecommendations({
              userId,
              assessmentResults: completedResponse.data
            });
            
            setCareerRecommendations(recommendationsResponse.data || []);
          } catch (err) {
            console.error('Error fetching career recommendations:', err);
            // Don't set error state here - just log it as it's non-critical
          }
        }
      } catch (err) {
        console.error('Error fetching assessment data:', err);
        setError('Failed to load assessment data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessmentData();
  }, [profile, assessmentId]);
  
  // Add mock data for demonstration purposes
  useEffect(() => {
    if (!loading && profile) {
      // Set example personality assessment data
      setPersonalityType({
        type: "Investigative Thinker",
        code: "INTJ",
        description: "You're analytical, logical, and intellectually curious. You excel at solving complex problems and enjoy exploring ideas deeply.",
        suitableCareers: ["Data Scientist", "AI Researcher", "Systems Analyst", "Strategic Planner"]
      });
      
      // Set example interests
      setInterests([
        { category: "Technology", score: 85, activities: ["Coding", "System Design", "Troubleshooting"] },
        { category: "Analysis", score: 78, activities: ["Data Interpretation", "Research", "Critical Thinking"] },
        { category: "Teaching", score: 65, activities: ["Explaining Concepts", "Training", "Mentoring"] },
        { category: "Creative", score: 45, activities: ["Visual Design", "Content Creation", "Innovation"] },
        { category: "Management", score: 58, activities: ["Team Leadership", "Resource Allocation", "Strategic Planning"] }
      ]);
      
      // Set example strengths
      setStrengths([
        { name: "Problem Solving", level: 4.5, description: "Ability to analyze situations and find effective solutions" },
        { name: "Analytical Thinking", level: 4.8, description: "Breaking down complex problems into manageable parts" },
        { name: "Technical Aptitude", level: 4.2, description: "Quickly learning and applying new technologies" },
        { name: "Communication", level: 3.7, description: "Clearly conveying complex ideas to diverse audiences" },
        { name: "Adaptability", level: 3.9, description: "Adjusting to changing requirements and environments" }
      ]);
      
      // Set example values
      setValues([
        { name: "Knowledge Seeking", importance: 5, aligned: true },
        { name: "Innovation", importance: 4, aligned: true },
        { name: "Autonomy", importance: 4, aligned: false },
        { name: "Work-Life Balance", importance: 3, aligned: true },
        { name: "Recognition", importance: 3, aligned: false }
      ]);
      
      // Set example gap analysis
      setGapAnalysis({
        currentSkills: ["Python", "Data Analysis", "Machine Learning Basics", "Presentation Skills"],
        targetRole: "AI Engineer",
        missingSkills: [
          { skill: "Deep Learning", priority: "High", resources: ["Deep Learning Specialization on Coursera", "TensorFlow Certification"] },
          { skill: "Cloud Infrastructure", priority: "Medium", resources: ["AWS Certified Solutions Architect", "Google Cloud Platform Fundamentals"] },
          { skill: "MLOps", priority: "Medium", resources: ["MLOps on Azure", "CI/CD for Machine Learning"] }
        ],
        timeline: "6-9 months"
      });
      
      // Set example career timeline
      setCareerTimeline([
        { role: "Junior Data Analyst", timeframe: "Current", skills: ["Data Analysis", "SQL", "Python Basics", "Reporting"] },
        { role: "Data Scientist", timeframe: "1-2 years", skills: ["Machine Learning", "Statistical Analysis", "Data Modeling", "Python Advanced"] },
        { role: "Senior Data Scientist", timeframe: "3-5 years", skills: ["MLOps", "Team Leadership", "Project Management", "Deep Learning"] },
        { role: "AI Lead", timeframe: "5-7 years", skills: ["AI Strategy", "Research Direction", "Product Development", "Business Intelligence"] }
      ]);
    }
  }, [loading, profile]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle starting an assessment
  const handleStartAssessment = (assessment) => {
    setCurrentAssessment(assessment);
    setActiveSkillCategory(assessment.skillCategory);
    setAssessmentActive(true);
    setTabValue(0); // Switch to assessment tab
  };
  
  // Handle assessment completion
  const handleAssessmentComplete = (results) => {
    // Store detailed assessment results including correct answers
    setAssessmentResults(results);
    setQuestionResponses(results.questionResponses || []);
    setShowAnswers(true);
    
    // Refresh completed assessments list
    const fetchUpdatedAssessments = async () => {
      setResultsLoading(true);
      try {
        const userId = profile?.id || 'guest-user';
        const completedResponse = await apiEndpoints.assessment.getUserAssessments(userId);
        setCompletedAssessments(completedResponse.data || []);
        
        // Update skill scores
        const scores = { ...skillScores };
        const category = currentAssessment.skillCategory;
        
        if (!scores[category]) {
          scores[category] = {
            total: 0,
            count: 0,
            assessments: []
          };
        }
        
        const newAssessment = {
          id: results.assessmentId,
          skillCategory: category,
          score: results.score,
          maxScore: results.maxScore,
          completedAt: new Date().toISOString()
        };
        
        // Remove previous instance of this assessment if it exists
        scores[category].assessments = scores[category].assessments.filter(
          a => a.id !== results.assessmentId
        );
        
        // Add the new assessment result
        scores[category].assessments.push(newAssessment);
        
        // Recalculate scores
        scores[category].total = scores[category].assessments.reduce(
          (sum, a) => sum + (a.score / a.maxScore) * 100, 0
        );
        scores[category].count = scores[category].assessments.length;
        scores[category].average = scores[category].total / scores[category].count;
        
        setSkillScores(scores);
        
        // Update career recommendations
        try {
          const recommendationsResponse = await apiEndpoints.career.getCareerRecommendations({
            userId,
            assessmentResults: completedResponse.data
          });
          
          setCareerRecommendations(recommendationsResponse.data || []);
        } catch (err) {
          console.error('Error fetching career recommendations:', err);
          // Don't set error for this non-critical feature
        }
      } catch (err) {
        console.error('Error updating assessment data:', err);
        // Add user-friendly error handling
        setError('There was a problem updating your assessment results. Your progress may not be saved.');
      } finally {
        setResultsLoading(false);
        // Don't automatically hide the assessment to show results
        // setAssessmentActive(false);
        // setCurrentAssessment(null);
      }
    };
    
    fetchUpdatedAssessments();
  };
  
  // Reset assessment
  const handleCancelAssessment = () => {
    setAssessmentActive(false);
    setCurrentAssessment(null);
    setActiveSkillCategory(null);
  };
  
  // Get skill category icon
  const getSkillCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'technical':
        return <Code />;
      case 'leadership':
        return <Business />;
      case 'communication':
        return <Language />;
      case 'problem-solving':
        return <Psychology />;
      case 'creativity':
        return <SportsEsports />;
      default:
        return <Star />;
    }
  };
  
  // Render assessment cards
  const renderAssessmentCards = () => {
    const groupedAssessments = {};
    
    // Group assessments by category
    assessmentsList.forEach(assessment => {
      if (!groupedAssessments[assessment.skillCategory]) {
        groupedAssessments[assessment.skillCategory] = [];
      }
      groupedAssessments[assessment.skillCategory].push(assessment);
    });
    
    return (
      <Box>
        {Object.keys(groupedAssessments).map(category => (
          <Box key={category} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                {getSkillCategoryIcon(category)}
              </Avatar>
              <Typography variant="h6">{category} Skills</Typography>
            </Box>
            
            <Grid container spacing={2}>
              {groupedAssessments[category].map(assessment => {
                // Check if the assessment has been completed
                const isCompleted = completedAssessments.some(
                  completed => completed.id === assessment.id
                );
                
                // Get the latest score if completed
                const latestResult = isCompleted 
                  ? completedAssessments.find(completed => completed.id === assessment.id)
                  : null;
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={assessment.id}>
                    <Card variant={isCompleted ? "outlined" : "elevation"}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" component="div" noWrap>
                            {assessment.title}
                          </Typography>
                          
                          {isCompleted && (
                            <Badge 
                              color="success" 
                              badgeContent={<CheckCircle fontSize="small" />}
                            />
                          )}
                        </Box>
                        
                        <Typography color="text.secondary" gutterBottom>
                          {assessment.description}
                        </Typography>
                        
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          <Chip 
                            label={`${assessment.questions} questions`} 
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Chip 
                            label={`${assessment.estimatedTime} min`} 
                            icon={<Schedule fontSize="small" />}
                            size="small"
                          />
                        </Box>
                        
                        {isCompleted && latestResult && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" gutterBottom>
                              Your Score: {latestResult.score}/{latestResult.maxScore}
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={(latestResult.score / latestResult.maxScore) * 100}
                              sx={{ height: 6, borderRadius: 1 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Last completed: {new Date(latestResult.completedAt).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small"
                          onClick={() => handleStartAssessment(assessment)}
                          color={isCompleted ? "primary" : "primary"}
                          variant={isCompleted ? "outlined" : "contained"}
                        >
                          {isCompleted ? "Retake Assessment" : "Start Assessment"}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}
      </Box>
    );
  };
  
  // Render active assessment
  const renderActiveAssessment = () => {
    if (!currentAssessment) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Assessment Selected
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please select an assessment from the list to get started.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => setTabValue(1)}
          >
            Browse Assessments
          </Button>
        </Paper>
      );
    }
    
    // Show assessment results with correct answers if assessment is completed
    if (showAnswers && assessmentResults) {
      return (
        <AssessmentResults 
          results={{
            ...assessmentResults,
            title: currentAssessment.title,
            questionResponses: questionResponses
          }}
          onRetake={() => {
            setShowAnswers(false);
            setAssessmentResults(null);
            // Restart the same assessment
            handleStartAssessment(currentAssessment);
          }}
          onFinish={() => {
            setShowAnswers(false);
            setAssessmentResults(null);
            setTabValue(3); // Go to Skills tab
          }}
        />
      );
    }
    
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">
            {currentAssessment.title}
          </Typography>
          
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={handleCancelAssessment}
          >
            Cancel Assessment
          </Button>
        </Box>
        
        <SkillAssessment
          skillCategory={activeSkillCategory}
          specificSkill={currentAssessment.id}
          onComplete={handleAssessmentComplete}
        />
      </Paper>
    );
  };
  
  // Render skill insights
  const renderSkillInsights = () => {
    if (Object.keys(skillScores).length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Assessment Data
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete at least one assessment to view your skill insights.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => setTabValue(1)}
          >
            Start an Assessment
          </Button>
        </Paper>
      );
    }
    
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Your Skill Profile
        </Typography>
        
        <Grid container spacing={3}>
          {/* Skill category summary cards */}
          {Object.keys(skillScores).map(category => (
            <Grid item xs={12} md={4} key={category}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ mr: 1, bgcolor: 'primary.main' }}>
                      {getSkillCategoryIcon(category)}
                    </Avatar>
                    <Typography variant="h6">{category}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                      <CircularProgress
                        variant="determinate"
                        value={skillScores[category].average}
                        size={60}
                        thickness={5}
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
                        <Typography variant="caption" component="div" color="text.secondary">
                          {Math.round(skillScores[category].average)}%
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2">
                        Assessments taken: {skillScores[category].count}
                      </Typography>
                      <Typography variant="body2">
                        Skill level: {
                          skillScores[category].average >= 80 ? 'Expert' :
                          skillScores[category].average >= 60 ? 'Advanced' :
                          skillScores[category].average >= 40 ? 'Intermediate' : 'Beginner'
                        }
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small"
                    onClick={() => {
                      setTabValue(1);
                      // Scroll to specific category
                      setTimeout(() => {
                        const element = document.getElementById(`category-${category.toLowerCase()}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                  >
                    View Assessments
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        {/* Detailed assessment history */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Assessment History
        </Typography>
        
        {Object.keys(skillScores).length > 0 ? (
          Object.keys(skillScores).map(category => (
            <Accordion key={category} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ mr: 1, bgcolor: 'primary.main', width: 24, height: 24 }}>
                    {getSkillCategoryIcon(category)}
                  </Avatar>
                  <Typography variant="subtitle1">{category}</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {skillScores[category].assessments.map((assessment, index) => (
                    <ListItem key={`${assessment.id}-${index}`} divider>
                      <ListItemIcon>
                        <Assessment />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          assessmentsList.find(a => a.id === assessment.id)?.title || 
                          'Assessment'
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              Score: {assessment.score}/{assessment.maxScore} ({Math.round((assessment.score/assessment.maxScore) * 100)}%)
                            </Typography>
                            <Typography variant="caption" component="div" color="text.secondary">
                              Completed on {new Date(assessment.completedAt).toLocaleDateString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography color="text.secondary">
            No assessment history available
          </Typography>
        )}
        
        {/* Learning path recommendation */}
        {Object.keys(skillScores).length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Recommended Learning Path
            </Typography>
            <LearningPathGenerator
              timeframe="medium"
              targetSkills={Object.keys(skillScores)
                .filter(category => skillScores[category].average < 70)
                .slice(0, 3)}
            />
          </Box>
        )}
      </Paper>
    );
  };
  
  // Render career recommendations
  const renderCareerRecommendations = () => {
    if (careerRecommendations.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Career Recommendations
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete more skill assessments to receive personalized career recommendations.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => setTabValue(1)}
          >
            Take Assessments
          </Button>
        </Paper>
      );
    }
    
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Career Recommendations
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Based on your assessment results, we recommend these career paths that match your skills and interests.
        </Typography>
        
        <Grid container spacing={3}>
          {careerRecommendations.map(career => (
            <Grid item xs={12} md={6} key={career.title}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {career.title}
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    {career.description}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Key Skills Match:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {career.matchedSkills.map(skill => (
                      <Chip 
                        key={skill.name}
                        label={skill.name}
                        color={skill.match > 80 ? "success" : skill.match > 50 ? "primary" : "default"}
                        size="small"
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Skills to Develop:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {career.skillsToImprove.map(skill => (
                      <Chip 
                        key={skill}
                        label={skill}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                  
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>
                      Overall Match:
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={career.overallMatch}
                      sx={{ 
                        height: 8, 
                        borderRadius: 1,
                        flexGrow: 1
                      }}
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {career.overallMatch}%
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small"
                    onClick={() => navigate(`/learning-path?career=${encodeURIComponent(career.title)}`)}
                  >
                    View Learning Path
                  </Button>
                  
                  <Button 
                    size="small"
                    onClick={() => navigate(`/job-search?query=${encodeURIComponent(career.title)}`)}
                  >
                    Find Jobs
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };
  
  // Render certificates
  const renderCertificates = () => {
    // Filter completed assessments that have high scores (certificates)
    const certificateAssessments = completedAssessments.filter(
      assessment => (assessment.score / assessment.maxScore) >= 0.7
    );
    
    if (certificateAssessments.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Certificates Earned
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete assessments with a score of 70% or higher to earn certificates.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => setTabValue(1)}
          >
            Take Assessments
          </Button>
        </Paper>
      );
    }
    
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Your Certificates
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          These certificates validate your skills based on your assessment performance.
        </Typography>
        
        <Grid container spacing={3}>
          {certificateAssessments.map(cert => {
            const assessment = assessmentsList.find(a => a.id === cert.id);
            const title = assessment?.title || 'Skill Assessment';
            const score = Math.round((cert.score / cert.maxScore) * 100);
            
            return (
              <Grid item xs={12} md={6} lg={4} key={`${cert.id}-${cert.completedAt}`}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    position: 'relative',
                    overflow: 'visible',
                    borderColor: score >= 90 ? 'gold' : score >= 80 ? 'silver' : 'bronze',
                    borderWidth: 2,
                    '&:hover': {
                      boxShadow: 3
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute',
                      top: -15,
                      right: -15,
                      zIndex: 1
                    }}
                  >
                    <Avatar 
                      sx={{ 
                        bgcolor: score >= 90 ? 'gold' : score >= 80 ? 'silver' : 'bronze',
                        color: 'black'
                      }}
                    >
                      <WorkspacePremium />
                    </Avatar>
                  </Box>
                  
                  <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                      {title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {cert.skillCategory} Skills
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                      <Rating 
                        value={Math.min(5, Math.max(1, Math.round(score / 20)))}
                        readOnly
                        precision={0.5}
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {score}%
                      </Typography>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" display="block">
                      Awarded on {new Date(cert.completedAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small"
                      onClick={() => {
                        setSelectedCertificate({
                          ...cert,
                          title,
                          score
                        });
                        setCertificateDialogOpen(true);
                      }}
                    >
                      View Certificate
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    );
  };
  
  // Render personality and interests
  const renderPersonalityAndInterests = () => {
    if (!personalityType || interests.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Personality Assessment Not Completed
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete the personality assessment to learn about your career preferences.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => setTabValue(1)}
          >
            Take Assessment
          </Button>
        </Paper>
      );
    }
    
    return (
      <Box>
        {/* Personality Type Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Your Personality Type
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 2 }}>
            <Avatar
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
                mr: 3
              }}
            >
              {personalityType.code}
            </Avatar>
            
            <Box>
              <Typography variant="h6" gutterBottom>
                {personalityType.type}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {personalityType.description}
              </Typography>
              
              <Typography variant="subtitle2" gutterBottom>
                Suitable Career Paths:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {personalityType.suitableCareers.map(career => (
                  <Chip 
                    key={career}
                    label={career}
                    color="primary"
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>
        
        {/* Interests Section */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Your Interests
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Your interests indicate what types of activities you're drawn to and can help identify fulfilling career paths.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {/* Interests Chart */}
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Interest Areas
                </Typography>
                
                {interests.map(interest => (
                  <Box key={interest.category} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{interest.category}</Typography>
                      <Typography variant="body2">{interest.score}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={interest.score}
                      sx={{ 
                        height: 8, 
                        borderRadius: 1,
                        mb: 0.5
                      }}
                    />
                  </Box>
                ))}
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {/* Activities List */}
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Activities You Enjoy
                </Typography>
                
                <List dense>
                  {interests.slice(0, 3).flatMap(interest => 
                    interest.activities.map(activity => (
                      <ListItem key={activity}>
                        <ListItemIcon>
                          <CheckCircle color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={activity} 
                          secondary={interest.category}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              What This Means For Your Career
            </Typography>
            
            <Typography variant="body2">
              Your highest interests in Technology and Analysis suggest roles that combine technical expertise with problem-solving. 
              Consider positions that allow you to apply technical skills while analyzing data or systems to derive insights and solutions.
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  };
  
  // Render strengths and skills
  const renderStrengthsAndSkills = () => {
    if (strengths.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Strengths Assessment Not Completed
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete the strengths assessment to identify your key capabilities.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => setTabValue(1)}
          >
            Take Assessment
          </Button>
        </Paper>
      );
    }
    
    return (
      <Box>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Your Strengths & Skills
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Your natural strengths and developed skills form the foundation of your professional capabilities.
          </Typography>
          
          <Grid container spacing={3}>
            {strengths.map(strength => (
              <Grid item xs={12} md={6} key={strength.name}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6">
                      {strength.name}
                    </Typography>
                    <Rating 
                      value={strength.level} 
                      precision={0.5} 
                      readOnly 
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {strength.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Technical Skills
            </Typography>
            
            <Grid container spacing={2}>
              {Object.keys(skillScores).map(category => 
                skillScores[category].assessments.map(skill => (
                  <Grid item xs={6} md={3} key={skill.id}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        '&:hover': {
                          boxShadow: 1
                        }
                      }}
                    >
                      <Typography variant="body1" gutterBottom>
                        {assessmentsList.find(a => a.id === skill.id)?.title || 'Skill'}
                      </Typography>
                      
                      <CircularProgress
                        variant="determinate"
                        value={(skill.score / skill.maxScore) * 100}
                        size={60}
                        thickness={5}
                        sx={{ my: 1 }}
                      />
                      
                      <Typography variant="caption" color="text.secondary" display="block">
                        Proficiency: {Math.round((skill.score / skill.maxScore) * 100)}%
                      </Typography>
                    </Box>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Leverage Your Strengths
            </Typography>
            
            <Typography variant="body2">
              Your exceptional problem-solving and analytical thinking skills position you perfectly for roles that require deep analysis and technical expertise.
              Focus on career paths that emphasize these strengths while providing opportunities to develop your communication skills further.
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  };
  
  // Render values and goals
  const renderValuesAndGoals = () => {
    if (values.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Values Assessment Not Completed
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete the values assessment to understand what motivates you professionally.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => setTabValue(1)}
          >
            Take Assessment
          </Button>
        </Paper>
      );
    }
    
    return (
      <Box>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Your Values & Goals
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Understanding your core values helps identify careers that will be fulfilling and sustainable long-term.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Work Values
                </Typography>
                
                <List>
                  {values.map(value => (
                    <ListItem 
                      key={value.name}
                      secondaryAction={
                        <Chip 
                          icon={value.aligned ? <CheckCircle /> : <Info />}
                          label={value.aligned ? "Aligned" : "Opportunity"}
                          color={value.aligned ? "success" : "default"}
                          size="small"
                        />
                      }
                    >
                      <ListItemIcon>
                        <Rating 
                          value={value.importance} 
                          max={5}
                          readOnly
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText primary={value.name} />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Work Environment Preferences
                </Typography>
                
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Preferred Work Setting
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {['Remote-friendly', 'Flexible hours', 'Collaborative'].map(pref => (
                      <Chip 
                        key={pref}
                        label={pref}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Leadership Style
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {['Autonomous', 'Mentorship-oriented', 'Results-focused'].map(pref => (
                      <Chip 
                        key={pref}
                        label={pref}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Career Goals
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {['Technical mastery', 'Subject matter expert', 'Continuous learning'].map(pref => (
                      <Chip 
                        key={pref}
                        label={pref}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Values-Based Career Decisions
            </Typography>
            
            <Typography variant="body2">
              Your values emphasize knowledge seeking and innovation, suggesting roles that provide continuous learning opportunities and creative problem-solving.
              The lack of alignment in autonomy indicates you might benefit from positions with greater independence or decision-making authority.
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  };
  
  // Render gap analysis and career path
  const renderGapAnalysisAndPath = () => {
    if (!gapAnalysis.targetRole || !careerTimeline.length) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            Career Path Analysis Not Completed
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete the career assessments to see your personalized development path.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => setTabValue(1)}
          >
            Take Assessments
          </Button>
        </Paper>
      );
    }
    
    return (
      <Box>
        {/* Gap Analysis Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Skill Gap Analysis
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            Based on your assessments, here's what you need to develop to become a successful <strong>{gapAnalysis.targetRole}</strong>.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Your Current Skills
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {gapAnalysis.currentSkills.map(skill => (
                    <Chip 
                      key={skill}
                      label={skill}
                      color="success"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Skills to Develop
                </Typography>
                
                <List dense>
                  {gapAnalysis.missingSkills.map(skill => (
                    <ListItem key={skill.skill}>
                      <ListItemText 
                        primary={skill.skill}
                        secondary={
                          <>
                            <Typography variant="caption" component="span" color="text.secondary">
                              Priority: 
                            </Typography>
                            <Chip 
                              label={skill.priority}
                              color={skill.priority === "High" ? "error" : "warning"}
                              size="small"
                              sx={{ ml: 1, mr: 1 }}
                            />
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recommended Learning Resources
            </Typography>
            
            <Card variant="outlined">
              <List>
                {gapAnalysis.missingSkills.flatMap(skill => 
                  skill.resources.map((resource, idx) => (
                    <ListItem key={`${skill.skill}-${idx}`}>
                      <ListItemIcon>
                        <School color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={resource}
                        secondary={`For developing ${skill.skill}`}
                      />
                      <Button size="small" variant="outlined">
                        Explore
                      </Button>
                    </ListItem>
                  ))
                )}
              </List>
            </Card>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Estimated time to close skill gaps: <strong>{gapAnalysis.timeline}</strong>
            </Typography>
          </Box>
        </Paper>
        
        {/* Career Timeline */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Career Development Path
          </Typography>
          
          <Typography variant="body1" paragraph>
            Based on your skills, interests, and goals, here's a potential career progression:
          </Typography>
          
          <Stepper orientation="vertical" sx={{ mt: 3 }}>
            {careerTimeline.map((step, index) => (
              <Step key={step.role} active={index === 0} completed={index > 0 ? false : undefined}>
                <StepLabel>
                  <Typography variant="h6">{step.role}</Typography>
                  <Typography variant="caption">{step.timeframe}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" paragraph>
                    Key skills for this role:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {step.skills.map(skill => (
                      <Chip 
                        key={skill}
                        label={skill}
                        size="small"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                  
                  {index === 0 && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setTabValue(3)}
                      sx={{ mt: 1 }}
                    >
                      View Skills Assessment
                    </Button>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              UAE Vision 2030 Alignment
            </Typography>
            
            <Typography variant="body2">
              Your career path in {gapAnalysis.targetRole} aligns well with UAE's vision for building a knowledge-based economy and positioning as a global leader in artificial intelligence and digital transformation.
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
              {['Digital Economy', 'Innovation Hub', 'Knowledge Transfer'].map(area => (
                <Chip 
                  key={area}
                  label={area}
                  variant="outlined"
                  size="small"
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  };
  
  // Handle career prediction completion
  const handleCareerPredictionComplete = (results) => {
    console.log("Career prediction results received:", results);
    
    setCareerPredictionResults(results);
    setShowCareerPrediction(true);
    
    // Update other tabs with the prediction results
    setPersonalityType({
      type: results.personalityType,
      description: results.explanation,
      suitableCareers: results.recommendedCareers?.map(career => career.title) || []
    });
    
    // Format interests from prediction
    const interestEntries = Object.entries(results.interests || {})
      .map(([category, score]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        score: score,
        activities: [] // We don't have detailed activities from the prediction
      }))
      .sort((a, b) => b.score - a.score);
    
    setInterests(interestEntries);
    
    // Format strengths from prediction skills
    const strengthEntries = Object.entries(results.skills || {})
      .map(([name, level]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        level: level,
        description: `Your assessment indicates proficiency in ${name}`
      }))
      .sort((a, b) => b.level - a.level);
    
    setStrengths(strengthEntries);
    
    // Format values from prediction
    const valueEntries = Object.entries(results.values || {})
      .map(([name, importance]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        importance: Math.min(5, Math.max(1, Math.round(importance / 20))), // Convert to 1-5 scale
        aligned: importance > 60 // Consider values above 60% aligned with career
      }))
      .sort((a, b) => b.importance - a.importance);
    
    setValues(valueEntries);
    
    // Format gap analysis from prediction skill gaps
    if (results.skillGaps && results.skillGaps.length > 0) {
      const targetRole = results.recommendedCareers?.[0]?.title || "Your Ideal Role";
      
      setGapAnalysis({
        currentSkills: Object.keys(results.skills || {})
          .filter(skill => results.skills[skill] >= 4)
          .map(skill => skill.charAt(0).toUpperCase() + skill.slice(1)),
        targetRole: targetRole,
        missingSkills: results.skillGaps.map(gap => ({
          skill: gap.skill,
          priority: gap.importance,
          resources: gap.resources || []
        })),
        timeline: "6-12 months"
      });
    }
    
    // Format career recommendations
    setCareerRecommendations(results.recommendedCareers || []);
    
    // Save all data to localStorage with the requested keys
    localStorage.setItem("tamkeenCareerAssessment", JSON.stringify(results));
    localStorage.setItem("tamkeenPersonality", JSON.stringify({
      type: results.personalityType,
      explanation: results.explanation
    }));
    localStorage.setItem("tamkeenInterests", JSON.stringify(interestEntries));
    localStorage.setItem("tamkeenSkills", JSON.stringify({
      current: results.skills,
      gaps: results.skillGaps
    }));
    localStorage.setItem("tamkeenCareerMatch", JSON.stringify(results.recommendedCareers));
    localStorage.setItem("tamkeenValues", JSON.stringify(valueEntries));
    
    // Set the URL to indicate completion
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('assessment', 'complete');
    window.history.pushState({}, '', currentUrl);
    
    // Navigate to Career Recommendations tab
    setTabValue(5);
  };
  
  // Add this new function to render career prediction assessment
  const renderCareerPrediction = () => {
    return (
      <Box>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          AI-Powered Career Prediction
        </Typography>
        
        <Typography variant="body1" paragraph>
          Our advanced career assessment combines behavioral signals and cognitive traits with 
          LLM-powered reasoning to provide highly personalized career recommendations.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
          <Chip icon={<Psychology />} label="Personality Traits" color="primary" />
          <Chip icon={<Favorite />} label="Interests & Preferences" color="primary" />
          <Chip icon={<Star />} label="Work Values" color="primary" />
          <Chip icon={<Assessment />} label="Skills Analysis" color="primary" />
          <Chip icon={<BarChart />} label="AI-Powered Matching" color="primary" />
        </Box>
        
        {showCareerPrediction ? (
          <CareerPrediction 
            onComplete={handleCareerPredictionComplete}
          />
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Discover Your Ideal Career Path
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              Take our comprehensive assessment to receive personalized career recommendations based on 
              your unique combination of personality traits, interests, values, and skills.
            </Typography>
            
            <Button 
              variant="contained" 
              size="large"
              onClick={() => setShowCareerPrediction(true)}
              startIcon={<Assessment />}
            >
              Start Career Assessment
            </Button>
          </Paper>
        )}
      </Box>
    );
  };
  
  // Render tabs content based on active tab
  const renderContent = () => {
    try {
      switch (tabValue) {
        case 0:
          return renderActiveAssessment();
        case 1:
          return renderAssessmentCards();
        case 2:
          return <CareerPrediction onComplete={handleCareerPredictionComplete} />;
        case 3:
          return renderPersonalityAndInterests();
        case 4:
          return renderStrengthsAndSkills();
        case 5:
          return (
            <CareerRecommendations 
              recommendedCareers={careerRecommendations} 
            />
          );
        case 6:
          return renderValuesAndGoals();
        case 7:
          return renderGapAnalysisAndPath();
        case 8:
          return renderCertificates();
        default:
          return (
            <Box p={3}>
              <Typography variant="h5">Tab content not available</Typography>
            </Box>
          );
      }
    } catch (err) {
      console.error('Error rendering tab content:', err);
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Couldn't load this tab
          </Typography>
          <Typography variant="body1" paragraph>
            There was an error loading this content. Please try another tab.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setTabValue(1)}
          >
            Go to Available Assessments
          </Button>
        </Paper>
      );
    }
  };
  
  if (loading && !assessmentActive) {
    return <LoadingSpinner message="Loading assessment data..." />;
  }
  
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Career Assessment
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Assignment />} label="Active Assessment" disabled={!assessmentActive} />
          <Tab icon={<Work />} label="Available Assessments" />
          <Tab icon={<FlightIcon />} label="Career Prediction" />
          <Tab icon={<Psychology />} label="Personality & Interests" />
          <Tab icon={<Star />} label="Strengths & Skills" />
          <Tab icon={<Favorite />} label="Values & Goals" />
          <Tab icon={<Work />} label="Career Recommendations" />
          <Tab icon={<Timeline />} label="Gap Analysis & Path" />
          <Tab icon={<WorkspacePremium />} label="Certificates" />
        </Tabs>
      </Paper>
      
      {resultsLoading ? (
        <LoadingSpinner message="Processing assessment results..." />
      ) : (
        renderContent()
      )}
      
      {/* Certificate Dialog */}
      <Dialog 
        open={certificateDialogOpen}
        onClose={() => setCertificateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Certificate of Achievement
        </DialogTitle>
        <DialogContent>
          {selectedCertificate && (
            <Box sx={{ p: 3, border: '10px solid #f5f5f5', textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom>
                Certificate of Achievement
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                This certifies that
              </Typography>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', my: 3 }}>
                {profile.firstName} {profile.lastName}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                has successfully completed
              </Typography>
              
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', my: 3 }}>
                {selectedCertificate.title}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                with a score of {selectedCertificate.score}%
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(selectedCertificate.completedAt).toLocaleDateString()}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Certificate ID: {selectedCertificate.id.slice(0, 8)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertificateDialogOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained"
            onClick={() => {
              // Print or download certificate
              window.print();
            }}
          >
            Print Certificate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
