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
    <Box sx={{ py: 3 }}>
      {loading ? (
        <LoadingSpinner message="Loading dashboard..." />
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              Dashboard
            </Typography>
            
            <Box>
              <Tooltip title="Notifications">
                <IconButton onClick={(e) => setNotificationMenuAnchor(e.currentTarget)}>
                  <Badge badgeContent={unreadNotificationCount} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Tabs
            value={dashboardTabs}
            onChange={(e, newValue) => setDashboardTabs(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label="Overview" />
            <Tab label="Applications" />
            <Tab label="Career Development" />
          </Tabs>
          
          {dashboardTabs === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    {renderProfileSummary()}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    {renderApplicationStats()}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    {renderUpcomingInterviews()}
                  </Grid>
                  
                  <Grid item xs={12}>
                    {renderJobRecommendations()}
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    {renderTodaysSchedule()}
                  </Grid>
                  
                  <Grid item xs={12}>
                    {renderWeeklyGoals()}
                  </Grid>
                  
                  <Grid item xs={12}>
                    {renderCareerProgress()}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
          
          {dashboardTabs === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                {renderApplicationStats()}
              </Grid>
              
              <Grid item xs={12} md={5}>
                {renderUpcomingInterviews()}
              </Grid>
              
              <Grid item xs={12}>
                {renderJobRecommendations()}
              </Grid>
            </Grid>
          )}
          
          {dashboardTabs === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {renderCareerProgress()}
              </Grid>
              
              <Grid item xs={12} md={6}>
                {renderSkillsSummary()}
              </Grid>
              
              <Grid item xs={12} md={6}>
                {renderCareerInsights()}
              </Grid>
              
              <Grid item xs={12} md={6}>
                {renderRecentActivities()}
              </Grid>
            </Grid>
          )}
          
          {/* Notification menu */}
          <Menu
            anchorEl={notificationMenuAnchor}
            open={Boolean(notificationMenuAnchor)}
            onClose={() => setNotificationMenuAnchor(null)}
            PaperProps={{
              sx: { width: 320, maxHeight: 500, overflow: 'auto' }
            }}
          >
            <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1">
                Notifications
              </Typography>
              
              <Button 
                size="small"
                onClick={markAllNotificationsAsRead}
                disabled={unreadNotificationCount === 0}
              >
                Mark all read
              </Button>
            </Box>
            
            <Divider />
            
            {notifications.length === 0 ? (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  No notifications
                </Typography>
              </MenuItem>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <MenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    py: 1,
                    borderLeft: notification.read ? 'none' : '3px solid',
                    borderLeftColor: 'primary.main',
                    bgcolor: notification.read ? 'inherit' : 'action.hover'
                  }}
                >
                  <ListItemIcon>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography variant="body2" noWrap>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDistance(new Date(notification.timestamp), new Date(), { addSuffix: true })}
                        </Typography>
                      </>
                    }
                    secondaryTypographyProps={{
                      component: 'div'
                    }}
                  />
                </MenuItem>
              ))
            )}
            
            {notifications.length > 10 && (
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Button
                  size="small"
                  component={RouterLink}
                  to="/notifications"
                  onClick={() => setNotificationMenuAnchor(null)}
                >
                  View All
                </Button>
              </Box>
            )}
          </Menu>
          
          {/* Quick actions menu */}
          <Menu
            anchorEl={actionsMenuAnchor}
            open={Boolean(actionsMenuAnchor)}
            onClose={() => setActionsMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleQuickAction('newApplication')}>
              <ListItemIcon>
                <Description />
              </ListItemIcon>
              <ListItemText primary="New Application" />
            </MenuItem>
            
            <MenuItem onClick={() => handleQuickAction('createResume')}>
              <ListItemIcon>
                <Assignment />
              </ListItemIcon>
              <ListItemText primary="Create Resume" />
            </MenuItem>
            
            <MenuItem onClick={() => handleQuickAction('mockInterview')}>
              <ListItemIcon>
                <QuestionAnswer />
              </ListItemIcon>
              <ListItemText primary="Mock Interview" />
            </MenuItem>
            
            <MenuItem onClick={() => handleQuickAction('personalityTest')}>
              <ListItemIcon>
                <Psychology />
              </ListItemIcon>
              <ListItemText primary="Personality Test" />
            </MenuItem>
            
            <MenuItem onClick={() => handleQuickAction('networkingEvent')}>
              <ListItemIcon>
                <Group />
              </ListItemIcon>
              <ListItemText primary="Add Networking Event" />
            </MenuItem>
          </Menu>
          
          {/* Quick Stats menu */}
          <Menu
            anchorEl={quickStatsMenuAnchor}
            open={Boolean(quickStatsMenuAnchor)}
            onClose={() => setQuickStatsMenuAnchor(null)}
          >
            <MenuItem onClick={() => navigate('/applications')}>
              <ListItemIcon>
                <Assignment />
              </ListItemIcon>
              <ListItemText primary="All Applications" />
            </MenuItem>
            
            <MenuItem onClick={() => navigate('/interviews')}>
              <ListItemIcon>
                <QuestionAnswer />
              </ListItemIcon>
              <ListItemText primary="Interviews" />
            </MenuItem>
            
            <MenuItem onClick={() => navigate('/career-progress')}>
              <ListItemIcon>
                <Timeline />
              </ListItemIcon>
              <ListItemText primary="Career Progress" />
            </MenuItem>
          </Menu>
          
          {/* Notification detail dialog */}
          <Dialog
            open={notificationDialogOpen}
            onClose={() => setNotificationDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            {selectedNotification && (
              <>
                <DialogTitle>
                  {selectedNotification.title}
                </DialogTitle>
                
                <DialogContent dividers>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      {selectedNotification.message}
                    </Typography>
                  </Box>
                  
                  {selectedNotification.details && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Details:
                      </Typography>
                      <Typography variant="body2">
                        {selectedNotification.details}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(selectedNotification.timestamp).toLocaleString()}
                    </Typography>
                    
                    <Chip 
                      size="small"
                      label={selectedNotification.type}
                      color={getNotificationColor(selectedNotification.type)}
                    />
                  </Box>
                </DialogContent>
                
                <DialogActions>
                  {selectedNotification.actionUrl && (
                    <Button 
                      onClick={() => {
                        navigate(selectedNotification.actionUrl);
                        setNotificationDialogOpen(false);
                      }}
                    >
                      {selectedNotification.actionText || 'View'}
                    </Button>
                  )}
                  
                  <Button onClick={() => setNotificationDialogOpen(false)}>
                    Close
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
          
          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
            message={snackbarMessage}
          />
        </>
      )}
    </Box>
  );
};

export default Dashboard;