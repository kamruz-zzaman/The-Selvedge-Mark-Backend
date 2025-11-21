const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { recordCashOnDelivery } = require("../controllers/payment.controller");

// @route   POST /api/payments
// @desc    Record cash on delivery payment
// @access  Private
router.post("/", protect, recordCashOnDelivery);

module.exports = router;
