import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Avatar, 
  Button, 
  Badge, 
  useMediaQuery,
  Tooltip,
  Tab,
  Tabs,
  useTheme,
  Switch,
  FormControlLabel,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import LanguageIcon from '@mui/icons-material/Language';
import CalendarToday from '@mui/icons-material/CalendarToday';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkIcon from '@mui/icons-material/Work';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import TranslateIcon from '@mui/icons-material/Translate';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LinkedIn from '@mui/icons-material/LinkedIn';

// Context
import { useUser } from '../../context/AppContext';
import logoSrc from '../../assets/images/logo.js';
import { getConsistentAvatarUrl } from '../../utils/api';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  borderBottom: `1px solid ${theme.palette.divider}`,
  zIndex: theme.zIndex.drawer + 1,
  minHeight: '56px',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
}));

const LogoImage = styled('img')(({ theme }) => ({
  height: 36,
  marginRight: theme.spacing(1),
}));

const NavTabs = styled(Tabs)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  '& .MuiTab-root': {
    minWidth: 'auto',
    padding: theme.spacing(1, 1.5),
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.9rem',
  },
}));

const NavTab = styled(Tab)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(0.5),
    marginBottom: 0,
    fontSize: '1.1rem',
  },
}));

const UserSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: 'auto',
  gap: theme.spacing(1),
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
  },
}));

const ProfileButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1),
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const DrawerFooter = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: 'auto',
}));

const DarkModeSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 32,
    height: 32,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

// Animation variants
const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2 }
  }
};

// Navigation items
const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', labelKey: 'navigation.dashboard', icon: <DashboardIcon /> },
  { path: '/jobs', label: 'Jobs', labelKey: 'navigation.jobs', icon: <WorkIcon /> },
  { path: '/automation-linkedin', label: 'Automation LinkedIn', labelKey: 'navigation.automationLinkedin', icon: <LinkedIn /> },
  { path: '/ai-coach', label: 'AI Coach', labelKey: 'navigation.aiCoach', icon: <SmartToyIcon /> },
  { path: '/resumePage', label: 'Resume Builder', labelKey: 'navigation.resumeBuilder', icon: <DescriptionIcon /> },
  { path: '/resume-score-tracker', label: 'Resume Score', labelKey: 'navigation.resumeScore', icon: <AssessmentIcon /> },
  { path: '/skills-assessment', label: 'Skill Builder', labelKey: 'navigation.skillBuilder', icon: <SchoolIcon /> },
  { path: '/achievements', label: 'Achievements', labelKey: 'navigation.achievements', icon: <EmojiEventsIcon /> },
];

