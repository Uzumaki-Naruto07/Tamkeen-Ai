import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  CircularProgress,
  Collapse,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  useTheme,
  alpha
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import BoltIcon from '@mui/icons-material/Bolt';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useJob, useResume } from './AppContext';
import apiEndpoints from '../utils/api';

const KeywordMatchDisplay = ({ 
  matchData = null, 
  loading = false, 
  onSuggestionClick = () => {},
  showRelevanceScore = true,
  enableSuggestions = true,
  compact = false
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [sortOption, setSortOption] = useState('relevance'); // 'relevance', 'alphabetical'
  const { currentResume } = useResume();
  const { currentJobDescription } = useJob();
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisData, setAnalysisData] = useState(matchData);
  
  // Demo data if none provided
  const defaultData = {
    summary: {
      matched: 18,
      missing: 12,
      total: 30,
      matchScore: 60,
      categories: {
        'Technical Skills': { matched: 8, missing: 4 },
        'Soft Skills': { matched: 4, missing: 2 },
        'Experience': { matched: 3, missing: 3 },
        'Education': { matched: 2, missing: 1 },
        'Industry Knowledge': { matched: 1, missing: 2 }
      }
    },
    matched: [
      { text: 'Python', category: 'Technical Skills', relevance: 95 },
      { text: 'Data Analysis', category: 'Technical Skills', relevance: 92 },
      { text: 'SQL', category: 'Technical Skills', relevance: 88 },
      { text: 'Machine Learning', category: 'Technical Skills', relevance: 85 },
      { text: 'Data Visualization', category: 'Technical Skills', relevance: 80 },
      { text: 'Pandas', category: 'Technical Skills', relevance: 78 },
      { text: 'NumPy', category: 'Technical Skills', relevance: 75 },
      { text: 'Git', category: 'Technical Skills', relevance: 70 },
      { text: 'Teamwork', category: 'Soft Skills', relevance: 85 },
      { text: 'Communication', category: 'Soft Skills', relevance: 83 },
      { text: 'Problem Solving', category: 'Soft Skills', relevance: 80 },
      { text: 'Critical Thinking', category: 'Soft Skills', relevance: 75 },
      { text: 'Data Scientist', category: 'Experience', relevance: 90 },
      { text: 'Research', category: 'Experience', relevance: 82 },
      { text: 'Project Management', category: 'Experience', relevance: 75 },
      { text: 'Bachelor\'s Degree', category: 'Education', relevance: 85 },
      { text: 'Master\'s Degree', category: 'Education', relevance: 90 },
      { text: 'Healthcare Analytics', category: 'Industry Knowledge', relevance: 78 }
    ],
    missing: [
      { text: 'TensorFlow', category: 'Technical Skills', relevance: 92, suggestion: 'Add experience with TensorFlow models' },
      { text: 'PyTorch', category: 'Technical Skills', relevance: 90, suggestion: 'Include PyTorch in your skills section' },
      { text: 'Scikit-learn', category: 'Technical Skills', relevance: 88, suggestion: 'Mention scikit-learn usage in projects' },
      { text: 'Kubernetes', category: 'Technical Skills', relevance: 75, suggestion: 'Add container orchestration experience' },
      { text: 'Leadership', category: 'Soft Skills', relevance: 80, suggestion: 'Highlight team leadership roles' },
      { text: 'Agile', category: 'Soft Skills', relevance: 75, suggestion: 'Mention experience with Agile methodologies' },
      { text: 'Lead Data Scientist', category: 'Experience', relevance: 85, suggestion: 'Emphasize leadership aspects in data roles' },
      { text: 'Startup Experience', category: 'Experience', relevance: 70, suggestion: 'Highlight any work in fast-paced environments' },
      { text: 'Cross-functional Teams', category: 'Experience', relevance: 65, suggestion: 'Mention collaboration across departments' },
      { text: 'Ph.D.', category: 'Education', relevance: 70, suggestion: 'If applicable, highlight doctoral research' },
      { text: 'Finance Domain', category: 'Industry Knowledge', relevance: 85, suggestion: 'Add any finance-related projects or knowledge' },
      { text: 'Regulatory Compliance', category: 'Industry Knowledge', relevance: 80, suggestion: 'Mention experience with industry regulations' }
    ]
  };
  
  // Fetch analysis data if resume and job are available but no data provided
  useEffect(() => {
    if (!matchData && currentResume && currentJobDescription && !analysisLoading) {
      const fetchAnalysis = async () => {
        setAnalysisLoading(true);
        setAnalysisError(null);
        
        try {
          // This connects to keyword_extraction.py backend
          const response = await apiEndpoints.jobs.match(
            currentResume.id, 
            { jobDescription: currentJobDescription }
          );
          
          // Response includes keyword extraction using spaCy or KeyBERT
          setAnalysisData(response.data);
        } catch (err) {
          setAnalysisError(err.response?.data?.message || 'Failed to analyze keywords');
          console.error('Keyword analysis error:', err);
        } finally {
          setAnalysisLoading(false);
        }
      };
      
      fetchAnalysis();
    }
  }, [matchData, currentResume, currentJobDescription]);
  
  // Use loading prop or local loading state
  const isLoading = loading || analysisLoading;
  
  // Use provided data or fetched data
  const data = matchData || analysisData || defaultData;
  
  // Effect to initialize expanded categories
  useEffect(() => {
    if (data) {
      const initialExpandedState = Object.keys(data.summary.categories).reduce((acc, category) => {
        acc[category] = !compact;
        return acc;
      }, {});
      setExpandedCategories(initialExpandedState);
    }
  }, [data, compact]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };
  
  const handleToggleSuggestions = () => {
    setShowSuggestions(prev => !prev);
  };
  
  const handleToggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  const handleChangeSortOption = () => {
    setSortOption(prev => prev === 'relevance' ? 'alphabetical' : 'relevance');
  };
  
  // Filter and sort keywords
  const filterKeywords = (keywords) => {
    if (!keywords) return [];
    
    // Filter by search query
    let filtered = keywords;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = keywords.filter(keyword => 
        keyword.text.toLowerCase().includes(query) || 
        keyword.category.toLowerCase().includes(query)
      );
    }
    
    // Sort based on current sort option
    if (sortOption === 'relevance') {
      filtered = [...filtered].sort((a, b) => b.relevance - a.relevance);
    } else {
      filtered = [...filtered].sort((a, b) => a.text.localeCompare(b.text));
    }
    
    return filtered;
  };
  
  // Group keywords by category
  const groupByCategory = (keywords) => {
    return keywords.reduce((acc, keyword) => {
      if (!acc[keyword.category]) {
        acc[keyword.category] = [];
      }
      acc[keyword.category].push(keyword);
      return acc;
    }, {});
  };
  
  const filteredMatched = filterKeywords(data?.matched || []);
  const filteredMissing = filterKeywords(data?.missing || []);
  
  const groupedMatched = groupByCategory(filteredMatched);
  const groupedMissing = groupByCategory(filteredMissing);
  
  // Keyword counts for tabs
  const matchedCount = data?.matched?.length || 0;
  const missingCount = data?.missing?.length || 0;
  
  // Calculate match score
  const matchScore = data?.summary?.matchScore || Math.round((matchedCount / (matchedCount + missingCount)) * 100) || 0;
  
  // Color based on match score
  const getScoreColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  const scoreColor = getScoreColor(matchScore);
  
  // Render the match summary
  const renderMatchSummary = () => {
    return (
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box position="relative" display="inline-flex" sx={{ m: 1 }}>
                <CircularProgress
                  variant="determinate"
                  value={matchScore}
                  size={100}
                  thickness={5}
                  sx={{
                    color: scoreColor,
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
                  }}
                >
                  <Typography variant="h4" component="div" color="text.primary" fontWeight="bold">
                    {`${matchScore}%`}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Keyword Match Summary
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Your resume matches {matchedCount} out of {matchedCount + missingCount} keywords found in the job description.
              </Typography>
              
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {matchedCount} Matched Keywords
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center">
                    <ErrorIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {missingCount} Missing Keywords
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };
  
  // Render the keyword chips by category
  const renderKeywordsByCategory = (groupedKeywords, type = 'matched') => {
    const isMatched = type === 'matched';
    const categories = Object.keys(groupedKeywords);
    
    if (categories.length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {isMatched 
              ? "No matched keywords found." 
              : "No missing keywords found. Your resume matches all required keywords!"}
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box>
        {categories.map((category) => {
          const keywords = groupedKeywords[category];
          const isExpanded = expandedCategories[category];
          const categoryStats = data?.summary?.categories[category] || { matched: 0, missing: 0 };
          
          return (
            <Card key={category} variant="outlined" sx={{ mb: 2 }}>
              <CardHeader
                title={
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle1">{category}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {isMatched 
                        ? `${categoryStats.matched}/${categoryStats.matched + categoryStats.missing} matched`
                        : `${categoryStats.missing} missing`}
                    </Typography>
                  </Box>
                }
                action={
                  <IconButton 
                    onClick={() => handleToggleCategory(category)}
                    size="small"
                    edge="end"
                  >
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                }
                sx={{ 
                  py: 1, 
                  backgroundColor: alpha(
                    isMatched ? theme.palette.success.main : theme.palette.error.main, 
                    0.05
                  )
                }}
              />
              
              <Collapse in={isExpanded}>
                <CardContent sx={{ pt: 1 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {keywords.map((keyword, index) => (
                      <Tooltip 
                        key={`${keyword.text}-${index}`}
                        title={showRelevanceScore ? `Relevance: ${keyword.relevance}%` : ''}
                        arrow
                      >
                        <Chip
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {keyword.text}
                              {showRelevanceScore && (
                                <Typography 
                                  component="span" 
                                  sx={{ 
                                    ml: 0.5, 
                                    fontSize: '0.75rem',
                                    opacity: 0.7
                                  }}
                                >
                                  ({keyword.relevance}%)
                                </Typography>
                              )}
                            </Box>
                          }
                          icon={isMatched ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                          color={isMatched ? "success" : "error"}
                          variant={isMatched ? "filled" : "outlined"}
                          onClick={() => onSuggestionClick(keyword)}
                          sx={{ m: 0.5 }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                  
                  {!isMatched && enableSuggestions && (
                    <List dense sx={{ mt: 1 }}>
                      {keywords.filter(k => k.suggestion).map((keyword, index) => (
                        <ListItem key={`suggestion-${index}`} sx={{ px: 1 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <BoltIcon color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={keyword.suggestion}
                            primaryTypographyProps={{ 
                              variant: 'body2',
                              color: 'text.secondary'
                            }}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => onSuggestionClick(keyword)}
                            sx={{ ml: 1 }}
                          >
                            Add
                          </Button>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Collapse>
            </Card>
          );
        })}
      </Box>
    );
  };
  
  if (isLoading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Analyzing keywords...
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: compact ? 2 : 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant={compact ? "h6" : "h5"} component="h2">
          Keyword Analysis
        </Typography>
        
        <Box>
          <Tooltip title={sortOption === 'relevance' ? "Sort alphabetically" : "Sort by relevance"}>
            <IconButton size="small" onClick={handleChangeSortOption} sx={{ mr: 1 }}>
              <SortIcon />
            </IconButton>
          </Tooltip>
          
          {enableSuggestions && (
            <Tooltip title={showSuggestions ? "Hide suggestions" : "Show suggestions"}>
              <IconButton size="small" onClick={handleToggleSuggestions}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      
      {!compact && renderMatchSummary()}
      
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search keywords..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab 
            label={
              <Badge badgeContent={matchedCount} color="success" max={99}>
                <Box sx={{ pr: 2 }}>Matched Keywords</Box>
              </Badge>
            } 
            id="tab-matched"
          />
          <Tab 
            label={
              <Badge badgeContent={missingCount} color="error" max={99}>
                <Box sx={{ pr: 2 }}>Missing Keywords</Box>
              </Badge>
            } 
            id="tab-missing"
          />
        </Tabs>
      </Box>
      
      <Box role="tabpanel" hidden={tabValue !== 0}>
        {tabValue === 0 && renderKeywordsByCategory(groupedMatched, 'matched')}
      </Box>
      
      <Box role="tabpanel" hidden={tabValue !== 1}>
        {tabValue === 1 && renderKeywordsByCategory(groupedMissing, 'missing')}
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          size="small"
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          onClick={() => onSuggestionClick({ action: 'optimize' })}
        >
          Optimize Resume
        </Button>
      </Box>
    </Paper>
  );
};

export default KeywordMatchDisplay; 