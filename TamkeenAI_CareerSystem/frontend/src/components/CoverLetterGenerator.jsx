import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore,
  FormatQuote,
  Psychology,
  Edit,
  FileCopy,
  Download,
  Settings,
  Check
} from '@mui/icons-material';
import { useResume, useJob } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const CoverLetterGenerator = ({ resumeId, jobId }) => {
  const [formData, setFormData] = useState({
    tone: 'professional',
    focusAreas: [],
    customInstructions: '',
    coveredExperience: true,
    includeIntroduction: true,
    includeConclusion: true,
    maxLength: 'medium'
  });
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const { currentResume } = useResume();
  const { currentJobDescription } = useJob();
  const letterRef = useRef(null);
  
  // Use data from context if IDs not provided
  const effectiveResumeId = resumeId || (currentResume?.id);
  const effectiveJobId = jobId || (currentJobDescription?.id);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleGenerateLetter = async () => {
    if (!effectiveResumeId || !effectiveJobId) {
      setError('Both resume and job information are required');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await apiEndpoints.career.generateCoverLetter({
        resumeId: effectiveResumeId,
        jobId: effectiveJobId,
        options: formData
      });
      
      setGeneratedLetter(response.data.content);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate cover letter');
      console.error('Cover letter generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy text', err);
        });
    }
  };
  
  const handleDownload = () => {
    if (generatedLetter) {
      const element = document.createElement('a');
      const file = new Blob([generatedLetter], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = 'TamkeenAI_Cover_Letter.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };
  
  // Check if we can generate a letter
  const canGenerate = effectiveResumeId && effectiveJobId;
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        AI Cover Letter Generator
      </Typography>
      
      {!canGenerate && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please upload a resume and enter job details first to generate a cover letter.
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Cover Letter Options</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box component="form">
              <FormControl fullWidth margin="normal">
                <InputLabel id="tone-label">Tone</InputLabel>
                <Select
                  labelId="tone-label"
                  id="tone"
                  name="tone"
                  value={formData.tone}
                  onChange={handleChange}
                  label="Tone"
                  disabled={isGenerating}
                >
                  <MenuItem value="professional">Professional</MenuItem>
                  <MenuItem value="conversational">Conversational</MenuItem>
                  <MenuItem value="enthusiastic">Enthusiastic</MenuItem>
                  <MenuItem value="confident">Confident</MenuItem>
                  <MenuItem value="formal">Formal</MenuItem>
                </Select>
                <FormHelperText>Select the overall tone for your cover letter</FormHelperText>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="length-label">Length</InputLabel>
                <Select
                  labelId="length-label"
                  id="maxLength"
                  name="maxLength"
                  value={formData.maxLength}
                  onChange={handleChange}
                  label="Length"
                  disabled={isGenerating}
                >
                  <MenuItem value="short">Short (1 page)</MenuItem>
                  <MenuItem value="medium">Medium (1-2 paragraphs per section)</MenuItem>
                  <MenuItem value="detailed">Detailed (comprehensive)</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                margin="normal"
                id="customInstructions"
                name="customInstructions"
                label="Custom Instructions (optional)"
                multiline
                rows={3}
                value={formData.customInstructions}
                onChange={handleChange}
                placeholder="Any specific points you want to emphasize or include"
                disabled={isGenerating}
              />
              
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleGenerateLetter}
                  disabled={isGenerating || !canGenerate}
                  startIcon={isGenerating ? <LoadingSpinner size="small" /> : <Psychology />}
                >
                  {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {generatedLetter && (
        <Box sx={{ mt: 3 }}>
          <Paper 
            elevation={2} 
            sx={{ p: 3, mb: 2, minHeight: '300px', maxHeight: '500px', overflow: 'auto' }}
            ref={letterRef}
          >
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
              {generatedLetter}
            </Typography>
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={copied ? <Check /> : <FileCopy />}
              onClick={handleCopyToClipboard}
              color={copied ? 'success' : 'primary'}
            >
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default CoverLetterGenerator; 