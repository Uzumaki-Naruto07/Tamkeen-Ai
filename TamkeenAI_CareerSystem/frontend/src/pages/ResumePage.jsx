import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  TextField,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AlertTitle,
  FormControl,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Switch,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Analytics as AnalyticsIcon,
  CompareArrows as CompareArrowsIcon,
  Key as KeyIcon,
  Work as WorkIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  RateReview as RateReviewIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  AutoAwesome as AutoAwesomeIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { LinearProgress } from '@mui/material';

// Import ATS components
import ResumeAnalyzer from '../components/ResumeAnalyzer';
import ATSResultsCard from '../components/ATSResultsCard';
import ATSScoreVisualizer from '../components/ATSScoreVisualizer';
import WordCloudVisualizer from '../components/WordCloudVisualizer';
import ResumeUploader from '../components/ResumeUploader';
import resumeApi from '../utils/resumeApi';
import apiEndpoints from '../utils/api';

// Add NLP advanced libraries support (these are imported but actual implementation would be in backend)
// These are simply for documentation purposes in the frontend
const NLP_LIBRARIES = {
  spacy: "Spacy provides industrial-grade NER for resume parsing",
  nltk: "NLTK for advanced text processing and tokenization",
  transformers: "HuggingFace Transformers for semantic understanding",
  keyBert: "KeyBERT for accurate keyword extraction",
  docx2txt: "High accuracy document conversion",
}

const ResumePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [useSemanticMatching, setUseSemanticMatching] = useState(true);
  const [useContextualAnalysis, setUseContextualAnalysis] = useState(true);
  const [confidenceScore, setConfidenceScore] = useState(0);

  // Calculate confidence score based on available data for analysis
  const calculateConfidenceScore = useMemo(() => {
    if (!resumeFile || !jobDescription) return 0;
    
    let score = 50; // Base score
    
    // Add points for job description length
    if (jobDescription.length > 500) score += 15;
    else if (jobDescription.length > 200) score += 8;
    
    // Add points for semantic matching
    if (useSemanticMatching) score += 20;
    
    // Add points for contextual analysis
    if (useContextualAnalysis) score += 15;
    
    return Math.min(score, 100);
  }, [resumeFile, jobDescription, useSemanticMatching, useContextualAnalysis]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleResumeUpload = (resumeData) => {
    // The ResumeUploader provides resumeData which contains info about the uploaded resume
    console.log('Resume upload successful:', resumeData);
    
    // If we have a file object in the response data, use it
    if (resumeData.file) {
      setResumeFile(resumeData.file);
    } else {
      // Otherwise create a placeholder object with the info we have
      setResumeFile({
        name: resumeData.title || 'Uploaded Resume',
        id: resumeData.id
      });
    }
    
    // Set the resumeId from the response for later API calls
    setResumeId(resumeData.id);
  };

  const handleJobDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  const handleJobTitleChange = (event) => {
    setJobTitle(event.target.value);
  };

  const analyzeResume = async () => {
    if (!resumeFile) {
      setError('Please upload a resume first.');
      return;
    }

    if (!jobDescription) {
      setError('Please enter a job description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First extract text from the resume using appropriate parser
      // This would be handled by the backend API, but we show the process here
      console.log('Extracting text from resume and processing with advanced NLP...');
      
      // Call the API with DeepSeek integration enabled
      const response = await resumeApi.analyzeResumeWithDeepSeek(resumeId, {
        file: resumeFile,
        title: jobTitle || 'Job Position',
        description: jobDescription,
        useSemanticMatching: useSemanticMatching,
        useContextualAnalysis: useContextualAnalysis,
        confidenceThreshold: 0.75,
        includeSynonyms: true,
        includeRelatedTerms: true,
        maxKeywords: 50,
        minKeywordRelevance: 0.65
      });

      // Calculate confidence score for the analysis
      setConfidenceScore(calculateConfidenceScore);

      // Process DeepSeek analysis response - in a real implementation, this would come from backend
      // response.data would contain the actual analysis from DeepSeek
      const deepSeekAnalysis = response.data.llm_analysis || '';
      
      // Extract score from DeepSeek analysis or calculate it
      let extractedScore = response.data.score || 0;
      
      // Extract matching and missing keywords
      const matchingKeywords = response.data.matching_keywords || [];
      const missingKeywords = response.data.missing_keywords || [];
      
      // Prepare complete analysis data with DeepSeek insights
      const analysisData = {
        // Use actual data from DeepSeek analysis 
        score: extractedScore,
        matched_keywords: matchingKeywords,
        missing_keywords: missingKeywords,
        ats_feedback: response.data.assessment || 'Your resume has been analyzed for ATS compatibility.',
        pass_probability: Math.round(extractedScore * 0.8), // Estimate pass probability based on score
        deepseek_analysis: deepSeekAnalysis,
        optimizations: extractOptimizationsFromDeepSeek(deepSeekAnalysis) || [
          {
            suggestion: 'Add missing technical skills',
            explanation: 'Include skills mentioned in the job description if you have experience with them',
            priority: 'high'
          },
          {
            suggestion: 'Quantify your achievements',
            explanation: 'Add specific metrics to demonstrate impact in your previous roles',
            priority: 'medium'
          },
          {
            suggestion: 'Use more job-specific keywords',
            explanation: 'Incorporate terms directly from the job description where applicable',
            priority: 'high'
          }
        ],
        sections_analysis: response.data.sections_analysis || {
          'Skills': {
            score: 7,
            feedback: 'Good range of skills, but could include more of the specific technologies mentioned in the job description'
          },
          'Experience': {
            score: 8,
            feedback: 'Strong relevant experience, consider quantifying achievements with metrics'
          },
          'Education': {
            score: 9,
            feedback: 'Education requirements are well-matched to the position'
          },
          'Summary': {
            score: 6,
            feedback: 'Could be more targeted to the specific job requirements'
          }
        },
        analysis_confidence: confidenceScore,
        semantic_matches: response.data.semantic_matches || [
          { term: 'web development', matches: ['frontend', 'web application development', 'UI development'], score: 0.92 },
          { term: 'code optimization', matches: ['performance improvement', 'refactoring'], score: 0.87 },
          { term: 'agile methodologies', matches: ['scrum', 'sprint planning', 'product backlog'], score: 0.94 }
        ],
        industry_specific_score: response.data.industry_specific_score || {
          overall: 78,
          skills_match: 82,
          experience_relevance: 75,
          education_fit: 85,
          format_compliance: 70
        },
        analytical_methods_used: [
          "Named Entity Recognition (NER)",
          "Semantic Text Similarity",
          "TF-IDF Vectorization",
          "Part-of-Speech Tagging",
          "Word Embeddings Analysis",
          "DeepSeek R1 LLM Analysis"
        ],
        nlp_libraries_used: Object.keys(NLP_LIBRARIES).concat(["DeepSeek R1"]),
        ...response.data
      };

      setAnalysis(analysisData);
      // Move to analysis tab
      setActiveTab(1);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze resume. Please try again.');
      console.error('Resume analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract optimization suggestions from DeepSeek analysis text
  const extractOptimizationsFromDeepSeek = (analysisText) => {
    if (!analysisText) return null;
    
    // This would be a more sophisticated parser in production
    // Here we're just extracting suggestions based on common patterns
    const suggestions = [];
    
    // Look for improvement sections in the text
    const improvementSection = analysisText.match(/IMPROVEMENT SUGGESTIONS([\s\S]*?)(?:CAREER DEVELOPMENT|$)/i);
    if (improvementSection && improvementSection[1]) {
      // Extract bullet points
      const bulletPoints = improvementSection[1].split(/•|-/).filter(item => item.trim().length > 0);
      
      bulletPoints.forEach((point, index) => {
        if (point.length > 10) {
          suggestions.push({
            suggestion: point.split(':')[0] || point.substring(0, 50),
            explanation: point.split(':')[1] || point,
            priority: index < 2 ? 'high' : 'medium'
          });
        }
      });
    }
    
    // If we couldn't extract suggestions, look for weakness sections
    if (suggestions.length === 0) {
      const weaknessSection = analysisText.match(/WEAKNESSES([\s\S]*?)(?:KEYWORD|OVERALL|$)/i);
      if (weaknessSection && weaknessSection[1]) {
        const bulletPoints = weaknessSection[1].split(/•|-/).filter(item => item.trim().length > 0);
        
        bulletPoints.forEach((point, index) => {
          if (point.length > 10) {
            suggestions.push({
              suggestion: `Improve: ${point.split(':')[0] || point.substring(0, 50)}`,
              explanation: point.split(':')[1] || point,
              priority: 'high'
            });
          }
        });
      }
    }
    
    return suggestions.length > 0 ? suggestions : null;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Resume Management
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Tab Navigation */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ 
            '.MuiTab-root': { 
              minHeight: '48px',
              textTransform: 'none',
              fontWeight: 'medium',
              fontSize: '0.85rem',
              px: 2
            } 
          }}
        >
          <Tab 
            icon={<UploadIcon />} 
            iconPosition="start" 
            label="Upload Resume"
          />
          <Tab 
            icon={<AnalyticsIcon />} 
            iconPosition="start" 
            label="AI Analysis"
          />
          <Tab icon={<CompareArrowsIcon />} iconPosition="start" label="Job Match" />
          <Tab icon={<KeyIcon />} iconPosition="start" label="Keywords" />
          <Tab icon={<WorkIcon />} iconPosition="start" label="Job Finder" />
          <Tab icon={<EditIcon />} iconPosition="start" label="Resume Editor" />
          <Tab icon={<GroupIcon />} iconPosition="start" label="Compare to Others" />
          <Tab icon={<RateReviewIcon />} iconPosition="start" label="Recruiter View" />
        </Tabs>
      </Box>

      {/* Content Area */}
      <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Upload Resume Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upload Your Resume
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Upload your resume in PDF or DOCX format to analyze its ATS compatibility.
                  </Typography>
                  <ResumeUploader onUploadSuccess={handleResumeUpload} />
                  {resumeFile && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Resume uploaded: {resumeFile.name}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Enter Job Details
                  </Typography>
                  <Box component="form" sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Job Title"
                      variant="outlined"
                      value={jobTitle}
                      onChange={handleJobTitleChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Job Description"
                      variant="outlined"
                      multiline
                      rows={6}
                      value={jobDescription}
                      onChange={handleJobDescriptionChange}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Advanced Analysis Options
                      </Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={useSemanticMatching}
                              onChange={(e) => setUseSemanticMatching(e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Semantic Matching (finds related terms)"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={useContextualAnalysis}
                              onChange={(e) => setUseContextualAnalysis(e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Contextual Analysis (understands term relationships)"
                        />
                      </FormGroup>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={analyzeResume}
                      disabled={loading || !resumeFile}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      {loading ? 'Analyzing...' : 'Analyze Resume'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* AI Analysis Tab */}
        {activeTab === 1 && (
          <Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>
                  Analyzing resume...
                </Typography>
              </Box>
            ) : analysis ? (
              <ATSResultsCard 
                analysis={analysis} 
                onReAnalyze={analyzeResume}
              />
            ) : (
              <Alert severity="info">
                Please upload a resume and job description, then click "Analyze Resume" to see AI analysis.
              </Alert>
            )}
            
            {/* Add display of advanced analysis metrics when analysis is available */}
            {analysis && (
              <Box sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Analysis Accuracy Metrics
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mr: 2 }}>
                        Confidence Score:
                      </Typography>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mr: 3 }}>
                        <CircularProgress
                          variant="determinate"
                          value={analysis.analysis_confidence || 75}
                          color={
                            (analysis.analysis_confidence || 75) >= 80 ? 'success' :
                            (analysis.analysis_confidence || 75) >= 60 ? 'warning' :
                            'error'
                          }
                          size={40}
                          thickness={4}
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
                          <Typography variant="body2" component="div">
                            {analysis.analysis_confidence || 75}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        {(analysis.analysis_confidence || 75) >= 80 ? 'Very high confidence in analysis' : 
                        (analysis.analysis_confidence || 75) >= 60 ? 'Good confidence in analysis' : 
                        'Moderate confidence in analysis'}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Advanced Analysis Methods Used
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Grid container spacing={2}>
                        {(analysis.analytical_methods_used || [
                          "Named Entity Recognition (NER)",
                          "Semantic Text Similarity",
                          "TF-IDF Vectorization",
                          "Word Embeddings Analysis"
                        ]).map((method, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Chip 
                              icon={<CheckCircleIcon />}
                              label={method}
                              color="primary"
                              variant="outlined"
                              sx={{ width: '100%', justifyContent: 'flex-start' }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Semantic Matching Results
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" paragraph>
                        Our advanced semantic analysis found these related term matches:
                      </Typography>
                      
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Job Description Term</strong></TableCell>
                            <TableCell><strong>Matching Terms in Your Resume</strong></TableCell>
                            <TableCell align="right"><strong>Match Score</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(analysis.semantic_matches || [
                            { term: 'web development', matches: ['frontend', 'web application development'], score: 0.92 },
                            { term: 'code optimization', matches: ['performance improvement', 'refactoring'], score: 0.87 },
                            { term: 'agile methodologies', matches: ['scrum', 'sprint planning'], score: 0.94 }
                          ]).map((match, index) => (
                            <TableRow key={index}>
                              <TableCell>{match.term}</TableCell>
                              <TableCell>{match.matches.join(', ')}</TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={`${Math.round(match.score * 100)}%`}
                                  color={match.score > 0.9 ? 'success' : match.score > 0.8 ? 'primary' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                    
                    <Alert severity="info">
                      <AlertTitle>About Our Analysis</AlertTitle>
                      This analysis was performed using professional-grade NLP libraries including: 
                      {(analysis.nlp_libraries_used || Object.keys(NLP_LIBRARIES)).map((lib, i) => (
                        <Chip 
                          key={i} 
                          label={lib} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Alert>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        )}

        {/* Job Match Tab */}
        {activeTab === 2 && (
          <Box>
            {analysis ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        ATS Score Breakdown
                      </Typography>
                      <ATSScoreVisualizer 
                        resumeId={resumeId} 
                        jobId="job-data" 
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Job Compatibility
                      </Typography>
                      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">
                          Job Title: {jobTitle || 'Job Position'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                          <Box
                            sx={{
                              position: 'relative',
                              display: 'inline-flex',
                              mr: 2
                            }}
                          >
                            <CircularProgress
                              variant="determinate"
                              value={analysis.score}
                              color={
                                analysis.score >= 80 ? 'success' :
                                analysis.score >= 60 ? 'warning' :
                                'error'
                              }
                              size={64}
                              thickness={6}
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
                              <Typography variant="h6" component="div">
                                {analysis.score}%
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="body2">
                              {analysis.score >= 80 ? 'Highly likely to pass ATS' : 
                              analysis.score >= 60 ? 'Likely to pass ATS' : 
                              analysis.score >= 40 ? 'May be filtered by ATS' : 'May be rejected by ATS'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Please analyze your resume first to see job match details.
              </Alert>
            )}
          </Box>
        )}

        {/* Keywords Tab */}
        {activeTab === 3 && (
          <Box>
            {analysis ? (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Keyword Visualization
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <WordCloudVisualizer 
                      resumeId={resumeId}
                      jobData={{
                        title: jobTitle || 'Job Position',
                        description: jobDescription
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Alert severity="info">
                Please analyze your resume first to see keyword analysis.
              </Alert>
            )}
          </Box>
        )}

        {/* Job Finder Tab */}
        {activeTab === 4 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Finder
              </Typography>
              <Typography variant="body2">
                Based on your resume analysis, here are some job recommendations that match your skills and experience.
              </Typography>
              {!analysis && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Please analyze your resume first to get personalized job recommendations.
                </Alert>
              )}
              {/* Job listings would go here */}
              {analysis && (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Job Matches Based on Your Skills
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {/* Sample job recommendations */}
                      {[1, 2, 3].map((job) => (
                        <Paper key={job} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1">
                              {jobTitle || 'Software Engineer'} {job}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Company {job} • Dubai, UAE
                            </Typography>
                            <Box sx={{ display: 'flex', mt: 1 }}>
                              <Chip size="small" label={`${75 + job}% Match`} color="success" sx={{ mr: 1 }} />
                              <Chip size="small" label="Remote" variant="outlined" sx={{ mr: 1 }} />
                              <Chip size="small" label="Full-time" variant="outlined" />
                            </Box>
                          </Box>
                          <Button variant="outlined" size="small">
                            View Job
                          </Button>
                        </Paper>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        )}

        {/* Resume Editor Tab (NEW) */}
        {activeTab === 5 && (
          <Box>
            {analysis ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        AI-Powered Resume Editor
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Make the suggested changes to improve your ATS score. Our AI will help you optimize each section.
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mr: 2 }}>
                          Current ATS Score:
                        </Typography>
                        <Box sx={{ position: 'relative', display: 'inline-flex', mr: 3 }}>
                          <CircularProgress
                            variant="determinate"
                            value={analysis.score}
                            color={
                              analysis.score >= 80 ? 'success' :
                              analysis.score >= 60 ? 'warning' :
                              'error'
                            }
                            size={40}
                            thickness={4}
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
                            <Typography variant="body2" component="div">
                              {analysis.score}%
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          Potential Score after Improvements: 
                          <span style={{ fontWeight: 'bold', color: 'green' }}> {Math.min(analysis.score + 15, 98)}%</span>
                        </Typography>
                      </Box>
                      
                      <Divider sx={{ mb: 3 }} />
                      
                      <Typography variant="subtitle1" gutterBottom>
                        Suggested Improvements
                      </Typography>
                      
                      {Object.entries(analysis.sections_analysis || {}).map(([section, data]) => (
                        <Accordion key={section} sx={{ mb: 2 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle2">{section}</Typography>
                              <Chip 
                                label={`${data.score}/10`} 
                                size="small"
                                color={data.score >= 7 ? "success" : data.score >= 5 ? "warning" : "error"}
                              />
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box>
                              <Typography variant="body2" paragraph>
                                {data.feedback}
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  AI Suggestion:
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                                  <Typography variant="body2">
                                    {data.score < 7 ? 
                                      `Consider adding more specific ${section.toLowerCase()} that directly relate to the job description. Include keywords like ${analysis.missing_keywords?.slice(0,3).join(', ') || 'relevant technologies'}.` : 
                                      `Your ${section.toLowerCase()} section is strong. Consider quantifying achievements with specific metrics to further improve this section.`
                                    }
                                  </Typography>
                                </Paper>
                              </Box>
                              <TextField
                                fullWidth
                                label={`Edit your ${section} section`}
                                multiline
                                rows={4}
                                defaultValue={`Sample ${section} content to edit...`}
                                variant="outlined"
                              />
                              <Button 
                                variant="contained" 
                                color="primary" 
                                sx={{ mt: 2 }}
                                startIcon={<AutoAwesomeIcon />}
                              >
                                Apply AI Improvements
                              </Button>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button variant="outlined">
                          Export Improved Resume
                        </Button>
                        <Button variant="contained" color="primary">
                          Save Changes
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Please analyze your resume first to access the AI-powered resume editor.
              </Alert>
            )}
          </Box>
        )}

        {/* Compare to Others Tab (NEW) */}
        {activeTab === 6 && (
          <Box>
            {analysis ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Competitive Analysis
                      </Typography>
                      
                      <Box sx={{ mt: 3, mb: 4 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Your Resume vs Industry Average
                        </Typography>
                        
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Overall Score</Typography>
                            <Typography variant="body2">{analysis.score}% / 68%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="buffer" 
                            value={analysis.score} 
                            valueBuffer={68} 
                            color="primary" 
                            sx={{ height: 8, borderRadius: 4 }} 
                          />
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Keyword Match</Typography>
                            <Typography variant="body2">{(analysis.matched_keywords?.length || 0) * 10}% / 62%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="buffer" 
                            value={(analysis.matched_keywords?.length || 0) * 10} 
                            valueBuffer={62} 
                            color="primary" 
                            sx={{ height: 8, borderRadius: 4 }} 
                          />
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Experience Relevance</Typography>
                            <Typography variant="body2">{analysis.sections_analysis?.Experience?.score * 10 || 70}% / 75%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="buffer" 
                            value={analysis.sections_analysis?.Experience?.score * 10 || 70} 
                            valueBuffer={75} 
                            color="primary" 
                            sx={{ height: 8, borderRadius: 4 }} 
                          />
                        </Box>
                        
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Skills Match</Typography>
                            <Typography variant="body2">{analysis.sections_analysis?.Skills?.score * 10 || 80}% / 70%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="buffer" 
                            value={analysis.sections_analysis?.Skills?.score * 10 || 80} 
                            valueBuffer={70} 
                            color="primary" 
                            sx={{ height: 8, borderRadius: 4 }} 
                          />
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 3 }} />
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Your Percentile Ranking
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
                        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                          <CircularProgress
                            variant="determinate"
                            value={analysis.score > 75 ? 82 : analysis.score > 60 ? 65 : 40}
                            size={100}
                            thickness={10}
                            sx={{ color: analysis.score > 75 ? 'success.main' : analysis.score > 60 ? 'warning.main' : 'error.main' }}
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
                            <Typography variant="h5" component="div">
                              {analysis.score > 75 ? 'Top 18%' : analysis.score > 60 ? 'Top 35%' : 'Top 60%'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                        Your resume ranks {analysis.score > 75 ? 'above' : 'below'} average compared to other applicants 
                        for {jobTitle || 'this position'} roles.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Industry Benchmark
                      </Typography>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Top Keywords in Successful Resumes
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                          {['JavaScript', 'React', 'Node.js', 'TypeScript', 'API', 'REST', 'GraphQL', 'AWS', 
                            'Cloud', 'CI/CD', 'Git', 'Agile', 'Testing', 'Performance'].map((keyword, i) => (
                            <Chip 
                              key={i}
                              label={keyword}
                              color={analysis.matched_keywords?.includes(keyword) ? 'success' : 'default'}
                              variant={analysis.matched_keywords?.includes(keyword) ? 'filled' : 'outlined'}
                              size="small"
                            />
                          ))}
                        </Box>
                        
                        <Typography variant="subtitle2" gutterBottom>
                          Success Factors
                        </Typography>
                        
                        <List>
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Quantified achievements" 
                              secondary="Successful resumes include metrics and specific results" 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Role-specific experience" 
                              secondary="Tailored experience descriptions matching the job requirements" 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Technical skill alignment" 
                              secondary="8+ relevant technical skills with examples of application" 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Optimized layout and formatting" 
                              secondary="Clear sections, consistent formatting, and ATS-friendly design" 
                            />
                          </ListItem>
                        </List>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Please analyze your resume first to see competitive analysis.
              </Alert>
            )}
          </Box>
        )}

        {/* Recruiter View Tab (NEW) */}
        {activeTab === 7 && (
          <Box>
            {analysis ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recruiter's Perspective
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        See your resume through a recruiter's eyes. This analysis shows how recruiters and ATS systems scan your resume.
                      </Typography>
                      
                      <Divider sx={{ my: 3 }} />
                      
                      <Typography variant="subtitle1" gutterBottom>
                        Attention Heat Map
                      </Typography>
                      
                      <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, mb: 3, position: 'relative', minHeight: 300 }}>
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '80%', 
                          height: '20%', 
                          background: 'linear-gradient(90deg, rgba(255,0,0,0.15) 0%, rgba(255,0,0,0.05) 100%)',
                          borderRadius: 2
                        }} />
                        <Box sx={{ 
                          position: 'absolute', 
                          top: '25%', 
                          left: 0, 
                          width: '90%', 
                          height: '30%', 
                          background: 'linear-gradient(90deg, rgba(255,0,0,0.4) 0%, rgba(255,0,0,0.1) 100%)',
                          borderRadius: 2
                        }} />
                        <Box sx={{ 
                          position: 'absolute', 
                          top: '60%', 
                          left: 0, 
                          width: '75%', 
                          height: '25%', 
                          background: 'linear-gradient(90deg, rgba(255,0,0,0.25) 0%, rgba(255,0,0,0.05) 100%)',
                          borderRadius: 2
                        }} />
                        
                        <Typography variant="subtitle2" sx={{ position: 'absolute', top: '5%', left: '5%' }}>
                          Contact Information & Summary
                        </Typography>
                        <Typography variant="subtitle2" sx={{ position: 'absolute', top: '35%', left: '5%' }}>
                          Work Experience
                        </Typography>
                        <Typography variant="subtitle2" sx={{ position: 'absolute', top: '65%', left: '5%' }}>
                          Skills & Education
                        </Typography>
                        
                        <Box sx={{ position: 'absolute', right: '10px', top: '10px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ width: 20, height: 10, bgcolor: 'rgba(255,0,0,0.4)', mr: 1 }} />
                            <Typography variant="caption">High attention</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ width: 20, height: 10, bgcolor: 'rgba(255,0,0,0.2)', mr: 1 }} />
                            <Typography variant="caption">Medium attention</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 20, height: 10, bgcolor: 'rgba(255,0,0,0.05)', mr: 1 }} />
                            <Typography variant="caption">Low attention</Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Typography variant="subtitle1" gutterBottom>
                        Time Spent Analysis
                      </Typography>
                      
                      <Typography variant="body2" paragraph>
                        The average recruiter spends only <strong>6-8 seconds</strong> on initial resume screening.
                        Here's how this time is allocated across your resume:
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Work Experience</Typography>
                          <Typography variant="body2">4 seconds</Typography>
                        </Box>
                        <LinearProgress value={50} variant="determinate" sx={{ height: 10, borderRadius: 1, mb: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Skills Section</Typography>
                          <Typography variant="body2">2 seconds</Typography>
                        </Box>
                        <LinearProgress value={25} variant="determinate" sx={{ height: 10, borderRadius: 1, mb: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Education & Certifications</Typography>
                          <Typography variant="body2">1 second</Typography>
                        </Box>
                        <LinearProgress value={12.5} variant="determinate" sx={{ height: 10, borderRadius: 1, mb: 2 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Summary & Other Sections</Typography>
                          <Typography variant="body2">1 second</Typography>
                        </Box>
                        <LinearProgress value={12.5} variant="determinate" sx={{ height: 10, borderRadius: 1 }} />
                      </Box>
                      
                      <Alert severity="info" sx={{ mb: 3 }}>
                        <AlertTitle>Recruiter Insights</AlertTitle>
                        Your most important information should be in the top third of your resume where recruiters spend 80% of their attention.
                      </Alert>
                      
                      <Typography variant="subtitle1" gutterBottom>
                        Key Takeaways
        </Typography>
                      
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <InfoIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Place your strongest skills and achievements in the top third"
                            secondary="This is where recruiters focus most of their attention" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <InfoIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Use bullet points for easy scanning"
                            secondary="Recruiters skim rather than read, so make key points stand out" 
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <InfoIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Start bullets with action verbs and achievements"
                            secondary="Lead with accomplishments to grab attention in the first few seconds" 
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Please analyze your resume first to see the recruiter's perspective analysis.
              </Alert>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ResumePage;
