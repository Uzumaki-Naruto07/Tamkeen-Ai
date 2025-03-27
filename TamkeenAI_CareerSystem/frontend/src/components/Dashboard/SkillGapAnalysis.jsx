import React, { useState, useEffect, useMemo } from 'react';
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
  Link
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
import DashboardAPI from '../../api/DashboardAPI';

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
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Skill Gap Analysis
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          This analysis compares your current skill levels against what's required for your target role: <strong>{targetRole}</strong>
        </Typography>
        
        {/* Bar Chart for Skill Gaps */}
        <Box sx={{ height: 400, mb: 4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 13 }}
                width={100}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="gap" 
                name="Skill Gap" 
                background={{ fill: '#f3f3f3' }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList dataKey="gap" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* AI Suggested Plan */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <PsychologyIcon sx={{ mr: 1 }} />
            AI-Suggested Plan for Closing Your Biggest Gap
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <Typography>Generating personalized plan...</Typography>
            </Box>
          ) : aiPlan ? (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Focus area:</strong> {aiPlan.category} (Gap: {aiPlan.gap})
                </Typography>
                <Typography variant="body2">
                  <strong>Estimated timeline:</strong> {aiPlan.timeline}
                </Typography>
              </Alert>
              
              <Typography variant="body2" paragraph>
                {aiPlan.description}
              </Typography>
              
              <Typography variant="body2" paragraph>
                {aiPlan.approach}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Key Skills to Develop:
                  </Typography>
                  <List dense>
                    {getKeySkillsWithGaps(aiPlan.category).map((skill, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <PriorityHighIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={skill.name}
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Current: {skill.current_level}/5
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Required: {skill.required_level}/5
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={(skill.current_level / skill.required_level) * 100} 
                                sx={{ height: 6, borderRadius: 1 }} 
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                    Action Plan:
                  </Typography>
                  <List dense>
                    {aiPlan.steps.map((step, index) => (
                      <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                          <Chip 
                            label={index + 1} 
                            size="small" 
                            color="primary" 
                            sx={{ 
                              height: 24, 
                              width: 24, 
                              borderRadius: '50%',
                              '& .MuiChip-label': { p: 0 }
                            }} 
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" fontWeight="medium">
                                {step.title}
                              </Typography>
                              <Chip 
                                label={step.priority} 
                                size="small" 
                                color={step.priority === 'High' ? 'error' : 'warning'} 
                                sx={{ ml: 1, height: 20 }} 
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" color="text.secondary">
                                {step.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Timeline: {step.timeline}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Recommended Resources:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <List dense disablePadding>
                      {aiPlan.resources.map((resource, index) => (
                        <ListItem 
                          key={index} 
                          sx={{ 
                            px: 1, 
                            py: 1.5, 
                            borderBottom: index < aiPlan.resources.length - 1 ? '1px solid #eee' : 'none' 
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {resourceTypeIcons[resource.type]}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Link 
                                href={resource.url} 
                                target="_blank" 
                                rel="noopener" 
                                color="inherit" 
                                sx={{ 
                                  fontWeight: 'medium',
                                  display: 'flex', 
                                  alignItems: 'center',
                                  '&:hover': { color: 'primary.main' }
                                }}
                              >
                                {resource.title}
                                <ArrowForwardIcon fontSize="small" sx={{ ml: 0.5, fontSize: 14 }} />
                              </Link>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {resource.provider}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {resource.duration}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                    Expected Outcomes:
                  </Typography>
                  <List dense>
                    {aiPlan.outcomes.map((outcome, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircleIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={outcome} />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      endIcon={<AssignmentIcon />}
                    >
                      Add to Development Plan
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Alert severity="warning">
              Unable to generate plan. Please try refreshing the page.
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SkillGapAnalysis;
