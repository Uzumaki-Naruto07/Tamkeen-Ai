/**
 * Theme Toggle Utilities
 * Handles dark mode and light mode toggling
 */

// Check if the system prefers dark mode
const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

// Initialize theme from localStorage or system preference
export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  
  // Use saved preference, fallback to system preference
  const isDark = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
  
  // Set the initial theme
  setTheme(isDark ? 'dark' : 'light');
  
  return isDark ? 'dark' : 'light';
};

// Set theme to either dark or light
export const setTheme = (theme) => {
  // Store in localStorage
  localStorage.setItem('theme', theme);
  
  // Apply theme to document
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Update meta theme-color for mobile devices
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content',
      theme === 'dark' ? '#111827' : '#FFFFFF'
    );
  }
  
  return theme;
};

// Toggle between dark and light mode
export const toggleTheme = () => {
  const currentTheme = localStorage.getItem('theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  return setTheme(newTheme);
};

// Watch for system preference changes
export const setupThemeListener = (callback) => {
  if (!window.matchMedia) return;
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Update theme when system preference changes
  const handleChange = (e) => {
    const newTheme = e.matches ? 'dark' : 'light';
    setTheme(newTheme);
    if (callback) callback(newTheme);
  };
  
  // Add event listener
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
  } else if (mediaQuery.addListener) {
    // Older browsers
    mediaQuery.addListener(handleChange);
  }
  
  // Return cleanup function
  return () => {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.removeListener) {
      mediaQuery.removeListener(handleChange);
    }
  };
};