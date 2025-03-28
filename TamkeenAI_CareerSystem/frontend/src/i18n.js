import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      dashboard: {
        title: 'Dashboard',
      },
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        tryAgain: 'Try Again',
      },
    },
  },
  ar: {
    translation: {
      dashboard: {
        title: 'لوحة المعلومات',
      },
      common: {
        loading: 'جار التحميل...',
        error: 'حدث خطأ',
        tryAgain: 'حاول مرة أخرى',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

export default i18n; 