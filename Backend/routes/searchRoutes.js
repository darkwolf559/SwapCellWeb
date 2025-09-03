const express = require('express');
const { getSearchSuggestions } = require('../controllers/searchController');

const router = express.Router();

// GET /api/search/suggestions
router.get('/', getSearchSuggestions);

module.exports = router;
