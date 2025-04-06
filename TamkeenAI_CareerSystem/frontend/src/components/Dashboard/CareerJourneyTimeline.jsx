import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  Paper,
  Tooltip,
  Zoom,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import TimelineIcon from '@mui/icons-material/Timeline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CodeIcon from '@mui/icons-material/Code';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import { motion } from 'framer-motion';

// Styled components for timeline elements
const TimelineContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  margin: theme.spacing(3, 0),
  padding: theme.spacing(0, 2),
  overflowX: 'auto',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.palette.divider,
    transform: 'translateY(-50%)',
    zIndex: 0
  }
}));

const TimelineWrapper = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  position: 'relative',
  minWidth: '100%',
  paddingTop: theme.spacing(5),
  paddingBottom: theme.spacing(5),
  zIndex: 1
}));

const TimelineStage = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(1),
  margin: theme.spacing(0, 1.5),
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)'
  }
}));

const TimelineConnector = styled(Box)(({ theme, filled }) => ({
  position: 'absolute',
  top: '50%',
  left: '-20px',
  width: '40px',
  height: 4,
  backgroundColor: filled ? theme.palette.primary.main : 'transparent',
  transform: 'translateY(-50%)',
  zIndex: 0
}));

const TimelineAvatar = styled(Avatar)(({ theme, active, completed }) => ({
  width: 64,
  height: 64,
  backgroundColor: completed ? theme.palette.success.light : 
                  active ? theme.palette.primary.main : theme.palette.grey[300],
  border: `4px solid ${completed ? theme.palette.success.main : 
                        active ? theme.palette.primary.main : theme.palette.grey[400]}`,
  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
  transition: 'all 0.3s ease',
  zIndex: 2
}));

const TimelineDetails = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1.5),
  textAlign: 'center',
  maxWidth: 140
}));

const ExperienceChip = styled(Chip)(({ theme }) => ({
  marginTop: theme.spacing(1),
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  '& .MuiChip-icon': {
    color: 'inherit'
  }
}));

const DateBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: -20,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  fontSize: '0.75rem',
  color: theme.palette.text.secondary
}));

