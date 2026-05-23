const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route POST /api/rentals/checkout
// Create rental from cart
router.post('/checkout', protect, async (req, res) => {
  try {
    const { deliveryAddress, deliveryDate, notes } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (!item.product || !item.product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.product?.name || 'unknown'} is no longer available`,
        });
      }
      if (item.product.availableQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}`,
        });
      }
    }

    // Use the max tenure from cart items (or first item's tenure)
    const tenureMonths = cart.items[0].tenureMonths;
    const totalMonthlyRent = cart.totalMonthlyRent;
    const totalSecurityDeposit = cart.totalSecurityDeposit;
    const totalAmount = totalMonthlyRent * tenureMonths;

    const rentalItems = cart.items.map((item) => ({
      product: item.product._id,
      productName: item.product.name,
      monthlyRent: item.monthlyRent,
      securityDeposit: item.securityDeposit,
      tenureMonths: item.tenureMonths,
      quantity: item.quantity,
    }));

    const rental = await Rental.create({
      user: req.user._id,
      items: rentalItems,
      deliveryAddress,
      deliveryDate: new Date(deliveryDate),
      tenureMonths,
      totalMonthlyRent,
      totalSecurityDeposit,
      totalAmount,
      notes,
    });

    // Reduce available quantity
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { availableQuantity: -item.quantity },
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    await rental.populate('items.product user');

    res.status(201).json({ success: true, rental });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/rentals
// Get user's rentals
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const rentals = await Rental.find(query)
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rental.countDocuments(query);

    res.json({
      success: true,
      rentals,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/rentals/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const rental = await Rental.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('items.product user');

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    res.json({ success: true, rental });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/rentals/:id/request-return
router.put('/:id/request-return', protect, async (req, res) => {
  try {
    const rental = await Rental.findOne({ _id: req.params.id, user: req.user._id });
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    if (!['active', 'delivered'].includes(rental.status)) {
      return res.status(400).json({ success: false, message: 'Cannot request return for this rental' });
    }

    rental.status = 'return_requested';
    rental.returnDate = req.body.returnDate ? new Date(req.body.returnDate) : new Date();
    await rental.save();

    res.json({ success: true, rental });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/rentals/:id/extend
router.put('/:id/extend', protect, async (req, res) => {
  try {
    const { additionalMonths } = req.body;
    const rental = await Rental.findOne({ _id: req.params.id, user: req.user._id });

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    if (!['active', 'delivered'].includes(rental.status)) {
      return res.status(400).json({ success: false, message: 'Cannot extend this rental' });
    }

    rental.tenureMonths += parseInt(additionalMonths);
    rental.totalAmount += rental.totalMonthlyRent * parseInt(additionalMonths);
    if (rental.endDate) {
      rental.endDate = new Date(
        rental.endDate.getTime() + parseInt(additionalMonths) * 30 * 24 * 60 * 60 * 1000
      );
    }
    rental.status = 'extended';
    await rental.save();

    res.json({ success: true, rental });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
