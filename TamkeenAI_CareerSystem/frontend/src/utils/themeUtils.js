import { THEME } from './constants';
import { STORAGE_KEYS } from './constants';

// Theme configuration
const THEME_CONFIG = {
  light: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.54)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
  },
  dark: {
    primary: {
      main: '#90caf9',
      light: '#e3f2fd',
      dark: '#42a5f5',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ce93d8',
      light: '#f3e5f5',
      dark: '#ab47bc',
      contrastText: '#000000',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#000000',
    },
    warning: {
      main: '#ffa726',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#000000',
    },
    info: {
      main: '#29b6f6',
      light: '#4fc3f7',
      dark: '#0288d1',
      contrastText: '#000000',
    },
    success: {
      main: '#66bb6a',
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#000000',
    },
    grey: {
      50: '#212121',
      100: '#424242',
      200: '#616161',
      300: '#757575',
      400: '#9e9e9e',
      500: '#bdbdbd',
      600: '#e0e0e0',
      700: '#eeeeee',
      800: '#f5f5f5',
      900: '#fafafa',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
      hint: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
};

// Theme class
class Theme {
  constructor() {
    this.currentTheme = localStorage.getItem(STORAGE_KEYS.THEME) || THEME.SYSTEM;
    this.listeners = new Set();
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQueryListener = this.handleSystemThemeChange.bind(this);
  }

  // Initialize theme
  init() {
    this.mediaQuery.addListener(this.mediaQueryListener);
    this.applyTheme();
  }

  // Cleanup theme
  cleanup() {
    this.mediaQuery.removeListener(this.mediaQueryListener);
  }

  // Get current theme
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Set theme
  setTheme(theme) {
    if (Object.values(THEME).includes(theme)) {
      this.currentTheme = theme;
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      this.applyTheme();
      this.notifyListeners();
    }
  }

  // Apply theme
  applyTheme() {
    const theme = this.getEffectiveTheme();
    const themeConfig = THEME_CONFIG[theme];

    // Apply CSS variables
    Object.entries(themeConfig).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          document.documentElement.style.setProperty(
            `--${key}-${subKey}`,
            subValue
          );
        });
      } else {
        document.documentElement.style.setProperty(`--${key}`, value);
      }
    });

    // Apply background color
    document.body.style.backgroundColor = themeConfig.background.default;
    document.body.style.color = themeConfig.text.primary;
  }

  // Get effective theme
  getEffectiveTheme() {
    if (this.currentTheme === THEME.SYSTEM) {
      return this.mediaQuery.matches ? THEME.DARK : THEME.LIGHT;
    }
    return this.currentTheme;
  }

  // Handle system theme change
  handleSystemThemeChange() {
    if (this.currentTheme === THEME.SYSTEM) {
      this.applyTheme();
      this.notifyListeners();
    }
  }

  // Add theme listener
  addListener(listener) {
    this.listeners.add(listener);
  }

  // Remove theme listener
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  // Notify listeners
  notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.getEffectiveTheme());
    });
  }

  // Subscribe to theme changes
  subscribe(listener) {
    this.addListener(listener);
    return () => this.removeListener(listener);
  }

  // Get theme configuration
  getThemeConfig(theme) {
    return THEME_CONFIG[theme];
  }

  // Get current theme configuration
  getCurrentThemeConfig() {
    return this.getThemeConfig(this.getEffectiveTheme());
  }

  // Get color from theme
  getColor(color, variant = 'main') {
    const themeConfig = this.getCurrentThemeConfig();
    return themeConfig[color]?.[variant] || themeConfig[color];
  }

  // Get text color from theme
  getTextColor(variant = 'primary') {
    const themeConfig = this.getCurrentThemeConfig();
    return themeConfig.text[variant];
  }

  // Get background color from theme
  getBackgroundColor(variant = 'default') {
    const themeConfig = this.getCurrentThemeConfig();
    return themeConfig.background[variant];
  }

  // Get grey color from theme
  getGreyColor(shade = 500) {
    const themeConfig = this.getCurrentThemeConfig();
    return themeConfig.grey[shade];
  }

  // Get contrast text color
  getContrastText(backgroundColor) {
    // Simple luminance calculation
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  // Generate color palette
  generatePalette(color) {
    const themeConfig = this.getCurrentThemeConfig();
    const baseColor = themeConfig[color];
    if (!baseColor) return null;

    return {
      main: baseColor.main,
      light: baseColor.light,
      dark: baseColor.dark,
      contrastText: baseColor.contrastText,
      hover: this.adjustColor(baseColor.main, -0.1),
      active: this.adjustColor(baseColor.main, -0.2),
      selected: this.adjustColor(baseColor.main, -0.3),
      disabled: this.adjustColor(baseColor.main, -0.4),
      focus: this.adjustColor(baseColor.main, -0.5),
    };
  }

  // Adjust color brightness
  adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const newR = Math.max(0, Math.min(255, r + r * amount));
    const newG = Math.max(0, Math.min(255, g + g * amount));
    const newB = Math.max(0, Math.min(255, b + b * amount));

    return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
  }

  // Mix colors
  mixColors(color1, color2, ratio = 0.5) {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);

    const newR = Math.round(r1 + (r2 - r1) * ratio);
    const newG = Math.round(g1 + (g2 - g1) * ratio);
    const newB = Math.round(b1 + (b2 - b1) * ratio);

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  // Get CSS variables
  getCSSVariables() {
    const themeConfig = this.getCurrentThemeConfig();
    const variables = {};

    Object.entries(themeConfig).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          variables[`--${key}-${subKey}`] = subValue;
        });
      } else {
        variables[`--${key}`] = value;
      }
    });

    return variables;
  }

  // Export theme configuration
  export() {
    return JSON.stringify(this.getCurrentThemeConfig(), null, 2);
  }

  // Import theme configuration
  import(data) {
    try {
      const config = JSON.parse(data);
      Object.assign(THEME_CONFIG[this.getEffectiveTheme()], config);
      this.applyTheme();
      return true;
    } catch (error) {
      console.error('Failed to import theme configuration:', error);
      return false;
    }
  }
}

// Create theme instance
const theme = new Theme();

// Export theme utilities
export default {
  theme,
  THEME_CONFIG,
}; 