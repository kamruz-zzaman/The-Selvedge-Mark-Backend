const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET api/promotions
// @desc    Get all promotions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json([
      { id: 1, code: 'SUMMER20', discount: 20, type: 'percentage', active: true },
      { id: 2, code: 'FREESHIP', discount: 10, type: 'fixed', active: true }
    ]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;