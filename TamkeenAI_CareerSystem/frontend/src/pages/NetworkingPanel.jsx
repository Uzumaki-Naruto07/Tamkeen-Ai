import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Divider,
  Chip, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon, ListItemAvatar,
  TextField, InputAdornment, CircularProgress, Avatar,
  Alert, Dialog, DialogTitle, DialogContent, Checkbox,
  DialogActions, Tab, Tabs, Badge, LinearProgress, FormControlLabel,
  Menu, MenuItem, Tooltip, Select, FormControl, InputLabel,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  Person, Add, Edit, Delete, Link,
  LinkedIn, Twitter, Email, Phone,
  CalendarToday, EventNote, CheckCircle,
  ExpandMore, FilterList, Sort, Search,
  MoreVert, StarOutline, Star, Flag,
  BusinessCenter, School, LocationOn,
  NotificationsActive, Public, PeopleAlt,
  AccountTree
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const NetworkingPanel = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connections, setConnections] = useState([]);
  const [filteredConnections, setFilteredConnections] = useState([]);
  const [connectionGroups, setConnectionGroups] = useState([]);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('lastContact');
  const [currentTabIndex, setCurrentTabIndex] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    position: '',
    email: '',
    phone: '',
    linkedIn: '',
    twitter: '',
    notes: '',
    group: '',
    priority: 'medium',
    lastContact: new Date(),
    nextContact: null,
    reminderSet: false
  });
  const [newGroupName, setNewGroupName] = useState('');
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [networkingGoals, setNetworkingGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [goalFormData, setGoalFormData] = useState({
    title: '',
    description: '',
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    completed: false,
    progress: 0
  });
  const [editingGoal, setEditingGoal] = useState(false);
  
  const { profile } = useUser();
  
  // Fetch user's connections and goals
  useEffect(() => {
    const fetchNetworkingData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch connections
        const connectionsResponse = await apiEndpoints.networking.getConnections(profile.id);
        const connectionsData = connectionsResponse.data || [];
        setConnections(connectionsData);
        setFilteredConnections(connectionsData);
        
        // Extract unique groups
        const groups = [...new Set(connectionsData.map(conn => conn.group).filter(Boolean))];
        setConnectionGroups(groups);
        
        // Fetch networking goals
        const goalsResponse = await apiEndpoints.networking.getGoals(profile.id);
        setNetworkingGoals(goalsResponse.data || []);
      } catch (err) {
        setError('Failed to load networking data');
        console.error('Error fetching networking data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNetworkingData();
  }, [profile]);
  
  // Apply filters and sorting when connections, search term, filter, or sort changes
  useEffect(() => {
    if (!connections) return;
    
    let filtered = [...connections];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(conn => 
        conn.fullName.toLowerCase().includes(term) ||
        conn.company?.toLowerCase().includes(term) ||
        conn.position?.toLowerCase().includes(term) ||
        conn.email?.toLowerCase().includes(term)
      );
    }
    
    // Apply filter
    if (filter !== 'all') {
      if (filter === 'noGroup') {
        filtered = filtered.filter(conn => !conn.group);
      } else if (filter === 'highPriority') {
        filtered = filtered.filter(conn => conn.priority === 'high');
      } else if (filter === 'needsFollowUp') {
        const today = new Date();
        filtered = filtered.filter(conn => 
          conn.nextContact && new Date(conn.nextContact) <= today
        );
      } else {
        // Filter by group
        filtered = filtered.filter(conn => conn.group === filter);
      }
    }
    
    // Apply sorting
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sortBy === 'company') {
      filtered.sort((a, b) => {
        if (!a.company) return 1;
        if (!b.company) return -1;
        return a.company.localeCompare(b.company);
      });
    } else if (sortBy === 'lastContact') {
      filtered.sort((a, b) => {
        if (!a.lastContact) return 1;
        if (!b.lastContact) return -1;
        return new Date(b.lastContact) - new Date(a.lastContact);
      });
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      filtered.sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    }
    
    setFilteredConnections(filtered);
  }, [connections, searchTerm, filter, sortBy]);
  
  // Handle dialog open for adding/editing connection
  const handleOpenDialog = (connection = null) => {
    if (connection) {
      setFormData({
        ...connection,
        lastContact: connection.lastContact ? new Date(connection.lastContact) : new Date(),
        nextContact: connection.nextContact ? new Date(connection.nextContact) : null
      });
      setEditMode(true);
    } else {
      setFormData({
        fullName: '',
        company: '',
        position: '',
        email: '',
        phone: '',
        linkedIn: '',
        twitter: '',
        notes: '',
        group: '',
        priority: 'medium',
        lastContact: new Date(),
        nextContact: null,
        reminderSet: false
      });
      setEditMode(false);
    }
    
    setDialogOpen(true);
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle date change
  const handleDateChange = (name, date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };
  
  // Handle save connection
  const handleSaveConnection = async () => {
    try {
      if (editMode) {
        // Update existing connection
        await apiEndpoints.networking.updateConnection(profile.id, selectedConnection.id, formData);
      } else {
        // Create new connection
        await apiEndpoints.networking.addConnection(profile.id, formData);
      }
      // Refresh connections
      const connectionsResponse = await apiEndpoints.networking.getConnections(profile.id);
      setConnections(connectionsResponse.data || []);
      setFilteredConnections(connectionsResponse.data || []);
      setDialogOpen(false);
    } catch (err) {
      setError('Failed to save connection');
      console.error('Error saving connection:', err);
    }
  };
  
  // Handle delete connection
  const handleDeleteConnection = async () => {
    try {
      await apiEndpoints.networking.deleteConnection(profile.id, connectionToDelete.id);
      // Refresh connections
      const connectionsResponse = await apiEndpoints.networking.getConnections(profile.id);
      setConnections(connectionsResponse.data || []);
      setFilteredConnections(connectionsResponse.data || []);
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Failed to delete connection');
      console.error('Error deleting connection:', err);
    }
  };
  
  // Handle create group
  const handleCreateGroup = async () => {
    try {
      await apiEndpoints.networking.addGroup(profile.id, newGroupName);
      // Refresh groups
      const connectionsResponse = await apiEndpoints.networking.getConnections(profile.id);
      setConnections(connectionsResponse.data || []);
      setFilteredConnections(connectionsResponse.data || []);
      setGroupDialogOpen(false);
    } catch (err) {
      setError('Failed to create group');
      console.error('Error creating group:', err);
    }
  };
  
  // Handle goal input change
  const handleGoalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGoalFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle goal date change
  const handleGoalDateChange = (name, date) => {
    setGoalFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };
  
  // Handle save goal
  const handleSaveGoal = async () => {
    try {
      if (editingGoal) {
        // Update existing goal
        await apiEndpoints.networking.updateGoal(profile.id, selectedGoal.id, goalFormData);
      } else {
        // Create new goal
        await apiEndpoints.networking.addGoal(profile.id, goalFormData);
      }
      // Refresh goals
      const goalsResponse = await apiEndpoints.networking.getGoals(profile.id);
      setNetworkingGoals(goalsResponse.data || []);
      setGoalDialogOpen(false);
    } catch (err) {
      setError('Failed to save goal');
      console.error('Error saving goal:', err);
    }
  };
  
  return (
    <Box sx={{ py: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Networking Panel
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Add Connection
          </Button>
        </Box>
        
        <Typography variant="body1" paragraph>
          Manage your professional connections and networking activities.
        </Typography>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <LoadingSpinner message="Loading networking data..." />
      ) : connections.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No Connections Found
          </Typography>
          <Typography variant="body1" paragraph>
            You haven't saved any connections yet.
          </Typography>
          <Button
            variant="contained"
            onClick={() => setDialogOpen(true)}
          >
            Add Connection
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Connections list */}
          <Grid item xs={12} md={3}>
            {/* Implement connections list component */}
          </Grid>
          
          {/* Connections details */}
          <Grid item xs={12} md={9}>
            {currentTabIndex === 0 && (
              <Paper sx={{ p: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Connections
                </Typography>
                
                <Typography variant="body2" paragraph>
                  Manage your professional connections and their details.
                </Typography>
                
                {/* Implement connections list component */}
              </Paper>
            )}
            
            {currentTabIndex === 1 && (
              <Paper sx={{ p: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Connection Map
                </Typography>
                
                <Typography variant="body2" paragraph>
                  Visualizing professional connections and their relationships can help identify networking opportunities.
                </Typography>
                
                <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.default', borderRadius: 1 }}>
                  <AccountTree sx={{ fontSize: 100, color: 'text.secondary', opacity: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    Connection mapping visualization will appear here.
                  </Typography>
                </Box>
              </Paper>
            )}
            
            {currentTabIndex === 2 && (
              <Paper sx={{ p: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Networking Goals
                </Typography>
                
                <Typography variant="body2" paragraph>
                  Set and manage your networking goals to achieve your career objectives.
                </Typography>
                
                {/* Implement networking goals component */}
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
      
      {/* Connection Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Edit Connection' : 'Add New Connection'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name"
                fullWidth
                required
                margin="normal"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Company"
                fullWidth
                margin="normal"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Position"
                fullWidth
                margin="normal"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                margin="normal"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Group</InputLabel>
                <Select
                  name="group"
                  value={formData.group}
                  onChange={handleInputChange}
                  label="Group"
                >
                  <MenuItem value="">None</MenuItem>
                  {connectionGroups.map(group => (
                    <MenuItem key={group} value={group}>
                      {group}
                    </MenuItem>
                  ))}
                  <MenuItem divider />
                  <MenuItem 
                    value="__new__"
                    onClick={(e) => {
                      e.stopPropagation();
                      setGroupDialogOpen(true);
                    }}
                  >
                    <Add fontSize="small" sx={{ mr: 1 }} />
                    Create New Group
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mt: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Last Contact Date"
                    value={formData.lastContact}
                    onChange={(date) => handleDateChange('lastContact', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mt: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Next Contact Date"
                    value={formData.nextContact}
                    onChange={(date) => handleDateChange('nextContact', date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Box>
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.reminderSet}
                    onChange={handleInputChange}
                    name="reminderSet"
                  />
                }
                label="Set reminder for next contact"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="LinkedIn URL"
                fullWidth
                margin="normal"
                name="linkedIn"
                value={formData.linkedIn}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkedIn />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Twitter Handle"
                fullWidth
                margin="normal"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Twitter />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          
          <Button 
            variant="contained"
            onClick={handleSaveConnection}
            disabled={!formData.fullName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* New Group Dialog */}
      <Dialog
        open={groupDialogOpen}
        onClose={() => setGroupDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Create New Group
        </DialogTitle>
        
        <DialogContent>
          <TextField
            autoFocus
            label="Group Name"
            fullWidth
            margin="normal"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setGroupDialogOpen(false)}>
            Cancel
          </Button>
          
          <Button 
            variant="contained"
            onClick={handleCreateGroup}
            disabled={!newGroupName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete Connection
        </DialogTitle>
        
        <DialogContent>
          <Typography>
            Are you sure you want to delete {connectionToDelete?.fullName}? This action cannot be undone.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          
          <Button 
            variant="contained"
            color="error"
            onClick={handleDeleteConnection}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Goal Dialog */}
      <Dialog
        open={goalDialogOpen}
        onClose={() => setGoalDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingGoal ? 'Edit Goal' : 'Add Networking Goal'}
        </DialogTitle>
        
        <DialogContent dividers>
          <TextField
            label="Goal Title"
            fullWidth
            required
            margin="normal"
            name="title"
            value={goalFormData.title}
            onChange={handleGoalInputChange}
          />
          
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            name="description"
            value={goalFormData.description}
            onChange={handleGoalInputChange}
          />
          
          <Box sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Target Date"
                value={goalFormData.targetDate}
                onChange={(date) => handleGoalDateChange('targetDate', date)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Box>
          
          {editingGoal && (
            <>
              <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
                Progress: {goalFormData.progress}%
              </Typography>
              
              <LinearProgress 
                variant="determinate" 
                value={goalFormData.progress} 
                sx={{ height: 10, borderRadius: 1 }}
              />
              
              <TextField
                label="Progress (%)"
                fullWidth
                margin="normal"
                name="progress"
                type="number"
                inputProps={{ min: 0, max: 100 }}
                value={goalFormData.progress}
                onChange={handleGoalInputChange}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={goalFormData.completed}
                    onChange={handleGoalInputChange}
                    name="completed"
                  />
                }
                label="Mark as completed"
              />
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setGoalDialogOpen(false)}>
            Cancel
          </Button>
          
          <Button 
            variant="contained"
            onClick={handleSaveGoal}
            disabled={!goalFormData.title.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NetworkingPanel; 