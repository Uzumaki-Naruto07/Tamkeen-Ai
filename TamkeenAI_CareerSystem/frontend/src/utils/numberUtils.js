// Number formatting
export const formatNumber = (number, options = {}) => {
  const {
    locale = 'en-US',
    style = 'decimal',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    currency = 'USD',
    notation = 'standard',
    compactDisplay = 'short',
  } = options;
  
  return new Intl.NumberFormat(locale, {
    style,
    minimumFractionDigits,
    maximumFractionDigits,
    currency,
    notation,
    compactDisplay,
  }).format(number);
};

// Number parsing
export const parseNumber = (value, options = {}) => {
  const {
    locale = 'en-US',
    style = 'decimal',
    currency = 'USD',
  } = options;
  
  const numberFormat = new Intl.NumberFormat(locale, {
    style,
    currency,
  });
  
  const parts = numberFormat.formatToParts(0);
  const decimal = parts.find((part) => part.type === 'decimal')?.value || '.';
  const group = parts.find((part) => part.type === 'group')?.value || ',';
  
  const cleanValue = value
    .replace(new RegExp(`[${group}]`, 'g'), '')
    .replace(decimal, '.');
  
  return Number(cleanValue);
};

// Number validation
export const validateNumber = (number, rules) => {
  const errors = [];
  
  rules.forEach((rule) => {
    if (rule.required && number === undefined) {
      errors.push('Number is required');
    } else if (rule.min !== undefined && number < rule.min) {
      errors.push(`Number must be at least ${rule.min}`);
    } else if (rule.max !== undefined && number > rule.max) {
      errors.push(`Number must be at most ${rule.max}`);
    } else if (rule.integer && !Number.isInteger(number)) {
      errors.push('Number must be an integer');
    } else if (rule.positive && number <= 0) {
      errors.push('Number must be positive');
    } else if (rule.negative && number >= 0) {
      errors.push('Number must be negative');
    } else if (rule.even && number % 2 !== 0) {
      errors.push('Number must be even');
    } else if (rule.odd && number % 2 === 0) {
      errors.push('Number must be odd');
    } else if (rule.multipleOf && number % rule.multipleOf !== 0) {
      errors.push(`Number must be a multiple of ${rule.multipleOf}`);
    } else if (rule.validate) {
      const error = rule.validate(number);
      if (error) {
        errors.push(error);
      }
    }
  });
  
  return errors;
};

// Number rounding
export const roundNumber = (number, decimals = 0) => {
  const factor = Math.pow(10, decimals);
  return Math.round(number * factor) / factor;
};

// Number ceiling
export const ceilNumber = (number, decimals = 0) => {
  const factor = Math.pow(10, decimals);
  return Math.ceil(number * factor) / factor;
};

// Number floor
export const floorNumber = (number, decimals = 0) => {
  const factor = Math.pow(10, decimals);
  return Math.floor(number * factor) / factor;
};

// Number clamping
export const clampNumber = (number, min, max) => {
  return Math.min(Math.max(number, min), max);
};

// Number scaling
export const scaleNumber = (number, fromMin, fromMax, toMin, toMax) => {
  return ((number - fromMin) * (toMax - toMin)) / (fromMax - fromMin) + toMin;
};

// Number interpolation
export const interpolateNumber = (start, end, t) => {
  return start + (end - start) * t;
};

// Number range
export const getNumberRange = (start, end, step = 1) => {
  const range = [];
  for (let i = start; i <= end; i += step) {
    range.push(i);
  }
  return range;
};

// Number statistics
export const calculateStatistics = (numbers) => {
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const mean = sum / numbers.length;
  const median = sorted[Math.floor(numbers.length / 2)];
  const mode = getMode(numbers);
  const variance = calculateVariance(numbers, mean);
  const standardDeviation = Math.sqrt(variance);
  
  return {
    sum,
    mean,
    median,
    mode,
    variance,
    standardDeviation,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    range: sorted[sorted.length - 1] - sorted[0],
  };
};

// Number mode calculation
const getMode = (numbers) => {
  const frequency = {};
  let maxFreq = 0;
  let mode = numbers[0];
  
  numbers.forEach((num) => {
    frequency[num] = (frequency[num] || 0) + 1;
    if (frequency[num] > maxFreq) {
      maxFreq = frequency[num];
      mode = num;
    }
  });
  
  return mode;
};

