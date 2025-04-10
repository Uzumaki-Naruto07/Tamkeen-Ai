import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Grid, Card, CardContent, Avatar, IconButton,
  List, ListItem, ListItemText, ListItemIcon, Chip,
  CircularProgress, Alert, Tabs, Tab, Badge,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, MenuItem, InputAdornment, Switch, FormControlLabel,
  LinearProgress, Rating, Tooltip, Snackbar, Checkbox,
  Container, Link
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
  // Get token without triggering UI updates
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Don't display "Verifying authentication" for profile updates
  if (config.url?.includes('/profile') || config.url?.includes('/avatar')) {
    config.silentAuth = true;
  }
  
  return config;
});

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [editMode, setEditMode] = useState(false); // Changed from true to false to show profile info first
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
  const [socialLinkDialogOpen, setSocialLinkDialogOpen] = useState(false);
  const [currentSocialLink, setCurrentSocialLink] = useState({type: '', url: ''});
  
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
            
            // Try to load from localStorage first for persistence
            const savedProfile = localStorage.getItem(`profile_${mockUserId}`);
            let otherUserProfile;
            
            if (savedProfile) {
              try {
                otherUserProfile = JSON.parse(savedProfile);
                console.log('DEV MODE: Loaded profile from localStorage:', otherUserProfile);
                
                // Also load education and experience data if available
                if (otherUserProfile.education && Array.isArray(otherUserProfile.education)) {
                  console.log('DEV MODE: Loading education data from localStorage:', otherUserProfile.education);
                  setEducation(otherUserProfile.education);
                }
                
                if (otherUserProfile.experiences && Array.isArray(otherUserProfile.experiences)) {
                  console.log('DEV MODE: Loading experience data from localStorage:', otherUserProfile.experiences);
                  setWorkExperience(otherUserProfile.experiences);
                }
                
                if (otherUserProfile.skills && Array.isArray(otherUserProfile.skills)) {
                  console.log('DEV MODE: Loading skills data from localStorage:', otherUserProfile.skills);
                  setSkills(otherUserProfile.skills);
                }
                
              } catch (e) {
                console.warn('Failed to parse saved profile:', e);
              }
            }
            
            // If no saved profile, create a default one
            if (!otherUserProfile) {
              otherUserProfile = {
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
                avatar: null, // Don't auto-generate an avatar
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
            }
            
            setUserProfile(otherUserProfile);
            
            // Set viewing mode for profile fields (not editing)
            setProfileFieldsEdited({
              firstName: otherUserProfile.firstName,
              lastName: otherUserProfile.lastName,
              title: otherUserProfile.title,
              bio: otherUserProfile.bio,
              location: otherUserProfile.location,
              phone: otherUserProfile.phone,
              email: otherUserProfile.email
            });
            
            setProfileVisibility(otherUserProfile.visibility || {
              isPublic: true,
              showEmail: false,
              showPhone: false,
              showEducation: true,
              showExperience: true,
              showSkills: true
            });
            
            setSocialLinks(otherUserProfile.socialLinks || {
              linkedin: '',
              github: '',
              twitter: '',
              portfolio: ''
            });
            
            setProfileUrl(`${window.location.origin}/profile/${otherUserProfile.username}`);
            
            // Empty arrays for other profile data if not loaded above
            if (!otherUserProfile.skills) setSkills([]);
            if (!otherUserProfile.education) setEducation([]);
            if (!otherUserProfile.experiences) setWorkExperience([]);
            
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
            
            // Try to load from localStorage first for persistence
            const savedProfile = localStorage.getItem(`profile_${mockUserId}`);
            let ownUserProfile;
            
            if (savedProfile) {
              try {
                ownUserProfile = JSON.parse(savedProfile);
                console.log('DEV MODE: Loaded own profile from localStorage:', ownUserProfile);
                
                // Also load education and experience data if available
                if (ownUserProfile.education && Array.isArray(ownUserProfile.education)) {
                  console.log('DEV MODE: Loading education data from localStorage:', ownUserProfile.education);
                  setEducation(ownUserProfile.education);
                }
                
                if (ownUserProfile.experiences && Array.isArray(ownUserProfile.experiences)) {
                  console.log('DEV MODE: Loading experience data from localStorage:', ownUserProfile.experiences);
                  setWorkExperience(ownUserProfile.experiences);
                }
                
                if (ownUserProfile.skills && Array.isArray(ownUserProfile.skills)) {
                  console.log('DEV MODE: Loading skills data from localStorage:', ownUserProfile.skills);
                  setSkills(ownUserProfile.skills);
                }
                
              } catch (e) {
                console.warn('Failed to parse saved profile:', e);
              }
            }
            
            // If no saved profile, create a default one
            if (!ownUserProfile) {
              ownUserProfile = {
                id: mockUserId,
                userId: mockUserId,
                username: 'Hessa',
                firstName: 'Hessa',
                lastName: '',
                title: '',
                bio: '',
                location: '',
                phone: '',
                email: '',
                avatar: null, // Don't auto-generate an avatar
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
                },
                education: [],
                experiences: [],
                skills: []
              };
              
              // Save the default profile to localStorage for future use
              if (import.meta.env.DEV) {
                try {
                  localStorage.setItem(`profile_${mockUserId}`, JSON.stringify(ownUserProfile));
                  console.log('DEV MODE: Created and saved default profile to localStorage');
                } catch (err) {
                  console.warn('Failed to save default profile to localStorage:', err);
                }
              }
            }
            
            // Set local state
            setUserProfile(ownUserProfile);
            
            // Also update the App Context with this mock profile to ensure consistency
            if (import.meta.env.DEV && updateUserProfile) {
              console.log("DEV MODE: Syncing mock profile with app context");
              try {
                await updateUserProfile({
                  id: ownUserProfile.id,
                  userId: ownUserProfile.id,
                  username: ownUserProfile.username,
                  firstName: ownUserProfile.firstName,
                  lastName: ownUserProfile.lastName,
                  fullName: ownUserProfile.firstName + (ownUserProfile.lastName ? ` ${ownUserProfile.lastName}` : ''),
                  bio: ownUserProfile.bio,
                  avatar: ownUserProfile.avatar,
                  socialLinks: ownUserProfile.socialLinks
                });
              } catch (err) {
                console.warn("DEV MODE: Couldn't sync with context", err);
              }
            }
            
            // Set profile fields
            setProfileFieldsEdited({
              firstName: ownUserProfile.firstName,
              lastName: ownUserProfile.lastName,
              title: ownUserProfile.title,
              bio: ownUserProfile.bio,
              location: ownUserProfile.location,
              phone: ownUserProfile.phone,
              email: ownUserProfile.email
            });
            
            setProfileVisibility(ownUserProfile.visibility || {
              isPublic: true,
              showEmail: false,
              showPhone: false,
              showEducation: true,
              showExperience: true,
              showSkills: true
            });
            
            setSocialLinks(ownUserProfile.socialLinks || {
              linkedin: '',
              github: '',
              twitter: '',
              portfolio: ''
            });
            
            setProfileUrl(`${window.location.origin}/profile/${ownUserProfile.username || ownUserProfile.id}`);
            
            // Set empty skills, education and work experience if not already loaded
            if (!ownUserProfile.skills) setSkills([]);
            if (!ownUserProfile.education) setEducation([]);
            if (!ownUserProfile.experiences) setWorkExperience([]);
            
            setEditMode(true); // Allow editing for own profile
            setLoading(false);
            return;
          }
          
          setLoading(false);
          return;
        }
        
        // Regular profile loading from server
        // Fetch user profile data
        try {
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
        } catch (err) {
          console.log('User profile API not available, using default data');
          const mockProfile = {
            firstName: userAccountProfile?.firstName || 'User',
            lastName: userAccountProfile?.lastName || '',
            title: userAccountProfile?.title || 'Professional',
            bio: '',
            location: '',
            phone: '',
            email: userAccountProfile?.email || '',
            visibility: {
              isPublic: true,
              showEmail: false,
              showPhone: false,
              showEducation: true,
              showExperience: true,
              showSkills: true
            }
          };
          
          setUserProfile(mockProfile);
          
          // Initialize profile fields with mock data
          setProfileFieldsEdited({
            firstName: mockProfile.firstName,
            lastName: mockProfile.lastName,
            title: mockProfile.title,
            bio: mockProfile.bio,
            location: mockProfile.location,
            phone: mockProfile.phone,
            email: mockProfile.email
          });
          
          // Set profile visibility settings
          setProfileVisibility(mockProfile.visibility);
          
          // Set profile URL
          setProfileUrl(`${window.location.origin}/profile/${userAccountProfile.id}`);
        }
        
        // Fetch additional profile data
        try {
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
          if (profileResponse?.data) {
            setSocialLinks({
              linkedin: profileResponse.data.socialLinks?.linkedin || '',
              github: profileResponse.data.socialLinks?.github || '',
              twitter: profileResponse.data.socialLinks?.twitter || '',
              portfolio: profileResponse.data.socialLinks?.portfolio || ''
            });
          }
        } catch (err) {
          console.log('Profile details APIs not available, using empty data');
          setAchievements([]);
          setSkills([]);
          setEducation([]);
          setWorkExperience([]);
          
          // Set default social links
          setSocialLinks({
            linkedin: '',
            github: '',
            twitter: '',
            portfolio: ''
          });
        }
        
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError(err.message || 'Failed to load user profile data');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserProfile();
  }, [userAccountProfile, params.username, updateUserProfile]);
  
  // Add an initial effect to set up the photo dialog properly
  useEffect(() => {
    // Initialize profileImage with current avatar URL when component mounts
    if (userProfile?.avatar && !profileImage) {
      const avatarUrl = userProfile.avatar;
      if (avatarUrl && !avatarUrl.includes('undefined')) {
        setProfileImage(avatarUrl);
      }
    }
  }, [userProfile?.avatar, profileImage]);

  // Handle profile picture upload button click - without waiting for a file
  const handleProfilePictureClick = () => {
    // Set profile image to current avatar before opening dialog
    if (userProfile?.avatar && !userProfile.avatar.includes('undefined')) {
      setProfileImage(userProfile.avatar);
    }
    setPhotoDialogOpen(true);
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
      // Create full profile data object with all necessary fields
      const profileData = {
        ...profileFieldsEdited,
        visibility: profileVisibility,
        socialLinks: socialLinks
      };
      
      // Add user ID if available
      if (userProfile?.id) {
        profileData.userId = userProfile.id;
        profileData.id = userProfile.id;
      } else if (userAccountProfile?.id) {
        profileData.userId = userAccountProfile.id;
        profileData.id = userAccountProfile.id;
      }
      
      // Add the avatar if it exists
      if (userProfile?.avatar) {
        profileData.avatar = userProfile.avatar;
      } else if (userAccountProfile?.avatar) {
        profileData.avatar = userAccountProfile.avatar;
      }
      
      console.log('Updating profile with data:', profileData);
      
      // Ensure the name is properly formatted
      profileData.fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
      
      // Send update to API
      const response = await apiEndpoints.profiles.updateProfile(profileData);
      console.log('Profile update response:', response);
      
      // Make sure we have the complete updated profile
      const updatedProfile = {
        ...profileData,
        ...response.data
      };
      
      // Update local userProfile state
      setUserProfile(prev => ({
        ...prev,
        ...updatedProfile,
        firstName: profileFieldsEdited.firstName,
        lastName: profileFieldsEdited.lastName,
        fullName: `${profileFieldsEdited.firstName} ${profileFieldsEdited.lastName}`.trim(),
        socialLinks: socialLinks
      }));
      
      // Update AppContext if available
      if (updateUserProfile) {
        try {
          // Ensure we're sending a complete profile update
          const contextProfileUpdate = {
            ...updatedProfile,
            firstName: profileFieldsEdited.firstName,
            lastName: profileFieldsEdited.lastName,
            fullName: `${profileFieldsEdited.firstName} ${profileFieldsEdited.lastName}`.trim(),
            id: profileData.userId || profileData.id,
            userId: profileData.userId || profileData.id,
            socialLinks: socialLinks
          };
          
          await updateUserProfile(contextProfileUpdate);
          console.log('Profile synced with app context successfully', contextProfileUpdate);
          
          // Ensure the local storage is updated in development mode for persistence
          if (import.meta.env.DEV) {
            const userId = profileData.userId || profileData.id;
            // Use the comprehensive sync function
            syncProfileWithLocalStorage(userId, updatedProfile);
          }
        } catch (err) {
          console.warn("Couldn't sync profile with context", err);
        }
      }
      
      // Show success message - ensure this is called
      console.log('Showing success message for profile update');
      setSnackbarMessage('Profile updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Exit edit mode
      setEditMode(false);
      
      // Navigate to the Work Experience tab immediately with minimal delay
      console.log('Navigating to Work Experience tab');
      setTimeout(() => {
        setActiveTab(1); // Tab index 1 should be Work Experience
        console.log('Tab changed to Work Experience');
      }, 300); // Reduced from 1000ms to 300ms for faster transition
      
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile: ' + (err.message || 'Unknown error'));
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to update profile: ' + (err.message || 'Unknown error'));
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  // Save new profile picture
  const handleSaveProfilePicture = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // For development mode, we can create a mock avatar if no file is selected
      if (import.meta.env.DEV) {
        // Get the user ID from the appropriate source
        const devUserId = userProfile?.id || userProfile?.userId || userAccountProfile?.id || 'mock-user-default';
        if (!devUserId) {
          throw new Error('User ID not found');
        }
        
        // In development, create a mock avatar URL if no file is selected
        if (!fileInputRef.current || !fileInputRef.current.files || !fileInputRef.current.files[0]) {
          console.log('DEV MODE: Using mock avatar URL since no file was selected');
          
          // Use a reliable placeholder service or manually set the avatar
          // Instead of relying on external services that might be down
          const avatarUrl = null; // Don't auto-generate an avatar, use letter-based avatar
          
          // Update user profile state
          setUserProfile(prev => ({
            ...prev,
            avatar: avatarUrl
          }));
          
          // Update profile fields edited
          setProfileFieldsEdited(prev => ({
            ...prev,
            avatar: avatarUrl
          }));
          
          // Update in the main app context if available
          if (updateUserProfile) {
            try {
              const contextUpdate = {
                id: devUserId,
                userId: devUserId,
                avatar: avatarUrl
              };
              
              // Add name fields if we have them
              if (userProfile?.firstName && userProfile?.lastName) {
                contextUpdate.firstName = userProfile.firstName;
                contextUpdate.lastName = userProfile.lastName;
                contextUpdate.fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim();
              } else if (userAccountProfile?.fullName) {
                contextUpdate.fullName = userAccountProfile.fullName;
              }
              
              console.log('DEV MODE: Updating profile with cleared avatar:', contextUpdate);
              await updateUserProfile(contextUpdate);
              console.log('DEV MODE: Profile updated in context with cleared avatar');
            } catch (err) {
              console.warn("Couldn't sync avatar with context", err);
            }
          }
          
          // Use the utility function to sync avatar across all localStorage locations
          syncAvatarInLocalStorage(devUserId, avatarUrl);
          
          // Close dialog and show success message
          setPhotoDialogOpen(false);
          setSnackbarSeverity('success');
          setSnackbarMessage('Profile picture updated successfully');
          setSnackbarOpen(true);
          
          return;
        }
      }
      
      // Handle the case where a file is selected
      const file = fileInputRef.current.files[0];
      if (!file) {
        setSnackbarSeverity('error');
        setSnackbarMessage('No image file selected');
        setSnackbarOpen(true);
        setSaving(false);
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const avatarDataUrl = e.target.result;
        
        // Get user ID for the API call
        const userId = userProfile?.id || userProfile?.userId || userAccountProfile?.id;
        
        if (!userId) {
          throw new Error('User ID not found');
        }
        
        try {
          // Update local state
          setUserProfile(prev => ({
            ...prev,
            avatar: avatarDataUrl
          }));
          
          // Update in development mode - use comprehensive sync function to ensure all profile data is kept
          if (import.meta.env.DEV) {
            const currentProfile = {
              ...userProfile,
              avatar: avatarDataUrl
            };
            syncProfileWithLocalStorage(userId, currentProfile);
          } else {
            // Just sync the avatar in production mode
            syncAvatarInLocalStorage(userId, avatarDataUrl);
          }
          
          // Update in the main app context if available
          if (updateUserProfile) {
            try {
              const contextUpdate = {
                id: userId,
                userId: userId,
                avatar: avatarDataUrl
              };
              
              console.log('Updating profile context with new avatar');
              await updateUserProfile(contextUpdate);
              console.log('Profile context updated successfully with new avatar');
            } catch (err) {
              console.warn("Couldn't sync avatar with context", err);
            }
          }
          
          // Try API call if available
          try {
            // Create FormData with selected image
            const formData = new FormData();
            formData.append('avatar', file);
            
            console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
            
            // Upload avatar using the API
            const apiResponse = await apiEndpoints.profiles.uploadAvatar(userId, formData);
            console.log('Avatar upload response:', apiResponse);
          } catch (apiErr) {
            console.log('API not available or error occurred, using localStorage only', apiErr);
          }
          
          // Close dialog and show success message
          setPhotoDialogOpen(false);
          
          setTimeout(() => {
            console.log('Showing success message for profile picture update');
            setSnackbarSeverity('success');
            setSnackbarMessage('Profile picture updated successfully');
            setSnackbarOpen(true);
          }, 100);
          
        } finally {
          setSaving(false);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        setSaving(false);
        setSnackbarSeverity('error');
        setSnackbarMessage('Failed to read image file. Please try another.');
        setSnackbarOpen(true);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error saving profile picture:', err);
      setSnackbarSeverity('error');
      setSnackbarMessage('Failed to upload profile picture: ' + (err.message || 'Unknown error'));
      setSnackbarOpen(true);
      setSaving(false);
    }
  };
  
  // Show snackbar message
  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };
  
  // Open social link dialog
  const handleOpenSocialLinkDialog = (type) => {
    setCurrentSocialLink({
      type,
      url: socialLinks[type] || ''
    });
    setSocialLinkDialogOpen(true);
  };
  
  // Save social link
  const handleSaveSocialLink = async () => {
    setSaving(true);
    
    try {
      // Validate URL if not empty
      if (currentSocialLink.url && !currentSocialLink.url.startsWith('http')) {
        // Add https:// prefix if missing
        currentSocialLink.url = `https://${currentSocialLink.url}`;
      }
      
      // Update socialLinks state
      const updatedSocialLinks = {
        ...socialLinks,
        [currentSocialLink.type]: currentSocialLink.url
      };
      
      setSocialLinks(updatedSocialLinks);
      
      // Update in localStorage for development mode
      if (import.meta.env.DEV && userProfile?.id) {
        // Use the comprehensive sync function
        const currentProfile = {
          ...userProfile,
          socialLinks: updatedSocialLinks
        };
        syncProfileWithLocalStorage(userProfile.id, currentProfile);
      }
      
      // Show success message
      setSnackbarMessage('Social link updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error saving social link:', err);
      setSnackbarMessage('Failed to update social link');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
      setSocialLinkDialogOpen(false);
    }
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
                  src={userProfile?.avatar && !userProfile.avatar.includes('undefined') ? userProfile.avatar : undefined}
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
                    onClick={handleProfilePictureClick}
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
                onClick={() => {
                  // Trigger save with better visibility and immediate redirection
                  handleSaveProfile();
                  // Force a snackbar open regardless of API response
                  setTimeout(() => {
                    setSnackbarMessage('Profile updated successfully');
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                    // Force navigation to Work Experience tab
                    setActiveTab(1);
                  }, 100);
                }}
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
                    src={userProfile?.avatar && !userProfile.avatar.includes('undefined') ? userProfile.avatar : undefined}
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
                    color="primary"
                    startIcon={<Edit />}
                    onClick={() => setEditMode(true)}
                    sx={{ 
                      ml: 2, 
                      fontWeight: 'bold',
                      display: userAccountProfile?.id && !editMode ? 'flex' : 'none' 
                    }}
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
                        onChange={(e) => handleVisibilityChange('showEmail', e.target.checked)}
                        size="small"
                      />
                      <Tooltip title={profileVisibility.showEmail ? 'Public' : 'Private'}>
                        <Typography variant="caption" color="text.secondary">
                          {profileVisibility.showEmail ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                        </Typography>
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
                        onChange={(e) => handleVisibilityChange('showPhone', e.target.checked)}
                        size="small"
                      />
                      <Tooltip title={profileVisibility.showPhone ? 'Public' : 'Private'}>
                        <Typography variant="caption" color="text.secondary">
                          {profileVisibility.showPhone ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                        </Typography>
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
                        secondary={
                          socialLinks.linkedin ? (
                            <Link 
                              href={socialLinks.linkedin.startsWith('http') ? socialLinks.linkedin : `https://${socialLinks.linkedin}`} 
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                            >
                              {socialLinks.linkedin}
                            </Link>
                          ) : 'Not connected'
                        }
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenSocialLinkDialog('linkedin')}
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
                        secondary={
                          socialLinks.github ? (
                            <Link 
                              href={socialLinks.github.startsWith('http') ? socialLinks.github : `https://${socialLinks.github}`} 
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                            >
                              {socialLinks.github}
                            </Link>
                          ) : 'Not connected'
                        }
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenSocialLinkDialog('github')}
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
                        secondary={
                          socialLinks.twitter ? (
                            <Link 
                              href={socialLinks.twitter.startsWith('http') ? socialLinks.twitter : `https://${socialLinks.twitter}`} 
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                            >
                              {socialLinks.twitter}
                            </Link>
                          ) : 'Not connected'
                        }
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenSocialLinkDialog('twitter')}
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
                        secondary={
                          socialLinks.portfolio ? (
                            <Link 
                              href={socialLinks.portfolio.startsWith('http') ? socialLinks.portfolio : `https://${socialLinks.portfolio}`} 
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                            >
                              {socialLinks.portfolio}
                            </Link>
                          ) : 'Not added'
                        }
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenSocialLinkDialog('portfolio')}
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
                              // Delete from API or from local state
                              if (import.meta.env.DEV) {
                                console.log('DEV MODE: Deleting experience', exp.id);
                                // Just update state
                                setWorkExperience(experience.filter(e => e.id !== exp.id));
                                
                                // Update localStorage in dev mode for persistence
                                if (userProfile?.id) {
                                  try {
                                    // Get existing profile to update
                                    const savedProfileJSON = localStorage.getItem(`profile_${userProfile.id}`);
                                    if (savedProfileJSON) {
                                      const savedProfile = JSON.parse(savedProfileJSON);
                                      
                                      // Update the experiences
                                      const updatedProfile = {
                                        ...savedProfile,
                                        experiences: (savedProfile.experiences || experience).filter(e => e.id !== exp.id)
                                      };
                                      
                                      // Save back to localStorage
                                      localStorage.setItem(`profile_${userProfile.id}`, JSON.stringify(updatedProfile));
                                      console.log('DEV MODE: Updated profile in localStorage after experience deletion');
                                    }
                                  } catch (err) {
                                    console.warn('Failed to update experiences in localStorage:', err);
                                  }
                                }
                              } else {
                                // Production mode - call API
                                await apiEndpoints.profiles.deleteExperience(userAccountProfile.id, exp.id);
                                setWorkExperience(experience.filter(e => e.id !== exp.id));
                              }
                              
                              // Show success message
                              setSnackbarMessage('Experience deleted successfully');
                              setSnackbarOpen(true);
                            } catch (err) {
                              console.error('Error deleting experience:', err);
                              setError('Failed to delete experience');
                              setSnackbarMessage('Failed to delete experience');
                              setSnackbarSeverity('error');
                              setSnackbarOpen(true);
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
                              // Delete from API or from local state
                              if (import.meta.env.DEV) {
                                console.log('DEV MODE: Deleting education', edu.id);
                                // Just update state
                                setEducation(education.filter(e => e.id !== edu.id));
                                
                                // Update localStorage in dev mode for persistence
                                if (userProfile?.id) {
                                  try {
                                    // Get existing profile to update
                                    const savedProfileJSON = localStorage.getItem(`profile_${userProfile.id}`);
                                    if (savedProfileJSON) {
                                      const savedProfile = JSON.parse(savedProfileJSON);
                                      
                                      // Update the education entries
                                      const updatedProfile = {
                                        ...savedProfile,
                                        education: (savedProfile.education || education).filter(e => e.id !== edu.id)
                                      };
                                      
                                      // Save back to localStorage
                                      localStorage.setItem(`profile_${userProfile.id}`, JSON.stringify(updatedProfile));
                                      console.log('DEV MODE: Updated profile in localStorage after education deletion');
                                    }
                                  } catch (err) {
                                    console.warn('Failed to update education in localStorage:', err);
                                  }
                                }
                              } else {
                                // Production mode - call API
                                await apiEndpoints.profiles.deleteEducation(userAccountProfile.id, edu.id);
                                setEducation(education.filter(e => e.id !== edu.id));
                              }
                              
                              // Show success message
                              setSnackbarMessage('Education deleted successfully');
                              setSnackbarOpen(true);
                            } catch (err) {
                              console.error('Error deleting education:', err);
                              setError('Failed to delete education');
                              setSnackbarMessage('Failed to delete education');
                              setSnackbarSeverity('error');
                              setSnackbarOpen(true);
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
                    onChange={(e) => handleVisibilityChange('isPublic', e.target.checked)}
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
          
          let updatedEducationList;
          
          if (currentEducation) {
            // Update existing education
            updatedEducationList = education.map(edu => 
              edu.id === currentEducation.id ? newEducation : edu
            );
            setEducation(updatedEducationList);
          } else {
            // Add new education
            updatedEducationList = [...education, newEducation];
            setEducation(updatedEducationList);
          }
          
          // Update localStorage in dev mode for persistence
          if (userProfile?.id) {
            try {
              // Get existing profile to update
              const savedProfileJSON = localStorage.getItem(`profile_${userProfile.id}`);
              if (savedProfileJSON) {
                const savedProfile = JSON.parse(savedProfileJSON);
                
                // Update the education list
                const updatedProfile = {
                  ...savedProfile,
                  education: updatedEducationList
                };
                
                // Save back to localStorage
                localStorage.setItem(`profile_${userProfile.id}`, JSON.stringify(updatedProfile));
                console.log('DEV MODE: Updated profile in localStorage after education save:', updatedProfile.education);
              }
            } catch (err) {
              console.warn('Failed to update education in localStorage:', err);
            }
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
          
          let updatedExperienceList;
          
          if (currentExperience) {
            // Update existing experience
            updatedExperienceList = experience.map(exp => 
              exp.id === currentExperience.id ? newExperience : exp
            );
            setWorkExperience(updatedExperienceList);
          } else {
            // Add new experience
            updatedExperienceList = [...experience, newExperience];
            setWorkExperience(updatedExperienceList);
          }
          
          // Update localStorage in dev mode for persistence
          if (userProfile?.id) {
            try {
              // Get existing profile to update
              const savedProfileJSON = localStorage.getItem(`profile_${userProfile.id}`);
              if (savedProfileJSON) {
                const savedProfile = JSON.parse(savedProfileJSON);
                
                // Update the experience list
                const updatedProfile = {
                  ...savedProfile,
                  experiences: updatedExperienceList
                };
                
                // Save back to localStorage
                localStorage.setItem(`profile_${userProfile.id}`, JSON.stringify(updatedProfile));
                console.log('DEV MODE: Updated profile in localStorage after experience save:', updatedProfile.experiences);
              }
            } catch (err) {
              console.warn('Failed to update experiences in localStorage:', err);
            }
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
            ) : userProfile?.avatar && !userProfile.avatar.includes('undefined') ? (
              <Avatar
                src={userProfile.avatar}
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
              {profileImage ? 'Preview of your new profile picture' : 'No new image selected'}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-upload-dialog"
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePictureUpload}
              />
              <label htmlFor="profile-picture-upload-dialog">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CameraAlt />}
                  size="small"
                >
                  Select New Photo
                </Button>
              </label>
            </Box>
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
  
  // Render social link dialog
  const renderSocialLinkDialog = () => {
    // Get label and placeholder text based on type
    const getLinkInfo = () => {
      switch(currentSocialLink.type) {
        case 'linkedin':
          return {
            label: 'LinkedIn URL',
            placeholder: 'https://linkedin.com/in/yourusername',
            title: 'LinkedIn Profile',
            icon: <LinkedIn />
          };
        case 'github':
          return {
            label: 'GitHub URL',
            placeholder: 'https://github.com/yourusername',
            title: 'GitHub Profile',
            icon: <GitHub />
          };
        case 'twitter':
          return {
            label: 'Twitter URL',
            placeholder: 'https://twitter.com/yourusername',
            title: 'Twitter Profile',
            icon: <Twitter />
          };
        case 'portfolio':
          return {
            label: 'Portfolio URL',
            placeholder: 'https://yourwebsite.com',
            title: 'Portfolio Website',
            icon: <Language />
          };
        default:
          return {
            label: 'URL',
            placeholder: 'https://',
            title: 'Link',
            icon: <LinkIcon />
          };
      }
    };
    
    const linkInfo = getLinkInfo();
    
    return (
      <Dialog 
        open={socialLinkDialogOpen} 
        onClose={() => setSocialLinkDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {linkInfo.icon}
            <Typography variant="h6" sx={{ ml: 1 }}>
              {socialLinks[currentSocialLink.type] ? `Edit ${linkInfo.title}` : `Add ${linkInfo.title}`}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={linkInfo.label}
            placeholder={linkInfo.placeholder}
            value={currentSocialLink.url}
            onChange={(e) => setCurrentSocialLink({...currentSocialLink, url: e.target.value})}
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon />
                </InputAdornment>
              ),
            }}
          />
          {currentSocialLink.url && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {currentSocialLink.url.startsWith('http') ? 
                'Valid URL format' : 
                'URL will be prefixed with https:// if needed'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          {socialLinks[currentSocialLink.type] && (
            <Button 
              color="error" 
              onClick={() => {
                // Remove the social link
                const updatedSocialLinks = {...socialLinks};
                updatedSocialLinks[currentSocialLink.type] = '';
                setSocialLinks(updatedSocialLinks);
                
                // Update in localStorage for development mode
                if (import.meta.env.DEV && userProfile?.id) {
                  // Use comprehensive sync function
                  const currentProfile = {
                    ...userProfile,
                    socialLinks: updatedSocialLinks
                  };
                  syncProfileWithLocalStorage(userProfile.id, currentProfile);
                }
                
                setSocialLinkDialogOpen(false);
                setSnackbarMessage('Social link removed');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
              }}
              startIcon={<Delete />}
            >
              Remove
            </Button>
          )}
          <Button onClick={() => setSocialLinkDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveSocialLink}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save'}
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

  // Handle visibility setting changes
  const handleVisibilityChange = (setting, value) => {
    // Update the state
    const updatedVisibility = {
      ...profileVisibility,
      [setting]: value
    };
    setProfileVisibility(updatedVisibility);
    
    // Save to localStorage in development mode for persistence
    if (import.meta.env.DEV && userProfile?.id) {
      try {
        // Get existing profile to update
        const savedProfileJSON = localStorage.getItem(`profile_${userProfile.id}`);
        if (savedProfileJSON) {
          const savedProfile = JSON.parse(savedProfileJSON);
          
          // Update the visibility settings
          const updatedProfile = {
            ...savedProfile,
            visibility: updatedVisibility
          };
          
          // Save back to localStorage
          localStorage.setItem(`profile_${userProfile.id}`, JSON.stringify(updatedProfile));
          console.log(`DEV MODE: Updated visibility setting ${setting} to ${value} in localStorage`);
          
          // Show feedback toast
          setSnackbarMessage('Visibility setting updated');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        }
      } catch (err) {
        console.warn('Failed to update visibility settings in localStorage:', err);
      }
    }
  };

  // Utility function to sync avatar across all localStorage locations
  const syncAvatarInLocalStorage = (userId, avatarUrl) => {
    console.log('Syncing avatar in localStorage for user:', userId);
    
    // List of all possible localStorage keys containing user avatar
    const storageKeys = [
      // User-specific profile
      `profile_${userId}`,
      // Main user data
      'user',
      // App context user profile
      'userProfile',
      // Auth user
      'authUser',
      // UAE PASS user data (if applicable)
      'user_data',
      // User data for admin users
      'admin_user'
    ];
    
    try {
      storageKeys.forEach(key => {
        try {
          const storedData = localStorage.getItem(key);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            
            // Update avatar in the object
            if (typeof parsedData === 'object' && parsedData !== null) {
              // Update all possible avatar-related fields
              if (key === 'userProfile') {
                parsedData.profileImage = avatarUrl;
                parsedData.avatar = avatarUrl;
              } else {
                parsedData.avatar = avatarUrl;
              }
              
              // Save back to localStorage
              localStorage.setItem(key, JSON.stringify(parsedData));
              console.log(`Updated avatar in localStorage for key: ${key}`);
            }
          }
        } catch (err) {
          console.warn(`Failed to update avatar for key ${key}:`, err);
        }
      });
      
      console.log('Avatar successfully synced across all localStorage locations');
    } catch (mainErr) {
      console.error('Error in syncAvatarInLocalStorage:', mainErr);
    }
  };

  // Utility function to sync entire profile data with localStorage
  const syncProfileWithLocalStorage = (userId, profileData) => {
    if (!import.meta.env.DEV || !userId) return;
    
    console.log('Syncing full profile in localStorage for user:', userId);
    
    try {
      // First, update the main profile object
      const profileKey = `profile_${userId}`;
      
      // Get current stored profile if exists
      let existingProfile = {};
      try {
        const storedProfile = localStorage.getItem(profileKey);
        if (storedProfile) {
          existingProfile = JSON.parse(storedProfile);
        }
      } catch (err) {
        console.warn('Failed to parse existing profile from localStorage:', err);
      }
      
      // Merge with new data, ensuring we don't lose any fields
      const updatedProfile = {
        ...existingProfile,
        ...profileData,
        // Ensure these are explicitly set
        id: userId,
        userId: userId,
        firstName: profileData.firstName || existingProfile.firstName,
        lastName: profileData.lastName || existingProfile.lastName,
        fullName: profileData.fullName || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
        visibility: profileData.visibility || existingProfile.visibility,
        socialLinks: profileData.socialLinks || existingProfile.socialLinks,
        // Keep avatar if present
        avatar: profileData.avatar || existingProfile.avatar
      };
      
      // Save merged profile back to localStorage
      localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
      console.log('DEV MODE: Updated full profile in localStorage:', updatedProfile);
      
      // Also update related localStorage items - user data for UI context
      const contextKeys = ['user', 'userProfile', 'authUser'];
      
      contextKeys.forEach(key => {
        try {
          const storedData = localStorage.getItem(key);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            
            if (typeof parsedData === 'object' && parsedData !== null) {
              // Update with essential profile fields
              const updatedData = {
                ...parsedData,
                firstName: updatedProfile.firstName,
                lastName: updatedProfile.lastName,
                fullName: updatedProfile.fullName,
                avatar: updatedProfile.avatar,
                // Include these if the UI might use them
                title: updatedProfile.title,
                bio: updatedProfile.bio,
                socialLinks: updatedProfile.socialLinks
              };
              
              localStorage.setItem(key, JSON.stringify(updatedData));
              console.log(`DEV MODE: Updated profile data in localStorage for key: ${key}`);
            }
          }
        } catch (err) {
          console.warn(`Failed to update profile for key ${key}:`, err);
        }
      });
      
      console.log('Profile successfully synced across all localStorage locations');
      
      // If avatar exists, also sync it separately to ensure all references are updated
      if (updatedProfile.avatar) {
        syncAvatarInLocalStorage(userId, updatedProfile.avatar);
      }
      
    } catch (mainErr) {
      console.error('Error in syncProfileWithLocalStorage:', mainErr);
    }
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
      {renderSocialLinkDialog()}
      
      {/* Notification Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          zIndex: 10000,
          '& .MuiAlert-filledSuccess': {
            fontSize: '1.1rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          variant="filled"
          sx={{ 
            width: '100%',
            fontWeight: 'medium'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile; 