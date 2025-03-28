import React, { useState, useEffect, useRef } from 'react';
import {
  Container, 
  Grid, 
  Typography, 
  Box, 
  Paper, 
  CircularProgress, 
  IconButton, 
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  Alert,
  Tooltip,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  LinearProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import { motion } from 'framer-motion';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Link as RouterLink } from 'react-router-dom';
import { format, formatDistance } from 'date-fns';

// Icons
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import CheckIcon from '@mui/icons-material/Check';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DescriptionIcon from '@mui/icons-material/Description';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SchoolIcon from '@mui/icons-material/School';
import TimelineIcon from '@mui/icons-material/Timeline';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

// Import API clients
import { api } from '../api/apiClient';
import chatService from '../api/chatgpt';

// Import components
import UserProgressCard from '../components/Dashboard/UserProgressCard';
import SkillProgressSection from '../components/Dashboard/SkillProgressSection';
import ResumeScoreChart from '../components/Dashboard/ResumeScoreChart';
import CareerPathsSection from '../components/Dashboard/CareerPathsSection';
import MarketInsightsSection from '../components/Dashboard/MarketInsightsSection';
import BadgesSection from '../components/Dashboard/BadgesSection';
import ActivityLogSection from '../components/Dashboard/ActivityLogSection';
import CareerPredictionSection from '../components/Dashboard/CareerPredictionSection';
import LeaderboardWidget from '../components/Dashboard/LeaderboardWidget';
import AIRecommendationCard from '../components/Dashboard/AIRecommendationCard';
import SkillGapAnalysis from '../components/Dashboard/SkillGapAnalysis';
import CareerJourneyTimeline from '../components/Dashboard/CareerJourneyTimeline';
import PersonalizedLearningPaths from '../components/Dashboard/PersonalizedLearningPaths';
import OpportunityAlertCard from '../components/Dashboard/OpportunityAlertCard';
import LearningRoadmap from '../components/Dashboard/LearningRoadmap';

// Import context
import { useUser } from '../context/AppContext';

// Mock data (will be replaced with API calls)
import mockDashboardData from '../utils/mockData/dashboardData';

