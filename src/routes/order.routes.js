const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET api/orders
// @desc    Get all orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json([
      { id: 1, customer: 'John Doe', total: 179.98, status: 'processing', date: new Date() },
      { id: 2, customer: 'Jane Smith', total: 99.99, status: 'completed', date: new Date() }
    ]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    res.json({
      id: 1,
      customer: 'John Doe',
      items: [
        { product: 'Classic Denim Jacket', price: 99.99, quantity: 1 },
        { product: 'Slim Jeans', price: 79.99, quantity: 1 }
      ],
      total: 179.98,
      status: 'processing',
      date: new Date()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;