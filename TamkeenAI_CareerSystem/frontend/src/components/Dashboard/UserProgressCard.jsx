import React from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Divider, Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';

const UserProgressCard = ({ userProgress }) => {
  const { level, xp, xp_to_next_level, badges_earned, badges_total, recent_achievements } = userProgress;
  
  const progress = (xp / (xp + xp_to_next_level)) * 100;
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Your Progress</Typography>
          <Chip 
            icon={<StarIcon />} 
            label={`Level ${level}`} 
            color="primary" 
            variant="outlined" 
          />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              XP: {xp}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Next Level: {xp_to_next_level} XP needed
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <EmojiEventsIcon sx={{ mr: 1, color: 'gold' }} />
            <span>Badges: {badges_earned}/{badges_total}</span>
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Recent Achievements</Typography>
        {recent_achievements.length > 0 ? (
          recent_achievements.map((achievement, index) => (
            <Box key={index} sx={{ mb: 1, py: 1, px: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="body2">{achievement.title}</Typography>
              <Typography variant="caption" color="text.secondary">{achievement.description}</Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">No recent achievements</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UserProgressCard; 