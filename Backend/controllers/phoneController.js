const Phone = require('../models/Phone');
const { getIO } = require('../utils/socket');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'phone-marketplace/phones',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto:good' },
      { format: 'webp' }
    ],
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter, 
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 6 
  } 
});

const uploadImages = upload.array('images', 6);

// Controller methods
const getPhones = async (req, res) => {
  try {
    // Filters, search, pagination
    const { brand, condition, minPrice, maxPrice, search, sort, page = 1, limit = 12 } = req.query;
    
    // Only show approved phones to regular users
    let query = { 
      isAvailable: true,
      status: 'approved'  // Only approved listings visible to public
    };

    if (brand && brand !== 'all') query.brand = new RegExp(brand, 'i');
    if (condition && condition !== 'all') query.condition = condition;
    if (minPrice || maxPrice) query.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
    if (search) query.$or = [
      { title: new RegExp(search, 'i') },
      { brand: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];

    let sortOption = { createdAt: -1 };
    if (sort === 'price_low') sortOption = { price: 1 };
    if (sort === 'price_high') sortOption = { price: -1 };
    if (sort === 'rating') sortOption = { 'sellerId.rating': -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const phones = await Phone.find(query)
      .populate('sellerId', 'name phone rating reviewCount profilePicture')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Phone.countDocuments(query);

    res.json({
      phones,
      pagination: { 
        currentPage: Number(page), 
        totalPages: Math.ceil(total / Number(limit)), 
        totalItems: total, 
        hasNext: skip + phones.length < total, 
        hasPrev: Number(page) > 1 
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPhoneById = async (req, res) => {
  try {
    // For regular users, only show approved phones
    // For admins, show any phone for review purposes
    let query = { _id: req.params.id };
    
    if (req.user && req.user.role !== 'admin') {
      query.status = 'approved';
    }

    const phone = await Phone.findOne(query)
      .populate('sellerId', 'name phone rating reviewCount profilePicture createdAt')
      .populate('approvedBy', 'name email'); // For admin view

    if (!phone) {
      return res.status(404).json({ message: 'Phone not found' });
    }

    // Only increment views for approved phones
    if (phone.status === 'approved') {
      await Phone.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    }

    res.json(phone);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create phone with Cloudinary - now goes to pending status
const createPhone = async (req, res) => {
  uploadImages(req, res, async (err) => {
    if (err) return res.status(400).json({ message: 'File upload error', error: err.message });

    try {
      if (req.user.role !== 'seller') return res.status(403).json({ message: 'Only sellers can create listings' });

      const { title, brand, price, condition } = req.body;
      if (!title || !brand || !price || !condition) return res.status(400).json({ message: 'Missing required fields' });
      if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'At least one image is required' });

      // Extract Cloudinary URLs from uploaded files
      const images = req.files.map(file => file.path);
      const specs = req.body.specs ? JSON.parse(req.body.specs) : {};

      const phoneData = {
        title: title.trim(),
        brand: brand.trim(),
        price: Number(price),
        originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : null,
        condition: condition.trim(),
        description: req.body.description || '',
        location: req.body.location || '',
        images,
        specs,
        sellerId: req.user.userId,
        isAvailable: true,
        status: 'pending'  // New listings start as pending
      };

      const phone = await Phone.create(phoneData);
      const populatedPhone = await Phone.findById(phone._id)
        .populate('sellerId', 'name phone rating reviewCount profilePicture');

      // Emit socket event to notify admins of new listing
      try { 
        getIO().emit('new_pending_listing', { 
          phone: populatedPhone, 
          message: `New listing "${populatedPhone.title}" requires admin approval`,
          sellerId: populatedPhone.sellerId._id
        }); 
      } catch (socketError) { 
        console.error('Socket error:', socketError); 
      }

      res.status(201).json({ 
        message: 'Phone listing submitted for admin approval', 
        phone: populatedPhone,
        status: 'pending'
      });
    } catch (err) {
      // Clean up uploaded images on error
      if (req.files && req.files.length > 0) {
        req.files.forEach(async (file) => {
          try {
            const publicId = file.filename;
            await cloudinary.uploader.destroy(publicId);
          } catch (deleteError) {
            console.error('Error deleting image from Cloudinary:', deleteError);
          }
        });
      }
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
};

// Delete phone and cleanup images
const deletePhone = async (req, res) => {
  try {
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only sellers and admins can delete listings' });
    }

    const phone = await Phone.findById(req.params.id);
    if (!phone) return res.status(404).json({ message: 'Phone not found' });

    // Check if user owns this phone (sellers can only delete their own, admins can delete any)
    if (req.user.role === 'seller' && phone.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete your own listings' });
    }

    // Delete images from Cloudinary
    if (phone.images && phone.images.length > 0) {
      for (const imageUrl of phone.images) {
        try {
          // Extract public ID from Cloudinary URL
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`phone-marketplace/phones/${publicId}`);
        } catch (deleteError) {
          console.error('Error deleting image from Cloudinary:', deleteError);
        }
      }
    }

    await Phone.findByIdAndDelete(req.params.id);
    
    // Emit socket event
    try {
      getIO().emit('listing_deleted', {
        phoneId: req.params.id,
        sellerId: phone.sellerId,
        deletedBy: req.user.userId,
        isAdminAction: req.user.role === 'admin'
      });
    } catch (socketError) {
      console.error('Socket error:', socketError);
    }

    res.json({ message: 'Phone listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update phone
const updatePhone = async (req, res) => {
  uploadImages(req, res, async (err) => {
    if (err && err.code !== 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }

    try {
      if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Only sellers can update listings' });
      }

      const phone = await Phone.findById(req.params.id);
      if (!phone) {
        return res.status(404).json({ message: 'Phone not found' });
      }

      if (phone.sellerId.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'You can only update your own listings' });
      }

      const updateData = { ...req.body };
      
      // Handle specs
      if (updateData.specs && typeof updateData.specs === 'string') {
        updateData.specs = JSON.parse(updateData.specs);
      }

      // Handle images
      let finalImages = [];
      
      // Keep existing images if provided
      if (updateData.existingImages) {
        const existingImages = JSON.parse(updateData.existingImages);
        finalImages = [...existingImages];
      }
      
      // Add new uploaded images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => file.path);
        finalImages = [...finalImages, ...newImages];
      }
      
      if (finalImages.length > 0) {
        updateData.images = finalImages;
      }
      
      // Clean up form data fields
      delete updateData.existingImages;

      // If phone was previously rejected/approved, reset to pending for re-review
      if (phone.status === 'rejected' || phone.status === 'approved') {
        updateData.status = 'pending';
        updateData.adminNotes = null;
        updateData.approvedBy = null;
        updateData.approvedAt = null;
        updateData.rejectedAt = null;
      }

      const updatedPhone = await Phone.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('sellerId', 'name phone rating reviewCount profilePicture');

      // Notify admins if status changed to pending
      if (updateData.status === 'pending') {
        try {
          getIO().emit('listing_updated_pending', {
            phone: updatedPhone,
            message: `Updated listing "${updatedPhone.title}" requires admin re-approval`,
            sellerId: updatedPhone.sellerId._id
          });
        } catch (socketError) {
          console.error('Socket error:', socketError);
        }
      }

      res.json({ 
        message: phone.status !== 'pending' ? 'Phone updated and submitted for admin re-approval' : 'Phone updated successfully', 
        phone: updatedPhone 
      });
      
    } catch (err) {
      console.error('Update phone error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
};

// Get listing stats for seller dashboard
const getSellerStats = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can view stats' });
    }

    const sellerId = req.user.userId;

    const [statusCounts, totalViews, recentActivity] = await Promise.all([
      // Status breakdown
      Phone.aggregate([
        { $match: { sellerId: sellerId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Total views across all listings
      Phone.aggregate([
        { $match: { sellerId: sellerId } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]),
      
      // Recent activity
      Phone.find({ sellerId: sellerId })
        .select('title status createdAt approvedAt rejectedAt views adminNotes')
        .populate('approvedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    // Format status counts
    const counts = { pending: 0, approved: 0, rejected: 0, total: 0 };
    statusCounts.forEach(item => {
      counts[item._id] = item.count;
      counts.total += item.count;
    });

    const totalViewsCount = totalViews.length > 0 ? totalViews[0].totalViews : 0;

    res.json({
      statusCounts: counts,
      totalViews: totalViewsCount,
      recentActivity,
      summary: {
        activeListings: counts.approved,
        pendingApproval: counts.pending,
        needsAttention: counts.rejected,
        totalViews: totalViewsCount
      }
    });
  } catch (err) {
    console.error('Seller stats error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { 
  getPhones, 
  getPhoneById, 
  createPhone, 
  deletePhone, 
  updatePhone,
  getSellerStats
};