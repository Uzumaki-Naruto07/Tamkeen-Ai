import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Modal,
  Tabs,
  Tab
} from '@mui/material';
import { 
  CloudUpload, 
  CreateNewFolder, 
  Close
} from '@mui/icons-material';
import ResumeUploader from './ResumeUploader';
import ResumeBuilder from './ResumeBuilder';

/**
 * ResumeUpload component that provides options to upload or create a resume
 */
const ResumeUpload = ({ onComplete }) => {
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleUploadSuccess = (resumeData) => {
    if (onComplete) {
      onComplete(resumeData);
    }
    handleClose();
  };
  
  const handleResumeCreated = (resumeData) => {
    if (onComplete) {
      onComplete(resumeData);
    }
    handleClose();
  };
  
  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<CloudUpload />}
        onClick={handleOpen}
      >
        Add Resume
      </Button>
      
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="resume-upload-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600 },
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          overflow: 'auto'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h2">
              Add Resume to Your Profile
            </Typography>
            <Button 
              onClick={handleClose}
              sx={{ minWidth: 'auto', p: 0.5 }}
            >
              <Close />
            </Button>
          </Box>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="resume upload tabs">
              <Tab 
                label="Upload Resume" 
                icon={<CloudUpload />} 
                iconPosition="start"
              />
              <Tab 
                label="Create New" 
                icon={<CreateNewFolder />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          {tabValue === 0 && (
            <ResumeUploader onUploadSuccess={handleUploadSuccess} />
          )}
          
          {tabValue === 1 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Create a new resume from scratch with our resume builder
              </Typography>
              
              <Button
                variant="contained"
                fullWidth
                color="primary"
                onClick={() => {
                  handleClose();
                  // Navigate to resume builder page
                  window.location.href = '/resume/new';
                }}
                sx={{ mt: 2 }}
              >
                Create New Resume
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ResumeUpload; 