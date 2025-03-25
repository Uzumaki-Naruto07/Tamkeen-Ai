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
  Grid
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DashboardAPI from '../../api/DashboardAPI';

const CareerPathsSection = ({ careerPaths }) => {
  const [selectedView, setSelectedView] = useState('paths');
  const [selectedPath, setSelectedPath] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLearningPath, setSelectedLearningPath] = useState(null);

  const { career_paths, learning_paths, current_role, target_role } = careerPaths;
  
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
        </Tabs>
        
        {selectedView === 'paths' ? (
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
        ) : (
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
        
        {/* Career Path Details Dialog */}
        <Dialog open={openDialog && selectedPath} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{selectedPath?.path_name}</DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1" gutterBottom>Compatibility: {selectedPath?.compatibility}%</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Entry Roles</Typography>
              <Grid container spacing={2}>
                {selectedPath?.entry_roles.map((role, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body1" fontWeight="bold">{role.role}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {role.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {role.required_skills.map((skill, i) => (
                            <Chip key={i} label={skill} size="small" />
                          ))}
                        </Box>
                        {role.skill_match && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption">
                              Skill Match: {role.skill_match}%
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Mid-Level Roles</Typography>
              <Grid container spacing={2}>
                {selectedPath?.mid_roles.map((role, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body1" fontWeight="bold">{role.role}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {role.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {role.required_skills.map((skill, i) => (
                            <Chip key={i} label={skill} size="small" />
                          ))}
                        </Box>
                        {role.skill_match && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption">
                              Skill Match: {role.skill_match}%
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>Advanced Roles</Typography>
              <Grid container spacing={2}>
                {selectedPath?.advanced_roles.map((role, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="body1" fontWeight="bold">{role.role}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {role.description}
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {role.required_skills.map((skill, i) => (
                            <Chip key={i} label={skill} size="small" />
                          ))}
                        </Box>
                        {role.skill_match && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption">
                              Skill Match: {role.skill_match}%
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>Skill Gaps to Address</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedPath?.skill_gaps.map((skill, i) => (
                  <Chip key={i} label={skill} color="warning" variant="outlined" />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
        
        {/* Learning Path Details Dialog */}
        <Dialog open={openDialog && selectedLearningPath} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>{selectedLearningPath?.path_name}</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" paragraph>
              {selectedLearningPath?.description}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Target Role</Typography>
              <Typography variant="body1">{selectedLearningPath?.target_role}</Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Your Match</Typography>
              <Typography variant="body1">{selectedLearningPath?.match_percentage}%</Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Estimated Time to Complete</Typography>
              <Typography variant="body1">{selectedLearningPath?.estimated_time}</Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Required Skills</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedLearningPath?.required_skills.map((skill, i) => (
                  <Chip key={i} label={skill} size="small" />
                ))}
              </Box>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Skill Gaps to Address</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedLearningPath?.skill_gaps.map((skill, i) => (
                  <Chip key={i} label={skill} color="warning" variant="outlined" />
                ))}
              </Box>
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>Recommended Resources</Typography>
            <List>
              {selectedLearningPath?.recommended_resources.map((resource, index) => (
                <ListItem key={index} divider={index < selectedLearningPath.recommended_resources.length - 1}>
                  <ListItemText
                    primary={resource.name}
                    secondary={
                      <Box>
                        <Typography variant="body2">For: {resource.skill}</Typography>
                        <Typography variant="body2">
                          {resource.type} • {resource.provider} • {resource.difficulty}
                        </Typography>
                      </Box>
                    }
                  />
                  <Button 
                    variant="outlined" 
                    size="small" 
                    component="a" 
                    href={resource.url} 
                    target="_blank"
                    onClick={() => trackActivity(`Clicked resource: ${resource.name}`)}
                  >
                    Open
                  </Button>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                trackActivity(`Started learning path: ${selectedLearningPath?.path_name}`);
                handleCloseDialog();
                // In a real app, you might start the learning path or add to user's plan
              }}
            >
              Start This Path
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CareerPathsSection; 