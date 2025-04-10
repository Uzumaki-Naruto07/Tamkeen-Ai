import React, { useState, useEffect, useRef } from 'react';
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
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Tab,
  Tabs
} from '@mui/material';
import {
  Person,
  Work,
  School,
  Star,
  Event,
  AccessTime,
  Check,
  Language,
  LinkedIn,
  Verified,
  Timeline,
  MoneyOff,
  EventAvailable
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Import mock coaches data from AllInterviewCoach
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
    descriptionAr: "مسؤولة توظيف سابقة في جوجل مع أكثر من 8 سنوات من الخبرة في توظيف مهندسي البرمجيات. يمكنني مساعدتك في التحضير للمقابلات التقنية والسلوكية في شركات التكنولوجيا الكبرى.",
    bio: "As a former technical recruiter at Google, I've interviewed hundreds of software engineers and know exactly what hiring managers are looking for. I specialize in helping candidates prepare for technical interviews at FAANG companies and other tech giants. I can provide personalized feedback on your answers, help you strengthen your problem-solving approach, and teach you strategies to showcase your skills effectively.",
    bioAr: "بصفتي مسؤولة توظيف تقنية سابقة في جوجل، أجريت مقابلات مع مئات من مهندسي البرمجيات وأعرف بالضبط ما يبحث عنه مديرو التوظيف. أتخصص في مساعدة المرشحين للاستعداد للمقابلات التقنية في شركات FAANG وغيرها من شركات التقنية الكبرى. يمكنني تقديم ملاحظات مخصصة حول إجاباتك، ومساعدتك في تعزيز نهج حل المشكلات لديك، وتعليمك استراتيجيات لإظهار مهاراتك بشكل فعال.",
    languages: ["English", "Spanish"],
    languagesAr: ["الإنجليزية", "الإسبانية"],
    education: "Bachelor's in Computer Science, Stanford University",
    educationAr: "بكالوريوس في علوم الكمبيوتر، جامعة ستانفورد",
    certifications: ["Certified Professional Coach (CPC)", "SHRM-CP"],
    certificationsAr: ["مدرب محترف معتمد (CPC)", "SHRM-CP"],
    testimonials: [
      { id: 1, name: "Alex Chen", nameAr: "أليكس تشن", company: "Software Engineer at Amazon", companyAr: "مهندس برمجيات في أمازون", content: "Sarah's coaching was instrumental in my success at Amazon interviews. Her mock interviews and feedback helped me identify and address weaknesses in my responses.", contentAr: "كان تدريب سارة عاملاً أساسياً في نجاحي في مقابلات أمازون. ساعدتني مقابلاتها التجريبية وملاحظاتها على تحديد ومعالجة نقاط الضعف في إجاباتي.", rating: 5 },
      { id: 2, name: "Maya Patel", nameAr: "مايا باتيل", company: "Frontend Developer at Facebook", companyAr: "مطور واجهة أمامية في فيسبوك", content: "I was struggling with system design interviews before working with Sarah. Her structured approach and industry insights made a huge difference.", contentAr: "كنت أعاني في مقابلات تصميم النظام قبل العمل مع سارة. نهجها المنظم ورؤاها في الصناعة أحدثت فرقاً كبيراً.", rating: 5 },
      { id: 3, name: "James Wilson", nameAr: "جيمس ويلسون", company: "Backend Engineer at Microsoft", companyAr: "مهندس الواجهة الخلفية في مايكروسوفت", content: "Great coach who knows exactly what tech companies are looking for. Worth every penny.", contentAr: "مدربة رائعة تعرف بالضبط ما تبحث عنه شركات التكنولوجيا. تستحق كل قرش.", rating: 4 }
    ],
    availableTimes: [
      { date: "2024-04-01", slots: ["10:00 AM", "2:00 PM", "4:00 PM"] },
      { date: "2024-04-02", slots: ["9:00 AM", "1:00 PM", "5:00 PM"] },
      { date: "2024-04-03", slots: ["11:00 AM", "3:00 PM"] }
    ]
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
    descriptionAr: "مدير موارد بشرية مع خبرة في مايكروسوفت وأمازون. أتخصص في مساعدة المهنيين من المستوى المتوسط إلى المستوى الأعلى في التحضير لمقابلات القيادة والتفاوض على العروض.",
    bio: "With over 12 years in HR leadership roles at companies like Microsoft and Amazon, I bring deep expertise in executive recruiting and talent development. My coaching approach combines insider knowledge of how hiring decisions are made with practical strategies to help you showcase your leadership abilities and secure competitive offers.",
    bioAr: "مع أكثر من 12 عامًا في أدوار قيادية في الموارد البشرية في شركات مثل مايكروسوفت وأمازون، أجلب خبرة عميقة في التوظيف التنفيذي وتطوير المواهب. يجمع نهجي في التدريب بين المعرفة الداخلية لكيفية اتخاذ قرارات التوظيف مع استراتيجيات عملية لمساعدتك على إظهار قدراتك القيادية وتأمين عروض تنافسية.",
    languages: ["English", "Mandarin"],
    languagesAr: ["الإنجليزية", "الماندرين"],
    education: "MBA, University of Washington",
    educationAr: "ماجستير إدارة الأعمال، جامعة واشنطن",
    certifications: ["SHRM-SCP", "ICF Professional Certified Coach"],
    certificationsAr: ["SHRM-SCP", "مدرب محترف معتمد من ICF"],
    testimonials: [
      { id: 1, name: "Linda Morris", nameAr: "ليندا موريس", company: "VP of Engineering", companyAr: "نائب رئيس الهندسة", content: "Michael's coaching helped me prepare for executive interviews after 15 years at the same company. His insights into leadership assessment were invaluable.", contentAr: "ساعدني تدريب مايكل في التحضير للمقابلات التنفيذية بعد 15 عامًا في نفس الشركة. كانت رؤاه في تقييم القيادة لا تقدر بثمن.", rating: 5 },
      { id: 2, name: "Robert Taylor", nameAr: "روبرت تايلور", company: "Director of Product", companyAr: "مدير المنتج", content: "Thanks to Michael's negotiation strategies, I secured a compensation package 30% higher than the initial offer.", contentAr: "بفضل استراتيجيات التفاوض من مايكل، حصلت على حزمة تعويض أعلى بنسبة 30٪ من العرض الأولي.", rating: 5 },
      { id: 3, name: "Sarah Johnson", nameAr: "سارة جونسون", company: "CTO", companyAr: "المدير التقني", content: "Excellent executive coach who understands the nuances of leadership assessment.", contentAr: "مدرب تنفيذي ممتاز يفهم تفاصيل تقييم القيادة.", rating: 4 }
    ],
    availableTimes: [
      { date: "2024-03-31", slots: ["11:00 AM", "3:00 PM", "5:00 PM"] },
      { date: "2024-04-01", slots: ["9:00 AM", "1:00 PM", "4:00 PM"] },
      { date: "2024-04-02", slots: ["10:00 AM", "2:00 PM"] }
    ]
  },
  {
    id: 3,
    name: "Priya Patel",
    title: "Data Science Interview Specialist",
    company: "Netflix",
    specialties: ["Data Science", "Machine Learning", "Technical Assessments"],
    experience: 6,
    rating: 4.7,
    reviews: 76,
    hourlyRate: 75,
    availability: "Next available: In 2 days",
    image: "https://randomuser.me/api/portraits/women/66.jpg",
    description: "Data Scientist at Netflix who has interviewed 100+ candidates. I can help you prepare for data science interviews, including technical questions and case studies.",
    bio: "As a Senior Data Scientist at Netflix and former interviewer, I've evaluated over 100 candidates for data science and machine learning roles. My coaching focuses on preparing you for the unique challenges of data science interviews, from algorithmic coding problems to open-ended case studies and machine learning system design questions.",
    languages: ["English", "Hindi", "Gujarati"],
    education: "MS in Computer Science, UC Berkeley",
    certifications: ["Google Professional Data Engineer", "AWS Certified Machine Learning"],
    testimonials: [
      { id: 1, name: "David Kim", company: "ML Engineer at Google", content: "Priya's deep expertise in ML interviews helped me prepare effectively for technical assessments. The practice problems were spot-on.", rating: 5 },
      { id: 2, name: "Emily Chen", company: "Data Scientist at Spotify", content: "The case study practice sessions were extremely helpful. Priya knows exactly what companies are looking for.", rating: 4 },
      { id: 3, name: "Michael Johnson", company: "AI Researcher", content: "Great insights into machine learning system design questions. Highly recommended.", rating: 5 }
    ],
    availableTimes: [
      { date: "2024-04-02", slots: ["10:00 AM", "2:00 PM", "4:00 PM"] },
      { date: "2024-04-03", slots: ["9:00 AM", "1:00 PM", "5:00 PM"] },
      { date: "2024-04-04", slots: ["11:00 AM", "3:00 PM"] }
    ]
  },
  {
    id: 4,
    name: "James Wilson",
    title: "Product Management Coach",
    company: "Facebook",
    specialties: ["Product Management", "Case Interviews", "Product Design"],
    experience: 9,
    rating: 4.9,
    reviews: 112,
    hourlyRate: 90,
    availability: "Next available: Tomorrow",
    image: "https://randomuser.me/api/portraits/men/67.jpg",
    description: "Product Manager at Facebook with experience interviewing PM candidates. I can help you prepare for product sense, analytical, and execution interviews.",
    bio: "With 9 years as a Product Manager at Facebook, I've been on both sides of the PM interview process. My coaching approach helps you develop a structured framework for tackling product sense questions, analytical problems, and execution scenarios. I'll help you craft compelling stories about your past experience and demonstrate the strategic thinking that top tech companies require.",
    languages: ["English"],
    education: "MBA, Harvard Business School",
    certifications: ["Certified Scrum Product Owner", "Professional Product Manager"],
    testimonials: [
      { id: 1, name: "Sophie Lee", company: "Product Manager at Airbnb", content: "James helped me transition from engineering to product management. His frameworks for product questions were invaluable.", rating: 5 },
      { id: 2, name: "Marcus Johnson", company: "Senior PM at Lyft", content: "The mock interviews were challenging and provided great feedback. Well worth the investment.", rating: 5 },
      { id: 3, name: "Olivia Martinez", company: "PM at Google", content: "Excellent at teaching structured approaches to ambiguous product questions.", rating: 4 }
    ],
    availableTimes: [
      { date: "2024-04-01", slots: ["9:00 AM", "1:00 PM", "4:00 PM"] },
      { date: "2024-04-02", slots: ["10:00 AM", "2:00 PM", "5:00 PM"] },
      { date: "2024-04-03", slots: ["11:00 AM", "3:00 PM"] }
    ]
  },
  {
    id: 5,
    name: "Elena Rodriguez",
    title: "UX/UI Interview Specialist",
    company: "Airbnb",
    specialties: ["UX Design", "Portfolio Reviews", "Design Challenges"],
    experience: 7,
    rating: 4.8,
    reviews: 89,
    hourlyRate: 80,
    availability: "Next available: Today",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    description: "UX Designer at Airbnb who has interviewed 50+ designers. I can help you prepare your portfolio, practice design challenges, and ace your UX/UI interviews.",
    bio: "As a Senior UX Designer at Airbnb who's interviewed dozens of candidates, I know what makes a portfolio stand out and how to approach design challenges. My coaching sessions include portfolio critiques, mock design exercises, and preparation for all types of design interviews from whiteboard challenges to cross-functional partner interviews.",
    languages: ["English", "Spanish"],
    education: "MFA in Interaction Design, Rhode Island School of Design",
    certifications: ["Certified User Experience Professional", "Nielsen Norman Group UX Certification"],
    testimonials: [
      { id: 1, name: "Thomas Lee", company: "UX Designer at Google", content: "Elena's portfolio review completely transformed how I presented my work. The mock design challenges were also extremely helpful.", rating: 5 },
      { id: 2, name: "Kim Chen", company: "UI Designer at Uber", content: "Great insights on presenting design decisions and process in interviews. Highly recommended!", rating: 4 },
      { id: 3, name: "Jason Wang", company: "Product Designer at Spotify", content: "Elena's feedback on my portfolio and interview approach was invaluable. Worth every penny.", rating: 5 }
    ],
    availableTimes: [
      { date: "2024-03-31", slots: ["10:00 AM", "2:00 PM", "4:00 PM"] },
      { date: "2024-04-01", slots: ["9:00 AM", "1:00 PM", "5:00 PM"] },
      { date: "2024-04-02", slots: ["11:00 AM", "3:00 PM"] }
    ]
  },
  {
    id: 6,
    name: "David Kim",
    title: "Marketing Interview Coach",
    company: "Spotify",
    specialties: ["Marketing Strategy", "Brand Management", "Growth Marketing"],
    experience: 10,
    rating: 4.7,
    reviews: 67,
    hourlyRate: 75,
    availability: "Next available: In 3 days",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    description: "Marketing Director at Spotify with experience hiring marketing professionals. I can help you prepare for marketing interviews, case studies, and presentations.",
    bio: "With 10 years in marketing leadership at Spotify, Netflix, and other major brands, I've interviewed and hired dozens of marketing professionals. I specialize in helping candidates prepare for strategic marketing interviews, case studies, and presentations. My approach helps you articulate your achievements and demonstrate strategic thinking.",
    languages: ["English", "Korean"],
    education: "MBA in Marketing, NYU Stern School of Business",
    certifications: ["Digital Marketing Institute Certified Expert", "Google Ads Certification"],
    testimonials: [
      { id: 1, name: "Rachel Green", company: "Marketing Manager at Netflix", content: "David helped me prepare for a senior marketing role with targeted practice for case studies and strategy questions.", rating: 4 },
      { id: 2, name: "Daniel Park", company: "Growth Marketer at Hulu", content: "Great insights into how marketing interviews are evaluated. The mock interviews were extremely valuable.", rating: 5 },
      { id: 3, name: "Emma Wilson", company: "Brand Manager at Adidas", content: "David's feedback on presenting marketing metrics and results was game-changing for my interviews.", rating: 5 }
    ],
    availableTimes: [
      { date: "2024-04-03", slots: ["10:00 AM", "2:00 PM", "4:00 PM"] },
      { date: "2024-04-04", slots: ["9:00 AM", "1:00 PM", "5:00 PM"] },
      { date: "2024-04-05", slots: ["11:00 AM", "3:00 PM"] }
    ]
  }
];

