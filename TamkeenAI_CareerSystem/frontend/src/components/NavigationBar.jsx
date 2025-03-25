import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useMediaQuery,
  useTheme,
  Tooltip
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import AssessmentIcon from '@mui/icons-material/Assessment';
import VideocamIcon from '@mui/icons-material/Videocam';
import ExploreIcon from '@mui/icons-material/Explore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LanguageIcon from '@mui/icons-material/Language';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

const NavigationBar = ({ toggleTheme, darkMode, toggleLanguage, language, userInfo }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [notifMenuAnchor, setNotifMenuAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  
  const openUserMenu = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };
  
  const closeUserMenu = () => {
    setUserMenuAnchor(null);
  };
  
  const openNotifMenu = (event) => {
    setNotifMenuAnchor(event.currentTarget);
  };
  
  const closeNotifMenu = () => {
    setNotifMenuAnchor(null);
  };
  
  const handleLogout = () => {
    closeUserMenu();
    // Implement logout logic
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    navigate('/login');
  };
  
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Resume Analysis', icon: <DescriptionIcon />, path: '/resume-analysis' },
    { text: 'Job Applications', icon: <WorkIcon />, path: '/job-applications' },
    { text: 'Interview Practice', icon: <VideocamIcon />, path: '/interview-practice' },
    { text: 'Career Explorer', icon: <ExploreIcon />, path: '/career-explorer' },
    { text: 'Stats & Reports', icon: <AssessmentIcon />, path: '/reports' },
  ];
  
  const isPathActive = (path) => {
    return location.pathname === path;
  };
  
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  // Dummy notifications
  const notifications = [
    { id: 1, message: 'Your latest resume update increased your ATS score by 15%', read: false, timestamp: '1 hour ago' },
    { id: 2, message: 'New job recommendations based on your profile', read: false, timestamp: '3 hours ago' },
    { id: 3, message: 'You\'ve earned the "Resume Master" badge!', read: true, timestamp: '1 day ago' },
    { id: 4, message: 'Weekly career progress report is ready', read: true, timestamp: '2 days ago' }
  ];
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const drawer = (
    <Box
      sx={{ width: 280 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        p: 2,
        bgcolor: 'primary.main',
        color: 'primary.contrastText'
      }}>
        <Avatar 
          src={userInfo?.avatar || '/avatar-placeholder.png'} 
          sx={{ width: 64, height: 64, mb: 1, border: '2px solid white' }}
        />
        <Typography variant="h6">{userInfo?.name || 'Guest User'}</Typography>
        <Typography variant="body2">{userInfo?.email || 'guest@example.com'}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <EmojiEventsIcon fontSize="small" sx={{ mr: 0.5 }} />
          <Typography variant="body2">Level {userInfo?.level || 1}</Typography>
        </Box>
      </Box>
      
      <Divider />
      
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            component={Link}
            to={item.path}
            selected={isPathActive(item.path)}
            sx={{
              borderLeft: isPathActive(item.path) ? `4px solid ${theme.palette.primary.main}` : 'none',
              bgcolor: isPathActive(item.path) ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.08)'
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: isPathActive(item.path) ? 'primary.main' : 'inherit',
              minWidth: 40
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{
                fontWeight: isPathActive(item.path) ? 'medium' : 'regular'
              }}
            />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List>
        <ListItem button onClick={toggleTheme}>
          <ListItemIcon>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </ListItemIcon>
          <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
        </ListItem>
        
        <ListItem button onClick={toggleLanguage}>
          <ListItemIcon>
            <LanguageIcon />
          </ListItemIcon>
          <ListItemText primary={language === 'en' ? "العربية" : "English"} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/tamkeen-logo.png" 
              alt="Tamkeen AI" 
              height="36" 
              style={{ marginRight: '10px' }}
            />
            <Typography 
              variant="h6" 
              component={Link} 
              to="/"
              sx={{ 
                textDecoration: 'none', 
                color: 'inherit',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Tamkeen AI
            </Typography>
          </Box>
          
          {!isMobile && (
            <Box sx={{ display: 'flex', ml: 4 }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  sx={{ 
                    mx: 0.5,
                    position: 'relative',
                    '&::after': isPathActive(item.path) ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 8,
                      right: 8,
                      height: 3,
                      bgcolor: 'primary.main',
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3
                    } : {}
                  }}
                  startIcon={item.icon}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Toggle theme">
              <IconButton onClick={toggleTheme} color="inherit">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Change language">
              <IconButton onClick={toggleLanguage} color="inherit">
                <LanguageIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit" 
                onClick={openNotifMenu}
                aria-controls={Boolean(notifMenuAnchor) ? 'notification-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(notifMenuAnchor) ? 'true' : undefined}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                ml: 1,
                cursor: 'pointer',
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                },
                px: 1,
                py: 0.5
              }}
              onClick={openUserMenu}
              aria-controls={Boolean(userMenuAnchor) ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={Boolean(userMenuAnchor) ? 'true' : undefined}
            >
              <Avatar 
                src={userInfo?.avatar || '/avatar-placeholder.png'} 
                sx={{ 
                  width: 32, 
                  height: 32,
                  mr: { xs: 0, sm: 1 }
                }}
              />
              <Typography 
                variant="body1" 
                sx={{ 
                  display: { xs: 'none', sm: 'block' },
                  mr: 0.5
                }}
              >
                {userInfo?.name?.split(' ')[0] || 'Guest'}
              </Typography>
              <KeyboardArrowDownIcon fontSize="small" sx={{ display: { xs: 'none', sm: 'block' } }} />
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawer}
      </Drawer>
      
      {/* User Menu */}
      <Menu
        id="user-menu"
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={closeUserMenu}
        MenuListProps={{
          'aria-labelledby': 'user-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => { closeUserMenu(); navigate('/profile'); }}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="My Profile" />
        </MenuItem>
        <MenuItem onClick={() => { closeUserMenu(); navigate('/achievements'); }}>
          <ListItemIcon>
            <EmojiEventsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Achievements" />
        </MenuItem>
        <MenuItem onClick={() => { closeUserMenu(); navigate('/settings'); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
      
      {/* Notifications Menu */}
      <Menu
        id="notification-menu"
        anchorEl={notifMenuAnchor}
        open={Boolean(notifMenuAnchor)}
        onClose={closeNotifMenu}
        MenuListProps={{
          'aria-labelledby': 'notification-button',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 320,
          },
        }}
      >
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1">Notifications</Typography>
          <Button size="small">Mark all as read</Button>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              onClick={closeNotifMenu}
              sx={{ 
                whiteSpace: 'normal',
                bgcolor: !notification.read ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                borderLeft: !notification.read ? `4px solid ${theme.palette.primary.main}` : 'none',
                pl: !notification.read ? 1.5 : 2
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2">{notification.message}</Typography>
                <Typography variant="caption" color="text.secondary">{notification.timestamp}</Typography>
              </Box>
            </MenuItem>
          ))
        )}
        <Divider />
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button
            size="small"
            onClick={() => { closeNotifMenu(); navigate('/notifications'); }}
          >
            View all notifications
          </Button>
        </Box>
      </Menu>
    </>
  );
};

export default NavigationBar; 