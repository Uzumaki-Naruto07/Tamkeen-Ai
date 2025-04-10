import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Card,
  CardContent,
  Typography,
  Box, 
  Grid,
  Paper, 
  Divider,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Tooltip,
  Alert,
  IconButton,
  Stack,
  Link,
  CircularProgress,
  Collapse
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip,
  Legend, 
  ResponsiveContainer,
  Cell,
  LabelList,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import CodeIcon from '@mui/icons-material/Code';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import StorageIcon from '@mui/icons-material/Storage';
import TerminalIcon from '@mui/icons-material/Terminal';
import CloudIcon from '@mui/icons-material/Cloud';
import SecurityIcon from '@mui/icons-material/Security';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PsychologyIcon from '@mui/icons-material/Psychology';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SchoolIcon from '@mui/icons-material/School';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import StarsIcon from '@mui/icons-material/Stars';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import DashboardAPI from '../../api/DashboardAPI';
import chatService from '../../api/chatgpt';
import { styled } from '@mui/material/styles';

// Category icon mapping
const categoryIcons = {
  'Frontend': <CodeIcon />,
  'Backend': <TerminalIcon />,
  'Database': <StorageIcon />,
  'DevOps': <CloudIcon />,
  'Design': <DesignServicesIcon />,
  'Security': <SecurityIcon />,
  'Analytics': <AnalyticsIcon />,
  'Machine Learning': <PsychologyIcon />,
  'Mobile': <DeveloperBoardIcon />,
  'Soft Skills': <BusinessCenterIcon />
};

// Resource type icon mapping
const resourceTypeIcons = {
  'course': <SchoolIcon />,
  'video': <PlayCircleOutlineIcon />,
  'book': <MenuBookIcon />,
  'practice': <AssignmentTurnedInIcon />
};

// Professional color palette
const colorPalette = {
  primary: '#3366cc',       // Professional blue
  secondary: '#4ecdc4',     // Teal accent
  success: '#2ecc71',       // Green
  warning: '#f39c12',       // Orange
  error: '#e74c3c',         // Red
  lightGrey: '#f5f5f5',     // Light grey background
  darkGrey: '#555555',      // Dark grey text
  chartFill: 'rgba(51, 102, 204, 0.2)',  // Transparent blue for chart
  chartStroke: '#3366cc',   // Blue for chart outline
};

const ScrollableContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  maxHeight: '780px',
  overflowY: 'auto',
  scrollBehavior: 'smooth',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(51, 102, 204, 0.3)',
    borderRadius: '10px',
    '&:hover': {
      backgroundColor: 'rgba(51, 102, 204, 0.5)',
    },
  },
  padding: '2px',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    maxHeight: '70vh',
    '&::-webkit-scrollbar': {
      width: '4px',
    },
  },
}));

const ScrollIndicator = styled(Box)(({ theme, isVisible }) => ({
  position: 'absolute',
  bottom: 10,
  left: '50%',
  transform: 'translateX(-50%)',
  display: isVisible ? 'flex' : 'none',
  flexDirection: 'column',
  alignItems: 'center',
  opacity: 0.7,
  transition: 'opacity 0.3s',
  zIndex: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '20px',
  padding: '4px 8px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  '&:hover': {
    opacity: 1,
  },
}));

