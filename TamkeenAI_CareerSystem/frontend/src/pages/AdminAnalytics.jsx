import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Grid, Card, CardContent, CardHeader, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tooltip, CircularProgress, Alert, Chip, Avatar, Badge,
  Tabs, Tab, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Dashboard, People, Assessment, Refresh, CloudDownload,
  FilterList, TrendingUp, TrendingDown, School, Work,
  BarChart, PieChart, Timeline, StarBorder, Star,
  VerifiedUser, CheckCircle, EmojiEvents, PersonAdd
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import { useToast } from '../contexts/ToastContext';

// Nivo charts
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [activeTab, setActiveTab] = useState(0);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    newToday: 0,
    newThisWeek: 0,
    newThisMonth: 0,
    growth: 0,
    signupsByDay: []
  });
  const [resumeStats, setResumeStats] = useState({
    totalResumes: 0,
    avgScore: 0,
    highestScore: 0,
    lowestScore: 0,
    scoreDistribution: [],
    scoreByTime: []
  });
  const [skillGapData, setSkillGapData] = useState({
    data: [],
    industries: [],
    skills: []
  });
  const [leaderboard, setLeaderboard] = useState([]);
  
  const navigate = useNavigate();
  const { profile } = useUser();
  const { showToast } = useToast();
  
  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      setError('Authentication required. Please log in.');
      return;
    }
    
    if (!profile.isAdmin) {
      setLoading(false);
      setError('Admin access required. You do not have permission to view this page.');
      navigate('/dashboard');
      return;
    }
    
    loadData();
  }, [profile, navigate]);
  
  useEffect(() => {
    if (profile?.isAdmin) {
      loadData();
    }
  }, [timeRange]);
  
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the API endpoint to get analytics dashboard data
      const response = await apiEndpoints.admin.getAnalyticsDashboard({
        timeRange: timeRange
      });
      
      const data = response.data.data;
      
      // Update state with the retrieved data
      setUserStats(data.userStats);
      setResumeStats(data.resumeStats);
      setSkillGapData(data.skillGapData);
      setLeaderboard(data.leaderboard);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading admin analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
      setLoading(false);
      
      // For development: generate mock data if API fails
      generateMockData();
    }
  };
  
  const generateMockData = () => {
    // Generate user statistics
    const today = new Date();
    const dates = [];
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(format(date, 'yyyy-MM-dd'));
    }
    
    const totalUsers = 1500 + Math.floor(Math.random() * 1000);
    const activeUsers = Math.floor(totalUsers * 0.75);
    const newToday = 15 + Math.floor(Math.random() * 30);
    const newThisWeek = 80 + Math.floor(Math.random() * 120);
    const newThisMonth = 300 + Math.floor(Math.random() * 200);
    const lastMonthUsers = totalUsers - newThisMonth;
    const growth = ((totalUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1);
    
    const signupsByDay = dates.map(date => {
      const dayOfWeek = new Date(date).getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const signups = isWeekend ? 
        Math.floor(Math.random() * 15) + 5 : 
        Math.floor(Math.random() * 25) + 10;
      
      return {
        date,
        signups
      };
    });
    
    setUserStats({
      total: totalUsers,
      active: activeUsers,
      newToday,
      newThisWeek,
      newThisMonth,
      growth,
      signupsByDay
    });
    
    // Generate resume statistics
    const totalResumes = totalUsers * 1.2;
    const avgScore = 72 + Math.floor(Math.random() * 10);
    const highestScore = 98;
    const lowestScore = 35;
    
    const scoreDistribution = [
      { score: '90-100', count: Math.floor(totalResumes * 0.1) },
      { score: '80-89', count: Math.floor(totalResumes * 0.25) },
      { score: '70-79', count: Math.floor(totalResumes * 0.35) },
      { score: '60-69', count: Math.floor(totalResumes * 0.15) },
      { score: '50-59', count: Math.floor(totalResumes * 0.1) },
      { score: '0-49', count: Math.floor(totalResumes * 0.05) }
    ];
    
    const scoreByTime = dates.map(date => {
      return {
        date,
        avgScore: (avgScore - 5 + Math.random() * 10).toFixed(1)
      };
    });
    
    setResumeStats({
      totalResumes,
      avgScore,
      highestScore,
      lowestScore,
      scoreDistribution,
      scoreByTime
    });
    
    // Generate skill gap data
    const industries = [
      'Technology',
      'Finance',
      'Healthcare',
      'Marketing',
      'Engineering'
    ];
    
    const skills = [
      'Programming',
      'Data Analysis',
      'Communication',
      'Leadership',
      'Problem Solving',
      'Design',
      'Project Management'
    ];
    
    const skillGapMatrix = [];
    
    industries.forEach(industry => {
      const skillData = {};
      skillData.industry = industry;
      
      skills.forEach(skill => {
        // Random value between 0-100 representing the skill gap percentage
        skillData[skill] = Math.floor(Math.random() * 90) + 10;
      });
      
      skillGapMatrix.push(skillData);
    });
    
    setSkillGapData({
      data: skillGapMatrix,
      industries,
      skills
    });
    
    // Generate leaderboard data
    const leaderboardData = [];
    
    for (let i = 0; i < 10; i++) {
      const score = 95 - i * 3 + Math.floor(Math.random() * 5);
      leaderboardData.push({
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        score,
        badges: Math.floor(Math.random() * 6),
        completedProfiles: Math.floor(Math.random() * 5) + 1,
        dateJoined: format(new Date(today.getFullYear(), today.getMonth() - Math.floor(Math.random() * 6), today.getDate() - Math.floor(Math.random() * 28)), 'yyyy-MM-dd')
      });
    }
    
    setLeaderboard(leaderboardData);
  };
  
  const handleRefresh = () => {
    loadData();
    showToast({
      message: 'Analytics data refreshed',
      severity: 'success'
    });
  };
  
  const handleDownloadReport = () => {
    showToast({
      message: 'Analytics report is being generated and will download shortly',
      severity: 'info'
    });
    
    // In a real app, this would trigger a report download
    setTimeout(() => {
      showToast({
        message: 'Analytics report downloaded successfully',
        severity: 'success'
      });
    }, 2000);
  };
  
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const renderUserStatistics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={8}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">User Registrations Over Time</Typography>
          </Box>
          <Box sx={{ height: 300 }}>
            <ResponsiveLine
              data={[
                {
                  id: 'signups',
                  color: 'hsl(211, 70%, 50%)',
                  data: userStats.signupsByDay.map(day => ({
                    x: day.date,
                    y: day.signups
                  }))
                }
              ]}
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 0, max: 'auto' }}
              curve="monotoneX"
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Date',
                legendOffset: 40,
                legendPosition: 'middle',
                format: (value) => {
                  const date = new Date(value);
                  return format(date, 'MMM d');
                }
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'New Users',
                legendOffset: -50,
                legendPosition: 'middle'
              }}
              pointSize={10}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabelYOffset={-12}
              useMesh={true}
              enableGridX={false}
              enableArea={true}
              areaOpacity={0.15}
            />
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} lg={4}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="h4" component="div" fontWeight="bold">
                    {userStats.total.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Registered Users
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto' }}>
                  <Chip 
                    color={parseFloat(userStats.growth) > 0 ? 'success' : 'error'}
                    icon={parseFloat(userStats.growth) > 0 ? <TrendingUp /> : <TrendingDown />}
                    label={`${userStats.growth}%`}
                  />
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{userStats.newToday}</Typography>
                    <Typography variant="body2" color="text.secondary">Today</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{userStats.newThisWeek}</Typography>
                    <Typography variant="body2" color="text.secondary">This Week</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{userStats.newThisMonth}</Typography>
                    <Typography variant="body2" color="text.secondary">This Month</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Active vs Inactive Users</Typography>
              <Box sx={{ height: 200 }}>
                <ResponsivePie
                  data={[
                    {
                      id: 'Active',
                      label: 'Active',
                      value: userStats.active,
                      color: 'hsl(120, 70%, 50%)'
                    },
                    {
                      id: 'Inactive',
                      label: 'Inactive',
                      value: userStats.total - userStats.active,
                      color: 'hsl(0, 70%, 50%)'
                    }
                  ]}
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={{ scheme: 'set2' }}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="#333333"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 40,
                      itemsSpacing: 0,
                      itemWidth: 100,
                      itemHeight: 18,
                      itemTextColor: '#999',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 18,
                      symbolShape: 'circle'
                    }
                  ]}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
  
  const renderResumeAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
              <Assessment />
            </Avatar>
            <Box>
              <Typography variant="h4" component="div" fontWeight="bold">
                {resumeStats.avgScore}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Resume Score
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box>
                <Typography variant="body2" color="text.secondary">Highest Score</Typography>
                <Typography variant="h6" color="success.main">{resumeStats.highestScore}%</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box>
                <Typography variant="body2" color="text.secondary">Lowest Score</Typography>
                <Typography variant="h6" color="error.main">{resumeStats.lowestScore}%</Typography>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Resumes Analyzed
            </Typography>
            <Typography variant="h6">
              {Math.round(resumeStats.totalResumes).toLocaleString()}
            </Typography>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Average Resume Score Trend</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveLine
              data={[
                {
                  id: 'avgScore',
                  color: 'hsl(291, 70%, 50%)',
                  data: resumeStats.scoreByTime.map(item => ({
                    x: item.date,
                    y: item.avgScore
                  }))
                }
              ]}
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 50, max: 90 }}
              curve="monotoneX"
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Date',
                legendOffset: 40,
                legendPosition: 'middle',
                format: (value) => {
                  const date = new Date(value);
                  return format(date, 'MMM d');
                }
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Score (%)',
                legendOffset: -50,
                legendPosition: 'middle'
              }}
              colors={{ scheme: 'category10' }}
              pointSize={10}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabelYOffset={-12}
              useMesh={true}
              gridYValues={[60, 70, 80, 90]}
              enableSlices="x"
            />
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Resume Score Distribution</Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveBar
              data={resumeStats.scoreDistribution}
              keys={['count']}
              indexBy="score"
              margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
              padding={0.3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={{ scheme: 'blues' }}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Score Range',
                legendPosition: 'middle',
                legendOffset: 32
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Count',
                legendPosition: 'middle',
                legendOffset: -40
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
              animate={true}
              motionStiffness={90}
              motionDamping={15}
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
  
  const renderSkillGapAnalysis = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Industry-Skill Gap Heatmap</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This heatmap shows the skill gap percentage across different industries (higher values indicate larger gaps)
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveHeatMap
              data={skillGapData.data}
              keys={skillGapData.skills}
              indexBy="industry"
              margin={{ top: 30, right: 60, bottom: 60, left: 90 }}
              forceSquare
              axisTop={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: '',
                legendOffset: 36
              }}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: 'Skills',
                legendPosition: 'middle',
                legendOffset: 36
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Industries',
                legendPosition: 'middle',
                legendOffset: -72
              }}
              colors={{
                type: 'sequential',
                scheme: 'purples',
                minValue: 0,
                maxValue: 100
              }}
              emptyColor="#555555"
              borderColor={{ from: 'color', modifiers: [['darker', 0.6]] }}
              borderWidth={1}
              enableLabels
              labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
              legends={[
                {
                  anchor: 'right',
                  translateX: 40,
                  translateY: 0,
                  length: 300,
                  thickness: 10,
                  direction: 'column',
                  tickPosition: 'after',
                  tickSize: 3,
                  tickSpacing: 4,
                  tickOverlap: false,
                  tickFormat: '>-.0f%',
                  title: 'Skill Gap %',
                  titleAlign: 'start',
                  titleOffset: 4
                }
              ]}
              annotations={[]}
            />
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
  
  const renderLeaderboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Top Performers Leaderboard
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Resume Score</TableCell>
                  <TableCell>Badges</TableCell>
                  <TableCell>Profiles Completed</TableCell>
                  <TableCell>Member Since</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaderboard.map((user, index) => (
                  <TableRow 
                    key={user.id}
                    sx={{ 
                      bgcolor: index < 3 ? 'rgba(255, 215, 0, 0.1)' : 'inherit',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {index === 0 ? (
                          <EmojiEvents sx={{ color: 'gold', mr: 1 }} />
                        ) : index === 1 ? (
                          <EmojiEvents sx={{ color: 'silver', mr: 1 }} />
                        ) : index === 2 ? (
                          <EmojiEvents sx={{ color: '#cd7f32', mr: 1 }} />
                        ) : (
                          <Typography sx={{ ml: 4 }}>{index + 1}</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Typography>{user.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${user.score}%`}
                        color={
                          user.score >= 90 ? 'success' :
                          user.score >= 70 ? 'primary' :
                          user.score >= 50 ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {Array.from({ length: user.badges }).map((_, i) => (
                          <Star key={i} sx={{ color: 'gold', fontSize: 20 }} />
                        ))}
                        {Array.from({ length: 5 - user.badges }).map((_, i) => (
                          <StarBorder key={i} sx={{ color: 'text.disabled', fontSize: 20 }} />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>{user.completedProfiles}</TableCell>
                    <TableCell>{format(new Date(user.dateJoined), 'MMM dd, yyyy')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner message="Loading analytics data..." />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
        >
          Return to Dashboard
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Admin Analytics
        </Typography>
        
        <Box>
          <FormControl sx={{ mr: 2, minWidth: 120 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
              size="small"
            >
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} sx={{ mr: 1 }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Download Report">
            <IconButton onClick={handleDownloadReport}>
              <CloudDownload />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<People />} label="User Statistics" iconPosition="start" />
          <Tab icon={<Assessment />} label="Resume Analytics" iconPosition="start" />
          <Tab icon={<BarChart />} label="Skill Gap Analysis" iconPosition="start" />
          <Tab icon={<EmojiEvents />} label="Leaderboard" iconPosition="start" />
        </Tabs>
      </Paper>
      
      <Box sx={{ mt: 3 }}>
        {activeTab === 0 && renderUserStatistics()}
        {activeTab === 1 && renderResumeAnalytics()}
        {activeTab === 2 && renderSkillGapAnalysis()}
        {activeTab === 3 && renderLeaderboard()}
      </Box>
    </Box>
  );
};

export default AdminAnalytics; 