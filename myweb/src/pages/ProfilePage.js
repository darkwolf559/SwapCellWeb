import React, { useState, useEffect, useRef } from 'react';
import { User, ShoppingCart, Plus, Edit, Star, TrendingUp, DollarSign, Smartphone, Loader, AlertCircle, Camera, Upload, X, Check } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { phoneAPI, authAPI, orderAPI, analyticsAPI, apiUtils } from '../utils/api';
import SellerListingsTab from '../components/SellerListingsTab';

const ProfilePage = ({ onNavigate }) => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    activeListings: 0,
    totalSold: 0,
    totalRevenue: 0,
    ordersPlaced: 0,
    totalSpent: 0
  });
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      onNavigate('auth');
      return;
    }

    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching profile data for user:', user);

      // Fetch profile data
      const profileResponse = await authAPI.getProfile();
      setProfileData(profileResponse.data);

      if (user.role === 'seller') {
        // Fetch seller-specific data
        const [listingsResponse, salesResponse] = await Promise.all([
          phoneAPI.getMyListings().catch(err => {
            console.error('Listings error:', err);
            return { data: [] };
          }),
          orderAPI.getMySales().catch(err => {
            console.error('Sales error:', err);
            return { data: [] };
          })
        ]);

        setListings(listingsResponse.data || []);
        
        // Process sales data with better error handling
        let sales = [];
        if (salesResponse && salesResponse.data) {
          if (Array.isArray(salesResponse.data)) {
            sales = salesResponse.data;
          } else if (salesResponse.data.orders && Array.isArray(salesResponse.data.orders)) {
            sales = salesResponse.data.orders;
          } else if (salesResponse.data.sales && Array.isArray(salesResponse.data.sales)) {
            sales = salesResponse.data.sales;
          } else if (salesResponse.data.data && Array.isArray(salesResponse.data.data)) {
            sales = salesResponse.data.data;
          }
        }
        
        console.log('Processed sales data:', sales);
        setOrders(sales);

        // Calculate stats with proper array checks
        const listingsData = listingsResponse.data || [];
        const activeListings = Array.isArray(listingsData) 
          ? listingsData.filter(phone => phone.isAvailable).length 
          : 0;
        
        const totalSold = Array.isArray(sales) ? sales.length : 0;
        const totalRevenue = Array.isArray(sales) 
          ? sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
          : 0;

        setStats({
          activeListings,
          totalSold,
          totalRevenue
        });

        // Try to fetch analytics if available
        try {
          const analyticsResponse = await analyticsAPI.getDashboard();
          if (analyticsResponse && analyticsResponse.data) {
            setStats(prev => ({ ...prev, ...analyticsResponse.data }));
          }
        } catch (analyticsError) {
          console.log('Analytics not available:', analyticsError);
        }

      } else {
        // Fetch buyer-specific data with enhanced error handling
        console.log('Fetching orders for buyer...');
        
        try {
          const ordersResponse = await orderAPI.getMyOrders();
          console.log('Raw orders response:', ordersResponse);
          
          let orderData = [];
          
          if (ordersResponse) {
            // Handle different response structures
            if (ordersResponse.data) {
              if (Array.isArray(ordersResponse.data)) {
                orderData = ordersResponse.data;
              } else if (ordersResponse.data.orders && Array.isArray(ordersResponse.data.orders)) {
                orderData = ordersResponse.data.orders;
              } else if (ordersResponse.data.data && Array.isArray(ordersResponse.data.data)) {
                orderData = ordersResponse.data.data;
              }
            } else if (Array.isArray(ordersResponse)) {
              orderData = ordersResponse;
            }
          }
          
          console.log('Processed order data:', orderData);
          
          setOrders(orderData);
          
          const totalSpent = Array.isArray(orderData)
            ? orderData.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
            : 0;
            
          setStats({
            ordersPlaced: orderData.length,
            totalSpent
          });

          console.log('Set buyer stats:', {
            ordersPlaced: orderData.length,
            totalSpent
          });

        } catch (orderError) {
          console.error('Orders fetch error:', orderError);
          
          // More detailed error logging
          if (orderError.response) {
            console.error('Orders API response error:', {
              status: orderError.response.status,
              data: orderError.response.data,
              headers: orderError.response.headers
            });
            
            // Set specific error based on status code
            if (orderError.response.status === 404) {
              setError('Orders endpoint not found. Please check API configuration.');
            } else if (orderError.response.status === 401) {
              setError('Authentication failed. Please log in again.');
            } else if (orderError.response.status === 403) {
              setError('Access denied. Insufficient permissions.');
            } else {
              setError(`Server error (${orderError.response.status}): ${orderError.response.data?.message || 'Unknown error'}`);
            }
          } else if (orderError.request) {
            console.error('Orders network error:', orderError.request);
            setError('Network error. Please check your connection and try again.');
          } else {
            console.error('Orders general error:', orderError.message);
            setError(`Failed to fetch orders: ${orderError.message}`);
          }
          
          setOrders([]);
          setStats({
            ordersPlaced: 0,
            totalSpent: 0
          });
        }
      }

    } catch (err) {
      console.error('Failed to fetch profile data:', err);
      
      // Enhanced error handling
      let errorMessage = 'Failed to load profile data';
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Validate file
      apiUtils.validateProfilePicture(file);
      
      setError(null);

      // Create preview and show dialog
      const preview = await apiUtils.createImagePreview(file);
      setPhotoPreview(preview);
      setSelectedFile(file);
      setShowPreviewDialog(true);
      
    } catch (err) {
      console.error('Failed to process image:', err);
      setError(apiUtils.handleError(err));
    } finally {
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadingPhoto(true);
      setError(null);

      // Upload photo using uploadAPI
      const response = await authAPI.updateProfileWithPhoto(apiUtils.formatProfileData({}, selectedFile));
      
      // Update local profile data
      setProfileData(response.data.user);
      
      // Update auth context if available
      if (updateUser) {
        updateUser(response.data.user);
      }
      
      console.log('Profile photo updated successfully');
      
      // Close dialog and clear states
      setShowPreviewDialog(false);
      setPhotoPreview(null);
      setSelectedFile(null);
      
    } catch (err) {
      console.error('Failed to upload profile photo:', err);
      setError(apiUtils.handleError(err));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCancelUpload = () => {
    setShowPreviewDialog(false);
    setPhotoPreview(null);
    setSelectedFile(null);
  };

  const clearError = () => {
    setError(null);
  };

  if (!user) {
    onNavigate('auth');
    return null;
  }

  const TabButton = ({ tab, icon: Icon, children }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`group relative flex items-center px-6 py-3 rounded-2xl font-medium transition-all duration-500 overflow-hidden transform hover:scale-105 ${
        activeTab === tab
          ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/25'
          : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-purple-600/20 backdrop-blur-sm border border-gray-700/50'
      }`}
      style={{
        animation: activeTab === tab ? 'pulse-glow 2s ease-in-out infinite alternate' : 'none'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-purple-500/10 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <Icon className="h-5 w-5 mr-3 relative z-10" />
      <span className="relative z-10">{children}</span>
      {activeTab === tab && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
      )}
    </button>
  );

  const PreviewDialog = () => (
    showPreviewDialog && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-700/50 animate-scale-in">
          <h3 className="text-2xl font-bold text-white mb-6 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Update Profile Picture
          </h3>
          
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-gradient-to-br from-cyan-400 to-purple-500">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full" />
            </div>
          </div>
          
          <p className="text-gray-400 text-center mb-8">
            Do you want to update your profile picture with this image?
          </p>
          
          <div className="flex gap-4">
            <button
              onClick={handleCancelUpload}
              disabled={uploadingPhoto}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white py-3 px-6 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <X className="h-5 w-5 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleConfirmUpload}
              disabled={uploadingPhoto}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white py-3 px-6 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-purple-500/25"
            >
              {uploadingPhoto ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Update
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  );

  const ProfilePicture = () => (
    <div className="relative group cursor-pointer" onClick={handleProfilePhotoClick}>
      <div className="relative">
        {profileData?.profilePicture ? (
          // Show current profile picture
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-2xl shadow-purple-500/50 animate-pulse-glow border-4 border-gradient-to-br from-cyan-400 to-purple-500">
            <img
              src={profileData.profilePicture}
              alt="Profile"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse-glow" style={{ display: 'none' }}>
              <User className="h-12 w-12 text-white" />
            </div>
          </div>
        ) : (
          // Show default avatar
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50 animate-pulse-glow">
            <User className="h-12 w-12 text-white" />
          </div>
        )}
        
        {/* Upload overlay */}
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Camera className="h-6 w-6 text-white" />
        </div>
        
        {/* Upload button */}
        <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full p-2 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <Upload className="h-4 w-4 text-white" />
        </div>
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
        disabled={uploadingPhoto}
      />
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-8 animate-slide-up">
      {/* Profile Header */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-8 text-white overflow-hidden transform hover:scale-[1.02] transition-all duration-700 shadow-2xl shadow-purple-500/25">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full animate-float" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full animate-float-delayed" />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-600/20 rounded-full animate-bounce-slow" />
        </div>
        
        <div className="relative z-10 flex items-center">
          <ProfilePicture />
          
          <div className="ml-8">
            <div className="overflow-visible">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent animate-shimmer leading-normal">
                {profileData?.name || user.name}
              </h1>
            </div>
            <p className="text-cyan-200 text-lg mt-2 opacity-90">{profileData?.email || user.email}</p>
            <div className="flex items-center mt-4 space-x-4">
              <span className="bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-green-500/25 animate-pulse">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
              {user.role === 'seller' && (
                <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-full shadow-lg shadow-yellow-500/25">
                  <Star className="h-5 w-5 fill-current mr-2 animate-spin-slow" />
                  <span className="font-medium">{profileData?.rating?.toFixed(1) || '4.8'} Rating</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {user.role === 'seller' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: TrendingUp, value: stats.activeListings, label: 'Active Listings', gradient: 'from-green-400 to-emerald-600', delay: '0s' },
            { icon: ShoppingCart, value: stats.totalSold, label: 'Total Sold', gradient: 'from-blue-400 to-cyan-600', delay: '0.2s' },
            { icon: DollarSign, value: `LKR ${stats.totalRevenue.toLocaleString()}`, label: 'Total Revenue', gradient: 'from-purple-400 to-pink-600', delay: '0.4s' },
          ].map((stat, index) => (
            <div key={index} className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-center shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-slide-up" 
                 style={{ animationDelay: stat.delay }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl transition-all duration-500 animate-float`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-2 animate-counter">{stat.value}</div>
              <div className="text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: ShoppingCart, value: stats.ordersPlaced, label: 'Orders Placed', gradient: 'from-blue-400 to-cyan-600', delay: '0s' },
            { icon: DollarSign, value: `LKR ${stats.totalSpent.toLocaleString()}`, label: 'Total Spent', gradient: 'from-green-400 to-emerald-600', delay: '0.2s' }
          ].map((stat, index) => (
            <div key={index} className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-center shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-slide-up"
                 style={{ animationDelay: stat.delay }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className={`w-20 h-20 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-2xl transition-all duration-500 animate-float`}>
                <stat.icon className="h-10 w-10 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2 animate-counter">{stat.value}</div>
              <div className="text-gray-400 group-hover:text-gray-300 transition-colors text-lg">{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

const ListingsTab = () => {
  const handleViewDetails = (phone) => {
    console.log('=== ProfilePage handleViewDetails Debug ===');
    console.log('Phone object received:', phone);
    console.log('Phone ID:', phone._id);
    
    // Pass the full phone object instead of just the ID
    onNavigate('details', { phone: phone }); // Change this line
  };

  const handleEdit = (phone) => {
    // Navigate to edit phone page
    onNavigate('edit-phone', { phoneId: phone._id });
  };

  const handleDelete = async (phone) => {
    if (window.confirm(`Are you sure you want to delete "${phone.title}"?\n\nThis action cannot be undone.`)) {
      try {
        setError(null);
        await phoneAPI.deletePhone(phone._id);
        
        // Remove from local state immediately for better UX
        setListings(prev => prev.filter(p => p._id !== phone._id));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          activeListings: prev.activeListings - (phone.isAvailable ? 1 : 0)
        }));
        
        console.log('Phone deleted successfully');
      } catch (err) {
        console.error('Failed to delete phone:', err);
        setError(apiUtils.handleError(err));
        // Refresh data on error to ensure consistency
        fetchProfileData();
      }
    }
  };

  const handleAddNew = () => {
    onNavigate('add-phone');
  };

  return (
    <SellerListingsTab
      listings={listings}
      loading={loading}
      error={error}
      onViewDetails={handleViewDetails}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onAddNew={handleAddNew}
    />
  );
};

  const OrdersTab = () => (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-8">
        {user.role === 'seller' ? 'Recent Sales' : 'Order History'}
      </h2>
      
      {loading ? (
        <div className="text-center py-20">
          <Loader className="h-16 w-16 text-purple-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400 text-xl">Loading {user.role === 'seller' ? 'sales' : 'orders'}...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div key={order._id || order.id || index} className="group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-500 transform hover:scale-[1.02] animate-slide-up"
                 style={{ animationDelay: `${index * 0.2}s` }}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-xl">
                      {user.role === 'seller' ? `Sale #${order.orderNumber || order._id?.slice(-6)}` : `Order #${order.orderNumber || order._id?.slice(-6)}`}
                    </h3>
                    <p className="text-gray-400">
                      {new Date(order.createdAt || order.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
                    order.status === 'completed' || order.status === 'delivered' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    order.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Completed'}
                  </span>
                </div>
                <div className="border-t border-gray-700/50 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative">
                        <img
                          src={order.items?.[0]?.phoneId?.images?.[0] || order.items?.[0]?.image || order.phone?.images?.[0] || order.phoneImage || '/api/placeholder/64/64'}
                          alt="Phone"
                          className="w-16 h-16 object-cover rounded-xl shadow-lg"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/64/64';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <div className="ml-6">
                        <h4 className="font-semibold text-white text-lg">
                          {order.items?.[0]?.phoneId?.title || order.items?.[0]?.title || order.phone?.title || order.phoneTitle || 'Phone'}
                        </h4>
                        <p className="text-gray-400">
                          Quantity: {order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || order.quantity || 1}
                        </p>
                        {order.items && order.items.length > 1 && (
                          <p className="text-gray-400 text-sm">+ {order.items.length - 1} more item{order.items.length > 2 ? 's' : ''}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-2xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      LKR {(order.totalAmount || order.amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800/20 backdrop-blur-lg rounded-3xl border border-gray-700/30">
          <ShoppingCart className="h-24 w-24 text-gray-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-300 mb-4">
            No {user.role === 'seller' ? 'sales' : 'orders'} yet
          </h3>
          <p className="text-gray-500 mb-8">
            {user.role === 'seller' 
              ? "Start selling phones to see your sales history here" 
              : "Browse our collection and place your first order"
            }
          </p>
          <button
            onClick={() => onNavigate(user.role === 'seller' ? 'add-phone' : 'phones')}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105"
          >
            {user.role === 'seller' ? 'Add Phone to Sell' : 'Browse Phones'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black pt-32 pb-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 rounded-full blur-3xl animate-bounce-slow" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Preview Dialog */}
        <PreviewDialog />

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-900/20 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-400 mr-3" />
              <div className="flex-1">
                <h3 className="text-red-300 font-semibold">Failed to load profile data</h3>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={fetchProfileData}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={clearError}
                  className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-10">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-4 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-4 border border-gray-700/50">
            <TabButton tab="overview" icon={User}>Overview</TabButton>
            {user.role === 'seller' && (
              <TabButton tab="listings" icon={Smartphone}>My Listings</TabButton>
            )}
            <TabButton tab="orders" icon={ShoppingCart}>
              {user.role === 'seller' ? 'Sales' : 'Orders'}
            </TabButton>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'listings' && user.role === 'seller' && <ListingsTab />}
          {activeTab === 'orders' && <OrdersTab />}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
          100% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.8); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
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
        
        @keyframes counter {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite alternate;
        }
        
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-counter {
          animation: counter 1s ease-out 0.5s forwards;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;