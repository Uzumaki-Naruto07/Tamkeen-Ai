import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Divider,
  Chip, Card, CardContent, IconButton, Tooltip,
  List, ListItem, ListItemText, ListItemIcon,
  Accordion, AccordionSummary, AccordionDetails,
  CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, Tabs, Tab, LinearProgress
} from '@mui/material';
import {
  PlayArrow, Mic, SentimentVerySatisfied,
  Psychology, CheckCircle, Cancel, Insights,
  TrendingUp, ExpandMore, RecordVoiceOver,
  Lightbulb, Star, StarBorder, VideoLibrary,
  ArrowBack, Refresh, Download
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SpeechVisualization from '../components/Speech/SpeechVisualization';
import EmotionAnalysisChart from '../components/Speech/EmotionAnalysisChart';

const InterviewResults = () => {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [keyInsights, setKeyInsights] = useState(null);
  const [improvementAreas, setImprovementAreas] = useState([]);

  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Fetch interview data
  useEffect(() => {
    const fetchInterviewData = async () => {
      if (!interviewId) {
        setLoading(false);
        setError('No interview ID provided');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiEndpoints.interviews.getInterview(interviewId);
        setInterview(response.data);
        
        // Extract key insights and improvement areas
        if (response.data.feedback) {
          setKeyInsights(response.data.feedback.keyInsights || []);
          setImprovementAreas(response.data.feedback.improvementAreas || []);
        }
      } catch (err) {
        setError('Failed to load interview results');
        console.error('Error fetching interview data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInterviewData();
    
    // Cleanup function for audio player
    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
        setAudioPlayer(null);
      }
    };
  }, [interviewId]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Play audio recording
  const playAudioRecording = (audioUrl) => {
    if (audioPlayer) {
      audioPlayer.pause();
    }
    
    const player = new Audio(audioUrl);
    setAudioPlayer(player);
    
    player.onplay = () => setAudioPlaying(true);
    player.onpause = () => setAudioPlaying(false);
    player.onended = () => setAudioPlaying(false);
    
    player.play();
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
        reportType: 'interview',
        interviewId: interviewId,
        format: 'pdf'
      });
      
      // Download PDF
      const link = document.createElement('a');
      link.href = response.data.reportUrl;
      link.download = `Interview_Report_${interviewId}.pdf`;
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
    if (!interview) return null;
    
    const overallScore = formatScore(interview.overallScore);
    const scoreColor = getScoreColor(overallScore);
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {interview.title || 'Interview Results'}
            </Typography>
            
            <Typography variant="subtitle1" color="text.secondary">
              {interview.interviewType || 'Mock Interview'} • 
              {new Date(interview.completedAt).toLocaleDateString()} • 
              {interview.duration} minutes
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/interviews')}
              sx={{ mr: 1 }}
            >
              Back to All Interviews
            </Button>
            
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={generateReport}
              disabled={loading}
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
                  Overall Score
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
                      {interview.questions?.length || 0} questions answered
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Primary Strengths */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Primary Strengths
                </Typography>
                
                {interview.feedback?.strengths?.length > 0 ? (
                  <List dense>
                    {interview.feedback.strengths.slice(0, 3).map((strength, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={strength} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No strengths data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Areas to Improve */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Areas to Improve
                </Typography>
                
                {improvementAreas.length > 0 ? (
                  <List dense>
                    {improvementAreas.slice(0, 3).map((area, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Lightbulb color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={area} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No improvement data available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  // Render detailed scores section
  const renderScores = () => {
    if (!interview || !interview.scores) return null;
    
    const categoryScores = interview.scores.categories || {};
    const categories = Object.keys(categoryScores);
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance by Category
        </Typography>
        
        <Grid container spacing={2}>
          {categories.map(category => {
            const score = formatScore(categoryScores[category]);
            const scoreColor = getScoreColor(score);
            
            return (
              <Grid item xs={12} md={6} key={category}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">
                      {category}
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
  
  // Render questions and answers section
  const renderQuestionsAnswers = () => {
    if (!interview || !interview.questions) return null;
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Questions & Answers
        </Typography>
        
        {interview.questions.map((question, index) => {
          const score = question.score ? formatScore(question.score) : null;
          const scoreColor = score ? getScoreColor(score) : 'default';
          
          return (
            <Accordion key={index} sx={{ mb: 1 }}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{
                  backgroundColor: 'background.default',
                  borderLeft: 3,
                  borderColor: score ? `${scoreColor}.main` : 'grey.300'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                  <Typography variant="subtitle1">
                    Q{index + 1}: {question.text}
                  </Typography>
                  
                  {score && (
                    <Chip 
                      label={`${score}%`}
                      color={scoreColor}
                      size="small"
                    />
                  )}
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Your Answer:
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {question.answer}
                  </Typography>
                  
                  {question.feedback && (
                    <>
                      <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 1 }}>
                        Feedback:
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {question.feedback}
                      </Typography>
                    </>
                  )}
                  
                  {question.audioUrl && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <IconButton
                        onClick={() => {
                          setSelectedAnswer(question);
                          playAudioRecording(question.audioUrl);
                        }}
                        color="primary"
                      >
                        <PlayArrow />
                      </IconButton>
                      
                      <Typography variant="body2" color="text.secondary">
                        {audioPlaying && selectedAnswer === question ? 'Playing audio...' : 'Play recording'}
                      </Typography>
                    </Box>
                  )}
                  
                  {question.emotionAnalysis && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        size="small"
                        startIcon={<SentimentVerySatisfied />}
                        onClick={() => {
                          setSelectedAnswer(question);
                          setDialogOpen(true);
                        }}
                      >
                        View Emotion Analysis
                      </Button>
                    </Box>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Paper>
    );
  };
  
  // Render feedback and recommendations section
  const renderFeedback = () => {
    if (!interview || !interview.feedback) return null;
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Feedback & Recommendations
        </Typography>
        
        {interview.feedback.summary && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Summary
            </Typography>
            
            <Typography variant="body2">
              {interview.feedback.summary}
            </Typography>
          </Box>
        )}
        
        {keyInsights && keyInsights.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Key Insights
            </Typography>
            
            <List>
              {keyInsights.map((insight, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Insights color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={insight} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {improvementAreas.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Areas for Improvement
            </Typography>
            
            <List>
              {improvementAreas.map((area, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Lightbulb color="warning" />
                  </ListItemIcon>
                  <ListItemText primary={area} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {interview.feedback.recommendations && interview.feedback.recommendations.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Recommended Actions
            </Typography>
            
            <List>
              {interview.feedback.recommendations.map((recommendation, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <TrendingUp color="info" />
                  </ListItemIcon>
                  <ListItemText primary={recommendation} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>
    );
  };
  
  if (loading && !interview) {
    return <LoadingSpinner message="Loading interview results..." />;
  }
  
  if (error) {
    return (
      <Box sx={{ py: 3 }}>
        <Alert severity="error">{error}</Alert>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/interviews')}
          >
            Back to All Interviews
          </Button>
        </Box>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 3 }}>
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
          <Tab icon={<Psychology />} label="Performance" />
          <Tab icon={<RecordVoiceOver />} label="Questions & Answers" />
          <Tab icon={<Insights />} label="Feedback & Recommendations" />
        </Tabs>
      </Paper>
      
      {/* Tab Content */}
      {activeTab === 0 && renderScores()}
      {activeTab === 1 && renderQuestionsAnswers()}
      {activeTab === 2 && renderFeedback()}
      
      {/* Emotion Analysis Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Emotion Analysis
        </DialogTitle>
        
        <DialogContent>
          {selectedAnswer && selectedAnswer.emotionAnalysis && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Question: {selectedAnswer.text}
              </Typography>
              
              <Box sx={{ my: 3 }}>
                {/* Emotion Chart */}
                <EmotionAnalysisChart 
                  data={selectedAnswer.emotionAnalysis} 
                  height={300}
                />
              </Box>
              
              <Typography variant="subtitle1" gutterBottom>
                Analysis:
              </Typography>
              
              <Typography variant="body2" paragraph>
                {selectedAnswer.emotionAnalysis.summary || "Your response showed a mix of emotions throughout your answer."}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Tips:
              </Typography>
              
              <List>
                {(selectedAnswer.emotionAnalysis.tips || []).map((tip, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Lightbulb color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterviewResults;
