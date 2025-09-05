const Cart = require('../models/Cart');
const Phone = require('../models/Phone');

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

const getCart = async (req, res) => {
  try {
    console.log('Getting cart for user:', req.user.userId);
    
    let cart = await Cart.findOne({ userId: req.user.userId })
      .populate({
        path: 'items.phoneId',
        populate: {
          path: 'sellerId',
          select: 'name phone rating'
        }
      });

    // If no cart exists, create an empty one
    if (!cart) {
      cart = { items: [] };
    }

    console.log('Cart found:', cart);
    res.json(cart);
  } catch (err) {
    console.error('Error getting cart:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    console.log('Add to cart request:', req.body);
    console.log('User:', req.user);
    
    const { phoneId, quantity = 1 } = req.body;
    
    if (!phoneId) {
      return res.status(400).json({ message: 'Phone ID is required' });
    }

    // Check if phone exists and is available
    const phone = await Phone.findById(phoneId);
    if (!phone) {
      return res.status(404).json({ message: 'Phone not found' });
    }
    
    if (!phone.isAvailable) {
      return res.status(400).json({ message: 'Phone not available' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: req.user.userId });
    
    if (!cart) {
      cart = new Cart({
        userId: req.user.userId,
        items: []
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.phoneId.toString() === phoneId.toString()
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        phoneId,
        quantity
      });
    }

    await cart.save();

    // Populate the cart before sending response
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.phoneId',
        populate: {
          path: 'sellerId',
          select: 'name phone rating'
        }
      });

    console.log('Cart after adding item:', populatedCart);

    // Emit socket event if available
    const io = getIO();
    if (io) {
      io.to(`user_${req.user.userId}`).emit('cart_updated', populatedCart);
    }

    res.json(populatedCart);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const { phoneId, quantity } = req.body;
    
    if (!phoneId) {
      return res.status(400).json({ message: 'Phone ID is required' });
    }

    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items = cart.items.filter(
        item => item.phoneId.toString() !== phoneId.toString()
      );
    } else {
      // Update quantity
      const itemIndex = cart.items.findIndex(
        item => item.phoneId.toString() === phoneId.toString()
      );
      
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        return res.status(404).json({ message: 'Item not found in cart' });
      }
    }

    await cart.save();

    // Populate the cart before sending response
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.phoneId',
        populate: {
          path: 'sellerId',
          select: 'name phone rating'
        }
      });

    // Emit socket event if available
    const io = getIO();
    if (io) {
      io.to(`user_${req.user.userId}`).emit('cart_updated', populatedCart);
    }

    res.json(populatedCart);
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { phoneId } = req.params;
    
    if (!phoneId) {
      return res.status(400).json({ message: 'Phone ID is required' });
    }

    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      item => item.phoneId.toString() !== phoneId.toString()
    );

    await cart.save();

    // Populate the cart before sending response
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.phoneId',
        populate: {
          path: 'sellerId',
          select: 'name phone rating'
        }
      });

    // Emit socket event if available
    const io = getIO();
    if (io) {
      io.to(`user_${req.user.userId}`).emit('cart_updated', populatedCart);
    }

    res.json(populatedCart);
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user.userId },
      { items: [] },
      { new: true }
    );

    // Emit socket event if available
    const io = getIO();
    if (io) {
      io.to(`user_${req.user.userId}`).emit('cart_updated', { items: [] });
    }

    res.json({ message: 'Cart cleared successfully', items: [] });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Additional endpoint for merging guest cart
const mergeGuestCart = async (req, res) => {
  try {
    const { guestItems } = req.body;
    
    if (!guestItems || !Array.isArray(guestItems)) {
      return res.status(400).json({ message: 'Invalid guest items' });
    }

    let cart = await Cart.findOne({ userId: req.user.userId });
    
    if (!cart) {
      cart = new Cart({
        userId: req.user.userId,
        items: []
      });
    }

    // Merge guest items with existing cart
    for (const guestItem of guestItems) {
      const existingItemIndex = cart.items.findIndex(
        item => item.phoneId.toString() === guestItem.id.toString()
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart.items[existingItemIndex].quantity += guestItem.quantity;
      } else {
        // Add new item to cart
        cart.items.push({
          phoneId: guestItem.id,
          quantity: guestItem.quantity
        });
      }
    }

    await cart.save();

    // Populate the cart before sending response
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.phoneId',
        populate: {
          path: 'sellerId',
          select: 'name phone rating'
        }
      });

    // Emit socket event if available
    const io = getIO();
    if (io) {
      io.to(`user_${req.user.userId}`).emit('cart_updated', populatedCart);
    }

    res.json(populatedCart);
  } catch (err) {
    console.error('Error merging guest cart:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
  mergeGuestCart
};