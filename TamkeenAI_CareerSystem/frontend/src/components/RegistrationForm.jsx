import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button,
  Alert, CircularProgress, Link, InputAdornment,
  IconButton, Stepper, Step, StepLabel, StepContent,
  Checkbox, FormControlLabel
} from '@mui/material';
import { 
  Visibility, VisibilityOff, PersonAdd,
  ArrowForward, Check, ArrowBack
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import apiEndpoints from '../utils/api';
import { useAuth } from '../context/AppContext';
import LoadingSpinner from './LoadingSpinner';

const RegistrationForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    phone: '',
    agreeToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    const newValue = name === 'agreeToTerms' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear validation error when field is edited
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
      }
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Invalid email format';
      }
    } else if (step === 1) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    } else if (step === 2) {
      if (!formData.agreeToTerms) {
        errors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }
    
    return errors;
  };
  
  const handleNext = () => {
    const errors = validateStep(activeStep);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setActiveStep(prev => prev + 1);
  };
  
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const errors = validateStep(activeStep);
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // This connects to auth.py backend
      const { confirmPassword, agreeToTerms, ...userData } = formData;
      const response = await apiEndpoints.auth.register(userData);
      
      // Store JWT token and user info
      const { token, user } = response.data;
      localStorage.setItem('authToken', token);
      
      // Update auth context
      login(user);
      
      // Redirect to profile completion
      navigate('/user-profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h1" align="center" gutterBottom>
        Create an Account
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {/* Step 1: Basic Info */}
          <Step key="basic">
            <StepLabel>Basic Information</StepLabel>
            <StepContent>
              <TextField
                required
                fullWidth
                margin="normal"
                id="firstName"
                label="First Name"
                name="firstName"
                autoFocus
                value={formData.firstName}
                onChange={handleInputChange}
                error={Boolean(validationErrors.firstName)}
                helperText={validationErrors.firstName}
              />
              
              <TextField
                required
                fullWidth
                margin="normal"
                id="lastName"
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                error={Boolean(validationErrors.lastName)}
                helperText={validationErrors.lastName}
              />
              
              <TextField
                required
                fullWidth
                margin="normal"
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                error={Boolean(validationErrors.email)}
                helperText={validationErrors.email}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          {/* Step 2: Password */}
          <Step key="password">
            <StepLabel>Set Password</StepLabel>
            <StepContent>
              <TextField
                required
                fullWidth
                margin="normal"
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                error={Boolean(validationErrors.password)}
                helperText={validationErrors.password}
                InputProps={{
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
                required
                fullWidth
                margin="normal"
                name="confirmPassword"
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={Boolean(validationErrors.confirmPassword)}
                helperText={validationErrors.confirmPassword}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                >
                  Back
                </Button>
                
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>
          
          {/* Step 3: Additional Info */}
          <Step key="additional">
            <StepLabel>Additional Information</StepLabel>
            <StepContent>
              <TextField
                fullWidth
                margin="normal"
                id="location"
                label="Location (City, Country)"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
              
              <TextField
                fullWidth
                margin="normal"
                id="phone"
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    name="agreeToTerms"
                  />
                }
                label="I agree to the terms and conditions"
              />
              
              {validationErrors.agreeToTerms && (
                <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                  {validationErrors.agreeToTerms}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                >
                  Back
                </Button>
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <PersonAdd />}
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </Box>
            </StepContent>
          </Step>
        </Stepper>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" variant="body2">
              Sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default RegistrationForm; 