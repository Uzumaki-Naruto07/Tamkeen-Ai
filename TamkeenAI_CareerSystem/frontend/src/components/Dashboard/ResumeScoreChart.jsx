import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip, Button, 
         List, ListItem, ListItemText, Tooltip, Dialog, DialogTitle, 
         DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const ResumeScoreChart = ({ resumeData, onGenerateImprovement }) => {
  // Safely handle undefined resumeData with default values
  const { 
    scores = [], 
    average_improvement = 0, 
    latest_score = 0, 
    total_versions = 0, 
    keywordMatches = [], 
    missingKeywords = [] 
  } = resumeData || {};
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [improvementOpen, setImprovementOpen] = useState(false);
  const [generatedImprovements, setGeneratedImprovements] = useState(null);
  
  // Format data for chart - ensure scores has items before mapping
  const chartData = scores && scores.length > 0 ? scores.map(score => ({
    name: `V${score.version}`,
    score: score.score,
    date: new Date(score.date).toLocaleDateString()
  })) : [];
  
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
  
  // Handle AI improvement generation
  const handleGenerateImprovement = async () => {
    setIsGenerating(true);
    try {
      const improvements = await onGenerateImprovement();
      setGeneratedImprovements(improvements);
      setImprovementOpen(true);
    } catch (error) {
      console.error("Error generating improvements:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Get color based on match score
  const getKeywordColor = (score) => {
    if (score > 8) return '#8884d8';
    if (score > 6) return '#82ca9d';
    if (score > 4) return '#ffc658';
    return '#e0e0e0';
  };

  // If no data available, show a message
  if (!resumeData || !scores || scores.length === 0) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent>
          <Typography variant="h6" align="center">
            No resume score data available
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Upload your resume to get an ATS score and recommendations
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
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
              label={`${average_improvement > 0 ? '+' : ''}${average_improvement && average_improvement.toFixed ? average_improvement.toFixed(1) : '0.0'} avg`} 
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
                  <ChartTooltip content={<CustomTooltip />} />
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
            
            {/* Custom Keyword Cloud */}
            <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
              Resume Keyword Match
            </Typography>
            <Box sx={{ 
              p: 2, 
              mb: 3, 
              minHeight: 200, 
              border: '1px solid #eee', 
              borderRadius: 1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {keywordMatches.length > 0 ? (
                keywordMatches.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword.text}
                    sx={{ 
                      fontSize: `${Math.max(12, Math.min(20, 12 + keyword.matchScore))}px`,
                      fontWeight: keyword.matchScore > 7 ? 'bold' : 'normal',
                      backgroundColor: getKeywordColor(keyword.matchScore),
                      m: 0.5,
                      p: 0.5,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  />
                ))
              ) : (
                <Typography color="text.secondary">No keyword matches available</Typography>
              )}
            </Box>
            
            {/* Missing Keywords List */}
            <Typography variant="h6" sx={{ mb: 1 }}>
              Missing Keywords
            </Typography>
            {missingKeywords.length > 0 ? (
              <List dense sx={{ mb: 3, maxHeight: 200, overflow: 'auto', border: '1px solid #eee', borderRadius: 1 }}>
                {missingKeywords.map((keyword, index) => (
                  <ListItem key={index}>
                    <Tooltip title={`Suggestion: Add to ${keyword.suggestedSection || 'relevant section'}`}>
                      <Box>
                        <ListItemText 
                          primary={keyword.text} 
                          secondary={`Importance: ${keyword.importance || 'High'}`}
                          sx={{ '& .MuiListItemText-primary': { color: 'warning.main' } }}
                        />
                      </Box>
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2, mb: 3, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography color="text.secondary">
                  No missing keywords detected
                </Typography>
              </Box>
            )}
            
            {/* AI Resume Fix Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
                onClick={handleGenerateImprovement}
                disabled={isGenerating}
                sx={{ borderRadius: 2 }}
              >
                {isGenerating ? 'Generating Improvements...' : 'AI Resume Fix'}
              </Button>
            </Box>
            
            {/* Improvements Dialog */}
            <Dialog open={improvementOpen} onClose={() => setImprovementOpen(false)} maxWidth="md" fullWidth>
              <DialogTitle>AI Resume Improvements</DialogTitle>
              <DialogContent dividers>
                {generatedImprovements && Object.entries(generatedImprovements).map(([section, improvements]) => (
                  <Box key={section} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" color="primary">{section}</Typography>
                    <List dense>
                      {improvements.map((item, idx) => (
                        <ListItem key={idx}>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setImprovementOpen(false)}>Close</Button>
                <Button variant="contained" color="primary">Apply Changes</Button>
              </DialogActions>
            </Dialog>
            
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