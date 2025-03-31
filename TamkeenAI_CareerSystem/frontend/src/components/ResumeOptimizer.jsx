import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar
} from '@mui/material';
import {
  AutoFixHigh,
  CheckCircle,
  Error,
  Lightbulb,
  ContentCopy,
  ArrowForward,
  ExpandMore,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  Edit,
  Star,
  Refresh,
  Psychology
} from '@mui/icons-material';
import apiEndpoints from '../utils/api';

/**
 * AI-powered component that suggests resume enhancements based on ATS analysis and skill gaps
 */
const ResumeOptimizer = ({ resumeData, atsResults, skillGapData, aiSuggestions = null, onApplyChanges, onRefreshRequested }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Use aiSuggestions if provided, otherwise generate suggestions
  useEffect(() => {
    if (aiSuggestions) {
      // Format AI suggestions to match our component's expected structure
      const formattedSuggestions = formatAiSuggestions(aiSuggestions);
      setSuggestions(formattedSuggestions);
    } else if (resumeData && atsResults && !suggestions && !loading) {
      generateSuggestions();
    }
  }, [resumeData, atsResults, aiSuggestions]);
  
  // Format AI suggestions from the analyzer to match our expected structure
  const formatAiSuggestions = (aiData) => {
    if (!aiData) return null;
    
    return {
      summary: {
        atsScore: atsResults?.score || 0,
        verdict: getVerdict(atsResults?.score || 0),
        overallRecommendation: aiData.summary || "Based on AI analysis, consider the following improvements to your resume."
      },
      sections: {
        suggestions: aiData.suggestions.map(suggestion => ({
          id: suggestion.id || Math.random().toString(36).substring(2),
          title: suggestion.title,
          type: suggestion.category || 'general',
          priority: suggestion.priority || 'medium',
          content: suggestion.description,
          examples: suggestion.examples,
          actionable: suggestion.actionable || false,
          applied: suggestion.applied || false
        })),
        nextSteps: aiData.nextSteps || []
      }
    };
  };
  
  // Get ATS verdict based on score
  const getVerdict = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 70) return 'Strong';
    if (score >= 60) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };
  
  // Generate optimization suggestions using LLM
  const generateSuggestions = async () => {
    if (!resumeData || !atsResults) {
      setError('Resume data or ATS results missing');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call to get AI suggestions
      const response = await apiEndpoints.ai.getResumeSuggestions({
        resumeId: resumeData.id,
        analysisData: atsResults,
        jobTitle: atsResults.jobTitle || 'General',
        jobDescription: atsResults.jobDescription || ''
      });
      
      const formattedSuggestions = formatAiSuggestions(response.data);
      setSuggestions(formattedSuggestions);
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError('Failed to generate suggestions: ' + (err.message || 'Unknown error'));
      
      // Fallback to mock data if in development
      if (process.env.NODE_ENV === 'development') {
        generateMockSuggestions();
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Generate mock suggestions for development/testing
  const generateMockSuggestions = () => {
    // Extract data to use for suggestions
    const missingKeywords = atsResults?.missing_keywords || [];
    const matchScore = atsResults?.score || 0;
    const passVerdict = getVerdict(matchScore);
    
    // Get skill gaps (if available)
    const skillGaps = [];
    if (skillGapData && skillGapData.categories) {
      Object.entries(skillGapData.categories).forEach(([category, data]) => {
        const gap = (data.required_level || 0) - (data.average_level || 0);
        if (gap > 0) {
          skillGaps.push({
            category,
            gap,
            importance: gap > 2 ? 'high' : gap > 1 ? 'medium' : 'low'
          });
        }
      });
    }
    
    // Generate mock suggestions
    const mockSuggestions = {
      summary: {
        atsScore: matchScore,
        verdict: passVerdict,
        overallRecommendation: `Our AI suggests enhancing your resume to better align with job requirements. Focus on adding missing keywords and strengthening your ${skillGaps[0]?.category || 'technical'} skills section.`
      },
      sections: {
        suggestions: [
          {
            id: '1',
            title: 'Enhance your professional summary',
            type: 'summary',
            priority: 'high',
            content: `Your current summary could be enhanced with specific keywords that ATS systems look for. Consider incorporating terms like ${missingKeywords.slice(0, 3).join(', ')}.`,
            examples: `Results-driven professional with expertise in ${(atsResults?.matched_keywords || []).slice(0, 3).join(', ')}. Demonstrated success in delivering high-quality solutions while leveraging ${missingKeywords.slice(0, 2).join(' and ')} knowledge.`,
            actionable: true
          },
          {
            id: '2',
            title: 'Add measurable achievements to experience',
            type: 'experience',
            priority: 'medium',
            content: 'Your experience section would be stronger with specific quantifiable achievements. Include metrics that demonstrate your impact.',
            examples: `• Improved system performance by 40% through implementation of optimized algorithms\n• Reduced operational costs by $150,000 annually by automating manual processes\n• Led a team of 5 engineers to deliver project 2 weeks ahead of schedule`,
            actionable: true
          },
          {
            id: '3',
            title: 'Add missing technical skills',
            type: 'skills',
            priority: 'high',
            content: `Your resume is missing several key skills that employers are looking for. Consider adding: ${missingKeywords.slice(0, 5).join(', ')}`,
            examples: null,
            actionable: true
          }
        ],
        nextSteps: [
          "Update your professional summary to include more relevant keywords",
          "Add measurable achievements to your experience section",
          "Include the missing technical skills in your skills section",
          "Use more action verbs at the beginning of bullet points"
        ]
      }
    };
    
    setSuggestions(mockSuggestions);
  };
  
  // Copy text to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Handle applying a suggestion
  const handleApplySuggestion = async (suggestionId, content) => {
    setLoading(true);
    
    try {
      // In a real implementation, call API to apply suggestion
      const success = await onApplyChanges(suggestionId, content);
      
      if (success) {
        // Mark suggestion as applied
        setSuggestions(prev => {
          const updated = {...prev};
          const suggestion = updated.sections.suggestions.find(s => s.id === suggestionId);
          if (suggestion) {
            suggestion.applied = true;
          }
          return updated;
        });
        
        setSuccessMessage("Suggestion applied successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError("Failed to apply suggestion: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle refresh request
  const handleRefresh = () => {
    if (onRefreshRequested) {
      onRefreshRequested();
    } else {
      generateSuggestions();
    }
  };
  
  // Handle accordion expansion
  const handleAccordionChange = (section) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? section : null);
  };
  
  // Get color based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'primary';
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size={40} />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Generating AI-powered resume suggestions...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }
  
  if (!suggestions) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <AutoFixHigh sx={{ fontSize: 40, color: 'action.disabled', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          No Suggestions Available
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Generate AI-powered suggestions to improve your resume and increase your chances of passing ATS systems.
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AutoFixHigh />}
          onClick={handleRefresh}
        >
          Generate Suggestions
        </Button>
      </Paper>
    );
  }
  
  return (
    <Box>
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          background: 'linear-gradient(to right, #f8f9fa, #ffffff)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Psychology color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h6">AI Resume Suggestions</Typography>
          
          <Box sx={{ ml: 'auto' }}>
            <Button 
              startIcon={<Refresh />}
              size="small"
              onClick={handleRefresh}
              sx={{ fontWeight: 500 }}
            >
              Refresh Suggestions
            </Button>
          </Box>
        </Box>
        
        <Alert 
          variant="filled"
          severity={
            suggestions.summary.atsScore >= 80 ? "success" : 
            suggestions.summary.atsScore >= 60 ? "info" : 
            suggestions.summary.atsScore >= 40 ? "warning" : "error"
          }
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            {suggestions.summary.verdict} Match • {suggestions.summary.atsScore}% ATS Score
          </Typography>
          <Typography variant="body2">
            {suggestions.summary.overallRecommendation}
          </Typography>
        </Alert>
        
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AutoFixHigh sx={{ mr: 1, color: 'primary.main' }} />
            Improvement Suggestions
          </Typography>
          
          {suggestions.sections.suggestions?.map((suggestion, index) => (
            <Accordion 
              key={suggestion.id || index}
              sx={{ 
                mb: 2,
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
                '&:before': { display: 'none' },
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMore />}
                sx={{
                  bgcolor: suggestion.applied ? 'success.lighter' : 'background.paper'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography 
                    sx={{ flexGrow: 1, fontWeight: 500 }}
                    color={suggestion.applied ? 'success.dark' : `${getPriorityColor(suggestion.priority)}.main`}
                  >
                    {suggestion.applied && (
                      <CheckCircle fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    )}
                    {suggestion.title}
                  </Typography>
                  
                  <Chip 
                    label={suggestion.priority} 
                    size="small"
                    color={getPriorityColor(suggestion.priority)}
                    sx={{ ml: 1, textTransform: 'capitalize' }}
                  />
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  {suggestion.content}
                </Typography>
                
                {suggestion.examples && (
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
                      Examples:
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'background.default',
                        position: 'relative'
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        component="pre" 
                        sx={{ 
                          m: 0, 
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontSize: '0.875rem'
                        }}
                      >
                        {suggestion.examples}
                      </Typography>
                      
                      <IconButton 
                        size="small"
                        onClick={() => handleCopy(suggestion.examples)}
                        sx={{ 
                          position: 'absolute',
                          top: 8,
                          right: 8
                        }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Paper>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  {suggestion.actionable && !suggestion.applied && (
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      startIcon={<AutoFixHigh />}
                      onClick={() => handleApplySuggestion(suggestion.id, suggestion.examples || suggestion.content)}
                      disabled={loading}
                    >
                      Apply This Suggestion
                    </Button>
                  )}
                  
                  {suggestion.applied && (
                    <Chip 
                      label="Applied" 
                      color="success" 
                      size="small"
                      icon={<CheckCircle />}
                    />
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
        
        {suggestions.sections.nextSteps && suggestions.sections.nextSteps.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Next Steps
            </Typography>
            <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
              {suggestions.sections.nextSteps.map((step, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Chip 
                      label={index + 1} 
                      size="small" 
                      sx={{ height: 24, width: 24, minWidth: 24, fontSize: '0.75rem' }} 
                    />
                  </ListItemIcon>
                  <ListItemText primary={step} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
      
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default ResumeOptimizer; 