import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Autocomplete,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import SearchIcon from '@mui/icons-material/Search';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WorkIcon from '@mui/icons-material/Work';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FilterListIcon from '@mui/icons-material/FilterList';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import TimerIcon from '@mui/icons-material/Timer';
import PersonIcon from '@mui/icons-material/Person';
import FaceIcon from '@mui/icons-material/Face';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CodeIcon from '@mui/icons-material/Code';

const InterviewPrepGuide = ({
  jobTitle = '',
  industry = '',
  experienceLevel = 'mid',
  questionCategories = [],
  savedQuestions = [],
  loading = false,
  onSearch,
  onSaveQuestion,
  onGeneratePracticeAnswer,
  onGenerateCustomQuestions
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [customJobTitle, setCustomJobTitle] = useState(jobTitle);
  const [customIndustry, setCustomIndustry] = useState(industry);
  const [customExperienceLevel, setCustomExperienceLevel] = useState(experienceLevel);
  const [customizationLoading, setCustomizationLoading] = useState(false);
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [generatedAnswer, setGeneratedAnswer] = useState('');
  const [showTechnicalOnly, setShowTechnicalOnly] = useState(false);
  
  // Example questions data (in a real app this would come from props or API)
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "Tell me about yourself",
      category: "behavioral",
      difficulty: "easy",
      isCommon: true,
      tips: "Keep it professional and relevant to the job. Focus on career highlights and strengths.",
      idealAnswer: "Start with current role, then highlight 2-3 achievements, mention relevant skills, and explain why you're interested in this position.",
      isSaved: false,
      isTechnical: false
    },
    {
      id: 2,
      question: "What is your greatest strength?",
      category: "behavioral",
      difficulty: "easy",
      isCommon: true,
      tips: "Choose a strength that is relevant to the position. Provide specific examples to back it up.",
      idealAnswer: "Identify a strength aligned with the job, provide a concrete example of using it, and explain how it benefited your employer.",
      isSaved: false,
      isTechnical: false
    },
    {
      id: 3,
      question: "What are closures in JavaScript?",
      category: "technical",
      difficulty: "medium",
      isCommon: true,
      tips: "Focus on the concept of lexical scoping and data encapsulation.",
      idealAnswer: "A closure is the combination of a function and the lexical environment within which that function was declared. This environment consists of variables that were in scope at the time the closure was created. Closures allow a function to access variables from its outer scope even after that scope has closed.",
      isSaved: false,
      isTechnical: true
    },
    {
      id: 4,
      question: "Explain the differences between REST and GraphQL",
      category: "technical",
      difficulty: "medium",
      isCommon: true,
      tips: "Discuss the architecture style, data fetching capabilities, and use cases for both.",
      idealAnswer: "REST is an architectural style that uses standard HTTP methods, while GraphQL is a query language that allows clients to request exactly the data they need. REST typically requires multiple endpoints for different resources, while GraphQL uses a single endpoint. REST may lead to over-fetching or under-fetching data, while GraphQL solves this by letting clients specify their data requirements precisely.",
      isSaved: false,
      isTechnical: true
    },
    {
      id: 5,
      question: "Describe a challenging situation at work and how you handled it",
      category: "behavioral",
      difficulty: "medium",
      isCommon: true,
      tips: "Use the STAR method: Situation, Task, Action, Result.",
      idealAnswer: "Choose a relevant challenge, briefly describe the situation and your role, explain your approach, and highlight the positive outcome and what you learned.",
      isSaved: false,
      isTechnical: false
    }
  ]);

  // Update questions when savedQuestions changes
  useEffect(() => {
    setQuestions(prevQuestions => {
      return prevQuestions.map(q => ({
        ...q,
        isSaved: savedQuestions.includes(q.id)
      }));
    });
  }, [savedQuestions]);

  // Handle search and filter
  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        query: searchQuery,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        technicalOnly: showTechnicalOnly
      });
    }
  };

  // Handle question expansion toggle
  const handleQuestionExpand = (questionId) => {
    setExpandedQuestionId(expandedQuestionId === questionId ? null : questionId);
  };

  // Handle saving a question
  const handleSaveQuestion = (questionId) => {
    if (onSaveQuestion) {
      onSaveQuestion(questionId);
    } else {
      // Local state handling for demo purposes
      setQuestions(prevQuestions => 
        prevQuestions.map(q => 
          q.id === questionId ? { ...q, isSaved: !q.isSaved } : q
        )
      );
    }
  };

  // Generate custom questions
  const handleGenerateCustomQuestions = () => {
    setCustomizationLoading(true);
    if (onGenerateCustomQuestions) {
      onGenerateCustomQuestions({
        jobTitle: customJobTitle,
        industry: customIndustry,
        experienceLevel: customExperienceLevel
      }).then(() => {
        setCustomizationLoading(false);
        setShowCustomizeDialog(false);
      });
    } else {
      // Simulate API call for demo
      setTimeout(() => {
        setCustomizationLoading(false);
        setShowCustomizeDialog(false);
      }, 1500);
    }
  };

  // Generate practice answer for a question
  const handleGenerateAnswer = (question) => {
    setSelectedQuestion(question);
    setGeneratingAnswer(true);
    setAnswerDialogOpen(true);
    
    if (onGeneratePracticeAnswer) {
      onGeneratePracticeAnswer(question.id)
        .then(answer => {
          setGeneratedAnswer(answer);
          setGeneratingAnswer(false);
        });
    } else {
      // Simulate API call for demo
      setTimeout(() => {
        setGeneratedAnswer(
          question.idealAnswer + 
          "\n\nAdditional context: When answering this question, remember to be specific and use real examples from your experience. Quantify your achievements when possible."
        );
        setGeneratingAnswer(false);
      }, 2000);
    }
  };

  // Copy answer to clipboard
  const handleCopyAnswer = () => {
    navigator.clipboard.writeText(generatedAnswer);
  };

  // Filter questions based on current filters
  const getFilteredQuestions = () => {
    return questions.filter(question => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        question.question.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by category
      const matchesCategory = selectedCategory === 'all' || 
        question.category === selectedCategory;
      
      // Filter by difficulty
      const matchesDifficulty = selectedDifficulty === 'all' || 
        question.difficulty === selectedDifficulty;
      
      // Filter by technical flag
      const matchesTechnical = !showTechnicalOnly || question.isTechnical;
      
      // Filter by active tab
      const matchesTab = activeTabIndex === 0 || 
        (activeTabIndex === 1 && question.isSaved);
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesTechnical && matchesTab;
    });
  };

  // Render the customize dialog
  const renderCustomizeDialog = () => (
    <Dialog 
      open={showCustomizeDialog} 
      onClose={() => setShowCustomizeDialog(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        Customize Interview Questions
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Title"
              value={customJobTitle}
              onChange={(e) => setCustomJobTitle(e.target.value)}
              margin="normal"
              placeholder="e.g. Frontend Developer"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Industry"
              value={customIndustry}
              onChange={(e) => setCustomIndustry(e.target.value)}
              margin="normal"
              placeholder="e.g. Technology"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Experience Level</InputLabel>
              <Select
                value={customExperienceLevel}
                onChange={(e) => setCustomExperienceLevel(e.target.value)}
                label="Experience Level"
              >
                <MenuItem value="entry">Entry Level</MenuItem>
                <MenuItem value="mid">Mid Level</MenuItem>
                <MenuItem value="senior">Senior Level</MenuItem>
                <MenuItem value="lead">Lead / Management</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              We'll generate custom interview questions tailored to this specific job, industry, and experience level.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowCustomizeDialog(false)}>
          Cancel
        </Button>
        <Button 
          variant="contained"
          onClick={handleGenerateCustomQuestions}
          disabled={customizationLoading}
          startIcon={customizationLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
        >
          Generate Questions
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Render the answer dialog
  const renderAnswerDialog = () => (
    <Dialog
      open={answerDialogOpen}
      onClose={() => setAnswerDialogOpen(false)}
      fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <QuestionAnswerIcon sx={{ mr: 1 }} />
          Practice Answer
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {selectedQuestion && (
          <>
            <Typography variant="h6" gutterBottom>
              {selectedQuestion.question}
            </Typography>
            <Chip 
              size="small" 
              label={selectedQuestion.category} 
              color={selectedQuestion.category === 'technical' ? 'secondary' : 'primary'}
              icon={selectedQuestion.category === 'technical' ? <CodeIcon /> : <PsychologyIcon />}
              sx={{ mr: 1, mb: 2 }}
            />
            <Chip 
              size="small" 
              label={selectedQuestion.difficulty} 
              color={
                selectedQuestion.difficulty === 'easy' ? 'success' : 
                selectedQuestion.difficulty === 'medium' ? 'info' : 'error'
              }
              sx={{ mb: 2 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            {generatingAnswer ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                <CircularProgress size={40} />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Generating practice answer...
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    <FormatQuoteIcon fontSize="small" /> Sample Answer
                  </Typography>
                  <Tooltip title="Copy to clipboard">
                    <IconButton onClick={handleCopyAnswer} size="small">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {generatedAnswer}
                  </Typography>
                </Paper>
                
                <Alert severity="info" sx={{ mt: 3 }}>
                  <Typography variant="body2">
                    <strong>Remember:</strong> This is a sample answer. Personalize it with your own experiences and achievements.
                  </Typography>
                </Alert>
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAnswerDialogOpen(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Main render method
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          Interview Preparation Guide
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => setShowCustomizeDialog(true)}
        >
          Customize Questions
        </Button>
      </Box>
      
      {/* Search and filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search interview questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="behavioral">Behavioral</MenuItem>
                <MenuItem value="technical">Technical</MenuItem>
                <MenuItem value="situational">Situational</MenuItem>
                <MenuItem value="leadership">Leadership</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                label="Difficulty"
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={showTechnicalOnly}
                  onChange={(e) => setShowTechnicalOnly(e.target.checked)}
                  size="small"
                />
              }
              label="Technical"
              sx={{ ml: 0 }}
            />
          </Grid>
          <Grid item xs={6} sm={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              startIcon={<FilterListIcon />}
              size="small"
            >
              Filter
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs */}
      <Tabs
        value={activeTabIndex}
        onChange={(_, newValue) => setActiveTabIndex(newValue)}
        sx={{ mb: 2 }}
        variant="fullWidth"
      >
        <Tab 
          icon={<QuestionAnswerIcon />} 
          label="All Questions" 
          iconPosition="start"
        />
        <Tab 
          icon={<BookmarkIcon />} 
          label="Saved Questions" 
          iconPosition="start"
        />
      </Tabs>
      
      {/* Questions list */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        getFilteredQuestions().length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No questions match your current filters. Try changing your search criteria.
          </Alert>
        ) : (
          <Box>
            {getFilteredQuestions().map((question) => (
              <Accordion 
                key={question.id}
                expanded={expandedQuestionId === question.id}
                onChange={() => handleQuestionExpand(question.id)}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <Typography>
                        {question.question}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', ml: 2 }}>
                      <Chip 
                        size="small" 
                        label={question.category} 
                        color={question.category === 'technical' ? 'secondary' : 'primary'}
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        size="small" 
                        label={question.difficulty} 
                        color={
                          question.difficulty === 'easy' ? 'success' : 
                          question.difficulty === 'medium' ? 'info' : 'error'
                        }
                      />
                      {question.isCommon && (
                        <Chip 
                          size="small" 
                          label="Common" 
                          color="default"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <LightbulbIcon color="warning" sx={{ mr: 1, mt: 0.5 }} />
                        <Box>
                          <Typography variant="subtitle2">Tips:</Typography>
                          <Typography variant="body2">
                            {question.tips}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                          startIcon={question.isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                          onClick={() => handleSaveQuestion(question.id)}
                          color={question.isSaved ? "primary" : "inherit"}
                        >
                          {question.isSaved ? "Saved" : "Save Question"}
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<SpeakerNotesIcon />}
                          onClick={() => handleGenerateAnswer(question)}
                        >
                          Practice Answer
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )
      )}
      
      {/* Render dialogs */}
      {renderCustomizeDialog()}
      {renderAnswerDialog()}
    </Paper>
  );
};

export default InterviewPrepGuide; 