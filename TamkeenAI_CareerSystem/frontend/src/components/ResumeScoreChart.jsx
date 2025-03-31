import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  useTheme, 
  Button,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress
} from '@mui/material';
import { Timeline, CalendarMonth, TrendingUp } from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';

/**
 * Custom tooltip for the chart
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <Card sx={{ p: 1.5, boxShadow: 3, maxWidth: 250, border: '1px solid #eee' }}>
        <Typography variant="subtitle2" gutterBottom>
          {new Date(label).toLocaleDateString()}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box 
            sx={{ 
              width: 12, 
              height: 12, 
              borderRadius: '50%', 
              backgroundColor: payload[0].color,
              mr: 1 
            }} 
          />
          <Typography variant="body2">
            Resume Score: <strong>{data.score}</strong>
          </Typography>
        </Box>
        
        {data.changes && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {data.changes}
            </Typography>
          </>
        )}
      </Card>
    );
  }
  
  return null;
};

/**
 * ResumeScoreChart component displays a chart showing the progression of resume scores over time
 */
const ResumeScoreChart = ({ 
  data = [], 
  loading = false,
  height = 300,
  targetScore = 85,
  onTimeRangeChange = null
}) => {
  const theme = useTheme();
  const chartContainerRef = useRef(null);
  const [timeRange, setTimeRange] = useState('1M'); // Default to 1 month
  const [chartData, setChartData] = useState([]);
  const [averageScore, setAverageScore] = useState(0);
  const [scoreChange, setScoreChange] = useState({ value: 0, percentage: 0 });
  
  // Process chart data based on time range
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    const now = new Date();
    let filteredData = [...data];
    
    // Filter data based on selected time range
    switch (timeRange) {
      case '1W':
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredData = data.filter(item => new Date(item.date) >= oneWeekAgo);
        break;
      case '1M':
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredData = data.filter(item => new Date(item.date) >= oneMonthAgo);
        break;
      case '3M':
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        filteredData = data.filter(item => new Date(item.date) >= threeMonthsAgo);
        break;
      case '6M':
        const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        filteredData = data.filter(item => new Date(item.date) >= sixMonthsAgo);
        break;
      case '1Y':
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        filteredData = data.filter(item => new Date(item.date) >= oneYearAgo);
        break;
      case 'ALL':
      default:
        // Use all data
        break;
    }
    
    // Ensure we have at least two data points for comparison
    if (filteredData.length < 2) {
      filteredData = [...data].slice(-Math.max(2, data.length));
    }
    
    // Sort data by date (oldest to newest)
    filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate average score
    const total = filteredData.reduce((sum, item) => sum + item.score, 0);
    const avg = total / filteredData.length;
    setAverageScore(Math.round(avg * 10) / 10);
    
    // Calculate score change (first vs last)
    const firstScore = filteredData[0].score;
    const lastScore = filteredData[filteredData.length - 1].score;
    const change = lastScore - firstScore;
    const percentChange = firstScore !== 0 
      ? Math.round((change / firstScore) * 1000) / 10
      : 0;
      
    setScoreChange({ 
      value: change,
      percentage: percentChange
    });
    
    // Update chart data
    setChartData(filteredData);
    
    // Notify parent of time range change if callback provided
    if (onTimeRangeChange) {
      onTimeRangeChange(timeRange, filteredData);
    }
  }, [data, timeRange, onTimeRangeChange]);
  
  // Handle time range change
  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };
  
  // Format x-axis tick (date)
  const formatXAxisTick = (tickItem) => {
    const date = new Date(tickItem);
    
    // Format based on time range
    switch (timeRange) {
      case '1W':
        return date.toLocaleDateString(undefined, { weekday: 'short' });
      case '1M':
        return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      case '3M':
      case '6M':
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      case '1Y':
      case 'ALL':
        return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
      default:
        return date.toLocaleDateString();
    }
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.07)',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-5px)'
        }
      }}
    >
      <Box sx={{ 
        p: 2.5, 
        background: 'linear-gradient(to right, #1565c0, #1976d2)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUp />
          <Typography variant="h6" fontWeight={600}>
            Resume Score History
          </Typography>
        </Box>
        
        <ToggleButtonGroup
          value={timeRange}
          exclusive
          onChange={handleTimeRangeChange}
          size="small"
          sx={{ 
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: 1.5,
            '& .MuiToggleButtonGroup-grouped': {
              color: 'white',
              borderColor: 'rgba(255,255,255,0.3)',
              fontWeight: 500,
              '&.Mui-selected': {
                bgcolor: 'rgba(255,255,255,0.2)',
                fontWeight: 600,
              },
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.15)',
              },
              transition: 'all 0.2s ease',
            }
          }}
        >
          <ToggleButton value="1W">1W</ToggleButton>
          <ToggleButton value="1M">1M</ToggleButton>
          <ToggleButton value="3M">3M</ToggleButton>
          <ToggleButton value="6M">6M</ToggleButton>
          <ToggleButton value="1Y">1Y</ToggleButton>
          <ToggleButton value="ALL">All</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <CardContent 
        sx={{ 
          p: 0, 
          height: `calc(100% - 68px)`,
          display: 'flex',
          flexDirection: 'column' 
        }}
      >
        <Box sx={{ 
          p: 2.5, 
          display: 'flex', 
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'rgba(0, 0, 0, 0.02)'
        }}>
          <Box>
            <Typography variant="overline" color="text.secondary" fontSize={11} fontWeight={600}>
              AVERAGE SCORE
            </Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {averageScore}
              <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 0.5 }}>
                /100
              </Typography>
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="overline" color="text.secondary" fontSize={11} fontWeight={600}>
              PROGRESS
            </Typography>
            <Typography 
              variant="h4" 
              fontWeight={700} 
              color={scoreChange.value >= 0 ? 'success.main' : 'error.main'}
            >
              {scoreChange.value > 0 && '+'}
              {scoreChange.value}
              <Typography 
                component="span" 
                variant="caption" 
                color={scoreChange.value >= 0 ? 'success.main' : 'error.main'} 
                sx={{ ml: 0.5, opacity: 0.8 }}
              >
                ({scoreChange.value > 0 && '+'}
                {scoreChange.percentage}%)
              </Typography>
            </Typography>
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%',
            py: 4
          }}>
            <CircularProgress size={50} thickness={4} sx={{ mb: 2 }} />
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              Loading score history...
            </Typography>
          </Box>
        ) : data.length === 0 ? (
          <Box sx={{ 
            display: 'flex',
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%',
            textAlign: 'center',
            p: 3 
          }}>
            <CalendarMonth sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.primary" gutterBottom>
              No score history available yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
              Upload or update your resume to start tracking your score progress over time.
              You'll see how your resume improves with each change you make.
            </Typography>
          </Box>
        ) : (
          <Box 
            ref={chartContainerRef} 
            sx={{ 
              height: '100%', 
              width: '100%', 
              pt: 2,
              px: 1,
              flexGrow: 1
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 10,
                }}
              >
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatXAxisTick}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  stroke={theme.palette.divider}
                />
                <YAxis 
                  domain={[0, 100]} 
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                  stroke={theme.palette.divider}
                />
                <Tooltip content={<CustomTooltip />} />
                
                <ReferenceLine 
                  y={targetScore} 
                  label={{ 
                    value: `Target: ${targetScore}`, 
                    position: 'insideBottomRight',
                    fill: theme.palette.success.main,
                    fontSize: 12,
                    fontWeight: 'bold'
                  }} 
                  stroke={theme.palette.success.main}
                  strokeDasharray="3 3" 
                  strokeWidth={2}
                />
                
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  name="Resume Score"
                  stroke={theme.palette.primary.main} 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                  activeDot={{ 
                    r: 6, 
                    strokeWidth: 2, 
                    stroke: 'white',
                    fill: theme.palette.primary.main,
                    boxShadow: '0 0 8px rgba(0, 0, 0, 0.4)'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

ResumeScoreChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired,
      changes: PropTypes.string
    })
  ),
  loading: PropTypes.bool,
  height: PropTypes.number,
  targetScore: PropTypes.number,
  onTimeRangeChange: PropTypes.func
};

export default ResumeScoreChart; 