import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Auth pages
      'Welcome to Tamkeen!': 'Welcome to Tamkeen!',
      'Please sign-in to your account and start the adventure': 'Please sign-in to your account and start the adventure',
      'Email and password are required': 'Email and password are required',
      'Login failed. Please try again.': 'Login failed. Please try again.',
      'An unexpected error occurred': 'An unexpected error occurred',
      'Email or Username': 'Email or Username',
      'Enter your email or username': 'Enter your email or username',
      'Password': 'Password',
      'Enter your password': 'Enter your password',
      'Remember Me': 'Remember Me',
      'Forgot Password?': 'Forgot Password?',
      'Sign in': 'Sign in',
      'Signing in...': 'Signing in...',
      'New on our platform?': 'New on our platform?',
      'Create an account': 'Create an account',
      'or': 'or',
      'Don\'t have an account?': 'Don\'t have an account?',
      'Register': 'Register',
      '"We, as a people, are not satisfied with anything but first place." 🇦🇪': '"We, as a people, are not satisfied with anything but first place." 🇦🇪',
      
      // Dashboard
      dashboard: {
        title: 'Dashboard',
        yourCareerDashboard: 'Your Career Dashboard',
        widgets: {
          userProgress: 'Your Progress',
          resumeScore: 'Resume Score',
          skillGap: 'Skill Gap Analysis',
          aiRecommendation: 'AI Recommendations',
          careerJourney: 'Career Journey',
          badges: 'Achievements',
          careerPrediction: 'Career Predictions',
          learningPaths: 'Learning Paths',
          marketInsights: 'Market Insights',
          leaderboard: 'Leaderboard',
          activityLog: 'Recent Activities',
          opportunityAlert: 'Opportunity Alerts',
          learningRoadmap: 'Learning Roadmap'
        },
        actions: {
          refresh: 'Refresh Dashboard',
          customize: 'Customize Dashboard',
          resetLayout: 'Reset Layout',
          hide: 'Hide Widget',
          show: 'Show Widget',
          dragToReorder: 'Drag to reorder'
        }
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
      'Welcome to Tamkeen!': 'مرحبًا بك في تمكين!',
      'Please sign-in to your account and start the adventure': 'الرجاء تسجيل الدخول إلى حسابك وبدء المغامرة',
      'Email and password are required': 'البريد الإلكتروني وكلمة المرور مطلوبان',
      'Login failed. Please try again.': 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.',
      'An unexpected error occurred': 'حدث خطأ غير متوقع',
      'Email or Username': 'البريد الإلكتروني أو اسم المستخدم',
      'Enter your email or username': 'أدخل بريدك الإلكتروني أو اسم المستخدم',
      'Password': 'كلمة المرور',
      'Enter your password': 'أدخل كلمة المرور',
      'Remember Me': 'تذكرني',
      'Forgot Password?': 'نسيت كلمة المرور؟',
      'Sign in': 'تسجيل الدخول',
      'Signing in...': 'جاري تسجيل الدخول...',
      'New on our platform?': 'جديد على منصتنا؟',
      'Create an account': 'إنشاء حساب',
      'or': 'أو',
      'Don\'t have an account?': 'ليس لديك حساب؟',
      'Register': 'تسجيل جديد',
      '"We, as a people, are not satisfied with anything but first place." 🇦🇪': '"نحن كشعب، لا نرضى بغير المركز الأول." 🇦🇪',
      
      // Dashboard
      dashboard: {
        title: 'لوحة المعلومات',
        yourCareerDashboard: 'لوحة معلومات المسار المهني',
        widgets: {
          userProgress: 'تقدمك',
          resumeScore: 'تقييم السيرة الذاتية',
          skillGap: 'تحليل فجوة المهارات',
          aiRecommendation: 'توصيات الذكاء الاصطناعي',
          careerJourney: 'رحلتك المهنية',
          badges: 'الإنجازات',
          careerPrediction: 'توقعات المسار المهني',
          learningPaths: 'مسارات التعلم',
          marketInsights: 'رؤى سوق العمل',
          leaderboard: 'لوحة المتصدرين',
          activityLog: 'النشاطات الأخيرة',
          opportunityAlert: 'تنبيهات الفرص',
          learningRoadmap: 'خريطة التعلم'
        },
        actions: {
          refresh: 'تحديث اللوحة',
          customize: 'تخصيص اللوحة',
          resetLayout: 'إعادة ضبط التصميم',
          hide: 'إخفاء العنصر',
          show: 'إظهار العنصر',
          dragToReorder: 'اسحب لإعادة الترتيب'
        }
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