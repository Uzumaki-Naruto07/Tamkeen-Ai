import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Card, 
  CardContent,
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Paper, 
  IconButton, 
  Divider, 
  LinearProgress, 
  Chip,
  Avatar,
  Tabs,
  Tab,
  Badge,
  Grid,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Description as DescriptionIcon, 
  Restore as RestoreIcon, 
  Upload as UploadIcon, 
  Timeline as TimelineIcon,
  Edit as EditIcon,
  Analytics as AnalyticsIcon,
  CompareArrows as CompareArrowsIcon,
  Key as KeyIcon,
  Work as WorkIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Lightbulb as LightbulbIcon,
  CloudUpload as CloudUploadIcon,
  BarChart as BarChartIcon,
  Code as CodeIcon,
  TipsAndUpdates as TipsAndUpdatesIcon,
  Attachment as AttachmentIcon,
  SmartToy as SmartToyIcon,
  Psychology as PsychologyIcon,
  FileCopy as FileCopyIcon,
  Description as DescriptionFileIcon,
  ArrowRight as ArrowRightIcon,
  Insights as InsightsIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  AutoAwesomeMotion as AutoAwesomeMotionIcon,
  WorkOutline as WorkOutlineIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AlternateEmail as AlternateEmailIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import resumeApi from '../utils/resumeApi';

// TabPanel component for the tab system
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`resume-tabpanel-${index}`}
      aria-labelledby={`resume-tab-${index}`}
      style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Mock components for each tab
