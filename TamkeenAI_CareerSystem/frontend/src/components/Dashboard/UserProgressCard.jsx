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
  Collapse,
  Grid,
  useTheme
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
import { useUser } from '../../context/AppContext';
import { mockDashboardData } from '../../utils/mockData/mockDataIndex';
import { useTranslation } from 'react-i18next';

// Icons
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import CelebrationIcon from '@mui/icons-material/Celebration';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RecommendIcon from '@mui/icons-material/Recommend';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

// Styled components
const ProgressCard = styled(Card)(({ theme }) => ({
  height: '100%',
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  overflow: 'visible',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const ProgressCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const LevelBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: -15,
  right: 15,
  zIndex: 1,
}));

const LevelDisplay = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    fontSize: '0.75rem',
    padding: theme.spacing(0, 1),
    borderRadius: theme.shape.borderRadius,
    fontWeight: 'bold',
  },
}));

const ProgressCircleContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));

const CircularProgressBox = styled(Box)(({ theme, level }) => ({
  position: 'relative',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 130,
  height: 130,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: '50%',
    background: `linear-gradient(120deg, ${theme.palette.background.paper} 0%, ${
      level >= 10 
        ? theme.palette.gold.light
        : level >= 5
          ? theme.palette.silver.light
          : theme.palette.bronze.light
    } 100%)`,
    opacity: 0.2,
    zIndex: 0,
  },
}));

const AchievementGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const AchievementItem = styled(Box)(({ theme, unlocked }) => ({
  display: 'flex',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  backgroundColor: unlocked ? theme.palette.primary.light : theme.palette.action.disabledBackground,
  opacity: unlocked ? 1 : 0.7,
  marginBottom: theme.spacing(1),
}));

const NextLevelRequirements = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1.5),
  boxShadow: theme.shadows[1],
}));

const Milestone = styled(Box)(({ theme, completed }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  opacity: completed ? 1 : 0.7,
}));

const UserInfoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const WelcomeMessage = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: theme.palette.text.primary,
}));

const LevelText = styled(Typography)(({ theme, level }) => ({
  color: 
    level >= 10 
      ? theme.palette.gold.main
      : level >= 5
        ? theme.palette.silver.main
        : theme.palette.bronze.main,
  fontWeight: 'bold',
}));

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

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

