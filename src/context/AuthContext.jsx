import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

import { useTranslation } from 'react-i18next';
const AuthContext = createContext(null);

export const useAuth = () => {
  const { t } = useTranslation();
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authService.getCurrentUser();
        const token = localStorage.getItem('accessToken');

        if (storedUser && token) {
          // Verify token by fetching profile
          try {
            const response = await userService.getProfile();
            if (response && response.data) {
              setUser(response.data);
              setIsAuthenticated(true);
            }
          } catch (error) {
            // Token invalid or API error, clear storage
            console.error('Profile fetch error:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            // Don't throw error, just set loading to false
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      console.log('🔐 AuthContext: Login attempt for:', email);
      const response = await authService.login(email, password);
      console.log('✅ AuthContext: Login response:', response);
      
      if (response.success) {
        console.log('✅ AuthContext: Setting user and authentication state');
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('✅ AuthContext: User authenticated successfully');
      } else {
        console.warn('⚠️ AuthContext: Login response not successful:', response);
      }
      return response;
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      // Clear any partial state
      setUser(null);
      setIsAuthenticated(false);
      // Re-throw error so LoginPage can handle it
      throw error;
    }
  };

  // Register
  const register = async (userData) => {
    const response = await authService.register(userData);
    return response;
  };

  // Logout
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user
  const updateUser = (userData) => {
    setUser(prev => {
      const updatedUser = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

