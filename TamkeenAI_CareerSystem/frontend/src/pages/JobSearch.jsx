import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon, Chip,
  CircularProgress, Alert, Pagination, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, MenuItem, Select, FormControl, InputLabel,
  Slider, FormControlLabel, Switch, Tooltip, Checkbox,
  FormGroup, Accordion, AccordionSummary, AccordionDetails,
  Radio, RadioGroup, Drawer, useMediaQuery, Tabs, Tab,
  Snackbar, Badge, Backdrop, LinearProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Search, LocationOn, Work, BusinessCenter, FilterList,
  Bookmark, BookmarkBorder, Star, StarBorder, Close,
  ExpandMore, Sort, TuneOutline, AttachMoney, Timer,
  Flag, SendOutlined, MoreVert, Share, Visibility,
  Description, Assessment, Block, Check, Clear,
  Favorite, FavoriteBorder, Schedule, ArrowDropDown,
  ImportExport, Public, SavedSearch, History, Refresh,
  Home, Group, Psychology, School, Engineering, AccountBalance,
  SentimentSatisfiedAlt, TrendingUp, MonetizationOn, AccessTime,
  CheckCircleOutline, RemoveCircleOutline, NavigateNext, NavigateBefore,
  ArticleOutlined, CategoryOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import { useDebounce } from '../hooks/useDebounce';

