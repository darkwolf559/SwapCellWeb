import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Load user & token from localStorage on first render
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  // Persist changes
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }, [user, token]);

  // Login - now uses authAPI
  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const data = response.data;

      setUser(data.user);
      setToken(data.token);

      return data.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Invalid login credentials";
      throw new Error(errorMessage);
    }
  };

  // Register - now uses authAPI
  const register = async (formData) => {
    try {
      const response = await authAPI.register(formData);
      const data = response.data;

      setUser(data.user);
      setToken(data.token);

      return data.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      throw new Error(errorMessage);
    }
  };

  // Request Password Reset - now uses authAPI
  const requestPasswordReset = async (email) => {
    try {
      const result = await authAPI.requestPasswordReset(email);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to send reset code";
      throw new Error(errorMessage);
    }
  };

  // Reset Password - now uses authAPI
  const resetPassword = async (email, code, newPassword) => {
    try {
      const result = await authAPI.resetPassword(email, code, newPassword);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to reset password";
      throw new Error(errorMessage);
    }
  };

  // Update Profile - uses authAPI
  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.data.user;
      
      // Update local user state
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update profile";
      throw new Error(errorMessage);
    }
  };

  // Get Profile - uses authAPI
  const getProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data.user;
      
      // Update local user state with fresh data
      setUser(userData);
      
      return userData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to get profile";
      throw new Error(errorMessage);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Auth helpers
  const isAuthenticated = () => !!token;
  const getAuthHeaders = () =>
    token ? { Authorization: `Bearer ${token}` } : {};

  // Refresh token/user data
  const refreshUser = async () => {
    if (token) {
      try {
        await getProfile();
      } catch (error) {
        console.error('Failed to refresh user data:', error);
        // If refresh fails, logout user
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        token, 
        login, 
        register, 
        logout, 
        requestPasswordReset,
        resetPassword,
        updateProfile,
        getProfile,
        refreshUser,
        isAuthenticated, 
        getAuthHeaders 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);