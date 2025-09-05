const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  brand: { type: String, required: true, enum: ['Apple','Samsung','Google','OnePlus','Xiaomi','Huawei','Sony','LG','Motorola','Nokia','Other'] },
  price: { type: Number, required: true, min: 0 },
  condition: { type: String, required: true, enum: ['Excellent','Very Good','Good','Fair'] },
  images: [{ type: String, required: true }],
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specs: { ram: String, storage: String, battery: String, camera: String, processor: String, screen: String, os: String },
  description: String,
  location: String,
  isAvailable: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

phoneSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });
phoneSchema.index({ sellerId: 1, createdAt: -1 });
phoneSchema.index({ brand: 1, price: 1 });

module.exports = mongoose.model('Phone', phoneSchema);
