import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Grid, Card, CardContent, CardHeader, IconButton,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, CircularProgress, Alert, Chip, Avatar, Badge,
  Tabs, Tab, List, ListItem, ListItemText, ListItemIcon,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControlLabel, Switch, InputAdornment
} from '@mui/material';
import {
  Dashboard, PeopleAlt, WorkOutline, Assessment,
  TrendingUp, TrendingDown, Refresh, CloudDownload,
  DateRange, FilterList, Group, SupervisedUserCircle,
  Storage, CloudUpload, AttachMoney, AccessTime,
  Search, MoreVert, InsertChart, DesktopWindows,
  DevicesOther, PhoneIphone, Public, Language,
  BarChart, PieChart, Timeline, BugReport, Security,
  Info, Warning, Error as ErrorIcon, CheckCircle,
  Settings, Psychology, School, EventNote, Assignment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, subDays, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { useTheme } from '@mui/material/styles';

// Charts
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  AreaChart, Area, BarChart as RechartsBarChart, Bar,
  PieChart as RechartsPieChart, Pie, Cell, Scatter,
  ScatterChart, ZAxis, Treemap, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const AdminInsights = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [activeTab, setActiveTab] = useState(0); // 0: Overview, 1: Users, 2: Content, 3: Performance, 4: Revenue
  const [usageData, setUsageData] = useState(null);
  const [userStatistics, setUserStatistics] = useState(null);
  const [contentStatistics, setContentStatistics] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showRealTimeData, setShowRealTimeData] = useState(false);
  const [geographicData, setGeographicData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [popularFeatures, setPopularFeatures] = useState([]);
  const [errorLogs, setErrorLogs] = useState([]);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [reportDialog, setReportDialog] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    includeUserData: true,
    includeContentStats: true,
    includeRevenue: true,
    format: 'pdf'
  });
  
  const navigate = useNavigate();
  const { profile } = useUser();
  const theme = useTheme();
  
  // Colors for charts
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];
  
  // Check admin access
  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      setError('Authentication required. Please log in.');
      return;
    }
    
    if (!profile.isAdmin) {
      setLoading(false);
      setError('Admin access required. You do not have permission to view this page.');
      return;
    }
    
    loadData();
  }, [profile]);
  
  // Load data based on time range
  useEffect(() => {
    if (profile?.isAdmin) {
      loadData();
    }
  }, [timeRange]);
  
  // Load all data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, these would be separate API calls
      // For this demo, we'll generate mock data
      generateMockData();
      setLoading(false);
    } catch (err) {
      console.error('Error loading admin insights data:', err);
      setError('Failed to load data. Please try again later.');
      setLoading(false);
    }
  };
  
  // Generate mock data
  const generateMockData = () => {
    // Generate dates for the selected time range
    const days = timeRange === '7days' ? 7 : 
                timeRange === '30days' ? 30 : 
                timeRange === '90days' ? 90 : 365;
    
    const dates = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - i - 1);
      return format(date, 'yyyy-MM-dd');
    });
    
    // Generate daily usage data
    const dailyData = dates.map(date => {
      const dayOfWeek = new Date(date).getDay();
      // Generate more realistic data with weekday/weekend patterns
      const multiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1;
      
      return {
        date,
        activeUsers: Math.floor(Math.random() * 500 * multiplier) + 200,
        newUsers: Math.floor(Math.random() * 50 * multiplier) + 10,
        pageViews: Math.floor(Math.random() * 3000 * multiplier) + 1000,
        sessionsPerUser: ((Math.random() * 2) + 1.5).toFixed(2),
        averageSessionDuration: Math.floor(Math.random() * 300) + 120, // in seconds
        bounceRate: ((Math.random() * 15) + 25).toFixed(2), // percentage
      };
    });
    
    // Generate user statistics
    const totalUsers = 5000 + Math.floor(Math.random() * 500);
    const activeUsersCount = Math.floor(totalUsers * 0.65);
    const premiumUsersCount = Math.floor(totalUsers * 0.12);
    
    const userStats = {
      total: totalUsers,
      active: activeUsersCount,
      inactive: totalUsers - activeUsersCount,
      premium: premiumUsersCount,
      free: totalUsers - premiumUsersCount,
      averageEngagementScore: ((Math.random() * 20) + 65).toFixed(1),
      retentionRate: ((Math.random() * 15) + 70).toFixed(1),
      churnRate: ((Math.random() * 5) + 3).toFixed(1),
      newUsersThisMonth: Math.floor(Math.random() * 300) + 100,
      averageAge: Math.floor(Math.random() * 10) + 25,
      genderDistribution: {
        male: ((Math.random() * 20) + 40).toFixed(1),
        female: ((Math.random() * 20) + 40).toFixed(1),
        other: ((Math.random() * 5) + 1).toFixed(1),
      },
      educationDistribution: [
        { name: 'High School', value: Math.floor(Math.random() * 15) + 5 },
        { name: 'Bachelor', value: Math.floor(Math.random() * 20) + 40 },
        { name: 'Master', value: Math.floor(Math.random() * 15) + 20 },
        { name: 'PhD', value: Math.floor(Math.random() * 10) + 5 },
        { name: 'Other', value: Math.floor(Math.random() * 10) + 5 },
      ],
      experienceDistribution: [
        { name: 'Entry', value: Math.floor(Math.random() * 20) + 20 },
        { name: 'Mid-Level', value: Math.floor(Math.random() * 20) + 30 },
        { name: 'Senior', value: Math.floor(Math.random() * 15) + 20 },
        { name: 'Executive', value: Math.floor(Math.random() * 10) + 5 },
      ],
    };
    
    // Generate content statistics
    const contentStats = {
      totalResumes: Math.floor(Math.random() * 3000) + 5000,
      totalCoverLetters: Math.floor(Math.random() * 2000) + 3000,
      totalJobApplications: Math.floor(Math.random() * 10000) + 20000,
      averageResumeScore: ((Math.random() * 15) + 70).toFixed(1),
      averageCoverLetterScore: ((Math.random() * 15) + 65).toFixed(1),
      totalInterviews: Math.floor(Math.random() * 5000) + 8000,
      averageInterviewScore: ((Math.random() * 20) + 60).toFixed(1),
      uploadedDocuments: Math.floor(Math.random() * 2000) + 4000,
      contentByCategory: [
        { name: 'Resumes', value: Math.floor(Math.random() * 2000) + 5000 },
        { name: 'Cover Letters', value: Math.floor(Math.random() * 1500) + 3000 },
        { name: 'Applications', value: Math.floor(Math.random() * 8000) + 15000 },
        { name: 'Interviews', value: Math.floor(Math.random() * 4000) + 8000 },
        { name: 'Mock Tests', value: Math.floor(Math.random() * 3000) + 5000 },
      ],
      contentCreatedOverTime: dates.map(date => ({
        date,
        resumes: Math.floor(Math.random() * 30) + 10,
        coverLetters: Math.floor(Math.random() * 20) + 5,
        applications: Math.floor(Math.random() * 50) + 20,
      })),
    };
    
    // Generate performance metrics
    const performanceMetrics = {
      averageResponseTime: ((Math.random() * 100) + 100).toFixed(0), // in milliseconds
      serverUptime: ((Math.random() * 0.5) + 99.5).toFixed(2), // percentage
      apiCallsPerDay: Math.floor(Math.random() * 50000) + 100000,
      errorsPerDay: Math.floor(Math.random() * 100) + 50,
      averageCpuUsage: ((Math.random() * 20) + 40).toFixed(1), // percentage
      averageMemoryUsage: ((Math.random() * 15) + 60).toFixed(1), // percentage
      activeConnections: Math.floor(Math.random() * 300) + 200,
      dailyMetrics: dates.map(date => ({
        date,
        responseTime: Math.floor(Math.random() * 150) + 80,
        cpuUsage: ((Math.random() * 30) + 30).toFixed(1),
        memoryUsage: ((Math.random() * 20) + 50).toFixed(1),
        apiCalls: Math.floor(Math.random() * 40000) + 80000,
        errors: Math.floor(Math.random() * 100) + 20,
      })),
      servicesStatus: [
        { name: 'Web Server', status: 'operational', uptime: '99.99%' },
        { name: 'Database', status: 'operational', uptime: '99.98%' },
        { name: 'AI Analysis', status: 'operational', uptime: '99.95%' },
        { name: 'Storage', status: 'operational', uptime: '99.99%' },
        { name: 'Email Service', status: 'operational', uptime: '99.97%' },
      ],
      topErrors: [
        { type: 'API Timeout', count: Math.floor(Math.random() * 50) + 20, severity: 'medium' },
        { type: 'Database Connection', count: Math.floor(Math.random() * 30) + 10, severity: 'high' },
        { type: 'Authentication Failure', count: Math.floor(Math.random() * 40) + 15, severity: 'medium' },
        { type: 'File Processing Error', count: Math.floor(Math.random() * 60) + 30, severity: 'low' },
        { type: 'ML Model Prediction Error', count: Math.floor(Math.random() * 35) + 25, severity: 'medium' },
      ],
    };
    
    // Generate revenue data
    const revenueMetrics = {
      totalRevenue: Math.floor(Math.random() * 50000) + 100000, // in USD
      monthlyRecurringRevenue: Math.floor(Math.random() * 10000) + 30000,
      averageRevenuePerUser: ((Math.random() * 30) + 50).toFixed(2),
      conversionRate: ((Math.random() * 5) + 3).toFixed(2), // percentage
      churnRate: ((Math.random() * 1.5) + 1).toFixed(2), // percentage
      lifetimeValue: Math.floor(Math.random() * 300) + 500,
      revenueByPlan: [
        { name: 'Basic', value: Math.floor(Math.random() * 20000) + 30000 },
        { name: 'Pro', value: Math.floor(Math.random() * 30000) + 50000 },
        { name: 'Enterprise', value: Math.floor(Math.random() * 20000) + 30000 },
      ],
      revenueOverTime: dates.map(date => ({
        date,
        revenue: Math.floor(Math.random() * 2000) + 3000,
        newSubscriptions: Math.floor(Math.random() * 20) + 10,
        cancellations: Math.floor(Math.random() * 10) + 2,
      })),
    };
    
    // Geographic distribution
    const geoData = [
      { country: 'United States', users: Math.floor(Math.random() * 1000) + 2000, revenue: Math.floor(Math.random() * 20000) + 40000 },
      { country: 'United Kingdom', users: Math.floor(Math.random() * 500) + 800, revenue: Math.floor(Math.random() * 10000) + 15000 },
      { country: 'Canada', users: Math.floor(Math.random() * 300) + 500, revenue: Math.floor(Math.random() * 6000) + 9000 },
      { country: 'Germany', users: Math.floor(Math.random() * 300) + 400, revenue: Math.floor(Math.random() * 5000) + 8000 },
      { country: 'Australia', users: Math.floor(Math.random() * 200) + 300, revenue: Math.floor(Math.random() * 4000) + 6000 },
      { country: 'India', users: Math.floor(Math.random() * 500) + 700, revenue: Math.floor(Math.random() * 4000) + 5000 },
      { country: 'France', users: Math.floor(Math.random() * 200) + 250, revenue: Math.floor(Math.random() * 3000) + 4000 },
      { country: 'Other', users: Math.floor(Math.random() * 1000) + 1500, revenue: Math.floor(Math.random() * 8000) + 12000 },
    ];
    
    // Device distribution
    const deviceDistribution = [
      { name: 'Desktop', value: Math.floor(Math.random() * 15) + 45 },
      { name: 'Mobile', value: Math.floor(Math.random() * 15) + 40 },
      { name: 'Tablet', value: Math.floor(Math.random() * 10) + 5 },
    ];
    
    // Popular features
    const featuresData = [
      { name: 'Resume Analysis', usage: Math.floor(Math.random() * 1000) + 3000, growth: ((Math.random() * 20) + 5).toFixed(1) },
      { name: 'Cover Letter Generator', usage: Math.floor(Math.random() * 800) + 2000, growth: ((Math.random() * 30) + 10).toFixed(1) },
      { name: 'Mock Interview', usage: Math.floor(Math.random() * 600) + 1500, growth: ((Math.random() * 25) + 15).toFixed(1) },
      { name: 'Job Recommendations', usage: Math.floor(Math.random() * 1200) + 2500, growth: ((Math.random() * 15) + 5).toFixed(1) },
      { name: 'Skill Analysis', usage: Math.floor(Math.random() * 700) + 1800, growth: ((Math.random() * 10) + 8).toFixed(1) },
      { name: 'Career Path', usage: Math.floor(Math.random() * 500) + 1200, growth: ((Math.random() * 40) + 20).toFixed(1) },
      { name: 'Networking Tools', usage: Math.floor(Math.random() * 400) + 900, growth: ((Math.random() * 15) + 5).toFixed(1) },
    ];
    
    // Top users
    const topUsersList = Array.from({ length: 10 }, (_, i) => ({
      id: `user-${100 + i}`,
      name: `User ${100 + i}`,
      email: `user${100 + i}@example.com`,
      plan: i < 3 ? 'Enterprise' : i < 7 ? 'Pro' : 'Basic',
      activity: Math.floor(Math.random() * 100) + 50,
      revenue: Math.floor(Math.random() * 500) + 100,
      joinDate: format(subDays(new Date(), Math.floor(Math.random() * 365)), 'yyyy-MM-dd'),
      lastActive: format(subDays(new Date(), Math.floor(Math.random() * 10)), 'yyyy-MM-dd'),
    }));
    
    // Error logs
    const errorLogsList = Array.from({ length: 20 }, (_, i) => ({
      id: `error-${1000 + i}`,
      timestamp: format(subDays(new Date(), Math.floor(Math.random() * days)), 'yyyy-MM-dd HH:mm:ss'),
      type: ['API Error', 'Database Error', 'Authentication Error', 'Processing Error', 'Timeout'][Math.floor(Math.random() * 5)],
      message: `Error occurred in the ${['authentication', 'resume processing', 'job search', 'interview analysis', 'user profile'][Math.floor(Math.random() * 5)]} module.`,
      severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      userId: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 1000) + 1}` : null,
      resolved: Math.random() > 0.7,
    }));
    
    // Set all the mock data
    setUsageData(dailyData);
    setUserStatistics(userStats);
    setContentStatistics(contentStats);
    setPerformanceMetrics(performanceMetrics);
    setRevenueData(revenueMetrics);
    setGeographicData(geoData);
    setDeviceData(deviceDistribution);
    setPopularFeatures(featuresData);
    setTopUsers(topUsersList);
    setErrorLogs(errorLogsList);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadData().then(() => {
      setRefreshing(false);
    });
  };
  
  // Handle user details click
  const handleUserDetailsClick = (userId) => {
    setSelectedUserId(userId);
    
    // Find selected user
    const user = topUsers.find(user => user.id === userId);
    if (user) {
      // Generate additional mock data for this user
      const userData = {
        ...user,
        activity: {
          logins: Math.floor(Math.random() * 50) + 20,
          pageViews: Math.floor(Math.random() * 200) + 100,
          features: [
            { name: 'Resume Analysis', count: Math.floor(Math.random() * 20) + 5 },
            { name: 'Cover Letter', count: Math.floor(Math.random() * 15) + 3 },
            { name: 'Job Applications', count: Math.floor(Math.random() * 30) + 10 },
            { name: 'Mock Interviews', count: Math.floor(Math.random() * 10) + 2 },
          ],
          lastActions: Array.from({ length: 5 }, (_, i) => ({
            action: ['Logged in', 'Updated resume', 'Applied to job', 'Completed interview', 'Viewed analytics'][Math.floor(Math.random() * 5)],
            timestamp: format(subDays(new Date(), i), 'yyyy-MM-dd HH:mm:ss'),
          })),
        },
        billing: {
          plan: user.plan,
          amountPaid: user.revenue,
          nextBilling: format(addDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd'),
          paymentMethod: 'Credit Card',
          transactions: Array.from({ length: 3 }, (_, i) => ({
            id: `tx-${1000 + i}`,
            amount: Math.floor(Math.random() * 100) + 50,
            date: format(subDays(new Date(), 30 * (i + 1)), 'yyyy-MM-dd'),
            status: 'Completed',
          })),
        },
        content: {
          resumes: Math.floor(Math.random() * 5) + 1,
          coverLetters: Math.floor(Math.random() * 4) + 1,
          applications: Math.floor(Math.random() * 20) + 5,
          interviews: Math.floor(Math.random() * 8) + 2,
        },
        skills: {
          technical: Math.floor(Math.random() * 20) + 5,
          soft: Math.floor(Math.random() * 15) + 5,
          languages: Math.floor(Math.random() * 5) + 1,
        },
        feedback: {
          providedRating: Math.floor(Math.random() * 5) + 1,
          comments: Math.random() > 0.5 ? 'Great platform, very helpful for my job search!' : null,
        },
      };
      
      setSelectedUserData(userData);
    }
    
    setUserDetailsOpen(true);
  };
  
  // Handle download report
  const handleDownloadReport = () => {
    setDownloadingReport(true);
    
    // Simulate report generation
    setTimeout(() => {
      setDownloadingReport(false);
      setReportDialog(false);
      
      // Show success message
      alert('Report downloaded successfully!');
    }, 2000);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner />
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Insights
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
              <MenuItem value="1year">Last Year</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <CircularProgress size={24} /> : <Refresh />}
            </IconButton>
          </Tooltip>
          
          <Button 
            variant="outlined" 
            startIcon={<CloudDownload />}
            onClick={() => setReportDialog(true)}
          >
            Download Report
          </Button>
        </Box>
      </Box>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<Dashboard />} label="Overview" />
        <Tab icon={<PeopleAlt />} label="Users" />
        <Tab icon={<Assessment />} label="Content" />
        <Tab icon={<Storage />} label="Performance" />
        <Tab icon={<AttachMoney />} label="Revenue" />
      </Tabs>
      
      {/* Overview Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Active Users</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showRealTimeData}
                      onChange={(e) => setShowRealTimeData(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Real-time"
                />
              </Box>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label) => formatDate(label)}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="activeUsers" 
                    name="Active Users"
                    stroke={theme.palette.primary.main} 
                    fill={theme.palette.primary.light} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="newUsers" 
                    name="New Users"
                    stroke={theme.palette.secondary.main} 
                    fill={theme.palette.secondary.light} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                System Summary
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Group />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Total Users" 
                    secondary={userStatistics.total.toLocaleString()} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <WorkOutline />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Job Applications" 
                    secondary={contentStatistics.totalJobApplications.toLocaleString()} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Assessment />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Avg. Resume Score" 
                    secondary={`${contentStatistics.averageResumeScore}%`} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AccessTime />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Avg. Response Time" 
                    secondary={`${performanceMetrics.averageResponseTime} ms`} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Monthly Revenue" 
                    secondary={`$${revenueData.monthlyRecurringRevenue.toLocaleString()}`} 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Distribution
              </Typography>
              
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active', value: userStatistics.active },
                      { name: 'Inactive', value: userStatistics.inactive }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill={theme.palette.success.main} />
                    <Cell fill={theme.palette.grey[400]} />
                  </Pie>
                  <Legend />
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Device Usage
              </Typography>
              
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Popular Features
              </Typography>
              
              <Box sx={{ maxHeight: 250, overflow: 'auto' }}>
                <List dense>
                  {popularFeatures.slice(0, 5).map((feature, index) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={feature.name} 
                        secondary={`${feature.usage.toLocaleString()} users`} 
                      />
                      <Chip 
                        size="small" 
                        color="primary" 
                        label={`+${feature.growth}%`} 
                        icon={<TrendingUp />} 
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Geographic Distribution
              </Typography>
              
              <TableContainer sx={{ maxHeight: 250 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Country</TableCell>
                      <TableCell align="right">Users</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {geographicData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.country}</TableCell>
                        <TableCell align="right">{row.users.toLocaleString()}</TableCell>
                        <TableCell align="right">${row.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">System Health</Typography>
                <Chip 
                  label="All Systems Operational" 
                  color="success" 
                  icon={<CheckCircle />} 
                />
              </Box>
              
              <Grid container spacing={2}>
                {performanceMetrics.servicesStatus.map((service, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                    <Card variant="outlined">
                      <CardContent sx={{ pb: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {service.name}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={service.status.charAt(0).toUpperCase() + service.status.slice(1)} 
                          color={service.status === 'operational' ? 'success' : 'warning'} 
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="caption" display="block">
                          Uptime: {service.uptime}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* User Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Growth
              </Typography>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(tick) => format(new Date(tick), 'MMM d')}
                  />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="newUsers" 
                    name="New Users" 
                    stroke={theme.palette.primary.main} 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activeUsers" 
                    name="Active Users" 
                    stroke={theme.palette.success.main} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Statistics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {userStatistics.total.toLocaleString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Active Users
                  </Typography>
                  <Typography variant="h4">
                    {userStatistics.active.toLocaleString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Premium Users
                  </Typography>
                  <Typography variant="h4">
                    {userStatistics.premium.toLocaleString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Retention Rate
                  </Typography>
                  <Typography variant="h4">
                    {userStatistics.retentionRate}%
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Top Active Users
                </Typography>
                <Button 
                  size="small" 
                  startIcon={<CloudDownload />}
                  onClick={() => {
                    setReportOptions({...reportOptions, includeUserData: true});
                    setReportDialog(true);
                  }}
                >
                  Export
                </Button>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Sessions</TableCell>
                      <TableCell align="right">Last Active</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topUsers.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2 }}>
                              {user.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {user.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={user.status} 
                            color={user.status === 'Active' ? 'success' : 
                                  user.status === 'Idle' ? 'warning' : 'default'} 
                          />
                        </TableCell>
                        <TableCell align="right">{user.sessions}</TableCell>
                        <TableCell align="right">{user.lastActive}</TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedUserId(user.id);
                              setSelectedUserData(user);
                              setUserDetailsOpen(true);
                            }}
                          >
                            <Info fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Demographics
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Gender Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Male', value: parseFloat(userStatistics.genderDistribution.male) },
                          { name: 'Female', value: parseFloat(userStatistics.genderDistribution.female) },
                          { name: 'Other', value: parseFloat(userStatistics.genderDistribution.other) }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill={theme.palette.primary.main} />
                        <Cell fill={theme.palette.secondary.main} />
                        <Cell fill={theme.palette.info.main} />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Experience Level
                  </Typography>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={userStatistics.experienceDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {userStatistics.experienceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                User Engagement
              </Typography>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contentStatistics.engagementByFeature}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="users" name="Active Users" fill={theme.palette.primary.main} />
                  <Bar dataKey="engagementScore" name="Engagement Score" fill={theme.palette.secondary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Content Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Content Usage
              </Typography>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(tick) => format(new Date(tick), 'MMM d')}
                  />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => value.toLocaleString()} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="pageViews" 
                    name="Page Views" 
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.light} 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Most Popular Pages
              </Typography>
              
              <List dense>
                {contentStatistics.popularPages.map((page, index) => (
                  <ListItem key={index} divider={index < contentStatistics.popularPages.length - 1}>
                    <ListItemText 
                      primary={page.title} 
                      secondary={`${page.views.toLocaleString()} views`} 
                    />
                    <Chip 
                      size="small" 
                      label={`${page.bounceRate}% bounce`} 
                      color={page.bounceRate < 40 ? 'success' : page.bounceRate < 60 ? 'warning' : 'error'} 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Content Creation
              </Typography>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contentStatistics.contentCreation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                  <YAxis yAxisId="right" orientation="right" stroke={theme.palette.secondary.main} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" name="Total Count" fill={theme.palette.primary.main} />
                  <Bar yAxisId="right" dataKey="usageRate" name="Usage Rate (%)" fill={theme.palette.secondary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Content Performance
              </Typography>
              
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart outerRadius={90} data={contentStatistics.contentPerformance}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar 
                    name="Performance Score" 
                    dataKey="score" 
                    stroke={theme.palette.primary.main} 
                    fill={theme.palette.primary.main} 
                    fillOpacity={0.6} 
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Performance Tab */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Performance
              </Typography>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceMetrics.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(tick) => format(new Date(tick), 'HH:mm')}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                  <YAxis yAxisId="right" orientation="right" stroke={theme.palette.warning.main} />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="responseTime" 
                    name="Response Time (ms)" 
                    stroke={theme.palette.primary.main} 
                    activeDot={{ r: 8 }} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="errorRate" 
                    name="Error Rate (%)" 
                    stroke={theme.palette.warning.main} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                API Performance
              </Typography>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Endpoint</TableCell>
                      <TableCell align="right">Avg. Time (ms)</TableCell>
                      <TableCell align="right">Requests</TableCell>
                      <TableCell align="right">Error Rate</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {performanceMetrics.apiPerformance.map((api, index) => (
                      <TableRow key={index}>
                        <TableCell>{api.endpoint}</TableCell>
                        <TableCell align="right">
                          <Typography
                            component="span"
                            color={api.responseTime < 200 ? 'success.main' : 
                                  api.responseTime < 500 ? 'warning.main' : 'error.main'}
                          >
                            {api.responseTime}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{api.requests.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Typography
                            component="span"
                            color={api.errorRate < 1 ? 'success.main' : 
                                  api.errorRate < 5 ? 'warning.main' : 'error.main'}
                          >
                            {api.errorRate}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Error Logs
              </Typography>
              
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {errorLogs.map((log, index) => (
                  <ListItem key={index} divider={index < errorLogs.length - 1}>
                    <ListItemIcon>
                      {log.level === 'error' ? (
                        <ErrorIcon color="error" />
                      ) : log.level === 'warning' ? (
                        <Warning color="warning" />
                      ) : (
                        <Info color="info" />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={log.message} 
                      secondary={
                        <>
                          <Typography variant="caption" component="span">{log.source} - </Typography>
                          <Typography variant="caption" component="span">{log.timestamp}</Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Revenue Tab */}
      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Revenue Trends
              </Typography>
              
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={revenueData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke={theme.palette.primary.main} />
                  <YAxis yAxisId="right" orientation="right" stroke={theme.palette.success.main} />
                  <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="revenue" 
                    name="Monthly Revenue" 
                    fill={theme.palette.primary.main} 
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="cumulativeRevenue" 
                    name="Cumulative Revenue" 
                    stroke={theme.palette.success.main} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Revenue Metrics
              </Typography>
              
              <List>
                <ListItem divider>
                  <ListItemText primary="Monthly Recurring Revenue" />
                  <Typography variant="h6" color="primary">
                    ${revenueData.monthlyRecurringRevenue.toLocaleString()}
                  </Typography>
                </ListItem>
                
                <ListItem divider>
                  <ListItemText primary="Annual Recurring Revenue" />
                  <Typography variant="h6" color="primary">
                    ${revenueData.annualRecurringRevenue.toLocaleString()}
                  </Typography>
                </ListItem>
                
                <ListItem divider>
                  <ListItemText primary="Average Revenue Per User" />
                  <Typography variant="h6" color="primary">
                    ${revenueData.averageRevenuePerUser.toFixed(2)}
                  </Typography>
                </ListItem>
                
                <ListItem>
                  <ListItemText primary="Churn Rate" />
                  <Typography 
                    variant="h6" 
                    color={revenueData.churnRate < 3 ? 'success.main' : 
                          revenueData.churnRate < 8 ? 'warning.main' : 'error.main'}
                  >
                    {revenueData.churnRate}%
                  </Typography>
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Revenue by Subscription Type
              </Typography>
              
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueData.revenueBySubscriptionType}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {revenueData.revenueBySubscriptionType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Conversion Funnel
              </Typography>
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={revenueData.conversionFunnel}
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <RechartsTooltip formatter={(value) => value.toLocaleString()} />
                  <Bar dataKey="value" fill={theme.palette.primary.main}>
                    {revenueData.conversionFunnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* User Details Dialog */}
      <Dialog
        open={userDetailsOpen}
        onClose={() => setUserDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedUserData && (
          <>
            <DialogTitle>
              User Details: {selectedUserData.name}
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Basic Information
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Email" secondary={selectedUserData.email} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Status" secondary={selectedUserData.status} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Joined" secondary={selectedUserData.joined} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Last Active" secondary={selectedUserData.lastActive} />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Subscription" 
                        secondary={selectedUserData.subscription || 'Free Plan'} 
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Activity Statistics
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Total Sessions" secondary={selectedUserData.sessions} />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Average Session Duration" 
                        secondary={`${selectedUserData.avgSessionTime} minutes`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Generated Documents" secondary={selectedUserData.documentsGenerated} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Completed Assessments" secondary={selectedUserData.assessmentsCompleted} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Feature Usage" secondary={selectedUserData.featuresUsed} />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Usage Timeline
                  </Typography>
                  
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={selectedUserData.usageHistory || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Area type="monotone" dataKey="activity" stroke={theme.palette.primary.main} fill={theme.palette.primary.light} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUserDetailsOpen(false)}>
                Close
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  navigate(`/admin/users/${selectedUserId}`);
                  setUserDetailsOpen(false);
                }}
              >
                View Full Profile
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Report Dialog */}
      <Dialog
        open={reportDialog}
        onClose={() => setReportDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Generate Admin Report
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" gutterBottom>
            Select report content and format:
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={reportOptions.includeUserData}
                onChange={(e) => setReportOptions({...reportOptions, includeUserData: e.target.checked})}
              />
            }
            label="Include User Statistics"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={reportOptions.includeContentStats}
                onChange={(e) => setReportOptions({...reportOptions, includeContentStats: e.target.checked})}
              />
            }
            label="Include Content Statistics"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={reportOptions.includeRevenue}
                onChange={(e) => setReportOptions({...reportOptions, includeRevenue: e.target.checked})}
              />
            }
            label="Include Revenue Data"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="report-format-label">Report Format</InputLabel>
            <Select
              labelId="report-format-label"
              value={reportOptions.format}
              onChange={(e) => setReportOptions({...reportOptions, format: e.target.value})}
              label="Report Format"
            >
              <MenuItem value="pdf">PDF Document</MenuItem>
              <MenuItem value="excel">Excel Spreadsheet</MenuItem>
              <MenuItem value="csv">CSV Files (Zipped)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={downloadingReport ? <CircularProgress size={20} /> : <CloudDownload />}
            disabled={downloadingReport}
            onClick={handleGenerateReport}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminInsights; 