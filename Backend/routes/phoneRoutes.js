const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { getPhones, getPhoneById, createPhone } = require('../controllers/phoneController');

// Public routes
router.get('/', getPhones);
router.get('/:id', getPhoneById);

// Protected routes
router.post('/', authenticateToken, createPhone);

module.exports = router;
