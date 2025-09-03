const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  condition: { type: String, enum: ['Excellent', 'Very Good', 'Good', 'Fair'], required: true },
  description: { type: String },
  images: [{ type: String }],
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specs: {
    ram: String,
    storage: String,
    battery: String,
    camera: String,
    processor: String,
    screen: String,
    os: String
  },
  location: { type: String },
  isAvailable: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Phone', phoneSchema);
