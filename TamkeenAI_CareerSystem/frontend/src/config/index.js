// Since your project uses ES modules
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001') + '/api';

// Add any other configuration variables here
export const APP_VERSION = '1.0.0';
export const APP_ENV = import.meta.env.MODE || 'development';
