import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AppContextProvider, useAppContext } from './context/AppContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import NavigationBar from './components/layout/NavigationBar';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AnimatePresence, motion } from 'framer-motion';
import { RTL } from './components/RTL';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import theme from './theme';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeContextProvider } from './contexts/ThemeContext';

// Direct imports for essential pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import LearningPath from './pages/LearningPath';

// Lazy-loaded page components for code splitting - using your exact file names
const AdminInsights = lazy(() => import('./pages/AdminInsights'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AllInterviewCoach = lazy(() => import('./pages/AllInterviewCoach'));
const AIJobJourney = lazy(() => import('./pages/AIJobJourney'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ApplicationHistory = lazy(() => import('./pages/ApplicationHistory'));
const CalendarView = lazy(() => import('./pages/CalendarView'));
const CareerAssessment = lazy(() => import('./pages/CareerAssessment'));
const CareerExplorer = lazy(() => import('./pages/CareerExplorer'));
const CertificationsAchievements = lazy(() => import('./pages/CertificationsAchievements'));
const CoverLetter = lazy(() => import('./pages/CoverLetter'));
const CVBuilder = lazy(() => import('./pages/CVBuilder'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const GamifiedProgress = lazy(() => import('./pages/GamifiedProgress'));
const InterviewResults = lazy(() => import('./pages/InterviewResults'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const JobSearch = lazy(() => import('./pages/JobSearch'));
const JobSearchDashboard = lazy(() => import('./pages/JobSearchDashboard'));
const LearningResources = lazy(() => import('./pages/LearningResources'));
const Localization = lazy(() => import('./pages/Localization'));
const MockInterview = lazy(() => import('./pages/MockInterview'));
const Networking = lazy(() => import('./pages/Networking'));
const NetworkingPanel = lazy(() => import('./pages/NetworkingPanel'));
const NetworkingView = lazy(() => import('./pages/NetworkingView'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Notifications = lazy(() => import('./pages/Notifications'));
const PersonalityProfile = lazy(() => import('./pages/PersonalityProfile'));
const ResumeAnalysis = lazy(() => import('./pages/ResumeAnalysis'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));
const ResumePage = lazy(() => import('./pages/ResumePage'));
const ResumeScoreboard = lazy(() => import('./pages/ResumeScoreboard'));
const ResumeScoreTracker = lazy(() => import('./pages/ResumeScoreTracker'));
const SalaryInsights = lazy(() => import('./pages/SalaryInsights'));
const SentimentReview = lazy(() => import('./pages/SentimentReview'));
const Settings = lazy(() => import('./pages/Settings'));
const SkillInsightCenter = lazy(() => import('./pages/SkillInsightCenter'));
const SkillsAssessment = lazy(() => import('./pages/SkillsAssessment'));
const StartupPitch = lazy(() => import('./pages/StartupPitch'));
const TaskManager = lazy(() => import('./pages/TaskManager'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const WalkthroughTour = lazy(() => import('./pages/WalkthroughTour'));

// Import the AdminAnalytics component
import AdminAnalytics from './pages/AdminAnalytics';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -10
  }
};

// Transition settings
const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

// ScrollToTop component - ensures page scrolls to top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

// Animated page wrapper component
const AnimatedPage = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
    className="page-container"
  >
    {children}
  </motion.div>
);

// Suspense fallback component
const SuspenseFallback = () => (
  <div className="page-loading">
    <LoadingSpinner message="Loading page..." />
  </div>
);

// App content with theming and routing
const AppContent = () => {
  const { theme, language, isAuthenticated, loading, userRoles, user } = useAppContext();
  const location = useLocation();
  const [initializing, setInitializing] = useState(true);
  
  // Create MUI theme based on app context settings
  const appTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#f50057',
      },
    },
    direction: language === 'ar' ? 'rtl' : 'ltr',
    typography: {
      fontFamily: language === 'ar' ? 
        '"Tajawal", "Roboto", "Helvetica", "Arial", sans-serif' : 
        '"Roboto", "Helvetica", "Arial", sans-serif',
    }
  });
  
  // Check if user has required role for a route
  const hasRequiredRole = (requiredRoles) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!userRoles || userRoles.length === 0) return false;
    return requiredRoles.some(role => userRoles.includes(role));
  };
  
  useEffect(() => {
    if (!loading) {
      setInitializing(false);
    }
  }, [loading]);
  
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <ThemeContextProvider>
        <ToastProvider>
          <RTL direction={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={`${theme === 'dark' ? 'dark' : ''}`}>
              <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
                <ScrollToTop />
                {isAuthenticated && <NavigationBar />}
                <ErrorBoundary>
                  <Suspense fallback={<SuspenseFallback />}>
                    <AnimatePresence mode="wait">
                      <Routes location={location} key={location.pathname}>
                        {/* Public routes */}
                        <Route path="/login" element={
                          !user ? (
                            <AnimatedPage><Login /></AnimatedPage>
                          ) : (
                            <Navigate to="/dashboard" />
                          )
                        } />
                        <Route path="/register" element={
                          !user ? (
                            <AnimatedPage><Register /></AnimatedPage>
                          ) : (
                            <Navigate to="/dashboard" />
                          )
                        } />
                        <Route path="/forgot-password" element={
                          !user ? (
                            <AnimatedPage><ForgotPassword /></AnimatedPage>
                          ) : (
                            <Navigate to="/dashboard" />
                          )
                        } />
                        
                        {/* Protected routes */}
                        <Route path="/" element={
                          user ? (
                            <Navigate to="/dashboard" />
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/dashboard" element={
                          user ? (
                            <AnimatedPage><Dashboard /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/resume-analysis" element={
                          user ? (
                            <AnimatedPage><ResumeAnalysis /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/career-assessment" element={
                          user ? (
                            <AnimatedPage><CareerAssessment /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/career-explorer" element={
                          user ? (
                            <AnimatedPage><CareerExplorer /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/interview-results" element={
                          user ? (
                            <AnimatedPage><InterviewResults /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/ai-job-journey" element={
                          user ? (
                            <AnimatedPage><AIJobJourney /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/gamified-progress" element={
                          user ? (
                            <AnimatedPage><GamifiedProgress /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/resume-builder" element={
                          user ? (
                            <AnimatedPage><ResumeBuilder /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/cv-builder" element={
                          user ? (
                            <AnimatedPage><CVBuilder /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/cover-letter" element={
                          user ? (
                            <AnimatedPage><CoverLetter /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/job-search" element={
                          user ? (
                            <AnimatedPage><JobSearch /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/job-search-dashboard" element={
                          user ? (
                            <AnimatedPage><JobSearchDashboard /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/job-details/:id" element={
                          user ? (
                            <AnimatedPage><JobDetails /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/application-history" element={
                          user ? (
                            <AnimatedPage><ApplicationHistory /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        
                        {/* Networking routes */}
                        <Route path="/networking" element={
                          user ? (
                            <AnimatedPage><Networking /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/networking-panel" element={
                          user ? (
                            <AnimatedPage><NetworkingPanel /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/networking-view" element={
                          user ? (
                            <AnimatedPage><NetworkingView /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        
                        {/* Interview and skills routes */}
                        <Route path="/mock-interview" element={
                          user ? (
                            <AnimatedPage><MockInterview /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/interview-coach" element={
                          user ? (
                            <AnimatedPage><AllInterviewCoach /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/skills-assessment" element={
                          user ? (
                            <AnimatedPage><SkillsAssessment /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/skill-insight-center" element={
                          user ? (
                            <AnimatedPage><SkillInsightCenter /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        
                        {/* Resume related routes */}
                        <Route path="/resume-page" element={
                          user ? (
                            <AnimatedPage><ResumePage /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/resume-scoreboard" element={
                          user ? (
                            <AnimatedPage><ResumeScoreboard /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/resume-score-tracker" element={
                          user ? (
                            <AnimatedPage><ResumeScoreTracker /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        
                        {/* Insights and analytics routes */}
                        <Route path="/salary-insights" element={
                          user ? (
                            <AnimatedPage><SalaryInsights /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/sentiment-review" element={
                          user ? (
                            <AnimatedPage><SentimentReview /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/analytics" element={
                          user ? (
                            <AnimatedPage><Analytics /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        
                        {/* User profile and settings */}
                        <Route path="/profile" element={
                          user ? (
                            <AnimatedPage><UserProfile /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/personality-profile" element={
                          user ? (
                            <AnimatedPage><PersonalityProfile /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/settings" element={
                          user ? (
                            <AnimatedPage><Settings /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/localization" element={
                          user ? (
                            <AnimatedPage><Localization /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        
                        {/* Utility routes */}
                        <Route path="/notifications" element={
                          user ? (
                            <AnimatedPage><Notifications /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/calendar" element={
                          user ? (
                            <AnimatedPage><CalendarView /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/task-manager" element={
                          user ? (
                            <AnimatedPage><TaskManager /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/learning-resources" element={
                          user ? (
                            <AnimatedPage><LearningResources /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/startup-pitch" element={
                          user ? (
                            <AnimatedPage><StartupPitch /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        <Route path="/walkthrough-tour" element={
                          user ? (
                            <AnimatedPage><WalkthroughTour /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        
                        {/* Admin routes with role-based protection */}
                        <Route path="/admin-insights" element={
                          user && hasRequiredRole(['admin']) ? (
                            <AnimatedPage><AdminInsights /></AnimatedPage>
                          ) : (
                            <Navigate to="/dashboard" />
                          )
                        } />
                        <Route path="/admin-panel" element={
                          user && hasRequiredRole(['admin']) ? (
                            <AnimatedPage><AdminPanel /></AnimatedPage>
                          ) : (
                            <Navigate to="/dashboard" />
                          )
                        } />
                        <Route path="/admin-analytics" element={
                          user && hasRequiredRole(['admin']) ? (
                            <AnimatedPage><AdminAnalytics /></AnimatedPage>
                          ) : (
                            <Navigate to="/dashboard" />
                          )
                        } />
                        
                        {/* Learning Path route */}
                        <Route path="/learning-path" element={
                          user ? (
                            <AnimatedPage><LearningPath /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        
                        {/* Add the certifications route */}
                        <Route path="/certifications" element={
                          isAuthenticated ? (
                            <AnimatedPage><CertificationsAchievements /></AnimatedPage>
                          ) : (
                            <Navigate to="/login" />
                          )
                        } />
                        
                        {/* 404 route */}
                        <Route path="*" element={
                          <AnimatedPage><NotFound /></AnimatedPage>
                        } />
                      </Routes>
                    </AnimatePresence>
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>
          </RTL>
        </ToastProvider>
      </ThemeContextProvider>
    </ThemeProvider>
  );
};

// Main App component
const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContextProvider>
          <AuthProvider>
            <ThemeContextProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </ThemeContextProvider>
          </AuthProvider>
        </AppContextProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App;