// Define dashboard widgets
const widgetMap = {
  userProgress: {
    id: 'userProgress',
    title: 'Your Progress',
    component: UserProgressCard,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 0
  },
  resumeScore: {
    id: 'resumeScore',
    title: 'Resume Score',
    component: ResumeScoreChart,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 1
  },
  skillGap: {
    id: 'skillGap',
    title: 'Skill Gap Analysis',
    component: SkillGapAnalysis,
    defaultSize: { xs: 12, md: 6 },
    defaultOrder: 2
  },
  aiRecommendation: {
    id: 'aiRecommendation',
    title: 'AI Recommendations',
    component: AIRecommendationCard,
    defaultSize: { xs: 12, md: 6 },
    defaultOrder: 3
  },
  careerJourney: {
    id: 'careerJourney',
    title: 'Career Journey',
    component: CareerJourneyTimeline,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 4
  },
  badges: {
    id: 'badges',
    title: 'Achievements',
    component: BadgesSection,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 5
  },
  careerPrediction: {
    id: 'careerPrediction',
    title: 'Career Predictions',
    component: CareerPredictionSection,
    defaultSize: { xs: 12, md: 6 },
    defaultOrder: 6
  },
  learningPaths: {
    id: 'learningPaths',
    title: 'Learning Paths',
    component: PersonalizedLearningPaths,
    defaultSize: { xs: 12, md: 6 },
    defaultOrder: 7
  },
  marketInsights: {
    id: 'marketInsights',
    title: 'Market Insights',
    component: MarketInsightsSection,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 8
  },
  leaderboard: {
    id: 'leaderboard',
    title: 'Leaderboard',
    component: LeaderboardWidget,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 9
  },
  activityLog: {
    id: 'activityLog',
    title: 'Recent Activities',
    component: ActivityLogSection,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 10
  },
  opportunityAlert: {
    id: 'opportunityAlert',
    title: 'Opportunity Alerts',
    component: OpportunityAlertCard,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 11
  },
  learningRoadmap: {
    id: 'learningRoadmap',
    title: 'Learning Roadmap',
    component: LearningRoadmap,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 12
  }
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 100
    }
  }
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardLayout, setDashboardLayout] = useState(null);
  const [hiddenWidgets, setHiddenWidgets] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [quickStatsMenuAnchor, setQuickStatsMenuAnchor] = useState(null);
  const { profile, user } = useUser();
  
  // Get dummy data for additional widgets 
  // This would normally come from the API
  const todaysSchedule = dashboardData?.todaysSchedule || [];
  const weeklyGoals = dashboardData?.weeklyGoals || [];
  const jobRecommendations = dashboardData?.jobRecommendations || [];
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
    const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Attempt to get data from API
      try {
        const response = await api.get('/dashboard/data');
        setDashboardData(response.data.data);
      } catch (err) {
        console.warn('Using mock data due to API error:', err);
        // Fall back to mock data
        setDashboardData(mockDashboardData);
      }
      
      // Load saved layout if available
      const savedLayout = localStorage.getItem('dashboardLayout');
      const savedHidden = localStorage.getItem('hiddenWidgets');
      
      if (savedLayout) {
        setDashboardLayout(JSON.parse(savedLayout));
          } else {
        // Default layout
        const defaultLayout = Object.values(widgetMap)
          .sort((a, b) => a.defaultOrder - b.defaultOrder)
          .map(widget => widget.id);
        setDashboardLayout(defaultLayout);
      }
      
      if (savedHidden) {
        setHiddenWidgets(JSON.parse(savedHidden));
      }
      
      setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
  // Handle drag end for widget reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(dashboardLayout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setDashboardLayout(items);
    localStorage.setItem('dashboardLayout', JSON.stringify(items));
  };
  
  // Toggle widget visibility
  const toggleWidgetVisibility = (widgetId) => {
    let newHiddenWidgets;
    
    if (hiddenWidgets.includes(widgetId)) {
      newHiddenWidgets = hiddenWidgets.filter(id => id !== widgetId);
    } else {
      newHiddenWidgets = [...hiddenWidgets, widgetId];
    }
    
    setHiddenWidgets(newHiddenWidgets);
    localStorage.setItem('hiddenWidgets', JSON.stringify(newHiddenWidgets));
  };
  
  // Reset dashboard layout to default
  const resetDashboardLayout = () => {
    const defaultLayout = Object.values(widgetMap)
      .sort((a, b) => a.defaultOrder - b.defaultOrder)
      .map(widget => widget.id);
    
    setDashboardLayout(defaultLayout);
    setHiddenWidgets([]);
    localStorage.setItem('dashboardLayout', JSON.stringify(defaultLayout));
    localStorage.setItem('hiddenWidgets', JSON.stringify([]));
  };
  
  // Refresh dashboard data
  const refreshDashboard = async () => {
    setLoading(true);
    try {
      // Attempt to get fresh data from API
      try {
        const response = await api.get('/dashboard/data');
        setDashboardData(response.data.data);
      } catch (err) {
        console.warn('Using mock data due to API error:', err);
        // Fall back to mock data
        setDashboardData({
          ...mockDashboardData,
          refreshed: true,
          last_updated: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError('Failed to refresh dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Additional functions for other widgets
  
  // Render application statistics
  const renderApplicationStats = () => (
    <Card>
      <CardHeader
        title="Application Statistics"
        action={
          <IconButton onClick={(e) => setQuickStatsMenuAnchor(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
        }
      />
      
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {dashboardData?.applications?.total || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {dashboardData?.applications?.active || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {dashboardData?.applications?.interviews || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interviews
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {dashboardData?.applications?.offers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Offers
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {dashboardData?.applications?.rejected || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main">
                {dashboardData?.applications?.offers > 0 ? 
                  Math.round((dashboardData.applications.offers / dashboardData.applications.total) * 100) : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<FormatListBulletedIcon />}
          component={RouterLink}
          to="/applications"
        >
          View Applications
        </Button>
        
        <Button
          size="small"
          startIcon={<AssessmentIcon />}
          component={RouterLink}
          to="/applications/analytics"
        >
          Analytics
        </Button>
      </CardActions>
    </Card>
  );
  
  // Render upcoming interviews
  const renderUpcomingInterviews = () => (
    <Card>
      <CardHeader title="Upcoming Interviews" />
      
      <CardContent>
        {dashboardData?.upcomingInterviews?.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No upcoming interviews scheduled.
          </Typography>
        ) : (
          <List dense>
            {(dashboardData?.upcomingInterviews || []).slice(0, 3).map((interview, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <BusinessIcon />
                  </Avatar>
                </ListItemIcon>
                
                <ListItemText
                  primary={interview.company}
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {interview.position}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(interview.date), 'PPp')}
                      </Typography>
                    </>
                  }
                />
                
                <Chip 
                  label={interview.type} 
                  size="small"
                  color={interview.type === 'Remote' ? 'info' : 'default'}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<PsychologyIcon />}
          component={RouterLink}
          to="/mock-interview"
        >
          Practice Interview
        </Button>
        
        <Button
          size="small"
          startIcon={<CalendarTodayIcon />}
          component={RouterLink}
          to="/calendar"
        >
          View Calendar
        </Button>
      </CardActions>
    </Card>
  );
  
  // Get icon for event type
  const getEventIcon = (type) => {
    switch (type) {
      case 'Interview':
        return <QuestionAnswerIcon />;
      case 'Meeting':
        return <GroupIcon />;
      case 'Deadline':
        return <AccessAlarmIcon />;
      case 'Networking':
        return <PeopleAltIcon />;
      case 'Learning':
        return <MenuBookIcon />;
      default:
        return <CalendarTodayIcon />;
    }
  };
  
  // Get chip color for event type
  const getEventChipColor = (type) => {
    switch (type) {
      case 'Interview':
        return 'primary';
      case 'Meeting':
        return 'info';
      case 'Deadline':
        return 'error';
      case 'Networking':
        return 'secondary';
      case 'Learning':
        return 'success';
      default:
        return 'default';
    }
  };
  
  // Render today's schedule
  const renderTodaysSchedule = () => (
    <Card>
      <CardHeader 
        title="Today's Schedule"
        subheader={format(new Date(), 'PPPP')}
      />
      
      <CardContent>
        {todaysSchedule.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No events scheduled for today.
          </Typography>
        ) : (
          <List dense>
            {todaysSchedule.map((event, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {getEventIcon(event.type)}
                </ListItemIcon>
                
                <ListItemText
                  primary={event.title}
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(event.startTime), 'p')} - {format(new Date(event.endTime), 'p')}
          </Typography>
                  }
                />
                
              <Chip 
                  label={event.type} 
                size="small"
                  color={getEventChipColor(event.type)}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/calendar/add"
        >
          Add Event
        </Button>
      </CardActions>
    </Card>
  );
  
  // Handle completion of a weekly goal
  const handleCompleteGoal = (goalId) => {
    // This would update the goal completion status in a real app
    console.log(`Goal ${goalId} completed`);
  };
  
  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'application':
        return <DescriptionIcon color="primary" />;
      case 'interview':
        return <QuestionAnswerIcon color="warning" />;
      case 'resume':
        return <AssignmentIcon color="info" />;
      case 'networking':
        return <PeopleAltIcon color="secondary" />;
      case 'learning':
        return <SchoolIcon color="success" />;
      case 'achievement':
        return <EmojiEventsIcon color="error" />;
      default:
        return <TimelineIcon />;
    }
  };
  
  // Simplified handle refresh function
  const handleRefresh = async () => {
    setLoading(true);
    await refreshDashboard();
    setLoading(false);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Debugging component to show any errors
  const renderDebugInfo = () => (
    <Box sx={{ mt: 4, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
      <Typography variant="h6">Debug Information</Typography>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      <Typography variant="subtitle2" sx={{ mt: 2 }}>
        Data loaded: {loading ? 'Loading...' : 'Complete'}
      </Typography>
      <Typography variant="subtitle2" sx={{ mt: 1 }}>
        User info: {user ? JSON.stringify(user) : 'Not logged in'}
      </Typography>
      <Box sx={{ mt: 1, maxHeight: '200px', overflow: 'auto' }}>
        <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
      </Box>
    </Box>
  );
  
  // Main render
  if (loading && !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && !dashboardData) {
  return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={refreshDashboard}>
          Try Again
        </Button>
      </Container>
    );
  }
  
  // Get visible widgets
  const visibleWidgets = dashboardLayout?.filter(id => !hiddenWidgets.includes(id)) || [];
  
  return (
    <Container 
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      maxWidth="xl" 
      sx={{ mt: 4, mb: 8 }}
    >
      {/* Dashboard header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
      <Typography variant="h4" component="h1" gutterBottom>
            Your Career Dashboard
      </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {profile?.firstName || 'there'}! Here's your career progress at a glance.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {error && (
            <Alert severity="error" sx={{ mr: 2 }}>{error}</Alert>
          )}
          
          <Tooltip title="Reset layout">
            <Button 
              variant="outlined" 
              size="small" 
              onClick={resetDashboardLayout}
              sx={{ mr: 1 }}
            >
              Reset Layout
            </Button>
          </Tooltip>
          
          <Tooltip title="Refresh dashboard">
            <IconButton onClick={refreshDashboard} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Widgets hidden notice */}
      {hiddenWidgets.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2">
              {hiddenWidgets.length} widget{hiddenWidgets.length > 1 ? 's' : ''} hidden
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {hiddenWidgets.map(widgetId => (
                <Chip 
                  key={widgetId}
                  label={widgetMap[widgetId].title}
                  size="small"
                  onDelete={() => toggleWidgetVisibility(widgetId)}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Paper>
        </Box>
      )}
      
      {/* Draggable dashboard widgets */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard">
          {(provided) => (
            <Grid 
              container 
              spacing={3}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {visibleWidgets.map((widgetId, index) => {
                const widget = widgetMap[widgetId];
                if (!widget) return null;
                
                const WidgetComponent = widget.component;
                const widgetProps = dashboardData?.[widgetId] || {};
                
                return (
                  <Draggable key={widgetId} draggableId={widgetId} index={index}>
                    {(provided, snapshot) => (
                      <Grid
                        item
                        xs={12}
                        md={widget.defaultSize.md}
                        {...provided.draggableProps}
                        ref={provided.innerRef}
                        component={motion.div}
                        variants={itemVariants}
                      >
                        <Paper 
                          sx={{ 
                            height: '100%',
                            position: 'relative',
                            transition: 'box-shadow 0.3s',
                            boxShadow: snapshot.isDragging ? 8 : 1
                          }}
                        >
                          {/* Drag handle and widget controls */}
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              top: 0, 
                              right: 0, 
                              zIndex: 1,
                              display: 'flex'
                            }}
                          >
                            <IconButton 
                              size="small" 
                              onClick={() => toggleWidgetVisibility(widgetId)}
                              sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                            >
                              <VisibilityOffIcon fontSize="small" />
                            </IconButton>
                            <Box 
                              {...provided.dragHandleProps}
                              sx={{ 
                                cursor: 'grab', 
                                display: 'flex', 
                                alignItems: 'center',
                                opacity: 0.6,
                                '&:hover': { opacity: 1 }
                              }}
                            >
                              <DragIndicatorIcon fontSize="small" />
                            </Box>
                          </Box>
                          
                          {/* Widget content */}
                          <WidgetComponent {...widgetProps} />
                        </Paper>
        </Grid>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
        </Grid>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Hidden widgets section */}
      {hiddenWidgets.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Hidden Widgets
          </Typography>
          <Grid container spacing={2}>
            {hiddenWidgets.map(widgetId => (
              <Grid item xs={6} sm={4} md={3} key={widgetId}>
                <Card 
                  sx={{ 
                    height: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                  onClick={() => toggleWidgetVisibility(widgetId)}
                >
                  <CardContent>
                    <Typography variant="subtitle1" align="center">
                      {widgetMap[widgetId].title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Click to show
                    </Typography>
                  </CardContent>
                </Card>
        </Grid>
            ))}
        </Grid>
      </Box>
      )}
      
      {/* Debug info - only shown in development */}
      {process.env.NODE_ENV === 'development' && renderDebugInfo()}
    </Container>
  );
};

export default Dashboard;