const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route GET /api/categories
// Returns all categories and subcategories with counts
router.get('/', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { category: '$category', subCategory: '$subCategory' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.category',
          subCategories: {
            $push: { name: '$_id.subCategory', count: '$count' },
          },
          total: { $sum: '$count' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
