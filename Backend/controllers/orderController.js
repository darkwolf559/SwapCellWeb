const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Phone = require('../models/Phone');
const { getIO } = require('../utils/socket');

const createOrder = async (req, res) => {
  try {
    const { deliveryAddress, contactNumber } = req.body;

    const cart = await Cart.findOne({ userId: req.user.userId }).populate('items.phoneId');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      totalAmount += item.phoneId.price * item.quantity;
      return {
        phoneId: item.phoneId._id,
        quantity: item.quantity,
        price: item.phoneId.price,
        sellerId: item.phoneId.sellerId
      };
    });

    const order = await Order.create({ userId: req.user.userId, items: orderItems, totalAmount, deliveryAddress, contactNumber });

    await Cart.findOneAndUpdate({ userId: req.user.userId }, { items: [] });
    await Phone.updateMany({ _id: { $in: cart.items.map(i => i.phoneId._id) } }, { isAvailable: false });

    // Notify sellers
    for (const item of orderItems) {
      getIO().to(`user_${item.sellerId}`).emit('new_order', {
        orderId: order._id,
        phoneId: item.phoneId,
        buyer: req.user.email
      });
    }

    getIO().to(`user_${req.user.userId}`).emit('cart_updated', { items: [] });

    res.status(201).json({ message: 'Order created successfully', orderId: order._id, totalAmount });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate({ path: 'items.phoneId', select: 'title brand images price' })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const mySales = async (req, res) => {
  try {
    if (req.user.role !== 'seller') return res.status(403).json({ message: 'Only sellers can view sales' });

    const sales = await Order.find({ 'items.sellerId': req.user.userId })
      .populate('userId', 'name email phone')
      .populate({ path: 'items.phoneId', select: 'title brand images' })
      .sort({ createdAt: -1 });

    const filteredSales = sales.map(order => ({
      ...order.toObject(),
      items: order.items.filter(item => item.sellerId.toString() === req.user.userId)
    })).filter(order => order.items.length > 0);

    res.json(filteredSales);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

module.exports = { createOrder, myOrders, mySales };
