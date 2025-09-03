const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { getDashboard } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/dashboard', authenticateToken, getDashboard);

module.exports = router;
