/**
 * Validation utilities for TamkeenAI Career System
 */
import { VALIDATION_PATTERNS } from './constants';

/**
 * Email validation
 * @param {string} email Email to validate
 * @returns {boolean} Is valid email
 */
const isValidEmail = (email) => {
  if (!email) return false;
  return VALIDATION_PATTERNS.EMAIL.test(String(email).toLowerCase());
};

/**
 * Password validation with customizable strength requirements
 * @param {string} password Password to validate
 * @param {Object} options Validation options
 * @returns {Object} Validation result and feedback
 */
const validatePassword = (password, options = {}) => {
  // Default options
  const settings = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    ...options
  };
  
  if (!password) {
    return {
      valid: false,
      strength: 0,
      feedback: 'Password is required'
    };
  }
  
  const checks = [
    {
      valid: password.length >= settings.minLength,
      message: `Password must be at least ${settings.minLength} characters long`
    },
    {
      valid: !settings.requireUppercase || /[A-Z]/.test(password),
      message: 'Password must contain at least one uppercase letter'
    },
    {
      valid: !settings.requireLowercase || /[a-z]/.test(password),
      message: 'Password must contain at least one lowercase letter'
    },
    {
      valid: !settings.requireNumbers || /\d/.test(password),
      message: 'Password must contain at least one number'
    },
    {
      valid: !settings.requireSpecialChars || /[!@#$%^&*(),.?":{}|<>]/.test(password),
      message: 'Password must contain at least one special character'
    }
  ];
  
  // Filter failed checks
  const failedChecks = checks.filter(check => !check.valid);
  
  // Calculate password strength (0-100)
  const strengthChecks = [
    password.length >= 8,
    password.length >= 12,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password),
    password.length >= 16,
    /[A-Z].*[A-Z]/.test(password), // At least 2 uppercase
    /\d.*\d/.test(password), // At least 2 numbers
    /[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/.test(password) // At least 2 special chars
  ];
  
  const strength = Math.min(100, Math.floor((strengthChecks.filter(Boolean).length / strengthChecks.length) * 100));
  
  let strengthLabel;
  if (strength < 20) strengthLabel = 'Very Weak';
  else if (strength < 40) strengthLabel = 'Weak';
  else if (strength < 60) strengthLabel = 'Moderate';
  else if (strength < 80) strengthLabel = 'Strong';
  else strengthLabel = 'Very Strong';
  
  return {
    valid: failedChecks.length === 0,
    strength,
    strengthLabel,
    failedChecks: failedChecks.map(check => check.message),
    feedback: failedChecks.length > 0 ? failedChecks[0].message : 'Password is valid'
  };
};

/**
 * URL validation
 * @param {string} url URL to validate
 * @returns {boolean} Is valid URL
 */
