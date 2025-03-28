import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Grid,
  Divider,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'react-lottie';

// Icons
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';

// Import animation data
import careerAnimationData from '../assets/animations/career-animation.json';
import profileAnimationData from '../assets/animations/profile-animation.json';
import interviewAnimationData from '../assets/animations/interview-animation.json';
import resumeAnimationData from '../assets/animations/resume-animation.json';
import successAnimationData from '../assets/animations/success-animation.json';

// Context
import { useUser } from '../context/AppContext';

// Mock Data
import { industryOptions, skillsList, roleOptions } from '../utils/mockData/mockDataIndex';

// Styled components
const IntroContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '85vh',
  padding: theme.spacing(4),
}));

const IntroCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 800,
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  boxShadow: theme.shadows[10],
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  zIndex: 10,
}));

const AnimationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  height: 200,
}));

const StepperContainer = styled(Box)(({ theme }) => ({
  width: '100%',
}));

const ProgressIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  marginBottom: theme.spacing(4),
}));

const ProgressBar = styled(Box)(({ theme, progress }) => ({
  width: '100%',
  height: 6,
  backgroundColor: theme.palette.divider,
  borderRadius: 3,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: `${progress}%`,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 3,
    transition: 'width 0.5s ease-in-out',
  },
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(4),
}));

const SkillsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

const UploadResumeBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { delayChildren: 0.3, staggerChildren: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.5 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

// Steps content
const steps = [
  {
    label: 'Welcome',
    icon: <PersonIcon />,
    description: `Welcome to TamkeenAI Career Intelligence System! We're excited to help you accelerate your career journey. Let's get you set up with a personalized experience.`,
    animation: profileAnimationData,
  },
  {
    label: 'Professional Profile',
    icon: <WorkIcon />,
    description: 'Tell us about your professional background so we can tailor our recommendations.',
    animation: careerAnimationData,
  },
  {
    label: 'Skills & Experience',
    icon: <SchoolIcon />,
    description: 'What skills do you have? Select from our list or add your own.',
    animation: careerAnimationData,
  },
  {
    label: 'Resume Upload',
    icon: <DescriptionIcon />,
    description: 'Upload your resume to jumpstart your profile and get personalized feedback.',
    animation: resumeAnimationData,
  },
  {
    label: 'Interview Preferences',
    icon: <SmartToyIcon />,
    description: 'Set up your preferences for the AI-powered interview simulator.',
    animation: interviewAnimationData,
  },
  {
    label: 'Complete',
    icon: <EmojiEventsIcon />,
    description: "You're all set! Your career dashboard is now ready with personalized insights.",
    animation: successAnimationData,
  },
];

const AnimatedIntro = ({ onComplete }) => {
  const theme = useTheme();
  const { updateProfile } = useUser();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    industry: '',
    experience: '',
    skills: [],
    resume: null,
    interviewLanguage: 'english',
    interviewDifficulty: 'moderate',
    interviewFeedback: true,
  });
  const [progress, setProgress] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  
  useEffect(() => {
    // Calculate progress percentage
    setProgress((activeStep / (steps.length - 1)) * 100);
  }, [activeStep]);
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleSkip = () => {
    onComplete();
    setShowIntro(false);
  };
  
  const handleComplete = () => {
    // Save user profile data
    updateProfile({
      ...formData,
    });
    onComplete();
    setShowIntro(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSkillToggle = (skill) => {
    setFormData((prev) => {
      const skills = [...prev.skills];
      const skillIndex = skills.indexOf(skill);
      
      if (skillIndex === -1) {
        skills.push(skill);
      } else {
        skills.splice(skillIndex, 1);
      }
      
      return {
        ...prev,
        skills,
      };
    });
  };
  
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        resume: file,
      });
    }
  };
  
  // Animation options
  const defaultLottieOptions = (animationData) => ({
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  });
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div variants={itemVariants}>
              <Typography variant="h4" gutterBottom color="primary">
                Welcome to TamkeenAI
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body1" paragraph>
                Your AI-powered career companion, designed to help you build skills, prepare for interviews, and find the perfect job. Let's get started with setting up your personalized profile.
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body1" paragraph>
                This quick setup will help us customize your experience. You can always update your preferences later.
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <SchoolIcon fontSize="large" color="primary" />
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Skill Development
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Identify skill gaps and access personalized learning paths
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <WorkIcon fontSize="large" color="primary" />
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Job Matching
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      AI-powered job recommendations tailored to your profile
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <SmartToyIcon fontSize="large" color="primary" />
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Interview Prep
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Practice with our AI interviewer and receive feedback
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <DescriptionIcon fontSize="large" color="primary" />
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      Resume Builder
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Create ATS-optimized resumes with AI assistance
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div variants={itemVariants}>
              <Typography variant="h4" gutterBottom color="primary">
                Professional Profile
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body1" paragraph>
                Tell us about your professional background so we can tailor our recommendations.
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    variant="outlined"
                    placeholder="e.g. Software Developer, Marketing Manager"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Industry</InputLabel>
                    <Select
                      label="Industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                    >
                      {industryOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Years of Experience</InputLabel>
                    <Select
                      label="Years of Experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                    >
                      <MenuItem value="0-1">0-1 years</MenuItem>
                      <MenuItem value="1-3">1-3 years</MenuItem>
                      <MenuItem value="3-5">3-5 years</MenuItem>
                      <MenuItem value="5-10">5-10 years</MenuItem>
                      <MenuItem value="10+">10+ years</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </motion.div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div variants={itemVariants}>
              <Typography variant="h4" gutterBottom color="primary">
                Skills & Experience
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body1" paragraph>
                Select the skills you possess. This helps us match you with relevant jobs and learning opportunities.
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                <InputLabel>Desired Role</InputLabel>
                <Select
                  label="Desired Role"
                  name="desiredRole"
                  value={formData.desiredRole || ''}
                  onChange={handleInputChange}
                >
                  {roleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Select your skills (select all that apply):
              </Typography>
              <SkillsContainer>
                {skillsList.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    clickable
                    color={formData.skills.includes(skill) ? "primary" : "default"}
                    onClick={() => handleSkillToggle(skill)}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </SkillsContainer>
            </motion.div>
            <motion.div variants={itemVariants}>
              <TextField
                fullWidth
                label="Other Skills"
                name="otherSkills"
                placeholder="Type additional skills separated by commas"
                variant="outlined"
                sx={{ mt: 3 }}
              />
            </motion.div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div variants={itemVariants}>
              <Typography variant="h4" gutterBottom color="primary">
                Resume Upload
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body1" paragraph>
                Upload your resume to jumpstart your profile. Our AI will analyze it to identify your skills and experiences.
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                style={{ display: 'none' }}
                id="resume-upload"
              />
              <label htmlFor="resume-upload">
                <UploadResumeBox>
                  {formData.resume ? (
                    <>
                      <CheckCircleIcon color="success" fontSize="large" />
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {formData.resume.name}
                      </Typography>
                      <Button
                        size="small"
                        color="primary"
                        sx={{ mt: 1 }}
                      >
                        Change File
                      </Button>
                    </>
                  ) : (
                    <>
                      <CloudUploadIcon color="primary" fontSize="large" />
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Drag & drop or click to upload
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Supported formats: PDF, DOC, DOCX
                      </Typography>
                    </>
                  )}
                </UploadResumeBox>
              </label>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                Note: You can skip this step and upload your resume later from your profile settings.
              </Typography>
            </motion.div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div variants={itemVariants}>
              <Typography variant="h4" gutterBottom color="primary">
                Interview Preferences
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body1" paragraph>
                Set up your preferences for our AI-powered interview simulator. You can change these settings anytime.
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Interview Language</InputLabel>
                    <Select
                      label="Interview Language"
                      name="interviewLanguage"
                      value={formData.interviewLanguage}
                      onChange={handleInputChange}
                    >
                      <MenuItem value="english">English</MenuItem>
                      <MenuItem value="arabic">Arabic</MenuItem>
                      <MenuItem value="bilingual">Bilingual (English & Arabic)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Interview Difficulty</InputLabel>
                    <Select
                      label="Interview Difficulty"
                      name="interviewDifficulty"
                      value={formData.interviewDifficulty}
                      onChange={handleInputChange}
                    >
                      <MenuItem value="beginner">Beginner</MenuItem>
                      <MenuItem value="moderate">Moderate</MenuItem>
                      <MenuItem value="advanced">Advanced</MenuItem>
                      <MenuItem value="expert">Expert</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Preferred Interview Mode</InputLabel>
                    <Select
                      label="Preferred Interview Mode"
                      name="interviewMode"
                      value={formData.interviewMode || "text"}
                      onChange={handleInputChange}
                    >
                      <MenuItem value="text">Text-based</MenuItem>
                      <MenuItem value="voice">Voice-based</MenuItem>
                      <MenuItem value="video">Video Simulation</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </motion.div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div variants={itemVariants}>
              <Typography variant="h4" gutterBottom color="primary">
                You're All Set!
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Typography variant="body1" paragraph>
                Thank you for completing your profile. Your personalized career dashboard is now ready.
              </Typography>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Box 
                sx={{ 
                  p: 3, 
                  bgcolor: 'primary.light', 
                  borderRadius: 2,
                  color: 'primary.contrastText',
                  textAlign: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  What's Next?
                </Typography>
                <Typography variant="body2">
                  Explore your dashboard, check job recommendations, and start your skill assessments.
                </Typography>
              </Box>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Paper 
                    elevation={3}
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <DashboardIcon color="primary" fontSize="large" />
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                      Dashboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View your progress and insights
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper 
                    elevation={3}
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <SchoolIcon color="primary" fontSize="large" />
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                      Skills
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Take skill assessments
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper 
                    elevation={3}
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <WorkIcon color="primary" fontSize="large" />
                    <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                      Jobs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Browse recommended jobs
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          </motion.div>
        );
      default:
        return 'Unknown step';
    }
  };
  
  if (!showIntro) {
    return null;
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <IntroContainer>
          <IntroCard>
            <CloseButton onClick={handleSkip} aria-label="close">
              <CloseIcon />
            </CloseButton>
            
            <ProgressIndicator>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Step {activeStep + 1} of {steps.length}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, mx: 2 }}>
                <ProgressBar progress={progress} />
              </Box>
              <Typography variant="body2" color="primary">
                {Math.round(progress)}%
              </Typography>
            </ProgressIndicator>
            
            <AnimationContainer>
              <Lottie 
                options={defaultLottieOptions(steps[activeStep].animation)}
                height={200}
                width={200}
              />
            </AnimationContainer>
            
            <StepperContainer>
              <Stepper activeStep={activeStep} orientation="horizontal" alternativeLabel>
                {steps.map((step) => (
                  <Step key={step.label}>
                    <StepLabel StepIconComponent={() => (
                      <Avatar
                        sx={{
                          bgcolor: activeStep >= steps.indexOf(step) ? 'primary.main' : 'action.disabled',
                          width: 32,
                          height: 32,
                        }}
                      >
                        {step.icon}
                      </Avatar>
                    )}>
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              <Divider sx={{ my: 3 }} />
              
              <Box>
                {getStepContent(activeStep)}
              </Box>
              
              <ButtonContainer>
                <Button
                  startIcon={<NavigateBeforeIcon />}
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  variant="outlined"
                >
                  Back
                </Button>
                <Box>
                  <Button
                    color="secondary"
                    onClick={handleSkip}
                    sx={{ mr: 1 }}
                  >
                    Skip Setup
                  </Button>
                  {activeStep === steps.length - 1 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleComplete}
                      endIcon={<CheckCircleIcon />}
                    >
                      Get Started
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      endIcon={<NavigateNextIcon />}
                    >
                      {activeStep === steps.length - 2 ? 'Finish' : 'Next'}
                    </Button>
                  )}
                </Box>
              </ButtonContainer>
            </StepperContainer>
          </IntroCard>
        </IntroContainer>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedIntro; 