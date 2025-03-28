// String formatting
export const formatString = (str, format) => {
  switch (format) {
    case 'uppercase':
      return str.toUpperCase();
    case 'lowercase':
      return str.toLowerCase();
    case 'capitalize':
      return str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    case 'title':
      return str
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    case 'camelCase':
      return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
    case 'snake_case':
      return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/(^_|_$)/g, '');
    case 'kebab-case':
      return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    case 'pascalCase':
      return str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
        .replace(/^[a-z]/, (chr) => chr.toUpperCase());
    default:
      return str;
  }
};

// String truncation
export const truncateString = (str, length, suffix = '...') => {
  if (str.length <= length) {
    return str;
  }
  return str.substring(0, length) + suffix;
};

// String padding
export const padString = (str, length, char = ' ', position = 'start') => {
  const padding = char.repeat(Math.max(0, length - str.length));
  return position === 'start' ? padding + str : str + padding;
};

// String reversal
export const reverseString = (str) => {
  return str.split('').reverse().join('');
};

// String slugification
export const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// String sanitization
export const sanitizeString = (str) => {
  return str
    .replace(/[<>]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// String validation
export const validateString = (str, rules) => {
  const errors = [];
  
  rules.forEach((rule) => {
    if (rule.required && !str) {
      errors.push('String is required');
    } else if (rule.minLength && str.length < rule.minLength) {
      errors.push(`String must be at least ${rule.minLength} characters`);
    } else if (rule.maxLength && str.length > rule.maxLength) {
      errors.push(`String must be at most ${rule.maxLength} characters`);
    } else if (rule.pattern && !rule.pattern.test(str)) {
      errors.push(rule.message || 'String does not match pattern');
    }
  });
  
  return errors;
};

// String comparison
export const compareStrings = (str1, str2, options = {}) => {
  const {
    caseSensitive = false,
    trim = true,
  } = options;

  if (!str1 || !str2) return 0;

  let s1 = str1;
  let s2 = str2;

  if (!caseSensitive) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
  }

  if (trim) {
    s1 = s1.trim();
    s2 = s2.trim();
  }

  return s1.localeCompare(s2);
};

// String search
export const searchString = (str, query, options = {}) => {
  const {
    caseSensitive = false,
    wholeWord = false,
    regex = false,
  } = options;
  
  let searchStr = str;
  let searchQuery = query;
  
  if (!caseSensitive) {
    searchStr = searchStr.toLowerCase();
    searchQuery = searchQuery.toLowerCase();
  }
  
  if (wholeWord) {
    searchQuery = `\\b${searchQuery}\\b`;
  }
  
  if (regex) {
    try {
      const regex = new RegExp(searchQuery);
      return regex.test(searchStr);
    } catch (error) {
      return false;
    }
  }
  
  return searchStr.includes(searchQuery);
};

// String replacement
export const replaceString = (str, search, replace, options = {}) => {
  const {
    caseSensitive = false,
    wholeWord = false,
    regex = false,
    global = true,
  } = options;
  
  let searchStr = str;
  let searchQuery = search;
  
  if (!caseSensitive) {
    searchStr = searchStr.toLowerCase();
    searchQuery = searchQuery.toLowerCase();
  }
  
  if (wholeWord) {
    searchQuery = `\\b${searchQuery}\\b`;
  }
  
  if (regex) {
    try {
      const regex = new RegExp(searchQuery, global ? 'g' : '');
      return searchStr.replace(regex, replace);
    } catch (error) {
      return str;
    }
  }
  
  return searchStr.replace(new RegExp(searchQuery, global ? 'g' : ''), replace);
};

// String splitting
export const splitString = (str, delimiter, options = {}) => {
  const {
    trim = true,
    filterEmpty = true,
    limit = Infinity,
  } = options;
  
  let parts = str.split(delimiter);
  
  if (trim) {
    parts = parts.map((part) => part.trim());
  }
  
  if (filterEmpty) {
    parts = parts.filter((part) => part.length > 0);
  }
  
  if (limit !== Infinity) {
    parts = parts.slice(0, limit);
  }
  
  return parts;
};

// String joining
export const joinStrings = (strings, delimiter, options = {}) => {
  const {
    trim = true,
    filterEmpty = true,
  } = options;
  
  let parts = [...strings];
  
  if (trim) {
    parts = parts.map((part) => part.trim());
  }
  
  if (filterEmpty) {
    parts = parts.filter((part) => part.length > 0);
  }
  
  return parts.join(delimiter);
};

// String counting
export const countString = (str, query, options = {}) => {
  const {
    caseSensitive = false,
    wholeWord = false,
    regex = false,
  } = options;
  
  let searchStr = str;
  let searchQuery = query;
  
  if (!caseSensitive) {
    searchStr = searchStr.toLowerCase();
    searchQuery = searchQuery.toLowerCase();
  }
  
  if (wholeWord) {
    searchQuery = `\\b${searchQuery}\\b`;
  }
  
  if (regex) {
    try {
      const regex = new RegExp(searchQuery, 'g');
      return (searchStr.match(regex) || []).length;
    } catch (error) {
      return 0;
    }
  }
  
  return (searchStr.match(new RegExp(searchQuery, 'g')) || []).length;
};

// String extraction
export const extractString = (str, pattern, options = {}) => {
  const {
    caseSensitive = false,
    global = false,
  } = options;
  
  let searchStr = str;
  let searchPattern = pattern;
  
  if (!caseSensitive) {
    searchStr = searchStr.toLowerCase();
    searchPattern = searchPattern.toLowerCase();
  }
  
  try {
    const regex = new RegExp(searchPattern, global ? 'g' : '');
    const matches = searchStr.match(regex);
    return global ? matches : matches?.[0];
  } catch (error) {
    return null;
  }
};

// String manipulation
export const manipulateString = (str, operations) => {
  let result = str;
  
  operations.forEach((operation) => {
    switch (operation.type) {
      case 'uppercase':
        result = result.toUpperCase();
        break;
      case 'lowercase':
        result = result.toLowerCase();
        break;
      case 'capitalize':
        result = result
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        break;
      case 'trim':
        result = result.trim();
        break;
      case 'replace':
        result = replaceString(result, operation.search, operation.replace, operation.options);
        break;
      case 'truncate':
        result = truncateString(result, operation.length, operation.suffix);
        break;
      case 'pad':
        result = padString(result, operation.length, operation.char, operation.position);
        break;
      default:
        break;
    }
  });
  
  return result;
};

// String manipulation
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
};

