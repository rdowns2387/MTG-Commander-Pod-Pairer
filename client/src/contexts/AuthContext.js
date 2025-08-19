import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const res = await authAPI.getMe();
          setCurrentUser(res.data.data);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('token');
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const res = await authAPI.register(userData);
      localStorage.setItem('token', res.data.token);
      setCurrentUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      const res = await authAPI.login(credentials);
      localStorage.setItem('token', res.data.token);
      setCurrentUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
  };

  // Update user details
  const updateUserDetails = async (userData) => {
    try {
      setError(null);
      const res = await authAPI.updateDetails(userData);
      setCurrentUser(res.data.data);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      throw err;
    }
  };

  // Update PIN
  const updatePin = async (pinData) => {
    try {
      setError(null);
      const res = await authAPI.updatePin(pinData);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'PIN update failed');
      throw err;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateUserDetails,
    updatePin,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;