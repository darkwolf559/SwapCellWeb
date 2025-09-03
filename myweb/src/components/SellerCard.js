import React, { useState } from 'react';
import { Phone, MessageCircle, Shield, Lock, User, Star, Award, Globe } from 'lucide-react';

const SellerCard = ({ seller }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCall = () => {
    window.open(`tel:${seller.phone}`);
  };

  const handleWhatsApp = () => {
    const phoneNumber = seller.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phoneNumber}`);
  };

  return (
    <div className="relative group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-blue-600/20 to-purple-600/20 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl"></div>

      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/30 transition-all duration-500 group-hover:shadow-emerald-500/20">
        {/* Header */}
        <div className="flex items-center mb-8">
          <div className="relative">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl animate-pulse">
              <Shield className="h-6 w-6 text-white" />
            </div>
            {isHovered && <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-xl animate-ping opacity-75"></div>}
          </div>
          <h3 className="ml-4 font-bold text-2xl bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Verified Seller</h3>
          <div className="ml-auto">
            <Lock className="h-5 w-5 text-green-500 animate-pulse" />
          </div>
        </div>

        {/* Seller Profile */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center">
            <div className="relative group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110">
                <User className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 border-2 border-blue-300/50 rounded-full animate-spin group-hover:border-purple-400"></div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="ml-6">
              <h4 className="font-bold text-xl text-gray-900 mb-2">{seller.name}</h4>
              <div className="flex items-center mb-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current animate-pulse" />
                <span className="ml-2 text-sm text-gray-700 font-semibold">{seller.rating}</span>
                <span className="text-sm text-gray-500 ml-1">seller rating</span>
              </div>
              <div className="flex items-center">
                <Award className="h-5 w-5 text-emerald-500 animate-bounce" />
                <span className="ml-2 text-sm text-gray-600">Verified since 2023</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Items Sold', value: '24', color: 'from-blue-500 to-cyan-500' },
            { label: 'Response Rate', value: '95%', color: 'from-purple-500 to-pink-500' },
            { label: 'Avg Response', value: '2h', color: 'from-emerald-500 to-teal-500' }
          ].map((stat, index) => (
            <div key={stat.label} className="relative group cursor-pointer" style={{ animationDelay: `${index * 200}ms` }}>
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-20 rounded-xl blur transition-all duration-300`}></div>
              <div className="relative text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
                <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button onClick={handleCall} className="group relative bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 overflow-hidden">
            <Phone className="h-5 w-5 mr-2 group-hover:animate-bounce" />
            Call Seller
          </button>
          <button onClick={handleWhatsApp} className="group relative bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 overflow-hidden">
            <MessageCircle className="h-5 w-5 mr-2 group-hover:animate-pulse" />
            WhatsApp
          </button>
        </div>

        {/* Safety Tips */}
        <div className="relative p-6 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border border-yellow-200/50 rounded-xl overflow-hidden">
          <h5 className="font-bold text-yellow-800 mb-3 flex items-center">
            <Globe className="h-5 w-5 mr-2 animate-spin" />
            Safety Tips
          </h5>
          <ul className="text-sm text-yellow-700 space-y-2">
            {['Meet in public places for exchanges', 'Test the phone before purchasing', 'Verify IMEI and ownership'].map((tip, index) => (
              <li key={tip} className="flex items-center" style={{ animationDelay: `${index * 200}ms` }}>
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SellerCard;
