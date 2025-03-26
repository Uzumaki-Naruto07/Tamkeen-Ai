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
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy-loaded page components for code splitting
const ResumeAnalysis = lazy(() => import('./pages/ResumeAnalysis'));
const CareerAssessment = lazy(() => import('./pages/CareerAssessment'));
const CareerExplorer = lazy(() => import('./pages/CareerExplorer'));
const InterviewResults = lazy(() => import('./pages/InterviewResults'));
const AIJobJourney = lazy(() => import('./pages/AIJobJourney'));
const GamifiedProgress = lazy(() => import('./pages/GamifiedProgress'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));
const CoverLetter = lazy(() => import('./pages/CoverLetter'));
const JobSearch = lazy(() => import('./pages/JobSearch'));
const Networking = lazy(() => import('./pages/Networking'));
const MockInterview = lazy(() => import('./pages/MockInterview'));
const Profile = lazy(() => import('./pages/Profile'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Admin = lazy(() => import('./pages/Admin'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
      <RTL enabled={language === 'ar'}>
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
                      user ? (
                        <Navigate to="/" />
                      ) : (
                        <AnimatedPage><Login /></AnimatedPage>
                      )
                    } />
                    <Route path="/register" element={
                      user ? (
                        <Navigate to="/" />
                      ) : (
                        <AnimatedPage><Register /></AnimatedPage>
                      )
                    } />
                    
                    {/* Protected routes */}
                    <Route path="/" element={
                      user ? (
                        <Dashboard />
                      ) : (
                        <Navigate to="/login" />
                      )
                    } />
                    
                    {/* Main application routes - all require authentication */}
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
                    <Route path="/networking" element={
                      user ? (
                        <AnimatedPage><Networking /></AnimatedPage>
                      ) : (
                        <Navigate to="/login" />
                      )
                    } />
                    <Route path="/mock-interview" element={
                      user ? (
                        <AnimatedPage><MockInterview /></AnimatedPage>
                      ) : (
                        <Navigate to="/login" />
                      )
                    } />
                    <Route path="/profile" element={
                      user ? (
                        <AnimatedPage><Profile /></AnimatedPage>
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
                    <Route path="/notifications" element={
                      user ? (
                        <AnimatedPage><Notifications /></AnimatedPage>
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
                    
                    {/* Admin route with role-based protection */}
                    <Route path="/admin" element={
                      user ? (
                        hasRequiredRole(['admin', 'superadmin']) ? (
                          <AnimatedPage><Admin /></AnimatedPage>
                        ) : (
                          <AnimatedPage><NotFound statusCode={403} message="Access Denied" /></AnimatedPage>
                        )
                      ) : (
                        <Navigate to="/login" />
                      )
                    } />
                    
                    {/* 404 fallback route */}
                    <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
                  </Routes>
                </AnimatePresence>
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </RTL>
    </ThemeProvider>
  );
};

// Main App component with Context Provider and Router
const App = () => {
  return (
    <AppContextProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AppContextProvider>
  );
};

export default App;
