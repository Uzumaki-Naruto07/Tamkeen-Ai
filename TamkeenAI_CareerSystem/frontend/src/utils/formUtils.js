import { FORM } from './constants';

// Form validation
export const validateForm = (values, validationRules) => {
  const errors = {};
  
  Object.entries(validationRules).forEach(([field, rules]) => {
    const value = values[field];
    
    rules.forEach((rule) => {
      if (rule.required && !value) {
        errors[field] = FORM.ERROR_MESSAGES.REQUIRED;
      } else if (rule.pattern && !rule.pattern.test(value)) {
        errors[field] = rule.message;
      } else if (rule.minLength && value.length < rule.minLength) {
        errors[field] = FORM.ERROR_MESSAGES.MIN_LENGTH(rule.minLength);
      } else if (rule.maxLength && value.length > rule.maxLength) {
        errors[field] = FORM.ERROR_MESSAGES.MAX_LENGTH(rule.maxLength);
      } else if (rule.validate) {
        const error = rule.validate(value);
        if (error) {
          errors[field] = error;
        }
      }
    });
  });
  
  return errors;
};

// Form field validation
export const validateField = (value, rules) => {
  const errors = [];
  
  rules.forEach((rule) => {
    if (rule.required && !value) {
      errors.push(FORM.ERROR_MESSAGES.REQUIRED);
    } else if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.message);
    } else if (rule.minLength && value.length < rule.minLength) {
      errors.push(FORM.ERROR_MESSAGES.MIN_LENGTH(rule.minLength));
    } else if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(FORM.ERROR_MESSAGES.MAX_LENGTH(rule.maxLength));
    } else if (rule.validate) {
      const error = rule.validate(value);
      if (error) {
        errors.push(error);
      }
    }
  });
  
  return errors;
};

// Form field formatting
export const formatField = (value, format) => {
  switch (format) {
    case 'email':
      return value.toLowerCase().trim();
    case 'phone':
      return value.replace(/\D/g, '');
    case 'url':
      return value.trim().toLowerCase();
    case 'name':
      return value.trim().replace(/\s+/g, ' ');
    case 'number':
      return value.replace(/\D/g, '');
    case 'currency':
      return value.replace(/[^0-9.]/g, '');
    case 'date':
      return value.trim();
    case 'time':
      return value.trim();
    case 'datetime':
      return value.trim();
    case 'password':
      return value;
    default:
      return value.trim();
  }
};

// Form field masking
export const maskField = (value, mask) => {
  switch (mask) {
    case 'phone':
      return value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    case 'ssn':
      return value.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
    case 'zip':
      return value.replace(/(\d{5})(\d{4})/, '$1-$2');
    case 'credit':
      return value.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
    case 'date':
      return value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    case 'time':
      return value.replace(/(\d{2})(\d{2})/, '$1:$2');
    default:
      return value;
  }
};

// Form field parsing
export const parseField = (value, type) => {
  switch (type) {
    case 'number':
      return Number(value) || 0;
    case 'boolean':
      return Boolean(value);
    case 'date':
      return new Date(value);
    case 'array':
      return Array.isArray(value) ? value : [];
    case 'object':
      return typeof value === 'object' ? value : {};
    case 'string':
      return String(value);
    default:
      return value;
  }
};

// Form field comparison
export const compareFields = (value1, value2, type = 'exact') => {
  switch (type) {
    case 'exact':
      return value1 === value2;
    case 'case-insensitive':
      return String(value1).toLowerCase() === String(value2).toLowerCase();
    case 'number':
      return Number(value1) === Number(value2);
    case 'date':
      return new Date(value1).getTime() === new Date(value2).getTime();
    case 'array':
      return JSON.stringify(value1) === JSON.stringify(value2);
    case 'object':
      return JSON.stringify(value1) === JSON.stringify(value2);
    default:
      return value1 === value2;
  }
};

// Form field transformation
export const transformField = (value, transform) => {
  switch (transform) {
    case 'uppercase':
      return String(value).toUpperCase();
    case 'lowercase':
      return String(value).toLowerCase();
    case 'capitalize':
      return String(value)
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    case 'trim':
      return String(value).trim();
    case 'reverse':
      return String(value).split('').reverse().join('');
    case 'slugify':
      return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    default:
      return value;
  }
};

// Form field validation rules
export const createValidationRules = (rules) => {
  return Object.entries(rules).reduce((acc, [field, fieldRules]) => {
    acc[field] = fieldRules.map((rule) => {
      if (typeof rule === 'string') {
        return { type: rule };
      }
      return rule;
    });
    return acc;
  }, {});
};

// Form field error messages
export const createErrorMessages = (messages) => {
  return Object.entries(messages).reduce((acc, [field, message]) => {
    acc[field] = typeof message === 'function' ? message : () => message;
    return acc;
  }, {});
};

// Form field success messages
export const createSuccessMessages = (messages) => {
  return Object.entries(messages).reduce((acc, [field, message]) => {
    acc[field] = typeof message === 'function' ? message : () => message;
    return acc;
  }, {});
};

// Form field placeholder messages
export const createPlaceholderMessages = (messages) => {
  return Object.entries(messages).reduce((acc, [field, message]) => {
    acc[field] = typeof message === 'function' ? message : () => message;
    return acc;
  }, {});
};

// Form field help messages
export const createHelpMessages = (messages) => {
  return Object.entries(messages).reduce((acc, [field, message]) => {
    acc[field] = typeof message === 'function' ? message : () => message;
    return acc;
  }, {});
};

// Form field tooltip messages
export const createTooltipMessages = (messages) => {
  return Object.entries(messages).reduce((acc, [field, message]) => {
    acc[field] = typeof message === 'function' ? message : () => message;
    return acc;
  }, {});
};

// Form field label messages
export const createLabelMessages = (messages) => {
  return Object.entries(messages).reduce((acc, [field, message]) => {
    acc[field] = typeof message === 'function' ? message : () => message;
    return acc;
  }, {});
};

// Form field hint messages
export const createHintMessages = (messages) => {
  return Object.entries(messages).reduce((acc, [field, message]) => {
    acc[field] = typeof message === 'function' ? message : () => message;
    return acc;
  }, {});
};

// Form field description messages
export const createDescriptionMessages = (messages) => {
  return Object.entries(messages).reduce((acc, [field, message]) => {
    acc[field] = typeof message === 'function' ? message : () => message;
    return acc;
  }, {});
};

// Export form utilities
export default {
  validateForm,
  validateField,
  formatField,
  maskField,
  parseField,
  compareFields,
  transformField,
  createValidationRules,
  createErrorMessages,
  createSuccessMessages,
  createPlaceholderMessages,
  createHelpMessages,
  createTooltipMessages,
  createLabelMessages,
  createHintMessages,
  createDescriptionMessages,
};