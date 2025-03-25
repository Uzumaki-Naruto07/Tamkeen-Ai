import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Paper, CircularProgress } from '@mui/material';
import DashboardAPI from '../../api/DashboardAPI';
import UserProgressCard from './UserProgressCard';
import SkillProgressSection from './SkillProgressSection';
import ResumeScoreChart from './ResumeScoreChart';
import CareerPathsSection from './CareerPathsSection';
import MarketInsightsSection from './MarketInsightsSection';
import BadgesSection from './BadgesSection';
import ActivityLogSection from './ActivityLogSection';
import CareerPredictionSection from './CareerPredictionSection';
import LeaderboardWidget from './LeaderboardWidget';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId'); // Or get from auth context
        const data = await DashboardAPI.getDashboardData(userId);
        setDashboardData(data);
        
        // Track dashboard view
        await DashboardAPI.trackUserActivity(userId, {
          activity_type: 'view_dashboard',
          description: 'Viewed dashboard'
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up interval to refresh data periodically (every 5 minutes)
    const refreshInterval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography color="error" variant="h6">{error}</Typography>
      </Box>
    );
  }
  
  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 3, mb: 4 }}>
        Your Career Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Top row */}
        <Grid item xs={12} md={4}>
          <UserProgressCard userProgress={dashboardData.user_progress} />
        </Grid>
        <Grid item xs={12} md={8}>
          <ResumeScoreChart resumeScores={dashboardData.resume_scores} />
        </Grid>
        
        {/* Second row */}
        <Grid item xs={12} md={8}>
          <SkillProgressSection skillProgress={dashboardData.skill_progress} />
        </Grid>
        <Grid item xs={12} md={4}>
          <BadgesSection badges={dashboardData.badges} />
        </Grid>
        
        {/* Third row */}
        <Grid item xs={12} md={6}>
          <CareerPathsSection careerPaths={dashboardData.career_paths} />
        </Grid>
        <Grid item xs={12} md={6}>
          <CareerPredictionSection prediction={dashboardData.career_prediction} />
        </Grid>
        
        {/* Fourth row */}
        <Grid item xs={12} md={8}>
          <MarketInsightsSection marketInsights={dashboardData.market_insights} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ mb: 3 }}>
            <LeaderboardWidget position={dashboardData.leaderboard_position} />
          </Box>
          <ActivityLogSection activityLog={dashboardData.activity_log} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 