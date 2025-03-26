import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Divider,
  Chip, Card, CardContent, CardHeader, CardActions,
  List, ListItem, ListItemText, ListItemIcon,
  Accordion, AccordionSummary, AccordionDetails,
  CircularProgress, Alert, Tabs, Tab, LinearProgress,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import {
  Assessment, Description, CheckCircle, Warning,
  Error, Info, ExpandMore, TrendingUp, Search,
  Work, School, Construction, Download, Edit,
  Save, Refresh, CloudQueue, FindInPage, Check,
  Close, Compare
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useResume } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import WordCloudVisualizer from '../components/WordCloudVisualizer';
import JobMatchCalculator from '../components/JobMatchCalculator';

const ResumeAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [resumeContent, setResumeContent] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobMatchDialogOpen, setJobMatchDialogOpen] = useState(false);
  
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { profile } = useUser();
  const { resumes, currentResume } = useResume();
  
  // Fetch resume analysis
  useEffect(() => {
    const fetchResumeAnalysis = async () => {
      if (!resumeId) {
        setLoading(false);
        setError('No resume ID provided');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Get resume content first
        const resumeResponse = await apiEndpoints.documents.getResume(resumeId);
        setResumeContent(resumeResponse.data);
        
        // Then get analysis
        const analysisResponse = await apiEndpoints.analytics.getResumeAnalysis(resumeId);
        setAnalysis(analysisResponse.data);
      } catch (err) {
        if (err.response?.status === 404) {
          // Analysis not found, but resume exists - offer to generate
          setAnalysis(null);
        } else {
          setError('Failed to load resume analysis');
          console.error('Error fetching resume analysis:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchResumeAnalysis();
  }, [resumeId]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Generate new analysis
  const generateAnalysis = async () => {
    if (!resumeId) return;
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const response = await apiEndpoints.analytics.analyzeResume(resumeId);
      setAnalysis(response.data);
    } catch (err) {
      setError('Failed to generate analysis');
      console.error('Analysis generation error:', err);
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Format score as percentage
  const formatScore = (score, maxScore = 100) => {
    return Math.round((score / maxScore) * 100);
  };
  
  // Get color based on score percentage
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'error';
  };
  
  // Generate PDF report
  const generateReport = async () => {
    setLoading(true);
    
    try {
      const response = await apiEndpoints.reports.generate({
        reportType: 'resumeAnalysis',
        resumeId: resumeId,
        format: 'pdf'
      });
      
      // Download PDF
      const link = document.createElement('a');
      link.href = response.data.reportUrl;
      link.download = `Resume_Analysis_${resumeId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to generate report');
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Render summary section
  const renderSummary = () => {
    if (!analysis) return null;
    
    const overallScore = formatScore(analysis.overallScore);
    const scoreColor = getScoreColor(overallScore);
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Resume Analysis: {resumeContent?.title || 'Untitled Resume'}
            </Typography>
            
            <Typography variant="subtitle1" color="text.secondary">
              Last analyzed: {new Date(analysis.analyzedAt).toLocaleDateString()}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={generateAnalysis}
              disabled={analyzing}
              sx={{ mr: 1 }}
            >
              Refresh Analysis
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={generateReport}
              disabled={loading || analyzing}
            >
              Download Report
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          {/* Overall Score */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Overall Resume Score
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-flex',
                      mr: 2
                    }}
                  >
                    <CircularProgress
                      variant="determinate"
                      value={overallScore}
                      color={scoreColor}
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
                        {overallScore}%
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body1">
                      {overallScore >= 80 ? 'Excellent' : 
                       overallScore >= 60 ? 'Good' : 
                       overallScore >= 40 ? 'Fair' : 'Needs Improvement'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary">
                      Based on {analysis.criteria?.length || 0} criteria
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* ATS Compatibility */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  ATS Compatibility
                </Typography>
                
                {analysis.atsScore !== undefined && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'inline-flex',
                        mr: 2
                      }}
                    >
                      <CircularProgress
                        variant="determinate"
                        value={analysis.atsScore}
                        color={getScoreColor(analysis.atsScore)}
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
                          {analysis.atsScore}%
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2">
                        {analysis.atsScore >= 80 ? 'Highly likely to pass ATS' : 
                         analysis.atsScore >= 60 ? 'Likely to pass ATS' : 
                         analysis.atsScore >= 40 ? 'May be filtered by ATS' : 'May be rejected by ATS'}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Match to Target Job */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Match to Target Role
                </Typography>
                
                {analysis.targetJobMatch ? (
                  <Box>
                    <Typography variant="body1">
                      {analysis.targetJobTitle || 'Your Target Role'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="h6" sx={{ mr: 1 }}>
                        {analysis.targetJobMatch}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        match rate
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', pt: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Work />}
                      onClick={() => setJobMatchDialogOpen(true)}
                    >
                      Compare to Job
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  // Render section scores
  const renderSectionScores = () => {
    if (!analysis || !analysis.sectionScores) return null;
    
    const sections = Object.keys(analysis.sectionScores);
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Section-by-Section Analysis
        </Typography>
        
        <Grid container spacing={2}>
          {sections.map(section => {
            const score = analysis.sectionScores[section];
            const scoreColor = getScoreColor(score);
            
            return (
              <Grid item xs={12} key={section}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">
                      {section}
                    </Typography>
                    <Typography variant="body2">
                      {score}%
                    </Typography>
                  </Box>
                  
                  <LinearProgress
                    variant="determinate"
                    value={score}
                    color={scoreColor}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    );
  };
  
  // Render detailed criteria
  const renderCriteria = () => {
    if (!analysis || !analysis.criteria) return null;
    
    // Group criteria by category
    const criteriaByCategory = {};
    analysis.criteria.forEach(criterion => {
      if (!criteriaByCategory[criterion.category]) {
        criteriaByCategory[criterion.category] = [];
      }
      criteriaByCategory[criterion.category].push(criterion);
    });
    
    const categories = Object.keys(criteriaByCategory);
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Analysis Criteria
        </Typography>
        
        {categories.map(category => (
          <Accordion key={category} sx={{ mb: 1 }}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{ backgroundColor: 'background.default' }}
            >
              <Typography variant="subtitle1">
                {category}
              </Typography>
            </AccordionSummary>
            
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Criterion</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {criteriaByCategory[category].map((criterion, index) => (
                      <TableRow key={index}>
                        <TableCell>{criterion.name}</TableCell>
                        <TableCell>
                          {criterion.pass ? (
                            <Chip 
                              icon={<Check />} 
                              label="Pass" 
                              color="success" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              icon={<Close />} 
                              label="Improve" 
                              color="warning" 
                              size="small" 
                            />
                          )}
                        </TableCell>
                        <TableCell>{criterion.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    );
  };
  
  // Render keyword analysis
  const renderKeywords = () => {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Keyword Analysis
        </Typography>
        
        <Box sx={{ height: 400 }}>
          <WordCloudVisualizer
            documentId={resumeId}
            documentType="resume"
            width={700}
            height={350}
            readOnly={true}
          />
        </Box>
        
        {analysis && analysis.keywords && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Top Keywords Found
            </Typography>
            
            <Grid container spacing={1}>
              {analysis.keywords.map((keyword, index) => (
                <Grid item key={index}>
                  <Chip 
                    label={`${keyword.text} (${keyword.count})`}
                    color={keyword.relevant ? "primary" : "default"}
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        {analysis && analysis.missedKeywords && analysis.missedKeywords.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Recommended Keywords to Add
            </Typography>
            
            <Grid container spacing={1}>
              {analysis.missedKeywords.map((keyword, index) => (
                <Grid item key={index}>
                  <Chip 
                    label={keyword}
                    color="secondary"
                    variant="outlined"
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    );
  };
  
  // Render recommendations
  const renderRecommendations = () => {
    if (!analysis || !analysis.recommendations) return null;
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recommendations
        </Typography>
        
        <List>
          {analysis.recommendations.map((recommendation, index) => (
            <ListItem key={index} alignItems="flex-start">
              <ListItemIcon>
                {recommendation.priority === 'high' ? (
                  <Warning color="error" />
                ) : recommendation.priority === 'medium' ? (
                  <Info color="warning" />
                ) : (
                  <Info color="info" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={recommendation.title}
                secondary={recommendation.description}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    );
  };
  
  // Render job match comparison
  const renderJobMatch = () => {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Job Match Analysis
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<Compare />}
            onClick={() => setJobMatchDialogOpen(true)}
          >
            Compare with Job
          </Button>
        </Box>
        
        {selectedJob ? (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Comparing with: {selectedJob.title} at {selectedJob.company}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <JobMatchCalculator
                resumeId={resumeId}
                jobId={selectedJob.id}
                showDetailed={true}
              />
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CloudQueue sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography>
              Select a job posting to compare your resume against
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };
  
  if (loading && !analysis && !resumeContent) {
    return <LoadingSpinner message="Loading resume analysis..." />;
  }
  
  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Resume Analysis
        </Typography>
        
        <Box>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={generateReport}
            disabled={!analysis}
            sx={{ mr: 1 }}
          >
            Export Report
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => navigate(`/resume/${resumeId}`)}
          >
            Edit Resume
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {!analysis && !analyzing && (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Analysis Available
          </Typography>
          <Typography variant="body1" paragraph>
            This resume hasn't been analyzed yet. Generate an analysis to see insights and recommendations.
          </Typography>
          <Button
            variant="contained"
            startIcon={analyzing ? <CircularProgress size={24} /> : <Refresh />}
            onClick={generateAnalysis}
            disabled={analyzing}
          >
            {analyzing ? 'Analyzing...' : 'Generate Analysis'}
          </Button>
        </Paper>
      )}
      
      {analyzing && (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Analyzing Your Resume
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This may take a minute. We're checking your resume against industry best practices and job market requirements.
          </Typography>
        </Paper>
      )}
      
      {analysis && (
        <>
          {/* Summary Section */}
          {renderSummary()}
          
          {/* Navigation Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<Assessment />} label="Overview" />
              <Tab icon={<CheckCircle />} label="Criteria" />
              <Tab icon={<CloudQueue />} label="Keywords" />
              <Tab icon={<TrendingUp />} label="Recommendations" />
              <Tab icon={<Work />} label="Job Match" />
            </Tabs>
          </Paper>
          
          {/* Tab Content */}
          {activeTab === 0 && renderOverview()}
          {activeTab === 1 && renderCriteria()}
          {activeTab === 2 && renderKeywords()}
          {activeTab === 3 && renderRecommendations()}
          {activeTab === 4 && renderJobMatch()}
        </>
      )}
      
      {/* Job Match Dialog */}
      <Dialog 
        open={jobMatchDialogOpen} 
        onClose={() => setJobMatchDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Select Job to Compare
        </DialogTitle>
        
        <DialogContent>
          <List sx={{ pt: 1 }}>
            {profile && profile.savedJobs && profile.savedJobs.length > 0 ? (
              profile.savedJobs.map(job => (
                <ListItem
                  button
                  key={job.id}
                  onClick={() => {
                    setSelectedJob(job);
                    setJobMatchDialogOpen(false);
                  }}
                >
                  <ListItemIcon>
                    <Work />
                  </ListItemIcon>
                  <ListItemText
                    primary={job.title}
                    secondary={`${job.company} | ${job.location}`}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary="No saved jobs found"
                  secondary="Save jobs from the job search page to compare with your resume"
                />
              </ListItem>
            )}
          </List>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setJobMatchDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumeAnalysis;