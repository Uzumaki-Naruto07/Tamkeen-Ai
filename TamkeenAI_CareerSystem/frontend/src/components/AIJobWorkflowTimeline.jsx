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
  CardActions,
  Divider,
  Chip,
  IconButton,
  Collapse,
  CircularProgress,
  Grid,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  LinearProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/Info';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import SpeedIcon from '@mui/icons-material/Speed';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BiotechIcon from '@mui/icons-material/Biotech';
import WorkIcon from '@mui/icons-material/Work';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import SportsScoreIcon from '@mui/icons-material/SportsScore';

const AIJobWorkflowTimeline = ({ jobTitle = "Data Scientist" }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [expandedSteps, setExpandedSteps] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    title: '',
    content: '',
    imgUrl: ''
  });
  const [simulationProgress, setSimulationProgress] = useState(0);

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const toggleStepExpansion = (step) => {
    setExpandedSteps(prevExpanded => 
      prevExpanded.includes(step)
        ? prevExpanded.filter(s => s !== step)
        : [...prevExpanded, step]
    );
  };

  const handleStepCompletion = (step) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
    
    // Move to next step if not the last one
    if (step < jobWorkflowSteps.length - 1) {
      setActiveStep(step + 1);
    }
  };

  const openDetailDialog = (title, content, imgUrl = '') => {
    setDialogContent({
      title,
      content,
      imgUrl
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const startSimulation = () => {
    setIsSimulating(true);
    setCompletedSteps([]);
    setActiveStep(0);
    setSimulationProgress(0);
    
    // Simulate progress through each step
    const simulationDuration = 20000; // 20 seconds total
    const stepsCount = jobWorkflowSteps.length;
    const stepDuration = simulationDuration / stepsCount;
    
    let currentStep = 0;
    const simulationInterval = setInterval(() => {
      if (currentStep < stepsCount) {
        setActiveStep(currentStep);
        setCompletedSteps(prev => [...prev, currentStep]);
        setSimulationProgress((currentStep + 1) / stepsCount * 100);
        currentStep++;
      } else {
        clearInterval(simulationInterval);
        setIsSimulating(false);
      }
    }, stepDuration);
    
    return () => clearInterval(simulationInterval);
  };

  const resetSimulation = () => {
    setCompletedSteps([]);
    setActiveStep(0);
    setSimulationProgress(0);
  };

  const jobWorkflowSteps = [
    {
      label: 'Resume Analysis',
      description: 'AI scans your resume for keywords, skills, experience, and education to determine compatibility with various job roles.',
      details: 'Our advanced ML algorithms analyze your resume in depth, extracting key information about your skills, work history, educational background, and achievements. The system identifies patterns and connections that might not be immediately obvious, creating a comprehensive profile of your professional capabilities.',
      icon: <SummarizeIcon />,
      metrics: [
        { label: 'Skills Identified', value: '28' },
        { label: 'Experience Level', value: 'Mid-Senior' },
        { label: 'Profile Strength', value: '78%' }
      ]
    },
    {
      label: 'Job Description Analysis',
      description: 'AI processes job descriptions to extract essential requirements, responsibilities, and company cultural elements.',
      details: 'The AI examines job postings in detail, breaking them down into key components including required skills, experience levels, job responsibilities, company values, and unstated expectations. This analysis helps identify what the employer is truly looking for beyond the explicit requirements.',
      icon: <AssessmentIcon />,
      metrics: [
        { label: 'Key Requirements', value: '15' },
        { label: 'Cultural Factors', value: '6' },
        { label: 'Seniority Level', value: 'Senior' }
      ]
    },
    {
      label: 'Match Assessment',
      description: 'AI compares your profile against the job requirements to determine alignment and highlight skill gaps.',
      details: 'Using sophisticated matching algorithms, the system calculates the degree of alignment between your profile and the job requirements. It identifies both strong matches and potential gaps, providing a comprehensive assessment of your fit for the role.',
      icon: <BiotechIcon />,
      metrics: [
        { label: 'Overall Match', value: '72%' },
        { label: 'Technical Match', value: '85%' },
        { label: 'Experience Match', value: '65%' }
      ]
    },
    {
      label: 'Resume Optimization',
      description: 'AI suggests improvements to your resume to better align with the specific job requirements.',
      details: 'Based on the job analysis, the AI provides targeted recommendations to enhance your resume. These may include keyword additions, structural changes, content emphasis adjustments, and achievement reframing to maximize ATS compatibility and hiring manager appeal.',
      icon: <AutoFixHighIcon />,
      metrics: [
        { label: 'ATS Score Improvement', value: '+18%' },
        { label: 'Keywords Added', value: '12' },
        { label: 'Content Clarity', value: '+23%' }
      ]
    },
    {
      label: 'Cover Letter Generation',
      description: 'AI crafts a personalized cover letter highlighting your relevant skills and alignment with the position.',
      details: 'The system generates a customized cover letter that connects your experience directly to the job requirements. It emphasizes your most relevant achievements and skills, explains your motivation, and addresses potential concerns such as employment gaps or career transitions.',
      icon: <AutoAwesomeIcon />,
      metrics: [
        { label: 'Personalization', value: '92%' },
        { label: 'Key Points Addressed', value: '8' },
        { label: 'Tone Matching', value: 'Professional' }
      ]
    },
    {
      label: 'Application Submission',
      description: 'AI tracks optimal submission timing and formats your application materials for maximum impact.',
      details: 'The AI determines the optimal time to submit your application based on hiring patterns and recruiter activity. It also ensures all your materials are formatted correctly for the specific application system and verifies that all required fields and attachments are properly included.',
      icon: <WorkIcon />,
      metrics: [
        { label: 'Submission Timing', value: 'Optimal' },
        { label: 'Application Completeness', value: '100%' },
        { label: 'Tracking Established', value: 'Yes' }
      ]
    },
    {
      label: 'Interview Preparation',
      description: 'AI generates likely interview questions and provides guidance on effective responses.',
      details: 'Based on the job description, company research, and industry trends, the AI predicts the most likely interview questions. It then helps you craft compelling responses that showcase your relevant experience and skills, with special attention to behavioral and technical questions.',
      icon: <VideoCallIcon />,
      metrics: [
        { label: 'Questions Prepared', value: '42' },
        { label: 'Technical Depth', value: 'High' },
        { label: 'Story Examples', value: '15' }
      ]
    },
    {
      label: 'Mock Interview Simulation',
      description: 'Practice with an AI interviewer that provides real-time feedback on your responses and presentation.',
      details: 'The AI conducts realistic interview simulations, responding dynamically to your answers. It analyzes your verbal responses, speech patterns, and if video is enabled, your non-verbal cues. Comprehensive feedback is provided on content, delivery, and overall impression.',
      icon: <AnalyticsIcon />,
      metrics: [
        { label: 'Response Quality', value: '76%' },
        { label: 'Communication Clarity', value: '82%' },
        { label: 'Technical Accuracy', value: '79%' }
      ]
    },
    {
      label: 'Post-Interview Analysis',
      description: 'AI evaluates your interview performance and suggests improvements for future interviews.',
      details: 'After each interview (mock or real), the system analyzes your performance in detail. It identifies strengths to emphasize and areas for improvement, providing specific recommendations for enhancing your interview skills incrementally with each experience.',
      icon: <AssignmentTurnedInIcon />,
      metrics: [
        { label: 'Strong Answers', value: '8/10' },
        { label: 'Improvement Areas', value: '3' },
        { label: 'Confidence Score', value: '84%' }
      ]
    },
    {
      label: 'Offer Negotiation Support',
      description: 'AI provides market data and negotiation suggestions to help secure the best compensation package.',
      details: 'The system combines industry salary data, company-specific compensation trends, and your personal value proposition to develop a negotiation strategy. It offers scripts for common negotiation scenarios and helps you evaluate the complete offer beyond just salary.',
      icon: <SportsScoreIcon />,
      metrics: [
        { label: 'Market Position', value: '65th percentile' },
        { label: 'Negotiation Points', value: '5' },
        { label: 'Total Value Increase', value: '+12%' }
      ]
    }
  ];

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            AI-Powered Job Application Workflow
          </Typography>
          <Typography variant="body2" color="text.secondary">
            An interactive simulation of how AI assists throughout your job application journey for: <Chip label={jobTitle} color="primary" size="small" />
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={isSimulating ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            onClick={startSimulation}
            disabled={isSimulating}
            sx={{ mr: 1 }}
          >
            {isSimulating ? 'Simulating...' : 'Simulate Process'}
          </Button>
          <Button
            variant="outlined"
            onClick={resetSimulation}
            disabled={isSimulating || completedSteps.length === 0}
          >
            Reset
          </Button>
        </Box>
      </Box>

      {isSimulating && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress variant="determinate" value={simulationProgress} sx={{ height: 8, borderRadius: 4 }} />
          <Typography variant="body2" textAlign="center" mt={1}>
            Simulating application process: {Math.round(simulationProgress)}% complete
          </Typography>
        </Box>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {jobWorkflowSteps.map((step, index) => (
          <Step key={index} completed={completedSteps.includes(index)}>
            <StepLabel
              StepIconProps={{
                icon: completedSteps.includes(index) ? (
                  <CheckCircleIcon color="success" />
                ) : activeStep === index ? (
                  <HourglassEmptyIcon color="primary" />
                ) : (
                  index + 1
                ),
              }}
              optional={
                <Typography variant="caption" color="text.secondary">
                  {index < activeStep ? "Completed" : index === activeStep ? "Current" : "Pending"}
                </Typography>
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box>{step.icon}</Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {step.label}
                </Typography>
                <IconButton size="small" onClick={() => toggleStepExpansion(index)}>
                  {expandedSteps.includes(index) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {step.description}
              </Typography>
              
              <Collapse in={expandedSteps.includes(index)}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      {step.metrics.map((metric, idx) => (
                        <Grid item xs={4} key={idx}>
                          <Box textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                              {metric.label}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {metric.value}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<InfoIcon />}
                      onClick={() => openDetailDialog(step.label, step.details)}
                    >
                      Learn More
                    </Button>
                  </CardActions>
                </Card>
              </Collapse>
              
              <Box sx={{ mb: 2 }}>
                <Button
                  variant={completedSteps.includes(index) ? "outlined" : "contained"}
                  size="small"
                  onClick={() => handleStepCompletion(index)}
                  sx={{ mr: 1 }}
                  startIcon={completedSteps.includes(index) ? <DoneAllIcon /> : <ThumbUpAltIcon />}
                  disabled={isSimulating}
                >
                  {completedSteps.includes(index) ? "Completed" : "Complete Step"}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleStepChange(index + 1)}
                  disabled={index === jobWorkflowSteps.length - 1 || isSimulating}
                >
                  Next Step
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      {activeStep === jobWorkflowSteps.length && (
        <Box sx={{ p: 3, bgcolor: 'success.light', borderRadius: 2, mt: 2 }}>
          <Typography variant="h6" color="white">
            <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Congratulations! You've completed the entire AI-powered job application process.
          </Typography>
          <Typography variant="body2" color="white" sx={{ mt: 1 }}>
            Your application for {jobTitle} position has been optimized at every stage using AI assistance.
          </Typography>
          <Button
            variant="contained"
            color="inherit"
            sx={{ mt: 2, color: 'success.main' }}
            onClick={resetSimulation}
          >
            Start Over
          </Button>
        </Box>
      )}
      
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
      >
        <DialogTitle>{dialogContent.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {dialogContent.content}
          </Typography>
          {dialogContent.imgUrl && (
            <Box sx={{ my: 2, textAlign: 'center' }}>
              <img src={dialogContent.imgUrl} alt={dialogContent.title} style={{ maxWidth: '100%', maxHeight: '300px' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AIJobWorkflowTimeline; 