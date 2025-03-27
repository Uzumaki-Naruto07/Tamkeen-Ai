import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Chip, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  CircularProgress,
  Tooltip,
  IconButton,
  Badge,
  LinearProgress,
  Avatar,
  Card,
  CardContent,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Styled components
const ProgressCircle = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 120,
  height: 120,
}));

const LevelBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -10,
  right: -10,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: '50%',
  width: 40,
  height: 40,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 'bold',
  boxShadow: theme.shadows[3],
  border: `2px solid ${theme.palette.background.paper}`,
}));

const XPBar = styled(Box)(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
}));

const NextStepItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: theme.shape.borderRadius,
  },
}));

// Calculate level based on XP
const calculateLevel = (xp) => {
  // Level formula: level = 1 + floor(sqrt(xp / 100))
  return 1 + Math.floor(Math.sqrt(xp / 100));
};

// Calculate XP needed for next level
const xpForNextLevel = (level) => {
  // XP needed for next level: (level)^2 * 100
  return Math.pow(level, 2) * 100;
};

// Calculate XP progress percentage
const calculateXPProgress = (xp, level) => {
  const currentLevelXP = Math.pow(level - 1, 2) * 100;
  const nextLevelXP = Math.pow(level, 2) * 100;
  return ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
};

// Activity icon mapping
const activityIcons = {
  'resume': <AssignmentIcon />,
  'interview': <SchoolIcon />,
  'networking': <PeopleIcon />,
  'job': <WorkIcon />,
  'default': <AssignmentIcon />
};

