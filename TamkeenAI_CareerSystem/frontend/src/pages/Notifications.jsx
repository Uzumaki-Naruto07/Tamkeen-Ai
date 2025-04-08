import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction, IconButton,
  Divider, Button, Tabs, Tab, Badge, Chip,
  Menu, MenuItem, CircularProgress, Alert,
  Switch, FormControlLabel, Tooltip, Checkbox,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, FormControl, InputLabel,
  Pagination, Snackbar, Container, Card, CardContent,
  Grid, Avatar, Fade, Slide, Zoom
} from '@mui/material';
import {
  Notifications as NotificationsIcon, Close, Delete,
  CheckCircle, Info, Warning, Error as ErrorIcon,
  MoreVert, FilterList, Settings, ClearAll, Refresh,
  Visibility, VisibilityOff, NotificationsActive,
  NotificationsOff, NotificationImportant, Email,
  Flag, AccessTime, Work, School, Assignment, Event,
  Person, Message, Mail, FormatListBulleted, 
  Bookmark, Star, ArrowBack, CheckCircleOutline,
  DeleteOutline, DoNotDisturbAlt, Schedule, Business,
  Description, Group, Article, Feedback, Public,
  DeleteSweep, CalendarToday, WorkOutline, Payment
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, formatDistanceToNow } from 'date-fns';
import { useDebounce } from '../hooks/useDebounce';
import { useTranslation } from 'react-i18next';

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Unread, 2: Read
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationDetailsOpen, setNotificationDetailsOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    notificationTypes: {
      applications: true,
      interviews: true,
      messages: true,
      jobs: true,
      learning: true,
      system: true
    },
    emailFrequency: 'immediate' // immediate, daily, weekly, none
  });
  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    types: [], // empty array means all types
    dateRange: 'all' // all, today, week, month
  });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const navigate = useNavigate();
  const { profile, user } = useUser();
  const { t } = useTranslation();
  
  const [standardNotifications, setStandardNotifications] = useState([
    { 
      id: 'std-1', 
      messageKey: 'notifications.newJobRecommendation', 
      message: 'New job recommendation available', 
      read: false,
      date: new Date().toISOString(),
      icon: <WorkOutline color="primary" />,
      type: 'job'
    },
    { 
      id: 'std-2', 
      messageKey: 'notifications.resumeUpdate', 
      message: 'Your resume needs updating', 
      read: false,
      date: new Date(Date.now() - 86400000).toISOString(),
      icon: <Description color="primary" />,
      type: 'resume'
    },
    { 
      id: 'std-3', 
      messageKey: 'notifications.skillGap', 
      message: 'Skill gap detected in your profile', 
      read: false,
      date: new Date(Date.now() - 172800000).toISOString(),
      icon: <School color="primary" />,
      type: 'skill'
    },
    { 
      id: 'std-4', 
      messageKey: 'notifications.bookingConfirmation', 
      message: 'You have a session with Sarah Johnson on Tuesday, April 1 at 3:00 PM.', 
      read: false,
      date: new Date(Date.now() - 3600000).toISOString(),
      title: 'Coaching Session Booked',
      icon: <CalendarToday color="primary" />,
      type: 'booking_reminder'
    },
    { 
      id: 'std-5', 
      messageKey: 'notifications.paymentConfirmation', 
      message: 'You have paid AED 312 for your session with Sarah Johnson.', 
      read: false,
      date: new Date(Date.now() - 3600000).toISOString(),
      title: 'Payment Confirmation',
      icon: <Payment color="primary" />,
      type: 'payment'
    }
  ]);
  
  // Load notifications
  useEffect(() => {
    const loadNotifications = () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get booking notifications from localStorage
        const bookingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        
        // Combine with standard notifications
        let allNotifications = [...bookingNotifications, ...standardNotifications];
        
        // Filter based on active tab
        if (activeTab === 1) {
          // Only unread
          allNotifications = allNotifications.filter(notification => !notification.read);
        } else if (activeTab === 2) {
          // Only read
          allNotifications = allNotifications.filter(notification => notification.read);
        }
        
        // Sort by date (newest first)
        allNotifications.sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date();
          const dateB = b.date ? new Date(b.date) : new Date();
          return dateB - dateA;
        });
        
        setNotifications(allNotifications);
        setTotalNotifications(allNotifications.length);
      } catch (err) {
        console.warn('Error loading notifications:', err);
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadNotifications();
  }, [activeTab, standardNotifications]);
  
  // Load notification settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
          setNotificationSettings(JSON.parse(savedSettings));
        }
      } catch (err) {
        console.warn('Error loading notification settings:', err);
      }
    };
    
    loadSettings();
  }, []);
  
  // Get icon based on notification type
  const getNotificationIcon = (notification) => {
    if (notification.icon) {
      return notification.icon;
    }
    
    const iconColors = {
      application: '#4e54c8', // deeper indigo with gradient
      interview: '#ec407a',   // brighter pink
      message: '#00b0ff',     // brighter blue
      job: '#ff6d00',         // deeper orange
      learning: '#00c853',    // brighter green
      system: '#aa00ff',      // brighter purple
      alert: '#ff1744',       // brighter red
      booking_reminder: '#00bfa5', // brighter teal
      resume: '#8d6e63',      // warmer brown
      skill: '#7c4dff'        // brighter deep purple
    };
    
    // New gradient backgrounds for avatars
    const gradientBgs = {
      application: 'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)',
      interview: 'linear-gradient(135deg, #ec407a 0%, #f48fb1 100%)',
      message: 'linear-gradient(135deg, #00b0ff 0%, #80d8ff 100%)',
      job: 'linear-gradient(135deg, #ff6d00 0%, #ffab40 100%)',
      learning: 'linear-gradient(135deg, #00c853 0%, #69f0ae 100%)',
      system: 'linear-gradient(135deg, #aa00ff 0%, #ea80fc 100%)',
      alert: 'linear-gradient(135deg, #ff1744 0%, #ff8a80 100%)',
      booking_reminder: 'linear-gradient(135deg, #00bfa5 0%, #64ffda 100%)',
      resume: 'linear-gradient(135deg, #8d6e63 0%, #bcaaa4 100%)',
      skill: 'linear-gradient(135deg, #7c4dff 0%, #b388ff 100%)',
      default: 'linear-gradient(135deg, #757575 0%, #bdbdbd 100%)'
    };
    
    // Store gradient background in notification object for use in other components
    notification.gradientBg = gradientBgs[notification.type] || gradientBgs.default;
    
    // Icon with enhanced glow effect - replaced with pulsing circle icon
    const iconWithGlow = (icon) => React.cloneElement(icon, { 
      sx: { 
        color: 'white',
        fontSize: '1.3rem',
      } 
    });
    
    switch (notification.type) {
      case 'application':
        return iconWithGlow(<Assignment />);
      case 'interview':
        return iconWithGlow(<Event />);
      case 'message':
        return iconWithGlow(<Mail />);
      case 'job':
        return iconWithGlow(<Work />);
      case 'learning':
        return iconWithGlow(<School />);
      case 'system':
        return iconWithGlow(<Info />);
      case 'alert':
        return iconWithGlow(<Warning />);
      case 'booking_reminder':
        return iconWithGlow(<CalendarToday />);
      case 'resume':
        return iconWithGlow(<Description />);
      case 'skill':
        return iconWithGlow(<WorkOutline />);
      default:
        return iconWithGlow(<NotificationsIcon />);
    }
  };
  
  // Handle mark as read
  const handleMarkAsRead = (notificationId) => {
    try {
      // Update in localStorage
      const bookingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedBookingNotifications = bookingNotifications.map(notification => 
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );
      localStorage.setItem('notifications', JSON.stringify(updatedBookingNotifications));
      
      // Update standard notifications
      const updatedStandardNotifications = standardNotifications.map(notification => 
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );
      setStandardNotifications(updatedStandardNotifications);
      
      // Update the local state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
      
      setSnackbarMessage('Notification marked as read');
      setSnackbarOpen(true);
      
      // Close the menu if open
      setMenuAnchorEl(null);
    } catch (err) {
      console.warn('Error marking notification as read:', err);
      setSnackbarMessage('Failed to update notification');
      setSnackbarOpen(true);
    }
  };
  
  // Handle mark as unread
  const handleMarkAsUnread = (notificationId) => {
    try {
      // Update in localStorage
      const bookingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedBookingNotifications = bookingNotifications.map(notification => 
        notification.id === notificationId
          ? { ...notification, read: false }
          : notification
      );
      localStorage.setItem('notifications', JSON.stringify(updatedBookingNotifications));
      
      // Update standard notifications
      const updatedStandardNotifications = standardNotifications.map(notification => 
        notification.id === notificationId
          ? { ...notification, read: false }
          : notification
      );
      setStandardNotifications(updatedStandardNotifications);
      
      // Update the local state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId
          ? { ...notification, read: false }
          : notification
      ));
      
      setSnackbarMessage('Notification marked as unread');
      setSnackbarOpen(true);
      
      // Close the menu if open
      setMenuAnchorEl(null);
    } catch (err) {
      console.warn('Error marking notification as unread:', err);
      setSnackbarMessage('Failed to update notification');
      setSnackbarOpen(true);
    }
  };
  
  // Handle delete notification
  const handleDeleteNotification = (notificationId) => {
    try {
      // Delete from localStorage if it's a booking notification
      const bookingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedBookingNotifications = bookingNotifications.filter(
        notification => notification.id !== notificationId
      );
      localStorage.setItem('notifications', JSON.stringify(updatedBookingNotifications));
      
      // Remove from standard notifications if it's a standard notification
      const updatedStandardNotifications = standardNotifications.filter(
        notification => notification.id !== notificationId
      );
      setStandardNotifications(updatedStandardNotifications);
      
      // Update the local state
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
      
      setSnackbarMessage('Notification deleted');
      setSnackbarOpen(true);
      
      // Close the menu if open
      setMenuAnchorEl(null);
    } catch (err) {
      console.warn('Error deleting notification:', err);
      setSnackbarMessage('Failed to delete notification');
      setSnackbarOpen(true);
    }
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    try {
      // Mark all booking notifications as read in localStorage
      const bookingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedBookingNotifications = bookingNotifications.map(notification => ({
        ...notification,
        read: true
      }));
      localStorage.setItem('notifications', JSON.stringify(updatedBookingNotifications));
      
      // Mark all standard notifications as read
      const updatedStandardNotifications = standardNotifications.map(notification => ({
        ...notification,
        read: true
      }));
      setStandardNotifications(updatedStandardNotifications);
      
      // Update the local state
      setNotifications(notifications.map(notification => ({
        ...notification,
        read: true
      })));
      
      setSnackbarMessage('All notifications marked as read');
      setSnackbarOpen(true);
    } catch (err) {
      console.warn('Error marking all notifications as read:', err);
      setSnackbarMessage('Failed to update notifications');
      setSnackbarOpen(true);
    }
  };
  
  // Handle clear all notifications
  const handleClearAll = () => {
    try {
      // Clear all booking notifications from localStorage
      localStorage.setItem('notifications', JSON.stringify([]));
      
      // Set standard notifications as read instead of removing them
      const updatedStandardNotifications = standardNotifications.map(notification => ({
        ...notification,
        read: true
      }));
      setStandardNotifications(updatedStandardNotifications);
      
      // Update the local state - only keep standard notifications but mark them as read
      setNotifications(updatedStandardNotifications);
      
      setSnackbarMessage('All notifications cleared');
      setSnackbarOpen(true);
    } catch (err) {
      console.warn('Error clearing notifications:', err);
      setSnackbarMessage('Failed to clear notifications');
      setSnackbarOpen(true);
    }
  };
  
  // Handle save settings
  const handleSaveSettings = () => {
    try {
      // Save settings to localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      
      setSnackbarMessage('Notification settings saved');
      setSnackbarOpen(true);
      setSettingsOpen(false);
    } catch (err) {
      console.warn('Error saving notification settings:', err);
      setSnackbarMessage('Failed to save settings');
      setSnackbarOpen(true);
    }
  };
  
  // Handle apply filters
  const handleApplyFilters = () => {
    setFilterMenuAnchorEl(null);
    // The filters are already applied by the state change
  };
  
  // Handle reset filters
  const handleResetFilters = () => {
    setFilters({
      types: [],
      dateRange: 'all'
    });
    setFilterMenuAnchorEl(null);
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    // First mark as read
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Handle different notification types
    if (notification.type === 'booking_reminder') {
      navigate('/my-bookings');
    } else if (notification.type === 'job') {
      navigate('/job-search');
    } else if (notification.type === 'resume') {
      navigate('/resumePage');
    } else if (notification.type === 'skill') {
      navigate('/skills-assessment');
    } else {
      // For other notifications, show details dialog
      setSelectedNotification(notification);
      setNotificationDetailsOpen(true);
    }
  };
  
  // Render notification icon
  const renderNotificationIcon = (notification) => {
    return (
      <ListItemIcon>
        {getNotificationIcon(notification)}
      </ListItemIcon>
    );
  };
  
  // Format date for display
  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.warn('Error formatting date:', error);
      return '';
    }
  };
  
  // Get title based on notification type - modified for the new design
  const getNotificationTitle = (notification) => {
    switch(notification.type) {
      case 'job': return 'Job Recommendation';
      case 'resume': return 'Resume Update Required';
      case 'skill': return 'Skill Gap Detected';
      case 'application': return 'Application Update';
      case 'interview': return 'Interview Schedule';
      case 'message': return 'New Message';
      case 'learning': return 'Learning Opportunity';
      case 'system': return 'System Update';
      case 'alert': return 'Important Alert';
      case 'booking_reminder': return 'Coaching Session Booked';
      case 'payment': return 'Payment Notification';
      default: return 'Notification';
    }
  };
  
  // Render notification content
  const renderNotificationContent = (notification) => {
    try {
      if (notification.type === 'booking_reminder') {
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                lineHeight: 1.2,
                mb: 0.5
              }}
            >
              {notification.title || 'Booking Reminder'}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: (theme) => notification.read ? theme.palette.text.secondary : theme.palette.text.primary,
                lineHeight: 1.4 
              }}
            >
              {notification.message || ''}
            </Typography>
          </Box>
        );
      }
      
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              lineHeight: 1.2,
              mb: 0.5
            }}
          >
            {getNotificationTitle(notification)}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: (theme) => notification.read ? theme.palette.text.secondary : theme.palette.text.primary,
              lineHeight: 1.4
            }}
          >
            {t(notification.messageKey || '', notification.message || '')}
          </Typography>
        </Box>
      );
    } catch (error) {
      console.warn('Error rendering notification content:', error);
      return <Typography variant="body2">Notification</Typography>;
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative'
        }}
      >
        <Fade in={true} timeout={800}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontWeight: 600,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: '40px',
                height: '4px',
                background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                borderRadius: '2px'
              }
            }}
          >
            <NotificationsActive 
              sx={{ 
                mr: 1.5, 
                fontSize: 32, 
                color: 'primary.main',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { filter: 'drop-shadow(0 0 0 rgba(25, 118, 210, 0.4))' },
                  '70%': { filter: 'drop-shadow(0 0 4px rgba(25, 118, 210, 0.4))' },
                  '100%': { filter: 'drop-shadow(0 0 0 rgba(25, 118, 210, 0))' }
                }
              }} 
            />
            Notifications
          </Typography>
        </Fade>
        <Fade in={true} timeout={1000}>
          <Box>
            <Button 
              onClick={handleMarkAllAsRead}
              sx={{ 
                mr: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                }
              }}
              variant="outlined"
              startIcon={<CheckCircleOutline />}
            >
              Mark all as read
            </Button>
            <Button 
              startIcon={<DeleteSweep />}
              onClick={handleClearAll}
              color="error"
              variant="contained"
              sx={{ 
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              Clear all
            </Button>
          </Box>
        </Fade>
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: -1,
            left: 0,
            width: '100%',
            height: '1px',
            background: 'linear-gradient(90deg, rgba(25,118,210,0.5) 0%, rgba(25,118,210,0.2) 50%, rgba(255,255,255,0) 100%)'
          }}
        />
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : notifications.length === 0 ? (
        <Fade in={true} timeout={500}>
          <Paper 
            sx={{ 
              p: 0, 
              textAlign: 'center',
              borderRadius: '16px',
              background: 'white',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              height: 400
            }}
          >
            {/* Colorful background gradients */}
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100%',
                background: 'linear-gradient(160deg, rgba(25, 118, 210, 0.05) 0%, rgba(255, 255, 255, 0) 50%)',
                zIndex: 0
              }}
            />
            
            <Box 
              sx={{ 
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60%',
                background: 'radial-gradient(circle at bottom center, rgba(25, 118, 210, 0.03) 0%, rgba(255, 255, 255, 0) 70%)',
                zIndex: 0,
                opacity: 0.7
              }}
            />
            
            {/* Decorative elements */}
            <Box
              sx={{
                position: 'absolute',
                top: '15%',
                left: '10%',
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)',
                opacity: 0.1,
                animation: 'float 6s infinite ease-in-out',
                '@keyframes float': {
                  '0%': { transform: 'translateY(0px)' },
                  '50%': { transform: 'translateY(-15px)' },
                  '100%': { transform: 'translateY(0px)' }
                }
              }}
            />
            
            <Box
              sx={{
                position: 'absolute',
                bottom: '20%',
                right: '15%',
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00b0ff 0%, #80d8ff 100%)',
                opacity: 0.1,
                animation: 'float 8s infinite ease-in-out 1s',
              }}
            />
            
            <Box
              sx={{
                position: 'absolute',
                top: '60%',
                right: '30%',
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6d00 0%, #ffab40 100%)',
                opacity: 0.1,
                animation: 'float 7s infinite ease-in-out 0.5s',
              }}
            />
            
            {/* Content */}
            <Box sx={{ 
              position: 'relative', 
              zIndex: 1, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              px: 4
            }}>
              {/* Icon with circular gradient background */}
              <Box sx={{ 
                width: 120, 
                height: 120, 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                boxShadow: '0 10px 25px rgba(25, 118, 210, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 4,
                position: 'relative',
                animation: 'pulse 3s infinite ease-in-out',
                '@keyframes pulse': {
                  '0%': { 
                    transform: 'scale(1)',
                    boxShadow: '0 10px 25px rgba(25, 118, 210, 0.3)'
                  },
                  '50%': { 
                    transform: 'scale(1.05)',
                    boxShadow: '0 15px 30px rgba(25, 118, 210, 0.4)'
                  },
                  '100%': { 
                    transform: 'scale(1)',
                    boxShadow: '0 10px 25px rgba(25, 118, 210, 0.3)'
                  }
                }
              }}>
                <NotificationsOff 
                  sx={{ 
                    fontSize: 50, 
                    color: 'white'
                  }} 
                />
              </Box>
              
              <Typography variant="h4" gutterBottom fontWeight={600} color="primary.main">
                No Notifications
              </Typography>
              
              <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
                You're all caught up! We'll notify you when there's something new and important.
              </Typography>
              
              <Button 
                variant="outlined" 
                color="primary"
                startIcon={<Refresh />}
                sx={{
                  borderRadius: '24px',
                  px: 3,
                  py: 1,
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                  }
                }}
              >
                Refresh
              </Button>
            </Box>
          </Paper>
        </Fade>
      ) : (
        <Grid container spacing={2}>
          {notifications.map((notification, index) => (
            <Fade in={true} timeout={300 + (index * 100)} key={notification.id}>
              <Grid item xs={12}>
                <Slide direction="up" in={true} timeout={400 + (index * 50)}>
                  <Card 
                    elevation={1}
                    sx={{
                      cursor: 'pointer',
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)'
                      },
                      mb: 1,
                      bgcolor: '#fff',
                      borderLeft: '4px solid',
                      borderColor: notification.type === 'booking_reminder' || notification.type === 'interview' ? 
                        '#00bfa5' : notification.type === 'payment' ? '#757575' : '#1976d2'
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        {/* Circular icon on the left */}
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            bgcolor: notification.type === 'booking_reminder' || notification.type === 'interview' ? 
                              '#00bfa5' : notification.type === 'payment' ? '#757575' : '#1976d2',
                            color: '#fff',
                            flexShrink: 0,
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%': { boxShadow: '0 0 0 0 rgba(0, 0, 0, 0.2)' },
                              '70%': { boxShadow: '0 0 0 5px rgba(0, 0, 0, 0)' },
                              '100%': { boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)' }
                            }
                          }}
                        >
                          {notification.type === 'booking_reminder' || notification.type === 'interview' ? (
                            <CalendarToday fontSize="medium" />
                          ) : notification.type === 'payment' ? (
                            <Payment fontSize="medium" />
                          ) : (
                            <NotificationsActive fontSize="medium" />
                          )}
                        </Box>
                        
                        {/* Content */}
                        <Box 
                          sx={{ flex: 1, mt: 0.5 }}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <Typography 
                            variant="subtitle1" 
                            component="div" 
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '0.95rem',
                              mb: 0.5
                            }}
                          >
                            {notification.type === 'booking_reminder' ? 'Coaching Session Booked' : 
                             notification.type === 'payment' ? 'Notification' : 
                             notification.title || getNotificationTitle(notification)}
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            color="text.primary"
                            sx={{ mb: 1 }}
                          >
                            {notification.message || t(notification.messageKey || '')}
                          </Typography>
                          
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <AccessTime sx={{ fontSize: 12, mr: 0.5, opacity: 0.7 }} />
                            {formatDate(notification.date)}
                          </Typography>
                        </Box>
                        
                        {/* Delete button */}
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Slide>
              </Grid>
            </Fade>
          ))}
        </Grid>
      )}
      
      {/* Notification Options Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem 
          onClick={() => {
            const notification = notifications.find(n => n.id === selectedMenuId);
            if (notification) {
              setSelectedNotification(notification);
              setNotificationDetailsOpen(true);
              setMenuAnchorEl(null);
            }
          }}
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>
        
        {notifications.find(n => n.id === selectedMenuId)?.read ? (
          <MenuItem onClick={() => handleMarkAsUnread(selectedMenuId)}>
            <ListItemIcon>
              <NotificationsActive fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Mark as Unread" />
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleMarkAsRead(selectedMenuId)}>
            <ListItemIcon>
              <CheckCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Mark as Read" />
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem onClick={() => handleDeleteNotification(selectedMenuId)}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText 
            primary="Delete" 
            primaryTypographyProps={{ color: 'error' }}
          />
        </MenuItem>
      </Menu>
      
      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchorEl}
        open={Boolean(filterMenuAnchorEl)}
        onClose={() => setFilterMenuAnchorEl(null)}
        sx={{ width: 300 }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Typography variant="subtitle1" sx={{ px: 2, pt: 1, pb: 0 }}>
          Filter Notifications
        </Typography>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Notification Type
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.types.includes('application')}
                onChange={(e) => {
                  setFilters(prev => {
                    const updatedTypes = e.target.checked 
                      ? [...prev.types, 'application'] 
                      : prev.types.filter(type => type !== 'application');
                    return { ...prev, types: updatedTypes };
                  });
                }}
              />
            }
            label="Applications"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.types.includes('interview')}
                onChange={(e) => {
                  setFilters(prev => {
                    const updatedTypes = e.target.checked 
                      ? [...prev.types, 'interview'] 
                      : prev.types.filter(type => type !== 'interview');
                    return { ...prev, types: updatedTypes };
                  });
                }}
              />
            }
            label="Interviews"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.types.includes('message')}
                onChange={(e) => {
                  setFilters(prev => {
                    const updatedTypes = e.target.checked 
                      ? [...prev.types, 'message'] 
                      : prev.types.filter(type => type !== 'message');
                    return { ...prev, types: updatedTypes };
                  });
                }}
              />
            }
            label="Messages"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.types.includes('job')}
                onChange={(e) => {
                  setFilters(prev => {
                    const updatedTypes = e.target.checked 
                      ? [...prev.types, 'job'] 
                      : prev.types.filter(type => type !== 'job');
                    return { ...prev, types: updatedTypes };
                  });
                }}
              />
            }
            label="Jobs"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.types.includes('learning')}
                onChange={(e) => {
                  setFilters(prev => {
                    const updatedTypes = e.target.checked 
                      ? [...prev.types, 'learning'] 
                      : prev.types.filter(type => type !== 'learning');
                    return { ...prev, types: updatedTypes };
                  });
                }}
              />
            }
            label="Learning"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.types.includes('system')}
                onChange={(e) => {
                  setFilters(prev => {
                    const updatedTypes = e.target.checked 
                      ? [...prev.types, 'system'] 
                      : prev.types.filter(type => type !== 'system');
                    return { ...prev, types: updatedTypes };
                  });
                }}
              />
            }
            label="System"
          />
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Date Range
          </Typography>
          
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <Select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, py: 1 }}>
          <Button
            onClick={handleResetFilters}
            sx={{ mr: 1 }}
          >
            Reset
          </Button>
          
          <Button
            variant="contained"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </Button>
        </Box>
      </Menu>
      
      {/* Notification Settings Dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Notification Settings</DialogTitle>
        
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
            General Settings
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.emailNotifications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  emailNotifications: e.target.checked
                })}
              />
            }
            label="Receive Email Notifications"
            sx={{ display: 'block', mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={notificationSettings.pushNotifications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  pushNotifications: e.target.checked
                })}
              />
            }
            label="Receive Push Notifications"
            sx={{ display: 'block', mb: 1 }}
          />
          
          {notificationSettings.emailNotifications && (
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Email Frequency</InputLabel>
              <Select
                value={notificationSettings.emailFrequency}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  emailFrequency: e.target.value
                })}
                label="Email Frequency"
              >
                <MenuItem value="immediate">Immediate</MenuItem>
                <MenuItem value="daily">Daily Digest</MenuItem>
                <MenuItem value="weekly">Weekly Digest</MenuItem>
                <MenuItem value="none">No Emails</MenuItem>
              </Select>
            </FormControl>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Notification Types
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Select which types of notifications you want to receive:
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={notificationSettings.notificationTypes.applications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  notificationTypes: {
                    ...notificationSettings.notificationTypes,
                    applications: e.target.checked
                  }
                })}
              />
            }
            label="Application Updates"
            sx={{ display: 'block', mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={notificationSettings.notificationTypes.interviews}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  notificationTypes: {
                    ...notificationSettings.notificationTypes,
                    interviews: e.target.checked
                  }
                })}
              />
            }
            label="Interview Reminders"
            sx={{ display: 'block', mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={notificationSettings.notificationTypes.messages}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  notificationTypes: {
                    ...notificationSettings.notificationTypes,
                    messages: e.target.checked
                  }
                })}
              />
            }
            label="Messages"
            sx={{ display: 'block', mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={notificationSettings.notificationTypes.jobs}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  notificationTypes: {
                    ...notificationSettings.notificationTypes,
                    jobs: e.target.checked
                  }
                })}
              />
            }
            label="Job Recommendations"
            sx={{ display: 'block', mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={notificationSettings.notificationTypes.learning}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  notificationTypes: {
                    ...notificationSettings.notificationTypes,
                    learning: e.target.checked
                  }
                })}
              />
            }
            label="Learning Resources"
            sx={{ display: 'block', mb: 1 }}
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={notificationSettings.notificationTypes.system}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  notificationTypes: {
                    ...notificationSettings.notificationTypes,
                    system: e.target.checked
                  }
                })}
              />
            }
            label="System Notifications"
            sx={{ display: 'block', mb: 1 }}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Detail Dialog */}
      <Dialog
        open={notificationDetailsOpen}
        onClose={() => setNotificationDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            overflow: 'hidden'
          }
        }}
      >
        {selectedNotification && (
          <>
            <DialogTitle sx={{ px: 3, py: 2.5, backgroundColor: 'primary.main', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    mr: 2, 
                    background: selectedNotification.gradientBg || 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                    color: 'white',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
                    width: 40,
                    height: 40,
                    border: '2px solid white'
                  }}
                >
                  {getNotificationIcon(selectedNotification)}
                </Avatar>
                <Typography variant="h6" fontWeight={600}>
                  {selectedNotification.title || 'Notification Details'}
                </Typography>
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              <Box 
                sx={{ 
                  p: 3,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '40%',
                    height: '100%',
                    background: 'radial-gradient(circle at top right, rgba(25,118,210,0.03), transparent 70%)',
                    opacity: 0.5,
                    zIndex: 0
                  }}
                />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <AccessTime fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
                    {selectedNotification.date ? 
                      format(new Date(selectedNotification.date), 'MMM dd, yyyy HH:mm') :
                      format(new Date(), 'MMM dd, yyyy HH:mm')
                    }
                  </Typography>
                  
                  <Typography variant="body1" paragraph sx={{ mt: 2, lineHeight: 1.6 }}>
                    {selectedNotification.content || selectedNotification.message || t(selectedNotification.messageKey || '', 'Notification details')}
                  </Typography>
                  
                  {selectedNotification.link && (
                    <Button
                      variant="contained"
                      onClick={() => {
                        navigate(selectedNotification.link);
                        setNotificationDetailsOpen(false);
                      }}
                      sx={{ 
                        mt: 3,
                        px: 3,
                        py: 1,
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)'
                        }
                      }}
                    >
                      View Details
                    </Button>
                  )}
                </Box>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button 
                onClick={() => setNotificationDetailsOpen(false)}
                variant="outlined"
                sx={{ borderRadius: '8px' }}
              >
                Close
              </Button>
              
              <Button
                onClick={() => {
                  handleMarkAsRead(selectedNotification.id);
                  setNotificationDetailsOpen(false);
                }}
                color="primary"
                variant="contained"
                sx={{ 
                  ml: 1,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)'
                  }
                }}
                startIcon={<CheckCircleOutline />}
              >
                Mark as Read
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default Notifications;