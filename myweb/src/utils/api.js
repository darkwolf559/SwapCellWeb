import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  
  register: (userData) => api.post('/auth/register', userData),
  
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (userData) => {
    // Check if userData is FormData (contains file)
    if (userData instanceof FormData) {
      return api.put('/users/profile', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    // Regular JSON update
    return api.put('/users/profile', userData);
  },
  
  updateProfileWithPhoto: (formData) => api.put('/users/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Forgot Password API
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Verification code sent to your email'
      };
    } catch (error) {
      console.error('Request password reset error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send verification code',
        error: error.response?.data || error.message
      };
    }
  },
  
  resetPassword: async (email, code, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', { 
        email, 
        code, 
        newPassword 
      });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Password reset successful'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password',
        error: error.response?.data || error.message
      };
    }
  },
};
export const adminAPI = {
  // Get dashboard statistics
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Get pending listings for review
  getPendingListings: (params = {}) => api.get('/admin/listings/pending', { params }),
  
  // Get all listings (with status filtering)
  getAllListings: (params = {}) => api.get('/admin/listings/all', { params }),
  
  // Get listing for detailed review
  getListingForReview: (phoneId) => api.get(`/admin/listings/${phoneId}/review`),
  
  // Approve a listing
  approveListing: async (phoneId, adminNotes = '') => {
    try {
      const response = await api.put(`/admin/listings/${phoneId}/approve`, { adminNotes });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Listing approved successfully'
      };
    } catch (error) {
      console.error('Admin API - Approve listing error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to approve listing',
        error: error.response?.data || error.message
      };
    }
  },
  
  // Reject a listing
  rejectListing: async (phoneId, reason, adminNotes = '') => {
    try {
      const response = await api.put(`/admin/listings/${phoneId}/reject`, { 
        reason, 
        adminNotes 
      });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Listing rejected successfully'
      };
    } catch (error) {
      console.error('Admin API - Reject listing error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reject listing',
        error: error.response?.data || error.message
      };
    }
  },
  
  // Batch approve listings
  batchApproveListing: async (phoneIds, adminNotes = '') => {
    try {
      const response = await api.put('/admin/listings/batch-approve', { 
        phoneIds, 
        adminNotes 
      });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Listings approved successfully'
      };
    } catch (error) {
      console.error('Admin API - Batch approve error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to batch approve listings',
        error: error.response?.data || error.message
      };
    }
  },
  
  // Get admin activity log
  getActivityLog: (params = {}) => api.get('/admin/activity-log', { params }),
  
  // Get user management data
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  
  // Update user status/role
  updateUser: async (userId, updateData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'User updated successfully'
      };
    } catch (error) {
      console.error('Admin API - Update user error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update user',
        error: error.response?.data || error.message
      };
    }
  }
};

