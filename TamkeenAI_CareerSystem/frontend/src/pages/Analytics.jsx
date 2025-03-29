import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon,
  Tabs, Tab, CircularProgress, Alert, Tooltip,
  Menu, MenuItem, FormControl, InputLabel, Select,
  Chip, Badge, LinearProgress, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Skeleton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar
} from '@mui/material';
import {
  Analytics as AnalyticsIcon, TrendingUp, TrendingDown,
  Assessment, Insights, Timeline, PieChart, BarChart,
  Work, School, Assignment, Description, People,
  CompareArrows, Visibility, VisibilityOff, Share,
  More, CloudDownload, DateRange, FilterList, Refresh,
  Settings, InfoOutlined, Star, StarBorder, Assignment as AssignmentIcon, 
  ThumbUp, ThumbDown, Check, DoNotDisturb, Flag, 
  CheckCircle, Warning, Speed, ArrowUpward, ArrowDownward,
  ArrowForward, ViewList, GridView, GetApp, Print,
  Email, Bookmark, MoreVert, AccessTime, Person,
  Add, Schedule, MenuBook, Psychology, QuestionAnswer,
  BusinessCenter, WorkHistory, WbIncandescent, Language,
  Build, Extension, Code, Tune, Navigation, Public
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import SkillChip from '../components/common/SkillChip';

// Charts
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  LineChart,
  Line,
  Area,
  AreaChart,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    interview: 0,
    rejected: 0,
    offered: 0,
    accepted: 0,
    byMonth: [],
    byCategory: [],
    averageResponse: 0,
    successRate: 0
  });
  
  const [skillsData, setSkillsData] = useState({
    userSkills: [],
    skillGap: [],
    mostInDemand: [],
    skillGrowth: []
  });
  
  const [learningStats, setLearningStats] = useState({
    completed: 0,
    inProgress: 0,
    planned: 0,
    byTopic: [],
    mostPopular: [],
    timeSpent: []
  });
  
  const [jobMarketInsights, setJobMarketInsights] = useState({
    topRoles: [],
    averageSalaries: [],
    hiringTrends: [],
    popularSkills: [],
    demandByLocation: []
  });
  
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [careerGoals, setCareerGoals] = useState([]);
  const [timeRange, setTimeRange] = useState('6months');
  const [compareMode, setCompareMode] = useState(false);
  const [industryBenchmark, setIndustryBenchmark] = useState(false);
  const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Load analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch data for the active tab
        if (activeTab === 0) {
          // Overview/Applications Tab
          const appStatsResponse = await apiEndpoints.analytics.getApplicationStats(profile.id, { timeRange });
          setApplicationStats(appStatsResponse.data || {});
          
          const timelineResponse = await apiEndpoints.analytics.getActivityTimeline(profile.id, { timeRange });
          setActivityTimeline(timelineResponse.data || []);
        } else if (activeTab === 1) {
          // Skills Tab
          const skillsResponse = await apiEndpoints.analytics.getSkillsAnalytics(profile.id, { timeRange });
          setSkillsData(skillsResponse.data || {});
        } else if (activeTab === 2) {
          // Learning Tab
          const learningResponse = await apiEndpoints.analytics.getLearningStats(profile.id, { timeRange });
          setLearningStats(learningResponse.data || {});
        } else if (activeTab === 3) {
          // Job Market Tab
          const marketResponse = await apiEndpoints.analytics.getJobMarketInsights({ timeRange });
          setJobMarketInsights(marketResponse.data || {});
        } else if (activeTab === 4) {
          // Career Goals Tab
          const goalsResponse = await apiEndpoints.analytics.getCareerGoals(profile.id);
          setCareerGoals(goalsResponse.data || []);
        }
      } catch (err) {
        console.error('Error loading analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAnalyticsData();
  }, [profile, activeTab, timeRange]);
  
  // Handle export
  const handleExport = (format) => {
    // Implementation of handleExport function
  };
  
  // Render components based on active tab
  const renderApplicationsTab = () => {
    // Implementation of renderApplicationsTab function
  };
  
  const renderSkillsTab = () => {
    // Implementation of renderSkillsTab function
  };
  
  const renderLearningTab = () => {
    // Implementation of renderLearningTab function
  };
  
  const renderJobMarketTab = () => {
    // Implementation of renderJobMarketTab function
  };
  
  const renderCareerGoalsTab = () => {
    // Implementation of renderCareerGoalsTab function
  };
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Career Analytics
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl variant="outlined" size="small" sx={{ mr: 2, minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="3months">Last 3 Months</MenuItem>
              <MenuItem value="6months">Last 6 Months</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Compare with Average">
            <FormControlLabel
              control={
                <Switch
                  checked={industryBenchmark}
                  onChange={(e) => setIndustryBenchmark(e.target.checked)}
                  size="small"
                />
              }
              label="Benchmark"
              sx={{ mr: 2 }}
            />
          </Tooltip>
          
          <Button
            variant="outlined"
            startIcon={<CloudDownload />}
            onClick={(e) => setExportMenuAnchorEl(e.currentTarget)}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<AssessmentIcon />} 
            iconPosition="start" 
            label="Applications" 
          />
          <Tab 
            icon={<Psychology />} 
            iconPosition="start" 
            label="Skills" 
          />
          <Tab 
            icon={<MenuBook />} 
            iconPosition="start" 
            label="Learning" 
          />
          <Tab 
            icon={<BusinessCenter />} 
            iconPosition="start" 
            label="Job Market" 
          />
          <Tab 
            icon={<WbIncandescent />} 
            iconPosition="start" 
            label="Career Goals" 
          />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <LoadingSpinner message="Loading analytics data..." />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <Box>
          {activeTab === 0 && renderApplicationsTab()}
          {activeTab === 1 && renderSkillsTab()}
          {activeTab === 2 && renderLearningTab()}
          {activeTab === 3 && renderJobMarketTab()}
          {activeTab === 4 && renderCareerGoalsTab()}
        </Box>
      )}
      
      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchorEl}
        open={Boolean(exportMenuAnchorEl)}
        onClose={() => setExportMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => handleExport('pdf')}>
          <ListItemIcon>
            <GetApp fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Download as PDF" />
        </MenuItem>
        <MenuItem onClick={() => handleExport('excel')}>
          <ListItemIcon>
            <GetApp fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Download as Excel" />
        </MenuItem>
        <MenuItem onClick={() => handleExport('print')}>
          <ListItemIcon>
            <Print fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Print" />
        </MenuItem>
        <MenuItem onClick={() => handleExport('email')}>
          <ListItemIcon>
            <Email fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Email Report" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Analytics; 