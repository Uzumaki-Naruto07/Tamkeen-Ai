import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Divider,
  Chip,
  Tooltip,
  Paper,
  Grid,
  Tabs,
  Tab,
  Collapse,
  Slider,
  LinearProgress,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Zoom,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
  alpha,
  Alert
} from '@mui/material';
import {
  Sentiment,
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
  Psychology,
  Lightbulb,
  ExpandMore,
  ExpandLess,
  InfoOutlined,
  BarChart,
  PieChart,
  BubbleChart,
  TrendingUp,
  TrendingDown,
  Compare,
  ThumbUp,
  ThumbDown,
  CheckCircle,
  Warning,
  AutoAwesome,
  TouchApp,
  Analytics,
  Language,
  LocalOffer,
  FilterCenterFocus,
  Edit,
  Share,
  Download,
  Bookmark,
  BookmarkBorder
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale } from 'chart.js';
import { Radar, Doughnut, Bar, PolarArea, Bubble } from 'react-chartjs-2';
import ReactWordcloud from 'react-wordcloud';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import Lottie from 'react-lottie';
import * as animationData from '../assets/animations/sentiment-analysis.json';
import apiEndpoints from '../utils/api';
import { useDoc } from '../context/AppContext';
import LoadingSpinner from './LoadingSpinner';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale
);

// Emotion color mapping
const emotionColors = {
  joy: '#FFD166',
  confidence: '#06D6A0',
  analytical: '#118AB2',
  tentative: '#073B4C',
  fear: '#9381FF',
  sadness: '#7A7A7A',
  anger: '#EF476F',
  neutral: '#61A4BC'
};

// Industry benchmark data
const industryBenchmarks = {
  technology: {
    positivity: 75,
    confidence: 82,
    analytical: 78,
    passion: 70
  },
  finance: {
    positivity: 68,
    confidence: 85,
    analytical: 90,
    passion: 62
  },
  healthcare: {
    positivity: 82,
    confidence: 75,
    analytical: 72,
    passion: 85
  },
  education: {
    positivity: 88,
    confidence: 72,
    analytical: 68,
    passion: 90
  },
  marketing: {
    positivity: 85,
    confidence: 78,
    analytical: 65,
    passion: 88
  }
};

