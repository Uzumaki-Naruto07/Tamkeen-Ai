import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LanguageIcon from '@mui/icons-material/Language';
import TranslateIcon from '@mui/icons-material/Translate';

// Social login icons
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import Google from '@mui/icons-material/Google';
import Twitter from '@mui/icons-material/Twitter';

// Theme toggle utility
import { toggleTheme } from '../utils/themeToggle';

// Import custom CSS
import '../styles/login.css';

// Import assets
import tamkeenVideo from '../assets/TamkeenAi.mp4';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, theme, language, toggleLanguage, isLoggingIn } = useAppContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State for local theme management
  const [currentTheme, setCurrentTheme] = useState(theme || 'light');

  // Use the context's isLoggingIn state to control local loading state
  useEffect(() => {
    setIsLoading(isLoggingIn);
  }, [isLoggingIn]);

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = toggleTheme();
    setCurrentTheme(newTheme);
  };

  // Toggle language between Arabic and English
  const handleLanguageToggle = () => {
    toggleLanguage();
  };

  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submission attempts
    if (isLoading) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      if (!email || !password) {
        throw new Error(t('Email and password are required'));
      }
      
      const result = await login(email, password);
      
      if (result && result.success) {
        navigate('/');
      } else {
        // Handle the case where login returns a result but not success
        const errorMessage = result?.error || t('Login failed. Please try again.');
        setError(typeof errorMessage === 'object' ? t('Login failed. Please check your credentials.') : errorMessage);
      }
    } catch (err) {
      console.error('Login error:', err);
      // Handle different types of errors gracefully
      if (err && typeof err === 'object') {
        if (err.message) {
          setError(err.message);
        } else {
          setError(t('Login failed. Please check your credentials.'));
        }
      } else {
        setError(t('An unexpected error occurred. Please try again.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Login Form */}
        <div className="login-form-section">
          <div className="login-header">
            <div className="text-xl font-bold">Tamkeen AI</div>
            <div className="flex items-center space-x-3">
              {/* Theme toggle button */}
              <button 
                type="button" 
                onClick={handleThemeToggle}
                className="text-gray-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {currentTheme === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </button>
              
              {/* Language toggle button - colorful version */}
              <button
                onClick={handleLanguageToggle}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ${language === 'en' ? 'en-language-button' : 'ar-language-button'}`}
                aria-label={language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
              >
                <TranslateIcon fontSize="small" />
              </button>
            </div>
          </div>

          {/* Welcome text */}
          <div className="login-welcome">
            <h1>
              {t('Welcome to Tamkeen!')} 👋
            </h1>
            <p>
              {t('Please sign-in to your account and start the adventure')}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="login-form-field">
              <label htmlFor="email">
                {t('Email or Username')}
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                className="login-input"
                placeholder={t('Enter your email or username')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="login-form-field">
              <div className="login-password-header">
                <label htmlFor="password">
                  {t('Password')}
                </label>
                <Link to="/forgot-password" className="login-forgot-password">
                  {t('Forgot Password?')}
                </Link>
              </div>
              <div className="login-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
                  className="login-password-toggle"
                >
                  {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="login-remember-me">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me">
                {t('Remember Me')}
              </label>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-submit-button"
            >
              {isLoading ? t('Signing in...') : t('Sign in')}
            </button>

            {/* New user registration */}
            <div className="login-new-user">
              <p>
                {t('New on our platform?')}{' '}
                <Link to="/register">
                  {t('Create an account')}
                </Link>
              </p>
            </div>

            {/* Divider */}
            <div className="login-divider">
              <div className="login-divider-line"></div>
              <span className="login-divider-text">
                {t('or')}
              </span>
              <div className="login-divider-line"></div>
            </div>

            {/* Social login buttons */}
            <div className="login-social-buttons">
              <button
                type="button"
                className="login-social-button"
              >
                <FacebookOutlinedIcon style={{ color: '#4267B2' }} />
              </button>
              <button
                type="button" 
                className="login-social-button"
              >
                <Google style={{ color: '#DB4437' }} />
              </button>
              <button
                type="button"
                className="login-social-button"
              >
                <Twitter style={{ color: '#1DA1F2' }} />
              </button>
            </div>
          </form>
        </div>

        {/* Video section - simplified structure */}
        <div className="login-video-section">
          <video 
            src={tamkeenVideo}
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      </div>
    </div>
  );
};

export default Login;