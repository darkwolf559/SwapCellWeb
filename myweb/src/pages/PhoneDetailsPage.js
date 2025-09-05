import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MessageCircle, Heart, Share2, MapPin, Clock, User, Star, Eye, AlertCircle, Loader } from 'lucide-react';
import { useCart } from '../utils/CartContext';
import { useFavorites } from '../utils/FavoritesContext';
import { useAuth } from '../utils/AuthContext';
import SpecificationGrid from '../components/SpecificationGrid';
import SellerCard from '../components/SellerCard';
import { phoneAPI } from '../utils/api';

const PhoneDetailsPage = ({ phone, onNavigate }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phoneDetails, setPhoneDetails] = useState(phone);
  const [relatedPhones, setRelatedPhones] = useState([]);
  
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const { user } = useAuth();

  // Fetch detailed phone data
  useEffect(() => {
    const fetchPhoneDetails = async () => {
      if (!phone || !phone._id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await phoneAPI.getPhone(phone._id);
        setPhoneDetails(response.data);
        
        // Fetch related phones
        const relatedResponse = await phoneAPI.getPhones({
          brand: response.data.brand,
          limit: 4
        });
        
        // Filter out current phone from related
        const filtered = relatedResponse.data.phones.filter(p => p._id !== phone._id);
        setRelatedPhones(filtered.slice(0, 3));
        
      } catch (err) {
        console.error('Failed to fetch phone details:', err);
        setError('Failed to load phone details');
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneDetails();
  }, [phone]);

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

  const currentPhone = phoneDetails || phone;

  const handleAddToCart = async () => {
    try {
      const result = await addToCart(currentPhone, quantity);
      if (result.success) {
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 3000);
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  const handleContactSeller = () => {
    if (currentPhone.sellerId?.phone) {
      window.open(`tel:${currentPhone.sellerId.phone}`);
    }
  };

  const handleWhatsApp = () => {
    const message = `Hi, I'm interested in your ${currentPhone.title} listed for LKR ${currentPhone.price}`;
    const phoneNumber = currentPhone.sellerId?.phone?.replace(/[^0-9]/g, '');
    if (phoneNumber) {
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentPhone.title,
        text: `Check out this ${currentPhone.title} for LKR ${currentPhone.price}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader className="h-16 w-16 text-purple-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400 text-xl">Loading phone details...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20 bg-red-900/20 backdrop-blur-lg rounded-3xl border border-red-500/30">
            <AlertCircle className="h-24 w-24 text-red-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-red-300 mb-4">Failed to Load Details</h3>
            <p className="text-red-400 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 
                       text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 
                       transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Image Section */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl"></div>
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                  <img
                    src={currentPhone.images?.[selectedImageIndex] || currentPhone.image || '/api/placeholder/400/400'}
                    alt={currentPhone.title}
                    className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/400/400';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Thumbnails */}
              {currentPhone.images && currentPhone.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {currentPhone.images.slice(0, 4).map((img, index) => (
                    <div
                      key={index}
                      className={`relative group cursor-pointer transition-all duration-300 ${
                        selectedImageIndex === index ? 'transform scale-110' : 'hover:scale-105'
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${
                          selectedImageIndex === index
                            ? 'from-blue-500 to-purple-500'
                            : 'from-gray-300 to-gray-400'
                        } rounded-xl blur transition-all duration-300 ${
                          selectedImageIndex === index ? 'opacity-50' : 'opacity-0 group-hover:opacity-30'
                        }`}
                      ></div>
                      <img
                        src={img}
                        alt={`${currentPhone.title} ${index + 1}`}
                        className={`relative w-full h-20 object-cover rounded-xl border-2 transition-all duration-300 ${
                          selectedImageIndex === index
                            ? 'border-blue-400 shadow-lg shadow-blue-500/50'
                            : 'border-white/20 hover:border-purple-400'
                        }`}
                        onError={(e) => {
                          e.target.src = '/api/placeholder/80/80';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Specification Grid */}
              <SpecificationGrid specs={currentPhone.specs || {}} />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Title and Info */}
              <div>
                <div className="flex justify-between items-start">
                  <h1 className="text-4xl font-bold leading-normal pb-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {currentPhone.title}
                  </h1>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => toggleFavorite(currentPhone._id)}
                      className="group p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                    >
                      <Heart
                        className={`h-6 w-6 transition-all duration-300 ${
                          favorites.includes(currentPhone._id)
                            ? 'text-red-500 fill-current animate-pulse'
                            : 'text-gray-400 group-hover:text-red-400'
                        }`}
                      />
                    </button>
                    <button
                      onClick={handleShare}
                      className="group p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                    >
                      <Share2 className="h-6 w-6 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-400 mb-2 space-x-6">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{currentPhone.location || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatDate(currentPhone.createdAt)}</span>
                  </div>
                </div>

                {/* Condition Badge */}
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    currentPhone.condition === 'Excellent' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    currentPhone.condition === 'Very Good' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    currentPhone.condition === 'Good' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                  }`}>
                    {currentPhone.condition} Condition
                  </span>
                  <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-full text-sm font-semibold">
                    {currentPhone.brand}
                  </span>
                </div>
              </div>

              {/* Price Section */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-blue-50/90 to-purple-50/90 backdrop-blur-xl rounded-2xl p-8 border border-white/30 shadow-2xl">
                  <div className="flex items-center space-x-6 mb-4">
                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      LKR {currentPhone.price?.toLocaleString()}
                    </span>
                    {currentPhone.originalPrice && currentPhone.originalPrice > currentPhone.price && (
                      <div className="text-center">
                        <span className="text-gray-500 line-through text-xl">
                          LKR {currentPhone.originalPrice.toLocaleString()}
                        </span>
                        <div className="text-green-600 font-semibold text-sm">
                          Save LKR {(currentPhone.originalPrice - currentPhone.price).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 font-semibold">
                    {currentPhone.isAvailable ? 'Available now' : 'Currently unavailable'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {currentPhone.description && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200/10 to-white/10 rounded-2xl blur-xl"></div>
                  <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/30">
                    <h3 className="font-bold text-gray-800 mb-3 text-lg">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{currentPhone.description}</p>
                  </div>
                </div>
              )}

              {/* Quantity Selector - Only show if available */}
              {currentPhone.isAvailable && (
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
                          LKR {(currentPhone.price * quantity).toLocaleString()}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4">
                {currentPhone.isAvailable && user && user.id !== currentPhone.sellerId?._id ? (
                  <div className="relative">
                    <button
                      onClick={handleAddToCart}
                      className="group relative w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-500 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center">
                        <span>Add to Cart - LKR {(currentPhone.price * quantity).toLocaleString()}</span>
                      </div>
                      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 animate-pulse"></div>
                    </button>
                    
                    {showSuccessAnimation && (
                      <div className="absolute inset-0 bg-green-500 text-white rounded-2xl flex items-center justify-center animate-pulse">
                        <span className="font-bold text-xl">Added to Cart!</span>
                      </div>
                    )}
                  </div>
                ) : !currentPhone.isAvailable ? (
                  <div className="w-full bg-gray-500 text-white py-6 px-8 rounded-2xl font-bold text-xl text-center opacity-50 cursor-not-allowed">
                    Currently Unavailable
                  </div>
                ) : user && user.id === currentPhone.sellerId?._id ? (
                  <div className="w-full bg-yellow-500 text-white py-6 px-8 rounded-2xl font-bold text-xl text-center">
                    This is your listing
                  </div>
                ) : (
                  <div className="w-full bg-gray-500 text-white py-6 px-8 rounded-2xl font-bold text-xl text-center opacity-50">
                    Please log in to purchase
                  </div>
                )}
                
                {/* Contact buttons - only show if not own listing */}
                {currentPhone.sellerId && user?.id !== currentPhone.sellerId._id && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleContactSeller}
                      disabled={!currentPhone.sellerId.phone}
                      className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center">
                        <Phone className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                        Call Now
                      </div>
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      disabled={!currentPhone.sellerId.phone}
                      className="group relative bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                        WhatsApp
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Seller Card */}
              {currentPhone.sellerId && (
                <SellerCard seller={currentPhone.sellerId} />
              )}
            </div>
          </div>
        )}

        {/* Related Phones */}
        {relatedPhones.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-8">
              Similar Phones You Might Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPhones.map((relatedPhone, index) => (
                <div key={relatedPhone._id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div 
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 transform hover:scale-105 cursor-pointer"
                    onClick={() => {
                      setPhoneDetails(relatedPhone);
                      setSelectedImageIndex(0);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <img
                      src={relatedPhone.images?.[0] || relatedPhone.image || '/api/placeholder/300/200'}
                      alt={relatedPhone.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/300/200';
                      }}
                    />
                    <h3 className="text-xl font-bold text-white mb-2">{relatedPhone.title}</h3>
                    <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      LKR {relatedPhone.price.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">{relatedPhone.condition} condition</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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