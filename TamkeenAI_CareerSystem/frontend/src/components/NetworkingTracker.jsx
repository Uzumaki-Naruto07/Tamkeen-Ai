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

const NetworkingTracker = ({
  contacts = [],
  onAddContact,
  onUpdateContact,
  onDeleteContact,
  onImportContacts,
  onExportContacts,
  loading = false,
  error = null
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentContact, setCurrentContact] = useState({
    id: null,
    name: '',
    company: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    category: 'professional',
    linkedInUrl: '',
    twitterUrl: '',
    website: '',
    notes: '',
    lastContact: null,
    nextFollowUp: null,
    priority: 'medium',
    tags: []
  });
  const [contactsData, setContactsData] = useState(contacts);
  const [selectedContact, setSelectedContact] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [tagInput, setTagInput] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Update contacts data when props change
  useEffect(() => {
    setContactsData(contacts);
  }, [contacts]);
  
  // Open action menu
  const handleOpenActionMenu = (event, contactId) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedContactId(contactId);
  };
  
  // Close action menu
  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setSelectedContactId(null);
  };
  
  // Handle add/edit dialog
  const handleOpenDialog = (edit = false, contact = null) => {
    setIsEditMode(edit);
    if (edit && contact) {
      setCurrentContact({ ...contact });
    } else {
      setCurrentContact({
        id: null,
        name: '',
        company: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        category: 'professional',
        linkedInUrl: '',
        twitterUrl: '',
        website: '',
        notes: '',
        lastContact: null,
        nextFollowUp: null,
        priority: 'medium',
        tags: []
      });
    }
    setDialogOpen(true);
    handleCloseActionMenu();
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Handle contact submission
  const handleSubmitContact = () => {
    if (isEditMode) {
      if (onUpdateContact) {
        onUpdateContact(currentContact);
      } else {
        // Local update for demo
        setContactsData(prevContacts => 
          prevContacts.map(c => c.id === currentContact.id ? currentContact : c)
        );
      }
      showSnackbar('Contact updated successfully', 'success');
    } else {
      const newContact = {
        ...currentContact,
        id: Date.now(), // Temporary ID generation
      };
      
      if (onAddContact) {
        onAddContact(newContact);
      } else {
        // Local add for demo
        setContactsData(prevContacts => [...prevContacts, newContact]);
      }
      showSnackbar('New contact added', 'success');
    }
    handleCloseDialog();
  };
  
  // Handle contact deletion
  const handleDeleteContact = (contactId) => {
    if (onDeleteContact) {
      onDeleteContact(contactId);
    } else {
      // Local delete for demo
      setContactsData(prevContacts => prevContacts.filter(c => c.id !== contactId));
    }
    handleCloseActionMenu();
    showSnackbar('Contact deleted', 'success');
  };
  
  // Handle view contact details
  const handleViewContactDetails = (contact) => {
    setSelectedContact(contact);
    setDetailsOpen(true);
  };
  
  // Close details dialog
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };
  
  // Show snackbar message
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // Handle adding a new note
  const handleAddNote = () => {
    if (newNote.trim() === '') return;
    
    const updatedContact = {
      ...selectedContact,
      notes: selectedContact.notes ? `${selectedContact.notes}\n\n${new Date().toLocaleDateString()}: ${newNote}` : `${new Date().toLocaleDateString()}: ${newNote}`,
      lastContact: new Date()
    };
    
    if (onUpdateContact) {
      onUpdateContact(updatedContact);
    } else {
      // Local update for demo
      setContactsData(prevContacts => 
        prevContacts.map(c => c.id === updatedContact.id ? updatedContact : c)
      );
      setSelectedContact(updatedContact);
    }
    
    setNoteDialogOpen(false);
    setNewNote('');
    showSnackbar('Note added successfully', 'success');
  };
  
  // Handle adding a new tag
  const handleAddTag = () => {
    if (tagInput.trim() === '' || currentContact.tags.includes(tagInput.trim())) {
      return;
    }
    
    setCurrentContact({
      ...currentContact,
      tags: [...currentContact.tags, tagInput.trim()]
    });
    
    setTagInput('');
  };
  
  // Handle removing a tag
  const handleRemoveTag = (tagToRemove) => {
    setCurrentContact({
      ...currentContact,
      tags: currentContact.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <Box>
      {/* Add Contact Dialog */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {isEditMode ? 'Update Contact' : 'Add Contact'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={currentContact.name}
                  onChange={(e) => setCurrentContact({...currentContact, name: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company"
                  value={currentContact.company}
                  onChange={(e) => setCurrentContact({...currentContact, company: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={currentContact.title}
                  onChange={(e) => setCurrentContact({...currentContact, title: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  value={currentContact.email}
                  onChange={(e) => setCurrentContact({...currentContact, email: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={currentContact.phone}
                  onChange={(e) => setCurrentContact({...currentContact, phone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={currentContact.location}
                  onChange={(e) => setCurrentContact({...currentContact, location: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Category"
                  value={currentContact.category}
                  onChange={(e) => setCurrentContact({...currentContact, category: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="LinkedIn URL"
                  value={currentContact.linkedInUrl}
                  onChange={(e) => setCurrentContact({...currentContact, linkedInUrl: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Twitter URL"
                  value={currentContact.twitterUrl}
                  onChange={(e) => setCurrentContact({...currentContact, twitterUrl: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Website"
                  value={currentContact.website}
                  onChange={(e) => setCurrentContact({...currentContact, website: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  minRows={3}
                  placeholder="Enter notes about this contact..."
                  value={currentContact.notes}
                  onChange={(e) => setCurrentContact({...currentContact, notes: e.target.value})}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSubmitContact}
              disabled={!currentContact.name.trim()}
            >
              {isEditMode ? 'Update Contact' : 'Add Contact'}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
      
      {/* Contact Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        {selectedContact && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Contact Details</Typography>
                <Box>
                  <IconButton onClick={() => handleOpenDialog(true, selectedContact)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={handleCloseDetails}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ width: 80, height: 80, mr: 2, bgcolor: getAvatarColor(selectedContact.name) }}>
                  {getInitials(selectedContact.name)}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedContact.name}</Typography>
                  <Typography variant="body1" color="text.secondary">
                    {selectedContact.title}{selectedContact.title && selectedContact.company ? ' at ' : ''}
                    {selectedContact.company}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={selectedContact.category} 
                    sx={{ mt: 1 }}
                    color={getCategoryColor(selectedContact.category)}
                  />
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                {selectedContact.email && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{selectedContact.email}</Typography>
                    </Box>
                  </Grid>
                )}
                
                {selectedContact.phone && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{selectedContact.phone}</Typography>
                    </Box>
                  </Grid>
                )}
                
                {selectedContact.location && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOnIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">{selectedContact.location}</Typography>
                    </Box>
                  </Grid>
                )}
                
                {selectedContact.linkedInUrl && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinkedInIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        <a href={selectedContact.linkedInUrl} target="_blank" rel="noopener noreferrer">
                          LinkedIn Profile
                        </a>
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Follow-up Schedule
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Last Contact: {selectedContact.lastContact ? new Date(selectedContact.lastContact).toLocaleDateString() : 'Never'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarMonthIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      Next Follow-up: {selectedContact.nextFollowUp ? new Date(selectedContact.nextFollowUp).toLocaleDateString() : 'Not scheduled'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle1" gutterBottom>
                Notes
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.paper', minHeight: '100px' }}>
                {selectedContact.notes ? (
                  <Typography variant="body2" whiteSpace="pre-wrap">
                    {selectedContact.notes}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No notes yet. Add some using the button below.
                  </Typography>
                )}
              </Paper>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {selectedContact.tags && selectedContact.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                startIcon={<EventIcon />}
                onClick={() => setFollowUpDialogOpen(true)}
              >
                Schedule Follow-up
              </Button>
              <Button 
                startIcon={<NoteIcon />}
                variant="contained"
                onClick={() => setNoteDialogOpen(true)}
              >
                Add Note
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Note</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            margin="normal"
            label="Note"
            placeholder="Enter your note here..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddNote}
            disabled={!newNote.trim()}
          >
            Add Note
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Import Contacts Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Contacts</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <input
              accept=".csv,.xlsx"
              style={{ display: 'none' }}
              id="upload-file-button"
              type="file"
              onChange={(e) => {
                // Handle file upload logic
                // In a real app, you would process the file here
                if (e.target.files.length > 0) {
                  showSnackbar(`File "${e.target.files[0].name}" ready to import`, 'info');
                }
              }}
            />
            <label htmlFor="upload-file-button">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Upload CSV or Excel File
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary" paragraph>
              Upload a CSV or Excel file with your contacts. The file should include columns for name, email, phone, etc.
            </Typography>
            <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
              For example format, you can <Button size="small">download a template</Button>.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={() => {
              setImportDialogOpen(false);
              showSnackbar('Contacts imported successfully', 'success');
            }}
          >
            Import
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Follow-up Dialog */}
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Dialog open={followUpDialogOpen} onClose={() => setFollowUpDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Schedule Follow-Up</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <DatePicker
                label="Follow-up Date"
                value={selectedContact?.nextFollowUp ? new Date(selectedContact.nextFollowUp) : null}
                onChange={(newDate) => {
                  if (selectedContact) {
                    setSelectedContact({
                      ...selectedContact,
                      nextFollowUp: newDate
                    });
                  }
                }}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Follow-up Note"
                placeholder="What would you like to discuss?"
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFollowUpDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained"
              onClick={() => {
                if (selectedContact) {
                  const updatedContact = {
                    ...selectedContact,
                    // In a real app, you would also save follow-up notes
                  };
                  
                  if (onUpdateContact) {
                    onUpdateContact(updatedContact);
                  } else {
                    // Local update for demo
                    setContactsData(prevContacts => 
                      prevContacts.map(c => c.id === updatedContact.id ? updatedContact : c)
                    );
                  }
                }
                setFollowUpDialogOpen(false);
                showSnackbar('Follow-up scheduled', 'success');
              }}
            >
              Schedule
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NetworkingTracker; 