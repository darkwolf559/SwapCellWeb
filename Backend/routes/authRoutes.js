const express = require('express');
const { register, login } = require('../controllers/authController');
const { requestPasswordReset, resetPassword } = require('../controllers/forgotPasswordControler');

const router = express.Router();

// Existing routes
router.post('/register', register);
router.post('/login', login);

// New forgot password routes
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;