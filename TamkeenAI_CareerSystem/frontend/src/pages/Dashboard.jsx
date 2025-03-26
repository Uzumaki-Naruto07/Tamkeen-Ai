import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Divider,
  Card, CardContent, CardActions, CardHeader, Avatar,
  List, ListItem, ListItemText, ListItemIcon, ListItemAvatar,
  CircularProgress, Alert, Chip, Tooltip, IconButton,
  LinearProgress, Badge, Tabs, Tab, Link as MuiLink,
  Menu, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Snackbar, Zoom, Grow
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
  Group, MenuBook, BusinessCenter, PeopleAlt, Lightbulb
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useUser, useResume } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, formatDistance } from 'date-fns';
import { useAppContext } from '../context/AppContext';

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
  
  const navigate = useNavigate();
  const { profile, updateProfile } = useUser();
  const { resumes } = useResume();
  const { user, logout, toggleTheme, theme } = useAppContext();
  
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
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">Tamkeen AI</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>
              <div className="ml-3 relative">
                <div>
                  <span className="inline-flex items-center px-3 py-1 text-sm rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {user?.name || 'User'}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                className="ml-4 px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-primary-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Resume Analysis
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                          92%
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          ATS Score
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                      View details
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-secondary-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Job Applications
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                          12
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          3 in progress
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                      View details
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Interview Practice
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                          5
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          Sessions
                        </div>
                      </dd>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                      View details
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Welcome to Tamkeen AI Career System
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-300">
                  <p>
                    This demo dashboard showcases the Tamkeen AI Career Intelligence System. 
                    The full version includes resume analysis, interview practice, job tracking, 
                    and personalized career recommendations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;