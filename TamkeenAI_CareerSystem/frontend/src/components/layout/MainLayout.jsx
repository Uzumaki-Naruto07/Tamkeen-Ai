import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme as useMuiTheme } from '@mui/material';
import NavigationBar from './NavigationBar';
import { useUser } from '../../context/AppContext';
import { useTheme } from '../../contexts/ThemeContext';
import ErrorBoundary from '../common/ErrorBoundary';
import RouteErrorBoundary from '../common/RouteErrorBoundary';

const MainLayout = () => {
  const muiTheme = useMuiTheme();
  const { isAuthenticated } = useUser();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isAuthenticated && (
        <NavigationBar darkMode={isDarkMode} />
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: isAuthenticated ? 2 : 0,
          backgroundColor: muiTheme.palette.background.default,
        }}
      >
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Box>
    </Box>
  );
};

export default MainLayout; 