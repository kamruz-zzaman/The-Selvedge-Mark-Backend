const express = require("express");
const router = express.Router();
const {
  getSalesReport,
  getTopProducts,
  getTopCustomers,
} = require("../controllers/report.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("admin"));

router.get("/sales", getSalesReport);
router.get("/products/top", getTopProducts);
router.get("/customers/top", getTopCustomers);

module.exports = router;
