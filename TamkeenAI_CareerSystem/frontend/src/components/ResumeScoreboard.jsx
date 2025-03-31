import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Alert,
  Chip,
  Stack,
  CircularProgress,
  Tooltip,
  useTheme,
  IconButton,
  Paper
} from '@mui/material';
import {
  Speed as SpeedIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CloudDownload as CloudDownloadIcon,
  Share as ShareIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  ArrowUpward as ArrowUpwardIcon,
  TipsAndUpdates as TipsAndUpdatesIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import apiEndpoints from '../utils/api';

const ResumeScoreboard = ({ analysisData, resumeData, loading = false, onImprove = null }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={50} thickness={4} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Analyzing Your Resume
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Our AI is evaluating your resume against ATS standards...
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  if (!analysisData) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Analysis Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click the "Analyze Resume" button to evaluate your resume.
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Extract relevant data from analysisData
  const { 
    score = 0, 
    sections = {}, 
    strengths = [], 
    weaknesses = [], 
    suggestions = [],
    matched_keywords = [],
    missing_keywords = []
  } = analysisData;
  
  // Map section names to icons
  const sectionIcons = {
    summary: <DescriptionIcon />,
    education: <SchoolIcon />,
    experience: <WorkIcon />,
    skills: <CodeIcon />
  };
  
  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.primary.main;
    if (score >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  // Get section score color
  const getSectionScoreColor = (score) => {
    if (score >= 8) return theme.palette.success.main;
    if (score >= 6) return theme.palette.primary.main;
    if (score >= 4) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  return (
    <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <AssessmentIcon sx={{ mr: 1 }} />
            Resume Scoreboard
          </Typography>
          
          <Box>
            <Tooltip title="Download Report">
              <IconButton size="small" sx={{ mr: 1 }}>
                <CloudDownloadIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Share Results">
              <IconButton size="small">
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          {/* Overall Score */}
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={score}
                    size={120}
                    thickness={10}
                    sx={{ 
                      color: getScoreColor(score),
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      }
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
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: getScoreColor(score) }}>
                      {Math.round(score)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ATS Score
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                  {score >= 80 
                    ? 'Excellent! Your resume is ATS-optimized.' 
                    : score >= 60 
                    ? 'Good. Some improvements recommended.' 
                    : score >= 40 
                    ? 'Fair. Significant improvements needed.' 
                    : 'Poor. Major revisions required.'}
                </Typography>
                
                {onImprove && (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    startIcon={<TipsAndUpdatesIcon />}
                    onClick={onImprove}
                  >
                    Get Improvement Tips
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
          
          {/* Section Scores */}
          <Grid item xs={12} md={8}>
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Section Scores
              </Typography>
              
              <List sx={{ p: 0 }}>
                {Object.entries(sections).map(([sectionName, sectionData]) => (
                  <ListItem key={sectionName} sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {sectionIcons[sectionName] || <DescriptionIcon />}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body1" component="span" sx={{ textTransform: 'capitalize' }}>
                            {sectionName}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            component="span" 
                            sx={{ fontWeight: 'bold', color: getSectionScoreColor(sectionData.score) }}
                          >
                            {sectionData.score}/10
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <LinearProgress 
                            variant="determinate" 
                            value={sectionData.score * 10} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 5,
                              mb: 0.5,
                              bgcolor: 'rgba(0,0,0,0.05)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: getSectionScoreColor(sectionData.score),
                              }
                            }} 
                          />
                          <Typography variant="caption" color="text.secondary">
                            {sectionData.feedback}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          {/* Keyword Analysis */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
                Keyword Analysis
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" gutterBottom sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                      <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                      Matched Keywords ({matched_keywords.length})
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {matched_keywords.length > 0 ? matched_keywords.map((keyword, index) => (
                        <Chip 
                          key={index}
                          label={keyword}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )) : (
                        <Typography variant="body2" color="text.secondary">
                          No matched keywords found
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" gutterBottom sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
                      <WarningIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                      Missing Keywords ({missing_keywords.length})
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {missing_keywords.length > 0 ? missing_keywords.map((keyword, index) => (
                        <Chip 
                          key={index}
                          label={keyword}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )) : (
                        <Typography variant="body2" color="text.secondary">
                          No missing keywords detected
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Strengths & Weaknesses */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <StarIcon sx={{ mr: 0.5, color: theme.palette.success.main }} fontSize="small" />
                Resume Strengths
              </Typography>
              
              {strengths.length > 0 ? (
                <List dense disablePadding>
                  {strengths.map((strength, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircleIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText primary={strength} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No specific strengths identified
                </Typography>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ArrowUpwardIcon sx={{ mr: 0.5, color: theme.palette.warning.main }} fontSize="small" />
                Areas for Improvement
              </Typography>
              
              {weaknesses.length > 0 ? (
                <List dense disablePadding>
                  {weaknesses.map((weakness, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <InfoIcon fontSize="small" color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={weakness} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No specific improvement areas identified
                </Typography>
              )}
            </Paper>
          </Grid>
          
          {/* Action Items */}
          {suggestions && suggestions.length > 0 && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Suggested Action Items
                </Typography>
                
                <List>
                  {suggestions.slice(0, expanded ? suggestions.length : 3).map((suggestion, index) => (
                    <ListItem key={index} alignItems="flex-start" sx={{ px: 1, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                        <Chip 
                          label={index + 1} 
                          size="small" 
                          color="primary" 
                          sx={{ 
                            height: 24, 
                            width: 24, 
                            borderRadius: '50%',
                            '& .MuiChip-label': { p: 0 }
                          }} 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={suggestion.title}
                        secondary={suggestion.description}
                      />
                    </ListItem>
                  ))}
                </List>
                
                {suggestions.length > 3 && (
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Button 
                      size="small" 
                      onClick={() => setExpanded(!expanded)}
                    >
                      {expanded ? 'Show Less' : `View ${suggestions.length - 3} More Actions`}
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ResumeScoreboard; 