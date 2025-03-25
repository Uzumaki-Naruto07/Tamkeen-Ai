import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const ResumeScoreChart = ({ resumeScores }) => {
  const { scores, average_improvement, latest_score, total_versions } = resumeScores;
  
  // Format data for chart
  const chartData = scores.map(score => ({
    name: `V${score.version}`,
    score: score.score,
    date: new Date(score.date).toLocaleDateString()
  }));
  
  // Determine trend icon
  const getTrendIcon = () => {
    if (average_improvement > 3) return <TrendingUpIcon sx={{ color: 'success.main' }} />;
    if (average_improvement < -3) return <TrendingDownIcon sx={{ color: 'error.main' }} />;
    return <TrendingFlatIcon sx={{ color: 'info.main' }} />;
  };
  
  // Get trend color
  const getTrendColor = () => {
    if (average_improvement > 3) return 'success';
    if (average_improvement < -3) return 'error';
    return 'info';
  };
  
  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
          <Typography variant="body2">{`Version: ${label}`}</Typography>
          <Typography variant="body2">{`Date: ${payload[0].payload.date}`}</Typography>
          <Typography variant="body2" color="primary">{`Score: ${payload[0].value}`}</Typography>
        </Box>
      );
    }
  
    return null;
  };
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Resume ATS Score</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              label={`Latest: ${latest_score}/100`} 
              color={latest_score > 80 ? "success" : latest_score > 60 ? "primary" : "warning"} 
              sx={{ mr: 1 }}
            />
            <Chip 
              icon={getTrendIcon()} 
              label={`${average_improvement > 0 ? '+' : ''}${average_improvement.toFixed(1)} avg`} 
              color={getTrendColor()} 
              variant="outlined" 
            />
          </Box>
        </Box>
        
        {scores.length > 0 ? (
          <>
            <Box sx={{ height: 300, mb: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                    dot={{ r: 5 }} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                0
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ATS Score
              </Typography>
              <Typography variant="body2" color="text.secondary">
                100
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={latest_score} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: latest_score > 80 ? 'success.main' : latest_score > 60 ? 'primary.main' : 'warning.main',
                },
              }} 
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="body2">
                Resume Versions: {total_versions}
              </Typography>
              {scores.length > 1 && (
                <Typography variant="body2">
                  Improvement: {scores[scores.length - 1].score - scores[0].score} points
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography color="text.secondary">
              No resume scores available yet. Upload your resume to get started.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeScoreChart; 