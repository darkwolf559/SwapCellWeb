import React, { useState } from 'react';
import { Smartphone, Eye, EyeOff, User, Mail, Lock, Phone, ShoppingCart, Zap, Stars, Cpu, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { authAPI } from '../utils/api';

const AuthPage = ({ onNavigate }) => {
  const { login, register } = useAuth();
  const [currentView, setCurrentView] = useState('login'); 
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'buyer'
  });
  const [forgotData, setForgotData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotInputChange = (e) => {
    setForgotData({
      ...forgotData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

        if (currentView === 'register' && formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

        if (currentView === 'register' && formData.phone) {
      const phoneRegex = /^(\+94|0)[1-9][0-9]{8}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        setError("Please enter a valid Sri Lankan phone number (eg. +94771234567 or 0771234567)");
        setIsLoading(false);
        return;
      }
    }

    try {
      let userData;
      if (currentView === 'login') {
        userData = await login(formData.email, formData.password);
      } else if (currentView === 'register') {
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

  const handleForgotPassword = async () => {
    if (!forgotData.email) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await authAPI.requestPasswordReset(forgotData.email);
      
      if (response.success) {
        setMaskedEmail(response.data.email);
        setSuccessMessage(response.message);
        setCurrentView('verify');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotData.code || !forgotData.newPassword || !forgotData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (forgotData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.resetPassword(
        forgotData.email,
        forgotData.code,
        forgotData.newPassword
      );
      
      if (response.success) {
        setSuccessMessage(response.message);
        setCurrentView('success');
        // Clear form data
        setForgotData({
          email: '',
          code: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetToLogin = () => {
    setCurrentView('login');
    setError(null);
    setSuccessMessage(null);
    setForgotData({
      email: '',
      code: '',
      newPassword: '',
      confirmPassword: ''
    });
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'buyer'
    });
  };

  const toggleAuthMode = () => {
    if (currentView === 'login') {
      setCurrentView('register');
    } else {
      setCurrentView('login');
    }
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'buyer'
    });
    setError(null);
    setSuccessMessage(null);
  };

  // Floating mobile phones component
  const FloatingMobiles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <div
          key={`mobile-${i}`}
          className="absolute opacity-30"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${25 + Math.random() * 35}px`,
            color: i % 3 === 0 ? '#60a5fa' : i % 3 === 1 ? '#ec4899' : '#a78bfa',
            animation: `floatMobile${i % 4} ${12 + Math.random() * 8}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        >
          <Smartphone />
        </div>
      ))}
      
      {[...Array(20)].map((_, i) => (
        <div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full opacity-70"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`
          }}
        />
      ))}
    </div>
  );

  // Enhanced animated background
  const AnimatedBg = () => (
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" style={{ animation: 'gradientShift 15s ease infinite' }} />
      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-transparent to-cyan-500/20" style={{ animation: 'gradientRotate 25s linear infinite' }} />
      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-purple-500/10 to-transparent" style={{ animation: 'gradientFloat 20s ease-in-out infinite' }} />
    </div>
  );

  const renderForgotPasswordForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 mx-auto text-cyan-400 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Reset Your Password</h3>
        <p className="text-gray-300">Enter your email to receive a verification code</p>
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            name="email"
            value={forgotData.email}
            onChange={handleForgotInputChange}
            onFocus={() => setFocusedField('forgotEmail')}
            onBlur={() => setFocusedField('')}
            className={`w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-400 transition-all duration-300 ${
              focusedField === 'forgotEmail' 
                ? 'border-cyan-400 shadow-lg shadow-cyan-400/25 scale-105' 
                : 'hover:border-white/50'
            }`}
            placeholder="Enter your email address"
          />
        </div>
      </div>

      <button
        onClick={handleForgotPassword}
        disabled={isLoading}
        className="w-full relative bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Sending Code...
          </div>
        ) : (
          'Send Verification Code'
        )}
      </button>

      <button
        onClick={resetToLogin}
        className="w-full text-gray-400 hover:text-white transition-colors flex items-center justify-center"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Login
      </button>
    </div>
  );

  const renderVerifyCodeForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Mail className="h-12 w-12 mx-auto text-purple-400 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Enter Verification Code</h3>
        <p className="text-gray-300">We sent a 6-digit code to</p>
        <p className="text-cyan-400 font-medium">{maskedEmail}</p>
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          name="code"
          value={forgotData.code}
          onChange={handleForgotInputChange}
          onFocus={() => setFocusedField('code')}
          onBlur={() => setFocusedField('')}
          className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white text-center text-2xl tracking-widest placeholder-gray-400 transition-all duration-300 ${
            focusedField === 'code' 
              ? 'border-purple-400 shadow-lg shadow-purple-400/25 scale-105' 
              : 'hover:border-white/50'
          }`}
          placeholder="000000"
          maxLength="6"
        />
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="newPassword"
            value={forgotData.newPassword}
            onChange={handleForgotInputChange}
            onFocus={() => setFocusedField('newPassword')}
            onBlur={() => setFocusedField('')}
            className={`w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-400 transition-all duration-300 ${
              focusedField === 'newPassword' 
                ? 'border-cyan-400 shadow-lg shadow-cyan-400/25 scale-105' 
                : 'hover:border-white/50'
            }`}
            placeholder="Enter new password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="relative group">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={forgotData.confirmPassword}
            onChange={handleForgotInputChange}
            onFocus={() => setFocusedField('confirmPassword')}
            onBlur={() => setFocusedField('')}
            className={`w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-gray-400 transition-all duration-300 ${
              focusedField === 'confirmPassword' 
                ? 'border-pink-400 shadow-lg shadow-pink-400/25 scale-105' 
                : 'hover:border-white/50'
            }`}
            placeholder="Confirm new password"
          />
        </div>
      </div>

      <button
        onClick={handleResetPassword}
        disabled={isLoading}
        className="w-full relative bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
            Resetting Password...
          </div>
        ) : (
          'Reset Password'
        )}
      </button>

      <button
        onClick={() => setCurrentView('forgot')}
        className="w-full text-gray-400 hover:text-white transition-colors flex items-center justify-center"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Email
      </button>
    </div>
  );

  const renderSuccessForm = () => (
    <div className="space-y-6 text-center">
      <div className="mb-6">
        <CheckCircle className="h-16 w-16 mx-auto text-green-400 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Password Reset Successful!</h3>
        <p className="text-gray-300">Your password has been changed successfully.</p>
        <p className="text-gray-300 mt-2">You can now log in with your new password.</p>
      </div>

      <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-center text-green-300">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Check your email for confirmation</span>
        </div>
      </div>

      <button
        onClick={resetToLogin}
        className="w-full relative bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-green-500/25 transform hover:scale-105"
      >
        Continue to Login
      </button>
    </div>
  );

  return (
    <>
      <style>
        {`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes gradientRotate {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1); }
          }
          @keyframes gradientFloat {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            33% { transform: translateY(-20px) translateX(10px); }
            66% { transform: translateY(10px) translateX(-10px); }
          }
          @keyframes floatMobile0 {
            0%, 100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
            25% { transform: translate(50px, -40px) rotate(90deg) scale(1.2); }
            50% { transform: translate(-30px, -60px) rotate(180deg) scale(0.8); }
            75% { transform: translate(-50px, 30px) rotate(270deg) scale(1.1); }
          }
          @keyframes floatMobile1 {
            0%, 100% { transform: translate(0px, 0px) rotate(45deg) scale(1); }
            25% { transform: translate(-45px, 50px) rotate(135deg) scale(0.9); }
            50% { transform: translate(40px, 45px) rotate(225deg) scale(1.3); }
            75% { transform: translate(55px, -35px) rotate(315deg) scale(0.7); }
          }
          @keyframes floatMobile2 {
            0%, 100% { transform: translate(0px, 0px) rotate(90deg) scale(1); }
            33% { transform: translate(35px, 55px) rotate(180deg) scale(1.1); }
            66% { transform: translate(-40px, -45px) rotate(270deg) scale(0.9); }
          }
          @keyframes floatMobile3 {
            0%, 100% { transform: translate(0px, 0px) rotate(-45deg) scale(1); }
            20% { transform: translate(60px, 25px) rotate(45deg) scale(1.2); }
            40% { transform: translate(35px, -50px) rotate(135deg) scale(0.8); }
            60% { transform: translate(-35px, -40px) rotate(225deg) scale(1.1); }
            80% { transform: translate(-55px, 45px) rotate(315deg) scale(0.9); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }
          @keyframes borderFlow {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes borderFlowVertical {
            0% { background-position: center -200%; }
            100% { background-position: center 200%; }
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
        `}
      </style>
      
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <AnimatedBg />
        <FloatingMobiles />
        
        <div className="relative z-10 max-w-md w-full">
          <div 
            className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 transform transition-all duration-700 hover:scale-105"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 50px rgba(59, 130, 246, 0.3)'
            }}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-75 blur-sm -z-10 animate-pulse" />
            
            <div className="absolute inset-0 rounded-3xl overflow-hidden -z-10">
              <div 
                className="absolute top-0 left-0 right-0 h-0.5 opacity-80"
                style={{
                  background: 'linear-gradient(90deg, transparent, #3b82f6, #06b6d4, #3b82f6, transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'borderFlow 3s linear infinite'
                }}
              />
              <div 
                className="absolute top-0 right-0 bottom-0 w-0.5 opacity-80"
                style={{
                  background: 'linear-gradient(180deg, transparent, #3b82f6, #ec4899, #3b82f6, transparent)',
                  backgroundSize: '100% 200%',
                  animation: 'borderFlowVertical 3s linear infinite'
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 h-0.5 opacity-80"
                style={{
                  background: 'linear-gradient(90deg, transparent, #ec4899, #06b6d4, #ec4899, transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'borderFlow 3s linear infinite reverse'
                }}
              />
              <div 
                className="absolute top-0 left-0 bottom-0 w-0.5 opacity-80"
                style={{
                  background: 'linear-gradient(180deg, transparent, #ec4899, #06b6d4, #ec4899, transparent)',
                  backgroundSize: '100% 200%',
                  animation: 'borderFlowVertical 3s linear infinite reverse'
                }}
              />
            </div>
            
            {/* Header */}
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
                {currentView === 'login' ? 'Welcome Back' : 
                 currentView === 'register' ? 'Join SwapCell' :
                 currentView === 'forgot' ? 'Forgot Password' :
                 currentView === 'verify' ? 'Verify Code' : 'Success'}
              </h2>
              
              <p className="text-gray-300 text-lg" style={{ animation: 'slide-up 0.6s ease-out 0.2s both' }}>
                {currentView === 'login' ? 'Enter the Future of Mobile Commerce' : 
                 currentView === 'register' ? 'Begin your Digital Journey Today' :
                 currentView === 'forgot' ? 'We\'ll help you reset your password' :
                 currentView === 'verify' ? 'Enter the code we sent you' : 'You\'re all set!'}
              </p>
              
              <div className="flex justify-center space-x-4 mt-4 opacity-60">
                <Zap className="h-4 w-4 text-cyan-400 animate-bounce" style={{ animationDelay: '0s' }} />
                <Stars className="h-4 w-4 text-purple-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                <Cpu className="h-4 w-4 text-pink-400 animate-bounce" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl text-center" style={{ animation: 'slide-in-left 0.3s ease-out' }}>
                <div className="flex items-center justify-center text-red-300">
                  <Zap className="h-4 w-4 mr-2 animate-pulse" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl text-center" style={{ animation: 'slide-in-right 0.3s ease-out' }}>
                <div className="flex items-center justify-center text-green-300">
                  <CheckCircle className="h-4 w-4 mr-2 animate-pulse" />
                  <span className="text-sm font-medium">{successMessage}</span>
                </div>
              </div>
            )}

            {/* Render appropriate form based on current view */}
            {currentView === 'forgot' && renderForgotPasswordForm()}
            {currentView === 'verify' && renderVerifyCodeForm()}
            {currentView === 'success' && renderSuccessForm()}

            {/* Main login/register forms */}
            {(currentView === 'login' || currentView === 'register') && (
              <div className="space-y-6">
                {/* Name field for register */}
                {currentView === 'register' && (
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
                  </div>
                </div>

                {/* Phone field for register */}
                {currentView === 'register' && (
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
                        placeholder="+94 XXXX XXXXX"
                      />
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
                  </div>
                </div>

                {/* Role selection for register */}
                {currentView === 'register' && (
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
                          </div>
                          <div className="font-medium text-white">Seller</div>
                          <div className="text-sm text-gray-400">Share your devices</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* Submit button */}
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
                        {currentView === 'login' ? 'Connecting to the future...' : 'Creating your digital identity...'}
                      </span>
                    </div>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center">
                      {currentView === 'login' ? 'Enter the Hub' : 'Begin Journey'}
                      <Zap className="ml-2 h-5 w-5 animate-pulse" />
                    </span>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                </button>

                {/* Forgot password link (only on login) */}
                {currentView === 'login' && (
                  <div className="text-center">
                    <button
                      onClick={() => setCurrentView('forgot')}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Toggle button (only for login/register views) */}
            {(currentView === 'login' || currentView === 'register') && (
              <div className="text-center mt-8">
                <button
                  onClick={toggleAuthMode}
                  className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text font-medium transition-all duration-300 hover:from-purple-400 hover:to-pink-400 transform hover:scale-110"
                >
                  {currentView === 'login' 
                    ? "New to the future? Join us" 
                    : "Already exploring? Sign in"
                  }
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;