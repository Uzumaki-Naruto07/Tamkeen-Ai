import React, { useState } from 'react';
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
  Chip,
  Divider,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Grid,
  Tabs,
  Tab
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LayersIcon from '@mui/icons-material/Layers';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const CareerPathChart = ({ careerPaths, currentPosition, onSelectPath }) => {
  const [selectedPath, setSelectedPath] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [viewMode, setViewMode] = useState('steps');

  if (!careerPaths || careerPaths.length === 0) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No career path data available
        </Typography>
      </Paper>
    );
  }

  const handlePathChange = (event, newValue) => {
    setSelectedPath(newValue);
    setActiveStep(0);
    if (onSelectPath) {
      onSelectPath(careerPaths[newValue]);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleViewModeChange = (event, newValue) => {
    setViewMode(newValue);
  };

  const renderStepperView = () => {
    const path = careerPaths[selectedPath];
    
    return (
      <Stepper activeStep={activeStep} orientation="vertical">
        {path.positions.map((position, index) => (
          <Step key={position.title}>
            <StepLabel
              StepIconProps={{
                icon: position.icon ? (
                  <WorkIcon color={index === activeStep ? "primary" : "disabled"} />
                ) : (
                  index + 1
                )
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle1">{position.title}</Typography>
                {position.timeframe && (
                  <Chip 
                    label={position.timeframe} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                )}
                {position.currentPosition && (
                  <Chip 
                    label="Current" 
                    size="small" 
                    color="success"
                  />
                )}
              </Box>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                {position.description}
              </Typography>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    );
  };

  const renderTimelineView = () => {
    // Implementation of timeline view
  };

  const renderComparisonView = () => {
    // Implementation of comparison view
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5">
          Career Path Chart
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
          <Tabs
            value={viewMode}
            onChange={handleViewModeChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<LayersIcon />} label="Steps" />
            <Tab icon={<TrendingUpIcon />} label="Growth Path" />
          </Tabs>
        </Box>
        
        {viewMode === 'steps' && renderStepperView()}
        {viewMode === 'timeline' && renderTimelineView()}
        {viewMode === 'comparison' && renderComparisonView()}
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle1">
          Recommended Next Steps
        </Typography>
        
        <Grid container spacing={2}>
          {careerPaths[selectedPath].nextSteps?.map((step, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {step.type === 'education' ? (
                      <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    ) : (
                      <TipsAndUpdatesIcon color="success" sx={{ mr: 1 }} />
                    )}
                    <Typography variant="subtitle2">
                      {step.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                  {step.duration && (
                    <Chip 
                      label={step.duration} 
                      size="small" 
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

export default CareerPathChart; 