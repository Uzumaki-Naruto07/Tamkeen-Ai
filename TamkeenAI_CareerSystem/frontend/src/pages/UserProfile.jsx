import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Grid, Card, CardContent, Avatar, IconButton,
  List, ListItem, ListItemText, ListItemIcon, Chip,
  CircularProgress, Alert, Tabs, Tab, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, MenuItem, InputAdornment, Switch, FormControlLabel,
  LinearProgress, Rating, Tooltip, Snackbar, Checkbox,
  Container
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
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillChip from '../components/common/SkillChip';
import { format } from 'date-fns';
import axios from 'axios';

// Create a basic API client for direct calls
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [editMode, setEditMode] = useState(true);
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
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    github: '',
    twitter: '',
    portfolio: ''
  });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  
  // Move state from dialog rendering functions to the component top level
  const [educationForm, setEducationForm] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });
  
  const [experienceForm, setExperienceForm] = useState({
    company: '',
    title: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });
  
  const [skillForm, setSkillForm] = useState({
    name: '',
    level: 3,
    years: 0,
    category: '',
    description: ''
  });
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { profile: userAccountProfile, updateUserProfile } = useUser();
  const params = useParams();
  
  // Move useEffect hooks from dialog rendering functions to the top level
  // Education form initialization
  useEffect(() => {
    if (educationDialogOpen) {
      setEducationForm({
        institution: currentEducation?.institution || '',
        degree: currentEducation?.degree || '',
        fieldOfStudy: currentEducation?.fieldOfStudy || '',
        startDate: currentEducation?.startDate || '',
        endDate: currentEducation?.endDate || '',
        current: currentEducation?.current || false,
        description: currentEducation?.description || ''
      });
    }
  }, [currentEducation, educationDialogOpen]);
  
  // Experience form initialization
  useEffect(() => {
    if (experienceDialogOpen) {
      setExperienceForm({
        company: currentExperience?.company || '',
        title: currentExperience?.title || '',
        location: currentExperience?.location || '',
        startDate: currentExperience?.startDate || '',
        endDate: currentExperience?.endDate || '',
        current: currentExperience?.current || false,
        description: currentExperience?.description || ''
      });
    }
  }, [currentExperience, experienceDialogOpen]);
  
  // Skill form initialization
  useEffect(() => {
    if (skillDialogOpen) {
      setSkillForm({
        name: currentSkill?.name || '',
        level: currentSkill?.level || 3,
        years: currentSkill?.years || 0,
        category: currentSkill?.category || '',
        description: currentSkill?.description || ''
      });
    }
  }, [currentSkill, skillDialogOpen]);
  
  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      // Check if we're looking at a specific profile by username
      const usernameFromUrl = params.username;
      
      // Reset state
      setLoading(true);
      setError(null);
      
      try {
        // We're looking at someone else's profile via URL
        if (usernameFromUrl) {
          console.log(`Loading profile for username: ${usernameFromUrl}`);
          
          // Dev mode - show mock profile with requested username
          if (import.meta.env.DEV) {
            console.log(`DEV MODE: Creating mock profile for username: ${usernameFromUrl}`);
            
            const mockUserId = `mock-user-${usernameFromUrl}`;
            
            // Helper function to get a consistent avatar URL
            const getAvatarUrl = (id) => {
              const num = id ? 
                String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 70 : 32;
              return `https://randomuser.me/api/portraits/men/${num}.jpg`;
            };
            
            const mockProfile = {
              id: mockUserId,
              userId: mockUserId,
              username: usernameFromUrl,
              firstName: usernameFromUrl.charAt(0).toUpperCase() + usernameFromUrl.slice(1),
              lastName: '',
              title: '',
              bio: '',
              location: '',
              phone: '',
              email: '',
              avatar: getAvatarUrl(mockUserId),
              visibility: {
                isPublic: true,
                showEmail: false,
                showPhone: false,
                showEducation: true,
                showExperience: true,
                showSkills: true
              },
              socialLinks: {
                linkedin: '',
                github: '',
                twitter: '',
                portfolio: ''
              }
            };
            
            setUserProfile(mockProfile);
            
            // Set viewing mode for profile fields (not editing)
            setProfileFieldsEdited({
              firstName: mockProfile.firstName,
              lastName: mockProfile.lastName,
              title: mockProfile.title,
              bio: mockProfile.bio,
              location: mockProfile.location,
              phone: mockProfile.phone,
              email: mockProfile.email
            });
            
            setProfileVisibility(mockProfile.visibility);
            setSocialLinks(mockProfile.socialLinks);
            setProfileUrl(`${window.location.origin}/profile/${mockProfile.username}`);
            
            // Empty arrays for other profile data
            setSkills([]);
            setEducation([]);
            setWorkExperience([]);
            
            // Viewing someone else's profile - not in edit mode
            setEditMode(false);
            setLoading(false);
            return;
          }
          
          // Production - get profile by username
          try {
            const profileResponse = await apiEndpoints.profiles.getProfileByUsername(usernameFromUrl);
            // Rest of the code for loading someone else's profile
            setUserProfile(profileResponse.data);
            setEditMode(false); // Viewing only
            
            // Set all other profile data
            // ...
            
            setLoading(false);
          } catch (err) {
            console.error(`Error loading profile for username ${usernameFromUrl}:`, err);
            setError(`Profile not found for username: ${usernameFromUrl}`);
            setLoading(false);
          }
          
          return;
        }
        
        // We're looking at our own profile - continue with original logic
        if (!userAccountProfile?.id) {
          // Initialize with mock data in development mode
          if (import.meta.env.DEV) {
            console.log("DEV MODE: Initializing with mock profile data");
            
            // Fixed mock user ID to ensure consistency
            const mockUserId = 'mock-user-123';
            
            // Helper function to get a consistent avatar URL
            const getAvatarUrl = (id) => {
              const num = id ? 
                String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 70 : 32;
              return `https://randomuser.me/api/portraits/men/${num}.jpg`;
            };
            
            const mockProfile = {
              id: mockUserId,
              userId: mockUserId,
              username: 'zayed',
              firstName: 'Zayed',
              lastName: '',
              title: '',
              bio: '',
              location: '',
              phone: '',
              email: '',
              avatar: getAvatarUrl(mockUserId),
              visibility: {
                isPublic: true,
                showEmail: false,
                showPhone: false,
                showEducation: true,
                showExperience: true,
                showSkills: true
              },
              socialLinks: {
                linkedin: '',
                github: '',
                twitter: '',
                portfolio: ''
              }
            };
            
            // Set local state
            setUserProfile(mockProfile);
            
            // Also update the App Context with this mock profile to ensure consistency
            if (import.meta.env.DEV && updateUserProfile) {
              console.log("DEV MODE: Syncing mock profile with app context");
              try {
                await updateUserProfile({
                  id: mockProfile.id,
                  fullName: mockProfile.firstName + (mockProfile.lastName ? ` ${mockProfile.lastName}` : ''),
                  bio: mockProfile.bio,
                  avatar: mockProfile.avatar
                });
              } catch (err) {
                console.warn("DEV MODE: Couldn't sync with context", err);
              }
            }
            
            // Set profile fields
            setProfileFieldsEdited({
              firstName: mockProfile.firstName,
              lastName: mockProfile.lastName,
              title: mockProfile.title,
              bio: mockProfile.bio,
              location: mockProfile.location,
              phone: mockProfile.phone,
              email: mockProfile.email
            });
            
            setProfileVisibility(mockProfile.visibility);
            setSocialLinks(mockProfile.socialLinks);
            setProfileUrl(`${window.location.origin}/profile/${mockProfile.username || mockProfile.id}`);
            
            // Set empty skills, education and work experience for user to fill
            setSkills([]);
            setEducation([]);
            setWorkExperience([]);
            
            setEditMode(true); // Allow editing for own profile
            setLoading(false);
            return;
          }
          
          setLoading(false);
          return;
        }
        
        // Regular profile loading from server
        // Fetch user profile data
        const profileResponse = await apiEndpoints.profiles.getUserProfile(userAccountProfile.id);
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
        setProfileUrl(`${window.location.origin}/profile/${profileResponse.data.username || userAccountProfile.id}`);
        
        // Fetch additional profile data
        const [achievementsRes, skillsRes, educationRes, experienceRes] = await Promise.all([
          apiEndpoints.profiles.getAchievements(userAccountProfile.id),
          apiEndpoints.profiles.getSkills(userAccountProfile.id),
          apiEndpoints.profiles.getEducation(userAccountProfile.id),
          apiEndpoints.profiles.getExperience(userAccountProfile.id)
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
        setError(err.message || 'Failed to load user profile data');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [userAccountProfile, params.username, updateUserProfile]);
  
  // Handle save profile changes
  const handleSaveProfile = async () => {
    if (!profileFieldsEdited.firstName || !profileFieldsEdited.lastName) {
      setError('First name and last name are required');
      setSnackbarOpen(true);
      setSnackbarMessage('First name and last name are required');
      setSnackbarSeverity('error');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      console.log('Updating profile with data:', {
        ...profileFieldsEdited,
        visibility: profileVisibility,
        socialLinks: socialLinks
      });
      
      // Prepare user profile data
      const profileData = {
        ...profileFieldsEdited,
        visibility: profileVisibility,
        socialLinks: socialLinks
      };
      
      // Add user ID if available
      if (userProfile?.id) {
        profileData.userId = userProfile.id;
      } else if (userAccountProfile?.id) {
        profileData.userId = userAccountProfile.id;
      }
      
      const response = await apiEndpoints.profiles.updateProfile(profileData);
      
      console.log('Profile update response:', response);
      
      // Update the userProfile state with new values
      setUserProfile(prev => ({
        ...prev,
        ...profileFieldsEdited,
        visibility: profileVisibility,
        socialLinks: socialLinks
      }));
      
      // Update user context if available
      if (updateUserProfile) {
        try {
          await updateUserProfile({
            ...userAccountProfile,
            fullName: `${profileFieldsEdited.firstName} ${profileFieldsEdited.lastName}`.trim(),
            avatar: userProfile?.avatar || userAccountProfile?.avatar
          });
        } catch (err) {
          console.warn("Couldn't sync profile with context", err);
        }
      }
      
      // Show success message
      setSnackbarMessage('Profile updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      let errorMessage = 'Failed to update profile';
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        console.error('API error details:', err.response.data);
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please check your connection';
        console.error('No response received:', err.request);
      } else {
        // Something else went wrong
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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
      setSnackbarMessage('Please select a valid image file (JPEG, PNG, or GIF)');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImage(event.target.result);
      setPhotoDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };
  
  // Save new profile picture
  const handleSaveProfilePicture = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const file = fileInputRef.current.files[0];
      if (!file) {
        throw new Error('No file selected');
      }
      
      console.log('Uploading profile picture:', file.name);
      
      // Create FormData object for the file upload
      const formData = new FormData();
      formData.append('avatar', file);
      
      // Get the user ID from the appropriate source
      const userId = userProfile?.id || userAccountProfile?.id;
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      console.log('Uploading profile picture for user:', userId);
      
      const response = await apiEndpoints.profiles.uploadAvatar(userId, formData);
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      console.log('Profile picture upload response:', response);
      
      // Get the avatar URL from the response
      const avatarUrl = response.data.avatarUrl;
      
      // Update user profile state
      setUserProfile(prev => ({
        ...prev,
        avatar: avatarUrl
      }));
      
      // Update profile fields edited state
      setProfileFieldsEdited(prev => ({
        ...prev,
        avatar: avatarUrl
      }));
      
      // Update in the main app context if available
      if (updateUserProfile) {
        try {
          await updateUserProfile({
            ...userAccountProfile,
            avatar: avatarUrl
          });
        } catch (err) {
          console.warn("Couldn't sync avatar with context", err);
        }
      }
      
      // Show success message
      setSnackbarSeverity('success');
      setSnackbarMessage('Profile picture updated successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to upload profile picture: ' + (err.message || 'Unknown error'));
      setSnackbarOpen(true);
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
              {/* Add an avatar preview in edit mode */}
              <Grid item xs={12} sx={{ mb: 2, textAlign: 'center' }}>
                <Avatar
                  src={userProfile?.avatar || ''}
                  alt={`${profileFieldsEdited.firstName} ${profileFieldsEdited.lastName}`}
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    margin: '0 auto', 
                    mb: 2,
                    border: '3px solid', 
                    borderColor: 'primary.light'
                  }}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-picture-upload-edit"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePictureUpload}
                />
                <label htmlFor="profile-picture-upload-edit">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CameraAlt />}
                    size="small"
                  >
                    Change Photo
                  </Button>
                </label>
              </Grid>
              
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
                size="large"
                sx={{ 
                  px: 3, 
                  py: 1,
                  fontWeight: 'bold'
                }}
              >
                {saving ? 'Saving...' : 'Save Profile'}
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
                    
                    {/* Profile completion prompt */}
                    {!editMode && (
                      <Typography 
                        variant="body2" 
                        color="primary" 
                        sx={{ 
                          mt: 1, 
                          p: 1, 
                          bgcolor: 'primary.light', 
                          color: 'primary.contrastText',
                          borderRadius: 1,
                          opacity: 0.9
                        }}
                      >
                        Complete your profile to enhance your professional presence
                      </Typography>
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
                              await apiEndpoints.profiles.deleteExperience(userAccountProfile.id, exp.id);
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
                              await apiEndpoints.profiles.deleteEducation(userAccountProfile.id, edu.id);
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
    // Handle form field changes
    const handleChange = (e) => {
      const { name, value, checked } = e.target;
      setEducationForm(prev => ({
        ...prev,
        [name]: name === 'current' ? checked : value
      }));
    };
    
    // Handle save education
    const handleSaveEducation = async () => {
      if (!educationForm.institution || !educationForm.degree) {
        setSnackbarMessage('Institution and degree are required');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      setSaving(true);
      
      try {
        // Handle in development mode
        if (import.meta.env.DEV) {
          await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
          
          const newEducation = {
            ...educationForm,
            id: currentEducation?.id || Date.now()
          };
          
          if (currentEducation) {
            // Update existing education
            setEducation(prev => prev.map(edu => 
              edu.id === currentEducation.id ? newEducation : edu
            ));
          } else {
            // Add new education
            setEducation(prev => [...prev, newEducation]);
          }
          
          setSnackbarMessage(`Education ${currentEducation ? 'updated' : 'added'} successfully`);
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setEducationDialogOpen(false);
          setCurrentEducation(null);
          return;
        }
        
        // Handle in production mode
        const userId = userAccountProfile?.id;
        let response;
        
        if (currentEducation) {
          // Update existing education
          response = await apiEndpoints.profiles.updateEducation(userId, currentEducation.id, educationForm);
          
          setEducation(prev => prev.map(edu => 
            edu.id === currentEducation.id ? response.data : edu
          ));
        } else {
          // Add new education
          response = await apiEndpoints.profiles.addEducation(userId, educationForm);
          
          setEducation(prev => [...prev, response.data]);
        }
        
        setSnackbarMessage(`Education ${currentEducation ? 'updated' : 'added'} successfully`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (err) {
        console.error('Error saving education:', err);
        setSnackbarMessage(`Failed to ${currentEducation ? 'update' : 'add'} education`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setSaving(false);
        setEducationDialogOpen(false);
        setCurrentEducation(null);
      }
    };
    
    return (
      <Dialog open={educationDialogOpen} onClose={() => setEducationDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentEducation ? 'Edit Education' : 'Add Education'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Institution"
            name="institution"
            value={educationForm.institution}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Degree"
            name="degree"
            value={educationForm.degree}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Field of Study"
            name="fieldOfStudy"
            value={educationForm.fieldOfStudy}
            onChange={handleChange}
            margin="normal"
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={educationForm.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={educationForm.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                disabled={educationForm.current}
              />
            </Grid>
          </Grid>
          <FormControlLabel
            control={
              <Checkbox
                name="current"
                checked={educationForm.current}
                onChange={handleChange}
              />
            }
            label="Currently studying here"
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={4}
            value={educationForm.description}
            onChange={handleChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEducationDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveEducation}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : (currentEducation ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  const renderExperienceDialog = () => {
    // Handle form field changes
    const handleChange = (e) => {
      const { name, value, checked } = e.target;
      setExperienceForm(prev => ({
        ...prev,
        [name]: name === 'current' ? checked : value
      }));
    };
    
    // Handle save experience
    const handleSaveExperience = async () => {
      if (!experienceForm.company || !experienceForm.title) {
        setSnackbarMessage('Company and title are required');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      setSaving(true);
      
      try {
        // Handle in development mode
        if (import.meta.env.DEV) {
          await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
          
          const newExperience = {
            ...experienceForm,
            id: currentExperience?.id || Date.now()
          };
          
          if (currentExperience) {
            // Update existing experience
            setWorkExperience(prev => prev.map(exp => 
              exp.id === currentExperience.id ? newExperience : exp
            ));
          } else {
            // Add new experience
            setWorkExperience(prev => [...prev, newExperience]);
          }
          
          setSnackbarMessage(`Work experience ${currentExperience ? 'updated' : 'added'} successfully`);
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setExperienceDialogOpen(false);
          setCurrentExperience(null);
          return;
        }
        
        // Handle in production mode
        const userId = userAccountProfile?.id;
        let response;
        
        if (currentExperience) {
          // Update existing experience
          response = await apiEndpoints.profiles.updateExperience(userId, currentExperience.id, experienceForm);
          
          setWorkExperience(prev => prev.map(exp => 
            exp.id === currentExperience.id ? response.data : exp
          ));
        } else {
          // Add new experience
          response = await apiEndpoints.profiles.addExperience(userId, experienceForm);
          
          setWorkExperience(prev => [...prev, response.data]);
        }
        
        setSnackbarMessage(`Work experience ${currentExperience ? 'updated' : 'added'} successfully`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (err) {
        console.error('Error saving work experience:', err);
        setSnackbarMessage(`Failed to ${currentExperience ? 'update' : 'add'} work experience`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setSaving(false);
        setExperienceDialogOpen(false);
        setCurrentExperience(null);
      }
    };
    
    return (
      <Dialog open={experienceDialogOpen} onClose={() => setExperienceDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentExperience ? 'Edit Work Experience' : 'Add Work Experience'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Company"
            name="company"
            value={experienceForm.company}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Title"
            name="title"
            value={experienceForm.title}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={experienceForm.location}
            onChange={handleChange}
            margin="normal"
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={experienceForm.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={experienceForm.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                margin="normal"
                disabled={experienceForm.current}
              />
            </Grid>
          </Grid>
          <FormControlLabel
            control={
              <Checkbox
                name="current"
                checked={experienceForm.current}
                onChange={handleChange}
              />
            }
            label="Currently working here"
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={4}
            value={experienceForm.description}
            onChange={handleChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExperienceDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveExperience}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : (currentExperience ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  const renderSkillDialog = () => {
    // Handle form field changes
    const handleChange = (e) => {
      const { name, value } = e.target;
      setSkillForm(prev => ({
        ...prev,
        [name]: value
      }));
    };
    
    // Handle rating change
    const handleRatingChange = (event, newValue) => {
      setSkillForm(prev => ({
        ...prev,
        level: newValue
      }));
    };
    
    // Handle save skill
    const handleSaveSkill = async () => {
      if (!skillForm.name) {
        setSnackbarMessage('Skill name is required');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      setSaving(true);
      
      try {
        // Add trending flag if skill is highly rated
        const enhancedSkill = {
          ...skillForm,
          trending: skillForm.level >= 4,
          verified: currentSkill?.verified || false
        };
        
        // Handle in development mode
        if (import.meta.env.DEV) {
          await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
          
          const newSkill = {
            ...enhancedSkill,
            id: currentSkill?.id || Date.now()
          };
          
          if (currentSkill) {
            // Update existing skill
            setSkills(prev => prev.map(skill => 
              skill.id === currentSkill.id ? newSkill : skill
            ));
          } else {
            // Add new skill
            setSkills(prev => [...prev, newSkill]);
          }
          
          setSnackbarMessage(`Skill ${currentSkill ? 'updated' : 'added'} successfully`);
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          setSkillDialogOpen(false);
          setCurrentSkill(null);
          return;
        }
        
        // Handle in production mode
        const userId = userAccountProfile?.id;
        let response;
        
        if (currentSkill) {
          // Update existing skill
          response = await apiEndpoints.profiles.updateSkill(userId, currentSkill.id, enhancedSkill);
          
          setSkills(prev => prev.map(skill => 
            skill.id === currentSkill.id ? response.data : skill
          ));
        } else {
          // Add new skill
          response = await apiEndpoints.profiles.addSkill(userId, enhancedSkill);
          
          setSkills(prev => [...prev, response.data]);
        }
        
        setSnackbarMessage(`Skill ${currentSkill ? 'updated' : 'added'} successfully`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (err) {
        console.error('Error saving skill:', err);
        setSnackbarMessage(`Failed to ${currentSkill ? 'update' : 'add'} skill`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setSaving(false);
        setSkillDialogOpen(false);
        setCurrentSkill(null);
      }
    };
    
    // List of common skill categories
    const categories = [
      { value: 'frontend', label: 'Frontend Development' },
      { value: 'backend', label: 'Backend Development' },
      { value: 'database', label: 'Database' },
      { value: 'mobile', label: 'Mobile Development' },
      { value: 'devops', label: 'DevOps' },
      { value: 'cloud', label: 'Cloud Computing' },
      { value: 'security', label: 'Security' },
      { value: 'ai', label: 'AI & Machine Learning' },
      { value: 'design', label: 'Design' },
      { value: 'soft', label: 'Soft Skills' },
      { value: 'languages', label: 'Programming Languages' },
      { value: 'frameworks', label: 'Frameworks & Libraries' },
      { value: 'tools', label: 'Tools & Platforms' },
      { value: 'other', label: 'Other' }
    ];
    
    return (
      <Dialog open={skillDialogOpen} onClose={() => setSkillDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentSkill ? 'Edit Skill' : 'Add Skill'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Skill Name"
            name="name"
            value={skillForm.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Skill Level
            </Typography>
            <Rating
              name="level"
              value={skillForm.level}
              onChange={handleRatingChange}
              max={5}
              size="large"
            />
            <Typography variant="caption" color="text.secondary">
              {skillForm.level === 1 && 'Beginner'}
              {skillForm.level === 2 && 'Basic'}
              {skillForm.level === 3 && 'Intermediate'}
              {skillForm.level === 4 && 'Advanced'}
              {skillForm.level === 5 && 'Expert'}
            </Typography>
          </Box>
          <TextField
            fullWidth
            label="Years of Experience"
            name="years"
            type="number"
            value={skillForm.years}
            onChange={handleChange}
            margin="normal"
            InputProps={{
              inputProps: { min: 0, step: 0.5 }
            }}
          />
          <TextField
            fullWidth
            select
            label="Category"
            name="category"
            value={skillForm.category}
            onChange={handleChange}
            margin="normal"
          >
            {categories.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={3}
            value={skillForm.description}
            onChange={handleChange}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveSkill}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : (currentSkill ? 'Update' : 'Add')}
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
            {profileImage ? (
              <Avatar
                src={profileImage}
                sx={{ width: 200, height: 200, margin: '0 auto', mb: 2 }}
              />
            ) : (
              <Box sx={{ 
                width: 200, 
                height: 200, 
                margin: '0 auto', 
                mb: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'action.hover',
                borderRadius: '50%'
              }}>
                <CameraAlt sx={{ fontSize: 50, color: 'text.secondary' }} />
              </Box>
            )}
            <Typography variant="body2" color="text.secondary">
              {profileImage ? 'Preview of your new profile picture' : 'No image selected'}
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
            disabled={saving || !profileImage}
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

  // Render not found state
  const renderProfileNotFound = () => {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            py: 8
          }}
        >
          <PersonOutline sx={{ fontSize: 100, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Profile Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            The profile you're looking for doesn't exist or is not available.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/user-profile')}
          >
            Go to Your Profile
          </Button>
        </Box>
      </Container>
    );
  };

  // Main render
  if (loading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }
  
  if (error && !userProfile) {
    return renderProfileNotFound();
  }

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
      
      {/* Notification Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile; 