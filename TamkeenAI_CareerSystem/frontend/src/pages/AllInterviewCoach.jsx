import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  Button,
  Chip,
  Box,
  Rating,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import VideocamIcon from '@mui/icons-material/Videocam';
import MessageIcon from '@mui/icons-material/Message';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Mock data for interview coaches
const mockCoaches = [
  {
    id: 1,
    name: "Sarah Johnson",
    nameAr: "سارة جونسون",
    title: "Senior Tech Recruiter",
    titleAr: "مسؤول توظيف تقني أول",
    company: "Google",
    companyAr: "جوجل",
    specialties: ["Software Engineering", "Technical Interviews", "Behavioral Questions"],
    specialtiesAr: ["هندسة البرمجيات", "المقابلات التقنية", "أسئلة السلوك"],
    experience: 8,
    rating: 4.9,
    reviews: 124,
    hourlyRate: 85,
    availability: "Next available: Tomorrow",
    availabilityAr: "متاح غداً",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    description: "Former Google recruiter with 8+ years of experience hiring software engineers. I can help you prepare for technical and behavioral interviews at top tech companies.",
    descriptionAr: "مسؤولة توظيف سابقة في جوجل مع أكثر من 8 سنوات من الخبرة في توظيف مهندسي البرمجيات. يمكنني مساعدتك في التحضير للمقابلات التقنية والسلوكية في شركات التكنولوجيا الكبرى."
  },
  {
    id: 2,
    name: "Michael Chen",
    nameAr: "مايكل تشن",
    title: "Career Coach & Former HR Director",
    titleAr: "مدرب مهني ومدير موارد بشرية سابق",
    company: "Microsoft",
    companyAr: "مايكروسوفت",
    specialties: ["Leadership Roles", "Executive Interviews", "Salary Negotiation"],
    specialtiesAr: ["أدوار قيادية", "مقابلات تنفيذية", "التفاوض على الراتب"],
    experience: 12,
    rating: 4.8,
    reviews: 98,
    hourlyRate: 95,
    availability: "Next available: Today",
    availabilityAr: "متاح اليوم",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    description: "HR Director with experience at Microsoft and Amazon. I specialize in helping mid to senior-level professionals prepare for leadership interviews and negotiate offers.",
    descriptionAr: "مدير موارد بشرية مع خبرة في مايكروسوفت وأمازون. أتخصص في مساعدة المهنيين من المستوى المتوسط إلى المستوى الأعلى في التحضير لمقابلات القيادة والتفاوض على العروض."
  },
  {
    id: 3,
    name: "Priya Patel",
    nameAr: "بريا باتيل",
    title: "Data Science Interview Specialist",
    titleAr: "متخصصة في مقابلات علوم البيانات",
    company: "Netflix",
    companyAr: "نتفليكس",
    specialties: ["Data Science", "Machine Learning", "Technical Assessments"],
    specialtiesAr: ["علوم البيانات", "التعلم الآلي", "التقييمات التقنية"],
    experience: 6,
    rating: 4.7,
    reviews: 76,
    hourlyRate: 75,
    availability: "Next available: In 2 days",
    availabilityAr: "متاح خلال يومين",
    image: "https://randomuser.me/api/portraits/women/66.jpg",
    description: "Data Scientist at Netflix who has interviewed 100+ candidates. I can help you prepare for data science interviews, including technical questions and case studies.",
    descriptionAr: "عالمة بيانات في نتفليكس قامت بمقابلة أكثر من 100 مرشح. يمكنني مساعدتك في التحضير لمقابلات علوم البيانات، بما في ذلك الأسئلة التقنية ودراسات الحالة."
  },
  {
    id: 4,
    name: "James Wilson",
    nameAr: "جيمس ويلسون",
    title: "Product Management Coach",
    titleAr: "مدرب إدارة المنتجات",
    company: "Facebook",
    companyAr: "فيسبوك",
    specialties: ["Product Management", "Case Interviews", "Product Design"],
    specialtiesAr: ["إدارة المنتجات", "مقابلات الحالات", "تصميم المنتجات"],
    experience: 9,
    rating: 4.9,
    reviews: 112,
    hourlyRate: 90,
    availability: "Next available: Tomorrow",
    availabilityAr: "متاح غداً",
    image: "https://randomuser.me/api/portraits/men/67.jpg",
    description: "Product Manager at Facebook with experience interviewing PM candidates. I can help you prepare for product sense, analytical, and execution interviews.",
    descriptionAr: "مدير منتجات في فيسبوك مع خبرة في مقابلة مرشحي إدارة المنتجات. يمكنني مساعدتك في التحضير لمقابلات حس المنتج والتحليل والتنفيذ."
  },
  {
    id: 5,
    name: "Elena Rodriguez",
    nameAr: "إيلينا رودريغيز",
    title: "UX/UI Interview Specialist",
    titleAr: "متخصصة في مقابلات تجربة المستخدم/واجهة المستخدم",
    company: "Airbnb",
    companyAr: "إير بي إن بي",
    specialties: ["UX Design", "Portfolio Reviews", "Design Challenges"],
    specialtiesAr: ["تصميم تجربة المستخدم", "مراجعات المحفظة", "تحديات التصميم"],
    experience: 7,
    rating: 4.8,
    reviews: 89,
    hourlyRate: 80,
    availability: "Next available: Today",
    availabilityAr: "متاح اليوم",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    description: "UX Designer at Airbnb who has interviewed 50+ designers. I can help you prepare your portfolio, practice design challenges, and ace your UX/UI interviews.",
    descriptionAr: "مصممة تجربة مستخدم في إير بي إن بي قامت بمقابلة أكثر من 50 مصمم. يمكنني مساعدتك في تحضير محفظتك، والتدرب على تحديات التصميم، والتفوق في مقابلات تجربة المستخدم/واجهة المستخدم."
  },
  {
    id: 6,
    name: "David Kim",
    nameAr: "ديفيد كيم",
    title: "Marketing Interview Coach",
    titleAr: "مدرب مقابلات التسويق",
    company: "Spotify",
    companyAr: "سبوتيفاي",
    specialties: ["Marketing Strategy", "Brand Management", "Growth Marketing"],
    specialtiesAr: ["استراتيجية التسويق", "إدارة العلامة التجارية", "تسويق النمو"],
    experience: 10,
    rating: 4.7,
    reviews: 67,
    hourlyRate: 75,
    availability: "Next available: In 3 days",
    availabilityAr: "متاح خلال 3 أيام",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    description: "Marketing Director at Spotify with experience hiring marketing professionals. I can help you prepare for marketing interviews, case studies, and presentations.",
    descriptionAr: "مدير تسويق في سبوتيفاي مع خبرة في توظيف متخصصي التسويق. يمكنني مساعدتك في التحضير لمقابلات التسويق ودراسات الحالة والعروض التقديمية."
  }
];

// Mock data for interview packages
const mockPackages = [
  {
    id: 1,
    title: "Technical Interview Prep",
    titleAr: "إعداد المقابلة التقنية",
    description: "Comprehensive preparation for software engineering interviews, including data structures, algorithms, and system design.",
    descriptionAr: "إعداد شامل لمقابلات هندسة البرمجيات، بما في ذلك هياكل البيانات والخوارزميات وتصميم النظام.",
    price: 199,
    sessions: 3,
    duration: "1 month",
    durationAr: "شهر واحد",
    features: ["Mock interviews with feedback", "Personalized improvement plan", "Resume review", "Coding challenge practice"],
    featuresAr: ["مقابلات تجريبية مع ملاحظات", "خطة تحسين مخصصة", "مراجعة السيرة الذاتية", "ممارسة تحديات البرمجة"]
  },
  {
    id: 2,
    title: "Behavioral Interview Mastery",
    titleAr: "إتقان المقابلة السلوكية",
    description: "Learn how to effectively communicate your experience and skills using the STAR method and other proven techniques.",
    descriptionAr: "تعلم كيفية التواصل بفعالية عن خبرتك ومهاراتك باستخدام طريقة STAR وتقنيات أخرى مثبتة.",
    price: 149,
    sessions: 2,
    duration: "2 weeks",
    durationAr: "أسبوعان",
    features: ["Situation-based practice", "Video recording analysis", "Custom response frameworks", "Follow-up question preparation"],
    featuresAr: ["ممارسة قائمة على المواقف", "تحليل التسجيلات المرئية", "أطر استجابة مخصصة", "إعداد أسئلة المتابعة"]
  },
  {
    id: 3,
    title: "Executive Interview Package",
    titleAr: "حزمة المقابلة التنفيذية",
    description: "Premium coaching for senior leadership and executive roles, focusing on strategic thinking and leadership vision.",
    descriptionAr: "تدريب متميز للأدوار القيادية العليا والتنفيذية، مع التركيز على التفكير الاستراتيجي والرؤية القيادية.",
    price: 349,
    sessions: 4,
    duration: "6 weeks",
    durationAr: "6 أسابيع",
    features: ["Leadership scenario practice", "Executive presence coaching", "Strategic thinking exercises", "Salary negotiation strategy"],
    featuresAr: ["ممارسة سيناريوهات القيادة", "تدريب الحضور التنفيذي", "تمارين التفكير الاستراتيجي", "استراتيجية التفاوض على الراتب"]
  }
];

