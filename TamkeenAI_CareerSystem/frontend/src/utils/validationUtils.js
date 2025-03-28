import { ERROR_MESSAGES } from './constants';

// Validation patterns
const PATTERNS = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
  PHONE: /^\+?[\d\s-]{10,}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  NAME: /^[a-zA-Z\s-']{2,50}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  ZIP_CODE: /^\d{5,10}$/,
  CURRENCY: /^\d+(\.\d{1,2})?$/,
  PERCENTAGE: /^(\d{1,2}(\.\d{1,2})?|100)$/,
};

// Validation rules
const RULES = {
  required: (value) => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  },

  email: (value) => {
    return PATTERNS.EMAIL.test(value);
  },

  password: (value) => {
    return PATTERNS.PASSWORD.test(value);
  },

  phone: (value) => {
    return PATTERNS.PHONE.test(value);
  },

  url: (value) => {
    return PATTERNS.URL.test(value);
  },

  name: (value) => {
    return PATTERNS.NAME.test(value);
  },

  username: (value) => {
    return PATTERNS.USERNAME.test(value);
  },

  date: (value) => {
    return PATTERNS.DATE.test(value);
  },

  time: (value) => {
    return PATTERNS.TIME.test(value);
  },

  zipCode: (value) => {
    return PATTERNS.ZIP_CODE.test(value);
  },

  currency: (value) => {
    return PATTERNS.CURRENCY.test(value);
  },

  percentage: (value) => {
    return PATTERNS.PERCENTAGE.test(value);
  },

  minLength: (value, min) => {
    if (typeof value === 'string') return value.length >= min;
    if (Array.isArray(value)) return value.length >= min;
    return false;
  },

  maxLength: (value, max) => {
    if (typeof value === 'string') return value.length <= max;
    if (Array.isArray(value)) return value.length <= max;
    return false;
  },

  min: (value, min) => {
    const num = Number(value);
    return !isNaN(num) && num >= min;
  },

  max: (value, max) => {
    const num = Number(value);
    return !isNaN(num) && num <= max;
  },

  range: (value, min, max) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  match: (value, pattern) => {
    return pattern.test(value);
  },

  in: (value, list) => {
    return list.includes(value);
  },

  notIn: (value, list) => {
    return !list.includes(value);
  },

  unique: (value, list) => {
    return list.filter((item) => item === value).length === 1;
  },

  equal: (value, target) => {
    return value === target;
  },

  notEqual: (value, target) => {
    return value !== target;
  },

  before: (value, date) => {
    return new Date(value) < new Date(date);
  },

  after: (value, date) => {
    return new Date(value) > new Date(date);
  },

  between: (value, start, end) => {
    const date = new Date(value);
    return date >= new Date(start) && date <= new Date(end);
  },

  fileSize: (file, maxSize) => {
    return file.size <= maxSize;
  },

  fileType: (file, types) => {
    return types.includes(file.type);
  },

  imageDimensions: (file, width, height) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img.width === width && img.height === height);
      };
      img.src = URL.createObjectURL(file);
    });
  },
};

// Validation messages
const MESSAGES = {
  required: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD,
  email: ERROR_MESSAGES.VALIDATION.INVALID_EMAIL,
  password: ERROR_MESSAGES.VALIDATION.INVALID_PASSWORD,
  phone: ERROR_MESSAGES.VALIDATION.INVALID_PHONE,
  url: 'Please enter a valid URL',
  name: 'Please enter a valid name',
  username: 'Please enter a valid username',
  date: 'Please enter a valid date',
  time: 'Please enter a valid time',
  zipCode: 'Please enter a valid ZIP code',
  currency: 'Please enter a valid currency amount',
  percentage: 'Please enter a valid percentage',
  minLength: (min) => `Must be at least ${min} characters`,
  maxLength: (max) => `Must be at most ${max} characters`,
  min: (min) => `Must be at least ${min}`,
  max: (max) => `Must be at most ${max}`,
  range: (min, max) => `Must be between ${min} and ${max}`,
  match: 'Does not match the required pattern',
  in: 'Must be one of the allowed values',
  notIn: 'Must not be one of the forbidden values',
  unique: 'Must be unique',
  equal: 'Must be equal to the target value',
  notEqual: 'Must not be equal to the target value',
  before: 'Must be before the specified date',
  after: 'Must be after the specified date',
  between: 'Must be between the specified dates',
  fileSize: (maxSize) => `File size must be at most ${maxSize} bytes`,
  fileType: 'File type is not allowed',
  imageDimensions: (width, height) => `Image must be ${width}x${height} pixels`,
};

// Validation class
class Validation {
  constructor() {
    this.rules = RULES;
    this.messages = MESSAGES;
    this.patterns = PATTERNS;
  }

  // Validate single value against rules
  validate(value, rules) {
    const errors = [];

    for (const [rule, params] of Object.entries(rules)) {
      if (this.rules[rule]) {
        const isValid = this.rules[rule](value, ...(Array.isArray(params) ? params : [params]));
        if (!isValid) {
          const message = typeof this.messages[rule] === 'function'
            ? this.messages[rule](...(Array.isArray(params) ? params : [params]))
            : this.messages[rule];
          errors.push(message);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate form data against schema
  validateForm(data, schema) {
    const errors = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      const result = this.validate(value, rules);
      if (!result.isValid) {
        errors[field] = result.errors;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Validate file
  validateFile(file, rules) {
    const errors = [];

    for (const [rule, params] of Object.entries(rules)) {
      if (this.rules[rule]) {
        const isValid = this.rules[rule](file, ...(Array.isArray(params) ? params : [params]));
        if (!isValid) {
          const message = typeof this.messages[rule] === 'function'
            ? this.messages[rule](...(Array.isArray(params) ? params : [params]))
            : this.messages[rule];
          errors.push(message);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate image
  validateImage(file, rules) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const errors = [];

        for (const [rule, params] of Object.entries(rules)) {
          if (this.rules[rule]) {
            const isValid = this.rules[rule](img, ...(Array.isArray(params) ? params : [params]));
            if (!isValid) {
              const message = typeof this.messages[rule] === 'function'
                ? this.messages[rule](...(Array.isArray(params) ? params : [params]))
                : this.messages[rule];
              errors.push(message);
            }
          }
        }

        resolve({
          isValid: errors.length === 0,
          errors,
        });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  // Add custom rule
  addRule(name, rule, message) {
    this.rules[name] = rule;
    this.messages[name] = message;
  }

  // Add custom pattern
  addPattern(name, pattern) {
    this.patterns[name] = pattern;
  }

  // Remove rule
  removeRule(name) {
    delete this.rules[name];
    delete this.messages[name];
  }

  // Remove pattern
  removePattern(name) {
    delete this.patterns[name];
  }
}

// Create validation instance
const validation = new Validation();

// Export validation utilities
export default {
  validation,
  RULES,
  MESSAGES,
  PATTERNS,
};