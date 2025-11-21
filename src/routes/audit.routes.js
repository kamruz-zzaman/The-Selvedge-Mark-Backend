const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

// @route   GET api/audit
// @desc    Get audit logs
// @access  Private/Admin
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    res.json([
      {
        id: 1,
        user: "admin",
        action: "product_create",
        details: "Created new product",
        timestamp: new Date(),
      },
      {
        id: 2,
        user: "admin",
        action: "order_update",
        details: "Updated order status",
        timestamp: new Date(),
      },
    ]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
