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
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Snackbar
} from '@mui/material';
import { 
  CheckCircle, 
  Print, 
  Download,
  Check,
  Assignment,
  Schedule,
  ArrowBack,
  Event,
  School
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

const PackageConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [packageDetails, setPackageDetails] = useState(null);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    if (location.state?.packageDetails) {
      setPackageDetails(location.state.packageDetails);
      setOrderId(location.state.orderId || uuidv4().substring(0, 8).toUpperCase());
      
      // Save package to localStorage
      savePackageToLocalStorage({
        ...location.state.packageDetails,
        id: location.state.orderId || uuidv4().substring(0, 8).toUpperCase(),
        purchaseDate: new Date().toISOString(),
        status: 'active',
        sessionsRemaining: location.state.packageDetails.sessions
      });
      
      setLoading(false);
    } else {
      // No package details provided, redirect to coaches page
      navigate('/ai-coach');
    }
  }, [location, navigate]);

  const savePackageToLocalStorage = (packageData) => {
    // Get existing packages
    const existingPackages = JSON.parse(localStorage.getItem('userPackages') || '[]');
    
    // Add the new package
    const updatedPackages = [...existingPackages, packageData];
    localStorage.setItem('userPackages', JSON.stringify(updatedPackages));
  };

  const printReceipt = () => {
    // Create a receipt content
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Package Receipt</title>
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
            <div class="title">Package Purchase Receipt</div>
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
            
            <div class="total">
              Total Amount: AED ${packageDetails.price.toFixed(0)}
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
    const title = `Package_${packageDetails.title.replace(/\s+/g, '_')}`;
    const content = `
TAMKEEN AI - PACKAGE PURCHASE RECEIPT
====================================
Order ID: ${orderId}
Date: ${new Date().toLocaleDateString()}

Package: ${packageDetails.title}
Description: ${packageDetails.description}
Sessions: ${packageDetails.sessions}
Duration: ${packageDetails.duration}

Features:
${packageDetails.features.map(feature => `- ${feature}`).join('\n')}

Total Amount: AED ${packageDetails.price.toFixed(0)}

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

  // Render loading state
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 6, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
        </motion.div>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Purchase Confirmed!
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Thank you for purchasing the {packageDetails.title} package. Your order has been successfully processed.
        </Typography>
        
        <Chip 
          label={`Order ID: ${orderId}`}
          variant="outlined"
          sx={{ mb: 3 }}
        />
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Package Details
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                <Typography variant="h4" component="span" color="primary">
                  {packageDetails.title}
                </Typography>
                <Chip 
                  label="Active" 
                  color="success" 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              </Box>
              
              <Typography variant="body1" paragraph>
                {packageDetails.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Assignment sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>{packageDetails.sessions}</strong> Sessions
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>{packageDetails.duration}</strong> Duration
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                What's included:
              </Typography>
              
              <List>
                {packageDetails.features.map((feature, index) => (
                  <ListItem key={index} dense>
                    <ListItemIcon>
                      <Check color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Order Summary
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Package" 
                    secondary={packageDetails.title} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Purchase Date" 
                    secondary={new Date().toLocaleDateString()} 
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemText 
                    primary="Status" 
                    secondary={<Chip label="Active" color="success" size="small" />} 
                  />
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                <ListItem>
                  <ListItemText 
                    primary={<Typography variant="subtitle1">Total Amount</Typography>} 
                    secondary={<Typography variant="h6" color="primary">AED {packageDetails.price.toFixed(0)}</Typography>} 
                  />
                </ListItem>
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<Print />}
                  fullWidth
                  onClick={printReceipt}
                >
                  Print Receipt
                </Button>
                
                <Button 
                  variant="outlined" 
                  startIcon={<Download />}
                  fullWidth
                  onClick={downloadReceipt}
                >
                  Download Receipt
                </Button>
                
                <Button 
                  variant="outlined" 
                  startIcon={<Event />}
                  fullWidth
                  onClick={() => navigate('/ai-coach')}
                >
                  Book a Session
                </Button>
                
                <Button 
                  variant="outlined" 
                  startIcon={<School />}
                  fullWidth
                  onClick={() => navigate('/learning-path')}
                >
                  View Learning Paths
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate('/ai-coach')}
          startIcon={<ArrowBack />}
        >
          Back to Coaches
        </Button>
      </Box>
      
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

export default PackageConfirmation; 