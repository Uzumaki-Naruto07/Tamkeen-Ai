import React, { useState } from 'react';
import { 
  Box, Container, Typography, Grid, Card, Button, Chip, Divider,
  Tabs, Tab, Avatar, List, ListItem, ListItemAvatar, ListItemText,
  Tooltip, IconButton, Paper, useTheme, useMediaQuery
} from '@mui/material';
import { motion } from 'framer-motion';
import LearningRoadmap from '../components/Dashboard/LearningRoadmap';
import SkillMap from '../components/Dashboard/SkillMap';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WorkIcon from '@mui/icons-material/Work';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CodeIcon from '@mui/icons-material/Code';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// Mock data
const mockRecommendedCourses = [
  {
    id: 1,
    title: 'Advanced React Patterns & Performance',
    provider: 'Frontend Masters',
    duration: '8 hours',
    completion: 0,
    image: 'https://placehold.co/600x400/2196f3/white?text=React',
    skills: ['React', 'Performance', 'Optimization'],
    relevance: 95
  },
  {
    id: 2,
    title: 'Testing JavaScript Applications',
    provider: 'Udacity',
    duration: '12 hours',
    completion: 0,
    image: 'https://placehold.co/600x400/f44336/white?text=Testing',
    skills: ['Jest', 'Testing', 'TDD'],
    relevance: 88
  },
  {
    id: 3,
    title: 'State Management Deep Dive',
    provider: 'egghead.io',
    duration: '6 hours',
    completion: 0,
    image: 'https://placehold.co/600x400/4caf50/white?text=Redux',
    skills: ['Redux', 'Context API', 'Zustand'],
    relevance: 92
  }
];

const mockCompletedCourses = [
  {
    id: 4,
    title: 'HTML & CSS Fundamentals',
    provider: 'Coursera',
    duration: '15 hours',
    completion: 100,
    completionDate: '2023-08-15',
    image: 'https://placehold.co/600x400/9c27b0/white?text=HTML/CSS',
    skills: ['HTML', 'CSS', 'Responsive Design'],
  },
  {
    id: 5,
    title: 'JavaScript Essentials',
    provider: 'Udemy',
    duration: '20 hours',
    completion: 100,
    completionDate: '2023-09-22',
    image: 'https://placehold.co/600x400/ff9800/white?text=JavaScript',
    skills: ['JavaScript', 'ES6', 'DOM'],
  }
];

const mockJobRelevance = [
  { title: 'Frontend Developer', relevance: 85 },
  { title: 'React Developer', relevance: 92 },
  { title: 'UI Engineer', relevance: 78 }
];

// Animation variants
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
    transition: { type: 'spring', stiffness: 100 }
  }
};