// Number variance calculation
const calculateVariance = (numbers, mean) => {
  return numbers.reduce((acc, num) => {
    const diff = num - mean;
    return acc + diff * diff;
  }, 0) / numbers.length;
};

// Number formatting for display
export const formatNumberForDisplay = (number, options = {}) => {
  const {
    locale = 'en-US',
    style = 'decimal',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    currency = 'USD',
    notation = 'standard',
    compactDisplay = 'short',
    unit = '',
    unitDisplay = 'short',
  } = options;
  
  if (unit) {
    return new Intl.NumberFormat(locale, {
      style,
      minimumFractionDigits,
      maximumFractionDigits,
      currency,
      notation,
      compactDisplay,
      unit,
      unitDisplay,
    }).format(number);
  }
  
  return new Intl.NumberFormat(locale, {
    style,
    minimumFractionDigits,
    maximumFractionDigits,
    currency,
    notation,
    compactDisplay,
  }).format(number);
};

// Number formatting for currency
export const formatCurrency = (number, options = {}) => {
  return formatNumberForDisplay(number, {
    ...options,
    style: 'currency',
  });
};

// Number formatting for percentage
export const formatPercentage = (number, options = {}) => {
  return formatNumberForDisplay(number, {
    ...options,
    style: 'percent',
  });
};

// Number formatting for unit
export const formatUnit = (number, unit, options = {}) => {
  return formatNumberForDisplay(number, {
    ...options,
    unit,
  });
};

// Number formatting for compact
export const formatCompact = (number, options = {}) => {
  return formatNumberForDisplay(number, {
    ...options,
    notation: 'compact',
  });
};

// Number formatting for scientific
export const formatScientific = (number, options = {}) => {
  return formatNumberForDisplay(number, {
    ...options,
    notation: 'scientific',
  });
};

// Number formatting for engineering
export const formatEngineering = (number, options = {}) => {
  return formatNumberForDisplay(number, {
    ...options,
    notation: 'engineering',
  });
};

// Number manipulation
export const manipulateNumber = (number, operations) => {
  let result = number;
  
  operations.forEach((operation) => {
    switch (operation.type) {
      case 'round':
        result = roundNumber(result, operation.decimals);
        break;
      case 'ceil':
        result = ceilNumber(result, operation.decimals);
        break;
      case 'floor':
        result = floorNumber(result, operation.decimals);
        break;
      case 'clamp':
        result = clampNumber(result, operation.min, operation.max);
        break;
      case 'scale':
        result = scaleNumber(
          result,
          operation.fromMin,
          operation.fromMax,
          operation.toMin,
          operation.toMax
        );
        break;
      case 'interpolate':
        result = interpolateNumber(
          result,
          operation.end,
          operation.t
        );
        break;
      default:
        break;
    }
  });
  
  return result;
};

// Number manipulation
export const clamp = (number, lower, upper) => {
  if (typeof number !== 'number') return NaN;
  return Math.min(Math.max(number, lower), upper);
};

export const inRange = (number, start, end) => {
  if (typeof number !== 'number') return false;
  const [lower, upper] = start > end ? [end, start] : [start, end];
  return number >= lower && number < upper;
};

export const random = (lower = 0, upper = 1, floating = false) => {
  if (lower > upper) {
    [lower, upper] = [upper, lower];
  }
  const result = lower + Math.random() * (upper - lower);
  return floating ? result : Math.floor(result);
};

export const round = (number, precision = 0) => {
  if (typeof number !== 'number') return NaN;
  const multiplier = Math.pow(10, precision);
  return Math.round(number * multiplier) / multiplier;
};

export const sum = (array) => {
  if (!Array.isArray(array)) return 0;
  return array.reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
};

export const sumBy = (array, iteratee) => {
  if (!Array.isArray(array)) return 0;
  return array.reduce((acc, val) => {
    const value = typeof iteratee === 'function' ? iteratee(val) : val[iteratee];
    return acc + (typeof value === 'number' ? value : 0);
  }, 0);
};

// Number validation
export const isFinite = (value) => {
  return Number.isFinite(value);
};

