import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Chip, Button, 
         List, ListItem, ListItemText, Tooltip, Dialog, DialogTitle, 
         DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ResumeScoreChart = ({ resumeData, onGenerateImprovement }) => {
  const { t } = useTranslation();
  // Add navigate hook
  const navigate = useNavigate();
  
  // State to hold resume analysis history from localStorage
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [improvementOpen, setImprovementOpen] = useState(false);
  const [generatedImprovements, setGeneratedImprovements] = useState(null);
  
  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('resumeAnalysisHistory');
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        setAnalysisHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Safely handle undefined resumeData with default values
  const { 
    scores = [], 
    average_improvement = 0, 
    latest_score = analysisHistory.length > 0 ? analysisHistory[0].score : 0, 
    total_versions = 0, 
    keywordMatches = [], 
    missingKeywords = [] 
  } = resumeData || {};
  
  // Format data for chart - ensure scores has items before mapping
  const chartData = analysisHistory.length > 0 
    ? analysisHistory.map((entry, index) => ({
        name: `V${analysisHistory.length - index}`,
        score: entry.score,
        date: new Date(entry.created_at).toLocaleDateString(),
        jobTitle: entry.job_title
      })).reverse()
    : scores && scores.length > 0 
      ? scores.map(score => ({
          name: `V${score.version}`,
          score: score.score,
          date: new Date(score.date).toLocaleDateString()
        })) 
      : [];
  
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
          <Typography variant="body2">{`${t('common.version', 'Version')}: ${label}`}</Typography>
          <Typography variant="body2">{`${t('common.date', 'Date')}: ${payload[0].payload.date}`}</Typography>
          <Typography variant="body2" color="primary">{`${t('resumeAtsScore.score', 'Score')}: ${payload[0].value}`}</Typography>
          {payload[0].payload.jobTitle && (
            <Typography variant="body2">{`${t('common.job', 'Job')}: ${payload[0].payload.jobTitle}`}</Typography>
          )}
        </Box>
      );
    }
  
    return null;
  };
  
  // Handle navigation to ResumePage
  const handleNavigateToResumePage = () => {
    navigate('/resumePage');
  };
  
  // Get color based on match score
  const getKeywordColor = (score) => {
    if (score > 8) return '#8884d8';
    if (score > 6) return '#82ca9d';
    if (score > 4) return '#ffc658';
    return '#e0e0e0';
  };

  // If no data available, show a message
  if ((!resumeData || !scores || scores.length === 0) && analysisHistory.length === 0) {
    return (
      <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent>
          <Typography variant="h6" align="center">
            {t('resumeAtsScore.noData', 'No resume score data available')}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            {t('resumeAtsScore.uploadHint', 'Upload your resume to get an ATS score and recommendations')}
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Get the most recent analysis for color and assessment
  const latestAnalysis = analysisHistory.length > 0 ? analysisHistory[0] : null;
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{t('resumeAtsScore.title', 'Resume ATS Score')}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              label={`${t('resumeAtsScore.latest', 'Latest')}: ${latestAnalysis ? latestAnalysis.score : latest_score}/100`} 
              color={
                latestAnalysis 
                  ? (latestAnalysis.score > 80 ? "success" : latestAnalysis.score > 60 ? "primary" : latestAnalysis.score > 40 ? "warning" : "error")
                  : (latest_score > 80 ? "success" : latest_score > 60 ? "primary" : "warning")
              } 
              sx={{ mr: 1 }}
            />
            <Chip 
              icon={getTrendIcon()} 
              label={`${average_improvement > 0 ? '+' : ''}${average_improvement && average_improvement.toFixed ? average_improvement.toFixed(1) : '0.0'} ${t('resumeAtsScore.avg', 'avg')}`} 
              color={getTrendColor()} 
              variant="outlined" 
            />
          </Box>
        </Box>
        
        {/* Show latest assessment if available */}
        {latestAnalysis && latestAnalysis.assessment && (
          <Box 
            sx={{ 
              p: 2, 
              mb: 2, 
              borderRadius: 1, 
              bgcolor: latestAnalysis.color === 'green' ? 'success.light' : 
                        latestAnalysis.color === 'blue' ? 'primary.light' : 
                        latestAnalysis.color === 'orange' ? 'warning.light' : 'error.light',
              color: 'text.primary'
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {latestAnalysis.assessment.startsWith('Low match') 
                ? t('resumeAtsScore.lowMatch', 'Low match. Your resume needs significant adjustments for this role.')
                : latestAnalysis.assessment}
            </Typography>
          </Box>
        )}
        
        {chartData.length > 0 ? (
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
                {t('resumeAtsScore.title', 'ATS Score')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                100
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={latestAnalysis ? latestAnalysis.score : latest_score} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: latestAnalysis 
                    ? (latestAnalysis.score > 80 ? 'success.main' : 
                       latestAnalysis.score > 60 ? 'primary.main' : 
                       latestAnalysis.score > 40 ? 'warning.main' : 'error.main')
                    : (latest_score > 80 ? 'success.main' : latest_score > 60 ? 'primary.main' : 'warning.main'),
                },
              }} 
            />
            
            {/* Custom Keyword Cloud */}
            <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
              {t('resumeAtsScore.keywordMatches', 'Resume Keyword Match')}
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
                <Typography color="text.secondary">{t('common.noData', 'No keyword matches available')}</Typography>
              )}
            </Box>
            
            {/* Missing Keywords List */}
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t('resumeAtsScore.missingKeywords', 'Missing Keywords')}
            </Typography>
            {missingKeywords.length > 0 ? (
              <List dense sx={{ mb: 3, maxHeight: 200, overflow: 'auto', border: '1px solid #eee', borderRadius: 1 }}>
                {missingKeywords.map((keyword, index) => (
                  <ListItem key={index}>
                    <Tooltip title={`${t('common.suggestion', 'Suggestion')}: ${t('resumeAtsScore.addTo', 'Add to')} ${keyword.suggestedSection || t('common.relevantSection', 'relevant section')}`}>
                      <Box>
                        <ListItemText 
                          primary={keyword.text} 
                          secondary={`${t('common.importance', 'Importance')}: ${keyword.importance || t('common.high', 'High')}`}
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
                  {t('resumeAtsScore.noMissingKeywords', 'No missing keywords detected')}
                </Typography>
              </Box>
            )}
            
            {/* AI Resume Fix Button - Modified to navigate to ResumePage */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AutoFixHighIcon />}
                sx={{ borderRadius: 2 }}
                onClick={handleNavigateToResumePage}
              >
                {t('resumeAtsScore.improvement', 'AI Resume Fix')}
              </Button>
            </Box>
            
            {/* Improvements Dialog */}
            <Dialog open={improvementOpen} onClose={() => setImprovementOpen(false)} maxWidth="md" fullWidth>
              <DialogTitle>{t('resumeAtsScore.suggestedImprovements', 'Suggested Improvements')}</DialogTitle>
              <DialogContent>
                {isGenerating ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : generatedImprovements ? (
                  <Box>
                    {generatedImprovements.sections.map((section, index) => (
                      <Box key={index} sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          {section.title}
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {section.content}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography>
                    {t('resumeAtsScore.needsWork', 'Your resume needs improvement for this role. Click Generate to see AI suggestions.')}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setImprovementOpen(false)} color="primary">
                  {t('common.close', 'Close')}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <Typography variant="body1" color="text.secondary">
              {t('resumeAtsScore.noHistory', 'No score history available yet')}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeScoreChart; 