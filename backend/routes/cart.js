const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @route GET /api/cart
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) {
      return res.json({ success: true, cart: { items: [], totalMonthlyRent: 0, totalSecurityDeposit: 0 } });
    }
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/cart/add
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, tenureMonths, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.availableQuantity < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    // Find the tenure option
    const tenureOption = product.tenureOptions.find((t) => t.months === parseInt(tenureMonths));
    if (!tenureOption) {
      return res.status(400).json({ success: false, message: 'Invalid tenure option' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if same product+tenure already in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.tenureMonths === parseInt(tenureMonths)
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        tenureMonths: parseInt(tenureMonths),
        monthlyRent: tenureOption.monthlyRent,
        securityDeposit: product.securityDeposit,
        quantity,
      });
    }

    await cart.save();
    await cart.populate('items.product');

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/cart/update/:itemId
router.put('/update/:itemId', protect, async (req, res) => {
  try {
    const { quantity, tenureMonths } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity !== undefined) {
      if (quantity <= 0) {
        cart.items.pull(req.params.itemId);
      } else {
        item.quantity = quantity;
      }
    }

    if (tenureMonths !== undefined) {
      const product = await Product.findById(item.product);
      const tenureOption = product.tenureOptions.find((t) => t.months === parseInt(tenureMonths));
      if (!tenureOption) {
        return res.status(400).json({ success: false, message: 'Invalid tenure option' });
      }
      item.tenureMonths = parseInt(tenureMonths);
      item.monthlyRent = tenureOption.monthlyRent;
    }

    await cart.save();
    await cart.populate('items.product');

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/cart/remove/:itemId
router.delete('/remove/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate('items.product');

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/cart/clear
router.delete('/clear', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
