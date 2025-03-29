import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Grid,
  Paper,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  LinearProgress,
  Tooltip,
  Alert,
  Menu,
  MenuItem,
  Badge
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkIcon from '@mui/icons-material/Work';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TimelineIcon from '@mui/icons-material/Timeline';
import SpeedIcon from '@mui/icons-material/Speed';
import BarChartIcon from '@mui/icons-material/BarChart';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StarIcon from '@mui/icons-material/Star';
import LockIcon from '@mui/icons-material/Lock';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import FilterListIcon from '@mui/icons-material/FilterList';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DashboardAPI from '../../api/DashboardAPI';

// Styled components for the learning path map
const LearningTrackContainer = styled(Box)(({ theme }) => ({
  overflowX: 'auto',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(3, 0),
  position: 'relative'
}));

const TrackNode = styled(Paper)(({ theme, nodeType, completed }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: 120,
  height: 120,
  borderRadius: '50%',
  position: 'relative',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  cursor: 'pointer',
  backgroundColor: completed ? theme.palette.success.light : theme.palette.background.paper,
  border: `2px solid ${
    nodeType === 'skill' ? theme.palette.primary.main :
    nodeType === 'course' ? theme.palette.secondary.main :
    nodeType === 'quiz' ? theme.palette.warning.main :
    nodeType === 'project' ? theme.palette.success.main :
    theme.palette.grey[300]
  }`,
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6]
  }
}));

const TrackConnector = styled(Box)(({ theme, completed }) => ({
  position: 'absolute',
  height: 3,
  backgroundColor: completed ? theme.palette.success.main : theme.palette.divider,
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 0
}));

const ProgressBadge = styled(Badge)(({ theme, progress }) => ({
  '& .MuiBadge-badge': {
    width: 26,
    height: 26,
    borderRadius: '50%',
    backgroundColor: 
      progress >= 100 ? theme.palette.success.main :
      progress >= 50 ? theme.palette.warning.main :
      theme.palette.info.main,
    color: theme.palette.common.white,
    fontSize: 12,
    fontWeight: 'bold'
  }
}));

const WeeklyProgressBar = styled(Box)(({ theme, day, completed }) => ({
  width: 12,
  height: 40,
  borderRadius: 6,
  backgroundColor: theme.palette.grey[200],
  position: 'relative',
  overflow: 'hidden',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: completed ? '100%' : '0%',
    backgroundColor: theme.palette.primary.main,
    transition: 'height 1s ease'
  }
}));

const WeekdayLabel = styled(Typography)(({ theme, istoday }) => ({
  padding: theme.spacing(1, 0),
  color: istoday === 'true' ? theme.palette.primary.main : theme.palette.text.secondary,
  fontWeight: istoday === 'true' ? 'bold' : 'normal'
}));

const OptimizationCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: 5,
    height: '100%',
    backgroundColor: theme.palette.primary.main
  }
}));

const Milestone = styled(Box)(({ theme, completed }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  opacity: completed ? 1 : 0.7,
}));

// Get icon based on node type
const getNodeIcon = (type, completed) => {
  switch (type) {
    case 'skill':
      return <CodeIcon fontSize="large" color={completed ? "success" : "primary"} />;
    case 'course':
      return <SchoolIcon fontSize="large" color={completed ? "success" : "secondary"} />;
    case 'quiz':
      return <QuizIcon fontSize="large" color={completed ? "success" : "warning"} />;
    case 'project':
      return <AssignmentIcon fontSize="large" color={completed ? "success" : "success"} />;
    default:
      return <CodeIcon fontSize="large" color={completed ? "success" : "primary"} />;
  }
};

