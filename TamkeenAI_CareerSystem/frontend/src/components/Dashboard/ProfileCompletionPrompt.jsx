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
  Slide
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
  const { profile } = useUser();
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [missingFields, setMissingFields] = useState([]);

  useEffect(() => {
    if (profile) {
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
              Your Profile is {profileCompletion}% Complete
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete your profile to unlock all features and improve job matching
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
          onClick={handleNavigateToProfile} 
          variant="contained" 
          color="primary"
          sx={{ 
            borderRadius: 2,
            fontWeight: 'bold',
            px: 3
          }}
        >
          Complete Profile Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileCompletionPrompt; 