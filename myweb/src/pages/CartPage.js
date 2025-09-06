import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, CreditCard, Truck, Zap, Shield, Star, Loader } from 'lucide-react';
import { useCart } from '../utils/CartContext';
import { useAuth } from '../utils/AuthContext';

const CartPage = ({ onNavigate }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { user } = useAuth();
  const [animatingItems, setAnimatingItems] = useState({});
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Calculate totals
  const total = cart.reduce((sum, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0);

  const itemCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Add animation when quantity changes
  const handleQuantityUpdate = async (id, newQuantity) => {
    setAnimatingItems(prev => ({ ...prev, [id]: true }));
    const result = await updateQuantity(id, newQuantity);
    
    setTimeout(() => {
      setAnimatingItems(prev => ({ ...prev, [id]: false }));
    }, 300);

    if (!result.success) {
      console.error('Failed to update quantity:', result.message);
    }
  };

  const handleRemoveItem = async (id) => {
    const result = await removeFromCart(id);
    if (!result.success) {
      console.error('Failed to remove item:', result.message);
    }
  };

  const handleClearCart = async () => {
    const result = await clearCart();
    if (!result.success) {
      console.error('Failed to clear cart:', result.message);
    }
  };

const handleCheckout = () => {
  if (!user) {
    onNavigate('auth');
    return;
  }

  if (cart.length === 0) {
    alert('Your cart is empty');
    return;
  }

  onNavigate('checkout');
};

  const getImageUrl = (item) => {
    if (!item) return '/api/placeholder/400/300';
    
    // Handle image from item
    if (item.image) {
      if (item.image.startsWith('http')) return item.image;
      if (item.image.startsWith('/api/placeholder')) return item.image;
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${item.image}`;
    }
    
    // Handle images array
    if (item.images && item.images.length > 0) {
      const firstImage = item.images[0];
      if (firstImage.startsWith('http')) return firstImage;
      if (firstImage.startsWith('/api/placeholder')) return firstImage;
      return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${firstImage}`;
    }
    
    return '/api/placeholder/400/300';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-24 pb-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-purple-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400 text-xl">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-24 pb-8">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-pink-400 rounded-full animate-pulse opacity-50"></div>
          <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-70"></div>
          <div className="absolute top-60 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-40 animation-delay-1000"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-snug text-center mb-6">
            Shopping Cart
          </h1>
          
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-2xl p-12 text-center border border-purple-500/20 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl"></div>
            
            <div className="relative z-10">
              <div className="relative inline-block mb-6">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto" />
                {/* Cart glow */}
                <div className="absolute inset-0 h-16 w-16 text-cyan-400 blur-sm opacity-50 mx-auto">
                  <ShoppingCart className="h-16 w-16" />
                </div>
              </div>
              
              <h3 className="text-3xl font-medium text-white mb-4">Your cart is empty</h3>
              <p className="text-gray-300 mb-8 text-lg">Add some phones to get started!</p>
              
              <button
                onClick={() => onNavigate('phones')}
                className="relative px-8 py-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 shadow-xl shadow-purple-500/25 group overflow-hidden"
              >
                {/* Button glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300"></div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <span className="relative z-10 flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Browse Phones
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 pt-24 pb-8">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-60"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-pink-400 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-70"></div>
        <div className="absolute top-60 right-1/3 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-40"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center mb-16 py-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent min-h-[3rem]" style={{ lineHeight: '1.5', paddingBottom: '0.5rem' }}>
            Shopping Cart
          </h1>
          <button
            onClick={handleClearCart}
            className="text-red-400 hover:text-red-300 font-medium transition-all duration-300 transform hover:scale-110 px-4 py-2 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/30"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item, index) => (
              <div 
                key={item._id || item.id} 
                className={`
                  bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-purple-500/20 
                  transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-2 
                  hover:shadow-purple-500/25 group relative overflow-hidden
                  ${animatingItems[item._id || item.id] ? 'animate-pulse' : ''}
                `}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Card glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex items-center space-x-6 relative z-10">
                  <div className="relative">
                    <img
                      src={getImageUrl(item)}
                      alt={item.title || 'Phone'}
                      className="w-28 h-28 object-cover rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/400/300';
                      }}
                    />
                    {/* Image glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                      {item.title || 'Phone'}
                    </h3>
                    <p className="text-gray-300 mb-3 flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {item.condition || 'Good'} condition
                    </p>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        LKR {(item.price || 0).toLocaleString()}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-sm text-gray-500 line-through">
                          LKR {item.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityUpdate(item._id || item.id, (item.quantity || 1) - 1)}
                      className="p-3 bg-gray-700/50 border border-gray-600 rounded-xl hover:bg-red-500/20 hover:border-red-500/50 text-gray-300 hover:text-red-400 transition-all duration-300 transform hover:scale-110"
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="font-bold text-xl w-12 text-center text-white bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg py-2 border border-purple-500/30">
                      {item.quantity || 1}
                    </span>
                    <button
                      onClick={() => handleQuantityUpdate(item._id || item.id, (item.quantity || 1) + 1)}
                      className="p-3 bg-gray-700/50 border border-gray-600 rounded-xl hover:bg-green-500/20 hover:border-green-500/50 text-gray-300 hover:text-green-400 transition-all duration-300 transform hover:scale-110"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item._id || item.id)}
                      className="p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-300 transform hover:scale-110 ml-4 hover:rotate-90"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Item Total */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700/50 relative z-10">
                  <span className="text-gray-300 font-medium">Subtotal for this item:</span>
                  <span className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    LKR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-auto lg:flex-[2] lg:min-w-[400px]">
            <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sticky top-28 border border-purple-500/20 relative overflow-hidden">
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl"></div>
              
              <div className="relative z-10">
                <h3 className="font-bold text-2xl text-white mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Order Summary
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-300 font-medium text-lg">Items ({itemCount})</span>
                    <div className="text-right min-w-[140px]">
                      <span className="font-bold text-white text-lg whitespace-nowrap">LKR {total.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-700/30 rounded-lg">
                    <span className="text-gray-300 font-medium text-lg">Shipping</span>
                    <div className="text-right min-w-[140px]">
                      <span className="font-bold text-green-400 text-lg">Free</span>
                    </div>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent my-4"></div>
                  
                  <div className="flex justify-between items-center text-xl font-bold p-5 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-xl border border-purple-500/30">
                    <span className="text-white text-xl">Total</span>
                    <div className="text-right min-w-[160px]">
                      <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap text-2xl">
                        LKR {total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-6 mb-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/5 to-blue-400/5 rounded-xl"></div>
                  <div className="flex items-center text-green-400 mb-2 relative z-10">
                    <Truck className="h-6 w-6 mr-3" />
                    <span className="font-bold">Free island-wide delivery</span>
                  </div>
                  <p className="text-green-300 text-sm relative z-10">
                    Meet-up locations available across Sri Lanka
                  </p>
                </div>

          <button
             onClick={handleCheckout}
             disabled={cart.length === 0}
             className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white py-5 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl shadow-purple-500/25 group overflow-hidden relative disabled:opacity-50 disabled:cursor-not-allowed"
>
           {/* Button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-50 blur-sm transition-opacity duration-300"></div>
  
           {/* Shimmer effect */}
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
  
           <span className="relative z-10 flex items-center justify-center">
           <CreditCard className="h-6 w-6 mr-3" />
          {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
           </span>
        </button>

                {!user && (
                  <p className="text-sm text-gray-400 text-center mt-4 font-medium">
                    Sign in to save your cart and complete your purchase
                  </p>
                )}

                {/* Security Note */}
                <div className="mt-8 text-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
                  <div className="flex items-center justify-center space-x-4 text-gray-300">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-green-400 mr-2" />
                      <span className="text-sm font-medium">Secure checkout</span>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-blue-400 mr-2" />
                      <span className="text-sm font-medium">Multiple payments</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for additional animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 30px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translate3d(-30px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default CartPage;