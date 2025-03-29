/**
 * Mock data for the Dashboard component
 * This data simulates API responses for development and testing
 */

const mockDashboardData = {
  // User progress data
  progress: {
    level: 3,
    xp: 750,
    nextLevelXp: 1000,
    rank: "Career Explorer",
    rank_ar: "مستكشف المهنة",
    completedTasks: 24,
    totalTasks: 36,
    skills: {
      main: [
        { name: "JavaScript", name_ar: "جافاسكريبت", level: 75 },
        { name: "React", name_ar: "رياكت", level: 68 },
        { name: "Node.js", name_ar: "نود.جي إس", level: 55 }
      ],
      secondary: [
        { name: "UI/UX Design", name_ar: "تصميم واجهة المستخدم", level: 45 },
        { name: "Project Management", name_ar: "إدارة المشاريع", level: 62 }
      ]
    },
    badges: [
      { id: 1, name: "First Resume", name_ar: "السيرة الذاتية الأولى", icon: "description", earned: true },
      { id: 2, name: "Interview Ready", name_ar: "جاهز للمقابلة", icon: "record_voice_over", earned: true },
      { id: 3, name: "Network Builder", name_ar: "بناء الشبكات", icon: "people", earned: false }
    ]
  },
  
  // Resume score data
  resumeScore: {
    scores: [
      { version: 1, score: 65, date: "2023-01-15" },
      { version: 2, score: 72, date: "2023-02-10" },
      { version: 3, score: 78, date: "2023-03-05" },
      { version: 4, score: 82, date: "2023-04-20" }
    ],
    average_improvement: 5.6,
    latest_score: 82,
    total_versions: 4,
    keywordMatches: [
      { text: "JavaScript", text_ar: "جافاسكريبت", matchScore: 9 },
      { text: "React", text_ar: "رياكت", matchScore: 8 },
      { text: "Frontend", text_ar: "واجهة أمامية", matchScore: 7 },
      { text: "UI/UX", text_ar: "واجهة المستخدم", matchScore: 6 },
      { text: "Responsive", text_ar: "متجاوب", matchScore: 8 },
      { text: "Development", text_ar: "تطوير", matchScore: 7 },
      { text: "Components", text_ar: "مكونات", matchScore: 5 },
      { text: "Web", text_ar: "ويب", matchScore: 6 }
    ],
    missingKeywords: [
      { text: "TypeScript", text_ar: "تايب سكريبت", importance: "High", importance_ar: "مرتفع", suggestedSection: "Skills", suggestedSection_ar: "المهارات" },
      { text: "Redux", text_ar: "ريدكس", importance: "Medium", importance_ar: "متوسط", suggestedSection: "Experience", suggestedSection_ar: "الخبرة" },
      { text: "Testing", text_ar: "اختبار", importance: "Medium", importance_ar: "متوسط", suggestedSection: "Skills", suggestedSection_ar: "المهارات" }
    ]
  },
  
  // Career journey timeline
  careerJourney: [
    { id: 1, date: "2021-06", title: "Graduated", title_ar: "تخرج", status: "completed", status_ar: "مكتمل" },
    { id: 2, date: "2021-08", title: "First Job", title_ar: "أول وظيفة", status: "completed", status_ar: "مكتمل" },
    { id: 3, date: "2022-05", title: "Promotion", title_ar: "ترقية", status: "completed", status_ar: "مكتمل" },
    { id: 4, date: "2023-01", title: "New Skills", title_ar: "مهارات جديدة", status: "in_progress", status_ar: "قيد التقدم" },
    { id: 5, date: "2023-06", title: "Career Change", title_ar: "تغيير المسار المهني", status: "planned", status_ar: "مخطط" }
  ],
  
  // AI recommendations
  recommendations: [
    {
      id: 1,
      type: "job",
      type_ar: "وظيفة",
      title: "Frontend Developer Position at TechCorp",
      title_ar: "منصب مطور واجهة أمامية في شركة تك كورب",
      description: "This position matches 85% of your skills and experience.",
      description_ar: "تتطابق هذه الوظيفة مع 85% من مهاراتك وخبراتك.",
      priority: "high",
      priority_ar: "مرتفع"
    },
    {
      id: 2,
      type: "skill",
      type_ar: "مهارة",
      title: "Learn TypeScript",
      title_ar: "تعلم تايب سكريبت",
      description: "Adding TypeScript to your skillset could increase your job matches by 20%.",
      description_ar: "إضافة تايب سكريبت إلى مجموعة مهاراتك يمكن أن تزيد من تطابق الوظائف بنسبة 20%.",
      priority: "medium",
      priority_ar: "متوسط"
    },
    {
      id: 3,
      type: "resume",
      type_ar: "سيرة ذاتية",
      title: "Update Resume Skills Section",
      title_ar: "تحديث قسم المهارات في السيرة الذاتية",
      description: "Your resume skills section needs updating with your latest projects.",
      description_ar: "يحتاج قسم المهارات في سيرتك الذاتية إلى تحديث بمشاريعك الأخيرة.",
      priority: "low",
      priority_ar: "منخفض"
    }
  ],
  
  // Badges/achievements
  badges: [
    { id: 1, name: "Resume Master", name_ar: "خبير السيرة الذاتية", status: "earned", status_ar: "مكتسب", date_earned: "2023-02-10", icon: "description", category: "Career", category_ar: "مسار مهني" },
    { id: 2, name: "Interview Ace", name_ar: "متميز في المقابلات", status: "earned", status_ar: "مكتسب", date_earned: "2023-03-15", icon: "record_voice_over", category: "Skills", category_ar: "مهارات" },
    { id: 3, name: "Networking Star", name_ar: "نجم التواصل", status: "progress", status_ar: "قيد التقدم", progress: 70, icon: "people", category: "Networking", category_ar: "تواصل" },
    { id: 4, name: "Skill Developer", name_ar: "مطور المهارات", status: "progress", status_ar: "قيد التقدم", progress: 45, icon: "trending_up", category: "Learning", category_ar: "تعلم" },
    { id: 5, name: "Job Seeker Pro", name_ar: "باحث وظيفي محترف", status: "locked", status_ar: "مقفل", icon: "work", category: "Career", category_ar: "مسار مهني" }
  ],
  
  // Skill gap analysis
  skillGap: [
    { skill: "JavaScript", skill_ar: "جافاسكريبت", current: 75, required: 80, gap: 5 },
    { skill: "React", skill_ar: "رياكت", current: 68, required: 75, gap: 7 },
    { skill: "TypeScript", skill_ar: "تايب سكريبت", current: 40, required: 70, gap: 30 },
    { skill: "Node.js", skill_ar: "نود.جي إس", current: 55, required: 60, gap: 5 },
    { skill: "UI/UX Design", skill_ar: "تصميم واجهة المستخدم", current: 45, required: 50, gap: 5 }
  ],
  
  // Career predictions
  careerPredictions: [
    { 
      role: "Senior Frontend Developer", 
      role_ar: "مطور واجهة أمامية رئيسي",
      match: 92, 
      timeline: "1-2 years",
      timeline_ar: "1-2 سنة",
      skills: ["JavaScript", "React", "TypeScript", "Redux", "Testing"],
      skills_ar: ["جافاسكريبت", "رياكت", "تايب سكريبت", "ريدكس", "اختبار"],
      companies: ["TechCorp", "WebSolutions", "DigitalWave"] 
    },
    { 
      role: "UI/UX Developer", 
      role_ar: "مطور واجهة مستخدم",
      match: 85, 
      timeline: "1-3 years",
      timeline_ar: "1-3 سنوات",
      skills: ["UI Design", "React", "User Research", "Prototyping"],
      skills_ar: ["تصميم واجهة مستخدم", "رياكت", "أبحاث المستخدم", "النماذج الأولية"],
      companies: ["DesignHub", "Creative Solutions", "UXStudio"] 
    },
    { 
      role: "Full Stack Developer", 
      role_ar: "مطور كامل الشبكة",
      match: 78, 
      timeline: "2-3 years",
      timeline_ar: "2-3 سنوات",
      skills: ["JavaScript", "React", "Node.js", "MongoDB", "Express"],
      skills_ar: ["جافاسكريبت", "رياكت", "نود.جي إس", "مونجو دي بي", "إكسبرس"],
      companies: ["InnovateTech", "FullStack Inc", "DevShop"] 
    }
  ],
  
  // Market insights
  marketInsights: {
    salary_data: {
      average: 85000,
      range: { min: 70000, max: 110000 }
    },
    job_demand: "high",
    job_demand_ar: "مرتفع",
    competition_level: "medium",
    competition_level_ar: "متوسط",
    growth_rate: 12,
    top_skills: [
      { name: "JavaScript", name_ar: "جافاسكريبت", demand: "high", demand_ar: "مرتفع" },
      { name: "React", name_ar: "رياكت", demand: "high", demand_ar: "مرتفع" },
      { name: "Node.js", name_ar: "نود.جي إس", demand: "medium", demand_ar: "متوسط" },
      { name: "TypeScript", name_ar: "تايب سكريبت", demand: "high", demand_ar: "مرتفع" },
      { name: "UI/UX", name_ar: "واجهة المستخدم", demand: "medium", demand_ar: "متوسط" }
    ]
  },
  
  // Leaderboard data
  leaderboard: {
    user_position: 4,
    total_users: 156,
    top_percentile: 15,
    points: 1250,
    next_milestone: 1500,
    rank_history: [12, 9, 8, 6, 5, 4], // Historical rank data for sparkline
    leaderboard: [
      { id: 1, name: "Zayed Al Nahyan", name_ar: "زايد آل نهيان", avatar: "https://randomuser.me/api/portraits/men/32.jpg", points: 2450 },
      { id: 2, name: "Maryam Al Maktoum", name_ar: "مريم آل مكتوم", avatar: "https://randomuser.me/api/portraits/women/44.jpg", points: 2120 },
      { id: 3, name: "Rashid Al Falasi", name_ar: "راشد الفلاسي", avatar: "https://randomuser.me/api/portraits/men/22.jpg", points: 1890 },
      { id: 4, name: "Current User", name_ar: "المستخدم الحالي", avatar: null, points: 1250, isCurrentUser: true },
      { id: 5, name: "Hind Al Qasimi", name_ar: "هند القاسمي", avatar: "https://randomuser.me/api/portraits/women/67.jpg", points: 1180 }
    ],
    friends: [
      { id: 101, name: "Mohammed Al Shamsi", name_ar: "محمد الشامسي", avatar: "https://randomuser.me/api/portraits/men/42.jpg", points: 1650, isFriend: true },
      { id: 4, name: "Current User", name_ar: "المستخدم الحالي", avatar: null, points: 1250, isCurrentUser: true },
      { id: 102, name: "Fatma Al Mazrouei", name_ar: "فاطمة المزروعي", avatar: "https://randomuser.me/api/portraits/women/33.jpg", points: 1100, isFriend: true },
      { id: 103, name: "Ahmed Al Dhaheri", name_ar: "أحمد الظاهري", avatar: "https://randomuser.me/api/portraits/men/15.jpg", points: 980, isFriend: true },
      { id: 104, name: "Noura Al Kaabi", name_ar: "نورة الكعبي", avatar: "https://randomuser.me/api/portraits/women/57.jpg", points: 850, isFriend: true }
    ]
  },
  
  // Learning paths
  learningPaths: [
    {
      id: 1,
      title: "Frontend Master Path",
      title_ar: "مسار خبير الواجهة الأمامية",
      progress: 65,
      completed: true,
      courses: [
        { id: 101, title: "Advanced React", title_ar: "رياكت متقدم", completed: true, isToday: false },
        { id: 102, title: "Redux State Management", title_ar: "إدارة الحالة باستخدام ريدكس", completed: true, isToday: false },
        { id: 103, title: "React Performance Optimization", title_ar: "تحسين أداء رياكت", completed: false, isToday: true },
        { id: 104, title: "Advanced TypeScript", title_ar: "تايب سكريبت متقدم", completed: false, isToday: false }
      ]
    },
    {
      id: 2,
      title: "UX Design Fundamentals",
      title_ar: "أساسيات تصميم تجربة المستخدم",
      progress: 30,
      completed: false,
      courses: [
        { id: 201, title: "UI Design Principles", title_ar: "مبادئ تصميم واجهة المستخدم", completed: true, isToday: false },
        { id: 202, title: "User Research Methods", title_ar: "طرق أبحاث المستخدم", completed: false, isToday: false },
        { id: 203, title: "Wireframing and Prototyping", title_ar: "رسم الهيكل والنماذج الأولية", completed: false, isToday: false }
      ]
    }
  ],
  
  // Opportunity alerts
  opportunityAlerts: [
    {
      id: 1,
      type: "job",
      type_ar: "وظيفة",
      title: "Frontend Developer at TechCorp",
      title_ar: "مطور واجهة أمامية في شركة تك كورب",
      deadline: "2023-05-15",
      priority: "high",
      priority_ar: "مرتفع",
      location: "Dubai, UAE",
      location_ar: "دبي، الإمارات العربية المتحدة",
      description: "Exciting opportunity matching 85% of your profile",
      description_ar: "فرصة مثيرة تتطابق مع 85% من ملفك الشخصي"
    },
    {
      id: 2,
      type: "event",
      type_ar: "فعالية",
      title: "Tech Career Fair",
      title_ar: "معرض وظائف التقنية",
      deadline: "2023-05-20",
      priority: "medium",
      priority_ar: "متوسط",
      location: "Abu Dhabi Convention Center",
      location_ar: "مركز أبوظبي للمؤتمرات",
      description: "Network with top employers in UAE tech industry",
      description_ar: "تواصل مع أفضل أرباب العمل في قطاع التقنية بالإمارات"
    },
    {
      id: 3,
      type: "learning",
      type_ar: "تعلم",
      title: "TypeScript Certification",
      title_ar: "شهادة تايب سكريبت",
      deadline: "2023-06-01",
      priority: "medium",
      priority_ar: "متوسط",
      location: "Online",
      location_ar: "عبر الإنترنت",
      description: "Boost your resume with this in-demand skill",
      description_ar: "عزز سيرتك الذاتية بهذه المهارة المطلوبة"
    }
  ],
  
  // Recent activities
  recentActivities: [
    { id: 1, type: "resume", type_ar: "سيرة ذاتية", action: "updated", action_ar: "تم تحديث", date: "2023-04-28T14:22:10Z", details: "Updated skills section", details_ar: "تم تحديث قسم المهارات" },
    { id: 2, type: "job", type_ar: "وظيفة", action: "applied", action_ar: "تم التقديم", date: "2023-04-25T09:15:45Z", details: "Applied to Frontend Developer at TechCorp", details_ar: "تم التقديم لوظيفة مطور واجهة أمامية في شركة تك كورب" },
    { id: 3, type: "skill", type_ar: "مهارة", action: "completed", action_ar: "تم الإكمال", date: "2023-04-20T16:30:00Z", details: "Completed React Advanced course", details_ar: "تم إكمال دورة رياكت المتقدمة" },
    { id: 4, type: "interview", type_ar: "مقابلة", action: "scheduled", action_ar: "تم الجدولة", date: "2023-04-18T11:45:22Z", details: "Interview scheduled with WebSolutions", details_ar: "تم جدولة مقابلة مع ويب سولوشنز" }
  ],
  
  // Learning roadmap
  learningRoadmap: {
    current_focus: "Frontend Development",
    current_focus_ar: "تطوير الواجهة الأمامية",
    progress: 65,
    milestones: [
      {
        id: 1,
        title: "HTML & CSS Mastery",
        title_ar: "إتقان HTML و CSS",
        status: "completed",
        status_ar: "مكتمل",
        skills: ["HTML5", "CSS3", "Responsive Design"],
        skills_ar: ["HTML5", "CSS3", "التصميم المتجاوب"]
      },
      {
        id: 2,
        title: "JavaScript Fundamentals",
        title_ar: "أساسيات جافاسكريبت",
        status: "completed",
        status_ar: "مكتمل",
        skills: ["ES6+", "DOM Manipulation", "Async Programming"],
        skills_ar: ["ES6+", "التلاعب بالـ DOM", "البرمجة اللامتزامنة"]
      },
      {
        id: 3,
        title: "React Ecosystem",
        title_ar: "نظام رياكت البيئي",
        status: "in_progress",
        status_ar: "قيد التقدم",
        skills: ["React", "Redux", "React Router"],
        skills_ar: ["رياكت", "ريدكس", "راوتر رياكت"]
      },
      {
        id: 4,
        title: "Advanced Frontend",
        title_ar: "الواجهة الأمامية المتقدمة",
        status: "planned",
        status_ar: "مخطط",
        skills: ["TypeScript", "NextJS", "Testing"],
        skills_ar: ["تايب سكريبت", "نكست جي إس", "الاختبار"]
      }
    ]
  },
  
  // Last updated timestamp
  last_updated: new Date().toISOString()
};

export default mockDashboardData;

 