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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { format, formatDistance } from 'date-fns';
import LogoutIcon from '@mui/icons-material/Logout';

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
// Make sure we're importing from the correct path
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
  const { profile, user, logout } = useUser();
  const navigate = useNavigate();
  
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
        // Fall back to mock data with fallback defaults for all required properties
        const fallbackData = {
          // Ensure mock data has all required properties with defaults
          progress: {
            overall: 65,
            resume: 80,
            skills: 70,
            applications: 50,
            interviews: 60,
            networking: 55,
            goals: [
              { id: 1, name: 'Complete profile', progress: 100, completed: "true", unlocked: "true" },
              { id: 2, name: 'Apply to 5 jobs', progress: 60, completed: "false", unlocked: "true" },
              { id: 3, name: 'Update resume', progress: 80, completed: "false", unlocked: "true" }
            ],
            nextSteps: ['Update LinkedIn profile', 'Practice interview skills']
          },
          resumeScore: {
            overall: 75,
            sections: {
              content: 80,
              format: 75,
              keywords: 70,
              impact: 65
            },
            scores: [
              { name: 'Content', value: 80 },
              { name: 'Format', value: 75 },
              { name: 'Keywords', value: 70 },
              { name: 'Impact', value: 65 }
            ]
          },
          resumeHistory: [
            { date: '2023-04-01', score: 65 },
            { date: '2023-05-01', score: 70 },
            { date: '2023-06-01', score: 75 }
          ],
          currentSkills: ['React', 'JavaScript', 'CSS', 'HTML', 'Node.js'],
          requiredSkills: ['React', 'JavaScript', 'TypeScript', 'Next.js', 'GraphQL'],
          targetRole: 'Frontend Developer',
          recommendations: [
            { 
              id: 1, 
              type: 'skill', 
              title: 'Learn TypeScript', 
              description: 'Adding TypeScript to your skillset would make you more competitive for Frontend Developer roles.',
              priority: 'high'
            },
            { 
              id: 2, 
              type: 'course', 
              title: 'Next.js Fundamentals', 
              description: 'Next.js is becoming a standard for React applications.',
              priority: 'medium'
            }
          ],
          careerMilestones: [
            { id: 1, title: 'Graduated from University', date: '2020-05-15', type: 'education', completed: true },
            { id: 2, title: 'First Developer Job', date: '2020-08-01', type: 'job', completed: true },
            { id: 3, title: 'Senior Developer', date: '2023-12-01', type: 'job', completed: false }
          ],
          badges: [
            { id: 1, title: 'Profile Completer', description: 'Completed your profile', earned: true, date: '2023-03-15' },
            { id: 2, title: 'Resume Master', description: 'Achieved a resume score over 70', earned: true, date: '2023-04-10' }
          ],
          careerPredictions: [
            { role: 'Senior Frontend Developer', likelihood: 85, timeframe: '1-2 years', salary: '$100,000 - $120,000' },
            { role: 'Frontend Team Lead', likelihood: 65, timeframe: '2-3 years', salary: '$120,000 - $140,000' }
          ],
          learningPaths: [
            { 
              id: 1, 
              title: 'Frontend Mastery', 
              progress: 45, 
              courses: [
                { id: 101, title: 'Advanced React Patterns', completed: true },
                { id: 102, title: 'TypeScript for React Developers', completed: false }
              ]
            }
          ],
          marketInsights: {
            salary_data: {
              current_role: { min: 85000, max: 110000, avg: 95000 },
              target_role: { min: 100000, max: 130000, avg: 115000 }
            },
            demand_trends: [
              { skill: 'React', demand: 'High', growth: '+15%' },
              { skill: 'TypeScript', demand: 'High', growth: '+20%' }
            ],
            job_market: { 
              openings: 1500, 
              competition: 'Medium',
              cities: [
                { name: 'San Francisco', openings: 350 },
                { name: 'New York', openings: 300 }
              ]
            }
          },
          topUsers: [
            { id: 1, name: 'Alex Johnson', points: 1250, badges: 8, avatar: '' },
            { id: 2, name: 'Sam Martinez', points: 1150, badges: 7, avatar: '' }
          ],
          recentActivities: [
            { id: 1, type: 'resume', action: 'Updated resume', date: '2023-06-01T10:30:00Z' },
            { id: 2, type: 'application', action: 'Applied to Frontend Developer at TechCorp', date: '2023-05-28T14:45:00Z' }
          ],
          opportunities: {
            jobs: [
              { 
                id: 101, 
                title: 'Senior Frontend Developer', 
                company: 'TechCorp', 
                location: 'Remote',
                match: 92,
                posted: '2023-05-25T00:00:00Z',
                saved: false
              }
            ],
            courses: [
              {
                id: 201,
                title: 'GraphQL Fundamentals',
                provider: 'Udemy',
                duration: '10 hours',
                match: 88,
                saved: true
              }
            ]
          },
          learningRoadmap: {
            current_level: 'Intermediate',
            target_level: 'Advanced',
            steps: [
              { id: 1, title: 'Complete TypeScript Course', completed: false },
              { id: 2, title: 'Build 3 Next.js Projects', completed: false }
            ]
          },
          last_updated: new Date().toISOString()
        };
        // Merge with any existing mockDashboardData
        setDashboardData({...mockDashboardData, ...fallbackData});
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
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Compute visible widgets - ensure it doesn't fail if dashboardLayout is null
  const visibleWidgets = dashboardLayout 
    ? dashboardLayout.filter(widgetId => !hiddenWidgets.includes(widgetId))
    : [];
    
  // Get props for a specific widget
  const getWidgetProps = (widgetId) => {
    if (!dashboardData) return { isEmpty: true };
    
    // Add default structure for every widget to prevent errors
    const defaultData = {
      progress: {
        overall: 0,
        resume: 0,
        skills: 0,
        applications: 0,
        interviews: 0,
        networking: 0,
        goals: [],
        nextSteps: []
      },
      resumeScore: {
        overall: 0,
        sections: { content: 0, format: 0, keywords: 0, impact: 0 },
        scores: [
          { name: 'Content', value: 0 },
          { name: 'Format', value: 0 },
          { name: 'Keywords', value: 0 },
          { name: 'Impact', value: 0 }
        ]
      },
      resumeHistory: [],
      currentSkills: [],
      requiredSkills: [],
      targetRole: 'Not specified',
      recommendations: [],
      careerMilestones: [],
      badges: [],
      careerPredictions: [],
      learningPaths: [],
      marketInsights: {
        salary_data: {
          current_role: { min: 0, max: 0, avg: 0 },
          target_role: { min: 0, max: 0, avg: 0 }
        },
        demand_trends: [],
        job_market: { openings: 0, competition: 'Low', cities: [] }
      },
      topUsers: [],
      recentActivities: [],
      opportunities: { jobs: [], courses: [] },
      learningRoadmap: { current_level: '', target_level: '', steps: [] }
    };
    
    // Merge default data with actual data
    const safeData = { ...defaultData, ...dashboardData };
    
    switch (widgetId) {
      case 'userProgress':
        return { data: safeData.progress || defaultData.progress };
      case 'resumeScore':
        return { 
          score: safeData.resumeScore || defaultData.resumeScore,
          history: safeData.resumeHistory || defaultData.resumeHistory,
          resumeScores: safeData.resumeScore || defaultData.resumeScore // Add this for backward compatibility
        };
      case 'skillGap':
        return { 
          currentSkills: safeData.currentSkills || defaultData.currentSkills, 
          requiredSkills: safeData.requiredSkills || defaultData.requiredSkills,
          targetRole: safeData.targetRole || defaultData.targetRole
        };
      case 'aiRecommendation':
        return { recommendations: safeData.recommendations || defaultData.recommendations };
      case 'careerJourney':
        return { milestones: safeData.careerMilestones || defaultData.careerMilestones };
      case 'badges':
        return { badges: safeData.badges || defaultData.badges };
      case 'careerPrediction':
        return { predictions: safeData.careerPredictions || defaultData.careerPredictions };
      case 'learningPaths':
        return { paths: safeData.learningPaths || defaultData.learningPaths };
      case 'marketInsights':
        return { 
          insights: safeData.marketInsights || defaultData.marketInsights,
          marketInsights: safeData.marketInsights || defaultData.marketInsights // Add this for backward compatibility
        };
      case 'leaderboard':
        return { users: safeData.topUsers || defaultData.topUsers };
      case 'activityLog':
        return { activities: safeData.recentActivities || defaultData.recentActivities };
      case 'opportunityAlert':
        return { opportunities: safeData.opportunities || defaultData.opportunities };
      case 'learningRoadmap':
        return { roadmap: safeData.learningRoadmap || defaultData.learningRoadmap };
      default:
        return {};
    }
  };
  
  // Main render
  if (loading && !dashboardData) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
          <Typography variant="h4" gutterBottom>Loading Dashboard...</Typography>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error && !dashboardData) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Typography variant="h5" gutterBottom>Unable to load dashboard data</Typography>
        <Button variant="contained" onClick={refreshDashboard}>
          Try Again
        </Button>
        <Button variant="outlined" color="error" sx={{ ml: 2 }} onClick={handleLogout}>
          Logout
        </Button>
      </Container>
    );
  }
  
  // Show message if no data is available (unexpected state)
  if (!dashboardData || !dashboardLayout) {
    return (
      <Container maxWidth="lg" sx={{ pt: 4, pb: 8 }}>
        <Alert severity="warning" sx={{ mt: 4 }}>
          No dashboard data available. Try refreshing the page.
          <Button 
            onClick={fetchDashboardData} 
            variant="outlined" 
            size="small" 
            startIcon={<RefreshIcon />} 
            sx={{ ml: 2 }}
          >
            Refresh
          </Button>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container 
      component={motion.div}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      maxWidth="xl" 
      sx={{ mt: 1, mb: 4 }}
    >
      {/* Dashboard header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1 }}>
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
            >
              Reset Layout
            </Button>
          </Tooltip>
          
          <Tooltip title="Refresh dashboard">
            <IconButton onClick={refreshDashboard} disabled={loading} sx={{ ml: 1 }}>
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
                const widgetProps = getWidgetProps(widgetId);
                
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