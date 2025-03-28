// Date formatting options
const DATE_FORMATS = {
  short: 'MM/DD/YYYY',
  medium: 'MMM DD, YYYY',
  long: 'MMMM DD, YYYY',
  iso: 'YYYY-MM-DD',
  time: 'HH:mm',
  datetime: 'YYYY-MM-DD HH:mm',
};

// Time zones
const TIME_ZONES = {
  UTC: 'UTC',
  EST: 'America/New_York',
  CST: 'America/Chicago',
  MST: 'America/Denver',
  PST: 'America/Los_Angeles',
};

// Date formatting
export const formatDate = (date, format = DATE_FORMATS.medium) => {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const options = {
    year: 'numeric',
    month: format.includes('MMM') ? 'short' : '2-digit',
    day: '2-digit',
    hour: format.includes('HH') ? '2-digit' : undefined,
    minute: format.includes('mm') ? '2-digit' : undefined,
    hour12: false,
  };

  return d.toLocaleDateString('en-US', options);
};

// Time formatting
export const formatTime = (date, format = DATE_FORMATS.time) => {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };

  return d.toLocaleTimeString('en-US', options);
};

// Date and time formatting
export const formatDateTime = (date, format = DATE_FORMATS.datetime) => {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const dateStr = formatDate(d, DATE_FORMATS.iso);
  const timeStr = formatTime(d, DATE_FORMATS.time);

  return `${dateStr} ${timeStr}`;
};

// Relative time formatting
export const formatRelativeTime = (date) => {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const now = new Date();
  const diff = now - d;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years === 1 ? '' : 's'} ago`;
  if (months > 0) return `${months} month${months === 1 ? '' : 's'} ago`;
  if (weeks > 0) return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  return 'just now';
};

// Date parsing
export const parseDate = (dateString) => {
  if (!dateString) return null;

  const d = new Date(dateString);
  return isNaN(d.getTime()) ? null : d;
};

// Date validation
export const isValidDate = (date) => {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
};

// Date comparison
export const isBefore = (date1, date2) => {
  if (!date1 || !date2) return false;
  return new Date(date1) < new Date(date2);
};

export const isAfter = (date1, date2) => {
  if (!date1 || !date2) return false;
  return new Date(date1) > new Date(date2);
};

export const isSame = (date1, date2) => {
  if (!date1 || !date2) return false;
  return new Date(date1).getTime() === new Date(date2).getTime();
};

// Date manipulation
export const addDays = (date, days) => {
  if (!date) return null;
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const addHours = (date, hours) => {
  if (!date) return null;
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
};

export const addMinutes = (date, minutes) => {
  if (!date) return null;
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
};

export const addSeconds = (date, seconds) => {
  if (!date) return null;
  const d = new Date(date);
  d.setSeconds(d.getSeconds() + seconds);
  return d;
};

// Date range
export const getDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return [];

  const dates = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// Time zone conversion
export const convertTimeZone = (date, fromZone, toZone) => {
  if (!date) return null;

  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const fromDate = new Date(d.toLocaleString('en-US', { timeZone: fromZone }));
  const toDate = new Date(d.toLocaleString('en-US', { timeZone: toZone }));

  return new Date(d.getTime() + (toDate.getTime() - fromDate.getTime()));
};

// Date difference
export const getDateDifference = (date1, date2) => {
  if (!date1 || !date2) return null;

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

  const diff = Math.abs(d2 - d1);
  return {
    milliseconds: diff,
    seconds: Math.floor(diff / 1000),
    minutes: Math.floor(diff / (1000 * 60)),
    hours: Math.floor(diff / (1000 * 60 * 60)),
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    weeks: Math.floor(diff / (1000 * 60 * 60 * 24 * 7)),
    months: Math.floor(diff / (1000 * 60 * 60 * 24 * 30)),
    years: Math.floor(diff / (1000 * 60 * 60 * 24 * 365)),
  };
};

// Export date utilities
export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  parseDate,
  isValidDate,
  isBefore,
  isAfter,
  isSame,
  addDays,
  addHours,
  addMinutes,
  addSeconds,
  getDateRange,
  convertTimeZone,
  getDateDifference,
}; 