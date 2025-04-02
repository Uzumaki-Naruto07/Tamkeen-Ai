import React, { useState, useRef } from 'react';
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
  Paper,
  CardHeader,
  Grid,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  LinearProgress,
  Step,
  StepLabel,
  Stepper
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
import ArrowForward from '@mui/icons-material/ArrowForward';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import apiEndpoints from '../utils/api';

const ATSResultsCard = ({ analysis, onReAnalyze }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showMissing, setShowMissing] = useState(true);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  
  if (!analysis) {
    // Enhanced loading state with processing milestones and time estimates
    const analysisSteps = [
      { label: 'Extracting Text', detail: 'Processing document structure' },
      { label: 'Analyzing Keywords', detail: 'Identifying key terms and skills' }, 
      { label: 'Matching Content', detail: 'Comparing with job requirements' },
      { label: 'Generating Report', detail: 'Creating your personalized analysis' }
    ];
    const [activeStep, setActiveStep] = useState(0);
    const [loadingProgress, setLoadingProgress] = useState(0);
    
    // Simulate progress through the steps
    React.useEffect(() => {
      // Show quick steps for faster perceived performance
      const stepTimer = setInterval(() => {
        setActiveStep((prevStep) => {
          // Go through steps faster
          const nextStep = prevStep < 3 ? prevStep + 1 : 3;
          return nextStep;
        });
      }, 1200); // Changed from 2000ms to 1200ms for faster progression
      
      // Update progress bar continuously
      const progressTimer = setInterval(() => {
        setLoadingProgress(prev => {
          // Progress faster initially, slow down at the end for perception
          if (prev < 70) return prev + 5;
          if (prev < 90) return prev + 1;
          return prev + 0.5;
        });
      }, 300);
      
      return () => {
        clearInterval(stepTimer);
        clearInterval(progressTimer);
      };
    }, []);
    
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 5 }}>
          <CircularProgress 
            size={70} 
            thickness={4} 
            variant="determinate"
            value={Math.min(loadingProgress, 95)} 
            sx={{ mb: 2 }} 
          />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Analyzing your resume...
          </Typography>
          
          <Box sx={{ width: '80%', mx: 'auto', mt: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {analysisSteps.map((step) => (
                <Step key={step.label}>
                  <StepLabel>
                    <Typography variant="caption" component="span" sx={{ fontWeight: 'bold' }}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Box sx={{ mt: 2, mb: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(loadingProgress, 95)}
                sx={{ height: 6, borderRadius: 1 }}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              {analysisSteps[activeStep].detail}
            </Typography>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Optimized analysis typically takes 10-15 seconds
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  const {
    score = 0,
    matched_keywords = [],
    matching_keywords = [],
    missing_keywords = [],
    assessment = "Your resume has been analyzed for ATS compatibility.",
    ats_feedback = "",
    pass_probability = 0,
    sections_analysis = {},
    section_analysis = {},
    sections_found = [],
    semantic_matches = [],
    optimizations = [],
    using_mock_data = false
  } = analysis;
  
  // Use either matched_keywords or matching_keywords based on what's available
  const matchedKeywords = matched_keywords.length > 0 ? matched_keywords : matching_keywords;
  
  // Color based on score
  const getScoreColor = (scoreValue = score) => {
    if (scoreValue >= 80) return 'success.main';
    if (scoreValue >= 60) return 'warning.main';
    return 'error.main';
  };
  
  // Get ATS verdict
  const getVerdict = () => {
    if (score >= 80) return "Excellent match for this position";
    if (score >= 60) return "Good match with some improvements needed";
    if (score >= 40) return "May pass with improvements";
    return "Needs significant improvements";
  };
  
  const handleDownloadReport = async () => {
    try {
      const response = await apiEndpoints.downloadATSReport(analysis.id);
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
  
  const handleViewReport = async () => {
    try {
      setIsLoadingPdf(true);
      
      // Check cache first
      const cachedReportKey = `pdf_report_${analysis.id}`;
      const cachedReport = sessionStorage.getItem(cachedReportKey);
      
      if (cachedReport) {
        console.log('Using cached PDF report');
        setPdfData(cachedReport);
        setPdfOpen(true);
        setIsLoadingPdf(false);
        return;
      }
      
      const response = await apiEndpoints.downloadATSReport(analysis.id);
      // Create a blob from the PDF Stream
      const file = new Blob([response.data], { type: 'application/pdf' });
      // Build a URL from the file
      const fileURL = URL.createObjectURL(file);
      
      // Cache the report URL for future use
      try {
        sessionStorage.setItem(cachedReportKey, fileURL);
      } catch (cacheErr) {
        console.warn('Could not cache PDF report', cacheErr);
      }
      
      setPdfData(fileURL);
      setPdfOpen(true);
      setIsLoadingPdf(false);
    } catch (error) {
      console.error('Failed to load PDF report:', error);
      setIsLoadingPdf(false);
    }
  };

  const handleClosePdf = () => {
    setPdfOpen(false);
    // Revoke the object URL to avoid memory leaks
    if (pdfData) {
      URL.revokeObjectURL(pdfData);
      setPdfData(null);
    }
  };

  // Get the top missing keywords to focus on
  const priorityMissingKeywords = missing_keywords.slice(0, 5);
  
  // Calculate section strength score
  const getSectionStrength = () => {
    const sectionData = section_analysis || sections_analysis;
    if (!sectionData || Object.keys(sectionData).length === 0) return null;
    
    return Object.entries(sectionData).map(([section, data]) => {
      const { score, keywords, feedback } = data;
      const strengthColor = getScoreColor(score);
      return (
        <Box key={section} mb={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
              {section}
            </Typography>
            <Typography variant="body2" color={strengthColor}>
              {score}%
            </Typography>
          </Box>
          {feedback && (
            <Typography variant="caption" color="text.secondary">
              {feedback}
            </Typography>
          )}
          <Box mt={0.5} display="flex" flexWrap="wrap" gap={0.5}>
            {keywords && keywords.slice(0, 3).map(keyword => (
              <Chip 
                key={keyword} 
                label={keyword} 
                size="small" 
                variant="outlined" 
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
            {keywords && keywords.length > 3 && (
              <Tooltip title={keywords.slice(3).join(', ')}>
                <Chip 
                  label={`+${keywords.length - 3} more`} 
                  size="small" 
                  variant="outlined" 
                  sx={{ fontSize: '0.7rem' }}
                />
              </Tooltip>
            )}
          </Box>
        </Box>
      );
    });
  };

  // Display semantic matches if available
  const renderSemanticMatches = () => {
    if (!semantic_matches || semantic_matches.length === 0) return null;
    
    return (
      <Box mt={2}>
        <Typography variant="subtitle2" gutterBottom>
          Semantic Matches
        </Typography>
        <List dense>
          {semantic_matches.slice(0, 3).map((match, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemText 
                primary={
                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" fontWeight="bold">{match.term}</Typography>
                    <ArrowForward fontSize="small" sx={{ mx: 1 }} />
                    <Typography variant="body2">
                      {match.matches && match.matches.slice(0, 2).join(', ')}
                      {match.matches && match.matches.length > 2 && '...'}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="caption">
                    Match confidence: {match.score ? (match.score * 100).toFixed(0) : 0}%
                  </Typography>
                }
              />
            </ListItem>
          ))}
          {semantic_matches.length > 3 && (
            <ListItem>
              <Typography variant="caption">
                +{semantic_matches.length - 3} more semantic matches
              </Typography>
            </ListItem>
          )}
        </List>
      </Box>
    );
  };

  return (
    <>
      <Card elevation={3}>
        <CardHeader 
          title="ATS Score Analysis" 
          action={
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={handleViewReport}
                disabled={isLoadingPdf}
              >
                {isLoadingPdf ? 'Loading...' : 'View Report'}
              </Button>
              
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
          }
        />
        {using_mock_data && (
          <Box sx={{ 
            bgcolor: 'warning.light', 
            p: 2, 
            borderBottom: '1px solid',
            borderColor: 'warning.main',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1, color: 'warning.main' }} fontSize="small" />
              Using simulated data. For AI-powered analysis, configure a DeepSeek API key.
            </Typography>
            <Box>
              <Button 
                size="small" 
                variant="outlined" 
                color="warning"
                onClick={() => {
                  // Provide instructions to set up API key
                  alert('To set up the DeepSeek API key:\n\n1. Get an API key from openrouter.ai\n2. Set the DEEPSEEK_API_KEY environment variable in your backend\n3. Restart the server');
                }}
                sx={{ mr: 1 }}
              >
                How to Set Up
              </Button>
              <Button
                size="small"
                variant="contained"
                color="warning"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/ats/test-deepseek-connection');
                    const data = await response.json();
                    
                    if (data.connected) {
                      alert(`DeepSeek API connection successful!\nResponse: ${data.response}`);
                    } else {
                      alert(`DeepSeek API connection failed:\n${data.message}`);
                    }
                  } catch (error) {
                    console.error('Error testing DeepSeek connection:', error);
                    alert('Error testing DeepSeek connection. Check console for details.');
                  }
                }}
              >
                Test Connection
              </Button>
            </Box>
          </Box>
        )}
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                <Box 
                  sx={{
                    position: 'relative',
                    display: 'inline-flex',
                    borderRadius: '50%',
                    border: '8px solid',
                    borderColor: getScoreColor(),
                    p: 3,
                    mb: 2
                  }}
                >
                  <Typography variant="h3" color={getScoreColor()} fontWeight="bold">
                    {Math.round(score)}%
                  </Typography>
                </Box>
                <Typography variant="body1" textAlign="center" fontWeight="medium">
                  {getVerdict()}
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
                  {pass_probability}% chance of passing ATS filters
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={8}>
              <Typography variant="subtitle1" gutterBottom>
                What you have
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                {matchedKeywords.map(keyword => (
                  <Chip 
                    key={keyword}
                    label={keyword}
                    icon={<CheckCircleIcon fontSize="small" />}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                ))}
                {matchedKeywords.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No matching keywords found
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  What you're missing
                </Typography>
                <Button 
                  size="small"
                  onClick={() => setShowMissing(!showMissing)}
                  endIcon={showMissing ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  disabled={!missing_keywords || missing_keywords.length === 0}
                >
                  {showMissing ? 'Hide' : 'Show'}
                </Button>
              </Box>
              
              <Collapse in={showMissing}>
                <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                  {priorityMissingKeywords.map(keyword => (
                    <Chip 
                      key={keyword}
                      label={keyword}
                      icon={<CancelIcon fontSize="small" />}
                      color="error"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                  {missing_keywords.length > 5 && (
                    <Tooltip title={missing_keywords.slice(5).join(', ')}>
                      <Chip 
                        label={`+${missing_keywords.length - 5} more`}
                        variant="outlined"
                        size="small"
                        color="default"
                        icon={<InfoIcon fontSize="small" />}
                      />
                    </Tooltip>
                  )}
                  {missing_keywords.length === 0 && (
                    <Typography variant="body2" color="success.main">
                      Great job! No critical keywords missing
                    </Typography>
                  )}
                </Box>
              </Collapse>
              
              {ats_feedback && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    ATS Feedback
                  </Typography>
                  <Typography variant="body2">
                    {ats_feedback}
                  </Typography>
                </Paper>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Button
                  onClick={() => setShowDetails(!showDetails)}
                  endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                  {showDetails ? 'Hide Detailed Analysis' : 'Show Detailed Analysis'}
                </Button>
              </Box>
              
              <Collapse in={showDetails}>
                <Divider sx={{ mb: 2 }} />
                
                {(Object.keys(section_analysis).length > 0 || Object.keys(sections_analysis).length > 0) && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Section Analysis
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
                      {getSectionStrength()}
                    </Paper>
                  </>
                )}
                
                {renderSemanticMatches()}
                
                {optimizations && optimizations.length > 0 && (
                  <Box mt={2}>
                    <Typography variant="subtitle1" gutterBottom>
                      Recommended Optimizations
                    </Typography>
                    <List dense>
                      {optimizations.slice(0, 3).map((opt, index) => (
                        <ListItem key={index}>
                          <ListItemText 
                            primary={opt.suggestion}
                            secondary={opt.explanation}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Collapse>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* PDF Viewer Dialog */}
      <Dialog
        open={pdfOpen}
        onClose={handleClosePdf}
        maxWidth="lg"
        fullWidth
        aria-labelledby="pdf-viewer-dialog"
      >
        <DialogTitle id="pdf-viewer-dialog">
          Resume Analysis Report
          <IconButton
            aria-label="close"
            onClick={handleClosePdf}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: '80vh' }}>
          {pdfData ? (
            <iframe
              src={`${pdfData}#view=FitH`}
              title="PDF Viewer"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          ) : (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePdf}>Close</Button>
          <Button onClick={handleDownloadReport} startIcon={<DownloadIcon />}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ATSResultsCard;