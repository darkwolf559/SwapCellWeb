const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { 
  getCart, 
  addToCart, 
  updateCart, 
  removeFromCart, 
  clearCart, 
  mergeGuestCart 
} = require('../controllers/cartController');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, getCart);

// Add item to cart
router.post('/add', authenticateToken, addToCart);

// Update item quantity in cart
router.put('/update', authenticateToken, updateCart);

// Remove specific item from cart
router.delete('/remove/:phoneId', authenticateToken, removeFromCart);

// Clear entire cart
router.delete('/clear', authenticateToken, clearCart);

// Merge guest cart with user cart (for when user logs in)
router.post('/merge', authenticateToken, mergeGuestCart);

module.exports = router;