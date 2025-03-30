// This file must be imported before any react-router-dom imports
// It sets the future flags for React Router v7 compatibility

window.__reactRouterFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true, 
  v7_partialHydration: true,
  v7_skipActionErrorRevalidation: true
};

export default window.__reactRouterFutureFlags; 