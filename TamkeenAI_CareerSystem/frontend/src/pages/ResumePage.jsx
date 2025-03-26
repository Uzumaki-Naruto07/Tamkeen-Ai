import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Tabs, Tab,
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton,
  Grid, List, ListItem, ListItemText,
  ListItemSecondaryAction, Alert, Divider
} from '@mui/material';
import {
  Description, Add, Delete, Edit,
  Download, Share, Analytics, Compare
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useResume } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import ResumeBuilder from '../components/ResumeBuilder';
import ResumeAnalyzer from '../components/ResumeAnalyzer';
import JobMatchCalculator from '../components/JobMatchCalculator';
import WordCloudVisualizer from '../components/WordCloudVisualizer';
import LoadingSpinner from '../components/LoadingSpinner';

const ResumePage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { profile } = useUser();
  const { setCurrentResume } = useResume();
  
  // Fetch user's resumes
  useEffect(() => {
    const fetchResumes = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiEndpoints.documents.getUserResumes(profile.id);
        setResumes(response.data);
        
        // If resumeId is provided in URL, select that resume
        if (resumeId) {
          const resume = response.data.find(r => r.id === resumeId);
          if (resume) {
            setSelectedResume(resume);
            setCurrentResume(resume);
          } else {
            setError(`Resume with ID ${resumeId} not found`);
          }
        } else if (response.data.length > 0) {
          // Otherwise select the first resume
          setSelectedResume(response.data[0]);
          setCurrentResume(response.data[0]);
        }
      } catch (err) {
        setError('Failed to load your resumes');
        console.error('Error fetching resumes:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResumes();
  }, [profile, resumeId, setCurrentResume]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle creating a new resume
  const handleCreateResume = async () => {
    if (!newResumeTitle.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await apiEndpoints.documents.createResume({
        title: newResumeTitle,
        userId: profile.id
      });
      
      // Add new resume to list and select it
      setResumes(prev => [...prev, response.data]);
      setSelectedResume(response.data);
      setCurrentResume(response.data);
      setDialogOpen(false);
      setNewResumeTitle('');
      
      // Navigate to the edit tab
      setTabValue(0);
    } catch (err) {
      setError('Failed to create new resume');
      console.error('Error creating resume:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle saving resume
  const handleSaveResume = async (resumeData) => {
    setLoading(true);
    
    try {
      const response = await apiEndpoints.documents.updateResume(selectedResume.id, {
        ...resumeData,
        userId: profile.id
      });
      
      // Update resume in list
      setResumes(prev => prev.map(resume => 
        resume.id === selectedResume.id ? response.data : resume
      ));
      
      setSelectedResume(response.data);
      setCurrentResume(response.data);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save resume');
      console.error('Error saving resume:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deleting resume
  const handleDeleteResume = async () => {
    if (!resumeToDelete) return;
    
    setLoading(true);
    
    try {
      await apiEndpoints.documents.deleteResume(resumeToDelete.id);
      
      // Remove deleted resume from list
      setResumes(prev => prev.filter(resume => resume.id !== resumeToDelete.id));
      
      // If the deleted resume was selected, select another one
      if (selectedResume?.id === resumeToDelete.id) {
        const newSelectedResume = resumes.find(resume => resume.id !== resumeToDelete.id);
        setSelectedResume(newSelectedResume || null);
        setCurrentResume(newSelectedResume || null);
      }
      
      setDeleteDialog(false);
      setResumeToDelete(null);
    } catch (err) {
      setError('Failed to delete resume');
      console.error('Error deleting resume:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Render resume sidebar
  const renderResumeSidebar = () => (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">My Resumes</Typography>
        
        <Button
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          size="small"
        >
          New
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {resumes.length > 0 ? (
        <List>
          {resumes.map(resume => (
            <ListItem
              key={resume.id}
              button
              selected={selectedResume?.id === resume.id}
              onClick={() => {
                setSelectedResume(resume);
                setCurrentResume(resume);
                navigate(`/resume/${resume.id}`);
              }}
            >
              <ListItemText
                primary={resume.title}
                secondary={`Last updated: ${new Date(resume.updatedAt).toLocaleDateString()}`}
              />
              
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  size="small"
                  onClick={() => {
                    setResumeToDelete(resume);
                    setDeleteDialog(true);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography color="text.secondary">
            No resumes yet. Create your first resume!
          </Typography>
        </Box>
      )}
    </Paper>
  );
  
  // Render main resume area
  const renderResumeContent = () => {
    if (!selectedResume) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Description sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Resume Selected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please select a resume from the sidebar or create a new one.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Create New Resume
          </Button>
        </Paper>
      );
    }
    
    return (
      <Paper sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<Edit />} label="Edit" />
            <Tab icon={<Analytics />} label="Analyze" />
            <Tab icon={<Compare />} label="Job Match" />
            <Tab icon={<CloudQueue />} label="Word Cloud" />
          </Tabs>
        </Box>
        
        {tabValue === 0 && (
          <ResumeBuilder
            initialData={selectedResume}
            onSave={handleSaveResume}
          />
        )}
        
        {tabValue === 1 && (
          <ResumeAnalyzer resumeId={selectedResume.id} />
        )}
        
        {tabValue === 2 && (
          <JobMatchCalculator resumeId={selectedResume.id} />
        )}
        
        {tabValue === 3 && (
          <WordCloudVisualizer
            documentId={selectedResume.id}
            documentType="resume"
          />
        )}
      </Paper>
    );
  };
  
  if (loading && !selectedResume && resumes.length === 0) {
    return <LoadingSpinner message="Loading your resumes..." />;
  }
  
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Resume Builder
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Resume saved successfully!
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          {renderResumeSidebar()}
        </Grid>
        
        <Grid item xs={12} md={9}>
          {renderResumeContent()}
        </Grid>
      </Grid>
      
      {/* New Resume Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Create New Resume</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Resume Title"
            fullWidth
            value={newResumeTitle}
            onChange={(e) => setNewResumeTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateResume}
            variant="contained"
            disabled={!newResumeTitle.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Resume Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Resume</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{resumeToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteResume}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResumePage; 