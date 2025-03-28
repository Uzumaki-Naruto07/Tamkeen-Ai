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

// Context
import { useUser } from '../../context/AppContext';

// Logo
import logo from '../../assets/images/logo.png';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  borderBottom: `1px solid ${theme.palette.divider}`,
  zIndex: theme.zIndex.drawer + 1,
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
}));

const LogoImage = styled('img')(({ theme }) => ({
  height: 40,
  marginRight: theme.spacing(1),
}));

const NavTabs = styled(Tabs)(({ theme }) => ({
  marginLeft: theme.spacing(4),
  '& .MuiTab-root': {
    minWidth: 'auto',
    padding: theme.spacing(1.5, 2),
    textTransform: 'none',
    fontWeight: 500,
  },
}));

const NavTab = styled(Tab)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    marginBottom: 0,
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
  { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/jobs', label: 'Jobs', icon: <WorkIcon /> },
  { path: '/ai-coach', label: 'AI Coach', icon: <SmartToyIcon /> },
  { path: '/resume-builder', label: 'Resume Builder', icon: <DescriptionIcon /> },
  { path: '/skill-builder', label: 'Skill Builder', icon: <SchoolIcon /> },
  { path: '/achievements', label: 'Achievements', icon: <EmojiEventsIcon /> },
  { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

// Notification data (mock)
const notifications = [
  { id: 1, message: "New job recommendation", read: false },
  { id: 2, message: "Your resume needs updating", read: false },
  { id: 3, message: "Skill gap detected", read: true },
  { id: 4, message: "Mock interview completed", read: true },
  { id: 5, message: "New achievement unlocked!", read: false },
];

const NavigationBar = ({ toggleDarkMode, darkMode }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, logout, isAuthenticated } = useUser();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [notificationsMenuAnchor, setNotificationsMenuAnchor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
  const [language, setLanguage] = useState('en'); // en or ar
  
  // Set the current tab based on location
  useEffect(() => {
    const findTabIndex = () => {
      const currentPath = location.pathname;
      const index = navigationItems.findIndex(item => currentPath.startsWith(item.path));
      return index >= 0 ? index : 0;
    };
    
    setCurrentTab(findTabIndex());
  }, [location]);
  
  // Calculate unread notifications count
  useEffect(() => {
    setUnreadCount(notifications.filter(note => !note.read).length);
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
    navigate(navigationItems[newValue].path);
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
    // In a real app, you would update the i18n context here
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
    // In a real app, you would update the notifications in the backend
  };
  
  // Mobile drawer content
  const drawerContent = (
    <Box
      sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <DrawerHeader>
        <Typography variant="h6">TamkeenAI</Typography>
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
            onClick={() => navigate(item.path)}
            selected={currentTab === index}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <DrawerFooter>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={toggleDarkMode}
              color="primary"
            />
          }
          label={darkMode ? "Dark Mode" : "Light Mode"}
        />
        
        <Button
          variant="outlined"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </DrawerFooter>
    </Box>
  );

  return (
    <AnimatePresence>
      <motion.div
        variants={navVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <StyledAppBar position="sticky">
      <Toolbar>
            {/* Logo and brand for mobile */}
            {isMobile && (
              <LogoContainer>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleDrawer(true)}
                >
                  <MenuIcon />
                </IconButton>
                <LogoImage src={logo} alt="TamkeenAI Logo" />
                <Typography variant="h6" component="div">
                  TamkeenAI
        </Typography>
              </LogoContainer>
            )}
            
            {/* Logo and navigation tabs for desktop */}
            {!isMobile && (
              <>
                <LogoContainer>
                  <LogoImage src={logo} alt="TamkeenAI Logo" />
                  <Typography variant="h6" component="div">
                    TamkeenAI
                  </Typography>
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
                          <Box component="span" sx={{ ml: 1 }}>
                            {item.label}
                          </Box>
                        </Box>
                      }
                    />
                  ))}
                </NavTabs>
              </>
            )}
            
            {/* User controls section */}
            <UserSection>
              {/* Theme toggle */}
              <Tooltip title={darkMode ? "Light mode" : "Dark mode"}>
                <IconButton color="inherit" onClick={toggleDarkMode}>
                  {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
              </Tooltip>
              
              {/* Language selector */}
              <Tooltip title="Change language">
                <IconButton
                  color="inherit"
                  onClick={handleLanguageMenuOpen}
                >
                  <TranslateIcon />
                </IconButton>
              </Tooltip>
              
              {/* Notifications */}
              <Tooltip title="Notifications">
                <IconButton
                  color="inherit"
                  onClick={handleNotificationsMenuOpen}
                >
                  <NotificationBadge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </NotificationBadge>
                </IconButton>
              </Tooltip>
              
              {/* User profile */}
              {isAuthenticated ? (
                <ProfileButton
                  color="inherit"
                  onClick={handleProfileMenuOpen}
                  endIcon={<ArrowDropDownIcon />}
                >
                  <Avatar 
                    src={profile?.avatar || undefined} 
                    sx={{ width: 32, height: 32, mr: 1 }}
                  >
                    {profile?.firstName?.charAt(0) || "U"}
                  </Avatar>
                  {!isMobile && (
                    <Typography variant="body2">
                      {profile?.firstName || "User"}
                    </Typography>
                  )}
                </ProfileButton>
              ) : (
                <Button 
                  color="primary" 
                  variant="contained"
                  onClick={() => navigate('/login')}
                >
                  Login
              </Button>
              )}
            </UserSection>
            
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
            
            {/* Profile menu */}
            <Menu
              anchorEl={profileMenuAnchor}
              open={Boolean(profileMenuAnchor)}
              onClose={handleProfileMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
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
                <Typography variant="h6">Notifications</Typography>
                <Button size="small" onClick={handleMarkAllRead}>
                  Mark all read
              </Button>
              </Box>
              <Divider />
              <List sx={{ p: 0 }}>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <ListItem 
                      key={notification.id}
                      sx={{ 
                        backgroundColor: notification.read ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <ListItemText 
                        primary={notification.message}
                        secondary={notification.read ? "Read" : "New"}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No notifications" />
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
                  View all notifications
              </Button>
        </Box>
            </Menu>
      </Toolbar>
        </StyledAppBar>
        
        {/* Mobile drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
        >
          {drawerContent}
        </Drawer>
      </motion.div>
    </AnimatePresence>
  );
};

export default NavigationBar;