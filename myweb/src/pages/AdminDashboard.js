import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Smartphone, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Filter,
  Search,
  MoreVertical,
  Calendar,
  MapPin,
  Star,
  User,
  Check,
  X
} from 'lucide-react';
import { adminAPI } from '../utils/api';

const AdminDashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      totalUsers: 0,
      totalSellers: 0
    },
    recentPendingListings: [],
    recentApprovedListings: []
  });
  const [pendingListings, setPendingListings] = useState([]);
  const [selectedListings, setSelectedListings] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    brand: 'all',
    sortBy: 'createdAt',
    order: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Fetch dashboard data using the API utility
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboardStats();
      
      if (response.data) {
        setDashboardData(response.data);
      } else {
        console.error('No data received from dashboard stats');
        // Set default empty state
        setDashboardData({
          stats: {
            pendingCount: 0,
            approvedCount: 0,
            rejectedCount: 0,
            totalUsers: 0,
            totalSellers: 0
          },
          recentPendingListings: [],
          recentApprovedListings: []
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      showNotification('Failed to load dashboard data', 'error');
      
      // Set default empty state on error
      setDashboardData({
        stats: {
          pendingCount: 0,
          approvedCount: 0,
          rejectedCount: 0,
          totalUsers: 0,
          totalSellers: 0
        },
        recentPendingListings: [],
        recentApprovedListings: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending listings using the API utility
  const fetchPendingListings = async (page = 1) => {
    try {
      const queryParams = {
        page: page.toString(),
        limit: '10',
        ...filters
      };

      const response = await adminAPI.getPendingListings(queryParams);
      
      if (response.data) {
        setPendingListings(response.data.listings || []);
        setPagination(response.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch pending listings:', error);
      showNotification('Failed to load pending listings', 'error');
    }
  };

  // Approve listing using the API utility
  const approveListing = async (phoneId, adminNotes = '') => {
    try {
      const result = await adminAPI.approveListing(phoneId, adminNotes);
      
      if (result.success) {
        // Refresh data
        fetchPendingListings(pagination.currentPage);
        fetchDashboardData();
        
        showNotification(result.message || 'Listing approved successfully!', 'success');
      } else {
        showNotification(result.message || 'Failed to approve listing', 'error');
      }
    } catch (error) {
      console.error('Failed to approve listing:', error);
      showNotification('Failed to approve listing', 'error');
    }
  };

  // Reject listing using the API utility
  const rejectListing = async (phoneId, reason, adminNotes = '') => {
    try {
      const result = await adminAPI.rejectListing(phoneId, reason, adminNotes);
      
      if (result.success) {
        // Refresh data
        fetchPendingListings(pagination.currentPage);
        fetchDashboardData();
        
        showNotification(result.message || 'Listing rejected', 'success');
      } else {
        showNotification(result.message || 'Failed to reject listing', 'error');
      }
    } catch (error) {
      console.error('Failed to reject listing:', error);
      showNotification('Failed to reject listing', 'error');
    }
  };

  // Batch approve selected listings using the API utility
  const batchApprove = async () => {
    if (selectedListings.length === 0) return;

    try {
      const result = await adminAPI.batchApproveListing(
        selectedListings,
        'Batch approved by admin'
      );

      if (result.success) {
        setSelectedListings([]);
        fetchPendingListings(pagination.currentPage);
        fetchDashboardData();
        
        showNotification(result.message || `${selectedListings.length} listings approved!`, 'success');
      } else {
        showNotification(result.message || 'Failed to batch approve listings', 'error');
      }
    } catch (error) {
      console.error('Failed to batch approve:', error);
      showNotification('Failed to batch approve listings', 'error');
    }
  };

  // Show notification
  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-6 right-6 px-6 py-3 rounded-2xl text-white z-50 animate-slide-in ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingListings(1);
    }
  }, [activeTab, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300 text-xl">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-900/20 to-gray-900 pt-24 pb-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-400">Manage phone listings and oversee marketplace activity</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-2 border border-gray-700/50">
            {[
              { key: 'overview', label: 'Overview', icon: TrendingUp },
              { key: 'pending', label: `Pending (${dashboardData.stats.pendingCount})`, icon: Clock },
              { key: 'activity', label: 'Activity Log', icon: Eye }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  title: 'Pending Review',
                  value: dashboardData.stats.pendingCount,
                  icon: Clock,
                  color: 'from-yellow-500 to-orange-500',
                  bgColor: 'from-yellow-500/10 to-orange-500/10'
                },
                {
                  title: 'Approved',
                  value: dashboardData.stats.approvedCount,
                  icon: CheckCircle,
                  color: 'from-green-500 to-emerald-500',
                  bgColor: 'from-green-500/10 to-emerald-500/10'
                },
                {
                  title: 'Rejected',
                  value: dashboardData.stats.rejectedCount,
                  icon: XCircle,
                  color: 'from-red-500 to-pink-500',
                  bgColor: 'from-red-500/10 to-pink-500/10'
                },
                {
                  title: 'Total Users',
                  value: dashboardData.stats.totalUsers,
                  icon: Users,
                  color: 'from-blue-500 to-cyan-500',
                  bgColor: 'from-blue-500/10 to-cyan-500/10'
                },
                {
                  title: 'Active Sellers',
                  value: dashboardData.stats.totalSellers,
                  icon: User,
                  color: 'from-purple-500 to-indigo-500',
                  bgColor: 'from-purple-500/10 to-indigo-500/10'
                }
              ].map((stat, index) => (
                <div key={index} className="relative group">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 hover:border-gray-500 transition-all">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                      {stat.value}
                    </div>
                    <div className="text-gray-400 font-medium">{stat.title}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Pending */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Clock className="h-6 w-6 text-yellow-400 mr-3" />
                  Recent Pending ({dashboardData.recentPendingListings.length})
                </h3>
                <div className="space-y-4">
                  {dashboardData.recentPendingListings.slice(0, 5).map(listing => (
                    <div key={listing._id} className="flex items-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
                      <img
                        src={listing.images && listing.images[0] ? listing.images[0] : '/api/placeholder/60/60'}
                        alt={listing.title}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/60/60';
                        }}
                      />
                      <div className="ml-4 flex-1">
                        <h4 className="text-white font-medium">{listing.title}</h4>
                        <p className="text-gray-400 text-sm">by {listing.sellerId?.name || 'Unknown'}</p>
                      </div>
                      <div className="text-green-400 font-bold">
                        LKR {listing.price ? listing.price.toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  ))}
                  {dashboardData.recentPendingListings.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No pending listings</p>
                  )}
                </div>
                {dashboardData.recentPendingListings.length > 0 && (
                  <button
                    onClick={() => setActiveTab('pending')}
                    className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-medium hover:scale-105 transition-all"
                  >
                    Review All Pending
                  </button>
                )}
              </div>

              {/* Recent Approved */}
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
                  Recently Approved ({dashboardData.recentApprovedListings.length})
                </h3>
                <div className="space-y-4">
                  {dashboardData.recentApprovedListings.slice(0, 5).map(listing => (
                    <div key={listing._id} className="flex items-center p-4 bg-gray-700/30 rounded-xl border border-gray-600/50">
                      <img
                        src={listing.images && listing.images[0] ? listing.images[0] : '/api/placeholder/60/60'}
                        alt={listing.title}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/60/60';
                        }}
                      />
                      <div className="ml-4 flex-1">
                        <h4 className="text-white font-medium">{listing.title}</h4>
                        <p className="text-gray-400 text-sm">
                          by {listing.sellerId?.name || 'Unknown'} • Approved by {listing.approvedBy?.name || 'Admin'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-bold">
                          LKR {listing.price ? listing.price.toLocaleString() : 'N/A'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {listing.approvedAt ? new Date(listing.approvedAt).toLocaleDateString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {dashboardData.recentApprovedListings.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No recently approved listings</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            {/* Filters and Actions */}
            <div className="flex justify-between items-center bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">

              <div className="flex gap-3">
                {selectedListings.length > 0 && (
                  <button
                    onClick={batchApprove}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium flex items-center"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Approve Selected ({selectedListings.length})
                  </button>
                )}
                
                <div className="text-gray-400 flex items-center">
                  Total: {pagination.totalItems} listings
                </div>
              </div>
            </div>

            {/* Pending Listings */}
            <div className="space-y-4">
              {pendingListings.map(listing => (
                <PendingListingCard
                  key={listing._id}
                  listing={listing}
                  isSelected={selectedListings.includes(listing._id)}
                  onSelect={(phoneId, isSelected) => {
                    if (isSelected) {
                      setSelectedListings([...selectedListings, phoneId]);
                    } else {
                      setSelectedListings(selectedListings.filter(id => id !== phoneId));
                    }
                  }}
                  onApprove={approveListing}
                  onReject={rejectListing}
                />
              ))}
              
              {pendingListings.length === 0 && (
                <div className="text-center py-20 bg-gray-800/20 backdrop-blur-lg rounded-3xl border border-gray-700/30">
                  <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-300 mb-4">No Pending Reviews</h3>
                  <p className="text-gray-500">All listings have been reviewed!</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => fetchPendingListings(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        pagination.currentPage === page
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600/50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Pending Listing Card Component (same as before, but with error handling)
const PendingListingCard = ({ listing, isSelected, onSelect, onApprove, onReject }) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    onReject(listing._id, rejectReason, adminNotes);
    setShowRejectModal(false);
    setRejectReason('');
    setAdminNotes('');
  };

  // Safe access to nested properties
  const sellerName = listing.sellerId?.name || 'Unknown Seller';
  const sellerEmail = listing.sellerId?.email || '';
  const sellerRating = listing.sellerId?.rating || 0;
  const reviewCount = listing.sellerId?.reviewCount || 0;
  const firstImage = listing.images && listing.images[0] ? listing.images[0] : '/api/placeholder/120/160';

  return (
    <>
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all">
        <div className="flex gap-6">
          {/* Checkbox */}
          <div className="flex items-start pt-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(listing._id, e.target.checked)}
              className="w-5 h-5 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
          </div>

          {/* Image */}
          <div className="flex-shrink-0">
            <img
              src={firstImage}
              alt={listing.title || 'Phone listing'}
              className="w-24 h-32 object-cover rounded-xl border border-gray-600"
              onError={(e) => {
                e.target.src = '/api/placeholder/120/160';
              }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{listing.title || 'Untitled Listing'}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center">
                  <Smartphone className="h-4 w-4 mr-1" />
                  {listing.brand || 'Unknown Brand'}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'Date unknown'}
                </span>
                {listing.location && (
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.location}
                  </span>
                )}
              </div>
            </div>

            {/* Seller Info */}
            <div className="flex items-center bg-gray-700/30 rounded-xl p-3">
              <img
                src={listing.sellerId?.profilePicture || '/api/placeholder/40/40'}
                alt={sellerName}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = '/api/placeholder/40/40';
                }}
              />
              <div className="ml-3 flex-1">
                <h4 className="text-white font-medium">{sellerName}</h4>
                <div className="flex items-center text-sm text-gray-400">
                  <span>{sellerEmail}</span>
                  {sellerRating > 0 && (
                    <span className="ml-3 flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {sellerRating.toFixed(1)} ({reviewCount})
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold text-lg">
                  LKR {listing.price ? listing.price.toLocaleString() : 'N/A'}
                </div>
                {listing.originalPrice && listing.originalPrice > listing.price && (
                  <div className="text-gray-500 line-through text-sm">
                    LKR {listing.originalPrice.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-gray-700/20 rounded-xl p-3">
                <p className="text-gray-300 text-sm">{listing.description}</p>
              </div>
            )}

            {/* Specifications */}
            {listing.specs && Object.keys(listing.specs).some(key => listing.specs[key]) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(listing.specs).filter(([_, value]) => value).map(([key, value]) => (
                  <div key={key} className="bg-gray-700/30 rounded-lg p-2 text-center">
                    <div className="text-xs text-gray-400 uppercase">{key}</div>
                    <div className="text-white font-medium">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={() => setShowRejectModal(true)}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-medium flex items-center transition-all"
          >
            <X className="h-5 w-5 mr-2" />
            Reject
          </button>
          
          <button
            onClick={() => onApprove(listing._id)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium flex items-center transition-all"
          >
            <Check className="h-5 w-5 mr-2" />
            Approve
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-3xl p-8 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-2xl font-bold text-white mb-6">Reject Listing</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Rejection Reason *
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">Select a reason</option>
                  <option value="Poor image quality">Poor image quality</option>
                  <option value="Incomplete information">Incomplete information</option>
                  <option value="Suspicious pricing">Suspicious pricing</option>
                  <option value="Inappropriate content">Inappropriate content</option>
                  <option value="Duplicate listing">Duplicate listing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional notes for the seller..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 rounded-xl font-medium transition-all"
              >
                Reject Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;