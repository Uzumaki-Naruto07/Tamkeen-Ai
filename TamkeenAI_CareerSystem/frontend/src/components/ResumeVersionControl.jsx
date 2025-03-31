import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import {
  RestoreOutlined,
  CompareArrows,
  History,
  DeleteOutline,
  SaveAlt,
  Bookmark,
  BookmarkBorder,
  AddComment,
  CalendarToday,
  Schedule,
  CheckCircle,
  Cancel,
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';
import apiEndpoints from '../utils/api';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * ResumeVersionControl component allows users to view, compare, and restore previous 
 * versions of their resume
 */
const ResumeVersionControl = ({
  resumeId,
  onRestoreVersion,
  onSaveVersion,
  loading = false
}) => {
  const theme = useTheme();
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [compareVersion, setCompareVersion] = useState(null);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [error, setError] = useState(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [versionNotes, setVersionNotes] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  
  // Fetch resume versions
  useEffect(() => {
    if (resumeId) {
      fetchVersions();
    }
  }, [resumeId]);
  
  const fetchVersions = async () => {
    setLoadingVersions(true);
    setError(null);
    
    try {
      const response = await apiEndpoints.resumes.getVersions(resumeId);
      const versionsData = response.data || [];
      setVersions(versionsData);
      
      // Select current version by default
      if (versionsData.length > 0) {
        setSelectedVersion(versionsData[0]);
      }
    } catch (err) {
      console.error('Error fetching resume versions:', err);
      setError('Failed to load resume versions. Please try again.');
      
      // Mock data for development purposes
      const mockVersions = generateMockVersions();
      setVersions(mockVersions);
      if (mockVersions.length > 0) {
        setSelectedVersion(mockVersions[0]);
      }
    } finally {
      setLoadingVersions(false);
    }
  };
  
  const handleSaveVersion = async () => {
    if (!versionName.trim()) return;
    
    try {
      await onSaveVersion({
        name: versionName.trim(),
        notes: versionNotes.trim()
      });
      
      // Refresh versions list
      fetchVersions();
      setSaveDialogOpen(false);
      setVersionName('');
      setVersionNotes('');
    } catch (err) {
      console.error('Error saving resume version:', err);
      setError('Failed to save resume version. Please try again.');
    }
  };
  
  const handleRestoreVersion = async (version) => {
    if (!version) return;
    
    try {
      await onRestoreVersion(version.id);
      // Exit compare mode after restoring
      setCompareMode(false);
      setCompareVersion(null);
    } catch (err) {
      console.error('Error restoring resume version:', err);
      setError('Failed to restore resume version. Please try again.');
    }
  };
  
  const handleCompareMode = (versionToCompare) => {
    if (compareMode && compareVersion?.id === versionToCompare?.id) {
      // Exit compare mode if clicking the same version
      setCompareMode(false);
      setCompareVersion(null);
    } else {
      setCompareMode(true);
      setCompareVersion(versionToCompare);
    }
  };
  
  // Generate differences between two resume versions for comparing
  const getDifferences = () => {
    if (!selectedVersion || !compareVersion) return [];
    
    const differences = [];
    
    // Compare summary
    if (selectedVersion.summary !== compareVersion.summary) {
      differences.push({
        section: 'summary',
        title: 'Professional Summary',
        current: selectedVersion.summary || 'No summary',
        previous: compareVersion.summary || 'No summary'
      });
    }
    
    // Compare skills
    const currentSkills = new Set(selectedVersion.skills?.map(s => s.name) || []);
    const previousSkills = new Set(compareVersion.skills?.map(s => s.name) || []);
    
    const addedSkills = [...currentSkills].filter(s => !previousSkills.has(s));
    const removedSkills = [...previousSkills].filter(s => !currentSkills.has(s));
    
    if (addedSkills.length > 0 || removedSkills.length > 0) {
      differences.push({
        section: 'skills',
        title: 'Skills',
        addedItems: addedSkills,
        removedItems: removedSkills
      });
    }
    
    // Compare experience items - simplified comparison
    const currentExperience = selectedVersion.experience || [];
    const previousExperience = compareVersion.experience || [];
    
    // Check for added or removed experience entries
    if (currentExperience.length !== previousExperience.length) {
      differences.push({
        section: 'experience',
        title: 'Work Experience',
        message: `Changed from ${previousExperience.length} to ${currentExperience.length} entries`
      });
    } else {
      // Check for content changes within experience entries
      currentExperience.forEach((exp, index) => {
        if (
          index < previousExperience.length && 
          (exp.title !== previousExperience[index].title || 
           exp.company !== previousExperience[index].company ||
           exp.description !== previousExperience[index].description)
        ) {
          differences.push({
            section: 'experience',
            title: `Experience: ${exp.title || 'Untitled Position'}`,
            current: exp.description || '',
            previous: previousExperience[index].description || ''
          });
        }
      });
    }
    
    // Compare other sections as needed...
    
    return differences;
  };
  
  if (loading || loadingVersions) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading resume versions...
        </Typography>
      </Box>
    );
  }
  
  if (!resumeId) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Please select a resume to view its version history.
        </Typography>
      </Box>
    );
  }
  
  if (versions.length === 0 && !error) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <History sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.6, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Version History Yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Start saving versions of your resume to track changes over time.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Bookmark />}
          onClick={() => setSaveDialogOpen(true)}
        >
          Save Current Version
        </Button>
      </Box>
    );
  }
  
  // In compare mode, show side-by-side comparison
  if (compareMode && selectedVersion && compareVersion) {
    const differences = getDifferences();
    
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Comparing Resume Versions
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => {
              setCompareMode(false);
              setCompareVersion(null);
            }}
          >
            Back to Versions
          </Button>
        </Box>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: theme.palette.background.default }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Version
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedVersion.name || `Version ${selectedVersion.versionNumber}`}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {format(new Date(selectedVersion.date), 'PPP p')}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: theme.palette.background.default }}>
              <Typography variant="subtitle1" gutterBottom>
                Comparing With
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {compareVersion.name || `Version ${compareVersion.versionNumber}`}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {format(new Date(compareVersion.date), 'PPP p')}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {differences.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 50, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Differences Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              These resume versions are identical in content.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {differences.length} difference{differences.length !== 1 ? 's' : ''} found
            </Typography>
            
            {differences.map((diff, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    {diff.title}
                  </Typography>
                  
                  {diff.message && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {diff.message}
                    </Typography>
                  )}
                  
                  {(diff.current || diff.previous) && (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                          Current:
                        </Typography>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 1, 
                            bgcolor: theme.palette.success.light, 
                            minHeight: 60,
                            maxHeight: 200,
                            overflow: 'auto'
                          }}
                        >
                          <Typography variant="body2">
                            {diff.current || <em>Empty</em>}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                          Previous:
                        </Typography>
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 1, 
                            bgcolor: theme.palette.info.light, 
                            minHeight: 60,
                            maxHeight: 200,
                            overflow: 'auto'
                          }}
                        >
                          <Typography variant="body2">
                            {diff.previous || <em>Empty</em>}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  )}
                  
                  {(diff.addedItems || diff.removedItems) && (
                    <Box sx={{ mt: 2 }}>
                      {diff.addedItems?.length > 0 && (
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                            Added:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {diff.addedItems.map((item, idx) => (
                              <Chip 
                                key={idx}
                                size="small"
                                label={item}
                                color="success"
                                icon={<AddComment />}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {diff.removedItems?.length > 0 && (
                        <Box>
                          <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                            Removed:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {diff.removedItems.map((item, idx) => (
                              <Chip 
                                key={idx}
                                size="small"
                                label={item}
                                color="error"
                                icon={<DeleteOutline />}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<RestoreOutlined />}
                onClick={() => handleRestoreVersion(compareVersion)}
                sx={{ mr: 2 }}
              >
                Restore This Version
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setCompareMode(false);
                  setCompareVersion(null);
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    );
  }
  
  // Default view: show version history
  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <History sx={{ mr: 1, color: theme.palette.primary.main }} />
          Resume Version History
        </Typography>
        
        <Button 
          variant="contained"
          color="primary"
          startIcon={<Bookmark />}
          onClick={() => setSaveDialogOpen(true)}
        >
          Save Current Version
        </Button>
      </Box>
      
      {error && (
        <Box sx={{ mb: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Version</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Changes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {versions.map((version, index) => (
              <TableRow 
                key={version.id || index}
                hover
                selected={selectedVersion?.id === version.id}
                sx={{ 
                  cursor: 'pointer',
                  '&.Mui-selected': {
                    backgroundColor: `${theme.palette.primary.main}15`,
                  }
                }}
                onClick={() => setSelectedVersion(version)}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {version.isCurrent && (
                      <Tooltip title="Current Version">
                        <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                      </Tooltip>
                    )}
                    {version.name || `Version ${version.versionNumber || index + 1}`}
                    {version.isBookmarked && (
                      <Tooltip title="Bookmarked">
                        <Bookmark fontSize="small" color="primary" sx={{ ml: 1 }} />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {format(new Date(version.date), 'MMM d, yyyy')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDistanceToNow(new Date(version.date), { addSuffix: true })}
                  </Typography>
                </TableCell>
                <TableCell>
                  {version.changeCount ? (
                    <Chip 
                      size="small" 
                      label={`${version.changeCount} change${version.changeCount !== 1 ? 's' : ''}`}
                      color="primary"
                      variant="outlined"
                    />
                  ) : version.notes ? (
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {version.notes}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No changes recorded
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Tooltip title="Compare with current">
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompareMode(version);
                      }}
                      color={compareMode && compareVersion?.id === version.id ? "primary" : "default"}
                    >
                      <CompareArrows />
                    </IconButton>
                  </Tooltip>
                  {!version.isCurrent && (
                    <Tooltip title="Restore this version">
                      <IconButton 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestoreVersion(version);
                        }}
                      >
                        <RestoreOutlined />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {selectedVersion && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Version Details
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  {selectedVersion.name || `Version ${selectedVersion.versionNumber}`}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {format(new Date(selectedVersion.date), 'PPPP')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {format(new Date(selectedVersion.date), 'p')}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                {selectedVersion.stats && (
                  <List dense disablePadding>
                    <ListItem disablePadding>
                      <ListItemText 
                        primary="Skills" 
                        secondary={`${selectedVersion.stats.skillCount || 0} skills listed`}
                      />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemText 
                        primary="Experience" 
                        secondary={`${selectedVersion.stats.experienceCount || 0} positions`}
                      />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemText 
                        primary="Education" 
                        secondary={`${selectedVersion.stats.educationCount || 0} entries`}
                      />
                    </ListItem>
                  </List>
                )}
              </Grid>
            </Grid>
            
            {selectedVersion.notes && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Notes
                </Typography>
                <Typography variant="body2">
                  {selectedVersion.notes}
                </Typography>
              </Box>
            )}
            
            {!selectedVersion.isCurrent && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<RestoreOutlined />}
                  onClick={() => handleRestoreVersion(selectedVersion)}
                >
                  Restore This Version
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      )}
      
      {/* Save Version Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Current Resume Version</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Save your current resume as a version to track changes over time and have the ability to revert back if needed.
          </Typography>
          
          <TextField
            autoFocus
            margin="dense"
            id="version-name"
            label="Version Name (optional)"
            placeholder="e.g., 'After Skills Update' or 'Industry-Specific'"
            fullWidth
            variant="outlined"
            value={versionName}
            onChange={(e) => setVersionName(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="version-notes"
            label="Notes (optional)"
            placeholder="Describe what changes you made in this version"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={versionNotes}
            onChange={(e) => setVersionNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveVersion} 
            variant="contained" 
            startIcon={<Bookmark />}
          >
            Save Version
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Helper function to generate mock versions for development
const generateMockVersions = () => {
  const now = new Date();
  const dayInMillis = 24 * 60 * 60 * 1000;
  
  return [
    {
      id: 'v1',
      versionNumber: 3,
      name: 'Final Version',
      date: now.toISOString(),
      isCurrent: true,
      isBookmarked: true,
      changeCount: 4,
      notes: 'Added new technical skills and updated job descriptions with metrics',
      stats: {
        skillCount: 12,
        experienceCount: 3,
        educationCount: 2
      },
      summary: 'Senior frontend developer with 7+ years of experience building responsive and accessible web applications using React, TypeScript, and modern CSS frameworks.',
      skills: [
        { name: 'React' }, 
        { name: 'TypeScript' }, 
        { name: 'CSS' }, 
        { name: 'JavaScript' }, 
        { name: 'HTML' },
        { name: 'Node.js' },
        { name: 'Express' },
        { name: 'GraphQL' },
        { name: 'Jest' },
        { name: 'Git' },
        { name: 'Webpack' },
        { name: 'Docker' }
      ],
      experience: [
        { 
          title: 'Senior Frontend Developer', 
          company: 'Tech Solutions Inc', 
          description: 'Led development of responsive web applications using React, resulting in 45% increase in user engagement and 30% faster page load times.'
        },
        { 
          title: 'Web Developer', 
          company: 'Digital Agency', 
          description: 'Developed and maintained client websites using modern frontend technologies.'
        },
        { 
          title: 'Junior Developer', 
          company: 'StartUp Co', 
          description: 'Assisted in website development and maintenance.'
        }
      ]
    },
    {
      id: 'v2',
      versionNumber: 2,
      name: 'After Technical Review',
      date: new Date(now.getTime() - 7 * dayInMillis).toISOString(),
      changeCount: 2,
      stats: {
        skillCount: 8,
        experienceCount: 3,
        educationCount: 2
      },
      summary: 'Frontend developer with 7+ years of experience building responsive and accessible web applications.',
      skills: [
        { name: 'React' }, 
        { name: 'JavaScript' }, 
        { name: 'CSS' }, 
        { name: 'HTML' },
        { name: 'Node.js' },
        { name: 'Express' },
        { name: 'Jest' },
        { name: 'Git' }
      ],
      experience: [
        { 
          title: 'Senior Frontend Developer', 
          company: 'Tech Solutions Inc', 
          description: 'Led development of responsive web applications using React.'
        },
        { 
          title: 'Web Developer', 
          company: 'Digital Agency', 
          description: 'Developed and maintained client websites using modern frontend technologies.'
        },
        { 
          title: 'Junior Developer', 
          company: 'StartUp Co', 
          description: 'Assisted in website development and maintenance.'
        }
      ]
    },
    {
      id: 'v3',
      versionNumber: 1,
      name: 'Initial Version',
      date: new Date(now.getTime() - 14 * dayInMillis).toISOString(),
      isBookmarked: true,
      notes: 'First draft of resume',
      stats: {
        skillCount: 5,
        experienceCount: 2,
        educationCount: 1
      },
      summary: 'Frontend developer with experience building web applications.',
      skills: [
        { name: 'React' }, 
        { name: 'JavaScript' }, 
        { name: 'CSS' }, 
        { name: 'HTML' },
        { name: 'Git' }
      ],
      experience: [
        { 
          title: 'Frontend Developer', 
          company: 'Tech Solutions Inc', 
          description: 'Developing web applications using React.'
        },
        { 
          title: 'Web Developer', 
          company: 'Digital Agency', 
          description: 'Developing and maintaining client websites.'
        }
      ]
    }
  ];
};

export default ResumeVersionControl; 