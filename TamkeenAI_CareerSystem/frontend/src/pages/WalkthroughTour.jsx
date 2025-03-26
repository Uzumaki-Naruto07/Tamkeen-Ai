import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, Stepper, Step, StepLabel, StepContent,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Grid, Card, CardContent, CardMedia, Divider, useMediaQuery,
  MobileStepper, Tooltip, Zoom, Fade, CircularProgress, Badge,
  Backdrop, Chip, Avatar, List, ListItem, ListItemText, ListItemIcon,
  FormControl, FormControlLabel, Switch, Collapse, Alert
} from '@mui/material';
import {
  Close, ArrowBack, ArrowForward, CheckCircle, Help, Settings,
  Celebration, LightbulbOutlined, PlayArrow, VideoLibrary, Work,
  Assessment, School, Psychology, Group, Dashboard, Assignment,
  Computer, CloudUpload, Search, Timeline, ShowChart, Star,
  KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowDown,
  TouchApp, SkipNext, Refresh, Flare, PersonAdd, Done, Speed
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import { useTheme } from '@mui/material/styles';
import Joyride, { STATUS } from 'react-joyride';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

const WalkthroughTour = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [tourStarted, setTourStarted] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);
  const [runJoyride, setRunJoyride] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState('jobseeker'); // 'jobseeker', 'student', 'career-changer', 'professional'
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [skipDialogOpen, setSkipDialogOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    showTutorials: true,
    enableNotifications: true,
    collectUsageData: true
  });
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [showDetailedTour, setShowDetailedTour] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [recommendedActions, setRecommendedActions] = useState([]);
  const [completedSteps, setCompletedSteps] = useState({});
  const [error, setError] = useState(null);

  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, updateProfile } = useUser();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  
  // Define the tour steps for each part of the application
  const tourSteps = {
    dashboard: [
      {
        target: '.dashboard-header',
        content: 'Welcome to your personal career dashboard. This is your command center for all career activities.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '.profile-section',
        content: 'Your profile shows your current career status and completion level. Keep it updated for better recommendations.',
        placement: 'right',
      },
      {
        target: '.resume-section',
        content: 'Track and manage all your resume versions. Our AI will help you optimize each one for specific jobs.',
        placement: 'bottom',
      },
      {
        target: '.job-section',
        content: 'View saved jobs and get personalized job recommendations based on your skills and preferences.',
        placement: 'left',
      },
      {
        target: '.analytics-section',
        content: 'Get insights into your application performance and see how your skills match up to market demands.',
        placement: 'top',
      }
    ],
    resume: [
      {
        target: '.resume-builder-header',
        content: 'Build ATS-optimized resumes with our AI assistant. Each resume is scored and improved in real-time.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '.template-selection',
        content: 'Choose from industry-specific templates optimized for your target roles.',
        placement: 'right',
      },
      {
        target: '.content-editor',
        content: 'Our smart editor highlights potential improvements and suggests better wording.',
        placement: 'left',
      },
      {
        target: '.ats-score',
        content: 'Track your ATS compatibility score. Aim for 80+ to maximize your chances of getting past automated screeners.',
        placement: 'left',
      },
      {
        target: '.keyword-matcher',
        content: 'See which important keywords from the job description are present or missing in your resume.',
        placement: 'bottom',
      }
    ],
    interview: [
      {
        target: '.interview-coach-header',
        content: 'Practice interviews with our AI coach. Get feedback on your answers, tone, and delivery.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '.question-bank',
        content: 'Browse through common interview questions for your specific industry and role.',
        placement: 'right',
      },
      {
        target: '.practice-session',
        content: 'Start a mock interview session. You can use your microphone or type your answers.',
        placement: 'top',
      },
      {
        target: '.feedback-section',
        content: 'Receive detailed feedback on content, delivery, and confidence. Our AI highlights areas to improve.',
        placement: 'left',
      },
      {
        target: '.recording-review',
        content: 'Review recordings of your practice sessions to track your improvement over time.',
        placement: 'bottom',
      }
    ],
    networking: [
      {
        target: '.networking-header',
        content: 'Build and manage your professional network more effectively with our networking tools.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '.connection-tracker',
        content: 'Keep track of your professional connections and set reminders for follow-ups.',
        placement: 'right',
      },
      {
        target: '.message-templates',
        content: 'Use our AI-generated message templates to craft effective outreach messages.',
        placement: 'top',
      },
      {
        target: '.opportunity-map',
        content: 'Visualize your network and identify potential opportunities through your connections.',
        placement: 'left',
      },
      {
        target: '.event-finder',
        content: 'Discover networking events and career fairs relevant to your industry and location.',
        placement: 'bottom',
      }
    ],
    skills: [
      {
        target: '.skills-dashboard-header',
        content: 'Analyze your skills portfolio and identify areas for development.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '.skill-gap-analysis',
        content: 'See how your current skills compare to requirements for your target roles.',
        placement: 'right',
      },
      {
        target: '.learning-paths',
        content: 'Follow personalized learning paths to build the skills you need for career advancement.',
        placement: 'top',
      },
      {
        target: '.skill-verification',
        content: 'Verify your skills through assessments and add credentials to your profile.',
        placement: 'left',
      },
      {
        target: '.market-demand',
        content: 'Track the market demand for different skills in your industry and region.',
        placement: 'bottom',
      }
    ]
  };

  // Welcome steps to determine user profile and preferences
  const welcomeSteps = [
    {
      title: "Welcome to TamkeenAI",
      description: "Your AI-powered career development platform. Let's set up your experience in a few simple steps.",
      image: "/images/onboarding/welcome.png"
    },
    {
      title: "Tell Us About Yourself",
      description: "Help us personalize your experience by selecting your current situation:",
      options: [
        { id: 'jobseeker', label: 'Active Job Seeker', icon: <Work /> },
        { id: 'student', label: 'Student/Recent Graduate', icon: <School /> },
        { id: 'career-changer', label: 'Career Changer', icon: <Timeline /> },
        { id: 'professional', label: 'Employed Professional', icon: <Assignment /> }
      ],
      image: "/images/onboarding/user-types.png"
    },
    {
      title: "Select Features to Explore",
      description: "Which features are you most interested in learning about?",
      options: [
        { id: 'resume', label: 'Resume Builder', icon: <Assignment /> },
        { id: 'interview', label: 'Interview Coach', icon: <Psychology /> },
        { id: 'networking', label: 'Networking Assistant', icon: <Group /> },
        { id: 'skills', label: 'Skills Development', icon: <School /> },
        { id: 'jobs', label: 'Job Matching', icon: <Work /> },
        { id: 'analytics', label: 'Career Analytics', icon: <Assessment /> }
      ],
      multiSelect: true,
      image: "/images/onboarding/features.png"
    },
    {
      title: "Tour Preferences",
      description: "Customize your onboarding experience:",
      preferences: true,
      image: "/images/onboarding/preferences.png"
    },
    {
      title: "You're All Set!",
      description: "We've customized your tour based on your preferences. Click 'Start Tour' to begin exploring TamkeenAI.",
      image: "/images/onboarding/ready.png"
    }
  ];

  // Initialize based on user data
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        // Try to load saved tour state
        const savedProgress = localStorage.getItem('tourProgress');
        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress);
          setActiveStep(parsedProgress.step || 0);
          setCompletedSteps(parsedProgress.completedSteps || {});
          setUserType(parsedProgress.userType || 'jobseeker');
          setSelectedFeatures(parsedProgress.selectedFeatures || []);
        }
        
        // Check if user has completed tour before
        if (profile?.hasCompletedTour) {
          setTourCompleted(true);
          setWelcomeOpen(false);
        }
        
        // Generate recommended actions based on user type
        generateRecommendedActions();
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing tour:', error);
        setError('Failed to load tour data. Please try refreshing the page.');
        setLoading(false);
      }
    };
    
    initialize();
  }, [profile]);
  
  // Save progress when steps change
  useEffect(() => {
    if (tourStarted && !tourCompleted) {
      const tourProgress = {
        step: activeStep,
        completedSteps,
        userType,
        selectedFeatures
      };
      localStorage.setItem('tourProgress', JSON.stringify(tourProgress));
    }
  }, [activeStep, completedSteps, tourStarted, tourCompleted]);
  
  // Generate recommended actions based on user type and selected features
  const generateRecommendedActions = () => {
    const actions = [];
    
    if (userType === 'jobseeker') {
      actions.push(
        { title: 'Build Your Resume', path: '/resume-builder', icon: <Assignment /> },
        { title: 'Explore Job Matches', path: '/job-search', icon: <Work /> }
      );
    } else if (userType === 'student') {
      actions.push(
        { title: 'Skill Assessment', path: '/skill-assessment', icon: <School /> },
        { title: 'Entry-Level Resume', path: '/resume-builder?template=graduate', icon: <Assignment /> }
      );
    } else if (userType === 'career-changer') {
      actions.push(
        { title: 'Transferable Skills Analysis', path: '/skills/transferable', icon: <CompareArrows /> },
        { title: 'Career Path Explorer', path: '/career-paths', icon: <Timeline /> }
      );
    } else if (userType === 'professional') {
      actions.push(
        { title: 'Professional Network', path: '/networking', icon: <Group /> },
        { title: 'Skill Development', path: '/skills/development', icon: <ShowChart /> }
      );
    }
    
    // Add common actions
    actions.push(
      { title: 'Complete Your Profile', path: '/profile', icon: <PersonAdd /> },
      { title: 'Set Career Goals', path: '/goals', icon: <Flag /> }
    );
    
    setRecommendedActions(actions);
  };
  
  // Handle Joyride callbacks
  const handleJoyrideCallback = (data) => {
    const { status, index, type } = data;
    
    if (type === 'step:after') {
      // Update progress
      const newCompletedSteps = { ...completedSteps };
      const currentFeature = selectedFeatures[activeStep] || 'dashboard';
      newCompletedSteps[currentFeature] = (newCompletedSteps[currentFeature] || 0) + 1;
      setCompletedSteps(newCompletedSteps);
    }
    
    // Tour has been completed or skipped
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunJoyride(false);
      
      // Move to next feature if available
      if (activeStep < selectedFeatures.length - 1) {
        setActiveStep(activeStep + 1);
        setTimeout(() => {
          setRunJoyride(true);
        }, 500);
      } else {
        handleTourComplete();
      }
    }
  };
  
  // Handle completing the entire tour
  const handleTourComplete = async () => {
    setTourCompleted(true);
    setShowConfetti(true);
    setCompletionOpen(true);
    
    // Remove saved progress
    localStorage.removeItem('tourProgress');
    
    // Update user profile to indicate tour completion
    if (profile?.id) {
      try {
        await apiEndpoints.updateUserProfile(profile.id, {
          hasCompletedTour: true
        });
        updateProfile({ ...profile, hasCompletedTour: true });
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
    
    // Hide confetti after a few seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };
  
  // Handle welcome dialog steps
  const handleWelcomeNext = () => {
    if (activeStep < welcomeSteps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      setWelcomeOpen(false);
      setTourStarted(true);
      
      // Default to dashboard if no features selected
      if (selectedFeatures.length === 0) {
        setSelectedFeatures(['dashboard']);
      }
      
      setTimeout(() => {
        setRunJoyride(true);
      }, 1000);
    }
  };
  
  const handleWelcomeBack = () => {
    setActiveStep(Math.max(0, activeStep - 1));
  };
  
  const handleSkipTour = () => {
    setSkipDialogOpen(true);
  };
  
  const confirmSkipTour = async () => {
    setSkipDialogOpen(false);
    setWelcomeOpen(false);
    setTourStarted(false);
    
    // Update user profile
    if (profile?.id) {
      try {
        await apiEndpoints.updateUserProfile(profile.id, {
          hasCompletedTour: true
        });
        updateProfile({ ...profile, hasCompletedTour: true });
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
    
    // Navigate to dashboard
    navigate('/dashboard');
  };
  
  // Handle user type selection
  const handleUserTypeSelect = (type) => {
    setUserType(type);
  };
  
  // Handle feature selection
  const handleFeatureSelect = (feature) => {
    if (selectedFeatures.includes(feature)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, feature]);
    }
  };
  
  // Handle preference change
  const handlePreferenceChange = (preference) => (event) => {
    setPreferences({
      ...preferences,
      [preference]: event.target.checked
    });
  };
  
  // Handle restart tour
  const handleRestartTour = () => {
    setActiveStep(0);
    setTourStarted(false);
    setTourCompleted(false);
    setCompletedSteps({});
    setWelcomeOpen(true);
    localStorage.removeItem('tourProgress');
    
    // Reset video if playing
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsVideoPlaying(false);
  };
  
  // Navigate to a specific feature after tour completes
  const navigateToFeature = (path) => {
    setCompletionOpen(false);
    navigate(path);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 3
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3 }}>
          Preparing your personalized tour...
        </Typography>
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          p: 3
        }}
      >
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.location.reload()}
          startIcon={<Refresh />}
        >
          Refresh Page
        </Button>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} sx={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Confetti animation for tour completion */}
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}
      
      {/* Welcome Dialog */}
      <Dialog
        open={welcomeOpen}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <Grid container>
            {/* Left side - Image */}
            <Grid 
              item 
              xs={12} 
              md={5} 
              sx={{ 
                bgcolor: theme.palette.primary.dark,
                display: { xs: 'none', md: 'block' }
              }}
            >
              <Box 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  p: 2
                }}
              >
                {welcomeSteps[activeStep].image ? (
                  <Box 
                    component="img"
                    src={welcomeSteps[activeStep].image}
                    alt={welcomeSteps[activeStep].title}
                    sx={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: 2
                    }}
                  />
                ) : (
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    <LightbulbOutlined sx={{ fontSize: 100, color: 'white', opacity: 0.8 }} />
                  </Box>
                )}
              </Box>
            </Grid>
            
            {/* Right side - Content */}
            <Grid item xs={12} md={7}>
              <Box sx={{ p: 4 }}>
                <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mb: 4 }}>
                  {welcomeSteps.map((step, index) => (
                    <Step key={index} completed={index < activeStep}>
                      <StepLabel />
                    </Step>
                  ))}
                </Stepper>
                
                <Typography variant="h4" gutterBottom fontWeight={700}>
                  {welcomeSteps[activeStep].title}
                </Typography>
                
                <Typography variant="body1" color="text.secondary" paragraph>
                  {welcomeSteps[activeStep].description}
                </Typography>
                
                <Box sx={{ my: 3, minHeight: 250 }}>
                  {/* User type selection */}
                  {welcomeSteps[activeStep].options && !welcomeSteps[activeStep].multiSelect && (
                    <Grid container spacing={2}>
                      {welcomeSteps[activeStep].options.map((option) => (
                        <Grid item xs={12} sm={6} key={option.id}>
                          <Card 
                            onClick={() => handleUserTypeSelect(option.id)}
                            sx={{ 
                              borderRadius: 2,
                              cursor: 'pointer',
                              border: `2px solid ${userType === option.id ? theme.palette.primary.main : 'transparent'}`,
                              boxShadow: userType === option.id ? 3 : 1,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                boxShadow: 4,
                                transform: 'translateY(-4px)'
                              }
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: userType === option.id ? 'primary.main' : 'action.disabledBackground',
                                    mr: 2
                                  }}
                                >
                                  {option.icon}
                                </Avatar>
                                <Typography variant="h6">
                                  {option.label}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  
                  {/* Feature selection */}
                  {welcomeSteps[activeStep].options && welcomeSteps[activeStep].multiSelect && (
                    <Grid container spacing={2}>
                      {welcomeSteps[activeStep].options.map((option) => (
                        <Grid item xs={12} sm={6} md={4} key={option.id}>
                          <Card 
                            onClick={() => handleFeatureSelect(option.id)}
                            sx={{ 
                              borderRadius: 2,
                              cursor: 'pointer',
                              border: `2px solid ${selectedFeatures.includes(option.id) ? theme.palette.primary.main : 'transparent'}`,
                              boxShadow: selectedFeatures.includes(option.id) ? 3 : 1,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                boxShadow: 4,
                                transform: 'translateY(-4px)'
                              }
                            }}
                          >
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: selectedFeatures.includes(option.id) ? 'primary.main' : 'action.disabledBackground',
                                    mr: 2
                                  }}
                                >
                                  {option.icon}
                                </Avatar>
                                <Typography variant="h6">
                                  {option.label}
                                </Typography>
                                {selectedFeatures.includes(option.id) && (
                                  <CheckCircle color="primary" sx={{ ml: 'auto' }} />
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                  
                  {/* Preferences */}
                  {welcomeSteps[activeStep].preferences && (
                    <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={preferences.showTutorials} 
                            onChange={handlePreferenceChange('showTutorials')}
                            color="primary"
                          />
                        }
                        label="Show feature tutorials when visiting new pages"
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={preferences.enableNotifications} 
                            onChange={handlePreferenceChange('enableNotifications')}
                            color="primary"
                          />
                        }
                        label="Enable helpful notifications and tips"
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={preferences.collectUsageData} 
                            onChange={handlePreferenceChange('collectUsageData')}
                            color="primary"
                          />
                        }
                        label="Collect anonymous usage data to improve the platform"
                      />
                      
                      <FormControlLabel
                        control={
                          <Switch 
                            checked={showDetailedTour} 
                            onChange={(e) => setShowDetailedTour(e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Show detailed feature walkthrough (recommended)"
                      />
                    </Box>
                  )}
                  
                  {/* Final step */}
                  {activeStep === welcomeSteps.length - 1 && (
                    <Box sx={{ textAlign: 'center', my: 4 }}>
                      <Celebration color="primary" sx={{ fontSize: 60, mb: 2 }} />
                      <Typography variant="h5" paragraph>
                        Your personalized tour is ready!
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        We'll guide you through the features that matter most to you.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button 
            onClick={handleSkipTour}
            startIcon={<SkipNext />}
          >
            Skip Tour
          </Button>
          
          <Box>
            {activeStep > 0 && (
              <Button 
                onClick={handleWelcomeBack} 
                sx={{ mr: 1 }}
                startIcon={<ArrowBack />}
              >
                Back
              </Button>
            )}
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleWelcomeNext}
              endIcon={activeStep < welcomeSteps.length - 1 ? <ArrowForward /> : <PlayArrow />}
              disabled={activeStep === 1 && !userType} // Disable if user type not selected
            >
              {activeStep < welcomeSteps.length - 1 ? 'Continue' : 'Start Tour'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      
      {/* Skip Confirmation Dialog */}
      <Dialog
        open={skipDialogOpen}
        onClose={() => setSkipDialogOpen(false)}
        aria-labelledby="skip-dialog-title"
      >
        <DialogTitle id="skip-dialog-title">
          Skip the tour?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            You can always access the tour later from the Help menu. Are you sure you want to skip?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkipDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={confirmSkipTour}>
            Skip Tour
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Feature Joyride Tour */}
      {tourStarted && (
        <Joyride
          callback={handleJoyrideCallback}
          continuous
          hideCloseButton
          scrollToFirstStep
          showProgress
          showSkipButton
          steps={tourSteps[selectedFeatures[activeStep] || 'dashboard']}
          styles={{
            options: {
              zIndex: 10000,
              primaryColor: theme.palette.primary.main,
            },
            tooltipContainer: {
              textAlign: 'left'
            }
          }}
          run={runJoyride}
          disableOverlayClose
          spotlightClicks
        />
      )}
      
      {/* Tour Complete Dialog */}
      <Dialog
        open={completionOpen}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Celebration color="primary" sx={{ fontSize: 80, mb: 2 }} />
            
            <Typography variant="h4" gutterBottom fontWeight={700}>
              Tour Completed!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              Congratulations! You've completed the TamkeenAI platform tour. You're now ready to supercharge your career journey.
            </Typography>
            
            <Box sx={{ my: 4 }}>
              <Typography variant="h6" gutterBottom>
                Recommended Next Steps:
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {recommendedActions.slice(0, 4).map((action, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      startIcon={action.icon}
                      onClick={() => navigateToFeature(action.path)}
                      sx={{ 
                        py: 1.5, 
                        justifyContent: 'flex-start',
                        borderRadius: 2
                      }}
                    >
                      {action.title}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleRestartTour}
            startIcon={<Refresh />}
          >
            Restart Tour
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              setCompletionOpen(false);
              navigate('/dashboard');
            }}
            endIcon={<Dashboard />}
          >
            Go to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Main Content - Mock UI elements for the tour */}
      <Box 
        sx={{ 
          height: '100%', 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Mock Dashboard Header */}
        <Box 
          className="dashboard-header"
          sx={{ 
            p: 3, 
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Typography variant="h4" gutterBottom>
            Welcome to TamkeenAI
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Your AI-powered career development platform
          </Typography>
        </Box>
        
        {/* Mock Dashboard Content */}
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Grid container spacing={3}>
            {/* Profile Section */}
            <Grid item xs={12} md={4}>
              <Paper 
                className="profile-section"
                sx={{ p: 3, borderRadius: 2, height: '100%' }}
              >
                <Typography variant="h6" gutterBottom>
                  Profile Completion
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={65} 
                      size={60} 
                      thickness={4} 
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
                        65%
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Complete your profile to get better recommendations
                    </Typography>
                    <Button size="small" color="primary" sx={{ mt: 1 }}>
                      Finish Profile
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            {/* Resume Section */}
            <Grid item xs={12} md={4}>
              <Paper 
                className="resume-section"
                sx={{ p: 3, borderRadius: 2, height: '100%' }}
              >
                <Typography variant="h6" gutterBottom>
                  Resume Builder
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create and optimize your resume for specific job roles
                </Typography>
                <Button variant="contained" color="primary" startIcon={<Assignment />}>
                  Create Resume
                </Button>
              </Paper>
            </Grid>
            
            {/* Job Section */}
            <Grid item xs={12} md={4}>
              <Paper 
                className="job-section"
                sx={{ p: 3, borderRadius: 2, height: '100%' }}
              >
                <Typography variant="h6" gutterBottom>
                  Job Matches
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  We found 24 jobs that match your profile
                </Typography>
                <Button variant="outlined" color="primary" startIcon={<Work />}>
                  View Matches
                </Button>
              </Paper>
            </Grid>
            
            {/* Analytics Section */}
            <Grid item xs={12}>
              <Paper 
                className="analytics-section"
                sx={{ p: 3, borderRadius: 2 }}
              >
                <Typography variant="h6" gutterBottom>
                  Career Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Track your progress and identify growth opportunities
                </Typography>
                <Box sx={{ height: 200, bgcolor: 'action.hover', borderRadius: 2, mb: 2 }}>
                  {/* Mock chart */}
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <ShowChart color="primary" sx={{ fontSize: 80, opacity: 0.6 }} />
                    <Typography variant="caption" display="block">
                      Career progress visualization
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default WalkthroughTour; 