const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET api/customers
// @desc    Get all customers
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json([
      { id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-1234' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '555-5678' }
    ]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/customers/:id
// @desc    Get customer by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    res.json({ id: 1, name: 'John Doe', email: 'john@example.com', phone: '555-1234' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;