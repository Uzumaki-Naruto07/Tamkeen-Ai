import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Grid, Card, CardContent, Chip, Alert,
  CircularProgress, IconButton, Tooltip, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl,
  InputLabel, FormHelperText, Breadcrumbs,
  Link, Tabs, Tab, List, ListItem, ListItemText,
  ListItemIcon, Collapse, Snackbar, LinearProgress,
  Rating, Badge, Menu, Avatar, ListItemAvatar, SvgIcon
} from '@mui/material';
import {
  Work, LocationOn, Timer,
  Bookmark, BookmarkBorder, Share, ArrowBack,
  Send, Business, Description, LocalOffer,
  Domain, Group, Visibility, CheckCircle,
  RadioButtonUnchecked, KeyboardArrowDown, KeyboardArrowUp,
  Timeline, Psychology, Assignment, BarChart,
  ThumbUp, ThumbDown, Star, PersonAdd, Save,
  Favorite, FavoriteBorder, CloudUpload, Warning,
  Info, NavigateBefore, NavigateNext, MoreVert,
  SupervisorAccount, Language, Public, MenuBook,
  OpenInNew, Mail, AccessTime, Schedule, Flag,
  ReportProblem, QuestionAnswer, Event, Check,
  Print, School
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useUser, useResume, useJob } from '../context/AppContext';
import { api } from '../utils/api';
import { JOB_ENDPOINTS } from '../api/endpoints';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import SkillChip from '../components/common/SkillChip';
import { useTranslation } from 'react-i18next';

const AEDIcon = (props) => (
  <SvgIcon {...props}>
    <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="12" fontWeight="bold">AED</text>
  </SvgIcon>
);

