import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  Box, 
  Paper, 
  CircularProgress, 
  Button,
  IconButton,
  Tooltip,
  Divider,
  Menu,
  MenuItem,
  Fab
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import Masonry from '@mui/lab/Masonry';
import { motion, AnimatePresence } from 'framer-motion';

// Dashboard API
import DashboardAPI from '../../api/DashboardAPI';

// Dashboard components
import UserProgressCard from './UserProgressCard';
import SkillGapAnalysis from './SkillGapAnalysis';
import ResumeScoreChart from './ResumeScoreChart';
import CareerJourneyTimeline from './CareerJourneyTimeline';
import MarketInsightsSection from './MarketInsightsSection';
import BadgesSection from './BadgesSection';
import ActivityLogSection from './ActivityLogSection';
import CareerPredictionSection from './CareerPredictionSection';
import PersonalizedLearningPaths from './PersonalizedLearningPaths';
import AIRecommendationCard from './AIRecommendationCard';
import LeaderboardWidget from './LeaderboardWidget';
import OpportunityAlertCard from './OpportunityAlertCard';

// Context
import { useUser } from '../../context/AppContext';

// Import mock data
import { mockDashboardData } from '../../utils/app-mocks';

// Import our new components
import SkillTransitionChart from './SkillTransitionChart';
import EmiratiJourneyMap from './EmiratiJourneyMap';
import DashboardReportExporter from './DashboardReportExporter';
import WinnerVibeBanner from './WinnerVibeBanner';

// Styled components
const WidgetContainer = styled(Paper)(({ theme }) => ({
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[8],
    '& .widget-controls': {
      opacity: 1,
    },
  },
}));

const WidgetControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 5,
  right: 5,
  zIndex: 10,
  display: 'flex',
  opacity: 0,
  transition: 'opacity 0.2s ease',
}));

const AddWidgetButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  zIndex: 1000,
}));

// Widget map for component mapping
const widgetMap = {
  userProgress: {
    id: 'userProgress',
    name: 'Progress',
    component: UserProgressCard,
    propKey: 'userProgress',
    defaultSize: { md: 4 },
  },
  resumeScore: {
    id: 'resumeScore',
    name: 'Resume Score',
    component: ResumeScoreChart,
    propKey: 'resumeScore',
    defaultSize: { md: 8 },
  },
  skillGap: {
    id: 'skillGap',
    name: 'Skill Gap Analysis',
    component: SkillGapAnalysis,
    propKey: 'skillGap',
    defaultSize: { md: 6 },
  },
  aiRecommendation: {
    id: 'aiRecommendation',
    name: 'AI Coach Recommendations',
    component: AIRecommendationCard,
    propKey: 'aiRecommendation',
    defaultSize: { md: 6 },
  },
  careerJourney: {
    id: 'careerJourney',
    name: 'Career Journey',
    component: CareerJourneyTimeline,
    propKey: 'careerJourney',
    defaultSize: { md: 12 },
  },
  learningPaths: {
    id: 'learningPaths',
    name: 'Learning Paths',
    component: PersonalizedLearningPaths,
    propKey: 'learningPaths',
    defaultSize: { md: 8 },
  },
  careerPrediction: {
    id: 'careerPrediction',
    name: 'Career Prediction',
    component: CareerPredictionSection,
    propKey: 'careerPrediction',
    defaultSize: { md: 6 },
  },
  marketInsights: {
    id: 'marketInsights',
    name: 'Market Insights',
    component: MarketInsightsSection,
    propKey: 'insights',
    defaultSize: { md: 6 },
  },
  badges: {
    id: 'badges',
    name: 'Achievements',
    component: BadgesSection,
    propKey: 'careerProgress',
    defaultSize: { md: 4 },
  },
  activityLog: {
    id: 'activityLog',
    name: 'Recent Activity',
    component: ActivityLogSection,
    propKey: 'recentActivities',
    defaultSize: { md: 4 },
  },
  leaderboard: {
    id: 'leaderboard',
    name: 'Leaderboard',
    component: LeaderboardWidget,
    propKey: 'leaderboardPosition',
    defaultSize: { md: 4 },
  },
  opportunityAlert: {
    id: 'opportunityAlert',
    name: 'Job Opportunities',
    component: OpportunityAlertCard,
    propKey: 'jobRecommendations',
    defaultSize: { md: 4 },
  },
};

// Default widget layout
const defaultLayout = [
  'userProgress',
  'resumeScore',
  'skillGap',
  'aiRecommendation',
  'careerJourney',
  'marketInsights',
  'badges',
  'activityLog',
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 80,
    },
  },
};

