import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon, Switch,
  FormControlLabel, Alert, Snackbar, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Avatar,
  Tabs, Tab, Chip, Tooltip, Badge, InputAdornment,
  RadioGroup, FormControlLabel as MuiFormControlLabel,
  Radio, ListItemButton, Checkbox
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
  Bookmark, AccessTime, Business, Work, Description, Block,
  People, Storage
} from '@mui/icons-material';
import { useUser } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '@mui/material/styles';

// Utility functions for localStorage
const getFromLocalStorage = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error(`Error getting ${key} from localStorage:`, err);
    return null;
  }
};

const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
    return false;
  }
};

// Utility function to synchronize settings with localStorage
const syncSettingsWithLocalStorage = (userId, dataType, data) => {
  if (!userId) userId = 'default-user';
  console.log(`Syncing ${dataType} settings for user:`, userId);
  
  try {
    // Main localStorage key for the specific settings type
    const mainKey = dataType;
    
    // Save to the primary location
    localStorage.setItem(mainKey, JSON.stringify(data));
    
    // Also save to user-specific storage if needed
    const userKey = `${dataType}_${userId}`;
    localStorage.setItem(userKey, JSON.stringify(data));
    
    // If this is profile data, update it across more places
    if (dataType === 'userProfile') {
      // Save to profile_{userId} for consistency with UserProfile component
      const profileKey = `profile_${userId}`;
      
      // Get existing profile if available
      let existingProfile = {};
      try {
        const storedProfile = localStorage.getItem(profileKey);
        if (storedProfile) {
          existingProfile = JSON.parse(storedProfile);
        }
      } catch (err) {
        console.warn(`Failed to parse existing profile from ${profileKey}:`, err);
      }
      
      // If we're updating profile with an image, ensure it's properly synced
      if (data.profileImage || data.avatar) {
        const imageUrl = data.profileImage || data.avatar;
        
        // Update all possible avatar fields
        data.profileImage = imageUrl;
        data.avatar = imageUrl;
        
        // Sync the image across multiple storage locations
        const imageStorageKeys = [
          'user',
          'userProfile',
          'authUser',
          'user_data',
          profileKey
        ];
        
        imageStorageKeys.forEach(key => {
          try {
            const storedData = localStorage.getItem(key);
            if (storedData) {
              const parsedData = JSON.parse(storedData);
              
              if (typeof parsedData === 'object' && parsedData !== null) {
                parsedData.profileImage = imageUrl;
                parsedData.avatar = imageUrl;
                localStorage.setItem(key, JSON.stringify(parsedData));
              }
            }
          } catch (err) {
            console.warn(`Failed to update image in ${key}:`, err);
          }
        });
      }
      
      // Merge with existing profile data to ensure we don't lose any fields
      const updatedProfile = {
        ...existingProfile,
        ...data,
        // Ensure these fields are explicitly set
        id: userId,
        userId: userId
      };
      
      // Save the merged profile
      localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
      
      // Update the shared user object if it exists
      try {
        const userObj = localStorage.getItem('user');
        if (userObj) {
          const parsedUser = JSON.parse(userObj);
          
          // Only update specific fields to avoid overwriting important data
          const updatedUser = {
            ...parsedUser,
            name: data.name,
            email: data.email,
            profileImage: data.profileImage || data.avatar,
            avatar: data.profileImage || data.avatar,
            // Social links if they exist
            website: data.website,
            linkedin: data.linkedin,
            github: data.github,
            twitter: data.twitter
          };
          
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.warn('Failed to update user object in localStorage:', err);
      }
    }
    
    console.log(`Successfully synced ${dataType} settings to localStorage`);
    return true;
  } catch (err) {
    console.error(`Error syncing ${dataType} settings:`, err);
    return false;
  }
};

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
    allowThirdPartySharing: false,
    twoFactorEnabled: false,
    loginAlerts: false
  });
  
  const [dataSettings, setDataSettings] = useState({
    autoBackup: false,
    backupFrequency: 'weekly'
  });
  
  const [exportOpen, setExportOpen] = useState(false);
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [imageUploadOpen, setImageUploadOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const navigate = useNavigate();
  const { profile, updateUserProfile, logout } = useUser();
  const theme = useTheme();
  
  useEffect(() => {
    const loadUserSettings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const userId = profile?.id || 'default-user';
        
        // Try loading profile from different storage locations in priority order
        let profileData = null;
        
        // Check potential profile storage locations
        const profileStorageKeys = [
          `profile_${userId}`,  // User-specific profile from UserProfile component
          'userProfile',        // Standard profile storage from this component
          'user'                // Main user object from authentication
        ];
        
        // Try each location until we find valid profile data
        for (const key of profileStorageKeys) {
          try {
            const savedData = localStorage.getItem(key);
            if (savedData) {
              const parsedData = JSON.parse(savedData);
              if (parsedData && typeof parsedData === 'object') {
                console.log(`Found profile data in ${key}:`, parsedData);
                profileData = parsedData;
                break;
              }
            }
          } catch (err) {
            console.warn(`Error parsing data from ${key}:`, err);
          }
        }
        
        // If we found profile data, use it
        if (profileData) {
          setProfileForm({
            name: profileData.name || profileData.firstName + ' ' + (profileData.lastName || '') || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            bio: profileData.bio || '',
            location: profileData.location || '',
            website: profileData.website || '',
            linkedin: profileData.linkedin || (profileData.socialLinks?.linkedin || ''),
            github: profileData.github || (profileData.socialLinks?.github || ''),
            twitter: profileData.twitter || (profileData.socialLinks?.twitter || ''),
            showContactInfo: profileData.showContactInfo !== undefined ? profileData.showContactInfo : true,
            profileVisibility: profileData.profileVisibility || (profileData.visibility?.isPublic ? 'public' : 'private') || 'public'
          });

          // Set the profile image if available - check multiple fields
          if (profileData.profileImage || profileData.avatar) {
            setPreviewImage(profileData.profileImage || profileData.avatar);
          }
        } 
        // If no profile data found but we have a profile in context
        else if (profile) {
          setProfileForm({
            name: profile.name || profile.fullName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            bio: profile.bio || '',
            location: profile.location || '',
            website: profile.website || '',
            linkedin: profile.linkedin || (profile.socialLinks?.linkedin || ''),
            github: profile.github || (profile.socialLinks?.github || ''),
            twitter: profile.twitter || (profile.socialLinks?.twitter || ''),
            showContactInfo: profile.showContactInfo !== undefined ? profile.showContactInfo : true,
            profileVisibility: profile.profileVisibility || 'public'
          });

          if (profile.profileImage || profile.avatar) {
            setPreviewImage(profile.profileImage || profile.avatar);
          }
        }
        
        // Load notification settings
        const loadSetting = (settingName, defaultValue) => {
          try {
            // Try user-specific setting first
            const userSpecificKey = `${settingName}_${userId}`;
            let savedSetting = localStorage.getItem(userSpecificKey);
            
            // If not found, try general setting
            if (!savedSetting) {
              savedSetting = localStorage.getItem(settingName);
            }
            
            if (savedSetting) {
              return JSON.parse(savedSetting);
            }
          } catch (err) {
            console.warn(`Failed to parse ${settingName}:`, err);
          }
          return defaultValue;
        };
        
        // Load each type of setting with defaults
        setNotificationSettings(loadSetting('notificationSettings', {
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
          emailFrequency: 'immediate'
        }));
        
        setAppearanceSettings(loadSetting('appearanceSettings', {
          theme: 'system',
          primaryColor: '#1976d2',
          fontSize: 'medium',
          compactMode: false,
          language: 'en'
        }));
        
        setPrivacySettings(loadSetting('privacySettings', {
          profileVisibility: 'public',
          activityVisibility: 'connections',
          searchable: true,
          allowDataCollection: true,
          allowThirdPartySharing: false,
          twoFactorEnabled: false,
          loginAlerts: false
        }));
        
        setDataSettings(loadSetting('dataSettings', {
          autoBackup: false,
          backupFrequency: 'weekly'
        }));
        
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
      // Create complete profile data object
      const userProfileData = {
        ...profileForm,
        profileImage: previewImage,
        avatar: previewImage,
        // Ensure we include all necessary fields
        id: profile?.id,
        userId: profile?.id
      };
      
      // Use the comprehensive sync function
      syncSettingsWithLocalStorage(profile?.id, 'userProfile', userProfileData);
      
      // Update user context if the function exists
      if (typeof updateUserProfile === 'function') {
        try {
          updateUserProfile({
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
            profileImage: previewImage,
            avatar: previewImage
          });
          console.log('Updated user context with new profile data');
        } catch (contextErr) {
          console.warn('Error updating user context:', contextErr);
          // Continue with the operation even if context update fails
        }
      } else {
        console.warn('updateUserProfile is not a function in current context. Skipping context update.');
        // The profile is still saved to localStorage via syncSettingsWithLocalStorage
      }
      
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
      // Save to localStorage using comprehensive function
      syncSettingsWithLocalStorage(profile?.id, 'notificationSettings', notificationSettings);
      
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
  
  const handleSaveNotificationSettings = async () => {
    if (!updateUserProfile) {
      console.warn("updateUserProfile function is not available");
      try {
        // Save to localStorage as fallback
        const userId = getFromLocalStorage('userId');
        if (userId) {
          const userProfile = getFromLocalStorage(`profile_${userId}`) || {};
          saveToLocalStorage(`profile_${userId}`, {
            ...userProfile,
            notificationSettings
          });
          setSnackbarMessage("Notification settings saved locally");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        }
      } catch (err) {
        console.error("Failed to save notification settings locally", err);
        setSnackbarMessage("Failed to save notification settings");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({ notificationSettings });
      setSnackbarMessage("Notification settings updated successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to update notification settings", err);
      setSnackbarMessage("Failed to update notification settings");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  const handleToggleTwoFactor = async () => {
    setPrivacySettings(prev => ({
      ...prev,
      twoFactorEnabled: !prev.twoFactorEnabled
    }));
    
    setSnackbarMessage(`Two-factor authentication ${!privacySettings.twoFactorEnabled ? 'enabled' : 'disabled'}`);
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };
  
  const handleToggleLoginAlerts = async () => {
    setPrivacySettings(prev => ({
      ...prev,
      loginAlerts: !prev.loginAlerts
    }));
    
    setSnackbarMessage(`Login alerts ${!privacySettings.loginAlerts ? 'enabled' : 'disabled'}`);
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };
  
  const handleSaveAppearance = async () => {
    setSaving(true);
    try {
      // Save to localStorage using comprehensive function
      syncSettingsWithLocalStorage(profile?.id, 'appearanceSettings', appearanceSettings);
      
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
  
  const handleSaveAppearanceSettings = async () => {
    if (!updateUserProfile) {
      console.warn("updateUserProfile function is not available");
      try {
        // Save to localStorage as fallback
        const userId = getFromLocalStorage('userId');
        if (userId) {
          const userProfile = getFromLocalStorage(`profile_${userId}`) || {};
          saveToLocalStorage(`profile_${userId}`, {
            ...userProfile,
            appearanceSettings
          });
          setSnackbarMessage("Appearance settings saved locally");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        }
      } catch (err) {
        console.error("Failed to save appearance settings locally", err);
        setSnackbarMessage("Failed to save appearance settings");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({ appearanceSettings });
      setSnackbarMessage("Appearance settings updated successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to update appearance settings", err);
      setSnackbarMessage("Failed to update appearance settings");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  const handleSavePrivacy = async () => {
    if (!updateUserProfile) {
      console.warn("updateUserProfile function is not available");
      try {
        // Save to localStorage as fallback
        const userId = getFromLocalStorage('userId');
        if (userId) {
          const userProfile = getFromLocalStorage(`profile_${userId}`) || {};
          saveToLocalStorage(`profile_${userId}`, {
            ...userProfile,
            privacySettings
          });
          setSnackbarMessage("Privacy settings saved locally");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        }
      } catch (err) {
        console.error("Failed to save privacy settings locally", err);
        setSnackbarMessage("Failed to save privacy settings");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({ privacySettings });
      setSnackbarMessage("Privacy settings updated successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to update privacy settings", err);
      setSnackbarMessage("Failed to update privacy settings");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  const handleSaveDataSettings = async () => {
    if (!updateUserProfile) {
      console.warn("updateUserProfile function is not available");
      try {
        // Save to localStorage as fallback
        const userId = getFromLocalStorage('userId');
        if (userId) {
          const userProfile = getFromLocalStorage(`profile_${userId}`) || {};
          saveToLocalStorage(`profile_${userId}`, {
            ...userProfile,
            dataSettings
          });
          setSnackbarMessage("Data settings saved locally");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        }
      } catch (err) {
        console.error("Failed to save data settings locally", err);
        setSnackbarMessage("Failed to save data settings");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({ dataSettings });
      setSnackbarMessage("Data settings updated successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Failed to update data settings", err);
      setSnackbarMessage("Failed to update data settings");
      setSnackbarSeverity("error");
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
      
      setDeleteAccountConfirm(false);
      setSnackbarMessage('Your account has been deleted');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Log the user out
      setTimeout(() => {
        if (typeof logout === 'function') {
          logout();
        } else {
          console.warn('logout is not a function in current context. Redirecting manually.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
        
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
      
      // Create complete profile data with the image
      const profileData = {
        ...profileForm,
        profileImage: previewImage,
        avatar: previewImage,
        id: userId,
        userId: userId
      };
      
      // Use the comprehensive sync function to save image and update all relevant storage
      syncSettingsWithLocalStorage(userId, 'userProfile', profileData);
      
      // Update user context with new image - check if updateUserProfile is a function first
      if (typeof updateUserProfile === 'function') {
        try {
          updateUserProfile({
            ...profile,
            avatar: previewImage,
            profileImage: previewImage
          });
          console.log('Updated user context with new profile image');
        } catch (contextErr) {
          console.warn('Error updating user context with new image:', contextErr);
          // Continue with the operation even if context update fails
        }
      } else {
        console.warn('updateUserProfile is not a function in current context. Skipping context update.');
        // The image is still saved to localStorage via syncSettingsWithLocalStorage
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
                onClick={() => setDeleteAccountConfirm(true)}
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
  
  const renderPrivacySettings = () => {
    return (
      <Paper elevation={0} className="settings-section" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Privacy Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Profile Visibility
              </Typography>
              <RadioGroup
                value={privacySettings.profileVisibility}
                onChange={(e) => setPrivacySettings(prev => ({
                  ...prev,
                  profileVisibility: e.target.value
                }))}
              >
                <FormControlLabel 
                  value="public" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Public sx={{ mr: 1 }} /> 
                      <Typography>Public - Anyone can view your profile</Typography>
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="connections" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <People sx={{ mr: 1 }} /> 
                      <Typography>Connections Only - Only people you've connected with can view your profile</Typography>
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="private" 
                  control={<Radio />} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Lock sx={{ mr: 1 }} /> 
                      <Typography>Private - Only you can view your profile</Typography>
                    </Box>
                  } 
                />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Activity Visibility
              </Typography>
              <RadioGroup
                value={privacySettings.activityVisibility}
                onChange={(e) => setPrivacySettings(prev => ({
                  ...prev,
                  activityVisibility: e.target.value
                }))}
              >
                <FormControlLabel value="public" control={<Radio />} label="Public - Anyone can see your activity" />
                <FormControlLabel value="connections" control={<Radio />} label="Connections Only - Only your connections can see your activity" />
                <FormControlLabel value="private" control={<Radio />} label="Private - Your activity is only visible to you" />
              </RadioGroup>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Discovery Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.searchable}
                  onChange={(e) => setPrivacySettings(prev => ({
                    ...prev,
                    searchable: e.target.checked
                  }))}
                />
              }
              label="Make my profile searchable"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, mb: 2 }}>
              When enabled, your profile can be found in search results
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Data Collection
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.allowDataCollection}
                  onChange={(e) => setPrivacySettings(prev => ({
                    ...prev,
                    allowDataCollection: e.target.checked
                  }))}
                />
              }
              label="Allow data collection for platform improvement"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, mb: 2 }}>
              We use this information to improve your experience
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={privacySettings.allowThirdPartySharing}
                  onChange={(e) => setPrivacySettings(prev => ({
                    ...prev,
                    allowThirdPartySharing: e.target.checked
                  }))}
                />
              }
              label="Allow sharing data with trusted partners"
            />
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5, mb: 2 }}>
              This helps provide personalized services
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleSavePrivacy}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        </Box>
      </Paper>
    );
  };
  
  const renderDataSettings = () => {
    return (
      <Paper elevation={0} className="settings-section" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Data & Backup Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Automatic Backup
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={dataSettings.autoBackup}
                  onChange={(e) => setDataSettings(prev => ({
                    ...prev,
                    autoBackup: e.target.checked
                  }))}
                />
              }
              label="Enable automatic backup of your data"
            />
            
            {dataSettings.autoBackup && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel id="backup-frequency-label">Backup Frequency</InputLabel>
                <Select
                  labelId="backup-frequency-label"
                  id="backup-frequency"
                  value={dataSettings.backupFrequency}
                  label="Backup Frequency"
                  onChange={(e) => setDataSettings(prev => ({
                    ...prev,
                    backupFrequency: e.target.value
                  }))}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            )}
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Data Export
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Export all your data as a zip file
            </Typography>
            
            <Button
              variant="outlined"
              startIcon={<CloudDownload />}
              onClick={() => setExportOpen(true)}
            >
              Export My Data
            </Button>
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Delete Account
            </Typography>
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              Warning: This action cannot be undone. All your data will be permanently deleted.
            </Typography>
            
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteAccountConfirm(true)}
            >
              Delete My Account
            </Button>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleSaveDataSettings}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Data Settings'}
          </Button>
        </Box>
      </Paper>
    );
  };
  
  return (
    <Box className="settings-page">
      <Box className="settings-container">
        <Paper className="settings-sidebar" elevation={0}>
          <List component="nav">
            <ListItemButton
              selected={activeTab === 0}
              onClick={() => setActiveTab(0)}
            >
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>

            <ListItemButton
              selected={activeTab === 1}
              onClick={() => setActiveTab(1)}
            >
              <ListItemIcon>
                <Security />
              </ListItemIcon>
              <ListItemText primary="Security" />
            </ListItemButton>

            <ListItemButton
              selected={activeTab === 2}
              onClick={() => setActiveTab(2)}
            >
              <ListItemIcon>
                <Notifications />
              </ListItemIcon>
              <ListItemText primary="Notifications" />
            </ListItemButton>

            <ListItemButton
              selected={activeTab === 3}
              onClick={() => setActiveTab(3)}
            >
              <ListItemIcon>
                <Palette />
              </ListItemIcon>
              <ListItemText primary="Appearance" />
            </ListItemButton>

            <ListItemButton
              selected={activeTab === 4}
              onClick={() => setActiveTab(4)}
            >
              <ListItemIcon>
                <Lock />
              </ListItemIcon>
              <ListItemText primary="Privacy" />
            </ListItemButton>

            <ListItemButton
              selected={activeTab === 5}
              onClick={() => setActiveTab(5)}
            >
              <ListItemIcon>
                <Storage />
              </ListItemIcon>
              <ListItemText primary="Data & Backup" />
            </ListItemButton>
          </List>
        </Paper>

        <Box className="settings-content">
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : (
            <>
              {activeTab === 0 && renderProfileSettings()}
              {activeTab === 1 && renderSecuritySettings()}
              {activeTab === 2 && renderNotificationSettings()}
              {activeTab === 3 && renderAppearanceSettings()}
              {activeTab === 4 && renderPrivacySettings()}
              {activeTab === 5 && renderDataSettings()}
            </>
          )}
        </Box>
      </Box>
      
      {/* Confirmation dialogs and snackbars as needed */}
    </Box>
  );
};

export default Settings;