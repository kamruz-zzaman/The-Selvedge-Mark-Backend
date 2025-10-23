const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET api/shipping
// @desc    Get shipping methods
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json([
      { id: 1, name: 'Standard Shipping', price: 5.99 },
      { id: 2, name: 'Express Shipping', price: 15.99 }
    ]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;