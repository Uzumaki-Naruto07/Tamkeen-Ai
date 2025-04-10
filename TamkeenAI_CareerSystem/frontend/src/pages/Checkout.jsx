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
import { useTranslation } from 'react-i18next';

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
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
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
          <title>${isArabic ? 'إيصال' : 'Receipt'}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; ${isArabic ? 'direction: rtl; text-align: right;' : ''} }
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
            <div class="title">${isArabic ? 'إيصال الدفع' : 'Payment Receipt'}</div>
          </div>
          
          <div class="details">
            <div class="detail-row">
              <div class="label">${isArabic ? 'رقم الطلب:' : 'Order ID:'}</div>
              <div class="value">${orderId}</div>
            </div>
            <div class="detail-row">
              <div class="label">${isArabic ? 'التاريخ:' : 'Date:'}</div>
              <div class="value">${new Date().toLocaleDateString(isArabic ? 'ar-AE' : 'en-US')}</div>
            </div>
            <div class="detail-row">
              <div class="label">${isArabic ? 'طريقة الدفع:' : 'Payment Method:'}</div>
              <div class="value">${paymentMethod === 'credit_card' ? (isArabic ? 'بطاقة ائتمان' : 'Credit Card') : (isArabic ? 'تحويل بنكي' : 'Bank Transfer')}</div>
            </div>
            ${isPackagePurchase ? `
              <div class="detail-row">
                <div class="label">${isArabic ? 'الباقة:' : 'Package:'}</div>
                <div class="value">${isArabic && packageDetails.titleAr ? packageDetails.titleAr : packageDetails.title}</div>
              </div>
              <div class="detail-row">
                <div class="label">${isArabic ? 'الوصف:' : 'Description:'}</div>
                <div class="value">${isArabic && packageDetails.descriptionAr ? packageDetails.descriptionAr : packageDetails.description}</div>
              </div>
              <div class="detail-row">
                <div class="label">${isArabic ? 'الجلسات:' : 'Sessions:'}</div>
                <div class="value">${packageDetails.sessions}</div>
              </div>
              <div class="detail-row">
                <div class="label">${isArabic ? 'المدة:' : 'Duration:'}</div>
                <div class="value">${isArabic && packageDetails.durationAr ? packageDetails.durationAr : packageDetails.duration}</div>
              </div>
            ` : `
              <div class="detail-row">
                <div class="label">${isArabic ? 'المدرب:' : 'Coach:'}</div>
                <div class="value">${isArabic && bookingDetails.coachData.nameAr ? bookingDetails.coachData.nameAr : bookingDetails.coachData.name}</div>
              </div>
              <div class="detail-row">
                <div class="label">${isArabic ? 'الخدمة:' : 'Service:'}</div>
                <div class="value">${isArabic ? 'جلسة تدريب للمقابلة (60 دقيقة)' : 'Interview Coaching Session (60 minutes)'}</div>
              </div>
              <div class="detail-row">
                <div class="label">${isArabic ? 'التاريخ:' : 'Date:'}</div>
                <div class="value">${formatDate(bookingDetails.selectedDate, isArabic ? 'ar-AE' : 'en-US')}</div>
              </div>
              <div class="detail-row">
                <div class="label">${isArabic ? 'الوقت:' : 'Time:'}</div>
                <div class="value">${bookingDetails.selectedTime}</div>
              </div>
            `}
            
            <div class="total">
              ${isArabic ? 'المبلغ الإجمالي:' : 'Total Amount:'} AED ${(isPackagePurchase ? packageDetails.price : bookingDetails.price).toFixed(0)}
            </div>
          </div>
          
          <div class="footer">
            <p>${isArabic ? 'شكراً لاستخدامكم خدمات تمكين للمهن.' : 'Thank you for using Tamkeen AI Career Services.'}</p>
            <p>${isArabic ? 'للاستفسارات، يرجى التواصل على support@tamkeen-ai.com' : 'For any questions, please contact support@tamkeen-ai.com'}</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const downloadReceipt = () => {
    // Create receipt content
    const title = isPackagePurchase ? 
      `Package_${(isArabic && packageDetails.titleAr ? packageDetails.titleAr : packageDetails.title).replace(/\s+/g, '_')}` : 
      `Session_with_${(isArabic && bookingDetails.coachData.nameAr ? bookingDetails.coachData.nameAr : bookingDetails.coachData.name).replace(/\s+/g, '_')}`;
    
    const content = isArabic ? `
تمكين للذكاء الاصطناعي - إيصال الدفع
===========================
رقم الطلب: ${orderId}
التاريخ: ${new Date().toLocaleDateString('ar-AE')}
طريقة الدفع: ${paymentMethod === 'credit_card' ? 'بطاقة ائتمان' : 'تحويل بنكي'}

${isPackagePurchase ? `
الباقة: ${packageDetails.titleAr || packageDetails.title}
الوصف: ${packageDetails.descriptionAr || packageDetails.description}
الجلسات: ${packageDetails.sessions}
المدة: ${packageDetails.durationAr || packageDetails.duration}
` : `
المدرب: ${bookingDetails.coachData.nameAr || bookingDetails.coachData.name}
الخدمة: جلسة تدريب للمقابلة (60 دقيقة)
التاريخ: ${formatDate(bookingDetails.selectedDate, 'ar-AE')}
الوقت: ${bookingDetails.selectedTime}
`}

المبلغ الإجمالي: AED ${(isPackagePurchase ? packageDetails.price : bookingDetails.price).toFixed(0)}

شكراً لاستخدامكم خدمات تمكين للمهن.
للاستفسارات، يرجى التواصل على support@tamkeen-ai.com
    ` : `
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
    setSnackbarMessage(isArabic ? 'تم تنزيل الإيصال بنجاح' : 'Receipt downloaded successfully');
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

  const formatDate = (dateStr, locale = 'en-US') => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const steps = [
    isArabic ? 'مراجعة الطلب' : 'Review Order', 
    isArabic ? 'طريقة الدفع' : 'Payment Method', 
    isArabic ? 'تأكيد الدفع' : 'Confirm Payment'
  ];

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
        {isArabic ? 'الدفع' : 'Checkout'}
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
                    {isArabic && packageDetails.titleAr ? packageDetails.titleAr : packageDetails.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2, flexDirection: isArabic ? 'row-reverse' : 'row' }}>
                    <Typography variant="h4" component="span" color="primary" sx={{ mr: isArabic ? 1 : 0, ml: isArabic ? 0 : 1 }}>
                      {isArabic ? "730 AED" : "AED 730"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: isArabic ? 1 : 0, mr: isArabic ? 0 : 1 }}>
                      {isArabic ? `لـ ${packageDetails.sessions} جلسات` : `for ${packageDetails.sessions} sessions`}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" paragraph align={isArabic ? 'right' : 'left'}>
                    {isArabic && packageDetails.descriptionAr ? packageDetails.descriptionAr : 
                     (packageDetails.title === 'Technical Interview Prep' && isArabic ? 'إعداد شامل لمقابلات هندسة البرمجيات، يشمل هياكل البيانات والخوارزميات وتصميم النظام.' : packageDetails.description)}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }} align={isArabic ? 'right' : 'left'}>
                    <strong>{isArabic ? 'المدة:' : 'Duration:'}</strong> {isArabic ? 'شهر 1' : '1 month'}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle2" gutterBottom align={isArabic ? 'right' : 'left'}>
                    {isArabic ? 'المحتويات:' : 'What\'s included:'}
                  </Typography>
                  
                  <List>
                    {(packageDetails.title === 'Technical Interview Prep' && isArabic) ? 
                      ['مقابلات تجريبية مع تعليقات', 'خطة تحسين مخصصة', 'مراجعة السيرة الذاتية', 'تمارين برمجية تطبيقية'].map((feature, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={feature} />
                        </ListItem>
                      )) 
                      : 
                      (isArabic && packageDetails.featuresAr ? packageDetails.featuresAr : packageDetails.features).map((feature, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))
                    }
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
                      alt={isArabic && bookingDetails.coachData.nameAr ? bookingDetails.coachData.nameAr : bookingDetails.coachData.name}
                    />
                    <CardContent>
                      <Typography variant="h6">{isArabic && bookingDetails.coachData.nameAr ? bookingDetails.coachData.nameAr : bookingDetails.coachData.name}</Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {isArabic ? 
                          `${bookingDetails.coachData.titleAr || bookingDetails.coachData.title} ${isArabic ? "في" : "at"} ${bookingDetails.coachData.companyAr || bookingDetails.coachData.company}` : 
                          `${bookingDetails.coachData.title} at ${bookingDetails.coachData.company}`}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    {isArabic ? 'ملخص الطلب' : 'Order Summary'}
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary={isArabic ? 'الخدمة' : 'Service'} 
                        secondary={isArabic ? 'جلسة تدريب للمقابلة (60 دقيقة)' : 'Interview Coaching Session (60 minutes)'} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText 
                        primary={isArabic ? 'التاريخ' : 'Date'} 
                        secondary={formatDate(bookingDetails.selectedDate, isArabic ? 'ar-AE' : 'en-US')} 
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText 
                        primary={isArabic ? 'الوقت' : 'Time'} 
                        secondary={bookingDetails.selectedTime} 
                      />
                    </ListItem>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <ListItem>
                      <ListItemText 
                        primary={<Typography variant="subtitle1">{isArabic ? 'المبلغ الإجمالي' : 'Total Amount'}</Typography>} 
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
              {isArabic ? 'طريقة الدفع' : 'Payment Method'}
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
                        <Typography>{isArabic ? 'بطاقة الائتمان / الخصم' : 'Credit / Debit Card'}</Typography>
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
                        <Typography>{isArabic ? 'تحويل بنكي' : 'Bank Transfer'}</Typography>
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
                      label={isArabic ? 'رقم البطاقة' : 'Card Number'}
                      name="cardNumber"
                      value={cardInfo.cardNumber}
                      onChange={handleCardInfoChange}
                      placeholder="1234 5678 9012 3456"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={isArabic ? 'اسم حامل البطاقة' : 'Cardholder Name'}
                      name="cardName"
                      value={cardInfo.cardName}
                      onChange={handleCardInfoChange}
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label={isArabic ? 'تاريخ الانتهاء' : 'Expiry Date'}
                      name="expiry"
                      value={cardInfo.expiry}
                      onChange={handleCardInfoChange}
                      placeholder="MM/YY"
                    />
                  </Grid>
                  
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label={isArabic ? 'رمز التحقق' : 'CVV'}
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
                  {isArabic 
                    ? 'يرجى استخدام تفاصيل البنك التالية لإكمال الدفع. قم بتضمين رقم الطلب كمرجع.' 
                    : 'Please use the following bank details to complete your payment. Include your Order ID as reference.'}
                </Alert>
                
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2"><strong>{isArabic ? 'البنك:' : 'Bank:'}</strong> {isArabic ? 'بنك الإمارات دبي الوطني' : 'Emirates NBD'}</Typography>
                  <Typography variant="body2"><strong>{isArabic ? 'اسم الحساب:' : 'Account Name:'}</strong> {isArabic ? 'تمكين للخدمات المهنية' : 'Tamkeen AI Career Services'}</Typography>
                  <Typography variant="body2"><strong>{isArabic ? 'رقم الحساب:' : 'Account Number:'}</strong> 1234567890</Typography>
                  <Typography variant="body2"><strong>IBAN:</strong> AE123456789012345678</Typography>
                  <Typography variant="body2"><strong>{isArabic ? 'رقم الطلب (المرجع):' : 'Order ID (Reference):'}</strong> {orderId}</Typography>
                </Paper>
              </Box>
            )}
          </Box>
        )}
        
        {activeStep === 2 && (
          <Box id="receipt-content">
            <Alert severity="success" sx={{ mb: 3 }}>
              {isArabic ? 'تمت معالجة الدفع بنجاح!' : 'Your payment has been processed successfully!'}
            </Alert>
            
            <Typography variant="h6" gutterBottom>
              {isArabic ? 'تفاصيل الدفع' : 'Payment Details'}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1"><strong>{isArabic ? 'رقم الطلب:' : 'Order ID:'}</strong> {orderId}</Typography>
                <Typography variant="body1"><strong>{isArabic ? 'التاريخ:' : 'Date:'}</strong> {new Date().toLocaleDateString(isArabic ? 'ar-AE' : 'en-US')}</Typography>
                <Typography variant="body1"><strong>{isArabic ? 'طريقة الدفع:' : 'Payment Method:'}</strong> {paymentMethod === 'credit_card' ? (isArabic ? 'بطاقة ائتمان' : 'Credit Card') : (isArabic ? 'تحويل بنكي' : 'Bank Transfer')}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body1"><strong>{isArabic ? 'المبلغ المدفوع:' : 'Amount Paid:'}</strong> AED {(isPackagePurchase ? packageDetails.price : bookingDetails.price).toFixed(0)}</Typography>
                <Typography variant="body1"><strong>{isArabic ? 'الحالة:' : 'Status:'}</strong></Typography>
                <Chip label={isArabic ? 'مدفوع' : 'Paid'} color="success" size="small" sx={{ ml: 1 }} />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              {isPackagePurchase ? (isArabic ? 'تفاصيل الباقة' : 'Package Details') : (isArabic ? 'تفاصيل الحجز' : 'Booking Details')}
            </Typography>
            
            {isPackagePurchase ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body1"><strong>{isArabic ? 'الباقة:' : 'Package:'}</strong> {packageDetails.title}</Typography>
                  <Typography variant="body1"><strong>{isArabic ? 'الجلسات:' : 'Sessions:'}</strong> {packageDetails.sessions}</Typography>
                  <Typography variant="body1"><strong>{isArabic ? 'المدة:' : 'Duration:'}</strong> {packageDetails.duration}</Typography>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1"><strong>{isArabic ? 'المدرب:' : 'Coach:'}</strong> {bookingDetails.coachData.name}</Typography>
                  <Typography variant="body1"><strong>{isArabic ? 'الخدمة:' : 'Service:'}</strong> Interview Coaching Session (60 minutes)</Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="body1"><strong>{isArabic ? 'التاريخ:' : 'Date:'}</strong> {formatDate(bookingDetails.selectedDate)}</Typography>
                  <Typography variant="body1"><strong>{isArabic ? 'الوقت:' : 'Time:'}</strong> {bookingDetails.selectedTime}</Typography>
                </Grid>
              </Grid>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={printReceipt}
              >
                {isArabic ? 'طباعة الإيصال' : 'Print Receipt'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={downloadReceipt}
              >
                {isArabic ? 'تنزيل الإيصال' : 'Download Receipt'}
              </Button>
              
              {!isPackagePurchase && bookingDetails?.startDateTime && (
                <Button
                  variant="outlined"
                  startIcon={<CalendarMonth />}
                  onClick={() => {
                    // Create calendar event
                    const eventTitle = isArabic 
                      ? `جلسة تدريب مع ${bookingDetails.coachData.nameAr || bookingDetails.coachData.name}` 
                      : `Interview Coaching with ${bookingDetails.coachData.name}`;
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
                    
                    // Create details text with appropriate language
                    const detailsText = isArabic
                      ? `جلسة تدريب للمقابلة مع ${bookingDetails.coachData.nameAr || bookingDetails.coachData.name}. رقم الحجز: ${orderId}`
                      : `Interview coaching session with ${bookingDetails.coachData.name}. Booking reference: ${orderId}`;
                    
                    // Create Google Calendar URL
                    const googleCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(detailsText)}&location=Online Meeting`;
                    
                    // Open calendar in new tab
                    window.open(googleCalUrl, '_blank');
                    
                    // Show success message
                    setSnackbarMessage(isArabic ? 'تمت الإضافة إلى التقويم بنجاح' : 'Added to calendar successfully');
                    setSnackbarOpen(true);
                  }}
                >
                  {isArabic ? 'إضافة إلى التقويم' : 'Add to Calendar'}
                </Button>
              )}
            </Box>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, flexDirection: isArabic ? 'row-reverse' : 'row' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={isArabic ? null : <ArrowBack />}
            endIcon={isArabic ? <ArrowBack /> : null}
          >
            {isArabic ? 'رجوع' : 'Back'}
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
            startIcon={isArabic ? <ArrowForward /> : null}
            endIcon={isArabic ? null : (activeStep === steps.length - 1 ? null : <ArrowForward />)}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : activeStep === steps.length - 1 ? (
              isPackagePurchase ? (isArabic ? 'العودة إلى المدربين' : 'Return to Coaches') : (isArabic ? 'عرض حجوزاتي' : 'View My Bookings')
            ) : activeStep === steps.length - 2 ? (
              isArabic ? 'تأكيد الدفع' : 'Confirm Payment'
            ) : (
              isArabic ? 'التالي' : 'Next'
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