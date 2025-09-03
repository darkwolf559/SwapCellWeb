const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getProfile, updateProfile, myListings } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/my-listings', authenticateToken, myListings);

module.exports = router;
