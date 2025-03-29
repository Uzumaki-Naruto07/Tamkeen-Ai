import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Divider,
  Chip, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon, LinearProgress,
  Avatar, CircularProgress, Alert, Badge, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip, Zoom, Collapse, Rating
} from '@mui/material';
import {
  EmojiEvents, Stars, WorkspacePremium, School, 
  Psychology, Insights, LightbulbCircle, CheckCircle,
  MilitaryTech, Visibility, List as ListIcon, 
  GridView, MoreHoriz, Celebration, BarChart, Timeline,
  TrendingUp, BubbleChart, FlagCircle, AssignmentTurnedIn,
  Work, Description, QuestionAnswer, PlayArrow, Lock,
  Engineering, Code, Business, SportsEsports, Language,
  Settings, RestartAlt, Share
} from '@mui/icons-material';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillRadarChart from '../components/SkillRadarChart';
import confetti from 'canvas-confetti';

const GamifiedProgress = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [currentXP, setCurrentXP] = useState(0);
  const [xpToNextLevel, setXpToNextLevel] = useState(100);
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [skillStats, setSkillStats] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  
  const { profile } = useUser();
  
  // Fetch user's progress data
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user level and XP
        const progressResponse = await apiEndpoints.gamification.getUserProgress(profile.id);
        const progressData = progressResponse.data || {};
        
        setUserLevel(progressData.level || 1);
        setCurrentXP(progressData.currentXP || 0);
        setXpToNextLevel(progressData.xpToNextLevel || 100);
        
        // Fetch badges
        const badgesResponse = await apiEndpoints.gamification.getUserBadges(profile.id);
        setBadges(badgesResponse.data || []);
        
        // Fetch achievements
        const achievementsResponse = await apiEndpoints.gamification.getUserAchievements(profile.id);
        setAchievements(achievementsResponse.data || []);
        
        // Set recent achievements (last 3)
        setRecentAchievements(
          (achievementsResponse.data || [])
            .filter(a => a.achieved)
            .sort((a, b) => new Date(b.dateAchieved) - new Date(a.dateAchieved))
            .slice(0, 3)
        );
        
        // Fetch challenges
        const challengesResponse = await apiEndpoints.gamification.getChallenges(profile.id);
        setChallenges(challengesResponse.data || []);
        
        // Fetch skill stats
        const skillStatsResponse = await apiEndpoints.skills.getUserSkillStats(profile.id);
        setSkillStats(skillStatsResponse.data || {});
        
        // Fetch activity history
        const activityResponse = await apiEndpoints.gamification.getActivityHistory(profile.id);
        setActivityHistory(activityResponse.data || []);
      } catch (err) {
        setError('Failed to load progress data');
        console.error('Error fetching progress data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgressData();
  }, [profile]);
  
  // Handle opening badge details
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setBadgeDialogOpen(true);
    
    // If badge was recently achieved, trigger confetti
    if (recentAchievements.some(a => a.id === badge.id)) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 300);
    }
  };
  
  // Handle opening challenge details
  const handleChallengeClick = (challenge) => {
    setSelectedChallenge(challenge);
    setChallengeDialogOpen(true);
  };
  
  // Handle accepting a challenge
  const handleAcceptChallenge = async (challengeId) => {
    if (!profile?.id) return;
    
    try {
      await apiEndpoints.gamification.acceptChallenge(profile.id, challengeId);
      
      // Update the challenge in the list
      setChallenges(prev => 
        prev.map(c => c.id === challengeId ? { ...c, accepted: true } : c)
      );
    } catch (err) {
      console.error('Error accepting challenge:', err);
    }
    
    setChallengeDialogOpen(false);
  };
  
  // Calculate progress percentage for XP bar
  const calculateXPPercentage = () => {
    if (xpToNextLevel === 0) return 100;
    return (currentXP / xpToNextLevel) * 100;
  };

  return (
    <Box sx={{ py: 3 }}>
      {/* ... existing component body ... */}
      
      {/* Badge Detail Dialog */}
      <Dialog
        open={badgeDialogOpen}
        onClose={() => setBadgeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }
        }}
      >
        {selectedBadge && (
          <>
            <Box 
              sx={{ 
                bgcolor: selectedBadge.unlocked ? selectedBadge.color : 'grey.500',
                py: 4,
                textAlign: 'center',
                color: '#fff'
              }}
            >
              <Avatar
                sx={{ 
                  width: 80,
                  height: 80,
                  margin: '0 auto',
                  bgcolor: '#fff',
                  color: selectedBadge.unlocked ? selectedBadge.color : 'grey.500',
                  mb: 1,
                  border: '4px solid',
                  borderColor: 'rgba(255,255,255,0.5)'
                }}
              >
                {getBadgeIcon(selectedBadge.category)}
              </Avatar>
              
              <Typography variant="h6" sx={{ mt: 1 }}>
                {selectedBadge.name}
              </Typography>
              
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {selectedBadge.unlocked ? 'Unlocked' : 'Locked'}
              </Typography>
            </Box>
            
            <DialogContent>
              <Typography paragraph>
                {selectedBadge.description}
              </Typography>
              
              {selectedBadge.criteria && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    How to earn:
                  </Typography>
                  
                  <List dense>
                    {selectedBadge.criteria.map((criterion, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {selectedBadge.unlocked ? (
                            <CheckCircle color="success" fontSize="small" />
                          ) : (
                            <ArrowForward fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText primary={criterion} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              
              {selectedBadge.unlocked && selectedBadge.dateAchieved && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Achieved on: {new Date(selectedBadge.dateAchieved).toLocaleDateString()}
                </Typography>
              )}
            </DialogContent>
            
            <DialogActions>
              {selectedBadge.unlocked && (
                <Button 
                  startIcon={<Share />}
                  onClick={() => {
                    // Share functionality
                    alert('Sharing badge...');
                  }}
                >
                  Share
                </Button>
              )}
              
              <Button onClick={() => setBadgeDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Challenge Detail Dialog */}
      <Dialog
        open={challengeDialogOpen}
        onClose={() => setChallengeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedChallenge && (
          <>
            <DialogTitle>
              {selectedChallenge.title}
            </DialogTitle>
            
            <DialogContent dividers>
              <Typography variant="body1" paragraph>
                {selectedChallenge.description}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Progress
                </Typography>
                
                <LinearProgress 
                  variant="determinate" 
                  value={selectedChallenge.progress || 0} 
                  sx={{ height: 10, borderRadius: 1, mb: 1 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedChallenge.progress || 0}% Complete
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {selectedChallenge.daysLeft} days remaining
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }} elevation={0} variant="outlined">
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Reward
                    </Typography>
                    
                    <Typography variant="h6" color="primary">
                      {selectedChallenge.xpReward} XP
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }} elevation={0} variant="outlined">
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Difficulty
                    </Typography>
                    
                    <Rating 
                      value={selectedChallenge.difficulty || 1} 
                      readOnly 
                      max={3} 
                      icon={<MilitaryTech color="primary" />}
                      emptyIcon={<MilitaryTech color="disabled" />}
                    />
                  </Paper>
                </Grid>
              </Grid>
              
              <List sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Steps to complete:
                </Typography>
                
                {(selectedChallenge.steps || []).map((step, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckCircle 
                        color={step.completed ? "success" : "disabled"} 
                        fontSize="small"
                      />
                    </ListItemIcon>
                    <ListItemText primary={step.text} />
                  </ListItem>
                ))}
              </List>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setChallengeDialogOpen(false)}>
                Close
              </Button>
              
              {!selectedChallenge.accepted && (
                <Button 
                  variant="contained"
                  onClick={() => handleAcceptChallenge(selectedChallenge.id)}
                >
                  Accept Challenge
                </Button>
              )}
              
              {selectedChallenge.accepted && !selectedChallenge.completed && (
                <Button 
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    // Navigate to related activity
                    setChallengeDialogOpen(false);
                    
                    if (selectedChallenge.relatedActivity) {
                      navigate(`/${selectedChallenge.relatedActivity}`);
                    }
                  }}
                >
                  Continue Progress
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

// TabPanel component for the tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default GamifiedProgress;