import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Divider,
  Chip, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TableSortLabel,
  TextField, InputAdornment, CircularProgress, Avatar,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions,
  Tab, Tabs, Tooltip, Menu, MenuItem, Badge, 
  Accordion, AccordionSummary, AccordionDetails, LinearProgress
} from '@mui/material';
import {
  Work, BusinessCenter, CalendarToday, LocationOn,
  Search, FilterList, Sort, MoreVert, Delete,
  CheckCircle, Cancel, Schedule, WatchLater,
  Send, Visibility, Edit, Archive, Unarchive,
  CloudDownload, FormatListBulleted, Email,
  Phone, EventNote, Launch, ExpandMore, NotificationImportant,
  Assessment, Description, Assignment, Timeline,
  VideoCall, QuestionAnswer, NoteAlt, MoveUp, 
  ViewTimeline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, formatDistance } from 'date-fns';

const ApplicationHistory = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderBy, setOrderBy] = useState('appliedDate');
  const [order, setOrder] = useState('desc');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [applicationNote, setApplicationNote] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [applicationStats, setApplicationStats] = useState({
    total: 0,
    active: 0,
    interviews: 0,
    offers: 0,
    rejected: 0
  });
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [reminderData, setReminderData] = useState({
    applicationId: null,
    reminderDate: null,
    reminderNote: ''
  });
  
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Fetch applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiEndpoints.applications.getApplications(profile.id);
        const applicationsData = response.data || [];
        setApplications(applicationsData);
        applyFilters(applicationsData);
        
        // Calculate application stats
        calculateApplicationStats(applicationsData);
      } catch (err) {
        setError('Failed to load application history');
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [profile]);
  
  // Calculate application statistics
  const calculateApplicationStats = (apps) => {
    const stats = {
      total: apps.length,
      active: 0,
      interviews: 0,
      offers: 0,
      rejected: 0
    };
    
    apps.forEach(app => {
      switch (app.status) {
        case 'applied':
        case 'in_progress':
          stats.active++;
          break;
        case 'interview_scheduled':
        case 'interview_completed':
          stats.interviews++;
          break;
        case 'offer_received':
          stats.offers++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
        default:
          break;
      }
    });
    
    setApplicationStats(stats);
  };
  
  // Apply filters and sorting
  const applyFilters = (apps = applications) => {
    let filtered = [...apps];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        app => app.jobTitle.toLowerCase().includes(term) ||
              app.company.toLowerCase().includes(term) ||
              app.location.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const isAsc = order === 'asc';
      
      switch (orderBy) {
        case 'appliedDate':
          return isAsc
            ? new Date(a.appliedDate) - new Date(b.appliedDate)
            : new Date(b.appliedDate) - new Date(a.appliedDate);
        case 'company':
          return isAsc
            ? a.company.localeCompare(b.company)
            : b.company.localeCompare(a.company);
        case 'jobTitle':
          return isAsc
            ? a.jobTitle.localeCompare(b.jobTitle)
            : b.jobTitle.localeCompare(a.jobTitle);
        case 'status':
          return isAsc
            ? a.status.localeCompare(b.status)
            : b.status.localeCompare(a.status);
        default:
          return 0;
      }
    });
    
    setFilteredApplications(filtered);
  };
  
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    applyFilters();
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event, newValue) => {
    setStatusFilter(newValue);
    setPage(0);
    applyFilters();
  };
  
  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    applyFilters();
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Open application details dialog
  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setDialogOpen(true);
  };
  
  // Open menu for application actions
  const handleMenuOpen = (event, application) => {
    setAnchorEl(event.currentTarget);
    setSelectedApplication(application);
  };
  
  // Close menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Open delete confirmation dialog
  const handleDeleteClick = () => {
    setApplicationToDelete(selectedApplication);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };
  
  // Delete application
  const handleDeleteApplication = async () => {
    if (!applicationToDelete?.id) return;
    
    try {
      await apiEndpoints.applications.deleteApplication(applicationToDelete.id);
      
      // Remove from state
      const updatedApplications = applications.filter(
        app => app.id !== applicationToDelete.id
      );
      setApplications(updatedApplications);
      applyFilters(updatedApplications);
      calculateApplicationStats(updatedApplications);
      
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };
  
  // Open notes dialog
  const handleNotesClick = () => {
    setApplicationNote(selectedApplication?.notes || '');
    setNotesDialogOpen(true);
    handleMenuClose();
  };
  
  // Save application notes
  const handleSaveNotes = async () => {
    if (!selectedApplication?.id) return;
    
    try {
      await apiEndpoints.applications.updateApplicationNotes(
        selectedApplication.id,
        applicationNote
      );
      
      // Update in state
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id
          ? { ...app, notes: applicationNote }
          : app
      );
      setApplications(updatedApplications);
      applyFilters(updatedApplications);
      
      setNotesDialogOpen(false);
    } catch (err) {
      console.error('Error saving notes:', err);
    }
  };
  
  // Open reminder dialog
  const handleReminderClick = () => {
    setReminderData({
      applicationId: selectedApplication?.id,
      reminderDate: selectedApplication?.reminder?.date || null,
      reminderNote: selectedApplication?.reminder?.note || ''
    });
    setReminderDialogOpen(true);
    handleMenuClose();
  };
  
  // Save reminder
  const handleSaveReminder = async () => {
    if (!reminderData.applicationId || !reminderData.reminderDate) return;
    
    try {
      await apiEndpoints.applications.setApplicationReminder(
        reminderData.applicationId,
        {
          date: reminderData.reminderDate,
          note: reminderData.reminderNote
        }
      );
      
      // Update in state
      const updatedApplications = applications.map(app => 
        app.id === reminderData.applicationId
          ? {
              ...app,
              reminder: {
                date: reminderData.reminderDate,
                note: reminderData.reminderNote
              }
            }
          : app
      );
      setApplications(updatedApplications);
      applyFilters(updatedApplications);
      
      setReminderDialogOpen(false);
    } catch (err) {
      console.error('Error setting reminder:', err);
    }
  };
  
  // Update application status
  const handleUpdateStatus = async (newStatus) => {
    if (!selectedApplication?.id) return;
    
    try {
      await apiEndpoints.applications.updateApplicationStatus(
        selectedApplication.id,
        newStatus
      );
      
      // Update in state
      const updatedApplications = applications.map(app => 
        app.id === selectedApplication.id
          ? { ...app, status: newStatus }
          : app
      );
      setApplications(updatedApplications);
      applyFilters(updatedApplications);
      calculateApplicationStats(updatedApplications);
      
      handleMenuClose();
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  };
  
  // Get color and icon for application status
  const getStatusInfo = (status) => {
    switch (status) {
      case 'applied':
        return { color: 'info', icon: <Send />, label: 'Applied' };
      case 'in_progress':
        return { color: 'primary', icon: <WatchLater />, label: 'In Progress' };
      case 'interview_scheduled':
        return { color: 'secondary', icon: <EventNote />, label: 'Interview Scheduled' };
      case 'interview_completed':
        return { color: 'warning', icon: <Assignment />, label: 'Interview Completed' };
      case 'offer_received':
        return { color: 'success', icon: <CheckCircle />, label: 'Offer Received' };
      case 'rejected':
        return { color: 'error', icon: <Cancel />, label: 'Rejected' };
      case 'archived':
        return { color: 'default', icon: <Archive />, label: 'Archived' };
      default:
        return { color: 'default', icon: <BusinessCenter />, label: 'Unknown' };
    }
  };
  
  // Render application statistics
  const renderApplicationStats = () => {
    return (
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" color="primary">
              {applicationStats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Applications
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" color="info.main">
              {applicationStats.active}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Applications
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" color="secondary.main">
              {applicationStats.interviews}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Interviews
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" color="success.main">
              {applicationStats.offers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Offers
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Typography variant="h4" color="error.main">
              {applicationStats.rejected}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rejections
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };
  
  // Render applications table
  const renderApplicationsTable = () => {
    return (
      <TableContainer component={Paper}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'appliedDate'}
                  direction={orderBy === 'appliedDate' ? order : 'asc'}
                  onClick={() => handleRequestSort('appliedDate')}
                >
                  Date Applied
                </TableSortLabel>
              </TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'company'}
                  direction={orderBy === 'company' ? order : 'asc'}
                  onClick={() => handleRequestSort('company')}
                >
                  Company
                </TableSortLabel>
              </TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'jobTitle'}
                  direction={orderBy === 'jobTitle' ? order : 'asc'}
                  onClick={() => handleRequestSort('jobTitle')}
                >
                  Position
                </TableSortLabel>
              </TableCell>
              
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {filteredApplications
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((application) => {
                const statusInfo = getStatusInfo(application.status);
                
                return (
                  <TableRow 
                    key={application.id}
                    hover
                    onClick={() => handleViewApplication(application)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      {application.appliedDate ? format(new Date(application.appliedDate), 'MMM d, yyyy') : 'N/A'}
                      
                      {application.reminder && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          <Badge 
                            color="secondary" 
                            variant="dot" 
                            sx={{ mr: 0.5 }}
                          />
                          Reminder: {format(new Date(application.reminder.date), 'MMM d')}
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={application.companyLogo} 
                          sx={{ width: 30, height: 30, mr: 1 }}
                          variant="rounded"
                        >
                          {application.company.charAt(0)}
                        </Avatar>
                        {application.company}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {application.jobTitle}
                      </Typography>
                      
                      <Typography variant="caption" color="text.secondary">
                        <LocationOn fontSize="small" sx={{ fontSize: 12, verticalAlign: 'middle' }} />
                        {application.location}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={statusInfo.icon}
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, application);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            
            {filteredApplications.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body1" sx={{ py: 2 }}>
                    No applications found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredApplications.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    );
  };
  
  return (
    <Box sx={{ py: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Application History
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Track and manage all your job applications in one place.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <LoadingSpinner message="Loading application history..." />
        ) : (
          <>
            {renderApplicationStats()}
            
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Tabs
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                    size="small"
                  >
                    <Tab label="All" value="all" />
                    <Tab label="Applied" value="applied" />
                    <Tab label="In Progress" value="in_progress" />
                    <Tab label="Interview" value="interview_scheduled" />
                    <Tab label="Offer" value="offer_received" />
                    <Tab label="Rejected" value="rejected" />
                  </Tabs>
                </Grid>
              </Grid>
            </Box>
            
            {renderApplicationsTable()}
          </>
        )}
      </Paper>
      
      {/* Application Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedApplication && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                  {selectedApplication.jobTitle}
                </Typography>
                
                {getStatusInfo(selectedApplication.status).icon}
              </Box>
            </DialogTitle>
            
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Company
                    </Typography>
                    <Typography variant="body1">
                      {selectedApplication.company}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">
                      {selectedApplication.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Application Date
                    </Typography>
                    <Typography variant="body1">
                      {selectedApplication.appliedDate
                        ? format(new Date(selectedApplication.appliedDate), 'MMMM d, yyyy')
                        : 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      icon={getStatusInfo(selectedApplication.status).icon}
                      label={getStatusInfo(selectedApplication.status).label}
                      color={getStatusInfo(selectedApplication.status).color}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Job Description
                    </Typography>
                    <Typography variant="body2">
                      {selectedApplication.jobDescription || 'No description available'}
                    </Typography>
                  </Box>
                  
                  {selectedApplication.salary && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Salary
                      </Typography>
                      <Typography variant="body1">
                        {typeof selectedApplication.salary === 'string'
                          ? selectedApplication.salary
                          : `$${selectedApplication.salary.toLocaleString()}`}
                      </Typography>
                    </Box>
                  )}
                  
                  {selectedApplication.contactInfo && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Contact Information
                      </Typography>
                      <Typography variant="body2">
                        {selectedApplication.contactInfo}
                      </Typography>
                    </Box>
                  )}
                  
                  {selectedApplication.applicationUrl && (
                    <Box sx={{ mb: 3 }}>
                      <Button
                        startIcon={<Launch />}
                        variant="outlined"
                        size="small"
                        onClick={() => window.open(selectedApplication.applicationUrl, '_blank')}
                      >
                        View Job Posting
                      </Button>
                    </Box>
                  )}
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Application Timeline
                </Typography>
                
                {selectedApplication.timeline && selectedApplication.timeline.length > 0 ? (
                  <Timeline>
                    {selectedApplication.timeline.map((event, index) => (
                      <TimelineItem key={index}>
                        <TimelineSeparator>
                          <TimelineDot color="primary" />
                          {index < selectedApplication.timeline.length - 1 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2">
                            {event.action}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(event.date), 'MMM d, yyyy')}
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                ) : (
                  <Typography variant="body2" sx={{ py: 2 }}>
                    No timeline events yet
                  </Typography>
                )}
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Notes
                </Typography>
                
                <Typography variant="body2">
                  {selectedApplication.notes || 'No notes added yet'}
                </Typography>
              </Box>
            </DialogContent>
            
            <DialogActions>
              <Button 
                onClick={() => setDialogOpen(false)}
                color="inherit"
              >
                Close
              </Button>
              <Button 
                startIcon={<NoteAlt />}
                onClick={handleNotesClick}
              >
                Edit Notes
              </Button>
              <Button 
                startIcon={<ViewTimeline />}
                color="primary"
                onClick={() => {
                  // Navigate to application timeline
                  navigate(`/application/${selectedApplication.id}`);
                }}
              >
                Full Timeline
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewApplication}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View Details" />
        </MenuItem>
        
        <MenuItem onClick={handleReminderClick}>
          <ListItemIcon>
            <NotificationImportant fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Set Reminder" />
        </MenuItem>
        
        <MenuItem onClick={handleNotesClick}>
          <ListItemIcon>
            <NoteAlt fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Add Notes" />
        </MenuItem>
        
        <Divider />
        
        <MenuItem disabled>
          <ListItemText 
            primary="Update Status" 
            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
          />
        </MenuItem>
        
        <MenuItem onClick={() => handleUpdateStatus('applied')}>
          <ListItemIcon>
            <Send fontSize="small" color="info" />
          </ListItemIcon>
          <ListItemText primary="Applied" />
        </MenuItem>
        
        <MenuItem onClick={() => handleUpdateStatus('in_progress')}>
          <ListItemIcon>
            <WatchLater fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="In Progress" />
        </MenuItem>
        
        <MenuItem onClick={() => handleUpdateStatus('interview_scheduled')}>
          <ListItemIcon>
            <EventNote fontSize="small" color="secondary" />
          </ListItemIcon>
          <ListItemText primary="Interview Scheduled" />
        </MenuItem>
        
        <MenuItem onClick={() => handleUpdateStatus('interview_completed')}>
          <ListItemIcon>
            <Assignment fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText primary="Interview Completed" />
        </MenuItem>
        
        <MenuItem onClick={() => handleUpdateStatus('offer_received')}>
          <ListItemIcon>
            <CheckCircle fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText primary="Offer Received" />
        </MenuItem>
        
        <MenuItem onClick={() => handleUpdateStatus('rejected')}>
          <ListItemIcon>
            <Cancel fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Rejected" />
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>
          Delete Application
        </DialogTitle>
        
        <DialogContent>
          <Typography>
            Are you sure you want to delete this application? This action cannot be undone.
          </Typography>
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          
          <Button 
            onClick={handleDeleteApplication}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notes Dialog */}
      <Dialog
        open={notesDialogOpen}
        onClose={() => setNotesDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Application Notes
        </DialogTitle>
        
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={6}
            value={applicationNote}
            onChange={(e) => setApplicationNote(e.target.value)}
          />
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setNotesDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          
          <Button 
            onClick={handleSaveNotes}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reminder Dialog */}
      <Dialog
        open={reminderDialogOpen}
        onClose={() => setReminderDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Set Reminder
        </DialogTitle>
        
        <DialogContent>
          <TextField
            label="Reminder Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            value={reminderData.reminderDate || ''}
            onChange={(e) => setReminderData({
              ...reminderData,
              reminderDate: e.target.value
            })}
          />
          
          <TextField
            margin="normal"
            label="Reminder Note"
            fullWidth
            multiline
            rows={3}
            value={reminderData.reminderNote || ''}
            onChange={(e) => setReminderData({
              ...reminderData,
              reminderNote: e.target.value
            })}
          />
        </DialogContent>
        
        <DialogActions>
          <Button 
            onClick={() => setReminderDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          
          <Button 
            onClick={handleSaveReminder}
            color="primary"
            variant="contained"
            disabled={!reminderData.reminderDate}
          >
            Save Reminder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationHistory; 