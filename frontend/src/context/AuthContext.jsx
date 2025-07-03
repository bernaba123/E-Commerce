import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to process user avatar URL
  const processUserData = (userData) => {
    if (userData && userData.avatar) {
      userData.avatar = apiService.getFullAvatarUrl(userData.avatar);
    }
    return userData;
  };

  useEffect(() => {
    // Check for stored token and validate it
    const token = localStorage.getItem('token');
    if (token) {
      validateToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      const response = await apiService.getMe();
      if (response.success) {
        const processedUser = processUserData(response.data.user);
        setUser(processedUser);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('token');
      
      // Only show error if it's not a rate limiting issue
      if (!error.message.includes('429') && !error.message.includes('Too Many Requests')) {
        setError('Session expired. Please login again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getMe();
      if (response.success) {
        const processedUser = processUserData(response.data.user);
        setUser(processedUser);
        return processedUser;
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      
      // Don't log out user for rate limiting errors
      if (!error.message.includes('429') && !error.message.includes('Too Many Requests')) {
        console.error('Failed to refresh user data:', error);
      }
    }
    return null;
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await apiService.login({ email, password });
      
      if (response.success) {
        const { user, token } = response.data;
        const processedUser = processUserData(user);
        localStorage.setItem('token', token);
        setUser(processedUser);
        
        // Check if there's a redirect location from the route state
        const from = location.state?.from?.pathname;
        
        if (from && from !== '/login' && from !== '/signup') {
          // Redirect to the originally requested page
          navigate(from, { replace: true });
        } else {
          // Default redirect based on user role
          if (processedUser.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
        
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      const response = await apiService.register(userData);
      
      if (response.success) {
        const { user, token } = response.data;
        const processedUser = processUserData(user);
        localStorage.setItem('token', token);
        setUser(processedUser);
        
        // New users always go to user dashboard
        navigate('/dashboard', { replace: true });
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
    navigate('/', { replace: true }); // Redirect to home page
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await apiService.updateProfile(userData);
      
      if (response.success) {
        const processedUser = processUserData(response.data.user);
        setUser(processedUser);
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setError(null);
      const response = await apiService.changePassword(passwordData);
      
      if (response.success) {
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Password change failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};