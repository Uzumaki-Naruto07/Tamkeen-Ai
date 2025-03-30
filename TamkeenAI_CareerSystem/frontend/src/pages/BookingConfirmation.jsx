import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Divider, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  TextField,
  Snackbar
} from '@mui/material';
import { 
  CheckCircle, 
  EventAvailable, 
  AccessTime, 
  Person, 
  LocationOn, 
  Receipt, 
  CalendarToday,
  VideoCall,
  ArrowBack,
  Download,
  Share,
  Add,
  Check,
  CalendarMonth
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

// Import mock coaches data from CoachProfile
const mockCoaches = [
  {
    id: 1,
    name: "Sarah Johnson",
    title: "Senior Tech Recruiter",
    company: "Google",
    specialties: ["Software Engineering", "Technical Interviews", "Behavioral Questions"],
    experience: 8,
    rating: 4.9,
    reviews: 124,
    hourlyRate: 85,
    availability: "Next available: Tomorrow",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    description: "Former Google recruiter with 8+ years of experience hiring software engineers. I can help you prepare for technical and behavioral interviews at top tech companies."
  },
  {
    id: 2,
    name: "Michael Chen",
    title: "Career Coach & Former HR Director",
    company: "Microsoft",
    specialties: ["Leadership Roles", "Executive Interviews", "Salary Negotiation"],
    experience: 12,
    rating: 4.8,
    reviews: 98,
    hourlyRate: 95,
    availability: "Next available: Today",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    description: "HR Director with experience at Microsoft and Amazon. I specialize in helping mid to senior-level professionals prepare for leadership interviews and negotiate offers."
  },
  {
    id: 3,
    name: "Priya Patel",
    title: "Data Science Interview Specialist",
    company: "Netflix",
    specialties: ["Data Science", "Machine Learning", "Technical Assessments"],
    experience: 6,
    rating: 4.7,
    reviews: 76,
    hourlyRate: 75,
    availability: "Next available: In 2 days",
    image: "https://randomuser.me/api/portraits/women/66.jpg",
    description: "Data Scientist at Netflix who has interviewed 100+ candidates. I can help you prepare for data science interviews, including technical questions and case studies."
  },
  {
    id: 4,
    name: "James Wilson",
    title: "Product Management Coach",
    company: "Facebook",
    specialties: ["Product Management", "Case Interviews", "Product Design"],
    experience: 9,
    rating: 4.9,
    reviews: 112,
    hourlyRate: 90,
    availability: "Next available: Tomorrow",
    image: "https://randomuser.me/api/portraits/men/67.jpg",
    description: "Product Manager at Facebook with experience interviewing PM candidates. I can help you prepare for product sense, analytical, and execution interviews."
  },
  {
    id: 5,
    name: "Elena Rodriguez",
    title: "UX/UI Interview Specialist",
    company: "Airbnb",
    specialties: ["UX Design", "Portfolio Reviews", "Design Challenges"],
    experience: 7,
    rating: 4.8,
    reviews: 89,
    hourlyRate: 80,
    availability: "Next available: Today",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
    description: "UX Designer at Airbnb who has interviewed 50+ designers. I can help you prepare your portfolio, practice design challenges, and ace your UX/UI interviews."
  },
  {
    id: 6,
    name: "David Kim",
    title: "Marketing Interview Coach",
    company: "Spotify",
    specialties: ["Marketing Strategy", "Brand Management", "Growth Marketing"],
    experience: 10,
    rating: 4.7,
    reviews: 67,
    hourlyRate: 75,
    availability: "Next available: In 3 days",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    description: "Marketing Director at Spotify with experience hiring marketing professionals. I can help you prepare for marketing interviews, case studies, and presentations."
  }
];

const BookingConfirmation = () => {
  const { coachId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [bookingId, setBookingId] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (location.state?.bookingDetails) {
      const details = location.state.bookingDetails;
      // Generate a unique booking ID
      const newBookingId = location.state.orderId || uuidv4().substring(0, 8).toUpperCase();
      setBookingId(newBookingId);
      setBookingDetails({
        ...details,
        id: newBookingId,
        date: details.selectedDate,
        time: details.selectedTime,
        duration: 60, // Default duration in minutes
        amount: details.price || 200, // Default price
        type: 'Video Call',
        image: details.coachData.image || 'https://via.placeholder.com/150'
      });
      setBookingTime(details.selectedTime);
      // Set coach from the booking details
      setCoach(details.coachData);
      // Mark loading as complete
      setLoading(false);
      
      // Save booking to localStorage
      saveBookingToLocalStorage({
        ...details,
        id: newBookingId,
        date: details.selectedDate,
        time: details.selectedTime,
        duration: 60,
        amount: details.price || 200,
        type: 'Video Call',
        image: details.coachData.image || 'https://via.placeholder.com/150',
        coachId: details.coachData.id,
        coachName: details.coachData.name,
        bookingDate: new Date().toISOString() // Add booking creation date
      });
      
      // Show success message
      setShowSuccessMessage(true);
    } else {
      // No booking details provided, redirect to coaches page
      navigate('/ai-coach');
    }
  }, [location, navigate]);

  const addNotification = (booking) => {
    // Get existing notifications
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    // Format date for the message
    const formattedDate = new Date(booking.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long', 
      day: 'numeric'
    });
    
    // Create session reminder notification
    const notificationObj = {
      id: uuidv4(),
      type: 'booking_reminder',
      title: 'Coaching Session Booked',
      message: `You have a session with ${booking.coachName} on ${formattedDate} at ${booking.time}.`,
      messageKey: 'notifications.bookingConfirmation',
      date: new Date().toISOString(),
      read: false,
      bookingId: booking.id,
      sessionDate: booking.date,
      sessionTime: booking.time
    };
    
    // Check for duplicates before adding
    const isDuplicate = notifications.some(n => 
      n.type === 'booking_reminder' && 
      n.bookingId === booking.id
    );
    
    if (!isDuplicate) {
      // Add to notifications (at the beginning to be the newest)
      notifications.unshift(notificationObj);
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  };

  const saveBookingToLocalStorage = (booking) => {
    // Check if there's already a booking for this time
    const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    
    // Check if booking with this ID already exists
    const idExists = existingBookings.some(b => b.id === booking.id);
    if (idExists) {
      console.log(`Booking with ID ${booking.id} already exists, generating a new ID`);
      // Generate a new ID to avoid duplicates
      booking.id = uuidv4().substring(0, 8).toUpperCase();
      setBookingId(booking.id);
    }
    
    // Check for conflict - same date and time
    const timeConflict = existingBookings.some(b => 
      b.date === booking.date && 
      b.time === booking.time
    );
    
    // Check if already booked the same coach
    const coachConflict = existingBookings.some(b => 
      b.coachId === booking.coachId
    );
    
    if (timeConflict) {
      setSnackbarMessage('You already have a booking at this time. The booking has been saved but you may need to reschedule.');
      setSnackbarOpen(true);
    }
    
    if (coachConflict) {
      setSnackbarMessage('You have already booked this coach. Multiple sessions with the same coach have been added to your bookings.');
      setSnackbarOpen(true);
    }
    
    // Ensure the date is properly formatted to maintain consistency
    let formattedDate;
    try {
      // Make sure we have a valid date object first
      const dateObj = new Date(booking.date);
      if (isNaN(dateObj.getTime())) {
        console.error('Invalid date format:', booking.date);
        // Use tomorrow's date as fallback to ensure it shows as upcoming
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        formattedDate = tomorrow.toISOString();
      } else {
        // If the date is in the past, set it to tomorrow to ensure it shows as upcoming
        const now = new Date();
        const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const bookingDateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        
        if (bookingDateOnly < nowDateOnly) {
          console.log('Booking date is in the past, setting to tomorrow');
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          formattedDate = tomorrow.toISOString();
        } else {
          formattedDate = dateObj.toISOString();
        }
      }
    } catch (e) {
      console.error('Error formatting date:', e);
      // Use tomorrow's date as fallback to ensure it shows as upcoming
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      formattedDate = tomorrow.toISOString();
    }
    
    const formattedBooking = {
      ...booking,
      // Ensure proper date format to avoid comparison issues
      date: formattedDate
    };
    
    console.log('Saving formatted booking:', formattedBooking);
    
    // Add the new booking
    const updatedBookings = [...existingBookings, formattedBooking];
    localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
    
    // Add booking notification
    addNotification(formattedBooking);
  };

  const handleAddToCalendar = () => {
    if (!bookingDetails) return;
    
    // Create calendar event data
    const eventTitle = `Interview Coaching with ${bookingDetails.coachData.name}`;
    const eventStart = new Date(bookingDetails.date);
    
    // Parse the time string to set hours and minutes
    const timeParts = bookingDetails.time.match(/(\d+):(\d+)\s+([AP]M)/);
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
    eventEnd.setMinutes(eventStart.getMinutes() + bookingDetails.duration);
    
    // Format dates for Google Calendar
    const startTime = eventStart.toISOString().replace(/-|:|\.\d+/g, '');
    const endTime = eventEnd.toISOString().replace(/-|:|\.\d+/g, '');
    
    // Create Google Calendar URL
    const googleCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(`Interview coaching session with ${bookingDetails.coachData.name}. Booking reference: ${bookingId}`)}&location=Online Meeting`;
    
    // Open calendar in new tab
    window.open(googleCalUrl, '_blank');
    
    // Show success message
    setSnackbarMessage('Event added to your calendar');
    setSnackbarOpen(true);
  };

  const handleDownloadReceipt = () => {
    if (!bookingDetails) return;
    
    // Create receipt content
    const receiptContent = `
      RECEIPT
      ===============================
      Booking Number: ${bookingId}
      Date: ${new Date().toLocaleDateString()}
      
      Customer: User Name
      
      Service: Interview Coaching Session
      Coach: ${bookingDetails.coachData.name}
      Date: ${new Date(bookingDetails.date).toLocaleDateString()}
      Time: ${bookingDetails.time} (${bookingDetails.duration} minutes)
      
      Amount: AED ${bookingDetails.amount.toFixed(0)}
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
    link.download = `Receipt-${bookingId}.txt`;
    
    // Append link, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    setSnackbarMessage('Receipt downloaded successfully');
    setSnackbarOpen(true);
  };

  const viewAllBookings = () => {
    // Force reload of the page to ensure fresh data
    const bookingToHighlight = bookingId;
    
    // Navigate to my bookings with state
    navigate('/my-bookings', {
      state: { 
        highlightBookingId: bookingToHighlight,
        message: 'Your booking has been successfully confirmed!',
        activeTab: 0, // Explicitly set to Upcoming tab
        forceRefresh: Date.now() // Add a timestamp to force state change
      }
    });
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5, 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }} 
          onClick={() => navigate('/ai-coach')}
        >
          Back to Coaches
        </Button>
      </Container>
    );
  }

  // Render booking confirmation
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {showSuccessMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 4 }}
          onClose={() => setShowSuccessMessage(false)}
        >
          Booking confirmed successfully! Your booking reference is {bookingId}.
        </Alert>
      )}
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <CheckCircle sx={{ color: 'success.main', fontSize: 64 }} />
          </Box>
          
          <Typography variant="h4" align="center" gutterBottom>
            Booking Confirmed!
          </Typography>
          
          <Typography variant="body1" align="center" sx={{ mb: 4 }}>
            Your session with {coach.name} has been successfully booked. You'll receive a confirmation email shortly.
          </Typography>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Paper sx={{ p: 3, mb: 4 }} elevation={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardMedia
                    component="img"
                    height="180"
                    image={coach.image}
                    alt={coach.name}
                  />
                  <CardContent>
                    <Typography variant="h6">{coach.name}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {coach.title} at {coach.company}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Booking Details
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Date" 
                      secondary={formatDate(bookingDetails.date)} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <AccessTime color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Time" 
                      secondary={`${bookingDetails.time} (${bookingDetails.duration} minutes)`} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <VideoCall color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Session Type" 
                      secondary={bookingDetails.type} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <Receipt color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Amount Paid" 
                      secondary={`AED ${bookingDetails.amount.toFixed(0)}`} 
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <EventAvailable color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Booking Number" 
                      secondary={bookingId} 
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleAddToCalendar}
            >
              Add to Calendar
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadReceipt}
            >
              Download Receipt
            </Button>
          </Box>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="text"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/ai-coach')}
            >
              Back to Coaches
            </Button>
          </Box>
        </motion.div>
      </motion.div>
      
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          What's Next?
        </Typography>
        
        <Typography variant="body1" paragraph>
          You will receive a confirmation email with all the details of your booking.
          Your coach will connect with you via video call at the scheduled time.
        </Typography>
        
        <Typography variant="body1" paragraph>
          Please prepare any specific questions or topics you'd like to discuss during your session.
          You can view all your bookings and manage them from your dashboard.
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained"
            color="primary" 
            onClick={viewAllBookings}
            size="large"
            sx={{ fontWeight: 'bold', px: 4, py: 1.5, fontSize: '1.1rem' }}
            startIcon={<CalendarMonth />}
          >
            View Your Upcoming Bookings
          </Button>
        </Box>
      </Paper>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default BookingConfirmation;