const UserProgressCard = ({ userProgress }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  
  // Mock user XP data
  const [userData, setUserData] = useState({
    xp: 1250,
    recentXPGain: 75,
    achievements: [
      { id: 1, name: "Resume Master", icon: "resume", description: "Updated your resume 5 times", xp: 50, isNew: true },
      { id: 2, name: "Networking Pro", icon: "networking", description: "Connected with 10 professionals", xp: 75, isNew: false },
      { id: 3, name: "Interview Ready", icon: "interview", description: "Completed 3 mock interviews", xp: 100, isNew: false }
    ]
  });
  
  // Calculate level and progress
  const level = calculateLevel(userData.xp);
  const nextLevel = level + 1;
  const xpProgress = calculateXPProgress(userData.xp, nextLevel);
  const xpForNext = xpForNextLevel(nextLevel);
  const xpNeeded = xpForNext - userData.xp;
  
  // Handle expand click
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  // Show achievement animation
  useEffect(() => {
    const newAchievement = userData.achievements.find(a => a.isNew);
    if (newAchievement) {
      setTimeout(() => {
        setCurrentAchievement(newAchievement);
        setShowAchievement(true);
        
        // Hide after 5 seconds
        setTimeout(() => {
          setShowAchievement(false);
          
          // Update achievement to not be new anymore
          setUserData(prev => ({
            ...prev,
            achievements: prev.achievements.map(a => 
              a.id === newAchievement.id ? { ...a, isNew: false } : a
            )
          }));
        }, 5000);
      }, 1000);
    }
  }, []);
  
  return (
    <>
      {/* Achievement popup animation */}
      <AnimatePresence>
        {showAchievement && currentAchievement && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000,
            }}
          >
            <Card sx={{ 
              minWidth: 300, 
              boxShadow: 6,
              border: '2px solid gold',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmojiEventsIcon sx={{ color: 'gold', mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Achievement Unlocked!
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {activityIcons[currentAchievement.icon] || activityIcons.default}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {currentAchievement.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentAchievement.description}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                      +{currentAchievement.xp} XP
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <Paper sx={{ p: 3, height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Your Progress
          </Typography>
          <Tooltip title={`You've gained ${userData.recentXPGain} XP in the last week`}>
            <Chip 
              label={`+${userData.recentXPGain} XP`} 
              color="success" 
              size="small" 
              variant="outlined"
            />
          </Tooltip>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: { xs: 0, sm: 4 }, mb: { xs: 3, sm: 0 } }}>
            <ProgressCircle>
              <CircularProgress
                variant="determinate"
                value={userProgress.overall_completion}
                size={120}
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
                  flexDirection: 'column',
                }}
              >
                <Typography variant="h4" component="div" color="text.primary">
                  {userProgress.overall_completion}%
                </Typography>
                <Typography variant="caption" component="div" color="text.secondary">
                  Complete
                </Typography>
              </Box>
              <LevelBadge component={motion.div} whileHover={{ scale: 1.1 }}>
                {level}
              </LevelBadge>
            </ProgressCircle>
            
            <Tooltip 
              title={
                <React.Fragment>
                  <Typography variant="body2">How XP works:</Typography>
                  <ul style={{ paddingLeft: '16px', margin: '4px 0' }}>
                    <li>Resume updates: +10 XP</li>
                    <li>Mock interviews: +25 XP</li>
                    <li>Job applications: +15 XP</li>
                    <li>Networking: +10 XP</li>
                    <li>Skill assessments: +20 XP</li>
                  </ul>
                </React.Fragment>
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Level {level} • {userData.xp} XP
                </Typography>
                <InfoIcon fontSize="small" sx={{ ml: 0.5, color: 'text.secondary', fontSize: 16 }} />
              </Box>
            </Tooltip>
          </Box>
          
          <Box sx={{ flex: 1, width: '100%' }}>
            <XPBar>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {xpNeeded} XP to Level {nextLevel}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={xpProgress} 
                sx={{ height: 8, borderRadius: 4 }} 
              />
            </XPBar>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Career Progress
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  label={`Resume: ${userProgress.resume_completion}%`} 
                  size="small" 
                  color={userProgress.resume_completion > 80 ? "success" : "primary"}
                  variant="outlined"
                  onClick={() => navigate('/resume-builder')}
                />
                <Chip 
                  label={`Interviews: ${userProgress.interview_preparation}%`} 
                  size="small" 
                  color={userProgress.interview_preparation > 80 ? "success" : "primary"}
                  variant="outlined"
                  onClick={() => navigate('/mock-interview')}
                />
                <Chip 
                  label={`Networking: ${userProgress.networking_activity}%`} 
                  size="small" 
                  color={userProgress.networking_activity > 80 ? "success" : "primary"}
                  variant="outlined"
                  onClick={() => navigate('/networking')}
                />
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Activity Stats
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Tooltip title="View your applications">
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' }
                    }}
                    onClick={() => navigate('/job-search')}
                  >
                    <Typography variant="h6" color="text.primary">
                      {userProgress.job_applications}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Applications
                    </Typography>
                  </Box>
                </Tooltip>
                
                <Tooltip title="View your interviews">
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' }
                    }}
                    onClick={() => navigate('/interview-results')}
                  >
                    <Typography variant="h6" color="text.primary">
                      {userProgress.interviews_scheduled}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Interviews
                    </Typography>
                  </Box>
                </Tooltip>
                
                <Tooltip title="View your achievements">
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' }
                    }}
                    onClick={() => setExpanded(!expanded)}
                  >
                    <Typography variant="h6" color="text.primary">
                      {userData.achievements.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Achievements
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Recommended Next Steps
          </Typography>
          <List dense disablePadding>
            {userProgress.next_steps.map((step, index) => (
              <NextStepItem 
                key={step.id || index}
                disablePadding
                onClick={() => navigate(step.link)}
                sx={{ cursor: 'pointer' }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <motion.div whileHover={{ rotate: 10 }} whileTap={{ scale: 0.95 }}>
                    {index === 0 ? (
                      <Badge color="error" variant="dot">
                        {activityIcons[step.type] || <ArrowForwardIcon color="primary" />}
                      </Badge>
                    ) : (
                      activityIcons[step.type] || <ArrowForwardIcon color="primary" />
                    )}
                  </motion.div>
                </ListItemIcon>
                <ListItemText 
                  primary={step.title} 
                  primaryTypographyProps={{ 
                    variant: 'body2',
                    color: index === 0 ? 'primary' : 'text.primary'
                  }}
                />
              </NextStepItem>
            ))}
          </List>
        </Box>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Recent Achievements
            </Typography>
            <List dense disablePadding>
              {userData.achievements.map((achievement) => (
                <ListItem 
                  key={achievement.id}
                  disablePadding
                  sx={{ py: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Avatar 
                      sx={{ 
                        width: 28, 
                        height: 28, 
                        bgcolor: 'primary.main',
                        boxShadow: achievement.isNew ? '0 0 8px gold' : 'none'
                      }}
                    >
                      {activityIcons[achievement.icon] || activityIcons.default}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={achievement.name} 
                    secondary={achievement.description}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Chip 
                    label={`+${achievement.xp} XP`} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Collapse>
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <IconButton 
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            size="small"
          >
            <ExpandMoreIcon 
              sx={{ 
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: '0.3s'
              }} 
            />
          </IconButton>
        </Box>
      </Paper>
    </>
  );
};

export default UserProgressCard; 