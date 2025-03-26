import React, { useEffect } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import LanguageIcon from '@mui/icons-material/Language';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import CheckIcon from '@mui/icons-material/Check';
import { useUI } from './AppContext';

const LanguageToggle = ({
  showLabels = false,
  variant = 'combined', // 'combined', 'language-only', 'theme-only'
  size = 'medium', // 'small', 'medium', 'large'
  position = 'vertical', // 'horizontal', 'vertical'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { language, setLanguage, theme: currentTheme, toggleTheme } = useUI();
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    handleClose();
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  // Apply RTL direction when language is Arabic
  useEffect(() => {
    document.dir = language === 'ar' ? 'rtl' : 'ltr';
    // You can also update the lang attribute on the html element
    document.documentElement.lang = language;
  }, [language]);

  // Size and style configurations based on props
  const getIconButtonSize = () => {
    switch (size) {
      case 'small': return { size: 'small', sx: { p: 0.75 } };
      case 'large': return { size: 'large', sx: { p: 1.25 } };
      default: return { size: 'medium', sx: { p: 1 } };
    }
  };

  const { size: iconButtonSize, sx: iconButtonSx } = getIconButtonSize();

  const renderLanguageToggle = () => (
    <Tooltip title={language === 'en' ? "Switch to Arabic" : "Switch to English"}>
      <IconButton
        onClick={handleClick}
        size={iconButtonSize}
        sx={{
          ...iconButtonSx,
          borderRadius: '50%',
          bgcolor: open ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
        }}
        aria-label="Switch language"
      >
        <TranslateIcon />
      </IconButton>
    </Tooltip>
  );

  const renderThemeToggle = () => (
    <Tooltip title={currentTheme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}>
      <IconButton
        onClick={handleThemeToggle}
        size={iconButtonSize}
        sx={{
          ...iconButtonSx,
          borderRadius: '50%',
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
        }}
        aria-label="Toggle dark/light mode"
      >
        {currentTheme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );

  // Helper function to calculate opacity based on theme
  const alpha = (color, opacity) => {
    return theme.palette.mode === 'light'
      ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${opacity})`
      : `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${opacity})`;
  };

  return (
    <Box>
      {/* Main toggles */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: position === 'horizontal' ? 'row' : 'column',
          alignItems: 'center',
          gap: 1
        }}
      >
        {(variant === 'combined' || variant === 'language-only') && renderLanguageToggle()}
        {(variant === 'combined' || variant === 'theme-only') && renderThemeToggle()}
        
        {/* Optional labels */}
        {showLabels && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: position === 'horizontal' ? 'row' : 'column',
              alignItems: 'center',
              gap: position === 'horizontal' ? 2 : 0.5
            }}
          >
            {(variant === 'combined' || variant === 'language-only') && (
              <Typography variant="caption" color="text.secondary">
                {language === 'en' ? 'English' : 'العربية'}
              </Typography>
            )}
            {(variant === 'combined' || variant === 'theme-only') && (
              <Typography variant="caption" color="text.secondary">
                {currentTheme === 'light' ? 'Light' : 'Dark'}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Language selection menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <MenuItem 
          onClick={() => handleLanguageChange('en')}
          selected={language === 'en'}
          dense
        >
          <ListItemIcon>
            {language === 'en' ? <CheckIcon fontSize="small" /> : <span style={{ width: 24 }} />}
          </ListItemIcon>
          <ListItemText>English</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('ar')}
          selected={language === 'ar'}
          dense
        >
          <ListItemIcon>
            {language === 'ar' ? <CheckIcon fontSize="small" /> : <span style={{ width: 24 }} />}
          </ListItemIcon>
          <ListItemText>العربية</ListItemText>
        </MenuItem>
        
        {/* Only show theme toggle in menu if on mobile and in combined mode */}
        {isMobile && variant === 'combined' && (
          <>
            <Divider />
            <MenuItem dense>
              <ListItemIcon>
                <Brightness4Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Dark Mode</ListItemText>
              <Switch
                edge="end"
                checked={currentTheme === 'dark'}
                onChange={handleThemeToggle}
                inputProps={{
                  'aria-labelledby': 'theme-toggle-switch',
                }}
              />
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default LanguageToggle; 