import React, { Suspense, lazy, startTransition, useEffect } from 'react';

// Import router flags before React Router
import './reactRouterFlags.js';

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
import RouteErrorBoundary from './components/common/RouteErrorBoundary';
import { I18nextProvider } from 'react-i18next';
import i18n, { getDirection, changeLanguage } from './i18n';
import RequireAuth from './components/auth/RequireAuth';
// Import ToastContainer
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Import CacheProvider and rtlStylesPlugin for RTL support
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

// Layout component
import MainLayout from './components/layout/MainLayout';

// Direct imports for essential pages to reduce initial load time
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import UaePassLogin from './pages/UaePassLogin';

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
const UserProfile = lazyLoad(() => import('./pages/UserProfile'));
const NotFound = lazyLoad(() => import('./pages/NotFound'));
// Add JobSearch components
const JobSearch = lazyLoad(() => import('./pages/JobSearch'));
const JobSearchDashboard = lazyLoad(() => import('./pages/JobSearchDashboard'));
const JobDetails = lazyLoad(() => import('./pages/JobDetails'));
const SavedJobs = lazyLoad(() => import('./pages/SavedJobs'));
// Add AI Coach components
const AIInterviewCoach = lazyLoad(() => import('./pages/AIInterviewCoach'));
const AllInterviewCoach = lazyLoad(() => import('./pages/AllInterviewCoach'));
const CoachProfile = lazyLoad(() => import('./pages/CoachProfile'));
const BookingConfirmation = lazyLoad(() => import('./pages/BookingConfirmation'));
// Add MockInterview component
const MockInterview = lazyLoad(() => import('./pages/MockInterview'));
// Add MyBookings component
const MyBookings = lazyLoad(() => import('./pages/MyBookings'));
// Add Checkout component
const Checkout = lazyLoad(() => import('./pages/Checkout'));
// Add Notifications component
const Notifications = lazyLoad(() => import('./pages/Notifications'));
// Add Package Confirmation component
const PackageConfirmation = lazyLoad(() => import('./pages/PackageConfirmation'));
// Add ResumeBuilder and SkillsAssessment components
const ResumeBuilder = lazyLoad(() => import('./pages/ResumeBuilder'));
const ResumePage = lazyLoad(() => import('./pages/ResumePage'));
const SkillsAssessment = lazyLoad(() => import('./pages/SkillsAssessment'));
// Add ResumeScoreTracker
const ResumeScoreTracker = lazyLoad(() => import('./pages/ResumeScoreTracker'));
// Add CertificationsAchievements component
const CertificationsAchievements = lazyLoad(() => import('./pages/CertificationsAchievements'));
// Add Settings component
const Settings = lazyLoad(() => import('./pages/Settings'));
// Add LinkedIn Automation component
const LinkedInAutomation = lazyLoad(() => import('./pages/LinkedInAutomation'));
// Add Learning Resources component
const LearningResources = lazyLoad(() => import('./pages/LearningResources'));
// Add InterviewResults component
const InterviewResults = lazyLoad(() => import('./pages/InterviewResults'));
// Add ApplicationTips component
const ApplicationTips = lazyLoad(() => import('./pages/ApplicationTips'));
// Add GamifiedProgress component
const GamifiedProgress = lazyLoad(() => import('./pages/GamifiedProgress'));
// Add CareerAssessment component
const CareerAssessment = lazyLoad(() => import('./pages/CareerAssessment'));

// Import the PredictApiDemo component
import PredictApiDemo from './components/ats/PredictApiDemo';

// Suspense fallback component
const SuspenseFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <LoadingSpinner message="Loading page..." />
  </div>
);

// Wrap UserProfile with specific error handling since it has known issues
const UserProfileWithErrorBoundary = (props) => (
  <ErrorBoundary>
    <UserProfile {...props} />
  </ErrorBoundary>
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

// Create rtl cache for Material-UI
const createRtlCache = () => {
  return createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
  });
};

