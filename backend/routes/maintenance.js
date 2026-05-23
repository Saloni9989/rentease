const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const Rental = require('../models/Rental');
const { protect, adminOnly } = require('../middleware/auth');

// @route POST /api/maintenance
// User submits maintenance request
router.post('/', protect, async (req, res) => {
  try {
    const { rentalId, productId, issueType, description, priority } = req.body;

    // Verify rental belongs to user
    const rental = await Rental.findOne({ _id: rentalId, user: req.user._id });
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    const request = await Maintenance.create({
      user: req.user._id,
      rental: rentalId,
      product: productId,
      issueType,
      description,
      priority: priority || 'medium',
    });

    await request.populate('product rental');

    res.status(201).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/maintenance
// User gets their maintenance requests
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const requests = await Maintenance.find(query)
      .populate('product rental')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/maintenance/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await Maintenance.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('product rental');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
