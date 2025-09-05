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
};

// Phone API
export const phoneAPI = {
  getPhones: (params = {}) => api.get('/phones', { params }),
  getPhone: (id) => api.get(`/phones/${id}`),
  createPhone: (phoneData) => api.post('/phones', phoneData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updatePhone: (id, phoneData) => api.put(`/phones/${id}`, phoneData),
  deletePhone: (id) => api.delete(`/phones/${id}`),
  getMyListings: () => api.get('/users/my-listings'),
  searchSuggestions: (query) => api.get('/search/suggestions', { params: { query } }),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (phoneId, quantity = 1) => api.post('/cart/add', { phoneId, quantity }),
  updateCart: (phoneId, quantity) => api.put('/cart/update', { phoneId, quantity }),
  clearCart: () => api.delete('/cart/clear'),
};

// Order API
export const orderAPI = {
  createOrder: (orderData) => api.post('/orders/create', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getMySales: () => api.get('/orders/my-sales'),
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

// Utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      return error.response.data.message || 'Server error occurred';
    } else if (error.request) {
      // Network error
      return 'Network error. Please check your connection.';
    } else {
      // Other error
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
        ram: phoneData.specs.ram?.toString() || '',
        storage: phoneData.specs.storage?.toString() || '',
        battery: phoneData.specs.battery?.toString() || '',
        camera: phoneData.specs.camera?.toString() || '',
        processor: phoneData.specs.processor?.toString() || '',
        screen: phoneData.specs.screen?.toString() || '',
        os: phoneData.specs.os?.toString() || '',
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
  }
};

export default api;