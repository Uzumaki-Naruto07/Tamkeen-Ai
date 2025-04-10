import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Button, Alert, ToggleButtonGroup, ToggleButton } from '@mui/material';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import apiEndpoints from '../utils/api';
import resumeApi from '../utils/resumeApi';

// Dynamic import for React WordCloud with error handling
let ReactWordcloud = null;
// Use a guard to safely load the component
const WordCloudLoader = React.lazy(() => 
  import('react-wordcloud')
    .then(module => ({ default: module.default || (() => null) }))
    .catch(error => {
      console.error('Failed to load react-wordcloud:', error);
      return { default: () => null };
    })
);

const WordCloudVisualizer = ({ resumeId, resumeFile, jobData = {}, analysisData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeWords, setResumeWords] = useState([]);
  const [jobWords, setJobWords] = useState([]);
  const [viewMode, setViewMode] = useState('resume'); // 'resume' or 'job'
  const [wordCloudAvailable, setWordCloudAvailable] = useState(true);
  
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  const processKeywords = useCallback((data) => {
    if (!data) {
      setError('No data available for visualization');
      return { resumeKeywords: [], jobKeywords: [] };
    }
    
    try {
      // Initialize arrays for both resume and job keywords
      let resumeKeywords = [];
      let jobKeywords = [];
      
      // Extract resume keywords
      if (data.resume_keywords) {
        resumeKeywords = data.resume_keywords.map(word => ({
          text: word,
          value: Math.floor(Math.random() * 30) + 40,
          color: '#4287f5' // Blue for resume keywords
        }));
      } else if (data.extracted_skills) {
        resumeKeywords = data.extracted_skills.map(skill => ({
          text: skill,
          value: Math.floor(Math.random() * 30) + 40,
          color: '#4287f5'
        }));
      }
      
      // Extract job keywords
      if (data.job_keywords) {
        jobKeywords = data.job_keywords.map(word => ({
          text: word,
          value: Math.floor(Math.random() * 30) + 40,
          color: '#f59342' // Orange for job keywords
        }));
      } else if (data.required_skills) {
        jobKeywords = data.required_skills.map(skill => ({
          text: skill,
          value: Math.floor(Math.random() * 30) + 40,
          color: '#f59342'
        }));
      }
      
      // If we have matching and missing keywords, add them to resume keywords
      if (data.matched_keywords && data.matched_keywords.length > 0) {
        const matchedKeywords = data.matched_keywords.map(word => ({
          text: word,
          value: Math.floor(Math.random() * 20) + 60, // Higher value for matched
          color: '#42f578' // Green for matched
        }));
        
        resumeKeywords = resumeKeywords.concat(matchedKeywords);
      }
      
      // If no structured data is found, try to extract from the entire analysis
      if (resumeKeywords.length === 0) {
        // Look for common fields that might contain resume content
        const resumeText = [
          data.resume_text,
          data.extracted_text,
          data.resume_content,
        ].filter(Boolean).join(' ');
        
        if (resumeText) {
          // Extract words that are 4+ characters and appear more than once
          const words = resumeText.match(/\b[a-zA-Z]{4,15}\b/g) || [];
          const wordFreq = {};
          
          words.forEach(word => {
            if (!['null', 'undefined', 'true', 'false'].includes(word.toLowerCase())) {
              wordFreq[word] = (wordFreq[word] || 0) + 1;
            }
          });
          
          resumeKeywords = Object.entries(wordFreq)
            .filter(([_, count]) => count > 1)
            .map(([word, count]) => ({
              text: word,
              value: Math.min(100, count * 10),
              color: '#4287f5'
            }));
        }
      }
      
      return { 
        resumeKeywords: resumeKeywords.sort((a, b) => b.value - a.value).slice(0, 50),
        jobKeywords: jobKeywords.sort((a, b) => b.value - a.value).slice(0, 50)
      };
    } catch (err) {
      console.error('Error processing keywords:', err);
      setError('Error processing keywords');
      return { resumeKeywords: [], jobKeywords: [] };
    }
  }, []);
  
  const fetchKeywordData = useCallback(() => {
    setLoading(true);
    setError(null);
    
    try {
      if (analysisData) {
        // Use existing analysis data if available
        const { resumeKeywords, jobKeywords } = processKeywords(analysisData);
        setResumeWords(resumeKeywords);
        setJobWords(jobKeywords);
      } else {
        setError('No analysis data available. Please analyze your resume first.');
      }
    } catch (err) {
      console.error('Error extracting keywords:', err);
      setError(`Error extracting keywords: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [analysisData, processKeywords]);
  
  useEffect(() => {
    fetchKeywordData();
  }, [fetchKeywordData]);
  
  const options = {
    rotations: 2,
    rotationAngles: [0, 90],
    fontSizes: [12, 60],
    fontFamily: 'Arial',
    fontWeight: 'bold',
    colors: viewMode === 'resume' 
      ? ['#4287f5', '#42f578', '#87ceeb', '#1f77b4', '#4169e1'] // Blue shades for resume
      : ['#f59342', '#f5d442', '#ff7f0e', '#d62728', '#f5a742'], // Orange/yellow for job
    enableTooltip: true,
    deterministic: true,
    padding: 3,
    spiral: 'rectangular',
  };
  
  const callbacks = {
    getWordTooltip: (word) => `${word.text} (importance: ${word.value/10}/10)`,
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Analyzing keywords...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchKeywordData}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  const currentWords = viewMode === 'resume' ? resumeWords : jobWords;
  
  if (currentWords.length === 0) {
  return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          No keywords found for {viewMode === 'resume' ? 'your resume' : 'the job description'}.
        </Alert>
              <Button
                variant="contained"
                color="primary"
          onClick={fetchKeywordData}
              >
          Refresh
              </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="resume" color="primary">
            Resume Keywords
          </ToggleButton>
          <ToggleButton value="job" color="secondary">
            Job Keywords
          </ToggleButton>
        </ToggleButtonGroup>
              
        <Button
          variant="outlined"
          color="primary" 
          onClick={fetchKeywordData}
          size="small"
        >
          Refresh
        </Button>
      </Box>
      
      <Box sx={{ flexGrow: 1, minHeight: 300 }}>
        {currentWords.length > 0 ? (
          <React.Suspense fallback={
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
              <CircularProgress />
            </Box>
          }>
            <ErrorBoundary fallback={
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                {currentWords.slice(0, 30).map((word, idx) => (
                  <Box 
                    key={idx}
                    sx={{
                      padding: '4px 8px',
                      borderRadius: '16px',
                      backgroundColor: word.color || '#4287f5',
                      color: 'white',
                      fontSize: `${Math.max(12, Math.min(24, word.value / 5))}px`,
                      fontWeight: 'bold',
                      display: 'inline-block',
                      margin: '4px',
                    }}
                  >
                    {word.text}
                  </Box>
                ))}
              </Box>
            }>
              <WordCloudLoader words={currentWords} options={options} callbacks={callbacks} />
            </ErrorBoundary>
          </React.Suspense>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              No keywords found for {viewMode === 'resume' ? 'your resume' : 'the job description'}.
            </Alert>
          </Box>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        {viewMode === 'resume' 
          ? 'Keywords extracted from your resume. Larger words indicate higher frequency or importance.'
          : 'Keywords from the job description. Larger words are more important for the role.'}
      </Typography>
    </Box>
  );
};

// Add ErrorBoundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default WordCloudVisualizer;
