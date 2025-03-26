import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Tooltip,
  Pagination,
  Alert,
  Grid,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Menu,
  Fab,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  Assessment,
  Check,
  Close,
  Schedule,
  Timeline,
  BusinessCenter,
  LocationOn,
  Phone,
  Link,
  InsertLink,
  Description,
  EventNote,
  FilterList,
  Search,
  AccessTime,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, parseISO } from 'date-fns';
import { useUser } from './AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const ApplicationTracker = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    location: '',
    applicationDate: new Date(),
    applicationStatus: 'applied',
    jobDescription: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
    followUpDate: null,
    salary: '',
    source: '',
    resumeUsed: '',
    interviewDate: null
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('applicationDate');
  const [order, setOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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
        const response = await apiEndpoints.career.getApplications(profile.id);
        setApplications(response.data);
      } catch (err) {
        setError('Failed to load your applications');
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [profile]);
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleOpenDialog = (application = null) => {
    if (application) {
      setCurrentApplication(application);
      setFormData({
        jobTitle: application.jobTitle,
        company: application.company,
        location: application.location,
        applicationDate: application.applicationDate ? parseISO(application.applicationDate) : new Date(),
        applicationStatus: application.applicationStatus,
        jobDescription: application.jobDescription || '',
        contactPerson: application.contactPerson || '',
        contactEmail: application.contactEmail || '',
        contactPhone: application.contactPhone || '',
        notes: application.notes || '',
        followUpDate: application.followUpDate ? parseISO(application.followUpDate) : null,
        salary: application.salary || '',
        source: application.source || '',
        resumeUsed: application.resumeUsed || '',
        interviewDate: application.interviewDate ? parseISO(application.interviewDate) : null
      });
    } else {
      setCurrentApplication(null);
      setFormData({
        jobTitle: '',
        company: '',
        location: '',
        applicationDate: new Date(),
        applicationStatus: 'applied',
        jobDescription: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        notes: '',
        followUpDate: null,
        salary: '',
        source: '',
        resumeUsed: '',
        interviewDate: null
      });
    }
    
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleDateChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      let response;
      
      if (currentApplication) {
        response = await apiEndpoints.career.updateApplication(currentApplication.id, {
          ...formData,
          userId: profile.id
        });
      } else {
        response = await apiEndpoints.career.createApplication({
          ...formData,
          userId: profile.id
        });
      }
      
      setApplications(prev => {
        if (currentApplication) {
          return prev.map(app => app.id === currentApplication.id ? response.data : app);
        } else {
          return [...prev, response.data];
        }
      });
      
      setSaveSuccess(true);
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save application');
      console.error('Error saving application:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteApplication = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await apiEndpoints.career.deleteApplication(id);
        
        // Update local state to remove deleted item
        setApplications(applications.filter(app => app.id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete application');
        console.error('Application delete error:', err);
      }
    }
  };
  
  const getStatusChip = (status) => {
    const statusConfig = {
      applied: { label: 'Applied', color: 'primary', icon: <Check fontSize="small" /> },
      interview: { label: 'Interview', color: 'info', icon: <Schedule fontSize="small" /> },
      offer: { label: 'Offer', color: 'success', icon: <Check fontSize="small" /> },
      rejected: { label: 'Rejected', color: 'error', icon: <Close fontSize="small" /> },
      withdrawn: { label: 'Withdrawn', color: 'default', icon: <Close fontSize="small" /> }
    };
    
    const config = statusConfig[status] || statusConfig.applied;
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };
  
  const handleOpenMenu = (event, applicationId) => {
    setMenuAnchor(event.currentTarget);
    setSelectedApplicationId(applicationId);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedApplicationId(null);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const filteredApplications = applications.filter(app => {
    if (filterStatus !== 'all' && app.applicationStatus !== filterStatus) {
      return false;
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.jobTitle.toLowerCase().includes(searchLower) ||
        app.company.toLowerCase().includes(searchLower) ||
        app.location.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });
  
  const sortedApplications = filteredApplications.sort((a, b) => {
    const aValue = a[orderBy] || '';
    const bValue = b[orderBy] || '';
    
    if (order === 'asc') {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });
  
  const paginatedApplications = sortedApplications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  const getStatusInfo = (status) => {
    switch (status) {
      case 'applied':
        return { color: 'primary', icon: <Assignment /> };
      case 'interview':
        return { color: 'warning', icon: <Schedule /> };
      case 'offer':
        return { color: 'success', icon: <Check /> };
      case 'rejected':
        return { color: 'error', icon: <Close /> };
      default:
        return { color: 'default', icon: <AccessTime /> };
    }
  };
  
  if (loading && applications.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <LoadingSpinner message="Loading your applications..." />
      </Paper>
    );
  }
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Application Tracker
          </Typography>
          
          <Box>
            <Fab
              color="primary"
              size="medium"
              onClick={() => handleOpenDialog()}
              sx={{ mr: 1 }}
            >
              <Add />
            </Fab>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Application saved successfully!
          </Alert>
        )}
        
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ flexGrow: 1, maxWidth: 300 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="applied">Applied</MenuItem>
              <MenuItem value="interview">Interview</MenuItem>
              <MenuItem value="offer">Offer</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        {loading && applications.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <LoadingSpinner message="Loading applications..." />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table aria-label="applications table">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'jobTitle'}
                        direction={orderBy === 'jobTitle' ? order : 'asc'}
                        onClick={() => handleRequestSort('jobTitle')}
                      >
                        Job Title
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
                        active={orderBy === 'applicationDate'}
                        direction={orderBy === 'applicationDate' ? order : 'asc'}
                        onClick={() => handleRequestSort('applicationDate')}
                      >
                        Applied On
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" sx={{ py: 2 }}>
                          No applications found. Start tracking your job applications by clicking the '+' button.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedApplications.map((app) => {
                      const statusInfo = getStatusInfo(app.applicationStatus);
                      
                      return (
                        <TableRow key={app.id} hover>
                          <TableCell>{app.jobTitle}</TableCell>
                          <TableCell>{app.company}</TableCell>
                          <TableCell>
                            {app.applicationDate ? format(parseISO(app.applicationDate), 'MMM d, yyyy') : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={app.applicationStatus.charAt(0).toUpperCase() + app.applicationStatus.slice(1)}
                              color={statusInfo.color}
                              icon={statusInfo.icon}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenMenu(e, app.id)}
                            >
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredApplications.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
        
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {currentApplication ? 'Edit Application' : 'Add New Application'}
          </DialogTitle>
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Job Title"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Application Status</InputLabel>
                  <Select
                    name="applicationStatus"
                    value={formData.applicationStatus}
                    onChange={handleInputChange}
                    label="Application Status"
                  >
                    <MenuItem value="applied">Applied</MenuItem>
                    <MenuItem value="interview">Interview</MenuItem>
                    <MenuItem value="offer">Offer</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Application Date"
                  value={formData.applicationDate}
                  onChange={(newValue) => handleDateChange('applicationDate', newValue)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Follow-up Date"
                  value={formData.followUpDate}
                  onChange={(newValue) => handleDateChange('followUpDate', newValue)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Person"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Source"
                  name="source"
                  placeholder="LinkedIn, Company Website, etc."
                  value={formData.source}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary (if known)"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
        >
          <MenuItem 
            onClick={() => {
              const application = applications.find(app => app.id === selectedApplicationId);
              if (application) {
                handleOpenDialog(application);
              }
            }}
          >
            <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
          
          <MenuItem 
            onClick={() => {
              if (selectedApplicationId) {
                handleDeleteApplication(selectedApplicationId);
              }
            }}
          >
            <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </Paper>
    </LocalizationProvider>
  );
};

export default ApplicationTracker; 