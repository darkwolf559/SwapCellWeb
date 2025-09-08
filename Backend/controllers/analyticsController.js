const Phone = require('../models/Phone');
const Order = require('../models/Order');
const mongoose = require('mongoose');

const getDashboard = async (req, res) => {
  try {
    if (req.user.role !== 'seller') return res.status(403).json({ message: 'Only sellers can view analytics' });

    const totalListings = await Phone.countDocuments({ sellerId: req.user.userId });
    const activeListings = await Phone.countDocuments({ sellerId: req.user.userId, isAvailable: true });

    // Fix: Use new mongoose.Types.ObjectId()
    const totalViewsAgg = await Phone.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(req.user.userId) } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    const soldItemsAgg = await Order.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.sellerId': new mongoose.Types.ObjectId(req.user.userId) } },
      { $group: { _id: null, totalSold: { $sum: '$items.quantity' }, totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
    ]);

    res.json({
      totalListings,
      activeListings,
      totalViews: totalViewsAgg[0]?.totalViews || 0,
      totalSold: soldItemsAgg[0]?.totalSold || 0,
      totalRevenue: soldItemsAgg[0]?.totalRevenue || 0
    });
  } catch (err) { 
    console.error('Analytics dashboard error:', err);
    res.status(500).json({ message: 'Server error', error: err.message }); 
  }
};

module.exports = { getDashboard };