const isValidUrl = (url) => {
  if (!url) return false;
  
  // Allow URLs without protocol, but add one for validation
  let urlToCheck = url;
  if (!urlToCheck.match(/^[a-zA-Z]+:\/\//)) {
    urlToCheck = 'https://' + urlToCheck;
  }
  
  return VALIDATION_PATTERNS.URL.test(urlToCheck);
};

/**
 * Phone number validation
 * @param {string} phone Phone number to validate
 * @param {string} countryCode Country code (default: international format)
 * @returns {boolean} Is valid phone number
 */
const isValidPhone = (phone, countryCode = 'INTL') => {
  if (!phone) return false;
  
  // Remove all non-digit characters for validation
  const cleaned = phone.replace(/\D/g, '');
  
  switch (countryCode) {
    case 'US':
      // US phone numbers should be 10 digits
      return cleaned.length === 10;
    case 'UK':
      // UK numbers vary, but typically 10-11 digits
      return cleaned.length >= 10 && cleaned.length <= 11;
    case 'INTL':
    default:
      // International numbers should be at least 7 digits
      return cleaned.length >= 7 && cleaned.length <= 15;
  }
};

/**
 * Date validation
 * @param {string|Date} date Date to validate
 * @param {Object} options Validation options
 * @returns {boolean} Is valid date
 */
const isValidDate = (date, options = {}) => {
  // Default options
  const settings = {
    minDate: null,
    maxDate: null,
    format: 'yyyy-mm-dd',
    ...options
  };
  
  if (!date) return false;
  
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else {
    // Parse string date based on format
    if (settings.format === 'yyyy-mm-dd') {
      // ISO format
      dateObj = new Date(date);
    } else if (settings.format === 'mm/dd/yyyy') {
      // US format
      const parts = date.split('/');
      if (parts.length !== 3) return false;
      dateObj = new Date(parts[2], parts[0] - 1, parts[1]);
    } else if (settings.format === 'dd/mm/yyyy') {
      // European format
      const parts = date.split('/');
      if (parts.length !== 3) return false;
      dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
    } else {
      // Try standard parsing
      dateObj = new Date(date);
    }
  }
  
  // Check if valid date
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  
  // Check min date
  if (settings.minDate && dateObj < new Date(settings.minDate)) {
    return false;
  }
  
  // Check max date
  if (settings.maxDate && dateObj > new Date(settings.maxDate)) {
    return false;
  }
  
  return true;
};

/**
 * Validate file size
 * @param {File} file File to validate
 * @param {number} maxSize Maximum size in bytes
 * @returns {boolean} Is valid file size
 */
const isValidFileSize = (file, maxSize) => {
  if (!file || typeof file !== 'object') return false;
  return file.size <= maxSize;
};

/**
 * Validate file type
 * @param {File} file File to validate
 * @param {Array} allowedTypes Array of allowed MIME types or extensions
 * @returns {boolean} Is valid file type
 */
const isValidFileType = (file, allowedTypes) => {
  if (!file || typeof file !== 'object' || !allowedTypes || !Array.isArray(allowedTypes)) {
    return false;
  }
  
  // Check MIME type
  if (allowedTypes.includes(file.type)) {
    return true;
  }
  
  // Check extension from filename
  const extension = file.name.split('.').pop().toLowerCase();
  return allowedTypes.includes(`.${extension}`);
};

/**
 * Validate if value is empty
 * @param {*} value Value to check
 * @returns {boolean} Is empty
 */
const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  
  if (typeof value === 'string') return value.trim() === '';
  
  if (Array.isArray(value)) return value.length === 0;
  
  if (typeof value === 'object') return Object.keys(value).length === 0;
  
  return false;
};

/**
 * Validate if value is a number
 * @param {*} value Value to check
 * @returns {boolean} Is number
 */
const isNumber = (value) => {
  if (value === null || value === undefined || value === '') return false;
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Validate if value is within a range
 * @param {number} value Value to check
 * @param {number} min Minimum value
 * @param {number} max Maximum value
 * @returns {boolean} Is within range
 */
const isInRange = (value, min, max) => {
  if (!isNumber(value)) return false;
  
  const numValue = parseFloat(value);
  
  if (min !== undefined && numValue < min) return false;
  if (max !== undefined && numValue > max) return false;
  
  return true;
};

/**
 * Validate a username
 * @param {string} username Username to validate
 * @returns {Object} Validation result and feedback
 */
const isValidUsername = (username) => {
  if (!username) {
    return {
      valid: false,
      feedback: 'Username is required'
    };
  }
  
  if (username.length < 3) {
    return {
      valid: false,
      feedback: 'Username must be at least 3 characters long'
    };
  }
  
  if (username.length > 30) {
    return {
      valid: false,
      feedback: 'Username must be less than 30 characters long'
    };
  }
  
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    return {
      valid: false,
      feedback: 'Username can only contain letters, numbers, dots, underscores, and hyphens'
    };
  }
  
  return {
    valid: true,
    feedback: 'Username is valid'
  };
};

export default {
  isValidEmail,
  validatePassword,
  isValidUrl,
  isValidPhone,
  isValidDate,
  isValidFileSize,
  isValidFileType,
  isEmpty,
  isNumber,
  isInRange,
  isValidUsername,
}; 