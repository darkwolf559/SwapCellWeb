const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['buyer', 'seller', 'admin'], 
    default: 'buyer' 
  },
  profilePicture: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Phone' }],
  
  // Admin specific fields
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
  adminPermissions: {
    canApproveListings: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false }
  },
  
  // Password reset fields
  passwordResetCode: { type: String },
  passwordResetExpires: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
});

// Set admin permissions automatically when role is admin
userSchema.pre('save', function(next) {
  if (this.role === 'admin' && this.isModified('role')) {
    this.adminPermissions = {
      canApproveListings: true,
      canManageUsers: true,
      canViewAnalytics: true
    };
  }
  next();
});

module.exports = mongoose.model('User', userSchema);