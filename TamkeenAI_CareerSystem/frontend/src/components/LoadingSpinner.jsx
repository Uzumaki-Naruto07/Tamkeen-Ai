import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Backdrop,
  Fade,
  Skeleton,
  Paper,
  useTheme
} from '@mui/material';
import { keyframes } from '@mui/system';
import Lottie from 'lottie-react';

// Pulse animation for the dot loading indicator
const pulsate = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.3;
  }
`;

const LoadingSpinner = ({
  type = 'circular',         // 'circular', 'linear', 'dots', 'skeleton', 'pulse'
  size = 'medium',           // 'small', 'medium', 'large'
  color = 'primary',         // 'primary', 'secondary', 'success', 'error', 'warning', 'info'
  thickness = 3.6,           // thickness of the circular progress
  message = '',              // optional loading message
  fullScreen = false,        // whether to show as fullscreen backdrop
  overlay = false,           // whether to show as overlay for a container
  transparent = false,       // whether backdrop/overlay should be transparent
  progress = 0,              // for determinate progress (0-100)
  variant = 'indeterminate', // 'determinate', 'indeterminate'
  hideAnimation = false,     // whether to hide with animation
  skeletonVariant = 'text',  // 'text', 'rectangular', 'rounded', 'circular'
  skeletonHeight = 100,      // height for skeleton variant
  skeletonWidth = '100%',    // width for skeleton variant
  sx = {},                   // additional styles
}) => {
  const theme = useTheme();
  
  // Size mapping for circular spinner
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
  };
  
  // Get circular size based on prop
  const circularSize = typeof size === 'number' ? size : sizeMap[size] || sizeMap.medium;
  
  // Dot size based on circular size
  const dotSize = circularSize / 6;
  
  // Render appropriate spinner based on type
  const renderSpinner = () => {
    switch (type) {
      case 'linear':
        return (
          <LinearProgress
            color={color}
            variant={variant}
            value={progress}
            sx={{ width: '100%', ...sx }}
          />
        );
        
      case 'dots':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, ...sx }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: '50%',
                  backgroundColor: theme.palette[color].main,
                  animation: `${pulsate} 1.2s ${i * 0.2}s infinite ease-in-out`,
                }}
              />
            ))}
          </Box>
        );
        
      case 'skeleton':
        return (
          <Skeleton
            variant={skeletonVariant}
            width={skeletonWidth}
            height={skeletonHeight}
            animation="wave"
            sx={sx}
          />
        );
        
      case 'pulse':
        return (
          <Box
            sx={{
              width: circularSize,
              height: circularSize,
              borderRadius: '50%',
              backgroundColor: theme.palette[color].main,
              opacity: 0.6,
              animation: `${pulsate} 1.5s infinite ease-in-out`,
              ...sx
            }}
          />
        );
        
      case 'circular':
      default:
        return (
          <CircularProgress
            color={color}
            size={circularSize}
            thickness={thickness}
            variant={variant}
            value={progress}
            sx={sx}
          />
        );
    }
  };
  
  // Content with spinner and optional message
  const spinnerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      {renderSpinner()}
      
      {message && (
        <Typography
          variant={size === 'small' ? 'caption' : 'body1'}
          color={fullScreen || overlay ? 'common.white' : 'text.secondary'}
          align="center"
        >
          {message}
        </Typography>
      )}
    </Box>
  );
  
  // Render based on fullScreen or overlay mode
  if (fullScreen) {
    return (
      <Backdrop
        open={true}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: transparent ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.8)',
        }}
      >
        <Fade in={!hideAnimation}>
          {spinnerContent}
        </Fade>
      </Backdrop>
    );
  }
  
  if (overlay) {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: transparent ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.7)',
          zIndex: 1,
          borderRadius: 'inherit',
        }}
      >
        <Fade in={!hideAnimation}>
          {spinnerContent}
        </Fade>
      </Box>
    );
  }
  
  // Default centered spinner
  return spinnerContent;
};

// Specialized version for content placeholders
export const ContentPlaceholder = ({ rows = 3, type = 'text', height, width, spacing = 1 }) => {
  return (
    <Box sx={{ width: '100%', mt: 1, mb: 1 }}>
      {Array.from(new Array(rows)).map((_, index) => (
        <Box key={index} sx={{ mb: spacing }}>
          <Skeleton
            variant={type}
            height={height}
            width={typeof width === 'function' ? width(index) : width}
            animation="wave"
          />
        </Box>
      ))}
    </Box>
  );
};

// Specialized version for card placeholders with header and content
export const CardPlaceholder = ({ headerHeight = 40, contentRows = 3, width = '100%' }) => {
  return (
    <Paper sx={{ p: 2, width }}>
      <Skeleton variant="rectangular" height={headerHeight} animation="wave" />
      <Box sx={{ pt: 2 }}>
        <ContentPlaceholder 
          rows={contentRows} 
          width={(index) => [`100%`, `80%`, `60%`][index] || '40%'} 
        />
      </Box>
    </Paper>
  );
};

// LoadingScreen for initial app loading
export const LoadingScreen = ({ logo, appName = "TamkeenAI", message = "Loading..." }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      {logo && (
        <Box
          component="img"
          src={logo}
          alt={appName}
          sx={{
            width: 100,
            height: 100,
            mb: 3,
            animation: `${pulsate} 2s infinite ease-in-out`,
          }}
        />
      )}
      
      <Typography variant="h4" gutterBottom fontWeight="bold">
        {appName}
      </Typography>
      
      <Box sx={{ mt: 4, mb: 2 }}>
        <CircularProgress color="primary" />
      </Box>
      
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner; 