import React, { useState } from 'react';
import { Eye, Edit, Trash2, Calendar, MapPin, Smartphone, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';

const SellerListingCard = ({ phone, onViewDetails, onEdit, onDelete }) => {
  const isSold = !phone.isAvailable;
  
  const handleViewClick = () => {
    // Add debugging logs
    console.log('=== DEBUG: View Details Clicked ===');
    console.log('Phone object:', phone);
    console.log('Phone ID (_id):', phone._id);
    console.log('Phone ID (id):', phone.id);
    console.log('Phone available keys:', Object.keys(phone));
    console.log('Is sold:', isSold);
    
    if (onViewDetails) {
      console.log('Calling onViewDetails...');
      onViewDetails(phone);
    } else {
      console.error('onViewDetails is not defined!');
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(phone);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(phone);
    }
  };

  return (
    <div className={`group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-2xl border transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 ${
      isSold 
        ? 'border-red-500/30 opacity-75' 
        : 'border-gray-700/50 hover:border-purple-500/50'
    }`}>
      {/* Sold Overlay */}
      {isSold && (
        <div className="absolute top-6 left-6 z-10">
          <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transform -rotate-12">
            SOLD
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-20">
        {isSold ? (
          <div className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <XCircle className="h-4 w-4 mr-1" />
            Sold
          </div>
        ) : (
          <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Available
          </div>
        )}
      </div>

      <div className="flex gap-6">
        {/* Phone Image */}
        <div className="relative">
          <div className="w-32 h-40 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl overflow-hidden shadow-lg">
            <img
              src={phone.images && phone.images[0] ? phone.images[0] : '/api/placeholder/128/160'}
              alt={phone.title}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isSold ? 'grayscale' : 'group-hover:scale-110'
              }`}
              onError={(e) => {
                e.target.src = '/api/placeholder/128/160';
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Phone Details */}
        <div className="flex-1 space-y-4">
          {/* Title and Brand */}
          <div>
            <h3 className={`text-xl font-bold mb-1 ${isSold ? 'text-gray-400' : 'text-white'}`}>
              {phone.title}
            </h3>
            <p className="text-gray-400 font-medium">{phone.brand}</p>
          </div>

          {/* Price and Info */}
          <div className="space-y-3">
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${isSold ? 'text-gray-400' : 'text-green-400'}`}>
                LKR {phone.price?.toLocaleString()}
              </span>
              {phone.originalPrice && phone.originalPrice > phone.price && (
                <span className="text-gray-500 line-through ml-3 text-lg">
                  LKR {phone.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex items-center text-gray-400">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Listed {new Date(phone.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>

            {phone.location && (
              <div className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">{phone.location}</span>
              </div>
            )}
          </div>

          {/* Condition Badge */}
          <div className="flex items-start">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
              phone.condition === 'New' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              phone.condition === 'Excellent' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
              phone.condition === 'Very Good' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
              phone.condition === 'Good' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
              phone.condition === 'Fair' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
              'bg-gray-500/20 text-gray-400 border-gray-500/30'
            }`}>
              {phone.condition}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleViewClick}
          className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
            isSold 
              ? 'bg-gray-600/50 text-gray-400 hover:bg-gray-500/50' 
              : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/25'
          }`}
        >
          <Eye className="h-5 w-5 mr-2" />
          View Details
        </button>
        
        {!isSold && (
          <>
            <button
              onClick={handleEditClick}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white p-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              title="Edit Phone"
            >
              <Edit className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleDeleteClick}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white p-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
              title="Delete Phone"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const SellerListingsTab = ({ 
  listings = [], 
  onViewDetails, 
  onEdit, 
  onDelete, 
  onAddNew,
  loading = false, 
  error = null 
}) => {
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'sold'

  // Add debugging logs
  console.log('=== SellerListingsTab Debug ===');
  console.log('onViewDetails prop:', onViewDetails);
  console.log('onViewDetails type:', typeof onViewDetails);
  console.log('listings length:', listings.length);

  // Filter listings based on selected filter
  const filteredListings = listings.filter(phone => {
    if (filter === 'available') return phone.isAvailable;
    if (filter === 'sold') return !phone.isAvailable;
    return true; // 'all'
  });

  const availableCount = listings.filter(phone => phone.isAvailable).length;
  const soldCount = listings.filter(phone => !phone.isAvailable).length;

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
        <p className="text-gray-400 text-xl mt-4">Loading your listings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-red-900/20 backdrop-blur-lg rounded-3xl border border-red-500/30">
        <div className="text-red-400 mb-4">
          <h3 className="text-2xl font-bold mb-2">Error Loading Listings</h3>
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Header with Filters */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            My Listings
          </h2>
          <p className="text-gray-400">
            {listings.length} total listings • {availableCount} available • {soldCount} sold
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
          {/* Filter Tabs */}
          <div className="flex bg-gray-800/50 rounded-xl p-1">
            {[
              { key: 'all', label: 'All', count: listings.length },
              { key: 'available', label: 'Available', count: availableCount },
              { key: 'sold', label: 'Sold', count: soldCount }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center ${
                  filter === key
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {label}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  filter === key ? 'bg-white/20' : 'bg-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Add New Phone Button */}
          <button
            onClick={onAddNew}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg shadow-green-500/25"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Phone
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredListings.map((phone, index) => (
            <div key={phone._id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <SellerListingCard
                phone={phone}
                onViewDetails={(phone) => {
                  console.log('=== SellerListingCard onViewDetails called ===');
                  console.log('Received phone:', phone);
                  console.log('Calling parent onViewDetails:', onViewDetails);
                  if (onViewDetails) {
                    onViewDetails(phone);
                  } else {
                    console.error('Parent onViewDetails is undefined!');
                  }
                }}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800/20 backdrop-blur-lg rounded-3xl border border-gray-700/30">
          <Smartphone className="h-24 w-24 text-gray-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-300 mb-4">
            {filter === 'available' ? 'No available listings' :
             filter === 'sold' ? 'No sold listings' :
             'No listings yet'}
          </h3>
          <p className="text-gray-500 mb-8">
            {filter === 'available' ? 'All your listings have been sold or are unavailable.' :
             filter === 'sold' ? 'You haven\'t sold any phones yet.' :
             'Start selling by adding your first phone listing.'}
          </p>
          {(filter === 'all' || filter === 'available') && (
            <button
              onClick={onAddNew}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Add Your Phone
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default SellerListingsTab;