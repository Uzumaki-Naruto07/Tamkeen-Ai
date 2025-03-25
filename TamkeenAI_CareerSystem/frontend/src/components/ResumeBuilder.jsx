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
  Autocomplete
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
  
  const previewContainerRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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
        ...prev.personal,
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

  const handleSave = () => {
    const newErrors = {};
    if (!formData.personal.firstName || !formData.personal.lastName || !formData.personal.email || !formData.personal.phone || !formData.personal.location) {
      newErrors.requiredFields = 'All fields are required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (onSave) {
      onSave(formData);
      setSuccessMessage('Resume saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
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
              onClick={handleExport}
              disabled={loading}
              variant="outlined"
            >
              Export
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

        {suggestions.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="info" icon={<TipsAndUpdatesIcon />}>
              <Typography variant="subtitle2">AI Resume Suggestions</Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </Box>
            </Alert>
          </Box>
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