import React, { useState } from 'react';
import {
  Box, Typography, Paper, Card, CardContent, 
  Accordion, AccordionSummary, AccordionDetails,
  Avatar, Button, List, ListItem, ListItemText,
  CircularProgress, Divider, Chip, Grid, Tabs, Tab
} from '@mui/material';
import {
  CheckCircle, Close, ExpandMore, BarChart,
  Info, Psychology, Timeline, QuestionAnswer
} from '@mui/icons-material';

// Simple chart component for performance visualization
const PerformanceChart = ({ data }) => {
  const { correct, incorrect, total } = data;
  const correctPercentage = Math.round((correct / total) * 100);
  const incorrectPercentage = 100 - correctPercentage;
  
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ display: 'flex', width: '80%', mb: 2 }}>
        <Box
          sx={{
            width: `${correctPercentage}%`,
            bgcolor: 'success.main',
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="body2" color="white" sx={{ fontWeight: 'bold' }}>
            {correctPercentage}%
          </Typography>
        </Box>
        <Box
          sx={{
            width: `${incorrectPercentage}%`,
            bgcolor: 'error.main',
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="body2" color="white" sx={{ fontWeight: 'bold' }}>
            {incorrectPercentage}%
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', width: '80%', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 16, height: 16, borderRadius: 8, bgcolor: 'success.main', mr: 1 }} />
          <Typography variant="body2">Correct ({correct})</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 16, height: 16, borderRadius: 8, bgcolor: 'error.main', mr: 1 }} />
          <Typography variant="body2">Incorrect ({incorrect})</Typography>
        </Box>
      </Box>
    </Box>
  );
};

// Component for analyzing performance by topic
const TopicPerformance = ({ data }) => {
  // This would be calculated from the assessment results
  const topics = [
    { name: 'Fundamentals', correct: 8, total: 10 },
    { name: 'Advanced Concepts', correct: 5, total: 8 },
    { name: 'Problem Solving', correct: 4, total: 7 }
  ];
  
  return (
    <Box sx={{ width: '100%' }}>
      {topics.map(topic => {
        const percentage = Math.round((topic.correct / topic.total) * 100);
        return (
          <Box key={topic.name} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">{topic.name}</Typography>
              <Typography variant="body2">{topic.correct}/{topic.total} ({percentage}%)</Typography>
            </Box>
            <Box sx={{ position: 'relative', height: 10, bgcolor: 'grey.200', borderRadius: 5 }}>
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  height: 10, 
                  width: `${percentage}%`,
                  bgcolor: percentage > 80 ? 'success.main' : percentage > 60 ? 'warning.main' : 'error.main',
                  borderRadius: 5
                }} 
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

const AssessmentResults = ({ results, onRetake, onFinish }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  if (!results) return null;
  
  const { score, maxScore, title, questionResponses = [] } = results;
  const percentage = Math.round((score / maxScore) * 100);
  
  // Calculate correct and incorrect answers
  const correct = questionResponses.filter(q => q.isCorrect).length;
  const incorrect = questionResponses.length - correct;
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">
          Assessment Results: {title}
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary"
          onClick={onFinish}
        >
          Return to Assessments
        </Button>
      </Box>
      
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Your Score: {score}/{maxScore} ({percentage}%)
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
            <CircularProgress
              variant="determinate"
              value={percentage}
              size={120}
              thickness={5}
              color={percentage >= 70 ? "success" : percentage >= 50 ? "warning" : "error"}
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
              <Typography variant="h5" component="div">
                {percentage}%
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Typography variant="body1" color="text.secondary">
          {percentage >= 70 ? "Great job! You've demonstrated strong knowledge in this area." :
           percentage >= 50 ? "Good effort! There's room for improvement in some areas." :
           "You'll need more practice in this area. Review the correct answers below."}
        </Typography>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="assessment results tabs">
          <Tab icon={<BarChart />} label="Performance" />
          <Tab icon={<QuestionAnswer />} label="Answers" />
          <Tab icon={<Info />} label="Explanation" />
        </Tabs>
      </Box>
      
      {activeTab === 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Performance Analysis
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Overall Performance
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <PerformanceChart data={{ correct, incorrect, total: questionResponses.length }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Performance by Topic
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <TopicPerformance data={questionResponses} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {activeTab === 1 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Questions and Answers
          </Typography>
          
          {questionResponses.length > 0 ? (
            questionResponses.map((question, index) => (
              <Accordion key={index} sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: question.isCorrect ? 'success.main' : 'error.main',
                        width: 32,
                        height: 32,
                        mr: 2
                      }}
                    >
                      {question.isCorrect ? <CheckCircle /> : <Close />}
                    </Avatar>
                    <Typography variant="subtitle1">
                      Question {index + 1}: {question.questionText}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Your Answer:
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color={question.isCorrect ? "success.main" : "error.main"} 
                      sx={{ mb: 2, pl: 2 }}
                    >
                      {question.userAnswer}
                    </Typography>
                    
                    {!question.isCorrect && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          Correct Answer:
                        </Typography>
                        <Typography variant="body1" color="success.main" sx={{ mb: 2, pl: 2 }}>
                          {question.correctAnswer}
                        </Typography>
                      </>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Typography color="text.secondary">
              No detailed question data available for this assessment.
            </Typography>
          )}
        </Box>
      )}
      
      {activeTab === 2 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Explanation and Learning
          </Typography>
          
          {questionResponses.length > 0 ? (
            questionResponses.map((question, index) => (
              <Card key={index} sx={{ mb: 3, p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'info.main',
                      width: 32,
                      height: 32,
                      mr: 2
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  <Typography variant="subtitle1">
                    {question.questionText}
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Chip 
                    label={question.isCorrect ? "Correct" : "Incorrect"} 
                    color={question.isCorrect ? "success" : "error"}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Explanation:
                  </Typography>
                  <Typography variant="body2" sx={{ pl: 2, mb: 2 }}>
                    {question.explanation || "No explanation available for this question."}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Correct Answer:
                  </Typography>
                  <Typography variant="body1" color="success.main" sx={{ pl: 2 }}>
                    {question.correctAnswer}
                  </Typography>
                </Box>
                
                <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Learning Resources:
                  </Typography>
                  <Typography variant="body2">
                    {question.resources || "Review the documentation on this topic to deepen your understanding."}
                  </Typography>
                </Box>
              </Card>
            ))
          ) : (
            <Typography color="text.secondary">
              No explanation data available for this assessment.
            </Typography>
          )}
        </Box>
      )}
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button 
          variant="outlined"
          onClick={onRetake}
        >
          Retake Assessment
        </Button>
        
        <Button 
          variant="contained"
          onClick={onFinish}
        >
          View Your Skills Profile
        </Button>
      </Box>
    </Paper>
  );
};

export default AssessmentResults; 