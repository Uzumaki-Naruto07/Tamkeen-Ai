import React, { useState, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  Button, 
  Paper,
  Tabs, 
  Tab,
  CircularProgress,
  IconButton,
  Divider,
  Chip,
  Tooltip,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import LinkIcon from '@mui/icons-material/Link';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useJob } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const JobDescriptionInput = ({ onSubmit, initialData = null }) => {
  const [inputMethod, setInputMethod] = useState('paste');
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '');
  const [jobDescription, setJobDescription] = useState(initialData?.jobDescription || '');
  const [jobUrl, setJobUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [characterCount, setCharacterCount] = useState(jobDescription.length || 0);
  const fileInputRef = useRef(null);
  const { setJobDescription: setJobDescriptionContext } = useJob();

  const handleTabChange = (event, newValue) => {
    setInputMethod(newValue);
    // Clear previous inputs when changing tabs
    if (newValue !== 'paste') setJobDescription('');
    if (newValue !== 'url') setJobUrl('');
    if (newValue !== 'file') setFile(null);
  };

  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    setJobDescription(text);
    setCharacterCount(text.length);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const validTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, Word or TXT document');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const extractFromUrl = async () => {
    if (!jobUrl) {
      setError('Please enter a job posting URL');
      return;
    }
    
    if (!jobUrl.startsWith('http')) {
      setError('Please enter a valid URL (starting with http:// or https://)');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await apiEndpoints.jobs.analyze({ type: 'url', data: { url: jobUrl } });
      const extractedData = response.data;
      
      setJobTitle(extractedData.title || '');
      setJobDescription(extractedData.description || '');
      setCharacterCount((extractedData.description || '').length);
      
      // Switch to paste view to show the extracted content
      setInputMethod('paste');
      setLoading(false);
    } catch (err) {
      console.error('URL extraction failed:', err);
      setError(err.response?.data?.message || 'Failed to extract job description from URL. Please try another input method.');
      setLoading(false);
    }
  };

  const extractFromFile = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await apiEndpoints.jobs.analyze({ type: 'file', data: formData });
      const extractedData = response.data;
      
      setJobTitle(extractedData.title || '');
      setJobDescription(extractedData.description || '');
      setCharacterCount((extractedData.description || '').length);
      
      // Switch to paste view to show the extracted content
      setInputMethod('paste');
      setLoading(false);
    } catch (err) {
      console.error('File extraction failed:', err);
      setError(err.response?.data?.message || 'Failed to extract job description from file. Please try another input method.');
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!jobTitle.trim()) {
      setError('Please enter a job title');
      return;
    }
    
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }
    
    if (jobDescription.length < 50) {
      setError('Job description is too short. Please provide more details.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let response;
      
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        response = await apiEndpoints.jobs.analyze({ type: 'file', data: formData });
      } else if (jobUrl) {
        response = await apiEndpoints.jobs.analyze({ type: 'url', data: { url: jobUrl } });
      } else {
        response = await apiEndpoints.jobs.analyze({ type: 'text', data: { text: jobDescription } });
      }
      
      // Update job context
      setJobDescriptionContext(response.data);
      
      // Call submission handler
      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze job description');
      console.error('Job description analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async (e) => {
    // This function lets the user paste the job description and automatically extract the title
    const pastedText = e.clipboardData.getData('text');
    if (pastedText && pastedText.length > 50) {
      setJobDescription(pastedText);
      setCharacterCount(pastedText.length);
      
      // Try to automatically extract the job title if not already set
      if (!jobTitle) {
        try {
          const response = await apiEndpoints.jobs.analyze({ type: 'text', data: { text: pastedText } });
          if (response.data && response.data.title) {
            setJobTitle(response.data.title);
          }
        } catch (err) {
          console.warn('Failed to auto-extract job title:', err);
          // No need to show an error to the user as this is just a convenience feature
        }
      }
    }
  };

  const handleClear = () => {
    if (inputMethod === 'paste') {
      setJobDescription('');
      setCharacterCount(0);
    } else if (inputMethod === 'url') {
      setJobUrl('');
    } else if (inputMethod === 'file') {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Job Description
      </Typography>
      
      <Paper variant="outlined" sx={{ mb: 3, p: 3, borderRadius: 2 }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Job Title"
            fullWidth
            variant="outlined"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g., Senior Software Engineer, Data Scientist, Product Manager"
            InputProps={{
              startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>#</Box>
            }}
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Tabs
          value={inputMethod}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab 
            icon={<ContentPasteIcon />} 
            label="Paste" 
            value="paste" 
            iconPosition="start" 
          />
          <Tab 
            icon={<LinkIcon />} 
            label="URL" 
            value="url" 
            iconPosition="start" 
          />
          <Tab 
            icon={<FileUploadIcon />} 
            label="File" 
            value="file" 
            iconPosition="start" 
          />
        </Tabs>
        
        {inputMethod === 'paste' && (
          <Box>
            <TextField
              label="Job Description"
              multiline
              rows={10}
              fullWidth
              variant="outlined"
              value={jobDescription}
              onChange={handleDescriptionChange}
              onPaste={handlePaste}
              placeholder="Paste the full job description here..."
              error={!!error && error.includes('description')}
              helperText={
                (!!error && error.includes('description')) 
                  ? error 
                  : `${characterCount} characters (min: 50)`
              }
              InputProps={{
                endAdornment: jobDescription ? (
                  <Tooltip title="Clear">
                    <IconButton 
                      onClick={handleClear}
                      edge="end"
                      sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                ) : null
              }}
            />
          </Box>
        )}
        
        {inputMethod === 'url' && (
          <Box>
            <TextField
              label="Job Posting URL"
              fullWidth
              variant="outlined"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://www.example.com/jobs/data-scientist"
              error={!!error && error.includes('URL')}
              helperText={!!error && error.includes('URL') ? error : "Enter the URL of the job posting"}
              disabled={loading}
              InputProps={{
                startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>🔗</Box>,
                endAdornment: jobUrl ? (
                  <Tooltip title="Clear">
                    <IconButton 
                      onClick={handleClear}
                      edge="end"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                ) : null
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={extractFromUrl}
              sx={{ mt: 2 }}
              disabled={loading || !jobUrl}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LinkIcon />}
            >
              {loading ? 'Extracting...' : 'Extract from URL'}
            </Button>
          </Box>
        )}
        
        {inputMethod === 'file' && (
          <Box>
            <Box
              sx={{
                border: '1px dashed',
                borderColor: 'grey.400',
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                mb: 2,
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)'
                }
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
              {!file ? (
                <Typography color="text.secondary">
                  Click to select a file or drag & drop here
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <CheckCircleIcon color="success" />
                  <Typography>{file.name}</Typography>
                  <Tooltip title="Remove file">
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              Supported formats: PDF, DOC, DOCX, TXT (Max 5MB)
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={extractFromFile}
              sx={{ mt: 2, display: 'block' }}
              disabled={loading || !file}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FileUploadIcon />}
            >
              {loading ? 'Extracting...' : 'Extract from File'}
            </Button>
          </Box>
        )}
        
        {error && !error.includes('description') && !error.includes('URL') && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Box>
            {jobTitle && jobDescription && (
              <Chip
                label={`${(jobDescription.split(' ').filter(word => word.length > 0).length)} words`}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading || !jobTitle || !jobDescription}
            startIcon={loading ? <LoadingSpinner size="small" type="circular" /> : <SaveIcon />}
          >
            {loading ? 'Analyzing...' : 'Analyze Job Description'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default JobDescriptionInput;
