import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Slide,
  Avatar,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BuildIcon from '@mui/icons-material/Build';
import { styled } from '@mui/material/styles';
import { useUser } from '../../context/AppContext';

// Styled circular progress with label inside
const StyledCircularProgress = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  marginRight: theme.spacing(3),
}));

// Transition for the dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProfileCompletionPrompt = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { profile, user, updateUserProfile } = useUser();
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [saving, setSaving] = useState(false);
  
  // Quick edit fields for immediate update
  const [quickEditValues, setQuickEditValues] = useState({
    lastName: '',
    skills: ''
  });

  // Load profile image from localStorage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        if (parsedProfile.profileImage) {
          setProfileImage(parsedProfile.profileImage);
        }
      }
    } catch (error) {
      console.warn('Failed to load profile image from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      // Initialize quick edit values from profile
      setQuickEditValues({
        lastName: profile.lastName || '',
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : ''
      });
      
      // Calculate profile completion percentage
      const calculateCompletion = () => {
        // Required fields for a complete profile
        const requiredFields = [
          'firstName',
          'lastName',
          'email',
          'skills',
          'education',
          'experience',
          'careerGoals'
        ];
        
        // Count completed fields
        let completedCount = 0;
        requiredFields.forEach(field => {
          if (profile[field] && 
              ((Array.isArray(profile[field]) && profile[field].length > 0) || 
               (typeof profile[field] === 'object' && Object.keys(profile[field]).length > 0) ||
               (typeof profile[field] === 'string' && profile[field].trim() !== ''))) {
            completedCount++;
          }
        });
        
        // Calculate percentage
        const percentage = Math.round((completedCount / requiredFields.length) * 100);
        setProfileCompletion(percentage);
        
        // Determine missing fields
        const missing = requiredFields.filter(field => {
          return !profile[field] || 
                 (Array.isArray(profile[field]) && profile[field].length === 0) || 
                 (typeof profile[field] === 'object' && Object.keys(profile[field]).length === 0) ||
                 (typeof profile[field] === 'string' && profile[field].trim() === '');
        });
        
        setMissingFields(missing);
      };
      
      calculateCompletion();
    }
  }, [profile]);

  const handleNavigateToProfile = () => {
    navigate('/user-profile');
    if (onClose) onClose();
  };
  
  const handleQuickUpdateProfile = async () => {
    if (!quickEditValues.lastName && !quickEditValues.skills) {
      handleNavigateToProfile();
      return;
    }
    
    setSaving(true);
    try {
      // Process skills input (convert from comma-separated string to array)
      const skillsArray = quickEditValues.skills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill !== '');
      
      // Get the user's unique ID - this is critical for maintaining user-specific data
      const userId = user?.id || profile?.id || profile?.userId;
      
      if (!userId) {
        console.error('Cannot update profile: User ID not found');
        throw new Error('User ID not found');
      }
      
      console.log(`Updating profile for user: ${user?.name || profile?.fullName} (ID: ${userId})`);
      
      // Prepare profile update object
      const profileUpdates = {
        ...profile,
        userId: userId,
        id: userId
      };
      
      // Only add fields that have values
      if (quickEditValues.lastName) {
        profileUpdates.lastName = quickEditValues.lastName;
        
        // Update fullName by combining firstName and lastName
        if (profile?.firstName) {
          profileUpdates.fullName = `${profile.firstName} ${quickEditValues.lastName}`.trim();
        }
      }
      
      if (skillsArray.length > 0) {
        profileUpdates.skills = skillsArray;
      }
      
      // Perform the profile update
      console.log('Updating profile with:', profileUpdates);
      
      // 1. First update through context API
      const result = await updateUserProfile(profileUpdates);
      console.log('Profile quick update result:', result);
      
      // 2. Additionally, ensure it's saved in all localStorage locations
      try {
        // Check for UAE PASS user
        const isUaePassUser = () => {
          const token = localStorage.getItem('token');
          const userData = localStorage.getItem('user_data');
          return token === 'mock_uae_pass_token' && !!userData;
        };
        
        // Always update the user-specific profile first
        const profileKey = `profile_${userId}`;
        const storedProfileStr = localStorage.getItem(profileKey);
        
        if (storedProfileStr) {
          try {
            const storedProfile = JSON.parse(storedProfileStr);
            // Update with new values
            if (quickEditValues.lastName) {
              storedProfile.lastName = quickEditValues.lastName;
              if (profile?.firstName) {
                storedProfile.fullName = `${profile.firstName} ${quickEditValues.lastName}`.trim();
              }
            }
            if (skillsArray.length > 0) {
              storedProfile.skills = skillsArray;
            }
            
            // Save back to the user-specific profile location
            localStorage.setItem(profileKey, JSON.stringify(storedProfile));
            console.log(`Updated profile for user ${userId} in localStorage`);
          } catch (err) {
            console.error('Error updating stored profile:', err);
          }
        } else {
          // If no profile exists yet, save the current one
          localStorage.setItem(profileKey, JSON.stringify(profileUpdates));
          console.log(`Created new profile for user ${userId} in localStorage`);
        }
        
        if (isUaePassUser()) {
          // Update user_data for UAE PASS users to maintain name consistency
          const userDataStr = localStorage.getItem('user_data');
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            if (userData && userData.id === userId) {
              // Only update name if fullName was updated
              if (profileUpdates.fullName) {
                userData.name = profileUpdates.fullName;
              }
              localStorage.setItem('user_data', JSON.stringify(userData));
              console.log('Updated user_data in localStorage for UAE PASS user');
            }
          }
          
          // Check if there's a user mapping and update it if needed
          const userMappingsStr = localStorage.getItem('uaepass_user_mappings');
          if (userMappingsStr) {
            try {
              const userMappings = JSON.parse(userMappingsStr);
              // Ensure mapping exists for this user's email
              if (profile?.email) {
                userMappings[profile.email] = userId;
                localStorage.setItem('uaepass_user_mappings', JSON.stringify(userMappings));
              }
            } catch (err) {
              console.warn('Error updating user mappings:', err);
            }
          }
        }
        
        // Update userProfile if it exists (general app-wide profile)
        const userProfileStr = localStorage.getItem('userProfile');
        if (userProfileStr) {
          try {
            const userProfile = JSON.parse(userProfileStr);
            // Update with new values
            if (quickEditValues.lastName) {
              userProfile.lastName = quickEditValues.lastName;
              if (profile?.firstName) {
                userProfile.name = `${profile.firstName} ${quickEditValues.lastName}`.trim();
                userProfile.fullName = userProfile.name;
              }
            }
            if (skillsArray.length > 0) {
              userProfile.skills = skillsArray;
            }
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            console.log('Updated userProfile in localStorage');
          } catch (err) {
            console.error('Error updating userProfile:', err);
          }
        }
      } catch (storageErr) {
        console.warn('Error updating localStorage:', storageErr);
      }
      
      // Close dialog and navigate to full profile
      if (onClose) onClose();
      navigate('/user-profile');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const getFieldIcon = (field) => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return <AccountCircleIcon color="primary" />;
      case 'email':
        return <AccountCircleIcon color="primary" />;
      case 'skills':
        return <BuildIcon color="primary" />;
      case 'education':
        return <SchoolIcon color="primary" />;
      case 'experience':
        return <WorkIcon color="primary" />;
      case 'careerGoals':
        return <AssignmentIcon color="primary" />;
      default:
        return <CheckCircleIcon color="primary" />;
    }
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'firstName':
        return 'First Name';
      case 'lastName':
        return 'Last Name';
      case 'email':
        return 'Email Address';
      case 'skills':
        return 'Professional Skills';
      case 'education':
        return 'Education History';
      case 'experience':
        return 'Work Experience';
      case 'careerGoals':
        return 'Career Goals';
      default:
        return field;
    }
  };
  
  // Show quick edit fields for lastName and skills (most common missing fields)
  const renderQuickEditFields = () => {
    const hasLastName = !missingFields.includes('lastName');
    const hasSkills = !missingFields.includes('skills');
    
    if (hasLastName && hasSkills) return null;
    
    return (
      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Quick Update
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          You can quickly update these important fields now, or go to your profile for complete editing.
        </Alert>
        
        {!hasLastName && (
          <TextField
            label="Last Name"
            fullWidth
            value={quickEditValues.lastName}
            onChange={(e) => setQuickEditValues({...quickEditValues, lastName: e.target.value})}
            margin="normal"
            placeholder="Enter your last name"
          />
        )}
        
        {!hasSkills && (
          <TextField
            label="Professional Skills"
            fullWidth
            value={quickEditValues.skills}
            onChange={(e) => setQuickEditValues({...quickEditValues, skills: e.target.value})}
            margin="normal"
            placeholder="Enter skills separated by commas (e.g. React, JavaScript, Project Management)"
            helperText="Separate multiple skills with commas"
          />
        )}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-labelledby="profile-completion-dialog-title"
      aria-describedby="profile-completion-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="profile-completion-dialog-title">
        <Typography variant="h5" component="div" fontWeight="bold">
          Complete Your Profile
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            src={profileImage || profile?.avatar || (user?.avatar && typeof user.avatar === 'string' ? user.avatar : undefined)}
            sx={{ width: 60, height: 60, mr: 2 }}
          >
            {profile?.firstName ? profile.firstName.charAt(0) : 
             user?.firstName ? user.firstName.charAt(0) : 
             user?.name ? user.name.charAt(0) : 'U'}
          </Avatar>

          <Box>
            <Typography variant="h6" gutterBottom>
              Your Profile is {profileCompletion}% Complete
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete your profile to unlock all features and improve job matching
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <StyledCircularProgress>
            <CircularProgress
              variant="determinate"
              value={profileCompletion}
              size={60}
              thickness={5}
              sx={{
                color: profileCompletion < 30 ? 'error.main' : 
                       profileCompletion < 70 ? 'warning.main' : 'success.main',
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" component="div" fontWeight="bold">
                {`${profileCompletion}%`}
              </Typography>
            </Box>
          </StyledCircularProgress>
          
          <Box>
            <Typography variant="h6" gutterBottom>
              Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profileCompletion < 30 ? 'Just getting started!' : 
               profileCompletion < 70 ? 'Making good progress!' : 
               profileCompletion < 100 ? 'Almost there!' : 'Complete!'}
            </Typography>
          </Box>
        </Box>
        
        {missingFields.length > 0 && (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please complete the following information to enhance your profile:
            </Alert>
            
            <List>
              {missingFields.map((field, index) => (
                <React.Fragment key={field}>
                  <ListItem>
                    <ListItemIcon>
                      {getFieldIcon(field)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={getFieldLabel(field)} 
                      secondary="Required for optimal career matching" 
                    />
                  </ListItem>
                  {index < missingFields.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </>
        )}
        
        {/* Add quick edit fields for last name and skills */}
        {renderQuickEditFields()}
        
        <DialogContentText id="profile-completion-dialog-description" sx={{ mt: 2 }}>
          A complete profile helps us provide more accurate career recommendations and increases your visibility to potential employers.
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          sx={{ borderRadius: 2 }}
        >
          Remind Me Later
        </Button>
        <Button 
          onClick={handleQuickUpdateProfile} 
          variant="contained" 
          color="primary"
          disabled={saving}
          sx={{ 
            borderRadius: 2,
            fontWeight: 'bold',
            px: 3
          }}
          startIcon={saving ? <CircularProgress size={20} /> : null}
        >
          {saving ? 'Updating...' : 'Complete Profile Now'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileCompletionPrompt; 