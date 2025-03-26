import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon, Chip,
  CircularProgress, Alert, Pagination, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, MenuItem, Select, FormControl, InputLabel,
  Tabs, Tab, Rating, Tooltip, Badge, Avatar,
  Accordion, AccordionSummary, AccordionDetails,
  LinearProgress, Skeleton, Checkbox, FormControlLabel
} from '@mui/material';
import {
  School, LibraryBooks, Search, FilterList, BookmarkBorder,
  Bookmark, Star, StarBorder, ExpandMore, Sort,
  PlayArrow, VideoLibrary, MenuBook, Code, Assignment,
  LocalOffer, Visibility, AccessTime, People, Info,
  CheckCircle, Add, Delete, Edit, Share, MoreVert,
  Favorite, FavoriteBorder, YoutubeSearchedFor, History,
  Psychology, AssignmentTurnedIn, WorkspacePremium,
  VerifiedUser, Language, Computer, Engineering,
  ArrowUpward, ArrowDownward, Public, Collections,
  QuestionAnswer, Description, KeyboardArrowRight,
  Close, Check, SaveAlt, Feedback, RateReview
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import SkillChip from '../components/SkillChip';
import { useDebounce } from '../hooks/useDebounce';

const LearningResources = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resources, setResources] = useState([]);
  const [totalResources, setTotalResources] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    resourceType: [],
    skillLevel: [],
    duration: [],
    free: null,
    skills: []
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [activeTab, setActiveTab] = useState(0);
  const [savedResources, setSavedResources] = useState([]);
  const [completedResources, setCompletedResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [userReview, setUserReview] = useState({
    rating: 0,
    comment: ''
  });
  const [skillsList, setSkillsList] = useState([]);
  const [optionsMenuAnchorEl, setOptionsMenuAnchorEl] = useState(null);
  const [currentOptionsResource, setCurrentOptionsResource] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [sorting, setSorting] = useState({
    field: 'relevance',
    direction: 'desc'
  });
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useUser();
  
  // Extract query params on initial load
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    
    const q = queryParams.get('q');
    const skill = queryParams.get('skill');
    const type = queryParams.get('type');
    const p = parseInt(queryParams.get('page')) || 1;
    
    if (q) setSearchTerm(q);
    if (p) setPage(p);
    
    if (skill) {
      setFilters(prev => ({
        ...prev,
        skills: [skill]
      }));
    }
    
    if (type) {
      setFilters(prev => ({
        ...prev,
        resourceType: [type]
      }));
    }
  }, [location.search]);
  
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch skills list, saved resources, and completed resources
        const [skillsResponse, savedResponse, completedResponse] = await Promise.all([
          apiEndpoints.skills.getAllSkills(),
          apiEndpoints.learning.getSavedResources(profile.id),
          apiEndpoints.learning.getCompletedResources(profile.id)
        ]);
        
        setSkillsList(skillsResponse.data || []);
        setSavedResources(savedResponse.data || []);
        setCompletedResources(completedResponse.data || []);
        
        // Search resources with initial filters
        await searchResources();
      } catch (err) {
        console.error('Error fetching learning resources data:', err);
        setError('Failed to load learning resources data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [profile]);
  
  // Perform search when search term, page, or filters change
  useEffect(() => {
    if (debouncedSearchTerm || Object.values(filters).some(v => {
      if (Array.isArray(v)) return v.length > 0;
      if (v === null) return false;
      return true;
    })) {
      searchResources();
      
      // Update URL with search params
      const queryParams = new URLSearchParams();
      if (debouncedSearchTerm) queryParams.set('q', debouncedSearchTerm);
      if (page > 1) queryParams.set('page', page.toString());
      
      // Add skill filter if present
      if (filters.skills && filters.skills.length > 0) {
        queryParams.set('skill', filters.skills[0]);
      }
      
      // Add resource type filter if present
      if (filters.resourceType && filters.resourceType.length > 0) {
        queryParams.set('type', filters.resourceType[0]);
      }
      
      navigate(`/learning?${queryParams.toString()}`, { replace: true });
    }
  }, [debouncedSearchTerm, page, filters, sorting]);
  
  // Search resources
  const searchResources = async () => {
    try {
      setLoading(true);
      
      const response = await apiEndpoints.learning.searchResources({
        query: debouncedSearchTerm,
        page,
        pageSize,
        filters,
        sortBy: sorting.field,
        sortDirection: sorting.direction
      });
      
      setResources(response.data.resources || []);
      setTotalResources(response.data.total || 0);
    } catch (err) {
      console.error('Error searching resources:', err);
      setError('Failed to search resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle resource bookmark toggle
  const handleBookmarkToggle = async (resourceId) => {
    try {
      const isSaved = savedResources.some(r => r.id === resourceId);
      
      if (isSaved) {
        await apiEndpoints.learning.removeSavedResource(profile.id, resourceId);
        setSavedResources(savedResources.filter(r => r.id !== resourceId));
        setSnackbarMessage('Resource removed from your saved list');
      } else {
        await apiEndpoints.learning.saveResource(profile.id, resourceId);
        
        // Find the resource and add it to saved resources
        const resource = resources.find(r => r.id === resourceId);
        setSavedResources([...savedResources, resource]);
        setSnackbarMessage('Resource saved to your list');
      }
      
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error toggling resource bookmark:', err);
      setSnackbarMessage('Failed to update saved resources');
      setSnackbarOpen(true);
    }
  };
  
  // Handle resource completion toggle
  const handleCompletionToggle = async (resourceId) => {
    try {
      const isCompleted = completedResources.some(r => r.id === resourceId);
      
      if (isCompleted) {
        await apiEndpoints.learning.markResourceIncomplete(profile.id, resourceId);
        setCompletedResources(completedResources.filter(r => r.id !== resourceId));
        setSnackbarMessage('Resource marked as not completed');
      } else {
        await apiEndpoints.learning.markResourceComplete(profile.id, resourceId);
        
        // Find the resource and add it to completed resources
        const resource = resources.find(r => r.id === resourceId);
        setCompletedResources([...completedResources, resource]);
        setSnackbarMessage('Resource marked as completed');
        
        // Check if the user wants to leave a review
        setSelectedResource(resource);
        setReviewDialogOpen(true);
      }
      
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error toggling resource completion:', err);
      setSnackbarMessage('Failed to update resource completion status');
      setSnackbarOpen(true);
    }
  };
  
  // Render resource dialog
  const renderResourceDialog = () => {
    return (
      <Dialog 
        open={resourceDialogOpen} 
        onClose={() => setResourceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Resource Details</DialogTitle>
        <DialogContent>
          {/* Resource details content */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResourceDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render review dialog
  const renderReviewDialog = () => {
    return (
      <Dialog 
        open={reviewDialogOpen} 
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Leave a Review</DialogTitle>
        <DialogContent>
          <Rating
            name="rating"
            value={userReview.rating}
            onChange={(event, newValue) => {
              setUserReview({ ...userReview, rating: newValue });
            }}
          />
          <TextField
            label="Comment"
            multiline
            rows={4}
            value={userReview.comment}
            onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmitReview}
            variant="contained"
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Render main content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderResourceList();
      case 1:
        return renderSavedResources();
      case 2:
        return renderCompletedResources();
      default:
        return null;
    }
  };
  
  // Render resource list
  const renderResourceList = () => {
    return (
      <Box>
        {/* Resource list content */}
      </Box>
    );
  };
  
  // Render saved resources
  const renderSavedResources = () => {
    return (
      <Box>
        {/* Saved resources content */}
      </Box>
    );
  };
  
  // Render completed resources
  const renderCompletedResources = () => {
    return (
      <Box>
        {/* Completed resources content */}
      </Box>
    );
  };
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Learning Resources
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="All Resources" 
            icon={<LibraryBooks />} 
            iconPosition="start"
          />
          <Tab 
            label="Saved" 
            icon={<Bookmark />} 
            iconPosition="start"
          />
          <Tab 
            label="Completed" 
            icon={<AssignmentTurnedIn />} 
            iconPosition="start"
          />
        </Tabs>
        
        <Box sx={{ py: 2 }}>
          {loading ? (
            <LoadingSpinner message="Loading resources..." />
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          ) : (
            renderTabContent()
          )}
        </Box>
      </Paper>
      
      {renderResourceDialog()}
      {renderReviewDialog()}
      
      <Menu
        open={Boolean(optionsMenuAnchorEl)}
        anchorEl={optionsMenuAnchorEl}
        onClose={() => setOptionsMenuAnchorEl(null)}
      >
        <MenuItem onClick={handleViewResourceDetails}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>
        
        <MenuItem onClick={handleShareResource}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Share" />
        </MenuItem>
        
        <MenuItem onClick={handleAddToLearningPlan}>
          <ListItemIcon>
            <AssignmentTurnedIn fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Add to Learning Plan" />
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleReportResource}>
          <ListItemIcon>
            <Feedback fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Report Issue" />
        </MenuItem>
      </Menu>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default LearningResources; 