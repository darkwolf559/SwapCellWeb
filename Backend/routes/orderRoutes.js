const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { createOrder, myOrders, mySales } = require('../controllers/orderController');

const router = express.Router();

router.post('/create', authenticateToken, createOrder);
router.get('/my-orders', authenticateToken, myOrders);
router.get('/my-sales', authenticateToken, mySales);

module.exports = router;
