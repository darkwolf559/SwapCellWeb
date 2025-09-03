const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { toggleFavorite, getFavorites } = require('../controllers/favoriteController');

const router = express.Router();

router.post('/toggle', authenticateToken, toggleFavorite);
router.get('/', authenticateToken, getFavorites);

module.exports = router;