const LearningPath = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [visualizationTab, setVisualizationTab] = useState(0); // 0 for roadmap, 1 for skill map
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleVisualizationTabChange = (event, newValue) => {
    setVisualizationTab(newValue);
  };
  
  const renderRecommendedCourses = () => (
    <Grid container spacing={3}>
      {mockRecommendedCourses.map((course, index) => (
        <Grid item xs={12} md={4} key={course.id}>
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <Card sx={{ 
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: (theme) => `0 12px 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`
              }
            }}>
              <Box 
                sx={{ 
                  height: 140, 
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <Box 
                  component="img"
                  src={course.image}
                  sx={{ 
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <Chip 
                  label={`${course.relevance}% match`}
                  color="primary"
                  size="small"
                  sx={{ 
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    backgroundColor: 'rgba(33, 150, 243, 0.9)'
                  }}
                />
              </Box>
              
              <Box sx={{ p: 2, flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {course.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SchoolIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {course.provider}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {course.duration}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {course.skills.map(skill => (
                    <Chip 
                      key={skill}
                      label={skill}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </Box>
              
              <Divider />
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="contained" size="small">
                  Start Course
                </Button>
                <Button variant="outlined" size="small">
                  Details
                </Button>
              </Box>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
  
  const renderCompletedCourses = () => (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {mockCompletedCourses.map((course) => (
        <ListItem
          key={course.id}
          alignItems="flex-start"
          secondaryAction={
            <IconButton edge="end">
              <MoreVertIcon />
            </IconButton>
          }
          sx={{ 
            mb: 1, 
            borderRadius: 1,
            '&:hover': { 
              backgroundColor: theme.palette.action.hover 
            }
          }}
        >
          <ListItemAvatar>
            <Avatar alt={course.title} src={course.image} variant="rounded" />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  {course.title}
                </Typography>
                <Tooltip title="Completed">
                  <CheckCircleIcon color="success" fontSize="small" />
                </Tooltip>
              </Box>
            }
            secondary={
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <SchoolIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    {course.provider}
                  </Typography>
                  
                  <CalendarMonthIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Completed {new Date(course.completionDate).toLocaleDateString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {course.skills.map(skill => (
                    <Chip 
                      key={skill}
                      label={skill}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  ))}
                </Box>
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );

  const renderCareerRelevance = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Career Relevance
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        This learning path is highly relevant to the following career paths:
      </Typography>
      <Grid container spacing={2}>
        {mockJobRelevance.map((job) => (
          <Grid item xs={12} sm={4} key={job.title}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                height: '100%'
              }}
            >
              <WorkIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                {job.title}
              </Typography>
              <Box 
                sx={{ 
                  width: '100%', 
                  bgcolor: theme.palette.grey[200], 
                  borderRadius: 5,
                  mt: 1,
                  position: 'relative',
                  height: 10
                }}
              >
                <Box 
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${job.relevance}%`,
                    bgcolor: theme.palette.primary.main,
                    borderRadius: 5
                  }}
                />
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {job.relevance}% match
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountTreeIcon sx={{ fontSize: 32, mr: 2, color: theme.palette.primary.main }} />
              <Typography variant="h4" component="h1" fontWeight={700}>
                Frontend Development Learning Path
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
              <Chip 
                icon={<CodeIcon />} 
                label="Development" 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                icon={<LocalOfferIcon />} 
                label="In-demand" 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                icon={<TrendingUpIcon />} 
                label="Career growth" 
                color="info" 
                variant="outlined" 
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                Last updated: {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box 
              sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: theme.palette.background.paper,
                boxShadow: theme.shadows[1]
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs 
                  value={visualizationTab} 
                  onChange={handleVisualizationTabChange}
                  variant="fullWidth"
                >
                  <Tab 
                    icon={<AccountTreeIcon />}
                    label="Learning Roadmap" 
                    iconPosition="start"
                  />
                  <Tab 
                    icon={<WorkIcon />}
                    label="Skill Map" 
                    iconPosition="start"
                  />
                </Tabs>
              </Box>
              
              <Typography variant="h6" gutterBottom>
                {visualizationTab === 0 ? 'Your Interactive Learning Roadmap' : 'Interactive Skill Map'}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                {visualizationTab === 0 ? 
                  'This personalized roadmap shows your learning journey with key milestones. Click on any node to explore details and access learning resources.' : 
                  'Explore your skills as an interactive, draggable map. Each hexagon represents a skill, with connections showing prerequisites. Click on any skill to see details.'}
              </Typography>
              
              <Box sx={{ minHeight: '500px' }}>
                {visualizationTab === 0 ? (
                  <LearningRoadmap />
                ) : (
                  <Box sx={{ height: '500px' }}>
                    <SkillMap />
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ width: '100%', mt: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab 
                  label="Recommended Courses" 
                  icon={<AutoStoriesIcon />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Completed" 
                  icon={<WorkspacePremiumIcon />} 
                  iconPosition="start"
                />
              </Tabs>
              
              <Box sx={{ py: 3 }}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {activeTab === 0 && renderRecommendedCourses()}
                  {activeTab === 1 && renderCompletedCourses()}
                </motion.div>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            {renderCareerRelevance()}
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="contained" 
                size="large" 
                startIcon={<AutoStoriesIcon />}
                sx={{ mr: 2 }}
              >
                Explore All Courses
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                startIcon={<WorkspacePremiumIcon />}
              >
                Get Skill Certification
              </Button>
            </Box>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
};

export default LearningPath; 