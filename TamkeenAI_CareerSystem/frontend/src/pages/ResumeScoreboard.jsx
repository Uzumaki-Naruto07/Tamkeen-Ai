import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Tooltip,
  TextField, InputAdornment, Badge, Tab, Tabs, Collapse,
  ToggleButton, ToggleButtonGroup, LinearProgress, Radio,
  RadioGroup, FormControlLabel, Drawer, useMediaQuery, Slider
} from '@mui/material';
import {
  History, CompareArrows, Download, Visibility, VisibilityOff, Print,
  FilterList, DateRange, Share, CloudDownload, Info, Star, StarBorder,
  CheckCircle, MoreVert, ArrowUpward, ArrowDownward, Error as ErrorIcon,
  Warning, WbIncandescent, Assignment, Compare, Delete, Refresh,
  RestoreFromTrash, FormatColorText, FormatColorFill, FormatListBulleted,
  AddCircleOutline, RemoveCircleOutline, Cached, Save, Label, Bookmarks,
  ChatBubble, FindReplace, ChangeHistory, Timeline as TimelineIcon,
  SplitScreen, TextFields, FormatBold, FormatItalic, ViewColumn, RestorePage,
  DifferenceOutlined, CompareOutlined, StackedLineChart, SwapHorizontalCircle,
  VerticalSplit, SettingsBackupRestore, ArrowBack, ArrowForward, Add, Edit
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { useTheme } from '@mui/material/styles';
import ReactDiffViewer from 'react-diff-viewer';
import { Document, Page } from 'react-pdf';
import { PdfLoader } from 'react-pdf-js';

const ResumeScoreboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [resumeVersions, setResumeVersions] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [compareVersionId, setCompareVersionId] = useState(null);
  const [versionDiff, setVersionDiff] = useState({
    leftVersion: null,
    rightVersion: null,
  });
  const [diffView, setDiffView] = useState('split'); // split, unified
  const [diffHighlight, setDiffHighlight] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0: Compare, 1: Timeline, 2: All Versions
  const [filterMode, setFilterMode] = useState('all'); // all, recent, highScore, tagged
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showDiffDetails, setShowDiffDetails] = useState(true);
  const [restoringVersion, setRestoringVersion] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState(null);
  const [activeSection, setActiveSection] = useState('all'); // all, summary, experience, education, skills
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentVersion, setCommentVersion] = useState(null);
  
  const navigate = useNavigate();
  const { profile } = useUser();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const pdfContainerRef = useRef(null);
  
  // Load user's resumes
  useEffect(() => {
    const loadResumes = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiEndpoints.resumes.getAll(profile.id);
        const sortedResumes = response.data.sort((a, b) => 
          new Date(b.lastUpdated) - new Date(a.lastUpdated)
        );
        
        setResumes(sortedResumes);
        
        // Set first resume as selected by default
        if (sortedResumes.length > 0) {
          setSelectedResumeId(sortedResumes[0].id);
          await loadResumeVersions(sortedResumes[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading resumes:', err);
        setError('Failed to load your resumes. Please try again later.');
        setLoading(false);
      }
    };
    
    loadResumes();
  }, [profile?.id]);
  
  // Load versions for a specific resume
  const loadResumeVersions = async (resumeId) => {
    if (!resumeId) return;
    
    try {
      const response = await apiEndpoints.resumes.getVersions(resumeId);
      const sortedVersions = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setResumeVersions(sortedVersions);
      
      // Select most recent version by default and one before for comparison
      if (sortedVersions.length > 0) {
        setSelectedVersionId(sortedVersions[0].id);
        
        if (sortedVersions.length > 1) {
          setCompareVersionId(sortedVersions[1].id);
        }
        
        // Load diff if we have two versions
        if (sortedVersions.length > 1) {
          await loadVersionDiff(sortedVersions[0].id, sortedVersions[1].id);
        } else if (sortedVersions.length === 1) {
          setVersionDiff({
            leftVersion: sortedVersions[0],
            rightVersion: null
          });
        }
      }
      
    } catch (err) {
      console.error('Error loading resume versions:', err);
      setError('Failed to load resume versions. Please try again.');
    }
  };
  
  // Load diff between two versions
  const loadVersionDiff = async (leftVersionId, rightVersionId) => {
    if (!leftVersionId || !rightVersionId) return;
    
    try {
      const leftResponse = await apiEndpoints.resumes.getVersionDetails(leftVersionId);
      const rightResponse = await apiEndpoints.resumes.getVersionDetails(rightVersionId);
      
      setVersionDiff({
        leftVersion: leftResponse.data,
        rightVersion: rightResponse.data
      });
      
    } catch (err) {
      console.error('Error loading version diff:', err);
      setError('Failed to load version comparison. Please try again.');
    }
  };
  
  // Handle resume selection
  const handleResumeChange = async (event) => {
    const resumeId = event.target.value;
    setSelectedResumeId(resumeId);
    setSelectedVersionId(null);
    setCompareVersionId(null);
    setVersionDiff({
      leftVersion: null,
      rightVersion: null
    });
    
    await loadResumeVersions(resumeId);
  };
  
  // Handle version selection for comparison
  const handleVersionSelect = async (versionId, isRightSide = false) => {
    if (isRightSide) {
      setCompareVersionId(versionId);
      if (selectedVersionId) {
        await loadVersionDiff(selectedVersionId, versionId);
      }
    } else {
      setSelectedVersionId(versionId);
      if (compareVersionId) {
        await loadVersionDiff(versionId, compareVersionId);
      }
    }
  };
  
  // Swap comparison sides
  const handleSwapVersions = async () => {
    if (selectedVersionId && compareVersionId) {
      const temp = selectedVersionId;
      setSelectedVersionId(compareVersionId);
      setCompareVersionId(temp);
      
      await loadVersionDiff(compareVersionId, selectedVersionId);
    }
  };
  
  // Handle diff view mode change
  const handleDiffViewChange = (event, newValue) => {
    if (newValue !== null) {
      setDiffView(newValue);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy - h:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Calculate time ago for display
  const timeAgo = (dateString) => {
    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown time';
    }
  };
  
  // Handle restore version
  const handleRestoreVersion = async () => {
    if (!versionToRestore) return;
    
    setRestoringVersion(true);
    
    try {
      await apiEndpoints.resumes.restoreVersion(versionToRestore.id);
      
      // Reload versions to show new restored version
      await loadResumeVersions(selectedResumeId);
      
      setRestoringVersion(false);
      setRestoreDialogOpen(false);
      setError(null);
      
      // Show success message or snackbar here
    } catch (err) {
      console.error('Error restoring version:', err);
      setError('Failed to restore resume version. Please try again.');
      setRestoringVersion(false);
    }
  };
  
  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!commentVersion || !commentText.trim()) return;
    
    try {
      await apiEndpoints.resumes.addComment(commentVersion.id, {
        text: commentText,
        userId: profile.id,
        timestamp: new Date().toISOString()
      });
      
      // Reload version details to get updated comments
      await loadVersionDiff(selectedVersionId, compareVersionId);
      
      setCommentText('');
      setCommentOpen(false);
      
      // Show success message or snackbar here
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    }
  };
  
  // Handle download version
  const handleDownloadVersion = async (version) => {
    try {
      const response = await apiEndpoints.resumes.downloadVersion(version.id);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Resume_${version.versionLabel || version.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading version:', err);
      setError('Failed to download resume version. Please try again.');
    }
  };
  
  // Filter and sort versions based on current filter mode
  const getFilteredVersions = () => {
    if (!resumeVersions.length) return [];
    
    let filtered = [...resumeVersions];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        (v.versionLabel && v.versionLabel.toLowerCase().includes(term)) ||
        (v.title && v.title.toLowerCase().includes(term)) ||
        (v.tags && v.tags.some(tag => tag.toLowerCase().includes(term))) ||
        (v.comments && v.comments.some(c => c.text.toLowerCase().includes(term)))
      );
    }
    
    // Apply mode filter
    switch (filterMode) {
      case 'recent':
        // Already sorted by date
        filtered = filtered.slice(0, 5);
        break;
      case 'highScore':
        filtered = filtered.sort((a, b) => b.atsScore - a.atsScore);
        break;
      case 'tagged':
        filtered = filtered.filter(v => v.tags && v.tags.length > 0);
        break;
      // 'all' case just returns all versions
    }
    
    return filtered;
  };
  
  // Render the resume version card
  const renderVersionCard = (version, isSelected = false, isCompare = false) => {
    const selectedStyle = isSelected || isCompare 
      ? { borderColor: isSelected ? 'primary.main' : 'secondary.main', borderWidth: 2 }
      : {};
    
    return (
      <Card 
        sx={{ 
          mb: 2, 
          ...selectedStyle
        }}
        variant="outlined"
      >
        <CardContent sx={{ pt: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium">
              {version.versionLabel || `Version ${version.versionNumber || '#'}`}
            </Typography>
            
            <Chip 
              label={`${version.atsScore}%`}
              size="small"
              color={version.atsScore > 80 ? 'success' : version.atsScore > 60 ? 'warning' : 'error'}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {formatDate(version.createdAt)}
          </Typography>
          
          {version.title && (
            <Typography variant="body2" gutterBottom>
              {version.title}
            </Typography>
          )}
          
          {version.tags && version.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {version.tags.map((tag, idx) => (
                <Chip 
                  key={idx} 
                  label={tag} 
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          )}
          
          {version.changes && version.changes.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {version.changes.length} {version.changes.length === 1 ? 'change' : 'changes'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                {version.changes.some(c => c.type === 'added') && (
                  <Chip 
                    icon={<AddCircleOutline fontSize="small" />}
                    label={version.changes.filter(c => c.type === 'added').length}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
                
                {version.changes.some(c => c.type === 'removed') && (
                  <Chip 
                    icon={<RemoveCircleOutline fontSize="small" />}
                    label={version.changes.filter(c => c.type === 'removed').length}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )}
                
                {version.changes.some(c => c.type === 'modified') && (
                  <Chip 
                    icon={<Edit fontSize="small" />}
                    label={version.changes.filter(c => c.type === 'modified').length}
                    size="small"
                    color="info"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          )}
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
          <Box>
            <Tooltip title="View Details">
              <IconButton 
                size="small"
                onClick={() => handleVersionDetails(version)}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Download">
              <IconButton 
                size="small"
                onClick={() => handleDownloadVersion(version)}
              >
                <CloudDownload fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Add Comment">
              <IconButton 
                size="small"
                onClick={() => {
                  setCommentVersion(version);
                  setCommentOpen(true);
                }}
              >
                <ChatBubble fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box>
            <Button
              size="small"
              onClick={() => handleVersionSelect(version.id, isCompare)}
              color={isCompare ? "secondary" : "primary"}
            >
              {isSelected ? 'Selected' : isCompare ? 'Selected for Compare' : 'Select'}
            </Button>
          </Box>
        </CardActions>
      </Card>
    );
  };
  
  // Render the resume content diff
  const renderDiffContent = () => {
    if (!versionDiff.leftVersion) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Select a version to view details
          </Typography>
        </Box>
      );
    }
    
    if (!versionDiff.rightVersion) {
      // Render single version view when no comparison is selected
      return renderSingleVersionView();
    }
    
    // Determine which content to show based on active section
    let contentToShow = null;
    if (activeSection === 'all') {
      contentToShow = (
        <>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {renderVersionCard(versionDiff.leftVersion, true)}
            {renderVersionCard(versionDiff.rightVersion, false, true)}
          </Box>
          <Divider sx={{ my: 3 }} />
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Comments
            </Typography>
            
            {versionToRestore.comments && versionToRestore.comments.length > 0 ? (
              <List>
                {versionToRestore.comments.map((comment, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon sx={{ mt: 0 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {comment.userName?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={comment.userName || 'User'}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {comment.text}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {formatDate(comment.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No comments for this version
              </Typography>
            )}
          </Box>
        </>
      );
    } else if (activeSection === 'summary') {
      contentToShow = (
        <>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {renderVersionCard(versionDiff.leftVersion, true)}
            {renderVersionCard(versionDiff.rightVersion, false, true)}
          </Box>
          <Divider sx={{ my: 3 }} />
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Summary
            </Typography>
            
            <ReactDiffViewer
              oldValue={versionDiff.leftVersion.summary}
              newValue={versionDiff.rightVersion.summary}
              splitView={diffView === 'split'}
              hideLineNumbers={!showDiffDetails}
              highlight={diffHighlight}
            />
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Comments
            </Typography>
            
            {versionToRestore.comments && versionToRestore.comments.length > 0 ? (
              <List>
                {versionToRestore.comments.map((comment, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon sx={{ mt: 0 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {comment.userName?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={comment.userName || 'User'}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {comment.text}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {formatDate(comment.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No comments for this version
              </Typography>
            )}
          </Box>
        </>
      );
    } else if (activeSection === 'experience') {
      contentToShow = (
        <>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {renderVersionCard(versionDiff.leftVersion, true)}
            {renderVersionCard(versionDiff.rightVersion, false, true)}
          </Box>
          <Divider sx={{ my: 3 }} />
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Experience
            </Typography>
            
            <ReactDiffViewer
              oldValue={versionDiff.leftVersion.experience}
              newValue={versionDiff.rightVersion.experience}
              splitView={diffView === 'split'}
              hideLineNumbers={!showDiffDetails}
              highlight={diffHighlight}
            />
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Comments
            </Typography>
            
            {versionToRestore.comments && versionToRestore.comments.length > 0 ? (
              <List>
                {versionToRestore.comments.map((comment, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon sx={{ mt: 0 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {comment.userName?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={comment.userName || 'User'}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {comment.text}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {formatDate(comment.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No comments for this version
              </Typography>
            )}
          </Box>
        </>
      );
    } else if (activeSection === 'education') {
      contentToShow = (
        <>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {renderVersionCard(versionDiff.leftVersion, true)}
            {renderVersionCard(versionDiff.rightVersion, false, true)}
          </Box>
          <Divider sx={{ my: 3 }} />
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Education
            </Typography>
            
            <ReactDiffViewer
              oldValue={versionDiff.leftVersion.education}
              newValue={versionDiff.rightVersion.education}
              splitView={diffView === 'split'}
              hideLineNumbers={!showDiffDetails}
              highlight={diffHighlight}
            />
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Comments
            </Typography>
            
            {versionToRestore.comments && versionToRestore.comments.length > 0 ? (
              <List>
                {versionToRestore.comments.map((comment, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon sx={{ mt: 0 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {comment.userName?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={comment.userName || 'User'}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {comment.text}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {formatDate(comment.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No comments for this version
              </Typography>
            )}
          </Box>
        </>
      );
    } else if (activeSection === 'skills') {
      contentToShow = (
        <>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {renderVersionCard(versionDiff.leftVersion, true)}
            {renderVersionCard(versionDiff.rightVersion, false, true)}
          </Box>
          <Divider sx={{ my: 3 }} />
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Skills
            </Typography>
            
            <ReactDiffViewer
              oldValue={versionDiff.leftVersion.skills}
              newValue={versionDiff.rightVersion.skills}
              splitView={diffView === 'split'}
              hideLineNumbers={!showDiffDetails}
              highlight={diffHighlight}
            />
          </Box>
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Comments
            </Typography>
            
            {versionToRestore.comments && versionToRestore.comments.length > 0 ? (
              <List>
                {versionToRestore.comments.map((comment, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon sx={{ mt: 0 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {comment.userName?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={comment.userName || 'User'}
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {comment.text}
                          </Typography>
                          <Typography variant="caption" display="block" color="text.secondary">
                            {formatDate(comment.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No comments for this version
              </Typography>
            )}
          </Box>
        </>
      );
    }
    
    return contentToShow;
  };
  
  // Render single version view
  const renderSingleVersionView = () => {
    if (!versionDiff.leftVersion) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Select a version to view details
          </Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ p: 3 }}>
        {renderVersionCard(versionDiff.leftVersion, true)}
      </Box>
    );
  };
  
  // Render the component
  return (
    <Box>
      {/* Rest of the component code remains unchanged */}
    </Box>
  );
};

export default ResumeScoreboard; 