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
  TableRow
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

const GamificationBoard = () => {
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

  useEffect(() => {
    // Fetch gamification data from API
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // Mock data for demonstration
        // In production, replace with actual API calls
        await mockFetchData();
      } catch (error) {
        console.error("Error fetching gamification data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const mockFetchData = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Set badges
    setBadges([
      {
        id: 1,
        name: "Profile Pioneer",
        description: "Created your career profile",
        earnedDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        earned: true,
        rarity: "common",
        xp: 50,
        icon: "PersonIcon"
      },
      {
        id: 2,
        name: "Resume Rookie",
        description: "Uploaded your first resume",
        earnedDate: new Date(Date.now() - 115 * 24 * 60 * 60 * 1000).toISOString(),
        earned: true,
        rarity: "common",
        xp: 50,
        icon: "SchoolIcon"
      },
      {
        id: 3,
        name: "Keyword Conqueror",
        description: "Added 20+ industry keywords to your resume",
        earnedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        earned: true,
        rarity: "uncommon",
        xp: 100,
        icon: "InsightsIcon"
      },
      {
        id: 4,
        name: "Application Apprentice",
        description: "Applied to your first job",
        earnedDate: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
        earned: true,
        rarity: "common",
        xp: 50,
        icon: "WorkspacePremiumIcon"
      },
      {
        id: 5,
        name: "ATS Adept",
        description: "Achieved 70%+ ATS score",
        earnedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        earned: true,
        rarity: "uncommon",
        xp: 150,
        icon: "BarChartIcon"
      },
      {
        id: 6,
        name: "ATS Ace",
        description: "Achieved 85%+ ATS score",
        earned: false,
        rarity: "rare",
        xp: 250,
        icon: "StarIcon"
      },
      {
        id: 7,
        name: "Offer Obtainer",
        description: "Received your first job offer",
        earned: false,
        rarity: "epic",
        xp: 1000,
        icon: "EmojiEventsIcon"
      },
      {
        id: 8,
        name: "Master Negotiator",
        description: "Successfully negotiated job offer terms",
        earned: false,
        rarity: "legendary",
        xp: 1500,
        icon: "WorkspacePremiumIcon"
      }
    ]);
    
    // Set challenges
    setChallenges([
      {
        id: 1,
        name: "Resume Makeover",
        description: "Improve your resume ATS score by 10+ points",
        status: "completed",
        reward: 200,
        completionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        difficulty: "medium",
        steps: [
          { description: "Analyze current resume weaknesses", completed: true },
          { description: "Add relevant keywords", completed: true },
          { description: "Restructure resume sections", completed: true },
          { description: "Submit for ATS scoring", completed: true }
        ]
      },
      {
        id: 2,
        name: "Skill Builder",
        description: "Complete a course on an in-demand skill",
        status: "completed",
        reward: 150,
        completionDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        difficulty: "easy",
        steps: [
          { description: "Select skill to improve", completed: true },
          { description: "Find appropriate course", completed: true },
          { description: "Complete all modules", completed: true },
          { description: "Pass final assessment", completed: true }
        ]
      },
      {
        id: 3,
        name: "Network Expander",
        description: "Connect with 5 new professionals in your field",
        status: "in_progress",
        progress: 60,
        reward: 200,
        difficulty: "medium",
        steps: [
          { description: "Identify target professionals", completed: true },
          { description: "Craft personalized connection messages", completed: true },
          { description: "Send connection requests", completed: true },
          { description: "Engage with 3 of 5 connections", completed: false }
        ]
      },
      {
        id: 4,
        name: "Mock Interview Marathon",
        description: "Complete 3 mock interviews",
        status: "in_progress",
        progress: 67,
        reward: 300,
        difficulty: "hard",
        steps: [
          { description: "Schedule first interview", completed: true },
          { description: "Complete first interview", completed: true },
          { description: "Schedule second interview", completed: true },
          { description: "Complete second interview", completed: true },
          { description: "Schedule third interview", completed: false },
          { description: "Complete third interview", completed: false }
        ]
      },
      {
        id: 5,
        name: "Knowledge Sharer",
        description: "Write an article on your area of expertise",
        status: "not_started",
        reward: 250,
        difficulty: "medium",
        steps: [
          { description: "Choose relevant topic", completed: false },
          { description: "Research and outline article", completed: false },
          { description: "Write first draft", completed: false },
          { description: "Edit and publish", completed: false }
        ]
      }
    ]);
    
    // Set skill progress data
    setSkillProgress({
      "Technical Skills": {
        "Python": { current: 85, history: [65, 70, 75, 85], target: 95 },
        "Data Analysis": { current: 70, history: [50, 55, 65, 70], target: 90 },
        "Machine Learning": { current: 60, history: [30, 40, 50, 60], target: 85 },
        "Web Development": { current: 45, history: [30, 35, 40, 45], target: 65 }
      },
      "Soft Skills": {
        "Communication": { current: 75, history: [65, 70, 73, 75], target: 90 },
        "Teamwork": { current: 80, history: [70, 75, 78, 80], target: 85 },
        "Problem Solving": { current: 65, history: [55, 58, 60, 65], target: 85 }
      },
      "Industry Knowledge": {
        "AI Ethics": { current: 55, history: [30, 40, 50, 55], target: 80 },
        "Data Privacy": { current: 60, history: [40, 45, 55, 60], target: 75 }
      }
    });
    
    // Set activity log
    setActivityLog([
      { id: 1, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), activity: "Completed second mock interview (score: 81%)", category: "interview", impact: 4, xp: 100 },
      { id: 2, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), activity: "Improved resume to v6 (ATS score: 78%)", category: "resume", impact: 3, xp: 75 },
      { id: 3, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), activity: "Applied to 3 positions at different companies", category: "application", impact: 4, xp: 100 },
      { id: 4, date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), activity: "Completed data visualization course", category: "learning", impact: 2, xp: 50 },
      { id: 5, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), activity: "Applied to ML Engineer at DataTech", category: "application", impact: 3, xp: 75 }
    ]);
    
    // Set career paths
    setCareerPaths({
      "Data Science": {
        entry_roles: ["Junior Data Analyst", "Data Visualization Specialist", "Research Assistant"],
        mid_roles: ["Data Scientist", "ML Engineer", "BI Developer"],
        advanced_roles: ["Lead Data Scientist", "AI Research Scientist", "Chief Data Officer"],
        connections: {
          "Junior Data Analyst": ["Data Scientist", "BI Developer"],
          "Data Scientist": ["Lead Data Scientist", "AI Research Scientist"],
          "ML Engineer": ["AI Research Scientist", "Lead Data Scientist"]
        },
        current_position: "Junior Data Analyst",
        target_position: "Lead Data Scientist",
        progress: 25
      },
      "Software Engineering": {
        entry_roles: ["Junior Developer", "QA Tester", "Technical Support"],
        mid_roles: ["Software Engineer", "DevOps Engineer", "Full Stack Developer"],
        advanced_roles: ["Senior Software Engineer", "Software Architect", "CTO"],
        connections: {
          "Junior Developer": ["Software Engineer", "Full Stack Developer"],
          "Software Engineer": ["Senior Software Engineer", "Software Architect"]
        },
        progress: 15
      }
    });
    
    // Set leaderboard data
    setLeaderboard([
      { id: 1, username: "DataMaster", position: "Data Scientist", level: 12, xp: 5845, badges: 21, rank: 1 },
      { id: 2, username: "TechGuru", position: "Software Engineer", level: 10, xp: 4950, badges: 18, rank: 2 },
      { id: 3, username: "CareerNinja", position: "Product Manager", level: 9, xp: 4320, badges: 16, rank: 3 },
      { id: 4, username: "AIExplorer", position: "ML Engineer", level: 8, xp: 3720, badges: 14, rank: 4 },
      { id: 5, username: "CloudMaster", position: "DevOps Engineer", level: 7, xp: 3450, badges: 12, rank: 5 },
      { id: 6, username: "You (Career Navigator)", position: "Junior Data Analyst", level: 5, xp: 2340, badges: 8, rank: 7 }
    ]);
  };

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

  const handleClaimReward = (challengeId) => {
    // Simulate API call to claim reward
    const updatedChallenges = challenges.map(challenge => {
      if (challenge.id === challengeId && challenge.status === "completed") {
        // Add XP
        setExperience(prevXp => prevXp + challenge.reward);
        
        // Show celebration
        showConfetti();
        
        return { ...challenge, rewardClaimed: true };
      }
      return challenge;
    });
    
    setChallenges(updatedChallenges);
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