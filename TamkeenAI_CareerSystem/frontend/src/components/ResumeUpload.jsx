import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  IconButton, 
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Tooltip
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import DoneIcon from '@mui/icons-material/Done';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../api/api';

const ResumeUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Check file type
      const fileType = selectedFile.type;
      const validTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      
      if (!validTypes.includes(fileType)) {
        setError('Please upload a PDF or Word document (.pdf, .docx, .doc)');
        return;
      }
      
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      const response = await api.uploadResume(formData);
      console.log('Upload successful:', response.data);
      setSuccess(true);
      
      // Call the parent callback with the resume data
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
      
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Resume upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      // Check file type
      const fileType = droppedFile.type;
      const validTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      
      if (!validTypes.includes(fileType)) {
        setError('Please upload a PDF or Word document (.pdf, .docx, .doc)');
        return;
      }
      
      // Check file size (5MB limit)
      if (droppedFile.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      
      setFile(droppedFile);
      setError(null);
    }
  };

  const getFileIcon = () => {
    if (!file) return null;
    
    const fileType = file.type;
    if (fileType === 'application/pdf') {
      return <DescriptionIcon sx={{ fontSize: 48, color: '#f44336' }} />;
    } else {
      return <ArticleIcon sx={{ fontSize: 48, color: '#2196f3' }} />;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderStyle: 'dashed',
          borderColor: file ? 'primary.main' : 'grey.400',
          backgroundColor: file ? 'rgba(0, 0, 0, 0.02)' : 'white',
          borderRadius: 2,
          textAlign: 'center',
          mb: 2,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'rgba(0, 0, 0, 0.02)'
          }
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        
        {!file ? (
          <Box>
            <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag & Drop your resume here
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or click to browse files
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supports PDF, DOC, DOCX (Max 5MB)
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {getFileIcon()}
            <Typography variant="subtitle1" sx={{ mt: 1, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
            
            {success && (
              <Chip 
                icon={<DoneIcon />} 
                label="Successfully uploaded" 
                color="success" 
                size="small"
                sx={{ mt: 1 }}
              />
            )}
            
            <Tooltip title="Remove file">
              <IconButton 
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                sx={{ mt: 1 }}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <FileUploadIcon />}
          onClick={handleUpload}
          disabled={!file || uploading || success}
          sx={{ minWidth: 200 }}
        >
          {uploading ? 'Uploading...' : success ? 'Uploaded' : 'Upload Resume'}
        </Button>
      </Box>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResumeUpload; 