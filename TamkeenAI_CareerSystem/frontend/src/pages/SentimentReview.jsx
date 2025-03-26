import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  TextField, CircularProgress, Alert, Tooltip, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, List,
  ListItem, ListItemText, ListItemIcon, LinearProgress,
  Tabs, Tab, Accordion, AccordionSummary, AccordionDetails,
  RadioGroup, Radio, FormControlLabel, Slider, Badge,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Collapse, Snackbar, Switch, Drawer, Input, Fade
} from '@mui/material';
import {
  TextFields, Grading, Psychology, MoodBad, Mood, Upload,
  CloudUpload, Save, History, Compare, Refresh, Delete,
  CheckCircle, Warning, Error as ErrorIcon, Info, AddCircle,
  RemoveCircle, QuestionAnswer, RecordVoiceOver, Lightbulb,
  FormatQuote, Edit, ContentCopy, ExpandMore, Language,
  BarChart, Timeline, Whatshot, Insights, TimelineOutlined,
  FormatBold, FormatItalic, FormatUnderlined, Check, Close,
  CompareArrows, Bookmark, BookmarkBorder, AutoAwesome,
  ModeEdit, ReceiptLong, ChatBubbleOutline, Business, Work
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '@mui/material/styles';

// Charts
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Radar, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Diff viewer for text comparison
import ReactDiffViewer from 'react-diff-viewer';

// Color utilities
import { alpha } from '@mui/material/styles';

const SentimentReview = () => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [textType, setTextType] = useState('coverLetter'); // coverLetter, personalStatement, bio, other
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: Analysis, 1: Improvement, 2: History
  const [highlightMode, setHighlightMode] = useState('sentiment'); // sentiment, keywords, phrases, suggestions
  const [showRewriteSuggestions, setShowRewriteSuggestions] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [improvedText, setImprovedText] = useState('');
  const [showImprovedText, setShowImprovedText] = useState(false);
  const [textHistory, setTextHistory] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersionId, setCompareVersionId] = useState(null);
  const [textToRewrite, setTextToRewrite] = useState({ text: '', start: 0, end: 0 });
  const [rewriteDialog, setRewriteDialog] = useState(false);
  const [rewriteOptions, setRewriteOptions] = useState([]);
  const [selectedRewrite, setSelectedRewrite] = useState(0);
  const [improvementGoal, setImprovementGoal] = useState('professional'); // professional, positive, neutral, confident
  const [wordCount, setWordCount] = useState(0);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templatesDialogOpen, setTemplatesDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [industryOptions, setIndustryOptions] = useState([]);
  const [jobOptions, setJobOptions] = useState([]);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipContent, setTooltipContent] = useState({ text: '', position: { top: 0, left: 0 } });
  
  const textRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useUser();
  const theme = useTheme();
  
  // Load data from route state if available (coming from another page)
  useEffect(() => {
    if (location.state?.text) {
      setText(location.state.text);
      
      if (location.state.textType) {
        setTextType(location.state.textType);
      }
      
      if (location.state.jobTitle) {
        setJobTitle(location.state.jobTitle);
      }
      
      if (location.state.industry) {
        setIndustry(location.state.industry);
      }
      
      // Auto-analyze if all requirements are met
      if (location.state.text && location.state.autoAnalyze) {
        handleAnalyzeText();
      }
    }
    
    // Load industry options
    const loadIndustryOptions = async () => {
      try {
        const response = await apiEndpoints.jobs.getIndustries();
        setIndustryOptions(response.data);
      } catch (err) {
        console.error('Error loading industry options:', err);
      }
    };
    
    // Load job title options
    const loadJobOptions = async () => {
      try {
        const response = await apiEndpoints.jobs.getJobTitles();
        setJobOptions(response.data);
      } catch (err) {
        console.error('Error loading job options:', err);
      }
    };
    
    // Load text history
    const loadTextHistory = async () => {
      if (!profile?.id) return;
      
      try {
        const response = await apiEndpoints.sentiment.getHistory(profile.id);
        setTextHistory(response.data);
      } catch (err) {
        console.error('Error loading text history:', err);
      }
    };
    
    // Load saved templates
    const loadSavedTemplates = async () => {
      if (!profile?.id) return;
      
      try {
        const response = await apiEndpoints.sentiment.getTemplates(profile.id);
        setSavedTemplates(response.data);
      } catch (err) {
        console.error('Error loading saved templates:', err);
      }
    };
    
    loadIndustryOptions();
    loadJobOptions();
    loadTextHistory();
    loadSavedTemplates();
  }, [location, profile?.id]);
  
  // Update word count when text changes
  useEffect(() => {
    if (!text) {
      setWordCount(0);
      return;
    }
    
    const words = text.trim().split(/\s+/);
    setWordCount(words.length);
  }, [text]);
  
  // Analyze text
  const handleAnalyzeText = async () => {
    if (!text || text.trim() === '') {
      setError('Please enter some text to analyze.');
      return;
    }
    
    setAnalyzing(true);
    setError(null);
    setResults(null);
    
    try {
      const response = await apiEndpoints.sentiment.analyzeText({
        text,
        textType,
        jobTitle: jobTitle || undefined,
        industry: industry || undefined
      });
      
      setResults(response.data);
      
      // Save to history if we have a user profile
      if (profile?.id) {
        try {
          const saveResponse = await apiEndpoints.sentiment.saveAnalysis({
            userId: profile.id,
            text,
            textType,
            jobTitle: jobTitle || undefined,
            industry: industry || undefined,
            results: response.data
          });
          
          // Update history with the newly saved item
          setTextHistory([saveResponse.data, ...textHistory]);
          
        } catch (saveErr) {
          console.error('Error saving analysis to history:', saveErr);
        }
      }
      
      setAnalyzing(false);
      setActiveTab(0); // Switch to Analysis tab
      
    } catch (err) {
      console.error('Error analyzing text:', err);
      setError('An error occurred while analyzing your text. Please try again later.');
      setAnalyzing(false);
    }
  };
  
  // Generate improved text
  const handleImproveText = async () => {
    if (!results) {
      setError('Please analyze your text first.');
      return;
    }
    
    setIsImproving(true);
    setError(null);
    
    try {
      const response = await apiEndpoints.sentiment.improveText({
        text,
        textType,
        jobTitle: jobTitle || undefined,
        industry: industry || undefined,
        goal: improvementGoal
      });
      
      setImprovedText(response.data.improvedText);
      setShowImprovedText(true);
      setIsImproving(false);
      
    } catch (err) {
      console.error('Error improving text:', err);
      setError('An error occurred while generating improvements. Please try again later.');
      setIsImproving(false);
    }
  };
  
  // Load a saved text version from history
  const handleLoadVersion = (version) => {
    setText(version.text);
    setTextType(version.textType);
    setJobTitle(version.jobTitle || '');
    setIndustry(version.industry || '');
    setResults(version.results);
    setSelectedVersion(version.id);
    setHistoryDialogOpen(false);
  };
  
  // Compare two versions
  const handleCompareVersions = async () => {
    if (!selectedVersion || !compareVersionId || selectedVersion === compareVersionId) {
      return;
    }
    
    setLoading(true);
    
    try {
      const firstVersion = textHistory.find(v => v.id === selectedVersion);
      const secondVersion = textHistory.find(v => v.id === compareVersionId);
      
      if (firstVersion && secondVersion) {
        setCompareMode(true);
        // Additional comparison logic can be added here if needed
      }
      
      setLoading(false);
      
    } catch (err) {
      console.error('Error comparing versions:', err);
      setError('Failed to compare versions. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle selecting text for rewriting
  const handleTextSelection = () => {
    if (!textRef.current) return;
    
    const selection = window.getSelection();
    if (selection.toString().length === 0) return;
    
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(textRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + selection.toString().length;
    
    setTextToRewrite({
      text: selection.toString(),
      start,
      end
    });
    
    if (selection.toString().length > 0) {
      handleGenerateRewriteOptions(selection.toString());
    }
  };
  
  // Generate rewrite options for selected text
  const handleGenerateRewriteOptions = async (selectedText) => {
    if (!selectedText || selectedText.trim() === '') return;
    
    setRewriteDialog(true);
    setRewriteOptions([]);
    setSelectedRewrite(0);
    
    try {
      const response = await apiEndpoints.sentiment.generateRewrites({
        text: selectedText,
        textType,
        goal: improvementGoal,
        count: 3
      });
      
      setRewriteOptions(response.data.options);
      
    } catch (err) {
      console.error('Error generating rewrite options:', err);
      setSnackbarMessage('Failed to generate rewrite options.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Apply selected rewrite option
  const handleApplyRewrite = () => {
    if (rewriteOptions.length === 0 || !textToRewrite.text) {
      setRewriteDialog(false);
      return;
    }
    
    const selectedOption = rewriteOptions[selectedRewrite];
    const newText = text.substring(0, textToRewrite.start) + 
                    selectedOption + 
                    text.substring(textToRewrite.end);
    
    setText(newText);
    setRewriteDialog(false);
    
    // Clear results since text has changed
    setResults(null);
  };
  
  // Save text as template
  const handleSaveTemplate = async () => {
    if (!text || text.trim() === '' || !templateName || templateName.trim() === '') {
      setSnackbarMessage('Please provide both text and a template name.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      const response = await apiEndpoints.sentiment.saveTemplate({
        userId: profile.id,
        name: templateName,
        text,
        textType,
        jobTitle: jobTitle || undefined,
        industry: industry || undefined
      });
      
      setSavedTemplates([...savedTemplates, response.data]);
      setSaveTemplateDialogOpen(false);
      setTemplateName('');
      
      setSnackbarMessage('Template saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
    } catch (err) {
      console.error('Error saving template:', err);
      setSnackbarMessage('Failed to save template.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Load a saved template
  const handleLoadTemplate = (template) => {
    setText(template.text);
    setTextType(template.textType);
    setJobTitle(template.jobTitle || '');
    setIndustry(template.industry || '');
    setTemplatesDialogOpen(false);
    
    // Clear results since text has changed
    setResults(null);
  };
  
  // Upload a document to analyze
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await apiEndpoints.sentiment.uploadDocument(formData);
      setText(response.data.text);
      setLoading(false);
      
      setSnackbarMessage('Document uploaded and text extracted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
      setLoading(false);
    }
  };
  
  // Apply improved text
  const handleApplyImprovedText = () => {
    setText(improvedText);
    setShowImprovedText(false);
    setResults(null); // Clear results since text has changed
  };
  
  // Show tooltip for highlighted text
  const handleTooltipOpen = (content, event) => {
    setTooltipContent({
      text: content,
      position: { top: event.clientY, left: event.clientX }
    });
    setTooltipOpen(true);
  };
  
  // Format sentiment score color
  const getSentimentColor = (score) => {
    if (score >= 0.7) return theme.palette.success.main;
    if (score >= 0.4) return theme.palette.info.main;
    if (score >= 0) return theme.palette.warning.main;
    return theme.palette.error.main;
  };
  
  // Get sentiment label
  const getSentimentLabel = (score) => {
    if (score >= 0.7) return 'Very Positive';
    if (score >= 0.4) return 'Positive';
    if (score >= 0) return 'Neutral';
    if (score >= -0.4) return 'Negative';
    return 'Very Negative';
  };
  
  // Format highlighted text
  const formatHighlightedText = () => {
    if (!results || !text) return text;
    
    // Implementation for formatting highlighted text
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              Sentiment Review
            </Typography>
            <Typography variant="body1" gutterBottom>
              Analyze and improve the sentiment, tone, and professionalism of your text.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            {/* Text input and analysis results */}
          </Grid>
          <Grid item xs={12}>
            {/* Improvement tools and options */}
          </Grid>
          <Grid item xs={12}>
            {/* History and comparison */}
          </Grid>
          <Grid item xs={12}>
            {/* Templates and settings */}
          </Grid>
          <Grid item xs={12}>
            {/* Save Template Dialog */}
            <Dialog
              open={saveTemplateDialogOpen}
              onClose={() => setSaveTemplateDialogOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                Save Text as Template
              </DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Template Name"
                  fullWidth
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSaveTemplateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveTemplate}
                  variant="contained"
                  disabled={!templateName.trim()}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
            
            {/* Tooltip */}
            <Fade in={tooltipOpen}>
              <Paper
                elevation={3}
                sx={{
                  position: 'fixed',
                  zIndex: 1500,
                  top: tooltipContent.position.top + 10,
                  left: tooltipContent.position.left + 10,
                  p: 1.5,
                  maxWidth: 300,
                  pointerEvents: 'none'
                }}
              >
                <Typography variant="body2">
                  {tooltipContent.text}
                </Typography>
              </Paper>
            </Fade>
            
            {/* Rewrite Options Dialog */}
            <Dialog
              open={rewriteDialog}
              onClose={() => setRewriteDialog(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>
                Rewrite Options
              </DialogTitle>
              <DialogContent>
                <Typography variant="subtitle2" gutterBottom>
                  Original Text:
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
                  <Typography>
                    {textToRewrite.text}
                  </Typography>
                </Paper>
                
                <Typography variant="subtitle2" gutterBottom>
                  Choose a rewrite option:
                </Typography>
                
                {rewriteOptions.length > 0 ? (
                  <RadioGroup
                    value={selectedRewrite}
                    onChange={(e) => setSelectedRewrite(Number(e.target.value))}
                  >
                    {rewriteOptions.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={index}
                        control={<Radio />}
                        label={
                          <Paper 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              my: 1, 
                              bgcolor: selectedRewrite === index ? alpha(theme.palette.primary.main, 0.1) : 'background.default',
                              borderColor: selectedRewrite === index ? 'primary.main' : 'divider'
                            }}
                          >
                            <Typography>{option}</Typography>
                          </Paper>
                        }
                      />
                    ))}
                  </RadioGroup>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={30} />
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setRewriteDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleApplyRewrite}
                  disabled={rewriteOptions.length === 0}
                >
                  Apply Selected Rewrite
                </Button>
              </DialogActions>
            </Dialog>
            
            {/* Snackbar for notifications */}
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={6000}
              onClose={() => setSnackbarOpen(false)}
            >
              <Alert 
                onClose={() => setSnackbarOpen(false)} 
                severity={snackbarSeverity}
                sx={{ width: '100%' }}
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SentimentReview;