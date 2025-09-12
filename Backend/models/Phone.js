const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  brand: { type: String, required: true, enum: ['Apple','Samsung','Google','OnePlus','Xiaomi','Huawei','Sony','LG','Motorola','Nokia','Other'] },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0 },
  condition: { type: String, required: true, enum: ['Excellent','Very Good','Good','Fair'] },
  images: [{ type: String, required: true }],
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
  description: String,
  location: String,
  isAvailable: { type: Boolean, default: true },
  
  // Admin approval system
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  adminNotes: { type: String }, // Admin can leave notes when rejecting
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

phoneSchema.pre('save', function(next) { 
  this.updatedAt = Date.now(); 
  next(); 
});

// Indexes for performance
phoneSchema.index({ sellerId: 1, createdAt: -1 });
phoneSchema.index({ brand: 1, price: 1 });
phoneSchema.index({ status: 1, createdAt: -1 }); // For admin queries

module.exports = mongoose.model('Phone', phoneSchema);