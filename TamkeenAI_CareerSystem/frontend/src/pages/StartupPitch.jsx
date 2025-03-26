import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Button, Divider,
  Grid, Paper, Card, CardContent, CardMedia, IconButton,
  Stepper, Step, StepLabel, StepContent, MobileStepper,
  List, ListItem, ListItemText, ListItemIcon, Chip,
  useMediaQuery, Fade, Grow, Slide, Zoom, Dialog,
  DialogTitle, DialogContent, DialogActions, Tooltip,
  CircularProgress, Avatar, LinearProgress,
  AppBar, Toolbar, useScrollTrigger
} from '@mui/material';
import {
  KeyboardArrowDown, KeyboardArrowUp, KeyboardArrowLeft, KeyboardArrowRight,
  PlayArrow, CheckCircle, Work, TrendingUp, BarChart, Psychology,
  Business, School, Public, Lightbulb, Timeline, Insights,
  CompareArrows, Group, Person, Mail, LinkedIn, GitHub,
  MonetizationOn, Assessment, Visibility, Computer, Code,
  Security, ShowChart, ArrowForward, ArrowBack, Language,
  Smartphone, Speed, Cloud, Assistant, Settings, Star,
  LocalOffer, CategoryOutlined, ContactSupport, AccessTime
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Custom components
import ChartSection from '../components/pitch/ChartSection';
import FeatureShowcase from '../components/pitch/FeatureShowcase';
import TeamMember from '../components/pitch/TeamMember';
import ComparisonTable from '../components/pitch/ComparisonTable';
import DemoVideo from '../components/pitch/DemoVideo';
import AnimatedLogo from '../components/pitch/AnimatedLogo';

const StartupPitch = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDemoDialog, setShowDemoDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const sectionRefs = useRef([]);
  const autoPlayTimer = useRef(null);
  const scrollEndTimeout = useRef(null);
  
  const sections = [
    { id: 'vision', label: 'Vision', icon: <Lightbulb /> },
    { id: 'problem', label: 'Problem', icon: <Psychology /> },
    { id: 'solution', label: 'Solution', icon: <CheckCircle /> },
    { id: 'features', label: 'Features', icon: <Star /> },
    { id: 'technology', label: 'Technology', icon: <Code /> },
    { id: 'market', label: 'Market', icon: <ShowChart /> },
    { id: 'business', label: 'Business Model', icon: <MonetizationOn /> },
    { id: 'roadmap', label: 'Roadmap', icon: <Timeline /> },
    { id: 'team', label: 'Team', icon: <Group /> },
    { id: 'next', label: 'Next Steps', icon: <ArrowForward /> }
  ];
  
  const features = [
    {
      id: 'resume-builder',
      title: 'Smart Resume Builder',
      icon: <Work />,
      description: 'AI-powered resume creation with industry-specific templates, ATS optimization, and real-time feedback.',
      stats: ['92% ATS pass rate', '67% interview callback improvement', '15+ industry templates'],
      screenshot: '/images/features/resume-builder.png',
      color: theme.palette.primary.main
    },
    {
      id: 'career-insights',
      title: 'Career Insights & Analytics',
      icon: <Insights />,
      description: 'Data-driven career guidance with skill gap analysis, market demand tracking, and personalized upskilling recommendations.',
      stats: ['1.2M+ job datapoints', 'Personalized skill roadmaps', 'Regional demand heatmaps'],
      screenshot: '/images/features/career-insights.png',
      color: theme.palette.secondary.main
    },
    {
      id: 'interview-coach',
      title: 'AI Interview Coach',
      icon: <Psychology />,
      description: 'Virtual interview preparation with industry-specific questions, real-time feedback on responses, and performance analytics.',
      stats: ['5,000+ industry questions', 'Speech pattern analysis', 'Body language tips via webcam'],
      screenshot: '/images/features/interview-coach.png',
      color: theme.palette.success.main
    },
    {
      id: 'network-assist',
      title: 'Networking Assistant',
      icon: <Group />,
      description: 'Smart tools for building professional connections, including message templates, follow-up reminders, and opportunity tracking.',
      stats: ['Connection strategy planning', 'Message effectiveness scoring', 'Relationship timeline tracking'],
      screenshot: '/images/features/networking.png',
      color: theme.palette.warning.main
    },
    {
      id: 'job-match',
      title: 'AI Job Matching',
      icon: <CompareArrows />,
      description: 'Precision job recommendations based on skills, experience, preferences, and growth potential.',
      stats: ['92% match accuracy', 'Hidden job market access', 'Compensation benchmarking'],
      screenshot: '/images/features/job-matching.png',
      color: theme.palette.info.main
    }
  ];
  
  const teamMembers = [
    {
      name: 'Sarah Al-Mutairi',
      title: 'CEO & Founder',
      bio: 'Former Google AI researcher with expertise in NLP and 10+ years in tech leadership. MBA from Stanford.',
      avatar: '/images/team/sarah.jpg',
      social: { linkedin: '#', github: '#', twitter: '#' }
    },
    {
      name: 'Ahmed Hassan',
      title: 'CTO',
      bio: 'AI/ML specialist with background at DeepMind. PhD in Computer Science from MIT focusing on conversational AI.',
      avatar: '/images/team/ahmed.jpg',
      social: { linkedin: '#', github: '#' }
    },
    {
      name: 'Layla Mahmoud',
      title: 'Head of Product',
      bio: 'Former Product Lead at LinkedIn. Expert in career development platforms with 8+ years of product management experience.',
      avatar: '/images/team/layla.jpg',
      social: { linkedin: '#' }
    },
    {
      name: 'Omar Khan',
      title: 'Head of Data Science',
      bio: 'Data scientist with expertise in predictive analytics. Previously led data teams at Indeed and Monster.',
      avatar: '/images/team/omar.jpg',
      social: { linkedin: '#', github: '#' }
    }
  ];
  
  const marketStats = [
    { label: 'Global HR Tech Market Size', value: '$47.5B', growth: '+12% YoY' },
    { label: 'Career Services Market', value: '$25.9B', growth: '+8.7% YoY' },
    { label: 'AI in Recruitment', value: '$580M', growth: '+32% YoY' },
    { label: 'Annual Job Seekers', value: '27M+', growth: 'in our target markets' },
    { label: 'Addressable Users', value: '118M+', growth: 'professionals globally' }
  ];
  
  const competitiveAdvantages = [
    { advantage: 'End-to-End Career Solution', description: 'Unlike point solutions, we cover the entire career development journey' },
    { advantage: 'Advanced AI Integration', description: 'Proprietary NLP models fine-tuned for career context understanding' },
    { advantage: 'Regional Specialization', description: 'Customized for MENA region job markets and cultural contexts' },
    { advantage: 'Skill-Centric Approach', description: 'Focus on skills rather than just job titles or companies' },
    { advantage: 'Data-Driven Insights', description: 'Real-time market analytics inform all recommendations' }
  ];
  
  const roadmapItems = [
    { 
      phase: 'Phase 1: MVP Launch', 
      timeline: 'Q3 2023', 
      items: ['Core resume building', 'Basic job matching', 'Initial analytics dashboard'],
      status: 'Completed'
    },
    { 
      phase: 'Phase 2: Enhanced AI', 
      timeline: 'Q4 2023', 
      items: ['Interview simulation', 'Advanced skill analysis', 'Personalized learning paths'],
      status: 'Current'
    },
    { 
      phase: 'Phase 3: Enterprise', 
      timeline: 'Q2 2024', 
      items: ['Corporate hiring solutions', 'Talent pool analytics', 'API integrations'],
      status: 'Upcoming'
    },
    { 
      phase: 'Phase 4: Global Expansion', 
      timeline: 'Q4 2024', 
      items: ['Multi-language support', 'Region-specific insights', 'Global partnerships'],
      status: 'Planned'
    }
  ];
  
  // Initialize section refs
  useEffect(() => {
    sectionRefs.current = Array(sections.length).fill().map(() => React.createRef());
  }, []);
  
  // Handle auto play
  useEffect(() => {
    if (isPlaying) {
      autoPlayTimer.current = setTimeout(() => {
        if (activeStep < sections.length - 1) {
          handleNext();
        } else {
          setIsPlaying(false);
        }
      }, 15000); // 15 seconds per section
    }
    
    return () => {
      if (autoPlayTimer.current) {
        clearTimeout(autoPlayTimer.current);
      }
    };
  }, [isPlaying, activeStep]);
  
  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (isAutoScrolling) return;
      
      if (scrollEndTimeout.current) {
        clearTimeout(scrollEndTimeout.current);
      }
      
      scrollEndTimeout.current = setTimeout(() => {
        // Find which section is most visible
        const viewportHeight = window.innerHeight;
        const viewportCenter = window.scrollY + viewportHeight / 2;
        
        let closestSection = 0;
        let closestDistance = Infinity;
        
        sectionRefs.current.forEach((ref, index) => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const sectionCenter = window.scrollY + rect.top + rect.height / 2;
            const distance = Math.abs(viewportCenter - sectionCenter);
            
            if (distance < closestDistance) {
              closestDistance = distance;
              closestSection = index;
            }
          }
        });
        
        setActiveStep(closestSection);
      }, 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollEndTimeout.current) {
        clearTimeout(scrollEndTimeout.current);
      }
    };
  }, [isAutoScrolling]);
  
  const scrollToSection = (index) => {
    setIsAutoScrolling(true);
    setActiveStep(index);
    
    if (sectionRefs.current[index]?.current) {
      const topOffset = 80; // Account for navbar height
      const elementTop = sectionRefs.current[index].current.getBoundingClientRect().top;
      const offsetPosition = elementTop + window.pageYOffset - topOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Reset auto-scrolling flag after animation completes
      setTimeout(() => {
        setIsAutoScrolling(false);
      }, 1000);
    }
  };
  
  const handleNext = () => {
    if (activeStep < sections.length - 1) {
      scrollToSection(activeStep + 1);
    }
  };
  
  const handleBack = () => {
    if (activeStep > 0) {
      scrollToSection(activeStep - 1);
    }
  };
  
  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    if (isPlaying && autoPlayTimer.current) {
      clearTimeout(autoPlayTimer.current);
    }
  };
  
  const handleDemoClick = () => {
    setShowDemoDialog(true);
    setIsLoading(true);
    
    // Simulate video loading
    setTimeout(() => {
      setIsLoading(false);
      setVideoReady(true);
    }, 2000);
  };
  
  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Fixed navigation */}
      <AppBar 
        position="fixed" 
        color="default" 
        elevation={0}
        sx={{ 
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                fontWeight: 700,
                color: 'primary.main',
                mr: 4
              }}
            >
              <img 
                src="/logo.png" 
                alt="TamkeenAI Logo" 
                style={{ height: '32px', marginRight: '12px' }} 
              />
              TamkeenAI
            </Typography>
            
            {!isSmallScreen && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                {sections.map((section, index) => (
                  <Button 
                    key={section.id}
                    onClick={() => scrollToSection(index)}
                    sx={{ 
                      minWidth: 'auto', 
                      color: activeStep === index ? 'primary.main' : 'text.secondary',
                      borderBottom: activeStep === index ? '2px solid' : 'none',
                      borderColor: 'primary.main',
                      borderRadius: 0,
                      pb: 0.5
                    }}
                  >
                    {section.label}
                  </Button>
                ))}
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={isPlaying ? "Pause Presentation" : "Auto Play"}>
              <IconButton onClick={handlePlay} color={isPlaying ? "primary" : "default"}>
                {isPlaying ? <AccessTime /> : <PlayArrow />}
              </IconButton>
            </Tooltip>
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleDemoClick}
              startIcon={<Visibility />}
            >
              Demo
            </Button>
          </Box>
        </Toolbar>
        
        {/* Mobile stepper */}
        {isSmallScreen && (
          <MobileStepper
            variant="dots"
            steps={sections.length}
            position="static"
            activeStep={activeStep}
            sx={{ 
              backgroundColor: 'background.paper',
              '& .MuiMobileStepper-dot': {
                margin: '0 4px',
              },
              '& .MuiMobileStepper-dotActive': {
                backgroundColor: 'primary.main',
              }
            }}
            nextButton={
              <Button 
                size="small" 
                onClick={handleNext}
                disabled={activeStep === sections.length - 1}
              >
                Next
                <KeyboardArrowRight />
              </Button>
            }
            backButton={
              <Button 
                size="small" 
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                <KeyboardArrowLeft />
                Back
              </Button>
            }
          />
        )}
      </AppBar>
      
      <Box sx={{ pt: 10 }}>
        {/* Vision Section */}
        <Box
          ref={sectionRefs.current[0]}
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            py: 8,
            px: 2,
            textAlign: 'center',
            background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.main}10 100%)`,
          }}
        >
          <Fade in={true} timeout={1000}>
            <Box>
              <Zoom in={true} timeout={1500}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                  <AnimatedLogo size={120} />
                </Box>
              </Zoom>
              
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 800,
                  mb: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                TamkeenAI: Empowering Tomorrow's Careers
              </Typography>
              
              <Typography 
                variant="h5" 
                color="textSecondary"
                sx={{ 
                  maxWidth: '800px', 
                  mx: 'auto',
                  mb: 5,
                  fontWeight: 300,
                  lineHeight: 1.6
                }}
              >
                An AI-powered career development platform that bridges the gap between education and employment,
                creating pathways to professional success through intelligent guidance and skill development.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={() => scrollToSection(1)}
                  endIcon={<KeyboardArrowDown />}
                  sx={{ py: 1.5, px: 4 }}
                >
                  Explore Our Vision
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                  onClick={handleDemoClick}
                  endIcon={<Visibility />}
                  sx={{ py: 1.5, px: 4 }}
                >
                  Watch Demo
                </Button>
              </Box>
            </Box>
          </Fade>
          
          <Box sx={{ position: 'absolute', bottom: 40 }}>
            <IconButton
              color="primary"
              onClick={() => scrollToSection(1)}
              sx={{ 
                animation: 'bounce 2s infinite',
                '@keyframes bounce': {
                  '0%, 20%, 50%, 80%, 100%': {
                    transform: 'translateY(0)',
                  },
                  '40%': {
                    transform: 'translateY(-20px)',
                  },
                  '60%': {
                    transform: 'translateY(-10px)',
                  }
                }
              }}
            >
              <KeyboardArrowDown fontSize="large" />
            </IconButton>
          </Box>
        </Box>
        
        {/* Problem Section */}
        <Box
          ref={sectionRefs.current[1]}
          sx={{
            minHeight: '100vh',
            py: 8,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="overline" color="primary" fontWeight={500}>
                  THE CHALLENGE
                </Typography>
                <Typography variant="h3" component="h2" gutterBottom fontWeight={700}>
                  The Career Development Gap
                </Typography>
                
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 4 }}>
                  In today's rapidly evolving job market, professionals face unprecedented challenges in career advancement. 
                  Traditional approaches to job searching and career development are fundamentally broken.
                </Typography>
                
                <List sx={{ mb: 4 }}>
                  {[
                    {
                      problem: "Job Search Inefficiency",
                      description: "Only 2% of job applicants receive an interview, leading to wasted time and frustration",
                      icon: <Work color="error" />
                    },
                    {
                      problem: "Skills Mismatch",
                      description: "87% of organizations report skills gaps, yet individuals lack clarity on what to learn",
                      icon: <Psychology color="error" />
                    },
                    {
                      problem: "Misaligned Career Guidance",
                      description: "Traditional career advice is generic and fails to account for regional market dynamics",
                      icon: <Insights color="error" />
                    },
                    {
                      problem: "Opaque Hiring Processes",
                      description: "Black-box ATS systems reject qualified candidates through poorly optimized filtering",
                      icon: <Computer color="error" />
                    }
                  ].map((item, index) => (
                    <ListItem key={index} alignItems="flex-start" sx={{ mb: 2 }}>
                      <ListItemIcon sx={{ mt: 0.5 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="h6">{item.problem}</Typography>}
                        secondary={item.description}
                        secondaryTypographyProps={{ variant: 'body1' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    backgroundColor: 'background.paper', 
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="h5" gutterBottom fontWeight={600} color="error.main">
                    The Statistics Are Alarming
                  </Typography>
                  
                  <Box sx={{ mb: 4 }}>
                    {[
                      { label: 'Average Job Applications Per Hire', value: '200+' },
                      { label: 'Time Spent in Job Search (Average)', value: '5-6 months' },
                      { label: 'Resumes Rejected by ATS Before Human Review', value: '75%' },
                      { label: 'Professionals Seeking Career Change Post-Pandemic', value: '52%' },
                      { label: 'Middle East Youth Unemployment', value: '27%' }
                    ].map((stat, index) => (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {stat.label}
                          </Typography>
                          <Typography variant="body1" fontWeight={700}>
                            {stat.value}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={((index + 1) / 5) * 100} 
                          color={index % 2 === 0 ? "error" : "warning"}
                          sx={{ height: 8, borderRadius: 2 }}
                        />
                      </Box>
                    ))}
                  </Box>
                  
                  <Box sx={{ bgcolor: 'error.light', p: 2, borderRadius: 1 }}>
                    <Typography variant="body1" color="error.contrastText">
                      <strong>The Cost:</strong> Billions in lost productivity, unfilled positions, and untapped human potential.
                      In the MENA region alone, skill gaps cost an estimated $2.5 trillion in lost GDP opportunities annually.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
        
        {/* Solution Section */}
        <Box
          ref={sectionRefs.current[2]}
          sx={{
            minHeight: '100vh',
            py: 8,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.main}10 100%)`,
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
                <Box sx={{ position: 'relative' }}>
                  <img 
                    src="/images/platform-overview.png" 
                    alt="TamkeenAI Platform Overview" 
                    style={{ 
                      width: '100%', 
                      height: 'auto',
                      borderRadius: '12px',
                      boxShadow: theme.shadows[10]
                    }}
                  />
                  
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      bottom: -20, 
                      right: -20, 
                      backgroundColor: 'background.paper',
                      borderRadius: '50%',
                      p: 2,
                      boxShadow: theme.shadows[4],
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 120,
                      height: 120,
                      border: '2px solid',
                      borderColor: 'primary.main',
                    }}
                  >
                    <Typography variant="overline" color="primary.main" sx={{ lineHeight: 1 }}>
                      Powered by
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      AI + ML
                    </Typography>
                    <Typography variant="caption" sx={{ textAlign: 'center' }}>
                      NLP, Computer Vision, Predictive Analytics
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
                <Typography variant="overline" color="primary" fontWeight={500}>
                  OUR SOLUTION
                </Typography>
                <Typography variant="h3" component="h2" gutterBottom fontWeight={700}>
                  The Integrated Career Ecosystem
                </Typography>
                
                <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 4 }}>
                  TamkeenAI is a comprehensive AI-powered platform that transforms how professionals navigate their careers through:
                </Typography>
                
                <List>
                  {[
                    {
                      solution: "Data-Driven Career Guidance",
                      description: "Personalized pathways based on regional market demand, individual skills, and growth opportunities",
                      icon: <BarChart color="primary" />
                    },
                    {
                      solution: "AI-Optimized Applications",
                      description: "Documents and applications engineered to succeed against ATS systems and human reviewers",
                      icon: <CheckCircle color="primary" />
                    },
                    {
                      solution: "Skills Intelligence Platform",
                      description: "Gap analysis and targeted development plans aligned with industry requirements",
                      icon: <TrendingUp color="primary" />
                    },
                    {
                      solution: "Simulation & Practice Environment",
                      description: "AI-driven interview coaching, networking practice, and career scenario planning",
                      icon: <Psychology color="primary" />
                    },
                    {
                      solution: "Continuous Growth System",
                      description: "Ongoing optimization and advancement through personalized feedback loops",
                      icon: <Timeline color="primary" />
                    }
                  ].map((item, index) => (
                    <ListItem key={index} sx={{ mb: 2 }}>
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="h6">{item.solution}</Typography>}
                        secondary={item.description}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Button 
                  variant="contained" 
                  color="primary"
                  size="large"
                  onClick={() => scrollToSection(3)}
                  endIcon={<ArrowForward />}
                  sx={{ mt: 4 }}
                >
                  Explore Key Features
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Box>
        
        {/* Features Section */}
        <Box
          ref={sectionRefs.current[3]}
          sx={{
            minHeight: '100vh',
            py: 8,
            px: 2,
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="overline" color="primary" fontWeight={500}>
                PLATFORM CAPABILITIES
              </Typography>
              <Typography variant="h3" component="h2" gutterBottom fontWeight={700}>
                Key Features
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: 700, mx: 'auto', fontSize: '1.1rem' }}>
                Our comprehensive suite of AI-powered tools creates a seamless career advancement experience:
              </Typography>
            </Box>
            
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8
                      },
                      overflow: 'visible'
                    }}
                  >
                    <Box 
                      sx={{ 
                        bgcolor: feature.color, 
                        color: 'white',
                        height: 12,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, position: 'relative', pt: 5 }}>
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          top: -30, 
                          left: 24,
                          bgcolor: feature.color,
                          color: 'white',
                          borderRadius: '50%',
                          width: 60,
                          height: 60,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 2
                        }}
                      >
                        {React.cloneElement(feature.icon, { fontSize: 'large' })}
                      </Box>
                      
                      <Typography variant="h5" component="h3" gutterBottom fontWeight={600}>
                        {feature.title}
                      </Typography>
                      
                      <Typography variant="body1" paragraph color="text.secondary">
                        {feature.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                        {feature.stats.map((stat, statIndex) => (
                          <Chip 
                            key={statIndex} 
                            label={stat}
                            size="small"
                            sx={{ 
                              bgcolor: `${feature.color}15`, 
                              color: feature.color,
                              fontWeight: 500
                            }}
                          />
                        ))}
                      </Box>
                    </CardContent>
                    <CardContent sx={{ pt: 0 }}>
                      <Button 
                        variant="outlined"
                        color="primary"
                        fullWidth
                        onClick={() => setExpandedFeature(feature)}
                      >
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
        
        {/* Technology Section */}
        <Box
          ref={sectionRefs.current[4]}
          sx={{
            minHeight: '100vh',
            py: 8,
            px: 2,
            background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.main}10 100%)`,
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="overline" color="primary" fontWeight={500}>
                  TECHNOLOGY STACK
                </Typography>
                <Typography variant="h3" component="h2" gutterBottom fontWeight={700}>
                  Advanced AI Architecture
                </Typography>
                
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem' }}>
                  Our platform leverages state-of-the-art AI technologies to deliver exceptional results:
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  {[
                    {
                      title: "Natural Language Processing",
                      description: "Fine-tuned models that understand career context, professional language, and industry terminology",
                      icon: <Language color="primary" />
                    },
                    {
                      title: "Computer Vision",
                      description: "Document analysis and optimization using visual pattern recognition",
                      icon: <Visibility color="primary" />
                    },
                    {
                      title: "Predictive Analytics",
                      description: "Market trend forecasting and personalized career trajectory modeling",
                      icon: <ShowChart color="primary" />
                    },
                    {
                      title: "Recommendation Systems",
                      description: "Advanced matching algorithms for jobs, skills, and learning paths",
                      icon: <Insights color="primary" />
                    }
                  ].map((tech, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {tech.icon}
                          <Typography variant="h6" fontWeight={600} sx={{ ml: 1 }}>
                            {tech.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {tech.description}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Technical Specifications
                </Typography>
                
                <Paper 
                  variant="outlined" 
                  sx={{ p: 2, borderRadius: 2, backgroundColor: 'background.paper' }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        API Calls/Month
                      </Typography>
                      <Typography variant="h6">
                        2.5M+
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Model Parameters
                      </Typography>
                      <Typography variant="h6">
                        175B
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Data Points
                      </Typography>
                      <Typography variant="h6">
                        1.7B+
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Language Support
                      </Typography>
                      <Typography variant="h6">
                        English + Arabic
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={4} 
                  sx={{ 
                    p: 3,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      width: '30%', 
                      height: '100%',
                      background: `linear-gradient(90deg, transparent 0%, ${theme.palette.primary.main}15 100%)`,
                      zIndex: 0
                    }} 
                  />
                  
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    System Architecture
                  </Typography>
                  
                  <Box 
                    component="img"
                    src="/images/pitch/architecture-diagram.png"
                    alt="System Architecture"
                    sx={{ 
                      width: '100%', 
                      height: 'auto', 
                      mb: 3,
                      borderRadius: 2,
                      boxShadow: 1
                    }}
                  />
                  
                  <Typography variant="subtitle1" fontWeight={500} sx={{ mt: 4, mb: 2 }}>
                    Our Tech Stack
                  </Typography>
                  
                  <Grid container spacing={1}>
                    {[
                      { label: 'Frontend', value: 'React, Material UI, TypeScript' },
                      { label: 'Backend', value: 'Node.js, Python, FastAPI' },
                      { label: 'AI/ML', value: 'TensorFlow, PyTorch, Hugging Face' },
                      { label: 'Data', value: 'MongoDB, PostgreSQL, Redis' },
                      { label: 'Infrastructure', value: 'AWS, Docker, Kubernetes' },
                      { label: 'Security', value: 'JWT, OAuth2, AES-256' }
                    ].map((item, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ minWidth: 100 }}>
                            {item.label}:
                          </Typography>
                          <Typography variant="body2" fontFamily="monospace" sx={{ ml: 2 }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Code />}
                      onClick={() => navigate('/tech-details')}
                    >
                      Technical Whitepaper
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
        
        {/* Market Section */}
        <Box
          ref={sectionRefs.current[5]}
          sx={{
            minHeight: '100vh',
            py: 8,
            px: 2,
            background: `linear-gradient(180deg, ${theme.palette.primary.main}10 0%, ${theme.palette.background.default} 100%)`,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="overline" color="primary" fontWeight={500} textAlign="center">
              MARKET OPPORTUNITY
            </Typography>
            <Typography variant="h3" component="h2" gutterBottom fontWeight={700} textAlign="center">
              Significant Market Demand
            </Typography>
            
            <Box sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}>
              <Typography variant="h6" textAlign="center" color="text.secondary">
                We're targeting a growing global market with a particular focus on the MENA region's unique career development needs.
              </Typography>
            </Box>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Market Statistics
                  </Typography>
                  
                  <List sx={{ flexGrow: 1 }}>
                    {marketStats.map((stat, index) => (
                      <ListItem key={index} sx={{ px: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Business color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="body1">
                                {stat.label}
                              </Typography>
                              <Typography variant="h6" color="primary" fontWeight={600}>
                                {stat.value}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="success.main" align="right">
                              {stat.growth}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box 
                    sx={{ 
                      mt: 3, 
                      p: 2, 
                      bgcolor: 'background.paper', 
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                      Key Trends Driving Growth
                    </Typography>
                    
                    <Grid container spacing={1}>
                      {[
                        "Rapid job market digitization (+35% YoY)",
                        "Remote work paradigm shift",
                        "Skills-based hiring movement",
                        "Rising demand for personalized career guidance",
                        "AI adoption in HR tech (+47% YoY)"
                      ].map((trend, index) => (
                        <Grid item xs={12} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TrendingUp color="success" fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="body2">{trend}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Target Segments
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    {[
                      { 
                        name: 'Early Career Professionals', 
                        percentage: 45,
                        description: 'Age 22-30, seeking career direction and skill development',
                        color: theme.palette.primary.main
                      },
                      { 
                        name: 'Mid-Career Switchers', 
                        percentage: 30,
                        description: 'Age 30-45, looking to transition roles or industries',
                        color: theme.palette.secondary.main
                      },
                      { 
                        name: 'Recent Graduates', 
                        percentage: 20,
                        description: 'New to the workforce, building first professional resume',
                        color: theme.palette.success.main
                      },
                      { 
                        name: 'Executive Level', 
                        percentage: 5,
                        description: 'Senior professionals optimizing leadership presence',
                        color: theme.palette.warning.main
                      }
                    ].map((segment, index) => (
                      <Grid item xs={12} key={index}>
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight={500}>
                              {segment.name}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={600} color={segment.color}>
                              {segment.percentage}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={segment.percentage} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              my: 1,
                              bgcolor: `${segment.color}20`,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: segment.color
                              }
                            }} 
                          />
                          <Typography variant="body2" color="text.secondary">
                            {segment.description}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Regional Focus
                  </Typography>
                  
                  <Box 
                    component="img"
                    src="/images/pitch/mena-map.png"
                    alt="MENA Region Focus"
                    sx={{ 
                      width: '100%', 
                      height: 'auto', 
                      mb: 2,
                      borderRadius: 2
                    }}
                  />
                  
                  <Typography variant="body2" paragraph>
                    Our initial focus is on the MENA region's unique career landscape, with planned expansion to global markets in Phase 4.
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    mt: 3
                  }}
                >
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Competitive Advantages
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    {competitiveAdvantages.map((advantage, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            height: '100%',
                            borderRadius: 2,
                            '&:hover': {
                              boxShadow: 2,
                              borderColor: 'primary.main'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CheckCircle color="success" fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" fontWeight={600}>
                              {advantage.advantage}
                            </Typography>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary">
                            {advantage.description}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
        
        {/* Business Model Section */}
        <Box
          ref={sectionRefs.current[6]}
          sx={{
            minHeight: '100vh',
            py: 8,
            px: 2,
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="overline" color="primary" fontWeight={500} textAlign="center">
              BUSINESS MODEL
            </Typography>
            <Typography variant="h3" component="h2" gutterBottom fontWeight={700} textAlign="center">
              Clear Path to Profitability
            </Typography>
            
            <Box sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}>
              <Typography variant="h6" textAlign="center" color="text.secondary">
                Our multi-tiered revenue model combines freemium user acquisition with premium subscriptions and enterprise solutions.
              </Typography>
            </Box>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    height: '100%'
                  }}
                >
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Revenue Streams
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    {[
                      {
                        name: 'Individual Subscriptions',
                        description: 'Monthly and annual premium plans for job seekers',
                        percentage: 65,
                        icon: <Person color="primary" />,
                        details: [
                          'Basic (Free): Limited features, ad-supported',
                          'Pro ($12.99/mo): Full career toolkit access',
                          'Premium ($24.99/mo): Advanced analytics + coaching'
                        ]
                      },
                      {
                        name: 'Enterprise Solutions',
                        description: 'Custom tools for corporate HR and recruitment teams',
                        percentage: 25,
                        icon: <Business color="secondary" />,
                        details: [
                          'Recruitment optimization suite',
                          'Internal mobility and talent development',
                          'Custom analytics dashboards'
                        ]
                      },
                      {
                        name: 'Educational Partnerships',
                        description: 'Customized platforms for universities and training programs',
                        percentage: 7,
                        icon: <School color="success" />,
                        details: [
                          'Career center augmentation tools',
                          'Student success tracking',
                          'Alumni engagement solutions'
                        ]
                      },
                      {
                        name: 'API & Data Services',
                        description: 'Developer access to our job data and AI capabilities',
                        percentage: 3,
                        icon: <Code color="info" />,
                        details: [
                          'Resume parsing API',
                          'Job market analytics',
                          'Skill taxonomy data'
                        ]
                      }
                    ].map((stream, index) => (
                      <Grid item xs={12} key={index}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            gap: 2
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: theme.palette.background.default,
                              borderRadius: '50%',
                              width: 60,
                              height: 60,
                              flexShrink: 0
                            }}
                          >
                            {stream.icon}
                          </Box>
                          
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                              <Typography variant="h6" fontWeight={600} sx={{ mr: 2 }}>
                                {stream.name}
                              </Typography>
                              <Chip 
                                label={`${stream.percentage}%`}
                                size="small"
                                color="primary"
                              />
                            </Box>
                            
                            <Typography variant="body2" paragraph>
                              {stream.description}
                            </Typography>
                            
                            <Box sx={{ mt: 1 }}>
                              {stream.details.map((detail, dIndex) => (
                                <Typography 
                                  key={dIndex} 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    mb: 0.5
                                  }}
                                >
                                  <ArrowForward fontSize="small" sx={{ mr: 1, color: 'text.disabled', fontSize: 14 }} />
                                  {detail}
                                </Typography>
                              ))}
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    mb: 3
                  }}
                >
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Financial Projections
                  </Typography>
                  
                  <Box 
                    component="img"
                    src="/images/pitch/revenue-chart.png"
                    alt="Revenue Projections"
                    sx={{ 
                      width: '100%', 
                      height: 'auto', 
                      mb: 3,
                      borderRadius: 2
                    }}
                  />
                  
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell align="right">Year 1</TableCell>
                        <TableCell align="right">Year 2</TableCell>
                        <TableCell align="right">Year 3</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[
                        { label: 'Revenue', y1: '$1.2M', y2: '$3.8M', y3: '$8.5M' },
                        { label: 'Gross Margin', y1: '68%', y2: '72%', y3: '75%' },
                        { label: 'Active Users', y1: '45K', y2: '120K', y3: '280K' },
                        { label: 'CAC', y1: '$28', y2: '$24', y3: '$21' },
                        { label: 'LTV', y1: '$95', y2: '$120', y3: '$145' }
                      ].map((row, index) => (
                        <TableRow key={index}>
                          <TableCell component="th" scope="row">
                            {row.label}
                          </TableCell>
                          <TableCell align="right">{row.y1}</TableCell>
                          <TableCell align="right">{row.y2}</TableCell>
                          <TableCell align="right">{row.y3}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
                
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 3
                  }}
                >
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Key Metrics
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {[
                      { label: 'Customer LTV/CAC', value: '4.8x', target: '3x+', status: 'above' },
                      { label: 'Monthly Active Users', value: '32K', target: '30K', status: 'above' },
                      { label: 'Conversion Rate', value: '7.2%', target: '8%', status: 'below' },
                      { label: 'Retention (90-day)', value: '68%', target: '65%', status: 'above' }
                    ].map((metric, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            borderRadius: 2,
                            border: 1,
                            borderColor: 'divider',
                            height: '100%'
                          }}
                        >
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            {metric.label}
                          </Typography>
                          
                          <Typography variant="h4" fontWeight={700}>
                            {metric.value}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            {metric.status === 'above' ? (
                              <TrendingUp fontSize="small" color="success" sx={{ mr: 0.5 }} />
                            ) : (
                              <TrendingDown fontSize="small" color="error" sx={{ mr: 0.5 }} />
                            )}
                            <Typography 
                              variant="caption"
                              color={metric.status === 'above' ? 'success.main' : 'error.main'}
                            >
                              vs {metric.target} Target
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
        
        {/* Roadmap Section */}
        <Box
          ref={sectionRefs.current[7]}
          sx={{
            minHeight: '100vh',
            py: 8,
            px: 2,
            background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.main}15 100%)`,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="overline" color="primary" fontWeight={500} textAlign="center">
              EXECUTION PLAN
            </Typography>
            <Typography variant="h3" component="h2" gutterBottom fontWeight={700} textAlign="center">
              Product Roadmap
            </Typography>
            
            <Box sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}>
              <Typography variant="h6" textAlign="center" color="text.secondary">
                Our strategic development plan and upcoming milestones
              </Typography>
            </Box>
            
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              <Stepper 
                orientation="vertical" 
                activeStep={-1} 
                connector={<span/>}
                sx={{ 
                  '& .MuiStepLabel-iconContainer': {
                    pr: 3,
                  }
                }}
              >
                {roadmapItems.map((item, index) => (
                  <Step key={index} expanded>
                    <StepLabel
                      StepIconComponent={() => (
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: item.status === 'Completed' ? 'success.main' : 
                                    item.status === 'In Progress' ? 'warning.main' : 
                                    'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: 1
                          }}
                        >
                          {item.status === 'Completed' ? (
                            <CheckCircle />
                          ) : (
                            <Timeline />
                          )}
                        </Box>
                      )}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="h6" component="span">
                          {item.phase}
                        </Typography>
                        <Chip 
                          label={item.timeline}
                          size="small" 
                          color={item.status === 'Completed' ? 'success' : 'primary'}
                          sx={{ ml: 1 }}
                        />
                        <Chip 
                          label={item.status}
                          size="small" 
                          color={
                            item.status === 'Completed' ? 'success' : 
                            item.status === 'In Progress' ? 'warning' : 
                            'default'
                          }
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Box
                        sx={{
                          ml: 1.5,
                          pl: 2.5,
                          borderLeft: `2px solid ${
                            item.status === 'Completed' ? theme.palette.success.main : 
                            item.status === 'In Progress' ? theme.palette.warning.main : 
                            theme.palette.primary.main
                          }`,
                        }}
                      >
                        <List dense>
                          {item.items.map((milestone, mIndex) => (
                            <ListItem key={mIndex} sx={{ px: 0 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckCircle 
                                  fontSize="small" 
                                  color={item.status === 'Completed' ? 'success' : 'action'}
                                />
                              </ListItemIcon>
                              <ListItemText primary={milestone} />
                            </ListItem>
                          ))}
                        </List>
                        
                        {item.kpis && (
                          <Box sx={{ mt: 2, ml: 4 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Target KPIs:
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {item.kpis.map((kpi, kIndex) => (
                                <Chip 
                                  key={kIndex}
                                  label={kpi}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
              
              <Box sx={{ mt: 6, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  Strategic Goals for Next 12 Months
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {[
                    { goal: "Reach 100K Active Users", progress: 45 },
                    { goal: "Launch Enterprise Solutions", progress: 20 },
                    { goal: "Expand to 5 New Markets", progress: 30 },
                    { goal: "Release Mobile Application", progress: 70 }
                  ].map((goal, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2,
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          {goal.goal}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={goal.progress}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Box sx={{ minWidth: 35 }}>
                            <Typography variant="body2" color="text.secondary">
                              {`${Math.round(goal.progress)}%`}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Box>
          </Container>
        </Box>
        
        {/* Team Section */}
        <Box
          ref={sectionRefs.current[8]}
          sx={{
            minHeight: '100vh',
            py: 8,
            px: 2,
            background: theme.palette.background.default,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="overline" color="primary" fontWeight={500} textAlign="center">
              OUR TEAM
            </Typography>
            <Typography variant="h3" component="h2" gutterBottom fontWeight={700} textAlign="center">
              Meet the Founders
            </Typography>
            
            <Box sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}>
              <Typography variant="h6" textAlign="center" color="text.secondary">
                A diverse team of experts with a passion for transforming career development
              </Typography>
            </Box>
            
            <Grid container spacing={4}>
              {teamMembers.map((member, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card 
                    elevation={4}
                    sx={{ 
                      borderRadius: 3,
                      overflow: 'hidden',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-8px)'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="240"
                      image={member.avatar || '/images/team/placeholder.jpg'}
                      alt={member.name}
                    />
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {member.name}
                      </Typography>
                      
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        {member.title}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {member.bio}
                      </Typography>
                    </CardContent>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
                      {member.social.linkedin && (
                        <IconButton color="primary" href={member.social.linkedin} target="_blank">
                          <LinkedIn />
                        </IconButton>
                      )}
                      {member.social.github && (
                        <IconButton color="primary" href={member.social.github} target="_blank">
                          <GitHub />
                        </IconButton>
                      )}
                      {member.social.twitter && (
                        <IconButton color="primary" href={member.social.twitter} target="_blank">
                          <Language />
                        </IconButton>
                      )}
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ mt: 8 }}>
              <Paper 
                elevation={3}
                sx={{ 
                  p: 4, 
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                }}
              >
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      Our Advisors & Partners
                    </Typography>
                    
                    <Typography variant="body1" paragraph>
                      We're backed by industry leaders and experts who provide strategic guidance and domain expertise.
                    </Typography>
                    
                    <List>
                      {[
                        {
                          name: "Dr. Fatima Al-Mazrouei",
                          title: "Former HR Director, Microsoft MENA",
                          details: "25+ years of HR leadership experience in tech"
                        },
                        {
                          name: "Prof. James Chen",
                          title: "AI Ethics Researcher, Stanford University",
                          details: "Leading research on responsible AI in career tech"
                        },
                        {
                          name: "Khalid Al-Otaibi",
                          title: "Partner, MENA Ventures",
                          details: "Invested in 30+ successful tech startups"
                        }
                      ].map((advisor, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Person color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={advisor.name}
                            secondary={
                              <>
                                <Typography variant="body2" component="span" color="primary">
                                  {advisor.title}
                                </Typography>
                                <br />
                                <Typography variant="caption" component="span">
                                  {advisor.details}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Our Partners
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
                      {[1, 2, 3, 4, 5, 6].map((partner) => (
                        <Box
                          key={partner}
                          component="img"
                          src={`/images/partners/partner-${partner}.png`}
                          alt={`Partner ${partner}`}
                          sx={{
                            height: 40,
                            filter: 'grayscale(100%)',
                            opacity: 0.7,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              filter: 'grayscale(0%)',
                              opacity: 1
                            }
                          }}
                        />
                      ))}
                    </Box>
                    
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Backed By
                      </Typography>
                      
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <Typography variant="h5" gutterBottom color="primary" fontWeight={600}>
                          $2.4M Seed Funding
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mt: 2 }}>
                          {[
                            "MENA Ventures",
                            "Future of Work Fund",
                            "Tech Pioneers VC",
                            "Angel Investors"
                          ].map((investor, index) => (
                            <Chip 
                              key={index}
                              label={investor}
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Paper>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Container>
        </Box>
        
        {/* Next Steps Section */}
        <Box
          ref={sectionRefs.current[9]}
          sx={{
            minHeight: '80vh',
            py: 8,
            px: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.background.default} 100%)`,
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="overline" color="primary" fontWeight={500} textAlign="center">
              THE FUTURE
            </Typography>
            <Typography variant="h3" component="h2" gutterBottom fontWeight={700} textAlign="center">
              Next Steps
            </Typography>
            
            <Box sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}>
              <Typography variant="h6" textAlign="center" color="text.secondary">
                Our journey is just beginning, and we're excited about the road ahead
              </Typography>
            </Box>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3}
                  sx={{ 
                    p: 4, 
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Investment & Growth
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    We're raising a Series A round to accelerate our growth and expand our impact:
                  </Typography>
                  
                  <List sx={{ flexGrow: 1 }}>
                    {[
                      {
                        text: "Expand team with key engineering and AI talent",
                        icon: <Group color="primary" />
                      },
                      {
                        text: "Scale operations across MENA region and beyond",
                        icon: <Public color="primary" />
                      },
                      {
                        text: "Enhance AI capabilities with proprietary datasets",
                        icon: <Psychology color="primary" />
                      },
                      {
                        text: "Launch enterprise solutions for organizations",
                        icon: <Business color="primary" />
                      },
                      {
                        text: "Develop strategic partnerships with educational institutions",
                        icon: <School color="primary" />
                      }
                    ].map((item, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ mt: 4, alignSelf: 'flex-start' }}
                    onClick={() => setContactOpen(true)}
                  >
                    Connect With Us
                  </Button>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3}
                  sx={{ 
                    p: 4, 
                    borderRadius: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Vision for Impact
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    TamkeenAI isn't just building career tools. We're transforming how people develop professionally:
                  </Typography>
                  
                  <Box sx={{ my: 3, px: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontStyle: 'italic', 
                        color: 'text.secondary',
                        position: 'relative',
                        pl: 3,
                        '&:before': {
                          content: '"""',
                          position: 'absolute',
                          left: 0,
                          top: -10,
                          fontSize: '3rem',
                          color: theme.palette.primary.main,
                          opacity: 0.3
                        }
                      }}
                    >
                      Our mission is to empower 10 million professionals across the MENA region to 
                      reach their full career potential by 2026, addressing regional unemployment 
                      and skills gaps.
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, flexGrow: 1 }}>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        mb: 3,
                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Social Impact Goals
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {[
                          "Reduce youth unemployment by 5% in target markets",
                          "Close the technical skills gap for 200,000+ professionals",
                          "Support 50,000+ career transitions for women returning to workforce",
                          "Provide free resources to 100,000 underserved users"
                        ].map((goal, index) => (
                          <Grid item xs={12} key={index}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <CheckCircle color="success" fontSize="small" sx={{ mt: 0.5, mr: 1 }} />
                              <Typography variant="body2">{goal}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Box>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate('/about')}
                    sx={{ mt: 2, alignSelf: 'flex-start' }}
                  >
                    Learn About Our Mission
                  </Button>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    mt: 4, 
                    p: 4, 
                    borderRadius: 3, 
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Join Us in Transforming Careers
                  </Typography>
                  
                  <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                    Experience TamkeenAI's cutting-edge career platform and see the future of professional development
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      color="secondary"
                      size="large"
                      startIcon={<PlayArrow />}
                      onClick={() => setShowDemoDialog(true)}
                    >
                      Watch Demo
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      sx={{ 
                        color: 'white', 
                        borderColor: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                      size="large"
                      onClick={() => navigate('/signup')}
                    >
                      Try the Platform
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
      
      {/* Navigation Sidebar */}
      {!isSmallScreen && (
        <Box
          sx={{
            position: 'fixed',
            right: 30,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
            zIndex: 100
          }}
        >
          {sections.map((section, index) => (
            <Tooltip 
              key={index} 
              title={section.label} 
              placement="left"
              enterDelay={300}
            >
              <IconButton
                color={activeStep === index ? 'primary' : 'default'}
                onClick={() => {
                  setActiveStep(index);
                  sectionRefs.current[index].scrollIntoView({ behavior: 'smooth' });
                }}
                sx={{
                  bgcolor: activeStep === index ? `${theme.palette.primary.main}20` : 'background.paper',
                  boxShadow: 1,
                  '&:hover': {
                    bgcolor: activeStep === index ? `${theme.palette.primary.main}30` : `${theme.palette.action.hover}`
                  }
                }}
              >
                {section.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      )}
      
      {/* Mobile Navigation */}
      {isSmallScreen && (
        <MobileStepper
          steps={sections.length}
          position="static"
          activeStep={activeStep}
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            width: '100%', 
            borderTop: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper',
            zIndex: 100
          }}
          nextButton={
            <Button 
              size="small" 
              onClick={() => {
                const nextStep = Math.min(activeStep + 1, sections.length - 1);
                setActiveStep(nextStep);
                sectionRefs.current[nextStep].scrollIntoView({ behavior: 'smooth' });
              }}
              disabled={activeStep === sections.length - 1}
            >
              {sections[Math.min(activeStep + 1, sections.length - 1)]?.label}
              <KeyboardArrowRight />
            </Button>
          }
          backButton={
            <Button 
              size="small" 
              onClick={() => {
                const prevStep = Math.max(activeStep - 1, 0);
                setActiveStep(prevStep);
                sectionRefs.current[prevStep].scrollIntoView({ behavior: 'smooth' });
              }}
              disabled={activeStep === 0}
            >
              <KeyboardArrowLeft />
              {sections[Math.max(activeStep - 1, 0)]?.label}
            </Button>
          }
        />
      )}
      
      {/* Auto Scroll Button */}
      <Box
        sx={{
          position: 'fixed',
          bottom: isSmallScreen ? 80 : 40,
          right: 40,
          zIndex: 100
        }}
      >
        <Tooltip title={isAutoScrolling ? "Pause Presentation" : "Auto Play Presentation"}>
          <IconButton
            color={isAutoScrolling ? "secondary" : "primary"}
            onClick={toggleAutoScroll}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 3,
              width: 56,
              height: 56
            }}
          >
            {isAutoScrolling ? (
              <CircularProgress 
                variant="determinate" 
                value={autoScrollProgress} 
                size={48} 
                thickness={4} 
              />
            ) : (
              <PlayArrow fontSize="large" />
            )}
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Demo Dialog */}
      <Dialog
        open={showDemoDialog}
        onClose={() => setShowDemoDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            TamkeenAI Demo
            <IconButton onClick={() => setShowDemoDialog(false)}>
              <KeyboardArrowUp />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {!videoReady && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
              <CircularProgress size={60} thickness={5} />
              <Typography variant="h6" sx={{ mt: 3 }}>
                Loading Demo...
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: videoReady ? 'block' : 'none' }}>
            <DemoVideo onReady={() => setVideoReady(true)} />
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Feature Details Dialog */}
      <Dialog
        open={expandedFeature !== null}
        onClose={() => setExpandedFeature(null)}
        maxWidth="md"
        fullWidth
      >
        {expandedFeature && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: expandedFeature.color,
                    mr: 2
                  }}
                >
                  {expandedFeature.icon}
                </Avatar>
                {expandedFeature.title}
              </Box>
            </DialogTitle>
            <DialogContent>
              <FeatureShowcase feature={expandedFeature} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setExpandedFeature(null)}>
                Close
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  setExpandedFeature(null);
                  navigate(`/features/${expandedFeature.id}`);
                }}
              >
                See Full Details
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Contact Dialog */}
      <Dialog
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Connect With Us
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Interested in learning more about TamkeenAI or discussing investment opportunities?
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <Mail color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Email" 
                secondary="team@tamkeen.ai" 
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Person color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Contact" 
                secondary="Sarah Al-Mutairi, Founder & CEO" 
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <LinkedIn color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="LinkedIn" 
                secondary="linkedin.com/company/tamkeen-ai" 
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactOpen(false)}>
            Close
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              window.location.href = 'mailto:team@tamkeen.ai?subject=TamkeenAI%20Inquiry';
              setContactOpen(false);
            }}
          >
            Send Email
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StartupPitch;