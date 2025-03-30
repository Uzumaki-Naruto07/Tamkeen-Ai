import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button,
  Grid, MenuItem, FormControl, InputLabel,
  Select, CircularProgress, Alert, Divider,
  Stepper, Step, StepLabel, StepContent,
  Radio, RadioGroup, FormControlLabel,
  Slider, Chip, Tooltip
} from '@mui/material';
import {
  Description, Work, Person, Send,
  Save, Download, Preview, Refresh,
  AutoAwesome, Psychology, FormatQuote
} from '@mui/icons-material';
import { useUser, useResume, useJob } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const CoverLetterGenerator = ({ resumeId, jobId, onGenerated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    hiringManager: '',
    tonality: 'professional',
    format: 'standard',
    customInstructions: '',
    focusAreas: [],
    creativityLevel: 0.7
  });
  const [generatedContent, setGeneratedContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [coverLetterId, setCoverLetterId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { profile } = useUser();
  const { currentResume } = useResume();
  const { currentJobDescription } = useJob();
  
  // Use provided IDs or get from context
  const effectiveResumeId = resumeId || currentResume?.id;
  const effectiveJobId = jobId || currentJobDescription?.id;
  
  // Pre-fill form data if job info is available
  useEffect(() => {
    if (currentJobDescription) {
      setFormData(prev => ({
        ...prev,
        jobTitle: currentJobDescription.title || '',
        companyName: currentJobDescription.company || ''
      }));
    }
  }, [currentJobDescription]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle step navigation
  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  // Generate cover letter with LLM
  const handleGenerate = async () => {
    if (!effectiveResumeId) {
      setError('Resume is required to generate a cover letter');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // This connects to an LLM service (GPT)
      const response = await apiEndpoints.ai.generateCoverLetter({
        resumeId: effectiveResumeId,
        jobId: effectiveJobId,
        params: {
          ...formData,
          userId: profile?.id
        }
      });
      
      setGeneratedContent(response.data.content);
      setCoverLetterId(response.data.id);
      setActiveStep(1);
      
      if (onGenerated) {
        onGenerated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate cover letter');
      console.error('Error generating cover letter:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Save generated cover letter
  const handleSave = async () => {
    if (!generatedContent) {
      setError('No content to save');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        content: generatedContent,
        title: `Cover Letter - ${formData.companyName} - ${formData.jobTitle}`,
        userId: profile?.id,
        resumeId: effectiveResumeId,
        jobId: effectiveJobId || undefined,
        metadata: {
          template: selectedTemplate,
          generationParameters: formData
        }
      };
      
      let response;
      
      if (coverLetterId) {
        // Update existing cover letter
        response = await apiEndpoints.documents.updateCoverLetter(coverLetterId, payload);
      } else {
        // Create new cover letter
        response = await apiEndpoints.documents.createCoverLetter(payload);
        setCoverLetterId(response.data.id);
      }
      
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save cover letter');
      console.error('Cover letter save error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate PDF of cover letter
  const handleGeneratePDF = async () => {
    if (!coverLetterId) {
      // Save first if not already saved
      await handleSave();
      if (!coverLetterId) return; // Exit if save failed
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // This connects to report_generator.py for PDF generation
      const response = await apiEndpoints.reports.generate({
        documentId: coverLetterId,
        reportType: 'cover_letter',
        format: 'pdf',
        options: {
          template: selectedTemplate,
          includeLetterhead: true
        }
      });
      
      // Create download link
      const link = document.createElement('a');
      link.href = response.data.reportUrl;
      link.download = response.data.fileName || 'cover-letter.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate PDF');
      console.error('PDF generation error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Regenerate with different parameters
  const handleRegenerate = () => {
    setActiveStep(0);
    setSuccess(false);
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
          <AutoAwesome sx={{ mr: 1 }} />
          AI Cover Letter Generator
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Cover letter generated successfully!
        </Alert>
      )}
      
      <Stepper activeStep={activeStep} orientation="vertical">
        {/* Step 1: Job Information */}
        <Step key="jobInfo">
          <StepLabel>
            <Typography variant="subtitle1">
              <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
              Job Information
            </Typography>
          </StepLabel>
          <StepContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Hiring Manager"
                  name="hiringManager"
                  value={formData.hiringManager}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tonality</InputLabel>
                  <Select
                    value={formData.tonality}
                    onChange={(e) => handleInputChange({ target: { name: 'tonality', value: e.target.value } })}
                  >
                    <MenuItem value="professional">Professional</MenuItem>
                    <MenuItem value="friendly">Friendly</MenuItem>
                    <MenuItem value="casual">Casual</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Format</InputLabel>
                  <Select
                    value={formData.format}
                    onChange={(e) => handleInputChange({ target: { name: 'format', value: e.target.value } })}
                  >
                    <MenuItem value="standard">Standard</MenuItem>
                    <MenuItem value="modern">Modern</MenuItem>
                    <MenuItem value="creative">Creative</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Custom Instructions"
                  name="customInstructions"
                  value={formData.customInstructions}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  <FormatQuote sx={{ mr: 1 }} />
                  Generated Cover Letter
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'serif', 
                    fontSize: '1rem',
                    lineHeight: 1.8
                  }}>
                    {generatedContent}
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={handleRegenerate}
                  >
                    Regenerate
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Preview />}
                    onClick={() => {
                      // Preview in a new tab
                      const win = window.open('', '_blank');
                      win.document.write(`
                        <html>
                          <head>
                            <title>Cover Letter Preview</title>
                            <style>
                              body { font-family: serif; line-height: 1.8; padding: 40px; max-width: 800px; margin: auto; }
                            </style>
                          </head>
                          <body>
                            <div style="white-space: pre-wrap;">
                              ${generatedContent}
                            </div>
                          </body>
                        </html>
                      `);
                    }}
                  >
                    Preview
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    Save
                  </Button>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Download />}
                    onClick={handleGeneratePDF}
                    disabled={loading}
                  >
                    Download PDF
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </StepContent>
        </Step>
      </Stepper>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <LoadingSpinner message={activeStep === 0 ? "Generating your cover letter..." : "Processing..."} />
        </Box>
      )}
    </Paper>
  );
};

export default CoverLetterGenerator; 