const User = require('../models/User');

const toggleFavorite = async (req, res) => {
  try {
    const { phoneId } = req.body;
    const user = await User.findById(req.user.userId);
    const favorites = user.favorites || [];

    const updatedFavorites = favorites.includes(phoneId) 
      ? favorites.filter(id => id.toString() !== phoneId) 
      : [...favorites, phoneId];

    await User.findByIdAndUpdate(req.user.userId, { favorites: updatedFavorites });
    res.json({ favorites: updatedFavorites });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: 'favorites',
      populate: { path: 'sellerId', select: 'name phone rating' }
    });
    res.json(user.favorites || []);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

module.exports = { toggleFavorite, getFavorites };
