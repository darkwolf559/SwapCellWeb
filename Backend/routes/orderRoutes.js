const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { 
  createOrder, 
  sendOrderConfirmation,
  myOrders, 
  mySales, 
  getOrderDetails,
  updateOrderStatus,
} = require('../controllers/orderController');


const router = express.Router();

// Create new order
router.post('/create', authenticateToken, createOrder);

// Send order confirmation email
router.post('/send-confirmation', authenticateToken, sendOrderConfirmation);

// Get user's orders (buyer)
router.get('/my-orders', authenticateToken, myOrders);

// Get seller's sales
router.get('/my-sales', authenticateToken, mySales);

// Get specific order details
router.get('/:orderId', authenticateToken, getOrderDetails);

// Update order status (sellers/admin only)
router.patch('/:orderId/status', authenticateToken, updateOrderStatus);

module.exports = router;