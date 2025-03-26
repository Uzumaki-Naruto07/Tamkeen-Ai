import React, { useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, 
  Link, Alert, CircularProgress, Divider
} from '@mui/material';
import {
  Email, ArrowBack, LockReset, CheckCircle
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import apiEndpoints from '../utils/api';
import logoImage from '../assets/logo.png';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await apiEndpoints.auth.forgotPassword(email);
      setEmailSent(true);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('No account found with this email address');
      } else {
        setError('Failed to process your request. Please try again later.');
      }
      console.error('Forgot password error:', err);
    } finally {
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
            Reset Your Password
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            Enter your email to receive password reset instructions
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {emailSent ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Check Your Email
            </Typography>
            
            <Typography variant="body1" paragraph>
              We've sent password reset instructions to:
            </Typography>
            
            <Typography variant="body1" fontWeight="bold" paragraph>
              {email}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              If you don't see the email, check your spam folder or make sure you entered the correct email address.
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                component={RouterLink}
                to="/login"
                sx={{ mr: 2 }}
              >
                Back to Login
              </Button>
              
              <Button
                variant="text"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
              >
                Try Another Email
              </Button>
            </Box>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <LockReset />}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Button
                variant="text"
                startIcon={<ArrowBack />}
                component={RouterLink}
                to="/login"
              >
                Back to Login
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default ForgotPassword; 