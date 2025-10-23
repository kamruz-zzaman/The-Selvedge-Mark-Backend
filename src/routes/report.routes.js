const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET api/reports/sales
// @desc    Get sales reports
// @access  Private
router.get('/sales', auth, async (req, res) => {
  try {
    res.json({
      total: 15000,
      monthly: [1200, 1500, 1800, 1600, 1400, 1300, 1200, 1100, 1000, 1200, 1300, 1400],
      categories: {
        clothing: 8000,
        accessories: 4000,
        footwear: 3000
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/reports/inventory
// @desc    Get inventory reports
// @access  Private
router.get('/inventory', auth, async (req, res) => {
  try {
    res.json({
      total_items: 500,
      low_stock: 25,
      out_of_stock: 10,
      categories: {
        clothing: 300,
        accessories: 150,
        footwear: 50
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;