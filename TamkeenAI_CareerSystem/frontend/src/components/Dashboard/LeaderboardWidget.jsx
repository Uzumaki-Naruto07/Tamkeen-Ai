import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Divider,
  Button,
  Chip,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useNavigate } from 'react-router-dom';

// Mock leaderboard data
const mockLeaderboardData = {
  user_position: 4,
  total_users: 156,
  top_percentile: 15,
  points: 1250,
  next_milestone: 1500,
  rank_history: [12, 9, 8, 6, 5, 4], // Historical rank data for sparkline
  leaderboard: [
    { id: 1, name: "Zayed Al Nahyan", avatar: "https://randomuser.me/api/portraits/men/32.jpg", points: 2450 },
    { id: 2, name: "Maryam Al Maktoum", avatar: "https://randomuser.me/api/portraits/women/44.jpg", points: 2120 },
    { id: 3, name: "Rashid Al Falasi", avatar: "https://randomuser.me/api/portraits/men/22.jpg", points: 1890 },
    { id: 4, name: "Current User", avatar: null, points: 1250, isCurrentUser: true },
    { id: 5, name: "Hind Al Qasimi", avatar: "https://randomuser.me/api/portraits/women/67.jpg", points: 1180 }
  ],
  friends: [
    { id: 101, name: "Mohammed Al Shamsi", avatar: "https://randomuser.me/api/portraits/men/42.jpg", points: 1650, isFriend: true },
    { id: 4, name: "Current User", avatar: null, points: 1250, isCurrentUser: true },
    { id: 102, name: "Fatma Al Mazrouei", avatar: "https://randomuser.me/api/portraits/women/33.jpg", points: 1100, isFriend: true },
    { id: 103, name: "Ahmed Al Dhaheri", avatar: "https://randomuser.me/api/portraits/men/15.jpg", points: 980, isFriend: true },
    { id: 104, name: "Noura Al Kaabi", avatar: "https://randomuser.me/api/portraits/women/57.jpg", points: 850, isFriend: true }
  ]
};

// Simple Sparkline component for rank history
const RankSparkline = ({ data, height = 20, width = 60 }) => {
  // Reverse data so latest is rightmost
  const values = [...data].reverse();
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  // Calculate points for the SVG path
  const points = values.map((value, index) => {
    // Higher rank (lower number) should be higher on the chart
    // Invert the y value (max - value) so that lower rank numbers appear higher on the sparkline
    const y = height - ((max - value) / range) * height;
    const x = (index / (values.length - 1)) * width;
    return `${x},${y}`;
  }).join(' ');

  // Determine if trend is positive (rank number decreasing = getting better)
  const trend = values[0] > values[values.length - 1] ? "negative" : "positive";
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <svg width={width} height={height} style={{ marginRight: 4 }}>
        <polyline
          points={points}
          fill="none"
          stroke={trend === "positive" ? "#4caf50" : "#f44336"}
          strokeWidth="2"
        />
      </svg>
      {trend === "positive" ? 
        <ArrowUpwardIcon sx={{ color: 'success.main', fontSize: 16 }} /> :
        <ArrowDownwardIcon sx={{ color: 'error.main', fontSize: 16 }} />
      }
    </Box>
  );
};

const LeaderboardWidget = ({ leaderboardData }) => {
  // Default position with empty data if leaderboardData is undefined
  const position = leaderboardData || {
    user_position: 0,
    rank_history: [0, 0, 0, 0, 0],
    top_percentile: 0,
    points: 0,
    next_milestone: 100,
    leaderboard: [],
    friends: []
  };
  
  const [view, setView] = useState('global');
  const navigate = useNavigate();
  
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Career Leaderboard
        </Typography>
        <EmojiEventsIcon color="primary" />
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2,
        p: 2,
        bgcolor: 'primary.light',
        color: 'primary.contrastText',
        borderRadius: 1
      }}>
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Your Rank
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mr: 1 }}>
              #{position.user_position}
            </Typography>
            <RankSparkline data={position.rank_history} />
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Top {position.top_percentile}%
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'right' }}>
            Career Points
          </Typography>
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
            {position.points}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'right' }}>
            Next: {position.next_milestone}
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Points to next milestone
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={(position.points / position.next_milestone) * 100} 
          sx={{ height: 8, borderRadius: 4 }} 
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {position.points} points
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {position.next_milestone} points
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2">
          {view === 'global' ? 'Top Performers' : 'Friends Comparison'}
        </Typography>
        <ToggleButtonGroup
          size="small"
          value={view}
          exclusive
          onChange={handleViewChange}
          aria-label="leaderboard view"
        >
          <ToggleButton value="global" aria-label="global leaderboard">
            <EmojiEventsIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="friends" aria-label="friends comparison">
            <GroupIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <List disablePadding>
        {(view === 'global' ? position.leaderboard : position.friends).map((user, index) => (
          <ListItem 
            key={user.id}
            sx={{ 
              py: 1,
              bgcolor: user.isCurrentUser ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              borderRadius: 1
            }}
          >
            <ListItemAvatar>
              <Avatar 
                src={user.avatar} 
                alt={user.name}
                sx={{ 
                  bgcolor: !user.avatar ? 'primary.main' : undefined,
                  border: user.isCurrentUser ? '2px solid #1976d2' : (user.isFriend ? '2px solid #4caf50' : 'none')
                }}
              >
                {!user.avatar && <PersonIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={
                <Box component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="body1"
                    component="span"
                    sx={{ fontWeight: user.isCurrentUser ? 'bold' : 'normal' }}
                  >
                    {user.name}
                  </Typography>
                  {user.isCurrentUser && (
                    <Chip 
                      label="You" 
                      size="small" 
                      color="primary" 
                      sx={{ ml: 1, height: 20 }} 
                    />
                  )}
                  {user.isFriend && !user.isCurrentUser && (
                    <Chip 
                      label="Friend" 
                      size="small" 
                      color="success" 
                      sx={{ ml: 1, height: 20 }} 
                    />
                  )}
                </Box>
              }
              secondary={
                <Box component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="body2" 
                    component="span" 
                    color="text.secondary"
                  >
                    {user.points} points
                  </Typography>
                  {view === 'global' && index === 0 && (
                    <Chip 
                      icon={<EmojiEventsIcon sx={{ fontSize: '0.8rem !important' }} />}
                      label="Leader" 
                      size="small" 
                      color="warning" 
                      sx={{ ml: 1, height: 20 }} 
                    />
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button 
          variant="text" 
          size="small"
          onClick={() => navigate('/gamified-progress')}
        >
          View Full Leaderboard
        </Button>
      </Box>
    </Paper>
  );
};

export default LeaderboardWidget; 