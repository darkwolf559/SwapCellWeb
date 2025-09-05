const User = require('../models/User');
const Phone = require('../models/Phone');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage configuration for profile pictures
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'phone-marketplace/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 300, height: 300, crop: 'fill', quality: 'auto:good', gravity: 'face' },
      { format: 'webp' }
    ],
  },
});

const profileFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for profile pictures!'), false);
  }
};

const profileUpload = multer({ 
  storage: profileStorage, 
  fileFilter: profileFileFilter, 
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile pictures
  } 
});

const uploadProfilePicture = profileUpload.single('profilePicture');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) { 
    res.status(500).json({ message: 'Server error', error: err.message }); 
  }
};

const updateProfile = async (req, res) => {
  uploadProfilePicture(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'Profile picture upload error', error: err.message });
    }

    try {
      const { name, phone } = req.body;
      const updateData = {};

      // Only update fields that are provided
      if (name) updateData.name = name.trim();
      if (phone) updateData.phone = phone.trim();

      // If a new profile picture was uploaded
      if (req.file) {
        // Get current user to delete old profile picture
        const currentUser = await User.findById(req.user.userId);
        
        // Delete old profile picture from Cloudinary if it exists
        if (currentUser && currentUser.profilePicture) {
          try {
            // Extract public ID from Cloudinary URL
            const urlParts = currentUser.profilePicture.split('/');
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            const publicId = publicIdWithExtension.split('.')[0];
            await cloudinary.uploader.destroy(`phone-marketplace/profiles/${publicId}`);
            console.log('Old profile picture deleted from Cloudinary');
          } catch (deleteError) {
            console.error('Error deleting old profile picture from Cloudinary:', deleteError);
          }
        }

        // Set new profile picture URL
        updateData.profilePicture = req.file.path;
      }

      // Update user in database
      const updatedUser = await User.findByIdAndUpdate(
        req.user.userId, 
        updateData, 
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ 
        message: 'Profile updated successfully', 
        user: updatedUser 
      });
    } catch (err) {
      // Clean up uploaded image on error
      if (req.file) {
        try {
          const publicId = req.file.filename;
          await cloudinary.uploader.destroy(publicId);
          console.log('Cleaned up uploaded file due to error');
        } catch (deleteError) {
          console.error('Error deleting image from Cloudinary:', deleteError);
        }
      }
      console.error('Profile update error:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
};

const myListings = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can view listings' });
    }
    
    const phones = await Phone.find({ sellerId: req.user.userId })
      .populate('sellerId', 'name phone rating reviewCount profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(phones);
  } catch (err) { 
    console.error('My listings error:', err);
    res.status(500).json({ message: 'Server error', error: err.message }); 
  }
};

module.exports = { getProfile, updateProfile, myListings };