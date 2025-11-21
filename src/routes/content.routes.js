const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

// @route   GET api/content
// @desc    Get all content
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    res.json([
      {
        id: 1,
        title: "Homepage Banner",
        content: "Summer Sale",
        type: "banner",
      },
      { id: 2, title: "About Us", content: "Our story", type: "page" },
    ]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   POST api/content
// @desc    Create content
// @access  Private/Admin
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    res.json({ msg: "Content created" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
