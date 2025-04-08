import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import '../styles/uaepass.css';
import { useAppContext } from '../context/AppContext';

const UaePassLogin = () => {
  // Get available context functions - note that setProfile might not be available
  const context = useAppContext();
  const { setUser, setToken } = context;
  
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountIdentifier, setNewAccountIdentifier] = useState('');
  const [accountCreated, setAccountCreated] = useState(false);
  
  const navigate = useNavigate();
  
  // Clean local storage of any previous user data
  const cleanPreviousUserData = () => {
    // Clear any saved user data from localStorage to ensure a fresh start
    const keysToKeep = ['language', 'theme', 'darkMode', 'rtl', 'highContrast'];
    
    // Get all keys from localStorage
    const keys = Object.keys(localStorage);
    
    // Filter out the keys we want to keep
    const keysToRemove = keys.filter(key => !keysToKeep.includes(key));
    
    // Remove all other keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('Cleared previous user data from localStorage');
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Clean previous user data
      cleanPreviousUserData();
      
      // In a real implementation, we would send the data to UAE PASS
      // For mock purposes, we'll simulate a login with our mock server
      const response = await axios.post(`http://localhost:5005/api/auth/register/uaepass/validate`, {
        identifier,
        name,
        // In a real implementation, we might send a code received from UAE PASS
        code: "mock_auth_code"
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.success) {
        // Generate a unique ID that includes the user's identifier to ensure uniqueness
        // This ensures each user gets their own data space
        const normalizedIdentifier = identifier.toLowerCase().replace(/[^a-z0-9]/g, '');
        const uniqueHash = btoa(normalizedIdentifier).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        const userId = `uaepass-${uniqueHash}-${Date.now()}`;
        
        // Use email or create an email-like identifier
        const userEmail = identifier.includes('@') ? identifier : `${identifier}@uaepass.ae`;
        
        // Save user data in localStorage for persistence and use as login credentials
        const userData = {
          name: name,
          identifier: identifier,
          email: userEmail,
          password: 'uaepass-auth', // This would be replaced with a token in real implementation
          isUaePassUser: true
        };
        
        const userObj = {
          id: userId,
          name: name,
          email: userEmail,
          avatar: null,
          is_verified: true
        };
        
        // Create profile object with empty fields to fill later
        // Parse the name to get first and last name
        const nameParts = name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        const profileObj = {
          id: userId,
          userId: userId,
          fullName: name,
          firstName: firstName,
          lastName: lastName,
          email: userEmail,
          bio: '',
          skills: [],
          experience: '',
          education: [],
          languages: [],
          certifications: [],
          interests: [],
          avatar: null
        };
        
        console.log(`Creating new user profile for: ${name} (${userEmail}) with ID: ${userId}`);
        
        // Store in localStorage
        localStorage.setItem('uaepass_user', JSON.stringify(userData));
        localStorage.setItem('token', 'mock_uae_pass_token'); // Mock token for "logged in" state
        localStorage.setItem('user_data', JSON.stringify(userObj));
        
        // Store empty profile data
        localStorage.setItem(`profile_${userId}`, JSON.stringify(profileObj));
        
        // Also store a mapping from email to userId for future logins
        const userMappings = JSON.parse(localStorage.getItem('uaepass_user_mappings') || '{}');
        userMappings[userEmail] = userId;
        localStorage.setItem('uaepass_user_mappings', JSON.stringify(userMappings));
        
        // Directly set user and token in context to ensure app recognizes the logged-in state
        setUser(userObj);
        setToken('mock_uae_pass_token');
        
        // Try to set profile if the function is available
        try {
          if (context.setProfile && typeof context.setProfile === 'function') {
            context.setProfile(profileObj);
          }
        } catch (profileErr) {
          console.warn('Could not set profile directly:', profileErr);
          // Not critical, will be loaded from localStorage in other parts of the app
        }
        
        // Alert for demonstration purposes only
        alert(`Logged in successfully as ${name}. Redirecting to dashboard...`);
        
        // Navigate directly to dashboard
        navigate('/dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('UAE PASS login error:', err);
      setError('Failed to connect to UAE PASS. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Clean previous user data
      cleanPreviousUserData();
      
      const response = await axios.post(`http://localhost:5005/api/auth/register/uaepass/create`, {
        name: newAccountName,
        identifier: newAccountIdentifier
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.success) {
        setAccountCreated(true);
        
        // Pre-fill the login form with the new account details
        setName(newAccountName);
        setIdentifier(newAccountIdentifier);
        
        // Generate a unique ID using the identifier
        const normalizedIdentifier = newAccountIdentifier.toLowerCase().replace(/[^a-z0-9]/g, '');
        const uniqueHash = btoa(normalizedIdentifier).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
        const userId = `uaepass-${uniqueHash}-${Date.now()}`;
        
        // Use email or create an email-like identifier
        const userEmail = newAccountIdentifier.includes('@') ? 
          newAccountIdentifier : 
          `${newAccountIdentifier}@uaepass.ae`;
        
        // Prepare user data for auto-login
        const userData = {
          name: newAccountName,
          identifier: newAccountIdentifier,
          email: userEmail,
          password: 'uaepass-auth',
          isUaePassUser: true
        };
        
        const userObj = {
          id: userId,
          name: newAccountName,
          email: userEmail,
          avatar: null,
          is_verified: true
        };
        
        // Create profile object with empty fields to fill later
        // Parse the name to get first and last name
        const nameParts = newAccountName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        const profileObj = {
          id: userId,
          userId: userId,
          fullName: newAccountName,
          firstName: firstName,
          lastName: lastName,
          email: userEmail,
          bio: '',
          skills: [],
          experience: '',
          education: [],
          languages: [],
          certifications: [],
          interests: [],
          avatar: null
        };
        
        console.log(`Creating new user account for: ${newAccountName} (${userEmail}) with ID: ${userId}`);
        
        // Save to localStorage
        localStorage.setItem('uaepass_user', JSON.stringify(userData));
        localStorage.setItem('token', 'mock_uae_pass_token'); // Mock token for "logged in" state
        localStorage.setItem('user_data', JSON.stringify(userObj));
        
        // Store empty profile data
        localStorage.setItem(`profile_${userId}`, JSON.stringify(profileObj));
        
        // Also store a mapping from email to userId for future logins
        const userMappings = JSON.parse(localStorage.getItem('uaepass_user_mappings') || '{}');
        userMappings[userEmail] = userId;
        localStorage.setItem('uaepass_user_mappings', JSON.stringify(userMappings));
        
        // Directly set user and profile in context
        setUser(userObj);
        setToken('mock_uae_pass_token');
        
        // Try to set profile if the function is available
        try {
          if (context.setProfile && typeof context.setProfile === 'function') {
            context.setProfile(profileObj);
          }
        } catch (profileErr) {
          console.warn('Could not set profile directly:', profileErr);
          // Not critical, will be loaded from localStorage
        }
        
        // Close the modal after a short delay and redirect to dashboard
        setTimeout(() => {
          setIsCreatingAccount(false);
          setAccountCreated(false);
          navigate('/dashboard');
        }, 2000);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (err) {
      console.error('UAE PASS account creation error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="uaepass-container">
      <div className="uaepass-logo-container">
        <FingerprintIcon className="uaepass-logo" />
      </div>
      
      <h1 className="uaepass-title">Login to UAE PASS</h1>
      
      <form onSubmit={handleLogin} className="uaepass-form">
        {error && <div className="uaepass-error">{error}</div>}
        
        <input
          type="text"
          className="uaepass-input"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        
        <input
          type="text"
          className="uaepass-input"
          placeholder="Emirates ID, email, or phone eg. 971500000000"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        
        <div className="uaepass-remember-container">
          <input
            type="checkbox"
            id="remember-me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="uaepass-checkbox"
          />
          <label htmlFor="remember-me" className="uaepass-remember-label">
            Remember me
          </label>
        </div>
        
        <button type="submit" className="uaepass-login-button" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div className="uaepass-links">
        <p className="uaepass-account-text">
          Don't have UAEPASS account? <a href="#" onClick={(e) => { e.preventDefault(); setIsCreatingAccount(true); }} className="uaepass-link">Create new account</a>
        </p>
        <a href="#" className="uaepass-link">Recover your account</a>
      </div>
      
      <div className="uaepass-footer">
        <a href="#" className="uaepass-footer-link">Home</a>
        <a href="#" className="uaepass-footer-link">About</a>
        <a href="#" className="uaepass-footer-link">Support</a>
        <a href="#" className="uaepass-footer-link">FAQ</a>
        <a href="#" className="uaepass-footer-link">Kiosk Locations</a>
        <a href="#" className="uaepass-footer-link">Service Provider</a>
      </div>
      
      <div className="uaepass-copyright">
        Copyright © 2025 UAE PASS All rights reserved.
      </div>
      
      {/* Create Account Modal */}
      {isCreatingAccount && (
        <div className="uaepass-modal-overlay">
          <div className="uaepass-modal">
            <h2 className="uaepass-modal-title">
              Create UAE PASS Account
            </h2>
            
            {accountCreated && (
              <div className="uaepass-success">
                Account created successfully!
              </div>
            )}
            
            <form onSubmit={handleCreateAccount}>
              <input
                type="text"
                className="uaepass-input"
                placeholder="Full Name"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                required
              />
              
              <input
                type="text"
                className="uaepass-input"
                placeholder="Emirates ID, email, or phone eg. 971500000000"
                value={newAccountIdentifier}
                onChange={(e) => setNewAccountIdentifier(e.target.value)}
                required
              />
              
              <div className="uaepass-modal-buttons">
                <button 
                  type="button" 
                  className="uaepass-modal-cancel"
                  onClick={() => setIsCreatingAccount(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="uaepass-modal-create"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UaePassLogin; 