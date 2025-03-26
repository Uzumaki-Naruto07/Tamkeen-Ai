/**
 * Formatting utilities for TamkeenAI Career System
 */

/**
 * Format a number with commas and optional decimals
 * @param {number} number Number to format
 * @param {number} decimals Number of decimal places
 * @returns {string} Formatted number
 */
const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }
  
  return number.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a currency value
 * @param {number} amount Amount to format
 * @param {string} currency Currency code (default: USD)
 * @param {string} locale Locale code (default: en-US)
 * @returns {string} Formatted currency
 */
const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '-';
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a percentage value
 * @param {number} value Value to format
 * @param {number} decimals Number of decimal places
 * @returns {string} Formatted percentage
 */
const formatPercent = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
};

/**
 * Format a phone number
 * @param {string} phoneNumber Phone number to format
 * @param {string} format Format pattern (default: US)
 * @returns {string} Formatted phone number
 */
const formatPhoneNumber = (phoneNumber, format = 'US') => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  switch (format) {
    case 'US':
      // Format as (XXX) XXX-XXXX if 10 digits
      if (cleaned.length === 10) {
        return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
      }
      break;
    case 'INTERNATIONAL':
      // Format as +X XXX XXX XXXX
      if (cleaned.length > 6) {
        const countryCode = cleaned.substring(0, cleaned.length - 10);
        const areaCode = cleaned.substring(cleaned.length - 10, cleaned.length - 7);
        const firstPart = cleaned.substring(cleaned.length - 7, cleaned.length - 4);
        const lastPart = cleaned.substring(cleaned.length - 4);
        return `+${countryCode} ${areaCode} ${firstPart} ${lastPart}`;
      }
      break;
    case 'BASIC':
      // Format as XXX-XXX-XXXX if 10 digits
      if (cleaned.length === 10) {
        return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
      }
      break;
    default:
      // Return as is with only digits
      return cleaned;
  }
  
  // If no specific formatting applied, return the cleaned version
  return cleaned;
};

/**
 * Truncate text with ellipsis
 * @param {string} text Text to truncate
 * @param {number} length Maximum length
 * @returns {string} Truncated text
 */
const truncateText = (text, length = 100) => {
  if (!text) return '';
  
  if (text.length <= length) {
    return text;
  }
  
  return `${text.substring(0, length)}...`;
};

/**
 * Format a name (first/last, caps, initials, etc.)
 * @param {string} firstName First name
 * @param {string} lastName Last name
 * @param {string} format Format type
 * @returns {string} Formatted name
 */
const formatName = (firstName, lastName, format = 'full') => {
  if (!firstName && !lastName) return '';
  
  const first = firstName || '';
  const last = lastName || '';
  
  switch (format) {
    case 'full':
      return `${first} ${last}`.trim();
    case 'last_first':
      return `${last}, ${first}`.trim();
    case 'initial_last':
      return `${first.charAt(0)}. ${last}`.trim();
    case 'initials':
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase().trim();
    case 'first_initial':
      return `${first} ${last.charAt(0)}.`.trim();
    default:
      return `${first} ${last}`.trim();
  }
};

/**
 * Format file size in human-readable format
 * @param {number} bytes File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format an address
 * @param {Object} address Address object with components
 * @param {string} format Format type
 * @returns {string} Formatted address
 */
const formatAddress = (address, format = 'inline') => {
  if (!address) return '';
  
  const {
    street,
    street2,
    city,
    state,
    postalCode,
    country
  } = address;
  
  const parts = [
    street,
    street2,
    city,
    state ? (postalCode ? `${state} ${postalCode}` : state) : postalCode,
    country
  ].filter(Boolean);
  
  if (format === 'inline') {
    return parts.join(', ');
  } else if (format === 'multiline') {
    return parts.join('\n');
  } else if (format === 'html') {
    return parts.join('<br>');
  }
  
  return parts.join(', ');
};

/**
 * Format duration (time period) in human-readable format
 * @param {number} milliseconds Duration in milliseconds
 * @param {boolean} compact Use compact format
 * @returns {string} Formatted duration
 */
const formatDuration = (milliseconds, compact = false) => {
  if (!milliseconds || milliseconds < 0) return '0s';
  
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  
  if (compact) {
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  }
  
  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  
  return parts.join(', ');
};

/**
 * Format a list of items
 * @param {Array} items List of items
 * @param {string} separator Separator between items
 * @param {string} lastSeparator Separator before last item
 * @returns {string} Formatted list
 */
const formatList = (items, separator = ', ', lastSeparator = ' and ') => {
  if (!items || !Array.isArray(items)) return '';
  
  const filteredItems = items.filter(Boolean);
  
  if (filteredItems.length === 0) return '';
  if (filteredItems.length === 1) return filteredItems[0];
  
  const lastItem = filteredItems.pop();
  return `${filteredItems.join(separator)}${lastSeparator}${lastItem}`;
};

/**
 * Capitalize first letter of a string
 * @param {string} text Text to capitalize
 * @returns {string} Capitalized text
 */
const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Format a URL (ensure it has a protocol if missing)
 * @param {string} url URL to format
 * @returns {string} Formatted URL
 */
const formatUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
};

export default {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatPhoneNumber,
  truncateText,
  formatName,
  formatFileSize,
  formatAddress,
  formatDuration,
  formatList,
  capitalizeFirst,
  formatUrl,
}; 