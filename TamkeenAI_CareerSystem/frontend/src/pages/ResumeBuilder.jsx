import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Chip, Switch, FormControlLabel, Tooltip,
  CircularProgress, Alert, Tabs, Tab, Menu, MenuItem,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  Accordion, AccordionSummary, AccordionDetails, Stepper,
  Step, StepLabel, Collapse, InputAdornment, Badge,
  FormControl, InputLabel, Select, Snackbar, Avatar,
  Stack, Rating, Autocomplete, Slider, Pagination, LinearProgress
} from '@mui/material';
import {
  Add, Delete, Edit, Save, Launch, Print,
  CloudUpload, CloudDownload, Visibility, VisibilityOff,
  DragIndicator, ArrowUpward, ArrowDownward, FormatBold,
  FormatItalic, FormatUnderlined, FormatColorText, Link,
  FormatListBulleted, FormatListNumbered, Image, Timeline,
  School, Work, Star, Description, LocationOn, Phone,
  Email, Language, Code, Build, Psychology, Extension,
  PersonAdd, GitHub, LinkedIn, Twitter, Public, Computer,
  Assignment, Apartment, MenuBook, ExpandMore, Close,
  CheckCircle, FormatAlignLeft, FormatAlignCenter, FormatAlignRight,
  Add as AddIcon, CloudUpload as CloudUploadIcon, MoreVert,
  FileCopy, Share, Info, CheckCircleOutline, Send, Assessment,
  Undo, Redo, History, Settings, Portrait, Business
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ChromePicker } from 'react-color';
import SkillChip from '../components/SkillChip';

const ResumeBuilder = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [activeResumeId, setActiveResumeId] = useState(null);
  const [currentResume, setCurrentResume] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // 0: Edit, 1: Preview, 2: Templates
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState('modern');
  const [showAllSections, setShowAllSections] = useState(false);
  const [sectionEditId, setSectionEditId] = useState(null);
  const [sectionMenuAnchorEl, setSectionMenuAnchorEl] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [resumeNameDialogOpen, setResumeNameDialogOpen] = useState(false);
  const [newResumeName, setNewResumeName] = useState('');
  const [isNewResume, setIsNewResume] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#1976d2');
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resumeMenuAnchorEl, setResumeMenuAnchorEl] = useState(null);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [aiFeedbackOpen, setAiFeedbackOpen] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [aiGenerateOpen, setAiGenerateOpen] = useState(false);
  const [aiImportOpen, setAiImportOpen] = useState(false);
  const [aiGeneratePrompt, setAiGeneratePrompt] = useState('');
  
  const resumeRef = useRef();
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Load user's resumes
  useEffect(() => {
    const loadResumes = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch resumes
        const resumesResponse = await apiEndpoints.resumes.getUserResumes(profile.id);
        const userResumes = resumesResponse.data || [];
        setResumes(userResumes);
        
        // Set active resume if available
        if (userResumes.length > 0) {
          const defaultResume = userResumes.find(r => r.isDefault) || userResumes[0];
          setActiveResumeId(defaultResume.id);
          await loadResumeDetails(defaultResume.id);
        } else {
          setLoading(false);
        }
        
        // Fetch templates
        const templatesResponse = await apiEndpoints.resumes.getResumeTemplates();
        setTemplates(templatesResponse.data || []);
      } catch (err) {
        console.error('Error loading resumes:', err);
        setError('Failed to load resumes. Please try again later.');
        setLoading(false);
      }
    };
    
    loadResumes();
  }, [profile]);
  
  // Load resume details
  const loadResumeDetails = async (resumeId) => {
    if (!resumeId) return;
    
    setLoading(true);
    try {
      const resumeResponse = await apiEndpoints.resumes.getResumeDetails(resumeId);
      const resumeData = resumeResponse.data;
      
      setCurrentResume(resumeData);
      setSections(resumeData.sections || []);
      setActiveTemplate(resumeData.template || 'modern');
      setSelectedColor(resumeData.primaryColor || '#1976d2');
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading resume details:', err);
      setError('Failed to load resume details. Please try again later.');
      setLoading(false);
    }
  };
  
  // Handle print resume
  const handlePrint = useReactToPrint({
    content: () => resumeRef.current,
  });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Auto-save when switching to preview
    if (newValue === 1 && currentResume) {
      handleSaveResume();
    }
  };
  
  // Handle save resume
  const handleSaveResume = async () => {
    if (!currentResume) return;
    
    setSaving(true);
    try {
      const resumeData = {
        ...currentResume,
        sections,
        template: activeTemplate,
        primaryColor: selectedColor,
        lastUpdated: new Date().toISOString()
      };
      
      let response;
      if (isNewResume) {
        response = await apiEndpoints.resumes.createResume({
          ...resumeData,
          userId: profile.id,
          name: resumeData.name || 'Untitled Resume',
          createdAt: new Date().toISOString()
        });
        
        // Update state with the new resume
        const newResume = response.data;
        setResumes([...resumes, newResume]);
        setActiveResumeId(newResume.id);
        setIsNewResume(false);
        setCurrentResume(newResume);
      } else {
        response = await apiEndpoints.resumes.updateResume(currentResume.id, resumeData);
        
        // Update resumes list
        setResumes(
          resumes.map(resume => 
            resume.id === currentResume.id
              ? { ...resume, name: resumeData.name, lastUpdated: resumeData.lastUpdated }
              : resume
          )
        );
      }
      
      setSnackbarMessage('Resume saved successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error saving resume:', err);
      setSnackbarMessage('Failed to save resume');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle create new resume
  const handleCreateResume = () => {
    setNewResumeName('');
    setIsNewResume(true);
    setResumeNameDialogOpen(true);
  };
  
  // Confirm new resume creation
  const handleConfirmNewResume = () => {
    setResumeNameDialogOpen(false);
    
    const emptyResume = {
      id: 'temp-' + Date.now(),
      name: newResumeName || 'Untitled Resume',
      userId: profile.id,
      sections: [
        { id: 'header', type: 'header', title: 'Header', content: { name: profile.fullName, title: profile.title || 'Professional Title', contact: { email: profile.email, phone: profile.phone || '' } }, visible: true, order: 0 },
        { id: 'summary', type: 'summary', title: 'Professional Summary', content: { text: 'A brief summary of your professional background and key qualifications.' }, visible: true, order: 1 },
        { id: 'skills', type: 'skills', title: 'Skills', content: { skills: [] }, visible: true, order: 2 },
        { id: 'experience', type: 'experience', title: 'Work Experience', content: { jobs: [] }, visible: true, order: 3 },
        { id: 'education', type: 'education', title: 'Education', content: { education: [] }, visible: true, order: 4 }
      ],
      template: 'modern',
      primaryColor: '#1976d2',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    setCurrentResume(emptyResume);
    setSections(emptyResume.sections);
    setActiveTemplate('modern');
    setActiveTab(0);
    setSelectedColor('#1976d2');
  };

  // Rest of the component code...

  return (
    <Box>
      {/* Rest of the component JSX code... */}
    </Box>
  );
};

export default ResumeBuilder; 