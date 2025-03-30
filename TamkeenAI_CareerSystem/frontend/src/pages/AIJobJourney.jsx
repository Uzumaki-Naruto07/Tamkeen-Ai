import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, Stepper,
  Step, StepLabel, StepContent, Divider, CircularProgress,
  Grid, Card, CardContent, CardActions, IconButton,
  Timeline, TimelineItem, TimelineSeparator, TimelineDot,
  TimelineConnector, TimelineContent, TimelineOppositeContent,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, Tooltip, Chip, List, ListItem, ListItemIcon,
  ListItemText, Zoom, Grow, Slide, Avatar, Badge
} from '@mui/material';
import {
  Work, School, Engineering, Description, 
  Person, Email, Check, Close, Replay, PlayArrow,
  Pause, FastForward, Timeline as TimelineIcon,
  Psychology, MenuBook, Group, Settings, Star,
  Insights, ArrowForward, CheckCircle, Info,
  QuestionAnswer, SentimentSatisfied, Lightbulb,
  EmojiEvents, Visibility, VisibilityOff, AssignmentTurnedIn,
  LocalOffer, TipsAndUpdates, Flag, Business,
  CloudUpload, MeetingRoom, PersonSearch, BubbleChart
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser, useResume } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import confetti from 'canvas-confetti';

