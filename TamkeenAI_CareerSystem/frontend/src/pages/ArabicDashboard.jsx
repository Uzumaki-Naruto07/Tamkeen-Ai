import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
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
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Icons
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';

// Import components
import UserProgressCard from '../components/Dashboard/UserProgressCard';
import ResumeScoreChart from '../components/Dashboard/ResumeScoreChart';
import CareerJourneyTimeline from '../components/Dashboard/CareerJourneyTimeline';
import SkillGapAnalysis from '../components/Dashboard/SkillGapAnalysis';
import AIRecommendationCard from '../components/Dashboard/AIRecommendationCard';
import BadgesSection from '../components/Dashboard/BadgesSection';
import LeaderboardWidget from '../components/Dashboard/LeaderboardWidget';
import OpportunityAlertCard from '../components/Dashboard/OpportunityAlertCard';
import MarketInsightsSection from '../components/Dashboard/MarketInsightsSection';
import PersonalizedLearningPaths from '../components/Dashboard/PersonalizedLearningPaths';
import ActivityLogSection from '../components/Dashboard/ActivityLogSection';
import CareerPredictionSection from '../components/Dashboard/CareerPredictionSection';

// Import context
import { useUser } from '../contexts/UserContext';
import { ThemeContext } from '../contexts/ThemeContext';

// Mock data (will be replaced with API calls)
import mockDashboardData from '../utils/mockData/dashboardData';

// Responsive grid layout
const ResponsiveGridLayout = WidthProvider(Responsive);

// Widget definitions with Arabic titles
const getWidgetDefinitions = () => {
  return {
    userProgress: { title: 'تقدم المستخدم', component: UserProgressCard, minH: 2, minW: 1, maxH: 3, maxW: 3 },
    resumeScore: { title: 'تقييم السيرة الذاتية', component: ResumeScoreChart, minH: 2, minW: 2, maxH: 3, maxW: 3 },
    careerJourney: { title: 'رحلة المهنية', component: CareerJourneyTimeline, minH: 2, minW: 2, maxH: 3, maxW: 3 },
    skillGap: { title: 'تحليل فجوة المهارات', component: SkillGapAnalysis, minH: 2, minW: 1, maxH: 3, maxW: 3 },
    recommendations: { title: 'توصيات الذكاء الاصطناعي', component: AIRecommendationCard, minH: 2, minW: 1, maxH: 3, maxW: 2 },
    badges: { title: 'الشارات والإنجازات', component: BadgesSection, minH: 2, minW: 1, maxH: 3, maxW: 2 },
    leaderboard: { title: 'لوحة المتصدرين', component: LeaderboardWidget, minH: 2, minW: 1, maxH: 3, maxW: 2 },
    opportunityAlerts: { title: 'تنبيهات الفرص', component: OpportunityAlertCard, minH: 2, minW: 1, maxH: 3, maxW: 2 },
    marketInsights: { title: 'رؤى سوق العمل', component: MarketInsightsSection, minH: 2, minW: 2, maxH: 3, maxW: 3 },
    learningPaths: { title: 'مسارات التعلم', component: PersonalizedLearningPaths, minH: 2, minW: 1, maxH: 3, maxW: 2 },
    recentActivities: { title: 'الأنشطة الأخيرة', component: ActivityLogSection, minH: 2, minW: 1, maxH: 3, maxW: 2 },
    careerPrediction: { title: 'توقعات المسار المهني', component: CareerPredictionSection, minH: 2, minW: 2, maxH: 3, maxW: 3 },
  };
};

