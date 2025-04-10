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
        myBookings: {
          title: 'حجوزاتي',
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
        
        coachProfile: {
          title: 'ملف المدرب',
          about: 'نبذة عن',
          expertise: 'الخبرة',
          experience: 'الخبرة',
          education: 'التعليم',
          certifications: 'الشهادات',
          languages: 'اللغات',
          rating: 'التقييم',
          reviews: 'المراجعات',
          sessionTypes: 'أنواع الجلسات',
          availability: 'التوفر',
          bookSession: 'حجز جلسة',
          contactCoach: 'التواصل مع المدرب',
          coachingStyle: 'أسلوب التدريب',
          pricing: 'التسعير',
          viewAllReviews: 'عرض جميع المراجعات',
          leaveReview: 'ترك مراجعة'
        },
        
        gamifiedProgress: {
          title: 'التقدم المحفز',
          level: 'المستوى',
          experience: 'الخبرة',
          achievements: 'الإنجازات',
          badges: 'الشارات',
          challenges: 'التحديات',
          rewards: 'المكافآت',
          leaderboard: 'لوحة المتصدرين',
          streak: 'السلسلة',
          dailyGoals: 'الأهداف اليومية',
          weeklyGoals: 'الأهداف الأسبوعية',
          milestones: 'المعالم',
          unlocked: 'مفتوح',
          locked: 'مقفل',
          progressTracking: 'تتبع التقدم',
          challengeProgress: 'تقدم التحدي',
          collectReward: 'جمع المكافأة',
          nextLevel: 'المستوى التالي'
        },
        
        interviewResults: {
          title: 'نتائج المقابلة',
          overallScore: 'الدرجة الإجمالية',
          detailedFeedback: 'التغذية الراجعة المفصلة',
          strengths: 'نقاط القوة',
          areasForImprovement: 'مجالات التحسين',
          transcript: 'النص',
          videoReplay: 'إعادة تشغيل الفيديو',
          aiAnalysis: 'تحليل الذكاء الاصطناعي',
          keyInsights: 'الرؤى الرئيسية',
          compareWithPrevious: 'المقارنة مع المقابلات السابقة',
          exportResults: 'تصدير النتائج',
          nextSteps: 'الخطوات التالية',
          practiceMore: 'ممارسة المزيد',
          viewSuggestions: 'عرض الاقتراحات',
          shareResults: 'مشاركة النتائج'
        },
        
        aiInterviewCoach: {
          title: 'مدرب مقابلة الذكاء الاصطناعي',
          startSession: 'بدء الجلسة',
          chooseIndustry: 'اختيار الصناعة',
          chooseDifficulty: 'اختيار مستوى الصعوبة',
          interviewTips: 'نصائح المقابلة',
          commonQuestions: 'الأسئلة الشائعة',
          practiceAnswers: 'إجابات الممارسة',
          realTimeAnalysis: 'تحليل في الوقت الحقيقي',
          bodylanguageTips: 'نصائح لغة الجسد',
          voiceToneFeedback: 'تعليقات نبرة الصوت',
          interviewSimulation: 'محاكاة المقابلة',
          personalizedCoaching: 'تدريب مخصص',
          saveProgress: 'حفظ التقدم',
          endSession: 'إنهاء الجلسة'
        },
        
        allInterviewCoach: {
          title: 'جميع مدربي المقابلة',
          browseCoaches: 'تصفح المدربين',
          filterCoaches: 'تصفية المدربين',
          specialization: 'التخصص',
          availability: 'التوفر',
          price: 'السعر',
          rating: 'التقييم',
          language: 'اللغة',
          experience: 'الخبرة',
          bookSession: 'حجز جلسة',
          viewProfile: 'عرض الملف الشخصي',
          compareCoaches: 'مقارنة المدربين',
          featuredCoaches: 'المدربون المميزون',
          newCoaches: 'المدربون الجدد',
          mostPopular: 'الأكثر شعبية'
        },
        
        checkout: {
          title: 'الدفع',
          orderSummary: 'ملخص الطلب',
          paymentDetails: 'تفاصيل الدفع',
          billingAddress: 'عنوان الفواتير',
          paymentMethod: 'طريقة الدفع',
          creditCard: 'بطاقة الائتمان',
          paypal: 'باي بال',
          applePay: 'آبل باي',
          googlePay: 'جوجل باي',
          subtotal: 'المجموع الفرعي',
          tax: 'الضريبة',
          discount: 'الخصم',
          total: 'المجموع',
          promoCode: 'رمز ترويجي',
          apply: 'تطبيق',
          placeOrder: 'إتمام الطلب',
          secureCheckout: 'الدفع الآمن',
          termsAndConditions: 'الشروط والأحكام'
        },
        
        startupPitch: {
          title: 'عرض الشركة الناشئة',
          createPitch: 'إنشاء عرض',
          pitchElements: 'عناصر العرض',
          problemStatement: 'بيان المشكلة',
          solution: 'الحل',
          marketOpportunity: 'فرصة السوق',
          businessModel: 'نموذج العمل',
          competitiveLandscape: 'المشهد التنافسي',
          teamIntroduction: 'تقديم الفريق',
          financialProjections: 'التوقعات المالية',
          fundingRequirements: 'متطلبات التمويل',
          previewPitch: 'معاينة العرض',
          saveDraft: 'حفظ المسودة',
          submitPitch: 'تقديم العرض',
          getPitchFeedback: 'الحصول على تعليقات حول العرض'
        },
        
        applicationTips: {
          title: 'نصائح التقديم',
          resumeTips: 'نصائح السيرة الذاتية',
          coverLetterGuidance: 'إرشادات خطاب التغطية',
          interviewPreparation: 'التحضير للمقابلة',
          followUpStrategies: 'استراتيجيات المتابعة',
          commonMistakes: 'الأخطاء الشائعة',
          industrySpeicicTips: 'نصائح خاصة بالصناعة',
          expertAdvice: 'نصائح الخبراء',
          successStories: 'قصص النجاح',
          doAndDonts: 'ما يجب وما لا يجب فعله',
          resourceLibrary: 'مكتبة الموارد',
          latestTrends: 'أحدث الاتجاهات',
          personalizationTips: 'نصائح التخصيص'
        },
        
        coverLetter: {
          title: 'خطاب التغطية',
          createNew: 'إنشاء جديد',
          templates: 'القوالب',
          savedDrafts: 'المسودات المحفوظة',
          recentlyUsed: 'المستخدمة مؤخرًا',
          addSection: 'إضافة قسم',
          previewLetter: 'معاينة الخطاب',
          downloadLetter: 'تنزيل الخطاب',
          shareLettervia: 'مشاركة الخطاب عبر',
          aiSuggestions: 'اقتراحات الذكاء الاصطناعي',
          customizeLetter: 'تخصيص الخطاب',
          selectFormat: 'اختيار التنسيق',
          matchWithResume: 'مطابقة مع السيرة الذاتية',
          jobSpecificLetter: 'خطاب خاص بالوظيفة'
        },
        
        taskManager: {
          title: 'مدير المهام',
          myTasks: 'مهامي',
          addTask: 'إضافة مهمة',
          editTask: 'تعديل المهمة',
          deleteTask: 'حذف المهمة',
          taskPriority: 'أولوية المهمة',
          dueDate: 'تاريخ الاستحقاق',
          taskStatus: 'حالة المهمة',
          taskCategories: 'فئات المهام',
          completedTasks: 'المهام المكتملة',
          pendingTasks: 'المهام المعلقة',
          searchTasks: 'البحث في المهام',
          filterTasks: 'تصفية المهام',
          sortTasks: 'ترتيب المهام',
          taskDetails: 'تفاصيل المهمة',
          subtasks: 'المهام الفرعية',
          taskReminders: 'تذكيرات المهمة'
        },
        
        walkthroughTour: {
          title: 'جولة تعريفية',
          getStarted: 'البدء',
          skipTour: 'تخطي الجولة',
          nextStep: 'الخطوة التالية',
          previousStep: 'الخطوة السابقة',
          finishTour: 'إنهاء الجولة',
          welcomeMessage: 'رسالة الترحيب',
          dashboardOverview: 'نظرة عامة على لوحة المعلومات',
          keyFeatures: 'الميزات الرئيسية',
          navigationHelp: 'مساعدة التنقل',
          settingPreferences: 'إعداد التفضيلات',
          additionalResources: 'موارد إضافية',
          needHelp: 'بحاجة إلى مساعدة؟',
          tourProgress: 'تقدم الجولة',
          stepComplete: 'اكتملت الخطوة'
        },
        
        // Final pages
        uaePassLogin: {
          title: 'تسجيل الدخول باستخدام UAE Pass',
          connecting: 'جاري الاتصال...',
          authenticating: 'جاري المصادقة...',
          redirecting: 'جاري إعادة التوجيه...',
          loginSuccessful: 'تم تسجيل الدخول بنجاح',
          loginFailed: 'فشل تسجيل الدخول',
          tryAgain: 'حاول مرة أخرى',
          contactSupport: 'اتصل بالدعم',
          returnToLogin: 'العودة إلى صفحة تسجيل الدخول',
          processingRequest: 'جاري معالجة طلبك...',
          secureConnection: 'اتصال آمن',
          privacyNotice: 'إشعار الخصوصية',
          termsOfUse: 'شروط الاستخدام'
        },
        
        bookingConfirmation: {
          title: 'Booking Confirmation',
          confirmationMessage: 'Your booking has been confirmed',
          bookingDetails: 'Booking Details',
          sessionType: 'Session Type',
          date: 'Date',
          time: 'Time',
          duration: 'Duration',
          coach: 'Coach',
          location: 'Location',
          virtualMeeting: 'Virtual Meeting',
          paymentDetails: 'Payment Details',
          addToCalendar: 'Add to Calendar',
          viewBooking: 'View Booking',
          cancelBooking: 'Cancel Booking',
          rescheduleBooking: 'Reschedule Booking',
          prepareForSession: 'Prepare for Session',
          bookingReference: 'Booking Reference',
          successAlert: 'Booking confirmed successfully! Your booking reference is',
          confirmationTitle: 'Booking Confirmed!',
          successMessage: 'has been successfully booked. You\'ll receive a confirmation email shortly.',
          bookingNumber: 'Booking Number',
          downloadReceipt: 'Download Receipt',
          backToCoaches: 'Back to Coaches',
          whatsNext: 'What\'s Next?',
          nextSteps: 'You will receive a confirmation email with all the details of your booking. Your coach will connect with you via video call at the scheduled time.',
          prepareInstructions: 'Please prepare any specific questions or topics you\'d like to discuss during your session. You can view all your bookings and manage them from your dashboard.',
          viewUpcomingBookings: 'View Your Upcoming Bookings',
          minutes: 'minutes',
          at: 'at'
        },
        
        packageConfirmation: {
          title: 'تأكيد الباقة',
          confirmationMessage: 'تم تأكيد الشراء',
          'Purchase Confirmed!': 'تم تأكيد الشراء!',
          thankYou: 'شكرًا لك على شراء باقة {{title}}. لقد تم معالجة طلبك بنجاح.',
          'Thank you for purchasing the {{title}} package. Your order has been successfully processed.': 'شكرًا لك على شراء باقة {{title}}. لقد تم معالجة طلبك بنجاح.',
          orderId: 'رقم الطلب',
          packageDetails: 'تفاصيل الباقة',
          packageName: 'اسم الباقة',
          packageContents: 'محتويات الباقة',
          active: 'نشط',
          sessions: 'الجلسات',
          duration: 'المدة',
          whatsIncluded: 'ما هو مشمول:',
          orderSummary: 'ملخص الطلب',
          package: 'الباقة',
          purchaseDate: 'تاريخ الشراء',
          status: 'الحالة',
          totalAmount: 'المبلغ الإجمالي',
          AED: 'درهم',
          printReceipt: 'طباعة الإيصال',
          downloadReceipt: 'تنزيل الإيصال',
          bookSession: 'حجز جلسة',
          viewLearningPaths: 'عرض مسارات التعلم',
          backToCoaches: 'العودة إلى المدربين',
          receiptDownloaded: 'تم تنزيل الإيصال بنجاح',
          purchaseConfirmed: 'تم تأكيد الشراء!',
          packageBenefits: 'فوائد الباقة'
        },
        
        calendarView: {
          title: 'عرض التقويم',
          today: 'اليوم',
          day: 'يوم',
          week: 'أسبوع',
          month: 'شهر',
          agenda: 'جدول الأعمال',
          addEvent: 'إضافة حدث',
          editEvent: 'تعديل الحدث',
          deleteEvent: 'حذف الحدث',
          eventDetails: 'تفاصيل الحدث',
          allDay: 'طوال اليوم',
          recurringEvent: 'حدث متكرر',
          reminder: 'تذكير',
          location: 'الموقع',
          participants: 'المشاركون',
          description: 'الوصف',
          eventCategories: 'فئات الأحداث',
          filterView: 'تصفية العرض',
          exportCalendar: 'تصدير التقويم'
        },
        
        resumeAnalysis: {
          title: 'تحليل السيرة الذاتية',
          overallScore: 'الدرجة الإجمالية',
          keywordMatch: 'تطابق الكلمات الرئيسية',
          contentQuality: 'جودة المحتوى',
          formatting: 'التنسيق',
          improvement: 'تحسين',
          improvementAreas: 'مجالات التحسين',
          strengths: 'نقاط القوة',
          suggestedChanges: 'التغييرات المقترحة',
          applyChanges: 'تطبيق التغييرات',
          beforeAfter: 'قبل وبعد',
          jobSpecificAnalysis: 'تحليل خاص بالوظيفة',
          atsCompatibility: 'توافق نظام تتبع المتقدمين',
          compareWithIndustry: 'مقارنة مع الصناعة',
          downloadAnalysis: 'تنزيل التحليل'
        },
        
        resuneScoreTracker: {
          title: 'متتبع درجة السيرة الذاتية',
          currentScore: 'الدرجة الحالية',
          scoreHistory: 'سجل الدرجات',
          improvementTrend: 'اتجاه التحسين',
          lastUpdate: 'آخر تحديث',
          targetScore: 'الدرجة المستهدفة',
          topImprovements: 'أهم التحسينات',
          criticalIssues: 'المشكلات الحرجة',
          compareVersions: 'مقارنة الإصدارات',
          industryBenchmark: 'معيار الصناعة',
          scoringFactors: 'عوامل التقييم',
          nextSteps: 'الخطوات التالية',
          resumeOptimization: 'تحسين السيرة الذاتية',
          setGoals: 'تحديد الأهداف'
        },
        
        jobSearchDashboard: {
          title: 'لوحة معلومات البحث عن وظيفة',
          activeApplications: 'الطلبات النشطة',
          applicationStatus: 'حالة الطلب',
          savedJobs: 'الوظائف المحفوظة',
          recentSearches: 'عمليات البحث الأخيرة',
          jobAlerts: 'تنبيهات الوظائف',
          applicationDeadlines: 'مواعيد نهائية للتقديم',
          interviewSchedule: 'جدول المقابلات',
          jobMarketInsights: 'رؤى سوق العمل',
          applicationTracking: 'تتبع الطلب',
          searchPreferences: 'تفضيلات البحث',
          quickActions: 'إجراءات سريعة',
          jobRecommendations: 'توصيات الوظائف',
          salary: 'الراتب',
          location: 'الموقع',
          companyType: 'نوع الشركة'
        },
        
        adminPanel: {
          title: 'لوحة الإدارة',
          userManagement: 'إدارة المستخدمين',
          contentManagement: 'إدارة المحتوى',
          systemSettings: 'إعدادات النظام',
          analytics: 'التحليلات',
          reports: 'التقارير',
          securitySettings: 'إعدادات الأمان',
          backupRestore: 'النسخ الاحتياطي والاستعادة',
          logFiles: 'ملفات السجل',
          userRoles: 'أدوار المستخدمين',
          permissions: 'الأذونات',
          notifications: 'الإشعارات',
          integrations: 'التكاملات',
          apiSettings: 'إعدادات واجهة برمجة التطبيقات',
          supportManagement: 'إدارة الدعم'
        },
        
        forgotPassword: {
          title: 'نسيت كلمة المرور',
          instructions: 'أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور',
          email: 'البريد الإلكتروني',
          submit: 'إرسال',
          checkEmail: 'تحقق من بريدك الإلكتروني',
          emailSent: 'تم إرسال رابط إعادة تعيين كلمة المرور',
          notReceived: 'لم تتلق البريد الإلكتروني؟',
          resend: 'إعادة الإرسال',
          returnToLogin: 'العودة إلى تسجيل الدخول',
          resetPassword: 'إعادة تعيين كلمة المرور',
          newPassword: 'كلمة مرور جديدة',
          confirmPassword: 'تأكيد كلمة المرور',
          success: 'تم إعادة تعيين كلمة المرور بنجاح'
        },
        
        personalityProfile: {
          title: 'ملف الشخصية',
          personalityType: 'نوع الشخصية',
          traits: 'السمات',
          strengths: 'نقاط القوة',
          challenges: 'التحديات',
          workStyle: 'أسلوب العمل',
          careerPathSuitability: 'ملاءمة المسار المهني',
          communicationStyle: 'أسلوب التواصل',
          teamDynamics: 'ديناميكيات الفريق',
          leadershipStyle: 'أسلوب القيادة',
          stressManagement: 'إدارة الضغط',
          personalGrowth: 'النمو الشخصي',
          takeAssessment: 'إجراء التقييم',
          viewFullProfile: 'عرض الملف الكامل',
          shareProfile: 'مشاركة الملف'
        },
        
        // Profile Completion
        profileCompletion: {
          title: 'إكمال الملف الشخصي',
          completionStatus: 'حالة الإكمال',
          incompleteFields: 'الحقول غير المكتملة',
          requiredFields: 'الحقول المطلوبة',
          optionalFields: 'الحقول الاختيارية',
          profileStrength: 'قوة الملف الشخصي',
          weak: 'ضعيف',
          average: 'متوسط',
          strong: 'قوي',
          excellent: 'ممتاز',
          completionTips: 'نصائح الإكمال',
          enhanceProfile: 'تحسين الملف الشخصي',
          missingInfo: 'المعلومات المفقودة',
          lastUpdated: 'آخر تحديث',
          updateNow: 'تحديث الآن',
          completeYourProfile: 'أكمل ملفك الشخصي',
          profileIsComplete: 'ملفك الشخصي مكتمل بنسبة',
          completeToUnlock: 'أكمل ملفك الشخصي لفتح جميع الميزات وتحسين مطابقة الوظائف',
          progress: 'التقدم',
          justStarted: 'بدأت للتو!',
          makingGoodProgress: 'تحرز تقدمًا جيدًا!',
          almostThere: 'أصبحت قريبًا!',
          complete: 'مكتمل!',
          enhanceYourProfile: 'يرجى إكمال المعلومات التالية لتعزيز ملفك الشخصي:',
          lastName: 'اسم العائلة',
          emailAddress: 'البريد الإلكتروني',
          requiredForMatching: 'مطلوب للمطابقة المثلى للوظائف',
          helpAccurateRecommendations: 'يساعد الملف الشخصي المكتمل في تقديم توصيات وظيفية أكثر دقة ويزيد من ظهورك لدى أصحاب العمل المحتملين.',
          remindMeLater: 'ذكرني لاحقًا',
          completeProfileNow: 'أكمل الملف الشخصي الآن',
          updating: 'جاري التحديث...'
        },
        
        // Resume Expert
        resumeExpert: {
          title: 'خبير السيرة الذاتية',
          aiPowered: 'مدعوم بالذكاء الاصطناعي',
          enhanceJobSearch: 'عزز بحثك عن وظيفة بأدوات السيرة الذاتية المدعومة بالذكاء الاصطناعي',
          whyComplete: 'لماذا تكمل سيرتك الذاتية؟',
          optimizedResume: 'تزيد السيرة الذاتية المحسنة بشكل كبير من فرصك في جذب انتباه أصحاب العمل والحصول على الوظيفة المثالية. يستخدم خبير السيرة الذاتية لدينا الذكاء الاصطناعي المتقدم لمساعدتك في إنشاء سيرة ذاتية متميزة مصممة لأهداف حياتك المهنية.',
          jobSpecificOptimization: 'تحسين خاص بالوظيفة',
          customizeResume: 'خصص سيرتك الذاتية للوظائف المحددة وزد من فرصك',
          aiPoweredAnalysis: 'تحليل السيرة الذاتية بالذكاء الاصطناعي',
          instantFeedback: 'احصل على تعليقات فورية على سيرتك الذاتية باستخدام أداة التحليل بالذكاء الاصطناعي',
          skillsEnhancement: 'اقتراحات تحسين المهارات',
          discoverSkills: 'اكتشف المهارات التي ستجعل سيرتك الذاتية بارزة لأصحاب العمل',
          atsCompatibility: 'درجة التوافق مع ATS',
          ensureResumePasses: 'تأكد من أن سيرتك الذاتية تمر عبر أنظمة تتبع المتقدمين',
          whatYouGet: 'ما الذي ستحصل عليه',
          atsFriendlyFormats: 'تنسيقات سيرة ذاتية احترافية متوافقة مع ATS',
          designedForImpact: 'مصممة لتحقيق أقصى تأثير وسهولة القراءة',
          contentOptimization: 'اقتراحات تحسين المحتوى',
          powerfulLanguage: 'تحسينات لغوية قوية لتأثير أفضل',
          realtimeScoring: 'التقييم والتحليل في الوقت الفعلي',
          trackImprovement: 'تتبع تحسين سيرتك الذاتية باستخدام نظام التقييم لدينا',
          tailoredRecommendations: 'توصيات مخصصة',
          industrySpecificAdvice: 'نصائح خاصة بالصناعة بناءً على أهداف حياتك المهنية',
          buildMyResumeNow: 'أنشئ سيرتي الذاتية الآن',
          maybeLater: 'ربما لاحقًا'
        },
        
        // Leaderboard component will be defined in the AR section
        
        // Job skills translations for job listings
        skills: {
          // Technical skills
          "React": "رياكت",
          "Node.js": "نود جي إس",
          "TypeScript": "تايب سكريبت",
          "JavaScript": "جافا سكريبت",
          "AWS": "أمازون ويب سيرفيسز",
          "Python": "بايثون",
          "Machine Learning": "تعلم الآلة",
          "SQL": "لغة الاستعلام المهيكلة",
          "Deep Learning": "التعلم العميق",
          "Docker": "دوكر",
          "Kubernetes": "كوبرنيتس",
          "CI/CD": "التكامل والتسليم المستمر",
          "Terraform": "تيرافورم",
          "ETL": "استخراج وتحويل وتحميل",
          "Hadoop": "هادوب",
          "Spark": "سبارك",
          "NoSQL": "نو إس كيو إل",
          "HTML5": "إتش تي إم إل 5",
          "CSS3": "سي إس إس 3",
          "SASS": "ساس",
          "UI Animation": "رسوم متحركة للواجهة",
          "Excel": "إكسل",
          "Power BI": "باور بي آي",
          "Data Visualization": "تصور البيانات",
          "Statistical Analysis": "التحليل الإحصائي",
          "Figma": "فيجما",
          "Adobe XD": "أدوبي إكس دي",
          "Sketch": "سكيتش",
          "User Research": "أبحاث المستخدم",
          "Prototyping": "النمذجة الأولية",
          "Design Systems": "أنظمة التصميم",
          "AutoCAD": "أوتوكاد",
          "Revit": "ريفيت",
          "3D Modeling": "النمذجة ثلاثية الأبعاد",
          "Construction Documentation": "توثيق البناء",
          
          // Common job requirements phrases
          "Develop and maintain web applications": "تطوير وصيانة تطبيقات الويب",
          "Write clean, maintainable and efficient code": "كتابة كود نظيف وقابل للصيانة وفعّال",
          "Collaborate with cross-functional teams": "التعاون مع فرق متعددة التخصصات",
          "Participate in code reviews and technical discussions": "المشاركة في مراجعات الكود والمناقشات التقنية",
          "5+ years of experience in software development": "5+ سنوات من الخبرة في تطوير البرمجيات",
          "Bachelor's degree in Computer Science or related field": "بكالوريوس في علوم الكمبيوتر أو مجال ذي صلة",
          "Strong problem-solving skills": "مهارات قوية في حل المشكلات",
          "Excellent communication skills": "مهارات اتصال ممتازة",
          "Experience with agile development methodologies": "خبرة في منهجيات التطوير أجايل",
          "Knowledge of best practices and design patterns": "معرفة بأفضل الممارسات وأنماط التصميم",
          "Ability to work independently and as part of a team": "القدرة على العمل بشكل مستقل وكجزء من فريق",
          "Strong attention to detail": "اهتمام قوي بالتفاصيل",
          "Experience with version control systems (Git)": "خبرة في أنظمة التحكم بالإصدارات (جيت)",
          "Knowledge of front-end technologies": "معرفة بتقنيات الواجهة الأمامية",
          "Experience with database design and management": "خبرة في تصميم وإدارة قواعد البيانات",
          "Understanding of security best practices": "فهم لأفضل ممارسات الأمان",
          "Experience with cloud platforms": "خبرة في منصات السحابة",
          "Ability to mentor junior developers": "القدرة على إرشاد المطورين المبتدئين",
          "Previous experience in a similar role": "خبرة سابقة في دور مماثل",
          "Familiarity with continuous integration": "إلمام بالتكامل المستمر",
          "Create responsive designs": "إنشاء تصاميم متجاوبة",
          "Optimize applications for performance": "تحسين التطبيقات للأداء",
          "Build reusable code and libraries": "بناء كود ومكتبات قابلة لإعادة الاستخدام",
          "Implement security and data protection": "تنفيذ الأمان وحماية البيانات",
          "Troubleshoot and debug applications": "استكشاف الأخطاء وتصحيحها في التطبيقات",
          "Collaborate with designers": "التعاون مع المصممين",
          "Communicate effectively with stakeholders": "التواصل بفعالية مع أصحاب المصلحة",
          "Stay up-to-date with emerging trends": "البقاء على اطلاع بالاتجاهات الناشئة",
          "Manage team members": "إدارة أعضاء الفريق",
          "Create project plans": "إنشاء خطط المشاريع",
          "Monitor project progress": "مراقبة تقدم المشروع",
          "Allocate resources effectively": "تخصيص الموارد بفعالية",
          "Ensure timely delivery": "ضمان التسليم في الوقت المناسب",
          "Conduct risk assessment": "إجراء تقييم المخاطر",
          "Manage client relationships": "إدارة علاقات العملاء",
          
          // Management skills
          "Project Management": "إدارة المشاريع",
          "Construction": "البناء",
          "Stakeholder Management": "إدارة أصحاب المصلحة",
          "Operations Management": "إدارة العمليات",
          "Supply Chain": "سلسلة التوريد",
          "Team Leadership": "قيادة الفريق",
          "HR Management": "إدارة الموارد البشرية",
          "Recruitment": "التوظيف",
          "Employee Relations": "علاقات الموظفين",
          "HR Policies": "سياسات الموارد البشرية",
          "Product Management": "إدارة المنتج",
          "Agile Methodology": "منهجية أجايل",
          "User Experience": "تجربة المستخدم",
          "Analytics": "التحليلات",
          "Sales Strategy": "استراتيجية المبيعات",
          "Hospitality": "الضيافة",
          "Digital Marketing": "التسويق الرقمي",
          "Social Media": "وسائل التواصل الاجتماعي",
          "Content Strategy": "استراتيجية المحتوى",
          "Financial Modeling": "النمذجة المالية",
          "Business Development": "تطوير الأعمال",
          "Sales": "المبيعات",
          "Retail": "البيع بالتجزئة",
          "Strategy": "الاستراتيجية",
          
          // Domain specific
          "Construction Management": "إدارة البناء",
          "Project Planning": "تخطيط المشاريع",
          "SEO": "تحسين محركات البحث",
          "SEM": "التسويق عبر محركات البحث",
          "Social Media Marketing": "التسويق عبر وسائل التواصل الاجتماعي",
          "Content Creation": "إنشاء المحتوى",
          "Network Security": "أمن الشبكات",
          "Threat Analysis": "تحليل التهديدات",
          "SIEM": "إدارة أحداث وأمن المعلومات",
          "Penetration Testing": "اختبار الاختراق",
          "Corporate Law": "القانون التجاري",
          "Banking Regulation": "اللوائح المصرفية",
          "Contract Negotiation": "التفاوض على العقود",
          "Supply Chain Management": "إدارة سلسلة التوريد",
          "Logistics": "الخدمات اللوجستية",
          "Inventory Control": "مراقبة المخزون",
          "Research Methods": "أساليب البحث",
          "Data Analysis": "تحليل البيانات",
          "Academic Writing": "الكتابة الأكاديمية",
          "PhD": "دكتوراه",
          "Arabic": "العربية",
          "English": "الإنجليزية",
          "Translation": "الترجمة",
          "Media": "الإعلام",
          "Hospitality Management": "إدارة الضيافة",
          "Customer Service": "خدمة العملاء",
          "Revenue Management": "إدارة الإيرادات",
          "Reservoir Engineering": "هندسة الخزانات",
          "Drilling Operations": "عمليات الحفر",
          "Production Optimization": "تحسين الإنتاج",
          "Healthcare Administration": "إدارة الرعاية الصحية",
          "Medical Leadership": "القيادة الطبية",
          "Clinical Excellence": "التميز السريري",
          "Commercial Pilot License": "رخصة طيار تجاري",
          "Multi-engine Rating": "تصنيف متعدد المحركات",
          "Flight Experience": "خبرة الطيران",
          "Culinary Arts": "فنون الطهي",
          "Menu Development": "تطوير القائمة",
          "Kitchen Management": "إدارة المطبخ"
        },
        
        // My Bookings
        myBookings: {
          title: 'My Bookings',
          bookSession: 'Book a Session',
          findMoreCoaches: 'Find More Coaches',
          noBookingsYet: "You don't have any bookings yet",
          browseCoaches: 'Browse our interview coaches and book your first session!',
          upcoming: 'Upcoming',
          past: 'Past',
          paymentHistory: 'Payment History',
          refreshBookings: 'Refresh bookings',
          bookingsRefreshed: 'Bookings refreshed',
          noUpcomingBookings: "You don't have any upcoming bookings.",
          noPastBookings: "You don't have any past bookings.",
          viewAllPayments: 'View all your payments for coaching sessions and packages',
          noPaymentHistory: "You don't have any payment history."
        }
      }
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
      'Purchase Confirmed!': 'تم تأكيد الشراء!',
      'Thank you for purchasing the {{title}} package. Your order has been successfully processed.': 'شكرًا لك على شراء باقة {{title}}. لقد تم معالجة طلبك بنجاح.',
      
      // Job skills translations
      skills: {
        // Technical skills
        "React": "رياكت",
        "Node.js": "نود جي إس",
        "TypeScript": "تايب سكريبت",
        "JavaScript": "جافا سكريبت",
        "AWS": "أمازون ويب سيرفيسز",
        "Python": "بايثون",
        "Machine Learning": "تعلم الآلة",
        "SQL": "لغة الاستعلام المهيكلة",
        "Deep Learning": "التعلم العميق",
        "Docker": "دوكر",
        "Kubernetes": "كوبرنيتس",
        "CI/CD": "التكامل والتسليم المستمر",
        "Terraform": "تيرافورم",
        "ETL": "استخراج وتحويل وتحميل",
        "Hadoop": "هادوب",
        "Spark": "سبارك",
        "NoSQL": "نو إس كيو إل",
        "HTML5": "إتش تي إم إل 5",
        "CSS3": "سي إس إس 3",
        "SASS": "ساس",
        "UI Animation": "رسوم متحركة للواجهة",
        "Excel": "إكسل",
        "Power BI": "باور بي آي",
        "Data Visualization": "تصور البيانات",
        "Statistical Analysis": "التحليل الإحصائي",
        "Figma": "فيجما",
        "Adobe XD": "أدوبي إكس دي",
        "Sketch": "سكيتش",
        "User Research": "أبحاث المستخدم",
        "Prototyping": "النمذجة الأولية",
        "Design Systems": "أنظمة التصميم",
        "AutoCAD": "أوتوكاد",
        "Revit": "ريفيت",
        "3D Modeling": "النمذجة ثلاثية الأبعاد",
        "Construction Documentation": "توثيق البناء",
        
        // Common job requirements phrases
        "Develop and maintain web applications": "تطوير وصيانة تطبيقات الويب",
        "Write clean, maintainable and efficient code": "كتابة كود نظيف وقابل للصيانة وفعّال",
        "Collaborate with cross-functional teams": "التعاون مع فرق متعددة التخصصات",
        "Participate in code reviews and technical discussions": "المشاركة في مراجعات الكود والمناقشات التقنية",
        "5+ years of experience in software development": "5+ سنوات من الخبرة في تطوير البرمجيات",
        "Bachelor's degree in Computer Science or related field": "بكالوريوس في علوم الكمبيوتر أو مجال ذي صلة",
        "Strong problem-solving skills": "مهارات قوية في حل المشكلات",
        "Excellent communication skills": "مهارات اتصال ممتازة",
        "Experience with agile development methodologies": "خبرة في منهجيات التطوير أجايل",
        "Knowledge of best practices and design patterns": "معرفة بأفضل الممارسات وأنماط التصميم",
        "Ability to work independently and as part of a team": "القدرة على العمل بشكل مستقل وكجزء من فريق",
        "Strong attention to detail": "اهتمام قوي بالتفاصيل",
        "Experience with version control systems (Git)": "خبرة في أنظمة التحكم بالإصدارات (جيت)",
        "Knowledge of front-end technologies": "معرفة بتقنيات الواجهة الأمامية",
        "Experience with database design and management": "خبرة في تصميم وإدارة قواعد البيانات",
        "Understanding of security best practices": "فهم لأفضل ممارسات الأمان",
        "Experience with cloud platforms": "خبرة في منصات السحابة",
        "Ability to mentor junior developers": "القدرة على إرشاد المطورين المبتدئين",
        "Previous experience in a similar role": "خبرة سابقة في دور مماثل",
        "Familiarity with continuous integration": "إلمام بالتكامل المستمر",
        "Create responsive designs": "إنشاء تصاميم متجاوبة",
        "Optimize applications for performance": "تحسين التطبيقات للأداء",
        "Build reusable code and libraries": "بناء كود ومكتبات قابلة لإعادة الاستخدام",
        "Implement security and data protection": "تنفيذ الأمان وحماية البيانات",
        "Troubleshoot and debug applications": "استكشاف الأخطاء وتصحيحها في التطبيقات",
        "Collaborate with designers": "التعاون مع المصممين",
        "Communicate effectively with stakeholders": "التواصل بفعالية مع أصحاب المصلحة",
        "Stay up-to-date with emerging trends": "البقاء على اطلاع بالاتجاهات الناشئة",
        "Manage team members": "إدارة أعضاء الفريق",
        "Create project plans": "إنشاء خطط المشاريع",
        "Monitor project progress": "مراقبة تقدم المشروع",
        "Allocate resources effectively": "تخصيص الموارد بفعالية",
        "Ensure timely delivery": "ضمان التسليم في الوقت المناسب",
        "Conduct risk assessment": "إجراء تقييم المخاطر",
        "Manage client relationships": "إدارة علاقات العملاء",
        
        // Management skills
        "Project Management": "إدارة المشاريع",
        "Construction": "البناء",
        "Stakeholder Management": "إدارة أصحاب المصلحة",
        "Operations Management": "إدارة العمليات",
        "Supply Chain": "سلسلة التوريد",
        "Team Leadership": "قيادة الفريق",
        "HR Management": "إدارة الموارد البشرية",
        "Recruitment": "التوظيف",
        "Employee Relations": "علاقات الموظفين",
        "HR Policies": "سياسات الموارد البشرية",
        "Product Management": "إدارة المنتج",
        "Agile Methodology": "منهجية أجايل",
        "User Experience": "تجربة المستخدم",
        "Analytics": "التحليلات",
        "Sales Strategy": "استراتيجية المبيعات",
        "Hospitality": "الضيافة",
        "Digital Marketing": "التسويق الرقمي",
        "Social Media": "وسائل التواصل الاجتماعي",
        "Content Strategy": "استراتيجية المحتوى",
        "Financial Modeling": "النمذجة المالية",
        "Business Development": "تطوير الأعمال",
        "Sales": "المبيعات",
        "Retail": "البيع بالتجزئة",
        "Strategy": "الاستراتيجية",
        
        // Domain specific
        "Construction Management": "إدارة البناء",
        "Project Planning": "تخطيط المشاريع",
        "SEO": "تحسين محركات البحث",
        "SEM": "التسويق عبر محركات البحث",
        "Social Media Marketing": "التسويق عبر وسائل التواصل الاجتماعي",
        "Content Creation": "إنشاء المحتوى",
        "Network Security": "أمن الشبكات",
        "Threat Analysis": "تحليل التهديدات",
        "SIEM": "إدارة أحداث وأمن المعلومات",
        "Penetration Testing": "اختبار الاختراق",
        "Corporate Law": "القانون التجاري",
        "Banking Regulation": "اللوائح المصرفية",
        "Contract Negotiation": "التفاوض على العقود",
        "Supply Chain Management": "إدارة سلسلة التوريد",
        "Logistics": "الخدمات اللوجستية",
        "Inventory Control": "مراقبة المخزون",
        "Research Methods": "أساليب البحث",
        "Data Analysis": "تحليل البيانات",
        "Academic Writing": "الكتابة الأكاديمية",
        "PhD": "دكتوراه",
        "Arabic": "العربية",
        "English": "الإنجليزية",
        "Translation": "الترجمة",
        "Media": "الإعلام",
        "Hospitality Management": "إدارة الضيافة",
        "Customer Service": "خدمة العملاء",
        "Revenue Management": "إدارة الإيرادات",
        "Reservoir Engineering": "هندسة الخزانات",
        "Drilling Operations": "عمليات الحفر",
        "Production Optimization": "تحسين الإنتاج",
        "Healthcare Administration": "إدارة الرعاية الصحية",
        "Medical Leadership": "القيادة الطبية",
        "Clinical Excellence": "التميز السريري",
        "Commercial Pilot License": "رخصة طيار تجاري",
        "Multi-engine Rating": "تصنيف متعدد المحركات",
        "Flight Experience": "خبرة الطيران",
        "Culinary Arts": "فنون الطهي",
        "Menu Development": "تطوير القائمة",
        "Kitchen Management": "إدارة المطبخ"
      },
      
      // Dashboard
      dashboard: {
        title: 'لوحة المعلومات',
        yourCareerDashboard: 'لوحة معلومات المسار المهني',
        welcomeBack: 'مرحبًا بعودتك،',
        buildMyResume: 'أنشئ سيرتي الذاتية',
        refreshDashboard: 'تحديث لوحة المعلومات',
        resetLayout: 'إعادة ضبط التخطيط',
        goalsAchieved: 'الأهداف المحققة',
        careerPoints: 'نقاط المسار المهني',
        topSkillsProgress: 'تقدم أهم المهارات',
        resumeProfileSection: {
          resume: 'السيرة الذاتية',
          profile: 'الملف الشخصي',
          improve: 'تحسين'
        },
        stats: {
          totalApplied: 'إجمالي التقديمات',
          rejected: 'مرفوض',
          onHold: 'قيد الانتظار',
          applications: 'طلبات التوظيف',
          weeks: 'أسابيع'
        },
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
          learningRoadmap: 'خريطة التعلم',
          calendar: 'التقويم',
          todoList: 'قائمة المهام',
          careerLeaderboard: 'لوحة المتصدرين المهنية',
          resumeAtsScore: 'تقييم السيرة الذاتية ATS',
          todoList: 'قائمة المهام',
          calendar: 'التقويم',
          addEvent: 'إضافة حدث',
          eventTitle: 'عنوان الحدث',
          eventType: 'نوع الحدث',
          meeting: 'اجتماع',
          task: 'مهمة',
          interview: 'مقابلة',
          course: 'دورة',
          cancel: 'إلغاء',
          add: 'إضافة',
          upcoming: 'قادم',
          noEvents: 'لا توجد أحداث مجدولة'
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
        },
        resumeAlert: {
          needsAttention: 'سيرتك الذاتية تحتاج اهتمامك!',
          completeResume: 'أكمل سيرتك الذاتية لزيادة ظهورك لأصحاب العمل المحتملين'
        },
        userLevel: {
          beginner: 'مبتدئ',
          level: 'مستوى',
          completeProfile: 'أكمل ملفك الشخصي لرؤية معلم المسار المهني التالي'
        },
        todoWidget: {
          addTask: 'إضافة مهمة...',
          updateResume: 'تحديث السيرة الذاتية',
          completed: 'مكتمل',
          uncompleted: 'غير مكتمل'
        },
        leaderboardWidget: {
          joinLeaderboard: 'انضم إلى لوحة المتصدرين!',
          completeTasks: 'أكمل المهام لكسب النقاط وتأمين ترتيبك',
          startEarningPoints: 'ابدأ بكسب النقاط',
          members: 'الأعضاء',
          pointsToNextLevel: 'النقاط للمرحلة التالية'
        },
        skillsProfile: {
          latestAssessment: 'أحدث تقييم:'
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
        logout: 'تسجيل الخروج',
        automationLinkedin: 'أتمتة لينكد إن',
        aiRecommendations: 'توصيات الذكاء الاصطناعي',
        resumeScore: 'تقييم السيرة الذاتية'
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
        firstResume: 'السيرة الذاتية الأولى',
        yourProgress: 'تقدمك',
        xpToNextLevel: 'نقاط الخبرة للمستوى التالي',
        skillsProgress: 'تقدم المهارات',
        technical: 'تقنية',
        communication: 'تواصل',
        leadership: 'قيادة',
        currentGoals: 'الأهداف الحالية',
        upcomingMilestones: 'المراحل القادمة',
        goalsAchieved: 'الأهداف المحققة',
        careerPoints: 'نقاط المسار المهني',
        beginnerLevel: 'مبتدئ - المستوى 1',
        completeProfile: 'أكمل ملفك الشخصي لرؤية معلم المسار المهني التالي',
        topSkillsProgress: 'تقدم أهم المهارات',
        improve: 'تحسين'
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
        darkMode: 'الوضع الداكن',
        viewDetails: 'عرض التفاصيل',
        errorLoading: 'خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى.',
        showMore: 'عرض المزيد',
        showLess: 'عرض أقل',
        refresh: 'تحديث',
        howToEarn: 'كيفية الكسب',
        benefits: 'الفوائد'
      },
      
      // Resume ATS Score
      resumeAtsScore: {
        title: 'تقييم السيرة الذاتية ATS',
        latest: 'آخر تقييم',
        avg: 'المتوسط',
        lowMatch: 'تطابق منخفض. سيرتك الذاتية تحتاج تعديلات كبيرة لهذا الدور.',
        adjustments: 'تعديلات',
        significantAdjustments: 'تعديلات كبيرة',
        role: 'الدور',
        keywordMatches: 'تطابق الكلمات الرئيسية',
        needsWork: 'يحتاج إلى عمل',
        improvement: 'تحسين'
      },
      
      // Skills Profile
      skillsProfile: {
        latestAssessment: 'أحدث تقييم:',
        problemSolving: 'حل المشكلات',
        skillsProfile: 'ملف المهارات',
        score: 'الدرجة',
        of: 'من',
        correct: 'صحيح',
        skillLevel: 'مستوى المهارة',
        strengths: 'نقاط القوة',
        areasForImprovement: 'مجالات للتحسين',
        problem: 'مشكلة',
        solving: 'حل',
        optimization: 'تحسين',
        techniques: 'تقنيات',
        tech: 'تقنية',
        algorithms: 'خوارزميات'
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
        low: 'منخفض',
        regionData: 'بيانات المناطق',
        skillDemand: 'الطلب على المهارات',
        trends: 'الاتجاهات',
        trendPredictions: 'توقعات الاتجاهات',
        yourInsights: 'رؤاك الشخصية',
        topRegions: 'أهم المناطق',
        upcomingSkills: 'المهارات القادمة',
        companiesHiring: 'الشركات التي توظف',
        skillExpiryAlert: 'تنبيه انتهاء صلاحية المهارات',
        monthlyTrend: 'الاتجاه الشهري',
        risingSectors: 'القطاعات الصاعدة',
        decliningSkills: 'المهارات المتراجعة',
        companiesWithOpportunities: 'الشركات ذات الفرص',
        obsoleteSkills: 'المهارات المتقادمة',
        recommendations: 'التوصيات',
        skillsTabs: {
          inDemand: 'مطلوبة',
          emerging: 'ناشئة',
          declining: 'متراجعة'
        },
        personalizedInsights: 'رؤى مخصصة لك',
        demand: 'الطلب',
        competitionMetric: 'مقياس المنافسة',
        actions: 'الإجراءات'
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
      },
      
      // Career Prediction component
      careerPrediction: {
        title: 'توقعات المسار المهني',
        currentRole: 'المنصب الحالي',
        experience: 'الخبرة',
        aiPowered: 'توقعات مسار وظيفي مدعومة بالذكاء الاصطناعي بناءً على مهاراتك وخبرتك واتجاهات الصناعة.',
        skillImpactSimulator: 'محاكاة تأثير المهارات',
        selectSkillToModify: 'حدد المهارة للتعديل',
        skillLevel: 'مستوى المهارة',
        simulate: 'محاكاة',
        addNewSkill: 'إضافة مهارة جديدة',
        reset: 'إعادة تعيين',
        showingCareerPathSimulation: 'عرض محاكاة المسار المهني بعد',
        improving: 'تحسين',
        changing: 'تغيير',
        yourSkill: 'مهارتك',
        in: 'في',
        toLevel: 'إلى المستوى',
        impactOnCareerFactors: 'التأثير على عوامل الوظيفة',
        newCareerPredictions: 'توقعات المسار المهني الجديدة',
        yourPredictedCareerPath: 'مسارك المهني المتوقع',
        addNewSkillDescription: 'أضف مهارة جديدة لمعرفة تأثيرها على توقعات حياتك المهنية.',
        selectASkill: 'اختر مهارة',
        initialSkillLevel: 'مستوى المهارة الأولي',
        cancel: 'إلغاء',
        addAndSimulate: 'إضافة ومحاكاة',
        whatIfSimulator: 'جرب محاكي "ماذا لو؟" لمعرفة كيف يؤثر تغيير مهاراتك على مسارك المهني',
        predictions: 'التوقعات',
        confidence: 'مستوى الثقة',
        potentialRoles: 'الأدوار المحتملة',
        salaryPotential: 'إمكانية الراتب',
        timeToAchieve: 'الوقت اللازم للتحقيق',
        demandLevel: 'مستوى الطلب',
        simulationMode: 'وضع المحاكاة',
        matchingYourProfile: 'مطابقة ملفك الشخصي',
        skillsNeeded: 'المهارات المطلوبة',
        years: 'سنوات'
      },
      
      // Skill Transition component
      skillTransition: {
        title: 'انتقال المهارات',
        latestAssessment: 'أحدث تقييم',
        score: 'النتيجة',
        strengths: 'نقاط القوة',
        areasForImprovement: 'مجالات للتحسين',
        skillsProfile: 'ملف المهارات',
        noAssessmentData: 'لا توجد بيانات تقييم متاحة بعد',
        completeAssessment: 'أكمل تقييم المهارات لترى نتائجك هنا',
        correct: 'صحيح',
        problemSolving: 'حل المشكلات',
        technicalKnowledge: 'المعرفة التقنية',
        optimizationTechniques: 'تقنيات التحسين',
        advancedAlgorithms: 'خوارزميات متقدمة',
        skillLevel: 'مستوى المهارة'
      },
      
      // Skill Gap component
      skillGap: {
        title: 'تحليل فجوة المهارات',
        targetRole: 'المنصب المستهدف',
        currentRole: 'المنصب الحالي',
        latestAssessmentTitle: 'أحدث تقييم',
        score: 'النتيجة',
        skillsProfile: 'ملف المهارات',
        strengths: 'نقاط القوة',
        areasForImprovement: 'مجالات للتحسين'
      },
      
      // AI Recommendation component
      aiRecommendation: {
        title: 'توصيات الذكاء الاصطناعي',
        personalizedForYou: 'مخصصة لك',
        type: 'النوع',
        aiExplanation: 'شرح الذكاء الاصطناعي',
        chatWithAI: 'الدردشة مع مساعد الذكاء الاصطناعي',
        localDeepSeek: 'ديب سيك المحلي',
        cloudAI: 'ذكاء اصطناعي سحابي',
        hideChat: 'إخفاء الدردشة',
        writeMessage: 'اكتب رسالة...',
        send: 'إرسال',
        refresh: 'تحديث التوصية',
        recommendationTypes: {
          course: 'دورة تدريبية',
          job: 'وظيفة',
          skill: 'مهارة',
          networking: 'تواصل',
          project: 'مشروع'
        },
        aiThinking: 'جاري تفكير الذكاء الاصطناعي...',
        tryAgain: 'حاول مرة أخرى',
        learnMore: 'معرفة المزيد',
        viewResource: 'عرض المورد',
        whyRecommended: 'لماذا تم التوصية بهذا؟',
        benefits: 'الفوائد',
        estimatedTimeToComplete: 'الوقت المقدر للإكمال',
        difficulty: 'مستوى الصعوبة',
        beginner: 'مبتدئ',
        intermediate: 'متوسط',
        advanced: 'متقدم'
      },
      
      // Activity Log component
      activityLog: {
        title: 'النشاطات الأخيرة',
        activitySummary: 'ملخص النشاط',
        mostActiveOn: 'كنت أكثر نشاطًا في',
        with: 'مع',
        activities: 'نشاطات',
        mostCommonActivity: 'نشاطك الأكثر شيوعًا كان',
        applyingTo: '، متقدماً إلى',
        jobs: 'وظائف',
        activitiesThisWeek: 'نشاطات هذا الأسبوع',
        searchActivities: 'بحث في النشاطات...',
        activityType: 'نوع النشاط',
        allActivities: 'كل النشاطات',
        resumeUpdates: 'تحديثات السيرة الذاتية',
        jobApplications: 'طلبات الوظائف',
        mockInterviews: 'المقابلات التجريبية',
        assessments: 'التقييمات',
        networking: 'التواصل',
        learning: 'التعلم',
        timeRange: 'الفترة الزمنية',
        allTime: 'كل الوقت',
        today: 'اليوم',
        thisWeek: 'هذا الأسبوع',
        thisMonth: 'هذا الشهر',
        noActivitiesFound: 'لم يتم العثور على نشاطات تطابق تصفيتك',
        clearAllFilters: 'مسح جميع الفلاتر',
        showingActivities: 'عرض',
        clearFilters: 'مسح الفلاتر',
        viewFullHistory: 'عرض السجل الكامل',
        viewDetails: 'عرض التفاصيل',
        removeFromLog: 'إزالة من السجل',
        noActivities: 'لا توجد نشاطات حديثة لعرضها'
      },
      
      // Emirati Journey Map component
      emiratiJourneyMap: {
        title: 'خريطة رحلة الإماراتي',
        careerPath: 'المسار الوظيفي',
        currentPosition: 'المنصب الحالي',
        nextMilestone: 'المعلم التالي',
        keySkills: 'المهارات الرئيسية',
        timeframe: 'الإطار الزمني',
        achieved: 'تم تحقيقه',
        inProgress: 'قيد التقدم',
        upcoming: 'قادم',
        viewFullJourney: 'عرض الرحلة الكاملة',
        milestones: 'معالم',
        challenges: 'تحديات',
        opportunities: 'فرص',
        shortTerm: 'قصير المدى',
        mediumTerm: 'متوسط المدى',
        longTerm: 'طويل المدى'
      },
      
      // Opportunity Alert component
      opportunityAlerts: {
        title: 'تنبيهات الفرص',
        noOpportunities: 'لا توجد بيانات فرص متاحة',
        apply: 'تقديم',
        applyNow: 'تقديم الآن',
        matchingSkills: 'المهارات المتطابقة',
        via: 'عبر',
        deadline: 'الموعد النهائي',
        closesIn: 'يغلق في',
        days: 'أيام',
        day: 'يوم',
        match: 'تطابق',
        salary: 'الراتب',
        location: 'الموقع',
        type: 'النوع',
        save: 'حفظ',
        dismiss: 'تجاهل',
        next: 'التالي'
      },
      
      // Leaderboard component
      leaderboard: {
        title: 'لوحة المتصدرين',
        careerLeaderboard: 'لوحة المتصدرين المهنية',
        yourRank: 'ترتيبك',
        topPercentile: 'أعلى {percentile}%',
        careerPoints: 'نقاط المسار المهني',
        nextMilestone: 'التالي: {next_milestone}',
        joinLeaderboard: 'انضم إلى لوحة المتصدرين!',
        completeTasks: 'أكمل المهام لكسب النقاط وتأمين ترتيبك',
        startEarningPoints: 'ابدأ بكسب النقاط',
        pointsToNextMilestone: 'النقاط للمرحلة التالية',
        topPerformers: 'أفضل المؤدين',
        friendsComparison: 'مقارنة الأصدقاء',
        you: 'أنت',
        friend: 'صديق',
        teamMember: 'عضو الفريق',
        viewFullLeaderboard: 'عرض لوحة المتصدرين الكاملة',
        skillProgress: 'تقدم المهارة',
        jobSuccess: 'نجاح الوظيفة',
        badges: 'الشارات',
        level: 'المستوى',
        points: 'نقاط',
        members: 'أعضاء',
        pts: 'نقاط'
      },
      
      // Dashboard Report component
      dashboardReport: {
        title: 'تقرير لوحة المعلومات',
        exportDescription: 'تصدير تقرير تقدم حياتك المهنية لمشاركته مع الموجهين أو أصحاب العمل.',
        previewInsights: 'معاينة رؤى الذكاء الاصطناعي',
        previewInsightsButton: 'معاينة الرؤى',
        exportReport: 'تصدير التقرير',
        availableSections: 'أقسام التقرير المتاحة',
        configureReport: 'تكوين تصدير التقرير',
        selectSections: 'حدد الأقسام المطلوب تضمينها في تقريرك:'
      },
      
      // Leaderboard Widget
      leaderboardWidget: {
        title: 'لوحة المتصدرين',
        rank: 'التصنيف',
        user: 'المستخدم',
        score: 'النتيجة',
        progress: 'التقدم',
        skillsAcquired: 'المهارات المكتسبة',
        achievements: 'الإنجازات',
        yourRank: 'تصنيفك',
        viewAll: 'عرض الكل',
        weekly: 'أسبوعي',
        monthly: 'شهري',
        allTime: 'كل الوقت',
        points: 'نقاط',
        congratulations: 'تهانينا',
        keepGoing: 'استمر',
        almostThere: 'أنت تقترب'
      },
      
      // Dashboard Report Exporter
      dashboardReportExporter: {
        title: 'مصدر تقارير لوحة القيادة',
        exportAs: 'تصدير كـ',
        generateReport: 'إنشاء تقرير',
        selectPeriod: 'اختر الفترة',
        includeSections: 'تضمين الأقسام',
        format: 'التنسيق',
        pdf: 'PDF',
        excel: 'Excel',
        csv: 'CSV',
        json: 'JSON',
        lastWeek: 'الأسبوع الماضي',
        lastMonth: 'الشهر الماضي',
        lastQuarter: 'الربع الماضي',
        customRange: 'نطاق مخصص',
        downloading: 'جاري التنزيل',
        reportGenerated: 'تم إنشاء التقرير',
        selectAll: 'اختر الكل',
        deselectAll: 'إلغاء تحديد الكل'
      },
      
      // AI Feedback System
      aiFeedbackSystem: {
        title: 'نظام التغذية الراجعة الذكي',
        yourFeedback: 'ملاحظاتك',
        aiAnalysis: 'تحليل الذكاء الاصطناعي',
        improvementAreas: 'مجالات التحسين',
        strengths: 'نقاط القوة',
        suggestions: 'اقتراحات',
        submitFeedback: 'إرسال الملاحظات',
        feedbackHistory: 'سجل الملاحظات',
        recentFeedback: 'ملاحظات حديثة',
        feedbackType: 'نوع الملاحظات',
        resume: 'السيرة الذاتية',
        interview: 'المقابلة',
        application: 'الطلب',
        skill: 'المهارة',
        general: 'عام',
        progressTracking: 'تتبع التقدم',
        comparePreviousFeedback: 'مقارنة مع الملاحظات السابقة'
      },
      
      // Career Path Visualizer
      careerPathVisualizer: {
        title: 'العارض المرئي للمسار المهني',
        currentPosition: 'المنصب الحالي',
        potentialPaths: 'المسارات المحتملة',
        skillsRequired: 'المهارات المطلوبة',
        timeToTransition: 'وقت الانتقال',
        salaryRange: 'نطاق الراتب',
        demandForecast: 'توقعات الطلب',
        zoomIn: 'تكبير',
        zoomOut: 'تصغير',
        resetView: 'إعادة ضبط العرض',
        showDetails: 'إظهار التفاصيل',
        hideDetails: 'إخفاء التفاصيل',
        exportVisualization: 'تصدير العرض المرئي',
        compareRoles: 'مقارنة الأدوار'
      },
      
      // CV Builder
      cvBuilder: {
        title: 'منشئ السيرة الذاتية',
        personalInfo: 'المعلومات الشخصية',
        experience: 'الخبرة',
        education: 'التعليم',
        skills: 'المهارات',
        languages: 'اللغات',
        certifications: 'الشهادات',
        projects: 'المشاريع',
        references: 'المراجع',
        addSection: 'إضافة قسم',
        removeSection: 'إزالة قسم',
        exportAs: 'تصدير كـ',
        templates: 'القوالب',
        aiSuggestions: 'اقتراحات الذكاء الاصطناعي',
        enhanceCV: 'تحسين السيرة الذاتية',
        preview: 'معاينة',
        download: 'تحميل',
        saveTemplate: 'حفظ القالب'
      },
      
      // Data Visualization
      dataVisualization: {
        title: 'العرض المرئي للبيانات',
        filters: 'التصفيات',
        timeRange: 'الفترة الزمنية',
        categories: 'الفئات',
        dataSource: 'مصدر البيانات',
        chartType: 'نوع الرسم البياني',
        barChart: 'رسم بياني شريطي',
        lineChart: 'رسم بياني خطي',
        pieChart: 'رسم بياني دائري',
        radarChart: 'رسم بياني راداري',
        exportData: 'تصدير البيانات',
        refreshData: 'تحديث البيانات',
        dataInsights: 'رؤى البيانات',
        compareWith: 'مقارنة مع',
        lastPeriod: 'الفترة السابقة',
        showLabels: 'إظهار التسميات',
        hideLabels: 'إخفاء التسميات'
      },
      
      // Industry Trend Analyzer
      industryTrendAnalyzer: {
        title: 'محلل اتجاهات الصناعة',
        trendAnalysis: 'تحليل الاتجاهات',
        industryGrowth: 'نمو الصناعة',
        emergingRoles: 'الأدوار الناشئة',
        decliningRoles: 'الأدوار المتراجعة',
        skillDemandShift: 'تحول الطلب على المهارات',
        regionalVariations: 'الاختلافات الإقليمية',
        salaryTrends: 'اتجاهات الرواتب',
        futureOutlook: 'النظرة المستقبلية',
        dataUpdateFrequency: 'تكرار تحديث البيانات',
        sourceReliability: 'موثوقية المصدر',
        compareIndustries: 'مقارنة الصناعات',
        showForecast: 'عرض التوقعات',
        timePeriod: 'الفترة الزمنية'
      },
      
      // Job Application Tracker
      jobApplicationTracker: {
        title: 'متتبع طلبات الوظائف',
        applicationStatus: 'حالة الطلب',
        applied: 'تم التقديم',
        screening: 'الفرز',
        interview: 'المقابلة',
        offer: 'العرض',
        rejected: 'مرفوض',
        accepted: 'مقبول',
        onHold: 'معلق',
        addApplication: 'إضافة طلب',
        editApplication: 'تعديل الطلب',
        deleteApplication: 'حذف الطلب',
        company: 'الشركة',
        position: 'المنصب',
        appliedDate: 'تاريخ التقديم',
        notes: 'ملاحظات',
        nextSteps: 'الخطوات التالية',
        reminderSet: 'تم ضبط التذكير',
        contacts: 'جهات الاتصال',
        documents: 'المستندات'
      },
      
      // Mentor Match
      mentorMatch: {
        title: 'مطابقة المرشد',
        findMentor: 'البحث عن مرشد',
        becomeMentor: 'كن مرشدًا',
        mentorMatches: 'تطابقات المرشد',
        matchScore: 'درجة التطابق',
        industry: 'الصناعة',
        expertise: 'الخبرة',
        yearsOfExperience: 'سنوات الخبرة',
        availabilityHours: 'ساعات التوفر',
        contactMentor: 'التواصل مع المرشد',
        scheduleMeeting: 'جدولة اجتماع',
        mentorshipGoals: 'أهداف الإرشاد',
        previousMentors: 'المرشدون السابقون',
        feedbackRating: 'تقييم التغذية الراجعة',
        recommendMentor: 'توصية مرشد',
        mentorshipPlan: 'خطة الإرشاد'
      },
      
      // Mock Interview
      mockInterview: {
        title: 'المقابلة التجريبية',
        startInterview: 'بدء المقابلة',
        difficulty: 'مستوى الصعوبة',
        easy: 'سهل',
        medium: 'متوسط',
        hard: 'صعب',
        expert: 'خبير',
        duration: 'المدة',
        minutes: 'دقائق',
        jobRole: 'الدور الوظيفي',
        questionType: 'نوع السؤال',
        technical: 'تقني',
        behavioral: 'سلوكي',
        situational: 'موقفي',
        companySpecific: 'خاص بالشركة',
        recordInterview: 'تسجيل المقابلة',
        reviewRecording: 'مراجعة التسجيل',
        aiAnalysis: 'تحليل الذكاء الاصطناعي',
        feedbackSummary: 'ملخص التغذية الراجعة',
        practiceMore: 'تدرب أكثر'
      },
      
      // Networking Assistant
      networkingAssistant: {
        title: 'مساعد التواصل',
        connections: 'الاتصالات',
        suggestedContacts: 'جهات اتصال مقترحة',
        recentInteractions: 'التفاعلات الأخيرة',
        upcomingEvents: 'الفعاليات القادمة',
        connectionStrength: 'قوة الاتصال',
        weak: 'ضعيف',
        moderate: 'متوسط',
        strong: 'قوي',
        addConnection: 'إضافة اتصال',
        scheduleFollowUp: 'جدولة متابعة',
        networkGrowth: 'نمو الشبكة',
        industryConnections: 'اتصالات الصناعة',
        exportContacts: 'تصدير جهات الاتصال',
        importFromLinkedIn: 'استيراد من لينكد إن',
        reminderSettings: 'إعدادات التذكير'
      },
      
      // Personal Development Plan
      personalDevelopmentPlan: {
        title: 'خطة التطوير الشخصي',
        shortTermGoals: 'أهداف قصيرة المدى',
        mediumTermGoals: 'أهداف متوسطة المدى',
        longTermGoals: 'أهداف طويلة المدى',
        addGoal: 'إضافة هدف',
        editGoal: 'تعديل الهدف',
        deleteGoal: 'حذف الهدف',
        goalStatus: 'حالة الهدف',
        notStarted: 'لم يبدأ',
        inProgress: 'قيد التقدم',
        completed: 'مكتمل',
        deadline: 'الموعد النهائي',
        requiredResources: 'الموارد المطلوبة',
        skillsToAcquire: 'المهارات المطلوب اكتسابها',
        milestones: 'المعالم',
        trackProgress: 'تتبع التقدم',
        reviewPlan: 'مراجعة الخطة'
      },
      
      // Profile Completion
      profileCompletion: {
        title: 'إكمال الملف الشخصي',
        completionStatus: 'حالة الإكمال',
        incompleteFields: 'الحقول غير المكتملة',
        requiredFields: 'الحقول المطلوبة',
        optionalFields: 'الحقول الاختيارية',
        profileStrength: 'قوة الملف الشخصي',
        weak: 'ضعيف',
        average: 'متوسط',
        strong: 'قوي',
        excellent: 'ممتاز',
        completionTips: 'نصائح الإكمال',
        enhanceProfile: 'تحسين الملف الشخصي',
        missingInfo: 'المعلومات المفقودة',
        lastUpdated: 'آخر تحديث',
        updateNow: 'تحديث الآن',
        completeYourProfile: 'أكمل ملفك الشخصي',
        profileIsComplete: 'ملفك الشخصي مكتمل بنسبة',
        completeToUnlock: 'أكمل ملفك الشخصي لفتح جميع الميزات وتحسين مطابقة الوظائف',
        progress: 'التقدم',
        justStarted: 'بدأت للتو!',
        makingGoodProgress: 'تحرز تقدمًا جيدًا!',
        almostThere: 'أصبحت قريبًا!',
        complete: 'مكتمل!',
        enhanceYourProfile: 'يرجى إكمال المعلومات التالية لتعزيز ملفك الشخصي:',
        lastName: 'اسم العائلة',
        emailAddress: 'البريد الإلكتروني',
        requiredForMatching: 'مطلوب للمطابقة المثلى للوظائف',
        helpAccurateRecommendations: 'يساعد الملف الشخصي المكتمل في تقديم توصيات وظيفية أكثر دقة ويزيد من ظهورك لدى أصحاب العمل المحتملين.',
        remindMeLater: 'ذكرني لاحقًا',
        completeProfileNow: 'أكمل الملف الشخصي الآن',
        updating: 'جاري التحديث...'
      },
      
      // Skill Assessment
      skillAssessment: {
        title: 'تقييم المهارات',
        startAssessment: 'بدء التقييم',
        skillCategory: 'فئة المهارة',
        assessmentDuration: 'مدة التقييم',
        questions: 'الأسئلة',
        difficultyLevel: 'مستوى الصعوبة',
        selfAssessment: 'التقييم الذاتي',
        expertAssessment: 'تقييم الخبير',
        aiEvaluation: 'تقييم الذكاء الاصطناعي',
        skillScore: 'درجة المهارة',
        improvementAreas: 'مجالات التحسين',
        recommendedResources: 'الموارد الموصى بها',
        technicalSkills: 'المهارات التقنية',
        softSkills: 'المهارات الناعمة',
        resume: 'استئناف',
        certifySkill: 'توثيق المهارة'
      },
      
      // Word Cloud Visualizer
      wordCloudVisualizer: {
        title: 'العارض المرئي للكلمات',
        frequentSkills: 'المهارات المتكررة',
        keywordDensity: 'كثافة الكلمات الرئيسية',
        industryTerms: 'مصطلحات الصناعة',
        resumeKeywords: 'الكلمات الرئيسية للسيرة الذاتية',
        jobDescriptionMatch: 'مطابقة وصف الوظيفة',
        filterKeywords: 'تصفية الكلمات الرئيسية',
        showCommonWords: 'إظهار الكلمات الشائعة',
        hideCommonWords: 'إخفاء الكلمات الشائعة',
        exportCloud: 'تصدير السحابة',
        regenerate: 'إعادة إنشاء',
        colorScheme: 'نظام الألوان',
        focusArea: 'مجال التركيز',
        comparisonMode: 'وضع المقارنة'
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
        myBookings: {
          title: 'حجوزاتي',
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
        
        coachProfile: {
          title: 'ملف المدرب',
          about: 'نبذة عن',
          expertise: 'الخبرة',
          experience: 'الخبرة',
          education: 'التعليم',
          certifications: 'الشهادات',
          languages: 'اللغات',
          rating: 'التقييم',
          reviews: 'المراجعات',
          sessionTypes: 'أنواع الجلسات',
          availability: 'التوفر',
          bookSession: 'حجز جلسة',
          contactCoach: 'التواصل مع المدرب',
          coachingStyle: 'أسلوب التدريب',
          pricing: 'التسعير',
          viewAllReviews: 'عرض جميع المراجعات',
          leaveReview: 'ترك مراجعة'
        },
        
        gamifiedProgress: {
          title: 'التقدم المحفز',
          level: 'المستوى',
          experience: 'الخبرة',
          achievements: 'الإنجازات',
          badges: 'الشارات',
          challenges: 'التحديات',
          rewards: 'المكافآت',
          leaderboard: 'لوحة المتصدرين',
          streak: 'السلسلة',
          dailyGoals: 'الأهداف اليومية',
          weeklyGoals: 'الأهداف الأسبوعية',
          milestones: 'المعالم',
          unlocked: 'مفتوح',
          locked: 'مقفل',
          progressTracking: 'تتبع التقدم',
          challengeProgress: 'تقدم التحدي',
          collectReward: 'جمع المكافأة',
          nextLevel: 'المستوى التالي'
        },
        
        interviewResults: {
          title: 'نتائج المقابلة',
          overallScore: 'الدرجة الإجمالية',
          detailedFeedback: 'التغذية الراجعة المفصلة',
          strengths: 'نقاط القوة',
          areasForImprovement: 'مجالات التحسين',
          transcript: 'النص',
          videoReplay: 'إعادة تشغيل الفيديو',
          aiAnalysis: 'تحليل الذكاء الاصطناعي',
          keyInsights: 'الرؤى الرئيسية',
          compareWithPrevious: 'المقارنة مع المقابلات السابقة',
          exportResults: 'تصدير النتائج',
          nextSteps: 'الخطوات التالية',
          practiceMore: 'ممارسة المزيد',
          viewSuggestions: 'عرض الاقتراحات',
          shareResults: 'مشاركة النتائج'
        },
        
        aiInterviewCoach: {
          title: 'مدرب مقابلة الذكاء الاصطناعي',
          startSession: 'بدء الجلسة',
          chooseIndustry: 'اختيار الصناعة',
          chooseDifficulty: 'اختيار مستوى الصعوبة',
          interviewTips: 'نصائح المقابلة',
          commonQuestions: 'الأسئلة الشائعة',
          practiceAnswers: 'إجابات الممارسة',
          realTimeAnalysis: 'تحليل في الوقت الحقيقي',
          bodylanguageTips: 'نصائح لغة الجسد',
          voiceToneFeedback: 'تعليقات نبرة الصوت',
          interviewSimulation: 'محاكاة المقابلة',
          personalizedCoaching: 'تدريب مخصص',
          saveProgress: 'حفظ التقدم',
          endSession: 'إنهاء الجلسة'
        },
        
        allInterviewCoach: {
          title: 'جميع مدربي المقابلة',
          browseCoaches: 'تصفح المدربين',
          filterCoaches: 'تصفية المدربين',
          specialization: 'التخصص',
          availability: 'التوفر',
          price: 'السعر',
          rating: 'التقييم',
          language: 'اللغة',
          experience: 'الخبرة',
          bookSession: 'حجز جلسة',
          viewProfile: 'عرض الملف الشخصي',
          compareCoaches: 'مقارنة المدربين',
          featuredCoaches: 'المدربون المميزون',
          newCoaches: 'المدربون الجدد',
          mostPopular: 'الأكثر شعبية'
        },
        
        checkout: {
          title: 'الدفع',
          orderSummary: 'ملخص الطلب',
          paymentDetails: 'تفاصيل الدفع',
          billingAddress: 'عنوان الفواتير',
          paymentMethod: 'طريقة الدفع',
          creditCard: 'بطاقة الائتمان',
          paypal: 'باي بال',
          applePay: 'آبل باي',
          googlePay: 'جوجل باي',
          subtotal: 'المجموع الفرعي',
          tax: 'الضريبة',
          discount: 'الخصم',
          total: 'المجموع',
          promoCode: 'رمز ترويجي',
          apply: 'تطبيق',
          placeOrder: 'إتمام الطلب',
          secureCheckout: 'الدفع الآمن',
          termsAndConditions: 'الشروط والأحكام'
        },
        
        startupPitch: {
          title: 'عرض الشركة الناشئة',
          createPitch: 'إنشاء عرض',
          pitchElements: 'عناصر العرض',
          problemStatement: 'بيان المشكلة',
          solution: 'الحل',
          marketOpportunity: 'فرصة السوق',
          businessModel: 'نموذج العمل',
          competitiveLandscape: 'المشهد التنافسي',
          teamIntroduction: 'تقديم الفريق',
          financialProjections: 'التوقعات المالية',
          fundingRequirements: 'متطلبات التمويل',
          previewPitch: 'معاينة العرض',
          saveDraft: 'حفظ المسودة',
          submitPitch: 'تقديم العرض',
          getPitchFeedback: 'الحصول على تعليقات حول العرض'
        },
        
        applicationTips: {
          title: 'نصائح التقديم',
          resumeTips: 'نصائح السيرة الذاتية',
          coverLetterGuidance: 'إرشادات خطاب التغطية',
          interviewPreparation: 'التحضير للمقابلة',
          followUpStrategies: 'استراتيجيات المتابعة',
          commonMistakes: 'الأخطاء الشائعة',
          industrySpeicicTips: 'نصائح خاصة بالصناعة',
          expertAdvice: 'نصائح الخبراء',
          successStories: 'قصص النجاح',
          doAndDonts: 'ما يجب وما لا يجب فعله',
          resourceLibrary: 'مكتبة الموارد',
          latestTrends: 'أحدث الاتجاهات',
          personalizationTips: 'نصائح التخصيص'
        },
        
        coverLetter: {
          title: 'خطاب التغطية',
          createNew: 'إنشاء جديد',
          templates: 'القوالب',
          savedDrafts: 'المسودات المحفوظة',
          recentlyUsed: 'المستخدمة مؤخرًا',
          addSection: 'إضافة قسم',
          previewLetter: 'معاينة الخطاب',
          downloadLetter: 'تنزيل الخطاب',
          shareLettervia: 'مشاركة الخطاب عبر',
          aiSuggestions: 'اقتراحات الذكاء الاصطناعي',
          customizeLetter: 'تخصيص الخطاب',
          selectFormat: 'اختيار التنسيق',
          matchWithResume: 'مطابقة مع السيرة الذاتية',
          jobSpecificLetter: 'خطاب خاص بالوظيفة'
        },
        
        taskManager: {
          title: 'مدير المهام',
          myTasks: 'مهامي',
          addTask: 'إضافة مهمة',
          editTask: 'تعديل المهمة',
          deleteTask: 'حذف المهمة',
          taskPriority: 'أولوية المهمة',
          dueDate: 'تاريخ الاستحقاق',
          taskStatus: 'حالة المهمة',
          taskCategories: 'فئات المهام',
          completedTasks: 'المهام المكتملة',
          pendingTasks: 'المهام المعلقة',
          searchTasks: 'البحث في المهام',
          filterTasks: 'تصفية المهام',
          sortTasks: 'ترتيب المهام',
          taskDetails: 'تفاصيل المهمة',
          subtasks: 'المهام الفرعية',
          taskReminders: 'تذكيرات المهمة'
        },
        
        walkthroughTour: {
          title: 'جولة تعريفية',
          getStarted: 'البدء',
          skipTour: 'تخطي الجولة',
          nextStep: 'الخطوة التالية',
          previousStep: 'الخطوة السابقة',
          finishTour: 'إنهاء الجولة',
          welcomeMessage: 'رسالة الترحيب',
          dashboardOverview: 'نظرة عامة على لوحة المعلومات',
          keyFeatures: 'الميزات الرئيسية',
          navigationHelp: 'مساعدة التنقل',
          settingPreferences: 'إعداد التفضيلات',
          additionalResources: 'موارد إضافية',
          needHelp: 'بحاجة إلى مساعدة؟',
          tourProgress: 'تقدم الجولة',
          stepComplete: 'اكتملت الخطوة'
        },
        
        // Final pages
        uaePassLogin: {
          title: 'تسجيل الدخول باستخدام UAE Pass',
          connecting: 'جاري الاتصال...',
          authenticating: 'جاري المصادقة...',
          redirecting: 'جاري إعادة التوجيه...',
          loginSuccessful: 'تم تسجيل الدخول بنجاح',
          loginFailed: 'فشل تسجيل الدخول',
          tryAgain: 'حاول مرة أخرى',
          contactSupport: 'اتصل بالدعم',
          returnToLogin: 'العودة إلى صفحة تسجيل الدخول',
          processingRequest: 'جاري معالجة طلبك...',
          secureConnection: 'اتصال آمن',
          privacyNotice: 'إشعار الخصوصية',
          termsOfUse: 'شروط الاستخدام'
        },
        
        bookingConfirmation: {
          title: 'Booking Confirmation',
          confirmationMessage: 'Your booking has been confirmed',
          bookingDetails: 'Booking Details',
          sessionType: 'Session Type',
          date: 'Date',
          time: 'Time',
          duration: 'Duration',
          coach: 'Coach',
          location: 'Location',
          virtualMeeting: 'Virtual Meeting',
          paymentDetails: 'Payment Details',
          addToCalendar: 'Add to Calendar',
          viewBooking: 'View Booking',
          cancelBooking: 'Cancel Booking',
          rescheduleBooking: 'Reschedule Booking',
          prepareForSession: 'Prepare for Session',
          bookingReference: 'Booking Reference',
          successAlert: 'Booking confirmed successfully! Your booking reference is',
          confirmationTitle: 'Booking Confirmed!',
          successMessage: 'has been successfully booked. You\'ll receive a confirmation email shortly.',
          bookingNumber: 'Booking Number',
          downloadReceipt: 'Download Receipt',
          backToCoaches: 'Back to Coaches',
          whatsNext: 'What\'s Next?',
          nextSteps: 'You will receive a confirmation email with all the details of your booking. Your coach will connect with you via video call at the scheduled time.',
          prepareInstructions: 'Please prepare any specific questions or topics you\'d like to discuss during your session. You can view all your bookings and manage them from your dashboard.',
          viewUpcomingBookings: 'View Your Upcoming Bookings',
          minutes: 'minutes',
          at: 'at'
        },
        
        packageConfirmation: {
          title: 'Package Confirmation',
          confirmationMessage: 'Purchase Confirmed',
          'Purchase Confirmed!': 'Purchase Confirmed!',
          thankYou: 'Thank you for purchasing the {{title}} package. Your order has been successfully processed.',
          'Thank you for purchasing the {{title}} package. Your order has been successfully processed.': 'Thank you for purchasing the {{title}} package. Your order has been successfully processed.',
          orderId: 'Order ID',
          packageDetails: 'Package Details',
          packageName: 'Package Name',
          packageContents: 'Package Contents',
          active: 'Active',
          sessions: 'Sessions',
          duration: 'Duration',
          whatsIncluded: 'What\'s included:',
          orderSummary: 'Order Summary',
          package: 'Package',
          purchaseDate: 'Purchase Date',
          status: 'Status',
          totalAmount: 'Total Amount',
          AED: 'AED',
          printReceipt: 'Print Receipt',
          downloadReceipt: 'Download Receipt',
          bookSession: 'Book a Session',
          viewLearningPaths: 'View Learning Paths',
          backToCoaches: 'Back to Coaches',
          receiptDownloaded: 'Receipt downloaded successfully',
          purchaseConfirmed: 'Purchase Confirmed!',
          packageBenefits: 'Package Benefits'
        },
        
        calendarView: {
          title: 'عرض التقويم',
          today: 'اليوم',
          day: 'يوم',
          week: 'أسبوع',
          month: 'شهر',
          agenda: 'جدول الأعمال',
          addEvent: 'إضافة حدث',
          editEvent: 'تعديل الحدث',
          deleteEvent: 'حذف الحدث',
          eventDetails: 'تفاصيل الحدث',
          allDay: 'طوال اليوم',
          recurringEvent: 'حدث متكرر',
          reminder: 'تذكير',
          location: 'الموقع',
          participants: 'المشاركون',
          description: 'الوصف',
          eventCategories: 'فئات الأحداث',
          filterView: 'تصفية العرض',
          exportCalendar: 'تصدير التقويم'
        },
        
        resumeAnalysis: {
          title: 'تحليل السيرة الذاتية',
          overallScore: 'الدرجة الإجمالية',
          keywordMatch: 'تطابق الكلمات الرئيسية',
          contentQuality: 'جودة المحتوى',
          formatting: 'التنسيق',
          improvement: 'تحسين',
          improvementAreas: 'مجالات التحسين',
          strengths: 'نقاط القوة',
          suggestedChanges: 'التغييرات المقترحة',
          applyChanges: 'تطبيق التغييرات',
          beforeAfter: 'قبل وبعد',
          jobSpecificAnalysis: 'تحليل خاص بالوظيفة',
          atsCompatibility: 'توافق نظام تتبع المتقدمين',
          compareWithIndustry: 'مقارنة مع الصناعة',
          downloadAnalysis: 'تنزيل التحليل'
        },
        
        resuneScoreTracker: {
          title: 'متتبع درجة السيرة الذاتية',
          currentScore: 'الدرجة الحالية',
          scoreHistory: 'سجل الدرجات',
          improvementTrend: 'اتجاه التحسين',
          lastUpdate: 'آخر تحديث',
          targetScore: 'الدرجة المستهدفة',
          topImprovements: 'أهم التحسينات',
          criticalIssues: 'المشكلات الحرجة',
          compareVersions: 'مقارنة الإصدارات',
          industryBenchmark: 'معيار الصناعة',
          scoringFactors: 'عوامل التقييم',
          nextSteps: 'الخطوات التالية',
          resumeOptimization: 'تحسين السيرة الذاتية',
          setGoals: 'تحديد الأهداف'
        },
        
        jobSearchDashboard: {
          title: 'لوحة معلومات البحث عن وظيفة',
          activeApplications: 'الطلبات النشطة',
          applicationStatus: 'حالة الطلب',
          savedJobs: 'الوظائف المحفوظة',
          recentSearches: 'عمليات البحث الأخيرة',
          jobAlerts: 'تنبيهات الوظائف',
          applicationDeadlines: 'مواعيد نهائية للتقديم',
          interviewSchedule: 'جدول المقابلات',
          jobMarketInsights: 'رؤى سوق العمل',
          applicationTracking: 'تتبع الطلب',
          searchPreferences: 'تفضيلات البحث',
          quickActions: 'إجراءات سريعة',
          jobRecommendations: 'توصيات الوظائف',
          salary: 'الراتب',
          location: 'الموقع',
          companyType: 'نوع الشركة'
        },
        
        adminPanel: {
          title: 'لوحة الإدارة',
          userManagement: 'إدارة المستخدمين',
          contentManagement: 'إدارة المحتوى',
          systemSettings: 'إعدادات النظام',
          analytics: 'التحليلات',
          reports: 'التقارير',
          securitySettings: 'إعدادات الأمان',
          backupRestore: 'النسخ الاحتياطي والاستعادة',
          logFiles: 'ملفات السجل',
          userRoles: 'أدوار المستخدمين',
          permissions: 'الأذونات',
          notifications: 'الإشعارات',
          integrations: 'التكاملات',
          apiSettings: 'إعدادات واجهة برمجة التطبيقات',
          supportManagement: 'إدارة الدعم'
        },
        
        forgotPassword: {
          title: 'نسيت كلمة المرور',
          instructions: 'أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور',
          email: 'البريد الإلكتروني',
          submit: 'إرسال',
          checkEmail: 'تحقق من بريدك الإلكتروني',
          emailSent: 'تم إرسال رابط إعادة تعيين كلمة المرور',
          notReceived: 'لم تتلق البريد الإلكتروني؟',
          resend: 'إعادة الإرسال',
          returnToLogin: 'العودة إلى تسجيل الدخول',
          resetPassword: 'إعادة تعيين كلمة المرور',
          newPassword: 'كلمة مرور جديدة',
          confirmPassword: 'تأكيد كلمة المرور',
          success: 'تم إعادة تعيين كلمة المرور بنجاح'
        },
        
        personalityProfile: {
          title: 'ملف الشخصية',
          personalityType: 'نوع الشخصية',
          traits: 'السمات',
          strengths: 'نقاط القوة',
          challenges: 'التحديات',
          workStyle: 'أسلوب العمل',
          careerPathSuitability: 'ملاءمة المسار المهني',
          communicationStyle: 'أسلوب التواصل',
          teamDynamics: 'ديناميكيات الفريق',
          leadershipStyle: 'أسلوب القيادة',
          stressManagement: 'إدارة الضغط',
          personalGrowth: 'النمو الشخصي',
          takeAssessment: 'إجراء التقييم',
          viewFullProfile: 'عرض الملف الكامل',
          shareProfile: 'مشاركة الملف'
        },
        
        // Calendar Component
        calendarComponent: {
          title: 'التقويم',
          addEvent: 'إضافة حدث',
          eventTitle: 'عنوان الحدث',
          eventType: 'نوع الحدث',
          meeting: 'اجتماع',
          task: 'مهمة',
          interview: 'مقابلة',
          course: 'دورة',
          cancel: 'إلغاء',
          add: 'إضافة حدث',
          noEvents: 'لا توجد أحداث مجدولة',
          upcoming: 'الأحداث القادمة',
          today: 'اليوم',
          tomorrow: 'غداً',
          addNewEvent: 'إضافة حدث جديد'
        },
        
        // Todo List Component
        todoListComponent: {
          title: 'قائمة المهام',
          addTask: 'إضافة مهمة...',
          noTasks: 'لا توجد مهام لليوم. أضف مهمة للبدء.',
          startPomodoro: 'بدء بوموردو',
          delete: 'حذف',
          completed: 'مكتمل',
          uncompleted: 'غير مكتمل',
          feedback: 'تعليق',
          workTime: 'وقت العمل',
          breakTime: 'وقت الاستراحة',
          me: 'أنا',
          taskTitle1: 'نشر الموقع على خادم الاستضافة التطويرية',
          taskTitle2: 'مراجعة والتعليق على تصميم الموقع',
          taskTitle3: 'إصلاح جميع الأخطاء التي أبلغ عنها الفريق',
          taskTitle4: 'إعداد ملفات التصميم لمطور الويب'
        },
        
        // Profile Completion
        profileCompletion: {
          title: 'إكمال الملف الشخصي',
          completionStatus: 'حالة الإكمال',
          incompleteFields: 'الحقول غير المكتملة',
          requiredFields: 'الحقول المطلوبة',
          optionalFields: 'الحقول الاختيارية',
          profileStrength: 'قوة الملف الشخصي',
          weak: 'ضعيف',
          average: 'متوسط',
          strong: 'قوي',
          excellent: 'ممتاز',
          completionTips: 'نصائح الإكمال',
          enhanceProfile: 'تحسين الملف الشخصي',
          missingInfo: 'المعلومات المفقودة',
          lastUpdated: 'آخر تحديث',
          updateNow: 'تحديث الآن',
          completeYourProfile: 'أكمل ملفك الشخصي',
          profileIsComplete: 'ملفك الشخصي مكتمل بنسبة',
          completeToUnlock: 'أكمل ملفك الشخصي لفتح جميع الميزات وتحسين مطابقة الوظائف',
          progress: 'التقدم',
          justStarted: 'بدأت للتو!',
          makingGoodProgress: 'تحرز تقدمًا جيدًا!',
          almostThere: 'أصبحت قريبًا!',
          complete: 'مكتمل!',
          enhanceYourProfile: 'يرجى إكمال المعلومات التالية لتعزيز ملفك الشخصي:',
          lastName: 'اسم العائلة',
          emailAddress: 'البريد الإلكتروني',
          requiredForMatching: 'مطلوب للمطابقة المثلى للوظائف',
          helpAccurateRecommendations: 'يساعد الملف الشخصي المكتمل في تقديم توصيات وظيفية أكثر دقة ويزيد من ظهورك لدى أصحاب العمل المحتملين.',
          remindMeLater: 'ذكرني لاحقًا',
          completeProfileNow: 'أكمل الملف الشخصي الآن',
          updating: 'جاري التحديث...'
        },
        
        // Resume Expert
        resumeExpert: {
          title: 'خبير السيرة الذاتية',
          aiPowered: 'مدعوم بالذكاء الاصطناعي',
          enhanceJobSearch: 'عزز بحثك عن وظيفة بأدوات السيرة الذاتية المدعومة بالذكاء الاصطناعي',
          whyComplete: 'لماذا تكمل سيرتك الذاتية؟',
          optimizedResume: 'تزيد السيرة الذاتية المحسنة بشكل كبير من فرصك في جذب انتباه أصحاب العمل والحصول على الوظيفة المثالية. يستخدم خبير السيرة الذاتية لدينا الذكاء الاصطناعي المتقدم لمساعدتك في إنشاء سيرة ذاتية متميزة مصممة لأهداف حياتك المهنية.',
          jobSpecificOptimization: 'تحسين خاص بالوظيفة',
          customizeResume: 'خصص سيرتك الذاتية للوظائف المحددة وزد من فرصك',
          aiPoweredAnalysis: 'تحليل السيرة الذاتية بالذكاء الاصطناعي',
          instantFeedback: 'احصل على تعليقات فورية على سيرتك الذاتية باستخدام أداة التحليل بالذكاء الاصطناعي',
          skillsEnhancement: 'اقتراحات تحسين المهارات',
          discoverSkills: 'اكتشف المهارات التي ستجعل سيرتك الذاتية بارزة لأصحاب العمل',
          atsCompatibility: 'درجة التوافق مع ATS',
          ensureResumePasses: 'تأكد من أن سيرتك الذاتية تمر عبر أنظمة تتبع المتقدمين',
          whatYouGet: 'ما الذي ستحصل عليه',
          atsFriendlyFormats: 'تنسيقات سيرة ذاتية احترافية متوافقة مع ATS',
          designedForImpact: 'مصممة لتحقيق أقصى تأثير وسهولة القراءة',
          contentOptimization: 'اقتراحات تحسين المحتوى',
          powerfulLanguage: 'تحسينات لغوية قوية لتأثير أفضل',
          realtimeScoring: 'التقييم والتحليل في الوقت الفعلي',
          trackImprovement: 'تتبع تحسين سيرتك الذاتية باستخدام نظام التقييم لدينا',
          tailoredRecommendations: 'توصيات مخصصة',
          industrySpecificAdvice: 'نصائح خاصة بالصناعة بناءً على أهداف حياتك المهنية',
          buildMyResumeNow: 'أنشئ سيرتي الذاتية الآن',
          maybeLater: 'ربما لاحقًا'
        },
        
        // My Bookings (Arabic)
        myBookings: {
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