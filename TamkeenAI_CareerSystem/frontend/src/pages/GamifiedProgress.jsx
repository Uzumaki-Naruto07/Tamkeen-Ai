import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Divider,
  Chip, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon, LinearProgress,
  Avatar, CircularProgress, Alert, Badge, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip, Zoom, Collapse, Rating
} from '@mui/material';
import {
  EmojiEvents, Stars, WorkspacePremium, School, 
  Psychology, Insights, LightbulbCircle, CheckCircle,
  MilitaryTech, Visibility, List as ListIcon, 
  GridView, MoreHoriz, Celebration, BarChart, Timeline,
  TrendingUp, BubbleChart, FlagCircle, AssignmentTurnedIn,
  Work, Description, QuestionAnswer, PlayArrow, Lock,
  Engineering, Code, Business, SportsEsports, Language,
  Settings, RestartAlt, Share, ArrowForward, CircleOutlined,
  AccountCircle, AccessTime, Leaderboard, Groups, EmojiPeople,
  Add
} from '@mui/icons-material';
import { useUser } from '../context/AppContext';
import { apiEndpoints } from '../utils/endpoints';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillRadarChart from '../components/charts/SkillRadarChart';
import SkillsRadarChart from '../components/charts/SkillsRadarChart';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useTheme } from '../contexts/ThemeContext';
import { alpha } from '@mui/material/styles';

// Define AddIcon to ensure it's properly accessible throughout the component
const AddIcon = Add;

// Helper function to get the appropriate icon for badge category
const getBadgeIcon = (category) => {
  switch (category?.toLowerCase()) {
    case 'profile':
      return <AccountCircle />;
    case 'jobs':
      return <Work />;
    case 'skills':
      return <Psychology />;
    case 'interview':
      return <QuestionAnswer />;
    case 'learning':
      return <School />;
    case 'networking':
      return <Share />;
    case 'achievement':
      return <EmojiEvents />;
    default:
      return <Stars />;
  }
};

// Add these particle effect functions after the getBadgeIcon function
const generateParticles = (colors = ['#FFD700', '#FFA500', '#FF4500'], count = 30) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    duration: Math.random() * 2 + 1
  }));
};

// Add trophy images and illustrations URLs
const TROPHY_IMAGES = [
  'https://cdn-icons-png.flaticon.com/512/2583/2583344.png', // Gold trophy
  'https://cdn-icons-png.flaticon.com/512/2583/2583319.png', // Silver trophy
  'https://cdn-icons-png.flaticon.com/512/2583/2583434.png', // Bronze trophy
  'https://cdn-icons-png.flaticon.com/512/3132/3132775.png', // Achievement medal
];

// Crown images
const CROWN_IMAGES = {
  gold: "https://cdn-icons-png.flaticon.com/512/3975/3975963.png",
  silver: "https://cdn-icons-png.flaticon.com/512/3975/3975993.png",
  bronze: "https://cdn-icons-png.flaticon.com/512/3975/3975922.png"
};

const SKILL_ICONS = {
  "React": "https://cdn-icons-png.flaticon.com/512/1126/1126012.png",
  "JavaScript": "https://cdn-icons-png.flaticon.com/512/5968/5968292.png",
  "Node.js": "https://cdn-icons-png.flaticon.com/512/5968/5968322.png",
  "TypeScript": "https://cdn-icons-png.flaticon.com/512/5968/5968381.png",
  "UI/UX Design": "https://cdn-icons-png.flaticon.com/512/1055/1055666.png",
  "GraphQL": "https://cdn-icons-png.flaticon.com/512/8428/8428860.png",
  "Python": "https://cdn-icons-png.flaticon.com/512/5968/5968350.png",
  "Java": "https://cdn-icons-png.flaticon.com/512/226/226777.png",
  "C++": "https://cdn-icons-png.flaticon.com/512/6132/6132222.png",
  "AWS": "https://cdn-icons-png.flaticon.com/512/5968/5968371.png"
};

// Floating elements component
const FloatingElements = () => {
  const elements = [
    { icon: <Code />, color: 'primary.light', size: 24 },
    { icon: <Psychology />, color: 'secondary.light', size: 28 },
    { icon: <School />, color: 'success.light', size: 26 },
    { icon: <Stars />, color: 'warning.light', size: 22 },
    { icon: <EmojiEvents />, color: 'error.light', size: 30 },
    { icon: <WorkspacePremium />, color: 'info.light', size: 28 }
  ];

  return (
    <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {elements.map((element, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
            color: element.color,
            opacity: 0.4,
            fontSize: element.size
          }}
          animate={{
            y: [0, -15, 0],
            x: [0, Math.random() * 10 - 5, 0],
            rotate: [0, Math.random() * 20 - 10, 0],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            ease: "easeInOut",
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        >
          {element.icon}
        </motion.div>
      ))}
    </Box>
  );
};

// Enhanced animated background with more effects
const EnhancedBackground = ({ children, density = 6, color = 'primary' }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 'inherit', height: '100%' }}>
      {/* Animated circles */}
      {[...Array(density)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            background: isDarkMode
              ? `radial-gradient(circle, ${color === 'primary' ? 'rgba(66,165,245,0.08)' : 'rgba(186,104,200,0.08)'} 0%, ${color === 'primary' ? 'rgba(66,165,245,0.03)' : 'rgba(186,104,200,0.03)'} 70%, rgba(0,0,0,0) 100%)`
              : `radial-gradient(circle, ${color === 'primary' ? 'rgba(25,118,210,0.05)' : 'rgba(156,39,176,0.05)'} 0%, ${color === 'primary' ? 'rgba(25,118,210,0.02)' : 'rgba(156,39,176,0.02)'} 70%, rgba(255,255,255,0) 100%)`,
            width: `${Math.random() * 300 + 100}px`,
            height: `${Math.random() * 300 + 100}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            zIndex: 0
          }}
          animate={{
            x: [0, Math.random() * 30 - 15],
            y: [0, Math.random() * 30 - 15],
            scale: [1, Math.random() * 0.2 + 0.9, 1]
          }}
          transition={{
            duration: Math.random() * 8 + 5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        />
      ))}
      
      {/* Floating elements for visual interest */}
      <FloatingElements />
      
      {/* Grid pattern overlay for depth */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: isDarkMode 
            ? 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 1px, transparent 1px)' 
            : 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          opacity: 0.3,
          zIndex: 0
        }}
      />
      
      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>
      {children}
      </Box>
    </Box>
  );
};

// Add leaderboard mock data
const MOCK_LEADERBOARD = [
  {
    id: 'user-1',
    name: 'Fatima Al Mansoori',
    level: 1,
    role: 'Team Member',
    points: 1250,
    avatar: null,
    trend: 'stable'
  },
  {
    id: 'user-2',
    name: 'Mohammed Al Hashimi',
    level: 1,
    role: 'Team Member',
    points: 980,
    avatar: null,
    trend: 'up'
  },
  {
    id: 'user-3',
    name: 'Aisha Al Nuaimi',
    level: 1,
    role: 'Team Member',
    points: 810,
    avatar: null,
    trend: 'up'
  },
  {
    id: 'user-4',
    name: 'Ahmed Al Mazrouei',
    level: 2,
    role: 'Associate',
    points: 760,
    avatar: null,
    trend: 'down'
  },
  {
    id: 'user-5',
    name: 'Noura Al Dhaheri',
    level: 1,
    role: 'Team Member',
    points: 720,
    avatar: null,
    trend: 'up'
  },
  {
    id: 'user-6',
    name: 'Khalid Al Shamsi',
    level: 2,
    role: 'Associate',
    points: 695,
    avatar: null,
    trend: 'down'
  },
  {
    id: 'user-7',
    name: 'Maryam Al Marzooqi',
    level: 1,
    role: 'Team Member',
    points: 670,
    avatar: null,
    trend: 'up'
  },
  {
    id: 'user-8',
    name: 'Saeed Al Ameri',
    level: 1,
    role: 'Team Member',
    points: 640,
    avatar: null,
    trend: 'stable'
  },
  {
    id: 'user-9',
    name: 'Huda Al Ali',
    level: 1,
    role: 'Team Member',
    points: 590,
    avatar: null,
    trend: 'up'
  },
  {
    id: 'user-10',
    name: 'Omar Al Suwaidi',
    level: 2,
    role: 'Associate',
    points: 560,
    avatar: null,
    trend: 'down'
  },
  {
    id: 'user-11',
    name: 'Layla Al Qubaisi',
    level: 1,
    role: 'Team Member',
    points: 540,
    avatar: null,
    trend: 'up'
  },
  {
    id: 'user-12',
    name: 'Ibrahim Al Balushi',
    level: 1,
    role: 'Team Member',
    points: 510,
    avatar: null,
    trend: 'stable'
  },
  {
    id: 'user-13',
    name: 'Reem Al Falasi',
    level: 1,
    role: 'Team Member',
    points: 490,
    avatar: null,
    trend: 'up'
  },
  {
    id: 'user-14',
    name: 'Yousef Al Zaabi',
    level: 1,
    role: 'Team Member',
    points: 460,
    avatar: null,
    trend: 'stable'
  },
  {
    id: 'user-15',
    name: 'Salama Al Kaabi',
    level: 1,
    role: 'Team Member',
    points: 430,
    avatar: null,
    trend: 'up'
  }
];

// Add a new animated background component for the leaderboard
const GameParticlesBackground = () => {
  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
      {/* Animated particles */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 8 + 2,
            height: Math.random() * 8 + 2,
            borderRadius: '50%',
            backgroundColor: ['#FFD700', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0'][Math.floor(Math.random() * 5)],
            opacity: Math.random() * 0.5 + 0.1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            zIndex: 0
          }}
          animate={{
            y: [0, -(Math.random() * 100 + 50)],
            x: [0, (Math.random() * 40 - 20)],
            opacity: [0.1, 0.6, 0],
            scale: [1, Math.random() * 0.5 + 0.5]
          }}
          transition={{
            duration: Math.random() * 10 + 5,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
            delay: Math.random() * 5
          }}
        />
      ))}
      
      {/* Floating polygons */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`poly-${i}`}
          style={{
            position: 'absolute',
            width: Math.random() * 30 + 10,
            height: Math.random() * 30 + 10,
            borderRadius: Math.random() > 0.7 ? '50%' : `${Math.floor(Math.random() * 3) + 3}px`,
            border: `1px solid rgba(255,255,255,${Math.random() * 0.2 + 0.1})`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            zIndex: 0
          }}
          animate={{
            rotate: [0, 360],
            y: [0, -(Math.random() * 100 + 30)],
            x: [0, (Math.random() * 50 - 25)],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear'
          }}
        />
      ))}
    </Box>
  );
};

const GamifiedProgress = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLevel, setUserLevel] = useState(4);
  const [currentXP, setCurrentXP] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [skillStats, setSkillStats] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(0);
  
  // Add new state variables for animations and rewards
  const [showConfetti, setShowConfetti] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');
  const [pageAnimationComplete, setPageAnimationComplete] = useState(false);
  const { width, height } = useWindowSize();
  const { isDarkMode } = useTheme();
  
  const { profile } = useUser();
  
  // Log for debugging
  console.log("gamified-progress:153 Browser compatibility check completed");
  
  // Load user progress from localStorage
  const loadProgressFromLocalStorage = () => {
    try {
      const savedProgress = localStorage.getItem('userGameProgress');
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        return parsedProgress;
      }
    } catch (error) {
      console.error('Error loading progress from localStorage:', error);
    }
    return null;
  };

  // Save user progress to localStorage
  const saveProgressToLocalStorage = (progressData) => {
    try {
      localStorage.setItem('userGameProgress', JSON.stringify(progressData));
      console.log('Progress saved to localStorage successfully');
    } catch (error) {
      console.error('Error saving progress to localStorage:', error);
    }
  };
  
  // Fetch user's progress data
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Try to load from localStorage first
        const savedProgress = loadProgressFromLocalStorage();
        
        if (savedProgress) {
          // Use data from localStorage if available
          setUserLevel(savedProgress.level || 4);
          setCurrentXP(savedProgress.currentXP || 0);
          setXpToNextLevel(savedProgress.xpToNextLevel || 100);
          setBadges(savedProgress.badges || []);
          setAchievements(savedProgress.achievements || []);
          setChallenges(savedProgress.challenges || []);
          setSkillStats(savedProgress.skillStats || {});
          setActivityHistory(savedProgress.activityHistory || []);
          
          // Set recent achievements
          setRecentAchievements(
            (savedProgress.achievements || [])
              .filter(a => a.achieved)
              .sort((a, b) => new Date(b.dateAchieved) - new Date(a.dateAchieved))
              .slice(0, 3)
          );
          
          setLoading(false);
          return;
        }
        
        // Fallback to mock data if nothing in localStorage
        // Mock progress data with level 4
        const progressData = {
          level: 4, // Set to level 4 instead of original value
          currentXP: 350,
          xpToNextLevel: 500,
          totalXP: 1350,
          streak: 5,
          activeDays: 21
        };
        
        // Mock badges data
        const badgesData = [
          {
            id: 'badge-1',
            name: 'Profile Master',
            description: 'Completed your profile with all details',
            category: 'profile',
            color: '#4CAF50',
            unlocked: true,
            dateAchieved: '2023-02-15T10:30:00Z',
            criteria: ['Complete personal info', 'Add profile picture', 'Add a resume']
          },
          {
            id: 'badge-2',
            name: 'Job Seeker',
            description: 'Applied to 10 jobs',
            category: 'jobs',
            color: '#2196F3',
            unlocked: true,
            dateAchieved: '2023-03-10T14:15:00Z',
            criteria: ['Apply to 10 jobs']
          },
          {
            id: 'badge-3',
            name: 'Skill Builder',
            description: 'Added 15 skills to your profile',
            category: 'skills',
            color: '#9C27B0',
            unlocked: true,
            dateAchieved: '2023-03-05T09:45:00Z',
            criteria: ['Add 15 skills to your profile']
          },
          {
            id: 'badge-4',
            name: 'Interview Ace',
            description: 'Complete 5 mock interviews',
            category: 'interview',
            color: '#F44336',
            unlocked: false,
            criteria: ['Complete 5 mock interviews with a score of 80% or higher']
          },
          {
            id: 'badge-5',
            name: 'Networking Pro',
            description: 'Connected with 10 professionals',
            category: 'networking',
            color: '#FF9800',
            unlocked: false,
            criteria: ['Connect with 10 professionals in your industry']
          }
        ];
        
        // Mock achievements data
        const achievementsData = [
          {
            id: 'achieve-1',
            name: 'First Job Application',
            description: 'Applied to your first job',
            category: 'jobs',
            points: 50,
            achieved: true,
            dateAchieved: '2023-01-20T11:30:00Z'
          },
          {
            id: 'achieve-2',
            name: 'Resume Uploaded',
            description: 'Uploaded your first resume',
            category: 'profile',
            points: 30,
            achieved: true,
            dateAchieved: '2023-01-15T09:20:00Z'
          },
          {
            id: 'achieve-3',
            name: 'Skill Assessment Completed',
            description: 'Completed your first skill assessment',
            category: 'skills',
            points: 75,
            achieved: true,
            dateAchieved: '2023-01-25T14:45:00Z'
          },
          {
            id: 'achieve-4',
            name: 'Interview Feedback',
            description: 'Received feedback from 3 mock interviews',
            category: 'interview',
            points: 60,
            achieved: true,
            dateAchieved: '2023-02-10T16:30:00Z'
          },
          {
            id: 'achieve-5',
            name: 'Learning Streak',
            description: 'Learned for 7 consecutive days',
            category: 'learning',
            points: 100,
            achieved: false
          }
        ];
        
        // Mock challenges data
        const challengesData = [
          {
            id: 'challenge-1',
            name: 'Resume Optimizer',
            description: 'Improve your resume score by 15%',
            category: 'resume',
            difficulty: 'medium',
            xpReward: 150,
            deadline: '2023-04-15T23:59:59Z',
            status: 'in-progress',
            progress: 60,
            accepted: true
          },
          {
            id: 'challenge-2',
            name: 'Interview Preparation',
            description: 'Complete 3 mock interviews this week',
            category: 'interview',
            difficulty: 'hard',
            xpReward: 200,
            deadline: '2023-04-10T23:59:59Z',
            status: 'not-started',
            progress: 0,
            accepted: false
          },
          {
            id: 'challenge-3',
            name: 'Skill Development',
            description: 'Complete 2 skill courses',
            category: 'learning',
            difficulty: 'easy',
            xpReward: 100,
            deadline: '2023-04-20T23:59:59Z',
            status: 'completed',
            progress: 100,
            accepted: true
          }
        ];
        
        // Mock skill stats data
        const skillStatsData = {
          "React": 90,
          "JavaScript": 85,
          "Node.js": 70,
          "TypeScript": 75,
          "UI/UX Design": 60,
          "GraphQL": 65
        };
        
        // Mock activity history data
        const activityHistoryData = [
          {
            id: 'activity-1',
            type: 'job_application',
            description: 'Applied for Frontend Developer at TechCorp UAE',
            timestamp: '2023-03-15T10:30:00Z',
            xpEarned: 20
          },
          {
            id: 'activity-2',
            type: 'skill_assessment',
            description: 'Completed React assessment with 85% score',
            timestamp: '2023-03-12T14:15:00Z',
            xpEarned: 50
          },
          {
            id: 'activity-3',
            type: 'learning',
            description: 'Completed course: Advanced TypeScript',
            timestamp: '2023-03-10T09:45:00Z',
            xpEarned: 30
          },
          {
            id: 'activity-4',
            type: 'achievement',
            description: 'Earned badge: Skill Builder',
            timestamp: '2023-03-05T09:45:00Z',
            xpEarned: 75
          },
          {
            id: 'activity-5',
            type: 'interview',
            description: 'Completed mock interview for Software Engineer position',
            timestamp: '2023-03-02T11:30:00Z',
            xpEarned: 40
          }
        ];
        
        setUserLevel(progressData.level || 4);
        setCurrentXP(progressData.currentXP || 0);
        setXpToNextLevel(progressData.xpToNextLevel || 100);
        setBadges(badgesData || []);
        setAchievements(achievementsData || []);
        
        // Set recent achievements (last 3)
        setRecentAchievements(
          (achievementsData || [])
            .filter(a => a.achieved)
            .sort((a, b) => new Date(b.dateAchieved) - new Date(a.dateAchieved))
            .slice(0, 3)
        );
        
        setChallenges(challengesData || []);
        setSkillStats(skillStatsData || {});
        setActivityHistory(activityHistoryData || []);
        
        // Save the initial mock data to localStorage
        saveProgressToLocalStorage({
          level: progressData.level,
          currentXP: progressData.currentXP,
          xpToNextLevel: progressData.xpToNextLevel,
          badges: badgesData,
          achievements: achievementsData,
          challenges: challengesData,
          skillStats: skillStatsData,
          activityHistory: activityHistoryData
        });
        
      } catch (err) {
        setError('Failed to load progress data');
        console.error('Error fetching progress data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgressData();
  }, [profile]);
  
  // Trigger initial page entrance animation completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageAnimationComplete(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle view rewards button click - level up and save
  const handleViewRewards = () => {
    // Store previous level for comparison
    const previousLevel = userLevel;
    
    // Update to level 5
    setUserLevel(5);
    setCurrentXP(0);
    setXpToNextLevel(750);
    
    // Show popup and confetti with appropriate message
    const levelUpMessage = previousLevel < 5 
      ? "Congratulations! You've reached Level 5!" 
      : "Level 5 rewards collected!";
    
    setRewardMessage(levelUpMessage);
    setShowRewardPopup(true);
    setShowConfetti(true);
    
    // Trigger confetti animation
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.4 }
    });
    
    // Save updated progress to localStorage
    const currentProgress = loadProgressFromLocalStorage() || {};
    saveProgressToLocalStorage({
      ...currentProgress,
      level: 5,
      currentXP: 0,
      xpToNextLevel: 750
    });
    
    // Create a new activity for level up
    const newActivity = {
      id: `activity-${Date.now()}`,
      type: 'achievement',
      description: previousLevel < 5 ? 'Leveled up to Level 5' : 'Collected Level 5 rewards',
      timestamp: new Date().toISOString(),
      xpEarned: 500
    };
    
    // Add to activity history
    const updatedActivity = [newActivity, ...activityHistory];
    setActivityHistory(updatedActivity);
    
    // Update in localStorage
    saveProgressToLocalStorage({
      ...currentProgress,
      level: 5, 
      currentXP: 0,
      xpToNextLevel: 750,
      activityHistory: updatedActivity
    });
    
    // Hide confetti after a few seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };
  
  // Handle closing the reward popup
  const handleCloseRewardPopup = () => {
    setShowRewardPopup(false);
  };
  
  // Handle opening badge details
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setBadgeDialogOpen(true);
    
    // If badge was recently achieved, trigger confetti
    if (recentAchievements.some(a => a.id === badge.id)) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 300);
    }
  };
  
  // Handle opening challenge details
  const handleChallengeClick = (challenge) => {
    setSelectedChallenge(challenge);
    setChallengeDialogOpen(true);
  };
  
  // Handle accepting a challenge
  const handleAcceptChallenge = async (challengeId) => {
    if (!profile?.id) return;
    
    try {
      // Mock accept challenge - no API call needed
      console.log('Accepting challenge:', challengeId);
      
      // Update the challenge in the list
      setChallenges(prev => 
        prev.map(c => c.id === challengeId ? { ...c, accepted: true } : c)
      );
    } catch (err) {
      console.error('Error accepting challenge:', err);
    }
    
    setChallengeDialogOpen(false);
  };
  
  // Calculate progress percentage for XP bar
  const calculateXPPercentage = () => {
    if (xpToNextLevel === 0) return 100;
    return (currentXP / xpToNextLevel) * 100;
  };

  // Add a useEffect to prepare the leaderboard with the current user from profile
  useEffect(() => {
    const prepareLeaderboardWithCurrentUser = () => {
      // Clone the mock leaderboard
      const leaderboardData = [...MOCK_LEADERBOARD];
      
      // Get current user info from profile
      if (profile?.id) {
        // Create a user object for the current user with higher points to ensure visibility
        const currentUser = {
          id: `user-${profile.id}`,
          name: profile?.firstName && profile?.lastName 
            ? `${profile.firstName} ${profile.lastName}`
            : profile?.displayName || "You",
          level: userLevel || 4, // Use the current level
          role: profile.role || 'Team Member',
          points: 1100, // Higher points to ensure top 5 placement
          avatar: profile.avatar || null,
          trend: 'up',
          isCurrentUser: true // Explicitly mark as current user
        };
        
        // Find position to insert the user (higher rank - top 3-5)
        const insertPosition = 2; // Position 3 (index 2) - Bronze medal position
        
        // Remove any existing entry for the user
        const filteredLeaderboard = leaderboardData.filter(user => 
          !(user.name.toLowerCase() === currentUser.name.toLowerCase() ||
          user.id === currentUser.id)
        );
        
        // Insert at the target position
        filteredLeaderboard.splice(insertPosition, 0, currentUser);
        
        // Sort by points to ensure correct ranking
        filteredLeaderboard.sort((a, b) => b.points - a.points);
        
        // Find user's position after sorting
        const userPosition = filteredLeaderboard.findIndex(user => user.isCurrentUser);
        
        if (userPosition >= 0) {
          setUserRank(userPosition + 1);
        }
        
        // Update the leaderboard state
        setLeaderboard(filteredLeaderboard);
      } else {
        // Default fallback if no profile
        setUserRank(3);
        setLeaderboard(MOCK_LEADERBOARD);
      }
    };
    
    prepareLeaderboardWithCurrentUser();
  }, [profile, userLevel]);

  return (
    <Box sx={{ py: 3 }}>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />}
      
      {/* Reward Popup */}
      <Snackbar 
        open={showRewardPopup} 
        autoHideDuration={6000} 
        onClose={handleCloseRewardPopup}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert 
          elevation={6} 
          variant="filled" 
          onClose={handleCloseRewardPopup} 
          severity="success"
          sx={{ 
            width: '100%',
            fontSize: '1.1rem',
            '& .MuiAlert-icon': {
              fontSize: '2rem'
            }
          }}
        >
          {rewardMessage}
        </MuiAlert>
      </Snackbar>
      
      {loading ? (
        <LoadingSpinner message="Loading gamification data..." />
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* User Progress Summary - REMOVED */}

          {/* Animated Level Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ marginBottom: '24px' }}
          >
            <Paper 
              sx={{ 
                borderRadius: 3, 
                p: 0, 
                overflow: 'hidden',
                background: isDarkMode 
                  ? 'linear-gradient(135deg, #3949AB 0%, #5E35B1 100%)' 
                  : 'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)',
                boxShadow: isDarkMode 
                  ? '0 10px 30px rgba(57, 73, 171, 0.3)' 
                  : '0 10px 30px rgba(142, 45, 226, 0.3)',
                position: 'relative',
              }}
            >
              {/* Glowing orbs */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  width: '150px', 
                  height: '150px', 
                  borderRadius: '50%', 
                  background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
                  top: '-75px',
                  left: '10%',
                  filter: 'blur(20px)',
                  opacity: 0.7
                }} 
              />
              
              <Box 
                sx={{ 
                  position: 'absolute', 
                  width: '200px', 
                  height: '200px', 
                  borderRadius: '50%', 
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
                  bottom: '-100px',
                  right: '15%',
                  filter: 'blur(25px)',
                  opacity: 0.6
                }} 
              />
              
              <Grid 
                container 
                alignItems="center" 
                sx={{ 
                  position: 'relative', 
                  zIndex: 1,
                  p: { xs: 2, md: 3 }
                }}
              >
                <Grid item xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ position: 'relative' }}>
                    <motion.div
                      animate={{ 
                        rotateY: [0, 360],
                      }}
                      transition={{ 
                        duration: 10,
                        ease: "linear",
                        repeat: Infinity
                      }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <Box
                        component="img"
                        src={TROPHY_IMAGES[0]}
                        alt="Level Trophy"
                        sx={{ 
                          width: { xs: 80, md: 100 },
                          height: { xs: 80, md: 100 },
                          mr: 3,
                          filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.4))'
                        }}
                      />
                    </motion.div>
                    
                    {/* Glowing effect */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 70%)',
                        filter: 'blur(15px)',
                        opacity: 0.7,
                        transform: 'translate(-50%, -50%)',
                        top: '50%',
                        left: '50%',
                        width: '120%',
                        height: '120%'
                      }}
                    />
                  </Box>
                  
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.9)',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        mb: 0.5
                      }}
                    >
                      Current Career Level
                    </Typography>
                    
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        color: '#ffffff',
                        fontWeight: 700,
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        mb: 0.5,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      Level {userLevel}
                      <Chip
                        label={userLevel === 5 ? "MAX" : ""}
                        size="small"
                        color="secondary"
                        sx={{ 
                          ml: 2, 
                          fontWeight: 'bold',
                          display: userLevel === 5 ? 'inline-flex' : 'none',
                          bgcolor: 'rgba(255,255,255,0.9)',
                          color: '#8e2de2',
                        }}
                      />
                    </Typography>
                    
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <TrendingUp sx={{ mr: 0.5, fontSize: 18 }} />
                      {calculateXPPercentage().toFixed(1)}% progress to Level {userLevel + 1}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4} sx={{ mt: { xs: 2, md: 0 }, display: 'flex', justifyContent: { md: 'flex-end' } }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="contained" 
                      color="secondary"
                      size="large"
                      sx={{ 
                        borderRadius: 4,
                        px: 3,
                        py: 1.5,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        color: '#8e2de2',
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: '#ffffff',
                        },
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                      }}
                      endIcon={<ArrowForward />}
                      onClick={handleViewRewards}
                    >
                      View Rewards
                    </Button>
                  </motion.div>
                </Grid>
              </Grid>
              
              {/* Animated particles */}
              <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', opacity: 0.4 }}>
                {generateParticles(['#ffffff', '#f5f5f5', '#f0f0f0'], 25).map(particle => (
                  <motion.div
                    key={particle.id}
                    style={{
                      position: 'absolute',
                      width: particle.size,
                      height: particle.size,
                      borderRadius: '50%',
                      backgroundColor: particle.color,
                      top: `${particle.y}%`,
                      left: `${particle.x}%`,
                      opacity: 0.6
                    }}
                    animate={{
                      y: [0, -30],
                      opacity: [0.6, 0],
                      scale: [1, 0.5]
                    }}
                    transition={{
                      duration: particle.duration,
                      repeat: Infinity,
                      ease: 'easeOut',
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </motion.div>

          {/* Tabs for different sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Box sx={{ mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab icon={<Stars />} label="Badges" />
                <Tab icon={<EmojiEvents />} label="Achievements" />
                <Tab icon={<FlagCircle />} label="Challenges" />
                <Tab icon={<Psychology />} label="Skills" />
                <Tab icon={<Timeline />} label="Activity" />
                <Tab icon={<Leaderboard />} label="Leaderboard" />
              </Tabs>
            </Box>
          </motion.div>

          {/* View Mode Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <IconButton
                color={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              >
                <ListIcon />
              </IconButton>
              <IconButton
                color={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              >
                <GridView />
              </IconButton>
            </Box>
          </motion.div>

          {/* Badges Tab */}
          {activeTab === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Grid container spacing={3}>
                {badges.length > 0 ? (
                  badges.map((badge, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={badge.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        whileHover={{ 
                          y: -10,
                          transition: { duration: 0.2 } 
                        }}
                      >
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            borderRadius: 3,
                            background: badge.unlocked 
                              ? `linear-gradient(135deg, ${badge.color}15 0%, ${badge.color}05 100%)` 
                              : 'linear-gradient(135deg, rgba(200,200,200,0.1) 0%, rgba(200,200,200,0.05) 100%)',
                            boxShadow: badge.unlocked 
                              ? '0 8px 16px rgba(0,0,0,0.1)' 
                              : '0 4px 12px rgba(0,0,0,0.05)',
                            position: 'relative',
                            overflow: 'hidden',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid',
                            borderColor: badge.unlocked ? `${badge.color}30` : 'rgba(200,200,200,0.2)'
                          }}
                          onClick={() => handleBadgeClick(badge)}
                        >
                          {/* Particle effects for unlocked badges */}
                          {badge.unlocked && (
                            <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', opacity: 0.4 }}>
                              {generateParticles([badge.color, '#FFD700', '#FFFFFF'], 15).map(particle => (
                                <motion.div
                                  key={particle.id}
                                  style={{
                                    position: 'absolute',
                                    width: particle.size,
                                    height: particle.size,
                                    borderRadius: '50%',
                                    backgroundColor: particle.color,
                                    top: `${particle.y}%`,
                                    left: `${particle.x}%`,
                                    opacity: 0.6
                                  }}
                                  animate={{
                                    y: [0, -30],
                                    opacity: [0.6, 0],
                                    scale: [1, 0.5]
                                  }}
                                  transition={{
                                    duration: particle.duration,
                                    repeat: Infinity,
                                    ease: 'easeOut',
                                    delay: Math.random() * 2
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          
                          {!badge.unlocked && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                zIndex: 2,
                                bgcolor: 'rgba(0,0,0,0.1)',
                                borderRadius: '50%',
                                p: 1,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                            >
                              <Lock fontSize="small" color="action" />
                            </Box>
                          )}
                          
                          {badge.unlocked && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                zIndex: 2,
                                bgcolor: badge.color,
                                color: '#fff',
                                borderRadius: '50%',
                                p: 0.5,
                                boxShadow: `0 2px 8px ${badge.color}60`
                              }}
                            >
                              <CheckCircle fontSize="small" />
                            </Box>
                          )}
                          
                          <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4, pb: 3, px: 3, zIndex: 1 }}>
                            <motion.div
                              whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.05 }}
                              transition={{ duration: 0.5 }}
                            >
                              <Avatar
                                sx={{
                                  width: 70,
                                  height: 70,
                                  margin: '0 auto 20px',
                                  bgcolor: badge.unlocked ? badge.color : 'rgba(200,200,200,0.5)',
                                  boxShadow: badge.unlocked 
                                    ? `0 4px 14px ${badge.color}70` 
                                    : '0 4px 10px rgba(0,0,0,0.1)',
                                  border: badge.unlocked ? '3px solid white' : '3px solid rgba(255,255,255,0.5)'
                                }}
                              >
                                {getBadgeIcon(badge.category)}
                              </Avatar>
                            </motion.div>
                            
                            <Typography 
                              variant="h6" 
                              gutterBottom 
                              sx={{ 
                                fontWeight: 600, 
                                color: badge.unlocked ? 'text.primary' : 'text.secondary' 
                              }}
                            >
                              {badge.name}
                            </Typography>
                            
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                height: 60, 
                                overflow: 'hidden', 
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {badge.description}
                            </Typography>
                          </CardContent>
                          
                          <CardActions sx={{ justifyContent: 'center', p: 2, pb: 3 }}>
                            <Chip
                              icon={badge.unlocked ? <CheckCircle fontSize="small" /> : <Lock fontSize="small" />}
                              label={badge.unlocked ? 'Unlocked' : 'Locked'}
                              size="medium"
                              color={badge.unlocked ? 'success' : 'default'}
                              variant={badge.unlocked ? 'filled' : 'outlined'}
                              sx={{ 
                                px: 1,
                                fontWeight: 500,
                                borderRadius: 5,
                                boxShadow: badge.unlocked ? '0 2px 8px rgba(76, 175, 80, 0.3)' : 'none'
                              }}
                            />
                          </CardActions>
                          
                          {badge.unlocked && (
                            <Box 
                              sx={{ 
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                bgcolor: badge.color,
                                boxShadow: `0 -2px 10px ${badge.color}60`
                              }} 
                            />
                          )}
                        </Card>
                      </motion.div>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Paper
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,255,0.9) 100%)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Box
                        component="img"
                        src="https://cdn-icons-png.flaticon.com/512/9477/9477900.png"
                        alt="No badges"
                        sx={{ width: 120, height: 120, opacity: 0.7, mb: 2 }}
                      />
                      <Typography variant="h5" color="text.primary" gutterBottom fontWeight={500}>
                        No badges yet
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                        Complete various tasks and challenges to earn badges and showcase your achievements.
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<FlagCircle />}
                        onClick={() => setActiveTab(2)}
                        sx={{ boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)' }}
                      >
                        View Challenges
                      </Button>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </motion.div>
          )}

          {/* Achievements Tab */}
          {activeTab === 1 && (
            <Grid container spacing={2}>
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Avatar
                            sx={{
                              bgcolor: achievement.achieved ? 'success.main' : 'grey.400',
                              mr: 2
                            }}
                          >
                            {achievement.achieved ? <CheckCircle /> : <MoreHoriz />}
                          </Avatar>
                          <Typography variant="h6">{achievement.name}</Typography>
                        </Box>
                        <Typography variant="body2" paragraph>
                          {achievement.description}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Chip
                            icon={<EmojiEvents fontSize="small" />}
                            label={`${achievement.points} XP`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {achievement.achieved
                              ? `Achieved on ${new Date(
                                  achievement.dateAchieved
                                ).toLocaleDateString()}`
                              : 'Not achieved yet'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No achievements available yet. Keep using the platform to earn achievements!
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}

          {/* Challenges Tab */}
          {activeTab === 2 && (
            <Grid container spacing={2}>
              {challenges.length > 0 ? (
                challenges.map((challenge) => (
                  <Grid item xs={12} md={6} key={challenge.id}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                      onClick={() => handleChallengeClick(challenge)}
                    >
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="h6" gutterBottom>
                            {challenge.name}
                          </Typography>
                          <Chip
                            label={challenge.difficulty}
                            size="small"
                            color={
                              challenge.difficulty === 'easy'
                                ? 'success'
                                : challenge.difficulty === 'medium'
                                ? 'warning'
                                : 'error'
                            }
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {challenge.description}
                        </Typography>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Progress: {challenge.progress}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={challenge.progress}
                            sx={{ 
                              height: 8, 
                              borderRadius: 5,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: challenge.status === 'completed' ? 'success.main' : 'primary.main'
                              }
                            }}
                          />
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Chip
                            icon={<Stars fontSize="small" />}
                            label={`${challenge.xpReward} XP`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Deadline: {new Date(challenge.deadline).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                        {challenge.status === 'completed' ? (
                          <Button 
                            variant="outlined" 
                            startIcon={<CheckCircle />}
                            color="success"
                            disabled
                          >
                            Completed
                          </Button>
                        ) : challenge.accepted ? (
                          <Button variant="contained" onClick={() => setChallengeDialogOpen(true)}>
                            Continue Challenge
                          </Button>
                        ) : (
                          <Button 
                            variant="contained" 
                            color="primary"
                            startIcon={<PlayArrow />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptChallenge(challenge.id);
                            }}
                          >
                            Accept Challenge
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No challenges available right now. Check back soon!
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}

          {/* Skills Visualization Tab */}
          {activeTab === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      height: '100%', 
                      borderRadius: 2, 
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      background: 'linear-gradient(to right bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.8))',
                      backdropFilter: 'blur(10px)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        width: '150px', 
                        height: '150px', 
                        background: 'radial-gradient(circle, rgba(63,94,251,0.1) 0%, rgba(70,252,171,0.05) 100%)', 
                        borderRadius: '50%',
                        top: '-50px',
                        right: '-50px',
                        zIndex: 0
                      }} 
                    />
                    
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center',
                        zIndex: 1,
                        position: 'relative'
                      }}
                    >
                      <BarChart sx={{ mr: 1, color: 'primary.main' }} />
                      Skills Radar Analysis
                    </Typography>
                    
                    <Box sx={{ height: 400, zIndex: 1, position: 'relative' }}>
                      {Object.keys(skillStats).length > 0 ? (
                        <SkillsRadarChart 
                          data={Object.entries(skillStats).map(([name, value]) => ({ name, value }))} 
                          title=""
                          maxValue={100}
                          showLegend={true}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3
                          }}
                        >
                          <Psychology sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.4, mb: 2 }} />
                          <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
                            No skill data available yet
                          </Typography>
                          <Typography color="text.secondary" variant="body2" textAlign="center">
                            Complete skill assessments to visualize your strengths and areas for improvement
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      borderRadius: 2, 
                      height: '100%',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      background: 'linear-gradient(to right bottom, rgba(255,255,255,0.9), rgba(255,255,255,0.8))',
                      backdropFilter: 'blur(10px)',
                      position: 'relative'
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        width: '100px', 
                        height: '100px', 
                        background: 'radial-gradient(circle, rgba(252,70,107,0.1) 0%, rgba(63,94,251,0.05) 100%)', 
                        borderRadius: '50%',
                        bottom: '-20px',
                        left: '-20px',
                        zIndex: 0
                      }} 
                    />
                    
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        zIndex: 1,
                        position: 'relative'
                      }}
                    >
                      <Psychology sx={{ mr: 1, color: 'secondary.main' }} />
                      Top Skills
                    </Typography>
                    
                    <List sx={{ zIndex: 1, position: 'relative' }}>
                      {Object.entries(skillStats)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([skill, level], index) => (
                          <motion.div
                            key={skill}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{
                              scale: 1.02,
                              transition: { duration: 0.2 }
                            }}
                          >
                            <ListItem 
                              disableGutters
                              sx={{ 
                                mb: 1.5, 
                                background: index === 0 
                                  ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.1), rgba(46, 125, 50, 0.05))' 
                                  : 'linear-gradient(135deg, rgba(25, 118, 210, 0.05), rgba(25, 118, 210, 0.02))',
                                borderRadius: 2,
                                p: 1,
                                transition: 'all 0.2s ease',
                                overflow: 'hidden',
                                position: 'relative',
                                '&:hover': {
                                  background: index === 0 
                                    ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.15), rgba(46, 125, 50, 0.07))' 
                                    : 'linear-gradient(135deg, rgba(25, 118, 210, 0.1), rgba(25, 118, 210, 0.04))',
                                }
                              }}
                            >
                              {/* Skill icon */}
                              <ListItemIcon>
                                {SKILL_ICONS[skill] ? (
                                  <Box
                                    component="img"
                                    src={SKILL_ICONS[skill]}
                                    alt={skill}
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: '50%',
                                      p: 0.5,
                                      bgcolor: 'background.paper',
                                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                      objectFit: 'contain'
                                    }}
                                  />
                                ) : (
                                  <Avatar
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      fontSize: '0.9rem',
                                      fontWeight: 'bold',
                                      bgcolor: index === 0 ? 'success.main' : index === 1 ? 'primary.main' : 'secondary.light',
                                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                                    }}
                                  >
                                    {index + 1}
                                  </Avatar>
                                )}
                              </ListItemIcon>
                              
                              <ListItemText 
                                primary={
                                  <Typography variant="body1" fontWeight={500}>
                                    {skill}
                                  </Typography>
                                } 
                                secondary={
                                  <Box sx={{ mt: 0.5 }}>
                                    <Rating 
                                      value={level / 20} 
                                      readOnly 
                                      precision={0.5} 
                                      size="small" 
                                    />
                                  </Box>
                                } 
                              />
                              
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  minWidth: '44px',
                                  height: '44px',
                                  borderRadius: '50%',
                                  background: level > 80 
                                    ? 'linear-gradient(135deg, #4caf50, #2e7d32)' 
                                    : level > 60 
                                      ? 'linear-gradient(135deg, #2196f3, #1565c0)' 
                                      : 'linear-gradient(135deg, #ff9800, #ed6c02)',
                                  color: '#fff',
                                  fontWeight: 'bold',
                                  fontSize: '0.9rem',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                              >
                                {level}%
                              </Box>
                              
                              {/* Animated sparkles for top skill */}
                              {index === 0 && (
                                <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', opacity: 0.5, pointerEvents: 'none' }}>
                                  {generateParticles(['#4caf50', '#66bb6a', '#ffffff'], 8).map(particle => (
                                    <motion.div
                                      key={particle.id}
                                      style={{
                                        position: 'absolute',
                                        width: particle.size,
                                        height: particle.size,
                                        borderRadius: '50%',
                                        backgroundColor: particle.color,
                                        top: `${particle.y}%`,
                                        left: `${particle.x}%`,
                                        opacity: 0.6
                                      }}
                                      animate={{
                                        y: [0, -10],
                                        opacity: [0.6, 0],
                                        scale: [1, 0.5]
                                      }}
                                      transition={{
                                        duration: particle.duration,
                                        repeat: Infinity,
                                        ease: 'easeOut',
                                        delay: Math.random() * 2
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </ListItem>
                          </motion.div>
                        ))}
                      {Object.keys(skillStats).length === 0 && (
                        <Box 
                          sx={{ 
                            mt: 4, 
                            textAlign: 'center',
                            p: 2
                          }}
                        >
                          <School sx={{ fontSize: 50, color: 'text.secondary', opacity: 0.4, mb: 2 }} />
                          <Typography color="text.secondary" sx={{ mb: 1 }}>
                            Complete skill assessments to see your top skills here
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color="primary" 
                            startIcon={<PlayArrow />}
                            sx={{ mt: 2 }}
                          >
                            Take Assessment
                          </Button>
                        </Box>
                      )}
                    </List>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* Activity History Tab */}
          {activeTab === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  background: isDarkMode
                    ? 'linear-gradient(to right bottom, rgba(40,44,52,0.95), rgba(33,37,43,0.9))'
                    : 'linear-gradient(to right bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
                  backdropFilter: 'blur(10px)',
                  boxShadow: isDarkMode
                    ? '0 4px 20px rgba(0,0,0,0.2)'
                    : '0 4px 20px rgba(0,0,0,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                  color: isDarkMode ? 'white' : 'inherit'
                }}
              >
                <EnhancedBackground density={4} color="secondary">
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    <Timeline sx={{ mr: 1, color: 'primary.main' }} />
                    Activity Timeline
                  </Typography>
                  
                  <List sx={{ position: 'relative', zIndex: 1 }}>
                    {activityHistory.length > 0 ? (
                      activityHistory.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Box
                            sx={{ 
                              p: 2,
                              display: 'flex',
                              alignItems: 'center',
                              borderBottom: '1px solid rgba(0,0,0,0.05)',
                              background: activity.type === 'achievement' ? 'linear-gradient(to right, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.05))' : 'transparent',
                              transition: 'all 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(0,0,0,0.02)'
                              }
                            }}
                          >
                            {/* Timeline connection */}
                            {index < activityHistory.length - 1 && (
                              <Box 
                                sx={{ 
                                  position: 'absolute', 
                                  left: 28,
                                  top: 60,
                                  bottom: 0,
                                  width: 2,
                                  bgcolor: 'divider',
                                  zIndex: 0
                                }} 
                              />
                            )}
                            
                            <ListItemIcon>
                              <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: 
                                      activity.type === 'achievement' ? 'success.main' :
                                      activity.type === 'job_application' ? 'primary.main' :
                                      activity.type === 'interview' ? 'warning.main' :
                                      activity.type === 'skill_assessment' ? 'secondary.main' :
                                      'info.main',
                                    boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
                                    p: 1.5,
                                    width: 56,
                                    height: 56
                                  }}
                                >
                                  {activity.type === 'achievement' && <EmojiEvents />}
                                  {activity.type === 'job_application' && <Work />}
                                  {activity.type === 'skill_assessment' && <Psychology />}
                                  {activity.type === 'interview' && <QuestionAnswer />}
                                  {activity.type === 'learning' && <School />}
                                </Avatar>
                              </motion.div>
                            </ListItemIcon>
                            
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight={500} sx={{ mb: 0.5 }}>
                                  {activity.description}
                                </Typography>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box
                                    sx={{
                                      fontSize: '0.75rem',
                                      color: 'text.secondary',
                                      display: 'flex',
                                      alignItems: 'center',
                                      mr: 2
                                    }}
                                  >
                                    <AccessTime sx={{ fontSize: 14, mr: 0.5, opacity: 0.7 }} />
                                    {new Date(activity.timestamp).toLocaleString()}
                                  </Box>
                                  
                                  <Chip
                                    size="small"
                                    label={activity.type.replace('_', ' ')}
                                    sx={{ 
                                      textTransform: 'capitalize',
                                      bgcolor: 
                                        activity.type === 'achievement' ? 'success.50' :
                                        activity.type === 'job_application' ? 'primary.50' :
                                        activity.type === 'interview' ? 'warning.50' :
                                        activity.type === 'skill_assessment' ? 'secondary.50' :
                                        'info.50',
                                      color: 
                                        activity.type === 'achievement' ? 'success.main' :
                                        activity.type === 'job_application' ? 'primary.main' :
                                        activity.type === 'interview' ? 'warning.main' :
                                        activity.type === 'skill_assessment' ? 'secondary.main' :
                                        'info.main',
                                      borderColor: 
                                        activity.type === 'achievement' ? 'success.100' :
                                        activity.type === 'job_application' ? 'primary.100' :
                                        activity.type === 'interview' ? 'warning.100' :
                                        activity.type === 'skill_assessment' ? 'secondary.100' :
                                        'info.100',
                                      border: '1px solid'
                                    }}
                                  />
                                </Box>
                              }
                            />
                            
                            <motion.div
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                            >
                              <Chip
                                icon={<Stars fontSize="small" />}
                                label={`+${activity.xpEarned} XP`}
                                size="medium"
                                color="primary"
                                sx={{ 
                                  fontWeight: 'bold',
                                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
                                  background: 'linear-gradient(135deg, #2196f3, #1565c0)',
                                  color: 'white',
                                  '.MuiChip-icon': { color: 'white !important' }
                                }}
                              />
                            </motion.div>
                          </Box>
                        </motion.div>
                      ))
                    ) : (
                      <Box 
                        sx={{ 
                          textAlign: 'center', 
                          py: 8,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <Box
                          component="img"
                          src="https://cdn-icons-png.flaticon.com/512/6598/6598519.png"
                          alt="No activity"
                          sx={{ 
                            width: 150, 
                            height: 150, 
                            opacity: 0.7, 
                            mb: 2,
                            filter: 'grayscale(0.3)'
                          }}
                        />
                        <Typography color="text.secondary" variant="h6" sx={{ mb: 1 }}>
                          No activity recorded yet
                        </Typography>
                        <Typography color="text.secondary" variant="body2" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                          Stay active on the platform by applying to jobs, completing skill assessments, and participating in interviews to see your progress.
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="primary"
                          startIcon={<School />}
                          sx={{ boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)' }}
                        >
                          Start Learning
                        </Button>
                      </Box>
                    )}
                  </List>
                  
                  {activityHistory.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Button 
                        variant="outlined" 
                        endIcon={<ArrowForward />}
                        sx={{ 
                          borderRadius: 8,
                          px: 3
                        }}
                      >
                        View Full History
                      </Button>
                    </Box>
                  )}
                </EnhancedBackground>
              </Paper>
            </motion.div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  position: 'relative',
                  overflow: 'hidden',
                  color: '#000000'
                }}
              >
                <GameParticlesBackground />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  {/* Header with Daily/Monthly toggle moved to right */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#000000' }}>
                      Leaderboard Champions
                    </Typography>
                    
                    <Paper
                      sx={{
                        display: 'flex',
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: 'rgba(255,255,255,0.4)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}
                    >
                      <Button
                        variant="contained"
                        sx={{
                          py: 1,
                          px: 3,
                          bgcolor: '#E91E63',
                          color: 'white',
                          borderRadius: 10,
                          fontWeight: 'bold',
                          '&:hover': {
                            bgcolor: '#D81B60',
                          }
                        }}
                      >
                        Daily
                      </Button>
                      <Button
                        sx={{
                          py: 1,
                          px: 3,
                          color: '#000000',
                          fontWeight: 'bold',
                          borderRadius: 10,
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.05)',
                          }
                        }}
                      >
                        Monthly
                      </Button>
                    </Paper>
                  </Box>

                  {/* 3D Podium for Top 3 */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, type: "spring" }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        height: 280,
                        mb: 5,
                        mt: 3
                      }}
                    >
                      {/* Radial background effect */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -70%)',
                          width: '100%',
                          height: '100%',
                          background: 'radial-gradient(circle, rgba(180, 190, 210, 0.4) 0%, rgba(240, 245, 250, 0) 70%)',
                          zIndex: 0
                        }}
                      />

                      {/* Light rays effect */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          opacity: 0.15,
                          background: 'url(https://www.transparenttextures.com/patterns/light-ray.png)',
                          backgroundSize: 'cover',
                          zIndex: 0
                        }}
                      />
                    
                    {/* Second Place */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 1,
                        mb: 2
                      }}
                    >
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        <Box
                          component="img"
                          src={CROWN_IMAGES.silver}
                          alt="Silver Crown"
                          sx={{
                            width: 40,
                            height: 40,
                            position: 'absolute',
                            top: -30,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                          }}
                        />
                        <Avatar
                          src={leaderboard[1]?.avatar}
                          sx={{
                            width: 80,
                            height: 80,
                            border: '4px solid #C0C0C0',
                            bgcolor: '#1976d2',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                          }}
                        >
                          {leaderboard[1]?.name.charAt(0)}
                        </Avatar>
                      </Box>
                      
                      <Typography variant="body1" sx={{ color: '#000000', fontWeight: 'bold', mb: 0.5 }}>
                        @{leaderboard[1]?.name.split(' ')[0].toLowerCase()}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          component="img"
                          src="https://cdn-icons-png.flaticon.com/512/1490/1490817.png"
                          alt="points"
                          sx={{ width: 20, height: 20, mr: 1 }}
                        />
                        <Typography sx={{ color: '#000000', fontWeight: 'bold' }}>
                          {leaderboard[1]?.points.toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <Box
                        sx={{
                          width: 120,
                          height: 100,
                          bgcolor: '#C0C0C0',
                          borderRadius: '10px 10px 0 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          position: 'relative',
                          '&::after': {
                            content: '"2nd"',
                            position: 'absolute',
                            bottom: 10,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.2rem'
                          }
                        }}
                      />
                    </Box>
                    
                    {/* First Place - Taller */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 3,
                        mx: 4,
                        mb: 2
                      }}
                    >
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        <Box
                          component="img"
                          src={CROWN_IMAGES.gold}
                          alt="Gold Crown"
                          sx={{
                            width: 50,
                            height: 50,
                            position: 'absolute',
                            top: -35,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            filter: 'drop-shadow(0 2px 6px rgba(255,215,0,0.3))'
                          }}
                        />
                        <Avatar
                          src={leaderboard[0]?.avatar}
                          sx={{
                            width: 100,
                            height: 100,
                            border: '4px solid #FFD700',
                            bgcolor: '#4caf50',
                            boxShadow: '0 4px 20px rgba(255,215,0,0.3)'
                          }}
                        >
                          {leaderboard[0]?.name.charAt(0)}
                        </Avatar>
                      </Box>
                      
                      <Typography variant="body1" sx={{ color: '#000000', fontWeight: 'bold', mb: 0.5 }}>
                        @{leaderboard[0]?.name.split(' ')[0].toLowerCase()}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          component="img"
                          src="https://cdn-icons-png.flaticon.com/512/1490/1490817.png"
                          alt="points"
                          sx={{ width: 24, height: 24, mr: 1 }}
                        />
                        <Typography sx={{ color: '#000000', fontWeight: 'bold', fontSize: '1.2rem' }}>
                          {leaderboard[0]?.points.toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <Box
                        sx={{
                          width: 140,
                          height: 130,
                          bgcolor: '#FFD700',
                          borderRadius: '10px 10px 0 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 20px rgba(255,215,0,0.3)',
                          position: 'relative',
                          '&::after': {
                            content: '"1st"',
                            position: 'absolute',
                            bottom: 10,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.4rem'
                          }
                        }}
                      />
                    </Box>
                    
                    {/* Third Place */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 1,
                        mb: 2
                      }}
                    >
                      <Box sx={{ position: 'relative', mb: 2 }}>
                        <Box
                          component="img"
                          src={CROWN_IMAGES.bronze}
                          alt="Bronze Crown"
                          sx={{
                            width: 35,
                            height: 35,
                            position: 'absolute',
                            top: -25,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                          }}
                        />
                        <Avatar
                          src={leaderboard[2]?.avatar}
                          sx={{
                            width: 70,
                            height: 70,
                            border: '4px solid #CD7F32',
                            bgcolor: '#1976d2',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                          }}
                        >
                          {leaderboard[2]?.name.charAt(0)}
                        </Avatar>
                      </Box>
                      
                      <Typography variant="body1" sx={{ color: '#000000', fontWeight: 'bold', mb: 0.5 }}>
                        @{leaderboard[2]?.name.split(' ')[0].toLowerCase()}
                        {leaderboard[2]?.isCurrentUser && ' (You)'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box
                          component="img"
                          src="https://cdn-icons-png.flaticon.com/512/1490/1490817.png"
                          alt="points"
                          sx={{ width: 20, height: 20, mr: 1 }}
                        />
                        <Typography sx={{ color: '#000000', fontWeight: 'bold' }}>
                          {leaderboard[2]?.points.toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <Box
                        sx={{
                          width: 100,
                          height: 80,
                          bgcolor: '#CD7F32',
                          borderRadius: '10px 10px 0 0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          position: 'relative',
                          '&::after': {
                            content: '"3rd"',
                            position: 'absolute',
                            bottom: 10,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                          }
                        }}
                      />
                    </Box>
                   </Box>
        </motion.div>

                  {/* Leaderboard Table - Updated with black text */}
                  <Box sx={{ mt: 4 }}>
                    <Grid container sx={{ mb: 2, px: 2 }} spacing={2}>
                      <Grid item xs={1.5}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000000' }}>PLACE</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000000' }}>USER</Typography>
                      </Grid>
                      <Grid item xs={2.5}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000000' }}>TOTAL POINTS</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000000' }}>LAST ACTIVITY</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000000', textAlign: 'right' }}>REWARD</Typography>
                      </Grid>
                    </Grid>

                    {/* Leaderboard entries with updated text colors */}
                    {leaderboard.map((user, index) => (
                      <Box
                        key={user.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1,
                          p: 2,
                          borderRadius: 1,
                          bgcolor: user.isCurrentUser ? alpha('#4caf50', 0.1) : 'transparent',
                          '&:hover': {
                            bgcolor: alpha('#000000', 0.04)
                          }
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={1.5}>
                            <Typography variant="body1" sx={{ color: '#000000', fontWeight: 'bold' }}>
                              #{index + 1}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={user.avatar}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  mr: 1,
                                  bgcolor: user.isCurrentUser ? '#4caf50' : '#1976d2'
                                }}
                              >
                                {user.name.charAt(0)}
                              </Avatar>
                              <Typography variant="body1" sx={{ color: '#000000', fontWeight: 'bold' }}>
                                {user.name}
                                {user.isCurrentUser && ' (You)'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={2.5}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box
                                component="img"
                                src="https://cdn-icons-png.flaticon.com/512/1490/1490817.png"
                                alt="coin"
                                sx={{ width: 20, height: 20, mr: 1 }}
                              />
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  color: '#000000',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                {user.points.toLocaleString()}
                                {user.trend === 'up' && (
                                  <TrendingUp sx={{ color: 'success.main', fontSize: 18, ml: 1 }} />
                                )}
                                {user.trend === 'down' && (
                                  <TrendingUp sx={{ color: 'error.main', fontSize: 18, ml: 1, transform: 'rotate(180deg)' }} />
                                )}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2" sx={{ color: '#000000' }}>
                              {index % 2 === 0 ? '1d ago' : '2d ago'}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                              <Chip
                                label={`Level ${user.level || 1}`}
                                size="small"
                                sx={{
                                  bgcolor: user.isCurrentUser ? '#4caf50' : '#1976d2',
                                  color: '#ffffff',
                                  fontWeight: 'bold'
                                }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          )}
        </motion.div>
      )}
      
      {/* Badge Detail Dialog */}
      <Dialog
        open={badgeDialogOpen}
        onClose={() => setBadgeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }
        }}
        TransitionComponent={motion.div}
        TransitionProps={{
          initial: { opacity: 0, y: 50, scale: 0.9 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
          transition: { duration: 0.3 }
        }}
      >
        {selectedBadge && (
          <AnimatePresence>
            <motion.div
              key="badge-dialog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
            <Box 
              sx={{ 
                bgcolor: selectedBadge.unlocked ? selectedBadge.color : 'grey.500',
                py: 4,
                textAlign: 'center',
                color: '#fff'
              }}
            >
              <Avatar
                sx={{ 
                  width: 80,
                  height: 80,
                  margin: '0 auto',
                  bgcolor: '#fff',
                  color: selectedBadge.unlocked ? selectedBadge.color : 'grey.500',
                  mb: 1,
                  border: '4px solid',
                  borderColor: 'rgba(255,255,255,0.5)'
                }}
              >
                {getBadgeIcon(selectedBadge.category)}
              </Avatar>
              
              <Typography variant="h6" sx={{ mt: 1 }}>
                {selectedBadge.name}
              </Typography>
              
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedBadge.unlocked ? 'Unlocked' : 'Locked'}
              </Typography>
            </Box>
            
            <DialogContent>
              <Typography paragraph>
                {selectedBadge.description}
              </Typography>
              
              {selectedBadge.criteria && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    How to earn:
                  </Typography>
                  
                  <List dense>
                    {selectedBadge.criteria.map((criterion, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {selectedBadge.unlocked ? (
                            <CheckCircle color="success" fontSize="small" />
                          ) : (
                            <ArrowForward fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText primary={criterion} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              
              {selectedBadge.unlocked && selectedBadge.dateAchieved && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Achieved on: {new Date(selectedBadge.dateAchieved).toLocaleDateString()}
                </Typography>
              )}
            </DialogContent>
            
            <DialogActions>
              {selectedBadge.unlocked && (
                <Button 
                  startIcon={<Share />}
                  onClick={() => {
                    // Share functionality
                    alert('Sharing badge...');
                  }}
                >
                  Share
                </Button>
              )}
                <Button onClick={() => setBadgeDialogOpen(false)}>Close</Button>
            </DialogActions>
              
              {/* Add animated particles to unlocked badges */}
              {selectedBadge.unlocked && (
                <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', opacity: 0.3 }}>
                  {generateParticles([selectedBadge.color, '#FFD700', '#FFFFFF'], 30).map(particle => (
                    <motion.div
                      key={particle.id}
                      style={{
                        position: 'absolute',
                        width: particle.size,
                        height: particle.size,
                        borderRadius: '50%',
                        backgroundColor: particle.color,
                        top: `${particle.y}%`,
                        left: `${particle.x}%`,
                        opacity: 0.6
                      }}
                      animate={{
                        y: [0, -50],
                        opacity: [0.6, 0],
                        scale: [1, 0.5]
                      }}
                      transition={{
                        duration: particle.duration * 1.5,
                        repeat: Infinity,
                        ease: 'easeOut',
                        delay: Math.random() * 2
                      }}
                    />
                  ))}
                </Box>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </Dialog>
      
      {/* Challenge Dialog */}
      <Dialog
        open={challengeDialogOpen}
        onClose={() => setChallengeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        {selectedChallenge && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              {selectedChallenge.name}
              <Chip
                label={selectedChallenge.difficulty}
                size="small"
                color={
                  selectedChallenge.difficulty === 'easy'
                    ? 'success'
                    : selectedChallenge.difficulty === 'medium'
                    ? 'warning'
                    : 'error'
                }
                sx={{ ml: 1 }}
              />
            </DialogTitle>
            <DialogContent>
              <Typography paragraph>{selectedChallenge.description}</Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Progress: {selectedChallenge.progress}%
              </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={selectedChallenge.progress}
                  sx={{ height: 8, borderRadius: 5 }}
                />
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="overline" display="block" color="text.secondary">
                      Reward
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {selectedChallenge.xpReward} XP
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="overline" display="block" color="text.secondary">
                      Deadline
                    </Typography>
                    <Typography variant="h6">
                      {new Date(selectedChallenge.deadline).toLocaleDateString()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              {selectedChallenge.steps && (
                <>
                <Typography variant="subtitle2" gutterBottom>
                  Steps to complete:
                </Typography>
                  <List dense>
                    {selectedChallenge.steps.map((step, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                          {step.completed ? (
                            <CheckCircle color="success" fontSize="small" />
                          ) : (
                            <CircleOutlined fontSize="small" />
                          )}
                    </ListItemIcon>
                        <ListItemText 
                          primary={step.description} 
                          secondary={step.hint} 
                        />
                  </ListItem>
                ))}
              </List>
                </>
              )}
            </DialogContent>
            <DialogActions>
              {selectedChallenge.status === 'completed' ? (
                <Button 
                  variant="outlined" 
                  startIcon={<CheckCircle />}
                  color="success"
                  disabled
                >
                  Completed
                </Button>
              ) : selectedChallenge.accepted ? (
                <Button variant="contained" onClick={() => setChallengeDialogOpen(false)}>
                  Continue Challenge
                </Button>
              ) : (
                <Button 
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrow />}
                  onClick={() => handleAcceptChallenge(selectedChallenge.id)}
                >
                  Accept Challenge
                </Button>
              )}
              <Button onClick={() => setChallengeDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default GamifiedProgress;