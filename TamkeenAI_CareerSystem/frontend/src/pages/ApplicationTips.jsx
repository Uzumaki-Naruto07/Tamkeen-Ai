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

const ApplicationTips = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedSection, setExpandedSection] = useState('resumeTips');

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
      description: 'Customize your resume to highlight skills and experiences relevant to the specific position you\'re applying for.',
      icon: <Assignment color="primary" />,
    },
    {
      id: 2,
      title: 'Use keywords from the job description',
      description: 'Many companies use Applicant Tracking Systems (ATS) to filter resumes. Include relevant keywords from the job posting.',
      icon: <LocalOffer color="primary" />,
    },
    {
      id: 3,
      title: 'Quantify your achievements',
      description: 'Use numbers and metrics to demonstrate your impact (e.g., "Increased sales by 20%" rather than "Increased sales").',
      icon: <TipsAndUpdates color="primary" />,
    },
    {
      id: 4,
      title: 'Keep it concise and relevant',
      description: 'Limit your resume to 1-2 pages, focusing on experiences relevant to the job you\'re applying for.',
      icon: <ArticleOutlined color="primary" />,
    },
    {
      id: 5,
      title: 'Proofread carefully',
      description: 'Eliminate spelling and grammar errors. Ask someone else to review your resume before submitting it.',
      icon: <CheckCircle color="primary" />,
    }
  ];

  const coverLetterTips = [
    {
      id: 1,
      title: 'Address the hiring manager by name',
      description: 'Research the company to find the name of the hiring manager or recruiter. Avoid generic greetings like "To Whom It May Concern."',
      icon: <Description color="primary" />,
    },
    {
      id: 2,
      title: 'Show enthusiasm for the role and company',
      description: 'Explain why you\'re excited about the position and the organization specifically.',
      icon: <Stars color="primary" />,
    },
    {
      id: 3,
      title: 'Connect your experience to the job requirements',
      description: 'Highlight 2-3 specific examples from your experience that demonstrate you have the skills they\'re looking for.',
      icon: <Work color="primary" />,
    },
    {
      id: 4,
      title: 'Keep it concise',
      description: 'Your cover letter should be no more than one page with 3-4 paragraphs.',
      icon: <FormatQuote color="primary" />,
    },
    {
      id: 5,
      title: 'End with a call to action',
      description: 'Express interest in an interview and provide your contact information.',
      icon: <RecordVoiceOver color="primary" />,
    }
  ];

  const interviewTips = [
    {
      id: 1,
      title: 'Research the company thoroughly',
      description: 'Learn about the company\'s mission, values, products/services, recent news, and culture before your interview.',
      icon: <Business color="primary" />,
    },
    {
      id: 2,
      title: 'Practice common interview questions',
      description: 'Prepare answers for common questions, especially behavioral questions using the STAR method (Situation, Task, Action, Result).',
      icon: <Psychology color="primary" />,
    },
    {
      id: 3,
      title: 'Prepare questions to ask',
      description: 'Have thoughtful questions ready to ask the interviewer about the role, team, and company.',
      icon: <HelpOutline color="primary" />,
    },
    {
      id: 4,
      title: 'Dress professionally',
      description: 'Dress one level above the company\'s everyday dress code. When in doubt, it\'s better to be overdressed than underdressed.',
      icon: <People color="primary" />,
    },
    {
      id: 5,
      title: 'Follow up after the interview',
      description: 'Send a thank-you email within 24 hours expressing appreciation for the opportunity and reiterating your interest.',
      icon: <CheckCircle color="primary" />,
    }
  ];

  const linkedInTips = [
    {
      id: 1,
      title: 'Optimize your LinkedIn profile',
      description: 'Use a professional photo, write a compelling headline, and craft a detailed summary that highlights your skills and experience.',
      icon: <LinkedIn color="primary" />,
    },
    {
      id: 2,
      title: 'Build your network strategically',
      description: 'Connect with colleagues, classmates, and industry professionals. Include a personalized note when sending connection requests.',
      icon: <People color="primary" />,
    },
    {
      id: 3,
      title: 'Engage with content regularly',
      description: 'Like, comment on, and share relevant industry content. Post your own insights and articles to establish thought leadership.',
      icon: <ArticleOutlined color="primary" />,
    },
    {
      id: 4,
      title: 'Request recommendations',
      description: 'Ask former colleagues, managers, and clients to write recommendations that highlight your specific skills and contributions.',
      icon: <Stars color="primary" />,
    },
    {
      id: 5,
      title: 'Use LinkedIn Learning',
      description: 'Develop new skills and showcase them on your profile using LinkedIn Learning certificates.',
      icon: <School color="primary" />,
    }
  ];

  const renderTips = (tips) => (
    <List>
      {tips.map((tip) => (
        <ListItem key={tip.id} alignItems="flex-start" sx={{ py: 2 }}>
          <ListItemIcon>{tip.icon}</ListItemIcon>
          <ListItemText
            primary={<Typography variant="h6">{tip.title}</Typography>}
            secondary={tip.description}
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
          Application Tips & Best Practices
        </Typography>
        
        <Typography variant="body1" paragraph>
          Boost your chances of landing your dream job with our comprehensive application tips. 
          From crafting the perfect resume to acing your interview, we've got you covered with expert advice 
          for every stage of the application process.
        </Typography>

        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          sx={{ mb: 3 }}
        >
          <Tab label="Resume Tips" icon={<Assignment />} iconPosition="start" />
          <Tab label="Cover Letter" icon={<Description />} iconPosition="start" />
          <Tab label="Interview Prep" icon={<Psychology />} iconPosition="start" />
          <Tab label="LinkedIn Optimization" icon={<LinkedIn />} iconPosition="start" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Craft a Winning Resume
            </Typography>
            <Typography variant="body1" paragraph>
              Your resume is often the first impression you make on potential employers. 
              Make it count with these expert tips for creating a standout resume.
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
                Pro Tip: Use our Resume Builder tool to create a professional, ATS-friendly resume that stands out.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 1 }}
                href="/resumePage"
              >
                Try Resume Builder
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Writing Effective Cover Letters
            </Typography>
            <Typography variant="body1" paragraph>
              A well-crafted cover letter can set you apart from other candidates by showing your passion for the role 
              and explaining why you're the perfect fit.
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
              Interview Preparation
            </Typography>
            <Typography variant="body1" paragraph>
              Interviews are your opportunity to showcase your personality, skills, and fit for the role. 
              Preparation is key to interview success.
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
                Practice makes perfect! Try our AI Interview Coach for personalized interview practice and feedback.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 1 }}
                href="/ai-coach/interview"
              >
                Try Mock Interview
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === 3 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              LinkedIn Optimization
            </Typography>
            <Typography variant="body1" paragraph>
              LinkedIn is an essential tool for professional networking and job searching. 
              Optimize your profile and activity to attract recruiters and opportunities.
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
                Our LinkedIn Automation tool can help you connect with potential employers and build your professional network.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                sx={{ mt: 1 }}
                href="/automation-linkedin"
              >
                Explore LinkedIn Tools
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Additional Resources
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <School color="primary" sx={{ mr: 1, verticalAlign: "middle" }} />
                  Skills Assessment
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Identify your strengths and areas for improvement to focus your job search effectively.
                </Typography>
                <Button variant="outlined" href="/skills-assessment">
                  Take Assessment
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Work color="primary" sx={{ mr: 1, verticalAlign: "middle" }} />
                  Job Search Strategy
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Learn effective strategies for finding and applying to the right opportunities.
                </Typography>
                <Button variant="outlined" href="/job-search">
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <TipsAndUpdates color="primary" sx={{ mr: 1, verticalAlign: "middle" }} />
                  AI Interview Practice
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Practice with our AI-powered interview simulator that provides real-time feedback.
                </Typography>
                <Button variant="outlined" href="/ai-coach/interview">
                  Start Practice
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