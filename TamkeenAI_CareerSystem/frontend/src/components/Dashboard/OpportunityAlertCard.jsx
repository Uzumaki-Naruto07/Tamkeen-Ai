import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  Avatar,
  Divider,
  Tooltip,
  Stack,
  Link,
  SvgIcon
} from '@mui/material';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LaunchIcon from '@mui/icons-material/Launch';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FlagIcon from '@mui/icons-material/Flag';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

// Styled components
const UrgencyChip = styled(Chip)(({ theme, urgency }) => ({
  fontWeight: 'bold',
  backgroundColor: 
    urgency === 'high' ? theme.palette.error.light :
    urgency === 'medium' ? theme.palette.warning.light :
    theme.palette.info.light,
  color: 
    urgency === 'high' ? theme.palette.error.contrastText :
    urgency === 'medium' ? theme.palette.warning.contrastText :
    theme.palette.info.contrastText,
  '& .MuiChip-icon': {
    color: 'inherit'
  }
}));

// Determine urgency level and text
const getUrgencyInfo = (deadline) => {
  if (!deadline) return { level: 'low', text: 'No deadline' };
  
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 2) return { level: 'high', text: `Closes in ${diffDays} day${diffDays !== 1 ? 's' : ''}` };
  if (diffDays <= 5) return { level: 'medium', text: `Closes in ${diffDays} days` };
  if (diffDays <= 14) return { level: 'low', text: `Closes in ${diffDays} days` };
  
  return { level: 'low', text: `Deadline: ${deadlineDate.toLocaleDateString()}` };
};

// Get match confidence level
const getMatchLevel = (matchPercentage) => {
  if (matchPercentage >= 80) return 'success';
  if (matchPercentage >= 60) return 'primary';
  return 'default';
};

// Add the AEDIcon component
const AEDIcon = (props) => (
  <SvgIcon {...props}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="12" fontWeight="bold">AED</text>
  </SvgIcon>
);

const OpportunityAlertCard = ({ opportunity, onSave, onApply, onDismiss }) => {
  // Handle the case where opportunity is undefined
  if (!opportunity) {
    return (
      <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
        <Typography variant="body1">No opportunity data available</Typography>
      </Card>
    );
  }
  
  const [saved, setSaved] = useState(opportunity.saved || false);
  
  const {
    id,
    title,
    company,
    location,
    salary,
    type,
    matchPercentage,
    deadline,
    logo,
    applyUrl,
    description,
    requirements = [],
    relevantSkills = [],
    source
  } = opportunity;
  
  const urgencyInfo = getUrgencyInfo(deadline);
  
  // Handle saving the opportunity
  const handleSave = () => {
    setSaved(!saved);
    if (onSave) {
      onSave(id, !saved);
    }
  };
  
  // Handle applying to the opportunity
  const handleApply = () => {
    if (onApply) {
      onApply(id);
    }
    window.open(applyUrl, '_blank');
  };
  
  // Handle dismissing the opportunity
  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss(id);
    }
  };
  
  return (
    <Card variant="outlined" sx={{ mb: 2, position: 'relative', overflow: 'visible' }}>
      {/* Urgency flag in corner */}
      {urgencyInfo.level === 'high' && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -12, 
            right: 20, 
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <NotificationsActiveIcon 
            color="error" 
            sx={{ 
              fontSize: 24,
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 }
              }
            }} 
          />
        </Box>
      )}
      
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Company logo and job title */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={logo} 
              alt={company}
              sx={{ width: 56, height: 56, mr: 2 }}
            >
              {company.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {company}
              </Typography>
            </Box>
          </Box>
          
          {/* Match percentage */}
          <Box sx={{ textAlign: 'right' }}>
            <Chip 
              label={`${matchPercentage}% Match`} 
              color={getMatchLevel(matchPercentage)} 
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" display="block" color="text.secondary">
              via {source}
            </Typography>
          </Box>
        </Box>
        
        {/* Job details */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ mt: 2, flexWrap: 'wrap' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2">{location}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2">{type}</Typography>
          </Box>
          
          {salary && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <AEDIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                {salary}
              </Typography>
            </Box>
          )}
          
          {/* Urgency tag */}
          <UrgencyChip
            icon={<AccessTimeIcon />}
            label={urgencyInfo.text}
            size="small"
            urgency={urgencyInfo.level}
          />
        </Stack>
        
        {/* Job description */}
        <Typography variant="body2" sx={{ mt: 2 }}>
          {description}
        </Typography>
        
        {/* Relevant skills */}
        {relevantSkills.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Matching skills:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {relevantSkills.map((skill, index) => (
                <Chip 
                  key={index} 
                  label={skill} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
      
      <Divider />
      
      {/* Action buttons */}
      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Tooltip title={saved ? "Remove from saved" : "Save for later"}>
            <IconButton 
              onClick={handleSave} 
              color={saved ? "primary" : "default"}
              aria-label={saved ? "unsave opportunity" : "save opportunity"}
            >
              {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Dismiss">
            <IconButton 
              onClick={handleDismiss}
              aria-label="dismiss opportunity"
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<LaunchIcon />}
          onClick={handleApply}
        >
          Apply Now
        </Button>
      </CardActions>
    </Card>
  );
};

export default OpportunityAlertCard;
