import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  CircularProgress,
  LinearProgress,
  Divider,
  Chip,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const CareerAssessmentScore = ({ userId, resumeId }) => {
  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { profile } = useUser();
  
  // Use userId from props or context
  const effectiveUserId = userId || profile?.id;
  
  useEffect(() => {
    const fetchAssessmentData = async () => {
      if (!effectiveUserId) {
        setError('User information is required for career assessment');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // This connects to career_assessment.py backend
        const response = await apiEndpoints.career.assessSkills({
          userId: effectiveUserId,
          resumeId: resumeId // Optional
        });
        
        // Response includes career readiness score from career_assessment.py
        setAssessmentData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load career assessment');
        console.error('Career assessment error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessmentData();
  }, [effectiveUserId, resumeId]);

  if (!assessmentData) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No assessment data available
        </Typography>
      </Paper>
    );
  }

  const { 
    overallScore, 
    categoryScores = [],
    strengths = [], 
    weaknesses = [],
    recommendations = [],
    trend = 0,
    previousScore = null,
    lastUpdated
  } = assessmentData;

  // Format the score for display
  const formattedScore = Math.round(overallScore);
  
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'primary.main';
    if (score >= 40) return 'warning.main';
    return 'error.main';
  };

  // Determine score level text
  const getScoreLevel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Above Average';
    if (score >= 50) return 'Average';
    if (score >= 40) return 'Below Average';
    if (score >= 30) return 'Needs Improvement';
    return 'Critical';
  };

  // Get trend icon
  const getTrendIcon = () => {
    if (trend > 5) return <TrendingUpIcon sx={{ color: 'success.main' }} />;
    if (trend < -5) return <TrendingDownIcon sx={{ color: 'error.main' }} />;
    return <TrendingFlatIcon sx={{ color: 'info.main' }} />;
  };
  
  // Render star rating (0-5)
  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {[...Array(fullStars)].map((_, i) => (
          <StarIcon key={`full-${i}`} sx={{ color: 'warning.main', fontSize: '1rem' }} />
        ))}
        {hasHalfStar && (
          <StarIcon sx={{ color: 'warning.main', opacity: 0.6, fontSize: '1rem' }} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <StarBorderIcon key={`empty-${i}`} sx={{ color: 'text.disabled', fontSize: '1rem' }} />
        ))}
      </Box>
    );
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Grid container spacing={3}>
        {/* Score Display */}
        <Grid item xs={12} md={4}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100%' 
          }}>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <CircularProgress
                variant="determinate"
                value={100}
                size={160}
                thickness={5}
                sx={{ color: 'grey.200' }}
              />
              <CircularProgress
                variant="determinate"
                value={formattedScore}
                size={160}
                thickness={5}
                sx={{ 
                  color: getScoreColor(formattedScore),
                  position: 'absolute',
                  left: 0,
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                  {formattedScore}
                </Typography>
                <Typography variant="subtitle1" component="div" sx={{ mt: -1 }}>
                  {getScoreLevel(formattedScore)}
                </Typography>
              </Box>
            </Box>
            
            {previousScore !== null && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                {getTrendIcon()}
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {trend > 0 ? '+' : ''}{trend} points since last assessment
                </Typography>
              </Box>
            )}
            
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Last updated: {new Date(lastUpdated).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </Grid>
        
        {/* Category Scores */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Assessment Categories
          </Typography>
          
          <Box sx={{ mb: 3 }}>
            {categoryScores.map((category, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">
                    {category.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: getScoreColor(category.score) }}>
                    {category.score}/100
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={category.score} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 2,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getScoreColor(category.score),
                      borderRadius: 2
                    }
                  }}
                />
              </Box>
            ))}
          </Box>
          
          {showDetails && (
            <>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {/* Strengths */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Strengths
                  </Typography>
                  
                  {strengths.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                      No strengths identified yet
                    </Typography>
                  ) : (
                    <List dense disablePadding>
                      {strengths.map((strength, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={strength} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Grid>
                
                {/* Weaknesses */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Areas for Improvement
                  </Typography>
                  
                  {weaknesses.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                      No improvement areas identified
                    </Typography>
                  ) : (
                    <List dense disablePadding>
                      {weaknesses.map((weakness, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <WarningIcon color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={weakness} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
      
      {showDetails && recommendations && recommendations.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          
          <Box>
            <Typography variant="h6" gutterBottom>
              Recommendations
            </Typography>
            
            <List>
              {recommendations.map((recommendation, index) => (
                <ListItem key={index} sx={{ pl: 0, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ mt: 0.5 }}>
                    <InfoIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={recommendation.title}
                    secondary={recommendation.description}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default CareerAssessmentScore; 