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
  LabelList
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
  const [largestGapCategory, setLargestGapCategory] = useState(null);
  const [aiPlan, setAiPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [aiInsights, setAiInsights] = useState('');
  const [error, setError] = useState(null);
  const [huggingfaceStatus, setHuggingfaceStatus] = useState('unknown');
  
  // Process skill data for chart display
  const chartData = useMemo(() => {
    if (!skillData || !skillData.categories) return [];
    
    return Object.entries(skillData.categories).map(([category, data]) => {
      const current = data.average_level || 0;
      const required = data.required_level || 0;
      const gap = Math.max(0, required - current);
      
      // Determine color based on gap size
      let color = '#4caf50'; // Small gap (green)
      if (gap > 2) color = '#f44336'; // Large gap (red)
      else if (gap > 1) color = '#ff9800'; // Medium gap (orange)
      
      return {
        name: category,
        gap: gap.toFixed(1),
        current,
        required,
        color,
        skillCount: data.skills?.length || 0
      };
    }).sort((a, b) => b.gap - a.gap); // Sort by gap size descending
  }, [skillData]);
  
  // Find the category with the largest skill gap
  useEffect(() => {
    if (chartData.length > 0) {
      setLargestGapCategory(chartData[0]);
      fetchAIPlan(chartData[0].name);
    }
  }, [chartData]);
  
  // Fetch AI-generated plan for closing the gap
  const fetchAIPlan = async (category) => {
    setLoading(true);
    try {
      // In a real app, you would fetch the plan from your API
      // const response = await DashboardAPI.getSkillGapPlan({
      //   category,
      //   targetRole,
      //   currentLevel: largestGapCategory?.current || 0,
      //   requiredLevel: largestGapCategory?.required || 0
      // });
      // setAiPlan(response.plan);
      
      // Simulated API response
      setTimeout(() => {
        setAiPlan({
          category,
          gap: parseFloat(chartData[0].gap),
          timeline: "3 months",
          description: `Based on your current profile and target role as ${targetRole}, I've identified that filling the gap in ${category} skills would have the highest impact on your career progression.`,
          approach: "A combination of structured learning, hands-on practice, and mentor guidance will help you bridge this gap efficiently.",
          steps: [
            { 
              title: "Complete fundamental coursework", 
              description: "Start with structured learning to build theoretical knowledge",
              timeline: "Weeks 1-3",
              priority: "High" 
            },
            { 
              title: "Build a small project", 
              description: "Apply your knowledge to a real-world scenario to solidify understanding",
              timeline: "Weeks 4-7",
              priority: "High" 
            },
            { 
              title: "Get code review from senior developer", 
              description: "Receive feedback on your implementation and learn best practices",
              timeline: "Week 8",
              priority: "Medium" 
            },
            { 
              title: "Contribute to open source", 
              description: "Practice collaborating and working with existing codebases",
              timeline: "Weeks 9-12",
              priority: "Medium" 
            }
          ],
          resources: [
            {
              title: `Complete ${category} Fundamentals Course`,
              type: "course",
              provider: "Udemy",
              url: "https://www.udemy.com",
              duration: "20 hours"
            },
            {
              title: `Modern ${category} Development`,
              type: "book",
              provider: "O'Reilly",
              url: "https://www.oreilly.com",
              duration: "8 hours reading"
            },
            {
              title: `${category} Best Practices`,
              type: "video",
              provider: "YouTube",
              url: "https://www.youtube.com",
              duration: "3 hours"
            },
            {
              title: `${category} Practice Projects`,
              type: "practice",
              provider: "GitHub",
              url: "https://github.com",
              duration: "30 hours"
            }
          ],
          outcomes: [
            "Enhanced technical proficiency in key aspects of " + category,
            "Portfolio projects demonstrating your new skills",
            "Confidence in technical interviews when discussing " + category,
            "Ability to contribute to projects requiring " + category + " skills"
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching AI plan:", error);
      setLoading(false);
    }
  };
  
  // Get key skills with gaps in the category
  const getKeySkillsWithGaps = (category) => {
    if (!skillData || !skillData.categories || !skillData.categories[category]) {
      return [];
    }
    
    return skillData.categories[category].skills
      .filter(skill => skill.required_level > skill.current_level)
      .sort((a, b) => 
        (b.required_level - b.current_level) - (a.required_level - a.current_level)
      )
      .slice(0, 4); // Top 4 skills with gaps
  };

  useEffect(() => {
    // Check Hugging Face API status (simulated)
    const checkHuggingFaceStatus = async () => {
      try {
        // In a real implementation, you would make an API call to check status
        // For now, we'll randomly simulate connection status
        const statusCheck = Math.random() > 0.3;
        setHuggingfaceStatus(statusCheck ? 'connected' : 'disconnected');
      } catch (err) {
        console.error('Error checking Hugging Face status:', err);
        setHuggingfaceStatus('disconnected');
      }
    };
    
    checkHuggingFaceStatus();
  }, []);

  const fetchAIInsights = async () => {
    if (aiInsights) {
      setExpanded(!expanded);
      return;
    }
    
    setLoading(true);
    setError(null);
    setExpanded(true);
    
    try {
      // Craft prompt for skill gap analysis
      const prompt = `
I have these current skills: ${skillData.categories[largestGapCategory.name].skills.map(s => s.name).join(', ')}.
For the role of ${targetRole}, these skills are required: ${skillData.categories[largestGapCategory.name].skills.map(s => s.name).join(', ')}.
Provide a brief analysis of my skill gap and suggestions for how to bridge it.
`;
      
      // Call ChatGPT API to get AI insights
      const response = await chatService.sendMessage(prompt, '', 'career');
      setAiInsights(response.response);
      
      // In a real implementation, also call Hugging Face API for enhanced analysis
      if (huggingfaceStatus === 'connected') {
        console.log('Calling Hugging Face API for enhanced skill matching');
        // This would be an actual API call in production
        // enhanceWithHuggingFace(currentSkills, requiredSkills, targetRole);
      }
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setError('Failed to get AI insights. Please try again.');
      
      // Fallback insights
      setAiInsights(
        `Based on your current skills and the requirements for ${targetRole}, 
        you should focus on acquiring the missing skills listed above. 
        Consider taking online courses or hands-on projects to develop these skills.`
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ height: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <StarsIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">Skill Gap Analysis</Typography>
          
          {/* Hugging Face Status Indicator */}
          <Tooltip title={`Hugging Face AI: ${huggingfaceStatus}`}>
            <Box component="span" sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
              {huggingfaceStatus === 'connected' ? 
                <CloudDoneIcon fontSize="small" color="success" /> : 
                <CloudOffIcon fontSize="small" color="action" />
              }
            </Box>
          </Tooltip>
        </Box>
        <Typography variant="body2" color="textSecondary">
          Target: {targetRole || 'Not specified'}
        </Typography>
      </Box>
      
      <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          Skills Match
          <Tooltip title="Based on required skills for this role">
            <InfoIcon fontSize="small" sx={{ ml: 1, opacity: 0.6 }} />
          </Tooltip>
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ flexGrow: 1, mr: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={Math.round((largestGapCategory?.current || 0 / largestGapCategory?.required || 0) * 100)} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: Math.round((largestGapCategory?.current || 0 / largestGapCategory?.required || 0) * 100) < 40 ? 'error.main' : Math.round((largestGapCategory?.current || 0 / largestGapCategory?.required || 0) * 100) < 70 ? 'warning.main' : 'success.main',
                  borderRadius: 5,
                }
              }} 
            />
          </Box>
          <Typography 
            variant="h6" 
            color={Math.round((largestGapCategory?.current || 0 / largestGapCategory?.required || 0) * 100) < 40 ? 'error' : Math.round((largestGapCategory?.current || 0 / largestGapCategory?.required || 0) * 100) < 70 ? 'warning.main' : 'success.main'}
          >
            {Math.round((largestGapCategory?.current || 0 / largestGapCategory?.required || 0) * 100)}%
          </Typography>
        </Box>
      </Paper>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Paper sx={{ p: 2 }} elevation={1}>
            <Typography variant="subtitle1" gutterBottom>
              Matched Skills ({largestGapCategory?.skillCount})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {largestGapCategory?.skillCount > 0 ? getKeySkillsWithGaps(largestGapCategory.name).map((skill, index) => (
                <Chip 
                  key={index} 
                  label={skill.name} 
                  color="success" 
                  size="small" 
                  variant="outlined"
                />
              )) : (
                <Typography variant="body2" color="text.secondary">No matched skills yet.</Typography>
              )}
            </Box>
          </Paper>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Paper sx={{ p: 2 }} elevation={1}>
            <Typography variant="subtitle1" gutterBottom>
              Missing Skills ({skillData?.categories && largestGapCategory 
                ? skillData.categories[largestGapCategory.name]?.skills.length - largestGapCategory.skillCount 
                : 0})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {skillData?.categories && largestGapCategory && skillData.categories[largestGapCategory.name]?.skills
                .filter(s => s.required_level > s.current_level).map((skill, index) => (
                <Chip 
                  key={index} 
                  label={skill.name} 
                  color="error" 
                  size="small" 
                  variant="outlined"
                  deleteIcon={<AddIcon />}
                  onDelete={() => console.log(`Add ${skill.name} to learning plan`)}
                />
              ))}
            </Box>
          </Paper>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Paper sx={{ p: 2 }} elevation={1}>
            <Typography variant="subtitle1" gutterBottom>
              Additional Skills ({skillData?.categories && largestGapCategory 
                ? skillData.categories[largestGapCategory.name]?.skills.length - largestGapCategory.skillCount 
                : 0})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {skillData?.categories && largestGapCategory && skillData.categories[largestGapCategory.name]?.skills
                .filter(s => s.required_level < s.current_level).map((skill, index) => (
                <Chip 
                  key={index} 
                  label={skill.name} 
                  color="primary" 
                  size="small" 
                  variant="outlined"
                />
              ))}
            </Box>
          </Paper>
        </motion.div>
      </Box>
      
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: expanded ? 2 : 0 }}>
          <Typography variant="subtitle1">
            AI-Powered Insights
          </Typography>
          <IconButton 
            onClick={fetchAIInsights}
            disabled={loading}
            size="small"
          >
            {loading ? <CircularProgress size={16} /> : expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={expanded}>
          {error ? (
            <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {aiInsights}
            </Typography>
          )}
        </Collapse>
      </Paper>
    </Box>
  );
};

export default SkillGapAnalysis;
