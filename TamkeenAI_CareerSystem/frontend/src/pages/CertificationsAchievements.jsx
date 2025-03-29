import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent,
  Button, Divider, Chip, IconButton, TextField, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemIcon, Avatar,
  CircularProgress, Alert, Paper, Tab, Tabs
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

  // Fetch certifications and achievements
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch certifications
        const certsResponse = await apiEndpoints.user.getCertifications(user.id);
        setCertifications(certsResponse.data || []);
        
        // Fetch achievements
        const achieveResponse = await apiEndpoints.user.getAchievements(user.id);
        setAchievements(achieveResponse.data || []);
        
        // Fetch badges
        const badgesResponse = await apiEndpoints.user.getBadges(user.id);
        setBadges(badgesResponse.data || []);

        // Fetch skill chart
        const skillsResponse = await apiEndpoints.skills.getTopSkills(user.id);
        setSkillChart(skillsResponse.data || []);
        
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
        const resumeData = await apiEndpoints.resume.getLatest(user.id);
        if (resumeData.data?.certifications?.length > 0) {
          // Add any certifications from resume that aren't already in our list
          const existingTitles = certifications.map(c => c.title.toLowerCase());
          const newCerts = resumeData.data.certifications.filter(
            cert => !existingTitles.includes(cert.title.toLowerCase())
          );
          
          if (newCerts.length > 0) {
            setCertifications(prev => [...prev, ...newCerts]);
          }
        }

        if (resumeData.data?.achievements?.length > 0) {
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
    } catch (err) {
      console.error(`Error adding ${addItemType}:`, err);
      setError(t('error_adding_item'));
    }
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
                <IconButton size="small">
                  <Share fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('more_options')}>
                <IconButton size="small">
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
            minHeight: 200,
            border: '2px dashed',
            borderColor: 'divider',
            backgroundColor: 'transparent',
            cursor: 'pointer'
          }}
          onClick={() => handleOpenDialog('certification')}
        >
          <Add fontSize="large" color="primary" />
          <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
            {t('add_certification')}
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
              <Typography variant="h6" component="h3" gutterBottom>
                {achievement.title}
              </Typography>
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
            </CardContent>
            <Divider />
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
              {achievement.url && (
                <Tooltip title={t('view_details')}>
                  <IconButton size="small" component="a" href={achievement.url} target="_blank">
                    <Link fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('edit')}>
                <IconButton size="small">
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('delete')}>
                <IconButton size="small">
                  <Delete fontSize="small" />
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
            minHeight: 200,
            border: '2px dashed',
            borderColor: 'divider',
            backgroundColor: 'transparent',
            cursor: 'pointer'
          }}
          onClick={() => handleOpenDialog('achievement')}
        >
          <Add fontSize="large" color="primary" />
          <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
            {t('add_achievement')}
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  const renderBadges = () => (
    <Grid container spacing={3}>
      {badges.map((badge, index) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={badge.id || index}>
          <Card sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            padding: 2
          }}>
            <Avatar 
              src={badge.imageUrl} 
              sx={{ 
                width: 80, 
                height: 80, 
                mb: 2,
                boxShadow: 3
              }}
            >
              <EmojiEvents />
            </Avatar>
            <Typography 
              variant="subtitle1" 
              component="h3" 
              align="center" 
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              {badge.title}
            </Typography>
            <Typography 
              variant="body2" 
              color="textSecondary" 
              align="center"
            >
              {badge.description}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <LoadingSpinner message={t('loading_certifications')} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            {t('certifications_and_achievements')}
          </Typography>
          <Box>
            <Tooltip title={t('import_from_linkedin')}>
              <Button 
                variant="outlined" 
                startIcon={<LinkedIn />}
                sx={{ mr: 1 }}
              >
                {t('import')}
              </Button>
            </Tooltip>
            <Tooltip title={t('upload_certificates')}>
              <Button 
                variant="contained" 
                startIcon={<CloudUpload />}
              >
                {t('upload')}
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
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
        </Paper>

        <Box sx={{ mt: 3 }}>
          {tabValue === 0 && renderCertifications()}
          {tabValue === 1 && renderAchievements()}
          {tabValue === 2 && renderBadges()}
        </Box>
      </Box>

      {/* Add new item dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {addItemType === 'certification' ? t('add_certification') : t('add_achievement')}
        </DialogTitle>
        <DialogContent>
          <TextField
            name="title"
            label={t('title')}
            value={newItem.title}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            name="issuer"
            label={addItemType === 'certification' ? t('issuer') : t('organization')}
            value={newItem.issuer}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="date"
            label={t('issue_date')}
            type="date"
            value={newItem.date}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            name="description"
            label={t('description')}
            value={newItem.description}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            name="url"
            label={t('credential_url')}
            value={newItem.url}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleAddItem} 
            variant="contained" 
            color="primary"
            disabled={!newItem.title}
          >
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CertificationsAchievements; 