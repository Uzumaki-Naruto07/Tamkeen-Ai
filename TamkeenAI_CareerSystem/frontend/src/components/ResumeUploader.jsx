import React, { useState } from 'react';
import { 
  Box, Button, Typography, Alert, 
  CircularProgress, Paper, IconButton
} from '@mui/material';
import { Upload, Delete, FileCopy } from '@mui/icons-material';
import { useResume } from './AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const ResumeUploader = ({ onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const { setCurrentResume, addResumeFile } = useResume();
  
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setLoading(true);
    setError(null);
    setProgress(0);
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      // Upload file
      const response = await apiEndpoints.resume.upload(formData);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Response includes parsed data from resume_parser.py
      const resumeData = response.data;
      addResumeFile(resumeData);
      setCurrentResume(resumeData);
      
      // Callback
      if (onUploadComplete) {
        onUploadComplete(resumeData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume');
      console.error('Resume upload error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Your Resume
      </Typography>
      
      <Box sx={{ my: 2 }}>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          id="resume-upload"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <label htmlFor="resume-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<Upload />}
            fullWidth
            disabled={loading}
          >
            Select Resume File
          </Button>
        </label>
      </Box>
      
      {file && (
        <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
          <FileCopy sx={{ mr: 1 }} />
          <Typography variant="body2" sx={{ flexGrow: 1 }}>
            {file.name}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => setFile(null)}
            disabled={loading}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading && (
        <Box sx={{ my: 2 }}>
          <LoadingSpinner 
            type="linear" 
            variant="determinate" 
            progress={progress} 
          />
          <Typography variant="caption" align="center" display="block" sx={{ mt: 1 }}>
            {progress < 100 ? 'Uploading...' : 'Processing resume...'}
          </Typography>
        </Box>
      )}
      
      <Button
        variant="contained"
        color="primary"
        fullWidth
        disabled={!file || loading}
        onClick={handleUpload}
        sx={{ mt: 2 }}
      >
        {loading ? 'Uploading...' : 'Upload Resume'}
      </Button>
    </Paper>
  );
};

export default ResumeUploader; 