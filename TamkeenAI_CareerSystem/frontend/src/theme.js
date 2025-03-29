import { createTheme } from '@mui/material/styles';

// Colors for light mode
const lightPalette = {
  primary: {
    main: '#2563eb', // Blue
    light: '#3b82f6',
    dark: '#1d4ed8',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#10b981', // Emerald
    light: '#34d399',
    dark: '#059669',
    contrastText: '#ffffff',
  },
  error: {
    main: '#ef4444',
    light: '#f87171',
    dark: '#b91c1c',
  },
  warning: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  info: {
    main: '#0ea5e9',
    light: '#38bdf8',
    dark: '#0284c7',
  },
  success: {
    main: '#10b981',
    light: '#34d399',
    dark: '#059669',
  },
  background: {
    default: '#f9fafb',
    paper: '#ffffff',
  },
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    disabled: '#9ca3af',
  },
  // Add color definitions for medals/levels
  gold: {
    main: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
  },
  silver: {
    main: '#6b7280',
    light: '#9ca3af',
    dark: '#4b5563',
  },
  bronze: {
    main: '#b45309',
    light: '#d97706',
    dark: '#92400e',
  },
};

// Colors for dark mode
const darkPalette = {
  primary: {
    main: '#3b82f6', // Lighter blue for dark mode
    light: '#60a5fa',
    dark: '#2563eb',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#34d399', // Lighter emerald for dark mode
    light: '#6ee7b7',
    dark: '#10b981',
    contrastText: '#ffffff',
  },
  error: {
    main: '#f87171',
    light: '#fca5a5',
    dark: '#ef4444',
  },
  warning: {
    main: '#fbbf24',
    light: '#fcd34d',
    dark: '#f59e0b',
  },
  info: {
    main: '#38bdf8',
    light: '#7dd3fc',
    dark: '#0ea5e9',
  },
  success: {
    main: '#34d399',
    light: '#6ee7b7',
    dark: '#10b981',
  },
  background: {
    default: '#111827',
    paper: '#1f2937',
  },
  text: {
    primary: '#f9fafb',
    secondary: '#d1d5db',
    disabled: '#6b7280',
  },
  // Add color definitions for medals/levels
  gold: {
    main: '#fbbf24',
    light: '#fcd34d',
    dark: '#f59e0b',
  },
  silver: {
    main: '#9ca3af',
    light: '#d1d5db',
    dark: '#6b7280',
  },
  bronze: {
    main: '#d97706',
    light: '#f59e0b',
    dark: '#b45309',
  },
};

// Shared components styles
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        borderRadius: 8,
        padding: '10px 16px',
        fontWeight: 500,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      rounded: {
        borderRadius: 12,
      },
    },
  },
};

// Create a theme with the specified mode
const getTheme = (mode = 'light') => {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  
  return createTheme({
    palette: {
      mode,
      ...palette,
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
      button: {
        fontWeight: 500,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components,
  });
};

// For backward compatibility, export a default light theme
const theme = getTheme('light');

export { getTheme };
export default theme; 