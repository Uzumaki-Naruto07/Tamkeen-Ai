import React, { useState, useEffect } from 'react';
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
  RadioGroup, FormControlLabel, Accordion, AccordionSummary,
  AccordionDetails, Switch, Slider
} from '@mui/material';
import {
  Radar, BarChart, DonutLarge, BubbleChart, Timeline,
  ExpandMore, Search, FilterList, Upload, Refresh, Add,
  CompareArrows, Star, StarOutline, StarHalf, FilterAlt,
  MoreVert, Share, Download, Info, Check, ArrowUpward,
  ArrowDownward, CheckCircle, Warning, Error as ErrorIcon,
  Label, Extension, TrendingUp, TrendingDown, EmojiEvents,
  School, Work, Build, Assessment, QueryStats, ViewWeek,
  DataUsage, Palette, WebAsset, Code, Science, Psychology,
  Business, Public, Language, Group, Engineering, CastForEducation,
  DesignServices
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '@mui/material/styles';

// Charts
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar as RechartsRadar, ResponsiveContainer, Legend,
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Scatter, ScatterChart, ZAxis,
  Cell, Area, AreaChart, LineChart, Line, ReferenceLine,
  PieChart, Pie, Treemap, Sankey
} from 'recharts';

// Heatmap
import Heatmap from 'react-heatmap-grid';

