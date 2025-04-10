import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Grid, 
  Divider, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Chip, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Tab,
  Tabs,
} from '@mui/material';
import { 
  Assignment, 
  Description, 
  Psychology, 
  Business, 
  ExpandMore,
  LocalOffer,
  TipsAndUpdates,
  School,
  Work,
  People,
  Stars,
  FormatQuote,
  LinkedIn,
  CheckCircle,
  ArticleOutlined,
  HelpOutline,
  RecordVoiceOver
} from '@mui/icons-material';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';

const ApplicationTips = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSection, setExpandedSection] = useState('resumeTips');
  const { t, i18n } = useTranslation();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? panel : false);
  };

  const resumeTips = [
    {
      id: 1,
      title: 'Tailor your resume to each job',
      titleAr: 'خصص سيرتك الذاتية لكل وظيفة',
      description: 'Customize your resume to highlight skills and experiences relevant to the specific position you\'re applying for.',
      descriptionAr: 'قم بتخصيص سيرتك الذاتية لإبراز المهارات والخبرات ذات الصلة بالمنصب المحدد الذي تتقدم له.',
      icon: <Assignment color="primary" />,
    },
    {
      id: 2,
      title: 'Use keywords from the job description',
      titleAr: 'استخدم الكلمات الرئيسية من وصف الوظيفة',
      description: 'Many companies use Applicant Tracking Systems (ATS) to filter resumes. Include relevant keywords from the job posting.',
      descriptionAr: 'تستخدم العديد من الشركات أنظمة تتبع المتقدمين (ATS) لتصفية السير الذاتية. قم بتضمين الكلمات الرئيسية ذات الصلة من إعلان الوظيفة.',
      icon: <LocalOffer color="primary" />,
    },
    {
      id: 3,
      title: 'Quantify your achievements',
      titleAr: 'قم بتحديد إنجازاتك كميًا',
      description: 'Use numbers and metrics to demonstrate your impact (e.g., "Increased sales by 20%" rather than "Increased sales").',
      descriptionAr: 'استخدم الأرقام والمقاييس لإظهار تأثيرك (مثلاً، "زيادة المبيعات بنسبة 20٪" بدلاً من "زيادة المبيعات").',
      icon: <TipsAndUpdates color="primary" />,
    },
    {
      id: 4,
      title: 'Keep it concise and relevant',
      titleAr: 'احتفظ بها موجزة وذات صلة',
      description: 'Limit your resume to 1-2 pages, focusing on experiences relevant to the job you\'re applying for.',
      descriptionAr: 'حدد سيرتك الذاتية في 1-2 صفحات، مع التركيز على الخبرات ذات الصلة بالوظيفة التي تتقدم لها.',
      icon: <ArticleOutlined color="primary" />,
    },
    {
      id: 5,
      title: 'Proofread carefully',
      titleAr: 'تدقيق بعناية',
      description: 'Eliminate spelling and grammar errors. Ask someone else to review your resume before submitting it.',
      descriptionAr: 'تخلص من أخطاء الإملاء والنحو. اطلب من شخص آخر مراجعة سيرتك الذاتية قبل تقديمها.',
      icon: <CheckCircle color="primary" />,
    }
  ];

  const coverLetterTips = [
    {
      id: 1,
      title: 'Address the hiring manager by name',
      titleAr: 'خاطب مدير التوظيف بالاسم',
      description: 'Research the company to find the name of the hiring manager or recruiter. Avoid generic greetings like "To Whom It May Concern."',
      descriptionAr: 'ابحث عن الشركة لمعرفة اسم مدير التوظيف أو المسؤول عن التوظيف. تجنب التحيات العامة مثل "إلى من يهمه الأمر."',
      icon: <Description color="primary" />,
    },
    {
      id: 2,
      title: 'Show enthusiasm for the role and company',
      titleAr: 'أظهر حماسك للدور والشركة',
      description: 'Explain why you\'re excited about the position and the organization specifically.',
      descriptionAr: 'اشرح سبب حماسك للمنصب والمؤسسة على وجه التحديد.',
      icon: <Stars color="primary" />,
    },
    {
      id: 3,
      title: 'Connect your experience to the job requirements',
      titleAr: 'اربط خبرتك بمتطلبات الوظيفة',
      description: 'Highlight 2-3 specific examples from your experience that demonstrate you have the skills they\'re looking for.',
      descriptionAr: 'سلط الضوء على 2-3 أمثلة محددة من خبرتك التي توضح أن لديك المهارات التي يبحثون عنها.',
      icon: <Work color="primary" />,
    },
    {
      id: 4,
      title: 'Keep it concise',
      titleAr: 'احتفظ به موجزًا',
      description: 'Your cover letter should be no more than one page with 3-4 paragraphs.',
      descriptionAr: 'يجب ألا يتجاوز خطاب التغطية الخاص بك صفحة واحدة مع 3-4 فقرات.',
      icon: <FormatQuote color="primary" />,
    },
    {
      id: 5,
      title: 'End with a call to action',
      titleAr: 'انهِ بدعوة للعمل',
      description: 'Express interest in an interview and provide your contact information.',
      descriptionAr: 'أعرب عن اهتمامك بإجراء مقابلة وقدم معلومات الاتصال الخاصة بك.',
      icon: <RecordVoiceOver color="primary" />,
    }
  ];

  const interviewTips = [
    {
      id: 1,
      title: 'Research the company thoroughly',
      titleAr: 'ابحث عن الشركة بدقة',
      description: 'Learn about the company\'s mission, values, products/services, recent news, and culture before your interview.',
      descriptionAr: 'تعرف على مهمة الشركة وقيمها ومنتجاتها/خدماتها وأخبارها الأخيرة وثقافتها قبل المقابلة.',
      icon: <Business color="primary" />,
    },
    {
      id: 2,
      title: 'Practice common interview questions',
      titleAr: 'تدرب على أسئلة المقابلة الشائعة',
      description: 'Prepare answers for common questions, especially behavioral questions using the STAR method (Situation, Task, Action, Result).',
      descriptionAr: 'قم بإعداد إجابات للأسئلة الشائعة، خاصة الأسئلة السلوكية باستخدام طريقة STAR (الموقف، المهمة، الإجراء، النتيجة).',
      icon: <Psychology color="primary" />,
    },
    {
      id: 3,
      title: 'Prepare questions to ask',
      titleAr: 'جهز أسئلة لطرحها',
      description: 'Have thoughtful questions ready to ask the interviewer about the role, team, and company.',
      descriptionAr: 'احرص على تجهيز أسئلة مدروسة لطرحها على المحاور حول الدور والفريق والشركة.',
      icon: <HelpOutline color="primary" />,
    },
    {
      id: 4,
      title: 'Dress professionally',
      titleAr: 'ارتدِ ملابس احترافية',
      description: 'Dress one level above the company\'s everyday dress code. When in doubt, it\'s better to be overdressed than underdressed.',
      descriptionAr: 'ارتدِ ملابس بمستوى أعلى من قواعد اللباس اليومية للشركة. عند الشك، من الأفضل أن تكون ملابسك رسمية أكثر من اللازم بدلاً من أن تكون أقل من اللازم.',
      icon: <People color="primary" />,
    },
    {
      id: 5,
      title: 'Follow up after the interview',
      titleAr: 'تابع بعد المقابلة',
      description: 'Send a thank-you email within 24 hours expressing appreciation for the opportunity and reiterating your interest.',
      descriptionAr: 'أرسل بريدًا إلكترونيًا للشكر في غضون 24 ساعة تعبر فيه عن تقديرك للفرصة وتكرر اهتمامك.',
      icon: <CheckCircle color="primary" />,
    }
  ];

  const linkedInTips = [
    {
      id: 1,
      title: 'Optimize your LinkedIn profile',
      titleAr: 'تحسين ملف LinkedIn الخاص بك',
      description: 'Use a professional photo, write a compelling headline, and craft a detailed summary that highlights your skills and experience.',
      descriptionAr: 'استخدم صورة احترافية، واكتب عنوانًا جذابًا، وصمم ملخصًا مفصلاً يسلط الضوء على مهاراتك وخبرتك.',
      icon: <LinkedIn color="primary" />,
    },
    {
      id: 2,
      title: 'Build your network strategically',
      titleAr: 'بناء شبكتك بشكل استراتيجي',
      description: 'Connect with colleagues, classmates, and industry professionals. Include a personalized note when sending connection requests.',
      descriptionAr: 'تواصل مع الزملاء وزملاء الدراسة والمهنيين في المجال. قم بتضمين ملاحظة شخصية عند إرسال طلبات الاتصال.',
      icon: <People color="primary" />,
    },
    {
      id: 3,
      title: 'Engage with content regularly',
      titleAr: 'تفاعل مع المحتوى بانتظام',
      description: 'Like, comment on, and share relevant industry content. Post your own insights and articles to establish thought leadership.',
      descriptionAr: 'أعجب بمحتوى الصناعة ذي الصلة وعلق عليه وشاركه. انشر رؤاك ومقالاتك الخاصة لتأسيس قيادة فكرية.',
      icon: <ArticleOutlined color="primary" />,
    },
    {
      id: 4,
      title: 'Request recommendations',
      titleAr: 'طلب التوصيات',
      description: 'Ask former colleagues, managers, and clients to write recommendations that highlight your specific skills and contributions.',
      descriptionAr: 'اطلب من الزملاء السابقين والمديرين والعملاء كتابة توصيات تسلط الضوء على مهاراتك ومساهماتك المحددة.',
      icon: <Stars color="primary" />,
    },
    {
      id: 5,
      title: 'Use LinkedIn Learning',
      titleAr: 'استخدم LinkedIn Learning',
      description: 'Develop new skills and showcase them on your profile using LinkedIn Learning certificates.',
      descriptionAr: 'طور مهارات جديدة وأبرزها في ملفك الشخصي باستخدام شهادات LinkedIn Learning.',
      icon: <School color="primary" />,
    }
  ];

  const renderTips = (tips) => (
    <List>
      {tips.map((tip) => (
        <ListItem key={tip.id} alignItems="flex-start" sx={{ py: 2 }}>
          <ListItemIcon>{tip.icon}</ListItemIcon>
          <ListItemText
            primary={<Typography variant="h6">{i18n.language === 'ar' ? tip.titleAr : tip.title}</Typography>}
            secondary={i18n.language === 'ar' ? tip.descriptionAr : tip.description}
            secondaryTypographyProps={{ variant: 'body1' }}
          />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Helmet>
        <title>Application Tips | Tamkeen AI</title>
        <meta name="description" content="Expert tips for job applications, resumes, cover letters, and interviews" />
      </Helmet>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {i18n.language === 'ar' ? 'نصائح التقديم وأفضل الممارسات' : 'Application Tips & Best Practices'}
        </Typography>
        
        <Typography variant="body1" paragraph>
          {i18n.language === 'ar' 
            ? 'عزز فرصك في الحصول على وظيفة أحلامك من خلال نصائحنا الشاملة للتقديم. من صياغة السيرة الذاتية المثالية إلى النجاح في المقابلة، لدينا نصائح خبراء تغطي كل مرحلة من مراحل عملية التقديم.'
            : 'Boost your chances of landing your dream job with our comprehensive application tips. From crafting the perfect resume to acing your interview, we\'ve got you covered with expert advice for every stage of the application process.'}
        </Typography>

        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          sx={{ mb: 3 }}
        >
          <Tab label={i18n.language === 'ar' ? 'نصائح السيرة الذاتية' : 'Resume Tips'} icon={<Assignment />} iconPosition="start" />
          <Tab label={i18n.language === 'ar' ? 'خطاب التغطية' : 'Cover Letter'} icon={<Description />} iconPosition="start" />
          <Tab label={i18n.language === 'ar' ? 'التحضير للمقابلة' : 'Interview Prep'} icon={<Psychology />} iconPosition="start" />
          <Tab label={i18n.language === 'ar' ? 'تحسين LinkedIn' : 'LinkedIn Optimization'} icon={<LinkedIn />} iconPosition="start" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              {i18n.language === 'ar' ? 'إنشاء سيرة ذاتية ناجحة' : 'Craft a Winning Resume'}
            </Typography>
            <Typography variant="body1" paragraph>
              {i18n.language === 'ar' 
                ? 'سيرتك الذاتية هي غالبًا الانطباع الأول الذي تتركه لدى أصحاب العمل المحتملين. اجعلها مؤثرة من خلال هذه النصائح الخبيرة لإنشاء سيرة ذاتية متميزة.'
                : 'Your resume is often the first impression you make on potential employers. Make it count with these expert tips for creating a standout resume.'}
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="200"
                image="https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Resume writing"
                sx={{ objectFit: "cover" }}
              />
            </Card>
            {renderTips(resumeTips)}
            
            <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {i18n.language === 'ar' 
                  ? 'نصيحة احترافية: استخدم أداة إنشاء السيرة الذاتية لدينا لإنشاء سيرة ذاتية احترافية متوافقة مع نظام تتبع المتقدمين (ATS) تبرز بين المنافسين.'
                  : 'Pro Tip: Use our Resume Builder tool to create a professional, ATS-friendly resume that stands out.'}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 1 }}
                href="/resumePage"
              >
                {i18n.language === 'ar' ? 'جرب منشئ السيرة الذاتية' : 'Try Resume Builder'}
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              {i18n.language === 'ar' ? 'كتابة خطابات تغطية فعالة' : 'Writing Effective Cover Letters'}
            </Typography>
            <Typography variant="body1" paragraph>
              {i18n.language === 'ar' 
                ? 'يمكن لخطاب التغطية المصاغ بشكل جيد أن يميزك عن المرشحين الآخرين من خلال إظهار شغفك بالدور وشرح سبب كونك المرشح المثالي.'
                : 'A well-crafted cover letter can set you apart from other candidates by showing your passion for the role and explaining why you\'re the perfect fit.'}
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="200"
                image="https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Cover letter writing"
                sx={{ objectFit: "cover" }}
              />
            </Card>
            {renderTips(coverLetterTips)}
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              {i18n.language === 'ar' ? 'التحضير للمقابلة' : 'Interview Preparation'}
            </Typography>
            <Typography variant="body1" paragraph>
              {i18n.language === 'ar' 
                ? 'المقابلات هي فرصتك لإظهار شخصيتك ومهاراتك ومدى ملاءمتك للدور. الإعداد هو مفتاح النجاح في المقابلة.'
                : 'Interviews are your opportunity to showcase your personality, skills, and fit for the role. Preparation is key to interview success.'}
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="200"
                image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Job interview"
                sx={{ objectFit: "cover" }}
              />
            </Card>
            {renderTips(interviewTips)}
            
            <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {i18n.language === 'ar' 
                  ? 'الممارسة تصنع الكمال! جرب مدرب المقابلات بالذكاء الاصطناعي للحصول على تدريب شخصي للمقابلة وملاحظات.'
                  : 'Practice makes perfect! Try our AI Interview Coach for personalized interview practice and feedback.'}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 1 }}
                href="/ai-coach/interview"
              >
                {i18n.language === 'ar' ? 'جرب المقابلة التجريبية' : 'Try Mock Interview'}
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              {i18n.language === 'ar' ? 'تحسين LinkedIn' : 'LinkedIn Optimization'}
            </Typography>
            <Typography variant="body1" paragraph>
              {i18n.language === 'ar' 
                ? 'LinkedIn هي أداة أساسية للتواصل المهني والبحث عن وظائف. قم بتحسين ملفك الشخصي ونشاطك لجذب المسؤولين عن التوظيف والفرص.'
                : 'LinkedIn is an essential tool for professional networking and job searching. Optimize your profile and activity to attract recruiters and opportunities.'}
            </Typography>
            <Card sx={{ mb: 3 }}>
              <CardMedia
                component="img"
                height="200"
                image="https://images.unsplash.com/photo-1611944212129-29977ae1398c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="LinkedIn profile"
                sx={{ objectFit: "cover" }}
              />
            </Card>
            {renderTips(linkedInTips)}
            
            <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {i18n.language === 'ar' 
                  ? 'يمكن أن تساعدك أداة أتمتة LinkedIn لدينا في التواصل مع أصحاب العمل المحتملين وبناء شبكتك المهنية.'
                  : 'Our LinkedIn Automation tool can help you connect with potential employers and build your professional network.'}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 1 }}
                href="/automation-linkedin"
              >
                {i18n.language === 'ar' ? 'استكشاف أدوات LinkedIn' : 'Explore LinkedIn Tools'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {i18n.language === 'ar' ? 'موارد إضافية' : 'Additional Resources'}
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <School color="primary" sx={{ mr: 1, verticalAlign: "middle" }} />
                  {i18n.language === 'ar' ? 'تقييم المهارات' : 'Skills Assessment'}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {i18n.language === 'ar' 
                    ? 'حدد نقاط قوتك ومجالات التحسين لتركيز بحثك عن وظيفة بشكل فعال.'
                    : 'Identify your strengths and areas for improvement to focus your job search effectively.'}
                </Typography>
                <Button variant="outlined" href="/skills-assessment">
                  {i18n.language === 'ar' ? 'إجراء التقييم' : 'Take Assessment'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Work color="primary" sx={{ mr: 1, verticalAlign: "middle" }} />
                  {i18n.language === 'ar' ? 'استراتيجية البحث عن وظيفة' : 'Job Search Strategy'}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {i18n.language === 'ar' 
                    ? 'تعلم استراتيجيات فعالة للعثور على الفرص المناسبة والتقدم لها.'
                    : 'Learn effective strategies for finding and applying to the right opportunities.'}
                </Typography>
                <Button variant="outlined" href="/job-search">
                  {i18n.language === 'ar' ? 'تصفح الوظائف' : 'Browse Jobs'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <TipsAndUpdates color="primary" sx={{ mr: 1, verticalAlign: "middle" }} />
                  {i18n.language === 'ar' ? 'تدريب المقابلة بالذكاء الاصطناعي' : 'AI Interview Practice'}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {i18n.language === 'ar' 
                    ? 'تدرب مع محاكي المقابلة المدعوم بالذكاء الاصطناعي الذي يوفر ملاحظات في الوقت الفعلي.'
                    : 'Practice with our AI-powered interview simulator that provides real-time feedback.'}
                </Typography>
                <Button variant="outlined" href="/ai-coach/interview">
                  {i18n.language === 'ar' ? 'بدء التدريب' : 'Start Practice'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ApplicationTips; 