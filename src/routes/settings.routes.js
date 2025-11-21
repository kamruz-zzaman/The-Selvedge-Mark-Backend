const express = require("express");
const router = express.Router();
const {
  getSettings,
  updateSetting,
  bulkUpdateSettings,
} = require("../controllers/settings.controller");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);
router.use(authorize("admin"));

router.get("/", getSettings);
router.post("/bulk", bulkUpdateSettings);
router.put("/:key", updateSetting);

module.exports = router;
