import React from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Button
        id="language-switcher-button"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        startIcon={<TranslateIcon />}
        sx={{
          color: 'text.primary',
          textTransform: 'none',
          fontWeight: 'normal',
        }}
      >
        <Typography variant="body2">
          {i18n.language === 'ar' ? 'العربية' : 'English'}
        </Typography>
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-switcher-button',
        }}
      >
        <MenuItem 
          onClick={() => handleLanguageChange('en')} 
          selected={i18n.language === 'en'}
        >
          <Typography variant="body2">English</Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('ar')} 
          selected={i18n.language === 'ar'}
        >
          <Typography variant="body2">العربية</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LanguageSwitcher; 