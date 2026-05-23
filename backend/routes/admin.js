const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Rental = require('../models/Rental');
const Maintenance = require('../models/Maintenance');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

// @route GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      activeRentals,
      pendingRentals,
      openMaintenance,
      totalRentals,
    ] = await Promise.all([
      User.countDocuments({ role: 'user', isActive: true }),
      Product.countDocuments({ isActive: true }),
      Rental.countDocuments({ status: { $in: ['active', 'delivered', 'extended'] } }),
      Rental.countDocuments({ status: 'pending' }),
      Maintenance.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      Rental.countDocuments(),
    ]);

    // Monthly Recurring Revenue
    const activeRentalDocs = await Rental.find({
      status: { $in: ['active', 'delivered', 'extended'] },
    });
    const mrr = activeRentalDocs.reduce((sum, r) => sum + r.totalMonthlyRent, 0);

    // Recent rentals
    const recentRentals = await Rental.find()
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Rentals by status
    const rentalsByStatus = await Rental.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        activeRentals,
        pendingRentals,
        openMaintenance,
        totalRentals,
        mrr,
      },
      recentRentals,
      rentalsByStatus,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── User Management ──────────────────────────────────────────────────────────

// @route GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/admin/users/:id/toggle
router.put('/users/:id/toggle', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Rental Management ────────────────────────────────────────────────────────

// @route GET /api/admin/rentals
router.get('/rentals', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const rentals = await Rental.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name category')
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

// @route PUT /api/admin/rentals/:id/status
router.put('/rentals/:id/status', async (req, res) => {
  try {
    const { status, adminNotes, damageReport, damageCharges } = req.body;
    const rental = await Rental.findById(req.params.id);

    if (!rental) return res.status(404).json({ success: false, message: 'Rental not found' });

    const prevStatus = rental.status;
    rental.status = status;
    if (adminNotes) rental.adminNotes = adminNotes;
    if (damageReport) rental.damageReport = damageReport;
    if (damageCharges !== undefined) rental.damageCharges = damageCharges;

    // Set dates based on status transitions
    if (status === 'active' && prevStatus === 'delivered') {
      rental.startDate = new Date();
      rental.endDate = new Date(
        Date.now() + rental.tenureMonths * 30 * 24 * 60 * 60 * 1000
      );
    }

    if (status === 'returned') {
      rental.actualReturnDate = new Date();
      // Restore inventory
      for (const item of rental.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { availableQuantity: item.quantity },
        });
      }
    }

    await rental.save();
    await rental.populate('user items.product');

    res.json({ success: true, rental });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Maintenance Management ───────────────────────────────────────────────────

// @route GET /api/admin/maintenance
router.get('/maintenance', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const requests = await Maintenance.find(query)
      .populate('user', 'name email phone')
      .populate('product', 'name category')
      .populate('rental')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/admin/maintenance/:id
router.put('/maintenance/:id', async (req, res) => {
  try {
    const { status, technicianNotes, scheduledDate, priority } = req.body;
    const request = await Maintenance.findById(req.params.id);

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (status) request.status = status;
    if (technicianNotes) request.technicianNotes = technicianNotes;
    if (scheduledDate) request.scheduledDate = new Date(scheduledDate);
    if (priority) request.priority = priority;
    if (status === 'resolved') request.resolvedDate = new Date();

    await request.save();
    await request.populate('user product rental');

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Reports ──────────────────────────────────────────────────────────────────

// @route GET /api/admin/reports/revenue
router.get('/reports/revenue', async (req, res) => {
  try {
    const monthlyRevenue = await Rental.aggregate([
      { $match: { status: { $nin: ['cancelled', 'pending'] } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    res.json({ success: true, monthlyRevenue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/admin/reports/products
router.get('/reports/products', async (req, res) => {
  try {
    const productUtilization = await Product.find({ isActive: true })
      .select('name category subCategory totalQuantity availableQuantity')
      .lean();

    const withUtilization = productUtilization.map((p) => ({
      ...p,
      rentedQuantity: p.totalQuantity - p.availableQuantity,
      utilizationRate:
        p.totalQuantity > 0
          ? (((p.totalQuantity - p.availableQuantity) / p.totalQuantity) * 100).toFixed(1)
          : 0,
    }));

    res.json({ success: true, products: withUtilization });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
