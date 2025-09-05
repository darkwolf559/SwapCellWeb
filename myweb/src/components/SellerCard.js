import React, { useState } from 'react';
import { Phone, MessageCircle, Shield, Lock, User, Globe, Star, MapPin, Calendar } from 'lucide-react';

const SellerCard = ({ seller }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCall = () => {
    window.open(`tel:${seller.phone}`);
  };

  const handleWhatsApp = () => {
    const phoneNumber = seller.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hi! I'm interested in your phone listing.`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Get profile image URL - handle different possible sources
  const getProfileImageUrl = () => {
    if (imageError) return null;
    
    // Check various possible profile image properties
    return seller.profilePicture || 
           seller.profileImage || 
           seller.avatar || 
           seller.image || 
           seller.photo ||
           null;
  };

  const profileImageUrl = getProfileImageUrl();

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl group-hover:from-emerald-600/30 group-hover:via-blue-600/30 group-hover:to-purple-600/30"></div>

      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30 transition-all duration-500 group-hover:shadow-emerald-500/20 group-hover:bg-white/95">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="relative">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl animate-pulse">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {isHovered && (
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-xl animate-ping opacity-75"></div>
            )}
          </div>
          <h3 className="ml-4 font-bold text-2xl bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            Verified Seller
          </h3>
          <div className="ml-auto">
            <Lock className="h-5 w-5 text-green-500 animate-pulse" />
          </div>
        </div>

        {/* Enhanced Seller Profile */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center">
            {/* Profile Picture with Cloudinary Support */}
            <div className="relative group/avatar">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-xl transition-transform duration-300 group-hover/avatar:scale-110 border-4 border-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
                {profileImageUrl && !imageError ? (
                  <img
                    src={profileImageUrl}
                    alt={`${seller.name}'s profile`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/avatar:scale-110"
                    onError={handleImageError}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                )}
              </div>
              
              {/* Animated Border */}
              <div className="absolute inset-0 border-2 border-blue-300/50 rounded-full animate-spin group-hover/avatar:border-purple-400"></div>
              
              {/* Online Status Indicator */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              
              {/* Hover Glow Effect */}
              {isHovered && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-purple-500/30 to-pink-500/30 rounded-full animate-pulse"></div>
              )}
            </div>

            <div className="ml-6 flex-1">
              <h4 className="font-bold text-xl text-gray-900 mb-2">{seller.name}</h4>
              
              {/* Member Since - Always Show */}
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                <span>
                  Member since {seller.joinedDate 
                    ? new Date(seller.joinedDate).getFullYear() 
                    : new Date().getFullYear() 
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Contact Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={handleCall}
            className="group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="relative flex items-center justify-center">
              <Phone className="h-5 w-5 mr-2 group-hover:animate-bounce" />
              Call Seller
            </div>
          </button>
          
          <button
            onClick={handleWhatsApp}
            className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <div className="relative flex items-center justify-center">
              <MessageCircle className="h-5 w-5 mr-2 group-hover:animate-pulse" />
              WhatsApp
            </div>
          </button>
        </div>

        {/* Enhanced Safety Tips */}
        <div className="relative p-6 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border border-yellow-200/50 rounded-xl overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-300 to-orange-300 animate-pulse"></div>
          </div>
          
          <div className="relative">
            <h5 className="font-bold text-yellow-800 mb-3 flex items-center">
              <Globe className="h-5 w-5 mr-2 animate-spin" />
              Safety Tips
            </h5>
            <ul className="text-sm text-yellow-700 space-y-2">
              {[
                'Meet in public places for exchanges',
                'Test the phone before purchasing', 
                'Verify IMEI and ownership',
                'Use secure payment methods'
              ].map((tip, index) => (
                <li 
                  key={tip} 
                  className="flex items-center animate-slide-in" 
                  style={{ 
                    animationDelay: `${index * 200}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Response Time Badge */}
        {seller.responseTime && (
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Usually responds within {seller.responseTime}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SellerCard;