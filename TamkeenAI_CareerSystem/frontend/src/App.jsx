import React, { Suspense, lazy, startTransition } from 'react';
import { 
  createBrowserRouter, 
  RouterProvider, 
  Route, 
  createRoutesFromElements, 
  Navigate, 
  Outlet
} from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { AppContextProvider } from './context/AppContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import RequireAuth from './components/auth/RequireAuth';

// Layout component
import MainLayout from './components/layout/MainLayout';

// Direct imports for essential pages to reduce initial load time
import Dashboard from './pages/Dashboard';
import ArabicDashboard from './pages/ArabicDashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy-loaded page components with error handling
const lazyLoad = (importFn) => {
  const LazyComponent = lazy(importFn);
  return (props) => (
    <Suspense fallback={<SuspenseFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

const ForgotPassword = lazyLoad(() => import('./pages/ForgotPassword'));
const ResumeAnalysis = lazyLoad(() => import('./pages/ResumeAnalysis'));
const AdminPanel = lazyLoad(() => import('./pages/AdminPanel'));
const NotFound = lazyLoad(() => import('./pages/NotFound'));

// Suspense fallback component
const SuspenseFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <LoadingSpinner message="Loading page..." />
  </div>
);

// Plain layout without navigation, for auth pages
const AuthLayout = () => {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
};

// Public route component
const PublicRoute = ({ element }) => {
  return element;
};

// Protected route component that handles startTransition
const ProtectedRoute = ({ element }) => {
  const [ui, setUi] = React.useState(null);
  
  React.useEffect(() => {
    startTransition(() => {
      setUi(<RequireAuth>{element}</RequireAuth>);
    });
  }, [element]);
  
  return ui;
};

// Create router with routes
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Auth routes without navigation */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/register" element={<PublicRoute element={<Register />} />} />
        <Route path="/forgot-password" element={<PublicRoute element={<ForgotPassword />} />} />
      </Route>
      
      {/* Protected routes with navigation */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/dashboard-ar" element={<ProtectedRoute element={<ArabicDashboard />} />} />
        <Route path="/resume-analysis" element={<ProtectedRoute element={<ResumeAnalysis />} />} />
        
        {/* Admin routes */}
        <Route path="/admin-panel" element={<ProtectedRoute element={<AdminPanel />} />} />
        
        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </>
  )
);

const App = () => {
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <I18nextProvider i18n={i18n}>
          <ThemeContextProvider>
            <CssBaseline />
            <AppContextProvider>
              <RouterProvider router={router} fallbackElement={<SuspenseFallback />} />
            </AppContextProvider>
          </ThemeContextProvider>
        </I18nextProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

export default App;
