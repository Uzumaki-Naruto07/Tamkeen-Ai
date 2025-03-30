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
  Snackbar, Badge, Backdrop, LinearProgress, Avatar,
  ListItemAvatar, InputBase
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Search, LocationOn, Work, BusinessCenter, FilterList,
  Bookmark, BookmarkBorder, Star, StarBorder, Close,
  ExpandMore, Sort, Tune, AttachMoney, Timer,
  Flag, SendOutlined, MoreVert, Share, Visibility,
  Description, Assessment, Block, Check, Clear,
  Favorite, FavoriteBorder, Schedule, ArrowDropDown,
  ImportExport, Public, SavedSearch, History, Refresh,
  Home, Group, Psychology, School, Engineering, AccountBalance,
  SentimentSatisfiedAlt, TrendingUp, MonetizationOn, AccessTime,
  CheckCircleOutline, RemoveCircleOutline, NavigateNext, NavigateBefore,
  ArticleOutlined, CategoryOutlined, Add, SaveAlt
} from '@mui/icons-material';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
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
    salary: [0, 500000],
    salaryType: 'annual',
    remote: false,
    datePosted: 'any',
    industries: [],
    skills: [],
    emirates: [],
    visaStatus: [],
    sectorType: 'all',
    companyLocation: 'all',
    benefits: []
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
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState(null);
  const [popularSkills, setPopularSkills] = useState([
    'Arabic', 'English', 'Microsoft Office', 'Project Management', 
    'Customer Service', 'Sales', 'Marketing', 'Data Analysis',
    'Leadership', 'Communication', 'Accounting', 'AutoCAD',
    'React', 'JavaScript', 'Python', 'SQL', 'Business Development'
  ]);
  const [skillRequirementType, setSkillRequirementType] = useState({});
  const [showAIJobSuggestions, setShowAIJobSuggestions] = useState(false);
  const [suggestedJobs, setSuggestedJobs] = useState([]);
  
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
    let isMounted = true;
    
    const fetchInitialData = async () => {
      try {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
        if (loading) {
      setLoading(true);
      setError(null);
      
      try {
            // Fetch filter options without triggering searches
        const [industriesRes, skillsRes, savedJobsRes, savedSearchesRes, searchHistoryRes] = await Promise.all([
          apiEndpoints.jobs.getIndustries(),
          apiEndpoints.jobs.getSkillsList(),
          apiEndpoints.jobs.getSavedJobs(profile.id),
          apiEndpoints.jobs.getSavedSearches(profile.id),
          apiEndpoints.jobs.getSearchHistory(profile.id)
        ]);
        
            // Only update state if component is still mounted
            if (isMounted) {
        setIndustryList(industriesRes.data || []);
        setSkillsList(skillsRes.data || []);
        setSavedJobs(savedJobsRes.data || []);
        setSavedSearches(savedSearchesRes.data || []);
        setSearchHistory(searchHistoryRes.data || []);
        
              // Load recent jobs only once on initial load
          const recentJobsRes = await apiEndpoints.jobs.getRecentJobs(page, pageSize);
          setJobs(recentJobsRes.data.jobs || []);
          setTotalJobs(recentJobsRes.data.total || 0);
              setLoading(false);
        }
      } catch (err) {
            if (isMounted) {
        console.error('Error fetching initial job search data:', err);
        setError('Failed to load job search data');
        setLoading(false);
            }
          }
        }
      } catch (outerError) {
        console.error('Error in fetchInitialData:', outerError);
        if (isMounted) {
          setError('An error occurred loading the jobs page');
          setLoading(false);
        }
      }
    };
    
    fetchInitialData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [profile?.id, loading, page, pageSize]);
  
  // Perform search when search term, location, page, or filters change
  useEffect(() => {
    // Only search if we have criteria and aren't already searching
    const hasSearchCriteria = 
      Boolean(debouncedSearchTerm) || 
      Boolean(debouncedLocation) || 
      Boolean(filters?.jobTypes?.length) || 
      Boolean(filters?.experience?.length) || 
      Boolean(filters?.remote) || 
      (filters?.datePosted && filters.datePosted !== 'any') || 
      Boolean(filters?.industries?.length) || 
      Boolean(filters?.skills?.length);
    
    if (hasSearchCriteria && !searching) {
      // Update URL with search params
      const queryParams = new URLSearchParams();
      if (debouncedSearchTerm) queryParams.set('q', debouncedSearchTerm);
      if (debouncedLocation) queryParams.set('location', debouncedLocation);
      if (page > 1) queryParams.set('page', page.toString());
      
      // Navigate and perform search
      navigate(`/jobs?${queryParams.toString()}`, { replace: true });
      searchJobs();
    }
  // Simplify dependency array to avoid syntax errors
  }, [debouncedSearchTerm, debouncedLocation, page, filters, sortBy, searching, navigate]);
  
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
    // Prevent running a search if one is already in progress
    if (searching) {
      console.log("Preventing duplicate search");
      return;
    }
    
    setSearching(true);
    setError(null);
    
    try {
      // Safely get all filter values with fallbacks
      const jobTypes = filters?.jobTypes || [];
      const experience = filters?.experience || [];
      const salary = filters?.salary || [0, 500000];
      const remote = Boolean(filters?.remote);
      const datePosted = filters?.datePosted || 'any';
      const industries = filters?.industries || [];
      const skills = filters?.skills || [];
      // UAE specific filters
      const emirates = filters?.emirates || [];
      const visaStatus = filters?.visaStatus || [];
      const benefits = filters?.benefits || [];
      const sectorType = filters?.sectorType || 'all';
      const companyLocation = filters?.companyLocation || 'all';
      const salaryType = filters?.salaryType || 'annual';
      
      // Call the API with safe values
      const response = await apiEndpoints.jobs.searchJobs({
        search: debouncedSearchTerm || '',
        location: debouncedLocation || '',
        page: page || 1,
        pageSize: pageSize || 10,
        sortBy: sortBy || 'relevance',
        jobTypes,
        experience,
        salary,
        remote,
        datePosted,
        industries,
        skills,
        // Include UAE specific filters
        emirates,
        visaStatus,
        benefits,
        sectorType,
        companyLocation,
        salaryType
      });
      
      if (response?.data) {
      setJobs(response.data.jobs || []);
      setTotalJobs(response.data.total || 0);
      }
      
      // Add to search history if this is a new search and we have search terms
      if (profile?.id && (debouncedSearchTerm || debouncedLocation)) {
        try {
        await apiEndpoints.jobs.addSearchHistory(profile.id, {
            search: debouncedSearchTerm || '',
            location: debouncedLocation || '',
            jobTypes,
            experience,
            remote,
            datePosted,
            industries,
            skills,
            // Include UAE specific filters in search history
            emirates,
            visaStatus,
            benefits,
            sectorType,
            companyLocation,
            salaryType
          });
        } catch (historyError) {
          // Log but don't break the UI if history fails to save
          console.error('Error saving search history:', historyError);
        }
      }
    } catch (err) {
      console.error('Error searching jobs:', err);
      setError('Failed to search jobs. Please try again.');
      setJobs([]);
      setTotalJobs(0);
    } finally {
      // Small delay before allowing another search to prevent rapid-fire searches
      setTimeout(() => {
        setSearching(false);
      }, 300);
    }
  };
  
  // Function to handle clearing all filters
  const handleClearFilters = () => {
    setFilters({
      jobTypes: [],
      experience: [],
      salary: [0, 500000],
      salaryType: 'annual',
      remote: false,
      datePosted: 'any',
      industries: [],
      skills: [],
      emirates: [],
      visaStatus: [],
      sectorType: 'all',
      companyLocation: 'all',
      benefits: []
    });
  };

  // Function to get the label for sort options
  const getSortLabel = (sortKey) => {
    const sortOptions = {
      relevance: 'Relevance',
      dateDesc: 'Most Recent',
      dateAsc: 'Oldest First',
      salaryDesc: 'Highest Salary',
      salaryAsc: 'Lowest Salary'
    };
    return sortOptions[sortKey] || 'Relevance';
  };

  // Handler for saving a job
  const handleSaveJob = (job) => {
    const isSaved = savedJobs.some(saved => saved.id === job.id);
    
    if (isSaved) {
      // Remove from saved jobs
      const updatedSavedJobs = savedJobs.filter(saved => saved.id !== job.id);
      setSavedJobs(updatedSavedJobs);
      setSnackbarMessage('Job removed from saved jobs');
    } else {
      // Add to saved jobs
      setSavedJobs([...savedJobs, job]);
      setSnackbarMessage('Job saved successfully');
    }
    
    setSnackbarOpen(true);
  };

  // Function to handle adding a skill directly
  const handleAddSkill = (skill) => {
    // Don't add if already exists
    if (filters.skills.includes(skill)) return;
    
    // Use handleFilterChange to update skills
    handleFilterChange('skills', skill, true);
    
    // Set default requirement type for the new skill
    setSkillRequirementType(prev => ({
      ...prev,
      [skill]: 'preferred'
    }));
  };

  // Function to toggle skill requirement type
  const handleToggleSkillRequirement = (skill) => {
    setSkillRequirementType({
      ...skillRequirementType,
      [skill]: skillRequirementType[skill] === 'required' ? 'preferred' : 'required'
    });
  };

  // Function to clear specific filter categories
  const handleClearFilterCategory = (category) => {
    const newFilters = { ...filters };
    
    if (Array.isArray(newFilters[category])) {
      newFilters[category] = [];
    } else if (category === 'salary') {
      newFilters.salary = [0, filters.salaryType === 'monthly' ? 50000 : 1000000];
    } else if (typeof newFilters[category] === 'boolean') {
      newFilters[category] = false;
    } else if (typeof newFilters[category] === 'string') {
      newFilters[category] = 'all';
    }
    
    setFilters(newFilters);
    
    // If clearing skills, also clear the requirement types
    if (category === 'skills') {
      setSkillRequirementType({});
    }
  };

  // Function to count active filters
  const countActiveFilters = () => {
    return (
      filters.jobTypes.length +
      filters.experience.length + 
      filters.industries.length +
      filters.skills.length +
      filters.emirates.length +
      filters.visaStatus.length +
      filters.benefits.length +
      (filters.remote ? 1 : 0) +
      (filters.datePosted !== 'any' ? 1 : 0) +
      (filters.sectorType !== 'all' ? 1 : 0) +
      (filters.companyLocation !== 'all' ? 1 : 0)
    );
  };

  // Handle filter changes
  const handleFilterChange = (category, value, checked = null) => {
    // Create a copy of current filters
    let updatedFilters = { ...filters };
    
    // For array-based filters like jobTypes, skills, etc.
    if (Array.isArray(updatedFilters[category])) {
      if (checked === true) {
        // Add value if it doesn't exist
        if (!updatedFilters[category].includes(value)) {
          updatedFilters[category] = [...updatedFilters[category], value];
        }
      } else if (checked === false) {
        // Remove value
        updatedFilters[category] = updatedFilters[category].filter(item => item !== value);
      } else {
        // Toggle value if checked is not provided
        if (updatedFilters[category].includes(value)) {
          updatedFilters[category] = updatedFilters[category].filter(item => item !== value);
        } else {
          updatedFilters[category] = [...updatedFilters[category], value];
        }
      }
    } else {
      // For single value filters like salaryType, datePosted, etc.
      updatedFilters[category] = value;
    }
    
    // Update filters state
    setFilters(updatedFilters);
    
    // Don't run search immediately to prevent refreshing while user is still selecting
    // When they're done, they can click the search button
  };

  // Render filters function
  const renderFilters = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
         
        {/* Emirates Filter - UAE specific */}
      <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>
              Emirates
            </Typography>
            {filters.emirates.length > 0 && (
              <Button 
                size="small" 
                onClick={() => handleClearFilterCategory('emirates')}
                startIcon={<Clear fontSize="small" />}
              >
                Clear
              </Button>
            )}
          </Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.emirates.length === 7}
                  indeterminate={filters.emirates.length > 0 && filters.emirates.length < 7}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Select all emirates
                      setFilters({
                        ...filters,
                        emirates: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah']
                      });
                    } else {
                      // Deselect all emirates
                      setFilters({
                        ...filters,
                        emirates: []
                      });
                    }
                  }}
                />
              }
              label={<Typography fontWeight="medium">Select All Emirates</Typography>}
            />
            {['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'].map((emirate) => (
              <FormControlLabel
                key={emirate}
                control={
                  <Checkbox
                    checked={filters.emirates.includes(emirate)}
                    onChange={(e) => handleFilterChange('emirates', emirate, e.target.checked)}
                  />
                }
                label={emirate}
              />
            ))}
          </FormGroup>
        </Box>
        
        {/* Job Type Filter */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>
              Job Type
            </Typography>
            {filters.jobTypes.length > 0 && (
              <Button 
                size="small" 
                onClick={() => handleClearFilterCategory('jobTypes')}
                startIcon={<Clear fontSize="small" />}
              >
                Clear
              </Button>
            )}
          </Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.jobTypes.length === 6}
                  indeterminate={filters.jobTypes.length > 0 && filters.jobTypes.length < 6}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Select all job types
                      setFilters({
                        ...filters,
                        jobTypes: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary', 'Freelance']
                      });
                    } else {
                      // Deselect all job types
                      setFilters({
                        ...filters,
                        jobTypes: []
                      });
                    }
                  }}
                />
              }
              label={<Typography fontWeight="medium">Select All Job Types</Typography>}
            />
            {['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary', 'Freelance'].map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={filters.jobTypes.includes(type)}
                    onChange={(e) => handleFilterChange('jobTypes', type, e.target.checked)}
                  />
                }
                label={type}
              />
            ))}
          </FormGroup>
        </Box>
        
        {/* Visa Status - UAE specific */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>
              Visa Status
            </Typography>
            {filters.visaStatus.length > 0 && (
              <Button 
                size="small" 
                onClick={() => handleClearFilterCategory('visaStatus')}
                startIcon={<Clear fontSize="small" />}
              >
                Clear
              </Button>
            )}
          </Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.visaStatus.length === 4}
                  indeterminate={filters.visaStatus.length > 0 && filters.visaStatus.length < 4}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Select all visa statuses
                      setFilters({
                        ...filters,
                        visaStatus: ['Employment Visa Provided', 'Visit Visa Accepted', 'Residence Visa Required', 'Any Visa Status']
                      });
                    } else {
                      // Deselect all visa statuses
                      setFilters({
                        ...filters,
                        visaStatus: []
                      });
                    }
                  }}
                />
              }
              label={<Typography fontWeight="medium">Select All Visa Statuses</Typography>}
            />
            {['Employment Visa Provided', 'Visit Visa Accepted', 'Residence Visa Required', 'Any Visa Status'].map((status) => (
              <FormControlLabel
                key={status}
                control={
                  <Checkbox
                    checked={filters.visaStatus.includes(status)}
                    onChange={(e) => handleFilterChange('visaStatus', status, e.target.checked)}
                  />
                }
                label={status}
              />
            ))}
          </FormGroup>
        </Box>
        
        {/* Sector Type - UAE specific */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Sector
          </Typography>
          <RadioGroup
            value={filters.sectorType}
            onChange={(e) => setFilters({ ...filters, sectorType: e.target.value })}
            name="sector-type"
          >
            <FormControlLabel value="all" control={<Radio />} label="All Sectors" />
            <FormControlLabel value="government" control={<Radio />} label="Government" />
            <FormControlLabel value="private" control={<Radio />} label="Private" />
            <FormControlLabel value="semi-government" control={<Radio />} label="Semi-Government" />
          </RadioGroup>
        </Box>
        
        {/* Company Location - UAE specific */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Company Location
          </Typography>
          <RadioGroup
            value={filters.companyLocation}
            onChange={(e) => setFilters({ ...filters, companyLocation: e.target.value })}
            name="company-location"
          >
            <FormControlLabel value="all" control={<Radio />} label="All Locations" />
            <FormControlLabel value="mainland" control={<Radio />} label="Mainland" />
            <FormControlLabel value="freezone" control={<Radio />} label="Free Zone" />
          </RadioGroup>
        </Box>
        
        {/* Experience Level Filter */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>
              Experience Level
            </Typography>
            {filters.experience.length > 0 && (
              <Button 
                size="small" 
                onClick={() => handleClearFilterCategory('experience')}
                startIcon={<Clear fontSize="small" />}
              >
                Clear
              </Button>
            )}
          </Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.experience.length === 5}
                  indeterminate={filters.experience.length > 0 && filters.experience.length < 5}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Select all experience levels
                      setFilters({
                        ...filters,
                        experience: ['Entry level', 'Mid level', 'Senior level', 'Manager', 'Executive']
                      });
                    } else {
                      // Deselect all experience levels
                      setFilters({
                        ...filters,
                        experience: []
                      });
                    }
                  }}
                />
              }
              label={<Typography fontWeight="medium">Select All Experience Levels</Typography>}
            />
            {['Entry level', 'Mid level', 'Senior level', 'Manager', 'Executive'].map((level) => (
              <FormControlLabel
                key={level}
                control={
                  <Checkbox
                    checked={filters.experience.includes(level)}
                    onChange={(e) => handleFilterChange('experience', level, e.target.checked)}
                  />
                }
                label={level}
              />
            ))}
          </FormGroup>
        </Box>
        
        {/* Salary Range Filter - Updated for UAE */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>
              Salary Range (AED)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 90, mr: 1 }}>
                <Select
                  value={filters.salaryType}
                  onChange={(e) => setFilters({ ...filters, salaryType: e.target.value })}
                  displayEmpty
                  size="small"
                  id="salary-type-select"
                  name="salary-type"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="annual">Annual</MenuItem>
                </Select>
              </FormControl>
              <Button 
                size="small" 
                onClick={() => handleClearFilterCategory('salary')}
                startIcon={<Clear fontSize="small" />}
              >
                Reset
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ px: 1 }}>
            <Slider
              value={filters.salary}
              onChange={(e, newValue) => setFilters({ ...filters, salary: newValue })}
              valueLabelDisplay="auto"
              min={0}
              max={filters.salaryType === 'monthly' ? 50000 : 1000000}
              step={filters.salaryType === 'monthly' ? 1000 : 10000}
              valueLabelFormat={(value) => 
                filters.salaryType === 'monthly'
                  ? `${value.toLocaleString()} AED/mo`
                  : `${value.toLocaleString()} AED/yr`
              }
              id="salary-range-slider"
              name="salary-range"
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                0 AED
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filters.salaryType === 'monthly' ? '50,000+ AED/mo' : '1,000,000+ AED/yr'}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Benefits - UAE specific */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>
              Benefits
            </Typography>
            {filters.benefits.length > 0 && (
              <Button 
                size="small" 
                onClick={() => handleClearFilterCategory('benefits')}
                startIcon={<Clear fontSize="small" />}
              >
                Clear
              </Button>
            )}
          </Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.benefits.length === 6}
                  indeterminate={filters.benefits.length > 0 && filters.benefits.length < 6}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Select all benefits
                      setFilters({
                        ...filters,
                        benefits: [
                          'Housing Allowance', 
                          'Transportation Allowance', 
                          'Health Insurance', 
                          'Family Sponsorship',
                          'Annual Tickets',
                          'Education Allowance'
                        ]
                      });
                    } else {
                      // Deselect all benefits
                      setFilters({
                        ...filters,
                        benefits: []
                      });
                    }
                  }}
                />
              }
              label={<Typography fontWeight="medium">Select All Benefits</Typography>}
            />
            {[
              'Housing Allowance', 
              'Transportation Allowance', 
              'Health Insurance', 
              'Family Sponsorship',
              'Annual Tickets',
              'Education Allowance'
            ].map((benefit) => (
              <FormControlLabel
                key={benefit}
                control={
                  <Checkbox
                    checked={filters.benefits.includes(benefit)}
                    onChange={(e) => handleFilterChange('benefits', benefit, e.target.checked)}
                  />
                }
                label={benefit}
              />
            ))}
          </FormGroup>
        </Box>
        
        {/* Remote Work Filter */}
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={filters.remote}
                onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
              />
            }
            label="Remote Only"
          />
        </Box>
        
        {/* Date Posted Filter */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Date Posted
          </Typography>
          <RadioGroup
            value={filters.datePosted}
            onChange={(e) => setFilters({ ...filters, datePosted: e.target.value })}
            name="date-posted"
          >
            <FormControlLabel value="any" control={<Radio />} label="Any time" />
            <FormControlLabel value="today" control={<Radio />} label="Today" />
            <FormControlLabel value="week" control={<Radio />} label="Past week" />
            <FormControlLabel value="month" control={<Radio />} label="Past month" />
          </RadioGroup>
        </Box>
        
        {/* Industries Filter - Updated with UAE industries */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>
              Industries
            </Typography>
            {filters.industries.length > 0 && (
              <Button 
                size="small" 
                onClick={() => handleClearFilterCategory('industries')}
                startIcon={<Clear fontSize="small" />}
              >
                Clear
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {[
              'Oil & Gas',
              'Banking & Finance',
              'Real Estate',
              'Construction',
              'Technology',
              'Healthcare',
              'Education',
              'Tourism & Hospitality',
              'Retail',
              'Media',
              'Logistics',
              'Government',
              'Telecommunications'
            ].map((industry) => (
              <Chip
                key={industry}
                label={industry}
                onClick={() => handleFilterChange('industries', industry)}
                color={filters.industries.includes(industry) ? "primary" : "default"}
                variant={filters.industries.includes(industry) ? "filled" : "outlined"}
                size="small"
              />
            ))}
          </Box>
        </Box>
        
        {/* Skills Filter */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>
              Skills
            </Typography>
            {filters.skills.length > 0 && (
              <Button 
                size="small" 
                onClick={() => handleClearFilterCategory('skills')}
                startIcon={<Clear fontSize="small" />}
              >
                Clear
              </Button>
            )}
          </Box>
          
          <Box sx={{ position: 'relative', mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              value={skillsInputValue}
              onChange={(e) => setSkillsInputValue(e.target.value)}
              placeholder="Add a skill"
              onFocus={() => setShowSkillsSuggestions(true)}
              ref={skillsInputRef}
              id="skills-input"
              name="skills-input"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => {
                        if (skillsInputValue.trim()) {
                          handleAddSkill(skillsInputValue.trim());
                          setSkillsInputValue('');
                        }
                      }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && skillsInputValue.trim()) {
                  handleAddSkill(skillsInputValue.trim());
                  setSkillsInputValue('');
                  e.preventDefault();
                }
              }}
            />
            
            {showSkillsSuggestions && suggestedSkills.length > 0 && (
              <Paper
                elevation={3}
                sx={{
                  position: 'absolute',
                  width: '100%',
                  zIndex: 10,
                  mt: 0.5
                }}
              >
                <List dense>
                  {suggestedSkills.map((skill) => (
                    <ListItem
                      key={skill}
                      button
                      onClick={() => {
                        handleAddSkill(skill);
                        setSkillsInputValue('');
                        setShowSkillsSuggestions(false);
                      }}
                    >
                      <ListItemText primary={skill} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Popular skills:
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {popularSkills.slice(0, 8).map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                variant={filters.skills.includes(skill) ? "filled" : "outlined"}
                color={filters.skills.includes(skill) ? "primary" : "default"}
                onClick={() => handleAddSkill(skill)}
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
          </Box>
          
          {filters.skills.length > 0 && (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Selected skills (click to toggle required/preferred):
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {filters.skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onDelete={() => {
                      // Remove skill using handleFilterChange
                      handleFilterChange('skills', skill, false);
                      
                      // Remove from requirement types
                      const newTypes = { ...skillRequirementType };
                      delete newTypes[skill];
                      setSkillRequirementType(newTypes);
                    }}
                    onClick={() => handleToggleSkillRequirement(skill)}
                    size="small"
                    color={skillRequirementType[skill] === 'required' ? "error" : "primary"}
                    deleteIcon={<Clear />}
                    sx={{ 
                      borderWidth: skillRequirementType[skill] === 'required' ? 2 : 1,
                      '&:after': {
                        content: skillRequirementType[skill] === 'required' ? '"Required"' : '"Preferred"',
                        position: 'absolute',
                        bottom: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.6rem',
                        color: skillRequirementType[skill] === 'required' ? theme.palette.error.main : theme.palette.primary.main
                      },
                      mb: 2
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
        
        {/* Active filter count display */}
        <Box sx={{ mt: 3, mb: 1 }}>
          {(() => {
            const activeFilters = countActiveFilters();
            
            return activeFilters > 0 ? (
              <Paper sx={{ p: 1, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <Typography variant="body2" align="center">
                  {activeFilters} active {activeFilters === 1 ? 'filter' : 'filters'}
                </Typography>
              </Paper>
            ) : null;
          })()}
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleClearFilters}
            startIcon={<Clear />}
              fullWidth
            color="error"
            sx={{ 
              borderWidth: '2px',
              '&:hover': { borderWidth: '2px' }
            }}
          >
            Clear All Filters
          </Button>
        </Box>
      </Box>
    );
  };
  
  // Render search bar
  const renderSearchBar = () => {
    const activeFilterCount = countActiveFilters();
    
    return (
      <>
        <Typography variant="h4" gutterBottom>
          Job Search
        </Typography>
        
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
          Find your dream job from thousands of opportunities in the UAE
        </Typography>
        
        <Paper
          component="form"
          elevation={2}
          sx={{
            p: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
          }}
          onSubmit={handleSearchSubmit}
        >
          <IconButton sx={{ p: '10px' }} aria-label="search">
            <Search />
          </IconButton>
          
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Job title, keyword, or company"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            inputProps={{ 'aria-label': 'search jobs' }}
          />
          
          <Divider sx={{ height: 28, m: 0.5, display: { xs: 'none', sm: 'block' } }} orientation="vertical" />
          
          <IconButton color="primary" sx={{ p: '10px', display: { xs: 'none', sm: 'block' } }}>
            <LocationOn />
          </IconButton>
          
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Location (city or emirate)"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
            inputProps={{ 'aria-label': 'location' }}
            endAdornment={
              (searchTerm || locationSearch) && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={() => {
                      setSearchTerm('');
                      setLocationSearch('');
                    }}
                    edge="end"
                    size="small"
                  >
                    <Clear fontSize="small" />
                  </IconButton>
                  </InputAdornment>
                )
            }
            />
          
            <Button
              variant="contained"
            color="primary" 
            onClick={handleSearchSubmit}
            sx={{ px: 3, py: 1 }}
            >
              Search
            </Button>
        </Paper>
        
        {/* Quick actions and stats */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ flexGrow: 1 }}></Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SaveAlt />}
              onClick={handleSaveSearch}
            >
              Save Search
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterList />}
              onClick={(event) => setSortMenuAnchorEl(event.currentTarget)}
            >
              Sort: {getSortLabel()}
            </Button>
            
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<Psychology />}
              onClick={() => {
                setShowAIJobSuggestions(true);
                handleGetAiSuggestions(); 
              }}
            >
              AI Job Suggestions
            </Button>
          </Box>
        </Box>
      </>
    );
  };
  
  // Render search results
  const renderSearchResults = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    // Tabs for Job Search, Saved Jobs, Search History
    const renderTabs = () => (
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label="Job Search" 
            icon={<Search fontSize="small" />} 
            iconPosition="start"
          />
          <Tab 
            label={`Saved Jobs (${savedJobs.length})`} 
            icon={<Bookmark fontSize="small" />} 
            iconPosition="start"
          />
          <Tab 
            label="Search History" 
            icon={<History fontSize="small" />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>
    );

    // Job Search Tab
    if (activeTab === 0) {
    if (jobs.length === 0) {
      return (
          <>
            {renderTabs()}
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" gutterBottom>No jobs found</Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search criteria or explore our recommendations instead
          </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Refresh />}
                sx={{ mt: 2 }}
                onClick={handleClearFilters}
              >
                Reset All Filters
              </Button>
        </Box>
          </>
      );
    }
    
    return (
      <>
          {renderTabs()}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1">
              Showing {Math.min((page - 1) * pageSize + 1, totalJobs)} to {Math.min(page * pageSize, totalJobs)} of {totalJobs} jobs
            </Typography>
          </Box>
          
        <List>
          {jobs.map((job) => (
            <React.Fragment key={job.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { 
                    bgcolor: 'action.hover' 
                    },
                    p: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <Box sx={{ display: 'flex', width: '100%' }}>
                    <Box sx={{ 
                      minWidth: 56, 
                      mr: 2,
                      display: 'flex',
                      alignItems: 'flex-start'
                    }}>
                    {job.companyLogo ? (
                      <Avatar 
                        src={job.companyLogo} 
                        alt={job.company}
                          sx={{ width: 50, height: 50 }}
                      />
                    ) : (
                        <Avatar sx={{ width: 50, height: 50, bgcolor: 'primary.main' }}>
                        {job.company?.charAt(0) || "J"}
                      </Avatar>
                    )}
                  </Box>
                  
                    <Box sx={{ flexGrow: 1, width: 'calc(100% - 76px)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Box sx={{ pr: 8 }}>
                          <Typography variant="h6" component="div" sx={{ fontSize: '1.1rem', lineHeight: 1.3 }}>
                      {job.title}
                    </Typography>
                          <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                      {job.company}
                    </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex' }}>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveJob(job);
                            }}
                            size="small"
                            sx={{ mr: 0.5 }}
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
                              handleShareJob(job);
                            }}
                            size="small"
                          >
                            <Share fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75, mt: 0.5 }}>
                      <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.location}
                      </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
                        <Chip 
                          size="small" 
                          label={job.jobType}
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 22 }}
                        />
                    
                        {job.salaryRange && (
                        <Chip
                          size="small"
                            label={job.salaryRange}
                          variant="outlined"
                            icon={<AttachMoney fontSize="small" />}
                            sx={{ fontSize: '0.7rem', height: 22 }}
                          />
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', mb: 0.75 }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'text.secondary' }}>
                          <AccessTime fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                          Posted: {job.postedDate}
                        </Typography>
                        
                        {job.matchScore && (
                          <>
                            <Typography variant="caption" sx={{ mx: 1, color: 'text.secondary' }}>•</Typography>
                            <Tooltip 
                              title={
                                <Box>
                                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Match Analysis:</Typography>
                                  <Box sx={{ mt: 0.5 }}>
                                    {job.matchInsights ? (
                                      <>
                                        <Typography variant="caption" display="block">✅ Matched Skills: {job.matchInsights.matchedSkills}/{job.matchInsights.totalSkills}</Typography>
                                        <Typography variant="caption" display="block">✅ Keyword Overlap: {job.matchInsights.keywordOverlap}%</Typography>
                                        <Typography variant="caption" display="block">✅ Title Similarity: {job.matchInsights.titleSimilarity}</Typography>
                                      </>
                                    ) : (
                                      <Typography variant="caption">Based on your resume, skills, and experience</Typography>
                                    )}
                                  </Box>
                                </Box>
                              } 
                              arrow
                            >
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: job.matchScore > 80 ? 'success.main' : job.matchScore > 60 ? 'primary.main' : 'text.secondary',
                                  cursor: 'help',
                                  textDecoration: 'underline',
                                  textDecorationStyle: 'dotted',
                                  textUnderlineOffset: '2px'
                                }}
                              >
                                {job.matchScore}% Match
                              </Typography>
                            </Tooltip>
                          </>
                        )}
                          
                        {job.requiredSkills && filters.skills && filters.skills.length > 0 && (
                          <>
                            <Typography variant="caption" sx={{ mx: 1, color: 'text.secondary' }}>•</Typography>
                            <Tooltip
                              title={
                                <Box>
                                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Skills you may need:</Typography>
                                  <Box sx={{ mt: 0.5 }}>
                                    {job.requiredSkills
                                      .filter(skill => !filters.skills.some(s => s.skill.toLowerCase() === skill.toLowerCase()))
                                      .slice(0, 5)
                                      .map((skill, index) => (
                                        <Typography key={index} variant="caption" display="block">
                                          • {skill}
                                        </Typography>
                                      ))
                                    }
                                  </Box>
                                </Box>
                              }
                              arrow
                            >
                        <Chip
                                  label={`${job.requiredSkills.filter(skill => !filters.skills.some(s => s.skill.toLowerCase() === skill.toLowerCase())).length} Skills Gap`} 
                          size="small"
                          variant="outlined"
                                  color="warning" 
                                  icon={<Psychology fontSize="small" />}
                                  sx={{ height: 22, fontSize: '0.7rem' }} 
                                />
                            </Tooltip>
                          </>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<SendOutlined fontSize="small" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAutoApply(job);
                          }}
                          sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}
                        >
                          AI Apply
                        </Button>
                        
                        {job.applicationStatus && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, maxWidth: 'calc(100% - 90px)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                                Application Progress
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                                {job.applicationStagePercent || 0}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={job.applicationStagePercent || 0} 
                              sx={{ height: 4, borderRadius: 2 }}
                            />
                          </Box>
                      )}
                    </Box>
                    </Box>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination 
              count={Math.ceil(totalJobs / pageSize)}
              page={page}
              onChange={(e, value) => setPage(value)}
                          color="primary"
            />
          </Box>
        </>
      );
    }
    
    // Saved Jobs Tab
    if (activeTab === 1) {
      return (
        <>
          {renderTabs()}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              {savedJobs.length} saved jobs
            </Typography>
          </Box>
          
          {savedJobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" gutterBottom>No saved jobs</Typography>
              <Typography variant="body2" color="text.secondary">
                Save jobs to easily find them later
              </Typography>
            </Box>
          ) : (
            <List>
              {savedJobs.map((job) => (
                <React.Fragment key={job.id}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { 
                        bgcolor: 'action.hover' 
                      },
                      p: 1.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <Box sx={{ display: 'flex', width: '100%' }}>
                      <Box sx={{ 
                        minWidth: 56, 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'flex-start'
                      }}>
                        {job.companyLogo ? (
                          <Avatar 
                            src={job.companyLogo} 
                            alt={job.company}
                            sx={{ width: 50, height: 50 }}
                          />
                        ) : (
                          <Avatar sx={{ width: 50, height: 50, bgcolor: 'primary.main' }}>
                            {job.company?.charAt(0) || "J"}
                          </Avatar>
                      )}
                    </Box>
                      
                      <Box sx={{ flexGrow: 1, width: 'calc(100% - 76px)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Box sx={{ pr: 8 }}>
                            <Typography variant="h6" component="div" sx={{ fontSize: '1.1rem', lineHeight: 1.3 }}>
                              {job.title}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                              {job.company}
                            </Typography>
                  </Box>
                  
                          <Box sx={{ display: 'flex' }}>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveJob(job);
                      }}
                              size="small"
                              sx={{ mr: 0.5 }}
                    >
                        <Bookmark color="primary" />
                    </IconButton>
                          </Box>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75, mt: 0.5 }}>
                          <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.location}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.75 }}>
                          <Chip
                            size="small"
                            label={job.jobType}
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 22 }}
                          />
                        
                          {job.salaryRange && (
                            <Chip
                              size="small"
                              label={job.salaryRange}
                              variant="outlined"
                              icon={<AttachMoney fontSize="small" />}
                              sx={{ fontSize: '0.7rem', height: 22 }}
                            />
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<SendOutlined fontSize="small" />}
                      onClick={(e) => {
                        e.stopPropagation();
                              handleAutoApply(job);
                      }}
                            sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}
                    >
                            AI Apply
                          </Button>
                        </Box>
                  </Box>
                </Box>
              </ListItem>
            </React.Fragment>
          ))}
        </List>
          )}
        </>
      );
    }
    
    // Search History Tab
    if (activeTab === 2) {
      return (
        <>
          {renderTabs()}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              {searchHistory.length} recent searches
            </Typography>
        </Box>
          
          {searchHistory.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" gutterBottom>No search history</Typography>
              <Typography variant="body2" color="text.secondary">
                Your recent searches will appear here
              </Typography>
            </Box>
          ) : (
            <List>
              {searchHistory.map((search, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => {
                    // Restore search
                    setSearchTerm(search.search || '');
                    setLocationSearch(search.location || '');
                    setActiveTab(0);
                    // Apply filters if available
                    if (search.filters) {
                      setFilters(search.filters);
                    }
                  }}
                  sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                >
                  <ListItemIcon>
                    <History color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                        {search.search && (
                          <Typography variant="body2" component="span" fontWeight="medium">
                            {search.search}
                          </Typography>
                        )}
                        {search.location && (
                          <>
                            {search.search && (
                              <Typography variant="body2" component="span" color="text.secondary" sx={{ mx: 1 }}>
                                in
                              </Typography>
                            )}
                            <Typography variant="body2" component="span" fontWeight="medium">
                              {search.location}
                            </Typography>
                          </>
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {search.date ? format(new Date(search.date), 'MMM d, yyyy') : 'Recent search'}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
      </>
    );
    }
  };
  
  // Render sort menu
  const renderSortMenu = () => {
  return (
      <Menu
        anchorEl={sortMenuAnchorEl}
        open={Boolean(sortMenuAnchorEl)}
        onClose={() => setSortMenuAnchorEl(null)}
      >
        <MenuItem 
          onClick={() => {
            setSortBy('relevance');
            setSortMenuAnchorEl(null);
          }}
          selected={sortBy === 'relevance'}
        >
          Relevance
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setSortBy('dateDesc');
            setSortMenuAnchorEl(null);
          }}
          selected={sortBy === 'dateDesc'}
        >
          Most Recent
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setSortBy('dateAsc');
            setSortMenuAnchorEl(null);
          }}
          selected={sortBy === 'dateAsc'}
        >
          Oldest First
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setSortBy('salaryDesc');
            setSortMenuAnchorEl(null);
          }}
          selected={sortBy === 'salaryDesc'}
        >
          Highest Salary
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setSortBy('salaryAsc');
            setSortMenuAnchorEl(null);
          }}
          selected={sortBy === 'salaryAsc'}
        >
          Lowest Salary
        </MenuItem>
      </Menu>
    );
  };
  
  // Handle job sharing
  const handleShareJob = (job) => {
    setCurrentSharedJob(job);
    setShareJobDialogOpen(true);
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchJobs();
  };
  
  // Handle sharing via email
  const handleEmailShare = async () => {
    if (!currentSharedJob || !shareEmail) return;
    
    try {
      await apiEndpoints.jobs.shareJobViaEmail({
        jobId: currentSharedJob.id,
        email: shareEmail,
        sender: profile?.id,
        message: `Check out this job: ${currentSharedJob.title} at ${currentSharedJob.company}`
      });
      
      setSnackbarMessage(`Job shared with ${shareEmail}`);
      setSnackbarOpen(true);
      setShareEmail('');
      setShareJobDialogOpen(false);
    } catch (error) {
      console.error('Error sharing job via email:', error);
      setSnackbarMessage('Failed to share job. Please try again.');
      setSnackbarOpen(true);
    }
  };
  
  // Handle getting AI job suggestions
  const handleGetAiSuggestions = async () => {
    try {
      // Set loading state
      setSuggestedJobs([]);
      
      // If there's a user profile, get suggestions based on their profile
      if (profile?.id) {
        const response = await apiEndpoints.jobs.getRecommendedJobs(profile.id);
        if (response.data) {
          setSuggestedJobs(response.data);
        }
      } else {
        // Otherwise use current search criteria and filters
        const suggestionsResponse = await apiEndpoints.jobs.searchJobs({
          search: searchTerm,
          location: locationSearch,
          page: 1,
          pageSize: 10,
          sortBy: 'relevance',
          jobTypes: filters.jobTypes,
          experience: filters.experience,
          salary: filters.salary,
          remote: filters.remote,
          datePosted: filters.datePosted,
          industries: filters.industries,
          skills: filters.skills,
          emirates: filters.emirates,
          visaStatus: filters.visaStatus,
          sectorType: filters.sectorType,
          companyLocation: filters.companyLocation,
          benefits: filters.benefits
        });
        
        if (suggestionsResponse.data?.jobs) {
          setSuggestedJobs(suggestionsResponse.data.jobs);
        }
      }
    } catch (error) {
      console.error("Failed to get job suggestions:", error);
      setSnackbarMessage('Failed to get job suggestions. Please try again.');
      setSnackbarOpen(true);
    }
  };
  
  // Handle saving search criteria
  const handleSaveSearch = () => {
    if (!searchTerm && !locationSearch && Object.values(filters).every(v => !v || (Array.isArray(v) && v.length === 0))) {
      setSnackbarMessage('Please enter search criteria before saving');
      setSnackbarOpen(true);
      return;
    }
    
    if (!profile?.id) {
      setSnackbarMessage('Please login to save your search');
      setSnackbarOpen(true);
      return;
    }
    
    const searchToSave = {
      search: searchTerm,
      location: locationSearch,
      filters: filters,
      date: new Date().toISOString()
    };
    
    try {
      // Add to search history with API call - use addSearchHistory instead
      apiEndpoints.jobs.addSearchHistory(profile.id, searchToSave);
      
      // Add to local state
      setSearchHistory([searchToSave, ...searchHistory]);
      setSaveSearchDialogOpen(false);
      
      // Show success message
      setSnackbarMessage('Search saved successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving search:', error);
      setSnackbarMessage('Failed to save search. Please try again.');
      setSnackbarOpen(true);
    }
  };
  
  // Handle automated job application
  const handleAutoApply = async (job) => {
    if (!profile?.id) {
      setSnackbarMessage('Please login to apply for jobs');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      setSnackbarMessage('AI is preparing your application...');
      setSnackbarOpen(true);
      
      // Use the existing API method - regular job application endpoint
      const response = await apiEndpoints.jobs.applyToJob({
        jobId: job.id,
        userId: profile.id,
        automate: true, // Indicate this is an AI-automated application
        coverLetter: `AI-generated application for ${job.title} at ${job.company}`, 
        resumeId: profile.resumeId
      });
      
      if (response?.data?.success) {
        setSnackbarMessage('AI application submitted successfully! You can track your application status in your dashboard.');
        setSnackbarOpen(true);
        
        // Update application status in job list if needed
        const updatedJobs = jobs.map(j => 
          j.id === job.id 
            ? {...j, applicationStatus: 'submitted', applicationStagePercent: 25} 
            : j
        );
        setJobs(updatedJobs);
      } else {
        throw new Error(response?.data?.message || 'Application could not be processed');
      }
    } catch (error) {
      console.error('Error applying to job with AI:', error);
      setSnackbarMessage('Failed to submit application. Please try manually or try again later.');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ py: 2, px: { xs: 2, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Job Search
      </Typography>
      
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Find your dream job from thousands of opportunities in the UAE
      </Typography>
      
      <Paper
        component="form"
        elevation={2}
        sx={{
          p: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
        }}
        onSubmit={handleSearchSubmit}
      >
        <IconButton sx={{ p: '10px' }} aria-label="search">
          <Search />
        </IconButton>
        
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Job title, keyword, or company"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          inputProps={{ 'aria-label': 'search jobs' }}
        />
        
        <Divider sx={{ height: 28, m: 0.5, display: { xs: 'none', sm: 'block' } }} orientation="vertical" />
        
        <IconButton color="primary" sx={{ p: '10px', display: { xs: 'none', sm: 'block' } }}>
          <LocationOn />
        </IconButton>
        
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Location (city or emirate)"
          value={locationSearch}
          onChange={(e) => setLocationSearch(e.target.value)}
          inputProps={{ 'aria-label': 'location' }}
          endAdornment={
            (searchTerm || locationSearch) && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={() => {
                    setSearchTerm('');
                    setLocationSearch('');
                  }}
                  edge="end"
                  size="small"
                >
                  <Clear fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }
        />
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSearchSubmit}
          sx={{ px: 3, py: 1 }}
        >
          Search
        </Button>
      </Paper>
      
      {/* Quick actions and stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}></Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SaveAlt />}
            onClick={handleSaveSearch}
          >
            Save Search
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterList />}
            onClick={(event) => setSortMenuAnchorEl(event.currentTarget)}
          >
            Sort: {getSortLabel()}
          </Button>
          
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<Psychology />}
            onClick={() => {
              setShowAIJobSuggestions(true);
              handleGetAiSuggestions(); 
            }}
          >
            AI Job Suggestions
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {/* Filters section - left column */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: { xs: 2, md: 0 } }}>
              {renderFilters()}
          </Paper>
        </Grid>
          
        {/* Job listings - right column */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            {renderSearchResults()}
          </Paper>
        </Grid>
      </Grid>
      
      {renderSortMenu()}
      
      <Dialog 
        open={shareJobDialogOpen} 
        onClose={() => setShareJobDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Job</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>Share via Email</Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="Email Address"
            margin="normal"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareJobDialogOpen(false)}>Cancel</Button>
                <Button 
                  variant="contained"
            onClick={handleEmailShare}
            disabled={!shareEmail}
          >
            Send
                </Button>
        </DialogActions>
      </Dialog>
      
      {/* AI Job Suggestions Dialog */}
      <Dialog
        open={showAIJobSuggestions}
        onClose={() => setShowAIJobSuggestions(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Psychology sx={{ mr: 1, color: 'success.main' }} />
            Personalized Job Recommendations
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Based on your profile, skills, and preferences, we've identified these job opportunities that closely match your qualifications.
          </Typography>
          
          {suggestedJobs.length > 0 ? (
            <List>
              {suggestedJobs.map((job) => (
                <ListItem 
                  key={job.id}
                  alignItems="flex-start"
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    p: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                  onClick={() => {
                    setShowAIJobSuggestions(false);
                    navigate(`/jobs/${job.id}`);
                  }}
                >
                  <ListItemAvatar>
                    {job.companyLogo ? (
                      <Avatar src={job.companyLogo} alt={job.company} />
                    ) : (
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {job.company?.charAt(0) || "J"}
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">{job.title}</Typography>
                        <Chip
                          size="small"
                          label={`${job.matchScore}% Match`}
                          color={job.matchScore > 80 ? "success" : job.matchScore > 60 ? "primary" : "default"}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span" color="text.primary">
                          {job.company}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <LocationOn fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary" component="span">
                            {job.location}
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<SendOutlined fontSize="small" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAutoApply(job);
                              setShowAIJobSuggestions(false);
                            }}
                            sx={{ fontSize: '0.7rem', py: 0.25, px: 1 }}
                          >
                            AI Apply
                          </Button>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="body1">
                Analyzing your profile to find the best matches...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAIJobSuggestions(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobSearch; 