import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Typography, 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  StepContent, 
  Button, 
  IconButton, 
  Tooltip,
  Modal,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import CodeIcon from '@mui/icons-material/Code';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';

const EmiratiJourneyMap = () => {
  const { t } = useTranslation();
  const [activeStep, setActiveStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewType, setViewType] = useState('timeline');

  // Journey steps from Unemployed to AI Engineer
  const journeySteps = [
    {
      label: "Unemployed Graduate",
      description: "Recent computer science graduate seeking opportunities in tech",
      content: "As a recent graduate with a computer science degree, you have foundational knowledge but lack practical experience in the industry.",
      stats: {
        skills: ["Basic Programming", "Computer Science Theory", "Problem Solving"],
        challenges: ["No industry experience", "Limited professional network", "Competitive job market"],
        timeFrame: "0-3 months",
        salary: "N/A"
      },
      icon: <SchoolIcon />
    },
    {
      label: "Skills Development",
      description: "Building practical skills through TamkeenAI personalized learning",
      content: "TamkeenAI analyzes your profile and creates a personalized learning path focusing on Python, data structures, and basic machine learning concepts.",
      stats: {
        skills: ["Python", "Data Structures", "Basic Machine Learning"],
        achievements: ["Completed 5 coding projects", "Earned Python certification", "Built portfolio website"],
        timeFrame: "3-6 months",
        salary: "N/A"
      },
      icon: <CodeIcon />
    },
    {
      label: "Junior Developer",
      description: "First role as a junior developer at a tech company",
      content: "Applied to 15 companies using TamkeenAI's application automation and secured a position as a Junior Developer, getting hands-on experience in a tech environment.",
      stats: {
        skills: ["Frontend Development", "Backend Integration", "Version Control"],
        achievements: ["Contributed to 3 production features", "Improved code efficiency by 15%"],
        timeFrame: "6-18 months",
        salary: "AED 10,000 - 15,000/month"
      },
      icon: <WorkIcon />
    },
    {
      label: "AI Specialization",
      description: "Focused learning on AI and machine learning",
      content: "While working, you dedicated 10 hours weekly to specialize in AI through TamkeenAI's advanced courses and mentorship programs.",
      stats: {
        skills: ["Neural Networks", "Deep Learning", "TensorFlow/PyTorch"],
        achievements: ["Completed advanced AI certification", "Built 2 AI projects for portfolio"],
        timeFrame: "12-24 months",
        salary: "AED 15,000 - 20,000/month"
      },
      icon: <LightbulbIcon />
    },
    {
      label: "AI Engineer",
      description: "Secured position as an AI Engineer at a leading tech company",
      content: "Leveraged the experience and skills gained to transition into a specialized AI Engineer role at a leading UAE tech company.",
      stats: {
        skills: ["AI Model Deployment", "MLOps", "Data Pipeline Architecture"],
        achievements: ["Leading AI projects", "Mentoring junior developers", "Contributing to UAE's tech ecosystem"],
        timeFrame: "24-36 months",
        salary: "AED 25,000 - 40,000/month"
      },
      icon: <EmojiEventsIcon />
    }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleDownloadJourneyMap = () => {
    // In a real implementation, this would generate and download a PDF
    console.log("Downloading journey map...");
  };

  const handleInfoClick = () => {
    // Implementation for handling info icon click
  };

  const handleDownloadClick = () => {
    // Implementation for handling download icon click
  };

  const handleViewTypeChange = (event) => {
    setViewType(event.target.value);
  };

  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardContent sx={{ height: '100%', p: 2, pb: '56px' }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="div">
            {t('emiratiJourneyMap.title', 'Emirati Career Journey')}
          </Typography>
          
          <Box>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 1 }}>
              <InputLabel>{t('emiratiJourneyMap.viewType', 'View Type')}</InputLabel>
              <Select
                value={viewType}
                onChange={handleViewTypeChange}
                label={t('emiratiJourneyMap.viewType', 'View Type')}
              >
                <MenuItem value="timeline">{t('emiratiJourneyMap.timeline', 'Timeline')}</MenuItem>
                <MenuItem value="map">{t('emiratiJourneyMap.map', 'Map')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A data-driven roadmap based on successful Emirati tech professionals
        </Typography>
        
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {journeySteps.map((step, index) => (
              <Step key={index}>
                <StepLabel 
                  StepIconComponent={() => (
                    <motion.div
                      initial={index === activeStep ? { scale: 1 } : { scale: 1 }}
                      animate={index === activeStep ? { scale: 1.2 } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{ color: index === activeStep ? "#1976d2" : "grey" }}
                    >
                      {step.icon}
                    </motion.div>
                  )}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {step.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography sx={{ mb: 2 }}>{step.content}</Typography>
                  
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                            Key Skills
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                            {step.stats.skills.map((skill, i) => (
                              <Chip key={i} label={skill} size="small" />
                            ))}
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
                            {index === 0 ? "Challenges" : "Achievements"}
                          </Typography>
                          <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            {(index === 0 ? step.stats.challenges : step.stats.achievements).map((item, i) => (
                              <Typography key={i} component="li" variant="body2">{item}</Typography>
                            ))}
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }} />
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="body2">
                              <strong>Time Frame:</strong> {step.stats.timeFrame}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Salary Range:</strong> {step.stats.salary}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                  
                  <Box sx={{ mb: 2 }}>
                    <div>
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mr: 1 }}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={index === journeySteps.length - 1 ? handleReset : handleNext}
                        sx={{ mr: 1 }}
                      >
                        {index === journeySteps.length - 1 ? "Reset" : "Continue"}
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        {/* Detailed Journey Modal */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          aria-labelledby="journey-modal-title"
        >
          <Box sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 900,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflow: "auto"
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography id="journey-modal-title" variant="h5" component="h2" sx={{ fontWeight: "bold" }}>
                Emirati Tech Professional Journey Map
              </Typography>
              <IconButton onClick={() => setIsModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Typography variant="subtitle1" paragraph>
              This journey map is based on data collected from successful Emirati professionals in the AI field, showing the most common path from graduation to establishing a career as an AI Engineer.
            </Typography>
            
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Key Journey Insights
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">36 Months</Typography>
                    </Box>
                    <Typography variant="body2">
                      Average time from graduation to AI Engineer position
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <SchoolIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">4 Certifications</Typography>
                    </Box>
                    <Typography variant="body2">
                      Average number of professional certifications obtained
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <WorkIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">2.5 Roles</Typography>
                    </Box>
                    <Typography variant="body2">
                      Average number of job positions before securing AI Engineer role
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Critical Success Factors
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                1. Continuous Learning
              </Typography>
              <Typography variant="body1" paragraph>
                Successful professionals dedicate 8-10 hours weekly to learning new skills even while employed.
              </Typography>
              
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                2. Portfolio Development
              </Typography>
              <Typography variant="body1" paragraph>
                Building practical projects demonstrating AI capabilities is crucial for career advancement.
              </Typography>
              
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                3. Professional Networking
              </Typography>
              <Typography variant="body1" paragraph>
                85% of successful AI Engineers credit professional networking for finding opportunities.
              </Typography>
              
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                4. Mentorship
              </Typography>
              <Typography variant="body1" paragraph>
                Having guidance from experienced professionals significantly accelerates career progression.
              </Typography>
            </Box>
            
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
              <Button variant="outlined" onClick={() => setIsModalOpen(false)}>Close</Button>
              <Button variant="contained" onClick={handleDownloadJourneyMap} startIcon={<DownloadIcon />}>
                Download Journey Map
              </Button>
            </Box>
          </Box>
        </Modal>
      </CardContent>
    </Card>
  );
};

export default EmiratiJourneyMap;