const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET api/payments
// @desc    Get all payments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json([
      { id: 1, orderId: 1, amount: 99.99, method: 'credit_card', status: 'completed' },
      { id: 2, orderId: 2, amount: 149.99, method: 'paypal', status: 'pending' }
    ]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;