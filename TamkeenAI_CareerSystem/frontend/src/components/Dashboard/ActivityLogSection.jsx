import React, { useState, useMemo, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Alert,
  FormControl,
  InputLabel,
  Select,
  CircularProgress
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import VideocamIcon from '@mui/icons-material/Videocam';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { format, formatDistanceToNow, parseISO, isThisWeek, getDay } from 'date-fns';
import { useTranslation } from 'react-i18next';

// Activity icon mapping
const activityIcons = {
  'resume_update': <DescriptionIcon />,
  'job_application': <WorkIcon />,
  'course_completion': <SchoolIcon />,
  'mock_interview': <VideocamIcon />,
  'assessment': <AssignmentIcon />,
  'networking': <PeopleIcon />,
  'default': <AssignmentIcon />
};

// Activity color mapping
const activityColors = {
  'resume_update': 'primary.main',
  'job_application': 'success.main',
  'course_completion': 'info.main',
  'mock_interview': 'warning.main',
  'assessment': 'secondary.main',
  'networking': 'error.main',
  'default': 'grey.500'
};

const ActivityLogSection = ({ activityLog = [], recentActivities, data }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuActivity, setMenuActivity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Handle filter menu
  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = (filterType) => {
    if (filterType && typeof filterType === 'string') {
      setFilter(filterType);
    }
    setAnchorEl(null);
  };
  
  // Handle activity menu
  const handleActivityMenuOpen = (event, activity) => {
    event.stopPropagation();
    setMenuActivity(activity);
  };
  
  const handleActivityMenuClose = () => {
    setMenuActivity(null);
  };
  
  // Filter activities by type, search term, and time range
  const filteredActivities = useMemo(() => {
    return activityLog.filter(activity => {
      // Filter by type
      const typeMatch = filter === 'all' || activity.type === filter;
      
      // Filter by search term
      const searchMatch = !searchTerm || 
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.details && activity.details.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by time range
      let timeMatch = true;
      const activityDate = new Date(activity.timestamp);
      
      if (timeRange === 'today') {
        timeMatch = new Date().toDateString() === activityDate.toDateString();
      } else if (timeRange === 'week') {
        timeMatch = isThisWeek(activityDate);
      } else if (timeRange === 'month') {
        timeMatch = new Date().getMonth() === activityDate.getMonth() && 
                    new Date().getFullYear() === activityDate.getFullYear();
      }
      
      return typeMatch && searchMatch && timeMatch;
    });
  }, [activityLog, filter, searchTerm, timeRange]);
  
  // Group activities by date
  const groupedActivities = useMemo(() => {
    return filteredActivities.reduce((groups, activity) => {
      const date = new Date(activity.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
      return groups;
    }, {});
  }, [filteredActivities]);
  
  // Sort dates in descending order
  const sortedDates = useMemo(() => {
    return Object.keys(groupedActivities).sort(
      (a, b) => new Date(b) - new Date(a)
    );
  }, [groupedActivities]);
  
  // Generate activity summary
  const activitySummary = useMemo(() => {
    if (activityLog.length === 0) return null;
    
    // Count activities by day of week
    const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sun, Mon, ... Sat
    activityLog.forEach(activity => {
      const day = getDay(new Date(activity.timestamp));
      dayCount[day]++;
    });
    
    // Find most active day
    const mostActiveDay = dayCount.indexOf(Math.max(...dayCount));
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Count activities by type
    const typeCounts = activityLog.reduce((counts, activity) => {
      counts[activity.type] = (counts[activity.type] || 0) + 1;
      return counts;
    }, {});
    
    // Find most common activity
    let mostCommonActivity = 'activities';
    let maxCount = 0;
    for (const [type, count] of Object.entries(typeCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonActivity = type;
      }
    }
    
    // Format type for display
    const formatType = (type) => {
      return type.replace('_', ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };
    
    // Recent activity count (this week)
    const recentActivities = activityLog.filter(a => isThisWeek(new Date(a.timestamp)));
    
    return {
      mostActiveDay: daysOfWeek[mostActiveDay],
      mostActiveCount: dayCount[mostActiveDay],
      mostCommonActivity: formatType(mostCommonActivity),
      mostCommonCount: maxCount,
      recentCount: recentActivities.length,
      typeBreakdown: Object.entries(typeCounts).map(([type, count]) => ({
        type: formatType(type),
        count,
        percentage: Math.round((count / activityLog.length) * 100)
      }))
    };
  }, [activityLog]);
  
  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          {t('activityLog.title', 'Recent Activities')}
        </Typography>
      </Box>
      
      {/* Activity Summary Section */}
      {activitySummary && (
        <Card variant="outlined" sx={{ mb: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} />
              {t('activityLog.activitySummary', 'Activity Summary')}
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">
                  {t('activityLog.mostActiveOn', 'You were most active on')} <strong>{activitySummary.mostActiveDay}s</strong>, {t('activityLog.with', 'with')} <strong>{activitySummary.mostActiveCount}</strong> {t('activityLog.activities', 'activities')}.
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {t('activityLog.mostCommonActivity', 'Your most common activity was')} <strong>{activitySummary.mostCommonActivity}</strong>
                  {activitySummary.mostCommonActivity === 'Job Application' && 
                   t('activityLog.applyingTo', ', applying to')} {activitySummary.mostCommonCount} {t('activityLog.jobs', 'jobs')}.
                </Typography>
              </Box>
              
              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
              <Divider sx={{ display: { xs: 'block', sm: 'none' } }} />
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>{activitySummary.recentCount}</strong> {t('activityLog.activitiesThisWeek', 'activities this week')}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {activitySummary.typeBreakdown.map(type => (
                    <Chip 
                      key={type.type} 
                      label={`${type.type}: ${type.count}`} 
                      size="small" 
                      color={type.percentage > 30 ? "primary" : "default"}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
      
      {/* Advanced Filter Section */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('activityLog.searchActivities', 'Search activities...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="activity-type-label">{t('activityLog.activityType', 'Activity Type')}</InputLabel>
              <Select
                labelId="activity-type-label"
                value={filter}
                label={t('activityLog.activityType', 'Activity Type')}
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">{t('activityLog.allActivities', 'All Activities')}</MenuItem>
                <MenuItem value="resume_update">{t('activityLog.resumeUpdates', 'Resume Updates')}</MenuItem>
                <MenuItem value="job_application">{t('activityLog.jobApplications', 'Job Applications')}</MenuItem>
                <MenuItem value="mock_interview">{t('activityLog.mockInterviews', 'Mock Interviews')}</MenuItem>
                <MenuItem value="assessment">{t('activityLog.assessments', 'Assessments')}</MenuItem>
                <MenuItem value="networking">{t('activityLog.networking', 'Networking')}</MenuItem>
                <MenuItem value="course_completion">{t('activityLog.learning', 'Learning')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="time-range-label">{t('activityLog.timeRange', 'Time Range')}</InputLabel>
              <Select
                labelId="time-range-label"
                value={timeRange}
                label={t('activityLog.timeRange', 'Time Range')}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="all">{t('activityLog.allTime', 'All Time')}</MenuItem>
                <MenuItem value="today">{t('activityLog.today', 'Today')}</MenuItem>
                <MenuItem value="week">{t('activityLog.thisWeek', 'This Week')}</MenuItem>
                <MenuItem value="month">{t('activityLog.thisMonth', 'This Month')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      
      {filteredActivities.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            {t('activityLog.noActivitiesFound', 'No activities found matching your filters')}
          </Typography>
          <Button 
            variant="text" 
            size="small" 
            onClick={() => {
              setFilter('all');
              setSearchTerm('');
              setTimeRange('all');
            }}
            sx={{ mt: 1 }}
          >
            {t('activityLog.clearAllFilters', 'Clear all filters')}
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('activityLog.showingActivities', 'Showing')} {filteredActivities.length} {t('activityLog.activities', 'activities')}
            </Typography>
            
            {(filter !== 'all' || searchTerm || timeRange !== 'all') && (
              <Button 
                variant="text" 
                size="small" 
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                  setTimeRange('all');
                }}
              >
                {t('activityLog.clearFilters', 'Clear filters')}
              </Button>
            )}
          </Box>
          
          <List sx={{ 
            maxHeight: 350, 
            overflow: 'auto',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#888',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#555',
            },
          }}>
            {sortedDates.map((date, dateIndex) => (
              <React.Fragment key={date}>
                {dateIndex > 0 && <Divider component="li" />}
                <ListItem sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                        {format(new Date(date), "EEEE, MMMM d, yyyy")}
                      </Typography>
                    }
                  />
                </ListItem>
                
                {groupedActivities[date].map((activity, index) => (
                  <ListItem 
                    key={activity.id || index}
                    alignItems="flex-start"
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        size="small"
                        onClick={(e) => handleActivityMenuOpen(e, activity)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{ 
                      py: 1,
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: activityColors[activity.type] || activityColors.default }}>
                        {activityIcons[activity.type] || activityIcons.default}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography component="span">
                            {activity.description}
                          </Typography>
                          {searchTerm && activity.description.toLowerCase().includes(searchTerm.toLowerCase()) && (
                            <Chip 
                              label="Match" 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                              sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                          >
                            <AccessTimeIcon sx={{ fontSize: 14 }} />
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </Typography>
                          {activity.details && (
                            <Typography
                              component="div"
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              {activity.details}
                            </Typography>
                          )}
                          {activity.status && (
                            <Chip 
                              label={activity.status} 
                              size="small" 
                              color={
                                activity.status === 'completed' ? 'success' : 
                                activity.status === 'in_progress' ? 'warning' : 
                                'default'
                              }
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                ))}
              </React.Fragment>
            ))}
          </List>
        </>
      )}
      
      {filteredActivities.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button 
            variant="text" 
            size="small"
            onClick={() => {/* Navigate to full activity history */}}
          >
            {t('activityLog.viewFullHistory', 'View Full History')}
          </Button>
        </Box>
      )}
      
      {/* Activity menu */}
      <Menu
        anchorEl={document.getElementById(menuActivity?.id)}
        open={Boolean(menuActivity)}
        onClose={handleActivityMenuClose}
      >
        <MenuItem onClick={handleActivityMenuClose}>
          {t('activityLog.viewDetails', 'View Details')}
        </MenuItem>
        <MenuItem onClick={handleActivityMenuClose}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          {t('activityLog.removeFromLog', 'Remove from Log')}
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default ActivityLogSection; 