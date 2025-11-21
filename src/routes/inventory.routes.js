const express = require("express");
const {
  getInventory,
  getInventoryStats,
  createInventory,
  updateInventory,
} = require("../controllers/inventory.controller");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getInventoryStats);

router.route("/").get(getInventory).post(createInventory);

router.route("/:id").put(updateInventory);

module.exports = router;
