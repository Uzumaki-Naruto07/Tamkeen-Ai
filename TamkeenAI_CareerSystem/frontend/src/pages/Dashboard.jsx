import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import DescriptionIcon from '@mui/icons-material/Description';

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
import CloudIcon from '@mui/icons-material/Cloud';

// Import API clients
import { api } from '../api/apiClient';
import chatService, { getConnectionStatus } from '../api/chatgpt';

// Import mock data
import mockDashboardData from '../utils/mockData/dashboardData';

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
import ProfileCompletionPrompt from '../components/Dashboard/ProfileCompletionPrompt';
import ResumeExpertPrompt from '../components/Dashboard/ResumeExpertPrompt';
import SkillTransitionChart from '../components/Dashboard/SkillTransitionChart';
import EmiratiJourneyMap from '../components/Dashboard/EmiratiJourneyMap';
import DashboardReportExporter from '../components/Dashboard/DashboardReportExporter';
import WinnerVibeBanner from '../components/Dashboard/WinnerVibeBanner';

// Import context
import { useUser } from '../context/AppContext';

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
  skillTransition: {
    id: 'skillTransition',
    title: 'Skill Transition',
    component: SkillTransitionChart,
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
  emiratiJourney: {
    id: 'emiratiJourney',
    title: 'Emirati Career Path',
    component: EmiratiJourneyMap,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 5
  },
  badges: {
    id: 'badges',
    title: 'Achievements',
    component: BadgesSection,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 6
  },
  careerPrediction: {
    id: 'careerPrediction',
    title: 'Career Predictions',
    component: CareerPredictionSection,
    defaultSize: { xs: 12, md: 6 },
    defaultOrder: 7
  },
  learningPaths: {
    id: 'learningPaths',
    title: 'Learning Paths',
    component: PersonalizedLearningPaths,
    defaultSize: { xs: 12, md: 6 },
    defaultOrder: 8
  },
  marketInsights: {
    id: 'marketInsights',
    title: 'Market Insights',
    component: MarketInsightsSection,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 9
  },
  leaderboard: {
    id: 'leaderboard',
    title: 'Leaderboard',
    component: LeaderboardWidget,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 10
  },
  activityLog: {
    id: 'activityLog',
    title: 'Recent Activities',
    component: ActivityLogSection,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 11
  },
  opportunityAlert: {
    id: 'opportunityAlert',
    title: 'Opportunity Alerts',
    component: OpportunityAlertCard,
    defaultSize: { xs: 12, md: 8 },
    defaultOrder: 12
  },
  dashboardReport: {
    id: 'dashboardReport',
    title: 'Career Report',
    component: DashboardReportExporter,
    defaultSize: { xs: 12, md: 4 },
    defaultOrder: 13
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
  p: 0, // Remove padding from the Paper to allow internal gradient headers
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 3,
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '1px solid rgba(0,0,0,0.04)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
    borderColor: 'rgba(25, 118, 210, 0.1)'
  }
};

// Widget header styling
const widgetHeaderStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 0,
  p: 2.5,
  pb: 2,
  background: 'linear-gradient(145deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.15) 100%)',
  borderBottom: '1px solid rgba(0,0,0,0.06)'
};

// Widget content styling
const widgetContentStyles = {
  p: 2.5,
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column'
};

