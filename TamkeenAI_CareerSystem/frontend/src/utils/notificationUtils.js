import { NOTIFICATION_TYPES } from './constants';

// Notification class
class Notification {
  constructor() {
    this.listeners = new Set();
    this.notifications = [];
    this.maxNotifications = 5;
  }

  // Add notification listener
  addListener(listener) {
    this.listeners.add(listener);
  }

  // Remove notification listener
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  // Show notification
  show(message, type = NOTIFICATION_TYPES.INFO, options = {}) {
    const notification = {
      id: Date.now(),
      message,
      type,
      ...options,
      timestamp: new Date(),
    };

    this.notifications.push(notification);

    // Remove oldest notification if max limit reached
    if (this.notifications.length > this.maxNotifications) {
      this.notifications.shift();
    }

    // Notify listeners
    this.notifyListeners();

    // Auto-remove after duration if specified
    if (options.duration !== false) {
      setTimeout(() => {
        this.remove(notification.id);
      }, options.duration || 5000);
    }

    return notification.id;
  }

  // Show success notification
  success(message, options = {}) {
    return this.show(message, NOTIFICATION_TYPES.SUCCESS, options);
  }

  // Show error notification
  error(message, options = {}) {
    return this.show(message, NOTIFICATION_TYPES.ERROR, options);
  }

  // Show warning notification
  warning(message, options = {}) {
    return this.show(message, NOTIFICATION_TYPES.WARNING, options);
  }

  // Show info notification
  info(message, options = {}) {
    return this.show(message, NOTIFICATION_TYPES.INFO, options);
  }

  // Remove notification
  remove(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
    }
  }

  // Remove all notifications
  removeAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Get all notifications
  getAll() {
    return [...this.notifications];
  }

  // Get notifications by type
  getByType(type) {
    return this.notifications.filter(n => n.type === type);
  }

  // Get unread notifications
  getUnread() {
    return this.notifications.filter(n => !n.read);
  }

  // Mark notification as read
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => {
      n.read = true;
    });
    this.notifyListeners();
  }

  // Set max notifications
  setMaxNotifications(max) {
    this.maxNotifications = max;
    while (this.notifications.length > max) {
      this.notifications.shift();
    }
    this.notifyListeners();
  }

  // Get max notifications
  getMaxNotifications() {
    return this.maxNotifications;
  }

  // Get notification count
  getCount() {
    return this.notifications.length;
  }

  // Get unread notification count
  getUnreadCount() {
    return this.getUnread().length;
  }

  // Check if there are unread notifications
  hasUnread() {
    return this.getUnreadCount() > 0;
  }

  // Clear old notifications
  clearOld(age = 24 * 60 * 60 * 1000) { // Default: 24 hours
    const now = Date.now();
    this.notifications = this.notifications.filter(n => {
      return now - n.timestamp.getTime() < age;
    });
    this.notifyListeners();
  }

  // Persist notifications to storage
  persist() {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to persist notifications:', error);
    }
  }

  // Load notifications from storage
  load() {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored).map(n => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  // Notify listeners
  notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.notifications);
    });
  }

  // Subscribe to notifications
  subscribe(listener) {
    this.addListener(listener);
    return () => this.removeListener(listener);
  }

  // Create notification with custom options
  create(message, type = NOTIFICATION_TYPES.INFO, options = {}) {
    return {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      read: false,
      ...options,
    };
  }

  // Format notification message
  formatMessage(message, params = {}) {
    if (typeof message === 'string') {
      return message.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match;
      });
    }
    return message;
  }

  // Group notifications by type
  groupByType() {
    return this.notifications.reduce((groups, notification) => {
      const type = notification.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(notification);
      return groups;
    }, {});
  }

  // Group notifications by date
  groupByDate() {
    return this.notifications.reduce((groups, notification) => {
      const date = notification.timestamp.toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
      return groups;
    }, {});
  }

  // Filter notifications
  filter(predicate) {
    return this.notifications.filter(predicate);
  }

  // Sort notifications
  sort(comparator) {
    return [...this.notifications].sort(comparator);
  }

  // Search notifications
  search(query) {
    const searchQuery = query.toLowerCase();
    return this.notifications.filter(notification => {
      return notification.message.toLowerCase().includes(searchQuery);
    });
  }

  // Batch operations
  batch(operations) {
    operations.forEach(operation => {
      switch (operation.type) {
        case 'add':
          this.show(operation.message, operation.notificationType, operation.options);
          break;
        case 'remove':
          this.remove(operation.id);
          break;
        case 'markAsRead':
          this.markAsRead(operation.id);
          break;
        case 'clear':
          this.removeAll();
          break;
        default:
          break;
      }
    });
  }

  // Export notifications
  export() {
    return JSON.stringify(this.notifications, null, 2);
  }

  // Import notifications
  import(data) {
    try {
      const notifications = JSON.parse(data);
      this.notifications = notifications.map(n => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to import notifications:', error);
      return false;
    }
  }
}

// Create notification instance
const notification = new Notification();

// Export notification utilities
export default {
  notification,
}; 