// Phone API
export const phoneAPI = {
  // Existing methods...
  getPhones: (params = {}) => api.get('/phones', { params }),
  
  getAllPhones: (params = {}) => api.get('/phones', { params }),
  
  getPhone: (id) => api.get(`/phones/${id}`),
  
  getPhoneById: (id) => api.get(`/phones/${id}`),
  
  // Updated createPhone method
  createPhone: async (phoneData) => {
    try {
      const response = await api.post('/phones', phoneData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Phone listing submitted for admin approval',
        status: response.data.status // Will be 'pending'
      };
    } catch (error) {
      console.error('Phone API - Create phone error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create listing',
        error: error.response?.data || error.message
      };
    }
  },
  
  // Updated updatePhone method
  updatePhone: async (id, phoneData) => {
    try {
      let response;
      if (phoneData instanceof FormData) {
        response = await api.put(`/phones/${id}`, phoneData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await api.put(`/phones/${id}`, phoneData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
      
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Phone updated successfully'
      };
    } catch (error) {
      console.error('Phone API - Update phone error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update listing',
        error: error.response?.data || error.message
      };
    }
  },
  
  deletePhone: (id) => api.delete(`/phones/${id}`),
  
  // Updated getMyListings to include status information
  getMyListings: (params = {}) => api.get('/users/my-listings', { params }),
  
  // New method to get seller dashboard
  getSellerDashboard: () => api.get('/users/seller-dashboard'),
  
  searchSuggestions: (query) => api.get('/search/suggestions', { params: { query } }),
  
  validatePhones: (phoneIds) => api.post('/phones/validate', { phoneIds }),
};
export const adminUtils = {
  // Format listing status for display
  formatListingStatus: (status) => {
    const statusMap = {
      'pending': { label: 'Pending Review', color: 'yellow', icon: 'clock' },
      'approved': { label: 'Approved', color: 'green', icon: 'check-circle' },
      'rejected': { label: 'Rejected', color: 'red', icon: 'x-circle' }
    };
    return statusMap[status] || { label: status, color: 'gray', icon: 'help-circle' };
  },
  
  // Get status badge classes
  getStatusBadgeClasses: (status) => {
    const classMap = {
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'approved': 'bg-green-500/20 text-green-400 border-green-500/30',
      'rejected': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return classMap[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  },
  
  // Format rejection reasons for display
  formatRejectionReasons: () => [
    'Poor image quality',
    'Incomplete information', 
    'Suspicious pricing',
    'Inappropriate content',
    'Duplicate listing',
    'Suspected fraud',
    'Policy violation',
    'Other'
  ],
  
  // Check if user has admin permissions
  hasAdminPermission: (user, permission) => {
    if (!user || user.role !== 'admin') return false;
    
    const permissions = user.adminPermissions || {};
    switch (permission) {
      case 'approve_listings':
        return permissions.canApproveListings;
      case 'manage_users':
        return permissions.canManageUsers;
      case 'view_analytics':
        return permissions.canViewAnalytics;
      default:
        return false;
    }
  },
  
  // Format admin activity for display
  formatAdminActivity: (activity) => {
    const actionMap = {
      'approved': { icon: 'check-circle', color: 'green', label: 'Approved' },
      'rejected': { icon: 'x-circle', color: 'red', label: 'Rejected' },
      'deleted': { icon: 'trash', color: 'red', label: 'Deleted' }
    };
    
    return {
      ...activity,
      actionDisplay: actionMap[activity.status] || { 
        icon: 'help-circle', 
        color: 'gray', 
        label: activity.status 
      }
    };
  },
  
  // Validate admin actions
  validateAdminAction: (action, phoneData, reason = '') => {
    const errors = [];
    
    if (action === 'reject' && !reason.trim()) {
      errors.push('Rejection reason is required');
    }
    
    if (!phoneData || !phoneData._id) {
      errors.push('Invalid phone listing');
    }
    
    if (phoneData && phoneData.status !== 'pending') {
      errors.push('Only pending listings can be approved or rejected');
    }
    
    return errors;
  },
  
  // Generate admin notification messages
  generateNotificationMessage: (action, phoneData, count = 1) => {
    const title = phoneData?.title || 'listing';
    const sellerName = phoneData?.sellerId?.name || 'seller';
    
    switch (action) {
      case 'approved':
        return count > 1 
          ? `${count} listings approved successfully`
          : `"${title}" approved successfully`;
      case 'rejected':
        return `"${title}" rejected`;
      case 'batch_approved':
        return `${count} listings approved in batch`;
      default:
        return `Action completed successfully`;
    }
  }
};
// Enhanced Cart API with proper error handling
export const cartAPI = {
  getCart: () => api.get('/cart'),
  
  addToCart: async (phoneId, quantity = 1) => {
    try {
      const response = await api.post('/cart/add', { phoneId, quantity });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Item added to cart'
      };
    } catch (error) {
      console.error('Cart API - Add to cart error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add item to cart',
        error: error.response?.data || error.message
      };
    }
  },
  
  updateCart: async (phoneId, quantity) => {
    try {
      const response = await api.put('/cart/update', { phoneId, quantity });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Cart updated'
      };
    } catch (error) {
      console.error('Cart API - Update cart error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update cart',
        error: error.response?.data || error.message
      };
    }
  },
  
  removeFromCart: async (phoneId) => {
    try {
      const response = await api.delete(`/cart/remove/${phoneId}`);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Item removed from cart'
      };
    } catch (error) {
      console.error('Cart API - Remove from cart error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove item from cart',
        error: error.response?.data || error.message
      };
    }
  },
  
  clearCart: async () => {
    try {
      const response = await api.delete('/cart/clear');
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Cart cleared'
      };
    } catch (error) {
      console.error('Cart API - Clear cart error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to clear cart',
        error: error.response?.data || error.message
      };
    }
  },
  
  mergeGuestCart: async (guestItems) => {
    try {
      const response = await api.post('/cart/merge', { guestItems });
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Cart merged successfully'
      };
    } catch (error) {
      console.error('Cart API - Merge cart error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to merge cart',
        error: error.response?.data || error.message
      };
    }
  }
};

