import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  Link,
  IconButton,
  Tooltip,
  CircularProgress,
  Collapse,
  Alert,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import YouTubeIcon from '@mui/icons-material/YouTube';
import ArticleIcon from '@mui/icons-material/Article';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LaunchIcon from '@mui/icons-material/Launch';
import StarsIcon from '@mui/icons-material/Stars';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DashboardAPI from '../../api/DashboardAPI';
import { styled } from '@mui/material/styles';

// Custom styled expand button
const ExpandButton = styled(IconButton)(({ theme }) => ({
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const ResourceLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  textDecoration: 'none',
  transition: theme.transitions.create(['background-color']),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    textDecoration: 'none',
  },
}));

// Get icon based on resource type
const getResourceIcon = (type) => {
  switch (type.toLowerCase()) {
    case 'youtube':
      return <YouTubeIcon sx={{ color: '#FF0000' }} />;
    case 'course':
      return <SchoolIcon color="primary" />;
    case 'article':
      return <ArticleIcon color="secondary" />;
    case 'assignment':
      return <AssignmentIcon color="warning" />;
    default:
      return <ArticleIcon />;
  }
};

// Get icon based on recommendation type
const getRecommendationIcon = (type) => {
  switch (type.toLowerCase()) {
    case 'job':
      return <WorkIcon />;
    case 'course':
      return <SchoolIcon />;
    case 'skill':
      return <StarsIcon />;
    default:
      return <AssignmentIcon />;
  }
};

const AIRecommendationCard = ({ recommendation, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(recommendation.aiExplanation || '');
  
  const {
    id,
    title,
    type,
    description,
    match_percentage,
    relevance_factors = [],
    resources = [],
    time_commitment,
    provider
  } = recommendation;
  
  // Toggle explanation expansion
  const handleExpandClick = () => {
    setExpanded(!expanded);
    
    // If no AI explanation exists yet and expanding, fetch one
    if (!aiExplanation && !expanded) {
      fetchAIExplanation();
    }
  };
  
  // Fetch AI-generated explanation from backend
  const fetchAIExplanation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would call your API here
      // const response = await DashboardAPI.getRecommendationExplanation(id);
      // setAiExplanation(response.explanation);
      
      // Simulated API response
      setTimeout(() => {
        const explanations = {
          job: "Based on your profile, this job aligns perfectly with your backend development experience. Your recent projects demonstrating Node.js and database skills are exactly what this position requires. Additionally, the company culture emphasizes work-life balance which matches your stated preferences.",
          course: "This course is recommended because it addresses the skill gaps in your profile, particularly in cloud architecture. As you're aiming for a Senior Developer position, strengthening your knowledge in this area will significantly increase your marketability. The course format also suits your preference for hands-on learning.",
          skill: "Data visualization is becoming increasingly important in your field. Based on your career goals and the job market trends in your region, developing this skill would complement your existing technical abilities and open up new opportunities. Companies in your target industry frequently mention this skill in job postings."
        };
        
        setAiExplanation(explanations[type.toLowerCase()] || 
          "This recommendation is based on your profile data, career goals, and current market trends. Our AI analysis suggests this would be a valuable addition to your career development path.");
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error('Error fetching AI explanation:', err);
      setError('Failed to load AI explanation. Please try again later.');
      setLoading(false);
    }
  };
  
  // Refresh recommendation
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await onRefresh(id);
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing recommendation:', err);
      setError('Failed to refresh recommendation. Please try again later.');
      setLoading(false);
    }
  };
  
  return (
    <Card variant="outlined" sx={{ mb: 2, position: 'relative' }}>
      {/* Recommendation Header */}
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {getRecommendationIcon(type)}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {type} • {provider}
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={`${match_percentage}% Match`} 
            color={match_percentage > 80 ? "success" : match_percentage > 60 ? "primary" : "default"} 
          />
        </Box>
        
        <Typography variant="body2" sx={{ mt: 2 }}>
          {description}
        </Typography>
        
        {time_commitment && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.secondary' }}>
            <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              Time Commitment: {time_commitment}
            </Typography>
          </Box>
        )}
        
        {/* Relevance Factors */}
        {relevance_factors.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Relevant to your:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {relevance_factors.map((factor, index) => (
                <Chip 
                  key={index} 
                  label={factor} 
                  size="small" 
                  variant="outlined"
                  sx={{ m: 0.5 }}
                />
              ))}
            </Stack>
          </Box>
        )}
        
        {/* Resource Links */}
        {resources.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Related Resources:
            </Typography>
            <List dense disablePadding>
              {resources.map((resource, index) => (
                <ListItem 
                  key={index} 
                  disablePadding 
                  component={ResourceLink}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getResourceIcon(resource.type)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={resource.title} 
                    secondary={resource.provider}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <OpenInNewIcon fontSize="small" color="action" />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
      
      <Divider />
      
      {/* AI Explanation Section */}
      <CardActions disableSpacing>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PsychologyIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="body2" color="primary">
            AI Explanation
          </Typography>
        </Box>
        <ExpandButton
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show explanation"
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ExpandButton>
      </CardActions>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <Box sx={{ p: 1, bgcolor: 'rgba(25, 118, 210, 0.08)', borderRadius: 1 }}>
              <Typography variant="body2">
                {aiExplanation}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Collapse>
      
      <Divider />
      
      {/* Action Buttons */}
      <CardActions>
        <Button
          size="small"
          component="a"
          href={recommendation.apply_url || recommendation.url || '#'}
          target="_blank"
          startIcon={<LaunchIcon />}
        >
          {type === 'job' ? 'Apply Now' : type === 'course' ? 'Enroll' : 'View Details'}
        </Button>
        
        <Box sx={{ ml: 'auto' }}>
          <Tooltip title="Get updated recommendations based on your latest profile data">
            <Button
              size="small"
              startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
              color="secondary"
            >
              Refresh
            </Button>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
};

export default AIRecommendationCard;