import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Link, Alert, CircularProgress, IconButton,
  InputAdornment, Checkbox, FormControlLabel
} from '@mui/material';
import {
  Visibility, VisibilityOff, LoginOutlined,
  Google, Facebook, LinkedIn, GitHub
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import logoImage from '../assets/logo.png';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useUser();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  // Check for redirect message
  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message);
    }
  }, [location]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiEndpoints.auth.login(email, password, rememberMe);
      
      setLoginSuccess(true);
      
      // Wait a moment to show success state
      setTimeout(() => {
        login(response.data.token, response.data.user);
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      // Handle different error types
      if (err.response) {
        if (err.response.status === 401) {
          setError('Invalid email or password');
        } else if (err.response.status === 403) {
          setError('Your account has been locked. Please contact support.');
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection.');
      }
      
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setError(null);
    
    try {
      // Redirect to OAuth provider
      window.location.href = apiEndpoints.auth.socialLoginUrl(provider);
    } catch (err) {
      setError(`${provider} login failed. Please try again.`);
      setLoading(false);
    }
  };
  
  return (
    <Box
      sx={{
        height: '100vh',
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
          maxWidth: 450,
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
            Welcome Back
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Sign in to continue to TamkeenAI Career System
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loginSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Login successful! Redirecting...
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            InputProps={{
              autoComplete: 'email'
            }}
          />
          
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            InputProps={{
              autoComplete: 'current-password',
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
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2,
            mt: 1
          }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
              }
              label="Remember me"
            />
            
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              underline="hover"
            >
              Forgot password?
            </Link>
          </Box>
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <LoginOutlined />}
            sx={{ mb: 2 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          <IconButton 
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
            color="error"
            sx={{ border: 1, borderColor: 'divider' }}
          >
            <Google />
          </IconButton>
          
          <IconButton 
            onClick={() => handleSocialLogin('facebook')}
            disabled={loading}
            color="primary"
            sx={{ border: 1, borderColor: 'divider' }}
          >
            <Facebook />
          </IconButton>
          
          <IconButton 
            onClick={() => handleSocialLogin('linkedin')}
            disabled={loading}
            color="primary"
            sx={{ border: 1, borderColor: 'divider', bgcolor: 'action.hover' }}
          >
            <LinkedIn />
          </IconButton>
          
          <IconButton 
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
            color="inherit"
            sx={{ border: 1, borderColor: 'divider' }}
          >
            <GitHub />
          </IconButton>
        </Box>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/register"
              variant="body2"
              underline="hover"
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;