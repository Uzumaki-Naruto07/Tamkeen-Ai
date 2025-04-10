import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Grid, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useTranslation } from 'react-i18next';

const MarketInsightsSection = ({ marketInsights, insights }) => {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState('salary');
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  // Make sure we have valid data to work with
  const safeInsights = marketInsights || insights || {};
  
  const { 
    salary_data = {}, 
    regional_demand = [], 
    skill_demand = [], 
    industry_trends = {
      growing_sectors: [],
      emerging_roles: [],
      key_trends: []
    }, 
    personalized_insights = {
      market_position: { percentile: 0, explanation: '' },
      suggestions: [],
      salary_potential: { low: 0, high: 0, median: 0, factors: [] }
    }, 
    // New data we'll expect from the backend
    skill_trends = [], 
    hiring_companies = [],
    declining_skills = []
  } = safeInsights;
  
  // Format salary data for chart - handle both object and array formats
  let salaryChartData = [];
  
  if (Array.isArray(salary_data)) {
    // Handle array format
    salaryChartData = salary_data.map(item => ({
      name: item.role,
      median: item.median,
      low: item.range_low,
      high: item.range_high
    }));
  } else if (salary_data && typeof salary_data === 'object') {
    // Handle object format from mock data
    // Transform current_role and target_role data into array format for the chart
    salaryChartData = [
      {
        name: 'Current Role',
        median: salary_data.current_role?.avg || 0,
        low: salary_data.current_role?.min || 0,
        high: salary_data.current_role?.max || 0
      },
      {
        name: 'Target Role',
        median: salary_data.target_role?.avg || 0,
        low: salary_data.target_role?.min || 0,
        high: salary_data.target_role?.max || 0
      }
    ];
  }
  
  // Format region data for chart - ensure regional_demand is an array
  const regionChartData = Array.isArray(regional_demand) 
    ? regional_demand.slice(0, 5).map(item => ({
        name: item.region,
        value: item.demand_index
      }))
    : [];
  
  // Format skill data for chart - ensure skill_demand is an array
  const skillChartData = Array.isArray(skill_demand) 
    ? skill_demand.map(item => ({
        name: item.skill,
        value: item.demand_index,
        growth: item.growth_rate
      }))
    : [];
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Format skill trends data for line chart
  const skillTrendChartData = [];
  if (Array.isArray(skill_trends) && skill_trends.length > 0 && skill_trends[0]?.forecast) {
    // Transform the data into the format needed for the line chart
    // Each time period is an entry with values for each skill
    const timePoints = skill_trends[0].forecast.map(f => f.period);
    
    timePoints.forEach((period, i) => {
      const dataPoint = { period };
      skill_trends.forEach(skill => {
        dataPoint[skill.name] = skill.forecast[i].openings;
      });
      skillTrendChartData.push(dataPoint);
    });
  }
  
  // Define colors for different skills in the trend chart
  const SKILL_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];
  
  const renderSalaryTab = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Salary Ranges by Role</Typography>
      <Box sx={{ height: 300, mb: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={salaryChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Bar dataKey="median" fill="#8884d8" name="Median Salary" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Role</TableCell>
              <TableCell align="right">Median</TableCell>
              <TableCell align="right">Range</TableCell>
              <TableCell align="right">Experience Impact</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salaryChartData.map((row, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">{row.name}</TableCell>
                <TableCell align="right">${row.median.toLocaleString()}</TableCell>
                <TableCell align="right">${row.low.toLocaleString()} - ${row.high.toLocaleString()}</TableCell>
                <TableCell align="right">+5% per year</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
  
  const renderRegionTab = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Regional Demand</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {regionChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toFixed(1)} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Region</TableCell>
                  <TableCell align="right">Demand Index</TableCell>
                  <TableCell align="right">Growth Rate</TableCell>
                  <TableCell align="right">Job Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {regional_demand.map((row) => (
                  <TableRow key={row.region}>
                    <TableCell component="th" scope="row">{row.region}</TableCell>
                    <TableCell align="right">{row.demand_index.toFixed(1)}/10</TableCell>
                    <TableCell align="right">{row.growth_rate}%</TableCell>
                    <TableCell align="right">{row.job_count.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
  
  const renderSkillTab = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Skills in Demand</Typography>
      <Box sx={{ height: 300, mb: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={skillChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" name="Demand Index" fill="#00C49F" />
            <Bar dataKey="growth" name="Growth Rate %" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Skill</TableCell>
              <TableCell align="right">Demand Index</TableCell>
              <TableCell align="right">Growth Rate</TableCell>
              <TableCell align="right">Job Frequency</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {skill_demand.map((row) => (
              <TableRow key={row.skill}>
                <TableCell component="th" scope="row">{row.skill}</TableCell>
                <TableCell align="right">{row.demand_index.toFixed(1)}/10</TableCell>
                <TableCell align="right">{row.growth_rate}%</TableCell>
                <TableCell align="right">{(row.job_frequency * 100).toFixed(0)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
  
  const renderTrendsTab = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Industry Trends</Typography>
      
      {!industry_trends || !industry_trends.growing_sectors ? (
        <Alert severity="info" sx={{ mb: 2 }}>Industry trends data is not available</Alert>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Growing Sectors</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {industry_trends.growing_sectors.map((sector, index) => (
                <Chip key={index} label={sector} color="success" />
              ))}
            </Box>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>Emerging Roles</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {industry_trends.emerging_roles.map((role, index) => (
                <Chip key={index} label={role} color="primary" />
              ))}
            </Box>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 1 }}>Key Trends</Typography>
          {industry_trends.key_trends.map((trend, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="subtitle2">{trend.trend}</Typography>
                <Chip 
                  label={`Impact: ${trend.impact_score}/10`} 
                  size="small" 
                  color={trend.impact_score > 8 ? "warning" : "primary"} 
                />
              </Box>
              <Typography variant="body2">{trend.description}</Typography>
            </Box>
          ))}
        </>
      )}
    </Box>
  );
  
  const renderTrendPredictionTab = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Job Openings Forecast by Skill</Typography>
      <Box sx={{ height: 300, mb: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={skillTrendChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            {skill_trends.map((skill, index) => (
              <Line 
                key={skill.name}
                type="monotone" 
                dataKey={skill.name} 
                stroke={SKILL_COLORS[index % SKILL_COLORS.length]} 
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Skill</TableCell>
                  <TableCell align="right">Current</TableCell>
                  <TableCell align="right">3 Months</TableCell>
                  <TableCell align="right">6 Months</TableCell>
                  <TableCell align="right">1 Year</TableCell>
                  <TableCell align="right">Trend</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {skill_trends.map((skill) => (
                  <TableRow key={skill.name}>
                    <TableCell component="th" scope="row">{skill.name}</TableCell>
                    <TableCell align="right">{skill.forecast[0].openings.toLocaleString()}</TableCell>
                    <TableCell align="right">{skill.forecast[1].openings.toLocaleString()}</TableCell>
                    <TableCell align="right">{skill.forecast[2].openings.toLocaleString()}</TableCell>
                    <TableCell align="right">{skill.forecast[3].openings.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      {skill.growth_rate > 0 ? (
                        <Chip 
                          icon={<TrendingUpIcon />} 
                          label={`+${skill.growth_rate}%`} 
                          size="small" 
                          color="success" 
                        />
                      ) : (
                        <Chip 
                          icon={<TrendingDownIcon />} 
                          label={`${skill.growth_rate}%`} 
                          size="small" 
                          color="warning" 
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Trend Analysis</Typography>
            <List dense>
              {skill_trends.slice(0, 3).map((skill) => (
                <ListItem key={skill.name}>
                  <ListItemText 
                    primary={skill.name} 
                    secondary={skill.analysis} 
                  />
                </ListItem>
              ))}
            </List>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.75rem' }}>
              * Forecasts based on current market data and industry trends
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
  
  const renderYourInsightsTab = () => (
    <Box>
      <Typography variant="subtitle2" gutterBottom>Your Market Position</Typography>
      
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body1">Market Positioning</Typography>
          <Chip 
            label={`${personalized_insights.market_position.percentile}th percentile`} 
            color="primary" 
          />
        </Box>
        <Typography variant="body2">
          {personalized_insights.market_position.explanation}
        </Typography>
      </Box>
      
      <Typography variant="subtitle2" gutterBottom>Personalized Suggestions</Typography>
      <Box sx={{ mb: 3 }}>
        {personalized_insights.suggestions.map((suggestion, index) => (
          <Box key={index} sx={{ mb: 1, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="body2">{suggestion}</Typography>
          </Box>
        ))}
      </Box>
      
      <Typography variant="subtitle2" gutterBottom>Your Salary Potential</Typography>
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="body1" gutterBottom>
          Range: ${personalized_insights.salary_potential.low.toLocaleString()} - ${personalized_insights.salary_potential.high.toLocaleString()}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>Median: ${personalized_insights.salary_potential.median.toLocaleString()}</Typography>
        
        <Typography variant="body2" sx={{ mb: 0.5 }}>Key Factors:</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {personalized_insights.salary_potential.factors.map((factor, index) => (
            <Chip key={index} label={factor} size="small" variant="outlined" />
          ))}
        </Box>
      </Box>
      
      {personalized_insights.ai_generated && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>AI-Generated Insights</Typography>
          <Box sx={{ p: 2, bgcolor: '#f0f7ff', borderRadius: 1 }}>
            <Typography variant="body2">{personalized_insights.ai_generated}</Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
  
  // Companies Hiring Now Section
  const CompaniesHiringSection = () => (
    <Box sx={{ mb: 3, overflow: 'hidden', mx: -2, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">Companies Hiring Now</Typography>
        <Typography variant="caption" color="text.secondary">
          Updated {new Date().toLocaleDateString()}
        </Typography>
      </Box>
      
      <Box sx={{ 
        display: 'flex',
        gap: 2,
        pb: 1,
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: 6
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: 3
        }
      }}>
        {hiring_companies.map((company, index) => (
          <Paper
            key={index}
            elevation={0}
            variant="outlined"
            sx={{ 
              p: 1.5, 
              minWidth: 180,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 2
              }
            }}
          >
            <Avatar 
              src={company.logo} 
              alt={company.name}
              sx={{ width: 56, height: 56, mb: 1 }}
            >
              {company.name.charAt(0)}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              {company.name}
            </Typography>
            <Chip 
              label={`${company.openings} Positions`} 
              size="small" 
              color="primary" 
              sx={{ mt: 1 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              {company.top_role}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
  
  // Skill Expiry Alert Section
  const SkillExpiryAlertSection = () => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="warning.main" sx={{ display: 'flex', alignItems: 'center' }}>
          <HourglassEmptyIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Skills Declining in Demand
        </Typography>
        <Tooltip title="These skills are projected to lose relevance in your industry. Consider focusing on growing alternatives.">
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Alert severity="warning" sx={{ mb: 2 }}>
        Some skills in your profile are declining in market relevance. Consider upskilling in growing alternatives.
      </Alert>
      
      <Grid container spacing={2}>
        {declining_skills.map((skill, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 1.5, 
                borderLeft: '4px solid',
                borderLeftColor: 'warning.main'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight="medium">{skill.name}</Typography>
                <Chip 
                  icon={<TrendingDownIcon />} 
                  label={`${skill.decline_rate}%`} 
                  size="small" 
                  color="warning"
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ mr: 1 }}>
                  Time to Obsolescence:
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={100 - skill.remaining_relevance}
                  sx={{ 
                    flexGrow: 1,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#f5f5f5'
                  }}
                />
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                {skill.estimated_expiry}
              </Typography>
              
              <Divider sx={{ my: 1 }} />
              
              <Typography variant="caption" sx={{ display: 'block' }}>
                Suggested Alternatives:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {skill.alternatives.map((alt, i) => (
                  <Chip key={i} label={alt} size="small" color="success" variant="outlined" />
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
  
  return (
    <Card sx={{ height: '100%', overflow: 'hidden' }}>
      <CardContent sx={{ height: 'calc(100% - 40px)', overflow: 'auto', p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('marketInsights.title', 'Market Insights')}
        </Typography>
        
        {/* Companies Hiring Now ticker - shown above tabs */}
        {hiring_companies.length > 0 && <CompaniesHiringSection />}
        
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Salary Data" value="salary" />
          <Tab label="Regional Demand" value="regions" />
          <Tab label="Skills Demand" value="skills" />
          <Tab label="Industry Trends" value="trends" />
          <Tab label="Future Trends" value="future" />
          <Tab label="Skill Alerts" value="alerts" />
          <Tab label="Your Insights" value="personalized" />
        </Tabs>
        
        {/* Skill Expiry Alert - shown on all tabs when there are critical alerts */}
        {currentTab !== 'alerts' && declining_skills.some(skill => skill.decline_rate > 30) && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
            action={
              <IconButton 
                color="inherit" 
                size="small" 
                onClick={() => setCurrentTab('alerts')}
              >
                <WarningIcon fontSize="inherit" />
              </IconButton>
            }
          >
            You have {declining_skills.filter(s => s.decline_rate > 30).length} skills at high risk of becoming obsolete.
          </Alert>
        )}
        
        {currentTab === 'salary' && renderSalaryTab()}
        {currentTab === 'regions' && renderRegionTab()}
        {currentTab === 'skills' && renderSkillTab()}
        {currentTab === 'trends' && renderTrendsTab()}
        {currentTab === 'future' && renderTrendPredictionTab()}
        {currentTab === 'alerts' && <SkillExpiryAlertSection />}
        {currentTab === 'personalized' && renderYourInsightsTab()}
      </CardContent>
    </Card>
  );
};

export default MarketInsightsSection; 