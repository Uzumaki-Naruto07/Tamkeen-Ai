import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Link, Alert, CircularProgress, IconButton, Stepper,
  Step, StepLabel, Grid, InputAdornment, FormControlLabel,
  Checkbox, Select, MenuItem, FormControl, InputLabel,
  FormHelperText, Tooltip
} from '@mui/material';
import {
  Visibility, VisibilityOff, PersonAddAlt,
  Google, Facebook, LinkedIn, GitHub,
  CheckCircle, Info, ArrowBack, ArrowForward,
  AccountCircle, Email, Lock, School, Work
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import logoImage from '../assets/logo.png';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    jobTitle: '',
    company: '',
    education: '',
    experience: '',
    termsAccepted: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useUser();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const steps = [
    'Account Information',
    'Professional Profile',
    'Review & Confirm'
  ];
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    
    // If it's a checkbox, use the checked property
    const fieldValue = name === 'termsAccepted' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: fieldValue
    });
    
    // Clear error for this field when user edits it
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  // Validate the current step
  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 0) {
      // Validate account information
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (activeStep === 1) {
      // Validate professional profile
      if (!formData.jobTitle.trim()) {
        newErrors.jobTitle = 'Job title is required';
      }
      
      if (!formData.experience) {
        newErrors.experience = 'Experience level is required';
      }
    }
    
    if (activeStep === 2) {
      // Validate terms acceptance
      if (!formData.termsAccepted) {
        newErrors.termsAccepted = 'You must accept the terms and conditions';
      }
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiEndpoints.auth.register(formData);
      
      setRegistrationSuccess(true);
      
      // Wait a moment to show success state
      setTimeout(() => {
        if (response.data.autoLogin) {
          // Auto login with the new account
          login(response.data.token, response.data.user);
          navigate('/onboarding');
        } else {
          // Redirect to login page
          navigate('/login', { 
            state: { message: 'Registration successful! Please verify your email before logging in.' } 
          });
        }
      }, 2000);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 409) {
          setError('An account with this email already exists.');
          setFormErrors({
            ...formErrors,
            email: 'Email already in use'
          });
        } else if (err.response.data?.errors) {
          // Set validation errors from the server
          setFormErrors(err.response.data.errors);
          setError('Please correct the errors in the form.');
        } else {
          setError('Registration failed. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
      
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialRegister = async (provider) => {
    setLoading(true);
    setError(null);
    
    try {
      // Redirect to OAuth provider
      window.location.href = apiEndpoints.auth.socialRegisterUrl(provider);
    } catch (err) {
      setError(`${provider} registration failed. Please try again.`);
      setLoading(false);
    }
  };
  
  // Render account information step
  const renderAccountInfo = () => (
    <>
      <TextField
        label="First Name"
        fullWidth
        margin="normal"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        error={!!formErrors.firstName}
        helperText={formErrors.firstName}
        disabled={loading}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AccountCircle />
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        label="Last Name"
        fullWidth
        margin="normal"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        error={!!formErrors.lastName}
        helperText={formErrors.lastName}
        disabled={loading}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AccountCircle />
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        name="email"
        value={formData.email}
        onChange={handleChange}
        error={!!formErrors.email}
        helperText={formErrors.email}
        disabled={loading}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email />
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        label="Password"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        margin="normal"
        name="password"
        value={formData.password}
        onChange={handleChange}
        error={!!formErrors.password}
        helperText={formErrors.password}
        disabled={loading}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      
      <TextField
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        fullWidth
        margin="normal"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={!!formErrors.confirmPassword}
        helperText={formErrors.confirmPassword}
        disabled={loading}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      
      <TextField
        label="Phone Number (Optional)"
        fullWidth
        margin="normal"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={handleChange}
        disabled={loading}
      />
    </>
  );
  
  // Render professional profile step
  const renderProfessionalProfile = () => (
    <>
      <TextField
        label="Current Job Title"
        fullWidth
        margin="normal"
        name="jobTitle"
        value={formData.jobTitle}
        onChange={handleChange}
        error={!!formErrors.jobTitle}
        helperText={formErrors.jobTitle}
        disabled={loading}
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Work />
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        label="Company (Optional)"
        fullWidth
        margin="normal"
        name="company"
        value={formData.company}
        onChange={handleChange}
        disabled={loading}
      />
      
      <TextField
        label="Highest Education (Optional)"
        fullWidth
        margin="normal"
        name="education"
        value={formData.education}
        onChange={handleChange}
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <School />
            </InputAdornment>
          ),
        }}
      />
      
      <FormControl 
        fullWidth 
        margin="normal"
        error={!!formErrors.experience}
        required
      >
        <InputLabel>Experience Level</InputLabel>
        <Select
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          disabled={loading}
          label="Experience Level"
        >
          <MenuItem value="student">Student/Intern</MenuItem>
          <MenuItem value="entry">Entry Level (0-2 years)</MenuItem>
          <MenuItem value="mid">Mid Level (3-5 years)</MenuItem>
          <MenuItem value="senior">Senior Level (6-10 years)</MenuItem>
          <MenuItem value="executive">Executive (10+ years)</MenuItem>
        </Select>
        {formErrors.experience && (
          <FormHelperText>{formErrors.experience}</FormHelperText>
        )}
      </FormControl>
    </>
  );
  
  // Render review step
  const renderReview = () => (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" gutterBottom>
            Personal Information
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2">
              <strong>Name:</strong> {formData.firstName} {formData.lastName}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {formData.email}
            </Typography>
            {formData.phoneNumber && (
              <Typography variant="body2">
                <strong>Phone:</strong> {formData.phoneNumber}
              </Typography>
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="subtitle2" gutterBottom>
            Professional Information
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2">
              <strong>Job Title:</strong> {formData.jobTitle}
            </Typography>
            {formData.company && (
              <Typography variant="body2">
                <strong>Company:</strong> {formData.company}
              </Typography>
            )}
            {formData.education && (
              <Typography variant="body2">
                <strong>Education:</strong> {formData.education}
              </Typography>
            )}
            <Typography variant="body2">
              <strong>Experience:</strong> {
                {
                  'student': 'Student/Intern',
                  'entry': 'Entry Level (0-2 years)',
                  'mid': 'Mid Level (3-5 years)',
                  'senior': 'Senior Level (6-10 years)',
                  'executive': 'Executive (10+ years)'
                }[formData.experience] || formData.experience
              }
            </Typography>
          </Box>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <FormControlLabel
          control={
            <Checkbox 
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
              disabled={loading}
            />
          }
          label={
            <Typography variant="body2">
              I agree to the{' '}
              <Link href="/terms" target="_blank" underline="hover">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" target="_blank" underline="hover">
                Privacy Policy
              </Link>
            </Typography>
          }
        />
        {formErrors.termsAccepted && (
          <FormHelperText error>{formErrors.termsAccepted}</FormHelperText>
        )}
      </Box>
    </>
  );
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 600,
          width: '100%',
          borderRadius: 2
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <img 
            src={logoImage} 
            alt="TamkeenAI Logo" 
            style={{ height: 60, marginBottom: 16 }} 
          />
          
          <Typography variant="h5" component="h1" gutterBottom>
            Create Your Account
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Join TamkeenAI Career System to advance your career
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {registrationSuccess && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            icon={<CheckCircle />}
          >
            Registration successful! Redirecting...
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <form onSubmit={handleSubmit}>
          {activeStep === 0 && renderAccountInfo()}
          {activeStep === 1 && renderProfessionalProfile()}
          {activeStep === 2 && renderReview()}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              startIcon={<ArrowBack />}
            >
              Back
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <PersonAddAlt />}
              >
                {loading ? 'Registering...' : 'Create Account'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
                endIcon={<ArrowForward />}
              >
                Continue
              </Button>
            )}
          </Box>
        </form>
        
        {activeStep === 0 && (
          <>
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              <Tooltip title="Sign up with Google">
                <IconButton 
                  onClick={() => handleSocialRegister('google')}
                  disabled={loading}
                  color="error"
                  sx={{ border: 1, borderColor: 'divider' }}
                >
                  <Google />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Sign up with Facebook">
                <IconButton 
                  onClick={() => handleSocialRegister('facebook')}
                  disabled={loading}
                  color="primary"
                  sx={{ border: 1, borderColor: 'divider' }}
                >
                  <Facebook />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Sign up with LinkedIn">
                <IconButton 
                  onClick={() => handleSocialRegister('linkedin')}
                  disabled={loading}
                  color="primary"
                  sx={{ border: 1, borderColor: 'divider', bgcolor: 'action.hover' }}
                >
                  <LinkedIn />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Sign up with GitHub">
                <IconButton 
                  onClick={() => handleSocialRegister('github')}
                  disabled={loading}
                  color="inherit"
                  sx={{ border: 1, borderColor: 'divider' }}
                >
                  <GitHub />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  underline="hover"
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Register; 