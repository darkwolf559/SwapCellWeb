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
  updateProfile: (userData) => api.put('/users/profile', userData),
};

// Phone API
export const phoneAPI = {
  getPhones: (params = {}) => api.get('/phones', { params }),
  getPhone: (id) => api.get(`/phones/${id}`),
  createPhone: (phoneData) => api.post('/phones', phoneData),
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
  }
};

export default api;