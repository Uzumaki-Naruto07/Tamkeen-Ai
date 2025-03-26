import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Chip, Button,
  List, ListItem, ListItemText, ListItemIcon,
  Collapse, CircularProgress, Alert, Divider
} from '@mui/material';
import {
  Lightbulb, KeyboardArrowDown, KeyboardArrowUp,
  CheckCircle, Info, Warning, Error as ErrorIcon,
  Refresh
} from '@mui/icons-material';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const FeedbackSuggestionsBox = ({ 
  documentId, 
  documentType = 'resume', 
  context = null,
  refreshTrigger = 0
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  const fetchSuggestions = async () => {
    if (!documentId) {
      setError(`No ${documentType} provided for feedback`);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // This connects to feedback_generator.py backend
      const response = await apiEndpoints.feedback.getSuggestions({
        documentId,
        documentType,
        context: context || undefined
      });
      
      // Response includes tailored advice from feedback_generator.py
      setSuggestions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch feedback suggestions');
      console.error('Feedback error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSuggestions();
  }, [documentId, documentType, context, refreshTrigger]);
  
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'suggestion':
        return <Info color="info" />;
      case 'positive':
        return <CheckCircle color="success" />;
      default:
        return <Lightbulb color="primary" />;
    }
  };
  
  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <LoadingSpinner message="Generating feedback suggestions..." />
        </Box>
      </Paper>
    );
  }
  
  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchSuggestions}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Paper>
    );
  }
  
  if (!suggestions || suggestions.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="info">
          No feedback suggestions available for this {documentType}.
        </Alert>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <Lightbulb sx={{ mr: 1, color: 'primary.main' }} />
          Feedback Suggestions
        </Typography>
        
        <Button
          startIcon={<Refresh />}
          size="small"
          onClick={fetchSuggestions}
        >
          Refresh
        </Button>
      </Box>
      
      {suggestions.map((category, index) => (
        <Box key={category.id || index} sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              py: 1
            }}
            onClick={() => toggleSection(category.id || index)}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              {category.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={`${category.items.length} item${category.items.length !== 1 ? 's' : ''}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mr: 1 }}
              />
              {expandedSections[category.id || index] ? 
                <KeyboardArrowUp /> : 
                <KeyboardArrowDown />
              }
            </Box>
          </Box>
          
          <Divider />
          
          <Collapse in={expandedSections[category.id || index] || false}>
            <List>
              {category.items.map((item, itemIndex) => (
                <ListItem key={item.id || itemIndex} alignItems="flex-start">
                  <ListItemIcon>
                    {getSeverityIcon(item.severity)}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {item.description}
                        </Typography>
                        {item.suggestion && (
                          <Typography
                            component="div" 
                            variant="body2"
                            sx={{ mt: 1, px: 2, py: 1, bgcolor: 'background.paper', borderLeft: '4px solid', borderColor: 'primary.main' }}
                          >
                            <strong>Suggestion:</strong> {item.suggestion}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      ))}
    </Paper>
  );
};

export default FeedbackSuggestionsBox; 