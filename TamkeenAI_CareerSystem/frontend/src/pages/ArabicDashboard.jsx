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
import { arSA } from 'date-fns/locale';
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

// Define dashboard widgets with Arabic titles
const widgetMap = {
  userProgress: {
    id: 'userProgress',
    title: 'تقدم المستخدم',
    component: UserProgressCard,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 0
  },
  resumeScore: {
    id: 'resumeScore',
    title: 'تقييم السيرة الذاتية',
    component: ResumeScoreChart,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 1
  },
  skillGap: {
    id: 'skillGap',
    title: 'تحليل فجوة المهارات',
    component: SkillGapAnalysis,
    defaultSize: { xs: 12, md: 6 },
    defaultOrder: 2
  },
  aiRecommendation: {
    id: 'aiRecommendation',
    title: 'توصيات الذكاء الاصطناعي',
    component: AIRecommendationCard,
    defaultSize: { xs: 12, md: 6 },
    defaultOrder: 3
  },
  careerJourney: {
    id: 'careerJourney',
    title: 'رحلة المهنية',
    component: CareerJourneyTimeline,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 4
  },
  badges: {
    id: 'badges',
    title: 'الشارات والإنجازات',
    component: BadgesSection,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 5
  },
  careerPrediction: {
    id: 'careerPrediction',
    title: 'توقعات المسار المهني',
    component: CareerPredictionSection,
    defaultSize: { xs: 12, md: 6 },
    defaultOrder: 6
  },
  learningPaths: {
    id: 'learningPaths',
    title: 'مسارات التعلم',
    component: PersonalizedLearningPaths,
    defaultSize: { xs: 12, md: 6 },
    defaultOrder: 7
  },
  marketInsights: {
    id: 'marketInsights',
    title: 'رؤى سوق العمل',
    component: MarketInsightsSection,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 8
  },
  leaderboard: {
    id: 'leaderboard',
    title: 'لوحة المتصدرين',
    component: LeaderboardWidget,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 9
  },
  activityLog: {
    id: 'activityLog',
    title: 'النشاطات الأخيرة',
    component: ActivityLogSection,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 10
  },
  opportunityAlert: {
    id: 'opportunityAlert',
    title: 'تنبيهات الفرص',
    component: OpportunityAlertCard,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 11
  },
  learningRoadmap: {
    id: 'learningRoadmap',
    title: 'مسارات التعلم الشخصية',
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
      staggerChildren: 0.05,
      duration: 0.5,
      ease: "easeOut"
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
      stiffness: 260,
      damping: 20,
      duration: 0.5
    }
  }
};

// Widget card styling - use this for all widget Paper components
const widgetCardStyles = {
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 2.5,
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
  }
};

// Widget header styling
const widgetHeaderStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 2,
  pb: 1.5,
  borderBottom: '1px solid rgba(0,0,0,0.08)'
};