export const isInteger = (value) => {
  return Number.isInteger(value);
};

export const isNaN = (value) => {
  return Number.isNaN(value);
};

export const isNumber = (value) => {
  return typeof value === 'number';
};

export const isSafeInteger = (value) => {
  return Number.isSafeInteger(value);
};

// Number conversion
export const toInteger = (value) => {
  if (typeof value !== 'number') return 0;
  return Math.floor(value);
};

export const toFinite = (value) => {
  if (typeof value !== 'number') return 0;
  return Number.isFinite(value) ? value : 0;
};

export const toNumber = (value) => {
  if (typeof value === 'number') return value;
  const result = Number(value);
  return Number.isNaN(result) ? 0 : result;
};

export const toSafeInteger = (value) => {
  if (typeof value !== 'number') return 0;
  return Math.min(Math.max(Math.floor(value), Number.MIN_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
};

// Number comparison
export const isEqual = (value, other) => {
  if (typeof value !== 'number' || typeof other !== 'number') return false;
  return value === other;
};

export const isGreaterThan = (value, other) => {
  if (typeof value !== 'number' || typeof other !== 'number') return false;
  return value > other;
};

export const isGreaterThanOrEqual = (value, other) => {
  if (typeof value !== 'number' || typeof other !== 'number') return false;
  return value >= other;
};

export const isLessThan = (value, other) => {
  if (typeof value !== 'number' || typeof other !== 'number') return false;
  return value < other;
};

export const isLessThanOrEqual = (value, other) => {
  if (typeof value !== 'number' || typeof other !== 'number') return false;
  return value <= other;
};

// Number generation
export const generateRandomInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateRandomFloat = (min, max, decimals = 2) => {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
};

// Number statistics
export const mean = (array) => {
  if (!Array.isArray(array)) return 0;
  const numbers = array.filter((val) => typeof val === 'number');
  if (numbers.length === 0) return 0;
  return sum(numbers) / numbers.length;
};

export const median = (array) => {
  if (!Array.isArray(array)) return 0;
  const numbers = array.filter((val) => typeof val === 'number').sort((a, b) => a - b);
  if (numbers.length === 0) return 0;
  const middle = Math.floor(numbers.length / 2);
  if (numbers.length % 2 === 0) {
    return (numbers[middle - 1] + numbers[middle]) / 2;
  }
  return numbers[middle];
};

export const mode = (array) => {
  if (!Array.isArray(array)) return 0;
  const numbers = array.filter((val) => typeof val === 'number');
  if (numbers.length === 0) return 0;
  const counts = {};
  numbers.forEach((num) => {
    counts[num] = (counts[num] || 0) + 1;
  });
  let maxCount = 0;
  let mode = numbers[0];
  Object.entries(counts).forEach(([num, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mode = Number(num);
    }
  });
  return mode;
};

export const range = (start = 0, end, step = 1) => {
  if (typeof start !== 'number') return [];
  if (end === undefined) {
    end = start;
    start = 0;
  }
  if (typeof end !== 'number') return [];
  if (typeof step !== 'number') return [];

  const result = [];
  let current = start;

  while (step > 0 ? current < end : current > end) {
    result.push(current);
    current += step;
  }

  return result;
};

// Export number utilities
export default {
  formatNumber,
  parseNumber,
  validateNumber,
  roundNumber,
  ceilNumber,
  floorNumber,
  clampNumber,
  scaleNumber,
  interpolateNumber,
  getNumberRange,
  calculateStatistics,
  formatNumberForDisplay,
  formatCurrency,
  formatPercentage,
  formatUnit,
  formatCompact,
  formatScientific,
  formatEngineering,
  manipulateNumber,
  clamp,
  inRange,
  random,
  round,
  sum,
  sumBy,
  isFinite,
  isInteger,
  isNaN,
  isNumber,
  isSafeInteger,
  toInteger,
  toFinite,
  toNumber,
  toSafeInteger,
  isEqual,
  isGreaterThan,
  isGreaterThanOrEqual,
  isLessThan,
  isLessThanOrEqual,
  generateRandomInteger,
  generateRandomFloat,
  mean,
  median,
  mode,
  range,
};