import React, { useState } from 'react';
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
  Badge
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
import { format, formatDistanceToNow } from 'date-fns';

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

const ActivityLogSection = ({ activityLog = [] }) => {
  const [filter, setFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuActivity, setMenuActivity] = useState(null);
  
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
  
  // Filter activities
  const filteredActivities = activityLog.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });
  
  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedActivities).sort(
    (a, b) => new Date(b) - new Date(a)
  );
  
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Activity Log
        </Typography>
        <Tooltip title="Filter activities">
          <IconButton 
            size="small" 
            onClick={handleFilterClick}
            color={filter !== 'all' ? 'primary' : 'default'}
          >
            <Badge
              color="primary"
              variant="dot"
              invisible={filter === 'all'}
            >
              <FilterListIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => handleFilterClose()}
        >
          <MenuItem onClick={() => handleFilterClose('all')}>
            All Activities
          </MenuItem>
          <MenuItem onClick={() => handleFilterClose('resume_update')}>
            Resume Updates
          </MenuItem>
          <MenuItem onClick={() => handleFilterClose('job_application')}>
            Job Applications
          </MenuItem>
          <MenuItem onClick={() => handleFilterClose('mock_interview')}>
            Mock Interviews
          </MenuItem>
          <MenuItem onClick={() => handleFilterClose('assessment')}>
            Assessments
          </MenuItem>
          <MenuItem onClick={() => handleFilterClose('networking')}>
            Networking
          </MenuItem>
          <MenuItem onClick={() => handleFilterClose('course_completion')}>
            Learning
          </MenuItem>
        </Menu>
      </Box>
      
      {filteredActivities.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No activities found
          </Typography>
          {filter !== 'all' && (
            <Button 
              variant="text" 
              size="small" 
              onClick={() => setFilter('all')}
              sx={{ mt: 1 }}
            >
              Show all activities
            </Button>
          )}
        </Box>
      ) : (
        <List sx={{ 
          maxHeight: 400, 
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
                    <Typography variant="caption" color="text.secondary">
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
                    primary={activity.description}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
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
      )}
      
      {filteredActivities.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button 
            variant="text" 
            size="small"
            onClick={() => {/* Navigate to full activity history */}}
          >
            View Full History
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
          View Details
        </MenuItem>
        <MenuItem onClick={handleActivityMenuClose}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Remove from Log
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default ActivityLogSection; 