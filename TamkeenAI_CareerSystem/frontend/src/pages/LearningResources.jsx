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
  LinearProgress, Skeleton, Checkbox, FormControlLabel,
  Snackbar
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
  Close, Check, SaveAlt, Feedback, RateReview,
  Report
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import SkillChip from '../components/common/SkillChip';
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
        // Get bookmarked resources
        const bookmarkedResponse = await apiEndpoints.learning.getBookmarkedResources(profile.id);
        if (bookmarkedResponse && bookmarkedResponse.data) {
          // Extract the resources from the bookmarked data
          const savedResourcesData = await Promise.all(
            bookmarkedResponse.data.map(async (bookmark) => {
              try {
                const resourceData = await apiEndpoints.learning.getResourceById(bookmark.resourceId);
                return resourceData.data;
              } catch (error) {
                console.error(`Error fetching resource ${bookmark.resourceId}:`, error);
                return null;
              }
            })
          );
          
          setSavedResources(savedResourcesData.filter(resource => resource !== null));
        }
        
        // Get user progress
        const progressResponse = await apiEndpoints.learning.getUserProgress(profile.id);
        if (progressResponse && progressResponse.data && progressResponse.data.resources) {
          // Extract completed resources
          const completedResourcesData = await Promise.all(
            progressResponse.data.resources
              .filter(progress => progress.status === 'completed')
              .map(async (progress) => {
                try {
                  const resourceData = await apiEndpoints.learning.getResourceById(progress.resourceId);
                  return {
                    ...resourceData.data,
                    completedDate: progress.completedAt || progress.lastAccessedAt,
                    userRating: progress.userRating || 0
                  };
                } catch (error) {
                  console.error(`Error fetching resource ${progress.resourceId}:`, error);
                  return null;
                }
              })
          );
          
          setCompletedResources(completedResourcesData.filter(resource => resource !== null));
        }
        
        // Initial search
        await searchResources();
      } catch (err) {
        console.error('Error fetching learning resources data:', err);
        setError('Failed to load learning resources data. Please try again later.');
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
      
      const searchFilters = {
        type: filters.resourceType,
        level: filters.skillLevel,
        duration: filters.duration,
        free: filters.free ? 'true' : undefined,
        skills: filters.skills.join(','),
        sortBy: sorting.field,
        sortDir: sorting.direction
      };
      
      let response;
      if (debouncedSearchTerm) {
        response = await apiEndpoints.learning.searchResources(debouncedSearchTerm, searchFilters);
      } else {
        response = await apiEndpoints.learning.getResources(searchFilters, page, pageSize);
      }
      
      if (response && response.data) {
        setResources(response.data);
        setTotalResources(response.pagination?.total || response.data.length);
      } else {
        setResources([]);
        setTotalResources(0);
      }
    } catch (err) {
      console.error('Error searching resources:', err);
      setError('Failed to search resources. Please try again.');
      setResources([]);
      setTotalResources(0);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle resource bookmark toggle
  const handleBookmarkToggle = async (resourceId) => {
    try {
      const isSaved = savedResources.some(r => r.id === resourceId);
      
      if (isSaved) {
        await apiEndpoints.learning.removeBookmark(profile.id, resourceId);
        setSavedResources(savedResources.filter(r => r.id !== resourceId));
        setSnackbarMessage('Resource removed from your saved list');
      } else {
        await apiEndpoints.learning.bookmarkResource(profile.id, resourceId);
        
        // Find the resource and add it to saved resources
        const foundResource = resources.find(r => r.id === resourceId);
        if (foundResource) {
          setSavedResources([...savedResources, foundResource]);
        }
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
        await apiEndpoints.learning.updateProgress(profile.id, resourceId, 0, 'not-started');
        setCompletedResources(completedResources.filter(r => r.id !== resourceId));
        setSnackbarMessage('Resource marked as not completed');
      } else {
        await apiEndpoints.learning.updateProgress(profile.id, resourceId, 100, 'completed');
        
        // Find the resource and add it to completed resources
        const foundResource = resources.find(r => r.id === resourceId) || 
                         savedResources.find(r => r.id === resourceId);
        
        if (foundResource) {
          const completedResource = {
            ...foundResource,
            completedDate: new Date().toISOString(),
            userRating: 0
          };
          setCompletedResources([...completedResources, completedResource]);
        }
        
        setSnackbarMessage('Resource marked as completed');
        
        // Check if the user wants to leave a review
        setSelectedResource(foundResource);
        setReviewDialogOpen(true);
      }
      
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error toggling resource completion:', err);
      setSnackbarMessage('Failed to update resource completion status');
      setSnackbarOpen(true);
    }
  };
  
  // Handle submitting a review
  const handleSubmitReview = async () => {
    try {
      if (!selectedResource || !profile?.id) {
        setReviewDialogOpen(false);
        return;
      }
      
      await apiEndpoints.learning.submitReview(
        profile.id, 
        selectedResource.id, 
        userReview.rating, 
        userReview.comment
      );
      
      // Update the user rating in completed resources
      setCompletedResources(completedResources.map(resource => 
        resource.id === selectedResource.id ? 
          { ...resource, userRating: userReview.rating } : 
          resource
      ));
      
      setSnackbarMessage('Review submitted successfully');
      setSnackbarOpen(true);
      setReviewDialogOpen(false);
      
      // Reset review form
      setUserReview({
        rating: 0,
        comment: ''
      });
    } catch (err) {
      console.error('Error submitting review:', err);
      setSnackbarMessage('Failed to submit review');
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
        {/* Search input */}
        <TextField
          fullWidth
          placeholder="Search for learning resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
        />
        
        {/* Resource cards */}
        <Grid container spacing={3}>
          {resources.length > 0 ? (
            resources.map(resource => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    component="img"
                    sx={{
                      width: '100%',
                      height: 160,
                      objectFit: 'cover'
                    }}
                    src={resource.thumbnail || 'https://placehold.co/400x300/e0e0e0/gray?text=No+Image'}
                    alt={resource.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {resource.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {resource.provider} • {resource.duration}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {resource.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {resource.skills && resource.skills.slice(0, 3).map(skill => (
                        <Chip key={skill} label={skill} size="small" />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" href={resource.url} target="_blank">
                      View Resource
                    </Button>
                    <IconButton 
                      size="small"
                      onClick={() => handleBookmarkToggle(resource.id)}
                      color={savedResources.some(r => r.id === resource.id) ? 'primary' : 'default'}
                    >
                      {savedResources.some(r => r.id === resource.id) ? <Bookmark /> : <BookmarkBorder />}
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" textAlign="center">
                No resources found. Try adjusting your search criteria.
              </Typography>
            </Grid>
          )}
        </Grid>
        
        {/* Pagination */}
        {totalResources > pageSize && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={Math.ceil(totalResources / pageSize)}
              page={page}
              onChange={(e, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        )}
      </Box>
    );
  };
  
  // Render saved resources
  const renderSavedResources = () => {
    return (
      <Box>
        {savedResources.length > 0 ? (
          <Grid container spacing={3}>
            {savedResources.map(resource => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    component="img"
                    sx={{
                      width: '100%',
                      height: 160,
                      objectFit: 'cover'
                    }}
                    src={resource.thumbnail || 'https://placehold.co/400x300/e0e0e0/gray?text=No+Image'}
                    alt={resource.title}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {resource.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {resource.provider} • {resource.duration}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {resource.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {resource.skills && resource.skills.slice(0, 3).map(skill => (
                        <Chip key={skill} label={skill} size="small" />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" href={resource.url} target="_blank">
                      View Resource
                    </Button>
                    <IconButton 
                      size="small"
                      onClick={() => handleBookmarkToggle(resource.id)}
                      color="primary"
                    >
                      <Bookmark />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleCompletionToggle(resource.id)}
                      color={completedResources.some(r => r.id === resource.id) ? 'success' : 'default'}
                    >
                      <CheckCircle />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No saved resources
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Bookmark resources to save them for later
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setActiveTab(0)}
            >
              Browse Resources
            </Button>
          </Box>
        )}
      </Box>
    );
  };
  
  // Render completed resources
  const renderCompletedResources = () => {
    return (
      <Box>
        {completedResources.length > 0 ? (
          <Grid container spacing={3}>
            {completedResources.map(resource => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    component="img"
                    sx={{
                      width: '100%',
                      height: 160,
                      objectFit: 'cover'
                    }}
                    src={resource.thumbnail || 'https://placehold.co/400x300/e0e0e0/gray?text=No+Image'}
                    alt={resource.title}
                  />
                  <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                    <Chip
                      icon={<CheckCircle />}
                      label="Completed"
                      color="success"
                      size="small"
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {resource.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {resource.provider} • {resource.duration}
                    </Typography>
                    {resource.completedDate && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Completed on: {new Date(resource.completedDate).toLocaleDateString()}
                      </Typography>
                    )}
                    {resource.userRating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                          Your rating:
                        </Typography>
                        <Rating value={resource.userRating} readOnly size="small" />
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {resource.skills && resource.skills.slice(0, 3).map(skill => (
                        <Chip key={skill} label={skill} size="small" />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary" href={resource.url} target="_blank">
                      View Resource
                    </Button>
                    <Button 
                      size="small" 
                      color="secondary"
                      onClick={() => {
                        setSelectedResource(resource);
                        setReviewDialogOpen(true);
                      }}
                    >
                      {resource.userRating ? 'Edit Review' : 'Add Review'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No completed resources
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Mark resources as completed to track your progress
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setActiveTab(0)}
            >
              Browse Resources
            </Button>
          </Box>
        )}
      </Box>
    );
  };
  
  // Handle viewing resource details
  const handleViewResourceDetails = () => {
    if (currentOptionsResource) {
      setSelectedResource(currentOptionsResource);
      setResourceDialogOpen(true);
    }
    setOptionsMenuAnchorEl(null);
  };
  
  // Handle sharing a resource
  const handleShareResource = () => {
    if (currentOptionsResource) {
      // Share resource functionality would go here
      const shareUrl = `${window.location.origin}/learning?resourceId=${currentOptionsResource.id}`;
      
      // If Web Share API is available, use it
      if (navigator.share) {
        navigator.share({
          title: currentOptionsResource.title,
          text: `Check out this learning resource: ${currentOptionsResource.title}`,
          url: shareUrl
        }).catch(err => console.error('Error sharing resource:', err));
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            setSnackbarMessage('Link copied to clipboard');
            setSnackbarOpen(true);
          })
          .catch(() => {
            setSnackbarMessage('Unable to copy link');
            setSnackbarOpen(true);
          });
      }
    }
    setOptionsMenuAnchorEl(null);
  };
  
  // Handle adding to learning plan
  const handleAddToLearningPlan = () => {
    if (currentOptionsResource) {
      // Add to learning plan functionality would go here
      setSnackbarMessage('Added to your learning plan');
      setSnackbarOpen(true);
    }
    setOptionsMenuAnchorEl(null);
  };
  
  // Handle reporting a resource
  const handleReportResource = () => {
    if (currentOptionsResource) {
      // Report resource functionality would go here
      setSnackbarMessage('Thank you for reporting this resource. We will review it.');
      setSnackbarOpen(true);
    }
    setOptionsMenuAnchorEl(null);
  };
  
  // Snackbar for notifications
  const renderSnackbar = () => {
    return (
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setSnackbarOpen(false)}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      />
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
      {renderSnackbar()}
      
      <Menu
        open={Boolean(optionsMenuAnchorEl)}
        anchorEl={optionsMenuAnchorEl}
        onClose={() => setOptionsMenuAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleViewResourceDetails}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShareResource}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share Resource</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAddToLearningPlan}>
          <ListItemIcon>
            <Add fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add to Learning Plan</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleReportResource}>
          <ListItemIcon>
            <Report fontSize="small" />
          </ListItemIcon>
          <ListItemText>Report Resource</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LearningResources; 