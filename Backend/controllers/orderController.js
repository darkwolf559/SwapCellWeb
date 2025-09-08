const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Phone = require('../models/Phone');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Helper function to get IO instance safely
const getIO = () => {
  try {
    const { getIO } = require('../utils/socket');
    return getIO();
  } catch (error) {
    console.log('Socket not available:', error.message);
    return null;
  }
};

// Email configuration with better error handling
const createEmailTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false // For development only
    }
  };

  console.log('Email config:', {
    host: config.host,
    port: config.port,
    user: config.auth.user ? '***@' + config.auth.user.split('@')[1] : 'NOT SET',
    pass: config.auth.pass ? 'SET' : 'NOT SET'
  });

  return nodemailer.createTransport(config);
};

const createOrder = async (req, res) => {
  try {
    const { 
      deliveryAddress, 
      courierType, 
      shippingCost, 
      totalAmount, 
      paymentDetails,
      items 
    } = req.body;

    // Validate required fields
    if (!deliveryAddress || !items || items.length === 0) {
      return res.status(400).json({ 
        message: 'Delivery address and items are required' 
      });
    }

    // Validate delivery address fields
    const requiredFields = ['firstName', 'lastName', 'mobile', 'email', 'province', 'district', 'city', 'addressLine1'];
    for (const field of requiredFields) {
      if (!deliveryAddress[field]) {
        return res.status(400).json({ 
          message: `${field} is required in delivery address` 
        });
      }
    }

    // Get cart items if not provided directly
    let orderItems = items;
    if (!items || items.length === 0) {
      const cart = await Cart.findOne({ userId: req.user.userId })
        .populate('items.phoneId');
      
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      orderItems = cart.items.map(item => ({
        phoneId: item.phoneId._id,
        quantity: item.quantity,
        price: item.phoneId.price,
        sellerId: item.phoneId.sellerId
      }));
    }

    // Calculate total if not provided
    let calculatedTotal = totalAmount;
    if (!calculatedTotal) {
      calculatedTotal = orderItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      ) + (shippingCost || 0);
    }

    // Generate order number
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Create order
    const order = await Order.create({
      orderNumber,
      userId: req.user.userId,
      items: orderItems,
      totalAmount: calculatedTotal,
      shippingCost: shippingCost || 0,
      deliveryAddress,
      courierType: courierType || 'courier',
      paymentDetails: {
        method: paymentDetails?.method || 'card',
        transactionId: paymentDetails?.transactionId || 'TEST_' + Date.now(),
        cardLast4: paymentDetails?.cardLast4,
        status: 'completed'
      },
      status: 'confirmed',
      createdAt: new Date()
    });

    // Clear cart
    await Cart.findOneAndUpdate(
      { userId: req.user.userId }, 
      { items: [] }
    );

    // Update phone availability
    const phoneIds = orderItems.map(item => item.phoneId);
    await Phone.updateMany(
      { _id: { $in: phoneIds } }, 
      { isAvailable: false }
    );

    // Notify sellers via socket
    const io = getIO();
    if (io) {
      for (const item of orderItems) {
        io.to(`user_${item.sellerId}`).emit('new_order', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          phoneId: item.phoneId,
          buyer: {
            email: deliveryAddress.email,
            name: `${deliveryAddress.firstName} ${deliveryAddress.lastName}`,
            phone: deliveryAddress.mobile
          },
          deliveryAddress,
          totalAmount: item.price * item.quantity
        });
      }

      // Notify user of successful order
      io.to(`user_${req.user.userId}`).emit('order_created', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: 'confirmed'
      });

      // Clear user's cart via socket
      io.to(`user_${req.user.userId}`).emit('cart_updated', { 
        items: [] 
      });
    }

    console.log(`Order created successfully: ${order.orderNumber}`);

    res.status(201).json({ 
      success: true,
      message: 'Order created successfully', 
      orderId: order._id,
      orderNumber: order.orderNumber,
      totalAmount: calculatedTotal,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt
      }
    });
  } catch (err) { 
    console.error('Order creation error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    }); 
  }
};

