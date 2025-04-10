import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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
import DashboardAPI from '../../api/DashboardAPI';
import chatService from '../../api/chatgpt';
import { useTranslation } from 'react-i18next';

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

// Custom Bar Chart tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 1, boxShadow: 2 }}>
        <Typography variant="body2" color="text.primary">
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: payload[0].fill, mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {`Current Level: ${payload[0].payload.current}`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: '#f3f3f3', mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {`Required Level: ${payload[0].payload.required}`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Box sx={{ width: 12, height: 12, bgcolor: payload[0].payload.color, mr: 1 }} />
          <Typography variant="body2" fontWeight="bold" color="text.primary">
            {`Gap: ${payload[0].value}`}
          </Typography>
        </Box>
      </Paper>
    );
  }
  return null;
};

// Resource type icon mapping
const resourceTypeIcons = {
  'course': <SchoolIcon />,
  'video': <PlayCircleOutlineIcon />,
  'book': <MenuBookIcon />,
  'practice': <AssignmentTurnedInIcon />
};

const SkillGapAnalysis = ({ skillData, targetRole }) => {
  const { t } = useTranslation();
  const [assessmentHistory, setAssessmentHistory] = useState([]);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [error, setError] = useState(null);
  
  // Load assessment data from localStorage on component mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('skillAssessmentHistory');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        setAssessmentHistory(parsedHistory);
        
        // Set latest assessment
        if (parsedHistory.length > 0) {
          setLatestAssessment(parsedHistory[0]);
        }
      }
    } catch (error) {
      console.error('Error loading assessment data from localStorage:', error);
      setError('Failed to load assessment history.');
    }
  }, []);
  
  // Prepare data for radar chart showing strengths vs areas for improvement
  const radarChartData = useMemo(() => {
    if (!latestAssessment) return [];
    
    // Example data structure for radar chart
    const strengths = latestAssessment.strengths || [];
    const weaknesses = latestAssessment.weaknesses || [];
    
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
    
    return (
      <Paper elevation={3} sx={{ mb: 4, p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('skillGap.latestAssessmentTitle', 'Latest Assessment:')} {latestAssessment.categoryName}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={latestAssessment.score}
                  size={120}
                  thickness={5}
                  color={
                    latestAssessment.score > 80 ? 'success' :
                    latestAssessment.score > 60 ? 'primary' :
                    latestAssessment.score > 40 ? 'warning' : 'error'
                  }
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
                  <Typography variant="h4" component="div">
                    {latestAssessment.score}%
                  </Typography>
                  <Typography variant="caption" component="div" color="text.secondary">
                    {t('skillGap.score', 'Score')}
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {new Date(latestAssessment.timestamp).toLocaleDateString()}
              </Typography>
              
              <Typography variant="body1" sx={{ mt: 2 }}>
                {latestAssessment.correctAnswers} of {latestAssessment.totalQuestions} correct
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle1" gutterBottom>
              {t('skillGap.skillsProfile', 'Skills Profile')}
            </Typography>
            
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Skill Level" dataKey="A" stroke="#8884d8" 
                    fill="#8884d8" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              {t('skillGap.strengths', 'Strengths')}
            </Typography>
            
            <List dense>
              {latestAssessment.strengths.map((strength, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText primary={strength} />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              {t('skillGap.areasForImprovement', 'Areas for Improvement')}
            </Typography>
            
            <List dense>
              {latestAssessment.weaknesses.map((weakness, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <PriorityHighIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={weakness} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Box sx={{ height: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Render only the latest assessment component */}
      {latestAssessment && renderLatestAssessment()}
    </Box>
  );
};

export default SkillGapAnalysis;
