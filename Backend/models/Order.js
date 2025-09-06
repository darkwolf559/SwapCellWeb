const mongoose = require('mongoose');

// ================== DELIVERY ADDRESS SCHEMA ==================
const deliveryAddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  mobile: {
    type: String,
    required: true,
    validate: {
      validator: v => /^(\+94|0)[0-9]{9}$/.test(v),
      message: 'Please enter a valid Sri Lankan mobile number'
    }
  },
  otherMobile: {
    type: String,
    validate: {
      validator: v => !v || /^(\+94|0)[0-9]{9}$/.test(v),
      message: 'Please enter a valid Sri Lankan mobile number'
    }
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    validate: {
      validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Please enter a valid email address'
    }
  },
  province: {
    type: String,
    required: true,
    enum: [
      'Western Province','Central Province','Southern Province',
      'Northern Province','Eastern Province','North Western Province',
      'North Central Province','Uva Province','Sabaragamuwa Province'
    ]
  },
  district: { type: String, required: true },
  city: { type: String, required: true, trim: true },
  addressLine1: { type: String, required: true, trim: true },
  addressLine2: { type: String, trim: true }
}, { _id: false });

// ================== ORDER ITEM SCHEMA ==================
const orderItemSchema = new mongoose.Schema({
  phoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Phone', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending','confirmed','processing','shipped','delivered','cancelled'],
    default: 'pending'
  }
}, { _id: false });

// ================== PAYMENT DETAILS SCHEMA ==================
const paymentDetailsSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['card','bank_transfer','cash_on_delivery'],
    default: 'card'
  },
  transactionId: { type: String, required: true },
  cardLast4: {
    type: String,
    validate: {
      validator: v => !v || /^[0-9]{4}$/.test(v),
      message: 'Card last 4 digits must be exactly 4 numbers'
    }
  },
  status: {
    type: String,
    enum: ['pending','completed','failed','refunded'],
    default: 'pending'
  },
  gateway: { type: String, default: 'sandbox' },
  paidAt: { type: Date, default: Date.now }
}, { _id: false });

// ================== MAIN ORDER SCHEMA ==================
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  shippingCost: { type: Number, required: true, min: 0, default: 0 },
  courierType: { type: String, enum: ['courier','speed_post'], default: 'courier' },
  deliveryAddress: { type: deliveryAddressSchema, required: true },
  paymentDetails: { type: paymentDetailsSchema, required: true },
  status: {
    type: String,
    enum: ['pending','confirmed','processing','shipped','delivered','cancelled'],
    default: 'pending'
  },
  notes: { type: String, trim: true },
  estimatedDelivery: { type: Date },
  actualDelivery: { type: Date },
  trackingNumber: { type: String, trim: true },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ================== INDEXES ==================
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ 'items.sellerId': 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// ================== MIDDLEWARE ==================
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // calculate estimated delivery if just confirmed
  if (!this.estimatedDelivery && this.status === 'confirmed') {
    const deliveryDays = this.courierType === 'speed_post' ? 2 : 5;
    this.estimatedDelivery = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000);
  }

  // push status history if status changed
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.modifiedBy // should be set in controller
    });
  }

  next();
});

// ================== VIRTUALS ==================
orderSchema.virtual('customerName').get(function() {
  return `${this.deliveryAddress.firstName} ${this.deliveryAddress.lastName}`;
});

orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// ================== STATICS ==================
orderSchema.statics.getOrderStats = function(userId, role = 'buyer') {
  const matchStage = role === 'seller'
    ? { 'items.sellerId': mongoose.Types.ObjectId(userId) }
    : { userId: mongoose.Types.ObjectId(userId) };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
};

// ================== METHODS ==================
orderSchema.methods.addTracking = function(trackingNumber, courierName) {
  this.trackingNumber = trackingNumber;
  this.status = 'shipped';
  this.statusHistory.push({
    status: 'shipped',
    timestamp: new Date(),
    notes: `Shipped via ${courierName}. Tracking: ${trackingNumber}`
  });
  return this.save();
};

orderSchema.methods.markDelivered = function() {
  this.status = 'delivered';
  this.actualDelivery = new Date();
  this.statusHistory.push({
    status: 'delivered',
    timestamp: new Date(),
    notes: 'Order successfully delivered'
  });
  return this.save();
};

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
