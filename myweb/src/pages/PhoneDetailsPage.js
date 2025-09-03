import React, { useState } from 'react';
import { ArrowLeft, Star, Phone, MessageCircle, Heart, Share2, Eye, MapPin, Clock, Zap } from 'lucide-react';
import { useCart } from '../utils/CartContext';
import { useFavorites } from '../utils/FavoritesContext';
import SpecificationGrid from '../components/SpecificationGrid';
import SellerCard from '../components/SellerCard';

const PhoneDetailsPage = ({ phone, onNavigate }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();

  if (!phone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mb-8 mx-auto"></div>
          <h2 className="text-3xl font-bold text-white mb-6">Phone not found</h2>
          <button
            onClick={() => onNavigate('phones')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    const result = await addToCart(phone, quantity);
    if (result.success) {
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 3000);
    }
  };

  const handleContactSeller = () => {
    window.open(`tel:${phone.seller.phone}`);
  };

  const handleWhatsApp = () => {
    const message = `Hi, I'm interested in your ${phone.title} listed for $${phone.price}`;
    const phoneNumber = phone.seller.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: phone.title,
        text: `Check out this ${phone.title} for $${phone.price}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const discountPercentage = phone.originalPrice 
    ? Math.round((1 - phone.price / phone.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('phones')}
          className="group flex items-center text-blue-400 hover:text-blue-300 mb-8 transition-all duration-300 transform hover:scale-105"
        >
          <div className="p-2 bg-blue-500/20 rounded-lg mr-3 group-hover:bg-blue-500/30 transition-colors">
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
          </div>
          <span className="font-semibold">Back to listings</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                <img
                  src={phone.image}
                  alt={phone.title}
                  className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
            
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {[phone.image, phone.image, phone.image, phone.image].map((img, index) => (
                <div
                  key={index}
                  className={`relative group cursor-pointer transition-all duration-300 ${
                    selectedImageIndex === index ? 'transform scale-110' : 'hover:scale-105'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${
                    selectedImageIndex === index 
                      ? 'from-blue-500 to-purple-500' 
                      : 'from-gray-300 to-gray-400'
                  } rounded-xl blur transition-all duration-300 ${
                    selectedImageIndex === index ? 'opacity-50' : 'opacity-0 group-hover:opacity-30'
                  }`}></div>
                  <img
                    src={img}
                    alt={`${phone.title} ${index + 1}`}
                    className={`relative w-full h-20 object-cover rounded-xl border-2 transition-all duration-300 ${
                      selectedImageIndex === index 
                        ? 'border-blue-400 shadow-lg shadow-blue-500/50' 
                        : 'border-white/20 hover:border-purple-400'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            {/* Title and Info */}
            <div>
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {phone.title}
                </h1>
                <div className="flex space-x-3">
                  <button
                    onClick={() => toggleFavorite(phone.id)}
                    className="group p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                  >
                    <Heart className={`h-6 w-6 transition-all duration-300 ${
                      favorites.includes(phone.id) 
                        ? 'text-red-500 fill-current animate-pulse' 
                        : 'text-gray-400 group-hover:text-red-400'
                    }`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="group p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                  >
                    <Share2 className="h-6 w-6 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current animate-pulse" />
                  <span className="text-gray-300 font-semibold">{phone.rating}</span>
                  <span className="text-gray-500">({phone.reviews} reviews)</span>
                </div>
                <span className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {phone.condition}
                </span>
                <div className="flex items-center text-sm text-gray-400">
                  <Eye className="h-4 w-4 mr-1 animate-pulse" />
                  <span>156 views</span>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-400 mb-8 space-x-6">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{phone.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{phone.postedTime}</span>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-gradient-to-br from-blue-50/90 to-purple-50/90 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-2xl">
                <div className="flex items-center space-x-6 mb-4">
                  <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ${phone.price}
                  </span>
                  {phone.originalPrice && (
                    <>
                      <span className="text-2xl text-gray-500 line-through">${phone.originalPrice}</span>
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                        {discountPercentage}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-gray-600 font-semibold">
                  Save ${phone.originalPrice ? phone.originalPrice - phone.price : 0} compared to retail price
                </p>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200/20 to-white/20 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/30">
                <label className="block text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Quantity</label>
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="group w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white rounded-xl flex items-center justify-center font-bold text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                  >
                    -
                  </button>
                  <span className="text-3xl font-bold w-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="group w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                  >
                    +
                  </button>
                  <span className="text-lg font-semibold text-gray-600 ml-6">
                    Total: <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ${(phone.price * quantity).toFixed(2)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="relative">
                <button
                  onClick={handleAddToCart}
                  className="group relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-500 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center">
                    <span>Add to Cart - ${(phone.price * quantity).toFixed(2)}</span>
                  </div>
                  <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-pulse"></div>
                </button>
                
                {showSuccessAnimation && (
                  <div className="absolute inset-0 bg-green-500 text-white rounded-2xl flex items-center justify-center animate-pulse">
                    <span className="font-bold text-xl">Added to Cart!</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleContactSeller}
                  className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center">
                    <Phone className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                    Call Now
                  </div>
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="group relative bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                    WhatsApp
                  </div>
                </button>
              </div>
            </div>

            {/* Specs */}
            <SpecificationGrid specs={phone.specs} />

            {/* Seller */}
            <SellerCard seller={phone.seller} />
          </div>
        </div>

        {/* Floating particles */}
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhoneDetailsPage;
