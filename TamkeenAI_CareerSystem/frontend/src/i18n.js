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
      'Purchase Confirmed!': 'Purchase Confirmed!',
      'Thank you for purchasing the {{title}} package. Your order has been successfully processed.': 'Thank you for purchasing the {{title}} package. Your order has been successfully processed.',
      
      // Dashboard
      dashboard: {
        title: 'Dashboard',
        yourCareerDashboard: 'Your Career Dashboard',
        welcomeBack: 'Welcome back',
        resetLayout: 'Reset Layout',
        refreshDashboard: 'Refresh Dashboard',
        buildMyResume: 'Build My Resume',
        resumeAlert: {
          needsAttention: 'Your resume needs attention',
          completeResume: 'Complete your resume to increase your job match rate'
        },
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
          learningRoadmap: 'Learning Roadmap',
          calendar: 'Calendar',
          todoList: 'To-Do List'
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
        logout: 'Logout',
        automationLinkedin: 'LinkedIn Automation',
        aiRecommendations: 'AI Recommendations',
        resumeScore: 'Resume Score'
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
      
      // User Progress Card
      userProgressCard: {
        title: 'بطاقة تقدم المستخدم',
        overallProgress: 'التقدم الكلي',
        skillsAcquired: 'المهارات المكتسبة',
        coursesCompleted: 'الدورات المكتملة',
        certificationsEarned: 'الشهادات المكتسبة',
        goalsAchieved: 'الأهداف المحققة',
        nextMilestone: 'المعلم التالي',
        learningHours: 'ساعات التعلم',
        personalBest: 'أفضل إنجاز شخصي',
        skillGrowth: 'نمو المهارات',
        viewDetails: 'عرض التفاصيل',
        weekly: 'أسبوعي',
        monthly: 'شهري',
        yearly: 'سنوي',
        trending: 'الاتجاه',
        up: 'تصاعدي',
        down: 'تنازلي'
      },
      
      // Activity Log Section
      activityLogSection: {
        title: 'سجل النشاط',
        today: 'اليوم',
        yesterday: 'أمس',
        thisWeek: 'هذا الأسبوع',
        lastWeek: 'الأسبوع الماضي',
        viewAll: 'عرض الكل',
        filter: 'تصفية',
        noActivities: 'لا توجد أنشطة لعرضها',
        assessmentCompleted: 'تم إكمال التقييم',
        courseEnrolled: 'تم التسجيل في الدورة',
        courseCompleted: 'تم إكمال الدورة',
        certificateEarned: 'تم الحصول على الشهادة',
        skillAcquired: 'تم اكتساب المهارة',
        goalAchieved: 'تم تحقيق الهدف',
        leveledUp: 'ارتقاء المستوى',
        badgeEarned: 'تم الحصول على الشارة',
        journeyStarted: 'بدأت الرحلة',
        journeyCompleted: 'اكتملت الرحلة',
        recommendation: 'توصية',
        opportunity: 'فرصة',
        timeAgo: 'منذ {time}'
      },
      
      // Career Prediction Section
      careerPredictionSection: {
        title: 'تنبؤات المسار المهني',
        yourCurrentRole: 'وظيفتك الحالية',
        potentialPaths: 'المسارات المحتملة',
        matchPercentage: 'نسبة التطابق',
        timeToAchieve: 'الوقت للإنجاز',
        skillsRequired: 'المهارات المطلوبة',
        viewMoreDetails: 'عرض المزيد من التفاصيل',
        exploreCareer: 'استكشاف المسار المهني',
        trending: 'رائج',
        highDemand: 'طلب مرتفع',
        emergingRole: 'دور ناشئ',
        months: 'أشهر',
        years: 'سنوات'
      },
      
      // Skill Gap Analysis
      skillGapAnalysis: {
        title: 'تحليل فجوة المهارات',
        currentSkills: 'المهارات الحالية',
        requiredSkills: 'المهارات المطلوبة',
        gapScore: 'درجة الفجوة',
        recommendation: 'توصية',
        priorityLevel: 'مستوى الأولوية',
        high: 'مرتفع',
        medium: 'متوسط',
        low: 'منخفض',
        course: 'دورة',
        mentor: 'مرشد',
        project: 'مشروع',
        percentComplete: 'نسبة الإكمال',
        skillLevel: 'مستوى المهارة',
        beginner: 'مبتدئ',
        intermediate: 'متوسط',
        advanced: 'متقدم',
        expert: 'خبير'
      },
      
      // AI Recommendation Card
      aiRecommendationCard: {
        title: 'توصيات الذكاء الاصطناعي',
        personalizedFor: 'مخصص لـ',
        basedOn: 'بناءً على',
        yourProfile: 'ملفك الشخصي',
        yourGoals: 'أهدافك',
        marketTrends: 'اتجاهات السوق',
        recommendedCourses: 'الدورات الموصى بها',
        recommendedCertifications: 'الشهادات الموصى بها',
        recommendedMentors: 'المرشدين الموصى بهم',
        recommendedProjects: 'المشاريع الموصى بها',
        viewAll: 'عرض الكل',
        refreshRecommendations: 'تحديث التوصيات',
        seeMore: 'رؤية المزيد'
      },
      
      // Skill Transition Chart
      skillTransitionChart: {
        title: 'مخطط انتقال المهارات',
        currentSkillset: 'مجموعة المهارات الحالية',
        targetSkillset: 'مجموعة المهارات المستهدفة',
        transitionPath: 'مسار الانتقال',
        timeEstimate: 'تقدير الوقت',
        difficultyLevel: 'مستوى الصعوبة',
        resourcesNeeded: 'الموارد المطلوبة',
        startTransition: 'بدء الانتقال',
        skillConnections: 'روابط المهارات',
        transferableSkills: 'المهارات القابلة للنقل',
        skillGaps: 'فجوات المهارات',
        easy: 'سهل',
        moderate: 'معتدل',
        challenging: 'صعب',
        complex: 'معقد'
      },
      
      // Opportunity Alert Card
      opportunityAlertCard: {
        title: 'تنبيهات الفرص',
        newOpportunities: 'فرص جديدة',
        matchScore: 'درجة التطابق',
        deadline: 'الموعد النهائي',
        location: 'الموقع',
        remote: 'عن بعد',
        hybrid: 'هجين',
        onsite: 'في الموقع',
        applyNow: 'تقدم الآن',
        saveForLater: 'حفظ لوقت لاحق',
        dismiss: 'تجاهل',
        newAlert: 'تنبيه جديد',
        basedOnSkills: 'بناءً على مهاراتك',
        basedOnInterests: 'بناءً على اهتماماتك',
        remainingTime: 'الوقت المتبقي',
        days: 'أيام',
        hours: 'ساعات'
      },
      
      // Calendar Component
      calendarComponent: {
        title: 'Calendar',
        addEvent: 'Add Event',
        eventTitle: 'Event Title',
        eventType: 'Event Type',
        meeting: 'Meeting',
        task: 'Task',
        interview: 'Interview',
        course: 'Course',
        cancel: 'Cancel',
        add: 'Add Event',
        noEvents: 'No events scheduled',
        upcoming: 'Upcoming',
        today: 'Today',
        tomorrow: 'Tomorrow',
        addNewEvent: 'Add New Event'
      },
      
      // Todo List Component
      todoListComponent: {
        title: 'To-Do List',
        addTask: 'Add a task...',
        noTasks: 'No tasks for today. Add a task to get started.',
        startPomodoro: 'Start Pomodoro',
        delete: 'Delete',
        completed: 'Completed',
        uncompleted: 'Uncompleted',
        feedback: 'Feedback',
        workTime: 'Work Time',
        breakTime: 'Break Time',
        me: 'Me'
      },
      
      // Pages
      pages: {
        // Login and Registration
        login: {
          title: 'تسجيل الدخول',
          welcomeBack: 'مرحبًا بعودتك',
          rememberMe: 'تذكرني',
          forgotPassword: 'نسيت كلمة المرور؟',
          noAccount: 'ليس لديك حساب؟',
          createAccount: 'إنشاء حساب',
          uaePassLogin: 'تسجيل الدخول باستخدام UAE Pass'
        },
        register: {
          title: 'التسجيل',
          createAccount: 'إنشاء حساب جديد',
          alreadyHaveAccount: 'لديك حساب بالفعل؟',
          signIn: 'تسجيل الدخول',
          personalInfo: 'المعلومات الشخصية',
          accountDetails: 'تفاصيل الحساب',
          privacyPolicy: 'سياسة الخصوصية',
          termsOfService: 'شروط الخدمة',
          agreeToTerms: 'أوافق على الشروط والأحكام'
        },
        dashboard: {
          welcome: 'مرحبًا بك في لوحة المعلومات',
          overview: 'نظرة عامة',
          recentActivity: 'النشاط الأخير',
          quickActions: 'إجراءات سريعة',
          insights: 'رؤى',
          upcomingEvents: 'الأحداث القادمة',
          latestNotifications: 'أحدث الإشعارات'
        },
        userProfile: {
          title: 'الملف الشخصي',
          personalInfo: 'المعلومات الشخصية',
          contactInfo: 'معلومات الاتصال',
          professionalInfo: 'المعلومات المهنية',
          accountSettings: 'إعدادات الحساب',
          privacy: 'الخصوصية',
          notifications: 'الإشعارات',
          linkedAccounts: 'الحسابات المرتبطة',
          saveChanges: 'حفظ التغييرات',
          cancelChanges: 'إلغاء التغييرات',
          deactivateAccount: 'تعطيل الحساب',
          deleteAccount: 'حذف الحساب'
        },
        settings: {
          title: 'الإعدادات',
          general: 'عام',
          appearance: 'المظهر',
          language: 'اللغة',
          notifications: 'الإشعارات',
          privacy: 'الخصوصية',
          security: 'الأمان',
          accessibility: 'إمكانية الوصول',
          theme: 'السمة',
          sound: 'الصوت',
          dataPreferences: 'تفضيلات البيانات',
          saveChanges: 'حفظ التغييرات',
          resetToDefault: 'إعادة ضبط إلى الافتراضي'
        },
        notFound: {
          title: 'الصفحة غير موجودة',
          message: 'عذرًا، الصفحة التي تبحث عنها غير موجودة.',
          backToHome: 'العودة إلى الصفحة الرئيسية',
          contactSupport: 'الاتصال بالدعم'
        },
        jobSearch: {
          title: 'البحث عن وظيفة',
          searchJobs: 'ابحث عن وظائف',
          filters: 'المرشحات',
          jobTitle: 'المسمى الوظيفي',
          location: 'الموقع',
          companyName: 'اسم الشركة',
          jobType: 'نوع الوظيفة',
          salary: 'الراتب',
          experience: 'الخبرة',
          datePosted: 'تاريخ النشر',
          results: 'النتائج',
          noResults: 'لا توجد نتائج',
          saveJob: 'حفظ الوظيفة',
          applyNow: 'التقديم الآن',
          savedJobs: 'الوظائف المحفوظة',
          recentSearches: 'عمليات البحث الأخيرة',
          recommendedJobs: 'الوظائف الموصى بها'
        },
        jobDetails: {
          title: 'تفاصيل الوظيفة',
          applyNow: 'التقديم الآن',
          saveJob: 'حفظ الوظيفة',
          shareJob: 'مشاركة الوظيفة',
          jobDescription: 'وصف الوظيفة',
          responsibilities: 'المسؤوليات',
          requirements: 'المتطلبات',
          benefits: 'المزايا',
          aboutCompany: 'عن الشركة',
          similarJobs: 'وظائف مشابهة',
          applicants: 'المتقدمين',
          postedOn: 'تم النشر في',
          deadline: 'الموعد النهائي',
          skillMatch: 'تطابق المهارات',
          salary: 'الراتب',
          jobType: 'نوع الوظيفة'
        },
        resumePage: {
          title: 'السيرة الذاتية',
          buildResume: 'إنشاء السيرة الذاتية',
          editResume: 'تعديل السيرة الذاتية',
          previewResume: 'معاينة السيرة الذاتية',
          downloadResume: 'تنزيل السيرة الذاتية',
          shareResume: 'مشاركة السيرة الذاتية',
          templates: 'القوالب',
          sections: 'الأقسام',
          aiSuggestions: 'اقتراحات الذكاء الاصطناعي',
          improveResume: 'تحسين السيرة الذاتية',
          resumeScore: 'درجة السيرة الذاتية',
          atsCompatibility: 'توافق نظام تتبع المتقدمين',
          keywordOptimization: 'تحسين الكلمات الرئيسية'
        },
        mockInterview: {
          title: 'المقابلة التجريبية',
          startInterview: 'بدء المقابلة',
          setupInterview: 'إعداد المقابلة',
          selectRole: 'اختيار الدور',
          difficulty: 'مستوى الصعوبة',
          duration: 'المدة',
          interviewInProgress: 'المقابلة قيد التقدم',
          endInterview: 'إنهاء المقابلة',
          reviewInterview: 'مراجعة المقابلة',
          feedback: 'التغذية الراجعة',
          transcript: 'النص',
          performance: 'الأداء',
          sampleQuestions: 'أسئلة عينة',
          suggestions: 'اقتراحات'
        },
        aiCoach: {
          title: 'مدرب الذكاء الاصطناعي',
          askQuestion: 'اسأل سؤالًا',
          chatHistory: 'سجل المحادثة',
          suggestedTopics: 'المواضيع المقترحة',
          careerAdvice: 'نصائح مهنية',
          skillDevelopment: 'تطوير المهارات',
          resumeTips: 'نصائح السيرة الذاتية',
          interviewPreparation: 'التحضير للمقابلة',
          personalizedCoaching: 'التدريب المخصص',
          saveConversation: 'حفظ المحادثة',
          clearChat: 'مسح المحادثة'
        },
        networkingView: {
          title: 'التواصل',
          myConnections: 'اتصالاتي',
          pendingRequests: 'الطلبات المعلقة',
          suggestedConnections: 'الاتصالات المقترحة',
          events: 'الفعاليات',
          messages: 'الرسائل',
          addConnection: 'إضافة اتصال',
          findConnections: 'البحث عن اتصالات',
          importContacts: 'استيراد جهات الاتصال',
          exportContacts: 'تصدير جهات الاتصال',
          networkStats: 'إحصائيات الشبكة',
          recentActivity: 'النشاط الأخير'
        },
        skillsAssessment: {
          title: 'تقييم المهارات',
          startAssessment: 'بدء التقييم',
          mySkills: 'مهاراتي',
          skillGaps: 'فجوات المهارات',
          recommendedSkills: 'المهارات الموصى بها',
          skillCategories: 'فئات المهارات',
          technicalSkills: 'المهارات التقنية',
          softSkills: 'المهارات الناعمة',
          assessmentHistory: 'سجل التقييم',
          skillCertification: 'شهادة المهارة',
          skillLevel: 'مستوى المهارة',
          benchmarkComparison: 'مقارنة المعيار'
        },
        aiRecommendations: {
          title: 'توصيات الذكاء الاصطناعي',
          personalizedRecommendations: 'توصيات مخصصة',
          jobRecommendations: 'توصيات الوظائف',
          skillRecommendations: 'توصيات المهارات',
          courseRecommendations: 'توصيات الدورات',
          networkingRecommendations: 'توصيات التواصل',
          careerPathRecommendations: 'توصيات المسار المهني',
          learningResources: 'موارد التعلم',
          reasonForRecommendation: 'سبب التوصية',
          refreshRecommendations: 'تحديث التوصيات',
          saveRecommendation: 'حفظ التوصية'
        },
        careerAssessment: {
          title: 'تقييم المسار المهني',
          startAssessment: 'بدء التقييم',
          assessmentResults: 'نتائج التقييم',
          personalityProfile: 'ملف الشخصية',
          careerFit: 'ملاءمة المسار المهني',
          strengthsAndWeaknesses: 'نقاط القوة والضعف',
          valueAlignment: 'توافق القيم',
          workStylePreferences: 'تفضيلات أسلوب العمل',
          saveResults: 'حفظ النتائج',
          shareResults: 'مشاركة النتائج',
          recommendedCareers: 'المسارات المهنية الموصى بها'
        },
        learningResources: {
          title: 'موارد التعلم',
          courses: 'الدورات',
          tutorials: 'البرامج التعليمية',
          webinars: 'الندوات عبر الإنترنت',
          articles: 'المقالات',
          videos: 'الفيديوهات',
          podcasts: 'البودكاست',
          bookmarks: 'المفضلة',
          recentlyViewed: 'تمت مشاهدتها مؤخرًا',
          popular: 'شائع',
          trending: 'رائج',
          recommended: 'موصى به',
          categories: 'الفئات',
          searchResources: 'البحث في الموارد'
        },
        notifications: {
          title: 'الإشعارات',
          all: 'الكل',
          unread: 'غير مقروءة',
          read: 'مقروءة',
          markAllAsRead: 'تعليم الكل كمقروء',
          clearAll: 'مسح الكل',
          notificationSettings: 'إعدادات الإشعارات',
          jobAlerts: 'تنبيهات الوظائف',
          messages: 'الرسائل',
          reminders: 'التذكيرات',
          systemUpdates: 'تحديثات النظام',
          noNotifications: 'لا توجد إشعارات',
          filterNotifications: 'تصفية الإشعارات'
        },
        certificationsAchievements: {
          title: 'الشهادات والإنجازات',
          myCertifications: 'شهاداتي',
          myAchievements: 'إنجازاتي',
          addCertification: 'إضافة شهادة',
          addAchievement: 'إضافة إنجاز',
          badges: 'الشارات',
          leaderboard: 'لوحة المتصدرين',
          progressTracking: 'تتبع التقدم',
          shareCertifications: 'مشاركة الشهادات',
          verifyCredentials: 'التحقق من بيانات الاعتماد',
          certificationDetails: 'تفاصيل الشهادة'
        },
        linkedInAutomation: {
          title: 'أتمتة لينكد إن',
          connectAccount: 'ربط الحساب',
          automationSettings: 'إعدادات الأتمتة',
          activeAutomations: 'الأتمتة النشطة',
          automationHistory: 'سجل الأتمتة',
          createAutomation: 'إنشاء أتمتة',
          pauseAutomation: 'إيقاف الأتمتة مؤقتًا',
          resumeAutomation: 'استئناف الأتمتة',
          deleteAutomation: 'حذف الأتمتة',
          connectionRequests: 'طلبات الاتصال',
          messageTemplates: 'قوالب الرسائل',
          postScheduling: 'جدولة المنشورات'
        },
        savedJobs: {
          title: 'الوظائف المحفوظة',
          noSavedJobs: 'لا توجد وظائف محفوظة',
          saveNewJob: 'حفظ وظيفة جديدة',
          removeSavedJob: 'إزالة الوظيفة المحفوظة',
          appliedJobs: 'الوظائف المقدم عليها',
          rejectedJobs: 'الوظائف المرفوضة',
          interviewJobs: 'وظائف المقابلة',
          offerJobs: 'عروض الوظائف',
          sortBy: 'ترتيب حسب',
          filterBy: 'تصفية حسب',
          searchSavedJobs: 'البحث في الوظائف المحفوظة'
        },
        
        // Additional pages
        myBookingsThird: {
          title: 'حجوزاتي',
          bookSession: 'حجز جلسة',
          findMoreCoaches: 'البحث عن المزيد من المدربين',
          noBookingsYet: "ليس لديك أي حجوزات حتى الآن",
          browseCoaches: 'تصفح مدربي المقابلات واحجز جلستك الأولى!',
          upcoming: 'القادمة',
          past: 'السابقة',
          paymentHistory: 'سجل المدفوعات',
          refreshBookings: 'تحديث الحجوزات',
          bookingsRefreshed: 'تم تحديث الحجوزات',
          noUpcomingBookings: "ليس لديك أي حجوزات قادمة.",
          noPastBookings: "ليس لديك أي حجوزات سابقة.",
          viewAllPayments: 'عرض جميع مدفوعاتك للجلسات والباقات',
          noPaymentHistory: "ليس لديك أي سجل مدفوعات.",
          upcomingSessions: 'الجلسات القادمة',
          pastSessions: 'الجلسات السابقة',
          bookNewSession: 'حجز جلسة جديدة',
          viewDetails: 'عرض التفاصيل',
          reschedule: 'إعادة الجدولة',
          cancel: 'إلغاء',
          sessionType: 'نوع الجلسة',
          date: 'التاريخ',
          time: 'الوقت',
          duration: 'المدة',
          coach: 'المدرب'
        },
        
        // My Bookings (English)
        myBookingsEn: {
          title: 'My Bookings',
          bookSession: 'Book a Session',
          findMoreCoaches: 'Find More Coaches',
          noBookingsYet: "You don't have any bookings yet",
          browseCoaches: 'Browse our interview coaches and book your first session!',
          upcoming: 'Upcoming',
          past: 'Past',
          paymentHistory: 'Payment History',
          refreshBookings: 'Refresh Bookings',
          bookingsRefreshed: 'Bookings refreshed',
          noUpcomingBookings: "You don't have any upcoming bookings.",
          noPastBookings: "You don't have any past bookings.",
          viewAllPayments: 'View all your payments for sessions and packages',
          noPaymentHistory: "You don't have any payment history.",
          upcomingSessions: 'Upcoming Sessions',
          pastSessions: 'Past Sessions',
          bookNewSession: 'Book New Session',
          viewDetails: 'View Details',
          reschedule: 'Reschedule',
          cancel: 'Cancel',
          sessionType: 'Session Type',
          date: 'Date',
          time: 'Time',
          duration: 'Duration',
          coach: 'Coach',
          status: 'Status',
          confirmed: 'Confirmed',
          cancelled: 'Cancelled',
          completed: 'Completed',
          pending: 'Pending',
          joinSession: 'Join Session',
          feedback: 'Feedback',
          meetingLink: 'Meeting Link'
        },
        
        // My Bookings (Arabic)
        myBookingsAr: {
          title: 'حجوزاتي',
          bookSession: 'حجز جلسة',
          findMoreCoaches: 'البحث عن المزيد من المدربين',
          noBookingsYet: "ليس لديك أي حجوزات حتى الآن",
          browseCoaches: 'تصفح مدربي المقابلات واحجز جلستك الأولى!',
          upcoming: 'القادمة',
          past: 'السابقة',
          paymentHistory: 'سجل المدفوعات',
          refreshBookings: 'تحديث الحجوزات',
          bookingsRefreshed: 'تم تحديث الحجوزات',
          noUpcomingBookings: "ليس لديك أي حجوزات قادمة.",
          noPastBookings: "ليس لديك أي حجوزات سابقة.",
          viewAllPayments: 'عرض جميع مدفوعاتك للجلسات والباقات',
          noPaymentHistory: "ليس لديك أي سجل مدفوعات.",
          upcomingSessions: 'الجلسات القادمة',
          pastSessions: 'الجلسات السابقة',
          bookNewSession: 'حجز جلسة جديدة',
          viewDetails: 'عرض التفاصيل',
          reschedule: 'إعادة جدولة',
          cancel: 'إلغاء',
          sessionType: 'نوع الجلسة',
          date: 'التاريخ',
          time: 'الوقت',
          duration: 'المدة',
          coach: 'المدرب',
          status: 'الحالة',
          confirmed: 'مؤكد',
          cancelled: 'ملغى',
          completed: 'مكتمل',
          pending: 'معلق',
          joinSession: 'الانضمام إلى الجلسة',
          feedback: 'التغذية الراجعة',
          meetingLink: 'رابط الاجتماع'
        },
        
        // My Bookings
        myBookingsFirst: {
          title: 'حجوزاتي',
          bookSession: 'حجز جلسة',
          findMoreCoaches: 'البحث عن المزيد من المدربين',
          noBookingsYet: "ليس لديك أي حجوزات حتى الآن",
          browseCoaches: 'تصفح مدربي المقابلات واحجز جلستك الأولى!',
          upcoming: 'القادمة',
          past: 'السابقة',
          paymentHistory: 'سجل المدفوعات',
          refreshBookings: 'تحديث الحجوزات',
          bookingsRefreshed: 'تم تحديث الحجوزات',
          noUpcomingBookings: "ليس لديك أي حجوزات قادمة.",
          noPastBookings: "ليس لديك أي حجوزات سابقة.",
          viewAllPayments: 'عرض جميع مدفوعاتك للجلسات والباقات',
          noPaymentHistory: "ليس لديك أي سجل مدفوعات.",
          upcomingSessions: 'الجلسات القادمة',
          pastSessions: 'الجلسات السابقة',
          bookNewSession: 'حجز جلسة جديدة',
          viewDetails: 'عرض التفاصيل',
          reschedule: 'إعادة الجدولة',
          cancel: 'إلغاء',
          sessionType: 'نوع الجلسة',
          date: 'التاريخ',
          time: 'الوقت',
          duration: 'المدة',
          coach: 'المدرب'
        },
        
        // My Bookings (Arabic)
        myBookingsFourth: {
          title: 'حجوزاتي',
          bookSession: 'حجز جلسة',
          findMoreCoaches: 'البحث عن المزيد من المدربين',
          noBookingsYet: "ليس لديك أي حجوزات حتى الآن",
          browseCoaches: 'تصفح مدربي المقابلات واحجز جلستك الأولى!',
          upcoming: 'القادمة',
          past: 'السابقة',
          paymentHistory: 'سجل المدفوعات',
          refreshBookings: 'تحديث الحجوزات',
          bookingsRefreshed: 'تم تحديث الحجوزات',
          noUpcomingBookings: "ليس لديك أي حجوزات قادمة.",
          noPastBookings: "ليس لديك أي حجوزات سابقة.",
          viewAllPayments: 'عرض جميع مدفوعاتك للجلسات والباقات',
          noPaymentHistory: "ليس لديك أي سجل مدفوعات."
        },
        
        // My Bookings (Arabic)
        myBookingsFifth: {
          title: 'حجوزاتي',
          bookSession: 'حجز جلسة',
          findMoreCoaches: 'البحث عن المزيد من المدربين',
          noBookingsYet: "ليس لديك أي حجوزات حتى الآن",
          browseCoaches: 'تصفح مدربي المقابلات واحجز جلستك الأولى!',
          upcoming: 'القادمة',
          past: 'السابقة',
          paymentHistory: 'سجل المدفوعات',
          refreshBookings: 'تحديث الحجوزات',
          bookingsRefreshed: 'تم تحديث الحجوزات',
          noUpcomingBookings: "ليس لديك أي حجوزات قادمة.",
          noPastBookings: "ليس لديك أي حجوزات سابقة.",
          viewAllPayments: 'عرض جميع مدفوعاتك للجلسات والباقات',
          noPaymentHistory: "ليس لديك أي سجل مدفوعات."
        }
      }
    },
  },
  ar: {
    translation: {
      // Auth pages
      'Welcome to Tamkeen!': 'مرحبًا بك في تمكين!',
      'Please sign-in to your account and start the adventure': 'الرجاء تسجيل الدخول إلى حسابك وبدء المغامرة'
    }
  }
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

// Helper function to change language and handle RTL
export const changeLanguage = (lang) => {
  // Store the selected language in localStorage
  localStorage.setItem('language', lang);
  
  // Change i18n language
  i18n.changeLanguage(lang);
  
  // Set RTL mode for Arabic
  if (lang === 'ar') {
    document.documentElement.setAttribute('dir', 'rtl');
    document.body.classList.add('rtl-mode');
  } else {
    document.documentElement.setAttribute('dir', 'ltr');
    document.body.classList.remove('rtl-mode');
  }
  
  // Set html lang attribute for accessibility
  document.documentElement.setAttribute('lang', lang);

  return lang;
};

// Helper to get current UI direction
export const getDirection = () => {
  return i18n.language === 'ar' ? 'rtl' : 'ltr';
};

// Initialize language setting from localStorage
const initializeLanguage = () => {
  const savedLanguage = localStorage.getItem('language') || 'en';
  changeLanguage(savedLanguage);
};

// Call initialize when importing this file
initializeLanguage();