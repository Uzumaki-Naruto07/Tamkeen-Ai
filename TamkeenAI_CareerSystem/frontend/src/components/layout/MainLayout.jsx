import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useTheme as useMuiTheme } from '@mui/material';
import NavigationBar from './NavigationBar';
import { useUser } from '../../context/AppContext';
import { useTheme } from '../../contexts/ThemeContext';

const MainLayout = () => {
  const muiTheme = useMuiTheme();
  const { isAuthenticated } = useUser();
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {isAuthenticated && (
        <NavigationBar toggleDarkMode={toggleDarkMode} darkMode={isDarkMode} />
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          mt: isAuthenticated ? 2 : 0,
          backgroundColor: muiTheme.palette.background.default,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 