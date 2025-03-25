import React, { useState, useEffect } from 'react';
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
  Tabs
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

const ResumeBuilder = ({ 
  initialData = null, 
  onSave, 
  onPreview, 
  onGenerate, 
  onExport,
  loading = false 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    personal: {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      linkedin: '',
      github: '',
      website: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    achievements: []
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

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

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
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
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
    // Basic validation
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
    // Basic validation
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
    // Basic validation
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
    // Validate required fields
    const newErrors = {};
    if (!formData.personal.name) newErrors.name = 'Name is required';
    if (!formData.personal.email) newErrors.email = 'Email is required';
    
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
    if (onGenerate) {
      onGenerate(formData);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(formData);
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport(formData);
    }
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
          <Tab label="Personal" icon={<AlternateEmailIcon />} iconPosition="start" />
          <Tab label="Experience" icon={<WorkIcon />} iconPosition="start" />
          <Tab label="Education" icon={<SchoolIcon />} iconPosition="start" />
          <Tab label="Skills" icon={<CodeIcon />} iconPosition="start" />
          <Tab label="Projects" icon={<AttachFileIcon />} iconPosition="start" />
        </Tabs>

        {/* Personal Information Tab */}
        {activeTab === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.personal.name}
                onChange={handlePersonalChange}
                error={!!errors.name}
                helperText={errors.name}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Professional Title"
                name="title"
                value={formData.personal.title}
                onChange={handlePersonalChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={formData.personal.email}
                onChange={handlePersonalChange}
                error={!!errors.email}
                helperText={errors.email}
                margin="normal"
                InputProps={{
                  startAdornment: <AlternateEmailIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.personal.phone}
                onChange={handlePersonalChange}
                margin="normal"
                InputProps={{
                  startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.personal.location}
                onChange={handlePersonalChange}
                margin="normal"
                InputProps={{
                  startAdornment: <LocationOnIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="LinkedIn Profile"
                name="linkedin"
                value={formData.personal.linkedin}
                onChange={handlePersonalChange}
                margin="normal"
                InputProps={{
                  startAdornment: <LinkedInIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GitHub Profile"
                name="github"
                value={formData.personal.github}
                onChange={handlePersonalChange}
                margin="normal"
                InputProps={{
                  startAdornment: <GitHubIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Professional Summary"
                name="summary"
                value={formData.personal.summary}
                onChange={handlePersonalChange}
                margin="normal"
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        )}

        {/* Work Experience Tab */}
        {activeTab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Work Experience</Typography>
              <Button 
                startIcon={<AddIcon />} 
                onClick={() => openExperienceDialog()}
                variant="outlined"
              >
                Add Experience
              </Button>
            </Box>
            
            {formData.experience.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No work experience added yet. Click the button above to add your work history.
              </Typography>
            ) : (
              formData.experience.map((exp, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">{exp.position}</Typography>
                        <Typography variant="subtitle1">{exp.company}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {exp.location} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => openExperienceDialog(index)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => removeExperience(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {exp.description && (
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        {exp.description}
                      </Typography>
                    )}
                    
                    {exp.highlights.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Key Achievements:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                          {exp.highlights.map((highlight, idx) => (
                            <Box component="li" key={idx} sx={{ mb: 0.5 }}>
                              <Typography variant="body2">{highlight}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}

        {/* Education Tab */}
        {activeTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Education</Typography>
              <Button 
                startIcon={<AddIcon />} 
                onClick={() => openEducationDialog()}
                variant="outlined"
              >
                Add Education
              </Button>
            </Box>
            
            {formData.education.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No education history added yet. Click the button above to add your educational background.
              </Typography>
            ) : (
              formData.education.map((edu, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">{edu.institution}</Typography>
                        <Typography variant="subtitle1">
                          {edu.degree} {edu.field && `in ${edu.field}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {edu.location && `${edu.location} • `}{edu.startDate} - {edu.endDate}
                          {edu.gpa && ` • GPA: ${edu.gpa}`}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => openEducationDialog(index)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => removeEducation(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {edu.courses.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Relevant Courses:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {edu.courses.map((course, idx) => (
                            <Chip key={idx} label={course} size="small" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}

        {/* Skills Tab */}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>Skills</Typography>
            
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                label="Add a skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                margin="normal"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addSkill();
                    e.preventDefault();
                  }
                }}
              />
              <Button 
                onClick={addSkill} 
                variant="contained" 
                sx={{ mt: 2, ml: 1, height: 56 }}
              >
                Add
              </Button>
            </Box>
            
            {formData.skills.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No skills added yet. Add your professional skills above.
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => removeSkill(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Projects Tab */}
        {activeTab === 4 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Projects</Typography>
              <Button 
                startIcon={<AddIcon />} 
                onClick={() => openProjectDialog()}
                variant="outlined"
              >
                Add Project
              </Button>
            </Box>
            
            {formData.projects.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No projects added yet. Click the button above to add your projects.
              </Typography>
            ) : (
              formData.projects.map((project, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">{project.name}</Typography>
                        {project.startDate && (
                          <Typography variant="body2" color="text.secondary">
                            {project.startDate} - {project.endDate || 'Present'}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => openProjectDialog(index)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => removeProject(index)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {project.description}
                    </Typography>
                    
                    {project.technologies.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Technologies:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {project.technologies.map((tech, idx) => (
                            <Chip key={idx} label={tech} size="small" />
                          ))}
                        </Box>
                      </Box>
                    )}
                    
                    {project.link && (
                      <Button 
                        size="small" 
                        href={project.link}
                        target="_blank"
                        sx={{ mt: 2 }}
                      >
                        View Project
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        )}
      </Box>

      {/* Experience Dialog */}
      <Dialog open={showExperienceDialog} onClose={closeExperienceDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIndex >= 0 ? 'Edit Work Experience' : 'Add Work Experience'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                value={currentExperience.company}
                onChange={(e) => setCurrentExperience({...currentExperience, company: e.target.value})}
                error={!!errors.company}
                helperText={errors.company}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                value={currentExperience.position}
                onChange={(e) => setCurrentExperience({...currentExperience, position: e.target.value})}
                error={!!errors.position}
                helperText={errors.position}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={currentExperience.location}
                onChange={(e) => setCurrentExperience({...currentExperience, location: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Start Date"
                value={currentExperience.startDate}
                onChange={(e) => setCurrentExperience({...currentExperience, startDate: e.target.value})}
                margin="normal"
                error={!!errors.startDate}
                helperText={errors.startDate}
                placeholder="MM/YYYY"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="End Date"
                value={currentExperience.endDate}
                onChange={(e) => setCurrentExperience({...currentExperience, endDate: e.target.value})}
                margin="normal"
                placeholder="MM/YYYY"
                disabled={currentExperience.current}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={currentExperience.description}
                onChange={(e) => setCurrentExperience({...currentExperience, description: e.target.value})}
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Key Achievements / Responsibilities
              </Typography>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  label="Add an achievement"
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  margin="normal"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addHighlight();
                      e.preventDefault();
                    }
                  }}
                />
                <Button 
                  onClick={addHighlight} 
                  variant="contained" 
                  sx={{ mt: 2, ml: 1, height: 56 }}
                >
                  Add
                </Button>
              </Box>
              {currentExperience.highlights.length > 0 ? (
                <Box>
                  {currentExperience.highlights.map((highlight, index) => (
                    <Chip
                      key={index}
                      label={highlight}
                      onDelete={() => removeHighlight(index)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No achievements added yet.
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeExperienceDialog}>Cancel</Button>
          <Button onClick={saveExperience} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Education Dialog */}
      <Dialog open={showEducationDialog} onClose={closeEducationDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIndex >= 0 ? 'Edit Education' : 'Add Education'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Institution"
                value={currentEducation.institution}
                onChange={(e) => setCurrentEducation({...currentEducation, institution: e.target.value})}
                error={!!errors.institution}
                helperText={errors.institution}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Degree"
                value={currentEducation.degree}
                onChange={(e) => setCurrentEducation({...currentEducation, degree: e.target.value})}
                error={!!errors.degree}
                helperText={errors.degree}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Field of Study"
                value={currentEducation.field}
                onChange={(e) => setCurrentEducation({...currentEducation, field: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={currentEducation.location}
                onChange={(e) => setCurrentEducation({...currentEducation, location: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Start Date"
                value={currentEducation.startDate}
                onChange={(e) => setCurrentEducation({...currentEducation, startDate: e.target.value})}
                margin="normal"
                placeholder="MM/YYYY"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="End Date"
                value={currentEducation.endDate}
                onChange={(e) => setCurrentEducation({...currentEducation, endDate: e.target.value})}
                margin="normal"
                placeholder="MM/YYYY"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="GPA"
                value={currentEducation.gpa}
                onChange={(e) => setCurrentEducation({...currentEducation, gpa: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Relevant Courses
              </Typography>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  label="Add a course"
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  margin="normal"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addCourse();
                      e.preventDefault();
                    }
                  }}
                />
                <Button 
                  onClick={addCourse} 
                  variant="contained" 
                  sx={{ mt: 2, ml: 1, height: 56 }}
                >
                  Add
                </Button>
              </Box>
              {currentEducation.courses.length > 0 ? (
                <Box>
                  {currentEducation.courses.map((course, index) => (
                    <Chip
                      key={index}
                      label={course}
                      onDelete={() => removeCourse(index)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No courses added yet.
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEducationDialog}>Cancel</Button>
          <Button onClick={saveEducation} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Dialog */}
      <Dialog open={showProjectDialog} onClose={closeProjectDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIndex >= 0 ? 'Edit Project' : 'Add Project'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={currentProject.name}
                onChange={(e) => setCurrentProject({...currentProject, name: e.target.value})}
                error={!!errors.name}
                helperText={errors.name}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                value={currentProject.startDate}
                onChange={(e) => setCurrentProject({...currentProject, startDate: e.target.value})}
                margin="normal"
                placeholder="MM/YYYY"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                value={currentProject.endDate}
                onChange={(e) => setCurrentProject({...currentProject, endDate: e.target.value})}
                margin="normal"
                placeholder="MM/YYYY"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Link/URL"
                value={currentProject.link}
                onChange={(e) => setCurrentProject({...currentProject, link: e.target.value})}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={currentProject.description}
                onChange={(e) => setCurrentProject({...currentProject, description: e.target.value})}
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Technologies Used
              </Typography>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  label="Add a technology"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  margin="normal"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTechnology();
                      e.preventDefault();
                    }
                  }}
                />
                <Button 
                  onClick={addTechnology} 
                  variant="contained" 
                  sx={{ mt: 2, ml: 1, height: 56 }}
                >
                  Add
                </Button>
              </Box>
              {currentProject.technologies.length > 0 ? (
                <Box>
                  {currentProject.technologies.map((tech, index) => (
                    <Chip
                      key={index}
                      label={tech}
                      onDelete={() => removeTechnology(index)}
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No technologies added yet.
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeProjectDialog}>Cancel</Button>
          <Button onClick={saveProject} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Action buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<VisibilityIcon />} 
            onClick={() => onPreview && onPreview(formData)}
            sx={{ mr: 1 }}
          >
            Preview
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />} 
            onClick={() => onExport && onExport(formData)}
            sx={{ mr: 1 }}
          >
            Export PDF
          </Button>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<TipsAndUpdatesIcon />}
            onClick={() => onGenerate && onGenerate(formData)}
            sx={{ mr: 1 }}
          >
            AI Suggestions
          </Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Save Resume"}
          </Button>
        </Box>
      </Box>
      
      {/* Suggestions panel */}
      {suggestions.length > 0 && (
        <Paper elevation={0} variant="outlined" sx={{ p: 2, mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            <TipsAndUpdatesIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
            AI-Powered Improvement Suggestions
          </Typography>
          {suggestions.map((suggestion, index) => (
            <Alert 
              key={index} 
              severity="info" 
              sx={{ mb: 1 }}
              icon={<RocketLaunchIcon />}
            >
              {suggestion}
            </Alert>
          ))}
        </Paper>
      )}
      
      {/* Success message */}
      {successMessage && (
        <Alert severity="success" sx={{ mt: 3 }}>
          {successMessage}
        </Alert>
      )}
    </Paper>
  );
};

export default ResumeBuilder;