const JobDetails = () => {
  const { jobId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('initial'); // initial, submitting, success, error
  const [applicationError, setApplicationError] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    resumeId: '',
    coverLetter: '',
    phone: '',
    availability: '',
    referral: '',
    questions: {}
  });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [applyProgress, setApplyProgress] = useState(0);
  const [skillsMatch, setSkillsMatch] = useState({
    score: 0,
    matching: [],
    missing: [],
    total: 0
  });
  const [companyDetails, setCompanyDetails] = useState(null);
  const [optionsMenuAnchorEl, setOptionsMenuAnchorEl] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isCompanyFollowed, setIsCompanyFollowed] = useState(false);
  
  const navigate = useNavigate();
  const { profile } = useUser();
  const { resumes } = useResume();
  const { savedJobs, toggleSaveJob, isSavedJob } = useJob();
  const { t, i18n } = useTranslation();
  
  // Force LTR direction for JobDetails page
  useEffect(() => {
    // Store the original direction
    const originalDir = document.documentElement.dir;
    
    // Force LTR for this page
    document.documentElement.dir = 'ltr';
    
    // Restore original direction on component unmount
    return () => {
      document.documentElement.dir = originalDir;
    };
  }, []);
  
  // Load job details
  useEffect(() => {
    const loadJobDetails = async () => {
      if (!jobId) {
        setError('No job ID provided');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Create mock functions if they don't exist
        // Check if the API functions exist, otherwise use mock implementations
        const getJobData = async (id) => {
          try {
            if (JOB_ENDPOINTS.getJobById) {
              return await JOB_ENDPOINTS.getJobById(id);
            } else {
              console.log("Using mock getJobById implementation");
              // Use pre-existing jobs search function if available
              // Fallback mock data based on job ID
              const mockJobs = {
                1: {
                  id: 1,
                  title: "Senior Software Engineer",
                  titleAr: "مهندس برمجيات أول",
                  company: "Tech Solutions UAE",
                  companyAr: "تيك سوليوشنز الإمارات",
                  location: "Dubai, UAE",
                  locationAr: "دبي، الإمارات العربية المتحدة",
                  jobType: "Full-time",
                  jobTypeAr: "دوام كامل",
                  salaryRange: "25,000 - 35,000 AED/month",
                  salaryRangeAr: "25,000 - 35,000 درهم/شهر",
                  postedDate: "2 days ago",
                  postedDateAr: "منذ يومين",
                  companyLogo: "https://logo.clearbit.com/microsoft.com",
                  matchScore: 85,
                  requiredSkills: ["React", "Node.js", "TypeScript", "AWS"],
                  description: "Looking for an experienced software engineer to join our growing team. We're seeking someone with strong skills in React, Node.js, TypeScript, and AWS who can help us build scalable, high-performance applications.",
                  descriptionAr: "نبحث عن مهندس برمجيات ذو خبرة للانضمام إلى فريقنا المتنامي. نسعى لشخص يتمتع بمهارات قوية في React و Node.js و TypeScript و AWS يمكنه المساعدة في بناء تطبيقات قابلة للتوسع وعالية الأداء.",
                  applicationStatus: "open",
                  benefits: ["Health Insurance", "Annual Flights", "Housing Allowance", "Flexible Working Hours"],
                  benefitsAr: ["تأمين صحي", "رحلات سنوية", "بدل سكن", "ساعات عمل مرنة"],
                  requirements: [
                    "5+ years of experience in software development",
                    "Strong proficiency in React, Node.js and TypeScript",
                    "Experience with AWS cloud services",
                    "Excellent problem-solving skills"
                  ],
                  requirementsAr: [
                    "5+ سنوات من الخبرة في تطوير البرمجيات",
                    "كفاءة قوية في React و Node.js و TypeScript",
                    "خبرة في خدمات AWS السحابية",
                    "مهارات ممتازة في حل المشكلات"
                  ],
                  responsibilities: [
                    "Develop and maintain web applications",
                    "Write clean, maintainable and efficient code",
                    "Collaborate with cross-functional teams",
                    "Participate in code reviews and technical discussions"
                  ],
                  responsibilitiesAr: [
                    "تطوير وصيانة تطبيقات الويب",
                    "كتابة كود نظيف وقابل للصيانة وفعال",
                    "التعاون مع فرق متعددة التخصصات",
                    "المشاركة في مراجعات الكود والمناقشات التقنية"
                  ],
                  salaryDetails: "This position offers a competitive salary package that reflects the candidate's experience and qualifications. The compensation is inclusive of basic salary and may include additional allowances based on company policy.",
                  salaryDetailsAr: "تقدم هذه الوظيفة حزمة راتب تنافسية تعكس خبرة المرشح ومؤهلاته. يشمل التعويض الراتب الأساسي وقد يتضمن بدلات إضافية بناءً على سياسة الشركة."
                },
                2: {
                  id: 2,
                  title: "Marketing Manager",
                  titleAr: "مدير تسويق",
                  company: "Global Marketing LLC",
                  companyAr: "جلوبال ماركتنج",
                  location: "Abu Dhabi, UAE",
                  locationAr: "أبوظبي، الإمارات العربية المتحدة",
                  jobType: "Full-time",
                  jobTypeAr: "دوام كامل",
                  salaryRange: "20,000 - 30,000 AED/month",
                  salaryRangeAr: "20,000 - 30,000 درهم/شهر",
                  postedDate: "1 week ago",
                  postedDateAr: "منذ أسبوع",
                  companyLogo: "https://logo.clearbit.com/globalmarketing.ae",
                  matchScore: 75,
                  requiredSkills: ["Digital Marketing", "Social Media", "Content Strategy"],
                  description: "Join our dynamic marketing team in Abu Dhabi. We're looking for an experienced Marketing Manager to lead our digital initiatives and brand strategy.",
                  descriptionAr: "انضم إلى فريق التسويق الديناميكي لدينا في أبوظبي. نبحث عن مدير تسويق ذو خبرة لتقديم استراتيجيات التسويق الرقمي واستراتيجية العلامة التجارية.",
                  applicationStatus: "open",
                  benefits: [
                    "Health Insurance",
                    "Annual Flights",
                    "Housing Allowance",
                    "Transportation Allowance"
                  ],
                  requirements: [
                    "5+ years of marketing experience",
                    "Bachelor's degree in Marketing or related field",
                    "Proven track record in digital marketing campaigns",
                    "Strong analytical and leadership skills"
                  ],
                  responsibilities: [
                    "Develop and implement marketing strategies",
                    "Lead and mentor the marketing team",
                    "Manage marketing budget and ROI",
                    "Create and optimize digital campaigns",
                    "Analyze market trends and competitor activities"
                  ],
                  responsibilitiesAr: [
                    "تطوير وتنفيذ استراتيجيات التسويق",
                    "قيادة وتوجيه فريق التسويق",
                    "إدارة ميزانية التسويق والعائد على الاستثمار",
                    "إنشاء وتحسين الحملات الرقمية",
                    "تحليل اتجاهات السوق وأنشطة المنافسين"
                  ]
                },
                3: {
                  id: 3,
                  title: "Financial Analyst",
                  titleAr: "محلل مالي",
                  company: "Emirates Investment Bank",
                  companyAr: "بنك الإمارات للاستثمار",
                  location: "Dubai, UAE",
                  locationAr: "دبي، الإمارات العربية المتحدة",
                  jobType: "Full-time",
                  jobTypeAr: "دوام كامل",
                  salaryRange: "18,000 - 25,000 AED/month",
                  salaryRangeAr: "18,000 - 25,000 درهم/شهر",
                  postedDate: "3 days ago",
                  postedDateAr: "منذ 3 أيام",
                  companyLogo: "https://logo.clearbit.com/emiratesbank.ae",
                  matchScore: 90,
                  requiredSkills: ["Financial Modeling", "Excel", "PowerBI"],
                  description: "Seeking a skilled financial analyst for our investment team. Join one of UAE's leading investment banks.",
                  descriptionAr: "نبحث عن محلل مالي ماهر لفريق الاستثمار لدينا. انضم إلى أحد البنوك الاستثمارية الرائدة في الإمارات العربية المتحدة.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Performance Bonus",
                    "Health Insurance",
                    "Professional Development"
                  ],
                  benefitsAr: [
                    "راتب تنافسي",
                    "مكافأة أداء",
                    "تأمين صحي",
                    "تطوير مهني"
                  ],
                  requirements: [
                    "Bachelor's degree in Finance or related field",
                    "3+ years of financial analysis experience",
                    "Advanced Excel and PowerBI skills",
                    "CFA certification preferred"
                  ],
                  requirementsAr: [
                    "بكالوريوس في المالية أو مجال ذي صلة",
                    "3+ سنوات من الخبرة في التحليل المالي",
                    "مهارات متقدمة في Excel و PowerBI",
                    "يفضل الحاصلين على شهادة CFA"
                  ],
                  responsibilities: [
                    "Perform financial modeling and analysis",
                    "Prepare investment reports",
                    "Conduct market research",
                    "Support investment decisions"
                  ],
                  responsibilitiesAr: [
                    "إجراء النمذجة والتحليل المالي",
                    "إعداد تقارير الاستثمار",
                    "إجراء أبحاث السوق",
                    "دعم قرارات الاستثمار"
                  ]
                },
                4: {
                  id: 4,
                  title: "HR Manager",
                  titleAr: "مدير الموارد البشرية",
                  company: "Al Futtaim Group",
                  companyAr: "مجموعة الفطيم",
                  location: "Dubai, UAE",
                  locationAr: "دبي، الإمارات العربية المتحدة",
                  jobType: "Full-time",
                  jobTypeAr: "دوام كامل",
                  salaryRange: "20,000 - 30,000 AED/month",
                  salaryRangeAr: "20,000 - 30,000 درهم/شهر",
                  postedDate: "1 week ago",
                  postedDateAr: "منذ أسبوع واحد",
                  companyLogo: "https://logo.clearbit.com/alfuttaim.com",
                  matchScore: 85,
                  requiredSkills: ["Recruitment", "Employee Relations", "HR Policies"],
                  description: "Looking for an experienced HR Manager to lead our HR department. Manage employee relations and enhance company culture.",
                  descriptionAr: "نبحث عن مدير موارد بشرية ذو خبرة لقيادة قسم الموارد البشرية لدينا. إدارة علاقات الموظفين وتعزيز ثقافة الشركة.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Annual Bonus",
                    "Family Health Insurance",
                    "Education Allowance"
                  ],
                  benefitsAr: [
                    "راتب تنافسي",
                    "مكافأة سنوية",
                    "تأمين صحي عائلي",
                    "بدل تعليم"
                  ],
                  requirements: [
                    "Bachelor's degree in HR or related field",
                    "5+ years of HR management experience",
                    "Knowledge of UAE labor laws",
                    "Strong leadership skills"
                  ],
                  requirementsAr: [
                    "بكالوريوس في الموارد البشرية أو مجال ذي صلة",
                    "5+ سنوات من الخبرة في إدارة الموارد البشرية",
                    "معرفة بقوانين العمل الإماراتية",
                    "مهارات قيادية قوية"
                  ],
                  responsibilities: [
                    "Develop and implement HR strategies",
                    "Manage recruitment and talent acquisition",
                    "Handle employee relations and conflict resolution",
                    "Oversee compensation and benefits programs",
                    "Ensure compliance with labor laws"
                  ],
                  responsibilitiesAr: [
                    "تطوير وتنفيذ استراتيجيات الموارد البشرية",
                    "إدارة التوظيف واستقطاب المواهب",
                    "التعامل مع علاقات الموظفين وحل النزاعات",
                    "الإشراف على برامج التعويضات والمزايا",
                    "ضمان الامتثال لقوانين العمل"
                  ]
                },
                5: {
                  id: 5,
                  title: "Project Manager",
                  company: "EMAAR Properties",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "30,000 - 40,000 AED/month",
                  postedDate: "5 days ago",
                  companyLogo: "https://logo.clearbit.com/emaar.com",
                  matchScore: 85,
                  requiredSkills: ["Project Management", "Construction", "Stakeholder Management"],
                  description: "Managing large-scale real estate development projects. Join one of the most prestigious property developers in the UAE.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Performance Bonuses",
                    "Health Insurance",
                    "Housing Allowance"
                  ],
                  requirements: [
                    "10+ years in project management",
                    "PMP certification",
                    "Experience in real estate development",
                    "Strong leadership and communication skills"
                  ],
                  requirementsAr: [
                    "10+ سنوات في إدارة المشاريع",
                    "شهادة PMP",
                    "خبرة في تطوير العقارات",
                    "مهارات قوية في القيادة والتواصل"
                  ],
                  responsibilities: [
                    "Lead project planning and execution",
                    "Manage project budgets and timelines",
                    "Coordinate with contractors and stakeholders",
                    "Ensure quality standards are met"
                  ]
                },
                6: {
                  id: 6,
                  title: "Data Scientist",
                  company: "Etisalat Digital",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "28,000 - 38,000 AED/month",
                  postedDate: "Just now",
                  companyLogo: "https://logo.clearbit.com/etisalat.ae",
                  matchScore: 88,
                  requiredSkills: ["Python", "Machine Learning", "SQL", "Deep Learning"],
                  description: "Join our AI team to build next-generation solutions. We're developing cutting-edge technologies to transform telecommunications and digital services.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Performance Bonuses",
                    "Health Insurance",
                    "Career Development"
                  ],
                  requirements: [
                    "MSc/PhD in Computer Science, Data Science or related field",
                    "Experience with machine learning and deep learning",
                    "Strong programming skills in Python",
                    "Experience with big data technologies"
                  ],
                  requirementsAr: [
                    "ماجستير/دكتوراه في علوم الكمبيوتر أو علوم البيانات أو مجال ذي صلة",
                    "خبرة في التعلم الآلي والتعلم العميق",
                    "مهارات برمجة قوية في بايثون",
                    "خبرة في تقنيات البيانات الضخمة"
                  ],
                  responsibilities: [
                    "Develop machine learning models",
                    "Analyze complex datasets",
                    "Create predictive algorithms",
                    "Implement AI solutions"
                  ]
                },
                7: {
                  id: 7,
                  title: "Sales Director",
                  company: "Jumeirah Group",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "35,000 - 45,000 AED/month",
                  postedDate: "2 hours ago",
                  companyLogo: "https://logo.clearbit.com/jumeirah.com",
                  matchScore: 82,
                  requiredSkills: ["Sales Strategy", "Team Leadership", "Hospitality"],
                  description: "Lead our sales team in the luxury hospitality sector. Join one of the world's most luxurious hotel chains.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Commission Structure",
                    "Hotel Stay Benefits",
                    "Health Insurance"
                  ],
                  requirements: [
                    "10+ years in luxury hospitality sales",
                    "Proven track record in exceeding sales targets",
                    "Experience managing high-performing teams",
                    "International sales experience preferred"
                  ],
                  requirementsAr: [
                    "10+ سنوات في مبيعات الضيافة الفاخرة",
                    "سجل حافل في تجاوز أهداف المبيعات",
                    "خبرة في إدارة فرق عالية الأداء",
                    "يفضل خبرة المبيعات الدولية"
                  ],
                  responsibilities: [
                    "Develop and implement sales strategies",
                    "Lead and motivate the sales team",
                    "Build relationships with key clients",
                    "Achieve revenue targets"
                  ]
                },
                8: {
                  id: 8,
                  title: "Civil Engineer",
                  company: "AECOM Middle East",
                  location: "Abu Dhabi, UAE",
                  jobType: "Full-time",
                  salaryRange: "23,000 - 33,000 AED/month",
                  postedDate: "3 hours ago",
                  companyLogo: "https://logo.clearbit.com/aecom.com",
                  matchScore: 79,
                  requiredSkills: ["AutoCAD", "Construction Management", "Project Planning"],
                  description: "Join our infrastructure development projects. We're working on some of the most significant construction projects in the Middle East.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Professional Development",
                    "Health Insurance",
                    "Relocation Assistance"
                  ],
                  requirements: [
                    "Bachelor's degree in Civil Engineering",
                    "5+ years of experience in infrastructure projects",
                    "Proficiency in AutoCAD and other design software",
                    "Knowledge of local building codes and regulations"
                  ],
                  requirementsAr: [
                    "بكالوريوس في الهندسة المدنية",
                    "5+ سنوات من الخبرة في مشاريع البنية التحتية",
                    "إتقان AutoCAD وبرامج التصميم الأخرى",
                    "معرفة بقوانين وأنظمة البناء المحلية"
                  ],
                  responsibilities: [
                    "Design and develop infrastructure plans",
                    "Oversee construction activities",
                    "Ensure compliance with specifications",
                    "Coordinate with project stakeholders"
                  ]
                },
                9: {
                  id: 9,
                  title: "Digital Marketing Specialist",
                  company: "Noon.com",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "15,000 - 25,000 AED/month",
                  postedDate: "4 hours ago",
                  companyLogo: "https://logo.clearbit.com/noon.com",
                  matchScore: 92,
                  requiredSkills: ["SEO", "SEM", "Social Media Marketing", "Content Creation"],
                  description: "Drive our digital marketing initiatives. Join the Middle East's fastest-growing e-commerce platform.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Employee Discounts",
                    "Health Insurance",
                    "Growth Opportunities"
                  ],
                  requirements: [
                    "3+ years of experience in digital marketing",
                    "Proven track record in SEO/SEM campaigns",
                    "Experience with analytics tools",
                    "Knowledge of e-commerce marketing"
                  ],
                  requirementsAr: [
                    "3+ سنوات من الخبرة في التسويق الرقمي",
                    "سجل حافل في حملات تحسين محركات البحث والتسويق عبر محركات البحث",
                    "خبرة في أدوات التحليلات",
                    "معرفة بتسويق التجارة الإلكترونية"
                  ],
                  responsibilities: [
                    "Manage digital marketing campaigns",
                    "Optimize website for search engines",
                    "Create engaging content for social media",
                    "Analyze marketing metrics and report on performance"
                  ]
                },
                10: {
                  id: 10,
                  title: "Operations Manager",
                  company: "DP World",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "25,000 - 35,000 AED/month",
                  postedDate: "5 hours ago",
                  companyLogo: "https://logo.clearbit.com/dpworld.com",
                  matchScore: 87,
                  requiredSkills: ["Operations Management", "Supply Chain", "Team Leadership"],
                  description: "Manage port operations and logistics. Join a global leader in supply chain solutions and port operations.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Performance Bonuses",
                    "Health Insurance",
                    "Professional Development"
                  ],
                  requirements: [
                    "7+ years of experience in operations management",
                    "Bachelor's degree in Business, Logistics or related field",
                    "Experience in port operations preferred",
                    "Strong leadership and problem-solving skills"
                  ],
                  requirementsAr: [
                    "7+ سنوات من الخبرة في إدارة العمليات",
                    "بكالوريوس في الأعمال، الخدمات اللوجستية أو مجال ذي صلة",
                    "يفضل الخبرة في عمليات الموانئ",
                    "مهارات قوية في القيادة وحل المشكلات"
                  ],
                  responsibilities: [
                    "Oversee daily port operations",
                    "Optimize logistics processes",
                    "Manage operational teams",
                    "Ensure compliance with safety regulations"
                  ]
                },
                11: {
                  id: 11,
                  title: "Frontend Developer",
                  company: "Careem",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "20,000 - 30,000 AED/month",
                  postedDate: "6 hours ago",
                  companyLogo: "https://logo.clearbit.com/careem.com",
                  matchScore: 89,
                  requiredSkills: ["React", "Vue.js", "JavaScript", "CSS3"],
                  description: "Build amazing user experiences for our mobile apps. Join the Middle East's leading ride-hailing platform.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Stock Options",
                    "Health Insurance",
                    "Flexible Working"
                  ],
                  requirements: [
                    "3+ years of experience in frontend development",
                    "Strong skills in React or Vue.js",
                    "Experience with responsive design",
                    "Understanding of UX principles"
                  ],
                  requirementsAr: [
                    "3+ سنوات من الخبرة في تطوير الواجهة الأمامية",
                    "مهارات قوية في React أو Vue.js",
                    "خبرة في التصميم المتجاوب",
                    "فهم لمبادئ تجربة المستخدم"
                  ],
                  responsibilities: [
                    "Develop user interfaces for web and mobile applications",
                    "Implement responsive designs",
                    "Collaborate with backend developers and designers",
                    "Optimize application performance"
                  ]
                },
                12: {
                  id: 12,
                  title: "Business Development Manager",
                  company: "Majid Al Futtaim",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "28,000 - 38,000 AED/month",
                  postedDate: "7 hours ago",
                  companyLogo: "https://logo.clearbit.com/majidalfuttaim.com",
                  matchScore: 84,
                  requiredSkills: ["Business Development", "Sales", "Retail", "Strategy"],
                  description: "Drive business growth in our retail division. Join one of the leading shopping mall, retail and leisure pioneers in the Middle East.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Performance Bonuses",
                    "Staff Discounts",
                    "Health Insurance"
                  ],
                  requirements: [
                    "7+ years of experience in business development",
                    "Experience in retail or consumer goods",
                    "Strong networking and negotiation skills",
                    "Bachelor's degree in Business or related field"
                  ],
                  requirementsAr: [
                    "7+ سنوات من الخبرة في تطوير الأعمال",
                    "خبرة في البيع بالتجزئة أو السلع الاستهلاكية",
                    "مهارات قوية في التواصل والتفاوض",
                    "بكالوريوس في الأعمال أو مجال ذي صلة"
                  ],
                  responsibilities: [
                    "Identify and pursue business opportunities",
                    "Develop and maintain client relationships",
                    "Negotiate deals and partnerships",
                    "Develop business strategies"
                  ]
                },
                13: {
                  id: 13,
                  title: "Arabic Content Writer",
                  company: "MBC Group",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "15,000 - 22,000 AED/month",
                  postedDate: "8 hours ago",
                  companyLogo: "https://logo.clearbit.com/mbc.net",
                  matchScore: 91,
                  requiredSkills: ["Arabic Writing", "Content Creation", "SEO", "Social Media"],
                  description: "Create engaging Arabic content for our digital platforms. Join the largest media company in the Middle East.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Health Insurance",
                    "Career Growth",
                    "Creative Environment"
                  ],
                  requirements: [
                    "Native Arabic speaker with excellent writing skills",
                    "3+ years of content creation experience",
                    "Knowledge of SEO and digital content",
                    "Bachelor's degree in Journalism, Communications or related field"
                  ],
                  requirementsAr: [
                    "متحدث أصلي باللغة العربية مع مهارات كتابة ممتازة",
                    "3+ سنوات من الخبرة في إنشاء المحتوى",
                    "معرفة بتحسين محركات البحث والمحتوى الرقمي",
                    "بكالوريوس في الصحافة، الاتصالات أو مجال ذي صلة"
                  ],
                  responsibilities: [
                    "Create high-quality Arabic content",
                    "Develop content strategies",
                    "Optimize content for SEO",
                    "Manage social media content"
                  ]
                },
                14: {
                  id: 14,
                  title: "Mechanical Engineer",
                  company: "ADNOC",
                  location: "Abu Dhabi, UAE",
                  jobType: "Full-time",
                  salaryRange: "25,000 - 35,000 AED/month",
                  postedDate: "9 hours ago",
                  companyLogo: "https://logo.clearbit.com/adnoc.ae",
                  matchScore: 86,
                  requiredSkills: ["Mechanical Engineering", "AutoCAD", "Project Management"],
                  description: "Join our oil and gas engineering team. Be part of the UAE's leading energy company.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Housing Allowance",
                    "Education Allowance",
                    "Annual Flights"
                  ],
                  requirements: [
                    "Bachelor's degree in Mechanical Engineering",
                    "5+ years of experience in oil and gas",
                    "Proficiency in AutoCAD and other engineering software",
                    "Knowledge of industry standards and regulations"
                  ],
                  requirementsAr: [
                    "بكالوريوس في الهندسة الميكانيكية",
                    "5+ سنوات من الخبرة في النفط والغاز",
                    "إتقان AutoCAD وبرامج الهندسة الأخرى",
                    "معرفة بمعايير وأنظمة الصناعة"
                  ],
                  responsibilities: [
                    "Design and develop mechanical systems",
                    "Oversee equipment installation and maintenance",
                    "Conduct feasibility studies",
                    "Ensure compliance with safety standards"
                  ]
                },
                15: {
                  id: 15,
                  title: "Legal Counsel",
                  company: "Emirates NBD",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "35,000 - 45,000 AED/month",
                  postedDate: "10 hours ago",
                  companyLogo: "https://logo.clearbit.com/emiratesnbd.com",
                  matchScore: 88,
                  requiredSkills: ["Corporate Law", "Banking Law", "Contract Management"],
                  description: "Handle legal matters for our banking operations. Join one of the UAE's leading financial institutions.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Performance Bonuses",
                    "Health Insurance",
                    "Banking Benefits"
                  ],
                  requirements: [
                    "Law degree with UAE qualification",
                    "7+ years of experience in banking or corporate law",
                    "Experience in contract review and negotiation",
                    "Knowledge of UAE financial regulations"
                  ],
                  requirementsAr: [
                    "شهادة في القانون مع تأهيل إماراتي",
                    "7+ سنوات من الخبرة في القانون المصرفي أو قانون الشركات",
                    "خبرة في مراجعة العقود والتفاوض",
                    "معرفة باللوائح المالية الإماراتية"
                  ],
                  responsibilities: [
                    "Provide legal advice to business units",
                    "Review and draft legal documents",
                    "Manage legal risks",
                    "Ensure regulatory compliance"
                  ]
                },
                16: {
                  id: 16,
                  title: "UI/UX Designer",
                  company: "Dubizzle",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "18,000 - 28,000 AED/month",
                  postedDate: "11 hours ago",
                  companyLogo: "https://logo.clearbit.com/dubizzle.com",
                  matchScore: 93,
                  requiredSkills: ["Figma", "User Research", "Wireframing", "Prototyping", "UI Design"],
                  description: "Join Dubizzle's design team to create intuitive and engaging user experiences for the UAE's leading online marketplace. You'll work on web and mobile platforms to improve user journeys and digital interfaces.",
                  applicationStatus: "open",
                  benefits: [
                    "Health Insurance",
                    "Flexible Working Hours",
                    "Professional Development",
                    "Casual Work Environment"
                  ],
                  requirements: [
                    "3+ years of experience in UI/UX design",
                    "Strong portfolio demonstrating user-centered design",
                    "Proficiency in design tools like Figma and Adobe Creative Suite",
                    "Experience with user research and usability testing",
                    "Knowledge of design systems and UI component libraries"
                  ],
                  requirementsAr: [
                    "3+ سنوات من الخبرة في تصميم واجهة وتجربة المستخدم",
                    "محفظة قوية تُظهر التصميم المتمحور حول المستخدم",
                    "إتقان أدوات التصميم مثل Figma ومجموعة Adobe الإبداعية",
                    "خبرة في أبحاث المستخدم واختبار قابلية الاستخدام",
                    "معرفة بأنظمة التصميم ومكتبات مكونات واجهة المستخدم"
                  ],
                  responsibilities: [
                    "Design user interfaces for web and mobile applications",
                    "Oversee end-to-end supply chain operations",
                    "Optimize inventory levels and distribution processes",
                    "Manage relationships with logistics partners",
                    "Implement cost-saving initiatives",
                    "Lead and develop the supply chain team"
                  ]
                },
                18: {
                  id: 18,
                  title: "Healthcare Administrator",
                  company: "Cleveland Clinic Abu Dhabi",
                  location: "Abu Dhabi, UAE",
                  jobType: "Full-time",
                  salaryRange: "22,000 - 32,000 AED/month",
                  postedDate: "13 hours ago",
                  companyLogo: "https://logo.clearbit.com/clevelandclinicabudhabi.ae",
                  matchScore: 87,
                  requiredSkills: ["Healthcare Administration", "Operations Management", "Healthcare Regulations", "Staff Management"],
                  description: "Join Cleveland Clinic Abu Dhabi as a Healthcare Administrator to manage operations for our world-class medical facility. You'll ensure smooth functioning of administrative services and support clinical operations.",
                  applicationStatus: "open",
                  benefits: [
                    "Health Insurance",
                    "Housing Allowance",
                    "Education Assistance",
                    "Annual Flights",
                    "Relocation Support"
                  ],
                  requirements: [
                    "Master's degree in Healthcare Administration or related field",
                    "5+ years of experience in healthcare administration",
                    "Knowledge of UAE healthcare regulations",
                    "Strong leadership and operational management skills",
                    "Experience with healthcare information systems"
                  ],
                  requirementsAr: [
                    "درجة الماجستير في إدارة الرعاية الصحية أو مجال ذي صلة",
                    "5+ سنوات من الخبرة في إدارة الرعاية الصحية",
                    "معرفة باللوائح الصحية الإماراتية",
                    "مهارات قوية في القيادة وإدارة العمليات",
                    "خبرة في أنظمة معلومات الرعاية الصحية"
                  ],
                  responsibilities: [
                    "Oversee daily administrative operations",
                    "Manage departmental budgets and resources",
                    "Ensure compliance with healthcare regulations",
                    "Coordinate between clinical and administrative staff",
                    "Implement process improvements and efficiency measures"
                  ]
                },
                19: {
                  id: 19,
                  title: "Cybersecurity Analyst",
                  company: "Dubai Electronic Security Center",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "25,000 - 35,000 AED/month",
                  postedDate: "14 hours ago",
                  companyLogo: "https://logo.clearbit.com/desc.gov.ae",
                  matchScore: 90,
                  requiredSkills: ["Network Security", "Threat Analysis", "Vulnerability Assessment", "SIEM", "Incident Response"],
                  description: "Protect Dubai's digital infrastructure as a Cybersecurity Analyst at the Dubai Electronic Security Center. Monitor systems, detect threats, and respond to security incidents to safeguard critical information assets.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Government Benefits Package",
                    "Professional Development",
                    "Health Insurance",
                    "Pension Plan"
                  ],
                  requirements: [
                    "Bachelor's degree in Cybersecurity, IT, or related field",
                    "3+ years of experience in cybersecurity",
                    "Security certifications (CISSP, CEH, CISM, or equivalent)",
                    "Experience with security tools and SIEM platforms",
                    "Knowledge of threat intelligence and incident response"
                  ],
                  requirementsAr: [
                    "بكالوريوس في الأمن السيبراني، تكنولوجيا المعلومات، أو مجال ذي صلة",
                    "3+ سنوات من الخبرة في الأمن السيبراني",
                    "شهادات أمنية (CISSP، CEH، CISM، أو ما يعادلها)",
                    "خبرة في أدوات الأمان ومنصات SIEM",
                    "معرفة باستخبارات التهديدات والاستجابة للحوادث"
                  ],
                  responsibilities: [
                    "Monitor security systems and networks",
                    "Analyze and respond to security alerts",
                    "Conduct vulnerability assessments",
                    "Implement security controls and measures",
                    "Document security incidents and remediation actions"
                  ]
                },
                20: {
                  id: 20,
                  title: "Hotel Manager",
                  company: "Address Hotels + Resorts",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "28,000 - 38,000 AED/month",
                  postedDate: "15 hours ago",
                  companyLogo: "https://logo.clearbit.com/addresshotels.com",
                  matchScore: 86,
                  requiredSkills: ["Hospitality Management", "Revenue Management", "Customer Service", "Team Leadership"],
                  description: "Lead operations at one of Dubai's premier luxury hotels. As Hotel Manager at Address Hotels + Resorts, you'll ensure exceptional guest experiences while maximizing operational efficiency and revenue.",
                  applicationStatus: "open",
                  benefits: [
                    "Competitive Salary",
                    "Accommodation or Housing Allowance",
                    "Health Insurance",
                    "Discounted Stays at Emaar Properties",
                    "Professional Development"
                  ],
                  requirements: [
                    "Bachelor's degree in Hospitality Management or related field",
                    "7+ years of experience in luxury hotel management",
                    "Strong leadership and team management skills",
                    "Financial and revenue management expertise",
                    "Experience with hotel management systems"
                  ],
                  requirementsAr: [
                    "بكالوريوس في إدارة الضيافة أو مجال ذي صلة",
                    "7+ سنوات من الخبرة في إدارة الفنادق الفاخرة",
                    "مهارات قوية في القيادة وإدارة الفريق",
                    "خبرة في الإدارة المالية وإدارة الإيرادات",
                    "خبرة في أنظمة إدارة الفنادق"
                  ],
                  responsibilities: [
                    "Oversee all hotel operations and departments",
                    "Ensure exceptional guest service standards",
                    "Manage hotel budget and financial performance",
                    "Lead and develop a team of department heads",
                    "Implement strategic initiatives to maximize revenue"
                  ]
                },
                101: {
                  id: 101,
                  title: "UI/UX Designer",
                  company: "Creative Solutions",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  remote: true,
                  salaryRange: "25,000 - 32,000 AED/month",
                  postedDate: "3 days ago",
                  companyLogo: "https://logo.clearbit.com/creativesolutions.ae",
                  matchScore: 92,
                  requiredSkills: ["Figma", "Adobe XD", "Sketch", "User Research", "Prototyping"],
                  description: "Creative Solutions is looking for a talented UI/UX Designer to create amazing user experiences for our clients. You'll work on a variety of digital products across web, mobile, and emerging platforms, collaborating with cross-functional teams to deliver intuitive and engaging designs.",
                  applicationStatus: "open",
                  benefits: ["Health Insurance", "Flexible Working Hours", "Professional Development Budget", "Creative Environment"],
                  requirements: [
                    "3+ years of experience in UI/UX design",
                    "Proficiency in design tools like Figma, Adobe XD, and Sketch",
                    "Strong portfolio demonstrating user-centered design solutions",
                    "Experience conducting user research and usability testing",
                    "Excellent communication and collaboration skills"
                  ],
                  responsibilities: [
                    "Create wireframes, prototypes, and high-fidelity designs",
                    "Conduct user research and usability testing",
                    "Develop user flows and journey maps",
                    "Collaborate with developers to ensure proper implementation",
                    "Create and maintain design systems"
                  ]
                },
                102: {
                  id: 102,
                  title: "Senior Product Designer",
                  company: "Emirates Digital",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "30,000 - 40,000 AED/month",
                  postedDate: "1 week ago",
                  companyLogo: "https://logo.clearbit.com/emirates.com",
                  matchScore: 84,
                  requiredSkills: ["Product Design", "UX Strategy", "User Testing", "Design Systems"],
                  description: "Emirates Digital is seeking a Senior Product Designer to lead our design team in creating exceptional digital experiences for our customers. You'll be responsible for shaping the design strategy, mentoring junior designers, and ensuring our products meet the highest standards of usability and visual appeal.",
                  applicationStatus: "open",
                  benefits: ["Health Insurance", "Annual Flights", "Housing Allowance", "Professional Development"],
                  requirements: [
                    "5+ years of experience in product design",
                    "Strong portfolio showing end-to-end product design work",
                    "Experience building and implementing design systems",
                    "Leadership experience mentoring junior designers",
                    "Excellent problem-solving skills"
                  ],
                  responsibilities: [
                    "Lead the design process from concept to implementation",
                    "Develop and maintain design systems",
                    "Conduct user research and usability testing",
                    "Mentor junior designers",
                    "Collaborate with product managers and engineers"
                  ]
                },
                103: {
                  id: 103,
                  title: "UX Researcher",
                  company: "UserTech Labs",
                  location: "Abu Dhabi, UAE",
                  remote: true,
                  jobType: "Full-time",
                  salaryRange: "22,000 - 28,000 AED/month",
                  postedDate: "2 days ago",
                  companyLogo: "https://logo.clearbit.com/usertechlabs.com",
                  matchScore: 88,
                  requiredSkills: ["User Research", "Usability Testing", "Data Analysis", "Interviewing"],
                  description: "UserTech Labs is looking for a UX Researcher to help us better understand our users and create products that truly meet their needs. You'll be responsible for planning and conducting research studies, analyzing data, and communicating insights to inform product decisions.",
                  applicationStatus: "open",
                  benefits: ["Health Insurance", "Remote Work", "Professional Development", "Flexible Hours"],
                  requirements: [
                    "3+ years of experience in UX research",
                    "Experience with various research methodologies",
                    "Strong analytical and data interpretation skills",
                    "Excellent communication and presentation abilities"
                  ],
                  responsibilities: [
                    "Plan and conduct user research studies",
                    "Analyze and interpret research data",
                    "Create personas, journey maps, and other UX artifacts",
                    "Communicate insights and recommendations to stakeholders",
                    "Collaborate with designers to implement research findings"
                  ]
                },
                104: {
                  id: 104,
                  title: "Data Scientist",
                  company: "Etisalat Analytics",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "28,000 - 38,000 AED/month",
                  postedDate: "Just now",
                  companyLogo: "https://logo.clearbit.com/etisalat.ae",
                  matchScore: 90,
                  requiredSkills: ["Python", "Machine Learning", "SQL", "Data Visualization", "TensorFlow"],
                  description: "Etisalat Analytics is seeking a Data Scientist to join our growing team. You'll be responsible for developing advanced machine learning models and data-driven solutions to solve complex business problems across the telecommunications industry.",
                  applicationStatus: "open",
                  benefits: ["Health Insurance", "Performance Bonuses", "Career Development", "Flexible Working"],
                  requirements: [
                    "Advanced degree in Computer Science, Statistics, or related field",
                    "3+ years of experience in data science",
                    "Proficiency in Python and SQL",
                    "Experience with machine learning frameworks like TensorFlow or PyTorch",
                    "Strong background in statistical analysis"
                  ],
                  responsibilities: [
                    "Develop and implement machine learning models",
                    "Process, cleanse, and validate data",
                    "Conduct statistical analysis",
                    "Create data visualizations and dashboards",
                    "Communicate insights to business stakeholders"
                  ]
                },
                105: {
                  id: 105,
                  title: "Data Engineer",
                  company: "Dubai Data",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "26,000 - 36,000 AED/month",
                  postedDate: "5 days ago",
                  companyLogo: "https://logo.clearbit.com/dubaidata.ae",
                  matchScore: 86,
                  requiredSkills: ["ETL", "Python", "SQL", "Hadoop", "Spark"],
                  description: "Dubai Data is looking for a skilled Data Engineer to build and maintain our data infrastructure. You'll design and implement ETL processes, data pipelines, and storage solutions to ensure our data is accessible, reliable, and performant.",
                  applicationStatus: "open",
                  benefits: ["Health Insurance", "Transportation Allowance", "Professional Development", "Flexible Working Hours"],
                  requirements: [
                    "4+ years of experience in data engineering",
                    "Strong SQL and Python skills",
                    "Experience with big data technologies (Hadoop, Spark)",
                    "Knowledge of cloud data services (AWS, Azure, GCP)",
                    "Understanding of data modeling and architecture"
                  ],
                  responsibilities: [
                    "Design and implement data pipelines",
                    "Build and maintain data infrastructure",
                    "Improve data reliability and quality",
                    "Optimize data delivery systems",
                    "Collaborate with data scientists and analysts"
                  ]
                },
                106: {
                  id: 106,
                  title: "Data Analyst",
                  company: "Insights Arabia",
                  location: "Abu Dhabi, UAE",
                  remote: true,
                  jobType: "Full-time",
                  salaryRange: "18,000 - 25,000 AED/month",
                  postedDate: "1 week ago",
                  companyLogo: "https://logo.clearbit.com/insightsarabia.com",
                  matchScore: 93,
                  requiredSkills: ["SQL", "Excel", "Power BI", "Data Visualization", "Statistical Analysis"],
                  description: "Insights Arabia is seeking a Data Analyst to transform complex data into actionable business insights. You'll work with stakeholders across the company to understand their data needs, analyze information, and communicate findings through reports and visualizations.",
                  applicationStatus: "open",
                  benefits: ["Health Insurance", "Remote Work", "Professional Development", "Flexible Hours"],
                  requirements: [
                    "2+ years of experience in data analysis",
                    "Proficiency in SQL and Excel",
                    "Experience with visualization tools like Power BI or Tableau",
                    "Strong analytical and problem-solving skills",
                    "Excellent communication abilities"
                  ],
                  responsibilities: [
                    "Analyze large datasets to identify trends and patterns",
                    "Create reports and dashboards",
                    "Collaborate with business stakeholders",
                    "Ensure data accuracy and integrity",
                    "Present findings to non-technical audiences"
                  ]
                },
                107: {
                  id: 107,
                  title: "UI Developer",
                  company: "TechFront Solutions",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "22,000 - 30,000 AED/month",
                  postedDate: "4 days ago",
                  companyLogo: "https://logo.clearbit.com/techfront.ae",
                  matchScore: 85,
                  requiredSkills: ["React", "HTML5", "CSS3", "SASS", "JavaScript", "UI Animation"],
                  description: "TechFront Solutions is looking for a UI Developer who can bring designs to life with clean, efficient code. You'll work closely with designers and backend developers to create responsive, accessible, and visually appealing user interfaces.",
                  applicationStatus: "open",
                  benefits: ["Health Insurance", "Flexible Working Hours", "Professional Development", "Remote Work Options"],
                  requirements: [
                    "3+ years of experience in UI development",
                    "Strong proficiency in HTML, CSS, and JavaScript",
                    "Experience with React or similar frameworks",
                    "Knowledge of UI animation techniques",
                    "Understanding of accessibility standards"
                  ],
                  responsibilities: [
                    "Implement responsive user interfaces",
                    "Translate design mockups into working code",
                    "Create and maintain reusable UI components",
                    "Optimize applications for maximum performance",
                    "Ensure cross-browser compatibility"
                  ]
                },
                108: {
                  id: 108,
                  title: "Interaction Designer",
                  company: "Digital Vision",
                  location: "Sharjah, UAE",
                  remote: true,
                  jobType: "Full-time",
                  salaryRange: "20,000 - 28,000 AED/month",
                  postedDate: "3 days ago",
                  companyLogo: "https://logo.clearbit.com/digitalvision.ae",
                  matchScore: 81,
                  requiredSkills: ["Interaction Design", "Prototyping", "Motion Design", "User Testing"],
                  description: "Digital Vision is seeking an Interaction Designer to create engaging digital experiences. You'll focus on how users interact with our products, defining behaviors, transitions, and animations that make our interfaces intuitive and delightful to use.",
                  applicationStatus: "open",
                  benefits: ["Health Insurance", "Remote Work", "Professional Development", "Creative Environment"],
                  requirements: [
                    "3+ years of experience in interaction design",
                    "Strong portfolio showcasing interaction work",
                    "Experience with prototyping tools",
                    "Knowledge of motion design principles",
                    "Understanding of user behavior"
                  ],
                  responsibilities: [
                    "Design user interactions and behaviors",
                    "Create prototypes to test interactive concepts",
                    "Develop motion guidelines for digital products",
                    "Collaborate with product teams",
                    "Test and refine interactions based on user feedback"
                  ]
                },
                109: {
                  id: 109,
                  title: "Big Data Architect",
                  company: "Abu Dhabi Smart City",
                  location: "Abu Dhabi, UAE",
                  jobType: "Full-time",
                  salaryRange: "35,000 - 45,000 AED/month",
                  postedDate: "1 week ago",
                  companyLogo: "https://logo.clearbit.com/abudhabi.ae",
                  matchScore: 79,
                  requiredSkills: ["Big Data", "Cloud Architecture", "Hadoop", "Spark", "NoSQL"],
                  description: "Abu Dhabi Smart City is looking for a Big Data Architect to design and implement our next-generation data platform. You'll be responsible for creating scalable, resilient architecture that can handle massive datasets and support city-wide smart initiatives.",
                  applicationStatus: "open",
                  benefits: ["Health Insurance", "Housing Allowance", "Annual Flights", "Professional Development"],
                  requirements: [
                    "7+ years of experience in data architecture",
                    "Experience designing big data solutions",
                    "Deep knowledge of distributed systems",
                    "Understanding of cloud platforms",
                    "Strong leadership and communication skills"
                  ],
                  responsibilities: [
                    "Design big data architecture",
                    "Define data storage and processing solutions",
                    "Establish data governance frameworks",
                    "Mentor data engineers",
                    "Ensure scalability and performance of data systems"
                  ]
                },
                110: {
                  id: 110,
                  title: "Product Manager",
                  company: "Innovation Hub",
                  location: "Dubai, UAE",
                  remote: true,
                  jobType: "Full-time",
                  salaryRange: "30,000 - 40,000 AED/month",
                  postedDate: "2 days ago",
                  companyLogo: "https://logo.clearbit.com/innovationhub.ae",
                  matchScore: 82,
                  requiredSkills: ["Product Strategy", "User Research", "Agile", "Roadmapping", "Analytics"],
                  description: "Innovation Hub is seeking an experienced Product Manager to lead our digital products. You'll work with cross-functional teams to define product vision, create roadmaps, and deliver exceptional user experiences that meet business objectives.",
                  applicationStatus: "open",
                  benefits: ["Health Insurance", "Remote Work", "Professional Development", "Stock Options"],
                  requirements: [
                    "5+ years of experience in product management",
                    "Track record of launching successful digital products",
                    "Experience with agile methodologies",
                    "Strong analytical and problem-solving skills",
                    "Excellent communication and leadership abilities"
                  ],
                  responsibilities: [
                    "Define product strategy and roadmap",
                    "Lead cross-functional teams through product lifecycle",
                    "Gather and prioritize requirements",
                    "Analyze market trends and user feedback",
                    "Drive product success metrics"
                  ]
                },
                111: {
                  id: 111,
                  title: "Machine Learning Engineer",
                  company: "AI Emirates",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "32,000 - 42,000 AED/month",
                  postedDate: "3 days ago",
                  companyLogo: "https://logo.clearbit.com/aiemirates.ae",
                  matchScore: 88,
                  requiredSkills: ["Machine Learning", "Python", "Deep Learning", "NLP", "Computer Vision"],
                  description: "AI Emirates is looking for a Machine Learning Engineer to develop innovative AI solutions. You'll design and implement machine learning systems, work with large datasets, and create models that solve complex business problems.",
                  applicationStatus: "open",
                  benefits: ["Health Insurance", "Flexible Hours", "Professional Development", "Research Budget"],
                  requirements: [
                    "4+ years of experience in machine learning engineering",
                    "Strong programming skills in Python",
                    "Experience with ML frameworks (TensorFlow, PyTorch)",
                    "Knowledge of deep learning techniques",
                    "Understanding of NLP or computer vision"
                  ],
                  responsibilities: [
                    "Design and develop machine learning systems",
                    "Build and optimize ML models",
                    "Implement data pipelines for ML workflows",
                    "Collaborate with data scientists and engineers",
                    "Deploy and monitor ML models in production"
                  ]
                },
                112: {
                  id: 112,
                  title: "Visual Designer",
                  company: "Brand Vision",
                  location: "Dubai, UAE",
                  remote: true,
                  jobType: "Full-time",
                  salaryRange: "18,000 - 25,000 AED/month",
                  postedDate: "1 week ago",
                  companyLogo: "https://logo.clearbit.com/brandvision.ae",
                  matchScore: 87,
                  requiredSkills: ["Visual Design", "Brand Identity", "Typography", "Adobe Creative Suite"],
                  description: "Brand Vision is seeking a talented Visual Designer to create stunning visual assets for our clients. You'll develop brand identities, marketing materials, and digital designs that communicate effectively and leave a lasting impression.",
                  applicationStatus: "open",
                  benefits: ["Health Insurance", "Remote Work", "Creative Environment", "Professional Development"],
                  requirements: [
                    "3+ years of experience in visual design",
                    "Strong portfolio showcasing brand and visual design work",
                    "Proficiency in Adobe Creative Suite",
                    "Understanding of typography and color theory",
                    "Experience with digital and print design"
                  ],
                  responsibilities: [
                    "Create visual designs for various media",
                    "Develop brand identities and guidelines",
                    "Design marketing and promotional materials",
                    "Collaborate with creative and marketing teams",
                    "Ensure brand consistency across materials"
                  ]
                }
                // Add other UI/UX and data jobs as needed
              };

              // Return the specific job if it exists in our mock data
              if (mockJobs[id]) {
                return { data: mockJobs[id] };
              }

              // Default fallback if job ID not found
              return {
                data: {
                  id,
                  title: "Software Developer",
                  company: "TamkeenAI",
                  location: "Dubai, UAE",
                  jobType: "Full-time",
                  salaryRange: "25,000 - 35,000 AED/month",
                  postedDate: "2 days ago",
                  companyLogo: "https://logo.clearbit.com/tamkeen.ae",
                  matchScore: 85,
                  requiredSkills: ["React", "JavaScript", "Node.js", "TypeScript"],
                  description: "Join our innovative team to develop cutting-edge solutions for the UAE market. We're looking for a talented Software Developer who is passionate about creating exceptional user experiences and ready to work on challenging projects.",
                  applicationStatus: "open",
                  benefits: ["Health Insurance", "Annual Flights", "Housing Allowance"],
                  requirements: [
                    "3+ years of experience in software development",
                    "Strong proficiency in React and Node.js",
                    "Experience with TypeScript and modern JavaScript",
                    "Excellent problem-solving skills"
                  ],
                  responsibilities: [
                    "Develop and maintain web applications",
                    "Collaborate with cross-functional teams",
                    "Write clean, maintainable code",
                    "Participate in code reviews"
                  ]
                }
              };
            }
          } catch (err) {
            console.error("Error in getJobData:", err);
            throw err;
          }
        };
        
        const getSavedJobs = async (userId) => {
          try {
            if (JOB_ENDPOINTS.getSavedJobs) {
              return await JOB_ENDPOINTS.getSavedJobs(userId);
            } else {
              console.log("Using mock getSavedJobs implementation");
              return { data: [] };
            }
          } catch (err) {
            console.error("Error in getSavedJobs:", err);
            throw err;
          }
        };
        
        const getSimilarJobs = async (jobId) => {
          try {
            if (JOB_ENDPOINTS.getSimilarJobs) {
              return await JOB_ENDPOINTS.getSimilarJobs(jobId);
            } else {
              console.log("Using mock getSimilarJobs implementation");
              // Enhanced mock similar jobs with additional roles
              return { data: [
                // Existing design and data roles
                {
                  id: 101,
                  title: "UI/UX Designer",
                  company: { name: "Creative Solutions" },
                  location: "Dubai, UAE",
                  remote: true,
                  jobType: "Full-time",
                  salaryRange: "25,000 - 32,000 AED/month",
                  postedDate: "3 days ago",
                  companyLogo: "https://logo.clearbit.com/creativesolutions.ae",
                  matchScore: 92,
                  skills: ["Figma", "Adobe XD", "Sketch", "User Research", "Prototyping"]
                },
                {
                  id: 102,
                  title: "Senior Product Designer",
                  company: { name: "Emirates Digital" },
                  location: "Dubai, UAE",
                  remote: false,
                  jobType: "Full-time",
                  salaryRange: "30,000 - 40,000 AED/month",
                  postedDate: "1 week ago",
                  companyLogo: "https://logo.clearbit.com/emirates.com",
                  matchScore: 84,
                  skills: ["Product Design", "UX Strategy", "User Testing", "Design Systems"]
                },
                // Additional regular job listings
                {
                  id: 1,
                  title: "Senior Software Engineer",
                  company: { name: "Tech Solutions UAE" },
                  location: "Dubai, UAE",
                  remote: false,
                  jobType: "Full-time",
                  salaryRange: "25,000 - 35,000 AED/month",
                  postedDate: "2 days ago",
                  companyLogo: "https://logo.clearbit.com/microsoft.com",
                  matchScore: 85,
                  skills: ["React", "Node.js", "TypeScript", "AWS"]
                },
                {
                  id: 2,
                  title: "Marketing Manager",
                  company: { name: "Global Marketing LLC" },
                  location: "Abu Dhabi, UAE",
                  remote: false,
                  jobType: "Full-time",
                  salaryRange: "20,000 - 30,000 AED/month",
                  postedDate: "1 week ago",
                  companyLogo: "https://logo.clearbit.com/globalmarketing.ae",
                  matchScore: 75,
                  skills: ["Digital Marketing", "Social Media", "Content Strategy"]
                },
                {
                  id: 3,
                  title: "Financial Analyst",
                  company: { name: "Emirates Investment Bank" },
                  location: "Dubai, UAE",
                  remote: false,
                  jobType: "Full-time",
                  salaryRange: "18,000 - 25,000 AED/month",
                  postedDate: "3 days ago",
                  companyLogo: "https://logo.clearbit.com/emiratesbank.ae",
                  matchScore: 90,
                  skills: ["Financial Modeling", "Excel", "PowerBI"]
                },
                {
                  id: 4,
                  title: "HR Manager",
                  company: { name: "Al Futtaim Group" },
                  location: "Dubai, UAE",
                  remote: false,
                  jobType: "Full-time",
                  salaryRange: "22,000 - 28,000 AED/month",
                  postedDate: "1 day ago",
                  companyLogo: "https://logo.clearbit.com/alfuttaim.com",
                  matchScore: 80,
                  skills: ["HR Management", "Recruitment", "Employee Relations"]
                },
                {
                  id: 5,
                  title: "Project Manager",
                  company: { name: "EMAAR Properties" },
                  location: "Dubai, UAE",
                  remote: false,
                  jobType: "Full-time",
                  salaryRange: "30,000 - 40,000 AED/month",
                  postedDate: "5 days ago",
                  companyLogo: "https://logo.clearbit.com/emaar.com",
                  matchScore: 85,
                  skills: ["Project Management", "Construction", "Stakeholder Management"]
                },
                {
                  id: 6,
                  title: "Data Scientist",
                  company: { name: "Etisalat Digital" },
                  location: "Dubai, UAE",
                  remote: false,
                  jobType: "Full-time",
                  salaryRange: "28,000 - 38,000 AED/month",
                  postedDate: "Just now",
                  companyLogo: "https://logo.clearbit.com/etisalat.ae",
                  matchScore: 88,
                  skills: ["Python", "Machine Learning", "SQL", "Deep Learning"]
                },
                // New jobs
                {
                  id: 16,
                  title: "UI/UX Designer",
                  company: { name: "Dubizzle" },
                  location: "Dubai, UAE",
                  remote: false,
                  jobType: "Full-time",
                  salaryRange: "18,000 - 28,000 AED/month",
                  postedDate: "11 hours ago",
                  companyLogo: "https://logo.clearbit.com/dubizzle.com",
                  matchScore: 93,
                  skills: ["Figma", "User Research", "Wireframing", "Prototyping", "UI Design"]
                },
                {
                  id: 17,
                  title: "Supply Chain Manager",
                  company: { name: "Amazon UAE" },
                  location: "Dubai, UAE",
                  remote: false,
                  jobType: "Full-time",
                  salaryRange: "30,000 - 40,000 AED/month",
                  postedDate: "12 hours ago",
                  companyLogo: "https://logo.clearbit.com/amazon.ae",
                  matchScore: 85,
                  skills: ["Supply Chain Management", "Logistics", "Inventory Management", "Procurement"]
                },
                {
                  id: 18,
                  title: "Healthcare Administrator",
                  company: { name: "Cleveland Clinic Abu Dhabi" },
                  location: "Abu Dhabi, UAE",
                  remote: false,
                  jobType: "Full-time",
                  salaryRange: "22,000 - 32,000 AED/month",
                  postedDate: "13 hours ago",
                  companyLogo: "https://logo.clearbit.com/clevelandclinicabudhabi.ae",
                  matchScore: 87,
                  skills: ["Healthcare Administration", "Operations Management", "Healthcare Regulations"]
                },
                {
                  id: 19,
                  title: "Cybersecurity Analyst",
                  company: { name: "Dubai Electronic Security Center" },
                  location: "Dubai, UAE",
                  remote: false,
                  jobType: "Full-time",
                  salaryRange: "25,000 - 35,000 AED/month",
                  postedDate: "14 hours ago",
                  companyLogo: "https://logo.clearbit.com/desc.gov.ae",
                  matchScore: 90,
                  skills: ["Network Security", "Threat Analysis", "Vulnerability Assessment", "SIEM"]
                },
                {
                  id: 20,
                  title: "Hotel Manager",
                  company: { name: "Address Hotels + Resorts" },
                  location: "Dubai, UAE",
                  remote: false,
                  jobType: "Full-time",
                  salaryRange: "28,000 - 38,000 AED/month",
                  postedDate: "15 hours ago",
                  companyLogo: "https://logo.clearbit.com/addresshotels.com",
                  matchScore: 86,
                  skills: ["Hospitality Management", "Revenue Management", "Customer Service", "Team Leadership"]
                },
                // Keep existing specialized roles
                {
                  id: 104,
                  title: "Data Scientist",
                  company: { name: "Etisalat Analytics" },
                  location: "Dubai, UAE",
                  remote: false,
                  jobType: "Full-time",
                  salaryRange: "28,000 - 38,000 AED/month",
                  postedDate: "Just now",
                  companyLogo: "https://logo.clearbit.com/etisalat.ae",
                  matchScore: 90,
                  skills: ["Python", "Machine Learning", "SQL", "Data Visualization", "TensorFlow"]
                }
                // ... rest of existing jobs can remain ...
              ]};
            }
          } catch (err) {
            console.error("Error in getSimilarJobs:", err);
            throw err;
          }
        };
        
        const calculateSkillsMatch = async (jobId, userId) => {
          try {
            if (JOB_ENDPOINTS.calculateSkillsMatch) {
              return await JOB_ENDPOINTS.calculateSkillsMatch(jobId, userId);
            } else {
              console.log("Using mock calculateSkillsMatch implementation");
              return { 
                data: {
                  score: 75,
                  matching: ["React", "JavaScript"],
                  missing: ["Python", "AWS"],
                  total: 4
                } 
              };
            }
          } catch (err) {
            console.error("Error in calculateSkillsMatch:", err);
            throw err;
          }
        };
        
        // Mock company API if needed
        const getCompanyById = async (companyId) => {
          try {
            if (api.companies && api.companies.getCompanyById) {
              return await api.companies.getCompanyById(companyId);
            } else {
              console.log("Using mock getCompanyById implementation");
              // Enhanced company mock data
              const mockCompanies = {
                "Tech Solutions UAE": {
                  id: "tech-solutions",
                  name: "Tech Solutions UAE",
                  industry: "Information Technology",
                  description: "Tech Solutions UAE is a leading technology company specializing in digital transformation solutions for businesses across the Middle East. With a focus on innovation and excellence, we help organizations leverage the latest technologies to improve efficiency, scalability, and customer experience. Our team of experts provides tailored solutions in cloud computing, AI, mobile app development, and enterprise software.",
                  size: "501-1000 employees",
                  founded: "2011",
                  headquarters: "Dubai Internet City, Dubai, UAE",
                  logo: "https://logo.clearbit.com/microsoft.com",
                  website: "https://techsolutionsuae.com",
                  benefits: ["Flexible working hours", "Remote work options", "Health insurance", "Career development programs", "Team building events"],
                  culture: "We foster a culture of innovation, collaboration, and continuous learning. Our diverse team comes from over 25 different countries, bringing global expertise to local challenges.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/techsolutionsuae",
                    twitter: "https://twitter.com/techsolutionsuae",
                    facebook: "https://facebook.com/techsolutionsuae"
                  }
                },
                "Global Marketing LLC": {
                  id: "global-marketing",
                  name: "Global Marketing LLC",
                  industry: "Marketing and Advertising",
                  description: "Global Marketing LLC is a full-service marketing agency headquartered in Abu Dhabi, with expertise in digital marketing, brand strategy, and content creation. We work with both local and international clients to build compelling marketing campaigns that drive engagement and business growth. Our creative team combines local market knowledge with global best practices to deliver outstanding results.",
                  size: "201-500 employees",
                  founded: "2014",
                  headquarters: "Al Reem Island, Abu Dhabi, UAE",
                  logo: "https://logo.clearbit.com/globalmarketing.ae",
                  website: "https://globalmarketingllc.ae",
                  benefits: ["Competitive salary", "Professional development budget", "Health and wellness programs", "Annual retreats", "Flexible working arrangements"],
                  culture: "Our agency embraces creativity, innovation, and strategic thinking. We believe in fostering a collaborative environment where ideas can flourish and talent can grow.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/globalmarketingllc",
                    instagram: "https://instagram.com/globalmarketingllc",
                    facebook: "https://facebook.com/globalmarketingllc"
                  }
                },
                "Emirates Investment Bank": {
                  id: "emirates-investment",
                  name: "Emirates Investment Bank",
                  industry: "Banking and Financial Services",
                  description: "Emirates Investment Bank is a leading private and investment banking institution based in Dubai. We offer a comprehensive range of financial services including wealth management, corporate advisory, and investment banking solutions. With a focus on building long-term relationships, we provide personalized financial strategies for high net worth individuals, family offices, and corporate clients across the MENA region.",
                  size: "501-1000 employees",
                  founded: "2004",
                  headquarters: "Dubai International Financial Centre, Dubai, UAE",
                  logo: "https://logo.clearbit.com/emiratesbank.ae",
                  website: "https://emiratesinvestmentbank.ae",
                  benefits: ["Competitive compensation packages", "Performance bonuses", "Comprehensive health insurance", "Retirement plans", "Professional certification support"],
                  culture: "We maintain a culture of excellence, integrity, and client focus. Our diverse team of financial experts is committed to delivering exceptional service and results.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/emiratesinvestmentbank",
                    twitter: "https://twitter.com/emiratesbank"
                  }
                },
                "Al Futtaim Group": {
                  id: "al-futtaim",
                  name: "Al Futtaim Group",
                  industry: "Conglomerate (Retail, Automotive, Real Estate)",
                  description: "Al Futtaim Group is one of the most diversified businesses in the region, operating through more than 200 companies across sectors including automotive, retail, real estate, and financial services. Beginning as a trading business in the 1930s, Al Futtaim has grown into a multinational conglomerate representing some of the world's most recognizable brands. We are committed to enriching the lives of our customers by providing quality products and services.",
                  size: "10,000+ employees",
                  founded: "1930",
                  headquarters: "Dubai, UAE",
                  logo: "https://logo.clearbit.com/alfuttaim.com",
                  website: "https://alfuttaim.com",
                  benefits: ["Competitive remuneration", "Healthcare coverage", "Employee discount program", "Professional development", "International career opportunities"],
                  culture: "Our culture is built on the values of respect, integrity, collaboration, and excellence. We encourage entrepreneurial spirit and innovation while maintaining the highest ethical standards.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/alfuttaim",
                    facebook: "https://facebook.com/alfuttaimgroup",
                    instagram: "https://instagram.com/alfuttaimgroup"
                  }
                },
                "EMAAR Properties": {
                  id: "emaar",
                  name: "EMAAR Properties",
                  industry: "Real Estate Development",
                  description: "EMAAR Properties is one of the world's most valuable and admired real estate development companies. We have transformed the architectural landscape of Dubai with iconic projects like Burj Khalifa, Dubai Mall, and Dubai Opera. Beyond the UAE, EMAAR has expanded internationally with developments across the Middle East, North Africa, Asia, Europe, and North America. Our integrated lifestyle destinations combine residential, commercial, retail, hospitality, and leisure components.",
                  size: "5,001-10,000 employees",
                  founded: "1997",
                  headquarters: "Downtown Dubai, Dubai, UAE",
                  logo: "https://logo.clearbit.com/emaar.com",
                  website: "https://emaar.com",
                  benefits: ["Competitive salary and bonuses", "Accommodation allowance", "Health insurance", "Education assistance", "Annual air tickets"],
                  culture: "At EMAAR, we foster a culture of excellence, innovation, and customer-centricity. We are driven by our mission to 'Build the Future' through iconic developments that enhance lives.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/emaar-properties",
                    twitter: "https://twitter.com/emaardubai",
                    instagram: "https://instagram.com/emaardubai",
                    facebook: "https://facebook.com/emaardubai"
                  }
                },
                "Etisalat Digital": {
                  id: "etisalat",
                  name: "Etisalat Digital",
                  industry: "Telecommunications & Technology",
                  description: "Etisalat Digital, a division of e& (formerly Etisalat Group), is at the forefront of digital transformation in the MENA region. We provide innovative solutions in IoT, cloud computing, cybersecurity, and artificial intelligence to help businesses navigate the digital landscape. Our expert teams work with organizations across sectors including government, healthcare, finance, and retail to implement cutting-edge technologies that drive growth and efficiency.",
                  size: "1,000-5,000 employees",
                  founded: "2016",
                  headquarters: "Abu Dhabi, UAE",
                  logo: "https://logo.clearbit.com/etisalat.ae",
                  website: "https://etisalat.ae/digital",
                  benefits: ["Competitive compensation", "Health and life insurance", "Career development", "Employee wellness programs", "Performance bonuses"],
                  culture: "We promote a culture of innovation, agility, and customer-centricity. Our diverse team embraces challenges and collaborates to create digital solutions that positively impact society.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/etisalat-digital",
                    twitter: "https://twitter.com/etisalatdigital",
                    facebook: "https://facebook.com/etisalatdigital"
                  }
                },
                "Jumeirah Group": {
                  id: "jumeirah",
                  name: "Jumeirah Group",
                  industry: "Hospitality & Tourism",
                  description: "Jumeirah Group is a global luxury hotel company and member of Dubai Holding. We operate a world-class portfolio of hotels and resorts, including the iconic Burj Al Arab Jumeirah. Our company manages properties in the Middle East, Europe, and Asia, with more destinations planned across the world. We are committed to delivering exceptional experiences through our unique blend of Arabian hospitality and contemporary luxury.",
                  size: "10,000+ employees",
                  founded: "1997",
                  headquarters: "Dubai, UAE",
                  logo: "https://logo.clearbit.com/jumeirah.com",
                  website: "https://jumeirah.com",
                  benefits: ["Competitive salary", "Accommodation or allowance", "Travel benefits", "Discounted stays at Jumeirah hotels", "Career development programs"],
                  culture: "We embrace a culture of excellence and innovation in all aspects of our operations. Our diverse team from over 140 nationalities is united by a commitment to creating extraordinary experiences for our guests.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/jumeirah-group",
                    twitter: "https://twitter.com/jumeirah",
                    instagram: "https://instagram.com/jumeirahgroup",
                    facebook: "https://facebook.com/jumeirah"
                  }
                },
                "AECOM Middle East": {
                  id: "aecom",
                  name: "AECOM Middle East",
                  industry: "Engineering & Construction",
                  description: "AECOM Middle East is a premier infrastructure consulting firm delivering professional services across the project lifecycle – from planning, design and engineering to program and construction management. We partner with our clients to solve the world's most complex challenges and build legacies for generations to come. In the Middle East, we've delivered landmark projects including major transportation networks, sustainable buildings, and critical infrastructure.",
                  size: "1,000-5,000 employees",
                  founded: "1990",
                  headquarters: "Dubai, UAE (Regional HQ)",
                  logo: "https://logo.clearbit.com/aecom.com",
                  website: "https://aecom.com/middle-east/",
                  benefits: ["Competitive package", "Health insurance", "Professional membership fees", "Relocation assistance", "Training & development"],
                  culture: "We foster a culture of equity, diversity and inclusion. Our teams collaborate across disciplines and regions to deliver innovative solutions that positively impact communities throughout the Middle East.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/aecom",
                    twitter: "https://twitter.com/aecom",
                    instagram: "https://instagram.com/aecommiddleeast"
                  }
                },
                "Noon.com": {
                  id: "noon",
                  name: "Noon.com",
                  industry: "E-commerce & Technology",
                  description: "Noon.com is the Middle East's homegrown online marketplace, founded to serve the region with technology, innovation, and a passion for growth. Since our launch in 2017, we've built a platform that connects consumers with thousands of merchants and millions of products. Our mission is to build an ecosystem of digital platforms to serve businesses and consumers across the MENA region.",
                  size: "1,001-5,000 employees",
                  founded: "2017",
                  headquarters: "Dubai, UAE",
                  logo: "https://logo.clearbit.com/noon.com",
                  website: "https://noon.com",
                  benefits: ["Competitive salary", "Stock options", "Health insurance", "Flexible working hours", "Professional development"],
                  culture: "We embrace a startup culture with an entrepreneurial spirit. Our team is passionate about technology, e-commerce, and creating solutions specifically designed for the Middle Eastern market.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/noon",
                    twitter: "https://twitter.com/noon",
                    instagram: "https://instagram.com/noon",
                    facebook: "https://facebook.com/noon"
                  }
                },
                "DP World": {
                  id: "dpworld",
                  name: "DP World",
                  industry: "Transportation & Logistics",
                  description: "DP World is a leading provider of smart logistics solutions, enabling the flow of trade across the globe. With our interconnected global network of ports, terminals, economic zones and maritime services, we're working to change what's possible in the trade ecosystem. We're rapidly transforming into a global supply chain solutions provider through data-driven logistics services, innovative technology and customer-centric workforce initiatives.",
                  size: "50,000+ employees",
                  founded: "2005",
                  headquarters: "Dubai, UAE",
                  logo: "https://logo.clearbit.com/dpworld.com",
                  website: "https://dpworld.com",
                  benefits: ["Competitive compensation", "Health insurance", "Professional training", "Global career opportunities", "Performance bonuses"],
                  culture: "Our culture is built on the values of respect, courage, intelligence, and pride. We believe in sustainable business practices and are committed to creating a positive impact on the communities where we operate.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/dp-world",
                    twitter: "https://twitter.com/dpworlduae",
                    facebook: "https://facebook.com/dpworld"
                  }
                },
                "Careem": {
                  id: "careem",
                  name: "Careem",
                  industry: "Technology & Transportation",
                  description: "Careem is the leading technology platform for the greater Middle East region. A pioneer of the region's ride-hailing economy, we're now expanding services across our Super App to include food and grocery delivery, payments, and other services. Since 2012, we've created earning opportunities for over 1.7 million Captains (drivers) and simplified everyday life for over 50 million customers.",
                  size: "1,001-5,000 employees",
                  founded: "2012",
                  headquarters: "Dubai, UAE",
                  logo: "https://logo.clearbit.com/careem.com",
                  website: "https://careem.com",
                  benefits: ["Competitive salary", "Stock options", "Health insurance", "Flexible working", "Learning & development budget"],
                  culture: "We're purpose-driven - simplifying lives and building an awesome organization that inspires. Our values include being bold, focused, agile, collaborative, and customer-obsessed.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/careem",
                    twitter: "https://twitter.com/careem",
                    instagram: "https://instagram.com/careem",
                    facebook: "https://facebook.com/careem"
                  }
                },
                "Majid Al Futtaim": {
                  id: "majidalfuttaim",
                  name: "Majid Al Futtaim",
                  industry: "Retail & Entertainment",
                  description: "Majid Al Futtaim is the leading shopping mall, communities, retail and leisure pioneer across the Middle East, Africa and Asia. We create great moments for everyone, every day through our portfolio of high-quality malls, hotels, communities, and leisure destinations. We operate more than 600 VOX Cinema screens, Carrefour hypermarkets, Magic Planet family entertainment centers, and innovative retail concepts like THAT across the MENA region.",
                  size: "40,000+ employees",
                  founded: "1992",
                  headquarters: "Dubai, UAE",
                  logo: "https://logo.clearbit.com/majidalfuttaim.com",
                  website: "https://majidalfuttaim.com",
                  benefits: ["Competitive compensation", "Healthcare benefits", "Staff discounts", "Professional development", "Work-life balance programs"],
                  culture: "Our workplace culture is built around our core values of passion, vision, and integrity. We're committed to creating an inclusive environment where our people can grow and develop their careers while making a positive impact.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/majid-al-futtaim",
                    twitter: "https://twitter.com/majidalfuttaim",
                    instagram: "https://instagram.com/majidalfuttaim",
                    facebook: "https://facebook.com/MajidAlFuttaim"
                  }
                },
                "MBC Group": {
                  id: "mbc",
                  name: "MBC Group",
                  industry: "Media & Entertainment",
                  description: "MBC Group is the largest and leading multimedia company in the Middle East & North Africa. Since 1991, we've grown to include 18 TV channels and various digital platforms that reach over 150 million viewers daily. Our portfolio includes news, entertainment, and streaming services like Shahid VIP. We're committed to producing high-quality Arabic content and bringing world-class entertainment to the region.",
                  size: "2,001-5,000 employees",
                  founded: "1991",
                  headquarters: "Dubai, UAE",
                  logo: "https://logo.clearbit.com/mbc.net",
                  website: "https://mbc.net",
                  benefits: ["Competitive salary", "Health insurance", "Career advancement", "Creative environment", "Work-life balance"],
                  culture: "Our culture encourages creativity, innovation, and authenticity. We bring together diverse talents across the region to create memorable content that resonates with Arab audiences worldwide.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/mbc-group",
                    twitter: "https://twitter.com/mbc_group",
                    instagram: "https://instagram.com/mbcgroup",
                    facebook: "https://facebook.com/MBCGroupTV"
                  }
                },
                "ADNOC": {
                  id: "adnoc",
                  name: "ADNOC",
                  industry: "Energy & Resources",
                  description: "Abu Dhabi National Oil Company (ADNOC) is one of the world's leading energy producers and a primary catalyst for Abu Dhabi's growth and diversification. We operate across the entire hydrocarbon value chain, from exploration to production, from processing to distribution, and are expanding into renewable energy. Our integrated approach allows us to create maximum value from our resources while driving sustainable economic development for the UAE.",
                  size: "50,000+ employees",
                  founded: "1971",
                  headquarters: "Abu Dhabi, UAE",
                  logo: "https://logo.clearbit.com/adnoc.ae",
                  website: "https://adnoc.ae",
                  benefits: ["Competitive compensation", "Housing allowance", "Educational assistance", "Health insurance", "End of service benefits"],
                  culture: "We're driven by our values of collaborative, efficient, progressive, respectful, and responsible. Our vision is to transform how we maximize value from every molecule we produce, while remaining a reliable and sustainable energy provider for generations to come.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/adnoc",
                    twitter: "https://twitter.com/adnocgroup",
                    instagram: "https://instagram.com/adnocgroup",
                    facebook: "https://facebook.com/ADNOC"
                  }
                },
                "Emirates NBD": {
                  id: "emiratesnbd",
                  name: "Emirates NBD",
                  industry: "Banking & Financial Services",
                  description: "Emirates NBD is a leading banking group in the MENAT (Middle East, North Africa and Turkey) region. We provide retail, corporate, Islamic, investment, and private banking services, with a strong focus on digital innovation and customer experience. With total assets of AED 742 billion, we're one of the largest banking groups in the UAE and operate in 13 countries, serving over 9 million customers globally.",
                  size: "10,000+ employees",
                  founded: "1963",
                  headquarters: "Dubai, UAE",
                  logo: "https://logo.clearbit.com/emiratesnbd.com",
                  website: "https://emiratesnbd.com",
                  benefits: ["Competitive salary", "Annual bonus", "Health insurance", "Education allowance", "Banking benefits"],
                  culture: "Our culture is built on the core values of integrity, customer focus, innovation, teamwork, and service excellence. We embrace diversity and inclusion, with employees representing over 70 nationalities.",
                  socialMedia: {
                    linkedin: "https://linkedin.com/company/emirates-nbd",
                    twitter: "https://twitter.com/emiratesnbd",
                    instagram: "https://instagram.com/emiratesnbd",
                    facebook: "https://facebook.com/EmiratesNBD"
                  }
                }
              };
              
              // Find company by name
              const company = job.company;
              
              if (mockCompanies[company]) {
                return { data: mockCompanies[company] };
              }
              
              // Default fallback if company not found
              return { 
                data: {
                  id: companyId,
                  name: company || "Unknown Company", 
                  industry: "Technology",
                  description: "This is a leading company in its industry, known for innovation and excellence. The company is committed to creating value for its customers, employees, and shareholders through sustainable business practices and cutting-edge solutions.",
                  size: "51-200 employees",
                  founded: "2010",
                  headquarters: "Dubai, UAE",
                  logo: job.companyLogo || "https://via.placeholder.com/150",
                  website: "https://example.com",
                  benefits: ["Competitive salary", "Health insurance", "Professional development", "Work-life balance"],
                  culture: "The company fosters a culture of innovation, teamwork, and continuous improvement. Employees are encouraged to think creatively and take initiative in solving problems.",
                  jobs: []
                } 
              };
            }
          } catch (err) {
            console.error("Error in getCompanyById:", err);
            throw err;
          }
        };
        
        const isCompanyFollowed = async (companyId, userId) => {
          try {
            if (api.companies && api.companies.isFollowed) {
              return await api.companies.isFollowed(companyId, userId);
            } else {
              console.log("Using mock isCompanyFollowed implementation");
              return { data: { following: false } };
            }
          } catch (err) {
            console.error("Error in isCompanyFollowed:", err);
            throw err;
          }
        };
        
        // Fetch job details using the mock or real function
        const jobResponse = await getJobData(jobId);
        setJob(jobResponse.data);
        
        // Load similar jobs
        const similarJobsResponse = await getSimilarJobs(jobId);
        setSimilarJobs(similarJobsResponse.data || []);
        
        // Calculate skills match if user is logged in
        if (profile?.id) {
          const skillsMatchResponse = await calculateSkillsMatch(jobId, profile.id);
          setSkillsMatch(skillsMatchResponse.data || {
            score: 0,
            matching: [],
            missing: [],
            total: 0
          });
        }
        
        // Load company details
        if (jobResponse.data.company?.id) {
          const companyResponse = await getCompanyById(jobResponse.data.company.id);
          setCompanyDetails(companyResponse.data);
          
          // Check if company is followed
          if (profile?.id) {
            const isFollowed = await isCompanyFollowed(jobResponse.data.company.id, profile.id);
            setIsCompanyFollowed(isFollowed.data.following);
          }
        }
        
        // Initialize application form
        if (resumes && resumes.length > 0) {
          setApplicationForm(prev => ({
            ...prev,
            resumeId: resumes[0].id,
            phone: profile?.phone || ''
          }));
        }
      } catch (err) {
        console.error('Error loading job details:', err);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadJobDetails();
  }, [jobId, profile, resumes]);
  
  // Toggle save job
  const handleToggleSaveJob = async () => {
    if (!profile?.id) {
      navigate('/login', { state: { from: `/jobs/${jobId}` } });
      return;
    }
    
    try {
      // Use the global toggleSaveJob function from context
      await toggleSaveJob(job);
      
      // Show success message
      if (isSavedJob(job.id)) {
        setSnackbarMessage('Job removed from saved jobs');
      } else {
        setSnackbarMessage('Job saved successfully');
      }
      
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error toggling job save:', err);
      setSnackbarMessage('Failed to update saved jobs');
      setSnackbarOpen(true);
    }
  };
  
  // Toggle company follow
  const handleToggleFollowCompany = async () => {
    if (!profile?.id || !job?.company?.id) {
      navigate('/login', { state: { from: `/jobs/${jobId}` } });
      return;
    }
    
    try {
      // Create mock functions if they don't exist
      const followCompany = async (companyId, userId) => {
        if (api.companies && api.companies.followCompany) {
          return await api.companies.followCompany(companyId, userId);
        } else {
          console.log("Using mock followCompany implementation");
          return { success: true };
        }
      };
      
      const unfollowCompany = async (companyId, userId) => {
        if (api.companies && api.companies.unfollowCompany) {
          return await api.companies.unfollowCompany(companyId, userId);
        } else {
          console.log("Using mock unfollowCompany implementation");
          return { success: true };
        }
      };
      
      if (isCompanyFollowed) {
        await unfollowCompany(job.company.id, profile.id);
        setSnackbarMessage(`Unfollowed ${job.company.name}`);
      } else {
        await followCompany(job.company.id, profile.id);
        setSnackbarMessage(`Now following ${job.company.name}`);
      }
      
      setIsCompanyFollowed(!isCompanyFollowed);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error toggling company follow:', err);
      setSnackbarMessage('Failed to update follow status');
      setSnackbarOpen(true);
    }
  };
  
  // Handle application form changes
  const handleApplicationChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle question answer changes
  const handleQuestionChange = (questionId, value) => {
    setApplicationForm(prev => ({
      ...prev,
      questions: {
        ...prev.questions,
        [questionId]: value
      }
    }));
  };
  
  // Submit job application
  const handleSubmitApplication = async () => {
    if (!profile?.id) {
      navigate('/login', { state: { from: `/jobs/${jobId}` } });
      return;
    }
    
    setApplicationStatus('submitting');
    setApplicationError(null);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setApplyProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);
    
    try {
      // Create mock function if it doesn't exist
      const applyToJob = async (applicationData) => {
        if (JOB_ENDPOINTS.apply) {
          return await JOB_ENDPOINTS.apply(applicationData);
        } else {
          console.log("Using mock job application implementation");
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          return { success: true };
        }
      };
      
      // Submit application
      await applyToJob({
        jobId,
        userId: profile.id,
        ...applicationForm
      });
      
      setApplicationStatus('success');
      clearInterval(progressInterval);
      setApplyProgress(100);
      
      // Close dialog after delay
      setTimeout(() => {
        setApplicationDialogOpen(false);
        setSnackbarMessage('Application submitted successfully');
        setSnackbarOpen(true);
      }, 2000);
    } catch (err) {
      console.error('Error submitting application:', err);
      setApplicationStatus('error');
      setApplicationError('Failed to submit application. Please try again.');
      clearInterval(progressInterval);
      setApplyProgress(0);
    }
  };
  
  // Share job via email
  const handleShareJob = async () => {
    if (!shareEmail) {
      return;
    }
    
    try {
      // Create mock function if it doesn't exist
      const shareJobViaEmail = async (shareData) => {
        if (JOB_ENDPOINTS.shareJob) {
          return await JOB_ENDPOINTS.shareJob(shareData);
        } else {
          console.log("Using mock shareJob implementation");
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          return { success: true };
        }
      };
      
      await shareJobViaEmail({
        jobId,
        email: shareEmail,
        message: shareMessage,
        senderName: profile?.fullName || 'A friend'
      });
      
      setShareDialogOpen(false);
      setSnackbarMessage('Job shared successfully');
      setSnackbarOpen(true);
      
      // Reset fields
      setShareEmail('');
      setShareMessage('');
    } catch (err) {
      console.error('Error sharing job:', err);
      setSnackbarMessage('Failed to share job');
      setSnackbarOpen(true);
    }
  };
  
  // Report job listing
  const handleReportJob = async () => {
    if (!reportReason) {
      return;
    }
    
    try {
      // Create mock function if it doesn't exist
      const reportJobListing = async (reportData) => {
        if (JOB_ENDPOINTS.reportJob) {
          return await JOB_ENDPOINTS.reportJob(reportData);
        } else {
          console.log("Using mock reportJob implementation");
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 800));
          return { success: true };
        }
      };
      
      await reportJobListing({
        jobId,
        userId: profile?.id,
        reason: reportReason,
        details: reportDetails
      });
      
      setReportDialogOpen(false);
      setSnackbarMessage('Job listing reported. Thank you for your feedback.');
      setSnackbarOpen(true);
      
      // Reset fields
      setReportReason('');
      setReportDetails('');
    } catch (err) {
      console.error('Error reporting job:', err);
      setSnackbarMessage('Failed to submit report');
      setSnackbarOpen(true);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }
  
  if (!job) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Job not found</Alert>
        <Button 
          startIcon={<ArrowBack />}
          onClick={() => navigate('/jobs')}
          sx={{ mt: 2 }}
        >
          Back to Job Search
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/dashboard" underline="hover">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/jobs" underline="hover">
          Jobs
        </Link>
        <Typography color="text.primary">
          {i18n.language === 'ar' && job.titleAr ? job.titleAr : job.title}
        </Typography>
      </Breadcrumbs>
      
      <Grid container spacing={3}>
        {/* Main content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {i18n.language === 'ar' && job.titleAr ? job.titleAr : job.title}
                </Typography>
                
                <Typography variant="h6" component="h2" color="primary" gutterBottom>
                  {i18n.language === 'ar' && job.companyAr ? job.companyAr : job.company?.name}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {i18n.language === 'ar' && job.locationAr ? job.locationAr : job.location}
                      {job.remote && (i18n.language === 'ar' ? ' • عن بعد' : ' • Remote')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {i18n.language === 'ar' && job.salaryRangeAr 
                        ? job.salaryRangeAr 
                        : (job.salaryRange || (job.salary && (
                            typeof job.salary === 'object' 
                              ? `${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()} AED`
                              : job.salary
                          )))}
                      {job.salaryPeriod && ` ${job.salaryPeriod}`}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Work color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {i18n.language === 'ar' && job.jobTypeAr 
                        ? job.jobTypeAr 
                        : (job.employmentType || job.jobType || 'Not specified')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Timer color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      {i18n.language === 'ar' && job.postedDateAr ? job.postedDateAr : job.postedDate}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Job Skills */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    {i18n.language === 'ar' ? 'المهارات' : 'Skills'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {job.skills?.slice(0, 5).map(skill => (
                      <Chip 
                        key={skill} 
                        label={skill} 
                        variant="outlined"
                        color="primary"
                        size="small"
                      />
                    ))}
                    
                    {job.skills?.length > 5 && (
                      <Chip
                        label={`+${job.skills.length - 5}`}
                        variant="outlined"
                        color="default"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={handleToggleSaveJob} color={isSavedJob(job?.id) ? 'primary' : 'default'}>
                  {isSavedJob(job?.id) ? <Bookmark /> : <BookmarkBorder />}
                </IconButton>
                
                <IconButton onClick={() => setShareDialogOpen(true)}>
                  <Share />
                </IconButton>
                
                <IconButton onClick={(e) => setOptionsMenuAnchorEl(e.currentTarget)}>
                  <MoreVert />
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Send />}
                onClick={() => setApplicationDialogOpen(true)}
                fullWidth
                sx={{ mb: 2 }}
              >
                {i18n.language === 'ar' ? 'تقدم الآن' : 'Apply Now'}
              </Button>
              
              <Typography variant="body2" color="text.secondary">
                {i18n.language === 'ar' ? 'التقديم السهل باستخدام سيرتك الذاتية في تمكين الذكاء الاصطناعي' : 'Easy apply with your TamkeenAI Resume'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Button 
                startIcon={<ArrowBack />}
                onClick={() => navigate('/jobs')}
              >
                {i18n.language === 'ar' ? 'العودة إلى البحث عن وظيفة' : 'Back to Job Search'}
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 3 }}
            >
              <Tab label={i18n.language === 'ar' ? 'وصف الوظيفة' : 'Job Description'} />
              <Tab label={i18n.language === 'ar' ? 'الشركة' : 'Company'} />
              <Tab label={i18n.language === 'ar' ? 'تحليل التناسب' : 'Fit Analysis'} />
            </Tabs>
            
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {i18n.language === 'ar' ? 'وصف الوظيفة' : 'Job Description'}
                </Typography>
                
                <Box sx={{ position: 'relative' }}>
                  <Box 
                    sx={{ 
                      maxHeight: showFullDescription ? 'none' : '300px', 
                      overflow: showFullDescription ? 'visible' : 'hidden',
                      mb: 2 
                    }}
                  >
                      <ReactMarkdown>
                      {i18n.language === 'ar' && job.descriptionAr 
                        ? job.descriptionAr 
                        : (job.description || 'No description available')}
                      </ReactMarkdown>
                  </Box>
                  
                  {!showFullDescription && job.description?.length > 500 && (
                    <Box 
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '80px',
                        background: 'linear-gradient(transparent, white)',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-start',
                        pb: 1,
                        pl: 1
                      }}
                    >
                      <Button 
                        onClick={() => setShowFullDescription(true)}
                        endIcon={<KeyboardArrowDown />}
                      >
                        {i18n.language === 'ar' ? 'عرض المزيد' : 'Show More'}
                      </Button>
                    </Box>
                  )}
                  
                  {showFullDescription && (
                    <Box sx={{ textAlign: 'left', mt: 2 }}>
                      <Button 
                        onClick={() => setShowFullDescription(false)}
                        endIcon={<KeyboardArrowUp />}
                      >
                        {i18n.language === 'ar' ? 'عرض أقل' : 'Show Less'}
                      </Button>
                    </Box>
                  )}
                </Box>
                
                {job.responsibilities && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {i18n.language === 'ar' ? 'المسؤوليات' : 'Responsibilities'}
                    </Typography>
                    
                    <List>
                      {job.responsibilities.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircle color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={
                            i18n.language === 'ar' && job.responsibilitiesAr && job.responsibilitiesAr[index] 
                              ? job.responsibilitiesAr[index] 
                              : item
                          } />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {job.requirements && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {i18n.language === 'ar' ? 'المتطلبات' : 'Requirements'}
                    </Typography>
                    
                    <List>
                      {job.requirements.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircle color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              i18n.language === 'ar' && job.requirementsAr && job.requirementsAr[index] 
                                ? job.requirementsAr[index] 
                                : i18n.language === 'ar' && i18n.t(`skills.${item}`, { defaultValue: item }) !== item
                                  ? i18n.t(`skills.${item}`)
                                  : item
                            } 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {job.benefits && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {i18n.language === 'ar' ? 'المزايا' : 'Benefits'}
                    </Typography>
                    
                    <List>
                      {job.benefits.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircle color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={i18n.language === 'ar' && job.benefitsAr && job.benefitsAr[index] ? job.benefitsAr[index] : item} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                
                {job.salaryRange && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {i18n.language === 'ar' ? 'الراتب والتعويضات' : 'Salary & Compensation'}
                    </Typography>
                    
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <AEDIcon color="primary" sx={{ fontSize: 28, mr: 1 }} />
                        <Typography variant="h5" color="primary.main" fontWeight="bold">
                          {i18n.language === 'ar' && job.salaryRangeAr ? job.salaryRangeAr : job.salaryRange}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" paragraph>
                        {i18n.language === 'ar' && job.salaryDetailsAr 
                          ? job.salaryDetailsAr 
                          : (job.salaryDetails || "This position offers a competitive salary package that reflects the candidate's experience and qualifications. The compensation is inclusive of basic salary and may include additional allowances based on company policy.")}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {job.benefits && job.benefits.map((benefit, index) => (
                          <Chip 
                            key={index}
                            label={i18n.language === 'ar' && job.benefitsAr && job.benefitsAr[index] ? job.benefitsAr[index] : benefit}
                            size="small"
                            icon={<CheckCircle fontSize="small" />}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box>
                {companyDetails ? (
                  <>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 3
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={companyDetails.logo} 
                          alt={companyDetails.name}
                          sx={{ width: 60, height: 60, mr: 2 }}
                        />
                        
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {companyDetails.name}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              <Business sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                              {companyDetails.industry}
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary">
                              <Group sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                              {companyDetails.size || 'Unknown size'}
                            </Typography>
                            
                            {companyDetails.founded && (
                              <Typography variant="body2" color="text.secondary">
                                <Event sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                Founded {companyDetails.founded}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                      
                      <Button
                        variant={isCompanyFollowed ? 'outlined' : 'contained'}
                        startIcon={isCompanyFollowed ? <Check /> : <PersonAdd />}
                        onClick={handleToggleFollowCompany}
                        size="small"
                      >
                        {isCompanyFollowed ? 'Following' : 'Follow'}
                      </Button>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom>
                      About {companyDetails.name}
                    </Typography>
                    
                        <Typography variant="body1" paragraph>
                      {companyDetails.description}
                        </Typography>
                        
                    {companyDetails.headquarters && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <LocationOn color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          <strong>Headquarters:</strong> {companyDetails.headquarters}
                        </Typography>
                      </Box>
                    )}
                    
                    {companyDetails.culture && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Company Culture
                        </Typography>
                        <Typography variant="body1" paragraph>
                          {companyDetails.culture}
                        </Typography>
                      </Box>
                    )}
                    
                    {companyDetails.benefits && companyDetails.benefits.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Company Benefits
                        </Typography>
                        <Grid container spacing={1}>
                          {companyDetails.benefits.map((benefit, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CheckCircle color="primary" fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="body2">{benefit}</Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                    
                    <Box sx={{ mt: 2, mb: 3, display: 'flex', gap: 2 }}>
                      {companyDetails.website && (
                        <Button
                          variant="outlined"
                          startIcon={<Public />}
                          href={companyDetails.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Visit Website
                        </Button>
                      )}
                      
                      {companyDetails.socialMedia && Object.keys(companyDetails.socialMedia).length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Connect with {companyDetails.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {companyDetails.socialMedia.linkedin && (
                              <IconButton 
                                size="small" 
                                href={companyDetails.socialMedia.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="primary"
                              >
                                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v6/icons/linkedin.svg" alt="LinkedIn" width="24" height="24" />
                              </IconButton>
                            )}
                            
                            {companyDetails.socialMedia.twitter && (
                              <IconButton 
                                size="small" 
                                href={companyDetails.socialMedia.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="primary"
                              >
                                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v6/icons/twitter.svg" alt="Twitter" width="24" height="24" />
                              </IconButton>
                            )}
                            
                            {companyDetails.socialMedia.facebook && (
                              <IconButton 
                                size="small" 
                                href={companyDetails.socialMedia.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="primary"
                              >
                                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v6/icons/facebook.svg" alt="Facebook" width="24" height="24" />
                              </IconButton>
                            )}
                            
                            {companyDetails.socialMedia.instagram && (
                              <IconButton 
                                size="small" 
                                href={companyDetails.socialMedia.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                color="primary"
                              >
                                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v6/icons/instagram.svg" alt="Instagram" width="24" height="24" />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                      )}
                    </Box>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        More Jobs at {companyDetails.name}
                      </Typography>
                      
                      {companyDetails.jobs && companyDetails.jobs.length > 0 ? (
                        <List>
                          {companyDetails.jobs.slice(0, 3).map(job => (
                            <ListItem 
                              key={job.id}
                              component={RouterLink}
                              to={`/jobs/${job.id}`}
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'action.hover' }
                              }}
                            >
                              <ListItemText 
                                primary={job.title}
                                secondary={
                                  <>
                                    <LocationOn sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                    {job.location}
                                    {job.remote && ' • Remote'}
                                    {' • '}
                                    Posted {job.postedDate}
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No other job listings available
                            </Typography>
                      )}
                      
                      {companyDetails.jobs?.length > 3 && (
                        <Button
                          component={RouterLink}
                          to={`/companies/${companyDetails.id}/jobs`}
                          sx={{ mt: 1 }}
                        >
                          View All Jobs
                        </Button>
                      )}
                    </Box>
                  </>
                ) : (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Business sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {i18n.language === 'ar' ? 'معلومات الشركة غير متوفرة' : 'Company Information Unavailable'}
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {i18n.language === 'ar' 
                        ? `ليس لدينا معلومات مفصلة عن ${job.companyAr || job.company} في الوقت الحالي.`
                        : `We don't have detailed information about ${job.company} at this time.`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {i18n.language === 'ar'
                        ? `هذه الوظيفة هي ${job.titleAr || job.title} في ${job.locationAr || job.location} براتب ${job.salaryRangeAr || job.salaryRange}.`
                        : `This position is for ${job.title} located in ${job.location} with a salary range of ${job.salaryRange}.`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {i18n.language === 'ar'
                        ? 'لا يزال بإمكانك التقدم لهذه الوظيفة ومعرفة المزيد عن الشركة أثناء عملية المقابلة.'
                        : 'You can still apply for this job and learn more about the company during the interview process.'}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {i18n.language === 'ar' ? 'تحليل تطابق المهارات' : 'Skills Match Analysis'}
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                      {i18n.language === 'ar' ? 'التطابق الكلي' : 'Overall Match'}
                    </Typography>
                    
                    <LinearProgress
                      variant="determinate"
                      value={skillsMatch.score}
                      color={
                        skillsMatch.score > 80 ? 'success' :
                        skillsMatch.score > 60 ? 'primary' :
                        skillsMatch.score > 40 ? 'warning' : 'error'
                      }
                      sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                    />
                    
                    <Typography variant="body1" sx={{ ml: 2, fontWeight: 'bold' }}>
                      {skillsMatch.score}%
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {i18n.language === 'ar' 
                      ? (skillsMatch.score > 80 
                        ? 'تطابق ممتاز! لديك معظم المهارات المطلوبة.'
                        : skillsMatch.score > 60
                        ? 'تطابق جيد. يمكنك تطوير بعض المهارات الإضافية لتكون مرشحًا مثاليًا.'
                        : skillsMatch.score > 40
                        ? 'تطابق متوسط. قد تحتاج إلى تطوير عدة مهارات أساسية لهذا الدور.'
                        : 'تطابق محدود. تتطلب هذه الوظيفة مهارات تختلف عن ملفك الحالي.')
                      : (skillsMatch.score > 80 
                        ? 'Excellent match! You have most of the required skills.'
                        : skillsMatch.score > 60
                        ? 'Good match. Consider developing a few more skills to be an ideal candidate.'
                        : skillsMatch.score > 40
                        ? 'Moderate match. You may need to develop several key skills for this role.'
                        : 'Limited match. This job requires skills that differ from your current profile.')}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {i18n.language === 'ar' 
                      ? `المهارات المتطابقة (${skillsMatch?.matching?.length || 0})` 
                      : `Matching Skills (${skillsMatch?.matching?.length || 0})`}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {skillsMatch?.matching?.length > 0 ? (
                      skillsMatch.matching.map(skill => (
                        <Chip
                          key={skill}
                          label={skill}
                          color="success"
                          icon={<CheckCircle />}
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                        {i18n.language === 'ar'
                          ? 'لم يتم العثور على مهارات متطابقة. قم بتحديث ملفك الشخصي ليعكس قدراتك.'
                          : 'No matching skills found. Update your profile to reflect your abilities.'}
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {i18n.language === 'ar' 
                      ? `المهارات المفقودة (${skillsMatch?.missing?.length || 0})` 
                      : `Missing Skills (${skillsMatch?.missing?.length || 0})`}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {skillsMatch?.missing?.length > 0 ? (
                      skillsMatch.missing.map(skill => (
                        <Chip
                          key={skill}
                          label={skill}
                          color="default"
                          icon={<RadioButtonUnchecked />}
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                        {i18n.language === 'ar'
                          ? 'تهانينا! لديك جميع المهارات المطلوبة لهذه الوظيفة.'
                          : 'Congratulations! You have all the required skills for this job.'}
                      </Typography>
                    )}
                  </Box>
                </Box>
                
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    {i18n.language === 'ar' ? 'التوصيات' : 'Recommendations'}
                  </Typography>
                  
                  <List>
                    {skillsMatch?.missing?.length > 0 ? (
                      <>
                        <ListItem>
                          <ListItemIcon>
                            <MenuBook color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={i18n.language === 'ar' ? 'تطوير المهارات المفقودة' : 'Develop Missing Skills'} 
                            secondary={i18n.language === 'ar' 
                              ? `ركز على تعلم ${skillsMatch.missing.slice(0, 3).join('، ')}${skillsMatch.missing?.length > 3 ? ' وغيرها' : ''}`
                              : `Focus on learning ${skillsMatch.missing.slice(0, 3).join(', ')}${skillsMatch.missing?.length > 3 ? ' and others' : ''}`}
                            sx={{ textAlign: 'left' }}
                          />
                        </ListItem>
                        
                        <ListItem component={RouterLink} to="/learning">
                          <ListItemIcon>
                            <School color="primary" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={i18n.language === 'ar' ? 'استكشاف الدورات' : 'Explore Courses'} 
                            secondary={i18n.language === 'ar' 
                              ? 'ابحث عن موارد تعليمية لهذه المهارات على منصتنا'
                              : 'Find learning resources for these skills on our platform'}
                            sx={{ textAlign: 'left' }}
                          />
                        </ListItem>
                      </>
                    ) : null}
                    
                    <ListItem>
                      <ListItemIcon>
                        <Assignment color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={i18n.language === 'ar' ? 'تحديث سيرتك الذاتية' : 'Update Your Resume'} 
                        secondary={i18n.language === 'ar' 
                          ? 'أبرز مهاراتك المتطابقة وخبراتك ذات الصلة'
                          : 'Highlight your matching skills and relevant experience'}
                        sx={{ textAlign: 'left' }}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon>
                        <Psychology color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={i18n.language === 'ar' ? 'الاستعداد للمقابلة' : 'Prepare for Interview'} 
                        secondary={i18n.language === 'ar' 
                          ? 'تدرب على الإجابة عن الأسئلة المتعلقة بخبرتك في هذه المهارات'
                          : 'Practice answering questions about your experience with these skills'}
                        sx={{ textAlign: 'left' }}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Similar Jobs */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Work sx={{ mr: 1 }} color="primary" fontSize="small" />
              {i18n.language === 'ar' ? 'وظائف مشابهة' : 'Similar Jobs'}
            </Typography>
            
            {similarJobs?.length > 0 ? (
              <List disablePadding>
                {similarJobs.slice(0, 8).map(job => (
                  <React.Fragment key={job.id}>
                    <ListItem
                      component={RouterLink}
                      to={`/jobs/${job.id}`}
                      sx={{ 
                        cursor: 'pointer',
                        px: 0,
                        py: 1.5,
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                      alignItems="flex-start"
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={job.companyLogo} 
                          alt={job.company?.name}
                          variant="rounded"
                          sx={{ width: 40, height: 40 }}
                        >
                          {job.company?.name?.charAt(0) || 'J'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body1" fontWeight="medium">
                              {i18n.language === 'ar' && job.titleAr ? job.titleAr : job.title}
                            </Typography>
                            {job.matchScore && (
                              <Chip 
                                label={`${job.matchScore}%`} 
                                size="small" 
                                color={job.matchScore > 80 ? "success" : job.matchScore > 60 ? "primary" : "default"}
                                sx={{ height: 24, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span" color="text.primary">
                              {i18n.language === 'ar' && job.companyAr ? job.companyAr : job.company?.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOn sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  {i18n.language === 'ar' && job.locationAr ? job.locationAr : job.location}
                                  {job.remote && (i18n.language === 'ar' ? ' • عن بعد' : ' • Remote')}
                                </Typography>
                              </Box>
                              
                              {job.salaryRange && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <AEDIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary">
                                    {i18n.language === 'ar' && job.salaryRangeAr ? job.salaryRangeAr : job.salaryRange}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </>
                        }
                        sx={{ textAlign: 'left' }}
                      />
                    </ListItem>
                    {similarJobs.indexOf(job) < similarJobs.slice(0, 8).length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {i18n.language === 'ar' ? 'لم يتم العثور على وظائف مشابهة' : 'No similar jobs found'}
                </Typography>
                <Button
                  component={RouterLink}
                  to="/jobs"
                  startIcon={<Work />}
                  variant="outlined"
                  size="small"
                >
                  {i18n.language === 'ar' ? 'تصفح جميع الوظائف' : 'Browse All Jobs'}
                </Button>
              </Box>
            )}
            
            {similarJobs?.length > 8 && (
              <Button 
                fullWidth
                sx={{ mt: 2, justifyContent: 'center' }}
                component={RouterLink}
                to={`/jobs?similar=${jobId}`}
                endIcon={<NavigateNext />}
                variant="outlined"
              >
                {i18n.language === 'ar' ? `عرض جميع الوظائف المشابهة (${similarJobs.length})` : `View All Similar Jobs (${similarJobs.length})`}
              </Button>
            )}
          </Paper>
          
          {/* Application Tips */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {i18n.language === 'ar' ? 'نصائح التقديم' : 'Application Tips'}
            </Typography>
            
            <List disablePadding>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <Assignment color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={i18n.language === 'ar' ? 'خصص سيرتك الذاتية' : 'Customize Your Resume'} 
                  secondary={i18n.language === 'ar' 
                    ? 'قم بتخصيص سيرتك الذاتية لإبراز المهارات والخبرات ذات الصلة'
                    : 'Tailor your resume to highlight relevant skills and experience'}
                  sx={{ textAlign: 'left' }}
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <Description color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={i18n.language === 'ar' ? 'اكتب خطاب تقديم مقنع' : 'Write a Compelling Cover Letter'} 
                  secondary={i18n.language === 'ar'
                    ? 'اشرح لماذا أنت مناسب لهذه الوظيفة المحددة'
                    : 'Explain why you\'re a good fit for this specific role'}
                  sx={{ textAlign: 'left' }}
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <Psychology color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={i18n.language === 'ar' ? 'تدرب على أسئلة المقابلة' : 'Practice Interview Questions'} 
                  secondary={i18n.language === 'ar'
                    ? 'ابحث عن الأسئلة الشائعة لهذا الدور والصناعة'
                    : 'Research common questions for this role and industry'}
                  sx={{ textAlign: 'left' }}
                />
              </ListItem>
              
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <Business color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={i18n.language === 'ar' ? 'ابحث عن الشركة' : 'Research the Company'} 
                  secondary={i18n.language === 'ar'
                    ? 'تعرف على رسالتها وقيمها ومشاريعها الحديثة'
                    : 'Learn about their mission, values, and recent projects'}
                  sx={{ textAlign: 'left' }}
                />
              </ListItem>
            </List>
            
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2, justifyContent: 'flex-start', textAlign: 'left', pl: 2 }}
              component={RouterLink}
              to="/resources/application-tips"
            >
              {i18n.language === 'ar' ? 'المزيد من نصائح التقديم' : 'More Application Tips'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Application Dialog */}
      <Dialog
        open={applicationDialogOpen}
        onClose={() => applicationStatus !== 'submitting' && setApplicationDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {i18n.language === 'ar' 
            ? `تقدم لوظيفة ${job.titleAr || job.title} في ${job.companyAr || job.company?.name}`
            : `Apply for ${job.title} at ${job.company?.name}`}
        </DialogTitle>
        
        {applicationStatus === 'submitting' && (
          <LinearProgress 
            variant="determinate" 
            value={applyProgress} 
            sx={{ mb: applicationStatus === 'submitting' ? 0 : 2 }}
          />
        )}
        
        <DialogContent>
          {applicationStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {applicationError}
            </Alert>
          )}
          
          {applicationStatus === 'success' ? (
            <Box sx={{ textAlign: 'left', py: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2, display: 'block' }} />
              
              <Typography variant="h6" gutterBottom>
                {i18n.language === 'ar' ? 'تم تقديم الطلب بنجاح!' : 'Application Submitted Successfully!'}
              </Typography>
              
              <Typography variant="body1" paragraph>
                {i18n.language === 'ar'
                  ? `تم استلام طلبك لوظيفة ${job.titleAr || job.title} في ${job.companyAr || job.company?.name}.`
                  : `Your application for ${job.title} at ${job.company?.name} has been received.`}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {i18n.language === 'ar'
                  ? 'يمكنك التحقق من حالة طلبك في لوحة التحكم الخاصة بك.'
                  : 'You can check the status of your application in your dashboard.'}
              </Typography>
            </Box>
          ) : (
            <Box component="form">
              <FormControl fullWidth margin="normal">
                <InputLabel>{i18n.language === 'ar' ? 'اختر سيرة ذاتية' : 'Select Resume'}</InputLabel>
                <Select
                  name="resumeId"
                  value={applicationForm.resumeId}
                  onChange={handleApplicationChange}
                  disabled={applicationStatus === 'submitting'}
                >
                  {resumes && resumes.length > 0 ? (
                    resumes.map(resume => (
                      <MenuItem key={resume.id} value={resume.id}>
                        {resume.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>{i18n.language === 'ar' ? 'لا توجد سير ذاتية متاحة' : 'No resumes available'}</MenuItem>
                  )}
                </Select>
                
                {(!resumes || resumes.length === 0) && (
                  <FormHelperText error>
                    {i18n.language === 'ar' ? 'الرجاء إنشاء سيرة ذاتية أولاً' : 'Please create a resume first'}
                    <Button 
                      component={RouterLink} 
                      to="/resume/new"
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      {i18n.language === 'ar' ? 'إنشاء سيرة ذاتية' : 'Create Resume'}
                    </Button>
                  </FormHelperText>
                )}
              </FormControl>
              
              <TextField
                label={i18n.language === 'ar' ? 'خطاب التقديم' : 'Cover Letter'}
                name="coverLetter"
                value={applicationForm.coverLetter}
                onChange={handleApplicationChange}
                multiline
                rows={6}
                fullWidth
                margin="normal"
                disabled={applicationStatus === 'submitting'}
                placeholder={i18n.language === 'ar' ? 'اشرح لماذا أنت مناسب لهذه الوظيفة...' : 'Explain why you\'re a good fit for this position...'}
              />
              
              <TextField
                label={i18n.language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                name="phone"
                value={applicationForm.phone}
                onChange={handleApplicationChange}
                fullWidth
                margin="normal"
                disabled={applicationStatus === 'submitting'}
              />
              
              <TextField
                label={i18n.language === 'ar' ? 'التوفر' : 'Availability'}
                name="availability"
                value={applicationForm.availability}
                onChange={handleApplicationChange}
                fullWidth
                margin="normal"
                disabled={applicationStatus === 'submitting'}
                placeholder={i18n.language === 'ar' 
                  ? 'متى يمكنك البدء؟ هل أنت متاح للمقابلات؟'
                  : 'When can you start? Are you available for interviews?'}
              />
              
              <TextField
                label={i18n.language === 'ar' ? 'كيف سمعت عن هذه الوظيفة؟' : 'How did you hear about this position?'}
                name="referral"
                value={applicationForm.referral}
                onChange={handleApplicationChange}
                fullWidth
                margin="normal"
                disabled={applicationStatus === 'submitting'}
              />
              
              {job?.applicationQuestions?.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                    {i18n.language === 'ar' ? 'أسئلة إضافية' : 'Additional Questions'}
                  </Typography>
                  
                  {job.applicationQuestions.map((question, index) => (
                    <TextField
                      key={index}
                      label={question.text}
                      name={`questions.${question.id}`}
                      value={applicationForm.questions[question.id] || ''}
                      onChange={handleApplicationChange}
                      fullWidth
                      margin="normal"
                      multiline={question.type === 'paragraph'}
                      rows={question.type === 'paragraph' ? 4 : 1}
                      required={question.required}
                      disabled={applicationStatus === 'submitting'}
                    />
                  ))}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'flex-start' }}>
          {applicationStatus === 'success' ? (
            <>
              <Button onClick={() => setApplicationDialogOpen(false)}>
                {i18n.language === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
              
              <Button 
                variant="contained" 
                onClick={() => navigate('/applications')}
              >
                {i18n.language === 'ar' ? 'عرض جميع الطلبات' : 'View All Applications'}
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => applicationStatus !== 'submitting' && setApplicationDialogOpen(false)}
                disabled={applicationStatus === 'submitting'}
              >
                {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              
              <Button 
                variant="contained"
                onClick={handleSubmitApplication}
                disabled={applicationStatus === 'submitting' || !applicationForm.resumeId || !resumes || resumes.length === 0}
                startIcon={applicationStatus === 'submitting' ? <CircularProgress size={20} /> : <Send />}
              >
                {applicationStatus === 'submitting' 
                 ? (i18n.language === 'ar' ? 'جارٍ التقديم...' : 'Submitting...') 
                 : (i18n.language === 'ar' ? 'تقديم الطلب' : 'Submit Application')}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Share Job Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {i18n.language === 'ar' ? 'مشاركة هذه الوظيفة' : 'Share this Job'}
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            {i18n.language === 'ar' 
              ? 'أرسل فرصة العمل هذه إلى شخص قد يكون مهتمًا'
              : 'Send this job opportunity to someone who might be interested'}
          </Typography>
          
          <TextField
            label={i18n.language === 'ar' ? 'البريد الإلكتروني للمستلم' : 'Recipient Email'}
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            fullWidth
            margin="normal"
            type="email"
          />
          
          <TextField
            label={i18n.language === 'ar' ? 'رسالة (اختياري)' : 'Message (Optional)'}
            value={shareMessage}
            onChange={(e) => setShareMessage(e.target.value)}
            multiline
            rows={4}
            fullWidth
            margin="normal"
            placeholder={i18n.language === 'ar' ? 'أضف رسالة شخصية...' : 'Add a personal message...'}
          />
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'flex-start' }}>
          <Button onClick={() => setShareDialogOpen(false)}>
            {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          
          <Button 
            variant="contained"
            onClick={handleShareJob}
            disabled={!shareEmail}
            startIcon={<Send />}
          >
            {i18n.language === 'ar' ? 'مشاركة' : 'Share'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Report Job Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Report this Job
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Please let us know why you're reporting this job listing
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Reason for reporting</InputLabel>
            <Select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <MenuItem value="spam">This is spam</MenuItem>
              <MenuItem value="scam">This seems like a scam</MenuItem>
              <MenuItem value="inappropriate">Inappropriate content</MenuItem>
              <MenuItem value="misleading">Misleading information</MenuItem>
              <MenuItem value="duplicate">Duplicate listing</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            label="Additional Details"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            multiline
            rows={4}
            fullWidth
            margin="normal"
            placeholder="Please provide any additional information..."
          />
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'flex-start' }}>
          <Button onClick={() => setReportDialogOpen(false)}>
            Cancel
          </Button>
          
          <Button 
            variant="contained"
            color="error"
            onClick={handleReportJob}
            disabled={!reportReason}
            startIcon={<Flag />}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Options menu */}
      <Menu
        open={Boolean(optionsMenuAnchorEl)}
        anchorEl={optionsMenuAnchorEl}
        onClose={() => setOptionsMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setOptionsMenuAnchorEl(null);
          setShareDialogOpen(true);
        }}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Share Job" />
        </MenuItem>
        
        <MenuItem onClick={() => window.print()}>
          <ListItemIcon>
            <Print fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Print Job" />
        </MenuItem>
        
        <Divider />
        
        <MenuItem 
          onClick={() => {
            setOptionsMenuAnchorEl(null);
            setReportDialogOpen(true);
          }}
        >
          <ListItemIcon>
            <Flag fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Report Job" />
        </MenuItem>
      </Menu>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default JobDetails;