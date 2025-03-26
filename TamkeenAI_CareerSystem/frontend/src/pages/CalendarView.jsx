import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Button, Divider,
  Grid, Card, CardContent, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert, CircularProgress, Tooltip, Chip,
  ToggleButtonGroup, ToggleButton, InputAdornment,
  FormHelperText, Switch, FormControlLabel
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  CalendarMonth, Event, Add, Delete, Edit,
  Today, ViewDay, ViewWeek, ViewModule, ChevronLeft,
  ChevronRight, MoreVert, Alarm, EventNote, Work,
  School, Business, Group, Description, AccessTime,
  Notifications, LocationOn, VideocamOutlined, Language,
  RepeatOutlined, ColorLens, Close, Check, DeleteOutline,
  Schedule, FilterList, Search, NavigateBefore, NavigateNext
} from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/AppContext';
import apiEndpoints from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { format, addDays, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

const CalendarView = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(),
    allDay: false,
    location: '',
    type: 'event',
    color: '#1976d2',
    reminder: 30,
    isVirtual: false,
    virtualLink: '',
    isRecurring: false,
    recurrencePattern: 'none',
    relatedApplication: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    showEvents: true,
    showInterviews: true,
    showApplicationDeadlines: true,
    showTasks: true
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const { profile } = useUser();
  
  // Load calendar data
  useEffect(() => {
    const loadCalendarData = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch events, interviews, applications with deadlines, and tasks
        const [
          eventsResponse, 
          interviewsResponse, 
          applicationsResponse,
          tasksResponse
        ] = await Promise.all([
          apiEndpoints.calendar.getEvents(profile.id),
          apiEndpoints.interviews.getUserInterviews(profile.id),
          apiEndpoints.applications.getUserApplications(profile.id),
          apiEndpoints.tasks.getUserTasks(profile.id)
        ]);
        
        // Process events
        const userEvents = eventsResponse.data || [];
        
        // Process interviews
        const formattedInterviews = (interviewsResponse.data || []).map(interview => ({
          id: `interview-${interview.id}`,
          title: `Interview: ${interview.jobTitle} at ${interview.companyName}`,
          start: parseISO(interview.startTime),
          end: parseISO(interview.endTime),
          description: interview.description || '',
          location: interview.location || '',
          color: '#4caf50',
          type: 'interview',
          relatedApplication: interview.applicationId,
          extendedProps: {
            interviewId: interview.id,
            companyName: interview.companyName,
            jobTitle: interview.jobTitle,
            interviewType: interview.type,
            interviewer: interview.interviewer,
            isVirtual: interview.isVirtual,
            virtualLink: interview.virtualLink,
            instructions: interview.instructions
          }
        }));
        
        // Process application deadlines
        const formattedDeadlines = (applicationsResponse.data || []).map(application => {
          if (application.deadline) {
            return {
              id: `deadline-${application.id}`,
              title: `Deadline: ${application.jobTitle} at ${application.companyName}`,
              start: parseISO(application.deadline),
              allDay: true,
              color: '#f44336',
              type: 'deadline',
              extendedProps: {
                applicationId: application.id,
                companyName: application.companyName,
                jobTitle: application.jobTitle
              }
            };
          }
          return null;
        }).filter(Boolean);
        
        // Process tasks
        const formattedTasks = (tasksResponse.data || []).map(task => {
          if (task.dueDate) {
            return {
              id: `task-${task.id}`,
              title: `Task: ${task.title}`,
              start: parseISO(task.dueDate),
              allDay: true,
              color: '#ff9800',
              type: 'task',
              extendedProps: {
                taskId: task.id,
                description: task.description,
                priority: task.priority,
                completed: task.completed
              }
            };
          }
          return null;
        }).filter(Boolean);
        
        // Combine all events
        const allEvents = [
          ...userEvents,
          ...formattedInterviews,
          ...formattedDeadlines,
          ...formattedTasks
        ];
        
        setEvents(allEvents);
        setInterviews(interviewsResponse.data || []);
        setApplications(applicationsResponse.data || []);
        setTasks(tasksResponse.data || []);
      } catch (err) {
        console.error('Error loading calendar data:', err);
        setError('Failed to load calendar data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadCalendarData();
  }, [profile]);
  
  // Handle date navigation
  const handlePrevious = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().prev();
      setCurrentDate(calendarRef.current.getApi().getDate());
    }
  };
  
  const handleNext = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().next();
      setCurrentDate(calendarRef.current.getApi().getDate());
    }
  };
  
  const handleToday = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
      setCurrentDate(calendarRef.current.getApi().getDate());
    }
  };
  
  // Handle view change
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
      if (calendarRef.current) {
        calendarRef.current.getApi().changeView(newView);
      }
    }
  };
  
  // Handle event click
  const handleEventClick = (info) => {
    const eventId = info.event.id;
    const eventType = info.event.extendedProps?.type || 'event';
    
    // Find the corresponding event
    let selectedEventData;
    
    if (eventType === 'interview') {
      const interviewId = info.event.extendedProps.interviewId;
      const interview = interviews.find(i => i.id === interviewId);
      
      if (interview) {
        selectedEventData = {
          id: eventId,
          title: interview.jobTitle ? `Interview: ${interview.jobTitle}` : 'Interview',
          description: interview.description || '',
          start: parseISO(interview.startTime),
          end: parseISO(interview.endTime),
          location: interview.location || '',
          type: 'interview',
          isVirtual: interview.isVirtual,
          virtualLink: interview.virtualLink,
          relatedApplication: interview.applicationId,
          notes: interview.notes || '',
          extendedProps: info.event.extendedProps
        };
      }
    } else if (eventType === 'deadline') {
      const applicationId = info.event.extendedProps.applicationId;
      const application = applications.find(a => a.id === applicationId);
      
      if (application) {
        selectedEventData = {
          id: eventId,
          title: application.jobTitle ? `Deadline: ${application.jobTitle}` : 'Application Deadline',
          description: application.description || '',
          start: parseISO(application.deadline),
          end: parseISO(application.deadline),
          allDay: true,
          type: 'deadline',
          relatedApplication: applicationId,
          extendedProps: info.event.extendedProps
        };
      }
    } else if (eventType === 'task') {
      const taskId = info.event.extendedProps.taskId;
      const task = tasks.find(t => t.id === taskId);
      
      if (task) {
        selectedEventData = {
          id: eventId,
          title: task.title || 'Task',
          description: task.description || '',
          start: parseISO(task.dueDate),
          end: parseISO(task.dueDate),
          allDay: true,
          type: 'task',
          notes: task.notes || '',
          extendedProps: info.event.extendedProps
        };
      }
    } else {
      // Regular event
      selectedEventData = {
        id: info.event.id,
        title: info.event.title,
        description: info.event.extendedProps?.description || '',
        start: info.event.start,
        end: info.event.end || info.event.start,
        allDay: info.event.allDay,
        location: info.event.extendedProps?.location || '',
        type: info.event.extendedProps?.type || 'event',
        color: info.event.backgroundColor,
        reminder: info.event.extendedProps?.reminder || 30,
        isVirtual: info.event.extendedProps?.isVirtual || false,
        virtualLink: info.event.extendedProps?.virtualLink || '',
        isRecurring: info.event.extendedProps?.isRecurring || false,
        recurrencePattern: info.event.extendedProps?.recurrencePattern || 'none',
        relatedApplication: info.event.extendedProps?.relatedApplication || '',
        notes: info.event.extendedProps?.notes || '',
        extendedProps: info.event.extendedProps
      };
    }
    
    setSelectedEvent(selectedEventData);
    setEventForm(selectedEventData);
    setIsEditMode(true);
    setEventDialogOpen(true);
  };
  
  // Handle date select (for creating new events)
  const handleDateSelect = (selectInfo) => {
    const end = selectInfo.end ? new Date(selectInfo.end) : new Date(selectInfo.start);
    
    // If all-day event is selected, adjust end date to be the same as start for UI
    const adjustedEnd = selectInfo.allDay ? new Date(selectInfo.start) : end;
    
    setEventForm({
      title: '',
      description: '',
      start: new Date(selectInfo.start),
      end: adjustedEnd,
      allDay: selectInfo.allDay,
      location: '',
      type: 'event',
      color: '#1976d2',
      reminder: 30,
      isVirtual: false,
      virtualLink: '',
      isRecurring: false,
      recurrencePattern: 'none',
      relatedApplication: '',
      notes: ''
    });
    
    setIsEditMode(false);
    setSelectedEvent(null);
    setEventDialogOpen(true);
  };
  
  // Handle form input changes
  const handleEventFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setEventForm({
      ...eventForm,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear validation error when field is changed
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  // Handle date/time picker changes
  const handleDateChange = (field, date) => {
    setEventForm({
      ...eventForm,
      [field]: date
    });
    
    // Clear validation error
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: null
      });
    }
  };
  
  // Validate event form
  const validateEventForm = () => {
    const errors = {};
    
    if (!eventForm.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!eventForm.start) {
      errors.start = 'Start date is required';
    }
    
    if (!eventForm.end) {
      errors.end = 'End date is required';
    }
    
    if (eventForm.start && eventForm.end && !eventForm.allDay) {
      if (isAfter(eventForm.start, eventForm.end)) {
        errors.end = 'End time must be after start time';
      }
    }
    
    if (eventForm.isVirtual && !eventForm.virtualLink) {
      errors.virtualLink = 'Virtual meeting link is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle event create/update
  const handleEventSave = async () => {
    if (!validateEventForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const eventData = {
        ...eventForm,
        userId: profile.id
      };
      
      if (isEditMode && selectedEvent) {
        // Update existing event
        await apiEndpoints.calendar.updateEvent(selectedEvent.id, eventData);
        
        setSnackbarMessage('Event updated successfully');
        setSnackbarSeverity('success');
      } else {
        // Create new event
        const response = await apiEndpoints.calendar.createEvent(eventData);
        
        setSnackbarMessage('Event created successfully');
        setSnackbarSeverity('success');
        
        // Add the new event to state
        setEvents([
          ...events,
          {
            ...eventData,
            id: response.data.id
          }
        ]);
      }
      
      setEventDialogOpen(false);
      setSnackbarOpen(true);
      
      // Refresh calendar data
      calendarRef.current.getApi().refetchEvents();
    } catch (err) {
      console.error('Error saving event:', err);
      setSnackbarMessage('Failed to save event. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle event delete
  const handleEventDelete = async () => {
    if (!selectedEvent) return;
    
    setIsSubmitting(true);
    
    try {
      await apiEndpoints.calendar.deleteEvent(selectedEvent.id);
      
      setSnackbarMessage('Event deleted successfully');
      setSnackbarSeverity('success');
      
      // Remove event from state
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      
      setDeleteConfirmOpen(false);
      setEventDialogOpen(false);
      setSnackbarOpen(true);
      
      // Refresh calendar data
      calendarRef.current.getApi().refetchEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      setSnackbarMessage('Failed to delete event. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsSubmitting(false);
      setDeleteConfirmOpen(false);
    }
  };
  
  // Filter events based on filter options
  const filterEvents = (events) => {
    return events.filter(event => {
      const eventType = event.type || 'event';
      
      if (eventType === 'interview' && !filterOptions.showInterviews) {
        return false;
      }
      
      if (eventType === 'deadline' && !filterOptions.showApplicationDeadlines) {
        return false;
      }
      
      if (eventType === 'task' && !filterOptions.showTasks) {
        return false;
      }
      
      if (eventType === 'event' && !filterOptions.showEvents) {
        return false;
      }
      
      return true;
    });
  };
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilterOptions({
      ...filterOptions,
      [name]: checked
    });
  };
  
  // Render event dialog
  const renderEventDialog = () => (
    <Dialog
      open={eventDialogOpen}
      onClose={() => setEventDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        {isEditMode ? 'Edit' : 'Add'} {eventForm.type === 'interview' ? 'Interview' : 'Event'}
        
        <IconButton
          aria-label="close"
          onClick={() => setEventDialogOpen(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="title"
              label="Title"
              value={eventForm.title}
              onChange={handleEventFormChange}
              fullWidth
              required
              error={!!formErrors.title}
              helperText={formErrors.title}
              disabled={eventForm.type === 'interview' || eventForm.type === 'deadline'}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={eventForm.start}
                onChange={(date) => handleDateChange('start', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    error={!!formErrors.start}
                    helperText={formErrors.start}
                  />
                )}
                readOnly={eventForm.type === 'interview' || eventForm.type === 'deadline'}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={eventForm.end}
                onChange={(date) => handleDateChange('end', date)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    required
                    error={!!formErrors.end}
                    helperText={formErrors.end}
                  />
                )}
                readOnly={eventForm.type === 'interview' || eventForm.type === 'deadline'}
              />
            </LocalizationProvider>
          </Grid>
          
          {!eventForm.allDay && (
            <>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="Start Time"
                    value={eventForm.start}
                    onChange={(date) => handleDateChange('start', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        disabled={eventForm.allDay}
                        error={!!formErrors.start}
                        helperText={formErrors.start}
                      />
                    )}
                    readOnly={eventForm.type === 'interview' || eventForm.type === 'deadline'}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="End Time"
                    value={eventForm.end}
                    onChange={(date) => handleDateChange('end', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        disabled={eventForm.allDay}
                        error={!!formErrors.end}
                        helperText={formErrors.end}
                      />
                    )}
                    readOnly={eventForm.type === 'interview' || eventForm.type === 'deadline'}
                  />
                </LocalizationProvider>
              </Grid>
            </>
          )}
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  name="allDay"
                  checked={eventForm.allDay}
                  onChange={handleEventFormChange}
                  disabled={eventForm.type === 'interview' || eventForm.type === 'deadline'}
                />
              }
              label="All Day"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="description"
              label="Description"
              value={eventForm.description}
              onChange={handleEventFormChange}
              fullWidth
              multiline
              rows={4}
              disabled={eventForm.type === 'interview' || eventForm.type === 'deadline'}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="location"
              label="Location"
              value={eventForm.location}
              onChange={handleEventFormChange}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                )
              }}
              disabled={eventForm.type === 'interview' || eventForm.type === 'deadline'}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  name="isVirtual"
                  checked={eventForm.isVirtual}
                  onChange={handleEventFormChange}
                  disabled={eventForm.type === 'interview' || eventForm.type === 'deadline'}
                />
              }
              label="Virtual Meeting"
            />
          </Grid>
          
          {eventForm.isVirtual && (
            <Grid item xs={12}>
              <TextField
                name="virtualLink"
                label="Meeting Link"
                value={eventForm.virtualLink}
                onChange={handleEventFormChange}
                fullWidth
                error={!!formErrors.virtualLink}
                helperText={formErrors.virtualLink}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VideocamOutlined />
                    </InputAdornment>
                  )
                }}
                disabled={eventForm.type === 'interview' || eventForm.type === 'deadline'}
              />
            </Grid>
          )}
          
          {eventForm.type === 'event' && (
            <>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    name="type"
                    value={eventForm.type}
                    onChange={handleEventFormChange}
                    disabled={eventForm.type !== 'event'}
                  >
                    <MenuItem value="event">General Event</MenuItem>
                    <MenuItem value="meeting">Meeting</MenuItem>
                    <MenuItem value="reminder">Reminder</MenuItem>
                    <MenuItem value="networking">Networking</MenuItem>
                    <MenuItem value="learning">Learning Session</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Reminder</InputLabel>
                  <Select
                    name="reminder"
                    value={eventForm.reminder}
                    onChange={handleEventFormChange}
                  >
                    <MenuItem value={0}>No reminder</MenuItem>
                    <MenuItem value={5}>5 minutes before</MenuItem>
                    <MenuItem value={15}>15 minutes before</MenuItem>
                    <MenuItem value={30}>30 minutes before</MenuItem>
                    <MenuItem value={60}>1 hour before</MenuItem>
                    <MenuItem value={120}>2 hours before</MenuItem>
                    <MenuItem value={1440}>1 day before</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Color</InputLabel>
                  <Select
                    name="color"
                    value={eventForm.color}
                    onChange={handleEventFormChange}
                  >
                    <MenuItem value="#1976d2" sx={{ color: '#1976d2' }}>Blue</MenuItem>
                    <MenuItem value="#4caf50" sx={{ color: '#4caf50' }}>Green</MenuItem>
                    <MenuItem value="#f44336" sx={{ color: '#f44336' }}>Red</MenuItem>
                    <MenuItem value="#ff9800" sx={{ color: '#ff9800' }}>Orange</MenuItem>
                    <MenuItem value="#9c27b0" sx={{ color: '#9c27b0' }}>Purple</MenuItem>
                    <MenuItem value="#607d8b" sx={{ color: '#607d8b' }}>Gray</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
          
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Notes"
              value={eventForm.notes}
              onChange={handleEventFormChange}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        {isEditMode && eventForm.type === 'event' && (
          <Button 
            color="error" 
            onClick={() => setDeleteConfirmOpen(true)}
            startIcon={<Delete />}
          >
            Delete
          </Button>
        )}
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Button onClick={() => setEventDialogOpen(false)}>
          Cancel
        </Button>
        
        {(eventForm.type === 'event' || eventForm.type === 'reminder' || 
         eventForm.type === 'meeting' || eventForm.type === 'networking' || 
         eventForm.type === 'learning') && (
          <Button 
            variant="contained" 
            onClick={handleEventSave}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <Save />}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
  
  // Render delete confirmation dialog
  const renderDeleteConfirmDialog = () => (
    <Dialog
      open={deleteConfirmOpen}
      onClose={() => setDeleteConfirmOpen(false)}
    >
      <DialogTitle>Delete Event</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this event? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteConfirmOpen(false)}>
          Cancel
        </Button>
        <Button 
          color="error" 
          onClick={handleEventDelete}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : <DeleteOutline />}
        >
          {isSubmitting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  // Render filter dialog
  const renderFilterDialog = () => (
    <Dialog
      open={filterDialogOpen}
      onClose={() => setFilterDialogOpen(false)}
    >
      <DialogTitle>Filter Calendar</DialogTitle>
      <DialogContent>
        <FormControlLabel
          control={
            <Checkbox
              checked={filterOptions.showEvents}
              onChange={handleFilterChange}
              name="showEvents"
            />
          }
          label="Show Events"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={filterOptions.showInterviews}
              onChange={handleFilterChange}
              name="showInterviews"
            />
          }
          label="Show Interviews"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={filterOptions.showApplicationDeadlines}
              onChange={handleFilterChange}
              name="showApplicationDeadlines"
            />
          }
          label="Show Application Deadlines"
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={filterOptions.showTasks}
              onChange={handleFilterChange}
              name="showTasks"
            />
          }
          label="Show Tasks"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setFilterDialogOpen(false)}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <Box sx={{ py: 3, px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Calendar
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={handlePrevious}>
            <NavigateBefore />
          </IconButton>
          
          <Button variant="outlined" onClick={handleToday} sx={{ mx: 1 }}>
            Today
          </Button>
          
          <IconButton onClick={handleNext}>
            <NavigateNext />
          </IconButton>
          
          <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          
          <Box>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={handleViewChange}
              aria-label="calendar view"
              size="small"
            >
              <ToggleButton value="dayGridMonth" aria-label="month view">
                <Tooltip title="Month">
                  <ViewModule />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="timeGridWeek" aria-label="week view">
                <Tooltip title="Week">
                  <ViewWeek />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="timeGridDay" aria-label="day view">
                <Tooltip title="Day">
                  <ViewDay />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="listWeek" aria-label="list view">
                <Tooltip title="List">
                  <ViewDay />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          <Tooltip title="Filter">
            <IconButton onClick={() => setFilterDialogOpen(true)} sx={{ ml: 1 }}>
              <FilterList />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Add Event">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEventForm({
                  title: '',
                  description: '',
                  start: new Date(),
                  end: new Date(),
                  allDay: false,
                  location: '',
                  type: 'event',
                  color: '#1976d2',
                  reminder: 30,
                  isVirtual: false,
                  virtualLink: '',
                  isRecurring: false,
                  recurrencePattern: 'none',
                  relatedApplication: '',
                  notes: ''
                });
                setIsEditMode(false);
                setSelectedEvent(null);
                setEventDialogOpen(true);
              }}
              sx={{ ml: 2 }}
            >
              Event
            </Button>
          </Tooltip>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <LoadingSpinner message="Loading calendar..." />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box sx={{ height: '70vh' }}>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={view}
              headerToolbar={false}
              events={filterEvents(events)}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
            />
          </Box>
        )}
      </Paper>
      
      {renderEventDialog()}
      {renderDeleteConfirmDialog()}
      {renderFilterDialog()}
      
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

export default CalendarView; 