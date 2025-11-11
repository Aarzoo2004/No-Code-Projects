import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verify authentication on mount
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await API.get('/auth/me');
      setUser(response.data.user);
      
      // Update localStorage with verified user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error('Auth verification failed:', error);
      // Clear invalid auth
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    // Store token
    localStorage.setItem('token', token);
    
    // Ensure userData has consistent structure
    const normalizedUser = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role
    };
    
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    
    console.log('✅ User logged in:', normalizedUser);
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const updateUser = (userData) => {
    const normalizedUser = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role
    };
    
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  // Check if user has required role
  const hasRole = (allowedRoles) => {
    if (!user) {
      console.log('❌ No user found');
      return false;
    }
    
    const hasAccess = allowedRoles.includes(user.role);
    console.log(`🔐 Role check: User role="${user.role}", Required="${allowedRoles}", Access=${hasAccess}`);
    return hasAccess;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    hasRole,
    isAuthenticated: !!user
  };

  // Debug: Log current user on state change
  useEffect(() => {
    if (user) {
      console.log('👤 Current User:', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    }
  }, [user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};