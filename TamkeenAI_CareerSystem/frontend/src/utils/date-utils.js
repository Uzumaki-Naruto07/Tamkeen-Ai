/**
 * Date utility functions for TamkeenAI Career System
 */

import { format, formatDistance, formatRelative, differenceInDays, 
         addDays, isBefore, isAfter, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * Format a date in a localized way
 * @param {Date|string} date Date to format
 * @param {string} formatStr Format string
 * @param {string} locale Locale ('en' or 'ar')
 * @returns {string} Formatted date
 */
const formatDate = (date, formatStr = 'MMM dd, yyyy', locale = 'en') => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatStr, {
      locale: locale === 'ar' ? ar : undefined,
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * Get relative time (e.g., "2 days ago", "in 3 hours")
 * @param {Date|string} date Date to compare
 * @param {Date} baseDate Base date to compare against (defaults to now)
 * @param {string} locale Locale ('en' or 'ar')
 * @returns {string} Relative time string
 */
const getRelativeTime = (date, baseDate = new Date(), locale = 'en') => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(parsedDate, baseDate, {
      addSuffix: true,
      locale: locale === 'ar' ? ar : undefined,
    });
  } catch (error) {
    console.error('Relative time calculation error:', error);
    return '';
  }
};

/**
 * Format a date for displaying deadlines
 * @param {Date|string} date Date to format
 * @param {string} locale Locale ('en' or 'ar')
 * @returns {string} Formatted deadline with urgency context
 */
const formatDeadline = (date, locale = 'en') => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const daysLeft = differenceInDays(parsedDate, now);
    
    if (daysLeft < 0) {
      return locale === 'ar' ? 'انتهى الموعد' : 'Expired';
    } else if (daysLeft === 0) {
      return locale === 'ar' ? 'اليوم' : 'Today';
    } else if (daysLeft === 1) {
      return locale === 'ar' ? 'غدًا' : 'Tomorrow';
    } else if (daysLeft <= 7) {
      return locale === 'ar' 
        ? `${daysLeft} أيام متبقية` 
        : `${daysLeft} days left`;
    } else {
      return formatDate(parsedDate, 'MMM dd, yyyy', locale);
    }
  } catch (error) {
    console.error('Deadline formatting error:', error);
    return '';
  }
};

/**
 * Check if a date is in the past
 * @param {Date|string} date Date to check
 * @returns {boolean} Is in the past
 */
const isPast = (date) => {
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isBefore(parsedDate, new Date());
  } catch (error) {
    console.error('Date check error:', error);
    return false;
  }
};

/**
 * Format a date range
 * @param {Date|string} startDate Start date
 * @param {Date|string} endDate End date
 * @param {string} locale Locale ('en' or 'ar')
 * @returns {string} Formatted date range
 */
const formatDateRange = (startDate, endDate, locale = 'en') => {
  try {
    const parsedStartDate = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const parsedEndDate = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    // Same day
    if (format(parsedStartDate, 'yyyy-MM-dd') === format(parsedEndDate, 'yyyy-MM-dd')) {
      return `${formatDate(parsedStartDate, 'MMM dd, yyyy', locale)} ${formatDate(parsedStartDate, 'hh:mm a', locale)} - ${formatDate(parsedEndDate, 'hh:mm a', locale)}`;
    }
    
    // Same month
    if (format(parsedStartDate, 'yyyy-MM') === format(parsedEndDate, 'yyyy-MM')) {
      return `${formatDate(parsedStartDate, 'MMM dd', locale)} - ${formatDate(parsedEndDate, 'dd, yyyy', locale)}`;
    }
    
    // Same year
    if (format(parsedStartDate, 'yyyy') === format(parsedEndDate, 'yyyy')) {
      return `${formatDate(parsedStartDate, 'MMM dd', locale)} - ${formatDate(parsedEndDate, 'MMM dd, yyyy', locale)}`;
    }
    
    // Different years
    return `${formatDate(parsedStartDate, 'MMM dd, yyyy', locale)} - ${formatDate(parsedEndDate, 'MMM dd, yyyy', locale)}`;
  } catch (error) {
    console.error('Date range formatting error:', error);
    return '';
  }
};

/**
 * Calculate duration in a human-readable format
 * @param {Date|string} startDate Start date
 * @param {Date|string} endDate End date
 * @param {string} locale Locale ('en' or 'ar')
 * @returns {string} Duration string
 */
const getDuration = (startDate, endDate, locale = 'en') => {
  try {
    const parsedStartDate = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const parsedEndDate = endDate ? (typeof endDate === 'string' ? parseISO(endDate) : endDate) : new Date();
    
    const years = parsedEndDate.getFullYear() - parsedStartDate.getFullYear();
    const months = parsedEndDate.getMonth() - parsedStartDate.getMonth();
    
    if (years > 0) {
      // If more than a year
      if (months > 0) {
        return locale === 'ar'
          ? `${years} سنة و ${months} شهر`
          : `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
      } else {
        return locale === 'ar'
          ? `${years} سنة`
          : `${years} year${years > 1 ? 's' : ''}`;
      }
    } else {
      // Less than a year
      if (months > 0) {
        return locale === 'ar'
          ? `${months} شهر`
          : `${months} month${months > 1 ? 's' : ''}`;
      } else {
        const days = differenceInDays(parsedEndDate, parsedStartDate);
        return locale === 'ar'
          ? `${days} يوم`
          : `${days} day${days > 1 ? 's' : ''}`;
      }
    }
  } catch (error) {
    console.error('Duration calculation error:', error);
    return '';
  }
};

/**
 * Get dates for a typical week (Sunday to Saturday)
 * @returns {Array} Array of Date objects
 */
const getWeekDates = () => {
  const now = new Date();
  const startOfWeekDate = startOfWeek(now, { weekStartsOn: 0 }); // 0 = Sunday
  
  return Array.from({ length: 7 }, (_, i) => addDays(startOfWeekDate, i));
};

/**
 * Convert 24-hour format to 12-hour format
 * @param {string} time24 Time in 24-hour format (HH:mm)
 * @returns {string} Time in 12-hour format with AM/PM
 */
const convertTo12Hour = (time24) => {
  try {
    if (!time24 || !time24.includes(':')) return '';
    
    const [hour, minute] = time24.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Time conversion error:', error);
    return '';
  }
};

export default {
  formatDate,
  getRelativeTime,
  formatDeadline,
  isPast,
  formatDateRange,
  getDuration,
  getWeekDates,
  convertTo12Hour,
}; 