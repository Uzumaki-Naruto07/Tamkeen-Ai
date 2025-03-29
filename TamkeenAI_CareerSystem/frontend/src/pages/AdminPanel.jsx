import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Tabs, Tab, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, TextField, InputAdornment, Dialog, DialogTitle,
  DialogContent, DialogActions, Menu, MenuItem, Tooltip,
  Alert, CircularProgress, Switch, FormControlLabel, Snackbar,
  Select, FormControl, InputLabel, Pagination, Badge
} from '@mui/material';
import {
  Dashboard, People, Work, School, Settings, Add, Delete,
  Edit, Visibility, Search, FilterList, Refresh, Block,
  Check, Clear, Warning, Info, AdminPanelSettings, Analytics,
  MonetizationOn, Notifications, Mail, Article, Report,
  PersonAdd, SupervisorAccount, Laptop, Security, Storage,
  VerifiedUser, VerifiedUserOutlined, EventNote, LocalOffer,
  PostAdd, Assignment, Language, Translate, BusinessCenter,
  Assessment, Description, Feedback, QuestionAnswer, Email,
  Download, CloudUpload, BarChart, PersonRemove, MoreVert,
  ContentCopy, CheckCircle, Error, Flag, Pending, Save
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import { useDebounce } from '../hooks/useDebounce';

// Charts
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminPanel = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalInterviews: 0,
    pendingReports: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userEditForm, setUserEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
    active: true
  });
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [settingsData, setSettingsData] = useState({
    systemName: 'Tamkeen AI Career System',
    allowRegistration: true,
    requireEmailVerification: true,
    allowSocialLogin: true,
    maintenanceMode: false,
    defaultUserRole: 'user',
    maxJobsPerEmployer: 100,
    maxApplicationsPerUser: 50,
    emailNotifications: true,
    jobExpiryDays: 30,
    allowAIRecommendations: true,
    allowAPIAccess: false
  });
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const navigate = useNavigate();
  const { profile, isAdmin } = useUser();
  
  // Check if user is admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
  }, [isAdmin, navigate]);
  
  // Load initial data
  useEffect(() => {
    const loadAdminData = async () => {
      if (!profile?.id || !isAdmin) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch dashboard stats
        const statsResponse = await apiEndpoints.admin.getDashboardStats();
        setStats(statsResponse.data || {});
        
        // Fetch users for the users tab
        if (activeTab === 1) {
          const usersResponse = await apiEndpoints.admin.getUsers({
            page,
            limit: rowsPerPage,
            search: debouncedSearchTerm
          });
          setUsers(usersResponse.data || []);
        }
        
        // Fetch jobs for the jobs tab
        if (activeTab === 2) {
          const jobsResponse = await apiEndpoints.admin.getJobs({
            page,
            limit: rowsPerPage,
            search: debouncedSearchTerm
          });
          setJobs(jobsResponse.data || []);
        }
        
        // Fetch reports for the reports tab
        if (activeTab === 3) {
          const reportsResponse = await apiEndpoints.admin.getReports({
            page,
            limit: rowsPerPage,
            search: debouncedSearchTerm
          });
          setReports(reportsResponse.data || []);
        }
        
        // Fetch application stats for the analytics tab
        if (activeTab === 4) {
          const applicationsResponse = await apiEndpoints.admin.getApplicationStats();
          setApplications(applicationsResponse.data || []);
        }
        
        // Fetch system settings
        if (activeTab === 5) {
          const settingsResponse = await apiEndpoints.admin.getSystemSettings();
          setSettingsData(settingsResponse.data || {});
        }
      } catch (err) {
        console.error('Error loading admin data:', err);
        setError('Failed to load admin data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadAdminData();
  }, [activeTab, debouncedSearchTerm, isAdmin, page, profile, rowsPerPage]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(1);
    setSearchTerm('');
  };
  
  // Handle user actions
  const handleUserAction = async (action, userId) => {
    try {
      switch (action) {
        case 'edit':
          const userResponse = await apiEndpoints.admin.getUserById(userId);
          const userData = userResponse.data;
          setSelectedUser(userData);
          setUserEditForm({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            active: userData.active
          });
          setUserDialogOpen(true);
          break;
          
        case 'delete':
          setConfirmAction('deleteUser');
          setConfirmData(userId);
          setConfirmDialogOpen(true);
          break;
          
        case 'toggleActive':
          const user = users.find(u => u.id === userId);
          await apiEndpoints.admin.updateUser(userId, {
            ...user,
            active: !user.active
          });
          
          // Update local state
          setUsers(users.map(u => 
            u.id === userId ? { ...u, active: !u.active } : u
          ));
          
          setSnackbarMessage(`User ${user.active ? 'deactivated' : 'activated'} successfully`);
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          break;
          
        case 'resetPassword':
          setConfirmAction('resetPassword');
          setConfirmData(userId);
          setConfirmDialogOpen(true);
          break;
          
        default:
          break;
      }
    } catch (err) {
      console.error(`Error handling user action ${action}:`, err);
      setSnackbarMessage(`Failed to ${action} user`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Handle job actions
  const handleJobAction = async (action, jobId) => {
    try {
      switch (action) {
        case 'view':
          navigate(`/jobs/${jobId}`);
          break;
          
        case 'delete':
          setConfirmAction('deleteJob');
          setConfirmData(jobId);
          setConfirmDialogOpen(true);
          break;
          
        case 'toggleActive':
          const job = jobs.find(j => j.id === jobId);
          await apiEndpoints.admin.updateJob(jobId, {
            ...job,
            isActive: !job.isActive
          });
          
          // Update local state
          setJobs(jobs.map(j => 
            j.id === jobId ? { ...j, isActive: !j.isActive } : j
          ));
          
          setSnackbarMessage(`Job ${job.isActive ? 'deactivated' : 'activated'} successfully`);
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          break;
          
        case 'feature':
          const featuredJob = jobs.find(j => j.id === jobId);
          await apiEndpoints.admin.updateJob(jobId, {
            ...featuredJob,
            isFeatured: !featuredJob.isFeatured
          });
          
          // Update local state
          setJobs(jobs.map(j => 
            j.id === jobId ? { ...j, isFeatured: !j.isFeatured } : j
          ));
          
          setSnackbarMessage(`Job ${featuredJob.isFeatured ? 'unfeatured' : 'featured'} successfully`);
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          break;
          
        default:
          break;
      }
    } catch (err) {
      console.error(`Error handling job action ${action}:`, err);
      setSnackbarMessage(`Failed to ${action} job`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Handle report actions
  const handleReportAction = async (action, reportId) => {
    try {
      switch (action) {
        case 'view':
          const reportResponse = await apiEndpoints.admin.getReportById(reportId);
          setSelectedReport(reportResponse.data);
          setReportDialogOpen(true);
          break;
          
        case 'resolve':
          await apiEndpoints.admin.resolveReport(reportId);
          
          // Update local state
          setReports(reports.map(r => 
            r.id === reportId ? { ...r, status: 'resolved' } : r
          ));
          
          setSnackbarMessage('Report marked as resolved');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
          break;
          
        case 'delete':
          setConfirmAction('deleteReport');
          setConfirmData(reportId);
          setConfirmDialogOpen(true);
          break;
          
        default:
          break;
      }
    } catch (err) {
      console.error(`Error handling report action ${action}:`, err);
      setSnackbarMessage(`Failed to ${action} report`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Handle confirm dialog actions
  const handleConfirmAction = async () => {
    try {
      switch (confirmAction) {
        case 'deleteUser':
          await apiEndpoints.admin.deleteUser(confirmData);
          setUsers(users.filter(user => user.id !== confirmData));
          setSnackbarMessage('User deleted successfully');
          break;
          
        case 'deleteJob':
          await apiEndpoints.admin.deleteJob(confirmData);
          setJobs(jobs.filter(job => job.id !== confirmData));
          setSnackbarMessage('Job deleted successfully');
          break;
          
        case 'deleteReport':
          await apiEndpoints.admin.deleteReport(confirmData);
          setReports(reports.filter(report => report.id !== confirmData));
          setSnackbarMessage('Report deleted successfully');
          break;
          
        case 'resetPassword':
          await apiEndpoints.admin.resetUserPassword(confirmData);
          setSnackbarMessage('Password reset email sent to user');
          break;
          
        case 'saveSettings':
          await apiEndpoints.admin.updateSystemSettings(confirmData);
          setSettingsData(confirmData);
          setSnackbarMessage('System settings updated successfully');
          break;
          
        default:
          break;
      }
      
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error(`Error executing confirm action ${confirmAction}:`, err);
      setSnackbarMessage(`Failed to complete action: ${err.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setConfirmDialogOpen(false);
      setConfirmAction(null);
      setConfirmData(null);
    }
  };
  
  // Handle user edit form
  const handleUpdateUser = async () => {
    try {
      await apiEndpoints.admin.updateUser(selectedUser.id, userEditForm);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, ...userEditForm } : user
      ));
      
      setSnackbarMessage('User updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setUserDialogOpen(false);
    } catch (err) {
      console.error('Error updating user:', err);
      setSnackbarMessage('Failed to update user');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Handle settings update
  const handleUpdateSettings = () => {
    setConfirmAction('saveSettings');
    setConfirmData(settingsData);
    setConfirmDialogOpen(true);
  };
  
  // Render dashboard stats
  const renderDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<Dashboard />}
            onClick={() => navigate('/admin/insights')}
          >
            Insights Dashboard
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Assessment />}
            onClick={() => navigate('/admin-analytics')}
          >
            Advanced Analytics
          </Button>
        </Box>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Users
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <People fontSize="large" color="primary" sx={{ mr: 2 }} />
              <Typography variant="h4">
                {stats.totalUsers}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {stats.activeUsers} active users
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              onClick={() => setActiveTab(1)}
              startIcon={<Visibility />}
            >
              View All
            </Button>
          </CardActions>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Jobs
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Work fontSize="large" color="primary" sx={{ mr: 2 }} />
              <Typography variant="h4">
                {stats.totalJobs}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {stats.activeJobs} active job listings
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              onClick={() => setActiveTab(2)}
              startIcon={<Visibility />}
            >
              View All
            </Button>
          </CardActions>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Applications
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Description fontSize="large" color="primary" sx={{ mr: 2 }} />
              <Typography variant="h4">
                {stats.totalApplications}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {stats.pendingApplications} pending applications
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              onClick={() => setActiveTab(4)}
              startIcon={<Analytics />}
            >
              View Analytics
            </Button>
          </CardActions>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {stats.recentActivity?.map((activity, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {activity.type === 'user' && <People color="primary" />}
                    {activity.type === 'job' && <Work color="primary" />}
                    {activity.type === 'application' && <Description color="primary" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.description}
                    secondary={format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                System Health
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={stats.systemHealth || 100} 
                color={stats.systemHealth > 90 ? "success" : stats.systemHealth > 70 ? "warning" : "error"}
                sx={{ mt: 1, mb: 2 }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Database Status
              </Typography>
              <Chip 
                icon={<Storage />} 
                label={stats.databaseStatus || "Operational"} 
                color="success" 
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="textSecondary">
                API Performance
              </Typography>
              <Typography variant="body1">
                {stats.apiResponseTime || "65"}ms (avg)
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body2" color="textSecondary">
                Storage Usage
              </Typography>
              <Typography variant="body1">
                {stats.storageUsage || "45"}% of {stats.totalStorage || "10GB"}
              </Typography>
            </Box>
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              onClick={() => setActiveTab(5)}
              startIcon={<Settings />}
            >
              System Settings
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
  
  // Render users management
  const renderUsers = () => (
    <>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <TextField
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          sx={{ mr: 2, width: 300 }}
        />
        
        <Button
          startIcon={<Refresh />}
          onClick={() => {
            setSearchTerm('');
            setPage(1);
          }}
        >
          Reset
        </Button>
        
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          sx={{ ml: 'auto' }}
          onClick={() => {
            setSelectedUser(null);
            setUserEditForm({
              name: '',
              email: '',
              role: 'user',
              active: true
            });
            setUserDialogOpen(true);
          }}
        >
          Add User
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Joined</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                      color={user.role === 'admin' ? 'secondary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.active ? 'Active' : 'Inactive'} 
                      color={user.active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small"
                        onClick={() => handleUserAction('edit', user.id)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={user.active ? 'Deactivate' : 'Activate'}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleUserAction('toggleActive', user.id)}
                      >
                        {user.active ? (
                          <Block fontSize="small" />
                        ) : (
                          <Check fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Reset Password">
                      <IconButton 
                        size="small"
                        onClick={() => handleUserAction('resetPassword', user.id)}
                      >
                        <Security fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleUserAction('delete', user.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination 
          count={Math.ceil(stats.totalUsers / rowsPerPage)} 
          page={page}
          onChange={(event, newPage) => setPage(newPage)}
        />
      </Box>
    </>
  );
  
  // Render jobs management
  const renderJobs = () => (
    <>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <TextField
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          sx={{ mr: 2, width: 300 }}
        />
        
        <Button
          startIcon={<Refresh />}
          onClick={() => {
            setSearchTerm('');
            setPage(1);
          }}
        >
          Reset
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applications</TableCell>
              <TableCell>Posted</TableCell>
              <TableCell>Expires</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No jobs found
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    {job.title}
                    {job.isFeatured && (
                      <Chip 
                        label="Featured" 
                        color="warning" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{job.company?.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={job.isActive ? 'Active' : 'Inactive'} 
                      color={job.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={job.applicationsCount || 0} 
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {job.expiresAt ? (
                      format(new Date(job.expiresAt), 'MMM dd, yyyy')
                    ) : (
                      'Never'
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View">
                      <IconButton 
                        size="small"
                        onClick={() => handleJobAction('view', job.id)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={job.isActive ? 'Deactivate' : 'Activate'}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleJobAction('toggleActive', job.id)}
                      >
                        {job.isActive ? (
                          <Block fontSize="small" />
                        ) : (
                          <Check fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={job.isFeatured ? 'Unfeature' : 'Feature'}>
                      <IconButton 
                        size="small"
                        color={job.isFeatured ? 'warning' : 'default'}
                        onClick={() => handleJobAction('feature', job.id)}
                      >
                        <Star fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleJobAction('delete', job.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination 
          count={Math.ceil(stats.totalJobs / rowsPerPage)} 
          page={page}
          onChange={(event, newPage) => setPage(newPage)}
        />
      </Box>
    </>
  );
  
  // Render reports management
  const renderReports = () => (
    <>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <TextField
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            )
          }}
          sx={{ mr: 2, width: 300 }}
        />
        
        <Button
          startIcon={<Refresh />}
          onClick={() => {
            setSearchTerm('');
            setPage(1);
          }}
        >
          Reset
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Reporter</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No reports found
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Chip 
                      label={report.type} 
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{report.subject}</TableCell>
                  <TableCell>{report.reporterName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={report.status} 
                      color={
                        report.status === 'pending' 
                          ? 'warning' 
                          : report.status === 'resolved' 
                            ? 'success' 
                            : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View">
                      <IconButton 
                        size="small"
                        onClick={() => handleReportAction('view', report.id)}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    {report.status === 'pending' && (
                      <Tooltip title="Mark as Resolved">
                        <IconButton 
                          size="small" 
                          color="success"
                          onClick={() => handleReportAction('resolve', report.id)}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    <Tooltip title="Delete">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleReportAction('delete', report.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination 
          count={Math.ceil(stats.totalReports / rowsPerPage)} 
          page={page}
          onChange={(event, newPage) => setPage(newPage)}
        />
      </Box>
    </>
  );
  
  // Render analytics
  const renderAnalytics = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Applications by Status
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.applicationsByStatus || [
                      { name: 'Pending', value: 35 },
                      { name: 'Reviewed', value: 25 },
                      { name: 'Interview', value: 15 },
                      { name: 'Rejected', value: 20 },
                      { name: 'Hired', value: 5 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(stats.applicationsByStatus || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[
                        '#1976d2', '#4caf50', '#ff9800', '#f44336', '#9c27b0'
                      ][index % 5]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Applications by Month
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={stats.applicationsByMonth || [
                    { name: 'Jan', applications: 65 },
                    { name: 'Feb', applications: 85 },
                    { name: 'Mar', applications: 45 },
                    { name: 'Apr', applications: 75 },
                    { name: 'May', applications: 95 },
                    { name: 'Jun', applications: 65 }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="applications" fill="#1976d2" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Most Popular Job Categories
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={stats.popularCategories || [
                    { name: 'Software Engineering', count: 120 },
                    { name: 'Data Science', count: 85 },
                    { name: 'UX/UI Design', count: 65 },
                    { name: 'Product Management', count: 55 },
                    { name: 'Marketing', count: 45 },
                    { name: 'Sales', count: 35 }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#4caf50" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                System Activity Log
              </Typography>
              <Button startIcon={<Download />}>
                Export
              </Button>
            </Box>
            
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>IP Address</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(stats.activityLog || []).map((log, index) => (
                    <TableRow key={log.id || index}>
                      <TableCell>
                        <Chip 
                          label={log.action} 
                          size="small"
                          color={
                            log.action === 'login' ? 'success' :
                            log.action === 'create' ? 'primary' :
                            log.action === 'delete' ? 'error' :
                            'default'
                          }
                        />
                      </TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell>{log.details}</TableCell>
                      <TableCell>{format(new Date(log.date), 'MMM dd, yyyy HH:mm')}</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  
  // Render settings
  const renderSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            
            <TextField
              label="System Name"
              value={settingsData.systemName}
              onChange={(e) => setSettingsData({ ...settingsData, systemName: e.target.value })}
              fullWidth
              margin="normal"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settingsData.allowRegistration}
                  onChange={(e) => setSettingsData({ ...settingsData, allowRegistration: e.target.checked })}
                />
              }
              label="Allow Public Registration"
              sx={{ display: 'block', mt: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settingsData.requireEmailVerification}
                  onChange={(e) => setSettingsData({ ...settingsData, requireEmailVerification: e.target.checked })}
                />
              }
              label="Require Email Verification"
              sx={{ display: 'block', mt: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settingsData.allowSocialLogin}
                  onChange={(e) => setSettingsData({ ...settingsData, allowSocialLogin: e.target.checked })}
                />
              }
              label="Allow Social Login"
              sx={{ display: 'block', mt: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settingsData.maintenanceMode}
                  onChange={(e) => setSettingsData({ ...settingsData, maintenanceMode: e.target.checked })}
                />
              }
              label="Maintenance Mode"
              sx={{ display: 'block', mt: 1 }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>Default User Role</InputLabel>
              <Select
                value={settingsData.defaultUserRole}
                onChange={(e) => setSettingsData({ ...settingsData, defaultUserRole: e.target.value })}
                label="Default User Role"
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="employer">Employer</MenuItem>
                <MenuItem value="educator">Educator</MenuItem>
              </Select>
            </FormControl>
          </CardContent>
          <CardActions>
            <Button 
              variant="contained" 
              startIcon={<Save />}
              onClick={handleUpdateSettings}
            >
              Save General Settings
            </Button>
          </CardActions>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Limits
            </Typography>
            
            <TextField
              label="Max Jobs Per Employer"
              type="number"
              value={settingsData.maxJobsPerEmployer}
              onChange={(e) => setSettingsData({ 
                ...settingsData, 
                maxJobsPerEmployer: parseInt(e.target.value, 10) 
              })}
              fullWidth
              margin="normal"
            />
            
            <TextField
              label="Max Applications Per User"
              type="number"
              value={settingsData.maxApplicationsPerUser}
              onChange={(e) => setSettingsData({ 
                ...settingsData, 
                maxApplicationsPerUser: parseInt(e.target.value, 10) 
              })}
              fullWidth
              margin="normal"
            />
            
            <TextField
              label="Job Expiry Days"
              type="number"
              value={settingsData.jobExpiryDays}
              onChange={(e) => setSettingsData({ 
                ...settingsData, 
                jobExpiryDays: parseInt(e.target.value, 10) 
              })}
              fullWidth
              margin="normal"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settingsData.emailNotifications}
                  onChange={(e) => setSettingsData({ ...settingsData, emailNotifications: e.target.checked })}
                />
              }
              label="Enable Email Notifications"
              sx={{ display: 'block', mt: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settingsData.allowAIRecommendations}
                  onChange={(e) => setSettingsData({ ...settingsData, allowAIRecommendations: e.target.checked })}
                />
              }
              label="Enable AI Recommendations"
              sx={{ display: 'block', mt: 1 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settingsData.allowAPIAccess}
                  onChange={(e) => setSettingsData({ ...settingsData, allowAPIAccess: e.target.checked })}
                />
              }
              label="Allow API Access"
              sx={{ display: 'block', mt: 1 }}
            />
          </CardContent>
          <CardActions>
            <Button 
              variant="contained" 
              startIcon={<Save />}
              onClick={handleUpdateSettings}
            >
              Save System Limits
            </Button>
          </CardActions>
        </Card>
      </Grid>
      
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Maintenance
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<Refresh />}
                onClick={() => handleMaintenanceAction('clearCache')}
              >
                Clear System Cache
              </Button>
              
              <Button 
                variant="outlined" 
                startIcon={<Delete />}
                onClick={() => handleMaintenanceAction('cleanupExpiredJobs')}
              >
                Cleanup Expired Jobs
              </Button>
              
              <Button 
                variant="outlined" 
                startIcon={<Download />}
                onClick={() => handleMaintenanceAction('backupDatabase')}
              >
                Backup Database
              </Button>
              
              <Button 
                variant="outlined" 
                startIcon={<Assessment />}
                onClick={() => handleMaintenanceAction('generateSystemReport')}
              >
                Generate System Report
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Panel
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => handleTabChange(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab icon={<Dashboard />} label="Dashboard" />
          <Tab icon={<People />} label="Users" />
          <Tab icon={<Work />} label="Jobs" />
          <Tab icon={<Report />} label="Reports" />
          <Tab icon={<Analytics />} label="Analytics" />
          <Tab icon={<Settings />} label="Settings" />
        </Tabs>
        
        {loading && activeTab !== 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <LoadingSpinner message="Loading data..." />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <>
            {activeTab === 0 && renderDashboard()}
            {activeTab === 1 && renderUsers()}
            {activeTab === 2 && renderJobs()}
            {activeTab === 3 && renderReports()}
            {activeTab === 4 && renderAnalytics()}
            {activeTab === 5 && renderSettings()}
          </>
        )}
      </Paper>
      
      {/* User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={userEditForm.name}
            onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
            fullWidth
            margin="normal"
          />
          
          <TextField
            label="Email"
            value={userEditForm.email}
            onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
            fullWidth
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={userEditForm.role}
              onChange={(e) => setUserEditForm({ ...userEditForm, role: e.target.value })}
              label="Role"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="employer">Employer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="educator">Educator</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={userEditForm.active}
                onChange={(e) => setUserEditForm({ ...userEditForm, active: e.target.checked })}
              />
            }
            label="Active"
            sx={{ display: 'block', mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            onClick={handleUpdateUser}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          {confirmAction === 'deleteUser' && (
            <Typography>
              Are you sure you want to delete this user? This action cannot be undone.
            </Typography>
          )}
          
          {confirmAction === 'deleteJob' && (
            <Typography>
              Are you sure you want to delete this job? This action cannot be undone.
            </Typography>
          )}
          
          {confirmAction === 'deleteReport' && (
            <Typography>
              Are you sure you want to delete this report? This action cannot be undone.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained"
            color="error"
            onClick={handleConfirmAction}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Report Details
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Type:</Typography>
                <Typography gutterBottom>{selectedReport.type}</Typography>
                
                <Typography variant="subtitle2">Subject:</Typography>
                <Typography gutterBottom>{selectedReport.subject}</Typography>
                
                <Typography variant="subtitle2">Reported By:</Typography>
                <Typography gutterBottom>{selectedReport.reporterName}</Typography>
                
                <Typography variant="subtitle2">Status:</Typography>
                <Chip 
                  label={selectedReport.status} 
                  color={
                    selectedReport.status === 'pending' ? 'warning' : 
                    selectedReport.status === 'resolved' ? 'success' : 
                    'default'
                  }
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Date Reported:</Typography>
                <Typography gutterBottom>
                  {format(new Date(selectedReport.createdAt), 'MMM dd, yyyy HH:mm')}
                </Typography>
                
                {selectedReport.resolvedAt && (
                  <>
                    <Typography variant="subtitle2">Date Resolved:</Typography>
                    <Typography gutterBottom>
                      {format(new Date(selectedReport.resolvedAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </>
                )}
                
                {selectedReport.resolvedBy && (
                  <>
                    <Typography variant="subtitle2">Resolved By:</Typography>
                    <Typography gutterBottom>{selectedReport.resolvedBy}</Typography>
                  </>
                )}
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">Description:</Typography>
                <Typography paragraph>{selectedReport.description}</Typography>
                
                {selectedReport.status === 'resolved' && selectedReport.resolution && (
                  <>
                    <Typography variant="subtitle2">Resolution:</Typography>
                    <Typography>{selectedReport.resolution}</Typography>
                  </>
                )}
                
                {selectedReport.status === 'pending' && (
                  <>
                    <TextField
                      label="Resolution Notes"
                      multiline
                      rows={4}
                      fullWidth
                      margin="normal"
                      value={selectedReport.resolutionNotes || ''}
                      onChange={(e) => setSelectedReport({
                        ...selectedReport,
                        resolutionNotes: e.target.value
                      })}
                    />
                  </>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>
            Close
          </Button>
          
          {selectedReport && selectedReport.status === 'pending' && (
            <Button 
              variant="contained"
              color="success"
              onClick={() => handleReportAction('resolve', selectedReport.id)}
            >
              Mark as Resolved
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          severity={snackbarSeverity} 
          onClose={() => setSnackbarOpen(false)}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPanel;