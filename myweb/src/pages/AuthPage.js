import React, { useState, useEffect } from 'react';
import { Smartphone, Eye, EyeOff, User, Mail, Lock, Phone, ShoppingCart, Zap, Stars, Cpu } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

const AuthPage = ({ onNavigate }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'buyer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  // ✅ Simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    setError("Please enter a valid email address");
    setIsLoading(false);
    return;
  }

  try {
    let userData;
    if (isLogin) {
      userData = await login(formData.email, formData.password);
    } else {
      userData = await register(formData);
    }

    if (userData) {
      if (onNavigate) onNavigate("home");
    }
  } catch (err) {
    setError(err.message || "Authentication failed");
  } finally {
    setIsLoading(false);
  }
};

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'buyer'
    });
  };

  // Floating particles component
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-60 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );

  // Animated background gradients
  const AnimatedBg = () => (
    <div className="fixed inset-0 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.3) 0%, transparent 50%)`
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" style={{ animation: 'gradient-x 15s ease infinite' }} />
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-transparent to-cyan-500/20 animate-pulse" />
    </div>
  );

  return (
    <>
      <style>
        {`
          @keyframes gradient-x {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes slide-in-left {
            from { opacity: 0; transform: translateX(-50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slide-in-right {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-gradient-x { animation: gradient-x 15s ease infinite; }
          .animate-spin-slow { animation: spin-slow 3s linear infinite; }
          .animate-slide-in-left { animation: slide-in-left 0.6s ease-out; }
          .animate-slide-in-right { animation: slide-in-right 0.6s ease-out; }
          .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
          .animate-slide-up { animation: slide-up 0.6s ease-out 0.2s both; }
          .animate-fade-in { animation: fade-in 0.8s ease-out; }
          .animate-shimmer { animation: shimmer 2s infinite; }
        `}
      </style>
      
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <AnimatedBg />
        <FloatingParticles />
        
        {/* Main container with advanced animations */}
        <div className="relative z-10 max-w-md w-full">
          <div 
            className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-700 hover:scale-105"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 50px rgba(59, 130, 246, 0.3)'
            }}
          >
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-75 blur-sm -z-10 animate-pulse" />
            
            {/* Header with enhanced animations */}
            <div className="text-center mb-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full" style={{ animation: 'spin-slow 3s linear infinite' }} />
                <div className="absolute inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <div className="relative">
                    <Smartphone className="h-8 w-8 text-white animate-pulse" />
                    <div className="absolute -inset-2 bg-white/20 rounded-full animate-ping" />
                  </div>
                </div>
              </div>
              
              <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3" style={{ animation: 'fade-in 0.8s ease-out' }}>
                {isLogin ? 'Welcome Back' : 'Join PhoneHub'}
              </h2>
              
              <p className="text-gray-300 text-lg" style={{ animation: 'slide-up 0.6s ease-out 0.2s both' }}>
                {isLogin ? 'Enter the future of mobile commerce' : 'Begin your digital journey today'}
              </p>
              
              {/* Animated tech elements */}
              <div className="flex justify-center space-x-4 mt-4 opacity-60">
                <Zap className="h-4 w-4 text-cyan-400 animate-bounce" style={{ animationDelay: '0s' }} />
                <Stars className="h-4 w-4 text-purple-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                <Cpu className="h-4 w-4 text-pink-400 animate-bounce" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>

            {/* Enhanced Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl text-center" style={{ animation: 'slide-in-left 0.3s ease-out' }}>
                <div className="flex items-center justify-center text-red-300">
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Enhanced form fields */}
              {!isLogin && (
                <div className="relative group" style={{ animation: 'slide-in-left 0.6s ease-out' }}>
                  <label className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-hover:text-cyan-400">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-cyan-400" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-400 transition-all duration-300 ${
                        focusedField === 'name' 
                          ? 'border-cyan-400 shadow-lg shadow-cyan-400/25 scale-105' 
                          : 'hover:border-white/50'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {focusedField === 'name' && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 -z-10 animate-pulse" />
                    )}
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="relative group" style={{ animation: 'slide-in-right 0.6s ease-out' }}>
                <label className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-hover:text-purple-400">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-purple-400" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-400 transition-all duration-300 ${
                      focusedField === 'email' 
                        ? 'border-purple-400 shadow-lg shadow-purple-400/25 scale-105' 
                        : 'hover:border-white/50'
                    }`}
                    placeholder="Enter your email"
                  />
                  {focusedField === 'email' && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 -z-10 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Phone field */}
              {!isLogin && (
                <div className="relative group" style={{ animation: 'slide-in-left 0.6s ease-out' }}>
                  <label className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-hover:text-pink-400">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-pink-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField('')}
                      className={`w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-400 transition-all duration-300 ${
                        focusedField === 'phone' 
                          ? 'border-pink-400 shadow-lg shadow-pink-400/25 scale-105' 
                          : 'hover:border-white/50'
                      }`}
                      placeholder="+65 XXXX XXXX"
                    />
                    {focusedField === 'phone' && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/20 to-red-500/20 -z-10 animate-pulse" />
                    )}
                  </div>
                </div>
              )}

              {/* Password field */}
              <div className="relative group" style={{ animation: 'slide-in-right 0.6s ease-out' }}>
                <label className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-hover:text-cyan-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 transition-colors group-hover:text-cyan-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    className={`w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-400 transition-all duration-300 ${
                      focusedField === 'password' 
                        ? 'border-cyan-400 shadow-lg shadow-cyan-400/25 scale-105' 
                        : 'hover:border-white/50'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {focusedField === 'password' && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 -z-10 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Enhanced role selection */}
              {!isLogin && (
                <div style={{ animation: 'fade-in-up 0.8s ease-out' }}>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer border-2 rounded-2xl p-4 transition-all duration-300 transform hover:scale-105 ${
                      formData.role === 'buyer' 
                        ? 'border-cyan-400 bg-cyan-400/20 shadow-lg shadow-cyan-400/25' 
                        : 'border-white/30 hover:border-white/50 bg-white/5'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="buyer"
                        checked={formData.role === 'buyer'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="relative">
                          <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-cyan-400" />
                          {formData.role === 'buyer' && (
                            <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping" />
                          )}
                        </div>
                        <div className="font-medium text-white">Buyer</div>
                        <div className="text-sm text-gray-400">Discover amazing phones</div>
                      </div>
                    </label>
                    
                    <label className={`cursor-pointer border-2 rounded-2xl p-4 transition-all duration-300 transform hover:scale-105 ${
                      formData.role === 'seller' 
                        ? 'border-purple-400 bg-purple-400/20 shadow-lg shadow-purple-400/25' 
                        : 'border-white/30 hover:border-white/50 bg-white/5'
                    }`}>
                      <input
                        type="radio"
                        name="role"
                        value="seller"
                        checked={formData.role === 'seller'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="relative">
                          <Smartphone className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                          {formData.role === 'seller' && (
                            <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping" />
                          )}
                        </div>
                        <div className="font-medium text-white">Seller</div>
                        <div className="text-sm text-gray-400">Share your devices</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Enhanced submit button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full relative bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 disabled:transform-none disabled:opacity-50 overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {isLoading ? (
                  <div className="flex items-center justify-center relative z-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    <span className="animate-pulse">
                      {isLogin ? 'Connecting to the future...' : 'Creating your digital identity...'}
                    </span>
                  </div>
                ) : (
                  <span className="relative z-10 flex items-center justify-center">
                    {isLogin ? 'Enter the Hub' : 'Begin Journey'}
                    <Zap className="ml-2 h-5 w-5 animate-pulse" />
                  </span>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </button>
            </div>

            {/* Enhanced toggle button */}
            <div className="text-center mt-8">
              <button
                onClick={toggleAuthMode}
                className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-medium transition-all duration-300 hover:from-purple-400 hover:to-pink-400 transform hover:scale-110"
              >
                {isLogin 
                  ? "New to the future? Join us" 
                  : "Already exploring? Sign in"
                }
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;