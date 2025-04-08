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

// Mock data for opportunities
const mockOpportunities = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "TechNova Solutions",
    location: "Dubai, UAE",
    salary: "20,000 - 25,000 AED/month",
    type: "Full-time",
    matchPercentage: 92,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    logo: "https://randomuser.me/api/portraits/men/32.jpg",
    applyUrl: "https://example.com/apply",
    description: "Exciting opportunity to work with cutting-edge technologies in a fast-paced environment.",
    requirements: ["3+ years React experience", "Strong TypeScript skills", "UI/UX knowledge"],
    relevantSkills: ["React", "TypeScript", "Material UI", "Frontend Development"],
    source: "LinkedIn"
  },
  {
    id: 2,
    title: "AI Engineer",
    company: "InnovateAI",
    location: "Abu Dhabi, UAE",
    salary: "30,000 - 35,000 AED/month",
    type: "Full-time",
    matchPercentage: 85,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    logo: "https://randomuser.me/api/portraits/women/44.jpg",
    applyUrl: "https://example.com/apply",
    description: "Join our AI team to develop next-generation models for enterprise clients.",
    requirements: ["Experience with ML frameworks", "Python expertise", "Understanding of neural networks"],
    relevantSkills: ["Python", "TensorFlow", "Machine Learning", "Data Science"],
    source: "Indeed"
  },
  {
    id: 3,
    title: "Data Scientist",
    company: "DataFirst Analytics",
    location: "Remote",
    salary: "27,000 - 32,000 AED/month",
    type: "Contract",
    matchPercentage: 78,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    logo: "https://randomuser.me/api/portraits/men/68.jpg",
    applyUrl: "https://example.com/apply",
    description: "Help transform business data into actionable insights for global clients.",
    requirements: ["Statistical analysis", "Data visualization", "SQL proficiency"],
    relevantSkills: ["Python", "SQL", "Tableau", "Statistical Analysis"],
    source: "Glassdoor"
  }
];

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

const OpportunityAlertCard = ({ opportunity, opportunities, onSave, onApply, onDismiss }) => {
  // Use the provided opportunity, or the first one from opportunities array,
  // or fall back to mock data if nothing is provided
  const allOpportunities = opportunities || mockOpportunities;
  const [currentOpportunityIndex, setCurrentOpportunityIndex] = useState(0);
  const currentOpportunity = opportunity || allOpportunities[currentOpportunityIndex];
  
  // Handle the case where no opportunity data is available even after mock data fallback
  if (!currentOpportunity) {
    return (
      <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
        <Typography variant="body1">No opportunity data available</Typography>
      </Card>
    );
  }
  
  const [saved, setSaved] = useState(currentOpportunity.saved || false);
  
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
  } = currentOpportunity;
  
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
    } else {
      // If no dismiss handler is provided, just show the next opportunity
      setCurrentOpportunityIndex((prevIndex) => 
        (prevIndex + 1) % allOpportunities.length
      );
    }
  };
  
  // Function to view next opportunity
  const handleNextOpportunity = () => {
    setCurrentOpportunityIndex((prevIndex) => 
      (prevIndex + 1) % allOpportunities.length
    );
    setSaved(allOpportunities[(currentOpportunityIndex + 1) % allOpportunities.length].saved || false);
  };
  
  // Show a compact version for the dashboard widget view
  const renderCompactView = () => (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <CardContent sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Chip 
            label={`${matchPercentage}% Match`} 
            color={getMatchLevel(matchPercentage)} 
            size="small"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.85rem' }}>
          {company}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.8rem' }} />
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{location}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <WorkIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '0.8rem' }} />
          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{type}</Typography>
        </Box>
        
        <UrgencyChip
          icon={<AccessTimeIcon sx={{ fontSize: '0.8rem' }} />}
          label={urgencyInfo.text}
          size="small"
          urgency={urgencyInfo.level}
          sx={{ fontSize: '0.7rem', mt: 1 }}
        />
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
        <Box>
          <Tooltip title={saved ? "Remove from saved" : "Save for later"}>
            <IconButton 
              onClick={handleSave} 
              color={saved ? "primary" : "default"}
              aria-label={saved ? "unsave opportunity" : "save opportunity"}
              size="small"
            >
              {saved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Next opportunity">
            <IconButton 
              onClick={handleNextOpportunity}
              aria-label="next opportunity"
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Button 
          variant="outlined" 
          color="primary" 
          size="small"
          startIcon={<LaunchIcon fontSize="small" />}
          onClick={handleApply}
          sx={{ textTransform: 'none', fontSize: '0.8rem' }}
        >
          Apply
        </Button>
      </CardActions>
    </Card>
  );
  
  // If we're in the dashboard widget view (restricted height), use compact view
  if (window.location.pathname.includes('dashboard')) {
    return renderCompactView();
  }
  
  // Otherwise, return the full detailed view
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
