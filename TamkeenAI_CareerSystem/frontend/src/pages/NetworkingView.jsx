import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, Button, Divider,
  Grid, Card, CardContent, CardActions, IconButton,
  List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction,
  Avatar, Chip, CircularProgress, Alert, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, MenuItem, Select, FormControl, InputLabel,
  Tabs, Tab, Badge, Tooltip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Pagination, Snackbar, Switch, FormControlLabel,
  Collapse, LinearProgress, Autocomplete, Rating
} from '@mui/material';
import {
  People, PersonAdd, Delete, Edit, Search, FilterList,
  Sort, MoreVert, Email, Phone, LinkedIn, Twitter,
  Language, Add, ArrowForward, CheckCircle, Star,
  StarBorder, Bookmark, BookmarkBorder, Event, Work,
  School, Business, LocationOn, Flag, AccessTime,
  Visibility, VisibilityOff, Close, Check, Import,
  Export, CloudUpload, CloudDownload, LinkOff, Link as LinkIcon,
  Message, ChatBubble, Share, Group, GroupAdd, Public,
  Category, Label, Assignment, AssignmentTurnedIn, AssignmentLate,
  Note, NoteAdd, History, Timeline, Archive, Unarchive,
  Send, ExpandMore, ExpandLess, Info, PermContactCalendar,
  Person, PersonOutline, NotificationsActive, LocalOffer,
  CalendarToday, Description, Refresh, Add as AddIcon,
  MergeType, Face, MailOutline, PhoneAndroid, Fingerprint,
  FormatListBulleted, ContentCopy, ArrowUpward, ArrowDownward,
  PictureAsPdf
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, formatDistanceToNow, parseISO, addDays } from 'date-fns';
import { useDebounce } from '../hooks/useDebounce';

