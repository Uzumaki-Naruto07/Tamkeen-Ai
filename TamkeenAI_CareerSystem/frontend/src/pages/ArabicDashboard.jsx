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
  LinearProgress,
  useTheme as useMuiTheme
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import { motion } from 'framer-motion';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { format, formatDistance } from 'date-fns';
import LogoutIcon from '@mui/icons-material/Logout';
import { useTranslation } from 'react-i18next';

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
import { useTheme } from '../contexts/ThemeContext';

// Mock data
import mockDashboardData from '../utils/mockData/dashboardData';

// Define dashboard widgets
const widgetMap = {
  userProgress: {
    id: 'userProgress',
    titleKey: 'dashboard.widgets.userProgress',
    component: UserProgressCard,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 0
  },
  resumeScore: {
    id: 'resumeScore',
    titleKey: 'dashboard.widgets.resumeScore',
    component: ResumeScoreChart,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 1
  },
  skillGap: {
    id: 'skillGap',
    titleKey: 'dashboard.widgets.skillGap',
    component: SkillGapAnalysis,
    defaultSize: { xs: 12, md: 6 },
    defaultOrder: 2
  },
  aiRecommendation: {
    id: 'aiRecommendation',
    titleKey: 'dashboard.widgets.aiRecommendation',
    component: AIRecommendationCard,
    defaultSize: { xs: 12, md: 6 },
    defaultOrder: 3
  },
  careerJourney: {
    id: 'careerJourney',
    titleKey: 'dashboard.widgets.careerJourney',
    component: CareerJourneyTimeline,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 4
  },
  badges: {
    id: 'badges',
    titleKey: 'dashboard.widgets.badges',
    component: BadgesSection,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 5
  },
  careerPrediction: {
    id: 'careerPrediction',
    titleKey: 'dashboard.widgets.careerPrediction',
    component: CareerPredictionSection,
    defaultSize: { xs: 12, md: 6 },
    defaultOrder: 6
  },
  learningPaths: {
    id: 'learningPaths',
    titleKey: 'dashboard.widgets.learningPaths',
    component: PersonalizedLearningPaths,
    defaultSize: { xs: 12, md: 6 },
    defaultOrder: 7
  },
  marketInsights: {
    id: 'marketInsights',
    titleKey: 'dashboard.widgets.marketInsights',
    component: MarketInsightsSection,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 8
  },
  leaderboard: {
    id: 'leaderboard',
    titleKey: 'dashboard.widgets.leaderboard',
    component: LeaderboardWidget,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 9
  },
  activityLog: {
    id: 'activityLog',
    titleKey: 'dashboard.widgets.activityLog',
    component: ActivityLogSection,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 10
  },
  opportunityAlert: {
    id: 'opportunityAlert',
    titleKey: 'dashboard.widgets.opportunityAlert',
    component: OpportunityAlertCard,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 11
  },
  learningRoadmap: {
    id: 'learningRoadmap',
    titleKey: 'dashboard.widgets.learningRoadmap',
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
      duration: 0.5
    }
  }
};

// Simple component error boundary for widget rendering
const WidgetErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const errorHandler = (error) => {
      console.error('Widget rendering error:', error);
      setHasError(true);
      return true; // Prevents default error handling
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          {t('common.error')}
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => setHasError(false)}
        >
          {t('common.tryAgain')}
        </Button>
      </Box>
    );
  }

  return children;
};

