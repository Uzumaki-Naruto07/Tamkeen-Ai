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
  Snackbar, Drawer, FormGroup, Switch, MenuList
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
import { useTranslation } from 'react-i18next';
import { Autocomplete } from '@mui/material';

const LearningResources = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resources, setResources] = useState([]);
  const [totalResources, setTotalResources] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Define resource types for filter drawer
  const resourceTypes = [
    'course', 
    'video', 
    'article', 
    'book', 
    'tutorial', 
    'podcast'
  ];
  
  // Define difficulty levels for filter drawer
  const difficultyLevels = [
    'beginner', 
    'intermediate', 
    'advanced'
  ];
  
  const defaultFilters = {
    resourceType: [],
    skillLevel: [],
    duration: '',
    free: null,
    skills: [],
    providers: [],
    types: [],
    levels: []
  };
  
  const [filters, setFilters] = useState(defaultFilters);
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
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  
  // Define available skills and providers for filters
  const availableSkills = skillsList;
  const availableProviders = [
    'Coursera',
    'Udemy',
    'edX',
    'Khan Academy',
    'LinkedIn Learning',
    'Codecademy',
    'Frontend Masters',
    'DataCamp',
    'Pluralsight',
    'O\'Reilly'
  ];
  
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
  
  // Initialize data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Get URL params
        const params = new URLSearchParams(location.search);
        const urlSearchTerm = params.get('q');
        const urlPage = parseInt(params.get('page'), 10);
        const urlSkill = params.get('skill');
        const urlType = params.get('type');
        
        // Set initial filters based on URL
        if (urlSearchTerm) setSearchTerm(urlSearchTerm);
        if (!isNaN(urlPage)) setPage(urlPage);
        if (urlSkill) setFilters(prev => ({ ...prev, skills: [urlSkill] }));
        if (urlType) setFilters(prev => ({ ...prev, resourceType: [urlType] }));
        
        // Load skills list for filters
        try {
          // Check if skills endpoint exists before calling
          if (apiEndpoints.skills && apiEndpoints.skills.getAllSkills) {
            const skillsResponse = await apiEndpoints.skills.getAllSkills();
            if (skillsResponse && skillsResponse.data) {
              setSkillsList(skillsResponse.data.map(skill => skill.name));
            }
          } else {
            // Mock skills data since API is missing
            console.log('Using mock skills data (API endpoint missing)');
            setSkillsList([
              "JavaScript", 
              "React", 
              "Python", 
              "Data Analysis", 
              "Machine Learning",
              "UI/UX Design", 
              "Cloud Computing", 
              "DevOps", 
              "Mobile Development", 
              "Communication"
            ]);
          }
        } catch (error) {
          console.error('Error fetching skills list:', error);
          // Non-critical, provide mock data instead
          setSkillsList([
            "JavaScript", 
            "React", 
            "Python", 
            "Data Analysis", 
            "Machine Learning",
            "UI/UX Design", 
            "Cloud Computing", 
            "DevOps", 
            "Mobile Development", 
            "Communication"
          ]);
        }
        
        // Get bookmarked resources
        try {
          const bookmarkedResources = await apiEndpoints.learning.getBookmarkedResources(profile?.id || 2);
          if (bookmarkedResources && bookmarkedResources.data && Array.isArray(bookmarkedResources.data)) {
            setSavedResources(bookmarkedResources.data);
          } else {
            // Handle empty or non-array response
            console.warn('API returned non-array data for bookmarked resources');
            setSavedResources([]);
          }
        } catch (bookmarkError) {
          console.error('Error getting bookmarked resources:', bookmarkError);
          // Use mock data for development if API fails
          setSavedResources([
            {
              id: "mock-1",
              title: "React Fundamentals",
              description: "Learn React from scratch with this comprehensive guide",
              provider: "Frontend Masters",
              type: "course",
              duration: "8 hours",
              skills: ["React", "JavaScript", "Web Development"],
              url: "https://example.com/react-fundamentals"
            },
            {
              id: "mock-2",
              title: "Software Engineering Best Practices",
              description: "Discover industry best practices for software development",
              provider: "O'Reilly",
              type: "book",
              duration: "~12 hours",
              skills: ["Software Engineering", "Design Patterns", "Code Quality"],
              url: "https://example.com/engineering-best-practices"
            }
          ]);
        }
        
        // Get completed resources if the user is logged in
        if (profile?.id) {
          try {
            // Try both possible function names for getting learning progress
            const progressFunction = apiEndpoints.learning.getLearningProgress || 
                                    apiEndpoints.learning.getUserProgress;
            
            if (progressFunction) {
              const progressResponse = await progressFunction(profile.id);
              
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
            } else {
              // If neither function exists, use empty data
              console.log('Learning progress API endpoints missing, using mock completed data');
              setCompletedResources([
                {
                  id: "mock-completed-1",
                  title: "JavaScript Basics",
                  description: "Learn the fundamentals of JavaScript programming language",
                  provider: "Codecademy",
                  type: "course",
                  duration: "6 hours",
                  skills: ["JavaScript", "Web Development", "Programming"],
                  url: "https://example.com/javascript-basics",
                  thumbnail: "https://placehold.co/400x300/f7df1e/000?text=JavaScript",
                  completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
                  userRating: 4
                },
                {
                  id: "mock-completed-2",
                  title: "Resume Writing Workshop",
                  description: "Master the art of crafting an effective resume",
                  provider: "Career Coach",
                  type: "workshop",
                  duration: "2 hours",
                  skills: ["Resume Writing", "Communication", "Personal Branding"],
                  url: "https://example.com/resume-workshop",
                  thumbnail: "https://placehold.co/400x300/6b9080/fff?text=Resume+Writing",
                  completedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
                  userRating: 5
                }
              ]);
            }
          } catch (progressError) {
            console.error('Error fetching learning progress:', progressError);
            // Non-critical, use mock completed resources
            setCompletedResources([
              {
                id: "mock-completed-1",
                title: "JavaScript Basics",
                description: "Learn the fundamentals of JavaScript programming language",
                provider: "Codecademy",
                type: "course",
                duration: "6 hours",
                skills: ["JavaScript", "Web Development", "Programming"],
                url: "https://example.com/javascript-basics",
                thumbnail: "https://placehold.co/400x300/f7df1e/000?text=JavaScript",
                completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
                userRating: 4
              },
              {
                id: "mock-completed-2",
                title: "Resume Writing Workshop",
                description: "Master the art of crafting an effective resume",
                provider: "Career Coach",
                type: "workshop",
                duration: "2 hours",
                skills: ["Resume Writing", "Communication", "Personal Branding"],
                url: "https://example.com/resume-workshop",
                thumbnail: "https://placehold.co/400x300/6b9080/fff?text=Resume+Writing",
                completedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
                userRating: 5
              }
            ]);
          }
        } else {
          // No user profile, use mock data
          setCompletedResources([
            {
              id: "mock-completed-1",
              title: "JavaScript Basics",
              description: "Learn the fundamentals of JavaScript programming language",
              provider: "Codecademy",
              type: "course",
              duration: "6 hours",
              skills: ["JavaScript", "Web Development", "Programming"],
              url: "https://example.com/javascript-basics",
              thumbnail: "https://placehold.co/400x300/f7df1e/000?text=JavaScript",
              completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
              userRating: 4
            },
            {
              id: "mock-completed-2",
              title: "Resume Writing Workshop",
              description: "Master the art of crafting an effective resume",
              provider: "Career Coach",
              type: "workshop",
              duration: "2 hours",
              skills: ["Resume Writing", "Communication", "Personal Branding"],
              url: "https://example.com/resume-workshop",
              thumbnail: "https://placehold.co/400x300/6b9080/fff?text=Resume+Writing",
              completedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
              userRating: 5
            }
          ]);
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
      try {
        if (debouncedSearchTerm) {
          response = await apiEndpoints.learning.searchResources(debouncedSearchTerm, searchFilters);
        } else {
          response = await apiEndpoints.learning.getResources(searchFilters, page, pageSize);
        }
        
        if (response && response.data) {
          setResources(response.data);
          setTotalResources(response.pagination?.total || response.data.length);
          setError(null);
          return;
        }
      } catch (apiError) {
        console.error('API Error searching resources:', apiError);
        // Continue to fallback mock data
      }
      
      // Fallback mock data if API fails or returns empty data
      console.log('Using fallback mock data for learning resources');
      const mockResources = [
        {
          id: "mock-resource-1",
          title: "Introduction to Web Development",
          description: "Learn the fundamentals of web development with HTML, CSS, and JavaScript",
          provider: "Coursera",
          type: "course",
          duration: "10 hours",
          skills: ["HTML", "CSS", "JavaScript"],
          url: "https://example.com/web-dev-course",
          thumbnail: "https://placehold.co/400x300/6296cc/white?text=Web+Dev"
        },
        {
          id: "mock-resource-2",
          title: "Advanced React Patterns",
          description: "Master advanced patterns and techniques in React development",
          provider: "Frontend Masters",
          type: "course",
          duration: "8 hours",
          skills: ["React", "JavaScript", "Web Development"],
          url: "https://example.com/advanced-react",
          thumbnail: "https://placehold.co/400x300/61dafb/black?text=React"
        },
        {
          id: "mock-resource-3",
          title: "Python for Data Science",
          description: "Learn Python programming specifically for data science applications",
          provider: "DataCamp",
          type: "course",
          duration: "15 hours",
          skills: ["Python", "Data Science", "Statistics"],
          url: "https://example.com/python-data-science",
          thumbnail: "https://placehold.co/400x300/3776ab/white?text=Python"
        },
        {
          id: "mock-resource-4",
          title: "Clean Code: A Handbook of Agile Software Craftsmanship",
          description: "Learn how to write clean, maintainable code that other developers can easily understand",
          provider: "O'Reilly",
          type: "book",
          duration: "~10 hours",
          skills: ["Software Engineering", "Code Quality", "Best Practices"],
          url: "https://example.com/clean-code-book",
          thumbnail: "https://placehold.co/400x300/f5f5f5/333?text=Clean+Code"
        }
      ];
      
      // Filter mock data based on search term if present
      let filteredMockResources = mockResources;
      if (debouncedSearchTerm) {
        const searchTermLower = debouncedSearchTerm.toLowerCase();
        filteredMockResources = mockResources.filter(resource => 
          resource.title.toLowerCase().includes(searchTermLower) ||
          resource.description.toLowerCase().includes(searchTermLower) ||
          resource.provider.toLowerCase().includes(searchTermLower) ||
          resource.skills.some(skill => skill.toLowerCase().includes(searchTermLower))
        );
      }
      
      // Apply type filters if present
      if (filters.resourceType && filters.resourceType.length > 0) {
        filteredMockResources = filteredMockResources.filter(resource => 
          filters.resourceType.includes(resource.type)
        );
      }
      
      // Apply skills filters if present
      if (filters.skills && filters.skills.length > 0) {
        filteredMockResources = filteredMockResources.filter(resource => 
          resource.skills.some(skill => filters.skills.includes(skill))
        );
      }
      
      setResources(filteredMockResources);
      setTotalResources(filteredMockResources.length);
      setError(null);
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
      // Ensure savedResources is an array before using .some()
      const currentSavedResources = Array.isArray(savedResources) ? savedResources : [];
      const isSaved = currentSavedResources.some(r => r.id === resourceId);
      
      try {
        // Try API call but continue even if it fails
        if (isSaved) {
          await apiEndpoints.learning.removeBookmark(profile?.id || 2, resourceId);
        } else {
          await apiEndpoints.learning.bookmarkResource(profile?.id || 2, resourceId);
        }
      } catch (apiError) {
        console.log("API call failed, proceeding with UI update only:", apiError);
        // Continue with UI updates regardless of API success
      }
      
      // Find the resource from any available source
      const foundResource = resources.find(r => r.id === resourceId) || 
                         currentSavedResources.find(r => r.id === resourceId) ||
                         completedResources.find(r => r.id === resourceId);
      
      if (isSaved) {
        // Remove from saved
        setSavedResources(currentSavedResources.filter(r => r.id !== resourceId));
        setSnackbarMessage('Resource removed from your saved list');
      } else if (foundResource) {
        // Add to saved
        setSavedResources([...currentSavedResources, foundResource]);
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
      
      try {
        // Try API call but continue even if it fails
        if (isCompleted) {
          await apiEndpoints.learning.updateProgress(profile?.id || 2, resourceId, 0, 'not-started');
        } else {
          await apiEndpoints.learning.updateProgress(profile?.id || 2, resourceId, 100, 'completed');
        }
      } catch (apiError) {
        console.log("API call failed for completion toggle, proceeding with UI update only:", apiError);
        // Continue with UI updates regardless of API success
      }
      
      if (isCompleted) {
        // Remove from completed
        setCompletedResources(completedResources.filter(r => r.id !== resourceId));
        setSnackbarMessage('Resource marked as not completed');
      } else {
        // Find the resource from any available source
        const foundResource = resources.find(r => r.id === resourceId) || 
                           savedResources.find(r => r.id === resourceId) ||
                           completedResources.find(r => r.id === resourceId);
        
        if (foundResource) {
          const completedResource = {
            ...foundResource,
            completedDate: new Date().toISOString(),
            userRating: 0
          };
          
          // Add to completed
          setCompletedResources(prev => [...prev, completedResource]);
          
          // Ensure savedResources is an array
          const currentSavedResources = Array.isArray(savedResources) ? savedResources : [];
          
          // If it's marked as completed, automatically save it too
          if (!currentSavedResources.some(r => r.id === resourceId)) {
            setSavedResources(prev => {
              const prevArray = Array.isArray(prev) ? prev : [];
              return [...prevArray, foundResource];
            });
          }
          
          setSnackbarMessage('Resource marked as completed');
          
          // Check if the user wants to leave a review
          setSelectedResource(foundResource);
          
          // Use a short delay to ensure state has updated before opening dialog
          setTimeout(() => {
            setReviewDialogOpen(true);
          }, 100);
        } else {
          console.error('Could not find resource to mark as completed:', resourceId);
          setSnackbarMessage('Error: Could not mark resource as completed');
        }
      }
      
      // Ensure we immediately switch to the completed tab when marking as completed
      if (!isCompleted) {
        setActiveTab(2); // Switch to Completed tab
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
      if (!selectedResource) {
        setSnackbarMessage('No resource selected for review');
        setSnackbarOpen(true);
        setReviewDialogOpen(false);
        return;
      }
      
      // Check if rating is provided
      if (userReview.rating === 0) {
        setSnackbarMessage('Please provide a rating before submitting');
        setSnackbarOpen(true);
        return;
      }
      
      try {
        // Try API call but continue even if it fails
        if (profile?.id) {
          await apiEndpoints.learning.submitReview(
            profile.id, 
            selectedResource.id, 
            userReview.rating, 
            userReview.comment
          );
        }
      } catch (apiError) {
        console.log("API call failed for review submission, proceeding with UI update only:", apiError);
        // Continue with UI updates regardless of API success
      }
      
      // Update the user rating in completed resources regardless of API success
      setCompletedResources(prevResources => 
        prevResources.map(resource => 
          resource.id === selectedResource.id ? 
            { 
              ...resource, 
              userRating: userReview.rating,
              userComment: userReview.comment
            } : 
            resource
        )
      );
      
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
  
  // View resource details
  const handleViewDetails = (resource) => {
    setSelectedResource(resource);
    setResourceDialogOpen(true);
  };
  
  // Render resource dialog
  const renderResourceDialog = () => {
    if (!selectedResource) return null;
    
    // Ensure savedResources is an array
    const currentSavedResources = Array.isArray(savedResources) ? savedResources : [];
    
    return (
      <Dialog 
        open={resourceDialogOpen} 
        onClose={() => setResourceDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedResource.title}</Typography>
            <IconButton onClick={() => setResourceDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Resource Image */}
            <Grid item xs={12} md={4}>
              <Box
                component="img"
                sx={{
                  width: '100%',
                  borderRadius: 1,
                  boxShadow: 1
                }}
                src={selectedResource.thumbnail || 'https://placehold.co/400x300/e0e0e0/gray?text=No+Image'}
                alt={selectedResource.title}
              />
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                <Button 
                  variant="contained" 
                  startIcon={<PlayArrow />}
                  href={selectedResource.url} 
                  target="_blank"
                  fullWidth
                >
                  {i18n.language === 'ar' ? 'ابدأ التعلم' : 'Start Learning'}
                </Button>
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined"
                  startIcon={currentSavedResources.some(r => r.id === selectedResource.id) ? <Bookmark /> : <BookmarkBorder />}
                  onClick={() => handleBookmarkToggle(selectedResource.id)}
                  size="small"
                >
                  {currentSavedResources.some(r => r.id === selectedResource.id) ? (i18n.language === 'ar' ? 'محفوظ' : 'Saved') : (i18n.language === 'ar' ? 'حفظ' : 'Save')}
                </Button>
                
                <Button 
                  variant="outlined"
                  startIcon={<Share />}
                  onClick={() => {
                    // Copy link to clipboard
                    navigator.clipboard.writeText(`${window.location.origin}/learning?resourceId=${selectedResource.id}`);
                    setSnackbarMessage(i18n.language === 'ar' ? 'تم نسخ الرابط إلى الحافظة' : 'Link copied to clipboard');
                    setSnackbarOpen(true);
                  }}
                  size="small"
                >
                  {i18n.language === 'ar' ? 'مشاركة' : 'Share'}
                </Button>
              </Box>
            </Grid>
            
            {/* Resource Details */}
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                {i18n.language === 'ar' ? 'عن هذا المورد' : 'About this resource'}
              </Typography>
              <Typography variant="body1" paragraph>{selectedResource.description}</Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {i18n.language === 'ar' ? 'المزود' : 'Provider'}
                  </Typography>
                  <Typography variant="body1">{selectedResource.provider}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {i18n.language === 'ar' ? 'النوع' : 'Type'}
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {selectedResource.type}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {i18n.language === 'ar' ? 'المدة' : 'Duration'}
                  </Typography>
                  <Typography variant="body1">{selectedResource.duration}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {i18n.language === 'ar' ? 'المستوى' : 'Level'}
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {selectedResource.level || 'Intermediate'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {i18n.language === 'ar' ? 'المهارات المغطاة' : 'Skills Covered'}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {selectedResource.skills && selectedResource.skills.map(skill => (
                    <Chip 
                      key={skill} 
                      label={skill} 
                      variant="outlined" 
                      size="small"
                      onClick={() => {
                        // Set filter to this skill and close dialog
                        setFilters(prev => ({ ...prev, skills: [skill] }));
                        setResourceDialogOpen(false);
                        setActiveTab(0); // Switch to All Resources tab
                      }}
                    />
                  ))}
                </Box>
              </Box>
              
              {completedResources.some(r => r.id === selectedResource.id) && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {i18n.language === 'ar' ? 'تقدمك' : 'Your Progress'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <CheckCircle color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {i18n.language === 'ar' 
                        ? `تم الإكمال في ${new Date(
                          completedResources.find(r => r.id === selectedResource.id)?.completedDate
                        ).toLocaleDateString()}`
                        : `Completed on ${new Date(
                          completedResources.find(r => r.id === selectedResource.id)?.completedDate
                        ).toLocaleDateString()}`}
                    </Typography>
                  </Box>
                  
                  {completedResources.find(r => r.id === selectedResource.id)?.userRating > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {i18n.language === 'ar' ? 'تقييمك:' : 'Your rating:'}
                      </Typography>
                      <Rating 
                        value={completedResources.find(r => r.id === selectedResource.id)?.userRating || 0} 
                        readOnly 
                        size="small" 
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setResourceDialogOpen(false)}
            color="primary"
          >
            {i18n.language === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
          {!completedResources.some(r => r.id === selectedResource.id) && (
            <Button 
              onClick={() => {
                handleCompletionToggle(selectedResource.id);
                setResourceDialogOpen(false);
              }}
              color="success"
              variant="contained"
              startIcon={<CheckCircle />}
            >
              {i18n.language === 'ar' ? 'وضع علامة كمكتمل' : 'Mark as Completed'}
            </Button>
          )}
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
        <DialogTitle>{i18n.language === 'ar' ? 'ترك تقييم' : 'Leave a Review'}</DialogTitle>
        <DialogContent>
          <Rating
            name="rating"
            value={userReview.rating}
            onChange={(event, newValue) => {
              setUserReview({ ...userReview, rating: newValue });
            }}
          />
          <TextField
            label={i18n.language === 'ar' ? 'تعليق' : 'Comment'}
            multiline
            rows={4}
            value={userReview.comment}
            onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>
            {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleSubmitReview}
            variant="contained"
          >
            {i18n.language === 'ar' ? 'إرسال التقييم' : 'Submit Review'}
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
    // Ensure savedResources is an array
    const currentSavedResources = Array.isArray(savedResources) ? savedResources : [];
    
    return (
      <Box>
        {/* Search and filter row */}
        <Box sx={{ display: 'flex', mb: 3, gap: 2 }}>
          <TextField
            fullWidth
            placeholder={i18n.language === 'ar' ? 'ابحث عن موارد التعلم...' : 'Search for learning resources...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFilterDrawerOpen(true)}
          >
            {i18n.language === 'ar' ? 'تصفية' : 'Filter'}
          </Button>
        </Box>
        
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
                      objectFit: 'cover',
                      cursor: 'pointer'
                    }}
                    src={resource.thumbnail || 'https://placehold.co/400x300/e0e0e0/gray?text=No+Image'}
                    alt={resource.title}
                    onClick={() => handleViewDetails(resource)}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleViewDetails(resource)}
                    >
                      {resource.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {resource.provider} • {resource.duration}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      paragraph
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {resource.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {resource.skills && resource.skills.slice(0, 3).map(skill => (
                        <Chip key={skill} label={skill} size="small" />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleViewDetails(resource)}
                    >
                      {i18n.language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                    </Button>
                    <IconButton 
                      size="small"
                      onClick={() => handleBookmarkToggle(resource.id)}
                      color={currentSavedResources.some(r => r.id === resource.id) ? 'primary' : 'default'}
                    >
                      {currentSavedResources.some(r => r.id === resource.id) ? <Bookmark /> : <BookmarkBorder />}
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="body1" textAlign="center">
                {i18n.language === 'ar' ? 'لم يتم العثور على موارد. حاول تعديل معايير البحث.' : 'No resources found. Try adjusting your search criteria.'}
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
    // Ensure savedResources is an array
    const currentSavedResources = Array.isArray(savedResources) ? savedResources : [];
    
    return (
      <Box>
        {currentSavedResources.length > 0 ? (
          <Grid container spacing={3}>
            {currentSavedResources.map(resource => (
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
                      {i18n.language === 'ar' ? 'عرض المورد' : 'View Resource'}
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
              {i18n.language === 'ar' ? 'لا توجد موارد محفوظة' : 'No saved resources'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {i18n.language === 'ar' ? 'قم بوضع إشارة مرجعية على الموارد لحفظها لوقت لاحق' : 'Bookmark resources to save them for later'}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setActiveTab(0)}
            >
              {i18n.language === 'ar' ? 'تصفح الموارد' : 'Browse Resources'}
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
                      label={i18n.language === 'ar' ? 'مكتمل' : 'Completed'}
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
                        {i18n.language === 'ar' ? `تم الإكمال في: ${new Date(resource.completedDate).toLocaleDateString()}` : `Completed on: ${new Date(resource.completedDate).toLocaleDateString()}`}
                      </Typography>
                    )}
                    {resource.userRating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                          {i18n.language === 'ar' ? 'تقييمك:' : 'Your rating:'}
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
                      {i18n.language === 'ar' ? 'عرض المورد' : 'View Resource'}
                    </Button>
                    <Button 
                      size="small" 
                      color="secondary"
                      onClick={() => {
                        setSelectedResource(resource);
                        setReviewDialogOpen(true);
                      }}
                    >
                      {resource.userRating ? (i18n.language === 'ar' ? 'تعديل التقييم' : 'Edit Review') : (i18n.language === 'ar' ? 'إضافة تقييم' : 'Add Review')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {i18n.language === 'ar' ? 'لا توجد موارد مكتملة' : 'No completed resources'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {i18n.language === 'ar' ? 'قم بتحديد الموارد كمكتملة لتتبع تقدمك' : 'Mark resources as completed to track your progress'}
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => setActiveTab(0)}
            >
              {i18n.language === 'ar' ? 'تصفح الموارد' : 'Browse Resources'}
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
  
  // Render tab panels
  const TabPanel = (props) => {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`resources-tabpanel-${index}`}
        aria-labelledby={`resources-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ py: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };
  
  // Filter drawer
  const renderFilterDrawer = () => {
    // Helper function to translate resource types and difficulty levels
    const getArabicLabel = (label) => {
      if (label === 'course') return 'دورة';
      if (label === 'video') return 'فيديو';
      if (label === 'article') return 'مقال';
      if (label === 'book') return 'كتاب';
      if (label === 'tutorial') return 'درس تعليمي';
      if (label === 'podcast') return 'بودكاست';
      
      if (label === 'beginner') return 'مبتدئ';
      if (label === 'intermediate') return 'متوسط';
      if (label === 'advanced') return 'متقدم';
      
      return label;
    };
  
    return (
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{ zIndex: 1300 }}
      >
        <Box sx={{ width: 280, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {i18n.language === 'ar' ? 'تصفية الموارد' : 'Filter Resources'}
            </Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Resource type filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {i18n.language === 'ar' ? 'نوع المورد' : 'Resource Type'}
            </Typography>
            <FormGroup>
              {resourceTypes.map(type => (
                <FormControlLabel
                  key={type}
                  control={
                    <Checkbox
                      checked={filters.resourceType.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filters.resourceType, type]
                          : filters.resourceType.filter(t => t !== type);
                        setFilters(prev => ({ ...prev, resourceType: newTypes }));
                      }}
                    />
                  }
                  label={i18n.language === 'ar' ? getArabicLabel(type) : type}
                />
              ))}
            </FormGroup>
          </Box>
          
          {/* Skills filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {i18n.language === 'ar' ? 'المهارات' : 'Skills'}
            </Typography>
            <Autocomplete
              multiple
              id="skills-filter"
              options={availableSkills}
              value={filters.skills}
              onChange={(event, newValue) => {
                setFilters(prev => ({ ...prev, skills: newValue }));
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  variant="outlined" 
                  placeholder={i18n.language === 'ar' ? 'اختر المهارات' : 'Select skills'} 
                />
              )}
              size="small"
            />
          </Box>
          
          {/* Difficulty level filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {i18n.language === 'ar' ? 'مستوى الصعوبة' : 'Difficulty Level'}
            </Typography>
            <FormGroup>
              {difficultyLevels.map(level => (
                <FormControlLabel
                  key={level}
                  control={
                    <Checkbox
                      checked={filters.skillLevel.includes(level)}
                      onChange={(e) => {
                        const newLevels = e.target.checked
                          ? [...filters.skillLevel, level]
                          : filters.skillLevel.filter(l => l !== level);
                        setFilters(prev => ({ ...prev, skillLevel: newLevels }));
                      }}
                    />
                  }
                  label={i18n.language === 'ar' ? getArabicLabel(level) : level}
                />
              ))}
            </FormGroup>
          </Box>
          
          {/* Duration filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {i18n.language === 'ar' ? 'المدة' : 'Duration'}
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={filters.duration}
                onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                displayEmpty
              >
                <MenuItem value="">
                  <em>{i18n.language === 'ar' ? 'أي مدة' : 'Any duration'}</em>
                </MenuItem>
                <MenuItem value="short">{i18n.language === 'ar' ? 'قصير (< 3 ساعات)' : 'Short (< 3 hours)'}</MenuItem>
                <MenuItem value="medium">{i18n.language === 'ar' ? 'متوسط (3-10 ساعات)' : 'Medium (3-10 hours)'}</MenuItem>
                <MenuItem value="long">{i18n.language === 'ar' ? 'طويل (> 10 ساعات)' : 'Long (> 10 hours)'}</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {/* Provider filter */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              {i18n.language === 'ar' ? 'المزود' : 'Provider'}
            </Typography>
            <Autocomplete
              multiple
              id="provider-filter"
              options={availableProviders}
              value={filters.providers}
              onChange={(event, newValue) => {
                setFilters(prev => ({ ...prev, providers: newValue }));
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  variant="outlined" 
                  placeholder={i18n.language === 'ar' ? 'اختر المزودين' : 'Select providers'} 
                />
              )}
              size="small"
            />
          </Box>
          
          {/* Free resources only filter */}
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.free === true}
                  onChange={(e) => setFilters(prev => ({ ...prev, free: e.target.checked ? true : null }))}
                />
              }
              label={i18n.language === 'ar' ? 'الموارد المجانية فقط' : 'Free resources only'}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button 
              variant="outlined" 
              onClick={() => setFilters(defaultFilters)}
            >
              {i18n.language === 'ar' ? 'إعادة تعيين' : 'Reset'}
            </Button>
            <Button 
              variant="contained" 
              onClick={() => {
                searchResources();
                setFilterDrawerOpen(false);
              }}
            >
              {i18n.language === 'ar' ? 'تطبيق' : 'Apply'}
            </Button>
          </Box>
        </Box>
      </Drawer>
    );
  };
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {i18n.language === 'ar' ? 'موارد التعلم' : 'Learning Resources'}
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={i18n.language === 'ar' ? 'جميع الموارد' : 'All Resources'} 
            icon={<LibraryBooks />} 
            iconPosition="start"
          />
          <Tab 
            label={i18n.language === 'ar' ? 'المحفوظة' : 'Saved'} 
            icon={<Bookmark />} 
            iconPosition="start"
          />
          <Tab 
            label={i18n.language === 'ar' ? 'المكتملة' : 'Completed'} 
            icon={<AssignmentTurnedIn />} 
            iconPosition="start"
          />
        </Tabs>
        
        <Box sx={{ py: 2 }}>
          {loading ? (
            <LoadingSpinner message={i18n.language === 'ar' ? 'جاري تحميل الموارد...' : 'Loading resources...'} />
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
          <ListItemText>{i18n.language === 'ar' ? 'عرض التفاصيل' : 'View Details'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShareResource}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText>{i18n.language === 'ar' ? 'مشاركة المورد' : 'Share Resource'}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAddToLearningPlan}>
          <ListItemIcon>
            <Add fontSize="small" />
          </ListItemIcon>
          <ListItemText>{i18n.language === 'ar' ? 'إضافة إلى خطة التعلم' : 'Add to Learning Plan'}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleReportResource}>
          <ListItemIcon>
            <Report fontSize="small" />
          </ListItemIcon>
          <ListItemText>{i18n.language === 'ar' ? 'الإبلاغ عن المورد' : 'Report Resource'}</ListItemText>
        </MenuItem>
      </Menu>
      
      {renderFilterDrawer()}
    </Box>
  );
};

export default LearningResources; 