const StageTag = styled(Typography)(({ theme, type }) => ({
  position: 'absolute',
  top: -5,
  left: '50%',
  transform: 'translateX(-50%)',
  padding: theme.spacing(0.25, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 
    type === 'promotion' ? theme.palette.success.light : 
    type === 'education' ? theme.palette.info.light : 
    type === 'project' ? theme.palette.warning.light :
    theme.palette.primary.light,
  fontSize: '0.7rem',
  fontWeight: 'bold',
  color: 
    type === 'promotion' ? theme.palette.success.contrastText : 
    type === 'education' ? theme.palette.info.contrastText : 
    type === 'project' ? theme.palette.warning.contrastText :
    theme.palette.primary.contrastText
}));

// Added styled component for assessment badge
const AssessmentBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

// Icons mapping for different skill types
const skillIcons = {
  technical: <CodeIcon fontSize="small" />,
  soft: <PeopleIcon fontSize="small" />,
  analytical: <AnalyticsIcon fontSize="small" />,
  creative: <LightbulbIcon fontSize="small" />
};

// Assessment types with icons
const assessmentTypes = {
  technical: { icon: <CodeIcon />, label: 'Technical Assessment' },
  soft_skills: { icon: <PeopleIcon />, label: 'Soft Skills Evaluation' },
  personality: { icon: <StarIcon />, label: 'Personality Profile' },
  knowledge: { icon: <SchoolIcon />, label: 'Knowledge Test' },
  performance: { icon: <EmojiEventsIcon />, label: 'Performance Review' }
};

const CareerJourneyTimeline = ({ journeyData }) => {
  const [selectedStage, setSelectedStage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [pendingAssessments, setPendingAssessments] = useState([]);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  
  // Make sure journeyData is defined and is an array
  const safeJourneyData = journeyData || [];
  
  // Find current stage index
  const currentStageIndex = safeJourneyData.findIndex(stage => stage.isCurrent);
  
  // Total experience points accumulated
  const totalXP = safeJourneyData.reduce((sum, stage) => {
    if (stage.isCompleted || stage.isCurrent) {
      return sum + (stage.experiencePoints || 0);
    }
    return sum;
  }, 0);

  // Check for pending assessments on mount and when journey data changes
  useEffect(() => {
    const fetchPendingAssessments = () => {
      try {
        // First check localStorage for any stored assessments
        const storedAssessments = localStorage.getItem('pending_assessments');
        if (storedAssessments) {
          setPendingAssessments(JSON.parse(storedAssessments));
          return;
        }
        
        // If no stored assessments, check for any in the current stage
        if (currentStageIndex >= 0) {
          const currentStage = safeJourneyData[currentStageIndex];
          const stageAssessments = currentStage?.assessments || [];
          const pending = stageAssessments.filter(assessment => !assessment.completed);
          setPendingAssessments(pending);
          
          // Store in localStorage for future reference
          localStorage.setItem('pending_assessments', JSON.stringify(pending));
        }
      } catch (error) {
        console.error('Error fetching pending assessments:', error);
        setPendingAssessments([]);
      }
    };
    
    fetchPendingAssessments();
  }, [safeJourneyData, currentStageIndex]);
  
  // Handle opening details dialog
  const handleStageClick = (stage) => {
    setSelectedStage(stage);
    setDialogOpen(true);
  };
  
  // Handle closing dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Handle assessment dialog open
  const handleAssessmentClick = (assessment) => {
    setSelectedAssessment(assessment);
    setAssessmentDialogOpen(true);
  };

  // Handle closing assessment dialog
  const handleCloseAssessmentDialog = () => {
    setAssessmentDialogOpen(false);
  };

  // Mark assessment as completed
  const handleCompleteAssessment = (assessmentId) => {
    const updatedAssessments = pendingAssessments.map(assessment => 
      assessment.id === assessmentId 
        ? { ...assessment, completed: true, completionDate: new Date().toISOString() } 
        : assessment
    );
    
    const stillPending = updatedAssessments.filter(assessment => !assessment.completed);
    
    setPendingAssessments(stillPending);
    localStorage.setItem('pending_assessments', JSON.stringify(stillPending));
    
    handleCloseAssessmentDialog();
  };
  
  // Stage entrance animation configuration
  const stageAnimationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: index => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.2,
        duration: 0.5,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    })
  };
  
  // Mark all animations as complete after last stage has animated
  useEffect(() => {
    const animationTimeout = setTimeout(() => {
      setAnimationComplete(true);
    }, safeJourneyData.length * 200 + 500);
    
    return () => clearTimeout(animationTimeout);
  }, [safeJourneyData.length]);

  // Render assessment items for current stage
  const renderAssessments = () => {
    if (pendingAssessments.length === 0) return null;
    
    return (
      <Paper sx={{ p: 2, mb: 3, borderLeft: '4px solid', borderColor: 'warning.main' }}>
        <Typography variant="subtitle1" gutterBottom>
          Pending Assessments
        </Typography>
        <List dense>
          {pendingAssessments.map((assessment) => (
            <ListItem 
              key={assessment.id}
              button
              onClick={() => handleAssessmentClick(assessment)}
              secondaryAction={
                <Chip 
                  size="small" 
                  color="warning" 
                  label="Required" 
                  variant="outlined"
                />
              }
            >
              <ListItemIcon>
                {assessmentTypes[assessment.type]?.icon || <AssessmentIcon />}
              </ListItemIcon>
              <ListItemText 
                primary={assessment.title} 
                secondary={`Due: ${new Date(assessment.dueDate).toLocaleDateString()}`} 
              />
            </ListItem>
          ))}
        </List>
        {pendingAssessments.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Complete required assessments to progress in your career journey
          </Typography>
        )}
      </Paper>
    );
  };
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">
            Your Career Journey
          </Typography>
          <Box>
            <Tooltip title="Total experience points gained">
              <Chip 
                icon={<EmojiEventsIcon />} 
                label={`${totalXP} XP`} 
                color="primary"
                variant="outlined"
              />
            </Tooltip>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Track your professional growth through key milestones and experiences
        </Typography>
        
        {/* Render pending assessments if any */}
        {renderAssessments()}
        
        {/* Interactive Timeline */}
        <TimelineContainer>
          <TimelineWrapper>
            {safeJourneyData.map((stage, index) => {
              const isCompleted = stage.isCompleted;
              const isCurrent = stage.isCurrent;
              const isUpcoming = !isCompleted && !isCurrent;
              const hasAssessments = (stage.assessments || []).some(a => !a.completed);
              
              return (
                <TimelineStage
                  key={stage.id || index}
                  onClick={() => handleStageClick(stage)}
                  initial="hidden"
                  animate={animationComplete ? "visible" : "hidden"}
                  custom={index}
                  variants={stageAnimationVariants}
                >
                  {index > 0 && (
                    <TimelineConnector filled={isCompleted || isCurrent} />
                  )}
                  
                  {stage.type && (
                    <StageTag type={stage.type}>
                      {stage.type}
                    </StageTag>
                  )}
                  
                  {hasAssessments && isCurrent ? (
                    <AssessmentBadge
                      overlap="circular"
                      badgeContent={<AssessmentIcon fontSize="small" />}
                    >
                      <TimelineAvatar
                        active={isCurrent}
                        completed={isCompleted}
                      >
                        {stage.icon === 'work' ? (
                          <WorkIcon />
                        ) : stage.icon === 'school' ? (
                          <SchoolIcon />
                        ) : stage.icon === 'business' ? (
                          <BusinessIcon />
                        ) : (
                          <TimelineIcon />
                        )}
                      </TimelineAvatar>
                    </AssessmentBadge>
                  ) : (
                    <TimelineAvatar
                      active={isCurrent}
                      completed={isCompleted}
                    >
                      {stage.icon === 'work' ? (
                        <WorkIcon />
                      ) : stage.icon === 'school' ? (
                        <SchoolIcon />
                      ) : stage.icon === 'business' ? (
                        <BusinessIcon />
                      ) : (
                        <TimelineIcon />
                      )}
                    </TimelineAvatar>
                  )}
                  
                  <TimelineDetails>
                    <Typography variant="subtitle2" noWrap>
                      {stage.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" noWrap>
                      {stage.organization}
                    </Typography>
                    {(isCompleted || isCurrent) && stage.experiencePoints && (
                      <ExperienceChip 
                        size="small" 
                        icon={<EmojiEventsIcon />} 
                        label={`${stage.experiencePoints} XP`} 
                      />
                    )}
                  </TimelineDetails>
                  
                  {stage.startDate && (
                    <DateBadge>
                      {stage.startDate}
                      {stage.endDate && ` - ${stage.endDate}`}
                    </DateBadge>
                  )}
                </TimelineStage>
              );
            })}
          </TimelineWrapper>
        </TimelineContainer>
        
        {/* Stage Details Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedStage && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {selectedStage.title}
                  <IconButton onClick={handleCloseDialog} size="small">
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        {selectedStage.organization}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {selectedStage.location && (
                          <Chip 
                            icon={<LocationOnIcon />} 
                            label={selectedStage.location} 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                        {selectedStage.type && (
                          <Chip 
                            icon={selectedStage.type === 'education' ? <SchoolIcon /> : <WorkIcon />} 
                            label={selectedStage.type} 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                        {selectedStage.startDate && (
                          <Chip 
                            icon={<CalendarMonthIcon />} 
                            label={`${selectedStage.startDate} ${selectedStage.endDate ? `- ${selectedStage.endDate}` : ''}`} 
                            size="small" 
                            variant="outlined" 
                          />
                        )}
                      </Box>
                      
                      <Typography variant="body1" paragraph>
                        {selectedStage.description}
                      </Typography>
                    </Box>
                    
                    {/* Key Achievements */}
                    {selectedStage.achievements && selectedStage.achievements.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Key Achievements
                        </Typography>
                        <List dense>
                          {selectedStage.achievements.map((achievement, i) => (
                            <ListItem key={i}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <StarIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={achievement} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    {/* Skills Gained */}
                    {selectedStage.skills && selectedStage.skills.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          Skills Gained
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedStage.skills.map((skill, i) => (
                            <Chip 
                              key={i}
                              icon={skillIcons[skill.type] || <StarIcon />}
                              label={skill.name}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Assessments Section */}
                    {selectedStage.assessments && selectedStage.assessments.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Stage Assessments
                        </Typography>
                        <List dense>
                          {selectedStage.assessments.map((assessment, i) => (
                            <ListItem key={i}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                {assessment.completed ? 
                                  <CheckCircleIcon fontSize="small" color="success" /> : 
                                  <AssessmentIcon fontSize="small" color="warning" />}
                              </ListItemIcon>
                              <ListItemText 
                                primary={assessment.title} 
                                secondary={assessment.description}
                              />
                              {!assessment.completed && selectedStage.isCurrent && (
                                <Button 
                                  size="small" 
                                  variant="outlined" 
                                  color="primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAssessmentClick(assessment);
                                  }}
                                >
                                  Take Assessment
                                </Button>
                              )}
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Progress
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                          Status:
                        </Typography>
                        <Chip 
                          label={selectedStage.isCompleted ? 'Completed' : (selectedStage.isCurrent ? 'Current' : 'Upcoming')} 
                          size="small"
                          color={selectedStage.isCompleted ? 'success' : (selectedStage.isCurrent ? 'primary' : 'default')}
                        />
                      </Box>
                      
                      {selectedStage.experiencePoints && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                            XP Earned:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {selectedStage.experiencePoints} points
                          </Typography>
                        </Box>
                      )}

                      {selectedStage.duration && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                            Duration:
                          </Typography>
                          <Typography variant="body2">
                            {selectedStage.duration}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                    
                    {selectedStage.nextSteps && (
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Next Steps
                        </Typography>
                        <List dense>
                          {selectedStage.nextSteps.map((step, i) => (
                            <ListItem key={i}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <ArrowForwardIcon fontSize="small" color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={step} />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Assessment Dialog */}
        <Dialog
          open={assessmentDialogOpen}
          onClose={handleCloseAssessmentDialog}
          maxWidth="sm"
          fullWidth
        >
          {selectedAssessment && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {selectedAssessment.title}
                  <IconButton onClick={handleCloseAssessmentDialog} size="small">
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" paragraph>
                    {selectedAssessment.description}
                  </Typography>
                  
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'warning.main' }}>
                        {assessmentTypes[selectedAssessment.type]?.icon || <AssessmentIcon />}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {assessmentTypes[selectedAssessment.type]?.label || 'Assessment'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Due: {new Date(selectedAssessment.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" paragraph>
                      This assessment is required for your career progression. 
                      Completing it will unlock new skills and opportunities.
                    </Typography>
                    
                    {selectedAssessment.estimatedTime && (
                      <Chip 
                        size="small" 
                        icon={<AccessAlarmIcon />} 
                        label={`Estimated time: ${selectedAssessment.estimatedTime}`}
                        sx={{ mr: 1 }}
                      />
                    )}
                    
                    {selectedAssessment.difficulty && (
                      <Chip 
                        size="small" 
                        icon={<StarIcon />} 
                        label={`Difficulty: ${selectedAssessment.difficulty}`}
                      />
                    )}
                  </Paper>
                </Box>
                
                {selectedAssessment.steps && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      Assessment Steps
                    </Typography>
                    <List dense>
                      {selectedAssessment.steps.map((step, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Chip size="small" label={index + 1} color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseAssessmentDialog}>Cancel</Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => handleCompleteAssessment(selectedAssessment.id)}
                >
                  Start Assessment
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CareerJourneyTimeline;
