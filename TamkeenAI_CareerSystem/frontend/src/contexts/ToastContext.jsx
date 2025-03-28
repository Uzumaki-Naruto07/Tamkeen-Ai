import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';
import { useTranslation } from 'react-i18next';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const { t } = useTranslation();
  const [toast, setToast] = useState({
    open: false,
    message: '',
    subtitle: '',
    severity: 'info',
    duration: 5000,
    action: null,
  });

  // Store notifications for viewing later
  const [notifications, setNotifications] = useState([]);

  const showToast = useCallback(({
    message,
    subtitle = '',
    severity = 'info',
    duration = 5000,
    action = null,
    save = false
  }) => {
    setToast({
      open: true,
      message,
      subtitle,
      severity,
      duration,
      action,
    });

    // Save to notifications list if requested
    if (save) {
      const newNotification = {
        id: Date.now(),
        message,
        subtitle,
        severity,
        timestamp: new Date(),
        read: false,
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      // Limit to last 50 notifications
      if (notifications.length > 50) {
        setNotifications(prev => prev.slice(0, 50));
      }
      
      // Optional: Save to localStorage for persistence
      try {
        const savedNotifications = localStorage.getItem('notifications');
        const parsedNotifications = savedNotifications ? JSON.parse(savedNotifications) : [];
        const updatedNotifications = [newNotification, ...parsedNotifications].slice(0, 50);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      } catch (err) {
        console.error('Error saving notification to localStorage:', err);
      }
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({
      ...prev,
      open: false,
    }));
  }, []);

  // Convenience methods for different toast types
  const showSuccessToast = useCallback((message, options = {}) => {
    showToast({ message, severity: 'success', ...options });
  }, [showToast]);

  const showErrorToast = useCallback((message, options = {}) => {
    showToast({ message, severity: 'error', ...options });
  }, [showToast]);

  const showWarningToast = useCallback((message, options = {}) => {
    showToast({ message, severity: 'warning', ...options });
  }, [showToast]);

  const showInfoToast = useCallback((message, options = {}) => {
    showToast({ message, severity: 'info', ...options });
  }, [showToast]);

  // Manage notifications list
  const markNotificationAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    // Update localStorage
    try {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);
        const updatedNotifications = parsedNotifications.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        );
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      }
    } catch (err) {
      console.error('Error updating notification in localStorage:', err);
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    
    // Clear from localStorage
    try {
      localStorage.removeItem('notifications');
    } catch (err) {
      console.error('Error clearing notifications from localStorage:', err);
    }
  }, []);

  // Load notifications from localStorage on mount
  React.useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (err) {
      console.error('Error loading notifications from localStorage:', err);
    }
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        hideToast,
        showSuccessToast,
        showErrorToast,
        showWarningToast,
        showInfoToast,
        notifications,
        markNotificationAsRead,
        clearNotifications,
      }}
    >
      {children}
      <Toast
        open={toast.open}
        message={toast.message}
        subtitle={toast.subtitle}
        severity={toast.severity}
        duration={toast.duration}
        onClose={hideToast}
        action={toast.action}
      />
    </ToastContext.Provider>
  );
};

export default ToastContext; 