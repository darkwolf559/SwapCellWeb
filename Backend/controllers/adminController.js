const Phone = require('../models/Phone');
const User = require('../models/User');
const { getIO } = require('../utils/socket');

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const [pendingCount, approvedCount, rejectedCount, totalUsers, totalSellers] = await Promise.all([
      Phone.countDocuments({ status: 'pending' }),
      Phone.countDocuments({ status: 'approved' }),
      Phone.countDocuments({ status: 'rejected' }),
      User.countDocuments({ role: { $in: ['buyer', 'seller'] } }),
      User.countDocuments({ role: 'seller' })
    ]);

    // Get recent activity
    const recentPendingListings = await Phone.find({ status: 'pending' })
      .populate('sellerId', 'name email phone profilePicture')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentApprovedListings = await Phone.find({ status: 'approved' })
      .populate('sellerId', 'name email')
      .populate('approvedBy', 'name')
      .sort({ approvedAt: -1 })
      .limit(5);

    res.json({
      stats: {
        pendingCount,
        approvedCount,
        rejectedCount,
        totalUsers,
        totalSellers
      },
      recentPendingListings,
      recentApprovedListings
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all pending listings for admin review
const getPendingListings = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const sortOption = { [sortBy]: order === 'desc' ? -1 : 1 };

    const pendingListings = await Phone.find({ status: 'pending' })
      .populate('sellerId', 'name email phone profilePicture rating reviewCount createdAt')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Phone.countDocuments({ status: 'pending' });

    res.json({
      listings: pendingListings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        hasNext: skip + pendingListings.length < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (err) {
    console.error('Get pending listings error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all listings with filtering (approved, rejected, pending)
const getAllListingsForAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { 
      status, 
      page = 1, 
      limit = 20, 
      search, 
      brand,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    // Brand filter
    if (brand && brand !== 'all') {
      query.brand = new RegExp(brand, 'i');
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOption = { [sortBy]: order === 'desc' ? -1 : 1 };

    const listings = await Phone.find(query)
      .populate('sellerId', 'name email phone profilePicture rating reviewCount')
      .populate('approvedBy', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Phone.countDocuments(query);

    res.json({
      listings,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        hasNext: skip + listings.length < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (err) {
    console.error('Get all listings error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Approve a phone listing
const approveListing = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { phoneId } = req.params;
    const { adminNotes } = req.body;

    const phone = await Phone.findById(phoneId).populate('sellerId', 'name email');
    if (!phone) {
      return res.status(404).json({ message: 'Phone listing not found' });
    }

    if (phone.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending listings can be approved' });
    }

    // Update phone status
    phone.status = 'approved';
    phone.approvedBy = req.user.userId;
    phone.approvedAt = new Date();
    if (adminNotes) phone.adminNotes = adminNotes;
    
    await phone.save();

    // Populate the updated phone
    const updatedPhone = await Phone.findById(phoneId)
      .populate('sellerId', 'name email phone profilePicture')
      .populate('approvedBy', 'name email');

    // Emit socket event to notify seller
    try {
      getIO().emit('listing_approved', {
        phoneId: phone._id,
        sellerId: phone.sellerId._id,
        phone: updatedPhone,
        message: `Your listing "${phone.title}" has been approved!`
      });
    } catch (socketError) {
      console.error('Socket error:', socketError);
    }

    res.json({
      message: 'Listing approved successfully',
      phone: updatedPhone
    });
  } catch (err) {
    console.error('Approve listing error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reject a phone listing
const rejectListing = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { phoneId } = req.params;
    const { adminNotes, reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const phone = await Phone.findById(phoneId).populate('sellerId', 'name email');
    if (!phone) {
      return res.status(404).json({ message: 'Phone listing not found' });
    }

    if (phone.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending listings can be rejected' });
    }

    // Update phone status
    phone.status = 'rejected';
    phone.rejectedAt = new Date();
    phone.adminNotes = adminNotes || reason;
    phone.isAvailable = false;
    
    await phone.save();

    // Populate the updated phone
    const updatedPhone = await Phone.findById(phoneId)
      .populate('sellerId', 'name email phone profilePicture')
      .populate('approvedBy', 'name email');

    // Emit socket event to notify seller
    try {
      getIO().emit('listing_rejected', {
        phoneId: phone._id,
        sellerId: phone.sellerId._id,
        phone: updatedPhone,
        reason: phone.adminNotes,
        message: `Your listing "${phone.title}" has been rejected.`
      });
    } catch (socketError) {
      console.error('Socket error:', socketError);
    }

    res.json({
      message: 'Listing rejected successfully',
      phone: updatedPhone
    });
  } catch (err) {
    console.error('Reject listing error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Batch approve multiple listings
const batchApproveListing = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { phoneIds, adminNotes } = req.body;

    if (!Array.isArray(phoneIds) || phoneIds.length === 0) {
      return res.status(400).json({ message: 'Phone IDs array is required' });
    }

    const updateResult = await Phone.updateMany(
      { 
        _id: { $in: phoneIds }, 
        status: 'pending' 
      },
      {
        status: 'approved',
        approvedBy: req.user.userId,
        approvedAt: new Date(),
        ...(adminNotes && { adminNotes })
      }
    );

    // Get updated phones for socket notification
    const updatedPhones = await Phone.find({ _id: { $in: phoneIds } })
      .populate('sellerId', 'name email');

    // Emit socket events
    updatedPhones.forEach(phone => {
      try {
        getIO().emit('listing_approved', {
          phoneId: phone._id,
          sellerId: phone.sellerId._id,
          phone,
          message: `Your listing "${phone.title}" has been approved!`
        });
      } catch (socketError) {
        console.error('Socket error:', socketError);
      }
    });

    res.json({
      message: `${updateResult.modifiedCount} listings approved successfully`,
      modifiedCount: updateResult.modifiedCount
    });
  } catch (err) {
    console.error('Batch approve error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get listing details for admin review
const getListingForReview = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { phoneId } = req.params;

    const phone = await Phone.findById(phoneId)
      .populate('sellerId', 'name email phone profilePicture rating reviewCount createdAt')
      .populate('approvedBy', 'name email');

    if (!phone) {
      return res.status(404).json({ message: 'Phone listing not found' });
    }

    // Get seller's other listings for context
    const sellerOtherListings = await Phone.find({
      sellerId: phone.sellerId._id,
      _id: { $ne: phoneId }
    }).select('title status createdAt approvedAt rejectedAt').sort({ createdAt: -1 }).limit(5);

    res.json({
      phone,
      sellerContext: {
        otherListings: sellerOtherListings,
        totalListings: await Phone.countDocuments({ sellerId: phone.sellerId._id }),
        approvedListings: await Phone.countDocuments({ sellerId: phone.sellerId._id, status: 'approved' }),
        rejectedListings: await Phone.countDocuments({ sellerId: phone.sellerId._id, status: 'rejected' })
      }
    });
  } catch (err) {
    console.error('Get listing for review error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get admin activity log
const getAdminActivityLog = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get recent approvals and rejections
    const recentActivity = await Phone.find({
      status: { $in: ['approved', 'rejected'] }
    })
    .populate('sellerId', 'name email')
    .populate('approvedBy', 'name email')
    .sort({ $or: [{ approvedAt: -1 }, { rejectedAt: -1 }] })
    .skip(skip)
    .limit(Number(limit));

    const total = await Phone.countDocuments({ status: { $in: ['approved', 'rejected'] } });

    res.json({
      activities: recentActivity,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total
      }
    });
  } catch (err) {
    console.error('Get admin activity log error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getPendingListings,
  getAllListingsForAdmin,
  approveListing,
  rejectListing,
  batchApproveListing,
  getListingForReview,
  getAdminActivityLog
};