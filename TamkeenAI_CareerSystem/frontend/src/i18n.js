import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Auth pages
      'Welcome to Tamkeen AI Career Intelligence System': 'Welcome to Tamkeen AI Career Intelligence System',
      'Email and password are required': 'Email and password are required',
      'Login failed. Please try again.': 'Login failed. Please try again.',
      'An unexpected error occurred': 'An unexpected error occurred',
      'Full Name': 'Full Name',
      'Enter your full name': 'Enter your full name',
      'Email': 'Email',
      'Enter your email': 'Enter your email',
      'Password': 'Password',
      'Enter your password': 'Enter your password',
      'Remember Me': 'Remember Me',
      'Forgot Password?': 'Forgot Password?',
      'Sign in': 'Sign in',
      'Signing in...': 'Signing in...',
      'Don\'t have an account?': 'Don\'t have an account?',
      'Register': 'Register',
      '"We, as a people, are not satisfied with anything but first place." 🇦🇪': '"We, as a people, are not satisfied with anything but first place." 🇦🇪',
      
      // Dashboard
      dashboard: {
        title: 'Dashboard',
      },
      
      // Common elements
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        tryAgain: 'Try Again',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        apply: 'Apply',
        reset: 'Reset',
        submit: 'Submit',
        next: 'Next',
        previous: 'Previous',
        back: 'Back',
        success: 'Success',
        failure: 'Failure',
        confirm: 'Confirm',
        reject: 'Reject',
      },
    },
  },
  ar: {
    translation: {
      // Auth pages
      'Welcome to Tamkeen AI Career Intelligence System': 'مرحبًا بك في نظام تمكين للذكاء الوظيفي',
      'Email and password are required': 'البريد الإلكتروني وكلمة المرور مطلوبان',
      'Login failed. Please try again.': 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.',
      'An unexpected error occurred': 'حدث خطأ غير متوقع',
      'Full Name': 'الاسم الكامل',
      'Enter your full name': 'أدخل اسمك الكامل',
      'Email': 'البريد الإلكتروني',
      'Enter your email': 'أدخل بريدك الإلكتروني',
      'Password': 'كلمة المرور',
      'Enter your password': 'أدخل كلمة المرور',
      'Remember Me': 'تذكرني',
      'Forgot Password?': 'نسيت كلمة المرور؟',
      'Sign in': 'تسجيل الدخول',
      'Signing in...': 'جاري تسجيل الدخول...',
      'Don\'t have an account?': 'ليس لديك حساب؟',
      'Register': 'تسجيل جديد',
      '"We, as a people, are not satisfied with anything but first place." 🇦🇪': '"نحن كشعب، لا نرضى بغير المركز الأول." 🇦🇪',
      
      // Dashboard
      dashboard: {
        title: 'لوحة المعلومات',
      },
      
      // Common elements
      common: {
        loading: 'جار التحميل...',
        error: 'حدث خطأ',
        tryAgain: 'حاول مرة أخرى',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        view: 'عرض',
        search: 'بحث',
        filter: 'تصفية',
        sort: 'ترتيب',
        apply: 'تطبيق',
        reset: 'إعادة ضبط',
        submit: 'إرسال',
        next: 'التالي',
        previous: 'السابق',
        back: 'رجوع',
        success: 'نجاح',
        failure: 'فشل',
        confirm: 'تأكيد',
        reject: 'رفض',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en', // Default language from localStorage or fallback to 'en'
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    // RTL support
    react: {
      useSuspense: true,
    },
  });

export default i18n; 