const AIJobJourney = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [journeyStarted, setJourneyStarted] = useState(false);
  const [journeyComplete, setJourneyComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [simulationStats, setSimulationStats] = useState({
    applications: 0,
    interviews: 0,
    offers: 0,
    rejections: 0,
    networkingEvents: 0,
    skillsLearned: 0
  });
  const [jobScenario, setJobScenario] = useState(null);
  const [decisionDialog, setDecisionDialog] = useState(false);
  const [decisionOptions, setDecisionOptions] = useState([]);
  const [jobOfferDialog, setJobOfferDialog] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [insightDialog, setInsightDialog] = useState(false);
  const [currentInsight, setCurrentInsight] = useState(null);
  const [userChoices, setUserChoices] = useState([]);
  const [logEntries, setLogEntries] = useState([]);
  
  const confettiRef = useRef(null);
  const timerRef = useRef(null);
  
  const navigate = useNavigate();
  const { profile } = useUser();
  const { resumes } = useResume();
  
  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Fetch job scenario
  useEffect(() => {
    const fetchJobScenario = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Get user's preferences and skills to personalize the journey
        const skillsResponse = await apiEndpoints.skills.getUserSkills(profile.id);
        const userSkills = skillsResponse.data || {};
        
        // Create a personalized job scenario
        const scenarioResponse = await apiEndpoints.career.createJobScenario({
          userId: profile.id,
          skills: userSkills,
          preferredIndustry: profile.preferredIndustry || 'Technology',
          experience: profile.yearsExperience || 0,
          education: profile.highestEducation || 'Bachelor'
        });
        
        setJobScenario(scenarioResponse.data);
      } catch (err) {
        setError('Failed to create job scenario');
        console.error('Error creating job scenario:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobScenario();
  }, [profile]);
  
  // Start the journey simulation
  const startJourney = () => {
    if (!jobScenario) return;
    
    setJourneyStarted(true);
    setActiveStep(0);
    setProgressPercent(0);
    setIsPaused(false);
    
    // Initialize timeline with first event
    const initialTimeline = jobScenario.timeline || [];
    setTimeline(initialTimeline);
    
    if (initialTimeline.length > 0) {
      setCurrentEvent(initialTimeline[0]);
      processEvent(initialTimeline[0]);
    }
    
    // Start the simulation loop
    advanceSimulation();
  };
  
  // Process the current event
  const processEvent = (event) => {
    // Update stats based on event type
    setSimulationStats(prev => {
      const newStats = { ...prev };
      
      switch (event.type) {
        case 'application':
          newStats.applications += 1;
          break;
        case 'interview':
          newStats.interviews += 1;
          break;
        case 'offer':
          newStats.offers += 1;
          break;
        case 'rejection':
          newStats.rejections += 1;
          break;
        case 'networking':
          newStats.networkingEvents += 1;
          break;
        case 'learning':
          newStats.skillsLearned += 1;
          break;
        default:
          break;
      }
      
      return newStats;
    });
    
    // Add to log
    setLogEntries(prev => [
      ...prev, 
      {
        id: Date.now(),
        timestamp: new Date(),
        event: event,
        step: activeStep
      }
    ]);
    
    // Handle events that require user decisions
    if (event.requiresDecision) {
      setDecisionOptions(event.options || []);
      setDecisionDialog(true);
      setIsPaused(true);
    }
    
    // Handle job offers
    if (event.type === 'offer') {
      setCurrentOffer(event.details);
      setJobOfferDialog(true);
      setIsPaused(true);
      
      // Trigger confetti for job offers
      if (confettiRef.current) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
    
    // Show insights for certain events
    if (event.insight) {
      setCurrentInsight(event.insight);
      setInsightDialog(true);
    }
  };
  
  // Advance the simulation to the next step
  const advanceSimulation = () => {
    if (isPaused || activeStep >= timeline.length - 1) {
      return;
    }
    
    // Calculate delay based on speed setting
    const baseDelay = 3000; // 3 seconds
    const delay = baseDelay / speed;
    
    timerRef.current = setTimeout(() => {
      const nextStep = activeStep + 1;
      
      if (nextStep < timeline.length) {
        setActiveStep(nextStep);
        setCurrentEvent(timeline[nextStep]);
        setProgressPercent(Math.floor((nextStep / (timeline.length - 1)) * 100));
        
        processEvent(timeline[nextStep]);
        
        // Continue simulation if not at the end and not paused
        if (nextStep < timeline.length - 1 && !isPaused) {
          advanceSimulation();
        } else if (nextStep === timeline.length - 1) {
          setJourneyComplete(true);
          
          // Trigger confetti for completion
          if (confettiRef.current) {
            confetti({
              particleCount: 200,
              spread: 160,
              origin: { y: 0.6 }
            });
          }
        }
      }
    }, delay);
  };
  
  // Pause or resume the simulation
  const togglePause = () => {
    setIsPaused(prev => !prev);
    
    if (isPaused) {
      // Resume the simulation
      advanceSimulation();
    }
  };
  
  // Change the simulation speed
  const changeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
  };
  
  // Handle user decision
  const handleDecision = (option) => {
    setDecisionDialog(false);
    
    // Record user choice
    setUserChoices(prev => [
      ...prev,
      {
        step: activeStep,
        event: currentEvent,
        choice: option
      }
    ]);
    
    // Process consequences of the decision
    if (option.consequences) {
      // Update the timeline based on the decision
      const updatedTimeline = [...timeline];
      
      // Add new events or replace existing ones
      if (option.consequences.addEvents) {
        const insertPosition = activeStep + 1;
        updatedTimeline.splice(insertPosition, 0, ...option.consequences.addEvents);
      }
      
      if (option.consequences.removeEvents) {
        const removeCount = option.consequences.removeEvents;
        if (removeCount > 0 && activeStep + 1 < updatedTimeline.length) {
          updatedTimeline.splice(activeStep + 1, removeCount);
        }
      }
      
      setTimeline(updatedTimeline);
    }
    
    // Resume the simulation
    setIsPaused(false);
    advanceSimulation();
  };
  
  // Handle job offer response
  const handleJobOffer = (accepted) => {
    setJobOfferDialog(false);
    
    // Record user choice
    setUserChoices(prev => [
      ...prev,
      {
        step: activeStep,
        event: currentEvent,
        choice: accepted ? 'accept' : 'decline'
      }
    ]);
    
    if (accepted) {
      // End the simulation if job accepted
      setJourneyComplete(true);
      
      // Trigger confetti for job acceptance
      if (confettiRef.current) {
        confetti({
          particleCount: 200,
          spread: 160,
          origin: { y: 0.6 }
        });
      }
    } else {
      // Resume the simulation
      setIsPaused(false);
      advanceSimulation();
    }
  };
  
  // Reset the simulation
  const resetJourney = () => {
    setJourneyStarted(false);
    setJourneyComplete(false);
    setActiveStep(0);
    setProgressPercent(0);
    setIsPaused(false);
    setCurrentEvent(null);
    setUserChoices([]);
    setLogEntries([]);
    setSimulationStats({
      applications: 0,
      interviews: 0,
      offers: 0,
      rejections: 0,
      networkingEvents: 0,
      skillsLearned: 0
    });
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };
  
  // Render the current event card
  const renderEventCard = () => {
    if (!currentEvent) return null;
    
    let icon;
    let color;
    
    switch (currentEvent.type) {
      case 'application':
        icon = <Description />;
        color = 'primary.main';
        break;
      case 'interview':
        icon = <QuestionAnswer />;
        color = 'info.main';
        break;
      case 'offer':
        icon = <EmojiEvents />;
        color = 'success.main';
        break;
      case 'rejection':
        icon = <Close />;
        color = 'error.main';
        break;
      case 'networking':
        icon = <Group />;
        color = 'secondary.main';
        break;
      case 'learning':
        icon = <MenuBook />;
        color = 'warning.main';
        break;
      default:
        icon = <Info />;
        color = 'text.primary';
    }

    return (
      <Box 
        sx={{ 
          bgcolor: 'background.paper', 
          p: 3, 
          borderRadius: 1, 
          boxShadow: 1,
          position: 'relative' 
        }}
      >
        <Typography variant="h6" gutterBottom>
          {currentEvent.title}
        </Typography>
        
        <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
          <Tooltip title={currentEvent.type.charAt(0).toUpperCase() + currentEvent.type.slice(1)}>
            <IconButton 
              size="small"
              color={color}
            >
              {icon}
            </IconButton>
          </Tooltip>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          {currentEvent.description}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      {/* Timeline visualization */}
      <Box sx={{ mt: 4, mb: 6 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Job Search Timeline
            </Typography>
            
            <Box>
              <Tooltip title="Speed x0.5">
                <IconButton 
                  onClick={() => changeSpeed(0.5)}
                  disabled={!journeyStarted || journeyComplete}
                  color={speed === 0.5 ? 'primary' : 'default'}
                >
                  <Replay fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={isPaused ? 'Resume' : 'Pause'}>
                <IconButton 
                  onClick={togglePause}
                  disabled={!journeyStarted || journeyComplete}
                  color={isPaused ? 'warning' : 'default'}
                >
                  {isPaused ? <PlayArrow /> : <Pause />}
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Speed x2">
                <IconButton 
                  onClick={() => changeSpeed(2)}
                  disabled={!journeyStarted || journeyComplete}
                  color={speed === 2 ? 'primary' : 'default'}
                >
                  <FastForward fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={progressPercent} 
            sx={{ height: 10, borderRadius: 5, mb: 3 }}
          />
          
          <Box sx={{ mb: 4 }}>
            {renderEventCard()}
          </Box>
          
          <Timeline position="alternate">
            {timeline.map((event, index) => (
              <TimelineItem key={index}>
                <TimelineOppositeContent color="text.secondary">
                  {event.date}
                </TimelineOppositeContent>
                
                <TimelineSeparator>
                  <TimelineDot color={
                    index === activeStep ? 'primary' :
                    index < activeStep ? 'success' : 'grey'
                  }>
                    {getEventIcon(event.type)}
                  </TimelineDot>
                  
                  {index < timeline.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                
                <TimelineContent>
                  <Typography 
                    variant="body1" 
                    component="span" 
                    fontWeight={index === activeStep ? 'bold' : 'normal'}
                  >
                    {event.title}
                  </Typography>
                  {index === activeStep && (
                    <Typography variant="body2" color="text.secondary">
                      {event.description}
                    </Typography>
                  )}
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Paper>
      </Box>
      
      {/* Decision Dialog */}
      <Dialog
        open={decisionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Decision Point: {currentEvent?.title}
        </DialogTitle>
        
        <DialogContent dividers>
          <Typography paragraph>
            {currentEvent?.description}
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>
            What would you like to do?
          </Typography>
          
          <List>
            {decisionOptions.map((option, index) => (
              <ListItem 
                button 
                key={index}
                onClick={() => handleDecision(option)}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemIcon>
                  {getDecisionIcon(option.type)}
                </ListItemIcon>
                
                <ListItemText 
                  primary={option.text} 
                  secondary={option.hint}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
      
      {/* Job Offer Dialog */}
      <Dialog
        open={jobOfferDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
          Congratulations! Job Offer Received
        </DialogTitle>
        
        <DialogContent dividers>
          <Box ref={confettiRef} sx={{ position: 'relative' }}>
            <Typography variant="h6" gutterBottom align="center">
              {currentOffer?.company}
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom align="center">
              {currentOffer?.position}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Chip 
                icon={<LocalOffer />} 
                label={`$${currentOffer?.salary.toLocaleString()}/year`}
                color="primary"
                sx={{ mr: 1 }}
              />
              
              <Chip 
                icon={<LocationOn />} 
                label={currentOffer?.location}
              />
            </Box>
            
            <Typography paragraph>
              {currentOffer?.description}
            </Typography>
            
            <Typography variant="subtitle1" gutterBottom>
              Benefits:
            </Typography>
            
            <List dense>
              {currentOffer?.benefits.map((benefit, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircle color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={benefit} />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => handleJobOffer(false)}
            color="inherit"
          >
            Decline Offer
          </Button>
          
          <Button 
            variant="contained" 
            color="success"
            onClick={() => handleJobOffer(true)}
          >
            Accept Offer
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Insight Dialog */}
      <Dialog
        open={insightDialog}
        onClose={() => setInsightDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Lightbulb color="warning" />
            Career Insight
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Typography paragraph>
            {currentInsight?.content}
          </Typography>
          
          <Typography variant="subtitle2" color="text.secondary">
            Pro Tip:
          </Typography>
          
          <Typography variant="body2" paragraph>
            {currentInsight?.tip}
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setInsightDialog(false)}>
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AIJobJourney; 