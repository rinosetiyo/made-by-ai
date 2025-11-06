import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../services/api';

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
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const checkAuthStatus = async () => {
      if (token) {
        try {
          // Verify token by fetching current user
          const response = await apiClient.get('auth/user/');
          setUser(response.data);
        } catch (error) {
          // Token is invalid or expired, remove it
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await apiClient.post('auth/login/', {
        username,
        password
      });
      
      const { token: newToken, user: userData } = response.data;
      
      // Store token in localStorage and update state
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      // Set token in API client headers
      apiClient.defaults.headers.common['Authorization'] = `Token ${newToken}`;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await apiClient.post('auth/register/', {
        username,
        email,
        password
      });
      
      const { token: newToken, user: userData } = response.data;
      
      // Store token in localStorage and update state
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      // Set token in API client headers
      apiClient.defaults.headers.common['Authorization'] = `Token ${newToken}`;
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('auth/logout/');
    } catch (error) {
      // Even if logout fails on the server, clear local data
      console.error('Logout error:', error);
    } finally {
      // Remove token from localStorage and update state
      localStorage.removeItem('token');
      delete apiClient.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
    }
  };

  // Set token in API client if available
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Token ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};