const ResumeBuilder = () => {
  const [showTips, setShowTips] = useState(true);
  
  return (
    <Box sx={{ position: 'relative' }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <TextField 
            label="Resume Title" 
            variant="outlined" 
            sx={{ flexGrow: 1, mr: 2 }}
            defaultValue="Software Engineer Resume"
          />
          <Button
            variant="outlined"
            color="success"
            size="small"
            startIcon={<TipsAndUpdatesIcon />}
            onClick={() => setShowTips(!showTips)}
          >
            {showTips ? "Hide Tips" : "Show Tips"}
          </Button>
        </Box>
        
        {/* Drag and drop sections */}
        {['Personal Information', 'Professional Summary', 'Work Experience', 'Education', 'Skills'].map((section, index) => (
          <Paper 
            key={index} 
            sx={{ 
              p: 2, 
              mb: 2, 
              borderLeft: '4px solid #1976d2',
              cursor: 'move',
              '&:hover': { boxShadow: 3 }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">{section}</Typography>
              <Box>
                <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small"><ArrowRightIcon fontSize="small" /></IconButton>
              </Box>
            </Box>
            
            <TextField 
              variant="outlined" 
              fullWidth 
              multiline 
              rows={2}
              placeholder={`Enter your ${section.toLowerCase()}`}
              size="small"
            />
            
            {/* Inline feedback */}
            {index === 1 && (
              <Box sx={{ 
                mt: 1, 
                p: 1, 
                bgcolor: '#fff9c4', 
                borderRadius: 1, 
                fontSize: '0.8rem' 
              }}>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                  <LightbulbIcon fontSize="small" sx={{ mr: 0.5, color: '#f57c00' }} />
                  Consider using more action verbs in your professional summary
                </Typography>
              </Box>
            )}
          </Paper>
        ))}
      </Paper>
      
      {/* Side popover: Tips from AI */}
      {showTips && (
        <Paper sx={{ 
          position: { xs: 'static', md: 'absolute' },
          right: { xs: 0, md: -300 },
          top: 0, 
          width: { xs: '100%', md: 280 },
          mt: { xs: 2, md: 0 },
          p: 2,
          boxShadow: 3,
          borderLeft: '4px solid #4caf50',
          zIndex: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TipsAndUpdatesIcon sx={{ mr: 1, color: '#4caf50' }} />
            <Typography variant="subtitle1" fontWeight="bold">Tips from AI</Typography>
            <IconButton 
              size="small" 
              sx={{ ml: 'auto' }} 
              onClick={() => setShowTips(false)}
            >
              <CancelIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <List disablePadding>
            {[
              'Add specific metrics to your accomplishments',
              'Consider including relevant certifications',
              'Tailor your skills section to the job description',
              'Use more quantifiable achievements'
            ].map((tip, i) => (
              <ListItem key={i} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <LightbulbIcon fontSize="small" sx={{ color: '#4caf50' }} />
                </ListItemIcon>
                <ListItemText primary={tip} primaryTypographyProps={{ fontSize: '0.9rem' }} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

const ResumeAnalysis = () => (
  <Box>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ATS Match</Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
            <CircularProgress variant="determinate" value={78} size={120} color="success" thickness={5} />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h4" component="div" color="text.secondary">78%</Typography>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Your resume is ATS-friendly but could be improved
          </Typography>
        </Paper>
      </Grid>
      
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>AI Feedback</Typography>
          
          {['Add more keywords related to your industry', 'Improve formatting for better readability', 'Quantify your achievements'].map((feedback, i) => (
            <Box key={i} sx={{ 
              p: 1.5, 
              mb: 1, 
              bgcolor: i === 0 ? '#ffebee' : i === 1 ? '#fff8e1' : '#e8f5e9',
              borderRadius: 1
            }}>
              <Typography variant="body2">{feedback}</Typography>
            </Box>
          ))}
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Skill Gap Analysis</Typography>
          
          <Grid container spacing={2}>
            {['Python', 'React', 'Node.js', 'AWS', 'Machine Learning'].map((skill, i) => (
              <Grid item xs={6} md={4} key={i}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>{skill}</Typography>
                  {i < 3 ? 
                    <Chip size="small" label="Present" color="success" /> : 
                    <Chip size="small" label="Missing" color="error" />
                  }
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={i < 3 ? 90 - (i * 20) : 0} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color={i < 3 ? "success" : "error"}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
      
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">Resume Score History</Typography>
            <Button variant="contained" startIcon={<CheckCircleIcon />}>
              Apply All Suggestions
            </Button>
          </Box>
          
          {/* Placeholder for chart */}
          <Box 
            sx={{ 
              height: 200, 
              bgcolor: '#f5f5f5', 
              borderRadius: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Resume Score Chart (Trend visualization)
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

// Enhanced ResumeAnalysis component with DeepSeek AI Integration
const ResumeAnalysisAI = ({ selectedResume }) => {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState({
    title: "Software Engineer",
    description: "We're hiring a Software Engineer to develop high-quality applications. Requirements: Bachelor's degree in Computer Science or related field. 2+ years experience in software development. Proficiency in Java, Python, or C++. Experience with web frameworks and version control systems. Strong problem-solving skills."
  });
  const [sampleJobs, setSampleJobs] = useState([]);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Fetch sample jobs
  useEffect(() => {
    const fetchSampleJobs = async () => {
      try {
        const response = await resumeApi.getSampleJobs();
        if (response && response.data && response.data.jobs) {
          setSampleJobs(response.data.jobs);
          // Optionally set the first job as default
          if (response.data.jobs.length > 0) {
            setSelectedJob(response.data.jobs[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching sample jobs:", error);
      }
    };

    fetchSampleJobs();
  }, []);

  const handleAnalyzeResume = async (resumeId) => {
    if (!resumeId) return;
    
    setIsLoading(true);
    try {
      // Check if we should use mock data
      const useMockData = typeof window !== 'undefined' && localStorage.getItem('backend-unavailable') === 'true';
      
      if (useMockData) {
        // Skip file fetching in mock mode and use mock data directly
        console.log("Using mock data for resume analysis");
        setTimeout(() => {
          setAiAnalysis({
            score: 75,
            job_title: selectedJob.title,
            matching_keywords: ["JavaScript", "React", "API", "frontend", "development"],
            missing_keywords: ["TypeScript", "Node.js", "AWS", "CI/CD", "Docker"],
            assessment: "Good. Your resume matches the job requirements reasonably well.",
            llm_analysis: "## STRENGTHS 🟢\n\n1. Strong frontend experience with React.js\n2. Demonstrated ability to build responsive web applications\n3. Experience with RESTful API integration\n4. Excellent communication skills\n5. Team collaboration experience\n\n## WEAKNESSES 🔴\n\n1. Limited backend experience\n2. No mention of cloud technologies\n3. Missing containerization skills\n4. Limited testing methodology experience\n5. Could improve quantifiable achievements\n\n## RECOMMENDATIONS 🚀\n\n- Add specific metrics to your accomplishments\n- Highlight any Node.js experience you may have\n- Consider gaining experience with AWS or similar cloud platforms\n- Include information about testing methodologies you've used",
            improvement_roadmap: "# CAREER DEVELOPMENT ROADMAP\n\n## SKILL GAP ANALYSIS\n\n1. Cloud Technologies (AWS, Azure, GCP)\n2. Backend Development (Node.js, Python)\n3. Containerization (Docker, Kubernetes)\n4. Testing Frameworks (Jest, Cypress)\n\n## LEARNING PLAN\n\n1. Complete AWS Certified Developer Associate course (3 months)\n2. Build a full-stack application with Node.js backend (2 months)\n3. Learn Docker fundamentals and container orchestration (1 month)\n\n## CAREER POSITIONING\n\nWith these additional skills, you'll be positioned for Senior Developer roles with a full-stack focus."
          });
          setIsLoading(false);
        }, 1500); // Add a short delay to simulate loading
        return;
      }
      
      // For real backend: Get the resume file
      const resumeResponse = await resumeApi.getResumeById(resumeId);
      if (!resumeResponse || !resumeResponse.data || !resumeResponse.data.file_path) {
        throw new Error("Resume file not found");
      }
      
      const file = await fetch(resumeResponse.data.file_path).then(res => res.blob());
      
      // Analyze with DeepSeek
      const analysisResponse = await resumeApi.analyzeResumeWithDeepSeek(resumeId, {
        file: new File([file], "resume.pdf", { type: "application/pdf" }),
        title: selectedJob.title,
        description: selectedJob.description
      });
      
      if (analysisResponse && analysisResponse.data) {
        setAiAnalysis(analysisResponse.data);
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
      // Use mock data if real analysis fails
      setAiAnalysis({
        score: 75,
        job_title: selectedJob.title,
        matching_keywords: ["JavaScript", "React", "API", "frontend", "development"],
        missing_keywords: ["TypeScript", "Node.js", "AWS", "CI/CD", "Docker"],
        assessment: "Good. Your resume matches the job requirements reasonably well.",
        llm_analysis: "## STRENGTHS 🟢\n\n1. Strong frontend experience with React.js\n2. Demonstrated ability to build responsive web applications\n3. Experience with RESTful API integration\n4. Excellent communication skills\n5. Team collaboration experience\n\n## WEAKNESSES 🔴\n\n1. Limited backend experience\n2. No mention of cloud technologies\n3. Missing containerization skills\n4. Limited testing methodology experience\n5. Could improve quantifiable achievements\n\n## RECOMMENDATIONS 🚀\n\n- Add specific metrics to your accomplishments\n- Highlight any Node.js experience you may have\n- Consider gaining experience with AWS or similar cloud platforms\n- Include information about testing methodologies you've used",
        improvement_roadmap: "# CAREER DEVELOPMENT ROADMAP\n\n## SKILL GAP ANALYSIS\n\n1. Cloud Technologies (AWS, Azure, GCP)\n2. Backend Development (Node.js, Python)\n3. Containerization (Docker, Kubernetes)\n4. Testing Frameworks (Jest, Cypress)\n\n## LEARNING PLAN\n\n1. Complete AWS Certified Developer Associate course (3 months)\n2. Build a full-stack application with Node.js backend (2 months)\n3. Learn Docker fundamentals and container orchestration (1 month)\n\n## CAREER POSITIONING\n\nWith these additional skills, you'll be positioned for Senior Developer roles with a full-stack focus."
      });
    } finally {
      if (typeof window !== 'undefined' && localStorage.getItem('backend-unavailable') !== 'true') {
        setIsLoading(false);
      }
    }
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setJobDialogOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Render Markdown content
  const renderMarkdown = (content) => {
    if (!content) return null;
    
    // Simple Markdown parsing for different headers and lists
    return content.split('\n').map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return <Typography key={index} variant="h5" sx={{ mt: 3, mb: 1, fontWeight: 'bold' }}>{line.substring(2)}</Typography>;
      } else if (line.startsWith('## ')) {
        return <Typography key={index} variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: 'primary.main' }}>{line.substring(3)}</Typography>;
      } else if (line.startsWith('### ')) {
        return <Typography key={index} variant="subtitle1" sx={{ mt: 1.5, mb: 0.5, fontWeight: 'bold' }}>{line.substring(4)}</Typography>;
      } 
      // Lists
      else if (line.match(/^\d+\./)) {
        return <Typography key={index} variant="body1" sx={{ display: 'flex', alignItems: 'baseline', my: 0.5 }}>
          <Box component="span" sx={{ mr: 1, fontWeight: 'bold' }}>{line.match(/^\d+\./)[0]}</Box>
          <Box component="span">{line.substring(line.indexOf('.') + 1)}</Box>
        </Typography>;
      } else if (line.match(/^- /)) {
        return <Typography key={index} variant="body1" sx={{ display: 'flex', alignItems: 'center', my: 0.5 }}>
          <Box component="span" sx={{ mr: 1, lineHeight: 0 }}>•</Box>
          <Box component="span">{line.substring(2)}</Box>
        </Typography>;
      } 
      // Regular text with emoji handling
      else {
        // Highlight emojis
        const hasEmoji = line.match(/[^\u0000-\u007F]+/);
        if (hasEmoji) {
          return <Typography key={index} variant="body1" sx={{ my: 0.5 }}>
            {line.split(/([^\u0000-\u007F]+)/).map((part, i) => 
              /[^\u0000-\u007F]+/.test(part) ? 
                <Box component="span" key={i} sx={{ color: 'primary.main', fontSize: '1.2em' }}>{part}</Box> : 
                part
            )}
          </Typography>;
        }
        return <Typography key={index} variant="body1" sx={{ my: 0.5 }}>{line}</Typography>;
      }
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Job Selection and Analysis Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">Analyzing For:</Typography>
              <Chip 
                label={selectedJob.title}
                color="primary"
                sx={{ fontWeight: 'medium' }}
                onClick={() => setJobDialogOpen(true)}
              />
              
              <Box sx={{ flexGrow: 1 }} />
              
              <Button 
                variant="contained" 
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AnalyticsIcon />}
                onClick={() => handleAnalyzeResume(selectedResume ? selectedResume.id : 'mock-resume-id')}
                disabled={isLoading}
              >
                {isLoading ? 'Analyzing...' : 'Analyze with AI'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Main Analysis Content */}
        {isLoading ? (
          <Grid item xs={12} sx={{ textAlign: 'center', py: 8 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Analyzing your resume with DeepSeek AI...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This may take a minute as we perform a comprehensive analysis
            </Typography>
          </Grid>
        ) : aiAnalysis ? (
          <>
            {/* Overall Score */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>ATS Score</Typography>
                  <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={aiAnalysis.score} 
                      size={160} 
                      color={getScoreColor(aiAnalysis.score)} 
                      thickness={6} 
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h3" component="div" color="text.secondary">
                        {Math.round(aiAnalysis.score)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" fontWeight="medium" textAlign="center" color={`${getScoreColor(aiAnalysis.score)}.main`}>
                    {aiAnalysis.assessment}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            {/* Keywords Analysis */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Keywords Analysis</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" fontWeight="medium" color="success.main" gutterBottom>
                      Matching Keywords ({aiAnalysis.matching_keywords.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {aiAnalysis.matching_keywords.map((keyword, i) => (
                        <Chip 
                          key={i} 
                          label={keyword} 
                          size="small" 
                          color="success"
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" fontWeight="medium" color="error.main" gutterBottom>
                      Missing Keywords ({aiAnalysis.missing_keywords.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {aiAnalysis.missing_keywords.map((keyword, i) => (
                        <Chip 
                          key={i} 
                          label={keyword} 
                          size="small" 
                          color="error"
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            {/* Detailed Analysis Tabs */}
            <Grid item xs={12}>
              <Paper sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                  >
                    <Tab label="AI Analysis" icon={<SmartToyIcon />} iconPosition="start" />
                    <Tab label="Career Roadmap" icon={<TrendingUpIcon />} iconPosition="start" />
                  </Tabs>
                </Box>
                
                <Box sx={{ p: 3 }}>
                  {activeTab === 0 && (
                    <Box sx={{ 
                      p: 2, 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.paper'
                    }}>
                      {renderMarkdown(aiAnalysis.llm_analysis)}
                    </Box>
                  )}
                  
                  {activeTab === 1 && (
                    <Box sx={{ 
                      p: 2, 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.paper'
                    }}>
                      {renderMarkdown(aiAnalysis.improvement_roadmap)}
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </>
        ) : (
          <Grid item xs={12} sx={{ textAlign: 'center', py: 8 }}>
            <Box sx={{ mb: 3 }}>
              <SmartToyIcon sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                AI Resume Analysis
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                Get detailed feedback on your resume using our DeepSeek AI engine. 
                We'll analyze your resume against job descriptions to identify strengths, 
                weaknesses, and provide a personalized improvement roadmap.
              </Typography>
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<AnalyticsIcon />}
                onClick={() => handleAnalyzeResume(selectedResume ? selectedResume.id : 'mock-resume-id')}
              >
                Analyze with AI
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
      
      {/* Job Selection Dialog */}
      <Dialog 
        open={jobDialogOpen} 
        onClose={() => setJobDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Select a Job for ATS Analysis
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {sampleJobs.length > 0 ? (
              sampleJobs.map((job, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: 3, transform: 'translateY(-4px)' },
                      border: job.title === selectedJob.title ? '2px solid' : '1px solid',
                      borderColor: job.title === selectedJob.title ? 'primary.main' : 'divider',
                    }}
                    onClick={() => handleJobSelect(job)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{job.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        maxHeight: 100, 
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {job.description}
                      </Typography>
                    </CardContent>
                    {job.title === selectedJob.title && (
                      <Box sx={{ bgcolor: 'primary.main', p: 1, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold' }}>
                          Currently Selected
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                  No sample jobs available
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJobDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const JobMatchCalculator = () => (
  <Box>
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>Job Match Analysis</Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CircularProgress variant="determinate" value={65} size={80} color="warning" thickness={5} sx={{ mr: 3 }} />
        <Box>
          <Typography variant="h5" component="div">65% Match</Typography>
          <Typography variant="body2" color="text.secondary">
            For: Senior Software Engineer at TechCorp
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Keywords Match</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {['React', 'TypeScript', 'Node.js'].map((kw) => (
          <Chip key={kw} label={kw} color="success" size="small" icon={<CheckCircleIcon />} />
        ))}
        {['AWS Lambda', 'Docker', 'Kubernetes'].map((kw) => (
          <Chip key={kw} label={kw} color="error" size="small" icon={<CancelIcon />} />
        ))}
      </Box>
      
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Experience Alignment</Typography>
      
      {['Software Development', 'Team Leadership', 'Project Management'].map((exp, i) => (
        <Tooltip 
          key={i} 
          title={i === 2 ? "Improve this section for better match" : ""}
          arrow
        >
          <Paper 
            sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: i === 2 ? '#fff8e1' : '#f5f5f5',
              border: i === 2 ? '1px dashed #ffa000' : 'none'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body1">{exp}</Typography>
              <Chip 
                size="small" 
                label={`${i === 2 ? 40 : 80}%`}
                color={i === 2 ? "warning" : "success"}
              />
            </Box>
          </Paper>
        </Tooltip>
      ))}
    </Paper>
  </Box>
);

const KeywordsExtractor = () => (
  <Box>
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">Keywords Analysis</Typography>
            <Box>
              <Button startIcon={<BarChartIcon />} variant="outlined" sx={{ mr: 1 }}>
                Word Cloud
              </Button>
              <FormControlLabel
                control={<Switch size="small" />}
                label="JSON View"
                labelPlacement="start"
              />
            </Box>
          </Box>
          
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Top Keywords in Your Resume</Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f5f5f5', 
                borderRadius: 1,
                maxHeight: 300,
                overflow: 'auto'
              }}>
                {[
                  { word: 'JavaScript', count: 8, importance: 'high' },
                  { word: 'React', count: 6, importance: 'high' },
                  { word: 'Development', count: 5, importance: 'medium' },
                  { word: 'API', count: 4, importance: 'medium' },
                  { word: 'Team', count: 4, importance: 'low' },
                  { word: 'Software', count: 3, importance: 'medium' },
                  { word: 'Architecture', count: 3, importance: 'high' },
                  { word: 'Database', count: 2, importance: 'medium' },
                  { word: 'Testing', count: 2, importance: 'medium' },
                ].map((kw, i) => (
                  <Chip 
                    key={i}
                    label={`${kw.word} (${kw.count})`}
                    sx={{ 
                      m: 0.5, 
                      bgcolor: kw.importance === 'high' 
                        ? '#e8f5e9' 
                        : kw.importance === 'medium' 
                          ? '#fff8e1' 
                          : '#f5f5f5',
                      border: kw.importance === 'high' 
                        ? '1px solid #4caf50' 
                        : kw.importance === 'medium' 
                          ? '1px solid #ff9800' 
                          : 'none'
                    }}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Industry-Recommended Keywords</Typography>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f5f5f5', 
                borderRadius: 1,
                maxHeight: 300,
                overflow: 'auto'
              }}>
                {[
                  'TypeScript', 'Node.js', 'Redux', 'REST API', 'GraphQL', 
                  'Unit Testing', 'CI/CD', 'AWS', 'Docker', 'Microservices'
                ].map((kw, i) => (
                  <Chip 
                    key={i}
                    label={kw}
                    sx={{ m: 0.5 }}
                    color={i < 4 ? "success" : "default"}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Resume Preview with Highlighted Keywords</Typography>
            <Paper sx={{ p: 2, bgcolor: '#f9f9f9', maxHeight: 200, overflow: 'auto' }}>
              <Typography variant="body2" component="div" sx={{ lineHeight: 1.6 }}>
                Experienced <mark>Software</mark> Engineer with 5+ years in <mark>JavaScript</mark> and <mark>React</mark> <mark>development</mark>. Built scalable <mark>APIs</mark> and led <mark>teams</mark> in delivering high-quality <mark>software</mark> solutions. Designed robust <mark>architecture</mark> for web applications.
                {/* More resume text here */}
              </Typography>
            </Paper>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  </Box>
);

const FeaturedJobs = () => {
  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>Recommended Jobs</Typography>
      
      <Box sx={{ position: 'relative', mt: 2 }}>
        <Grid container spacing={3}>
          {[
            { title: 'Senior React Developer', company: 'TechCorp', location: 'Remote', match: 85 },
            { title: 'Frontend Engineer', company: 'StartupXYZ', location: 'San Francisco', match: 78 },
            { title: 'Full Stack Developer', company: 'Enterprise Inc', location: 'New York', match: 72 },
            { title: 'JavaScript Engineer', company: 'SoftwareAI', location: 'Austin', match: 68 },
            { title: 'React Native Developer', company: 'MobileApps', location: 'Chicago', match: 65 },
            { title: 'UI/UX Developer', company: 'DesignLab', location: 'Boston', match: 60 }
          ].map((job, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ p: 2, flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">{job.title}</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>{job.company} • {job.location}</Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>Match:</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={job.match} 
                      sx={{ height: 8, borderRadius: 4, flexGrow: 1 }}
                      color={job.match > 80 ? "success" : job.match > 70 ? "warning" : "error"}
                    />
                    <Typography variant="body2" sx={{ ml: 1, fontWeight: 'bold' }}>{job.match}%</Typography>
                  </Box>
                  
                  <Button 
                    variant="contained" 
                    size="small" 
                    fullWidth 
                    sx={{ mt: 1 }}
                  >
                    Apply with Resume
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Job Details</Typography>
        <Typography variant="body2" paragraph>Select a job to view details and customize your resume before applying.</Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<DescriptionFileIcon />}
            size="small"
          >
            View Job Description
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<CompareArrowsIcon />}
            size="small"
          >
            Compare with Resume
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

const FeaturesPanel = () => (
  <Box>
    <Typography variant="h6" fontWeight="bold" gutterBottom>Advanced Features</Typography>
    
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AttachmentIcon sx={{ mr: 1, color: '#1976d2' }} />
            <Typography variant="subtitle1" fontWeight="bold">Resume Version Control</Typography>
          </Box>
          <Typography variant="body2" paragraph>
            Access complete version history, restore previous versions, and track improvements over time.
          </Typography>
          <Button size="small" variant="outlined">Manage Versions</Button>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SmartToyIcon sx={{ mr: 1, color: '#7b1fa2' }} />
            <Typography variant="subtitle1" fontWeight="bold">AI Feedback System</Typography>
          </Box>
          <Typography variant="body2" paragraph>
            Receive detailed AI-powered suggestions for improving your resume's effectiveness.
          </Typography>
          <Button size="small" variant="outlined">Get AI Feedback</Button>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PsychologyIcon sx={{ mr: 1, color: '#ff9800' }} />
            <Typography variant="subtitle1" fontWeight="bold">Job-Specific Customization</Typography>
          </Box>
          <Typography variant="body2" paragraph>
            Automatically tailor your resume for specific job descriptions to maximize match rate.
          </Typography>
          <Button size="small" variant="outlined">Customize Resume</Button>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FileCopyIcon sx={{ mr: 1, color: '#388e3c' }} />
            <Typography variant="subtitle1" fontWeight="bold">Enhanced Export Options</Typography>
          </Box>
          <Typography variant="body2" paragraph>
            Export your resume in multiple formats including PDF, DOCX, plain text, and ATS-friendly versions.
          </Typography>
          <Button size="small" variant="outlined">Export Options</Button>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <DescriptionFileIcon sx={{ mr: 1, color: '#e91e63' }} />
            <Typography variant="subtitle1" fontWeight="bold">AI Cover Letter Generator</Typography>
          </Box>
          <Typography variant="body2" paragraph>
            Automatically generate tailored cover letters based on your resume and job descriptions.
          </Typography>
          <Button size="small" variant="contained">Generate Cover Letter</Button>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

const ResumePage = () => {
  const [newResumeDialogOpen, setNewResumeDialogOpen] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [resumeMetrics, setResumeMetrics] = useState({
    strength: 75,
    history: []
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  
  // Current user ID - normally from auth context
  const userId = "current-user-id"; // Replace with actual user ID from auth context

  // Initialize mock data for testing when backend is unavailable
  useEffect(() => {
    const isMockMode = typeof window !== 'undefined' && localStorage.getItem('backend-unavailable') === 'true';
    
    if (isMockMode && (!resumes || resumes.length === 0)) {
      console.log("Initializing mock resume data");
      
      // Create some mock resumes
      const mockResumes = [
        {
          id: 'mock-resume-1',
          name: 'Software Engineer Resume',
          score: 85,
          lastUpdated: new Date().toISOString().split('T')[0],
          file_path: '/mock/resume1.pdf',
          content: 'Mock resume content for software engineer'
        },
        {
          id: 'mock-resume-2',
          name: 'Data Scientist Resume',
          score: 72,
          lastUpdated: new Date().toISOString().split('T')[0],
          file_path: '/mock/resume2.pdf',
          content: 'Mock resume content for data scientist'
        },
        {
          id: 'mock-resume-3',
          name: 'Product Manager Resume',
          score: 68,
          lastUpdated: new Date().toISOString().split('T')[0],
          file_path: '/mock/resume3.pdf',
          content: 'Mock resume content for product manager'
        }
      ];
      
      // Set resumes state
      setResumes(mockResumes);
      setSelectedResume(mockResumes[0]);
      
      // Store in localStorage for persistence
      localStorage.setItem('resumeData', JSON.stringify(mockResumes));
      localStorage.setItem('selectedResumeId', mockResumes[0].id);
    }
  }, [resumes]);

  // Fetch user's resumes
  const fetchResumes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await resumeApi.getUserResumes(userId);
      if (response && response.data) {
        setResumes(response.data);
        // If there are resumes, select the first one
        if (response.data.length > 0 && !selectedResume) {
          setSelectedResume(response.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching resumes:', err);
      setError('Failed to load resumes');
      setSnackbar({
        open: true,
        message: 'Failed to load resumes',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [userId, selectedResume]);

  // Fetch resume metrics
  const fetchResumeMetrics = useCallback(async (resumeId) => {
    if (!resumeId) return;
    
    try {
      // Fetch resume strength
      const scoreResponse = await resumeApi.getAtsScore(resumeId);
      if (scoreResponse && scoreResponse.data) {
        setResumeMetrics(prev => ({
          ...prev,
          strength: scoreResponse.data.score
        }));
      }
      
      // Fetch history
      const historyResponse = await resumeApi.getAtsHistory();
      if (historyResponse && historyResponse.data) {
        setResumeMetrics(prev => ({
          ...prev,
          history: historyResponse.data
        }));
      }
    } catch (err) {
      console.error('Error fetching resume metrics:', err);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Fetch metrics when selected resume changes
  useEffect(() => {
    if (selectedResume) {
      fetchResumeMetrics(selectedResume.id);
    }
  }, [selectedResume, fetchResumeMetrics]);

  const handleNewResumeOpen = () => {
    setNewResumeDialogOpen(true);
  };

  const handleNewResumeClose = () => {
    setNewResumeDialogOpen(false);
    setResumeName('');
  };

  const handleCreateResume = async () => {
    if (resumeName.trim()) {
      setLoading(true);
      try {
        const newResumeData = {
          name: resumeName,
          userId: userId,
          content: {
            sections: {
              personalInfo: {},
              professionalSummary: '',
              workExperience: [],
              education: [],
              skills: []
            }
          }
        };
        
        const response = await resumeApi.createResume(newResumeData);
        
        if (response && response.data) {
          const newResume = {
            id: response.data.id,
            name: resumeName,
            score: 50,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
          
          setResumes([...resumes, newResume]);
          setSelectedResume(newResume);
          setSnackbar({
            open: true,
            message: 'Resume created successfully',
            severity: 'success'
          });
        }
      } catch (err) {
        console.error('Error creating resume:', err);
        setSnackbar({
          open: true,
          message: 'Failed to create resume',
          severity: 'error'
        });
      } finally {
        setLoading(false);
        handleNewResumeClose();
      }
    }
  };

  const handleDeleteResumeOpen = (resume) => {
    setResumeToDelete(resume);
    setDeleteDialogOpen(true);
  };

  const handleDeleteResumeClose = () => {
    setDeleteDialogOpen(false);
    setResumeToDelete(null);
  };

  const handleDeleteResume = async () => {
    if (!resumeToDelete) return;
    
    setLoading(true);
    try {
      await resumeApi.deleteResume(resumeToDelete.id);
      
      // Remove deleted resume from state
      const updatedResumes = resumes.filter(r => r.id !== resumeToDelete.id);
      setResumes(updatedResumes);
      
      // If deleted resume was selected, select another one
      if (selectedResume && selectedResume.id === resumeToDelete.id) {
        setSelectedResume(updatedResumes.length > 0 ? updatedResumes[0] : null);
      }
      
      setSnackbar({
        open: true,
        message: 'Resume deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting resume:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete resume',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleDeleteResumeClose();
    }
  };

  const handleUploadResumeOpen = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadResumeClose = () => {
    setUploadDialogOpen(false);
    setResumeFile(null);
  };

  const handleResumeFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setResumeFile(file);
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', resumeFile);
      formData.append('userId', userId);
      
      const response = await resumeApi.uploadResume(formData);
      
      if (response && response.data) {
        // Refresh resume list after successful upload
        fetchResumes();
        
        setSnackbar({
          open: true,
          message: 'Resume uploaded successfully',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error uploading resume:', err);
      setSnackbar({
        open: true,
        message: 'Failed to upload resume',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleUploadResumeClose();
    }
  };

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
  };

  const handleUpdateResume = async (resumeId, updatedData) => {
    setLoading(true);
    try {
      await resumeApi.updateResume(resumeId, updatedData);
      
      // Update local state
      const updatedResumes = resumes.map(resume => 
        resume.id === resumeId 
          ? { ...resume, ...updatedData, lastUpdated: new Date().toISOString().split('T')[0] } 
          : resume
      );
      
      setResumes(updatedResumes);
      
      // If updated resume is selected, update selected resume
      if (selectedResume && selectedResume.id === resumeId) {
        setSelectedResume(updatedResumes.find(r => r.id === resumeId));
      }
      
      setSnackbar({
        open: true,
        message: 'Resume updated successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error updating resume:', err);
      setSnackbar({
        open: true,
        message: 'Failed to update resume',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportResume = async (format = 'pdf') => {
    if (!selectedResume) return;
    
    try {
      await resumeApi.exportResume(selectedResume.id, format);
      
      setSnackbar({
        open: true,
        message: `Resume exported as ${format.toUpperCase()}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error exporting resume:', err);
      setSnackbar({
        open: true,
        message: 'Failed to export resume',
        severity: 'error'
      });
    }
  };

  const handleApplyToJob = async (jobId) => {
    if (!selectedResume) {
      setSnackbar({
        open: true,
        message: 'Please select a resume to apply',
        severity: 'warning'
      });
      return;
    }
    
    setLoading(true);
    try {
      // This would typically connect to a job application API
      // For now using mock apply function
      const response = await resumeApi.optimizeResume(
        selectedResume.id, 
        "Software Engineer", 
        "Senior developer with React.js experience"
      );
      
      if (response) {
        setSnackbar({
          open: true,
          message: 'Job application submitted successfully',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Error applying to job:', err);
      setSnackbar({
        open: true,
        message: 'Failed to submit application',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshAnalysis = async () => {
    if (!selectedResume) return;
    
    setLoading(true);
    try {
      await fetchResumeMetrics(selectedResume.id);
      
      setSnackbar({
        open: true,
        message: 'Resume analysis refreshed',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error refreshing analysis:', err);
      setSnackbar({
        open: true,
        message: 'Failed to refresh analysis',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Function to get color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      width: '100%',
      minHeight: '100vh', 
      height: 'auto', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ boxShadow: 2, zIndex: 1200 }}>
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu" 
            sx={{ mr: 2 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ArrowRightIcon sx={{ transform: 'rotate(180deg)' }} /> : <ArrowRightIcon />}
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Resume Builder
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* Main Content Area with Sidebar */}
      <Box sx={{ 
        display: 'flex',
        position: 'relative',
        width: '100%',
        flexGrow: 1,
        height: 'calc(100vh - 64px)',
        overflow: 'hidden'
      }}>
        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <Box 
            sx={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              zIndex: 1050,
              display: { xs: 'block', md: 'none' }
            }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* LEFT SIDEBAR – ENHANCED DESIGN */}
        <Box sx={{ 
          width: { xs: 280, md: 280 }, // Reduced from 320px to 280px
          flexShrink: 0,
          p: 0, 
          bgcolor: '#f8f9fa',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          position: { xs: 'fixed', md: 'sticky' },
          top: { xs: 0, md: '64px' },
          left: { xs: sidebarOpen ? 0 : -280, md: 0 },
          zIndex: 1100,
          transition: 'all 0.3s ease',
          boxShadow: { xs: '5px 0 15px rgba(0,0,0,0.1)', md: 'none' },
          pt: { xs: '64px', md: 0 },
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
          },
          '&:hover::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
          }
        }}>
          {/* Sidebar Header with action buttons */}
          <Box sx={{ 
            px: 2, 
            py: 1.5, 
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            bgcolor: '#f8f9fa',
            zIndex: 2
          }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: '600', 
                color: 'primary.main',
              }}
            >
              My Workspace
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleNewResumeOpen}
              size="small"
              sx={{ 
                py: 0.5,
                px: 1,
                boxShadow: 1,
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'none',
                '&:hover': {
                  boxShadow: 2,
                }
              }}
            >
              New Resume
            </Button>
          </Box>
          
          {/* Sidebar Content - Scrollable Area */}
          <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
            {/* Resume Uploader Component */}
            <Card sx={{ 
              p: 1.5, 
              mb: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 1.5, width: 28, height: 28 }}>
                  <UploadIcon sx={{ color: 'white', fontSize: 16 }} />
                </Avatar>
                <Typography variant="subtitle2" fontWeight="600">Upload Resume</Typography>
              </Box>
              <Button 
                variant="outlined" 
                component="label" 
                fullWidth
                size="small"
                onClick={handleUploadResumeOpen}
                sx={{ 
                  borderRadius: 1.5,
                  textTransform: 'none',
                  py: 0.5,
                  fontSize: '0.75rem'
                }}
              >
                Choose File
              </Button>
            </Card>
            
            {/* Resume Strength Meter */}
            <Card sx={{ 
              p: 1.5,
              mb: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="600">Resume Strength</Typography>
                <Chip 
                  label={`${resumeMetrics.strength}/100`} 
                  size="small" 
                  color={getScoreColor(resumeMetrics.strength)}
                  sx={{ fontWeight: 'bold', height: 20, fontSize: '0.7rem' }}
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={resumeMetrics.strength} 
                color={getScoreColor(resumeMetrics.strength)}
                sx={{ 
                  height: 6, 
                  borderRadius: 3, 
                  mb: 1,
                  backgroundColor: `rgba(${getScoreColor(resumeMetrics.strength) === 'success' ? '76, 175, 80' : 
                    getScoreColor(resumeMetrics.strength) === 'warning' ? '255, 152, 0' : 
                    '244, 67, 54'}, 0.2)`
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                {resumeMetrics.strength >= 70 ? (
                  <>
                    <CheckCircleIcon sx={{ fontSize: 14, mr: 0.5, color: 'success.main' }} />
                    Your resume is looking good!
                  </>
                ) : (
                  <>
                    <WarningIcon sx={{ fontSize: 14, mr: 0.5, color: 'warning.main' }} />
                    Your resume needs improvement
                  </>
                )}
              </Typography>
            </Card>
            
            {/* Resume Summary AI Inference */}
            <Card sx={{ 
              p: 1.5, 
              mb: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              bgcolor: 'rgba(25, 118, 210, 0.05)'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InsightsIcon sx={{ mr: 0.5, color: 'primary.main', fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight="600">AI Summary</Typography>
                </Box>
                <Tooltip title="Refresh inference">
                  <span>
                    <IconButton 
                      size="small" 
                      sx={{ color: 'primary.light', p: 0.5, ml: 0.5 }}
                      onClick={handleRefreshAnalysis}
                      disabled={loading || !selectedResume}
                    >
                      {loading ? 
                        <CircularProgress size={16} color="inherit" /> : 
                        <RefreshIcon fontSize="small" sx={{ fontSize: 16 }} />
                      }
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
              <Typography variant="caption" sx={{ 
                fontStyle: 'italic', 
                color: 'text.secondary', 
                mb: 1, 
                lineHeight: 1.4,
                display: 'block'
              }}>
                {selectedResume ? 
                  `"Experienced software engineer with strong React skills and backend development experience. Shows leadership potential and problem-solving abilities."` : 
                  "Select a resume to see AI summary"
                }
              </Typography>
              <Chip 
                size="small" 
                icon={<SmartToyIcon sx={{ fontSize: '14px !important' }} />} 
                label="AI Generated" 
                sx={{ 
                  bgcolor: 'rgba(25, 118, 210, 0.1)', 
                  color: 'primary.main',
                  height: 20,
                  fontSize: '0.65rem',
                  '& .MuiChip-label': { px: 1 }
                }} 
              />
            </Card>
            
            {/* List of Resumes - Reworked as cards */}
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 'bold', 
              mb: 1,
              display: 'flex',
              alignItems: 'center'
            }}>
              <DescriptionIcon sx={{ mr: 0.75, color: 'primary.main', fontSize: 18 }} />
              My Resumes
            </Typography>
            
            {loading && resumes.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : resumes.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                No resumes found. Create a new resume or upload one.
              </Typography>
            ) : (
              resumes.map((resume, index) => (
                <Card 
                  key={resume.id}
                  sx={{ 
                    p: 1.5, 
                    mb: 1,
                    borderRadius: 1.5,
                    borderLeft: selectedResume && selectedResume.id === resume.id ? '3px solid' : '3px solid transparent',
                    borderColor: selectedResume && selectedResume.id === resume.id ? 'primary.main' : 'transparent',
                    bgcolor: selectedResume && selectedResume.id === resume.id ? 'rgba(25, 118, 210, 0.04)' : 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    '&:hover': { 
                      boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
                      bgcolor: selectedResume && selectedResume.id === resume.id ? 'rgba(25, 118, 210, 0.06)' : 'rgba(0, 0, 0, 0.01)'
                    },
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleSelectResume(resume)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: selectedResume && selectedResume.id === resume.id ? 600 : 500,
                        color: selectedResume && selectedResume.id === resume.id ? 'primary.main' : 'text.primary',
                        flexGrow: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {resume.name}
                    </Typography>
                    <Chip 
                      label={`${resume.score}%`}
                      size="small"
                      color={getScoreColor(resume.score)}
                      sx={{ 
                        fontWeight: 'bold', 
                        height: 20, 
                        fontSize: '0.65rem',
                        ml: 1,
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ display: 'block', fontSize: '0.7rem' }}
                    >
                      Last updated: {resume.lastUpdated}
                    </Typography>
                    <IconButton 
                      size="small" 
                      color="error"
                      sx={{ p: 0.2, ml: 0.5 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResumeOpen(resume);
                      }}
                    >
                      <DeleteIcon fontSize="small" sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                </Card>
              ))
            )}
            
            {/* Resume Timeline - Graphical Journey */}
            <Typography variant="subtitle2" sx={{ 
              fontWeight: 'bold', 
              mt: 3,
              mb: 1,
              display: 'flex',
              alignItems: 'center'
            }}>
              <TimelineIcon sx={{ mr: 0.75, color: 'primary.main', fontSize: 18 }} />
              Resume Journey
            </Typography>
            
            <Card sx={{ 
              p: 2, 
              mb: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              overflow: 'hidden'
            }}>
              {/* Timeline visual representation */}
              <Box sx={{ height: 140, position: 'relative', mb: 1 }}>
                {/* Horizontal timeline line */}
                <Box sx={{ 
                  position: 'absolute', 
                  left: 10, 
                  right: 10, 
                  top: '50%', 
                  height: 3, 
                  borderRadius: 1.5,
                  background: 'linear-gradient(90deg, #e0e0e0 0%, #1976d2 100%)',
                  zIndex: 0
                }} />
                
                {/* Timeline milestones */}
                {[
                  { date: 'Aug 1', label: 'Created', score: 50, current: false },
                  { date: 'Aug 5', label: 'Updated', score: 65, current: false },
                  { date: 'Aug 12', label: 'ATS Pass', score: 75, current: false },
                  { date: 'Aug 15', label: 'Current', score: 85, current: true }
                ].map((milestone, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'absolute',
                      left: `calc(${index * 30}% + 10px)`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      zIndex: 1,
                      width: 50
                    }}
                  >
                    {/* Circle marker */}
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: milestone.current ? 'primary.main' : '#fff',
                        border: `2px solid ${milestone.current ? 'primary.main' : '#bdbdbd'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1,
                        boxShadow: milestone.current ? '0 3px 8px rgba(25, 118, 210, 0.3)' : 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: milestone.current ? 'white' : 'text.secondary',
                          fontSize: '0.7rem' 
                        }}
                      >
                        {milestone.score}%
                      </Typography>
                    </Box>
                    
                    {/* Label below */}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: milestone.current ? 'bold' : 'normal',
                        color: milestone.current ? 'primary.main' : 'text.secondary',
                        textAlign: 'center',
                        fontSize: '0.7rem',
                        lineHeight: 1.2
                      }}
                    >
                      {milestone.label}
                    </Typography>
                    
                    {/* Date below label */}
                    <Typography
                      variant="caption"
                      sx={{ 
                        fontSize: '0.65rem',
                        color: 'text.secondary',
                        textAlign: 'center'
                      }}
                    >
                      {milestone.date}
                    </Typography>
                    
                    {/* Current version indicator */}
                    {milestone.current && (
                      <Box 
                        sx={{ 
                          width: 0, 
                          height: 0, 
                          borderLeft: '6px solid transparent',
                          borderRight: '6px solid transparent',
                          borderBottom: '6px solid primary.main',
                          position: 'absolute',
                          top: -8
                        }}
                      />
                    )}
                  </Box>
                ))}
                
                {/* Score trend line */}
                <Box sx={{ 
                  position: 'absolute',
                  left: 10,
                  right: 10,
                  bottom: 15,
                  height: 40
                }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path 
                      d="M0,40 L33,30 L66,20 L100,5" 
                      fill="none" 
                      stroke="rgba(25, 118, 210, 0.3)" 
                      strokeWidth="2"
                      strokeDasharray="2"
                    />
                  </svg>
                </Box>
              </Box>
              
              <Divider sx={{ mb: 1.5 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption" fontWeight="medium" color="text.secondary">
                    +35% improvement
                  </Typography>
                </Box>
                
                <Button 
                  size="small" 
                  variant="text" 
                  endIcon={<ArrowRightIcon sx={{ fontSize: 14 }} />}
                  sx={{ 
                    textTransform: 'none', 
                    fontSize: '0.75rem',
                    py: 0.5
                  }}
                >
                  View History
                </Button>
              </Box>
            </Card>
            
            {/* Personality Traits Based on Resume */}
            <Card sx={{ 
              p: 1.5, 
              mb: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 0.75, color: 'primary.main', fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight="600">Personality Traits</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {[
                  { trait: 'Analytical', score: 92 },
                  { trait: 'Detail-oriented', score: 88 },
                  { trait: 'Problem-solver', score: 85 }
                ].map((trait, index) => (
                  <Chip 
                    key={index}
                    label={trait.trait}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                      color: 'success.dark',
                      border: '1px solid rgba(76, 175, 80, 0.2)',
                      fontWeight: 600,
                      height: 22,
                      fontSize: '0.65rem',
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                ))}
              </Box>
            </Card>
            
            {/* Bias/Inclusion Audit */}
            <Card sx={{ 
              p: 1.5, 
              mb: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              bgcolor: 'rgba(255, 152, 0, 0.05)',
              border: '1px solid rgba(255, 152, 0, 0.1)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon sx={{ mr: 0.75, color: '#ff9800', fontSize: 18 }} />
                <Typography variant="subtitle2" fontWeight="600">Bias/Inclusion Audit</Typography>
                <Chip 
                  label="85%" 
                  size="small" 
                  color="success"
                  sx={{ 
                    ml: 'auto', 
                    height: 20, 
                    fontSize: '0.65rem',
                    '& .MuiChip-label': { px: 1 }
                  }}
                />
              </Box>
              
              <Box sx={{ mt: 1, p: 0.75, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon fontSize="small" sx={{ mr: 0.5, color: '#ff9800', fontSize: 14 }} />
                  Consider gender-neutral language
                </Typography>
              </Box>
            </Card>
            
            {/* Quick Apply Section */}
            <Card sx={{ 
              p: 1.5, 
              mb: 2,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid rgba(25, 118, 210, 0.1)',
              bgcolor: 'rgba(25, 118, 210, 0.02)'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WorkOutlineIcon sx={{ mr: 0.75, color: 'primary.main', fontSize: 18 }} />
                <Typography variant="subtitle2" fontWeight="600">Quick Apply</Typography>
              </Box>
              
              <Box sx={{ mb: 1, p: 1, bgcolor: 'rgba(25, 118, 210, 0.05)', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.8rem' }}>Senior React Developer</Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>TechCorp • Remote</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ mr: 1 }}>Match:</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={85} 
                    sx={{ height: 4, borderRadius: 2, flexGrow: 1 }}
                    color="success"
                  />
                  <Typography variant="caption" sx={{ ml: 1, fontWeight: 'bold' }}>85%</Typography>
                </Box>
              </Box>
              
              <Button
                variant="contained"
                size="small"
                fullWidth
                startIcon={<AlternateEmailIcon sx={{ fontSize: 16 }} />}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 'bold',
                  py: 0.5,
                  fontSize: '0.75rem'
                }}
              >
                Apply Now
              </Button>
            </Card>
          </Box>
        </Box>
        
        {/* MAIN RIGHT PANEL – TAB SYSTEM */}
        <Box sx={{ 
          flexGrow: 1,
          width: { xs: '100%', md: 'calc(100% - 280px)' },
          marginLeft: { xs: sidebarOpen ? '280px' : 0, md: 0 },
          transition: 'margin-left 0.3s ease',
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ 
            borderBottom: 1, 
            borderColor: 'divider', 
            bgcolor: 'background.paper',
            position: 'sticky',
            top: 0,
            zIndex: 20,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ 
                '.MuiTab-root': { 
                  minHeight: '48px',
                  textTransform: 'none',
                  fontWeight: 'medium',
                  fontSize: '0.85rem',
                  px: 2
                } 
              }}
            >
              <Tab icon={<EditIcon />} iconPosition="start" label="Edit Resume" />
              <Tab 
                icon={<AnalyticsIcon />} 
                iconPosition="start" 
                label={
                  <Badge color="primary" variant="dot">
                    Analyze (AI)
                  </Badge>
                } 
              />
              <Tab icon={<CompareArrowsIcon />} iconPosition="start" label="Job Match" />
              <Tab icon={<KeyIcon />} iconPosition="start" label="Keywords" />
              <Tab icon={<WorkIcon />} iconPosition="start" label="Jobs" />
              <Tab icon={<SettingsIcon />} iconPosition="start" label="Features" />
            </Tabs>
          </Box>
          
          {/* Tab Panels - Improved styling */}
          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            <TabPanel value={activeTab} index={0}>
              <ResumeBuilder />
            </TabPanel>
            
            <TabPanel value={activeTab} index={1}>
              <ResumeAnalysisAI selectedResume={selectedResume} />
            </TabPanel>
            
            <TabPanel value={activeTab} index={2}>
              <JobMatchCalculator />
            </TabPanel>
            
            <TabPanel value={activeTab} index={3}>
              <KeywordsExtractor />
            </TabPanel>
            
            <TabPanel value={activeTab} index={4}>
              <FeaturedJobs />
            </TabPanel>
            
            <TabPanel value={activeTab} index={5}>
              <FeaturesPanel />
            </TabPanel>
          </Box>
        </Box>
      </Box>

      {/* Create New Resume Dialog */}
      <Dialog open={newResumeDialogOpen} onClose={handleNewResumeClose}>
        <DialogTitle>Create New Resume</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Resume Name"
            type="text"
            fullWidth
            variant="outlined"
            value={resumeName}
            onChange={(e) => setResumeName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleNewResumeClose}>Cancel</Button>
          <Button 
            onClick={handleCreateResume} 
            variant="contained"
            disabled={loading || !resumeName.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Resume Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleUploadResumeClose}>
        <DialogTitle>Upload Resume</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Upload your existing resume to import into the system. Supported formats: PDF, DOCX, TXT.
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 1 }}
            fullWidth
          >
            Select File
            <input
              type="file"
              hidden
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleResumeFileChange}
            />
          </Button>
          {resumeFile && (
            <Box sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2">{resumeFile.name}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadResumeClose}>Cancel</Button>
          <Button 
            onClick={handleUploadResume} 
            variant="contained"
            disabled={loading || !resumeFile}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Resume Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteResumeClose}>
        <DialogTitle>Delete Resume</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete "{resumeToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteResumeClose}>Cancel</Button>
          <Button 
            onClick={handleDeleteResume} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResumePage;
