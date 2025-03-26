import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Menu,
  Tabs,
  Tab,
  LinearProgress,
  Collapse
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FlagIcon from '@mui/icons-material/Flag';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import GroupIcon from '@mui/icons-material/Group';
import BarChartIcon from '@mui/icons-material/BarChart';
import BookIcon from '@mui/icons-material/Book';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LinkIcon from '@mui/icons-material/Link';
import LaunchIcon from '@mui/icons-material/Launch';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import InfoIcon from '@mui/icons-material/Info';
import EventIcon from '@mui/icons-material/Event';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import format from 'date-fns/format';
import { styled } from '@mui/material/styles';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// Styled components for enhanced timeline appearance
const StyledTimelineDot = styled(TimelineDot)(({ theme, color }) => ({
  boxShadow: theme.shadows[3],
  '&.active': {
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
    boxShadow: `0 3px 5px 2px rgba(${theme.palette.primary.main}, .3)`
  },
  '&.future': {
    background: color === 'default' ? theme.palette.grey[300] : '',
    opacity: 0.8
  }
}));

const StyledTimelineConnector = styled(TimelineConnector)(({ theme }) => ({
  width: 3,
  background: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.grey[400]})`
}));

const CareerPathTimeline = ({
  userCareer = {},
  careerPaths = [],
  recommendations = [],
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  onSetGoal,
  onCompare,
  loading = false
}) => {
  // State
  const [activeTimeline, setActiveTimeline] = useState('past');
  const [careerData, setCareerData] = useState({
    past: userCareer.history || [],
    future: userCareer.projectedPath || []
  });
  const [selectedPathIndex, setSelectedPathIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [skillsDialogOpen, setSkillsDialogOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [requirementsOpen, setRequirementsOpen] = useState({});
  
  // Icons map for different milestone types
  const milestoneIcons = {
    work: <WorkIcon />,
    education: <SchoolIcon />,
    certification: <VerifiedUserIcon />,
    award: <EmojiEventsIcon />,
    project: <AssignmentIcon />,
    goal: <FlagIcon />,
    skill: <PsychologyIcon />
  };
  
  // Default colors for different milestone types
  const milestoneColors = {
    work: 'primary',
    education: 'secondary',
    certification: 'success',
    award: 'warning',
    project: 'info',
    goal: 'error',
    skill: 'default'
  };
  
  // Effects
  useEffect(() => {
    if (userCareer.history) {
      setCareerData(prev => ({
        ...prev,
        past: userCareer.history
      }));
    }
    
    if (userCareer.projectedPath) {
      setCareerData(prev => ({
        ...prev,
        future: userCareer.projectedPath
      }));
    }
  }, [userCareer]);
  
  // Handlers
  const handleOpenDialog = (type, milestone = null) => {
    setDialogType(type);
    setCurrentMilestone(milestone);
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentMilestone(null);
  };
  
  const handleMenuOpen = (event, milestoneId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedMilestoneId(milestoneId);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMilestoneId(null);
  };
  
  const handleAddMilestone = (newMilestone) => {
    if (onAddMilestone) {
      onAddMilestone(newMilestone);
    } else {
      // Local state update for demo
      const timeline = newMilestone.date < new Date() ? 'past' : 'future';
      setCareerData(prev => ({
        ...prev,
        [timeline]: [...prev[timeline], { ...newMilestone, id: Date.now().toString() }]
      }));
    }
    handleCloseDialog();
  };
  
  const handleEditMilestone = (updatedMilestone) => {
    if (onEditMilestone) {
      onEditMilestone(updatedMilestone);
    } else {
      // Local state update for demo
      const isPast = updatedMilestone.date < new Date();
      const timeline = isPast ? 'past' : 'future';
      
      setCareerData(prev => ({
        ...prev,
        [timeline]: prev[timeline].map(m => 
          m.id === updatedMilestone.id ? updatedMilestone : m
        )
      }));
    }
    handleCloseDialog();
  };
  
  const handleDeleteMilestone = () => {
    if (onDeleteMilestone) {
      onDeleteMilestone(selectedMilestoneId);
    } else {
      // Local state update for demo
      setCareerData(prev => ({
        past: prev.past.filter(m => m.id !== selectedMilestoneId),
        future: prev.future.filter(m => m.id !== selectedMilestoneId)
      }));
    }
    handleMenuClose();
  };
  
  const handlePathChange = (index) => {
    setSelectedPathIndex(index);
    // In a real app, fetch detailed career path data here
    
    // For demo, simulate path change
    if (careerPaths[index]) {
      setCareerData(prev => ({
        ...prev,
        future: careerPaths[index].milestones || []
      }));
    }
  };
  
  const handleToggleRequirements = (milestoneId) => {
    setRequirementsOpen(prev => ({
      ...prev,
      [milestoneId]: !prev[milestoneId]
    }));
  };
  
  const handleOpenSkillsDialog = (skills) => {
    setSelectedSkills(skills);
    setSkillsDialogOpen(true);
  };
  
  // Render functions
  const renderTimeline = () => {
    // Combine past and future milestones when viewing the full timeline
    const milestones = activeTimeline === 'all' 
      ? [...careerData.past, ...careerData.future].sort((a, b) => new Date(a.date) - new Date(b.date))
      : careerData[activeTimeline];
    
    return (
      <Timeline position="alternate">
        {milestones.map((milestone, index) => {
          const isPast = new Date(milestone.date) < new Date();
          const isCurrent = milestone.current;
          const dotStatus = isCurrent ? 'active' : isPast ? 'past' : 'future';
          
          return (
            <TimelineItem key={milestone.id || index}>
              <TimelineOppositeContent color="text.secondary">
                {milestone.date ? format(new Date(milestone.date), 'MMM yyyy') : 'Ongoing'}
                {milestone.endDate && ` - ${format(new Date(milestone.endDate), 'MMM yyyy')}`}
              </TimelineOppositeContent>
              
              <TimelineSeparator>
                <Tooltip title={milestone.type}>
                  <StyledTimelineDot 
                    className={dotStatus}
                    color={milestoneColors[milestone.type] || 'primary'}
                    variant={isPast ? "filled" : "outlined"}
                  >
                    {milestoneIcons[milestone.type] || <WorkIcon />}
                  </StyledTimelineDot>
                </Tooltip>
                
                {index < milestones.length - 1 && <StyledTimelineConnector />}
              </TimelineSeparator>
              
              <TimelineContent>
                <Card 
                  variant={isCurrent ? "elevation" : "outlined"} 
                  elevation={isCurrent ? 3 : 1}
                  sx={{ 
                    mb: 3,
                    borderLeft: isCurrent ? 5 : 0,
                    borderColor: 'primary.main',
                    opacity: isPast ? 1 : 0.9,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="div">
                        {milestone.title}
                      </Typography>
                      
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, milestone.id)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    <Typography color="text.secondary" gutterBottom>
                      {milestone.organization}
                    </Typography>
                    
                    {milestone.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOnIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {milestone.location}
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {milestone.description}
                    </Typography>
                    
                    {milestone.skills && milestone.skills.length > 0 && (
                      <Box sx={{ mt: 1, mb: 1 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {milestone.skills.slice(0, 3).map((skill, i) => (
                            <Chip 
                              key={i} 
                              label={skill} 
                              size="small" 
                              variant="outlined"
                            />
                          ))}
                          
                          {milestone.skills.length > 3 && (
                            <Chip
                              label={`+${milestone.skills.length - 3} more`}
                              size="small"
                              onClick={() => handleOpenSkillsDialog(milestone.skills)}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                    
                    {!isPast && milestone.requirements && (
                      <>
                        <Button 
                          size="small"
                          onClick={() => handleToggleRequirements(milestone.id)}
                          endIcon={requirementsOpen[milestone.id] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          sx={{ mt: 1 }}
                        >
                          Requirements
                        </Button>
                        
                        <Collapse in={requirementsOpen[milestone.id]} timeout="auto" unmountOnExit>
                          <List dense disablePadding>
                            {milestone.requirements.map((req, idx) => (
                              <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 30 }}>
                                  <CheckCircleIcon color="success" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={req} />
                              </ListItem>
                            ))}
                          </List>
                        </Collapse>
                      </>
                    )}
                  </CardContent>
                  
                  {!isPast && (
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<FlagIcon />}
                        onClick={() => handleOpenDialog('goal', milestone)}
                      >
                        Set as Goal
                      </Button>
                      
                      {milestone.resourceUrl && (
                        <Button 
                          size="small"
                          startIcon={<LaunchIcon />}
                          component="a"
                          href={milestone.resourceUrl}
                          target="_blank"
                        >
                          Learn More
                        </Button>
                      )}
                    </CardActions>
                  )}
                </Card>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    );
  };
  
  const renderPathSelector = () => {
    if (!careerPaths || careerPaths.length === 0) {
      return null;
    }
    
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Explore Career Paths
        </Typography>
        
        <Grid container spacing={2}>
          {careerPaths.map((path, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                variant={selectedPathIndex === index ? "elevation" : "outlined"}
                elevation={selectedPathIndex === index ? 3 : 1}
                sx={{ 
                  cursor: 'pointer',
                  borderColor: selectedPathIndex === index ? 'primary.main' : 'divider',
                  borderWidth: selectedPathIndex === index ? 2 : 1,
                  '&:hover': { boxShadow: 3 }
                }}
                onClick={() => handlePathChange(index)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {path.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {path.growthRate}% Growth Rate
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <MonetizationOnIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Avg. Salary: ${path.averageSalary.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {path.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  
  const renderMilestoneDialog = () => {
    const isEdit = dialogType === 'edit';
    const title = isEdit ? 'Edit Career Milestone' : dialogType === 'goal' ? 'Set Career Goal' : 'Add Career Milestone';
    
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={currentMilestone?.title || ''}
                  onChange={(e) => setCurrentMilestone({ ...currentMilestone, title: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization"
                  value={currentMilestone?.organization || ''}
                  onChange={(e) => setCurrentMilestone({ ...currentMilestone, organization: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={currentMilestone?.type || 'work'}
                    onChange={(e) => setCurrentMilestone({ ...currentMilestone, type: e.target.value })}
                    label="Type"
                  >
                    <MenuItem value="work">Work Experience</MenuItem>
                    <MenuItem value="education">Education</MenuItem>
                    <MenuItem value="certification">Certification</MenuItem>
                    <MenuItem value="award">Award</MenuItem>
                    <MenuItem value="project">Project</MenuItem>
                    <MenuItem value="goal">Goal</MenuItem>
                    <MenuItem value="skill">Skill Development</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={currentMilestone?.location || ''}
                  onChange={(e) => setCurrentMilestone({ ...currentMilestone, location: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={currentMilestone?.date ? new Date(currentMilestone.date) : null}
                  onChange={(newDate) => {
                    setCurrentMilestone({ ...currentMilestone, date: newDate });
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date (Optional)"
                  value={currentMilestone?.endDate ? new Date(currentMilestone.endDate) : null}
                  onChange={(newDate) => {
                    setCurrentMilestone({ ...currentMilestone, endDate: newDate });
                  }}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={currentMilestone?.description || ''}
                  onChange={(e) => setCurrentMilestone({ ...currentMilestone, description: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Skills (comma separated)"
                  value={(currentMilestone?.skills || []).join(', ')}
                  onChange={(e) => setCurrentMilestone({ 
                    ...currentMilestone, 
                    skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="e.g. Project Management, JavaScript, Leadership"
                />
              </Grid>
              
              {dialogType === 'goal' && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Setting this as a goal will add it to your career development plan
                  </Alert>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={() => {
                if (isEdit) {
                  handleEditMilestone(currentMilestone);
                } else if (dialogType === 'goal') {
                  if (onSetGoal) {
                    onSetGoal(currentMilestone);
                  }
                  handleCloseDialog();
                } else {
                  handleAddMilestone({
                    ...currentMilestone,
                    id: currentMilestone?.id || Date.now().toString()
                  });
                }
              }}
            >
              {isEdit ? 'Save Changes' : dialogType === 'goal' ? 'Set Goal' : 'Add Milestone'}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    );
  };
  
  const renderSkillsDialog = () => {
    return (
      <Dialog
        open={skillsDialogOpen}
        onClose={() => setSkillsDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Skills</DialogTitle>
        <DialogContent>
          <List dense>
            {selectedSkills.map((skill, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <PsychologyIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={skill} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  // Main render
  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5">Career Path Timeline</Typography>
        
        <Box>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => handleOpenDialog('add')}
            sx={{ mr: 1 }}
          >
            Add Milestone
          </Button>
          
          <Button
            startIcon={<CompareArrowsIcon />}
            variant={compareMode ? "contained" : "outlined"}
            color={compareMode ? "primary" : "inherit"}
            onClick={() => setCompareMode(!compareMode)}
          >
            Compare Paths
          </Button>
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Tabs 
          value={activeTimeline} 
          onChange={(e, newValue) => setActiveTimeline(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="past" label="Past & Present" />
          <Tab value="future" label="Future Projections" />
          <Tab value="all" label="Complete Timeline" />
        </Tabs>
      </Box>
      
      {activeTimeline === 'future' && renderPathSelector()}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ position: 'relative' }}>
          {renderTimeline()}
          
          {activeTimeline === 'future' && compareMode && (
            <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
              <Chip 
                color="primary" 
                icon={<CompareArrowsIcon />}
                label="Comparison Mode Active" 
                onDelete={() => setCompareMode(false)}
              />
            </Box>
          )}
        </Box>
      )}
      
      {/* Milestone Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          const milestone = [...careerData.past, ...careerData.future].find(m => m.id === selectedMilestoneId);
          handleOpenDialog('edit', milestone);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleDeleteMilestone}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleMenuClose();
          const milestone = [...careerData.past, ...careerData.future].find(m => m.id === selectedMilestoneId);
          handleOpenDialog('goal', milestone);
        }}>
          <ListItemIcon>
            <FlagIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Set as Goal</ListItemText>
        </MenuItem>
      </Menu>
      
      {renderMilestoneDialog()}
      {renderSkillsDialog()}
    </Paper>
  );
};

export default CareerPathTimeline;
