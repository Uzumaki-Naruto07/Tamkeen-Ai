import React, { useState, useEffect } from 'react';
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
  Badge,
  Tabs,
  Tab,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { useTranslation } from 'react-i18next';
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
import LockIcon from '@mui/icons-material/Lock';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

// Sample badge data for fallback
const sampleBadges = [
  {
    id: '1',
    name: 'First Interview Completed',
    icon: 'assignment',
    tier: 'bronze',
    date_earned: '2023-12-15',
    description: 'Successfully completed your first mock interview session',
    category: 'Interviews',
    progression_path: 'Interview Mastery'
  },
  {
    id: '2',
    name: 'Resume Expert',
    icon: 'work',
    tier: 'silver',
    date_earned: '2023-12-20',
    description: 'Achieved a resume score of 85 or higher',
    category: 'Resume',
    progression_path: 'Application Excellence'
  },
  {
    id: '3',
    name: 'Skill Acquisition Champion',
    icon: 'trending_up',
    tier: 'gold',
    date_earned: null,
    description: 'Add 10 verified skills to your profile',
    category: 'Skills',
    progression_path: 'Skill Development',
    unlock_conditions: {
      required_count: 10,
      description: 'Add 10 verified skills to your profile'
    },
    unlock_progress: 7
  },
  {
    id: '4',
    name: 'Networking Novice',
    icon: 'people',
    tier: 'bronze',
    date_earned: '2024-01-05',
    description: 'Connect with 5 professionals in your field',
    category: 'Networking',
    progression_path: 'Professional Network'
  },
  {
    id: '5',
    name: 'Career Path Explorer',
    icon: 'school',
    tier: 'silver',
    date_earned: null,
    description: 'Explore 3 different career paths',
    category: 'Career Planning',
    unlock_conditions: {
      required_count: 3,
      description: 'Explore 3 different career paths'
    },
    unlock_progress: 1
  }
];

