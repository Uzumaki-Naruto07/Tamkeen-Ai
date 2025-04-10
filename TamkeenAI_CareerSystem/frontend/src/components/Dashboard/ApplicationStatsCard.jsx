import React from 'react';
import { Box, Typography, Grid, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const ApplicationStatsCard = ({ data }) => {
  console.log("ApplicationStatsCard rendered with data:", data);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { t, i18n } = useTranslation();
  
  // Default data if none provided
  const stats = {
    applications: data?.applications || 23,
    onHold: data?.onHold || 6,
    rejected: data?.rejected || 3,
    totalApplied: data?.totalApplied || 25.9,
    applicationWeeks: data?.applicationWeeks || "7",
    onHoldWeeks: data?.onHoldWeeks || "3",
    rejectedWeeks: data?.rejectedWeeks || "2",
    totalWeeks: data?.totalWeeks || "20/23"
  };
  
  console.log("Using stats:", stats);

  // Define animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  // Eye animation variant
  const eyeVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.1, 1],
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 2,
        ease: "easeInOut"
      }
    }
  };

  // Define stat items with premium darker colors
  const statItems = [
    {
      number: stats.totalApplied,
      label: i18n.language === 'ar' ? "إجمالي التقديمات" : "Total Applied",
      weeks: stats.totalWeeks,
      color: "#0d8043", // Darker green
      bgColor: isDarkMode ? "rgba(13, 128, 67, 0.15)" : "rgba(13, 128, 67, 0.08)",
      weekColor: "#0d8043",
      gradient: "linear-gradient(135deg, #0d8043, #00602c)"
    },
    {
      number: stats.rejected,
      label: i18n.language === 'ar' ? "مرفوض" : "Rejected",
      weeks: stats.rejectedWeeks,
      color: "#d93025", // Darker red
      bgColor: isDarkMode ? "rgba(217, 48, 37, 0.15)" : "rgba(217, 48, 37, 0.08)",
      weekColor: "#d93025",
      gradient: "linear-gradient(135deg, #d93025, #a50e0e)"
    },
    {
      number: stats.onHold,
      label: i18n.language === 'ar' ? "قيد الانتظار" : "On Hold",
      weeks: stats.onHoldWeeks,
      color: "#e8a90c", // Darker amber
      bgColor: isDarkMode ? "rgba(232, 169, 12, 0.15)" : "rgba(232, 169, 12, 0.08)",
      weekColor: "#e8a90c",
      gradient: "linear-gradient(135deg, #e8a90c, #b78103)"
    },
    {
      number: stats.applications,
      label: i18n.language === 'ar' ? "طلبات التوظيف" : "Applications",
      weeks: stats.applicationWeeks,
      color: "#1a73e8", // Darker blue
      bgColor: isDarkMode ? "rgba(26, 115, 232, 0.15)" : "rgba(26, 115, 232, 0.08)",
      weekColor: "#1a73e8",
      gradient: "linear-gradient(135deg, #1a73e8, #0d47a1)"
    }
  ];

  const StatItem = ({ item }) => (
    <motion.div variants={itemVariants}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          textAlign: 'center',
          height: '100%',
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : item.bgColor,
          borderRadius: 3,
          transition: 'all 0.3s',
          border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
            transform: 'translateY(-5px)'
          }
        }}
      >
        {/* Gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: item.gradient
          }}
        />
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: item.color,
            fontSize: '2.2rem',
            mt: 1,
            textShadow: isDarkMode ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
          }}
        >
          {item.number}
        </Typography>
        
        <Typography 
          variant="body2"
          sx={{ 
            color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
            mt: 0.5,
            fontWeight: 'medium',
            fontSize: '0.9rem'
          }}
        >
          {item.label}
        </Typography>
        
        <Typography 
          variant="caption" 
          sx={{ 
            color: item.color, 
            display: 'block',
            mt: 0.5,
            fontWeight: 'bold'
          }}
        >
          ↑ {item.weeks} {i18n.language === 'ar' ? 'أسابيع' : (item.weeks === 1 ? 'week' : 'weeks')}
        </Typography>
        
        <Box 
          sx={{ 
            mt: 1.5, 
            display: 'flex', 
            justifyContent: 'center'
          }}
        >
          <motion.div
            variants={eyeVariants}
            initial="initial"
            animate="animate"
          >
            <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="20" cy="14" rx="20" ry="14" fill={`${item.color}20`} />
              <ellipse cx="20" cy="14" rx="10" ry="10" fill={isDarkMode ? 'rgba(255,255,255,0.9)' : 'white'} />
              <ellipse cx="20" cy="14" rx="5" ry="5" fill={item.color} />
              <ellipse cx="17.5" cy="11.5" rx="1.5" ry="1.5" fill="white" />
            </svg>
          </motion.div>
        </Box>
      </Paper>
    </motion.div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Grid container spacing={2}>
        {statItems.map((item, index) => (
          <Grid item xs={6} md={3} key={index}>
            <StatItem item={item} />
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
};

export default ApplicationStatsCard;