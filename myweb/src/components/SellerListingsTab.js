import React, { useState } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  Smartphone, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus,
  AlertTriangle,
  Info,
  MessageSquare
} from 'lucide-react';

const SellerListingCard = ({ phone, onViewDetails, onEdit, onDelete }) => {
  // Ensure phone exists and has required fields
  if (!phone) return null;
  
  const isSold = !phone.isAvailable;
  // Default to 'approved' for phones without status (legacy phones)
  const phoneStatus = phone.status || 'approved';
  const isPending = phoneStatus === 'pending';
  const isRejected = phoneStatus === 'rejected';
  const isApproved = phoneStatus === 'approved';
  
  // Determine if the listing should be clickable
  const isClickable = isApproved && !isSold;
  
  const handleViewClick = () => {
    // Only allow viewing details for approved and available phones
    if (!isClickable) {
      console.log('Details view disabled for this listing status');
      return;
    }
    
    console.log('=== DEBUG: View Details Clicked ===');
    console.log('Phone object:', phone);
    console.log('Phone ID (_id):', phone._id);
    console.log('Phone status:', phoneStatus);
    
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

  // Get status display information
  const getStatusInfo = () => {
    switch (phoneStatus) {
      case 'pending':
        return {
          badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          icon: Clock,
          label: 'Pending Review',
          description: 'Your listing is being reviewed by our admin team'
        };
      case 'approved':
        return {
          badge: 'bg-green-500/20 text-green-400 border-green-500/30',
          icon: CheckCircle,
          label: 'Approved',
          description: 'Your listing is live and visible to buyers'
        };
      case 'rejected':
        return {
          badge: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: XCircle,
          label: 'Rejected',
          description: phone.adminNotes || 'Listing was rejected by admin'
        };
      default:
        return {
          badge: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          icon: AlertTriangle,
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-2xl border transition-all duration-500 ${
      isClickable 
        ? 'transform hover:scale-[1.02] hover:-translate-y-1 border-gray-700/50 hover:border-purple-500/50'
        : 'border-gray-700/30'
    } ${
      isSold 
        ? 'opacity-75' 
        : isRejected
        ? 'border-red-500/50'
        : isPending
        ? 'border-yellow-500/50'
        : ''
    }`}>
      
      {/* Sold Overlay - only show for approved items that are sold */}
      {isSold && isApproved && (
        <div className="absolute top-6 left-6 z-10">
          <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg transform -rotate-12">
            SOLD
          </div>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-4 right-4 z-20">
        <div className={`${statusInfo.badge} border px-3 py-1 rounded-full text-sm font-medium flex items-center`}>
          <statusInfo.icon className="h-4 w-4 mr-1" />
          {statusInfo.label}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Phone Image */}
        <div className="relative">
          <div className="w-32 h-40 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl overflow-hidden shadow-lg">
            <img
              src={phone.images && phone.images[0] ? phone.images[0] : '/api/placeholder/128/160'}
              alt={phone.title || 'Phone'}
              className={`w-full h-full object-cover transition-all duration-300 ${
                isSold || isRejected ? 'grayscale' : isClickable ? 'group-hover:scale-110' : ''
              }`}
              onError={(e) => {
                e.target.src = '/api/placeholder/128/160';
              }}
            />
          </div>
          {isClickable && (
            <div className={`absolute inset-0 bg-gradient-to-br rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isRejected ? 'from-red-500/10 to-pink-500/10' :
              isPending ? 'from-yellow-500/10 to-orange-500/10' :
              'from-cyan-500/10 to-purple-500/10'
            }`} />
          )}
        </div>

        {/* Phone Details */}
        <div className="flex-1 space-y-4">
          {/* Title and Brand */}
          <div>
            <h3 className={`text-xl font-bold mb-1 ${isSold || isRejected ? 'text-gray-400' : 'text-white'}`}>
              {phone.title || 'Untitled Phone'}
            </h3>
            <p className="text-gray-400 font-medium">{phone.brand || 'Unknown Brand'}</p>
          </div>

          {/* Price and Info */}
          <div className="space-y-3">
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${
                isSold || isRejected ? 'text-gray-400' : 
                isApproved ? 'text-green-400' : 
                'text-yellow-400'
              }`}>
                LKR {phone.price ? phone.price.toLocaleString() : 'N/A'}
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
                Listed {phone.createdAt ? new Date(phone.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Unknown date'}
              </span>
            </div>

            {phone.location && (
              <div className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">{phone.location}</span>
              </div>
            )}

            {/* Views count for approved listings */}
            {isApproved && phone.views > 0 && (
              <div className="flex items-center text-gray-400">
                <Eye className="h-4 w-4 mr-2" />
                <span className="text-sm">{phone.views} views</span>
              </div>
            )}
          </div>

          {/* Status Description */}
          <div className={`p-3 rounded-xl border ${
            isPending ? 'bg-yellow-500/10 border-yellow-500/30' :
            isApproved ? 'bg-green-500/10 border-green-500/30' :
            isRejected ? 'bg-red-500/10 border-red-500/30' :
            'bg-gray-500/10 border-gray-500/30'
          }`}>
            <div className="flex items-start">
              <Info className={`h-4 w-4 mr-2 mt-0.5 flex-shrink-0 ${
                isPending ? 'text-yellow-400' :
                isApproved ? 'text-green-400' :
                isRejected ? 'text-red-400' :
                'text-gray-400'
              }`} />
              <div className="flex-1">
                <p className={`text-sm ${
                  isPending ? 'text-yellow-300' :
                  isApproved ? 'text-green-300' :
                  isRejected ? 'text-red-300' :
                  'text-gray-300'
                }`}>
                  {statusInfo.description}
                </p>
                
                {/* Show admin notes for rejected listings */}
                {isRejected && phone.adminNotes && phone.adminNotes !== statusInfo.description && (
                  <div className="mt-2 p-2 bg-red-900/20 rounded-lg">
                    <div className="flex items-center text-red-400 text-xs mb-1">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Admin Note:
                    </div>
                    <p className="text-red-300 text-xs">{phone.adminNotes}</p>
                  </div>
                )}

                {/* Show approval date for approved listings */}
                {isApproved && phone.approvedAt && (
                  <p className="text-green-400 text-xs mt-1">
                    Approved {new Date(phone.approvedAt).toLocaleDateString()}
                    {phone.approvedBy && phone.approvedBy.name && ` by ${phone.approvedBy.name}`}
                  </p>
                )}

                {/* Show rejection date for rejected listings */}
                {isRejected && phone.rejectedAt && (
                  <p className="text-red-400 text-xs mt-1">
                    Rejected {new Date(phone.rejectedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
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
              {phone.condition || 'Not specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleViewClick}
          disabled={!isClickable}
          className={`flex-1 flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
            isClickable
              ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-purple-500/25 transform hover:scale-105 cursor-pointer'
              : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
          }`}
          title={isClickable ? 'View Details' : 'Details not available for this listing'}
        >
          <Eye className="h-5 w-5 mr-2" />
          View Details
        </button>
        
        {/* Show edit button for non-sold listings */}
        {!isSold && (
          <button
            onClick={handleEditClick}
            className={`p-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg ${
              isRejected 
                ? 'bg-gradient-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 text-white'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white'
            }`}
            title={isRejected ? "Edit & Resubmit" : "Edit Phone"}
          >
            <Edit className="h-5 w-5" />
          </button>
        )}
        
        {/* Show delete button for sellers and admin */}
        <button
          onClick={handleDeleteClick}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white p-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
          title="Delete Phone"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Resubmit Notice for Rejected Listings */}
      {isRejected && (
        <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
          <p className="text-orange-300 text-sm text-center">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            Address the issues and resubmit for review
          </p>
        </div>
      )}
    </div>
  );
};

const SellerListingsTab = ({ 
  listings = [], 
  statusCounts = {},
  onViewDetails, 
  onEdit, 
  onDelete, 
  onAddNew,
  onFilterChange,
  loading = false, 
  error = null 
}) => {
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected', 'sold'

  // Handle the data structure - check if listings is an object with phones property
  let safeListings = [];
  let safePagination = {};
  let safeStatusCounts = {};

  if (listings && typeof listings === 'object') {
    if (Array.isArray(listings)) {
      // listings is already an array
      safeListings = listings;
    } else if (listings.phones && Array.isArray(listings.phones)) {
      // listings is an object with phones array
      safeListings = listings.phones;
      safePagination = listings.pagination || {};
      safeStatusCounts = listings.statusCounts || statusCounts;
    } else {
      // listings is some other object structure
      console.warn('Unexpected listings structure:', listings);
      safeListings = [];
    }
  }

  // Use the provided statusCounts or calculate from data
const counts = safeStatusCounts.total ? safeStatusCounts : statusCounts.total ? statusCounts : {
  pending: safeListings.filter(p => p && (p.status || 'approved') === 'pending').length,
  approved: safeListings.filter(p => p && (p.status || 'approved') === 'approved' && p.isAvailable).length,
  rejected: safeListings.filter(p => p && (p.status || 'approved') === 'rejected').length,
  sold: safeListings.filter(p => p && !p.isAvailable && (p.status || 'approved') === 'approved').length,
  total: safeListings.length
};


  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (onFilterChange) {
      onFilterChange(newFilter);
    }
  };

  // Filter listings based on selected filter - FIXED LOGIC
  const filteredListings = safeListings.filter(phone => {
    if (!phone) return false;
    
    // Default to 'approved' for phones without status (legacy phones)
    const phoneStatus = phone.status || 'approved';
    const isSold = !phone.isAvailable;
    
    if (filter === 'pending') return phoneStatus === 'pending';
    if (filter === 'approved') return phoneStatus === 'approved' && phone.isAvailable; // Only show available approved items
    if (filter === 'rejected') return phoneStatus === 'rejected';
    if (filter === 'sold') return phoneStatus === 'approved' && isSold; // Only show sold approved items
    return true; // 'all'
  });

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
            {counts.total} total listings • {counts.approved} live • {counts.pending} pending review
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
          {/* Filter Tabs */}
          <div className="flex bg-gray-800/50 rounded-xl p-1">
            {[
              { key: 'all', label: 'All', count: counts.total },
              { key: 'approved', label: 'Live', count: counts.approved },
              { key: 'pending', label: 'Pending', count: counts.pending },
              { key: 'rejected', label: 'Rejected', count: counts.rejected },
              { key: 'sold', label: 'Sold', count: counts.sold }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => handleFilterChange(key)}
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
          {onAddNew && (
            <button
              onClick={onAddNew}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg shadow-green-500/25"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Phone
            </button>
          )}
        </div>
      </div>

      {/* Status Notice */}
      {filter === 'pending' && counts.pending > 0 && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl">
          <div className="flex items-center text-yellow-300">
            <Clock className="h-5 w-5 mr-2" />
            <p>These listings are waiting for admin approval. You'll be notified once they're reviewed.</p>
          </div>
        </div>
      )}

      {filter === 'rejected' && counts.rejected > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <div className="flex items-center text-red-300">
            <XCircle className="h-5 w-5 mr-2" />
            <p>These listings were rejected. Review the admin notes and edit them to resubmit for approval.</p>
          </div>
        </div>
      )}

      {filter === 'sold' && counts.sold > 0 && (
        <div className="mb-6 p-4 bg-gray-500/10 border border-gray-500/30 rounded-2xl">
          <div className="flex items-center text-gray-300">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p>These listings have been sold and are no longer available to buyers.</p>
          </div>
        </div>
      )}

      {/* Listings Grid */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredListings.map((phone, index) => {
            if (!phone || !phone._id) {
              console.warn('Invalid phone object:', phone);
              return null;
            }
            
            return (
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
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800/20 backdrop-blur-lg rounded-3xl border border-gray-700/30">
          <Smartphone className="h-24 w-24 text-gray-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-300 mb-4">
            {filter === 'approved' ? 'No live listings' :
             filter === 'pending' ? 'No pending listings' :
             filter === 'rejected' ? 'No rejected listings' :
             filter === 'sold' ? 'No sold listings' :
             'No listings yet'}
          </h3>
          <p className="text-gray-500 mb-8">
            {filter === 'approved' ? 'Your approved listings will appear here.' :
             filter === 'pending' ? 'Listings waiting for admin approval will appear here.' :
             filter === 'rejected' ? 'Rejected listings that need attention will appear here.' :
             filter === 'sold' ? 'Your sold listings will appear here.' :
             'Start selling by adding your first phone listing.'}
          </p>
          {(filter === 'all' || filter === 'approved') && onAddNew && (
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