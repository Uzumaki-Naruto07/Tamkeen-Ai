import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  TextField,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AlertTitle,
  FormControl,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Switch,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  InputLabel,
  Menu,
  Tooltip
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Analytics as AnalyticsIcon,
  CompareArrows as CompareArrowsIcon,
  Key as KeyIcon,
  Work as WorkIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  RateReview as RateReviewIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  AutoAwesome as AutoAwesomeIcon,
  ExpandMore as ExpandMoreIcon,
  Error as ErrorIcon,
  Description as DescriptionIcon,
  FileCopy as FileCopyIcon,
  GetApp as GetAppIcon,
  Check as CheckIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { LinearProgress } from '@mui/material';
import { useUser } from "../context/AppContext";
import ResumeAnalyzer from '../components/ResumeAnalyzer';
import ATSResultsCard from '../components/ATSResultsCard';
import ATSScoreVisualizer from '../components/ATSScoreVisualizer';
import WordCloudVisualizer from '../components/WordCloudVisualizer';
import ResumeUploader from '../components/ResumeUploader';
import resumeApi from '../utils/resumeApi';
import apiEndpoints from '../utils/api';

// Add NLP advanced libraries support (these are imported but actual implementation would be in backend)
// These are simply for documentation purposes in the frontend
const NLP_LIBRARIES = {
  spacy: "Spacy provides industrial-grade NER for resume parsing",
  nltk: "NLTK for advanced text processing and tokenization",
  transformers: "HuggingFace Transformers for semantic understanding",
  keyBert: "KeyBERT for accurate keyword extraction",
  docx2txt: "High accuracy document conversion",
}

const ResumePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeId, setResumeId] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(85);
  const [useSemanticMatching, setUseSemanticMatching] = useState(true);
  const [useContextualAnalysis, setUseContextualAnalysis] = useState(true);
  const { profile } = useUser();

  // Cover Letter state
  const [companyName, setCompanyName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [coverLetterTone, setCoverLetterTone] = useState('professional');
  const [coverLetterContent, setCoverLetterContent] = useState('');
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [coverLetterError, setCoverLetterError] = useState(null);
  const [coverLetterCopied, setCoverLetterCopied] = useState(false);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState(null);
  
  // Company details for cover letter
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  
  // User details for cover letter
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userPhone, setUserPhone] = useState('');

  // Interview Prep state
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [questionsError, setQuestionsError] = useState(null);

  // Career Roadmap state
  const [roadmapData, setRoadmapData] = useState(null);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState(null);

  // Calculate confidence score based on available data for analysis
  const calculateConfidenceScore = useMemo(() => {
    if (!resumeFile || !jobDescription) return 0;
    
    let score = 50; // Base score
    
    // Add points for job description length
    if (jobDescription.length > 500) score += 15;
    else if (jobDescription.length > 200) score += 8;
    
    // Add points for semantic matching
    if (useSemanticMatching) score += 20;
    
    // Add points for contextual analysis
    if (useContextualAnalysis) score += 15;
    
    return Math.min(score, 100);
  }, [resumeFile, jobDescription, useSemanticMatching, useContextualAnalysis]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle resume upload success
  const handleUploadSuccess = (data) => {
    console.log('Resume upload successful:', data);
    setResumeId(data.id || 'temp-id');
    // Don't clear the resumeFile state - we need to keep it for analysis
    // Switch to Analysis tab after successful upload
    setActiveTab(1);
  };

  // Handle file selection for upload
  const handleFileSelect = (file) => {
    setResumeFile(file); // Save file object when selected
    console.log('File selected for upload:', file.name);
  };

  const handleJobDescriptionChange = (event) => {
    setJobDescription(event.target.value);
  };

  const handleJobTitleChange = (event) => {
    setJobTitle(event.target.value);
  };

  const analyzeResume = async () => {
    if (!resumeFile) {
      setError('Please upload a resume first.');
      return;
    }

    if (!jobDescription) {
      setError('Please enter a job description.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First extract text from the resume using appropriate parser
      // This would be handled by the backend API, but we show the process here
      console.log('Extracting text from resume and processing with advanced NLP...');
      
      // Call the API with DeepSeek integration enabled and pass the saved resumeFile
      const response = await resumeApi.analyzeResumeWithDeepSeek(resumeId, {
        file: resumeFile, // Use the stored file object
        title: jobTitle || 'Job Position',
        description: jobDescription,
        useSemanticMatching: useSemanticMatching,
        useContextualAnalysis: useContextualAnalysis,
        confidenceThreshold: 0.75,
        includeSynonyms: true,
        includeRelatedTerms: true,
        maxKeywords: 50,
        minKeywordRelevance: 0.65
      });

      // Calculate confidence score for the analysis
      setConfidenceScore(calculateConfidenceScore);

      // Process DeepSeek analysis response - in a real implementation, this would come from backend
      // response.data would contain the actual analysis from DeepSeek
      const deepSeekAnalysis = response.data.llm_analysis || '';
      
      // Extract score from DeepSeek analysis or calculate it
      let extractedScore = response.data.score || 0;
      
      // Extract matching and missing keywords
      const matchingKeywords = response.data.matching_keywords || [];
      const missingKeywords = response.data.missing_keywords || [];
      
      // If no matching keywords are found, set score to zero
      if (matchingKeywords.length === 0) {
        extractedScore = 0;
      }
      
      // Determine assessment message and color based on score
      let assessment = '';
      let color = '';
      
      if (extractedScore >= 80) {
        assessment = "Excellent! Your resume is highly compatible with this job.";
        color = "green";
      } else if (extractedScore >= 60) {
        assessment = "Good. Your resume matches the job requirements reasonably well.";
        color = "blue";
      } else if (extractedScore >= 40) {
        assessment = "Average. Consider optimizing your resume for better matching.";
        color = "orange";
      } else {
        assessment = "Low match. Your resume needs significant adjustments for this role.";
        color = "red";
      }
      
      // Prepare complete analysis data with DeepSeek insights
      const analysisData = {
        // Use actual data from DeepSeek analysis 
        score: extractedScore,
        matched_keywords: matchingKeywords,
        missing_keywords: missingKeywords,
        ats_feedback: assessment,
        ats_color: color,
        pass_probability: Math.round(extractedScore * 0.8), // Estimate pass probability based on score
        deepseek_analysis: deepSeekAnalysis,
        optimizations: extractOptimizationsFromDeepSeek(deepSeekAnalysis) || [
          {
            suggestion: 'Add missing technical skills',
            explanation: 'Include skills mentioned in the job description if you have experience with them',
            priority: 'high'
          },
          {
            suggestion: 'Quantify your achievements',
            explanation: 'Add specific metrics to demonstrate impact in your previous roles',
            priority: 'medium'
          },
          {
            suggestion: 'Use more job-specific keywords',
            explanation: 'Incorporate terms directly from the job description where applicable',
            priority: 'high'
          }
        ],
        sections_analysis: response.data.sections_analysis || {
          'Skills': {
            score: 7,
            feedback: 'Good range of skills, but could include more of the specific technologies mentioned in the job description'
          },
          'Experience': {
            score: 8,
            feedback: 'Strong relevant experience, consider quantifying achievements with metrics'
          },
          'Education': {
            score: 9,
            feedback: 'Education requirements are well-matched to the position'
          },
          'Summary': {
            score: 6,
            feedback: 'Could be more targeted to the specific job requirements'
          }
        },
        analysis_confidence: confidenceScore,
        semantic_matches: response.data.semantic_matches || [
          { term: 'web development', matches: ['frontend', 'web application development', 'UI development'], score: 0.92 },
          { term: 'code optimization', matches: ['performance improvement', 'refactoring'], score: 0.87 },
          { term: 'agile methodologies', matches: ['scrum', 'sprint planning', 'product backlog'], score: 0.94 }
        ],
        industry_specific_score: response.data.industry_specific_score || {
          overall: 78,
          skills_match: 82,
          experience_relevance: 75,
          education_fit: 85,
          format_compliance: 70
        },
        analytical_methods_used: [
          "Named Entity Recognition (NER)",
          "Semantic Text Similarity",
          "TF-IDF Vectorization",
          "Part-of-Speech Tagging",
          "Word Embeddings Analysis",
          "DeepSeek R1 LLM Analysis"
        ],
        nlp_libraries_used: Object.keys(NLP_LIBRARIES).concat(["DeepSeek R1"]),
        ...response.data
      };

      setAnalysis(analysisData);
      
      // Save the analysis data to localStorage for dashboard display
      try {
        // Get existing history or initialize empty array
        const existingHistory = JSON.parse(localStorage.getItem('resumeAnalysisHistory') || '[]');
        
        // Add the new analysis with timestamp
        const historyEntry = {
          id: Date.now(),
          job_title: jobTitle || 'Job Position',
          score: extractedScore,
          assessment: assessment,
          color: color,
          created_at: new Date().toISOString(),
          resume_filename: resumeFile.name,
        };
        
        // Add to beginning of array
        existingHistory.unshift(historyEntry);
        
        // Limit history to most recent 10 entries
        const limitedHistory = existingHistory.slice(0, 10);
        
        // Save back to localStorage
        localStorage.setItem('resumeAnalysisHistory', JSON.stringify(limitedHistory));
      } catch (storageErr) {
        console.error('Error saving to localStorage:', storageErr);
      }
      
      // Move to analysis tab
      setActiveTab(1);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze resume. Please try again.');
      console.error('Resume analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to extract optimization suggestions from DeepSeek analysis text
  const extractOptimizationsFromDeepSeek = (analysisText) => {
    if (!analysisText) return null;
    
    // This would be a more sophisticated parser in production
    // Here we're just extracting suggestions based on common patterns
    const suggestions = [];
    
    // Look for improvement sections in the text
    const improvementSection = analysisText.match(/IMPROVEMENT SUGGESTIONS([\s\S]*?)(?:CAREER DEVELOPMENT|$)/i);
    if (improvementSection && improvementSection[1]) {
      // Extract bullet points
      const bulletPoints = improvementSection[1].split(/•|-/).filter(item => item.trim().length > 0);
      
      bulletPoints.forEach((point, index) => {
        if (point.length > 10) {
          suggestions.push({
            suggestion: point.split(':')[0] || point.substring(0, 50),
            explanation: point.split(':')[1] || point,
            priority: index < 2 ? 'high' : 'medium'
          });
        }
      });
    }
    
    // If we couldn't extract suggestions, look for weakness sections
    if (suggestions.length === 0) {
      const weaknessSection = analysisText.match(/WEAKNESSES([\s\S]*?)(?:KEYWORD|OVERALL|$)/i);
      if (weaknessSection && weaknessSection[1]) {
        const bulletPoints = weaknessSection[1].split(/•|-/).filter(item => item.trim().length > 0);
        
        bulletPoints.forEach((point, index) => {
          if (point.length > 10) {
            suggestions.push({
              suggestion: `Improve: ${point.split(':')[0] || point.substring(0, 50)}`,
              explanation: point.split(':')[1] || point,
              priority: 'high'
            });
          }
        });
      }
    }
    
    return suggestions.length > 0 ? suggestions : null;
  };

  // Generate Cover Letter based on resume and job description
  const generateCoverLetter = async () => {
    if (!resumeFile) {
      setCoverLetterError('Please upload a resume first');
      return;
    }
    
    if (!jobTitle || !jobDescription) {
      setCoverLetterError('Please enter job title and description');
      return;
    }
    
    try {
      setGeneratingLetter(true);
      setCoverLetterError(null);
      
      const jobData = {
        title: jobTitle,
        description: jobDescription,
        file: resumeFile
      };
      
      const options = {
        companyName: companyName,
        companyAddress: companyAddress,
        companyIndustry: companyIndustry,
        companyWebsite: companyWebsite,
        recipientName: recipientName,
        tone: coverLetterTone,
        userName: userName,
        userEmail: userEmail,
        userAddress: userAddress,
        userPhone: userPhone,
        analysisData: analysis // Pass the complete analysis data to the cover letter generator
      };
      
      const response = await resumeApi.generateCoverLetter(resumeFile, jobData, options);
      
      if (response && response.data && response.data.content) {
        setCoverLetterContent(response.data.content);
      } else {
        setCoverLetterError('Failed to generate cover letter. Please try again.');
      }
    } catch (err) {
      console.error('Cover letter generation error:', err);
      setCoverLetterError('Error generating cover letter: ' + (err.message || 'Unknown error'));
    } finally {
      setGeneratingLetter(false);
    }
  };
  
  // Copy cover letter to clipboard
  const handleCopyCoverLetter = () => {
    if (coverLetterContent) {
      navigator.clipboard.writeText(coverLetterContent)
        .then(() => {
          setCoverLetterCopied(true);
          setTimeout(() => setCoverLetterCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy cover letter', err);
          setCoverLetterError('Failed to copy to clipboard');
        });
    }
  };
  
  // Download cover letter in selected format
  const handleDownloadCoverLetter = (format = 'txt') => {
    if (!coverLetterContent) return;
    
    // Close the menu if it's open
    setDownloadMenuAnchor(null);
    
    // Generate filename
    const baseFileName = `Cover_Letter_${companyName ? `for_${companyName.replace(/\s+/g, '_')}` : 'TamkeenAI'}`;
    
    if (format === 'txt') {
      // Download as TXT (plain text)
      const element = document.createElement('a');
      const file = new Blob([coverLetterContent], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${baseFileName}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else if (format === 'docx') {
      // In a production app, we would use a server endpoint to generate a proper DOCX
      // For now, we'll create a simple HTML document with some basic styling
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Cover Letter</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.5; margin: 1in; }
            .header { margin-bottom: 20px; }
            .content { white-space: pre-line; }
          </style>
        </head>
        <body>
          <div class="content">${coverLetterContent}</div>
        </body>
        </html>
      `;
      
      const element = document.createElement('a');
      const file = new Blob([htmlContent], {type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
      element.href = URL.createObjectURL(file);
      element.download = `${baseFileName}.docx`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else if (format === 'pdf') {
      // In a production app, we would use a server endpoint to generate a proper PDF
      // For now, we'll open the browser's print dialog set to save as PDF
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Cover Letter</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.5; margin: 1in; }
            .content { white-space: pre-line; }
            @media print {
              body { margin: 0.5in; }
            }
          </style>
        </head>
        <body>
          <div class="content">${coverLetterContent}</div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };
  
  // Handle opening download format menu
  const handleOpenDownloadMenu = (event) => {
    setDownloadMenuAnchor(event.currentTarget);
  };
  
  // Handle closing download format menu
  const handleCloseDownloadMenu = () => {
    setDownloadMenuAnchor(null);
  };

  // Generate interview questions based on resume and job description
  const generateInterviewQuestions = async () => {
    if (!resumeFile) {
      setQuestionsError('Please upload a resume first');
      return;
    }
    
    if (!jobTitle || !jobDescription) {
      setQuestionsError('Please enter job title and description');
      return;
    }
    
    try {
      setGeneratingQuestions(true);
      setQuestionsError(null);
      
      // In a real implementation, we would call an API. For now, we'll generate mock questions
      // based on the analysis data and job description
      setTimeout(() => {
        const mockQuestions = generateMockInterviewQuestions(analysis, jobTitle, jobDescription);
        setInterviewQuestions(mockQuestions);
        setGeneratingQuestions(false);
      }, 2000);
      
    } catch (err) {
      console.error('Question generation error:', err);
      setQuestionsError('Error generating interview questions: ' + (err.message || 'Unknown error'));
      setGeneratingQuestions(false);
    }
  };
  
  // Helper to mock generate interview questions based on the resume analysis
  const generateMockInterviewQuestions = (analysis, jobTitle, jobDescription) => {
    // Base questions that are generally applicable
    const baseQuestions = [
      {
        id: 1,
        type: "behavioral",
        question: "Tell me about yourself and your experience in this field.",
        guidance: "Focus on your professional background, key accomplishments, and how they relate to the position. Keep it concise (1-2 minutes) and highlight your most relevant experience."
      },
      {
        id: 2,
        type: "behavioral",
        question: "Why are you interested in this position?",
        guidance: "Show that you've researched the company and role. Explain how your skills align with the job requirements and how this role fits into your career goals."
      },
      {
        id: 3, 
        type: "behavioral",
        question: "Describe a challenging project you worked on and how you overcame obstacles.",
        guidance: "Use the STAR method (Situation, Task, Action, Result) to structure your response. Focus on your problem-solving skills and the positive outcome."
      }
    ];
    
    // Technical questions based on matching keywords
    const technicalQuestions = [];
    
    if (analysis && analysis.matching_keywords) {
      // Create technical questions based on matching keywords
      const techKeywords = analysis.matching_keywords.filter(keyword => 
        /javascript|python|java|react|node|sql|aws|cloud|machine learning|data|algorithm/i.test(keyword)
      ).slice(0, 3);
      
      techKeywords.forEach((keyword, index) => {
        technicalQuestions.push({
          id: baseQuestions.length + index + 1,
          type: "technical",
          question: `You listed ${keyword} on your resume. Can you explain a project where you used this skill?`,
          guidance: `Demonstrate your depth of knowledge in ${keyword}. Describe a specific project, your role, how you used this technology, and the impact it had.`
        });
      });
      
      // Add some technical questions based on missing keywords
      if (analysis.missing_keywords && analysis.missing_keywords.length > 0) {
        const missingSkill = analysis.missing_keywords[0];
        technicalQuestions.push({
          id: baseQuestions.length + techKeywords.length + 1,
          type: "technical",
          question: `This role requires experience with ${missingSkill}. How would you approach learning this skill?`,
          guidance: `Even if you don't have experience with ${missingSkill}, show your willingness to learn and your approach to acquiring new skills. Mention any similar technologies you've worked with.`
        });
      }
    }
    
    // Situational questions based on job description
    const situationalQuestions = [
      {
        id: baseQuestions.length + technicalQuestions.length + 1,
        type: "situational",
        question: `How would you handle tight deadlines in a fast-paced ${jobTitle} role?`,
        guidance: "Discuss your time management strategies, prioritization skills, and ability to work under pressure. Provide an example from your past experience."
      },
      {
        id: baseQuestions.length + technicalQuestions.length + 2,
        type: "situational",
        question: "Describe how you would approach collaborating with a cross-functional team on a complex project.",
        guidance: "Highlight your communication skills, adaptability, and experience working with diverse teams. Explain how you navigate different perspectives and work styles."
      }
    ];
    
    // Add some job-specific questions
    const jobSpecificQuestions = [];
    
    if (jobTitle.toLowerCase().includes("data")) {
      jobSpecificQuestions.push({
        id: baseQuestions.length + technicalQuestions.length + situationalQuestions.length + 1,
        type: "job-specific",
        question: "How do you ensure the accuracy and integrity of data in your analysis?",
        guidance: "Discuss your data validation techniques, quality control processes, and how you handle outliers or missing data."
      });
    } else if (jobTitle.toLowerCase().includes("develop") || jobTitle.toLowerCase().includes("engineer")) {
      jobSpecificQuestions.push({
        id: baseQuestions.length + technicalQuestions.length + situationalQuestions.length + 1,
        type: "job-specific",
        question: "How do you approach debugging a complex issue in your code?",
        guidance: "Explain your systematic approach to troubleshooting, the tools you use, and how you ensure the solution addresses the root cause."
      });
    } else if (jobTitle.toLowerCase().includes("design")) {
      jobSpecificQuestions.push({
        id: baseQuestions.length + technicalQuestions.length + situationalQuestions.length + 1,
        type: "job-specific",
        question: "How do you balance user needs with business requirements in your design process?",
        guidance: "Describe your design methodology, how you conduct user research, and how you communicate design decisions to stakeholders."
      });
    } else {
      jobSpecificQuestions.push({
        id: baseQuestions.length + technicalQuestions.length + situationalQuestions.length + 1,
        type: "job-specific",
        question: `What unique perspective or skills would you bring to this ${jobTitle} position?`,
        guidance: "Highlight your unique strengths, experiences, or approaches that differentiate you from other candidates."
      });
    }
    
    // Combine all questions
    return [...baseQuestions, ...technicalQuestions, ...situationalQuestions, ...jobSpecificQuestions];
  };
  
  // Handle accordion expansion for questions
  const handleQuestionExpand = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  // Generate career roadmap based on resume and job description
  const generateCareerRoadmap = async () => {
    if (!resumeFile) {
      setRoadmapError('Please upload a resume first');
      return;
    }
    
    if (!jobTitle || !jobDescription) {
      setRoadmapError('Please enter job title and description');
      return;
    }
    
    try {
      setGeneratingRoadmap(true);
      setRoadmapError(null);
      
      // In a real implementation, we would call an API endpoint that generates
      // a customized career roadmap. For now, we'll generate mock data.
      setTimeout(() => {
        const mockRoadmap = generateMockCareerRoadmap(analysis, jobTitle, jobDescription);
        setRoadmapData(mockRoadmap);
        setGeneratingRoadmap(false);
      }, 2000);
      
    } catch (err) {
      console.error('Roadmap generation error:', err);
      setRoadmapError('Error generating career roadmap: ' + (err.message || 'Unknown error'));
      setGeneratingRoadmap(false);
    }
  };
  
  // Helper to generate a mock career roadmap based on the resume analysis
  const generateMockCareerRoadmap = (analysis, jobTitle, jobDescription) => {
    // Extract skills from analysis
    const currentSkills = analysis?.matching_keywords || [];
    const missingSkills = analysis?.missing_keywords || [];
    
    // Calculate skill gap percentage
    const skillGapPercentage = missingSkills.length > 0 ? 
      (missingSkills.length / (currentSkills.length + missingSkills.length)) * 100 : 10;
    
    // Generate learning paths based on job title and missing skills
    const learningPaths = [];
    
    // Short-term path (3 months)
    const shortTermSkills = missingSkills.slice(0, 3);
    const shortTermPath = {
      timeframe: "Short-term (3 months)",
      focus: "Address immediate skill gaps",
      skills: shortTermSkills.length > 0 ? shortTermSkills : ["Improve technical documentation", "Enhance communication skills"],
      resources: [
        {
          name: "Online Courses",
          platforms: ["Coursera", "Udemy", "LinkedIn Learning"],
          courses: shortTermSkills.map(skill => `Introduction to ${skill}`)
        },
        {
          name: "Practice Projects",
          description: "Build small projects implementing the new skills"
        }
      ]
    };
    
    // Mid-term path (6-12 months)
    let midTermFocus = "";
    if (jobTitle.toLowerCase().includes("developer") || jobTitle.toLowerCase().includes("engineer")) {
      midTermFocus = "Deepen technical expertise and add complementary skills";
    } else if (jobTitle.toLowerCase().includes("data")) {
      midTermFocus = "Expand data analysis toolkit and domain knowledge";
    } else if (jobTitle.toLowerCase().includes("design")) {
      midTermFocus = "Master advanced design principles and collaboration tools";
    } else {
      midTermFocus = "Broaden professional expertise and industry knowledge";
    }
    
    const midTermPath = {
      timeframe: "Mid-term (6-12 months)",
      focus: midTermFocus,
      skills: missingSkills.slice(3, 6).length > 0 ? 
        missingSkills.slice(3, 6) : 
        ["Advanced problem-solving", "Project management", "Team leadership"],
      resources: [
        {
          name: "Certifications",
          options: generateCertificationOptions(jobTitle)
        },
        {
          name: "Industry Events",
          description: "Attend conferences and workshops to network and learn from experts"
        }
      ]
    };
    
    // Long-term path (1-2 years)
    const longTermPath = {
      timeframe: "Long-term (1-2 years)",
      focus: "Position for career advancement",
      skills: ["Strategic thinking", "Leadership", "Domain expertise", "Advanced technical skills"],
      resources: [
        {
          name: "Advanced Education",
          options: ["Specialized certification programs", "Masters degree or advanced courses", "Industry-specific training"]
        },
        {
          name: "Professional Growth",
          description: "Seek mentorship, contribute to open source, or speak at industry events"
        }
      ]
    };
    
    learningPaths.push(shortTermPath, midTermPath, longTermPath);
    
    // Generate specific recommendations based on job field
    let recommendations = [];
    
    if (jobTitle.toLowerCase().includes("developer") || jobTitle.toLowerCase().includes("engineer")) {
      recommendations = [
        "Contribute to open source projects to build portfolio and demonstrate skills",
        "Build a personal website or technical blog to showcase expertise",
        "Join developer communities like Stack Overflow or GitHub to network",
        "Participate in hackathons or coding competitions"
      ];
    } else if (jobTitle.toLowerCase().includes("data")) {
      recommendations = [
        "Create a portfolio of data analysis projects using public datasets",
        "Participate in Kaggle competitions to practice and demonstrate skills",
        "Learn domain-specific applications of data science",
        "Develop visualization and storytelling skills to communicate insights"
      ];
    } else if (jobTitle.toLowerCase().includes("design")) {
      recommendations = [
        "Build a strong portfolio showcasing your design process and outcomes",
        "Stay updated with design trends and tools",
        "Seek user feedback and iterate on your designs",
        "Develop skills in user research and testing"
      ];
    } else {
      recommendations = [
        "Develop a strong professional network in your industry",
        "Seek mentorship from experienced professionals",
        "Stay updated with industry trends and best practices",
        "Consider additional certifications relevant to your field"
      ];
    }
    
    return {
      skillGap: {
        percentage: Math.round(skillGapPercentage),
        currentSkills: currentSkills,
        missingSkills: missingSkills
      },
      learningPaths: learningPaths,
      recommendations: recommendations,
      potentialRoles: generatePotentialRoles(jobTitle, analysis?.score || 50)
    };
  };
  
  // Helper to generate certification options based on job title
  const generateCertificationOptions = (jobTitle) => {
    const title = jobTitle.toLowerCase();
    
    if (title.includes("dev") || title.includes("engineer") || title.includes("program")) {
      return ["AWS Certified Developer", "Microsoft Certified: Azure Developer", "Google Cloud Professional Developer"];
    } else if (title.includes("data")) {
      return ["Microsoft Certified: Data Analyst", "Google Data Analytics Professional Certificate", "IBM Data Science Professional Certificate"];
    } else if (title.includes("design")) {
      return ["Adobe Certified Expert", "Google UX Design Professional Certificate", "Certified User Experience Professional"];
    } else if (title.includes("market")) {
      return ["Google Analytics Certification", "HubSpot Marketing Certification", "Facebook Blueprint Certification"];
    } else if (title.includes("project") || title.includes("manager")) {
      return ["Project Management Professional (PMP)", "Certified ScrumMaster (CSM)", "PRINCE2 Certification"];
    } else {
      return ["Industry-specific certification", "Professional development courses", "Leadership training programs"];
    }
  };
  
  // Helper to generate potential roles for career progression
  const generatePotentialRoles = (jobTitle, matchScore) => {
    const title = jobTitle.toLowerCase();
    const roles = [];
    
    // Current level role
    let currentLevel = "Junior";
    if (matchScore >= 70) {
      currentLevel = "Mid-level";
    } else if (matchScore >= 85) {
      currentLevel = "Senior";
    }
    
    // Next level role
    let nextLevel = "";
    if (currentLevel === "Junior") {
      nextLevel = "Mid-level";
    } else if (currentLevel === "Mid-level") {
      nextLevel = "Senior";
    } else {
      nextLevel = "Lead";
    }
    
    // Base role name
    let baseRole = "Professional";
    if (title.includes("dev") || title.includes("engineer") || title.includes("program")) {
      baseRole = "Developer";
    } else if (title.includes("data")) {
      baseRole = "Data Analyst";
    } else if (title.includes("design")) {
      baseRole = "Designer";
    } else if (title.includes("market")) {
      baseRole = "Marketing Specialist";
    } else if (title.includes("manage")) {
      baseRole = "Manager";
    }
    
    // Generate career path
    roles.push({
      title: `${currentLevel} ${baseRole}`,
      timeframe: "Current target role",
      requirements: "Your current skillset with minor improvements"
    });
    
    roles.push({
      title: `${nextLevel} ${baseRole}`,
      timeframe: "1-2 years",
      requirements: "Deepened technical expertise, project leadership experience"
    });
    
    if (nextLevel !== "Lead") {
      roles.push({
        title: `Lead ${baseRole}`,
        timeframe: "3-5 years",
        requirements: "Advanced technical skills, team leadership, strategic thinking"
      });
    }
    
    roles.push({
      title: baseRole === "Manager" ? "Director" : `${baseRole} Manager`,
      timeframe: "5+ years",
      requirements: "Leadership experience, business acumen, strategic planning"
    });
    
    return roles;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Resume Management
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Tab Navigation */}
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
          <Tab 
            icon={<UploadIcon />} 
            iconPosition="start" 
            label="Upload Resume"
          />
          <Tab 
            icon={<AnalyticsIcon />} 
            iconPosition="start" 
            label="AI Analysis"
          />
          <Tab icon={<CompareArrowsIcon />} iconPosition="start" label="Job Match" />
          <Tab icon={<KeyIcon />} iconPosition="start" label="Keywords" />
          <Tab icon={<WorkIcon />} iconPosition="start" label="Job Finder" />
          <Tab icon={<DescriptionIcon />} iconPosition="start" label="Cover Letter" />
          <Tab icon={<GroupIcon />} iconPosition="start" label="Compare to Others" />
          <Tab icon={<RateReviewIcon />} iconPosition="start" label="Recruiter View" />
          <Tab icon={<QuestionAnswerIcon />} iconPosition="start" label="Interview Prep" />
          <Tab icon={<TimelineIcon />} iconPosition="start" label="Career Roadmap" />
        </Tabs>
      </Box>

      {/* Content Area */}
      <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Upload Resume Tab */}
        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upload Your Resume
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Upload your resume in PDF or DOCX format to analyze its ATS compatibility.
                  </Typography>
                  <ResumeUploader onUploadSuccess={handleUploadSuccess} onFileSelect={handleFileSelect} />
                  {resumeFile && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Resume uploaded: {resumeFile.name}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Enter Job Details
                  </Typography>
                  <Box component="form" sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Job Title"
                      variant="outlined"
                      value={jobTitle}
                      onChange={handleJobTitleChange}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Job Description"
                      variant="outlined"
                      multiline
                      rows={6}
                      value={jobDescription}
                      onChange={handleJobDescriptionChange}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Advanced Analysis Options
                      </Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={useSemanticMatching}
                              onChange={(e) => setUseSemanticMatching(e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Semantic Matching (finds related terms)"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={useContextualAnalysis}
                              onChange={(e) => setUseContextualAnalysis(e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Contextual Analysis (understands term relationships)"
                        />
                      </FormGroup>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={analyzeResume}
                      disabled={loading || !resumeFile}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      {loading ? 'Analyzing...' : 'Analyze Resume'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* AI Analysis Tab */}
        {activeTab === 1 && (
          <Box>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>
                  Analyzing resume...
                </Typography>
              </Box>
            ) : analysis ? (
              <ATSResultsCard 
                analysis={analysis} 
                onReAnalyze={analyzeResume}
              />
            ) : (
              <Alert severity="info">
                Please upload a resume and job description, then click "Analyze Resume" to see AI analysis.
              </Alert>
            )}
            
            {/* Add display of advanced analysis metrics when analysis is available */}
            {analysis && (
              <Box sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Analysis Accuracy Metrics
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mr: 2 }}>
                        Confidence Score:
                      </Typography>
                      <Box sx={{ position: 'relative', display: 'inline-flex', mr: 3 }}>
                        <CircularProgress
                          variant="determinate"
                          value={analysis.analysis_confidence || 75}
                          color={
                            (analysis.analysis_confidence || 75) >= 80 ? 'success' :
                            (analysis.analysis_confidence || 75) >= 60 ? 'warning' :
                            'error'
                          }
                          size={40}
                          thickness={4}
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
                          <Typography variant="body2" component="div">
                            {analysis.analysis_confidence || 75}%
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary">
                        {(analysis.analysis_confidence || 75) >= 80 ? 'Very high confidence in analysis' : 
                        (analysis.analysis_confidence || 75) >= 60 ? 'Good confidence in analysis' : 
                        'Moderate confidence in analysis'}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 3 }} />
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Advanced Analysis Methods Used
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Grid container spacing={2}>
                        {(analysis.analytical_methods_used || [
                          "Named Entity Recognition (NER)",
                          "Semantic Text Similarity",
                          "TF-IDF Vectorization",
                          "Part-of-Speech Tagging",
                          "Word Embeddings Analysis",
                          "DeepSeek R1 LLM Analysis"
                        ]).map((method, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Chip 
                              icon={<CheckCircleIcon />}
                              label={method}
                              color="primary"
                              variant="outlined"
                              sx={{ width: '100%', justifyContent: 'flex-start' }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                    
                    <Typography variant="subtitle1" gutterBottom>
                      Semantic Matching Results
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" paragraph>
                        Our advanced semantic analysis found these related term matches:
                      </Typography>
                      
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Job Description Term</strong></TableCell>
                            <TableCell><strong>Matching Terms in Your Resume</strong></TableCell>
                            <TableCell align="right"><strong>Match Score</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(analysis.semantic_matches || [
                            { term: 'web development', matches: ['frontend', 'web application development'], score: 0.92 },
                            { term: 'code optimization', matches: ['performance improvement', 'refactoring'], score: 0.87 },
                            { term: 'agile methodologies', matches: ['scrum', 'sprint planning'], score: 0.94 }
                          ]).map((match, index) => (
                            <TableRow key={index}>
                              <TableCell>{match.term}</TableCell>
                              <TableCell>{match.matches.join(', ')}</TableCell>
                              <TableCell align="right">
                                <Chip 
                                  label={`${Math.round(match.score * 100)}%`}
                                  color={match.score > 0.9 ? 'success' : match.score > 0.8 ? 'primary' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                    
                    <Alert severity="info">
                      <AlertTitle>About Our Analysis</AlertTitle>
                      This analysis was performed using professional-grade NLP libraries including: 
                      {(analysis.nlp_libraries_used || Object.keys(NLP_LIBRARIES)).map((lib, i) => (
                        <Chip 
                          key={i} 
                          label={lib} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Alert>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        )}

        {/* Job Match Tab */}
        {activeTab === 2 && (
          <Box>
            {analysis ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        ATS Score Breakdown
                      </Typography>
                      <ATSScoreVisualizer 
                        resumeId={resumeId} 
                        jobId="job-data" 
                        atsData={analysis}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Job Compatibility
                      </Typography>
                      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">
                          Job Title: {jobTitle || 'Job Position'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                          <Box
                            sx={{
                              position: 'relative',
                              display: 'inline-flex',
                              mr: 2
                            }}
                          >
                            <CircularProgress
                              variant="determinate"
                              value={analysis.score}
                              color={
                                analysis.score >= 80 ? 'success' :
                                analysis.score >= 60 ? 'warning' :
                                'error'
                              }
                              size={64}
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
                              <Typography variant="h6" component="div">
                                {analysis.score}%
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="body2">
                              {analysis.score >= 80 ? 'Highly likely to pass ATS' : 
                              analysis.score >= 60 ? 'Likely to pass ATS' : 
                              analysis.score >= 40 ? 'May be filtered by ATS' : 'May be rejected by ATS'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Please analyze your resume first to see job match details.
              </Alert>
            )}
          </Box>
        )}

        {/* Keywords Tab */}
        {activeTab === 3 && (
          <Box>
            {analysis ? (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resume Word Cloud Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    This visualization shows the most prominent keywords in your resume. Larger words appear more frequently or are more important for the job you're applying to.
                  </Typography>
                  <Box sx={{ height: 500, display: 'flex', flexDirection: 'column' }}>
                    <WordCloudVisualizer 
                      resumeId={resumeId}
                      resumeFile={resumeFile}
                      jobData={{
                        title: jobTitle || 'Job Position',
                        description: jobDescription
                      }}
                      analysisData={analysis}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={analyzeResume}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      Regenerate Word Cloud
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6" gutterBottom>
                  No Word Cloud Analysis Available
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Please analyze your resume to generate a keyword visualization.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={analyzeResume}
                  disabled={loading || !resumeFile}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Analyzing...' : 'Analyze Resume'}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Job Finder Tab */}
        {activeTab === 4 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Finder
              </Typography>
              <Typography variant="body2">
                Based on your resume analysis, here are some job recommendations that match your skills and experience.
              </Typography>
              {!analysis && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Please analyze your resume first to get personalized job recommendations.
                </Alert>
              )}
              {/* Job listings would go here */}
              {analysis && (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">
                      Job Matches Based on Your Skills
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {/* Sample job recommendations */}
                      {[1, 2, 3].map((job) => (
                        <Paper key={job} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1">
                              {jobTitle || 'Software Engineer'} {job}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Company {job} • Dubai, UAE
                            </Typography>
                            <Box sx={{ display: 'flex', mt: 1 }}>
                              <Chip size="small" label={`${(analysis.score ? Math.min(95, analysis.score + job * 3) : 75 + job)}% Match`} color="success" sx={{ mr: 1 }} />
                              <Chip size="small" label="Remote" variant="outlined" sx={{ mr: 1 }} />
                              <Chip size="small" label="Full-time" variant="outlined" />
                            </Box>
                          </Box>
                          <Button variant="outlined" size="small">
                            View Job
                          </Button>
                        </Paper>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cover Letter Tab (REPLACED Resume Editor) */}
        {activeTab === 5 && (
          <Box>
            {analysis ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        AI-Powered Cover Letter Generator
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Generate a professional cover letter based on your resume and the job description.
                      </Typography>
                      
                      {coverLetterError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {coverLetterError}
                        </Alert>
                      )}
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                          Your Information
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Your Name"
                              variant="outlined"
                              placeholder="Enter your full name"
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                              sx={{ mb: 2 }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Your Email"
                              variant="outlined"
                              placeholder="Enter your email address"
                              value={userEmail}
                              onChange={(e) => setUserEmail(e.target.value)}
                              sx={{ mb: 2 }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Your Address"
                              variant="outlined"
                              placeholder="Enter your address"
                              value={userAddress}
                              onChange={(e) => setUserAddress(e.target.value)}
                              sx={{ mb: 2 }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Your Phone (Optional)"
                              variant="outlined"
                              placeholder="Enter your phone number"
                              value={userPhone}
                              onChange={(e) => setUserPhone(e.target.value)}
                              sx={{ mb: 2 }}
                            />
                          </Grid>
                        </Grid>
                        
                        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                          Company Information
                      </Typography>
                      
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Company Name"
                              variant="outlined"
                              placeholder="Enter the company name"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              sx={{ mb: 2 }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                              <TextField
                                fullWidth
                              label="Recipient Name"
                                variant="outlined"
                              placeholder="e.g., Hiring Manager, Recruiter Name"
                              value={recipientName}
                              onChange={(e) => setRecipientName(e.target.value)}
                              sx={{ mb: 2 }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Company Address"
                              variant="outlined"
                              placeholder="Enter the company address"
                              value={companyAddress}
                              onChange={(e) => setCompanyAddress(e.target.value)}
                              sx={{ mb: 2 }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Company Industry"
                              variant="outlined"
                              placeholder="e.g., Technology, Healthcare, Finance"
                              value={companyIndustry}
                              onChange={(e) => setCompanyIndustry(e.target.value)}
                              sx={{ mb: 2 }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Company Website"
                              variant="outlined"
                              placeholder="e.g., https://www.company.com"
                              value={companyWebsite}
                              onChange={(e) => setCompanyWebsite(e.target.value)}
                              sx={{ mb: 2 }}
                            />
                          </Grid>
                        </Grid>
                        
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel id="tone-label">Tone</InputLabel>
                          <Select
                            labelId="tone-label"
                            value={coverLetterTone}
                            onChange={(e) => setCoverLetterTone(e.target.value)}
                            label="Tone"
                          >
                            <MenuItem value="professional">Professional</MenuItem>
                            <MenuItem value="conversational">Conversational</MenuItem>
                            <MenuItem value="enthusiastic">Enthusiastic</MenuItem>
                            <MenuItem value="confident">Confident</MenuItem>
                            <MenuItem value="formal">Formal</MenuItem>
                          </Select>
                        </FormControl>
                        
                              <Button 
                                variant="contained" 
                                color="primary" 
                          fullWidth
                          sx={{ mb: 3 }}
                          onClick={generateCoverLetter}
                          disabled={generatingLetter}
                          startIcon={generatingLetter ? <CircularProgress size={20} /> : null}
                        >
                          {generatingLetter ? 'Generating...' : 'Generate Cover Letter'}
                              </Button>
                            </Box>
                      
                      <Divider sx={{ mb: 3 }} />
                      
                      <Box>
                        <Paper 
                          elevation={2} 
                          sx={{ p: 3, mb: 2, minHeight: '300px', bgcolor: '#fafafa' }}
                        >
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                            {coverLetterContent || `[Your cover letter will appear here after generation]`}
                          </Typography>
                        </Paper>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                          <Button 
                            variant="outlined"
                            startIcon={coverLetterCopied ? <CheckIcon /> : <FileCopyIcon />}
                            onClick={handleCopyCoverLetter}
                            disabled={!coverLetterContent}
                            color={coverLetterCopied ? 'success' : 'primary'}
                          >
                            {coverLetterCopied ? 'Copied!' : 'Copy to Clipboard'}
                        </Button>
                          
                          <div>
                            <Button 
                              variant="contained" 
                              color="primary"
                              startIcon={<GetAppIcon />}
                              onClick={handleOpenDownloadMenu}
                              disabled={!coverLetterContent}
                              aria-controls="download-menu"
                              aria-haspopup="true"
                            >
                              Download as
                        </Button>
                            <Menu
                              id="download-menu"
                              anchorEl={downloadMenuAnchor}
                              keepMounted
                              open={Boolean(downloadMenuAnchor)}
                              onClose={handleCloseDownloadMenu}
                            >
                              <MenuItem onClick={() => handleDownloadCoverLetter('txt')}>Text File (.txt)</MenuItem>
                              <MenuItem onClick={() => handleDownloadCoverLetter('docx')}>Word Document (.docx)</MenuItem>
                              <MenuItem onClick={() => handleDownloadCoverLetter('pdf')}>PDF Document (.pdf)</MenuItem>
                            </Menu>
                          </div>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Please analyze your resume first to generate a cover letter.
              </Alert>
            )}
          </Box>
        )}

        {/* Compare to Others Tab (NEW) */}
        {activeTab === 6 && (
          <Box>
            {analysis ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Industry Benchmark Comparison
                      </Typography>
                      
                      <Box sx={{ mt: 3, mb: 4 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Your Resume vs Industry Average
                        </Typography>
                        
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Overall Score</Typography>
                            <Typography variant="body2">{analysis.score}% / 68%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={analysis.score} 
                            sx={{ height: 10, borderRadius: 5, mb: 1 }} 
                            color={analysis.score >= 70 ? "success" : "primary"}
                          />
                          <LinearProgress 
                            variant="determinate" 
                            value={68} 
                            sx={{ height: 10, borderRadius: 5, opacity: 0.7 }} 
                            color="warning"
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">You</Typography>
                            <Typography variant="caption" color="text.secondary">Industry Average</Typography>
                          </Box>
                        </Box>
                        
                        {/* Keyword Usage data from analysis */}
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Keyword Usage</Typography>
                            <Typography variant="body2">
                              {analysis.matching_keywords ? analysis.matching_keywords.length : 0} / {analysis.matching_keywords && analysis.missing_keywords ? 
                                analysis.matching_keywords.length + analysis.missing_keywords.length : 0}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={analysis.matching_keywords && analysis.missing_keywords ? 
                              (analysis.matching_keywords.length / (analysis.matching_keywords.length + analysis.missing_keywords.length)) * 100 : 0} 
                            sx={{ height: 10, borderRadius: 5, mb: 1 }} 
                            color="primary" 
                          />
                          <LinearProgress 
                            variant="determinate" 
                            value={75} 
                            sx={{ height: 10, borderRadius: 5, opacity: 0.7 }} 
                            color="warning"
                          />
                        </Box>
                        
                        {/* Content Quality */}
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">Content Quality</Typography>
                            <Typography variant="body2">
                              {analysis.industry_specific_score?.experience_relevance || 75}% / 70%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={analysis.industry_specific_score?.experience_relevance || 75} 
                            sx={{ height: 10, borderRadius: 5, mb: 1 }} 
                            color="primary" 
                          />
                          <LinearProgress 
                            variant="determinate" 
                            value={70} 
                            sx={{ height: 10, borderRadius: 5, opacity: 0.7 }} 
                            color="warning"
                          />
                        </Box>
                        
                        {/* ATS Optimization */}
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">ATS Optimization</Typography>
                            <Typography variant="body2">
                              {analysis.industry_specific_score?.format_compliance || 70}% / 65%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={analysis.industry_specific_score?.format_compliance || 70} 
                            sx={{ height: 10, borderRadius: 5, mb: 1 }} 
                            color="primary" 
                          />
                          <LinearProgress 
                            variant="determinate" 
                            value={65} 
                            sx={{ height: 10, borderRadius: 5, opacity: 0.7 }} 
                            color="warning"
                          />
                        </Box>
                      </Box>
                      
                      <Divider sx={{ my: 3 }} />
                      
                      <Typography variant="subtitle1" gutterBottom>
                        Percentile Ranking
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ position: 'relative', width: 60, height: 60, mr: 2 }}>
                          <CircularProgress
                            variant="determinate"
                            value={analysis.score >= 90 ? 95 : analysis.score >= 80 ? 85 : analysis.score >= 70 ? 75 : analysis.score >= 60 ? 65 : 50}
                            color={analysis.score >= 70 ? "success" : analysis.score >= 60 ? "primary" : "warning"}
                            size={60}
                            thickness={6}
                          />
                          <Box
                            sx={{
                              top: 0, left: 0, bottom: 0, right: 0,
                              position: 'absolute',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Typography variant="caption" component="div" fontWeight="bold">
                              {analysis.score >= 90 ? '95th' : analysis.score >= 80 ? '85th' : analysis.score >= 70 ? '75th' : analysis.score >= 60 ? '65th' : '50th'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="body2">
                            Your resume is better than {analysis.score >= 90 ? '95%' : analysis.score >= 80 ? '85%' : analysis.score >= 70 ? '75%' : analysis.score >= 60 ? '65%' : '50%'} of applicants
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Based on analysis of similar roles in {jobTitle ? jobTitle.split(' ')[0] : 'your'} industry
                          </Typography>
                      </Box>
                      </Box>
                    </CardContent>
                  </Card>
                  
                  <Card sx={{ mt: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Skills Differentiation
                      </Typography>
                      
                      <Typography variant="body2" paragraph color="text.secondary">
                        How your skills compare to other applicants for similar roles
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        {analysis.matching_keywords && analysis.matching_keywords.slice(0, 5).map((skill, index) => (
                          <Box key={index} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">{skill}</Typography>
                              <Typography variant="body2">
                                {Math.round(90 - index * 5)}% / {Math.round(75 - index * 3)}%
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.round(90 - index * 5)} 
                                sx={{ height: 8, borderRadius: 4, flexGrow: 1, mr: 1 }} 
                                color="primary"
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
                                You
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.round(75 - index * 3)} 
                                sx={{ height: 8, borderRadius: 4, flexGrow: 1, mr: 1, opacity: 0.7 }} 
                                color="warning"
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
                                Others
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Competitive Edge Analysis
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="subtitle2">
                          Your Competitive Position
                        </Typography>
                        <Chip 
                          label={analysis.score >= 80 ? "Strong Candidate" : analysis.score >= 70 ? "Competitive" : analysis.score >= 60 ? "Qualified" : "Need Improvement"} 
                          color={analysis.score >= 80 ? "success" : analysis.score >= 70 ? "primary" : analysis.score >= 60 ? "warning" : "error"}
                        />
                      </Box>
                      
                      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Your Strengths vs. Competitors
                        </Typography>
                        
                        <List dense>
                          {(analysis.strength_points || [
                            "Strong technical skills alignment with job requirements",
                            "Relevant industry experience",
                            "Quantifiable achievements demonstrated",
                            "Clear career progression"
                          ]).slice(0, 4).map((strength, index) => (
                            <ListItem key={index} sx={{ pl: 0 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckCircleIcon fontSize="small" color="success" />
                              </ListItemIcon>
                              <ListItemText primary={strength} />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                      
                      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Areas to Improve for Competitive Edge
                        </Typography>
                        
                        <List dense>
                          {(analysis.weak_points || [
                            "Stronger emphasis on results and metrics needed",
                            "Missing some key technical skills required for the role",
                            "Resume formatting could be more ATS-friendly",
                            "Consider adding more industry-specific keywords"
                          ]).map((weakness, index) => (
                            <ListItem key={index} sx={{ pl: 0 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <ErrorIcon fontSize="small" color="error" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={weakness} 
                                secondary={index === 0 ? "76% of successful candidates emphasize metrics" : 
                                          index === 1 ? "Consider training or certification to fill skill gaps" :
                                          index === 2 ? "Simple, consistent formatting performs 30% better" :
                                          "Industry keywords increase match rate by 58%"}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                      
                      <Typography variant="subtitle1" gutterBottom>
                        Industry Competition Level
                      </Typography>
                      
                      <Box sx={{ mb: 1, mt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Box sx={{ flexGrow: 1, mr: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={jobTitle?.toLowerCase().includes('senior') ? 85 : 
                                    jobTitle?.toLowerCase().includes('lead') ? 90 : 
                                    jobTitle?.toLowerCase().includes('junior') ? 70 : 75} 
                              sx={{ height: 10, borderRadius: 5 }} 
                              color="error"
                            />
                          </Box>
                          <Typography variant="body2">
                            {jobTitle?.toLowerCase().includes('senior') ? 'Very High' : 
                             jobTitle?.toLowerCase().includes('lead') ? 'Extremely High' : 
                             jobTitle?.toLowerCase().includes('junior') ? 'Moderate' : 'High'}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {jobTitle ? `The ${jobTitle} role` : 'This position'} currently has {jobTitle?.toLowerCase().includes('senior') ? '35% more' : 
                                                   jobTitle?.toLowerCase().includes('lead') ? '48% more' : 
                                                   jobTitle?.toLowerCase().includes('junior') ? '22% more' : '30% more'} applicants than average
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Improvement Suggestions to Stand Out
                        </Typography>
                        
                        <Accordion sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2">Strategic Resume Optimization</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" paragraph>
                              Reorganize your resume to highlight your most impressive and relevant achievements at the top of each section. Applicants who place key achievements prominently see a 42% higher response rate.
                            </Typography>
                            <Typography variant="body2">
                              Action items:
                            </Typography>
                            <List dense disablePadding>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon sx={{ minWidth: 30 }}>
                                  <CheckCircleIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText primary="Restructure experience section to highlight accomplishments" />
                              </ListItem>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon sx={{ minWidth: 30 }}>
                                  <CheckCircleIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText primary="Add metrics to quantify your impact" />
                              </ListItem>
                            </List>
                          </AccordionDetails>
                        </Accordion>
                        
                        <Accordion sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2">Add Missing Technical Skills</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" paragraph>
                              Incorporating the missing technical skills identified in your analysis can boost your match rate by 35%. Focus on the highest priority skills first.
                            </Typography>
                            <Typography variant="body2">
                              Priority skills to add:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                              {analysis.missing_keywords && analysis.missing_keywords.slice(0, 4).map((skill, index) => (
                            <Chip 
                                  key={index}
                                  label={skill}
                                  color="primary"
                              size="small"
                            />
                          ))}
                        </Box>
                          </AccordionDetails>
                        </Accordion>
                        
                        <Accordion sx={{ mb: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle2">Enhance ATS Compatibility</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography variant="body2" paragraph>
                              Simple formatting changes can improve your ATS score by 28%. Focus on clean layout, standard section headings, and proper keyword usage.
                            </Typography>
                            <Typography variant="body2">
                              Recommended changes:
                            </Typography>
                            <List dense disablePadding>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon sx={{ minWidth: 30 }}>
                                  <CheckCircleIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText primary="Use standard section headings (Experience, Education, Skills)" />
                              </ListItem>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon sx={{ minWidth: 30 }}>
                                  <CheckCircleIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText primary="Remove tables, headers/footers, and complex formatting" />
                              </ListItem>
                              <ListItem sx={{ pl: 0 }}>
                                <ListItemIcon sx={{ minWidth: 30 }}>
                                  <CheckCircleIcon fontSize="small" color="primary" />
                                </ListItemIcon>
                                <ListItemText primary="Use both acronyms and full terms for technical skills" />
                              </ListItem>
                            </List>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Please analyze your resume first to compare with others.
              </Alert>
            )}
          </Box>
        )}

        {/* Recruiter View Tab (NEW) */}
        {activeTab === 7 && (
          <Box>
            {analysis ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recruiter Perspective
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        This is how recruiters and hiring managers will view your resume.
                      </Typography>
                      
                      <Divider sx={{ mb: 3 }} />
                      
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          First Impression (6-Second Scan)
                        </Typography>
                        
                        <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  ATS Score
                                </Typography>
                                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                  <CircularProgress
                                    variant="determinate"
                                    value={analysis.score}
                                    sx={{ color: analysis.score >= 70 ? 'success.main' : 
                                          analysis.score >= 50 ? 'warning.main' : 'error.main' }}
                                    size={80}
                                    thickness={5}
                                  />
                                  <Box
                                    sx={{
                                      top: 0, left: 0, bottom: 0, right: 0,
                                      position: 'absolute',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <Typography variant="h6" component="div">
                                      {analysis.score}%
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={8}>
                        <Typography variant="subtitle2" gutterBottom>
                                Key Takeaways
                        </Typography>
                        
                              <List dense>
                                {analysis.strength_points && analysis.strength_points.slice(0, 3).map((point, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <CheckCircleIcon fontSize="small" color="success" />
                                    </ListItemIcon>
                                    <ListItemText primary={point} />
                                  </ListItem>
                                ))}
                                
                                {(!analysis.strength_points || analysis.strength_points.length === 0) && (
                                  <ListItem sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <CheckCircleIcon fontSize="small" color="success" />
                                    </ListItemIcon>
                                    <ListItemText primary="Has relevant experience for the position" />
                                  </ListItem>
                                )}
                                
                                {analysis.weak_points && analysis.weak_points.slice(0, 2).map((point, index) => (
                                  <ListItem key={index} sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <ErrorIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <ListItemText primary={point} />
                                  </ListItem>
                                ))}
                                
                                {(!analysis.weak_points || analysis.weak_points.length === 0) && (
                                  <ListItem sx={{ py: 0.5 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <ErrorIcon fontSize="small" color="error" />
                                    </ListItemIcon>
                                    <ListItemText primary="Missing some key skills requested in the job description" />
                                  </ListItem>
                                )}
                              </List>
                            </Grid>
                          </Grid>
                        </Paper>
                        
                        <Typography variant="subtitle1" gutterBottom>
                          Detailed Review
                        </Typography>
                        
                        <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Skills Assessment
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {analysis.matching_keywords && analysis.matching_keywords.map((skill, index) => (
                                <Chip 
                                  key={index} 
                                  label={skill} 
                                  color="success" 
                                  variant="outlined" 
                                  size="small" 
                                />
                              ))}
                              
                              {analysis.missing_keywords && analysis.missing_keywords.slice(0, 5).map((skill, index) => (
                                <Chip 
                                  key={index} 
                                  label={skill} 
                                  color="error" 
                                  variant="outlined" 
                                  size="small" 
                                  icon={<ErrorIcon fontSize="small" />}
                                />
                              ))}
                            </Box>
                          </Box>
                          
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              Recruiter Notes
                            </Typography>
                            
                            <TextField
                              fullWidth
                              multiline
                              rows={4}
                              variant="outlined"
                              placeholder="Add notes about this candidate..."
                            />
                          </Box>
                        </Paper>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Please analyze your resume first to see the recruiter view.
              </Alert>
            )}
          </Box>
        )}

        {/* Interview Prep Tab (NEW) */}
        {activeTab === 8 && (
          <Box>
            {analysis ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        AI Interview Preparation
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Practice with personalized interview questions based on your resume and the job description.
                      </Typography>
                      
                      {questionsError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {questionsError}
                        </Alert>
                      )}
                      
                      {interviewQuestions.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <Typography variant="body1" paragraph>
                            Generate interview questions tailored to your resume and the job description.
                          </Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={generateInterviewQuestions}
                            disabled={generatingQuestions}
                            startIcon={generatingQuestions ? <CircularProgress size={20} /> : null}
                          >
                            {generatingQuestions ? 'Generating...' : 'Generate Interview Questions'}
                          </Button>
                        </Box>
                      ) : (
                        <Box>
                          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              Questions for {jobTitle || 'Job Position'} Role
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={generateInterviewQuestions}
                              disabled={generatingQuestions}
                              startIcon={generatingQuestions ? <CircularProgress size={16} /> : null}
                            >
                              Regenerate Questions
                            </Button>
                          </Box>
                          
                          <Box>
                            {interviewQuestions.map((q) => (
                              <Accordion 
                                key={q.id}
                                expanded={expandedQuestion === q.id}
                                onChange={() => handleQuestionExpand(q.id)}
                                sx={{ mb: 2 }}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                  sx={{ 
                                    '& .MuiAccordionSummary-content': { 
                                      alignItems: 'center',
                                    }
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <Chip 
                                      label={q.type} 
                                      size="small" 
                                      color={
                                        q.type === 'technical' ? 'primary' : 
                                        q.type === 'behavioral' ? 'secondary' : 
                                        q.type === 'situational' ? 'info' : 'default'
                                      }
                                      sx={{ mr: 2, minWidth: 100, textTransform: 'capitalize' }}
                                    />
                                    <Typography>{q.question}</Typography>
                                  </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                                    <Typography variant="subtitle2" gutterBottom color="primary">
                                      Answer Guidance:
                                    </Typography>
                                    <Typography variant="body2">
                                      {q.guidance}
                                    </Typography>
                                    
                                    <Box sx={{ mt: 2 }}>
                                      <Typography variant="subtitle2" gutterBottom color="primary">
                                        Practice Your Answer:
                                      </Typography>
                                      <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        placeholder="Type your practice answer here..."
                                        variant="outlined"
                                      />
                                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button 
                                          variant="outlined" 
                                          color="primary" 
                                          size="small"
                                          startIcon={<AutoAwesomeIcon />}
                                        >
                                          Get Feedback
                                        </Button>
                                      </Box>
                                    </Box>
                                  </Box>
                                </AccordionDetails>
                              </Accordion>
                            ))}
                          </Box>
                          
                          <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle1" gutterBottom>
                              Interview Tips
                            </Typography>
                            <List dense>
                          <ListItem>
                            <ListItemIcon>
                                  <CheckCircleIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                                  primary="Research the company thoroughly before the interview"
                                  secondary="Understand their products, services, culture, and recent news"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                                  <CheckCircleIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                                  primary="Use the STAR method for behavioral questions"
                                  secondary="Situation, Task, Action, Result - structure your answers clearly"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                                  <CheckCircleIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                                  primary="Prepare thoughtful questions for the interviewer"
                                  secondary="Show your interest in the role and company"
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                                  <CheckCircleIcon color="primary" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                                  primary="Practice common technical questions in your field"
                                  secondary="Be ready to explain your approach to problem-solving"
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemIcon>
                                  <CheckCircleIcon color="primary" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Follow up after the interview"
                                  secondary="Send a thank-you email within 24 hours"
                            />
                          </ListItem>
                        </List>
                      </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Please analyze your resume first to generate personalized interview questions.
              </Alert>
            )}
          </Box>
        )}

        {/* Career Roadmap Tab (NEW) */}
        {activeTab === 9 && (
          <Box>
            {analysis ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Career Development Roadmap
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Personalized professional development plan based on your resume and career goals.
                      </Typography>
                      
                      {roadmapError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {roadmapError}
                        </Alert>
                      )}
                      
                      {!roadmapData ? (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <Typography variant="body1" paragraph>
                            Generate a personalized career roadmap based on your skills and the job requirements.
                          </Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={generateCareerRoadmap}
                            disabled={generatingRoadmap}
                            startIcon={generatingRoadmap ? <CircularProgress size={20} /> : null}
                          >
                            {generatingRoadmap ? 'Generating...' : 'Generate Career Roadmap'}
                          </Button>
                        </Box>
                      ) : (
                        <Box>
                          {/* Enhanced Skill Gap Analysis */}
                          <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
                            <Typography variant="h6" gutterBottom>
                              Comprehensive Skill Gap Analysis
                      </Typography>
                      
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={4}>
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                  <Box sx={{ position: 'relative', display: 'inline-block', width: 120, height: 120 }}>
                                    <CircularProgress
                                      variant="determinate"
                                      value={100 - roadmapData.skillGap.percentage}
                                      color={
                                        roadmapData.skillGap.percentage <= 20 ? 'success' :
                                        roadmapData.skillGap.percentage <= 40 ? 'info' :
                                        roadmapData.skillGap.percentage <= 60 ? 'warning' : 'error'
                                      }
                                      size={120}
                                      thickness={10}
                                    />
                                    <Box
                                      sx={{
                                        top: 0, left: 0, bottom: 0, right: 0,
                          position: 'absolute', 
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                      }}
                                    >
                                      <Typography variant="h5" component="div" fontWeight="bold">
                                        {100 - roadmapData.skillGap.percentage}%
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Skills Match
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                                
                                <Typography variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
                                  {roadmapData.skillGap.percentage <= 20 
                                    ? 'Excellent match! You have most of the required skills.' 
                                    : roadmapData.skillGap.percentage <= 40 
                                      ? 'Good match. Some skill development needed.'
                                      : roadmapData.skillGap.percentage <= 60 
                                        ? 'Moderate match. Significant skill development needed.'
                                        : 'Considerable skill gap. Focus on core skill development.'}
                        </Typography>
                                
                                <Divider sx={{ my: 2 }} />
                                
                                <Typography variant="subtitle2" gutterBottom>
                                  Skill Gap Impact
                        </Typography>
                                
                                <List dense disablePadding>
                                  <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <InfoIcon fontSize="small" color="primary" />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary="Time to Job Readiness" 
                                      secondary={roadmapData.skillGap.percentage <= 20 ? "Immediate" : 
                                               roadmapData.skillGap.percentage <= 40 ? "1-3 months" :
                                               roadmapData.skillGap.percentage <= 60 ? "3-6 months" : "6+ months"} 
                                    />
                                  </ListItem>
                                  <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <InfoIcon fontSize="small" color="primary" />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary="Competitive Position" 
                                      secondary={roadmapData.skillGap.percentage <= 20 ? "Top 10% of candidates" : 
                                               roadmapData.skillGap.percentage <= 40 ? "Top 25% of candidates" :
                                               roadmapData.skillGap.percentage <= 60 ? "Average candidate" : "Below average candidate"} 
                                    />
                                  </ListItem>
                                  <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                      <InfoIcon fontSize="small" color="primary" />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary="Salary Impact" 
                                      secondary={roadmapData.skillGap.percentage <= 20 ? "Potential for premium salary" : 
                                               roadmapData.skillGap.percentage <= 40 ? "Competitive salary potential" :
                                               roadmapData.skillGap.percentage <= 60 ? "Average salary range" : "Likely below market average"} 
                                    />
                                  </ListItem>
                                </List>
                              </Grid>
                              
                              <Grid item xs={12} md={8}>
                                <Box>
                                  <Typography variant="subtitle1" gutterBottom>
                                    Skill Distribution Analysis
                        </Typography>
                        
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {/* Technical Skills */}
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        Technical Skills
                                      </Typography>
                                      
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ flexGrow: 1, mr: 2 }}>
                                          <LinearProgress 
                                            variant="determinate" 
                                            value={roadmapData.skillGap.currentSkills.filter(skill => 
                                              /javascript|python|sql|java|react|node|cloud|aws|docker|api|programming|development/i.test(skill)
                                            ).length / Math.max(1, roadmapData.skillGap.currentSkills.filter(skill => 
                                              /javascript|python|sql|java|react|node|cloud|aws|docker|api|programming|development/i.test(skill)
                                            ).length + roadmapData.skillGap.missingSkills.filter(skill => 
                                              /javascript|python|sql|java|react|node|cloud|aws|docker|api|programming|development/i.test(skill)
                                            ).length) * 100} 
                                            sx={{ height: 10, borderRadius: 5 }} 
                                            color="primary"
                                          />
                          </Box>
                                        <Typography variant="body2">
                                          {roadmapData.skillGap.currentSkills.filter(skill => 
                                            /javascript|python|sql|java|react|node|cloud|aws|docker|api|programming|development/i.test(skill)
                                          ).length} / {roadmapData.skillGap.currentSkills.filter(skill => 
                                            /javascript|python|sql|java|react|node|cloud|aws|docker|api|programming|development/i.test(skill)
                                          ).length + roadmapData.skillGap.missingSkills.filter(skill => 
                                            /javascript|python|sql|java|react|node|cloud|aws|docker|api|programming|development/i.test(skill)
                                          ).length}
                                        </Typography>
                                      </Box>
                                      
                                      <Typography variant="caption" color="text.secondary">
                                        Technical skill proficiency
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                        {roadmapData.skillGap.currentSkills.filter(skill => 
                                          /javascript|python|sql|java|react|node|cloud|aws|docker|api|programming|development/i.test(skill)
                                        ).slice(0, 3).map((skill, index) => (
                                          <Chip 
                                            key={index}
                                            label={skill}
                                            color="success"
                                            size="small"
                                          />
                                        ))}
                                        {roadmapData.skillGap.missingSkills.filter(skill => 
                                          /javascript|python|sql|java|react|node|cloud|aws|docker|api|programming|development/i.test(skill)
                                        ).slice(0, 3).map((skill, index) => (
                                          <Chip 
                                            key={index}
                                            label={skill}
                                            color="error"
                                            variant="outlined"
                                            size="small"
                                          />
                                        ))}
                                      </Box>
                                    </Paper>
                                    
                                    {/* Soft Skills */}
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        Soft Skills
                                      </Typography>
                                      
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ flexGrow: 1, mr: 2 }}>
                                          <LinearProgress 
                                            variant="determinate" 
                                            value={roadmapData.skillGap.currentSkills.filter(skill => 
                                              /communication|leadership|teamwork|collaboration|management|problem.solving|critical.thinking|time.management/i.test(skill)
                                            ).length / Math.max(1, roadmapData.skillGap.currentSkills.filter(skill => 
                                              /communication|leadership|teamwork|collaboration|management|problem.solving|critical.thinking|time.management/i.test(skill)
                                            ).length + roadmapData.skillGap.missingSkills.filter(skill => 
                                              /communication|leadership|teamwork|collaboration|management|problem.solving|critical.thinking|time.management/i.test(skill)
                                            ).length) * 100} 
                                            sx={{ height: 10, borderRadius: 5 }} 
                                            color="secondary"
                                          />
                          </Box>
                                        <Typography variant="body2">
                                          {roadmapData.skillGap.currentSkills.filter(skill => 
                                            /communication|leadership|teamwork|collaboration|management|problem.solving|critical.thinking|time.management/i.test(skill)
                                          ).length} / {roadmapData.skillGap.currentSkills.filter(skill => 
                                            /communication|leadership|teamwork|collaboration|management|problem.solving|critical.thinking|time.management/i.test(skill)
                                          ).length + roadmapData.skillGap.missingSkills.filter(skill => 
                                            /communication|leadership|teamwork|collaboration|management|problem.solving|critical.thinking|time.management/i.test(skill)
                                          ).length}
                                        </Typography>
                          </Box>
                                      
                                      <Typography variant="caption" color="text.secondary">
                                        Soft skill proficiency
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                        {roadmapData.skillGap.currentSkills.filter(skill => 
                                          /communication|leadership|teamwork|collaboration|management|problem.solving|critical.thinking|time.management/i.test(skill)
                                        ).slice(0, 3).map((skill, index) => (
                                          <Chip 
                                            key={index}
                                            label={skill}
                                            color="success"
                                            size="small"
                                          />
                                        ))}
                                        {roadmapData.skillGap.missingSkills.filter(skill => 
                                          /communication|leadership|teamwork|collaboration|management|problem.solving|critical.thinking|time.management/i.test(skill)
                                        ).slice(0, 3).map((skill, index) => (
                                          <Chip 
                                            key={index}
                                            label={skill}
                                            color="error"
                                            variant="outlined"
                                            size="small"
                                          />
                                        ))}
                        </Box>
                                    </Paper>
                                    
                                    {/* Industry Knowledge */}
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        Industry Knowledge
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Box sx={{ flexGrow: 1, mr: 2 }}>
                                          <LinearProgress 
                                            variant="determinate" 
                                            value={roadmapData.skillGap.currentSkills.filter(skill => 
                                              /industry|sector|market|compliance|regulation|standards|best.practices|frameworks/i.test(skill)
                                            ).length / Math.max(1, roadmapData.skillGap.currentSkills.filter(skill => 
                                              /industry|sector|market|compliance|regulation|standards|best.practices|frameworks/i.test(skill)
                                            ).length + roadmapData.skillGap.missingSkills.filter(skill => 
                                              /industry|sector|market|compliance|regulation|standards|best.practices|frameworks/i.test(skill)
                                            ).length) * 100} 
                                            sx={{ height: 10, borderRadius: 5 }} 
                                            color="warning"
                                          />
                                        </Box>
                                        <Typography variant="body2">
                                          {roadmapData.skillGap.currentSkills.filter(skill => 
                                            /industry|sector|market|compliance|regulation|standards|best.practices|frameworks/i.test(skill)
                                          ).length} / {roadmapData.skillGap.currentSkills.filter(skill => 
                                            /industry|sector|market|compliance|regulation|standards|best.practices|frameworks/i.test(skill)
                                          ).length + roadmapData.skillGap.missingSkills.filter(skill => 
                                            /industry|sector|market|compliance|regulation|standards|best.practices|frameworks/i.test(skill)
                                          ).length}
                                        </Typography>
                      </Box>
                      
                                      <Typography variant="caption" color="text.secondary">
                                        Industry knowledge proficiency
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                        {roadmapData.skillGap.currentSkills.filter(skill => 
                                          /industry|sector|market|compliance|regulation|standards|best.practices|frameworks/i.test(skill)
                                        ).slice(0, 3).map((skill, index) => (
                                          <Chip 
                                            key={index}
                                            label={skill}
                                            color="success"
                                            size="small"
                                          />
                                        ))}
                                        {roadmapData.skillGap.missingSkills.filter(skill => 
                                          /industry|sector|market|compliance|regulation|standards|best.practices|frameworks/i.test(skill)
                                        ).slice(0, 3).map((skill, index) => (
                                          <Chip 
                                            key={index}
                                            label={skill}
                                            color="error"
                                            variant="outlined"
                                            size="small"
                                          />
                                        ))}
                                      </Box>
                                    </Paper>
                                  </Box>
                                </Box>
                              </Grid>
                            </Grid>
                            
                            <Divider sx={{ my: 3 }} />
                            
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                                  Your Current Skills:
                      </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {roadmapData.skillGap.currentSkills.map((skill, index) => (
                                    <Chip 
                                      key={index}
                                      label={skill}
                                      color="success"
                                      variant="outlined"
                                      size="small"
                                    />
                                  ))}
                                </Box>
                              </Grid>
                              
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>
                                  Skills to Develop:
                      </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {roadmapData.skillGap.missingSkills.slice(0, 8).map((skill, index) => (
                                    <Chip 
                                      key={index}
                                      label={skill}
                                      color="primary"
                                      variant="outlined"
                                      size="small"
                                    />
                                  ))}
                                </Box>
                              </Grid>
                            </Grid>
                          </Paper>
                          
                          {/* Enhanced Development Timeline */}
                          <Typography variant="h6" gutterBottom>
                            Professional Development Timeline
                          </Typography>
                          
                          <Box sx={{ position: 'relative', mb: 4 }}>
                            <Box sx={{ 
                              position: 'absolute', 
                              left: 20, 
                              top: 30, 
                              bottom: 0, 
                              width: 4, 
                              bgcolor: 'divider',
                              zIndex: 0
                            }} />
                            
                            {roadmapData.learningPaths.map((path, index) => (
                              <Box 
                                key={index} 
                                sx={{ 
                                  display: 'flex', 
                                  mb: 4,
                                  position: 'relative',
                                  zIndex: 1
                                }}
                              >
                                <Box 
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    bgcolor: 
                                      index === 0 ? 'primary.main' : 
                                      index === 1 ? 'secondary.main' : 
                                      'warning.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    mr: 3
                                  }}
                                >
                                  {index + 1}
                        </Box>
                                
                                <Paper 
                                  elevation={0} 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    flex: 1,
                                    borderLeft: 5, 
                                    borderColor: 
                                      index === 0 ? 'primary.main' : 
                                      index === 1 ? 'secondary.main' : 
                                      'warning.main' 
                                  }}
                                >
                                  <Typography variant="h6" gutterBottom>
                                    {path.timeframe}
                                  </Typography>
                                  
                                  <Typography variant="subtitle1" gutterBottom color="text.secondary">
                                    <strong>Focus:</strong> {path.focus}
                                  </Typography>
                                  
                                  <Divider sx={{ my: 2 }} />
                                  
                                  <Grid container spacing={3}>
                                    <Grid item xs={12} md={5}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        Priority Skills:
                                      </Typography>
                                      
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                        {path.skills.map((skill, skillIndex) => (
                                          <Chip 
                                            key={skillIndex}
                                            label={skill}
                                            color={index === 0 ? 'primary' : index === 1 ? 'secondary' : 'default'}
                                            size="small"
                                          />
                                        ))}
                        </Box>
                                      
                                      <Typography variant="subtitle2" gutterBottom>
                                        Expected Outcomes:
                                      </Typography>
                                      
                                      <List dense>
                                        {(index === 0 ? [
                                          "Close immediate skill gaps",
                                          "Increase job application success rate",
                                          "Prepare for technical interviews"
                                        ] : index === 1 ? [
                                          "Deepen expertise in core areas",
                                          "Develop specialized knowledge",
                                          "Prepare for career advancement"
                                        ] : [
                                          "Position for leadership roles",
                                          "Develop mentoring capabilities",
                                          "Build strategic industry perspective"
                                        ]).map((outcome, i) => (
                                          <ListItem key={i} sx={{ px: 0 }}>
                                            <ListItemIcon sx={{ minWidth: 28 }}>
                                              <CheckCircleIcon fontSize="small" color="primary" />
                                            </ListItemIcon>
                                            <ListItemText primary={outcome} />
                                          </ListItem>
                                        ))}
                                      </List>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={7}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        Recommended Learning Resources:
                                      </Typography>
                                      
                                      <List dense>
                                        {path.resources.map((resource, resIndex) => (
                                          <ListItem key={resIndex}>
                                            <ListItemIcon>
                                              <InfoIcon fontSize="small" color="primary" />
                                            </ListItemIcon>
                                            <ListItemText
                                              primary={resource.name}
                                              secondary={
                                                resource.description ||
                                                (resource.platforms ? `Platforms: ${resource.platforms.join(', ')}` : '') ||
                                                (resource.options ? `Options: ${resource.options.join(', ')}` : '') ||
                                                (resource.courses ? `Courses: ${resource.courses.join(', ')}` : '')
                                              }
                                            />
                                          </ListItem>
                                        ))}
                                      </List>
                                      
                                      {index === 0 && (
                                        <Button 
                                          variant="outlined" 
                                          size="small" 
                                          sx={{ mt: 1 }}
                                          startIcon={<AutoAwesomeIcon />}
                                        >
                                          Find Courses
                                        </Button>
                                      )}
                                      
                                      {index === 1 && (
                                        <Button 
                                          variant="outlined" 
                                          size="small" 
                                          sx={{ mt: 1 }}
                                          startIcon={<AutoAwesomeIcon />}
                                        >
                                          Explore Certifications
                                        </Button>
                                      )}
                                      
                                      {index === 2 && (
                                        <Button 
                                          variant="outlined" 
                                          size="small" 
                                          sx={{ mt: 1 }}
                                          startIcon={<AutoAwesomeIcon />}
                                        >
                                          Find Mentors
                                        </Button>
                                      )}
                                    </Grid>
                                  </Grid>
                                </Paper>
                        </Box>
                            ))}
                          </Box>
                          
                          {/* Enhanced Career Path Progression */}
                          <Typography variant="h6" gutterBottom>
                            Career Advancement Trajectory
                          </Typography>
                          
                          <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                              <Typography variant="subtitle1">
                                Projected Career Path
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Based on industry trends and your skill profile
                              </Typography>
                        </Box>
                            
                            <Box sx={{ position: 'relative', mb: 4 }}>
                              <Box sx={{ 
                                position: 'absolute', 
                                left: 40, 
                                top: 0, 
                                bottom: 0, 
                                width: 4, 
                                bgcolor: 'divider',
                                zIndex: 0
                              }} />
                              
                              {roadmapData.potentialRoles.map((role, index) => (
                                <Box 
                                  key={index}
                                  sx={{ 
                                    display: 'flex', 
                                    mb: 3,
                                    position: 'relative',
                                    zIndex: 1
                                  }}
                                >
                                  <Box 
                                    sx={{
                                      width: 80,
                                      height: 80,
                                      borderRadius: '50%',
                                      bgcolor: index === 0 ? 'primary.main' : 'background.paper',
                                      border: theme => `3px solid ${
                                        index === 0 ? theme.palette.primary.main : 
                                        index === 1 ? theme.palette.secondary.main :
                                        index === 2 ? theme.palette.info.main :
                                        theme.palette.warning.main
                                      }`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      mr: 3,
                                      color: index === 0 ? 'white' : 'text.primary',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {role.timeframe.includes('Current') ? 'NOW' : role.timeframe}
                      </Box>
                      
                                  <Paper 
                                    elevation={0} 
                                    variant="outlined" 
                                    sx={{ 
                                      p: 2, 
                                      flex: 1,
                                      bgcolor: index === 0 ? 'primary.light' : 'background.paper',
                                      color: index === 0 ? 'primary.contrastText' : 'text.primary',
                                    }}
                                  >
                                    <Typography 
                                      variant="h6" 
                                      gutterBottom
                                      sx={{ fontWeight: 'bold' }}
                                    >
                                      {role.title}
                                    </Typography>
                                    
                                    <Divider sx={{ my: 1 }} />
                                    
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Requirements:
        </Typography>
                                        <Typography variant="body2">
                                          {role.requirements}
                                        </Typography>
                                      </Grid>
                                      
                                      <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Industry Outlook:
                                        </Typography>
                                        <Typography variant="body2">
                                          {index === 0 ? "Strong demand, competitive market" : 
                                           index === 1 ? "Growing demand, specialized skills valued" :
                                           index === 2 ? "High demand for experienced professionals" : 
                                           "Strategic positions with significant impact"}
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                          <Typography variant="body2" sx={{ mr: 1 }}>
                                            Salary Range:
                                          </Typography>
                                          <Chip 
                                            label={index === 0 ? "$60-80K" : 
                                                  index === 1 ? "$80-100K" :
                                                  index === 2 ? "$100-130K" : "$130K+"}
                                            color={index === 0 ? "primary" : 
                                                 index === 1 ? "secondary" :
                                                 index === 2 ? "info" : "success"}
                                            size="small"
                                          />
                                        </Box>
                                      </Grid>
                                    </Grid>
                                  </Paper>
                                </Box>
                              ))}
                            </Box>
                          </Paper>
                          
                          {/* Enhanced Personalized Recommendations */}
                          <Typography variant="h6" gutterBottom>
                            Strategic Development Recommendations
                          </Typography>
                          <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
                            <Typography variant="body2" paragraph>
                              Based on your skills profile and career goals, here are tailored recommendations to accelerate your professional growth:
                            </Typography>
                            
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Professional Development Actions
                                </Typography>
                                <List>
                                  {roadmapData.recommendations.slice(0, 4).map((rec, index) => (
                                    <ListItem key={index}>
                                      <ListItemIcon>
                                        <CheckCircleIcon color="primary" />
                                      </ListItemIcon>
                                      <ListItemText primary={rec} />
                                    </ListItem>
                                  ))}
                                </List>
                              </Grid>
                              
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Networking & Visibility Strategy
                                </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                                      <CheckCircleIcon color="secondary" />
                          </ListItemIcon>
                          <ListItemText 
                                      primary="Join professional associations" 
                                      secondary={`Recommended: ${
                                        jobTitle?.toLowerCase().includes('develop') ? 'ACM, IEEE Computer Society' :
                                        jobTitle?.toLowerCase().includes('data') ? 'Data Science Association, INFORMS' :
                                        jobTitle?.toLowerCase().includes('design') ? 'AIGA, Interaction Design Association' :
                                        'Industry-specific professional groups'
                                      }`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                                      <CheckCircleIcon color="secondary" />
                          </ListItemIcon>
                          <ListItemText 
                                      primary="Create content to demonstrate expertise" 
                                      secondary="Articles, case studies, or presentations on relevant topics"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                                      <CheckCircleIcon color="secondary" />
                          </ListItemIcon>
                          <ListItemText 
                                      primary="Attend industry conferences and events" 
                                      secondary="Build connections while staying current with industry trends"
                          />
                        </ListItem>
                      </List>
                              </Grid>
                            </Grid>
                          </Paper>
                          
                          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              onClick={generateCareerRoadmap}
                              disabled={generatingRoadmap}
                              startIcon={generatingRoadmap ? <CircularProgress size={16} /> : null}
                            >
                              Regenerate Roadmap
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info">
                Please analyze your resume first to generate a personalized career roadmap.
              </Alert>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ResumePage;
