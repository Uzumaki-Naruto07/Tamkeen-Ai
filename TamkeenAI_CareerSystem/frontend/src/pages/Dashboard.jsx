import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Divider,
  Card, CardContent, CardActions, CardHeader, Avatar,
  List, ListItem, ListItemText, ListItemIcon, ListItemAvatar,
  CircularProgress, Alert, Chip, Tooltip, IconButton,
  LinearProgress, Badge, Tabs, Tab, Link as MuiLink,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Zoom, Grow, Container, useTheme, useMediaQuery
} from '@mui/material';
import {
  Work, School, Person, Business, Assignment,
  Timeline, TrendingUp, Psychology, Notifications,
  CalendarToday, Check, CheckCircle, Star, EmojiEvents,
  PlayArrow, ArrowForward, Visibility, Assessment,
  LiveHelp, VideoLibrary, FormatListBulleted, Description,
  QuestionAnswer, Email, BarChart, MoreVert, Add,
  SettingsApplications, Celebration, Flag, DonutLarge,
  AccessAlarm, LocalOffer, ViewTimeline, MilitaryTech,
  Group, MenuBook, BusinessCenter, PeopleAlt, Lightbulb,
  Refresh
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useUser, useResume } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, formatDistance } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import UserProgressCard from '../components/Dashboard/UserProgressCard';
import SkillProgressSection from '../components/Dashboard/SkillProgressSection';
import ResumeScoreChart from '../components/Dashboard/ResumeScoreChart';
import CareerPathsSection from '../components/Dashboard/CareerPathsSection';
import MarketInsightsSection from '../components/Dashboard/MarketInsightsSection';
import BadgesSection from '../components/Dashboard/BadgesSection';
import ActivityLogSection from '../components/Dashboard/ActivityLogSection';
import CareerPredictionSection from '../components/Dashboard/CareerPredictionSection';
import LeaderboardWidget from '../components/Dashboard/LeaderboardWidget';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveRadar } from '@nivo/radar';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import AIRecommendationCard from '../components/Dashboard/AIRecommendationCard';
import OpportunityAlertCard from '../components/Dashboard/OpportunityAlertCard';
import CareerJourneyTimeline from '../components/Dashboard/CareerJourneyTimeline';
import SkillGapAnalysis from '../components/Dashboard/SkillGapAnalysis';
import IndustryTrendsWidget from '../components/Dashboard/IndustryTrendsWidget';
import PersonalizedLearningPaths from '../components/Dashboard/PersonalizedLearningPaths';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    profileCompletion: 0,
    applications: {
      total: 0,
      active: 0,
      interviews: 0,
      offers: 0,
      rejected: 0
    },
    upcomingInterviews: [],
    recentActivities: [],
    skills: {
      top: [],
      inDemand: [],
      improvement: []
    },
    careerProgress: {
      level: 0,
      xp: 0,
      nextLevelXp: 100,
      recentAchievements: []
    },
    insights: []
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [weeklyGoals, setWeeklyGoals] = useState([]);
  const [jobRecommendations, setJobRecommendations] = useState([]);
  const [notificationMenuAnchor, setNotificationMenuAnchor] = useState(null);
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [dashboardTabs, setDashboardTabs] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [quickStatsMenuAnchor, setQuickStatsMenuAnchor] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  const navigate = useNavigate();
  const { profile, updateProfile } = useUser();
  const { resumes } = useResume();
  const { user, logout, toggleTheme, theme } = useAppContext();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch main dashboard data
        const dashboardResponse = await apiEndpoints.dashboard.getData(profile.id);
        setDashboardData(dashboardResponse.data || {});
        
        // Fetch notifications
        const notificationsResponse = await apiEndpoints.notifications.getAll(profile.id);
        setNotifications(notificationsResponse.data || []);
        setUnreadNotificationCount(
          (notificationsResponse.data || []).filter(n => !n.read).length
        );
        
        // Fetch today's schedule
        const todayResponse = await apiEndpoints.calendar.getTodayEvents(profile.id);
        setTodaysSchedule(todayResponse.data || []);
        
        // Fetch weekly goals
        const goalsResponse = await apiEndpoints.goals.getWeeklyGoals(profile.id);
        setWeeklyGoals(goalsResponse.data || []);
        
        // Fetch job recommendations
        const jobsResponse = await apiEndpoints.jobs.getPersonalizedRecommendations(profile.id);
        setJobRecommendations(jobsResponse.data || []);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [profile]);
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setNotificationDialogOpen(true);
    setNotificationMenuAnchor(null);
    
    // Mark notification as read if it's not
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
  };
  
  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await apiEndpoints.notifications.markAsRead(notificationId);
      
      // Update local notifications state
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      setNotifications(updatedNotifications);
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await apiEndpoints.notifications.markAllAsRead(profile.id);
      
      // Update local notifications state
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      
      setNotifications(updatedNotifications);
      setUnreadNotificationCount(0);
      setNotificationMenuAnchor(null);
      
      setSnackbarMessage('All notifications marked as read');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };
  
  // Navigate to selected action
  const handleQuickAction = (action) => {
    setActionsMenuAnchor(null);
    
    switch (action) {
      case 'newApplication':
        navigate('/applications', { state: { openAddNew: true } });
        break;
      case 'createResume':
        navigate('/cv-builder', { state: { createNew: true } });
        break;
      case 'mockInterview':
        navigate('/mock-interview');
        break;
      case 'personalityTest':
        navigate('/personality-profile', { state: { openTest: true } });
        break;
      case 'networkingEvent':
        navigate('/networking', { state: { openAddEvent: true } });
        break;
      default:
        break;
    }
  };
  
  // Complete a goal
  const handleCompleteGoal = async (goalId) => {
    try {
      await apiEndpoints.goals.completeGoal(goalId);
      
      // Update local goals state
      const updatedGoals = weeklyGoals.map(g => 
        g.id === goalId ? { ...g, completed: true } : g
      );
      
      setWeeklyGoals(updatedGoals);
      
      setSnackbarMessage('Goal marked as complete!');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error completing goal:', err);
    }
  };
  
  // Render profile completion summary
  const renderProfileSummary = () => (
    <Card>
      <CardHeader
        avatar={
          <Avatar 
            alt={profile.name} 
            src={profile.avatar}
            sx={{ bgcolor: 'primary.main' }}
          >
            {profile.name ? profile.name.charAt(0) : <Person />}
          </Avatar>
        }
        title={
          <Typography variant="h6">
            Welcome back, {profile.name || 'User'}!
          </Typography>
        }
        subheader={`Last login: ${profile.lastLogin ? format(new Date(profile.lastLogin), 'PPpp') : 'First time login'}`}
      />
      
      <CardContent>
        <Typography variant="body2" gutterBottom>
          Profile Completion
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={dashboardData.profileCompletion} 
            sx={{ flexGrow: 1, mr: 2, height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary">
            {dashboardData.profileCompletion}%
          </Typography>
        </Box>
        
        {dashboardData.profileCompletion < 100 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Complete your profile to improve job matching and recommendations.
          </Typography>
        )}
      </CardContent>
      
      <CardActions>
        <Button 
          size="small"
          startIcon={<Person />}
          component={RouterLink}
          to="/profile"
        >
          View Profile
        </Button>
        
        <Button
          size="small"
          startIcon={<SettingsApplications />}
          component={RouterLink}
          to="/settings"
        >
          Settings
        </Button>
        
        <Button
          size="small"
          startIcon={<Add />}
          onClick={(e) => setActionsMenuAnchor(e.currentTarget)}
        >
          Quick Actions
        </Button>
      </CardActions>
    </Card>
  );
  
  // Render application statistics
  const renderApplicationStats = () => (
    <Card>
      <CardHeader
        title="Application Statistics"
        action={
          <IconButton onClick={(e) => setQuickStatsMenuAnchor(e.currentTarget)}>
            <MoreVert />
          </IconButton>
        }
      />
      
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {dashboardData.applications.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Applications
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {dashboardData.applications.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {dashboardData.applications.interviews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interviews
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {dashboardData.applications.offers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Offers
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {dashboardData.applications.rejected}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Rejected
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary.main">
                {dashboardData.applications.offers > 0 ? 
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
          startIcon={<FormatListBulleted />}
          component={RouterLink}
          to="/applications"
        >
          View Applications
        </Button>
        
        <Button
          size="small"
          startIcon={<Assessment />}
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
        {dashboardData.upcomingInterviews.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No upcoming interviews scheduled.
          </Typography>
        ) : (
          <List dense>
            {dashboardData.upcomingInterviews.slice(0, 3).map((interview, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Business />
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
          startIcon={<Psychology />}
          component={RouterLink}
          to="/mock-interview"
        >
          Practice Interview
        </Button>
        
        <Button
          size="small"
          startIcon={<CalendarToday />}
          component={RouterLink}
          to="/calendar"
        >
          View Calendar
        </Button>
      </CardActions>
    </Card>
  );
  
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
          startIcon={<Add />}
          component={RouterLink}
          to="/calendar/add"
        >
          Add Event
        </Button>
      </CardActions>
    </Card>
  );
  
  // Get icon for event type
  const getEventIcon = (type) => {
    switch (type) {
      case 'Interview':
        return <QuestionAnswer />;
      case 'Meeting':
        return <Group />;
      case 'Deadline':
        return <AccessAlarm />;
      case 'Networking':
        return <PeopleAlt />;
      case 'Learning':
        return <MenuBook />;
      default:
        return <CalendarToday />;
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
  
  // Render weekly goals
  const renderWeeklyGoals = () => (
    <Card>
      <CardHeader title="Weekly Goals" />
      
      <CardContent>
        {weeklyGoals.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No goals set for this week.
          </Typography>
        ) : (
          <List dense>
            {weeklyGoals.map((goal, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {goal.completed ? <CheckCircle color="success" /> : <Flag color="warning" />}
                </ListItemIcon>
                
                <ListItemText
                  primary={goal.title}
                  secondary={goal.dueDate ? `Due: ${format(new Date(goal.dueDate), 'PP')}` : null}
                  sx={goal.completed ? { textDecoration: 'line-through', opacity: 0.7 } : {}}
                />
                
                {!goal.completed && (
                  <Tooltip title="Mark as completed">
                    <IconButton 
                      edge="end"
                      onClick={() => handleCompleteGoal(goal.id)}
                      size="small"
                    >
                      <Check />
                    </IconButton>
                  </Tooltip>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<Add />}
          component={RouterLink}
          to="/goals"
        >
          Manage Goals
        </Button>
      </CardActions>
    </Card>
  );
  
  // Render job recommendations
  const renderJobRecommendations = () => (
    <Card>
      <CardHeader 
        title="Job Recommendations" 
        subheader="Based on your profile and preferences"
      />
      
      <CardContent>
        <Grid container spacing={2}>
          {jobRecommendations.length === 0 ? (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                Complete your profile to get personalized job recommendations.
              </Typography>
            </Grid>
          ) : (
            jobRecommendations.slice(0, 3).map((job, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', mb: 1 }}>
                      <Avatar 
                        src={job.companyLogo} 
                        alt={job.company}
                        variant="rounded"
                        sx={{ mr: 2, width: 40, height: 40 }}
                      >
                        <Business />
                      </Avatar>
                      
                      <Box>
                        <Typography variant="subtitle1" component="div">
                          {job.title}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary">
                          {job.company}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Chip 
                        label={job.location} 
                        size="small" 
                        icon={<LocationOn fontSize="small" />}
                        sx={{ mr: 1 }}
                      />
                      
                      <Chip 
                        label={job.jobType} 
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      
                      <Typography variant="caption" color="text.secondary">
                        {job.datePosted ? formatDistance(new Date(job.datePosted), new Date(), { addSuffix: true }) : ''}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" color="primary" sx={{ mr: 1 }}>
                        Match Score:
                      </Typography>
                      
                      <LinearProgress 
                        variant="determinate" 
                        value={job.matchPercentage} 
                        sx={{ flexGrow: 1, mr: 1, height: 6, borderRadius: 3 }}
                      />
                      
                      <Typography variant="caption" color="text.secondary">
                        {job.matchPercentage}%
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small"
                      component={RouterLink}
                      to={`/jobs/${job.id}`}
                    >
                      View Details
                    </Button>
                    
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/applications/new?jobId=${job.id}`}
                    >
                      Apply Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<BusinessCenter />}
          component={RouterLink}
          to="/jobs"
        >
          Browse All Jobs
        </Button>
      </CardActions>
    </Card>
  );
  
  // Render career progress and achievements
  const renderCareerProgress = () => (
    <Card>
      <CardHeader title="Career Progress" />
      
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Career Level: {dashboardData.careerProgress.level}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LinearProgress 
              variant="determinate" 
              value={(dashboardData.careerProgress.xp / dashboardData.careerProgress.nextLevelXp) * 100} 
              sx={{ flexGrow: 1, mr: 2, height: 8, borderRadius: 4 }}
            />
            
            <Typography variant="body2" color="text.secondary">
              {dashboardData.careerProgress.xp}/{dashboardData.careerProgress.nextLevelXp} XP
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          Recent Achievements
        </Typography>
        
        {dashboardData.careerProgress.recentAchievements.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
            No recent achievements.
          </Typography>
        ) : (
          <List dense>
            {dashboardData.careerProgress.recentAchievements.slice(0, 3).map((achievement, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <EmojiEvents color="warning" />
                </ListItemIcon>
                
                <ListItemText
                  primary={achievement.title}
                  secondary={`+${achievement.xpGained} XP • ${formatDistance(new Date(achievement.date), new Date(), { addSuffix: true })}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<MilitaryTech />}
          component={RouterLink}
          to="/gamified-progress"
        >
          View Progress
        </Button>
      </CardActions>
    </Card>
  );
  
  // Render career insights
  const renderCareerInsights = () => (
    <Card>
      <CardHeader 
        title="Career Insights" 
        subheader="Personalized insights for your career journey"
      />
      
      <CardContent>
        {dashboardData.insights.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            We'll generate insights as you use the platform more.
          </Typography>
        ) : (
          <List dense>
            {dashboardData.insights.slice(0, 3).map((insight, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Lightbulb color="warning" />
                </ListItemIcon>
                
                <ListItemText
                  primary={insight.title}
                  secondary={insight.description}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<Psychology />}
          component={RouterLink}
          to="/career-explorer"
        >
          Explore More
        </Button>
      </CardActions>
    </Card>
  );
  
  // Render skills summary
  const renderSkillsSummary = () => (
    <Card>
      <CardHeader 
        title="Skills Summary" 
        subheader="Your skills profile and opportunities"
      />
      
      <CardContent>
        <Typography variant="subtitle2" gutterBottom>
          Your Top Skills
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          {dashboardData.skills.top.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
              Add skills to your profile to see them here.
            </Typography>
          ) : (
            dashboardData.skills.top.slice(0, 5).map((skill, index) => (
              <Chip 
                key={index}
                label={skill.name}
                size="small"
                icon={skill.verified ? <VerifiedUser fontSize="small" /> : null}
                sx={{ m: 0.5 }}
              />
            ))
          )}
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>
          In-Demand Skills
        </Typography>
        
        <Box>
          {dashboardData.skills.inDemand.slice(0, 3).map((skill, index) => (
            <Chip 
              key={index}
              label={skill.name}
              size="small"
              color="warning"
              icon={<TrendingUp fontSize="small" />}
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<Assessment />}
          component={RouterLink}
          to="/skill-builder"
        >
          Skill Builder
        </Button>
      </CardActions>
    </Card>
  );
  
  // Render recent activities
  const renderRecentActivities = () => (
    <Card>
      <CardHeader 
        title="Recent Activities" 
        subheader="Your latest platform activities"
      />
      
      <CardContent>
        {dashboardData.recentActivities.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No recent activities yet.
          </Typography>
        ) : (
          <List dense>
            {dashboardData.recentActivities.slice(0, 5).map((activity, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  {getActivityIcon(activity.type)}
                </ListItemIcon>
                
                <ListItemText
                  primary={activity.description}
                  secondary={formatDistance(new Date(activity.timestamp), new Date(), { addSuffix: true })}
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
      
      <CardActions>
        <Button
          size="small"
          startIcon={<ViewTimeline />}
          component={RouterLink}
          to="/activity"
        >
          View All Activities
        </Button>
      </CardActions>
    </Card>
  );
  
  // Get icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'application':
        return <Description color="primary" />;
      case 'interview':
        return <QuestionAnswer color="warning" />;
      case 'resume':
        return <Assignment color="info" />;
      case 'networking':
        return <PeopleAlt color="secondary" />;
      case 'learning':
        return <School color="success" />;
      case 'achievement':
        return <EmojiEvents color="error" />;
      default:
        return <Timeline />;
    }
  };
  
  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your personalized dashboard...
        </Typography>
        <Box sx={{ width: '300px', mt: 2 }}>
          <LinearProgress />
        </Box>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography color="error" variant="h6">{error}</Typography>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={handleRefresh}
        >
          Try Again
        </Button>
      </Box>
    );
  }
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        mt: 3
      }}>
        <Typography variant="h4" component="h1">
          Your Career Dashboard
        </Typography>
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRefresh} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
        >
          <Tab label="Overview" icon={<TrendingUp />} iconPosition="start" />
          <Tab label="Career Path" icon={<Work />} iconPosition="start" />
          <Tab label="Skills" icon={<School />} iconPosition="start" />
          <Tab label="Resume" icon={<Assignment />} iconPosition="start" />
          <Tab label="Achievements" icon={<EmojiEvents />} iconPosition="start" />
        </Tabs>
      </Box>
      
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Top row - Summary cards */}
          <Grid item xs={12} md={8}>
            <UserProgressCard userProgress={dashboardData.user_progress} />
          </Grid>
          <Grid item xs={12} md={4}>
            <OpportunityAlertCard opportunities={dashboardData.opportunity_alerts} />
          </Grid>
          
          {/* Second row - AI recommendations and skill progress */}
          <Grid item xs={12} md={4}>
            <AIRecommendationCard recommendations={dashboardData.ai_recommendations} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Skill Radar - You vs. Industry
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveRadar
                  data={skillRadarData}
                  keys={['you', 'industry average', 'top performers']}
                  indexBy="skill"
                  maxValue={100}
                  margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
                  borderColor={{ from: 'color' }}
                  gridLabelOffset={36}
                  dotSize={10}
                  dotColor={{ theme: 'background' }}
                  dotBorderWidth={2}
                  colors={{ scheme: 'category10' }}
                  blendMode="multiply"
                  motionConfig="wobbly"
                  legends={[
                    {
                      anchor: 'top-left',
                      direction: 'column',
                      translateX: -50,
                      translateY: -40,
                      itemWidth: 80,
                      itemHeight: 20,
                      itemTextColor: '#999',
                      symbolSize: 12,
                      symbolShape: 'circle',
                      effects: [
                        {
                          on: 'hover',
                          style: {
                            itemTextColor: '#000'
                          }
                        }
                      ]
                    }
                  ]}
                />
              </Box>
            </Paper>
          </Grid>
          
          {/* Third row - Career journey and market insights */}
          <Grid item xs={12}>
            <CareerJourneyTimeline journeyData={careerJourneyData} />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <MarketInsightsSection marketInsights={dashboardData.market_insights} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <LeaderboardWidget position={dashboardData.leaderboard_position} />
            </Box>
            <ActivityLogSection activityLog={dashboardData.activity_log} />
          </Grid>
        </Grid>
      )}
      
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <CareerPathsSection careerPaths={dashboardData.career_paths} />
          </Grid>
          <Grid item xs={12} md={6}>
            <CareerPredictionSection prediction={dashboardData.career_prediction} />
          </Grid>
          <Grid item xs={12}>
            <IndustryTrendsWidget />
          </Grid>
        </Grid>
      )}
      
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <SkillProgressSection skillProgress={dashboardData.skill_progress} />
          </Grid>
          <Grid item xs={12} md={4}>
            <SkillGapAnalysis skillGaps={dashboardData.skill_progress.skill_gaps} />
          </Grid>
          <Grid item xs={12}>
            <PersonalizedLearningPaths />
          </Grid>
        </Grid>
      )}
      
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ResumeScoreChart resumeScores={dashboardData.resume_scores} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resume Optimization Suggestions
              </Typography>
              <Box sx={{ mt: 2 }}>
                {/* Resume optimization content */}
                <Typography variant="body1" paragraph>
                  Based on AI analysis of your resume and target job descriptions, here are personalized suggestions to improve your resume:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body1" paragraph>
                      <strong>Highlight your React experience more prominently</strong> - This is a key skill for your target roles.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1" paragraph>
                      <strong>Add more quantifiable achievements</strong> - Numbers and metrics make your accomplishments more impactful.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1" paragraph>
                      <strong>Include relevant keywords</strong> - Add "TypeScript" and "Redux" to improve ATS matching.
                    </Typography>
                  </li>
                </ul>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate('/resume-builder')}
                >
                  Update Resume
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                ATS Compatibility Score
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsivePie
                  data={[
                    {
                      id: "ATS Score",
                      label: "ATS Score",
                      value: 85,
                      color: "hsl(207, 70%, 50%)"
                    },
                    {
                      id: "Gap",
                      label: "Gap",
                      value: 15,
                      color: "hsl(0, 0%, 90%)"
                    }
                  ]}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={{ scheme: 'blues' }}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  enableArcLinkLabels={false}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                />
              </Box>
              <Typography variant="body1" align="center">
                Your resume is 85% compatible with ATS systems
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <BadgesSection badges={dashboardData.badges} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Achievements
              </Typography>
              {/* Achievements content */}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Milestones
              </Typography>
              {/* Milestones content */}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;