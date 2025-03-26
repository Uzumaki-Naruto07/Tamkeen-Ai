import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Divider,
  CircularProgress, Button, Chip, Tabs, Tab,
  Tooltip, Alert
} from '@mui/material';
import { 
  TrendingUp, Language, WorkOutline, 
  AttachMoney, School, BarChart
} from '@mui/icons-material';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useUser } from './AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const MarketInsightsSection = ({ industry = '', jobTitle = '', region = 'global' }) => {
  const [insightsData, setInsightsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const { profile } = useUser();
  
  useEffect(() => {
    const fetchMarketInsights = async () => {
      if (!industry && !jobTitle) {
        setError('Industry or job title is required for market insights');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // This connects to career_insights.py backend
        const response = await apiEndpoints.career.getInsights({
          industry: industry || undefined,
          jobTitle: jobTitle || undefined,
          region: region || 'global',
          userId: profile?.id || undefined
        });
        
        // Response includes job stats and market trends from career_insights.py
        setInsightsData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load market insights');
        console.error('Market insights error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketInsights();
  }, [industry, jobTitle, region, profile]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <LoadingSpinner message="Loading market insights..." />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!insightsData) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No market insights data available
      </Alert>
    );
  }
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <BarChart sx={{ mr: 1 }} />
        Market Insights
        {industry && (
          <Chip 
            label={industry}
            size="small"
            color="primary"
            sx={{ ml: 2 }}
          />
        )}
        {jobTitle && (
          <Chip 
            label={jobTitle}
            size="small"
            color="secondary"
            sx={{ ml: 1 }}
          />
        )}
      </Typography>
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab icon={<TrendingUp />} label="Trends" />
        <Tab icon={<AttachMoney />} label="Salary" />
        <Tab icon={<WorkOutline />} label="Skills" />
        <Tab icon={<Language />} label="Geography" />
      </Tabs>
      
      {/* Tab content with charts would go here based on activeTab */}
      {/* This would use the data from career_insights.py to display
          job statistics, market trends, salary information, etc. */}
    </Paper>
  );
};

export default MarketInsightsSection; 