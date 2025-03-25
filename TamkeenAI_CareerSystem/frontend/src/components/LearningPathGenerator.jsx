import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating
} from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import BookIcon from '@mui/icons-material/Book';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import ArticleIcon from '@mui/icons-material/Article';
import InfoIcon from '@mui/icons-material/Info';
import PaidIcon from '@mui/icons-material/Paid';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PublicIcon from '@mui/icons-material/Public';

const LearningPathGenerator = ({
  currentSkills = [],
  targetSkills = [],
  targetRole = '',
  timeframe = 'medium', // short, medium, long
  preferences = {
    learningStyle: 'balanced', // visual, practical, theoretical, balanced
    resourceType: 'all', // video, course, book, article, all
    difficulty: 'intermediate', // beginner, intermediate, advanced
    budget: 'medium' // free, low, medium, high
  },
  onRefresh,
  onSave,
  loading = false
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [expandedResourceSection, setExpandedResourceSection] = useState(null);
  const [savedResources, setSavedResources] = useState(new Set());

  // Example learning path structure (in real app, this would come from props or API)
  const learningPath = {
    title: `Learning path for ${targetRole || 'your target role'}`,
    description: `A customized learning journey to help you acquire the skills needed for ${targetRole || 'your target role'}.`,
    estimatedTimeWeeks: timeframe === 'short' ? 8 : timeframe === 'medium' ? 16 : 24,
    milestones: [
      {
        id: 1,
        title: "Build Foundation",
        description: "Establish core knowledge and fundamental skills",
        duration: "2-3 weeks",
        skills: targetSkills
          .filter(skill => skill.level === 1)
          .map(skill => skill.name),
        resources: [
          {
            id: 101,
            title: "Introduction to Web Development",
            type: "course",
            provider: "Udemy",
            level: "beginner",
            duration: "12 hours",
            cost: "Low",
            url: "https://www.udemy.com/course/example",
            rating: 4.7,
            reviews: 1245,
            icon: <CastForEducationIcon color="primary" />
          },
          {
            id: 102,
            title: "HTML & CSS Basics",
            type: "video",
            provider: "YouTube",
            level: "beginner",
            duration: "2 hours",
            cost: "Free",
            url: "https://www.youtube.com/watch?v=example",
            rating: 4.5,
            reviews: 987,
            icon: <VideoLibraryIcon color="error" />
          },
          {
            id: 103,
            title: "Web Development Fundamentals",
            type: "book",
            provider: "O'Reilly",
            level: "beginner",
            duration: "~8 hours",
            cost: "Medium",
            url: "https://www.oreilly.com/example",
            rating: 4.2,
            reviews: 325,
            icon: <BookIcon color="secondary" />
          }
        ]
      },
      {
        id: 2,
        title: "Develop Core Skills",
        description: "Master essential skills required for the role",
        duration: "4-6 weeks",
        skills: targetSkills
          .filter(skill => skill.level === 2)
          .map(skill => skill.name),
        resources: [
          {
            id: 201,
            title: "Advanced JavaScript Programming",
            type: "course",
            provider: "Coursera",
            level: "intermediate",
            duration: "20 hours",
            cost: "Medium",
            url: "https://www.coursera.org/example",
            rating: 4.8,
            reviews: 2145,
            icon: <CastForEducationIcon color="primary" />
          },
          {
            id: 202,
            title: "React.js for Beginners",
            type: "video",
            provider: "Frontend Masters",
            level: "intermediate",
            duration: "8 hours",
            cost: "Medium",
            url: "https://frontendmasters.com/example",
            rating: 4.9,
            reviews: 1256,
            icon: <VideoLibraryIcon color="error" />
          }
        ]
      },
      {
        id: 3,
        title: "Specialize & Apply",
        description: "Develop specialized skills and apply through projects",
        duration: "4-8 weeks",
        skills: targetSkills
          .filter(skill => skill.level === 3)
          .map(skill => skill.name),
        resources: [
          {
            id: 301,
            title: "Building Production-Ready Applications",
            type: "course",
            provider: "Pluralsight",
            level: "advanced",
            duration: "16 hours",
            cost: "High",
            url: "https://www.pluralsight.com/example",
            rating: 4.6,
            reviews: 892,
            icon: <CastForEducationIcon color="primary" />
          },
          {
            id: 302,
            title: "Technical Interview Preparation",
            type: "book",
            provider: "Manning",
            level: "advanced",
            duration: "~12 hours",
            cost: "Medium",
            url: "https://www.manning.com/example",
            rating: 4.4,
            reviews: 563,
            icon: <BookIcon color="secondary" />
          }
        ]
      }
    ]
  };

  // Handle saving/bookmarking a resource
  const handleSaveResource = (resourceId) => {
    setSavedResources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  };

  // Toggle accordion for resource details
  const handleToggleResourceAccordion = (resourceId) => {
    setExpandedResourceSection(expandedResourceSection === resourceId ? null : resourceId);
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Generating your personalized learning path...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          We're analyzing your skills and career goals to create the best path forward.
        </Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      {/* Header section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {learningPath.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {learningPath.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarMonthIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2">
            Estimated time to complete: <strong>{learningPath.estimatedTimeWeeks} weeks</strong>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2">
            Learning style: <strong>{preferences.learningStyle}</strong>
          </Typography>
        </Box>
      </Box>
      
      {/* Path stepper */}
      <Stepper activeStep={activeStep} orientation="vertical">
        {learningPath.milestones.map((milestone, index) => (
          <Step key={milestone.id}>
            <StepLabel>
              <Typography variant="subtitle1">{milestone.title}</Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body2" paragraph>
                {milestone.description}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {milestone.duration}
                </Typography>
              </Box>
              
              {milestone.skills && milestone.skills.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Skills you'll develop:
                  </Typography>
                  <Box>
                    {milestone.skills.map((skill, idx) => (
                      <Chip
                        key={idx}
                        label={skill}
                        size="small"
                        icon={<CodeIcon />}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Learning Resources:
              </Typography>
              
              <Box sx={{ mt: 1 }}>
                {milestone.resources.map(resource => (
                  <Accordion
                    key={resource.id}
                    expanded={expandedResourceSection === resource.id}
                    onChange={() => handleToggleResourceAccordion(resource.id)}
                    sx={{ mb: 1 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {savedResources.has(resource.id) && (
                          <BookmarkIcon 
                            color="primary" 
                            fontSize="small" 
                            sx={{ mr: 1 }} 
                          />
                        )}
                        <Typography>{resource.title}</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {resource.icon || <ArticleIcon color="primary" />}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                          <PaidIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {resource.cost}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                          <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {resource.duration}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="body2" paragraph>
                          {resource.description || "This resource will help you develop skills related to this milestone."}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating 
                            value={resource.rating} 
                            precision={0.1} 
                            readOnly 
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({resource.reviews} reviews)
                          </Typography>
                        </Box>
                        
                        {resource.skills && resource.skills.length > 0 && (
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                              Skills covered:
                            </Typography>
                            <Box>
                              {resource.skills.map((skill, idx) => (
                                <Chip 
                                  key={idx} 
                                  label={skill} 
                                  size="small" 
                                  variant="outlined"
                                  icon={<CodeIcon />} 
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Button
                            size="small"
                            startIcon={savedResources.has(resource.id) ? <CheckCircleIcon /> : <BookmarkIcon />}
                            onClick={() => handleSaveResource(resource.id)}
                            color={savedResources.has(resource.id) ? "success" : "primary"}
                          >
                            {savedResources.has(resource.id) ? "Saved" : "Save"}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            endIcon={<PlayArrowIcon />}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Start Learning
                          </Button>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      
      {/* Controls for stepper */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep(prev => prev - 1)}
        >
          Previous Step
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (activeStep < learningPath.milestones.length - 1) {
              setActiveStep(prev => prev + 1);
            }
          }}
          disabled={activeStep === learningPath.milestones.length - 1}
        >
          Next Step
        </Button>
      </Box>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button 
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          sx={{ mr: 1 }}
          disabled={loading}
        >
          Regenerate Path
        </Button>
        <Button 
          variant="outlined"
          startIcon={<DownloadIcon />}
          sx={{ mr: 1 }}
        >
          Download PDF
        </Button>
        <Button 
          variant="contained"
          startIcon={<BookmarkIcon />}
          onClick={() => onSave && onSave(learningPath)}
        >
          Save Learning Path
        </Button>
      </Box>
    </Paper>
  );
};

export default LearningPathGenerator; 