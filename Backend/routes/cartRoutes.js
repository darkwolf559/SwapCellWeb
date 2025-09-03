const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getCart, addToCart, updateCart, clearCart } = require('../controllers/cartController');
const router = express.Router();

router.get('/', authenticateToken, getCart);
router.post('/add', authenticateToken, addToCart);
router.put('/update', authenticateToken, updateCart);
router.delete('/clear', authenticateToken, clearCart);

module.exports = router;