const ArabicDashboard = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const muiTheme = useMuiTheme();
  const { toggleDarkMode } = useTheme();
  const [visibleWidgets, setVisibleWidgets] = useState(Object.keys(widgetMap));
  const [widgetOrder, setWidgetOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  
  // Set RTL mode when component mounts
  useEffect(() => {
    document.dir = 'rtl';
    return () => {
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
        // In a real app, replace this with API call
        setDashboardData(mockDashboardData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

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
      setError('فشل في تحديث البيانات. يرجى المحاولة مرة أخرى.');
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
          {t('common.retry')}
        </Button>
      </Container>
    );
  }

  // Get widget props for rendering
  const getWidgetProps = (widgetId) => {
    // Create safe default data structure
    const defaultData = {
      progress: {
        overall: 0,
        resume: 0,
        skills: 0,
        applications: 0,
        interviews: 0,
        networking: 0,
        goals: [],
        nextSteps: [],
        rank: 'مستكشف مهني',
        level: 1,
        xp: 150,
        completedTasks: 3
      },
      resumeScore: {
        overall: 0,
        latest_score: 65,
        sections: { content: 0, format: 0, keywords: 0, impact: 0 },
        scores: [
          { name: 'المحتوى', value: 70 },
          { name: 'التنسيق', value: 65 },
          { name: 'الكلمات الرئيسية', value: 60 },
          { name: 'التأثير', value: 55 }
        ]
      },
      resumeHistory: [
        { date: '2023-05-01', score: 50 },
        { date: '2023-06-01', score: 55 },
        { date: '2023-07-01', score: 65 }
      ],
      skillGap: [],
      recommendations: [],
      careerJourney: [],
      badges: [],
      careerPredictions: [],
      learningPaths: [],
      marketInsights: {},
      leaderboard: {},
      recentActivities: [],
      opportunityAlerts: [],
      learningRoadmap: {}
    };
    
    // Ensure dashboardData exists or use default
    const safeData = dashboardData || defaultData;
    
    // Map widgetId to the required props structure
    switch(widgetId) {
      case 'userProgress':
        return { data: safeData?.progress || defaultData.progress };
        
      case 'resumeScore':
        return { 
          score: safeData?.resumeScore || defaultData.resumeScore,
          history: safeData?.resumeHistory || defaultData.resumeHistory,
          resumeScores: safeData?.resumeScore || defaultData.resumeScore 
        };
        
      case 'skillGap':
        return { 
          currentSkills: safeData?.currentSkills || ['React', 'JavaScript', 'HTML', 'CSS'],
          requiredSkills: safeData?.requiredSkills || ['React', 'JavaScript', 'TypeScript', 'Next.js', 'GraphQL'],
          targetRole: safeData?.targetRole || 'مطوّر واجهة أمامية'
        };
        
      case 'aiRecommendation':
        return { recommendations: safeData?.recommendations || defaultData.recommendations };
        
      case 'careerJourney':
        return { milestones: safeData?.careerJourney || defaultData.careerJourney };
        
      case 'badges':
        return { badges: safeData?.badges || defaultData.badges };
        
      case 'careerPrediction':
        return { predictions: safeData?.careerPredictions || defaultData.careerPredictions };
        
      case 'learningPaths':
        return { paths: safeData?.learningPaths || defaultData.learningPaths };
        
      case 'marketInsights':
        return { 
          insights: safeData?.marketInsights || defaultData.marketInsights,
          marketInsights: safeData?.marketInsights || defaultData.marketInsights
        };
        
      case 'leaderboard':
        return { users: safeData?.topUsers || [
          { id: 1, name: 'أحمد محمد', points: 1250, badges: 8, avatar: '' },
          { id: 2, name: 'سارة أحمد', points: 1150, badges: 7, avatar: '' },
          { id: 3, name: 'خالد العبد الله', points: 1050, badges: 6, avatar: '' }
        ]};
        
      case 'activityLog':
        return { activities: safeData?.recentActivities || defaultData.recentActivities };
        
      case 'opportunityAlert':
        return { opportunities: safeData?.opportunityAlerts || defaultData.opportunityAlerts };
        
      case 'learningRoadmap':
        return { roadmap: safeData?.learningRoadmap || defaultData.learningRoadmap };
        
      default:
        if (!dashboardData) {
          console.warn(`No data available for widget: ${widgetId}`);
        }
        return {};
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 5 }}>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            لوحة المسار المهني
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: -1 }}>
            مرحبًا بعودتك، {user?.name || 'صديقنا العزيز'}! رحلتك المهنية في انتظارك.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            variant="outlined" 
            color="secondary"
            size="small"
            onClick={resetDashboardLayout}
            startIcon={<RefreshIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 2
            }}
          >
            إعادة ضبط التخطيط
          </Button>
          
          <Tooltip title="تحديث اللوحة">
            <IconButton 
              onClick={refreshDashboard} 
              disabled={refreshing}
              sx={{
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)'
                }
              }}
            >
              <RefreshIcon sx={{ 
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Quick stats */}
      <Paper sx={{ 
        p: 2, 
        mb: 3, 
        borderRadius: 2,
        background: 'linear-gradient(120deg, #1976d2 0%, #5e93d1 100%)',
        color: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={user?.avatar} 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  ml: 2, // Note: using ml instead of mr for RTL
                  border: '2px solid white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                {user?.name?.charAt(0) || "ت"}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {user?.name || 'مستخدم تمكين للذكاء الاصطناعي'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {dashboardData?.progress?.rank || 'مستكشف مهني'} - المستوى {dashboardData?.progress?.level || 1}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData?.progress?.xp || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    نقاط الخبرة
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData?.progress?.completedTasks || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    المهام المكتملة
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData?.resumeScore?.latest_score || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    تقييم السيرة الذاتية
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      
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
                    const widgetProps = getWidgetProps(widgetId);
                    
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
                            <Paper sx={widgetCardStyles}>
                              <Box sx={widgetHeaderStyles}>
                                <Typography variant="h6" fontWeight="bold">
                                  {widget.title}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title="إخفاء">
                                    <IconButton size="small" onClick={() => toggleWidgetVisibility(widgetId)}>
                                      <VisibilityOffIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="اسحب لإعادة الترتيب">
                                    <Box {...provided.dragHandleProps}>
                                      <DragIndicatorIcon color="action" />
                                    </Box>
                                  </Tooltip>
                                </Box>
                              </Box>
                              
                              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <WidgetComponent {...widgetProps} />
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
      
      {/* Quote section */}
      <Paper 
        sx={{ 
          mt: 4, 
          p: 3, 
          textAlign: 'center', 
          borderRadius: 2,
          backgroundImage: 'linear-gradient(to right, rgba(25, 118, 210, 0.05), rgba(25, 118, 210, 0.2))',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontStyle: 'italic' }}>
          "نحن كشعب لا نرضى بغير المركز الأول" 🇦🇪
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          — صاحب السمو الشيخ محمد بن راشد آل مكتوم
        </Typography>
      </Paper>
      
      {/* Hidden widgets display */}
      {visibleWidgets.length < Object.keys(widgetMap).length && (
        <Box sx={{ mt: 4 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            العناصر المخفية
          </Typography>
          <Grid container spacing={2}>
            {Object.keys(widgetMap).map(widgetId => {
              if (visibleWidgets.includes(widgetId)) return null;
              
              return (
                <Grid item xs={6} sm={4} md={3} key={widgetId}>
                  <Card 
                    sx={{ 
                      height: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'scale(1.02)'
                      }
                    }}
                    onClick={() => toggleWidgetVisibility(widgetId)}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" align="center">
                        {widgetMap[widgetId].title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        انقر للإظهار
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default ArabicDashboard; 