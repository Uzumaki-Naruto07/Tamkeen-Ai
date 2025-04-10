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
import { useTranslation } from 'react-i18next';

// Transition for the dialog
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Styled components
const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  height: '100%',
  backgroundColor: theme.palette.background.default,
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  width: 64,
  height: 64,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  color: theme.palette.primary.main
}));

const ResumeExpertPrompt = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleNavigateToResume = () => {
    navigate('/resumePage');
    if (onClose) onClose();
  };

  const resumeFeatures = [
    {
      icon: <BuildIcon fontSize="large" />,
      title: t('resumeExpert.aiPoweredAnalysis', 'AI-Powered Resume Analysis'),
      description: t('resumeExpert.instantFeedback', 'Get instant feedback on your resume with our AI analysis tool')
    },
    {
      icon: <WorkIcon fontSize="large" />,
      title: t('resumeExpert.jobSpecificOptimization', 'Job-Specific Optimization'),
      description: t('resumeExpert.customizeResume', 'Customize your resume for specific job listings and increase your chances')
    },
    {
      icon: <SchoolIcon fontSize="large" />,
      title: t('resumeExpert.skillsEnhancement', 'Skills Enhancement Suggestions'),
      description: t('resumeExpert.discoverSkills', 'Discover skills that will make your resume stand out to employers')
    },
    {
      icon: <EmojiEventsIcon fontSize="large" />,
      title: t('resumeExpert.atsCompatibility', 'ATS Compatibility Score'),
      description: t('resumeExpert.ensureResumePasses', 'Ensure your resume passes through Applicant Tracking Systems')
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
            {t('resumeExpert.title', 'Resume Expert')}
          </Typography>
          <Chip 
            label={t('resumeExpert.aiPowered', 'AI-Powered')}
            size="small" 
            color="secondary" 
            sx={{ ml: 2 }} 
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {t('resumeExpert.enhanceJobSearch', 'Enhance your job search with our AI-powered resume tools')}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight="medium">
            {t('resumeExpert.whyComplete', 'Why Complete Your Resume?')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('resumeExpert.optimizedResume', 'An optimized resume significantly increases your chances of getting noticed by employers and landing your ideal role. Our Resume Expert uses advanced AI to help you create a standout resume tailored to your career goals.')}
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
            {t('resumeExpert.whatYouGet', 'What You\'ll Get')}
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <ArrowForwardIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={t('resumeExpert.atsFriendlyFormats', 'Professional, ATS-friendly resume formats')}
                secondary={t('resumeExpert.designedForImpact', 'Designed for maximum impact and readability')}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ArrowForwardIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={t('resumeExpert.contentOptimization', 'Content optimization suggestions')}
                secondary={t('resumeExpert.powerfulLanguage', 'Powerful language improvements for better impact')}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ArrowForwardIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={t('resumeExpert.realtimeScoring', 'Real-time scoring and analysis')}
                secondary={t('resumeExpert.trackImprovement', 'Track your resume\'s improvement with our scoring system')}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ArrowForwardIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={t('resumeExpert.tailoredRecommendations', 'Tailored recommendations')}
                secondary={t('resumeExpert.industrySpecificAdvice', 'Industry-specific advice based on your career goals')}
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
          {t('resumeExpert.maybeLater', 'Maybe Later')}
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
          {t('resumeExpert.buildMyResumeNow', 'Build My Resume Now')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResumeExpertPrompt; 