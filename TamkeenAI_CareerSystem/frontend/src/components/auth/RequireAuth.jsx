import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';

const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useUser();
  const location = useLocation();
  const [showSpinner, setShowSpinner] = useState(false);
  
  // Only show the spinner after a short delay, and don't show it at all
  // if we're on profile-related pages where frequent saves happen
  useEffect(() => {
    if (!loading) {
      setShowSpinner(false);
      return;
    }
    
    // Don't show spinner for profile pages
    const isProfilePage = location.pathname.includes('/profile');
    
    if (isProfilePage) {
      // Don't show spinner for profile pages at all
      return;
    }
    
    // For other pages, show spinner after a short delay
    const timer = setTimeout(() => {
      if (loading) {
        setShowSpinner(true);
      }
    }, 500); // delay showing spinner by 500ms
    
    return () => clearTimeout(timer);
  }, [loading, location.pathname]);
  
  if (loading) {
    // Only show loading spinner if showSpinner is true
    if (showSpinner) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <LoadingSpinner message="Verifying authentication..." />
        </div>
      );
    }
    
    // Otherwise render nothing while loading
    return <div style={{ height: '100vh' }}></div>;
  }
  
  if (!isAuthenticated) {
    // Redirect to the login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

export default RequireAuth; 