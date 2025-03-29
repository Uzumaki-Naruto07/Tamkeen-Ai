import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';

const RequireAuth = ({ children }) => {
  const { isAuthenticated, loading } = useUser();
  const location = useLocation();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner message="Verifying authentication..." />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to the login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

export default RequireAuth; 