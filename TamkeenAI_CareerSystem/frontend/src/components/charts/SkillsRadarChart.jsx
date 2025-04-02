import React, { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Box, Paper, Typography, useTheme, CircularProgress, Alert } from '@mui/material';

/**
 * Enhanced Skills Radar Chart Component using Recharts
 * Visualizes skills in a radar/spider chart format with customizable options
 */
const SkillsRadarChart = ({ 
  data, 
  height = 400, 
  title = 'Skills Assessment',
  className = '',
  maxValue = 100,
  showLegend = true,
  legendPosition = 'bottom',
  loading = false
}) => {
  const theme = useTheme();
  
  // Process and format the data
  const formattedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [
        { name: 'Technical', value: 65, fullMark: maxValue },
        { name: 'Communication', value: 75, fullMark: maxValue },
        { name: 'Problem Solving', value: 60, fullMark: maxValue },
        { name: 'Cultural Fit', value: 70, fullMark: maxValue },
        { name: 'Leadership', value: 50, fullMark: maxValue },
        { name: 'Teamwork', value: 80, fullMark: maxValue }
      ];
    }

    return data.map(item => ({
      name: item.name || item.category || item.skill || 'Unnamed',
      value: item.value || item.score || 0,
      fullMark: item.fullMark || maxValue
    }));
  }, [data, maxValue]);
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: theme.palette.background.paper,
            p: 1.5,
            border: '1px solid',
            borderColor: theme.palette.divider,
            borderRadius: 1,
            boxShadow: 3
          }}
        >
          <Typography variant="subtitle2">
            {payload[0].payload.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Score: {payload[0].value} / {payload[0].payload.fullMark}
          </Typography>
        </Box>
      );
    }
    return null;
  };
  
  // Get accessibility description
  const accessibilityDescription = useMemo(() => {
    return `Skills radar chart displaying: ${formattedData.map(item => 
      `${item.name} (${item.value}/${item.fullMark})`).join(', ')}`;
  }, [formattedData]);
  
  // Loading state
  if (loading) {
    return (
      <Paper 
        elevation={0}
        variant="outlined"
        className={className}
        sx={{ p: 2, height: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <CircularProgress size={40} thickness={4} />
      </Paper>
    );
  }
  
  // Error state
  if (!formattedData || formattedData.length === 0) {
    return (
      <Paper 
        elevation={0}
        variant="outlined"
        className={className}
        sx={{ p: 2, height: 'auto' }}
      >
        <Alert severity="warning">
          No data available to display the skills chart.
        </Alert>
      </Paper>
    );
  }
  
  return (
    <Paper 
      elevation={0}
      variant="outlined"
      className={className}
      sx={{ p: 2, height: 'auto' }}
    >
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      
      <Typography variant="srOnly" id="skills-radar-description">
        {accessibilityDescription}
      </Typography>
      
      <Box sx={{ height: height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formattedData}>
            <PolarGrid stroke={theme.palette.divider} />
            <PolarAngleAxis 
              dataKey="name" 
              tick={{ 
                fill: theme.palette.text.primary, 
                fontSize: 12
              }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, maxValue]} 
              tick={{ 
                fill: theme.palette.text.secondary, 
                fontSize: 10
              }}
            />
            <Radar 
              name="Skills" 
              dataKey="value" 
              stroke={theme.palette.primary.main} 
              fill={theme.palette.primary.main} 
              fillOpacity={0.6}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend 
                iconSize={10} 
                layout={legendPosition === 'bottom' ? 'horizontal' : 'vertical'} 
                verticalAlign={legendPosition === 'bottom' ? 'bottom' : 'middle'} 
                align={legendPosition === 'bottom' ? 'center' : 'right'}
                wrapperStyle={{ 
                  paddingTop: legendPosition === 'bottom' ? '10px' : '0',
                  paddingLeft: legendPosition === 'right' ? '10px' : '0',
                  fontSize: '12px'
                }}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default SkillsRadarChart; 