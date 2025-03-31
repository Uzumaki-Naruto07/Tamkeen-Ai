import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Check,
  Close,
  TrendingUp,
  Star,
  BarChart,
  ArrowUpward,
  ArrowForward,
  Lightbulb
} from '@mui/icons-material';

/**
 * Component to display resume scores and metrics with improvement suggestions
 */
const ResumeScoreCard = ({ resumeData, atsResults, onViewDetails }) => {
  // Calculate overall score based on various components
  const calculateScore = () => {
    if (!resumeData || !atsResults) return 0;
    
    // If ATS results are available, use the score
    if (atsResults && typeof atsResults.score === 'number') {
      return atsResults.score;
    }
    
    // Otherwise calculate a basic score based on resume completeness
    let score = 0;
    const maxScore = 100;
    
    // Check personal information
    if (resumeData.personal) {
      if (resumeData.personal.name) score += 5;
      if (resumeData.personal.email) score += 5;
      if (resumeData.personal.phone) score += 5;
      if (resumeData.personal.location) score += 5;
      if (resumeData.personal.summary && resumeData.personal.summary.length > 50) score += 10;
    }
    
    // Check education
    if (resumeData.education && resumeData.education.length > 0) {
      score += Math.min(10, resumeData.education.length * 5);
    }
    
    // Check experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      score += Math.min(30, resumeData.experience.length * 10);
    }
    
    // Check skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      score += Math.min(20, resumeData.skills.length * 2);
    }
    
    // Check projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      score += Math.min(10, resumeData.projects.length * 5);
    }
    
    return Math.min(score, maxScore);
  };
  
  const score = calculateScore();
  
  // Get score color
  const getScoreColor = () => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };
  
  // Get score label
  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };
  
  // Get matched and missing keywords from ATS results
  const matchedKeywords = atsResults?.matched_keywords || [];
  const missingKeywords = atsResults?.missing_keywords || [];
  const suggestions = atsResults?.optimizations || [];
  
  if (!resumeData) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="subtitle1" color="text.secondary">
          No resume data available
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h6">
          Resume Score
        </Typography>
        
        {onViewDetails && (
          <Button 
            variant="text" 
            color="primary" 
            endIcon={<ArrowForward />}
            onClick={onViewDetails}
            size="small"
          >
            View Details
          </Button>
        )}
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={5} sx={{ textAlign: 'center' }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={score}
              size={120}
              thickness={5}
              sx={{ color: getScoreColor() }}
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
                flexDirection: 'column',
              }}
            >
              <Typography variant="h4" component="div" color={getScoreColor()}>
                {score}%
              </Typography>
              <Typography variant="caption" component="div" color="text.secondary">
                {getScoreLabel()}
              </Typography>
            </Box>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={7}>
          <List dense disablePadding>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Star color="warning" />
              </ListItemIcon>
              <ListItemText 
                primary="ATS Compatibility"
                secondary={atsResults ? `${atsResults.pass_probability || score}% match rate` : "Not analyzed yet"}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Check color={resumeData.experience?.length > 0 ? "success" : "error"} />
              </ListItemIcon>
              <ListItemText 
                primary="Experience" 
                secondary={resumeData.experience?.length > 0 
                  ? `${resumeData.experience.length} roles defined` 
                  : "No experience added"}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Check color={resumeData.skills?.length > 0 ? "success" : "error"} />
              </ListItemIcon>
              <ListItemText 
                primary="Skills" 
                secondary={resumeData.skills?.length > 0 
                  ? `${resumeData.skills.length} skills added` 
                  : "No skills added"}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <BarChart color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Last Updated"
                secondary={new Date(resumeData.updatedAt).toLocaleDateString()}
              />
            </ListItem>
          </List>
        </Grid>
      </Grid>
      
      {atsResults && (
        <>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Keyword Analysis
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Matched Keywords ({matchedKeywords.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {matchedKeywords.slice(0, 5).map((keyword, i) => (
                  <Chip 
                    key={i} 
                    label={keyword} 
                    size="small" 
                    color="success" 
                    variant="outlined"
                  />
                ))}
                {matchedKeywords.length > 5 && (
                  <Chip 
                    label={`+${matchedKeywords.length - 5} more`} 
                    size="small" 
                    variant="outlined"
                  />
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Missing Keywords ({missingKeywords.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {missingKeywords.slice(0, 5).map((keyword, i) => (
                  <Chip 
                    key={i} 
                    label={keyword} 
                    size="small" 
                    color="error" 
                    variant="outlined"
                  />
                ))}
                {missingKeywords.length > 5 && (
                  <Chip 
                    label={`+${missingKeywords.length - 5} more`} 
                    size="small" 
                    variant="outlined"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
          
          {atsResults.ats_feedback && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                AI Suggestions
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Lightbulb color="warning" sx={{ mt: 0.5 }} />
                  <Typography variant="body2">
                    {atsResults.ats_feedback}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
          
          {suggestions && suggestions.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Improvement Suggestions
              </Typography>
              <List dense>
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <ListItem key={index} sx={{ pl: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Lightbulb color="info" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={suggestion.title || `Suggestion ${index + 1}`} 
                      secondary={suggestion.description} 
                    />
                  </ListItem>
                ))}
              </List>
              
              {suggestions.length > 3 && (
                <Button 
                  variant="text" 
                  size="small" 
                  onClick={onViewDetails}
                  sx={{ mt: 1 }}
                >
                  View all {suggestions.length} suggestions
                </Button>
              )}
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default ResumeScoreCard; 