const AllInterviewCoach = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [coaches, setCoaches] = useState([]);
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  
  // Simple check for whether we're in Arabic mode
  const isArabic = i18n.language === 'ar';
  
  // For debugging
  useEffect(() => {
    console.log('Current i18n language:', i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    // Simulate API call to fetch coaches and packages
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCoaches(mockCoaches);
        setPackages(mockPackages);
        setError('');
      } catch (err) {
        console.error('Error fetching interview coaches:', err);
        setError(isArabic ? 'فشل في تحميل مدربي المقابلات. الرجاء المحاولة مرة أخرى لاحقاً.' : 'Failed to load interview coaches. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCoaches = coaches.filter(coach => 
    coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coach.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleBookSession = (coachId) => {
    // Instead of going directly to checkout, navigate to the coach profile with availability tab
    navigate(`/ai-coach/profile/${coachId}`, { state: { activeTab: 2 } }); // 2 is the index for the Availability tab
  };

  const handleViewProfile = (coachId) => {
    // Navigate to coach profile page with coach ID
    console.log(`Viewing profile of coach ID: ${coachId}`);
    navigate(`/ai-coach/profile/${coachId}`);
  };

  const handlePurchasePackage = (packageId) => {
    // Find the selected package
    const selectedPackage = packages.find(pkg => pkg.id === packageId);
    
    // Navigate to checkout with package details
    navigate('/ai-coach/checkout/package', {
      state: {
        packageDetails: {
          ...selectedPackage,
          price: selectedPackage.price * 3.67 // Convert to AED
        }
      }
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 1 }}>
        {isArabic ? "تدريب المقابلات" : "Interview Coaching"}
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" align="center" sx={{ mb: 4 }}>
        {isArabic ? "احصل على تدريب مخصص لاجتياز مقابلتك القادمة" : "Get personalized coaching to ace your next interview"}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder={isArabic ? "البحث عن طريق الاسم، التخصص، الشركة..." : "Search by name, specialty, company..."}
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <FilterListIcon />
                  </IconButton>
                  <IconButton>
                    <SortIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
        
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab 
            label={isArabic ? "مدربو المقابلات الخبراء" : "Interview Coaches"}
            icon={<PersonIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label={isArabic ? "حزم التدريب" : "Coaching Packages"}
            icon={<AssignmentIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label={isArabic ? "تدريب بالذكاء الاصطناعي" : "AI Interview Practice"}
            icon={<MessageIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label={isArabic ? "مقابلات وهمية" : "Mock Interviews"}
            icon={<VideocamIcon />} 
            iconPosition="start" 
          />
          <Tab 
            label={isArabic ? "تأكيد الحجز" : "Booking Confirmation"} 
            icon={<EventAvailableIcon />} 
            iconPosition="start" 
          />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tabValue === 0 && (
            <>
              <Typography variant="h5" sx={{ mb: 3 }}>
                {isArabic ? "مدربو المقابلات الخبراء" : "Expert Interview Coaches"}
              </Typography>
              
              <Grid container spacing={3}>
                {filteredCoaches.map(coach => (
                  <Grid item xs={12} md={6} lg={4} key={coach.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={coach.image}
                          alt={isArabic ? coach.nameAr : coach.name}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            padding: '10px'
                          }}
                        >
                          <Typography variant="h6">{isArabic ? coach.nameAr : coach.name}</Typography>
                          <Typography variant="body2">{isArabic ? coach.titleAr : coach.title}</Typography>
                          <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            {isArabic ? coach.companyAr : coach.company}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Rating
                            value={coach.rating}
                            precision={0.1}
                            readOnly
                            size="small"
                            emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {coach.rating} ({coach.reviews} {isArabic ? "مراجعة" : "reviews"})
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {isArabic ? coach.descriptionAr : coach.description}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>{isArabic ? "الخبرة:" : "Experience:"}</strong> {coach.experience} {isArabic ? "سنوات" : "years"}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>{isArabic ? "المعدل:" : "Rate:"}</strong> AED {coach.hourlyRate * 3.67}/{isArabic ? "ساعة" : "hour"}
                        </Typography>
                        
                        <Typography variant="body2" color="primary" sx={{ mb: 2 }}>
                          {isArabic ? coach.availabilityAr : coach.availability}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                          {(isArabic ? coach.specialtiesAr : coach.specialties).map((specialty, index) => (
                            <Chip
                              key={index}
                              label={specialty}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </CardContent>
                      
                      <Divider />
                      
                      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                        <Button 
                          size="small" 
                          onClick={() => handleViewProfile(coach.id)}
                        >
                          {isArabic ? "عرض الملف الشخصي" : "View Profile"}
                        </Button>
                        <Button 
                          variant="contained" 
                          size="small"
                          onClick={() => handleBookSession(coach.id)}
                        >
                          {isArabic ? "حجز جلسة" : "Book Session"}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          
          {tabValue === 1 && (
            <>
              <Typography variant="h5" sx={{ mb: 3 }}>
                {isArabic ? "حزم تدريب المقابلات" : "Interview Coaching Packages"}
              </Typography>
              
              <Grid container spacing={3}>
                {packages.map(pkg => (
                  <Grid item xs={12} md={4} key={pkg.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" component="div" gutterBottom>
                          {isArabic ? pkg.titleAr : pkg.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                          <Typography variant="h4" component="span" color="primary">
                            AED {pkg.price * 3.67}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {isArabic ? `لـ ${pkg.sessions} جلسات` : `for ${pkg.sessions} sessions`}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" paragraph>
                          {isArabic ? pkg.descriptionAr : pkg.description}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>{isArabic ? "المدة:" : "Duration:"}</strong> {isArabic ? pkg.durationAr : pkg.duration}
                        </Typography>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Typography variant="subtitle2" gutterBottom>
                          {isArabic ? "ما يشمله:" : "What's included:"}
                        </Typography>
                        
                        <ul style={{ paddingLeft: '20px' }}>
                          {(isArabic ? pkg.featuresAr : pkg.features).map((feature, index) => (
                            <li key={index}>
                              <Typography variant="body2">
                                {feature}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      
                      <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                        <Button 
                          variant="contained" 
                          fullWidth
                          onClick={() => handlePurchasePackage(pkg.id)}
                        >
                          {isArabic ? "شراء الحزمة" : "Purchase Package"}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
          
          {tabValue === 2 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" gutterBottom>
                {isArabic ? "تدريب بالذكاء الاصطناعي" : "AI Interview Practice"}
              </Typography>
              <Typography variant="body1" paragraph>
                {isArabic 
                  ? "تدرب مع محاكينا للمقابلات المدعوم بالذكاء الاصطناعي الذي يقدم ملاحظات في الوقت الحقيقي."
                  : "Practice with our AI-powered interview simulator that provides real-time feedback."}
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/ai-coach/interview')}
                startIcon={<MessageIcon />}
              >
                {isArabic ? "بدء التدريب بالذكاء الاصطناعي" : "Start AI Practice"}
              </Button>
            </Box>
          )}
          
          {tabValue === 3 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" gutterBottom>
                {isArabic ? "المقابلات الوهمية" : "Mock Interviews"}
              </Typography>
              <Typography variant="body1" paragraph>
                {isArabic
                  ? "تدرب مع مقابلاتنا الوهمية المنظمة التي يقودها محاورون محترفون."
                  : "Practice with our structured mock interviews led by professional interviewers."}
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<VideocamIcon />}
                onClick={() => navigate('/ai-coach/mock-interview')}
              >
                {isArabic ? "جدولة مقابلة وهمية" : "Schedule Mock Interview"}
              </Button>
            </Box>
          )}
          
          {tabValue === 4 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" gutterBottom>
                {isArabic ? "تأكيد الحجز" : "Booking Confirmation"}
              </Typography>
              <Typography variant="body1" paragraph>
                {isArabic
                  ? "عرض وإدارة جلسات تدريب المقابلات القادمة."
                  : "View and manage your upcoming interview coaching sessions."}
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/my-bookings')}
                startIcon={<EventAvailableIcon />}
              >
                {isArabic ? "حجوزاتي" : "My Bookings"}
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default AllInterviewCoach; 