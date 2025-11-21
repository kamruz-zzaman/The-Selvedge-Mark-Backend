const Promotion = require("../models/Promotion");

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Private/Admin
exports.getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find().sort("-createdAt");

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Get single promotion
// @route   GET /api/promotions/:id
// @access  Private/Admin
exports.getPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: "Promotion not found",
      });
    }

    res.status(200).json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Create promotion
// @route   POST /api/promotions
// @access  Private/Admin
exports.createPromotion = async (req, res) => {
  try {
    const promotion = await Promotion.create(req.body);

    res.status(201).json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Promotion code already exists",
      });
    }
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Update promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
exports.updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: "Promotion not found",
      });
    }

    res.status(200).json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
exports.deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: "Promotion not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// @desc    Validate promotion code
// @route   POST /api/promotions/validate
// @access  Public
exports.validatePromotion = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    const promotion = await Promotion.findOne({
      code: code.toUpperCase(),
    });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: "Invalid promotion code",
      });
    }

    if (!promotion.isValid) {
      return res.status(400).json({
        success: false,
        error: "Promotion code is not valid or has expired",
      });
    }

    if (!promotion.canApplyToOrder(orderTotal)) {
      return res.status(400).json({
        success: false,
        error: `Minimum order value of $${promotion.minOrderValue} required`,
      });
    }

    const discount = promotion.calculateDiscount(orderTotal);

    res.status(200).json({
      success: true,
      data: {
        code: promotion.code,
        type: promotion.type,
        discount,
        finalTotal: orderTotal - discount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
