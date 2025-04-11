import './reactRouterFlags.js';

import React from 'react';
// Import from our wrapper instead of directly from react-dom/client
import { createRoot } from './reactDomClient';
import App from './App';
import './index.css';
import { startTransition } from 'react';

// Error handler for the entire application
const handleError = (error) => {
  console.error('Application Error:', error);
  
  // Find loading container
  const loadingContainer = document.querySelector('.loading-container');
  if (loadingContainer) {
    loadingContainer.innerHTML = `
      <div style="color: #ef4444; padding: 20px; text-align: center;">
        <h2>Something went wrong</h2>
        <p>${error.message || 'An unexpected error occurred'}</p>
        <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background-color: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Reload Application
        </button>
      </div>
    `;
  }
};

try {
  // Create root and render app
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error('Root element not found in the document');
  }
  
  // Use our wrapper's createRoot
  const root = createRoot(rootElement);
  
  // Wrap the app in startTransition to work with the React Router future flags
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  
  // Log that rendering has started
  console.log('React application rendering started');
  
} catch (error) {
  handleError(error);
} 