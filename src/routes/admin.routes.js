const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const { migrateCategories } = require("../controllers/admin.controller");

// Admin-only routes
router.post(
  "/migrate-categories",
  protect,
  authorize("admin"),
  migrateCategories
);

module.exports = router;
