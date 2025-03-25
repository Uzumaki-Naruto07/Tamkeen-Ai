import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Divider,
  Chip,
  Button,
  Collapse,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import DownloadIcon from '@mui/icons-material/Download';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import InfoIcon from '@mui/icons-material/Info';
import api from '../api/api';

const ATSResultsCard = ({ results, onReAnalyze }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showMissing, setShowMissing] = useState(false);
  
  if (!results) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress size={60} thickness={5} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Analyzing your resume...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This may take a few moments
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  const { 
    score, 
    matched_keywords, 
    missing_keywords, 
    ats_feedback, 
    pass_probability,
    optimizations,
    sections_analysis
  } = results;
  
  // Color based on score
  const getScoreColor = () => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'warning.main';
    return 'error.main';
  };
  
  // Get ATS verdict
  const getVerdict = () => {
    if (score >= 80) return 'Likely to pass';
    if (score >= 60) return 'May pass with improvements';
    return 'Unlikely to pass';
  };
  
  const handleDownloadReport = async () => {
    try {
      const response = await api.downloadATSReport(results.id);
      // Create a blob from the PDF Stream
      const file = new Blob([response.data], { type: 'application/pdf' });
      // Build a URL from the file
      const fileURL = URL.createObjectURL(file);
      // Open the URL on a new window
      window.open(fileURL);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Typography variant="h6">ATS Score Analysis</Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
            
            <Button
              size="small"
              startIcon={<AutorenewIcon />}
              onClick={onReAnalyze}
            >
              Re-Analyze
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex', textAlign: 'center' }}>
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
              }}
            >
              <Typography variant="h4" component="div" color={getScoreColor()}>
                {score}%
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ textAlign: 'center', maxWidth: 200 }}>
            <Typography variant="subtitle1" gutterBottom>
              {getVerdict()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pass_probability}% chance of passing ATS filters
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircleIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {matched_keywords.length} Keywords Matched
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CancelIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="body2">
                {missing_keywords.length} Keywords Missing
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Matched Keywords
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          {matched_keywords.map((keyword, index) => (
            <Chip 
              key={index} 
              label={keyword} 
              color="success" 
              size="small" 
              icon={<CheckCircleIcon />}
            />
          ))}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1">
            Missing Keywords
          </Typography>
          <Button 
            size="small"
            onClick={() => setShowMissing(!showMissing)}
            endIcon={showMissing ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {showMissing ? 'Hide' : 'Show'}
          </Button>
        </Box>
        
        <Collapse in={showMissing}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {missing_keywords.map((keyword, index) => (
              <Chip 
                key={index} 
                label={keyword} 
                color="error" 
                variant="outlined"
                size="small" 
                icon={<CancelIcon />}
              />
            ))}
          </Box>
        </Collapse>
        
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            ATS Feedback
          </Typography>
          <Typography variant="body2">
            {ats_feedback}
          </Typography>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {showDetails ? 'Hide Detailed Analysis' : 'Show Detailed Analysis'}
          </Button>
        </Box>
        
        <Collapse in={showDetails}>
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Resume Section Analysis
          </Typography>
          <Box sx={{ mb: 3 }}>
            {sections_analysis && Object.entries(sections_analysis).map(([section, analysis], index) => (
              <Box key={section} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2">{section}</Typography>
                  <Chip 
                    label={`${analysis.score}/10`} 
                    size="small"
                    color={analysis.score >= 7 ? "success" : analysis.score >= 5 ? "warning" : "error"}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {analysis.feedback}
                </Typography>
              </Box>
            ))}
          </Box>
          
          <Typography variant="subtitle1" gutterBottom>
            Recommended Optimizations
          </Typography>
          <List>
            {optimizations.map((optimization, index) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {optimization.priority === 'high' ? (
                    <ThumbUpIcon color="success" />
                  ) : (
                    <InfoIcon color="primary" />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={optimization.suggestion} 
                  secondary={optimization.explanation} 
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default ATSResultsCard;