// Enhanced Order API
export const orderAPI = {
  createOrder: (orderData) => api.post('/orders/create', orderData),
  
  sendConfirmation: (orderId, email) => api.post('/orders/send-confirmation', { orderId, email }),
  
  getMyOrders: () => api.get('/orders/my-orders'),
  
  getMySales: () => api.get('/orders/my-sales'),
  
  getOrderDetails: (orderId) => api.get(`/orders/${orderId}`),
  
  updateOrderStatus: (orderId, status) => api.put(`/orders/${orderId}/status`, { status }),
};

// Favorites API
export const favoritesAPI = {
  getFavorites: () => api.get('/favorites'),
  toggleFavorite: (phoneId) => api.post('/favorites/toggle', { phoneId }),
};

// Analytics API (for sellers)
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getPhoneViews: (phoneId) => api.get(`/analytics/phone/${phoneId}/views`),
  getOrderStats: () => api.get('/analytics/orders'),
};

// File upload utility
export const uploadAPI = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  uploadMultipleImages: async (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });
    
    return api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  uploadProfilePicture: async (file, additionalData = {}) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    // Add any additional profile data
    Object.keys(additionalData).forEach(key => {
      if (additionalData[key] !== undefined && additionalData[key] !== null) {
        formData.append(key, additionalData[key]);
      }
    });
    
    return api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Comprehensive utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'Server error occurred';
      console.error('Server Error:', error.response.status, message);
      return message;
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.request);
      return 'Network error. Please check your connection.';
    } else {
      // Other error
      console.error('Request Error:', error.message);
      return error.message || 'An unexpected error occurred';
    }
  },

  // Format phone data for API
  formatPhoneData: (phoneData) => {
    return {
      ...phoneData,
      price: parseFloat(phoneData.price),
      originalPrice: phoneData.originalPrice ? parseFloat(phoneData.originalPrice) : null,
      specs: {
        ...phoneData.specs,
        // Ensure all spec fields are strings
        ram: phoneData.specs?.ram?.toString() || '',
        storage: phoneData.specs?.storage?.toString() || '',
        battery: phoneData.specs?.battery?.toString() || '',
        camera: phoneData.specs?.camera?.toString() || '',
        processor: phoneData.specs?.processor?.toString() || '',
        screen: phoneData.specs?.screen?.toString() || '',
        os: phoneData.specs?.os?.toString() || '',
      }
    };
  },

  // Format profile data for API with optional photo
  formatProfileData: (profileData, profilePicture = null) => {
    const formData = new FormData();
    
    if (profileData.name) formData.append('name', profileData.name.trim());
    if (profileData.phone) formData.append('phone', profileData.phone.trim());
    if (profilePicture) formData.append('profilePicture', profilePicture);
    
    return formData;
  },

  // Validate phone data
  validatePhoneData: (phoneData) => {
    const required = ['title', 'brand', 'price', 'condition'];
    const missing = required.filter(field => !phoneData[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (phoneData.price <= 0) {
      throw new Error('Price must be greater than 0');
    }

    if (phoneData.originalPrice && phoneData.originalPrice < phoneData.price) {
      throw new Error('Original price cannot be less than current price');
    }

    return true;
  },

  // Validate checkout form
  validateCheckoutForm: (formData) => {
    const errors = {};
    
    // Personal information validation
    if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
    
    // Mobile validation
    if (!formData.mobile?.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^(\+94|0)[0-9]{9}$/.test(formData.mobile)) {
      errors.mobile = 'Please enter a valid Sri Lankan mobile number';
    }
    
    // Email validation
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Address validation
    if (!formData.province) errors.province = 'Province is required';
    if (!formData.district) errors.district = 'District is required';
    if (!formData.city?.trim()) errors.city = 'City is required';
    if (!formData.addressLine1?.trim()) errors.addressLine1 = 'Address line 1 is required';
    
    return errors;
  },

  // Validate payment data
  validatePaymentData: (paymentData) => {
    const errors = {};
    
    if (!paymentData.cardNumber?.trim()) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^[0-9]{16}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    
    if (!paymentData.expiryDate?.trim()) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(paymentData.expiryDate)) {
      errors.expiryDate = 'Please enter expiry date in MM/YY format';
    }
    
    if (!paymentData.cvv?.trim()) {
      errors.cvv = 'CVV is required';
    } else if (!/^[0-9]{3,4}$/.test(paymentData.cvv)) {
      errors.cvv = 'Please enter a valid CVV';
    }
    
    if (!paymentData.cardholderName?.trim()) {
      errors.cardholderName = 'Cardholder name is required';
    }
    
    return errors;
  },

  // Validate profile picture
  validateProfilePicture: (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) {
      throw new Error('Profile picture must be less than 5MB');
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Profile picture must be a JPEG, PNG, or WebP image');
    }
    
    return true;
  },

  // Create image preview URL
  createImagePreview: (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  },

  // Compress image before upload (optional)
  compressImage: (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  },

  // Format cart item for consistency
  formatCartItem: (item) => {
    const phoneData = item.phoneId || item;
    return {
      _id: phoneData._id || phoneData.id,
      id: phoneData._id || phoneData.id,
      title: phoneData.title || phoneData.name || 'Phone',
      brand: phoneData.brand || 'Unknown',
      price: phoneData.price || 0,
      image: phoneData.images?.[0] || phoneData.image || '/api/placeholder/400/300',
      images: phoneData.images || [phoneData.image] || [],
      condition: phoneData.condition || 'Good',
      location: phoneData.location || 'Location not specified',
      specs: phoneData.specs || {},
      quantity: item.quantity || 1,
      sellerId: phoneData.sellerId,
      createdAt: phoneData.createdAt,
      addedAt: item.addedAt
    };
  },

  // Get proper image URL with fallback
  getImageUrl: (imagePath, baseUrl = null) => {
    if (!imagePath) return '/api/placeholder/400/300';
    
    // If it's already a full URL, return it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a placeholder, return it
    if (imagePath.startsWith('/api/placeholder')) {
      return imagePath;
    }
    
    // Construct full URL
    const base = baseUrl || process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    if (imagePath.startsWith('/uploads/')) {
      return `${base}${imagePath}`;
    }
    
    return `${base}/uploads/phones/${imagePath}`;
  },

  // Format currency
  formatCurrency: (amount, currency = 'LKR') => {
    return `${currency} ${amount.toLocaleString()}`;
  },

  // Format date
  formatDate: (date, options = {}) => {
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
    return new Date(date).toLocaleDateString('en-US', defaultOptions);
  },

  // Generate order summary
  generateOrderSummary: (cart, shippingCost = 0) => {
    const subtotal = cart.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    const total = subtotal + shippingCost;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      subtotal,
      shippingCost,
      total,
      itemCount,
      items: cart
    };
  }
};

export default api;