const UserProgressCard = ({ data, user, expanded = false }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { profile } = useUser();
  const userData = user || profile || {};
  
  const [isExpanded, setIsExpanded] = useState(expanded);
  // Use data from props or fallback to default values to avoid undefined errors
  const [userXP, setUserXP] = useState(data?.xp || mockDashboardData?.progress?.xp || 0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [recentAchievement, setRecentAchievement] = useState(null);
  
  // Calculate user level and progress
  const calculateLevel = (xp) => {
    // XP required for each level follows formula: level * 100
    const level = Math.floor(xp / 100) + 1;
    const currentLevelXP = (level - 1) * 100;
    const nextLevelXP = level * 100;
    const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return { level, progress, currentLevelXP, nextLevelXP, xpToNextLevel: nextLevelXP - xp };
  };
  
  const userLevelData = calculateLevel(userXP);
  
  // Mock achievements data
  const achievements = [
    { id: 1, title: t('userProgress.firstLogin', 'أول تسجيل دخول'), icon: <CelebrationIcon />, unlocked: true },
    { id: 2, title: t('userProgress.profileCompleted', 'اكتمال الملف الشخصي'), icon: <CheckCircleIcon />, unlocked: userXP >= 50 },
    { id: 3, title: t('userProgress.resumeExpert', 'خبير السيرة الذاتية'), icon: <WorkspacePremiumIcon />, unlocked: userXP >= 150 },
    { id: 4, title: t('userProgress.interviewMaster', 'سيد المقابلات'), icon: <MilitaryTechIcon />, unlocked: userXP >= 250 },
    { id: 5, title: t('userProgress.skillPioneer', 'رائد المهارات'), icon: <EmojiObjectsIcon />, unlocked: userXP >= 350 },
    { id: 6, title: t('userProgress.jobHunter', 'صياد الوظائف'), icon: <TrendingUpIcon />, unlocked: userXP >= 450 },
  ];
  
  // Mock milestone data
  const milestones = [
    { id: 1, title: t('userProgress.completeProfile', 'أكمل ملفك الشخصي'), xp: 50, completed: userXP >= 50 },
    { id: 2, title: t('userProgress.uploadResume', 'ارفع سيرتك الذاتية'), xp: 75, completed: userXP >= 125 },
    { id: 3, title: t('userProgress.takeSkillAssessment', 'خذ تقييم المهارات'), xp: 100, completed: userXP >= 225 },
    { id: 4, title: t('userProgress.applyToJob', 'تقدم لوظيفة'), xp: 125, completed: userXP >= 350 },
  ];
  
  // Generate welcome message based on time of day and user data
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    const name = userData.firstName || userData.name || t('common.user');
    
    if (hour < 12) {
      return t('userProgress.welcome.morning', { name });
    } else if (hour < 18) {
      return t('userProgress.welcome.afternoon', { name });
    } else {
      return t('userProgress.welcome.evening', { name });
    }
  };
  
  // Simulate gaining XP for demo purposes
  useEffect(() => {
    const timer = setTimeout(() => {
      const newXP = userXP + 25;
      setUserXP(newXP);
      
      // Check if a new achievement was unlocked
      const newlyUnlocked = achievements.find(a => 
        !a.unlocked && 
        calculateLevel(userXP).level < calculateLevel(newXP).level
      );
      
      if (newlyUnlocked) {
        setRecentAchievement(newlyUnlocked);
        setShowAchievement(true);
        
        setTimeout(() => {
          setShowAchievement(false);
        }, 5000);
      }
    }, 30000); // Gain XP every 30 seconds
    
    return () => clearTimeout(timer);
  }, [userXP]);
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <ProgressCard>
        <LevelBadge>
          <LevelDisplay
            badgeContent={t('userProgress.level', { level: userLevelData.level })}
          >
            <Avatar 
              sx={{ 
                width: 48, 
                height: 48, 
                bgcolor: 
                  userLevelData.level >= 10 
                    ? theme.palette.gold.main
                    : userLevelData.level >= 5
                      ? theme.palette.silver.main
                      : theme.palette.bronze.main,
              }}
            >
              <EmojiEventsIcon />
            </Avatar>
          </LevelDisplay>
        </LevelBadge>
        
        <ProgressCardContent>
          <UserInfoBox>
            <Avatar 
              src={userData.avatar} 
              alt={userData.firstName || userData.name}
              sx={{ width: 56, height: 56, mr: 2 }}
            />
            <Box>
              <WelcomeMessage variant="h6">
                {getWelcomeMessage()}
              </WelcomeMessage>
              <Typography variant="body2" color="text.secondary">
                {userData.title || t('userProgress.careerExplorer')}
              </Typography>
            </Box>
          </UserInfoBox>
          
          <ProgressCircleContainer>
            <CircularProgressBox level={userLevelData.level}>
              <CircularProgress
                variant="determinate"
                value={userLevelData.progress}
                size={130}
                thickness={5}
                sx={{
                  color: 
                    userLevelData.level >= 10 
                      ? theme.palette.gold.main
                      : userLevelData.level >= 5
                        ? theme.palette.silver.main
                        : theme.palette.bronze.main,
                  zIndex: 1,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <Typography variant="h4" component="div" fontWeight="bold">
                  {userXP}
                </Typography>
                <Typography variant="caption" component="div" color="text.secondary">
                  {t('userProgress.xpPoints')}
                </Typography>
              </Box>
            </CircularProgressBox>
          </ProgressCircleContainer>
          
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <LevelText variant="subtitle1" level={userLevelData.level}>
              {t('userProgress.level', { level: userLevelData.level })} {
                userLevelData.level >= 10 
                  ? t('userProgress.gold') 
                  : userLevelData.level >= 5 
                    ? t('userProgress.silver') 
                    : t('userProgress.bronze')
              }
            </LevelText>
            <Typography variant="body2" color="text.secondary">
              {t('userProgress.toNextLevel', { points: userLevelData.xpToNextLevel })}
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">{t('userProgress.recentAchievements')}</Typography>
              <Tooltip title={t('userProgress.viewAll')}>
                <IconButton size="small">
                  <InfoOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box>
              {achievements
                .filter(a => a.unlocked)
                .slice(0, 3)
                .map(achievement => (
                  <AchievementItem key={achievement.id} unlocked={achievement.unlocked.toString()}>
                    <Avatar
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 1, 
                        bgcolor: theme.palette.primary.main
                      }}
                    >
                      {achievement.icon}
                    </Avatar>
                    <Typography variant="body2">
                      {achievement.title}
                    </Typography>
                  </AchievementItem>
                ))}
            </Box>
          </Box>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setIsExpanded(!isExpanded)}
            fullWidth
          >
            {isExpanded ? 'Hide Details' : 'Show More'}
          </Button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NextLevelRequirements>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Next Level Requirements
                  </Typography>
                  
                  {milestones.map(milestone => (
                    <Milestone key={milestone.id} completed={milestone.completed}>
                      <CheckCircleIcon 
                        color={milestone.completed ? "success" : "disabled"} 
                        fontSize="small"
                        sx={{ mr: 1 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2">
                          {milestone.title}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={milestone.completed ? 100 : 0}
                          sx={{ 
                            mt: 0.5, 
                            height: 4, 
                            borderRadius: 2 
                          }}
                        />
                      </Box>
                      <Chip
                        label={`+${milestone.xp} XP`}
                        size="small"
                        color={milestone.completed ? "primary" : "default"}
                        sx={{ ml: 1 }}
                      />
                    </Milestone>
                  ))}
                </NextLevelRequirements>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommended Actions
                  </Typography>
                  
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Tooltip title="Take a skill assessment to improve your profile">
                        <Button
                          variant="outlined"
                          color="secondary"
                          startIcon={<SchoolIcon />}
                          size="small"
                          fullWidth
                        >
                          Skill Quiz
                        </Button>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={6}>
                      <Tooltip title="Update your skills to get better job matches">
                        <Button
                          variant="outlined"
                          color="secondary"
                          startIcon={<FitnessCenterIcon />}
                          size="small"
                          fullWidth
                        >
                          Update Skills
                        </Button>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </ProgressCardContent>
      </ProgressCard>
      
      {/* New achievement notification */}
      <AnimatePresence>
        {showAchievement && recentAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000,
            }}
          >
            <Card sx={{ bgcolor: theme.palette.success.light, p: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{ 
                    bgcolor: theme.palette.success.main,
                    mr: 2
                  }}
                >
                  <StarIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" color="textPrimary">
                    Achievement Unlocked!
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {recentAchievement.title}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserProgressCard; 