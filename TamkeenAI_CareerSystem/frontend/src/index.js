import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize API proxy utility to fix CORS issues
import { initApiProxy } from './utils/apiProxy';
initApiProxy();

// Initialize analytics and monitoring services
import './services/analytics';
import { initializeErrorTracking } from './services/errorTracking';

// Initialize error tracking for production
if (process.env.NODE_ENV === 'production') {
  initializeErrorTracking();
}

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  const reportWebVitals = await import('./reportWebVitals').then(module => module.default);
  const vitalsCallback = await import('./services/vitals').then(module => module.reportToAnalytics);
  reportWebVitals(vitalsCallback);
}

// Create the React 18+ root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app wrapped in StrictMode for additional development checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enable hot module replacement for smoother development experience
if (import.meta.hot) {
  import.meta.hot.accept();
}