// Generate initial layout
const generateInitialLayout = () => {
  return {
    lg: [
      { i: 'userProgress', x: 0, y: 0, w: 1, h: 2 },
      { i: 'resumeScore', x: 1, y: 0, w: 2, h: 2 },
      { i: 'careerPrediction', x: 0, y: 2, w: 2, h: 2 },
      { i: 'leaderboard', x: 2, y: 2, w: 1, h: 2 },
      { i: 'recommendations', x: 0, y: 4, w: 1, h: 2 },
      { i: 'badges', x: 1, y: 4, w: 1, h: 2 },
      { i: 'learningPaths', x: 2, y: 4, w: 1, h: 2 },
    ],
    md: [
      { i: 'userProgress', x: 0, y: 0, w: 1, h: 2 },
      { i: 'resumeScore', x: 1, y: 0, w: 1, h: 2 },
      { i: 'careerPrediction', x: 0, y: 2, w: 2, h: 2 },
      { i: 'leaderboard', x: 0, y: 4, w: 1, h: 2 },
      { i: 'recommendations', x: 1, y: 4, w: 1, h: 2 },
    ],
    sm: [
      { i: 'userProgress', x: 0, y: 0, w: 1, h: 2 },
      { i: 'resumeScore', x: 0, y: 2, w: 1, h: 2 },
      { i: 'careerPrediction', x: 0, y: 4, w: 1, h: 2 },
    ],
  };
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
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const ArabicDashboard = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useUser();
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [layoutConfiguration, setLayoutConfiguration] = useState(generateInitialLayout());
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [draggableEnabled, setDraggableEnabled] = useState(false);
  const theme = useTheme();
  const { toggleColorMode } = useContext(ThemeContext);
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  // Get widget map with translations
  const widgetMap = getWidgetDefinitions();
  
  // Set RTL mode when component mounts
  useEffect(() => {
    document.dir = 'rtl';
    return () => {
      document.dir = 'ltr';
    };
  }, []);

  // Use mock data directly instead of simulating API call
  useEffect(() => {
    const fetchDashboardData = () => {
      try {
        console.log('Loading dashboard data...');
        // Set mock data directly without setTimeout
        setDashboardData(mockDashboardData);
        setDashboardLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.');
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get props for each widget based on its type
  const getWidgetProps = (widgetType) => {
    if (!dashboardData) {
      console.warn(`Dashboard data not available for widget: ${widgetType}`);
      return {};
    }

    let props = {};
    
    switch (widgetType) {
      case 'userProgress':
        props = { progressData: dashboardData.progress || {} };
        break;
      case 'resumeScore':
        props = { 
          resumeData: dashboardData.resumeScore || {
            scores: [], 
            average_improvement: 0,
            latest_score: 0
          } 
        };
        break;
      case 'careerJourney':
        props = { journeyData: dashboardData.careerJourney || [] };
        break;
      case 'recommendations':
        props = { recommendations: dashboardData.recommendations || [] };
        break;
      case 'badges':
        props = { badges: dashboardData.badges || [] };
        break;
      case 'marketInsights':
        props = { insights: dashboardData.marketInsights || {} };
        break;
      case 'leaderboard':
        props = { leaderboardData: dashboardData.leaderboard || {} };
        break;
      case 'learningPaths':
        props = { paths: dashboardData.learningPaths || [] };
        break;
      case 'opportunityAlerts':
        props = { opportunities: dashboardData.opportunityAlerts || [] };
        break;
      case 'recentActivities':
        props = { activities: dashboardData.recentActivities || [] };
        break;
      case 'careerPrediction':
        props = { predictions: dashboardData.careerPredictions || [] };
        break;
      default:
        console.warn(`Unknown widget type: ${widgetType}`);
        props = {};
    }
    
    return props;
  };
  
  // Render a widget
  const renderWidget = (key, widget) => {
    const WidgetComponent = widget.component;
    const widgetProps = getWidgetProps(key);
    
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          height: '100%', 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '10px',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <Typography variant="h6" fontWeight="bold">{widget.title}</Typography>
        </Box>
        <Box sx={{ p: 1, flexGrow: 1, overflow: 'auto' }}>
          <WidgetComponent {...widgetProps} />
        </Box>
      </Paper>
    );
  };

  // Handle layout changes
  const onLayoutChange = (currentLayout, allLayouts) => {
    if (isCustomizing) {
      setLayoutConfiguration(allLayouts);
      localStorage.setItem('dashboardLayout', JSON.stringify(allLayouts));
    }
  };

  // Toggle layout customization
  const toggleCustomization = () => {
    setIsCustomizing(!isCustomizing);
    setDraggableEnabled(!draggableEnabled);
  };

  // If loading
  if (dashboardLoading) {
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

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
          {t('dashboard.title')}
        </Typography>
        <Box>
          <Button
            variant={isCustomizing ? "contained" : "outlined"}
            color={isCustomizing ? "primary" : "secondary"}
            onClick={toggleCustomization}
            startIcon={isCustomizing ? <DoneIcon /> : <EditIcon />}
            sx={{ mr: 1 }}
          >
            {isCustomizing ? t('dashboard.actions.saveLayout') : t('dashboard.actions.customizeLayout')}
          </Button>
          {isCustomizing && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setIsCustomizing(false);
                setDraggableEnabled(false);
              }}
              startIcon={<CloseIcon />}
            >
              {t('common.cancel')}
            </Button>
          )}
        </Box>
      </Box>
      
      <ResponsiveGridLayout
        className="layout"
        layouts={layoutConfiguration}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 3, md: 2, sm: 1, xs: 1, xxs: 1 }}
        rowHeight={200}
        isDraggable={draggableEnabled}
        isResizable={draggableEnabled}
        onLayoutChange={onLayoutChange}
        margin={[16, 16]}
      >
        {Object.entries(widgetMap).map(([key, widget]) => {
          // Check if this widget is in the layout
          const isInLayout = layoutConfiguration.lg.some(item => item.i === key);
          if (!isInLayout) return null;
          
          return (
            <div key={key}>
              {renderWidget(key, widget)}
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </Container>
  );
};

export default ArabicDashboard; 