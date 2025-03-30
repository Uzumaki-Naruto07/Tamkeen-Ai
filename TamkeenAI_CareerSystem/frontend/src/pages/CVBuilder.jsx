import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemSecondaryAction,
  Chip, Menu, MenuItem, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stepper, Step, StepLabel, StepContent, FormControlLabel,
  Switch, Select, FormControl, InputLabel, Tooltip,
  Tabs, Tab, Accordion, AccordionSummary, AccordionDetails,
  Slider, Snackbar, InputAdornment, Backdrop
} from '@mui/material';
import {
  Add, Delete, Edit, Save, CloudUpload, GetApp,
  Visibility, VisibilityOff, FormatBold, FormatItalic,
  FormatUnderlined, FormatListBulleted, FormatListNumbered,
  Link, Image, Description, ImportContacts, ThumbUp,
  ThumbDown, Psychology, Person, Work, School, StarRate,
  Palette, FormatPaint, Check, Close, ArrowBack, ArrowForward,
  ExpandMore, Create, AssignmentTurnedIn, CheckCircle, Refresh,
  NavigateBefore, NavigateNext, OpenInNew, CloudDownload, Assignment,
  AddCircleOutline, RemoveCircleOutline, DragIndicator, MoreVert,
  Mail, Phone, Language, LinkedIn, GitHub, Web, LocationOn,
  Info, Warning, Help, PhotoCamera, Clear, Grade, Timeline,
  MenuBook, EmojiEvents, QuestionAnswer, Construction, FileUpload
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import { useUser, useResume } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import CVDocument from '../components/CVDocument';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const CVBuilder = () => {
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [resumeList, setResumeList] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [sectionErrors, setSectionErrors] = useState({});
  const [currentTemplate, setCurrentTemplate] = useState('modern');
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [isNewResume, setIsNewResume] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [educationDialogOpen, setEducationDialogOpen] = useState(false);
  const [experienceDialogOpen, setExperienceDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [currentEducationItem, setCurrentEducationItem] = useState(null);
  const [currentExperienceItem, setCurrentExperienceItem] = useState(null);
  const [currentProjectItem, setCurrentProjectItem] = useState(null);
  const [currentSkillItem, setCurrentSkillItem] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogAction, setConfirmDialogAction] = useState(null);
  const [resumeNameDialogOpen, setResumeNameDialogOpen] = useState(false);
  const [newResumeName, setNewResumeName] = useState('');
  
  const pdfRef = useRef(null);
  const navigate = useNavigate();
  const { profile } = useUser();
  const { fetchResumes, resumes, updateResume } = useResume();
  
  // Initial load - fetch resumes if not already in context
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!profile?.id) {
          setLoading(false);
          return;
        }
        
        // Fetch resume templates
        const templatesResponse = await apiEndpoints.resumes.getTemplates();
        setAvailableTemplates(templatesResponse.data || []);
        
        // If resumes aren't fetched yet in context, fetch them
        if (!resumes || resumes.length === 0) {
          await fetchResumes();
        }
        
        // Initialize with first resume or empty state
        if (resumes && resumes.length > 0) {
          setResumeList(resumes);
          setActiveResumeId(resumes[0].id);
          setResumeData(resumes[0]);
          setCurrentTemplate(resumes[0].template || 'modern');
        } else {
          initializeEmptyResume();
          setIsNewResume(true);
        }
      } catch (err) {
        setError('Failed to load resume data');
        console.error('Error initializing CV builder:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [profile, fetchResumes, resumes]);
  
  // Initialize empty resume template
  const initializeEmptyResume = () => {
    setResumeData({
      id: null,
      name: 'My Resume',
      template: 'modern',
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        address: '',
        linkedIn: '',
        github: '',
        website: '',
        location: '',
        summary: ''
      },
      education: [],
      experience: [],
      skills: [],
      projects: [],
      achievements: [],
      references: [],
      template: 'modern'
    });
  };

  const handleRequestSuggestions = async (section) => {
    setIsSuggestionLoading(true);
    try {
      const response = await apiEndpoints.resumes.getSuggestions(section);
      setAiSuggestions(response.data);
    } catch (err) {
      setError('Failed to get AI suggestions');
      console.error('Error getting AI suggestions:', err);
    } finally {
      setIsSuggestionLoading(false);
    }
  };

  const handleApplySuggestion = (section, suggestion) => {
    // Implement the logic to apply the suggestion to the resume data
    console.log('Applying suggestion:', section, suggestion);
  };

  const formatSectionTitle = (section) => {
    // Implement the logic to format the section title
    return section.charAt(0).toUpperCase() + section.slice(1);
  };

  const renderActiveSection = () => {
    // Implement the logic to render the active section
    return <div>Render active section content here</div>;
  };

  const renderEducationDialog = () => {
    // Implement the logic to render the education dialog
    return <div>Render education dialog content here</div>;
  };

  const renderExperienceDialog = () => {
    // Implement the logic to render the experience dialog
    return <div>Render experience dialog content here</div>;
  };

  const renderProjectDialog = () => {
    // Implement the logic to render the project dialog
    return <div>Render project dialog content here</div>;
  };

  const renderSkillDialog = () => {
    // Implement the logic to render the skill dialog
    return <div>Render skill dialog content here</div>;
  };

  const renderTemplateDialog = () => {
    // Implement the logic to render the template dialog
    return <div>Render template dialog content here</div>;
  };

  const renderShareDialog = () => {
    // Implement the logic to render the share dialog
    return <div>Render share dialog content here</div>;
  };

  const renderConfirmDialog = () => {
    // Implement the logic to render the confirm dialog
    return <div>Render confirm dialog content here</div>;
  };

  const renderResumeNameDialog = () => {
    // Implement the logic to render the resume name dialog
    return <div>Render resume name dialog content here</div>;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Resume Builder
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={previewMode ? 12 : 8}>
          {previewMode ? (
            <Paper elevation={3} sx={{ height: '100%', overflow: 'hidden' }}>
              {pdfLoading ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '100%', 
                  minHeight: 500
                }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>
                    Generating preview...
                  </Typography>
                </Box>
              ) : (
                <PDFViewer
                  ref={pdfRef}
                  style={{ width: '100%', height: '80vh', border: 'none' }}
                >
                  <CVDocument 
                    resume={resumeData} 
                    template={currentTemplate} 
                  />
                </PDFViewer>
              )}
            </Paper>
          ) : (
            <Paper sx={{ p: 3 }}>
              {renderActiveSection()}
            </Paper>
          )}
        </Grid>
        
        <Grid item xs={12} md={previewMode ? 12 : 4}>
          <Typography variant="subtitle1" gutterBottom>
            AI Feedback & Suggestions
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Psychology />}
                onClick={() => handleRequestSuggestions('all')}
                disabled={isSuggestionLoading}
                sx={{ mb: 2 }}
              >
                Analyze Full Resume
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AssignmentTurnedIn />}
                onClick={() => handleRequestSuggestions(activeSection)}
                disabled={isSuggestionLoading}
                sx={{ mb: 2 }}
              >
                Improve Current Section
              </Button>
            </Grid>
          </Grid>
          
          {Object.keys(aiSuggestions).length > 0 && (
            <Box sx={{ mt: 2 }}>
              {Object.entries(aiSuggestions).map(([section, suggestions]) => (
                <Accordion key={section} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>
                      {formatSectionTitle(section)} Suggestions
                    </Typography>
                  </AccordionSummary>
                  
                  <AccordionDetails>
                    <List dense>
                      {suggestions.map((suggestion, idx) => (
                        <ListItem key={idx}>
                          <ListItemText
                            primary={suggestion.title}
                            secondary={suggestion.description}
                          />
                          
                          {suggestion.replacementText && (
                            <ListItemSecondaryAction>
                              <Tooltip title="Apply this suggestion">
                                <IconButton 
                                  edge="end" 
                                  onClick={() => handleApplySuggestion(section, suggestion)}
                                  size="small"
                                >
                                  <Check />
                                </IconButton>
                              </Tooltip>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
      
      {renderEducationDialog()}
      {renderExperienceDialog()}
      {renderProjectDialog()}
      {renderSkillDialog()}
      {renderTemplateDialog()}
      {renderShareDialog()}
      {renderConfirmDialog()}
      {renderResumeNameDialog()}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
      
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={saving}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>Saving your resume...</Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default CVBuilder; 