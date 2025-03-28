import React from 'react';
import { Grid, Box, Typography, Container } from '@mui/material';
import { motion } from 'framer-motion';

// Dashboard components
import UserProgressCard from './UserProgressCard';
import AIRecommendationCard from './AIRecommendationCard';
import SkillGapAnalysis from './SkillGapAnalysis';
import ActivityLogSection from './ActivityLogSection';
import CareerPredictionSection from './CareerPredictionSection';
import OpportunityAlertCard from './OpportunityAlertCard';
import LeaderboardWidget from './LeaderboardWidget';
import MarketInsightsSection from './MarketInsightsSection';
import SkillTransitionChart from './SkillTransitionChart';
import EmiratiJourneyMap from './EmiratiJourneyMap';
import DashboardReportExporter from './DashboardReportExporter';

// Import mock data from centralized location
import { mockDashboardData } from '../../utils/app-mocks';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 80,
    },
  },
};

const SimpleDashboard = () => {
  // In a real application, you would fetch this data from an API
  // and use React state to manage it
  const dashboardData = mockDashboardData;

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Career Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Track your career progress and find new opportunities
        </Typography>
      </Box>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          {/* First row */}
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <UserProgressCard userProgress={dashboardData.userProgress} />
          </Grid>
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <AIRecommendationCard recommendations={dashboardData.aiRecommendation} />
          </Grid>

          {/* Second row */}
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <SkillTransitionChart />
          </Grid>
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <SkillGapAnalysis skillGapData={dashboardData.skillGap} />
          </Grid>

          {/* Third row */}
          <Grid item xs={12} md={7} component={motion.div} variants={itemVariants}>
            <EmiratiJourneyMap />
          </Grid>
          <Grid item xs={12} md={5} component={motion.div} variants={itemVariants}>
            <ActivityLogSection activities={dashboardData.recentActivities} />
          </Grid>

          {/* Fourth row */}
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <CareerPredictionSection predictionData={dashboardData.careerPrediction} />
          </Grid>
          <Grid item xs={12} md={6} component={motion.div} variants={itemVariants}>
            <OpportunityAlertCard jobRecommendations={dashboardData.jobRecommendations} />
          </Grid>

          {/* Fifth row */}
          <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
            <LeaderboardWidget leaderboardData={dashboardData.leaderboardPosition} />
          </Grid>
          <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
            <MarketInsightsSection insightsData={dashboardData.insights} />
          </Grid>
          <Grid item xs={12} md={4} component={motion.div} variants={itemVariants}>
            <DashboardReportExporter />
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default SimpleDashboard; 