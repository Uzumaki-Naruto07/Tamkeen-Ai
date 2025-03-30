import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  IconButton,
  Chip,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  Snackbar,
  Alert,
  Menu,
  Badge,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import LinkIcon from '@mui/icons-material/Link';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NoteIcon from '@mui/icons-material/Note';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import InsightsIcon from '@mui/icons-material/Insights';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, parseISO } from 'date-fns';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from './LoadingSpinner';

const NetworkingTracker = () => {
  const [contacts, setContacts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    linkedin: '',
    website: '',
    notes: '',
    lastContactDate: new Date(),
    nextFollowupDate: null,
    tags: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { profile } = useUser();
  
  // Fetch contacts from backend
  useEffect(() => {
    const fetchContacts = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // This would connect to a MongoDB backend if implemented
        // Currently using mock data
        const response = await mockFetchContacts();
        setContacts(response.data);
      } catch (err) {
        setError('Failed to fetch contacts');
        console.error('Error fetching contacts:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContacts();
  }, [profile]);
  
  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      linkedin: '',
      website: '',
      notes: '',
      lastContactDate: new Date(),
      nextFollowupDate: null,
      tags: []
    });
  };
  
  // Open dialog for adding a new contact
  const handleAddContact = () => {
    resetFormData();
    setEditContact(null);
    setDialogOpen(true);
  };
  
  // Open dialog for editing an existing contact
  const handleEditContact = (contact) => {
    setFormData({
      ...contact,
      lastContactDate: contact.lastContactDate ? parseISO(contact.lastContactDate) : new Date(),
      nextFollowupDate: contact.nextFollowupDate ? parseISO(contact.nextFollowupDate) : null
    });
    setEditContact(contact);
    setDialogOpen(true);
    handleCloseMenu();
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle date changes
  const handleDateChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add a tag
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  
  // Remove a tag
  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Save contact
  const handleSaveContact = async () => {
    if (!formData.name.trim()) {
      setError('Contact name is required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // This would connect to a MongoDB backend if implemented
      // Currently using mock data
      let response;
      
      if (editContact) {
        // Update existing contact
        response = await mockUpdateContact(editContact.id, formData);
        
        // Update contacts list
        setContacts(prev => 
          prev.map(contact => 
            contact.id === editContact.id ? response.data : contact
          )
        );
      } else {
        // Create new contact
        response = await mockCreateContact(formData);
        
        // Add to contacts list
        setContacts(prev => [...prev, response.data]);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setDialogOpen(false);
    } catch (err) {
      setError('Failed to save contact');
      console.error('Error saving contact:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete contact
  const handleDeleteContact = async (contactId) => {
    if (!contactId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // This would connect to a MongoDB backend if implemented
      // Currently using mock data
      await mockDeleteContact(contactId);
      
      // Remove from contacts list
      setContacts(prev => prev.filter(contact => contact.id !== contactId));
      
      handleCloseMenu();
    } catch (err) {
      setError('Failed to delete contact');
      console.error('Error deleting contact:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Menu handlers
  const handleOpenMenu = (event, contactId) => {
    setMenuAnchor(event.currentTarget);
    setSelectedContactId(contactId);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setSelectedContactId(null);
  };
  
  // Render contact list
  const renderContactList = () => {
    if (contacts.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No contacts found. Add your first networking contact to get started.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddContact}
            sx={{ mt: 2 }}
          >
            Add Contact
          </Button>
        </Box>
      );
    }
    
    return (
      <List>
        {contacts.map((contact) => (
          <ListItem
            key={contact.id}
            alignItems="flex-start"
            sx={{
              mb: 2,
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: stringToColor(contact.name) }}>
                {getInitials(contact.name)}
              </Avatar>
            </ListItemAvatar>
            
            <ListItemText
              primary={
                <Typography variant="subtitle1" fontWeight="bold">
                  {contact.name}
                </Typography>
              }
              secondary={
                <>
                  {contact.title && contact.company && (
                    <Typography variant="body2" color="text.primary">
                      {contact.title} at {contact.company}
                    </Typography>
                  )}
                  
                  {contact.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <EmailIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {contact.email}
                      </Typography>
                    </Box>
                  )}
                  
                  {contact.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <PhoneIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        {contact.phone}
                      </Typography>
                    </Box>
                  )}
                  
                  {contact.lastContactDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <EventIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2">
                        Last contact: {format(new Date(contact.lastContactDate), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                  )}
                  
                  {contact.tags && contact.tags.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {contact.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </>
              }
            />
            
            <ListItemSecondaryAction>
              <IconButton 
                edge="end" 
                onClick={(e) => handleOpenMenu(e, contact.id)}
              >
                <MoreVertIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  };
  
  // Mock API functions (would be replaced with actual API calls)
  const mockFetchContacts = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: '1',
              name: 'Jane Smith',
              title: 'HR Manager',
              company: 'Tech Innovations Inc.',
              email: 'jane.smith@techinnovations.com',
              phone: '+1 (555) 123-4567',
              linkedin: 'https://linkedin.com/in/janesmith',
              website: 'https://techinnovations.com',
              notes: 'Met at the Tech Conference in June.',
              lastContactDate: '2023-06-15',
              nextFollowupDate: '2023-07-15',
              tags: ['HR', 'Tech', 'Conference']
            },
            {
              id: '2',
              name: 'Robert Johnson',
              title: 'CTO',
              company: 'DataSphere Solutions',
              email: 'robert.j@datasphere.io',
              phone: '+1 (555) 987-6543',
              linkedin: 'https://linkedin.com/in/robertjohnson',
              website: 'https://datasphere.io',
              notes: 'Introduced by mutual connection Alex.',
              lastContactDate: '2023-05-22',
              nextFollowupDate: '2023-08-01',
              tags: ['Technical', 'Executive', 'Referral']
            }
          ]
        });
      }, 800);
    });
  };
  
  const mockCreateContact = (contactData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            id: Date.now().toString(),
            ...contactData,
            lastContactDate: contactData.lastContactDate?.toISOString(),
            nextFollowupDate: contactData.nextFollowupDate?.toISOString()
          }
        });
      }, 800);
    });
  };
  
  const mockUpdateContact = (id, contactData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            id,
            ...contactData,
            lastContactDate: contactData.lastContactDate?.toISOString(),
            nextFollowupDate: contactData.nextFollowupDate?.toISOString()
          }
        });
      }, 800);
    });
  };
  
  const mockDeleteContact = (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 800);
    });
  };
  
  // Helper functions
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Networking Contacts
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddContact}
          >
            Add Contact
          </Button>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Contact saved successfully!
          </Alert>
        )}
        
        {loading && contacts.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <LoadingSpinner />
          </Box>
        ) : (
          renderContactList()
        )}
        
        {/* Contact Form Dialog */}
        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editContact ? 'Edit Contact' : 'Add Contact'}
          </DialogTitle>
          
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
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
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn URL"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Last Contact Date"
                  value={formData.lastContactDate}
                  onChange={(newValue) => handleDateChange('lastContactDate', newValue)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Next Follow-up Date"
                  value={formData.nextFollowupDate}
                  onChange={(newValue) => handleDateChange('nextFollowupDate', newValue)}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
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
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    label="Add Tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleAddTag}
                  >
                    Add
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      size="small"
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            
            <Button 
              variant="contained"
              onClick={handleSaveContact}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Saving...' : 'Save Contact'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Contact Actions Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
        >
          <MenuItem 
            onClick={() => {
              const contact = contacts.find(c => c.id === selectedContactId);
              if (contact) {
                handleEditContact(contact);
              }
            }}
          >
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
          </MenuItem>
          
          <MenuItem 
            onClick={() => {
              if (selectedContactId) {
                handleDeleteContact(selectedContactId);
              }
            }}
          >
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </Paper>
    </LocalizationProvider>
  );
};

export default NetworkingTracker; 