const SkillTransitionChart = ({ skillData, targetRole, userId }) => {
  const { t } = useTranslation();
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [error, setError] = useState(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const scrollContainerRef = useRef(null);
  
  // Function to load assessment data from localStorage
  const loadAssessmentData = useCallback(() => {
    try {
      // Get user ID from props or default to a generic one
      const effectiveUserId = userId || (skillData && skillData.userId) || 'guest-user';
      
      // First try the user-specific assessment history
      let storedHistory = localStorage.getItem(`assessment_history_${effectiveUserId}`);
      
      // If that doesn't exist, try the general assessment history
      if (!storedHistory) {
        storedHistory = localStorage.getItem('skillAssessmentHistory');
      }
      
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        
        // Save to the common key format for future dashboard components
        if (storedHistory !== localStorage.getItem('skillAssessmentHistory')) {
          localStorage.setItem('skillAssessmentHistory', storedHistory);
        }
        
        setAssessmentHistory(parsedHistory);
        
        // Set latest assessment
        if (parsedHistory.length > 0) {
          setLatestAssessment(parsedHistory[0]);
          console.log('Latest assessment loaded:', parsedHistory[0]);
        }
      }
    } catch (error) {
      console.error('Error loading assessment data from localStorage:', error);
      setError('Failed to load assessment history.');
    }
  }, [skillData, userId]);
  
  // Load assessment data on component mount
  useEffect(() => {
    loadAssessmentData();
  }, [loadAssessmentData]);
  
  // Listen for assessment data changes
  useEffect(() => {
    const handleAssessmentDataChanged = () => {
      console.log('Assessment data changed event received');
      loadAssessmentData();
    };
    
    // Add event listener
    window.addEventListener('assessmentDataChanged', handleAssessmentDataChanged);
    
    // Cleanup
    return () => {
      window.removeEventListener('assessmentDataChanged', handleAssessmentDataChanged);
    };
  }, [loadAssessmentData]);
  
  // Add scroll detection effect
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      // Show scroll down indicator if not at bottom
      setShowScrollDown(scrollTop < scrollHeight - clientHeight - 20);
      // Show scroll up indicator if not at top
      setShowScrollUp(scrollTop > 20);
    };
    
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [latestAssessment]);
  
  // Add scroll helper functions
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };
  
  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  // Prepare data for radar chart showing strengths vs areas for improvement
  const radarChartData = useMemo(() => {
    if (!latestAssessment) return [];
    
    // Example data structure for radar chart
    const strengths = latestAssessment.strengths || [];
    const weaknesses = latestAssessment.weaknesses || [];
    
    // If both strengths and weaknesses are empty, provide default data based on category
    if (strengths.length === 0 && weaknesses.length === 0) {
      const categoryId = latestAssessment.skillCategory || 'tech-skills';
      
      // Category-specific default data
      const defaultData = {
        'tech-skills': [
          { subject: 'Technical Knowledge', A: 75, fullMark: 100 },
          { subject: 'Problem Solving', A: 68, fullMark: 100 },
          { subject: 'Coding Skills', A: 72, fullMark: 100 },
          { subject: 'Advanced Topics', A: 40, fullMark: 100 },
          { subject: 'Algorithm Design', A: 55, fullMark: 100 }
        ],
        'soft-skills': [
          { subject: 'Communication', A: 70, fullMark: 100 },
          { subject: 'Teamwork', A: 75, fullMark: 100 },
          { subject: 'Leadership', A: 60, fullMark: 100 },
          { subject: 'Conflict Resolution', A: 45, fullMark: 100 },
          { subject: 'Adaptability', A: 65, fullMark: 100 }
        ],
        'data-skills': [
          { subject: 'Data Analysis', A: 72, fullMark: 100 },
          { subject: 'Statistics', A: 65, fullMark: 100 },
          { subject: 'Visualization', A: 70, fullMark: 100 },
          { subject: 'Big Data', A: 40, fullMark: 100 },
          { subject: 'ML Concepts', A: 45, fullMark: 100 }
        ],
        'problem-solving': [
          { subject: 'Analytical Thinking', A: 75, fullMark: 100 },
          { subject: 'Logical Reasoning', A: 68, fullMark: 100 },
          { subject: 'Creative Solutions', A: 60, fullMark: 100 },
          { subject: 'Complex Problems', A: 40, fullMark: 100 },
          { subject: 'Optimization', A: 35, fullMark: 100 }
        ]
      };
      
      // Return category-specific data or default to tech skills
      return defaultData[categoryId] || defaultData['tech-skills'];
    }
    
    const data = [];
    
    // Add strengths with high scores
    strengths.forEach((strength, index) => {
      data.push({
        subject: strength,
        A: Math.min(90 + index * 2, 100), // High scores for strengths
        fullMark: 100
      });
    });
    
    // Add weaknesses with lower scores
    weaknesses.forEach((weakness, index) => {
      data.push({
        subject: weakness,
        A: Math.max(40 - index * 5, 20), // Lower scores for weaknesses
        fullMark: 100
      });
    });
    
    return data;
  }, [latestAssessment]);
  
  // Render the latest assessment result with radar chart
  const renderLatestAssessment = () => {
    if (!latestAssessment) return null;
    
    // Determine color based on score
    const scoreColor = 
      latestAssessment.score > 80 ? colorPalette.success :
      latestAssessment.score > 60 ? colorPalette.primary :
      latestAssessment.score > 40 ? colorPalette.warning : colorPalette.error;
    
    // Ensure we have a valid date or use current date
    let formattedDate = 'Recent';
    try {
      const timestamp = latestAssessment.timestamp || latestAssessment.completedAt || new Date().toISOString();
      formattedDate = new Date(timestamp).toLocaleDateString();
      // If date is invalid, use current date
      if (formattedDate === 'Invalid Date') {
        formattedDate = new Date().toLocaleDateString();
      }
    } catch (e) {
      console.error('Error formatting date:', e);
      formattedDate = new Date().toLocaleDateString();
    }
    
    // Default strengths and weaknesses if missing
    const displayStrengths = latestAssessment.strengths && latestAssessment.strengths.length > 0 
      ? latestAssessment.strengths 
      : ['Problem solving', 'Technical knowledge'];
      
    const displayWeaknesses = latestAssessment.weaknesses && latestAssessment.weaknesses.length > 0
      ? latestAssessment.weaknesses
      : ['Advanced concepts', 'Edge cases'];
    
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          mb: 2, 
          p: 3, 
          borderRadius: 2, 
          backgroundColor: '#ffffff',
          border: `1px solid ${colorPalette.lightGrey}`,
          height: 'auto',
          minHeight: '750px',
          overflow: 'visible'
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            color: colorPalette.primary, 
            fontWeight: 600, 
            fontSize: '1.2rem',
            mb: 1.5
          }}
        >
          {t('skillsProfile.latestAssessment', 'Latest Assessment')}: {latestAssessment.categoryName || t('skillsProfile.problemSolving', 'Problem Solving')}
        </Typography>
        
        <Grid container spacing={2}>
          {/* Score display */}
          <Grid item xs={12} sm={4} md={4}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              position: 'relative'
            }}>
              <Box
                sx={{
                  position: 'relative',
                  display: 'inline-flex',
                  mb: 2
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={latestAssessment.score}
                  size={120}
                  thickness={5}
                  sx={{
                    color: scoreColor,
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
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
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 'bold', color: scoreColor }}
                  >
                    {latestAssessment.score}%
                  </Typography>
                  <Typography variant="caption" component="div" color="text.secondary">
                    {t('skillsProfile.score', 'Score')}
                  </Typography>
                </Box>
              </Box>
            
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {formattedDate}
                </Typography>
                
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {latestAssessment.totalCorrect || latestAssessment.correctAnswers || 2} {t('skillsProfile.of', 'of')} {latestAssessment.totalQuestions || 3} {t('skillsProfile.correct', 'correct')}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Radar chart */}
          <Grid item xs={12} sm={8} md={8}>
            <Box sx={{ height: 380, width: '100%' }}>
              {radarChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={120} data={radarChartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: colorPalette.darkGrey, fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name={t('skillsProfile.skillLevel', 'Skill Level')}
                      dataKey="A"
                      stroke={colorPalette.primary}
                      fill={colorPalette.chartFill}
                      fillOpacity={0.6}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('skillsProfile.noChartData', 'Skill data visualization not available')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          {/* Strengths section */}
          <Grid item xs={12} md={6}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                mb: 1.5,
                color: colorPalette.success
              }}
            >
              {t('skillsProfile.strengths', 'Strengths')}
            </Typography>
            
            <List dense>
              {displayStrengths.map((strength, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon sx={{ color: colorPalette.success }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={strength} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      fontWeight: 'medium'
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          {/* Areas for improvement section */}
          <Grid item xs={12} md={6}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600, 
                mb: 1.5,
                color: colorPalette.warning
              }}
            >
              {t('skillsProfile.areasForImprovement', 'Areas for Improvement')}
            </Typography>
            
            <List dense>
              {displayWeaknesses.map((weakness, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PriorityHighIcon sx={{ color: colorPalette.warning }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={weakness} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      fontWeight: 'medium'
                    }} 
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  // Render the main content when no data is available
  if (error || (!latestAssessment && assessmentHistory.length === 0)) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <Typography variant="h6" gutterBottom textAlign="center">
          {error || t('skillsProfile.noAssessmentData', 'No assessment data available yet')}
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {t('skillsProfile.completeAssessment', 'Complete a skills assessment to see your results here')}
        </Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
          {error}
        </Alert>
      )}
      
      {/* Render only the latest assessment component */}
      <ScrollableContainer ref={scrollContainerRef}>
        {latestAssessment && renderLatestAssessment()}
        
        {/* Scroll down indicator */}
        {showScrollDown && (
          <ScrollIndicator 
            isVisible={true}
            onClick={scrollToBottom}
            sx={{ bottom: 10 }}
          >
            <Typography variant="caption" color="text.secondary">More</Typography>
            <KeyboardArrowDownIcon fontSize="small" color="primary" />
          </ScrollIndicator>
        )}
        
        {/* Scroll up indicator */}
        {showScrollUp && (
          <ScrollIndicator 
            isVisible={true}
            onClick={scrollToTop}
            sx={{ top: 10 }}
          >
            <KeyboardArrowUpIcon fontSize="small" color="primary" />
            <Typography variant="caption" color="text.secondary">Top</Typography>
          </ScrollIndicator>
        )}
      </ScrollableContainer>
    </Box>
  );
};

export default SkillTransitionChart;