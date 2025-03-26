import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Tabs, Tab, Button,
  Grid, Card, CardContent, CardActions,
  Divider, Chip, Avatar, List, ListItem,
  ListItemText, ListItemIcon, LinearProgress,
  Alert, CircularProgress, Accordion, AccordionSummary,
  AccordionDetails, Badge, Dialog, DialogTitle,
  DialogContent, DialogActions, Rating
} from '@mui/material';
import {
  School, Work, Psychology, TrendingUp, Assessment,
  Timeline, CheckCircle, Schedule, ExpandMore,
  BarChart, Star, Insights, Favorite, WorkspacePremium,
  Code, Business, SportsEsports, Language
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import SkillAssessment from '../components/SkillAssessment';
import LearningPathGenerator from '../components/LearningPathGenerator';
import LoadingSpinner from '../components/LoadingSpinner';

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
  
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Fetch available assessments and user's completed assessments
  useEffect(() => {
    const fetchAssessmentData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch available assessments
        const assessmentsResponse = await apiEndpoints.skills.getAvailableAssessments();
        setAssessmentsList(assessmentsResponse.data.assessments || []);
        setAvailableSkillGroups(assessmentsResponse.data.skillGroups || []);
        
        // Fetch user's completed assessments
        const completedResponse = await apiEndpoints.skills.getUserAssessments(profile.id);
        setCompletedAssessments(completedResponse.data);
        
        // Calculate skill scores based on completed assessments
        const scores = {};
        completedResponse.data.forEach(assessment => {
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
          const assessment = assessmentsResponse.data.assessments.find(a => a.id === assessmentId);
          if (assessment) {
            setCurrentAssessment(assessment);
            setActiveSkillCategory(assessment.skillCategory);
            setAssessmentActive(true);
            setTabValue(0); // Switch to assessment tab
          }
        }
        
        // Fetch career recommendations based on assessments
        if (completedResponse.data.length > 0) {
          try {
            const recommendationsResponse = await apiEndpoints.career.getCareerRecommendations({
              userId: profile.id,
              assessmentResults: completedResponse.data
            });
            
            setCareerRecommendations(recommendationsResponse.data);
          } catch (err) {
            console.error('Error fetching career recommendations:', err);
          }
        }
      } catch (err) {
        setError('Failed to load assessment data');
        console.error('Error fetching assessment data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessmentData();
  }, [profile, assessmentId]);
  
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
    // Refresh completed assessments list
    const fetchUpdatedAssessments = async () => {
      setResultsLoading(true);
      try {
        const completedResponse = await apiEndpoints.skills.getUserAssessments(profile.id);
        setCompletedAssessments(completedResponse.data);
        
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
            userId: profile.id,
            assessmentResults: completedResponse.data
          });
          
          setCareerRecommendations(recommendationsResponse.data);
        } catch (err) {
          console.error('Error fetching career recommendations:', err);
        }
      } catch (err) {
        console.error('Error updating assessment data:', err);
      } finally {
        setResultsLoading(false);
        setAssessmentActive(false);
        setCurrentAssessment(null);
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
          <Tab icon={<Assessment />} label="Active Assessment" disabled={!assessmentActive} />
          <Tab icon={<Work />} label="Available Assessments" />
          <Tab icon={<Insights />} label="Skill Insights" />
          <Tab icon={<TrendingUp />} label="Career Recommendations" />
          <Tab icon={<WorkspacePremium />} label="Certificates" />
        </Tabs>
      </Paper>
      
      {resultsLoading ? (
        <LoadingSpinner message="Processing assessment results..." />
      ) : (
        <>
          {tabValue === 0 && renderActiveAssessment()}
          {tabValue === 1 && renderAssessmentCards()}
          {tabValue === 2 && renderSkillInsights()}
          {tabValue === 3 && renderCareerRecommendations()}
          {tabValue === 4 && renderCertificates()}
        </>
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

export default CareerAssessmentPage;
