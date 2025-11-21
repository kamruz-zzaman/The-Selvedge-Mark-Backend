const express = require("express");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

router
  .route("/")
  .get(getProducts)
  .post(protect, authorize("admin"), createProduct);

// Upload product images
router.post(
  "/upload",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  (req, res) => {
    try {
      const imageUrls = req.files.map((file) => file.path);
      res.status(200).json({
        success: true,
        data: imageUrls,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: "Image upload failed",
      });
    }
  }
);

router
  .route("/:id")
  .get(getProduct)
  .put(protect, authorize("admin"), updateProduct)
  .delete(protect, authorize("admin"), deleteProduct);

module.exports = router;
