const express = require("express");
const {
  getCustomers,
  getCustomer,
  getCustomerStats,
  updateCustomer,
} = require("../controllers/customer.controller");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getCustomerStats);

router.route("/").get(getCustomers);

router.route("/:id").get(getCustomer).put(updateCustomer);

module.exports = router;
