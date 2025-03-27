import React from 'react';
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
  LinearProgress
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';

// Mock leaderboard data
const mockLeaderboardData = {
  user_position: 4,
  total_users: 156,
  top_percentile: 15,
  points: 1250,
  next_milestone: 1500,
  leaderboard: [
    { id: 1, name: "Alex Johnson", avatar: "https://randomuser.me/api/portraits/men/32.jpg", points: 2450 },
    { id: 2, name: "Maria Garcia", avatar: "https://randomuser.me/api/portraits/women/44.jpg", points: 2120 },
    { id: 3, name: "David Kim", avatar: "https://randomuser.me/api/portraits/men/22.jpg", points: 1890 },
    { id: 4, name: "Current User", avatar: null, points: 1250, isCurrentUser: true },
    { id: 5, name: "Sarah Williams", avatar: "https://randomuser.me/api/portraits/women/67.jpg", points: 1180 }
  ]
};

const LeaderboardWidget = ({ position = mockLeaderboardData }) => {
  const navigate = useNavigate();
  
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
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
            #{position.user_position}
          </Typography>
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
      
      <Typography variant="subtitle2" gutterBottom>
        Top Performers
      </Typography>
      
      <List disablePadding>
        {position.leaderboard.map((user, index) => (
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
                  border: user.isCurrentUser ? '2px solid #1976d2' : 'none'
                }}
              >
                {!user.avatar && <PersonIcon />}
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography 
                    variant="body1"
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
                </Box>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {user.points} points
                  </Typography>
                  {index === 0 && (
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