import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Alert,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Switch
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { useDoc, useJob } from './AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const CoverLetterAnalyzer = ({ documentId, jobId }) => {
  const [coverLetterText, setCoverLetterText] = useState('');
  const [keywordResults, setKeywordResults] = useState(null);
  const [sentimentResults, setSentimentResults] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState({ keywords: false, sentiment: false });
  const [error, setError] = useState({ keywords: null, sentiment: null });
  const { currentCoverLetter } = useDoc();
  const { currentJobDescription } = useJob();
  
  // Use provided IDs or get from context
  const effectiveDocId = documentId || currentCoverLetter?.id;
  const effectiveJobId = jobId || currentJobDescription?.id;
  
  // Fetch cover letter text
  useEffect(() => {
    const fetchCoverLetterText = async () => {
      if (!effectiveDocId) return;
      
      try {
        const response = await apiEndpoints.documents.getCoverLetter(effectiveDocId);
        setCoverLetterText(response.data.text);
      } catch (err) {
        console.error('Error fetching cover letter:', err);
      }
    };
    
    fetchCoverLetterText();
  }, [effectiveDocId]);
  
  // Fetch keyword analysis
  const fetchKeywordAnalysis = async () => {
    if (!effectiveDocId || !effectiveJobId) {
      setError({ ...error, keywords: 'Both cover letter and job are required' });
      return;
    }
    
    setLoading({ ...loading, keywords: true });
    setError({ ...error, keywords: null });
    
    try {
      // This connects to keyword_extraction.py backend
      const response = await apiEndpoints.analytics.extractKeywords({
        documentId: effectiveDocId,
        documentType: 'cover_letter',
        jobId: effectiveJobId
      });
      
      setKeywordResults(response.data);
    } catch (err) {
      setError({ ...error, keywords: err.response?.data?.message || 'Failed to analyze keywords' });
      console.error('Keyword analysis error:', err);
    } finally {
      setLoading({ ...loading, keywords: false });
    }
  };
  
  // Fetch sentiment analysis
  const fetchSentimentAnalysis = async () => {
    if (!effectiveDocId) {
      setError({ ...error, sentiment: 'Cover letter is required' });
      return;
    }
    
    setLoading({ ...loading, sentiment: true });
    setError({ ...error, sentiment: null });
    
    try {
      // This connects to sentiment_analysis.py backend
      const response = await apiEndpoints.analytics.sentiment({
        documentId: effectiveDocId,
        documentType: 'cover_letter'
      });
      
      // Also get emotional analysis
      const emotionsResponse = await apiEndpoints.analytics.emotions({
        documentId: effectiveDocId,
        documentType: 'cover_letter'
      });
      
      // Combine both analyses
      setSentimentResults({
        sentiment: response.data,
        emotions: emotionsResponse.data
      });
    } catch (err) {
      setError({ ...error, sentiment: err.response?.data?.message || 'Failed to analyze sentiment' });
      console.error('Sentiment analysis error:', err);
    } finally {
      setLoading({ ...loading, sentiment: false });
    }
  };
  
  // Run both analyses when component mounts
  useEffect(() => {
    if (effectiveDocId && effectiveJobId) {
      fetchKeywordAnalysis();
      fetchSentimentAnalysis();
    }
  }, [effectiveDocId, effectiveJobId]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Render keyword analysis tab
  const renderKeywordAnalysis = () => {
    if (loading.keywords) {
      return <LoadingSpinner message="Analyzing keywords..." />;
    }
    
    if (error.keywords) {
      return (
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchKeywordAnalysis}>
              Retry
            </Button>
          }
        >
          {error.keywords}
        </Alert>
      );
    }
    
    if (!keywordResults) {
      return (
        <Alert severity="info">
          No keyword analysis available. Click analyze to proceed.
        </Alert>
      );
    }
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            <FindInPage sx={{ mr: 1, verticalAlign: 'middle' }} />
            Keyword Match Analysis
          </Typography>
          
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ mr: 2 }}>
                  Match Score: 
                </Typography>
                <Chip 
                  label={`${keywordResults.matchScore}%`}
                  color={
                    keywordResults.matchScore >= 70 ? 'success' :
                    keywordResults.matchScore >= 50 ? 'warning' : 'error'
                  }
                  size="large"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {keywordResults.summary}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Matched Keywords
          </Typography>
          
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            {keywordResults.matched.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {keywordResults.matched.map((keyword, index) => (
                  <Chip 
                    key={index}
                    label={keyword.text}
                    color="success"
                    size="small"
                    icon={<Check />}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No keywords matched.
              </Typography>
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" gutterBottom>
            Missing Keywords
          </Typography>
          
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            {keywordResults.missing.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {keywordResults.missing.map((keyword, index) => (
                  <Chip 
                    key={index}
                    label={keyword.text}
                    color="error"
                    size="small"
                    icon={<Warning />}
                  />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No important keywords missing.
              </Typography>
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            <MenuBook sx={{ mr: 1, verticalAlign: 'middle' }} />
            Recommendations
          </Typography>
          
          <List>
            {keywordResults.recommendations.map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Check color="primary" />
                </ListItemIcon>
                <ListItemText primary={recommendation} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    );
  };
  
  // Render sentiment analysis tab
  const renderSentimentAnalysis = () => {
    if (loading.sentiment) {
      return <LoadingSpinner message="Analyzing sentiment..." />;
    }
    
    if (error.sentiment) {
      return (
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchSentimentAnalysis}>
              Retry
            </Button>
          }
        >
          {error.sentiment}
        </Alert>
      );
    }
    
    if (!sentimentResults) {
      return (
        <Alert severity="info">
          No sentiment analysis available. Click analyze to proceed.
        </Alert>
      );
    }
    
    const { sentiment, emotions } = sentimentResults;
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            <SentimentSatisfied sx={{ mr: 1, verticalAlign: 'middle' }} />
            Overall Sentiment
          </Typography>
          
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ mr: 2 }}>
                  Tone: 
                </Typography>
                <Chip 
                  label={sentiment.overallSentiment.toUpperCase()}
                  color={
                    sentiment.overallSentiment === 'positive' ? 'success' :
                    sentiment.overallSentiment === 'neutral' ? 'primary' : 'error'
                  }
                  size="large"
                  icon={
                    sentiment.overallSentiment === 'positive' ? <SentimentSatisfied /> :
                    sentiment.overallSentiment === 'neutral' ? <SentimentNeutral /> : 
                    <SentimentVeryDissatisfied />
                  }
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                {sentiment.summary}
              </Typography>
            </CardContent>
          </Card>
          
          <Typography variant="subtitle2" gutterBottom>
            Sentiment Breakdown
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            {Object.entries(sentiment.scores).map(([key, value]) => (
              <Box key={key} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {key}
                  </Typography>
                  <Typography variant="body2">
                    {(value * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={value * 100} 
                  color={
                    key === 'positive' ? 'success' :
                    key === 'neutral' ? 'primary' : 'error'
                  }
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            ))}
          </Box>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            <Psychology sx={{ mr: 1, verticalAlign: 'middle' }} />
            Emotional Tone
          </Typography>
          
          <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
            {emotions.emotions && Object.keys(emotions.emotions).length > 0 && (
              <Doughnut
                data={{
                  labels: Object.keys(emotions.emotions),
                  datasets: [{
                    data: Object.values(emotions.emotions),
                    backgroundColor: [
                      '#4CAF50', '#2196F3', '#FFC107', '#F44336', 
                      '#9C27B0', '#00BCD4', '#795548', '#607D8B'
                    ]
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false
                }}
              />
            )}
          </Box>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Top Emotions Detected
          </Typography>
          
          <List dense>
            {emotions.emotionsSorted && emotions.emotionsSorted.map((emotion, index) => (
              <ListItem key={index}>
                <ListItemText 
                  primary={`${emotion.name} (${(emotion.score * 100).toFixed(1)}%)`}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            <MenuBook sx={{ mr: 1, verticalAlign: 'middle' }} />
            Tone Recommendations
          </Typography>
          
          <List>
            {sentiment.recommendations.map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Check color="primary" />
                </ListItemIcon>
                <ListItemText primary={recommendation} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    );
  };
  
  // Render cover letter preview tab
  const renderCoverLetterPreview = () => {
    return (
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
          Cover Letter Content
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={15}
          value={coverLetterText}
          onChange={(e) => setCoverLetterText(e.target.value)}
          placeholder="Cover letter content will appear here"
          InputProps={{ readOnly: true }}
          variant="outlined"
        />
      </Box>
    );
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Cover Letter Analysis
        </Typography>
        
        <Button
          startIcon={<Refresh />}
          variant="outlined"
          onClick={() => {
            fetchKeywordAnalysis();
            fetchSentimentAnalysis();
          }}
        >
          Refresh Analysis
        </Button>
      </Box>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab icon={<FindInPage />} label="Keywords" />
        <Tab icon={<SentimentSatisfied />} label="Sentiment" />
        <Tab icon={<Description />} label="Preview" />
      </Tabs>
      
      <Box sx={{ py: 2 }}>
        {tabValue === 0 && renderKeywordAnalysis()}
        {tabValue === 1 && renderSentimentAnalysis()}
        {tabValue === 2 && renderCoverLetterPreview()}
      </Box>
    </Paper>
  );
};

export default CoverLetterAnalyzer; 