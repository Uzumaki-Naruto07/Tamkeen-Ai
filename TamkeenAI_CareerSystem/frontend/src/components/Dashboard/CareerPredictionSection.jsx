import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Grid, 
  Chip, 
  LinearProgress, 
  Divider,
  Paper,
  Stack,
  Button,
  IconButton,
  Tooltip,
  TextField,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  CircularProgress,
  Alert
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TimelineIcon from '@mui/icons-material/Timeline';
import ScienceIcon from '@mui/icons-material/Science';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DashboardAPI from '../../api/DashboardAPI';

const CareerPredictionSection = ({ userProfile, skillsData }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillLevel, setSkillLevel] = useState(3);
  const [simulationResults, setSimulationResults] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [skillToAdd, setSkillToAdd] = useState(null);
  
  const { currentRole = 'Software Developer', yearsExperience = 2, skills = [] } = userProfile || {};
  const { allSkills = [] } = skillsData || {};
  
  // Fetch career predictions on component mount
  useEffect(() => {
    fetchPredictions();
  }, []);
  
  // Fetch career predictions from API
  const fetchPredictions = async () => {
    setLoading(true);
    try {
      // In a real app, you would call your API here
      // const response = await DashboardAPI.getCareerPredictions(userProfile);
      // setPredictions(response.predictions);
      
      // Simulated API response
      setTimeout(() => {
        setPredictions([
          { 
            role: 'Senior Software Engineer', 
            confidence: 92, 
            timeframe: '1-2 years',
            salary_increase: 25,
            key_skills: ['System Design', 'CI/CD', 'Team Leadership', 'Performance Optimization'],
            description: 'Natural progression based on your technical skills and experience trajectory.'
          },
          { 
            role: 'Technical Lead', 
            confidence: 78, 
            timeframe: '2-3 years',
            salary_increase: 40,
            key_skills: ['Team Management', 'Technical Planning', 'Mentoring', 'Architecture'],
            description: 'A leadership path leveraging both technical expertise and people skills.'
          },
          { 
            role: 'Product Manager', 
            confidence: 64, 
            timeframe: '2-4 years',
            salary_increase: 35,
            key_skills: ['User Research', 'Product Strategy', 'Stakeholder Management', 'Agile Methodologies'],
            description: 'An alternative path focusing on your product understanding and communication skills.'
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setLoading(false);
    }
  };
  
  // Run career simulation with modified skills
  const runSimulation = async () => {
    setLoading(true);
    try {
      // In a real app, you would call your API here
      // const response = await DashboardAPI.simulateCareerPath({
      //   ...userProfile,
      //   modifiedSkill: { name: selectedSkill, level: skillLevel }
      // });
      // setSimulationResults(response);
      
      // Simulated API response for demonstration
      setTimeout(() => {
        setSimulationResults({
          original_predictions: predictions,
          new_predictions: [
            { 
              role: skillLevel > 3 ? 'Engineering Manager' : 'Senior Software Engineer', 
              confidence: skillLevel > 3 ? 88 : 90, 
              timeframe: skillLevel > 3 ? '2-3 years' : '1-2 years',
              salary_increase: skillLevel > 3 ? 45 : 25,
              key_skills: skillLevel > 3 ? 
                ['People Management', 'Technical Leadership', 'Project Planning', 'Mentoring'] : 
                ['System Design', 'CI/CD', 'Team Leadership', 'Performance Optimization'],
              description: skillLevel > 3 ? 
                'Your enhanced leadership skills open up management paths.' : 
                'Focusing on technical skills maintains your engineering career path.'
            },
            { 
              role: skillLevel > 3 ? 'Director of Engineering' : 'Technical Lead', 
              confidence: skillLevel > 3 ? 72 : 75, 
              timeframe: skillLevel > 3 ? '4-5 years' : '2-3 years',
              salary_increase: skillLevel > 3 ? 70 : 40,
              key_skills: skillLevel > 3 ?
                ['Strategic Planning', 'Team Building', 'Technical Vision', 'Cross-functional Leadership'] :
                ['Team Management', 'Technical Planning', 'Mentoring', 'Architecture'],
              description: skillLevel > 3 ?
                'Long-term leadership potential based on your enhanced management abilities.' :
                'A balanced technical leadership path.'
            },
          ],
          changed_skill: { name: selectedSkill, level: skillLevel },
          impact_factors: [
            { factor: 'Leadership Potential', change: skillLevel > 3 ? '+35%' : '-10%' },
            { factor: 'Technical Growth', change: skillLevel > 3 ? '-15%' : '+25%' },
            { factor: 'Salary Trajectory', change: skillLevel > 3 ? '+20%' : '+5%' },
          ]
        });
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error running simulation:', error);
      setLoading(false);
    }
  };
  
  // Reset simulation and show original predictions
  const resetSimulation = () => {
    setSimulationMode(false);
    setSelectedSkill(null);
    setSkillLevel(3);
    setSimulationResults(null);
  };
  
  // Handle skill level change
  const handleSkillLevelChange = (event, newValue) => {
    setSkillLevel(newValue);
  };
  
  // Open dialog to add a new skill
  const handleOpenAddSkillDialog = () => {
    setDialogOpen(true);
  };
  
  // Close add skill dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSkillToAdd(null);
  };
  
  // Add a new skill and run simulation
  const handleAddSkill = () => {
    if (skillToAdd) {
      setSelectedSkill(skillToAdd);
      setSimulationMode(true);
      setDialogOpen(false);
      // In a real app, you would update the user profile here
      runSimulation();
    }
  };
  
  // Get confidence level color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'primary';
    return 'warning';
  };
  
  // Render career prediction cards
  const renderPredictionCard = (prediction, isSimulated = false) => (
    <Paper 
      elevation={0} 
      variant="outlined" 
      sx={{ 
        p: 2, 
        mb: 2, 
        borderLeft: '4px solid',
        borderLeftColor: isSimulated ? 'secondary.main' : 'primary.main',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 2
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <WorkIcon fontSize="small" sx={{ mr: 1 }} />
            {prediction.role}
        </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Timeframe: {prediction.timeframe} • Salary Increase: ~{prediction.salary_increase}%
          </Typography>
        </Box>
        <Chip 
          label={`${prediction.confidence}% Confidence`} 
          color={getConfidenceColor(prediction.confidence)}
          size="small"
        />
      </Box>
      
      <Typography variant="body2" paragraph>
        {prediction.description}
      </Typography>
      
      <Typography variant="subtitle2" gutterBottom>
        Key Skills Needed:
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {prediction.key_skills.map((skill, index) => (
          <Chip 
            key={index} 
            label={skill} 
            size="small" 
            variant={isSimulated ? "filled" : "outlined"} 
            color={isSimulated ? "secondary" : "primary"}
          />
        ))}
      </Box>
    </Paper>
  );
  
  // Render "What If?" simulation form
  const renderSimulationForm = () => (
    <Box sx={{ mb: 3 }}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <ScienceIcon fontSize="small" sx={{ mr: 1 }} />
          Skill Impact Simulator
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Autocomplete
              value={selectedSkill}
              onChange={(event, newValue) => setSelectedSkill(newValue)}
              options={userProfile?.skills?.map(s => s.name) || []}
              renderInput={(params) => <TextField {...params} label="Select Skill to Modify" size="small" />}
              fullWidth
            />
          </Grid>
          <Grid item xs={9} md={6}>
            <Box sx={{ px: 2 }}>
              <Typography id="skill-level-slider" gutterBottom>
                Skill Level: {skillLevel}/5
              </Typography>
              <Slider
                value={skillLevel}
                onChange={handleSkillLevelChange}
                aria-labelledby="skill-level-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={5}
              />
            </Box>
          </Grid>
          <Grid item xs={3} md={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={runSimulation}
              disabled={!selectedSkill || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <CompareArrowsIcon />}
            >
              Simulate
            </Button>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            size="small" 
            startIcon={<AddCircleIcon />} 
            onClick={handleOpenAddSkillDialog}
          >
            Add New Skill
          </Button>
          <Button 
            size="small" 
            color="inherit" 
            onClick={resetSimulation}
          >
            Reset
          </Button>
        </Box>
      </Paper>
    </Box>
  );
  
  // Render simulation results comparison
  const renderSimulationResults = () => (
    <Box sx={{ mt: 3 }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Showing career path simulation after {simulationResults.changed_skill.level > 3 ? 'improving' : 'changing'} your skill in <strong>{simulationResults.changed_skill.name}</strong> to level <strong>{simulationResults.changed_skill.level}/5</strong>.
        </Typography>
      </Alert>
      
      <Typography variant="subtitle1" gutterBottom>
        Impact on Career Factors:
          </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {simulationResults.impact_factors.map((factor, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
                {factor.factor}
              </Typography>
              <Typography 
                variant="h6" 
                color={factor.change.startsWith('+') ? 'success.main' : 'error.main'}
              >
                {factor.change}
          </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Typography variant="subtitle1" gutterBottom>
        New Career Predictions:
      </Typography>
      {simulationResults.new_predictions.map((prediction, index) => (
        renderPredictionCard(prediction, true)
      ))}
    </Box>
  );
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Career Path Prediction</Typography>
          <Box>
            <Chip 
              icon={<WorkIcon />} 
              label={`Current: ${currentRole}`} 
              size="small" 
              sx={{ mr: 1 }} 
            />
            <Chip 
              icon={<TimelineIcon />} 
              label={`${yearsExperience} Years Experience`} 
              color="primary"
              size="small"
            />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            <span role="img" aria-label="crystal ball">🔮</span> AI-powered career path predictions based on your skills, experience, and industry trends.
          </Typography>
          <Tooltip title="Try our 'What if?' simulator to see how changing your skills affects your career path">
            <IconButton 
              color={simulationMode ? "secondary" : "primary"} 
              onClick={() => setSimulationMode(!simulationMode)}
              size="small"
            >
              <PsychologyIcon />
            </IconButton>
          </Tooltip>
      </Box>
      
        {simulationMode && renderSimulationForm()}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {simulationMode && simulationResults ? (
              renderSimulationResults()
            ) : (
          <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Your Predicted Career Path:
                </Typography>
                {predictions.map((prediction, index) => (
                  renderPredictionCard(prediction)
                ))}
              </Box>
            )}
          </>
        )}
        
        {/* Add Skill Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Add New Skill</DialogTitle>
          <DialogContent>
            <Typography variant="body2" paragraph>
              Add a new skill to see how it would impact your career predictions.
            </Typography>
            <Autocomplete
              value={skillToAdd}
              onChange={(event, newValue) => setSkillToAdd(newValue)}
              options={allSkills.filter(skill => !userProfile?.skills?.some(s => s.name === skill))}
              renderInput={(params) => (
                <TextField {...params} label="Select a Skill" fullWidth margin="normal" />
              )}
            />
            <Box sx={{ mt: 2 }}>
              <Typography id="new-skill-level-slider" gutterBottom>
                Initial Skill Level: {skillLevel}/5
              </Typography>
              <Slider
                value={skillLevel}
                onChange={handleSkillLevelChange}
                aria-labelledby="new-skill-level-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={5}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button 
              onClick={handleAddSkill} 
              variant="contained" 
              color="primary"
              disabled={!skillToAdd}
            >
              Add & Simulate
        </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CareerPredictionSection; 