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
  Zoom
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

// Icons mapping for different skill types
const skillIcons = {
  technical: <CodeIcon fontSize="small" />,
  soft: <PeopleIcon fontSize="small" />,
  analytical: <AnalyticsIcon fontSize="small" />,
  creative: <LightbulbIcon fontSize="small" />
};

const CareerJourneyTimeline = ({ journeyData }) => {
  const [selectedStage, setSelectedStage] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  
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
  
  // Handle opening details dialog
  const handleStageClick = (stage) => {
    setSelectedStage(stage);
    setDialogOpen(true);
  };
  
  // Handle closing dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
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
        
        {/* Interactive Timeline */}
        <TimelineContainer>
          <TimelineWrapper>
            {safeJourneyData.map((stage, index) => {
              const isCompleted = stage.isCompleted;
              const isCurrent = stage.isCurrent;
              const isUpcoming = !isCompleted && !isCurrent;
              
              return (
                <TimelineStage 
                  key={index}
                  onClick={() => isCompleted || isCurrent ? handleStageClick(stage) : null}
                  variants={stageAnimationVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                  whileHover={isCompleted || isCurrent ? { y: -10 } : {}}
                  sx={{ 
                    opacity: isUpcoming ? 0.6 : 1,
                    cursor: isUpcoming ? 'default' : 'pointer'
                  }}
                >
                  {/* Connector line between stages */}
                  {index > 0 && (
                    <TimelineConnector 
                      filled={safeJourneyData[index-1].isCompleted || safeJourneyData[index-1].isCurrent}
                    />
                  )}
                  
                  {/* Stage type tag */}
                  <StageTag type={stage.type}>
                    {stage.type}
                  </StageTag>
                  
                  {/* Stage avatar/icon */}
                  <Zoom in={true} style={{ transitionDelay: `${index * 200}ms` }}>
                    <TimelineAvatar 
                      active={isCurrent} 
                      completed={isCompleted}
                    >
                      {stage.type === 'job' && <WorkIcon />}
                      {stage.type === 'education' && <SchoolIcon />}
                      {stage.type === 'promotion' && <StarIcon />}
                      {stage.type === 'project' && <BusinessIcon />}
                    </TimelineAvatar>
                  </Zoom>
                  
                  {/* Stage details */}
                  <TimelineDetails>
                    <Typography 
                      variant="subtitle2" 
                      fontWeight="bold"
                      sx={{
                        color: isUpcoming ? 'text.disabled' : 'text.primary'
                      }}
                    >
                      {stage.title}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      color={isUpcoming ? 'text.disabled' : 'text.secondary'}
                    >
                      {stage.organization}
                    </Typography>
                    
                    {/* XP gained */}
                    {(isCompleted || isCurrent) && stage.experiencePoints > 0 && (
                      <ExperienceChip
                        icon={<EmojiEventsIcon />}
                        label={`+${stage.experiencePoints} XP`}
                        size="small"
                      />
                    )}
                  </TimelineDetails>
                  
                  {/* Date badge */}
                  <DateBadge>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarMonthIcon sx={{ fontSize: 12, mr: 0.5 }} />
                      {stage.date}
                    </Box>
                  </DateBadge>
                </TimelineStage>
              );
            })}
          </TimelineWrapper>
        </TimelineContainer>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="outlined" 
            size="small" 
            endIcon={<TimelineIcon />}
          >
            View Full Career History
          </Button>
        </Box>
        
        {/* Stage Details Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedStage && (
            <>
              <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    {selectedStage.title}
                  </Typography>
                  <IconButton edge="end" onClick={handleCloseDialog} aria-label="close">
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 56, 
                          height: 56, 
                          bgcolor: selectedStage.isCompleted ? 'success.light' : 'primary.main',
                          mr: 2
                        }}
                      >
                        {selectedStage.type === 'job' && <WorkIcon />}
                        {selectedStage.type === 'education' && <SchoolIcon />}
                        {selectedStage.type === 'promotion' && <StarIcon />}
                        {selectedStage.type === 'project' && <BusinessIcon />}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{selectedStage.title}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                          {selectedStage.organization}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <CalendarMonthIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {selectedStage.startDate} - {selectedStage.endDate || 'Present'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Typography variant="body1" paragraph>
                      {selectedStage.description}
                    </Typography>
                    
                    {selectedStage.achievements && selectedStage.achievements.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Key Achievements
                        </Typography>
                        <List>
                          {selectedStage.achievements.map((achievement, index) => (
                            <ListItem key={index} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <StarIcon color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={achievement} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    {selectedStage.skillsGained && selectedStage.skillsGained.length > 0 && (
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Skills Gained
                        </Typography>
                        <Grid container spacing={1}>
                          {selectedStage.skillsGained.map((skill, index) => (
                            <Grid item key={index}>
                              <Chip 
                                icon={skillIcons[skill.type] || <StarIcon fontSize="small" />}
                                label={skill.name} 
                                variant="outlined"
                                color="primary"
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Experience Gained
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        p: 2,
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        borderRadius: 2
                      }}>
                        <EmojiEventsIcon sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h4" fontWeight="bold">
                          +{selectedStage.experiencePoints} XP
                        </Typography>
                        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                          {selectedStage.xpDescription || 'Experience points earned during this career stage'}
                        </Typography>
                      </Box>
                    </Paper>
                    
                    {selectedStage.impact && (
                      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Impact
                        </Typography>
                        <Box sx={{ pl: 1 }}>
                          <Typography variant="body2" paragraph>
                            {selectedStage.impact}
                          </Typography>
                        </Box>
                      </Paper>
                    )}
                    
                    {selectedStage.location && (
                      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Location
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {selectedStage.location}
                          </Typography>
                        </Box>
                      </Paper>
                    )}
                    
                    {selectedStage.team && (
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Team
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <PeopleIcon color="primary" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {selectedStage.team}
                          </Typography>
                        </Box>
                      </Paper>
                    )}
                  </Grid>
                </Grid>
                
                {selectedStage.nextCareerStep && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
                      <ArrowForwardIcon sx={{ mr: 1 }} />
                      Next Career Step
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {selectedStage.nextCareerStep}
                    </Typography>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
                {selectedStage.detailsUrl && (
                  <Button 
                    color="primary" 
                    variant="contained"
                    onClick={() => window.open(selectedStage.detailsUrl, '_blank')}
                  >
                    View Full Details
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CareerJourneyTimeline;
