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
  TextField,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Snackbar
} from '@mui/material';
import { 
  Payment, 
  CreditCard, 
  AccountBalance, 
  Security,
  Check,
  ArrowBack,
  ArrowForward,
  Print,
  Download,
  CalendarMonth
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Checkout = () => {
  const { coachId, type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [packageDetails, setPackageDetails] = useState(null);
  const [isPackagePurchase, setIsPackagePurchase] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    if (location.state?.bookingDetails) {
      setBookingDetails(location.state.bookingDetails);
      setIsPackagePurchase(false);
    } else if (location.state?.packageDetails) {
      setPackageDetails(location.state.packageDetails);
      setIsPackagePurchase(true);
    } else {
      // No details provided, redirect to coaches page
      navigate('/ai-coach');
    }
    
    // Generate a unique order ID
    setOrderId(uuidv4().substring(0, 8).toUpperCase());
  }, [location, navigate]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleCardInfoChange = (e) => {
    setCardInfo({
      ...cardInfo,
      [e.target.name]: e.target.value
    });
  };

  const addNotification = (details) => {
    // Get existing notifications
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    // Create notification
    const notificationObj = {
      id: uuidv4(),
      type: isPackagePurchase ? 'package_purchase' : 'booking_payment',
      title: isPackagePurchase ? 'Package Purchased' : 'Payment Confirmed',
      message: isPackagePurchase 
        ? `You have purchased the ${packageDetails.title} package for AED ${packageDetails.price.toFixed(0)}.`
        : `You have paid AED ${bookingDetails.price.toFixed(0)} for your session with ${bookingDetails.coachData.name}.`,
      messageKey: isPackagePurchase ? 'notifications.packagePurchase' : 'notifications.paymentConfirmation',
      date: new Date().toISOString(),
      read: false,
      orderId: orderId,
      amount: isPackagePurchase ? packageDetails.price : bookingDetails.price
    };
    
    // Add to notifications (at the beginning to be the newest)
    notifications.unshift(notificationObj);
    localStorage.setItem('notifications', JSON.stringify(notifications));
  };

  const printReceipt = () => {
    // Create a receipt content
    const content = document.getElementById('receipt-content');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
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
            <div class="title">Payment Receipt</div>
          </div>
          
          <div class="details">
            <div class="detail-row">
              <div class="label">Order ID:</div>
              <div class="value">${orderId}</div>
            </div>
            <div class="detail-row">
              <div class="label">Date:</div>
              <div class="value">${new Date().toLocaleDateString()}</div>
            </div>
            <div class="detail-row">
              <div class="label">Payment Method:</div>
              <div class="value">${paymentMethod === 'credit_card' ? 'Credit Card' : 'Bank Transfer'}</div>
            </div>
            ${isPackagePurchase ? `
              <div class="detail-row">
                <div class="label">Package:</div>
                <div class="value">${packageDetails.title}</div>
              </div>
              <div class="detail-row">
                <div class="label">Description:</div>
                <div class="value">${packageDetails.description}</div>
              </div>
              <div class="detail-row">
                <div class="label">Sessions:</div>
                <div class="value">${packageDetails.sessions}</div>
              </div>
              <div class="detail-row">
                <div class="label">Duration:</div>
                <div class="value">${packageDetails.duration}</div>
              </div>
            ` : `
              <div class="detail-row">
                <div class="label">Coach:</div>
                <div class="value">${bookingDetails.coachData.name}</div>
              </div>
              <div class="detail-row">
                <div class="label">Service:</div>
                <div class="value">Interview Coaching Session (60 minutes)</div>
              </div>
              <div class="detail-row">
                <div class="label">Date:</div>
                <div class="value">${formatDate(bookingDetails.selectedDate)}</div>
              </div>
              <div class="detail-row">
                <div class="label">Time:</div>
                <div class="value">${bookingDetails.selectedTime}</div>
              </div>
            `}
            
            <div class="total">
              Total Amount: AED ${(isPackagePurchase ? packageDetails.price : bookingDetails.price).toFixed(0)}
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
  };

  const downloadReceipt = () => {
    // Create receipt content
    const title = isPackagePurchase ? `Package_${packageDetails.title.replace(/\s+/g, '_')}` : `Session_with_${bookingDetails.coachData.name.replace(/\s+/g, '_')}`;
    const content = `
TAMKEEN AI - PAYMENT RECEIPT
===========================
Order ID: ${orderId}
Date: ${new Date().toLocaleDateString()}
Payment Method: ${paymentMethod === 'credit_card' ? 'Credit Card' : 'Bank Transfer'}

${isPackagePurchase ? `
Package: ${packageDetails.title}
Description: ${packageDetails.description}
Sessions: ${packageDetails.sessions}
Duration: ${packageDetails.duration}
` : `
Coach: ${bookingDetails.coachData.name}
Service: Interview Coaching Session (60 minutes)
Date: ${formatDate(bookingDetails.selectedDate)}
Time: ${bookingDetails.selectedTime}
`}

Total Amount: AED ${(isPackagePurchase ? packageDetails.price : bookingDetails.price).toFixed(0)}

Thank you for using Tamkeen AI Career Services.
For any questions, please contact support@tamkeen-ai.com
    `;
    
    // Create and download file
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Receipt_${title}_${orderId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    // Show success message
    setSnackbarMessage('Receipt downloaded successfully');
    setSnackbarOpen(true);
  };

  const handleCheckout = () => {
    setLoading(true);
    setError('');
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      
      // Add payment notification
      addNotification();
      
      if (isPackagePurchase) {
        // For package purchases, navigate to a confirmation page or My Packages
        navigate('/ai-coach/package-confirmation', {
          state: {
            packageDetails: packageDetails,
            orderId: orderId
          }
        });
      } else {
        // For session bookings, navigate to booking confirmation
        navigate(`/ai-coach/booking/${coachId}`, {
          state: {
            bookingDetails: bookingDetails,
            orderId: orderId,
            source: 'checkout' // Indicate this is coming from checkout
          }
        });
      }
    }, 2000);
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

  const steps = ['Review Order', 'Payment Method', 'Confirm Payment'];

  // If no details, show loading
  if (!bookingDetails && !packageDetails) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Checkout
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        {activeStep === 0 && (
          <Grid container spacing={3}>
            {isPackagePurchase ? (
              // Package checkout
              <>
                <Grid item xs={12}>
                  <Typography variant="h5" component="div" gutterBottom>
                    {packageDetails.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                    <Typography variant="h4" component="span" color="primary">
                      AED {packageDetails.price.toFixed(0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      for {packageDetails.sessions} sessions
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" paragraph>
                    {packageDetails.description}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Duration:</strong> {packageDetails.duration}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom>
                    What's included:
                  </Typography>
                  
                  <List>
                    {packageDetails.features.map((feature, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </>
            ) : (
              // Session booking checkout
              <>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="180"
                      image={bookingDetails.coachData.image}
                      alt={bookingDetails.coachData.name}
                    />
                    <CardContent>
                      <Typography variant="h6">{bookingDetails.coachData.name}</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {bookingDetails.coachData.title} at {bookingDetails.coachData.company}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    Order Summary
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="Service" 
                        secondary="Interview Coaching Session (60 minutes)" 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText 
                        primary="Date" 
                        secondary={formatDate(bookingDetails.selectedDate)} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText 
                        primary="Time" 
                        secondary={bookingDetails.selectedTime} 
                      />
                    </ListItem>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <ListItem>
                      <ListItemText 
                        primary={<Typography variant="subtitle1">Total Amount</Typography>} 
                        secondary={<Typography variant="h6" color="primary">AED {bookingDetails.price.toFixed(0)}</Typography>} 
                      />
                    </ListItem>
                  </List>
                </Grid>
              </>
            )}
          </Grid>
        )}
        
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            
            <FormControl component="fieldset">
              <RadioGroup
                name="payment-method"
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
              >
                <Paper sx={{ p: 2, mb: 2, border: paymentMethod === 'credit_card' ? '2px solid #1976d2' : 'none' }}>
                  <FormControlLabel 
                    value="credit_card" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCard sx={{ mr: 1 }} />
                        <Typography>Credit / Debit Card</Typography>
                      </Box>
                    } 
                  />
                </Paper>
                
                <Paper sx={{ p: 2, mb: 2, border: paymentMethod === 'bank_transfer' ? '2px solid #1976d2' : 'none' }}>
                  <FormControlLabel 
                    value="bank_transfer" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalance sx={{ mr: 1 }} />
                        <Typography>Bank Transfer</Typography>
                      </Box>
                    } 
                  />
                </Paper>
              </RadioGroup>
            </FormControl>
            
            {paymentMethod === 'credit_card' && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Card Number"
                      name="cardNumber"
                      value={cardInfo.cardNumber}
                      onChange={handleCardInfoChange}
                      placeholder="1234 5678 9012 3456"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cardholder Name"
                      name="cardName"
                      value={cardInfo.cardName}
                      onChange={handleCardInfoChange}
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Expiry Date"
                      name="expiry"
                      value={cardInfo.expiry}
                      onChange={handleCardInfoChange}
                      placeholder="MM/YY"
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      name="cvv"
                      value={cardInfo.cvv}
                      onChange={handleCardInfoChange}
                      type="password"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {paymentMethod === 'bank_transfer' && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please use the following bank details to complete your payment. Include your Order ID as reference.
                </Alert>
                
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2"><strong>Bank:</strong> Emirates NBD</Typography>
                  <Typography variant="body2"><strong>Account Name:</strong> Tamkeen AI Career Services</Typography>
                  <Typography variant="body2"><strong>Account Number:</strong> 1234567890</Typography>
                  <Typography variant="body2"><strong>IBAN:</strong> AE123456789012345678</Typography>
                  <Typography variant="body2"><strong>Order ID (Reference):</strong> {orderId}</Typography>
                </Paper>
              </Box>
            )}
          </Box>
        )}
        
        {activeStep === 2 && (
          <Box id="receipt-content">
            <Alert severity="success" sx={{ mb: 3 }}>
              Your payment has been processed successfully!
            </Alert>
            
            <Typography variant="h6" gutterBottom>
              Payment Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1"><strong>Order ID:</strong> {orderId}</Typography>
                <Typography variant="body1"><strong>Date:</strong> {new Date().toLocaleDateString()}</Typography>
                <Typography variant="body1"><strong>Payment Method:</strong> {paymentMethod === 'credit_card' ? 'Credit Card' : 'Bank Transfer'}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body1"><strong>Amount Paid:</strong> AED {(isPackagePurchase ? packageDetails.price : bookingDetails.price).toFixed(0)}</Typography>
                <Typography variant="body1"><strong>Status:</strong></Typography>
                <Chip label="Paid" color="success" size="small" sx={{ ml: 1 }} />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              {isPackagePurchase ? 'Package Details' : 'Booking Details'}
            </Typography>
            
            {isPackagePurchase ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1"><strong>Package:</strong> {packageDetails.title}</Typography>
                  <Typography variant="body1"><strong>Sessions:</strong> {packageDetails.sessions}</Typography>
                  <Typography variant="body1"><strong>Duration:</strong> {packageDetails.duration}</Typography>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1"><strong>Coach:</strong> {bookingDetails.coachData.name}</Typography>
                  <Typography variant="body1"><strong>Service:</strong> Interview Coaching Session (60 minutes)</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body1"><strong>Date:</strong> {formatDate(bookingDetails.selectedDate)}</Typography>
                  <Typography variant="body1"><strong>Time:</strong> {bookingDetails.selectedTime}</Typography>
                </Grid>
              </Grid>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<Print />}
                onClick={printReceipt}
              >
                Print Receipt
              </Button>
              
              <Button 
                variant="outlined" 
                startIcon={<Download />}
                onClick={downloadReceipt}
              >
                Download Receipt
              </Button>
              
              {!isPackagePurchase && (
                <Button 
                  variant="outlined" 
                  startIcon={<CalendarMonth />}
                  onClick={() => {
                    // Create calendar event
                    const eventTitle = `Interview Coaching with ${bookingDetails.coachData.name}`;
                    const eventStart = new Date(bookingDetails.selectedDate);
                    
                    // Parse the time string to set hours and minutes
                    const timeParts = bookingDetails.selectedTime.match(/(\d+):(\d+)\s+([AP]M)/);
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
                    eventEnd.setMinutes(eventStart.getMinutes() + 60);
                    
                    // Format dates for Google Calendar
                    const startTime = eventStart.toISOString().replace(/-|:|\.\d+/g, '');
                    const endTime = eventEnd.toISOString().replace(/-|:|\.\d+/g, '');
                    
                    // Create Google Calendar URL
                    const googleCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(`Interview coaching session with ${bookingDetails.coachData.name}. Booking reference: ${orderId}`)}&location=Online Meeting`;
                    
                    // Open calendar in new tab
                    window.open(googleCalUrl, '_blank');
                    
                    // Show success message
                    setSnackbarMessage('Added to calendar successfully');
                    setSnackbarOpen(true);
                  }}
                >
                  Add to Calendar
                </Button>
              )}
            </Box>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={activeStep === steps.length - 1 ? 
              (isPackagePurchase ? 
                () => navigate('/ai-coach') : 
                () => navigate('/my-bookings')
              ) : 
              (activeStep === steps.length - 2 ? handleCheckout : handleNext)
            }
            endIcon={activeStep === steps.length - 1 ? null : <ArrowForward />}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : activeStep === steps.length - 1 ? (
              isPackagePurchase ? 'Return to Coaches' : 'View My Bookings'
            ) : activeStep === steps.length - 2 ? (
              'Confirm Payment'
            ) : (
              'Next'
            )}
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

export default Checkout; 