const sendOrderConfirmation = async (req, res) => {
  try {
    const { orderId, email } = req.body;

    console.log('📧 Attempting to send confirmation email...');
    console.log('Order ID:', orderId);
    console.log('Email:', email);
    console.log('User ID:', req.user.userId);

    if (!orderId || !email) {
      return res.status(400).json({ 
        message: 'Order ID and email are required' 
      });
    }

    // Test MongoDB connection first
    try {
      console.log('🔍 Testing MongoDB connection...');
      const connectionState = require('mongoose').connection.readyState;
      console.log('MongoDB connection state:', connectionState); // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
      
      if (connectionState !== 1) {
        throw new Error(`MongoDB not connected. State: ${connectionState}`);
      }
    } catch (dbError) {
      console.error('❌ MongoDB connection error:', dbError);
      return res.status(500).json({ 
        success: false,
        message: 'Database connection error',
        error: dbError.message 
      });
    }

    // Get order details with increased timeout and better error handling
    console.log('📦 Fetching order details...');
    const order = await Order.findById(orderId)
      .populate({
        path: 'items.phoneId',
        select: 'title brand images price'
      })
      .populate('userId', 'name email')
      .maxTimeMS(30000) // 30 seconds timeout
      .lean() // Use lean() for better performance
      .exec();

    if (!order) {
      console.error('❌ Order not found:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('✅ Order found:', order.orderNumber);

    // Verify user owns the order
    if (order.userId._id.toString() !== req.user.userId) {
      console.error('❌ Unauthorized access to order');
      return res.status(403).json({ message: 'Unauthorized access to order' });
    }

    // Test email configuration
    console.log('📧 Testing email configuration...');
    const transporter = createEmailTransporter();
    
    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('✅ Email transporter verified successfully');
    } catch (verifyError) {
      console.error('❌ Email transporter verification failed:', verifyError);
      return res.status(500).json({ 
        success: false,
        message: 'Email configuration error',
        error: verifyError.message 
      });
    }

    // Generate email HTML
    console.log('📝 Generating email content...');
    const emailHTML = generateOrderConfirmationEmail(order);

    const mailOptions = {
      from: `"Phone Marketplace" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: emailHTML
    };

    console.log('📤 Sending email to:', email);
    const emailResult = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', emailResult.messageId);

    res.json({ 
      success: true,
      message: 'Confirmation email sent successfully',
      messageId: emailResult.messageId
    });
  } catch (err) {
    console.error('❌ Email sending error:', err);
    
    // More specific error handling
    let errorMessage = 'Failed to send confirmation email';
    let errorCode = 500;
    
    if (err.name === 'CastError') {
      errorMessage = 'Invalid order ID format';
      errorCode = 400;
    } else if (err.name === 'MongooseError' && err.message.includes('buffering timed out')) {
      errorMessage = 'Database connection timeout. Please try again.';
      errorCode = 503; // Service Unavailable
    } else if (err.code === 'EAUTH' || err.code === 'ECONNECTION') {
      errorMessage = 'Email service configuration error';
      errorCode = 502; // Bad Gateway
    }
    
    res.status(errorCode).json({ 
      success: false,
      message: errorMessage,
      error: err.message,
      errorCode: err.code || 'UNKNOWN'
    });
  }
};

const generateOrderConfirmationEmail = (order) => {
  const courierNames = {
    'courier': 'Standard Courier',
    'speed_post': 'Speed Post'
  };

  const courierName = courierNames[order.courierType] || 'Standard Courier';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
            .content { padding: 30px 20px; }
            .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .items-list { margin: 20px 0; }
            .item { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee; }
            .item:last-child { border-bottom: none; }
            .item-image { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 15px; }
            .item-details { flex: 1; }
            .item-title { font-weight: bold; color: #333; margin-bottom: 5px; }
            .item-price { color: #667eea; font-weight: bold; }
            .address-section { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .total-section { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .total-amount { font-size: 24px; font-weight: bold; color: #2e7d32; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
            .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Confirmation</h1>
                <p>Thank you for your purchase!</p>
            </div>
            
            <div class="content">
                <div class="order-info">
                    <h2 style="margin-top: 0; color: #333;">Order Details</h2>
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                    <p><strong>Status:</strong> <span style="color: #2e7d32; font-weight: bold;">Confirmed</span></p>
                    <p><strong>Delivery Method:</strong> ${courierName}</p>
                </div>

                <div class="address-section">
                    <h3 style="margin-top: 0; color: #1976d2;">Delivery Address</h3>
                    <p><strong>${order.deliveryAddress.firstName} ${order.deliveryAddress.lastName}</strong></p>
                    <p>${order.deliveryAddress.addressLine1}</p>
                    ${order.deliveryAddress.addressLine2 ? `<p>${order.deliveryAddress.addressLine2}</p>` : ''}
                    <p>${order.deliveryAddress.city}, ${order.deliveryAddress.district}</p>
                    <p>${order.deliveryAddress.province}</p>
                    <p><strong>Phone:</strong> ${order.deliveryAddress.mobile}</p>
                    ${order.deliveryAddress.otherMobile ? `<p><strong>Alternative Phone:</strong> ${order.deliveryAddress.otherMobile}</p>` : ''}
                    <p><strong>Email:</strong> ${order.deliveryAddress.email}</p>
                </div>
<div class="items-list">
  <h3 style="color: #333;">Items Ordered</h3>
  ${order.items.map(item => `
      <div class="item">
          <img src="${item.phoneId.images && item.phoneId.images[0] ? item.phoneId.images[0] : '/api/placeholder/60/60'}" 
               alt="${item.phoneId.title}" class="item-image">
          <div class="item-details">
              <div class="item-title">${item.phoneId.title}</div>
              <div>Brand: ${item.phoneId.brand}</div>
              <div>Quantity: ${item.quantity}</div>
          </div>
          <div class="item-price">
              LKR ${(item.price * item.quantity).toLocaleString()}
          </div>
      </div>
  `).join('')}
</div>


                <div class="total-section">
                    <h3 style="margin-top: 0; color: #333;">Order Summary</h3>
                    <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                        <span>Subtotal:</span>
                        <span>LKR ${(order.totalAmount - order.shippingCost).toLocaleString()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                        <span>Shipping (${courierName}):</span>
                        <span>LKR ${order.shippingCost.toLocaleString()}</span>
                    </div>
                    <hr style="margin: 15px 0;">
                    <div class="total-amount">
                        Total: LKR ${order.totalAmount.toLocaleString()}
                    </div>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <h3 style="color: #333;">What happens next?</h3>
                    <div style="background: #fff3e0; padding: 20px; border-radius: 8px; text-align: left;">
                        <ul style="margin: 0; padding-left: 20px; color: #666;">
                            <li style="margin: 10px 0;">Our sellers will contact you within 24 hours</li>
                            <li style="margin: 10px 0;">Items will be prepared and dispatched</li>
                            <li style="margin: 10px 0;">You'll receive tracking information once shipped</li>
                            <li style="margin: 10px 0;">Expected delivery: ${order.courierType === 'speed_post' ? '1-2 business days' : '3-5 business days'}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p>Thank you for choosing Phone Marketplace!</p>
                <p>If you have any questions, please contact us at support@swapcellstore.lk</p>
                <p style="font-size: 12px; color: #999;">
                    This is an automated email. Please do not reply directly to this message.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// ... rest of your existing functions (myOrders, mySales, getOrderDetails, updateOrderStatus)
const myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate({
        path: 'items.phoneId',
        select: 'title brand images price condition'
      })
      .sort({ createdAt: -1 });

    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      shippingCost: order.shippingCost,
      courierType: order.courierType,
      createdAt: order.createdAt,
      deliveryAddress: order.deliveryAddress,
      paymentDetails: {
        method: order.paymentDetails.method,
        cardLast4: order.paymentDetails.cardLast4,
        status: order.paymentDetails.status
      },
      items: order.items.map(item => ({
        _id: item.phoneId._id,
        title: item.phoneId.title,
        brand: item.phoneId.brand,
        price: item.price,
        quantity: item.quantity,
        image: item.phoneId.images && item.phoneId.images[0] 
          ? item.phoneId.images[0] 
          : '/api/placeholder/400/300',
        condition: item.phoneId.condition
      }))
    }));

    res.json({
      success: true,
      data: formattedOrders
    });
  } catch (err) { 
    console.error('Get orders error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    }); 
  }
};

const mySales = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ 
        message: 'Only sellers can view sales' 
      });
    }

    const sales = await Order.find({ 'items.sellerId': req.user.userId })
      .populate('userId', 'name email phone')
      .populate({
        path: 'items.phoneId',
        select: 'title brand images condition'
      })
      .sort({ createdAt: -1 });

    // Filter and format sales for this seller
    const filteredSales = sales.map(order => {
      const sellerItems = order.items.filter(item => 
        item.sellerId.toString() === req.user.userId
      );

      if (sellerItems.length === 0) return null;

      const sellerTotal = sellerItems.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: sellerTotal,
        createdAt: order.createdAt,
        buyer: {
          name: order.userId.name,
          email: order.userId.email,
          phone: order.userId.phone
        },
        deliveryAddress: order.deliveryAddress,
        items: sellerItems.map(item => ({
          _id: item.phoneId._id,
          title: item.phoneId.title,
          brand: item.phoneId.brand,
          price: item.price,
          quantity: item.quantity,
          image: item.phoneId.images && item.phoneId.images[0] 
            ? item.phoneId.images[0] 
            : '/api/placeholder/400/300',
          condition: item.phoneId.condition
        }))
      };
    }).filter(sale => sale !== null);

    res.json({
      success: true,
      data: filteredSales
    });
  } catch (err) { 
    console.error('Get sales error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    }); 
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate({
        path: 'items.phoneId',
        select: 'title brand images price condition'
      });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    const isOwner = order.userId._id.toString() === req.user.userId;
    const isSeller = req.user.role === 'seller' && 
      order.items.some(item => item.sellerId.toString() === req.user.userId);

    if (!isOwner && !isSeller) {
      return res.status(403).json({ message: 'Unauthorized access to order' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (err) {
    console.error('Get order details error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user can update this order
    const isSeller = req.user.role === 'seller' && 
      order.items.some(item => item.sellerId.toString() === req.user.userId);
    const isAdmin = req.user.role === 'admin';

    if (!isSeller && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to update order status' });
    }

    order.status = status;
    order.statusUpdatedAt = new Date();
    await order.save();

    // Notify buyer via socket
    const io = getIO();
    if (io) {
      io.to(`user_${order.userId}`).emit('order_status_updated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: status,
        updatedAt: order.statusUpdatedAt
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: order._id,
        status: order.status,
        updatedAt: order.statusUpdatedAt
      }
    });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
};

module.exports = { 
  createOrder, 
  sendOrderConfirmation,
  myOrders, 
  mySales, 
  getOrderDetails,
  updateOrderStatus
};