// Create ltr cache for Material-UI
const createLtrCache = () => {
  return createCache({
    key: 'mui',
  });
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
        <Route path="/uaepass-login" element={<PublicRoute element={<UaePassLogin />} />} />
      </Route>
      
      {/* Protected routes with navigation */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/resume-analysis" element={<ProtectedRoute element={<ResumeAnalysis />} />} />
        
        {/* Add Resume Builder and Skills Assessment routes */}
        <Route path="/resume-builder" element={<ProtectedRoute element={<ResumeBuilder />} />} />
        <Route path="/resumePage/:resumeId?" element={<ProtectedRoute element={<ResumePage />} />} />
        <Route path="/resume-score-tracker" element={<ProtectedRoute element={<ResumeScoreTracker />} />} />
        <Route path="/skills-assessment" element={<ProtectedRoute element={<SkillsAssessment />} />} />
        
        {/* Add missing routes */}
        <Route path="/gamified-progress" element={<ProtectedRoute element={<GamifiedProgress />} />} />
        <Route path="/career-assessment" element={<ProtectedRoute element={<CareerAssessment />} />} />
        
        {/* Add Job routes */}
        <Route path="/jobs" element={<Navigate to="/job-search" replace />} />
        <Route 
          path="/job-search" 
          element={<ProtectedRoute element={<JobSearch />} />} 
          errorElement={<RouteErrorBoundary />}
        />
        <Route 
          path="/job-search-dashboard" 
          element={<ProtectedRoute element={<JobSearchDashboard />} />} 
          errorElement={<RouteErrorBoundary />}
        />
        <Route 
          path="/jobs/:jobId" 
          element={<ProtectedRoute element={<JobDetails />} />} 
          errorElement={<RouteErrorBoundary />}
        />
        <Route 
          path="/saved-jobs" 
          element={<ProtectedRoute element={<SavedJobs />} />} 
          errorElement={<RouteErrorBoundary />}
        />
        
        {/* Add Resources routes */}
        <Route 
          path="/resources/application-tips" 
          element={<ProtectedRoute element={<ApplicationTips />} />} 
          errorElement={<RouteErrorBoundary />}
        />
        
        {/* Add LinkedIn Automation route */}
        <Route 
          path="/automation-linkedin" 
          element={<ProtectedRoute element={<LinkedInAutomation />} />} 
          errorElement={<RouteErrorBoundary />}
        />
        
        {/* Add Learning Resources route */}
        <Route 
          path="/learning" 
          element={<ProtectedRoute element={<LearningResources />} />} 
          errorElement={<RouteErrorBoundary />}
        />
        
        {/* Redirect AI Recommendations to Mock Interview */}
        <Route 
          path="/ai-recommendations" 
          element={<Navigate to="/ai-coach/mock-interview" replace />} 
        />
        
        {/* Admin routes */}
        <Route path="/admin-panel" element={<ProtectedRoute element={<AdminPanel />} />} />
        
        {/* AI Coach routes */}
        <Route path="/ai-coach" element={<ProtectedRoute element={<AllInterviewCoach />} />} />
        <Route path="/ai-coach/interview" element={<ProtectedRoute element={<AIInterviewCoach />} />} />
        <Route path="/ai-coach/mock-interview" element={<ProtectedRoute element={<MockInterview />} />} />
        <Route path="/interview-results/:interviewId" element={<ProtectedRoute element={<InterviewResults />} />} />
        <Route path="/ai-coach/profile/:coachId" element={<ProtectedRoute element={<CoachProfile />} />} />
        <Route path="/ai-coach/checkout/:coachId" element={<ProtectedRoute element={<Checkout />} />} />
        <Route path="/ai-coach/checkout/package" element={<ProtectedRoute element={<Checkout />} />} />
        <Route path="/ai-coach/booking/:coachId" element={<ProtectedRoute element={<BookingConfirmation />} />} />
        <Route path="/ai-coach/package-confirmation" element={<ProtectedRoute element={<PackageConfirmation />} />} />
        <Route path="/my-bookings" element={<ProtectedRoute element={<MyBookings />} />} />
        <Route path="/notifications" element={<ProtectedRoute element={<Notifications />} />} />
        
        {/* User Profile routes */}
        <Route path="/user-profile" element={<ProtectedRoute element={<UserProfileWithErrorBoundary />} />} />
        <Route path="/user-profile/:username" element={<ProtectedRoute element={<UserProfileWithErrorBoundary />} />} />
        
        {/* Certifications and Achievements route */}
        <Route path="/achievements" element={<ProtectedRoute element={<CertificationsAchievements />} />} />
        
        {/* Settings route */}
        <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
        
        {/* Redirect /profile to /user-profile to fix 404 */}
        <Route path="/profile" element={<Navigate to="/user-profile" replace />} />
        <Route path="/profile/:username" element={<Navigate to={params => `/user-profile/${params.username}`} replace />} />
        
        {/* Add the PredictApiDemo route */}
        <Route path="/predict-api-demo" element={<ProtectedRoute element={<PredictApiDemo />} />} />
        
        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} errorElement={<RouteErrorBoundary />} />
      </Route>
    </>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true
    }
  }
);

function App() {
  // Set Arabic as default language when app initializes
  useEffect(() => {
    changeLanguage('ar');
  }, []);

  // Create the cache based on the current direction
  const isRtl = getDirection() === 'rtl';
  const cache = isRtl ? createRtlCache() : createLtrCache();

  return (
    <React.StrictMode>
      <ErrorBoundary>
        <I18nextProvider i18n={i18n}>
          <CacheProvider value={cache}>
            <ThemeContextProvider>
              <CssBaseline />
              <AppContextProvider>
                {/* Add Toast container for notifications, with RTL support */}
                <ToastContainer 
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={isRtl}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
                <RouterProvider 
                  router={router} 
                  fallback={<SuspenseFallback />}
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                    v7_fetcherPersist: true,
                    v7_normalizeFormMethod: true,
                    v7_partialHydration: true,
                    v7_skipActionErrorRevalidation: true
                  }}
                />
              </AppContextProvider>
            </ThemeContextProvider>
          </CacheProvider>
        </I18nextProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

export default App;
