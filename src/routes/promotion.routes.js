const express = require("express");
const router = express.Router();
const {
  getPromotions,
  getPromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  validatePromotion,
} = require("../controllers/promotion.controller");

const { protect, authorize } = require("../middleware/auth");

// Public route for validation
router.post("/validate", validatePromotion);

// Protected admin routes
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getPromotions).post(createPromotion);

router
  .route("/:id")
  .get(getPromotion)
  .put(updatePromotion)
  .delete(deletePromotion);

module.exports = router;