const ArabicDashboard = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const muiTheme = useMuiTheme();
  const { toggleDarkMode } = useTheme();
  const [visibleWidgets, setVisibleWidgets] = useState([
    'userProgress', 'resumeScore', 'skillGap', 'aiRecommendation', 'careerJourney', 
    'badges', 'careerPrediction', 'learningPaths', 'marketInsights', 'leaderboard', 
    'activityLog', 'opportunityAlert', 'learningRoadmap'
  ]);
  const [widgetOrder, setWidgetOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  
  // Set RTL mode when component mounts
  useEffect(() => {
    console.log('Setting RTL mode for Arabic dashboard');
    document.dir = 'rtl';
    return () => {
      console.log('Cleaning up RTL mode');
      document.dir = 'ltr';
    };
  }, []);

  // Initialize widget order on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem('arabicDashboardWidgetOrder');
    if (savedOrder) {
      try {
        setWidgetOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error('Error parsing saved widget order', e);
        initDefaultWidgetOrder();
      }
    } else {
      initDefaultWidgetOrder();
    }
    
    // Load visible widgets from localStorage
    const savedVisibleWidgets = localStorage.getItem('arabicDashboardVisibleWidgets');
    if (savedVisibleWidgets) {
      try {
        setVisibleWidgets(JSON.parse(savedVisibleWidgets));
      } catch (e) {
        console.error('Error parsing saved visible widgets', e);
      }
    }
  }, []);

  // Initialize default widget order
  const initDefaultWidgetOrder = () => {
    const defaultOrder = Object.entries(widgetMap)
      .sort((a, b) => a[1].defaultOrder - b[1].defaultOrder)
      .map(([id]) => id);
    setWidgetOrder(defaultOrder);
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Loading dashboard data...');
        // In a real app, replace this with API call
        setDashboardData(mockDashboardData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError(t('dashboard.errors.loadFailed'));
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [t]);

  // Initialize mock data for user progress widget to fix the UserProgressCard error
  useEffect(() => {
    // Ensure the dashboardData includes a complete userProgress object
    if (dashboardData && !dashboardData.userProgress) {
      const updatedData = {
        ...dashboardData,
        userProgress: {
          xp: dashboardData?.progress?.xp || 250,
          level: dashboardData?.progress?.level || 3,
          nextLevelXp: dashboardData?.progress?.nextLevelXp || 400,
          rank: dashboardData?.progress?.rank || "مستكشف المهنة",
          completedTasks: dashboardData?.progress?.completedTasks || 24,
          totalTasks: dashboardData?.progress?.totalTasks || 36,
          skills: dashboardData?.progress?.skills || {
            main: [
              { name: "جافاسكريبت", level: 75 },
              { name: "رياكت", level: 68 },
              { name: "نود.جي إس", level: 55 }
            ],
            secondary: [
              { name: "تصميم واجهة المستخدم", level: 45 },
              { name: "إدارة المشاريع", level: 62 }
            ]
          },
          badges: dashboardData?.progress?.badges || []
        }
      };
      
      // Add fallback badges data if necessary
      if (!dashboardData.badges || !Array.isArray(dashboardData.badges) || dashboardData.badges.length === 0) {
        updatedData.badges = [
          { 
            id: 1, 
            name: "بادئ السيرة الذاتية", 
            status: "earned", 
            date_earned: "2023-02-10", 
            icon: "description",
            category: "مسار مهني",
            description: "أنشأت أول سيرة ذاتية لك!"
          },
          { 
            id: 2, 
            name: "نجم المقابلة", 
            status: "earned", 
            date_earned: "2023-03-15", 
            icon: "record_voice_over",
            category: "مهارات",
            description: "أكملت مقابلة تجريبية بنجاح"
          },
          { 
            id: 3, 
            name: "بناء الشبكات", 
            status: "progress", 
            progress: 70, 
            icon: "people",
            category: "تواصل",
            description: "تواصل مع 10 محترفين في مجالك"
          },
          { 
            id: 4, 
            name: "مطور المهارات", 
            status: "progress", 
            progress: 45, 
            icon: "trending_up",
            category: "تعلم",
            description: "أكمل 5 دورات تدريبية في مهاراتك الأساسية"
          },
          { 
            id: 5, 
            name: "باحث وظيفي متميز", 
            status: "locked", 
            icon: "work",
            category: "مسار مهني",
            description: "تقدم بطلب لـ 10 وظائف مناسبة"
          }
        ];
      }
      
      setDashboardData(updatedData);
    }
  }, [dashboardData]);

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const newOrder = Array.from(widgetOrder);
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);
    
    setWidgetOrder(newOrder);
    localStorage.setItem('arabicDashboardWidgetOrder', JSON.stringify(newOrder));
  };

  // Toggle widget visibility
  const toggleWidgetVisibility = (widgetId) => {
    let newVisibleWidgets;
    
    if (visibleWidgets.includes(widgetId)) {
      newVisibleWidgets = visibleWidgets.filter(id => id !== widgetId);
    } else {
      newVisibleWidgets = [...visibleWidgets, widgetId];
    }
    
    setVisibleWidgets(newVisibleWidgets);
    localStorage.setItem('arabicDashboardVisibleWidgets', JSON.stringify(newVisibleWidgets));
  };

  // Reset dashboard layout
  const resetDashboardLayout = () => {
    initDefaultWidgetOrder();
    const allWidgetIds = Object.keys(widgetMap);
    setVisibleWidgets(allWidgetIds);
    localStorage.removeItem('arabicDashboardWidgetOrder');
    localStorage.removeItem('arabicDashboardVisibleWidgets');
  };

  // Refresh dashboard
  const refreshDashboard = async () => {
    setRefreshing(true);
    
    try {
      // In a real app, replace with API call
      setDashboardData(mockDashboardData);
      
      // Simulate delay for refresh animation
      setTimeout(() => {
        setRefreshing(false);
      }, 1500);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      setError(t('dashboard.errors.refreshFailed'));
      setRefreshing(false);
    }
  };

  // If loading
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center', height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // If error
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">{error}</Typography>
        <Button variant="contained" color="primary" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          {t('common.tryAgain')}
        </Button>
      </Container>
    );
  }

  // Get widget props for rendering
  const getWidgetProps = (widgetId) => {
    // Fix data mapping for each widget type
    let widgetData = {};
    
    // Map dashboardData to the expected structure for each widget
    switch(widgetId) {
      case 'userProgress':
        // UserProgressCard expects data with 'xp' property
        widgetData = dashboardData?.userProgress || { 
          xp: dashboardData?.progress?.xp || 250,
          level: dashboardData?.progress?.level || 3
        };
        break;
      case 'resumeScore':
        widgetData = dashboardData?.resumeScore || {};
        break;
      case 'skillGap':
        widgetData = dashboardData?.skillGap || [];
        break;
      case 'aiRecommendation':
        widgetData = dashboardData?.recommendations || [];
        break;
      case 'careerJourney':
        widgetData = dashboardData?.careerJourney || [];
        break;
      case 'badges':
        widgetData = dashboardData?.badges || [];
        break;
      case 'careerPrediction':
        widgetData = dashboardData?.careerPredictions || [];
        break;
      case 'learningPaths':
        widgetData = dashboardData?.learningPaths || [];
        break;
      case 'marketInsights':
        widgetData = dashboardData?.marketInsights || {};
        break;
      case 'leaderboard':
        widgetData = dashboardData?.leaderboard || {};
        break;
      case 'activityLog':
        widgetData = dashboardData?.recentActivities || [];
        break;
      case 'opportunityAlert':
        widgetData = dashboardData?.opportunityAlerts || [];
        break;
      case 'learningRoadmap':
        widgetData = dashboardData?.learningRoadmap || {};
        break;
      default:
        widgetData = dashboardData?.[widgetId] || {};
    }
    
    return {
      data: widgetData,
      onToggleVisibility: () => toggleWidgetVisibility(widgetId),
      isVisible: visibleWidgets.includes(widgetId),
    };
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: muiTheme.palette.text.primary }}>
          {t('dashboard.yourCareerDashboard')}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={t('dashboard.actions.resetLayout')}>
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={resetDashboardLayout}
              startIcon={<RefreshIcon />}
            >
              {t('dashboard.actions.resetLayout')}
            </Button>
          </Tooltip>
          
          <Tooltip title={t('dashboard.actions.refresh')}>
            <IconButton onClick={refreshDashboard} disabled={refreshing}>
              <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {dashboardData && widgetOrder && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard">
            {(provided) => (
              <Box
                {...provided.droppableProps}
                ref={provided.innerRef}
                component={motion.div}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <Grid container spacing={3}>
                  {widgetOrder.map((widgetId, index) => {
                    if (!visibleWidgets.includes(widgetId)) return null;
                    
                    const widget = widgetMap[widgetId];
                    if (!widget) return null;
                    
                    const WidgetComponent = widget.component;
                    
                    return (
                      <Draggable key={widgetId} draggableId={widgetId} index={index}>
                        {(provided) => (
                          <Grid
                            item
                            {...widget.defaultSize}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            component={motion.div}
                            variants={itemVariants}
                          >
                            <Paper
                              sx={{
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 2,
                                position: 'relative',
                                overflow: 'hidden',
                                height: '100%',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  mb: 2,
                                }}
                              >
                                <Typography variant="h6" fontWeight="bold">
                                  {t(widget.titleKey)}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title={t('dashboard.actions.hide')}>
                                    <IconButton size="small" onClick={() => toggleWidgetVisibility(widgetId)}>
                                      <VisibilityOffIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title={t('dashboard.actions.dragToReorder')}>
                                    <Box {...provided.dragHandleProps}>
                                      <DragIndicatorIcon color="action" />
                                    </Box>
                                  </Tooltip>
                                </Box>
                              </Box>
                              
                              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <WidgetErrorBoundary>
                                  <WidgetComponent {...getWidgetProps(widgetId)} />
                                </WidgetErrorBoundary>
                              </Box>
                            </Paper>
                          </Grid>
                        )}
                      </Draggable>
                    );
                  })}
                </Grid>
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Container>
  );
};

export default ArabicDashboard; 