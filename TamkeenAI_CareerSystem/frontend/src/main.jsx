import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { startTransition } from 'react';

// Fix for React Router warnings by setting future flags
window.__reactRouterFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true 
};

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Wrap the app in startTransition to work with the React Router future flags
root.render(
  <React.StrictMode>
    {startTransition(() => <App />)}
  </React.StrictMode>
); 