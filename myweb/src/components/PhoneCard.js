import React, { useState, useRef, useEffect } from 'react';
import { Star, Heart, MapPin, Clock, Eye, ShoppingCart, Zap, Shield, Cpu } from 'lucide-react';
import { useCart } from '../utils/CartContext';
import { useFavorites } from '../utils/FavoritesContext';

const PhoneCard = ({ phone, onViewDetails, showAnimation = true }) => {
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [glitchEffect, setGlitchEffect] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    if (isHovered) {
      const interval = setInterval(() => {
        setGlitchEffect(true);
        setTimeout(() => setGlitchEffect(false), 150);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isHovered]);

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(phone);
    // Trigger success animation
    setGlitchEffect(true);
    setTimeout(() => setGlitchEffect(false), 300);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(phone.id);
  };

  const handleViewDetails = () => {
    onViewDetails(phone);
  };

  const discountPercentage = Math.round((1 - phone.price / phone.originalPrice) * 100);
  const isStarred = favorites.includes(phone.id);

  return (
    <div 
      ref={cardRef}
      className={`relative group ${showAnimation ? 'animate-fade-in-up' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
    >
      {/* Holographic Background Effect */}
      <div 
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                      rgba(139, 92, 246, 0.4) 0%, 
                      rgba(59, 130, 246, 0.3) 25%, 
                      rgba(236, 72, 153, 0.2) 50%, 
                      transparent 70%)`
        }}
      />
      
      {/* Main Card */}
      <div 
        className={`relative bg-gray-800/90 backdrop-blur-lg rounded-3xl overflow-hidden border border-gray-700 
                   transform transition-all duration-500 cursor-pointer
                   ${isHovered ? 'scale-105 border-purple-500/50 shadow-2xl shadow-purple-500/20' : 'hover:scale-102'}
                   ${glitchEffect ? 'animate-pulse' : ''}`}
        style={{
          transform: isHovered 
            ? `perspective(1000px) rotateX(${(mousePosition.y - 50) * 0.1}deg) rotateY(${(mousePosition.x - 50) * 0.1}deg) scale(1.05)` 
            : 'none'
        }}
      >
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <div 
            className={`absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 z-10 
                       opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          />
          
          <img 
            src={phone.image} 
            alt={phone.title}
            className={`w-full h-56 object-cover transition-all duration-700 group-hover:scale-110
                       ${glitchEffect ? 'filter hue-rotate-90' : ''}`}
          />
          
          {/* Floating Action Buttons */}
          <button
            onClick={handleToggleFavorite}
            className={`absolute top-4 right-4 p-3 rounded-2xl backdrop-blur-lg border transition-all duration-300 z-20
                       transform hover:scale-110 hover:rotate-12
                       ${isStarred 
                         ? 'bg-red-500/80 border-red-400 text-white shadow-lg shadow-red-500/50' 
                         : 'bg-gray-800/80 border-gray-600 text-gray-300 hover:text-red-400 hover:border-red-400'
                       }`}
          >
            <Heart className={`h-5 w-5 transition-all ${isStarred ? 'fill-current scale-110' : ''}`} />
          </button>
          
          {/* Discount Badge */}
          {phone.originalPrice && (
            <div className="absolute top-4 left-4 z-20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur-sm opacity-75 animate-pulse" />
                <div className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-2xl text-sm font-bold">
                  <Zap className="inline h-4 w-4 mr-1" />
                  {discountPercentage}% OFF
                </div>
              </div>
            </div>
          )}
          
          {/* Condition Badge */}
          <div className="absolute bottom-4 left-4 z-20">
            <div className={`px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-lg border
                           ${phone.condition === 'Excellent' 
                             ? 'bg-green-500/80 border-green-400 text-white' 
                             : phone.condition === 'Very Good'
                             ? 'bg-blue-500/80 border-blue-400 text-white'
                             : 'bg-yellow-500/80 border-yellow-400 text-white'
                           }`}>
              <Shield className="inline h-3 w-3 mr-1" />
              {phone.condition}
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Title with Glitch Effect */}
          <h3 className={`font-bold text-xl text-white mb-3 line-clamp-2 transition-all duration-300
                         ${glitchEffect ? 'animate-pulse bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent' : ''}
                         group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent`}>
            {phone.title}
          </h3>
          
          {/* Price Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent animate-pulse-glow">
                ${phone.price}
              </span>
              {phone.originalPrice && (
                <span className="text-lg text-gray-500 line-through">${phone.originalPrice}</span>
              )}
            </div>
            
            {/* Rating */}
            <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-2 rounded-xl backdrop-blur-sm">
              <Star className="h-4 w-4 text-yellow-400 fill-current animate-pulse" />
              <span className="text-yellow-400 font-semibold">{phone.rating}</span>
              <span className="text-gray-400 text-sm">({phone.reviews})</span>
            </div>
          </div>

          {/* Specs Preview */}
          <div className="grid grid-cols-2 gap-3 py-3">
            <div className="flex items-center space-x-2 text-gray-300">
              <Cpu className="h-4 w-4 text-purple-400" />
              <span className="text-sm">{phone.specs?.ram || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-sm">{phone.specs?.storage || 'N/A'}</span>
            </div>
          </div>

          {/* Location and Time */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-green-400 animate-pulse" />
              <span className="truncate">{phone.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-blue-400" />
              <span>{phone.postedTime}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleViewDetails}
              className="flex-1 relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                         text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 
                         transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <span className="relative flex items-center justify-center">
                <Eye className="h-5 w-5 mr-2 animate-pulse" />
                View Details
              </span>
            </button>
            
            <button
              onClick={handleAddToCart}
              className="relative group bg-gray-700/50 hover:bg-gradient-to-r hover:from-green-500 hover:to-teal-500 
                         text-gray-300 hover:text-white py-3 px-4 rounded-2xl font-semibold transition-all duration-300 
                         transform hover:scale-110 hover:shadow-lg hover:shadow-green-500/50 backdrop-blur-sm border border-gray-600 hover:border-green-400"
            >
              <ShoppingCart className={`h-5 w-5 transition-all ${glitchEffect ? 'animate-bounce' : ''}`} />
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
            </button>
          </div>

          {/* Views Counter */}
          <div className="flex items-center justify-center space-x-2 pt-2">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">{phone.views} views</span>
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Scan Lines Effect */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent 
                           animate-scan-lines opacity-50" />
          </div>
        )}
      </div>

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes scan-lines {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-scan-lines {
          animation: scan-lines 2s linear infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default PhoneCard;