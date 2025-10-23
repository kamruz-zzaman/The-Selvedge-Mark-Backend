const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET api/inventory
// @desc    Get all inventory items
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json([
      { id: 1, productId: 1, quantity: 100, location: 'Warehouse A' },
      { id: 2, productId: 2, quantity: 50, location: 'Warehouse B' }
    ]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/inventory
// @desc    Create inventory item
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    res.json({ msg: 'Inventory item created' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/inventory/:id
// @desc    Update inventory item
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    res.json({ msg: 'Inventory item updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/inventory/:id
// @desc    Delete inventory item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    res.json({ msg: 'Inventory item deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;