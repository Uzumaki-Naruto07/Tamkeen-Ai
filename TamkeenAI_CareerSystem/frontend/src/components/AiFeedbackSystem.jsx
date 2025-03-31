import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  List,
  ListItem,
  ListItemText,
  Grid,
  Card,
  CardContent,
  useTheme,
  IconButton,
  Tooltip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Lightbulb,
  Psychology,
  ExpandMore,
  Check,
  Close,
  ThumbUp,
  ThumbDown,
  Refresh,
  Edit,
  Send,
  Help,
  Star,
  FormatQuote,
  LightbulbOutlined
} from '@mui/icons-material';
import apiEndpoints from '../utils/api';

/**
 * AiFeedbackSystem component provides intelligent AI-powered feedback on resumes
 * to help users improve their content based on industry best practices.
 */
const AiFeedbackSystem = ({
  resumeId,
  resumeData,
  jobData,
  loading = false
}) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);
  
  const handleChange = (section) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? section : null);
  };
  
  const handleGenerateFeedback = async (customPromptText = '') => {
    if (!resumeId) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await apiEndpoints.ai.getResumeFeedback({
        resumeId,
        jobTitle: jobData?.title,
        jobDescription: jobData?.description,
        customPrompt: customPromptText || undefined
      });
      
      setFeedback(response.data);
    } catch (err) {
      console.error('Error generating AI feedback:', err);
      setError('Failed to generate feedback. Please try again.');
      
      // For development, create mock feedback data
      const mockFeedback = generateMockFeedback();
      setFeedback(mockFeedback);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCustomPromptSubmit = () => {
    if (!customPrompt.trim()) return;
    
    handleGenerateFeedback(customPrompt);
    setPromptDialogOpen(false);
  };
  
  const handleSubmitFeedbackRating = async () => {
    if (!resumeId || !feedback) return;
    
    try {
      await apiEndpoints.ai.rateFeedback({
        resumeId,
        feedbackId: feedback.id,
        rating: feedbackRating
      });
      
      // Show success message or update UI
    } catch (err) {
      console.error('Error submitting feedback rating:', err);
    }
  };
  
  // When feedback rating changes, submit it
  useEffect(() => {
    if (feedbackRating > 0) {
      handleSubmitFeedbackRating();
    }
  }, [feedbackRating]);
  
  // Generate mock feedback data for development
  const generateMockFeedback = () => {
    return {
      id: 'mock-feedback-' + Date.now(),
      overallAssessment: {
        score: 72,
        summary: "Your resume shows solid experience but could benefit from more specific achievements and metrics. The format is clean, but some sections need better organization. Add more industry-specific keywords to improve ATS performance.",
        strengths: [
          "Clear chronological work history",
          "Good educational background presentation",
          "Technical skills are well categorized"
        ],
        weaknesses: [
          "Lack of quantifiable achievements",
          "Summary section is too generic",
          "Missing relevant keywords for target industry"
        ]
      },
      sectionFeedback: [
        {
          section: "Summary/Objective",
          rating: 3,
          feedback: "Your summary is too generic and doesn't highlight your unique value proposition. Consider tailoring it to explicitly mention your years of experience, industry specialization, and 2-3 core strengths that set you apart.",
          suggestion: "Experienced software developer with 7+ years specializing in cloud-native applications and microservices architecture. Proven track record of reducing system latency by 40% and implementing scalable solutions that support millions of users. Passionate about clean code practices and mentoring junior developers."
        },
        {
          section: "Work Experience",
          rating: 4,
          feedback: "Your work experience entries list responsibilities but lack measurable achievements. Add metrics and specific outcomes to demonstrate your impact. Use strong action verbs at the beginning of each bullet point.",
          suggestion: "• Architected and deployed a microservice-based payment processing system that reduced transaction times by 35% and increased reliability to 99.99% uptime\n• Led a team of 5 developers to deliver a mission-critical application 2 weeks ahead of schedule, resulting in $150K in early delivery bonuses\n• Optimized database queries reducing load times by 60% and improving user satisfaction scores by 25%"
        },
        {
          section: "Skills",
          rating: 3.5,
          feedback: "Your skills section is comprehensive but lacks organization and prioritization. Group similar skills together and place the most relevant ones for your target positions at the top. Consider adding proficiency levels.",
          suggestion: "Technical Skills:\n• Programming Languages: Java (Expert), Python (Advanced), JavaScript (Advanced), Go (Intermediate)\n• Frameworks & Libraries: Spring Boot, React, Node.js, Django\n• Database Technologies: PostgreSQL, MongoDB, Redis, Elasticsearch\n• Cloud & DevOps: AWS (Certified), Docker, Kubernetes, CI/CD pipelines"
        },
        {
          section: "Education",
          rating: 4,
          feedback: "Your education section is well-structured, but consider adding relevant coursework, academic achievements, or projects that relate to your target positions.",
          suggestion: "Bachelor of Science in Computer Science\nStanford University, Stanford, CA | 2014-2018\n• GPA: 3.8/4.0\n• Relevant Coursework: Advanced Algorithms, Machine Learning, Database Systems, Software Engineering\n• Senior Project: Developed an AI-powered scheduling application that optimized resource allocation for campus events"
        },
        {
          section: "Projects",
          rating: 2,
          feedback: "Your projects section is underdeveloped. Include detailed descriptions of personal or professional projects, the technologies used, your role, and the outcomes or impact.",
          suggestion: "Open-Source Contribution - Performance Optimization Tool\n• Developed a Node.js performance analysis tool that helps identify bottlenecks in web applications\n• Implemented real-time monitoring features using WebSockets and D3.js for data visualization\n• Project has 500+ GitHub stars and 20+ contributors\n• Technologies: Node.js, Express, WebSockets, Redis, D3.js"
        }
      ],
      atsRecommendations: {
        missingKeywords: [
          "continuous integration",
          "system architecture",
          "agile methodologies",
          "cross-functional collaboration",
          "RESTful API design"
        ],
        formatIssues: [
          "Inconsistent bullet point formatting",
          "Some dates are in different formats",
          "Headers vary in font size and style"
        ],
        improvementSuggestions: [
          "Use a clean, ATS-friendly format with standard section headers",
          "Incorporate more industry-specific keywords naturally throughout your resume",
          "Ensure consistent formatting and bullet point structure"
        ]
      },
      targetJobAlignment: {
        alignmentScore: 68,
        keyGaps: [
          "Limited demonstration of leadership experience",
          "Missing examples of project management methodology",
          "Insufficient evidence of cross-team collaboration"
        ],
        suggestions: [
          "Highlight leadership roles and team coordination experiences",
          "Incorporate examples of project management frameworks you've used",
          "Emphasize cross-functional collaboration and stakeholder management"
        ]
      },
      nextSteps: [
        "Revise your summary to be more specific and impactful",
        "Add metrics and achievements to your work experience bullets",
        "Reorganize your skills section with most relevant skills first",
        "Add missing keywords identified in ATS recommendations",
        "Ensure consistent formatting throughout the document"
      ]
    };
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading AI feedback system...
        </Typography>
      </Box>
    );
  }
  
  if (!resumeData) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Please select a resume to get AI feedback.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
          <Psychology sx={{ mr: 1, color: theme.palette.primary.main }} />
          AI-Powered Resume Feedback
        </Typography>
        
        <Tooltip title="Custom feedback prompt">
          <IconButton 
            size="small" 
            onClick={() => setPromptDialogOpen(true)}
            sx={{ ml: 1 }}
          >
            <Help fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {isGenerating ? (
        <Box sx={{ 
          p: 4, 
          textAlign: 'center',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 2
        }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Analyzing Your Resume
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Our AI is carefully reviewing your resume to provide personalized feedback...
          </Typography>
        </Box>
      ) : !feedback ? (
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}
        >
          <LightbulbOutlined sx={{ fontSize: 50, color: 'text.secondary', opacity: 0.7 }} />
          
          <Typography variant="h6">
            Get AI Feedback on Your Resume
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 1 }}>
            Our AI will analyze your resume and provide personalized feedback to help you improve it.
            Learn about strengths, weaknesses, ATS compatibility, and get section-by-section recommendations.
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<Psychology />}
            onClick={() => handleGenerateFeedback()}
            size="large"
            sx={{ mt: 1 }}
          >
            Generate AI Feedback
          </Button>
        </Paper>
      ) : (
        <Box>
          {/* Overall Assessment Card */}
          <Card 
            variant="outlined" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              background: `linear-gradient(45deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.light}15 100%)`
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Lightbulb 
                    sx={{ 
                      mr: 1.5, 
                      mt: 0.5, 
                      color: theme.palette.primary.main,
                      fontSize: 28
                    }} 
                  />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Overall Assessment
                    </Typography>
                    <Typography variant="body2">
                      {feedback.overallAssessment.summary}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  ml: 2
                }}>
                  <Box sx={{ 
                    position: 'relative', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                  }}>
                    <CircularProgress
                      variant="determinate"
                      value={feedback.overallAssessment.score}
                      size={80}
                      thickness={4}
                      sx={{ color: theme.palette.primary.main }}
                    />
                    <Box sx={{ 
                      position: 'absolute', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                    }}>
                      <Typography variant="h5" component="div" color="primary">
                        {feedback.overallAssessment.score}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Resume Score
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Check fontSize="small" sx={{ mr: 0.5, color: 'success.main' }} />
                    Strengths
                  </Typography>
                  <List dense disablePadding>
                    {feedback.overallAssessment.strengths.map((strength, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={strength}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Close fontSize="small" sx={{ mr: 0.5, color: 'error.main' }} />
                    Areas to Improve
                  </Typography>
                  <List dense disablePadding>
                    {feedback.overallAssessment.weaknesses.map((weakness, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={weakness}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
              
              {/* Feedback Rating */}
              {feedbackRating === 0 && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Is this feedback helpful?
                  </Typography>
                  <Rating
                    name="feedback-rating"
                    value={feedbackRating}
                    onChange={(event, newValue) => {
                      setFeedbackRating(newValue);
                    }}
                    size="small"
                  />
                </Box>
              )}
            </CardContent>
          </Card>
          
          {/* Section Feedback Accordions */}
          <Typography variant="subtitle1" gutterBottom>
            Section-by-Section Feedback
          </Typography>
          
          {feedback.sectionFeedback.map((section, idx) => (
            <Accordion 
              key={idx} 
              expanded={expandedSection === `section-${idx}`}
              onChange={handleChange(`section-${idx}`)}
              sx={{ 
                mb: 1,
                '&.Mui-expanded': {
                  boxShadow: theme.shadows[2],
                  borderRadius: '8px !important',
                },
                '&:before': {
                  display: 'none',
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ 
                  px: 2,
                  '&.Mui-expanded': {
                    minHeight: 48,
                    borderBottom: '1px solid',
                    borderBottomColor: 'divider',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography sx={{ flexGrow: 1 }}>
                    {section.section}
                  </Typography>
                  <Rating 
                    value={section.rating} 
                    readOnly 
                    size="small" 
                    precision={0.5}
                    sx={{ ml: 2 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, py: 1.5 }}>
                <Typography variant="body2" gutterBottom>
                  {section.feedback}
                </Typography>
                
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormatQuote fontSize="small" sx={{ mr: 0.5, transform: 'rotate(180deg)', color: 'primary.main' }} />
                    Suggested Improvement
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1.5, 
                      bgcolor: theme.palette.background.default,
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {section.suggestion}
                    </Typography>
                  </Paper>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button 
                    size="small" 
                    startIcon={<Edit />}
                    onClick={() => {
                      // Logic to apply suggestion to resume
                      alert(`Applied suggestion for ${section.section} section`);
                    }}
                  >
                    Apply Suggestion
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
          
          {/* ATS Recommendations Card */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            ATS Optimization & Job Alignment
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ATS Recommendations
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Missing Keywords
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {feedback.atsRecommendations.missingKeywords.map((keyword, idx) => (
                      <Chip
                        key={idx}
                        label={keyword}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Format Issues
                  </Typography>
                  <List dense disablePadding>
                    {feedback.atsRecommendations.formatIssues.map((issue, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={issue}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                      Target Job Alignment
                    </Typography>
                    <Chip 
                      label={`${feedback.targetJobAlignment.alignmentScore}% Match`}
                      color={feedback.targetJobAlignment.alignmentScore > 75 ? "success" : "primary"}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Key Gaps
                  </Typography>
                  <List dense disablePadding>
                    {feedback.targetJobAlignment.keyGaps.map((gap, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={gap}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Improvement Suggestions
                  </Typography>
                  <List dense disablePadding>
                    {feedback.targetJobAlignment.suggestions.map((suggestion, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemText 
                          primary={suggestion}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Next Steps */}
          <Card 
            variant="outlined" 
            sx={{ 
              mt: 3, 
              borderRadius: 2,
              bgcolor: theme.palette.background.default,
              borderColor: theme.palette.divider
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recommended Next Steps
              </Typography>
              
              <List>
                {feedback.nextSteps.map((step, idx) => (
                  <ListItem key={idx} sx={{ py: 1 }}>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label={idx + 1} 
                            size="small" 
                            color="primary" 
                            sx={{ mr: 1.5, width: 24, height: 24, fontSize: '0.7rem' }}
                          />
                          <Typography variant="body1">{step}</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={() => handleGenerateFeedback()}
                >
                  Generate New Feedback
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
      
      {/* Custom Prompt Dialog */}
      <Dialog 
        open={promptDialogOpen} 
        onClose={() => setPromptDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Custom Feedback Request
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Specify what kind of feedback you're looking for. For example:
          </Typography>
          <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2, mb: 2 }}>
            <li>Evaluate my resume for a Senior Developer position</li>
            <li>How can I improve my work experience descriptions?</li>
            <li>Compare my resume to industry standards in finance</li>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Describe what feedback you need..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromptDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleCustomPromptSubmit}
            variant="contained"
            disabled={!customPrompt.trim()}
            startIcon={<Send />}
          >
            Get Custom Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AiFeedbackSystem; 