import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import language files
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

// Language configuration
export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
    flag: '🇺🇸',
  },
  ar: {
    code: 'ar',
    name: 'العربية',
    direction: 'rtl',
    flag: '🇦🇪',
  },
};

// Initialize i18n
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      ar: {
        translation: arTranslations,
      },
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Translation helper
export const t = (key, options = {}) => {
  return i18n.t(key, options);
};

// Language change helper
export const changeLanguage = async (language) => {
  try {
    await i18n.changeLanguage(language);
    document.dir = LANGUAGES[language].direction;
    document.lang = language;
    localStorage.setItem('i18nextLng', language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

// Direction helper
export const getDirection = (language) => {
  return LANGUAGES[language]?.direction || 'ltr';
};

// Format number based on locale
export const formatNumber = (number, language) => {
  return new Intl.NumberFormat(language).format(number);
};

// Format currency based on locale
export const formatCurrency = (amount, language, currency = 'AED') => {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format date based on locale
export const formatDate = (date, language) => {
  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

// Format datetime based on locale
export const formatDateTime = (date, language) => {
  return new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Pluralization helper
export const pluralize = (key, count, options = {}) => {
  return i18n.t(key, { count, ...options });
};

// Translation with fallback
export const translateWithFallback = (key, fallback, options = {}) => {
  const translation = i18n.t(key, options);
  return translation === key ? fallback : translation;
};

// Translation with variables
export const translateWithVars = (key, variables = {}) => {
  return i18n.t(key, variables);
};

// Translation with HTML
export const translateWithHTML = (key, options = {}) => {
  return i18n.t(key, { ...options, returnObjects: true });
};

// Translation with context
export const translateWithContext = (key, context, options = {}) => {
  return i18n.t(key, { context, ...options });
};

// Translation with namespace
export const translateWithNamespace = (namespace, key, options = {}) => {
  return i18n.t(`${namespace}:${key}`, options);
};

// Translation with interpolation
export const translateWithInterpolation = (key, values = {}, options = {}) => {
  return i18n.t(key, { ...values, ...options });
};

// Translation with formatting
export const translateWithFormat = (key, format, options = {}) => {
  return i18n.t(key, { format, ...options });
};

// Translation with pluralization and formatting
export const translateWithPluralAndFormat = (key, count, format, options = {}) => {
  return i18n.t(key, { count, format, ...options });
};

// Translation with HTML and variables
export const translateWithHTMLAndVars = (key, variables = {}, options = {}) => {
  return i18n.t(key, { ...variables, ...options, returnObjects: true });
};

// Translation with context and variables
export const translateWithContextAndVars = (key, context, variables = {}, options = {}) => {
  return i18n.t(key, { context, ...variables, ...options });
};

// Translation with namespace and variables
export const translateWithNamespaceAndVars = (namespace, key, variables = {}, options = {}) => {
  return i18n.t(`${namespace}:${key}`, { ...variables, ...options });
};

// Translation with interpolation and formatting
export const translateWithInterpolationAndFormat = (key, values = {}, format, options = {}) => {
  return i18n.t(key, { ...values, format, ...options });
};

export default i18n; 