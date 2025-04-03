import { useContext, createContext, useState, useEffect } from 'react';
import apiEndpoints from '../api/apiEndpoints';

// Create Auth Context
const AuthContext = createContext(null);

// AuthProvider component to wrap the application
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setLoading(true);
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        
        if (storedToken && storedUser) {
          // Validate token with the backend if needed
          try {
            // Optional: Verify token with backend
            // await apiEndpoints.auth.verifyToken(storedToken);
            
            setUser(JSON.parse(storedUser));
          } catch (err) {
            console.error('Invalid stored token:', err);
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
          }
        }
      } catch (err) {
        setError(err.message);
        console.error('Auth status check error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Make login API request 
      const response = await apiEndpoints.auth.login(credentials);
      
      // Save token and user info
      const { token, user: userData } = response.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      // Update state
      setUser({
        ...userData,
        token
      });
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Mock login for development
  const mockLogin = (userData) => {
    const mockUser = userData || {
      id: 'mock-user-id',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      token: 'mock-token-123456'
    };
    
    localStorage.setItem('authToken', mockUser.token);
    localStorage.setItem('authUser', JSON.stringify(mockUser));
    setUser(mockUser);
    return true;
  };
  
  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Make register API request
      const response = await apiEndpoints.auth.register(userData);
      
      // Login after successful registration if needed
      // await login({ email: userData.email, password: userData.password });
      
      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      // Call logout API if needed (to invalidate token on server)
      // await apiEndpoints.auth.logout();
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      
      // Update state
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };
  
  // Check if user has a specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };
  
  // Context value with authentication state and functions
  const value = {
    user,
    loading,
    error,
    login,
    mockLogin,
    register,
    logout,
    isAuthenticated,
    hasRole
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 