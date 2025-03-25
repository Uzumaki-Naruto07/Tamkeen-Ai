import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Tooltip,
  Slider,
  LinearProgress
} from '@mui/material';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import InfoIcon from '@mui/icons-material/Info';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

const EmotionScorePanel = ({
  emotionData,
  onCapture,
  onUpload,
  onDelete,
  loading = false
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
        <CircularProgress size={50} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Analyzing facial expressions...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Please wait while we process your image
        </Typography>
      </Box>
    );
  }

  // If no data is available, show capture interface
  if (!emotionData) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" gutterBottom>
            Facial Expression Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Capture a photo or upload an image to analyze your facial expressions
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<CameraAltIcon />}
              onClick={onCapture}
            >
              Take Photo
            </Button>
            <Button
              variant="outlined"
              startIcon={<PhotoLibraryIcon />}
              onClick={onUpload}
            >
              Upload Image
            </Button>
          </Box>
        </Box>
      </Paper>
    );
  }

  const {
    dominantEmotion,
    emotionScores,
    facialFeatures = [],
    suggestions = [],
    imageUrl
  } = emotionData;

  // Get emoji and color for dominant emotion
  const getEmotionEmoji = (emotion) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return { icon: <SentimentVerySatisfiedIcon fontSize="large" />, color: 'success.main' };
      case 'neutral':
        return { icon: <SentimentSatisfiedAltIcon fontSize="large" />, color: 'info.main' };
      case 'surprise':
        return { icon: <SentimentSatisfiedIcon fontSize="large" />, color: 'warning.main' };
      case 'sad':
        return { icon: <SentimentDissatisfiedIcon fontSize="large" />, color: 'text.secondary' };
      case 'angry':
        return { icon: <SentimentVeryDissatisfiedIcon fontSize="large" />, color: 'error.main' };
      case 'fear':
        return { icon: <SentimentDissatisfiedIcon fontSize="large" />, color: 'error.light' };
      case 'disgust':
        return { icon: <SentimentVeryDissatisfiedIcon fontSize="large" />, color: 'error.dark' };
      default:
        return { icon: <SentimentSatisfiedAltIcon fontSize="large" />, color: 'text.primary' };
    }
  };

  const emotionDisplay = getEmotionEmoji(dominantEmotion);

  return (
    <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Grid container>
        {imageUrl && (
          <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Box
              sx={{
                height: '100%',
                position: 'relative',
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  display: 'flex',
                  gap: 1
                }}
              >
                <IconButton
                  size="small"
                  onClick={onCapture}
                  sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
                >
                  <CameraAltIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={onDelete}
                  sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        )}

        <Grid item xs={12} md={imageUrl ? 8 : 12}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Facial Expression Analysis
              </Typography>
              {!imageUrl && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<CameraAltIcon />}
                    onClick={onCapture}
                  >
                    Retake
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={onDelete}
                  >
                    Clear
                  </Button>
                </Box>
              )}
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              p: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', color: emotionDisplay.color }}>
                {emotionDisplay.icon}
              </Box>
              <Box sx={{ ml: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  Dominant Expression: {dominantEmotion}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This is the primary emotion detected in your facial expression
                </Typography>
              </Box>
            </Box>

            <Typography variant="subtitle2" gutterBottom>
              Emotion Breakdown
            </Typography>

            {emotionScores && Object.entries(emotionScores).map(([emotion, score]) => (
              <Box key={emotion} sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {emotion}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(score * 100)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={score * 100}
                  sx={{
                    height: 6,
                    borderRadius: 1,
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 1,
                      backgroundColor: emotion === dominantEmotion.toLowerCase() ? emotionDisplay.color : 'primary.main'
                    }
                  }}
                />
              </Box>
            ))}

            <Button
              size="small"
              sx={{ mt: 1 }}
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Analysis Details'}
            </Button>

            {showDetails && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ my: 2 }} />

                {facialFeatures.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Facial Features Detected
                    </Typography>
                    <Grid container spacing={1}>
                      {facialFeatures.map((feature, index) => (
                        <Grid item key={index}>
                          <Chip
                            label={feature}
                            size="small"
                            variant="outlined"
                            icon={<CheckCircleIcon />}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {suggestions.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Suggestions for Improvement
                    </Typography>
                    <List dense disablePadding>
                      {suggestions.map((suggestion, index) => (
                        <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <TipsAndUpdatesIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={suggestion}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EmotionScorePanel;
