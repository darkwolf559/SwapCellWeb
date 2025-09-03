const Cart = require('../models/Cart');
const Phone = require('../models/Phone');
const { getIO } = require('../utils/socket');

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId })
      .populate({ path: 'items.phoneId', populate: { path: 'sellerId', select: 'name phone rating' } });
    res.json(cart || { items: [] });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const addToCart = async (req, res) => {
  try {
    const { phoneId, quantity = 1 } = req.body;
    const phone = await Phone.findById(phoneId);
    if (!phone || !phone.isAvailable) return res.status(404).json({ message: 'Phone not available' });

    let cart = await Cart.findOne({ userId: req.user.userId }) || new Cart({ userId: req.user.userId, items: [] });
    const index = cart.items.findIndex(i => i.phoneId.toString() === phoneId);
    if (index > -1) cart.items[index].quantity += quantity;
    else cart.items.push({ phoneId, quantity });

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate({ path: 'items.phoneId', populate: { path: 'sellerId', select: 'name phone rating' } });
    getIO().to(`user_${req.user.userId}`).emit('cart_updated', populatedCart);
    res.json(populatedCart);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const updateCart = async (req, res) => {
  try {
    const { phoneId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    if (quantity === 0) cart.items = cart.items.filter(i => i.phoneId.toString() !== phoneId);
    else {
      const index = cart.items.findIndex(i => i.phoneId.toString() === phoneId);
      if (index > -1) cart.items[index].quantity = quantity;
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate({ path: 'items.phoneId', populate: { path: 'sellerId', select: 'name phone rating' } });
    getIO().to(`user_${req.user.userId}`).emit('cart_updated', populatedCart);
    res.json(populatedCart);
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user.userId }, { items: [] });
    getIO().to(`user_${req.user.userId}`).emit('cart_updated', { items: [] });
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) { res.status(500).json({ message: 'Server error', error: err.message }); }
};

module.exports = { getCart, addToCart, updateCart, clearCart };
