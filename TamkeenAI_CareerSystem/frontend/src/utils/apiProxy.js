/**
 * API Proxy Utility
 * 
 * This utility intercepts XMLHttpRequest and fetch API calls to backend services
 * and routes them through the local proxy to avoid CORS issues.
 */

// List of backend hostnames that should be proxied
const BACKEND_HOSTNAMES = [
  'tamkeen-main-api.onrender.com',
  'tamkeen-interview-api.onrender.com',
  'tamkeen-predict-api.onrender.com',
  'tamkeen-upload-server.onrender.com'
];

/**
 * Patches the XMLHttpRequest to intercept direct backend API calls
 */
export const patchXmlHttpRequest = () => {
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
    let newUrl = transformUrl(url);
    return originalOpen.call(this, method, newUrl, async, user, password);
  };
};

/**
 * Patches the fetch API to intercept direct backend API calls
 */
export const patchFetch = () => {
  const originalFetch = window.fetch;
  window.fetch = function(resource, init) {
    // If the resource is a string URL, transform it
    if (typeof resource === 'string') {
      resource = transformUrl(resource);
    } 
    // If the resource is a Request object, create a new one with the transformed URL
    else if (resource instanceof Request) {
      const newUrl = transformUrl(resource.url);
      const newRequest = new Request(newUrl, {
        method: resource.method,
        headers: resource.headers,
        body: resource.body,
        mode: resource.mode,
        credentials: resource.credentials,
        cache: resource.cache,
        redirect: resource.redirect,
        referrer: resource.referrer,
        referrerPolicy: resource.referrerPolicy,
        integrity: resource.integrity,
        keepalive: resource.keepalive,
        signal: resource.signal
      });
      resource = newRequest;
    }
    return originalFetch.call(window, resource, init);
  };
};

/**
 * Transform backend URLs to relative URLs for proxy routing
 */
export const transformUrl = (url) => {
  try {
    // Skip transformation for relative URLs
    if (!url.startsWith('http')) return url;
    
    const urlObj = new URL(url);
    const isBackendUrl = BACKEND_HOSTNAMES.some(hostname => 
      urlObj.hostname.includes(hostname)
    );
    
    if (isBackendUrl) {
      const pathWithSearch = urlObj.pathname + urlObj.search;
      // If the path already starts with /api, use it as is
      // Otherwise prefix it with /api
      const apiPath = pathWithSearch.startsWith('/api') 
        ? pathWithSearch 
        : `/api${pathWithSearch}`;
      
      console.log(`API Proxy: Redirecting ${url} → ${apiPath}`);
      return apiPath;
    }
  } catch (e) {
    console.error('Error transforming URL:', e);
  }
  
  return url;
};

/**
 * Initialize both XMLHttpRequest and fetch API patches
 */
export const initApiProxy = () => {
  console.log('Initializing API proxy to avoid CORS issues');
  patchXmlHttpRequest();
  patchFetch();
};

export default {
  initApiProxy,
  patchXmlHttpRequest,
  patchFetch,
  transformUrl
}; 