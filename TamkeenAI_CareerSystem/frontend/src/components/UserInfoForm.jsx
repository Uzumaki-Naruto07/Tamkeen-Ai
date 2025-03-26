import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Chip,
  Stack,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  Checkbox,
  Autocomplete,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Avatar,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Switch
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Sample data - in a real app this would come from an API
const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Media', 'Government', 'Non-profit', 'Consulting',
  'Energy', 'Transportation', 'Construction', 'Real Estate', 'Telecommunications'
];

const SKILLS = [
  // Technical skills
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Angular', 'Vue.js', 'Node.js',
  'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Azure', 'Machine Learning',
  'Data Analysis', 'Artificial Intelligence', 'DevOps', 'Cloud Computing',
  
  // Soft skills
  'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
  'Time Management', 'Project Management', 'Creativity', 'Adaptability', 'Negotiation',
  
  // Domain knowledge
  'Digital Marketing', 'Financial Analysis', 'Healthcare Informatics', 'UX/UI Design',
  'Cybersecurity', 'Blockchain', 'IoT', 'Agile Methodologies', 'SCRUM', 'Content Strategy'
];

const LANGUAGES = [
  'English', 'Arabic', 'Spanish', 'French', 'Chinese', 'Japanese', 'German',
  'Russian', 'Portuguese', 'Italian', 'Hindi', 'Urdu', 'Bengali', 'Korean'
];

const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Native'];

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Remote'];

