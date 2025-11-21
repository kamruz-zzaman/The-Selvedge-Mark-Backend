const express = require("express");
const {
  getDashboardStats,
  getRecentOrders,
} = require("../controllers/dashboard.controller");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/recent-orders", getRecentOrders);

module.exports = router;
