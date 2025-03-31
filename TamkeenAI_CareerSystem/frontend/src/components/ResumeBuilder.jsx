import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardActions,
  Stepper,
  Step,
  StepLabel,
  Chip,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CardMedia,
  Menu,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  FormGroup,
  FormControlLabel,
  Switch,
  InputAdornment,
  Slider,
  Rating,
  Autocomplete,
  Link
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import CodeIcon from '@mui/icons-material/Code';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LanguageIcon from '@mui/icons-material/Language';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DateRangeIcon from '@mui/icons-material/DateRange';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PublishIcon from '@mui/icons-material/Publish';
import SettingsIcon from '@mui/icons-material/Settings';
import TuneIcon from '@mui/icons-material/Tune';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import PersonIcon from '@mui/icons-material/Person';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const ResumeBuilder = ({
  initialData = null,
  templates = [],
  onSave,
  onExport,
  onAnalyze,
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    personal: {
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: []
    },
    projects: [],
    certifications: [],
    languages: [],
    interests: []
  });
  const [currentExperience, setCurrentExperience] = useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    highlights: []
  });
  const [currentEducation, setCurrentEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    location: '',
    startDate: '',
    endDate: '',
    gpa: '',
    courses: []
  });
  const [currentProject, setCurrentProject] = useState({
    name: '',
    description: '',
    technologies: [],
    link: '',
    startDate: '',
    endDate: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');
  const [courseInput, setCourseInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [showExperienceDialog, setShowExperienceDialog] = useState(false);
  const [showEducationDialog, setShowEducationDialog] = useState(false);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.id || 'modern');
  const [showPreview, setShowPreview] = useState(false);
  const [editMode, setEditMode] = useState({
    section: null,
    itemIndex: null
  });
  const [previewScale, setPreviewScale] = useState(0.6);
  const [viewMode, setViewMode] = useState('edit'); // 'edit', 'preview', 'analyze'
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [analyzeResults, setAnalyzeResults] = useState(null);
  const [dialogOpen, setDialogOpen] = useState({
    template: false,
    export: false,
    settings: false,
    confirmation: false
  });
  const [exportFormat, setExportFormat] = useState('pdf');
  const [showSkillLevel, setShowSkillLevel] = useState(true);
  const [colorScheme, setColorScheme] = useState('default');
  const [fontFamily, setFontFamily] = useState('Roboto');
  const [customSections, setCustomSections] = useState([]);
  const [customSectionName, setCustomSectionName] = useState('');
  const [resumeId, setResumeId] = useState(null);
  const { profile } = useUser();
  
  const previewContainerRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      // Ensure the initialData has the expected structure
      const safeInitialData = {
        personal: {
          firstName: '',
          lastName: '',
          title: '',
          email: '',
          phone: '',
          location: '',
          website: '',
          linkedin: '',
          github: '',
          summary: '',
          ...(initialData.personal || {})
        },
        experience: initialData.experience || [],
        education: initialData.education || [],
        skills: {
          technical: [],
          soft: [],
          ...(initialData.skills || {})
        },
        projects: initialData.projects || [],
        certifications: initialData.certifications || [],
        languages: initialData.languages || [],
        interests: initialData.interests || [],
        ...initialData
      };
      
      setFormData(safeInitialData);
      if (initialData.id) {
        setResumeId(initialData.id);
      }
    } else if (profile) {
      // Pre-fill personal info from user profile
      setFormData(prev => {
        const firstName = profile.firstName || '';
        const lastName = profile.lastName || '';
        return {
          ...prev,
          personal: {
            ...(prev.personal || {}),
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            email: profile.email || '',
            phone: profile.phone || '',
            location: profile.location || ''
          }
        };
      });
    }
  }, [initialData, profile]);

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0].id);
    }
  }, [templates, selectedTemplate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      personal: {
        ...(prev.personal || {}), // Ensure personal exists
        [name]: value
      }
    }));
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          technical: [...prev.skills.technical, skillInput.trim()]
        }
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: prev.skills.technical.filter((_, i) => i !== index)
      }
    }));
  };

  const addHighlight = () => {
    if (highlightInput.trim()) {
      setCurrentExperience(prev => ({
        ...prev,
        highlights: [...prev.highlights, highlightInput.trim()]
      }));
      setHighlightInput('');
    }
  };

  const removeHighlight = (index) => {
    setCurrentExperience(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
  };

  const addCourse = () => {
    if (courseInput.trim()) {
      setCurrentEducation(prev => ({
        ...prev,
        courses: [...prev.courses, courseInput.trim()]
      }));
      setCourseInput('');
    }
  };

  const removeCourse = (index) => {
    setCurrentEducation(prev => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index)
    }));
  };

  const addTechnology = () => {
    if (techInput.trim()) {
      setCurrentProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (index) => {
    setCurrentProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index)
    }));
  };

  const openExperienceDialog = (index = -1) => {
    if (index >= 0) {
      setCurrentExperience(formData.experience[index]);
      setEditingIndex(index);
    } else {
      setCurrentExperience({
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        highlights: []
      });
      setEditingIndex(-1);
    }
    setShowExperienceDialog(true);
  };

  const closeExperienceDialog = () => {
    setShowExperienceDialog(false);
  };

  const saveExperience = () => {
    const newErrors = {};
    if (!currentExperience.company) newErrors.company = 'Company is required';
    if (!currentExperience.position) newErrors.position = 'Position is required';
    if (!currentExperience.startDate) newErrors.startDate = 'Start date is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setFormData(prev => {
      const newExperience = [...prev.experience];
      if (editingIndex >= 0) {
        newExperience[editingIndex] = currentExperience;
      } else {
        newExperience.push(currentExperience);
      }
      return { ...prev, experience: newExperience };
    });
    
    setErrors({});
    closeExperienceDialog();
  };

  const openEducationDialog = (index = -1) => {
    if (index >= 0) {
      setCurrentEducation(formData.education[index]);
      setEditingIndex(index);
    } else {
      setCurrentEducation({
        institution: '',
        degree: '',
        field: '',
        location: '',
        startDate: '',
        endDate: '',
        gpa: '',
        courses: []
      });
      setEditingIndex(-1);
    }
    setShowEducationDialog(true);
  };

  const closeEducationDialog = () => {
    setShowEducationDialog(false);
  };

  const saveEducation = () => {
    const newErrors = {};
    if (!currentEducation.institution) newErrors.institution = 'Institution is required';
    if (!currentEducation.degree) newErrors.degree = 'Degree is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setFormData(prev => {
      const newEducation = [...prev.education];
      if (editingIndex >= 0) {
        newEducation[editingIndex] = currentEducation;
      } else {
        newEducation.push(currentEducation);
      }
      return { ...prev, education: newEducation };
    });
    
    setErrors({});
    closeEducationDialog();
  };

  const openProjectDialog = (index = -1) => {
    if (index >= 0) {
      setCurrentProject(formData.projects[index]);
      setEditingIndex(index);
    } else {
      setCurrentProject({
        name: '',
        description: '',
        technologies: [],
        link: '',
        startDate: '',
        endDate: ''
      });
      setEditingIndex(-1);
    }
    setShowProjectDialog(true);
  };

  const closeProjectDialog = () => {
    setShowProjectDialog(false);
  };

  const saveProject = () => {
    const newErrors = {};
    if (!currentProject.name) newErrors.name = 'Project name is required';
    if (!currentProject.description) newErrors.description = 'Description is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setFormData(prev => {
      const newProjects = [...prev.projects];
      if (editingIndex >= 0) {
        newProjects[editingIndex] = currentProject;
      } else {
        newProjects.push(currentProject);
      }
      return { ...prev, projects: newProjects };
    });
    
    setErrors({});
    closeProjectDialog();
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    const setLoading = (state) => {
      // Create a local loading state if needed, since loading is a prop
      // This avoids modifying a prop directly
    };
    
    const setError = (error) => {
      // Create a local error state if needed
      setErrors({ message: error });
    };
    
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        ...formData,
        userId: profile?.id
      };
      
      let response;
      
      if (resumeId) {
        // Update existing resume
        response = await apiEndpoints.documents.updateResume(resumeId, payload);
      } else {
        // Create new resume
        response = await apiEndpoints.documents.createResume(payload);
        setResumeId(response?.data?.id);
      }
      
      setSuccessMessage('Resume saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      if (onSave) {
        onSave(response?.data);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save resume');
      console.error('Resume save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (onAnalyze) {
      onAnalyze(formData);
    }
  };

  const handlePreview = () => {
    if (onSave) {
      onSave(formData);
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(formData, selectedTemplate, exportFormat);
    }
  };

  const openDialog = (dialogName) => {
    setDialogOpen({
      ...dialogOpen,
      [dialogName]: true
    });
  };

  const closeDialog = (dialogName) => {
    setDialogOpen({
      ...dialogOpen,
      [dialogName]: false
    });
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAddItem = (section, newItem) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
    setEditMode({ section: null, itemIndex: null });
  };

  const handleUpdateItem = (section, index, updatedItem) => {
    const newArray = [...formData[section]];
    newArray[index] = updatedItem;
    setFormData(prev => ({
      ...prev,
      [section]: newArray
    }));
    setEditMode({ section: null, itemIndex: null });
  };

  const handleDeleteItem = (section, index) => {
    const newArray = [...formData[section]];
    newArray.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      [section]: newArray
    }));
  };

  const handleAddSkill = (category, skill) => {
    if (!skill.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: [...prev.skills[category], { name: skill, level: 3 }]
      }
    }));
  };

  const handleSkillLevelChange = (category, index, level) => {
    const newSkills = [...formData.skills[category]];
    newSkills[index] = { ...newSkills[index], level };
    
    setFormData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: newSkills
      }
    }));
  };

  const handleGeneratePDF = async () => {
    if (!resumeId) {
      // Save resume first if it doesn't exist
      await handleSave();
      if (!resumeId) return; // Exit if save failed
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // This connects to report_generator.py
      const response = await apiEndpoints.reports.generate({
        reportType: 'resume',
        data: formData,
        format: 'pdf'
      });
      
      // Download PDF
      const link = document.createElement('a');
      link.href = response.data.reportUrl;
      link.download = 'Resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
      console.error('PDF generation error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePreviewPDF = async () => {
    if (!resumeId) {
      // Save resume first if it doesn't exist
      await handleSave();
      if (!resumeId) return; // Exit if save failed
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // This also connects to report_generator.py backend
      const response = await apiEndpoints.reports.generate({
        documentId: resumeId,
        reportType: 'resume',
        format: 'pdf',
        options: {
          template: 'professional',
          includePhoto: false,
          color: 'blue'
        }
      });
      
      // Open in new tab
      window.open(response.data.reportUrl, '_blank');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to preview PDF');
      console.error('PDF preview error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfoSection = () => {
    // Add defensive checks for data
    const personal = formData?.personal || {};
    // Split name into firstName/lastName if we have name but not firstName
    const fullName = personal.name || '';
    const nameParts = fullName.split(' ');
    const inferredFirstName = personal.firstName || (nameParts.length > 0 ? nameParts[0] : '');
    const inferredLastName = personal.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={inferredFirstName}
            onChange={handlePersonalChange}
            variant="outlined"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={inferredLastName}
            onChange={handlePersonalChange}
            variant="outlined"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Professional Title"
            name="title"
            value={personal.title || ''}
            onChange={handlePersonalChange}
            variant="outlined"
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={personal.email || ''}
            onChange={handlePersonalChange}
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AlternateEmailIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone"
            name="phone"
            value={personal.phone || ''}
            onChange={handlePersonalChange}
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={personal.location || ''}
            onChange={handlePersonalChange}
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="LinkedIn"
            name="linkedin"
            value={personal.linkedin || ''}
            onChange={handlePersonalChange}
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkedInIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="GitHub"
            name="github"
            value={personal.github || ''}
            onChange={handlePersonalChange}
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <GitHubIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Website"
            name="website"
            value={personal.website || ''}
            onChange={handlePersonalChange}
            variant="outlined"
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LanguageIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Professional Summary"
            name="summary"
            value={personal.summary || ''}
            onChange={handlePersonalChange}
            variant="outlined"
            margin="normal"
            multiline
            rows={4}
            placeholder="Write a compelling summary of your professional background, skills, and career goals..."
          />
        </Grid>
      </Grid>
    );
  };

  const renderExperienceSection = () => {
    // Add defensive checks
    const experience = formData?.experience || [];
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Work Experience
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openExperienceDialog()}
          >
            Add Experience
          </Button>
        </Box>
        
        {experience.length === 0 ? (
          <Alert severity="info" sx={{ my: 2 }}>
            No work experience added yet. Add your professional experience to enhance your resume.
          </Alert>
        ) : (
          experience.map((exp, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{exp?.position || ''}</Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => openExperienceDialog(index)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => removeExperience(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="subtitle1" color="textSecondary">{exp?.company || ''}</Typography>
                <Typography variant="body2" color="textSecondary">
                  <LocationOnIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                  {exp?.location || ''}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  <DateRangeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                  {exp?.startDate || ''} - {exp?.current ? 'Present' : exp?.endDate || ''}
                </Typography>
                {exp?.description && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {exp.description}
                  </Typography>
                )}
                {exp?.highlights?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight="bold">Key Achievements:</Typography>
                    <List dense sx={{ pl: 2 }}>
                      {exp.highlights.map((highlight, idx) => (
                        <ListItem key={idx} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={highlight} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    );
  };

  const renderEducationSection = () => {
    // Add defensive checks
    const education = formData?.education || [];
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Education
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openEducationDialog()}
          >
            Add Education
          </Button>
        </Box>
        
        {education.length === 0 ? (
          <Alert severity="info" sx={{ my: 2 }}>
            No education entries added yet. Add your educational background to enhance your resume.
          </Alert>
        ) : (
          education.map((edu, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{edu?.degree || ''}</Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => openEducationDialog(index)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => removeEducation(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="subtitle1" color="textSecondary">{edu?.institution || ''}</Typography>
                <Typography variant="body2" color="textSecondary">
                  <LocationOnIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                  {edu?.location || ''}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  <DateRangeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                  {edu?.startDate || ''} - {edu?.endDate || ''}
                </Typography>
                {edu?.field && (
                  <Typography variant="body2" color="textSecondary">
                    Field of Study: {edu.field}
                  </Typography>
                )}
                {edu?.gpa && (
                  <Typography variant="body2" color="textSecondary">
                    GPA: {edu.gpa}
                  </Typography>
                )}
                {edu?.courses?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight="bold">Relevant Courses:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {edu.courses.map((course, idx) => (
                        <Chip 
                          key={idx} 
                          label={course} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    );
  };

  const renderSkillsSection = () => {
    // Add defensive checks
    const skills = formData?.skills || { technical: [], soft: [] };
    
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Skills
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Technical Skills</Typography>
          
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="Add a technical skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                variant="outlined"
                size="small"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSkill();
                    e.preventDefault();
                  }
                }}
              />
              <Button 
                variant="contained" 
                onClick={addSkill}
                disabled={!skillInput.trim()}
              >
                Add
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {skills.technical.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => removeSkill(index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
          
          <Typography variant="subtitle1" sx={{ mb: 1, mt: 3 }}>Soft Skills</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {skills.soft.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                onDelete={() => {
                  setFormData(prev => ({
                    ...prev,
                    skills: {
                      ...(prev.skills || {}),
                      soft: (prev.skills?.soft || []).filter((_, i) => i !== index)
                    }
                  }));
                }}
                color="secondary"
                variant="outlined"
              />
            ))}
            <Chip
              icon={<AddIcon />}
              label="Add Soft Skill"
              onClick={() => {
                const skill = window.prompt("Enter a soft skill");
                if (skill && skill.trim()) {
                  setFormData(prev => ({
                    ...prev,
                    skills: {
                      ...(prev.skills || {}),
                      soft: [...(prev.skills?.soft || []), skill.trim()]
                    }
                  }));
                }
              }}
              color="default"
              variant="outlined"
            />
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Languages</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {(formData.languages || []).map((lang, index) => (
              <Chip
                key={index}
                label={lang}
                onDelete={() => {
                  setFormData(prev => ({
                    ...prev,
                    languages: (prev.languages || []).filter((_, i) => i !== index)
                  }));
                }}
                color="default"
                variant="outlined"
              />
            ))}
            <Chip
              icon={<AddIcon />}
              label="Add Language"
              onClick={() => {
                const language = window.prompt("Enter a language");
                if (language && language.trim()) {
                  setFormData(prev => ({
                    ...prev,
                    languages: [...(prev.languages || []), language.trim()]
                  }));
                }
              }}
              color="default"
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>
    );
  };

  const renderProjectsSection = () => {
    // Add defensive checks
    const projects = formData?.projects || [];
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            Projects
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openProjectDialog()}
          >
            Add Project
          </Button>
        </Box>
        
        {projects.length === 0 ? (
          <Alert severity="info" sx={{ my: 2 }}>
            No projects added yet. Add your projects to showcase your practical skills.
          </Alert>
        ) : (
          projects.map((project, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{project?.name || ''}</Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => openProjectDialog(index)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => removeProject(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                {project?.startDate && project?.endDate && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    <DateRangeIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                    {project.startDate} - {project.endDate}
                  </Typography>
                )}
                
                {project?.description && (
                  <Typography variant="body2" sx={{ my: 1 }}>
                    {project.description}
                  </Typography>
                )}
                
                {project?.link && (
                  <Typography variant="body2" sx={{ my: 1 }}>
                    <Link href={project.link} target="_blank" rel="noopener noreferrer">
                      Project Link
                    </Link>
                  </Typography>
                )}
                
                {project?.technologies?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" fontWeight="bold">Technologies:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {project.technologies.map((tech, idx) => (
                        <Chip 
                          key={idx} 
                          label={tech} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    );
  };

  const renderAdditionalInfoSection = () => {
    // Add defensive checks
    const certifications = formData?.certifications || [];
    const interests = formData?.interests || [];
    
    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Additional Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Certifications</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {certifications.map((cert, index) => (
                      <Chip
                        key={index}
                        label={cert}
                        onDelete={() => {
                          setFormData(prev => ({
                            ...prev,
                            certifications: (prev?.certifications || []).filter((_, i) => i !== index)
                          }));
                        }}
                        color="default"
                      />
                    ))}
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        const cert = window.prompt("Enter a certification");
                        if (cert && cert.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            certifications: [...(prev?.certifications || []), cert.trim()]
                          }));
                        }
                      }}
                    >
                      Add Certification
                    </Button>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Interests</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {interests.map((interest, index) => (
                      <Chip
                        key={index}
                        label={interest}
                        onDelete={() => {
                          setFormData(prev => ({
                            ...prev,
                            interests: (prev?.interests || []).filter((_, i) => i !== index)
                          }));
                        }}
                        color="default"
                      />
                    ))}
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        const interest = window.prompt("Enter an interest");
                        if (interest && interest.trim()) {
                          setFormData(prev => ({
                            ...prev,
                            interests: [...(prev?.interests || []), interest.trim()]
                          }));
                        }
                      }}
                    >
                      Add Interest
                    </Button>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
            
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Custom Sections</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box>
                  {customSections.map((section, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">{section?.name || ''}</Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setCustomSections(prev => prev.filter((_, i) => i !== index));
                          }}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={section?.content || ''}
                        onChange={(e) => {
                          const newSections = [...customSections];
                          newSections[index] = {
                            ...newSections[index],
                            content: e.target.value
                          };
                          setCustomSections(newSections);
                        }}
                        margin="normal"
                      />
                    </Box>
                  ))}
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <TextField
                      label="Section Name"
                      value={customSectionName}
                      onChange={(e) => setCustomSectionName(e.target.value)}
                      size="small"
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        if (customSectionName.trim()) {
                          setCustomSections(prev => [
                            ...prev,
                            { name: customSectionName.trim(), content: '' }
                          ]);
                          setCustomSectionName('');
                        }
                      }}
                      disabled={!customSectionName.trim()}
                    >
                      Add Section
                    </Button>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Resume Builder</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              startIcon={<SaveIcon />} 
              onClick={handleSave}
              disabled={loading}
            >
              Save
            </Button>
            <Button 
              startIcon={<VisibilityIcon />} 
              onClick={handlePreview}
              disabled={loading}
            >
              Preview
            </Button>
            <Button 
              startIcon={<DownloadIcon />} 
              onClick={handleGeneratePDF}
              disabled={loading}
              variant="outlined"
            >
              Download PDF
            </Button>
            <Button 
              startIcon={<RocketLaunchIcon />} 
              onClick={handleGenerate}
              disabled={loading}
              variant="contained"
              color="primary"
            >
              AI Generate
            </Button>
          </Box>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}

        {errors && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.requiredFields || errors.message}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography>Personal Info</Typography>
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WorkIcon sx={{ mr: 1 }} />
                <Typography>Experience</Typography>
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1 }} />
                <Typography>Education</Typography>
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CodeIcon sx={{ mr: 1 }} />
                <Typography>Skills</Typography>
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachFileIcon sx={{ mr: 1 }} />
                <Typography>Projects</Typography>
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleIcon sx={{ mr: 1 }} />
                <Typography>Additional Info</Typography>
              </Box>
            }
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {activeTab === 0 && renderPersonalInfoSection()}
          {activeTab === 1 && renderExperienceSection()}
          {activeTab === 2 && renderEducationSection()}
          {activeTab === 3 && renderSkillsSection()}
          {activeTab === 4 && renderProjectsSection()}
          {activeTab === 5 && renderAdditionalInfoSection()}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
          <Button
            disabled={activeTab === 0}
            onClick={() => setActiveTab(activeTab - 1)}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          <Box>
            <Button
              variant="outlined"
              onClick={() => setViewMode('preview')}
              startIcon={<VisibilityIcon />}
              sx={{ mr: 1 }}
            >
              Preview
            </Button>
            <Button
              variant="contained"
              onClick={activeTab === 5 ? handleSave : () => setActiveTab(activeTab + 1)}
              endIcon={activeTab === 5 ? <SaveIcon /> : <ArrowForwardIcon />}
              color={activeTab === 5 ? "success" : "primary"}
            >
              {activeTab === 5 ? 'Save Resume' : 'Next'}
            </Button>
          </Box>
        </Box>
      </Box>
      
      {/* Template Selection Dialog */}
      <Dialog
        open={dialogOpen.template}
        onClose={() => closeDialog('template')}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Choose a Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: selectedTemplate === template.id ? '2px solid #3f51b5' : 'none',
                    transform: selectedTemplate === template.id ? 'scale(1.02)' : 'none',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardMedia
                    component="img"
                    height="160"
                    image={template.thumbnail}
                    alt={template.name}
                  />
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">{template.name}</Typography>
                      {selectedTemplate === template.id && (
                        <CheckCircleIcon color="primary" />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog('template')}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              closeDialog('template');
            }}
          >
            Apply Template
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog
        open={dialogOpen.export}
        onClose={() => closeDialog('export')}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Resume</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                label="Export Format"
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="docx">Word Document (DOCX)</MenuItem>
                <MenuItem value="json">JSON (for future edits)</MenuItem>
              </Select>
              <FormHelperText>
                Choose the format that works best for your needs
              </FormHelperText>
            </FormControl>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              {exportFormat === 'pdf' 
                ? 'PDF is the recommended format for job applications. It preserves formatting across all devices.'
                : exportFormat === 'docx'
                ? 'DOCX format allows you to make further edits in Microsoft Word or other compatible software.'
                : 'JSON format stores your resume data for future edits in this application.'}
            </Alert>
            
            <FormGroup sx={{ mb: 2 }}>
              <FormControlLabel
                control={<Switch checked={true} />}
                label="Include contact information"
              />
              <FormControlLabel
                control={<Switch checked={true} />}
                label="Include profile picture"
              />
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog('export')}>Cancel</Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => {
              if (onExport) {
                onExport(formData, selectedTemplate, exportFormat);
              }
              closeDialog('export');
            }}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ResumeBuilder;