// Function to generate a gradient background based on widget ID
const getWidgetGradient = (widgetId) => {
  const gradients = {
    userProgress: 'linear-gradient(145deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.15) 100%)',
    resumeScore: 'linear-gradient(145deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.15) 100%)',
    skillGap: 'linear-gradient(145deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.15) 100%)',
    skillTransition: 'linear-gradient(145deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.15) 100%)',
    careerJourney: 'linear-gradient(145deg, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0.15) 100%)',
    emiratiJourney: 'linear-gradient(145deg, rgba(236, 72, 153, 0.05) 0%, rgba(236, 72, 153, 0.15) 100%)',
    badges: 'linear-gradient(145deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.15) 100%)',
    default: 'linear-gradient(145deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.15) 100%)'
  };
  
  return gradients[widgetId] || gradients.default;
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardLayout, setDashboardLayout] = useState(null);
  const [hiddenWidgets, setHiddenWidgets] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [quickStatsMenuAnchor, setQuickStatsMenuAnchor] = useState(null);
  const { profile, user, logout, isAuthenticated, setIsAuthenticated } = useUser();
  const navigate = useNavigate();
  
  // Log mock data availability on mount
  useEffect(() => {
    console.log('Dashboard component mounted');
    console.log('Mock dashboard data available:', mockDashboardData ? 'YES' : 'NO');
    if (mockDashboardData) {
      console.log('Mock data keys:', Object.keys(mockDashboardData));
    }
    
    // Check if we should use mock data from session storage
    const usingMockData = sessionStorage.getItem('usingMockDashboardData') === 'true';
    if (usingMockData && mockDashboardData) {
      console.log('Loading mock data from session storage preference');
      setDashboardData(mockDashboardData);
      
      // Setup default layout
      const defaultLayout = Object.values(widgetMap)
        .sort((a, b) => a.defaultOrder - b.defaultOrder)
        .map(widget => widget.id);
      setDashboardLayout(defaultLayout);
    } else {
      // Otherwise fetch normally
      fetchDashboardData();
    }
  }, []);
  
  // Get dummy data for additional widgets 
  // This would normally come from the API
  const todaysSchedule = dashboardData?.todaysSchedule || [];
  const weeklyGoals = dashboardData?.weeklyGoals || [];
  const jobRecommendations = dashboardData?.jobRecommendations || [];
  
  const [ready, setReady] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [profileCompletionPercentage, setProfileCompletionPercentage] = useState(0);
  const hasCheckedProfile = useRef(false);
  
  // AI service status
  const [aiServiceStatus, setAiServiceStatus] = useState({
    openai: false,
    huggingface: false,
    lastChecked: null
  });

  // Check AI service status
  const checkAiServiceStatus = useCallback(async () => {
    // Check ChatGPT status
    const chatStatus = getConnectionStatus();
    
    setAiServiceStatus(prevStatus => ({
      ...prevStatus,
      openai: chatStatus.isConnected,
      lastChecked: new Date()
    }));
    
    // Make a test request to ChatGPT API to verify connection
    try {
      await chatService.sendMessage("test connection", "", "general");
      setAiServiceStatus(prevStatus => ({
        ...prevStatus,
        openai: true
      }));
    } catch (err) {
      console.warn("ChatGPT service test failed", err);
    }
    
    // Check Hugging Face status
    try {
      // Attempt to make a request to an endpoint that connects to Hugging Face
      // This could be a simple ping or a lightweight model call
      const response = await fetch('/api/huggingface/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const data = await response.json();
      
      setAiServiceStatus(prevStatus => ({
        ...prevStatus,
        huggingface: data.connected || false
      }));
      
      console.log("Hugging Face service status updated:", data.connected ? "Connected" : "Disconnected");
    } catch (err) {
      console.warn("Hugging Face service check failed", err);
      
      // In development/mock mode, simulate a connection with 70% success rate
      if (process.env.NODE_ENV === 'development') {
        const mockConnected = Math.random() > 0.3;
        console.log("Using mock Hugging Face connection:", mockConnected ? "Connected" : "Disconnected");
        
        setAiServiceStatus(prevStatus => ({
          ...prevStatus,
          huggingface: mockConnected
        }));
      } else {
        setAiServiceStatus(prevStatus => ({
          ...prevStatus,
          huggingface: false
        }));
      }
    }
  }, []);
  
  useEffect(() => {
    // Check AI service status initially and then every 5 minutes
    checkAiServiceStatus();
    const interval = setInterval(checkAiServiceStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAiServiceStatus]);
  
  // Initialize dashboard when profile or auth changes
  useEffect(() => {
    // Initialize dashboard
    if (isAuthenticated && profile) {
      fetchDashboardData();
    }
  }, [isAuthenticated, profile]);

  // Add a new effect to update dashboard when application state changes
  useEffect(() => {
    // This will handle updates when returning to the dashboard from other pages
    const handleFocus = () => {
      // Only refetch if we're authenticated and have loaded once before
      if (isAuthenticated && dashboardData) {
        console.log('Window focused, refreshing dashboard data');
        fetchDashboardData();
      }
    };

    // Listen for page focus events - this will update the dashboard when returning from other tabs
    window.addEventListener('focus', handleFocus);
    
    // Set up polling for very frequent data (like notifications)
    const pollInterval = setInterval(() => {
      // Only update for critical real-time data, not the entire dashboard
      if (isAuthenticated) {
        // You could implement a lightweight update function here
        // For example, just updating notifications count
      }
    }, 60000); // Check every minute
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(pollInterval);
    };
  }, [isAuthenticated, dashboardData]);
  
  useEffect(() => {
    // Check profile completion and show prompts if needed
    if (profile && !hasCheckedProfile.current) {
      // Calculate profile completion
      const calculateProfileCompletion = () => {
        // Required fields for a complete profile
        const requiredFields = [
          'firstName',
          'lastName',
          'email',
          'skills',
          'education',
          'experience',
          'careerGoals'
        ];
        
        // Count completed fields
        let completedCount = 0;
        requiredFields.forEach(field => {
          if (profile[field] && 
              ((Array.isArray(profile[field]) && profile[field].length > 0) || 
               (typeof profile[field] === 'object' && Object.keys(profile[field]).length > 0) ||
               (typeof profile[field] === 'string' && profile[field].trim() !== ''))) {
            completedCount++;
          }
        });
        
        // Calculate percentage
        const percentage = Math.round((completedCount / requiredFields.length) * 100);
        setProfileCompletionPercentage(percentage);
        
        // If profile is less than 70% complete, show prompt
        if (percentage < 70) {
          setShowProfilePrompt(true);
        }
        
        // If they have profile but no resume, show resume prompt
        // We'll show this after they dismiss the profile prompt or if profile is complete
        if (percentage >= 70 && (!profile.resume || !profile.resumeScore || profile.resumeScore < 60)) {
          setShowResumePrompt(true);
        }
      };
      
      calculateProfileCompletion();
      hasCheckedProfile.current = true;
    }
  }, [profile]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log('Fetching dashboard data...');
      
      // Initialize a data object that will combine all sources of data
      let combinedData = {
        _source: 'integrated', // Track that this is integrated data
        last_updated: new Date().toISOString() // Add timestamp
      };
      
      try {
        // 1. First attempt to get dashboard data from API
        const response = await api.get('/dashboard/data');
        console.log('Dashboard API response:', response);
        
        // Check if we have valid data in the expected structure
        if (response && response.data && response.data.success === true) {
          console.log('Valid dashboard data received:', response.data.data);
          combinedData = { 
            ...response.data.data,
            _source: 'api', // Mark that this came from the API
            last_updated: new Date().toISOString()
          };
        } else if (response && response.data) {
          // Fallback to direct data if not in the success wrapper format
          console.log('Using direct data response format');
          combinedData = { 
            ...response.data,
            _source: 'api', // Mark that this came from the API
            last_updated: new Date().toISOString()
          };
        }
      } catch (error) {
        console.warn('Could not load dashboard data from API:', error);
        // Continue with collecting data from other sources
      }
      
      // 2. Fetch and integrate data from other parts of the application
      try {
        // A. Get user profile data
        if (profile) {
          combinedData.userProfile = profile;
          
          // Extract and organize profile data
          if (profile.resumeScore) {
            combinedData.resumeScore = {
              overall: profile.resumeScore,
              sections: profile.resumeScoreDetails || { content: 0, format: 0, keywords: 0, impact: 0 },
              scores: [
                { name: 'Content', value: profile.resumeScoreDetails?.content || 0 },
                { name: 'Format', value: profile.resumeScoreDetails?.format || 0 },
                { name: 'Keywords', value: profile.resumeScoreDetails?.keywords || 0 },
                { name: 'Impact', value: profile.resumeScoreDetails?.impact || 0 }
              ]
            };
          }
          
          // Extract skills data
          if (profile.skills && Array.isArray(profile.skills)) {
            combinedData.currentSkills = profile.skills.map(skill => ({
              name: skill.name || skill,
              level: skill.level || 0,
              category: skill.category || 'General'
            }));
          }
          
          // Set up progress data
          combinedData.progress = {
            overall: profile.completionPercentage || 0,
            resume: profile.resumeScore || 0,
            skills: profile.skillsProgress || 0,
            applications: profile.applicationCount || 0,
            interviews: profile.interviewCount || 0,
            networking: profile.networkingScore || 0,
            level: profile.careerLevel || 1,
            rank: profile.careerRank || 'Beginner',
            xp: profile.careerPoints || 0,
            completedGoals: profile.completedGoals || 0,
            goals: profile.goals || [],
            nextSteps: profile.nextSteps || [],
            skillsProgress: profile.skillsProgress || 0
          };
        }
        
        // B. Fetch user's job applications
        try {
          const applicationsResponse = await api.get('/jobs/applications');
          if (applicationsResponse && applicationsResponse.data) {
            const applications = Array.isArray(applicationsResponse.data) 
              ? applicationsResponse.data 
              : (applicationsResponse.data.data || []);
            
            // Add application data
            combinedData.applications = {
              total: applications.length,
              active: applications.filter(app => app.status === 'active' || app.status === 'pending').length,
              interviews: applications.filter(app => app.status === 'interview').length,
              offers: applications.filter(app => app.status === 'offer').length,
              rejected: applications.filter(app => app.status === 'rejected').length
            };
            
            // Add upcoming interviews
            combinedData.upcomingInterviews = applications
              .filter(app => app.status === 'interview' && app.interviewDate)
              .map(app => ({
                company: app.company || 'Company',
                position: app.position || app.jobTitle || 'Position',
                date: app.interviewDate,
                type: app.interviewType || 'In-person'
              }))
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 5); // Show most recent 5
          }
        } catch (err) {
          console.warn('Failed to fetch applications data:', err);
        }
        
        // C. Fetch resume data
        try {
          const resumeResponse = await api.get('/resume');
          if (resumeResponse && resumeResponse.data) {
            const resumes = Array.isArray(resumeResponse.data) 
              ? resumeResponse.data 
              : (resumeResponse.data.data || []);
              
            if (resumes.length > 0) {
              // Get the latest resume history for the resume chart
              const resumeVersions = resumes
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map(resume => ({
                  date: resume.createdAt,
                  score: resume.score || 0
                }))
                .reverse();
                
              combinedData.resumeHistory = resumeVersions;
            }
          }
        } catch (err) {
          console.warn('Failed to fetch resume data:', err);
        }
        
        // D. Fetch saved jobs
        try {
          const savedJobsResponse = await api.get('/jobs/saved');
          if (savedJobsResponse && savedJobsResponse.data) {
            const savedJobs = Array.isArray(savedJobsResponse.data) 
              ? savedJobsResponse.data 
              : (savedJobsResponse.data.data || []);
              
            // Add to opportunities section
            if (!combinedData.opportunities) {
              combinedData.opportunities = { jobs: [], courses: [] };
            }
            
            combinedData.opportunities.jobs = savedJobs.map(job => ({
              id: job.id,
              title: job.title,
              company: job.company,
              location: job.location,
              salary: job.salary,
              matchScore: job.matchScore || Math.floor(Math.random() * 40) + 60, // Random 60-100% if not provided
              url: `/jobs/${job.id}`,
              postedDate: job.postedDate || job.createdAt
            }));
          }
        } catch (err) {
          console.warn('Failed to fetch saved jobs:', err);
        }
        
        // E. Fetch recent activity
        try {
          const activitiesResponse = await api.get('/user/activities');
          if (activitiesResponse && activitiesResponse.data) {
            const activities = Array.isArray(activitiesResponse.data) 
              ? activitiesResponse.data 
              : (activitiesResponse.data.data || []);
              
            combinedData.recentActivities = activities.map(activity => ({
              id: activity.id,
              type: activity.type,
              description: activity.description,
              timestamp: activity.timestamp || activity.createdAt,
              relatedEntityId: activity.relatedEntityId,
              relatedEntityType: activity.relatedEntityType
            })).slice(0, 10); // Show only latest 10 activities
          }
        } catch (err) {
          console.warn('Failed to fetch user activities:', err);
        }
      } catch (error) {
        console.error('Error fetching integrated dashboard data:', error);
      }
      
      // 3. Merge with mock data for any missing sections, but prioritize real data
      // This ensures all widgets have at least some data to display
      if (mockDashboardData) {
        // Create a merged dataset where real data takes precedence
        const mergedData = {
          ...mockDashboardData,
          ...combinedData,
        };
        
        // Set the final dashboard data
        setDashboardData(mergedData);
      } else {
        setDashboardData(combinedData);
      }
      
      setError(null);
      
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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Using mock data as fallback.');
      setDashboardData(mockDashboardData);
      
      // Setup default layout even when error occurs
      const defaultLayout = Object.values(widgetMap)
        .sort((a, b) => a.defaultOrder - b.defaultOrder)
        .map(widget => widget.id);
      setDashboardLayout(defaultLayout);
    } finally {
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
    await fetchDashboardData();
    setLoading(false);
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
  
  // Utility function to show data sources - useful for development/debugging
  const getDataSourceInfo = () => {
    if (!dashboardData) return {};
    
    // Create a map of which data came from where
    const dataSources = {
      fromAPI: false,
      fromProfile: false,
      fromResume: false,
      fromApplications: false,
      fromSavedJobs: false,
      fromActivities: false,
      usingMockData: false
    };
    
    // Check if we have API data
    dataSources.fromAPI = dashboardData && dashboardData._source === 'api';
    
    // Check if we have profile data
    dataSources.fromProfile = dashboardData && dashboardData.userProfile;
    
    // Check if we have resume data
    dataSources.fromResume = dashboardData && dashboardData.resumeHistory && dashboardData.resumeHistory.length > 0;
    
    // Check if we have applications data
    dataSources.fromApplications = dashboardData && dashboardData.applications && dashboardData.applications.total > 0;
    
    // Check if we have saved jobs
    dataSources.fromSavedJobs = dashboardData && dashboardData.opportunities && 
                               dashboardData.opportunities.jobs && 
                               dashboardData.opportunities.jobs.length > 0;
    
    // Check if we have activity data
    dataSources.fromActivities = dashboardData && dashboardData.recentActivities && 
                                dashboardData.recentActivities.length > 0;
    
    // Check if we're using mock data
    dataSources.usingMockData = sessionStorage.getItem('usingMockDashboardData') === 'true';
    
    return dataSources;
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
      
      {/* Add data sources information */}
      <Typography variant="subtitle2" sx={{ mt: 1 }}>
        Data sources:
      </Typography>
      <Box sx={{ mt: 1, ml: 2 }}>
        {Object.entries(getDataSourceInfo()).map(([source, isActive]) => (
          <Typography key={source} variant="body2" sx={{ color: isActive ? 'success.main' : 'text.disabled' }}>
            {source}: {isActive ? '✓' : '✗'}
          </Typography>
        ))}
      </Box>
      
      <Box sx={{ mt: 1, maxHeight: '200px', overflow: 'auto' }}>
        <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
      </Box>
    </Box>
  );
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login');
  };
  
  // Function to reconnect AI services
  const reconnectAIServices = async () => {
    try {
      console.log("Attempting to reconnect AI services...");
      
      // Start with a spinner or loading indicator
      setAiServiceStatus(prev => ({
        ...prev,
        openai: false,
        huggingface: false
      }));
      
      // First check ChatGPT service
      try {
        const response = await chatService.sendMessage("Test connection", "", "general");
        if (response) {
          console.log("ChatGPT reconnected successfully");
          setAiServiceStatus(prev => ({ ...prev, openai: true }));
        }
      } catch (err) {
        console.warn("Failed to reconnect to ChatGPT", err);
        setAiServiceStatus(prev => ({ ...prev, openai: false }));
      }
      
      // Then check Hugging Face service
      try {
        const response = await fetch('/api/huggingface/connect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ reconnect: true })
        });
        
        const data = await response.json();
        
        if (data.connected) {
          console.log("Hugging Face reconnected successfully");
          setAiServiceStatus(prev => ({ ...prev, huggingface: true }));
        } else {
          console.warn("Failed to reconnect to Hugging Face");
          setAiServiceStatus(prev => ({ ...prev, huggingface: false }));
        }
      } catch (err) {
        console.warn("Error reconnecting to Hugging Face", err);
        
        // In development mode, simulate reconnection with 80% success rate
        if (process.env.NODE_ENV === 'development') {
          const mockConnected = Math.random() > 0.2;
          console.log("Using mock Hugging Face reconnection:", mockConnected ? "Connected" : "Failed");
          
          setAiServiceStatus(prev => ({
            ...prev,
            huggingface: mockConnected
          }));
        } else {
          setAiServiceStatus(prev => ({ ...prev, huggingface: false }));
        }
      }
    } catch (err) {
      console.error("Error in reconnection process", err);
    }
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
      learningRoadmap: { current_level: '', target_level: '', steps: [] },
      leaderboard: [
        { id: 1, name: 'Fatima Al Mansoori', avatar: '/avatars/emirati-woman-1.jpg', points: 1250, position: 1 },
        { id: 2, name: 'Mohammed Al Hashimi', avatar: '/avatars/emirati-man-1.jpg', points: 980, position: 2 },
        { id: 3, name: 'Aisha Al Nuaimi', avatar: '/avatars/emirati-woman-2.jpg', points: 850, position: 3 },
        { id: 5, name: 'Omar Al Shamsi', avatar: '/avatars/emirati-man-2.jpg', points: 820, position: 4 },
        { id: 6, name: 'Mariam Al Zaabi', avatar: '/avatars/emirati-woman-3.jpg', points: 765, position: 5 }
      ],
      friends: [
        { id: 1, name: 'Fatima Al Mansoori', avatar: '/avatars/emirati-woman-1.jpg', points: 1250, position: 1 },
        { id: 5, name: 'Omar Al Shamsi', avatar: '/avatars/emirati-man-2.jpg', points: 820, position: 4 },
        { id: 6, name: 'Mariam Al Zaabi', avatar: '/avatars/emirati-woman-3.jpg', points: 765, position: 5 }
      ],
      // Add data for new components
      skillTransitionData: null,
      emiratiJourneyData: null,
      dashboardReportData: {
        userData: profile,
        reportSections: [
          'skillProgress', 
          'careerPath', 
          'jobApplications', 
          'skillGaps', 
          'marketInsights'
        ]
      }
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
      case 'skillTransition':
        return { data: safeData.skillTransitionData || null };
      case 'careerJourney':
        return { milestones: safeData.careerMilestones || defaultData.careerMilestones };
      case 'emiratiJourney':
        return { data: safeData.emiratiJourneyData || null };
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
        return { 
          leaderboard: safeData.leaderboard || defaultData.leaderboard, 
          friends: safeData.friends || defaultData.friends,
          position: {
            user_position: 0, // Not ranked
            total_users: safeData.leaderboard?.length || defaultData.leaderboard.length,
            top_percentile: 0,
            points: 0,
            next_milestone: 100,
            rank_history: [0, 0, 0, 0, 0, 0, 0]
          }
        };
      case 'activityLog':
        return { activities: safeData.recentActivities || defaultData.recentActivities };
      case 'opportunityAlert':
        return { opportunities: safeData.opportunities || defaultData.opportunities };
      case 'dashboardReport':
        return { userData: defaultData.dashboardReportData.userData, reportSections: defaultData.dashboardReportData.reportSections };
      default:
        return {};
    }
  };
  
  // Handle closing prompts
  const handleCloseProfilePrompt = () => {
    setShowProfilePrompt(false);
    
    // If they also need to complete their resume, show that prompt next
    if ((!profile.resume || !profile.resumeScore || profile.resumeScore < 60)) {
      setShowResumePrompt(true);
    }
  };
  
  const handleCloseResumePrompt = () => {
    setShowResumePrompt(false);
  };
  
  // Default emergency fallback
  useEffect(() => {
    // If after 5 seconds we still don't have dashboard data, load mock data
    const timer = setTimeout(() => {
      if (!dashboardData) {
        console.log('Emergency fallback: Loading mock data after timeout');
        setDashboardData(mockDashboardData);
        
        // Setup default layout
        const defaultLayout = Object.values(widgetMap)
          .sort((a, b) => a.defaultOrder - b.defaultOrder)
          .map(widget => widget.id);
        setDashboardLayout(defaultLayout);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [dashboardData]);
  
  // Function to handle loading mock data
  const handleLoadMockData = () => {
    console.log('Loading mock dashboard data...');
    setDashboardData(mockDashboardData);
    setError(null);
    
    // Ensure dashboard widget layout is set
    const defaultLayout = Object.values(widgetMap)
      .sort((a, b) => a.defaultOrder - b.defaultOrder)
      .map(widget => widget.id);
    setDashboardLayout(defaultLayout);
    
    // Set a flag indicating we're using mock data
    sessionStorage.setItem('usingMockDashboardData', 'true');
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
        <Button variant="contained" onClick={handleLoadMockData}>
          Load Mock Data
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
            onClick={handleLoadMockData} 
            variant="outlined" 
            size="small" 
            startIcon={<RefreshIcon />} 
            sx={{ ml: 2 }}
          >
            Load Mock Data
          </Button>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 5 }}>
      {/* Profile and Resume Completion Prompts */}
      <ProfileCompletionPrompt 
        open={showProfilePrompt} 
        onClose={handleCloseProfilePrompt}
      />
      
      <ResumeExpertPrompt
        open={showResumePrompt && !showProfilePrompt}
        onClose={handleCloseResumePrompt}
      />
      
      {/* Resume Completion Alert - always show if resume not completed, even after dialog closed */}
      {(!profile?.resume || !profile?.resumeScore || profile?.resumeScore < 60) && (
        <Paper 
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'warning.light',
            bgcolor: 'warning.light',
            color: 'warning.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DescriptionIcon sx={{ mr: 2, color: 'warning.dark' }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                Your resume needs your attention!
              </Typography>
              <Typography variant="body2">
                Complete your resume to increase your visibility to potential employers.
              </Typography>
            </Box>
          </Box>
          <Button 
            variant="contained" 
            color="warning"
            size="small"
            onClick={() => navigate('/resumePage')}
            sx={{ 
              fontWeight: 'bold',
              borderRadius: 20,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            Build My Resume
          </Button>
        </Paper>
      )}
      
      {/* Header and welcome message */}
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
            Your Career Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: -1 }}>
            Welcome back, {profile?.firstName || 'there'}! {dashboardData?.lastLogin && 
              `Last visit was ${formatDistance(new Date(dashboardData.lastLogin), new Date(), { addSuffix: true })}.`
            }
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title={`AI Services: ${aiServiceStatus.openai ? 'Connected' : 'Disconnected'} (Click to reconnect)`}>
            <Chip
              icon={<PsychologyIcon />}
              label="AI"
              size="small"
              color={aiServiceStatus.openai ? "success" : "error"}
              sx={{ mr: 1, cursor: 'pointer' }}
              onClick={reconnectAIServices}
            />
          </Tooltip>
          
          <Tooltip title={`Hugging Face: ${aiServiceStatus.huggingface ? 'Connected' : 'Disconnected'} (Click to reconnect)`}>
            <Chip
              icon={<CloudIcon />}
              label="HF"
              size="small"
              color={aiServiceStatus.huggingface ? "success" : "error"}
              sx={{ mr: 1, cursor: 'pointer' }}
              onClick={reconnectAIServices}
            />
          </Tooltip>
          
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
            Reset Layout
          </Button>
          
          <Tooltip title="Refresh Dashboard">
            <IconButton 
              onClick={refreshDashboard} 
              disabled={loading}
              sx={{
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.12)'
                }
              }}
            >
              <RefreshIcon sx={{ 
                animation: loading ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Winner Vibe Banner */}
      <Box sx={{ mb: 3 }}>
        <WinnerVibeBanner />
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
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={profile?.avatar} 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  mr: 2, 
                  border: '2px solid white',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                {profile?.firstName?.charAt(0) || "U"}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {profile?.firstName ? `${profile?.firstName} ${profile?.lastName || ''}` : 'User'}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  {dashboardData?.progress?.rank || 'Career Explorer'} - Level {dashboardData?.progress?.level || 1}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 0.5 }}>
                  {dashboardData?.progress?.nextMilestone || 'Complete your profile to see your next career milestone'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData?.progress?.xp || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Career Points
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ 
                  textAlign: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.9 }
                }} onClick={() => setShowProfilePrompt(true)}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={profileCompletionPercentage}
                      sx={{ 
                        color: 'white', 
                        opacity: 0.9,
                        '& .MuiCircularProgress-circle': {
                          strokeLinecap: 'round',
                          strokeWidth: 4,
                        }
                      }}
                      size={50}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {`${profileCompletionPercentage}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                    Profile
                    {profileCompletionPercentage < 100 && (
                      <Chip 
                        label="Improve" 
                        size="small" 
                        sx={{ ml: 1, height: 20, bgcolor: 'rgba(255,255,255,0.2)' }} 
                        onClick={() => setShowProfilePrompt(true)}
                      />
                    )}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ 
                  textAlign: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.9 }
                }} onClick={() => setShowResumePrompt(true)}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={profile?.resumeScore || 0}
                      sx={{ 
                        color: 'white', 
                        opacity: 0.9,
                        '& .MuiCircularProgress-circle': {
                          strokeLinecap: 'round',
                          strokeWidth: 4,
                        }
                      }}
                      size={50}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {`${profile?.resumeScore || 0}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                    Resume
                    {(!profile?.resumeScore || profile?.resumeScore < 85) && (
                      <Chip 
                        label="Improve" 
                        size="small" 
                        sx={{ ml: 1, height: 20, bgcolor: 'rgba(255,255,255,0.2)' }} 
                        onClick={() => setShowResumePrompt(true)}
                      />
                    )}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData?.progress?.completedGoals || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Goals Achieved
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {/* Skills Progress - Mini Bar */}
            <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  Top Skills Progress
                </Typography>
                <Typography variant="caption">
                  {Math.round((dashboardData?.progress?.skillsProgress || 0) * 100) / 100}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={dashboardData?.progress?.skillsProgress || 0} 
                sx={{ 
                  height: 6, 
                  borderRadius: 5,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white'
                  }
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Widgets hidden notice */}
      {hiddenWidgets.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="body2" component="div">
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
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              component={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <Grid container spacing={3}>
                {visibleWidgets.map((widgetId, index) => {
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
                            <Box 
                              sx={{
                                ...widgetHeaderStyles,
                                background: getWidgetGradient(widgetId)
                              }}
                            >
                              <Typography variant="h6" fontWeight="bold">
                                {widget.title}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Hide Widget">
                                  <IconButton size="small" onClick={() => toggleWidgetVisibility(widgetId)}>
                                    <VisibilityOffIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Drag to Reorder">
                                  <Box {...provided.dragHandleProps}>
                                    <DragIndicatorIcon color="action" />
                                  </Box>
                                </Tooltip>
                              </Box>
                            </Box>
                            
                            <Box sx={widgetContentStyles}>
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
          "We, as a people, are not satisfied with anything but first place." 🇦🇪
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          — H.H. Sheikh Mohammed bin Rashid Al Maktoum
        </Typography>
      </Paper>
      
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