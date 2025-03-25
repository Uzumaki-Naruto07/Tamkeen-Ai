import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
  Divider,
  CircularProgress,
  Button,
  Collapse,
  LinearProgress,
  Tooltip,
  IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const KeywordMatchDisplay = ({ 
  matchData, 
  loading = false,
  onAddKeyword = null
}) => {
  const [showAllMissing, setShowAllMissing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Analyzing keywords...
        </Typography>
      </Box>
    );
  }

  if (!matchData) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No keyword data available
        </Typography>
      </Box>
    );
  }

  const { 
    matched_keywords = [], 
    missing_keywords = [], 
    critical_keywords = [],
    optional_keywords = [],
    keyword_match_percentage
  } = matchData;

  // Separate missing keywords into critical and optional
  const missingCritical = missing_keywords.filter(kw => critical_keywords.includes(kw));
  const missingOptional = missing_keywords.filter(kw => optional_keywords.includes(kw));
  
  // Determine which missing keywords to display initially (limit to 5)
  const displayedMissingKeywords = showAllMissing 
    ? missing_keywords 
    : missing_keywords.slice(0, 5);

  // Calculate the match percentages
  const totalKeywords = matched_keywords.length + missing_keywords.length;
  const matchPercentage = totalKeywords > 0 
    ? Math.round((matched_keywords.length / totalKeywords) * 100) 
    : 0;

  // Get the match status text and color
  const getMatchStatus = () => {
    if (matchPercentage >= 80) {
      return { text: 'Excellent Match', color: 'success.main' };
    } else if (matchPercentage >= 60) {
      return { text: 'Good Match', color: 'primary.main' };
    } else if (matchPercentage >= 40) {
      return { text: 'Fair Match', color: 'warning.main' };
    } else {
      return { text: 'Poor Match', color: 'error.main' };
    }
  };

  const status = getMatchStatus();

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Keyword Match Summary
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ position: 'relative', display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
              <CircularProgress 
                variant="determinate" 
                value={matchPercentage} 
                size={100}
                thickness={5}
                sx={{ 
                  color: status.color,
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
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
                <Typography variant="h4" color={status.color} sx={{ fontWeight: 'bold' }}>
                  {matchPercentage}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  match rate
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={8}>
            <Typography variant="h6" sx={{ color: status.color, mb: 1 }}>
              {status.text}
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                <b>{matched_keywords.length}</b> out of <b>{totalKeywords}</b> keywords matched
              </Typography>
              
              {missingCritical.length > 0 && (
                <Typography variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Missing {missingCritical.length} critical keywords
                </Typography>
              )}
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={matchPercentage} 
              sx={{ 
                height: 8, 
                borderRadius: 5,
                mb: 1,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: status.color,
                },
              }} 
            />
          </Grid>
        </Grid>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1">
            Matched Keywords {matched_keywords.length > 0 && `(${matched_keywords.length})`}
          </Typography>
          <Tooltip title="These keywords were found in your resume">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {matched_keywords.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
            No matched keywords found
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {matched_keywords.map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                icon={<CheckCircleIcon />}
                color="success"
                size="small"
                variant={critical_keywords.includes(keyword) ? "default" : "outlined"}
              />
            ))}
          </Box>
        )}
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1">
            Missing Keywords {missing_keywords.length > 0 && `(${missing_keywords.length})`}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="These keywords were not found in your resume">
              <IconButton size="small">
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {missing_keywords.length > 5 && (
              <Button 
                size="small" 
                onClick={() => setShowAllMissing(!showAllMissing)}
                endIcon={showAllMissing ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {showAllMissing ? 'Show Less' : 'Show All'}
              </Button>
            )}
          </Box>
        </Box>
        
        {missing_keywords.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
            No missing keywords found
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {displayedMissingKeywords.map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                icon={<CancelIcon />}
                color={critical_keywords.includes(keyword) ? "error" : "default"}
                size="small"
                variant="outlined"
                onDelete={onAddKeyword ? () => onAddKeyword(keyword) : undefined}
                deleteIcon={onAddKeyword ? <AddCircleIcon /> : undefined}
              />
            ))}
          </Box>
        )}
      </Box>
      
      {missingCritical.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="error" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
            Critical Missing Keywords
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {missingCritical.map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                icon={<WarningIcon />}
                color="error"
                size="small"
                onDelete={onAddKeyword ? () => onAddKeyword(keyword) : undefined}
                deleteIcon={onAddKeyword ? <AddCircleIcon /> : undefined}
              />
            ))}
          </Box>
        </Box>
      )}
      
      {matchData.keyword_suggestions && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">
              Suggested Keywords to Add
            </Typography>
            <Button 
              size="small" 
              onClick={() => setShowSuggestions(!showSuggestions)}
              endIcon={showSuggestions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {showSuggestions ? 'Hide' : 'Show'}
            </Button>
          </Box>
          
          <Collapse in={showSuggestions}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {matchData.keyword_suggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  icon={<HelpOutlineIcon />}
                  color="primary"
                  size="small"
                  variant="outlined"
                  onClick={onAddKeyword ? () => onAddKeyword(suggestion) : undefined}
                  deleteIcon={onAddKeyword ? <AddCircleIcon /> : undefined}
                  onDelete={onAddKeyword ? () => onAddKeyword(suggestion) : undefined}
                />
              ))}
            </Box>
          </Collapse>
        </Box>
      )}
    </Paper>
  );
};

export default KeywordMatchDisplay;
