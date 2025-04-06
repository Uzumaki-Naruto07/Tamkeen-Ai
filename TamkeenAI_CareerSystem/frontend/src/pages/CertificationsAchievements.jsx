import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent,
  Button, Divider, Chip, IconButton, TextField, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemIcon, Avatar,
  CircularProgress, Alert, Paper, Tab, Tabs,
  Menu, MenuItem, Dialog as ConfirmDialog,
  DialogContentText, Snackbar
} from '@mui/material';
import {
  WorkspacePremium, School, EmojiEvents, Add, Edit,
  Delete, CloudUpload, Verified, LinkedIn, Language,
  Star, StarBorder, DateRange, CheckCircle, Bookmark,
  MoreVert, Share, Download, Link, FilterList
} from '@mui/icons-material';
import { useUser } from '../context/AppContext';
import LoadingSpinner from '../components/LoadingSpinner';
import apiEndpoints from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CertificationsAchievements = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [badges, setBadges] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addItemType, setAddItemType] = useState('');
  const [newItem, setNewItem] = useState({
    title: '',
    issuer: '',
    date: '',
    description: '',
    url: ''
  });
  const [skillChart, setSkillChart] = useState([]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Fetch certifications and achievements
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch certifications
        try {
          const certsResponse = await apiEndpoints.user.getCertifications(user.id);
          setCertifications(certsResponse?.data || []);
        } catch (err) {
          console.log('Certifications API not available, using empty list');
          setCertifications([]);
        }
        
        // Fetch achievements
        try {
          const achieveResponse = await apiEndpoints.user.getAchievements(user.id);
          setAchievements(achieveResponse?.data || []);
        } catch (err) {
          console.log('Achievements API not available, using empty list');
          setAchievements([]);
        }
        
        // Fetch badges
        try {
          const storedBadges = localStorage.getItem('user_badges');
          if (storedBadges) {
            setBadges(JSON.parse(storedBadges));
          } else {
            const badgesResponse = await apiEndpoints.user.getBadges(user.id);
            setBadges(badgesResponse?.data || []);
            // Save to localStorage for future use
            if (badgesResponse?.data) {
              localStorage.setItem('user_badges', JSON.stringify(badgesResponse.data));
            }
          }
        } catch (err) {
          console.log('Badges API not available, checking localStorage');
          // Try to get badges from localStorage as fallback
          try {
            const storedBadges = localStorage.getItem('user_badges');
            if (storedBadges) {
              setBadges(JSON.parse(storedBadges));
            } else {
              setBadges([]);
            }
          } catch (e) {
            console.error('Error retrieving badges from localStorage:', e);
            setBadges([]);
          }
        }

        // Fetch skill chart
        try {
          const skillsResponse = await apiEndpoints.skills.getTopSkills(user.id);
          setSkillChart(skillsResponse?.data || []);
        } catch (err) {
          console.log('Skills API not available, using empty list');
          setSkillChart([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching certifications and achievements:', err);
        setError(t('error_fetching_data'));
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user.id, t]);

  // Check if any data has been auto-extracted from resume
  useEffect(() => {
    const checkResumeExtraction = async () => {
      try {
        try {
          const resumeData = await apiEndpoints.resume.getLatest(user.id);
          if (resumeData?.data?.certifications?.length > 0) {
            // Add any certifications from resume that aren't already in our list
            const existingTitles = certifications.map(c => c.title.toLowerCase());
            const newCerts = resumeData.data.certifications.filter(
              cert => !existingTitles.includes(cert.title.toLowerCase())
            );
            
            if (newCerts.length > 0) {
              setCertifications(prev => [...prev, ...newCerts]);
            }
          }

          if (resumeData?.data?.achievements?.length > 0) {
            // Add any achievements from resume that aren't already in our list
            const existingTitles = achievements.map(a => a.title.toLowerCase());
            const newAchievements = resumeData.data.achievements.filter(
              achieve => !existingTitles.includes(achieve.title.toLowerCase())
            );
            
            if (newAchievements.length > 0) {
              setAchievements(prev => [...prev, ...newAchievements]);
            }
          }
        } catch (err) {
          console.log('Resume extraction API not available');
        }
      } catch (err) {
        console.error('Error checking resume data:', err);
      }
    };
    
    if (certifications.length === 0 || achievements.length === 0) {
      checkResumeExtraction();
    }
  }, [certifications, achievements, user.id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (type) => {
    setAddItemType(type);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNewItem({
      title: '',
      issuer: '',
      date: '',
      description: '',
      url: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddItem = async () => {
    try {
      if (addItemType === 'certification') {
        await apiEndpoints.user.addCertification(user.id, newItem);
        setCertifications(prev => [...prev, {
          ...newItem,
          id: Date.now().toString(),
          verified: false
        }]);
      } else if (addItemType === 'achievement') {
        await apiEndpoints.user.addAchievement(user.id, newItem);
        setAchievements(prev => [...prev, {
          ...newItem,
          id: Date.now().toString()
        }]);
      }
      handleCloseDialog();

      // Show success message
      setSnackbarMessage(`${addItemType} added successfully!`);
      setSnackbarOpen(true);
    } catch (err) {
      console.error(`Error adding ${addItemType}:`, err);
      setError(t('error_adding_item'));
    }
  };

  // Handle menu open
  const handleMenuOpen = (event, item, type) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedItem({ ...item, type });
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Handle delete action
  const handleDeleteClick = () => {
    handleMenuClose();
    setConfirmDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      if (selectedItem.type === 'certification') {
        await apiEndpoints.user.deleteCertification(user.id, selectedItem.id);
        setCertifications(prev => prev.filter(cert => cert.id !== selectedItem.id));
      } else if (selectedItem.type === 'achievement') {
        await apiEndpoints.user.deleteAchievement(user.id, selectedItem.id);
        setAchievements(prev => prev.filter(achieve => achieve.id !== selectedItem.id));
      } else if (selectedItem.type === 'badge') {
        // Handle badge hiding
        const updatedBadges = badges.map(badge => 
          badge.id === selectedItem.id ? { ...badge, hidden: true } : badge
        );
        setBadges(updatedBadges);
        localStorage.setItem('user_badges', JSON.stringify(updatedBadges));
      }
      
      setConfirmDialogOpen(false);
      setSnackbarMessage(`${selectedItem.type} deleted successfully!`);
      setSnackbarOpen(true);
    } catch (err) {
      console.error(`Error deleting ${selectedItem.type}:`, err);
      setError(`Error deleting ${selectedItem.type}`);
      setConfirmDialogOpen(false);
    }
  };

  // Handle share action
  const handleShareItem = () => {
    handleMenuClose();
    
    const title = selectedItem.title || selectedItem.name;
    const text = selectedItem.description;
    const url = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title,
        text,
        url
      }).catch(err => {
        console.error('Share failed:', err);
      });
    } else {
      // Fallback for browsers without share API
      navigator.clipboard.writeText(`${title}: ${text} ${url}`);
      setSnackbarMessage('Copied to clipboard!');
      setSnackbarOpen(true);
    }
  };

  // Export item as PDF
  const handleExportPDF = () => {
    handleMenuClose();
    
    const doc = new jsPDF();
    
    if (selectedItem.type === 'certification' || selectedItem.type === 'achievement') {
      // Title
      doc.setFontSize(20);
      doc.text(selectedItem.title, 14, 22);
      
      // Issuer and date
      doc.setFontSize(12);
      if (selectedItem.issuer) {
        doc.text(`Issuer: ${selectedItem.issuer}`, 14, 32);
      }
      if (selectedItem.date) {
        doc.text(`Date: ${selectedItem.date}`, 14, 40);
      }
      
      // Description
      if (selectedItem.description) {
        doc.setFontSize(11);
        const splitDescription = doc.splitTextToSize(selectedItem.description, 180);
        doc.text(splitDescription, 14, 50);
      }
      
      // Skills if any
      if (selectedItem.skills && selectedItem.skills.length > 0) {
        const yPos = selectedItem.description ? 70 : 50;
        doc.setFontSize(12);
        doc.text('Skills:', 14, yPos);
        doc.setFontSize(10);
        selectedItem.skills.forEach((skill, index) => {
          doc.text(`• ${skill}`, 20, yPos + 8 + (index * 6));
        });
      }
      
    } else if (selectedItem.type === 'badge') {
      // Badge export
      doc.setFontSize(20);
      doc.text(selectedItem.name, 14, 22);
      
      // Badge category and tier
      doc.setFontSize(12);
      if (selectedItem.category) {
        doc.text(`Category: ${selectedItem.category}`, 14, 32);
      }
      if (selectedItem.tier) {
        doc.text(`Tier: ${selectedItem.tier}`, 14, 40);
      }
      
      // Date earned
      if (selectedItem.date_earned) {
        doc.text(`Earned on: ${selectedItem.date_earned}`, 14, 48);
      }
      
      // Description
      if (selectedItem.description) {
        doc.setFontSize(11);
        const splitDescription = doc.splitTextToSize(selectedItem.description, 180);
        doc.text(splitDescription, 14, 58);
      }
    }
    
    doc.save(`${selectedItem.type}-${selectedItem.title || selectedItem.name}.pdf`);
    
    setSnackbarMessage('Exported to PDF successfully!');
    setSnackbarOpen(true);
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const renderCertifications = () => (
    <Grid container spacing={3}>
      {certifications.map((cert, index) => (
        <Grid item xs={12} md={6} lg={4} key={cert.id || index}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {cert.title}
                </Typography>
                {cert.verified && (
                  <Tooltip title={t('verified')}>
                    <Verified color="primary" />
                  </Tooltip>
                )}
              </Box>
              <Typography color="textSecondary" gutterBottom>
                {cert.issuer}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                <DateRange fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                {cert.date && format(new Date(cert.date), 'MMMM yyyy')}
              </Typography>
              <Typography variant="body2" paragraph>
                {cert.description}
              </Typography>
              {cert.skills && (
                <Box mt={2}>
                  {cert.skills.map((skill, idx) => (
                    <Chip 
                      key={idx} 
                      label={skill} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  ))}
                </Box>
              )}
            </CardContent>
            <Divider />
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
              {cert.url && (
                <Tooltip title={t('view_credential')}>
                  <IconButton size="small" component="a" href={cert.url} target="_blank">
                    <Link fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('share')}>
                <IconButton 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, cert, 'certification')}
                >
                  <Share fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('more_options')}>
                <IconButton 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, cert, 'certification')}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Card>
        </Grid>
      ))}
      <Grid item xs={12} md={6} lg={4}>
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 3,
            border: '2px dashed',
            borderColor: 'divider',
            bgcolor: 'background.default',
            cursor: 'pointer'
          }}
          onClick={() => handleOpenDialog('certification')}
        >
          <Add fontSize="large" color="primary" sx={{ mb: 2 }} />
          <Typography variant="h6" align="center">
            {t('add_certification')}
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
            {t('add_certification_prompt')}
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAchievements = () => (
    <Grid container spacing={3}>
      {achievements.map((achievement, index) => (
        <Grid item xs={12} md={6} lg={4} key={achievement.id || index}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {achievement.title}
                </Typography>
              </Box>
              <Typography color="textSecondary" gutterBottom>
                {achievement.issuer}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                <DateRange fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                {achievement.date && format(new Date(achievement.date), 'MMMM yyyy')}
              </Typography>
              <Typography variant="body2" paragraph>
                {achievement.description}
              </Typography>
              {achievement.skills && (
                <Box mt={2}>
                  {achievement.skills.map((skill, idx) => (
                    <Chip 
                      key={idx} 
                      label={skill} 
                      size="small" 
                      sx={{ mr: 0.5, mb: 0.5 }} 
                    />
                  ))}
                </Box>
              )}
            </CardContent>
            <Divider />
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
              {achievement.url && (
                <Tooltip title={t('view_achievement')}>
                  <IconButton size="small" component="a" href={achievement.url} target="_blank">
                    <Link fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('share')}>
                <IconButton 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, achievement, 'achievement')}
                >
                  <Share fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('more_options')}>
                <IconButton 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, achievement, 'achievement')}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Card>
        </Grid>
      ))}
      <Grid item xs={12} md={6} lg={4}>
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 3,
            border: '2px dashed',
            borderColor: 'divider',
            bgcolor: 'background.default',
            cursor: 'pointer'
          }}
          onClick={() => handleOpenDialog('achievement')}
        >
          <Add fontSize="large" color="primary" sx={{ mb: 2 }} />
          <Typography variant="h6" align="center">
            {t('add_achievement')}
          </Typography>
          <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
            {t('add_achievement_prompt')}
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  const renderBadges = () => (
    <Grid container spacing={3}>
      {badges
        .filter(badge => !badge.hidden)
        .map((badge, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={badge.id || index}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative',
            bgcolor: badge.date_earned ? 'background.paper' : 'background.default',
            border: badge.date_earned ? `2px solid ${badge.tier ? badge.tier : 'primary.main'}` : '1px solid divider',
            boxShadow: badge.date_earned ? 3 : 1
          }}>
            <CardContent sx={{ flexGrow: 1, pt: 3, pb: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 2,
                position: 'relative'
              }}>
                <Avatar 
                  sx={{ 
                    width: 70, 
                    height: 70, 
                    bgcolor: badge.date_earned 
                      ? (badge.tier === 'gold' ? '#FFD700' 
                         : badge.tier === 'silver' ? '#C0C0C0'
                         : badge.tier === 'bronze' ? '#CD7F32'
                         : badge.tier === 'platinum' ? '#E5E4E2'
                         : 'primary.main')
                      : 'action.disabled',
                    boxShadow: badge.date_earned ? '0 4px 10px rgba(0,0,0,0.2)' : 'none',
                    opacity: badge.date_earned ? 1 : 0.7
                  }}
                >
                  {badge.icon === 'star' && <Star fontSize="large" />}
                  {badge.icon === 'school' && <School fontSize="large" />}
                  {badge.icon === 'emoji_events' && <EmojiEvents fontSize="large" />}
                  {badge.icon === 'work' && <WorkspacePremium fontSize="large" />}
                  {badge.icon === 'assignment' && <CheckCircle fontSize="large" />}
                  {badge.icon === 'people' && <GroupIcon fontSize="large" />}
                  {!badge.icon && <Star fontSize="large" />}
                </Avatar>
                {badge.date_earned && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      bottom: -10, 
                      bgcolor: 'success.main', 
                      color: 'white', 
                      px: 1, 
                      py: 0.2, 
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {badge.tier || 'EARNED'}
                  </Box>
                )}
              </Box>
              
              <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                {badge.name}
              </Typography>
              
              {badge.category && (
                <Chip 
                  label={badge.category} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ display: 'block', mx: 'auto', mb: 1.5 }}
                />
              )}
              
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 1.5 }}>
                {badge.description}
              </Typography>
              
              {badge.date_earned && (
                <Typography variant="caption" display="block" align="center" color="text.secondary">
                  <DateRange fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  Earned: {new Date(badge.date_earned).toLocaleDateString()}
                </Typography>
              )}
              
              {!badge.date_earned && badge.unlock_conditions && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" display="block" align="center" gutterBottom>
                    Progress: {badge.unlock_progress || 0}/{badge.unlock_conditions.required_count}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(badge.unlock_progress / badge.unlock_conditions.required_count) * 100} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}
            </CardContent>
            <Box sx={{ mt: 'auto', p: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Tooltip title={t('share')}>
                <IconButton 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, badge, 'badge')}
                  disabled={!badge.date_earned}
                >
                  <Share fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('more_options')}>
                <IconButton 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, badge, 'badge')}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Item options menu
  const renderItemMenu = () => (
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleShareItem}>
        <ListItemIcon>
          <Share fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Share" />
      </MenuItem>
      <MenuItem onClick={handleExportPDF}>
        <ListItemIcon>
          <Download fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Export as PDF" />
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
        <ListItemIcon>
          <Delete fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText primary={selectedItem?.type === 'badge' ? "Hide" : "Delete"} />
      </MenuItem>
    </Menu>
  );

  // Confirm delete dialog
  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialogOpen}
      onClose={() => setConfirmDialogOpen(false)}
    >
      <DialogTitle>
        {selectedItem?.type === 'badge' ? "Hide Badge" : `Delete ${selectedItem?.type}`}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {selectedItem?.type === 'badge' 
            ? `Are you sure you want to hide the "${selectedItem?.name}" badge?`
            : `Are you sure you want to delete "${selectedItem?.title}"? This action cannot be undone.`
          }
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
        <Button onClick={handleConfirmDelete} color="error" variant="contained">
          {selectedItem?.type === 'badge' ? "Hide" : "Delete"}
        </Button>
      </DialogActions>
    </ConfirmDialog>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('certifications_achievements')}
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<WorkspacePremium />} 
            label={t('certifications')} 
            iconPosition="start"
          />
          <Tab 
            icon={<EmojiEvents />} 
            label={t('achievements')} 
            iconPosition="start"
          />
          <Tab 
            icon={<Star />} 
            label={t('badges')} 
            iconPosition="start"
          />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {tabValue === 0 && renderCertifications()}
          {tabValue === 1 && renderAchievements()}
          {tabValue === 2 && renderBadges()}
        </Box>
      </Paper>
      
      {/* Add Item Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {addItemType === 'certification' ? t('add_certification') : t('add_achievement')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="title"
            name="title"
            label={t('title')}
            type="text"
            fullWidth
            variant="outlined"
            value={newItem.title}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="issuer"
            name="issuer"
            label={t('issuer')}
            type="text"
            fullWidth
            variant="outlined"
            value={newItem.issuer}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="date"
            name="date"
            label={t('date')}
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            value={newItem.date}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            name="description"
            label={t('description')}
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={newItem.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="url"
            name="url"
            label={t('url')}
            type="url"
            fullWidth
            variant="outlined"
            value={newItem.url}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('cancel')}</Button>
          <Button onClick={handleAddItem} variant="contained" color="primary">
            {t('add')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Item Actions Menu */}
      {renderItemMenu()}
      
      {/* Confirm Delete Dialog */}
      {renderConfirmDialog()}
      
      {/* Notification Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default CertificationsAchievements; 