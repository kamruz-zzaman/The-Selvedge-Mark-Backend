const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// @route   GET api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    res.json([
      { id: 1, message: 'New order received', read: false, date: new Date() },
      { id: 2, message: 'Low inventory alert', read: true, date: new Date() }
    ]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;