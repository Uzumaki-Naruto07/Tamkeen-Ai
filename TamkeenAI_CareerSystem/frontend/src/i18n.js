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
        },
        errors: {
          loadFailed: 'Failed to load dashboard data. Please try again.',
          refreshFailed: 'Failed to refresh dashboard data. Please try again.'
        }
      },
      
      // Navigation items
      navigation: {
        dashboard: 'Dashboard',
        jobs: 'Jobs',
        aiCoach: 'AI Coach',
        resumeBuilder: 'Resume Builder',
        skillBuilder: 'Skill Builder',
        achievements: 'Achievements',
        settings: 'Settings',
        profile: 'Profile',
        logout: 'Logout'
      },
      
      // Notifications
      notifications: {
        newJobRecommendation: 'New job recommendation',
        resumeUpdate: 'Your resume needs updating',
        skillGap: 'Skill gap detected',
        mockInterview: 'Mock interview completed',
        newAchievement: 'New achievement unlocked!',
        markAllRead: 'Mark all read',
        read: 'Read',
        new: 'New',
        empty: 'No notifications',
        viewAll: 'View all notifications'
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
        user: 'User',
        login: 'Login',
        logout: 'Logout',
        profile: 'Profile',
        settings: 'Settings',
        notifications: 'Notifications',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode'
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
        },
        errors: {
          loadFailed: 'فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.',
          refreshFailed: 'فشل في تحديث البيانات. يرجى المحاولة مرة أخرى.'
        }
      },
      
      // Navigation items
      navigation: {
        dashboard: 'لوحة المعلومات',
        jobs: 'الوظائف',
        aiCoach: 'مدرب الذكاء الاصطناعي',
        resumeBuilder: 'منشئ السيرة الذاتية',
        skillBuilder: 'منشئ المهارات',
        achievements: 'الإنجازات',
        settings: 'الإعدادات',
        profile: 'الملف الشخصي',
        logout: 'تسجيل الخروج'
      },
      
      // Notifications
      notifications: {
        newJobRecommendation: 'توصية وظيفة جديدة',
        resumeUpdate: 'تحتاج سيرتك الذاتية إلى تحديث',
        skillGap: 'تم اكتشاف فجوة مهارية',
        mockInterview: 'تم إكمال المقابلة التجريبية',
        newAchievement: 'تم فتح إنجاز جديد!',
        markAllRead: 'تعليم الكل كمقروء',
        read: 'مقروء',
        new: 'جديد',
        empty: 'لا توجد إشعارات',
        viewAll: 'عرض جميع الإشعارات'
      },
      
      // Badge section translations
      badges: {
        yourAchievements: 'إنجازاتك',
        earned: 'مكتسبة',
        achievementProgress: 'مستوى الإنجاز',
        complete: 'مكتمل',
        badgesTab: 'الأوسمة',
        progressionTab: 'التقدم',
        challengesTab: 'التحديات',
        badgeProgressionPaths: 'مسارات تقدم الأوسمة',
        yourBadgeChallenges: 'تحديات الأوسمة الخاصة بك',
        careerCategory: 'مسار مهني',
        learningCategory: 'التعلم',
        networkingCategory: 'التواصل',
        skillsCategory: 'المهارات',
        generalCategory: 'عام',
        nextLabel: 'التالي',
        progress: 'التقدم',
        completed: 'مكتمل',
        almostThere: 'اقتربت من الهدف!',
        readyToClaim: 'جاهز للمطالبة!',
        earnedOn: 'تم الحصول عليها في'
      },
      
      // User progress translations
      userProgress: {
        welcome: {
          morning: 'صباح الخير، {name}!',
          afternoon: 'مساء الخير، {name}!',
          evening: 'مساء الخير، {name}!'
        },
        careerExplorer: 'مستكشف المهنة',
        level: 'المستوى {level}',
        gold: 'ذهبي',
        silver: 'فضي',
        bronze: 'برونزي',
        xpPoints: 'نقاط الخبرة',
        toNextLevel: '{points} نقطة للمستوى التالي',
        recentAchievements: 'الإنجازات الأخيرة',
        viewAll: 'عرض الكل',
        firstLogin: 'أول تسجيل دخول',
        completedProfile: 'اكتمال الملف الشخصي',
        firstResume: 'السيرة الذاتية الأولى'
      },
      
      // Resume score translations
      resumeScore: {
        yourResumeScore: 'تقييم سيرتك الذاتية',
        lastUpdated: 'آخر تحديث',
        improvement: 'تحسن بنسبة {percent}%',
        keywordMatches: 'تطابق الكلمات الرئيسية',
        missingKeywords: 'الكلمات الرئيسية المفقودة',
        suggestedSection: 'القسم المقترح',
        high: 'عالي',
        medium: 'متوسط',
        low: 'منخفض',
        updateResume: 'تحديث السيرة الذاتية'
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
        close: 'إغلاق',
        share: 'مشاركة',
        retry: 'إعادة المحاولة',
        noData: 'لا توجد بيانات متاحة',
        user: 'مستخدم',
        login: 'تسجيل الدخول',
        logout: 'تسجيل الخروج',
        profile: 'الملف الشخصي',
        settings: 'الإعدادات',
        notifications: 'الإشعارات',
        lightMode: 'الوضع الفاتح',
        darkMode: 'الوضع الداكن'
      },
      
      // Market insights
      marketInsights: {
        salaryData: 'بيانات الرواتب',
        average: 'متوسط',
        range: 'النطاق',
        jobDemand: 'الطلب على الوظائف',
        competitionLevel: 'مستوى المنافسة',
        growthRate: 'معدل النمو',
        topSkills: 'أهم المهارات',
        high: 'مرتفع',
        medium: 'متوسط',
        low: 'منخفض'
      },
      
      // Learning paths
      learningPaths: {
        inProgress: 'قيد التقدم',
        completed: 'مكتمل',
        today: 'اليوم',
        viewCourse: 'عرض الدورة',
        startCourse: 'بدء الدورة',
        resumeCourse: 'استئناف الدورة',
        certificate: 'شهادة'
      }
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