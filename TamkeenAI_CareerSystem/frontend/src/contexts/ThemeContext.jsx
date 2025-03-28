import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import theme from '../theme';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeContextProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load theme preferences from localStorage with error handling
  useEffect(() => {
    try {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      const savedRTL = localStorage.getItem('rtl') === 'true';
      const savedHighContrast = localStorage.getItem('highContrast') === 'true';

      setIsDarkMode(savedDarkMode);
      setIsRTL(savedRTL);
      setIsHighContrast(savedHighContrast);
      setIsInitialized(true);
    } catch (err) {
      console.error('Error loading theme preferences:', err);
      setError('Failed to load theme preferences. Using default settings.');
      setIsInitialized(true);
    }
  }, []);

  // Save theme preferences to localStorage with error handling
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem('darkMode', isDarkMode);
      localStorage.setItem('rtl', isRTL);
      localStorage.setItem('highContrast', isHighContrast);
    } catch (err) {
      console.error('Error saving theme preferences:', err);
      setError('Failed to save theme preferences. Changes may not persist.');
    }
  }, [isDarkMode, isRTL, isHighContrast, isInitialized]);

  const toggleDarkMode = () => {
    try {
      setIsDarkMode(!isDarkMode);
    } catch (err) {
      console.error('Error toggling dark mode:', err);
      setError('Failed to toggle dark mode.');
    }
  };

  const toggleRTL = () => {
    try {
      setIsRTL(!isRTL);
    } catch (err) {
      console.error('Error toggling RTL:', err);
      setError('Failed to toggle RTL mode.');
    }
  };

  const toggleHighContrast = () => {
    try {
      setIsHighContrast(!isHighContrast);
    } catch (err) {
      console.error('Error toggling high contrast:', err);
      setError('Failed to toggle high contrast mode.');
    }
  };

  // Create RTL cache if needed
  const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
  });

  // Create LTR cache
  const cacheLtr = createCache({
    key: 'muiltr',
  });

  const value = {
    isDarkMode,
    isRTL,
    isHighContrast,
    error,
    toggleDarkMode,
    toggleRTL,
    toggleHighContrast,
  };

  if (!isInitialized) {
    return null; // or a loading spinner
  }

  return (
    <ThemeContext.Provider value={value}>
      <CacheProvider value={isRTL ? cacheRtl : cacheLtr}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 