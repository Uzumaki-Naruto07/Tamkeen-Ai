import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField,
  CircularProgress, Grid, Card, CardContent,
  List, ListItem, ListItemText, Divider,
  Chip, Alert, LinearProgress
} from '@mui/material';
import {
  WorkOutline, CheckCircle, ErrorOutline,
  CloudUpload, CompareArrows
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import apiEndpoints from '../utils/api';
import { useUser } from '../context/AppContext';

// Styled components
const MatchPercentage = styled(Box)(({ theme, match }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: 120,
  height: 120,
  borderRadius: '50%',
  border: `4px solid ${
    match >= 80 ? theme.palette.success.main :
    match >= 60 ? theme.palette.warning.main :
    theme.palette.error.main
  }`,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
}));

const Input = styled('input')({
  display: 'none',
});

const JobMatchCalculator = ({ resumeId, jobData, compact = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobDescFile, setJobDescFile] = useState(null);
  const [matchResults, setMatchResults] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const { profile } = useUser();

  // If jobData is provided, use it
  useEffect(() => {
    if (jobData) {
      setJobDescription(jobData.description || '');
    }
  }, [jobData]);

  // Calculate match when resumeId and jobDescription are available
  useEffect(() => {
    if ((resumeId && jobDescription) || (resumeId && jobData)) {
      calculateMatch();
    }
  }, [resumeId, jobDescription, jobData]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setJobDescFile(file);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          setUploadingFile(true);
          const content = e.target.result;
          
          // For text files, use the content directly
          if (file.type === 'text/plain') {
            setJobDescription(content);
          } else {
            // For PDF or other files, we would need to send it to the backend
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await apiEndpoints.resume.extractTextFromFile(formData);
            setJobDescription(response.data.text);
          }
        } catch (err) {
          setError('Failed to process the file. Please try again or paste the job description manually.');
          console.error('Error processing file:', err);
        } finally {
          setUploadingFile(false);
        }
      };
      
      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  };

  const calculateMatch = async () => {
    if (!resumeId) {
      setError('No resume selected. Please select a resume first.');
      return;
    }

    if (!jobDescription && !jobData) {
      setError('Please provide a job description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the API to calculate match
      const response = await apiEndpoints.resume.calculateJobMatch(resumeId, {
        jobDescription: jobDescription || (jobData ? jobData.description : ''),
        jobId: jobData ? jobData.id : null
      });
      
      setMatchResults(response.data);
    } catch (err) {
      setError('Failed to calculate job match. Please try again.');
      console.error('Error calculating job match:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderCompactView = () => {
    if (!matchResults) {
      return (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          {loading ? (
            <CircularProgress size={24} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No match data available
            </Typography>
          )}
        </Box>
      );
    }

    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2" gutterBottom>
              Match Score
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={matchResults.overallMatch} 
              color={
                matchResults.overallMatch >= 80 ? 'success' :
                matchResults.overallMatch >= 60 ? 'warning' : 'error'
              }
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
          <Typography variant="h6" sx={{ ml: 2 }}>
            {matchResults.overallMatch}%
          </Typography>
        </Box>

        {matchResults.missingKeywords && matchResults.missingKeywords.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              Missing Keywords
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {matchResults.missingKeywords.slice(0, 5).map((keyword, index) => (
                <Chip 
                  key={index} 
                  label={keyword} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              ))}
              {matchResults.missingKeywords.length > 5 && (
                <Chip 
                  label={`+${matchResults.missingKeywords.length - 5} more`} 
                  size="small" 
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  const renderFullView = () => (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Job Description Analysis
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Paste Job Description"
              multiline
              rows={6}
              fullWidth
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              variant="outlined"
              placeholder="Paste the job description here to analyze match with your resume..."
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <label htmlFor="job-description-file">
                <Input
                  id="job-description-file"
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileUpload}
                />
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  disabled={uploadingFile}
                >
                  {uploadingFile ? 'Processing...' : 'Upload Description'}
                </Button>
              </label>
              
              <Button
                variant="contained"
                startIcon={<CompareArrows />}
                onClick={calculateMatch}
                disabled={loading || !jobDescription}
              >
                {loading ? 'Calculating...' : 'Calculate Match'}
              </Button>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {loading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Analyzing job match...
                </Typography>
              </Box>
            ) : matchResults ? (
              <Box>
                <MatchPercentage match={matchResults.overallMatch}>
                  <Typography variant="h4" color="text.primary">
                    {matchResults.overallMatch}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Match
                  </Typography>
                </MatchPercentage>
                
                <Typography variant="body2" align="center" gutterBottom>
                  {matchResults.overallMatch >= 80 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.main' }}>
                      <CheckCircle sx={{ mr: 0.5 }} fontSize="small" />
                      Excellent match! You're highly qualified.
                    </Box>
                  ) : matchResults.overallMatch >= 60 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'warning.main' }}>
                      <CheckCircle sx={{ mr: 0.5 }} fontSize="small" />
                      Good match! With a few improvements, you can be a strong candidate.
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'error.main' }}>
                      <ErrorOutline sx={{ mr: 0.5 }} fontSize="small" />
                      Low match. Consider enhancing your skills or targeting different roles.
                    </Box>
                  )}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <WorkOutline sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" align="center">
                  Enter a job description to see how well your resume matches
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {matchResults && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              ATS Score Breakdown
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider', 
                  borderRadius: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Typography variant="subtitle1" gutterBottom>Keyword Match</Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                    <CircularProgress
                      variant="determinate"
                      value={matchResults.keywordMatchScore || (matchResults.matchingKeywords?.length / Math.max(1, matchResults.matchingKeywords?.length + matchResults.missingKeywords?.length) * 100) || 0}
                      size={80}
                      thickness={4}
                      sx={{ color: theme => theme.palette.primary.main }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="body1" component="div" fontWeight="bold">
                        {Math.round(matchResults.keywordMatchScore || (matchResults.matchingKeywords?.length / Math.max(1, matchResults.matchingKeywords?.length + matchResults.missingKeywords?.length) * 100) || 0)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {matchResults.matchingKeywords?.length || 0} of {(matchResults.matchingKeywords?.length || 0) + (matchResults.missingKeywords?.length || 0)} keywords
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider', 
                  borderRadius: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Typography variant="subtitle1" gutterBottom>Content Match</Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                    <CircularProgress
                      variant="determinate"
                      value={matchResults.contentMatchScore || Math.min(matchResults.overallMatch + 10, 100)}
                      size={80}
                      thickness={4}
                      sx={{ color: theme => theme.palette.success.main }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="body1" component="div" fontWeight="bold">
                        {Math.round(matchResults.contentMatchScore || Math.min(matchResults.overallMatch + 10, 100))}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Contextual relevance of your experience
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider', 
                  borderRadius: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Typography variant="subtitle1" gutterBottom>ATS Readability</Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1 }}>
                    <CircularProgress
                      variant="determinate"
                      value={matchResults.readabilityScore || Math.min(90, Math.max(60, matchResults.overallMatch))}
                      size={80}
                      thickness={4}
                      sx={{ color: theme => theme.palette.warning.main }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="body1" component="div" fontWeight="bold">
                        {Math.round(matchResults.readabilityScore || Math.min(90, Math.max(60, matchResults.overallMatch)))}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    How well ATS systems can parse your resume
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Analysis Summary
              </Typography>
              <Typography variant="body2">
                {matchResults.overallMatch >= 80 ? (
                  <span>
                    <strong>Strong alignment in core areas:</strong> Your resume shows excellent keyword alignment and content relevance for this position. The ATS system will likely rank your application highly.
                  </span>
                ) : matchResults.overallMatch >= 60 ? (
                  <span>
                    <strong>Good alignment with improvement areas:</strong> Your resume matches many key requirements, but adding the missing keywords and strengthening content relevance would improve your ATS ranking.
                  </span>
                ) : (
                  <span>
                    <strong>Limited alignment with this position:</strong> Your resume doesn't align well with this job's requirements. Consider adding more relevant skills and experience or targeting positions that better match your profile.
                  </span>
                )}
              </Typography>
            </Box>
          </Paper>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Matching Skills
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {matchResults.matchingKeywords && matchResults.matchingKeywords.length > 0 ? (
                    <List dense>
                      {matchResults.matchingKeywords.map((keyword, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={keyword} />
                          <CheckCircle color="success" fontSize="small" />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                      No matching skills found
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Missing Skills
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {matchResults.missingKeywords && matchResults.missingKeywords.length > 0 ? (
                    <List dense>
                      {matchResults.missingKeywords.map((keyword, index) => (
                        <ListItem key={index}>
                          <ListItemText 
                            primary={keyword} 
                            secondary="Consider adding this skill to your resume"
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                      No missing skills found
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );

  return compact ? renderCompactView() : renderFullView();
};

export default JobMatchCalculator; 