import React, { Suspense, lazy, useEffect, useState } from 'react';
import { 
  createBrowserRouter, 
  RouterProvider, 
  Route, 
  createRoutesFromElements, 
  Navigate, 
  Outlet,
  useLocation
} from 'react-router-dom';
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

// Lazy-loaded page components for code splitting
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResumeAnalysis = lazy(() => import('./pages/ResumeAnalysis'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
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
  const { theme, language, isAuthenticated, loading, userRoles } = useAppContext();
  const location = useLocation();
  const [initializing, setInitializing] = useState(true);
  
  // Create MUI theme based on app context settings
  const appTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: '#6200ee', // Using purple as primary color
      },
      secondary: {
        main: '#03dac6',
      },
    },
    direction: language === 'ar' ? 'rtl' : 'ltr',
    typography: {
      fontFamily: language === 'ar' ? 
        '"Tajawal", "Roboto", "Helvetica", "Arial", sans-serif' : 
        '"Roboto", "Helvetica", "Arial", sans-serif',
    }
  });
  
  useEffect(() => {
    if (!loading) {
      setInitializing(false);
    }
  }, [loading]);
  
  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoadingSpinner message="Initializing application..." />
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
                      <Outlet />
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

// Wrapper components for authentication
const PublicRoute = ({ element }) => {
  const { user } = useAppContext();
  return !user ? element : <Navigate to="/dashboard" />;
};

const ProtectedRoute = ({ element, requiredRoles = [] }) => {
  const { user, userRoles } = useAppContext();
  
  // Check for authentication
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Check for required roles
  if (requiredRoles.length > 0 && !requiredRoles.some(role => userRoles.includes(role))) {
    return <Navigate to="/unauthorized" />;
  }
  
  return element;
};

// Create router with routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppContent />}>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute element={<AnimatedPage><Login /></AnimatedPage>} />} />
      <Route path="/register" element={<PublicRoute element={<AnimatedPage><Register /></AnimatedPage>} />} />
      <Route path="/forgot-password" element={<PublicRoute element={<AnimatedPage><ForgotPassword /></AnimatedPage>} />} />
      
      {/* Protected routes */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<ProtectedRoute element={<AnimatedPage><Dashboard /></AnimatedPage>} />} />
      <Route path="/resume-analysis" element={<ProtectedRoute element={<AnimatedPage><ResumeAnalysis /></AnimatedPage>} />} />
      
      {/* Admin routes */}
      <Route path="/admin-panel" element={<ProtectedRoute element={<AnimatedPage><AdminPanel /></AnimatedPage>} requiredRoles={['admin']} />} />
      
      {/* 404 - Not Found */}
      <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
    </Route>
  )
);

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContextProvider>
          <ThemeContextProvider>
            <RouterProvider router={router} />
          </ThemeContextProvider>
        </AppContextProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App;