const SentimentResultCard = ({
  documentId,
  documentType = 'cover_letter',
  onImprove = () => {},
  onSave = () => {},
  onShare = () => {},
  showWordCloud = true,
  showTextHighlighting = true,
  detailed = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const chartRef = useRef(null);
  const wordCloudRef = useRef(null);
  const textHighlightRef = useRef(null);
  
  const [tabValue, setTabValue] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState({ x: 0, y: 0, content: '' });
  const [showDetails, setShowDetails] = useState(detailed);
  const [insightsDialogOpen, setInsightsDialogOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [animationPlayed, setAnimationPlayed] = useState(false);
  const [savedToBookmarks, setSavedToBookmarks] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [hoverWordIndex, setHoverWordIndex] = useState(-1);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);
  const { currentCoverLetter } = useDoc();
  
  // Use documentId from props or context
  const effectiveDocId = documentId || (documentType === 'cover_letter' ? currentCoverLetter?.id : null);
  
  useEffect(() => {
    const fetchSentimentAnalysis = async () => {
      if (!effectiveDocId) {
        setAnalysisError(`No ${documentType} provided for analysis`);
        setAnalysisLoading(false);
        return;
      }
      
      setAnalysisLoading(true);
      setAnalysisError(null);
      
      try {
        // This connects to sentiment_analysis.py backend
        const response = await apiEndpoints.analytics.sentiment({
          documentId: effectiveDocId,
          documentType
        });
        
        // Also get emotional analysis
        const emotionsResponse = await apiEndpoints.analytics.emotions({
          documentId: effectiveDocId,
          documentType
        });
        
        // Combine both analyses
        setSentimentData({
          sentiment: response.data,
          emotions: emotionsResponse.data
        });
      } catch (err) {
        setAnalysisError(err.response?.data?.message || 'Failed to analyze sentiment');
        console.error('Sentiment analysis error:', err);
      } finally {
        setAnalysisLoading(false);
      }
    };
    
    fetchSentimentAnalysis();
  }, [effectiveDocId, documentType]);
  
  // Use loading prop or local loading state
  const isLoading = analysisLoading;
  
  // Use provided data or fetched data
  const data = sentimentData || {
    overallSentiment: 78,
    documentTone: 'Confident & Professional',
    emotionScores: {
      confidence: 82,
      analytical: 75,
      joy: 65,
      tentative: 22,
      fear: 12,
      sadness: 8,
      anger: 5
    },
    keyPhrases: [
      { text: "passionate about technology", sentiment: 0.85 },
      { text: "driven to succeed", sentiment: 0.92 },
      { text: "collaborative team player", sentiment: 0.88 },
      { text: "innovative solutions", sentiment: 0.78 },
      { text: "extensive experience", sentiment: 0.72 }
    ],
    sentimentBySection: {
      introduction: 82,
      qualifications: 75,
      experience: 80,
      conclusion: 85
    },
    wordSentiment: {
      positive: ["passionate", "successful", "innovative", "excellence", "collaborative", "dedicated"],
      negative: ["challenging", "difficult", "problem"],
      neutral: ["worked", "developed", "managed", "created"]
    },
    improvementSuggestions: [
      "Add more specific achievements with measurable results",
      "Reduce passive voice for stronger impact",
      "Include more industry-specific terminology",
      "Balance confidence with humility to avoid overconfidence"
    ],
    wordFrequency: [
      { text: "experience", value: 12, sentiment: 0.6 },
      { text: "skills", value: 10, sentiment: 0.7 },
      { text: "team", value: 8, sentiment: 0.9 },
      { text: "development", value: 7, sentiment: 0.65 },
      { text: "project", value: 7, sentiment: 0.5 },
      { text: "technology", value: 6, sentiment: 0.8 },
      { text: "innovative", value: 5, sentiment: 0.85 },
      { text: "passionate", value: 5, sentiment: 0.95 },
      { text: "solution", value: 4, sentiment: 0.75 },
      { text: "challenge", value: 4, sentiment: -0.2 },
      { text: "success", value: 4, sentiment: 0.9 },
      { text: "collaborate", value: 3, sentiment: 0.85 },
      { text: "leadership", value: 3, sentiment: 0.8 },
      { text: "problem", value: 3, sentiment: -0.3 },
      { text: "achieve", value: 3, sentiment: 0.8 },
      { text: "expertise", value: 2, sentiment: 0.7 },
      { text: "difficult", value: 2, sentiment: -0.4 },
      { text: "opportunity", value: 2, sentiment: 0.75 },
      { text: "dedication", value: 2, sentiment: 0.85 },
      { text: "professional", value: 2, sentiment: 0.6 }
    ],
    highlightedText: null
  };
  
  // If no highlighted text is provided, create it from the text content
  useEffect(() => {
    if (!data.highlightedText && data.sentiment && showTextHighlighting) {
      const words = data.sentiment.split(/\s+/);
      const highlightedWords = words.map(word => {
        const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
        if (data.wordSentiment.positive.includes(cleanWord)) {
          return { word, sentiment: 'positive' };
        } else if (data.wordSentiment.negative.includes(cleanWord)) {
          return { word, sentiment: 'negative' };
        } else {
          return { word, sentiment: 'neutral' };
        }
      });
      data.highlightedText = highlightedWords;
    }
  }, [data.sentiment, data.wordSentiment, showTextHighlighting]);
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimationPlayed(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get emotion icon based on score
  const getEmotionIcon = (score) => {
    if (score >= 90) return <SentimentVerySatisfied fontSize="large" />;
    if (score >= 70) return <SentimentSatisfied fontSize="large" />;
    if (score >= 50) return <SentimentNeutral fontSize="large" />;
    if (score >= 30) return <SentimentDissatisfied fontSize="large" />;
    return <SentimentVeryDissatisfied fontSize="large" />;
  };
  
  // Get color for sentiment score
  const getSentimentColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.success.light;
    if (score >= 40) return theme.palette.warning.main;
    if (score >= 20) return theme.palette.warning.dark;
    return theme.palette.error.main;
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setInteractionCount(prev => prev + 1);
  };
  
  // Toggle expand/collapse
  const handleExpandToggle = () => {
    setExpanded(!expanded);
    setInteractionCount(prev => prev + 1);
  };
  
  // Show tooltip
  const handleShowTooltip = (content, event) => {
    setTooltipData({
      x: event.clientX,
      y: event.clientY,
      content
    });
    setTooltipVisible(true);
  };
  
  // Hide tooltip
  const handleHideTooltip = () => {
    setTooltipVisible(false);
  };
  
  // Toggle details view
  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
    setInteractionCount(prev => prev + 1);
  };
  
  // Open insights dialog
  const handleOpenInsightsDialog = () => {
    setInsightsDialogOpen(true);
    setInteractionCount(prev => prev + 1);
  };
  
  // Close insights dialog
  const handleCloseInsightsDialog = () => {
    setInsightsDialogOpen(false);
  };
  
  // Open compare dialog
  const handleOpenCompareDialog = () => {
    setCompareDialogOpen(true);
    setInteractionCount(prev => prev + 1);
  };
  
  // Close compare dialog
  const handleCloseCompareDialog = () => {
    setCompareDialogOpen(false);
  };
  
  // Toggle bookmark
  const handleToggleBookmark = () => {
    setSavedToBookmarks(!savedToBookmarks);
    onSave();
    setInteractionCount(prev => prev + 1);
  };
  
  // Handle word hover in text highlighting
  const handleWordHover = (index) => {
    setHoverWordIndex(index);
  };
  
  // Word cloud options
  const wordCloudOptions = {
    colors: scaleOrdinal().range(schemeCategory10),
    enableTooltip: true,
    deterministic: false,
    fontSizes: [15, 60],
    fontStyle: 'normal',
    fontWeight: 'normal',
    padding: 1,
    rotations: 3,
    rotationAngles: [0, 90],
    scale: 'sqrt',
    spiral: 'archimedean',
    transitionDuration: 1000,
  };
  
  // Prepare word cloud data
  const wordCloudData = data.wordFrequency.map(item => ({
    text: item.text,
    value: item.value,
    color: item.sentiment > 0.5 ? theme.palette.success.main : 
           item.sentiment < 0 ? theme.palette.error.main : 
           theme.palette.info.main
  }));
  
  // Prepare emotion radar chart data
  const emotionRadarData = {
    labels: Object.keys(data.emotionScores),
    datasets: [
      {
        label: 'Your Document',
        data: Object.values(data.emotionScores),
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        pointBackgroundColor: theme.palette.primary.main,
        pointRadius: 4
      },
      {
        label: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Benchmark`,
        data: Object.keys(data.emotionScores).map(emotion => {
          // Map emotion to benchmark category if exists, otherwise use random value
          if (emotion === 'confidence') return industryBenchmarks[documentType].confidence;
          if (emotion === 'analytical') return industryBenchmarks[documentType].analytical;
          if (emotion === 'joy') return industryBenchmarks[documentType].passion;
          return Math.floor(Math.random() * 30) + 50; // Random benchmark between 50-80
        }),
        backgroundColor: alpha(theme.palette.secondary.main, 0.2),
        borderColor: theme.palette.secondary.main,
        borderWidth: 2,
        pointBackgroundColor: theme.palette.secondary.main,
        pointRadius: 4
      }
    ]
  };
  
  // Prepare section sentiment chart data
  const sectionChartData = {
    labels: Object.keys(data.sentimentBySection).map(
      section => section.charAt(0).toUpperCase() + section.slice(1)
    ),
    datasets: [
      {
        label: 'Sentiment Score',
        data: Object.values(data.sentimentBySection),
        backgroundColor: Object.values(data.sentimentBySection).map(
          value => alpha(getSentimentColor(value), 0.7)
        ),
        borderColor: Object.values(data.sentimentBySection).map(
          value => getSentimentColor(value)
        ),
        borderWidth: 1
      }
    ]
  };
  // Prepare industry comparison data
  const industryComparisonData = {
    labels: ['Sentiment Score'],
    datasets: [
      {
        label: 'Your Document',
        data: [data.overallSentiment],
        backgroundColor: getSentimentColor(data.overallSentiment),
        borderColor: getSentimentColor(data.overallSentiment),
        borderWidth: 1
      },
      {
        label: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} Benchmark`,
        data: [industryBenchmarks[documentType].positivity],
        backgroundColor: getSentimentColor(industryBenchmarks[documentType].positivity),
        borderColor: getSentimentColor(industryBenchmarks[documentType].positivity),
        borderWidth: 1
      }
    ]
  };
  
  // Prepare emotion doughnut data
  const emotionDoughnutData = {
    labels: ['Joy', 'Confidence', 'Analytical', 'Tentative', 'Fear', 'Sadness', 'Anger'],
    datasets: [
      {
        data: [
          data.emotionScores.joy,
          data.emotionScores.confidence,
          data.emotionScores.analytical,
          data.emotionScores.tentative,
          data.emotionScores.fear,
          data.emotionScores.sadness,
          data.emotionScores.anger
        ],
        backgroundColor: [
          emotionColors.joy,
          emotionColors.confidence,
          emotionColors.analytical,
          emotionColors.tentative,
          emotionColors.fear,
          emotionColors.sadness,
          emotionColors.anger
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Prepare radar options
  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100
      }
    }
  };
  
  // Prepare doughnut options
  const doughnutOptions = {
    cutout: 70,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };
  
  // Prepare bar options
  const barOptions = {
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true
      }
    }
  };
  
  // Prepare industry insights
  const industryInsights = {
    technology: "Your technology-focused document shows strong confidence and analytical tone. To further enhance your document, consider adding more specific achievements and industry-specific terminology. This will not only strengthen your confidence markers but also demonstrate your deep understanding of the technology field.",
    finance: "Your finance-focused document shows strong confidence and analytical tone. To further enhance your document, consider adding more specific achievements and industry-specific terminology. This will not only strengthen your confidence markers but also demonstrate your deep understanding of the finance field.",
    healthcare: "Your healthcare-focused document shows strong confidence and analytical tone. To further enhance your document, consider adding more specific achievements and industry-specific terminology. This will not only strengthen your confidence markers but also demonstrate your deep understanding of the healthcare field.",
    education: "Your education-focused document shows strong confidence and analytical tone. To further enhance your document, consider adding more specific achievements and industry-specific terminology. This will not only strengthen your confidence markers but also demonstrate your deep understanding of the education field.",
    marketing: "Your marketing-focused document shows strong confidence and analytical tone. To further enhance your document, consider adding more specific achievements and industry-specific terminology. This will not only strengthen your confidence markers but also demonstrate your deep understanding of the marketing field."
  };
  
  // Prepare emotion interpretation
  const emotionInterpretation = {
    technology: "Your document is well-suited for most professional contexts. The high confidence signals authority, while maintaining analytical tone demonstrates critical thinking abilities.",
    finance: "Your document is well-suited for most professional contexts. The high confidence signals authority, while maintaining analytical tone demonstrates critical thinking abilities.",
    healthcare: "Your document is well-suited for most professional contexts. The high confidence signals authority, while maintaining analytical tone demonstrates critical thinking abilities.",
    education: "Your document is well-suited for most professional contexts. The high confidence signals authority, while maintaining analytical tone demonstrates critical thinking abilities.",
    marketing: "Your document is well-suited for most professional contexts. The high confidence signals authority, while maintaining analytical tone demonstrates critical thinking abilities."
  };
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="medium">
            Sentiment Analysis
          </Typography>
          <Tooltip title="Expand/Collapse">
            <IconButton onClick={handleExpandToggle}>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Sentiment score section */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            {getEmotionIcon(data.overallSentiment)}
            <Typography variant="h4" fontWeight="medium" sx={{ ml: 1 }}>
              {data.overallSentiment}%
            </Typography>
          </Box>
          <Tooltip title="Sentiment Score">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LinearProgress
                variant="determinate"
                value={data.overallSentiment}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: alpha(theme.palette.grey[200], 0.5),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    backgroundColor: getSentimentColor(data.overallSentiment)
                  }
                }}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {data.overallSentiment}%
              </Typography>
            </Box>
          </Tooltip>
        </Box>
        
        {/* Document tone section */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Document Tone
          </Typography>
          <Typography variant="body2">
            {data.documentTone}
          </Typography>
        </Box>
        
        {/* Emotion analysis section */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Emotion Analysis
          </Typography>
          <Tooltip title="Emotion Analysis">
            <IconButton onClick={handleOpenInsightsDialog}>
              <Psychology />
            </IconButton>
          </Tooltip>
        </Box>
        
        {/* Key phrases section */}
        {showDetails && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Key Phrases
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {data.keyPhrases.map((phrase, index) => (
                <Chip
                  key={index}
                  label={phrase.text}
                  variant="outlined"
                  color={phrase.sentiment > 0.7 ? "success" : phrase.sentiment > 0.4 ? "primary" : "default"}
                  sx={{ 
                    borderWidth: 2,
                    borderColor: alpha(getSentimentColor(phrase.sentiment * 100), 0.7),
                    '&:hover': {
                      backgroundColor: alpha(getSentimentColor(phrase.sentiment * 100), 0.1),
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        
        {/* Improvement suggestions */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Improvement Suggestions
          </Typography>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Paper 
              variant="outlined" 
              sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}
            >
              {data.improvementSuggestions.map((suggestion, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    mb: index < data.improvementSuggestions.length - 1 ? 1.5 : 0 
                  }}
                >
                  <Lightbulb 
                    sx={{ 
                      color: theme.palette.warning.main, 
                      mr: 1, 
                      mt: 0.3,
                      fontSize: 20
                    }} 
                  />
                  <Typography variant="body2">
                    {suggestion}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </motion.div>
        </Box>
        
        {/* Action buttons */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<Analytics />}
            onClick={handleOpenInsightsDialog}
            size={isMobile ? "small" : "medium"}
          >
            Detailed Insights
          </Button>
          
          <Box>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => onImprove()}
              sx={{ mr: 1 }}
              size={isMobile ? "small" : "medium"}
            >
              Improve {documentType}
            </Button>
            
            <IconButton 
              color={savedToBookmarks ? "primary" : "default"} 
              onClick={handleToggleBookmark}
              size={isMobile ? "small" : "medium"}
            >
              {savedToBookmarks ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>
          </Box>
        </Box>
      </CardContent>
      
      {/* Detailed insights dialog */}
      <Dialog
        open={insightsDialogOpen}
        onClose={handleCloseInsightsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Detailed Sentiment Analysis
          <IconButton
            onClick={handleCloseInsightsDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <ExpandLess />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            <Tab label="Emotion Analysis" icon={<Psychology />} />
            <Tab label="Text Highlighting" icon={<FilterCenterFocus />} />
            <Tab label="Word Cloud" icon={<BubbleChart />} />
            <Tab label="Industry Comparison" icon={<Compare />} />
          </Tabs>
          
          {/* Emotion Analysis Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Emotion Radar Chart
                </Typography>
                <Box height={300} sx={{ mb: 3 }}>
                  <Radar
                    data={emotionRadarData}
                    options={radarOptions}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Emotion Distribution
                </Typography>
                <Box height={300} sx={{ mb: 3 }}>
                  <Doughnut 
                    data={emotionDoughnutData}
                    options={doughnutOptions}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Document Tone Analysis
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography>
                    Your {documentType} has a predominantly <strong>{data.documentTone}</strong> tone, 
                    which is {emotionInterpretation[documentType] || 'well-suited for most professional contexts'}. 
                    The high confidence signals authority, while maintaining analytical tone demonstrates 
                    critical thinking abilities.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
          
          {/* Text Highlighting Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="subtitle1" gutterBottom>
              Sentiment Highlighted Text
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}
              ref={textHighlightRef}
            >
              <Box sx={{ lineHeight: 1.7 }}>
                {data.highlightedText ? (
                  data.highlightedText.map((item, index) => (
                    <Tooltip
                      key={index}
                      title={`${item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)} sentiment`}
                      arrow
                    >
                      <Box
                        component="span"
                        onMouseEnter={() => handleWordHover(index)}
                        onMouseLeave={() => handleWordHover(-1)}
                        sx={{
                          display: 'inline',
                          mx: 0.2,
                          p: 0.3,
                          borderRadius: 0.5,
                          backgroundColor: item.sentiment === 'positive' 
                            ? alpha(theme.palette.success.main, hoverWordIndex === index ? 0.3 : 0.1)
                            : item.sentiment === 'negative'
                              ? alpha(theme.palette.error.main, hoverWordIndex === index ? 0.3 : 0.1)
                              : 'transparent',
                          color: item.sentiment === 'positive' 
                            ? theme.palette.success.dark
                            : item.sentiment === 'negative'
                              ? theme.palette.error.dark
                              : theme.palette.text.primary,
                          fontWeight: hoverWordIndex === index ? 'bold' : 'normal',
                          transition: 'all 0.2s ease',
                          cursor: 'default'
                        }}
                      >
                        {item.word}
                      </Box>
                    </Tooltip>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No text content available for sentiment highlighting.
                  </Typography>
                )}
              </Box>
            </Paper>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Sentiment Legend
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip 
                  label="Positive"
                  size="small"
                  sx={{ backgroundColor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.dark }}
                />
                <Chip 
                  label="Negative"
                  size="small"
                  sx={{ backgroundColor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.dark }}
                />
                <Chip 
                  label="Neutral"
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Box>
          </TabPanel>
          
          {/* Word Cloud Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="subtitle1" gutterBottom>
              Word Frequency & Sentiment Cloud
            </Typography>
            <Box 
              ref={wordCloudRef}
              sx={{ 
                height: 400, 
                width: '100%',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 2
              }}
            >
              {showWordCloud ? (
                <ReactWordcloud 
                  words={wordCloudData} 
                  options={wordCloudOptions}
                />
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Word cloud visualization not available.
                  </Typography>
                </Box>
              )}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Word size indicates frequency, while color represents sentiment (green for positive, red for negative, blue for neutral).
              </Typography>
            </Box>
          </TabPanel>
          
          {/* Industry Comparison Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="subtitle1" gutterBottom>
              Industry Benchmarks: {documentType.charAt(0).toUpperCase() + documentType.slice(1)} Sector
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Bar
                    data={industryComparisonData}
                    options={barOptions}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Industry Insights
                  </Typography>
                  <Typography variant="body2">
                    {industryInsights[documentType] || 
                      `Your ${documentType} sentiment analysis shows that you're generally aligned with the ${documentType} industry expectations. To stand out further, focus on enhancing your confidence markers and analytical tone while maintaining authenticity.`
                    }
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInsightsDialog}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              onImprove();
              handleCloseInsightsDialog();
            }}
          >
            Improve {documentType}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

// Tab Panel component
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`sentiment-tabpanel-${index}`}
      aria-labelledby={`sentiment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export default SentimentResultCard; 