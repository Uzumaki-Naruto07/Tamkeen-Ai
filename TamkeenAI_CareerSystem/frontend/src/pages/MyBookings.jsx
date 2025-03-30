import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Tab,
  Tabs
} from '@mui/material';
import { 
  CalendarMonth, 
  AccessTime, 
  VideoCall, 
  Cancel, 
  Edit, 
  Event, 
  EventAvailable, 
  ContentCopy, 
  Download,
  Delete,
  Check,
  Add,
  ArrowBack,
  Payment,
  Print
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const MyBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [highlightedBookingId, setHighlightedBookingId] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadBookings();
    loadPayments();
    
    // Check for success message in location state (e.g., after rescheduling)
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
    
    // Check if we should set a specific active tab
    if (location.state?.activeTab !== undefined) {
      setTabValue(location.state.activeTab);
    }
    
    // Check if we should highlight a specific booking
    if (location.state?.highlightBookingId) {
      setHighlightedBookingId(location.state.highlightBookingId);
      setTabValue(0); // Ensure we're on the Upcoming tab
      
      // Scroll to the highlighted booking after it renders
      setTimeout(() => {
        const bookingElement = document.getElementById(`booking-${location.state.highlightBookingId}`);
        if (bookingElement) {
          bookingElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          console.log(`Could not find element for booking-${location.state.highlightBookingId}, forcing refresh`);
          // If booking not found but should exist, force a refresh
          loadBookings();
          loadPayments();
          
          // Try again after a short delay
          setTimeout(() => {
            const retryElement = document.getElementById(`booking-${location.state.highlightBookingId}`);
            if (retryElement) {
              retryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 1000);
        }
      }, 500);
    }
    
    // If forceRefresh is set, reload data immediately
    if (location.state?.forceRefresh) {
      console.log('Force refresh requested, reloading data');
      loadBookings();
      loadPayments();
    }
    
    // Clear the location state after reading the data
    window.history.replaceState({}, document.title);
    
    // Set up a timer to refresh bookings if the component is mounted for long periods
    const refreshTimer = setInterval(() => {
      console.log('Refreshing bookings...');
      loadBookings();
      loadPayments();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(refreshTimer); // Clean up on unmount
  }, [location]);
  
  // Add a listener for when the user comes back to this component via browser navigation
  useEffect(() => {
    // This function will be called when the component becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing bookings');
        loadBookings();
        loadPayments();
      }
    };
    
    // Add visibility change event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also add a focus event listener for when tab is switched
    window.addEventListener('focus', () => {
      console.log('Window focus, refreshing bookings');
      loadBookings();
      loadPayments();
    });
    
    // Clean up on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', () => {});
    };
  }, []);
  
  const loadBookings = () => {
    // Get bookings from localStorage
    const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    console.log('All bookings loaded:', userBookings);
    
    // Validate all bookings have required fields
    const validBookings = userBookings.filter(booking => {
      if (!booking.id || !booking.date || !booking.coachName) {
        console.error('Invalid booking found:', booking);
        return false;
      }
      return true;
    });
    
    if (validBookings.length !== userBookings.length) {
      console.warn(`Filtered out ${userBookings.length - validBookings.length} invalid bookings`);
      // Save the filtered bookings back to localStorage
      localStorage.setItem('userBookings', JSON.stringify(validBookings));
    }
    
    // If no bookings, set empty arrays and return
    if (!validBookings.length) {
      setBookings([]);
      setUpcomingBookings([]);
      setPastBookings([]);
      return;
    }
    
    // Remove duplicate bookings by ID
    const uniqueBookings = [];
    const bookingIds = new Set();
    
    validBookings.forEach(booking => {
      if (!bookingIds.has(booking.id)) {
        bookingIds.add(booking.id);
        uniqueBookings.push(booking);
      } else {
        console.warn(`Duplicate booking ID found: ${booking.id}, skipping`);
      }
    });
    
    setBookings(uniqueBookings);
    
    // Separate bookings into upcoming and past
    const now = new Date();
    const upcoming = [];
    const past = [];
    
    uniqueBookings.forEach(booking => {
      try {
        console.log('Processing booking:', booking);
        
        // Create a date object from the booking date
        const bookingDate = new Date(booking.date);
        console.log('Booking date parsed:', bookingDate);
        
        // Ensure we have a valid date before trying to parse time
        if (isNaN(bookingDate.getTime())) {
          console.error('Invalid date:', booking.date);
          // If date is invalid, default to upcoming
          upcoming.push(booking);
          return;
        }
        
        // Parse time (e.g., "10:00 AM")
        if (booking.time) {
          const timeParts = booking.time.match(/(\d+):(\d+)\s+([AP]M)/);
          if (timeParts) {
            let hours = parseInt(timeParts[1]);
            const minutes = parseInt(timeParts[2]);
            const ampm = timeParts[3];
            
            if (ampm === 'PM' && hours < 12) {
              hours += 12;
            } else if (ampm === 'AM' && hours === 12) {
              hours = 0;
            }
            
            bookingDate.setHours(hours, minutes, 0, 0);
          }
        }
        
        // Compare future/past by day to avoid time zone issues
        const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        console.log('Date comparison:', {
          bookingDateOnly: bookingDateOnly.toISOString(),
          nowDateOnly: nowDateOnly.toISOString(),
          isEqual: bookingDateOnly.getTime() === nowDateOnly.getTime(),
          isGreaterOrEqual: bookingDateOnly.getTime() >= nowDateOnly.getTime()
        });
        
        // If booking is today or in the future, it's upcoming
        if (bookingDateOnly.getTime() >= nowDateOnly.getTime()) {
          console.log('Adding to upcoming:', booking.id);
          upcoming.push(booking);
        } else {
          console.log('Adding to past:', booking.id);
          past.push(booking);
        }
      } catch (e) {
        console.error('Error processing booking:', e);
        // Default to upcoming on error
        upcoming.push(booking);
      }
    });
    
    console.log('Upcoming bookings:', upcoming.length);
    console.log('Past bookings:', past.length);
    
    // Sort by date (most recent first for past, soonest first for upcoming)
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    past.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setUpcomingBookings(upcoming);
    setPastBookings(past);
    
    // Set tab to Upcoming by default if there are upcoming bookings
    if (upcoming.length > 0 && tabValue !== 0) {
      setTabValue(0);
    }
  };

  const loadPayments = () => {
    // Load booking payments
    const userBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    
    // Create a Map to track unique booking IDs
    const uniqueBookingPayments = new Map();
    
    userBookings.forEach(booking => {
      const paymentId = `session_${booking.id}`;
      
      // Only add if we haven't seen this ID before
      if (!uniqueBookingPayments.has(paymentId)) {
        uniqueBookingPayments.set(paymentId, {
          id: paymentId, // Prefix with 'session_' to ensure uniqueness
          type: 'session',
          date: booking.bookingDate || new Date().toISOString(), // Use booking date if available
          amount: booking.amount,
          details: {
            coach: booking.coachName,
            sessionDate: booking.date,
            sessionTime: booking.time,
            duration: booking.duration
          }
        });
      } else {
        console.warn(`Duplicate booking payment ID found: ${paymentId}, skipping`);
      }
    });
    
    const bookingPayments = Array.from(uniqueBookingPayments.values());

    // Load package payments
    const userPackages = JSON.parse(localStorage.getItem('userPackages') || '[]');
    
    // Create a Map to track unique package IDs
    const uniquePackagePayments = new Map();
    
    userPackages.forEach(pkg => {
      const paymentId = `package_${pkg.id}`;
      
      // Only add if we haven't seen this ID before
      if (!uniquePackagePayments.has(paymentId)) {
        uniquePackagePayments.set(paymentId, {
          id: paymentId, // Prefix with 'package_' to ensure uniqueness
          type: 'package',
          date: pkg.purchaseDate || new Date().toISOString(),
          amount: pkg.price,
          details: {
            title: pkg.title,
            sessions: pkg.sessions,
            duration: pkg.duration
          }
        });
      } else {
        console.warn(`Duplicate package payment ID found: ${paymentId}, skipping`);
      }
    });
    
    const packagePayments = Array.from(uniquePackagePayments.values());

    // Combine and sort by date (most recent first)
    const allPayments = [...bookingPayments, ...packagePayments];
    allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setPayments(allPayments);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setOpenDialog(true);
  };

  const closeBookingDetails = () => {
    setOpenDialog(false);
  };

  const handleCancelBooking = (booking) => {
    if (window.confirm(`Are you sure you want to cancel your coaching session with ${booking.coachName}?`)) {
      // Remove booking from localStorage
      const updatedBookings = bookings.filter(b => b.id !== booking.id);
      localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
      
      // Update state
      setBookings(updatedBookings);
      setUpcomingBookings(upcomingBookings.filter(b => b.id !== booking.id));
      
      // Also remove any related notifications
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      const updatedNotifications = notifications.filter(n => n.bookingId !== booking.id);
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      
      // Show success message
      setSnackbarMessage('Booking cancelled successfully');
      setSnackbarOpen(true);
      
      // Close dialog if open
      if (openDialog) {
        setOpenDialog(false);
      }
    }
  };

  const handleRescheduleBooking = (booking) => {
    // Save booking to be rescheduled in localStorage
    localStorage.setItem('rescheduleBooking', JSON.stringify(booking));
    
    // Cancel the current booking
    const updatedBookings = bookings.filter(b => b.id !== booking.id);
    localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
    
    // Update state
    setBookings(updatedBookings);
    setUpcomingBookings(upcomingBookings.filter(b => b.id !== booking.id));
    
    // Close dialog
    setOpenDialog(false);
    
    // Show message
    setSnackbarMessage('Please select a new time slot for your session');
    setSnackbarOpen(true);
    
    // Navigate to coach profile to select a new time
    navigate(`/ai-coach/profile/${booking.coachId}`);
  };

  const addToCalendar = (booking) => {
    // Create calendar event data
    const eventTitle = `Interview Coaching with ${booking.coachName}`;
    const eventStart = new Date(booking.date);
    
    // Parse the time string to set hours and minutes
    const timeParts = booking.time.match(/(\d+):(\d+)\s+([AP]M)/);
    if (timeParts) {
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const ampm = timeParts[3];
      
      if (ampm === 'PM' && hours < 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }
      
      eventStart.setHours(hours, minutes, 0, 0);
    }
    
    const eventEnd = new Date(eventStart);
    eventEnd.setMinutes(eventStart.getMinutes() + booking.duration);
    
    // Format dates for Google Calendar
    const startTime = eventStart.toISOString().replace(/-|:|\.\d+/g, '');
    const endTime = eventEnd.toISOString().replace(/-|:|\.\d+/g, '');
    
    // Create Google Calendar URL
    const googleCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(`Interview coaching session with ${booking.coachName}. Booking reference: ${booking.id}`)}&location=Online Meeting`;
    
    // Open calendar in new tab
    window.open(googleCalUrl, '_blank');
  };

  const downloadReceipt = (booking) => {
    // Create receipt content
    const receiptContent = `
      RECEIPT
      ===============================
      Booking Number: ${booking.id}
      Date: ${new Date().toLocaleDateString()}
      
      Customer: User Name
      
      Service: Interview Coaching Session
      Coach: ${booking.coachName}
      Date: ${new Date(booking.date).toLocaleDateString()}
      Time: ${booking.time} (${booking.duration} minutes)
      
      Amount: AED ${booking.amount.toFixed(0)}
      Status: Paid
      
      Thank you for your business!
      TamkeenAI
      ===============================
    `;
    
    // Create a Blob from the text content
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${booking.id}.txt`;
    
    // Append link, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Booking detail dialog
  const renderBookingDetailDialog = () => {
    if (!selectedBooking) return null;
    
    // Create date objects for comparison
    const now = new Date();
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let bookingDate;
    try {
      bookingDate = new Date(selectedBooking.date);
      if (isNaN(bookingDate.getTime())) {
        console.error('Invalid booking date in dialog:', selectedBooking.date);
        bookingDate = new Date(); // Default to now to avoid crashes
      }
    } catch (e) {
      console.error('Error parsing booking date in dialog:', e);
      bookingDate = new Date(); // Default to now to avoid crashes
    }
    
    // Compare by date only to avoid time zone issues
    const bookingDateOnly = new Date(
      bookingDate.getFullYear(), 
      bookingDate.getMonth(), 
      bookingDate.getDate()
    );
    
    // A booking is upcoming if it's today or in the future
    const isUpcoming = bookingDateOnly.getTime() >= nowDateOnly.getTime();
    
    return (
      <Dialog 
        open={openDialog} 
        onClose={closeBookingDetails}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Booking Details
          <IconButton
            aria-label="close"
            onClick={closeBookingDetails}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Cancel />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="180"
                  image={selectedBooking.image}
                  alt={selectedBooking.coachName}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6">{selectedBooking.coachName}</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                <Chip 
                  color={isUpcoming ? "primary" : "default"}
                  label={isUpcoming ? "Upcoming" : "Past"} 
                  sx={{ mb: 2 }}
                />
                <Typography variant="h5" gutterBottom>
                  Interview Coaching Session
                </Typography>
                <Typography variant="body1" paragraph>
                  Booking Number: <strong>{selectedBooking.id}</strong>
                </Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CalendarMonth color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Date" 
                    secondary={formatDate(selectedBooking.date)} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AccessTime color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Time" 
                    secondary={`${selectedBooking.time} (${selectedBooking.duration} minutes)`} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <VideoCall color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Session Type" 
                    secondary={selectedBooking.type} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Event color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Amount Paid" 
                    secondary={`AED ${selectedBooking.amount.toFixed(0)}`} 
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Box>
            {isUpcoming && (
              <>
                <Button 
                  startIcon={<Cancel />} 
                  color="error" 
                  onClick={() => handleCancelBooking(selectedBooking)}
                  sx={{ mr: 1 }}
                >
                  Cancel Booking
                </Button>
                <Button 
                  startIcon={<Edit />} 
                  color="primary" 
                  onClick={() => handleRescheduleBooking(selectedBooking)}
                  variant="contained"
                >
                  Reschedule
                </Button>
              </>
            )}
          </Box>
          <Box>
            <Button 
              startIcon={<Add />} 
              onClick={() => addToCalendar(selectedBooking)}
              sx={{ mr: 1 }}
            >
              Add to Calendar
            </Button>
            <Button 
              startIcon={<Download />} 
              onClick={() => downloadReceipt(selectedBooking)}
            >
              Download Receipt
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    );
  };

  // Render booking card
  const renderBookingCard = (booking) => {
    // Create date objects for comparison
    const now = new Date();
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let bookingDate;
    try {
      bookingDate = new Date(booking.date);
      if (isNaN(bookingDate.getTime())) {
        console.error('Invalid booking date in renderBookingCard:', booking.date);
        bookingDate = new Date(); // Default to now to avoid crashes
      }
    } catch (e) {
      console.error('Error parsing booking date:', e);
      bookingDate = new Date(); // Default to now to avoid crashes
    }
    
    // Compare by date only to avoid time zone issues
    const bookingDateOnly = new Date(
      bookingDate.getFullYear(), 
      bookingDate.getMonth(), 
      bookingDate.getDate()
    );
    
    // A booking is upcoming if it's today or in the future
    const isUpcoming = bookingDateOnly.getTime() >= nowDateOnly.getTime();
    
    const isHighlighted = booking.id === highlightedBookingId;
    
    return (
      <Grid item xs={12} md={6} lg={4} key={booking.id}>
        <Card 
          id={`booking-${booking.id}`}
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            boxShadow: isHighlighted ? 6 : 1,
            border: isHighlighted ? '2px solid #1976d2' : 'none',
            transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.3s ease'
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="180"
              image={booking.image}
              alt={booking.coachName}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                padding: '10px'
              }}
            >
              <Typography variant="h6">{booking.coachName}</Typography>
              <Typography variant="body2">
                {formatDate(booking.date)} • {booking.time}
              </Typography>
            </Box>
            <Chip 
              label={isUpcoming ? "Upcoming" : "Past"} 
              color={isUpcoming ? "primary" : "default"}
              sx={{ 
                position: 'absolute', 
                top: 12, 
                right: 12, 
                fontWeight: 'bold' 
              }} 
            />
          </Box>
          
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Booking Number: {booking.id}
            </Typography>
            
            <Typography variant="body1" gutterBottom>
              Interview Coaching Session
            </Typography>
            
            <Typography variant="body2" paragraph>
              <strong>Duration:</strong> {booking.duration} minutes<br />
              <strong>Type:</strong> {booking.type}<br />
              <strong>Amount:</strong> AED {booking.amount.toFixed(0)}
            </Typography>
          </CardContent>
          
          <CardActions sx={{ justifyContent: 'space-between', padding: 2 }}>
            <Button 
              size="small" 
              onClick={() => openBookingDetails(booking)}
            >
              View Details
            </Button>
            
            {isUpcoming && (
              <Button 
                variant="outlined" 
                color="primary" 
                size="small"
                startIcon={<Add />}
                onClick={() => addToCalendar(booking)}
              >
                Add to Calendar
              </Button>
            )}
            
            {!isUpcoming && (
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<Download />}
                onClick={() => downloadReceipt(booking)}
              >
                Receipt
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  };

  // Render payment card
  const renderPaymentCard = (payment) => {
    const isPackage = payment.type === 'package';
    const formattedDate = formatDate(payment.date);
    
    return (
      <Grid item xs={12} key={payment.id}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Typography variant="overline" color="text.secondary">
                    Payment ID
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {payment.id.replace('session_', '').replace('package_', '')}
                  </Typography>
                  
                  <Typography variant="overline" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {formattedDate}
                  </Typography>
                  
                  <Typography variant="overline" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                    AED {payment.amount.toFixed(0)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={9}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6">
                    {isPackage ? 'Package Purchase' : 'Coaching Session'}
                  </Typography>
                  <Chip 
                    label={isPackage ? 'Package' : 'Session'} 
                    color={isPackage ? 'secondary' : 'primary'} 
                    size="small" 
                  />
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                {isPackage ? (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>{payment.details.title}</strong>
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Sessions
                        </Typography>
                        <Typography variant="body1">
                          {payment.details.sessions}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body1">
                          {payment.details.duration}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Coach:</strong> {payment.details.coach}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Session Date
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(payment.details.sessionDate)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Time
                        </Typography>
                        <Typography variant="body1">
                          {payment.details.sessionTime}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Typography variant="body2" color="text.secondary">
                          Duration
                        </Typography>
                        <Typography variant="body1">
                          {payment.details.duration} minutes
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            <Button 
              startIcon={<Download />}
              onClick={() => downloadPaymentReceipt(payment)}
            >
              Download Receipt
            </Button>
            <Button 
              startIcon={<Print />}
              onClick={() => printPaymentReceipt(payment)}
            >
              Print Receipt
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };
  
  const downloadPaymentReceipt = (payment) => {
    const isPackage = payment.type === 'package';
    const receiptContent = isPackage ? 
      `
TAMKEEN AI - PACKAGE PURCHASE RECEIPT
====================================
Order ID: ${payment.id}
Date: ${formatDate(payment.date)}

Package: ${payment.details.title}
Sessions: ${payment.details.sessions}
Duration: ${payment.details.duration}

Total Amount: AED ${payment.amount.toFixed(0)}

Thank you for using Tamkeen AI Career Services.
For any questions, please contact support@tamkeen-ai.com
      ` :
      `
TAMKEEN AI - COACHING SESSION RECEIPT
====================================
Booking Number: ${payment.id}
Date: ${formatDate(payment.date)}

Coach: ${payment.details.coach}
Service: Interview Coaching Session
Date: ${formatDate(payment.details.sessionDate)}
Time: ${payment.details.sessionTime}
Duration: ${payment.details.duration} minutes

Total Amount: AED ${payment.amount.toFixed(0)}

Thank you for using Tamkeen AI Career Services.
For any questions, please contact support@tamkeen-ai.com
      `;
    
    // Create a Blob from the text content
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${payment.id}.txt`;
    
    // Append link, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    setSnackbarMessage('Receipt downloaded successfully');
    setSnackbarOpen(true);
  };
  
  const printPaymentReceipt = (payment) => {
    const isPackage = payment.type === 'package';
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .title { font-size: 20px; margin-bottom: 20px; }
            .details { margin-bottom: 30px; }
            .detail-row { display: flex; margin-bottom: 10px; }
            .label { font-weight: bold; width: 150px; }
            .value { flex: 1; }
            .total { font-size: 18px; margin-top: 20px; font-weight: bold; }
            .footer { margin-top: 50px; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Tamkeen AI</div>
            <div class="title">${isPackage ? 'Package Purchase Receipt' : 'Coaching Session Receipt'}</div>
          </div>
          
          <div class="details">
            <div class="detail-row">
              <div class="label">${isPackage ? 'Order ID' : 'Booking Number'}:</div>
              <div class="value">${payment.id}</div>
            </div>
            <div class="detail-row">
              <div class="label">Date:</div>
              <div class="value">${formatDate(payment.date)}</div>
            </div>
            
            ${isPackage ? `
              <div class="detail-row">
                <div class="label">Package:</div>
                <div class="value">${payment.details.title}</div>
              </div>
              <div class="detail-row">
                <div class="label">Sessions:</div>
                <div class="value">${payment.details.sessions}</div>
              </div>
              <div class="detail-row">
                <div class="label">Duration:</div>
                <div class="value">${payment.details.duration}</div>
              </div>
            ` : `
              <div class="detail-row">
                <div class="label">Coach:</div>
                <div class="value">${payment.details.coach}</div>
              </div>
              <div class="detail-row">
                <div class="label">Service:</div>
                <div class="value">Interview Coaching Session</div>
              </div>
              <div class="detail-row">
                <div class="label">Session Date:</div>
                <div class="value">${formatDate(payment.details.sessionDate)}</div>
              </div>
              <div class="detail-row">
                <div class="label">Time:</div>
                <div class="value">${payment.details.sessionTime}</div>
              </div>
              <div class="detail-row">
                <div class="label">Duration:</div>
                <div class="value">${payment.details.duration} minutes</div>
              </div>
            `}
            
            <div class="total">
              Total Amount: AED ${payment.amount.toFixed(0)}
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for using Tamkeen AI Career Services.</p>
            <p>For any questions, please contact support@tamkeen-ai.com</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    
    // Show success message
    setSnackbarMessage('Receipt printed successfully');
    setSnackbarOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 4 }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Bookings
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate('/ai-coach')}
            size="large"
            sx={{ fontWeight: 'bold', px: 3, py: 1 }}
          >
            Book a Session
          </Button>
          
          <Button 
            variant="outlined" 
            startIcon={<ArrowBack />}
            onClick={() => navigate('/ai-coach')}
          >
            Find More Coaches
          </Button>
        </Box>
      </Box>
      
      {bookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            You don't have any bookings yet
          </Typography>
          <Typography variant="body1" paragraph>
            Browse our interview coaches and book your first session!
          </Typography>
        </Paper>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Paper sx={{ width: '100%' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                centered
              >
                <Tab 
                  label={`Upcoming (${upcomingBookings.length})`} 
                  icon={<EventAvailable />} 
                  iconPosition="start" 
                />
                <Tab 
                  label={`Past (${pastBookings.length})`} 
                  icon={<Event />} 
                  iconPosition="start" 
                />
                <Tab 
                  label={`Payment History (${payments.length})`} 
                  icon={<Payment />} 
                  iconPosition="start" 
                />
              </Tabs>
            </Paper>
            <IconButton 
              color="primary" 
              onClick={() => {
                loadBookings();
                loadPayments();
                setSnackbarMessage('Bookings refreshed');
                setSnackbarOpen(true);
              }}
              sx={{ ml: 2 }}
              aria-label="Refresh bookings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
                <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z"/>
              </svg>
            </IconButton>
          </Box>
          
          <Grid container spacing={3}>
            {tabValue === 0 ? (
              upcomingBookings.length > 0 ? (
                upcomingBookings.map(booking => renderBookingCard(booking))
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1">
                      You don't have any upcoming bookings.
                    </Typography>
                  </Paper>
                </Grid>
              )
            ) : tabValue === 1 ? (
              pastBookings.length > 0 ? (
                pastBookings.map(booking => renderBookingCard(booking))
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1">
                      You don't have any past bookings.
                    </Typography>
                  </Paper>
                </Grid>
              )
            ) : (
              payments.length > 0 ? (
                <>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h5" gutterBottom>
                        Payment History
                      </Typography>
                      <Typography variant="body1">
                        View all your payments for coaching sessions and packages
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                    </Box>
                  </Grid>
                  {payments.map(payment => renderPaymentCard(payment))}
                </>
              ) : (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1">
                      You don't have any payment history.
                    </Typography>
                  </Paper>
                </Grid>
              )
            )}
          </Grid>
        </>
      )}
      
      {/* Booking detail dialog */}
      {renderBookingDetailDialog()}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <IconButton 
            size="small" 
            color="inherit" 
            onClick={() => setSnackbarOpen(false)}
          >
            <Check />
          </IconButton>
        }
      />
    </Container>
  );
};

export default MyBookings;