const BadgesSection = ({ data }) => {
  const { t } = useTranslation();
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [badgeData, setBadgeData] = useState([]);
  
  useEffect(() => {
    // Try to fetch badges from localStorage first
    try {
      const storedBadges = localStorage.getItem('user_badges');
      if (storedBadges) {
        setBadgeData(JSON.parse(storedBadges));
      } else if (Array.isArray(data) && data.length > 0) {
        // If no localStorage data but props data exists, use that
        setBadgeData(data);
        // Also save to localStorage for future
        localStorage.setItem('user_badges', JSON.stringify(data));
      } else {
        // If no data found anywhere, use sample data
        setBadgeData(sampleBadges);
        // Save sample data to localStorage
        localStorage.setItem('user_badges', JSON.stringify(sampleBadges));
      }
    } catch (error) {
      console.error('Error loading badge data:', error);
      // Fallback to sample data on error
      setBadgeData(sampleBadges);
    }
  }, [data]);
  
  // Calculate badge stats
  const earnedBadges = badgeData.filter(badge => badge.date_earned);
  const totalBadges = badgeData.length;
  const completionPercentage = Math.round((earnedBadges.length / totalBadges) * 100) || 0;
  
  // Heading and badge stats
  const renderHeading = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Your Achievements
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          {earnedBadges.length}/{totalBadges} earned
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={completionPercentage} 
          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} 
        />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1, minWidth: '40px', textAlign: 'right' }}>
          {completionPercentage}% complete
        </Typography>
      </Box>
    </Box>
  );
  
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
        title: t('badges.earned', { badge: selectedBadge.name }),
        text: selectedBadge.description,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(
        `${t('badges.earned', { badge: selectedBadge.name })} ${selectedBadge.description}`
      );
      alert(t('common.share') + ': ' + selectedBadge.name);
    }
  };

  // Export badges as PDF
  const handleExportBadges = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('My Achievement Badges', 14, 22);
    
    // Add completion stats
    doc.setFontSize(12);
    doc.text(`Progress: ${earnedBadges.length}/${totalBadges} badges earned (${completionPercentage}% complete)`, 14, 30);
    
    // Add current date
    const today = new Date();
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${today.toLocaleDateString()}`, 14, 35);
    
    // Create table data
    const tableColumn = ["Badge Name", "Category", "Tier", "Date Earned", "Description"];
    const tableRows = badgeData.map(badge => [
      badge.name,
      badge.category || "-",
      badge.tier || "-",
      badge.date_earned || "Not yet earned",
      badge.description
    ]);
    
    // Add table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      columnStyles: {
        0: { fontStyle: 'bold' },
        3: { cellWidth: 25 }
      }
    });
    
    // Save PDF
    doc.save('my-achievements.pdf');
  };
  
  // Organize badges into categories and trees
  const categorizedBadges = badgeData.reduce((acc, badge) => {
    const category = badge.category || t('badges.generalCategory');
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(badge);
    return acc;
  }, {});
  
  // Create badge progression trees
  const badgeTrees = badgeData.reduce((acc, badge) => {
    if (badge.progression_path) {
      if (!acc[badge.progression_path]) {
        acc[badge.progression_path] = [];
      }
      acc[badge.progression_path].push(badge);
    }
    return acc;
  }, {});
  
  // Sort badges in each progression path by level
  Object.keys(badgeTrees).forEach(path => {
    badgeTrees[path].sort((a, b) => (a.level || 0) - (b.level || 0));
  });
  
  // Check if a badge is the next one to unlock in its path
  const isNextToUnlock = (badge) => {
    if (!badge.progression_path || !badge.level) return false;
    
    const pathBadges = badgeTrees[badge.progression_path];
    const previousLevelBadge = pathBadges.find(b => b.level === badge.level - 1);
    
    return previousLevelBadge && previousLevelBadge.date_earned && !badge.date_earned;
  };
  
  // Get progress towards unlocking a badge
  const getUnlockProgress = (badge) => {
    if (!badge.unlock_conditions) return null;
    
    return {
      current: badge.unlock_progress || 0,
      total: badge.unlock_conditions.required_count || 1,
      percentage: Math.round(((badge.unlock_progress || 0) / 
                              (badge.unlock_conditions.required_count || 1)) * 100)
    };
  };
  
  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };
  
  // Render badge tree view
  const renderBadgeTree = () => {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('badges.badgeProgressionPaths')}
        </Typography>
        
        {Object.keys(badgeTrees).map(path => (
          <Card key={path} variant="outlined" sx={{ mb: 3, overflow: 'visible' }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {path}
              </Typography>
              
              <Stepper orientation="vertical">
                {badgeTrees[path].map((badge, index) => {
                  const isEarned = !!badge.date_earned;
                  const isNext = isNextToUnlock(badge);
                  const progress = getUnlockProgress(badge);
                  
                  return (
                    <Step key={badge.id} active={isEarned || isNext} completed={isEarned}>
                      <StepLabel
                        StepIconComponent={() => (
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: isEarned ? 'primary.main' : (isNext ? 'action.selected' : 'grey.300'),
                              border: isEarned ? `2px solid ${badgeColors[badge.tier || 'gold']}` : 'none',
                              boxShadow: isEarned ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none',
                              opacity: !isEarned && !isNext ? 0.6 : 1
                            }}
                          >
                            {isEarned ? (
                              badgeIcons[badge.icon] || <StarIcon />
                            ) : (
                              <LockIcon />
                            )}
                          </Avatar>
                        )}
                      >
                        <Box 
                          onClick={() => isEarned && handleBadgeClick(badge)}
                          sx={{ 
                            cursor: isEarned ? 'pointer' : 'default',
                            '&:hover': { textDecoration: isEarned ? 'underline' : 'none' }
                          }}
                        >
                          <Typography variant="body2" color={isEarned ? 'text.primary' : 'text.secondary'}>
                            {badge.name}
                            {isEarned && (
                              <CheckCircleIcon 
                                fontSize="small" 
                                color="success" 
                                sx={{ ml: 1, verticalAlign: 'middle' }} 
                              />
                            )}
                          </Typography>
                        </Box>
                      </StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary">
                          {badge.description}
                        </Typography>
                        
                        {!isEarned && badge.unlock_conditions && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {badge.unlock_conditions.description}
                            </Typography>
                            
                            {progress && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" display="block">
                                  {t('badges.progress')}: {progress.current}/{progress.total} 
                                  {progress.percentage >= 50 && progress.percentage < 100 && ` - ${t('badges.almostThere')}`}
                                  {progress.percentage === 100 && ` - ${t('badges.readyToClaim')}`}
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={progress.percentage} 
                                  sx={{ height: 6, borderRadius: 3, mt: 0.5 }} 
                                />
                              </Box>
                            )}
                          </Box>
                        )}
                        
                        {isEarned && badge.date_earned && (
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {t('badges.earnedOn')}: {new Date(badge.date_earned).toLocaleDateString()}
                          </Typography>
                        )}
                      </StepContent>
                    </Step>
                  );
                })}
              </Stepper>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };
  
  // Render gamified progress view
  const renderGamifiedView = () => {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {t('badges.yourBadgeChallenges')}
        </Typography>
        
        <List sx={{ width: '100%' }}>
          {Object.keys(categorizedBadges).map(category => (
            <React.Fragment key={category}>
              <ListItem 
                button 
                onClick={() => toggleCategory(category)}
                sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}
              >
                <ListItemIcon>
                  {category === t('badges.careerCategory') && <WorkIcon />}
                  {category === t('badges.learningCategory') && <SchoolIcon />}
                  {category === t('badges.networkingCategory') && <PeopleIcon />}
                  {category === t('badges.skillsCategory') && <AssignmentTurnedInIcon />}
                  {category === t('badges.generalCategory') && <StarIcon />}
                </ListItemIcon>
                <ListItemText 
                  primary={`${category}`} 
                  secondary={`${categorizedBadges[category].filter(b => b.date_earned).length}/${categorizedBadges[category].length} ${t('badges.earned')}`} 
                />
              </ListItem>
              
              <Collapse in={expandedCategory === category} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ pl: 4 }}>
                  {categorizedBadges[category]
                    .filter(badge => !badge.date_earned)
                    .map(badge => {
                      const progress = getUnlockProgress(badge);
                      const isNext = isNextToUnlock(badge);
                      
                      return (
                        <ListItem key={badge.id} sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
                          <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', mb: 1 }}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: isNext ? 'action.selected' : 'grey.300',
                                mr: 2,
                                opacity: 0.7
                              }}
                            >
                              {badgeIcons[badge.icon] || <StarIcon />}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight="medium">
                                {badge.name}
                              </Typography>
                              {isNext && (
                                <Chip 
                                  label={t('badges.nextLabel')} 
                                  size="small" 
                                  color="primary" 
                                  sx={{ ml: 1, height: 20 }} 
                                />
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {badge.description}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {badge.unlock_conditions && (
                            <Box sx={{ width: '100%', pl: 7 }}>
                              <Typography variant="caption" sx={{ 
                                display: 'block', 
                                fontWeight: 'medium',
                                color: isNext ? 'primary.main' : 'text.secondary'
                              }}>
                                ✦ {badge.unlock_conditions.description}
                              </Typography>
                              
                              {progress && (
                                <Box sx={{ mt: 1, width: '100%' }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" color="text.secondary">
                                      {progress.current}/{progress.total} {t('badges.completed')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {progress.percentage}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={progress.percentage} 
                                    sx={{ 
                                      height: 8, 
                                      borderRadius: 3, 
                                      mt: 0.5,
                                      bgcolor: 'grey.200'
                                    }} 
                                  />
                                </Box>
                              )}
                            </Box>
                          )}
                        </ListItem>
                      );
                    })}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Box>
    );
  };
  
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      {renderHeading()}
      
      <Tabs 
        value={viewMode} 
        onChange={(e, newValue) => setViewMode(newValue)} 
        sx={{ mb: 2 }}
        centered
      >
        <Tab value="grid" label={t('badges.badgesTab')} />
        <Tab value="tree" label={t('badges.progressionTab')} icon={<AccountTreeIcon fontSize="small" />} iconPosition="start" />
        <Tab value="gamified" label={t('badges.challengesTab')} />
      </Tabs>
      
      {viewMode === 'grid' && (
        <>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            {badgeData.map((badge) => {
              const isEarned = !!badge.date_earned;
              return (
                <Grid item xs={4} sm={3} md={4} key={badge.id}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Tooltip title={isEarned ? badge.description : `${t('common.locked')}: ${badge.description}`}>
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
        </>
      )}
      
      {viewMode === 'tree' && renderBadgeTree()}
      
      {viewMode === 'gamified' && renderGamifiedView()}
      
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
                  <Typography variant="body1" component="div" sx={{ mb: 2 }}>
                    {selectedBadge.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('badges.earnedOn')}: {new Date(selectedBadge.date_earned).toLocaleDateString()}
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
                    {t('common.howToEarn')}
                  </Typography>
                  <Typography variant="body2">
                    {selectedBadge.criteria}
                  </Typography>
                </Box>
              )}
              
              {selectedBadge.benefits && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('common.benefits')}
                  </Typography>
                  <Typography variant="body2">
                    {selectedBadge.benefits}
                  </Typography>
                </Box>
              )}
              
              {selectedBadge.next_level && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('common.nextLevel')}
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
              <Button onClick={handleCloseDialog}>{t('common.close')}</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default BadgesSection; 