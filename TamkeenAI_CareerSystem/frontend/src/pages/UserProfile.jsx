import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Grid, Card, CardContent, Avatar, IconButton,
  List, ListItem, ListItemText, ListItemIcon, Chip,
  CircularProgress, Alert, Tabs, Tab, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, MenuItem, InputAdornment, Switch, FormControlLabel,
  LinearProgress, Rating, Tooltip, Snackbar, Checkbox
} from '@mui/material';
import {
  Edit, Save, CloudUpload, Delete, PersonOutline,
  Work, School, Psychology, Assessment, LinkedIn, 
  GitHub, Language, LocationOn, Phone, Email, 
  CheckCircle, Star, EmojiEvents, Timeline, 
  Link as LinkIcon, Twitter, Public, Code, 
  Close, CameraAlt, PersonAdd, PersonRemove, 
  Visibility, VisibilityOff, PhotoCamera, 
  BusinessCenter, DataArray, VerifiedUser, 
  Security, Lock, Favorite, Refresh,
  AutoGraph, Interests, SentimentSatisfiedAlt,
  Construction, MenuBook, Apps, ContentCopy, Add
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillChip from '../components/common/SkillChip';
import { format } from 'date-fns';

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setWorkExperience] = useState([]);
  const [profileVisibility, setProfileVisibility] = useState({
    isPublic: true,
    showEmail: false,
    showPhone: false,
    showEducation: true,
    showExperience: true,
    showSkills: true
  });
  const [profileUrl, setProfileUrl] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [profileFieldsEdited, setProfileFieldsEdited] = useState({});
  const [educationDialogOpen, setEducationDialogOpen] = useState(false);
  const [currentEducation, setCurrentEducation] = useState(null);
  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [currentExperience, setCurrentExperience] = useState(null);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    github: '',
    twitter: '',
    portfolio: ''
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { profile, updateProfile } = useUser();
  
  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user profile data
        const profileResponse = await apiEndpoints.profiles.getUserProfile(profile.id);
        setUserProfile(profileResponse.data);
        
        // Initialize profile fields
        setProfileFieldsEdited({
          firstName: profileResponse.data.firstName || '',
          lastName: profileResponse.data.lastName || '',
          title: profileResponse.data.title || '',
          bio: profileResponse.data.bio || '',
          location: profileResponse.data.location || '',
          phone: profileResponse.data.phone || '',
          email: profileResponse.data.email || ''
        });
        
        // Set profile visibility settings
        setProfileVisibility(profileResponse.data.visibility || {
          isPublic: true,
          showEmail: false,
          showPhone: false,
          showEducation: true,
          showExperience: true,
          showSkills: true
        });
        
        // Set profile URL
        setProfileUrl(`${window.location.origin}/profile/${profileResponse.data.username || profile.id}`);
        
        // Fetch additional profile data
        const [achievementsRes, skillsRes, educationRes, experienceRes] = await Promise.all([
          apiEndpoints.profiles.getAchievements(profile.id),
          apiEndpoints.profiles.getSkills(profile.id),
          apiEndpoints.profiles.getEducation(profile.id),
          apiEndpoints.profiles.getExperience(profile.id)
        ]);
        
        setAchievements(achievementsRes.data || []);
        setSkills(skillsRes.data || []);
        setEducation(educationRes.data || []);
        setWorkExperience(experienceRes.data || []);
        
        // Set social links
        setSocialLinks({
          linkedin: profileResponse.data.socialLinks?.linkedin || '',
          github: profileResponse.data.socialLinks?.github || '',
          twitter: profileResponse.data.socialLinks?.twitter || '',
          portfolio: profileResponse.data.socialLinks?.portfolio || ''
        });
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Failed to load user profile data');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [profile]);
  
  // Save profile changes
  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Prepare profile data for update
      const updatedProfile = {
        ...profileFieldsEdited,
        visibility: profileVisibility,
        socialLinks
      };
      
      // Update profile
      const response = await apiEndpoints.profiles.updateProfile(profile.id, updatedProfile);
      
      // Update local context state
      updateProfile({
        ...profile,
        firstName: profileFieldsEdited.firstName,
        lastName: profileFieldsEdited.lastName,
        title: profileFieldsEdited.title,
        avatar: response.data.avatar || profile.avatar
      });
      
      setUserProfile({
        ...userProfile,
        ...profileFieldsEdited,
        visibility: profileVisibility,
        socialLinks
      });
      
      setEditMode(false);
      setSnackbarMessage('Profile updated successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle profile picture upload
  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }
    
    setProfileImage(URL.createObjectURL(file));
    setPhotoDialogOpen(true);
  };
  
  // Save new profile picture
  const handleSaveProfilePicture = async () => {
    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', fileInputRef.current.files[0]);
      
      const response = await apiEndpoints.profiles.uploadAvatar(profile.id, formData);
      
      // Update user profile with new avatar
      updateProfile({
        ...profile,
        avatar: response.data.avatarUrl
      });
      
      setUserProfile({
        ...userProfile,
        avatar: response.data.avatarUrl
      });
      
      setSnackbarMessage('Profile picture updated');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError('Failed to upload profile picture');
    } finally {
      setSaving(false);
      setPhotoDialogOpen(false);
    }
  };
  
  // Show snackbar message
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };
  
  // Render functions
  const renderPersonalInformation = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ 
          borderBottom: '2px solid', 
          borderColor: 'primary.main', 
          pb: 1, 
          mb: 3,
          display: 'flex',
          alignItems: 'center'
        }}>
          <PersonOutline sx={{ mr: 1 }} /> Personal Information
        </Typography>
        {editMode ? (
          <form>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileFieldsEdited.firstName || ''}
                  onChange={(e) => setProfileFieldsEdited({ ...profileFieldsEdited, firstName: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileFieldsEdited.lastName || ''}
                  onChange={(e) => setProfileFieldsEdited({ ...profileFieldsEdited, lastName: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={profileFieldsEdited.title || ''}
                  onChange={(e) => setProfileFieldsEdited({ ...profileFieldsEdited, title: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={4}
                  value={profileFieldsEdited.bio || ''}
                  onChange={(e) => setProfileFieldsEdited({ ...profileFieldsEdited, bio: e.target.value })}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={profileFieldsEdited.location || ''}
                  onChange={(e) => setProfileFieldsEdited({ ...profileFieldsEdited, location: e.target.value })}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profileFieldsEdited.phone || ''}
                  onChange={(e) => setProfileFieldsEdited({ ...profileFieldsEdited, phone: e.target.value })}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setEditMode(false)}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveProfile}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              >
                Save Changes
              </Button>
            </Box>
          </form>
        ) : (
          <Box>
            <Card sx={{ mb: 3, overflow: 'hidden', boxShadow: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={userProfile?.avatar}
                    sx={{ width: 100, height: 100, mr: 2, border: '3px solid', borderColor: 'primary.light' }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5">{userProfile?.firstName || ''} {userProfile?.lastName || ''}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">{userProfile?.title || 'No title specified'}</Typography>
                    {userProfile?.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          {userProfile.location}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setEditMode(true)}
                    size="small"
                  >
                    Edit Profile
                  </Button>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                {userProfile?.bio ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1">{userProfile.bio}</Typography>
                  </Box>
                ) : (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Add a bio to tell others about yourself
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-picture-upload"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePictureUpload}
                  />
                  <label htmlFor="profile-picture-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CameraAlt />}
                    >
                      Change Profile Picture
                    </Button>
                  </label>
                </Box>
              </CardContent>
            </Card>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ mr: 1 }} /> Contact Information
                </Box>
              </Typography>
              <Card>
                <CardContent>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <Email />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={userProfile?.email || 'Not provided'}
                      />
                      <Switch
                        checked={profileVisibility.showEmail}
                        onChange={(e) => setProfileVisibility({...profileVisibility, showEmail: e.target.checked})}
                        size="small"
                      />
                      <Tooltip title={profileVisibility.showEmail ? 'Public' : 'Private'}>
                        <IconButton size="small">
                          {profileVisibility.showEmail ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Phone />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Phone" 
                        secondary={userProfile?.phone || 'Not provided'}
                      />
                      <Switch
                        checked={profileVisibility.showPhone}
                        onChange={(e) => setProfileVisibility({...profileVisibility, showPhone: e.target.checked})}
                        size="small"
                      />
                      <Tooltip title={profileVisibility.showPhone ? 'Public' : 'Private'}>
                        <IconButton size="small">
                          {profileVisibility.showPhone ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
            
            <Box>
              <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinkedIn sx={{ mr: 1 }} /> Social Links
                </Box>
              </Typography>
              <Card>
                <CardContent>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <LinkedIn />
                      </ListItemIcon>
                      <ListItemText 
                        primary="LinkedIn" 
                        secondary={socialLinks.linkedin || 'Not connected'}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          // Open dialog to edit LinkedIn URL
                        }}
                      >
                        {socialLinks.linkedin ? 'Edit' : 'Add'}
                      </Button>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <GitHub />
                      </ListItemIcon>
                      <ListItemText 
                        primary="GitHub" 
                        secondary={socialLinks.github || 'Not connected'}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          // Open dialog to edit GitHub URL
                        }}
                      >
                        {socialLinks.github ? 'Edit' : 'Add'}
                      </Button>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Twitter />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Twitter" 
                        secondary={socialLinks.twitter || 'Not connected'}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          // Open dialog to edit Twitter URL
                        }}
                      >
                        {socialLinks.twitter ? 'Edit' : 'Add'}
                      </Button>
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Language />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Portfolio Website" 
                        secondary={socialLinks.portfolio || 'Not added'}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          // Open dialog to edit Portfolio URL
                        }}
                      >
                        {socialLinks.portfolio ? 'Edit' : 'Add'}
                      </Button>
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}
      </Box>
    );
  };
  
  const renderWorkExperience = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ 
          borderBottom: '2px solid', 
          borderColor: 'primary.main', 
          pb: 1, 
          mb: 3,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Work sx={{ mr: 1 }} /> Work Experience
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            variant="outlined" 
            startIcon={<Add />} 
            onClick={() => {
              setCurrentExperience(null);
              setExperienceDialogOpen(true);
            }}
            size="small"
          >
            Add Experience
          </Button>
        </Typography>
        
        {experience.length > 0 ? (
          <Box>
            {experience.map((exp, index) => (
              <Card key={index} sx={{ mb: 2, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6">{exp.title}</Typography>
                      <Typography variant="subtitle1">{exp.company}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {exp.startDate && format(new Date(exp.startDate), 'MMM yyyy')} - 
                        {exp.current ? ' Present' : (exp.endDate && format(new Date(exp.endDate), ' MMM yyyy'))}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{exp.location}</Typography>
                      {exp.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>{exp.description}</Typography>
                      )}
                    </Box>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setCurrentExperience(exp);
                          setExperienceDialogOpen(true);
                        }}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setConfirmDialogAction(() => async () => {
                            try {
                              await apiEndpoints.profiles.deleteExperience(profile.id, exp.id);
                              setWorkExperience(experience.filter(e => e.id !== exp.id));
                              setSnackbarMessage('Experience deleted successfully');
                              setSnackbarOpen(true);
                            } catch (err) {
                              console.error('Error deleting experience:', err);
                              setError('Failed to delete experience');
                            }
                          });
                          setConfirmDialogOpen(true);
                        }}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Card sx={{ textAlign: 'center', py: 4, px: 2, bgcolor: 'background.default', border: '1px dashed', borderColor: 'divider' }}>
            <Work sx={{ fontSize: 40, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              You haven't added any work experience yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Adding your work history helps recruiters understand your professional background.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              sx={{ mt: 1 }}
              onClick={() => {
                setCurrentExperience(null);
                setExperienceDialogOpen(true);
              }}
            >
              Add Work Experience
            </Button>
          </Card>
        )}
      </Box>
    );
  };
  
  const renderEducation = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ 
          borderBottom: '2px solid', 
          borderColor: 'primary.main', 
          pb: 1, 
          mb: 3,
          display: 'flex',
          alignItems: 'center'
        }}>
          <School sx={{ mr: 1 }} /> Education
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            variant="outlined" 
            startIcon={<Add />} 
            onClick={() => {
              setCurrentEducation(null);
              setEducationDialogOpen(true);
            }}
            size="small"
          >
            Add Education
          </Button>
        </Typography>
        
        {education.length > 0 ? (
          <Box>
            {education.map((edu, index) => (
              <Card key={index} sx={{ mb: 2, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6">{edu.degree}</Typography>
                      <Typography variant="subtitle1">{edu.institution}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {edu.startDate && format(new Date(edu.startDate), 'MMM yyyy')} - 
                        {edu.current ? ' Present' : (edu.endDate && format(new Date(edu.endDate), ' MMM yyyy'))}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{edu.fieldOfStudy}</Typography>
                      {edu.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>{edu.description}</Typography>
                      )}
                    </Box>
                    <Box>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setCurrentEducation(edu);
                          setEducationDialogOpen(true);
                        }}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setConfirmDialogAction(() => async () => {
                            try {
                              await apiEndpoints.profiles.deleteEducation(profile.id, edu.id);
                              setEducation(education.filter(e => e.id !== edu.id));
                              setSnackbarMessage('Education deleted successfully');
                              setSnackbarOpen(true);
                            } catch (err) {
                              console.error('Error deleting education:', err);
                              setError('Failed to delete education');
                            }
                          });
                          setConfirmDialogOpen(true);
                        }}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Card sx={{ textAlign: 'center', py: 4, px: 2, bgcolor: 'background.default', border: '1px dashed', borderColor: 'divider' }}>
            <School sx={{ fontSize: 40, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              You haven't added any education yet.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Adding your educational background helps highlight your qualifications.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              sx={{ mt: 1 }}
              onClick={() => {
                setCurrentEducation(null);
                setEducationDialogOpen(true);
              }}
            >
              Add Education
            </Button>
          </Card>
        )}
      </Box>
    );
  };
  
  const renderSkills = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ 
          borderBottom: '2px solid', 
          borderColor: 'primary.main', 
          pb: 1, 
          mb: 3,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Psychology sx={{ mr: 1 }} /> Skills & Expertise
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            variant="outlined" 
            startIcon={<Add />} 
            onClick={() => {
              setCurrentSkill(null);
              setSkillDialogOpen(true);
            }}
            size="small"
          >
            Add Skill
          </Button>
        </Typography>
        
        <Card sx={{ mb: 3, boxShadow: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <SkillChip
                    key={index}
                    skill={skill}
                    variant="outlined"
                    showLevel
                    onClick={() => {
                      setCurrentSkill(skill);
                      setSkillDialogOpen(true);
                    }}
                  />
                ))
              ) : (
                <Box sx={{ p: 2, width: '100%', bgcolor: 'action.hover', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No skills added yet. Click "Add Skill" to showcase your expertise.
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Assessment sx={{ mr: 1 }} /> Skill Assessment
            </Box>
          </Typography>
          <Card sx={{ bgcolor: 'background.default', boxShadow: 1 }}>
            <CardContent>
              <Typography variant="body2" paragraph>
                Take skill assessments to verify your expertise and improve your career opportunities.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/skills-assessment')}
                startIcon={<Assessment />}
              >
                Take Skill Assessment
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  };
  
  const renderAccountSettings = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ 
          borderBottom: '2px solid', 
          borderColor: 'primary.main', 
          pb: 1, 
          mb: 3,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Security sx={{ mr: 1 }} /> Account Settings
        </Typography>
        
        <Card sx={{ mb: 3, boxShadow: 1 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ 
              borderBottom: '1px solid', 
              borderColor: 'divider', 
              pb: 1 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Public sx={{ mr: 1, fontSize: 20 }} /> Profile Visibility
              </Box>
            </Typography>
            
            <Box sx={{ my: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={profileVisibility.isPublic}
                    onChange={(e) => setProfileVisibility({...profileVisibility, isPublic: e.target.checked})}
                    color="primary"
                  />
                }
                label="Public Profile"
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: -0.5 }}>
                If enabled, your profile can be viewed by anyone.
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom sx={{ 
              borderBottom: '1px solid', 
              borderColor: 'divider', 
              pb: 1 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LinkIcon sx={{ mr: 1, fontSize: 20 }} /> Profile URL
              </Box>
            </Typography>
            
            <TextField
              fullWidth
              disabled
              value={profileUrl}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Copy to clipboard">
                      <IconButton
                        onClick={() => {
                          navigator.clipboard.writeText(profileUrl);
                          showSnackbar('Profile URL copied to clipboard');
                        }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              margin="normal"
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom sx={{ 
              borderBottom: '1px solid', 
              borderColor: 'divider', 
              pb: 1 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VisibilityOff sx={{ mr: 1, fontSize: 20 }} /> Privacy Settings
              </Box>
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={profileVisibility.showEducation}
                    onChange={(e) => setProfileVisibility({...profileVisibility, showEducation: e.target.checked})}
                    color="primary"
                  />
                }
                label="Show Education"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={profileVisibility.showExperience}
                    onChange={(e) => setProfileVisibility({...profileVisibility, showExperience: e.target.checked})}
                    color="primary"
                  />
                }
                label="Show Work Experience"
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={profileVisibility.showSkills}
                    onChange={(e) => setProfileVisibility({...profileVisibility, showSkills: e.target.checked})}
                    color="primary"
                  />
                }
                label="Show Skills"
              />
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ boxShadow: 1 }}>
          <CardContent>
            <Typography variant="subtitle1" color="error" gutterBottom sx={{ 
              borderBottom: '1px solid', 
              borderColor: 'error.light', 
              pb: 1 
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Delete sx={{ mr: 1, fontSize: 20 }} /> Danger Zone
              </Box>
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Box>
                <Typography variant="body2">Delete Account</Typography>
                <Typography variant="body2" color="text.secondary">
                  This will permanently delete your account and all associated data.
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  // Open confirmation dialog
                }}
                startIcon={<Delete />}
              >
                Delete Account
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };
  
  const renderEducationDialog = () => {
    return (
      <Dialog open={educationDialogOpen} onClose={() => setEducationDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentEducation ? 'Edit Education' : 'Add Education'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Institution"
            defaultValue={currentEducation?.institution || ''}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Degree"
            defaultValue={currentEducation?.degree || ''}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Field of Study"
            defaultValue={currentEducation?.fieldOfStudy || ''}
            margin="normal"
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                defaultValue={currentEducation?.startDate || ''}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                defaultValue={currentEducation?.endDate || ''}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>
          </Grid>
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={currentEducation?.current || false}
              />
            }
            label="Currently studying here"
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            defaultValue={currentEducation?.description || ''}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEducationDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="primary">
            {currentEducation ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  const renderExperienceDialog = () => {
    return (
      <Dialog open={experienceDialogOpen} onClose={() => setExperienceDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentExperience ? 'Edit Work Experience' : 'Add Work Experience'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Company"
            defaultValue={currentExperience?.company || ''}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Title"
            defaultValue={currentExperience?.title || ''}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            defaultValue={currentExperience?.location || ''}
            margin="normal"
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                defaultValue={currentExperience?.startDate || ''}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                defaultValue={currentExperience?.endDate || ''}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>
          </Grid>
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={currentExperience?.current || false}
              />
            }
            label="Currently working here"
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            defaultValue={currentExperience?.description || ''}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExperienceDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="primary">
            {currentExperience ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  const renderSkillDialog = () => {
    return (
      <Dialog open={skillDialogOpen} onClose={() => setSkillDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentSkill ? 'Edit Skill' : 'Add Skill'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Skill Name"
            defaultValue={currentSkill?.name || ''}
            margin="normal"
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Skill Level
            </Typography>
            <Rating
              name="skill-level"
              defaultValue={currentSkill?.level || 3}
              max={5}
              size="large"
            />
          </Box>
          <TextField
            fullWidth
            label="Years of Experience"
            type="number"
            defaultValue={currentSkill?.years || ''}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            defaultValue={currentSkill?.description || ''}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="primary">
            {currentSkill ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  const renderPhotoDialog = () => {
    return (
      <Dialog open={photoDialogOpen} onClose={() => setPhotoDialogOpen(false)}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Avatar
              src={profileImage}
              sx={{ width: 200, height: 200, margin: '0 auto', mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary">
              Preview of your new profile picture
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveProfilePicture}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  const renderConfirmDialog = () => {
    return (
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this item? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => {
              if (confirmDialogAction) {
                confirmDialogAction();
                setConfirmDialogOpen(false);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ py: 3 }}>
      <Paper sx={{ p: 0, mb: 3 }}>
        <Grid container>
          <Grid item xs={12} md={3} sx={{ borderRight: 1, borderColor: 'divider' }}>
            <List component="nav" sx={{ py: 0 }}>
              {[
                { icon: <PersonOutline />, label: "Personal Information", value: 0 },
                { icon: <Work />, label: "Work Experience", value: 1 },
                { icon: <School />, label: "Education", value: 2 },
                { icon: <Psychology />, label: "Skills", value: 3 },
                { icon: <Security />, label: "Account Settings", value: 4 }
              ].map((item) => (
                <ListItem
                  key={item.value}
                  button
                  selected={activeTab === item.value}
                  onClick={() => setActiveTab(item.value)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.light',
                      '&:hover': {
                        bgcolor: 'primary.light',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Box sx={{ p: 3 }}>
              {loading ? (
                <LoadingSpinner message="Loading user profile..." />
              ) : error ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              ) : (
                <>
                  {activeTab === 0 && renderPersonalInformation()}
                  {activeTab === 1 && renderWorkExperience()}
                  {activeTab === 2 && renderEducation()}
                  {activeTab === 3 && renderSkills()}
                  {activeTab === 4 && renderAccountSettings()}
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {renderEducationDialog()}
      {renderExperienceDialog()}
      {renderSkillDialog()}
      {renderPhotoDialog()}
      {renderConfirmDialog()}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default UserProfile; 