export const truncate = (str, length, suffix = '...') => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + suffix;
};

export const camelCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
};

export const snakeCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');
};

export const kebabCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// String validation
export const isEmpty = (str) => {
  return !str || str.trim().length === 0;
};

export const isEmail = (str) => {
  if (!str) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(str);
};

export const isPhoneNumber = (str) => {
  if (!str) return false;
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(str);
};

export const isURL = (str) => {
  if (!str) return false;
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  return urlRegex.test(str);
};

export const isNumeric = (str) => {
  if (!str) return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
};

export const isInteger = (str) => {
  if (!str) return false;
  return Number.isInteger(Number(str));
};

export const isAlpha = (str) => {
  if (!str) return false;
  return /^[a-zA-Z]+$/.test(str);
};

export const isAlphaNumeric = (str) => {
  if (!str) return false;
  return /^[a-zA-Z0-9]+$/.test(str);
};

// String formatting
export const formatPhoneNumber = (str) => {
  if (!str) return '';
  const cleaned = str.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}`;
  }
  return str;
};

export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (!amount) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (number, locale = 'en-US', options = {}) => {
  if (!number) return '';
  return new Intl.NumberFormat(locale, options).format(number);
};

export const formatPercentage = (number, decimals = 1) => {
  if (!number) return '';
  return `${Number(number).toFixed(decimals)}%`;
};

// String search
export const contains = (str, search) => {
  if (!str || !search) return false;
  return str.toLowerCase().includes(search.toLowerCase());
};

export const startsWith = (str, search) => {
  if (!str || !search) return false;
  return str.toLowerCase().startsWith(search.toLowerCase());
};

export const endsWith = (str, search) => {
  if (!str || !search) return false;
  return str.toLowerCase().endsWith(search.toLowerCase());
};

export const matches = (str, pattern) => {
  if (!str || !pattern) return false;
  return pattern.test(str);
};

// String extraction
export const extractEmail = (str) => {
  if (!str) return null;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = str.match(emailRegex);
  return match ? match[0] : null;
};

export const extractPhoneNumber = (str) => {
  if (!str) return null;
  const phoneRegex = /\+?[1-9]\d{1,14}/;
  const match = str.match(phoneRegex);
  return match ? match[0] : null;
};

export const extractURL = (str) => {
  if (!str) return null;
  const urlRegex = /(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?/;
  const match = str.match(urlRegex);
  return match ? match[0] : null;
};

// String cleaning
export const removeHTML = (str) => {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '');
};

export const removeSpecialCharacters = (str) => {
  if (!str) return '';
  return str.replace(/[^a-zA-Z0-9\s]/g, '');
};

export const removeExtraSpaces = (str) => {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
};

// String generation
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Export string utilities
export default {
  formatString,
  truncateString,
  padString,
  reverseString,
  slugify,
  sanitizeString,
  validateString,
  compareStrings,
  searchString,
  replaceString,
  splitString,
  joinStrings,
  countString,
  extractString,
  manipulateString,
  capitalize,
  capitalizeWords,
  truncate,
  camelCase,
  snakeCase,
  kebabCase,
  isEmpty,
  isEmail,
  isPhoneNumber,
  isURL,
  isNumeric,
  isInteger,
  isAlpha,
  isAlphaNumeric,
  formatPhoneNumber,
  formatCurrency,
  formatNumber,
  formatPercentage,
  contains,
  startsWith,
  endsWith,
  matches,
  extractEmail,
  extractPhoneNumber,
  extractURL,
  removeHTML,
  removeSpecialCharacters,
  removeExtraSpaces,
  generateRandomString,
  generateUUID,
}; 