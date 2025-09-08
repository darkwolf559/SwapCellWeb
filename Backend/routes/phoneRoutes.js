const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getPhones, getPhoneById, createPhone, updatePhone, deletePhone } = require('../controllers/phoneController');

// Public routes
router.get('/', getPhones);
router.get('/:id', getPhoneById);

router.put('/:id', authenticateToken, updatePhone); 
router.delete('/:id', authenticateToken, deletePhone);

// Protected routes
router.post('/', authenticateToken, createPhone);

module.exports = router;
