import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  CloudUpload, 
  FilePresent, 
  CheckCircle, 
  Delete 
} from '@mui/icons-material';
import { useUser } from '../context/AppContext';
import axios from 'axios';

/**
 * Component for uploading resume files
 */
const ResumeUploader = ({ onUploadSuccess, onFileSelect }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  
  const { profile } = useUser();
  
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    
    if (selectedFile) {
      // Check file format (.pdf, .docx, .doc)
      const validExtensions = ['pdf', 'docx', 'doc'];
      const fileExt = selectedFile.name.split('.').pop().toLowerCase();
      
      if (!validExtensions.includes(fileExt)) {
        setError('Invalid file format. Please upload PDF or Word documents only.');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
        setError('File size too large. Maximum size is 5MB.');
        return;
      }
      
      setFile(selectedFile);
      setTitle(selectedFile.name.split('.')[0]);
      setError(null);
      setOpen(true);
      
      // Notify parent component about file selection
      if (onFileSelect) {
        onFileSelect(selectedFile);
      }
    }
  };
  
  const handleUpload = async () => {
    if (!file || !title.trim() || !profile?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('userId', profile.id);
      
      // Use direct axios call to avoid auth token issues
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await axios({
        method: 'post',
        url: `${baseURL}/resume/upload`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
          // Explicitly NOT including auth header to avoid CORS issues
        }
      });
      
      setSuccess(true);
      setOpen(false);
      
      // Callback to parent component with the new resume
      // Note: We're not clearing the file here so it can be used for analysis
      if (onUploadSuccess) {
        onUploadSuccess({
          ...response.data,
          file: file  // Also pass the file object back to parent
        });
      }
    } catch (err) {
      setError('Failed to upload resume: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const cancelUpload = () => {
    setFile(null);
    setTitle('');
    setOpen(false);
  };
  
  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: 'center',
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          borderRadius: 2,
          cursor: 'pointer',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
        component="label"
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        
        <CloudUpload
          color="primary"
          sx={{ fontSize: 48, mb: 2 }}
        />
        
        <Typography variant="h6" gutterBottom>
          Upload Resume
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Drag and drop your resume file or click to browse
        </Typography>
        
        <Typography variant="caption" display="block" color="text.secondary">
          Supported formats: PDF, DOC, DOCX (Max size: 5MB)
        </Typography>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Upload Dialog */}
      <Dialog open={open} onClose={cancelUpload}>
        <DialogTitle>Resume Details</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 1 }}>
            <FilePresent color="primary" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {file?.name} ({(file?.size / 1024 / 1024).toFixed(2)} MB)
            </Typography>
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            label="Resume Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            helperText="Give your resume a name to help identify it"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelUpload} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            disabled={loading || !title.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Resume uploaded successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResumeUploader; 