const PersonalizedLearningPaths = ({ learningPathsData, userProfile }) => {
  const [selectedPath, setSelectedPath] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [optimizationDialogOpen, setOptimizationDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [aiOptimization, setAiOptimization] = useState(null);
  const [weeklyProgressDone, setWeeklyProgressDone] = useState(true);
  
  // Current date information for weekly tracker
  const currentDate = new Date();
  const currentDay = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  
  // Effect to set selected path when data becomes available
  useEffect(() => {
    if (learningPathsData && learningPathsData.paths && learningPathsData.paths.length > 0) {
      setSelectedPath(learningPathsData.paths[0]);
    }
  }, [learningPathsData]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setSelectedPath(learningPathsData.paths[newValue]);
  };
  
  // Handle node click
  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setDialogOpen(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setOptimizationDialogOpen(false);
  };
  
  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Generate AI path optimization
  const generateOptimizedPath = async () => {
    setLoading(true);
    handleMenuClose();
    
    try {
      // In a real app, call an API
      // const response = await DashboardAPI.generateOptimizedPath(userProfile.dreamJob);
      
      // Simulated API response
      setTimeout(() => {
        setAiOptimization({
          targetJob: userProfile?.dreamJob || 'Senior Software Engineer',
          currentSkillLevel: 65,
          requiredSkillLevel: 85,
          estimatedTimeToTarget: '6 months',
          suggestedPath: [
            {
              name: 'Advanced JavaScript Patterns',
              type: 'course',
              duration: '3 weeks',
              importance: 'Critical',
              relevance: 92,
              description: 'Master advanced JavaScript concepts including closures, prototypes, and async patterns.'
            },
            {
              name: 'System Design for Web Applications',
              type: 'course',
              duration: '4 weeks',
              importance: 'High',
              relevance: 88,
              description: 'Learn how to design scalable, maintainable web application architectures.'
            },
            {
              name: 'Database Optimization Project',
              type: 'project',
              duration: '2 weeks',
              importance: 'Medium',
              relevance: 76,
              description: 'Practice optimizing database queries and improving data access patterns.'
            },
            {
              name: 'DevOps and CI/CD Fundamentals',
              type: 'course',
              duration: '3 weeks',
              importance: 'High',
              relevance: 85,
              description: 'Understand continuous integration, delivery, and deployment workflows.'
            },
            {
              name: 'Technical Leadership Skills',
              type: 'course',
              duration: '2 weeks',
              importance: 'Medium',
              relevance: 78,
              description: 'Develop skills for leading technical teams and mentoring junior developers.'
            }
          ],
          skillsToFocus: [
            'System Architecture', 
            'Performance Optimization', 
            'Technical Leadership',
            'Advanced JavaScript'
          ],
          reasoning: 'Based on your current skill profile and career history, the fastest path to becoming a Senior Software Engineer requires strengthening your architectural knowledge and leadership capabilities. Your technical skills are already strong, but advancing to senior level typically requires deeper system design understanding and the ability to lead projects and mentor others.'
        });
        
        setOptimizationDialogOpen(true);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error generating optimized path:', error);
      setLoading(false);
    }
  };
  
  // Get progress for a learning path
  const getPathProgress = (path) => {
    if (!path || !path.nodes) return 0;
    
    const completedNodes = path.nodes.filter(node => node.completed).length;
    return Math.round((completedNodes / path.nodes.length) * 100);
  };
  
  // Check if a track node is locked (unavailable)
  const isNodeLocked = (node, index, nodes) => {
    if (index === 0) return false;
    return !nodes[index - 1].completed;
  };
  
  // Render learning track map
  const renderLearningTrack = () => {
    if (!selectedPath || !selectedPath.nodes) return null;
    
    return (
      <LearningTrackContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minWidth: 600 }}>
          {selectedPath.nodes.map((node, index) => {
            const nodeLeft = index * 180 + 50;
            const isLocked = isNodeLocked(node, index, selectedPath.nodes);
            
            return (
              <React.Fragment key={index}>
                {index > 0 && (
                  <TrackConnector 
                    data-completed={selectedPath.nodes[index - 1].completed.toString()}
                    sx={{ 
                      left: (nodeLeft - 90),
                      width: 60 
                    }}
                  />
                )}
                
                <Box sx={{ position: 'absolute', left: nodeLeft, zIndex: 1 }}>
                  <Tooltip title={isLocked ? "Complete previous steps to unlock" : node.title}>
                    <Box>
                      <TrackNode 
                        nodeType={node.type} 
                        data-completed={node.completed.toString()}
                        onClick={() => !isLocked && handleNodeClick(node)}
                        sx={{ 
                          opacity: isLocked ? 0.6 : 1,
                          cursor: isLocked ? 'default' : 'pointer'
                        }}
                      >
                        {isLocked ? (
                          <LockIcon fontSize="large" color="action" />
                        ) : (
                          getNodeIcon(node.type, node.completed)
                        )}
                        <Typography 
                          variant="body2" 
                          align="center" 
                          fontWeight="bold"
                          sx={{ mt: 1 }}
                        >
                          {node.title}
                        </Typography>
                        <Chip 
                          label={node.type} 
                          size="small" 
                          color={
                            node.type === 'skill' ? "primary" :
                            node.type === 'course' ? "secondary" :
                            node.type === 'quiz' ? "warning" :
                            "success"
                          }
                          sx={{ position: 'absolute', bottom: -10 }}
                        />
                      </TrackNode>
                    </Box>
                  </Tooltip>
                </Box>
              </React.Fragment>
            );
          })}
        </Box>
      </LearningTrackContainer>
    );
  };
  
  // Render weekly progress tracker
  const renderWeeklyProgressTracker = () => {
    const dayActivities = [
      { day: 'Su', completed: true, minutes: 45 },
      { day: 'Mo', completed: true, minutes: 60 },
      { day: 'Tu', completed: true, minutes: 30 },
      { day: 'We', completed: currentDay > 3, minutes: 0 },
      { day: 'Th', completed: currentDay > 4, minutes: 0 },
      { day: 'Fr', completed: currentDay > 5, minutes: 0 },
      { day: 'Sa', completed: currentDay > 6, minutes: 0 }
    ];
    
    const completedDays = dayActivities.filter(day => day.completed).length;
    const weekProgress = Math.round((completedDays / 7) * 100);
    
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1">Weekly Progress</Typography>
          <Chip 
            icon={<BarChartIcon />} 
            label={`${weekProgress}%`} 
            color={weekProgress >= 70 ? "success" : "primary"}
            size="small"
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          {dayActivities.map((day, index) => (
            <Box 
              key={index} 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' 
              }}
            >
              <WeekdayLabel istoday={(index === currentDay).toString()}>
                {day.day}
              </WeekdayLabel>
              
              <WeeklyProgressBar 
                day={day.day} 
                data-completed={index <= currentDay ? "true" : "false"}
                sx={{ 
                  mx: 0.5 
                }} 
              />
              
              <Box sx={{ mt: 0.5, height: 18, display: 'flex', alignItems: 'center' }}>
                {day.completed ? (
                  <CheckCircleIcon 
                    fontSize="small" 
                    color="success" 
                    sx={{ fontSize: 16 }}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    -
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {weeklyProgressDone ? (
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                Daily goal reached
              </Box>
            ) : (
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                30 minutes left today
              </Box>
            )}
          </Typography>
          
          <Button 
            size="small" 
            variant="outlined" 
            endIcon={<PlayArrowIcon />}
            color={weeklyProgressDone ? "success" : "primary"}
          >
            {weeklyProgressDone ? "Continue Learning" : "Start Today's Session"}
          </Button>
        </Box>
      </Paper>
    );
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Personalized Learning Paths
          </Typography>
          <Box>
            <IconButton 
              color="primary" 
              onClick={handleMenuOpen}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <MoreVertIcon />
              )}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={generateOptimizedPath}>
                <ListItemIcon>
                  <PsychologyIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="AI Path Optimization" />
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <ShuffleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Explore New Paths" />
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <FilterListIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Filter Skills" />
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {/* Learning Path Tabs */}
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2 }}
        >
          {learningPathsData?.paths?.map((path, index) => (
            <Tab 
              key={index} 
              label={path.title} 
              icon={
                <ProgressBadge 
                  badgeContent={`${getPathProgress(path)}%`} 
                  progress={getPathProgress(path)}
                >
                  {path.icon === 'work' ? <WorkIcon /> : 
                   path.icon === 'code' ? <CodeIcon /> : 
                   path.icon === 'school' ? <SchoolIcon /> : 
                   <SchoolIcon />}
                </ProgressBadge>
              }
              iconPosition="start"
            />
          ))}
        </Tabs>
        
        {/* Selected Path Details */}
        {selectedPath && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {selectedPath.title} Path
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {selectedPath.description}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="body2">
                  Progress: {getPathProgress(selectedPath)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={getPathProgress(selectedPath)} 
                  sx={{ mt: 0.5, height: 6, borderRadius: 3, width: 200 }} 
                />
              </Box>
              
              <Box>
                <Chip 
                  icon={<CalendarTodayIcon />} 
                  label={`Estimated: ${selectedPath.estimatedTime}`} 
                  variant="outlined" 
                  size="small"
                />
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Learning Track Map */}
        {renderLearningTrack()}
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          {/* Weekly Progress Tracker */}
          <Grid item xs={12} md={6}>
            {renderWeeklyProgressTracker()}
          </Grid>
          
          {/* AI Quick Suggestions */}
          <Grid item xs={12} md={6}>
            <OptimizationCard>
              <Box sx={{ pl: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <PsychologyIcon sx={{ mr: 1 }} />
                  AI Path Optimization
                </Typography>
                <Typography variant="body2" paragraph>
                  Want to reach your dream job faster? Let our AI analyze your skills and suggest the optimal learning path.
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Your dream job: {userProfile?.dreamJob || 'Senior Software Engineer'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SpeedIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Current progress: 65% of required skills
                    </Typography>
                  </Box>
                </Box>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AutoFixHighIcon />}
                  onClick={generateOptimizedPath}
                  disabled={loading}
                >
                  {loading ? "Analyzing..." : "Generate Optimal Path"}
                </Button>
              </Box>
            </OptimizationCard>
          </Grid>
        </Grid>
        
        {/* Track Node Detail Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedNode && (
            <>
              <DialogTitle>
                {selectedNode.title}
                <Chip 
                  label={selectedNode.type} 
                  size="small" 
                  color={
                    selectedNode.type === 'skill' ? "primary" :
                    selectedNode.type === 'course' ? "secondary" :
                    selectedNode.type === 'quiz' ? "warning" :
                    "success"
                  }
                  sx={{ ml: 1 }}
                />
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="subtitle1" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {selectedNode.description}
                    </Typography>
                    
                    {selectedNode.objectives && (
                      <>
                        <Typography variant="subtitle1" gutterBottom>
                          Learning Objectives
                        </Typography>
                        <List dense>
                          {selectedNode.objectives.map((objective, index) => (
                            <ListItem key={index}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <CheckCircleIcon color="primary" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={objective} />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                    
                    {selectedNode.type === 'course' && selectedNode.curriculum && (
                      <>
                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                          Curriculum
                        </Typography>
                        <List>
                          {selectedNode.curriculum.map((item, index) => (
                            <ListItem key={index}>
                              <ListItemAvatar>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: item.completed ? 'success.light' : 'primary.light',
                                    width: 32,
                                    height: 32
                                  }}
                                >
                                  {index + 1}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText 
                                primary={item.title} 
                                secondary={`${item.duration} • ${item.type}`}
                              />
                              {item.completed ? (
                                <CheckCircleIcon color="success" />
                              ) : (
                                <Button 
                                  variant="outlined" 
                                  size="small" 
                                  startIcon={<PlayArrowIcon />}
                                >
                                  Start
                                </Button>
                              )}
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Details
                      </Typography>
                      
                      <List dense disablePadding>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CalendarTodayIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Duration" 
                            secondary={selectedNode.duration || '2 weeks'} 
                          />
                        </ListItem>
                        
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <StarIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Difficulty" 
                            secondary={selectedNode.difficulty || 'Intermediate'} 
                          />
                        </ListItem>
                        
                        {selectedNode.xpPoints && (
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <EmojiEventsIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="XP Points" 
                              secondary={`+${selectedNode.xpPoints} XP on completion`} 
                            />
                          </ListItem>
                        )}
                        
                        {selectedNode.instructor && (
                          <ListItem sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <SchoolIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Instructor" 
                              secondary={selectedNode.instructor} 
                            />
                          </ListItem>
                        )}
                      </List>
                    </Paper>
                    
                    {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 && (
                      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Prerequisites
                        </Typography>
                        <List dense disablePadding>
                          {selectedNode.prerequisites.map((prereq, index) => (
                            <ListItem key={index} sx={{ px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                {prereq.completed ? (
                                  <CheckCircleIcon fontSize="small" color="success" />
                                ) : (
                                  <ArrowForwardIcon fontSize="small" color="action" />
                                )}
                              </ListItemIcon>
                              <ListItemText 
                                primary={prereq.title} 
                                primaryTypographyProps={{
                                  color: prereq.completed ? 'text.primary' : 'text.secondary'
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    )}
                    
                    {selectedNode.type === 'project' && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        This project will showcase the skills you've learned and can be added to your portfolio.
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
                {!selectedNode.completed && (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<PlayArrowIcon />}
                  >
                    {selectedNode.type === 'skill' ? 'Start Learning' :
                     selectedNode.type === 'course' ? 'Start Course' :
                     selectedNode.type === 'quiz' ? 'Take Quiz' :
                     'Start Project'}
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
        
        {/* AI Path Optimization Dialog */}
        <Dialog
          open={optimizationDialogOpen}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {aiOptimization && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PsychologyIcon sx={{ mr: 1 }} />
                  AI-Optimized Path to {aiOptimization.targetJob}
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        AI Analysis
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {aiOptimization.reasoning}
                      </Typography>
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Recommended Learning Path
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Estimated time to reach target job: <strong>{aiOptimization.estimatedTimeToTarget}</strong>
                      </Typography>
                    </Alert>
                    
                    <Stepper orientation="vertical">
                      {aiOptimization.suggestedPath.map((step, index) => (
                        <Step key={index} active>
                          <StepLabel
                            StepIconComponent={() => (
                              <Avatar sx={{ 
                                width: 32, 
                                height: 32, 
                                bgcolor: 
                                  step.type === 'course' ? 'secondary.main' : 
                                  step.type === 'project' ? 'success.main' : 
                                  'primary.main' 
                              }}>
                                {step.type === 'course' ? <SchoolIcon /> : 
                                 step.type === 'project' ? <AssignmentIcon /> : 
                                 <CodeIcon />}
                              </Avatar>
                            )}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body1" fontWeight="medium">
                                {step.name}
                              </Typography>
                              <Chip 
                                label={`${step.relevance}% match`} 
                                size="small" 
                                color="primary" 
                                sx={{ ml: 1 }} 
                              />
                            </Box>
                          </StepLabel>
                          <StepContent>
                            <Typography variant="body2">
                              {step.description}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Duration: {step.duration}
                              </Typography>
                              <Typography variant="caption" sx={{ 
                                fontWeight: 'bold',
                                color: 
                                  step.importance === 'Critical' ? 'error.main' :
                                  step.importance === 'High' ? 'warning.main' :
                                  'info.main'
                              }}>
                                {step.importance} priority
                              </Typography>
                            </Box>
                          </StepContent>
                        </Step>
                      ))}
                    </Stepper>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Path Overview
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Current Skill Level
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={aiOptimization.currentSkillLevel} 
                            sx={{ height: 8, borderRadius: 4, flexGrow: 1, mr: 1 }} 
                          />
                          <Typography variant="body2" fontWeight="bold">
                            {aiOptimization.currentSkillLevel}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          Required Skill Level
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={aiOptimization.requiredSkillLevel} 
                            color="secondary"
                            sx={{ height: 8, borderRadius: 4, flexGrow: 1, mr: 1 }} 
                          />
                          <Typography variant="body2" fontWeight="bold" color="secondary.main">
                            {aiOptimization.requiredSkillLevel}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Skills to Focus On
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {aiOptimization.skillsToFocus.map((skill, index) => (
                          <Chip 
                            key={index} 
                            label={skill} 
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Paper>
                    
                    <Button 
                      variant="contained" 
                      color="primary"
                      fullWidth
                      startIcon={<TravelExploreIcon />}
                    >
                      Add This Path to My Learning
                    </Button>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PersonalizedLearningPaths;
