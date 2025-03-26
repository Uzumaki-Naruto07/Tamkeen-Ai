import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Grid, Card, CardContent, Avatar, IconButton,
  List, ListItem, ListItemText, ListItemIcon, Chip,
  CircularProgress, Alert, Tabs, Tab, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, MenuItem, InputAdornment, Switch, FormControlLabel,
  LinearProgress, Rating, Tooltip
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
  Construction, MenuBook, Apps
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillChip from '../components/SkillChip';
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
  
  return (
    <Box sx={{ py: 3 }}>
      <Paper sx={{ p: 0, mb: 3 }}>
        <Grid container>
          <Grid item xs={12} md={3} sx={{ borderRight: 1, borderColor: 'divider' }}>
            <List component="nav" sx={{ py: 0 }}>
              <ListItem
                button
                selected={activeTab === 0}
                onClick={() => setActiveTab(0)}
              >
                <ListItemIcon>
                  <PersonOutline />
                </ListItemIcon>
                <ListItemText primary="Personal Information" />
              </ListItem>
              
              <ListItem
                button
                selected={activeTab === 1}
                onClick={() => setActiveTab(1)}
              >
                <ListItemIcon>
                  <Work />
                </ListItemIcon>
                <ListItemText primary="Work Experience" />
              </ListItem>
              
              <ListItem
                button
                selected={activeTab === 2}
                onClick={() => setActiveTab(2)}
              >
                <ListItemIcon>
                  <School />
                </ListItemIcon>
                <ListItemText primary="Education" />
              </ListItem>
              
              <ListItem
                button
                selected={activeTab === 3}
                onClick={() => setActiveTab(3)}
              >
                <ListItemIcon>
                  <Psychology />
                </ListItemIcon>
                <ListItemText primary="Skills" />
              </ListItem>
              
              <ListItem
                button
                selected={activeTab === 4}
                onClick={() => setActiveTab(4)}
              >
                <ListItemIcon>
                  <Security />
                </ListItemIcon>
                <ListItemText primary="Account Settings" />
              </ListItem>
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