import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Slide,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BuildIcon from '@mui/icons-material/Build';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { styled } from '@mui/material/styles';

// Transition for the dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Styled components
const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  borderRadius: theme.spacing(1.5),
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  borderRadius: '50%',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  color: theme.palette.primary.main
}));

const ResumeExpertPrompt = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleNavigateToResume = () => {
    navigate('/resume-builder');
    if (onClose) onClose();
  };

  const resumeFeatures = [
    {
      icon: <BuildIcon fontSize="large" />,
      title: 'AI-Powered Resume Analysis',
      description: 'Get instant feedback on your resume with our AI analysis tool'
    },
    {
      icon: <WorkIcon fontSize="large" />,
      title: 'Job-Specific Optimization',
      description: 'Customize your resume for specific job listings and increase your chances'
    },
    {
      icon: <SchoolIcon fontSize="large" />,
      title: 'Skills Enhancement Suggestions',
      description: 'Discover skills that will make your resume stand out to employers'
    },
    {
      icon: <EmojiEventsIcon fontSize="large" />,
      title: 'ATS Compatibility Score',
      description: 'Ensure your resume passes through Applicant Tracking Systems'
    }
  ];

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-labelledby="resume-expert-dialog-title"
      maxWidth="md"
      fullWidth
    >
      <DialogTitle id="resume-expert-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <DescriptionIcon color="primary" sx={{ fontSize: 28, mr: 1.5 }} />
          <Typography variant="h5" component="div" fontWeight="bold">
            Resume Expert
          </Typography>
          <Chip 
            label="AI-Powered" 
            size="small" 
            color="secondary" 
            sx={{ ml: 2 }} 
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Enhance your job search with our AI-powered resume tools
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            Why Complete Your Resume?
          </Typography>
          <Typography variant="body1" paragraph>
            An optimized resume significantly increases your chances of getting noticed by employers and landing your ideal role.
            Our Resume Expert uses advanced AI to help you create a standout resume tailored to your career goals.
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 3 }}>
            {resumeFeatures.map((feature, index) => (
              <FeatureCard elevation={2} key={index}>
                <IconWrapper>
                  {feature.icon}
                </IconWrapper>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </FeatureCard>
            ))}
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            What You'll Get
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <ArrowForwardIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Professional, ATS-friendly resume formats" 
                secondary="Designed for maximum impact and readability" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ArrowForwardIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Content optimization suggestions" 
                secondary="Powerful language improvements for better impact" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ArrowForwardIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Real-time scoring and analysis" 
                secondary="Track your resume's improvement with our scoring system" 
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ArrowForwardIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Tailored recommendations" 
                secondary="Industry-specific advice based on your career goals" 
              />
            </ListItem>
          </List>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          sx={{ borderRadius: 2 }}
        >
          Maybe Later
        </Button>
        <Button 
          onClick={handleNavigateToResume} 
          variant="contained" 
          color="primary"
          sx={{ 
            borderRadius: 2,
            fontWeight: 'bold',
            px: 3
          }}
          endIcon={<ArrowForwardIcon />}
        >
          Build My Resume Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResumeExpertPrompt; 