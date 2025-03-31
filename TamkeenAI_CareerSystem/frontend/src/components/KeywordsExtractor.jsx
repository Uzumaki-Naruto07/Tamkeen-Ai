import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Search,
  Refresh,
  FilterList,
  ContentCopy,
  SaveAlt,
  Visibility,
  Add,
  Delete,
  Label
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import apiEndpoints from '../utils/api';

const KeywordsExtractor = ({ resumeId, resumeData, jobData }) => {
  const theme = useTheme();
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('weight');
  const [filterType, setFilterType] = useState('all');
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [savedKeywordSets, setSavedKeywordSets] = useState([]);
  
  // Extract keywords from resume text
  useEffect(() => {
    if (resumeId) {
      extractKeywords();
    }
  }, [resumeId, jobData]);
  
  const extractKeywords = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Normally would call an API endpoint here
      // For now, we'll generate mock data based on resumeData
      
      // In a real implementation, this would be:
      // const response = await apiEndpoints.resume.extractKeywords(resumeId);
      // setKeywords(response.data);
      
      setTimeout(() => {
        const extractedKeywords = generateKeywords(resumeData, jobData);
        setKeywords(extractedKeywords);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error extracting keywords:', err);
      setError('Failed to extract keywords. Please try again.');
      setLoading(false);
    }
  };
  
  // Generate keywords from resume text (mock implementation)
  const generateKeywords = (resume, job) => {
    if (!resume) return [];
    
    // Extract text from resume
    let fullText = '';
    
    // Add personal info
    if (resume.personal) {
      fullText += resume.personal.summary || '';
    }
    
    // Add experience descriptions
    if (resume.experience && Array.isArray(resume.experience)) {
      resume.experience.forEach(exp => {
        fullText += ' ' + (exp.description || '');
        fullText += ' ' + (exp.position || '');
        fullText += ' ' + (exp.company || '');
      });
    }
    
    // Add skills
    if (resume.skills && Array.isArray(resume.skills)) {
      resume.skills.forEach(skill => {
        fullText += ' ' + (typeof skill === 'string' ? skill : skill.name || '');
      });
    }
    
    // Add education
    if (resume.education && Array.isArray(resume.education)) {
      resume.education.forEach(edu => {
        fullText += ' ' + (edu.degree || '');
        fullText += ' ' + (edu.fieldOfStudy || '');
      });
    }
    
    // Simple word frequency counting (stopwords should be filtered out in a real implementation)
    const stopwords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
      'when', 'where', 'how', 'who', 'which', 'this', 'that', 'to', 'in',
      'on', 'for', 'with', 'by', 'at', 'from', 'is', 'are', 'was', 'were',
      'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did'
    ]);
    
    const words = fullText.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopwords.has(word));
    
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    // Get job keywords if available
    let jobKeywords = [];
    if (job && job.description) {
      const jobText = job.description.toLowerCase();
      jobKeywords = jobText
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopwords.has(word));
    }
    
    const jobKeywordsSet = new Set(jobKeywords);
    
    // Create keyword objects with frequency, weight, and status
    const keywordArray = Object.keys(wordFreq).map(word => {
      const frequency = wordFreq[word];
      const inJobDescription = jobKeywordsSet.has(word);
      
      // Mock weight calculation (1-10)
      const weight = Math.min(10, Math.max(1, Math.floor(frequency * 0.7 + Math.random() * 3)));
      
      // Determine status and color
      let status, color;
      if (inJobDescription && weight >= 6) {
        status = 'matched';
        color = 'green';
      } else if (inJobDescription && weight < 6) {
        status = 'weak';
        color = 'orange';
      } else {
        status = 'missing';
        color = 'red';
      }
      
      return {
        text: word,
        frequency,
        weight,
        status,
        color,
        value: weight * frequency // For word cloud visualization
      };
    });
    
    // Sort by combined score
    return keywordArray.sort((a, b) => b.value - a.value);
  };
  
  // Filter and sort keywords
  const filteredKeywords = useMemo(() => {
    return keywords
      .filter(keyword => {
        // Filter by search term
        const matchesSearch = keyword.text.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter by type
        const matchesType = 
          filterType === 'all' ||
          (filterType === 'matched' && keyword.status === 'matched') ||
          (filterType === 'missing' && keyword.status === 'missing') ||
          (filterType === 'weak' && keyword.status === 'weak');
        
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        // Sort by selected criterion
        if (sortBy === 'alphabetical') {
          return a.text.localeCompare(b.text);
        } else if (sortBy === 'frequency') {
          return b.frequency - a.frequency;
        } else if (sortBy === 'weight') {
          return b.weight - a.weight;
        } else {
          return b.value - a.value; // Default: sort by value (weight * frequency)
        }
      });
  }, [keywords, searchTerm, filterType, sortBy]);
  
  // Handle keyword selection
  const toggleKeywordSelection = (keyword) => {
    if (selectedKeywords.some(k => k.text === keyword.text)) {
      setSelectedKeywords(selectedKeywords.filter(k => k.text !== keyword.text));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };
  
  // Save current selection as a set
  const saveKeywordSet = () => {
    if (selectedKeywords.length === 0) return;
    
    const newSet = {
      id: Date.now(),
      name: `Selection ${savedKeywordSets.length + 1}`,
      keywords: [...selectedKeywords]
    };
    
    setSavedKeywordSets([...savedKeywordSets, newSet]);
  };
  
  // Export keywords as JSON
  const exportKeywords = () => {
    const keywordsToExport = selectedKeywords.length > 0 ? selectedKeywords : keywords;
    const dataStr = JSON.stringify(keywordsToExport, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'resume_keywords.json');
    linkElement.click();
  };
  
  // Copy keywords to clipboard
  const copyToClipboard = () => {
    const keywordsToExport = selectedKeywords.length > 0 ? selectedKeywords : keywords;
    const dataStr = JSON.stringify(keywordsToExport, null, 2);
    
    navigator.clipboard.writeText(dataStr)
      .then(() => {
        // Could show a success message here
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  return (
    <Card sx={{ p: 0, borderRadius: 2, boxShadow: theme.shadows[3] }}>
      <CardContent sx={{ px: 3, py: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <Label sx={{ mr: 1, color: theme.palette.primary.main }} />
            Resume Keywords Extractor
          </Typography>
          
          <Box>
            <Tooltip title="Refresh Keywords">
              <IconButton 
                color="primary" 
                onClick={extractKeywords}
                disabled={loading}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Export Keywords">
              <IconButton 
                color="primary" 
                onClick={exportKeywords}
              >
                <SaveAlt />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Copy as JSON">
              <IconButton 
                color="primary" 
                onClick={copyToClipboard}
              >
                <ContentCopy />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search Keywords"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={6} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Filter By</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Filter By"
                  >
                    <MenuItem value="all">All Keywords</MenuItem>
                    <MenuItem value="matched">Matched Keywords</MenuItem>
                    <MenuItem value="missing">Missing Keywords</MenuItem>
                    <MenuItem value="weak">Weak Keywords</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="value">Relevance</MenuItem>
                    <MenuItem value="weight">Weight</MenuItem>
                    <MenuItem value="frequency">Frequency</MenuItem>
                    <MenuItem value="alphabetical">Alphabetical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 1
            }}>
              <Typography variant="body2" color="text.secondary">
                {filteredKeywords.length} keywords found
              </Typography>
              
              {selectedKeywords.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedKeywords.length} selected
                  </Typography>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<SaveAlt />}
                    onClick={saveKeywordSet}
                  >
                    Save Selection
                  </Button>
                </Box>
              )}
            </Box>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 2, 
                mb: 2, 
                maxHeight: 300, 
                overflow: 'auto',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1
              }}
            >
              {filteredKeywords.length > 0 ? (
                filteredKeywords.map((keyword) => (
                  <Chip
                    key={keyword.text}
                    label={`${keyword.text} (${keyword.frequency})`}
                    onClick={() => toggleKeywordSelection(keyword)}
                    color={
                      keyword.status === 'matched' ? 'success' :
                      keyword.status === 'weak' ? 'warning' : 'error'
                    }
                    variant={selectedKeywords.some(k => k.text === keyword.text) ? 'filled' : 'outlined'}
                    sx={{ 
                      m: 0.5,
                      '&.MuiChip-filledSuccess': { bgcolor: 'success.main' },
                      '&.MuiChip-filledWarning': { bgcolor: 'warning.main' },
                      '&.MuiChip-filledError': { bgcolor: 'error.main' },
                    }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, width: '100%', textAlign: 'center' }}>
                  No keywords match your filters
                </Typography>
              )}
            </Paper>
            
            {savedKeywordSets.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Saved Keyword Sets
                </Typography>
                <Stack spacing={1}>
                  {savedKeywordSets.map((set) => (
                    <Paper 
                      key={set.id} 
                      variant="outlined"
                      sx={{ p: 1 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {set.name} ({set.keywords.length} keywords)
                        </Typography>
                        
                        <Box>
                          <Tooltip title="Load this set">
                            <IconButton 
                              size="small" 
                              onClick={() => setSelectedKeywords(set.keywords)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Delete set">
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => setSavedKeywordSets(savedKeywordSets.filter(s => s.id !== set.id))}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {set.keywords.slice(0, 8).map((kw) => (
                          <Chip
                            key={`${set.id}-${kw.text}`}
                            label={kw.text}
                            size="small"
                            color={
                              kw.status === 'matched' ? 'success' :
                              kw.status === 'weak' ? 'warning' : 'error'
                            }
                            variant="outlined"
                            sx={{ height: 24 }}
                          />
                        ))}
                        
                        {set.keywords.length > 8 && (
                          <Chip
                            label={`+${set.keywords.length - 8} more`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 24 }}
                          />
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Keyword Legend
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip color="success" size="small" label=" " sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Matched Keywords
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip color="warning" size="small" label=" " sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Weak Keywords
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip color="error" size="small" label=" " sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Missing In Job
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordsExtractor; 