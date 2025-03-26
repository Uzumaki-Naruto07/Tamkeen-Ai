import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Divider,
  Chip, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon,
  Timeline, TimelineItem, TimelineSeparator,
  TimelineConnector, TimelineContent, TimelineDot,
  TimelineOppositeContent, CircularProgress, Alert,
  Tab, Tabs, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Tooltip, Rating
} from '@mui/material';
import {
  Work, School, Timeline as TimelineIcon, TrendingUp,
  Add, ArrowForward, Bookmark, BookmarkBorder,
  CheckCircle, Info, Warning, Star, StarBorder,
  BarChart, Psychology, OpenInNew, NotListedLocation,
  ArrowUpward, Code, Person, Business, Assessment,
  Done, Lightbulb, CompareArrows, FlagCircle
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SkillRadarChart from '../components/SkillRadarChart';
import SalaryTrendChart from '../components/SalaryTrendChart';

const CareerExplorer = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [careerPaths, setCareerPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [userSkills, setUserSkills] = useState({});
  const [careerPathSkills, setCareerPathSkills] = useState({});
  const [skillGaps, setSkillGaps] = useState([]);
  const [careerDialogOpen, setCareerDialogOpen] = useState(false);
  const [newCareerData, setNewCareerData] = useState({
    title: '',
    industry: '',
    yearsExperience: 0
  });
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [savedPaths, setSavedPaths] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isCustomPath, setIsCustomPath] = useState(false);
  
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Fetch user's career paths and skills
  useEffect(() => {
    const fetchCareerData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user's saved career paths
        const savedPathsResponse = await apiEndpoints.career.getSavedCareerPaths(profile.id);
        setSavedPaths(savedPathsResponse.data || []);
        
        // Fetch recommended career paths based on user profile
        const recommendationsResponse = await apiEndpoints.career.getCareerRecommendations(profile.id);
        setRecommendations(recommendationsResponse.data || []);
        
        // Set career paths combining saved and recommended
        const allPaths = [
          ...(savedPathsResponse.data || []),
          ...(recommendationsResponse.data || []).filter(
            rec => !savedPathsResponse.data.some(saved => saved.id === rec.id)
          )
        ];
        setCareerPaths(allPaths);
        
        // Set initial selected path if available
        if (allPaths.length > 0) {
          setSelectedPath(allPaths[0]);
          
          // Fetch skills for the selected path
          const pathSkillsResponse = await apiEndpoints.career.getCareerPathSkills(allPaths[0].id);
          setCareerPathSkills(pathSkillsResponse.data || {});
        }
        
        // Fetch user's skills
        const userSkillsResponse = await apiEndpoints.skills.getUserSkills(profile.id);
        setUserSkills(userSkillsResponse.data || {});
      } catch (err) {
        setError('Failed to load career data');
        console.error('Error fetching career data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCareerData();
  }, [profile]);
  
  // Calculate skill gaps when career path or user skills change
  useEffect(() => {
    if (selectedPath && Object.keys(userSkills).length && Object.keys(careerPathSkills).length) {
      calculateSkillGaps();
    }
  }, [selectedPath, userSkills, careerPathSkills]);
  
  // Calculate skill gaps between user skills and career path requirements
  const calculateSkillGaps = () => {
    const gaps = [];
    
    // Iterate through career path skills
    Object.entries(careerPathSkills).forEach(([category, skills]) => {
      skills.forEach(skill => {
        const userSkill = userSkills[category]?.find(s => s.name === skill.name);
        const userLevel = userSkill ? userSkill.level : 0;
        
        if (userLevel < skill.level) {
          gaps.push({
            name: skill.name,
            category,
            currentLevel: userLevel,
            requiredLevel: skill.level,
            gap: skill.level - userLevel
          });
        }
      });
    });
    
    // Sort gaps by size (largest first)
    gaps.sort((a, b) => b.gap - a.gap);
    
    setSkillGaps(gaps);
  };
  
  // Handle selecting a career path
  const handleSelectPath = async (path) => {
    setSelectedPath(path);
    setIsCustomPath(false);
    
    try {
      // Fetch skills for the selected path
      const pathSkillsResponse = await apiEndpoints.career.getCareerPathSkills(path.id);
      setCareerPathSkills(pathSkillsResponse.data || {});
    } catch (err) {
      console.error('Error fetching career path skills:', err);
    }
  };
  
  // Handle input change for new career path
  const handleCareerInputChange = (e) => {
    const { name, value } = e.target;
    setNewCareerData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle creating a custom career path
  const handleCreateCustomPath = async () => {
    try {
      const response = await apiEndpoints.career.createCustomCareerPath(profile.id, newCareerData);
      if (response.data) {
        setCareerPaths(prevPaths => [...prevPaths, response.data]);
        setSelectedPath(response.data);
        setIsCustomPath(true);
        setNewCareerData({
          title: '',
          industry: '',
          yearsExperience: 0
        });
      }
    } catch (err) {
      console.error('Error creating custom career path:', err);
    }
  };
  
  return (
    <Box sx={{ py: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Career Explorer
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setCareerDialogOpen(true)}
          >
            Custom Career Path
          </Button>
        </Box>
        
        <Typography variant="body1" paragraph>
          Explore potential career paths, identify skill gaps, and plan your future career progression.
        </Typography>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <LoadingSpinner message="Loading career data..." />
      ) : careerPaths.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NotListedLocation sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Career Paths Found
          </Typography>
          <Typography variant="body1" paragraph>
            You haven't saved any career paths yet, and we don't have enough data to generate recommendations.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setCareerDialogOpen(true)}
            startIcon={<Add />}
          >
            Add Custom Career Path
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Career paths selection */}
          <Grid item xs={12} md={3}>
            {renderCareerPathsList()}
          </Grid>
          
          {/* Career path details */}
          <Grid item xs={12} md={9}>
            {selectedPath ? (
              <Box>
                <Tabs
                  value={currentTabIndex}
                  onChange={(e, newValue) => setCurrentTabIndex(newValue)}
                  sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab icon={<TimelineIcon />} label="Career Path" />
                  <Tab icon={<BarChart />} label="Skill Analysis" />
                  <Tab icon={<TrendingUp />} label="Future Outlook" />
                </Tabs>
                
                {currentTabIndex === 0 && renderCareerPathTimeline()}
                {currentTabIndex === 1 && renderSkillAnalysis()}
                {currentTabIndex === 2 && renderFutureOutlook()}
              </Box>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6">
                  Select a career path to view details
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
      
      {/* Custom Career Path Dialog */}
      <Dialog
        open={careerDialogOpen}
        onClose={() => setCareerDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Create Custom Career Path
        </DialogTitle>
        
        <DialogContent dividers>
          <TextField
            label="Career Title"
            fullWidth
            margin="normal"
            name="title"
            value={newCareerData.title}
            onChange={handleCareerInputChange}
          />
          
          <TextField
            label="Industry"
            fullWidth
            margin="normal"
            name="industry"
            value={newCareerData.industry}
            onChange={handleCareerInputChange}
          />
          
          <TextField
            label="Years of Experience"
            fullWidth
            margin="normal"
            name="yearsExperience"
            type="number"
            value={newCareerData.yearsExperience}
            onChange={handleCareerInputChange}
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setCareerDialogOpen(false)}>
            Cancel
          </Button>
          
          <Button 
            variant="contained"
            onClick={handleCreateCustomPath}
            disabled={!newCareerData.title || !newCareerData.industry}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CareerExplorer; 