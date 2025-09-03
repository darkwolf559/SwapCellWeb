const User = require('../models/User');
const Phone = require('../models/Phone');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePicture } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user.userId, { name, phone, profilePicture }, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const myListings = async (req, res) => {
  try {
    if (req.user.role !== 'seller') return res.status(403).json({ message: 'Only sellers can view listings' });
    const phones = await Phone.find({ sellerId: req.user.userId }).sort({ createdAt: -1 });
    res.json(phones);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

module.exports = { getProfile, updateProfile, myListings };
