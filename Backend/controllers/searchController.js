const Phone = require('../models/Phone');

// Search suggestions (no auth required)
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') {
      return res.json({ suggestions: [] });
    }

    const regex = new RegExp(query, 'i');
    const phones = await Phone.find(
      { name: { $regex: regex } },
      'name'
    ).limit(5);

    res.json({ suggestions: phones.map(p => p.name) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch search suggestions', error: err.message });
  }
};
