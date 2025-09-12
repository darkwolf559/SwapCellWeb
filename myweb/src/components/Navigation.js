import React, { useState, useEffect } from 'react';
import { ShoppingCart, Smartphone, Menu, ArrowLeft } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { useCart } from '../utils/CartContext';

const Navigation = ({ currentPage, onNavigate, showBackButton = false, onBack }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink = ({ page, children, className = "" }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setShowMobileMenu(false);
      }}
      className={`
        relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 
        transform hover:scale-105 hover:-translate-y-1 group overflow-hidden
        ${currentPage === page 
          ? 'text-white bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 shadow-lg shadow-purple-500/25' 
          : 'text-gray-300 hover:text-white'
        } ${className}
      `}
    >
      {/* Animated background on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300 rounded-lg"></div>
      
      <span className="relative z-10">{children}</span>
    </button>
  );

  return (
    <nav className={`
      fixed top-0 w-full z-50 transition-all duration-500 transform
      ${scrolled 
        ? 'bg-gray-900/90 backdrop-blur-xl shadow-2xl shadow-purple-500/10' 
        : 'bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900'
      }
    `}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-60"></div>
        <div className="absolute top-2 right-1/3 w-1 h-1 bg-pink-400 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute bottom-1 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-50"></div>
        
        {/* Gradient border effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            {/* Back Button */}
            {showBackButton && (
              <button
                onClick={onBack}
                className="relative mr-4 p-2 text-gray-300 hover:text-cyan-400 transition-all duration-300 transform hover:scale-110 hover:-translate-x-1 group rounded-lg"
              >
                <div className="relative">
                  <ArrowLeft className="h-6 w-6 transition-all duration-300 group-hover:-translate-x-1" />
                  {/* Back button glow effect */}
                  <div className="absolute inset-0 h-6 w-6 text-cyan-400 blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                    <ArrowLeft className="h-6 w-6" />
                  </div>
                </div>
                
                {/* Hover background */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              </button>
            )}

            <div 
              className="flex-shrink-0 flex items-center cursor-pointer group transition-all duration-300 hover:scale-110" 
              onClick={() => onNavigate('home')}
            >
              <div className="relative">
                <Smartphone className="h-8 w-8 text-cyan-400 group-hover:text-pink-400 transition-colors duration-300 filter drop-shadow-lg" />
                {/* Phone icon glow */}
                <div className="absolute inset-0 h-8 w-8 text-cyan-400 group-hover:text-pink-400 transition-colors duration-300 blur-sm opacity-50">
                  <Smartphone className="h-8 w-8" />
                </div>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-pink-400 group-hover:to-cyan-400 transition-all duration-500">
                SwapCell
              </span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink page="home">Home</NavLink>
            <NavLink page="phones">Browse Phones</NavLink>
            {/* Removed Add Phone button for sellers */}
            {user && user.role === 'admin' && (
              <NavLink page="admin">Admin Dashboard</NavLink>
            )}
            {user && <NavLink page="profile">Profile</NavLink>}
          </div>

          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            {user && user.role === 'buyer' && (
              <button
                onClick={() => onNavigate('cart')}
                className="relative p-3 text-gray-300 hover:text-cyan-400 transition-all duration-300 transform hover:scale-110 group"
              >
                <div className="relative">
                  <ShoppingCart className="h-6 w-6 transition-all duration-300 group-hover:rotate-12" />
                  {/* Cart glow effect */}
                  <div className="absolute inset-0 h-6 w-6 text-cyan-400 blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                </div>
                
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {cartItemCount}
                  </span>
                )}
                
                {/* Pulse ring on cart updates */}
                {cartItemCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-400 rounded-full animate-ping opacity-30"></div>
                )}
              </button>
            )}
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300 hidden sm:block font-medium">
                  Hi, <span className="text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">{user.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="relative px-4 py-2 bg-gray-800/50 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-gray-700 hover:border-red-500/50 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="relative px-6 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg shadow-purple-500/25 group overflow-hidden"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300"></div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <span className="relative z-10">Sign In</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-300 hover:text-cyan-400 transition-all duration-300 transform hover:scale-110 hover:rotate-180"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`
          md:hidden border-t border-purple-500/20 transition-all duration-500 transform overflow-hidden
          ${showMobileMenu 
            ? 'max-h-64 py-4 opacity-100 translate-y-0' 
            : 'max-h-0 py-0 opacity-0 -translate-y-4'
          }
        `}>
          <div className="space-y-2">
            {/* Mobile Back Button */}
            {showBackButton && (
              <button
                onClick={() => {
                  onBack();
                  setShowMobileMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-300 hover:text-cyan-400 transition-all duration-300 rounded-lg group"
              >
                <div className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  <span>Back</span>
                </div>
              </button>
            )}
            
            <NavLink page="home" className="block w-full text-left">
              <span className="block py-1">Home</span>
            </NavLink>
            <NavLink page="phones" className="block w-full text-left">
              <span className="block py-1">Browse Phones</span>
            </NavLink>
            {/* Removed Add Phone button for sellers from mobile menu */}
            {user && user.role === 'admin' && (
              <NavLink page="admin" className="block w-full text-left">
                <span className="block py-1">Admin Dashboard</span>
              </NavLink>
            )}
            {user && (
              <NavLink page="profile" className="block w-full text-left">
                <span className="block py-1">Profile</span>
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* CSS for additional animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 100%, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </nav>
  );
};

export default Navigation;