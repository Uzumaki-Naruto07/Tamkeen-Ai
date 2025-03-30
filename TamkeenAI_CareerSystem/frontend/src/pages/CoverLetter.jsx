import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Tabs, Tab,
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton,
  Grid, List, ListItem, ListItemText,
  ListItemSecondaryAction, Alert, Divider,
  MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import {
  Description, Add, Delete, Edit,
  Download, Analytics, AutoAwesome,
  CloudQueue
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useResume, useJob } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import CoverLetterGenerator from '../components/CoverLetterGenerator';
import CoverLetterAnalyzer from '../components/CoverLetterAnalyzer';
import WordCloudVisualizer from '../components/WordCloudVisualizer';
import LoadingSpinner from '../components/LoadingSpinner';

const CoverLetterPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [coverLetters, setCoverLetters] = useState([]);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCoverLetterData, setNewCoverLetterData] = useState({
    title: '',
    resumeId: '',
    jobId: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [coverLetterToDelete, setCoverLetterToDelete] = useState(null);
  
  const { coverLetterId } = useParams();
  const navigate = useNavigate();
  const { profile } = useUser();
  const { resumes } = useResume();
  const { savedJobs } = useJob();
  
  // Fetch user's cover letters
  useEffect(() => {
    const fetchCoverLetters = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiEndpoints.documents.getUserCoverLetters(profile.id);
        setCoverLetters(response.data);
        
        // If coverLetterId is provided in URL, select that cover letter
        if (coverLetterId) {
          const coverLetter = response.data.find(cl => cl.id === coverLetterId);
          if (coverLetter) {
            setSelectedCoverLetter(coverLetter);
          } else {
            setError(`Cover letter with ID ${coverLetterId} not found`);
          }
        } else if (response.data.length > 0) {
          // Otherwise select the first cover letter
          setSelectedCoverLetter(response.data[0]);
        }
      } catch (err) {
        setError('Failed to load your cover letters');
        console.error('Error fetching cover letters:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoverLetters();
  }, [profile, coverLetterId]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle input change for new cover letter dialog
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCoverLetterData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle creating a new cover letter
  const handleCreateCoverLetter = async () => {
    if (!newCoverLetterData.title.trim()) return;
    
    setLoading(true);
    
    try {
      const response = await apiEndpoints.documents.createCoverLetter({
        ...newCoverLetterData,
        userId: profile.id
      });
      
      // Add new cover letter to list and select it
      setCoverLetters(prev => [...prev, response.data]);
      setSelectedCoverLetter(response.data);
      setDialogOpen(false);
      setNewCoverLetterData({
        title: '',
        resumeId: '',
        jobId: ''
      });
      
      // Navigate to the edit tab
      setTabValue(0);
      navigate(`/cover-letter/${response.data.id}`);
    } catch (err) {
      setError('Failed to create new cover letter');
      console.error('Error creating cover letter:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle saving cover letter
  const handleSaveCoverLetter = async (coverLetterData) => {
    setLoading(true);
    
    try {
      const response = await apiEndpoints.documents.updateCoverLetter(selectedCoverLetter.id, {
        ...coverLetterData,
        userId: profile.id
      });
      
      // Update cover letter in list
      setCoverLetters(prev => prev.map(cl => 
        cl.id === selectedCoverLetter.id ? response.data : cl
      ));
      
      setSelectedCoverLetter(response.data);
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save cover letter');
      console.error('Error saving cover letter:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle deleting cover letter
  const handleDeleteCoverLetter = async () => {
    if (!coverLetterToDelete) return;
    
    setLoading(true);
    
    try {
      await apiEndpoints.documents.deleteCoverLetter(coverLetterToDelete.id);
      
      // Remove deleted cover letter from list
      setCoverLetters(prev => prev.filter(cl => cl.id !== coverLetterToDelete.id));
      
      // If the deleted cover letter was selected, select another one
      if (selectedCoverLetter?.id === coverLetterToDelete.id) {
        const newSelectedCoverLetter = coverLetters.find(cl => cl.id !== coverLetterToDelete.id);
        setSelectedCoverLetter(newSelectedCoverLetter || null);
      }
      
      setDeleteDialog(false);
      setCoverLetterToDelete(null);
    } catch (err) {
      setError('Failed to delete cover letter');
      console.error('Error deleting cover letter:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Render cover letter sidebar
  const renderCoverLetterSidebar = () => (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">My Cover Letters</Typography>
        
        <Button
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          size="small"
        >
          New
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {coverLetters.length > 0 ? (
        <List>
          {coverLetters.map(coverLetter => (
            <ListItem
              key={coverLetter.id}
              button
              selected={selectedCoverLetter?.id === coverLetter.id}
              onClick={() => {
                setSelectedCoverLetter(coverLetter);
                navigate(`/cover-letter/${coverLetter.id}`);
              }}
            >
              <ListItemText
                primary={coverLetter.title}
                secondary={`Last updated: ${new Date(coverLetter.updatedAt).toLocaleDateString()}`}
              />
              
              <ListItemSecondaryAction>
                <IconButton 
                  edge="end" 
                  size="small"
                  onClick={() => {
                    setCoverLetterToDelete(coverLetter);
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
            No cover letters found. Create your first cover letter!
          </Typography>
        </Box>
      )}
    </Paper>
  );
  
  // Render cover letter content
  const renderCoverLetterContent = () => {
    if (!selectedCoverLetter) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Cover Letter Selected
          </Typography>
          
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Please select a cover letter from the list or create a new one.
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Create New Cover Letter
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
            <Tab icon={<AutoAwesome />} label="Generate" />
            <Tab icon={<Edit />} label="Edit" />
            <Tab icon={<Analytics />} label="Analyze" />
            <Tab icon={<CloudQueue />} label="Word Cloud" />
          </Tabs>
        </Box>
        
        {tabValue === 0 && (
          <CoverLetterGenerator
            coverLetterId={selectedCoverLetter.id}
            initialData={selectedCoverLetter}
            onSave={handleSaveCoverLetter}
          />
        )}
        
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Edit Cover Letter
            </Typography>
            
            <TextField
              fullWidth
              label="Title"
              value={selectedCoverLetter.title || ''}
              onChange={(e) => {
                setSelectedCoverLetter(prev => ({
                  ...prev,
                  title: e.target.value
                }));
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Content"
              multiline
              rows={20}
              value={selectedCoverLetter.content || ''}
              onChange={(e) => {
                setSelectedCoverLetter(prev => ({
                  ...prev,
                  content: e.target.value
                }));
              }}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={() => handleSaveCoverLetter(selectedCoverLetter)}
              >
                Save
              </Button>
            </Box>
          </Box>
        )}
        
        {tabValue === 2 && (
          <CoverLetterAnalyzer coverLetterId={selectedCoverLetter.id} />
        )}
        
        {tabValue === 3 && (
          <WordCloudVisualizer
            documentId={selectedCoverLetter.id}
            documentType="coverLetter"
          />
        )}
      </Paper>
    );
  };
  
  if (loading && !selectedCoverLetter && coverLetters.length === 0) {
    return <LoadingSpinner message="Loading your cover letters..." />;
  }
  
  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        Cover Letter Builder
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Cover letter saved successfully!
        </Alert>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          {renderCoverLetterSidebar()}
        </Grid>
        
        <Grid item xs={12} md={9}>
          {renderCoverLetterContent()}
        </Grid>
      </Grid>
      
      {/* New Cover Letter Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Create New Cover Letter</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Cover Letter Title"
            fullWidth
            value={newCoverLetterData.title}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Resume (Optional)</InputLabel>
            <Select
              name="resumeId"
              value={newCoverLetterData.resumeId}
              onChange={handleInputChange}
              label="Resume (Optional)"
            >
              <MenuItem value="">None</MenuItem>
              {resumes?.map((resume) => (
                <MenuItem key={resume.id} value={resume.id}>
                  {resume.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>Job Posting (Optional)</InputLabel>
            <Select
              name="jobId"
              value={newCoverLetterData.jobId}
              onChange={handleInputChange}
              label="Job Posting (Optional)"
            >
              <MenuItem value="">None</MenuItem>
              {savedJobs?.map((job) => (
                <MenuItem key={job.id} value={job.id}>
                  {job.title} at {job.company}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCoverLetter}
            variant="contained"
            disabled={!newCoverLetterData.title.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Cover Letter Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Cover Letter</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{coverLetterToDelete?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteCoverLetter}
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

export default CoverLetterPage; 