const UserInfoForm = ({ initialData = {}, onSave, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profileComplete, setProfileComplete] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    // Personal info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    
    // Professional info
    currentTitle: '',
    company: '',
    industry: '',
    yearsOfExperience: '',
    skills: [],
    
    // Education
    education: [{
      degree: '',
      institution: '',
      field: '',
      startYear: '',
      endYear: '',
      current: false
    }],
    
    // Language proficiency
    languages: [{
      language: 'English',
      proficiency: 'Intermediate'
    }],
    
    // Career preferences
    jobTypes: [],
    salaryExpectation: '',
    willingToRelocate: false,
    remotePreference: 'Hybrid',
    
    // Career goals
    shortTermGoals: '',
    longTermGoals: '',
    interestedRoles: [],
    interestedIndustries: []
  });

  // Validation state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load initial data if provided
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({ ...prev, ...initialData }));
      
      if (initialData.profilePicture) {
        setProfilePicture(initialData.profilePicture);
      }
    }
    
    // Calculate profile completeness
    calculateProfileComplete();
  }, [initialData]);

  const calculateProfileComplete = () => {
    const totalFields = Object.keys(formData).length;
    let filledFields = 0;
    
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) filledFields++;
      } else if (value !== '' && value !== null && value !== undefined) {
        filledFields++;
      }
    });
    
    setProfileComplete(Math.round((filledFields / totalFields) * 100));
  };

  useEffect(() => {
    calculateProfileComplete();
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSkillChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      skills: newValue
    }));
  };

  const handleJobTypesChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData(prev => ({
      ...prev,
      jobTypes: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleLanguageChange = (index, field, value) => {
    const updatedLanguages = [...formData.languages];
    updatedLanguages[index] = { ...updatedLanguages[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      languages: updatedLanguages
    }));
  };

  const addLanguage = () => {
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, { language: '', proficiency: 'Beginner' }]
    }));
  };

  const removeLanguage = (index) => {
    const updatedLanguages = [...formData.languages];
    updatedLanguages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      languages: updatedLanguages
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...formData.education];
    
    if (field === 'current') {
      // Handle checkbox
      updatedEducation[index] = { 
        ...updatedEducation[index], 
        [field]: value,
        endYear: value ? 'Present' : '' // Set endYear to 'Present' if current is checked
      };
    } else {
      updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    }
    
    setFormData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { 
        degree: '', 
        institution: '', 
        field: '', 
        startYear: '', 
        endYear: '',
        current: false
      }]
    }));
  };

  const removeEducation = (index) => {
    const updatedEducation = [...formData.education];
    updatedEducation.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInterstedRolesChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      interestedRoles: newValue
    }));
  };

  const handleInterestedIndustriesChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      interestedIndustries: newValue
    }));
  };

  const validateStep = () => {
    let stepValid = true;
    const newErrors = {};

    // Validation for each step
    if (activeStep === 0) {
      // Personal info validation
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
        stepValid = false;
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
        stepValid = false;
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
        stepValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
        stepValid = false;
      }
    } else if (activeStep === 1) {
      // Professional info validation
      if (!formData.currentTitle.trim()) {
        newErrors.currentTitle = 'Current title is required';
        stepValid = false;
      }
      
      if (formData.skills.length === 0) {
        newErrors.skills = 'Please add at least one skill';
        stepValid = false;
      }
    }
    
    setErrors(newErrors);
    return stepValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }
    
    try {
      setSaving(true);
      
      const dataToSave = {
        ...formData,
        profilePicture,
        updatedAt: new Date().toISOString()
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (onSave) {
        onSave(dataToSave);
      }
      
      setNotification({
        open: true,
        message: 'Profile information saved successfully!',
        severity: 'success'
      });
      
      setSaving(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      
      setNotification({
        open: true,
        message: 'Failed to save profile information. Please try again.',
        severity: 'error'
      });
      
      setSaving(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const steps = [
    'Personal Information',
    'Professional Details',
    'Education',
    'Languages',
    'Career Preferences'
  ];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} display="flex" justifyContent="center" mb={2}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={profilePicture}
                    alt="Profile"
                    sx={{ width: 120, height: 120 }}
                  />
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-picture-input"
                    type="file"
                    onChange={handleProfilePictureChange}
                  />
                  <label htmlFor="profile-picture-input">
                    <IconButton
                      component="span"
                      sx={{
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      }}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </label>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  multiline
                  rows={4}
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 1:
        return (
          <Box mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Current Title"
                  name="currentTitle"
                  value={formData.currentTitle}
                  onChange={handleChange}
                  error={Boolean(errors.currentTitle)}
                  helperText={errors.currentTitle}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="industry-label">Industry</InputLabel>
                  <Select
                    labelId="industry-label"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    label="Industry"
                  >
                    {INDUSTRIES.map((industry) => (
                      <MenuItem key={industry} value={industry}>
                        {industry}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  name="yearsOfExperience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 0, step: 1 } }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={SKILLS}
                  value={formData.skills}
                  onChange={handleSkillChange}
                  freeSolo
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip 
                        variant="outlined" 
                        label={option} 
                        {...getTagProps({ index })} 
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Skills"
                      placeholder="Add skills"
                      error={Boolean(errors.skills)}
                      helperText={errors.skills}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      case 2:
        return (
          <Box mt={3}>
            {formData.education.map((edu, index) => (
              <Card key={index} sx={{ mb: 3, position: 'relative' }}>
                <CardContent>
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() => removeEducation(index)}
                    disabled={formData.education.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Degree"
                        placeholder="e.g., Bachelor's, Master's"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Field of Study"
                        placeholder="e.g., Computer Science"
                        value={edu.field}
                        onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Institution"
                        placeholder="University or School Name"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="Start Year"
                        type="number"
                        value={edu.startYear}
                        onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
                        InputProps={{ inputProps: { min: 1950, max: new Date().getFullYear() } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        label="End Year"
                        type="number"
                        value={edu.endYear}
                        onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
                        InputProps={{ 
                          inputProps: { 
                            min: edu.startYear || 1950, 
                            max: new Date().getFullYear() + 10 
                          } 
                        }}
                        disabled={edu.current}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={2}>
                      <FormControlLabel
                        control={
                          <Checkbox 
                            checked={edu.current} 
                            onChange={(e) => handleEducationChange(index, 'current', e.target.checked)}
                          />
                        }
                        label="Current"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            
            <Button
              startIcon={<AddIcon />}
              onClick={addEducation}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Add Education
            </Button>
          </Box>
        );
        
      case 3:
        return (
          <Box mt={3}>
            {formData.languages.map((lang, index) => (
              <Card key={index} sx={{ mb: 3, position: 'relative' }}>
                <CardContent>
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() => removeLanguage(index)}
                    disabled={formData.languages.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        options={LANGUAGES}
                        value={lang.language}
                        onChange={(event, newValue) => {
                          handleLanguageChange(index, 'language', newValue);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Language" />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Proficiency</InputLabel>
                        <Select
                          value={lang.proficiency}
                          onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value)}
                          label="Proficiency"
                        >
                          {PROFICIENCY_LEVELS.map((level) => (
                            <MenuItem key={level} value={level}>
                              {level}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            
            <Button
              startIcon={<AddIcon />}
              onClick={addLanguage}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Add Language
            </Button>
          </Box>
        );
        
      case 4:
        return (
          <Box mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="job-types-label">Job Types</InputLabel>
                  <Select
                    labelId="job-types-label"
                    multiple
                    value={formData.jobTypes}
                    onChange={handleJobTypesChange}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                    label="Job Types"
                  >
                    {JOB_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        <Checkbox checked={formData.jobTypes.indexOf(type) > -1} />
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary Expectation (Annual)"
                  name="salaryExpectation"
                  value={formData.salaryExpectation}
                  onChange={handleChange}
                  placeholder="e.g., $80,000 - $100,000"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="remote-preference-label">Remote Work Preference</InputLabel>
                  <Select
                    labelId="remote-preference-label"
                    name="remotePreference"
                    value={formData.remotePreference}
                    onChange={handleChange}
                    label="Remote Work Preference"
                  >
                    <MenuItem value="Remote">Fully Remote</MenuItem>
                    <MenuItem value="Hybrid">Hybrid</MenuItem>
                    <MenuItem value="On-site">On-site</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.willingToRelocate}
                      onChange={(e) => setFormData(prev => ({ ...prev, willingToRelocate: e.target.checked }))}
                    />
                  }
                  label="Willing to Relocate"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Career Goals" />
                </Divider>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Short-term Career Goals (1-2 years)"
                  name="shortTermGoals"
                  multiline
                  rows={2}
                  value={formData.shortTermGoals}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Long-term Career Goals (3-5 years)"
                  name="longTermGoals"
                  multiline
                  rows={2}
                  value={formData.longTermGoals}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={["Data Scientist", "Machine Learning Engineer", "Data Engineer", "AI Researcher", 
                            "Software Engineer", "Full Stack Developer", "DevOps Engineer", "Cloud Architect", 
                            "Product Manager", "UX Designer", "Project Manager", "Technical Writer",
                            "Cybersecurity Analyst", "Database Administrator", "Mobile Developer"]}
                  value={formData.interestedRoles}
                  onChange={handleInterstedRolesChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Interested Roles"
                      placeholder="Add roles you're interested in"
                    />
                  )}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={INDUSTRIES}
                  value={formData.interestedIndustries}
                  onChange={handleInterestedIndustriesChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Interested Industries"
                      placeholder="Add industries you're interested in"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );
        
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto' }} elevation={3}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h1" fontWeight="bold">
          Profile Information
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" mr={2}>
            Profile Completion
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={profileComplete}
              size={36}
              thickness={4}
              sx={{
                color: profileComplete < 50 ? 'warning.main' : 'success.main',
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" fontWeight="bold">
                {`${profileComplete}%`}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <form onSubmit={handleSubmit}>
        {renderStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                type="submit"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
              >
                Next
              </Button>
            )}
            
            {onCancel && (
              <Button
                sx={{ ml: 2 }}
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </form>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default UserInfoForm;
