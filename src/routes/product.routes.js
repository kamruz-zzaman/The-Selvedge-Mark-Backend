const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    res.json([
      { id: 1, name: 'Classic Denim Jacket', price: 99.99, category: 'Jackets', stock: 50 },
      { id: 2, name: 'Slim Jeans', price: 79.99, category: 'Jeans', stock: 100 }
    ]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    res.json({ id: 1, name: 'Classic Denim Jacket', price: 99.99, category: 'Jackets', stock: 50 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/products
// @desc    Create a product
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    res.json({ msg: 'Product created' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;