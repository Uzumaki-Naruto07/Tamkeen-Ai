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
  Divider
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MarketInsightsSection = ({ marketInsights }) => {
  const [currentTab, setCurrentTab] = useState('salary');
  
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  
  const { salary_data, regional_demand, skill_demand, industry_trends, personalized_insights } = marketInsights;
  
  // Format salary data for chart
  const salaryChartData = salary_data.map(item => ({
    name: item.role,
    median: item.median,
    low: item.range_low,
    high: item.range_high
  }));
  
  // Format region data for chart
  const regionChartData = regional_demand.slice(0, 5).map(item => ({
    name: item.region,
    value: item.demand_index
  }));
  
  // Format skill data for chart
  const skillChartData = skill_demand.map(item => ({
    name: item.skill,
    value: item.demand_index,
    growth: item.growth_rate
  }));
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
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
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
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
            {salary_data.map((row) => (
              <TableRow key={row.role}>
                <TableCell component="th" scope="row">{row.role}</TableCell>
                <TableCell align="right">${row.median.toLocaleString()}</TableCell>
                <TableCell align="right">${row.range_low.toLocaleString()} - ${row.range_high.toLocaleString()}</TableCell>
                <TableCell align="right">+{Math.round((row.experience_factor - 1) * 100)}% per year</TableCell>
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
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Market Insights</Typography>
        
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          <Tab label="Salary Data" value="salary" />
          <Tab label="Regional Demand" value="regions" />
          <Tab label="Skills Demand" value="skills" />
          <Tab label="Industry Trends" value="trends" />
          <Tab label="Your Insights" value="personalized" />
        </Tabs>
        
        {currentTab === 'salary' && renderSalaryTab()}
        {currentTab === 'regions' && renderRegionTab()}
        {currentTab === 'skills' && renderSkillTab()}
        {currentTab === 'trends' && renderTrendsTab()}
        {currentTab === 'personalized' && renderYourInsightsTab()}
      </CardContent>
    </Card>
  );
};

export default MarketInsightsSection; 