import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  LinearProgress,
  Divider,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import RecommendIcon from '@mui/icons-material/Recommend';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const UserProgressCard = ({ data }) => {
  const [showMore, setShowMore] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [recentAchievement, setRecentAchievement] = useState(null);
  
  // Calculate user level and progress
  const userProgress = data?.overall || 0;
  const userLevel = data?.level || 1;
  const userRank = data?.rank || 'Beginner';
  const xpPoints = data?.xp || 0;
  const nextLevelXP = data?.nextLevelXp || 100;
  
  // Default data
  const progressData = {
    overall: userProgress,
    level: userLevel,
    rank: userRank,
    xp: xpPoints,
    nextLevelXp: nextLevelXP,
    goals: data?.goals || [
      { id: 1, title: 'Complete resume', completed: true },
      { id: 2, title: 'Apply to 10 jobs', completed: false },
      { id: 3, title: 'Complete skill assessment', completed: false }
    ],
    achievements: data?.recentAchievements || [
      { id: 1, title: 'First Login', date: '2023-10-15', icon: 'login' },
      { id: 2, title: 'Resume Expert', date: '2023-10-20', icon: 'resume' }
    ],
    skills: data?.skills || {
      technical: 65,
      communication: 80,
      leadership: 60
    }
  };

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex', 
      flexDirection: 'column',
      p: 2
    }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight="medium" gutterBottom>Your Progress</Typography>
        
        {/* Profile and Level */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mb: 1
        }}>
          <Avatar 
            sx={{ 
              width: 70, 
              height: 70, 
              mb: 1,
              bgcolor: 'primary.main',
              border: '4px solid #e0e0e0'
            }}
          >
            {userRank[0] || 'Z'}
          </Avatar>
          
          <Typography variant="h6">Level {progressData.level} {progressData.rank}</Typography>
          <Typography variant="body2" color="text.secondary">
            {progressData.nextLevelXp} XP to next level
          </Typography>
        </Box>
        
        {/* XP Points with Circular Progress */}
        <Box sx={{ 
          position: 'relative', 
          display: 'inline-flex',
          mb: 2
        }}>
          <CircularProgress
            variant="determinate"
            value={75}
            size={100}
            thickness={4}
            sx={{ color: 'primary.main' }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h4" component="div" fontWeight="bold">
              {progressData.xp}
            </Typography>
            <Typography variant="caption" component="div" color="text.secondary">
              XP Points
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 1.5 }} />
      
      {/* Skill Progress */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Skills Progress
        </Typography>
        
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Technical</Typography>
            <Typography variant="body2">{progressData.skills.technical}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressData.skills.technical} 
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Communication</Typography>
            <Typography variant="body2">{progressData.skills.communication}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressData.skills.communication} 
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">Leadership</Typography>
            <Typography variant="body2">{progressData.skills.leadership}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progressData.skills.leadership} 
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
      </Box>
      
      {/* Goals */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Current Goals
        </Typography>
        
        <List dense disablePadding>
          {progressData.goals.map(goal => (
            <ListItem key={goal.id} disablePadding sx={{ mb: 0.5, py: 0 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <CheckCircleIcon 
                  color={goal.completed ? "success" : "disabled"}
                  fontSize="small"
                />
              </ListItemIcon>
              <ListItemText 
                primary={goal.title}
                primaryTypographyProps={{
                  variant: "body2",
                  color: goal.completed ? "text.primary" : "text.secondary",
                  sx: goal.completed ? { textDecoration: 'line-through' } : {}
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      
      {/* Recent Achievements */}
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Recent Achievements
        </Typography>
        
        <List dense disablePadding>
          {progressData.achievements.map(achievement => (
            <ListItem key={achievement.id} disablePadding sx={{ mb: 0.5, py: 0 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <EmojiEventsIcon color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={achievement.title}
                secondary={achievement.date}
                primaryTypographyProps={{ variant: "body2" }}
                secondaryTypographyProps={{ variant: "caption" }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      
      {/* Upcoming Milestones (Only shown when "Show More" is clicked) */}
      {showMore && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Upcoming Milestones
          </Typography>
          
          <List dense disablePadding>
            <ListItem disablePadding sx={{ mb: 0.5, py: 0 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <StarIcon color="warning" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Reach Level 10"
                secondary="200 XP needed"
                primaryTypographyProps={{ variant: "body2" }}
                secondaryTypographyProps={{ variant: "caption" }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ mb: 0.5, py: 0 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <StarIcon color="warning" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Complete 20 Applications"
                secondary="8 more needed"
                primaryTypographyProps={{ variant: "body2" }}
                secondaryTypographyProps={{ variant: "caption" }}
              />
            </ListItem>
          </List>
        </Box>
      )}
      
      {/* Show More Button */}
      <Box sx={{ mt: 'auto', textAlign: 'center' }}>
        <Button 
          color="primary" 
          onClick={() => setShowMore(!showMore)}
          size="small"
          variant="outlined"
          sx={{ borderRadius: 20, textTransform: 'none', px: 2 }}
        >
          {showMore ? "Show Less" : "Show More"}
        </Button>
      </Box>
    </Box>
  );
};

export default UserProgressCard;