import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Tooltip, CircularProgress, Alert, Chip, Avatar,
  Slider, FormControlLabel, Switch, Accordion, AccordionSummary,
  AccordionDetails, List, ListItem, ListItemText, ListItemIcon,
  Autocomplete, Tab, Tabs, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, Badge
} from '@mui/material';
import {
  AttachMoney, TrendingUp, TrendingDown, Public,
  FilterList, Compare, Share, Info, GetApp, Cached,
  BarChart, Timeline, DonutLarge, School, Work, Business,
  MonetizationOn, LocationOn, Category, ExpandMore, PieChart,
  AccessTime, Search, NearMe, AccountBalance, CompareArrows,
  Psychology, Build, Science, Gavel, LocalOffer, ChevronRight,
  ShowChart, CalendarToday, CheckCircle, Warning, Error as ErrorIcon,
  CloudDownload, HelpOutline, Calculate, Insights
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '@mui/material/styles';

// Charts
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ComposedChart, Scatter,
  ScatterChart, ZAxis, Cell, Pie, PieChart
} from 'recharts';

// Maps
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import ReactTooltip from 'react-tooltip';

// Number formatting
import numeral from 'numeral';

// For comparing salaries by country/region
const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

const SalaryInsights = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobTitles, setJobTitles] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [experienceLevels, setExperienceLevels] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState('');
  const [industryOptions, setIndustryOptions] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [salaryData, setSalaryData] = useState(null);
  const [regionalData, setRegionalData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [educationImpact, setEducationImpact] = useState([]);
  const [salaryFactors, setSalaryFactors] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [compareJob, setCompareJob] = useState('');
  const [compareSalary, setCompareSalary] = useState(null);
  const [tooltipContent, setTooltipContent] = useState('');
  const [mapRegion, setMapRegion] = useState({ coordinates: [0, 0], zoom: 1 });
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [negotiationTipsOpen, setNegotiationTipsOpen] = useState(false);
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [showAdjustedValues, setShowAdjustedValues] = useState(true); // COL-adjusted vs raw
  const [includeBenefits, setIncludeBenefits] = useState(true);
  const [dataLastUpdated, setDataLastUpdated] = useState(null);
  const [regionSearch, setRegionSearch] = useState('');
  
  const navigate = useNavigate();
  const { profile } = useUser();
  const theme = useTheme();
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load job titles
        const jobsResponse = await apiEndpoints.salary.getJobTitles();
        setJobTitles(jobsResponse.data);
        
        // Load locations
        const locationsResponse = await apiEndpoints.salary.getLocations();
        setLocations(locationsResponse.data);
        
        // Load experience levels
        const experienceResponse = await apiEndpoints.salary.getExperienceLevels();
        setExperienceLevels(experienceResponse.data);
        
        // Load industry options
        const industriesResponse = await apiEndpoints.salary.getIndustries();
        setIndustryOptions(industriesResponse.data);
        
        // Get last data update timestamp
        const metadataResponse = await apiEndpoints.salary.getMetadata();
        setDataLastUpdated(metadataResponse.data.lastUpdated);
        
        // Set default values from user profile if available
        if (profile?.id) {
          if (profile.jobTitle) {
            const matchingJob = jobsResponse.data.find(j => 
              j.title.toLowerCase() === profile.jobTitle.toLowerCase());
            if (matchingJob) {
              setSelectedJob(matchingJob.id);
            }
          }
          
          if (profile.location) {
            const matchingLocation = locationsResponse.data.find(l => 
              l.name.toLowerCase().includes(profile.location.toLowerCase()));
            if (matchingLocation) {
              setSelectedLocation(matchingLocation.id);
            }
          }
          
          if (profile.experience) {
            const matchingExp = experienceResponse.data.find(e => 
              e.level.toLowerCase().includes(profile.experience.toLowerCase()));
            if (matchingExp) {
              setSelectedExperience(matchingExp.id);
            }
          }
          
          if (profile.industry) {
            const matchingIndustry = industriesResponse.data.find(i => 
              i.name.toLowerCase().includes(profile.industry.toLowerCase()));
            if (matchingIndustry) {
              setSelectedIndustry(matchingIndustry.id);
            }
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load salary data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [profile]);
  
  // Load salary data when selection changes
  useEffect(() => {
    const loadSalaryData = async () => {
      if (!selectedJob || !selectedLocation || !selectedExperience) {
        return; // Don't load data until all required filters are selected
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Load primary salary data
        const salaryResponse = await apiEndpoints.salary.getSalaryData({
          jobId: selectedJob,
          locationId: selectedLocation,
          experienceId: selectedExperience,
          industryId: selectedIndustry || undefined,
          includeBenefits,
          adjustedValues: showAdjustedValues,
          currency: currencyCode
        });
        
        setSalaryData(salaryResponse.data);
        
        // Load regional comparison data
        const regionalResponse = await apiEndpoints.salary.getRegionalData({
          jobId: selectedJob,
          experienceId: selectedExperience,
          industryId: selectedIndustry || undefined,
          currency: currencyCode
        });
        
        setRegionalData(regionalResponse.data);
        
        // Load historical trend data
        const historicalResponse = await apiEndpoints.salary.getHistoricalData({
          jobId: selectedJob,
          locationId: selectedLocation,
          years: 5,
          currency: currencyCode
        });
        
        setHistoricalData(historicalResponse.data);
        
        // Load education impact data
        const educationResponse = await apiEndpoints.salary.getEducationImpact({
          jobId: selectedJob,
          locationId: selectedLocation
        });
        
        setEducationImpact(educationResponse.data);
        
        // Load salary factors
        const factorsResponse = await apiEndpoints.salary.getSalaryFactors({
          jobId: selectedJob
        });
        
        setSalaryFactors(factorsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading salary data:', err);
        setError('Failed to load salary data. Please try again later.');
        setLoading(false);
      }
    };
    
    if (selectedJob && selectedLocation && selectedExperience) {
      loadSalaryData();
    }
  }, [selectedJob, selectedLocation, selectedExperience, selectedIndustry, currencyCode, showAdjustedValues, includeBenefits]);

  return (
    <Box>
      {/* Rest of the component content */}
    </Box>
  );
};

export default SalaryInsights; 