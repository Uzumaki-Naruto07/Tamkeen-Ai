import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Stepper,
  Step, StepLabel, StepContent,
  Button, Chip, Divider, Alert,
  List, ListItem, ListItemText,
  ListItemIcon, CircularProgress
} from '@mui/material';
import {
  Work, Description, Send, VideoCall,
  Assessment, Handshake, ArrowForward,
  CheckCircle, Cancel, Info
} from '@mui/icons-material';
import { useUser, useJob } from './AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const AIJobWorkflowTimeline = ({ jobId, resumeId }) => {
  const [workflowData, setWorkflowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [simulating, setSimulating] = useState(false);
  const { profile } = useUser();
  const { currentJobDescription } = useJob();
  
  // Get job ID from props or context
  const effectiveJobId = jobId || currentJobDescription?.id;
  
  useEffect(() => {
    const fetchWorkflowData = async () => {
      if (!effectiveJobId) {
        setError('Job information is required');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // This connects to job_workflow_ai.py backend
        const response = await apiEndpoints.career.getJobWorkflow({
          jobId: effectiveJobId,
          resumeId: resumeId || undefined
        });
        
        // Response includes AI path for job from job_workflow_ai.py
        setWorkflowData(response.data);
        
        // Set active step based on current progress
        if (response.data.currentStage) {
          const currentIndex = response.data.stages.findIndex(
            stage => stage.id === response.data.currentStage
          );
          setActiveStep(currentIndex !== -1 ? currentIndex : 0);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load job workflow');
        console.error('Job workflow error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkflowData();
  }, [effectiveJobId, resumeId]);
  
  const simulateStage = async (stageId) => {
    if (!effectiveJobId || !stageId) return;
    
    setSimulating(true);
    
    try {
      // This connects to job_workflow_ai.py simulation functionality
      const response = await apiEndpoints.career.simulateJobStage({
        jobId: effectiveJobId,
        resumeId: resumeId || undefined,
        stageId,
        userId: profile?.id || undefined
      });
      
      // Update workflow data with simulation results
      setWorkflowData(prev => ({
        ...prev,
        stages: prev.stages.map(stage => 
          stage.id === stageId 
            ? { ...stage, simulationResults: response.data.results, completed: true } 
            : stage
        ),
        currentStage: response.data.nextStage || prev.currentStage
      }));
      
      // Update active step if simulation advances to next stage
      if (response.data.nextStage) {
        const nextIndex = workflowData.stages.findIndex(
          stage => stage.id === response.data.nextStage
        );
        if (nextIndex !== -1) {
          setActiveStep(nextIndex);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to simulate job stage');
      console.error('Stage simulation error:', err);
    } finally {
      setSimulating(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LoadingSpinner message="Loading job workflow..." />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!workflowData) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No workflow data available
      </Alert>
    );
  }
  
  const { stages, jobDetails } = workflowData;
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <Work sx={{ mr: 1 }} />
        AI Job Application Simulation: {jobDetails.title}
      </Typography>
      
      {jobDetails.company && (
        <Chip
          label={jobDetails.company}
          color="primary"
          variant="outlined"
          sx={{ mb: 2 }}
        />
      )}
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {stages.map((stage, index) => (
          <Step key={stage.id}>
            <StepLabel>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getStageIcon(stage.type)}
                <Typography variant="subtitle1" sx={{ ml: 1 }}>
                  {stage.name}
                </Typography>
                {stage.completed && (
                  <CheckCircle color="success" sx={{ ml: 1, fontSize: 16 }} />
                )}
              </Box>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {stage.description}
              </Typography>
              
              {stage.simulationResults ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Simulation Results:
                  </Typography>
                  
                  <Alert 
                    severity={getResultSeverity(stage.simulationResults.outcome)} 
                    sx={{ mb: 2 }}
                  >
                    {stage.simulationResults.summary}
                  </Alert>
                  
                  {stage.simulationResults.details && (
                    <List dense>
                      {stage.simulationResults.details.map((detail, i) => (
                        <ListItem key={i}>
                          <ListItemIcon>
                            {detail.type === 'positive' ? 
                              <CheckCircle color="success" /> : 
                              detail.type === 'negative' ? 
                                <Cancel color="error" /> : 
                                <Info color="info" />
                            }
                          </ListItemIcon>
                          <ListItemText primary={detail.text} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              ) : (
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => simulateStage(stage.id)}
                    disabled={simulating || index !== activeStep}
                    startIcon={simulating ? <CircularProgress size={20} /> : null}
                  >
                    {simulating ? 'Simulating...' : 'Simulate This Stage'}
                  </Button>
                </Box>
              )}
              
              {index < stages.length - 1 && (
                <Button
                  disabled={!stage.completed || simulating}
                  onClick={() => setActiveStep(prev => prev + 1)}
                  endIcon={<ArrowForward />}
                >
                  Next Stage
                </Button>
              )}
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Paper>
  );
};

// Helper function to get icon based on stage type
const getStageIcon = (type) => {
  switch (type) {
    case 'resume':
      return <Description />;
    case 'application':
      return <Send />;
    case 'screening':
      return <Assessment />;
    case 'interview':
      return <VideoCall />;
    case 'offer':
      return <Handshake />;
    default:
      return <Work />;
  }
};

// Helper function to get severity based on outcome
const getResultSeverity = (outcome) => {
  switch (outcome) {
    case 'success':
      return 'success';
    case 'fail':
      return 'error';
    case 'partial':
      return 'warning';
    default:
      return 'info';
  }
};

export default AIJobWorkflowTimeline;