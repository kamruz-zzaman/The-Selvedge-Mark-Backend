const express = require("express");
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
} = require("../controllers/order.controller");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .post(protect, createOrder)
  .get(protect, authorize("admin"), getOrders);

router.route("/myorders").get(protect, getMyOrders);

router.route("/:id").get(protect, getOrderById);

router.route("/:id/pay").put(protect, updateOrderToPaid);

router
  .route("/:id/deliver")
  .put(protect, authorize("admin"), updateOrderToDelivered);

module.exports = router;