const SkillInsightCenter = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skills, setSkills] = useState([]);
  const [skillCategories, setSkillCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [jobProfiles, setJobProfiles] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0: Overview, 1: By Category, 2: Job Match, 3: Growth Path
  const [skillGapDialogOpen, setSkillGapDialogOpen] = useState(false);
  const [skillDetailsDialogOpen, setSkillDetailsDialogOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareJobId, setCompareJobId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNonMatchingSkills, setShowNonMatchingSkills] = useState(true);
  const [sortBy, setSortBy] = useState('strengthDesc'); // strengthDesc, strengthAsc, nameAsc, nameDesc, relevanceDesc
  
  const navigate = useNavigate();
  const { profile } = useUser();
  const theme = useTheme();
  
  const colorScheme = {
    technical: theme.palette.primary.main,
    soft: theme.palette.secondary.main,
    domain: theme.palette.success.main,
    tools: theme.palette.info.main,
    language: theme.palette.warning.main,
    certification: theme.palette.error.main
  };
  
  // Load user skills and job profiles
  useEffect(() => {
    const loadData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Load skills
        const skillsResponse = await apiEndpoints.skills.getUserSkills(profile.id);
        
        // Group skills by category
        const categories = {};
        skillsResponse.data.forEach(skill => {
          if (!categories[skill.category]) {
            categories[skill.category] = [];
          }
          categories[skill.category].push(skill);
        });
        
        setSkills(skillsResponse.data);
        setSkillCategories(Object.keys(categories).map(key => ({
          name: key,
          skills: categories[key],
          count: categories[key].length
        })));
        
        // Load job profiles
        const jobsResponse = await apiEndpoints.jobs.getRecommendedJobs(profile.id);
        setJobProfiles(jobsResponse.data);
        
        // Set default selected job if available
        if (jobsResponse.data.length > 0) {
          setSelectedJob(jobsResponse.data[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading skill data:', err);
        setError('Failed to load your skill data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [profile?.id]);
  
  // Handler for changing selected category
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };
  
  // Handler for changing selected job
  const handleJobChange = (event) => {
    setSelectedJob(event.target.value);
  };
  
  // Handler for changing sort method
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };
  
  // Handler for changing comparison job
  const handleCompareJobChange = (event) => {
    setCompareJobId(event.target.value);
  };
  
  // Toggle comparison mode
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    if (!compareMode && jobProfiles.length > 1) {
      // Set default comparison job to second in list
      setCompareJobId(jobProfiles.length > 1 ? jobProfiles[1].id : null);
    }
  };
  
  // Handle skill search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  // Filter skills based on search term and category
  const getFilteredSkills = () => {
    let filtered = [...skills];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(skill => 
        skill.name.toLowerCase().includes(term) || 
        skill.description?.toLowerCase().includes(term)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }
    
    // Sort skills
    switch (sortBy) {
      case 'strengthDesc':
        filtered.sort((a, b) => b.strength - a.strength);
        break;
      case 'strengthAsc':
        filtered.sort((a, b) => a.strength - b.strength);
        break;
      case 'nameAsc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'relevanceDesc':
        // Sort by job relevance if a job is selected
        if (selectedJob) {
          const job = jobProfiles.find(j => j.id === selectedJob);
          if (job) {
            filtered.sort((a, b) => {
              const aRelevance = job.requiredSkills.some(s => s.id === a.id) ? 2 : 
                               job.preferredSkills.some(s => s.id === a.id) ? 1 : 0;
              const bRelevance = job.requiredSkills.some(s => s.id === b.id) ? 2 : 
                               job.preferredSkills.some(s => s.id === b.id) ? 1 : 0;
              return bRelevance - aRelevance;
            });
          }
        }
        break;
      default:
        break;
    }
    
    return filtered;
  };
  
  // Get match percentage for a specific job
  const getJobMatchPercentage = (jobId) => {
    if (!jobId) return 0;
    
    const job = jobProfiles.find(j => j.id === jobId);
    if (!job) return 0;
    
    // Calculate required skills match (weighted more heavily)
    let requiredMatched = 0;
    job.requiredSkills.forEach(requiredSkill => {
      const userSkill = skills.find(s => s.id === requiredSkill.id);
      if (userSkill && userSkill.strength >= requiredSkill.minimumLevel) {
        requiredMatched++;
      }
    });
    
    const requiredPercentage = job.requiredSkills.length === 0 ? 100 : 
      (requiredMatched / job.requiredSkills.length) * 100;
    
    // Calculate preferred skills match
    let preferredMatched = 0;
    job.preferredSkills.forEach(preferredSkill => {
      const userSkill = skills.find(s => s.id === preferredSkill.id);
      if (userSkill && userSkill.strength >= preferredSkill.minimumLevel) {
        preferredMatched++;
      }
    });
    
    const preferredPercentage = job.preferredSkills.length === 0 ? 100 : 
      (preferredMatched / job.preferredSkills.length) * 100;
    
    // Combined score - required skills are 70% of total, preferred are 30%
    return (requiredPercentage * 0.7) + (preferredPercentage * 0.3);
  };
  
  // Get missing skills for a job
  const getMissingSkills = (jobId) => {
    if (!jobId) return [];
    
    const job = jobProfiles.find(j => j.id === jobId);
    if (!job) return [];
    
    const missing = [];
    
    // Check required skills
    job.requiredSkills.forEach(requiredSkill => {
      const userSkill = skills.find(s => s.id === requiredSkill.id);
      if (!userSkill || userSkill.strength < requiredSkill.minimumLevel) {
        missing.push({
          ...requiredSkill,
          required: true,
          currentLevel: userSkill?.strength || 0,
          gap: requiredSkill.minimumLevel - (userSkill?.strength || 0)
        });
      }
    });
    
    // Check preferred skills
    job.preferredSkills.forEach(preferredSkill => {
      const userSkill = skills.find(s => s.id === preferredSkill.id);
      if (!userSkill || userSkill.strength < preferredSkill.minimumLevel) {
        missing.push({
          ...preferredSkill,
          required: false,
          currentLevel: userSkill?.strength || 0,
          gap: preferredSkill.minimumLevel - (userSkill?.strength || 0)
        });
      }
    });
    
    return missing.sort((a, b) => {
      // Sort by required first, then by gap size
      if (a.required && !b.required) return -1;
      if (!a.required && b.required) return 1;
      return b.gap - a.gap;
    });
  };
  
  // Prepare data for radar chart
  const prepareRadarData = () => {
    const radarData = [];
    
    skillCategories.forEach(category => {
      // Skip categories with no skills
      if (category.skills.length === 0) return;
      
      // Calculate average strength for this category
      const avgStrength = category.skills.reduce((sum, skill) => sum + skill.strength, 0) / category.skills.length;
      
      radarData.push({
        subject: category.name,
        A: avgStrength,
        fullMark: 5
      });
    });
    
    return radarData;
  };
  
  // Prepare data for job comparison radar chart
  const prepareJobRadarData = () => {
    if (!selectedJob) return [];
    
    const job = jobProfiles.find(j => j.id === selectedJob);
    if (!job) return [];
    
    const radarData = [];
    const compareJob = compareMode && compareJobId ? 
      jobProfiles.find(j => j.id === compareJobId) : null;
    
    // Get all categories from the job's required and preferred skills
    const categories = new Set();
    [...job.requiredSkills, ...job.preferredSkills].forEach(skill => {
      categories.add(skill.category);
    });
    
    if (compareJob) {
      [...compareJob.requiredSkills, ...compareJob.preferredSkills].forEach(skill => {
        categories.add(skill.category);
      });
    }
    
    // For each category, calculate match percentage
    [...categories].forEach(category => {
      const entry = { subject: category };
      
      // Calculate user's match for this job and category
      const jobSkillsInCategory = [...job.requiredSkills, ...job.preferredSkills]
        .filter(s => s.category === category);
      
      let matchCount = 0;
      jobSkillsInCategory.forEach(jobSkill => {
        const userSkill = skills.find(s => s.id === jobSkill.id);
        if (userSkill && userSkill.strength >= jobSkill.minimumLevel) {
          matchCount++;
        }
      });
      
      const matchPercentage = jobSkillsInCategory.length === 0 ? 100 :
        (matchCount / jobSkillsInCategory.length) * 100;
      
      entry.A = matchPercentage;
      
      // If comparing, do the same for the comparison job
      if (compareJob) {
        const compareSkillsInCategory = [...compareJob.requiredSkills, ...compareJob.preferredSkills]
          .filter(s => s.category === category);
        
        let compareMatchCount = 0;
        compareSkillsInCategory.forEach(jobSkill => {
          const userSkill = skills.find(s => s.id === jobSkill.id);
          if (userSkill && userSkill.strength >= jobSkill.minimumLevel) {
            compareMatchCount++;
          }
        });
        
        const compareMatchPercentage = compareSkillsInCategory.length === 0 ? 100 :
          (compareMatchCount / compareSkillsInCategory.length) * 100;
        
        entry.B = compareMatchPercentage;
      }
      
      entry.fullMark = 100;
      radarData.push(entry);
    });
    
    return radarData;
  };
  
  // Prepare data for bar chart of skills in a category
  const prepareCategoryBarData = (categoryName) => {
    if (categoryName === 'all') {
      // Use top skills from each category
      const topSkills = [];
      skillCategories.forEach(category => {
        const sortedSkills = [...category.skills].sort((a, b) => b.strength - a.strength);
        if (sortedSkills.length > 0) {
          topSkills.push(sortedSkills[0]);
        }
        if (sortedSkills.length > 1) {
          topSkills.push(sortedSkills[1]);
        }
      });
      return topSkills.map(skill => ({
        name: skill.name,
        strength: skill.strength,
        category: skill.category,
        fill: colorScheme[skill.category.toLowerCase()] || theme.palette.primary.main
      }));
    }
    
    const categorySkills = skills.filter(skill => skill.category === categoryName);
    
    return categorySkills.map(skill => ({
      name: skill.name,
      strength: skill.strength,
      fill: colorScheme[categoryName.toLowerCase()] || theme.palette.primary.main
    }));
  };
  
  // Prepare data for job match percentage bar chart
  const prepareJobMatchBarData = () => {
    if (jobProfiles.length === 0) return [];
    
    return jobProfiles.map(job => ({
      name: job.title,
      match: getJobMatchPercentage(job.id),
      isSelected: job.id === selectedJob,
      isCompare: job.id === compareJobId
    }));
  };
  
  // Prepare data for heatmap
  const prepareHeatmapData = () => {
    if (skillCategories.length === 0) return { xLabels: [], yLabels: [], data: [] };
    
    // Use top job categories for Y axis
    const jobCategories = Array.from(new Set(jobProfiles.map(job => job.category)))
      .slice(0, 5);
    
    // Use skill categories for X axis
    const skillCategoryNames = skillCategories.map(cat => cat.name);
    
    // Create data array
    const data = [];
    
    jobCategories.forEach(jobCategory => {
      const row = [];
      
      skillCategoryNames.forEach(skillCategory => {
        // Find all jobs in this job category
        const jobsInCategory = jobProfiles.filter(job => job.category === jobCategory);
        
        // Find all skills in this skill category
        const skillsInCategory = skills.filter(skill => skill.category === skillCategory);
        
        // Calculate average relevance of these skills to these jobs
        let relevanceSum = 0;
        let relevanceCount = 0;
        
        jobsInCategory.forEach(job => {
          skillsInCategory.forEach(skill => {
            const isRequired = job.requiredSkills.some(s => s.id === skill.id);
            const isPreferred = job.preferredSkills.some(s => s.id === skill.id);
            
            if (isRequired) {
              relevanceSum += 2; // Weight required skills more
              relevanceCount++;
            } else if (isPreferred) {
              relevanceSum += 1;
              relevanceCount++;
            }
          });
        });
        
        const avgRelevance = relevanceCount === 0 ? 0 : relevanceSum / relevanceCount;
        row.push(avgRelevance);
      });
      
      data.push(row);
    });
    
    return {
      xLabels: skillCategoryNames,
      yLabels: jobCategories,
      data
    };
  };
  
  // Render skill strength indicator
  const renderStrengthIndicator = (strength) => {
    const maxStars = 5;
    const fullStars = Math.floor(strength);
    const hasHalfStar = strength % 1 >= 0.5;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} fontSize="small" color="warning" />
        ))}
        
        {hasHalfStar && <StarHalf fontSize="small" color="warning" />}
        
        {[...Array(maxStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <StarOutline key={i} fontSize="small" color="warning" />
        ))}
        
        <Typography variant="body2" sx={{ ml: 1 }}>
          {strength.toFixed(1)}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      {/* Rest of the component content */}
    </Box>
  );
};

export default SkillInsightCenter; 