const Dashboard = () => {
  const { profile, isAuthenticated } = useUser();
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layoutLoaded, setLayoutLoaded] = useState(false);
  
  // Widget management state
  const [widgetLayout, setWidgetLayout] = useState([]);
  const [hiddenWidgets, setHiddenWidgets] = useState([]);
  const [widgetMenuAnchor, setWidgetMenuAnchor] = useState(null);
  
  // Initialize layout from localStorage or use default
  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem('dashboardLayout');
      const savedHidden = localStorage.getItem('hiddenWidgets');
      
      if (savedLayout) {
        setWidgetLayout(JSON.parse(savedLayout));
      } else {
        setWidgetLayout(defaultLayout);
      }
      
      if (savedHidden) {
        setHiddenWidgets(JSON.parse(savedHidden));
      }
      
      setLayoutLoaded(true);
    } catch (err) {
      console.error('Error loading layout from localStorage:', err);
      setWidgetLayout(defaultLayout);
      setLayoutLoaded(true);
    }
  }, []);
  
  // Save layout to localStorage when it changes
  useEffect(() => {
    if (layoutLoaded) {
      localStorage.setItem('dashboardLayout', JSON.stringify(widgetLayout));
      localStorage.setItem('hiddenWidgets', JSON.stringify(hiddenWidgets));
    }
  }, [widgetLayout, hiddenWidgets, layoutLoaded]);
  
  // Load dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // In a real app, fetch from API
      // const userId = localStorage.getItem('userId'); 
      // const data = await DashboardAPI.getDashboardData(userId);
      
      // Use mock data for development
      const data = mockDashboardData;
      setDashboardData(data);
      
      // Track dashboard view (in real app)
      // await DashboardAPI.trackUserActivity(userId, {
      //   activity_type: 'view_dashboard',
      //   description: 'Viewed dashboard'
      // });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    }
  }, []);
  
  // Initial data load
  useEffect(() => {
    fetchDashboardData();
    
    // Set up interval to refresh data periodically (every 5 minutes)
    const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData]);
  
  // Handle widget visibility toggle
  const toggleWidgetVisibility = (widgetId) => {
    if (hiddenWidgets.includes(widgetId)) {
      // Show widget
      setHiddenWidgets(hiddenWidgets.filter(id => id !== widgetId));
      
      // Add to layout if not already there
      if (!widgetLayout.includes(widgetId)) {
        setWidgetLayout([...widgetLayout, widgetId]);
      }
    } else {
      // Hide widget
      setHiddenWidgets([...hiddenWidgets, widgetId]);
    }
  };
  
  // Handle widget menu open/close
  const handleWidgetMenuOpen = (event) => {
    setWidgetMenuAnchor(event.currentTarget);
  };
  
  const handleWidgetMenuClose = () => {
    setWidgetMenuAnchor(null);
  };
  
  // Handle adding a widget from the menu
  const handleAddWidget = (widgetId) => {
    // Remove from hidden widgets if it's there
    if (hiddenWidgets.includes(widgetId)) {
      setHiddenWidgets(hiddenWidgets.filter(id => id !== widgetId));
    }
    
    // Add to layout if not already there
    if (!widgetLayout.includes(widgetId)) {
      setWidgetLayout([...widgetLayout, widgetId]);
    }
    
    handleWidgetMenuClose();
  };
  
  // Handle drag-and-drop reordering
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(widgetLayout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setWidgetLayout(items);
  };
  
  // Reset layout to default
  const resetLayout = () => {
    setWidgetLayout(defaultLayout);
    setHiddenWidgets([]);
  };
  
  // Refresh dashboard data
  const refreshDashboard = () => {
    fetchDashboardData();
  };
  
  // Loading state
  if (loading && !dashboardData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Error state
  if (error && !dashboardData) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button
          variant="contained"
          onClick={refreshDashboard}
          startIcon={<RefreshIcon />}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      </Box>
    );
  }
  
  // Available widgets for the add menu (widgets not in the layout)
  const availableWidgets = Object.keys(widgetMap).filter(
    id => !widgetLayout.includes(id) || hiddenWidgets.includes(id)
  );
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('dashboard.title', 'Dashboard')}
        </Typography>
        
        {/* Winner Vibe Banner */}
        <Box sx={{ mb: 3 }}>
          <WinnerVibeBanner />
        </Box>
        
        {/* First Row */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <UserProgressCard />
          </Grid>
          <Grid item xs={12} md={4}>
            <AIRecommendationCard />
          </Grid>
        </Grid>
        
        {/* Second Row - Add Skill Transition Chart with Nivo animations */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <SkillTransitionChart />
          </Grid>
          <Grid item xs={12} md={4}>
            <SkillGapAnalysis />
          </Grid>
        </Grid>
        
        {/* Third Row - Add Emirati Journey Map */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={7}>
            <EmiratiJourneyMap />
          </Grid>
          <Grid item xs={12} md={5}>
            <ActivityLogSection />
          </Grid>
        </Grid>
        
        {/* Fourth Row */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <CareerPredictionSection />
          </Grid>
          <Grid item xs={12} md={6}>
            <OpportunityAlertCard />
          </Grid>
        </Grid>
        
        {/* Fifth Row - Add Report Exporter */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <LeaderboardWidget />
          </Grid>
          <Grid item xs={12} md={4}>
            <MarketInsightsSection />
          </Grid>
          <Grid item xs={12} md={4}>
            <DashboardReportExporter />
          </Grid>
        </Grid>
      </Box>
      
      {/* Add widget button */}
      <AddWidgetButton 
        color="primary" 
        aria-label="add widget"
        onClick={handleWidgetMenuOpen}
      >
        <AddIcon />
      </AddWidgetButton>
      
      {/* Widget menu */}
      <Menu
        anchorEl={widgetMenuAnchor}
        open={Boolean(widgetMenuAnchor)}
        onClose={handleWidgetMenuClose}
      >
        {availableWidgets.length > 0 ? (
          availableWidgets.map(widgetId => (
            <MenuItem 
              key={widgetId} 
              onClick={() => handleAddWidget(widgetId)}
            >
              {widgetMap[widgetId].name}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>All widgets are displayed</MenuItem>
        )}
      </Menu>
    </Container>
  );
};

export default Dashboard; 