const NetworkingView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Recent, 2: Favorites, 3: Requires Follow-up
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    company: '',
    position: '',
    email: '',
    phone: '',
    linkedIn: '',
    twitter: '',
    website: '',
    category: '',
    location: '',
    tags: [],
    notes: '',
    isFavorite: false,
    connectionStrength: 0,
    lastContactDate: null,
    nextFollowUp: null,
    meetingNotes: [],
    connections: []
  });
  const [categories, setCategories] = useState([
    'Colleague', 'Client', 'Mentor', 'Friend', 'Industry Contact', 'Recruiter', 'Manager', 'Other'
  ]);
  const [customTag, setCustomTag] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [noteMeetingDate, setNoteMeetingDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({
    categories: [],
    tags: [],
    connectionStrength: []
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [bulkActions, setBulkActions] = useState([]);
  const [connectionSuggestions, setConnectionSuggestions] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [connectionDetailsOpen, setConnectionDetailsOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    contactId: null,
    date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    time: '10:00',
    notes: '',
    reminderType: 'followUp'
  });
  const [expandedContact, setExpandedContact] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const navigate = useNavigate();
  const { profile } = useUser();
  
  // Load contacts
  useEffect(() => {
    const loadContacts = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiEndpoints.networking.getContacts(profile.id);
        const contactsData = response.data || [];
        setContacts(contactsData);
        filterAndSortContacts(contactsData, debouncedSearchTerm, activeTab, filters, sortBy, sortOrder);
        
        // Load connection suggestions
        const suggestionsResponse = await apiEndpoints.networking.getConnectionSuggestions(profile.id);
        setConnectionSuggestions(suggestionsResponse.data || []);
      } catch (err) {
        console.error('Error loading contacts:', err);
        setError('Failed to load contacts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadContacts();
  }, [profile]);
  
  // Filter and sort contacts when search or filters change
  useEffect(() => {
    filterAndSortContacts(contacts, debouncedSearchTerm, activeTab, filters, sortBy, sortOrder);
  }, [debouncedSearchTerm, activeTab, filters, sortBy, sortOrder, contacts]);
  
  // Filter and sort contacts
  const filterAndSortContacts = (contacts, searchTerm, activeTab, filters, sortBy, sortOrder) => {
    let filtered = [...contacts];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(contact => {
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
        return (
          fullName.includes(search) ||
          (contact.company && contact.company.toLowerCase().includes(search)) ||
          (contact.position && contact.position.toLowerCase().includes(search)) ||
          (contact.email && contact.email.toLowerCase().includes(search))
        );
      });
    }
    
    // Apply tab filter
    if (activeTab === 1) { // Recent
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(contact => 
        contact.lastContactDate && new Date(contact.lastContactDate) >= thirtyDaysAgo
      );
    } else if (activeTab === 2) { // Favorites
      filtered = filtered.filter(contact => contact.isFavorite);
    } else if (activeTab === 3) { // Requires Follow-up
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(contact => 
        contact.nextFollowUp && new Date(contact.nextFollowUp) <= today
      );
    }
    
    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(contact => 
        filters.categories.includes(contact.category)
      );
    }
    
    // Apply tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(contact => {
        if (!contact.tags || !contact.tags.length) return false;
        return filters.tags.some(tag => contact.tags.includes(tag));
      });
    }
    
    // Apply connection strength filter
    if (filters.connectionStrength && filters.connectionStrength.length > 0) {
      filtered = filtered.filter(contact => 
        filters.connectionStrength.includes(contact.connectionStrength)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else if (sortBy === 'company') {
        const companyA = (a.company || '').toLowerCase();
        const companyB = (b.company || '').toLowerCase();
        return sortOrder === 'asc' ? companyA.localeCompare(companyB) : companyB.localeCompare(companyA);
      } else if (sortBy === 'lastContact') {
        if (!a.lastContactDate) return sortOrder === 'asc' ? 1 : -1;
        if (!b.lastContactDate) return sortOrder === 'asc' ? -1 : 1;
        const dateA = new Date(a.lastContactDate);
        const dateB = new Date(b.lastContactDate);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'strength') {
        return sortOrder === 'asc' 
          ? a.connectionStrength - b.connectionStrength 
          : b.connectionStrength - a.connectionStrength;
      }
      return 0;
    });
    
    setFilteredContacts(filtered);
  };
  
  // Handle open contact dialog for adding new contact
  const handleOpenAddContact = () => {
    setContactForm({
      firstName: '',
      lastName: '',
      company: '',
      position: '',
      email: '',
      phone: '',
      linkedIn: '',
      twitter: '',
      website: '',
      category: '',
      location: '',
      tags: [],
      notes: '',
      isFavorite: false,
      connectionStrength: 0,
      lastContactDate: null,
      nextFollowUp: null,
      meetingNotes: [],
      connections: []
    });
    setIsEditMode(false);
    setContactDialogOpen(true);
  };
  
  // Handle open contact dialog for editing contact
  const handleOpenEditContact = (contact) => {
    setCurrentContact(contact);
    setContactForm({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      company: contact.company || '',
      position: contact.position || '',
      email: contact.email || '',
      phone: contact.phone || '',
      linkedIn: contact.linkedIn || '',
      twitter: contact.twitter || '',
      website: contact.website || '',
      category: contact.category || '',
      location: contact.location || '',
      tags: contact.tags || [],
      notes: contact.notes || '',
      isFavorite: contact.isFavorite || false,
      connectionStrength: contact.connectionStrength || 0,
      lastContactDate: contact.lastContactDate || null,
      nextFollowUp: contact.nextFollowUp || null,
      meetingNotes: contact.meetingNotes || [],
      connections: contact.connections || []
    });
    setIsEditMode(true);
    setMenuAnchorEl(null);
    setContactDialogOpen(true);
  };
  
  // Handle contact form change
  const handleContactFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm({
      ...contactForm,
      [name]: value
    });
  };
  
  // Handle add tag
  const handleAddTag = () => {
    if (customTag && !contactForm.tags.includes(customTag)) {
      setContactForm({
        ...contactForm,
        tags: [...contactForm.tags, customTag]
      });
      setCustomTag('');
    }
  };
  
  // Handle remove tag
  const handleRemoveTag = (tagToRemove) => {
    setContactForm({
      ...contactForm,
      tags: contactForm.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  // Handle save contact
  const handleSaveContact = async () => {
    try {
      if (isEditMode && currentContact) {
        // Update existing contact
        const updatedContact = {
          ...currentContact,
          ...contactForm,
          lastUpdated: new Date().toISOString()
        };
        
        await apiEndpoints.networking.updateContact(currentContact.id, updatedContact);
        
        setContacts(contacts.map(c => c.id === currentContact.id ? updatedContact : c));
        setSnackbarMessage('Contact updated successfully!');
      } else {
        // Add new contact
        const newContact = {
          ...contactForm,
          id: `contact-${Date.now()}`, // Temporary ID until backend assigns one
          userId: profile.id,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        
        const response = await apiEndpoints.networking.addContact(newContact);
        const savedContact = response.data;
        
        setContacts([...contacts, savedContact]);
        setSnackbarMessage('Contact added successfully!');
      }
      
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setContactDialogOpen(false);
    } catch (err) {
      console.error('Error saving contact:', err);
      setSnackbarMessage('Failed to save contact. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Handle delete contact
  const handleDeleteContact = async (contactId) => {
    try {
      await apiEndpoints.networking.deleteContact(contactId);
      
      setContacts(contacts.filter(c => c.id !== contactId));
      setConfirmDialogOpen(false);
      setSnackbarMessage('Contact deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error deleting contact:', err);
      setSnackbarMessage('Failed to delete contact. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Handle toggle favorite
  const handleToggleFavorite = async (contact) => {
    try {
      const updatedContact = {
        ...contact,
        isFavorite: !contact.isFavorite,
        lastUpdated: new Date().toISOString()
      };
      
      await apiEndpoints.networking.updateContact(contact.id, updatedContact);
      
      setContacts(contacts.map(c => c.id === contact.id ? updatedContact : c));
      
      setSnackbarMessage(`Contact ${updatedContact.isFavorite ? 'added to' : 'removed from'} favorites.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error updating favorite status:', err);
      setSnackbarMessage('Failed to update favorite status. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Handle add note
  const handleAddNote = async () => {
    if (!currentContact || !currentNote.trim()) return;
    
    try {
      const newNote = {
        id: `note-${Date.now()}`,
        text: currentNote,
        date: noteMeetingDate,
        createdAt: new Date().toISOString()
      };
      
      const updatedContact = {
        ...currentContact,
        meetingNotes: [...(currentContact.meetingNotes || []), newNote],
        lastContactDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      await apiEndpoints.networking.updateContact(currentContact.id, updatedContact);
      
      setContacts(contacts.map(c => c.id === currentContact.id ? updatedContact : c));
      setCurrentNote('');
      setNoteDialogOpen(false);
      
      setSnackbarMessage('Note added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error adding note:', err);
      setSnackbarMessage('Failed to add note. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Handle add reminder
  const handleAddReminder = async () => {
    if (!reminderForm.contactId) return;
    
    try {
      const contact = contacts.find(c => c.id === reminderForm.contactId);
      if (!contact) return;
      
      const reminderDate = new Date(`${reminderForm.date}T${reminderForm.time}`);
      
      const updatedContact = {
        ...contact,
        nextFollowUp: reminderDate.toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      await apiEndpoints.networking.updateContact(contact.id, updatedContact);
      
      // Also create a reminder in the system
      await apiEndpoints.reminders.addReminder({
        userId: profile.id,
        type: reminderForm.reminderType,
        title: `Follow up with ${contact.firstName} ${contact.lastName}`,
        description: reminderForm.notes,
        date: reminderDate.toISOString(),
        relatedId: contact.id,
        relatedType: 'contact',
        status: 'pending'
      });
      
      setContacts(contacts.map(c => c.id === contact.id ? updatedContact : c));
      setReminderDialogOpen(false);
      
      setSnackbarMessage('Reminder set successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error setting reminder:', err);
      setSnackbarMessage('Failed to set reminder. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Handle import contacts
  const handleImportContacts = async (source) => {
    try {
      const response = await apiEndpoints.networking.importContacts(source, profile.id);
      
      setContacts([...contacts, ...response.data]);
      setImportDialogOpen(false);
      
      setSnackbarMessage(`Successfully imported ${response.data.length} contacts.`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error(`Error importing contacts from ${source}:`, err);
      setSnackbarMessage(`Failed to import contacts from ${source}. Please try again.`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Handle export contacts
  const handleExportContacts = async (format) => {
    try {
      const response = await apiEndpoints.networking.exportContacts(profile.id, format);
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contacts_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setExportDialogOpen(false);
    } catch (err) {
      console.error('Error exporting contacts:', err);
      setSnackbarMessage('Failed to export contacts. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Render grid view contact card
  const renderContactCard = (contact) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={contact.id}>
      <Card 
        elevation={2}
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)'
          }
        }}
      >
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton 
            size="small" 
            onClick={() => handleToggleFavorite(contact)}
          >
            {contact.isFavorite ? (
              <Star color="warning" />
            ) : (
              <StarBorder />
            )}
          </IconButton>
        </Box>
        
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56, 
                bgcolor: getInitialsColor(`${contact.firstName} ${contact.lastName}`),
                mr: 2
              }}
            >
              {getInitials(`${contact.firstName} ${contact.lastName}`)}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {contact.firstName} {contact.lastName}
              </Typography>
              {contact.position && contact.company && (
                <Typography variant="body2" color="text.secondary">
                  {contact.position} at {contact.company}
                </Typography>
              )}
            </Box>
          </Box>
          
          {contact.category && (
            <Chip 
              label={contact.category} 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ mb: 2 }}
            />
          )}
          
          {contact.tags && contact.tags.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {contact.tags.slice(0, 3).map(tag => (
                <Chip 
                  key={tag} 
                  label={tag} 
                  size="small" 
                  variant="outlined" 
                />
              ))}
              {contact.tags.length > 3 && (
                <Chip 
                  label={`+${contact.tags.length - 3}`} 
                  size="small" 
                />
              )}
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Email fontSize="small" color="action" sx={{ mr: 1 }} />
            <Typography variant="body2" noWrap>
              {contact.email || 'No email'}
            </Typography>
          </Box>
          
          {contact.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Phone fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2">{contact.phone}</Typography>
            </Box>
          )}
          
          {contact.lastContactDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <AccessTime fontSize="small" color="action" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Last contact: {formatDistanceToNow(new Date(contact.lastContactDate), { addSuffix: true })}
              </Typography>
            </Box>
          )}
        </CardContent>
        
        <Divider />
        
        <CardActions>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Box>
              <Rating 
                size="small"
                value={contact.connectionStrength || 0}
                max={5}
                readOnly
                icon={<Star fontSize="inherit" />}
                emptyIcon={<StarBorder fontSize="inherit" />}
              />
            </Box>
            
            <Box>
              <IconButton 
                size="small"
                onClick={() => {
                  setCurrentContact(contact);
                  setNoteDialogOpen(true);
                }}
                title="Add note"
              >
                <NoteAdd />
              </IconButton>
              
              <IconButton 
                size="small"
                onClick={() => {
                  setReminderForm({
                    ...reminderForm,
                    contactId: contact.id,
                    date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
                    time: '10:00',
                    notes: '',
                    reminderType: 'followUp'
                  });
                  setReminderDialogOpen(true);
                }}
                title="Set reminder"
              >
                <NotificationsActive />
              </IconButton>
              
              <IconButton 
                size="small"
                onClick={(e) => {
                  setMenuAnchorEl(e.currentTarget);
                  setSelectedContactId(contact.id);
                }}
                title="More options"
              >
                <MoreVert />
              </IconButton>
            </Box>
          </Box>
        </CardActions>
        
        {contact.nextFollowUp && new Date(contact.nextFollowUp) <= new Date() && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              bgcolor: 'warning.main', 
              color: 'warning.contrastText',
              py: 0.5,
              textAlign: 'center',
              fontSize: '0.75rem'
            }}
          >
            Follow up needed
          </Box>
        )}
      </Card>
    </Grid>
  );
  
  // Render list view contact item
  const renderContactListItem = (contact) => (
    <ListItem
      key={contact.id}
      divider
      secondaryAction={
        <Box>
          <IconButton 
            size="small"
            onClick={() => handleToggleFavorite(contact)}
          >
            {contact.isFavorite ? <Star color="warning" /> : <StarBorder />}
          </IconButton>
          
          <IconButton 
            size="small"
            onClick={(e) => {
              setMenuAnchorEl(e.currentTarget);
              setSelectedContactId(contact.id);
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>
      }
    >
      <ListItemIcon>
        <Avatar 
          sx={{ 
            bgcolor: getInitialsColor(`${contact.firstName} ${contact.lastName}`)
          }}
        >
          {getInitials(`${contact.firstName} ${contact.lastName}`)}
        </Avatar>
      </ListItemIcon>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1">
              {contact.firstName} {contact.lastName}
            </Typography>
            {contact.nextFollowUp && new Date(contact.nextFollowUp) <= new Date() && (
              <Chip 
                label="Follow up" 
                size="small" 
                color="warning"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        }
        secondary={
          <>
            {contact.position && contact.company && (
              <Typography component="span" variant="body2" display="block">
                {contact.position} at {contact.company}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              {contact.email && (
                <Chip 
                  icon={<Email fontSize="small" />}
                  label={contact.email}
                  size="small"
                  variant="outlined"
                />
              )}
              
              {contact.phone && (
                <Chip 
                  icon={<Phone fontSize="small" />}
                  label={contact.phone}
                  size="small"
                  variant="outlined"
                />
              )}
              
              {contact.category && (
                <Chip 
                  label={contact.category}
                  size="small"
                />
              )}
            </Box>
          </>
        }
      />
    </ListItem>
  );
  
  // Helper function to get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Helper function to get color from initials
  const getInitialsColor = (name) => {
    const colors = [
      '#1976d2', '#388e3c', '#d32f2f', '#f57c00', 
      '#7b1fa2', '#c2185b', '#0288d1', '#00796b'
    ];
    const sum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Network
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => setImportDialogOpen(true)}
          >
            Import
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<CloudDownload />}
            onClick={() => setExportDialogOpen(true)}
          >
            Export
          </Button>
          
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={handleOpenAddContact}
          >
            Add Contact
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
              
              <Button
                startIcon={<FilterList />}
                onClick={() => setFilterDialogOpen(true)}
                variant="outlined"
                size="medium"
              >
                Filters
              </Button>
              
              <Button
                startIcon={<Sort />}
                variant="outlined"
                size="medium"
                onClick={(e) => setMenuAnchorEl(e.currentTarget)}
              >
                Sort
              </Button>
              
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => {
                  if (newMode !== null) {
                    setViewMode(newMode);
                  }
                }}
                size="small"
              >
                <Tooltip title="Grid View">
                  <Button value="grid">
                    <GridView />
                  </Button>
                </Tooltip>
                <Tooltip title="List View">
                  <Button value="list">
                    <ViewList />
                  </Button>
                </Tooltip>
              </ToggleButtonGroup>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab 
                icon={<People />} 
                iconPosition="start" 
                label={`All Contacts (${contacts.length})`} 
              />
              <Tab 
                icon={<History />} 
                iconPosition="start" 
                label="Recent" 
              />
              <Tab 
                icon={<Star />} 
                iconPosition="start" 
                label="Favorites" 
              />
              <Tab 
                icon={<AssignmentLate />} 
                iconPosition="start" 
                label="Needs Follow-up" 
              />
            </Tabs>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <LoadingSpinner message="Loading contacts..." />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            ) : filteredContacts.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  No contacts found
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {searchTerm ? 'Try different search terms or clear filters.' : 'Add your first contact to get started.'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={handleOpenAddContact}
                  sx={{ mt: 2 }}
                >
                  Add Contact
                </Button>
              </Box>
            ) : viewMode === 'grid' ? (
              <Grid container spacing={2}>
                {filteredContacts.map(contact => renderContactCard(contact))}
              </Grid>
            ) : (
              <List>
                {filteredContacts.map(contact => renderContactListItem(contact))}
              </List>
            )}
            
            {filteredContacts.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination 
                  count={Math.ceil(filteredContacts.length / rowsPerPage)} 
                  page={page}
                  onChange={(event, newPage) => setPage(newPage)}
                />
              </Box>
            )}
          </Paper>
        </Grid>
        
        {connectionSuggestions.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Suggested Connections
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                People you might want to connect with based on your network and profile.
              </Typography>
              
              <Grid container spacing={2}>
                {connectionSuggestions.slice(0, 4).map((suggestion) => (
                  <Grid item xs={12} sm={6} md={3} key={suggestion.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              mr: 1,
                              bgcolor: getInitialsColor(suggestion.name)
                            }}
                          >
                            {getInitials(suggestion.name)}
                          </Avatar>
                          <Typography variant="subtitle1" noWrap>
                            {suggestion.name}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {suggestion.title} at {suggestion.company}
                        </Typography>
                        
                        {suggestion.mutualConnections > 0 && (
                          <Typography variant="body2" sx={{ mt: 1, fontSize: '0.875rem' }}>
                            {suggestion.mutualConnections} mutual {suggestion.mutualConnections === 1 ? 'connection' : 'connections'}
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          onClick={() => handleAddSuggestion(suggestion)}
                          startIcon={<PersonAdd />}
                        >
                          Add Contact
                        </Button>
                        
                        {suggestion.linkedInProfile && (
                          <IconButton 
                            size="small" 
                            href={suggestion.linkedInProfile} 
                            target="_blank"
                            aria-label="LinkedIn profile"
                          >
                            <LinkedIn fontSize="small" />
                          </IconButton>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {connectionSuggestions.length > 4 && (
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button 
                    variant="text" 
                    onClick={() => navigate('/suggestions')}
                    endIcon={<ArrowForward />}
                  >
                    View All Suggestions
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Contact Dialog - Add or Edit */}
      <Dialog
        open={contactDialogOpen}
        onClose={() => setContactDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? 'Edit Contact' : 'Add New Contact'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                required
                fullWidth
                value={contactForm.firstName}
                onChange={(e) => setContactForm({
                  ...contactForm,
                  firstName: e.target.value
                })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                fullWidth
                value={contactForm.lastName}
                onChange={(e) => setContactForm({
                  ...contactForm,
                  lastName: e.target.value
                })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Company"
                fullWidth
                value={contactForm.company}
                onChange={(e) => setContactForm({
                  ...contactForm,
                  company: e.target.value
                })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Position/Title"
                fullWidth
                value={contactForm.position}
                onChange={(e) => setContactForm({
                  ...contactForm,
                  position: e.target.value
                })}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({
                  ...contactForm,
                  email: e.target.value
                })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutline fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                fullWidth
                value={contactForm.phone}
                onChange={(e) => setContactForm({
                  ...contactForm,
                  phone: e.target.value
                })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneAndroid fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="LinkedIn URL"
                fullWidth
                value={contactForm.linkedIn}
                onChange={(e) => setContactForm({
                  ...contactForm,
                  linkedIn: e.target.value
                })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkedIn fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Twitter/X Handle"
                fullWidth
                value={contactForm.twitter}
                onChange={(e) => setContactForm({
                  ...contactForm,
                  twitter: e.target.value
                })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Twitter fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Website"
                fullWidth
                value={contactForm.website}
                onChange={(e) => setContactForm({
                  ...contactForm,
                  website: e.target.value
                })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Language fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={contactForm.category}
                  label="Category"
                  onChange={(e) => setContactForm({
                    ...contactForm,
                    category: e.target.value
                  })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Location"
                fullWidth
                value={contactForm.location}
                onChange={(e) => setContactForm({
                  ...contactForm,
                  location: e.target.value
                })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Connection Strength
                </Typography>
                <Rating
                  value={contactForm.connectionStrength}
                  onChange={(e, newValue) => setContactForm({
                    ...contactForm,
                    connectionStrength: newValue
                  })}
                  max={5}
                  icon={<Star fontSize="inherit" />}
                  emptyIcon={<StarBorder fontSize="inherit" />}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {contactForm.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  placeholder="Add a tag"
                  size="small"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customTag.trim()) {
                      e.preventDefault();
                      handleAddTag(customTag.trim());
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => customTag.trim() && handleAddTag(customTag.trim())}
                >
                  Add
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes"
                multiline
                rows={4}
                fullWidth
                value={contactForm.notes}
                onChange={(e) => setContactForm({
                  ...contactForm,
                  notes: e.target.value
                })}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={contactForm.isFavorite}
                    onChange={(e) => setContactForm({
                      ...contactForm,
                      isFavorite: e.target.checked
                    })}
                  />
                }
                label="Mark as Favorite"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setContactDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => isEditMode ? handleUpdateContact() : handleAddContact()}
            disabled={!contactForm.firstName}
          >
            {isEditMode ? 'Update Contact' : 'Add Contact'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Meeting Note Dialog */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Meeting Note</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={noteMeetingDate}
                onChange={(e) => setNoteMeetingDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Meeting Notes"
                multiline
                rows={4}
                fullWidth
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="What did you discuss? What are the next steps?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddNote}
            disabled={!currentNote.trim()}
          >
            Save Note
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Follow Up Reminder Dialog */}
      <Dialog
        open={reminderDialogOpen}
        onClose={() => setReminderDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Set Follow-up Reminder</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={reminderForm.date}
                onChange={(e) => setReminderForm({
                  ...reminderForm,
                  date: e.target.value
                })}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Time"
                type="time"
                fullWidth
                value={reminderForm.time}
                onChange={(e) => setReminderForm({
                  ...reminderForm,
                  time: e.target.value
                })}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Reminder Type</InputLabel>
                <Select
                  value={reminderForm.reminderType}
                  label="Reminder Type"
                  onChange={(e) => setReminderForm({
                    ...reminderForm,
                    reminderType: e.target.value
                  })}
                >
                  <MenuItem value="followUp">General Follow-up</MenuItem>
                  <MenuItem value="birthday">Birthday/Anniversary</MenuItem>
                  <MenuItem value="meeting">Schedule Meeting</MenuItem>
                  <MenuItem value="checkIn">Check-in Call</MenuItem>
                  <MenuItem value="opportunity">Discuss Opportunity</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes"
                multiline
                rows={2}
                fullWidth
                value={reminderForm.notes}
                onChange={(e) => setReminderForm({
                  ...reminderForm,
                  notes: e.target.value
                })}
                placeholder="Why do you want to follow up?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSetReminder}
          >
            Set Reminder
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Import Contacts Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import Contacts</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Import your contacts from various sources. We support CSV files, LinkedIn connections, and more.
          </Typography>
          
          <List>
            <ListItem button onClick={() => handleImportContacts('csv')}>
              <ListItemIcon>
                <Description />
              </ListItemIcon>
              <ListItemText 
                primary="CSV File" 
                secondary="Import from Excel or other contact management systems" 
              />
            </ListItem>
            
            <ListItem button onClick={() => handleImportContacts('linkedin')}>
              <ListItemIcon>
                <LinkedIn />
              </ListItemIcon>
              <ListItemText 
                primary="LinkedIn" 
                secondary="Import your LinkedIn connections" 
              />
            </ListItem>
            
            <ListItem button onClick={() => handleImportContacts('google')}>
              <ListItemIcon>
                <Public />
              </ListItemIcon>
              <ListItemText 
                primary="Google Contacts" 
                secondary="Import from your Google account" 
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Export Contacts Dialog */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Contacts</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            Export your contacts in different formats.
          </Typography>
          
          <List>
            <ListItem button onClick={() => handleExportContacts('csv')}>
              <ListItemIcon>
                <Description />
              </ListItemIcon>
              <ListItemText 
                primary="CSV File" 
                secondary="Export to Excel or other systems" 
              />
            </ListItem>
            
            <ListItem button onClick={() => handleExportContacts('pdf')}>
              <ListItemIcon>
                <PictureAsPdf />
              </ListItemIcon>
              <ListItemText 
                primary="PDF" 
                secondary="Export as a PDF document" 
              />
            </ListItem>
            
            <ListItem button onClick={() => handleExportContacts('vcf')}>
              <ListItemIcon>
                <PermContactCalendar />
              </ListItemIcon>
              <ListItemText 
                primary="vCard / VCF" 
                secondary="Export as contact cards for phone/email systems" 
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>
            {confirmAction === 'delete' 
              ? 'Are you sure you want to delete this contact? This action cannot be undone.'
              : confirmAction === 'archive'
                ? 'Are you sure you want to archive this contact?'
                : 'Are you sure you want to proceed?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            color={confirmAction === 'delete' ? 'error' : 'primary'}
            variant="contained"
            onClick={handleConfirmAction}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Sort Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem onClick={() => handleSort('name')}>
          {sortBy === 'name' && (
            <ListItemIcon>
              {sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
            </ListItemIcon>
          )}
          <ListItemText primary="Name" />
        </MenuItem>
        
        <MenuItem onClick={() => handleSort('company')}>
          {sortBy === 'company' && (
            <ListItemIcon>
              {sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
            </ListItemIcon>
          )}
          <ListItemText primary="Company" />
        </MenuItem>
        
        <MenuItem onClick={() => handleSort('lastContact')}>
          {sortBy === 'lastContact' && (
            <ListItemIcon>
              {sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
            </ListItemIcon>
          )}
          <ListItemText primary="Last Contact Date" />
        </MenuItem>
        
        <MenuItem onClick={() => handleSort('connectionStrength')}>
          {sortBy === 'connectionStrength' && (
            <ListItemIcon>
              {sortOrder === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
            </ListItemIcon>
          )}
          <ListItemText primary="Connection Strength" />
        </MenuItem>
      </Menu>
      
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

export default NetworkingView;