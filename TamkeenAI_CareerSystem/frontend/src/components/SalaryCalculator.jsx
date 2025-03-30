import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Slider,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CalculateIcon from '@mui/icons-material/Calculate';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PublicIcon from '@mui/icons-material/Public';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import BarChartIcon from '@mui/icons-material/BarChart';
import SavingsIcon from '@mui/icons-material/Savings';
import TimelineIcon from '@mui/icons-material/Timeline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const SalaryCalculator = ({
  onCalculate,
  onSave,
  onCompare,
  industryData = {},
  locationData = {},
  loading = false,
  user = null
}) => {
  // Basic state
  const [activeTab, setActiveTab] = useState(0);
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState(3);
  const [education, setEducation] = useState('bachelor');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [companySize, setCompanySize] = useState('medium');
  const [remote, setRemote] = useState(false);
  
  // Results state
  const [calculationResults, setCalculationResults] = useState(null);
  const [comparisonVisible, setComparisonVisible] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState([]);
  const [selectedCalculationForComparison, setSelectedCalculationForComparison] = useState(null);
  
  // Advanced options
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [benefits, setBenefits] = useState({
    healthInsurance: true,
    retirement: true,
    bonus: false,
    stockOptions: false,
    flexibleHours: false,
    paidTimeOff: true
  });
  const [negotiationMode, setNegotiationMode] = useState(false);
  
  // UI state
  const [tipDialogOpen, setTipDialogOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState(null);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [errors, setErrors] = useState({});
  
  // Example industry and titles data (would typically come from the backend)
  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Media',
    'Government',
    'Nonprofit',
    'Construction',
    'Energy',
    'Transportation'
  ];
  
  const sampleJobTitles = {
    Technology: [
      'Software Engineer',
      'Data Scientist',
      'Product Manager',
      'UX Designer',
      'DevOps Engineer',
      'IT Support Specialist'
    ],
    Finance: [
      'Financial Analyst',
      'Investment Banker',
      'Accountant',
      'Financial Advisor',
      'Loan Officer',
      'Risk Manager'
    ]
    // Other industries would have their own job titles
  };
  
  // Tips and advice for salary negotiation
  const negotiationTips = [
    {
      id: 1,
      title: 'Research thoroughly',
      content: 'Before negotiating, research salary ranges for your role, industry, and location using reliable sources like Glassdoor, PayScale, and industry reports.'
    },
    {
      id: 2,
      title: 'Highlight your value',
      content: 'Emphasize specific achievements and how they\'ve benefited previous employers. Quantify your contributions whenever possible.'
    },
    {
      id: 3,
      title: 'Consider the full package',
      content: 'Compensation is more than just base salary. Consider benefits, bonuses, equity, retirement plans, and work-life balance factors.'
    }
  ];
  
  // Functions
  const handleCalculateSalary = (e) => {
    if (e) e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!jobTitle) newErrors.jobTitle = "Job title is required";
    if (!industry) newErrors.industry = "Industry is required";
    if (!location) newErrors.location = "Location is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear previous errors
    setErrors({});
    
    // Simulated calculation results
    const baseMin = 75000;
    const baseMax = 95000;
    
    // Adjustments based on inputs
    const experienceMultiplier = 1 + (experience * 0.03);
    const educationMultiplier = {
      highschool: 0.8,
      associate: 0.9,
      bachelor: 1.0,
      master: 1.15,
      phd: 1.25
    }[education];
    
    const locationMultiplier = location === 'San Francisco, CA' ? 1.5 :
                              location === 'New York, NY' ? 1.4 :
                              location === 'Seattle, WA' ? 1.3 :
                              location === 'Austin, TX' ? 1.1 :
                              location === 'Remote' ? 0.9 : 1.0;
                              
    const companySizeMultiplier = {
      startup: 0.9,
      small: 0.95,
      medium: 1.0,
      large: 1.05,
      enterprise: 1.1
    }[companySize];
    
    const skillsBonus = Math.min(skills.length * 0.02, 0.1);
    
    // Calculate base salary
    const calculatedMin = Math.round(baseMin * experienceMultiplier * educationMultiplier * locationMultiplier * companySizeMultiplier * (1 + skillsBonus));
    const calculatedMax = Math.round(baseMax * experienceMultiplier * educationMultiplier * locationMultiplier * companySizeMultiplier * (1 + skillsBonus));
    
    // Calculate total compensation
    const bonus = benefits.bonus ? Math.round(calculatedMin * 0.1) : 0;
    const retirement = benefits.retirement ? Math.round(calculatedMin * 0.05) : 0;
    const stockOptions = benefits.stockOptions ? Math.round(calculatedMin * 0.15) : 0;
    
    const newResults = {
      jobTitle,
      industry,
      location,
      experience,
      education,
      companySize,
      baseSalary: Math.round((calculatedMin + calculatedMax) / 2),
      baseSalaryRange: {
        min: calculatedMin,
        max: calculatedMax
      },
      totalCompensation: Math.round((calculatedMin + calculatedMax) / 2) + bonus + retirement + stockOptions,
      benefits: {
        bonus,
        retirement,
        stockOptions,
        healthInsurance: benefits.healthInsurance,
        flexibleHours: benefits.flexibleHours,
        paidTimeOff: benefits.paidTimeOff
      },
      date: new Date().toISOString()
    };
    
    setCalculationResults(newResults);
    
    if (onCalculate) {
      onCalculate(newResults);
    }
  };
  
  const handleSaveCalculation = () => {
    if (!calculationResults) return;
    
    const calculationToSave = {
      ...calculationResults,
      id: Date.now().toString()
    };
    
    setSavedCalculations([...savedCalculations, calculationToSave]);
    
    if (onSave) {
      onSave(calculationToSave);
    }
  };
  
  const handleCompareSelect = (id) => {
    const selectedCalc = savedCalculations.find(calc => calc.id === id);
    if (selectedCalc) {
      setSelectedCalculationForComparison(selectedCalc);
      setComparisonVisible(true);
    }
  };
  
  // Effects
  useEffect(() => {
    // Initialize with some example saved calculations
    if (savedCalculations.length === 0) {
      setSavedCalculations([
        {
          id: '1',
          jobTitle: 'Software Engineer',
          location: 'San Francisco, CA',
          industry: 'Technology',
          baseSalary: 120000,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
        },
        {
          id: '2',
          jobTitle: 'Product Manager',
          location: 'New York, NY',
          industry: 'Technology',
          baseSalary: 110000,
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days ago
        }
      ]);
    }
  }, []);
  
  // Render helpers
  const renderResultCard = () => {
    if (!calculationResults) return null;
    
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Salary Estimate
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Base Salary Range
                </Typography>
                <Typography variant="h5" color="primary">
                  ${calculationResults.baseSalaryRange.min.toLocaleString()} - ${calculationResults.baseSalaryRange.max.toLocaleString()}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Average Base Salary
                </Typography>
                <Typography variant="h4">
                  ${calculationResults.baseSalary.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  per year
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Compensation
                </Typography>
                <Typography variant="h5" color="primary">
                  ${calculationResults.totalCompensation.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  including all benefits
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Position Details
                </Typography>
                <Typography variant="body2">
                  {calculationResults.jobTitle} in {calculationResults.industry}
                </Typography>
                <Typography variant="body2">
                  {calculationResults.location} • {calculationResults.experience} years experience
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Additional Benefits Value
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {calculationResults.benefits.bonus > 0 && (
                  <Chip 
                    label={`Bonus: $${calculationResults.benefits.bonus.toLocaleString()}`}
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {calculationResults.benefits.retirement > 0 && (
                  <Chip 
                    label={`Retirement: $${calculationResults.benefits.retirement.toLocaleString()}`}
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {calculationResults.benefits.stockOptions > 0 && (
                  <Chip 
                    label={`Stock Options: $${calculationResults.benefits.stockOptions.toLocaleString()}`}
                    color="primary"
                    variant="outlined"
                  />
                )}
                
                {calculationResults.benefits.healthInsurance && (
                  <Chip label="Health Insurance" variant="outlined" />
                )}
                
                {calculationResults.benefits.flexibleHours && (
                  <Chip label="Flexible Hours" variant="outlined" />
                )}
                
                {calculationResults.benefits.paidTimeOff && (
                  <Chip label="Paid Time Off" variant="outlined" />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button 
            startIcon={<SaveIcon />}
            onClick={handleSaveCalculation}
          >
            Save Calculation
          </Button>
          
          <Button 
            startIcon={<PictureAsPdfIcon />}
          >
            Export as PDF
          </Button>
        </CardActions>
      </Card>
    );
  };
  
  // Render comparison view
  const renderComparisonView = () => {
    if (!comparisonVisible || !calculationResults || !selectedCalculationForComparison) return null;
    
    const current = calculationResults;
    const comparison = selectedCalculationForComparison;
    
    const salaryDiff = current.baseSalary - comparison.baseSalary;
    const percentDiff = Math.round((salaryDiff / comparison.baseSalary) * 100);
    
    return (
      <Card sx={{ mt: 3, border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Salary Comparison
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <Typography variant="subtitle2" color="primary">
                Current Calculation
              </Typography>
              <Typography variant="h6">
                {current.jobTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {current.location}
              </Typography>
            </Grid>
            
            <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CompareArrowsIcon />
            </Grid>
            
            <Grid item xs={5}>
              <Typography variant="subtitle2" color="secondary">
                Comparison
              </Typography>
              <Typography variant="h6">
                {comparison.jobTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {comparison.location}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={5}>
              <Typography variant="h5" color="primary">
                ${current.baseSalary.toLocaleString()}
              </Typography>
            </Grid>
            
            <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Chip 
                label={`${salaryDiff > 0 ? '+' : ''}${percentDiff}%`}
                color={salaryDiff > 0 ? 'success' : salaryDiff < 0 ? 'error' : 'default'}
              />
            </Grid>
            
            <Grid item xs={5}>
              <Typography variant="h5" color="secondary">
                ${comparison.baseSalary.toLocaleString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12}>
              <Alert 
                severity={salaryDiff > 0 ? "success" : salaryDiff < 0 ? "warning" : "info"}
                sx={{ mt: 1 }}
              >
                {salaryDiff > 0 
                  ? `The ${current.jobTitle} role offers ${percentDiff}% higher base salary (${Math.abs(salaryDiff).toLocaleString()} more) than ${comparison.jobTitle}.`
                  : salaryDiff < 0
                  ? `The ${current.jobTitle} role offers ${Math.abs(percentDiff)}% lower base salary (${Math.abs(salaryDiff).toLocaleString()} less) than ${comparison.jobTitle}.`
                  : `Both roles offer the same base salary.`
                }
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
        <CardActions>
          <Button 
            onClick={() => setComparisonVisible(false)}
          >
            Hide Comparison
          </Button>
        </CardActions>
      </Card>
    );
  };
  
  // Render saved calculations
  const renderSavedCalculations = () => {
    if (savedCalculations.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 3 }}>
          You haven't saved any salary calculations yet. Calculate and save salaries to compare them.
        </Alert>
      );
    }
    
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Saved Calculations
        </Typography>
        
        <Grid container spacing={2}>
          {savedCalculations.map((calc) => (
            <Grid item xs={12} sm={6} md={4} key={calc.id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1">
                    {calc.jobTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {calc.industry} in {calc.location}
                  </Typography>
                  
                  <Typography variant="h6" color="primary">
                    ${calc.baseSalary.toLocaleString()}
                  </Typography>
                  
                  <Typography variant="caption" display="block" color="text.secondary">
                    Saved on {new Date(calc.date).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small"
                    onClick={() => handleCompareSelect(calc.id)}
                  >
                    Compare
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => {
                      setSavedCalculations(savedCalculations.filter(item => item.id !== calc.id));
                    }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Salary Calculator & Negotiation Guide
        </Typography>
        
        <Chip 
          icon={<BarChartIcon />}
          label="Market Data Powered" 
          color="primary" 
          variant="outlined" 
        />
      </Box>
      
      <Tabs 
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab icon={<CalculateIcon />} label="Calculator" />
        <Tab icon={<TrendingUpIcon />} label="Negotiation Guide" />
        <Tab icon={<TimelineIcon />} label="Saved Calculations" />
      </Tabs>
      
      {activeTab === 0 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              {/* Salary Calculator Form */}
              <form onSubmit={handleCalculateSalary}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Job Details
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={industries}
                      value={industry}
                      onChange={(event, newValue) => {
                        setIndustry(newValue);
                        setJobTitle(''); // Reset job title when industry changes
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Industry" 
                          fullWidth
                          required
                          error={!!errors.industry}
                          helperText={errors.industry}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={industry ? sampleJobTitles[industry] || [] : []}
                      value={jobTitle}
                      onChange={(event, newValue) => setJobTitle(newValue)}
                      freeSolo
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Job Title" 
                          fullWidth
                          required
                          error={!!errors.jobTitle}
                          helperText={errors.jobTitle}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Autocomplete
                      options={['New York, NY', 'San Francisco, CA', 'Chicago, IL', 'Austin, TX', 'Seattle, WA', 'Remote']}
                      value={location}
                      onChange={(event, newValue) => setLocation(newValue)}
                      freeSolo
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Location" 
                          fullWidth
                          required
                          error={!!errors.location}
                          helperText={errors.location}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <InputAdornment position="start">
                                  <LocationOnIcon />
                                </InputAdornment>
                                {params.InputProps.startAdornment}
                              </>
                            )
                          }}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Education Level</InputLabel>
                      <Select
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        label="Education Level"
                      >
                        <MenuItem value="highschool">High School</MenuItem>
                        <MenuItem value="associate">Associate's Degree</MenuItem>
                        <MenuItem value="bachelor">Bachelor's Degree</MenuItem>
                        <MenuItem value="master">Master's Degree</MenuItem>
                        <MenuItem value="phd">PhD or Doctorate</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Company Size</InputLabel>
                      <Select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        label="Company Size"
                      >
                        <MenuItem value="startup">Startup (1-50)</MenuItem>
                        <MenuItem value="small">Small (51-200)</MenuItem>
                        <MenuItem value="medium">Medium (201-1000)</MenuItem>
                        <MenuItem value="large">Large (1001-5000)</MenuItem>
                        <MenuItem value="enterprise">Enterprise (5000+)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography id="experience-slider" gutterBottom>
                      Years of Experience: {experience}
                    </Typography>
                    <Slider
                      value={experience}
                      onChange={(e, newValue) => setExperience(newValue)}
                      aria-labelledby="experience-slider"
                      valueLabelDisplay="auto"
                      step={1}
                      marks
                      min={0}
                      max={20}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={skills}
                      onChange={(event, newValue) => setSkills(newValue)}
                      inputValue={skillInput}
                      onInputChange={(event, newInputValue) => setSkillInput(newInputValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Key Skills (add up to 10)"
                          placeholder="Type and press enter"
                          fullWidth
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option}
                            {...getTagProps({ index })}
                            size="small"
                          />
                        ))
                      }
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="button"
                      color="inherit"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      endIcon={showAdvancedOptions ? <ExpandMoreIcon /> : <ExpandMoreIcon sx={{ transform: 'rotate(-90deg)' }} />}
                    >
                      {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
                    </Button>
                  </Grid>
                  
                  {showAdvancedOptions && (
                    <>
                      <Grid item xs={12}>
                        <Divider />
                        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                          Benefits & Perks
                        </Typography>
                        <FormHelperText>
                          Select the benefits included in the compensation package
                        </FormHelperText>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={benefits.healthInsurance}
                              onChange={(e) => setBenefits({ ...benefits, healthInsurance: e.target.checked })}
                            />
                          }
                          label="Health Insurance"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={benefits.retirement}
                              onChange={(e) => setBenefits({ ...benefits, retirement: e.target.checked })}
                            />
                          }
                          label="Retirement Plan"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={benefits.bonus}
                              onChange={(e) => setBenefits({ ...benefits, bonus: e.target.checked })}
                            />
                          }
                          label="Performance Bonus"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={benefits.stockOptions}
                              onChange={(e) => setBenefits({ ...benefits, stockOptions: e.target.checked })}
                            />
                          }
                          label="Stock Options"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={benefits.flexibleHours}
                              onChange={(e) => setBenefits({ ...benefits, flexibleHours: e.target.checked })}
                            />
                          }
                          label="Flexible Hours"
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={benefits.paidTimeOff}
                              onChange={(e) => setBenefits({ ...benefits, paidTimeOff: e.target.checked })}
                            />
                          }
                          label="Paid Time Off"
                        />
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={<CalculateIcon />}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Calculate Salary Range'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
            
            <Grid item xs={12} md={5}>
              {/* Salary Results */}
              {calculationResults && renderResultCard()}
              
              {/* Comparison if visible */}
              {comparisonVisible && renderComparisonView()}
            </Grid>
          </Grid>
        </Box>
      )}
      
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Salary Negotiation Guide
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Use these expert tips to negotiate the best possible compensation package for your next role.
          </Alert>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Negotiation Tips
              </Typography>
              
              <List>
                {negotiationTips.map((tip) => (
                  <ListItem key={tip.id}>
                    <ListItemIcon>
                      <TipsAndUpdatesIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={tip.title}
                      secondary={
                        <Button 
                          size="small" 
                          onClick={() => {
                            setCurrentTip(tip);
                            setTipDialogOpen(true);
                          }}
                        >
                          Read More
                        </Button>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              
              <Button
                variant="outlined"
                startIcon={<SavingsIcon />}
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => setNegotiationMode(!negotiationMode)}
              >
                {negotiationMode ? 'Exit Negotiation Mode' : 'Start Negotiation Preparation'}
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                Market Insights
              </Typography>
              
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Average Salary Growth
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      4.2% Annual Increase
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    For technology roles in the current market
                  </Typography>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Most Valuable Skills
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                    <Chip label="Data Analysis" color="primary" size="small" />
                    <Chip label="Machine Learning" color="primary" size="small" />
                    <Chip label="Cloud Technologies" color="primary" size="small" />
                    <Chip label="Project Management" color="primary" size="small" />
                    <Chip label="UX/UI Design" color="primary" size="small" />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    These skills can increase your market value by 10-15%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {negotiationMode && (
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  Negotiation Script Builder
                </Typography>
                
                <Typography variant="body2" paragraph>
                  Use this template to prepare for your salary negotiation conversation.
                </Typography>
                
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  label="Your Negotiation Script"
                  defaultValue={`Thank you for the offer. I'm excited about the opportunity to join [Company Name] as a [Position].

Based on my research and the value I can bring to the role with my experience in [key skill/achievement], I was hoping for a base salary in the range of $[your target]. My market research indicates this is in line with industry standards for someone with my background.

I'm also interested in discussing [mention 1-2 benefits that matter to you, like remote work options, professional development budget, etc.].

I'm confident I can make significant contributions to the team and am looking forward to finding a package that works for both of us.`}
                  sx={{ mb: 2 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    startIcon={<ContentCopyIcon />}
                  >
                    Copy to Clipboard
                  </Button>
                  <Button
                    startIcon={<SaveIcon />}
                  >
                    Save Script
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      )}
      
      {activeTab === 2 && (
        <Box>
          {renderSavedCalculations()}
        </Box>
      )}
      
      {/* Tip Dialog */}
      <Dialog
        open={tipDialogOpen}
        onClose={() => setTipDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        {currentTip && (
          <>
            <DialogTitle>
              {currentTip.title}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {currentTip.content}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setTipDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
};

export default SalaryCalculator;