import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Divider,
  Chip, Card, CardContent, IconButton, Tooltip,
  List, ListItem, ListItemText, ListItemIcon,
  Accordion, AccordionSummary, AccordionDetails,
  CircularProgress, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions, Tabs, Tab, LinearProgress,
  Rating
} from '@mui/material';
import {
  PlayArrow, Mic, SentimentVerySatisfied, SentimentSatisfied,
  SentimentDissatisfied, Psychology, CheckCircle, Cancel, Insights,
  TrendingUp, ExpandMore, RecordVoiceOver, SwapVert,
  Lightbulb, Star, StarBorder, VideoLibrary, StackedBarChart,
  ArrowBack, Refresh, Download, FormatQuote, Analytics,
  AssessmentOutlined, ArrowRight
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiService from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import InterviewPerformanceChart from '../components/charts/InterviewPerformanceChart';
import SkillsRadarChart from '../components/charts/SkillsRadarChart';
import { jsPDF } from 'jspdf';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

// Text analysis utilities
const analyzeText = (text) => {
  // Ensure text is a string
  text = text || '';
  const textLower = text.toLowerCase();
  
  // Basic metrics
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

  // Return default values if text is too short
  if (wordCount < 5) {
    return {
      technical: 25,
      communication: 30,
      problemSolving: 25,
      culturalFit: 35,
      overall: 30,
      category: 'Weak',
      sentiment: 0.4,
      emotionScores: {
        neutral: 0.7,
        uncertainty: 0.2,
        confidence: 0.1,
        enthusiasm: 0
      },
      dominantEmotion: 'neutral',
      keywords: [],
      strengths: ["Needs improvement across all areas"],
      weaknesses: ["Response is too brief", "Lacks detailed examples"],
      improvements: ["Provide more comprehensive answers with specific examples"]
    };
  }
  
  // Keyword categories (similar to Python implementation)
  const technicalKeywords = [
    'algorithm', 'data structure', 'code', 'programming', 'software',
    'development', 'database', 'api', 'function', 'class', 'object',
    'method', 'variable', 'framework', 'library', 'interface', 'architecture',
    'test', 'debug', 'deploy', 'cloud', 'server', 'client', 'network'
  ];
  
  const communicationKeywords = [
    'communicate', 'team', 'collaborate', 'explain', 'present',
    'discuss', 'share', 'meetings', 'documentation', 'report',
    'clarity', 'articulate', 'express', 'listen', 'feedback'
  ];
  
  const problemSolvingKeywords = [
    'solve', 'solution', 'analyze', 'optimize', 'improve', 'debug',
    'troubleshoot', 'fix', 'enhance', 'approach', 'method', 'strategy',
    'plan', 'design', 'implement', 'test'
  ];
  
  const culturalFitKeywords = [
    'team', 'culture', 'values', 'mission', 'collaborate', 'work ethic',
    'adaptable', 'flexible', 'learn', 'growth', 'positive', 'attitude',
    'initiative', 'proactive', 'responsible', 'accountable'
  ];
  
  // Negative response indicators
  const negativePhrasesDetection = [
    "i don't know", "no idea", "not sure", "never heard", "no experience",
    "i haven't", "can't answer", "don't understand", "no clue", "not familiar"
  ];
  
  // Emotional indicators
  const positiveWords = [
    "good", "great", "excellent", "amazing", "awesome", "fantastic", "positive",
    "happy", "love", "enjoy", "passionate", "excited", "enthusiastic", "success"
  ];
  
  const negativeWords = [
    "bad", "poor", "terrible", "horrible", "awful", "negative", "sad", 
    "hate", "dislike", "angry", "upset", "fail", "disappointing", "struggle"
  ];
  
  const uncertaintyWords = [
    "maybe", "perhaps", "possibly", "sometimes", "occasionally", "might",
    "could be", "probably", "may", "think", "guess", "not sure", "uncertain"
  ];
  
  const confidenceWords = [
    "definitely", "absolutely", "certainly", "confident", "sure", "without doubt",
    "clearly", "undoubtedly", "always", "expert", "specialist", "proficient"
  ];
  
  // Detect negative responses
  const hasNegativePhrase = negativePhrasesDetection.some(phrase => textLower.includes(phrase));
  
  // Count keyword occurrences
  const techCount = technicalKeywords.filter(keyword => textLower.includes(keyword)).length;
  const commCount = communicationKeywords.filter(keyword => textLower.includes(keyword)).length;
  const probCount = problemSolvingKeywords.filter(keyword => textLower.includes(keyword)).length;
  const cultCount = culturalFitKeywords.filter(keyword => textLower.includes(keyword)).length;
  
  // Count emotional indicators
  const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
  const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
  const uncertaintyCount = uncertaintyWords.filter(word => textLower.includes(word)).length;
  const confidenceCount = confidenceWords.filter(word => textLower.includes(word)).length;
  
  // Calculate area scores (0-100 scale)
  // More words & more keywords = higher scores
  const technicalScore = Math.min(100, 45 + techCount * 10 + (wordCount / 10));
  const communicationScore = Math.min(100, 50 + commCount * 8 + (wordCount / 8));
  const problemSolvingScore = Math.min(100, 40 + probCount * 12 + (wordCount / 12));
  const culturalFitScore = Math.min(100, 45 + cultCount * 10 + (wordCount / 10));
  
  // Calculate overall score
  const overallScore = Math.round(
    (technicalScore + communicationScore + problemSolvingScore + culturalFitScore) / 4
  );
  
  // Determine category
  let category = 'Average';
  if (overallScore >= 75) {
    category = 'Strong';
  } else if (overallScore < 40 || hasNegativePhrase) {
    category = 'Weak';
  }
  
  // Calculate sentiment score (0-1 scale)
  const sentimentScore = (positiveCount * 2 - negativeCount) / (wordCount / 5);
  const normalizedSentiment = Math.max(0, Math.min(1, 0.5 + sentimentScore / 10));
  
  // Calculate emotion scores
  const totalEmotions = positiveCount + negativeCount + uncertaintyCount + confidenceCount + 1; // +1 to avoid division by zero
  const enthusiasm = Math.min(1, (positiveCount * 2) / totalEmotions);
  const neutral = Math.max(0, 1 - (positiveCount + negativeCount + uncertaintyCount + confidenceCount) / totalEmotions);
  
  const emotionScores = {
    neutral: Math.max(0.1, neutral),
    uncertainty: Math.min(1, uncertaintyCount / (wordCount / 10)),
    confidence: Math.min(1, confidenceCount / (wordCount / 10)),
    enthusiasm: enthusiasm
  };
  
  // Normalize emotion scores to sum to 1
  const emotionSum = Object.values(emotionScores).reduce((sum, val) => sum + val, 0);
  Object.keys(emotionScores).forEach(key => {
    emotionScores[key] = emotionScores[key] / emotionSum;
  });
  
  // Determine dominant emotion
  const dominantEmotion = Object.entries(emotionScores).sort((a, b) => b[1] - a[1])[0][0];
  
  // Extract keywords
  const allKeywords = [...technicalKeywords, ...communicationKeywords, ...problemSolvingKeywords, ...culturalFitKeywords];
  const extractedKeywords = allKeywords.filter(keyword => textLower.includes(keyword));
  
  // Identify strengths and weaknesses
  const areas = [
    { name: 'Technical knowledge', score: technicalScore },
    { name: 'Communication skills', score: communicationScore },
    { name: 'Problem-solving approach', score: problemSolvingScore },
    { name: 'Team and culture fit', score: culturalFitScore }
  ];
  
  const sortedStrengths = [...areas].sort((a, b) => b.score - a.score);
  const sortedWeaknesses = [...areas].sort((a, b) => a.score - b.score);
  
  const strengths = sortedStrengths.slice(0, 2)
    .filter(area => area.score > 60)
    .map(area => `Strong ${area.name.toLowerCase()}`);
  
  const weaknesses = sortedWeaknesses.slice(0, 2)
    .filter(area => area.score < 70)
    .map(area => `Could improve ${area.name.toLowerCase()}`);
  
  // If no strengths were high enough, add a generic one
  if (strengths.length === 0) {
    strengths.push(`Reasonable ${sortedStrengths[0].name.toLowerCase()}`);
  }
  
  // If no weaknesses were low enough, add a generic one
  if (weaknesses.length === 0) {
    weaknesses.push(`Could further enhance ${sortedWeaknesses[0].name.toLowerCase()}`);
  }
  
  // Generate improvement suggestions
  const improvements = [];
  
  if (wordCount < 50) {
    improvements.push("Provide more detailed and comprehensive answers");
  }
  
  if (sortedWeaknesses[0].score < 60) {
    if (sortedWeaknesses[0].name === 'Technical knowledge') {
      improvements.push("Include more specific technical terms and examples");
    } else if (sortedWeaknesses[0].name === 'Communication skills') {
      improvements.push("Structure your answers more clearly with beginning, middle, and end");
    } else if (sortedWeaknesses[0].name === 'Problem-solving approach') {
      improvements.push("Use the STAR method (Situation, Task, Action, Result) in your responses");
    } else {
      improvements.push("Emphasize teamwork and cultural values in your answers");
    }
  }
  
  if (uncertaintyCount > confidenceCount) {
    improvements.push("Use more confident language and avoid uncertainty phrases");
  }
  
  // Return analysis results
  return {
    technical: Math.round(technicalScore),
    communication: Math.round(communicationScore),
    problemSolving: Math.round(problemSolvingScore),
    culturalFit: Math.round(culturalFitScore),
    overall: overallScore,
    category,
    sentiment: normalizedSentiment,
    emotionScores,
    dominantEmotion,
    keywords: extractedKeywords.slice(0, 5),
    strengths,
    weaknesses,
    improvements
  };
};

// Emotion Score Panel Component
const EmotionScorePanel = ({ emotionScores }) => {
  if (!emotionScores) {
    return <Box sx={{ p: 2, textAlign: 'center' }}>No emotion data available</Box>;
  }
  
  const emotions = {
    neutral: { color: '#607D8B', icon: <SentimentSatisfied />, label: 'Neutral' },
    uncertainty: { color: '#FFC107', icon: <SentimentDissatisfied />, label: 'Uncertainty' },
    confidence: { color: '#4CAF50', icon: <SentimentVerySatisfied />, label: 'Confidence' },
    enthusiasm: { color: '#2196F3', icon: <SentimentVerySatisfied />, label: 'Enthusiasm' }
  };
  
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          Emotional Tone Analysis
        </Typography>
        
        <Grid container spacing={2}>
          {Object.entries(emotionScores).map(([emotion, score]) => (
            <Grid item xs={6} sm={3} key={emotion}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={score * 100}
                    size={64}
                    thickness={6}
                    sx={{ color: emotions[emotion]?.color || '#999' }}
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
                    {emotions[emotion]?.icon}
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {emotions[emotion]?.label || emotion}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(score * 100)}%
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Get emoji for classification
const getCategoryEmoji = (category) => {
  switch (category?.toLowerCase()) {
    case 'strong':
      return '⭐';
    case 'average':
      return '✓';
    case 'weak':
      return '△';
    default:
      return '•';
  }
};

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in InterviewResults:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Something went wrong loading the interview results.
          </Alert>
          <Button 
            variant="contained" 
            startIcon={<Refresh />}
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Retry
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />}
            onClick={() => {
              this.props.navigate('/interviews');
            }}
            sx={{ ml: 2 }}
          >
            Back to Interviews
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

const InterviewResults = () => {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [activeChartTab, setActiveChartTab] = useState('radar');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioPlayer, setAudioPlayer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [keyInsights, setKeyInsights] = useState(null);
  const [improvementAreas, setImprovementAreas] = useState([]);
  
  // New state variables for sentiment analysis
  const [analysisResults, setAnalysisResults] = useState([]);
  const [overallSentiment, setOverallSentiment] = useState(0.5);
  const [emotionBreakdown, setEmotionBreakdown] = useState(null);
  const [strengthsWeaknesses, setStrengthsWeaknesses] = useState({ strengths: [], weaknesses: [] });
  const [showSentimentDetails, setShowSentimentDetails] = useState(false);
  
  // Refs for charts
  const sentimentChartRef = useRef(null);
  const skillsChartRef = useRef(null);

  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Process interview data with sentiment analysis
  useEffect(() => {
    if (!interviewId) {
      setError('No interview ID provided');
      setLoading(false);
      return;
    }

    const fetchInterviewData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching interview results for ID: ${interviewId}`);
        
        // For debugging purposes
        console.log('Current interview state:', interview);

        // Try to load from localStorage first (fastest)
        let interviewData = null;
        try {
          const storedData = localStorage.getItem(`interview-${interviewId}`);
          if (storedData) {
            interviewData = JSON.parse(storedData);
            console.log('Retrieved interview data from localStorage:', interviewData);
          }
        } catch (localStorageError) {
          console.error('Error retrieving from localStorage:', localStorageError);
        }

        // If we have data from localStorage, use it
        if (interviewData) {
          setInterview(interviewData);
          processInterviewData(interviewData);
          setLoading(false);
          return;
        }
        
        // Add a mock interview for testing - this ensures we always have data to show
        const mockInterview = {
          id: interviewId || 'mock-interview-id',
          title: 'Mock Interview',
          date: new Date().toISOString(),
          duration: 15,
          questions: [
            {
              id: 'q1',
              text: 'Tell me about yourself and your background.',
              hint: 'Focus on relevant experience and skills',
              answer: {
                transcription: 'I have experience in web development with a focus on frontend technologies like React. I enjoy solving complex problems and have worked on several projects that required creative solutions.',
                videoUrl: null,
                analysis: {
                  technical: 75,
                  communication: 82,
                  problemSolving: 70,
                  culturalFit: 85,
                  overall: 78,
                  category: 'Good',
                  tip: 'Try to include more specific examples',
                  strengths: ['Communication skills', 'Cultural fit'],
                  weaknesses: ['Could provide more details']
                }
              }
            },
            {
              id: 'q2',
              text: 'Describe a challenging project you worked on recently.',
              hint: 'Use the STAR method',
              answer: {
                transcription: 'I recently worked on a complex web application that required optimizing performance. I identified bottlenecks in the rendering process and implemented code splitting to improve load times by 40%.',
                videoUrl: null,
                analysis: {
                  technical: 85,
                  communication: 75,
                  problemSolving: 88,
                  culturalFit: 78,
                  overall: 82,
                  category: 'Excellent',
                  tip: 'Great use of metrics',
                  strengths: ['Technical knowledge', 'Problem solving'],
                  weaknesses: ['Could improve delivery']
                }
              }
            }
          ]
        };
        
        // Try to fetch from API first
        try {
          const response = await apiService.interviews.getInterviewResults(interviewId);
          console.log('API response:', response);
          
          if (response && response.data) {
            setInterview(response.data);
            processInterviewData(response.data);
          } else {
            console.log('No data from API, using mock data');
            setInterview(mockInterview);
            processInterviewData(mockInterview);
          }
        } catch (apiError) {
          console.error('API fetch error:', apiError);
          console.log('Falling back to mock data');
          setInterview(mockInterview);
          processInterviewData(mockInterview);
        }
        
        setLoading(false);
      } catch (e) {
        console.error('Error in interview data processing:', e);
        setError('Failed to load interview results. Please try again later.');
        setLoading(false);
        
        // Still try to use mock data as fallback
        const mockInterview = {
          id: interviewId || 'mock-interview-id',
          title: 'Mock Interview',
          questions: [
            {
              id: 'q1',
              text: 'Tell me about yourself.',
              answer: {
                transcription: 'Sample answer transcription',
                analysis: {
                  overall: 70,
                  category: 'Good'
                }
              }
            }
          ]
        };
        
        setInterview(mockInterview);
        processInterviewData(mockInterview);
      }
    };

    fetchInterviewData();
  }, [interviewId]);
  
  // Modify the processInterviewData function to handle missing data
  const processInterviewData = (interviewData) => {
    if (!interviewData || !interviewData.questions) {
      console.error('No interview questions found in data');
      return;
    }
    
    try {
      console.log('Processing interview data:', interviewData);
      
      // Extract all answers that have analysis
      const results = interviewData.questions
        .filter(q => q.answer && q.answer.analysis)
        .map(q => ({
          questionId: q.id,
          text: q.text,
          transcription: q.answer.transcription || 'No transcription available',
          analysis: q.answer.analysis || {
            technical: 50,
            communication: 50,
            problemSolving: 50,
            culturalFit: 50,
            overall: 50,
            category: 'Average',
            strengths: ['No strengths analyzed'],
            weaknesses: ['No weaknesses analyzed']
          }
        }));
      
      setAnalysisResults(results);
      
      // Calculate overall sentiment
      const sentiments = results.map(r => r.analysis.sentiment || 0.5);
      const avgSentiment = sentiments.length > 0 
        ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length 
        : 0.5;
      setOverallSentiment(avgSentiment);
      
      // Create emotion breakdown
      const emotions = {
        neutral: 0.4,
        confidence: 0.3,
        uncertainty: 0.2,
        enthusiasm: 0.1
      };
      
      // Try to extract from results if available
      if (results.length > 0) {
        const emotionTypes = ['neutral', 'confidence', 'uncertainty', 'enthusiasm'];
        emotionTypes.forEach(type => {
          const values = results
            .filter(r => r.analysis.emotions && r.analysis.emotions[type] !== undefined)
            .map(r => r.analysis.emotions[type]);
          
          if (values.length > 0) {
            emotions[type] = values.reduce((a, b) => a + b, 0) / values.length;
          }
        });
      }
      
      setEmotionBreakdown(emotions);
      
      // Get strengths and weaknesses
      const allStrengths = results
        .flatMap(r => r.analysis.strengths || [])
        .filter(s => s);
      
      const allWeaknesses = results
        .flatMap(r => r.analysis.weaknesses || [])
        .filter(w => w);
      
      // Count occurrences and take most frequent
      const strengthsCount = {};
      const weaknessesCount = {};
      
      allStrengths.forEach(s => {
        strengthsCount[s] = (strengthsCount[s] || 0) + 1;
      });
      
      allWeaknesses.forEach(w => {
        weaknessesCount[w] = (weaknessesCount[w] || 0) + 1;
      });
      
      // Sort by frequency
      const sortedStrengths = Object.entries(strengthsCount)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
      
      const sortedWeaknesses = Object.entries(weaknessesCount)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
      
      // Default suggestions if none available
      const finalStrengths = sortedStrengths.length > 0 
        ? sortedStrengths.slice(0, 3) 
        : ['Articulated responses clearly', 'Showed enthusiasm for the role', 'Provided structured answers'];
      
      const finalWeaknesses = sortedWeaknesses.length > 0 
        ? sortedWeaknesses.slice(0, 3) 
        : ['Could provide more specific examples', 'Occasional use of filler words', 'May benefit from more concise responses'];
      
      setStrengthsWeaknesses({
        strengths: finalStrengths,
        weaknesses: finalWeaknesses
      });
      
      console.log('Interview data processed successfully');
    } catch (error) {
      console.error('Error processing interview data:', error);
      // Set fallback values
      setAnalysisResults([]);
      setOverallSentiment(0.5);
      setEmotionBreakdown({
        neutral: 0.4,
        confidence: 0.3,
        uncertainty: 0.2,
        enthusiasm: 0.1
      });
      setStrengthsWeaknesses({
        strengths: ['Interview data processing failed'],
        weaknesses: ['Please try again later']
      });
    }
  };
  
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
      // Create a simple downloadable report if the API call fails
      const generateSimplePDF = () => {
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(18);
        doc.text('Interview Results Report', 105, 20, { align: 'center' });
        
        // Add interview details
        doc.setFontSize(12);
        doc.text(`Interview: ${interview.title || 'Mock Interview'}`, 20, 40);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
        doc.text(`Duration: ${interview.duration || 15} minutes`, 20, 60);
        
        // Add overall score
        doc.setFontSize(14);
        doc.text('Overall Performance', 20, 80);
        doc.text(`Score: ${interview.overallScore || 0}/100`, 20, 90);
        
        // Add questions and answers
        doc.setFontSize(14);
        doc.text('Questions & Answers', 20, 110);
        
        let yPos = 120;
        interview.questions?.forEach((q, index) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFontSize(12);
          doc.text(`Q${index + 1}: ${q.text?.substring(0, 60) || 'Interview Question'}`, 20, yPos);
          yPos += 10;
          
          doc.setFontSize(10);
          const answer = q.answer?.transcription || 'No answer provided';
          // Split long text into multiple lines
          const splitAnswer = doc.splitTextToSize(answer, 170);
          doc.text(splitAnswer, 20, yPos);
          yPos += splitAnswer.length * 7 + 10;
        });
        
        // Save the PDF
        doc.save(`Interview_Report_${interviewId}.pdf`);
      };
      
      try {
        // Try API call first
        const response = await apiService.reports.generate({
          reportType: 'interview',
          interviewId: interviewId,
          format: 'pdf'
        });
        
        // Download PDF from API response
        if (response && response.data && response.data.reportUrl) {
          // Download PDF
          const link = document.createElement('a');
          link.href = response.data.reportUrl;
          link.download = `Interview_Report_${interviewId}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // Fallback to simple PDF if API returned success but no URL
          console.log('API returned success but no report URL, using fallback');
          generateSimplePDF();
        }
      } catch (err) {
        console.error('API report generation error:', err);
        console.log('Using fallback PDF generation');
        generateSimplePDF();
      }
    } catch (err) {
      setError('Failed to generate report');
      console.error('Report generation error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Render summary section with sentiment analysis
  const renderSummary = () => {
    if (!interview) return null;
    
    const overallScore = interview.overallScore;
    const scoreColor = getScoreColor(overallScore);
    
    // Performance chart data
    const performanceData = analysisResults.length > 0 ? [
      { category: 'Technical', score: Math.round(analysisResults.reduce((sum, q) => sum + q.analysis.technical, 0) / analysisResults.length) },
      { category: 'Communication', score: Math.round(analysisResults.reduce((sum, q) => sum + q.analysis.communication, 0) / analysisResults.length) },
      { category: 'Problem Solving', score: Math.round(analysisResults.reduce((sum, q) => sum + q.analysis.problemSolving, 0) / analysisResults.length) },
      { category: 'Cultural Fit', score: Math.round(analysisResults.reduce((sum, q) => sum + q.analysis.culturalFit, 0) / analysisResults.length) }
    ] : [
      { category: 'Technical', score: 65 },
      { category: 'Communication', score: 75 },
      { category: 'Problem Solving', score: 60 },
      { category: 'Cultural Fit', score: 70 }
    ];
    
    // Skills radar data
    const skillsRadarData = [
      { name: 'Technical Skills', value: performanceData[0].score },
      { name: 'Communication', value: performanceData[1].score },
      { name: 'Problem Solving', value: performanceData[2].score },
      { name: 'Cultural Fit', value: performanceData[3].score },
      { name: 'Confidence', value: emotionBreakdown?.confidence ? Math.round(emotionBreakdown.confidence * 100) : 60 },
      { name: 'Enthusiasm', value: emotionBreakdown?.enthusiasm ? Math.round(emotionBreakdown.enthusiasm * 100) : 55 }
    ];
    
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
              onClick={() => navigate('/ai-coach/mock-interview')}
              sx={{ mr: 2 }}
            >
              Back to Mock Interview
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
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom align="center">
                  Overall Performance
                </Typography>
                
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={overallScore}
                      size={120}
                      thickness={5}
                      color={scoreColor}
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
                      <Typography variant="h4" component="div" fontWeight="bold">
                        {overallScore}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Chip 
                    label={analysisResults.length > 0 ? analysisResults[0].analysis.category : 'Average'} 
                    color={scoreColor}
                    sx={{ fontWeight: 'bold', py: 2, px: 1 }}
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {getCategoryEmoji(analysisResults.length > 0 ? analysisResults[0].analysis.category : 'Average')}{' '}
                    {getScoreDescription(overallScore)}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Interview Stats:
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Questions:</Typography>
                  <Typography variant="body2">{interview.questions?.length || 0}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Avg. Word Count:</Typography>
                  <Typography variant="body2">
                    {Math.round(analysisResults.reduce((sum, q) => 
                      sum + (q.analysis.wordCount || 0), 0) / Math.max(1, analysisResults.length))}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Sentiment:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getSentimentEmoji(overallSentiment)}{' '}
                    <Typography variant="body2" sx={{ ml: 0.5 }}>
                      {getSentimentText(overallSentiment)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Tabs
              value={activeChartTab}
              onChange={(e, newValue) => setActiveChartTab(newValue)}
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 2 }}
            >
              <Tab value="radar" label="Radar Chart" />
              <Tab value="performance" label="Performance Chart" />
            </Tabs>
            
            {activeChartTab === 'radar' ? (
              <SkillsRadarChart
                data={skillsRadarData}
                height={300}
                title="Skills Assessment"
                maxValue={100}
              />
            ) : (
              <InterviewPerformanceChart 
                data={performanceData}
                height={300}
                title="Performance Analysis"
                chartType="bar"
              />
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="subtitle1">
                  <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Emotional Intelligence Analysis
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <EmotionScorePanel emotionScores={emotionBreakdown} />
                
                <Typography variant="body2" paragraph>
                  This analysis evaluates the emotional tone of your responses to identify patterns in your communication style.
                  The breakdown above shows the proportion of different emotional markers detected in your language.
                </Typography>
        
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Key Observations:</Typography>
                  <List dense>
                    {emotionBreakdown && emotionBreakdown.confidence > 0.3 && (
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="You demonstrated confidence in your responses" />
                      </ListItem>
                    )}
                    
                    {emotionBreakdown && emotionBreakdown.enthusiasm > 0.25 && (
                      <ListItem>
                        <ListItemIcon>
                          <CheckCircle color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Your enthusiasm for the topics was evident" />
                      </ListItem>
                    )}
                    
                    {emotionBreakdown && emotionBreakdown.uncertainty > 0.25 && (
                      <ListItem>
                        <ListItemIcon>
                          <Lightbulb color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Consider using more confident language to avoid uncertainty" />
                      </ListItem>
                    )}
                    
                    {emotionBreakdown && emotionBreakdown.neutral > 0.4 && (
                      <ListItem>
                        <ListItemIcon>
                          <Lightbulb color="info" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Your tone was predominantly neutral and professional" />
                      </ListItem>
                    )}
                  </List>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  // Get sentiment emoji
  const getSentimentEmoji = (score) => {
    if (score >= 0.75) return '😊';
    if (score >= 0.6) return '🙂';
    if (score >= 0.4) return '😐';
    if (score >= 0.25) return '🙁';
    return '😟';
  };
  
  // Get sentiment text description
  const getSentimentText = (score) => {
    if (score >= 0.75) return 'Very Positive';
    if (score >= 0.6) return 'Positive';
    if (score >= 0.4) return 'Neutral';
    if (score >= 0.25) return 'Negative';
    return 'Very Negative';
  };
  
  // Get score description
  const getScoreDescription = (score) => {
    if (score >= 85) return "Excellent performance across all areas";
    if (score >= 70) return "Strong performance with minor areas for improvement";
    if (score >= 55) return "Good foundation with several areas to enhance";
    if (score >= 40) return "Adequate performance with significant room for growth";
    return "Needs substantial improvement in multiple areas";
  };
  
  // Render individual question with sentiment analysis
  const renderQuestion = (question, index) => {
    if (!question) return null;
    
    const score = question.score || 0;
    const scoreColor = getScoreColor(score);
    const analysis = question.analysis || {};
    const hasRecording = !!question.recordingUrl;
          
          return (
      <Paper key={index} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" gutterBottom>
            Question {index + 1}: {question.questionText}
                  </Typography>
                  
          {hasRecording && (
            <IconButton onClick={() => handlePlayAudio(question.recordingUrl)}>
              <PlayCircle color={isPlaying && currentAudio === question.recordingUrl ? 'primary' : 'action'} />
            </IconButton>
                  )}
                </Box>
              
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom color="text.secondary">
                    Your Answer:
                  </Typography>
                  
          <Typography variant="body1" paragraph>
            {question.answerText || "No text response recorded"}
                  </Typography>
        </Box>
        
        {analysisResults.length > 0 && analysisResults[index] && (
          <>
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              <AssessmentOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
              Response Analysis
                      </Typography>
                      
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom align="center">
                      Response Score
                      </Typography>
                    
                    <Box sx={{ textAlign: 'center', my: 2 }}>
                      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress
                          variant="determinate"
                          value={score}
                          size={80}
                          thickness={4}
                          color={scoreColor}
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
                          <Typography variant="h6" component="div" fontWeight="bold">
                            {score}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Response Metrics:
                      </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Words:</Typography>
                      <Typography variant="body2">{analysis.wordCount || 0}</Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Sentiment:</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getSentimentEmoji(analysis.sentiment || 0.5)}{' '}
                        <Typography variant="body2" sx={{ ml: 0.5 }}>
                          {getSentimentText(analysis.sentiment || 0.5)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {analysis.keywords && analysis.keywords.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Key Terms:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {analysis.keywords.slice(0, 5).map((keyword, i) => (
                            <Chip key={i} label={keyword} size="small" />
                          ))}
                        </Box>
                    </Box>
                  )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Skill Assessment
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">Technical</Typography>
                            <Typography variant="body2" fontWeight="medium">{analysis.technical || 0}/100</Typography>
                </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={analysis.technical || 0} 
                            color={getScoreColor(analysis.technical || 0)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">Communication</Typography>
                            <Typography variant="body2" fontWeight="medium">{analysis.communication || 0}/100</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={analysis.communication || 0} 
                            color={getScoreColor(analysis.communication || 0)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">Problem Solving</Typography>
                            <Typography variant="body2" fontWeight="medium">{analysis.problemSolving || 0}/100</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={analysis.problemSolving || 0} 
                            color={getScoreColor(analysis.problemSolving || 0)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">Cultural Fit</Typography>
                            <Typography variant="body2" fontWeight="medium">{analysis.culturalFit || 0}/100</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={analysis.culturalFit || 0} 
                            color={getScoreColor(analysis.culturalFit || 0)}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" gutterBottom>
                      Emotional Tone
            </Typography>
            
                    <Grid container spacing={1}>
                      {analysis.emotions && Object.entries(analysis.emotions).map(([emotion, value]) => (
                        <Grid item xs={6} sm={3} key={emotion}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                            </Typography>
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                              <CircularProgress
                                variant="determinate"
                                value={value * 100}
                                size={40}
                                thickness={4}
                                color={
                                  emotion === 'confidence' || emotion === 'enthusiasm' 
                                    ? 'success' 
                                    : emotion === 'uncertainty' || emotion === 'negativity'
                                    ? 'warning'
                                    : 'info'
                                }
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
                                <Typography variant="caption" component="div" fontWeight="bold">
                                  {Math.round(value * 100)}
            </Typography>
          </Box>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                <Lightbulb color="warning" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Improvement Suggestions:
            </Typography>
            
              <List dense>
                {analysis.suggestions && analysis.suggestions.map((suggestion, i) => (
                  <ListItem key={i} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <ArrowRight />
                  </ListItemIcon>
                    <ListItemText primary={suggestion} />
                </ListItem>
              ))}
                
                {(!analysis.suggestions || analysis.suggestions.length === 0) && (
                  <ListItem sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <ArrowRight />
                  </ListItemIcon>
                    <ListItemText primary="Focus on using more specific examples in your responses" />
                </ListItem>
                )}
            </List>
          </Box>
          </>
        )}
        
        <Divider sx={{ my: 3 }} />
        
            <Typography variant="subtitle1" gutterBottom>
          Feedback
            </Typography>
            
        <Typography variant="body1">
          {question.feedback || "No feedback available"}
        </Typography>
      </Paper>
    );
  };
  
  // Define renderQuestionsAnswers function if it's not already defined
  const renderQuestionsAnswers = () => {
    if (!interview || !interview.questions) {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          No questions or answers available to display.
        </Alert>
      );
    }

    return (
      <Box>
        {interview.questions.map((question, index) => renderQuestion(question, index))}
      </Box>
    );
  };

  // Define renderFeedback function if it's not already defined
  const renderFeedback = () => {
    if (!interview) {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          No feedback available to display.
        </Alert>
      );
    }

    // Format performance data for the performance chart
    const performanceData = analysisResults.length > 0 ? [
      { category: 'Technical', score: Math.round(analysisResults.reduce((sum, q) => sum + q.analysis.technical, 0) / analysisResults.length) },
      { category: 'Communication', score: Math.round(analysisResults.reduce((sum, q) => sum + q.analysis.communication, 0) / analysisResults.length) },
      { category: 'Problem Solving', score: Math.round(analysisResults.reduce((sum, q) => sum + q.analysis.problemSolving, 0) / analysisResults.length) },
      { category: 'Cultural Fit', score: Math.round(analysisResults.reduce((sum, q) => sum + q.analysis.culturalFit, 0) / analysisResults.length) }
    ] : [
      { category: 'Technical', score: 65 },
      { category: 'Communication', score: 75 },
      { category: 'Problem Solving', score: 60 },
      { category: 'Cultural Fit', score: 70 }
    ];
    
    // Format data for skills radar chart
    const skillsRadarData = [
      { name: 'Technical Skills', value: performanceData[0].score },
      { name: 'Communication', value: performanceData[1].score },
      { name: 'Problem Solving', value: performanceData[2].score },
      { name: 'Cultural Fit', value: performanceData[3].score },
      { name: 'Confidence', value: emotionBreakdown?.confidence ? Math.round(emotionBreakdown.confidence * 100) : 60 },
      { name: 'Enthusiasm', value: emotionBreakdown?.enthusiasm ? Math.round(emotionBreakdown.enthusiasm * 100) : 55 }
    ];

    return (
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InterviewPerformanceChart 
              data={performanceData}
              height={400}
              title="Performance Overview"
              chartType="radial"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <SkillsRadarChart
              data={skillsRadarData}
              height={400}
              title="Skills Assessment"
              maxValue={100}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Strengths & Weaknesses
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      <CheckCircle fontSize="small" color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Strengths:
                    </Typography>
                    
                    <List dense>
                      {strengthsWeaknesses.strengths.map((strength, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <Star fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={strength} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      <Lightbulb fontSize="small" color="warning" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Areas for Improvement:
                    </Typography>
                    
                    <List dense>
                      {strengthsWeaknesses.weaknesses.map((weakness, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 30 }}>
                            <Lightbulb fontSize="small" color="warning" />
                          </ListItemIcon>
                          <ListItemText primary={weakness} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detailed Feedback
              </Typography>
              
              <Typography variant="body1" paragraph>
                {interview.feedback || "No overall feedback is available for this interview."}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                <Lightbulb color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                Improvement Recommendations:
              </Typography>
              
              <List>
                {analysisResults.flatMap(result => 
                  result.analysis.improvements || []
                ).filter((item, index, arr) => 
                  arr.indexOf(item) === index // Remove duplicates
                ).slice(0, 5).map((improvement, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ArrowRight />
                    </ListItemIcon>
                    <ListItemText primary={improvement} />
                  </ListItem>
                ))}
                
                {(!analysisResults.length || !analysisResults.flatMap(result => 
                  result.analysis.improvements || []
                ).length) && (
                  <>
                    <ListItem>
                      <ListItemIcon>
                        <ArrowRight />
                      </ListItemIcon>
                      <ListItemText primary="Practice using the STAR method (Situation, Task, Action, Result) for behavioral questions" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ArrowRight />
                      </ListItemIcon>
                      <ListItemText primary="Prepare more specific examples that highlight your relevant experience" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <ArrowRight />
                      </ListItemIcon>
                      <ListItemText primary="Work on eliminating filler words and phrases to sound more confident" />
                    </ListItem>
                  </>
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
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
    <ErrorBoundary navigate={navigate}>
      <Box sx={{ py: 3 }}>
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
        {activeTab === 0 && renderSummary()}
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
                  Question: {selectedAnswer.text || "Interview Question"}
                </Typography>
                
                <Box sx={{ my: 3 }}>
                  {/* Emotion Panel */}
                  {selectedAnswer.emotionAnalysis.emotions ? (
                    <EmotionScorePanel 
                      emotionScores={{ 
                        neutral: selectedAnswer.emotionAnalysis.emotions.neutral,
                        uncertainty: selectedAnswer.emotionAnalysis.emotions.uncertainty,
                        confidence: selectedAnswer.emotionAnalysis.emotions.confidence,
                        enthusiasm: selectedAnswer.emotionAnalysis.emotions.enthusiasm
                      }}
                    />
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography color="text.secondary">
                        No emotion analysis data available
                      </Typography>
                    </Box>
                  )}
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
    </ErrorBoundary>
  );
};

export default InterviewResults;
