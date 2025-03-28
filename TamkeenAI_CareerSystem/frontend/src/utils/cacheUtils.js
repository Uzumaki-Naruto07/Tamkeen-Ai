// Cache configuration
const CACHE_CONFIG = {
  DEFAULT_TTL: 3600, // 1 hour in seconds
  MAX_ITEMS: 100,
};

// Cache storage
class Cache {
  constructor() {
    this.storage = new Map();
  }

  // Set cache item
  set(key, value, ttl = CACHE_CONFIG.DEFAULT_TTL) {
    const item = {
      value,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
    };

    this.storage.set(key, item);
    this.cleanup();
  }

  // Get cache item
  get(key) {
    const item = this.storage.get(key);
    if (!item) return null;

    const now = Date.now();
    const expired = now - item.timestamp > item.ttl;

    if (expired) {
      this.storage.delete(key);
      return null;
    }

    return item.value;
  }

  // Delete cache item
  delete(key) {
    this.storage.delete(key);
  }

  // Clear all cache
  clear() {
    this.storage.clear();
  }

  // Cleanup expired items
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.storage.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.storage.delete(key);
      }
    }
  }

  // Get cache size
  size() {
    return this.storage.size;
  }
}

// Create cache instance
const cache = new Cache();

// Cache operations
export const setCacheItem = (key, value, ttl) => {
  cache.set(key, value, ttl);
};

export const getCacheItem = (key) => {
  return cache.get(key);
};

export const removeCacheItem = (key) => {
  cache.delete(key);
};

export const clearCache = () => {
  cache.clear();
};

// Local storage operations
export const setLocalStorageItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorageItem = (key) => {
  try {
    const serializedValue = localStorage.getItem(key);
    return serializedValue ? JSON.parse(serializedValue) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

export const removeLocalStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};

// Session storage operations
export const setSessionStorageItem = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    sessionStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error('Error saving to sessionStorage:', error);
  }
};

export const getSessionStorageItem = (key) => {
  try {
    const serializedValue = sessionStorage.getItem(key);
    return serializedValue ? JSON.parse(serializedValue) : null;
  } catch (error) {
    console.error('Error reading from sessionStorage:', error);
    return null;
  }
};

export const removeSessionStorageItem = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from sessionStorage:', error);
  }
};

export const clearSessionStorage = () => {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }
};

// Cache with TTL
export const setCacheWithTTL = (key, value, ttl) => {
  const item = {
    value,
    timestamp: Date.now(),
    ttl,
  };
  setLocalStorageItem(key, item);
};

export const getCacheWithTTL = (key) => {
  const item = getLocalStorageItem(key);
  if (!item) return null;

  const now = Date.now();
  const expired = now - item.timestamp > item.ttl;

  if (expired) {
    removeLocalStorageItem(key);
    return null;
  }

  return item.value;
};

// Cache with version
export const setCacheWithVersion = (key, value, version) => {
  const item = {
    value,
    version,
    timestamp: Date.now(),
  };
  setLocalStorageItem(key, item);
};

export const getCacheWithVersion = (key, currentVersion) => {
  const item = getLocalStorageItem(key);
  if (!item) return null;

  if (item.version !== currentVersion) {
    removeLocalStorageItem(key);
    return null;
  }

  return item.value;
};

// Cache with dependencies
export const setCacheWithDependencies = (key, value, dependencies) => {
  const item = {
    value,
    dependencies,
    timestamp: Date.now(),
  };
  setLocalStorageItem(key, item);
};

export const getCacheWithDependencies = (key, currentDependencies) => {
  const item = getLocalStorageItem(key);
  if (!item) return null;

  const dependenciesChanged = Object.entries(currentDependencies).some(
    ([key, value]) => item.dependencies[key] !== value
  );

  if (dependenciesChanged) {
    removeLocalStorageItem(key);
    return null;
  }

  return item.value;
};

// Cache with compression
export const compressData = (data) => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('Error compressing data:', error);
    return null;
  }
};

export const decompressData = (compressedData) => {
  try {
    return JSON.parse(compressedData);
  } catch (error) {
    console.error('Error decompressing data:', error);
    return null;
  }
};

// Cache with encryption
export const encryptData = (data, key) => {
  try {
    // Implement encryption logic here
    return data;
  } catch (error) {
    console.error('Error encrypting data:', error);
    return null;
  }
};

export const decryptData = (encryptedData, key) => {
  try {
    // Implement decryption logic here
    return encryptedData;
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
};

// Cache with persistence
export const persistCache = (key, value) => {
  try {
    setLocalStorageItem(key, value);
    setSessionStorageItem(key, value);
  } catch (error) {
    console.error('Error persisting cache:', error);
  }
};

export const getPersistedCache = (key) => {
  try {
    return getLocalStorageItem(key) || getSessionStorageItem(key);
  } catch (error) {
    console.error('Error getting persisted cache:', error);
    return null;
  }
};

// Cache with invalidation
export const invalidateCache = (pattern) => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.match(pattern)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
};