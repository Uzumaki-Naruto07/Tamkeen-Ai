import React, { useEffect, useState } from 'react';
import { useBackendHealth } from '../context/AppContext';
import { Alert, Snackbar, Typography, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const BackendStatusBanner = () => {
  const { t } = useTranslation();
  const { 
    backendHealth, 
    isMainBackendHealthy,
    isInterviewBackendHealthy,
    areAllServicesHealthy 
  } = useBackendHealth();
  
  const [open, setOpen] = useState(false);
  const [previousStatus, setPreviousStatus] = useState(true);
  
  useEffect(() => {
    // Only show the banner when the status changes
    if (previousStatus !== areAllServicesHealthy) {
      setOpen(true);
      setPreviousStatus(areAllServicesHealthy);
    }
  }, [areAllServicesHealthy, previousStatus]);
  
  const handleClose = () => {
    setOpen(false);
  };
  
  if (areAllServicesHealthy) {
    return (
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          {t('All services are connected and operational')}
        </Alert>
      </Snackbar>
    );
  }
  
  // At least one service is down
  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
        <Typography variant="body1">
          {t('Some services are currently unavailable')}
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2">
            {t('Main API')}: {isMainBackendHealthy ? t('Connected') : t('Disconnected')}
          </Typography>
          <Typography variant="body2">
            {t('Interview API')}: {isInterviewBackendHealthy ? t('Connected') : t('Disconnected')}
          </Typography>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default BackendStatusBanner; 