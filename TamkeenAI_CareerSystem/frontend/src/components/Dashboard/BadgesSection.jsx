import React, { useState } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Avatar, 
  Chip, 
  Tooltip, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  LinearProgress,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Badge
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InfoIcon from '@mui/icons-material/Info';
import ShareIcon from '@mui/icons-material/Share';
import { motion } from 'framer-motion';

// Badge icon mapping
const badgeIcons = {
  'assignment': <AssignmentTurnedInIcon />,
  'record_voice_over': <WorkspacePremiumIcon />,
  'people': <PeopleIcon />,
  'work': <WorkIcon />,
  'trending_up': <TrendingUpIcon />,
  'school': <SchoolIcon />,
  'star': <StarIcon />,
  'military_tech': <MilitaryTechIcon />,
  'emoji_events': <EmojiEventsIcon />
};

// Badge color mapping
const badgeColors = {
  'bronze': '#CD7F32',
  'silver': '#C0C0C0',
  'gold': '#FFD700',
  'platinum': '#E5E4E2',
  'diamond': '#B9F2FF'
};

const BadgesSection = ({ badges }) => {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Calculate badge stats
  const earnedBadges = badges.filter(badge => badge.date_earned);
  const totalBadges = badges.length;
  const completionPercentage = Math.round((earnedBadges.length / totalBadges) * 100);
  
  // Handle badge click
  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge);
    setDialogOpen(true);
  };
  
  // Close dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Share badge
  const handleShareBadge = () => {
    // Implement sharing functionality
    console.log('Sharing badge:', selectedBadge);
    // Could use Web Share API or copy link to clipboard
    if (navigator.share) {
      navigator.share({
        title: `I earned the ${selectedBadge.name} badge on TamkeenAI!`,
        text: selectedBadge.description,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(
        `I earned the ${selectedBadge.name} badge on TamkeenAI! ${selectedBadge.description}`
      );
      alert('Badge info copied to clipboard!');
    }
  };
  
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Your Achievements
        </Typography>
        <Chip 
          icon={<EmojiEventsIcon />} 
          label={`${earnedBadges.length}/${totalBadges} Earned`} 
          color="primary" 
          variant="outlined"
        />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Achievement Progress
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={completionPercentage} 
          sx={{ height: 8, borderRadius: 4 }} 
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {completionPercentage}% Complete
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {earnedBadges.length}/{totalBadges}
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Grid container spacing={2}>
        {badges.map((badge) => {
          const isEarned = !!badge.date_earned;
          return (
            <Grid item xs={4} sm={3} md={4} key={badge.id}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Tooltip title={isEarned ? badge.description : `Locked: ${badge.description}`}>
                  <Box
                    onClick={() => isEarned && handleBadgeClick(badge)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: isEarned ? 'pointer' : 'default',
                      opacity: isEarned ? 1 : 0.5,
                      filter: isEarned ? 'none' : 'grayscale(100%)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: isEarned ? 'scale(1.05)' : 'none',
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: isEarned ? 'primary.main' : 'grey.300',
                        mb: 1,
                        border: isEarned ? `2px solid ${badgeColors[badge.tier || 'gold']}` : 'none',
                        boxShadow: isEarned ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none'
                      }}
                    >
                      {badgeIcons[badge.icon] || <StarIcon />}
                    </Avatar>
                    <Typography 
                      variant="caption" 
                      align="center"
                      sx={{ 
                        fontWeight: isEarned ? 'bold' : 'normal',
                        color: isEarned ? 'text.primary' : 'text.secondary'
                      }}
                    >
                      {badge.name}
                    </Typography>
                  </Box>
                </Tooltip>
              </motion.div>
            </Grid>
          );
        })}
      </Grid>
      
      {/* Badge detail dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        {selectedBadge && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {selectedBadge.name}
                <IconButton 
                  size="small" 
                  sx={{ ml: 1 }}
                  onClick={handleShareBadge}
                >
                  <ShareIcon fontSize="small" />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, mb: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    p: 2
                  }}
                >
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: 'primary.main',
                      border: `4px solid ${badgeColors[selectedBadge.tier || 'gold']}`,
                      boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
                    }}
                  >
                    {badgeIcons[selectedBadge.icon] || <StarIcon sx={{ fontSize: 50 }} />}
                  </Avatar>
                </Box>
                <Box sx={{ flex: 1, p: 2 }}>
                  <Typography variant="body1" paragraph>
                    {selectedBadge.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Earned on: {new Date(selectedBadge.date_earned).toLocaleDateString()}
                  </Typography>
                  {selectedBadge.tier && (
                    <Chip 
                      label={selectedBadge.tier.charAt(0).toUpperCase() + selectedBadge.tier.slice(1)} 
                      size="small"
                      sx={{ 
                        mt: 1, 
                        bgcolor: badgeColors[selectedBadge.tier],
                        color: selectedBadge.tier === 'gold' || selectedBadge.tier === 'silver' ? 'black' : 'white'
                      }}
                    />
                  )}
                </Box>
              </Box>
              
              {selectedBadge.criteria && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    How to earn this badge:
                  </Typography>
                  <Typography variant="body2">
                    {selectedBadge.criteria}
                  </Typography>
                </Box>
              )}
              
              {selectedBadge.benefits && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Benefits:
                  </Typography>
                  <Typography variant="body2">
                    {selectedBadge.benefits}
                  </Typography>
                </Box>
              )}
              
              {selectedBadge.next_level && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Next level:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'grey.300',
                        mr: 1,
                        opacity: 0.7
                      }}
                    >
                      {badgeIcons[selectedBadge.icon] || <StarIcon />}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      {selectedBadge.next_level.name} - {selectedBadge.next_level.criteria}
                    </Typography>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default BadgesSection; 