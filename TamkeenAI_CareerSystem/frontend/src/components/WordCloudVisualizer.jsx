import React, { useState, useEffect } from 'react';
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
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Card,
  CardContent
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { 
  CloudQueue, TextFields, ColorLens, 
  Save, Refresh, GetApp, FilterList 
} from '@mui/icons-material';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import WordCloudChart from './WordCloudChart';

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

const WordCloudVisualizer = ({ 
  text = null, 
  documentId = null, 
  documentType = 'resume',
  jobId = null,
  width = 800,
  height = 600,
  readOnly = false
}) => {
  const [cloudData, setCloudData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualText, setManualText] = useState('');
  const [settings, setSettings] = useState({
    maxWords: 100,
    minWordLength: 3,
    includeCommonWords: false,
    colorScheme: 'default', // default, blue, multi
    fontFamily: 'Impact',
    showFrequency: true,
    rotation: 'mixed', // none, mixed, random
    shape: 'circle', // circle, square, rectangle
    removeStopwords: true
  });
  
  // Generate word cloud when component mounts or inputs change
  useEffect(() => {
    if (!readOnly) {
      if (documentId) {
        generateFromDocument();
      } else if (text) {
        generateFromText(text);
      }
    }
  }, [documentId, documentType, jobId, readOnly]);
  
  // Generate word cloud from provided text
  const generateFromText = async (textToAnalyze) => {
    if (!textToAnalyze) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // This connects to keyword_extraction.py backend
      const response = await apiEndpoints.analytics.extractKeywords({
        text: textToAnalyze,
        maxWords: settings.maxWords,
        minWordLength: settings.minWordLength,
        removeStopwords: settings.removeStopwords,
        includeCommonWords: settings.includeCommonWords
      });
      
      processWordCloudData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate word cloud');
      console.error('Error generating word cloud:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate word cloud from document
  const generateFromDocument = async () => {
    if (!documentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // This connects to keyword_extraction.py backend
      const response = await apiEndpoints.analytics.extractKeywords({
        documentId,
        documentType,
        jobId,
        maxWords: settings.maxWords,
        minWordLength: settings.minWordLength,
        removeStopwords: settings.removeStopwords,
        includeCommonWords: settings.includeCommonWords
      });
      
      processWordCloudData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate word cloud');
      console.error('Error generating word cloud:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Process API response into word cloud data format
  const processWordCloudData = (data) => {
    if (!data || !data.keywords) {
      setCloudData([]);
      return;
    }
    setCloudData(data.keywords);
  };

  const handleExportImage = () => {
    // Implementation of handleExportImage function
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Word Cloud Visualizer
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Enter text or choose a document"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              variant="outlined"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={documentType}
                onChange={(e) => setSettings(prev => ({ ...prev, documentType: e.target.value }))}
              >
                <MenuItem value="resume">Resume</MenuItem>
                <MenuItem value="cover_letter">Cover Letter</MenuItem>
                <MenuItem value="job_description">Job Description</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Job ID</InputLabel>
              <Select
                value={jobId}
                onChange={(e) => setSettings(prev => ({ ...prev, jobId: e.target.value }))}
              >
                {/* Add job ID options here */}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Max Words</InputLabel>
              <Select
                value={settings.maxWords}
                onChange={(e) => setSettings(prev => ({ ...prev, maxWords: Number(e.target.value) }))}
              >
                {/* Add max words options here */}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Min Word Length</InputLabel>
              <Select
                value={settings.minWordLength}
                onChange={(e) => setSettings(prev => ({ ...prev, minWordLength: Number(e.target.value) }))}
              >
                {/* Add min word length options here */}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Color Scheme</InputLabel>
              <Select
                value={settings.colorScheme}
                onChange={(e) => setSettings(prev => ({ ...prev, colorScheme: e.target.value }))}
              >
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="blue">Blue</MenuItem>
                <MenuItem value="multi">Multi</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Font Family</InputLabel>
              <Select
                value={settings.fontFamily}
                onChange={(e) => setSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
              >
                {/* Add font family options here */}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Show Frequency</InputLabel>
              <Select
                value={settings.showFrequency}
                onChange={(e) => setSettings(prev => ({ ...prev, showFrequency: e.target.value === 'true' }))}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Rotation</InputLabel>
              <Select
                value={settings.rotation}
                onChange={(e) => setSettings(prev => ({ ...prev, rotation: e.target.value }))}
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="mixed">Mixed</MenuItem>
                <MenuItem value="random">Random</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Shape</InputLabel>
              <Select
                value={settings.shape}
                onChange={(e) => setSettings(prev => ({ ...prev, shape: e.target.value }))}
              >
                <MenuItem value="circle">Circle</MenuItem>
                <MenuItem value="square">Square</MenuItem>
                <MenuItem value="rectangle">Rectangle</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Remove Stopwords</InputLabel>
              <Select
                value={settings.removeStopwords}
                onChange={(e) => setSettings(prev => ({ ...prev, removeStopwords: e.target.value === 'true' }))}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Include Common Words</InputLabel>
              <Select
                value={settings.includeCommonWords}
                onChange={(e) => setSettings(prev => ({ ...prev, includeCommonWords: e.target.value === 'true' }))}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
                onClick={() => manualText ? generateFromText(manualText) : generateFromDocument()}
                disabled={loading || (!documentId && !manualText && !text)}
                sx={{ mr: 1 }}
              >
                Regenerate
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<GetApp />}
                onClick={handleExportImage}
                disabled={loading || cloudData.length === 0}
              >
                Export as Image
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {loading ? (
        <LoadingSpinner message="Generating word cloud..." />
      ) : cloudData.length > 0 ? (
        <Box sx={{ textAlign: 'center' }}>
          <WordCloudChart
            data={cloudData}
            width={width}
            height={height}
            fontFamily={settings.fontFamily}
            colorScheme={settings.colorScheme}
            rotation={settings.rotation}
            shape={settings.shape}
            showFrequency={settings.showFrequency}
          />
        </Box>
      ) : (
        <Card variant="outlined" sx={{ textAlign: 'center', p: 4 }}>
          <CloudQueue sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6">No Word Cloud Generated Yet</Typography>
          <Typography variant="body2" color="text.secondary">
            {error || "Enter text or choose a document to generate a word cloud."}
          </Typography>
        </Card>
      )}
    </Paper>
  );
};

export default WordCloudVisualizer;
