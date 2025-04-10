import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  IconButton, 
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  Tooltip,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, addMonths, subMonths, isSameWeek } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useTranslation } from 'react-i18next';

const CalendarCard = ({ data }) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingDialog, setBookingDialog] = useState(false);
  const [bookingTitle, setBookingTitle] = useState('');
  const [eventType, setEventType] = useState('meeting');
  const [localEvents, setLocalEvents] = useState([]);
  const { t, i18n } = useTranslation();
  
  // Determine locale based on current language
  const locale = i18n.language === 'ar' ? arSA : enUS;
  
  // Event types and their corresponding icons and colors
  const eventTypes = {
    meeting: { icon: <MeetingRoomIcon fontSize="small" />, color: '#ff9800' },
    task: { icon: <AssignmentIcon fontSize="small" />, color: '#4caf50' },
    interview: { icon: <WorkIcon fontSize="small" />, color: '#2196f3' },
    course: { icon: <SchoolIcon fontSize="small" />, color: '#9c27b0' }
  };
  
  // Load events from props on component mount
  useEffect(() => {
    const initialEvents = data?.events || [
      { 
        title: 'Interview with XYZ Corp', 
        date: new Date(), 
        type: 'interview' 
      },
      { 
        title: 'Resume Review', 
        date: addDays(new Date(), 2), 
        type: 'task' 
      }
    ];
    
    setLocalEvents(initialEvents);
  }, [data]);
  
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const onDateClick = (day) => {
    setSelectedDate(day);
  };
  
  const openBookingDialog = () => {
    setBookingDialog(true);
  };
  
  const closeBookingDialog = () => {
    setBookingDialog(false);
    setBookingTitle('');
    setEventType('meeting');
  };
  
  const handleBooking = () => {
    if (bookingTitle.trim() === '') return;
    
    // Create new event
    const newEvent = {
      title: bookingTitle,
      date: selectedDate,
      type: eventType
    };
    
    // Update local events state
    setLocalEvents([...localEvents, newEvent]);
    
    closeBookingDialog();
  };
  
  // Get events for a specific date
  const getEventsForDate = (date) => {
    return localEvents.filter(event => isSameDay(new Date(event.date), date));
  };
  
  // Get upcoming events (this week)
  const getUpcomingEvents = () => {
    return localEvents.filter(event => {
      const eventDate = new Date(event.date);
      return isSameWeek(eventDate, new Date()) && eventDate >= new Date();
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  
  // Generate the calendar cells for the current month view
  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";
    
    // Create header row with day names
    const daysOfWeek = [];
    const dayFormat = "EEEEE"; // Single letter day name
    for (let i = 0; i < 7; i++) {
      daysOfWeek.push(
        <Box key={i} sx={{ width: '14.2%', p: 0.5, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' }}>
            {format(addDays(startOfWeek(new Date()), i), dayFormat, { locale })}
          </Typography>
        </Box>
      );
    }
    rows.unshift(<Grid container key="header">{daysOfWeek}</Grid>);
    
    // Create calendar cells for each day
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat, { locale });
        const cloneDay = day;
        const dayEvents = getEventsForDate(day);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        days.push(
          <Box 
            key={day.toString()}
            onClick={() => isCurrentMonth && onDateClick(cloneDay)}
            sx={{ 
              width: '14.2%', 
              height: '24px',
              p: 0.5, 
              textAlign: 'center',
              cursor: isCurrentMonth ? 'pointer' : 'default',
              position: 'relative',
              background: isToday(day) 
                ? 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%)' 
                : isSameDay(day, selectedDate) 
                  ? 'rgba(255,255,255,0.2)' 
                  : 'transparent',
              borderRadius: '50%',
              transition: 'transform 0.2s ease, background 0.2s ease',
              '&:hover': isCurrentMonth ? {
                background: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.1)',
              } : {}
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.7rem',
                opacity: isCurrentMonth ? 1 : 0.3,
                fontWeight: isToday(day) ? 'bold' : 'normal',
                color: isDarkMode ? '#fff' : '#333',
                textShadow: isDarkMode ? '0 1px 1px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              {formattedDate}
            </Typography>
            
            {dayEvents.length > 0 && isCurrentMonth && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: dayEvents[0].type && eventTypes[dayEvents[0].type] 
                    ? eventTypes[dayEvents[0].type].color 
                    : '#fff',
                  boxShadow: '0 0 3px rgba(0,0,0,0.2)'
                }}
              />
            )}
          </Box>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <Grid container key={day.toString()}>
          {days}
        </Grid>
      );
      days = [];
    }
    
    return rows;
  };
  
  // Render events for the selected date
  const renderSelectedDateEvents = () => {
    const dateEvents = getEventsForDate(selectedDate);
    
    if (dateEvents.length === 0) {
      return (
        <Typography 
          variant="caption" 
          sx={{ 
            color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)', 
            textAlign: 'center', 
            mt: 1, 
            fontWeight: 500,
            textShadow: isDarkMode ? '0 1px 1px rgba(0,0,0,0.15)' : 'none'
          }}
        >
          {t('calendarComponent.noEvents')}
        </Typography>
      );
    }
    
    return (
      <Box sx={{ mt: 1 }}>
        {dateEvents.map((event, index) => (
          <Chip
            key={index}
            icon={event.type && eventTypes[event.type] ? eventTypes[event.type].icon : <EventIcon fontSize="small" />}
            label={event.title}
            size="small"
            sx={{ 
              m: 0.5, 
              color: isDarkMode ? '#fff' : '#333',
              fontWeight: 'bold',
              borderColor: 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(4px)',
              backgroundColor: event.type && eventTypes[event.type] 
                ? isDarkMode 
                  ? `${eventTypes[event.type].color}60` // 60 for higher opacity in dark mode
                  : `${eventTypes[event.type].color}90` // 90 for even higher opacity in light mode
                : isDarkMode 
                  ? 'rgba(255,255,255,0.2)'
                  : 'rgba(0,0,0,0.1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: event.type && eventTypes[event.type] 
                  ? isDarkMode
                    ? `${eventTypes[event.type].color}80` // 80 for even higher opacity on hover in dark mode
                    : `${eventTypes[event.type].color}A0` // A0 for highest opacity on hover in light mode
                  : isDarkMode 
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(0,0,0,0.15)',
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease'
              },
              transition: 'all 0.2s ease',
              '& .MuiChip-icon': { 
                color: event.type && eventTypes[event.type] 
                  ? eventTypes[event.type].color 
                  : isDarkMode ? '#fff' : '#333',
                filter: isDarkMode ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' : 'none'
              },
              '& .MuiChip-label': {
                textShadow: isDarkMode ? '0 1px 1px rgba(0,0,0,0.15)' : 'none'
              }
            }}
          />
        ))}
      </Box>
    );
  };
  
  // Render upcoming events
  const renderUpcomingEvents = () => {
    const upcomingEvents = getUpcomingEvents();
    
    if (upcomingEvents.length === 0) {
      return null;
    }
    
    return (
      <Box sx={{ 
        mt: 'auto',
        pt: 1,
        display: upcomingEvents.length > 0 ? 'block' : 'none',
        borderTop: '1px solid rgba(255,255,255,0.2)',
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 'bold', 
            color: isDarkMode ? '#fff' : '#333',
            textShadow: isDarkMode ? '0 1px 1px rgba(0,0,0,0.15)' : 'none'
          }}
        >
          {t('calendarComponent.upcoming')}:
        </Typography>
        {upcomingEvents.slice(0, 1).map((event, index) => (
          <Box 
            key={index}
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              mt: 0.5,
              p: 1,
              borderRadius: 1,
              backdropFilter: 'blur(4px)',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)',
              color: isDarkMode ? '#fff' : '#333',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 3px 8px rgba(0,0,0,0.1)'
              }
            }}
          >
            <Box sx={{ 
              mr: 1,
              color: event.type && eventTypes[event.type] ? eventTypes[event.type].color : (isDarkMode ? '#fff' : '#333'),
              filter: isDarkMode ? 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))' : 'none'
            }}>
              {event.type && eventTypes[event.type] ? eventTypes[event.type].icon : <EventIcon fontSize="small" />}
            </Box>
            <Box>
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  fontWeight: 'bold',
                  color: isDarkMode ? '#fff' : '#333',
                  textShadow: isDarkMode ? '0 1px 1px rgba(0,0,0,0.15)' : 'none'
                }}
              >
                {event.title}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.7rem', 
                  color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                  fontWeight: 500
                }}
              >
                {format(new Date(event.date), 'E, MMM d', { locale })}
              </Typography>
            </Box>
          </Box>
        ))}
        {upcomingEvents.length > 1 && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)', 
              display: 'block', 
              textAlign: 'right', 
              fontSize: '0.7rem',
              fontWeight: 500,
              mt: 0.5
            }}
          >
            +{upcomingEvents.length - 1} more
          </Typography>
        )}
      </Box>
    );
  };
  
  return (
    <Box sx={{ 
      height: '100%', 
      p: 1,
      display: 'flex',
      flexDirection: 'column',
      direction: i18n.language === 'ar' ? 'rtl' : 'ltr'
    }}>
      {/* Calendar Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 1
      }}>
        <IconButton 
          size="small" 
          onClick={prevMonth}
          sx={{ color: isDarkMode ? '#fff' : '#333' }}
        >
          <ArrowBackIosNewIcon fontSize="inherit" />
        </IconButton>
        
        <Typography variant="subtitle2" sx={{ 
          fontWeight: 'bold', 
          color: isDarkMode ? '#fff' : '#333',
          textShadow: isDarkMode ? '0 1px 1px rgba(0,0,0,0.15)' : 'none',
          letterSpacing: '0.5px'
        }}>
          {format(currentDate, 'MMMM yyyy', { locale })}
        </Typography>
        
        <IconButton 
          size="small"
          onClick={nextMonth}
          sx={{ color: isDarkMode ? '#fff' : '#333' }}
        >
          <ArrowForwardIosIcon fontSize="inherit" />
        </IconButton>
      </Box>
      
      {/* Calendar Grid */}
      <Box sx={{ mb: 1 }}>
        {renderCells()}
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <Typography variant="body2" sx={{ 
          fontWeight: 'bold',
          color: isDarkMode ? '#fff' : '#333',
          textShadow: isDarkMode ? '0 1px 1px rgba(0,0,0,0.15)' : 'none' 
        }}>
          {format(selectedDate, 'MMM d, yyyy', { locale })}
        </Typography>
        
        <Tooltip title={t('calendarComponent.addEvent')}>
          <IconButton 
            size="small" 
            onClick={openBookingDialog}
            sx={{ 
              color: isDarkMode ? '#fff' : '#333',
              bgcolor: 'rgba(255,255,255,0.15)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Selected Date Events */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {renderSelectedDateEvents()}
      </Box>
      
      {/* Upcoming Events */}
      {renderUpcomingEvents()}
      
      {/* Booking Dialog */}
      <Dialog open={bookingDialog} onClose={closeBookingDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{t('calendarComponent.addNewEvent')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {format(selectedDate, 'PPPP', { locale })}
            </Typography>
            <TextField
              fullWidth
              label={t('calendarComponent.eventTitle')}
              margin="dense"
              value={bookingTitle}
              onChange={(e) => setBookingTitle(e.target.value)}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>{t('calendarComponent.eventType')}</InputLabel>
              <Select
                value={eventType}
                label={t('calendarComponent.eventType')}
                onChange={(e) => setEventType(e.target.value)}
              >
                <MenuItem value="meeting">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MeetingRoomIcon fontSize="small" sx={{ mr: 1, color: eventTypes.meeting.color }} />
                    {t('calendarComponent.meeting')}
                  </Box>
                </MenuItem>
                <MenuItem value="task">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AssignmentIcon fontSize="small" sx={{ mr: 1, color: eventTypes.task.color }} />
                    {t('calendarComponent.task')}
                  </Box>
                </MenuItem>
                <MenuItem value="interview">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WorkIcon fontSize="small" sx={{ mr: 1, color: eventTypes.interview.color }} />
                    {t('calendarComponent.interview')}
                  </Box>
                </MenuItem>
                <MenuItem value="course">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon fontSize="small" sx={{ mr: 1, color: eventTypes.course.color }} />
                    {t('calendarComponent.course')}
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBookingDialog}>{t('calendarComponent.cancel')}</Button>
          <Button 
            onClick={handleBooking} 
            variant="contained" 
            color="primary"
            disabled={!bookingTitle.trim()}
          >
            {t('calendarComponent.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarCard; 