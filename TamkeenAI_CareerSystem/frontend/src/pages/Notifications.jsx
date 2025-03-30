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
  Grid, Avatar
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
  DeleteSweep, CalendarToday, WorkOutline
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
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
  const { profile } = useUser();
  const { t } = useTranslation();
  
  const [standardNotifications, setStandardNotifications] = useState([
    { 
      id: 1, 
      messageKey: 'notifications.newJobRecommendation', 
      message: 'New job recommendation available', 
      read: false,
      date: new Date().toISOString(),
      icon: <WorkOutline color="primary" />,
      type: 'job'
    },
    { 
      id: 2, 
      messageKey: 'notifications.resumeUpdate', 
      message: 'Your resume needs updating', 
      read: false,
      date: new Date(Date.now() - 86400000).toISOString(),
      icon: <Description color="primary" />,
      type: 'resume'
    },
    { 
      id: 3, 
      messageKey: 'notifications.skillGap', 
      message: 'Skill gap detected in your profile', 
      read: false,
      date: new Date(Date.now() - 172800000).toISOString(),
      icon: <School color="primary" />,
      type: 'skill'
    }
  ]);
  
  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Determine which API to call based on active tab
        let response;
        if (activeTab === 0) {
          // All notifications
          response = await apiEndpoints.notifications.getAllNotifications(profile.id, {
            page,
            limit: pageSize,
            filters
          });
        } else if (activeTab === 1) {
          // Unread notifications
          response = await apiEndpoints.notifications.getUnreadNotifications(profile.id, {
            page,
            limit: pageSize,
            filters
          });
        } else {
          // Read notifications
          response = await apiEndpoints.notifications.getReadNotifications(profile.id, {
            page,
            limit: pageSize,
            filters
          });
        }
        
        // Load booking notifications from localStorage
        const bookingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        
        // Combine with standard notifications
        const allNotifications = [...bookingNotifications, ...standardNotifications];
        
        // Sort by date (newest first)
        allNotifications.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setNotifications(allNotifications);
        setTotalNotifications(response.meta?.total || 0);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setError('Failed to load notifications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadNotifications();
  }, [profile, activeTab, page, pageSize, filters, standardNotifications]);
  
  // Load notification settings
  useEffect(() => {
    const loadSettings = async () => {
      if (!profile?.id) return;
      
      try {
        const response = await apiEndpoints.notifications.getNotificationSettings(profile.id);
        if (response.data) {
          setNotificationSettings(response.data);
        }
      } catch (err) {
        console.error('Error loading notification settings:', err);
      }
    };
    
    loadSettings();
  }, [profile]);
  
  // Get icon based on notification type
  const getNotificationIcon = (notification) => {
    switch (notification.type) {
      case 'application':
        return <Assignment color="primary" />;
      case 'interview':
        return <Event color="secondary" />;
      case 'message':
        return <Mail color="info" />;
      case 'job':
        return <Work color="action" />;
      case 'learning':
        return <School color="success" />;
      case 'system':
        return <Info color="warning" />;
      case 'alert':
        return <Warning color="error" />;
      case 'booking_reminder':
        return <CalendarToday color="primary" />;
      default:
        return <NotificationsIcon />;
    }
  };
  
  // Handle mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiEndpoints.notifications.markAsRead(profile.id, notificationId);
      
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
      console.error('Error marking notification as read:', err);
      setSnackbarMessage('Failed to update notification');
      setSnackbarOpen(true);
    }
  };
  
  // Handle mark as unread
  const handleMarkAsUnread = async (notificationId) => {
    try {
      await apiEndpoints.notifications.markAsUnread(profile.id, notificationId);
      
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
      console.error('Error marking notification as unread:', err);
      setSnackbarMessage('Failed to update notification');
      setSnackbarOpen(true);
    }
  };
  
  // Handle delete notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await apiEndpoints.notifications.deleteNotification(profile.id, notificationId);
      
      // Remove from local state
      setNotifications(notifications.filter(notification => 
        notification.id !== notificationId
      ));
      
      setSnackbarMessage('Notification deleted');
      setSnackbarOpen(true);
      
      // Close the menu if open
      setMenuAnchorEl(null);
    } catch (err) {
      console.error('Error deleting notification:', err);
      setSnackbarMessage('Failed to delete notification');
      setSnackbarOpen(true);
    }
  };
  
  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await apiEndpoints.notifications.markAllAsRead(profile.id);
      
      // Update local state
      setNotifications(notifications.map(notification => ({
        ...notification,
        read: true
      })));
      
      setSnackbarMessage('All notifications marked as read');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setSnackbarMessage('Failed to update notifications');
      setSnackbarOpen(true);
    }
  };
  
  // Handle clear all notifications
  const handleClearAll = async () => {
    try {
      await apiEndpoints.notifications.clearAllNotifications(profile.id);
      
      // Update local state
      setNotifications([]);
      
      setSnackbarMessage('All notifications cleared');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error clearing notifications:', err);
      setSnackbarMessage('Failed to clear notifications');
      setSnackbarOpen(true);
    }
  };
  
  // Handle save notification settings
  const handleSaveSettings = async () => {
    try {
      await apiEndpoints.notifications.updateNotificationSettings(profile.id, notificationSettings);
      
      setSnackbarMessage('Notification settings updated');
      setSnackbarOpen(true);
      setSettingsOpen(false);
    } catch (err) {
      console.error('Error updating notification settings:', err);
      setSnackbarMessage('Failed to update settings');
      setSnackbarOpen(true);
    }
  };
  
  // Apply filters
  const handleApplyFilters = () => {
    setFilterMenuAnchorEl(null);
    setPage(1); // Reset to first page when filters change
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      types: [],
      dateRange: 'all'
    });
    setFilterMenuAnchorEl(null);
    setPage(1);
  };
  
  const handleNotificationClick = (notification) => {
    // Mark as read
    const updatedNotifications = notifications.map(n => {
      if (n.id === notification.id) {
        return { ...n, read: true };
      }
      return n;
    });
    setNotifications(updatedNotifications);
    
    // Also update booking notifications in localStorage
    if (notification.type === 'booking_reminder') {
      const bookingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedBookingNotifications = bookingNotifications.map(n => {
        if (n.id === notification.id) {
          return { ...n, read: true };
        }
        return n;
      });
      localStorage.setItem('notifications', JSON.stringify(updatedBookingNotifications));
    }
    
    // Navigate based on notification type
    if (notification.type === 'booking_reminder') {
      navigate('/my-bookings');
    } else if (notification.type === 'job') {
      navigate('/job-search');
    } else if (notification.type === 'resume') {
      navigate('/resume-builder');
    } else if (notification.type === 'skill') {
      navigate('/skill-builder');
    }
  };
  
  const renderNotificationIcon = (notification) => {
    if (notification.type === 'booking_reminder') {
      return <CalendarToday color="primary" />;
    } else if (notification.icon) {
      return notification.icon;
    }
    return <NotificationsIcon color="primary" />;
  };
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    // Less than a day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) return 'Just now';
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    // Less than a week
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    
    // Else show date
    return date.toLocaleDateString();
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Notifications
        </Typography>
        <Box>
          <Button 
            onClick={handleMarkAllAsRead}
            sx={{ mr: 1 }}
          >
            Mark all as read
          </Button>
          <Button 
            startIcon={<DeleteSweep />}
            onClick={handleClearAll}
            color="error"
          >
            Clear all
          </Button>
          </Box>
        </Box>
        
      {notifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
              No notifications
            </Typography>
          <Typography variant="body1">
            You don't have any notifications at the moment.
            </Typography>
        </Paper>
        ) : (
        <Grid container spacing={2}>
          {notifications.map((notification) => (
            <Grid item xs={12} key={notification.id}>
              <Card 
                    sx={{
                  cursor: 'pointer',
                  backgroundColor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.05)',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.02)'
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {renderNotificationIcon(notification)}
                      </Avatar>
                      <Box sx={{ flex: 1 }} onClick={() => handleNotificationClick(notification)}>
                        {notification.type === 'booking_reminder' ? (
                          <>
                            <Typography variant="subtitle1" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                          {notification.title}
                        </Typography>
                            <Typography variant="body2" paragraph>
                            {notification.message}
                          </Typography>
                          </>
                        ) : (
                          <Typography variant="body1" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                            {t(notification.messageKey, notification.message)}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(notification.date)}
                          </Typography>
                        </Box>
                    </Box>
                    <Box>
                      {!notification.read && (
                        <Chip 
                          label="New" 
                          color="primary" 
                          size="small" 
                          sx={{ mb: 1 }} 
                        />
                      )}
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMenuId(notification.id);
                          setMenuAnchorEl(e.currentTarget);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
            </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
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
      >
        {selectedNotification && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mr: 1 }}>
                  {getNotificationIcon(selectedNotification)}
                </Box>
                <Typography variant="h6">
                  {selectedNotification.title}
                </Typography>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {format(new Date(selectedNotification.createdAt), 'MMM dd, yyyy HH:mm')}
              </Typography>
              
              <Typography paragraph sx={{ mt: 2 }}>
                {selectedNotification.content}
              </Typography>
              
              {selectedNotification.link && (
                <Button
                  variant="contained"
                  onClick={() => {
                    navigate(selectedNotification.link);
                    setNotificationDetailsOpen(false);
                  }}
                  sx={{ mt: 1 }}
                >
                  View Details
                </Button>
              )}
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setNotificationDetailsOpen(false)}>
                Close
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