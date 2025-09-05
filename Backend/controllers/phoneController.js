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
    let query = { isAvailable: true };

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
    const phone = await Phone.findById(req.params.id)
      .populate('sellerId', 'name phone rating reviewCount profilePicture createdAt');
    if (!phone) return res.status(404).json({ message: 'Phone not found' });

    await Phone.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json(phone);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create phone with Cloudinary
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
        isAvailable: true
      };

      const phone = await Phone.create(phoneData);
      const populatedPhone = await Phone.findById(phone._id)
        .populate('sellerId', 'name phone rating reviewCount profilePicture');

      // Emit socket event
      try { 
        getIO().emit('new_phone_listing', { 
          phone: populatedPhone, 
          message: `New ${populatedPhone.brand} ${populatedPhone.title} listed!` 
        }); 
      } catch (socketError) { 
        console.error('Socket error:', socketError); 
      }

      res.status(201).json({ 
        message: 'Phone listing created successfully', 
        phone: populatedPhone 
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
    if (req.user.role !== 'seller') return res.status(403).json({ message: 'Only sellers can delete listings' });

    const phone = await Phone.findById(req.params.id);
    if (!phone) return res.status(404).json({ message: 'Phone not found' });

    // Check if user owns this phone
    if (phone.sellerId.toString() !== req.user.userId) {
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
    res.json({ message: 'Phone listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update phone
const updatePhone = async (req, res) => {
  try {
    if (req.user.role !== 'seller') return res.status(403).json({ message: 'Only sellers can update listings' });

    const phone = await Phone.findById(req.params.id);
    if (!phone) return res.status(404).json({ message: 'Phone not found' });

    // Check if user owns this phone
    if (phone.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only update your own listings' });
    }

    const updateData = { ...req.body };
    if (updateData.specs && typeof updateData.specs === 'string') {
      updateData.specs = JSON.parse(updateData.specs);
    }

    const updatedPhone = await Phone.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    ).populate('sellerId', 'name phone rating reviewCount profilePicture');

    res.json({ message: 'Phone updated successfully', phone: updatedPhone });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { 
  getPhones, 
  getPhoneById, 
  createPhone, 
  deletePhone, 
  updatePhone 
};