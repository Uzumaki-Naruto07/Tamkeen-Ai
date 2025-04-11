// This file serves as a wrapper for react-dom/client
// It allows us to handle the client import differently in different environments

import React from 'react';

// Import directly from the package's client.js file
import * as ReactDOMClient from 'react-dom/client';

// Re-export everything from the client module
export const createRoot = ReactDOMClient.createRoot;
export const hydrateRoot = ReactDOMClient.hydrateRoot;

// Add a fallback in case the client module fails to load
if (!ReactDOMClient.createRoot) {
  console.warn('ReactDOM client module not found, using fallback');
  
  // Override the createRoot export with fallback
  Object.assign(exports, {
    createRoot: (container) => {
      return {
        render: (element) => {
          // Use the standard ReactDOM.render for React 17
          const ReactDOM = require('react-dom');
          ReactDOM.render(React.createElement(React.StrictMode, null, element), container);
          
          return {
            unmount: () => {
              ReactDOM.unmountComponentAtNode(container);
            }
          };
        }
      };
    }
  });
}

export default ReactDOMClient; 