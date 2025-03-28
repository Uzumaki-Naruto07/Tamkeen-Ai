import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

// Social login icons
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import AppleIcon from '@mui/icons-material/Apple';

const Login = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, toggleTheme, theme, language, toggleLanguage } = useAppContext();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Toggle language between Arabic and English
  const handleLanguageToggle = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    toggleLanguage();
  };

  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setError(result?.error || t('Login failed. Please try again.'));
      }
    } catch (err) {
      setError(err.message || t('An unexpected error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  // UAE flag inspired gradient that changes based on theme
  const getGradientStyle = () => {
    return theme === 'dark' 
      ? 'bg-gradient-to-br from-red-900 via-black to-green-900'
      : 'bg-gradient-to-br from-red-600 via-white to-green-600';
  };

  return (
    <div 
      className={`flex min-h-screen ${getGradientStyle()} relative overflow-hidden`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Animated geometric patterns inspired by mashrabiya */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute w-full h-full bg-[url('/src/assets/mashrabiya-pattern.svg')] bg-repeat transform animate-pulse"></div>
      </div>

      {/* Language toggle button */}
      <button
        onClick={handleLanguageToggle}
        className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none transition-colors duration-200 z-10"
        aria-label="Toggle language"
      >
        {language === 'en' ? 'العربية' : 'English'}
      </button>

      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 left-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none transition-colors duration-200 z-10"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Centered card */}
      <div className="flex items-center justify-center w-full px-4 py-10 sm:px-6 z-10">
        <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all hover:scale-105 duration-500 ease-in-out overflow-hidden">
          <div className="p-8">
            {/* Logo placeholder - Replace with your actual logo */}
            <div className="mx-auto w-40 h-40 relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-green-600 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-green-500">تمكين AI</span>
              </div>
            </div>

            {/* Welcome message in Arabic */}
            <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2" dir="rtl">
              مرحبًا بك في تمكين للذكاء الاصطناعي
            </h1>

            {/* Welcome message in English */}
            <h2 className="text-xl font-medium text-center text-gray-700 dark:text-gray-300 mb-6">
              {t('Welcome to Tamkeen AI Career Intelligence System')}
            </h2>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('Full Name')}
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 dark:text-white transition-colors duration-200"
                  placeholder={t('Enter your full name')}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('Email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 dark:text-white transition-colors duration-200"
                  placeholder={t('Enter your email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password Field with visibility toggle */}
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('Password')}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 dark:text-white transition-colors duration-200"
                    placeholder={t('Enter your password')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleTogglePassword}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded transition-colors duration-200"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {t('Remember Me')}
                  </label>
                </div>

                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200">
                    {t('Forgot Password?')}
                  </Link>
                </div>
              </div>

              {/* Sign in button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200 shadow-lg transform hover:-translate-y-1"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('Signing in...')}
                  </>
                ) : (
                  t('Sign in')
                )}
              </button>

              {/* Social login buttons */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <GoogleIcon className="text-blue-500" />
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <GitHubIcon className="text-black dark:text-white" />
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <AppleIcon className="text-black dark:text-white" />
                </button>
              </div>

              {/* Registration link */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("Don't have an account?")}{' '}
                  <Link to="/register" className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200">
                    {t('Register')}
                  </Link>
                </p>
              </div>
            </form>

            {/* Motivational quote */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400 italic">
                {t('"We, as a people, are not satisfied with anything but first place." 🇦🇪')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;