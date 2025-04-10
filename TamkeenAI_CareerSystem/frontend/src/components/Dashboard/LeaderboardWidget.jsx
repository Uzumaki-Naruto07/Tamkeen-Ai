import React, { useState, useEffect } from 'react';
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
  ToggleButton,
  Card,
  CardContent,
  Tabs,
  Tab
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Mock data - will be replaced with API calls
const mockLeaderboardData = {
  "position": {
    "user_position": 0, // Set to 0 to indicate not ranked yet
    "total_users": 56,
    "top_percentile": 0, // Not ranked, so no percentile
    "points": 0, // No points yet
    "next_milestone": 100,
    "rank_history": [0, 0, 0, 0, 0, 0, 0] // No rank history
  },
  "leaderboard": [
    {
      "id": 1,
      "name": "Fatima Al Mansoori",
      "nameAr": "فاطمة المنصوري",
      "avatar": "/avatars/emirati-woman-1.jpg",
      "points": 1250,
      "position": 1
    },
    {
      "id": 2,
      "name": "Mohammed Al Hashimi",
      "nameAr": "محمد الهاشمي",
      "avatar": "/avatars/emirati-man-1.jpg",
      "points": 980,
      "position": 2
    },
    {
      "id": 3,
      "name": "Aisha Al Nuaimi",
      "nameAr": "عائشة النعيمي",
      "avatar": "/avatars/emirati-woman-2.jpg",
      "points": 850,
      "position": 3
    },
    {
      "id": 5,
      "name": "Omar Al Shamsi",
      "nameAr": "عمر الشامسي",
      "avatar": "/avatars/emirati-man-2.jpg",
      "points": 820,
      "position": 4
    },
    {
      "id": 6,
      "name": "Mariam Al Zaabi",
      "nameAr": "مريم الزعابي",
      "avatar": "/avatars/emirati-woman-3.jpg",
      "points": 765,
      "position": 5
    }
  ],
  "friends": [
    {
      "id": 1,
      "name": "Fatima Al Mansoori",
      "nameAr": "فاطمة المنصوري",
      "avatar": "/avatars/emirati-woman-1.jpg",
      "points": 1250,
      "position": 1
    },
    {
      "id": 5,
      "name": "Omar Al Shamsi",
      "nameAr": "عمر الشامسي",
      "avatar": "/avatars/emirati-man-2.jpg",
      "points": 820,
      "position": 4
    },
    {
      "id": 6,
      "name": "Mariam Al Zaabi",
      "nameAr": "مريم الزعابي",
      "avatar": "/avatars/emirati-woman-3.jpg",
      "points": 765,
      "position": 5
    }
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

const LeaderboardWidget = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [view, setView] = useState('global');
  const [showAll, setShowAll] = useState(false);
  
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
      setShowAll(false);
    }
  };
  
  const toggleShowAll = () => {
    setShowAll(!showAll);
  };
  
  // Calculate how many items to show
  const getDisplayedItems = () => {
    const list = view === 'global' ? mockLeaderboardData.leaderboard : mockLeaderboardData.friends;
    return list.slice(0, 3);
  };

  // Get appropriate name based on current language
  const getName = (user) => {
    return i18n.language === 'ar' && user.nameAr ? user.nameAr : user.name;
  };
  
  return (
    <Paper sx={{ p: 3, overflow: 'visible', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <EmojiEventsIcon color="primary" sx={{ mr: 1 }} />
          {t('leaderboard.title', 'Leaderboard')}
        </Typography>
        <Chip 
          label={`${mockLeaderboardData.position.total_users} ${t('leaderboard.members', 'Members')}`} 
          size="small" 
          color="primary" 
          variant="outlined"
        />
      </Box>
      
      {mockLeaderboardData.position.user_position > 0 ? (
        // Show ranking info when user is ranked
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          p: 2,
          bgcolor: 'primary.light',
          color: 'primary.contrastText',
          borderRadius: 1.5,
          boxShadow: '0 4px 8px rgba(25, 118, 210, 0.1)'
        }}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
              {t('leaderboard.yourRank', 'Your Rank')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mr: 1 }}>
                #{mockLeaderboardData.position.user_position}
              </Typography>
              <RankSparkline data={mockLeaderboardData.position.rank_history} />
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {t('leaderboard.topPercentile', 'Top {percentile}%')}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9, textAlign: 'right', fontWeight: 'medium' }}>
              {t('leaderboard.careerPoints', 'Career Points')}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
              {mockLeaderboardData.position.points}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, textAlign: 'right' }}>
              {t('leaderboard.nextMilestone', 'Next: {next_milestone}')}
            </Typography>
          </Box>
        </Box>
      ) : (
        // Show participation prompt when user is not yet ranked
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          p: 3,
          bgcolor: 'primary.light',
          color: 'primary.contrastText',
          borderRadius: 1.5,
          boxShadow: '0 4px 8px rgba(25, 118, 210, 0.1)',
          textAlign: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EmojiEventsIcon sx={{ fontSize: 32, mr: 1 }} />
            <Typography variant="h5" component="div" fontWeight="bold">
              {t('leaderboard.joinLeaderboard', 'Join the Leaderboard!')}
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t('leaderboard.completeTasks', 'Complete tasks to earn points and secure your rank')}
          </Typography>
          <Button 
            variant="contained" 
            color="secondary"
            size="small"
            onClick={() => navigate('/career-assessment')}
            sx={{ 
              borderRadius: 20,
              textTransform: 'none',
              px: 3,
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}
          >
            {t('leaderboard.startEarningPoints', 'Start Earning Points')}
          </Button>
        </Box>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('leaderboard.pointsToNextMilestone', 'Points to next milestone')}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={(mockLeaderboardData.position.points / mockLeaderboardData.position.next_milestone) * 100} 
          sx={{ height: 8, borderRadius: 4 }} 
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {mockLeaderboardData.position.points} {t('leaderboard.points', 'points')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mockLeaderboardData.position.next_milestone} {t('leaderboard.points', 'points')}
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
          {view === 'global' ? t('leaderboard.topPerformers', 'Top Performers') : t('leaderboard.friendsComparison', 'Friends Comparison')}
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
        {getDisplayedItems().map((user, index) => (
          <ListItem 
            key={user.id}
            sx={{ 
              py: 1.5,
              mb: 0.5,
              bgcolor: user.isCurrentUser ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: user.isCurrentUser ? 'primary.light' : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
              },
              position: 'relative'
            }}
          >
            {/* Position indicator for top 3 */}
            {index < 3 && view === 'global' && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  left: -8,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                  color: index === 0 || index === 1 ? 'black' : 'white',
                  fontWeight: 'bold',
                  fontSize: '0.75rem',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {index + 1}
              </Box>
            )}
            
            <ListItemAvatar>
              <Avatar 
                src={user.avatar} 
                alt={getName(user)}
                sx={{ 
                  bgcolor: !user.avatar ? 'primary.main' : undefined,
                  border: user.isCurrentUser ? '2px solid #1976d2' : (user.isFriend ? '2px solid #4caf50' : '1px solid #eee'),
                  width: 40,
                  height: 40,
                  '& img': {
                    objectFit: 'cover',
                    objectPosition: 'center top'
                  }
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
                    {getName(user)}
                  </Typography>
                  {user.isCurrentUser && (
                    <Chip 
                      label={t('leaderboard.you', 'You')} 
                      size="small" 
                      color="primary" 
                      sx={{ ml: 1, height: 20 }} 
                    />
                  )}
                  {user.isFriend && !user.isCurrentUser && (
                    <Chip 
                      label={t('leaderboard.friend', 'Friend')} 
                      size="small" 
                      color="success" 
                      sx={{ ml: 1, height: 20 }} 
                    />
                  )}
                  <Chip 
                    label={`Lv.${user.level || '1'}`} 
                    size="small" 
                    sx={{ ml: 1, height: 20, bgcolor: 
                      user.level >= 10 ? '#FFD700' : 
                      user.level >= 5 ? '#C0C0C0' : '#CD7F32',
                      color: user.level >= 5 ? 'black' : 'white'
                    }} 
                  />
                </Box>
              }
              secondary={
                <Box component="div" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary" component="span">
                    {user.team || t('leaderboard.teamMember', 'Team Member')}
                  </Typography>
                  <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                    {user.points} {t('leaderboard.pts', 'pts')}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          color="primary"
          size="small"
          onClick={() => navigate('/gamified-progress')}
          sx={{ 
            textTransform: 'none',
            borderRadius: 20,
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
            }
          }}
        >
          {t('leaderboard.viewFullLeaderboard', 'View Full Leaderboard')}
        </Button>
      </Box>
    </Paper>
  );
};

export default LeaderboardWidget; 