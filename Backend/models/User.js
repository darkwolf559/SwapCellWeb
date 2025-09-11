const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['buyer', 'seller'], default: 'buyer' },
  profilePicture: { type: String },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Phone' }],
  
  // Password reset fields
  passwordResetCode: { type: String },
  passwordResetExpires: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);