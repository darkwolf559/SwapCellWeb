const Phone = require('../models/Phone');
const { getIO } = require('../utils/socket');

const getPhones = async (req, res) => {
  try {
    const { brand, condition, minPrice, maxPrice, search, sort } = req.query;
    let query = { isAvailable: true };
    if (brand) query.brand = new RegExp(brand, 'i');
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) query.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
    if (search) query.$or = [
      { title: new RegExp(search, 'i') },
      { brand: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') }
    ];

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const phones = await Phone.find(query)
      .populate('sellerId', 'name phone rating reviewCount')
      .sort(sortOption)
      .limit(50);

    res.json(phones);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getPhoneById = async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.id)
      .populate('sellerId', 'name phone rating reviewCount');
    if (!phone) return res.status(404).json({ message: 'Phone not found' });
    await Phone.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json(phone);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createPhone = async (req, res) => {
  try {
    if (req.user.role !== 'seller') return res.status(403).json({ message: 'Only sellers can create listings' });
    const phone = await Phone.create({ ...req.body, sellerId: req.user.userId });
    const populatedPhone = await Phone.findById(phone._id).populate('sellerId', 'name phone rating reviewCount');

    getIO().emit('new_phone_listing', populatedPhone);
    res.status(201).json(populatedPhone);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updatePhone = async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.id);
    if (!phone) return res.status(404).json({ message: 'Phone not found' });
    if (phone.sellerId.toString() !== req.user.userId) return res.status(403).json({ message: 'You can only edit your own listings' });

    const updatedPhone = await Phone.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('sellerId', 'name phone rating reviewCount');
    res.json(updatedPhone);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deletePhone = async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.id);
    if (!phone) return res.status(404).json({ message: 'Phone not found' });
    if (phone.sellerId.toString() !== req.user.userId) return res.status(403).json({ message: 'You can only delete your own listings' });

    await Phone.findByIdAndDelete(req.params.id);
    res.json({ message: 'Phone listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getPhones, getPhoneById, createPhone, updatePhone, deletePhone };
