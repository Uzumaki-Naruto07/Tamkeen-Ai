// Constants
export const APP_NAME = 'TamkeenAI';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Emirati Career Intelligence System';

// Date formatting
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// File size formatting
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Experience level calculation
export const calculateExperienceLevel = (experience) => {
  if (experience < 1) return 'Entry Level';
  if (experience < 3) return 'Junior';
  if (experience < 5) return 'Mid Level';
  if (experience < 8) return 'Senior';
  return 'Expert';
};

// Progress calculation
export const calculateProgress = (current, total) => {
  return Math.round((current / total) * 100);
};

// XP calculation
export const calculateXP = (level) => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const calculateLevel = (xp) => {
  return Math.floor(Math.log(xp / 100) / Math.log(1.5)) + 1;
};

// Job match calculation
export const calculateJobMatch = (jobSkills, userSkills) => {
  const matchedSkills = jobSkills.filter(skill => userSkills.includes(skill));
  return Math.round((matchedSkills.length / jobSkills.length) * 100);
};

// Resume ATS score calculation
export const calculateATSScore = (resume, jobDescription) => {
  // Simple keyword matching for demo
  const keywords = jobDescription.toLowerCase().split(' ');
  const resumeText = resume.toLowerCase();
  const matchedKeywords = keywords.filter(keyword => resumeText.includes(keyword));
  return Math.round((matchedKeywords.length / keywords.length) * 100);
};

// Achievement progress calculation
export const calculateAchievementProgress = (current, target) => {
  return Math.min(Math.round((current / target) * 100), 100);
};

// Validation helpers
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(phone);
};

// Local storage helpers
export const getLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

// Error handling
export const handleError = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    // Request made but no response
    return 'No response from server';
  } else {
    // Something else went wrong
    return error.message || 'An error occurred';
  }
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Color helpers
export const getContrastColor = (hexcolor) => {
  const r = parseInt(hexcolor.slice(1, 3), 16);
  const g = parseInt(hexcolor.slice(3, 5), 16);
  const b = parseInt(hexcolor.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
};

export const generateGradient = (color1, color2) => {
  return `linear-gradient(45deg, ${color1} 0%, ${color2} 100%)`;
};

// Animation helpers
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideIn = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
}; 