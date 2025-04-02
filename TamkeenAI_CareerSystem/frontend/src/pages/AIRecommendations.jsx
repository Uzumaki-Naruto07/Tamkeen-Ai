import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  Chip,
  Link
} from '@mui/material';
import {
  Lightbulb,
  WorkOutline,
  School,
  Code,
  Psychology,
  BarChart,
  TipsAndUpdates
} from '@mui/icons-material';
import AIRecommendationCard from '../components/ai/AIRecommendationCard';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * AIRecommendations Page Component
 * 
 * This page provides access to various AI-powered recommendation tools
 * for resume improvement, interview preparation, job search, and career advice.
 */
const AIRecommendations = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Function to handle results from AIRecommendationCard
  const handleRecommendationResult = (result) => {
    // Add result to history with timestamp
    setResults(prev => [
      {
        id: Date.now(),
        type: activeTab,
        query: result.query,
        response: result.response,
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  };

  // AI recommendation tabs and their content
  const tabs = [
    {
      label: "Career Advice",
      icon: <WorkOutline />,
      component: (
        <AIRecommendationCard
          title="AI Career Advisor"
          description="Get personalized career advice based on your skills, interests, and goals"
          placeholder="Describe your current career situation, goals, or challenges..."
          context="Provide career advice that is personalized, actionable, and thoughtful. Focus on practical steps and UAE job market specifics where relevant."
          type="career"
          onResult={handleRecommendationResult}
        />
      )
    },
    {
      label: "Resume Tips",
      icon: <TipsAndUpdates />,
      component: (
        <AIRecommendationCard
          title="Resume Improvement Suggestions"
          description="Get AI feedback on how to improve your resume for better results"
          placeholder="Paste a section of your resume or describe what you need help with..."
          context="Analyze the resume content and provide specific suggestions for improvement. Focus on content, structure, ATS optimization, and impactful language."
          type="resume"
          onResult={handleRecommendationResult}
        />
      )
    },
    {
      label: "Interview Prep",
      icon: <Psychology />,
      component: (
        <AIRecommendationCard
          title="Interview Answer Assistant"
          description="Practice answering common interview questions or get feedback on your responses"
          placeholder="Type an interview question you're struggling with, or your draft answer for feedback..."
          context="Provide feedback on interview answers and guidance for common interview questions. Focus on structure, content, and delivery."
          type="interview"
          onResult={handleRecommendationResult}
        />
      )
    },
    {
      label: "Job Skills",
      icon: <School />,
      component: (
        <AIRecommendationCard
          title="Skills Analysis & Development Plan"
          description="Get recommendations for skills to develop based on your job targets"
          placeholder="Describe your target role, industry, and current skills..."
          context="Analyze the skills gap between current skills and target role requirements. Provide specific learning resources and development steps."
          type="skills"
          onResult={handleRecommendationResult}
        />
      )
    },
    {
      label: "Tech Question",
      icon: <Code />,
      component: (
        <AIRecommendationCard
          title="Technical Interview Practice"
          description="Practice technical questions or get explanations for concepts"
          placeholder="Enter a technical interview question or concept you need help with..."
          context="Provide clear, educational answers to technical questions. For coding questions, include example code with explanations."
          type="technical"
          onResult={handleRecommendationResult}
        />
      )
    }
  ];

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="AI Recommendation Hub"
        subtitle="Use AI to get personalized recommendations for your career development"
        icon={<Lightbulb sx={{ mr: 1 }} fontSize="large" />}
      />

      <Paper elevation={0} sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {loading ? (
            <LoadingSpinner message="Loading AI recommendations..." />
          ) : (
            tabs[activeTab].component
          )}
        </Box>
      </Paper>

      {/* Previous recommendations section */}
      {results.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <BarChart sx={{ mr: 1 }} />
            Recent Recommendations
          </Typography>
          <Grid container spacing={3}>
            {results.slice(0, 3).map((result) => (
              <Grid item xs={12} md={4} key={result.id}>
                <Card elevation={1} sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {new Date(result.timestamp).toLocaleString()}
                      </Typography>
                      <Chip
                        label={tabs.find(tab => tab.label === result.type)?.label || "General"}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                      {result.query.length > 70 ? result.query.substring(0, 70) + '...' : result.query}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {result.response.length > 150 ? result.response.substring(0, 150) + '...' : result.response}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Disclaimer */}
      <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, mb: 4 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Note:</strong> AI recommendations are intended as a starting point for your career development journey. 
          For the best results, combine AI insights with input from industry professionals and career advisors. 
          For more personalized guidance, please visit the <Link href="/ai-coach">AI Coach</Link> section.
        </Typography>
      </Paper>
    </Container>
  );
};

export default AIRecommendations; 