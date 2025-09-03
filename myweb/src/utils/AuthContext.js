import React, { createContext, useContext, useState, useEffect } from 'react';
import { Smartphone, Zap, Stars, Cpu } from 'lucide-react';
import api from './api';

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
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Set default auth header for API requests
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', { email, password });
      
      const { token: newToken, user: userData } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setToken(newToken);
      setUser(userData);
      
      // Set auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return userData;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Authentication matrix breach detected');
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      // Store in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update state
      setToken(newToken);
      setUser(newUser);
      
      // Set auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return newUser;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Identity creation protocol failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      const updatedUser = response.data;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      
      return updatedUser;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Profile synchronization failed');
    }
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const isSeller = () => {
    return user?.role === 'seller';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    isSeller
  };

  if (loading) {
    return (
      <>
        <style>
          {`
            @keyframes gradient-x {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            @keyframes pulse-glow {
              0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
              50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.3); }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-20px); }
            }
            .animate-gradient-x { animation: gradient-x 15s ease infinite; }
            .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
            .animate-float { animation: float 3s ease-in-out infinite; }
          `}
        </style>
        
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
          {/* Animated Background */}
          <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-gradient-x" />
          <div className="fixed inset-0 bg-gradient-to-tr from-pink-500/20 via-transparent to-cyan-500/20 animate-pulse" />
          
          {/* Floating Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-60 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>

          <div className="relative z-10 text-center">
            {/* Main Loading Icon */}
            <div className="relative w-24 h-24 mx-auto mb-8 animate-float">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full animate-spin opacity-75" />
              <div className="absolute inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center animate-pulse-glow">
                <Smartphone className="h-10 w-10 text-white" />
              </div>
            </div>

            {/* Loading Text */}
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Initializing PhoneHub
            </h2>
            
            <p className="text-gray-300 text-lg mb-8">
              Connecting to the digital marketplace...
            </p>

            {/* Tech Elements */}
            <div className="flex justify-center space-x-6 mb-8">
              <div className="flex flex-col items-center">
                <Zap className="h-6 w-6 text-cyan-400 animate-bounce mb-2" style={{ animationDelay: '0s' }} />
                <div className="w-8 h-1 bg-gradient-to-r from-cyan-500 to-transparent rounded-full animate-pulse" />
              </div>
              <div className="flex flex-col items-center">
                <Stars className="h-6 w-6 text-purple-400 animate-bounce mb-2" style={{ animationDelay: '0.3s' }} />
                <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>
              <div className="flex flex-col items-center">
                <Cpu className="h-6 w-6 text-pink-400 animate-bounce mb-2" style={{ animationDelay: '0.6s' }} />
                <div className="w-8 h-1 bg-gradient-to-r from-pink-500 to-transparent rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-64 h-2 bg-white/10 rounded-full mx-auto overflow-hidden backdrop-blur-sm">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full"
                style={{
                  animation: 'progress 2s ease-in-out infinite',
                  backgroundSize: '200% 100%'
                }}
              />
            </div>

            <p className="text-gray-400 text-sm mt-4 animate-pulse">
              Securing your digital identity...
            </p>
          </div>

          <style>
            {`
              @keyframes progress {
                0% { width: 0%; background-position: 200% 0; }
                100% { width: 100%; background-position: -200% 0; }
              }
            `}
          </style>
        </div>
      </>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};