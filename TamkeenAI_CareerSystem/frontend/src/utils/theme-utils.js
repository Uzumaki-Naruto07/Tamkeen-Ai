/**
 * Theme utilities for TamkeenAI Career System
 */
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

// Color palettes
const lightPalette = {
  primary: {
    main: '#2563EB', // Primary blue
    light: '#60A5FA',
    dark: '#1E40AF',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#10B981', // Emerald green
    light: '#34D399',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#EF4444', // Red
    light: '#F87171',
    dark: '#B91C1C',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B', // Amber
    light: '#FBBF24',
    dark: '#D97706',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#3B82F6', // Blue
    light: '#60A5FA',
    dark: '#2563EB',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#10B981', // Green
    light: '#34D399',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F9FAFB',
    paper: '#FFFFFF',
    contrast: '#F3F4F6',
  },
  text: {
    primary: '#1F2937',
    secondary: '#4B5563',
    disabled: '#9CA3AF',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
  action: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(0, 0, 0, 0.08)',
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
  },
  // Custom colors for the application
  custom: {
    skillBadge: '#EFF6FF',
    jobMatchHigh: '#ECFDF5',
    jobMatchMedium: '#FFFBEB',
    jobMatchLow: '#FEF2F2',
    cardHover: 'rgba(37, 99, 235, 0.04)',
    headerBackground: '#FFFFFF',
    sidebarBackground: '#F9FAFB',
    chartColors: ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  },
};

const darkPalette = {
  primary: {
    main: '#3B82F6', // Adjusted for dark mode
    light: '#60A5FA',
    dark: '#2563EB',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#F87171',
    light: '#FCA5A5',
    dark: '#EF4444',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#FBBF24',
    light: '#FCD34D',
    dark: '#F59E0B',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#60A5FA',
    light: '#93C5FD',
    dark: '#3B82F6',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#34D399',
    light: '#6EE7B7',
    dark: '#10B981',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#111827',
    paper: '#1F2937',
    contrast: '#374151',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    disabled: '#6B7280',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
  action: {
    active: 'rgba(255, 255, 255, 0.7)',
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(255, 255, 255, 0.16)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
  },
  // Custom colors for dark mode
  custom: {
    skillBadge: '#1E40AF',
    jobMatchHigh: '#064E3B',
    jobMatchMedium: '#78350F',
    jobMatchLow: '#7F1D1D',
    cardHover: 'rgba(59, 130, 246, 0.08)',
    headerBackground: '#1F2937',
    sidebarBackground: '#111827',
    chartColors: ['#3B82F6', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#F472B6'],
  },
};

// Base theme configuration (shared between light and dark)
const baseTheme = {
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.9rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
    },
    overline: {
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      fontWeight: 500,
      letterSpacing: '0.08em',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
          textTransform: 'none',
        },
        sizeLarge: {
          height: 48,
          padding: '12px 24px',
          fontSize: '1rem',
        },
        sizeSmall: {
          height: 32,
          padding: '4px 12px',
          fontSize: '0.8125rem',
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  },
  breakpoints: true,
  parserMode: 'html',
};

/**
 * Get RTL theme with proper direction
 * @param {Object} theme Base theme object
 * @returns {Object} RTL-aware theme object
 */
const getRtlTheme = (theme) => {
  return createTheme({
    ...theme,
    direction: 'rtl',
    typography: {
      ...theme.typography,
      // For Arabic or other RTL languages, adjust font families or sizes if needed
      fontFamily: '"Tajawal", "Noto Sans Arabic", "Roboto", sans-serif',
    },
    components: {
      ...theme.components,
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontFamily: '"Tajawal", "Noto Sans Arabic", "Roboto", sans-serif',
          },
        },
      },
    },
  });
};

/**
 * Create a theme with a custom color palette
 * @param {Object} customPalette Custom color palette
 * @param {('light'|'dark')} mode Theme mode
 * @param {boolean} isRtl Right-to-left direction
 * @returns {Object} Customized theme
 */
const createCustomTheme = (customPalette = {}, mode = 'light', isRtl = false) => {
  // Merge the custom palette with the default palette based on mode
  const basePalette = mode === 'dark' ? darkPalette : lightPalette;
  const mergedPalette = deepmerge(basePalette, customPalette);
  
  // Create the theme with the merged palette
  let theme = createTheme({
    ...baseTheme,
    palette: {
      mode,
      ...mergedPalette,
    },
  });
  
  // Apply responsive font sizes
  theme = responsiveFontSizes(theme);
  
  // Apply RTL if needed
  if (isRtl) {
    theme = getRtlTheme(theme);
  }
  
  return theme;
};

/**
 * Get the default theme
 * @param {('light'|'dark')} mode Theme mode
 * @param {boolean} isRtl Right-to-left direction
 * @returns {Object} Default theme for the specified mode
 */
const getDefaultTheme = (mode = 'light', isRtl = false) => {
  return createCustomTheme({}, mode, isRtl);
};

export default {
  getDefaultTheme,
  createCustomTheme,
  getRtlTheme,
  lightPalette,
  darkPalette,
};