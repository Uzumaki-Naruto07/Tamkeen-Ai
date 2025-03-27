import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Divider,
  Grid,
  Paper,
  Stack,
  Avatar,
  Tooltip,
  Step,
  Stepper,
  StepLabel,
  StepContent
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimelineIcon from '@mui/icons-material/Timeline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import MapIcon from '@mui/icons-material/Map';
import StarIcon from '@mui/icons-material/Star';
import DashboardAPI from '../../api/DashboardAPI';
import { styled } from '@mui/material/styles';

// Custom styled components
const LocationCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4]
  }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  width: 56,
  height: 56,
  marginBottom: theme.spacing(1)
}));

const CareerPathsSection = ({ careerPaths }) => {
  const [selectedView, setSelectedView] = useState('paths');
  const [selectedPath, setSelectedPath] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLearningPath, setSelectedLearningPath] = useState(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { career_paths, learning_paths, current_role, target_role, switch_suggestions = [], job_opportunities = [] } = careerPaths;
  
  const handleViewChange = (event, newValue) => {
    setSelectedView(newValue);
  };
  
  const handleOpenPathDetails = (pathName) => {
    setSelectedPath(career_paths[pathName]);
    setOpenDialog(true);
  };
  
  const handleOpenLearningPath = (index) => {
    setSelectedLearningPath(learning_paths[index]);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPath(null);
    setSelectedLearningPath(null);
    setSelectedRoadmap(null);
    setSelectedLocation(null);
  };
  
  const trackActivity = async (action) => {
    try {
      const userId = localStorage.getItem('userId'); // Or get from auth context
      await DashboardAPI.trackUserActivity(userId, {
        activity_type: 'career_path_interaction',
        description: action,
        feature: 'career_paths'
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  const handleOpenRoadmap = (pathName) => {
    setSelectedRoadmap({ 
      pathName,
      pathData: career_paths[pathName]
    });
    setOpenDialog(true);
    trackActivity(`Viewed ${pathName} career roadmap`);
  };

  const handleOpenLocationDetails = (location) => {
    setSelectedLocation(location);
    setOpenDialog(true);
    trackActivity(`Viewed opportunities in ${location.city}`);
  };
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Career Paths</Typography>
          <Box>
            <Chip 
              icon={<WorkIcon />} 
              label={`Current: ${current_role}`} 
              size="small" 
              sx={{ mr: 1 }} 
            />
            <Chip 
              icon={<TrendingUpIcon />} 
              label={`Target: ${target_role}`} 
              color="primary" 
              size="small" 
            />
          </Box>
        </Box>
        
        <Tabs value={selectedView} onChange={handleViewChange} sx={{ mb: 2 }}>
          <Tab label="Career Paths" value="paths" />
          <Tab label="Learning Plans" value="learning" />
          <Tab label="Roadmap" value="roadmap" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Career Switch" value="switch" icon={<CompareArrowsIcon />} iconPosition="start" />
          <Tab label="Opportunities" value="map" icon={<LocationOnIcon />} iconPosition="start" />
        </Tabs>
        
        {selectedView === 'paths' && (
          <List sx={{ maxHeight: 320, overflow: 'auto' }}>
            {Object.entries(career_paths).map(([pathName, pathData], index) => (
              <ListItem 
                key={pathName} 
                divider={index < Object.keys(career_paths).length - 1}
                secondaryAction={
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => {
                      handleOpenPathDetails(pathName);
                      trackActivity(`Viewed ${pathName} career path`);
                    }}
                  >
                    Details
                  </Button>
                }
              >
                <ListItemText 
                  primary={pathName} 
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Chip 
                        label={`${pathData.compatibility}% Match`} 
                        size="small" 
                        color={pathData.compatibility > 80 ? "success" : "primary"} 
                        variant="outlined"
                      />
                    </Box>
                  } 
                />
              </ListItem>
            ))}
          </List>
        )}
        
        {selectedView === 'learning' && (
          <List sx={{ maxHeight: 320, overflow: 'auto' }}>
            {learning_paths.map((path, index) => (
              <ListItem 
                key={index} 
                divider={index < learning_paths.length - 1}
                secondaryAction={
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => {
                      handleOpenLearningPath(index);
                      trackActivity(`Viewed ${path.path_name} learning path`);
                    }}
                  >
                    View Plan
                  </Button>
                }
              >
                <ListItemText 
                  primary={path.path_name} 
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <SchoolIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {path.estimated_time}
                      </Typography>
                      <Chip 
                        label={`${path.match_percentage}% Match`} 
                        size="small" 
                        color={path.match_percentage > 80 ? "success" : "primary"} 
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  } 
                />
              </ListItem>
            ))}
          </List>
        )}
        
        {/* New Interactive Roadmap Tab */}
        {selectedView === 'roadmap' && (
          <List sx={{ maxHeight: 320, overflow: 'auto' }}>
            {Object.entries(career_paths).map(([pathName, pathData], index) => (
              <ListItem 
                key={pathName} 
                divider={index < Object.keys(career_paths).length - 1}
                secondaryAction={
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    startIcon={<TimelineIcon />}
                    onClick={() => handleOpenRoadmap(pathName)}
                  >
                    View Roadmap
                  </Button>
                }
              >
                <ListItemText 
                  primary={pathName} 
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        From {current_role} to {target_role}
                      </Typography>
                    </Box>
                  } 
                />
              </ListItem>
            ))}
          </List>
        )}
        
        {/* New Career Switch Suggestions Tab */}
        {selectedView === 'switch' && (
          <List sx={{ maxHeight: 320, overflow: 'auto' }}>
            {switch_suggestions.length > 0 ? (
              switch_suggestions.map((suggestion, index) => (
                <ListItem 
                  key={index} 
                  divider={index < switch_suggestions.length - 1}
                  sx={{ display: 'block' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {suggestion.from_role}
                    </Typography>
                    <ArrowForwardIcon sx={{ mx: 1 }} />
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {suggestion.to_role}
                    </Typography>
                    <Chip 
                      label={`${suggestion.match_percentage}% Match`} 
                      size="small" 
                      color={suggestion.match_percentage > 80 ? "success" : 
                             suggestion.match_percentage > 60 ? "primary" : "warning"} 
                      sx={{ ml: 2 }}
                    />
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {suggestion.description}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" display="block">
                        Transferable Skills:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {suggestion.transferable_skills.map((skill, i) => (
                          <Chip key={i} label={skill} size="small" color="success" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" display="block">
                        Skills to Develop:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {suggestion.skills_to_develop.map((skill, i) => (
                          <Chip key={i} label={skill} size="small" color="warning" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography color="text.secondary">
                  No career switch suggestions available based on your skills.
                </Typography>
              </Box>
            )}
          </List>
        )}
        
        {/* New Map View of Opportunities Tab - Using Grid instead of actual map */}
        {selectedView === 'map' && (
          <Box sx={{ height: 320, overflow: 'auto' }}>
            {job_opportunities.length > 0 ? (
              <Grid container spacing={2}>
                {job_opportunities.map((location, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <LocationCard onClick={() => handleOpenLocationDetails(location)}>
                      <StyledAvatar>
                        <LocationOnIcon />
                      </StyledAvatar>
                      <Typography variant="h6">{location.city}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {location.job_count} opportunities
                      </Typography>
                      <Chip 
                        size="small" 
                        label={location.salary_range}
                        sx={{ mt: 1 }}
                      />
                    </LocationCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography color="text.secondary">
                  No location-based job opportunity data available.
                </Typography>
              </Box>
            )}
          </Box>
        )}
        
        {/* New Interactive Roadmap Dialog - Using MUI Stepper instead of ReactFlow */}
        <Dialog open={openDialog && selectedRoadmap} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Career Roadmap: {selectedRoadmap?.pathName}</DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1" gutterBottom>
              Career progression from {current_role} to {target_role}
            </Typography>
            
            <Stepper orientation="vertical" sx={{ mt: 3 }}>
              <Step active completed>
                <StepLabel StepIconComponent={() => (
                  <Avatar sx={{ bgcolor: 'info.light', width: 30, height: 30 }}>
                    <WorkIcon fontSize="small" />
                  </Avatar>
                )}>
                  Current Role
                </StepLabel>
                <StepContent>
                  <Typography variant="body1">{current_role}</Typography>
                  <Typography variant="body2" color="text.secondary">Your current position</Typography>
                </StepContent>
              </Step>
              
              {selectedRoadmap?.pathData?.entry_roles.map((role, index) => (
                <Step active key={`entry-${index}`}>
                  <StepLabel StepIconComponent={() => (
                    <Avatar sx={{ bgcolor: 'success.light', width: 30, height: 30 }}>
                      <WorkHistoryIcon fontSize="small" />
                    </Avatar>
                  )}>
                    Entry Level
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body1" fontWeight="bold">{role.role}</Typography>
                    <Typography variant="body2">{role.description}</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip label={`${role.skill_match}% Match`} size="small" color="primary" />
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {role.required_skills.slice(0, 3).map((skill, i) => (
                        <Chip key={i} label={skill} size="small" variant="outlined" />
                      ))}
                      {role.required_skills.length > 3 && (
                        <Chip label={`+${role.required_skills.length - 3} more`} size="small" />
                      )}
                    </Box>
                  </StepContent>
                </Step>
              ))}
              
              {selectedRoadmap?.pathData?.mid_roles.map((role, index) => (
                <Step active key={`mid-${index}`}>
                  <StepLabel StepIconComponent={() => (
                    <Avatar sx={{ bgcolor: 'warning.light', width: 30, height: 30 }}>
                      <WorkHistoryIcon fontSize="small" />
                    </Avatar>
                  )}>
                    Mid-Level
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body1" fontWeight="bold">{role.role}</Typography>
                    <Typography variant="body2">{role.description}</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip label={`${role.skill_match}% Match`} size="small" color="primary" />
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {role.required_skills.slice(0, 3).map((skill, i) => (
                        <Chip key={i} label={skill} size="small" variant="outlined" />
                      ))}
                      {role.required_skills.length > 3 && (
                        <Chip label={`+${role.required_skills.length - 3} more`} size="small" />
                      )}
                    </Box>
                  </StepContent>
                </Step>
              ))}
              
              {selectedRoadmap?.pathData?.advanced_roles.map((role, index) => (
                <Step active key={`advanced-${index}`}>
                  <StepLabel StepIconComponent={() => (
                    <Avatar sx={{ bgcolor: 'secondary.light', width: 30, height: 30 }}>
                      <StarIcon fontSize="small" />
                    </Avatar>
                  )}>
                    Advanced Level
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body1" fontWeight="bold">{role.role}</Typography>
                    <Typography variant="body2">{role.description}</Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip label={`${role.skill_match}% Match`} size="small" color="primary" />
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {role.required_skills.slice(0, 3).map((skill, i) => (
                        <Chip key={i} label={skill} size="small" variant="outlined" />
                      ))}
                      {role.required_skills.length > 3 && (
                        <Chip label={`+${role.required_skills.length - 3} more`} size="small" />
                      )}
                    </Box>
                  </StepContent>
                </Step>
              ))}
              
              <Step active>
                <StepLabel StepIconComponent={() => (
                  <Avatar sx={{ bgcolor: 'error.light', width: 30, height: 30 }}>
                    <TrendingUpIcon fontSize="small" />
                  </Avatar>
                )}>
                  Target Role
                </StepLabel>
                <StepContent>
                  <Typography variant="body1" fontWeight="bold">{target_role}</Typography>
                  <Typography variant="body2" color="text.secondary">Your career goal</Typography>
                </StepContent>
              </Step>
            </Stepper>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Key Skills Needed:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {selectedRoadmap?.pathData?.skill_gaps.map((skill, i) => (
                  <Chip key={i} label={skill} color="primary" variant="outlined" />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
            <Button variant="contained" color="primary">
              Generate Learning Plan
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* New Location Opportunities Dialog */}
        <Dialog open={openDialog && selectedLocation} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Opportunities in {selectedLocation?.city}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  {selectedLocation?.job_count} job openings match your profile
                </Typography>
                <Typography variant="body2">
                  Average salary range: {selectedLocation?.salary_range}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
                <MapIcon fontSize="large" />
              </Avatar>
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>Top Companies</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {selectedLocation?.top_companies?.map((company, idx) => (
                <Chip key={idx} label={company} color="primary" variant="outlined" />
              ))}
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>Job Openings</Typography>
            <List>
              {selectedLocation?.jobs?.map((job, index) => (
                <ListItem key={index} divider={index < selectedLocation.jobs.length - 1}>
                  <ListItemText
                    primary={job.title}
                    secondary={
                      <Box>
                        <Typography variant="body2">{job.company}</Typography>
                        <Typography variant="body2">{job.salary}</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {job.skills.map((skill, i) => (
                            <Chip key={i} label={skill} size="small" />
                          ))}
                        </Box>
                      </Box>
                    }
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    component="a" 
                    href={job.url} 
                    target="_blank"
                    onClick={() => trackActivity(`Clicked job: ${job.title} at ${job.company}`)}
                  >
                    Apply
                  </Button>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
            <Button 
              variant="contained"
              startIcon={<LocationOnIcon />}
              onClick={() => {
                window.open(`https://maps.google.com/?q=${selectedLocation?.city}`, '_blank');
                trackActivity(`Opened map for ${selectedLocation?.city}`);
              }}
            >
              View on Google Maps
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CareerPathsSection; 