const NavigationBar = ({ open, onToggleDrawer }) => {
  const muiTheme = useTheme();
  const { isDarkMode, toggleDarkMode } = useCustomTheme();
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [notificationsMenuAnchor, setNotificationsMenuAnchor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
  const [language, setLanguage] = useState('en'); // Always default to English
  
  // Set the current tab based on location
  useEffect(() => {
    const findTabIndex = () => {
      const path = location.pathname;
      
      // Special handling for job-related routes
      if (path === '/job-search' || path.startsWith('/job-search/') || 
          path === '/jobs' || path.startsWith('/jobs/')) {
        // This is the index for the Jobs tab
        return navigationItems.findIndex(item => item.path === '/jobs');
      }
      
      // Handle other routes normally
      const index = navigationItems.findIndex(item => 
        path === item.path || path.startsWith(`${item.path}/`)
      );
      return index >= 0 ? index : 0;
    };
    
    setCurrentTab(findTabIndex());
  }, [location]);
  
  // Define mock notifications for the example
  const getNotifications = () => {
    // Standard mock notifications
    const standardNotifications = [
      { id: 1, messageKey: 'notifications.newJobRecommendation', message: 'New job recommendation', read: false },
      { id: 2, messageKey: 'notifications.resumeUpdate', message: 'Your resume needs updating', read: false },
      { id: 3, messageKey: 'notifications.skillGap', message: 'Skill gap detected', read: false }
    ];
    
    // Get booking notifications from localStorage
    const bookingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    // Combine lists with booking notifications first
    return [...bookingNotifications, ...standardNotifications];
  };
  
  // Calculate unread notifications count
  useEffect(() => {
    // Load notifications from localStorage and update the counter
    const loadNotifications = () => {
      // Get booking notifications from localStorage
      const bookingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      
      // Count unread booking notifications
      const unreadBookingCount = bookingNotifications.filter(n => !n.read).length;
      
      // Count standard notifications (3 by default)
      const standardNotificationsCount = 3;
      
      // Set total unread count
      setUnreadCount(unreadBookingCount + standardNotificationsCount);
    };
    
    loadNotifications();
    
    // Set up interval to check for new notifications
    const interval = setInterval(loadNotifications, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Toggle drawer
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    
    // Special case for Jobs tab - navigate to job-search
    if (navigationItems[newValue].path === '/jobs') {
      navigate('/job-search');
    } else {
      navigate(navigationItems[newValue].path);
    }
  };
  
  // Handle profile menu
  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };
  
  // Handle notifications menu
  const handleNotificationsMenuOpen = (event) => {
    setNotificationsMenuAnchor(event.currentTarget);
    
    // Mark booking notifications as read
    const bookingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    if (bookingNotifications.length > 0) {
      const updatedNotifications = bookingNotifications.map(n => ({ ...n, read: true }));
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    }
  };
  
  const handleNotificationsMenuClose = () => {
    setNotificationsMenuAnchor(null);
  };
  
  // Handle language menu
  const handleLanguageMenuOpen = (event) => {
    setLanguageMenuAnchor(event.currentTarget);
  };
  
  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
  };
  
  // Change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
    handleLanguageMenuClose();
    
    // Update language in localStorage
    localStorage.setItem('language', lang);
    
    // Update i18n
    i18n.changeLanguage(lang);
    
    // Update document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };
  
  // Handle logout
  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/login');
  };
  
  // Handle mark all notifications as read
  const handleMarkAllRead = () => {
    setUnreadCount(0);
    
    // Mark booking notifications as read in localStorage
    const bookingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    if (bookingNotifications.length > 0) {
      const updatedNotifications = bookingNotifications.map(n => ({ ...n, read: true }));
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    }
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    // For booking notifications, navigate to My Bookings
    if (notification.type === 'booking_reminder') {
      navigate('/my-bookings');
    }
    
    // For other notifications, you can add specific handling here
    // For example, for job recommendations, navigate to jobs page
    if (notification.messageKey === 'notifications.newJobRecommendation') {
      navigate('/job-search');
    }
    
    handleNotificationsMenuClose();
  };
  
  // Render notification content based on notification type
  const renderNotificationContent = (notification) => {
    // Handle booking reminders
    if (notification.type === 'booking_reminder') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <CalendarToday color="primary" sx={{ mr: 1, mt: 0.5 }} fontSize="small" />
          <Box>
            <Typography variant="subtitle2">{notification.title}</Typography>
            <Typography variant="body2">{notification.message}</Typography>
          </Box>
        </Box>
      );
    }
    
    // Handle existing notification types with messageKey
    return <Typography variant="body2">{t(notification.messageKey, notification.message)}</Typography>;
  };
  
  return (
    <StyledAppBar position="sticky">
      <Toolbar>
        {/* Logo and brand for mobile */}
        {isMobile && (
          <LogoContainer>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <LogoImage src={logoSrc} alt="Career Intelligence System Logo" />
          </LogoContainer>
        )}
        
        {/* Logo and navigation tabs for desktop */}
        {!isMobile && (
          <>
            <LogoContainer>
              <LogoImage src={logoSrc} alt="Career Intelligence System Logo" />
            </LogoContainer>
            
            <NavTabs
              value={currentTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              {navigationItems.map((item) => (
                <NavTab
                  key={item.path}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                      <span>{t(item.labelKey)}</span>
                    </Box>
                  }
                />
              ))}
            </NavTabs>
          </>
        )}
        
        {/* User section */}
        <UserSection>
          {/* Theme toggle */}
          <Tooltip title={isDarkMode ? t('common.lightMode') : t('common.darkMode')}>
            <IconButton
              color="inherit"
              onClick={toggleDarkMode}
              edge="end"
            >
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          
          {/* Language toggle */}
          <Tooltip title="Change language">
            <IconButton
              color="inherit"
              onClick={handleLanguageMenuOpen}
            >
              <LanguageIcon />
            </IconButton>
          </Tooltip>
          
          {/* Notifications */}
          <Tooltip title={t('common.notifications')}>
            <IconButton
              color="inherit"
              edge="end"
              onClick={handleNotificationsMenuOpen}
            >
              <NotificationBadge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </NotificationBadge>
            </IconButton>
          </Tooltip>
          
          {/* Profile button */}
          {user ? (
            <ProfileButton
              onClick={handleProfileMenuOpen}
              endIcon={<ArrowDropDownIcon />}
            >
              <Avatar 
                src={user?.avatar || undefined} 
                sx={{ width: 32, height: 32, mr: 1 }}
              >
                {user?.firstName?.charAt(0) || user?.name?.charAt(0) || "U"}
              </Avatar>
              {!isMobile && (
                <Typography variant="body2">
                  {user?.firstName || user?.name?.split(' ')[0] || "User"}
                </Typography>
              )}
            </ProfileButton>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
            >
              {t('common.login')}
            </Button>
          )}
        </UserSection>
        
        {/* Profile menu */}
        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleProfileMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => { navigate('/user-profile'); handleProfileMenuClose(); }}>
            <ListItemIcon>
              <AccountCircleIcon fontSize="small" />
            </ListItemIcon>
            {t('common.profile')}
          </MenuItem>
          <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            {t('common.settings')}
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            {t('common.logout')}
          </MenuItem>
        </Menu>
        
        {/* Notifications menu */}
        <Menu
          anchorEl={notificationsMenuAnchor}
          open={Boolean(notificationsMenuAnchor)}
          onClose={handleNotificationsMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: { width: 320, maxHeight: 400 }
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">{t('common.notifications')}</Typography>
            <Button size="small" onClick={handleMarkAllRead}>
              {t('notifications.markAllRead')}
            </Button>
          </Box>
          <Divider />
          <List sx={{ p: 0 }}>
            {getNotifications().length > 0 ? (
              getNotifications().map((notification) => (
                <ListItem 
                  key={notification.id}
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ 
                    backgroundColor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemText 
                    primary={renderNotificationContent(notification)}
                    secondary={notification.read ? t('notifications.read') : t('notifications.new')}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary={t('notifications.empty')} />
              </ListItem>
            )}
          </List>
          <Divider />
          <Box sx={{ p: 1 }}>
            <Button 
              fullWidth
              size="small"
              onClick={() => { navigate('/notifications'); handleNotificationsMenuClose(); }}
            >
              {t('notifications.viewAll')}
            </Button>
          </Box>
        </Menu>
        
        {/* Language menu */}
        <Menu
          anchorEl={languageMenuAnchor}
          open={Boolean(languageMenuAnchor)}
          onClose={handleLanguageMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem 
            onClick={() => changeLanguage('en')}
            selected={language === 'en'}
          >
            English
          </MenuItem>
          <MenuItem 
            onClick={() => changeLanguage('ar')}
            selected={language === 'ar'}
          >
            العربية
          </MenuItem>
        </Menu>
        
        {/* Mobile drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
        >
          <Box
            sx={{ width: 280 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
          >
            <DrawerHeader>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LogoImage src={logoSrc} alt="Career Intelligence System Logo" />
              </Box>
              <IconButton color="inherit" onClick={toggleDrawer(false)}>
                <MenuIcon />
              </IconButton>
            </DrawerHeader>
            <Divider />
            <List>
              {navigationItems.map((item, index) => (
                <ListItem 
                  button 
                  key={item.path}
                  onClick={() => {
                    // Special case for Jobs tab
                    if (item.path === '/jobs') {
                      navigate('/job-search');
                    } else {
                      navigate(item.path);
                    }
                  }}
                  selected={currentTab === index}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={t(item.labelKey)} />
                </ListItem>
              ))}
            </List>
            <Divider />
            <DrawerFooter>
              <FormControlLabel
                control={
                  <DarkModeSwitch
                    checked={isDarkMode}
                    onChange={toggleDarkMode}
                  />
                }
                label={isDarkMode ? t('common.darkMode') : t('common.lightMode')}
              />
            </DrawerFooter>
          </Box>
        </Drawer>
      </Toolbar>
    </StyledAppBar>
  );
};

export default NavigationBar;