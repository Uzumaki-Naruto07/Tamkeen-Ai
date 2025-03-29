import React, { useState, useEffect } from 'react';
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
  ListItemText,
  TextField,
  Paper
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
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import chatService from '../../api/chatgpt';
import { useUser } from '../../context/AppContext';

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

// Animation variants
const chatBubbleVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

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
  if (!type) return <AssignmentIcon />;
  
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

const AIRecommendationCard = ({ initialRecommendation, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(initialRecommendation?.aiExplanation || '');
  const [recommendation, setRecommendation] = useState(initialRecommendation || {});
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const { profile } = useUser();
  
  // Chat container ref for scrolling
  const chatContainerRef = React.useRef(null);
  
  useEffect(() => {
    // Scroll to bottom of chat when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
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
      // In a real app, this would be a call to the actual API
      // Here we're using the chat service
      const message = `Why is this ${recommendation.type} called "${recommendation.title}" a good match for me? Give a brief explanation.`;
      const response = await chatService.sendMessage(message, JSON.stringify(profile), 'recommendation');
      setAiExplanation(response.response);
    } catch (err) {
      console.error('Error fetching AI explanation:', err);
      setError('Failed to load AI explanation. Please try again later.');
      
      // Fallback explanation
      const fallbackExplanations = {
        job: "Based on your profile, this job aligns with your experience. Your projects demonstrate the skills required for this position. The company culture also seems to match your preferences.",
        course: "This course addresses skill gaps in your profile. As you're aiming for career advancement, strengthening your knowledge in this area will increase your marketability.",
        skill: "This skill is becoming increasingly important in your field. Based on your career goals and job market trends, developing this skill would complement your existing abilities and open up new opportunities."
      };
      
      setAiExplanation(fallbackExplanations[recommendation.type.toLowerCase()] || 
        "This recommendation is based on your profile data, career goals, and current market trends.");
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle chat visibility
  const handleToggleChat = () => {
    setChatVisible(!chatVisible);
    
    // If opening chat for the first time, add initial message
    if (!chatVisible && chatMessages.length === 0) {
      setChatMessages([{
        sender: 'ai',
        message: `Hi there! I can tell you more about this ${recommendation.type}: "${recommendation.title}". What would you like to know?`,
        timestamp: new Date()
      }]);
    }
  };
  
  // Send message to chat
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const userMessage = {
      sender: 'user',
      message: newMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setSendingMessage(true);
    
    try {
      // Send message to ChatGPT API
      const context = `The user is asking about the ${recommendation.type} called "${recommendation.title}". 
        Description: ${recommendation.description}
        Match percentage: ${recommendation.match_percentage}%
        ${recommendation.provider ? `Provider: ${recommendation.provider}` : ''}
        ${recommendation.relevance_factors ? `Relevant to user's: ${recommendation.relevance_factors.join(', ')}` : ''}`;
      
      const response = await chatService.sendMessage(userMessage.message, context, 'recommendation');
      
      const aiMessage = {
        sender: 'ai',
        message: response.response,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Add fallback response
      const aiMessage = {
        sender: 'ai',
        message: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } finally {
      setSendingMessage(false);
    }
  };
  
  // Refresh recommendation
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await onRefresh(recommendation.id);
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing recommendation:', err);
      setError('Failed to refresh recommendation. Please try again later.');
      setLoading(false);
    }
  };
  
  return (
    <Card 
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      variant="outlined" 
      sx={{ mb: 2, position: 'relative' }}
    >
      {/* Recommendation Header */}
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {getRecommendationIcon(recommendation.type)}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {recommendation.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {recommendation.type} • {recommendation.provider}
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={`${recommendation.match_percentage}% Match`} 
            color={recommendation.match_percentage > 80 ? "success" : recommendation.match_percentage > 60 ? "primary" : "default"} 
          />
        </Box>
        
        <Typography variant="body2" sx={{ mt: 2 }}>
          {recommendation.description}
        </Typography>
        
        {recommendation.time_commitment && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.secondary' }}>
            <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              Time Commitment: {recommendation.time_commitment}
            </Typography>
          </Box>
        )}
        
        {/* Relevance Factors */}
        {recommendation.relevance_factors && recommendation.relevance_factors.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Relevant to your:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {recommendation.relevance_factors.map((factor, index) => (
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
        {recommendation.resources && recommendation.resources.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Related Resources:
            </Typography>
            <List dense disablePadding>
              {recommendation.resources.map((resource, index) => (
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
        
        {/* AI Explanation section */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PsychologyIcon fontSize="small" sx={{ mr: 0.5, color: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">
                AI Explanation
              </Typography>
            </Box>
            <ExpandButton
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
              size="small"
            >
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ExpandButton>
          </Box>
          
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : (
              <Box sx={{ mt: 1, py: 1, px: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {aiExplanation}
                </Typography>
              </Box>
            )}
          </Collapse>
        </Box>
        
        {/* Chat section */}
        <Collapse in={chatVisible} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom>
              Chat with AI Assistant
            </Typography>
            
            <Paper 
              variant="outlined" 
              sx={{ 
                height: 200, 
                p: 1, 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default'
              }}
              ref={chatContainerRef}
            >
              <AnimatePresence>
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={chatBubbleVariants}
                    layout
                  >
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        mb: 1
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          maxWidth: '80%',
                          bgcolor: msg.sender === 'user' ? 'primary.main' : 'background.paper',
                          color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                        }}
                      >
                        <Typography variant="body2">
                          {msg.message}
                        </Typography>
                      </Paper>
                    </Box>
                  </motion.div>
                ))}
                
                {sendingMessage && (
                  <motion.div
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={chatBubbleVariants}
                    layout
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          maxWidth: '80%',
                          bgcolor: 'background.paper',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <CircularProgress size={16} sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Typing...
                        </Typography>
                      </Paper>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Paper>
            
            <Box sx={{ display: 'flex', mt: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask about this recommendation..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={sendingMessage}
                variant="outlined"
              />
              <IconButton 
                color="primary" 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || sendingMessage}
                sx={{ ml: 1 }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button 
          size="small" 
          onClick={handleToggleChat}
          startIcon={<PsychologyIcon />}
          variant={chatVisible ? "outlined" : "text"}
          color="primary"
        >
          {chatVisible ? "Hide Chat" : "Chat with AI"}
        </Button>
        
        <Box>
          <IconButton 
            size="small" 
            onClick={handleRefresh} 
            disabled={loading}
            title="Refresh recommendation"
          >
            {loading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
          </IconButton>
          
          <Button 
            size="small" 
            endIcon={<LaunchIcon />} 
            onClick={() => window.open(recommendation.url, '_blank')}
            sx={{ ml: 1 }}
          >
            View Details
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default AIRecommendationCard;