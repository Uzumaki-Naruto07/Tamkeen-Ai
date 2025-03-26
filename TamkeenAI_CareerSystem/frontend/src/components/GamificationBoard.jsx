import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import CircleIcon from '@mui/icons-material/Circle';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'; 
import SchoolIcon from '@mui/icons-material/School';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import PersonIcon from '@mui/icons-material/Person';
import InsightsIcon from '@mui/icons-material/Insights';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import useConfetti from '../hooks/useConfetti';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useStyles/useMediaQuery';
import axios from 'axios';
import SendIcon from '@mui/icons-material/Send';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useUser } from './AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

// Define color scheme for achievement rarities
const rarityColors = {
  common: '#6c757d', // gray
  uncommon: '#2ecc71', // green
  rare: '#3498db', // blue
  epic: '#9b59b6', // purple
  legendary: '#f1c40f', // gold
};

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`gamification-tabpanel-${index}`}
      aria-labelledby={`gamification-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const GamificationBoard = ({ userId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showConfetti } = useConfetti();
  const [tabValue, setTabValue] = useState(0);
  const [userLevel, setUserLevel] = useState(5);
  const [experience, setExperience] = useState(2340);
  const [nextLevelXp, setNextLevelXp] = useState(3000);
  const [badges, setBadges] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [skillProgress, setSkillProgress] = useState({});
  const [activityLog, setActivityLog] = useState([]);
  const [careerPaths, setCareerPaths] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile, updateProfile } = useUser();

  useEffect(() => {
    // Fetch gamification data from API
    const fetchGamificationData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get gamification progress
        const progressResponse = await apiEndpoints.gamification.getProgress();
        
        // Get badges
        const badgesResponse = await apiEndpoints.gamification.getBadges();
        
        // Set state with fetched data
        setUserLevel(progressResponse.data.level);
        setExperience(progressResponse.data.totalXp);
        setNextLevelXp(progressResponse.data.xpForNextLevel);
        setSkillProgress(progressResponse.data.skillProgress);
        setActivityLog(progressResponse.data.activityLog);
        setCareerPaths(progressResponse.data.careerPaths);
        setLeaderboard(progressResponse.data.leaderboard);
        setBadges(badgesResponse.data.badges);
        setChallenges(badgesResponse.data.challenges);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load gamification data');
        console.error('Gamification data error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGamificationData();
  }, [userId, profile?.id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openBadgeDetails = (badge) => {
    setSelectedBadge(badge);
    setBadgeDialogOpen(true);
  };
  
  const closeBadgeDialog = () => {
    setBadgeDialogOpen(false);
  };
  
  const openChallengeDetails = (challenge) => {
    setSelectedChallenge(challenge);
    setChallengeDialogOpen(true);
  };
  
  const closeChallengeDialog = () => {
    setChallengeDialogOpen(false);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleClaimReward = async (rewardId) => {
    try {
      await apiEndpoints.gamification.claimReward(rewardId);
      // Update local state or refresh data
      setExperience(prevXp => prevXp + 100); // Assuming a default reward of 100 XP
      showConfetti();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to claim reward');
    }
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'PersonIcon': return <PersonIcon />;
      case 'SchoolIcon': return <SchoolIcon />;
      case 'WorkspacePremiumIcon': return <WorkspacePremiumIcon />;
      case 'StarIcon': return <StarIcon />;
      case 'EmojiEventsIcon': return <EmojiEventsIcon />;
      case 'BarChartIcon': return <BarChartIcon />;
      case 'InsightsIcon': return <InsightsIcon />;
      default: return <EmojiEventsIcon />;
    }
  };
  
  const renderBadges = () => {
    const earnedBadges = badges.filter(badge => badge.earned);
    const lockedBadges = badges.filter(badge => !badge.earned);
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Your Achievements ({earnedBadges.length}/{badges.length})
        </Typography>
        <Grid container spacing={2}>
          {earnedBadges.map((badge) => (
            <Grid item xs={6} sm={4} md={3} key={badge.id}>
              <Card 
                onClick={() => openBadgeDetails(badge)}
                sx={{ 
                  cursor: 'pointer', 
                  transition: 'transform 0.2s', 
                  '&:hover': { transform: 'scale(1.05)' },
                  bgcolor: alpha(rarityColors[badge.rarity], 0.1),
                  borderLeft: `4px solid ${rarityColors[badge.rarity]}`
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar sx={{ bgcolor: rarityColors[badge.rarity], mr: 1 }}>
                      {getIconComponent(badge.icon)}
                    </Avatar>
                    <Typography variant="subtitle1" noWrap>
                      {badge.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {badge.description}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip 
                      label={badge.rarity} 
                      size="small" 
                      sx={{ bgcolor: alpha(rarityColors[badge.rarity], 0.2), color: rarityColors[badge.rarity] }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      +{badge.xp} XP
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          
          {lockedBadges.length > 0 && (
            <Box width="100%" mt={4} mb={2}>
              <Typography variant="h6" gutterBottom>
                Badges to Unlock
              </Typography>
            </Box>
          )}
          
          {lockedBadges.map((badge) => (
            <Grid item xs={6} sm={4} md={3} key={badge.id}>
              <Card 
                onClick={() => openBadgeDetails(badge)}
                sx={{ 
                  cursor: 'pointer', 
                  opacity: 0.7,
                  bgcolor: 'rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s', 
                  '&:hover': { transform: 'scale(1.05)' }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.2)', mr: 1 }}>
                      <LockIcon />
                    </Avatar>
                    <Typography variant="subtitle1" noWrap>
                      {badge.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {badge.description}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Chip 
                      label={badge.rarity} 
                      size="small" 
                      sx={{ bgcolor: alpha(rarityColors[badge.rarity], 0.1), color: rarityColors[badge.rarity] }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      +{badge.xp} XP
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  const renderChallenges = () => {
    const activeChallenges = challenges.filter(c => c.status === "in_progress" || c.status === "completed" && !c.rewardClaimed);
    const completedChallenges = challenges.filter(c => c.status === "completed" && c.rewardClaimed);
    const upcomingChallenges = challenges.filter(c => c.status === "not_started");
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Active Challenges
        </Typography>
        <Grid container spacing={2}>
          {activeChallenges.map((challenge) => (
            <Grid item xs={12} sm={6} md={4} key={challenge.id}>
              <Card 
                onClick={() => openChallengeDetails(challenge)}
                sx={{ 
                  cursor: 'pointer', 
                  height: '100%',
                  transition: 'transform 0.2s', 
                  '&:hover': { transform: 'scale(1.02)' },
                  borderLeft: challenge.status === "completed" ? '4px solid #2ecc71' : '4px solid #3498db'
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    {challenge.status === "completed" ? (
                      <Avatar sx={{ bgcolor: '#2ecc71', mr: 1 }}>
                        <CheckCircleIcon />
                      </Avatar>
                    ) : (
                      <Avatar sx={{ bgcolor: '#3498db', mr: 1 }}>
                        <WhatshotIcon />
                      </Avatar>
                    )}
                    <Typography variant="subtitle1">
                      {challenge.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {challenge.description}
                  </Typography>
                  
                  {challenge.status === "in_progress" && (
                    <Box sx={{ mt: 1 }}>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Progress</Typography>
                        <Typography variant="body2" color="text.secondary">{challenge.progress}%</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={challenge.progress} 
                        sx={{ mt: 0.5, mb: 1 }} 
                      />
                    </Box>
                  )}
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Chip 
                      label={challenge.difficulty} 
                      size="small" 
                      color={
                        challenge.difficulty === "easy" ? "success" : 
                        challenge.difficulty === "medium" ? "primary" : "error"
                      }
                      variant="outlined"
                    />
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon fontSize="small" sx={{ color: '#f1c40f', mr: 0.5 }} />
                      {challenge.reward} XP
                    </Typography>
                  </Box>
                </CardContent>
                {challenge.status === "completed" && !challenge.rewardClaimed && (
                  <CardActions>
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="success" 
                      fullWidth 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClaimReward(challenge.id);
                      }}
                    >
                      Claim Reward
                    </Button>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
          
          {activeChallenges.length === 0 && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                <Typography>No active challenges at the moment.</Typography>
                <Button variant="outlined" sx={{ mt: 2 }}>Discover New Challenges</Button>
              </Box>
            </Grid>
          )}
        </Grid>
        
        {upcomingChallenges.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Upcoming Challenges
            </Typography>
            <Grid container spacing={2}>
              {upcomingChallenges.map((challenge) => (
                <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                  <Card 
                    onClick={() => openChallengeDetails(challenge)}
                    sx={{ 
                      cursor: 'pointer', 
                      height: '100%',
                      opacity: 0.8,
                      transition: 'transform 0.2s', 
                      '&:hover': { transform: 'scale(1.02)' },
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.1)', mr: 1 }}>
                          <HelpOutlineIcon />
                        </Avatar>
                        <Typography variant="subtitle1">
                          {challenge.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {challenge.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                        <Chip 
                          label={challenge.difficulty} 
                          size="small" 
                          color={
                            challenge.difficulty === "easy" ? "success" : 
                            challenge.difficulty === "medium" ? "primary" : "error"
                          }
                          variant="outlined"
                        />
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <StarIcon fontSize="small" sx={{ color: '#f1c40f', mr: 0.5 }} />
                          {challenge.reward} XP
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        fullWidth 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle start challenge
                        }}
                      >
                        Start Challenge
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {completedChallenges.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Completed Challenges
            </Typography>
            <Grid container spacing={2}>
              {completedChallenges.slice(0, 3).map((challenge) => (
                <Grid item xs={12} sm={6} md={4} key={challenge.id}>
                  <Card 
                    onClick={() => openChallengeDetails(challenge)}
                    sx={{ 
                      cursor: 'pointer',
                      opacity: 0.7,
                      height: '100%',
                      bgcolor: 'rgba(0,0,0,0.02)',
                      borderLeft: '4px solid #2ecc71'
                    }}
                  >
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Avatar sx={{ bgcolor: '#2ecc71', mr: 1 }}>
                          <CheckCircleIcon />
                        </Avatar>
                        <Typography variant="subtitle1">
                          {challenge.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {challenge.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          Completed: {formatDate(challenge.completionDate)}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <StarIcon fontSize="small" sx={{ color: '#f1c40f', mr: 0.5 }} />
                          {challenge.reward} XP
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    );
  };
  
  const renderSkills = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Skills Progress
        </Typography>
        
        {Object.entries(skillProgress).map(([category, skills]) => (
          <Box key={category} mb={4}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              {category}
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(skills).map(([skill, data]) => (
                <Grid item xs={12} sm={6} md={4} key={skill}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        {skill}
                      </Typography>
                      <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', justifyContent: 'center', mb: 1 }}>
                        <CircularProgress 
                          variant="determinate" 
                          value={data.current} 
                          size={80} 
                          thickness={4} 
                          sx={{ color: data.current >= 80 ? '#2ecc71' : data.current >= 60 ? '#3498db' : data.current >= 40 ? '#f39c12' : '#e74c3c' }}
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
                          }}
                        >
                          <Typography variant="body1" component="div" color="text.secondary">
                            {`${data.current}%`}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Current</span>
                          <span>Target: {data.target}%</span>
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(data.current / data.target) * 100} 
                          sx={{ mt: 0.5 }} 
                        />
                      </Box>
                      {data.history && data.history.length > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Growth: +{data.current - data.history[0]}% since start
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Box>
    );
  };
  
  const renderLeaderboard = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Career Community Leaderboard
        </Typography>
        
        <Box sx={{ mb: 4, p: 2, borderRadius: 1, bgcolor: '#f8f9fa' }}>
          <Box display="flex" alignItems="center">
            <Avatar 
              sx={{ 
                bgcolor: '#3498db', 
                mr: 2,
                width: 48,
                height: 48,
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="h6">7</Typography>
            </Avatar>
            <Box flexGrow={1}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                You (Career Navigator)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Level {userLevel} • {experience} XP • {badges.filter(b => b.earned).length} Badges
              </Typography>
            </Box>
            <Chip 
              label="Top 15%" 
              color="primary" 
              sx={{ fontWeight: 'bold' }} 
            />
          </Box>
        </Box>
        
        <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="leaderboard table">
            <TableHead>
              <TableRow>
                <TableCell align="center" width={70}>Rank</TableCell>
                <TableCell>User</TableCell>
                <TableCell align="center">Level</TableCell>
                <TableCell align="center">XP</TableCell>
                <TableCell align="center">Badges</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboard.map((user) => (
                <TableRow 
                  key={user.id} 
                  sx={{ 
                    backgroundColor: user.username.includes("You") ? alpha(theme.palette.primary.main, 0.1) : 'inherit',
                    '&:last-child td, &:last-child th': { border: 0 }
                  }}
                >
                  <TableCell align="center">
                    <Avatar 
                      sx={{ 
                        bgcolor: 
                          user.rank === 1 ? '#f1c40f' :  // Gold
                          user.rank === 2 ? '#bdc3c7' :  // Silver
                          user.rank === 3 ? '#d35400' :  // Bronze
                          '#3498db',                     // Blue for other ranks
                        width: 30,
                        height: 30,
                        margin: '0 auto',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {user.rank}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {user.username}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                        {user.position}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography fontWeight="bold">{user.level}</Typography>
                  </TableCell>
                  <TableCell align="center">{user.xp}</TableCell>
                  <TableCell align="center">{user.badges}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            sx={{ 
              borderRadius: '30px',
              px: 3 
            }}
          >
            View Full Leaderboard
          </Button>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading gamification data..." />;
  }
  
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }} elevation={3}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>AI</Avatar>
        <Typography variant="h6">Career AI Assistant</Typography>
      </Box>
      
      <Box 
        sx={{ 
          height: 300, 
          mb: 2, 
          p: 2, 
          bgcolor: 'grey.100', 
          borderRadius: 2, 
          overflowY: 'auto',
          border: '1px solid #e0e0e0'
        }}
      >
        {/* AI message */}
        <Box sx={{ mb: 2 }}>
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 1.5, 
              borderRadius: '10px 10px 0 10px', 
              display: 'inline-block', 
              maxWidth: '80%' 
            }}
          >
            <Typography>
              Hello! I'm your AI Career Assistant. I've analyzed your profile and I can help you optimize your career journey. What would you like to know today?
            </Typography>
          </Box>
        </Box>
        
        {/* User message */}
        <Box sx={{ mb: 2, textAlign: 'right' }}>
          <Box 
            sx={{ 
              bgcolor: 'grey.200', 
              color: 'text.primary', 
              p: 1.5, 
              borderRadius: '10px 10px 10px 0', 
              display: 'inline-block', 
              maxWidth: '80%',
              textAlign: 'left'
            }}
          >
            <Typography>
              What skills should I focus on developing next to improve my data science profile?
            </Typography>
          </Box>
        </Box>
        
        {/* AI response */}
        <Box sx={{ mb: 2 }}>
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 1.5, 
              borderRadius: '10px 10px 0 10px', 
              display: 'inline-block', 
              maxWidth: '80%' 
            }}
          >
            <Typography>
              Based on your current skill profile and market trends, I recommend focusing on:
            </Typography>
            <Box component="ol" sx={{ mt: 1, mb: 0, pl: 2 }}>
              <li><Typography component="span" fontWeight="bold">Deep Learning frameworks</Typography> - You're currently at 45%, and this is highly in demand</li>
              <li><Typography component="span" fontWeight="bold">Cloud Computing skills</Typography> - Your AWS/Azure skills are at 30%, and these are essential for deploying models</li>
              <li><Typography component="span" fontWeight="bold">Data Visualization</Typography> - Improving your Tableau/Power BI skills will complement your technical abilities</li>
            </Box>
            <Typography sx={{ mt: 1 }}>
              These skills appear in 78% of data science job postings in your target market.
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* Chat input */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField 
          fullWidth 
          placeholder="Ask me anything about your career path..." 
          variant="outlined"
          size="small"
          sx={{ 
            '& .MuiOutlinedInput-root': {
              borderRadius: '30px'
            }
          }}
        />
        <Button 
          variant="contained" 
          sx={{ borderRadius: '30px', px: 3 }}
          endIcon={<SendIcon />}
        >
          Send
        </Button>
      </Box>
      
      {/* Quick question buttons */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
        {['How do I improve my resume?', 'What jobs match my profile?', 'Prepare for interviews', 'Recommend courses'].map((text, index) => (
          <Chip 
            key={index}
            label={text}
            onClick={() => {}}
            sx={{ bgcolor: 'grey.100' }}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default GamificationBoard;