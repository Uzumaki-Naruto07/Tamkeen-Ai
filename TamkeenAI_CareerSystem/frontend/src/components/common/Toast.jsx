import React, { useState, useEffect, forwardRef } from 'react';
import {
  Snackbar,
  Alert,
  Typography,
  Box,
  IconButton,
  LinearProgress,
  Slide,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Info,
  Warning,
  Close,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// Slide transition for the toast
const SlideTransition = (props) => {
  return <Slide {...props} direction="left" />;
};

/**
 * Custom Toast notification component
 * Displays notifications with different styles based on severity
 */
const Toast = forwardRef(({ 
  open,
  message = '',
  severity = 'info',
  duration = 5000,
  position = { vertical: 'bottom', horizontal: 'right' },
  onClose,
  action = null,
  showProgress = true,
  subtitle = '',
}, ref) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [progress, setProgress] = useState(100);
  
  // Reset progress when open state changes
  useEffect(() => {
    if (open) {
      setProgress(100);
    }
  }, [open]);
  
  // Handle progress animation
  useEffect(() => {
    if (!open || !showProgress || duration === null) return;
    
    const step = 10; // Update every 10ms
    const decrement = (step / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress - decrement;
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, step);
    
    return () => {
      clearInterval(timer);
    };
  }, [open, duration, showProgress]);
  
  // Close toast when progress reaches zero
  useEffect(() => {
    if (progress <= 0 && open && onClose) {
      onClose();
    }
  }, [progress, open, onClose]);
  
  // Get icon based on severity
  const getIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircle fontSize="small" />;
      case 'error':
        return <Error fontSize="small" />;
      case 'warning':
        return <Warning fontSize="small" />;
      case 'info':
      default:
        return <Info fontSize="small" />;
    }
  };
  
  return (
    <Snackbar
      ref={ref}
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={position}
      TransitionComponent={SlideTransition}
      sx={{
        maxWidth: '100%',
        width: 400,
      }}
    >
      <Alert
        severity={severity}
        variant="filled"
        icon={getIcon()}
        sx={{
          width: '100%',
          boxShadow: theme.shadows[4],
          position: 'relative',
          overflow: 'hidden',
          '.MuiAlert-icon': {
            alignItems: 'center',
          },
        }}
        action={
          <Box>
            {action}
            <IconButton
              aria-label={t('close')}
              color="inherit"
              size="small"
              onClick={onClose}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <Box sx={{ mr: action ? 6 : 0 }}>
          <Typography variant="body2" fontWeight="medium">
            {message}
          </Typography>
          {subtitle && (
            <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {showProgress && duration !== null && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: 'transparent',
            }}
          />
        )}
      </Alert>
    </Snackbar>
  );
});

export default Toast; 