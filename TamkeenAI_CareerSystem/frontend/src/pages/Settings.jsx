import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon, Switch,
  FormControlLabel, Alert, Snackbar, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Avatar,
  Tabs, Tab, Chip, Tooltip, Badge, InputAdornment
} from '@mui/material';
import {
  Settings as SettingsIcon, Person, Security, Notifications,
  Language, Visibility, Delete, Edit, Save, Close,
  Palette, DarkMode, LightMode, CloudDownload, GitHub,
  LinkedIn, Twitter, Facebook, Link, Check, Add,
  NotificationsActive, NotificationsOff, Public, Lock,
  VerifiedUser, Email, Phone, CreditCard, CloudUpload,
  Backup, Style, FormatPaint, AccountCircle, Logout,
  VpnKey, PrivacyTip, Translate, FormatColorFill, Dashboard,
  Bookmark, AccessTime, Business, Work, Description, Block
} from '@mui/icons-material';
import { useUser } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '@mui/material/styles';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
    showContactInfo: true,
    profileVisibility: 'public' // public, connections, private
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    notificationTypes: {
      applications: true,
      interviews: true,
      messages: true,
      jobs: true,
      learning: true,
      system: true
    },
    emailFrequency: 'immediate' // immediate, daily, weekly, none
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'system', // light, dark, system
    primaryColor: '#1976d2',
    fontSize: 'medium', // small, medium, large
    compactMode: false,
    language: 'en' // en, ar, fr, etc.
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    activityVisibility: 'connections',
    searchable: true,
    allowDataCollection: true,
    allowThirdPartySharing: false
  });
  
  const [dataSettings, setDataSettings] = useState({
    autoBackup: false,
    backupFrequency: 'weekly'
  });
  
  const [exportOpen, setExportOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const navigate = useNavigate();
  const { profile, updateUser, logout } = useUser();
  const theme = useTheme();
  
  useEffect(() => {
    const loadUserSettings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load profile from localStorage
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          setProfileForm({
            name: parsedProfile.name || '',
            email: parsedProfile.email || '',
            phone: parsedProfile.phone || '',
            bio: parsedProfile.bio || '',
            location: parsedProfile.location || '',
            website: parsedProfile.website || '',
            linkedin: parsedProfile.linkedin || '',
            github: parsedProfile.github || '',
            twitter: parsedProfile.twitter || '',
            showContactInfo: parsedProfile.showContactInfo !== undefined ? parsedProfile.showContactInfo : true,
            profileVisibility: parsedProfile.profileVisibility || 'public'
          });

          // Set the profile image if available
          if (parsedProfile.profileImage) {
            setPreviewImage(parsedProfile.profileImage);
          }
        } else if (profile?.id) {
          // If nothing in localStorage but we have a profile in context
          setProfileForm({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            bio: profile.bio || '',
            location: profile.location || '',
            website: profile.website || '',
            linkedin: profile.linkedin || '',
            github: profile.github || '',
            twitter: profile.twitter || '',
            showContactInfo: profile.showContactInfo !== undefined ? profile.showContactInfo : true,
            profileVisibility: profile.profileVisibility || 'public'
          });

          if (profile.profileImage) {
            setPreviewImage(profile.profileImage);
          }
        }
        
        // Load notification settings from localStorage
        const savedNotifications = localStorage.getItem('notificationSettings');
        if (savedNotifications) {
          setNotificationSettings(JSON.parse(savedNotifications));
        }
        
        // Load appearance settings from localStorage
        const savedAppearance = localStorage.getItem('appearanceSettings');
        if (savedAppearance) {
          setAppearanceSettings(JSON.parse(savedAppearance));
        }
        
        // Load privacy settings from localStorage
        const savedPrivacy = localStorage.getItem('privacySettings');
        if (savedPrivacy) {
          setPrivacySettings(JSON.parse(savedPrivacy));
        }
        
        // Load data settings from localStorage
        const savedData = localStorage.getItem('dataSettings');
        if (savedData) {
          setDataSettings(JSON.parse(savedData));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Failed to load settings. Using default values.');
        setLoading(false);
      }
    };
    
    loadUserSettings();
  }, [profile]);
  
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      const userProfileData = {
        ...profileForm,
        profileImage: previewImage
      };
      
      localStorage.setItem('userProfile', JSON.stringify(userProfileData));
      
      // Update user context
      updateUser({
        ...profile,
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        bio: profileForm.bio,
        location: profileForm.location,
        website: profileForm.website,
        linkedin: profileForm.linkedin,
        github: profileForm.github,
        twitter: profileForm.twitter,
        showContactInfo: profileForm.showContactInfo,
        profileVisibility: profileForm.profileVisibility,
        profileImage: previewImage
      });
      
      setSnackbarMessage('Profile updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Try API call if available
      try {
        await apiEndpoints.settings.updateProfile(profile?.id, profileForm);
      } catch (apiErr) {
        console.log('API not available, using local storage only');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setSnackbarMessage('Failed to update profile. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbarMessage('New passwords do not match');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    setSaving(true);
    try {
      // Store password change in localStorage for demo
      localStorage.setItem('passwordChanged', new Date().toISOString());
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSnackbarMessage('Password changed successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Try API call if available
      try {
        await apiEndpoints.settings.changePassword(profile?.id, {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        });
      } catch (apiErr) {
        console.log('API not available, using local storage only');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setSnackbarMessage('Failed to change password. Please check your current password.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
      
      setSnackbarMessage('Notification settings updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Try API call if available
      try {
        await apiEndpoints.settings.updateNotificationSettings(profile?.id, notificationSettings);
      } catch (apiErr) {
        console.log('API not available, using local storage only');
      }
    } catch (err) {
      console.error('Error saving notification settings:', err);
      setSnackbarMessage('Failed to update notification settings');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveAppearance = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
      
      // Apply appearance changes immediately
      document.documentElement.setAttribute('data-theme', 
        appearanceSettings.theme === 'system' 
          ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
          : appearanceSettings.theme
      );
      
      setSnackbarMessage('Appearance settings updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Try API call if available
      try {
        await apiEndpoints.settings.updateAppearanceSettings(profile?.id, appearanceSettings);
      } catch (apiErr) {
        console.log('API not available, using local storage only');
      }
    } catch (err) {
      console.error('Error saving appearance settings:', err);
      setSnackbarMessage('Failed to update appearance settings');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
      
      setSnackbarMessage('Privacy settings updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Try API call if available
      try {
        await apiEndpoints.settings.updatePrivacySettings(profile?.id, privacySettings);
      } catch (apiErr) {
        console.log('API not available, using local storage only');
      }
    } catch (err) {
      console.error('Error saving privacy settings:', err);
      setSnackbarMessage('Failed to update privacy settings');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveDataSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('dataSettings', JSON.stringify(dataSettings));
      
      setSnackbarMessage('Data settings updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Try API call if available
      try {
        await apiEndpoints.settings.updateDataSettings(profile?.id, dataSettings);
      } catch (apiErr) {
        console.log('API not available, using local storage only');
      }
    } catch (err) {
      console.error('Error saving data settings:', err);
      setSnackbarMessage('Failed to update data settings');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (confirmationEmail !== profileForm.email) {
      setSnackbarMessage('Email confirmation does not match your email address');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    setSaving(true);
    try {
      // Clear all localStorage
      localStorage.removeItem('userProfile');
      localStorage.removeItem('notificationSettings');
      localStorage.removeItem('appearanceSettings');
      localStorage.removeItem('privacySettings');
      localStorage.removeItem('dataSettings');
      
      setDeleteAccountOpen(false);
      setSnackbarMessage('Your account has been deleted');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Log the user out
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
      
      // Try API call if available
      try {
        await apiEndpoints.settings.deleteAccount(profile?.id);
      } catch (apiErr) {
        console.log('API not available, using local storage only');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setSnackbarMessage('Failed to delete account. Please try again later.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  const handleExportData = async (format) => {
    try {
      // In local storage mode, just create a JSON file with all user data
      const userData = {
        profile: JSON.parse(localStorage.getItem('userProfile') || '{}'),
        notifications: JSON.parse(localStorage.getItem('notificationSettings') || '{}'),
        appearance: JSON.parse(localStorage.getItem('appearanceSettings') || '{}'),
        privacy: JSON.parse(localStorage.getItem('privacySettings') || '{}'),
        data: JSON.parse(localStorage.getItem('dataSettings') || '{}')
      };
      
      // Create a file and trigger download
      const dataString = format === 'json' 
        ? JSON.stringify(userData, null, 2)
        : Object.entries(userData).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n');
        
      const blob = new Blob([dataString], { type: format === 'json' ? 'application/json' : 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tamkeen_data_export.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportOpen(false);
      setSnackbarMessage(`Data exported successfully as ${format.toUpperCase()}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Try API call if available
      try {
        await apiEndpoints.settings.exportUserData(profile?.id, { format });
      } catch (apiErr) {
        console.log('API not available, using local storage only');
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      setSnackbarMessage('Failed to export data. Please try again later.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setSnackbarMessage('Please select an image file (JPEG, PNG, etc.)');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbarMessage('Image size should be less than 5MB');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          setPreviewImage(reader.result);
        } catch (error) {
          console.error('Error setting preview image:', error);
          setSnackbarMessage('Failed to process image. Please try another.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      };
      reader.onerror = () => {
        setSnackbarMessage('Failed to read image file. Please try another.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUploadProfileImage = async () => {
    if (!profileImage && !previewImage) {
      setSnackbarMessage('Please select an image first');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    setSaving(true);
    try {
      // Get the user's ID
      const userId = profile?.id || 'unknown-user';
      
      // Save the image URL to localStorage and update all relevant storage locations
      try {
        // 1. Update main userProfile
        const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const updatedProfile = {
          ...currentProfile,
          profileImage: previewImage,
          avatar: previewImage
        };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        
        // 2. Update profile_{userId} if it exists
        const profileKey = `profile_${userId}`;
        const userProfileData = JSON.parse(localStorage.getItem(profileKey) || '{}');
        if (userProfileData) {
          userProfileData.avatar = previewImage;
          localStorage.setItem(profileKey, JSON.stringify(userProfileData));
        }
        
        // 3. Update user_data for UAE PASS users
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        if (userData && userData.id) {
          userData.avatar = previewImage;
          localStorage.setItem('user_data', JSON.stringify(userData));
        }
        
        // Update user context with new image using the app's updateUserProfile function
        if (typeof updateUserProfile === 'function') {
          await updateUserProfile({
            id: userId,
            userId: userId,
            avatar: previewImage
          });
        } else {
          // Direct update if updateUserProfile not available
          updateUser({
            ...profile,
            avatar: previewImage,
            profileImage: previewImage
          });
        }
        
        setImageUploadOpen(false);
        setSnackbarMessage('Profile image updated successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Reset states
        setProfileImage(null);
        
        // Try API call if available
        try {
          if (profile?.id && profileImage) {
            const formData = new FormData();
            formData.append('profileImage', profileImage);
            await apiEndpoints.settings.uploadProfileImage(profile.id, formData);
          }
        } catch (apiErr) {
          console.log('API not available, using local storage only', apiErr);
        }
      } catch (storageErr) {
        console.error('Error saving to localStorage:', storageErr);
        throw new Error('Failed to save image to local storage');
      }
    } catch (err) {
      console.error('Error uploading profile image:', err);
      setSnackbarMessage('Failed to upload profile image. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  const renderProfileSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent sx={{ textAlign: 'center' }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <IconButton 
                  size="small" 
                  sx={{ 
                    bgcolor: 'background.paper', 
                    border: `2px solid ${theme.palette.background.paper}` 
                  }}
                  onClick={() => setImageUploadOpen(true)}
                >
                  <Edit fontSize="small" />
                </IconButton>
              }
            >
              <Avatar 
                src={previewImage || profile?.profileImage} 
                alt={profileForm.name} 
                sx={{ width: 100, height: 100, margin: '0 auto' }}
              >
                {profileForm.name?.charAt(0) || <AccountCircle />}
              </Avatar>
            </Badge>
            
            <Typography variant="h6" sx={{ mt: 2 }}>
              {profileForm.name || 'User'}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {profileForm.email}
            </Typography>
            
            <Chip 
              label={`${profile?.role || 'User'}`}
              size="small"
              sx={{ mt: 1 }}
            />
          </CardContent>
          
          <Divider />
          
          <CardActions sx={{ justifyContent: 'center', gap: 1 }}>
            <Button 
              size="small" 
              startIcon={<Dashboard />}
              onClick={() => navigate('/user-profile')}
            >
              View Profile
            </Button>
            
            <Button 
              size="small" 
              startIcon={<Logout />}
              onClick={logout}
            >
              Logout
            </Button>
          </CardActions>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Bio"
                multiline
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Location"
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Social Links
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Website"
                value={profileForm.website}
                onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Link />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                label="LinkedIn"
                value={profileForm.linkedin}
                onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkedIn />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                label="GitHub"
                value={profileForm.github}
                onChange={(e) => setProfileForm({ ...profileForm, github: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GitHub />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                label="Twitter/X"
                value={profileForm.twitter}
                onChange={(e) => setProfileForm({ ...profileForm, twitter: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Twitter />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Privacy
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={profileForm.showContactInfo}
                onChange={(e) => setProfileForm({
                  ...profileForm,
                  showContactInfo: e.target.checked
                })}
              />
            }
            label="Show my contact information to others"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Profile Visibility</InputLabel>
            <Select
              value={profileForm.profileVisibility}
              onChange={(e) => setProfileForm({
                ...profileForm,
                profileVisibility: e.target.value
              })}
              label="Profile Visibility"
            >
              <MenuItem value="public">Public - Anyone can view</MenuItem>
              <MenuItem value="connections">Connections Only</MenuItem>
              <MenuItem value="private">Private - Only me</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSaveProfile}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
            >
              Save Changes
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
  
  const renderSecuritySettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          
          <TextField
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            fullWidth
            margin="normal"
          />
          
          <TextField
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            fullWidth
            margin="normal"
          />
          
          <TextField
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            fullWidth
            margin="normal"
            error={passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== ''}
            helperText={
              passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword !== ''
                ? "Passwords don't match"
                : ''
            }
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
              startIcon={saving ? <CircularProgress size={20} /> : <VpnKey />}
            >
              Update Password
            </Button>
          </Box>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Security
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <Security />
              </ListItemIcon>
              <ListItemText
                primary="Two-Factor Authentication"
                secondary="Add an extra layer of security to your account"
              />
              <Switch
                edge="end"
                onChange={(e) => handleToggleTwoFactor(e.target.checked)}
                checked={privacySettings.twoFactorEnabled || false}
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <VerifiedUser />
              </ListItemIcon>
              <ListItemText
                primary="Login Notifications"
                secondary="Get notified of new logins to your account"
              />
              <Switch
                edge="end"
                onChange={(e) => handleToggleLoginAlerts(e.target.checked)}
                checked={privacySettings.loginAlerts || false}
              />
            </ListItem>
            
            <Divider sx={{ my: 2 }} />
            
            <ListItem>
              <ListItemIcon>
                <Lock color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Account Deletion"
                secondary="Permanently delete your account and all data"
                primaryTypographyProps={{ color: 'error' }}
              />
              <Button
                color="error"
                onClick={() => setDeleteAccountOpen(true)}
                variant="outlined"
                size="small"
              >
                Delete Account
              </Button>
            </ListItem>
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
  
  const renderNotificationSettings = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Notification Preferences
      </Typography>
      
      <FormControlLabel
        control={
          <Switch
            checked={notificationSettings.emailNotifications}
            onChange={(e) => setNotificationSettings({
              ...notificationSettings,
              emailNotifications: e.target.checked
            })}
          />
        }
        label="Receive Email Notifications"
        sx={{ display: 'block', mb: 1 }}
      />
      
      <FormControlLabel
        control={
          <Switch
            checked={notificationSettings.pushNotifications}
            onChange={(e) => setNotificationSettings({
              ...notificationSettings,
              pushNotifications: e.target.checked
            })}
          />
        }
        label="Receive Push Notifications"
        sx={{ display: 'block', mb: 1 }}
      />
      
      {notificationSettings.emailNotifications && (
        <FormControl fullWidth margin="normal" sx={{ maxWidth: 400 }}>
          <InputLabel>Email Frequency</InputLabel>
          <Select
            value={notificationSettings.emailFrequency}
            onChange={(e) => setNotificationSettings({
              ...notificationSettings,
              emailFrequency: e.target.value
            })}
            label="Email Frequency"
          >
            <MenuItem value="immediate">Immediate</MenuItem>
            <MenuItem value="daily">Daily Digest</MenuItem>
            <MenuItem value="weekly">Weekly Digest</MenuItem>
            <MenuItem value="none">No Emails</MenuItem>
          </Select>
        </FormControl>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="subtitle1" gutterBottom>
        Notification Types
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={notificationSettings.notificationTypes.applications}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  notificationTypes: {
                    ...notificationSettings.notificationTypes,
                    applications: e.target.checked
                  }
                })}
              />
            }
            label="Application Updates"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={notificationSettings.notificationTypes.interviews}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  notificationTypes: {
                    ...notificationSettings.notificationTypes,
                    interviews: e.target.checked
                  }
                })}
              />
            }
            label="Interview Reminders"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={notificationSettings.notificationTypes.messages}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  notificationTypes: {
                    ...notificationSettings.notificationTypes,
                    messages: e.target.checked
                  }
                })}
              />
            }
            label="Messages"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={notificationSettings.notificationTypes.jobs}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  notificationTypes: {
                    ...notificationSettings.notificationTypes,
                    jobs: e.target.checked
                  }
                })}
              />
            }
            label="Job Recommendations"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={notificationSettings.notificationTypes.learning}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  notificationTypes: {
                    ...notificationSettings.notificationTypes,
                    learning: e.target.checked
                  }
                })}
              />
            }
            label="Learning Resources"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={notificationSettings.notificationTypes.system}
                onChange={(e) => setNotificationSettings({
                  ...notificationSettings,
                  notificationTypes: {
                    ...notificationSettings.notificationTypes,
                    system: e.target.checked
                  }
                })}
              />
            }
            label="System Notifications"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSaveNotificationSettings}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
        >
          Save Preferences
        </Button>
      </Box>
    </Paper>
  );
  
  const renderAppearanceSettings = () => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Appearance
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Theme</InputLabel>
            <Select
              value={appearanceSettings.theme}
              onChange={(e) => setAppearanceSettings({
                ...appearanceSettings,
                theme: e.target.value
              })}
              label="Theme"
            >
              <MenuItem value="light">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LightMode sx={{ mr: 1 }} /> Light
                </Box>
              </MenuItem>
              <MenuItem value="dark">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DarkMode sx={{ mr: 1 }} /> Dark
                </Box>
              </MenuItem>
              <MenuItem value="system">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Settings sx={{ mr: 1 }} /> System Default
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Language</InputLabel>
            <Select
              value={appearanceSettings.language}
              onChange={(e) => setAppearanceSettings({
                ...appearanceSettings,
                language: e.target.value
              })}
              label="Language"
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ar">Arabic</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="zh">Chinese</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Font Size</InputLabel>
            <Select
              value={appearanceSettings.fontSize}
              onChange={(e) => setAppearanceSettings({
                ...appearanceSettings,
                fontSize: e.target.value
              })}
              label="Font Size"
            >
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                checked={appearanceSettings.compactMode}
                onChange={(e) => setAppearanceSettings({
                  ...appearanceSettings,
                  compactMode: e.target.checked
                })}
              />
            }
            label="Compact Mode"
            sx={{ mt: 2 }}
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSaveAppearanceSettings}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
        >
          Save Preferences
        </Button>
      </Box>
    </Paper>
  );
  
  return (
    <Box sx={{ pb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Account Settings
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <LoadingSpinner message="Loading settings..." />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab icon={<Person />} iconPosition="start" label="Profile" />
              <Tab icon={<Security />} iconPosition="start" label="Security" />
              <Tab icon={<Notifications />} iconPosition="start" label="Notifications" />
              <Tab icon={<Palette />} iconPosition="start" label="Appearance" />
              <Tab icon={<Lock />} iconPosition="start" label="Privacy" />
              <Tab icon={<Backup />} iconPosition="start" label="Data & Backup" />
            </Tabs>
          </Paper>
          
          {activeTab === 0 && renderProfileSettings()}
          {activeTab === 1 && renderSecuritySettings()}
          {activeTab === 2 && renderNotificationSettings()}
          {activeTab === 3 && renderAppearanceSettings()}
          {activeTab === 4 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Privacy Settings
              </Typography>
              {/* Privacy settings content */}
            </Paper>
          )}
          {activeTab === 5 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Data Management
              </Typography>
              {/* Data management content */}
            </Paper>
          )}
        </>
      )}
      
      {/* Profile Image Upload Dialog */}
      <Dialog
        open={imageUploadOpen}
        onClose={() => {
          if (!saving) {
            setImageUploadOpen(false);
            setProfileImage(null);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', my: 2 }}>
            {previewImage ? (
              <Avatar 
                src={previewImage} 
                sx={{ width: 150, height: 150, margin: '0 auto' }}
              />
            ) : (
              <Avatar 
                src={profile?.profileImage} 
                sx={{ width: 150, height: 150, margin: '0 auto' }}
              >
                {profileForm.name?.charAt(0) || <AccountCircle />}
              </Avatar>
            )}
          </Box>
          
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              disabled={saving}
            >
              Choose Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleProfileImageChange}
              />
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Max size: 5MB. Formats: JPG, PNG, GIF
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setImageUploadOpen(false);
              setProfileImage(null);
              setPreviewImage(null);
            }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadProfileImage}
            disabled={saving || (!profileImage && !previewImage)}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Account Dialog */}
      <Dialog
        open={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography color="error">Delete Account</Typography>
        </DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Warning: This action cannot be undone. All your data will be permanently deleted.
          </Typography>
          
          <Typography paragraph>
            Please type your email address to confirm deletion:
          </Typography>
          
          <TextField
            value={confirmationEmail}
            onChange={(e) => setConfirmationEmail(e.target.value)}
            fullWidth
            placeholder={profileForm.email}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAccountOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAccount}
            disabled={confirmationEmail !== profileForm.email || saving}
            startIcon={saving ? <CircularProgress size={20} /> : <Delete />}
          >
            Delete My Account
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Export Data Dialog */}
      <Dialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Your Data</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Download a copy of your data in the following formats:
          </Typography>
          
          <List>
            <ListItem button onClick={() => handleExportData('json')}>
              <ListItemIcon>
                <Description />
              </ListItemIcon>
              <ListItemText primary="JSON Format" secondary="Comprehensive data export" />
            </ListItem>
            
            <ListItem button onClick={() => handleExportData('csv')}>
              <ListItemIcon>
                <Description />
              </ListItemIcon>
              <ListItemText primary="CSV Format" secondary="Spreadsheet-compatible format" />
            </ListItem>
            
            <ListItem button onClick={() => handleExportData('pdf')}>
              <ListItemIcon>
                <Description />
              </ListItemIcon>
              <ListItemText primary="PDF Report" secondary="Human-readable summary" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          severity={snackbarSeverity} 
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;