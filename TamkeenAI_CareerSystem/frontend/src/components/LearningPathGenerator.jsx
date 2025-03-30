import React, { useState, useEffect } from 'react';
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
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Bookmark,
  School,
  Work,
  ExpandMore,
  Star,
  StarBorder,
  TipsAndUpdates,
  CalendarMonth,
  Person,
  Code,
  CheckCircle,
  Refresh,
  Book,
  VideoLibrary,
  CastForEducation,
  Article,
  Info,
  Paid,
  AccessTime,
  Download,
  PlayArrow,
  Public,
  BookmarkBorder,
  OpenInNew
} from '@mui/icons-material';
import { useUser, useDoc } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const LearningPathGenerator = ({
  targetJobTitle = '',
  targetSkills = [],
  resumeId = null,
  timeframe = 'medium' // short, medium, long
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    currentRole: '',
    targetRole: targetJobTitle || '',
    timeframe: timeframe,
    focusAreas: targetSkills || [],
    currentSkills: [],
    learningStyle: 'balanced', // visual, practical, theoretical, balanced
    budget: 'medium', // free, low, medium, high
    hoursPerWeek: 10,
    includeCredentials: true
  });
  const [skills, setSkills] = useState([]);
  const [path, setPath] = useState(null); // Renamed learningPath to path to avoid redeclaration
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [savedPaths, setSavedPaths] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const { profile } = useUser();
  const { currentResume } = useDoc();
  const [expandedResourceSection, setExpandedResourceSection] = useState(null);
  const [savedResources, setSavedResources] = useState(new Set());

  // Effect to load user's current role and skills from profile
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        currentRole: profile.currentRole || '',
        currentSkills: profile.skills || []
      }));
    }
  }, [profile]);
  
  // Effect to load user's saved learning paths
  useEffect(() => {
    const fetchSavedPaths = async () => {
      if (!profile?.id) return;
      
      try {
        const response = await apiEndpoints.user.getSavedLearningPaths(profile.id);
        setSavedPaths(response.data.map(path => path.id));
      } catch (err) {
        console.error('Error fetching saved learning paths:', err);
      }
    };
    
    fetchSavedPaths();
  }, [profile]);
  
  // Effect to extract skills from resume if provided
  useEffect(() => {
    const fetchResumeSkills = async () => {
      const effectiveResumeId = resumeId || currentResume?.id;
      if (!effectiveResumeId) return;
      
      try {
        const response = await apiEndpoints.documents.getResume(effectiveResumeId);
        if (response.data.skills && response.data.skills.length > 0) {
          setFormData(prev => ({
            ...prev,
            currentSkills: [...prev.currentSkills, ...response.data.skills]
          }));
        }
      } catch (err) {
        console.error('Error fetching resume skills:', err);
      }
    };
    
    fetchResumeSkills();
  }, [resumeId, currentResume]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new skill to current skills
  const handleAddSkill = () => {
    if (newSkillInput.trim() && !formData.currentSkills.includes(newSkillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        currentSkills: [...prev.currentSkills, newSkillInput.trim()]
      }));
      setNewSkillInput('');
    }
  };
  
  // Remove skill from current skills
  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      currentSkills: prev.currentSkills.filter(s => s !== skill)
    }));
  };
  
  // Add focus area
  const handleAddFocusArea = () => {
    if (newSkillInput.trim() && !formData.focusAreas.includes(newSkillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        focusAreas: [...prev.focusAreas, newSkillInput.trim()]
      }));
      setNewSkillInput('');
    }
  };

  // Example learning path structure (in real app, this would come from props or API)
  const learningPath = {
    title: `Learning path for ${targetJobTitle || 'your target role'}`,
    description: `A customized learning journey to help you acquire the skills needed for ${targetJobTitle || 'your target role'}.`,
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
            icon: <CastForEducation color="primary" />
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
            icon: <VideoLibrary color="error" />
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
            icon: <Book color="secondary" />
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
            icon: <CastForEducation color="primary" />
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
            icon: <VideoLibrary color="error" />
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
            icon: <CastForEducation color="primary" />
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
            icon: <Book color="secondary" />
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
          <CalendarMonth color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2">
            Estimated time to complete: <strong>{learningPath.estimatedTimeWeeks} weeks</strong>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Person color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle2">
            Learning style: <strong>{formData.learningStyle}</strong>
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
                <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
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
                        icon={<Code />}
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
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {savedResources.has(resource.id) && (
                          <Bookmark color="primary" fontSize="small" sx={{ mr: 1 }} />
                        )}
                        <Typography>{resource.title}</Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {resource.icon || <Article color="primary" />}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                          <Paid fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {resource.cost}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                          <AccessTime fontSize="small" sx={{ color: 'text.secondary', mr: 0.5 }} />
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
                                  icon={<Code />} 
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Button
                            size="small"
                            startIcon={savedResources.has(resource.id) ? <CheckCircle /> : <BookmarkBorder />}
                            onClick={() => handleSaveResource(resource.id)}
                            color={savedResources.has(resource.id) ? "success" : "primary"}
                          >
                            {savedResources.has(resource.id) ? "Saved" : "Save"}
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            endIcon={<PlayArrow />}
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
          startIcon={<Refresh />}
          onClick={() => {
            // Implement the logic to regenerate the learning path
          }}
          sx={{ mr: 1 }}
          disabled={loading}
        >
          Regenerate Path
        </Button>
        <Button 
          variant="outlined"
          startIcon={<Download />}
          sx={{ mr: 1 }}
        >
          Download PDF
        </Button>
        <Button 
          variant="contained"
          startIcon={<Bookmark />}
          onClick={() => {
            // Implement the logic to save the learning path
          }}
        >
          Save Learning Path
        </Button>
      </Box>
    </Paper>
  );
};

export default LearningPathGenerator; 