const JobSearch = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [filters, setFilters] = useState({
    jobTypes: [],
    experience: [],
    salary: [0, 200000],
    remote: false,
    datePosted: 'any',
    industries: [],
    skills: []
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [filtersVisible, setFiltersVisible] = useState(!isMobile);
  const [savedSearches, setSavedSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [saveSearchDialogOpen, setSaveSearchDialogOpen] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [shareJobDialogOpen, setShareJobDialogOpen] = useState(false);
  const [currentSharedJob, setCurrentSharedJob] = useState(null);
  const [shareEmail, setShareEmail] = useState('');
  const [optionsMenuAnchorEl, setOptionsMenuAnchorEl] = useState(null);
  const [currentOptionsJob, setCurrentOptionsJob] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [skillsList, setSkillsList] = useState([]);
  const [industryList, setIndustryList] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [skillsInputValue, setSkillsInputValue] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState([]);
  const [showSkillsSuggestions, setShowSkillsSuggestions] = useState(false);
  const [similarJobsDialogOpen, setSimilarJobsDialogOpen] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loadingSimilarJobs, setLoadingSimilarJobs] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedLocation = useDebounce(locationSearch, 500);
  const debouncedSkillsInput = useDebounce(skillsInputValue, 300);
  
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { profile } = useUser();
  const skillsInputRef = useRef(null);
  
  // Extract query params on initial load
  useEffect(() => {
    const queryParams = new URLSearchParams(routerLocation.search);
    
    const q = queryParams.get('q');
    const loc = queryParams.get('location');
    const p = parseInt(queryParams.get('page')) || 1;
    
    if (q) setSearchTerm(q);
    if (loc) setLocationSearch(loc);
    if (p) setPage(p);
    
    // TODO: Extract more filter params if needed
  }, [routerLocation.search]);
  
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
        // Fetch filter options
        const [industriesRes, skillsRes, savedJobsRes, savedSearchesRes, searchHistoryRes] = await Promise.all([
          apiEndpoints.jobs.getIndustries(),
          apiEndpoints.jobs.getSkillsList(),
          apiEndpoints.jobs.getSavedJobs(profile.id),
          apiEndpoints.jobs.getSavedSearches(profile.id),
          apiEndpoints.jobs.getSearchHistory(profile.id)
        ]);
        
        setIndustryList(industriesRes.data || []);
        setSkillsList(skillsRes.data || []);
        setSavedJobs(savedJobsRes.data || []);
        setSavedSearches(savedSearchesRes.data || []);
        setSearchHistory(searchHistoryRes.data || []);
        
        // Perform initial search if there are search params
        if (debouncedSearchTerm || debouncedLocation) {
          await searchJobs();
        } else {
          // Otherwise just load recent jobs
          const recentJobsRes = await apiEndpoints.jobs.getRecentJobs(page, pageSize);
          setJobs(recentJobsRes.data.jobs || []);
          setTotalJobs(recentJobsRes.data.total || 0);
        }
      } catch (err) {
        console.error('Error fetching initial job search data:', err);
        setError('Failed to load job search data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [profile]);
  
  // Perform search when search term, location, page, or filters change
  useEffect(() => {
    if (debouncedSearchTerm || debouncedLocation || Object.values(filters).some(v => {
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'boolean') return v;
      return false;
    })) {
      searchJobs();
      
      // Update URL with search params
      const queryParams = new URLSearchParams();
      if (debouncedSearchTerm) queryParams.set('q', debouncedSearchTerm);
      if (debouncedLocation) queryParams.set('location', debouncedLocation);
      if (page > 1) queryParams.set('page', page.toString());
      
      // TODO: Add more filter params if needed
      
      navigate(`/jobs?${queryParams.toString()}`, { replace: true });
    }
  }, [debouncedSearchTerm, debouncedLocation, page, filters, sortBy]);
  
  // Get skill suggestions based on input
  useEffect(() => {
    if (debouncedSkillsInput.length > 1) {
      const filteredSkills = skillsList
        .filter(skill => 
          skill.toLowerCase().includes(debouncedSkillsInput.toLowerCase()) &&
          !filters.skills.includes(skill)
        )
        .slice(0, 5);
      
      setSuggestedSkills(filteredSkills);
      setShowSkillsSuggestions(true);
    } else {
      setShowSkillsSuggestions(false);
    }
  }, [debouncedSkillsInput, skillsList, filters.skills]);
  
  // Search jobs function
  const searchJobs = async () => {
    setSearching(true);
    setError(null);
    
    try {
      const response = await apiEndpoints.jobs.searchJobs({
        search: debouncedSearchTerm,
        location: debouncedLocation,
        page,
        pageSize,
        sortBy,
        ...filters
      });
      
      setJobs(response.data.jobs || []);
      setTotalJobs(response.data.total || 0);
      
      // Add to search history if this is a new search
      if (profile?.id && (debouncedSearchTerm || debouncedLocation)) {
        await apiEndpoints.jobs.addSearchHistory(profile.id, {
          search: debouncedSearchTerm,
          location: debouncedLocation,
          filters
        });
      }
    } catch (err) {
      console.error('Error searching jobs:', err);
      setError('Failed to search jobs. Please try again.');
    } finally {
      setSearching(false);
    }
  };
  
  // Rest of the component implementation
  const renderSearchBar = () => {
    return (
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Job title, keywords, or company"
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
          </Grid>
          
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="City, state, or remote"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={searchJobs}
              disabled={searching}
              startIcon={searching ? <CircularProgress size={20} /> : <Search />}
            >
              Search
            </Button>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            {isMobile && (
              <Button
                startIcon={<FilterList />}
                onClick={() => setFiltersVisible(!filtersVisible)}
              >
                Filters
              </Button>
            )}
            
            <Button
              startIcon={<Sort />}
              onClick={(e) => setSortMenuAnchorEl(e.currentTarget)}
            >
              Sort: {getSortLabel(sortBy)}
            </Button>
            
            <Button
              startIcon={<SavedSearch />}
              onClick={() => setSaveSearchDialogOpen(true)}
              disabled={!debouncedSearchTerm && !debouncedLocation}
            >
              Save Search
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            {totalJobs} jobs found
          </Typography>
        </Box>
      </Box>
    );
  };
  
  // Render search results
  const renderSearchResults = () => {
    if (loading) {
      return <LoadingSpinner />;
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }
    
    if (jobs.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            No jobs found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search criteria or filters
          </Typography>
        </Box>
      );
    }
    
    return (
      <>
        <List>
          {jobs.map((job) => (
            <React.Fragment key={job.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    bgcolor: 'action.hover' 
                  }
                }}
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <Box sx={{ display: 'flex', width: '100%' }}>
                  <Box sx={{ mr: 2 }}>
                    {job.companyLogo ? (
                      <Avatar 
                        src={job.companyLogo} 
                        alt={job.company}
                        sx={{ width: 56, height: 56 }}
                      />
                    ) : (
                      <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                        {job.company?.charAt(0) || "J"}
                      </Avatar>
                    )}
                  </Box>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {job.title}
                    </Typography>
                    
                    <Typography variant="subtitle1" color="text.secondary">
                      {job.company}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.location}
                      </Typography>
                      
                      {job.remote && (
                        <Chip 
                          label="Remote" 
                          size="small" 
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      {job.salary && (
                        <Chip
                          icon={<AttachMoney fontSize="small" />}
                          label={job.salary}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      
                      {job.jobType && (
                        <Chip
                          icon={<BusinessCenter fontSize="small" />}
                          label={job.jobType}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      
                      {job.postedTime && (
                        <Chip
                          icon={<AccessTime fontSize="small" />}
                          label={job.postedTime}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {job.skills?.slice(0, 3).map(skill => (
                        <Chip
                          key={skill}
                          label={skill}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                      
                      {job.skills?.length > 3 && (
                        <Chip
                          label={`+${job.skills.length - 3} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveJob(job);
                      }}
                    >
                      {savedJobs.some(saved => saved.id === job.id) ? (
                        <Bookmark color="primary" />
                      ) : (
                        <BookmarkBorder />
                      )}
                    </IconButton>
                    
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentOptionsJob(job);
                        setOptionsMenuAnchorEl(e.currentTarget);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={Math.ceil(totalJobs / pageSize)}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </>
    );
  };
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Job Search
      </Typography>
      
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Search Jobs" />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              Saved Jobs
              {savedJobs.length > 0 && (
                <Badge
                  badgeContent={savedJobs.length}
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          }
        />
        <Tab label="Saved Searches" />
      </Tabs>
      
      <Grid container spacing={3}>
        {isMobile ? (
          <Drawer
            anchor="left"
            open={filtersVisible}
            onClose={() => setFiltersVisible(false)}
          >
            <Box sx={{ width: 280, p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Filters</Typography>
                <IconButton onClick={() => setFiltersVisible(false)}>
                  <Close />
                </IconButton>
              </Box>
              {renderFilters()}
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handleClearFilters}>
                  Clear All
                </Button>
                
                <Button 
                  variant="contained"
                  onClick={() => {
                    setFiltersVisible(false);
                    searchJobs();
                  }}
                >
                  Apply Filters
                </Button>
              </Box>
            </Box>
          </Drawer>
        ) : (
          <Grid item xs={12} md={3} lg={3} xl={2.5}>
            {renderFilters()}
          </Grid>
        )}
        
        <Grid item xs={12} md={9} lg={9} xl={9.5}>
          <Paper sx={{ p: 2, mb: 2 }}>
            {renderSearchBar()}
          </Paper>
          
          <Paper sx={{ p: 2, mb: 2 }}>
            {renderSearchResults()}
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
      
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={searching}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>Searching jobs...</Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default JobSearch; 