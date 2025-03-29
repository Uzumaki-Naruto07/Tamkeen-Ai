import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Paper, Grid,
  FormControl, InputLabel, Select, MenuItem, Switch,
  Card, CardContent, CardHeader, IconButton, Avatar,
  List, ListItem, ListItemText, ListItemIcon, Divider,
  Tab, Tabs, AppBar, Toolbar, Badge, Chip, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, Snackbar, Tooltip, CircularProgress
} from '@mui/material';
import {
  Translate, Settings, Language, FormatTextdirectionRtoL,
  FormatTextdirectionLtoR, Check, MenuBook, Dashboard,
  Home, Work, School, Psychology, Assessment, Group,
  AccountCircle, Notifications, Search, Public, HelpOutline,
  Close, Info, Save, Refresh, KeyboardArrowRight, KeyboardArrowLeft,
  SettingsBrightness, CloudDownload, Upload, FlagOutlined,
  PlayArrow, Check as CheckIcon, ContentCopy, Edit
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/AppContext';
import apiEndpoints from '../utils/api';
import { ThemeProvider, createTheme, useTheme, styled } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Sample translations
const translations = {
  en: {
    appName: 'TamkeenAI Career System',
    welcomeMessage: 'Welcome to TamkeenAI',
    description: 'Your AI-powered career development platform',
    languageSettings: 'Language Settings',
    selectLanguage: 'Select Language',
    applyLanguage: 'Apply Language',
    english: 'English',
    arabic: 'Arabic',
    direction: 'Text Direction',
    rtlMode: 'Right to Left (RTL)',
    ltrMode: 'Left to Right (LTR)',
    savePreferences: 'Save Preferences',
    dashboard: 'Dashboard',
    profile: 'Profile',
    resume: 'Resume',
    interviews: 'Interviews',
    jobs: 'Jobs',
    insights: 'Insights',
    settings: 'Settings',
    help: 'Help & Support',
    logout: 'Logout',
    notifications: 'Notifications',
    darkMode: 'Dark Mode',
    previewTitle: 'Interface Preview',
    previewDescription: 'See how the interface adapts to different languages',
    dashboardPreview: 'Dashboard Preview',
    recentActivity: 'Recent Activity',
    upcomingEvents: 'Upcoming Events',
    skillsProgress: 'Skills Progress',
    jobMatchRate: 'Job Match Rate',
    sampleCard1Title: 'Resume Builder',
    sampleCard1Content: 'Create and optimize your professional resume with AI assistance',
    sampleCard2Title: 'Interview Practice',
    sampleCard2Content: 'Prepare for interviews with AI-powered practice sessions',
    sampleCard3Title: 'Skill Analysis',
    sampleCard3Content: 'Analyze your skills and discover improvement opportunities',
    sampleDate1: 'Tomorrow, 2:00 PM',
    sampleDate2: 'Friday, 10:00 AM',
    sampleDate3: 'Next Monday, 3:30 PM',
    preferenceSaved: 'Your language preferences have been saved',
    learnMore: 'Learn More',
    copyText: 'Copy Text',
    editText: 'Edit',
    viewDetails: 'View Details',
    sampleEvent1: 'Mock Interview Session',
    sampleEvent2: 'Career Workshop',
    sampleEvent3: 'Networking Event',
    sampleNotification1: 'Your resume was viewed by 3 recruiters',
    sampleNotification2: 'New job match: Senior Developer at Tech Co',
    sampleNotification3: 'Interview preparation reminder',
    searchPlaceholder: 'Search...',
    resetToDefault: 'Reset to Default',
  },
  ar: {
    appName: 'نظام تمكين للتطوير المهني',
    welcomeMessage: 'مرحبا بك في تمكين',
    description: 'منصة التطوير المهني المدعومة بالذكاء الاصطناعي',
    languageSettings: 'إعدادات اللغة',
    selectLanguage: 'اختر اللغة',
    applyLanguage: 'تطبيق اللغة',
    english: 'الإنجليزية',
    arabic: 'العربية',
    direction: 'اتجاه النص',
    rtlMode: 'من اليمين إلى اليسار',
    ltrMode: 'من اليسار إلى اليمين',
    savePreferences: 'حفظ التفضيلات',
    dashboard: 'لوحة التحكم',
    profile: 'الملف الشخصي',
    resume: 'السيرة الذاتية',
    interviews: 'المقابلات',
    jobs: 'الوظائف',
    insights: 'التحليلات',
    settings: 'الإعدادات',
    help: 'المساعدة والدعم',
    logout: 'تسجيل الخروج',
    notifications: 'الإشعارات',
    darkMode: 'الوضع الداكن',
    previewTitle: 'معاينة الواجهة',
    previewDescription: 'شاهد كيف تتكيف الواجهة مع اللغات المختلفة',
    dashboardPreview: 'معاينة لوحة التحكم',
    recentActivity: 'النشاط الأخير',
    upcomingEvents: 'الأحداث القادمة',
    skillsProgress: 'تقدم المهارات',
    jobMatchRate: 'معدل تطابق الوظائف',
    sampleCard1Title: 'منشئ السيرة الذاتية',
    sampleCard1Content: 'إنشاء وتحسين سيرتك الذاتية المهنية بمساعدة الذكاء الاصطناعي',
    sampleCard2Title: 'التدريب على المقابلات',
    sampleCard2Content: 'استعد للمقابلات من خلال جلسات تدريبية مدعومة بالذكاء الاصطناعي',
    sampleCard3Title: 'تحليل المهارات',
    sampleCard3Content: 'تحليل مهاراتك واكتشاف فرص التحسين',
    sampleDate1: 'غدًا، 2:00 مساءً',
    sampleDate2: 'الجمعة، 10:00 صباحًا',
    sampleDate3: 'الاثنين المقبل، 3:30 مساءً',
    preferenceSaved: 'تم حفظ تفضيلات اللغة الخاصة بك',
    learnMore: 'اعرف المزيد',
    copyText: 'نسخ النص',
    editText: 'تعديل',
    viewDetails: 'عرض التفاصيل',
    sampleEvent1: 'جلسة مقابلة تجريبية',
    sampleEvent2: 'ورشة عمل مهنية',
    sampleEvent3: 'فعالية تواصل',
    sampleNotification1: 'تمت مشاهدة سيرتك الذاتية من قبل 3 مسؤولي توظيف',
    sampleNotification2: 'تطابق وظيفي جديد: مطور أول في شركة التكنولوجيا',
    sampleNotification3: 'تذكير بالتحضير للمقابلة',
    searchPlaceholder: 'بحث...',
    resetToDefault: 'إعادة التعيين إلى الافتراضي',
  }
};

const menuItems = [
  { text: 'dashboard', icon: <Dashboard /> },
  { text: 'profile', icon: <AccountCircle /> },
  { text: 'resume', icon: <MenuBook /> },
  { text: 'interviews', icon: <Psychology /> },
  { text: 'jobs', icon: <Work /> },
  { text: 'insights', icon: <Assessment /> },
  { text: 'settings', icon: <Settings /> },
  { text: 'help', icon: <HelpOutline /> },
];

const Localization = () => {
  const [language, setLanguage] = useState('en');
  const [isRtl, setIsRtl] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [openLanguageDialog, setOpenLanguageDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  
  const navigate = useNavigate();
  const { profile, updatePreferences } = useUser();
  const mainTheme = useTheme();

  // Create a theme with the appropriate direction
  const theme = createTheme({
    ...mainTheme,
    direction: isRtl ? 'rtl' : 'ltr',
    palette: {
      ...mainTheme.palette,
      mode: isDarkMode ? 'dark' : 'light',
    },
  });

  // Get translations for the current language
  const t = translations[language];

  // Load user preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (profile?.preferences) {
        if (profile.preferences.language) {
          setLanguage(profile.preferences.language);
          setIsRtl(profile.preferences.language === 'ar');
        }
        if (profile.preferences.theme) {
          setIsDarkMode(profile.preferences.theme === 'dark');
        }
      }
    };
    
    loadPreferences();
  }, [profile]);

  // Handle language change
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    setIsRtl(newLanguage === 'ar');
    setSettingsChanged(true);
  };

  // Handle direction toggle
  const handleRtlToggle = (event) => {
    setIsRtl(event.target.checked);
    setSettingsChanged(true);
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = (event) => {
    setIsDarkMode(event.target.checked);
    setSettingsChanged(true);
  };

  // Save preferences
  const savePreferences = async () => {
    setSaving(true);
    try {
      await updatePreferences({
        language,
        theme: isDarkMode ? 'dark' : 'light',
      });
      
      // Apply HTML dir attribute for RTL support
      document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
      
      setShowSnackbar(true);
      setSettingsChanged(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setLanguage('en');
    setIsRtl(false);
    setIsDarkMode(false);
    setSettingsChanged(true);
  };

  // Arrow based on direction
  const DirectionArrow = isRtl ? KeyboardArrowLeft : KeyboardArrowRight;

  return (
    <ThemeProvider theme={theme}>
      <CacheProvider value={isRtl ? cacheRtl : null}>
        <Box
          sx={{
            bgcolor: 'background.default',
            color: 'text.primary',
            minHeight: '100vh',
            width: '100%',
          }}
        >
          {/* App Bar */}
          <AppBar position="static" color="primary" elevation={0}>
            <Toolbar>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Language sx={{ mr: isRtl ? 0 : 2, ml: isRtl ? 2 : 0 }} />
                <Typography variant="h6" noWrap component="div">
                  {t.appName}
                </Typography>
              </Box>
              
              <Box sx={{ flexGrow: 1 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title={t.searchPlaceholder}>
                  <IconButton color="inherit">
                    <Search />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={t.notifications}>
                  <IconButton color="inherit">
                    <Badge badgeContent={3} color="error">
                      <Notifications />
                    </Badge>
                  </IconButton>
                </Tooltip>
                
                <IconButton 
                  color="inherit" 
                  onClick={() => setOpenLanguageDialog(true)}
                  edge="end"
                >
                  <Tooltip title={t.languageSettings}>
                    <Translate />
                  </Tooltip>
                </IconButton>
              </Box>
            </Toolbar>
            
            <Tabs
              value={selectedTab}
              onChange={(_, newValue) => setSelectedTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                bgcolor: 'primary.dark',
                '& .MuiTab-root': {
                  color: 'primary.contrastText',
                  opacity: 0.7,
                  '&.Mui-selected': {
                    opacity: 1,
                  },
                },
              }}
            >
              <Tab icon={<Home />} label={t.dashboard} />
              <Tab icon={<Work />} label={t.jobs} />
              <Tab icon={<MenuBook />} label={t.resume} />
              <Tab icon={<Psychology />} label={t.interviews} />
              <Tab icon={<Assessment />} label={t.insights} />
            </Tabs>
          </AppBar>
          
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
              {/* Left Sidebar - Navigation */}
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" gutterBottom sx={{ px: 2, pt: 1 }}>
                    {t.welcomeMessage}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
                    {t.description}
                  </Typography>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <List component="nav">
                    {menuItems.map((item, index) => (
                      <ListItem 
                        button 
                        key={index}
                        selected={index === 0}
                        sx={{ 
                          borderRadius: 1,
                          mb: 0.5,
                          '&.Mui-selected': {
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                            },
                            '& .MuiListItemIcon-root': {
                              color: 'primary.contrastText',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={t[item.text]} />
                      </ListItem>
                    ))}
                  </List>
                  
                  <Box sx={{ mt: 'auto', p: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      startIcon={<Language />}
                      onClick={() => setOpenLanguageDialog(true)}
                    >
                      {t.languageSettings}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
              
              {/* Main Content Area */}
              <Grid item xs={12} md={9}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {t.languageSettings}
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    {t.previewDescription}
                  </Typography>
                  
                  <Grid container spacing={3} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="language-select-label">
                          {t.selectLanguage}
                        </InputLabel>
                        <Select
                          labelId="language-select-label"
                          value={language}
                          onChange={handleLanguageChange}
                          label={t.selectLanguage}
                          startAdornment={
                            <Box component="span" sx={{ mr: 1, display: 'flex' }}>
                              <Language fontSize="small" />
                            </Box>
                          }
                        >
                          <MenuItem value="en">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FlagOutlined sx={{ mr: 1 }} />
                              {t.english}
                            </Box>
                          </MenuItem>
                          <MenuItem value="ar">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FlagOutlined sx={{ mr: 1 }} />
                              {t.arabic}
                            </Box>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1">{t.direction}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {isRtl ? t.rtlMode : t.ltrMode}
                            </Typography>
                          </Box>
                          <Switch
                            checked={isRtl}
                            onChange={handleRtlToggle}
                            color="primary"
                            inputProps={{ 'aria-label': 'toggle RTL' }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle1">{t.darkMode}</Typography>
                          </Box>
                          <Switch
                            checked={isDarkMode}
                            onChange={handleDarkModeToggle}
                            color="primary"
                            inputProps={{ 'aria-label': 'toggle dark mode' }}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Refresh />}
                          onClick={resetToDefaults}
                        >
                          {t.resetToDefault}
                        </Button>
                        
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                          onClick={savePreferences}
                          disabled={saving || !settingsChanged}
                        >
                          {t.savePreferences}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
                
                {/* Interface Preview Section */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {t.previewTitle}
                  </Typography>
                  
                  <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                    {t.dashboardPreview}
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {/* Sample Card 1 */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardHeader
                          avatar={
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <MenuBook />
                            </Avatar>
                          }
                          title={t.sampleCard1Title}
                          action={
                            <IconButton aria-label="settings">
                              <MoreVert />
                            </IconButton>
                          }
                        />
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            {t.sampleCard1Content}
                          </Typography>
                        </CardContent>
                        <Box sx={{ p: 2, pt: 0, textAlign: isRtl ? 'left' : 'right' }}>
                          <Button
                            endIcon={<DirectionArrow />}
                            color="primary"
                          >
                            {t.learnMore}
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                    
                    {/* Sample Card 2 */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardHeader
                          avatar={
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                              <Psychology />
                            </Avatar>
                          }
                          title={t.sampleCard2Title}
                          action={
                            <IconButton aria-label="settings">
                              <MoreVert />
                            </IconButton>
                          }
                        />
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            {t.sampleCard2Content}
                          </Typography>
                        </CardContent>
                        <Box sx={{ p: 2, pt: 0, textAlign: isRtl ? 'left' : 'right' }}>
                          <Button
                            endIcon={<DirectionArrow />}
                            color="primary"
                          >
                            {t.learnMore}
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                    
                    {/* Sample Card 3 */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ height: '100%' }}>
                        <CardHeader
                          avatar={
                            <Avatar sx={{ bgcolor: 'success.main' }}>
                              <Assessment />
                            </Avatar>
                          }
                          title={t.sampleCard3Title}
                          action={
                            <IconButton aria-label="settings">
                              <MoreVert />
                            </IconButton>
                          }
                        />
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">
                            {t.sampleCard3Content}
                          </Typography>
                        </CardContent>
                        <Box sx={{ p: 2, pt: 0, textAlign: isRtl ? 'left' : 'right' }}>
                          <Button
                            endIcon={<DirectionArrow />}
                            color="primary"
                          >
                            {t.learnMore}
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                    
                    {/* Upcoming Events */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                          {t.upcomingEvents}
                        </Typography>
                        <List>
                          <ListItem
                            secondaryAction={
                              <Chip 
                                size="small" 
                                label={t.sampleDate1}
                                color="primary"
                                variant="outlined"
                              />
                            }
                          >
                            <ListItemIcon>
                              <Psychology />
                            </ListItemIcon>
                            <ListItemText 
                              primary={t.sampleEvent1}
                            />
                          </ListItem>
                          
                          <Divider component="li" />
                          
                          <ListItem
                            secondaryAction={
                              <Chip 
                                size="small" 
                                label={t.sampleDate2}
                                color="primary"
                                variant="outlined"
                              />
                            }
                          >
                            <ListItemIcon>
                              <School />
                            </ListItemIcon>
                            <ListItemText 
                              primary={t.sampleEvent2}
                            />
                          </ListItem>
                          
                          <Divider component="li" />
                          
                          <ListItem
                            secondaryAction={
                              <Chip 
                                size="small" 
                                label={t.sampleDate3}
                                color="primary"
                                variant="outlined"
                              />
                            }
                          >
                            <ListItemIcon>
                              <Group />
                            </ListItemIcon>
                            <ListItemText 
                              primary={t.sampleEvent3}
                            />
                          </ListItem>
                        </List>
                      </Paper>
                    </Grid>
                    
                    {/* Recent Activity */}
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                          {t.recentActivity}
                        </Typography>
                        <List>
                          <ListItem>
                            <ListItemIcon>
                              <Work />
                            </ListItemIcon>
                            <ListItemText 
                              primary={t.sampleNotification1}
                              secondary="2 hours ago"
                            />
                          </ListItem>
                          
                          <Divider component="li" />
                          
                          <ListItem>
                            <ListItemIcon>
                              <Search />
                            </ListItemIcon>
                            <ListItemText 
                              primary={t.sampleNotification2}
                              secondary="Yesterday"
                            />
                          </ListItem>
                          
                          <Divider component="li" />
                          
                          <ListItem>
                            <ListItemIcon>
                              <Psychology />
                            </ListItemIcon>
                            <ListItemText 
                              primary={t.sampleNotification3}
                              secondary="3 days ago"
                            />
                          </ListItem>
                        </List>
                      </Paper>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Container>
          
          {/* Language Selection Dialog */}
          <Dialog
            open={openLanguageDialog}
            onClose={() => setOpenLanguageDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Language sx={{ mr: 1 }} />
                {t.languageSettings}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="dialog-language-select-label">
                      {t.selectLanguage}
                    </InputLabel>
                    <Select
                      labelId="dialog-language-select-label"
                      value={language}
                      onChange={handleLanguageChange}
                      label={t.selectLanguage}
                    >
                      <MenuItem value="en">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FlagOutlined sx={{ mr: 1 }} />
                          English (US)
                        </Box>
                      </MenuItem>
                      <MenuItem value="ar">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FlagOutlined sx={{ mr: 1 }} />
                          العربية (Arabic)
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      {language === 'ar' 
                        ? 'سيتم تطبيق تغييرات اللغة على جميع أجزاء التطبيق.'
                        : 'Language changes will be applied across the entire application.'}
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenLanguageDialog(false)}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  savePreferences();
                  setOpenLanguageDialog(false);
                }}
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Check />}
                disabled={saving}
              >
                {language === 'ar' ? 'تطبيق' : 'Apply'}
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Success Snackbar */}
          <Snackbar
            open={showSnackbar}
            autoHideDuration={4000}
            onClose={() => setShowSnackbar(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={() => setShowSnackbar(false)} 
              severity="success"
              sx={{ width: '100%' }}
            >
              {t.preferenceSaved}
            </Alert>
          </Snackbar>
        </Box>
      </CacheProvider>
    </ThemeProvider>
  );
};

export default Localization; 