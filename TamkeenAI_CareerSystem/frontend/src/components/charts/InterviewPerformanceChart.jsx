import React, { useMemo } from 'react';
import {
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell
} from 'recharts';
import { Box, Paper, Typography, useTheme, Tabs, Tab } from '@mui/material';
import { BarChart as BarChartIcon, DonutLarge, Timeline, Radar as RadarIcon } from '@mui/icons-material';

/**
 * Enhanced Interview Performance Chart Component
 * Visualizes interview performance metrics with multiple display options
 */
const InterviewPerformanceChart = ({ 
  data, 
  height = 400, 
  className = '',
  title = 'Interview Performance',
  chartType = 'radial', // 'radial', 'bar', 'radar'
  showControls = true
}) => {
  const theme = useTheme();
  const [activeChart, setActiveChart] = React.useState(chartType);
  
  // Color scheme for different metrics
  const COLORS = theme.palette.mode === 'dark' 
    ? ['#4F46E5', '#10B981', '#F97316', '#EC4899', '#8B5CF6']
    : ['#4338CA', '#059669', '#EA580C', '#DB2777', '#7C3AED'];
  
  // Format data for Charts
  const formattedData = useMemo(() => {
    if (!data || !Array.isArray(data)) {
      // Default sample data
      return [
        { category: 'Technical', score: 75, fill: COLORS[0] },
        { category: 'Communication', score: 85, fill: COLORS[1] },
        { category: 'Problem Solving', score: 65, fill: COLORS[2] },
        { category: 'Cultural Fit', score: 80, fill: COLORS[3] }
      ];
    }
    
    return data.map((item, index) => ({
      name: item.category,
      category: item.category,
      score: item.score,
      value: item.score, // For radar chart
      fill: COLORS[index % COLORS.length]
    }));
  }, [data, COLORS]);
  
  // Handle tab change
  const handleChartChange = (event, newValue) => {
    setActiveChart(newValue);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 3
        }}>
          <Typography variant="subtitle2">
            {payload[0].payload.category || payload[0].payload.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Score: {payload[0].value}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Render radial bar chart
  const renderRadialChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <RadialBarChart 
        cx="50%" 
        cy="50%" 
        innerRadius="10%" 
        outerRadius="80%" 
        barSize={20} 
        data={formattedData}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar
          label={{ 
            position: 'insideStart', 
            fill: theme.palette.mode === 'dark' ? '#fff' : '#000',
            fontSize: 12
          }}
          background
          dataKey="score"
          minAngle={15}
        />
        <ChartTooltip content={<CustomTooltip />} />
        <Legend 
          iconSize={10} 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          formatter={(value) => {
            const item = formattedData.find(d => d.category === value || d.name === value);
            return <span>{value}: {item?.score}/100</span>;
          }}
          wrapperStyle={{
            paddingLeft: '10px',
            fontSize: '12px'
          }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  );

  // Render bar chart
  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={formattedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis 
          dataKey="category" 
          tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
          stroke={theme.palette.divider}
        />
        <YAxis 
          domain={[0, 100]}
          tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
          stroke={theme.palette.divider}
        />
        <ChartTooltip content={<CustomTooltip />} />
        <Bar 
          dataKey="score" 
          radius={[4, 4, 0, 0]}
          label={{ 
            position: 'top',
            fontSize: 12,
            fill: theme.palette.text.secondary
          }}
        >
          {formattedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  // Render radar chart
  const renderRadarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formattedData}>
        <PolarGrid stroke={theme.palette.divider} />
        <PolarAngleAxis 
          dataKey="category" 
          tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 100]} 
          tick={{ fill: theme.palette.text.secondary, fontSize: 10 }}
        />
        <Radar 
          name="Performance" 
          dataKey="score" 
          stroke={theme.palette.primary.main} 
          fill={theme.palette.primary.main} 
          fillOpacity={0.6} 
        />
        <ChartTooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );

  // Build an accessible description of the data for screen readers
  const accessibilityDescription = useMemo(() => {
    return `Chart displaying interview performance scores for: ${formattedData.map(item => 
      `${item.category} (${item.score}/100)`).join(', ')}`;
  }, [formattedData]);

  return (
    <Paper 
      elevation={0}
      variant="outlined"
      className={className} 
      sx={{ 
        p: 2,
        height: 'auto', 
        width: '100%'
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{title}</Typography>
        
        {showControls && (
          <Tabs 
            value={activeChart} 
            onChange={handleChartChange} 
            aria-label="chart type selector"
            sx={{ minHeight: 'auto' }}
          >
            <Tab 
              icon={<DonutLarge fontSize="small" />} 
              value="radial" 
              aria-label="Radial chart"
              sx={{ minWidth: 40, minHeight: 40, p: 1 }}
            />
            <Tab 
              icon={<BarChartIcon fontSize="small" />} 
              value="bar" 
              aria-label="Bar chart"
              sx={{ minWidth: 40, minHeight: 40, p: 1 }}
            />
            <Tab 
              icon={<RadarIcon fontSize="small" />} 
              value="radar" 
              aria-label="Radar chart"
              sx={{ minWidth: 40, minHeight: 40, p: 1 }}
            />
          </Tabs>
        )}
      </Box>
      
      <Typography variant="srOnly" id="interview-chart-description">
        {accessibilityDescription}
      </Typography>
      
      <Box sx={{ height: height || 400 }}>
        {activeChart === 'radial' && renderRadialChart()}
        {activeChart === 'bar' && renderBarChart()}
        {activeChart === 'radar' && renderRadarChart()}
      </Box>
    </Paper>
  );
};

export default InterviewPerformanceChart; 