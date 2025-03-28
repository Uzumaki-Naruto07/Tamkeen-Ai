import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import {
  InfoOutlined,
  DownloadOutlined,
  VisibilityOutlined,
  TrendingUp
} from '@mui/icons-material';
import { skillTransitionData } from '../../utils/app-mocks';
import { motion } from 'framer-motion';

const SkillTransitionChart = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        setChartData(skillTransitionData);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSkillSelect = (skill) => {
    setSelectedSkill(skill === selectedSkill ? null : skill);
  };

  const prepareGapChartData = () => {
    if (!chartData) return [];
    
    return chartData.targetSkills.map(skill => ({
      name: skill.name,
      current: skill.currentProficiency,
      required: skill.required,
      gap: skill.gap
    }));
  };

  const prepareDevelopmentChartData = () => {
    if (!chartData || !selectedSkill) {
      // If no skill is selected, return the first one
      const defaultSkill = chartData?.skillsDevelopment[0];
      if (!defaultSkill) return [];

      return defaultSkill.milestones.map(milestone => ({
        date: milestone.date,
        level: milestone.level,
        event: milestone.event
      }));
    }

    const selectedSkillData = chartData.skillsDevelopment.find(
      item => item.skill === selectedSkill
    );

    if (!selectedSkillData) return [];

    return selectedSkillData.milestones.map(milestone => ({
      date: milestone.date,
      level: milestone.level,
      event: milestone.event
    }));
  };

  const prepareComparisonChartData = () => {
    if (!chartData) return [];
    
    return chartData.skillsComparison.industry.map(item => ({
      skill: item.skill,
      user: item.userLevel,
      industry: item.industryAvg,
      top: item.topPerformers
    }));
  };

  const prepareRadarChartData = () => {
    if (!chartData) return [];
    
    // Combine data for radar chart
    const roleSpecific = chartData.skillsComparison.roleSpecific;
    const currentRole = "Frontend Developer";
    const targetRole = "Frontend Team Lead";
    
    const skills = [...new Set([
      ...roleSpecific[currentRole].map(item => item.skill),
      ...roleSpecific[targetRole].map(item => item.skill)
    ])];
    
    return skills.map(skill => {
      const currentRoleData = roleSpecific[currentRole].find(item => item.skill === skill);
      const targetRoleData = roleSpecific[targetRole].find(item => item.skill === skill);
      
      return {
        skill,
        [currentRole]: currentRoleData ? currentRoleData.importance : 0,
        [targetRole]: targetRoleData ? targetRoleData.importance : 0,
        userLevel: (currentRoleData || targetRoleData) ? 
          (currentRoleData || targetRoleData).userLevel : 0
      };
    });
  };

  const renderGapChart = () => (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Current vs Required Skills for Target Role
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        This chart shows the gap between your current skill levels and what's required for your target role as a Frontend Team Lead.
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={prepareGapChartData()}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip 
            formatter={(value, name) => [
              `${value}%`, 
              name === 'current' ? 'Your Level' : name === 'required' ? 'Required Level' : 'Gap'
            ]}
          />
          <Legend />
          <Bar dataKey="current" name="Your Current Level" fill={theme.palette.primary.main} />
          <Bar dataKey="required" name="Required Level" fill={theme.palette.success.main} />
          <Bar dataKey="gap" name="Skill Gap" fill={theme.palette.error.main} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );

  const renderDevelopmentChart = () => (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Skill Development Timeline
        </Typography>
        <Box>
          {chartData?.skillsDevelopment.map((skill) => (
            <Button
              key={skill.skill}
              size="small"
              variant={selectedSkill === skill.skill ? "contained" : "outlined"}
              sx={{ mr: 1, mb: 1 }}
              onClick={() => handleSkillSelect(skill.skill)}
            >
              {skill.skill}
            </Button>
          ))}
        </Box>
      </Box>
      <Typography variant="body2" color="textSecondary" paragraph>
        {selectedSkill ? 
          `Tracking your progress in ${selectedSkill} from level ${chartData?.skillsDevelopment.find(s => s.skill === selectedSkill)?.startLevel} to target level ${chartData?.skillsDevelopment.find(s => s.skill === selectedSkill)?.targetLevel}.` : 
          'Select a skill to see your development timeline. Projected milestones help you track your progress.'}
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={prepareDevelopmentChartData()}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <RechartsTooltip
            formatter={(value, name, props) => {
              const dataPoint = props.payload;
              return [
                `Level: ${value}`, 
                dataPoint.event
              ];
            }}
          />
          <Line 
            type="monotone" 
            dataKey="level" 
            stroke={theme.palette.primary.main} 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );

  const renderComparisonChart = () => (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Your Skills vs Industry Averages
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Compare your skill levels against industry averages and top performers to identify competitive advantages.
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={prepareComparisonChartData()}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="skill" />
          <YAxis />
          <RechartsTooltip 
            formatter={(value, name) => [
              `${value}%`, 
              name === 'user' ? 'Your Level' : name === 'industry' ? 'Industry Average' : 'Top Performers'
            ]}
          />
          <Legend />
          <Bar dataKey="user" name="Your Level" fill={theme.palette.primary.main} />
          <Bar dataKey="industry" name="Industry Average" fill={theme.palette.info.main} />
          <Bar dataKey="top" name="Top Performers" fill={theme.palette.success.main} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );

  const renderRoleComparisonChart = () => (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Current vs Target Role Skill Requirements
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        This radar chart shows how skill requirements differ between your current role and target role, along with your current levels.
      </Typography>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart outerRadius={150} data={prepareRadarChartData()}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          <Radar 
            name="Frontend Developer" 
            dataKey="Frontend Developer" 
            stroke={theme.palette.info.main} 
            fill={theme.palette.info.main} 
            fillOpacity={0.2} 
          />
          <Radar 
            name="Frontend Team Lead" 
            dataKey="Frontend Team Lead" 
            stroke={theme.palette.success.main} 
            fill={theme.palette.success.main} 
            fillOpacity={0.2} 
          />
          <Radar 
            name="Your Current Level" 
            dataKey="userLevel" 
            stroke={theme.palette.primary.main} 
            fill={theme.palette.primary.main} 
            fillOpacity={0.6} 
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </Box>
  );

  return (
    <Paper 
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      elevation={3} 
      sx={{ 
        borderRadius: 2, 
        overflow: 'hidden', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.default
        }}
      >
        <Box display="flex" alignItems="center">
          <TrendingUp sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="h6" component="h2">
            Skill Transition Path
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Download chart data">
            <IconButton size="small">
              <DownloadOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View detailed analysis">
            <IconButton size="small">
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="AI-powered skill path insights">
            <IconButton size="small">
              <InfoOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
        sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.default
        }}
      >
        <Tab label="Skill Gaps" />
        <Tab label="Development" />
        <Tab label="Comparison" />
        <Tab label="Role Analysis" />
      </Tabs>
      
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {activeTab === 0 && renderGapChart()}
            {activeTab === 1 && renderDevelopmentChart()}
            {activeTab === 2 && renderComparisonChart()}
            {activeTab === 3 && renderRoleComparisonChart()}
          </>
        )}
      </Box>
      
      <Box 
        sx={{ 
          p: 2, 
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.default,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="body2" color="textSecondary">
          Target Role: Frontend Team Lead
        </Typography>
        <Button 
          variant="outlined" 
          size="small"
          startIcon={<InfoOutlined />}
        >
          Improve Your Path
        </Button>
      </Box>
    </Paper>
  );
};

export default SkillTransitionChart;