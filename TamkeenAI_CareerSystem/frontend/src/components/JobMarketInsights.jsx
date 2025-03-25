import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  TextField,
  Autocomplete,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import CodeIcon from '@mui/icons-material/Code';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#F44336', '#3F51B5', '#E91E63', '#9C27B0'];

const JobMarketInsights = ({
  jobData,
  salaryData,
  skillsData,
  locationData,
  industryData,
  trendData,
  loading = false,
  error = null,
  onRefresh,
  onFilterChange,
  jobTitle = '',
  location = ''
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedJobTitle, setSelectedJobTitle] = useState(jobTitle);
  const [selectedLocation, setSelectedLocation] = useState(location);
  const [selectedTimeframe, setSelectedTimeframe] = useState('12months');
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Apply filters when user clicks apply button
  const handleApplyFilters = () => {
    if (onFilterChange) {
      onFilterChange({
        jobTitle: selectedJobTitle,
        location: selectedLocation,
        timeframe: selectedTimeframe
      });
    }
    setFiltersApplied(true);
    setIsFiltersOpen(false);
  };

  // Reset filters to default values
  const handleResetFilters = () => {
    setSelectedJobTitle('');
    setSelectedLocation('');
    setSelectedTimeframe('12months');
    if (onFilterChange) {
      onFilterChange({
        jobTitle: '',
        location: '',
        timeframe: '12months'
      });
    }
    setFiltersApplied(false);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Format large numbers for better readability
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get trend icon based on percentage
  const getTrendIcon = (percentage) => {
    if (percentage > 0) {
      return <TrendingUpIcon color="success" />;
    } else if (percentage < 0) {
      return <TrendingDownIcon color="error" />;
    }
    return <TrendingFlatIcon color="action" />;
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography color="error" variant="h6" gutterBottom>
          Error loading job market data
        </Typography>
        <Typography color="text.secondary">
          {error}
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          variant="outlined" 
          sx={{ mt: 2 }}
          onClick={onRefresh}
        >
          Retry
        </Button>
      </Paper>
    );
  }

  // Render when no data is available
  if (!jobData || !salaryData || !skillsData || !locationData || !industryData) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No job market data available
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          variant="outlined" 
          sx={{ mt: 2 }}
          onClick={onRefresh}
        >
          Load Data
        </Button>
      </Paper>
    );
  }

  // Render job market overview
  const renderJobMarketOverview = () => (
    <Grid container spacing={3}>
      {/* Job Growth Summary */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <WorkIcon color="primary" sx={{ mr: 1 }} />
              Job Growth Trends
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData.growth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => formatNumber(value) + ' jobs'} />
                  <Legend />
                  <Line type="monotone" dataKey="jobs" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Salary Trends */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
              Salary Trends
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salaryData.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="median" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Median Salary" />
                  <Area type="monotone" dataKey="entry" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Entry Level" />
                  <Area type="monotone" dataKey="senior" stroke="#ffc658" fill="#ffc658" fillOpacity={0.3} name="Senior Level" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Top In-Demand Skills */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CodeIcon color="primary" sx={{ mr: 1 }} />
              Top In-Demand Skills
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsData.topSkills} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <RechartsTooltip formatter={(value) => `${value}% of job listings`} />
                  <Legend />
                  <Bar dataKey="percentage" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Industry Growth by Sector */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon color="primary" sx={{ mr: 1 }} />
              Industry Growth by Sector
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={industryData.sectorGrowth}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {industryData.sectorGrowth.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `${value} jobs`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Key Statistics */}
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <EqualizerIcon color="primary" sx={{ mr: 1 }} />
              Key Statistics
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {formatNumber(jobData.totalJobs)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Jobs
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {formatCurrency(salaryData.averageSalary)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Salary
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" color={jobData.growthRate > 0 ? 'success.main' : 'error.main'}>
                      {jobData.growthRate > 0 ? '+' : ''}{jobData.growthRate}%
                    </Typography>
                    {getTrendIcon(jobData.growthRate)}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Annual Growth Rate
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {jobData.timeToFill}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Days to Fill
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render salary insights tab
  const renderSalaryInsights = () => (
    <Grid container spacing={3}>
      {/* Salary Range by Experience */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
              Salary Range by Experience
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData.byExperience}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="level" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="min" fill="#8884d8" name="Minimum" />
                  <Bar dataKey="median" fill="#82ca9d" name="Median" />
                  <Bar dataKey="max" fill="#ffc658" name="Maximum" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Salary Comparison by Location */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon color="primary" sx={{ mr: 1 }} />
              Salary Comparison by Location
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData.salaryComparison} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis dataKey="location" type="category" width={100} />
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="salary" fill="#82ca9d" name="Median Salary" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Salary Growth Over Time */}
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              Salary Growth Projection (5 Years)
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salaryData.projections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="salary" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render skills analysis tab
  const renderSkillsAnalysis = () => (
    <Grid container spacing={3}>
      {/* Skills Demand Trend */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              Skills Demand Trends
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={skillsData.demandTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => `${value}% of job listings`} />
                  <Legend />
                  {skillsData.demandTrend[0] && Object.keys(skillsData.demandTrend[0])
                    .filter(key => key !== 'date')
                    .map((skill, index) => (
                      <Line 
                        key={skill}
                        type="monotone" 
                        dataKey={skill} 
                        stroke={COLORS[index % COLORS.length]} 
                        activeDot={{ r: 8 }} 
                      />
                    ))
                  }
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Skills Value */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
              Skills Salary Impact
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillsData.salaryPremium}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="skill" />
                  <YAxis tickFormatter={(value) => `+${value}%`} />
                  <RechartsTooltip formatter={(value) => `+${value}% salary premium`} />
                  <Legend />
                  <Bar dataKey="premium" fill="#82ca9d" name="Salary Premium %" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Emerging Skills */}
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              Emerging Skills (Fastest Growing)
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {skillsData.emerging.map((skill, index) => (
                <Grid item key={index}>
                  <Chip
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2">{skill.name}</Typography>
                        <Typography variant="body2" color="success.main" sx={{ ml: 1 }}>
                          +{skill.growth}%
                        </Typography>
                      </Box>
                    }
                    color={index < 3 ? "primary" : "default"}
                    variant={index < 3 ? "filled" : "outlined"}
                  />
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render location insights tab
  const renderLocationInsights = () => (
    <Grid container spacing={3}>
      {/* Job Distribution by Location */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon color="primary" sx={{ mr: 1 }} />
              Job Distribution by Location
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationData.jobDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {locationData.jobDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `${formatNumber(value)} jobs`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Remote Work Trends */}
      <Grid item xs={12} md={6}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <WorkIcon color="primary" sx={{ mr: 1 }} />
              Remote Work Trends
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={locationData.remoteWorkTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <RechartsTooltip formatter={(value) => `${value}% of jobs`} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3} 
                    name="Remote Jobs" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Job Growth by Location */}
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
              Job Growth Rate by Location
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData.growthRate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <RechartsTooltip formatter={(value) => `${value}% annual growth`} />
                  <Legend />
                  <Bar dataKey="growth" fill="#82ca9d" name="Annual Growth Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Job Market Insights
          {selectedJobTitle && ` for ${selectedJobTitle}`}
          {selectedLocation && ` in ${selectedLocation}`}
        </Typography>
        <Box>
          <Button
            startIcon={<FilterListIcon />}
            variant="outlined"
            size="small"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            sx={{ mr: 1 }}
          >
            Filters
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            variant="outlined"
            size="small"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Filters Section */}
      {isFiltersOpen && (
        <Box sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Job Title"
                value={selectedJobTitle}
                onChange={(e) => setSelectedJobTitle(e.target.value)}
                variant="outlined"
                size="small"
                placeholder="e.g. Software Engineer"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                variant="outlined"
                size="small"
                placeholder="e.g. San Francisco"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Frame</InputLabel>
                <Select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  label="Time Frame"
                >
                  <MenuItem value="3months">Last 3 Months</MenuItem>
                  <MenuItem value="6months">Last 6 Months</MenuItem>
                  <MenuItem value="12months">Last 12 Months</MenuItem>
                  <MenuItem value="24months">Last 24 Months</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button size="small" onClick={handleResetFilters}>
              Reset
            </Button>
            <Button variant="contained" size="small" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </Box>
        </Box>
      )}

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Salary Insights" />
        <Tab label="Skills Analysis" />
        <Tab label="Location Trends" />
      </Tabs>

      {activeTab === 0 && renderJobMarketOverview()}
      {activeTab === 1 && renderSalaryInsights()}
      {activeTab === 2 && renderSkillsAnalysis()}
      {activeTab === 3 && renderLocationInsights()}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          startIcon={<DownloadIcon />}
          variant="outlined"
          size="small"
        >
          Download Report
        </Button>
      </Box>
    </Paper>
  );
};

export default JobMarketInsights; 