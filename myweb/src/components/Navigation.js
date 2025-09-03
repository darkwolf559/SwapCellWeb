import React, { useState } from 'react';
import { ShoppingCart, Smartphone, Menu } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { useCart } from '../utils/CartContext';

const Navigation = ({ currentPage, onNavigate }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, logout } = useAuth();
  const { cart } = useCart();

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const NavLink = ({ page, children, className = "" }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setShowMobileMenu(false);
      }}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        currentPage === page 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-700 hover:text-blue-600'
      } ${className}`}
    >
      {children}
    </button>
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
              <Smartphone className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">SwapCell</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink page="home">Home</NavLink>
            <NavLink page="phones">Browse Phones</NavLink>
            {user && <NavLink page="profile">Profile</NavLink>}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 hidden sm:block">Hi, {user.name}</span>
                <button
                  onClick={logout}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-2 animate-fade-in">
            <NavLink page="home" className="block w-full text-left">Home</NavLink>
            <NavLink page="phones" className="block w-full text-left">Browse Phones</NavLink>
            {user && <NavLink page="profile" className="block w-full text-left">Profile</NavLink>}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;