const CoachProfile = () => {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [userBookings, setUserBookings] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleData, setRescheduleData] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const { i18n } = useTranslation();
  
  // Check if language is Arabic
  const isArabic = i18n.language === 'ar';

  // Add refs for the sections we want to scroll to
  const availabilitySectionRef = useRef(null);
  const bookingActionButtonRef = useRef(null);

  useEffect(() => {
    // Fetch coach data based on coachId
    setLoading(true);
    
    // Get user's existing bookings from localStorage
    const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    setUserBookings(existingBookings);
    
    // Check if user is rescheduling
    const rescheduleBooking = localStorage.getItem('rescheduleBooking');
    if (rescheduleBooking) {
      const bookingData = JSON.parse(rescheduleBooking);
      if (bookingData.coachId === parseInt(coachId)) {
        setIsRescheduling(true);
        setRescheduleData(bookingData);
        // Set tab to availability
        setTabValue(2);
      }
    }
    
    // Check if we came from the "Book Session" button with activeTab state
    if (location.state?.activeTab !== undefined) {
      setTabValue(location.state.activeTab);
    }
    
    // Simulate API call
    setTimeout(() => {
      const foundCoach = mockCoaches.find(c => c.id === parseInt(coachId));
      
      if (foundCoach) {
        setCoach(foundCoach);
        setError('');
      } else {
        setError('Coach not found');
      }
      
      setLoading(false);
      
      // If availability tab is selected (either from state or rescheduling), scroll to it
      if ((location.state?.activeTab === 2) || (rescheduleBooking && JSON.parse(rescheduleBooking).coachId === parseInt(coachId))) {
        setTimeout(() => {
          availabilitySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 300); // Slightly longer delay to ensure the component is fully rendered
      }
    }, 800);
  }, [coachId, location]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // If switching to availability tab, scroll to it
    if (newValue === 2) {
      setTimeout(() => {
        availabilitySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };
  
  // Check if a time slot is already booked
  const isTimeSlotBooked = (date, time) => {
    return userBookings.some(booking => {
      // Convert dates to strings for comparison to avoid time zone issues
      const bookingDateString = new Date(booking.date).toDateString();
      const slotDateString = new Date(date).toDateString();
      
      // Check if the date and time match
      return bookingDateString === slotDateString && booking.time === time;
    });
  };

  // Handle time slot selection
  const handleTimeSlotSelection = (date, time) => {
    setSelectedTimeSlot({ date, time });
    
    // Scroll to the book session button
    setTimeout(() => {
      bookingActionButtonRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle booking session
  const handleBookSession = () => {
    // If a specific time slot was selected, use that; otherwise use default (first available)
    if (selectedTimeSlot) {
      // Check if the time slot is already booked
      if (isTimeSlotBooked(selectedTimeSlot.date, selectedTimeSlot.time)) {
        alert(isArabic 
          ? 'هذا الموعد محجوز بالفعل. الرجاء اختيار وقت آخر.'
          : 'This time slot is already booked. Please select another time.'
        );
        return;
      }
      
      // Handle rescheduling differently
      if (isRescheduling && rescheduleData) {
        setBookingLoading(true);
        
        setTimeout(() => {
          const updatedBooking = {
            ...rescheduleData,
            date: selectedTimeSlot.date,
            time: selectedTimeSlot.time,
          };
          
          // Save updated booking
          const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
          existingBookings.push(updatedBooking);
          localStorage.setItem('userBookings', JSON.stringify(existingBookings));
          
          // Update notifications
          const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
          const updatedNotifications = notifications.map(n => {
            if (n.bookingId === updatedBooking.id) {
              return {
                ...n,
                message: isArabic
                  ? `لديك جلسة تدريب مع ${coach.nameAr} يوم ${new Date(selectedTimeSlot.date).toLocaleDateString('ar-AE')} في الساعة ${selectedTimeSlot.time}`
                  : `You have a coaching session with ${coach.name} on ${new Date(selectedTimeSlot.date).toLocaleDateString()} at ${selectedTimeSlot.time}`,
                sessionDate: selectedTimeSlot.date,
                sessionTime: selectedTimeSlot.time
              };
            }
            return n;
          });
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          
          // Clear rescheduling data
          localStorage.removeItem('rescheduleBooking');
          
          setBookingLoading(false);
          
          // Navigate to booking confirmation
          navigate('/my-bookings', { 
            state: { 
              message: isArabic
                ? 'تمت إعادة جدولة الحجز بنجاح!'
                : 'Your booking has been successfully rescheduled!' 
            } 
          });
        }, 1500);
      } else {
        // Regular booking process
        setBookingLoading(true);
        setTimeout(() => {
          navigate(`/ai-coach/checkout/${coachId}`, {
            state: {
              bookingDetails: {
                selectedDate: selectedTimeSlot.date,
                selectedTime: selectedTimeSlot.time,
                coachData: coach,
                price: coach.hourlyRate * 3.67
              }
            }
          });
        }, 1000);
      }
    } else {
      // Notify user to select a time slot first
      alert(isArabic
        ? 'الرجاء اختيار موعد قبل الحجز'
        : 'Please select a time slot before booking'
      );
      
      // Auto-scroll to availability section
      handleTabChange(null, 2);
    }
  };
  
  // Render time slot button with booking status
  const renderTimeSlotButton = (day, time, idx) => {
    const isBooked = isTimeSlotBooked(day.date, time);
    const isSelected = selectedTimeSlot && selectedTimeSlot.date === day.date && selectedTimeSlot.time === time;
    
    return (
      <Button 
        key={idx}
        variant={isSelected ? "contained" : "outlined"}
        fullWidth
        sx={{ 
          mb: 1,
          backgroundColor: isBooked ? 'rgba(211, 47, 47, 0.1)' : 
                           isSelected ? 'primary.main' : 
                           'inherit',
          color: isBooked ? 'error.main' : 
                 isSelected ? 'white' : 
                 'inherit',
          '&:hover': {
            backgroundColor: isBooked ? 'rgba(211, 47, 47, 0.2)' : 
                             isSelected ? 'primary.dark' : 
                             'rgba(25, 118, 210, 0.12)'
          },
          fontWeight: isSelected ? 'bold' : 'normal',
          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
          transition: 'all 0.2s',
          position: 'relative',
          overflow: 'visible',
          '&::after': isSelected ? {
            content: '""',
            position: 'absolute',
            top: -2,
            right: -2,
            bottom: -2,
            left: -2,
            border: '2px solid #1976d2',
            borderRadius: '5px',
            zIndex: -1
          } : {}
        }}
        onClick={() => !isBooked && handleTimeSlotSelection(day.date, time)}
        startIcon={<AccessTime />}
        disabled={isBooked}
      >
        {time} {isBooked && (isArabic ? '(محجوز)' : '(Booked)')}
      </Button>
    );
  };

  // Handle click on "Book Session" button in the main card
  const handleBookNowClick = () => {
    setTabValue(2);
    
    // Scroll to availability section after tab change
    setTimeout(() => {
      availabilitySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }} 
          onClick={() => navigate('/ai-coach')}
        >
          {isArabic ? "العودة إلى المدربين" : "Back to Coaches"}
        </Button>
      </Container>
    );
  }

  // Render coach profile
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Button 
        variant="outlined" 
        sx={{ mb: 3 }} 
        onClick={() => navigate('/ai-coach')}
      >
        {isArabic ? "العودة إلى جميع المدربين" : "Back to All Coaches"}
      </Button>
      
      {/* Coach Header */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardMedia
              component="img"
              height="300"
              image={coach.image}
              alt={isArabic ? coach.nameAr : coach.name}
              sx={{ objectFit: 'cover' }}
            />
          </Card>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {isArabic ? coach.nameAr : coach.name}
              </Typography>
              
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {isArabic ? coach.titleAr : coach.title} {isArabic ? "في" : "at"} {isArabic ? coach.companyAr : coach.company}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating
                  value={coach.rating}
                  precision={0.1}
                  readOnly
                  emptyIcon={<Star style={{ opacity: 0.55 }} fontSize="inherit" />}
                />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {coach.rating} ({coach.reviews} {isArabic ? "مراجعة" : "reviews"})
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {(isArabic ? coach.specialtiesAr : coach.specialties).map((specialty, index) => (
                  <Chip
                    key={index}
                    label={specialty}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {isArabic ? coach.descriptionAr : coach.description}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>{isArabic ? "الخبرة:" : "Experience:"}</strong> {coach.experience} {isArabic ? "سنوات" : "years"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>{isArabic ? "المعدل:" : "Rate:"}</strong> AED {(coach.hourlyRate * 3.67).toFixed(0)}/{isArabic ? "ساعة" : "hour"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">
                    <strong>{isArabic ? "اللغات:" : "Languages:"}</strong> {(isArabic ? coach.languagesAr : coach.languages).join(", ")}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="primary">
                    <strong>{isArabic ? coach.availabilityAr : coach.availability}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
            
            <CardActions sx={{ justifyContent: 'center', p: 2 }}>
              <Button 
                variant="contained" 
                size="large"
                color="primary"
                onClick={handleBookNowClick}
                fullWidth
                startIcon={<EventAvailable />}
                sx={{ 
                  fontSize: '1rem',
                  py: 1
                }}
              >
                {isArabic ? "عرض الأوقات المتاحة" : "View Available Times"}
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs for different sections */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label={isArabic ? "نبذة" : "About"} />
          <Tab label={isArabic ? "الشهادات" : "Testimonials"} />
          <Tab label={isArabic ? "التوفر" : "Availability"} />
        </Tabs>
      </Paper>
      
      {/* Tab Content */}
      {tabValue === 0 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>{isArabic ? `نبذة عن ${coach.nameAr}` : `About ${coach.name}`}</Typography>
          <Typography variant="body1" paragraph>
            {isArabic ? coach.bioAr : coach.bio}
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>{isArabic ? "التعليم" : "Education"}</Typography>
              <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <School sx={{ mr: 1, color: 'primary.main' }} />
                {isArabic ? coach.educationAr : coach.education}
              </Typography>
              
              <Typography variant="h6" gutterBottom>{isArabic ? "الشهادات" : "Certifications"}</Typography>
              <List>
                {(isArabic ? coach.certificationsAr : coach.certifications).map((cert, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Verified color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={cert} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>{isArabic ? "التخصصات" : "Specialties"}</Typography>
              <List>
                {(isArabic ? coach.specialtiesAr : coach.specialties).map((specialty, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Check color="primary" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={specialty} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Card>
      )}
      
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {coach.testimonials.map((testimonial) => (
            <Grid item xs={12} md={4} key={testimonial.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6">{isArabic ? testimonial.nameAr : testimonial.name}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {isArabic ? testimonial.companyAr : testimonial.company}
                  </Typography>
                  
                  <Rating
                    value={testimonial.rating}
                    readOnly
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="body1">
                    "{isArabic ? testimonial.contentAr : testimonial.content}"
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {tabValue === 2 && (
        <Card sx={{ p: 3 }} id="availability-section" ref={availabilitySectionRef}>
          <Typography variant="h5" gutterBottom>{isArabic ? "الأوقات المتاحة" : "Available Time Slots"}</Typography>
          <Typography variant="body2" paragraph>
            {isArabic 
              ? `حدد تاريخاً ووقتاً لحجز جلستك مع ${coach.nameAr}.${userBookings.length > 0 ? " الأوقات التي حجزتها بالفعل تظهر كغير متاحة." : ""}`
              : `Select a date and time to book your session with ${coach.name}.${userBookings.length > 0 ? " Time slots you've already booked are marked as unavailable." : ""}`
            }
          </Typography>
          
          <Grid container spacing={3}>
            {coach.availableTimes.map((day, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {isArabic 
                        ? new Date(day.date).toLocaleDateString('ar-AE', { weekday: 'long', month: 'long', day: 'numeric' })
                        : new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                      }
                    </Typography>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    {day.slots.map((time, idx) => renderTimeSlotButton(day, time, idx))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              size="large"
              color="primary"
              onClick={handleBookSession}
              disabled={!selectedTimeSlot || bookingLoading}
              id="booking-action-button"
              ref={bookingActionButtonRef}
              sx={{
                px: 4,
                py: 1,
                boxShadow: selectedTimeSlot ? 3 : 0,
                transition: 'all 0.3s',
                fontSize: selectedTimeSlot ? '1.1rem' : '1rem',
                minWidth: '220px'
              }}
            >
              {bookingLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  {isArabic ? "جاري المعالجة..." : "Processing..."}
                </Box>
              ) : (
                selectedTimeSlot ? 
                  isArabic ?
                    `حجز جلسة في الساعة ${selectedTimeSlot.time} يوم ${new Date(selectedTimeSlot.date).toLocaleDateString('ar-AE', {month: 'short', day: 'numeric'})}` :
                    `Book Session for ${selectedTimeSlot.time} on ${new Date(selectedTimeSlot.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}` : 
                  isArabic ? "اختر موعداً" : "Select a Time Slot"
              )}
            </Button>
          </Box>
        </Card>
      )}
    </Container>
  );
};

export default CoachProfile;
